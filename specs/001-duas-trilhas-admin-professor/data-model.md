# Data Model: Duas Trilhas e Área Administrativa do Professor

Escopo de persistência real (SQLite local via `better-sqlite3`) é exatamente o autorizado pelo Princípio II
(v2.0.0) da constituição: credencial do professor e cadastro/habilitação de alunos.
O conteúdo das trilhas (estações, perguntas, `TRAILS` no `index.html`) **não** é
persistido em banco — continua vivendo como dado estático no front-end, igual ao
padrão atual do `STAGES`/`RANKS`.

## Entidades

### Professor (tabela `professores`)

Única linha nesta tabela nesta versão (FR: um único professor/administrador).

| Campo | Tipo | Regras |
|---|---|---|
| `id` | INTEGER PK | autoincremento |
| `usuario` | TEXT | único, não vazio |
| `senha_hash` | TEXT | PBKDF2 (ver research.md #3), nunca texto claro |
| `senha_salt` | TEXT | salt aleatório por credencial |
| `token_ativo` | TEXT NULLABLE | token de sessão corrente; `NULL` = deslogado |
| `criado_em` | TEXT (ISO 8601) | timestamp de criação |

**Validações** (FR-004, FR-005, FR-012, FR-017, FR-018):
- `senha_hash`/`senha_salt` só são gerados/alterados via procedimento de
  provisionamento/redefinição manual na implantação — nunca por uma rota HTTP pública
  de "criar conta".
- `token_ativo` não expira por tempo (FR-018); é limpo em logout explícito ou ao
  redefinir a senha.

### Aluno (tabela `alunos`)

| Campo | Tipo | Regras |
|---|---|---|
| `id` | INTEGER PK | autoincremento |
| `matricula` | TEXT | único — identificador do aluno (FR-011) |
| `nome` | TEXT | não vazio |
| `idade` | INTEGER | > 0 |
| `turma` | TEXT | um de `T33F2`, `T34F2` (FR-013) |
| `email` | TEXT | único; domínio obrigatório `@unidavi.edu.br` (FR-016) |
| `criado_em` | TEXT (ISO 8601) | timestamp do primeiro cadastro |
| `atualizado_em` | TEXT (ISO 8601) | timestamp da última atualização de cadastro |

**Validações**:
- `email` MUST terminar em `@unidavi.edu.br`; qualquer outro domínio é rejeitado na
  gravação (FR-016), validado tanto no cliente quanto no servidor (research.md #7).
- Cadastro repetido com a mesma `matricula` **atualiza** o registro existente (nome/
  idade/turma/email) em vez de criar duplicata — trata a matrícula como identidade
  estável do aluno (Edge Case: matrícula duplicada).
- Mudança de `turma` em um cadastro existente **não** transfere automaticamente
  habilitações concedidas em lote à turma antiga (Edge Case: aluno muda de turma).

### Trilha (não persistida — enum lógico)

Não existe tabela `trilhas`. O id da trilha é um enum de string usado como chave
estrangeira lógica em `habilitacoes.trilha`: `'arquitetura'` (Arquitetura de
Computadores) ou `'linguagens'` (Linguagens de Programação e Paradigmas). A
correspondência entre esses ids e o conteúdo real de cada trilha vive só no
front-end (`TRAILS` em `index.html`, ver research.md #6) — o backend não precisa
conhecer estações, perguntas ou pontuação, apenas o id da trilha para gate de acesso.

### Habilitação (tabela `habilitacoes`)

Representa tanto a concessão em lote por turma quanto a concessão/exceção individual
por aluno (FR-007, FR-008).

| Campo | Tipo | Regras |
|---|---|---|
| `id` | INTEGER PK | autoincremento |
| `escopo` | TEXT | `'turma'` ou `'individual'` |
| `turma` | TEXT NULLABLE | preenchido quando `escopo = 'turma'`; um de `T33F2`, `T34F2` |
| `aluno_id` | INTEGER NULLABLE FK → `alunos.id` | preenchido quando `escopo = 'individual'` |
| `trilha` | TEXT | `'arquitetura'` ou `'linguagens'` |
| `concedida` | BOOLEAN | `true` = acesso concedido; `false` = exceção que revoga o acesso individualmente mesmo com concessão em lote da turma |
| `atualizado_em` | TEXT (ISO 8601) | timestamp da última alteração |

**Regras**:
- Exatamente um de `turma` / `aluno_id` é preenchido, conforme `escopo` (constraint de
  aplicação, reforçada no código do Worker).
- Unicidade lógica: no máximo uma linha ativa por `(turma, trilha)` quando
  `escopo='turma'`, e no máximo uma linha ativa por `(aluno_id, trilha)` quando
  `escopo='individual'` — uma nova habilitação para o mesmo par substitui a anterior
  (upsert), em vez de acumular histórico.
- **Regra de resolução de acesso** (usada pelo endpoint de verificação, ver
  contracts/api.md): um aluno está habilitado para uma trilha se existir uma exceção
  individual `concedida=true` para ele+trilha, **ou** (não existir exceção individual
  `concedida=false` para ele+trilha **e** existir habilitação de turma
  `concedida=true` para a turma dele+trilha). Isso implementa exatamente o
  comportamento descrito na spec: "remover individualmente um aluno específico de uma
  habilitação de turma" sem mexer no restante da turma (User Story 2, cenário 3).

## Diagrama de relacionamento

```text
professores (1 linha)
  └── autentica → concede/revoga → habilitacoes

alunos ──< habilitacoes (escopo='individual', via aluno_id)
turma (enum) ──< habilitacoes (escopo='turma', via campo turma)

trilha (enum 'arquitetura' | 'linguagens') referenciado por habilitacoes.trilha,
sem tabela própria — conteúdo real da trilha fica em TRAILS no index.html.
```

## Estado de jogo (não persistido)

Continua exatamente como hoje (`S` em memória, `index.html`), apenas com um novo
campo `trilhaId` para saber qual `TRAILS[trilhaId]` está em uso na sessão corrente.
Nada disso é gravado no backend — respostas, XP, progresso dentro de uma trilha em
andamento seguem existindo só durante a sessão do navegador (Restrições Técnicas e
Privacidade da constituição).
