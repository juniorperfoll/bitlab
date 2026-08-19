# Implementation Plan: Tela Inicial Simplificada e Neutra entre Trilhas

**Branch**: `007-simplificar-tela-inicial` | **Date**: 2026-08-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-simplificar-tela-inicial/spec.md`

## Summary

Remover da tela inicial (`#telaInicio` → bloco `.hero` em
`backend/public/index.html`) o conteúdo específico da trilha Arquitetura de
Computadores — o grid de 4 perguntas de exemplo (`.featgrid`) e a prévia de
rota fixa "SUA ROTA" com 8 estações (`.prevwrap`) — mantendo só uma frase
curta e neutra de boas-vindas, para que o formulário de identificação do
operador (`#blocoLogin`/`#blocoCadastro`) fique em foco, visível sem rolar a
página.

## Technical Context

**Language/Version**: HTML/CSS/JS vanilla, mesma stack já em produção — sem
dependência nova.

**Primary Dependencies**: Nenhuma. Só edição de markup/CSS já existente em
`backend/public/index.html`; nenhum JS novo necessário (nada no `.hero`
removido é referenciado por `id` em nenhum script — `.featgrid`/`.prevwrap`
são puramente decorativos).

**Storage**: N/A.

**Testing**: Validação manual no navegador (mesmo "Fluxo de Validação em Sala
de Aula" da constituição) — mudança é de apresentação, sem lógica nova para
testar via script além de checagem estrutural (grep/curl) e `node --check`.

**Target Platform**: Mesmo monolito Render Web Service já em produção.

**Project Type**: Web — simplificação de front-end existente.

**Performance Goals**: N/A — remoção de markup só reduz peso da tela.

**Constraints**: Nenhuma funcionalidade do formulário de identificação
(login, cadastro, troca de senha, seleção de trilha dentro do formulário)
pode mudar de comportamento (FR-005). Fundo animado e transições da feature
006 continuam intactos.

**Scale/Scope**: Remoção de 2 blocos HTML/CSS (`.featgrid`, `.prevwrap`) +
ajuste do texto de `.tagline`/`.title` em `backend/public/index.html`. Nenhum
outro arquivo envolvido.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação |
|---|---|
| I. Português Brasileiro Obrigatório | PASS — texto remanescente/ajustado continua em pt-BR. |
| II. Front-end Simples com Backend Mínimo e Justificado | PASS — zero mudança de backend; só remoção/ajuste de HTML/CSS estático. |
| III. Rigor Pedagógico e Fidelidade de Conteúdo | N/A — não altera conteúdo pedagógico (perguntas/geradores das trilhas continuam intocados, só sai o resumo decorativo da tela inicial). |
| IV. Aprendizagem sem Bloqueio | N/A — não mexe no fluxo de pergunta/resposta. |
| V. Personalização e Variabilidade | N/A. |
| Restrições Técnicas e Privacidade | PASS — nenhum dado novo, nenhuma mudança de persistência. |

Nenhuma violação, nenhuma pendência de governança.

**Re-check pós Fase 1**: sem `data-model.md`/`contracts/` (feature não tem
entidade nem API — só apresentação). Gate continua PASS.

## Project Structure

### Documentation (this feature)

```text
specs/007-simplificar-tela-inicial/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
└── quickstart.md         # Phase 1 output (/speckit-plan command)
```

Sem `data-model.md` (nenhuma entidade) e sem `contracts/` (nenhuma API).

### Source Code (repository root)

```text
backend/public/index.html
├── HTML: remover .featgrid (4 featcards) de dentro de #telaInicio .hero
├── HTML: remover .prevwrap ("SUA ROTA", 8 prevchip + boss2) de dentro de #telaInicio .hero
└── HTML/texto: simplificar .title/.tagline para uma frase curta e neutra entre as duas trilhas
```

**Structure Decision**: tudo dentro do arquivo único já existente, sem
estrutura nova. CSS de `.featgrid`/`.prevwrap`/`.prevchip`/`.prevarrow`/
`.boss2` fica órfão no `<style>` mas não é removido nesta feature (sem risco
funcional deixar CSS não referenciado; removê-lo é limpeza opcional fora de
escopo).

## Complexity Tracking

> Nenhuma violação do Constitution Check acima — seção intencionalmente vazia.
