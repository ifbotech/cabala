// Ayudas de la interfaz: montar una pantalla, repartir los clics por `data-accion`, la inspección al pasar el cursor
// o el foco (`data-tip`), los modales, el Bufón, los Reyes y la etiqueta de sinergia.
import { quieto } from './ritmo';
import { AMULETO, RAREZA_NOMBRE } from '../rules/amuletos';
import type { AmuletoId } from '../rules/amuletos';
import { AUMENTO } from '../rules/aumentos';
import type { AumentoId } from '../rules/aumentos';
import type { Palo } from '../rules/cartas';
import type { Partida, TipoOferta } from '../rules/estado';
import { BENDICION, REY_DEF } from '../rules/reyes';
import type { BendicionId } from '../rules/reyes';
import { sinergia } from '../rules/notas';
import { ajustes, t, tx } from './almacen';
import { bufonCapas, type Expresion } from './pixel/bufon';
import { REY_PX, reyFondo, reyMapa, type Animo } from './pixel/reyes';
import { avivar, esfumar } from './bufon-vivo';
import { px, pxEstrella, pxInmune } from './sprites';

export type Accion = (el: HTMLElement, ev: Event) => void;

export interface Pantalla {
  /** El nombre (clase `p-<nombre>` y estado de la QA). */
  nombre: string;
  html: () => string;
  acciones?: Record<string, Accion>;
  /** Tras montar el HTML (para enganchar lo que no es un clic). */
  alMontar?: (raiz: HTMLElement) => void;
  alSalir?: () => void;
  /** Lo que hace «atrás» (Escape o B). */
  atras?: () => void;
}

export const $ = <T extends HTMLElement = HTMLElement>(sel: string, raiz: ParentNode = document): T | null => raiz.querySelector<T>(sel);
export const $$ = <T extends HTMLElement = HTMLElement>(sel: string, raiz: ParentNode = document): T[] => [...raiz.querySelectorAll<T>(sel)];
export const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

let actual: Pantalla | null = null;
let modal: { acciones: Record<string, Accion>; atras?: () => void } | null = null;

/** Monta una pantalla en #app. */
let relojRecien = 0;
export function montar(p: Pantalla, misma = false): void {
  if (!misma) esfumar();
  actual?.alSalir?.();
  cerrarModal();
  ocultarTip();
  actual = p;
  const app = $('#app')!;
  app.className = `p-${p.nombre}${ajustes.calma ? ' calma' : ''}`;
  app.dataset.pantalla = p.nombre;
  app.innerHTML = p.html();
  p.alMontar?.(app);
  // recién montada: la pantalla entra y sus opciones brotan una tras otra (no al repintar la misma)
  clearTimeout(relojRecien);
  app.classList.toggle('recien', !misma && !quieto());
  if (!misma && !quieto()) relojRecien = window.setTimeout(() => app.classList.remove('recien'), 800);
  avivar(app, !misma);
  document.dispatchEvent(new CustomEvent('cabala:pantalla', { detail: p.nombre }));
}
/** Vuelve a pintar la pantalla actual (conserva el foco si puede). */
export function repintar(): void {
  if (!actual) return;
  const foco = (document.activeElement as HTMLElement | null)?.dataset?.foco;
  const p = actual;
  actual = null;
  montar(p, true);
  if (foco) $(`[data-foco="${foco}"]`)?.focus();
}
export const pantallaActual = (): Pantalla | null => actual;

/** Abre un modal sobre la pantalla. */
export function abrirModal(html: string, acciones: Record<string, Accion> = {}, atras?: () => void): HTMLElement {
  cerrarModal();
  const capa = $('#capa')!;
  capa.insertAdjacentHTML('beforeend', `<div class="velo" role="dialog" aria-modal="true">${html}</div>`);
  modal = { acciones, atras };
  const velo = capa.lastElementChild as HTMLElement;
  // las opciones del modal brotan una tras otra (en las capturas y con «Reducir movimiento», ya están en su sitio)
  velo.classList.toggle('recien', !quieto());
  avivar(velo, true);
  requestAnimationFrame(() => (velo.querySelector<HTMLElement>('[data-inicio]') ?? velo.querySelector<HTMLElement>('button:not(:disabled)'))?.focus());
  document.dispatchEvent(new CustomEvent('cabala:pantalla', { detail: 'modal' }));
  return velo;
}
export function cerrarModal(): void {
  $('#capa .velo')?.remove();
  modal = null;
}
export const hayModal = (): boolean => modal !== null;

/**
 * «Atrás» (Escape o B): cierra el modal o hace lo que diga la pantalla. Si la pantalla no dice nada, B busca su botón
 * de salida (el que lleva el glifo B: SALIR, SEGUIR): la primera vez le lleva el foco, la segunda lo pulsa (así un B
 * de más no te saca de La Pulpería ni te hace saltar un premio sin verlo).
 */
export function atras(): void {
  if (modal) {
    if (modal.atras) modal.atras();
    else cerrarModal();
    return;
  }
  if (actual?.atras) {
    actual.atras();
    return;
  }
  irASalida($('#app'));
}
/** El botón de salida de `raiz` (con el glifo B): primero el foco, después el clic. Devuelve si había uno. */
export function irASalida(raiz: ParentNode | null): boolean {
  const b = raiz ? $$<HTMLButtonElement>('button[data-salida]:not(:disabled)', raiz).find((x) => x.getBoundingClientRect().width > 0) : undefined;
  if (!b) return false;
  if (document.activeElement === b) b.click();
  else {
    b.scrollIntoView({ block: 'nearest' });
    b.focus();
  }
  return true;
}

/** Engancha los clics y la inspección una sola vez. */
export function iniciarUi(): void {
  document.addEventListener('click', (ev) => {
    const el = (ev.target as HTMLElement).closest<HTMLElement>('[data-accion]');
    if (!el || (el as HTMLButtonElement).disabled || el.getAttribute('aria-disabled') === 'true') return;
    const nombre = el.dataset.accion!;
    const fn = (modal && el.closest('.velo') ? modal.acciones[nombre] : undefined) ?? (!modal || !el.closest('.velo') ? actual?.acciones?.[nombre] : undefined);
    if (fn) fn(el, ev);
  });
  // inspección: al pasar el cursor, al enfocar o al tocar
  const mostrar = (ev: Event) => {
    const el = (ev.target as HTMLElement).closest?.<HTMLElement>('[data-tip]');
    if (el) mostrarTip(el);
    else ocultarTip();
  };
  document.addEventListener('pointerover', mostrar);
  document.addEventListener('focusin', mostrar);
  document.addEventListener('pointerdown', (ev) => {
    if (!(ev.target as HTMLElement).closest?.('[data-tip]')) ocultarTip();
  });
  document.addEventListener('focusout', ocultarTip);
  // al desplazarse, la ayuda de lo que tiene el foco (un nodo del Mapa que el mando trae a la vista) lo acompaña; la
  // del cursor se va
  window.addEventListener(
    'scroll',
    () => {
      if (tipAncla?.isConnected && document.activeElement === tipAncla) ubicarTip(tipAncla);
      else ocultarTip();
    },
    true,
  );
}

let tipEl: HTMLElement | null = null;
let tipAncla: HTMLElement | null = null;
function mostrarTip(el: HTMLElement): void {
  ocultarTip();
  const titulo = el.dataset.tipT ?? '';
  const cuerpo = el.dataset.tip ?? '';
  // (0.22: una ayuda puede decir otra cosa con el mando —«Pulsá A»— que con el ratón o el dedo)
  const pie = (document.documentElement.dataset.entrada === 'mando' ? el.dataset.tipPieMando : undefined) ?? el.dataset.tipPie ?? '';
  if (!titulo && !cuerpo) return;
  tipEl = document.createElement('div');
  tipEl.className = 'tip';
  tipEl.setAttribute('role', 'tooltip');
  tipEl.innerHTML = `${titulo ? `<b>${esc(titulo)}</b>` : ''}${cuerpo ? `<span>${esc(cuerpo)}</span>` : ''}${pie ? `<span class="apagado">${esc(pie)}</span>` : ''}${el.dataset.tipPalos ? `<span class="tip-palos">${[...el.dataset.tipPalos].map((s) => pxInmune(s as Palo)).join('')}</span>` : ''}`;
  document.body.append(tipEl);
  tipAncla = el;
  ubicarTip(el);
}
function ubicarTip(el: HTMLElement): void {
  if (!tipEl) return;
  const r = el.getBoundingClientRect();
  // un nodo del Mapa: la ayuda va al costado del lienzo, a la altura del nodo (nunca encima de él ni de sus vecinos)
  if (carrilDelMapa(el, r)) return;
  tipEl.classList.remove('tip-carril');
  tipEl.style.maxWidth = '';
  if (ayudaDeNaipe(el, r)) return;
  const w = tipEl.offsetWidth;
  const h = tipEl.offsetHeight;
  const x = Math.max(4, Math.min(innerWidth - w - 4, r.left + r.width / 2 - w / 2));
  const arriba = r.top - h - 6;
  tipEl.style.left = `${Math.round(x)}px`;
  tipEl.style.top = `${Math.round(arriba >= 4 ? arriba : Math.min(innerHeight - h - 4, r.bottom + 6))}px`;
}
/**
 * La ayuda de un naipe de la mano (el temple, la copia del Comodín): nunca encima de la cuenta (con el mando el foco
 * pasa por las cartas y la ayuda salía sola sobre el total, CURA y TE PEGA). Va al costado del naipe, dentro de la
 * franja de la mano; si no hay costado (el teléfono), por arriba de la mano y por debajo de la cuenta.
 */
function ayudaDeNaipe(el: HTMLElement, r: DOMRect): boolean {
  const mano = el.closest<HTMLElement>('.mano');
  if (!mano || !tipEl) return false;
  const M = mano.getBoundingClientRect();
  const techo = ($('[data-cuenta] .cuenta:not(.reposo)') ?? $('[data-cuenta]'))?.getBoundingClientRect().bottom ?? 0;
  tipEl.style.maxWidth = `${Math.min(320, innerWidth - 8)}px`;
  const w = tipEl.offsetWidth;
  const h = tipEl.offsetHeight;
  const m = 8;
  const y = Math.max(techo + 6, Math.min(innerHeight - h - 4, r.top + 12));
  let x: number;
  if (r.right + m + w <= Math.max(M.right, innerWidth * 0.6)) x = r.right + m;
  else if (r.left - m - w >= Math.min(M.left, innerWidth * 0.4)) x = r.left - m - w;
  else {
    // sin costado: arriba de la mano, debajo de la cuenta
    x = Math.max(4, Math.min(innerWidth - w - 4, r.left + r.width / 2 - w / 2));
    tipEl.style.left = `${Math.round(x)}px`;
    tipEl.style.top = `${Math.round(Math.max(techo + 6, Math.min(r.top - h - 6, innerHeight - h - 4)))}px`;
    return true;
  }
  tipEl.style.left = `${Math.round(Math.max(4, Math.min(innerWidth - w - 4, x)))}px`;
  tipEl.style.top = `${Math.round(y)}px`;
  return true;
}
/** La ayuda de un nodo del Mapa, en el carril libre a un costado del lienzo (si lo hay): devuelve si la ubicó. */
function carrilDelMapa(el: HTMLElement, r: DOMRect): boolean {
  const lienzo = el.closest<HTMLElement>('.mapa-lienzo');
  if (!lienzo || !tipEl) return false;
  const L = lienzo.getBoundingClientRect();
  const rollo = lienzo.closest<HTMLElement>('.mapa-rollo')?.getBoundingClientRect() ?? L;
  const techo = ($('.pantalla > .cabecera')?.getBoundingClientRect().bottom ?? 0) + 6;
  const piso = ($('.pantalla > .hud')?.getBoundingClientRect().top ?? innerHeight) - 6;
  const margen = 12;
  const derecha = Math.min(innerWidth, rollo.right) - L.right - margen - 6;
  const izquierda = L.left - Math.max(0, rollo.left) - margen - 6;
  const ancho = Math.max(derecha, izquierda);
  if (ancho < 200) return false;
  tipEl.classList.add('tip-carril');
  tipEl.style.maxWidth = `${Math.floor(Math.min(ancho, 380))}px`;
  const w = tipEl.offsetWidth;
  const h = tipEl.offsetHeight;
  const y = Math.max(techo, Math.min(piso - h, r.top + r.height / 2 - h / 2));
  // (0.20) al lado del nodo mismo, si ahí no tapa otro nodo ni sus escudos; si no, en el carril de al lado del mapa
  const otros = [...lienzo.querySelectorAll<HTMLElement>('.nodo')].filter((n) => n !== el).map((n) => n.getBoundingClientRect());
  const libre = (x: number): boolean =>
    x >= 8 && x + w <= innerWidth - 8 && !otros.some((o) => o.right + 4 > x && o.left - 4 < x + w && o.bottom + 30 > y && o.top - 4 < y + h);
  const pegado = [r.right + margen, r.left - margen - w].find(libre);
  const x = pegado ?? (derecha >= izquierda ? L.right + margen : L.left - margen - w);
  tipEl.style.left = `${Math.round(x)}px`;
  tipEl.style.top = `${Math.round(y)}px`;
  tipEl.dataset.lado = x >= r.right ? 'der' : 'izq';
  return true;
}
export function ocultarTip(): void {
  tipEl?.remove();
  tipEl = null;
  tipAncla = null;
}

/** Atributos de inspección de un elemento. */
export const tip = (titulo: string, cuerpo = '', pie = ''): string => `data-tip-t="${esc(titulo)}" data-tip="${esc(cuerpo)}"${pie ? ` data-tip-pie="${esc(pie)}"` : ''}`;

// ───────────── el Bufón y los Reyes ─────────────

/** El Bufón en dos capas (el cetro se mece, el cuerpo respira). */
export function bufonHtml(e: Expresion = 'reposo', cls = ''): string {
  // tres capas: el palo que se mece, el cuerpo que respira y, encima, el mismo gesto con los ojos cerrados (el parpadeo)
  const parpado = e === 'reposo' ? px('bf:parpadeo', () => bufonCapas('parpadeo').cuerpo, 'bf-cuerpo bf-parpado') : '';
  return `<div class="bufon ${cls}" data-expresion="${e}" aria-hidden="true">${px(`bf:palo`, () => bufonCapas('reposo').palo, 'bf-palo')}${px(`bf:${e}`, () => bufonCapas(e).cuerpo, 'bf-cuerpo')}${parpado}</div>`;
}
/** Cambia la expresión de un Bufón ya montado. */
export function gestoBufon(raiz: ParentNode, e: Expresion): void {
  const b = $('.bufon', raiz);
  if (!b || b.dataset.expresion === e) return;
  b.outerHTML = bufonHtml(e, b.className.replace('bufon', '').trim());
}
/** El Bufón con su bocadillo debajo: lo que dice se escribe, suena y al rato se va (ver bufon-vivo.ts). */
export function anfitrion(texto: string, e: Expresion = 'reposo', cls = ''): string {
  return `<div class="anfitrion ${cls}" data-anfitrion>${bufonHtml(e)}<p class="bocadillo" data-voz aria-live="polite">${esc(texto)}</p></div>`;
}
/** El Bufón chico de las cabeceras (Mazos, Altar, Colección, Crónica, Ajustes): asoma la cabeza y su bocadillo flota. */
export function miniAnfitrion(texto: string, e: Expresion = 'reposo'): string {
  return `<span class="lado mini-anfitrion" data-anfitrion>${bufonHtml(e)}<p class="bocadillo" data-voz aria-live="polite">${esc(texto)}</p></span>`;
}

const AURA: Record<Palo, string> = { S: '#00c8ff', C: '#22d95b', D: '#ffd500', H: '#ff1453' };
/** El retrato vivo de un Rey: su penumbra, el aura de su color y el busto que respira. */
export function reyHtml(palo: Palo, animo: Animo = 'calma', cls = ''): string {
  const id = REY_PX[palo];
  return `<div class="rey ${cls}" data-rey="${palo}" style="--aura:${AURA[palo]}" aria-hidden="true">${px(`rey:fondo:${id}:${animo === 'vencido' ? 'v' : 'c'}`, () => reyFondo(id, animo === 'vencido' ? 'vencido' : 'calma'), 'r-fondo')}<i class="r-aura"></i>${px(`rey:${id}:${animo}`, () => reyMapa(id, animo), 'r-busto')}</div>`;
}

// ───────────── piezas: nombre, efecto y sinergia ─────────────

export interface FichaPieza {
  nombre: string;
  desc: string;
  /** La línea de arriba: rareza, nivel de Cábala o Rey. */
  clase: string;
  marco: string;
}

/** Lo que se dice de una pieza (con el nivel que tendría al tomarla, si es una Bendición). */
export function fichaDe(tipo: TipoOferta, id: string, p?: Partida): FichaPieza {
  if (tipo === 'amuleto') {
    const d = AMULETO[id as AmuletoId];
    return { nombre: tx(d.nombre), desc: tx(d.desc), clase: tx(RAREZA_NOMBRE[d.rareza]), marco: d.palo === 'X' ? 'prisma' : `palo${d.palo}` };
  }
  if (tipo === 'aumento') {
    const d = AUMENTO[id as AumentoId];
    return { nombre: tx(d.nombre), desc: tx(d.desc), clase: d.maldicion ? t('maldicion') : t('unaCabala'), marco: d.nivel === 'plata' ? 'plata' : d.nivel === 'oro' ? 'dorado' : 'prisma' };
  }
  const d = BENDICION[id as BendicionId];
  const tiene = p?.bendiciones[d.id] ?? 0;
  const nivel = Math.min(d.niveles, tiene + 1);
  const rey = `${tx(REY_DEF[d.rey].apodo)}${d.dual ? ` + ${tx(REY_DEF[d.dual].apodo)}` : ''}`;
  return { nombre: tx(d.nombre), desc: tx(d.desc(nivel)), clase: d.dual ? `${t('pactoDual')} · ${rey}` : `${rey} · ${t('nivel', { n: nivel })}`, marco: `palo${d.rey}` };
}

/** La etiqueta «★ SINERGIA» de una pieza, con su micro-línea, si potencia tu Mazo o lo que ya llevás (si no, nada). */
export function sinergiaHtml(tipo: TipoOferta, id: string, p?: Partida): string {
  const s = p ? sinergia(p, tipo, id) : null;
  return s ? `<span class="sinergia-caja"><span class="chip sinergia">${pxEstrella()} ${t('sinergia')}</span><span class="micro">${esc(tx(s))}</span></span>` : '';
}

/** Espera `ms` milisegundos (0 con «Reducir movimiento» si `saltable`). */
export const esperar = (ms: number): Promise<void> => new Promise((ok) => setTimeout(ok, ms));
