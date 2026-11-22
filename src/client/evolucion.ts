// Las Evoluciones (0.22) del lado de la pantalla: cuando tomar una pieza despierta un Amuleto Épico, salta el jackpot
// sobre la capa (sin pantalla nueva). (0.23) Se lee como «antes → después»: el Amuleto de siempre tiembla y se apaga,
// su forma despierta entra grande con su nombre maldito y su regla nueva en letra grande, el Bufón dice lo suyo, y al
// cerrarse la ficha vuela a su lugar en el HUD. Los primeros 400 ms no se cortan (se tragan la entrada: que se vea qué
// pasó); después, cualquier entrada lo corta en el acto (TURBO).
import type { Partida } from '../rules/estado';
import { EVOLUCION, evoluciones, type EvolucionDe } from '../rules/evoluciones';
import { AMULETO } from '../rules/amuletos';
import { t, tx } from './almacen';
import { bufonDice } from './bufon-vivo';
import { stinger } from './musica';
import { RAMPA_PALO, chispas, destello } from './fx/efectos';
import { enFoto } from './fx/motor';
import { quieto } from './ritmo';
import { pxAmuleto, pxEvolucion } from './sprites';
import { $, conMaldicion, esc } from './ui';
import { VOZ } from './voces';

/** Cuánto dura el jackpot si nadie lo corta. */
export const MS_JACKPOT = 1600;
/** Lo que no se corta: el cambio de forma tiene que verse. */
export const MS_FIRME = 400;

/** El HTML del jackpot (lo usa también la QA). */
export function jackpotHtml(de: EvolucionDe): string {
  const ev = EVOLUCION[de];
  return `<div class="evo-jackpot" role="status" aria-live="assertive">
    <div class="evo-marco marco prisma">
      <b class="evo-titulo">${esc(t('desperto', { a: tx(AMULETO[de].nombre) }))}</b>
      <div class="evo-cambio">
        <span class="evo-antes" aria-hidden="true">${pxAmuleto(de)}</span>
        <i class="evo-flecha" aria-hidden="true">▶</i>
        <span class="evo-icono">${pxEvolucion(de)}</span>
      </div>
      <b class="evo-nombre">${esc(tx(ev.nombre))}</b>
      <span class="evo-desc">${conMaldicion(tx(ev.desc))}</span>
    </div>
  </div>`;
}

/** La ficha despierta vuela del centro a su lugar en la bandeja del HUD (o a la bandeja, si todavía no se repintó). */
function volarAlHud(de: EvolucionDe, desde: DOMRect | undefined): void {
  if (!desde || quieto() || enFoto()) return;
  const destino = $(`[data-tiras] [data-pieza="a:${de}"]`) ?? $('[data-tiras]');
  const capa = $('#capa');
  if (!destino || !capa) return;
  const a = destino.getBoundingClientRect();
  const vuela = document.createElement('span');
  vuela.className = 'evo-vuela';
  vuela.innerHTML = pxEvolucion(de);
  vuela.style.left = `${desde.left}px`;
  vuela.style.top = `${desde.top}px`;
  vuela.style.width = `${desde.width}px`;
  vuela.style.height = `${desde.height}px`;
  capa.appendChild(vuela);
  const dx = a.left + a.width / 2 - (desde.left + desde.width / 2);
  const dy = a.top + a.height / 2 - (desde.top + desde.height / 2);
  const s = Math.max(0.2, Math.min(1, a.height / desde.height));
  const anim = vuela.animate(
    [
      { transform: 'translate(0, 0) scale(1)' },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 40}px) scale(${(1 + s) / 2})`, offset: 0.5 },
      { transform: `translate(${dx}px, ${dy}px) scale(${s})` },
    ],
    { duration: 420, easing: 'steps(7)' },
  );
  anim.onfinish = () => {
    vuela.remove();
    destino.classList.remove('sube');
    void destino.offsetWidth;
    destino.classList.add('sube');
    destello(a.left + a.width / 2, a.top + a.height / 2, RAMPA_PALO.D, 10);
  };
}

/** Muestra el jackpot de una Evolución; se resuelve al terminar o al primer toque, tecla o botón del mando tras lo firme. */
export function jackpotEvolucion(de: EvolucionDe): Promise<void> {
  const capa = $('#capa');
  if (!capa) return Promise.resolve();
  capa.insertAdjacentHTML('beforeend', jackpotHtml(de));
  const el = capa.lastElementChild as HTMLElement;
  if (quieto()) el.classList.add('quieto');
  stinger('evolucion');
  bufonDice(tx(VOZ.evoluciona[de]));
  const icono = (): DOMRect | undefined => el.querySelector('.evo-icono .px')?.getBoundingClientRect();
  if (!quieto()) {
    // las chispas salen cuando entra la forma nueva (el antes ya se apagó)
    window.setTimeout(() => {
      const r = icono();
      if (!r || !el.isConnected) return;
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;
      destello(x, y, RAMPA_PALO.D, 26);
      for (const palo of ['S', 'C', 'D', 'H'] as const) chispas(x, y, RAMPA_PALO[palo], 8, 110);
    }, enFoto() ? 0 : 260);
  }
  // (la foto de la QA lo deja quieto en pantalla)
  if (enFoto()) return Promise.resolve();
  const t0 = performance.now();
  return new Promise((ok) => {
    let hecho = false;
    const fin = (): void => {
      if (hecho) return;
      hecho = true;
      clearTimeout(reloj);
      removeEventListener('keydown', saltar, true);
      removeEventListener('pointerdown', saltar, true);
      removeEventListener('cabala:pulso', saltar);
      const desde = icono();
      el.remove();
      volarAlHud(de, desde);
      ok();
    };
    const saltar = (ev: Event): void => {
      // (la entrada que lo corta no hace nada más: ni la tecla, ni el toque, ni el botón del mando; en lo firme, tampoco
      // lo corta: se la traga)
      ev.preventDefault();
      ev.stopPropagation();
      if (performance.now() - t0 >= MS_FIRME) fin();
    };
    addEventListener('keydown', saltar, true);
    addEventListener('pointerdown', saltar, true);
    addEventListener('cabala:pulso', saltar);
    const reloj = window.setTimeout(fin, MS_JACKPOT);
  });
}

/**
 * Para envolver lo que toma una pieza: anota las Evoluciones despiertas antes y, después, festeja las nuevas (una
 * por vez). Devuelve una promesa que se resuelve cuando terminaron (o enseguida, si no despertó ninguna).
 */
export function vigilarEvoluciones(p: Partida): () => Promise<void> {
  const antes = evoluciones(p);
  return async () => {
    for (const de of evoluciones(p)) if (!antes.includes(de)) await jackpotEvolucion(de);
  };
}
