# Feature Specification: Validação por Acerto nos Objetos Interativos

**Feature Branch**: `011-validacao-por-acerto`

**Created**: 2026-08-20

**Status**: Draft

**Input**: User description: "enquanto uma estação não for resolvida
corretamente ela não será validada, ficando pendente para resolução" —
confirmado em conversa: exige emenda ao Princípio IV da constituição
(feita nesta sessão, v2.1.0 → v3.0.0, "Validação por Acerto com
Retentativa Sempre Disponível"), preservando retentativa imediata e
ilimitada.

## Nota de Contexto Importante

Esta feature muda a regra de "resolvido" nos **objetos interativos da
sala 2D** (feature 010, hoje só a sala da estação 1): hoje um objeto é
marcado resolvido assim que respondido, certo ou errado. Passa a ser
marcado resolvido **só quando respondido corretamente**; enquanto errado,
continua pendente (indicador ❗ continua visível) e o aluno pode tentar de
novo imediatamente, quantas vezes precisar — nunca há limite de
tentativas nem bloqueio permanente (Princípio IV v3.0.0). A porta da sala
passa a só destravar quando todos os objetos estiverem resolvidos
**corretamente**.

O fluxo clássico de missão inteira em sequência (estações 2-8 + boss de
cada trilha, ainda não convertidas para o formato de sala — feature 008,
User Stories 2-3, pendentes de aprovação) **não é alterado por esta
feature** — continua permitindo avançar pergunta a pergunta
independentemente de acerto, como hoje. Quando essas estações forem
convertidas para salas, a mesma regra desta feature passa a valer para
elas automaticamente, por reaproveitar o mesmo mecanismo de objeto
interativo.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Objeto só valida com resposta correta (Priority: P1) 🎯 MVP

Um aluno interage com um objeto da sala e responde errado. Em vez de o
objeto ser marcado como resolvido (comportamento atual), ele continua
pendente — o indicador ❗ continua visível — e o aluno consegue tentar de
novo imediatamente, com uma nova versão da mesma pergunta (valores
re-sorteados, preservando a personalização já existente). Só quando
acerta, o objeto é marcado resolvido.

**Why this priority**: é o pedido central — sem isso, não há mudança
nenhuma de comportamento observável.

**Independent Test**: interagir com um objeto, responder errado,
confirmar que o indicador de pendência continua lá e que dá pra tentar de
novo na hora; responder certo na tentativa seguinte e confirmar que o
objeto passa a resolvido.

**Acceptance Scenarios**:

1. **Given** um objeto pendente, **When** o aluno responde errado,
   **Then** a explicação do cálculo correto aparece imediatamente, o
   objeto continua marcado como pendente, e o aluno consegue tentar de
   novo sem sair da missão.
2. **Given** uma resposta errada, **When** o aluno tenta de novo,
   **Then** a nova tentativa usa uma versão nova da pergunta (valores
   re-sorteados do mesmo objeto), não trava, e não conta como "tentativa
   perdida" que impeça tentativas futuras.
3. **Given** um objeto pendente, **When** o aluno finalmente responde
   corretamente, **Then** o objeto é marcado como resolvido (indicador
   some) e o fluxo segue normalmente (próximo objeto pendente, ou
   destravamento da porta se era o último).
4. **Given** um aluno decide não continuar tentando agora, **When** ele
   fecha a missão sem acertar, **Then** o objeto continua pendente (não
   perdido/bloqueado definitivamente) e ele pode voltar a tentar depois
   normalmente.

---

### User Story 2 - Porta só destrava com tudo certo (Priority: P1)

A porta da sala só destrava quando **todos** os objetos estiverem
resolvidos corretamente — um objeto respondido errado (mesmo que o aluno
tenha desistido de tentar de novo por ora) não conta como concluído para
esse efeito.

**Why this priority**: é a consequência direta da User Story 1 sobre o
progresso da sala — sem isso, a mudança de validação não afeta o
resultado final.

**Independent Test**: deixar um objeto propositalmente sem responder
corretamente (responder errado e não tentar de novo), confirmar que a
porta continua trancada mesmo com todos os outros resolvidos.

**Acceptance Scenarios**:

1. **Given** todos os objetos da sala menos um resolvidos corretamente,
   **When** o aluno olha a porta, **Then** ela continua trancada.
2. **Given** o último objeto pendente é finalmente respondido
   corretamente, **When** isso acontece, **Then** a porta destrava
   imediatamente.

---

### Edge Cases

- Aluno erra várias vezes seguidas no mesmo objeto — nenhuma penalidade
  além da já existente (ex.: perda de pontos por usar dica); sem limite
  de tentativas, sem espera artificial entre tentativas.
- Aluno fecha a missão no meio de uma tentativa errada (sem responder de
  novo) — o objeto continua pendente; ao reabri-lo depois, começa uma
  nova tentativa normalmente (mesmo padrão de hoje para fechar/reabrir).
- Estação já concluída antes desta feature (todos os objetos já
  marcados resolvidos por respostas antigas, certas ou erradas) — não é
  reavaliada retroativamente; o estado existente é respeitado (evita
  destrancar/travar retroativamente algo que o aluno já tinha concluído).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Um objeto interativo MUST ser marcado como resolvido
  **somente** quando a resposta for correta — uma resposta incorreta
  MUST manter o objeto pendente.
- **FR-002**: Após uma resposta incorreta, o sistema MUST continuar
  exibindo imediatamente a explicação do cálculo correto (comportamento
  já existente, mantido).
- **FR-003**: Após uma resposta incorreta, o aluno MUST poder tentar
  novamente o mesmo objeto imediatamente, sem limite de tentativas e sem
  qualquer bloqueio ou espera artificial.
- **FR-004**: Cada nova tentativa MUST usar uma nova instância da
  pergunta daquele objeto (valores re-sorteados pelo gerador já
  existente), preservando a personalização e variabilidade já garantidas
  pelo Princípio V — sem reescrever nenhum gerador de pergunta.
- **FR-005**: A porta da sala MUST permanecer trancada até que **todos**
  os objetos estejam resolvidos corretamente — um objeto pendente (por
  nunca ter sido respondido, ou por ter sido respondido só
  incorretamente até agora) MUST impedir o destravamento.
- **FR-006**: Fechar a missão sem responder corretamente MUST não
  penalizar o aluno além de deixar o objeto pendente — ele MUST poder
  reabrir e tentar de novo a qualquer momento, sem perda permanente de
  acesso àquele objeto.
- **FR-007**: Esta regra aplica-se aos objetos interativos da sala 2D
  (feature 010); o fluxo clássico de missão em sequência das demais
  estações (ainda não convertidas para sala) MUST continuar funcionando
  exatamente como hoje, sem alteração nesta feature.
- **FR-008**: Nenhuma função geradora de pergunta ou de correção
  (`chkInt`/`chkTexto`/`chkNums`/`chkBinFrac`) MUST ser reescrita — a
  mudança fica contida em quando um objeto é marcado resolvido e no fluxo
  de nova tentativa.
- **FR-009**: Todo texto novo (ex.: convite para tentar de novo) MUST
  estar em português brasileiro, conforme o Princípio I da constituição.

### Key Entities

Nenhuma entidade nova — reaproveita o "Objeto Interativo" já definido na
feature 010 (posição, pergunta associada, estado agora reinterpretado
como "resolvido = respondido corretamente").

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das respostas incorretas resultam em objeto ainda
  pendente (0% de objetos marcados resolvidos por resposta errada).
- **SC-002**: 100% das tentativas após um erro conseguem ser refeitas
  imediatamente, sem limite — validado por simulação automatizada errando
  repetidamente antes de acertar.
- **SC-003**: A porta nunca destrava enquanto houver ao menos um objeto
  não resolvido corretamente — 0 casos de destravamento antecipado.
- **SC-004**: Nenhuma mudança de comportamento nas demais estações
  (fluxo clássico) — mesma suíte de testes de regressão (features
  001-010) continua passando sem alteração.

## Assumptions

- **Escopo — só objetos interativos da sala 2D**: esta regra vale para
  o mecanismo de objeto interativo (feature 010), hoje presente só na
  sala da estação 1. Não redesenha o fluxo clássico de fila única
  (estações ainda em waypoints) — quando essas estações forem
  convertidas para salas (feature 008, User Stories 2-3), herdam a
  mesma regra automaticamente, por usarem o mesmo mecanismo.
- **Reavaliação retroativa**: estações/objetos já marcados resolvidos
  antes desta feature (inclusive por resposta errada, sob a regra
  antiga) não são reabertos/reavaliados — a mudança vale só para
  interações novas a partir desta feature.
- **Nova tentativa gera nova pergunta**: para manter a variabilidade já
  garantida (Princípio V) e evitar que o aluno decore a resposta certa
  de uma pergunta específica, cada nova tentativa busca uma nova
  instância do gerador daquele objeto, não repete os mesmos valores.
