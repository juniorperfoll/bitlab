// Hash de senha (PBKDF2 via Web Crypto, nativa do runtime — zero dependência
// externa, ver research.md #3) e verificação de sessão administrativa por token.

import { getProfessorByToken, getProfessorPorUsuario, setProfessorToken, clearProfessorToken } from './db.js';
import { jsonResponse, errorResponse } from './http.js';

const PBKDF2_ITERATIONS = 100000;
const HASH_BYTES = 32;

function bufferToHex(buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function hexToBuffer(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

async function derivarHash(senha, saltBytes) {
  const enc = new TextEncoder();
  const chaveBase = await crypto.subtle.importKey(
    'raw',
    enc.encode(senha),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    chaveBase,
    HASH_BYTES * 8
  );
  return bufferToHex(bits);
}

// Usado pelo script de provisionamento/redefinição manual (T009, quickstart.md) —
// nunca exposto por uma rota HTTP pública.
export async function gerarHashSenha(senha) {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const salt = bufferToHex(saltBytes.buffer);
  const hash = await derivarHash(senha, saltBytes);
  return { hash, salt };
}

export async function verificarSenha(senha, hashEsperado, saltHex) {
  const hashCalculado = await derivarHash(senha, hexToBuffer(saltHex));
  return compararEmTempoConstante(hashCalculado, hashEsperado);
}

function compararEmTempoConstante(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function gerarToken() {
  return crypto.randomUUID() + crypto.randomUUID();
}

// Middleware de autenticação: valida o Bearer token contra token_ativo no D1.
// Retorna o professor autenticado ou `null` (o chamador deve responder 401).
export async function autenticar(request, env) {
  const cabecalho = request.headers.get('Authorization') || '';
  const [tipo, token] = cabecalho.split(' ');
  if (tipo !== 'Bearer' || !token) return null;

  const professor = await getProfessorByToken(env.DB, token);
  return professor || null;
}

const MENSAGEM_SESSAO_INVALIDA = 'Sessão administrativa inválida. Faça login novamente.';

// Helper para rotas (auth): resolve o professor autenticado ou já retorna a
// Response de erro 401 pronta — uso: `const r = await exigirAuth(...); if (r.erro) return r.erro;`
export async function exigirAuth(request, env) {
  const professor = await autenticar(request, env);
  if (!professor) return { erro: errorResponse(MENSAGEM_SESSAO_INVALIDA, 401) };
  return { professor };
}

// POST /api/login — FR-004, FR-019 (sem limite de tentativas).
export async function loginHandler({ request, env }) {
  const body = await request.json().catch(() => null);
  if (!body || !body.usuario || !body.senha) {
    return errorResponse('Informe usuário e senha.', 400);
  }

  const professor = await getProfessorPorUsuario(env.DB, body.usuario);
  if (!professor) {
    return errorResponse('Usuário ou senha incorretos.', 401);
  }

  const valido = await verificarSenha(body.senha, professor.senha_hash, professor.senha_salt);
  if (!valido) {
    return errorResponse('Usuário ou senha incorretos.', 401);
  }

  const token = gerarToken();
  await setProfessorToken(env.DB, professor.id, token);
  return jsonResponse({ token });
}

// POST /api/logout — FR-018 (sessão só encerra por logout explícito).
export async function logoutHandler({ request, env }) {
  const { erro, professor } = await exigirAuth(request, env);
  if (erro) return erro;

  await clearProfessorToken(env.DB, professor.id);
  return jsonResponse({ ok: true });
}
