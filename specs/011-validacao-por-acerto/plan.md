# Implementation Plan: Validação por Acerto nos Objetos Interativos

**Branch**: `011-validacao-por-acerto` | **Date**: 2026-08-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/011-validacao-por-acerto/spec.md`

## Summary

Mudar `fimObjetoSala()` (feature 010) para só marcar um objeto como
resolvido quando a resposta foi correta; quando errada, uma nova
`tentarDeNovoObjetoSala()` regenera a pergunta daquele mesmo objeto
(nova instância via o gerador já existente) e mantém o overlay aberto —
sem fechar, sem marcar resolvido, sem limite de tentativas. `resolver()`
(pontuação/feedback) recebe só 2 linhas novas (guardar se a resposta foi
correta; texto do botão diferenciado em modo sala) — nenhuma função
geradora/de correção é tocada.

## Technical Context

**Language/Version**: HTML/CSS/JS vanilla, mesma stack já em produção.

**Primary Dependencies**: Nenhuma nova.

**Storage**: N/A.

**Testing**: `backend/tests/sala2d.test.js` (feature 010) é estendido —
adiciona um cenário de erro seguido de retentativa antes de acertar,
mantendo o cenário já existente (agora todos acertam de primeira, exceto
o objeto usado para testar a retentativa).

**Target Platform**: Mesmo monolito Render Web Service já em produção.

**Project Type**: Web — evolução de front-end existente (feature 010).

**Performance Goals**: Sem mudança.

**Constraints**: Nenhuma função geradora/de correção pode ser reescrita
(FR-008). O fluxo clássico (estações ainda em waypoints) não pode mudar
de comportamento (FR-007) — a mudança fica isolada ao ramo `sala &&
sala.objetoAtual` dentro de `proxima()`, já existente desde a feature
010.

**Scale/Scope**: 1 variável nova, 1 função nova pequena
(`tentarDeNovoObjetoSala`), ~4 linhas alteradas em `proxima()`/
`resolver()`, 1 teste estendido.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação |
|---|---|
| I. Português Brasileiro Obrigatório | PASS — texto novo ("Tentar de novo"/"Continuar") em pt-BR. |
| II. Front-end Simples com Backend Mínimo e Justificado | PASS — zero mudança de backend/dependência. |
| III. Rigor Pedagógico e Fidelidade de Conteúdo | PASS — nenhum gerador/função de correção alterado (FR-008). |
| IV. Validação por Acerto com Retentativa Sempre Disponível (v3.0.0) | PASS — é exatamente a implementação deste princípio recém-emendado: bloqueio só até acertar, nunca permanente, retentativa imediata e ilimitada, explicação sempre exibida. |
| V. Personalização e Variabilidade | PASS — cada retentativa chama `f.pool[idx]()` de novo, gerando valores novos, sem repetir a mesma instância. |
| Restrições Técnicas e Privacidade | PASS — nenhum dado novo. |

Nenhuma violação, nenhuma pendência de governança (a única pendência —
o conflito com a redação anterior do Princípio IV — já foi resolvida via
emenda formal antes deste plano).

**Re-check pós Fase 1**: sem `data-model.md`/`contracts/`. Gate continua PASS.

## Project Structure

### Documentation (this feature)

```text
specs/011-validacao-por-acerto/
├── plan.md
├── research.md
└── quickstart.md
```

### Source Code (repository root)

```text
backend/public/index.html
├── JS: let ultimaRespostaCorreta — nova variável de módulo, guarda o
│   resultado da última resposta (usada só pelo ramo de sala)
├── JS: resolver(ok) — 2 linhas novas: guarda ultimaRespostaCorreta;
│   texto do botão diferenciado quando em modo sala (Continuar/Tentar
│   de novo), sem alterar nenhum cálculo de pontuação
├── JS: nova tentarDeNovoObjetoSala() — regenera a pergunta do objeto
│   atual e chama renderPergunta(), sem fechar o overlay nem marcar
│   resolvido
├── JS: proxima() — no ramo de sala, decide entre fimObjetoSala() (se
│   acertou) e tentarDeNovoObjetoSala() (se errou), em vez de sempre
│   chamar fimObjetoSala()
└── JS: fimObjetoSala() — sem mudança de corpo (agora só é alcançada
    quando a resposta foi correta)

backend/tests/sala2d.test.js
└── estendido com um cenário de erro + retentativa antes de acertar
```

**Structure Decision**: tudo dentro do arquivo único já existente,
mesmo teste já existente estendido (não um arquivo novo).

## Complexity Tracking

> Nenhuma violação do Constitution Check acima — seção intencionalmente vazia.
