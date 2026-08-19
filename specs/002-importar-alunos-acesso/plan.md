# Implementation Plan: Importação de Alunos com Senha Padrão de Primeiro Acesso

**Branch**: `002-importar-alunos-acesso` | **Date**: 2026-08-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-importar-alunos-acesso/spec.md`

## Summary

Adicionar login por matrícula+senha para alunos, com importação em lote pelo
professor (área administrativa) e geração automática de senha padrão de primeiro
acesso (parte do e-mail institucional antes de `@unidavi.edu.br`), trocada
obrigatoriamente no primeiro login. Estende o backend mínimo e o schema já existentes
(feature 001) — reaproveita as funções de hash/token já escritas para o professor
(`backend/src/auth.js`), sem introduzir dependência nova.

## Technical Context

**Language/Version**: JavaScript vanilla no front-end (`backend/public/index.html`,
`backend/public/admin.html`); Node.js (Express) no backend — mesma stack da feature
001, sem mudança.

**Primary Dependencies**: Nenhuma nova. Reaproveita `express`, `better-sqlite3` e as
funções de hash PBKDF2 (`node:crypto`) já implementadas em `backend/src/auth.js` para
a credencial do professor, agora também para alunos.

**Storage**: mesmo SQLite local (`better-sqlite3`) da feature 001. A tabela `alunos`
ganha colunas novas (`senha_hash`, `senha_salt`, `senha_padrao_ativa`,
`token_ativo`) — ver data-model.md.

**Testing**: `vitest` + `supertest` contra a instância Express, SQLite `:memory:` por
teste — mesmo padrão da feature 001.

**Target Platform**: mesmo monolito Render Web Service da feature 001.

**Project Type**: Web — extensão do monolito existente, sem novo serviço.

**Performance Goals**: importar uma turma de 30-40 alunos em uma única requisição,
resposta em poucos segundos (alinhado a SC-001). Login de aluno responde no mesmo
padrão de latência do login do professor já existente.

**Constraints**: sem dependência nova (mantém Princípio II); importação por texto
colado, sem upload de arquivo (ver spec.md Assumptions).

**Scale/Scope**: mesma escala da feature 001 (duas turmas, dezenas de alunos por
turma).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação |
|---|---|
| I. Português Brasileiro Obrigatório | PASS — telas de login/troca de senha do aluno e importação no admin, 100% pt-BR (FR-012). |
| II. Front-end Simples com Backend Mínimo e Justificado | PASS (resolvido) — ver abaixo. |
| III. Rigor Pedagógico e Fidelidade de Conteúdo | N/A — feature não mexe em conteúdo pedagógico. |
| IV. Aprendizagem sem Bloqueio | PASS — a exigência de trocar a senha no primeiro acesso é uma barreira de *acesso* (antes de entrar), não um bloqueio por *erro* dentro da trilha; não conflita com o princípio, que trata especificamente de erro de resposta a pergunta. |
| V. Personalização e Variabilidade | N/A — feature não mexe nas perguntas. |
| Restrições Técnicas e Privacidade | PASS — senha do aluno armazenada com o mesmo padrão de proteção já usado para o professor (nunca texto claro); nenhum dado novo além do já autorizado para o cadastro do aluno. |

**Pendência no Princípio II (resolvida em 2026-08-19)**: o texto anterior autorizava
backend mínimo só para "autenticar o professor administrador" + habilitação de
aluno — não cobria autenticar o próprio aluno (login com senha), que é exatamente o
que esta feature introduz (FR-006 a FR-011). Resolvido via `/speckit-constitution`:
constituição emendada para v2.1.0 (MINOR — expansão material, não redefinição
incompatível), Princípio II agora autoriza explicitamente "autenticar o professor
administrador e, quando aplicável, alunos". Nenhum bloqueio de governança pendente
para `/speckit-tasks`/`/speckit-implement`.

**Re-check pós Fase 1** (após data-model.md, contracts/api.md, quickstart.md): o
schema novo (`0002_alunos_senha.sql`) só adiciona colunas de senha/token ao aluno
já existente — nenhuma tabela nova, nenhum dado fora do escopo de
autenticação/habilitação. Os endpoints novos em `contracts/api.md` cobrem só login,
troca de senha, importação e redefinição — nada de lógica de jogo migrou pro
backend. A pendência de governança (extensão textual do Princípio II para cobrir
autenticação de aluno) continua de pé e não muda com o design da Fase 1 — segue
como pré-requisito antes da implementação.

## Project Structure

### Documentation (this feature)

```text
specs/002-importar-alunos-acesso/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── api.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
backend/
├── server.js                  # inalterado
├── public/
│   ├── index.html               # ganha: tela de login do aluno (matrícula+senha)
│   │                            # e tela de troca de senha obrigatória no 1º acesso
│   └── admin.html                # ganha: seção "Importar alunos" (colar lista) e
│                                 # botão "Redefinir senha" por aluno na tabela
├── src/
│   ├── db.js                     # novas queries: senha/token de aluno, import em lote
│   ├── auth.js                    # reaproveitado sem mudança de assinatura (hash,
│   │                              # verificação, geração de token já genéricos)
│   ├── alunos.js                   # novos handlers: login, trocar senha, importar,
│   │                                # redefinir senha (admin); cadastroHandler
│   │                                # existente passa a gerar senha padrão também
│   └── habilitacoes.js              # inalterado
├── migrations/
│   └── 0002_alunos_senha.sql      # nova migração: colunas de senha/token em alunos
└── tests/
    ├── setup.js                    # inalterado
    ├── auth.test.js                 # inalterado
    ├── alunos.test.js                # cobre login/troca de senha/importação
    └── habilitacoes.test.js          # inalterado
```

**Structure Decision**: extensão do monolito único já existente (`backend/`) — sem
novo serviço, sem novo diretório de topo. Mesmo padrão de handler/rota/teste da
feature 001, só cresce o escopo de `alunos.js` e o schema.

## Complexity Tracking

> Nenhuma violação de Complexity Tracking a justificar aqui — a única pendência é a
> extensão textual do Princípio II descrita acima, tratada como pré-requisito de
> governança (via `/speckit-constitution`), não como uma exceção a documentar nesta
> tabela.
