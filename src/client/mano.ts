// Mano limpia para CÁBALA 2.0: fila centrada sin Postas ni recortes.
// Las cartas elegidas se levantan en su lugar; se arrastran sobre el enemigo para golpear o al descarte para descartar.
import type { Carta } from '../rules/cartas';
import { t } from './almacen';
import { quieto as todoQuieto } from './ritmo';
import { pxNaipe } from './sprites';

export type Zona = 'enemigo' | 'descarte';

export interface OyenteMano {
  alCambiar: (ids: string[]) => void;
  alSoltar: (zona: Zona | null, ids: string[]) => void;
  alApuntar: (zona: Zona | null, ids: string[]) => void;
  zonas: () => Partial<Record<Zona, DOMRect>>;
  acomodar?: (ids: string[]) => number[] | null;
}

export interface MarcasPano {
  chispas: number[];
  escalon: number;
}

export interface Mano {
  poner(cartas: readonly Carta[], desde?: { x: number; y: number }): void;
  seleccion(): string[];
  postaDe(id: string): number;
  elegir(ids: readonly string[], postas?: readonly number[]): void;
  correr(id: string, dir: -1 | 1): boolean;
  marcar(m: MarcasPano): void;
  subir(px: number): void;
  panoIzq(): number | null;
  panoDer(): number | null;
  ajustar(): void;
  volar(ids: readonly string[], a: { x: number; y: number }): Promise<void>;
  negar(): void;
  bloquear(si: boolean): void;
  posar(ids: readonly string[], x: number, y: number): void;
  arrastrarA(id: string, posta: number): void;
  destruir(): void;
}

interface Naipe {
  carta: Carta;
  el: HTMLButtonElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  esc: number;
  elegida: boolean;
  espera: number;
  vuela: { x: number; y: number } | null;
}

const MAX_SEL = 5;
const ALZA = 54;
const UMBRAL = 8;
const UMBRAL_DEDO = 14;
const RESBALON = 28;
const ESCALA_DEDO = 0.82;

const orden = (a: Carta, b: Carta): number =>
  Number(a.palo === 'X') - Number(b.palo === 'X') || a.n - b.n || 'SCDH'.indexOf(a.palo) - 'SCDH'.indexOf(b.palo) || a.id.localeCompare(b.id);

function vibrar(): void {
  if (todoQuieto()) return;
  const nav = navigator as Navigator & { userActivation?: { hasBeenActive: boolean } };
  if (nav.userActivation && !nav.userActivation.hasBeenActive) return;
  try {
    nav.vibrate?.(8);
  } catch {
    // sin vibración
  }
}

export function crearMano(raiz: HTMLElement, oye: OyenteMano, _nPostas = 3): Mano {
  let naipes: Naipe[] = [];
  let ordenSel: string[] = [];
  let bloqueada = false;
  let viva = true;
  let arrastre: {
    ids: string[];
    dx: number;
    dy: number;
    x: number;
    y: number;
    zona: Zona | null;
    tactil: boolean;
    alza: number;
    previa: string[];
    lejos: number;
  } | null = null;
  let presion: { id: string; x: number; y: number; puntero: number } | null = null;
  let cursor: { x: number; y: number } | null = null;
  let posado: { ids: string[]; x: number; y: number } | null = null;
  let ultimo = performance.now();

  const medidas = () => {
    const k = Number(getComputedStyle(raiz).getPropertyValue('--k-naipe')) || 1;
    return { k, w: 100 * k, h: 140 * k };
  };

  const telefono = (): boolean => innerWidth <= 760;

  function destinos(): Map<string, { x: number; y: number }> {
    const { k, w, h } = medidas();
    const ancho = Math.max(w, raiz.clientWidth || innerWidth);
    const alto = Math.max(h, raiz.clientHeight || 160);
    const tel = telefono();
    const levanta = tel ? 16 : 24;
    const baseY = Math.max(levanta + 2, alto - h - 4);
    const out = new Map<string, { x: number; y: number }>();
    const N = naipes.length;
    if (!N) return out;

    const ent = document.documentElement.dataset.entrada;
    const foco = ent === 'teclado' || ent === 'mando' ? document.activeElement : null;

    const ponerFila = (fila: Naipe[], yFila: number): void => {
      const m = fila.length;
      if (!m) return;
      const gap = Math.round(8 * k);
      const pasoBase = m > 1 ? Math.min(w + gap, Math.max(24, (ancho - w - 8) / (m - 1))) : 0;
      const gaps = new Array(Math.max(0, m - 1)).fill(pasoBase);
      const fi = fila.findIndex((c) => c.el === foco);
      if (fi >= 0 && fi < m - 1 && pasoBase < w + gap - 1 && !arrastre) {
        const minPaso = Math.max(24, Math.round(w * 0.45));
        const abre = Math.min(w + gap, Math.max(pasoBase, ancho - w - 8 - minPaso * Math.max(0, m - 2)));
        const resto = m > 2 ? Math.max(minPaso, (ancho - w - 8 - abre) / (m - 2)) : 0;
        for (let j = 0; j < gaps.length; j++) gaps[j] = j === fi ? abre : resto;
      }
      const total = w + gaps.reduce((a, b) => a + b, 0);
      let x = (ancho - total) / 2;
      fila.forEach((c, j) => {
        const y = c.elegida ? Math.max(2, yFila - levanta) : yFila;
        out.set(c.carta.id, { x: Math.round(x), y: Math.round(y) });
        x += gaps[j] ?? 0;
      });
    };

    const pasoUna = N > 1 ? (ancho - w - 8) / (N - 1) : w;
    const dosFilas = tel && N >= 6 && pasoUna < w * 0.52;
    raiz.classList.toggle('dos-filas', dosFilas);

    if (dosFilas) {
      const atras = Math.ceil(N / 2);
      const salto = Math.max(36, Math.round(h * 0.44));
      ponerFila(naipes.slice(0, atras), Math.max(levanta + 2, baseY - salto));
      ponerFila(naipes.slice(atras), baseY);
    } else {
      ponerFila(naipes, baseY);
    }
    return out;
  }

  const puesto = new WeakMap<HTMLElement, string>();
  function aplicar(c: Naipe, z: number): void {
    const tr = `translate3d(${Math.round(c.x)}px,${Math.round(c.y)}px,0)${Math.abs(c.rot) > 0.05 ? ` rotate(${c.rot.toFixed(1)}deg)` : ''}${c.esc < 0.995 ? ` scale(${c.esc.toFixed(2)})` : ''}`;
    const clave = `${tr}|${z}`;
    if (puesto.get(c.el) === clave) return;
    puesto.set(c.el, clave);
    c.el.style.transform = tr;
    c.el.style.zIndex = String(z);
  }

  function cuadro(ahora: number): void {
    if (!viva) return;
    const dt = Math.min(0.033, (ahora - ultimo) / 1000);
    ultimo = ahora;
    const quieto = todoQuieto();
    const dest = destinos();
    const { k, w, h } = medidas();
    const caja = raiz.getBoundingClientRect();
    const foco = document.activeElement;

    naipes.forEach((c, i) => {
      if (c.espera > 0) {
        c.espera -= dt * 1000;
        aplicar(c, 10 + i);
        return;
      }
      let tx: number;
      let ty: number;
      let trot = 0;
      let tesc = 1;
      let z = c.elegida ? 45 + i : 10 + i;

      const enGrupo = arrastre?.ids.indexOf(c.carta.id) ?? -1;
      const enPose = posado?.ids.indexOf(c.carta.id) ?? -1;

      if (c.vuela) {
        tx = c.vuela.x - caja.left;
        ty = c.vuela.y - caja.top;
        z = 200 + i;
      } else if (arrastre && enGrupo >= 0) {
        const medio = (arrastre.ids.length - 1) / 2;
        tx = arrastre.x - caja.left - arrastre.dx + (enGrupo - medio) * 28 * k;
        const dy = arrastre.dy + (h / 2 + ALZA - arrastre.dy) * (arrastre.alza / ALZA);
        ty = arrastre.y - caja.top - dy;
        if (arrastre.tactil) tesc = 1 - (1 - ESCALA_DEDO) * (arrastre.alza / ALZA);
        trot = (enGrupo - medio) * 4;
        z = 120 + enGrupo;
      } else if (posado && enPose >= 0) {
        const medio = (posado.ids.length - 1) / 2;
        tx = posado.x - caja.left - w / 2 + (enPose - medio) * 28 * k;
        ty = posado.y - caja.top - h / 2;
        trot = (enPose - medio) * 4;
        z = 120 + enPose;
      } else {
        const d = dest.get(c.carta.id) ?? { x: 0, y: 0 };
        tx = d.x;
        ty = d.y;
        if (!quieto) {
          ty += Math.round(Math.sin(ahora / 560 + i * 0.85) * 1.2 * k);
          if (cursor && !arrastre && !c.elegida) {
            const cx = caja.left + c.x + w / 2;
            const cy = caja.top + c.y + h / 2;
            const dx = cursor.x - cx;
            const dy = cursor.y - cy;
            if (Math.abs(dx) < 85 * k && Math.abs(dy) < 110 * k) {
              trot = Math.max(-3, Math.min(3, dx / (28 * k)));
              ty -= Math.round(5 * k);
              z = 30 + i;
            }
          }
        }
        if (foco === c.el) z = 65;
      }

      if (quieto) {
        c.x = tx;
        c.y = ty;
        c.rot = trot;
        c.esc = tesc;
        c.vx = c.vy = 0;
      } else {
        const rig = c.vuela ? 420 : arrastre && enGrupo >= 0 ? 580 : 280;
        const amo = c.vuela ? 30 : arrastre && enGrupo >= 0 ? 36 : 25;
        c.vx += ((tx - c.x) * rig - c.vx * amo) * dt;
        c.vy += ((ty - c.y) * rig - c.vy * amo) * dt;
        c.x += c.vx * dt;
        c.y += c.vy * dt;
        c.rot += (trot - c.rot) * Math.min(1, dt * 14);
        c.esc += (tesc - c.esc) * Math.min(1, dt * 18);
      }

      aplicar(c, z);
    });

    requestAnimationFrame(cuadro);
  }

  function sincronizar(): void {
    const vivos = new Set(naipes.map((c) => c.carta.id));
    ordenSel = ordenSel.filter((id) => vivos.has(id));
    for (const c of naipes) {
      c.elegida = ordenSel.includes(c.carta.id);
      c.el.classList.toggle('elegida', c.elegida);
      c.el.setAttribute('aria-pressed', String(c.elegida));
    }
  }

  const cambio = (): void => {
    sincronizar();
    oye.alCambiar([...ordenSel]);
  };

  function alternar(id: string): void {
    const c = naipes.find((x) => x.carta.id === id);
    if (!c || bloqueada) return;
    const idx = ordenSel.indexOf(id);
    if (idx >= 0) ordenSel.splice(idx, 1);
    else if (ordenSel.length < MAX_SEL) ordenSel.push(id);
    else {
      c.el.animate([{ marginTop: '0' }, { marginTop: '-6px' }, { marginTop: '0' }], { duration: 160, easing: 'steps(3)' });
      return;
    }
    cambio();
  }

  function zonaEn(x: number, y: number, alza = 0): Zona | null {
    const z = oye.zonas();
    const dentro = (r: DOMRect | undefined, py: number): boolean => !!r && r.width > 0 && r.height > 0 && x >= r.left && x <= r.right && py >= r.top && py <= r.bottom;
    if (dentro(z.enemigo, y) || (alza > 0 && dentro(z.enemigo, y - alza))) return 'enemigo';
    if (dentro(z.descarte, y)) return 'descarte';
    return null;
  }

  function soltarGrupo(jugar = true): { zona: Zona | null; ids: string[]; tactil: boolean; resbalon: boolean } | null {
    if (!arrastre) return null;
    const { zona, ids, tactil, previa, lejos } = arrastre;
    arrastre = null;
    raiz.classList.remove('arrastrando');
    document.body.classList.remove('arrastrando');
    oye.alApuntar(null, ids);
    if ((!zona || !jugar) && !bloqueada) {
      ordenSel = [...previa];
      cambio();
    }
    return { zona, ids, tactil, resbalon: tactil && !zona && lejos < RESBALON };
  }

  const abajo = (ev: PointerEvent) => {
    const el = (ev.target as HTMLElement).closest<HTMLButtonElement>('.carta');
    if (!el || bloqueada || (ev.pointerType === 'mouse' && ev.button !== 0)) return;
    presion = { id: el.dataset.id!, x: ev.clientX, y: ev.clientY, puntero: ev.pointerId };
    try {
      raiz.setPointerCapture(ev.pointerId);
    } catch {
      // sin captura
    }
  };

  const mueve = (ev: PointerEvent) => {
    cursor = { x: ev.clientX, y: ev.clientY };
    if (!presion || ev.pointerId !== presion.puntero) return;
    if (!arrastre) {
      if (Math.hypot(ev.clientX - presion.x, ev.clientY - presion.y) < (ev.pointerType === 'touch' ? UMBRAL_DEDO : UMBRAL)) return;
      const c = naipes.find((x) => x.carta.id === presion!.id);
      if (!c) return;
      const previa = [...ordenSel];
      if (!c.elegida) {
        ordenSel = [c.carta.id];
        cambio();
      }
      const caja = raiz.getBoundingClientRect();
      arrastre = {
        ids: [...ordenSel],
        dx: presion.x - caja.left - c.x,
        dy: presion.y - caja.top - c.y,
        x: ev.clientX,
        y: ev.clientY,
        zona: null,
        tactil: ev.pointerType === 'touch',
        alza: 0,
        previa,
        lejos: 0,
      };
      raiz.classList.add('arrastrando');
      document.body.classList.add('arrastrando');
    }
    arrastre.x = ev.clientX;
    arrastre.y = ev.clientY;
    arrastre.lejos = Math.max(arrastre.lejos, Math.hypot(ev.clientX - presion.x, ev.clientY - presion.y));
    if (arrastre.tactil) arrastre.alza = Math.max(arrastre.alza, Math.min(ALZA, Math.hypot(ev.clientX - presion.x, ev.clientY - presion.y) * 1.4));
    const zona = zonaEn(ev.clientX, ev.clientY, arrastre.alza);
    if (zona !== arrastre.zona) {
      arrastre.zona = zona;
      oye.alApuntar(zona, arrastre.ids);
      if (zona && arrastre.tactil) vibrar();
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
    const suelto = soltarGrupo();
    if (suelto) {
      if (suelto.zona && suelto.tactil) vibrar();
      oye.alSoltar(suelto.zona, suelto.ids);
      if (suelto.resbalon) alternar(id);
      return;
    }
    alternar(id);
  };

  const cancela = (ev: PointerEvent) => {
    if (!presion || ev.pointerId !== presion.puntero) return;
    presion = null;
    try {
      raiz.releasePointerCapture(ev.pointerId);
    } catch {
      // ya estaba suelto
    }
    soltarGrupo(false);
  };

  const sale = () => {
    cursor = null;
  };

  const tecla = (ev: KeyboardEvent) => {
    const el = (ev.target as HTMLElement).closest<HTMLButtonElement>('.carta');
    if (!el) return;
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      alternar(el.dataset.id!);
    }
  };

  const onAlternar = ((ev: CustomEvent<string>) => alternar(ev.detail)) as EventListener;
  raiz.addEventListener('pointerdown', abajo);
  raiz.addEventListener('pointermove', mueve);
  raiz.addEventListener('pointerup', arriba);
  raiz.addEventListener('pointercancel', cancela);
  raiz.addEventListener('pointerleave', sale);
  raiz.addEventListener('keydown', tecla);
  raiz.addEventListener('cabala:alternar', onAlternar);
  requestAnimationFrame((tt) => {
    ultimo = tt;
    cuadro(tt);
  });

  const contenidoCarta = (carta: Carta): string =>
    pxNaipe(carta) +
    (carta.palo === 'X' ? `<span class="c-rotulo">${t('comodin')}</span>` : '') +
    (carta.bonus ? `<span class="c-bonus">+${carta.bonus}</span>` : '');

  return {
    poner(cartas, desdeMazo) {
      const desde = todoQuieto() ? undefined : desdeMazo;
      const caja = raiz.getBoundingClientRect();
      const viejas = new Map(naipes.map((c) => [c.carta.id, c]));
      const nuevas: Naipe[] = [];
      let recien = 0;
      for (const carta of [...cartas].sort(orden)) {
        const ya = viejas.get(carta.id);
        if (ya && ya.carta.n === carta.n && ya.carta.palo === carta.palo && !ya.vuela) {
          if (ya.carta.bonus !== carta.bonus) ya.el.innerHTML = contenidoCarta(carta);
          ya.carta = carta;
          nuevas.push(ya);
          viejas.delete(carta.id);
          continue;
        }
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'carta';
        el.dataset.id = carta.id;
        el.dataset.foco = `carta-${carta.id}`;
        el.dataset.palo = carta.palo;
        el.dataset.n = String(carta.n);
        el.setAttribute('aria-pressed', 'false');
        el.setAttribute('aria-label', carta.palo === 'X' ? '★' : `${carta.n} ${carta.palo}`);
        el.innerHTML = contenidoCarta(carta);
        raiz.append(el);
        const { h } = medidas();
        const x0 = desde ? desde.x - caja.left : (raiz.clientWidth || innerWidth) / 2;
        const y0 = desde ? desde.y - caja.top : (raiz.clientHeight || 160) - h;
        nuevas.push({
          carta,
          el,
          x: x0,
          y: y0,
          vx: 0,
          vy: 0,
          rot: desde ? -10 : 0,
          esc: 1,
          elegida: ordenSel.includes(carta.id),
          espera: desde ? recien++ * 45 : 0,
          vuela: null,
        });
      }
      for (const c of viejas.values()) c.el.remove();
      naipes = nuevas;
      for (const c of naipes) raiz.append(c.el);
      sincronizar();
    },
    seleccion: () => [...ordenSel],
    postaDe: (id) => ordenSel.indexOf(id),
    elegir(ids) {
      ordenSel = [...ids].slice(0, MAX_SEL);
      cambio();
    },
    correr: () => false,
    marcar: () => undefined,
    subir: () => undefined,
    panoIzq: () => null,
    panoDer: () => null,
    ajustar: () => undefined,
    volar(ids, a) {
      const { w, h } = medidas();
      const grupo = naipes.filter((c) => ids.includes(c.carta.id));
      grupo.forEach((c, i) => {
        c.vuela = { x: a.x - w / 2 + (i - (grupo.length - 1) / 2) * 10, y: a.y - h / 2 };
        c.el.classList.add('volando');
      });
      ordenSel = ordenSel.filter((id) => !ids.includes(id));
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
      for (const c of naipes) {
        if (!c.elegida) continue;
        c.el.classList.remove('niega');
        void c.el.offsetWidth;
        c.el.classList.add('niega');
      }
    },
    bloquear(si) {
      bloqueada = si;
      raiz.classList.toggle('bloqueada', si);
    },
    posar(ids, x, y) {
      ordenSel = [...ids].slice(0, MAX_SEL);
      posado = { ids: [...ordenSel], x, y };
      raiz.classList.add('arrastrando');
      document.body.classList.add('arrastrando');
      cambio();
      oye.alApuntar('enemigo', [...ordenSel]);
    },
    arrastrarA: () => undefined,
    destruir() {
      viva = false;
      document.body.classList.remove('arrastrando');
      raiz.removeEventListener('pointerdown', abajo);
      raiz.removeEventListener('pointermove', mueve);
      raiz.removeEventListener('pointerup', arriba);
      raiz.removeEventListener('pointercancel', cancela);
      raiz.removeEventListener('pointerleave', sale);
      raiz.removeEventListener('keydown', tecla);
      raiz.removeEventListener('cabala:alternar', onAlternar);
    },
  };
}
