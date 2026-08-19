import { describe, it, expect, beforeEach } from 'vitest';
import { env } from 'cloudflare:test';
import { loginHandler, logoutHandler } from '../src/auth.js';
import { resetDb, seedProfessor, requestJSON } from './setup.js';

describe('auth', () => {
  beforeEach(async () => {
    await resetDb(env);
    await seedProfessor(env, 'ademar', 'senha-correta-123');
  });

  it('login com credenciais corretas retorna token', async () => {
    const request = requestJSON('POST', { usuario: 'ademar', senha: 'senha-correta-123' });
    const resp = await loginHandler({ request, env });
    expect(resp.status).toBe(200);
    const dados = await resp.json();
    expect(typeof dados.token).toBe('string');
    expect(dados.token.length).toBeGreaterThan(10);
  });

  it('login com senha incorreta retorna 401 sem bloqueio (FR-019)', async () => {
    const request = requestJSON('POST', { usuario: 'ademar', senha: 'senha-errada' });
    const resp = await loginHandler({ request, env });
    expect(resp.status).toBe(401);
    const dados = await resp.json();
    expect(dados.mensagem).toContain('incorretos');
  });

  it('login com usuário inexistente retorna 401', async () => {
    const request = requestJSON('POST', { usuario: 'ninguem', senha: 'x' });
    const resp = await loginHandler({ request, env });
    expect(resp.status).toBe(401);
  });

  it('logout limpa o token e sessões antigas deixam de ser válidas', async () => {
    const loginResp = await loginHandler({
      request: requestJSON('POST', { usuario: 'ademar', senha: 'senha-correta-123' }),
      env,
    });
    const { token } = await loginResp.json();

    const logoutResp = await logoutHandler({
      request: requestJSON('POST', undefined, { Authorization: `Bearer ${token}` }),
      env,
    });
    expect(logoutResp.status).toBe(200);

    const segundoLogout = await logoutHandler({
      request: requestJSON('POST', undefined, { Authorization: `Bearer ${token}` }),
      env,
    });
    expect(segundoLogout.status).toBe(401);
  });
});
