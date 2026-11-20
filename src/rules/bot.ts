// Un jugador automático razonable: juega una partida entera tomando cada decisión con la misma información que ve
// una persona. Lo usan el laboratorio (analyze:meta), las pruebas y la QA de humo; la mesa lo usa para «la mejor
// jugada». No hace trampa: no mira el Mazo ni el azar que viene.
import type { AmuletoId } from './amuletos';
import { CABALA, suerte } from './bufon';
import { combinaciones, esComodin } from './cartas';
import type { Carta } from './cartas';
import { cuenta, puedeDescartar } from './combate';
import type { Cuenta } from './combate';
import type { Nodo, Oferta, Partida } from './estado';
import * as juego from './partida';
import { azar, elegir } from './rng';
import type { ConAzar } from './rng';
import { notaDe, sinergia } from './notas';

export interface OpcionesBot {
  /** Elige al azar en cada «ELEGÍ UNA» (para medir las notas de las piezas sin sesgo). */
  ofertasAlAzar?: boolean;
  /** Azar propio del bot (no toca el de la partida). */
  rng: ConAzar;
  /** Se llama con cada oferta resuelta: lo ofrecido y lo elegido (null si saltó). */
  alElegir?: (oferta: Oferta, elegido: string | null) => void;
  /** Se llama con cada golpe dado: el tramo, el tipo de combate y el total. */
  alGolpear?: (acto: number, tipo: string, total: number) => void;
}

// ───────────────────────── combate ─────────────────────────

/** Cuánto vale un golpe para el bot: abatir manda; después, el daño hecho menos el que vas a recibir. */
function valor(p: Partida, q: Cuenta, sel: readonly Carta[]): number {
  const c = p.combate!;
  const e = c.fila[0];
  const falta = 1 - p.vida / p.vidaMax;
  let v = 0;
  if (q.abate || q.ejecuta) {
    v += 1000 + (q.exacto ? 40 : 0) + Math.min(q.sobra, c.fila[1]?.vida ?? 0) * 0.6;
    // abatir gastando poco: lo que no se juega queda para el que entra
    v -= sel.length * 6;
  } else {
    v += Math.min(q.aVida, e.vida) + q.aEscudo * 0.7;
    v -= (q.contra ?? 0) * (1.6 + falta * 2.5);
    if (q.aturde) v += 10;
  }
  v += q.cura * (0.4 + falta * 2.2) + q.escudo * (c.fila.length > 1 || !q.abate ? 0.9 : 0.2) + q.oro * 1.2;
  if (q.canto) v += 8;
  return v;
}

export interface Decision {
  t: 'golpe' | 'descarte';
  ids: string[];
  engano?: boolean;
}

/** La mejor jugada de la mano según el bot (o null si no hay combate). */
export function mejorGolpe(p: Partida): { ids: string[]; q: Cuenta; v: number; engano: boolean } | null {
  const c = p.combate;
  if (!c || !c.fila.length) return null;
  let mejor: { ids: string[]; q: Cuenta; v: number; engano: boolean } | null = null;
  const probar = (engano: boolean) => {
    const antes = c.engano;
    c.engano = engano;
    for (const sel of combinaciones(c.mano)) {
      const q = cuenta(p, sel);
      if (!q.ok) continue;
      let v = valor(p, q, sel);
      // el Engaño se guarda para cuando abate
      if (engano) v -= q.abate ? 5 : 400;
      if (!mejor || v > mejor.v) mejor = { ids: sel.map((k) => k.id), q, v, engano };
    }
    c.engano = antes;
  };
  probar(false);
  if (c.enganos > 0) probar(true);
  return mejor;
}

/** Decide la acción del turno: golpear, o antes descartar lo que no sirve si el golpe es flojo. */
export function decidir(p: Partida): Decision | null {
  const c = p.combate;
  const m = mejorGolpe(p);
  if (!c || !m) return null;
  const e = c.fila[0];
  const flojo = !m.q.abate && !m.q.ejecuta && m.q.aVida < e.vida * 0.45;
  const fuera = c.mano.filter((k) => !m.ids.includes(k.id) && !esComodin(k)).sort((a, b) => a.n - b.n);
  // Chancho Va: el pase gratis siempre se usa con la peor carta que no entra en el golpe
  if (c.pasar && fuera.length && puedeDescartar(p, 1) === 'gratis' && c.mazo.length + c.descarte.length > 0) return { t: 'descarte', ids: [fuera[0].id] };
  if (flojo && c.descartes > 0 && fuera.length >= 2) return { t: 'descarte', ids: fuera.slice(0, 3).map((k) => k.id) };
  return { t: 'golpe', ids: m.ids, engano: m.engano };
}

// ───────────────────────── fuera del combate ─────────────────────────

const PESO_NOTA = { S: 3, A: 2, B: 1 } as const;

function nota(p: Partida, oferta: Oferta, id: string): number {
  return PESO_NOTA[notaDe(oferta.tipo, id)] + (sinergia(p, oferta.tipo, id) ? 0.75 : 0);
}

/** El Amuleto que el bot soltaría para hacer sitio (el de peor nota). */
function peorAmuleto(p: Partida): AmuletoId {
  return [...p.amuletos].sort((a, b) => PESO_NOTA[notaDe('amuleto', a)] - PESO_NOTA[notaDe('amuleto', b)])[0];
}

function resolverBotin(p: Partida, o: OpcionesBot): void {
  const items = p.botin?.items ?? [];
  items.forEach((it, i) => {
    if (it.t !== 'oferta' || it.hecho) return;
    const ops = it.oferta.opciones;
    let id: string | null;
    if (o.ofertasAlAzar) id = elegir(o.rng, ops);
    else {
      // prefiere las notas altas, pero no a ciegas: cada punto de nota duplica la probabilidad de elegirla (como
      // alguien que conoce la pieza y también tiene su gusto). Así una nota que cambia por poco no da vuelta el resultado.
      const pesos = ops.map((x) => 2 ** nota(p, it.oferta, x));
      let r = azar(o.rng) * pesos.reduce((s, w) => s + w, 0);
      id = ops[ops.length - 1];
      for (let k = 0; k < ops.length; k++) {
        r -= pesos[k];
        if (r < 0) {
          id = ops[k];
          break;
        }
      }
    }
    let reemplaza: AmuletoId | undefined;
    if (it.oferta.tipo === 'amuleto' && p.amuletos.length >= p.huecos) {
      reemplaza = peorAmuleto(p);
      if (!o.ofertasAlAzar && PESO_NOTA[notaDe('amuleto', id)] <= PESO_NOTA[notaDe('amuleto', reemplaza)]) id = null;
    }
    if (!juego.elegirOferta(p, i, id, reemplaza)) {
      juego.elegirOferta(p, i, null);
      id = null;
    }
    o.alElegir?.(it.oferta, id);
  });
  juego.seguir(p);
}

function elegirCamino(p: Partida, o: OpcionesBot): Nodo {
  const f = p.vida / p.vidaMax;
  const nota = (n: Nodo): number => {
    switch (n.tipo) {
      case 'fogon':
        return 3 + (1 - f) * 12;
      case 'pulperia':
        return 2 + p.oro / 7 + (1 - f) * 3;
      case 'cabala':
        return 4.5;
      case 'elite':
        return f > 0.65 ? 6.5 : 0.5;
      case 'guardia':
        return 5 + (n.palos?.includes(tramoRey(p)) ? 0 : 0.3);
      default:
        return 5;
    }
  };
  const ops = juego.nodosAlcanzables(p);
  return [...ops].sort((a, b) => nota(b) - nota(a) || azar(o.rng) - 0.5)[0];
}
const tramoRey = (p: Partida) => juego.tramoActual(p).rey;

function enPulperia(p: Partida, o: OpcionesBot): void {
  const t = p.tienda!;
  if (p.vida < p.vidaMax * 0.5 && p.oro >= t.curar) juego.curarEnPulperia(p);
  const orden = t.amuletos.map((a, i) => ({ ...a, i })).sort((a, b) => PESO_NOTA[notaDe('amuleto', b.id)] - PESO_NOTA[notaDe('amuleto', a.id)] || azar(o.rng) - 0.5);
  for (const a of orden) {
    if (p.oro < a.precio) continue;
    if (p.amuletos.length < p.huecos) juego.comprar(p, a.i);
    else {
      const peor = peorAmuleto(p);
      if (PESO_NOTA[notaDe('amuleto', a.id)] > PESO_NOTA[notaDe('amuleto', peor)]) juego.comprar(p, a.i, peor);
    }
  }
  if (p.vida < p.vidaMax * 0.7 && p.oro >= t.curar) juego.curarEnPulperia(p);
  if (p.oro >= t.purgar + 6) {
    const baja = masBaja(p);
    if (baja) juego.purgar(p, baja.id);
  }
  juego.salir(p);
}

function masBaja(p: Partida): Carta | undefined {
  return p.mazo
    .filter((c) => !esComodin(c) && !c.marcada)
    .sort((a, b) => a.n - b.n)
    .find((c) => juego.purgable(p, c.id));
}

function enFogon(p: Partida): void {
  const baja = masBaja(p);
  if (p.vida < p.vidaMax * 0.7 || !baja) juego.descansar(p);
  else juego.quemar(p, baja.id);
  juego.salir(p);
}

function enCabala(p: Partida): void {
  const def = CABALA[p.cabala!.id];
  const si = def.opciones.filter((op) => op.acepta && (!op.puede || op.puede(p)));
  const no = def.opciones.find((op) => !op.acepta);
  let op = si[0];
  if (op?.aSuerte && (def.humor === 'garca' || suerte(p) < 0.4) && no) op = no;
  if (def.id === 'sangre' && p.vidaMax < 50 && no) op = no;
  if (def.id === 'buena') op = p.vida < p.vidaMax * 0.6 ? si[0] : (si[1] ?? si[0]);
  juego.responderCabala(p, (op ?? no ?? def.opciones[0]).id);
  juego.salir(p);
}

/** Un paso del bot: toma una decisión y la aplica. Devuelve false cuando la partida terminó. */
export function paso(p: Partida, o: OpcionesBot): boolean {
  switch (p.fase) {
    case 'fin':
      return false;
    case 'botin':
      resolverBotin(p, o);
      return true;
    case 'mapa':
      juego.elegirNodo(p, elegirCamino(p, o).id);
      return true;
    case 'pulperia':
      enPulperia(p, o);
      return true;
    case 'fogon':
      enFogon(p);
      return true;
    case 'cabala':
      enCabala(p);
      return true;
    case 'combate': {
      const d = decidir(p);
      if (!d) return false;
      if (d.t === 'descarte') {
        if (!juego.descartar(p, d.ids).length) juego.golpear(p, mejorGolpe(p)!.ids);
      } else {
        if (d.engano) juego.armarEngano(p, true);
        const acto = p.acto;
        const tipo = p.combate!.tipo;
        const g = juego.golpear(p, d.ids).find((e) => e.t === 'golpe');
        if (g && g.t === 'golpe') o.alGolpear?.(acto, tipo, g.total);
      }
      return true;
    }
  }
}

/** Juega la partida hasta el final (con tope de pasos, por si acaso). */
export function jugarEntera(p: Partida, o: OpcionesBot): Partida {
  for (let i = 0; i < 5000 && paso(p, o); i++);
  return p;
}
