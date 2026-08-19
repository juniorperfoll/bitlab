// Roteador mínimo do Worker. Sem framework — despacho manual por método/rota,
// resposta JSON padronizada, CORS e handler 404. Rotas de auth/alunos/habilitações
// são registradas por seus respectivos módulos (ver T022, T029).

import { jsonResponse, errorResponse, CORS_HEADERS } from './http.js';
import { loginHandler, logoutHandler } from './auth.js';
import { listarAlunosHandler, cadastroHandler } from './alunos.js';
import {
  habilitarTurmaHandler,
  revogarTurmaHandler,
  habilitarAlunoHandler,
  revogarAlunoHandler,
  verificarHabilitacaoHandler,
} from './habilitacoes.js';

const routes = [];

// pattern: string com segmentos fixos ou `:param`, ex.: '/api/alunos/:matricula'
export function addRoute(method, pattern, handler) {
  const paramNames = [];
  const regex = new RegExp(
    '^' +
      pattern
        .split('/')
        .map((seg) => {
          if (seg.startsWith(':')) {
            paramNames.push(seg.slice(1));
            return '([^/]+)';
          }
          return seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        })
        .join('/') +
      '$'
  );
  routes.push({ method, regex, paramNames, handler });
}

async function handleRequest(request, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  const url = new URL(request.url);

  for (const route of routes) {
    if (route.method !== request.method) continue;
    const match = url.pathname.match(route.regex);
    if (!match) continue;

    const params = {};
    route.paramNames.forEach((name, i) => {
      params[name] = decodeURIComponent(match[i + 1]);
    });

    try {
      return await route.handler({ request, env, params, url });
    } catch (err) {
      return errorResponse('Erro interno. Tente novamente em instantes.', 500);
    }
  }

  return errorResponse('Rota não encontrada.', 404);
}

addRoute('GET', '/api/health', async () => jsonResponse({ ok: true }));

addRoute('POST', '/api/login', loginHandler);
addRoute('POST', '/api/logout', logoutHandler);
addRoute('GET', '/api/alunos', listarAlunosHandler);
addRoute('POST', '/api/turmas/:turma/habilitacoes', habilitarTurmaHandler);
addRoute('DELETE', '/api/turmas/:turma/habilitacoes/:trilha', revogarTurmaHandler);
addRoute('POST', '/api/alunos/:matricula/habilitacoes', habilitarAlunoHandler);
addRoute('DELETE', '/api/alunos/:matricula/habilitacoes/:trilha', revogarAlunoHandler);
addRoute('POST', '/api/alunos/cadastro', cadastroHandler);
addRoute('GET', '/api/alunos/:matricula/habilitacoes/:trilha', verificarHabilitacaoHandler);

export default {
  fetch: (request, env) => handleRequest(request, env),
};
