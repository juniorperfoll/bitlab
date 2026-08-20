---

description: "Task list template for feature implementation"
---

# Tasks: Arte Pixel do Pacote Modern Interiors (versão gratuita)

**Input**: Design documents from `/specs/009-assets-moderninteriors/`

**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Tests**: reaproveita `backend/tests/sala2d.test.js` (feature 008) sem
alteração — valida que o comportamento não muda; nenhum teste novo
necessário (feature é só de apresentação visual + carregamento de
arquivo, já coberto pelo fallback determinístico).

**Organization**: US1 (motor de sprites + fallback) e US2 (créditos) são
implementadas nesta rodada. US3 (estender às demais salas) fica só
documentada no spec, sem tasks — depende da feature 008 avançar primeiro.

## Path Conventions

`backend/public/index.html` (front-end), `backend/public/assets/
moderninteriors/` (novo diretório de assets), `README.md`.

---

## Phase 1: Setup

- [X] T001 Criar `backend/public/assets/moderninteriors/` com um
  `LEIA-ME.md` documentando o manifesto de 4 arquivos esperados
  (`piso.png`, `parede.png`, `terminal.png`, `personagem.png`) e o passo
  a passo de onde baixar/como nomear (research.md #1, quickstart.md #1)

---

## Phase 2: User Story 1 - Sala da estação 1 com arte pixel real (Priority: P1) 🎯 MVP

**Goal**: sala renderizada com sprites de imagem quando os arquivos
existem, com fallback gracioso e idêntico à feature 008 quando não
existem.

**Independent Test**: sem os arquivos presentes, a sala abre e funciona
exatamente como na feature 008 (fallback); com os arquivos presentes, o
piso/paredes/personagem usam as imagens.

### Implementation for User Story 1

- [X] T002 [US1] Renomear a função `desenharSala()` existente (feature
  008) para `desenharSalaFormas()`, mantendo o corpo idêntico, em
  `backend/public/index.html`
- [X] T003 [US1] Adicionar o manifesto de imagens e o carregador
  assíncrono (`SALA_ASSET_MANIFEST`, `salaImagens`,
  `salaSpritesProntos`, `carregarSpritesSala()`), chamado uma vez na
  inicialização do script, em `backend/public/index.html` (research.md
  #1, #3)
- [X] T004 [US1] Adicionar `desenharSalaComSprites()` — desenha piso e
  paredes por tile via `drawImage()`, terminal e personagem como sprites
  únicos, porta continua com o retângulo colorido já existente, em
  `backend/public/index.html` (research.md #2, #4, FR-001, FR-002)
- [X] T005 [US1] Criar a nova `desenharSala()` como despachante — chama
  `desenharSalaComSprites()` se `salaSpritesProntos`, senão
  `desenharSalaFormas()`, em `backend/public/index.html` (research.md #3,
  FR-004)
- [X] T006 [US1] CSS: `image-rendering:pixelated` no seletor de
  `#salaCanvas` (mantendo `#mapaCanvas` sem essa regra, já que não usa
  sprites), em `backend/public/index.html`

**Checkpoint**: US1 completa — sala funciona com ou sem os arquivos de
imagem presentes.

---

## Phase 3: User Story 2 - Crédito ao autor visível (Priority: P1)

**Goal**: crédito ao LimeZu visível no jogo e no README.

**Independent Test**: abrir o jogo e o README, confirmar a menção ao
pacote/autor em ambos.

### Implementation for User Story 2

- [X] T007 [US2] Adicionar linha de crédito ("Arte: Modern Interiors por
  LimeZu — limezu.itch.io/moderninteriors") ao `<p class="foot">` já
  existente em `backend/public/index.html` (FR-005)
- [X] T008 [US2] Adicionar a mesma informação de crédito à seção de
  referências no fim de `README.md` (FR-006)

**Checkpoint**: US1 e US2 completas e independentes.

---

## Phase 4: Polish & Validação

- [X] T009 Rodar `node --check` no `<script>` extraído de
  `backend/public/index.html`
- [X] T010 Rodar `npm test` completo em `backend/` — confirmar que
  `sala2d.test.js` continua passando (exercitando o caminho de fallback,
  já que os arquivos reais ainda não existem neste repositório) e 0
  regressão nos demais testes (SC-004)
- [X] T011 Executar os cenários 2, 3 e 5 de
  `specs/009-assets-moderninteriors/quickstart.md` (os que não dependem
  dos arquivos reais) com o servidor local (`npm run dev`)
- [X] T012 [P] Revisão final de conformidade constitucional (Princípio I
  pt-BR, Princípio II sem framework/CDN novo) e confirmação de que a
  jogabilidade da sala (feature 008) não mudou

---

## Dependência de Arquivo — resolvida nesta rodada

O usuário disponibilizou `Modern_Interiors_Free_v2.2.zip` na raiz do
repositório. Os 4 arquivos foram recortados e aplicados em
`backend/public/assets/moderninteriors/` (ver `LEIA-ME.md` ali dentro
para a origem exata de cada recorte) — nenhuma mudança de código
adicional foi necessária (T005 já cobria a troca automática). Cenários 1
e 4 de `quickstart.md` validados via composição idêntica à lógica real de
desenho (script Python fora do repo, reproduzindo `desenharSalaComSprites`
pixel a pixel) e via `curl` confirmando os 4 arquivos servidos em
`/assets/moderninteriors/*.png`.

---

## Dependencies & Execution Order

- **Setup (Phase 1)**: sem dependências
- **US1 (Phase 2)**: depende do Setup; T002 antes de T005 (a nova
  `desenharSala` referencia `desenharSalaFormas`); T003 antes de T005
  (referencia `salaSpritesProntos`); T004 antes de T005; T006 é
  independente (só CSS)
- **US2 (Phase 3)**: independente de US1 — mexe em partes diferentes do
  arquivo (rodapé/README, não a sala)
- **Polish (Phase 4)**: depende de US1 e US2 completas

### Parallel Opportunities

- T001 (Setup) e T007/T008 (US2) podem ser feitas em paralelo com
  T002-T006 (US1) — arquivos/blocos diferentes
- T006 (CSS) é independente do restante de US1

---

## Implementation Strategy

### MVP First (User Story 1)

1. Completar Setup (T001)
2. Completar US1 (T002-T006) — sala funciona com fallback idêntico à
   feature 008 (sem os arquivos ainda)
3. Completar US2 (T007-T008) — crédito visível
4. Completar Polish (T009-T012)
5. Reportar ao usuário: pronto pra receber os arquivos reais
   (`backend/public/assets/moderninteriors/`), sem mais nenhuma mudança
   de código necessária depois disso
