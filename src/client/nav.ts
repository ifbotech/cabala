// Teclado y mando, sin huecos: las flechas (o la cruceta y la palanca del mando) mueven el foco hacia donde apuntan;
// Enter, Espacio o A activan; Escape o B vuelven; G / X golpea, D / Y descarta, E arma el Engaño y Start abre el menú.
import { $, $$, atras, hayModal } from './ui';

const FOCO = 'button:not(:disabled):not([aria-disabled="true"]), [tabindex="0"]';

function visibles(): HTMLElement[] {
  const raiz = hayModal() ? $('#capa .velo')! : $('#app')!;
  return $$(FOCO, raiz).filter((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden';
  });
}

/** Mueve el foco al elemento más cercano en esa dirección. */
export function mover(dx: number, dy: number): void {
  const lista = visibles();
  if (!lista.length) return;
  const actual = document.activeElement as HTMLElement | null;
  if (!actual || !lista.includes(actual)) {
    (lista.find((el) => el.dataset.inicio !== undefined) ?? lista[0]).focus();
    return;
  }
  const a = actual.getBoundingClientRect();
  const ax = a.left + a.width / 2;
  const ay = a.top + a.height / 2;
  let mejor: HTMLElement | null = null;
  let nota = Infinity;
  for (const el of lista) {
    if (el === actual) continue;
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const adelante = (x - ax) * dx + (y - ay) * dy;
    if (adelante <= 4) continue;
    const costado = Math.abs((x - ax) * dy) + Math.abs((y - ay) * dx);
    const n = adelante + costado * 2.2;
    if (n < nota) {
      nota = n;
      mejor = el;
    }
  }
  mejor?.focus();
  mejor?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

let conTeclado = false;
/** Si se viene jugando con teclado o mando (sin ratón ni dedo): entonces el foco va solo a lo principal de cada pantalla. */
export const porTeclado = (): boolean => conTeclado;

/** Activa lo que tiene el foco (una carta se alterna; un botón se pulsa). */
function activar(): void {
  const el = document.activeElement as HTMLElement | null;
  if (!el || el === document.body) {
    mover(1, 0);
    return;
  }
  if (el.classList.contains('carta')) el.parentElement?.dispatchEvent(new CustomEvent('cabala:alternar', { detail: el.dataset.id }));
  else el.click();
}

const atajo = (tecla: string): boolean => {
  const el = $<HTMLButtonElement>(`[data-tecla="${tecla}"]`);
  if (!el || el.disabled) return false;
  el.click();
  return true;
};

export function iniciarNav(): void {
  document.addEventListener('keydown', (ev) => {
    if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
    const k = ev.key;
    const dir: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (dir[k]) {
      ev.preventDefault();
      mover(...dir[k]);
    } else if (k === 'Escape') {
      ev.preventDefault();
      atras();
    } else if (k === 'g' || k === 'd' || k === 'e' || k === 'j') {
      if (atajo(k)) ev.preventDefault();
    }
  });
  // al cambiar de pantalla, el foco va a lo principal (si se viene jugando sin ratón)
  document.addEventListener('keydown', () => (conTeclado = true), true);
  document.addEventListener('pointerdown', () => (conTeclado = false), true);
  document.addEventListener('cabala:pantalla', () => {
    if (conTeclado) requestAnimationFrame(() => (visibles().find((el) => el.dataset.inicio !== undefined) ?? visibles()[0])?.focus());
  });

  // el mando: se lee una vez por cuadro; cada botón actúa al pulsarse, y la dirección repite si se mantiene
  const antes: boolean[] = [];
  let repite = 0;
  const leer = (ahora: number) => {
    const mando = [...(navigator.getGamepads?.() ?? [])].find((g) => g && g.connected);
    if (mando) {
      const b = mando.buttons.map((x) => x.pressed);
      const recien = (i: number) => b[i] && !antes[i];
      const ex = mando.axes[0] ?? 0;
      const ey = mando.axes[1] ?? 0;
      const dx = b[14] || ex < -0.5 ? -1 : b[15] || ex > 0.5 ? 1 : 0;
      const dy = b[12] || ey < -0.5 ? -1 : b[13] || ey > 0.5 ? 1 : 0;
      if (dx || dy) {
        if (ahora > repite) {
          conTeclado = true;
          mover(dx, dx ? 0 : dy);
          repite = ahora + (repite ? 150 : 320);
        }
      } else repite = 0;
      if (recien(0)) {
        conTeclado = true;
        activar();
      }
      if (recien(1)) atras();
      if (recien(2)) atajo('g');
      if (recien(3)) atajo('d');
      if (recien(9)) $<HTMLButtonElement>('[data-accion="menu"]')?.click();
      for (let i = 0; i < b.length; i++) antes[i] = b[i];
    }
    requestAnimationFrame(leer);
  };
  requestAnimationFrame(leer);
}
