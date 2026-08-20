# Implementation Plan: Todas as Estações como Salas 2D Encadeadas

**Branch**: `012-salas-todas-estacoes` | **Date**: 2026-08-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/012-salas-todas-estacoes/spec.md`

## Summary

Estender o motor de sala (features 008-011), hoje usado só na estação 1,
para todas as estações + certificação final de ambas as trilhas.
Encadear salas via a porta (em vez de voltar ao mapa de waypoints),
resolver o caso especial da sala-chefe (pool vazio no dado da estação,
perguntas vêm de um sorteio combinado) através de um único ponto de
generalização (`sala.geradores`), e variar piso/parede entre estações
usando um pequeno rodízio de temas extraídos do pacote de arte já
aplicado.

## Technical Context

**Language/Version**: HTML/CSS/JS vanilla, mesma stack já em produção.

**Primary Dependencies**: Nenhuma nova. 5 novos arquivos de imagem
(variantes de piso/parede, já extraídos do pacote gratuito já
disponibilizado pelo usuário na feature 009) em
`backend/public/assets/moderninteriors/`.

**Storage**: N/A.

**Testing**: `backend/tests/sala2d.test.js` estendido para cobrir:
navegação entre 2 salas consecutivas (porta leva à próxima estação, não
ao mapa antigo), e a sala de Certificação Final (12 objetos, pontuação
dobrada, relatório final).

**Target Platform**: Mesmo monolito Render Web Service já em produção.

**Project Type**: Web — extensão de alcance de um mecanismo já existente.

**Performance Goals**: Sem mudança — mesmo loop de sala a 60fps por sala
visitada.

**Constraints**: Nenhuma função geradora/de correção pode ser reescrita
(FR-007). O mapa de waypoints antigo não é removido, só deixa de ser
chamado (ver spec.md Assumptions) — reduz risco, nenhuma limpeza de
código nesta rodada.

**Scale/Scope**: 1 helper novo (`geradoresDaSala`), 1 função de
navegação nova (`sairDaSalaAtual`/`proximaEstacaoDaTrilha`),
`renderTrilha()` generalizada, `construirSala()` ajustada para boss +
tema visual, carregador de sprites estendido para 9 arquivos, 5 arquivos
de imagem novos, teste estendido.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação |
|---|---|
| I. Português Brasileiro Obrigatório | PASS — nenhum texto novo relevante além do já existente. |
| II. Front-end Simples com Backend Mínimo e Justificado | PASS — zero mudança de backend; arquivos de imagem servidos como estático já suportado. |
| III. Rigor Pedagógico e Fidelidade de Conteúdo | PASS — nenhum gerador/função de correção alterado; a montagem de perguntas da certificação usa a mesma lógica de sorteio já existente (`shuffle(pool).slice(0,PERGUNTAS_BOSS)`), só reorganizada num helper reaproveitável. |
| IV. Validação por Acerto com Retentativa Sempre Disponível (v3.0.0) | PASS — mecanismo reaproveitado sem alteração, agora usado em mais salas. |
| V. Personalização e Variabilidade | PASS — cada objeto continua chamando seu gerador na hora de abrir/tentar de novo, preservando aleatoriedade. |
| Restrições Técnicas e Privacidade | PASS — nenhum dado novo. |

Nenhuma violação, nenhuma pendência de governança.

**Re-check pós Fase 1**: sem `data-model.md`/`contracts/`. Gate continua PASS.

## Project Structure

### Documentation (this feature)

```text
specs/012-salas-todas-estacoes/
├── plan.md
├── research.md
└── quickstart.md
```

### Source Code (repository root)

```text
backend/public/index.html
├── JS: geradoresDaSala(stage, trilha) — resolve stage.pool (estação
│   comum) ou o sorteio combinado de 12 (boss), usado por
│   construirSala/iniciarFase/tentarDeNovoObjetoSala em vez de
│   `f.pool` direto
├── JS: construirSala(stage) — usa geradoresDaSala(); guarda
│   sala.geradores; escolhe sala.tema (piso/parede) por rodízio
│   determinístico a partir do índice da estação na trilha
├── JS: SALA_ASSET_MANIFEST/carregarSpritesSala() — estendido para os 5
│   novos arquivos de tema (piso2/piso3/parede2/parede3/parede4)
├── JS: desenharSalaFormas()/desenharSalaComSprites() — usam
│   sala.tema (cor de fallback / imagem) em vez de constantes fixas
├── JS: proximaEstacaoDaTrilha(stage) + sairDaSalaAtual() — substituem
│   a chamada a mostrarMapaWaypoints() em moverJogadorSala() quando a
│   porta é atravessada
├── JS: renderTrilha() — acha a primeira estação não concluída da
│   trilha (find), não mais fixo em stages[0]
└── (mapa de waypoints antigo permanece no arquivo, só deixa de ser
    chamado — spec.md Assumptions)

backend/public/assets/moderninteriors/
├── piso2.png, piso3.png (novos)
└── parede2.png, parede3.png, parede4.png (novos)

backend/tests/sala2d.test.js
└── estendido: navegação entre 2 salas + sala de certificação
```

**Structure Decision**: tudo dentro do arquivo único já existente; 5
arquivos de imagem novos no mesmo diretório de assets já existente;
mesmo arquivo de teste estendido.

## Complexity Tracking

> Nenhuma violação do Constitution Check acima — seção intencionalmente vazia.
