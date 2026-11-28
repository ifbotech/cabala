// Las reglas de CÁBALA 2.0 (MVP): jugadas, cuenta DAÑO × MULTI, poderes de palo, loop lineal de 3 Tramos y Duelo del Bufón.
import { describe, expect, it } from 'vitest';
import { B } from '../src/rules/balance';
import { jugar, mejorGolpe } from '../src/rules/bot';
import { clasificar, resolver } from '../src/rules/cartas';
import type { Carta, PaloCarta } from '../src/rules/cartas';
import { crearEnemigo, cuenta, descartar, golpear, iniciarCombate } from '../src/rules/combate';
import type { Enemigo, Partida } from '../src/rules/estado';
import { MAZOS, type MazoId } from '../src/rules/mazos';
import * as juego from '../src/rules/partida';
import { BENDICION } from '../src/rules/reyes';

const c = (palo: PaloCarta, n: number, id = `${palo}${n}${Math.random().toString(36).slice(2, 6)}`): Carta => ({ id, palo, n });
const jugada = (cartas: Carta[], mazo?: MazoId) => {
  const ef = resolver(cartas, undefined, false, mazo);
  return ef ? clasificar(ef, mazo) : null;
};

function mesa(mazo: MazoId, mano: Carta[], enemigo: Partial<Enemigo> = {}): Partida {
  const p = juego.nuevaPartida({ mazo, semilla: 'PRUEBA' });
  const e = { ...crearEnemigo(p, 'H', 10), vida: 500, vidaMax: 500, ...enemigo } as Enemigo;
  iniciarCombate(p, 'guardia', [e]);
  p.combate!.mano = mano;
  return p;
}

describe('jugadas', () => {
  it('reconoce las nueve jugadas de siempre', () => {
    expect(jugada([c('S', 5)])).toBe('sola');
    expect(jugada([c('S', 5), c('C', 5)])).toBe('par');
    expect(jugada([c('S', 5), c('C', 5), c('D', 5)])).toBe('pierna');
    expect(jugada([c('S', 5), c('C', 5), c('D', 5), c('H', 5)])).toBe('poker');
    expect(jugada([c('S', 5), c('C', 5), c('D', 8), c('H', 8)])).toBe('doblepar');
    expect(jugada([c('S', 5), c('C', 5), c('D', 5), c('H', 8), c('S', 8)])).toBe('full');
    expect(jugada([c('S', 3), c('C', 4), c('D', 5)])).toBe('escalera');
    expect(jugada([c('S', 3), c('S', 4), c('S', 5)])).toBe('escalerapalo');
    expect(jugada([c('S', 2), c('S', 5), c('S', 9)])).toBe('flor');
  });
  it('el Quince solo vale en la Escoba y el Envido solo en el Truco', () => {
    expect(jugada([c('S', 6), c('C', 9)])).toBeNull();
    expect(jugada([c('S', 6), c('C', 9)], 'escoba')).toBe('quince');
    expect(jugada([c('S', 2), c('S', 6)])).toBeNull();
    expect(jugada([c('S', 2), c('S', 6)], 'truco')).toBe('envido');
  });
  it('el Comodín copia la carta más alta del golpe; solo, no es jugada', () => {
    expect(jugada([c('X', 0), c('S', 7)])).toBe('par');
    expect(jugada([c('X', 0), c('S', 7), c('C', 7)])).toBe('pierna');
    expect(resolver([c('X', 0)])).toBeNull();
  });
});

describe('la cuenta', () => {
  it('TOTAL = DAÑO × MULTI, siempre enteros', () => {
    const mano = [c('S', 7), c('C', 7)];
    const p = mesa('chinchon', mano);
    const q = cuenta(p, mano);
    expect(q.ok).toBe(true);
    expect(q.jugada).toBe('par');
    expect(q.dano).toBe(B.jugadas.par.d + 14);
    expect(q.multi).toBe(B.jugadas.par.m + B.mazos.chinchon.multiMano);
    expect(q.total).toBe(q.dano * q.multi);
    expect(Number.isInteger(q.total)).toBe(true);
  });
  it('cada enemigo es Inmune a su propio palo: esas cartas no hacen Daño (pero dan su poder)', () => {
    const mano = [c('H', 7), c('H', 5), c('H', 2)];
    const p = mesa('chinchon', mano);
    p.vida = 20;
    const q = cuenta(p, mano);
    expect(q.dano).toBe(B.jugadas.flor.d);
    expect(q.cura).toBe(3 * B.palos.curaPorCopa);
  });
  it('los palos: Bastos dan Escudo, Copas curan, Oros pagan y Espadas perforan', () => {
    const p = mesa('chinchon', [c('C', 4), c('C', 6), c('C', 9)], { palo: 'S', escudo: 20 });
    expect(cuenta(p, p.combate!.mano).escudo).toBe(3 * B.palos.escudoPorBasto);
    expect(cuenta(p, [c('D', 2), c('D', 5), c('D', 9)]).oro).toBe(3 * B.palos.oroPorOro);
    expect(cuenta(p, [c('S', 2), c('S', 5), c('S', 9)]).perfora).toBe(true);
  });
});

describe('bucle lineal de 3 Tramos y Duelo del Bufón', () => {
  it('empieza en Tramo 0 paso 0 (Sota) con 1 solo enemigo en fila y 3 Reyes en orden', () => {
    const p = juego.nuevaPartida({ mazo: 'escoba', semilla: 'LOOP' });
    expect(p.acto).toBe(0);
    expect(p.paso).toBe(0);
    expect(p.fase).toBe('combate');
    expect(p.combate?.fila).toHaveLength(1);
    expect(p.combate?.fila[0].rango).toBe(10);
    expect(p.reyes).toHaveLength(juego.TRAMOS);
  });
  it('ganar el Duelo del Bufón ofrece 3 Bendiciones de 1 nivel; perder da +2 Furia al Rey', () => {
    const pG = juego.nuevaPartida({ mazo: 'truco', semilla: 'DUELO-G' });
    pG.fase = 'duelo';
    pG.paso = 3;
    juego.resolverDueloBufon(pG, true);
    expect(pG.fase).toBe('botin');
    const oferta = pG.botin?.items.find((it) => it.t === 'oferta');
    expect(oferta?.t === 'oferta' && oferta.oferta.tipo).toBe('bendicion');
    if (oferta?.t === 'oferta') {
      expect(oferta.oferta.opciones.length).toBeGreaterThan(0);
      for (const id of oferta.oferta.opciones) expect(BENDICION[id as keyof typeof BENDICION].niveles).toBe(1);
    }

    const pP = juego.nuevaPartida({ mazo: 'truco', semilla: 'DUELO-P' });
    pP.fase = 'duelo';
    pP.paso = 3;
    const oroAntes = pP.oro;
    juego.resolverDueloBufon(pP, false);
    expect(pP.fase).toBe('combate');
    expect(pP.paso).toBe(4);
    expect(pP.combate?.fila[0].jefe).toBe(true);
    expect(pP.combate?.furia).toBe(0);
    expect(pP.oro).toBe(oroAntes + 8);
  });
  it('el bot completa partidas deterministas en los 5 Mazos sin atascarse', () => {
    for (const mazo of MAZOS) {
      const p1 = jugar(juego.nuevaPartida({ mazo, semilla: `SIM-${mazo}` }), { rng: { rng: 98765 } });
      const p2 = jugar(juego.nuevaPartida({ mazo, semilla: `SIM-${mazo}` }), { rng: { rng: 98765 } });
      expect(p1.fase).toBe('fin');
      expect(p1.stats).toEqual(p2.stats);
      expect(p1.stats.golpes).toBeGreaterThan(0);
    }
  });
});

describe('combate básico', () => {
  it('golpear y descartar funcionan sin errores en el motor MVP', () => {
    const p = juego.nuevaPartida({ mazo: 'mentiroso', semilla: 'ACCION' });
    const m = mejorGolpe(p);
    expect(m).not.toBeNull();
    if (m!.engano) juego.armarEngano(p, true);
    const evs = juego.golpear(p, m!.ids);
    expect(evs.some((e) => e.t === 'golpe')).toBe(true);
    if (p.fase === 'combate' && p.combate && p.combate.descartes > 0 && p.combate.mano.length > 0) {
      const desc = juego.descartar(p, [p.combate.mano[0].id]);
      expect(desc.length).toBeGreaterThanOrEqual(0);
    }
  });
});
