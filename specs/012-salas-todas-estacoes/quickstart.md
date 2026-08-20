# Quickstart: Validando Todas as Estações como Salas

## 1. Rodar o teste automatizado

```bash
cd backend
npm test -- sala2d
```

**Esperado**: passa — inclui atravessar da sala da estação 1 pra sala da
estação 2, e resolver a sala de Certificação Final.

## 2. Rodar localmente e percorrer a trilha inteira

```bash
cd backend
npm run dev
```

1. Entrar na trilha, completar a sala da estação 1.
2. **Esperado**: atravessar a porta leva direto à sala da estação 2 —
   não ao mapa antigo.
3. Repetir até a última estação normal.
4. **Esperado**: atravessar a última porta leva à sala de Certificação
   Final, com 12 objetos.
5. Resolver os 12.
6. **Esperado**: relatório de desempenho e código de presença aparecem
   normalmente, pontuação em dobro.

## 3. Confirmar variação visual

1. Observar o piso/parede de 3-4 salas seguidas.
2. **Esperado**: nem todas têm a mesma combinação.

## 4. Confirmar que vale para as duas trilhas

1. Repetir o passo 2 escolhendo a trilha Linguagens de Programação e
   Paradigmas.
2. **Esperado**: mesmo comportamento.

## 5. Confirmar retomada de progresso

1. Com uma trilha parcialmente concluída (algumas estações já feitas),
   recarregar/entrar de novo.
2. **Esperado**: cai direto na sala da primeira estação ainda pendente.
