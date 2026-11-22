// Las Evoluciones (0.22) del lado de la pantalla: cuando tomar una pieza despierta un Amuleto Épico, salta el jackpot
// —1,2 s, el Amuleto prismático al centro con su nombre maldito, una fanfarria y un estallido de chispas de todos los
// colores— que cualquier entrada corta en el acto (TURBO: nunca hace esperar). Sin pantalla nueva: va sobre la capa.
import type { Partida } from '../rules/estado';
import { EVOLUCION, evoluciones, type EvolucionDe } from '../rules/evoluciones';
import { AMULETO } from '../rules/amuletos';
import { t, tx } from './almacen';
import { sonar } from './audio';
import { RAMPA_PALO, chispas, destello } from './fx/efectos';
import { enFoto } from './fx/motor';
import { quieto } from './ritmo';
import { pxAmuleto } from './sprites';
import { $, esc } from './ui';

/** Cuánto dura el jackpot si nadie lo corta. */
export const MS_JACKPOT = 1200;

/** El HTML del jackpot (lo usa también la QA). */
export function jackpotHtml(de: EvolucionDe): string {
  const ev = EVOLUCION[de];
  return `<div class="evo-jackpot" role="status" aria-live="assertive">
    <div class="evo-marco marco prisma">
      <b class="evo-titulo">${esc(t('desperto', { a: tx(AMULETO[de].nombre) }))}</b>
      <span class="evo-icono">${pxAmuleto(de, 'prisma')}</span>
      <b class="evo-nombre">${esc(tx(ev.nombre))}</b>
      <span class="evo-desc">${esc(tx(ev.desc))}</span>
    </div>
  </div>`;
}

/** Muestra el jackpot de una Evolución; se resuelve al terminar o al primer toque, tecla o botón del mando. */
export function jackpotEvolucion(de: EvolucionDe): Promise<void> {
  const capa = $('#capa');
  if (!capa) return Promise.resolve();
  capa.insertAdjacentHTML('beforeend', jackpotHtml(de));
  const el = capa.lastElementChild as HTMLElement;
  sonar('evolucion');
  if (!quieto()) {
    const r = el.querySelector('.evo-icono')?.getBoundingClientRect();
    if (r) {
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;
      destello(x, y, RAMPA_PALO.D, 26);
      for (const palo of ['S', 'C', 'D', 'H'] as const) chispas(x, y, RAMPA_PALO[palo], 8, 110);
    }
  }
  // (la foto de la QA lo deja quieto en pantalla)
  if (enFoto()) return Promise.resolve();
  return new Promise((ok) => {
    let hecho = false;
    const fin = (): void => {
      if (hecho) return;
      hecho = true;
      clearTimeout(reloj);
      removeEventListener('keydown', saltar, true);
      removeEventListener('pointerdown', saltar, true);
      removeEventListener('cabala:pulso', saltar);
      el.remove();
      ok();
    };
    const saltar = (ev: Event): void => {
      if (ev.type === 'keydown') ev.preventDefault();
      ev.stopPropagation();
      fin();
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
