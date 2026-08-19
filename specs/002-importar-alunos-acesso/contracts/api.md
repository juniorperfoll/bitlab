# Contrato da API — Importação de Alunos e Login com Senha

Complementa `specs/001-duas-trilhas-admin-professor/contracts/api.md` (mesma base
URL, mesmo padrão de resposta JSON, mesmas convenções de erro em português). Este
documento cobre só as rotas novas/alteradas desta feature.

Autenticação: rotas **(auth-professor)** exigem o Bearer token do professor (igual
feature 001). Rotas **(auth-aluno)** exigem um Bearer token de aluno, emitido pelo
login descrito abaixo — mecanismo próprio, não intercambiável com o token do
professor.

---

## POST /api/alunos/cadastro (público) — ALTERADO

Mesmo contrato da feature 001 (cria/atualiza cadastro por matrícula, valida domínio
de e-mail e turma). **Mudança**: ao criar um aluno novo (matrícula ainda não
existente), o sistema agora também gera a senha padrão dele (FR-006) — a resposta
continua `{ "ok": true }`, sem expor a senha gerada na resposta (o aluno já sabe
qual é: o próprio e-mail que ele digitou, sem o domínio).

---

## POST /api/alunos/importar **(auth-professor)**

Importa vários alunos de uma vez (FR-001 a FR-005).

**Request body**:
```json
{ "linhas": "matricula1,Nome Um,nome1@unidavi.edu.br,T33F2\nmatricula2,Nome Dois,nome2@unidavi.edu.br,T34F2" }
```
(texto bruto colado, uma linha por aluno — ver research.md #5 para o formato exato)

**200 OK**:
```json
{
  "criados": 1,
  "atualizados": 1,
  "rejeitados": [
    { "linha": 3, "motivo": "E-mail fora do domínio institucional." }
  ]
}
```

---

## POST /api/alunos/login (público)

Autentica o aluno por matrícula + senha (FR-006, FR-007).

**Request body**:
```json
{ "matricula": "string", "senha": "string" }
```

**200 OK**:
```json
{ "token": "string", "precisaTrocarSenha": true, "nome": "string", "turma": "T33F2 | T34F2" }
```
(`precisaTrocarSenha` reflete `senha_padrao_ativa` — o front-end usa isso para
decidir se mostra a tela de troca de senha antes da trilha, FR-009. `nome`/`turma`
vêm do cadastro já existente para o front-end não precisar coletar de novo depois do
login — a idade usada na personalização de perguntas, nesse caminho, usa um
placeholder aleatório quando o aluno veio de importação, ver tasks.md → "Nota de
Implementação".)

**401 Unauthorized** (matrícula ou senha incorretos, sem distinguir qual):
```json
{ "mensagem": "Matrícula ou senha incorretos." }
```

---

## POST /api/alunos/senha **(auth-aluno)**

Define uma nova senha para o aluno autenticado (FR-009, FR-010).

**Request body**:
```json
{ "novaSenha": "string" }
```

**200 OK**: `{ "ok": true }` — a partir daqui `senha_padrao_ativa` vira `0` e a senha
padrão antiga deixa de funcionar (SC-005).

**400 Bad Request** (senha vazia):
```json
{ "mensagem": "Informe uma nova senha." }
```

---

## POST /api/alunos/:matricula/redefinir-senha **(auth-professor)**

Redefine a senha de um aluno de volta para a senha padrão (FR-011), para casos de
esquecimento.

**200 OK**: `{ "ok": true }` — a senha volta a ser a parte local do e-mail cadastrado
do aluno, e `senha_padrao_ativa` volta a `1`.

**404 Not Found** (matrícula não cadastrada):
```json
{ "mensagem": "Aluno não encontrado para essa matrícula." }
```

---

## Erros comuns (rotas **(auth-aluno)**)

**401 Unauthorized** (token ausente, inválido, ou de outro aluno que já deslogou por
ter feito login em outro lugar — research.md #2):
```json
{ "mensagem": "Sessão inválida. Faça login novamente." }
```
