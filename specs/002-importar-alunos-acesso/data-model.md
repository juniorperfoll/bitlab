# Data Model: Importação de Alunos com Senha Padrão de Primeiro Acesso

Estende o schema da feature 001 (`specs/001-duas-trilhas-admin-professor/
data-model.md`). Não cria tabela nova — só adiciona colunas à tabela `alunos` já
existente, via `backend/migrations/0002_alunos_senha.sql`.

## Entidade estendida: Aluno (tabela `alunos`)

| Campo | Tipo | Regras |
|---|---|---|
| *(campos já existentes)* | | `id`, `matricula`, `nome`, `idade`, `turma`, `email`, `criado_em`, `atualizado_em` — inalterados, ver data-model.md da feature 001 |
| `senha_hash` | TEXT NULLABLE | PBKDF2 (mesmo padrão do professor); `NULL` só é possível para linhas antigas de antes desta feature, tratadas como "sem senha ainda" |
| `senha_salt` | TEXT NULLABLE | salt aleatório por credencial |
| `senha_padrao_ativa` | BOOLEAN (0/1) | `1` = ainda usando a senha padrão gerada, login exige troca antes de liberar a trilha; `0` = já definiu senha própria |
| `token_ativo` | TEXT NULLABLE | token de sessão do aluno; `NULL` = deslogado. Um novo login substitui o token anterior (research.md #2) |

**Migração** (`0002_alunos_senha.sql`, idempotente):
```sql
ALTER TABLE alunos ADD COLUMN senha_hash TEXT;
ALTER TABLE alunos ADD COLUMN senha_salt TEXT;
ALTER TABLE alunos ADD COLUMN senha_padrao_ativa INTEGER NOT NULL DEFAULT 0;
ALTER TABLE alunos ADD COLUMN token_ativo TEXT;
```
(SQLite não tem `ADD COLUMN IF NOT EXISTS`; a migração assume que só roda uma vez por
banco — mesmo padrão de migração numerada sequencial já usado na feature 001.)

**Validações** (além das já existentes de matrícula/turma/e-mail):
- `senha_hash`/`senha_salt` MUST ser gerados no momento da criação do cadastro
  (importação ou autocadastro) — nunca ficam `NULL` para um aluno criado a partir
  desta feature em diante (FR-002, FR-006).
- `senha_padrao_ativa` começa em `1` na criação e só muda pra `0` quando o próprio
  aluno define uma senha nova (FR-009/FR-010), ou volta pra `1` quando o professor
  redefine a senha de volta para o padrão (FR-011).
- Atualização de cadastro por importação (matrícula já existente) MUST deixar
  `senha_hash`, `senha_salt` e `senha_padrao_ativa` intocados (FR-003).

## Entidade transitória: Importação (não persistida)

Representa o resultado de processar a lista colada pelo professor — vive só na
resposta HTTP, não é gravada como registro no banco.

- **Linha de entrada**: `matricula, nome, email, turma` (uma por linha da lista
  colada).
- **Resultado por linha**: um de `criado`, `atualizado` ou `rejeitado` (com motivo em
  português, ex.: "e-mail fora do domínio institucional", "turma inválida", "linha
  mal formatada").
- **Resumo agregado**: contagem de `criados`, `atualizados`, `rejeitados` — usado
  para a mensagem final ao professor (FR-005).

## Diagrama de relacionamento (atualizado)

```text
professores (1 linha)
  └── autentica → concede/revoga → habilitacoes

alunos ──< habilitacoes (escopo='individual', via aluno_id)
       └── agora também: autentica (login próprio, senha padrão ou trocada)

turma (enum) ──< habilitacoes (escopo='turma', via campo turma)

Importação (não persistida): lista de linhas → cria/atualiza alunos (upsert
explícito, ver research.md #4), sem tocar em habilitacoes diretamente.
```
