-- Estende a tabela alunos com credencial própria (login por matrícula+senha),
-- per specs/002-importar-alunos-acesso/data-model.md. SQLite não tem
-- "ADD COLUMN IF NOT EXISTS" — abrirDb() cuida de rodar isso só uma vez por banco
-- (ver backend/src/db.js).

ALTER TABLE alunos ADD COLUMN senha_hash TEXT;
ALTER TABLE alunos ADD COLUMN senha_salt TEXT;
ALTER TABLE alunos ADD COLUMN senha_padrao_ativa INTEGER NOT NULL DEFAULT 0;
ALTER TABLE alunos ADD COLUMN token_ativo TEXT;
