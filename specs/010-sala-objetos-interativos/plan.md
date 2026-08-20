# Implementation Plan: Um Objeto Interativo por Pergunta na Sala 2D

**Branch**: `010-sala-objetos-interativos` | **Date**: 2026-08-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/010-sala-objetos-interativos/spec.md`

## Summary

Trocar, dentro do motor de sala já existente (feature 008) e já com arte
aplicada (feature 009), o `sala.terminal` único por um array
`sala.objetos` — um objeto por pergunta do `pool` da estação, cada um com
posição própria na grade e estado `resolvido`. Interagir com um objeto
abre só a pergunta correspondente (reaproveitando `iniciarFase`/
`renderPergunta`/`resolver` sem alterar a lógica pedagógica). A porta só
destrava quando todos os objetos estiverem resolvidos.

## Technical Context

**Language/Version**: HTML/CSS/JS vanilla, mesma stack já em produção.

**Primary Dependencies**: Nenhuma nova.

**Storage**: N/A — mesmo estado em memória (`S`, `sala`) já existente.

**Testing**: `backend/tests/sala2d.test.js` (feature 008, jsdom) é
**reescrito** para o novo modelo (múltiplos objetos, um por vez) — o
comportamento que ele valida muda de fato nesta feature, então o teste
precisa mudar junto (diferente da feature 009, que não mudava
comportamento).

**Target Platform**: Mesmo monolito Render Web Service já em produção.

**Project Type**: Web — evolução de front-end existente (feature 008/009).

**Performance Goals**: Sem mudança — mesmo loop de sala a 60fps.

**Constraints**: Nenhuma função geradora/de correção de pergunta pode ser
reescrita (FR-007). A mudança fica contida em: modelo de dados da sala
(`construirSala`), interação (`tentarInteragirSala`), abertura de
pergunta (`iniciarFase`, parâmetro novo opcional), conclusão de objeto
(`fimObjetoSala`, nova função pequena) e desenho (`desenharSalaFormas`/
`desenharSalaComSprites`/novo `desenharIndicadoresSala`). `fimFase()` (que
já existe e já cuida de pontuação/resumo/desbloqueio de porta) **não
precisa ser modificada** — `fimObjetoSala()` prepara as variáveis de
sessão (`S.faseAcertos`/`S.faseXp`/`S.fila.length`) a partir dos
contadores já acumulados por estação (`S.estagios[id]`, que já são
corretos independente do fluxo, pois `resolver()` já os incrementa por
pergunta) antes de delegar a ela — ver research.md #2.

**Scale/Scope**: ~6 funções alteradas/novas em `backend/public/
index.html`, reescrita de 1 arquivo de teste.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação |
|---|---|
| I. Português Brasileiro Obrigatório | PASS — texto novo (dica da sala, indicador) em pt-BR. |
| II. Front-end Simples com Backend Mínimo e Justificado | PASS — zero mudança de backend/dependência. |
| III. Rigor Pedagógico e Fidelidade de Conteúdo | PASS — nenhum gerador/função de correção alterado (FR-007). |
| IV. Aprendizagem sem Bloqueio | PASS — explicitamente reforçado: nenhum placar mínimo, resposta errada nunca bloqueia (FR-009, resolvido na spec.md Assumptions). |
| V. Personalização e Variabilidade | PASS — `f.pool[idx]()` continua chamando o gerador com a mesma randomização/personalização de sempre. |
| Restrições Técnicas e Privacidade | PASS — nenhum dado novo. |

Nenhuma violação, nenhuma pendência de governança.

**Re-check pós Fase 1**: sem `data-model.md`/`contracts/` (feature não
tem entidade persistida nem API — só estado de UI em memória, já
documentado em research.md). Gate continua PASS.

## Project Structure

### Documentation (this feature)

```text
specs/010-sala-objetos-interativos/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
└── quickstart.md         # Phase 1 output (/speckit-plan command)
```

### Source Code (repository root)

```text
backend/public/index.html
├── JS: construirSala() — troca `terminal` único por `objetos[]`,
│   posicionados a partir de uma lista de células livres (research.md #1)
├── JS: tentarInteragirSala() — acha o objeto pendente mais próximo em
│   vez de checar distância a um terminal único
├── JS: iniciarFase(id, objetoIdx?) — parâmetro novo opcional; monta
│   `S.fila` com só 1 pergunta (`f.pool[objetoIdx]()`) quando informado
├── JS: fimObjetoSala() — nova função pequena; marca o objeto como
│   resolvido, fecha o overlay se ainda há pendentes, ou prepara as
│   variáveis de sessão e delega a `fimFase()` (já existente, intocada)
│   quando o último objeto é resolvido (research.md #2)
├── JS: proxima() — 1 linha nova: decide entre `fimObjetoSala()` e
│   `fimFase()` conforme `sala.objetoAtual`
├── JS: desenharSalaFormas()/desenharSalaComSprites() — desenham a lista
│   de objetos (em vez de 1 terminal), com indicador de pendência via novo
│   desenharIndicadoresSala()
└── JS: atualizarInfoSala() — mensagem reflete quantos objetos faltam

backend/tests/sala2d.test.js
└── reescrito para o modelo de múltiplos objetos (research.md #3)
```

**Structure Decision**: tudo dentro do arquivo único já existente,
seguindo o padrão das features 008/009; um teste já existente é
reescrito, nenhum arquivo novo de teste.

## Complexity Tracking

> Nenhuma violação do Constitution Check acima — seção intencionalmente vazia.
