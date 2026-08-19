import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { criarAppDeTeste, seedProfessor } from './setup.js';

describe('alunos', () => {
  let app;

  beforeEach(() => {
    app = criarAppDeTeste();
    seedProfessor(app, 'ademar', 'senha-correta-123');
  });

  async function login() {
    const resp = await request(app)
      .post('/api/login')
      .send({ usuario: 'ademar', senha: 'senha-correta-123' });
    return resp.body.token;
  }

  it('rejeita cadastro com e-mail fora do domínio institucional (FR-016)', async () => {
    const resp = await request(app).post('/api/alunos/cadastro').send({
      nome: 'Aluno Teste', idade: 20, matricula: '2026001', turma: 'T33F2', email: 'aluno@gmail.com',
    });
    expect(resp.status).toBe(400);
    expect(resp.body.mensagem).toContain('unidavi.edu.br');
  });

  it('rejeita cadastro com turma inválida (FR-013)', async () => {
    const resp = await request(app).post('/api/alunos/cadastro').send({
      nome: 'Aluno Teste', idade: 20, matricula: '2026002', turma: 'T99X9', email: 'aluno@unidavi.edu.br',
    });
    expect(resp.status).toBe(400);
  });

  it('cadastro válido cria o aluno; matrícula repetida atualiza em vez de duplicar', async () => {
    const dadosIniciais = {
      nome: 'Aluno Um', idade: 19, matricula: '2026003', turma: 'T33F2', email: 'aluno1@unidavi.edu.br',
    };
    const resp1 = await request(app).post('/api/alunos/cadastro').send(dadosIniciais);
    expect(resp1.status).toBe(200);

    const dadosAtualizados = { ...dadosIniciais, nome: 'Aluno Um Atualizado', idade: 20 };
    const resp2 = await request(app).post('/api/alunos/cadastro').send(dadosAtualizados);
    expect(resp2.status).toBe(200);

    const token = await login();
    const listaResp = await request(app).get('/api/alunos').set('Authorization', `Bearer ${token}`);
    expect(listaResp.body.alunos).toHaveLength(1);
    expect(listaResp.body.alunos[0].nome).toBe('Aluno Um Atualizado');
  });

  it('GET /api/alunos exige autenticação', async () => {
    const resp = await request(app).get('/api/alunos');
    expect(resp.status).toBe(401);
  });

  it('autocadastro gera senha padrão a partir do e-mail (FR-006)', async () => {
    await request(app).post('/api/alunos/cadastro').send({
      nome: 'Aluno Senha', idade: 20, matricula: '2026004', turma: 'T33F2', email: 'aluno.senha@unidavi.edu.br',
    });

    const loginErrado = await request(app).post('/api/alunos/login').send({ identificador: '2026004', senha: 'errada' });
    expect(loginErrado.status).toBe(401);

    const loginCerto = await request(app).post('/api/alunos/login').send({ identificador: '2026004', senha: 'aluno.senha' });
    expect(loginCerto.status).toBe(200);
    expect(loginCerto.body.precisaTrocarSenha).toBe(true);
  });
});

describe('importação em lote (US1, feature 002)', () => {
  let app;
  let token;

  beforeEach(async () => {
    app = criarAppDeTeste();
    seedProfessor(app, 'ademar', 'senha-correta-123');
    const resp = await request(app).post('/api/login').send({ usuario: 'ademar', senha: 'senha-correta-123' });
    token = resp.body.token;
  });

  it('cria alunos novos, atualiza existentes e rejeita linha inválida numa mesma importação (FR-001 a FR-005)', async () => {
    await request(app).post('/api/alunos/cadastro').send({
      nome: 'Já Existia', idade: 21, matricula: '3001', turma: 'T33F2', email: 'ja.existia@unidavi.edu.br',
    });

    const linhas = [
      '3001,Já Existia Atualizado,ja.existia@unidavi.edu.br,T34F2',
      '3002,Aluno Novo,aluno.novo@unidavi.edu.br,T33F2',
      '3003,Aluno Ruim,fora-do-dominio@gmail.com,T33F2',
    ].join('\n');

    const resp = await request(app)
      .post('/api/alunos/importar')
      .set('Authorization', `Bearer ${token}`)
      .send({ linhas });

    expect(resp.status).toBe(200);
    expect(resp.body.criados).toBe(1);
    expect(resp.body.atualizados).toBe(1);
    expect(resp.body.rejeitados).toHaveLength(1);
    expect(resp.body.rejeitados[0].motivo).toContain('domínio institucional');

    const loginNovo = await request(app).post('/api/alunos/login').send({ identificador: '3002', senha: 'aluno.novo' });
    expect(loginNovo.status).toBe(200);
  });

  it('reimportar a mesma matrícula não gera nova senha (Edge Case)', async () => {
    const linha = '3004,Aluno Repetido,repetido@unidavi.edu.br,T33F2';
    await request(app).post('/api/alunos/importar').set('Authorization', `Bearer ${token}`).send({ linhas: linha });

    const loginAntesTrocaSenha = await request(app).post('/api/alunos/login').send({ identificador: '3004', senha: 'repetido' });
    const trocarSenha = await request(app)
      .post('/api/alunos/senha')
      .set('Authorization', `Bearer ${loginAntesTrocaSenha.body.token}`)
      .send({ novaSenha: 'senha-nova-do-aluno' });
    expect(trocarSenha.status).toBe(200);

    // reimporta a mesma matrícula — não pode resetar a senha que o aluno já trocou
    await request(app).post('/api/alunos/importar').set('Authorization', `Bearer ${token}`).send({ linhas: linha });

    const loginComSenhaPadraoAntiga = await request(app).post('/api/alunos/login').send({ identificador: '3004', senha: 'repetido' });
    expect(loginComSenhaPadraoAntiga.status).toBe(401);

    const loginComSenhaPropria = await request(app).post('/api/alunos/login').send({ identificador: '3004', senha: 'senha-nova-do-aluno' });
    expect(loginComSenhaPropria.status).toBe(200);
  });

  it('POST /api/alunos/importar exige autenticação de professor', async () => {
    const resp = await request(app).post('/api/alunos/importar').send({ linhas: '3005,X,x@unidavi.edu.br,T33F2' });
    expect(resp.status).toBe(401);
  });
});

describe('login e troca de senha do aluno (US2/US3, feature 002)', () => {
  let app;

  beforeEach(async () => {
    app = criarAppDeTeste();
    seedProfessor(app, 'ademar', 'senha-correta-123');
    await request(app).post('/api/alunos/cadastro').send({
      nome: 'Aluno Login', idade: 22, matricula: '4001', turma: 'T33F2', email: 'aluno.login@unidavi.edu.br',
    });
  });

  it('login com senha padrão funciona e sinaliza troca obrigatória (US2, SC-002)', async () => {
    const resp = await request(app).post('/api/alunos/login').send({ identificador: '4001', senha: 'aluno.login' });
    expect(resp.status).toBe(200);
    expect(resp.body.precisaTrocarSenha).toBe(true);
    expect(resp.body.nome).toBe('Aluno Login');
    expect(resp.body.turma).toBe('T33F2');
  });

  it('login com matrícula ou senha incorretos é recusado com mensagem única (FR-007, SC-003)', async () => {
    const resp = await request(app).post('/api/alunos/login').send({ identificador: '4001', senha: 'errada' });
    expect(resp.status).toBe(401);
    expect(resp.body.mensagem).not.toMatch(/matr[ií]cula n[ãa]o|senha incorreta/i);
  });

  it('troca de senha exige token e invalida a senha padrão depois (US3, SC-004, SC-005)', async () => {
    const loginResp = await request(app).post('/api/alunos/login').send({ identificador: '4001', senha: 'aluno.login' });
    const token = loginResp.body.token;

    const semToken = await request(app).post('/api/alunos/senha').send({ novaSenha: 'nova123' });
    expect(semToken.status).toBe(401);

    const trocar = await request(app).post('/api/alunos/senha').set('Authorization', `Bearer ${token}`).send({ novaSenha: 'nova123' });
    expect(trocar.status).toBe(200);

    const loginSenhaAntiga = await request(app).post('/api/alunos/login').send({ identificador: '4001', senha: 'aluno.login' });
    expect(loginSenhaAntiga.status).toBe(401);

    const loginSenhaNova = await request(app).post('/api/alunos/login').send({ identificador: '4001', senha: 'nova123' });
    expect(loginSenhaNova.status).toBe(200);
    expect(loginSenhaNova.body.precisaTrocarSenha).toBe(false);
  });

  it('professor redefine a senha do aluno de volta para a padrão (FR-011)', async () => {
    const loginInicial = await request(app).post('/api/alunos/login').send({ identificador: '4001', senha: 'aluno.login' });
    await request(app).post('/api/alunos/senha').set('Authorization', `Bearer ${loginInicial.body.token}`).send({ novaSenha: 'senha-propria' });

    const professorLogin = await request(app).post('/api/login').send({ usuario: 'ademar', senha: 'senha-correta-123' });
    const redefinir = await request(app)
      .post('/api/alunos/4001/redefinir-senha')
      .set('Authorization', `Bearer ${professorLogin.body.token}`);
    expect(redefinir.status).toBe(200);

    const loginComPadraoDeNovo = await request(app).post('/api/alunos/login').send({ identificador: '4001', senha: 'aluno.login' });
    expect(loginComPadraoDeNovo.status).toBe(200);
    expect(loginComPadraoDeNovo.body.precisaTrocarSenha).toBe(true);
  });

  it('redefinir senha de matrícula inexistente retorna 404', async () => {
    const professorLogin = await request(app).post('/api/login').send({ usuario: 'ademar', senha: 'senha-correta-123' });
    const resp = await request(app)
      .post('/api/alunos/9999999/redefinir-senha')
      .set('Authorization', `Bearer ${professorLogin.body.token}`);
    expect(resp.status).toBe(404);
  });
});

describe('login por e-mail ou matrícula (feature 004)', () => {
  let app;

  beforeEach(async () => {
    app = criarAppDeTeste();
    seedProfessor(app, 'ademar', 'senha-correta-123');
    await request(app).post('/api/alunos/cadastro').send({
      nome: 'Aluno Email', idade: 21, matricula: '5001', turma: 'T33F2', email: 'Fulano.Teste@unidavi.edu.br',
    });
  });

  it('loga com e-mail (FR-001, SC-001) e devolve a matrícula real na resposta', async () => {
    const resp = await request(app).post('/api/alunos/login').send({ identificador: 'fulano.teste@unidavi.edu.br', senha: 'fulano.teste' });
    expect(resp.status).toBe(200);
    expect(resp.body.matricula).toBe('5001');
  });

  it('comparação de e-mail é case-insensitive (FR-003, research.md #3)', async () => {
    const respMinusculo = await request(app).post('/api/alunos/login').send({ identificador: 'fulano.teste@unidavi.edu.br', senha: 'fulano.teste' });
    const respOriginal = await request(app).post('/api/alunos/login').send({ identificador: 'Fulano.Teste@unidavi.edu.br', senha: 'fulano.teste' });
    expect(respMinusculo.status).toBe(200);
    expect(respOriginal.status).toBe(200);
  });

  it('login por matrícula continua funcionando (FR-004, SC-002 — regressão)', async () => {
    const resp = await request(app).post('/api/alunos/login').send({ identificador: '5001', senha: 'fulano.teste' });
    expect(resp.status).toBe(200);
    expect(resp.body.matricula).toBe('5001');
  });

  it('e-mail inexistente e matrícula existente com senha errada dão a mesma resposta (US2, FR-005, SC-003)', async () => {
    const respEmailInexistente = await request(app).post('/api/alunos/login').send({ identificador: 'naoexiste@unidavi.edu.br', senha: 'qualquer' });
    const respSenhaErrada = await request(app).post('/api/alunos/login').send({ identificador: '5001', senha: 'senhaerrada' });
    expect(respEmailInexistente.status).toBe(401);
    expect(respSenhaErrada.status).toBe(401);
    expect(respEmailInexistente.body.mensagem).toBe(respSenhaErrada.body.mensagem);
  });
});
