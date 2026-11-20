// La mano: una fila respirada de naipes grandes con física de resorte. Cada carta flota con su propio desfase, se
// levanta al elegirla y se inclina hacia el cursor; se puede ARRASTRAR una carta (o el grupo elegido) sobre el
// enemigo para golpear, o sobre el descarte para descartar. También se juega con clic, teclado y mando.
import type { Carta } from '../rules/cartas';
import { t } from './almacen';
import { quieto as todoQuieto } from './ritmo';
import { pxNaipe } from './sprites';

export type Zona = 'enemigo' | 'descarte';

export interface OyenteMano {
  /** Cambió la selección. */
  alCambiar: (ids: string[]) => void;
  /** Se soltó un arrastre sobre una zona (o en ninguna). */
  alSoltar: (zona: Zona | null, ids: string[]) => void;
  /** Mientras se arrastra: sobre qué zona está el grupo (para encender su halo). */
  alApuntar: (zona: Zona | null, ids: string[]) => void;
  /** Las cajas de las zonas donde se puede soltar. */
  zonas: () => Partial<Record<Zona, DOMRect>>;
}

interface Naipe {
  carta: Carta;
  el: HTMLButtonElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Inclinación actual y a la que tiende (grados). */
  rot: number;
  elegida: boolean;
  /** Milisegundos que le faltan para empezar a moverse (el reparto escalonado). */
  espera: number;
  /** Si está volando hacia un punto fijo de la pantalla (al golpear). */
  vuela: { x: number; y: number } | null;
}

export interface Mano {
  /** Pone la mano: las cartas nuevas entran volando desde `desde` (el Mazo). */
  poner(cartas: readonly Carta[], desde?: { x: number; y: number }): void;
  seleccion(): string[];
  elegir(ids: readonly string[]): void;
  /** Las cartas elegidas vuelan a un punto y desaparecen (el golpe). */
  volar(ids: readonly string[], a: { x: number; y: number }): Promise<void>;
  /** Sacude las cartas elegidas (jugada que no vale). */
  negar(): void;
  bloquear(si: boolean): void;
  /** Deja un grupo «en el aire» sobre un punto (para la captura de la QA). */
  posar(ids: readonly string[], x: number, y: number): void;
  destruir(): void;
}

const orden = (a: Carta, b: Carta) => Number(a.palo === 'X') - Number(b.palo === 'X') || a.n - b.n || 'SCDH'.indexOf(a.palo) - 'SCDH'.indexOf(b.palo) || a.id.localeCompare(b.id);

export function crearMano(raiz: HTMLElement, oye: OyenteMano): Mano {
  let naipes: Naipe[] = [];
  let bloqueada = false;
  let viva = true;
  let arrastre: { ids: string[]; dx: number; dy: number; x: number; y: number; zona: Zona | null } | null = null;
  let presion: { id: string; x: number; y: number; puntero: number } | null = null;
  let cursor: { x: number; y: number } | null = null;
  let ultimo = performance.now();
  let posado: { ids: string[]; x: number; y: number } | null = null;

  const kNaipe = () => Number(getComputedStyle(raiz).getPropertyValue('--k-naipe')) || 1;
  const medidas = () => {
    const k = kNaipe();
    return { w: 100 * k, h: 140 * k, k };
  };

  /** Dónde descansa cada carta: una fila centrada, sin solapes si cabe; si no, apretada lo justo. */
  function destinos(): Map<string, { x: number; y: number }> {
    const { w, h, k } = medidas();
    const ancho = raiz.clientWidth;
    const alto = raiz.clientHeight;
    const n = naipes.length;
    const hueco = Math.round(6 * k);
    const paso = n > 1 ? Math.min(w + hueco, (ancho - w) / (n - 1)) : 0;
    const total = n > 1 ? paso * (n - 1) + w : w;
    const x0 = Math.round((ancho - total) / 2);
    const base = alto - h;
    const out = new Map<string, { x: number; y: number }>();
    const sube = Math.round(18 * k);
    // si en una fila las cartas se montarían mucho (el móvil) y hay alto, van en dos filas: de la de atrás asoma la
    // parte de arriba de cada naipe (su número y sus primeras pintas) y ninguna tapa de costado a otra
    if (n > 1 && paso < w * 0.8 && alto >= h * 1.4) {
      const atras = Math.ceil(n / 2);
      const fila = (cuantas: number, desde: number, y: number): void => {
        const p2 = cuantas > 1 ? Math.min(w + hueco, (ancho - w) / (cuantas - 1)) : 0;
        const t2 = cuantas > 1 ? p2 * (cuantas - 1) + w : w;
        const x2 = Math.round((ancho - t2) / 2);
        for (let j = 0; j < cuantas; j++) {
          const c = naipes[desde + j];
          out.set(c.carta.id, { x: Math.round(x2 + j * p2), y: y - (c.elegida ? sube : 0) });
        }
      };
      fila(atras, 0, sube);
      fila(n - atras, atras, base);
      return out;
    }
    naipes.forEach((c, i) => out.set(c.carta.id, { x: Math.round(x0 + i * paso), y: base - (c.elegida ? sube : 0) }));
    return out;
  }

  const puesto = new WeakMap<HTMLElement, string>();
  function aplicar(c: Naipe, z = 0): void {
    const t = `translate3d(${Math.round(c.x)}px,${Math.round(c.y)}px,0)${Math.abs(c.rot) > 0.05 ? ` rotate(${c.rot.toFixed(1)}deg)` : ''}`;
    const clave = `${t}|${z}`;
    if (puesto.get(c.el) === clave) return;
    puesto.set(c.el, clave);
    c.el.style.transform = t;
    c.el.style.zIndex = String(z);
  }

  function cuadro(ahora: number): void {
    if (!viva) return;
    const dt = Math.min(0.033, (ahora - ultimo) / 1000);
    ultimo = ahora;
    const quieto = todoQuieto();
    const dest = destinos();
    const { k } = medidas();
    const caja = raiz.getBoundingClientRect();
    naipes.forEach((c, i) => {
      if (c.espera > 0) {
        c.espera -= dt * 1000;
        aplicar(c, i);
        return;
      }
      let tx: number;
      let ty: number;
      let trot = 0;
      let z = i;
      const enGrupo = arrastre?.ids.indexOf(c.carta.id) ?? -1;
      const enPose = posado?.ids.indexOf(c.carta.id) ?? -1;
      if (c.vuela) {
        tx = c.vuela.x - caja.left;
        ty = c.vuela.y - caja.top;
        z = 200 + i;
      } else if (arrastre && enGrupo >= 0) {
        // el grupo sigue al cursor, abierto en abanico chico
        const medio = (arrastre.ids.length - 1) / 2;
        tx = arrastre.x - caja.left - arrastre.dx + (enGrupo - medio) * 34 * k;
        ty = arrastre.y - caja.top - arrastre.dy - Math.abs(enGrupo - medio) * -4 * k;
        trot = (enGrupo - medio) * 4 + c.vx * 0.01;
        z = 100 + enGrupo;
      } else if (posado && enPose >= 0) {
        const medio = (posado.ids.length - 1) / 2;
        tx = posado.x - caja.left - 50 * k + (enPose - medio) * 34 * k;
        ty = posado.y - caja.top - 70 * k;
        trot = (enPose - medio) * 4;
        z = 100 + enPose;
      } else {
        const d = dest.get(c.carta.id)!;
        tx = d.x;
        ty = d.y;
        if (!quieto) {
          // la micro-flotación desfasada: cada carta respira a su tiempo, en píxeles enteros
          ty += Math.round(Math.sin(ahora / 520 + i * 0.9) * 1.5 * k);
          // se inclina hacia el cursor si lo tiene cerca
          if (cursor && !arrastre) {
            const cx = caja.left + c.x + 50 * k;
            const cy = caja.top + c.y + 70 * k;
            const dx = cursor.x - cx;
            const dy = cursor.y - cy;
            if (Math.abs(dx) < 90 * k && Math.abs(dy) < 120 * k) {
              trot = Math.max(-3, Math.min(3, dx / (30 * k)));
              ty -= Math.round(5 * k);
              z = 50 + i;
            }
          }
        }
      }
      if (quieto) {
        c.x = tx;
        c.y = ty;
        c.rot = trot;
        c.vx = c.vy = 0;
      } else {
        // resorte amortiguado: rápido al salir, suave al llegar
        const rig = c.vuela ? 420 : arrastre && enGrupo >= 0 ? 600 : 260;
        const amo = c.vuela ? 30 : arrastre && enGrupo >= 0 ? 36 : 24;
        c.vx += ((tx - c.x) * rig - c.vx * amo) * dt;
        c.vy += ((ty - c.y) * rig - c.vy * amo) * dt;
        c.x += c.vx * dt;
        c.y += c.vy * dt;
        c.rot += (trot - c.rot) * Math.min(1, dt * 14);
      }
      aplicar(c, z);
    });
    requestAnimationFrame(cuadro);
  }

  function marcar(): void {
    for (const c of naipes) {
      c.el.classList.toggle('elegida', c.elegida);
      c.el.setAttribute('aria-pressed', String(c.elegida));
    }
  }
  const elegidas = () => naipes.filter((c) => c.elegida).map((c) => c.carta.id);
  const alternar = (id: string) => {
    const c = naipes.find((x) => x.carta.id === id);
    if (!c || bloqueada) return;
    c.elegida = !c.elegida;
    marcar();
    oye.alCambiar(elegidas());
  };

  function zonaEn(x: number, y: number): Zona | null {
    const z = oye.zonas();
    for (const nombre of ['enemigo', 'descarte'] as Zona[]) {
      const r = z[nombre];
      if (r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return nombre;
    }
    return null;
  }

  // ── puntero: clic para elegir, arrastre para jugar
  const abajo = (ev: PointerEvent) => {
    const el = (ev.target as HTMLElement).closest<HTMLButtonElement>('.carta');
    if (!el || bloqueada || (ev.pointerType === 'mouse' && ev.button !== 0)) return;
    presion = { id: el.dataset.id!, x: ev.clientX, y: ev.clientY, puntero: ev.pointerId };
    try {
      raiz.setPointerCapture(ev.pointerId);
    } catch {
      // sin captura: los eventos siguen llegando a la mano mientras el puntero esté encima
    }
  };
  const mueve = (ev: PointerEvent) => {
    cursor = { x: ev.clientX, y: ev.clientY };
    if (!presion || ev.pointerId !== presion.puntero) return;
    if (!arrastre) {
      if (Math.hypot(ev.clientX - presion.x, ev.clientY - presion.y) < 8) return;
      // empieza el arrastre: si la carta está elegida, va todo el grupo; si no, va ella sola
      const c = naipes.find((x) => x.carta.id === presion!.id);
      if (!c) return;
      if (!c.elegida) {
        for (const o of naipes) o.elegida = false;
        c.elegida = true;
        marcar();
        oye.alCambiar(elegidas());
      }
      const caja = raiz.getBoundingClientRect();
      arrastre = { ids: elegidas(), dx: presion.x - caja.left - c.x, dy: presion.y - caja.top - c.y, x: ev.clientX, y: ev.clientY, zona: null };
      raiz.classList.add('arrastrando');
      document.body.classList.add('arrastrando');
    }
    arrastre.x = ev.clientX;
    arrastre.y = ev.clientY;
    const zona = zonaEn(ev.clientX, ev.clientY);
    if (zona !== arrastre.zona) {
      arrastre.zona = zona;
      oye.alApuntar(zona, arrastre.ids);
    }
  };
  const arriba = (ev: PointerEvent) => {
    if (!presion || ev.pointerId !== presion.puntero) return;
    const id = presion.id;
    presion = null;
    try {
      raiz.releasePointerCapture(ev.pointerId);
    } catch {
      // ya estaba suelto
    }
    if (arrastre) {
      const { zona, ids } = arrastre;
      arrastre = null;
      raiz.classList.remove('arrastrando');
      document.body.classList.remove('arrastrando');
      oye.alApuntar(null, ids);
      oye.alSoltar(zona, ids);
      return;
    }
    if (ev.type === 'pointerup') alternar(id);
  };
  const sale = () => {
    cursor = null;
  };
  const tecla = (ev: KeyboardEvent) => {
    if (ev.key !== 'Enter' && ev.key !== ' ') return;
    const el = (ev.target as HTMLElement).closest<HTMLButtonElement>('.carta');
    if (!el) return;
    ev.preventDefault();
    alternar(el.dataset.id!);
  };
  raiz.addEventListener('pointerdown', abajo);
  raiz.addEventListener('pointermove', mueve);
  raiz.addEventListener('pointerup', arriba);
  raiz.addEventListener('pointercancel', arriba);
  raiz.addEventListener('pointerleave', sale);
  raiz.addEventListener('keydown', tecla);
  raiz.addEventListener('cabala:alternar', ((ev: CustomEvent<string>) => alternar(ev.detail)) as EventListener);
  requestAnimationFrame((t) => {
    ultimo = t;
    cuadro(t);
  });

  return {
    poner(cartas, desdeMazo) {
      // en modo foto o con «Reducir movimiento» las cartas ya están en su sitio: no hay reparto que volar
      const desde = todoQuieto() ? undefined : desdeMazo;
      const caja = raiz.getBoundingClientRect();
      const viejas = new Map(naipes.map((c) => [c.carta.id, c]));
      const nuevas: Naipe[] = [];
      let recien = 0;
      for (const carta of [...cartas].sort(orden)) {
        const ya = viejas.get(carta.id);
        if (ya && ya.carta.n === carta.n && ya.carta.palo === carta.palo && !ya.vuela) {
          ya.carta = carta;
          nuevas.push(ya);
          viejas.delete(carta.id);
          continue;
        }
        const el = document.createElement('button');
        el.className = 'carta';
        el.dataset.id = carta.id;
        el.dataset.foco = `carta-${carta.id}`;
        el.dataset.palo = carta.palo;
        el.dataset.n = String(carta.n);
        el.setAttribute('aria-pressed', 'false');
        el.setAttribute('aria-label', carta.palo === 'X' ? '★' : `${carta.n} ${carta.palo}`);
        // el Comodín lleva su nombre: sin número ni palo propios, es lo que lo distingue de una carta que no se lee
        el.innerHTML = pxNaipe(carta) + (carta.palo === 'X' ? `<span class="c-rotulo">${t('comodin')}</span>` : `<span class="c-indice" data-palo="${carta.palo}" aria-hidden="true">${carta.n}</span>`) + (carta.temple ? `<span class="c-temple">+${carta.temple}${carta.templada ? '★' : ''}${carta.brava ? ' ×2' : ''}</span>` : '');
        raiz.append(el);
        const { h } = medidas();
        const x0 = desde ? desde.x - caja.left : raiz.clientWidth / 2;
        const y0 = desde ? desde.y - caja.top : raiz.clientHeight - h;
        nuevas.push({ carta, el, x: x0, y: y0, vx: 0, vy: 0, rot: desde ? -12 : 0, elegida: false, espera: desde ? recien++ * 55 : 0, vuela: null });
      }
      for (const c of viejas.values()) c.el.remove();
      naipes = nuevas;
      // el orden del DOM sigue al de la fila: el foco del teclado y del mando va de izquierda a derecha
      for (const c of naipes) raiz.append(c.el);
      marcar();
    },
    seleccion: elegidas,
    elegir(ids) {
      for (const c of naipes) c.elegida = ids.includes(c.carta.id);
      marcar();
      oye.alCambiar(elegidas());
    },
    volar(ids, a) {
      const { k } = medidas();
      const grupo = naipes.filter((c) => ids.includes(c.carta.id));
      grupo.forEach((c, i) => {
        c.vuela = { x: a.x - 50 * k + (i - (grupo.length - 1) / 2) * 10 * k, y: a.y - 70 * k };
        c.el.classList.add('volando');
      });
      const ms = todoQuieto() ? 0 : 190;
      return new Promise((ok) =>
        setTimeout(() => {
          for (const c of grupo) c.el.remove();
          naipes = naipes.filter((c) => !grupo.includes(c));
          ok();
        }, ms),
      );
    },
    negar() {
      for (const c of naipes) if (c.elegida) c.el.animate([{ marginLeft: '0' }, { marginLeft: '-6px' }, { marginLeft: '6px' }, { marginLeft: '-3px' }, { marginLeft: '0' }], { duration: 220, easing: 'steps(4)' });
    },
    bloquear(si) {
      bloqueada = si;
      raiz.classList.toggle('bloqueada', si);
    },
    posar(ids, x, y) {
      for (const c of naipes) c.elegida = ids.includes(c.carta.id);
      marcar();
      posado = { ids: [...ids], x, y };
      raiz.classList.add('arrastrando');
      document.body.classList.add('arrastrando');
      oye.alCambiar(elegidas());
      oye.alApuntar('enemigo', [...ids]);
    },
    destruir() {
      viva = false;
      document.body.classList.remove('arrastrando');
      raiz.removeEventListener('pointerdown', abajo);
      raiz.removeEventListener('pointermove', mueve);
      raiz.removeEventListener('pointerup', arriba);
      raiz.removeEventListener('pointercancel', arriba);
      raiz.removeEventListener('pointerleave', sale);
      raiz.removeEventListener('keydown', tecla);
    },
  };
}
