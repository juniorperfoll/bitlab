# Quickstart: Validando o Polimento Visual

## 1. Rodar localmente

```bash
cd backend
npm run dev
```

## 2. Validar o emblema da UNIDAVI na splash (FR-005, FR-006, SC-004)

1. Abrir `http://localhost:3000/`.
2. **Esperado**: além do emblema "BIT LAB" já existente, aparece um emblema
   "UNIDAVI" no mesmo estilo pixelado/retrô (cores vermelhas da marca, fonte
   pixelada).
3. Dispensar a splash (clique/toque ou tecla).
4. **Esperado**: o emblema da UNIDAVI some junto com o resto da splash — não
   aparece em nenhuma tela seguinte.

## 3. Validar o fundo ambiente animado da tela principal (FR-001, SC-001)

1. Continuar na tela principal (identificação do aluno).
2. **Esperado**: observando por alguns segundos, algum elemento de fundo (brilho,
   partícula, gradiente) se move sutil e continuamente — não é uma imagem 100%
   parada.

## 4. Validar a transição entre "já tenho cadastro" / "primeiro acesso" (FR-002, SC-002)

1. Clicar em "Primeiro acesso" (estando em "Já tenho cadastro").
2. **Esperado**: a troca de formulário acontece com uma transição visível (fade/
   deslocamento), não um corte instantâneo.
3. Clicar de volta em "Já tenho cadastro".
4. **Esperado**: mesma transição suave no sentido contrário.

## 5. Validar feedback de interação (FR-003)

1. Passar o mouse (ou focar via teclado) sobre os botões e campos da tela
   principal.
2. **Esperado**: resposta visual perceptível (destaque, leve movimento) além do
   que já existia antes desta feature.

## 6. Validar `prefers-reduced-motion` (FR-004, SC-003)

1. Ativar "reduzir movimento" nas preferências do sistema operacional (ou emular
   via DevTools → Rendering → "Emulate CSS prefers-reduced-motion: reduce").
2. Recarregar a página.
3. **Esperado**: o fundo ambiente, as transições de troca de bloco e as animações
   de hover não essenciais deixam de rodar (mesmo comportamento que o resto do
   jogo já tem hoje).

## 7. Confirmar que nada mais mudou (FR-007, SC-005)

1. Completar um cadastro/login normalmente.
2. Selecionar uma trilha e responder uma pergunta.
3. **Esperado**: tudo funciona exatamente como antes desta feature — a mudança é
   só visual nas duas telas descritas acima.
