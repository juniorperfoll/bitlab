# Research: Um Objeto Interativo por Pergunta na Sala 2D

## 1. Layout dos objetos na grade

**Decision**: em `construirSala(stage)`, calcular a lista de células
livres do interior da sala (excluindo paredes, a célula da porta e a
célula inicial do jogador), e distribuir os `stage.pool.length` objetos
igualmente espaçados nessa lista (`índice = i*(livres.length-1)/(n-1)`,
arredondado), na ordem em que a lista foi construída (varredura linha a
linha). Cada objeto guarda `idx` (posição no `pool` da estação, 0-based),
`x`/`y` (célula) e `resolvido` (booleano).

**Rationale**: determinístico (mesmo layout toda vez, fácil de testar),
sem sobreposição (todas as posições vêm de uma lista de células únicas),
e funciona para qualquer tamanho de pool (3 a 9 perguntas nas estações
hoje existentes) sem ajuste manual por estação — atende FR-008.

**Alternatives considered**:
- Posições fixas hardcoded por estação — rejeitado: contraria FR-008
  (layout deve derivar do tamanho do pool, não de valores fixos por
  estação), e não escala quando as demais 7 estações + boss de cada
  trilha forem construídas (feature 008, User Stories 2-3).
- Distribuição aleatória a cada carregamento — rejeitado: dificulta
  validação automatizada determinística (mesma motivação do movimento em
  grade decidido na feature 008, research.md #2) sem trazer benefício
  perceptível ao jogador.

## 2. Reaproveitar `fimFase()` sem modificá-la

**Decision**: `fimFase()` (que já calcula acertos/pontos/rank a partir de
`S.faseAcertos`/`S.faseXp`/`S.fila.length` e já desbloqueia a porta via o
hook existente `if(sala && sala.stage.id===f.id) sala.trancada = false;`)
**não é alterada**. A nova `fimObjetoSala()` — chamada quando o jogador
termina a pergunta de UM objeto — marca esse objeto como resolvido; se
ainda restam objetos pendentes, só fecha o overlay e volta para a sala
(sem tela de resumo); se era o último, **sintetiza** as variáveis de
sessão que `fimFase()` espera (`S.faseAcertos = st.acertos`, `S.faseXp =
st.xp`, `S.fila = new Array(st.total)` só para `.length` bater) a partir
dos contadores por estação (`S.estagios[id]`) — que já estão corretos,
porque `resolver()` (intocada) já incrementa `st.acertos`/`st.total`/
`st.xp` a cada pergunta respondida, seja ela parte de uma fila de 1
(objeto) ou de N (fluxo clássico das demais estações).

**Rationale**: `fimFase()` é reaproveitada 100% sem nenhuma linha
alterada — o único "adaptador" fica isolado em `fimObjetoSala()`, uma
função nova e pequena. Isso deixa claríssimo, numa eventual revisão, que
a lógica de pontuação/resumo/desbloqueio não foi tocada (FR-007), só a
forma como as perguntas chegam até ela.

**Alternatives considered**:
- Fazer `fimFase()` branchear entre "modo sala" e "modo clássico" —
  rejeitado: exigiria modificar uma função que já funciona e é
  compartilhada com o fluxo clássico (estações ainda em waypoints),
  aumentando o risco de regressão nessas estações sem necessidade.
- Somar/repassar `S.faseAcertos` manualmente a cada objeto (em vez de
  ler `S.estagios[id]`) — rejeitado: `S.estagios[id]` já faz exatamente
  essa soma (é para isso que existe), duplicar o acúmulo em outra
  variável seria redundante e arriscaria dessincronizar os dois.

## 3. `iniciarFase(id, objetoIdx?)` — parâmetro novo opcional

**Decision**: adicionar um segundo parâmetro opcional a `iniciarFase`.
Quando informado, `S.fila` vira `[ f.pool[objetoIdx]() ]` (só a pergunta
daquele objeto) e `sala.objetoAtual` é apontado para o objeto
correspondente. Quando omitido (todas as chamadas existentes: waypoints,
boss, "Refazer com outros valores"), o comportamento é **idêntico** ao de
hoje — inclusive `sala.objetoAtual` é explicitamente limpo (`= null`)
nesse caminho, para evitar que um objeto "preso" de uma visita anterior à
sala confunda `proxima()` numa estação clássica diferente.

**Rationale**: um parâmetro opcional com default seguro é a menor mudança
possível numa função já usada por vários chamadores (waypoints, boss,
refazer) — todos continuam funcionando sem alteração de assinatura.

**Alternatives considered**:
- Criar uma função `abrirObjetoSala()` totalmente separada, duplicando
  as ~6 linhas de inicialização de `iniciarFase` — rejeitado: mais
  código para manter sincronizado (ex.: se o cabeçalho `$('jgFase')`
  mudar, teria que mudar em dois lugares).

## 4. Reescrita do teste headless (`sala2d.test.js`)

**Decision**: o teste da feature 008 assumia 1 terminal abrindo a missão
inteira de uma vez — esse comportamento deixa de existir. O teste é
reescrito para: confirmar que existem N objetos (N = tamanho do pool da
estação 1), todos pendentes ao entrar; interagir com um objeto longe (nada
acontece); andar até um objeto, interagir, responder só aquela pergunta,
confirmar que só aquele objeto fica resolvido e os demais continuam
pendentes; repetir para os demais objetos; confirmar que a porta só
destrava depois do último.

**Rationale**: o teste existe para validar o comportamento real da sala
(FR-016 da feature 008, mantido); como o comportamento mudou de propósito
nesta feature, reescrevê-lo é o próprio objetivo da validação, não uma
mudança incidental.

**Alternatives considered**: nenhuma — manter o teste antigo sem
alteração validaria um comportamento que não existe mais.
