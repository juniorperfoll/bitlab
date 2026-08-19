# Quickstart: Validando Duas Trilhas e Área Administrativa do Professor

Guia para rodar e validar a feature de ponta a ponta. Referências de schema/endpoint
ficam em [data-model.md](./data-model.md) e [contracts/api.md](./contracts/api.md) —
não duplicadas aqui.

## Pré-requisitos

- Conta Cloudflare (tier gratuito) com Workers e D1 habilitados.
- `wrangler` instalado (`npm install -g wrangler` ou `npx wrangler`).
- Navegador para abrir `index.html` e `admin.html` localmente.

## 1. Provisionar o backend

```bash
cd backend
wrangler d1 create bitlab-db          # cria o banco, anote o database_id no wrangler.toml
wrangler d1 execute bitlab-db --file=migrations/0001_init.sql
```

## 2. Provisionar a credencial inicial do professor (FR-017)

Sem tela de "criar conta" no app — a credencial é inserida diretamente no banco
durante a implantação (ver research.md #3 para o esquema de hash):

```bash
wrangler d1 execute bitlab-db --command \
  "INSERT INTO professores (usuario, senha_hash, senha_salt, criado_em) VALUES ('ademar', '<hash>', '<salt>', datetime('now'));"
```

(`<hash>`/`<salt>` gerados por um script local que usa o mesmo algoritmo PBKDF2 do
Worker — não commitar senha em texto claro em lugar nenhum.)

## 3. Rodar o backend localmente

```bash
wrangler dev
```

Anote a URL local (ex.: `http://localhost:8787`) e aponte `index.html`/`admin.html`
para ela (constante de configuração no topo de cada arquivo).

## 4. Validar cadastro de aluno com domínio de e-mail (FR-016)

1. Abrir `index.html` no navegador.
2. Preencher o formulário inicial com um e-mail fora de `@unidavi.edu.br`.
3. **Esperado**: cadastro rejeitado com mensagem em português explicando o domínio
   exigido, sem avançar para a escolha de trilha.
4. Repetir com um e-mail `@unidavi.edu.br` válido.
5. **Esperado**: cadastro aceito, aluno vê as duas trilhas disponíveis (User Story 1).

## 5. Validar bloqueio por falta de habilitação (FR-009, User Story 3)

1. Com o aluno cadastrado no passo anterior (ainda sem nenhuma habilitação), tentar
   escolher qualquer uma das trilhas.
2. **Esperado**: mensagem em português explicando que o acesso depende de habilitação
   do professor; nenhuma estação é iniciada.

## 6. Validar login administrativo (FR-004, FR-019)

1. Abrir `admin.html`.
2. Tentar login com senha errada algumas vezes seguidas.
3. **Esperado**: sempre 401/mensagem de erro, nunca um bloqueio temporário (FR-019).
4. Logar com a credencial provisionada no passo 2.
5. **Esperado**: acesso concedido ao painel de habilitação.

## 7. Validar habilitação em lote por turma (FR-007, SC-001)

1. No painel, habilitar a turma do aluno de teste para a trilha "Arquitetura de
   Computadores".
2. **Esperado**: ação completa em menos de 1 minuto, uma única interação.
3. Voltar ao `index.html` com o mesmo aluno e escolher essa trilha.
4. **Esperado**: acesso liberado, jogo inicia normalmente; a outra trilha continua
   bloqueada (FR-002, User Story 3 cenário 2).

## 8. Validar exceção individual sobre habilitação de turma (FR-008, US2 cenário 3)

1. Com a turma inteira habilitada (passo 7), revogar individualmente o aluno de teste
   para essa mesma trilha (`concedida: false`).
2. **Esperado**: esse aluno específico perde acesso; um segundo aluno fictício da
   mesma turma (sem exceção) continua com acesso.

## 9. Validar persistência entre dispositivos (SC-004, FR-010)

1. Repetir o passo 7 (acesso liberado) em um navegador/dispositivo diferente do usado
   para o cadastro original, usando a mesma matrícula.
2. **Esperado**: habilitação continua válida — não depende de `localStorage` do
   dispositivo original, e sim do backend.

## 10. Validar rejeição de turma inválida (FR-013)

1. Chamar `POST /api/turmas/T99X9/habilitacoes` diretamente (ex.: via `curl`) com uma
   turma fora de `T33F2`/`T34F2`.
2. **Esperado**: `400` com mensagem em português, nenhuma linha criada em
   `habilitacoes`.

## 11. Validar redefinição manual de senha (FR-012)

1. Simular "esqueci a senha": rodar novamente o `UPDATE` de `senha_hash`/`senha_salt`
   diretamente no D1 (mesmo procedimento do passo 2), limpando também `token_ativo`.
2. **Esperado**: login antigo (token anterior) deixa de funcionar; login com a nova
   senha funciona.
