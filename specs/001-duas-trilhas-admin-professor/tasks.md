---

description: "Task list template for feature implementation"
---

# Tasks: Duas Trilhas e Área Administrativa do Professor

**Input**: Design documents from `/specs/001-duas-trilhas-admin-professor/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: não solicitados explicitamente na especificação — tarefas de teste automatizado do backend aparecem só na fase de Polish (vitest, conforme plan.md), não como TDD "write-first" por user story.

**Organization**: tarefas agrupadas por user story (spec.md) para permitir implementação e teste independentes de cada uma.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: a qual user story a tarefa pertence (US1, US2, US3)
- Caminhos de arquivo exatos em cada descrição

## Path Conventions

Conforme `plan.md` → Project Structure: `index.html` e `admin.html` na raiz do
repositório (front-end estático); `backend/src/`, `backend/migrations/`,
`backend/tests/` para o backend mínimo (Cloudflare Workers + D1).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: inicializar a estrutura do novo backend mínimo.

- [X] T001 Criar estrutura de diretórios `backend/src/`, `backend/migrations/`, `backend/tests/` per plan.md
- [X] T002 [P] Configurar `backend/wrangler.toml` com entrypoint do Worker e binding do banco D1
- [X] T003 [P] Escrever schema inicial (tabelas `professores`, `alunos`, `habilitacoes`) per data-model.md em `backend/migrations/0001_init.sql`
- [X] T004 [P] Configurar `vitest` + `@cloudflare/vitest-pool-workers` (dependência de desenvolvimento apenas) em `backend/vitest.config.js` e `backend/package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: infraestrutura de backend compartilhada por login (US2) e cadastro/checagem de habilitação (US3) — nenhuma user story de backend pode ser implementada sem isso.

**⚠️ CRITICAL**: US1 (front-end puro) não depende desta fase e pode ser feita em paralelo; US2 e US3 dependem dela.

- [X] T005 Implementar helpers de acesso ao D1 (`getProfessor`, `getAlunoByMatricula`, `upsertAluno`, `getHabilitacoesPorAluno`, `upsertHabilitacaoTurma`, `upsertHabilitacaoIndividual`) em `backend/src/db.js`
- [X] T006 Implementar esqueleto do roteador do Worker (dispatch por método/rota, resposta JSON padrão, cabeçalhos CORS, handler 404, mensagens de erro em português) em `backend/src/index.js`
- [X] T007 [P] Implementar hash/verificação de senha via PBKDF2 (Web Crypto API, salt aleatório por credencial) em `backend/src/auth.js`
- [X] T008 [P] Implementar middleware de autenticação por Bearer token (valida `token_ativo` no D1, responde 401 com mensagem em português) em `backend/src/auth.js`
- [X] T009 [P] Escrever script de provisionamento da credencial inicial do professor (gera `senha_hash`/`senha_salt`) em `backend/scripts/seed-professor.js`

**Checkpoint**: fundação de backend pronta — US2 e US3 podem começar.

---

## Phase 3: User Story 1 - Aluno escolhe entre as duas trilhas (Priority: P1) 🎯 MVP

**Goal**: aluno vê as duas trilhas na tela inicial e joga qualquer uma delas com conteúdo, estações e certificado isolados por trilha.

**Independent Test**: abrir `index.html`, selecionar cada uma das duas trilhas e confirmar que cada uma carrega seu próprio conjunto de estações, perguntas e certificado — sem depender de nenhuma parte da área administrativa.

### Implementation for User Story 1

- [X] T010 [US1] Refatorar `STAGES`/`RANKS` globais para um objeto `TRAILS` indexado por trilha (`'arquitetura'`, `'linguagens'`) em `index.html` (per research.md #6)
- [X] T011 [US1] Adicionar campo `trilhaId` ao estado de jogo `S` e atualizar `novoJogo()` para receber a trilha escolhida em `index.html`
- [X] T012 [US1] Adicionar UI de seleção de trilha na `telaInicio` (duas opções nomeadas com descrição) em `index.html`
- [X] T013 [US1] Parametrizar `iniciarFase()` e a amostragem de perguntas do boss para usar somente `TRAILS[S.trilhaId]` em `index.html`
- [X] T014 [US1] Parametrizar `gerarCodigo()`, `textoRelatorio()` e `telaCertificacao()` pela trilha corrente (`S.trilhaId`) em `index.html`
- [X] T015 [P] [US1] Autorar os pools de geradores de pergunta das 8 estações da trilha "Linguagens de Programação e Paradigmas" em `index.html`, seguindo o padrão `{tag, tipo, enun, dica, exp, ...}` já usado na trilha existente
- [X] T016 [US1] Validar manualmente todo o conteúdo novo (cálculos e afirmações corretos) conforme Princípio III, antes do uso em sala

**Checkpoint**: US1 completa e testável de forma independente.

---

## Phase 4: User Story 2 - Professor habilita alunos pela área administrativa (Priority: P1)

**Goal**: professor autentica na área administrativa e habilita alunos (em lote por turma ou individualmente por matrícula) a cada trilha.

**Independent Test**: acessar a área administrativa, autenticar com credenciais válidas, habilitar uma turma inteira para uma trilha e depois ajustar individualmente um aluno — usando um cadastro de aluno inserido diretamente para teste, sem depender do fluxo de cadastro do aluno (US3) estar pronto.

### Implementation for User Story 2

- [X] T017 [US2] Implementar `POST /api/login` em `backend/src/auth.js` (verifica hash, gera token, grava `token_ativo`)
- [X] T018 [US2] Implementar `POST /api/logout` em `backend/src/auth.js` (limpa `token_ativo`)
- [X] T019 [US2] Implementar `GET /api/alunos` (auth) em `backend/src/alunos.js` (lista alunos com habilitações por trilha)
- [X] T020 [US2] Implementar `POST`/`DELETE /api/turmas/:turma/habilitacoes` (auth) em `backend/src/habilitacoes.js` (valida turma `T33F2`/`T34F2`, upsert/remove habilitação em lote)
- [X] T021 [US2] Implementar `POST`/`DELETE /api/alunos/:matricula/habilitacoes` (auth) em `backend/src/habilitacoes.js` (upsert/remove exceção individual, 404 se matrícula não cadastrada)
- [X] T022 [US2] Registrar as rotas de auth/alunos/habilitações no roteador em `backend/src/index.js` (depende de T017-T021)
- [X] T023 [US2] Criar `admin.html`: tela de login (formulário usuário/senha, chama `POST /api/login`, guarda token em `sessionStorage`)
- [X] T024 [US2] Criar `admin.html`: tela de gestão (lista alunos por turma, ação de habilitar turma inteira por trilha, ação de exceção individual por aluno)
- [X] T025 [P] [US2] Reaproveitar os tokens de design (variáveis CSS `--board`, `--copper`, etc.) do `index.html` em `admin.html` para consistência visual (per research.md #5)
- [X] T026 [US2] Garantir que toda a UI e todas as mensagens de erro de `admin.html` estejam em português brasileiro (Princípio I)

**Checkpoint**: US1 e US2 funcionam de forma independente.

---

## Phase 5: User Story 3 - Aluno sem habilitação é bloqueado com explicação (Priority: P2)

**Goal**: aluno sem habilitação para uma trilha recebe mensagem clara em vez de acessar o conteúdo; cadastro exige e-mail institucional.

**Independent Test**: simular um aluno com matrícula não habilitada tentando selecionar uma trilha e confirmar que vê a mensagem de bloqueio em vez de iniciar a primeira estação.

### Implementation for User Story 3

- [X] T027 [US3] Implementar `POST /api/alunos/cadastro` em `backend/src/alunos.js` (cria/atualiza aluno por matrícula, valida domínio `@unidavi.edu.br`, valida turma)
- [X] T028 [US3] Implementar `GET /api/alunos/:matricula/habilitacoes/:trilha` em `backend/src/habilitacoes.js`, aplicando a regra de resolução de acesso (exceção individual tem prioridade sobre habilitação de turma) per data-model.md
- [X] T029 [US3] Registrar as rotas de cadastro e verificação de habilitação no roteador em `backend/src/index.js` (depende de T027, T028)
- [X] T030 [US3] Adicionar campo de e-mail institucional ao formulário da `telaInicio` com validação client-side de sufixo `@unidavi.edu.br` em `index.html`
- [X] T031 [US3] Chamar `POST /api/alunos/cadastro` ao avançar da `telaInicio`, exibindo mensagem de erro em português se rejeitado, em `index.html`
- [X] T032 [US3] Chamar `GET /api/alunos/:matricula/habilitacoes/:trilha` ao escolher uma trilha; bloquear com mensagem em português (sem iniciar a estação) se não habilitado, em `index.html`
- [X] T033 [US3] Tratar erro de turma inválida (fora de `T33F2`/`T34F2`) com mensagem em português no formulário, em `index.html`

**Checkpoint**: todas as user stories funcionam de forma independente.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: qualidade e validação final que atravessa todas as user stories.

- [X] T034 [P] Escrever testes de `auth.js`, `alunos.js` e `habilitacoes.js` com vitest em `backend/tests/auth.test.js`, `backend/tests/alunos.test.js`, `backend/tests/habilitacoes.test.js` (13/13 passando)
- [X] T035 Executar os 11 cenários de `specs/001-duas-trilhas-admin-professor/quickstart.md` ponta a ponta e corrigir qualquer divergência encontrada — cenários 4-8, 10-11 validados via `wrangler dev` local + curl (todos passaram); cenários 1-3, 9 (fluxo no navegador via `index.html`/`admin.html`) ainda pedem confirmação manual em navegador antes do uso em sala, conforme "Fluxo de Validação em Sala de Aula" da constituição
- [X] T036 [P] Revisão final de conformidade constitucional (Princípios I-V + Restrições Técnicas e Privacidade) sobre `index.html`, `admin.html` e `backend/` — sem violação encontrada (varredura de strings + revisão manual do conteúdo novo)
- [X] T037 [P] Atualizar `README.md` do projeto mencionando as duas trilhas e a área administrativa (em português, per Princípio I)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências — pode começar imediatamente
- **Foundational (Phase 2)**: depende do Setup — bloqueia US2 e US3 (não bloqueia US1)
- **User Story 1 (Phase 3)**: depende só do Setup; não depende do Foundational nem de US2/US3 — pode rodar em paralelo com a Fase 2
- **User Story 2 (Phase 4)**: depende do Foundational (Phase 2)
- **User Story 3 (Phase 5)**: depende do Foundational (Phase 2); não depende de US2 (usa cadastro/dados de teste próprios)
- **Polish (Phase 6)**: depende de todas as user stories desejadas estarem completas

### User Story Dependencies

- **US1 (P1)**: independente — nenhuma dependência de US2/US3
- **US2 (P1)**: independente de US1; depende só do Foundational
- **US3 (P2)**: independente de US1/US2; depende só do Foundational

### Parallel Opportunities

- T002, T003, T004 (Setup) podem rodar em paralelo
- T007, T008, T009 (Foundational) podem rodar em paralelo entre si, após T005/T006
- Após o Foundational, US2 (Phase 4) e US3 (Phase 5) podem ser feitas em paralelo por pessoas diferentes; US1 (Phase 3) pode rodar em paralelo com ambas desde o início (só depende do Setup)
- T015 (autoria de conteúdo da nova trilha) pode rodar em paralelo com T010-T014 (refatoração do motor)
- T025 pode rodar em paralelo com T017-T022 (front-end do admin vs. backend do admin)

---

## Parallel Example: User Story 1

```bash
# Motor de trilhas (sequencial, mesmo arquivo) e conteúdo da nova trilha (paralelo):
Task: "Refatorar STAGES/RANKS para TRAILS em index.html"          # T010
Task: "Autorar pools de pergunta da trilha de Linguagens em index.html"  # T015 [P]
```

---

## Implementation Strategy

### MVP First (User Story 1 apenas)

1. Completar Fase 1: Setup
2. Completar Fase 3: User Story 1 (não depende do Foundational)
3. **PARE e VALIDE**: testar US1 isoladamente (duas trilhas navegáveis, conteúdo isolado)
4. Nesse ponto já há um MVP demonstrável em sala, mesmo sem área administrativa

### Incremental Delivery

1. Setup → US1 pronta → demo (MVP: duas trilhas, sem controle de acesso ainda)
2. Foundational → US2 pronta → demo (professor já habilita turmas/alunos)
3. Foundational → US3 pronta → demo (alunos não habilitados são bloqueados)
4. Polish → validação completa via quickstart.md antes do uso real com T33F2/T34F2

### Parallel Team Strategy

Com mais de uma pessoa: uma pessoa toca US1 (puro front-end) desde o início; outra
completa o Foundational e então segue para US2 e US3 (ambas backend + front-end,
independentes entre si).

---

## Nota de migração (2026-08-18)

As tarefas acima documentam a implementação original em **Cloudflare Workers + D1**.
Depois de concluídas, o usuário decidiu rodar o projeto como **monolito Node.js +
Express + SQLite (`better-sqlite3`)**, hospedado como um único Render Web Service —
ver research.md decisões #1, #2 e #8 para o racional completo. Essa migração:

- Manteve 100% do contrato de negócio (mesmas rotas, payloads, mensagens, regras de
  habilitação) — nenhuma tarefa de US1/US2/US3 precisou ser refeita do zero.
- Substituiu `backend/wrangler.toml` + roteador manual por `backend/server.js`
  (Express) e `backend/src/app.js` (fábrica de app, usada também nos testes).
- Moveu `index.html`/`admin.html` da raiz do repositório para `backend/public/`.
- Trocou os testes de `@cloudflare/vitest-pool-workers` para `vitest` + `supertest`
  contra a instância Express, com SQLite `:memory:` por teste.
- Adicionou autoprovisionamento da credencial do professor via
  `ADMIN_USUARIO`/`ADMIN_SENHA` no boot do servidor, para compensar a ausência de
  disco persistente no tier gratuito do Render (ver research.md #8).

Esta seção não reabre as tarefas T001-T037 acima (permanecem `[X]` como registro
histórico do que foi construído); a lista de arquivos atual é a do
`Project Structure` em `plan.md`, já atualizado para a nova arquitetura.
