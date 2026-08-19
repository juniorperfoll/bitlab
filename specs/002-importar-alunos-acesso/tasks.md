---

description: "Task list template for feature implementation"
---

# Tasks: Importação de Alunos com Senha Padrão de Primeiro Acesso

**Input**: Design documents from `/specs/002-importar-alunos-acesso/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: não solicitados explicitamente na especificação — tarefas de teste automatizado aparecem só na fase de Polish (vitest + supertest, mesmo padrão da feature 001), não como TDD "write-first" por user story.

**Organization**: tarefas agrupadas por user story (spec.md) para permitir implementação e teste independentes de cada uma.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: a qual user story a tarefa pertence (US1, US2, US3)
- Caminhos de arquivo exatos em cada descrição

## Path Conventions

Extensão do monolito já existente (`backend/`, ver plan.md → Project Structure):
`backend/src/`, `backend/migrations/`, `backend/public/`, `backend/tests/`.

---

## Phase 1: Setup

**Purpose**: preparar o schema novo antes de qualquer código de aplicação.

- [X] T001 [P] Escrever migração `backend/migrations/0002_alunos_senha.sql` (colunas `senha_hash`, `senha_salt`, `senha_padrao_ativa`, `token_ativo` em `alunos`) per data-model.md
- [X] T002 Atualizar `abrirDb()` em `backend/src/db.js` para aplicar todas as migrações em `backend/migrations/` em ordem (hoje só aplica `0001_init.sql`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: peças compartilhadas por importação (US1), login (US2) e troca de senha (US3) — nenhuma das três pode ser implementada sem isso.

**⚠️ CRITICAL**: nenhuma user story começa antes desta fase.

- [X] T003 [P] Implementar `gerarSenhaPadrao(email)` (parte local do e-mail, minúsculas) em `backend/src/alunos.js` per research.md #3
- [X] T004 Adicionar a `backend/src/db.js`: `setSenhaAluno(db, alunoId, hash, salt, senhaPadraoAtiva)`, `setTokenAluno(db, alunoId, token)`, `limparTokenAluno(db, alunoId)`, `getAlunoByToken(db, token)`
- [X] T005 Implementar `criarOuAtualizarAluno(db, dados)` em `backend/src/alunos.js` (busca por matrícula antes; cria com senha padrão gerada se não existe; só atualiza nome/idade/turma/email se já existe, nunca mexendo em senha) per research.md #4 — depende de T003, T004
- [X] T006 [P] Implementar `autenticarAlunoMiddleware` (Bearer token de aluno, valida contra `token_ativo` em `alunos`) em `backend/src/auth.js`

**Checkpoint**: fundação pronta — US1, US2 e US3 podem começar.

---

## Phase 3: User Story 1 - Professor importa uma lista de alunos de uma vez (Priority: P1)

**Goal**: professor cola uma lista de alunos na área administrativa e o sistema cria/atualiza os cadastros, gerando senha padrão para quem é novo.

**Independent Test**: colar uma lista de alunos de teste (alguns novos, um com e-mail/turma inválidos) na área administrativa e conferir criados/atualizados/rejeitados, sem depender de nenhum aluno ter logado antes.

### Implementation for User Story 1

- [X] T007 [P] [US1] Implementar parser de linhas de importação (`matricula,nome,email,turma` por linha, sem cabeçalho) em `backend/src/alunos.js` per research.md #5
- [X] T008 [US1] Implementar `POST /api/alunos/importar` (auth-professor) em `backend/src/alunos.js`, usando `criarOuAtualizarAluno` por linha válida e agregando `{criados, atualizados, rejeitados}` — depende de T005, T007
- [X] T009 [US1] Registrar a rota de importação no roteador em `backend/src/app.js`
- [X] T010 [US1] Implementar `POST /api/alunos/:matricula/redefinir-senha` (auth-professor) em `backend/src/alunos.js` (FR-011) — depende de T005
- [X] T011 [US1] Registrar a rota de redefinição de senha no roteador em `backend/src/app.js`
- [X] T012 [US1] `backend/public/admin.html`: seção "Importar alunos" (textarea + botão + exibição do resumo criados/atualizados/rejeitados, com motivo de cada rejeição)
- [X] T013 [US1] `backend/public/admin.html`: botão "Redefinir senha" por aluno na tabela de gestão existente

**Checkpoint**: US1 completa e testável de forma independente.

---

## Phase 4: User Story 2 - Aluno acessa pela primeira vez com a senha padrão (Priority: P1)

**Goal**: aluno importado (ou autocadastrado) consegue logar com matrícula + senha padrão.

**Independent Test**: pegar um aluno criado via importação (US1) ou inserido direto para teste, e logar com a senha padrão esperada (parte do e-mail antes do domínio).

### Implementation for User Story 2

- [X] T014 [US2] Alterar `cadastroHandler` (`POST /api/alunos/cadastro`) em `backend/src/alunos.js` para usar `criarOuAtualizarAluno` em vez do upsert antigo, gerando senha padrão na criação (FR-006) — depende de T005
- [X] T015 [US2] Implementar `POST /api/alunos/login` em `backend/src/alunos.js` (verifica matrícula+senha, gera token, retorna `precisaTrocarSenha`) — depende de T004. Também retorna `nome`/`turma` do aluno para o front-end não precisar repetir a coleta desses dados após o login (ver Nota de Implementação no fim deste arquivo)
- [X] T016 [US2] Registrar a rota de login de aluno no roteador em `backend/src/app.js`
- [X] T017 [US2] `backend/public/index.html`: fluxo de login do aluno (matrícula + senha) na `telaInicio`, chamando `POST /api/alunos/login` e guardando o token — implementado como alternância "Já tenho cadastro" / "Primeiro acesso" na mesma tela
- [X] T018 [US2] `backend/public/index.html`: tratar `401` de login com mensagem única em português, sem revelar se o erro foi na matrícula ou na senha (FR-007) — reaproveita a mensagem já genérica devolvida pelo backend (T015)

**Checkpoint**: US1 e US2 funcionam de forma independente.

---

## Phase 5: User Story 3 - Aluno troca a senha padrão no primeiro acesso (Priority: P2)

**Goal**: no primeiro login com senha padrão, o aluno é obrigado a definir uma senha própria antes de ver qualquer trilha.

**Independent Test**: logar com a senha padrão de um aluno de teste e confirmar que o sistema exige nova senha antes de liberar a trilha, e que a senha padrão antiga para de funcionar depois.

### Implementation for User Story 3

- [X] T019 [US3] Implementar `POST /api/alunos/senha` (auth-aluno) em `backend/src/alunos.js` (define nova senha, zera `senha_padrao_ativa`) — depende de T004, T006
- [X] T020 [US3] Registrar a rota de troca de senha no roteador em `backend/src/app.js`
- [X] T021 [US3] `backend/public/index.html`: tela de troca de senha obrigatória, exibida quando `precisaTrocarSenha=true`, bloqueando o acesso à trilha até ser concluída
- [X] T022 [US3] `backend/public/index.html`: após troca de senha bem-sucedida, seguir o fluxo normal (checagem de habilitação → seleção de trilha)

**Checkpoint**: todas as user stories funcionam de forma independente.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: qualidade e validação final que atravessa todas as user stories.

- [X] T023 [P] Escrever testes em `backend/tests/alunos.test.js` cobrindo: importação (criar/atualizar/rejeitar linha inválida), login certo/errado, troca de senha obrigatória, redefinição pelo professor, autocadastro gerando senha padrão (22/22 testes passando no arquivo todo, 13 novos)
- [X] T024 Executar os 7 cenários de `specs/002-importar-alunos-acesso/quickstart.md` ponta a ponta e corrigir qualquer divergência — todos passaram via `node server.js` local + curl; páginas estáticas confirmadas servindo o novo HTML (login/cadastro, importação)
- [X] T025 [P] Revisão de conformidade constitucional (Princípio I pt-BR, Restrições Técnicas e Privacidade) sobre as telas e mensagens novas de `index.html`/`admin.html` — sem violação encontrada (varredura de strings; senha de aluno usa o mesmo hash PBKDF2 do professor, nunca texto claro)
- [X] T026 Confirmar que a extensão do Princípio II (autenticação de aluno) foi formalizada via `/speckit-constitution` antes de considerar esta feature pronta para produção — resolvido em 2026-08-19, constituição v2.1.0

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências — pode começar imediatamente
- **Foundational (Phase 2)**: depende do Setup — bloqueia US1, US2 e US3
- **User Story 1 (Phase 3)**: depende do Foundational
- **User Story 2 (Phase 4)**: depende do Foundational; não depende de US1 para ser testada isoladamente (pode inserir aluno de teste direto), mas no fluxo real de produto normalmente vem depois de US1
- **User Story 3 (Phase 5)**: depende do Foundational e de US2 (precisa que o login já exista para emitir o token que a troca de senha usa)
- **Polish (Phase 6)**: depende de todas as user stories desejadas estarem completas

### User Story Dependencies

- **US1 (P1)**: independente — só depende do Foundational
- **US2 (P1)**: só depende do Foundational (testável com dado de teste inserido direto, sem esperar US1 pronta)
- **US3 (P2)**: depende funcionalmente de US2 (token de login é pré-requisito para trocar senha)

### Parallel Opportunities

- T001 e T006 podem rodar em paralelo com o resto do Foundational (arquivos diferentes)
- T003 pode rodar em paralelo com T004 (funções independentes, T005 é quem une as duas)
- Após o Foundational, US1 e US2 podem ser feitas em paralelo por pessoas diferentes; US3 só pode começar depois que T015/T016 (login, dentro de US2) estiverem prontos
- T012/T013 (admin.html) podem ser escritos em paralelo com T007-T011 (backend), já que o contrato da API está fixado em contracts/api.md

---

## Parallel Example: Foundational

```bash
Task: "Implementar gerarSenhaPadrao(email) em backend/src/alunos.js"          # T003 [P]
Task: "Implementar autenticarAlunoMiddleware em backend/src/auth.js"          # T006 [P]
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2)

1. Completar Fase 1: Setup
2. Completar Fase 2: Foundational
3. Completar Fase 3 (US1) e Fase 4 (US2) — já entrega o essencial do pedido original:
   importar alunos e eles conseguirem logar com a senha padrão
4. **PARE e VALIDE**: rodar os cenários 1-4 do quickstart.md
5. US3 (troca obrigatória de senha) fecha a lacuna de segurança antes de ir pra
   produção com uma turma de verdade

### Incremental Delivery

1. Setup + Foundational → base pronta
2. US1 pronta → professor já consegue importar (demo)
3. US2 pronta → alunos importados já conseguem logar (demo)
4. US3 pronta → segurança da senha previsível fechada (pronto pra produção)
5. Polish → validação completa via quickstart.md antes do uso real com T33F2/T34F2

---

## Nota de Implementação (gap encontrado durante /speckit-implement)

O formato de importação (`matricula,nome,email,turma`, per spec.md e research.md #5)
não inclui idade — mas `alunos.idade` é `NOT NULL` no schema (feature 001), e é
usada pelo front-end para personalizar perguntas (Princípio V da constituição).
Duas decisões tomadas durante a implementação para fechar essa lacuna, sem exigir
migração de schema nem nova coleta de dado do professor:

1. **Aluno importado**: recebe uma idade-placeholder aleatória (17-45, mesma faixa
   do fallback que já existia no front-end para autocadastro com idade inválida) —
   não representa a idade real, só mantém os geradores de pergunta funcionando.
2. **Login não recoleta nome/turma**: `POST /api/alunos/login` (T015) passou a
   retornar também `nome` e `turma` do cadastro já existente, para o front-end poder
   seguir direto pro jogo sem pedir esses dados de novo — só a idade fica com o
   placeholder acima para quem entrou via login (autocadastro continua coletando
   idade real, normalmente, sem mudança).

`specs/002-importar-alunos-acesso/contracts/api.md` deve ser atualizado para
refletir os campos extras na resposta de `/api/alunos/login` (pendente, não bloqueia
a implementação).
