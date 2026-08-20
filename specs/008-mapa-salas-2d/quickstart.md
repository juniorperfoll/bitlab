# Quickstart: Validando a Sala 2D (User Story 1)

## 1. Rodar o teste automatizado headless (FR-016, SC-005)

```bash
cd backend
npm install   # traz o jsdom novo como devDependency
npm test -- sala2d
```

**Esperado**: o teste carrega `index.html` real num DOM jsdom, entra na
trilha, simula o personagem se movendo, colidindo com paredes, tentando
interagir longe do terminal (nada acontece), se aproximando e interagindo
(missão abre), respondendo certo e errado a todas as perguntas da missão, e
confirma que a porta destrava e `S.estagios['e1'].feito === true` ao final
— 0 falhas.

## 2. Rodar localmente no navegador

```bash
cd backend
npm run dev
```

1. Abrir `http://localhost:3000/`, fazer login/cadastro normalmente,
   escolher qualquer uma das duas trilhas.
2. **Esperado**: se a estação 1 dessa trilha ainda não está concluída, o
   aluno cai direto dentro da sala 2D (não no mapa de waypoints).

## 3. Validar movimento e colisão (FR-002, SC-002)

1. Mover o personagem com as setas/WASD em todas as direções.
2. **Esperado**: o personagem se move célula a célula e para ao encostar
   numa parede/limite da sala — não atravessa.

## 4. Validar interação com o terminal (FR-004, FR-007)

1. Tentar pressionar a tecla de ação longe do terminal.
2. **Esperado**: nada acontece.
3. Aproximar o personagem do terminal e pressionar a tecla de ação.
4. **Esperado**: abre um painel de missão sobreposto ao mapa — a sala
   continua visível ao fundo, não é uma troca de tela cheia.

## 5. Validar a missão em si (FR-005)

1. Responder a todas as perguntas da missão, incluindo pelo menos uma
   resposta errada de propósito.
2. **Esperado**: comportamento idêntico ao já existente hoje — resposta
   errada mostra a explicação e permite continuar, sem travar; pontuação e
   texto seguem o padrão atual.

## 6. Validar o destravamento da porta (FR-006, SC-003)

1. Concluir a missão (todas as perguntas respondidas).
2. **Esperado**: a porta da sala destrava visivelmente.
3. Atravessar a porta.
4. **Esperado**: o aluno volta ao mapa de waypoints já existente, agora
   mostrando a estação 1 como concluída; as estações 2-8 e a certificação
   continuam navegáveis exatamente como antes desta feature.

## 7. Confirmar que nada mais mudou (regressão)

1. Completar a trilha inteira a partir da estação 2 (fluxo já existente,
   sem tocar na sala nova).
2. **Esperado**: mapa de waypoints, missões das demais estações,
   certificação final, relatório e código de presença funcionam
   exatamente como antes desta feature.

## 8. Aprovação do "feel" (FR-017, SC-006)

Antes de qualquer trabalho de replicação para as demais salas (User
Stories 2-4), esta sala precisa ser jogada e aprovada pelo usuário. Não
prosseguir para as próximas user stories sem essa aprovação explícita.
