# Research: Polimento Visual — Tela Principal e Logo UNIDAVI na Splash

## 1. Emblema estilizado em vez de arquivo de logo real

**Decision**: o "emblema da UNIDAVI" é construído em CSS/texto (fonte pixelada
`--disp`, cores `--unidavi`/`--unidavi-l` já existentes), não uma imagem/arquivo de
logo oficial.

**Rationale**: o projeto inteiro é um único arquivo HTML/CSS/JS sem nenhuma imagem
externa (Princípio II — "sem dependências via CDN", zero asset externo hoje).
Embutir um arquivo de logo exigiria: (a) receber o arquivo oficial do usuário, (b)
decidir formato (SVG inline é o único jeito de manter zero requisição de rede — PNG
precisaria virar base64, inflando o arquivo). Sem o arquivo em mãos, a alternativa
seria baixar a logo de algum lugar na web — arriscado (reprodução de marca sem
fonte confirmada) e não solicitado explicitamente. Um emblema estilizado no mesmo
padrão do "BIT LAB" já existente entrega o pedido (identidade visual da UNIDAVI na
splash, estilo 2D/retrô) sem esses riscos.

**Alternatives considered**:
- Pedir o arquivo de logo ao usuário antes de prosseguir — rejeitado nesta rodada
  porque o usuário pediu explicitamente para rodar plan/tasks/implement direto,
  sem pausa; a Assumption fica documentada no spec.md para o usuário corrigir
  depois se tiver o arquivo real.

## 2. Fundo ambiente animado da tela principal

**Decision**: fundo 100% CSS (gradientes radiais já existentes em `body` +
`@keyframes` novas movendo posição/opacidade lentamente, ou um punhado de
pseudo-elementos com "partículas" de circuito flutuando via `transform:translate`
em loop) — sem canvas, sem JS de alta frequência.

**Rationale**: a tela principal já tem gradientes radiais estáticos no `body`
(`radial-gradient(circle at 12% 8%, ...)`); animar a posição/opacidade desses
mesmos gradientes (ou adicionar 2-3 pontos de brilho extras que se movem devagar)
dá a sensação de "ambiente vivo" com o menor código possível, reaproveitando o que
já existe. `@keyframes`/`transition` em CSS são automaticamente desligados pela
regra global `prefers-reduced-motion` já presente no arquivo (FR-004), sem
precisar de nenhum código de acessibilidade novo.

**Alternatives considered**:
- Reaproveitar o motor de canvas do mapa 2D das trilhas para desenhar partículas na
  tela principal — rejeitado: motor mais pesado do que o necessário aqui (o mapa
  precisa de canvas porque desenha nós/personagem interativos; um fundo ambiente
  não interativo não precisa de rAF loop nem de canvas), e duplicaria lógica sem
  necessidade.

## 3. Transição animada entre "já tenho cadastro" / "primeiro acesso"

**Decision**: substituir o toggle instantâneo de `hidden` (que usa `display:none`)
por uma pequena função `trocarBloco(mostrar, esconder)`: adiciona uma classe CSS
`.saindo` no bloco atual (transição de opacidade/deslocamento via `transition`),
espera a duração da transição (`transitionend` ou `setTimeout` equivalente), só
então alterna `hidden` e aplica a classe de entrada no novo bloco.

**Rationale**: menor mudança possível no código já existente (`segAcesso`
`addEventListener`) — troca só a forma de alternar visibilidade, sem reestruturar o
HTML dos blocos de login/cadastro. `display:none` não pode ser animado
diretamente (por isso o pequeno atraso via JS antes de trocar o `hidden`), mas o
efeito visual (fade + leve deslocamento) já entrega a "transição suave" pedida.

**Alternatives considered**:
- Manter os dois blocos sempre no DOM e sobrepor via `position:absolute` com
  crossfade puro em CSS — rejeitado: os dois blocos têm alturas diferentes
  (cadastro tem mais campos que login), sobrepor exigiria fixar uma altura
  artificial ou aceitar um "salto" de layout, o que é pior do que o pequeno atraso
  via JS da abordagem escolhida.

## 4. Feedback de hover/focus em botões e campos

**Decision**: reforçar (não substituir) os estados `:hover`/`:focus` já existentes
em `.btn`, `.field input`, `.seg button` com uma transição mais perceptível (leve
`transform:scale`/brilho), usando as mesmas cores (`--copper`, `--led`) já em uso.

**Rationale**: o projeto já tem alguma resposta de hover (`.btn:hover` já move o
botão 1px, por exemplo) — o pedido é intensificar essa sensação de "interface de
jogo", não inventar um sistema novo. Reaproveitar as variáveis de cor existentes
mantém consistência visual sem introduzir paleta nova.

**Alternatives considered**: nenhuma alternativa séria — é um ajuste incremental
sobre CSS que já existe.
