# Feature Specification: Reposicionar Identidade do BitLab para Sistemas de Informação

**Feature Branch**: `005-splash-foco-si`

**Created**: 2026-08-19

**Status**: Draft

**Input**: User description: "na tela de splash screen altere a menção exclusiva de arquitetura de computadores e o bit lab vai ser focado em 'Sistemas de Informação'"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Primeira impressão reflete o curso, não uma disciplina só (Priority: P1)

Como aluno ou visitante abrindo o BitLab pela primeira vez, quero que a tela de
abertura (splash) e a identidade visível do produto deixem claro que ele serve o
curso de Sistemas de Informação como um todo, para não pensar que é uma ferramenta
exclusiva da disciplina de Arquitetura de Computadores — hoje o jogo já tem uma
trilha de Linguagens de Programação e Paradigmas (LPP) também.

**Why this priority**: é o pedido central da feature — sem essa mudança, a primeira
coisa que qualquer aluno vê continua anunciando só "Arquitetura de Computadores",
contradizendo o fato de o BitLab já cobrir mais de uma disciplina.

**Independent Test**: pode ser testado isoladamente abrindo o jogo do zero e
conferindo que nenhum texto da tela de splash nem da barra de identidade
(cabeçalho persistente, mesma família de "primeira impressão" da splash) menciona
"Arquitetura de Computadores" como se fosse o único foco do produto.

**Acceptance Scenarios**:

1. **Given** um visitante abrindo o BitLab pela primeira vez, **When** a tela de
   splash aparece, **Then** o subtítulo e o rodapé da splash identificam o produto
   com o curso de Sistemas de Informação, não com uma disciplina específica.
2. **Given** o aluno já passou da splash e está na tela inicial do jogo, **When** ele
   olha a barra de identidade no topo da página, **Then** o título e a legenda ali
   também não citam exclusivamente "Arquitetura de Computadores".
3. **Given** o aluno chega na tela de escolha de trilha, **When** ele visualiza as
   opções, **Then** as trilhas continuam nomeadas normalmente ("Arquitetura de
   Computadores", trilha de LPP) — só a identidade "de capa" do produto muda, não o
   nome de cada trilha individual.

---

### Edge Cases

- O rodapé de créditos (parte de baixo da tela inicial) e o título da aba do
  navegador também citam "Arquitetura de Computadores" hoje. Não fazem parte do
  pedido original (que foi especificamente sobre a splash), então ficam fora do
  escopo desta especificação — podem virar um ajuste rápido separado depois, se o
  usuário quiser consistência total.
- O nome de cada trilha individual (ex.: "Arquitetura de Computadores" como nome de
  uma trilha específica) continua existindo normalmente na seleção de trilha e
  dentro do jogo — a mudança aqui é só sobre a identidade geral do produto, não
  sobre renomear a trilha em si.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O subtítulo da tela de splash MUST deixar de citar exclusivamente
  "Arquitetura de Computadores" e MUST refletir que o BitLab serve o curso de
  Sistemas de Informação.
- **FR-002**: O rodapé da tela de splash MUST seguir a mesma regra do FR-001.
- **FR-003**: O título e a legenda da barra de identidade persistente (visível
  durante o jogo, logo após a splash) MUST seguir a mesma regra do FR-001 — é a
  mesma categoria de "primeira impressão exclusiva" que a splash, e ficaria
  inconsistente corrigir uma e não a outra.
- **FR-004**: A mudança MUST ser só de texto/identidade — nenhuma trilha, tela ou
  funcionalidade existente pode ser removida, escondida ou ter seu comportamento
  alterado.
- **FR-005**: Todo texto novo ou alterado MUST estar em português brasileiro
  (Princípio I da constituição do projeto).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das telas de abertura (splash e barra de identidade persistente)
  deixam de citar exclusivamente "Arquitetura de Computadores" como identidade do
  produto.
- **SC-002**: Um usuário consegue identificar, só pela tela de splash, que o BitLab
  serve o curso de Sistemas de Informação, sem precisar navegar mais fundo no jogo.
- **SC-003**: Nenhuma funcionalidade existente (seleção de trilha, jogo, certificado,
  login, painel administrativo) muda de comportamento — a mudança é 100% de texto.

## Assumptions

- O texto exato de reposicionamento (ex.: "Sistemas de Informação" sozinho, ou
  "Bacharelado em Sistemas de Informação") fica a critério da fase de
  implementação, desde que não cite exclusivamente uma única disciplina como se
  fosse o foco inteiro do produto.
- Escopo inclui tanto a tela de splash quanto a barra de identidade persistente do
  topo da página (mesma função de "primeira impressão"/identidade do produto) —
  não só o elemento chamado literalmente de "splash" no código, já que deixar
  essas duas mensagens inconsistentes contradiria o objetivo do pedido.
- Rodapé de créditos e título da aba do navegador ficam de fora desta
  especificação (ver Edge Cases) — não foram mencionados no pedido original.
- Nenhuma mudança de dado, backend ou lógica de jogo — é uma feature só de
  conteúdo/copy no front-end.
