# Research: Validação por Acerto nos Objetos Interativos

## 1. Onde interceptar "errou → tentar de novo" sem tocar `resolver()`/geradores

**Decision**: `resolver(ok)` (já existente, feature 008) ganha só 2
linhas: guardar `ultimaRespostaCorreta = ok` (nova variável de módulo) e
diferenciar o texto do botão quando a pergunta veio de um objeto de sala
(`sala.objetoAtual`). Toda a decisão de "avançar vs. tentar de novo"
fica em `proxima()`, que já tinha (desde a feature 010) um `if(sala &&
sala.objetoAtual)` para decidir entre `fimObjetoSala()` e `fimFase()` —
agora esse `if` também olha `ultimaRespostaCorreta` para escolher entre
`fimObjetoSala()` (acertou) e a nova `tentarDeNovoObjetoSala()` (errou).

**Rationale**: `resolver()` já calcula `ok` e já teria que expor esse
resultado de algum jeito para `proxima()` decidir — guardar num módulo
var é a menor mudança possível, e nenhuma linha de cálculo de pontuação/
correção é tocada, só a leitura do resultado já calculado.

**Alternatives considered**:
- Fazer `proxima()` reler `S.fila[0]` e re-executar a checagem de
  correção — rejeitado: duplicaria a lógica de correção (que já rodou
  dentro de `avaliar()`/`resolver()`), indo contra FR-008.

## 2. Regenerar a pergunta em vez de repetir a mesma

**Decision**: `tentarDeNovoObjetoSala()` chama `f.pool[obj.idx]()` de
novo (mesmo gerador, nova chamada — nova randomização), em vez de
reexibir a mesma instância de pergunta.

**Rationale**: o Princípio V já exige que os geradores produzam valores
aleatorizados a cada chamada — reaproveitar isso na retentativa é
gratuito (nenhum código novo de randomização) e evita que o aluno decore
a resposta certa de uma instância específica sem entender o cálculo,
mantendo o espírito do princípio.

**Alternatives considered**:
- Reexibir a mesma pergunta (mesmos valores) até acertar — rejeitado:
  mais fácil de "decorar" a resposta sem aprender o porquê, o que vai
  contra a motivação pedagógica do Princípio IV recém-emendado (a
  validação deve reflitir domínio real do conteúdo).

## 3. Consequência aceita: `total` de tentativas pode ficar maior que o número de objetos

**Decision**: `S.estagios[id].total`/`.acertos` (já incrementados a cada
chamada de `resolver()`, desde antes desta feature) passam a poder
contar mais tentativas do que objetos existem na sala, quando há
retentativas. O resumo final (`fimFase()`, intocado) mostra esse total
real de tentativas, não mais necessariamente igual ao número de objetos.

**Rationale**: é a leitura mais honesta do que aconteceu — "quantas
vezes o aluno tentou, quantas acertou" — e não exige nenhuma mudança em
`fimFase()` (que já lê `S.estagios[id]` desde a feature 010). O teste
desta feature precisa parar de assumir `total === número de objetos`
sempre (só é verdade quando não há nenhuma retentativa).

**Alternatives considered**:
- Contar só 1 tentativa por objeto no total final (ignorando erros
  intermediários) — rejeitado: exigiria alterar `resolver()` para não
  incrementar `st.total` em toda chamada, mudança mais invasiva numa
  função compartilhada com o fluxo clássico, sem necessidade real (a
  spec não pede essa contagem específica).
