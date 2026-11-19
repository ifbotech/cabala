// El ritmo de las animaciones: con «Reducir movimiento», en modo foto (QA visual) o con `?rapido` (QA de humo), nada
// espera ni se mueve solo: cada cosa aparece ya en su sitio.
import { ajustes } from './almacen';
import { enFoto } from './fx/motor';

/** `?rapido` en la dirección: sin esperas (lo usa la QA de humo para jugar una partida entera en segundos). */
export const RAPIDO = typeof location !== 'undefined' && /[?&]rapido\b/.test(location.search);

/** ¿Hay que saltarse las animaciones? */
export const quieto = (): boolean => ajustes.calma || enFoto() || RAPIDO;

/** Espera `ms` milisegundos, o nada si todo va quieto. */
export const pausa = (ms: number): Promise<void> => (quieto() ? Promise.resolve() : new Promise((ok) => setTimeout(ok, ms)));
