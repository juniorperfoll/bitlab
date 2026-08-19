import { gerarHashSenha } from '../src/auth.js';

const STATEMENTS = [
  'DROP TABLE IF EXISTS habilitacoes',
  'DROP TABLE IF EXISTS alunos',
  'DROP TABLE IF EXISTS professores',
  `CREATE TABLE professores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario TEXT NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    senha_salt TEXT NOT NULL,
    token_ativo TEXT,
    criado_em TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE alunos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    matricula TEXT NOT NULL UNIQUE,
    nome TEXT NOT NULL,
    idade INTEGER NOT NULL,
    turma TEXT NOT NULL CHECK (turma IN ('T33F2', 'T34F2')),
    email TEXT NOT NULL UNIQUE,
    criado_em TEXT NOT NULL DEFAULT (datetime('now')),
    atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE habilitacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    escopo TEXT NOT NULL CHECK (escopo IN ('turma', 'individual')),
    turma TEXT CHECK (turma IN ('T33F2', 'T34F2')),
    aluno_id INTEGER REFERENCES alunos(id),
    trilha TEXT NOT NULL CHECK (trilha IN ('arquitetura', 'linguagens')),
    concedida INTEGER NOT NULL CHECK (concedida IN (0, 1)),
    atualizado_em TEXT NOT NULL DEFAULT (datetime('now')),
    CHECK (
      (escopo = 'turma' AND turma IS NOT NULL AND aluno_id IS NULL) OR
      (escopo = 'individual' AND aluno_id IS NOT NULL AND turma IS NULL)
    )
  )`,
  `CREATE UNIQUE INDEX idx_habilitacoes_turma ON habilitacoes (turma, trilha) WHERE escopo = 'turma'`,
  `CREATE UNIQUE INDEX idx_habilitacoes_individual ON habilitacoes (aluno_id, trilha) WHERE escopo = 'individual'`,
];

export async function resetDb(env) {
  for (const sql of STATEMENTS) {
    // `.exec()` do D1 quebra por linha; `.prepare().run()` aceita SQL multilinha.
    await env.DB.prepare(sql).run();
  }
}

export async function seedProfessor(env, usuario, senha) {
  const { hash, salt } = await gerarHashSenha(senha);
  await env.DB.prepare(
    'INSERT INTO professores (usuario, senha_hash, senha_salt) VALUES (?, ?, ?)'
  )
    .bind(usuario, hash, salt)
    .run();
}

export function requestJSON(method, body, headers = {}) {
  return new Request('http://backend.local/api', {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
