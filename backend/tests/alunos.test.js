import { describe, it, expect, beforeEach } from 'vitest';
import { env } from 'cloudflare:test';
import { loginHandler } from '../src/auth.js';
import { cadastroHandler, listarAlunosHandler } from '../src/alunos.js';
import { resetDb, seedProfessor, requestJSON } from './setup.js';

async function login() {
  const resp = await loginHandler({
    request: requestJSON('POST', { usuario: 'ademar', senha: 'senha-correta-123' }),
    env,
  });
  return (await resp.json()).token;
}

describe('alunos', () => {
  beforeEach(async () => {
    await resetDb(env);
    await seedProfessor(env, 'ademar', 'senha-correta-123');
  });

  it('rejeita cadastro com e-mail fora do domínio institucional (FR-016)', async () => {
    const request = requestJSON('POST', {
      nome: 'Aluno Teste', idade: 20, matricula: '2026001', turma: 'T33F2', email: 'aluno@gmail.com',
    });
    const resp = await cadastroHandler({ request, env });
    expect(resp.status).toBe(400);
    const dados = await resp.json();
    expect(dados.mensagem).toContain('unidavi.edu.br');
  });

  it('rejeita cadastro com turma inválida (FR-013)', async () => {
    const request = requestJSON('POST', {
      nome: 'Aluno Teste', idade: 20, matricula: '2026002', turma: 'T99X9', email: 'aluno@unidavi.edu.br',
    });
    const resp = await cadastroHandler({ request, env });
    expect(resp.status).toBe(400);
  });

  it('cadastro válido cria o aluno; matrícula repetida atualiza em vez de duplicar', async () => {
    const dadosIniciais = {
      nome: 'Aluno Um', idade: 19, matricula: '2026003', turma: 'T33F2', email: 'aluno1@unidavi.edu.br',
    };
    const resp1 = await cadastroHandler({ request: requestJSON('POST', dadosIniciais), env });
    expect(resp1.status).toBe(200);

    const dadosAtualizados = { ...dadosIniciais, nome: 'Aluno Um Atualizado', idade: 20 };
    const resp2 = await cadastroHandler({ request: requestJSON('POST', dadosAtualizados), env });
    expect(resp2.status).toBe(200);

    const token = await login();
    const listaResp = await listarAlunosHandler({
      request: requestJSON('GET', undefined, { Authorization: `Bearer ${token}` }),
      env,
    });
    const { alunos } = await listaResp.json();
    expect(alunos).toHaveLength(1);
    expect(alunos[0].nome).toBe('Aluno Um Atualizado');
  });

  it('GET /api/alunos exige autenticação', async () => {
    const resp = await listarAlunosHandler({ request: requestJSON('GET'), env });
    expect(resp.status).toBe(401);
  });
});
