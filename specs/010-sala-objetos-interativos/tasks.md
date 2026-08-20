---

description: "Task list template for feature implementation"
---

# Tasks: Um Objeto Interativo por Pergunta na Sala 2D

**Input**: Design documents from `/specs/010-sala-objetos-interativos/`

**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Tests**: reescreve `backend/tests/sala2d.test.js` (feature 008) — o
comportamento validado mudou de propósito nesta feature.

**Organization**: US1 e US2 são muito acopladas (o objeto só faz sentido
com a porta reagindo a ele) — tratadas numa única fase de implementação;
US3 é só uma checagem lógica (já satisfeita pelo design orientado a
`pool.length`, sem tasks próprias).

## Path Conventions

`backend/public/index.html` (front-end), `backend/tests/sala2d.test.js`
(teste reescrito).

---

## Phase 1: User Story 1 + User Story 2 - Objetos por pergunta, indicador e porta (Priority: P1) 🎯 MVP

**Goal**: sala com um objeto interativo por pergunta do pool, indicador
de pendência, porta só destrava com todos resolvidos, resumo final com
os números corretos.

**Independent Test**: entrar na sala da estação 1, contar objetos
(== tamanho do pool), interagir um de cada vez, confirmar indicador,
confirmar porta trancada até o último, confirmar resumo final com
acertos/pontos somando todos os objetos.

### Tests ⚠️

> Escrever/adaptar este teste primeiro e confirmar que falha antes da implementação.

- [X] T001 [US1] Reescrever `backend/tests/sala2d.test.js` para o modelo
  de múltiplos objetos: confirmar N objetos (N = pool da estação 1) ao
  entrar, todos pendentes; interagir longe de todos (nada abre);
  aproximar e resolver um por um (mistura de certo/errado), confirmando
  que só o objeto interagido perde o indicador de pendência a cada passo
  e os demais continuam pendentes; confirmar porta trancada até faltar
  só 1; resolver o último e confirmar porta destravada e
  `S.estagios['e1'].feito===true` com `acertos`/`total` corretos
  (somando todos os objetos, não só o último) (research.md #4, FR-001 a
  FR-006, SC-001 a SC-004)

### Implementation

- [X] T002 [US1] `construirSala(stage)`: trocar `terminal` único por
  `objetos[]` — lista de células livres do interior, um objeto por
  `stage.pool[i]`, distribuídos igualmente espaçados; inicializar
  `resolvido` a partir de `S.estagios[stage.id].feito` (revisita), em
  `backend/public/index.html` (research.md #1, FR-001, FR-008)
- [X] T003 [US1] `iniciarFase(id, objetoIdx)`: adicionar o parâmetro
  opcional — quando informado, `S.fila=[f.pool[objetoIdx]()]` e
  `sala.objetoAtual` aponta pro objeto; quando omitido, limpar
  `sala.objetoAtual=null` explicitamente (evita contaminação entre
  estações), em `backend/public/index.html` (research.md #3, FR-002,
  FR-007)
- [X] T004 [US1] `tentarInteragirSala()`: achar o objeto pendente mais
  próximo (em vez de checar distância a um terminal único); se nenhum
  por perto, avisar; se achar, chamar
  `iniciarFase(sala.stage.id, alvo.idx)`, em `backend/public/index.html`
  (FR-002, FR-006)
- [X] T005 [US1] Nova `fimObjetoSala()`: marca o objeto atual como
  resolvido; se restam pendentes, fecha o overlay e volta pra sala; se
  era o último, sintetiza `S.faseAcertos`/`S.faseXp`/`S.fila.length` a
  partir de `S.estagios[id]` e delega a `fimFase()` (intocada), em
  `backend/public/index.html` (research.md #2, FR-005, FR-007)
- [X] T006 [US1] `proxima()`: 1 linha nova — quando `S.qi>=S.fila.length`,
  chamar `fimObjetoSala()` se `sala.objetoAtual`, senão `fimFase()` como
  hoje, em `backend/public/index.html`
- [X] T007 [US1] `desenharSalaFormas()`/`desenharSalaComSprites()`:
  desenhar a lista `sala.objetos` (retângulo/sprite por objeto, com
  variação visual leve para objetos resolvidos) em vez do `terminal`
  único, em `backend/public/index.html` (FR-003)
- [X] T008 [US1] Nova `desenharIndicadoresSala()`, chamada pelo
  despachante `desenharSala()`: desenha um indicador (❗) acima de cada
  objeto ainda não resolvido, em `backend/public/index.html` (FR-003,
  FR-004)
- [X] T009 [US1] `atualizarInfoSala()`: mensagem reflete quantos objetos
  faltam resolver (em vez do texto fixo sobre "o terminal"), em
  `backend/public/index.html`

**Checkpoint**: rodar T001 novamente — deve passar. US1+US2 completas e
testáveis de forma independente.

---

## Phase 2: Polish & Validação

- [X] T010 Rodar `node --check` no `<script>` extraído de
  `backend/public/index.html`
- [X] T011 Rodar `npm test` completo em `backend/` — confirmar
  `sala2d.test.js` (reescrito) passando e 0 regressão nos demais testes
- [X] T012 Executar os 8 cenários de
  `specs/010-sala-objetos-interativos/quickstart.md` com o servidor
  local (`npm run dev`)
- [X] T013 [P] Revisão final de conformidade constitucional (Princípio I
  pt-BR, Princípio III — nenhum gerador/função de correção reescrita,
  Princípio IV — nenhum bloqueio por erro/placar mínimo) e confirmação de
  que estações 2-8, boss e certificação continuam funcionando

---

## Dependencies & Execution Order

- **Fase 1 (US1+US2)**: T001 (teste) antes de T002-T009 (implementação);
  T002 antes de T003/T004 (dependem de `sala.objetos` existir); T003
  antes de T004/T005/T006 (todos dependem do parâmetro novo/
  `sala.objetoAtual`); T007/T008/T009 são independentes entre si e podem
  vir em paralelo depois de T002
- **Fase 2 (Polish)**: depende da Fase 1 completa

### Parallel Opportunities

- T007, T008 e T009 (todas de desenho/apresentação) podem ser feitas em
  paralelo depois que T002 (modelo de dados `sala.objetos`) existir

---

## Implementation Strategy

### MVP First

1. Escrever o teste (T001), confirmar que falha
2. Implementar T002-T009 até o teste passar
3. Completar Polish (T010-T013)
4. Reportar ao usuário — pronto pra jogar local
