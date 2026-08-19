#!/usr/bin/env node
// Gera/redefine a credencial do professor administrador direto no arquivo SQLite
// local (FR-005, FR-012, FR-017) — para uso em desenvolvimento local. Em produção
// no Render (disco efêmero), prefira as env vars ADMIN_USUARIO/ADMIN_SENHA lidas
// por server.js a cada boot (ver comentário lá).
//
// Uso: node scripts/seed-professor.js <usuario> <senha>

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { abrirDb, upsertProfessorCredencial } from '../src/db.js';
import { gerarHashSenha } from '../src/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'bitlab.db');

const [usuario, senha] = process.argv.slice(2);
if (!usuario || !senha) {
  console.error('Uso: node scripts/seed-professor.js <usuario> <senha>');
  process.exit(1);
}

const db = abrirDb(DB_PATH);
const { hash, salt } = gerarHashSenha(senha);
upsertProfessorCredencial(db, usuario, hash, salt);
db.close();

console.log(`Credencial de "${usuario}" provisionada em ${DB_PATH}.`);
