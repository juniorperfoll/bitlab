# Quickstart: Validando Login por E-mail ou Matrícula

Pré-requisitos e setup do backend: ver
`specs/001-duas-trilhas-admin-professor/quickstart.md` (seções 1-3).

## 1. Rodar localmente

```bash
cd backend
npm run dev
```

## 2. Preparar um aluno de teste

```bash
curl -X POST http://localhost:3000/api/alunos/cadastro -H "Content-Type: application/json" \
  -d '{"nome":"Fulano Teste","idade":20,"matricula":"2026500","turma":"T33F2","email":"Fulano.Teste@unidavi.edu.br"}'
```

(repare no e-mail com maiúsculas propositalmente — vamos testar login com
minúsculas depois, para validar research.md #3)

## 3. Validar login por e-mail (FR-001, SC-001)

```bash
curl -i -X POST http://localhost:3000/api/alunos/login -H "Content-Type: application/json" \
  -d '{"identificador":"fulano.teste@unidavi.edu.br","senha":"fulano.teste"}'
```

**Esperado**: `200`, corpo com `token`, `precisaTrocarSenha:true`, `nome`, `turma`
— mesmo com o e-mail em minúsculas na tentativa e maiúsculas no cadastro.

## 4. Validar que o login por matrícula continua funcionando (FR-004, SC-002)

```bash
curl -i -X POST http://localhost:3000/api/alunos/login -H "Content-Type: application/json" \
  -d '{"identificador":"2026500","senha":"fulano.teste"}'
```

**Esperado**: `200`, mesmo resultado do passo 3.

## 5. Validar mensagem de erro genérica (FR-005, SC-003)

```bash
curl -i -X POST http://localhost:3000/api/alunos/login -H "Content-Type: application/json" \
  -d '{"identificador":"naoexiste@unidavi.edu.br","senha":"qualquer"}'
curl -i -X POST http://localhost:3000/api/alunos/login -H "Content-Type: application/json" \
  -d '{"identificador":"2026500","senha":"senhaerrada"}'
```

**Esperado**: ambos `401` com a mesma mensagem
`"Matrícula/e-mail ou senha incorretos."` — não dá para saber, pela resposta, se o
identificador não existia ou se só a senha estava errada.

## 6. Validar front-end

1. Abrir `http://localhost:3000/`, escolher "Já tenho cadastro".
2. **Esperado**: o rótulo/placeholder do campo diz algo como "Matrícula ou e-mail".
3. Logar usando o e-mail do aluno de teste — deve funcionar igual ao passo 3.
