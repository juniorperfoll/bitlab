import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { criarAppDeTeste, seedProfessor } from './setup.js';

describe('auth', () => {
  let app;

  beforeEach(() => {
    app = criarAppDeTeste();
    seedProfessor(app, 'ademar', 'senha-correta-123');
  });

  it('login com credenciais corretas retorna token', async () => {
    const resp = await request(app)
      .post('/api/login')
      .send({ usuario: 'ademar', senha: 'senha-correta-123' });
    expect(resp.status).toBe(200);
    expect(typeof resp.body.token).toBe('string');
    expect(resp.body.token.length).toBeGreaterThan(10);
  });

  it('login com senha incorreta retorna 401 sem bloqueio (FR-019)', async () => {
    const resp = await request(app)
      .post('/api/login')
      .send({ usuario: 'ademar', senha: 'senha-errada' });
    expect(resp.status).toBe(401);
    expect(resp.body.mensagem).toContain('incorretos');
  });

  it('login com usuário inexistente retorna 401', async () => {
    const resp = await request(app).post('/api/login').send({ usuario: 'ninguem', senha: 'x' });
    expect(resp.status).toBe(401);
  });

  it('logout limpa o token e sessões antigas deixam de ser válidas', async () => {
    const loginResp = await request(app)
      .post('/api/login')
      .send({ usuario: 'ademar', senha: 'senha-correta-123' });
    const { token } = loginResp.body;

    const logoutResp = await request(app)
      .post('/api/logout')
      .set('Authorization', `Bearer ${token}`);
    expect(logoutResp.status).toBe(200);

    const segundoLogout = await request(app)
      .post('/api/logout')
      .set('Authorization', `Bearer ${token}`);
    expect(segundoLogout.status).toBe(401);
  });
});
