# Implementation Plan: Duas Trilhas e Área Administrativa do Professor

**Branch**: `001-duas-trilhas-admin-professor` | **Date**: 2026-08-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-duas-trilhas-admin-professor/spec.md`

## Summary

Ampliar o BitLab com uma segunda trilha ("Linguagens de Programação e Paradigmas") ao
lado da trilha existente ("Arquitetura de Computadores"), e adicionar um painel
administrativo estático (`admin.html`) onde o professor autentica e habilita alunos
(em lote por turma ou individualmente por matrícula) a cada trilha. **Revisado em
2026-08-18**: por decisão do usuário, tudo roda como um monolito Node.js + Express
(`backend/server.js`), que serve tanto o jogo/painel estáticos (`backend/public/`)
quanto a API mínima, com SQLite local (`better-sqlite3`) como banco — hospedado como
um único Render Web Service (tier gratuito, sem disco persistente). A única parte com
estado persistente continua sendo autenticação do professor e habilitação de alunos,
conforme autorizado pelo Princípio II (v2.0.0) da constituição do projeto; ver
research.md decisões #1, #2 e #8 para o histórico completo dessa revisão.

## Technical Context

**Language/Version**: JavaScript vanilla (ES2020+) no front-end (`public/index.html`,
`public/admin.html`), sem TypeScript/transpilação. Backend em Node.js (Express),
JavaScript puro sem TypeScript.

**Primary Dependencies**: Front-end: nenhuma (HTML/CSS/JS puro, como hoje). Backend:
`express` (roteamento HTTP + arquivos estáticos) e `better-sqlite3` (acesso síncrono
ao SQLite); hash de senha via `node:crypto` (PBKDF2 nativo, sem dependência extra).

**Storage**: SQLite local via `better-sqlite3`, arquivo em `backend/data/bitlab.db`
(caminho configurável por `DB_PATH`) — três tabelas: `professores`, `alunos`,
`habilitacoes`. Nenhum outro dado de jogo é persistido (ver Restrições Técnicas e
Privacidade da constituição). **Sem disco persistente no tier gratuito do Render**: o
arquivo reseta a cada deploy/reinício — ver research.md decisão #1 e #8 para como a
credencial do professor sobrevive a isso mesmo assim.

**Testing**: Front-end validado manualmente no navegador (conforme "Fluxo de
Validação em Sala de Aula" da constituição). Backend testado com `vitest` +
`supertest` contra a instância Express em processo, usando SQLite `:memory:` por
teste (dependências de desenvolvimento apenas, não servidas ao navegador).

**Target Platform**: Navegador (desktop/mobile) para `index.html` e `admin.html`,
servidos pelo próprio monolito; Render Web Service (Node) para o processo único de
API + estáticos.

**Project Type**: Web — monolito único (estático + API no mesmo processo/origem).

**Performance Goals**: Ações administrativas (login, habilitar turma) respondem em
menos de 1s no caminho feliz (alinhado a SC-001). Verificação de habilitação do aluno
ao escolher trilha é uma única chamada de API, sem impacto perceptível no fluxo de
jogo.

**Constraints**: Front-end continua sem passo de build (Princípio II). Backend
restrito exclusivamente a autenticação do professor e habilitação de alunos — nenhuma
lógica de jogo, pontuação ou conteúdo pedagógico pode migrar para o backend.
Hospedagem deve caber no tier gratuito do Render (sem orçamento de infraestrutura);
dados de aluno/habilitação não sobrevivem a um redeploy nesse tier — limitação aceita
conscientemente pelo usuário por enquanto.

**Scale/Scope**: Duas turmas (T33F2, T34F2), dezenas de alunos por turma por
semestre, um único professor/administrador.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação |
|---|---|
| I. Português Brasileiro Obrigatório | PASS — `admin.html`, mensagens de erro da API e conteúdo da nova trilha serão 100% pt-BR (ver contracts/ e data-model.md). |
| II. Front-end Simples com Backend Mínimo e Justificado | PASS — front-end (`index.html`, `admin.html`) permanece vanilla, sem build. Backend limitado estritamente a autenticação/habilitação (Workers + D1), exatamente o escopo autorizado pela emenda v2.0.0. Nenhuma lógica de jogo migra para o servidor. |
| III. Rigor Pedagógico e Fidelidade de Conteúdo | PASS (com dependência) — o conteúdo específico da nova trilha (perguntas de linguagens/paradigmas) será escrito e validado manualmente antes do uso em sala, como já exigido para a trilha existente; este plano cobre a estrutura técnica, não o conteúdo pedagógico em si. |
| IV. Aprendizagem sem Bloqueio | PASS — a nova trilha reaproveita o mesmo padrão de pergunta/explicação do `index.html` atual (`tipo`, `enun`, `dica`, `exp`); nenhum mecanismo de tentativas limitadas é introduzido. |
| V. Personalização e Variabilidade | PASS — a nova trilha reaproveita o padrão de `pool` de geradores aleatorizados e os dados do aluno (nome/idade/matrícula/turma) já coletados. |
| Restrições Técnicas e Privacidade | PASS — backend só persiste o que a constituição já autoriza nesse escopo (credencial do professor com hash, cadastro do aluno ligado a habilitações); domínio `@unidavi.edu.br` validado no cadastro; estado de jogo em progresso continua só em memória do navegador. |

Nenhuma violação a justificar — o backend mínimo é exatamente a exceção que o
Princípio II (v2.0.0) passou a autorizar para este escopo. Seção "Complexity
Tracking" abaixo fica vazia.

**Re-check pós Fase 1** (após data-model.md, contracts/api.md, quickstart.md): schema
em `data-model.md` só persiste professor/aluno/habilitação (nada de conteúdo de
trilha); todos os endpoints em `contracts/api.md` retornam mensagens de erro em
português; nenhum endpoint expõe lógica de jogo. Gate continua PASS sem mudanças.

## Project Structure

### Documentation (this feature)

```text
specs/001-duas-trilhas-admin-professor/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── api.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
backend/                    # monolito único: API + estáticos no mesmo processo
├── server.js                # entrypoint Express: abre o SQLite, garante o schema,
│                            # autoprovisiona a credencial do professor via
│                            # ADMIN_USUARIO/ADMIN_SENHA (ver research.md #8), monta
│                            # public/ + rotas /api/*, escuta em process.env.PORT
├── public/
│   ├── index.html            # Jogo (as duas trilhas), vanilla
│   └── admin.html             # Painel do professor, vanilla, fetch() same-origin
├── src/
│   ├── db.js                  # acesso ao SQLite via better-sqlite3 (queries)
│   ├── auth.js                 # login/logout, hash PBKDF2 (node:crypto), token
│   ├── alunos.js                # cadastro de aluno, validação de domínio de e-mail
│   └── habilitacoes.js          # habilitar/revogar por turma ou por matrícula
├── migrations/
│   └── 0001_init.sql          # schema inicial (professores, alunos, habilitacoes)
├── scripts/
│   └── seed-professor.js      # provisionamento manual local (dev), grava direto
│                              # no arquivo SQLite
├── data/                      # arquivo SQLite de desenvolvimento local (gitignored)
└── tests/
    ├── setup.js                # helper de app/DB de teste (SQLite :memory:)
    ├── auth.test.js
    ├── alunos.test.js
    └── habilitacoes.test.js
```

**Structure Decision**: monolito único em `backend/` — um processo Node/Express serve
tanto os arquivos estáticos (`backend/public/`) quanto a API mínima (`/api/*`),
hospedado como um único Render Web Service. Substitui a estrutura anterior de
front-end na raiz do repo + backend serverless separado (Cloudflare Workers); ver
research.md decisão #1 para o histórico dessa revisão. Continua escopado
exclusivamente a autenticação e habilitação conforme o Princípio II.

## Complexity Tracking

> Nenhuma violação do Constitution Check acima — seção intencionalmente vazia.
