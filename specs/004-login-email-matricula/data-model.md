# Data Model: Login por E-mail ou Matrícula

Nenhuma tabela ou coluna nova. Reaproveita a entidade **Aluno** já definida em
`specs/001-duas-trilhas-admin-professor/data-model.md` (estendida em
`specs/002-importar-alunos-acesso/data-model.md` com `senha_hash`, `senha_salt`,
`senha_padrao_ativa`, `token_ativo`).

## Campos usados por esta feature (já existentes)

| Campo | Já existia desde | Uso nesta feature |
|---|---|---|
| `matricula` | feature 001 | continua sendo um dos dois caminhos de busca no login |
| `email` | feature 001 | passa a ser o segundo caminho de busca no login (antes só usado no cadastro/validação de domínio) |
| `senha_hash`, `senha_salt` | feature 002 | inalterados — verificação de senha continua idêntica depois de encontrar o aluno, seja por matrícula ou por e-mail |

## Nova função de acesso a dado (não é entidade nova)

`getAlunoByEmail(db, email)` em `backend/src/db.js` — busca case-insensitive
(`WHERE LOWER(email) = LOWER(?)`), retorna a mesma forma de linha que
`getAlunoByMatricula(db, matricula)` já retorna.

## O que NÃO muda

- Nenhuma coluna nova, nenhum índice novo (as colunas `matricula` e `email` já são
  `UNIQUE` desde a feature 001, então a busca por qualquer uma das duas já resolve
  para no máximo um aluno).
- Nenhuma outra tabela (`professores`, `habilitacoes`) é tocada.
