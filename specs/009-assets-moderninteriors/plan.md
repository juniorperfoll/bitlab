# Implementation Plan: Arte Pixel do Pacote Modern Interiors (versão gratuita)

**Branch**: `009-assets-moderninteriors` | **Date**: 2026-08-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-assets-moderninteriors/spec.md`

## Summary

Trocar a apresentação puramente geométrica da sala 2D (feature 008) por
sprites/tiles de imagem do pacote Modern Interiors (versão gratuita),
mantendo 100% da jogabilidade já validada. Como os arquivos de imagem
ainda não estão no repositório (dependência do usuário, ver spec.md),
esta rodada entrega o **mecanismo completo de carregamento + fallback
gracioso** (FR-004) e um **contrato de nomes de arquivo** que o usuário
preenche depois — a troca visual real só aparece quando os arquivos
existirem, sem exigir nenhuma mudança de código adicional nesse momento.

## Technical Context

**Language/Version**: HTML/CSS/JS vanilla, mesma stack já em produção.

**Primary Dependencies**: Nenhuma nova dependência de runtime — `Image()`/
`canvas.drawImage()` nativos do navegador. Os próprios arquivos PNG do
pacote (fornecidos pelo usuário) contam como um novo tipo de asset
estático servido por `express.static`, já em uso.

**Storage**: N/A.

**Testing**: `sala2d.test.js` (feature 008, jsdom) continua validando
comportamento sem alteração (FR-003, SC-004) — como jsdom não carrega
imagens reais de arquivo local por padrão, o teste automaticamente
exercita o caminho de fallback (FR-004/SC-002), o que é o comportamento
correto a validar sem os arquivos reais presentes.

**Target Platform**: Mesmo monolito Render Web Service já em produção.

**Project Type**: Web — evolução visual de front-end existente (feature 008).

**Performance Goals**: Carregamento de imagem assíncrono, sem bloquear a
exibição inicial da sala (que já funciona em modo geométrico enquanto as
imagens carregam ou se estiverem ausentes).

**Constraints**: Nenhuma função de geração/correção de pergunta ou lógica
de sala (feature 008) pode ser reescrita — só a rotina de desenho. Os
arquivos de imagem em si **não são obtidos nem inventados nesta
implementação** (dependência bloqueante documentada no spec) — o código
é escrito para consumi-los pelo caminho combinado, mas a pasta pode ficar
vazia por enquanto.

**Scale/Scope**: Um pequeno carregador de imagens + um contrato de 4
arquivos esperados (piso, parede, terminal, personagem) + uma segunda
rotina de desenho (`desenharSalaComSprites`) ao lado da já existente
(renomeada para `desenharSalaFormas`, mantida como fallback) + crédito no
rodapé e no README.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação |
|---|---|
| I. Português Brasileiro Obrigatório | PASS — texto de crédito em pt-BR (só o nome próprio do pacote/autor fica em inglês/original). |
| II. Front-end Simples com Backend Mínimo e Justificado | PASS — `Image`/`drawImage` são API nativa do navegador, não framework; arquivos servidos como estático já suportado por `express.static`; zero mudança de backend. |
| III. Rigor Pedagógico e Fidelidade de Conteúdo | N/A — não altera conteúdo pedagógico. |
| IV. Aprendizagem sem Bloqueio | PASS — nenhuma mudança na lógica de missão/pergunta. |
| V. Personalização e Variabilidade | N/A — não afetado. |
| Restrições Técnicas e Privacidade | PASS — nenhum dado novo; arquivos de imagem não contêm dado de aluno. |

Nenhuma violação, nenhuma pendência de governança. Licenciamento do
pacote de arte (crédito obrigatório, redistribuição só permitida por ser
repo privado) já resolvido em spec.md, fora do escopo do Constitution
Check (não é uma regra da constituição do projeto, é uma obrigação
contratual externa — tratada via FR-005/FR-006/FR-007).

**Re-check pós Fase 1**: sem `data-model.md`/`contracts/` (feature não
tem entidade nem API — só apresentação + um contrato de nomes de arquivo,
documentado em research.md). Gate continua PASS.

## Project Structure

### Documentation (this feature)

```text
specs/009-assets-moderninteriors/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
└── quickstart.md         # Phase 1 output (/speckit-plan command)
```

Sem `data-model.md` (nenhuma entidade) e sem `contracts/` (nenhuma API
nova — o "contrato" aqui é de nomes de arquivo estático, documentado em
research.md).

### Source Code (repository root)

```text
backend/public/
├── index.html
│   ├── JS: carregador de imagens (manifesto de 4 arquivos esperados,
│   │   carregamento assíncrono, flag de prontidão)
│   ├── JS: desenharSalaFormas() — a desenharSala() atual da feature 008,
│   │   renomeada, mantida 100% igual, vira o fallback
│   ├── JS: desenharSalaComSprites() — novo caminho de desenho via
│   │   drawImage(), usado só quando todas as imagens carregam com sucesso
│   ├── JS: desenharSala() passa a ser um despachante entre as duas rotinas
│   ├── CSS: image-rendering:pixelated no #salaCanvas (nitidez de pixel art)
│   └── HTML: linha de crédito ao autor no rodapé já existente
└── assets/moderninteriors/   # NOVO diretório — arquivos PNG fornecidos
    └── (vazio nesta rodada; usuário preenche depois, ver quickstart.md)

README.md
└── linha de crédito ao autor do pacote de arte
```

**Structure Decision**: front-end continua no arquivo único já existente;
único diretório novo é `backend/public/assets/moderninteriors/`, para os
arquivos estáticos de imagem (já servidos automaticamente por
`express.static`, sem nenhuma rota nova).

## Complexity Tracking

> Nenhuma violação do Constitution Check acima — seção intencionalmente vazia.
