# Implementation Plan: Reposicionar Identidade do BitLab para Sistemas de Informação

**Branch**: `005-splash-foco-si` | **Date**: 2026-08-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-splash-foco-si/spec.md`

## Summary

Trocar 3 textos fixos em `backend/public/index.html` (subtítulo e rodapé da tela de
splash, e o `<h1>`/legenda da barra de identidade persistente) que hoje anunciam o
BitLab exclusivamente como "Arquitetura de Computadores", por uma mensagem que
reflete o foco no curso de Sistemas de Informação. Mudança só de conteúdo — nenhum
dado, endpoint ou comportamento muda.

## Technical Context

**Language/Version**: HTML/CSS estático, sem JavaScript envolvido (os 3 textos são
literais no markup, não gerados dinamicamente).

**Primary Dependencies**: Nenhuma.

**Storage**: N/A — nenhum dado persistido ou consultado.

**Testing**: Verificação visual manual (abrir a página, conferir os 3 textos) — não
há lógica para testar automaticamente.

**Target Platform**: Mesmo monolito Render Web Service já em produção.

**Project Type**: Web — edição pontual de conteúdo estático.

**Performance Goals**: N/A.

**Constraints**: Texto MUST continuar em português brasileiro (Princípio I);
nenhuma trilha, tela ou funcionalidade pode ser removida ou escondida (FR-004 do
spec.md).

**Scale/Scope**: 3 strings de texto em 1 arquivo.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação |
|---|---|
| I. Português Brasileiro Obrigatório | PASS — texto novo continua 100% pt-BR. |
| II. Front-end Simples com Backend Mínimo e Justificado | PASS — nem toca em backend. |
| III. Rigor Pedagógico e Fidelidade de Conteúdo | N/A — não é conteúdo pedagógico (pergunta/explicação), é identidade visual do produto. |
| IV. Aprendizagem sem Bloqueio | N/A. |
| V. Personalização e Variabilidade | N/A. |
| Restrições Técnicas e Privacidade | PASS — nenhum dado novo. |

Nenhuma violação, nenhuma pendência de governança.

**Re-check pós Fase 1**: sem Fase 1 de dados/contratos (feature não tem entidade
nem API — ver Project Structure). Gate continua PASS.

## Project Structure

### Documentation (this feature)

```text
specs/005-splash-foco-si/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
└── quickstart.md         # Phase 1 output (/speckit-plan command)
```

Sem `data-model.md` (nenhuma entidade — são só 3 strings de texto) e sem
`contracts/` (nenhuma API envolvida).

### Source Code (repository root)

```text
backend/public/index.html
├── .splash-sub            # "TRILHA DE ARQUITETURA DE COMPUTADORES" → texto novo
├── .splash-foot            # "Arquitetura de Computadores · UNIDAVI" → texto novo
└── .sysbar .brand h1/p      # "BIT LAB — TRILHA DE ARQUITETURA DE COMPUTADORES" e
                             # "Arquitetura de Computadores · Aulas 02 e 03 · UNIDAVI"
                             # → texto novo
```

**Structure Decision**: edição de conteúdo dentro do arquivo já existente, sem
estrutura nova.

## Complexity Tracking

> Nenhuma violação do Constitution Check acima — seção intencionalmente vazia.
