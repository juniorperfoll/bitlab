---

description: "Task list template for feature implementation"
---

# Tasks: Mapa 2D de Salas com Movimento Livre e Missões

**Input**: Design documents from `/specs/008-mapa-salas-2d/`

**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Tests**: solicitados explicitamente pelo usuário (simulação headless
automatizada, FR-016) — incluídos.

**Organization**: conforme FR-017/SC-006 do spec, **esta rodada implementa
somente a User Story 1**. As demais user stories (2-4) estão documentadas
no fim deste arquivo em alto nível, sem tasks granulares, aguardando
aprovação do "feel" da sala 1 antes de serem detalhadas e executadas.

## Path Conventions

`backend/public/index.html` (front-end), `backend/package.json` (nova
devDependency), `backend/tests/sala2d.test.js` (novo teste).

---

## Phase 1: Setup

- [X] T001 Adicionar `jsdom` a `devDependencies` em `backend/package.json`
  e rodar `npm install` (research.md #4)

---

## Phase 2: User Story 1 - Uma sala completa e jogável (Priority: P1) 🎯 MVP

**Goal**: sala 2D jogável para a estação 1 de uma trilha — movimento em
grade, colisão, terminal interativo, missão em overlay reaproveitando a
lógica existente, porta que destrava ao concluir.

**Independent Test**: logar, entrar na trilha, cair direto na sala da
estação 1 (research.md #1), mover em todas as direções observando
colisão, interagir longe/perto do terminal, responder a missão inteira
(certo e errado), confirmar porta destravando e retorno ao mapa de
waypoints com a estação 1 já marcada como concluída — sem depender de
nenhuma outra sala existir.

### Tests for User Story 1 ⚠️

> Escrever este teste e confirmar que falha antes da implementação (T003-T009).

- [X] T002 [US1] Criar `backend/tests/sala2d.test.js` (`@vitest-environment
  jsdom`) cobrindo os cenários 3-6 do quickstart.md: carregar
  `index.html` real, entrar na trilha, simular movimento/colisão via
  `KeyboardEvent`, tentar interagir longe do terminal (nada acontece),
  interagir perto (missão abre), responder toda a missão (mistura de
  certo/errado), confirmar porta destravada e `S.estagios['e1'].feito
  === true` ao final (research.md #4, FR-016, SC-005) — deve falhar
  agora, pois a sala ainda não existe

### Implementation for User Story 1

- [X] T003 [US1] HTML: adicionar o canvas da sala (`#salaCanvas`) e
  elementos de HUD mínimos da sala dentro de `#telaTrilha` em
  `backend/public/index.html`
- [X] T004 [US1] CSS: tema da sala (circuito/placa-mãe, `#9E1B32` +
  acentos âmbar) e modo overlay para `#telaJogo`/`#telaFase`
  (`position:fixed`, fundo semi-transparente, painel centralizado) em
  `backend/public/index.html` (research.md #3)
- [X] T005 [US1] JS: modelo de estado da sala (grade, paredes, posição do
  jogador, terminal, porta trancada/destrancada), construído a partir de
  `TRAILS[trilha].stages[0]` — `construirSala()`/`desenharSala()` em
  `backend/public/index.html`
- [X] T006 [US1] JS: controles de teclado — movimento em grade com
  checagem de colisão (paredes e porta trancada) e tecla de interação com
  checagem de proximidade ao terminal, em `backend/public/index.html`
  (research.md #2)
- [X] T007 [US1] JS: `abrirMissaoOverlay(stageId)`/
  `fecharMissaoOverlay()` — abre a missão chamando `iniciarFase(stageId)`
  já existente sem modificá-la, aplica o modo overlay (T004) em vez do
  `mostrar()` padrão, e fecha reaproveitando os botões `btVoltarTrilha`/
  `btRefazer` já existentes, em `backend/public/index.html` (research.md
  #3, FR-004, FR-005)
- [X] T008 [US1] JS: destravamento de porta — ao `fimFase()` marcar a
  estação como `feito`, atualizar o estado/desenho da porta da sala para
  destrancada, em `backend/public/index.html` (FR-006)
- [X] T009 [US1] JS: roteamento de entrada na trilha — se a estação 1 não
  está concluída, mostrar a sala em vez do mapa de waypoints; ao
  atravessar a porta destrancada (ou se a estação 1 já está concluída),
  mostrar o mapa de waypoints já existente normalmente, em
  `backend/public/index.html` (research.md #1, FR-014)
- [X] T010 [US1] JS: ponte de depuração `window.__salaDebug` (referências
  de leitura ao estado da sala/jogo e helpers para simular tecla de
  movimento/interação), usada só pelo teste headless (T002), em
  `backend/public/index.html` (research.md #4)

**Checkpoint**: rodar T002 novamente — deve passar. US1 completa e
testável de forma independente.

---

## Phase 3: Polish & Validação

- [X] T011 Rodar `node --check` no `<script>` extraído de
  `backend/public/index.html`
- [X] T012 Rodar `npm test` completo em `backend/` (testes de backend
  existentes + `sala2d.test.js` novo) — confirmar 0 falhas e 0 regressão
- [X] T013 Executar os cenários 1-7 de
  `specs/008-mapa-salas-2d/quickstart.md` manualmente com o servidor
  local (`npm run dev`) — validação automatizável feita (markup presente,
  `/api/health` e `admin.html` sem regressão); cenários puramente visuais
  (colisão/interação/porta "ao vivo") aguardam confirmação do usuário
- [X] T014 [P] Revisão final de conformidade constitucional (Princípio I
  pt-BR, Princípio II sem framework/CDN no runtime, Princípio III —
  nenhuma função geradora/de correção reescrita) e confirmação de que as
  estações 2-8, boss e certificação continuam funcionando sem regressão
- [ ] T015 **PARAR** — apresentar a sala 1 para aprovação do usuário
  (FR-017, SC-006). Não iniciar as User Stories 2-4 (fases futuras abaixo)
  sem aprovação explícita.

---

## Fases Futuras (aguardando aprovação — não detalhadas nesta rodada)

Conforme spec.md (Assumptions → "Escopo desta rodada de implementação"),
as tasks granulares abaixo só serão geradas (via novo `/speckit-tasks`
sobre essas user stories) depois que o usuário aprovar o "feel" da sala 1:

- **User Story 2 (P2)** — Padrão de sala replicado para todas as
  estações de uma trilha: estender a ponte "sala → mapa de waypoints"
  (T009) para "sala → próxima sala" entre estações consecutivas, para as
  8 estações de cada uma das duas trilhas, preservando o bloqueio
  sequencial já existente.
- **User Story 3 (P3)** — Sala de Certificação Final como sala-chefe:
  aplicar o mesmo motor de sala à estação `boss`, com a missão sorteando
  12 perguntas de todos os pools (lógica já existente em `iniciarFase`),
  preservando relatório e código de presença sem alteração.
- **User Story 4 (P2)** — HUD permanente com progresso visível: painel
  fixo (fora do overlay de missão) com pontos, % de acerto, nível/rank e
  indicador de quais salas já foram concluídas, derivado de `S`.

---

## Dependencies & Execution Order

- **Setup (Phase 1)**: sem dependências, roda primeiro (T001 bloqueia
  T002, que precisa do ambiente `jsdom` disponível)
- **US1 (Phase 2)**: depende só do Setup — T002 (teste) antes de T003-T010
  (implementação), conforme TDD pedido; T003 e T004 são independentes
  entre si (HTML vs CSS); T005-T010 têm dependência sequencial natural
  (estado → controles → overlay → porta → roteamento → ponte de teste)
- **Polish (Phase 3)**: depende de US1 completa

### Parallel Opportunities

- T003 (HTML) e T004 (CSS) podem ser feitas em paralelo — arquivos/blocos
  diferentes dentro do mesmo `index.html`, sem dependência funcional
  entre si antes de T005 existir

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Setup (T001)
2. Escrever o teste headless (T002) e confirmar que falha
3. Completar a implementação (T003-T010) até T002 passar
4. Completar Polish (T011-T014)
5. **PARE em T015** — validar/aprovar com o usuário antes de qualquer
   trabalho das Fases Futuras

### Incremental Delivery

1. Setup + US1 + Polish → sala 1 pronta, validada, aguardando aprovação
   (MVP desta rodada)
2. Só depois da aprovação: gerar tasks detalhadas para US2 (replicação),
   US3 (sala-chefe) e US4 (HUD completo), nesta ordem de prioridade
