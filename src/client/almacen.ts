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
    if (!s) return null;
    try {
      return JSON.parse(s) as T;
    } catch {
      try {
        localStorage.setItem(`${PRE}${clave}:backup`, s);
      } catch {
        // sin espacio
      }
      return null;
    }
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

function numFinito(v: unknown, def = 0, min = 0): number {
  return typeof v === 'number' && Number.isFinite(v) && v >= min ? Math.floor(v) : def;
}

export function sanearPerfil(raw: unknown): Perfil {
  const base = perfilNuevo();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Record<string, unknown>;
  base.porotos = numFinito(r.porotos, base.porotos);
  base.aprendido = typeof r.aprendido === 'boolean' ? r.aprendido : base.aprendido;
  if (r.altar && typeof r.altar === 'object') {
    const a = r.altar as Record<string, unknown>;
    for (const k of Object.keys(base.altar) as (keyof Perfil['altar'])[]) {
      base.altar[k] = numFinito(a[k], base.altar[k]);
    }
  }
  if (r.ganado && typeof r.ganado === 'object') {
    const g = r.ganado as Record<string, unknown>;
    for (const k of Object.keys(g)) {
      if (typeof g[k] === 'number' && Number.isFinite(g[k] as number)) {
        base.ganado[k as MazoId] = Math.max(0, Math.floor(g[k] as number));
      }
    }
  }
  if (r.stats && typeof r.stats === 'object') {
    const s = r.stats as Record<string, unknown>;
    for (const k of Object.keys(base.stats) as (keyof Perfil['stats'])[]) {
      base.stats[k] = numFinito(s[k], base.stats[k]);
    }
  }
  if (Array.isArray(r.vistos)) {
    base.vistos = [...new Set(r.vistos.filter((x): x is string => typeof x === 'string'))];
  }
  if (Array.isArray(r.cronica)) {
    base.cronica = r.cronica
      .filter((x): x is Perfil['cronica'][number] => !!x && typeof x === 'object' && typeof (x as Record<string, unknown>).mazo === 'string')
      .slice(0, 20);
  }
  return base;
}

export let perfil: Perfil = sanearPerfil(leer<unknown>('perfil'));
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
  if (!p || typeof p !== 'object') return null;
  if (p.v !== 1 || p.fase === 'fin') return null;
  if (typeof p.mazoId !== 'string' || !Array.isArray(p.mazo) || !Array.isArray(p.tramos) || p.tramos.length === 0) return null;
  return p;
}
export const guardarPartida = (p: Partida | null): void => escribir('partida', p && p.fase !== 'fin' ? p : null);

/** Borra todo el progreso. */
export function borrarTodo(): void {
  escribir('perfil', null);
  escribir('partida', null);
  escribir('glorias', null);
  escribir('intros', null);
  perfil = perfilNuevo();
  glorias = [];
}

/** Exporta el progreso completo en JSON para respaldo manual. */
export function exportarProgreso(): string {
  return JSON.stringify({ v: 1, perfil, glorias, ajustes });
}

/** Importa y valida un respaldo JSON; devuelve false si no es válido. */
export function importarProgreso(json: string): boolean {
  try {
    const data = JSON.parse(json) as Record<string, unknown>;
    if (!data || typeof data !== 'object' || !data.perfil) return false;
    perfil = sanearPerfil(data.perfil);
    guardarPerfil();
    if (Array.isArray(data.glorias)) {
      glorias = data.glorias
        .filter((g): g is CartaGloria => !!g && typeof g === 'object' && typeof (g as CartaGloria).palo === 'string' && typeof (g as CartaGloria).n === 'number')
        .slice(0, 6);
      guardarGlorias();
    }
    return true;
  } catch {
    return false;
  }
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
