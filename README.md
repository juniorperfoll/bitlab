# BIT LAB — Trilha de Conversões

Jogo sério (serious game) educacional, single-page em HTML/CSS/JS puro (sem dependências, sem build), criado como material didático de apoio para a disciplina **Arquitetura de Computadores** — Bacharelado em Sistemas de Informação, **UNIDAVI**.

Autor: Prof. Esp. Ademar Perfoll Junior. Cobre o conteúdo das **Aulas 02 e 03**: sistemas de numeração, conversões entre bases, frações binárias, números negativos, ponto flutuante (IEEE 754) e codificação de caracteres (ASCII/UTF-8).

Turmas atendidas: **T33F2** (quintas-feiras) e **T34F2** (sextas-feiras).

## Objetivo de negócio

Fixação de conteúdo pós-aula via prática gamificada, e **comprovação de presença/participação**: ao concluir a trilha o aluno recebe um código de certificação e um relatório de desempenho para copiar e enviar ao professor pelo **Google Classroom**.

## Como funciona

1. Aluno informa nome, idade, matrícula e turma — usados para gerar perguntas personalizadas (ex.: converter a própria idade para binário, montar o próprio nome em ASCII).
2. Progride por uma **trilha evolutiva de 8 estações** (dificuldade crescente) + 1 estação **boss** de certificação final:
   1. Fundamentos (bit, byte, 2ⁿ)
   2. Sistemas de Numeração
   3. Decimal ⇄ Outras Bases
   4. Agrupamento de Bits
   5. Números Fracionários
   6. Números Negativos
   7. Ponto Flutuante
   8. Codificação de Caracteres
   - ★ Certificação Final — 12 perguntas sorteadas de todas as estações, pontuação dobrada
3. Cada estação tem um banco (pool) de geradores de pergunta com valores aleatorizados — repetir a trilha não repete as mesmas perguntas.
4. Erros não travam o progresso: a explicação do cálculo aparece na hora, reforçando o aprendizado.
5. Pontuação (XP), taxa de acerto e nível de rank evoluem de **Recruta dos Bits** até **Mestre da Representação de Dados**.
6. Painel de registrador de 8 bits (LEDs BIN/HEX/OCT/DEC) reforça visualmente cada conversão.
7. Gaveta de tabelas de apoio (nibble, ASCII imprimível, referência de negativos/IEEE 754) disponível a qualquer momento.

## Estado atual

Projeto de arquivo único (`index.html`, tudo embutido: CSS, JS, dados). Sem persistência entre sessões, sem backend — roda direto no navegador.

Referência bibliográfica usada no conteúdo: STALLINGS, W. *Arquitetura e organização de computadores*. 10. ed. São Paulo: Pearson, 2017. Cap. 9 e 10.
