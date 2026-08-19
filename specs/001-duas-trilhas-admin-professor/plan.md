# Implementation Plan: Duas Trilhas e Área Administrativa do Professor

**Branch**: `001-duas-trilhas-admin-professor` | **Date**: 2026-08-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-duas-trilhas-admin-professor/spec.md`

## Summary

Ampliar o BitLab com uma segunda trilha ("Linguagens de Programação e Paradigmas") ao
lado da trilha existente ("Arquitetura de Computadores"), e adicionar um painel
administrativo estático (`admin.html`) onde o professor autentica e habilita alunos
(em lote por turma ou individualmente por matrícula) a cada trilha. O jogo em si
continua uma página estática vanilla; a única parte nova com estado persistente é um
backend mínimo (Cloudflare Workers + banco D1) exclusivamente para autenticação do
professor e habilitação de alunos, conforme autorizado pelo Princípio II (v2.0.0) da
constituição do projeto.

## Technical Context

**Language/Version**: JavaScript vanilla (ES2020+) no front-end (`index.html`,
`admin.html`), sem TypeScript/transpilação. Backend em JavaScript vanilla rodando no
runtime do Cloudflare Workers (sem framework de servidor).

**Primary Dependencies**: Front-end: nenhuma (HTML/CSS/JS puro, como hoje). Backend:
nenhuma dependência de runtime além da Web Crypto API nativa do Workers (usada para
hash de senha); `wrangler` é ferramenta de desenvolvimento/deploy, não é embarcada no
código servido.

**Storage**: Cloudflare D1 (SQLite serverless) — três tabelas: `professores`,
`alunos`, `habilitacoes`. Nenhum outro dado de jogo é persistido (ver Restrições
Técnicas e Privacidade da constituição).

**Testing**: Front-end validado manualmente no navegador (conforme "Fluxo de
Validação em Sala de Aula" da constituição — sem framework de teste automatizado,
igual ao padrão já usado no `index.html`). Backend testado com `vitest` +
`@cloudflare/vitest-pool-workers` (dependência de desenvolvimento apenas, não
servida ao navegador).

**Target Platform**: Navegador (desktop/mobile) para `index.html` e `admin.html`;
Cloudflare Workers (edge) para a API mínima.

**Project Type**: Web — front-end estático + backend serverless mínimo.

**Performance Goals**: Ações administrativas (login, habilitar turma) respondem em
menos de 1s no caminho feliz (alinhado a SC-001). Verificação de habilitação do aluno
ao escolher trilha é uma única chamada de API, sem impacto perceptível no fluxo de
jogo.

**Constraints**: Front-end continua sem passo de build (Princípio II). Backend
restrito exclusivamente a autenticação do professor e habilitação de alunos — nenhuma
lógica de jogo, pontuação ou conteúdo pedagógico pode migrar para o backend. Hospedagem
deve caber no tier gratuito do Cloudflare (sem orçamento de infraestrutura).

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
index.html                  # Jogo (as duas trilhas), vanilla — atualizado para
                             # suportar múltiplas trilhas (ver data-model.md)
admin.html                  # Painel do professor (novo), vanilla, consome a API
                             # do backend via fetch()

backend/
├── src/
│   ├── index.js            # Worker entrypoint / roteador HTTP
│   ├── auth.js              # login, hash/verificação de senha, token de sessão
│   ├── alunos.js             # cadastro de aluno, validação de domínio de e-mail
│   ├── habilitacoes.js       # habilitar/revogar por turma ou por matrícula
│   └── db.js                 # acesso ao D1 (queries)
├── migrations/
│   └── 0001_init.sql        # schema inicial (professores, alunos, habilitacoes)
├── wrangler.toml
└── tests/
    ├── auth.test.js
    ├── alunos.test.js
    └── habilitacoes.test.js
```

**Structure Decision**: aplicação web com front-end estático (dois arquivos HTML
vanilla na raiz do repositório, sem diretório `frontend/` separado, mantendo o padrão
atual do projeto) e um backend serverless mínimo isolado em `backend/`, escopado
exclusivamente a autenticação e habilitação conforme o Princípio II.

## Complexity Tracking

> Nenhuma violação do Constitution Check acima — seção intencionalmente vazia.
