---

description: "Task list template for feature implementation"
---

# Tasks: Login por E-mail ou Matrícula

**Input**: Design documents from `/specs/004-login-email-matricula/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: não solicitados explicitamente na especificação — tarefas de teste
aparecem na fase de User Story 2 e na Polish, mesmo padrão já usado nas features
anteriores.

**Organization**: tarefas agrupadas por user story (spec.md).

## Format: `[ID] [P?] [Story] Description`

## Path Conventions

Extensão pontual do monolito já existente — `backend/src/db.js`,
`backend/src/alunos.js`, `backend/public/index.html`, `backend/tests/alunos.test.js`.
Sem migração, sem diretório novo.

---

## Phase 1: Setup

**Purpose**: função de acesso a dado necessária antes de alterar o endpoint de
login — feature pequena o suficiente para não precisar de uma fase Foundational
separada.

- [X] T001 [P] Adicionar `getAlunoByEmail(db, email)` em `backend/src/db.js` — busca case-insensitive (`WHERE LOWER(email) = LOWER(?)`, research.md #3)

---

## Phase 2: User Story 1 - Aluno loga usando o e-mail institucional (Priority: P1) 🎯 MVP

**Goal**: aluno consegue logar informando e-mail ou matrícula no mesmo campo.

**Independent Test**: pegar um aluno já cadastrado e logar informando o e-mail dele
(em vez da matrícula) com a senha correta.

### Implementation for User Story 1

- [X] T002 [US1] Atualizar `alunoLoginHandler` em `backend/src/alunos.js`: receber `identificador` (em vez de `matricula`) no corpo, detectar formato pela presença de `@` (research.md #2), buscar via `getAlunoByEmail` ou `getAlunoByMatricula` conforme o caso, mensagem de erro "Matrícula/e-mail ou senha incorretos." — depende de T001. **Achado durante a implementação**: a resposta 200 também passou a incluir `matricula`, porque o front-end precisa da matrícula real do aluno (pra checar habilitação e montar o estado de jogo) mesmo quando o login foi feito por e-mail — ver contracts/api.md atualizado.
- [X] T003 [US1] Atualizar `backend/public/index.html`: rótulo/placeholder do campo de login do aluno para "Matrícula ou e-mail" (removido `inputmode="numeric"`, que atrapalharia digitar e-mail); renomear o campo enviado no corpo do `fetch` de login para `identificador`; parar de tirar dígitos do valor digitado (`.replace(/\D/g,'')` destruiria um e-mail); usar `resp.matricula` (não mais o valor digitado) nas chamadas seguintes que exigem matrícula

**Checkpoint**: US1 completa e testável de forma independente — login por e-mail e
por matrícula funcionam.

---

## Phase 3: User Story 2 - Erro de login continua sem revelar detalhes (Priority: P2)

**Goal**: mensagem de erro idêntica independentemente do formato tentado ou de
qual campo (identificador/senha) estava errado.

**Independent Test**: tentar logar com um e-mail inexistente e, separadamente, com
uma matrícula existente e senha errada — as duas respostas devem ser idênticas.

### Implementation for User Story 2

- [X] T004 [US2] Conferir em `backend/src/alunos.js` que `alunoLoginHandler` (T002) responde com a mesma mensagem/status para identificador inexistente (e-mail ou matrícula) e para senha incorreta — confirmado por leitura de código: único ponto de retorno 401 no handler, mesma mensagem para os dois casos
- [X] T005 [P] [US2] Escrever teste em `backend/tests/alunos.test.js`: login com e-mail inexistente e login com matrícula existente + senha errada retornam o mesmo status e a mesma mensagem

**Checkpoint**: todas as user stories funcionam de forma independente.

---

## Phase 4: Polish & Cross-Cutting Concerns

- [X] T006 [P] Escrever/estender testes em `backend/tests/alunos.test.js`: login por e-mail funciona, comparação de e-mail é case-insensitive, login por matrícula continua funcionando (regressão da feature 002) — 26/26 testes passando no arquivo todo (4 novos + 13 chamadas de login existentes migradas para o novo contrato `identificador`)
- [X] T007 Rodar `node --check` no `<script>` extraído de `backend/public/index.html`
- [X] T008 Executar os cenários de `specs/004-login-email-matricula/quickstart.md` ponta a ponta (via curl contra servidor local — ver relatório final)
- [X] T009 [P] Revisão de conformidade constitucional (Princípio I pt-BR) sobre o rótulo e as mensagens novas — "Matrícula ou e-mail", "Matrícula/e-mail ou senha incorretos.", "Informe matrícula/e-mail e senha." — todas pt-BR

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências — pode começar imediatamente
- **User Story 1 (Phase 2)**: depende do Setup (T001)
- **User Story 2 (Phase 3)**: depende de US1 (T002) já estar implementada — a
  garantia de mensagem genérica é sobre o mesmo handler que US1 altera
- **Polish (Phase 4)**: depende de US1 e US2 completas

### Parallel Opportunities

- T001 é a única tarefa de Setup — nada para paralelizar antes dela
- T005, T006 e T009 podem ser feitas em paralelo (arquivos/preocupações
  diferentes: teste de US2, teste de regressão, revisão de texto)

---

## Implementation Strategy

### MVP First (User Story 1)

1. Completar Fase 1: Setup (T001)
2. Completar Fase 2: User Story 1
3. **PARE e VALIDE**: login por e-mail e por matrícula funcionando (cenários 2-4 do
   quickstart.md)
4. US2 (mensagem genérica) é uma garantia de segurança que já deveria sair correta
   de T002 — a fase 3 é principalmente confirmação/teste, baixo risco de retrabalho

### Incremental Delivery

1. Setup → função de busca por e-mail pronta
2. US1 pronta → login por e-mail funcionando (demo)
3. US2 pronta → garantia de não vazamento de informação confirmada por teste
4. Polish → validação completa via quickstart.md
