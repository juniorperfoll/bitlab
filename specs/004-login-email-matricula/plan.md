# Implementation Plan: Login por E-mail ou Matrícula

**Branch**: `004-login-email-matricula` | **Date**: 2026-08-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-login-email-matricula/spec.md`

## Summary

Permitir que o aluno faça login informando o e-mail institucional em vez da
matrícula, no mesmo campo único, mantendo o login por matrícula funcionando
exatamente como hoje. Mudança pequena e contida: um endpoint já existente
(`POST /api/alunos/login`, feature 002) passa a aceitar um identificador
(`identificador` em vez de `matricula` no corpo da requisição), detectar o formato
e buscar o aluno pelo campo certo. Sem schema novo, sem novo dado persistido.

## Technical Context

**Language/Version**: JavaScript vanilla (front-end) + Node.js/Express (backend) —
mesma stack já em produção, sem mudança.

**Primary Dependencies**: Nenhuma nova.

**Storage**: Inalterado (SQLite via `better-sqlite3`). `matricula` e `email` já são
colunas `UNIQUE` na tabela `alunos` desde a feature 001/002 — a busca por e-mail só
precisa de uma nova query, não de coluna nova nem migração.

**Testing**: `vitest` + `supertest`, mesmo padrão já usado em
`backend/tests/alunos.test.js`.

**Target Platform**: Mesmo monolito Render Web Service já em produção.

**Project Type**: Web — alteração pontual de um endpoint e de um campo de UI já
existentes.

**Performance Goals**: N/A — mesmo perfil de latência do login já existente (uma
query a mais de busca, no pior caso).

**Constraints**: Resposta de erro MUST continuar genérica (FR-005) — não pode
vazar se o identificador era e-mail ou matrícula, nem qual dos dois falhou.

**Scale/Scope**: Um endpoint alterado (`POST /api/alunos/login`), uma função nova
de acesso a dado (`getAlunoByEmail`), um campo de formulário no front-end.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação |
|---|---|
| I. Português Brasileiro Obrigatório | PASS — único texto novo é o rótulo do campo e a mensagem de erro, ambos pt-BR. |
| II. Front-end Simples com Backend Mínimo e Justificado | PASS — continua dentro do escopo já autorizado (autenticação de aluno); nenhuma função nova de backend fora desse escopo. |
| III. Rigor Pedagógico e Fidelidade de Conteúdo | N/A — feature não mexe em conteúdo pedagógico. |
| IV. Aprendizagem sem Bloqueio | N/A — feature é sobre login, não sobre responder perguntas. |
| V. Personalização e Variabilidade | N/A. |
| Restrições Técnicas e Privacidade | PASS — nenhum dado novo armazenado; e-mail e matrícula já eram persistidos e usados para autenticação desde a feature 002. |

Nenhuma violação, nenhuma pendência de governança — mudança estritamente dentro do
escopo já autorizado pelo Princípio II (v2.1.0) para autenticação de aluno.

**Re-check pós Fase 1**: confirmado em data-model.md que nenhuma coluna/tabela nova
é criada — só uma query adicional (`getAlunoByEmail`) sobre uma coluna que já
existe e já era única. Gate continua PASS.

## Project Structure

### Documentation (this feature)

```text
specs/004-login-email-matricula/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md         # Phase 1 output (/speckit-plan command)
├── contracts/            # Phase 1 output (/speckit-plan command)
│   └── api.md
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── db.js               # + getAlunoByEmail(db, email) — busca case-insensitive
│   └── alunos.js            # alunoLoginHandler passa a receber `identificador`,
│                            # detectar e-mail (contém "@") vs. matrícula, e chamar
│                            # a função de busca certa
├── public/
│   └── index.html            # campo de login do aluno: rótulo/placeholder
│                             # "Matrícula ou e-mail"; envia `identificador` em vez
│                             # de `matricula` no corpo da requisição
└── tests/
    └── alunos.test.js         # novos casos: login por e-mail, case-insensitive,
                               # matrícula continua funcionando, erro genérico
```

**Structure Decision**: extensão pontual do monolito já existente — mesmos
arquivos das features 001/002, sem diretório novo, sem migração.

## Complexity Tracking

> Nenhuma violação do Constitution Check acima — seção intencionalmente vazia.
