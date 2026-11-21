// La partida de punta a punta: elegís Mazo, el Bufón te ofrece la primera Cábala y te lleva por tres tramos del Mapa
// (Guardia, Élite, Pulpería, Cábala del Bufón, Fogón) hasta el Rey de cada uno. Todo lo que cambia el estado pasa por
// las funciones de este archivo (y las de combate.ts, que este envuelve).
import { AMULETO, AMULETOS, precioBase } from './amuletos';
import type { AmuletoId, Rareza } from './amuletos';
import { AUMENTO, aumentosDe } from './aumentos';
import type { AumentoId, Nivel } from './aumentos';
import { B } from './balance';
import { CABALA, moverAfinidad, resolverCabala, sortearCabala } from './bufon';
import { CABALLO, MUTACIONES, PALOS, REY, SOTA, barajaBase } from './cartas';
import type { Palo } from './cartas';
import * as combate from './combate';
import type { Ev } from './combate';
import { carga, curar, donesDe, nivelBend, pagarVidaMax, tieneAumento, vidaMaxTrasCosto } from './estado';
import type { Enemigo, ItemBotin, Nodo, Oferta, Partida, TipoCombate } from './estado';
import { TRAMOS, alcanzables, generarTramo, sortearReyes } from './mapa';
import type { MazoId } from './mazos';
import { CHICHES } from './chiches';
import { altarVacio, porotosDe } from './perfil';
import { BENDICION, BENDICIONES, nivelDe } from './reyes';
import type { BendicionId } from './reyes';
import { azar, barajar, elegir, muestra, ponderado, semillaDe } from './rng';

export interface OpcionesPartida {
  mazo: MazoId;
  reinado?: number;
  semilla?: string;
  altar?: Record<string, number>;
}

// ───────────────────────── ofertas («ELEGÍ UNA») ─────────────────────────

/** Tres Aumentos de un nivel que no lleves (si el nivel se agota, completa con los vecinos). */
export function ofertaAumento(p: Partida, nivel: Nivel): Oferta {
  const libres = (n: Nivel) => aumentosDe(n).filter((id) => !p.aumentos.includes(id));
  let opciones = muestra(p, libres(nivel), 3);
  for (const otro of ['oro', 'plata', 'prisma'] as Nivel[]) {
    if (opciones.length >= 3) break;
    if (otro !== nivel) opciones = [...opciones, ...muestra(p, libres(otro), 3 - opciones.length)];
  }
  return { tipo: 'aumento', opciones, nivel };
}

/** Las Bendiciones que un Rey puede ofrecer ahora: las suyas sin llegar al tope y los Pactos Duales ya abiertos. */
function donesLibres(p: Partida, rey: Palo): BendicionId[] {
  return BENDICIONES.filter((id) => {
    const d = BENDICION[id];
    if (d.dual) return (d.rey === rey || d.dual === rey) && !nivelBend(p, id) && donesDe(p, d.rey) > 0 && donesDe(p, d.dual) > 0;
    return d.rey === rey && nivelBend(p, id) < d.niveles;
  });
}

/** Tres Reyes distintos ponen un don cada uno (si a alguno no le queda nada, repite otro). */
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

const PESOS: Record<'elite' | 'rey' | 'tienda' | 'tesoro', Record<Rareza, number>> = {
  tesoro: { comun: 0, raro: 15, epico: 60, legendario: 25 },
  elite: { comun: 35, raro: 42, epico: 20, legendario: 3 },
  rey: { comun: 0, raro: 40, epico: 45, legendario: 15 },
  tienda: { comun: 45, raro: 35, epico: 16, legendario: 4 },
};

/** `n` Amuletos distintos que no lleves, sorteados por rareza según de dónde salen. */
export function sortearAmuletos(p: Partida, de: 'elite' | 'rey' | 'tienda' | 'tesoro', n: number): AmuletoId[] {
  const out: AmuletoId[] = [];
  for (let i = 0; i < n; i++) {
    // nunca dos Comunes en la misma oferta: la tienda tiene que ser una decisión, no tres variantes de lo mismo
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

// ───────────────────────── empezar ─────────────────────────

/** La Vida con la que empieza un Mazo según el nivel de «Vida Inicial» del Altar. */
export const vidaInicial = (mazo: MazoId, nivel = 0): number => Math.round(B.mazos[mazo].vida * (1 + nivel * B.altar.vida));

export function nuevaPartida(o: OpcionesPartida): Partida {
  const altar = { ...altarVacio(), ...(o.altar ?? {}) };
  const reinado = Math.max(1, Math.min(8, o.reinado ?? 1));
  const m = B.mazos[o.mazo];
  const semilla = (o.semilla ?? 'CABALA').toUpperCase();
  const vida = vidaMaxTrasCosto(vidaInicial(o.mazo, altar.vida), reinado >= 6 ? B.reinados.vidaMax : 0);
  const p: Partida = {
    v: 1,
    semilla,
    rng: semillaDe(`${semilla}|${o.mazo}|${reinado}`),
    mazoId: o.mazo,
    reinado,
    vida,
    vidaMax: vida,
    oro: B.jugador.oro + altar.oro * B.altar.oro,
    mazo: barajaBase(m.hasta, m.comodines),
    manoMax: m.mano,
    amuletos: [],
    huecos: B.jugador.huecos + altar.hueco,
    aumentos: [],
    chiches: [null, null, null],
    bendiciones: {},
    cargas: { S: 0, C: 0, D: 0, H: 0 },
    cantos: 0,
    afinidad: 0,
    furiaRey: 0,
    irseAlMazo: false,
    acto: 0,
    tramos: [],
    pos: null,
    camino: [],
    fase: 'botin',
    cabalasVistas: [],
    purgas: 0,
    curas: 0,
    altar,
    racha: 0,
    stats: { combates: 0, elites: 0, reyes: 0, abatidos: 0, exactos: 0, alPelo: 0, cantos: 0, pokers: 0, golpes: 0, mejorGolpe: 0, turnos: 0, danoRecibido: 0 },
  };
  const reyes = sortearReyes(p);
  p.tramos = reyes.map((rey, i) => generarTramo(p, i, rey));
  // el primer hito: el Bufón te ofrece una Cábala de Plata antes de salir
  p.botin = { de: 'inicio', items: [{ t: 'oferta', oferta: ofertaAumento(p, 'plata') }] };
  return p;
}

// ───────────────────────── Mapa y nodos ─────────────────────────

export const tramoActual = (p: Partida) => p.tramos[Math.min(p.acto, p.tramos.length - 1)];
export const nodosAlcanzables = (p: Partida): Nodo[] => (p.fase === 'mapa' ? alcanzables(tramoActual(p), p.pos) : []);
export const nodoActual = (p: Partida): Nodo | undefined => tramoActual(p).nodos.find((n) => n.id === p.pos);

/** Los enemigos que esperan en un nodo de combate, del primero al último. */
export function filaDe(p: Partida, nodo: Nodo): Enemigo[] {
  const [a, b] = nodo.palos ?? ['S', 'C'];
  const crear = combate.crearEnemigo;
  if (nodo.tipo === 'rey') return [crear(p, a, SOTA), crear(p, a, CABALLO), crear(p, a, REY, { jefe: true })];
  if (nodo.tipo === 'elite') {
    if (p.acto === 0) return [crear(p, a, CABALLO, { elite: true })];
    if (p.acto === 1) return [crear(p, a, CABALLO, { elite: true }), crear(p, b ?? a, SOTA)];
    return [crear(p, a, CABALLO, { elite: true }), crear(p, b ?? a, CABALLO, { elite: true })];
  }
  if (p.acto === 0) return [crear(p, a, SOTA), crear(p, b, SOTA)];
  if (p.acto === 1) return [crear(p, a, SOTA), crear(p, b, CABALLO)];
  return [crear(p, a, CABALLO), crear(p, b, CABALLO)];
}

const descuento = (p: Partida): number => (1 - (p.altar.descuento ?? 0) * B.altar.descuento) * (tieneAumento(p, 'chamuyo') ? 1 - B.aumentos.chamuyo : 1);
const conDescuento = (p: Partida, precio: number): number => (precio <= 0 ? 0 : Math.max(1, Math.round(precio * descuento(p))));
export const precioAmuleto = (p: Partida, id: AmuletoId): number => conDescuento(p, precioBase(id));
export const precioPurgar = (p: Partida): number => conDescuento(p, Math.max(0, B.pulperia.purgar + p.purgas * B.pulperia.purgarSube - (p.altar.purga ?? 0) * B.altar.purga));
export const precioCurar = (p: Partida): number => conDescuento(p, B.pulperia.curar + p.curas * B.pulperia.curarSube);

/** Entra en un nodo del Mapa. Devuelve los sucesos del arranque si es un combate. */
export function elegirNodo(p: Partida, id: string): Ev[] {
  const nodo = nodosAlcanzables(p).find((n) => n.id === id);
  if (!nodo) return [];
  p.pos = id;
  p.camino.push(id);
  switch (nodo.tipo) {
    case 'guardia':
    case 'elite':
    case 'rey':
      return combate.iniciarCombate(p, nodo.tipo, filaDe(p, nodo));
    case 'pulperia':
      p.tienda = {
        amuletos: sortearAmuletos(p, 'tienda', 3).map((a) => ({ id: a, precio: precioAmuleto(p, a) })),
        chiches: muestra(p, CHICHES, B.chiches.enTienda).map((id) => ({ id, precio: B.chiches.precio })),
        purgar: precioPurgar(p),
        curar: precioCurar(p),
      };
      p.fase = 'pulperia';
      return [];
    case 'fogon':
      p.fogonHecho = false;
      p.fogonCarta = null;
      p.fogonPasadas = 0;
      p.fase = 'fogon';
      return [];
    case 'cabala':
      p.cabala = { id: sortearCabala(p).id };
      p.fase = 'cabala';
      return [];
  }
}

// ───────────────────────── combate (envoltorios) ─────────────────────────

function terminar(p: Partida, victoria: boolean): void {
  p.fase = 'fin';
  p.fin = { victoria, porotos: porotosDe(p, victoria) };
  delete p.combate;
}

/** Arma el botín de un combate ganado: el oro y la cura se cobran solos; lo que hay que elegir queda en la lista. */
function botinDe(p: Partida, tipo: TipoCombate): void {
  const c = p.combate!;
  const s = p.stats;
  s.combates++;
  if (tipo === 'elite') s.elites++;
  if (tipo === 'rey') s.reyes++;
  const items: ItemBotin[] = [];
  // oro: el del combate, el Vuelto de Más, la Fortuna y el interés
  let oro = B.botin.oro[tipo][Math.min(p.acto, 2)] + carga(p, 'D');
  if (tieneAumento(p, 'vueltodemas')) oro += B.aumentos.vueltodemas;
  const bn = B.bendiciones;
  let lv = nivelBend(p, 'interes');
  if (lv) oro += Math.min(nivelDe(bn.interes.tope, lv), Math.floor(p.oro / nivelDe(bn.interes.cada, lv)));
  if (oro > 0) {
    p.oro += oro;
    items.push({ t: 'oro', n: oro, hecho: true });
  }
  // cura: el Brindis, el Rescoldo y el respiro tras un Rey
  let cura = carga(p, 'H');
  if (nivelBend(p, 'rescoldo')) cura += Math.floor(c.escudo / bn.rescoldo);
  if (tipo === 'rey') {
    // vencer a un Rey te curte: la Vida máxima crece (se arranca frágil y se llega entero al final)
    // la Vida máxima crece en proporción (0.19.0): un +12 plano era +133 % para el Mentiroso y +19 % para el Chancho
    const sube = Math.max(B.botin.vidaReyMin, Math.round(B.mazos[p.mazoId].vida * B.botin.vidaRey)); // de la Vida del Mazo, no del Altar
    if (sube > 0) {
      p.vidaMax += sube;
      items.push({ t: 'vidamax', n: sube, hecho: true });
    }
    cura += Math.round(p.vidaMax * B.botin.curaRey);
  }
  lv = nivelBend(p, 'convite');
  if (lv) {
    const sube = Math.min(bn.convite.tope, Math.floor(p.oro / bn.convite.cada));
    p.vidaMax += sube;
    cura += sube;
  }
  if (cura > 0) {
    const antes = p.vida;
    curar(p, cura);
    if (p.vida > antes) items.push({ t: 'cura', n: p.vida - antes, hecho: true });
  }
  const ultimo = tipo === 'rey' && p.acto >= TRAMOS - 1;
  if (ultimo) {
    terminar(p, true);
    return;
  }
  if (tipo === 'guardia') items.push({ t: 'oferta', oferta: ofertaBendicion(p) });
  if (tipo === 'elite') items.push({ t: 'oferta', oferta: { tipo: 'amuleto', opciones: sortearAmuletos(p, 'elite', 3) } });
  // el Tesoro a la vista del nodo: tras la Élite se abre solo; tras la Guardia, con candado de oro
  const tesoro = tipo !== 'rey' ? nodoActual(p)?.tesoro : undefined;
  if (tesoro) items.push({ t: 'oferta', oferta: { tipo: 'amuleto', opciones: sortearAmuletos(p, 'tesoro', 2), tesoro: true, ...(tesoro === 'oro' ? { precio: conDescuento(p, B.tesoros.precio) } : {}) } });
  if (tipo === 'rey') {
    items.push({ t: 'oferta', oferta: { tipo: 'amuleto', opciones: sortearAmuletos(p, 'rey', 3) } });
    items.push({ t: 'oferta', oferta: ofertaAumento(p, p.acto === 0 ? 'oro' : 'prisma') });
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

/** Golpea con esas cartas. Si el combate termina, deja la partida en el botín o en el final. */
export const golpear = (p: Partida, ids: readonly string[], postas?: readonly number[]): Ev[] => cerrar(p, combate.golpear(p, ids, postas));
/** Usar un Chiche de la mesa (no gasta el turno). */
export const usarChiche = (p: Partida, i: number): Ev[] => combate.usarChiche(p, i);
export const descartar = (p: Partida, ids: readonly string[]): Ev[] => combate.descartar(p, ids);
export const armarEngano = combate.armarEngano;

// ───────────────────────── botín ─────────────────────────

/** Toma una pieza: sube el nivel de la Bendición, cuelga el Amuleto o aplica el Aumento con lo que trae al llegar. */
function tomar(p: Partida, oferta: Oferta, id: string, reemplaza?: AmuletoId): boolean {
  if (oferta.tipo === 'bendicion') {
    const b = id as BendicionId;
    const def = BENDICION[b];
    if (nivelBend(p, b) >= def.niveles) return false;
    // Poder de Reyes (Altar): el primer don de cada Rey llega con cargas
    if (!def.dual && Object.keys(p.bendiciones).length === 0) p.cargas[def.rey] += (p.altar.reyes ?? 0) * B.altar.reyes;
    p.bendiciones[b] = nivelBend(p, b) + 1;
    return true;
  }
  if (oferta.tipo === 'amuleto') {
    const a = id as AmuletoId;
    if (p.amuletos.includes(a)) return false;
    if (p.amuletos.length >= p.huecos) {
      if (!reemplaza || !p.amuletos.includes(reemplaza)) return false;
      p.amuletos.splice(p.amuletos.indexOf(reemplaza), 1);
    }
    p.amuletos.push(a);
    return true;
  }
  const u = id as AumentoId;
  if (p.aumentos.includes(u) || !AUMENTO[u]) return false;
  p.aumentos.push(u);
  const au = B.aumentos;
  if (u === 'cartamarcada') p.mazo.push({ id: 'M1', palo: 'S', n: 1, marcada: true });
  if (u === 'barajacargada')
    for (const c of p.mazo) {
      if (c.palo === 'X') continue;
      // los 2 y los 3 suben a 9, pero los 8 caen a 1 (el precio del Prismático)
      if (au.barajacargada.de.includes(c.n)) c.n = au.barajacargada.a;
      else if (au.barajacargada.contraDe.includes(c.n)) c.n = au.barajacargada.contraA;
    }
  if (u === 'pactogarca') {
    p.oro += au.pactogarca.oro;
    p.furiaRey += au.pactogarca.furia;
  }
  if (u === 'venderalma') {
    p.manoMax += au.venderalma.mano;
    pagarVidaMax(p, au.venderalma.vida);
  }
  if (u === 'irsealmazo') p.irseAlMazo = true;
  if (u === 'contraflor') {
    pagarVidaMax(p, p.vidaMax * (1 - au.contraflor.vida));
  }
  if (u === 'chamuyo') moverAfinidad(p, 0);
  return true;
}

/**
 * Resuelve un «ELEGÍ UNA» del botín: `id` es la opción elegida, o null para Saltar (que paga unas monedas).
 * Con los huecos de Amuleto llenos hay que decir cuál se reemplaza.
 */
export function elegirOferta(p: Partida, item: number, id: string | null, reemplaza?: AmuletoId): boolean {
  const it = p.botin?.items[item];
  if (p.fase !== 'botin' || !it || it.t !== 'oferta' || it.hecho) return false;
  const precio = it.oferta.precio ?? 0;
  if (id === null) {
    // saltar un Tesoro con candado no paga nada
    if (!precio) p.oro += B.botin.saltar;
  } else {
    if (!it.oferta.opciones.includes(id) || p.oro < precio) return false;
    if (!tomar(p, it.oferta, id, reemplaza)) return false;
    p.oro -= precio;
  }
  it.hecho = true;
  return true;
}

/** ¿Queda algo por elegir en el botín? */
export const botinPendiente = (p: Partida): boolean => !!p.botin?.items.some((i) => i.t === 'oferta' && !i.hecho);

/** Deja el botín (lo que no se eligió se pierde) y vuelve al Mapa; tras un Rey, empieza el tramo siguiente. */
export function seguir(p: Partida): void {
  if (p.fase !== 'botin' || !p.botin) return;
  if (p.botin.de === 'rey') {
    p.acto++;
    p.pos = null;
    p.camino = [];
  }
  delete p.botin;
  p.fase = 'mapa';
}

// ───────────────────────── Pulpería ─────────────────────────

export function comprar(p: Partida, i: number, reemplaza?: AmuletoId): boolean {
  const a = p.tienda?.amuletos[i];
  if (p.fase !== 'pulperia' || !a || a.vendido || p.oro < a.precio) return false;
  if (!tomar(p, { tipo: 'amuleto', opciones: [a.id] }, a.id, reemplaza)) return false;
  p.oro -= a.precio;
  a.vendido = true;
  return true;
}

/** Comprar un Chiche de La Pulpería: va al primer hueco libre de la mesa. */
export function comprarChiche(p: Partida, i: number): boolean {
  const k = p.tienda?.chiches?.[i];
  if (p.fase !== 'pulperia' || !k || k.vendido || p.oro < k.precio) return false;
  if (!combate.darChiche(p, k.id)) return false;
  p.oro -= k.precio;
  k.vendido = true;
  return true;
}

/** ¿Se puede sacar esa carta del Mazo? (nunca baja del mínimo). */
export const purgable = (p: Partida, cartaId: string): boolean => p.mazo.length > B.jugador.mazoMin && p.mazo.some((c) => c.id === cartaId);

function sacar(p: Partida, cartaId: string): boolean {
  if (!purgable(p, cartaId)) return false;
  p.mazo = p.mazo.filter((c) => c.id !== cartaId);
  return true;
}

export function purgar(p: Partida, cartaId: string): boolean {
  const t = p.tienda;
  if (p.fase !== 'pulperia' || !t || p.oro < t.purgar || !sacar(p, cartaId)) return false;
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

// ───────────────────────── Fogón ─────────────────────────

/** Descansar junto al Fogón: curás una parte de tu Vida. */
export function descansar(p: Partida): boolean {
  if (p.fase !== 'fogon' || p.fogonHecho) return false;
  curar(p, p.vidaMax * B.fogon.curaPct);
  p.fogonHecho = true;
  return true;
}
/** ¿Se puede arrimar otra vez al fuego el naipe que ya está templándose? (Quedan pasadas y el Mazo aguanta perderlo.) */
export const puedeArrimar = (p: Partida): boolean => p.fase === 'fogon' && !!p.fogonCarta && (p.fogonPasadas ?? 0) < B.fogon.pasadas && p.mazo.length > B.jugador.mazoMin;

/**
 * Templar un naipe en el Fogón: queda al rojo y hace Daño de más para siempre. La primera pasada es segura; cada
 * pasada más suma otro tanto, pero puede quemarlo: entonces sale del Mazo para siempre.
 */
export function templar(p: Partida, cartaId: string): 'templada' | 'quemada' | null {
  if (p.fase !== 'fogon') return null;
  const pasadas = p.fogonPasadas ?? 0;
  if (pasadas === 0 ? p.fogonHecho : p.fogonCarta !== cartaId || !puedeArrimar(p)) return null;
  const carta = p.mazo.find((k) => k.id === cartaId);
  if (!carta) return null;
  p.fogonHecho = true;
  if (azar(p) < (B.fogon.riesgos[pasadas] ?? 1) && pasadas > 0) {
    p.mazo.splice(p.mazo.indexOf(carta), 1);
    p.fogonCarta = null;
    p.fogonPasadas = B.fogon.pasadas;
    return 'quemada';
  }
  // primera pasada: +Daño; segunda: otro tanto y queda Templada (+Multi al jugarla); tercera: Forja Brava (su número vale doble)
  if (pasadas < 2) carta.temple = (carta.temple ?? 0) + B.fogon.temple;
  if (pasadas === 1) carta.templada = true;
  if (pasadas === 2) {
    // ¡FORJA BRAVA!: el número vale doble y el naipe sale del fuego con una mutación
    carta.brava = true;
    carta.mutacion = MUTACIONES[Math.floor(azar(p) * MUTACIONES.length)];
  }
  p.fogonCarta = cartaId;
  p.fogonPasadas = pasadas + 1;
  return 'templada';
}

// ───────────────────────── Cábala del Bufón ─────────────────────────

/** Responde la Cábala. Las opciones que piden naipes (la Cábala Negra) los reciben en ids, en orden. */
export function responderCabala(p: Partida, opcionId: string, ids?: readonly string[]): boolean {
  const estado = p.cabala;
  if (p.fase !== 'cabala' || !estado || estado.resultado) return false;
  const def = CABALA[estado.id];
  const op = def?.opciones.find((o) => o.id === opcionId);
  if (!def || !op || (op.puede && !op.puede(p))) return false;
  if (op.cartas && (!ids || !op.validas?.(p, ids))) return false;
  const r = resolverCabala(p, def, op, ids);
  estado.resultado = { ...r.texto, bueno: r.bueno };
  if (r.oferta === 'bendicion') p.botin = { de: 'cabala', items: [{ t: 'oferta', oferta: ofertaBendicion(p) }] };
  if (r.oferta === 'aumento') p.botin = { de: 'cabala', items: [{ t: 'oferta', oferta: ofertaAumento(p, p.acto === 0 ? 'plata' : 'oro') }] };
  return true;
}

/** Sale de la Pulpería, del Fogón o de la Cábala y vuelve al Mapa (o al «ELEGÍ UNA» que dejó la Cábala). */
export function salir(p: Partida): void {
  if (p.fase !== 'pulperia' && p.fase !== 'fogon' && p.fase !== 'cabala') return;
  if (p.fase === 'cabala' && !p.cabala?.resultado) return;
  delete p.tienda;
  delete p.cabala;
  p.fase = p.botin ? 'botin' : 'mapa';
}

/** Abandona la partida: cuenta como derrota. */
export function rendirse(p: Partida): void {
  if (p.fase !== 'fin') terminar(p, false);
}

export { REY };
