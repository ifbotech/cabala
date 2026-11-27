// El combate 2D horizontal de CÁBALA 2.0: un enemigo a la vez, tu mano contra Sotas, Caballos y Reyes.
//
//     TOTAL = DAÑO × MULTI      (los dos, siempre enteros)
//
import { B } from './balance';
import { MAX_GOLPE, clasificar, resolver, suma } from './cartas';
import type { Carta, Efectiva, Jugada, Palo, Rango } from './cartas';
import { activo, carga, curar, escudoTope, nivelBend, sirveA, tieneAmuleto, tramoJugador } from './estado';
import type { Combate, Enemigo, Partida, TipoCombate } from './estado';
import type { MazoId } from './mazos';
import { nivelDe } from './reyes';
import { barajar, dado } from './rng';

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
  | { t: 'sincontra'; por: 'aturdido' }
  | { t: 'contragolpe'; n: number }
  | { t: 'furia'; n: number; por: 'mazo' | 'rey' | 'engano' | 'diezmo' | 'brindis' | 'deguello' }
  | { t: 'segunda'; palo: Palo }
  | { t: 'alpelo' }
  | { t: 'rey'; que: 'cura' | 'escudo' | 'diezmo' | 'deguello'; n: number }
  | { t: 'roba'; ids: string[] }
  | { t: 'descarta'; ids: string[] }
  | { t: 'baraja' }
  | { t: 'dado'; n: number }
  | { t: 'cobra'; de: 'cetro'; n: number }
  | { t: 'victoria' }
  | { t: 'derrota' };

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
  canto: boolean;
  critico: boolean;
  perfora: boolean;
  escudo: number;
  cura: number;
  oro: number;
  aEscudo: number;
  aVida: number;
  abate: boolean;
  exacto: boolean;
  alPelo?: boolean;
  ejecuta: boolean;
  sobra: number;
  aturde: number;
  contra: number | null;
  frenaEnMitad?: boolean;
  cortaMano?: number;
}

const NULA: Cuenta = {
  ok: false, jugada: 'sola', ef: [], dano: 0, multi: 0, total: 0, pasos: [], canto: false, critico: false, perfora: false,
  escudo: 0, cura: 0, oro: 0, aEscudo: 0, aVida: 0, abate: false, exacto: false, ejecuta: false, sobra: 0, aturde: 0, contra: null,
};

export const maxGolpeDe = (p: Partida): number => Math.min(MAX_GOLPE, Math.max(3, p.manoMax));
export const usaDado = (p: Partida): boolean => tieneAmuleto(p, 'taba') || nivelBend(p, 'tabacargada') > 0;
const doble = (p: Partida): number => (tieneAmuleto(p, 'cascabel') ? B.amuletos.cascabel : 1);

function hayCanto(p: Partida, ef: readonly Efectiva[], jugada: Jugada, engano: boolean): boolean {
  switch (p.mazoId) {
    case 'escoba':
      return suma(ef) === 15;
    case 'truco':
      return ef.length === 2 && ef[0].palo === ef[1].palo && suma(ef) >= B.mazos.truco.envidoMin;
    case 'chinchon':
      return jugada === 'pierna' || jugada === 'escalerapalo';
    case 'mentiroso':
      return engano;
    case 'chancho':
      return jugada === 'poker' || jugada === 'pierna';
  }
}

export function contraataque(p: Partida, e: Enemigo, o: { sinVida?: boolean; repite?: boolean } = {}): { n: number; directo: number } {
  const c = p.combate!;
  let n = e.ataque + c.furia;
  if (tieneAmuleto(p, 'doscaras')) n = Math.ceil(n * (1 + B.amuletos.doscarasContra));
  if (e.jefe && e.palo === 'C' && o.sinVida) n = Math.ceil(n * B.reyes.C.contragolpe);
  const deguello = !!o.repite && deguelloArmado(e);
  if (deguello) n *= B.reyes.S.deguello;
  const directo = deguello ? n : e.jefe && e.palo === 'S' ? Math.floor(n * B.reyes.S.perfora) : 0;
  return { n, directo };
}

const deguelloArmado = (e: Enemigo): boolean => !!(e.jefe && e.palo === 'S' && e.segunda);
export const repiteJugada = (antes: string | undefined, ahora: Jugada): boolean => antes === ahora && ahora !== 'sola';

export function cuenta(p: Partida, sel: readonly Carta[]): Cuenta {
  const c = p.combate;
  const e = c?.fila[0];
  if (!c || !e || !sel.length) return { ...NULA, motivo: 'vacio' };
  if (sel.length > maxGolpeDe(p)) return { ...NULA, motivo: 'muchas' };

  const engano = c.engano && c.enganos > 0;
  const sinInmune = engano || tieneAmuleto(p, 'doscaras');
  const ef = resolver(sel, sinInmune ? undefined : e.palo, engano, p.mazoId);
  if (!ef) return { ...NULA, motivo: 'comodines' };
  const jugada = clasificar(ef, p.mazoId);
  if (!jugada) return { ...NULA, ef, motivo: 'nojugada' };

  const pasos: Paso[] = [];
  let dano = 0;
  let multi = 0;
  let por = 1;
  const d = (de: string, v: number) => {
    if (v) { dano += v; pasos.push({ de, tipo: 'd', v }); }
  };
  const m = (de: string, v: number) => {
    if (v) { multi += v; pasos.push({ de, tipo: 'm', v }); }
  };
  const x = (de: string, v: number) => {
    if (v > 1) { por *= v; pasos.push({ de, tipo: 'x', v }); }
  };
  const inmune = (palo: Palo) => !sinInmune && palo === e.palo;
  const cuantas = (palo: Palo) => ef.filter((k) => k.palo === palo).length;
  const vivas = (palo: Palo) => (inmune(palo) ? 0 : cuantas(palo));

  const base = B.jugadas[jugada];
  d(`j:${jugada}`, base.d);
  m(`j:${jugada}`, base.m);
  for (const k of ef) d(`c:${k.de.id}`, inmune(k.palo) ? 0 : k.n);

  if (tieneAmuleto(p, 'doscaras')) d('a:doscaras', ef.reduce((t, k) => t + (k.palo === e.palo ? k.n * (B.amuletos.doscarasDoble - 1) : 0), 0));
  m('mano', (B.mazos[p.mazoId] as { multiMano?: number }).multiMano ?? 0);

  const canto = hayCanto(p, ef, jugada, engano);
  const dob = doble(p);
  if (p.mazoId === 'truco') {
    const bravas = B.mazos.truco.bravas as Record<string, number>;
    for (const k of ef) if (!k.copia && !inmune(k.palo)) d('brava', bravas[`${k.palo}${k.n}`] ?? 0);
    if (canto) {
      d('canto', B.mazos.truco.envido * tramoJugador(p) * dob);
      d('cantos', p.cantos * B.mazos.truco.cargaDano);
    }
  }
  if (p.mazoId === 'escoba') d('cantos', p.cantos * B.mazos.escoba.cargaDano);
  if (p.mazoId === 'chinchon' && canto) d('cantos', p.cantos * B.mazos.chinchon.cargaDano);

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

  let escudo = cuantas('C') * (B.palos.escudoPorBasto * tramoJugador(p) + (nivelBend(p, 'empalizada') ? nivelDe(bn.empalizada, nivelBend(p, 'empalizada')) : 0) + (tieneAmuleto(p, 'rebenque') ? amC.rebenqueEscudo * tramoJugador(p) : 0));
  const cura = cuantas('H') * (B.palos.curaPorCopa * tramoJugador(p) + (nivelBend(p, 'otraronda') ? nivelDe(bn.otraronda, nivelBend(p, 'otraronda')) : 0) + (tieneAmuleto(p, 'mate') ? amC.mateCura * tramoJugador(p) : 0));
  const cortaMano = canto && p.mazoId === 'chinchon' ? Math.max(0, c.mano.length - sel.length) * B.mazos.chinchon.corta * tramoJugador(p) : 0;
  escudo += cortaMano;
  const oro = cuantas('D') * B.palos.oroPorOro;
  const perfora = cuantas('S') > 0 || tieneAmuleto(p, 'lanza');

  m('prox', c.proxMulti);
  m('a:cascabel', c.cascabel ?? 0);
  if (tieneAmuleto(p, 'moneda') && cuantas('D') >= amC.monedaDesde) m('a:moneda', amC.monedaMulti);

  const am = B.amuletos;
  if (tieneAmuleto(p, 'poncho') && c.escudo >= am.poncho.escudo) m('a:poncho', am.poncho.multi);
  if (tieneAmuleto(p, 'taba') && c.dado >= am.taba.desde) m('a:taba', am.taba.multi);
  if (tieneAmuleto(p, 'cofre')) m('a:cofre', Math.min(am.cofre.tope, Math.floor(p.oro / am.cofre.cada)));
  if (tieneAmuleto(p, 'caliz') && p.vida >= p.vidaMax * am.caliz.vida) m('a:caliz', am.caliz.multi);
  if (tieneAmuleto(p, 'cascabel') && !canto) m('a:cascabel-sin', -B.amuletos.cascabelSinCanto);

  lv = nivelBend(p, 'pesofuerte');
  if (lv) m('b:pesofuerte', Math.min(bn.pesofuerte.tope, Math.floor(p.oro / nivelDe(bn.pesofuerte.cada, lv))));
  lv = nivelBend(p, 'sangreporsangre');
  if (lv && p.vida * 2 <= p.vidaMax) m('b:sangreporsangre', nivelDe(bn.sangreporsangre, lv));
  lv = nivelBend(p, 'coparebosante');
  if (lv) m('b:coparebosante', Math.floor(Math.max(0, p.vida + cura - p.vidaMax) / nivelDe(bn.coparebosante, lv)));

  if (canto && p.mazoId === 'escoba') x('canto', B.mazos.escoba.multi * dob);
  if (canto && p.mazoId === 'chancho') x('canto', (jugada === 'poker' ? B.mazos.chancho.multi : B.mazos.chancho.pierna) * dob);
  lv = nivelBend(p, 'puntahacha');
  const critico = lv > 0 && (c.golpes + 1) % nivelDe(bn.puntahacha, lv) === 0;
  if (critico) x('b:puntahacha', 2);
  if (tieneAmuleto(p, 'cetro') && (c.golpes === 0 || c.cetro)) x('a:cetro', am.cetro);

  const multiFinal = Math.max(1, multi) * por;
  const total = dano * multiFinal;

  const aEscudo = perfora ? 0 : Math.min(e.escudo, total);
  const mitad = e.jefe && !e.segunda && e.vida > Math.floor(e.vidaMax * 0.5) ? e.vida - Math.floor(e.vidaMax * 0.5) : Infinity;
  const frenaEnMitad = total - aEscudo > mitad;
  const aVida = Math.min(total - aEscudo, mitad);
  const abate = aVida >= e.vida;
  const exacto = aVida === e.vida;
  const alPelo = abate && !exacto && aVida - e.vida <= Math.max(1, Math.floor(e.vidaMax * B.exacto.alPelo), multiFinal - 1);
  lv = nivelBend(p, 'deguello');
  const ejecuta = !abate && !frenaEnMitad && lv > 0 && e.vida - aVida <= Math.floor(e.vidaMax * nivelDe(bn.deguello, lv));
  const sobra = abate && perfora ? (aVida - e.vida) * (tieneAmuleto(p, 'lanza') ? am.lanza : 1) : 0;
  let aturde = 0;
  if (canto && p.mazoId === 'chancho') aturde = (jugada === 'poker' ? B.mazos.chancho.aturde : 1) * dob;
  if (!aturde && tieneAmuleto(p, 'boleadoras') && !e.boleado && cuantas('C') >= 2) aturde = 1;

  let contra: number | null = null;
  if (!abate && !ejecuta) {
    if (e.aturdido > 0 || aturde > 0) contra = 0;
    else {
      const k = contraataque(p, e, { sinVida: aVida === 0, repite: repiteJugada(c.ultimaJugada, jugada) });
      const tuEscudo = Math.min(escudoTope(p), c.escudo + escudo);
      contra = k.n - Math.min(tuEscudo, k.n - k.directo);
    }
  }

  return { ok: true, jugada, ef, dano, multi: multiFinal, total, pasos, canto, critico, perfora, escudo, cura, oro, aEscudo, aVida, abate, exacto, alPelo, ejecuta, sobra, aturde, contra, frenaEnMitad, cortaMano };
}

export function crearEnemigo(p: Partida, palo: Palo, rango: Rango, o: { elite?: boolean; jefe?: boolean } = {}): Enemigo {
  const en = B.enemigos;
  const acto = en.actos[Math.min(p.acto, en.actos.length - 1)];
  let vida = (en.vida as Record<string, number>)[rango] * acto.vida;
  if (o.elite) vida *= en.elite.vida;
  if (o.jefe) vida *= en.jefe.vida * acto.jefe;
  vida = Math.max(5, Math.round(vida / 5) * 5);
  const ataque = (en.ataque as Record<string, number>)[rango] + acto.ataque + (o.elite ? en.elite.ataque : 0);
  let escudo = 0;
  if (rango === 11) escudo = Math.round(en.escudoCaballo * acto.escudo);
  if (o.jefe && palo === 'C') escudo = Math.round(B.reyes.C.escudo * acto.escudo);
  const e: Enemigo = { palo, rango, vida, vidaMax: vida, escudo, escudoMax: escudo, ataque, aturdido: 0, golpes: 0 };
  if (o.elite) e.elite = true;
  if (o.jefe) e.jefe = true;
  return e;
}

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

export function iniciarCombate(p: Partida, tipo: TipoCombate, fila: Enemigo[]): Ev[] {
  const evs: Ev[] = [];
  const j = B.jugador;
  let escudo = carga(p, 'C');
  if (p.mazoId === 'mentiroso') escudo += B.mazos.mentiroso.caraDePiedra;
  if (p.acto === 0) escudo += (B.mazos[p.mazoId] as { mesaLimpia?: number }).mesaLimpia ?? 0;
  let furia = 0;
  if (tipo === 'rey') {
    furia += p.furiaRey;
    p.furiaRey = 0;
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
    descartes: j.descartes,
    pasar: p.mazoId === 'chancho',
    enganos: p.mazoId === 'mentiroso' ? B.mazos.mentiroso.enganos * doble(p) : 0,
    engano: false,
    proxMulti: 0,
    golpes: 0,
    dado: 0,
    perdida: 0,
  };
  p.combate = c;
  p.fase = 'combate';
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
  robar(p, p.manoMax, evs);
  if (usaDado(p)) {
    c.dado = dado(p);
    evs.push({ t: 'dado', n: c.dado });
  }
  return evs;
}

const enMano = (c: Combate, ids: readonly string[]): Carta[] | null => {
  const out: Carta[] = [];
  for (const id of ids) {
    const k = c.mano.find((x) => x.id === id);
    if (!k || out.includes(k)) return null;
    out.push(k);
  }
  return out;
};

function abatir(p: Partida, evs: Ev[], o: { exacto: boolean; alPelo?: boolean; ejecutado: boolean; palos: Palo[] }): void {
  const c = p.combate!;
  const e = c.fila.shift()!;
  p.stats.abatidos++;
  evs.push({ t: 'cae', palo: e.palo, rango: e.rango, exacto: o.exacto, ejecutado: o.ejecutado, jefe: !!e.jefe });
  if (o.exacto) {
    p.stats.exactos++;
    p.oro += B.exacto.oro;
    p.racha = Math.min(B.exacto.rachaTope, (p.racha ?? 0) + 1);
    c.proxMulti += B.exacto.multi * p.racha;
    if (tieneAmuleto(p, 'cetro')) c.cetro = true;
    evs.push({ t: 'exacto' }, { t: 'oro', n: B.exacto.oro });
  }
  if (o.alPelo) {
    if (tieneAmuleto(p, 'cetro')) c.cetro = true;
    c.proxMulti += B.exacto.multi;
    p.stats.alPelo = (p.stats.alPelo ?? 0) + 1;
    p.oro += B.exacto.oroAlPelo;
    evs.push({ t: 'alpelo' }, { t: 'oro', n: B.exacto.oroAlPelo });
  } else if (!o.exacto) p.racha = 0;

  for (const palo of o.palos) {
    if (!sirveA(p, palo)) continue;
    p.cargas[palo]++;
    evs.push({ t: 'carga', rey: palo, n: 1 });
  }
  if (tieneAmuleto(p, 'facon') && o.palos.includes('S')) c.proxMulti += 1;
}

function segundaCara(e: Enemigo, evs: Ev[]): void {
  if (!e.jefe || e.segunda || e.vida > Math.floor(e.vidaMax * 0.5)) return;
  e.segunda = true;
  evs.push({ t: 'segunda', palo: e.palo });
  if (e.palo === 'C') {
    e.escudoMax = Math.max(e.escudoMax, Math.round(e.vidaMax * B.reyes.C.empalizada));
    const n = e.escudoMax - e.escudo;
    e.escudo = e.escudoMax;
    if (n > 0) evs.push({ t: 'rey', que: 'escudo', n });
  }
}

function contraatacar(p: Partida, evs: Ev[], o: { sinVida: boolean; repite?: boolean }): boolean {
  const c = p.combate!;
  const e = c.fila[0];
  if (e.aturdido > 0) {
    e.aturdido--;
    evs.push({ t: 'sincontra', por: 'aturdido' });
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
    const cobra = Math.min(p.oro, e.segunda ? Math.max(B.reyes.D.diezmo * 2, Math.ceil(p.oro * B.reyes.D.remate)) : B.reyes.D.diezmo);
    if (cobra > 0) {
      p.oro -= cobra;
      c.furia += cobra;
      evs.push({ t: 'rey', que: 'diezmo', n: cobra }, { t: 'furia', n: cobra, por: 'diezmo' });
    }
  }
  if (p.vida <= 0) {
    p.vida = 0;
    evs.push({ t: 'derrota' });
    return false;
  }
  if (frenado > 0 && frenado * 2 >= k.n) {
    const lv = nivelBend(p, 'contragolpe');
    if (lv) {
      const n = frenado * nivelDe(B.bendiciones.contragolpe, lv) + carga(p, 'C');
      const aEscudo = Math.min(e.escudo, n);
      e.escudo -= aEscudo;
      e.vida = Math.max(0, e.vida - (n - aEscudo));
      evs.push({ t: 'contragolpe', n }, { t: 'dano', n, aEscudo, vida: e.vida, escudo: e.escudo });
      if (e.vida <= 0) {
        abatir(p, evs, { exacto: false, ejecutado: false, palos: ['C'] });
        if (!c.fila.length) evs.push({ t: 'victoria' });
      }
    }
  }
  return true;
}

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
    const i = c.mano.indexOf(k);
    if (i >= 0) c.mano.splice(i, 1);
    c.descarte.push(k);
  }
  robar(p, Math.max(0, p.manoMax - c.mano.length), evs);
  c.turno++;
  p.stats.turnos++;
  c.pasar = p.mazoId === 'chancho';
  if (usaDado(p)) {
    c.dado = dado(p);
    evs.push({ t: 'dado', n: c.dado });
  }
}

export function golpear(p: Partida, ids: readonly string[]): Ev[] {
  const c = p.combate;
  if (!c || p.fase !== 'combate' || !c.fila.length) return [];
  const sel = enMano(c, ids);
  if (!sel) return [];
  const q = cuenta(p, sel);
  if (!q.ok) return [];
  const e = c.fila[0];
  const evs: Ev[] = [];
  const palos = [...new Set(q.ef.map((k) => k.palo))];
  const engano = c.engano && c.enganos > 0;
  evs.push({ t: 'golpe', ids: [...ids], jugada: q.jugada, dano: q.dano, multi: q.multi, total: q.total, palos, critico: q.critico, engano });
  p.stats.golpes++;
  p.stats.mejorGolpe = Math.max(p.stats.mejorGolpe, q.total);
  if (q.jugada === 'poker') p.stats.pokers++;
  const js = (p.stats.jugadas ??= {});
  js[q.jugada] = (js[q.jugada] ?? 0) + 1;
  if (engano) {
    c.enganos--;
    c.engano = false;
  }
  if (q.canto) {
    p.stats.cantos++;
    evs.push({ t: 'canto', mazo: p.mazoId });
    if (p.mazoId === 'escoba' || p.mazoId === 'truco') p.cantos++;
    if (p.mazoId === 'chinchon') p.cantos += doble(p);
    if (tieneAmuleto(p, 'cascabel')) c.cascabel = (c.cascabel ?? 0) + B.amuletos.cascabelMulti;
  }
  c.proxMulti = 0;
  c.cetro = false;
  const jugadaAntes = c.ultimaJugada;
  c.ultimaJugada = q.jugada;

  if (q.escudo) {
    c.escudo = Math.min(escudoTope(p), c.escudo + q.escudo);
    evs.push({ t: 'escudo', n: q.escudo });
  }
  if (q.cura) {
    const antes = p.vida;
    curar(p, q.cura);
    if (p.vida > antes) evs.push({ t: 'cura', n: p.vida - antes });
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

  e.golpes++;
  c.golpes++;
  e.escudo -= q.aEscudo;
  e.vida = Math.max(0, e.vida - q.aVida);
  evs.push({ t: 'dano', n: q.total, aEscudo: q.aEscudo, vida: e.vida, escudo: e.escudo });
  const cae = q.abate || q.ejecuta;
  if (cae) {
    if (q.ejecuta) e.vida = 0;
    abatir(p, evs, { exacto: q.exacto, alPelo: q.alPelo, ejecutado: q.ejecuta, palos });
  } else {
    segundaCara(e, evs);
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
    evs.push({ t: 'victoria' });
    return evs;
  }
  if (!cae) {
    const sigue = contraatacar(p, evs, { sinVida: q.aVida === 0, repite: repiteJugada(jugadaAntes, q.jugada) });
    if (!sigue || !c.fila.length) return evs;
  }
  finTurno(p, evs, sel);
  return evs;
}

export function puedeDescartar(p: Partida, n: number): 'gratis' | 'descarte' | null {
  const c = p.combate;
  if (!c || n < 1) return null;
  if (n === 1 && c.pasar) return 'gratis';
  return c.descartes > 0 ? 'descarte' : null;
}

export function descartar(p: Partida, ids: readonly string[]): Ev[] {
  const c = p.combate;
  if (!c || p.fase !== 'combate') return [];
  const sel = enMano(c, ids);
  if (!sel || !sel.length) return [];
  const modo = puedeDescartar(p, sel.length);
  if (!modo) return [];
  if (modo === 'gratis') c.pasar = false;
  else if (c.descartes > 0) c.descartes--;
  const evs: Ev[] = [{ t: 'descarta', ids: [...ids] }];
  for (const k of sel) {
    c.mano.splice(c.mano.indexOf(k), 1);
    c.descarte.push(k);
  }
  robar(p, sel.length, evs);
  return evs;
}

export function armarEngano(p: Partida, armado: boolean): boolean {
  const c = p.combate;
  if (!c || c.enganos <= 0) return false;
  c.engano = armado;
  return true;
}

export { activo };
