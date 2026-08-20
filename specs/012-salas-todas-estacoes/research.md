# Research: Todas as Estações como Salas 2D Encadeadas

## 1. Generalizar a fonte de perguntas da sala (`geradoresDaSala`)

**Decision**: extrair um helper `geradoresDaSala(stage, trilha)`:
- Se `stage.boss`: `shuffle(poolCompletoDaTrilha(trilha)).slice(0,
  PERGUNTAS_BOSS)` — a mesma lógica de sorteio já usada em
  `iniciarFase()` para o boss, só reaproveitada aqui.
- Senão: `stage.pool` diretamente (como hoje).

`construirSala()` chama isso uma vez e guarda o resultado em
`sala.geradores`. `iniciarFase(id, objetoIdx)` e
`tentarDeNovoObjetoSala()` passam a chamar `sala.geradores[idx]()` em
vez de `f.pool[idx]()` — funciona igual para estações comuns e,
adicionalmente, para o boss (que tem `pool:[]` no dado da estação — sem
isso, uma sala de boss teria 0 objetos).

**Rationale**: um único ponto de generalização evita duplicar a lógica
de "estação comum vs. boss" em 3 lugares diferentes (construção,
abertura de pergunta, retentativa). A seleção de quais 12 geradores
formam o boss fica fixada na construção da sala (mesma sala =
mesmas 12 perguntas possíveis ao longo da visita) — cada uma delas
ainda gera uma instância nova de valores a cada chamada/retentativa
(o gerador em si já randomiza), preservando o Princípio V.

**Alternatives considered**:
- Sortear os 12 geradores de novo a cada objeto aberto — rejeitado:
  poderia repetir o mesmo gerador em objetos diferentes da mesma sala,
  ou trocar o conjunto entre visitas à mesma sala sem motivo, mais
  confuso do que fixar o conjunto uma vez por sala.

## 2. Encadear salas pela porta

**Decision**: `proximaEstacaoDaTrilha(stage)` retorna
`trilha.stages[indexOf(stage)+1]` (ou `null` se for a última — o
boss). Uma nova `sairDaSalaAtual()` chama `mostrarSala(proxima)` se
existir; se `sala.stage.boss` (ou não há próxima), não faz nada — nesse
ponto `fimFase()` (chamado ao resolver o último objeto do boss) já
disparou `telaCertificacao()` automaticamente 600ms antes, então andar
até a porta do boss na prática não chega a importar. Isso substitui a
chamada a `mostrarMapaWaypoints()` dentro de `moverJogadorSala()`.

**Rationale**: reaproveita a mesma estrutura de dados
(`TRAILS[trilha].stages`, um array já em ordem) que o mapa de waypoints
sempre usou para sequenciar — "próxima estação" já é só "próximo item
do array".

**Alternatives considered**:
- Guardar um "próximo destino" explícito no dado da estação — rejeitado:
  redundante, a ordem do array já define a sequência.

## 3. `renderTrilha()` — entrar na primeira estação pendente

**Decision**: `trilha.stages.find(st => !S.estagios[st.id].feito)` —
se encontrar, mostra a sala dela; se todas estiverem feitas (trilha 100%
concluída), mostra a sala da última (boss), que já vai aparecer com a
porta destrancada e nada pendente — estado inofensivo, já que nesse
ponto o aluno normalmente já teria recebido o certificado.

**Rationale**: substitui o `if(!S.estagios[primeira.id].feito)` fixo em
`stages[0]` (feature 008) por uma busca genérica — mesma ideia, agora
cobrindo qualquer posição da trilha, não só a primeira.

**Alternatives considered**: nenhuma alternativa séria — é a extensão
natural do que já existia.

## 4. Variação visual por rodízio de temas

**Decision**: um array `SALA_TEMAS` com 5 combinações de piso/parede
(nomes de arquivo, todos já extraídos do mesmo pacote/licença da
feature 009: `piso.png`/`piso2.png`/`piso3.png` × `parede.png`/
`parede2.png`/`parede3.png`/`parede4.png`, cada tile já testado
individualmente quanto a repetição sem costura visível). `construirSala`
escolhe `SALA_TEMAS[indiceDaEstacaoNaTrilha % SALA_TEMAS.length]` e
guarda em `sala.tema`. `desenharSalaComSprites()` usa
`salaImagens[sala.tema.piso]`/`salaImagens[sala.tema.parede]` em vez de
chaves fixas `piso`/`parede`. Para o fallback geométrico
(`desenharSalaFormas()`, sem os arquivos de imagem), a cor da parede
também passa a variar por um pequeno array de cores fixas indexado do
mesmo jeito — mantendo FR-006/SC-003 válidos mesmo sem os arquivos de
arte presentes.

**Rationale**: dá variedade real (piso e/ou parede mudam entre estações
vizinhas) sem exigir uma combinação exclusiva desenhada para cada uma
das 22 estações — 5 temas rodando em rodízio já garante que estações
vizinhas quase sempre têm ao menos um elemento diferente (piso OU
parede), e a licença/crédito já cobre esses arquivos (mesma origem da
feature 009).

**Alternatives considered**:
- Uma combinação única por estação (22 combinações) — rejeitado por
  desproporcional ao pedido: exigiria extrair e validar
  individualmente ~20 novos pares de tile do pacote gratuito (processo
  manual de inspeção de pixels feito na feature 009), sem ganho
  perceptível sobre um rodízio de 5 temas já bem distintos entre si.

## 5. Carregamento dos 5 arquivos de tema novos

**Decision**: `SALA_ASSET_MANIFEST` passa a ter 9 entradas (piso,
piso2, piso3, parede, parede2, parede3, parede4, terminal, personagem);
`salaSpritesProntos` continua exigindo que **todos** carreguem com
sucesso antes de trocar do fallback geométrico para os sprites — mesmo
comportamento "tudo ou nada" já decidido na feature 009 (research.md
#3), agora só com mais arquivos no manifesto.

**Rationale**: manter o mesmo mecanismo de carregamento/fallback já
validado, só estendendo a lista — nenhuma lógica nova de carregamento
precisa ser escrita.

**Alternatives considered**: carregamento parcial por tema (só falha o
tema que estiver com arquivo ausente) — rejeitado por complexidade
desnecessária; os 5 arquivos novos já foram extraídos e testados junto
com este plano, o caminho "faltando arquivo" já é coberto pelo mesmo
fallback de sempre.
