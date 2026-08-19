# Quickstart: Validando Duas Trilhas e Área Administrativa do Professor

Guia para rodar e validar a feature de ponta a ponta. Referências de schema/endpoint
ficam em [data-model.md](./data-model.md) e [contracts/api.md](./contracts/api.md) —
não duplicadas aqui.

## Pré-requisitos

- Node.js instalado localmente (qualquer versão LTS recente).
- Conta Render (tier gratuito é suficiente — ver limitação de disco na seção 12).
- Navegador para abrir o jogo/painel (local ou já implantado).

## 1. Instalar e rodar o backend localmente

```bash
cd backend
npm install
npm run dev          # node --watch server.js, escuta em http://localhost:3000
```

Sem `ADMIN_USUARIO`/`ADMIN_SENHA` definidos, o servidor sobe sem nenhum professor
cadastrado — use o passo 2 para semear localmente.

## 2. Provisionar a credencial inicial do professor (FR-017)

Sem tela de "criar conta" no app. Duas formas, dependendo do ambiente:

**Local (desenvolvimento)** — grava direto no arquivo SQLite local:
```bash
node scripts/seed-professor.js ademar "sua-senha-aqui"
```

**Produção (Render, sem disco persistente)** — configure as variáveis de ambiente
`ADMIN_USUARIO` e `ADMIN_SENHA` no painel do serviço Render; o `server.js`
autoprovisiona/atualiza a credencial a cada boot (ver research.md #8). Isso também é
o mecanismo de redefinição manual de senha (FR-012): trocar o valor de `ADMIN_SENHA`
no painel e reiniciar o serviço.

## 3. Abrir o jogo e o painel

Com `npm run dev` rodando, abra `http://localhost:3000/` (jogo) e
`http://localhost:3000/admin.html` (painel do professor) — o mesmo processo serve os
dois, sem configuração de URL adicional (front-end usa caminhos relativos, mesma
origem).

## Deploy no Render (produção)

1. No painel do Render, criar um **Web Service** (não Static Site) apontando para
   este repositório.
2. **Root Directory**: `backend`.
3. **Build Command**: `npm install`.
4. **Start Command**: `npm start`.
5. **Environment Variables**: definir `ADMIN_USUARIO` e `ADMIN_SENHA` com a
   credencial do professor (ver seção 2 e research.md #8). Render injeta `PORT`
   automaticamente — `server.js` já escuta em `process.env.PORT`.
6. Depois do primeiro deploy, o jogo fica em `https://<seu-servico>.onrender.com/` e
   o painel em `https://<seu-servico>.onrender.com/admin.html` — mesma origem, sem
   configuração extra de URL no front-end.
7. Ver seção 12 sobre a limitação de disco efêmero neste tier.

## 4. Validar cadastro de aluno com domínio de e-mail (FR-016)

1. Abrir `http://localhost:3000/` no navegador.
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

1. Abrir `http://localhost:3000/admin.html`.
2. Tentar login com senha errada algumas vezes seguidas.
3. **Esperado**: sempre 401/mensagem de erro, nunca um bloqueio temporário (FR-019).
4. Logar com a credencial provisionada no passo 2.
5. **Esperado**: acesso concedido ao painel de habilitação.

## 7. Validar habilitação em lote por turma (FR-007, SC-001)

1. No painel, habilitar a turma do aluno de teste para a trilha "Arquitetura de
   Computadores".
2. **Esperado**: ação completa em menos de 1 minuto, uma única interação.
3. Voltar à página inicial com o mesmo aluno e escolher essa trilha.
4. **Esperado**: acesso liberado, jogo inicia normalmente; a outra trilha continua
   bloqueada (FR-002, User Story 3 cenário 2).

## 8. Validar exceção individual sobre habilitação de turma (FR-008, US2 cenário 3)

1. Com a turma inteira habilitada (passo 7), revogar individualmente o aluno de teste
   para essa mesma trilha (`concedida: false`).
2. **Esperado**: esse aluno específico perde acesso; um segundo aluno fictício da
   mesma turma (sem exceção) continua com acesso.

## 9. Validar persistência entre dispositivos (SC-004, FR-010)

1. Repetir o passo 7 (acesso liberado) em um navegador/dispositivo diferente do usado
   para o cadastro original, usando a mesma matrícula, **sem reiniciar o servidor
   entre um passo e outro**.
2. **Esperado**: habilitação continua válida — não depende de `localStorage` do
   dispositivo original, e sim do banco do backend.
3. **Atenção (tier gratuito do Render)**: isso só vale enquanto o processo/container
   não reinicia. Um redeploy ou reinício por inatividade reseta o SQLite inteiro —
   ver seção 12.

## 10. Validar rejeição de turma inválida (FR-013)

1. Chamar `POST /api/turmas/T99X9/habilitacoes` diretamente (ex.: via `curl`) com uma
   turma fora de `T33F2`/`T34F2`.
2. **Esperado**: `400` com mensagem em português, nenhuma linha criada em
   `habilitacoes`.

## 11. Validar redefinição manual de senha (FR-012)

1. Simular "esqueci a senha":
   - Local: `node scripts/seed-professor.js ademar "nova-senha"` novamente.
   - Produção: trocar `ADMIN_SENHA` no painel do Render e reiniciar o serviço.
2. **Esperado**: login com a senha antiga deixa de funcionar; qualquer token de
   sessão anterior é invalidado (a atualização de credencial zera `token_ativo`);
   login com a nova senha funciona.

## 12. Limitação conhecida: sem disco persistente no tier gratuito do Render

Por decisão consciente do projeto (ver research.md #1, #2, #8), o Render está
configurado no tier gratuito, sem Persistent Disk. Consequências a ter em mente ao
usar em produção:

- O arquivo SQLite (`backend/data/bitlab.db`) — e com ele todo cadastro de aluno e
  toda habilitação concedida — é perdido a cada novo deploy e a cada vez que o
  container reinicia por inatividade prolongada.
- A credencial do professor **sobrevive** a isso, porque é reprovisionada a cada
  boot a partir das variáveis de ambiente `ADMIN_USUARIO`/`ADMIN_SENHA` configuradas
  no painel do Render (não depende do arquivo SQLite).
- Na prática: alunos e habilitações concedidas antes de um redeploy precisam ser
  recadastrados/reabilitados depois. Isso é aceitável como estado atual do projeto,
  mas se o uso em sala se tornar recorrente, o próximo passo natural é anexar um
  Persistent Disk do Render (plano pago) e apontar `DB_PATH` para o caminho montado
  — nenhuma mudança de código é necessária além disso.
