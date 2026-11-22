// Hablar con voz: lo que dice un Rey o un Personaje se escribe letra por letra mientras lo CANTA (0.28: cada
// uno tiene el suyo, ver audio.ts). Con «Reducir movimiento», en las capturas y con `?rapido`, el texto aparece entero.
import type { VozId } from './audio';
import { enFoto } from './fx/motor';
import { cantar } from './musica';
import { quieto } from './ritmo';

const escapar = (s: string): string => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** Escribe `texto` en `el` letra por letra con la voz de `quien`. Devuelve los milisegundos que tarda. */
export function teclear(el: HTMLElement | null, texto: string, quien: VozId): number {
  if (!el) return 0;
  if (quieto()) {
    el.textContent = texto;
    return 0;
  }
  // el texto que falta ocupa su lugar sin verse: nada cambia de tamaño mientras se escribe
  el.innerHTML = `<span class="dicho"></span><span class="por-decir">${escapar(texto)}</span>`;
  const dicho = el.firstElementChild as HTMLElement;
  const falta = el.lastElementChild as HTMLElement;
  cantar(quien, texto);
  let i = 0;
  const paso = (): void => {
    if (!el.isConnected) return;
    i = Math.min(texto.length, i + 2);
    dicho.textContent = texto.slice(0, i);
    falta.textContent = texto.slice(i);
    if (i < texto.length) window.setTimeout(paso, 34);
  };
  paso();
  return Math.ceil(texto.length / 2) * 34;
}

/** Un grito corto: una exclamación cantada (a lo sumo cuatro notas) con la voz de quien grita. */
export function vocear(quien: VozId, texto: string): void {
  if (enFoto()) return;
  cantar(quien, texto, { breve: true });
}
