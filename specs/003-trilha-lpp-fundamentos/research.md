# Research: Trilha LPP — Fundamentos, Paradigmas e Big-O (Aulas 01–03)

## 1. Como mostrar o agrupamento por bloco no mapa 2D existente

**Decision**: cada estação em `TRAILS.linguagens.stages` ganha um novo campo
`bloco: 'Aula 01' | 'Aula 02' | 'Aula 03'`. O mapa (`desenharMapa()`, feature do
"mapa de missões 2D") usa uma família de cor por bloco (ex.: tons de azul para Aula
01, tons de verde para Aula 02, tons de violeta para Aula 03 — reaproveitando as
variáveis CSS já existentes `--cyan`, `--led`, `--violet`) em vez de uma cor
totalmente própria por estação. O painel `#mapaInfo` (que já mostra nome/descrição
da estação focada) ganha uma linha extra "Bloco: Aula 0X — <tema>". Uma legenda
curta abaixo do mapa lista os 3 blocos com sua cor.

**Rationale**: atende FR-015 (identificação visual do bloco) sem precisar de uma
reescrita do sistema de mapa (que já existe e funciona) — é uma extensão de dado +
leitura de cor, não uma feature de navegação nova. Mantém a regra já decidida na
spec (Assumptions): bloco é só apresentação, desbloqueio continua sequencial.

**Alternatives considered**:
- Desenhar "caixas"/regiões visuais separadas por bloco no canvas (clusters
  espacialmente separados) — mais fiel a uma metáfora de "3 salas", mas exige
  redesenhar o layout de waypoints (hoje um único zigue-zague contínuo); não há
  requisito que justifique esse esforço extra — a cor + legenda já resolve "consigo
  identificar visualmente" (US2, cenário 1).
- Um menu separado "pular para bloco" — rejeitado: a spec já resolveu que "revisar
  um bloco" = reabrir uma estação concluída pelo mapa, mecanismo que já existe
  (botão "Refazer com outros valores"); um menu novo seria funcionalidade duplicada.

## 2. Tamanho do array `ranks` e generalização do "8" hardcoded

**Decision**: `TRAILS.linguagens.ranks` passa a ter 13 entradas (índices 0 a 12, um
por quantidade de estações regulares concluídas — a trilha tem 12 agora, não 8).
Os quatro pontos do código que hoje assumem `ranks[8]` e o texto "de 8 estações"
(`atualizarInfoMapa()`, `textoRelatorio()`, `telaCertificacao()`) passam a calcular
`const totalEstacoes = trilha.stages.filter(f=>!f.boss).length;` e usar
`trilha.ranks[totalEstacoes]` / `` `de ${totalEstacoes} estações` `` dinamicamente.

**Rationale**: sem essa generalização, a trilha de 12 estações mostraria sempre o
rank do índice 8 (rank "intermediário" errado) e o texto fixo "8 estações" mesmo
tendo 12 — um bug direto de lançamento. A mudança é backward-compatible: para a
trilha "Arquitetura de Computadores" (que continua com 8 estações), `totalEstacoes`
calcula 8 e o comportamento observado não muda em nada.

**Alternatives considered**:
- Manter a trilha em 8 estações (dividir o conteúdo das Aulas 01-03 diferente, por
  ex. juntando duas estações) só para não mexer no código — rejeitado: distorceria
  o conteúdo pedagógico real (spec já define 12 estações mapeadas 1:1 ao material do
  professor); mais barato e correto consertar o hardcode do que encolher o conteúdo.

## 3. Progressão de ranks (13 nomes) para a nova trilha

**Decision**: nova lista de 13 nomes de rank temáticos a paradigmas/complexidade
(ex.: "Aprendiz de Paradigmas" → ... → "Mestre da Complexidade" ou similar) — texto
final exato fica a cargo da tarefa de autoria de conteúdo (mesmo tratamento dado às
perguntas), não fixado neste documento de pesquisa técnica.

**Rationale**: a trilha de Arquitetura já usa 9 nomes progressivos como reforço de
gamificação (Recruta dos Bits → Mestre da Representação de Dados); manter o padrão
para a trilha LPP preserva consistência de experiência entre trilhas (mesmo
"formato" de progressão, conteúdo temático próprio).

## 4. Geradores antigos (l1_* a l8_*) da trilha "Linguagens" atual

**Decision**: remover completamente os 40 geradores da trilha genérica atual
(`l1_*` a `l8_*`) e o array `stages`/`ranks` antigos de `TRAILS.linguagens`,
substituindo pelo conteúdo novo. Não manter como código morto comentado.

**Rationale**: são perguntas sobre paradigmas em geral, já cobertas de forma mais
rica e fiel ao curso real pela trilha nova (que inclui um bloco de paradigmas mais
aprofundado, ancorado no syllabus real). Manter os dois conjuntos não serve a
nenhum requisito e infla o arquivo sem propósito — vai contra a simplicidade exigida
pelo Princípio II.

**Alternatives considered**:
- Arquivar os geradores antigos num arquivo separado "para o caso de precisar depois"
  — rejeitado: nenhuma necessidade concreta identificada; git history já preserva o
  código antigo se algum dia for preciso recuperá-lo.

## 5. Escopo de teste

**Decision**: sem suíte automatizada nova. Validação = (a) checagem de sintaxe do
`<script>` (`node --check`, mesmo procedimento já usado nas features anteriores) e
(b) revisão pedagógica manual de cada gerador contra o material-fonte do professor,
registrada como checklist de tarefa (não teste de código).

**Rationale**: este projeto nunca testou automaticamente a correção de conteúdo
pedagógico (perguntas/respostas) — é validado por revisão humana, conforme o próprio
"Fluxo de Validação em Sala de Aula" da constituição. Não há motivo para essa
feature ser a primeira a introduzir esse tipo de teste; o volume de conteúdo (~12
estações) já teve o mesmo tratamento na trilha "Linguagens" original (feature 001).
