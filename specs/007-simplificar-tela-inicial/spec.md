# Feature Specification: Tela Inicial Simplificada e Neutra entre Trilhas

**Feature Branch**: `007-simplificar-tela-inicial`

**Created**: 2026-08-19

**Status**: Draft

**Input**: User description: "a tela inicial do jogo ficou muito específica da primeira versao que era de arquitetura de computadores onde apresenta a rota, deixe a tela inicial mais simples, focando no formulário de identificação do operador"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tela inicial neutra entre as duas trilhas (Priority: P1)

Um aluno (de qualquer uma das duas trilhas, Arquitetura de Computadores ou
Linguagens de Programação e Paradigmas) abre o jogo depois da splash e vê uma
tela inicial simples, sem conteúdo promocional detalhado de nenhuma trilha
específica e sem uma prévia de rota fixa com 8 estações — o foco visual e de
espaço vai para o formulário de identificação (login ou primeiro acesso).

**Why this priority**: hoje a tela inicial mostra um resumo de conteúdo e uma
"prévia de rota" com 8 estações fixas que descrevem exclusivamente a trilha
Arquitetura de Computadores (sistemas de numeração, ASCII, bases, negativos),
mesmo que o aluno vá escolher a trilha Linguagens de Programação e Paradigmas
no mesmo formulário logo abaixo. Isso é enganoso/desatualizado e polui a tela
que devia estar focada em identificar o operador. É o pedido central desta
feature.

**Independent Test**: abrir o jogo, passar da splash, chegar na tela inicial —
confirmar que não aparece mais o bloco de "SUA ROTA" com as 8 estações fixas
nem o grid de 4 perguntas de conteúdo específicas de Arquitetura de
Computadores, e que o formulário de identificação do operador (login/
cadastro) é o elemento central e visível sem precisar rolar a página em uma
tela comum.

**Acceptance Scenarios**:

1. **Given** o aluno acabou de dispensar a splash, **When** a tela inicial
   carrega, **Then** não aparece nenhum texto ou lista que descreva o
   conteúdo específico de uma das duas trilhas (nem "SUA ROTA" com estações
   fixas, nem perguntas de exemplo de conteúdo).
2. **Given** a tela inicial carregada, **When** o aluno olha a tela sem
   rolar, **Then** o formulário de identificação do operador (segmento
   "Já tenho cadastro" / "Primeiro acesso" e os campos correspondentes) é o
   elemento principal e visível.
3. **Given** a tela inicial simplificada, **When** o aluno alterna entre as
   trilhas no seletor de trilha do formulário de login, **Then** nada na
   tela inicial contradiz ou favorece visualmente uma trilha em detrimento
   da outra.

---

### User Story 2 - Boas-vindas curtas mantêm a identidade do jogo (Priority: P2)

O aluno ainda reconhece que está no BitLab e entende, em uma frase, o
propósito geral do jogo (fixação de conteúdo por trilhas), mesmo com a tela
simplificada — a simplificação não deve deixar a tela vazia ou fria a ponto
de parecer um formulário genérico sem contexto.

**Why this priority**: importante para manter a identidade visual/pedagógica
do jogo, mas secundário ao pedido central de simplificação — é um ajuste de
polimento sobre o resultado da User Story 1, não um requisito novo de
funcionalidade.

**Independent Test**: com a tela inicial já simplificada (US1 aplicada),
confirmar visualmente que ainda existe uma frase curta de boas-vindas/
propósito acima do formulário, sem detalhar conteúdo de nenhuma trilha
específica.

**Acceptance Scenarios**:

1. **Given** a tela inicial simplificada, **When** o aluno a visualiza,
   **Then** existe uma frase curta (título e/ou subtítulo) que identifica o
   jogo e seu propósito geral, sem citar conteúdo específico de uma trilha.

---

### Edge Cases

- O que acontece com o restante do fluxo (seleção de trilha dentro do
  formulário de login, geração de perguntas, mapa 2D de cada trilha) quando a
  tela inicial some com o resumo de conteúdo? Nada muda — a seleção de trilha
  continua ocorrendo dentro do próprio formulário de login (campo "Trilha"
  já existente), e o conteúdo/perguntas de cada trilha continuam sendo
  apresentados normalmente depois do login, dentro da tela de mapa da trilha
  escolhida.
- Um aluno que só conhecia a tela antiga (com a prévia de rota) ainda
  consegue se identificar e entrar? Sim — o formulário de identificação não
  muda de comportamento nesta feature, só a apresentação visual ao redor
  dele.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A tela inicial (exibida após a splash) MUST NOT apresentar uma
  prévia de rota/estações fixas que descreva o conteúdo específico de uma
  única trilha.
- **FR-002**: A tela inicial MUST NOT apresentar um resumo de conteúdo
  pedagógico (perguntas de exemplo, tópicos) específico de uma única trilha.
- **FR-003**: A tela inicial MUST manter uma frase curta de boas-vindas/
  identidade do jogo, neutra entre as duas trilhas (sem citar conteúdo
  específico de nenhuma delas).
- **FR-004**: A tela inicial MUST apresentar o formulário de identificação do
  operador (segmento "Já tenho cadastro"/"Primeiro acesso" e os campos de
  login ou cadastro) como elemento central e com destaque visual.
- **FR-005**: A remoção do conteúdo promocional/prévia de rota MUST NOT
  alterar o comportamento funcional do formulário de identificação (login,
  cadastro, seleção de trilha dentro do formulário, troca de senha) — a
  mudança é exclusivamente de apresentação da tela inicial.
- **FR-006**: Todo texto novo ou ajustado nesta tela MUST estar em português
  brasileiro, conforme o Princípio I da constituição do projeto.

### Key Entities

Não há entidade de dados nova — feature é puramente de apresentação sobre a
tela inicial já existente.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Ao abrir a tela inicial em uma janela de tela comum de
  notebook/desktop, o formulário de identificação do operador é visível
  sem precisar rolar a página.
- **SC-002**: Nenhum texto da tela inicial menciona conteúdo específico de
  apenas uma das duas trilhas (verificável por leitura direta da tela).
- **SC-003**: O fluxo de login, cadastro e troca de senha continua
  funcionando exatamente como antes desta feature (0 regressões
  funcionais).

## Assumptions

- A simplificação se aplica apenas à tela inicial (`#telaInicio`, o bloco
  hoje chamado de `.hero` com título, tagline, grid de perguntas e a "prévia
  de rota"). As demais telas (mapa 2D de cada trilha, jogo em si, tela de
  certificado) não são afetadas.
- O campo "Trilha" dentro do formulário de login/cadastro é mantido — é o
  único lugar onde a escolha entre as duas trilhas continua acontecendo; a
  simplificação remove apenas o conteúdo promocional/prévia acima do
  formulário, não a escolha de trilha em si.
- Uma frase curta de boas-vindas neutra (identidade do jogo, sem detalhar
  conteúdo) é suficiente para manter contexto — não é necessário nenhum
  outro elemento visual substituto para o que foi removido (nem versão
  "genérica" da prévia de rota, nem grid de perguntas neutro).
- Esta feature reaproveita o fundo animado e as transições já implementadas
  na feature 006 (polimento visual) — não os desfaz.
