# Feature Specification: Importação de Alunos com Senha Padrão de Primeiro Acesso

**Feature Branch**: `002-importar-alunos-acesso`

**Created**: 2026-08-19

**Status**: Draft

**Input**: User description: "Permitir importar os alunos para conceber o acesso gerando uma senha padrão de primeiro acesso, a senha será o e-mail senha a parte do domínio"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Professor importa uma lista de alunos de uma vez (Priority: P1)

O professor, na área administrativa, informa uma lista de alunos (matrícula, nome,
e-mail institucional, turma) de uma só vez, e o sistema cria (ou atualiza) o cadastro
de cada um, gerando automaticamente uma senha padrão de primeiro acesso para quem
ainda não tem conta.

**Why this priority**: é o valor central do pedido — sem a importação em lote, o
professor continuaria cadastrando aluno por aluno manualmente, o que já era possível
antes (auto-cadastro no primeiro jogo) e não resolve o problema de dar acesso
antecipado à turma toda de uma vez.

**Independent Test**: pode ser testado sozinho colando/enviando uma lista de alunos
de teste na área administrativa e conferindo que todos aparecem cadastrados, cada um
com uma senha padrão gerada, sem depender de nenhum aluno ter jogado antes.

**Acceptance Scenarios**:

1. **Given** o professor está na área administrativa, **When** ele importa uma lista
   com 3 alunos novos (matrícula, nome, e-mail `@unidavi.edu.br`, turma), **Then** os
   3 alunos passam a existir no cadastro, cada um com uma senha padrão de primeiro
   acesso já definida.
2. **Given** um aluno já cadastrado anteriormente (ex.: por ter jogado e se
   autoidentificado antes), **When** o professor importa novamente uma linha com a
   mesma matrícula, **Then** o sistema atualiza os dados desse aluno (nome, turma,
   e-mail) sem apagar ou trocar a senha que ele já possa ter definido.
3. **Given** uma linha da lista de importação com e-mail fora do domínio
   `@unidavi.edu.br` ou turma diferente de `T33F2`/`T34F2`, **When** o professor
   importa a lista, **Then** essa linha específica é rejeitada com uma mensagem
   explicando o motivo, e as demais linhas válidas da lista são importadas
   normalmente.

---

### User Story 2 - Aluno acessa pela primeira vez com a senha padrão (Priority: P1)

Um aluno que foi importado pelo professor consegue entrar no jogo informando a
matrícula (ou e-mail) e a senha padrão gerada a partir do seu e-mail institucional.

**Why this priority**: sem isso, gerar a senha não teria efeito nenhum — é o que
efetivamente "concede o acesso" mencionado no pedido.

**Independent Test**: pode ser testado sozinho pegando um aluno recém-importado e
tentando entrar no jogo com a senha padrão esperada (a parte do e-mail antes do
`@unidavi.edu.br`), sem depender de nenhuma outra user story.

**Acceptance Scenarios**:

1. **Given** um aluno importado com e-mail `joao.silva@unidavi.edu.br`, **When** ele
   tenta entrar informando a senha `joao.silva`, **Then** o acesso é concedido.
2. **Given** um aluno tentando entrar com a matrícula correta mas senha errada,
   **When** ele confirma, **Then** o acesso é negado com mensagem explicando o
   motivo, sem revelar se o problema foi a matrícula ou a senha.

---

### User Story 3 - Aluno troca a senha padrão no primeiro acesso (Priority: P2)

No primeiro login bem-sucedido com a senha padrão, o aluno é levado a definir uma
senha própria antes de continuar para o jogo.

**Why this priority**: fecha a lacuna de segurança criada por uma senha previsível
(qualquer pessoa que souber o padrão de e-mail de um colega adivinha a senha dele);
sem isso, a User Story 2 sozinha deixaria contas de alunos vulneráveis a acesso por
terceiros.

**Independent Test**: pode ser testado sozinho logando com a senha padrão de um
aluno de teste e verificando que o sistema exige a definição de uma nova senha antes
de liberar a trilha, e que a senha padrão antiga deixa de funcionar depois disso.

**Acceptance Scenarios**:

1. **Given** um aluno logando pela primeira vez com a senha padrão, **When** o login
   é aceito, **Then** o sistema exige a definição de uma nova senha antes de mostrar
   qualquer trilha.
2. **Given** um aluno que já trocou sua senha, **When** ele tenta logar novamente com
   a senha padrão antiga, **Then** o acesso é negado.

---

### Edge Cases

- O que acontece se duas linhas da lista de importação tiverem a mesma matrícula?
  A última linha da lista prevalece para aquele aluno (mesma regra de "matrícula como
  identificador único" já usada no cadastro individual).
- O que acontece se o e-mail de um aluno não tiver uma parte antes do `@` utilizável
  como senha (ex.: e-mail malformado)? Essa linha é rejeitada como e-mail inválido,
  igual a qualquer outro e-mail fora do padrão institucional.
- O que acontece se o professor importar a mesma lista duas vezes seguidas? A segunda
  importação apenas atualiza os dados de cadastro (nome/turma/e-mail) dos alunos já
  existentes, sem gerar uma nova senha padrão para quem já tem conta (evita resetar
  sem querer a senha de quem já trocou a própria).
- O que acontece se um aluno esquecer a própria senha depois de já ter trocado a
  padrão? O professor consegue redefinir a senha desse aluno individualmente de volta
  para a senha padrão (mesma lógica de primeiro acesso), pela área administrativa.
- O que acontece com um aluno que nunca foi importado e se cadastra sozinho pela
  primeira vez, como já é possível hoje? O cadastro gera a senha padrão dele também
  (FR-006), e da próxima vez que ele voltar precisa logar com matrícula + senha, do
  mesmo jeito que um aluno importado pelo professor.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A área administrativa MUST permitir ao professor importar vários
  alunos de uma vez, informando para cada um: matrícula, nome, e-mail institucional e
  turma.
- **FR-002**: Ao importar um aluno que ainda não existe no cadastro, o sistema MUST
  gerar automaticamente uma senha padrão de primeiro acesso, igual à parte do e-mail
  institucional do aluno antes do `@unidavi.edu.br`.
- **FR-003**: Ao importar uma linha cuja matrícula já existe no cadastro, o sistema
  MUST atualizar os dados desse aluno (nome, turma, e-mail) sem alterar a senha que
  ele já possua.
- **FR-004**: O sistema MUST validar cada linha da importação com as mesmas regras já
  usadas no cadastro individual (e-mail obrigatoriamente do domínio
  `@unidavi.edu.br`; turma obrigatoriamente `T33F2` ou `T34F2`), rejeitando apenas as
  linhas inválidas e importando normalmente as linhas válidas da mesma lista.
- **FR-005**: O sistema MUST informar ao professor, ao final de uma importação,
  quantos alunos foram criados, quantos foram atualizados e quais linhas foram
  rejeitadas (e por quê), em português.
- **FR-006**: O sistema MUST exigir matrícula e senha para acessar o jogo sempre que o
  aluno já possuir uma senha cadastrada (padrão ou própria); alunos sem senha
  cadastrada continuam usando o formulário de autoidentificação existente, que passa
  a também gerar a senha padrão para eles no momento do primeiro cadastro.
- **FR-007**: O sistema MUST negar o acesso do aluno quando matrícula ou senha
  estiverem incorretas, com uma mensagem única que não revela qual dos dois campos
  errou.
- **FR-008**: O sistema MUST armazenar a senha do aluno de forma protegida (nunca em
  texto claro), com o mesmo padrão de proteção já usado para a senha do professor.
- **FR-009**: No primeiro login bem-sucedido de um aluno usando a senha padrão, o
  sistema MUST exigir a definição de uma nova senha antes de liberar o acesso à
  trilha.
- **FR-010**: Depois que um aluno definir uma senha própria, o sistema MUST invalidar
  a senha padrão anterior para esse aluno.
- **FR-011**: A área administrativa MUST permitir ao professor redefinir a senha de
  um aluno individual de volta para a senha padrão (mesma regra de geração do
  FR-002), para casos de esquecimento.
- **FR-012**: Todo texto da importação, do login do aluno e da troca de senha MUST
  estar em português brasileiro, incluindo mensagens de erro.

### Key Entities

- **Aluno** (estendido): além dos campos já existentes (matrícula, nome, idade,
  turma, e-mail, habilitações), ganha uma senha (protegida) e um indicador de se
  ainda está usando a senha padrão de primeiro acesso ou já trocou por uma própria.
- **Importação**: uma lista de linhas (matrícula, nome, e-mail, turma) enviada pelo
  professor de uma vez, com um resultado por linha (criado, atualizado ou rejeitado
  com motivo).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O professor consegue importar uma turma inteira (30-40 alunos) em uma
  única ação, em menos de 2 minutos.
- **SC-002**: 100% dos alunos importados com dados válidos conseguem logar com a
  senha padrão gerada no primeiro acesso.
- **SC-003**: 100% dos logins com matrícula ou senha incorretas são recusados, sem
  exceção.
- **SC-004**: 100% dos alunos que completam o primeiro login com a senha padrão são
  levados a definir uma senha própria antes de qualquer outra ação no jogo.
- **SC-005**: Depois de trocar a senha, 100% das tentativas de login com a senha
  padrão antiga são recusadas.

## Assumptions

- A importação acontece por meio de uma lista de texto colada na área administrativa
  (uma linha por aluno, campos separados por vírgula ou ponto e vírgula — matrícula,
  nome, e-mail, turma), e não por upload de arquivo — mantém a área administrativa
  sem depender de tratamento de upload de arquivo no backend, coerente com o
  princípio de backend mínimo do projeto.
- O login do aluno passa a exigir matrícula + senha; o formulário atual de
  autoidentificação (nome/idade/matrícula/turma/e-mail) continua existindo para o
  primeiro cadastro de um aluno que ainda não foi importado nem tem conta, mas depois
  de ter senha definida (padrão ou própria), o acesso passa a exigir login.
- A troca de senha no primeiro acesso é obrigatória (não apenas sugerida), dado que a
  senha padrão é previsível a partir do e-mail institucional e o certificado gerado
  ao final da trilha serve como comprovação de presença — permitir login duradouro
  com senha adivinhável comprometeria essa comprovação.
- Idade mínima de complexidade da nova senha escolhida pelo aluno não é especificada
  nesta versão; qualquer senha não vazia é aceita, mantendo a barreira de entrada
  baixa para o público-alvo.
