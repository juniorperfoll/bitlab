# Implementation Plan: Polimento Visual — Tela Principal Mais Fluida e Logo da UNIDAVI na Splash

**Branch**: `006-polish-visual-jogo-2d` | **Date**: 2026-08-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-polish-visual-jogo-2d/spec.md`

## Summary

Polimento visual em `backend/public/index.html`, sem tocar backend nem dados: (1)
fundo ambiente animado + transições suaves + feedback de interação na tela
principal (telaInicio), reaproveitando a paleta e o padrão de animação já
estabelecidos no mapa 2D das trilhas; (2) um emblema estilizado "UNIDAVI" na tela
de splash, no mesmo padrão visual pixelado/retrô do emblema "BIT LAB" já existente
ali — não uma logo oficial em arquivo (o projeto não tem nenhuma imagem/asset
externo hoje, ver research.md #1).

## Technical Context

**Language/Version**: HTML/CSS/JS vanilla, mesma stack já em produção — sem
dependência nova.

**Primary Dependencies**: Nenhuma. Toda animação é CSS (`@keyframes`,
`transition`) ou, no máximo, pequenos helpers JS já no padrão do arquivo (mesmo
estilo dos helpers já existentes para o mapa 2D).

**Storage**: N/A.

**Testing**: Validação manual no navegador (mesmo "Fluxo de Validação em Sala de
Aula" da constituição) — animação/sensação visual não é testável por script.

**Target Platform**: Mesmo monolito Render Web Service já em produção.

**Project Type**: Web — polimento de front-end existente.

**Performance Goals**: Animações não podem introduzir jank perceptível em hardware
modesto — só CSS leve (sem canvas/JS de alta frequência para o fundo ambiente, ver
research.md #2).

**Constraints**: Toda animação nova MUST respeitar `prefers-reduced-motion`
(FR-004) — já existe uma regra global `@media (prefers-reduced-motion:reduce){*{
animation:none!important;transition:none!important}}` no CSS atual, que já cobre
automaticamente qualquer `@keyframes`/`transition` CSS novo sem precisar de código
extra. Nenhuma funcionalidade existente pode mudar de comportamento (FR-007).

**Scale/Scope**: ~3 blocos de CSS/HTML novos (fundo ambiente, transição de troca de
bloco, emblema UNIDAVI) + pequenos ajustes de hover/focus em elementos já
existentes, tudo dentro de `backend/public/index.html`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação |
|---|---|
| I. Português Brasileiro Obrigatório | PASS — nenhum texto novo relevante além de "UNIDAVI" (nome próprio, já usado hoje). |
| II. Front-end Simples com Backend Mínimo e Justificado | PASS — zero mudança de backend; CSS/JS puro, sem dependência nova, sem imagem/asset externo (research.md #1). |
| III. Rigor Pedagógico e Fidelidade de Conteúdo | N/A — não é conteúdo pedagógico. |
| IV. Aprendizagem sem Bloqueio | N/A — não mexe no fluxo de pergunta/resposta. |
| V. Personalização e Variabilidade | N/A. |
| Restrições Técnicas e Privacidade | PASS — nenhum dado novo. |

Nenhuma violação, nenhuma pendência de governança.

**Re-check pós Fase 1**: sem `data-model.md`/`contracts/` (feature não tem entidade
nem API — só apresentação). Gate continua PASS.

## Project Structure

### Documentation (this feature)

```text
specs/006-polish-visual-jogo-2d/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
└── quickstart.md         # Phase 1 output (/speckit-plan command)
```

Sem `data-model.md` (nenhuma entidade) e sem `contracts/` (nenhuma API).

### Source Code (repository root)

```text
backend/public/index.html
├── CSS: novo fundo ambiente animado da #telaInicio (research.md #2)
├── CSS: transição de troca entre #blocoLogin/#blocoCadastro (research.md #3)
├── CSS: reforço de feedback hover/focus em .btn/.field input/.seg button
├── CSS: .splash-uni — emblema "UNIDAVI" no estilo pixelado (research.md #4)
├── HTML: novo elemento do emblema dentro de #splash
└── JS: pequeno helper para animar a troca de bloco (research.md #3) —
    substitui o toggle instantâneo de `hidden` já existente em segAcesso
```

**Structure Decision**: tudo dentro do arquivo único já existente, sem estrutura
nova.

## Complexity Tracking

> Nenhuma violação do Constitution Check acima — seção intencionalmente vazia.
