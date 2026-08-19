import {
  getAlunoByMatricula,
  upsertHabilitacaoTurma,
  deleteHabilitacaoTurma,
  upsertHabilitacaoIndividual,
  deleteHabilitacaoIndividual,
  getHabilitacaoResolvida,
} from './db.js';
import { jsonResponse, errorResponse } from './http.js';
import { exigirAuth } from './auth.js';

export const TURMAS_VALIDAS = ['T33F2', 'T34F2'];
export const TRILHAS_VALIDAS = ['arquitetura', 'linguagens'];

function turmaValida(turma) {
  return TURMAS_VALIDAS.includes(turma);
}

function trilhaValida(trilha) {
  return TRILHAS_VALIDAS.includes(trilha);
}

// POST /api/turmas/:turma/habilitacoes (auth) — FR-007, SC-001.
export async function habilitarTurmaHandler({ request, env, params }) {
  const { erro } = await exigirAuth(request, env);
  if (erro) return erro;

  if (!turmaValida(params.turma)) {
    return errorResponse('Turma inválida. Use T33F2 ou T34F2.', 400);
  }

  const body = await request.json().catch(() => null);
  if (!body || !trilhaValida(body.trilha)) {
    return errorResponse('Trilha inválida.', 400);
  }

  await upsertHabilitacaoTurma(env.DB, params.turma, body.trilha, true);
  return jsonResponse({ ok: true });
}

// DELETE /api/turmas/:turma/habilitacoes/:trilha (auth) — revoga a habilitação em
// lote da turma (não afeta exceções individuais já concedidas separadamente).
export async function revogarTurmaHandler({ request, env, params }) {
  const { erro } = await exigirAuth(request, env);
  if (erro) return erro;

  if (!turmaValida(params.turma) || !trilhaValida(params.trilha)) {
    return errorResponse('Turma ou trilha inválida.', 400);
  }

  await deleteHabilitacaoTurma(env.DB, params.turma, params.trilha);
  return jsonResponse({ ok: true });
}

// POST /api/alunos/:matricula/habilitacoes (auth) — FR-008: concede ou revoga
// (concedida:false) individualmente, inclusive como exceção sobre a turma.
export async function habilitarAlunoHandler({ request, env, params }) {
  const { erro } = await exigirAuth(request, env);
  if (erro) return erro;

  const aluno = await getAlunoByMatricula(env.DB, params.matricula);
  if (!aluno) {
    return errorResponse('Aluno não encontrado para essa matrícula.', 404);
  }

  const body = await request.json().catch(() => null);
  if (!body || !trilhaValida(body.trilha) || typeof body.concedida !== 'boolean') {
    return errorResponse('Informe trilha válida e concedida (true/false).', 400);
  }

  await upsertHabilitacaoIndividual(env.DB, aluno.id, body.trilha, body.concedida);
  return jsonResponse({ ok: true });
}

// DELETE /api/alunos/:matricula/habilitacoes/:trilha (auth) — remove a exceção
// individual, voltando a valer só a habilitação de turma (se houver).
export async function revogarAlunoHandler({ request, env, params }) {
  const { erro } = await exigirAuth(request, env);
  if (erro) return erro;

  const aluno = await getAlunoByMatricula(env.DB, params.matricula);
  if (!aluno) {
    return errorResponse('Aluno não encontrado para essa matrícula.', 404);
  }

  if (!trilhaValida(params.trilha)) {
    return errorResponse('Trilha inválida.', 400);
  }

  await deleteHabilitacaoIndividual(env.DB, aluno.id, params.trilha);
  return jsonResponse({ ok: true });
}

// GET /api/alunos/:matricula/habilitacoes/:trilha (público) — FR-009, US3.
// Chamado pelo index.html antes de iniciar a trilha escolhida.
export async function verificarHabilitacaoHandler({ params, env }) {
  if (!trilhaValida(params.trilha)) {
    return errorResponse('Trilha inválida.', 400);
  }

  const habilitado = await getHabilitacaoResolvida(env.DB, params.matricula, params.trilha);
  return jsonResponse({ habilitado });
}
