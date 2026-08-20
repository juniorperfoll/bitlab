---

description: "Task list template for feature implementation"
---

# Tasks: Validação por Acerto nos Objetos Interativos

**Input**: Design documents from `/specs/011-validacao-por-acerto/`

**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Tests**: estende `backend/tests/sala2d.test.js` (feature 010) com um
cenário de erro + retentativa.

**Organization**: US1 e US2 são a mesma mudança de código vista de dois
ângulos (objeto individual vs. porta) — tratadas numa única fase.

## Path Conventions

`backend/public/index.html`, `backend/tests/sala2d.test.js`.

---

## Phase 1: User Story 1 + User Story 2 - Objeto só valida com acerto, porta só destrava com tudo certo (Priority: P1) 🎯 MVP

**Goal**: resposta errada mantém o objeto pendente e permite retentativa
imediata/ilimitada com pergunta nova; porta só destrava quando todos os
objetos estiverem corretos.

**Independent Test**: interagir com um objeto, errar de propósito,
confirmar indicador ainda lá e retentativa disponível, acertar depois e
confirmar resolução; confirmar porta trancada até todos corretos.

### Tests ⚠️

> Estender o teste primeiro e confirmar que falha antes da implementação.

- [X] T001 [US1] Estender `backend/tests/sala2d.test.js`: no primeiro
  objeto, responder errado, confirmar que continua pendente e que
  `S.fila` foi re-sorteada (nova pergunta) ao tentar de novo, responder
  certo na 2ª tentativa e confirmar resolução; manter os demais objetos
  sendo resolvidos de primeira; ajustar as asserções de `total` que
  assumiam `total === número de objetos` (agora `total` inclui a
  tentativa extra) (research.md #3, FR-001 a FR-005, SC-001 a SC-003)

### Implementation

- [X] T002 [US1] Declarar `let ultimaRespostaCorreta = false;` perto de
  `avaliar`/`respondida`, em `backend/public/index.html`
- [X] T003 [US1] `resolver(ok)`: 2 linhas novas — guardar
  `ultimaRespostaCorreta = ok`; texto do botão diferenciado quando
  `sala && sala.objetoAtual` ("Continuar" se certo, "Tentar de novo" se
  errado), preservando o texto/comportamento atual para o fluxo
  clássico, em `backend/public/index.html` (research.md #1, FR-002,
  FR-008)
- [X] T004 [US1] Nova `tentarDeNovoObjetoSala()`: re-sorteia a pergunta
  do objeto atual (`f.pool[obj.idx]()`) e chama `renderPergunta()`, sem
  fechar o overlay nem marcar resolvido, em `backend/public/index.html`
  (research.md #2, FR-003, FR-004)
- [X] T005 [US1] `proxima()`: no ramo de sala, decidir entre
  `fimObjetoSala()` (se `ultimaRespostaCorreta`) e
  `tentarDeNovoObjetoSala()` (se não), em `backend/public/index.html`
  (FR-001, FR-005)

**Checkpoint**: rodar T001 novamente — deve passar. US1+US2 completas.

---

## Phase 2: Polish & Validação

- [X] T006 Rodar `node --check` no `<script>` extraído de
  `backend/public/index.html`
- [X] T007 Rodar `npm test` completo em `backend/` — confirmar
  `sala2d.test.js` (estendido) passando e 0 regressão nos demais testes
  (SC-004)
- [X] T008 Executar os 4 cenários de
  `specs/011-validacao-por-acerto/quickstart.md` com o servidor local
- [X] T009 [P] Revisão final de conformidade constitucional (Princípio I
  pt-BR, Princípio IV v3.0.0 — retentativa realmente ilimitada e
  imediata, Princípio V — nova instância a cada tentativa) e confirmação
  de que o fluxo clássico (estações em waypoints) não mudou

---

## Dependencies & Execution Order

- T001 (teste) antes de T002-T005 (implementação)
- T002 antes de T003 (variável precisa existir antes de ser atribuída)
- T003, T004 antes de T005 (proxima() depende de ambos)
- Polish depende da Fase 1 completa

---

## Implementation Strategy

1. Estender o teste (T001), confirmar que falha
2. Implementar T002-T005 até passar
3. Completar Polish (T006-T009)
4. Reportar ao usuário — pronto pra jogar local
