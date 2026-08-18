# Feature Specification: Duas Trilhas e Área Administrativa do Professor

**Feature Branch**: `001-duas-trilhas-admin-professor`

**Created**: 2026-08-18

**Status**: Draft

**Input**: User description: "Vamos ampliar o BitLab e vamos criar duas trilhas, uma de arquitetura de computadores e outra de linguagem de programação e paradigmas, o jogo terá uma área administrativa que só será acessivel pelo professor, precisamos de uma estratégia para armazenar o usuario e senha do professor que será o adminstrador do jogo e é quem vai habilitar os alunos que poderão acessar as respectivas trilhas."

## Clarifications

### Session 2026-08-18

- Q: Qual domínio de e-mail é aceito no cadastro dos alunos? → A: Somente e-mails do domínio @unidavi.edu.br são permitidos; cadastros com outros domínios são rejeitados.
- Q: Quem cria a conta inicial (usuário/senha) do professor administrador? → A: Credencial pré-configurada na implantação (definida por quem administra o backend/banco), sem tela de "criar conta" acessível dentro do app.
- Q: Quais dados pessoais do aluno o backend deve guardar junto da habilitação? → A: Tudo — matrícula, turma, e-mail, nome e idade, armazenados permanentemente no backend.
- Q: O login do professor na área administrativa expira sozinho por inatividade? → A: Não — a sessão fica ativa até logout manual, sem expiração automática.
- Q: A área administrativa deve bloquear tentativas após várias senhas erradas seguidas? → A: Não — sem limite de tentativas, sem trava adicional.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Aluno escolhe entre as duas trilhas (Priority: P1)

Ao entrar no jogo, o aluno vê duas trilhas disponíveis — "Arquitetura de
Computadores" (já existente) e "Linguagens de Programação e Paradigmas" (nova) — e
escolhe qual delas quer cursar antes de informar seus dados (nome, idade, matrícula,
turma).

**Why this priority**: é o valor central do pedido de ampliação — sem a segunda
trilha visível e selecionável, não há ampliação de conteúdo nenhuma.

**Independent Test**: pode ser testado sozinho abrindo o jogo, selecionando cada uma
das duas trilhas e confirmando que cada uma carrega seu próprio conjunto de estações,
perguntas e certificado — mesmo sem nenhuma área administrativa implementada ainda.

**Acceptance Scenarios**:

1. **Given** o aluno está na tela inicial do jogo, **When** ele visualiza as opções de
   trilha, **Then** vê claramente as duas trilhas nomeadas ("Arquitetura de
   Computadores" e "Linguagens de Programação e Paradigmas") com descrição de cada
   uma.
2. **Given** o aluno selecionou a trilha "Linguagens de Programação e Paradigmas" e
   está habilitado para ela, **When** ele progride pelas estações, **Then** todas as
   perguntas, explicações e o certificado final pertencem ao conteúdo dessa trilha,
   sem se misturar com o conteúdo da trilha de Arquitetura de Computadores.

---

### User Story 2 - Professor habilita alunos pela área administrativa (Priority: P1)

O professor acessa uma área administrativa separada do jogo, autentica-se com usuário
e senha, e habilita o acesso de alunos às trilhas — tanto em lote (a turma inteira,
T33F2 ou T34F2, de uma vez) quanto de forma individual (por matrícula), para uma ou
para as duas trilhas.

**Why this priority**: sem essa habilitação, nenhum aluno consegue jogar nenhuma
trilha — é a engrenagem que viabiliza o controle de acesso pedido.

**Independent Test**: pode ser testado isoladamente acessando a área administrativa,
autenticando com credenciais válidas, habilitando uma turma inteira para uma trilha e
depois removendo/adicionando um aluno individualmente, sem depender da experiência de
jogo do aluno estar completa.

**Acceptance Scenarios**:

1. **Given** o professor informa usuário e senha corretos, **When** ele acessa a área
   administrativa, **Then** o sistema concede acesso às funções de habilitação de
   alunos.
2. **Given** o professor está na área administrativa, **When** ele habilita a turma
   T33F2 inteira para a trilha "Arquitetura de Computadores", **Then** todos os
   alunos dessa turma passam a poder jogar essa trilha, e os demais alunos (outras
   turmas) permanecem sem acesso a ela.
3. **Given** uma turma já habilitada para uma trilha, **When** o professor remove
   individualmente um aluno específico (por matrícula) dessa habilitação, **Then**
   apenas aquele aluno perde o acesso à trilha, mantendo o restante da turma
   habilitado.
4. **Given** alguém informa usuário ou senha incorretos, **When** tenta acessar a área
   administrativa, **Then** o acesso é negado e nenhuma função administrativa fica
   visível ou executável.

---

### User Story 3 - Aluno sem habilitação é bloqueado com explicação (Priority: P2)

Um aluno que ainda não foi habilitado pelo professor para uma trilha tenta acessá-la e
recebe uma mensagem clara explicando que o acesso depende de liberação do professor,
em vez de conseguir jogar ou de um erro genérico.

**Why this priority**: garante que o controle de acesso da User Story 2 realmente
funcione do ponto de vista do aluno e evita confusão/frustração quando o aluno tenta
entrar antes da liberação.

**Independent Test**: pode ser testado sozinho simulando um aluno com matrícula não
habilitada tentando escolher uma trilha, e verificando que ele vê a mensagem de
bloqueio em vez de iniciar a primeira estação.

**Acceptance Scenarios**:

1. **Given** um aluno com matrícula ainda não habilitada para nenhuma trilha, **When**
   ele tenta selecionar qualquer uma das trilhas, **Then** o sistema exibe mensagem
   explicando que o acesso depende de habilitação do professor, sem iniciar o jogo.
2. **Given** um aluno habilitado apenas para a trilha "Arquitetura de Computadores",
   **When** ele tenta acessar "Linguagens de Programação e Paradigmas", **Then** é
   bloqueado apenas nessa trilha, mantendo acesso normal à trilha para a qual está
   habilitado.

---

### Edge Cases

- O que acontece quando um aluno tenta acessar uma trilha para a qual nunca foi
  habilitado? (coberto pela User Story 3 — mensagem de bloqueio, sem travar o app)
- Como o sistema trata um professor que esqueceu a senha da área administrativa? O
  acesso é restabelecido por redefinição manual, feita diretamente na configuração/
  banco por quem administra a implantação (sem fluxo automático de recuperação).
- O que acontece se um aluno habilitado for transferido de turma (ex.: de T33F2 para
  T34F2) depois de já habilitado? A habilitação concedida por turma não deve
  acompanhar automaticamente a mudança de turma; a habilitação permanece vinculada à
  turma original até o professor ajustá-la manualmente.
- O que acontece se duas tentativas de cadastro usarem a mesma matrícula? O sistema
  deve tratar a matrícula como identificador único do aluno para fins de habilitação
  — uma nova tentativa com matrícula já existente reaproveita a habilitação já
  concedida a essa matrícula, em vez de criar um registro duplicado.
- O que acontece se o professor tentar habilitar uma turma que não existe (fora de
  T33F2/T34F2)? O sistema deve rejeitar a operação e não criar habilitações para
  turmas não reconhecidas.
- O que acontece se um aluno tentar se cadastrar com e-mail de domínio diferente de
  `@unidavi.edu.br`? O sistema deve rejeitar o cadastro e explicar que apenas
  e-mails institucionais são aceitos.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST oferecer duas trilhas de aprendizagem distintas:
  "Arquitetura de Computadores" (conteúdo já existente) e "Linguagens de Programação e
  Paradigmas" (novo conteúdo), cada uma com seu próprio conjunto de estações,
  perguntas e certificado final.
- **FR-002**: O sistema MUST manter o conteúdo (perguntas, explicações, geradores,
  tabelas de apoio) de cada trilha isolado, de forma que uma trilha nunca exiba ou
  misture conteúdo da outra.
- **FR-003**: O sistema MUST oferecer uma área administrativa distinta da experiência
  de jogo do aluno, acessível apenas mediante autenticação.
- **FR-004**: O sistema MUST autenticar o professor por meio de usuário e senha antes
  de conceder qualquer acesso às funções administrativas.
- **FR-005**: O sistema MUST armazenar a senha do professor de forma protegida (nunca
  em texto claro, nem visível no código-fonte entregue ao navegador do aluno).
- **FR-006**: O sistema MUST impedir que qualquer aluno, por manipulação da interface
  ou da página, execute funções administrativas (habilitar/desabilitar alunos, ver ou
  alterar credenciais).
- **FR-007**: A área administrativa MUST permitir ao professor habilitar ou
  desabilitar o acesso de uma turma inteira (T33F2 ou T34F2) a uma trilha específica,
  em uma única ação.
- **FR-008**: A área administrativa MUST permitir ao professor habilitar ou
  desabilitar o acesso de um aluno individual (identificado por matrícula) a uma
  trilha específica, inclusive como ajuste fino sobre uma habilitação já concedida em
  lote por turma.
- **FR-009**: O sistema MUST impedir que um aluno inicie ou continue uma trilha para a
  qual não foi habilitado, exibindo mensagem explicando que o acesso depende de
  habilitação do professor.
- **FR-010**: O sistema MUST persistir, de forma permanente no backend, o cadastro
  completo do aluno (nome, idade, matrícula, turma, e-mail institucional), as
  habilitações concedidas pelo professor e as credenciais administrativas, de forma
  que permaneçam válidas em sessões e dispositivos futuros dos alunos e do professor
  (não apenas durante uma sessão de navegador).
- **FR-011**: O sistema MUST identificar cada aluno de forma única pela matrícula para
  fins de habilitação, associando cada habilitação a pelo menos: matrícula, turma e
  trilha.
- **FR-012**: O sistema MUST oferecer um procedimento de redefinição manual da senha
  do professor, executável por quem administra a implantação, para o caso de a senha
  ser esquecida.
- **FR-013**: O sistema MUST rejeitar tentativas de habilitação de turmas que não
  sejam T33F2 ou T34F2, sem criar registros de habilitação inválidos.
- **FR-014**: Todo texto da nova trilha "Linguagens de Programação e Paradigmas" e de
  toda a área administrativa MUST estar em português brasileiro, incluindo mensagens
  de erro, rótulos de interface e explicações pedagógicas.
- **FR-015**: A nova trilha "Linguagens de Programação e Paradigmas" MUST seguir o
  mesmo padrão de personalização (uso de nome/idade/matrícula/turma do aluno quando
  aplicável) e de variabilidade de perguntas (banco de geradores aleatorizados por
  estação) já usado na trilha de Arquitetura de Computadores.
- **FR-016**: O sistema MUST exigir um e-mail institucional do domínio
  `@unidavi.edu.br` no cadastro do aluno, rejeitando o cadastro caso o e-mail
  informado seja de outro domínio.
- **FR-017**: A credencial inicial do professor administrador MUST ser provisionada
  diretamente na implantação (fora da interface do jogo), sem que o sistema exija ou
  exponha um fluxo de "criar conta de administrador" acessível a terceiros.
- **FR-018**: A sessão administrativa do professor MUST permanecer ativa até logout
  manual, sem expiração automática por inatividade.
- **FR-019**: O sistema MUST permitir tentativas de login ilimitadas na área
  administrativa, sem bloqueio ou atraso após tentativas incorretas.

### Key Entities

- **Aluno**: nome, idade, matrícula (identificador único), turma (T33F2 ou T34F2),
  e-mail institucional (domínio `@unidavi.edu.br`, validado no cadastro), e o
  conjunto de habilitações que possui (quais trilhas pode acessar).
- **Professor/Administrador**: usuário e senha (armazenada de forma protegida),
  responsável por conceder e revogar habilitações de alunos.
- **Trilha**: identificador e nome ("Arquitetura de Computadores" ou "Linguagens de
  Programação e Paradigmas"), conjunto próprio de estações e conteúdo pedagógico.
- **Habilitação**: vínculo entre um aluno (ou uma turma inteira) e uma trilha,
  indicando se o acesso está concedido; pode ser concedida em lote (por turma) ou
  individualmente (por matrícula, inclusive como exceção sobre uma concessão em
  lote).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O professor consegue habilitar uma turma inteira (todos os alunos de
  T33F2 ou T34F2) para uma trilha em menos de 1 minuto, em uma única ação.
- **SC-002**: 100% das tentativas de acesso de alunos não habilitados a uma trilha
  restrita resultam em bloqueio com mensagem explicativa, nunca em acesso ao
  conteúdo da trilha.
- **SC-003**: Nenhuma tentativa de acesso às funções administrativas sem usuário e
  senha corretos é bem-sucedida (0 acessos não autorizados observados em teste).
- **SC-004**: Uma habilitação concedida pelo professor permanece válida em 100% das
  tentativas de acesso do aluno em sessões e dispositivos diferentes daquele em que a
  habilitação foi concedida.
- **SC-005**: A taxa de conclusão da nova trilha "Linguagens de Programação e
  Paradigmas" fica dentro de 10 pontos percentuais da taxa de conclusão observada na
  trilha "Arquitetura de Computadores", indicando paridade de experiência entre as
  duas trilhas.

## Assumptions

- Existe um único professor/administrador por instância do jogo nesta versão; suporte
  a múltiplos administradores está fora de escopo.
- A trilha "Linguagens de Programação e Paradigmas" segue a mesma estrutura de
  progressão da trilha existente (estações de dificuldade crescente + uma estação de
  certificação final com pontuação dobrada); o conteúdo pedagógico específico de cada
  estação (quais linguagens, quais paradigmas, quais perguntas) será detalhado em
  documento de planejamento futuro, não nesta especificação.
- Além dos dados já coletados hoje (nome, idade, matrícula, turma), o cadastro passa
  a exigir e-mail institucional do domínio `@unidavi.edu.br`; a matrícula continua
  sendo o identificador usado para vincular habilitações.
- **Implicação arquitetural relevante (resolvida)**: a estratégia de persistência
  (backend leve + banco de dados, escopado a autenticação do professor e habilitação
  de alunos) exigia emenda à constituição do projeto. A constituição já foi emendada
  para a versão 2.0.0 (`.specify/memory/constitution.md`, Princípio II — "Front-end
  Simples com Backend Mínimo e Justificado"), que agora autoriza explicitamente esse
  backend mínimo nesse escopo. Nenhum bloqueio de governança pendente para o
  `/speckit-plan`.
