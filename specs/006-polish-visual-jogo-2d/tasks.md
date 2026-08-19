---

description: "Task list template for feature implementation"
---

# Tasks: Polimento Visual — Tela Principal Mais Fluida e Logo da UNIDAVI na Splash

**Input**: Design documents from `/specs/006-polish-visual-jogo-2d/`

**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Tests**: sem testes automatizados — feature é puramente visual, validação é
manual via quickstart.md.

**Organization**: tarefas agrupadas por user story. Feature pequena o suficiente
pra não precisar de fases Setup/Foundational separadas.

## Path Conventions

Todo o trabalho em `backend/public/index.html` — sem outro arquivo envolvido.

---

## Phase 1: User Story 1 - Tela principal com sensação de jogo 2D (Priority: P1) 🎯 MVP

**Goal**: tela principal com fundo animado, transições suaves entre modos, e
feedback visual de interação.

**Independent Test**: abrir o jogo, passar da splash, observar a tela de
identificação — fundo com movimento, transição ao trocar de modo, feedback ao
interagir com botões/campos.

### Implementation for User Story 1

- [X] T001 [US1] Adicionar fundo ambiente animado à `#telaInicio` (CSS `@keyframes` movendo/pulsando os gradientes radiais já existentes, ou pontos de brilho extras) em `backend/public/index.html` (research.md #2, FR-001)
- [X] T002 [US1] Implementar `trocarBloco(mostrar, esconder)` em JS + classes CSS de transição (fade/deslocamento) para substituir o toggle instantâneo de `hidden` no handler de `segAcesso`, em `backend/public/index.html` (research.md #3, FR-002)
- [X] T003 [US1] Reforçar feedback `:hover`/`:focus` de `.btn`, `.field input`, `.seg button` com transição mais perceptível (research.md #4, FR-003)

**Checkpoint**: US1 completa e testável de forma independente.

---

## Phase 2: User Story 2 - Emblema da UNIDAVI na splash, no estilo do jogo (Priority: P2)

**Goal**: emblema estilizado "UNIDAVI" visível na splash, no mesmo padrão visual
pixelado do emblema "BIT LAB" já existente.

**Independent Test**: abrir a splash, conferir o emblema; dispensar a splash,
conferir que o emblema some junto.

### Implementation for User Story 2

- [X] T004 [US2] Adicionar CSS `.splash-uni` — emblema estilizado com fonte pixelada (`--disp`) e cores da marca (`--unidavi`/`--unidavi-l`), mesmo padrão visual do `.splash-chip` já existente, em `backend/public/index.html` (research.md #1, FR-005)
- [X] T005 [US2] Adicionar o elemento HTML do emblema dentro de `#splash` (próximo ao emblema "BIT LAB" já existente, dentro do mesmo bloco que desaparece ao dispensar a splash) em `backend/public/index.html` (FR-006)

**Checkpoint**: US1 e US2 funcionam de forma independente.

---

## Phase 3: Polish & Cross-Cutting Concerns

- [X] T006 Rodar `node --check` no `<script>` extraído de `backend/public/index.html`
- [X] T007 Executar os 7 cenários de `specs/006-polish-visual-jogo-2d/quickstart.md`, incluindo a checagem de `prefers-reduced-motion` (FR-004, SC-003)
- [X] T008 [P] Revisão final de conformidade constitucional (Princípio I pt-BR) e confirmação de que nenhuma funcionalidade existente mudou de comportamento (FR-007, SC-005)

---

## Dependencies & Execution Order

- **US1 (Phase 1)**: independente — sem dependência de outra história
- **US2 (Phase 2)**: independente de US1 — mexe numa parte diferente do arquivo (splash, não telaInicio)
- **Polish (Phase 3)**: depende de US1 e US2 completas

### Parallel Opportunities

- US1 e US2 podem ser feitas em paralelo por pessoas diferentes (áreas do arquivo
  não se sobrepõem: uma mexe na `#telaInicio`, a outra na `#splash`)
- Dentro de US1, T001 e T003 são independentes entre si (T002 é o único que mexe
  em JS, pode ser feito em paralelo com as outras duas)

---

## Implementation Strategy

### MVP First (User Story 1)

1. Completar Fase 1 (US1) — já entrega o pedido central (tela principal mais
   fluida)
2. **PARE e VALIDE**: cenários 3-6 do quickstart.md
3. US2 (emblema UNIDAVI) é um complemento visual independente, sem risco de
   retrabalho sobre US1

### Incremental Delivery

1. US1 pronta → tela principal com sensação de jogo (demo)
2. US2 pronta → emblema da UNIDAVI na splash (demo)
3. Polish → validação completa via quickstart.md
