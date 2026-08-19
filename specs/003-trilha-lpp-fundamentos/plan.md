# Implementation Plan: Trilha LPP — Fundamentos, Paradigmas e Big-O (Aulas 01–03)

**Branch**: `003-trilha-lpp-fundamentos` | **Date**: 2026-08-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-trilha-lpp-fundamentos/spec.md`

## Summary

Substituir o conteúdo da trilha "Linguagens de Programação e Paradigmas" (8
estações genéricas, feature 001) por uma nova estrutura de 12 estações fiéis ao
syllabus real das Aulas 01-03 de LPP, organizadas em 3 blocos temáticos visuais +
estação boss. É uma mudança de **conteúdo e apresentação** dentro do front-end já
existente (`backend/public/index.html`) — mesmo id de trilha (`linguagens`), mesmo
mecanismo de habilitação, sem nenhuma mudança de backend, schema ou API. Também
corrige um acoplamento a "8 estações" hardcoded em 4 pontos do código que quebraria
com uma trilha de tamanho diferente.

## Technical Context

**Language/Version**: JavaScript vanilla (ES2020+), só em `backend/public/
index.html` — nenhuma mudança em `backend/src/*.js` nem em `admin.html`.

**Primary Dependencies**: Nenhuma nova.

**Storage**: Inalterado. O id da trilha (`'linguagens'`) já existe no enum de
trilhas válidas usado pelo backend (`TRILHAS_VALIDAS` em `backend/src/
habilitacoes.js`) e no schema (`habilitacoes.trilha`) — como o conteúdo da trilha
vive só no front-end (objeto `TRAILS`), trocar as 12 estações não exige migração
nem mudança de schema.

**Testing**: Validação manual no navegador (conforme "Fluxo de Validação em Sala de
Aula" da constituição) + revisão pedagógica do conteúdo pelo professor antes do uso
com as turmas (Princípio III) — mesmo padrão já usado para o conteúdo de todas as
trilhas existentes; não há suíte automatizada de conteúdo pedagógico neste projeto.

**Target Platform**: Mesmo monolito Render Web Service já em produção.

**Project Type**: Web — atualização de conteúdo dentro de uma aplicação já
existente, sem novo serviço nem novo endpoint.

**Performance Goals**: N/A — mesmo perfil de carregamento de página já existente (12
estações a mais no objeto `TRAILS` não tem impacto perceptível).

**Constraints**: A trilha continua obedecendo à estrutura `TRAILS[id] = {nome, desc,
stages, ranks}` já estabelecida (research.md #6 da feature 001) — sem novo campo
estrutural fora de `bloco` (ver Decisão #1 abaixo). Escopo de persistência
inalterado (Princípio II).

**Scale/Scope**: 12 estações regulares (vs. 8 atuais) + boss, ~36-50 geradores de
pergunta no total (mínimo 3 variações por estação, FR-010) — volume de conteúdo
comparável ao esforço da trilha "Linguagens" original na feature 001.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação |
|---|---|
| I. Português Brasileiro Obrigatório | PASS — todo o conteúdo (enunciados, explicações, rótulos de bloco) é pt-BR, herdado diretamente do rascunho já em português do professor. |
| II. Front-end Simples com Backend Mínimo e Justificado | PASS — nenhuma mudança de backend; conteúdo de trilha sempre foi front-end puro, fora do escopo do Princípio II. |
| III. Rigor Pedagógico e Fidelidade de Conteúdo | **GATE CENTRAL desta feature** — todo o conteúdo dos Apêndices A/B do spec.md deve ser validado manualmente (cálculo/afirmação conferidos) contra o material-fonte do professor antes do uso em sala; FR-011 e FR-012 são restrições pedagógicas específicas que exigem atenção redobrada na autoria dos geradores. |
| IV. Aprendizagem sem Bloqueio | PASS — reaproveita o padrão já existente (erro mostra explicação, nunca bloqueia); nenhuma trava nova introduzida. |
| V. Personalização e Variabilidade | PASS — FR-014 (personalização opcional) e FR-010 (pool mínimo de variações) seguem exatamente o padrão já usado nas trilhas existentes. |
| Restrições Técnicas e Privacidade | PASS — nenhum dado novo, nenhuma persistência nova. |

Nenhuma violação a justificar. Nenhuma pendência de governança — ao contrário das
features 001/002, esta não toca em backend/autenticação, então o Princípio II nem
entra em jogo além de "continua não se aplicando".

**Re-check pós Fase 1**: o design (data-model.md, quickstart.md) confirma que
nenhuma entidade persistida muda — `bloco` é um campo só de apresentação dentro do
objeto de estação em `TRAILS`, nunca chega ao backend. Gate continua PASS sem
mudanças.

## Project Structure

### Documentation (this feature)

```text
specs/003-trilha-lpp-fundamentos/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md         # Phase 1 output (/speckit-plan command)
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

Sem `contracts/` — esta feature não expõe nem consome nenhuma API nova (ver
Technical Context → Storage).

### Source Code (repository root)

```text
backend/public/index.html
├── TRAILS.linguagens          # nome, desc, stages (12 novas) e ranks (13 entradas,
│                              # antes 9) totalmente substituídos
├── construirMapa() /           # ganham leitura do campo `bloco` de cada estação
│   desenharMapa() /            # para colorir/legendar visualmente por bloco
│   atualizarInfoMapa()         # (FR-015) — sem mudar a regra de desbloqueio
├── atualizarInfoMapa() /       # 4 pontos com "8"/ranks[8] hardcoded viram
│   textoRelatorio() /          # dinâmicos (trilha.stages.filter(f=>!f.boss).length)
│   telaCertificacao()          # — necessário para a trilha de 12 estações funcionar
│                              # e não quebra a trilha de Arquitetura (que também
│                              # passa a ler o total dinamicamente, sem mudar de
│                              # comportamento pois já tem 8)
└── (geradores l1_*..l8_* antigos removidos, substituídos pelos novos da trilha)
```

**Structure Decision**: nenhuma mudança de estrutura de projeto — só edição de
conteúdo e uma pequena generalização de código dentro do arquivo já existente
`backend/public/index.html`. Sem `backend/src/`, sem `admin.html`, sem migração.

## Complexity Tracking

> Nenhuma violação do Constitution Check acima — seção intencionalmente vazia.
