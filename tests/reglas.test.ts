// Las reglas del combate y de la partida: jugadas, la cuenta DAÑO × MULTI, los poderes de palo, Inmune, el Golpe
// exacto, el determinismo y los invariantes de una partida entera jugada por el bot.
import { describe, expect, it } from 'vitest';
import { AMULETOS } from '../src/rules/amuletos';
import { B } from '../src/rules/balance';
import { jugarEntera, mejorGolpe, paso } from '../src/rules/bot';
import { clasificar, resolver } from '../src/rules/cartas';
import type { Carta, PaloCarta } from '../src/rules/cartas';
import { crearEnemigo, cuenta, descartar, golpear, iniciarCombate } from '../src/rules/combate';
import type { Enemigo, Partida } from '../src/rules/estado';
import { COLUMNAS, PISOS, REGLAS_MAPA, TRAMOS, cumple, generarTramo } from '../src/rules/mapa';
import { MAZOS } from '../src/rules/mazos';
import type { MazoId } from '../src/rules/mazos';
import * as juego from '../src/rules/partida';
import { altarLleno } from '../src/rules/perfil';
import { BENDICION } from '../src/rules/reyes';
import type { BendicionId } from '../src/rules/reyes';

const c = (palo: PaloCarta, n: number, id = `${palo}${n}${Math.random().toString(36).slice(2, 6)}`): Carta => ({ id, palo, n });
const jugada = (cartas: Carta[], mazo?: MazoId) => {
  const ef = resolver(cartas);
  return ef ? clasificar(ef, mazo) : null;
};

/** Una partida con un combate armado a mano contra un enemigo dado. */
function mesa(mazo: MazoId, mano: Carta[], enemigo: Partial<Enemigo> = {}, prepara?: (p: Partida) => void): Partida {
  const p = juego.nuevaPartida({ mazo, semilla: 'PRUEBA' });
  juego.elegirOferta(p, 0, null);
  juego.seguir(p);
  prepara?.(p);
  const e = { ...crearEnemigo(p, 'H', 10), vida: 500, vidaMax: 500, ...enemigo } as Enemigo;
  iniciarCombate(p, 'guardia', [e, crearEnemigo(p, 'D', 10)]);
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
  it('lo que no arma nada no es jugada', () => {
    expect(jugada([c('S', 2), c('C', 5)])).toBeNull();
    expect(jugada([c('S', 2), c('C', 5), c('D', 9)])).toBeNull();
    expect(jugada([c('S', 1), c('C', 2), c('D', 3), c('H', 4), c('S', 5), c('C', 6)])).toBeNull();
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
    const ef = resolver([c('X', 0), c('S', 3), c('C', 8)])!;
    expect(ef[0]).toMatchObject({ palo: 'C', n: 8, copia: true });
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
    expect(q.multi).toBe(B.jugadas.par.m);
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
    p.combate!.mano = [c('D', 4), c('D', 6), c('D', 9)];
    expect(cuenta(p, p.combate!.mano).oro).toBe(3 * B.palos.oroPorOro);
    // sin Espadas el Escudo enemigo frena; con Espadas, el golpe lo atraviesa
    const sin = cuenta(p, p.combate!.mano);
    expect(sin.aEscudo).toBe(20);
    p.combate!.fila[0].palo = 'H';
    p.combate!.mano = [c('S', 4), c('C', 5), c('D', 6)];
    const con = cuenta(p, p.combate!.mano);
    expect(con.perfora).toBe(true);
    expect(con.aEscudo).toBe(0);
    expect(con.aVida).toBe(con.total);
  });
  it('el Golpe exacto abate justo y premia', () => {
    const mano = [c('S', 7), c('C', 7), c('D', 2)];
    const p = mesa('chinchon', mano, { vida: (B.jugadas.par.d + 14) * B.jugadas.par.m });
    const oro = p.oro;
    const q = cuenta(p, mano.slice(0, 2));
    expect(q.exacto).toBe(true);
    const evs = golpear(p, [mano[0].id, mano[1].id]);
    expect(evs.some((e) => e.t === 'exacto')).toBe(true);
    expect(p.oro).toBe(oro + B.exacto.oro);
    expect(p.combate!.proxMulti).toBe(B.exacto.multi);
    // abatir no deja Contraataque ese turno
    expect(evs.some((e) => e.t === 'contra')).toBe(false);
  });
  it('la racha: cada Golpe exacto seguido sube el premio hasta el tope, y se corta al abatir sin exactitud', () => {
    const exacta = (racha: number) => {
      const mano = [c('S', 7), c('C', 7), c('D', 2)];
      const p = mesa('chinchon', mano, { vida: (B.jugadas.par.d + 14) * B.jugadas.par.m });
      p.racha = racha;
      golpear(p, [mano[0].id, mano[1].id]);
      return p;
    };
    expect(exacta(0).racha).toBe(1);
    expect(exacta(0).combate!.proxMulti).toBe(B.exacto.multi);
    expect(exacta(1).combate!.proxMulti).toBe(B.exacto.multi * 2);
    expect(exacta(B.exacto.rachaTope).racha).toBe(B.exacto.rachaTope);
    // abatir sin exactitud la corta
    const mano = [c('S', 9), c('C', 9), c('H', 9)];
    const p = mesa('chinchon', mano, { palo: 'D', vida: 10 });
    p.racha = 2;
    golpear(p, mano.map((k) => k.id));
    expect(p.racha).toBe(0);
  });
  it('si el enemigo sigue en pie, contraataca: el Escudo frena primero', () => {
    const mano = [c('S', 2), c('C', 3), c('D', 9)];
    const p = mesa('chinchon', mano);
    p.combate!.escudo = 4;
    const e = p.combate!.fila[0];
    const vida = p.vida;
    const evs = golpear(p, [mano[0].id]);
    const contra = evs.find((x) => x.t === 'contra');
    expect(contra && contra.t === 'contra' && contra.frenado).toBe(4);
    expect(p.vida).toBe(vida - (e.ataque - 4));
    expect(p.combate!.escudo).toBe(0);
  });
  it('lo que sobra de un golpe con Espadas pasa al siguiente', () => {
    const mano = [c('S', 9), c('C', 9), c('H', 9)];
    const p = mesa('chinchon', mano, { palo: 'D', vida: 10 });
    const sig = p.combate!.fila[1];
    const antes = sig.vida;
    const q = cuenta(p, mano);
    expect(q.sobra).toBe(q.total - 10);
    golpear(p, mano.map((k) => k.id));
    expect(p.combate ? p.combate.fila[0].vida : 0).toBe(Math.max(0, antes - q.sobra));
  });
  it('descartar no gasta el turno y roba otras tantas', () => {
    const p = mesa('escoba', [c('S', 2), c('C', 3), c('D', 9)]);
    const antes = p.combate!.descartes;
    const turno = p.combate!.turno;
    descartar(p, [p.combate!.mano[0].id]);
    expect(p.combate!.descartes).toBe(antes - 1);
    expect(p.combate!.turno).toBe(turno);
    expect(p.combate!.mano).toHaveLength(3);
  });
});

describe('los cantos de los Mazos', () => {
  it('Escoba: sumar 15 justo canta ¡ESCOBA! y multiplica', () => {
    const mano = [c('S', 7), c('C', 8), c('D', 2)];
    const p = mesa('escoba', mano);
    const q = cuenta(p, mano.slice(0, 2));
    expect(q.canto).toBe(true);
    expect(q.multi).toBe((B.jugadas.quince.m + B.mazos.escoba.multiMano) * B.mazos.escoba.multi);
    expect(cuenta(p, [mano[0], mano[2]]).ok).toBe(false);
  });
  it('cada Mazo se juega con la mano de su juego: Escoba y Truco 3, Chancho Va 4, Chinchón 7, El Mentiroso 8', () => {
    expect([B.mazos.escoba.mano, B.mazos.truco.mano, B.mazos.chancho.mano, B.mazos.chinchon.mano, B.mazos.mentiroso.mano]).toEqual([3, 3, 4, 7, 8]);
    for (const m of MAZOS) expect(juego.nuevaPartida({ mazo: m, semilla: 'MANO' }).manoMax).toBe(B.mazos[m].mano);
  });
  it('un naipe templado en el Fogón pega de más', () => {
    const mano = [{ ...c('S', 7), temple: 8 }];
    const p = mesa('chinchon', mano);
    expect(cuenta(p, mano).dano).toBe(7 + 8);
  });
  it('el Fogón de tres pasadas: +Daño seguro, después Templada (+Multi) y al final la Forja Brava; lo que no sale, se quema', () => {
    let quemadas = 0;
    let bravas = 0;
    for (let i = 0; i < 80; i++) {
      const p = juego.nuevaPartida({ mazo: 'chinchon', semilla: `FUEGO${i}` });
      p.fase = 'fogon';
      p.fogonHecho = false;
      p.fogonCarta = null;
      p.fogonPasadas = 0;
      const carta = p.mazo.find((k) => k.palo !== 'X')!;
      const n = p.mazo.length;
      expect(juego.templar(p, carta.id)).toBe('templada');
      expect(carta.temple).toBe(B.fogon.temple);
      expect(carta.templada).toBeUndefined();
      expect(juego.descansar(p)).toBe(false); // el Fogón ya se usó
      let r = juego.templar(p, carta.id);
      if (r === 'templada') {
        expect(carta.temple).toBe(B.fogon.temple * 2);
        expect(carta.templada).toBe(true);
        r = juego.templar(p, carta.id);
        if (r === 'templada') {
          expect(carta.brava).toBe(true);
          expect(carta.temple).toBe(B.fogon.temple * 2);
          expect(juego.templar(p, carta.id)).toBeNull(); // el fuego tiene tope
          bravas++;
        }
      }
      if (r === 'quemada') {
        quemadas++;
        expect(p.mazo).toHaveLength(n - 1);
        expect(juego.templar(p, carta.id)).toBeNull();
      }
    }
    expect(quemadas).toBeGreaterThan(30);
    expect(bravas).toBeGreaterThan(10);
  });
  it('un naipe Templado suma Multi y uno de Forja Brava vale doble; el Cetro se recarga con el Golpe exacto', () => {
    const base = [c('S', 7)];
    const p0 = mesa('chinchon', base);
    const q0 = cuenta(p0, base);
    const fino = [{ ...c('S', 7), temple: 8, templada: true, brava: true }];
    const p1 = mesa('chinchon', fino);
    const q1 = cuenta(p1, fino);
    expect(q1.dano).toBe(q0.dano + 8 + 7);
    expect(q1.multi).toBe(q0.multi + B.fogon.multiTemplada);
    // el Cetro: ×3 en el primer golpe; gastado, vuelve con un Golpe exacto
    const p2 = mesa('chinchon', base);
    p2.amuletos.push('cetro');
    expect(cuenta(p2, base).multi).toBe(q0.multi * B.amuletos.cetro);
    p2.combate!.golpes = 1;
    expect(cuenta(p2, base).multi).toBe(q0.multi);
    p2.combate!.cetro = true;
    expect(cuenta(p2, base).multi).toBe(q0.multi * B.amuletos.cetro);
  });
  it('Truco: dos del mismo palo cantan ¡ENVIDO! y las Bravas pegan de más', () => {
    const mano = [c('S', 1, 'S1'), c('S', 7, 'S7'), c('D', 4)];
    const p = mesa('truco', mano);
    const q = cuenta(p, mano.slice(0, 2));
    expect(q.canto).toBe(true);
    expect(q.dano).toBe(1 + 7 + B.mazos.truco.bravas.S1 + B.mazos.truco.bravas.S7 + B.mazos.truco.envido);
  });
  it('Chinchón: Pierna o Escalera de palo cantan y frenan medio Contraataque', () => {
    const mano = [c('S', 4), c('H', 4), c('D', 4), c('S', 9)];
    const p = mesa('chinchon', mano);
    const e = p.combate!.fila[0];
    const q = cuenta(p, mano.slice(0, 3));
    expect(q.canto).toBe(true);
    expect(q.contra).toBe(Math.ceil(e.ataque * B.mazos.chinchon.mitiga));
  });
  it('El Mentiroso: con Engaño todas las cartas fingen ser la más alta y nada es Inmune', () => {
    const mano = [c('H', 9), c('H', 2), c('S', 3), c('C', 4)];
    const p = mesa('mentiroso', mano);
    expect(cuenta(p, mano).ok).toBe(false);
    juego.armarEngano(p, true);
    const q = cuenta(p, mano);
    expect(q.jugada).toBe('poker');
    expect(q.dano).toBe(B.jugadas.poker.d + 36);
  });
  it('Chancho Va: pasar una carta por turno es gratis, y el Póker aturde', () => {
    const mano = [c('S', 4), c('C', 4), c('D', 4), c('H', 4), c('S', 9)];
    const p = mesa('chancho', mano, { palo: 'C', vida: 5000, vidaMax: 5000 });
    const antes = p.combate!.descartes;
    descartar(p, [mano[4].id]);
    expect(p.combate!.descartes).toBe(antes);
    expect(p.combate!.pasar).toBe(false);
    const q = cuenta(p, mano.slice(0, 4));
    expect(q.canto).toBe(true);
    expect(q.aturde).toBe(B.mazos.chancho.aturde);
  });
});

describe('una partida entera', () => {
  it('con la misma semilla y las mismas decisiones, sale exactamente igual', () => {
    const una = jugarEntera(juego.nuevaPartida({ mazo: 'escoba', semilla: 'IGUAL' }), { rng: { rng: 7 } });
    const otra = jugarEntera(juego.nuevaPartida({ mazo: 'escoba', semilla: 'IGUAL' }), { rng: { rng: 7 } });
    expect(JSON.stringify(otra)).toBe(JSON.stringify(una));
    const distinta = jugarEntera(juego.nuevaPartida({ mazo: 'escoba', semilla: 'OTRA' }), { rng: { rng: 7 } });
    expect(JSON.stringify(distinta)).not.toBe(JSON.stringify(una));
  });
  it('el estado se puede guardar y retomar (JSON de ida y vuelta) sin cambiar el resultado', () => {
    const p = juego.nuevaPartida({ mazo: 'truco', semilla: 'GUARDA' });
    const bot = { rng: { rng: 3 } };
    for (let i = 0; i < 60; i++) paso(p, bot);
    const copia = JSON.parse(JSON.stringify(p)) as Partida;
    const botCopia = { rng: { rng: bot.rng.rng } };
    jugarEntera(p, bot);
    jugarEntera(copia, botCopia);
    expect(JSON.stringify(copia)).toBe(JSON.stringify(p));
  });
  it('el Mapa: tres tramos, cada uno una red irregular de seis pisos y un Rey, toda alcanzable y sin caminos cruzados', () => {
    const p = juego.nuevaPartida({ mazo: 'escoba', semilla: 'MAPA' });
    expect(p.tramos).toHaveLength(TRAMOS);
    expect(new Set(p.tramos.map((t) => t.rey)).size).toBe(TRAMOS);
    for (const t of p.tramos) {
      const rey = t.nodos.filter((n) => n.tipo === 'rey');
      expect(rey).toHaveLength(1);
      for (let piso = 0; piso < PISOS; piso++) {
        const fila = t.nodos.filter((n) => n.piso === piso);
        expect(fila.length).toBeGreaterThanOrEqual(1);
        expect(fila.length).toBeLessThanOrEqual(COLUMNAS);
      }
      const llegan = new Set(t.nodos.filter((n) => n.piso === 0).map((n) => n.id));
      for (const n of t.nodos) {
        if (n.tipo !== 'rey') expect(n.sig.length).toBeGreaterThan(0);
        if (llegan.has(n.id)) for (const s of n.sig) llegan.add(s);
      }
      expect(llegan.size).toBe(t.nodos.length);
      // dos caminos del mismo piso nunca se cruzan
      const col = (id: string) => t.nodos.find((n) => n.id === id)!.col;
      for (const a of t.nodos) for (const b of t.nodos) if (a.piso === b.piso && a.col < b.col) for (const sa of a.sig) for (const sb of b.sig) expect(col(sa) > col(sb), `${a.id}→${sa} cruza ${b.id}→${sb}`).toBe(false);
    }
  });
  it('el azar del Mapa está domado: 400 tramos cumplen las reglas de balance y casi ninguno repite la forma', () => {
    const formas = new Set<string>();
    const entradas = new Set<number>();
    for (let i = 0; i < 400; i++) {
      const t = generarTramo({ rng: (i * 2654435761) >>> 0 }, i % TRAMOS, 'S');
      expect(cumple(t.nodos), `semilla ${i}`).toBe(true);
      const nodos = t.nodos.filter((n) => n.tipo !== 'rey');
      // lo esencial, dicho aparte: se empieza con una Guardia, se llega al Rey desde un Fogón o una Pulpería, y la
      // Guardia Brava nunca es obligatoria ni aparece antes del piso que dicen las reglas
      for (const n of nodos) {
        if (n.piso === 0) expect(n.tipo).toBe('guardia');
        if (n.piso === PISOS - 1) expect(['fogon', 'pulperia']).toContain(n.tipo);
        if (n.tipo === 'elite') expect(n.piso).toBeGreaterThanOrEqual(REGLAS_MAPA.pisoElite);
      }
      const elites = nodos.filter((n) => n.tipo === 'elite').length;
      expect(elites).toBeGreaterThanOrEqual(REGLAS_MAPA.elites[0]);
      expect(elites).toBeLessThanOrEqual(REGLAS_MAPA.elites[1]);
      formas.add(nodos.map((n) => `${n.piso}${n.col}${n.sig.length}`).join(''));
      entradas.add(nodos.filter((n) => n.piso === 0).length);
    }
    expect(formas.size).toBeGreaterThan(380);
    expect(entradas.size).toBeGreaterThanOrEqual(3); // no siempre hay tres opciones para empezar
  });
  it('el bot termina cualquier partida con los 5 Mazos, y los invariantes se cumplen en cada paso', () => {
    for (const mazo of MAZOS)
      for (const semilla of ['A', 'B', 'C']) {
        const p = juego.nuevaPartida({ mazo, semilla: `INV${semilla}`, altar: semilla === 'C' ? altarLleno() : {} });
        const bot = { rng: { rng: 99 } };
        let pasos = 0;
        while (paso(p, bot)) {
          pasos++;
          expect(p.vida).toBeLessThanOrEqual(p.vidaMax);
          expect(p.vida).toBeGreaterThanOrEqual(0);
          expect(p.oro).toBeGreaterThanOrEqual(0);
          expect(p.amuletos.length).toBeLessThanOrEqual(p.huecos);
          expect(new Set(p.amuletos).size).toBe(p.amuletos.length);
          expect(p.mazo.length).toBeGreaterThanOrEqual(B.jugador.mazoMin);
          expect(p.mazo.every((k) => (k.palo === 'X' ? k.n === 0 : k.n >= 1 && k.n <= 9))).toBe(true);
          expect(p.afinidad).toBeGreaterThanOrEqual(B.bufon.afinidadMin);
          expect(p.afinidad).toBeLessThanOrEqual(B.bufon.afinidadMax);
          for (const [id, n] of Object.entries(p.bendiciones)) expect(n).toBeLessThanOrEqual(BENDICION[id as BendicionId].niveles);
          if (p.combate) {
            expect(p.combate.escudo).toBeLessThanOrEqual(B.jugador.escudoMax * B.jugador.escalaTramo[Math.min(p.acto, 2)]);
            expect(p.combate.fila.every((e) => e.rango >= 10 && e.rango <= 12 && e.vida > 0)).toBe(true);
            const m = mejorGolpe(p);
            expect(m).not.toBeNull();
          }
          expect(pasos).toBeLessThan(3000);
        }
        expect(p.fase).toBe('fin');
        expect(p.fin).toBeDefined();
        expect(p.fin!.porotos).toBeGreaterThanOrEqual(0);
      }
  });
  it('los 15 Amuletos se pueden colgar y entran en la cuenta sin romperla', () => {
    for (const id of AMULETOS) {
      const mano = [c('S', 7), c('C', 7), c('D', 7), c('H', 7)];
      const p = mesa('escoba', mano, { palo: 'S' }, (x) => x.amuletos.push(id));
      p.oro = 60;
      p.combate!.escudo = 10;
      const q = cuenta(p, mano);
      expect(q.ok, id).toBe(true);
      expect(Number.isInteger(q.total), id).toBe(true);
      expect(q.total, id).toBeGreaterThan(0);
    }
  });
});

describe('0.15.0: la defensa escala, el Golpe al pelo, la segunda cara y el soplo', () => {
  it('Bastos, Copas y el tope de Escudo crecen con el tramo', () => {
    const mano = [c('C', 5), c('D', 5)];
    const p0 = mesa('chinchon', mano);
    const q0 = cuenta(p0, mano);
    const p2 = mesa('chinchon', mano, {}, (p) => void (p.acto = 2));
    const q2 = cuenta(p2, mano);
    expect(q0.escudo).toBe(B.palos.escudoPorBasto * B.jugador.escalaTramo[0]);
    expect(q2.escudo).toBe(B.palos.escudoPorBasto * B.jugador.escalaTramo[2]);
    p2.combate!.escudo = 0;
    for (let i = 0; i < 12; i++) {
      p2.combate!.mano = [c('C', 5), c('D', 5)];
      golpear(p2, p2.combate!.mano.map((k) => k.id));
      if (!p2.combate) break;
      expect(p2.combate.escudo).toBeLessThanOrEqual(B.jugador.escudoMax * B.jugador.escalaTramo[2]);
    }
  });
  it('al pelo: pasarse por muy poco no cobra, pero sostiene la racha y recarga el Cetro', () => {
    const mano = [c('C', 7), c('D', 7)];
    const p = mesa('chinchon', mano, { vidaMax: 400 });
    p.amuletos.push('cetro');
    p.combate!.golpes = 1; // el Cetro ya se gastó
    const q = cuenta(p, mano);
    p.combate!.fila[0].vida = q.aVida - 3; // sobra 3 de 400: al pelo (tope 5 %)
    p.racha = 2;
    const k = cuenta(p, mano);
    expect(k.exacto).toBe(false);
    expect(k.alPelo).toBe(true);
    const oro = p.oro;
    const evs = golpear(p, mano.map((x) => x.id));
    expect(evs.some((e) => e.t === 'alpelo')).toBe(true);
    expect(evs.some((e) => e.t === 'exacto')).toBe(false);
    expect(p.racha).toBe(2);
    expect(p.combate!.cetro).toBe(true);
    expect(p.oro - oro).toBeLessThan(B.exacto.oro + 3);
    // pasarse por mucho corta la racha
    const mano2 = [c('C', 7), c('D', 7)];
    const p2 = mesa('chinchon', mano2, { vidaMax: 20, vida: 1, escudo: 0 });
    p2.racha = 2;
    const k2 = cuenta(p2, mano2);
    expect(k2.aVida - 1, k2.motivo).toBeGreaterThan(1); // sobra mucho más que el 5 % de 20
    expect(k2.alPelo).toBe(false);
    golpear(p2, mano2.map((x) => x.id));
    expect(p2.racha).toBe(0);
  });
  it('la segunda cara: a media Vida el Cacique recupera todo su Escudo, una sola vez', () => {
    const mano = [c('S', 7), c('D', 7)];
    const p = mesa('chinchon', mano, { palo: 'C', rango: 12, jefe: true, vidaMax: 1000, vida: 510, escudo: 0, escudoMax: 30 });
    const evs = golpear(p, mano.map((x) => x.id));
    const e = p.combate!.fila[0];
    expect(evs.some((x) => x.t === 'segunda')).toBe(true);
    expect(e.segunda).toBe(true);
    // el Fortín (0.16): un Escudo a la medida de su Vida, no 30 fijos
    expect(e.escudo).toBe(Math.round(1000 * B.reyes.C.empalizada));
    e.escudo = 0;
    p.combate!.mano = [c('S', 6), c('D', 6)];
    const otra = golpear(p, p.combate!.mano.map((x) => x.id));
    expect(otra.some((x) => x.t === 'segunda')).toBe(false);
  });
  it('el soplo del Bufón: el próximo Rey llega con menos Vida, y una sola vez', () => {
    const p = juego.nuevaPartida({ mazo: 'escoba', semilla: 'SOPLO' });
    juego.elegirOferta(p, 0, null);
    juego.seguir(p);
    p.reyHerido = B.bufon.soplo.vida;
    const rey = { ...crearEnemigo(p, 'S', 12, { jefe: true }), vida: 400, vidaMax: 400 };
    iniciarCombate(p, 'rey', [rey]);
    expect(p.combate!.fila[0].vida).toBe(320);
    expect(p.reyHerido).toBe(0);
  });
});

describe('0.16.0: las segundas caras obligan a cambiar de plan', () => {
  it('Tajo de revés: repetir la jugada contra el Caudillo duplica su golpe y atraviesa todo el Escudo', () => {
    const mano = [c('C', 7), c('D', 7), c('C', 3), c('D', 3)];
    const p = mesa('chinchon', mano, { palo: 'S', rango: 12, jefe: true, vidaMax: 1000, vida: 400, escudo: 0, ataque: 20, segunda: true });
    p.combate!.escudo = 15;
    p.combate!.ultimaJugada = 'par';
    const repite = cuenta(p, [mano[0], mano[1]]);
    p.combate!.ultimaJugada = 'flor';
    const cambia = cuenta(p, [mano[0], mano[1]]);
    expect(repite.contra!).toBeGreaterThan(cambia.contra!);
    // atraviesa el Escudo: te llega entero
    p.combate!.ultimaJugada = 'par';
    const furia = p.combate!.furia;
    expect(repite.contra).toBe((20 + furia) * B.reyes.S.deguello);
    const evs = golpear(p, [mano[0].id, mano[1].id]);
    expect(evs.some((x) => x.t === 'rey' && x.que === 'deguello')).toBe(true);
  });
  it('Remate: a media Vida el Caudal se lleva una tajada de la bolsa', () => {
    const mano = [c('C', 3), c('S', 3)];
    const p = mesa('chinchon', mano, { palo: 'D', rango: 12, jefe: true, vidaMax: 1000, vida: 400, escudo: 0, segunda: true });
    p.oro = 100;
    golpear(p, mano.map((x) => x.id));
    expect(p.oro).toBe(100 - Math.ceil(100 * B.reyes.D.remate));
  });
  it('Última ronda: lo que te curás, el Bacanal se lo cura ×2', () => {
    const mano = [c('H', 5), c('C', 5)];
    const p = mesa('chinchon', mano, { palo: 'H', rango: 12, jefe: true, vidaMax: 1000, vida: 400, escudo: 0, segunda: true }, (q) => { q.vida = 10; });
    const antes = p.vida;
    const evs = golpear(p, mano.map((x) => x.id));
    const curado = (evs.find((x) => x.t === 'cura') as { n: number } | undefined)?.n ?? 0;
    expect(curado).toBeGreaterThan(0);
    const alRey = evs.filter((x) => x.t === 'rey' && x.que === 'cura').map((x) => (x as { n: number }).n);
    expect(alRey[0]).toBe(curado * B.reyes.H.ultimaRonda);
    expect(curado).toBeLessThanOrEqual(p.vidaMax - antes);
  });
  it('el «al pelo» también vale con Espadas en el golpe', () => {
    const mano = [c('S', 7), c('D', 7)];
    const p = mesa('chinchon', mano, { vidaMax: 2000, vida: 1, escudo: 0 });
    const k = cuenta(p, mano);
    expect(k.perfora).toBe(true);
    // la ventana del «al pelo» es un 5 % de la Vida máxima: 100 sobre 2000
    expect(k.alPelo).toBe(k.aVida - 1 <= 100);
  });
});
