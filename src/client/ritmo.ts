// El ritmo de las animaciones: con «Reducir movimiento», en modo foto (QA visual) o con `?rapido` (QA de humo), nada
// espera ni se mueve solo: cada cosa aparece ya en su sitio.
import { ajustes } from './almacen';
import { enFoto } from './fx/motor';

/** `?rapido` en la dirección: sin esperas (lo usa la QA de humo para jugar una partida entera en segundos). */
export const RAPIDO = typeof location !== 'undefined' && /[?&]rapido\b/.test(location.search);

/** ¿Hay que saltarse las animaciones? */
export const quieto = (): boolean => ajustes.calma || enFoto() || RAPIDO;

/** Las esperas en curso: TURBO (0.22) las corta todas con la próxima entrada. */
const enEspera = new Set<() => void>();

/** Espera `ms` milisegundos, o nada si todo va quieto; un toque, una tecla o un botón del mando la cortan en el acto. */
export const pausa = (ms: number): Promise<void> =>
  quieto()
    ? Promise.resolve()
    : new Promise((ok) => {
        const fin = (): void => {
          clearTimeout(reloj);
          enEspera.delete(fin);
          ok();
        };
        const reloj = setTimeout(fin, ms);
        enEspera.add(fin);
      });

/** TURBO: ninguna animación bloquea el input; la próxima entrada termina las esperas que quedaban. */
export function apurar(): void {
  for (const fin of [...enEspera]) fin();
}
if (typeof addEventListener !== 'undefined') {
  addEventListener('pointerdown', apurar, true);
  addEventListener('keydown', (ev) => void (!ev.repeat && apurar()), true);
  addEventListener('cabala:pulso', apurar);
}
