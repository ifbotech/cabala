// Jugador automático para pruebas, QA y sugerencia de mejor golpe en CÁBALA 2.0.
import type { AmuletoId } from './amuletos';
import { B } from './balance';
import { combinaciones, esComodin } from './cartas';
import type { Carta } from './cartas';
import { cuenta, maxGolpeDe, puedeDescartar } from './combate';
import type { Cuenta } from './combate';
import type { Oferta, Partida } from './estado';
import * as juego from './partida';
import { azar, elegir } from './rng';
import type { ConAzar } from './rng';
import { notaDe, sinergia } from './notas';

export interface OpcionesBot {
  ofertasAlAzar?: boolean;
  rng: ConAzar;
  alElegir?: (oferta: Oferta, elegido: string | null) => void;
  alGolpear?: (acto: number, tipo: string, total: number) => void;
}

function valor(p: Partida, q: Cuenta, sel: readonly Carta[]): number {
  const c = p.combate!;
  const e = c.fila[0];
  const falta = 1 - p.vida / p.vidaMax;
  let v = 0;
  if (q.abate || q.ejecuta) {
    v += 1000 + (q.exacto ? 40 : 0) - sel.length * 6;
  } else {
    v += Math.min(q.aVida, e.vida) + q.aEscudo * 0.7;
    v -= (q.contra ?? 0) * (1.6 + falta * 2.5);
    if (q.aturde) v += 10;
  }
  const curaAlRey = e.jefe && e.palo === 'H' && e.segunda && !q.abate ? q.cura * B.reyes.H.ultimaRonda * 1.1 : 0;
  v -= curaAlRey;
  v += q.cura * (0.4 + falta * 2.2) + q.escudo * (!q.abate ? 0.9 : 0.2) + q.oro * 1.2;
  if (q.canto) v += 8;
  return v;
}

export interface Decision {
  t: 'golpe' | 'descarte';
  ids: string[];
  engano?: boolean;
}

export function mejorGolpe(p: Partida): { ids: string[]; q: Cuenta; v: number; engano: boolean } | null {
  const c = p.combate;
  if (!c || !c.fila.length) return null;
  let mejor: { ids: string[]; q: Cuenta; v: number; engano: boolean } | null = null;
  const probar = (engano: boolean) => {
    const antes = c.engano;
    c.engano = engano;
    for (const sel of combinaciones(c.mano, maxGolpeDe(p))) {
      const q = cuenta(p, sel);
      if (!q.ok) continue;
      let v = valor(p, q, sel);
      if (engano) v -= q.abate ? 5 : 400;
      if (!mejor || v > mejor.v) mejor = { ids: sel.map((k) => k.id), q, v, engano };
    }
    c.engano = antes;
  };
  probar(false);
  if (c.enganos > 0) probar(true);
  return mejor;
}

export function decidir(p: Partida): Decision | null {
  const c = p.combate;
  const m = mejorGolpe(p);
  if (!c || !m) return null;
  const e = c.fila[0];
  const flojo = !m.q.abate && !m.q.ejecuta && m.q.aVida < e.vida * 0.45;
  const fuera = c.mano.filter((k) => !m.ids.includes(k.id) && !esComodin(k)).sort((a, b) => a.n - b.n);
  if (c.pasar && fuera.length && puedeDescartar(p, 1) === 'gratis' && c.mazo.length + c.descarte.length > 0) return { t: 'descarte', ids: [fuera[0].id] };
  if (flojo && c.descartes > 0 && fuera.length >= 2) return { t: 'descarte', ids: fuera.slice(0, 3).map((k) => k.id) };
  return { t: 'golpe', ids: m.ids, engano: m.engano };
}

const PESO_NOTA = { S: 3, A: 2, B: 1 } as const;

function nota(p: Partida, oferta: Oferta, id: string): number {
  return PESO_NOTA[notaDe(oferta.tipo, id)] + (sinergia(p, oferta.tipo, id) ? 0.75 : 0);
}

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

function resolverPulperia(p: Partida, o: OpcionesBot): void {
  const t = p.tienda!;
  if (p.vida < p.vidaMax * 0.65 && p.oro >= t.curar) juego.curarEnPulperia(p);
  t.amuletos.forEach((a, i) => {
    if (a.vendido || p.oro < a.precio || p.amuletos.length >= p.huecos) return;
    if (o.ofertasAlAzar || notaDe('amuleto', a.id) !== 'B') juego.comprar(p, i);
  });
  if (p.oro >= t.purgar && p.mazo.length > B.jugador.mazoMin + 2) {
    const baja = [...p.mazo].filter((k) => !esComodin(k)).sort((a, b) => a.n - b.n)[0];
    if (baja) juego.purgar(p, baja.id);
  }
  juego.salir(p);
}

export function paso(p: Partida, o: OpcionesBot): boolean {
  if (p.fase === 'fin') return false;
  switch (p.fase) {
    case 'botin':
      resolverBotin(p, o);
      return true;
    case 'pulperia':
      resolverPulperia(p, o);
      return true;
    case 'duelo':
      juego.resolverDueloBufon(p, azar(o.rng) < 0.6);
      return true;
    case 'combate': {
      const d = decidir(p);
      if (!d) {
        juego.rendirse(p);
        return true;
      }
      if (d.t === 'descarte') {
        juego.descartar(p, d.ids);
      } else {
        if (d.engano) juego.armarEngano(p, true);
        const tipo = p.combate!.tipo;
        const evs = juego.golpear(p, d.ids);
        const g = evs.find((e) => e.t === 'golpe');
        if (g && g.t === 'golpe') o.alGolpear?.(p.acto, tipo, g.total);
      }
      return true;
    }
  }
}

export function jugar(p: Partida, o: OpcionesBot): Partida {
  let pasos = 0;
  while (p.fase !== 'fin' && pasos++ < 800) if (!paso(p, o)) break;
  return p;
}
