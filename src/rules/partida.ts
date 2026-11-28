// Loop lineal estilo Balatro de CÁBALA 2.0: 3 Tramos × (Sota → Pulpería → Caballo → Duelo del Bufón → Rey).
import { AMULETO, AMULETOS, precioBase } from './amuletos';
import type { AmuletoId, Rareza } from './amuletos';
import { B } from './balance';
import { CABALLO, PALOS, REY, SOTA, barajaBase } from './cartas';
import type { Palo } from './cartas';
import * as combate from './combate';
import type { Ev } from './combate';
import { carga, curar, nivelBend } from './estado';
import type { ItemBotin, ModTramo, Oferta, Partida, TipoCombate } from './estado';
import type { MazoId } from './mazos';
import { BENDICION, BENDICIONES, nivelDe } from './reyes';
import type { BendicionId } from './reyes';
import { barajar, elegir, muestra, ponderado, semillaDe } from './rng';

export const TRAMOS = 3;

export interface OpcionesPartida {
  mazo: MazoId;
  semilla?: string;
}

function donesLibres(p: Partida, rey: Palo): BendicionId[] {
  return BENDICIONES.filter((id) => {
    const d = BENDICION[id];
    return d.rey === rey && nivelBend(p, id) < d.niveles;
  });
}

export function ofertaBendicion(p: Partida): Oferta {
  const opciones: BendicionId[] = [];
  for (const rey of barajar(p, [...PALOS])) {
    if (opciones.length >= 3) break;
    const libres = donesLibres(p, rey).filter((id) => !opciones.includes(id));
    if (libres.length) opciones.push(elegir(p, libres));
  }
  if (opciones.length < 3) {
    const resto = BENDICIONES.filter((id) => !opciones.includes(id) && PALOS.some((r) => donesLibres(p, r).includes(id)));
    opciones.push(...muestra(p, resto, 3 - opciones.length));
  }
  return { tipo: 'bendicion', opciones };
}

const PESOS: Record<'guardia' | 'elite' | 'rey' | 'tienda', Record<Rareza, number>> = {
  guardia: { comun: 55, raro: 35, epico: 10, legendario: 0 },
  elite: { comun: 35, raro: 42, epico: 20, legendario: 3 },
  rey: { comun: 0, raro: 40, epico: 45, legendario: 15 },
  tienda: { comun: 45, raro: 35, epico: 16, legendario: 4 },
};

export function sortearAmuletos(p: Partida, de: 'guardia' | 'elite' | 'rey' | 'tienda', n: number): AmuletoId[] {
  const out: AmuletoId[] = [];
  for (let i = 0; i < n; i++) {
    const yaComun = out.some((id) => AMULETO[id].rareza === 'comun');
    const todos = AMULETOS.filter((id) => !p.amuletos.includes(id) && !out.includes(id));
    const sinComun = todos.filter((id) => AMULETO[id].rareza !== 'comun');
    const libres = yaComun && sinComun.length ? sinComun : todos;
    if (!libres.length) break;
    const conPeso = libres.map((id) => [id, PESOS[de][AMULETO[id].rareza]] as const);
    out.push(conPeso.some(([, w]) => w > 0) ? ponderado(p, conPeso) : elegir(p, libres));
  }
  return out;
}

export const vidaInicial = (mazo: MazoId): number => B.mazos[mazo].vida;
export const reyDeTramo = (p: Pick<Partida, 'reyes' | 'acto'>): Palo => p.reyes[Math.min(p.acto, p.reyes.length - 1)] ?? 'S';

const MODIFICADORES: readonly ModTramo[] = ['escudoDoble', 'manoRapida', 'oroExtra', 'furiaInicial'];

function iniciarPasoCombate(p: Partida): Ev[] {
  const rey = reyDeTramo(p);
  if (p.paso === 0) {
    p.modificador = p.acto === 0 ? 'ninguno' : elegir(p, MODIFICADORES);
  }
  const mod = p.modificador ?? 'ninguno';
  let evs: Ev[];
  if (p.paso === 0) evs = combate.iniciarCombate(p, 'guardia', [combate.crearEnemigo(p, rey, SOTA)]);
  else if (p.paso === 2) evs = combate.iniciarCombate(p, 'elite', [combate.crearEnemigo(p, rey, CABALLO, { elite: true })]);
  else evs = combate.iniciarCombate(p, 'rey', [combate.crearEnemigo(p, rey, REY, { jefe: true })]);
  const c = p.combate;
  if (c && c.fila[0]) {
    if (mod === 'escudoDoble') {
      c.fila[0].escudo += 15;
      c.fila[0].escudoMax += 15;
    } else if (mod === 'furiaInicial') {
      c.furia += 1;
    } else if (mod === 'manoRapida' && c.mazo.length > 0) {
      c.mano.push(c.mazo.shift()!);
    }
  }
  return evs;
}

function abrirPulperia(p: Partida): void {
  p.tienda = {
    amuletos: sortearAmuletos(p, 'tienda', 2).map((a) => ({ id: a, precio: precioAmuleto(p, a) })),
    purgar: precioPurgar(p),
    curar: precioCurar(p),
    mejorar: 10,
    rerolls: 1,
  };
  p.fase = 'pulperia';
}

export function nuevaPartida(o: OpcionesPartida): Partida {
  const m = B.mazos[o.mazo];
  const semilla = (o.semilla ?? 'CABALA').toUpperCase();
  const vida = vidaInicial(o.mazo);
  const p: Partida = {
    v: 2,
    semilla,
    rng: semillaDe(`${semilla}|${o.mazo}`),
    mazoId: o.mazo,
    vida,
    vidaMax: vida,
    oro: B.jugador.oro,
    mazo: barajaBase(m.hasta, m.comodines),
    manoMax: m.mano,
    amuletos: [],
    huecos: 6,
    bendiciones: {},
    cargas: { S: 0, C: 0, D: 0, H: 0 },
    cantos: 0,
    afinidad: 0,
    furiaRey: 0,
    acto: 0,
    paso: 0,
    reyes: [],
    fase: 'combate',
    purgas: 0,
    curas: 0,
    racha: 0,
    stats: { combates: 0, elites: 0, reyes: 0, abatidos: 0, exactos: 0, alPelo: 0, cantos: 0, pokers: 0, golpes: 0, mejorGolpe: 0, turnos: 0, danoRecibido: 0 },
  };
  p.reyes = barajar(p, [...PALOS]).slice(0, TRAMOS);
  iniciarPasoCombate(p);
  return p;
}

export const precioAmuleto = (_p: Partida, id: AmuletoId): number => precioBase(id);
export const precioPurgar = (p: Partida): number => Math.max(0, B.pulperia.purgar + p.purgas * B.pulperia.purgarSube);
export const precioCurar = (p: Partida): number => B.pulperia.curar + p.curas * B.pulperia.curarSube;

function terminar(p: Partida, victoria: boolean): void {
  p.fase = 'fin';
  p.fin = { victoria };
  const e = p.combate?.fila[0];
  if (!victoria && e) p.fin.por = { palo: e.palo, rango: e.rango, jefe: !!e.jefe, elite: !!e.elite, acto: p.acto, vida: e.vida, vidaMax: e.vidaMax };
  delete p.combate;
}

function botinDe(p: Partida, tipo: TipoCombate): void {
  const s = p.stats;
  s.combates++;
  if (tipo === 'elite') s.elites++;
  if (tipo === 'rey') s.reyes++;
  const items: ItemBotin[] = [];
  let oro = B.botin.oro[tipo][Math.min(p.acto, 2)] + carga(p, 'D');
  if (p.modificador === 'oroExtra') oro += 6;
  else if (p.modificador === 'furiaInicial') oro += 4;
  const bn = B.bendiciones;
  const lv = nivelBend(p, 'interes');
  if (lv) oro += Math.min(nivelDe(bn.interes.tope, lv), Math.floor(p.oro / nivelDe(bn.interes.cada, lv)));
  if (oro > 0) {
    p.oro += oro;
    items.push({ t: 'oro', n: oro, hecho: true });
  }
  let cura = carga(p, 'H');
  if (tipo === 'elite') {
    cura += Math.round(p.vidaMax * ((B.botin as { curaElite?: number }).curaElite ?? 0.25));
  } else if (tipo === 'rey') {
    const sube = Math.max(B.botin.vidaReyMin, Math.round(B.mazos[p.mazoId].vida * B.botin.vidaRey));
    if (sube > 0) {
      p.vidaMax += sube;
      items.push({ t: 'vidamax', n: sube, hecho: true });
    }
    cura += Math.round(p.vidaMax * B.botin.curaRey);
  }
  if (cura > 0) {
    const antes = p.vida;
    curar(p, cura);
    if (p.vida > antes) items.push({ t: 'cura', n: p.vida - antes, hecho: true });
  }
  if (tipo === 'rey' && p.acto >= TRAMOS - 1) {
    terminar(p, true);
    return;
  }
  if (tipo === 'guardia') {
    items.push({ t: 'oferta', oferta: { tipo: 'amuleto', opciones: sortearAmuletos(p, 'guardia', 3) } });
  } else if (tipo === 'rey') {
    items.push({ t: 'oferta', oferta: ofertaBendicion(p) });
    items.push({ t: 'oferta', oferta: { tipo: 'amuleto', opciones: sortearAmuletos(p, 'rey', 3) } });
  }
  p.botin = { de: tipo, items: items.filter((i) => i.t !== 'oferta' || i.oferta.opciones.length > 0) };
  p.fase = 'botin';
  delete p.combate;
}

function cerrar(p: Partida, evs: Ev[]): Ev[] {
  if (evs.some((e) => e.t === 'derrota')) terminar(p, false);
  else if (evs.some((e) => e.t === 'victoria') && p.combate) botinDe(p, p.combate.tipo);
  return evs;
}

export const golpear = (p: Partida, ids: readonly string[]): Ev[] => cerrar(p, combate.golpear(p, ids));
export const descartar = (p: Partida, ids: readonly string[]): Ev[] => combate.descartar(p, ids);
export const armarEngano = combate.armarEngano;

function tomar(p: Partida, oferta: Oferta, id: string, reemplaza?: AmuletoId): boolean {
  if (oferta.tipo === 'bendicion') {
    const b = id as BendicionId;
    const def = BENDICION[b];
    if (!def || nivelBend(p, b) >= def.niveles) return false;
    p.bendiciones[b] = nivelBend(p, b) + 1;
    return true;
  }
  const a = id as AmuletoId;
  if (p.amuletos.includes(a)) return false;
  if (p.amuletos.length >= p.huecos) {
    if (!reemplaza || !p.amuletos.includes(reemplaza)) return false;
    p.amuletos.splice(p.amuletos.indexOf(reemplaza), 1);
  }
  p.amuletos.push(a);
  return true;
}

export function elegirOferta(p: Partida, item: number, id: string | null, reemplaza?: AmuletoId): boolean {
  const it = p.botin?.items[item];
  if (p.fase !== 'botin' || !it || it.t !== 'oferta' || it.hecho) return false;
  const precio = it.oferta.precio ?? 0;
  if (id === null) {
    if (!precio) p.oro += B.botin.saltar;
  } else {
    if (!it.oferta.opciones.includes(id) || p.oro < precio) return false;
    if (!tomar(p, it.oferta, id, reemplaza)) return false;
    p.oro -= precio;
  }
  it.hecho = true;
  return true;
}

export const botinPendiente = (p: Partida): boolean => !!p.botin?.items.some((i) => i.t === 'oferta' && !i.hecho);

export function seguir(p: Partida): void {
  if (p.fase !== 'botin' || !p.botin) return;
  const de = p.botin.de;
  delete p.botin;
  if (de === 'guardia') {
    p.paso = 1;
    abrirPulperia(p);
  } else if (de === 'elite') {
    p.paso = 3;
    p.fase = 'duelo';
  } else if (de === 'duelo') {
    p.paso = 4;
    iniciarPasoCombate(p);
  } else if (de === 'rey') {
    p.acto++;
    p.paso = 0;
    iniciarPasoCombate(p);
  }
}

export function resolverDueloBufon(p: Partida, gano: boolean): void {
  if (p.fase !== 'duelo') return;
  if (gano) {
    p.afinidad = Math.min(3, p.afinidad + 1);
    curar(p, p.vidaMax * 0.15);
    p.botin = { de: 'duelo', items: [{ t: 'oferta', oferta: ofertaBendicion(p) }] };
    p.fase = 'botin';
  } else {
    // Premio consuelo sin castigo mortal al Rey
    p.oro += 8;
    curar(p, 10);
    p.paso = 4;
    iniciarPasoCombate(p);
  }
}

export function comprar(p: Partida, i: number, reemplaza?: AmuletoId): boolean {
  const a = p.tienda?.amuletos[i];
  if (p.fase !== 'pulperia' || !a || a.vendido || p.oro < a.precio) return false;
  if (!tomar(p, { tipo: 'amuleto', opciones: [a.id] }, a.id, reemplaza)) return false;
  p.oro -= a.precio;
  a.vendido = true;
  return true;
}

export const purgable = (p: Partida, cartaId: string): boolean => p.mazo.length > B.jugador.mazoMin && p.mazo.some((c) => c.id === cartaId);

export function purgar(p: Partida, cartaId: string): boolean {
  const t = p.tienda;
  if (p.fase !== 'pulperia' || !t || p.oro < t.purgar || !purgable(p, cartaId)) return false;
  p.mazo = p.mazo.filter((c) => c.id !== cartaId);
  p.oro -= t.purgar;
  p.purgas++;
  t.purgar = precioPurgar(p);
  return true;
}

export function curarEnPulperia(p: Partida): boolean {
  const t = p.tienda;
  if (p.fase !== 'pulperia' || !t || p.oro < t.curar || p.vida >= p.vidaMax) return false;
  p.oro -= t.curar;
  curar(p, p.vidaMax * B.pulperia.curarPct);
  p.curas++;
  t.curar = precioCurar(p);
  return true;
}

export const precioReroll = (p: Partida): number => (p.tienda && p.tienda.rerolls > 0 ? 0 : 6);

export function rerollPulperia(p: Partida): boolean {
  const t = p.tienda;
  if (p.fase !== 'pulperia' || !t) return false;
  const costo = precioReroll(p);
  if (p.oro < costo) return false;
  p.oro -= costo;
  if (t.rerolls > 0) t.rerolls--;
  t.amuletos = sortearAmuletos(p, 'tienda', 2).map((a) => ({ id: a, precio: precioAmuleto(p, a) }));
  return true;
}

export const mejorable = (p: Partida, cartaId: string): boolean => p.mazo.some((c) => c.id === cartaId && c.palo !== 'X');

export function mejorarCarta(p: Partida, cartaId: string): boolean {
  const t = p.tienda;
  const c = p.mazo.find((x) => x.id === cartaId && x.palo !== 'X');
  if (p.fase !== 'pulperia' || !t || !c || p.oro < t.mejorar) return false;
  p.oro -= t.mejorar;
  c.bonus = (c.bonus ?? 0) + 3;
  t.mejorar += 4;
  return true;
}

export function salir(p: Partida): void {
  if (p.fase !== 'pulperia') return;
  delete p.tienda;
  p.paso = 2;
  iniciarPasoCombate(p);
}

export function rendirse(p: Partida): void {
  if (p.fase !== 'fin') terminar(p, false);
}

export { REY };
