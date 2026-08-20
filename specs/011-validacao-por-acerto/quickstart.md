# Quickstart: Validando a Validação por Acerto

## 1. Rodar o teste automatizado

```bash
cd backend
npm test -- sala2d
```

**Esperado**: passa — inclui o cenário de errar um objeto, tentar de
novo, e só então acertar.

## 2. Rodar localmente e testar errando de propósito

```bash
cd backend
npm run dev
```

1. Entrar na sala da estação 1, interagir com um objeto.
2. Responder errado de propósito.
3. **Esperado**: explicação aparece; o indicador ❗ daquele objeto
   continua lá; o botão convida a tentar de novo (não "concluir").
4. Tentar de novo.
5. **Esperado**: pergunta nova (valores diferentes), sem limite, sem
   travar.
6. Responder certo.
7. **Esperado**: objeto marcado resolvido, indicador some.

## 3. Confirmar porta só destrava com tudo certo

1. Deixar 1 objeto propositalmente sem responder corretamente (errar e
   fechar a missão sem tentar de novo).
2. **Esperado**: porta continua trancada mesmo com os demais resolvidos.
3. Voltar, tentar de novo aquele objeto, acertar.
4. **Esperado**: porta destrava.

## 4. Confirmar que o fluxo clássico não mudou

1. Completar uma estação pelo mapa de waypoints (não sala) normalmente.
2. **Esperado**: continua permitindo avançar pergunta a pergunta
   independente de acerto, exatamente como antes desta feature.
