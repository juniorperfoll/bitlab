# Quickstart: Validando a Tela Inicial Simplificada

## 1. Rodar localmente

```bash
cd backend
npm run dev
```

## 2. Validar ausência de conteúdo específico de trilha (FR-001, FR-002, SC-002)

1. Abrir `http://localhost:3000/` e dispensar a splash.
2. **Esperado**: não aparece mais o bloco "SUA ROTA" com as 8 estações, nem o
   grid de 4 perguntas de exemplo (numeração, ASCII, bases, negativos).

## 3. Validar boas-vindas neutras (FR-003, US2)

1. Na tela inicial, observar o título/subtítulo acima do formulário.
2. **Esperado**: frase curta identificando o BitLab, sem citar conteúdo
   específico de nenhuma das duas trilhas.

## 4. Validar foco no formulário de identificação (FR-004, SC-001)

1. Abrir a tela inicial em uma janela de tamanho comum de notebook/desktop
   (sem maximizar em ultrawide, sem reduzir a tela de um celular pequeno).
2. **Esperado**: o formulário de identificação do operador (segmento "Já
   tenho cadastro"/"Primeiro acesso" e os campos) é visível sem precisar
   rolar a página.

## 5. Confirmar que nada mais mudou (FR-005, SC-003)

1. Completar um login (ou cadastro) normalmente, escolhendo cada uma das
   duas trilhas no campo "Trilha" do formulário.
2. **Esperado**: login, cadastro, troca de senha e seleção de trilha
   continuam funcionando exatamente como antes desta feature.
3. Confirmar que o fundo animado e as transições de troca de bloco da
   feature 006 continuam funcionando normalmente.
