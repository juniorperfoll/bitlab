# Feature Specification: Um Objeto Interativo por Pergunta na Sala 2D

**Feature Branch**: `010-sala-objetos-interativos`

**Created**: 2026-08-20

**Status**: Draft

**Input**: User description: "O acesso às trilhas do jogo precisam ser
pelo cenário 2D, o jogador vai avançando para novos cenários (trilhas)
conforme vai completando a missão anterior, só avançar se tiver um nível
de XP bom para avançar. Cada pergunta deve ser aberta em alguma área do
cenário, como no goophy trop que voce vai entrando em ambientes e
interagindo com os objetos" — refinado em conversa: a sala 1 (feature
008) já está pronta; cada pergunta da missão deve virar um objeto
interativo diferente espalhado pela sala (não um único terminal
concentrando a sequência inteira), o jogador só segue para o próximo
ambiente depois de interagir com todos os objetos da cena, e cada objeto
ainda não resolvido mostra um indicador visual (ex.: emoji de alerta).

## Nota de Contexto Importante

Esta feature **evolui a sala 2D já implementada e testada** (feature
008, User Story 1 — movimento em grade, colisão, porta trancada/
destrancada, missão em overlay reaproveitando `iniciarFase`/
`renderPergunta`/`resolver`/`proxima`/`fimFase`) e a arte pixel já
aplicada a ela (feature 009). Ela **substitui só a parte de "um terminal
único abre a sequência inteira de perguntas da estação"** por "cada
pergunta do pool da estação vira um objeto interativo próprio, disperso
pela sala" — mantendo tudo o mais que já existe (movimento, colisão,
porta, reaproveitamento total da lógica pedagógica, tema visual).

Na conversa de esclarecimento, ficou confirmado que "avançar para o
próximo cenário/trilha" se refere a avançar de uma sala/estação para a
próxima dentro da mesma trilha pedagógica já escolhida pelo aluno (não a
alternar entre as duas trilhas do projeto, Arquitetura de Computadores e
Linguagens de Programação — essa escolha continua acontecendo no
formulário de login, como hoje). O critério de "só avançar com um nível
de XP bom" é atendido por **interagir com todos os objetos da sala**
(responder a todas as perguntas, certas ou erradas) — não por um placar
mínimo de acertos, para não contrariar o Princípio IV da constituição do
projeto (erro nunca pode travar o progresso).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Um objeto por pergunta, com indicador de pendência (Priority: P1) 🎯 MVP

Um aluno entra na sala da estação 1 (já familiar da feature 008/009) e,
em vez de um único terminal que abre a sequência inteira de perguntas,
encontra vários objetos interativos espalhados pela sala — um para cada
pergunta do pool daquela estação. Cada objeto ainda não respondido mostra
um indicador visual de pendência. Ao se aproximar e interagir, abre só
**aquela** pergunta específica (não a sequência inteira). Depois de
responder (certo ou errado, sempre com a explicação já existente), o
indicador do objeto some/muda para indicar que foi resolvido.

**Why this priority**: é o pedido central — trocar "um terminal só" por
"vários objetos, um por pergunta", com feedback visual de progresso
dentro da própria sala. É uma mudança direta sobre a sala já aprovada.

**Independent Test**: entrar na sala da estação 1, contar quantos objetos
interativos aparecem (deve bater com o número de perguntas do pool
daquela estação), confirmar que todos começam com o indicador de
pendência, interagir com um de cada vez, confirmar que cada interação
abre só uma pergunta (não a lista inteira), e que o indicador daquele
objeto some/muda depois de responder.

**Acceptance Scenarios**:

1. **Given** o aluno entra na sala da estação 1, **When** a sala carrega,
   **Then** aparece um objeto interativo para cada pergunta do pool
   daquela estação, cada um com um indicador visual de pendência.
2. **Given** um objeto com indicador de pendência, **When** o aluno se
   aproxima e interage, **Then** abre em overlay só a pergunta
   correspondente àquele objeto — não a sequência inteira da estação.
3. **Given** a pergunta de um objeto respondida (certa ou errada),
   **When** o aluno fecha o overlay, **Then** o indicador de pendência
   daquele objeto específico some ou muda para indicar "resolvido", e os
   demais objetos ainda pendentes continuam com o indicador.
4. **Given** um objeto já resolvido, **When** o aluno interage com ele de
   novo, **Then** nada acontece (mesmo padrão de "não abre duas vezes" já
   usado no terminal único da feature 008).
5. **Given** uma resposta errada em um dos objetos, **When** o aluno vê o
   feedback, **Then** a explicação do cálculo correto aparece
   normalmente e ele consegue prosseguir para os demais objetos sem
   travar (Princípio IV da constituição).

---

### User Story 2 - Porta só destrava com todos os objetos resolvidos (Priority: P1)

A porta da sala continua trancada até que **todos** os objetos
interativos tenham sido resolvidos (respondidos, certos ou errados) — não
basta resolver só alguns.

**Why this priority**: é a condição de progresso que o usuário descreveu
explicitamente ("só vai pra próxima depois de interagir com todos os
objetos") — sem isso, o objeto interativo múltiplo não muda o resultado
final da sala.

**Independent Test**: resolver todos os objetos menos um, confirmar que
a porta continua trancada; resolver o último, confirmar que a porta
destrava imediatamente.

**Acceptance Scenarios**:

1. **Given** a sala com N objetos, **When** o aluno resolve N-1 deles,
   **Then** a porta continua trancada.
2. **Given** o último objeto pendente, **When** o aluno o resolve,
   **Then** a porta destrava imediatamente, sem precisar de nenhuma ação
   adicional.

---

### User Story 3 - Padrão funciona para qualquer tamanho de pool (Priority: P2)

O número de objetos interativos de uma sala se adapta automaticamente ao
número de perguntas do pool daquela estação — sem precisar de ajuste
manual por estação quando as demais salas forem construídas (feature
008, User Stories 2-3, ainda pendentes de aprovação).

**Why this priority**: garante que o trabalho desta feature já prepara o
terreno para a réplica futura das outras estações, sem precisar refazer o
mecanismo de objetos depois — mas não é validável de forma independente
nesta rodada, já que só a sala 1 existe hoje (feature 008 escopo).

**Independent Test**: N/A nesta rodada de implementação — validado
logicamente pelo fato do número de objetos derivar do tamanho de
`pool` de cada estação (dado já existente em `TRAILS[trilha].stages`),
não de um valor fixo.

---

### Edge Cases

- Estação com pool pequeno (algumas estações têm só 3-4 perguntas) —
  a sala tem só 3-4 objetos; o mecanismo não assume um número fixo.
- Aluno revisita uma sala cuja estação já foi concluída antes desta
  feature existir — todos os objetos aparecem já resolvidos (sem
  indicador de pendência) e a porta já aparece destrancada, refletindo o
  estado existente em `S.estagios[id]`.
- Dois objetos muito próximos um do outro — o aluno consegue diferenciar
  qual objeto está prestes a interagir (feedback de proximidade já
  existente na feature 008, agora por objeto individual em vez de um
  terminal único).
- Layout de objetos não pode sobrepor a posição inicial do jogador nem a
  célula da porta.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Uma sala MUST conter um objeto interativo distinto para
  cada pergunta do `pool` da estação correspondente — não mais um único
  terminal que abre a sequência inteira.
- **FR-002**: Cada objeto interativo MUST abrir, ao ser interagido, **só
  a pergunta específica** associada a ele — nunca a sequência completa de
  perguntas da estação de uma vez.
- **FR-003**: Todo objeto interativo ainda não respondido MUST exibir um
  indicador visual de pendência, visível enquanto o aluno explora a sala.
- **FR-004**: Ao responder a pergunta de um objeto (certa ou errada), o
  indicador de pendência daquele objeto específico MUST desaparecer ou
  mudar para indicar que foi resolvido — sem afetar o indicador dos
  demais objetos ainda pendentes.
- **FR-005**: A porta da sala MUST permanecer trancada até que **todos**
  os objetos interativos daquela sala tenham sido resolvidos, e MUST
  destravar imediatamente quando o último for resolvido.
- **FR-006**: Interagir com um objeto já resolvido MUST não ter efeito
  (não reabre a pergunta, não duplica pontuação).
- **FR-007**: Toda a lógica pedagógica já existente (pools de geradores,
  `chkInt`/`chkTexto`/`chkNums`/`chkBinFrac`, pontuação, personalização,
  explicação de erro sem bloqueio) MUST continuar sendo reaproveitada sem
  reescrita — esta feature muda só como cada pergunta é **disparada**
  (por objeto individual em vez de terminal único) e como o **progresso
  da sala** é rastreado (todos os objetos vs. missão inteira de uma vez).
- **FR-008**: O número e a disposição dos objetos interativos de uma sala
  MUST derivar automaticamente do tamanho do `pool` da estação
  correspondente — nenhum valor fixo hardcoded por estação.
- **FR-009**: Nenhuma resposta errada em nenhum objeto MUST bloquear o
  aluno de continuar interagindo com os demais objetos da sala
  (Princípio IV da constituição — aprendizagem sem bloqueio).
- **FR-010**: Todo texto novo desta feature (indicador, mensagens da
  sala) MUST estar em português brasileiro, conforme o Princípio I da
  constituição.

### Key Entities

- **Objeto Interativo**: substitui o "terminal" único da feature 008
  dentro de uma sala — tem posição na grade, uma pergunta específica
  associada (um item do `pool` da estação), e um estado (pendente/
  resolvido).
- **Sala**: continua como definida na feature 008 (grade, paredes,
  jogador, porta), mas passa a ter uma lista de Objetos Interativos em
  vez de um único terminal.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O número de objetos interativos numa sala é sempre igual
  ao número de perguntas do pool daquela estação — 0 divergência.
- **SC-002**: 100% dos objetos pendentes mostram o indicador visual;
  0% dos objetos resolvidos mostram esse indicador.
- **SC-003**: A porta só destrava depois que 100% dos objetos da sala
  foram resolvidos — 0 casos de destravamento antecipado.
- **SC-004**: Nenhuma resposta errada impede o aluno de interagir com os
  demais objetos — 0 bloqueios (validado pela mesma simulação
  automatizada já usada na feature 008, estendida para múltiplos
  objetos).

## Assumptions

- **Um objeto por pergunta, mesmo sprite reaproveitado**: dado o catálogo
  reduzido do pacote de arte gratuito já aplicado (feature 009), todos os
  objetos interativos de uma sala reaproveitam o mesmo sprite de
  "terminal" já existente — só a posição e o indicador de pendência
  diferenciam um objeto do outro visualmente. Variedade visual entre tipos
  de objeto é um polimento futuro, fora do escopo desta rodada.
- **Indicador de pendência**: um emoji simples (ex.: ❗) desenhado acima
  do objeto enquanto pendente, removido ao ser resolvido — a escolha
  exata do emoji é um detalhe de apresentação, não um requisito
  travado.
- **"Nível de XP bom para avançar" = todos os objetos resolvidos**: o
  pedido original mencionava um "nível de XP bom" como critério de
  avanço; na conversa de esclarecimento, isso foi confirmado como
  "interagir com todos os objetos da sala" (responder a todas as
  perguntas, certas ou erradas), não um placar mínimo de acertos — o que
  preservaria o comportamento de pontuação/erro já existente e
  respeitaria o Princípio IV da constituição (erro nunca bloqueia
  progresso). Se um gate por desempenho for realmente desejado no
  futuro, precisa de uma spec própria com emenda explícita ao Princípio
  IV.
- **Escopo de sala**: esta feature se aplica à sala já existente (estação
  1 de uma trilha, feature 008 User Story 1). A replicação para as
  demais 7 estações + certificação final de cada trilha continua sendo
  escopo da feature 008 (User Stories 2-3, ainda pendentes de aprovação
  do usuário) — esta feature só garante que o padrão de objeto-por-
  pergunta já nasce pronto para ser reaproveitado quando isso acontecer
  (FR-008, User Story 3).
- **"Trilhas" no pedido original = ambientes/salas, não as duas trilhas
  pedagógicas**: confirmado em conversa — a escolha entre Arquitetura de
  Computadores e Linguagens de Programação continua acontecendo no
  formulário de login (feature 001/003), sem mudança nesta feature.
