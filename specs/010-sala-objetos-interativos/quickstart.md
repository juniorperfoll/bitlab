# Quickstart: Validando os Objetos Interativos na Sala

## 1. Rodar o teste automatizado

```bash
cd backend
npm test -- sala2d
```

**Esperado**: passa — simula o percurso por todos os objetos da sala,
respondendo um de cada vez, confirmando indicador e porta.

## 2. Rodar localmente no navegador

```bash
cd backend
npm run dev
```

1. Logar/cadastrar, entrar na trilha (estação 1).
2. **Esperado**: aparecem vários objetos na sala (não mais 1 terminal só)
   — o número deve bater com o tamanho do pool da estação (8, no caso da
   estação "Fundamentos" da trilha Arquitetura).

## 3. Validar indicador de pendência (FR-003, FR-004)

1. Observar os objetos ao entrar na sala.
2. **Esperado**: todos mostram um indicador (❗) acima.
3. Interagir com um deles e responder a pergunta.
4. **Esperado**: o indicador daquele objeto some; os demais continuam com
   indicador.

## 4. Validar que cada objeto abre só 1 pergunta (FR-001, FR-002)

1. Interagir com um objeto.
2. **Esperado**: abre 1 pergunta só — não a sequência inteira da estação.

## 5. Validar objeto já resolvido (FR-006)

1. Interagir de novo com um objeto já resolvido.
2. **Esperado**: nada acontece.

## 6. Validar porta só destrava com todos resolvidos (FR-005, User Story 2)

1. Resolver todos os objetos menos um.
2. **Esperado**: porta continua trancada.
3. Resolver o último.
4. **Esperado**: porta destrava imediatamente; tela de resumo da estação
   aparece com os acertos/pontos corretos (somando todos os objetos, não
   só o último).

## 7. Validar erro não bloqueia (FR-009)

1. Responder errado em pelo menos um objeto.
2. **Esperado**: explicação aparece, indicador some do mesmo jeito
   (objeto conta como "resolvido" mesmo errado), e o aluno segue livre
   para os demais objetos.

## 8. Confirmar que nada mais mudou

1. Completar a sala inteira e seguir para o mapa de waypoints.
2. **Esperado**: estações 2-8, boss e certificação continuam
   funcionando exatamente como antes (fluxo clássico intocado).
