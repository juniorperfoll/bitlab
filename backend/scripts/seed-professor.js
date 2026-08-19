#!/usr/bin/env node
// Gera a credencial inicial (ou de redefinição manual) do professor administrador
// e imprime o comando `wrangler d1 execute` pronto para copiar/colar — nunca grava
// a senha em texto claro em nenhum arquivo (FR-005, FR-012, FR-017).
//
// Uso: node scripts/seed-professor.js <usuario> <senha>

import { webcrypto as crypto } from 'node:crypto';

const PBKDF2_ITERATIONS = 100000;
const HASH_BYTES = 32;

function bufferToHex(buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
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
    { name: 'PBKDF2', salt: saltBytes, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    chaveBase,
    HASH_BYTES * 8
  );
  return bufferToHex(bits);
}

async function main() {
  const [usuario, senha] = process.argv.slice(2);
  if (!usuario || !senha) {
    console.error('Uso: node scripts/seed-professor.js <usuario> <senha>');
    process.exit(1);
  }

  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const salt = bufferToHex(saltBytes.buffer);
  const hash = await derivarHash(senha, saltBytes);

  const sql = `INSERT INTO professores (usuario, senha_hash, senha_salt, criado_em) VALUES ('${usuario}', '${hash}', '${salt}', datetime('now')) ON CONFLICT (usuario) DO UPDATE SET senha_hash = excluded.senha_hash, senha_salt = excluded.senha_salt, token_ativo = NULL;`;

  console.log('\nRode este comando para provisionar/redefinir a credencial (não fica salvo em nenhum arquivo):\n');
  console.log(`wrangler d1 execute bitlab-db --command "${sql}"\n`);
}

main();
