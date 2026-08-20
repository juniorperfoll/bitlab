# Feature Specification: Arte Pixel do Pacote Modern Interiors (versão gratuita)

**Feature Branch**: `009-assets-moderninteriors`

**Created**: 2026-08-20

**Status**: Draft

**Input**: User description: "aplique a lib de pacote visual
https://limezu.itch.io/moderninteriors no projeto" — resolvido em conversa:
usar a **versão gratuita** do pacote (`Modern_Interiors_Free_v2.2.zip`),
com **crédito ao autor (LimeZu)** conforme exigido pela licença; o
repositório do projeto é **privado**, então não há restrição de
redistribuir os arquivos dentro do repositório.

## Nota de Contexto Importante

O pacote "Modern Interiors" (limezu.itch.io/moderninteriors) é pago
("pague o quanto quiser", mínimo US$ 1,50), com uma versão gratuita
reduzida (`Modern_Interiors_Free_v2.2.zip`) disponível separadamente.
**A licença da versão gratuita** (conforme `LICENSE.txt` incluído no
próprio pacote, lido depois que o arquivo foi disponibilizado pelo
usuário) é mais restrita do que a descrição geral da página do pacote
sugeria: permite uso e edição dos sprites **somente em projetos não
comerciais** — este projeto (material didático gratuito da UNIDAVI, sem
fins lucrativos) se enquadra nessa condição. **Exige crédito ao autor** e
**não permite revender os arquivos editados nem redistribuir os
originais** — como o repositório deste projeto é privado, versionar os
recortes usados aqui dentro não infringe essa restrição.

O arquivo `Modern_Interiors_Free_v2.2.zip` foi disponibilizado pelo
usuário na raiz do repositório depois da versão inicial desta spec, e as
4 peças necessárias (piso, parede, terminal, personagem) já foram
recortadas e aplicadas em `backend/public/assets/moderninteriors/` — a
dependência bloqueante original (arquivos ausentes) está resolvida nesta
rodada; ver `backend/public/assets/moderninteriors/LEIA-ME.md` para a
origem exata de cada recorte dentro do pacote.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sala da estação 1 com arte pixel real (Priority: P1) 🎯 MVP

Hoje a sala 2D da estação 1 (feature 008) é desenhada só com formas
geométricas simples (retângulos e círculos coloridos) no Canvas. Um aluno
que entra nessa sala passa a ver, em vez disso, piso, paredes/mobília e o
personagem desenhados com a arte pixel do pacote Modern Interiors —
mantendo exatamente a mesma jogabilidade (movimento em grade, colisão,
terminal, missão, porta) já validada na feature 008.

**Why this priority**: é o pedido central do usuário — dar uma aparência
de jogo real (não formas geométricas) à sala já aprovada. Fazer isso na
mesma sala-modelo da feature 008 evita retrabalho: valida o pipeline de
arte numa única sala antes de estender às demais.

**Independent Test**: com os arquivos de arte já disponíveis no projeto,
abrir a sala da estação 1 e confirmar visualmente que piso, paredes e
personagem usam a arte pixel do pacote (não mais formas geométricas
simples), sem que nenhum comportamento de movimento/colisão/missão/porta
tenha mudado em relação à feature 008.

**Acceptance Scenarios**:

1. **Given** os arquivos de arte do pacote estão disponíveis no projeto,
   **When** a sala da estação 1 é exibida, **Then** o piso e as paredes da
   sala são desenhados com tiles do pacote Modern Interiors, não com
   retângulos de cor sólida.
2. **Given** a sala carregada com a nova arte, **When** o aluno observa o
   personagem, **Then** ele é desenhado com um sprite do pacote (não mais
   um círculo verde simples).
3. **Given** a sala com a nova arte, **When** o aluno move o personagem,
   colide com paredes, interage com o terminal e conclui a missão,
   **Then** todo esse comportamento funciona exatamente como descrito na
   feature 008 — só a aparência visual muda.
4. **Given** os arquivos de arte **não** estão disponíveis (ex.: ambiente
   de alguém que clonou o repositório sem os assets), **When** a sala
   carrega, **Then** o jogo não trava nem quebra — cai de volta para a
   apresentação com formas geométricas da feature 008 (degradação
   graciosa), com um aviso apenas no console de desenvolvedor.

---

### User Story 2 - Crédito ao autor visível (Priority: P1)

Conforme exigido pela licença do pacote, o nome do autor (LimeZu) e um
link para a página original do pacote aparecem de forma visível no jogo e
na documentação do projeto.

**Why this priority**: é uma obrigação da licença de uso, não uma
melhoria opcional — sem isso, o uso do pacote não está em conformidade.

**Independent Test**: abrir o jogo e localizar, sem precisar procurar
muito, um texto de crédito mencionando "Modern Interiors" e "LimeZu";
conferir que o mesmo crédito aparece no README do projeto.

**Acceptance Scenarios**:

1. **Given** o jogo carregado, **When** o aluno rola até o rodapé (mesmo
   padrão dos créditos de referência bibliográfica já existentes hoje),
   **Then** encontra o crédito "Arte: Modern Interiors por LimeZu
   (limezu.itch.io/moderninteriors)".
2. **Given** o README do projeto, **When** alguém o lê, **Then** encontra
   a mesma menção de crédito ao pacote e ao autor.

---

### User Story 3 - Arte estendida às demais salas (Priority: P3)

Depois que a sala-modelo da estação 1 (User Story 1) estiver validada com
a nova arte, o mesmo padrão visual se aplica às demais salas do jogo à
medida que forem sendo construídas (feature 008, User Stories 2-4, ainda
não implementadas).

**Why this priority**: só faz sentido depois que a sala-modelo estiver
aprovada e depois que as demais salas existirem de fato (dependem da
feature 008 continuar) — não é um novo trabalho de mapa, é reaproveitar o
pipeline de arte desta feature nas salas que já estão planejadas.

**Independent Test**: N/A nesta rodada — esta user story descreve a
extensão futura, não trabalho a ser feito agora (ver Assumptions).

---

### Edge Cases

- Arquivos de arte ausentes no ambiente (dev local sem os assets, ou
  antes do usuário fornecê-los) — coberto pelo cenário 4 da User Story 1
  (degradação graciosa para formas geométricas).
- Tamanho de tile do pacote (16×16, 32×32 ou 48×48 disponíveis) precisa
  bater com o tamanho de célula já usado na grade da sala (feature 008) —
  ver Assumptions.
- Pacote gratuito tem conteúdo reduzido em relação ao pago — pode não ter
  tiles suficientes para todo tipo de cenário/estação; esta feature cobre
  só o necessário para a sala já existente (piso, parede, um objeto de
  mobília para o terminal, um personagem).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST renderizar o piso e as paredes da sala da
  estação 1 usando tiles de imagem do pacote Modern Interiors (versão
  gratuita), em vez das formas geométricas de cor sólida usadas hoje
  (feature 008).
- **FR-002**: O sistema MUST renderizar o personagem controlável usando
  um sprite de imagem do pacote, em vez do círculo simples usado hoje.
- **FR-003**: Toda a lógica de jogabilidade da sala (movimento em grade,
  colisão, proximidade ao terminal, abertura de missão em overlay,
  destravamento de porta) já validada na feature 008 MUST continuar
  funcionando sem alteração de comportamento — esta feature é
  exclusivamente de apresentação visual.
- **FR-004**: Se os arquivos de imagem do pacote não estiverem
  disponíveis no ambiente em execução, o sistema MUST continuar
  funcionando normalmente, caindo de volta para a apresentação em formas
  geométricas (feature 008) sem travar nem exibir erro para o aluno.
- **FR-005**: O jogo MUST exibir, de forma visível (mesmo padrão do
  rodapé de créditos/referências já existente), o crédito ao autor do
  pacote de arte: nome ("LimeZu") e a página de origem
  (limezu.itch.io/moderninteriors).
- **FR-006**: O README do projeto MUST conter a mesma informação de
  crédito ao autor do pacote de arte.
- **FR-007**: Os arquivos de imagem do pacote MUST ser adicionados dentro
  do repositório do projeto (privado — sem restrição de redistribuição
  pela licença), não referenciados por link externo/CDN.
- **FR-008**: Todo texto novo desta feature (créditos, eventuais rótulos)
  MUST estar em português brasileiro, exceto o nome próprio do pacote/
  autor, conforme o Princípio I da constituição.
- **FR-009**: A adição dos arquivos de imagem MUST continuar respeitando
  o Princípio II da constituição (front-end vanilla, sem framework, sem
  bundler/build) — os arquivos são consumidos como imagens estáticas via
  Canvas API (`drawImage`), não via nenhuma biblioteca de jogo nova.

### Key Entities

Não há entidade de dados nova — feature é de apresentação visual (assets
estáticos), sem novo estado de jogo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A sala da estação 1 é renderizada inteiramente com tiles/
  sprites de imagem do pacote (piso, paredes, personagem) — 0 formas
  geométricas de cor sólida remanescentes nessa sala, quando os arquivos
  de arte estão presentes.
- **SC-002**: Com os arquivos de arte ausentes, a sala continua abrindo e
  sendo jogável (mesma taxa de sucesso da feature 008) — 0 travamentos.
- **SC-003**: O crédito ao autor está visível em no máximo 1 rolagem de
  tela a partir do rodapé do jogo, e presente no README.
- **SC-004**: Todo o comportamento de jogabilidade validado pela
  simulação automatizada da feature 008 (`sala2d.test.js`) continua
  passando sem nenhuma alteração no arquivo de teste em si (só a
  aparência visual muda, o teste de estado/comportamento não precisa ser
  reescrito).

## Assumptions

- **Dependência de arquivo resolvida**: o usuário disponibilizou
  `Modern_Interiors_Free_v2.2.zip` na raiz do repositório após a versão
  inicial desta spec; os 4 recortes foram extraídos e aplicados em
  `backend/public/assets/moderninteriors/`. O mecanismo de carregamento/
  fallback gracioso (FR-004) continua existindo e sendo testável mesmo
  que os arquivos venham a faltar no futuro (ex.: checkout limpo sem essa
  pasta populada).
- **Tamanho de tile**: piso e parede usam tiles de **16×16 pixels**
  (menor tamanho disponível no pacote), redimensionados via Canvas para
  caber na grade de 80×47,5px por célula já usada na sala (feature 008).
  Terminal e personagem, por serem sprites de corpo/móvel inteiro no
  pacote original, são **16×32** (uma célula e meia de altura) —
  desenhados "de pé", pés na base da célula. `image-rendering:pixelated`
  mantém a nitidez de pixel art em vez de suavizar o redimensionamento.
- **Escopo do conteúdo do pacote usado**: por ser a versão gratuita
  (catálogo reduzido), esta feature usa só o necessário para a sala já
  existente — um tileset de piso, um tileset de parede, um objeto de
  mobília para representar o terminal, e um sprite de personagem (ou o
  gerador de personagem do pacote, se disponível na versão gratuita) —
  sem se comprometer a cobrir todo tipo de cenário das 8 estações + boss
  ainda não construídas.
- **Extensão às demais salas (User Story 3)**: fica documentada como
  direção futura, mas não é implementada nesta rodada — depende da
  feature 008 (User Stories 2-4) avançar primeiro, e da User Story 1
  desta feature estar aprovada visualmente pelo usuário.
- **Repositório privado**: confirmado pelo usuário — os arquivos de
  imagem do pacote podem ser versionados diretamente no repositório sem
  violar a cláusula de não-redistribuição da licença.
