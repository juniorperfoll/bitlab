# Quickstart: Validando Importação de Alunos e Senha Padrão

Pré-requisitos e setup do backend: ver
`specs/001-duas-trilhas-admin-professor/quickstart.md` (seções 1-3, inalteradas).
Este guia assume o backend já rodando localmente com uma credencial de professor
provisionada.

## 1. Rodar a nova migração

```bash
cd backend
# local: a migração roda automaticamente no boot do server.js (abrirDb aplica o
# schema via CREATE TABLE/ADD COLUMN idempotente), igual à 0001 — não precisa de
# comando manual em dev.
npm run dev
```

## 2. Validar importação em lote (FR-001 a FR-005, SC-001)

1. Logar no painel (`/admin.html`).
2. Na nova seção "Importar alunos", colar:
   ```
   2026100,Fulano de Tal,fulano@unidavi.edu.br,T33F2
   2026101,Ciclana Souza,ciclana@unidavi.edu.br,T34F2
   2026102,Erro Proposital,fora@gmail.com,T33F2
   ```
3. Clicar em importar.
4. **Esperado**: resposta mostra 2 criados, 0 atualizados, 1 rejeitado (linha 3, motivo
   domínio de e-mail).

## 3. Validar que a atualização não mexe na senha (FR-003, Edge Case)

1. Repetir a importação do passo 2 (mesmas matrículas).
2. **Esperado**: agora 0 criados, 2 atualizados — sem gerar nova senha para quem já
   tem.

## 4. Validar login com senha padrão (User Story 2, SC-002)

1. `POST /api/alunos/login` com `{"matricula":"2026100","senha":"fulano"}`.
2. **Esperado**: `200` com `token` e `precisaTrocarSenha: true`.
3. Tentar `{"matricula":"2026100","senha":"errada"}`.
4. **Esperado**: `401`, mensagem em português, sem dizer qual campo errou (SC-003).

## 5. Validar troca obrigatória de senha (User Story 3, SC-004, SC-005)

1. Com o token do passo 4, `POST /api/alunos/senha` com `{"novaSenha":"minhaSenha123"}`.
2. **Esperado**: `200`.
3. Tentar login de novo com a senha padrão antiga (`fulano`).
4. **Esperado**: `401` — senha antiga não funciona mais.
5. Login com a senha nova (`minhaSenha123`).
6. **Esperado**: `200` com `precisaTrocarSenha: false`.

## 6. Validar redefinição de senha pelo professor (FR-011, Edge Case)

1. No painel, acionar "Redefinir senha" para a matrícula `2026100`.
2. **Esperado**: `200`.
3. Login com a senha padrão original (`fulano`) volta a funcionar, com
   `precisaTrocarSenha: true` de novo.

## 7. Validar autocadastro gerando senha também (FR-006, Edge Case)

1. Abrir `/` (jogo) com uma matrícula nova, nunca importada, e completar o
   formulário de autoidentificação normalmente.
2. **Esperado**: cadastro aceito.
3. Fechar e reabrir o jogo com a mesma matrícula.
4. **Esperado**: agora pede login (matrícula + senha), e a senha padrão é a parte do
   e-mail informado no cadastro — mesmo comportamento de um aluno importado.
