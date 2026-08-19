# Quickstart: Validando o Reposicionamento de Identidade

## 1. Rodar localmente

```bash
cd backend
npm run dev
```

## 2. Validar a tela de splash (FR-001, FR-002, SC-001, SC-002)

1. Abrir `http://localhost:3000/` (a splash aparece antes de qualquer outra tela).
2. **Esperado**: o subtítulo abaixo de "BIT LAB" diz algo como "BACHARELADO EM
   SISTEMAS DE INFORMAÇÃO" — não mais "TRILHA DE ARQUITETURA DE COMPUTADORES".
3. **Esperado**: o rodapé da tela (linha pequena embaixo) diz "Sistemas de
   Informação · UNIDAVI" — não mais "Arquitetura de Computadores · UNIDAVI".

## 3. Validar a barra de identidade persistente (FR-003, SC-001)

1. Tocar/pressionar uma tecla pra sair da splash.
2. **Esperado**: o título no topo da página diz "BIT LAB — TRILHAS DE SISTEMAS DE
   INFORMAÇÃO" (plural "TRILHAS") — não mais citando só Arquitetura de
   Computadores.
3. **Esperado**: a legenda abaixo do título diz "Sistemas de Informação · UNIDAVI"
   — sem a referência a "Aulas 02 e 03" (que é específica de uma trilha).

## 4. Confirmar que nada mais mudou (FR-004, SC-003)

1. Selecionar a trilha "Arquitetura de Computadores" — nome da trilha continua
   igual, jogo funciona normalmente.
2. Selecionar a trilha "LPP — Fundamentos e Paradigmas" — idem.
3. Logar no painel administrativo (`/admin.html`) — funciona normalmente, nenhum
   texto lá foi alterado por esta feature.
