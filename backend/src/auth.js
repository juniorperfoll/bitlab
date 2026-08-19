// Hash de senha (PBKDF2 via node:crypto, nativo — zero dependência externa) e
// verificação de sessão administrativa por token.

import crypto from 'node:crypto';
import { getProfessorByToken, getProfessorPorUsuario, setProfessorToken, clearProfessorToken } from './db.js';

const PBKDF2_ITERATIONS = 100000;
const HASH_BYTES = 32;
const DIGEST = 'sha256';

// Usado pelo script de provisionamento/redefinição manual e pelo bootstrap via
// env var em server.js — nunca exposto por uma rota HTTP pública.
export function gerarHashSenha(senha) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(senha, salt, PBKDF2_ITERATIONS, HASH_BYTES, DIGEST).toString('hex');
  return { hash, salt };
}

export function verificarSenha(senha, hashEsperado, saltHex) {
  const hashCalculado = crypto.pbkdf2Sync(senha, saltHex, PBKDF2_ITERATIONS, HASH_BYTES, DIGEST).toString('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(hashCalculado, 'hex'), Buffer.from(hashEsperado, 'hex'));
  } catch {
    return false;
  }
}

export function gerarToken() {
  return crypto.randomBytes(32).toString('hex');
}

const MENSAGEM_SESSAO_INVALIDA = 'Sessão administrativa inválida. Faça login novamente.';

// Middleware Express: valida o Bearer token contra token_ativo no banco.
export function autenticarMiddleware(req, res, next) {
  const cabecalho = req.headers.authorization || '';
  const [tipo, token] = cabecalho.split(' ');
  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ mensagem: MENSAGEM_SESSAO_INVALIDA });
  }

  const professor = getProfessorByToken(req.app.locals.db, token);
  if (!professor) {
    return res.status(401).json({ mensagem: MENSAGEM_SESSAO_INVALIDA });
  }

  req.professor = professor;
  next();
}

// POST /api/login — FR-004, FR-019 (sem limite de tentativas).
export function loginHandler(req, res) {
  const { usuario, senha } = req.body || {};
  if (!usuario || !senha) {
    return res.status(400).json({ mensagem: 'Informe usuário e senha.' });
  }

  const professor = getProfessorPorUsuario(req.app.locals.db, usuario);
  if (!professor || !verificarSenha(senha, professor.senha_hash, professor.senha_salt)) {
    return res.status(401).json({ mensagem: 'Usuário ou senha incorretos.' });
  }

  const token = gerarToken();
  setProfessorToken(req.app.locals.db, professor.id, token);
  res.json({ token });
}

// POST /api/logout — FR-018 (sessão só encerra por logout explícito).
export function logoutHandler(req, res) {
  clearProfessorToken(req.app.locals.db, req.professor.id);
  res.json({ ok: true });
}
