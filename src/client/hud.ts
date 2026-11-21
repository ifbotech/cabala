// El HUD del jugador: una barra cincelada anclada abajo, con el retrato vivo del Personaje en el centro (mira a los
// lados, parpadea, se lastima según la Vida que le queda, sonríe feroz al clavar un canto y hace una mueca al
// recibir un golpe) y a sus lados la Vida, el Escudo, el oro, el Mazo y las tiras de Amuletos, Cábalas y
// Bendiciones con sus cargas. Todo se inspecciona al pasar el cursor o el foco.
import { vocear } from './habla';
import type { MazoId } from '../rules/mazos';
import { AMULETO, RAREZA_NOMBRE } from '../rules/amuletos';
import { AUMENTO } from '../rules/aumentos';
import { PALOS } from '../rules/cartas';
import type { Palo } from '../rules/cartas';
import { carga, sirveA } from '../rules/estado';
import type { Partida } from '../rules/estado';
import { MAZO } from '../rules/mazos';
import { B } from '../rules/balance';
import { BENDICION, REY_DEF } from '../rules/reyes';
import type { BendicionId } from '../rules/reyes';
import { ajustes, t, tx } from './almacen';
import { enFoto } from './fx/motor';
import { cajaDe, reservar, soltar, tomadas } from './fx/director';
import type { Cuadro, Gesto, Herida, Mirada } from './pixel/personajes';
import { cifra, pxAmuleto, pxAumento, pxBendicion, pxHud, pxPalo, urlRetrato } from './sprites';
import { PALO_NOMBRE } from './textos';
import { $, esc, hayModal, tip } from './ui';

/** Lo que el HUD enseña (la mesa lo anima paso a paso; fuera del combate sale de la partida). */
export interface VistaHud {
  vida: number;
  vidaMax: number;
  escudo: number;
  oro: number;
  mazo: number;
}

export const vistaDe = (p: Partida): VistaHud => ({ vida: p.vida, vidaMax: p.vidaMax, escudo: p.combate?.escudo ?? 0, oro: p.oro, mazo: p.combate ? p.combate.mazo.length : p.mazo.length });

/** Las heridas del retrato según la Vida que queda. */
export const heridaDe = (vida: number, max: number): Herida => (vida * 3 <= max ? 2 : vida * 3 <= max * 2 ? 1 : 0);

/** Qué hace una carga ahora, con su cifra: «Filo 2: +2 de Daño en cada golpe». */
export function cargaQue(p: Partida, s: Palo): string {
  const n = carga(p, s);
  const efecto = t(`cargaEf${s}` as const, { n: s === 'S' ? n * B.cargas.filoDano : n });
  return t('cargaQue', { carga: tx(REY_DEF[s].carga), n, efecto });
}

function tiras(p: Partida): string {
  // solo lo que llevás (los huecos libres se cuentan en «LO QUE LLEVÁS»: un cuadro vacío parecía un error de carga)
  const amuletos = p.amuletos.map((id) => {
    const d = AMULETO[id];
    return `<span class="ficha" data-pieza="a:${id}" ${tip(tx(d.nombre), tx(d.desc), tx(RAREZA_NOMBRE[d.rareza]))}>${pxAmuleto(id)}</span>`;
  }).join('');
  const aumentos = p.aumentos
    .map((id) => {
      const d = AUMENTO[id];
      return `<span class="ficha" data-pieza="u:${id}" ${tip(tx(d.nombre), tx(d.desc), d.maldicion ? t('maldicion') : t('unaCabala'))}>${pxAumento(id)}</span>`;
    })
    .join('');
  // las cargas, con su nombre a la vista («FILO 4» con su palo): las que están en 0 no ocupan lugar
  const cargas = PALOS.filter((s) => sirveA(p, s) && carga(p, s) > 0)
    .map((s) => {
      const r = REY_DEF[s];
      const regla = ajustes.idioma === 'en' ? `+1 for each enemy you take down with ${PALO_NOMBRE[s].en} in the hit.` : `+1 por cada enemigo que abatís con ${PALO_NOMBRE[s].es} en el golpe.`;
      return `<span class="ficha carga" data-carga="${s}" ${tip(cargaQue(p, s), tx(r.cargaDa), regla)}>${pxPalo(s)}<b class="f-rot">${esc(tx(r.carga))}</b>${cifra(carga(p, s), 'oro')}</span>`;
    })
    .join('');
  const bendiciones = (Object.keys(p.bendiciones) as BendicionId[])
    .map((id) => {
      const d = BENDICION[id];
      const n = p.bendiciones[id] ?? 1;
      return `<span class="ficha" data-pieza="b:${id}" ${tip(tx(d.nombre), tx(d.desc(n)), `${tx(REY_DEF[d.rey].apodo)}${d.niveles > 1 ? ` · ${t('nivel', { n })}` : ''}`)}>${pxBendicion(id)}${d.niveles > 1 && n > 1 ? `<b class="f-nivel" aria-hidden="true">${'I'.repeat(Math.min(3, n))}</b>` : ''}</span>`;
    })
    .join('');
  if (!amuletos && !aumentos && !cargas && !bendiciones) return `<span class="sub hud-nada">${t('llevas')}: ${t('nada')}</span>`;
  // (los Amuletos y las Cábalas del Bufón, separados por una raya: «AMULETOS 0/5» no cuenta las Cábalas)
  return `<div class="hud-tira" data-tira="amuletos">${amuletos}${amuletos && aumentos ? '<i class="hud-sep" aria-hidden="true"></i>' : ''}${aumentos}</div><div class="hud-tira" data-tira="reyes">${cargas}${bendiciones}</div><span class="hud-mas" data-mas hidden data-tip-t="" data-tip="${t('masPiezasTip')}"></span>`;
}

/** El HTML del HUD. */
export function hudHtml(p: Partida, v: VistaHud = vistaDe(p)): string {
  const personaje = tx(MAZO[p.mazoId].personaje);
  const cuadro: Cuadro = { mirada: 0, gesto: 'neutro', herida: heridaDe(v.vida, v.vidaMax) };
  return `<footer class="hud marco" data-hud>
    <div class="hud-lado izq">
      <div class="hud-pozo hud-vida" data-hud-vida ${tip(t('vida'), `${v.vida} / ${v.vidaMax}`)}>
        <span class="rotulo">${t('vida')}</span>
        <span class="valor">${pxHud('vida')}<span data-n="vida">${cifra(v.vida, 'roja', 'grande')}</span><span class="de" data-n="vidaMax">${cifra(`/${v.vidaMax}`, 'hueso')}</span></span>
        <span class="hud-barra"><i data-barra="vida" style="width:${Math.round((100 * v.vida) / v.vidaMax)}%"></i></span>
      </div>
      <div class="hud-pozo" data-hud-escudo ${tip(t('escudo'), t('escudoTip'))}>
        <span class="rotulo">${t('escudo')}</span>
        <span class="valor">${pxHud('escudo')}<span data-n="escudo">${cifra(v.escudo, 'azul', 'grande')}</span></span>
      </div>
      <div class="hud-pozo" data-hud-oro ${tip(t('oro'), ajustes.idioma === 'en' ? 'Spend it at the Pulpería.' : 'Se gasta en la Pulpería.')}>
        <span class="rotulo">${t('oro')}</span>
        <span class="valor">${pxHud('oro')}<span data-n="oro">${cifra(v.oro, 'oro', 'grande')}</span></span>
      </div>
    </div>
    <div class="hud-retrato" ${tip(personaje, tx(MAZO[p.mazoId].nombre))}><i class="hud-cara" data-cara style="background-image:url(${urlRetrato(p.mazoId, cuadro)})"></i></div>
    <div class="hud-lado der">
      <button class="hud-pozo" data-accion="ver-mazo" data-foco="hud-mazo" ${tip(t('verMazo'))}>
        <span class="rotulo">${t('mazo')}</span>
        <span class="valor">${pxHud('mazo')}<span data-n="mazo">${cifra(v.mazo, 'hueso', 'grande')}</span></span>
      </button>
      <button class="hud-tiras" data-tiras data-accion="ver-piezas" data-foco="hud-piezas" aria-label="${t('verLlevas')}" ${tip(t('llevas'), t('llevasTip'), PALOS.filter((s) => sirveA(p, s)).map((s) => cargaQue(p, s)).join('\n'))}>${tiras(p)}</button>
      <kbd class="glifo g-mando g-rt hud-glifo" aria-hidden="true">RT</kbd>
    </div>
  </footer>`;
}

/** Repinta las tiras (Amuletos, Cábalas, cargas y Bendiciones) y marca la carga que acaba de subir. */
export function actualizarTiras(p: Partida, sube?: Palo): void {
  const el = $('[data-tiras]');
  if (!el) return;
  el.innerHTML = tiras(p);
  if (sube) $(`[data-carga="${sube}"]`, el)?.classList.add('sube');
  ajustarBandeja();
}

/** Pone un número del HUD (y la barra de Vida). */
export function ponerHud(v: VistaHud): void {
  const pon = (clave: string, html: string) => {
    const el = $(`[data-hud] [data-n="${clave}"]`);
    if (el && el.dataset.v !== html) {
      const cambia = el.dataset.v !== undefined;
      el.innerHTML = html;
      el.dataset.v = html;
      // el número que cambia da un latido
      if (cambia && !ajustes.calma && !enFoto()) {
        el.classList.remove('late');
        void el.offsetWidth;
        el.classList.add('late');
      }
    }
  };
  pon('vida', cifra(v.vida, 'roja', 'grande'));
  pon('vidaMax', cifra(`/${v.vidaMax}`, 'hueso'));
  pon('escudo', cifra(v.escudo, 'azul', 'grande'));
  pon('oro', cifra(v.oro, 'oro', 'grande'));
  pon('mazo', cifra(v.mazo, 'hueso', 'grande'));
  const barra = $<HTMLElement>('[data-barra="vida"]');
  if (barra) barra.style.width = `${Math.max(0, Math.round((100 * v.vida) / v.vidaMax))}%`;
}

// ───────────── el retrato vivo ─────────────

interface Vivo {
  p: Partida;
  vida: () => [number, number];
  gesto: Gesto | null;
  hasta: number;
  mirada: Mirada;
  cambia: number;
  parpadea: number;
  reloj: number;
  /** Hacia dónde mira porque algo lo llama (la carta que arrastrás). */
  forzada: Mirada | null;
  /** El gesto que sostiene mientras dure algo (la sonrisa del Golpe exacto a la vista). */
  fijo: Gesto | null;
}
let vivo: Vivo | null = null;

function pintarCara(): void {
  if (!vivo) return;
  const el = $<HTMLElement>('[data-cara]');
  if (!el) return;
  const [vida, max] = vivo.vida();
  const ahora = performance.now();
  let gesto: Gesto = vivo.gesto && ahora < vivo.hasta ? vivo.gesto : (vivo.fijo ?? 'neutro');
  if (vida <= 0) gesto = 'caido';
  else if (gesto === 'neutro' && ahora < vivo.parpadea) gesto = 'parpadeo';
  const c: Cuadro = { mirada: gesto === 'neutro' ? (vivo.forzada ?? vivo.mirada) : 0, gesto, herida: gesto === 'caido' ? 2 : heridaDe(vida, max) };
  const u = `url(${urlRetrato(vivo.p.mazoId, c)})`;
  if (el.style.backgroundImage !== u) el.style.backgroundImage = u;
}

/**
 * Da vida al retrato del HUD: mira a los lados, parpadea y refleja la Vida. `vida` devuelve [Vida, máxima] tal como
 * las enseña la pantalla en ese momento.
 */
export function avivarRetrato(p: Partida, vida: () => [number, number] = () => [p.vida, p.vidaMax]): void {
  apagarRetrato();
  vivo = { p, vida, gesto: null, hasta: 0, mirada: 0, cambia: performance.now() + 1800, parpadea: 0, reloj: 0, forzada: null, fijo: null };
  pintarCara();
  if (ajustes.calma || enFoto()) return;
  vivo.reloj = window.setInterval(() => {
    if (!vivo) return;
    const ahora = performance.now();
    if (ahora > vivo.cambia) {
      // casi siempre vuelve al frente; a veces mira a un lado, a veces parpadea
      const r = Math.random();
      if (vivo.mirada !== 0) vivo.mirada = 0;
      else if (r < 0.4) vivo.mirada = Math.random() < 0.5 ? -1 : 1;
      else if (r < 0.75) vivo.parpadea = ahora + 140;
      vivo.cambia = ahora + (vivo.mirada !== 0 ? 700 + Math.random() * 600 : 1400 + Math.random() * 2200);
    }
    pintarCara();
  }, 70);
}
export function apagarRetrato(): void {
  if (vivo) clearInterval(vivo.reloj);
  vivo = null;
}
/** Un gesto que dura un rato: `feroz` al clavar un canto o un Golpe exacto, `mueca` al recibir un golpe. */
export function gestoRetrato(g: Gesto, ms = 900): void {
  if (!vivo) return;
  vivo.gesto = g;
  vivo.hasta = performance.now() + ms;
  pintarCara();
  if (g === 'mueca') {
    const el = $('[data-cara]');
    el?.classList.remove('golpe');
    void el?.offsetWidth;
    el?.classList.add('golpe');
  }
}
export const repintarCara = pintarCara;

/** Una pose del retrato entero (el cuerpo acompaña al gesto): festeja a los saltos, tiembla de miedo o guiña. */
export function poseRetrato(pose: 'festeja' | 'tiembla' | 'guina', ms = 900): void {
  const el = $('.hud-retrato');
  if (!el || enFoto() || ajustes.calma) return;
  el.classList.remove('festeja', 'tiembla', 'guina');
  void el.offsetWidth;
  el.classList.add(pose);
  window.setTimeout(() => el.classList.remove(pose), ms);
}

/** La ficha de una pieza en la bandeja pega un brinco (dispara en el conteo). Devuelve su centro, o null si no está a la vista. */
export function dispararFicha(pieza: string): { x: number; y: number } | null {
  let el = $<HTMLElement>(`.hud [data-pieza="${pieza}"]`);
  if (!el) return null;
  // si la pieza quedó detrás del «+N» de la bandeja, salta el «+N»
  if (el.hidden || !el.offsetParent) el = $<HTMLElement>('.hud [data-mas]:not([hidden])');
  if (!el || !el.offsetParent) return null;
  el.classList.remove('dispara');
  void el.offsetWidth;
  el.classList.add('dispara');
  const rc = el.getBoundingClientRect();
  // los números de una misma cuenta nacen por encima de la fila de fichas (del borde de arriba de la bandeja, nunca de
  // la ficha ni del «N MÁS»), sobre su ficha y lejos del borde; el director de escena los escalona si se pisan
  const techo = Math.min(rc.top, $('.hud [data-tiras]')?.getBoundingClientRect().top ?? rc.top);
  const x = rc.left + rc.width / 2;
  return { x: Math.max(56, Math.min(innerWidth - 56, x)), y: techo - 4 };
}

/**
 * El Personaje grita algo: un globo corto cerca de su retrato, con su voz, que se va solo en 1,2 s. Nunca tapa una
 * cifra del HUD (Vida, Escudo, oro, Mazo), la cuenta, la mano, los botones ni lo del enemigo: se mide antes de
 * ubicarse y va al hueco libre más cercano al retrato (en el escritorio, casi siempre arriba de él, entre la mano y
 * los botones; en el teléfono, sobre la mesa). Nunca sale con un modal abierto (ni queda encima de uno: va por debajo
 * del velo y se borra al abrirse), y si la pantalla cambia se vuelve a ubicar junto al retrato nuevo. `foto` lo deja
 * quieto para la QA visual.
 */
export function gritar(mazo: MazoId, texto: string, o: { foto?: boolean } = {}): void {
  const retrato = $('.hud-retrato');
  if (!retrato || !texto || (enFoto() && !o.foto) || hayModal()) return;
  ocultarGrito();
  const b = document.createElement('p');
  b.className = `bocadillo sin-cola hud-grito${o.foto ? ' quieto' : ''}`;
  b.textContent = texto;
  ($('#capa') ?? document.body).append(b);
  ubicarGrito(b);
  // (la letra llega después: medido con la de reserva, el bocadillo cambiaría de ancho)
  void document.fonts?.ready.then(() => b.isConnected && ubicarGrito(b));
  if (o.foto) return;
  // el grito es una capa más del director de escena: lo que vuele después no se le monta encima
  const rg = b.getBoundingClientRect();
  turnoGrito = reservar('grito', { x: rg.left, y: rg.top, w: rg.width, h: rg.height }, 1200, cajaDe(b));
  vocear(mazo, texto);
  // el retrato da un salto al gritar
  retrato.classList.remove('grita');
  void retrato.offsetWidth;
  retrato.classList.add('grita');
  relojGrito = window.setTimeout(() => b.remove(), 1200);
}
let relojGrito = 0;
let turnoGrito = 0;
/** Borra el grito que esté a la vista. */
export function ocultarGrito(): void {
  clearTimeout(relojGrito);
  soltar(turnoGrito);
  document.querySelector('.hud-grito')?.remove();
}
/** Si la mesa cambió debajo del grito (la cuenta creció, la mano se movió), se vuelve a ubicar. */
export function reubicarGrito(): void {
  const b = document.querySelector<HTMLElement>('.hud-grito');
  if (b) ubicarGrito(b);
}
/**
 * Lo que el grito no puede tapar nunca (también lo mide la QA visual, regla «grito-tapa»). Un botón apagado no cuenta:
 * mientras se anima un golpe (cuando grita el Personaje) GOLPEAR y DESCARTAR no se pueden tocar, y en el teléfono ese
 * renglón, justo arriba del retrato, es el único hueco cerca de él.
 */
export const ZONAS_SIN_GRITO =
  '#app button:not(:disabled), #app [data-accion]:not(:disabled), #app .mano .carta, #app .cuenta:not(.reposo), #app [data-hud-vida], #app [data-hud-escudo], #app [data-hud-oro], #app .hud [data-n], #app .mesa-top .lado > *, #app .panel:not(.botin-panel)';
/** Lo que mejor no tapa (si no hay otro hueco, tapa lo menos posible): lo del enemigo, el Bufón y lo que dice, el Botín. */
const ZONAS_MEJOR_NO = '#app .e-centro, #app .e-vida, #app .e-ataque, #app .e-rasgo, #app .e-sellos > *, #app .corte-carta, #app .esc-bufon .bufon, #app .bocadillo:not([hidden]), #app .botin-panel > .titulo, #app .botin-fila, #app button:disabled';
/** Lo más lejos que puede caer el grito de su retrato (el hueco entre las dos cajas), salvo que cerca no haya lugar. */
// (en la Deck y el portátil, con la mano entera tapando el aire sobre el HUD, el hueco más cercano queda justo encima de
// los naipes, a unos 260 px)
export const GRITO_LEJOS = (ancho: number): number => (ancho < 700 ? 120 : 280);
/**
 * Ubica el grito en el hueco libre más cercano a su retrato, dentro de la pantalla y a no más de `GRITO_LEJOS` de él,
 * con la cola apuntándole (abajo si el globo queda arriba del retrato, arriba si queda debajo).
 */
function ubicarGrito(b: HTMLElement): void {
  // (en el teléfono, mientras el Botín entra, el grito espera escondido: se ubica cuando las piezas ya están quietas)
  if (b.dataset.espera) return;
  const retrato = $('.hud-retrato');
  if (!retrato) {
    b.remove();
    return;
  }
  const r = retrato.getBoundingClientRect();
  const m = 8;
  b.style.maxWidth = `${Math.min(300, innerWidth - 2 * m)}px`;
  b.style.left = '0px';
  b.style.top = '0px';
  const w = b.offsetWidth;
  const h = b.offsetHeight;
  const lejos = GRITO_LEJOS(innerWidth);
  /** El hueco entre el globo puesto en (x, y) y el retrato. */
  const hueco = (x: number, y: number): number => Math.hypot(Math.max(0, r.left - (x + w), x - r.right), Math.max(0, r.top - (y + h), y - r.bottom));
  const cajas = (sel: string, peso: number) =>
    [...document.querySelectorAll<HTMLElement>(sel)]
      .filter((el) => el !== b && !(el.classList.contains('carta') && Number(el.style.zIndex || 0) >= 100))
      .map((el) => ({ c: el.getBoundingClientRect(), peso }))
      .filter((x) => x.c.width > 0 && x.c.height > 0);
  // (lo que no se puede tapar pesa un millón por píxel: un solo píxel de eso pierde contra tapar entero lo blando)
  // (y lo que el director de escena tiene en el aire, el número, el canto, el cartel, pesa casi como un control)
  const enAire = tomadas(turnoGrito).map((c) => ({ c: { left: c.x, top: c.y, right: c.x + c.w, bottom: c.y + c.h } as DOMRect, peso: 1e4 }));
  // (0.20) en el Botín del teléfono, una pieza por elegir es tan intocable como un botón: el grito no la tapa nunca
  const botinTel = innerWidth <= 700 && !!document.querySelector('#app main.botin:not(.directo)');
  const prohibidas = [...cajas(ZONAS_SIN_GRITO, 1e6), ...(botinTel ? cajas('#app .botin-fila.pendiente', 1e6) : []), ...enAire, ...cajas(ZONAS_MEJOR_NO, 1)];
  // (corta apenas supera lo que tapa el mejor hueco hallado: la búsqueda entera cabe en un par de milisegundos)
  const tapa = (x: number, y: number, tope: number): number => {
    let a = 0;
    for (const { c, peso } of prohibidas) {
      const ix = Math.min(x + w, c.right) - Math.max(x, c.left);
      if (ix <= 0) continue;
      const iy = Math.min(y + h, c.bottom) - Math.max(y, c.top);
      if (iy > 0 && (a += ix * iy * peso) > tope) return a;
    }
    return a;
  };
  // el ancla: el borde de arriba del retrato, al medio
  const ax = r.left + r.width / 2;
  const ay = r.top;
  const paso = 8;
  // primero, solo cerca del retrato; si ahí todo tapa algo que no se puede tapar, la pantalla entera
  const buscar = (cerca: boolean) => {
    let mejor = { x: Math.max(m, Math.min(innerWidth - w - m, ax - w / 2)), y: Math.max(m, ay - h - m), tapa: Infinity, d: Infinity };
    for (let y = m; y <= innerHeight - h - m; y += paso) {
      for (let x = m; x <= innerWidth - w - m; x += paso) {
        if (cerca && hueco(x, y) > lejos) continue;
        // lo más cerca del retrato (el centro del globo contra el ancla), un poco más barato hacia arriba que al costado
        const dx = x + w / 2 - ax;
        const dy = y + h / 2 - (ay - h / 2 - m);
        const d = dx * dx + dy * dy * 1.4;
        // con un hueco limpio ya hallado, lo que queda más lejos ni se mide
        if (mejor.tapa === 0 && d >= mejor.d) continue;
        const t = tapa(x, y, mejor.tapa);
        if (t > mejor.tapa) continue;
        if (t < mejor.tapa || d < mejor.d) mejor = { x, y, tapa: t, d };
      }
    }
    return mejor;
  };
  let mejor = buscar(true);
  // (y si a 120 px del retrato no hay hueco limpio, ese grito no se dibuja)
  if (botinTel && mejor.tapa >= 1e6) {
    ocultarGrito();
    return;
  }
  if (mejor.tapa >= 1e6) {
    const lejano = buscar(false);
    if (lejano.tapa < mejor.tapa) mejor = lejano;
  }
  b.dataset.lado = mejor.x + w / 2 < ax ? 'izq' : 'der';
  b.style.left = `${Math.round(mejor.x)}px`;
  b.style.top = `${Math.round(mejor.y)}px`;
  // la cola, hacia el retrato: abajo si el globo quedó arriba de él, arriba si quedó debajo; en x, lo más cerca de su
  // centro que deje el globo (sin salirse de las esquinas)
  const arriba = mejor.y + h <= r.top + h * 0.5;
  b.dataset.cola = arriba ? 'abajo' : 'arriba';
  const k = Number(getComputedStyle(document.documentElement).getPropertyValue('--k')) || 1;
  const cx = Math.max(16 * k, Math.min(w - 24 * k, ax - mejor.x - 2 * k));
  b.style.setProperty('--cola-x', `${Math.round(cx)}px`);
  b.classList.remove('sin-cola');
}
// al abrirse un modal el grito se borra; al cambiar de pantalla, se vuelve a ubicar junto al retrato nuevo (o se va)
if (typeof document !== 'undefined')
  document.addEventListener('cabala:pantalla', (ev) => {
    const b = document.querySelector<HTMLElement>('.hud-grito');
    if (!b) return;
    if ((ev as CustomEvent<string>).detail === 'modal' || hayModal()) ocultarGrito();
    else requestAnimationFrame(() => b.isConnected && ubicarGrito(b));
  });

/**
 * La bandeja del HUD: una fila en el teléfono y a 1080p, dos filas de fichas en el portátil y la Steam Deck (el CSS
 * lo dice con `--filas` en la bandeja). Lo que no entra no se apila ni se corta, se cuenta en un «+N» al final (todo
 * está en «LO QUE LLEVÁS», que se abre al tocarla).
 */
export function ajustarBandeja(): void {
  const el = $('[data-tiras]');
  const mas = el ? $('[data-mas]', el) : null;
  if (!el || !mas) return;
  const fichas = [...el.querySelectorAll<HTMLElement>('.ficha')];
  fichas.forEach((f) => (f.hidden = false));
  mas.hidden = true;
  el.classList.remove('con-mas');
  if (!fichas.length) return;
  const filas = Math.max(1, Math.round(Number(getComputedStyle(el).getPropertyValue('--filas')) || 1));
  const hueco = parseFloat(getComputedStyle(el).rowGap) || 0;
  // una ficha está de más si empieza por debajo de donde termina la última fila permitida (las hay de distinta
  // altura: comparar solo el borde de arriba tomaba por «segunda fila» a las cargas y las Bendiciones)
  const pie = (): number => fichas[0].offsetTop + filas * fichas[0].offsetHeight + (filas - 1) * hueco - 2;
  const abajo = (el: HTMLElement): boolean => el.offsetTop >= pie();
  const sobran = (): HTMLElement[] => fichas.filter((f) => !f.hidden && abajo(f));
  let fuera = sobran();
  if (!fuera.length) return;
  // se reserva el sitio del «+N» y se esconden las que ya no entran en la primera fila
  el.classList.add('con-mas');
  mas.hidden = false;
  let n = 0;
  for (let i = 0; i < 40 && (fuera = sobran()).length; i++) {
    fuera.forEach((f) => (f.hidden = true));
    n += fuera.length;
    mas.textContent = t('masCorto', { n });
    // si el «+N» quedó en la segunda fila, se le hace sitio quitando una más
    if (abajo(mas)) {
      const ultima = [...fichas].reverse().find((f) => !f.hidden);
      if (!ultima) break;
      ultima.hidden = true;
      n++;
      mas.textContent = t('masCorto', { n });
    }
  }
  if (abajo(mas)) {
    const ultima = [...fichas].reverse().find((f) => !f.hidden);
    if (ultima) {
      ultima.hidden = true;
      n++;
      mas.textContent = t('masCorto', { n });
    }
  }
  mas.dataset.tipT = t('masPiezas', { n });
}
// la bandeja se vuelve a medir cuando cambia de tamaño (la pantalla recién montada todavía se está acomodando)
if (typeof document !== 'undefined') {
  // solo importa el ancho: al esconder fichas la bandeja puede cambiar de alto, y eso no es motivo para volver a medir
  let ancho = -1;
  const mira =
    typeof ResizeObserver === 'function'
      ? new ResizeObserver((xs) => {
          const w = Math.round(xs[0]?.contentRect.width ?? 0);
          if (w === ancho) return;
          ancho = w;
          ajustarBandeja();
        })
      : null;
  document.addEventListener('cabala:pantalla', () => {
    ajustarBandeja();
    mira?.disconnect();
    const el = $('[data-tiras]');
    if (el) mira?.observe(el);
    requestAnimationFrame(() => ajustarBandeja());
  });
  addEventListener('resize', () => ajustarBandeja());
  // la letra del «+N» llega después que la pantalla: medido con la letra de reserva, el «+N» quedaba solo en una
  // segunda fila (y en el móvil empujaba la mesa)
  void document.fonts?.ready.then(() => ajustarBandeja());
  document.fonts?.addEventListener?.('loadingdone', () => ajustarBandeja());
}

/** El retrato sigue con los ojos lo que arrastrás (`null`: vuelve a mirar por su cuenta). */
export function mirarHacia(x: number | null): void {
  if (!vivo) return;
  let m: Mirada | null = null;
  if (x !== null) {
    const r = $('.hud-retrato')?.getBoundingClientRect();
    const c = r ? r.left + r.width / 2 : innerWidth / 2;
    m = x < c - 48 ? -1 : x > c + 48 ? 1 : 0;
  }
  if (m === vivo.forzada) return;
  vivo.forzada = m;
  pintarCara();
}
/** Sostiene un gesto mientras dure algo (o lo suelta con `null`). */
export function gestoFijo(g: Gesto | null): void {
  if (!vivo || vivo.fijo === g) return;
  vivo.fijo = g;
  pintarCara();
}
