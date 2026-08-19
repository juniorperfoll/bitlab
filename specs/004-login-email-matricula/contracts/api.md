# Contrato da API — Login por E-mail ou Matrícula (alteração)

Altera `POST /api/alunos/login`, documentado originalmente em
`specs/002-importar-alunos-acesso/contracts/api.md`. Todas as outras rotas
(`/api/alunos/senha`, `/api/alunos/cadastro`, `/api/alunos/importar`, rotas de
habilitação e do professor) permanecem exatamente como estavam — não fazem parte
desta alteração.

## POST /api/alunos/login (público) — ALTERADO

**Request body** (campo renomeado de `matricula` para `identificador` — research.md #1):
```json
{ "identificador": "string (matrícula ou e-mail institucional)", "senha": "string" }
```

**200 OK** (ganha o campo `matricula` — achado durante a implementação: o
front-end precisa da matrícula real do aluno para checar habilitação e montar o
estado de jogo, mesmo quando o login foi feito por e-mail):
```json
{ "token": "string", "precisaTrocarSenha": true, "nome": "string", "turma": "T33F2 | T34F2", "matricula": "string" }
```

**400 Bad Request** (identificador ou senha ausentes):
```json
{ "mensagem": "Informe matrícula/e-mail e senha." }
```

**401 Unauthorized** (identificador ou senha incorretos — sem indicar qual, nem se
o identificador foi interpretado como e-mail ou matrícula, research.md #4):
```json
{ "mensagem": "Matrícula/e-mail ou senha incorretos." }
```

### Regra de resolução do identificador (research.md #2, #3)

- Contém `@` → busca por e-mail, case-insensitive.
- Não contém `@` → busca por matrícula (dígitos), mesmo comportamento de sempre.
