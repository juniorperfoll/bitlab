// Helpers de resposta HTTP compartilhados — separados de index.js só para evitar
// import circular entre o roteador e os módulos de rota (auth.js, alunos.js,
// habilitacoes.js), que precisam desses helpers.

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

export function errorResponse(mensagem, status = 400) {
  return jsonResponse({ mensagem }, status);
}
