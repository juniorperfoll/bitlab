# Contrato da API — Backend Mínimo (Autenticação e Habilitação)

Base URL: definida no deploy (ex.: `https://bitlab-api.<subdomínio>.workers.dev`).
Todas as respostas são JSON. Todas as mensagens de erro voltadas ao usuário final
(campo `mensagem`) MUST estar em português brasileiro (Princípio I).

Autenticação: rotas marcadas **(auth)** exigem cabeçalho
`Authorization: Bearer <token>`, onde `<token>` é o `token_ativo` retornado pelo
login (ver research.md #4). Rotas sem essa marcação são públicas (chamadas pelo
`index.html` durante o cadastro/jogo do aluno).

---

## POST /api/login

Autentica o professor (FR-004).

**Request body**:
```json
{ "usuario": "string", "senha": "string" }
```

**200 OK**:
```json
{ "token": "string" }
```

**401 Unauthorized** (usuário ou senha incorretos — sem distinguir qual campo errou,
para não vazar quais usuários existem):
```json
{ "mensagem": "Usuário ou senha incorretos." }
```

Não há limite de tentativas (FR-019) — toda tentativa incorreta responde 401 sem
efeito colateral de bloqueio.

---

## POST /api/logout **(auth)**

Encerra a sessão administrativa corrente (limpa `token_ativo`).

**200 OK**: `{ "ok": true }`

---

## POST /api/alunos/cadastro

Cria ou atualiza o cadastro do aluno (chamado pelo `index.html` ao preencher
nome/idade/matrícula/turma/e-mail, antes de checar habilitação). Público — não exige
`Authorization`.

**Request body**:
```json
{
  "nome": "string",
  "idade": "number",
  "matricula": "string",
  "turma": "T33F2 | T34F2",
  "email": "string"
}
```

**200 OK** (criado ou atualizado por matrícula já existente):
```json
{ "ok": true }
```

**400 Bad Request** (e-mail fora do domínio institucional — FR-016):
```json
{ "mensagem": "Use um e-mail institucional do domínio @unidavi.edu.br." }
```

**400 Bad Request** (turma inválida — FR-013):
```json
{ "mensagem": "Turma inválida. Use T33F2 ou T34F2." }
```

---

## GET /api/alunos/:matricula/habilitacoes/:trilha

Verifica se o aluno identificado por `matricula` está habilitado para `trilha`
(`arquitetura` | `linguagens`). Chamado pelo `index.html` antes de iniciar a trilha
escolhida (FR-009, User Story 3). Público.

**200 OK**:
```json
{ "habilitado": true }
```
ou
```json
{ "habilitado": false }
```

Resolução de acesso segue a regra descrita em data-model.md (exceção individual
`concedida=true` vence; exceção individual `concedida=false` bloqueia mesmo com
habilitação de turma; caso contrário, vale a habilitação de turma).

---

## GET /api/alunos **(auth)**

Lista alunos cadastrados com suas habilitações atuais, para o painel do professor
renderizar a tela de gestão.

**200 OK**:
```json
{
  "alunos": [
    {
      "matricula": "string",
      "nome": "string",
      "turma": "T33F2 | T34F2",
      "email": "string",
      "habilitacoes": { "arquitetura": true, "linguagens": false }
    }
  ]
}
```

---

## POST /api/turmas/:turma/habilitacoes **(auth)**

Habilita uma turma inteira para uma trilha, em uma única ação (FR-007, SC-001).

**Path params**: `turma` = `T33F2 | T34F2`.

**Request body**:
```json
{ "trilha": "arquitetura | linguagens" }
```

**200 OK**: `{ "ok": true }`

**400 Bad Request** (turma fora de `T33F2`/`T34F2` — FR-013):
```json
{ "mensagem": "Turma inválida. Use T33F2 ou T34F2." }
```

---

## DELETE /api/turmas/:turma/habilitacoes/:trilha **(auth)**

Revoga a habilitação em lote da turma inteira para a trilha (não afeta exceções
individuais já concedidas separadamente).

**200 OK**: `{ "ok": true }`

---

## POST /api/alunos/:matricula/habilitacoes **(auth)**

Concede ou revoga individualmente o acesso de um aluno a uma trilha — usado tanto
para habilitar um aluno fora do lote da turma quanto para excluir um aluno específico
de uma habilitação de turma já concedida (FR-008, User Story 2 cenário 3).

**Request body**:
```json
{ "trilha": "arquitetura | linguagens", "concedida": true }
```
(`concedida: false` cria a exceção que bloqueia o aluno mesmo com a turma habilitada.)

**200 OK**: `{ "ok": true }`

**404 Not Found** (matrícula não cadastrada):
```json
{ "mensagem": "Aluno não encontrado para essa matrícula." }
```

---

## DELETE /api/alunos/:matricula/habilitacoes/:trilha **(auth)**

Remove qualquer exceção individual para esse aluno+trilha, voltando a valer apenas a
habilitação de turma (se houver).

**200 OK**: `{ "ok": true }`

---

## Erros comuns (todas as rotas **(auth)**)

**401 Unauthorized** (token ausente, inválido ou já invalidado por logout/reset):
```json
{ "mensagem": "Sessão administrativa inválida. Faça login novamente." }
```
