# Feature Specification: Polimento Visual — Tela Principal Mais Fluida e Logo da UNIDAVI na Splash

**Feature Branch**: `006-polish-visual-jogo-2d`

**Created**: 2026-08-19

**Status**: Draft

**Input**: User description: "melhore a tela principal após o splash screen, deixei o visual mais fluído de dentro da ideia de um jogo 2d, no splash screen adicione a logo da unidavi no estilo de games 2d"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tela principal com sensação de jogo 2D (Priority: P1)

Como aluno abrindo o BitLab, quero que a tela principal (a tela de identificação
que aparece logo após a splash) transmita a sensação de estar entrando num jogo —
com movimento, transições suaves e feedback visual nos elementos — em vez de
parecer um formulário estático, para que a experiência combine com o resto do jogo
(que já tem um mapa 2D animado nas trilhas).

**Why this priority**: é o pedido central da feature — sem isso, a tela mais vista
pelo aluno (a primeira depois da splash) continua destoando visualmente do resto do
jogo.

**Independent Test**: pode ser testado isoladamente abrindo o jogo, passando pela
splash, e observando a tela de identificação: ela deve ter pelo menos um elemento de
fundo com movimento sutil, transições animadas ao trocar de estado (ex.: alternar
entre "já tenho cadastro" e "primeiro acesso"), e feedback visual ao interagir com
botões/campos — sem depender de mais nenhuma outra tela do jogo estar pronta.

**Acceptance Scenarios**:

1. **Given** o aluno acabou de dispensar a splash, **When** a tela principal
   aparece, **Then** ela tem um elemento de fundo ou ambientação com movimento sutil
   e contínuo (não uma imagem/fundo 100% estático), consistente com a estética já
   usada no mapa das trilhas.
2. **Given** o aluno está na tela principal, **When** ele alterna entre "já tenho
   cadastro" e "primeiro acesso", **Then** a troca acontece com uma transição
   animada (não uma troca instantânea/sem transição).
3. **Given** o aluno interage com um botão ou campo da tela principal, **When** ele
   passa o mouse ou foca o elemento, **Then** há uma resposta visual de feedback
   (ex.: leve destaque, movimento), reforçando a sensação de interface de jogo.
4. **Given** um usuário com preferência do sistema por "reduzir movimento"
   ativada, **When** ele abre a tela principal, **Then** as animações não essenciais
   são desativadas automaticamente (mesmo comportamento de acessibilidade já
   aplicado no resto do jogo).

---

### User Story 2 - Emblema da UNIDAVI na splash, no estilo do jogo (Priority: P2)

Como aluno vendo a tela de splash pela primeira vez, quero identificar visualmente
que o BitLab é um material da UNIDAVI através de um emblema no mesmo estilo visual
retrô/pixel do resto do jogo, para reforçar a identidade institucional logo na
primeira tela.

**Why this priority**: é o segundo pedido explícito da feature, mas depende de uma
decisão de conteúdo (ver Assumptions) que não bloqueia a User Story 1 — por isso
prioridade um degrau abaixo.

**Independent Test**: pode ser testado isoladamente abrindo a splash e conferindo
que um emblema/selo da UNIDAVI aparece, visualmente coerente com o estilo já usado
no emblema "BIT LAB" da mesma tela (fonte pixelada, brilho, paleta de cores do
jogo).

**Acceptance Scenarios**:

1. **Given** um visitante abrindo o jogo pela primeira vez, **When** a tela de
   splash aparece, **Then** um emblema da UNIDAVI é exibido, estilizado no mesmo
   padrão visual "retrô/2D" já usado no emblema "BIT LAB" da mesma tela (não uma
   logo institucional "de escritório", lisa/corporativa).
2. **Given** o emblema da UNIDAVI está visível na splash, **When** a splash é
   dispensada, **Then** o emblema desaparece junto com o resto da splash (não
   persiste nas telas seguintes) — mesmo comportamento das outras informações da
   splash hoje.

---

### Edge Cases

- O que acontece em conexões/dispositivos mais lentos? As animações novas MUST
  usar só CSS/canvas leve (mesmo padrão já usado no mapa 2D das trilhas) — sem
  vídeo, sem imagem pesada, sem nova dependência de rede.
- O que acontece com quem já tinha a splash memorizada e passa rápido por ela? O
  emblema da UNIDAVI deve ser reconhecível mesmo numa exibição rápida — não pode
  depender de uma animação longa para "revelar" o emblema.
- O que acontece nas outras telas do jogo (trilha, pergunta, certificado)? Fora de
  escopo desta especificação — o pedido foi especificamente sobre a tela principal
  (pós-splash) e a própria splash; as demais telas não mudam.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A tela principal (identificação do aluno, exibida após a splash)
  MUST ter um elemento visual de fundo/ambientação com movimento sutil e contínuo,
  em vez de um fundo inteiramente estático.
- **FR-002**: A troca entre os modos "já tenho cadastro" e "primeiro acesso" na
  tela principal MUST usar uma transição animada, não uma troca instantânea.
- **FR-003**: Botões e campos interativos da tela principal MUST ter feedback
  visual animado ao receber foco/hover/interação (além do que já existe hoje).
- **FR-004**: Toda animação nova introduzida por esta feature MUST respeitar a
  preferência de sistema "reduzir movimento" (`prefers-reduced-motion`), mesmo
  padrão de acessibilidade já aplicado no resto do jogo.
- **FR-005**: A tela de splash MUST exibir um emblema visual da UNIDAVI, no mesmo
  estilo "retrô/2D" (fonte pixelada, cores e efeitos já usados) do emblema "BIT LAB"
  já existente na mesma tela.
- **FR-006**: O emblema da UNIDAVI MUST desaparecer junto com o restante da splash
  ao ser dispensada — não pode persistir nas telas seguintes do jogo.
- **FR-007**: Nenhuma funcionalidade existente (cadastro, login, seleção de trilha,
  tabelas de apoio) pode ser removida, escondida ou ter seu comportamento alterado
  por esta feature — é uma melhoria puramente visual/de experiência.
- **FR-008**: Todo texto novo (se houver) MUST estar em português brasileiro
  (Princípio I da constituição do projeto).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das aberturas da tela principal exibem pelo menos um elemento
  de fundo com movimento (não estático).
- **SC-002**: 100% das trocas entre "já tenho cadastro"/"primeiro acesso" usam
  transição animada em vez de corte instantâneo.
- **SC-003**: Com "reduzir movimento" ativado no sistema, 0% das animações não
  essenciais introduzidas por esta feature são executadas.
- **SC-004**: 100% das exibições da splash mostram o emblema da UNIDAVI, visível e
  legível mesmo numa passagem rápida pela tela.
- **SC-005**: Nenhuma regressão: todas as funcionalidades existentes (cadastro,
  login, seleção de trilha) continuam funcionando exatamente como antes desta
  feature.

## Assumptions

- **Emblema da UNIDAVI, não a logo institucional oficial em arquivo**: o projeto
  não tem nenhum arquivo de logo/imagem da UNIDAVI hoje (é um único arquivo
  HTML/CSS/JS, sem imagens externas, por decisão do Princípio II da constituição —
  "sem dependências via CDN"). Sem receber um arquivo oficial de logo, o "emblema
  da UNIDAVI" desta feature é um elemento estilizado feito em CSS/texto (mesmo
  recurso já usado para o emblema "BIT LAB" na splash — fonte pixelada, brilho,
  paleta do jogo), não uma reprodução da marca oficial da instituição. Se o usuário
  tiver um arquivo de logo oficial para usar, isso fica para uma iteração futura
  (embutir como imagem exigiria decidir formato/tamanho e mudaria essa suposição).
- **"Mais fluido"/"estilo de jogo 2D" traduzido em comportamento observável**:
  como o pedido original é subjetivo, esta especificação o traduz em 3
  comportamentos concretos e testáveis (fundo com movimento, transições animadas,
  feedback de interação) em vez de tentar especificar "fluidez" como conceito
  solto — a fase de planejamento/implementação tem liberdade para escolher o efeito
  visual exato, desde que cumpra esses três requisitos.
- **Escopo limitado a splash + tela principal**: outras telas do jogo (mapa da
  trilha, pergunta, certificado, painel administrativo) não são tocadas por esta
  feature (ver Edge Cases) — o pedido foi especificamente sobre essas duas telas.
