-- Schema inicial: escopo estritamente autorizado pelo Princípio II da constituição
-- (autenticação do professor + habilitação de alunos). Ver data-model.md.

CREATE TABLE IF NOT EXISTS professores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  senha_salt TEXT NOT NULL,
  token_ativo TEXT,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS alunos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  matricula TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  idade INTEGER NOT NULL,
  turma TEXT NOT NULL CHECK (turma IN ('T33F2', 'T34F2')),
  email TEXT NOT NULL UNIQUE,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS habilitacoes (
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
);

-- Uma linha ativa por (turma, trilha) e por (aluno_id, trilha) — nova habilitação
-- para o mesmo par faz upsert em vez de acumular histórico (ver data-model.md).
CREATE UNIQUE INDEX IF NOT EXISTS idx_habilitacoes_turma
  ON habilitacoes (turma, trilha)
  WHERE escopo = 'turma';

CREATE UNIQUE INDEX IF NOT EXISTS idx_habilitacoes_individual
  ON habilitacoes (aluno_id, trilha)
  WHERE escopo = 'individual';
