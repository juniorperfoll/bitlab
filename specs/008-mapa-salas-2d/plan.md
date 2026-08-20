# Implementation Plan: Mapa 2D de Salas com Movimento Livre e Missões

**Branch**: `008-mapa-salas-2d` | **Date**: 2026-08-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/008-mapa-salas-2d/spec.md`

## Summary

Construir, dentro de `backend/public/index.html`, um motor de sala 2D em
Canvas (grade, colisão, personagem controlável, terminal interativo, porta
trancada/destrancada) que reaproveita 100% da lógica pedagógica já
existente (`TRAILS[trilha].stages`, `pool` de geradores, `iniciarFase`/
`renderPergunta`/`resolver`/`proxima`/`fimFase`, `chkInt`/`chkTexto`/
`chkNums`/`chkBinFrac`, relatório e código de presença) — só a camada de
apresentação/navegação muda. **Escopo desta rodada de implementação**:
apenas User Story 1 (uma sala completa e validada, para a estação 1 de
uma trilha), conforme FR-017/SC-006 do spec — as demais user stories
ficam especificadas mas não implementadas até aprovação explícita do
usuário.

## Technical Context

**Language/Version**: HTML/CSS/JS vanilla (ES2020+), mesma stack já em
produção — sem dependência nova no runtime do jogo.

**Primary Dependencies**: Nenhuma nova dependência de runtime. Uma nova
dependência de **desenvolvimento/teste** (`jsdom`, via `devDependencies`
de `backend/package.json`) é necessária para a validação automatizada
headless pedida (FR-016) — não afeta o artefato servido ao aluno.

**Storage**: N/A — nenhuma mudança de dado persistido; o estado da sala
deriva inteiramente do objeto `S` (em memória) já existente.

**Testing**: `vitest` (já em uso no projeto) com ambiente `jsdom` para o
novo teste de sala (`@vitest-environment jsdom` só nesse arquivo — os
testes de backend existentes continuam no ambiente padrão Node). O teste
carrega `backend/public/index.html` real num DOM jsdom, dispara eventos
reais de teclado (`KeyboardEvent`) e inspeciona o estado do jogo exposto
por uma pequena ponte de depuração (`window.__salaDebug`), validando
colisão, abertura de missão, respostas corretas/incorretas e
destravamento de porta — sem depender de renderização real de Canvas 2D
(research.md #4).

**Target Platform**: Mesmo monolito Render Web Service já em produção.

**Project Type**: Web — evolução de front-end existente.

**Performance Goals**: Loop de sala a 60fps (via `requestAnimationFrame`,
mesmo padrão já usado em `loopMapa`), sem travar em hardware modesto.

**Constraints**: Nenhuma função de geração/correção de pergunta pode ser
reescrita (FR-005). Nenhuma funcionalidade hoje existente para as demais
7 estações + boss + certificado pode regredir nesta rodada — ver
research.md #1 para como a sala da estação 1 convive com o mapa de
waypoints ainda em uso para as demais estações. `prefers-reduced-motion`
continua respeitado (regra global já existente).

**Scale/Scope**: Um motor de sala genérico (grade + colisão + terminal +
porta) + fiação para a estação 1 de uma trilha + painel de missão em
overlay reaproveitando `telaJogo`/`telaFase` existentes + 1 novo arquivo
de teste headless. Tudo dentro de `backend/public/index.html` (+
`backend/package.json`/`backend/tests/` para o teste).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação |
|---|---|
| I. Português Brasileiro Obrigatório | PASS — todo texto novo (rótulos de sala, instruções, HUD) em pt-BR. |
| II. Front-end Simples com Backend Mínimo e Justificado | PASS — Canvas API pura, sem framework/bundler/CDN (decisão já fechada em spec.md Assumptions); `jsdom` entra só como devDependency de teste, nunca servido ao aluno. Zero mudança de backend. |
| III. Rigor Pedagógico e Fidelidade de Conteúdo | PASS — nenhuma função geradora/de correção é reescrita (FR-005); conteúdo pedagógico intocado. |
| IV. Aprendizagem sem Bloqueio | PASS — `resolver()`/`fimFase()` (já existentes, reaproveitados) continuam nunca travando o aluno em erro. |
| V. Personalização e Variabilidade | PASS — `iniciarFase()` (reaproveitado) continua usando os mesmos pools/personalização. |
| Restrições Técnicas e Privacidade | PASS — nenhum dado novo, nenhuma mudança de persistência. |

Nenhuma violação, nenhuma pendência de governança.

**Re-check pós Fase 1**: sem `data-model.md`/`contracts/` (feature não tem
entidade persistida nem API — o "modelo de dados" da sala é só estado de
UI em memória, documentado em research.md). Gate continua PASS.

## Project Structure

### Documentation (this feature)

```text
specs/008-mapa-salas-2d/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
└── quickstart.md         # Phase 1 output (/speckit-plan command)
```

Sem `data-model.md` (nenhuma entidade persistida) e sem `contracts/`
(nenhuma API nova).

### Source Code (repository root)

```text
backend/public/index.html
├── HTML: novo canvas de sala (ex.: #salaCanvas) dentro de #telaTrilha,
│   ativo quando a estação exibida é a estação 1 ainda não concluída
│   (research.md #1)
├── HTML: overlay de missão — telaJogo/telaFase passam a poder ser
│   exibidos sobre #telaTrilha sem escondê-la, via novo modo de
│   apresentação (research.md #3)
├── CSS: estilo da sala (tema circuito/placa-mãe, cores UNIDAVI), estilo
│   do overlay de missão (fundo semi-transparente + painel centralizado)
└── JS: novo motor de sala — estado (grade, jogador, terminal, porta),
    colisão, teclado (movimento + interação), abrir/fechar overlay de
    missão chamando iniciarFase()/fimFase() já existentes sem alteração,
    e uma ponte de depuração (window.__salaDebug) só para o teste headless

backend/package.json
└── devDependencies: + jsdom

backend/tests/
└── sala2d.test.js        # novo — simulação headless da sala 1 (FR-016)
```

**Structure Decision**: tudo dentro do arquivo único já existente para o
front-end, seguindo o padrão do projeto; um único arquivo de teste novo
no diretório de testes já existente (`backend/tests/`), seguindo o mesmo
padrão dos testes de backend já presentes (`alunos.test.js`,
`auth.test.js`, `habilitacoes.test.js`).

## Complexity Tracking

> Nenhuma violação do Constitution Check acima — seção intencionalmente vazia.
