# Feature Specification: Mapa 2D de Salas com Movimento Livre e Missões

**Feature Branch**: `008-mapa-salas-2d`

**Created**: 2026-08-20

**Status**: Draft

**Input**: User description: "transformar o BitLab de um formato de 'trilha em formulário' para um jogo 2D top-down no estilo Goof Troop (SNES): o aluno controla um personagem que anda por um mapa, entra em salas/locais específicos, e cada local dispara uma 'missão' — que são as perguntas do jogo atual. Reaproveitar toda a lógica pedagógica existente (pools de geradores de pergunta, correção, personalização, relatório final e código de presença), sem recriar do zero. Entrega incremental: uma sala completa primeiro, aprovada, antes de replicar para as demais."

## Nota de Contexto Importante

A descrição original do pedido faz referência a um arquivo único
`BitLab_Trilha_Aula02e03.html`, a um objeto `STAGES` e a nomes de geradores
como `g1_sigla`/`g8_nomeParaAscii`. Essa descrição corresponde a uma versão
anterior do projeto. **Na base de código atual**, o jogo é um monolito
Node/Express (`backend/public/index.html` servido por `backend/server.js`),
o conteúdo pedagógico vive em `TRAILS.arquitetura.stages`/
`TRAILS.linguagens.stages` (duas trilhas, não uma), o estado do jogador
continua no objeto global `S`, e **já existe um mapa 2D em Canvas**
(`construirMapa`/`desenharMapa`/`loopMapa`/`iniciarAndarPara`/
`tentarEntrar`) — mas esse mapa atual é baseado em **waypoints fixos**
(clique/toque para andar até o próximo nó de uma trilha única), não em
movimento livre/por grade com colisão dentro de salas distintas. Esta
especificação foi ajustada para refletir a base de código real: ela
**evolui/substitui o mapa de waypoints já existente** pelo formato de salas
pedido, reaproveitando a mesma estrutura de dados (`TRAILS[trilha].stages`,
`pool` de geradores, objeto `S`) — não recria a lógica pedagógica do zero.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Uma sala completa e jogável (Priority: P1) 🎯 MVP

Um aluno logado entra na trilha escolhida e, em vez de ver o mapa de
waypoints atual, aparece dentro de uma sala 2D (tema circuito/placa-mãe,
cores da identidade visual do BitLab). Ele anda pela sala com as setas ou
WASD, colidindo com as paredes/limites da sala, se aproxima do terminal
daquela estação e pressiona uma tecla de ação para abrir a missão — a
mesma missão (pool de perguntas) que a estação já teria no formato antigo.
Ao concluir a missão com sucesso, a porta/passagem para a próxima sala
destrava.

**Why this priority**: é o pedido explícito do usuário — entregar UMA sala
completa (movimento, colisão, terminal, missão, porta destravando) primeiro,
para aprovação do "feel" do jogo antes de replicar o padrão. É o MVP e o
critério de aceite para prosseguir com o restante da feature.

**Independent Test**: logar em uma trilha, ser levado à primeira sala,
mover o personagem em todas as direções observando colisão com os limites
da sala, aproximar-se do terminal, interagir, responder a missão (todas as
perguntas do pool daquela estação, corretas e incorretas), confirmar que a
porta some/abre só depois da missão concluída, e que os dados do jogador
(`S`) refletem a estação como concluída — sem depender de nenhuma outra
sala existir ainda.

**Acceptance Scenarios**:

1. **Given** o aluno acabou de entrar na trilha, **When** a sala da primeira
   estação carrega, **Then** o personagem aparece dentro da sala, com a
   porta de saída visivelmente trancada.
2. **Given** o personagem dentro da sala, **When** o aluno pressiona as
   teclas de movimento, **Then** o personagem se move na direção
   correspondente e para ao colidir com uma parede/limite da sala (não
   atravessa).
3. **Given** o personagem próximo ao terminal da sala, **When** o aluno
   pressiona a tecla de ação, **Then** abre um painel de missão sobreposto
   ao mapa (overlay), mostrando uma pergunta sorteada do pool daquela
   estação — reaproveitando os mesmos textos/cálculos/personalização já
   existentes.
4. **Given** o painel de missão aberto, **When** o aluno responde
   corretamente, **Then** o sistema aplica a mesma lógica de pontuação já
   existente e avança para a próxima pergunta da missão (ou a conclui, se
   era a última).
5. **Given** o painel de missão aberto, **When** o aluno responde
   incorretamente, **Then** o sistema mostra a explicação do cálculo
   correto (sem travar o progresso) e permite seguir, igual ao
   comportamento já existente hoje.
6. **Given** a missão da sala foi concluída, **When** o aluno fecha o
   painel de missão, **Then** a porta/passagem da sala destrava
   visivelmente e o estado da estação em `S` é marcado como concluído.
7. **Given** o personagem longe do terminal, **When** o aluno pressiona a
   tecla de ação, **Then** nada acontece (sem abrir missão à distância).

---

### User Story 2 - Padrão de sala replicado para todas as estações de uma trilha (Priority: P2)

Depois de aprovada a sala-modelo da User Story 1, o mesmo padrão de sala
(gerado a partir dos dados já existentes em `TRAILS[trilha].stages`, sem
autoria manual repetida por sala) se aplica automaticamente às 8 estações
de cada trilha, conectadas em sequência, preservando o bloqueio sequencial
que já existe hoje (só é possível entrar na sala N+1 depois de concluir a
sala N).

**Why this priority**: é o objetivo final do pedido, mas depende da
aprovação da sala-modelo (US1) — construir isso antes de validar o "feel"
arrisca retrabalho em 16 salas (8 por trilha × 2 trilhas) se algo no
padrão da sala precisar mudar.

**Independent Test**: percorrer uma trilha inteira (8 salas) do início ao
fim, confirmando que cada sala usa o pool de perguntas correto da sua
estação, que a ordem de desbloqueio é sequencial, e que nenhuma sala
permite pular a anterior.

**Acceptance Scenarios**:

1. **Given** o aluno concluiu a sala da estação 1, **When** ele se move até
   a sala da estação 2, **Then** consegue entrar e a missão exibida usa o
   pool de perguntas da estação 2 (nunca da estação 1).
2. **Given** o aluno ainda não concluiu a sala da estação 1, **When** ele
   tenta acessar a sala da estação 3, **Then** o acesso é bloqueado (porta
   trancada ou passagem inexistente), igual ao comportamento sequencial já
   existente hoje.
3. **Given** as 8 salas normais de uma trilha, **When** o aluno as conclui
   todas, **Then** a passagem para a sala de Certificação Final (US3)
   destrava.

---

### User Story 3 - Sala de Certificação Final como sala-chefe (Priority: P3)

Depois das 8 salas normais de uma trilha, o aluno acessa uma sala especial
de "Certificação Final" — visualmente diferenciada (sala-chefe) — cuja
missão sorteia 12 perguntas entre todos os pools da trilha, com pontuação
dobrada, exatamente como a Certificação Final já funciona hoje. Ao
concluir, o mesmo relatório de desempenho e código de presença de hoje são
exibidos, sem nenhuma mudança no texto/lógica desse resultado final.

**Why this priority**: fecha o ciclo completo da trilha no novo formato,
mas só faz sentido depois que o padrão de sala (US1/US2) já está validado
e replicado — é a última peça, não a primeira.

**Independent Test**: completar as 8 salas normais de uma trilha, acessar
a sala de Certificação Final, responder às 12 perguntas sorteadas, e
confirmar que o relatório final e o código de presença gerados são
idênticos, em conteúdo e formato, aos gerados pelo fluxo atual.

**Acceptance Scenarios**:

1. **Given** o aluno não concluiu as 8 salas normais, **When** tenta acessar
   a sala de Certificação Final, **Then** o acesso é bloqueado.
2. **Given** o aluno concluiu as 8 salas normais, **When** acessa a sala de
   Certificação Final, **Then** a missão sorteia 12 perguntas entre todos
   os pools da trilha, com pontuação dobrada.
3. **Given** a missão da Certificação Final concluída, **When** o painel
   fecha, **Then** aparece o relatório de desempenho e o código de
   presença — mesmo conteúdo/formato do fluxo atual, sem alterações.

---

### User Story 4 - HUD permanente com progresso visível (Priority: P2)

Enquanto explora o mapa (fora do painel de missão), o aluno vê
permanentemente na tela: pontuação atual, percentual de acerto, nível/rank
atual, e um indicador (mini-mapa ou lista) de quais salas já foram
concluídas — sem precisar abrir nenhum menu.

**Why this priority**: importante para o aluno se orientar ("onde estou,
o que falta"), mas é um elemento de apoio visual sobre a navegação (US1/
US2) — não bloqueia a jogabilidade central se entregue logo depois do
padrão de sala validado.

**Independent Test**: com pelo menos duas salas no mapa (uma concluída, uma
não), observar o HUD permanente e confirmar que pontos/%acerto/nível
refletem o estado real de `S`, e que o indicador de progresso mostra
corretamente qual sala já foi concluída.

**Acceptance Scenarios**:

1. **Given** o aluno está andando pelo mapa (painel de missão fechado),
   **When** ele observa a tela, **Then** vê permanentemente pontos, %
   de acerto e nível/rank atual, atualizados em tempo real conforme
   `S` muda.
2. **Given** pelo menos uma sala concluída, **When** o aluno observa o
   indicador de progresso do HUD, **Then** a sala concluída aparece
   visualmente distinta das ainda não concluídas.

---

### Edge Cases

- O que acontece com o mapa de waypoints atual (`construirMapa`/
  `desenharMapa`/`loopMapa`)? Ele é substituído por este novo sistema de
  salas — não convivem os dois ao mesmo tempo na mesma trilha (ver
  Assumptions).
- Um aluno que já tinha progresso salvo em uma trilha (algumas estações já
  `feito`) antes desta feature — ao entrar no novo mapa de salas, as portas
  das salas já concluídas aparecem destrancadas, refletindo o estado
  existente de `S`, sem exigir refazer nada.
- O aluno tenta interagir com o terminal enquanto o painel de missão já
  está aberto — a ação é ignorada (não abre um segundo painel).
- O aluno fecha o painel de missão no meio de uma pergunta (sem responder
  todas) — o mesmo comportamento de hoje se aplica: a estação só é marcada
  como concluída ao terminar todas as perguntas da missão; se sair antes,
  pode reabrir o terminal depois para continuar de onde a lógica atual já
  permite.
- `prefers-reduced-motion` ativo — animações de movimento do personagem e
  transições de sala respeitam a mesma regra global já aplicada ao resto
  do jogo (sem quebrar a jogabilidade, só reduzindo/removendo animação).
- Tamanho de tela pequeno (celular) — a sala e o HUD permanecem jogáveis e
  legíveis, mesmo que o mapa completo de uma trilha (todas as salas juntas)
  não caiba inteiro sem rolagem/zoom.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST substituir o mapa de waypoints atual de cada
  trilha por um mapa de salas navegável com movimento controlado pelo
  teclado (setas e/ou WASD).
- **FR-002**: O personagem MUST colidir com os limites/paredes de cada
  sala, sem atravessá-los.
- **FR-003**: Cada sala MUST corresponder a exatamente uma estação de
  `TRAILS[trilha].stages` (incluindo a sala de Certificação Final para o
  estágio `boss`), gerada a partir desses dados — sem duplicar conteúdo
  pedagógico manualmente por sala.
- **FR-004**: Cada sala MUST conter um terminal/console interativo que,
  quando o personagem está próximo e o aluno aciona a tecla de
  interação, abre um painel de missão em overlay sobre o mapa (o aluno
  não perde a noção de onde está).
- **FR-005**: O painel de missão MUST reaproveitar, sem reescrever, os
  mesmos pools de geradores de pergunta, funções de correção
  (equivalentes a `chkInt`/`chkTexto`/`chkNums`/`chkBinFrac`) e lógica de
  personalização (nome, idade, matrícula) já existentes.
- **FR-006**: A porta/passagem de saída de uma sala MUST permanecer
  trancada até a missão daquela sala ser concluída, e MUST destravar
  imediatamente após a conclusão.
- **FR-007**: O acesso a uma sala MUST respeitar a mesma ordem sequencial
  de bloqueio já existente hoje (`S.estagios[id].feito`) — não é possível
  pular uma sala não concluída.
- **FR-008**: A sala de Certificação Final MUST só ficar acessível depois
  que todas as estações normais da trilha estiverem concluídas, e sua
  missão MUST sortear 12 perguntas entre todos os pools da trilha com
  pontuação dobrada, igual ao comportamento atual.
- **FR-009**: Ao concluir a missão da Certificação Final, o sistema MUST
  exibir o mesmo relatório de desempenho e código de presença já gerados
  hoje, sem alteração de conteúdo/formato.
- **FR-010**: O sistema MUST exibir um HUD permanente (fora do painel de
  missão) com pontuação, percentual de acerto, nível/rank atual e um
  indicador de quais salas já foram concluídas.
- **FR-011**: A identidade visual (vermelho institucional UNIDAVI
  `#9E1B32`, acentos âmbar, tema de circuito/placa-mãe) MUST ser
  preservada nos cenários das salas e terminais.
- **FR-012**: Sprites e cenários MUST ser desenhados via Canvas API com
  formas geométricas/pixel art simples, sem depender de arquivos de
  imagem/asset externos.
- **FR-013**: O sistema MUST continuar funcionando como artefato
  client-side servido pelo mesmo monolito atual, sem novo backend nem
  nova dependência externa via CDN, conforme o Princípio II da
  constituição do projeto (front-end vanilla, sem framework).
- **FR-014**: Um aluno com progresso já existente em `S` (estações já
  concluídas antes desta feature) MUST ver, ao entrar no novo mapa de
  salas, as portas das salas correspondentes já destrancadas.
- **FR-015**: Todo texto novo desta feature (rótulos de sala, instruções
  de movimento/interação, mensagens do HUD) MUST estar em português
  brasileiro, conforme o Princípio I da constituição.
- **FR-016**: Cada etapa de implementação MUST ser validada por uma
  simulação automatizada (percurso do personagem, interação com terminal,
  respostas corretas e incorretas, verificação de destravamento de porta)
  antes de ser considerada concluída, confirmando 0 falhas na lógica de
  estado da sala testada.
- **FR-017**: A entrega desta feature MUST ocorrer de forma incremental:
  a primeira sala completa e validada (User Story 1) MUST ser apresentada
  para aprovação antes de o padrão ser replicado para as demais salas
  (User Stories 2-4).

### Key Entities

- **Sala (Room)**: representação jogável de uma estação de
  `TRAILS[trilha].stages` — tem limites/colisão, um terminal, um estado de
  porta (trancada/destrancada), e referência à missão (pool de perguntas)
  daquela estação.
- **Personagem (Player Sprite)**: posição na sala atual, direção,
  aparência simples (forma geométrica/pixel art), estado de movimento.
- **Terminal/Console**: ponto de interação dentro de uma sala; dispara a
  abertura do painel de missão quando o personagem está próximo e a tecla
  de ação é pressionada.
- **Missão (Mission)**: reaproveita o conceito já existente de "estação" —
  uma sequência de perguntas sorteadas do `pool` daquela sala, usando a
  mesma lógica de pontuação/correção/personalização já existente.
- **HUD**: painel permanente com pontuação, % de acerto, nível/rank e
  indicador de progresso entre salas — deriva do mesmo objeto `S` já
  existente, sem nova fonte de dados.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um aluno consegue mover o personagem, entrar em um terminal
  e abrir a missão da primeira sala em menos de 15 segundos após o mapa
  carregar, sem instrução adicional além do HUD/instruções na tela.
- **SC-002**: 100% das tentativas de atravessar uma parede da sala
  resultam em colisão (personagem não sai dos limites da sala).
- **SC-003**: 100% das tentativas de acessar uma sala além da última
  concluída são bloqueadas.
- **SC-004**: O relatório de desempenho e o código de presença gerados ao
  final da Certificação Final são idênticos, byte a byte no texto gerado,
  ao formato produzido pelo fluxo atual (verificável comparando a mesma
  entrada de estado do jogador nos dois formatos).
- **SC-005**: A simulação automatizada de um percurso completo por uma
  sala (entrar, mover, colidir, interagir, responder toda a missão,
  destravar a porta) roda sem nenhuma falha reportada.
- **SC-006**: A sala-modelo da User Story 1 é apresentada e aprovada pelo
  usuário antes de qualquer trabalho de replicação (User Stories 2-4) ser
  executado.

## Assumptions

- **Substituição, não coexistência**: o novo mapa de salas substitui
  integralmente o mapa de waypoints atual (`construirMapa`/`desenharMapa`/
  `loopMapa`/`iniciarAndarPara`/`tentarEntrar`) em ambas as trilhas — as
  duas versões não ficam disponíveis ao mesmo tempo.
- **Motor gráfico**: Canvas API pura (já em uso no projeto), sem Phaser.js
  nem qualquer outra biblioteca de jogo — decisão já resolvida pelo
  Princípio II da constituição do projeto ("front-end vanilla, sem
  framework, sem dependência via CDN"), que não permite a alternativa
  oferecida no pedido original.
- **Modelo de movimento**: movimento por grade (uma célula por passo),
  não movimento livre em pixel contínuo — mais simples de testar de forma
  determinística via simulação automatizada (FR-016), mantendo a sensação
  de "andar pela sala" pedida, sem exigir física de colisão contínua.
- **Validação automatizada sem canvas real**: a simulação automatizada
  (FR-016, SC-005) valida a lógica de estado (posição do personagem,
  colisão, abertura de missão, respostas, destravamento de porta) e não a
  renderização visual em si — pois o motor de teste headless usado no
  projeto (Node/jsdom) não implementa renderização real de Canvas 2D. Isso
  segue o mesmo princípio já aplicado aos testes de backend existentes:
  testar comportamento/estado, não pixels.
- **Escopo desta rodada de implementação**: conforme FR-017/SC-006, a
  implementação desta feature entrega e valida somente a User Story 1
  (uma sala completa) nesta rodada. As User Stories 2-4 (replicar para as
  demais salas, sala-chefe, HUD completo) ficam especificadas e prontas
  para implementação, mas aguardam aprovação explícita do usuário sobre o
  "feel" da sala-modelo antes de serem executadas.
- **Ambas as trilhas**: a sala-modelo da User Story 1 é construída para a
  primeira estação de uma das duas trilhas (a critério de implementação,
  usando a trilha "Arquitetura de Computadores" como referência inicial,
  por ser a trilha original do projeto); o mesmo padrão, sendo genérico
  sobre `TRAILS[trilha].stages`, se aplica a ambas as trilhas na fase de
  replicação (User Story 2), sem trabalho adicional específico por
  trilha.
