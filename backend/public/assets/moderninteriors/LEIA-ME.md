# Assets — Modern Interiors (versão gratuita)

Pacote de arte pixel usado na sala 2D do jogo (feature 009):
[Modern Interiors por LimeZu](https://limezu.itch.io/moderninteriors) —
versão gratuita (`Modern_Interiors_Free_v2.2.zip`), fornecida pelo
usuário na raiz do repositório e já recortada/aplicada.

**Licença da versão gratuita** (ver `LICENSE.txt` nesta pasta, texto
original do pacote): uso permitido **só em projetos não comerciais**
(este projeto é material didático gratuito da UNIDAVI, sem fins
lucrativos — dentro do permitido), pode editar/recortar os sprites para
uso não comercial, **crédito ao autor obrigatório** (já incluído no
rodapé do jogo e no `README.md` do projeto) e **não pode revender os
arquivos editados nem redistribuir os originais** — como este
repositório é privado, versionar os recortes aqui dentro não infringe
essa restrição.

## Arquivos aplicados

Recortados de `Modern tiles_Free/` (zip extraído) e salvos aqui:

| Arquivo | Origem no pacote | Papel na sala |
|---|---|---|
| `piso.png` | `Interiors_free/16x16/Room_Builder_free_16x16.png`, tile coluna 8 linha 12 (16×16) | piso de madeira, repetido em toda célula não-parede |
| `parede.png` | `Interiors_free/16x16/Room_Builder_free_16x16.png`, tile coluna 14 linha 5 (16×16) | textura de pedra/concreto, repetida em toda célula de parede/borda |
| `terminal.png` | `Interiors_free_16x16.png`, recorte coluna 3, linhas 3-4 (16×32 — monitor + mesa) | sprite do terminal da missão, desenhado "de pé" na célula |
| `personagem.png` | `Characters_free/Bob_idle_16x16.png`, recorte coluna 0, linhas 0-1 (16×32 — corpo inteiro) | sprite do personagem controlável |

`terminal.png` e `personagem.png` são 16×32 (o dobro da altura de uma
célula da grade) porque os sprites originais incluem corpo/móvel
completo, não só uma "cabeça" quadrada — `desenharSalaComSprites()` já
desenha os dois com os pés/base na célula correta.

## Comportamento sem os arquivos

Se estes arquivos forem removidos, a sala volta automaticamente ao
desenho geométrico simples da feature 008 — nenhum erro, nenhuma trava
(ver `specs/009-assets-moderninteriors/spec.md`, FR-004).
