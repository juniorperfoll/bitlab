# Research: Arte Pixel do Pacote Modern Interiors (versão gratuita)

## 1. Contrato de nomes de arquivo (sem acesso ao conteúdo real do pacote)

**Decision**: definir um manifesto próprio, com nomes semânticos
escolhidos pelo projeto (não os nomes internos do pacote, que não são
conhecidos nesta rodada — nenhuma ferramenta disponível consegue baixar o
`.zip` do itch.io). O usuário, ao extrair o pacote gratuito, deve
selecionar/recortar as peças correspondentes e salvá-las com esses nomes
dentro de `backend/public/assets/moderninteriors/`:

| Arquivo esperado | Papel na sala |
|---|---|
| `piso.png` | tile de piso, repetido em toda célula não-parede da grade |
| `parede.png` | tile de parede, repetido em toda célula de parede/borda |
| `terminal.png` | sprite do terminal/console (célula única) |
| `personagem.png` | sprite do personagem controlável (célula única) |

**Rationale**: sem o arquivo `.zip` em mãos, mapear nomes internos reais
do pacote seria inventar informação. Um contrato próprio, com nomes
descritivos e só 4 arquivos, é simples o bastante para o usuário preparar
manualmente a partir do que a versão gratuita contém (mesmo sem eu saber
os nomes originais), e mantém o carregador de imagem simples (sem
depender de um spritesheet único fatiado por coordenadas específicas do
pacote, que exigiria conhecer o layout exato do arquivo real).

**Alternatives considered**:
- Carregar um spritesheet único do pacote e recortar por coordenadas de
  pixel — rejeitado nesta rodada: exigiria saber o layout exato do
  arquivo real (linhas/colunas, offset de cada tile), informação que não
  tenho sem o arquivo. Pode ser revisitado depois que os arquivos reais
  estiverem disponíveis, como um refinamento não-bloqueante.

## 2. Tamanho de tile e escala

**Decision**: assumir tiles de 16×16px (o menor tamanho listado no
pacote) como base, desenhados via `drawImage()` esticando cada tile para
o tamanho de célula da grade da sala já existente (feature 008: canvas
960×380px, grade 12×8 → células de 80×47,5px). `image-rendering:
pixelated` no CSS do canvas evita borrão no redimensionamento.

**Rationale**: 16×16 é o tamanho mais provável de estar completo na
versão gratuita (pacotes desse estilo costumam disponibilizar a base em
16×16 mesmo nas versões reduzidas) e redimensionar via canvas é suficiente
sem exigir que o usuário entregue um arquivo pré-escalado.

**Alternatives considered**:
- Mudar o tamanho da grade da sala para bater exatamente com um múltiplo
  de 16px — rejeitado: mudaria a geometria já validada pela simulação
  automatizada da feature 008 (`sala2d.test.js` assume 12×8 células e
  posições específicas); redimensionar a imagem no desenho é uma mudança
  bem mais localizada.

## 3. Fallback gracioso sem os arquivos reais (FR-004)

**Decision**: a função de desenho existente da feature 008
(`desenharSala`) é renomeada para `desenharSalaFormas` e mantida
byte-a-byte igual — vira o caminho de fallback. Uma nova
`desenharSalaComSprites` é adicionada ao lado. Uma nova `desenharSala`
vira um pequeno despachante: chama a versão com sprites só se **todas**
as 4 imagens do manifesto carregaram com sucesso (`salaSpritesProntos ===
true`); caso contrário (incluindo enquanto ainda estão carregando, ou se
qualquer uma falhar com 404), usa o fallback geométrico.

**Rationale**: cumpre FR-004 literalmente — sem os arquivos, o jogo
continua exatamente como a feature 008 deixou (nenhuma regressão), porque
o código de fallback é o código antigo, inalterado. Como o carregamento de
imagem é assíncrono e feito uma vez (não bloqueia a exibição inicial da
sala), a troca de geométrico → sprites acontece sozinha assim que (e se) o
usuário adicionar os arquivos reais e a página for recarregada — sem
precisar de nenhum código adicional.

**Alternatives considered**:
- Bloquear a exibição da sala até as imagens carregarem (tela de
  carregamento) — rejeitado: pior experiência quando os arquivos estão
  ausentes (trava a sala indefinidamente ou exige tratamento de timeout),
  contra FR-004.

## 4. Porta continua sem sprite dedicado

**Decision**: o desenho da porta (célula trancada/destrancada) continua
sendo um retângulo colorido simples, mesmo no modo com sprites — não faz
parte do manifesto de 4 arquivos.

**Rationale**: manter o manifesto mínimo (o que dá pra confirmar que
existe na versão gratuita: piso, parede, um móvel, um personagem) evita
depender de uma peça específica (ex.: uma porta de determinado estilo)
que pode não estar presente na versão reduzida. Um retângulo colorido
para a porta já comunica bem o estado (trancada/destrancada) e não
compromete a leitura visual da sala.

**Alternatives considered**:
- Incluir um 5º arquivo `porta.png` no manifesto — rejeitado por ora:
  pode ser adicionado depois, sem quebrar nada, se o usuário confirmar
  que tem uma peça adequada na versão gratuita; não é um requisito da
  spec (FR-001/FR-002 cobrem só piso/parede/personagem + terminal).
