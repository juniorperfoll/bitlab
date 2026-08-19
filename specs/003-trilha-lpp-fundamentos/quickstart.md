# Quickstart: Validando a Trilha LPP — Fundamentos, Paradigmas e Big-O

Guia de validação manual — sem API nova, sem schema novo. Pré-requisitos e setup do
backend: ver `specs/001-duas-trilhas-admin-professor/quickstart.md` (seções 1-3) e
`specs/002-importar-alunos-acesso/quickstart.md` (login do aluno).

## 1. Rodar localmente

```bash
cd backend
npm run dev
```

## 2. Validar que a trilha substituída aparece corretamente (FR-001)

1. Abrir `http://localhost:3000/`.
2. Na seleção de trilha, a opção antes chamada "Linguagens de Programação e
   Paradigmas" agora mostra o nome/descrição da trilha LPP nova.
3. **Esperado**: não existe uma terceira opção de trilha — continuam só duas
   (Arquitetura de Computadores + a trilha LPP substituída).

## 3. Validar a estrutura de 12 estações + boss (FR-002, FR-006, FR-007)

1. Logar/cadastrar um aluno de teste, habilitar (via `/admin.html`) para a trilha
   LPP.
2. Entrar na trilha — o mapa mostra 12 nós regulares + 1 nó boss (travado até
   concluir os 12).
3. Completar as 12 estações (pode usar respostas erradas propositalmente em algumas
   — ver passo 5).
4. **Esperado**: o nó boss destrava assim que a 12ª estação regular é concluída, não
   antes.
5. Completar o boss.
6. **Esperado**: boss sorteia 12 perguntas do pool agregado das 12 estações, com
   pontuação em dobro (comparar XP ganho por questão certa nessa fase vs. nas
   estações regulares).

## 4. Validar agrupamento visual por bloco (FR-015, User Story 2)

1. No mapa da trilha, observar as cores dos 12 nós.
2. **Esperado**: dá pra distinguir visualmente 3 grupos de cor (um por bloco — Aula
   01/02/03), e a legenda abaixo do mapa nomeia os 3 blocos.
3. Clicar/focar numa estação do bloco "Aula 02".
4. **Esperado**: o painel de informação da estação mostra a que bloco ela pertence.

## 5. Validar erro não trava progresso (FR-005, User Story 1 cenário 2)

1. Numa estação qualquer, responder errado de propósito.
2. **Esperado**: aparece a explicação do raciocínio correto, e dá pra avançar para a
   próxima pergunta/estação normalmente — sem nenhuma trava.

## 6. Validar reabertura de estação já concluída (User Story 2, cenário 2)

1. Voltar ao mapa depois de concluir pelo menos uma estação.
2. Clicar novamente nessa estação já concluída.
3. **Esperado**: o jogo permite refazer a estação ("Refazer com outros valores"),
   sem exigir refazer as estações entre ela e a atual.

## 7. Validar perguntas de Big-O por reconhecimento de padrão (FR-011, User Story 3)

1. Chegar nas estações do bloco "Aula 02 — Big-O" (Classes de Complexidade e Regras
   de Simplificação).
2. **Esperado**: os enunciados mostram trecho de código Python ou tabela de razão
   numérica — nunca uma prova algébrica pura nem dedução matemática formal.

## 8. Validar rank e certificado com o total certo de estações (research.md #2)

1. Completar algumas estações regulares (menos de 12) e observar o texto de
   progresso no mapa.
2. **Esperado**: o texto diz "X de 12 estações concluídas" (não "de 8").
3. Completar as 12 e o boss; abrir o certificado final.
4. **Esperado**: o rank exibido é o último da lista de 13 ranks da trilha LPP (não
   um rank "intermediário" de índice 8 herdado do código antigo).
5. Repetir uma checagem rápida na trilha "Arquitetura de Computadores" (8
   estações) para confirmar que o texto ainda diz "de 8 estações" e o rank final
   continua correto — a generalização não pode ter quebrado a trilha existente.

## 9. Revisão pedagógica (Princípio III — pré-requisito de lançamento)

Antes de usar com T33F2/T34F2: revisar manualmente cada gerador de pergunta contra
o material-fonte do professor (slides das Aulas 01-03), com atenção especial a
FR-011 (Big-O sem álgebra) e FR-012 (sem autômatos formais). Este passo não é
automatizável — é checklist humano, não teste de código.
