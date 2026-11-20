// El HUD del jugador: una barra cincelada anclada abajo, con el retrato vivo del Personaje en el centro (mira a los
// lados, parpadea, se lastima según la Vida que le queda, sonríe feroz al clavar un canto y hace una mueca al
// recibir el Contraataque) y a sus lados la Vida, el Escudo, el oro, el Mazo y las tiras de Amuletos, Cábalas y
// Bendiciones con sus cargas. Todo se inspecciona al pasar el cursor o el foco.
import { vocear } from './habla';
import type { MazoId } from '../rules/mazos';
import { AMULETO, RAREZA_NOMBRE } from '../rules/amuletos';
import { AUMENTO, NIVEL_NOMBRE } from '../rules/aumentos';
import { PALOS } from '../rules/cartas';
import type { Palo } from '../rules/cartas';
import { carga, sirveA } from '../rules/estado';
import type { Partida } from '../rules/estado';
import { MAZO } from '../rules/mazos';
import { BENDICION, REY_DEF } from '../rules/reyes';
import type { BendicionId } from '../rules/reyes';
import { ajustes, t, tx } from './almacen';
import { enFoto } from './fx/motor';
import type { Cuadro, Gesto, Herida, Mirada } from './pixel/personajes';
import { cifra, pxAmuleto, pxAumento, pxBendicion, pxHud, pxPalo, urlRetrato } from './sprites';
import { PALO_NOMBRE } from './textos';
import { $, tip } from './ui';

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

function tiras(p: Partida): string {
  // solo lo que llevás (los huecos libres se cuentan en «LO QUE LLEVÁS»: un cuadro vacío parecía un error de carga)
  const amuletos = p.amuletos.map((id) => {
    const d = AMULETO[id];
    return `<span class="ficha" data-pieza="a:${id}" ${tip(tx(d.nombre), tx(d.desc), tx(RAREZA_NOMBRE[d.rareza]))}>${pxAmuleto(id)}</span>`;
  }).join('');
  const aumentos = p.aumentos
    .map((id) => {
      const d = AUMENTO[id];
      return `<span class="ficha" data-pieza="u:${id}" ${tip(tx(d.nombre), tx(d.desc), d.maldicion ? t('maldicion') : tx(NIVEL_NOMBRE[d.nivel]))}>${pxAumento(id)}</span>`;
    })
    .join('');
  const cargas = PALOS.filter((s) => sirveA(p, s))
    .map((s) => {
      const r = REY_DEF[s];
      const regla = ajustes.idioma === 'en' ? `+1 for each enemy you take down with ${PALO_NOMBRE[s].en} in the hit.` : `+1 por cada enemigo que abatís con ${PALO_NOMBRE[s].es} en el golpe.`;
      return `<span class="ficha carga" data-carga="${s}" ${tip(`${tx(r.carga)} ${carga(p, s)}`, tx(r.cargaDa), regla)}>${pxPalo(s)}${cifra(carga(p, s), 'oro')}</span>`;
    })
    .join('');
  const bendiciones = (Object.keys(p.bendiciones) as BendicionId[])
    .map((id) => {
      const d = BENDICION[id];
      const n = p.bendiciones[id] ?? 1;
      return `<span class="ficha" data-pieza="b:${id}" ${tip(tx(d.nombre), tx(d.desc(n)), `${tx(REY_DEF[d.rey].apodo)}${d.niveles > 1 ? ` · ${t('nivel', { n })}` : ''}`)}>${pxBendicion(id)}${d.niveles > 1 && n > 1 ? `<span class="cuenta">${cifra(n, 'hueso')}</span>` : ''}</span>`;
    })
    .join('');
  if (!amuletos && !aumentos && !cargas && !bendiciones) return `<span class="sub hud-nada">${t('llevas')}: ${t('nada')}</span>`;
  return `<div class="hud-tira" data-tira="amuletos">${amuletos}${aumentos}</div><div class="hud-tira" data-tira="reyes">${cargas}${bendiciones}</div>`;
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
      <div class="hud-pozo" data-hud-escudo ${tip(t('escudo'), ajustes.idioma === 'en' ? 'Blocks the Counterattack before your Health.' : 'Frena el Contraataque antes que tu Vida.')}>
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
      <button class="hud-tiras" data-tiras data-accion="ver-piezas" data-foco="hud-piezas" aria-label="${t('verLlevas')}">${tiras(p)}</button>
    </div>
  </footer>`;
}

/** Repinta las tiras (Amuletos, Cábalas, cargas y Bendiciones) y marca la carga que acaba de subir. */
export function actualizarTiras(p: Partida, sube?: Palo): void {
  const el = $('[data-tiras]');
  if (!el) return;
  el.innerHTML = tiras(p);
  if (sube) $(`[data-carga="${sube}"]`, el)?.classList.add('sube');
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
}
let vivo: Vivo | null = null;

function pintarCara(): void {
  if (!vivo) return;
  const el = $<HTMLElement>('[data-cara]');
  if (!el) return;
  const [vida, max] = vivo.vida();
  const ahora = performance.now();
  let gesto: Gesto = vivo.gesto && ahora < vivo.hasta ? vivo.gesto : 'neutro';
  if (vida <= 0) gesto = 'caido';
  else if (gesto === 'neutro' && ahora < vivo.parpadea) gesto = 'parpadeo';
  const c: Cuadro = { mirada: gesto === 'neutro' ? vivo.mirada : 0, gesto, herida: gesto === 'caido' ? 2 : heridaDe(vida, max) };
  const u = `url(${urlRetrato(vivo.p.mazoId, c)})`;
  if (el.style.backgroundImage !== u) el.style.backgroundImage = u;
}

/**
 * Da vida al retrato del HUD: mira a los lados, parpadea y refleja la Vida. `vida` devuelve [Vida, máxima] tal como
 * las enseña la pantalla en ese momento.
 */
export function avivarRetrato(p: Partida, vida: () => [number, number] = () => [p.vida, p.vidaMax]): void {
  apagarRetrato();
  vivo = { p, vida, gesto: null, hasta: 0, mirada: 0, cambia: performance.now() + 1800, parpadea: 0, reloj: 0 };
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
/** Un gesto que dura un rato: `feroz` al clavar un canto o un Golpe exacto, `mueca` al recibir el Contraataque. */
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

/** El Personaje grita algo: un bocadillo corto sobre su retrato, con su voz, que se va solo. */
export function gritar(mazo: MazoId, texto: string): void {
  const retrato = $('.hud-retrato');
  if (!retrato || !texto || enFoto()) return;
  document.querySelector('.hud-grito')?.remove();
  const r = retrato.getBoundingClientRect();
  const b = document.createElement('p');
  b.className = 'bocadillo sin-cola hud-grito';
  b.textContent = texto;
  // dentro de la pantalla aunque el retrato esté en una esquina (móvil)
  const x = Math.max(80, Math.min(innerWidth - 80, r.left + r.width / 2));
  b.style.left = `${Math.round(x)}px`;
  b.style.top = `${Math.round(r.top - 6)}px`;
  ($('#capa') ?? document.body).append(b);
  vocear(mazo, texto);
  // el retrato da un salto al gritar
  retrato.classList.remove('grita');
  void retrato.offsetWidth;
  retrato.classList.add('grita');
  window.setTimeout(() => b.remove(), 1500);
}
