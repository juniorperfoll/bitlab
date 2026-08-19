# Feature Specification: Login por E-mail ou Matrícula

**Feature Branch**: `004-login-email-matricula`

**Created**: 2026-08-19

**Status**: Draft

**Input**: User description: "Permitir o login no sistema por e-mail ou por matrícula"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Aluno loga usando o e-mail institucional (Priority: P1)

Um aluno que lembra melhor do próprio e-mail institucional do que da matrícula
consegue entrar no jogo digitando o e-mail (em vez da matrícula) junto com a senha.

**Why this priority**: é o valor central do pedido — hoje o login só aceita
matrícula; sem essa história, "logar por e-mail" simplesmente não existe.

**Independent Test**: pode ser testado isoladamente pegando um aluno já cadastrado
e tentando logar informando o e-mail dele (em vez da matrícula) com a senha
correta.

**Acceptance Scenarios**:

1. **Given** um aluno cadastrado com e-mail `fulano@unidavi.edu.br` e senha
   definida, **When** ele informa `fulano@unidavi.edu.br` e a senha correta no
   campo de identificação do login, **Then** o acesso é concedido, do mesmo jeito
   que já acontece hoje informando a matrícula.
2. **Given** o mesmo aluno, **When** ele informa a matrícula (em vez do e-mail) com
   a senha correta, **Then** o acesso continua sendo concedido normalmente (o login
   por matrícula não pode parar de funcionar).

---

### User Story 2 - Erro de login continua sem revelar detalhes (Priority: P2)

Como aluno tentando logar (por e-mail ou por matrícula), quero que um erro de login
mostre uma mensagem única e genérica, para que eu não saiba se errei o
identificador ou a senha, nem se tentei um formato diferente do que está
cadastrado.

**Why this priority**: preserva uma garantia de segurança já estabelecida
(FR-007 da feature de login de aluno) — sem isso, alguém poderia usar respostas
diferentes pra descobrir se um determinado e-mail ou matrícula existe no sistema.

**Acceptance Scenarios**:

1. **Given** um e-mail que não corresponde a nenhum aluno cadastrado, **When**
   alguém tenta logar com ele e qualquer senha, **Then** a mensagem de erro é
   idêntica à de uma matrícula incorreta ou senha incorreta (mesmo texto genérico
   já usado hoje).

---

### Edge Cases

- O que acontece se o aluno digitar um e-mail com letras maiúsculas diferentes do
  que foi cadastrado (ex.: `Fulano@unidavi.edu.br` vs. `fulano@unidavi.edu.br`)? O
  sistema deve reconhecer como o mesmo e-mail (comparação sem diferenciar
  maiúsculas/minúsculas).
- O que acontece se o campo de identificação vier vazio, ou não parecer nem e-mail
  nem matrícula (ex.: só letras, sem `@`)? O sistema trata como matrícula inválida
  e recusa o login com a mesma mensagem genérica — nenhum tratamento especial de
  "formato desconhecido" é necessário.
- O que acontece com o campo "Matrícula" já existente na tela de importação em
  lote e no cadastro individual (área administrativa)? Não muda — esta feature é só
  sobre o campo usado para *logar*, não sobre cadastro/importação.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST aceitar, no campo de identificação da tela de login do
  aluno, tanto a matrícula quanto o e-mail institucional cadastrado, sem exigir que
  o aluno indique qual dos dois está informando.
- **FR-002**: O sistema MUST reconhecer automaticamente se o valor informado é um
  e-mail ou uma matrícula, e buscar o aluno correspondente da forma adequada.
- **FR-003**: A comparação de e-mail para login MUST ignorar diferença entre
  maiúsculas e minúsculas.
- **FR-004**: O sistema MUST continuar aceitando login por matrícula exatamente como
  hoje — esta feature adiciona uma opção, não substitui a existente.
- **FR-005**: O sistema MUST responder com a mesma mensagem de erro genérica,
  independentemente de o identificador informado ser um e-mail ou uma matrícula, e
  independentemente de o problema ser o identificador ou a senha.
- **FR-006**: Este comportamento aplica-se apenas ao login do aluno. O login do
  professor na área administrativa não é afetado por esta especificação.

### Key Entities

- **Aluno**: nenhum campo novo — reaproveita `matrícula` e `email`, ambos já
  identificadores únicos do aluno (estabelecidos nas features anteriores).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos alunos cadastrados conseguem logar informando o próprio
  e-mail institucional com a senha correta.
- **SC-002**: 100% dos alunos cadastrados continuam conseguindo logar informando a
  própria matrícula com a senha correta (nenhuma regressão).
- **SC-003**: 100% das tentativas de login com identificador ou senha incorretos
  (por e-mail ou por matrícula) recebem a mesma mensagem de erro genérica.

## Assumptions

- O campo único de identificação na tela de login do aluno (hoje rotulado
  "Matrícula") passa a aceitar os dois formatos — não é adicionado um segundo campo
  nem um seletor "e-mail ou matrícula"; a interface só precisa deixar claro, pelo
  rótulo/placeholder, que ambos são aceitos.
- Detecção do formato: qualquer valor contendo `@` é tratado como e-mail; caso
  contrário, é tratado como matrícula — não há ambiguidade real, já que matrículas
  são compostas só por dígitos.
- Login do professor (usuário/senha na área administrativa) está fora do escopo
  desta especificação — o professor não tem e-mail cadastrado no sistema hoje, e
  nada nesta feature pede a criação desse campo para ele.
