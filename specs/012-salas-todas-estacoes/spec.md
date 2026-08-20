# Feature Specification: Todas as Estações como Salas 2D Encadeadas

**Feature Branch**: `012-salas-todas-estacoes`

**Created**: 2026-08-20

**Status**: Draft

**Input**: User description: "todas as estações devem ser baseadas na
estacao 1 mas com cenários 2d distindos" — todas as estações de uma
trilha (não só a primeira) passam a ser salas 2D no mesmo padrão já
aprovado da sala 1 (features 008-011), mas cada uma com uma aparência de
cenário diferente, não uma cópia visual idêntica repetida.

## Nota de Contexto Importante

Esta feature completa o trabalho que ficou pendente de aprovação desde a
feature 008 (User Stories 2 e 3: replicar o padrão de sala para as
demais estações e para a sala-chefe de certificação). Como o usuário
seguiu testando, iterando e pedindo evoluções em cima da sala 1
(features 009, 010, 011) ao longo da sessão, e agora pede
explicitamente a réplica para "todas as estações", isso é tratado como
a aprovação esperada — sem gerar uma nova pergunta de confirmação.

O motor de sala (grade, colisão, objetos interativos — um por pergunta
—, indicador de pendência, validação por acerto com retentativa, porta)
já é genérico sobre `TRAILS[trilha].stages` desde a feature 008; esta
feature estende o **alcance** de onde ele é usado (hoje só a estação 1
de uma trilha) para **todas** as estações de **ambas** as trilhas
(Arquitetura de Computadores e Linguagens de Programação e Paradigmas),
incluindo a estação de Certificação Final (sala-chefe) de cada uma — sem
alterar o mecanismo em si.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Estações encadeadas em sequência de salas (Priority: P1) 🎯 MVP

Um aluno percorre uma trilha inteira sem nunca ver o mapa de waypoints —
completa a sala da estação 1, atravessa a porta, cai direto na sala da
estação 2, e assim por diante até a última estação normal da trilha.

**Why this priority**: é o pedido central — hoje só a estação 1 é uma
sala; as demais (2 em diante) ainda usam o mapa de waypoints antigo.

**Independent Test**: completar a sala da estação 1 e confirmar que
atravessar a porta leva direto à sala da estação 2 (não ao mapa antigo);
repetir até a penúltima estação normal.

**Acceptance Scenarios**:

1. **Given** o aluno completa todos os objetos da sala da estação N,
   **When** atravessa a porta destrancada, **Then** aparece a sala da
   estação N+1 (não o mapa de waypoints).
2. **Given** um aluno entra na trilha e já tinha progresso anterior
   (algumas estações já concluídas), **When** o mapa carrega, **Then**
   ele aparece direto na sala da primeira estação **ainda não
   concluída** — sem precisar repassar pelas já feitas.
3. **Given** as 8 estações normais da trilha concluídas, **When** o
   aluno atravessa a última porta, **Then** aparece a sala de
   Certificação Final (User Story 2).

---

### User Story 2 - Sala-chefe de Certificação Final (Priority: P1)

A última "sala" de cada trilha é a Certificação Final — funciona igual
às demais (objetos interativos, indicador, validação por acerto), mas
com as 12 perguntas sorteadas de todos os pools da trilha e pontuação
dobrada, e ao concluir mostra o mesmo relatório/código de presença já
existentes.

**Why this priority**: fecha o ciclo da trilha inteira nas salas — sem
isso, o aluno chegaria ao fim das estações normais e ficaria sem
caminho.

**Independent Test**: completar as 8 estações normais, entrar na sala de
Certificação Final, resolver os 12 objetos, confirmar pontuação dobrada
e que o relatório/código de presença aparecem exatamente como hoje.

**Acceptance Scenarios**:

1. **Given** as estações normais concluídas, **When** a sala de
   Certificação Final carrega, **Then** ela tem 12 objetos interativos
   (não o número de perguntas de uma estação comum).
2. **Given** um objeto da Certificação Final resolvido corretamente,
   **When** a pontuação é somada, **Then** vale o dobro dos pontos de
   uma pergunta comum (mesma regra já existente).
3. **Given** todos os 12 objetos resolvidos, **When** o último é
   concluído, **Then** aparece a mesma tela de relatório/código de
   presença já existente, sem alteração.

---

### User Story 3 - Cenários visualmente distintos entre estações (Priority: P2)

As salas não são todas visualmente idênticas — o piso e as paredes
variam de estação para estação, dando sensação de ambientes diferentes
ao longo da trilha, mesmo reaproveitando o mesmo pacote de arte já
aplicado (feature 009).

**Why this priority**: é o pedido explícito do usuário ("cenários 2d
distintos"), mas é uma camada de apresentação sobre a User Story 1 — a
trilha já funciona sem isso, só fica visualmente repetitiva.

**Independent Test**: percorrer 3-4 salas seguidas e confirmar que nem
todas têm exatamente a mesma combinação de piso/parede.

**Acceptance Scenarios**:

1. **Given** o aluno percorre várias salas em sequência, **When**
   compara a aparência de cada uma, **Then** ao menos piso ou parede
   varia entre salas vizinhas (não é sempre a mesma combinação).
2. **Given** os arquivos de arte do pacote não estão presentes (mesmo
   fallback já existente, feature 009), **When** as salas carregam,
   **Then** continuam funcionando com o desenho geométrico, mantendo a
   variação de cor já usada por estação hoje (cada estação já tem uma
   cor própria, `stage.cor`).

---

### User Story 4 - Vale para as duas trilhas (Priority: P1)

O mesmo comportamento (User Stories 1-3) vale tanto para a trilha
Arquitetura de Computadores (8 estações + certificação) quanto para
Linguagens de Programação e Paradigmas (12 estações + certificação) —
sem lógica duplicada por trilha.

**Why this priority**: o motor já é genérico sobre `TRAILS[trilha]`
desde a feature 008; garantir que as duas trilhas se beneficiam sem
trabalho extra é o que torna a extensão de baixo risco.

**Independent Test**: repetir o teste da User Story 1 escolhendo a
trilha Linguagens de Programação e Paradigmas no cadastro/login.

**Acceptance Scenarios**:

1. **Given** um aluno na trilha Linguagens de Programação e Paradigmas,
   **When** percorre as estações, **Then** o mesmo comportamento de
   salas encadeadas e sala-chefe se aplica, sem diferença de
   funcionamento em relação à trilha de Arquitetura.

---

### Edge Cases

- Estação com pool pequeno (algumas estações de Linguagens têm só 3-4
  perguntas) — sala com poucos objetos, mecanismo já suporta isso
  (feature 010, FR-008).
- Aluno já tinha progresso em várias estações antes desta feature —
  entra direto na primeira ainda não concluída (User Story 1, cenário
  2); estações já concluídas não são reabertas nem reavaliadas.
- Mapa de waypoints antigo deixa de ser alcançado no fluxo normal — ver
  Assumptions (código não é removido nesta rodada, só deixa de ser
  chamado).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST usar o motor de sala (feature 008-011) para
  **todas** as estações de uma trilha — não só a primeira.
- **FR-002**: Ao concluir a sala de uma estação e atravessar a porta
  destrancada, o sistema MUST levar diretamente à sala da **próxima**
  estação da trilha (em vez do mapa de waypoints).
- **FR-003**: Ao entrar numa trilha, o sistema MUST mostrar a sala da
  primeira estação **ainda não concluída** (respeitando progresso
  existente), não sempre a estação 1.
- **FR-004**: A estação de Certificação Final MUST ser apresentada como
  sala (mesmo padrão das demais), só acessível depois de todas as
  estações normais concluídas, com 12 objetos interativos sorteados de
  todos os pools da trilha e pontuação em dobro — mesma regra já
  existente, sem alteração de lógica.
- **FR-005**: Ao concluir a Certificação Final, o relatório de
  desempenho e o código de presença MUST continuar exatamente como hoje
  (mesma lógica, `fimFase()` intocada).
- **FR-006**: A aparência (piso/parede) das salas MUST variar entre
  estações — não repetir sempre a mesma combinação visual.
- **FR-007**: Todo o mecanismo (objetos interativos, indicador de
  pendência, validação por acerto com retentativa ilimitada, geradores
  de pergunta, funções de correção) MUST continuar sendo reaproveitado
  sem reescrita — esta feature só estende o alcance de onde ele é usado
  e adiciona variação visual.
- **FR-008**: Este comportamento MUST valer para as duas trilhas
  (Arquitetura de Computadores e Linguagens de Programação e
  Paradigmas), usando o mesmo mecanismo genérico, sem lógica duplicada
  por trilha.
- **FR-009**: Todo texto novo desta feature MUST estar em português
  brasileiro, conforme o Princípio I da constituição.

### Key Entities

Nenhuma entidade nova — reaproveita "Sala" e "Objeto Interativo" já
definidos (features 008/010), agora instanciados para toda estação de
`TRAILS[trilha].stages` em vez de só a primeira.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um aluno consegue percorrer uma trilha inteira (todas as
  estações + certificação) sem nunca ver o mapa de waypoints antigo.
- **SC-002**: 100% das estações (incluindo certificação) de ambas as
  trilhas são jogáveis como sala, com o número de objetos batendo com o
  tamanho do pool correspondente (12 para a certificação).
- **SC-003**: Em qualquer sequência de 4 salas visitadas, nem todas têm
  a mesma combinação exata de piso/parede.
- **SC-004**: O relatório final e o código de presença, para a mesma
  entrada de estado do jogador, permanecem idênticos aos gerados antes
  desta feature.
- **SC-005**: A suíte de testes automatizados existente (features
  008-011) continua passando, estendida para cobrir a navegação entre
  salas consecutivas e a sala de certificação.

## Assumptions

- **Mapa de waypoints não é removido, só deixa de ser usado no fluxo
  normal**: o código do mapa de waypoints (feature anterior à 008)
  permanece no arquivo, mas não é mais chamado a partir de
  `renderTrilha()`/`moverJogadorSala()` — remoção física desse código é
  limpeza futura, fora do escopo desta feature (menor risco: não mexer
  em código que já vai ficar inatingível).
- **Variação visual por rodízio de temas, não uma aparência única por
  estação**: dado o catálogo do pacote de arte gratuito (feature 009),
  a variação visual (User Story 3) usa um pequeno conjunto de
  combinações de piso/parede já extraídas do pacote, alternadas entre
  estações — não uma combinação exclusiva desenhada para cada uma das
  22 estações (8+1 de Arquitetura, 12+1 de Linguagens). Isso já satisfaz
  "cenários distintos" (salas vizinhas parecem diferentes) sem exigir
  trabalho de extração de arte proporcional ao número de estações.
- **Objetos reaproveitam o mesmo sprite de terminal**: mesma decisão já
  tomada na feature 009 — variedade de OBJETO (não só de cenário) é
  polimento futuro.
- **Layout de objetos por sala continua determinístico**: mesma
  abordagem já usada na sala 1 (feature 010) — sem mudança.
