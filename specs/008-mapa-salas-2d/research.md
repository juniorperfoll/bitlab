# Research: Mapa 2D de Salas com Movimento Livre e Missões

## 1. Como a sala da estação 1 convive com o restante da trilha (ainda em waypoints)

**Decision**: a sala 2D substitui a apresentação **apenas da estação 1**
dentro da tela `#telaTrilha`. Enquanto a estação 1 não está concluída, ao
entrar na trilha o aluno cai direto dentro da sala (não no mapa de
waypoints). Ao concluir a missão da sala e a porta destravar, atravessar a
porta leva de volta ao **mapa de waypoints já existente** — que passa a
mostrar a estação 1 como concluída, exatamente como já mostraria hoje — e
as estações 2 a 8, boss e certificado continuam funcionando 100% como
funcionam atualmente, sem nenhuma mudança. Se o aluno já havia concluído a
estação 1 antes desta feature (ou já revisitá-la depois de concluída),
o mapa de waypoints é mostrado diretamente (a sala é a experiência de
**primeira vez/pendência** da estação 1, não uma tela obrigatória toda vez).

**Rationale**: o pedido do próprio usuário (seção ENTREGA) exige entregar e
aprovar UMA sala antes de replicar o padrão para as demais. Construir só a
sala 1 sem quebrar a jogabilidade das outras 7 estações + boss + certificado
é o único jeito de cumprir isso sem deixar o jogo inutilizável para uso real
em sala de aula nesta rodada (a constituição do projeto exige que qualquer
mudança em `index.html` seja validável e utilizável antes de ir para as
turmas). Como o motor de sala é construído de forma genérica sobre
`TRAILS[trilha].stages` (não hard-coded para a estação 1), a User Story 2
(replicar) deixa de ser "reescrever 7 vezes" e passa a ser, na prática,
estender essa mesma ponte de "sala → volta pro mapa" para "sala → próxima
sala", station por station — trabalho incremental sobre a mesma base, não
retrabalho.

**Alternatives considered**:
- Construir as 8 salas + boss já nesta rodada — rejeitado: contraria
  explicitamente o pedido de aprovação incremental do usuário (FR-017),
  e multiplica por 9 qualquer ajuste de "feel" que a aprovação da sala 1
  ainda possa gerar.
- Esconder a feature inteira atrás de uma flag/rota separada, sem afetar o
  fluxo real de nenhum aluno até aprovação — rejeitado: dificulta a
  validação real pedida pelo usuário ("simulação automatizada... antes de
  entregar" já cobre a validação técnica; o usuário quer literalmente
  jogar/aprovar o "feel", o que é mais direto com a sala já no fluxo real
  da estação 1, que é isolada e reversível por natureza sequencial do jogo).

## 2. Modelo de movimento e colisão

**Decision**: movimento por grade (o personagem ocupa uma célula por vez;
cada tecla de direção move uma célula, com um pequeno intervalo de repetição
enquanto a tecla fica pressionada). Colisão é checagem de célula-destino
contra uma lista de células de parede/obstáculo da sala — se a célula
destino é parede, ou é a célula da porta enquanto trancada, o movimento é
ignorado (personagem não se move).

**Rationale**: mais simples de implementar e, principalmente, mais fácil de
validar de forma determinística na simulação automatizada headless (FR-016)
— cada passo é um evento de teclado com um resultado de posição exato e
previsível, sem física de sub-pixel. Mantém a sensação de "andar pela sala"
pedida sem exigir um sistema de colisão contínua (AABB por frame).

**Alternatives considered**:
- Movimento livre em pixel contínuo (como o pedido original sugere ao citar
  Goof Troop) — rejeitado para esta rodada: mais fiel ao estilo SNES, mas
  exige colisão contínua e torna a simulação automatizada não-determinística
  (depende de timing de frame). Pode ser revisitado depois se o usuário
  achar o movimento em grade "robótico" demais ao aprovar a sala 1 — decisão
  reversível e localizada, não afeta o restante do design.

## 3. Overlay de missão sem esconder a sala

**Decision**: `telaJogo` e `telaFase` (as telas de pergunta e de resumo de
estação, já existentes e inalteradas na lógica) passam a poder ser exibidas
em um modo "overlay": em vez de `mostrar()` esconder `#telaTrilha` e mostrar
`#telaJogo` como blocos irmãos concorrentes (comportamento atual), quando a
missão é aberta a partir de uma sala, `#telaTrilha` permanece montada e
visível ao fundo, e `#telaJogo`/`#telaFase` recebem uma classe CSS que os
posiciona como painel sobreposto (`position:fixed`, fundo semi-transparente,
painel centralizado) por cima do canvas da sala. Isso é só uma troca de
apresentação: nenhuma função de `iniciarFase()` em diante (`renderPergunta`,
`montarArea`, `resolver`, `proxima`, `fimFase`, geração de relatório) é
alterada.

**Rationale**: atende ao FR-004 (painel de missão em overlay, aluno não
perde a noção de onde está) com a menor mudança possível — reaproveita 100%
do HTML/JS de pergunta já existente, só muda como ele é posicionado/exibido
quando a origem é uma sala.

**Alternatives considered**:
- Reescrever a tela de pergunta como um componente novo dentro do canvas da
  sala — rejeitado: violaria diretamente a instrução do usuário de não
  recriar a lógica pedagógica/apresentação de pergunta já existente, e
  duplicaria manutenção (duas implementações de renderização de pergunta).

## 4. Validação automatizada headless (jsdom) sem depender de Canvas 2D real

**Decision**: adicionar `jsdom` como devDependency, criar
`backend/tests/sala2d.test.js` com `// @vitest-environment jsdom` no topo
(só esse arquivo — os testes de backend existentes continuam no ambiente
Node padrão). O teste carrega o HTML real de `backend/public/index.html`
num documento jsdom (script executado de verdade, `runScripts:'dangerously'`
já suportado pelo ambiente jsdom do vitest), popula os campos de
identificação do aluno como o fluxo real faria, entra na trilha, e então
dispara `KeyboardEvent`s reais de movimento/interação no `document` do
jsdom — exercitando o código de produção de verdade, não uma reimplementação
paralela da lógica para teste. O estado é inspecionado através de uma
pequena ponte de depuração (`window.__salaDebug`, exposta pelo próprio
`index.html` só com referências de leitura ao estado do jogo: posição do
jogador, célula da porta, se a missão está aberta, etc.) — necessária porque
`let`/`const` no escopo de um `<script>` clássico não viram propriedades de
`window`, então o teste não conseguiria ler `S`/estado da sala de outra
forma sem essa ponte explícita.

**Rationale**: cumpre literalmente o pedido do usuário ("valide com uma
jogada automatizada, headless, tipo jsdom, simulando o personagem
percorrendo... respondendo corretamente"), testando o comportamento real
(colisão, abertura de missão por proximidade+tecla, resposta certa/errada,
destravamento de porta) sem precisar de renderização real de pixels — jsdom
não implementa `CanvasRenderingContext2D` de fato (retorna `null` em
`getContext('2d')` sem o pacote nativo `canvas`, que exige compilação e não
deve ser adicionado só para isso). Como a validação é sobre **estado e
comportamento**, não sobre a imagem desenhada, isso não é uma limitação real
para o que precisa ser garantido.

**Alternatives considered**:
- Instalar o pacote `canvas` (binding nativo) para ter `getContext('2d')`
  funcional em jsdom e também poder inspecionar pixels — rejeitado: exige
  compilação nativa (risco em ambientes com rede restrita, contra a
  restrição técnica do próprio pedido), e não agrega valor real — nenhum
  requisito desta feature depende de verificar pixels renderizados, só de
  verificar posição/colisão/estado.
- Extrair a lógica de sala para um módulo `.js` separado, importável
  diretamente em teste Node puro (sem jsdom/DOM) — rejeitado nesta rodada:
  o projeto inteiro roda como um único `<script>` inline dentro de
  `index.html` (padrão já estabelecido, sem passo de build); extrair um
  módulo separado exigiria um passo de bundling/import para servir ao
  navegador, o que contraria o Princípio II (sem bundler, sem build).
