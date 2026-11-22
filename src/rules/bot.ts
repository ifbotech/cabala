// Un jugador automático razonable: juega una partida entera tomando cada decisión con la misma información que ve
// una persona. Lo usan el laboratorio (analyze:meta), las pruebas y la QA de humo; la mesa lo usa para «la mejor
// jugada». No hace trampa: no mira el Mazo ni el azar que viene.
import type { AmuletoId } from './amuletos';
import { B } from './balance';
import { CABALA, suerte } from './bufon';
import { combinaciones, esComodin } from './cartas';
import type { Carta } from './cartas';
import { cuenta, medioDe, postasDe, postasPorDefecto, puedeDescartar } from './combate';
import { huecosChiche } from './chiches';
import { evoluciono } from './evoluciones';
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
  // la Última ronda del Bacanal: cada punto que te curás se lo cura él ×2
  const curaAlRey = e.jefe && e.palo === 'H' && e.segunda && !q.abate ? q.cura * B.reyes.H.ultimaRonda * 1.1 : 0;
  v -= curaAlRey;
  v += q.cura * (0.4 + falta * 2.2) + q.escudo * (c.fila.length > 1 || !q.abate ? 0.9 : 0.2) + q.oro * 1.2;
  if (q.canto) v += 8;
  return v;
}

export interface Decision {
  t: 'golpe' | 'descarte';
  ids: string[];
  engano?: boolean;
  /** En qué Posta va cada carta del golpe. */
  postas?: number[];
}

/** Los juegos de k Postas de n, en orden creciente. */
function subconjuntos(n: number, k: number): number[][] {
  if (k === 0) return [[]];
  const out: number[][] = [];
  for (let i = k - 1; i < n; i++) for (const r of subconjuntos(i, k - 1)) out.push([...r, i]);
  return out;
}
/** Todas las maneras de poner k cartas en n Postas (una carta por Posta). */
function permutaciones(n: number, k: number): number[][] {
  if (k === 0) return [[]];
  const out: number[][] = [];
  for (const r of permutaciones(n, k - 1)) for (let i = 0; i < n; i++) if (!r.includes(i)) out.push([...r, i]);
  return out;
}

/** Las maneras de apoyar un golpe en el paño que el bot prueba: la de por defecto, en Escalón y con la más alta al Medio. */
export function acomodos(p: Partida, sel: readonly Carta[]): number[][] {
  const n = postasDe(p);
  const k = sel.length;
  const out = [postasPorDefecto(n, k)];
  if (k >= 3) {
    // en Escalón sobre cada juego de Postas posible (así también se prueba la más alta justo en el Medio)
    const orden = sel.map((_, i) => i).sort((a, b) => sel[a].n - sel[b].n);
    for (const lugares of subconjuntos(n, k)) {
      const pos: number[] = new Array(k);
      orden.forEach((i, j) => (pos[i] = lugares[j]));
      out.push(pos);
    }
  }
  if (k >= 2) {
    // la más alta al Medio y, si hay Comodín, a su izquierda (le da Chispa)
    const alta = sel.reduce((b, x, i) => (!esComodin(x) && x.n > sel[b].n ? i : b), 0);
    const com = sel.findIndex((x) => esComodin(x));
    const libres = postasPorDefecto(n, n);
    const pos: number[] = new Array(k).fill(-1);
    pos[alta] = medioDe(n);
    if (com >= 0 && com !== alta) pos[com] = medioDe(n) - 1;
    const usadas = new Set(pos.filter((x) => x >= 0));
    for (let i = 0; i < k; i++) if (pos[i] < 0) pos[i] = libres.find((x) => !usadas.has(x) && (usadas.add(x), true))!;
    out.push(pos);
  }
  return out;
}

/**
 * La mesa acomoda sola: de las maneras de apoyar esas cartas en el paño, la que más pega (a igual total, la de por
 * defecto). El jugador puede reordenar después; esto es lo que ve al elegir las cartas.
 */
export function mejorAcomodo(p: Partida, sel: readonly Carta[]): number[] {
  // la mesa prueba todas las maneras (a lo sumo 5 × 4 × 3 × 2 = 120): la de por defecto va primero y gana los empates
  const todas = [postasPorDefecto(postasDe(p), sel.length), ...permutaciones(postasDe(p), sel.length)];
  let mejor = todas[0];
  let total = cuenta(p, sel, mejor).total;
  for (const pos of todas.slice(1)) {
    const q = cuenta(p, sel, pos);
    if (q.ok && q.total > total) (mejor = pos), (total = q.total);
  }
  // (0.25.0) sin Perfora lo que sobra no va a ningún lado: si otra manera abate igual con Golpe exacto, la mesa la
  // apoya sola (paga oro y racha). Con Perfora, lo de más pasa al siguiente y la elección queda en el dial.
  const q = cuenta(p, sel, mejor);
  if (q.ok && q.abate && !q.exacto && !q.perfora) {
    for (const pos of todas) if (cuenta(p, sel, pos).exacto) return pos;
  }
  return mejor;
}

/**
 * El otro acomodo que ofrece la mesa (0.23.0): una manera de apoyar esas mismas cartas que abate al enemigo con Golpe
 * exacto, si existe y si la mejor disposición no lo es ya. El paño deja de ser solo un máximo: es el dial del exacto.
 */
export function acomodoExacto(p: Partida, sel: readonly Carta[]): number[] | null {
  if (!sel.length || cuenta(p, sel, mejorAcomodo(p, sel)).exacto) return null;
  for (const pos of permutaciones(postasDe(p), sel.length)) if (cuenta(p, sel, pos).exacto) return pos;
  return null;
}

/** La mejor jugada de la mano según el bot (o null si no hay combate). */
export function mejorGolpe(p: Partida): { ids: string[]; q: Cuenta; v: number; engano: boolean; postas?: number[] } | null {
  const c = p.combate;
  if (!c || !c.fila.length) return null;
  let mejor: { ids: string[]; q: Cuenta; v: number; engano: boolean; postas?: number[] } | null = null;
  const probar = (engano: boolean) => {
    const antes = c.engano;
    c.engano = engano;
    // primero cada golpe con las Postas de por defecto; después, los mejores se prueban acomodados de otra manera
    const vistos: { sel: Carta[]; v: number }[] = [];
    const pesar = (sel: Carta[], postas?: number[]): number | null => {
      const q = cuenta(p, sel, postas);
      if (!q.ok) return null;
      let v = valor(p, q, sel);
      // el Engaño se guarda para cuando abate
      if (engano) v -= q.abate ? 5 : 400;
      if (!mejor || v > mejor.v) mejor = { ids: sel.map((k) => k.id), q, v, engano, postas: q.postas };
      return v;
    };
    for (const sel of combinaciones(c.mano)) {
      const v = pesar(sel);
      if (v !== null) vistos.push({ sel, v });
    }
    vistos.sort((a, b) => b.v - a.v);
    for (const { sel } of vistos.slice(0, 3)) if (sel.length > 1) for (const postas of acomodos(p, sel).slice(1)) pesar(sel, postas);
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
  // (0.27.0) el Sol de la Timba: sin descartes, paga con oro para cavar cuando el golpe es flojo, o cuando no canta ni
  // abate y la bolsa aguanta (deja una reserva para no apagar el Multi del propio Sol); nunca fuerza una baraja nueva
  if (c.descartes === 0 && evoluciono(p, 'cofre') && fuera.length) {
    const tira = fuera.slice(0, 3);
    const sol = B.evoluciones.sol;
    const busca = !m.q.abate && !m.q.ejecuta && !m.q.canto && (p.oro >= sol.descarte + B.amuletos.cofre.cada * sol.tope || p.oro % B.amuletos.cofre.cada >= sol.descarte);
    if ((flojo || busca) && c.mazo.length >= tira.length && puedeDescartar(p, tira.length) === 'descarte') return { t: 'descarte', ids: tira.map((k) => k.id) };
  }
  // como la mesa (0.25.0): si abate sin Perfora, apoya las mismas cartas de la manera que deja el Golpe exacto
  let postas = m.postas;
  if (m.q.abate && !m.q.exacto && !m.q.perfora) {
    const sel = m.ids.map((id) => c.mano.find((k) => k.id === id)!);
    const c0 = c.engano;
    c.engano = m.engano;
    const ex = mejorAcomodo(p, sel);
    if (cuenta(p, sel, ex).exacto) postas = ex;
    c.engano = c0;
  }
  return { t: 'golpe', ids: m.ids, engano: m.engano, postas };
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
    // un Tesoro con candado se abre solo si queda un resto de oro después de pagarlo
    if (id !== null && (it.oferta.precio ?? 0) > 0 && p.oro < (it.oferta.precio ?? 0) + 5) id = null;
    let reemplaza: AmuletoId | undefined;
    if (it.oferta.tipo === 'amuleto' && p.amuletos.length >= p.huecos) {
      reemplaza = peorAmuleto(p);
      if (id !== null && !o.ofertasAlAzar && PESO_NOTA[notaDe('amuleto', id)] <= PESO_NOTA[notaDe('amuleto', reemplaza)]) id = null;
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
  // un Chiche si sobra plata y hay hueco
  (t.chiches ?? []).forEach((k, i) => {
    if (p.oro >= k.precio + 10) juego.comprarChiche(p, i);
  });
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
  // con poca Vida descansa; si no, templa su mejor naipe una sola vez (la pasada segura: no se la juega)
  const mejor = [...p.mazo].filter((k) => k.palo !== 'X').sort((a, b) => b.n + (b.temple ?? 0) - (a.n + (a.temple ?? 0)))[0];
  if (p.vida < p.vidaMax * 0.7 || !mejor) juego.descansar(p);
  else if (juego.templar(p, mejor.id) && juego.puedeArrimar(p)) {
    // la segunda pasada paga (otro tanto de Daño y +Multi contra un tercio de quemarlo): la toma; la Forja Brava (el
    // naipe entero vale doble), solo si el Mazo aguanta perderlo, y elige la mutación que mejor le sienta
    if (juego.templar(p, mejor.id) === 'templada' && juego.puedeArrimar(p) && p.mazo.length > B.jugador.mazoMin + 6) {
      const of = p.fogonMutaciones ?? [];
      const quiere = p.vida >= p.vidaMax * 0.8 && of.includes('doblefilo') ? 'doblefilo' : of.includes('roba') ? 'roba' : of[0];
      juego.templar(p, mejor.id, quiere);
    }
  }
  juego.salir(p);
}

/** La Cábala Negra del bot: cose el par más alto; si no hay, trasplanta el naipe más bajo en el más alto. */
function enCabalaNegra(p: Partida): void {
  const cartas = p.mazo.filter((c) => !esComodin(c) && !c.marcada).sort((a, b) => b.n - a.n);
  const par = cartas.find((a, i) => cartas.some((b, j) => j !== i && b.n === a.n));
  const otro = par && cartas.find((b) => b !== par && b.n === par.n);
  if (par && otro && juego.responderCabala(p, 'coser', [par.id, otro.id])) return void juego.salir(p);
  const baja = cartas[cartas.length - 1];
  if (cartas.length >= 2 && juego.responderCabala(p, 'trasplantar', [baja.id, cartas[0].id])) return void juego.salir(p);
  juego.responderCabala(p, 'no');
  juego.salir(p);
}

function enCabala(p: Partida): void {
  if (p.cabala!.id === 'negra') return enCabalaNegra(p);
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

/** Los Chiches del bot: Ginebra con poca Vida; Poroto y Tiza enseguida; Dado y Fósforo contra Reyes y Élites, o cuando abaten. */
function usarChiches(p: Partida): void {
  const c = p.combate;
  if (!c || !c.fila.length) return;
  const h = huecosChiche(p.chiches);
  h.forEach((id, i) => {
    if (!id) return;
    const fuerte = c.tipo !== 'guardia';
    if (id === 'ginebra' && p.vida <= p.vidaMax * 0.45) juego.usarChiche(p, i);
    else if (id === 'poroto' || id === 'tiza') juego.usarChiche(p, i);
    else if ((id === 'dado' || id === 'fosforo') && fuerte) juego.usarChiche(p, i);
  });
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
      usarChiches(p);
      const d = decidir(p);
      if (!d) return false;
      if (d.t === 'descarte') {
        if (!juego.descartar(p, d.ids).length) juego.golpear(p, mejorGolpe(p)!.ids);
      } else {
        if (d.engano) juego.armarEngano(p, true);
        const acto = p.acto;
        const tipo = p.combate!.tipo;
        const g = juego.golpear(p, d.ids, d.postas).find((e) => e.t === 'golpe');
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
