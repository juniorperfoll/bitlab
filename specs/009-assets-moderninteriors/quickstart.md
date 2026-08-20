# Quickstart: Aplicando os arquivos de arte e validando

## 1. Preparar os arquivos (fora deste repositório)

1. Baixar `Modern_Interiors_Free_v2.2.zip` em
   https://limezu.itch.io/moderninteriors (versão gratuita).
2. Extrair o `.zip` e escolher/recortar:
   - um tile de piso de interior → salvar como `piso.png`
   - um tile de parede → salvar como `parede.png`
   - um objeto de mobília (ex.: uma mesa/console) → salvar como `terminal.png`
   - um sprite de personagem (parado, de frente) → salvar como `personagem.png`
3. Copiar os 4 arquivos para `backend/public/assets/moderninteriors/`
   dentro deste repositório.

## 2. Rodar o teste automatizado (confirma que nada quebrou)

```bash
cd backend
npm test -- sala2d
```

**Esperado**: continua passando — o teste não depende de os arquivos de
imagem existirem (valida comportamento/estado, não pixels), conforme
research.md #3.

## 3. Validar o fallback SEM os arquivos (FR-004, SC-002)

1. Sem adicionar nenhum arquivo em `backend/public/assets/moderninteriors/`
   (estado padrão deste repositório), rodar `npm run dev` e abrir a sala
   da estação 1.
2. **Esperado**: a sala aparece exatamente como na feature 008 — formas
   geométricas coloridas, totalmente jogável, sem erro no console (fora
   de um aviso informativo sobre sprite ausente).

## 4. Validar a troca visual COM os arquivos (FR-001, FR-002, SC-001)

1. Adicionar os 4 arquivos (passo 1) e recarregar a página.
2. **Esperado**: piso e paredes da sala aparecem com os tiles do pacote
   (não mais retângulos de cor sólida); o personagem aparece com o sprite
   escolhido (não mais um círculo verde).
3. Mover, colidir, interagir com o terminal e concluir a missão.
4. **Esperado**: comportamento idêntico ao da feature 008 — só a
   aparência mudou.

## 5. Validar o crédito ao autor (FR-005, FR-006, SC-003)

1. Rolar até o rodapé do jogo.
2. **Esperado**: aparece "Arte: Modern Interiors por LimeZu
   (limezu.itch.io/moderninteriors)".
3. Abrir `README.md`.
4. **Esperado**: mesma informação de crédito presente.
