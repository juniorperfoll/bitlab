# Data Model: Trilha LPP — Fundamentos, Paradigmas e Big-O (Aulas 01–03)

Nenhuma entidade persistida (banco de dados) muda nesta feature — ver plan.md →
Technical Context → Storage. O único "modelo de dados" aqui é a estrutura em
memória do front-end (`TRAILS.linguagens` em `backend/public/index.html`),
documentada abaixo para orientar a fase de implementação.

## Estrutura em memória: `TRAILS.linguagens`

```text
TRAILS.linguagens = {
  nome: string,               // "LPP — Fundamentos e Paradigmas"
  desc: string,                // descrição curta exibida na seleção de trilha
  stages: Estacao[12],          // 12 estações regulares + tratamento do boss à parte
  ranks: string[13]              // índices 0-12, um rank por quantidade de estações
                                  // regulares concluídas (0 = nenhuma, 12 = todas)
}
```

### Estação (elemento de `stages`)

| Campo | Tipo | Regra |
|---|---|---|
| `id` | string | identificador único da estação dentro da trilha (ex.: `'e1'`...`'e12'`, `'boss'`) |
| `num` | number \| `'★'` | número de exibição (1-12) ou `'★'` para o boss |
| `nome` | string | título curto da estação (Apêndice A do spec.md) |
| `desc` | string | descrição curta exibida no painel do mapa |
| `bloco` | `'Aula 01'` \| `'Aula 02'` \| `'Aula 03'` \| `undefined` | **novo campo** desta feature (research.md #1); `undefined` só para o boss, que não pertence a nenhum bloco |
| `cor` | string (hex) | cor do nó no mapa — dentro da família de cor do bloco (research.md #1) |
| `boss` | boolean \| `undefined` | `true` só na estação boss |
| `pool` | função[] | array de geradores de pergunta (mínimo 3 por estação regular, FR-010) |

**Validações**:
- Exatamente 12 elementos de `stages` MUST ter `boss` ausente/false (as estações
  regulares) e exatamente 1 MUST ter `boss:true`.
- Toda estação regular MUST ter `bloco` preenchido com um dos 3 valores válidos; a
  estação boss NÃO tem `bloco`.
- `ranks` MUST ter exatamente 13 elementos (ver research.md #2 — generalização do
  antigo hardcode de 8).
- Cada `pool` MUST ter no mínimo 3 geradores (FR-010).

### Gerador de pergunta (elemento de `pool`)

Mesmo contrato já usado em toda estação existente do projeto (nenhuma mudança de
formato) — função sem argumentos que retorna:

```text
{ tag, tipo: 'escolha', enun, dica, opcoes: string[], correta: number, exp }
```

(campos adicionais conforme `tipo` variar, mesmo padrão documentado em
`specs/001-duas-trilhas-admin-professor/research.md` #6).

## O que NÃO muda

- Tabela `habilitacoes` do backend: continua guardando só `trilha: 'linguagens'`
  como string — indiferente ao conteúdo interno da trilha.
- Tabela `alunos`: nenhum campo novo.
- Nenhuma nova rota de API.
