---

description: "Task list template for feature implementation"
---

# Tasks: Tela Inicial Simplificada e Neutra entre Trilhas

**Input**: Design documents from `/specs/007-simplificar-tela-inicial/`

**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Tests**: sem testes automatizados — feature é puramente visual/markup,
validação é manual via quickstart.md.

**Organization**: tarefas agrupadas por user story. Feature pequena o
suficiente pra não precisar de fases Setup/Foundational separadas.

## Path Conventions

Todo o trabalho em `backend/public/index.html` — sem outro arquivo
envolvido.

---

## Phase 1: User Story 1 - Tela inicial neutra entre as duas trilhas (Priority: P1) 🎯 MVP

**Goal**: remover o conteúdo específico de Arquitetura de Computadores
(featgrid + prévia de rota) do bloco `.hero`, deixando o formulário de
identificação em foco.

**Independent Test**: abrir o jogo, passar da splash, chegar na tela
inicial — confirmar que "SUA ROTA" e o grid de 4 perguntas de exemplo não
aparecem mais, e que o formulário fica visível sem rolar.

### Implementation for User Story 1

- [X] T001 [US1] Remover o bloco `.featgrid` (4 `.featcard`) de dentro de
  `#telaInicio .hero` em `backend/public/index.html` (research.md #1, FR-002)
- [X] T002 [US1] Remover o bloco `.prevwrap` ("SUA ROTA" + `.prevrail` com 8
  `.prevchip` + `.boss2`) de dentro de `#telaInicio .hero` em
  `backend/public/index.html` (research.md #1, FR-001)

**Checkpoint**: US1 completa e testável de forma independente.

---

## Phase 2: User Story 2 - Boas-vindas curtas mantêm a identidade do jogo (Priority: P2)

**Goal**: reescrever `.title`/`.tagline` para uma frase curta e neutra entre
as duas trilhas, mantendo identidade/contexto do jogo.

**Independent Test**: com US1 aplicada, confirmar visualmente que ainda
existe uma frase curta de boas-vindas acima do formulário, sem citar
conteúdo específico de nenhuma trilha.

### Implementation for User Story 2

- [X] T003 [US2] Reescrever o texto de `.title` e `.tagline` dentro de
  `#telaInicio .hero` em `backend/public/index.html` para uma frase curta e
  neutra entre as duas trilhas (research.md #1, FR-003)

**Checkpoint**: US1 e US2 funcionam de forma independente.

---

## Phase 3: Polish & Cross-Cutting Concerns

- [X] T004 Rodar `node --check` no `<script>` extraído de
  `backend/public/index.html`
- [X] T005 Executar os 5 cenários de
  `specs/007-simplificar-tela-inicial/quickstart.md`
- [X] T006 [P] Revisão final de conformidade constitucional (Princípio I
  pt-BR) e confirmação de que nenhuma funcionalidade existente mudou de
  comportamento (FR-005, FR-006, SC-003)

---

## Dependencies & Execution Order

- **US1 (Phase 1)**: independente — sem dependência de outra história
- **US2 (Phase 2)**: independente de US1 — mexe em texto dentro do mesmo
  `.hero`, mas não depende da remoção de US1 para funcionar (pode ser feita
  em qualquer ordem)
- **Polish (Phase 3)**: depende de US1 e US2 completas

### Parallel Opportunities

- T001 e T002 são independentes entre si (blocos diferentes do `.hero`)
- T003 pode ser feita em paralelo com T001/T002 (mexe só no texto de
  `.title`/`.tagline`, não nos blocos removidos)

---

## Implementation Strategy

### MVP First (User Story 1)

1. Completar Fase 1 (US1) — já entrega o pedido central (remover conteúdo
   específico de trilha)
2. **PARE e VALIDE**: cenários 2 e 4 do quickstart.md
3. US2 (boas-vindas neutras) é um complemento de polimento sobre o resultado
   de US1

### Incremental Delivery

1. US1 pronta → tela inicial sem conteúdo específico de trilha (demo)
2. US2 pronta → frase de boas-vindas neutra (demo)
3. Polish → validação completa via quickstart.md
