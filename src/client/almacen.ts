// Persistencia en localStorage para CÁBALA 2.0 (perfil, partida en curso y ajustes).
import type { L } from '../rules/balance';
import { fill } from '../rules/balance';
import type { Partida } from '../rules/estado';
import type { MazoId } from '../rules/mazos';
import { perfilNuevo, type Perfil } from '../rules/perfil';
import { type Idioma } from '../shared/brand';
import { EN, ES, type Clave } from './textos';

const PRE = 'cabala:';

function leer<T>(clave: string): T | null {
  try {
    const s = localStorage.getItem(PRE + clave);
    if (!s) return null;
    try {
      return JSON.parse(s) as T;
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

let efimero = false;
function escribir(clave: string, valor: unknown): void {
  if (efimero) return;
  try {
    if (valor === null) localStorage.removeItem(PRE + clave);
    else localStorage.setItem(PRE + clave, JSON.stringify(valor));
  } catch {
    // sin almacenamiento
  }
}

export interface Ajustes {
  idioma: Idioma;
  calma: boolean;
  sonido: boolean;
  musica: boolean;
}

const preferido = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
export const ajustes: Ajustes = { calma: preferido, sonido: true, musica: true, ...(leer<Partial<Ajustes>>('ajustes') ?? {}), idioma: 'es' };
export const guardarAjustes = (): void => escribir('ajustes', ajustes);

function numFinito(v: unknown, def = 0, min = 0): number {
  return typeof v === 'number' && Number.isFinite(v) && v >= min ? Math.floor(v) : def;
}

export function sanearPerfil(raw: unknown): Perfil {
  const base = perfilNuevo();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Record<string, unknown>;
  base.aprendido = typeof r.aprendido === 'boolean' ? r.aprendido : base.aprendido;
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
  return base;
}

export let perfil: Perfil = sanearPerfil(leer<unknown>('perfil'));
export const guardarPerfil = (): void => escribir('perfil', perfil);

export function cargarPartida(): Partida | null {
  const p = leer<Partida>('partida');
  if (!p || typeof p !== 'object') return null;
  if (p.v !== 2 || p.fase === 'fin') return null;
  if (typeof p.mazoId !== 'string' || !Array.isArray(p.mazo) || !Array.isArray(p.reyes)) return null;
  return p;
}
export const guardarPartida = (p: Partida | null): void => escribir('partida', p && p.fase !== 'fin' ? p : null);

export function borrarTodo(): void {
  escribir('perfil', null);
  escribir('partida', null);
  perfil = perfilNuevo();
}

export function usarPerfil(p: Perfil): void {
  perfil = p;
  efimero = true;
}

export const idioma = (): Idioma => ajustes.idioma;
export function fijarIdioma(i: Idioma): void {
  ajustes.idioma = i;
  guardarAjustes();
  document.documentElement.lang = i;
}
export const t = (clave: Clave, valores?: Record<string, string | number>): string => fill((ajustes.idioma === 'en' ? EN : ES)[clave], valores);
export const tx = (l: L | { es: string; en: string }): string => l[ajustes.idioma];
export const alAzar = <T>(lista: readonly T[], i?: number): T => lista[i !== undefined ? i % lista.length : Math.floor(Math.random() * lista.length)];
