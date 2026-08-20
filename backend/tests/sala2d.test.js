// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HTML_PATH = path.join(__dirname, '..', 'public', 'index.html');
const HTML = readFileSync(HTML_PATH, 'utf8');

function criarJogoDom() {
  return new JSDOM(HTML, {
    url: 'http://localhost/',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    beforeParse(window) {
      // jsdom não implementa matchMedia; o jogo usa `prefers-reduced-motion`
      // logo no carregamento do <script> (REDUZIR_MOVIMENTO), então precisa
      // de um polyfill mínimo antes do parse/execução do script.
      window.matchMedia = function () {
        return {
          matches: false,
          media: '',
          addListener() {},
          removeListener() {},
          addEventListener() {},
          removeEventListener() {},
          dispatchEvent() { return true; },
        };
      };
      // jsdom não implementa scrollIntoView; o jogo chama isso ao mostrar
      // o feedback de resposta (resolver()).
      window.HTMLElement.prototype.scrollIntoView = window.HTMLElement.prototype.scrollIntoView || function () {};
    },
  });
}

function tecla(window, code) {
  window.document.dispatchEvent(new window.KeyboardEvent('keydown', { code, bubbles: true, cancelable: true }));
}

describe('Sala 2D — objetos interativos e validação por acerto (features 010-011)', () => {
  it('cada objeto abre uma pergunta só; erro mantém pendente com retentativa; porta só destrava com tudo certo', () => {
    const dom = criarJogoDom();
    const { window } = dom;
    const el = (id) => window.document.getElementById(id);
    const debug = window.__salaDebug;
    expect(debug).toBeTruthy();

    // entra na trilha (equivalente ao que tentarEntrarNaTrilha faz após login/habilitação)
    window.novoJogo('Aluno Teste', 'T33F2', 20, '2025000001', 'arquitetura');
    window.renderTrilha();
    window.mostrar('telaTrilha');

    expect(debug.sala).toBeTruthy();
    expect(debug.sala.stage.id).toBe('e1');
    expect(debug.sala.trancada).toBe(true);
    expect(el('salaWrap').classList.contains('hidden')).toBe(false);
    expect(el('mapaWrap').classList.contains('hidden')).toBe(true);

    // colisão: andar contra a parede superior deve parar antes da borda
    for (let i = 0; i < 10; i++) tecla(window, 'ArrowUp');
    expect(debug.sala.jogador.y).toBe(1); // linha 0 é parede

    const objetos = debug.sala.objetos;
    const n = objetos.length;
    expect(n).toBeGreaterThan(1); // estação 1 tem pool com várias perguntas
    expect(objetos.every((o) => !o.resolvido)).toBe(true);

    // interação longe de qualquer objeto não abre nada — acha uma célula
    // do interior a mais de 1 de distância de todos os objetos
    const longe = [];
    for (let y = 1; y < 7 && longe.length === 0; y++) {
      for (let x = 1; x < 11 && longe.length === 0; x++) {
        if (objetos.every((o) => Math.abs(o.x - x) + Math.abs(o.y - y) > 1)) longe.push({ x, y });
      }
    }
    expect(longe.length).toBe(1);
    debug.sala.jogador.x = longe[0].x;
    debug.sala.jogador.y = longe[0].y;
    tecla(window, 'Space');
    expect(el('telaJogo').classList.contains('hidden')).toBe(true);

    // resolve os objetos um de cada vez (teleporta o jogador até cada um —
    // colisão/movimento em grade já foi validado acima de forma independente)
    objetos.forEach((obj, i) => {
      debug.sala.jogador.x = obj.x;
      debug.sala.jogador.y = obj.y;

      tecla(window, 'Space');
      expect(el('telaJogo').classList.contains('hidden')).toBe(false);
      expect(el('telaJogo').classList.contains('overlay-ativo')).toBe(true);
      expect(el('telaTrilha').classList.contains('hidden')).toBe(false); // sala continua visível

      // abre só ESTA pergunta — não a sequência inteira
      expect(debug.S.fila.length).toBe(1);

      const ultimo = i === n - 1;

      if (i === 0) {
        // erra de propósito: objeto continua pendente, overlay continua
        // aberto, e a retentativa vem com uma pergunta nova (FR-001 a FR-004)
        const perguntaErrada = debug.S.fila[0];
        window.resolver(false);
        window.proxima();
        expect(obj.resolvido).toBe(false);
        expect(el('telaJogo').classList.contains('overlay-ativo')).toBe(true);
        expect(debug.S.fila.length).toBe(1);
        expect(debug.S.fila[0]).not.toBe(perguntaErrada); // nova instância re-sorteada
        expect(debug.sala.objetoAtual).toBe(obj); // continua no mesmo objeto
      }

      // acerta (de primeira para os demais objetos; na 2ª tentativa para o primeiro)
      window.resolver(true);
      window.proxima();

      expect(obj.resolvido).toBe(true);
      const aindaPendentes = objetos.some((o) => !o.resolvido);
      expect(aindaPendentes).toBe(!ultimo);

      if (!ultimo) {
        // ainda falta objeto: volta pra sala, sem tela de resumo
        expect(el('telaJogo').classList.contains('overlay-ativo')).toBe(false);
        expect(el('telaFase').classList.contains('overlay-ativo')).toBe(false);
        expect(debug.sala.trancada).toBe(true);
      }
    });

    // objeto já resolvido: interagir de novo não abre nada
    debug.sala.jogador.x = objetos[0].x;
    debug.sala.jogador.y = objetos[0].y;
    tecla(window, 'Space');
    expect(el('telaJogo').classList.contains('overlay-ativo')).toBe(false);

    // porta destrava só depois do último objeto; resumo soma todas as
    // tentativas (n objetos + 1 tentativa extra errada no primeiro, feature 011)
    expect(debug.S.estagios.e1.feito).toBe(true);
    expect(debug.sala.trancada).toBe(false);
    expect(el('telaFase').classList.contains('overlay-ativo')).toBe(true);
    expect(debug.S.estagios.e1.total).toBe(n + 1);
    expect(debug.S.estagios.e1.acertos).toBe(n);
    expect(el('fzAc').textContent).toBe(n + '/' + (n + 1));

    // fechar a missão (botão "Voltar à trilha") leva direto à sala da
    // PRÓXIMA estação da trilha (feature 012) — não mais ao mapa de
    // waypoints antigo
    const proximaId = debug.TRAILS.arquitetura.stages[1].id;
    el('btVoltarTrilha').click();
    expect(el('telaJogo').classList.contains('overlay-ativo')).toBe(false);
    expect(el('telaFase').classList.contains('overlay-ativo')).toBe(false);
    expect(el('telaTrilha').classList.contains('hidden')).toBe(false);
    expect(el('salaWrap').classList.contains('hidden')).toBe(false);
    expect(el('mapaWrap').classList.contains('hidden')).toBe(true);
    expect(debug.sala.stage.id).toBe(proximaId);
  });

  it('atravessar a porta destrancada leva à sala da próxima estação (feature 012)', () => {
    const dom = criarJogoDom();
    const { window } = dom;
    const el = (id) => window.document.getElementById(id);
    const debug = window.__salaDebug;

    window.novoJogo('Aluno Teste', 'T33F2', 20, '2025000002', 'arquitetura');
    window.renderTrilha();
    window.mostrar('telaTrilha');

    const primeiraId = debug.sala.stage.id;
    const segundaId = debug.TRAILS.arquitetura.stages[1].id;

    // atalho: marca a estação atual como concluída (a lógica de resolver
    // objeto a objeto já é validada no teste anterior) e destrava a porta
    debug.S.estagios[primeiraId].feito = true;
    debug.sala.trancada = false;

    debug.sala.jogador.x = debug.sala.porta.x - 1;
    debug.sala.jogador.y = debug.sala.porta.y;
    tecla(window, 'ArrowRight');

    expect(debug.sala.stage.id).toBe(segundaId);
    expect(el('salaWrap').classList.contains('hidden')).toBe(false);
    expect(el('mapaWrap').classList.contains('hidden')).toBe(true);
  });

  it('sala de Certificação Final: 12 objetos, pontuação em dobro, trilha concluída (feature 012)', () => {
    const dom = criarJogoDom();
    const { window } = dom;
    const el = (id) => window.document.getElementById(id);
    const debug = window.__salaDebug;

    window.novoJogo('Aluno Teste', 'T33F2', 20, '2025000003', 'arquitetura');
    const trilha = debug.TRAILS.arquitetura;

    // atalho: marca todas as estações normais como concluídas sem
    // rejogar cada uma (já validado nos testes anteriores)
    trilha.stages.filter((s) => !s.boss).forEach((s) => { debug.S.estagios[s.id].feito = true; });

    window.renderTrilha();
    window.mostrar('telaTrilha');

    expect(debug.sala.stage.id).toBe('boss');
    expect(debug.sala.objetos.length).toBe(12);

    const xpAntes = debug.S.xp;
    debug.sala.objetos.forEach((obj) => {
      debug.sala.jogador.x = obj.x;
      debug.sala.jogador.y = obj.y;
      tecla(window, 'Space');
      window.resolver(true);
      window.proxima();
    });

    expect(debug.S.estagios.boss.feito).toBe(true);
    expect(debug.S.estagios.boss.total).toBe(12);
    expect(debug.S.estagios.boss.acertos).toBe(12);
    // pontuação em dobro (mult=2 no boss, já existente em resolver()) —
    // cada acerto vale pelo menos 200 pts (100 base * 2), nunca só 100-120
    expect(debug.S.xp - xpAntes).toBeGreaterThanOrEqual(200 * 12);
    expect(el('telaFase').classList.contains('overlay-ativo')).toBe(true);
  });
});
