---

description: "Task list template for feature implementation"
---

# Tasks: Todas as Estações como Salas 2D Encadeadas

**Input**: Design documents from `/specs/012-salas-todas-estacoes/`

**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Tests**: estende `backend/tests/sala2d.test.js`.

**Organization**: US1 (encadeamento) e US4 (ambas as trilhas) são a
mesma mudança de código, já genérica por design — tratadas juntas. US2
(boss) depende de US1. US3 (variação visual) é independente, feita em
paralelo.

## Path Conventions

`backend/public/index.html`, `backend/public/assets/moderninteriors/`
(5 arquivos novos, já extraídos), `backend/tests/sala2d.test.js`.

---

## Phase 1: User Story 1 + User Story 4 - Salas encadeadas, ambas as trilhas (Priority: P1) 🎯 MVP

**Goal**: sair da porta de uma sala leva à próxima estação da trilha
(não ao mapa de waypoints); funciona igual nas duas trilhas.

**Independent Test**: completar sala 1, atravessar a porta, cair na sala
2; repetir escolhendo a outra trilha no login.

### Tests ⚠️

- [X] T001 [US1] Estender `backend/tests/sala2d.test.js`: depois de
  resolver a sala da estação 1 e atravessar a porta, confirmar que
  `debug.sala.stage.id` vira a 2ª estação da trilha (não o mapa de
  waypoints) — `mapaWrap`/`salaWrap` continuam refletindo modo sala, não
  mapa (research.md #2, #3, FR-002, FR-003, SC-001)

### Implementation

- [X] T002 [US1] `proximaEstacaoDaTrilha(stage)` + `sairDaSalaAtual()`
  — substituir a chamada a `mostrarMapaWaypoints()` em
  `moverJogadorSala()` (quando a porta destrancada é atravessada) por
  `sairDaSalaAtual()`, em `backend/public/index.html` (research.md #2,
  FR-002)
- [X] T003 [US1] `renderTrilha()`: trocar `trilha.stages[0]` fixo por
  `trilha.stages.find(st => !S.estagios[st.id].feito)` (cai na última/
  boss se tudo concluído), em `backend/public/index.html` (research.md
  #3, FR-003)

**Checkpoint**: US1+US4 completas — funciona para ambas as trilhas, já
que nada aqui é específico de uma trilha.

---

## Phase 2: User Story 2 - Sala-chefe de Certificação Final (Priority: P1)

**Goal**: a sala do boss tem 12 objetos sorteados de todos os pools da
trilha, pontuação dobrada, e termina no relatório/código já existentes.

**Independent Test**: completar as estações normais, entrar na sala do
boss, resolver os 12 objetos, confirmar pontuação dobrada e relatório.

### Tests ⚠️

- [X] T004 [US2] Estender `backend/tests/sala2d.test.js`: simular
  conclusão de todas as estações normais (marcar `S.estagios[id].feito
  = true` diretamente, sem repetir toda a jogatina), entrar na sala do
  boss, confirmar 12 objetos, resolver todos, confirmar
  `S.estagios.boss.feito`, pontuação em dobro, e que a tela de
  certificação (`telaCertificacao`) é alcançada (research.md #1, FR-004,
  FR-005, SC-002)

### Implementation

- [X] T005 [US2] `geradoresDaSala(stage, trilha)`: novo helper —
  `stage.boss` sorteia 12 de todos os pools da trilha (mesma lógica já
  usada em `iniciarFase`), senão retorna `stage.pool`, em
  `backend/public/index.html` (research.md #1, FR-004, FR-007)
- [X] T006 [US2] `construirSala(stage)`: usar `geradoresDaSala()` em vez
  de `stage.pool` direto para calcular `n`/objetos, e guardar
  `sala.geradores`, em `backend/public/index.html` (research.md #1)
- [X] T007 [US2] `iniciarFase(id, objetoIdx)` e
  `tentarDeNovoObjetoSala()`: usar `sala.geradores[idx]()` em vez de
  `f.pool[idx]()`, em `backend/public/index.html` (research.md #1)

**Checkpoint**: US2 completa — depende de US1 (T002/T003) pra sala do
boss ser alcançável andando pelas salas.

---

## Phase 3: User Story 3 - Cenários visualmente distintos (Priority: P2)

**Goal**: piso/parede variam entre estações vizinhas.

**Independent Test**: percorrer 3-4 salas, confirmar variação visual;
com os arquivos de arte ausentes, confirmar variação de cor no fallback
geométrico.

### Implementation

- [X] T008 [US3] `SALA_ASSET_MANIFEST`: acrescentar as 5 entradas novas
  (`piso2.png`, `piso3.png`, `parede2.png`, `parede3.png`,
  `parede4.png`), em `backend/public/index.html` (research.md #5,
  FR-006)
- [X] T009 [US3] `SALA_TEMAS` (array de 5 combinações piso/parede) +
  `construirSala()` escolhendo `sala.tema` por
  `indiceDaEstacaoNaTrilha % SALA_TEMAS.length`, em
  `backend/public/index.html` (research.md #4, FR-006)
- [X] T010 [US3] `desenharSalaComSprites()`: usar
  `salaImagens[sala.tema.piso]`/`salaImagens[sala.tema.parede]` em vez
  de chaves fixas, em `backend/public/index.html` (research.md #4)
- [X] T011 [US3] `desenharSalaFormas()`: variar a cor da parede por um
  array de cores indexado do mesmo jeito que `sala.tema`, para o
  fallback também ter variação visual, em `backend/public/index.html`
  (research.md #4, edge case da spec)

**Checkpoint**: US3 completa e independente das demais.

---

## Phase 4: Polish & Validação

- [X] T012 Rodar `node --check` no `<script>` extraído de
  `backend/public/index.html`
- [X] T013 Rodar `npm test` completo em `backend/` — confirmar
  `sala2d.test.js` (estendido) passando e 0 regressão (SC-005)
- [X] T014 Executar os 5 cenários de
  `specs/012-salas-todas-estacoes/quickstart.md` com o servidor local —
  percorrer pelo menos 3 estações + certificação numa trilha, e o começo
  de uma sala na outra trilha
- [X] T015 [P] Revisão final de conformidade constitucional (Princípio I
  pt-BR, Princípio III/V — nenhum gerador/correção reescrito) e
  confirmação de que o relatório final/código de presença permanecem
  idênticos (SC-004)

---

## Dependencies & Execution Order

- **Fase 1 (US1+US4)**: T001 antes de T002/T003
- **Fase 2 (US2)**: depende da Fase 1 (a sala do boss só é alcançável
  andando pelas salas); T004 antes de T005-T007; T005 antes de T006/T007
- **Fase 3 (US3)**: independente das Fases 1-2 (mexe em partes
  diferentes — tema/desenho, não navegação/geradores) — pode ser feita
  em paralelo
- **Fase 4 (Polish)**: depende de todas as fases anteriores

### Parallel Opportunities

- Fase 3 (T008-T011) pode ser feita em paralelo com as Fases 1-2

---

## Implementation Strategy

1. Fase 1 (US1+US4) — navegação entre salas
2. Fase 2 (US2) — sala do boss
3. Fase 3 (US3) — variação visual (pode ser em paralelo)
4. Polish (Fase 4)
5. Reportar ao usuário
