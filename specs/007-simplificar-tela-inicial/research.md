# Research: Tela Inicial Simplificada e Neutra entre Trilhas

## 1. O que remover vs. o que manter no bloco `.hero`

**Decision**: remover `.featgrid` (grid de 4 `.featcard` com perguntas de
exemplo de Arquitetura de Computadores) e `.prevwrap` (label "SUA ROTA" +
`.prevrail` com 8 `.prevchip` fixos + `.boss2`). Manter `.title` e
`.tagline`, reescrevendo o texto de ambos para uma frase curta e neutra entre
as duas trilhas (sem citar conversões, ASCII, paradigmas, etc.).

**Rationale**: `.featgrid` e `.prevwrap` são os dois blocos que descrevem
conteúdo específico de uma única trilha (Arquitetura de Computadores) —
exatamente o que o pedido do usuário identificou como desatualizado/
enganoso, já que o formulário logo abaixo permite escolher entre duas
trilhas. `.title`/`.tagline` já existem e cumprem o papel de identidade do
jogo (US2) — só precisam de texto neutro, não remoção.

**Alternatives considered**:
- Tornar `.featgrid`/`.prevwrap` dinâmicos por trilha (mudar conforme a
  trilha selecionada no formulário) — rejeitado: contraria o pedido
  explícito do usuário de "deixar mais simples", adicionaria JS novo para
  sincronizar com `segTrilhaLogin`, e duplicaria informação que já existe
  dentro de cada trilha (mapa 2D já mostra as estações reais ao entrar).
- Remover `.title`/`.tagline` também, deixando só o formulário — rejeitado:
  spec (US2) explicitamente pede manter uma frase curta de identidade do
  jogo para a tela não parecer um formulário genérico sem contexto.

## 2. CSS órfão (`.featgrid`, `.prevwrap`, `.prevchip`, `.prevarrow`, `.boss2`)

**Decision**: não remover as regras CSS correspondentes nesta feature — só o
HTML que as usa.

**Rationale**: menor mudança possível, zero risco de quebrar outra tela que
porventura reutilize as mesmas classes. Limpeza de CSS não referenciado é
melhoria de manutenção, não parte do pedido do usuário (que é sobre o que
aparece na tela), e pode ser feita numa passada de polimento futura sem
pressa.

**Alternatives considered**:
- Remover o CSS junto — rejeitado por não ser necessário para atender a
  spec e aumentar a superfície de mudança/risco sem benefício visível ao
  usuário final.
