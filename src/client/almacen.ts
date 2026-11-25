// Lo que se guarda en el navegador (claves «cabala:*»): el perfil (Porotos, Altar, Colección, Crónica), la partida
// en curso y los ajustes. El idioma, si no hay nada guardado, sale del navegador.
import type { L } from '../rules/balance';
import { fill } from '../rules/balance';
import type { Palo } from '../rules/cartas';
import type { Partida } from '../rules/estado';
import type { MazoId } from '../rules/mazos';
import { perfilNuevo, type Perfil } from '../rules/perfil';
import { idiomaDe, type Idioma } from '../shared/brand';
import { EN, ES, type Clave } from './textos';

const PRE = 'cabala:';

function leer<T>(clave: string): T | null {
  try {
    const s = localStorage.getItem(PRE + clave);
    return s ? (JSON.parse(s) as T) : null;
  } catch {
    return null;
  }
}
/** En la QA nada se guarda: el perfil de muestra vive solo en memoria. */
let efimero = false;
function escribir(clave: string, valor: unknown): void {
  if (efimero) return;
  try {
    if (valor === null) localStorage.removeItem(PRE + clave);
    else localStorage.setItem(PRE + clave, JSON.stringify(valor));
  } catch {
    // sin almacenamiento (ventana privada): se juega igual, sin guardar
  }
}

export interface Ajustes {
  idioma: Idioma;
  /** Reducir movimiento. */
  calma: boolean;
  sonido: boolean;
  musica: boolean;
}

const preferido = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
export const ajustes: Ajustes = { idioma: idiomaDe(typeof navigator !== 'undefined' ? navigator.language : 'es'), calma: preferido, sonido: true, musica: true, ...(leer<Partial<Ajustes>>('ajustes') ?? {}) };
export const guardarAjustes = (): void => escribir('ajustes', ajustes);

export let perfil: Perfil = { ...perfilNuevo(), ...(leer<Perfil>('perfil') ?? {}) };
export const guardarPerfil = (): void => escribir('perfil', perfil);

export interface CartaGloria {
  palo: Palo;
  n: number;
  mazo: MazoId;
  reinado: number;
  fecha: number;
  temple?: number;
  brava?: boolean;
}
export let glorias: CartaGloria[] = leer<CartaGloria[]>('glorias') ?? [];
export const guardarGlorias = (): void => escribir('glorias', glorias);
export function elegirCartaGloria(p: Partida, fecha: number): CartaGloria {
  const candidatas = p.mazo.filter((c) => c.palo !== 'X');
  let mejor = candidatas[0];
  let mejorPunt = -1;
  for (const c of candidatas) {
    const punt = (c.brava ? 1000 : 0) + (c.temple ?? 0) * 20 + c.n;
    if (punt > mejorPunt) {
      mejorPunt = punt;
      mejor = c;
    }
  }
  return {
    palo: mejor && mejor.palo !== 'X' ? mejor.palo : 'D',
    n: mejor ? mejor.n : 1,
    mazo: p.mazoId,
    reinado: p.reinado,
    fecha,
    temple: mejor?.temple,
    brava: mejor?.brava,
  };
}
export function registrarCartaGloria(p: Partida, fecha: number): CartaGloria {
  const g = elegirCartaGloria(p, fecha);
  glorias = [g, ...glorias].slice(0, 6);
  guardarGlorias();
  return g;
}
export function usarGlorias(lista: CartaGloria[]): void {
  glorias = lista;
}

/** La partida en curso (null si no hay). */
export function cargarPartida(): Partida | null {
  const p = leer<Partida>('partida');
  return p && p.v === 1 && p.fase !== 'fin' ? p : null;
}
export const guardarPartida = (p: Partida | null): void => escribir('partida', p && p.fase !== 'fin' ? p : null);

/** Borra todo el progreso. */
export function borrarTodo(): void {
  escribir('perfil', null);
  escribir('partida', null);
  escribir('glorias', null);
  perfil = perfilNuevo();
  glorias = [];
}

/** Para la QA: sustituye el perfil en memoria sin tocar lo guardado. */
export function usarPerfil(p: Perfil): void {
  perfil = p;
  efimero = true;
}

// ───────────── idioma ─────────────

export const idioma = (): Idioma => ajustes.idioma;
export function fijarIdioma(i: Idioma): void {
  ajustes.idioma = i;
  guardarAjustes();
  document.documentElement.lang = i;
}
/** Un texto de la interfaz, con `{campo}` sustituido. */
export const t = (clave: Clave, valores?: Record<string, string | number>): string => fill((ajustes.idioma === 'en' ? EN : ES)[clave], valores);
/** Un texto de los datos del juego (viene en los dos idiomas). */
export const tx = (l: L | { es: string; en: string }): string => l[ajustes.idioma];
/** Una línea al azar de una lista (la voz del Bufón). `i` la fija (para la QA). */
export const alAzar = <T>(lista: readonly T[], i?: number): T => lista[i !== undefined ? i % lista.length : Math.floor(Math.random() * lista.length)];
