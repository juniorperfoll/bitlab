---

description: "Task list template for feature implementation"
---

# Tasks: Reposicionar Identidade do BitLab para Sistemas de Informação

**Input**: Design documents from `/specs/005-splash-foco-si/`

**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Tests**: sem testes automatizados — feature é só texto estático, validação é
visual manual (quickstart.md).

**Organization**: user story única (P1) — feature pequena o suficiente pra não
precisar de fases Setup/Foundational separadas.

## Format: `[ID] [P?] [Story] Description`

## Path Conventions

Todo o trabalho em `backend/public/index.html` — sem outro arquivo envolvido.

---

## Phase 1: User Story 1 - Primeira impressão reflete o curso, não uma disciplina só (Priority: P1) 🎯 MVP

**Goal**: splash e barra de identidade persistente deixam de citar exclusivamente
"Arquitetura de Computadores".

**Independent Test**: abrir o jogo do zero, conferir os 4 textos alterados na
splash e na barra do topo.

### Implementation for User Story 1

- [X] T001 [US1] Trocar `.splash-sub` de "TRILHA DE ARQUITETURA DE COMPUTADORES" para "BACHARELADO EM SISTEMAS DE INFORMAÇÃO" em `backend/public/index.html` (research.md #1)
- [X] T002 [US1] Trocar `.splash-foot` de "Arquitetura de Computadores · UNIDAVI" para "Sistemas de Informação · UNIDAVI" em `backend/public/index.html`
- [X] T003 [US1] Trocar o `<h1>` da `.sysbar .brand` de "BIT LAB — TRILHA DE ARQUITETURA DE COMPUTADORES" para "BIT LAB — TRILHAS DE SISTEMAS DE INFORMAÇÃO" em `backend/public/index.html`
- [X] T004 [US1] Trocar o `<p>` da `.sysbar .brand` de "Arquitetura de Computadores · Aulas 02 e 03 · UNIDAVI" para "Sistemas de Informação · UNIDAVI" em `backend/public/index.html`

**Checkpoint**: US1 completa e testável — única história desta feature.

---

## Phase 2: Polish & Cross-Cutting Concerns

- [X] T005 Rodar `node --check` no `<script>` extraído de `backend/public/index.html` (garantir que a edição de texto não quebrou nada por acidente, embora as mudanças sejam só em HTML)
- [X] T006 Executar os 4 cenários de `specs/005-splash-foco-si/quickstart.md` — validado contra servidor local real (splash, barra de identidade, nomes de trilha intactos)
- [X] T007 [P] Revisão de conformidade constitucional (Princípio I pt-BR) sobre os 4 textos novos — todos pt-BR

---

## Dependencies & Execution Order

- Todas as 4 tarefas de US1 são edições independentes dentro do mesmo arquivo —
  sem dependência real entre elas, mas como é o mesmo arquivo, fazer em sequência
  evita qualquer conflito de edição
- Polish depende de US1 completa

---

## Implementation Strategy

Feature pequena o suficiente para não ter MVP incremental — as 4 tarefas de US1 são
a feature inteira. Completa Fase 1, valida com quickstart.md (Fase 2), pronto.
