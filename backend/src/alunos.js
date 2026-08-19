import { listAlunosComHabilitacoes, upsertAluno } from './db.js';
import { jsonResponse, errorResponse } from './http.js';
import { exigirAuth } from './auth.js';
import { TURMAS_VALIDAS } from './habilitacoes.js';

// GET /api/alunos (auth) — lista alunos com habilitações por trilha, para o
// painel administrativo renderizar a tela de gestão.
export async function listarAlunosHandler({ request, env }) {
  const { erro } = await exigirAuth(request, env);
  if (erro) return erro;

  const alunos = await listAlunosComHabilitacoes(env.DB);
  return jsonResponse({ alunos });
}

const DOMINIO_INSTITUCIONAL = '@unidavi.edu.br';

// POST /api/alunos/cadastro (público) — cria/atualiza cadastro do aluno.
// FR-016: só e-mail do domínio institucional. FR-013: só T33F2/T34F2.
export async function cadastroHandler({ request, env }) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return errorResponse('Dados de cadastro inválidos.', 400);
  }

  const { nome, idade, matricula, turma, email } = body;
  if (!nome || !matricula || !turma || !email || !idade) {
    return errorResponse('Preencha nome, idade, matrícula, turma e e-mail.', 400);
  }

  if (!TURMAS_VALIDAS.includes(turma)) {
    return errorResponse('Turma inválida. Use T33F2 ou T34F2.', 400);
  }

  if (!String(email).toLowerCase().endsWith(DOMINIO_INSTITUCIONAL)) {
    return errorResponse('Use um e-mail institucional do domínio @unidavi.edu.br.', 400);
  }

  await upsertAluno(env.DB, { matricula, nome, idade, turma, email });
  return jsonResponse({ ok: true });
}
