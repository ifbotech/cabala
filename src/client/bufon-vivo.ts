// El Bufón vivo: el anfitrión te sigue pantalla por pantalla. Al cambiar de pantalla se esfuma en una nube de humo
// (con su «puf») y reaparece en la siguiente (con su cascabel); flota y parpadea todo el tiempo; cuando habla, el
// bocadillo se escribe letra por letra con su voz, se queda un rato y se va; y si lo dejás solo, cada tanto tira una
// de las suyas. Con «Reducir movimiento» y en las capturas de la QA todo esto queda quieto y en su sitio.
import { sonar, vozBufon } from './audio';
import { humo } from './fx/efectos';
import { enFoto } from './fx/motor';
import { quieto } from './ritmo';

let relojesVida: number[] = [];
let relojesHabla: number[] = [];
const enVida = (ms: number, f: () => void): void => void relojesVida.push(window.setTimeout(f, ms));
const enHabla = (ms: number, f: () => void): void => void relojesHabla.push(window.setTimeout(f, ms));
const callar = (): void => {
  relojesHabla.forEach(clearTimeout);
  relojesHabla = [];
};

/** Lo que el Bufón dice cuando nadie le habla (lo pone main.ts, que conoce el idioma). */
let muletilla: () => string = () => '';
export const ponerMuletillas = (f: () => string): void => void (muletilla = f);

const escapar = (s: string): string => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const centro = (el: Element): { x: number; y: number; r: number } => {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, r: Math.max(r.width, r.height) / 2 };
};
const elBufon = (raiz: ParentNode = document): HTMLElement | null => raiz.querySelector<HTMLElement>('.bufon');
/** El bocadillo del anfitrión que está a la vista (el del modal, si hay uno abierto). */
const elBocadillo = (): HTMLElement | null => document.querySelector<HTMLElement>('#capa [data-anfitrion] [data-voz]') ?? document.querySelector<HTMLElement>('#app [data-anfitrion] [data-voz]');

/** Antes de cambiar de pantalla: el Bufón que estaba se esfuma en humo. */
export function esfumar(): void {
  relojesVida.forEach(clearTimeout);
  relojesVida = [];
  callar();
  if (quieto()) return;
  const b = elBufon(document.querySelector('#app') ?? document);
  if (!b) return;
  const c = centro(b);
  humo(c.x, c.y, c.r);
  sonar('puf');
}

/** Escribe un texto en el bocadillo, letra por letra y con su voz; al rato el bocadillo se va. */
function hablar(b: HTMLElement, texto: string): void {
  callar();
  b.hidden = false;
  b.classList.remove('se-va');
  const bufon = b.closest('[data-anfitrion]')?.querySelector<HTMLElement>('.bufon') ?? null;
  const irse = (ms: number): void =>
    enHabla(ms, () => {
      b.classList.add('se-va');
      enHabla(260, () => {
        b.hidden = true;
        b.classList.remove('se-va');
        esperarMuletilla();
      });
    });
  if (quieto()) {
    // sin animaciones: el texto entero, que igual se va al rato (salvo en las capturas, que lo necesitan quieto)
    b.textContent = texto;
    if (!enFoto()) irse(4200 + texto.length * 45);
    return;
  }
  // el texto que falta ocupa su lugar sin verse: el bocadillo no cambia de tamaño mientras se escribe
  b.innerHTML = `<span class="dicho"></span><span class="por-decir">${escapar(texto)}</span>`;
  const dicho = b.firstElementChild as HTMLElement;
  const falta = b.lastElementChild as HTMLElement;
  bufon?.classList.add('habla');
  let i = 0;
  const paso = (): void => {
    i = Math.min(texto.length, i + 2);
    dicho.textContent = texto.slice(0, i);
    falta.textContent = texto.slice(i);
    if (i % 4 === 0 && /\S/.test(texto[i - 1] ?? '')) vozBufon(texto.charCodeAt(i - 1));
    if (i < texto.length) enHabla(32, paso);
    else {
      bufon?.classList.remove('habla');
      irse(3000 + texto.length * 45);
    }
  };
  paso();
}

/** Si lo dejás solo, cada tanto dice algo. */
function esperarMuletilla(): void {
  enHabla(15000 + Math.random() * 9000, () => {
    const b = elBocadillo();
    const texto = muletilla();
    if (!b || !texto || quieto() || document.hidden) return esperarMuletilla();
    hablar(b, texto);
  });
}

/** El parpadeo: cada pocos segundos, un cuadro con los ojos cerrados. */
function parpadear(): void {
  enVida(2400 + Math.random() * 2800, () => {
    for (const b of document.querySelectorAll<HTMLElement>('.bufon')) {
      b.classList.add('parpadea');
      enVida(140, () => b.classList.remove('parpadea'));
    }
    parpadear();
  });
}

let ultimoTexto = '';
/**
 * Da vida al Bufón de lo que se acaba de montar (una pantalla o un modal). Con `entrada`, llega en una nube de humo
 * y con su sonido; al repintar la misma pantalla solo vuelve a hablar si tiene algo nuevo que decir.
 */
export function avivar(raiz: ParentNode, entrada: boolean): void {
  const bufon = elBufon(raiz);
  if (!bufon) return;
  const b = raiz.querySelector<HTMLElement>('[data-anfitrion] [data-voz]');
  const texto = b?.textContent?.trim() ?? '';
  // los bocadillos que flotan sobre la pantalla (cabeceras, y el Mapa del móvil) no salen en las capturas
  const mini = (!!b?.closest('.mini-anfitrion') || !!b?.closest('.mapa-bufon')) && matchMedia('(max-width: 700px)').matches;
  if (enFoto()) {
    // la captura: todo en su sitio; el bocadillo flotante de las cabeceras no tapa la pantalla
    if (b && mini) b.hidden = true;
    return;
  }
  if (!relojesVida.length && !quieto()) parpadear();
  if (!entrada) {
    if (b && texto && texto !== ultimoTexto) hablar(b, texto);
    else if (b && !relojesHabla.length) b.hidden = true;
    ultimoTexto = texto;
    return;
  }
  ultimoTexto = texto;
  if (quieto()) {
    if (b && texto) hablar(b, texto);
    return;
  }
  bufon.classList.add('ausente');
  if (b) b.hidden = true;
  enVida(110, () => {
    const c = centro(bufon);
    humo(c.x, c.y, c.r);
    sonar('bufon');
  });
  enVida(190, () => {
    bufon.classList.remove('ausente');
    bufon.classList.add('llega');
    enVida(400, () => bufon.classList.remove('llega'));
  });
  if (b && texto) enHabla(430, () => hablar(b, texto));
  else esperarMuletilla();
}

/** El Bufón dice algo ahora, en la pantalla en la que está (una reacción a lo que acabás de hacer). */
export function bufonDice(texto: string): void {
  const b = elBocadillo();
  if (!b || !texto || enFoto()) return;
  ultimoTexto = texto;
  hablar(b, texto);
}
