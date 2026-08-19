-- Adiciona a turma TLPP às turmas válidas. SQLite não suporta alterar um
-- CHECK constraint via ALTER TABLE — reconstrói as tabelas afetadas
-- preservando todos os dados e índices existentes.

ALTER TABLE alunos RENAME TO alunos_old;

CREATE TABLE alunos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  matricula TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  idade INTEGER NOT NULL,
  turma TEXT NOT NULL CHECK (turma IN ('T33F2', 'T34F2', 'TLPP')),
  email TEXT NOT NULL UNIQUE,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now')),
  senha_hash TEXT,
  senha_salt TEXT,
  senha_padrao_ativa INTEGER NOT NULL DEFAULT 0,
  token_ativo TEXT
);

INSERT INTO alunos SELECT * FROM alunos_old;
DROP TABLE alunos_old;

ALTER TABLE habilitacoes RENAME TO habilitacoes_old;

CREATE TABLE habilitacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  escopo TEXT NOT NULL CHECK (escopo IN ('turma', 'individual')),
  turma TEXT CHECK (turma IN ('T33F2', 'T34F2', 'TLPP')),
  aluno_id INTEGER REFERENCES alunos(id),
  trilha TEXT NOT NULL CHECK (trilha IN ('arquitetura', 'linguagens')),
  concedida INTEGER NOT NULL CHECK (concedida IN (0, 1)),
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (
    (escopo = 'turma' AND turma IS NOT NULL AND aluno_id IS NULL) OR
    (escopo = 'individual' AND aluno_id IS NOT NULL AND turma IS NULL)
  )
);

INSERT INTO habilitacoes SELECT * FROM habilitacoes_old;
DROP TABLE habilitacoes_old;

CREATE UNIQUE INDEX idx_habilitacoes_turma
  ON habilitacoes (turma, trilha)
  WHERE escopo = 'turma';

CREATE UNIQUE INDEX idx_habilitacoes_individual
  ON habilitacoes (aluno_id, trilha)
  WHERE escopo = 'individual';
