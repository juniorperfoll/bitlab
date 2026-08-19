---

description: "Task list template for feature implementation"
---

# Tasks: Trilha LPP — Fundamentos, Paradigmas e Big-O (Aulas 01–03)

**Input**: Design documents from `/specs/003-trilha-lpp-fundamentos/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: sem suíte automatizada de conteúdo pedagógico (research.md #5) — validação
é revisão manual, registrada como tarefas de checklist na fase de cada user story e
na Polish, não testes de código.

**Organization**: tarefas agrupadas por user story (spec.md) para permitir
implementação e teste independentes de cada uma.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes ou blocos de conteúdo
  independentes dentro do mesmo arquivo, sem dependência de tarefa incompleta)
- **[Story]**: a qual user story a tarefa pertence (US1, US2, US3)
- Caminhos de arquivo exatos em cada descrição

## Path Conventions

Feature inteira contida em `backend/public/index.html` (ver plan.md → Project
Structure) — sem `backend/src/`, sem `admin.html`, sem migração.

---

## Phase 1: Setup

**Purpose**: preparar o esqueleto de dados da trilha nova antes de qualquer
conteúdo ou ajuste de renderização.

- [X] T001 Remover os geradores antigos `l1_*` a `l8_*` e o `stages`/`ranks` antigos de `TRAILS.linguagens` em `backend/public/index.html` (research.md #4)
- [X] T002 Criar o esqueleto novo de `TRAILS.linguagens` — `nome`, `desc`, 13 `ranks` (research.md #3), e os 12 objetos de estação regular + boss com `id`/`num`/`nome`/`desc`/`bloco`/`cor`/`pool:[]` vazio (per data-model.md e Apêndice A do spec.md) em `backend/public/index.html`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: corrigir o acoplamento a "8 estações" antes que qualquer user story
possa ser validada de ponta a ponta (rank/certificado/texto de progresso errados
até isso ser corrigido).

**⚠️ CRITICAL**: bloqueia a validação completa de US1 (rank e certificado corretos),
mas não bloqueia a autoria de conteúdo em si (US1/US2/US3 podem escrever pools em
paralelo com esta tarefa).

- [X] T003 Generalizar os pontos com `ranks[8]`/"8 estações" hardcoded (`atualizarInfoMapa()`, `textoRelatorio()`, `telaCertificacao()`) para usar `trilha.stages.filter(f=>!f.boss).length` dinâmico, em `backend/public/index.html` (research.md #2) — **achado extra**: um 5º ponto hardcoded (`completas>=8` no cálculo de desbloqueio do boss em `construirMapa()`) também foi encontrado e corrigido, mais crítico que os 4 originais pois destravava o boss cedo demais; confirmado que "Arquitetura de Computadores" (8 estações) continua correta

**Checkpoint**: fundação pronta — rank/certificado/progresso funcionam
corretamente para trilhas de qualquer tamanho.

---

## Phase 3: User Story 1 - Revisão completa pós-aula (Priority: P1) 🎯 MVP

**Goal**: as 12 estações regulares + boss jogáveis de ponta a ponta, com
certificado e relatório corretos ao final.

**Independent Test**: habilitar um aluno de teste para a trilha, completar as 12
estações (estações 6-9 podem ter conteúdo mínimo/placeholder até US3 refinar — ver
Phase 5) e o boss, conferir que o certificado é gerado com o rank certo.

### Implementation for User Story 1

- [X] T004 [P] [US1] Autorar pool de geradores da Estação 1 — Aspectos Históricos e os 4 Paradigmas da Disciplina, em `backend/public/index.html` (Apêndice A, Bloco 1) — 4 geradores (`p1_*`)
- [X] T005 [P] [US1] Autorar pool da Estação 2 — Domínios de Programação e Categorias de Linguagens, em `backend/public/index.html` — 4 geradores (`p2_*`)
- [X] T006 [P] [US1] Autorar pool da Estação 3 — Critérios de Avaliação e Trade-offs de Projeto (reaproveitar padrão do Gerador G3, Apêndice B), em `backend/public/index.html` — 4 geradores (`p3_*`)
- [X] T007 [P] [US1] Autorar pool da Estação 4 — Influências no Projeto: Arquitetura de von Neumann, em `backend/public/index.html` — 3 geradores (`p4_*`)
- [X] T008 [P] [US1] Autorar pool da Estação 5 — Fundamentos da Análise de Algoritmos (tempo x espaço, pior/melhor/médio caso), em `backend/public/index.html` — 3 geradores (`p5_*`)
- [X] T009 [P] [US1] Autorar pool da Estação 10 — Sintaxe vs. Semântica: Lexema, Token e Linguagem (personalização opcional com nome do aluno, Gerador G10, FR-014), em `backend/public/index.html` — 3 geradores (`p10_*`), incluindo `p10_lexemaNome` personalizado
- [X] T010 [P] [US1] Autorar pool da Estação 11 — Gramáticas BNF e Hierarquia de Chomsky, em `backend/public/index.html` — 3 geradores (`p11_*`)
- [X] T011 [P] [US1] Autorar pool da Estação 12 — Derivações e Árvores de Análise (Parse Trees), em `backend/public/index.html` — 3 geradores (`p12_*`)
- [X] T012 [US1] Validar manualmente (Princípio III) o conteúdo das Estações 1, 2, 3, 4, 5, 10, 11 e 12 contra o material-fonte do professor antes de considerar a história pronta — depende de T004-T011; revisado, sem divergência do Apêndice A encontrada

**Checkpoint**: US1 completa e testável de forma independente (com placeholder nas
Estações 6-9 até US3).

---

## Phase 4: User Story 2 - Revisão de um bloco específico (Priority: P1)

**Goal**: o aluno identifica visualmente a qual bloco cada estação pertence e
consegue reabrir/refazer qualquer estação já concluída pelo mapa.

**Independent Test**: com qualquer conteúdo já presente nas estações (mesmo
placeholder), verificar que o mapa mostra 3 famílias de cor + legenda, e que clicar
numa estação concluída permite refazê-la.

### Implementation for User Story 2

- [X] T013 [US2] Colorir cada nó pela família de cor do `bloco` (research.md #1) — implementado diretamente na definição das 12 estações em T002 (cada bloco usa uma família de cor: azuis pra Aula 01, verdes pra Aula 02, violetas pra Aula 03); `desenharMapa()` já lia `stage.cor` sem mudança necessária
- [X] T014 [US2] Adicionar legenda dos 3 blocos (nome + cor) abaixo do mapa, em `backend/public/index.html` — `#mapaLegenda`, populada dinamicamente em `construirMapa()`
- [X] T015 [US2] Atualizar `atualizarInfoMapa()` para exibir "Bloco: Aula 0X" no painel da estação focada, em `backend/public/index.html`

**Checkpoint**: US1 e US2 funcionam de forma independente (reabertura de estação
concluída já funciona via mecanismo "Refazer" existente — sem tarefa nova para
isso, só validação no quickstart).

---

## Phase 5: User Story 3 - Perguntas de Big-O por reconhecimento de padrão (Priority: P2)

**Goal**: as perguntas de Big-O (Estações 6 a 9) usam código Python e tabelas de
razão numérica, nunca prova algébrica ou dedução formal.

**Independent Test**: revisar cada gerador das Estações 6-9 e confirmar que nenhum
enunciado pede prova algébrica — todos usam código Python pra classificar ou tabela
de razão numérica pra justificar.

### Implementation for User Story 3

- [X] T016 [P] [US3] Autorar pool da Estação 6 — Fundamentos e Origem da Notação Big-O (analogia do dicionário, Gerador G6, Apêndice B), em `backend/public/index.html` — 4 geradores (`p6_*`)
- [X] T017 [P] [US3] Autorar pool da Estação 7 — As Classes de Complexidade (trechos de código Python de reconhecimento direto, Gerador G7, FR-011), em `backend/public/index.html` — 4 geradores (`p7_*`), reaproveitando os 4 exemplos de código do Apêndice B
- [X] T018 [P] [US3] Autorar pool da Estação 8 — As 3 Regras de Simplificação (tabela de razão numérica, Gerador G8, FR-011), em `backend/public/index.html` — 3 geradores (`p8_*`)
- [X] T019 [P] [US3] Autorar pool da Estação 9 — Comparando Algoritmos e Trade-off Espaço-Tempo (ancorado em "Sistema de Gestão de Pedidos", FR-013), em `backend/public/index.html` — 3 geradores (`p9_*`)
- [X] T020 [US3] Validar manualmente (FR-011, FR-012, Princípio III) que as Estações 6-9 não exigem álgebra/dedução formal e que as Estações 11-12 (já escritas em US1) não exigem autômatos com rigor formal — depende de T016-T019; revisado, nenhuma pergunta pede prova algébrica ou construção de autômato

**Checkpoint**: todas as user stories funcionam de forma independente; trilha com
as 12 estações completas.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: qualidade e validação final que atravessa todas as user stories.

- [X] T021 [P] Rodar `node --check` no `<script>` extraído de `backend/public/index.html` (sintaxe) — passou limpo em todas as verificações
- [X] T022 Validar os cenários de `specs/003-trilha-lpp-fundamentos/quickstart.md` — revisão estática de todos os 9 (estrutura de 12+boss, 13 ranks, bloco em todas as estações regulares, os 5 pontos hardcoded generalizados, personalização na Estação 10, Estações 6-9 sem álgebra) + smoke test real: `node server.js` local sobe sem erro e serve `/` com status 200 (sem navegador disponível pra teste visual do canvas)
- [X] T023 [P] Revisão final de conformidade constitucional (Princípio I pt-BR, Princípio III rigor pedagógico, Princípio IV sem bloqueio por erro) sobre todo o conteúdo novo — sem violação encontrada

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências — pode começar imediatamente
- **Foundational (Phase 2)**: depende do Setup (T002 cria o esqueleto que T003
  generaliza); não bloqueia a autoria de conteúdo (T004-T011, T016-T019), só a
  validação final de rank/certificado
- **User Story 1 (Phase 3)**: depende do Setup (T002)
- **User Story 2 (Phase 4)**: depende do Setup (T002 — precisa do campo `bloco`
  já existir nos objetos de estação)
- **User Story 3 (Phase 5)**: depende do Setup (T002)
- **Polish (Phase 6)**: depende de todas as user stories desejadas estarem
  completas, incluindo o Foundational (T003) para a validação de rank/certificado

### User Story Dependencies

- **US1 (P1)**: depende só do Setup — independente de US2/US3
- **US2 (P1)**: depende só do Setup — independente de US1/US3 (funciona com
  qualquer conteúdo, mesmo placeholder, nas estações)
- **US3 (P2)**: depende só do Setup — independente de US1/US2, mas escreve
  especificamente nas Estações 6-9 que US1 deixa como placeholder

### Parallel Opportunities

- T004-T011 (US1) podem ser escritas em paralelo — cada uma edita o `pool` de uma
  estação diferente dentro do mesmo arquivo, sem sobreposição de conteúdo
- T016-T019 (US3) podem ser escritas em paralelo pelo mesmo motivo
- US2 (T013-T015, mudanças de renderização) pode ser feita em paralelo com a
  autoria de conteúdo de US1/US3, já que mexe em funções diferentes (não nos pools)
- T003 (Foundational) pode ser feita em paralelo com toda a autoria de conteúdo

---

## Parallel Example: User Story 1

```bash
Task: "Autorar pool da Estação 1 — Aspectos Históricos e Paradigmas"     # T004 [P]
Task: "Autorar pool da Estação 5 — Fundamentos da Análise de Algoritmos" # T008 [P]
Task: "Autorar pool da Estação 12 — Derivações e Árvores de Análise"     # T011 [P]
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2)

1. Completar Fase 1: Setup
2. Completar Fase 3 (US1, com placeholder em 6-9) e Fase 4 (US2) em paralelo
3. **PARE e VALIDE**: trilha jogável de ponta a ponta, mapa com blocos visíveis
4. US3 refina especificamente as 4 estações de Big-O antes do lançamento real —
   sem US3, a trilha funciona mas não atende à restrição pedagógica de FR-011

### Incremental Delivery

1. Setup → esqueleto pronto
2. Foundational (T003) → rank/certificado corretos para trilhas de qualquer tamanho
3. US1 + US2 prontas (podem ser feitas em paralelo) → trilha jogável, mapa
   agrupado por bloco (demo)
4. US3 pronta → conteúdo de Big-O na forma pedagógica correta (pré-requisito real
   de lançamento, FR-011)
5. Polish → validação completa via quickstart.md antes do uso real com T33F2/T34F2
