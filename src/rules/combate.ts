// El combate: un enemigo a la vez, tu mano contra la Corte.
//
//     TOTAL = DAÑO × MULTI      (los dos, siempre enteros)
//
// `cuenta` hace la cuenta de un golpe sin tocar nada (la mesa la enseña mientras elegís o arrastrás cartas, y el bot
// la usa para decidir); `golpear` y `descartar` la aplican y devuelven la lista de sucesos para que la interfaz los
// anime. Todo es determinista: el azar sale del `rng` de la partida.
import { B } from './balance';
import { MAX_GOLPE, clasificar, esComodin, resolver, suma } from './cartas';
import type { Carta, Efectiva, Jugada, Palo, Rango } from './cartas';
import { activo, carga, curar, donesDe, nivelBend, sirveA, tieneAmuleto, tieneAumento, escudoTope, tramoJugador } from './estado';
import type { Combate, Enemigo, Partida, TipoCombate } from './estado';
import type { MazoId } from './mazos';
import { CHICHES, huecosChiche } from './chiches';
import type { ChicheId } from './chiches';
import { evoluciono } from './evoluciones';
import { nivelDe } from './reyes';
import { azar, barajar, dado } from './rng';

// ───────────────────────── sucesos ─────────────────────────

export type Ev =
  | { t: 'golpe'; ids: string[]; jugada: Jugada; dano: number; multi: number; total: number; palos: Palo[]; critico: boolean; engano: boolean }
  | { t: 'canto'; mazo: MazoId }
  | { t: 'dano'; n: number; aEscudo: number; vida: number; escudo: number }
  | { t: 'cae'; palo: Palo; rango: Rango; exacto: boolean; ejecutado: boolean; jefe: boolean }
  | { t: 'entra'; palo: Palo; rango: Rango; jefe: boolean }
  | { t: 'perfora'; n: number }
  | { t: 'exacto' }
  | { t: 'escudo'; n: number }
  | { t: 'cura'; n: number }
  | { t: 'oro'; n: number }
  | { t: 'carga'; rey: Palo; n: number }
  | { t: 'aturde'; turnos: number }
  | { t: 'contra'; n: number; frenado: number; vida: number; de: Palo; rango: Rango }
  | { t: 'sincontra'; por: 'aturdido' | 'caradepoker' }
  | { t: 'contragolpe'; n: number }
  | { t: 'furia'; n: number; por: 'mazo' | 'rey' | 'engano' | 'diezmo' | 'brindis' | 'deguello' }
  | { t: 'segunda'; palo: Palo }
  | { t: 'alpelo' }
  | { t: 'rey'; que: 'cura' | 'escudo' | 'diezmo' | 'deguello'; n: number }
  | { t: 'roba'; ids: string[] }
  | { t: 'descarta'; ids: string[] }
  | { t: 'baraja' }
  | { t: 'sena'; id: string }
  | { t: 'dado'; n: number }
  | { t: 'chiche'; id: ChicheId }
  | { t: 'prenda'; id: ChicheId }
  | { t: 'salva' }
  | { t: 'mutacion'; que: 'doblefilo' | 'roba' | 'oro'; n: number }
  /** Una pieza cobra su precio en Vida (el Cetro del Bufón al empezar cada combate). */
  | { t: 'cobra'; de: 'cetro'; n: number }
  | { t: 'victoria' }
  | { t: 'derrota' };

// ───────────────────────── la cuenta ─────────────────────────

/** Una línea de la cuenta: de dónde sale, si suma Daño (d), suma Multi (m) o multiplica (x), y cuánto. */
export interface Paso {
  de: string;
  tipo: 'd' | 'm' | 'x';
  v: number;
}

export type Motivo = 'vacio' | 'muchas' | 'comodines' | 'nojugada';

export interface Cuenta {
  ok: boolean;
  motivo?: Motivo;
  jugada: Jugada;
  ef: Efectiva[];
  dano: number;
  multi: number;
  total: number;
  pasos: Paso[];
  /** El canto del Mazo se cumple (¡ESCOBA!, ¡ENVIDO!, ¡CHINCHÓN!, ¡MENTIRA!, ¡CHANCHO!). */
  canto: boolean;
  critico: boolean;
  perfora: boolean;
  /** Lo que dan los palos: Escudo (Bastos), cura (Copas) y oro (Oros). */
  escudo: number;
  cura: number;
  oro: number;
  /** Contra el enemigo activo. */
  aEscudo: number;
  aVida: number;
  abate: boolean;
  exacto: boolean;
  /** Te pasaste por muy poco: no cobra, pero sostiene la racha y recarga el Cetro. */
  alPelo?: boolean;
  ejecuta: boolean;
  sobra: number;
  aturde: number;
  /** Lo que te va a costar el Contraataque (null si no lo hay: lo abatís, está Aturdido o no llega). */
  contra: number | null;
  /** Un Rey en su primera cara se planta en la mitad: este golpe la cruza y el sobrante se pierde (0.20.0). */
  frenaEnMitad?: boolean;
  /** En qué Posta del paño quedó cada carta elegida (mismo orden que la selección) y si armó Escalón (0.21.0). */
  postas?: number[];
  escalon?: boolean;
  /** Lo que roban las cartas con Roba Carta y la Vida que corta el Doble Filo (0.22.0). */
  roba?: number;
  corta?: number;
}

const NULA: Cuenta = {
  ok: false, jugada: 'sola', ef: [], dano: 0, multi: 0, total: 0, pasos: [], canto: false, critico: false, perfora: false,
  escudo: 0, cura: 0, oro: 0, aEscudo: 0, aVida: 0, abate: false, exacto: false, ejecuta: false, sobra: 0, aturde: 0, contra: null,
};

/** ¿Llevás algo que tire el dado cada turno? */
export const usaDado = (p: Partida): boolean => tieneAmuleto(p, 'taba') || nivelBend(p, 'tabacargada') > 0;
/** Cuánto vale un canto con el Cascabel del Bufón. */
const doble = (p: Partida): number => (tieneAmuleto(p, 'cascabel') ? B.amuletos.cascabel : 1);

/** ¿El golpe cumple el canto del Mazo? */
function hayCanto(p: Partida, ef: readonly Efectiva[], jugada: Jugada, engano: boolean): boolean {
  switch (p.mazoId) {
    case 'escoba':
      return suma(ef) === 15;
    case 'truco':
      return ef.length === 2 && ef[0].palo === ef[1].palo;
    case 'chinchon':
      return jugada === 'pierna' || jugada === 'escalerapalo';
    case 'mentiroso':
      return engano;
    case 'chancho':
      return jugada === 'poker';
  }
}

/** El Contraataque del enemigo activo tal como te llegaría ahora: daño total y la parte que atraviesa el Escudo. */
export function contraataque(p: Partida, e: Enemigo, o: { mitiga?: boolean; sinVida?: boolean; repite?: boolean } = {}): { n: number; directo: number } {
  const c = p.combate!;
  let n = e.ataque + c.furia;
  // el Naipe de dos caras tiene su precio: la Corte te pega más fuerte
  if (tieneAmuleto(p, 'doscaras')) n = Math.ceil(n * (1 + B.amuletos.doscarasContra));
  if (e.jefe && e.palo === 'C' && o.sinVida) n = Math.ceil(n * B.reyes.C.contragolpe);
  // la segunda cara del Caudillo: repetir la jugada del golpe anterior es servirle el cuello
  const deguello = !!o.repite && deguelloArmado(e);
  if (deguello) n *= B.reyes.S.deguello;
  if (o.mitiga) n = Math.ceil(n * B.mazos.chinchon.mitiga);
  const directo = deguello ? n : e.jefe && e.palo === 'S' ? Math.floor(n * B.reyes.S.perfora) : 0;
  return { n, directo };
}

/** El Caudillo en su segunda cara castiga repetir la jugada del golpe anterior. */
const deguelloArmado = (e: Enemigo): boolean => !!(e.jefe && e.palo === 'S' && e.segunda);

/** Repetir jugada para el Tajo de revés: la Carta sola no cuenta (con mano de 3 a veces es la única que hay). */
export const repiteJugada = (antes: string | undefined, ahora: Jugada): boolean => antes === ahora && ahora !== 'sola';

// ───────────────────────── las Postas del paño (0.21.0) ─────────────────────────

/** Cuántas Postas tiene el paño: tantas como cartas entran en un golpe (3 con mano de 3, hasta 5). */
export const postasDe = (p: Partida): number => Math.min(MAX_GOLPE, Math.max(3, p.manoMax));
/** La Posta del Medio: la del centro del paño. */
export const medioDe = (n: number): number => Math.floor(n / 2);
/** Dónde cae cada carta elegida si no la movés: la primera al Medio y las demás a los costados (izquierda, derecha…). */
export function postasPorDefecto(n: number, k: number): number[] {
  const m = medioDe(n);
  const orden = [m];
  for (let d = 1; orden.length < n; d++) {
    if (m - d >= 0) orden.push(m - d);
    if (m + d < n) orden.push(m + d);
  }
  return orden.slice(0, k);
}
/** Postas válidas para k cartas: distintas y dentro del paño; si no, las de por defecto. */
export function postasValidas(p: Partida, k: number, postas?: readonly number[]): number[] {
  const n = postasDe(p);
  if (!postas || postas.length !== k || new Set(postas).size !== k || postas.some((x) => !Number.isInteger(x) || x < 0 || x >= n)) return postasPorDefecto(n, k);
  return [...postas];
}

/**
 * La cuenta de un golpe con esas cartas de la mano contra el enemigo activo. No cambia nada. `postas` dice en qué
 * Posta del paño va cada carta (mismo orden que `sel`); sin `postas`, la primera elegida va al Medio.
 */
export function cuenta(p: Partida, sel: readonly Carta[], postas?: readonly number[]): Cuenta {
  const c = p.combate;
  const e = c?.fila[0];
  if (!c || !e) return { ...NULA, motivo: 'vacio' };
  if (!sel.length) return { ...NULA, motivo: 'vacio' };
  if (sel.length > MAX_GOLPE) return { ...NULA, motivo: 'muchas' };
  const engano = c.engano && c.enganos > 0;
  const sinInmune = engano || tieneAmuleto(p, 'doscaras') || !!c.fosforo;
  const ef = resolver(sel, sinInmune ? undefined : e.palo, engano);
  if (!ef) return { ...NULA, motivo: 'comodines' };
  const jugada = clasificar(ef, p.mazoId);
  if (!jugada) return { ...NULA, ef, motivo: 'nojugada' };

  const pasos: Paso[] = [];
  let dano = 0;
  let multi = 0;
  let por = 1;
  const d = (de: string, v: number) => {
    if (v) {
      dano += v;
      pasos.push({ de, tipo: 'd', v });
    }
  };
  const m = (de: string, v: number) => {
    if (v) {
      multi += v;
      pasos.push({ de, tipo: 'm', v });
    }
  };
  const x = (de: string, v: number) => {
    if (v > 1) {
      por *= v;
      pasos.push({ de, tipo: 'x', v });
    }
  };
  const inmune = (palo: Palo) => !sinInmune && palo === e.palo;
  const cuantas = (palo: Palo) => ef.filter((k) => k.palo === palo).length;
  const vivas = (palo: Palo) => (inmune(palo) ? 0 : cuantas(palo));

  // ── Daño: la jugada, las cartas y lo que suman Mazo, Amuletos y Bendiciones
  const base = B.jugadas[jugada];
  d(`j:${jugada}`, base.d);
  m(`j:${jugada}`, base.m);
  for (const k of ef) d(`c:${k.de.id}`, inmune(k.palo) ? 0 : k.n);
  // las Postas del paño: el Medio pesa doble, el naipe a la derecha de un Comodín recibe su Chispa, y en orden
  // creciente de izquierda a derecha arman Escalón
  const enPosta = postasValidas(p, sel.length, postas);
  const posta = new Map(sel.map((k, i) => [k.id, enPosta[i]]));
  const porPosta = [...ef].sort((a, b) => (posta.get(a.de.id) ?? 0) - (posta.get(b.de.id) ?? 0));
  const PO = B.postas;
  const medio = ef.find((k) => posta.get(k.de.id) === medioDe(postasDe(p)));
  if (medio && !inmune(medio.palo)) d('posta:medio', medio.n * (PO.medio - 1));
  for (const k of porPosta) {
    if (!esComodin(k.de)) continue;
    const der = porPosta.find((o) => posta.get(o.de.id) === (posta.get(k.de.id) ?? -9) + 1);
    if (der && !esComodin(der.de) && !inmune(der.palo)) d('posta:chispa', der.n * (PO.chispa - 1));
  }
  const escalon = porPosta.length >= 3 && porPosta.every((k, i) => i === 0 || k.n > porPosta[i - 1].n);
  // Naipe de dos caras: nada es Inmune y, además, las cartas del palo del enemigo pegan doble
  if (tieneAmuleto(p, 'doscaras')) d('a:doscaras', ef.reduce((t, k) => t + (k.palo === e.palo ? k.n * (B.amuletos.doscarasDoble - 1) : 0), 0));
  // Forja Brava: el número del naipe vale doble
  d('brava-forja', ef.reduce((t, k) => t + (!inmune(k.palo) && k.de.brava ? k.n : 0), 0));
  // los naipes templados en el Fogón pegan de más
  d('temple', ef.reduce((s, k) => s + (inmune(k.palo) ? 0 : (k.de.temple ?? 0)), 0));
  // las manos cortas (Escoba, Truco, Chancho Va) pegan con Multi de más
  m('mano', (B.mazos[p.mazoId] as { multiMano?: number }).multiMano ?? 0);

  const canto = hayCanto(p, ef, jugada, engano);
  const dob = doble(p);
  if (p.mazoId === 'truco') {
    const bravas = B.mazos.truco.bravas as Record<string, number>;
    for (const k of ef) if (!k.copia && !inmune(k.palo)) d('brava', bravas[`${k.palo}${k.n}`] ?? 0);
    if (canto) {
      d('canto', B.mazos.truco.envido * dob);
      d('cantos', p.cantos * B.mazos.truco.cargaDano);
    }
  }
  if (p.mazoId === 'escoba') d('cantos', p.cantos * B.mazos.escoba.cargaDano);
  if (p.mazoId === 'chinchon' && canto) d('cantos', p.cantos * B.mazos.chinchon.cargaDano);

  // los cuatro Comunes: Daño por carta de su palo que crece con el tramo (×1, ×2, ×3), y cada uno con su segunda mitad
  const porCarta = B.amuletos.danoPorCarta * tramoJugador(p);
  const amC = B.amuletos.comunes;
  if (tieneAmuleto(p, 'cuchillo')) d('a:cuchillo', vivas('S') * porCarta * (e.vida * 2 <= e.vidaMax ? amC.cuchilloRemata : 1));
  if (tieneAmuleto(p, 'rebenque')) d('a:rebenque', vivas('C') * porCarta);
  if (tieneAmuleto(p, 'moneda')) d('a:moneda', vivas('D') * porCarta);
  if (tieneAmuleto(p, 'mate')) d('a:mate', vivas('H') * porCarta);

  d('r:S', carga(p, 'S') * B.cargas.filoDano);
  const bn = B.bendiciones;
  let lv = nivelBend(p, 'primerasangre');
  if (lv && e.golpes === 0) d('b:primerasangre', nivelDe(bn.primerasangre, lv));
  lv = nivelBend(p, 'paloypalo');
  if (lv) d('b:paloypalo', Math.floor(c.escudo / 2) * nivelDe(bn.paloypalo, lv));
  lv = nivelBend(p, 'tabacargada');
  if (lv) d('b:tabacargada', c.dado * nivelDe(bn.tabacargada, lv));
  if (nivelBend(p, 'filodorado')) d('b:filodorado', Math.min(bn.filodorado.tope, Math.floor(p.oro / bn.filodorado.cada)));

  // ── los poderes de palo (también los da una carta que no hace Daño por Inmune)
  const escudo = cuantas('C') * (B.palos.escudoPorBasto * tramoJugador(p) + (nivelBend(p, 'empalizada') ? nivelDe(bn.empalizada, nivelBend(p, 'empalizada')) : 0) + (tieneAmuleto(p, 'rebenque') ? amC.rebenqueEscudo * tramoJugador(p) : 0));
  const cura = cuantas('H') * (B.palos.curaPorCopa * tramoJugador(p) + (nivelBend(p, 'otraronda') ? nivelDe(bn.otraronda, nivelBend(p, 'otraronda')) : 0) + (tieneAmuleto(p, 'mate') ? amC.mateCura * tramoJugador(p) : 0));
  const vivasMut = (mu: string) => ef.filter((k) => !k.copia && k.de.mutacion === mu).length;
  const oro = cuantas('D') * B.palos.oroPorOro + vivasMut('oro') * B.fogon.chispaOro;
  const perfora = cuantas('S') > 0 || tieneAmuleto(p, 'lanza');
  // el Garrote del Cacique: tu Escudo se suma al Daño
  if (evoluciono(p, 'poncho')) d('ev:poncho', Math.floor(c.escudo * B.evoluciones.garrote));

  // ── Multi: primero lo que suma…
  if (escalon) m('posta:escalon', B.postas.escalon);
  m('combate', c.multiCombate);
  m('prox', c.proxMulti);
  m('a:cascabel', c.cascabel ?? 0);
  // la Moneda falsa: un golpe cargado de Oros suma Multi
  if (tieneAmuleto(p, 'moneda') && cuantas('D') >= amC.monedaDesde) m('a:moneda', amC.monedaMulti);
  // los naipes Templados (segunda pasada por el Fogón) suman Multi al jugarlos
  m('templada', ef.filter((k) => !inmune(k.palo) && k.de.templada).length * B.fogon.multiTemplada);
  m('mut:doblefilo', vivasMut('doblefilo') * B.fogon.dobleFilo.multi);
  const au = B.aumentos;
  if (tieneAumento(p, 'sermano') && c.golpes === 0) m('u:sermano', au.sermano);
  if (tieneAumento(p, 'retruco') && e.golpes > 0) m('u:retruco', au.retruco);

  const am = B.amuletos;
  if (tieneAmuleto(p, 'poncho') && c.escudo >= am.poncho.escudo) m(evoluciono(p, 'poncho') ? 'ev:poncho' : 'a:poncho', am.poncho.multi);
  if (tieneAmuleto(p, 'taba') && c.dado >= am.taba.desde) m('a:taba', am.taba.multi);
  const sol = evoluciono(p, 'cofre');
  if (tieneAmuleto(p, 'cofre')) m(sol ? 'ev:cofre' : 'a:cofre', Math.min(sol ? B.evoluciones.sol.tope : am.cofre.tope, Math.floor(p.oro / am.cofre.cada)));
  const brindis = evoluciono(p, 'caliz');
  if (tieneAmuleto(p, 'caliz') && (brindis || p.vida >= p.vidaMax * am.caliz.vida)) m(brindis ? 'ev:caliz' : 'a:caliz', am.caliz.multi);
  // el Brindis de Sangre: con la Vida alta, otro tanto de Multi
  if (brindis && p.vida >= p.vidaMax * am.caliz.vida) m('ev:caliz', B.evoluciones.brindis);
  // el Cascabel cobra su precio: un golpe sin canto va con Multi de menos
  if (tieneAmuleto(p, 'cascabel') && !canto) m('a:cascabel-sin', -B.amuletos.cascabelSinCanto);
  lv = nivelBend(p, 'pesofuerte');
  if (lv) m('b:pesofuerte', Math.min(bn.pesofuerte.tope, Math.floor(p.oro / nivelDe(bn.pesofuerte.cada, lv))));
  lv = nivelBend(p, 'sangreporsangre');
  if (lv && p.vida * 2 <= p.vidaMax) m('b:sangreporsangre', nivelDe(bn.sangreporsangre, lv));
  lv = nivelBend(p, 'coparebosante');
  if (lv) m('b:coparebosante', Math.floor(Math.max(0, p.vida + cura - p.vidaMax) / nivelDe(bn.coparebosante, lv)));

  // …y al final lo que multiplica
  if (canto && p.mazoId === 'escoba') x('canto', B.mazos.escoba.multi * dob);
  if (canto && p.mazoId === 'chancho') x('canto', B.mazos.chancho.multi * dob);
  lv = nivelBend(p, 'puntahacha');
  const critico = lv > 0 && (c.golpes + 1) % nivelDe(bn.puntahacha, lv) === 0;
  if (critico) x('b:puntahacha', 2);
  if (tieneAmuleto(p, 'cetro') && (c.golpes === 0 || c.cetro)) x('a:cetro', am.cetro);
  if (tieneAumento(p, 'valecuatro') && ef.length >= Math.min(MAX_GOLPE, c.mano.length)) x('u:valecuatro', au.valecuatro.multi);

  if (tieneAumento(p, 'faltaenvido') && p.vida <= p.vidaMax * au.faltaenvido.vida) x('u:faltaenvido', au.faltaenvido.multi);
  if (tieneAumento(p, 'contraflor')) x('u:contraflor', au.contraflor.multi);

  const multiFinal = Math.max(1, multi) * por;
  // Falta Envido tiene su precio: las Copas te curan la mitad
  const curaFinal = tieneAumento(p, 'faltaenvido') ? Math.floor(cura * au.faltaenvido.cura) : cura;
  const total = dano * multiFinal;

  // ── contra el enemigo activo
  const aEscudo = perfora ? 0 : Math.min(e.escudo, total);
  // un Rey en su primera cara se planta en la mitad (0.20.0): el golpe que la cruza lo deja justo a media Vida y el
  // sobrante se pierde, así cada Rey muestra sus dos caras
  const mitad = e.jefe && !e.segunda && e.vida * 2 > e.vidaMax ? e.vida - Math.floor(e.vidaMax / 2) : Infinity;
  const frenaEnMitad = total - aEscudo > mitad;
  const aVida = Math.min(total - aEscudo, mitad);
  const abate = aVida >= e.vida;
  const exacto = aVida === e.vida;
  // «al pelo»: te pasaste por muy poco. No cobra oro, pero sostiene la racha y recarga el Cetro
  const alPelo = abate && !exacto && aVida - e.vida <= Math.max(1, Math.floor(e.vidaMax * B.exacto.alPelo));
  lv = nivelBend(p, 'deguello');
  const ejecuta = !abate && !frenaEnMitad && lv > 0 && e.vida - aVida <= Math.floor(e.vidaMax * nivelDe(bn.deguello, lv));
  const sobra = abate && perfora ? (aVida - e.vida) * (evoluciono(p, 'lanza') ? B.evoluciones.facon.sobra : tieneAmuleto(p, 'lanza') ? am.lanza : 1) : 0;
  let aturde = 0;
  if (canto && p.mazoId === 'chancho') aturde = B.mazos.chancho.aturde * dob;
  if (!aturde && tieneAmuleto(p, 'boleadoras') && !e.boleado && cuantas('C') >= 2) aturde = 1;

  let contra: number | null = null;
  if (!abate && !ejecuta) {
    if (e.aturdido > 0 || aturde > 0 || c.caraDePoker) contra = 0;
    else {
      const k = contraataque(p, e, { mitiga: canto && p.mazoId === 'chinchon', sinVida: aVida === 0, repite: repiteJugada(c.ultimaJugada, jugada) });
      const tuEscudo = Math.min(escudoTope(p), c.escudo + escudo);
      contra = k.n - Math.min(tuEscudo, k.n - k.directo);
    }
  }

  const roba = vivasMut('roba') * B.fogon.robaCarta;
  const corta = vivasMut('doblefilo') * B.fogon.dobleFilo.vida;
  return { ok: true, jugada, ef, dano, multi: multiFinal, total, pasos, canto, critico, perfora, escudo, cura: curaFinal, oro, aEscudo, aVida, abate, exacto, alPelo, ejecuta, sobra, aturde, contra, frenaEnMitad, postas: enPosta, escalon, roba, corta };
}

// ───────────────────────── enemigos ─────────────────────────

/** Crea un enemigo de la Corte con los números del tramo, del Reinado y de lo que el jugador lleva encima. */
export function crearEnemigo(p: Partida, palo: Palo, rango: Rango, o: { elite?: boolean; jefe?: boolean } = {}): Enemigo {
  const en = B.enemigos;
  const acto = en.actos[Math.min(p.acto, en.actos.length - 1)];
  const R = B.reinados;
  let vida = (en.vida as Record<string, number>)[rango] * acto.vida;
  if (o.elite) vida *= en.elite.vida;
  if (o.jefe) {
    vida *= en.jefe.vida * acto.jefe;
    vida *= 1 - Math.min(en.jefe.sangreTope, donesDe(p, palo) * en.jefe.sangreConocida);
    if (p.reinado >= 4) vida *= 1 + R.vidaReyes;
  } else if (p.reinado >= 2) vida *= 1 + R.vidaGuardias;
  vida = Math.max(5, Math.round(vida / 5) * 5);
  let ataque = (en.ataque as Record<string, number>)[rango] + acto.ataque + (o.elite ? en.elite.ataque : 0);
  if (p.reinado >= 7) ataque += R.ataque;
  let escudo = 0;
  if (rango === 11) escudo = Math.round(en.escudoCaballo * acto.escudo);
  if (o.jefe && palo === 'C') escudo = Math.round(B.reyes.C.escudo * acto.escudo);
  const e: Enemigo = { palo, rango, vida, vidaMax: vida, escudo, escudoMax: escudo, ataque, aturdido: 0, golpes: 0 };
  if (o.elite) e.elite = true;
  if (o.jefe) e.jefe = true;
  return e;
}

/** Roba `n` cartas; si el Mazo se agota, baraja el Descarte y la Furia sube. */
function robar(p: Partida, n: number, evs: Ev[]): void {
  const c = p.combate!;
  const ids: string[] = [];
  for (let i = 0; i < n; i++) {
    if (!c.mazo.length) {
      if (!c.descarte.length) break;
      c.mazo = barajar(p, c.descarte);
      c.descarte = [];
      evs.push({ t: 'baraja' });
      if (p.mazoId !== 'truco') {
        c.furia += B.furia.mazoAgotado;
        evs.push({ t: 'furia', n: B.furia.mazoAgotado, por: 'mazo' });
      }
    }
    const carta = c.mazo.pop()!;
    c.mano.push(carta);
    ids.push(carta.id);
  }
  if (ids.length) evs.push({ t: 'roba', ids });
}

/** Empieza un combate contra esa fila de enemigos. */
export function iniciarCombate(p: Partida, tipo: TipoCombate, fila: Enemigo[]): Ev[] {
  const evs: Ev[] = [];
  const j = B.jugador;
  const R = B.reinados;
  let escudo = carga(p, 'C');
  if (tieneAumento(p, 'mesaservida')) escudo += B.aumentos.mesaservida;
  // Cara de Piedra: el Mentiroso arranca cada combate con Escudo, que crece con el tramo
  if (p.mazoId === 'mentiroso') escudo += B.mazos.mentiroso.caraDePiedra; // plano: protege el arranque, no escala
  let furia = p.reinado >= 3 ? R.furiaInicial : 0;
  if (tipo === 'rey') {
    furia += p.furiaRey + (p.reinado >= 8 ? R.furiaReyes : 0);
    p.furiaRey = 0;
    if (p.reyHerido) {
      for (const e of fila) {
        if (!e.jefe) continue;
        e.vida = Math.max(5, Math.round((e.vida * (1 - p.reyHerido)) / 5) * 5);
      }
      p.reyHerido = 0;
    }
  }
  const c: Combate = {
    tipo,
    fila,
    total: fila.length,
    mazo: barajar(p, p.mazo.map((k) => ({ ...k }))),
    mano: [],
    descarte: [],
    escudo: Math.min(escudoTope(p), escudo),
    furia,
    turno: 1,
    descartes: Math.max(0, j.descartes + (tieneAumento(p, 'cortedemazo') ? B.aumentos.cortedemazo : 0) - (p.reinado >= 5 ? R.descartes : 0) - (tieneAumento(p, 'valecuatro') ? B.aumentos.valecuatro.descartes : 0)),
    pasar: p.mazoId === 'chancho',
    enganos: p.mazoId === 'mentiroso' ? B.mazos.mentiroso.enganos * doble(p) : 0,
    engano: false,
    multiCombate: 0,
    proxMulti: 0,
    golpes: 0,
    dado: 0,
    caraDePoker: tieneAumento(p, 'caradepoker'),
    sena: false,
    perdida: 0,
  };
  p.combate = c;
  p.fase = 'combate';
  // el Cetro del Bufón cobra su precio: cada combate empieza costándote Vida (nunca te mata)
  if (tieneAmuleto(p, 'cetro')) {
    const n = Math.min(B.amuletos.cetroVida * tramoJugador(p), Math.max(0, p.vida - 1));
    p.vida -= n;
    if (n) evs.push({ t: 'cobra', de: 'cetro', n });
  }
  if (tieneAmuleto(p, 'bota')) {
    const antes = p.vida;
    curar(p, B.amuletos.bota);
    if (p.vida > antes) evs.push({ t: 'cura', n: p.vida - antes });
  }
  evs.push({ t: 'entra', palo: fila[0].palo, rango: fila[0].rango, jefe: !!fila[0].jefe });
  robar(p, p.manoMax + (tieneAumento(p, 'dardeabajo') ? B.aumentos.dardeabajo : 0), evs);
  if (usaDado(p)) {
    c.dado = dado(p);
    evs.push({ t: 'dado', n: c.dado });
  }
  return evs;
}

// ───────────────────────── golpear ─────────────────────────

const enMano = (c: Combate, ids: readonly string[]): Carta[] | null => {
  const out: Carta[] = [];
  for (const id of ids) {
    const k = c.mano.find((x) => x.id === id);
    if (!k || out.includes(k)) return null;
    out.push(k);
  }
  return out;
};

/** Un enemigo cae: premios, cargas de los Reyes, y entra el siguiente (con lo que sobró si el golpe Perfora). */
function abatir(p: Partida, evs: Ev[], o: { exacto: boolean; alPelo?: boolean; ejecutado: boolean; palos: Palo[]; sobra: number; deUnSaque: boolean; canto?: boolean }): void {
  const c = p.combate!;
  const e = c.fila.shift()!;
  // la Prenda de la Corte: abatir con Golpe exacto, al pelo o cantando a veces le roba un Chiche al caído
  if ((o.exacto || o.alPelo || o.canto) && dado01(p) < B.chiches.prenda) {
    const id = darChiche(p, CHICHES[Math.floor(dado01(p) * CHICHES.length)]);
    if (id) evs.push({ t: 'prenda', id });
  }
  p.stats.abatidos++;
  evs.push({ t: 'cae', palo: e.palo, rango: e.rango, exacto: o.exacto, ejecutado: o.ejecutado, jefe: !!e.jefe });
  if (o.exacto) {
    p.stats.exactos++;
    p.oro += B.exacto.oro;
    // la racha: cada Golpe exacto seguido sube el premio (+1, +2, +3 de Multi al golpe siguiente)
    p.racha = Math.min(B.exacto.rachaTope, (p.racha ?? 0) + 1);
    c.proxMulti += B.exacto.multi * p.racha;
    if (tieneAmuleto(p, 'cetro')) c.cetro = true;
    evs.push({ t: 'exacto' }, { t: 'oro', n: B.exacto.oro });
    if (nivelBend(p, 'hojabroquel')) {
      const hb = B.bendiciones.hojabroquel;
      c.escudo = Math.min(escudoTope(p), c.escudo + hb.escudo);
      p.cargas.S += hb.filo;
      evs.push({ t: 'escudo', n: hb.escudo }, { t: 'carga', rey: 'S', n: hb.filo });
    }
  }
  if (o.alPelo) {
    // al pelo: sin premio, pero la racha sigue viva y el Cetro vuelve a cargarse
    if (tieneAmuleto(p, 'cetro')) c.cetro = true;
    p.stats.alPelo = (p.stats.alPelo ?? 0) + 1;
    evs.push({ t: 'alpelo' });
  } else if (!o.exacto) p.racha = 0;
  // la regla única de las cargas: cada enemigo abatido con el palo de un Rey en el golpe, +1 (si llevás dones suyos)
  for (const palo of o.palos) {
    if (!sirveA(p, palo)) continue;
    p.cargas[palo]++;
    evs.push({ t: 'carga', rey: palo, n: 1 });
  }
  if (tieneAmuleto(p, 'facon') && o.palos.includes('S')) c.proxMulti += 1;
  // las Evoluciones que cobran al abatir
  if (evoluciono(p, 'lanza')) c.multiCombate += B.evoluciones.facon.multi;
  if (evoluciono(p, 'cofre')) {
    p.oro += B.evoluciones.sol.oro;
    evs.push({ t: 'oro', n: B.evoluciones.sol.oro });
  }
  if (nivelBend(p, 'sangria')) {
    const antes = p.vida;
    curar(p, B.bendiciones.sangria);
    if (p.vida > antes) evs.push({ t: 'cura', n: p.vida - antes });
  }
  const sig = c.fila[0];
  if (!sig) return;
  evs.push({ t: 'entra', palo: sig.palo, rango: sig.rango, jefe: !!sig.jefe });
  if (p.mazoId === 'chancho' && o.deUnSaque) {
    sig.aturdido = Math.max(sig.aturdido, 1);
    evs.push({ t: 'aturde', turnos: sig.aturdido });
  }
  if (o.sobra > 0) {
    evs.push({ t: 'perfora', n: o.sobra });
    const resto = o.sobra - sig.vida;
    sig.vida = Math.max(0, sig.vida - o.sobra);
    evs.push({ t: 'dano', n: o.sobra, aEscudo: 0, vida: sig.vida, escudo: sig.escudo });
    if (sig.vida <= 0) abatir(p, evs, { exacto: false, ejecutado: false, palos: o.palos, sobra: Math.max(0, resto), deUnSaque: false });
  }
}

/** Cierra el combate ganado (el botín lo arma partida.ts). */
function victoria(p: Partida, evs: Ev[]): void {
  evs.push({ t: 'victoria' });
}

/** El Contraataque del enemigo activo, con todo lo que dispara. Devuelve false si la partida terminó. */
function contraatacar(p: Partida, evs: Ev[], o: { mitiga: boolean; sinVida: boolean; repite?: boolean }): boolean {
  const c = p.combate!;
  const e = c.fila[0];
  if (e.aturdido > 0) {
    e.aturdido--;
    evs.push({ t: 'sincontra', por: 'aturdido' });
    return true;
  }
  if (c.caraDePoker) {
    c.caraDePoker = false;
    evs.push({ t: 'sincontra', por: 'caradepoker' });
    return true;
  }
  const k = contraataque(p, e, o);
  if (o.repite && deguelloArmado(e)) evs.push({ t: 'rey', que: 'deguello', n: k.n });
  const frenado = Math.min(c.escudo, k.n - k.directo);
  c.escudo -= frenado;
  const llega = k.n - frenado;
  if (llega > 0) {
    p.vida -= llega;
    c.perdida += llega;
    p.stats.danoRecibido += llega;
  }
  evs.push({ t: 'contra', n: k.n, frenado, vida: Math.max(0, p.vida), de: e.palo, rango: e.rango });
  if (e.jefe && e.palo === 'D') {
    // la segunda cara del Caudal: el Remate se lleva una tajada de la bolsa entera
    const cobra = Math.min(p.oro, e.segunda ? Math.max(B.reyes.D.diezmo * 2, Math.ceil(p.oro * B.reyes.D.remate)) : B.reyes.D.diezmo);
    if (cobra > 0) {
      p.oro -= cobra;
      c.furia += cobra;
      evs.push({ t: 'rey', que: 'diezmo', n: cobra }, { t: 'furia', n: cobra, por: 'diezmo' });
    }
  }
  if (p.vida <= 0) {
    if (p.irseAlMazo) {
      p.irseAlMazo = false;
      p.vida = Math.max(1, Math.ceil(p.vidaMax * B.aumentos.irsealmazo));
      evs.push({ t: 'salva' });
    } else {
      p.vida = 0;
      evs.push({ t: 'derrota' });
      return false;
    }
  }
  // Peaje y Contragolpe disparan cuando tu Escudo frena al menos la mitad del Contraataque
  if (frenado > 0 && frenado * 2 >= k.n) {
    if (nivelBend(p, 'peaje')) {
      p.oro += B.bendiciones.peaje;
      evs.push({ t: 'oro', n: B.bendiciones.peaje });
    }
    const lv = nivelBend(p, 'contragolpe');
    if (lv) {
      // devuelve lo frenado, multiplicado: escala solo con lo que el enemigo pega
      const n = frenado * nivelDe(B.bendiciones.contragolpe, lv) + carga(p, 'C');
      const aEscudo = Math.min(e.escudo, n);
      e.escudo -= aEscudo;
      e.vida = Math.max(0, e.vida - (n - aEscudo));
      evs.push({ t: 'contragolpe', n }, { t: 'dano', n, aEscudo, vida: e.vida, escudo: e.escudo });
      if (e.vida <= 0) {
        abatir(p, evs, { exacto: false, ejecutado: false, palos: ['C'], sobra: 0, deUnSaque: false });
        if (!c.fila.length) victoria(p, evs);
      }
    }
  }
  return true;
}

/** Fin de turno: lo que hace el Rey cada turno, las cartas jugadas al Descarte, robar y el dado. */
function finTurno(p: Partida, evs: Ev[], jugadas: Carta[]): void {
  const c = p.combate!;
  const e = c.fila[0];
  if (e?.jefe) {
    let sube = B.furia.reyPorTurno;
    if (e.palo === 'S') sube += B.reyes.S.furiaTurno;
    c.furia += sube;
    evs.push({ t: 'furia', n: sube, por: 'rey' });
    const escala = B.enemigos.actos[Math.min(p.acto, B.enemigos.actos.length - 1)];
    if (e.palo === 'C' && e.escudo < e.escudoMax) {
      const n = Math.min(e.escudoMax - e.escudo, Math.round(B.reyes.C.regenera * escala.escudo * (e.segunda ? B.reyes.C.empalizadaRegenera : 1)));
      e.escudo += n;
      evs.push({ t: 'rey', que: 'escudo', n });
    }
    if (e.palo === 'H') {
      const n = Math.round(B.reyes.H.cura * escala.vida * (e.segunda ? B.reyes.H.ultimaRonda : 1));
      const cabe = Math.min(n, e.vidaMax - e.vida);
      e.vida += cabe;
      if (cabe > 0) evs.push({ t: 'rey', que: 'cura', n: cabe });
      const furia = Math.floor((n - cabe) / B.reyes.H.furiaCada);
      if (furia > 0) {
        c.furia += furia;
        evs.push({ t: 'furia', n: furia, por: 'brindis' });
      }
    }
  }
  for (const k of jugadas) {
    if (k.marcada) continue;
    const i = c.mano.indexOf(k);
    if (i >= 0) c.mano.splice(i, 1);
    c.descarte.push(k);
  }
  robar(p, Math.max(0, p.manoMax + c.mano.filter((k) => k.marcada).length - c.mano.length), evs);
  c.turno++;
  p.stats.turnos++;
  c.pasar = p.mazoId === 'chancho';
  if (usaDado(p)) {
    c.dado = dado(p);
    evs.push({ t: 'dado', n: c.dado });
  }
}

/** Golpea al enemigo activo con esas cartas de la mano. Devuelve los sucesos (vacío si la jugada no vale). */
export function golpear(p: Partida, ids: readonly string[], postas?: readonly number[]): Ev[] {
  const c = p.combate;
  if (!c || p.fase !== 'combate' || !c.fila.length) return [];
  const sel = enMano(c, ids);
  if (!sel) return [];
  const q = cuenta(p, sel, postas);
  if (!q.ok) return [];
  const e = c.fila[0];
  c.fosforo = false;
  const evs: Ev[] = [];
  const palos = [...new Set(q.ef.map((k) => k.palo))];
  const engano = c.engano && c.enganos > 0;
  evs.push({ t: 'golpe', ids: [...ids], jugada: q.jugada, dano: q.dano, multi: q.multi, total: q.total, palos, critico: q.critico, engano });
  p.stats.golpes++;
  p.stats.mejorGolpe = Math.max(p.stats.mejorGolpe, q.total);
  if (q.jugada === 'poker') p.stats.pokers++;
  if (engano) {
    c.enganos--;
    c.engano = false;
  }
  if (q.canto) {
    p.stats.cantos++;
    evs.push({ t: 'canto', mazo: p.mazoId });
    if (p.mazoId === 'escoba' || p.mazoId === 'truco') p.cantos++;
    if (p.mazoId === 'chinchon') p.cantos += doble(p);
    if (tieneAumento(p, 'manocaliente')) c.multiCombate = Math.min(B.aumentos.manocaliente.tope, c.multiCombate + B.aumentos.manocaliente.multi);
    if (tieneAmuleto(p, 'cascabel')) c.cascabel = (c.cascabel ?? 0) + B.amuletos.cascabelMulti;
  }
  c.proxMulti = 0;
  c.cetro = false;
  const jugadaAntes = c.ultimaJugada;
  c.ultimaJugada = q.jugada;

  // los poderes de palo
  if (q.escudo) {
    c.escudo = Math.min(escudoTope(p), c.escudo + q.escudo);
    evs.push({ t: 'escudo', n: q.escudo });
  }
  if (q.cura) {
    const antes = p.vida;
    curar(p, q.cura);
    if (p.vida > antes) evs.push({ t: 'cura', n: p.vida - antes });
    // la segunda cara del Bacanal: lo que vos te curás, él también
    if (e.jefe && e.palo === 'H' && e.segunda && p.vida > antes) {
      const n = Math.min(e.vidaMax - e.vida, (p.vida - antes) * B.reyes.H.ultimaRonda);
      if (n > 0) {
        e.vida += n;
        evs.push({ t: 'rey', que: 'cura', n });
      }
    }
  }
  if (q.oro) {
    p.oro += q.oro;
    evs.push({ t: 'oro', n: q.oro });
  }
  // el Doble Filo corta a los dos lados (nunca te mata: te deja en 1)
  if (q.corta) {
    const n = Math.min(q.corta, Math.max(0, p.vida - 1));
    p.vida -= n;
    evs.push({ t: 'mutacion', que: 'doblefilo', n });
  }
  // el daño
  const deUnSaque = e.golpes === 0;
  e.golpes++;
  c.golpes++;
  e.escudo -= q.aEscudo;
  e.vida = Math.max(0, e.vida - q.aVida);
  evs.push({ t: 'dano', n: q.total, aEscudo: q.aEscudo, vida: e.vida, escudo: e.escudo });
  const cae = q.abate || q.ejecuta;
  if (cae) {
    if (q.ejecuta) e.vida = 0;
    abatir(p, evs, { exacto: q.exacto, alPelo: q.alPelo, ejecutado: q.ejecuta, palos, sobra: q.sobra, deUnSaque: deUnSaque && q.abate, canto: q.canto });
  } else {
    // a media Vida, el Rey muestra su segunda cara
    if (e.jefe && !e.segunda && e.vida * 2 <= e.vidaMax) {
      e.segunda = true;
      evs.push({ t: 'segunda', palo: e.palo });
      // la Empalizada del Cacique: un Escudo a la medida de su Vida (las Espadas lo atraviesan)
      if (e.palo === 'C') {
        e.escudoMax = Math.max(e.escudoMax, Math.round(e.vidaMax * B.reyes.C.empalizada));
        const n = e.escudoMax - e.escudo;
        e.escudo = e.escudoMax;
        if (n > 0) evs.push({ t: 'rey', que: 'escudo', n });
      }
    }
    if (q.aturde) {
      e.aturdido = Math.max(e.aturdido, q.aturde);
      if (p.mazoId !== 'chancho' || !q.canto) e.boleado = true;
      evs.push({ t: 'aturde', turnos: e.aturdido });
    }
    if (engano) {
      c.furia += B.mazos.mentiroso.furiaFallo;
      evs.push({ t: 'furia', n: B.mazos.mentiroso.furiaFallo, por: 'engano' });
    }
  }
  if (!c.fila.length) {
    victoria(p, evs);
    return evs;
  }
  if (!cae) {
    const sigue = contraatacar(p, evs, { mitiga: q.canto && p.mazoId === 'chinchon', sinVida: q.aVida === 0, repite: repiteJugada(jugadaAntes, q.jugada) });
    if (!sigue || !c.fila.length) return evs;
  }
  finTurno(p, evs, sel);
  // Roba Carta: la mano siguiente trae cartas de más
  if (q.roba) {
    robar(p, q.roba, evs);
    evs.push({ t: 'mutacion', que: 'roba', n: q.roba });
  }
  return evs;
}

/** ¿Se puede descartar esa cantidad de cartas ahora? (el pase gratis de Chancho Va es de 1 sola carta). */
export function puedeDescartar(p: Partida, n: number): 'gratis' | 'descarte' | null {
  const c = p.combate;
  if (!c || n < 1) return null;
  if (n === 1 && c.pasar) return 'gratis';
  return c.descartes > 0 ? 'descarte' : null;
}

/** Descarta esas cartas y roba otras tantas. No gasta el turno. */
export function descartar(p: Partida, ids: readonly string[]): Ev[] {
  const c = p.combate;
  if (!c || p.fase !== 'combate') return [];
  const sel = enMano(c, ids);
  if (!sel || !sel.length) return [];
  const modo = puedeDescartar(p, sel.length);
  if (!modo) return [];
  if (modo === 'gratis') c.pasar = false;
  else c.descartes--;
  const evs: Ev[] = [{ t: 'descarta', ids: [...ids] }];
  for (const k of sel) {
    c.mano.splice(c.mano.indexOf(k), 1);
    c.descarte.push(k);
  }
  robar(p, sel.length, evs);
  if (tieneAumento(p, 'senafalsa') && !c.sena) {
    c.sena = true;
    const baja = c.mano.filter((k) => !esComodin(k) && k.n !== 7).sort((a, b) => a.n - b.n)[0];
    if (baja) {
      baja.n = 7;
      const enMazo = p.mazo.find((k) => k.id === baja.id);
      if (enMazo) enMazo.n = 7;
      evs.push({ t: 'sena', id: baja.id });
    }
  }
  return evs;
}

/** El Mentiroso: arma o desarma el Engaño para el próximo golpe. */
export function armarEngano(p: Partida, armado: boolean): boolean {
  const c = p.combate;
  if (!c || c.enganos <= 0) return false;
  c.engano = armado;
  return true;
}

/** El enemigo activo (atajo para la interfaz y las pruebas). */
export { activo };

// ───────────────────────── los Chiches (0.21.0) ─────────────────────────

const dado01 = (p: Partida): number => azar(p);

/** Apoya un Chiche en el primer hueco libre de la mesa; devuelve cuál entró (null si no había lugar). */
export function darChiche(p: Partida, id: ChicheId): ChicheId | null {
  const h = huecosChiche(p.chiches);
  const i = h.indexOf(null);
  if (i < 0) return null;
  h[i] = id;
  p.chiches = h;
  return id;
}

/** Usar el Chiche del hueco `i`: no gasta el turno. */
export function usarChiche(p: Partida, i: number): Ev[] {
  const c = p.combate;
  const h = huecosChiche(p.chiches);
  const id = h[i];
  if (!c || p.fase !== 'combate' || !c.fila.length || !id) return [];
  const evs: Ev[] = [{ t: 'chiche', id }];
  const ch = B.chiches;
  switch (id) {
    case 'ginebra': {
      const antes = p.vida;
      curar(p, ch.ginebra * tramoJugador(p));
      if (p.vida === antes) return [];
      evs.push({ t: 'cura', n: p.vida - antes });
      break;
    }
    case 'dado':
      c.proxMulti += ch.dado;
      break;
    case 'fosforo':
      if (c.fosforo) return [];
      c.fosforo = true;
      break;
    case 'tiza': {
      // nunca deja la mano sin un naipe de verdad (un golpe de puros Comodines no es jugada)
      const reales = [...c.mano].filter((k) => !esComodin(k)).sort((a, b) => a.n - b.n);
      const baja = reales.length >= 2 ? reales[0] : undefined;
      if (!baja) return [];
      baja.palo = 'X';
      baja.n = 0;
      break;
    }
    case 'poroto':
      if (!c.mazo.length && !c.descarte.length) return [];
      robar(p, ch.poroto, evs);
      break;
  }
  h[i] = null;
  p.chiches = h;
  return evs;
}