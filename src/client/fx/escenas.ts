// Los lugares del juego: cada parada tiene su escena, dibujada por código en el lienzo de fondo. La mesa es una mesa
// de tablas con su vela; La Pulpería, una pared de adobe con estantes de botellas y un farol que se hamaca; el mapa,
// el arrabal de noche con su horizonte de ranchos y la niebla que deriva; el Fogón, leños en un ruedo de piedras y
// el redondel de luz que respira. Los duelos de Rey traen el clima de su palo.
//
// Cómo se pinta: lo quieto se compone UNA vez en un `Plano` (material, claridad y tinta fija de cada celda) y de él
// salen unos pocos cuadros iluminados (la misma escena con la luz más o menos abierta, o corrida de lugar), tramados
// con Bayer contra la rampa de cada material: del abismo índigo a la luz cálida. Lo que se mueve (llamas, farol,
// niebla, brasas, clima) son sellos chicos ya forjados que se estampan encima a medio ritmo. Nada crea lienzos por
// cuadro, y en modo foto o con «Reducir movimiento» queda el cuadro base, quieto y determinista.
import type { Palo } from '../../rules/cartas';
import { BAYER4 } from '../pixel/dither';

type Ctx = CanvasRenderingContext2D;

export type Escena = 'mesa' | 'mapa' | 'pulperia' | 'fogon' | 'portada' | 'altar' | 'amanecer' | 'ocaso';

/** El azar con semilla del motor (las escenas no lo importan para no cerrar un círculo de módulos). */
export interface Kit {
  azar(): number;
  entre(a: number, b: number): number;
}

export interface Escenario {
  /** Cuántos cuadros de luz tiene la escena quieta y cuál es el de reposo (el de las fotos). */
  n: number;
  base: number;
  /** El cuadro `k`: se pinta la primera vez que se pide y queda guardado. */
  cuadro(k: number): HTMLCanvasElement;
  /** Pinta un cuadro que falte (uno por llamada, en los ratos de reposo). Devuelve false cuando ya están todos. */
  calentar(): boolean;
  /** Qué cuadro toca: `t` segundos de escena, `respiro` 0–3 (el paseo del candil) y `golpe` 0–1 (el fogonazo). */
  elegir(t: number, respiro: number, golpe: number): number;
  /** Estampa lo que se mueve. Con `quieto`, solo lo que hace falta para que la escena esté entera. */
  animar(x: Ctx, dt: number, t: number, quieto: boolean): void;
}

// ───────────── utilería ─────────────

/** `#rrggbb` a ABGR, para escribir de a 32 bits en el ImageData (little-endian). */
function abgr(h: string): number {
  const n = parseInt(h.slice(1), 16);
  return ((255 << 24) | ((n & 255) << 16) | (((n >> 8) & 255) << 8) | ((n >> 16) & 255)) >>> 0;
}
const frac = (v: number): number => v - Math.floor(v);
/** Ruido fijo de una y de dos entradas (0–1): la escena sale igual cada vez. */
const r1 = (n: number): number => frac(Math.sin(n * 127.1 + 1.7) * 43758.5453);
const r2 = (x: number, y: number): number => frac(Math.sin(x * 127.1 + y * 311.7) * 43758.5453);
/** Ruido suave a lo largo de x: las vetas. */
function veta(x: number, y: number): number {
  const i = Math.floor(x);
  const f = x - i;
  const a = r2(i, y);
  return a + (r2(i + 1, y) - a) * f * f * (3 - 2 * f);
}
const umbral = (x: number, y: number): number => (BAYER4[y & 3][x & 3] + 0.5) / 16;

/** Cómo cae la luz con la distancia (al cuadrado, en 1024 pasos): (1 − d)^1,4, la curva de la penumbra de siempre. */
const CAIDA = Float32Array.from({ length: 1025 }, (_, j) => (1 - Math.sqrt(j / 1024)) ** 1.4);

interface Luz {
  x: number;
  y: number;
  rx: number;
  ry: number;
  g: number;
}
interface Material {
  tonos: string[];
  /** No recibe luz: su claridad es su tono (cielos, siluetas a contraluz). */
  libre?: boolean;
}

type Claridad = number | ((dx: number, dy: number, x: number, y: number) => number);

/** La escena quieta antes de iluminarla: material, claridad (0 = abismo, 1 = plena) y tinta fija por celda. */
class Plano {
  readonly mat: Uint8Array;
  readonly alb: Float32Array;
  readonly fijo: Uint32Array;
  private readonly tonos: number[][];
  constructor(readonly W: number, readonly H: number, private readonly mats: Material[]) {
    this.mat = new Uint8Array(W * H);
    this.alb = new Float32Array(W * H).fill(1);
    this.fijo = new Uint32Array(W * H);
    this.tonos = mats.map((m) => m.tonos.map(abgr));
  }
  /** Recorre un rectángulo (recortado al lienzo). */
  cada(x0: number, y0: number, w: number, h: number, f: (x: number, y: number, i: number) => void): void {
    const xa = Math.max(0, Math.round(x0));
    const ya = Math.max(0, Math.round(y0));
    const xb = Math.min(this.W, Math.round(x0 + w));
    const yb = Math.min(this.H, Math.round(y0 + h));
    for (let y = ya; y < yb; y++) for (let x = xa; x < xb; x++) f(x, y, y * this.W + x);
  }
  rect(x0: number, y0: number, w: number, h: number, m: number, a: number): void {
    this.cada(x0, y0, w, h, (_x, _y, i) => {
      this.mat[i] = m;
      this.alb[i] = a;
      this.fijo[i] = 0;
    });
  }
  /** Una elipse; la claridad puede depender de la posición dentro de ella (−1…1): la luz viene de arriba a la izquierda. */
  elipse(cx: number, cy: number, rx: number, ry: number, m: number, a: Claridad): void {
    this.cada(cx - rx, cy - ry, rx * 2 + 1, ry * 2 + 1, (x, y, i) => {
      const dx = (x + 0.5 - cx) / rx;
      const dy = (y + 0.5 - cy) / ry;
      if (dx * dx + dy * dy > 1) return;
      this.mat[i] = m;
      this.alb[i] = typeof a === 'number' ? a : a(dx, dy, x, y);
      this.fijo[i] = 0;
    });
  }
  /** Un polígono simple, por barrido. */
  poligono(pts: [number, number][], m: number, a: Claridad): void {
    let y0 = Infinity;
    let y1 = -Infinity;
    for (const [, py] of pts) {
      y0 = Math.min(y0, py);
      y1 = Math.max(y1, py);
    }
    for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(this.H - 1, Math.ceil(y1)); y++) {
      const cortes: number[] = [];
      const yy = y + 0.5;
      for (let k = 0; k < pts.length; k++) {
        const [ax, ay] = pts[k];
        const [bx, by] = pts[(k + 1) % pts.length];
        if ((ay <= yy && by > yy) || (by <= yy && ay > yy)) cortes.push(ax + ((yy - ay) / (by - ay)) * (bx - ax));
      }
      cortes.sort((p, q) => p - q);
      for (let k = 0; k + 1 < cortes.length; k += 2)
        for (let x = Math.max(0, Math.round(cortes[k])); x < Math.min(this.W, Math.round(cortes[k + 1])); x++) {
          const i = y * this.W + x;
          this.mat[i] = m;
          this.alb[i] = typeof a === 'number' ? a : a(0, 0, x, y);
          this.fijo[i] = 0;
        }
    }
  }
  /** Multiplica la claridad de un rectángulo. */
  velar(x0: number, y0: number, w: number, h: number, k: number): void {
    this.cada(x0, y0, w, h, (_x, _y, i) => (this.alb[i] *= k));
  }
  /** Una sombra blanda (la trama la vuelve grano): oscurece hacia el centro de la elipse. */
  sombra(cx: number, cy: number, rx: number, ry: number, fuerza: number): void {
    this.cada(cx - rx, cy - ry, rx * 2 + 1, ry * 2 + 1, (x, y, i) => {
      const d = Math.hypot((x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry);
      if (d < 1) this.alb[i] *= 1 - fuerza * (1 - d * d);
    });
  }
  /** Una celda de tinta fija: lo que emite luz (una llama, una ventana, una estrella). */
  tinta(x: number, y: number, color: string, w = 1, h = 1): void {
    const c = abgr(color);
    this.cada(x, y, w, h, (_x, _y, i) => (this.fijo[i] = c));
  }
  /** La escena iluminada: cada celda cae en un tono de la rampa de su material, tramada con Bayer. */
  cuadro(luces: Luz[], ambiente: number): HTMLCanvasElement {
    const { W, H } = this;
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const x2 = c.getContext('2d')!;
    const img = x2.createImageData(W, H);
    const buf = new Uint32Array(img.data.buffer);
    const { fijo, mat, alb, tonos: rampas } = this;
    const libre = this.mats.map((m) => !!m.libre);
    const nl = luces.length;
    const dy2 = new Float64Array(nl);
    for (let y = 0; y < H; y++) {
      const bayer = BAYER4[y & 3];
      for (let q = 0; q < nl; q++) dy2[q] = ((y + 0.5 - luces[q].y) / luces[q].ry) ** 2;
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        if (fijo[i]) {
          buf[i] = fijo[i];
          continue;
        }
        const m = mat[i];
        const tonos = rampas[m];
        const n = tonos.length - 1;
        let l = 1;
        if (!libre[m]) {
          l = ambiente;
          for (let q = 0; q < nl; q++) {
            const z = luces[q];
            const dx = (x + 0.5 - z.x) / z.rx;
            const d2 = dx * dx + dy2[q];
            if (d2 < 1) l += z.g * CAIDA[(d2 * 1024) | 0];
          }
        }
        const al = alb[i] * l;
        const v = (al < 0 ? 0 : al > 1 ? 1 : al) * n;
        const k = v >= n ? n - 1 : v | 0;
        buf[i] = tonos[v - k > (bayer[x & 3] + 0.5) / 16 ? k + 1 : k];
      }
    }
    x2.putImageData(img, 0, 0);
    return c;
  }
}

/** Los cuadros de luz de una escena, pintados a medida que hacen falta (ninguno frena el cambio de pantalla). */
function perezosos(hacer: (() => HTMLCanvasElement)[]): Pick<Escenario, 'n' | 'cuadro' | 'calentar'> {
  const hechos: (HTMLCanvasElement | undefined)[] = hacer.map(() => undefined);
  const cuadro = (k: number): HTMLCanvasElement => (hechos[k] ??= hacer[k]());
  return {
    n: hacer.length,
    cuadro,
    calentar() {
      const k = hechos.findIndex((c) => !c);
      if (k < 0) return false;
      cuadro(k);
      return true;
    },
  };
}

/** Un sello chico pintado una vez. */
function sello(w: number, h: number, pinta: (x: Ctx) => void): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  pinta(c.getContext('2d')!);
  return c;
}

/** Una tira de niebla tramada que empalma consigo misma por los costados. */
function tiraNiebla(w: number, h: number, color: string, densidad: number, semilla: number): HTMLCanvasElement {
  return sello(w, h, (x) => {
    x.fillStyle = color;
    for (let y = 0; y < h; y++)
      for (let xx = 0; xx < w; xx++) {
        const u = (xx / w) * Math.PI * 2;
        const n = 0.5 + 0.26 * Math.sin(u * 2 + semilla) + 0.16 * Math.sin(u * 5 + semilla * 2.3 + y * 0.16) + 0.1 * Math.sin(u * 9 + semilla * 4.1 - y * 0.22);
        const campana = Math.sin((Math.PI * (y + 0.5)) / h) ** 1.6;
        if (densidad * campana * n > umbral(xx, y)) x.fillRect(xx, y, 1, 1);
      }
  });
}

/** Estampa una tira corrida `dx` celdas, dando la vuelta. */
function correrTira(x: Ctx, tira: HTMLCanvasElement, dx: number, y: number): void {
  const w = tira.width;
  const o = ((Math.round(dx) % w) + w) % w;
  x.drawImage(tira, o - w, y);
  x.drawImage(tira, o, y);
}

/** Una bocanada de humo: un copo tramado, ralo en los bordes. */
function copo(r: number, color: string, densidad: number, semilla: number): HTMLCanvasElement {
  return sello(r * 2, r * 2, (x) => {
    x.fillStyle = color;
    for (let y = 0; y < r * 2; y++)
      for (let xx = 0; xx < r * 2; xx++) {
        const a = Math.atan2(y - r, xx - r);
        const borde = 0.78 + 0.22 * Math.sin(a * 3 + semilla) * Math.sin(a * 5 + semilla * 1.7);
        const d = Math.hypot(xx + 0.5 - r, (y + 0.5 - r) * 1.25) / (r * borde);
        if (d < 1 && densidad * (1 - d) ** 1.2 > umbral(xx, y)) x.fillRect(xx, y, 1, 1);
      }
  });
}

const FUEGO = ['#fff799', '#ffd500', '#ff7b00', '#d86000', '#7a0026'];

/** Los cuadros de una llama: lenguas con rampa dura, del corazón claro al borde que se apaga. */
function llamas(w: number, h: number, n: number): HTMLCanvasElement[] {
  return Array.from({ length: n }, (_, f) =>
    sello(w, h + 3, (x) => {
      for (let y = 0; y < h; y++) {
        const t = 1 - y / (h - 1); // 0 en la base, 1 en la punta
        const medio = (w / 2) * (1 - t) ** 0.75 * (0.82 + 0.18 * Math.sin(t * 7 + f * 2.4)) * (t < 0.12 ? 0.7 + t * 2.5 : 1);
        const cx = w / 2 + Math.sin(t * 4.2 + f * 2.1) * t * w * 0.16;
        for (let xx = 0; xx < w; xx++) {
          const d = Math.abs(xx + 0.5 - cx) / Math.max(0.5, medio);
          if (d >= 1) continue;
          const calor = (1 - d) * (1 - t * 0.85) + (t < 0.35 ? 0.12 : 0);
          x.fillStyle = FUEGO[calor > 0.6 ? 0 : calor > 0.4 ? 1 : calor > 0.2 ? 2 : calor > 0.08 ? 3 : 4];
          x.fillRect(xx, y + 3, 1, 1);
        }
      }
      // una chispa que se suelta de la punta
      x.fillStyle = FUEGO[2];
      x.fillRect(Math.round(w / 2 + Math.sin(f * 2.3) * w * 0.22), (f * 2) % 3, 1, 1);
    }),
  );
}

interface Mota {
  x: number;
  y: number;
  vx: number;
  vy: number;
  vida: number;
  max: number;
  /** Variante (color, tamaño) y desfase propio. */
  tipo: number;
  fase: number;
}

/** Brasas, polvo o bichitos de luz: celdas sueltas que nacen, titilan y se apagan. */
function brasero(n: number, nace: (arranque: boolean) => Mota, tinta: (m: Mota, f: number) => string, tam = 1): (x: Ctx, dt: number) => void {
  const ms: Mota[] = [];
  return (x, dt) => {
    while (ms.length < n) ms.push(nace(true));
    for (let i = ms.length - 1; i >= 0; i--) {
      const b = ms[i];
      b.vida += dt;
      if (b.vida < 0) continue;
      b.x += (b.vx + Math.sin(b.vida * 2 + b.fase) * 2) * dt;
      b.y += b.vy * dt;
      if (b.vida > b.max || b.y < -2) {
        ms[i] = nace(false);
        continue;
      }
      if ((Math.floor(b.vida * 6 + b.fase) & 3) === 0) continue;
      x.fillStyle = tinta(b, b.vida / b.max);
      x.fillRect(Math.round(b.x), Math.round(b.y), tam, tam);
    }
  };
}

const tintaBrasa = (m: Mota, f: number): string => (m.tipo ? (f < 0.3 ? '#ffd500' : f < 0.7 ? '#ff7b00' : '#7a0026') : f < 0.5 ? '#5a1e96' : '#2e0f52');

// ───────────── el clima de los Reyes ─────────────

/** La penumbra del fondo de la mesa, teñida por el palo del Rey (sin Rey, el violeta de siempre). */
const PENUMBRA: Record<Palo | 'X', string[]> = {
  X: ['#09070f', '#120a24', '#1c0f2c', '#2a1533', '#3a1a34'],
  S: ['#07080f', '#0a1026', '#0f1a3c', '#162a55', '#1c3a70'],
  C: ['#07090c', '#0a1616', '#0e261c', '#143a26', '#1c4e2c'],
  D: ['#0a0809', '#1a1108', '#2c1c0a', '#44290c', '#5e3a10'],
  H: ['#0b060b', '#1e0814', '#320a1e', '#4a0e26', '#64122e'],
};

interface Clima {
  /** Cuánto abre la luz ahora mismo (0–1): el relámpago alumbra la mesa. */
  destello(): number;
  animar(x: Ctx, dt: number, t: number, quieto: boolean): void;
}

function climaDe(palo: Palo, W: number, H: number, kit: Kit): Clima {
  const area = (W * H) / 100000;
  if (palo === 'S') {
    // Espadas: tormenta seca. Cada tanto un relámpago cian baja quebrado, parpadea dos veces y alumbra todo.
    let espera = 0.5;
    let vivo = 0;
    let rayo: [number, number][] = [];
    let ramas: [number, number][][] = [];
    const trazar = (x0: number, y0: number, y1: number, quiebre: number): [number, number][] => {
      const pts: [number, number][] = [[x0, y0]];
      let px = x0;
      for (let y = y0; y < y1; ) {
        y += kit.entre(7, 16);
        px += kit.entre(-quiebre, quiebre);
        pts.push([Math.round(px), Math.round(Math.min(y, y1))]);
      }
      return pts;
    };
    const linea = (x: Ctx, pts: [number, number][], g: number): void => {
      for (let k = 0; k + 1 < pts.length; k++) {
        const [ax, ay] = pts[k];
        const [bx, by] = pts[k + 1];
        const n = Math.max(1, by - ay);
        for (let j = 0; j <= n; j++) x.fillRect(Math.round(ax + ((bx - ax) * j) / n) - (g >> 1), ay + j, g, 1);
      }
    };
    const lluvia = Array.from({ length: Math.round(26 * area) }, () => ({ x: kit.entre(0, W), y: kit.entre(0, H), v: kit.entre(150, 220) }));
    return {
      destello: () => (vivo > 0.22 ? 1 : vivo > 0.14 ? 0.3 : vivo > 0.06 ? 0.8 : vivo > 0 ? 0.3 : 0),
      animar(x, dt, _t, quieto) {
        if (quieto) return;
        // la llovizna fina, en diagonal, del azul más hondo
        for (const g of lluvia) {
          g.y += g.v * dt;
          g.x -= g.v * 0.25 * dt;
          if (g.y > H) {
            g.y = -4;
            g.x = kit.entre(0, W * 1.2);
          }
          x.fillStyle = '#1c3a70';
          x.fillRect(Math.round(g.x) + 1, Math.round(g.y), 1, 4);
          x.fillStyle = '#2c5a9a';
          x.fillRect(Math.round(g.x), Math.round(g.y) + 4, 1, 3);
        }
        vivo -= dt;
        espera -= dt;
        if (espera <= 0) {
          espera = kit.entre(2.6, 6);
          vivo = 0.3;
          // nunca por el medio: cae a un costado del Rey
          const lado = kit.azar() < 0.5 ? kit.entre(0.06, 0.3) : kit.entre(0.7, 0.94);
          rayo = trazar(Math.round(W * lado), 0, Math.round(H * kit.entre(0.3, 0.55)), 12);
          const [bx, by] = rayo[Math.min(rayo.length - 1, 2)];
          ramas = [trazar(bx, by, by + Math.round(H * 0.14), 14)];
        }
        if (vivo > 0.22 || (vivo > 0.06 && vivo <= 0.14)) {
          x.fillStyle = '#2c7bf0';
          linea(x, rayo, 5);
          for (const r of ramas) linea(x, r, 2);
          x.fillStyle = '#b8f6ff';
          linea(x, rayo, 3);
          x.fillStyle = vivo > 0.22 ? '#ffffff' : '#b8f6ff';
          linea(x, rayo, 1);
        }
      },
    };
  }
  if (palo === 'C') {
    // Bastos: el monte. Hojas que caen de costado, aleteando, y esporas que suben titilando.
    const hoja = (arranque: boolean): Mota => ({ x: kit.entre(-W * 0.2, W), y: arranque ? kit.entre(0, H) : -3, vx: kit.entre(9, 22), vy: kit.entre(10, 22), vida: 0, max: 99, tipo: Math.floor(kit.azar() * 3), fase: kit.entre(0, 6) });
    const hojas: Mota[] = Array.from({ length: Math.round(16 * area) }, () => hoja(true));
    const esporas = brasero(
      Math.round(12 * area),
      (arranque) => ({ x: kit.entre(0, W), y: arranque ? kit.entre(0, H) : H + 2, vx: kit.entre(-2, 2), vy: kit.entre(-7, -3), vida: arranque ? kit.entre(0, 5) : 0, max: kit.entre(5, 10), tipo: 0, fase: kit.entre(0, 6) }),
      (_m, f) => (f < 0.4 ? '#b4f03c' : f < 0.75 ? '#22d95b' : '#139a3c'),
      2,
    );
    const VERDES = ['#139a3c', '#22d95b', '#b4f03c'];
    return {
      destello: () => 0,
      animar(x, dt, _t, quieto) {
        if (quieto) return;
        for (let i = 0; i < hojas.length; i++) {
          const h = hojas[i];
          h.vida += dt;
          h.x += (h.vx + Math.sin(h.vida * 2.2 + h.fase) * 16) * dt;
          h.y += (h.vy + Math.cos(h.vida * 2.2 + h.fase) * 6) * dt;
          if (h.y > H + 3 || h.x > W + 3) hojas[i] = hoja(false);
          // aletea: ancha, de canto, ancha
          const plana = Math.floor(h.vida * 5 + h.fase) % 3 !== 0;
          const hx = Math.round(h.x);
          const hy = Math.round(h.y);
          // una hoja en forma de lenteja: clara arriba, la nervadura y la sombra abajo
          x.fillStyle = '#0b5e28';
          if (plana) {
            x.fillRect(hx, hy + 1, 6, 1);
            x.fillRect(hx + 1, hy + 2, 3, 1);
          } else {
            x.fillRect(hx + 1, hy, 1, 6);
            x.fillRect(hx + 2, hy + 1, 1, 3);
          }
          x.fillStyle = VERDES[h.tipo];
          if (plana) x.fillRect(hx + 1, hy, 3, 1);
          else x.fillRect(hx, hy + 1, 1, 3);
        }
        esporas(x, dt);
      },
    };
  }
  if (palo === 'D') {
    // Oros: llueven monedas al fondo, girando, de un oro apagado para no confundirse con las del botín.
    const moneda = (arranque: boolean): Mota => ({ x: kit.entre(0, W), y: arranque ? kit.entre(-H, H) : kit.entre(-H * 0.5, -4), vx: 0, vy: kit.entre(60, 105), vida: 0, max: 99, tipo: 0, fase: kit.entre(0, 6) });
    const ms: Mota[] = Array.from({ length: Math.round(14 * area) }, () => moneda(true));
    return {
      destello: () => 0,
      animar(x, dt, _t, quieto) {
        if (quieto) return;
        for (let i = 0; i < ms.length; i++) {
          const m = ms[i];
          m.vida += dt;
          m.y += m.vy * dt;
          if (m.y > H + 3) ms[i] = moneda(false);
          const px = Math.round(m.x);
          const py = Math.round(m.y);
          const canto = Math.floor(m.vida * 7 + m.fase) % 3 === 0;
          // el disco (o su canto), con la sombra abajo a la derecha y el brillo arriba a la izquierda
          const a = canto ? 2 : 6;
          x.fillStyle = '#8a4a08';
          x.fillRect(px + (canto ? 0 : 1), py, a - (canto ? 0 : 2), 6);
          if (!canto) x.fillRect(px, py + 1, a, 4);
          x.fillStyle = '#d86000';
          x.fillRect(px + (canto ? 0 : 1), py, a - (canto ? 1 : 3), 5);
          if (!canto) x.fillRect(px, py + 1, a - 1, 3);
          x.fillStyle = '#ff7b00';
          if (!canto) x.fillRect(px + 1, py + 1, 3, 3);
          x.fillStyle = '#ffd500';
          x.fillRect(px + (canto ? 0 : 1), py + 1, canto ? 1 : 2, 2);
        }
      },
    };
  }
  // Copas: bruma carmesí, tres bancos que derivan a distinto paso (parte de la escena: en foto queda quieta).
  const alto = Math.max(16, Math.round(H * 0.16));
  const tiras = [tiraNiebla(W, alto, '#64122e', 0.5, 1.3), tiraNiebla(W, Math.round(alto * 1.3), '#4a0e26', 0.62, 4.1), tiraNiebla(W, alto, '#7a0026', 0.36, 7.7)];
  const ys = [0.1, 0.4, 0.62].map((f) => Math.round(H * f));
  const vs = [4, -2.5, 6];
  return {
    destello: () => 0,
    animar(x, _dt, t) {
      for (let i = 0; i < 3; i++) correrTira(x, tiras[i], t * vs[i], ys[i]);
    },
  };
}

// ───────────── la penumbra de siempre (portada y altar) ─────────────

const PORTADA = { tonos: ['#09070f', '#160c1c', '#24112b', '#3a1436', '#55193c'], foco: [0.5, 0.38], radio: [0.66, 0.8] };
const ALTAR = { tonos: ['#09070f', '#150a10', '#241018', '#3a1420', '#571c24'], foco: [0.5, 0.5], radio: [0.6, 0.7] };

function penumbra(def: typeof PORTADA, W: number, H: number, kit: Kit): Escenario {
  const P = new Plano(W, H, [{ tonos: def.tonos }]);
  const cuadros = [0.94, 0.98, 1.02, 1.06].map((a) => () => P.cuadro([{ x: W * def.foco[0], y: H * def.foco[1], rx: W * def.radio[0] * a, ry: H * def.radio[1] * a, g: 1 }], 0));
  const brasas = brasero(
    Math.round((W * H) / 9000),
    (arranque) => {
      const max = kit.entre(4, 9);
      return { x: kit.entre(0, W), y: arranque ? kit.entre(0, H) : H + 2, vx: kit.entre(-2, 2), vy: kit.entre(-9, -3), vida: arranque ? kit.entre(0, max) : 0, max, tipo: kit.azar() < 0.6 ? 1 : 0, fase: kit.entre(0, 6) };
    },
    tintaBrasa,
  );
  return {
    ...perezosos(cuadros),
    base: 1,
    elegir: (_t, respiro) => respiro,
    animar(x, dt, _t, quieto) {
      if (!quieto) brasas(x, dt);
    },
  };
}

// ───────────── la mesa ─────────────

const MADERA = ['#09070f', '#150a1c', '#24102a', '#3a182e', '#52222c', '#6b3226', '#874a28'];

function mesa(W: number, H: number, palo: Palo | null, kit: Kit, apagada = false): Escenario {
  const vert = H > W;
  const yLejos = Math.round(H * (vert ? 0.075 : 0.125));
  const yCanto = Math.round(H * (vert ? 0.705 : 0.745));
  const alto = Math.max(9, Math.round(H * (vert ? 0.036 : 0.058)));
  const FONDO = 0;
  const TABLA = 1;
  const PELTRE = 2;
  const P = new Plano(W, H, [{ tonos: PENUMBRA[palo ?? 'X'] }, { tonos: MADERA }, { tonos: ['#09070f', '#1a1420', '#2e2230', '#4a3440', '#6e4c4c'] }]);
  // la pared del fondo: tablones parados, apenas adivinados (con Rey, es donde más se nota el tinte de su palo)
  const paso = Math.max(14, Math.round(W / 22));
  P.cada(0, 0, W, yLejos, (x, y, i) => {
    P.mat[i] = FONDO;
    P.alb[i] = (x % paso === 0 ? 0.35 : x % paso === 1 ? 0.95 : 0.7 + 0.12 * r2(Math.floor(x / paso), y >> 2)) * (palo ? 1.15 : 1);
  });
  // la raya de sombra donde la mesa se arrima a la pared
  P.rect(0, yLejos - 2, W, 2, FONDO, 0.2);
  // las tablas: vetas a lo largo, juntas oscuras con su filo de luz debajo, empalmes, clavos y algún nudo
  P.cada(0, yLejos, W, yCanto - yLejos, (x, y, i) => {
    const j = Math.floor((y - yLejos) / alto);
    const yy = (y - yLejos) % alto;
    let a = 0.74 + 0.2 * r1(j * 3.1) + 0.16 * (veta(x / 26 + r1(j) * 40, (y >> 1) * 7.3) - 0.5) + 0.07 * (r2(x, y) - 0.5);
    if (yy === 0) a = 0.32;
    else if (yy === 1) a *= 1.2;
    else if (yy === alto - 1) a *= 0.82;
    const empalme = Math.round((0.15 + 0.7 * r1(j * 7.7 + 2)) * W);
    if (x === empalme) a = 0.36;
    else if (x === empalme + 1 && yy > 0) a *= 1.2;
    else {
      // los clavos a cada lado del empalme: la cabeza oscura y su brillo arriba a la izquierda
      const cx = x < empalme ? empalme - 5 - x : x - empalme - 5;
      const cy = yy < alto / 2 ? yy - 4 : alto - 5 - yy;
      if ((cx === 0 || cx === 1) && (cy === 0 || cy === 1)) a = cx === (x < empalme ? 1 : 0) && cy === (yy < alto / 2 ? 0 : 1) ? a * 1.35 : 0.3;
    }
    P.mat[i] = TABLA;
    P.alb[i] = a;
  });
  for (let j = 0; j * alto < yCanto - yLejos - alto; j++) {
    if (r1(j * 5.3 + 9) > 0.45) continue;
    const nx = Math.round(r1(j * 2.9 + 4) * W);
    const ny = yLejos + j * alto + Math.round(alto / 2);
    P.elipse(nx, ny, 7, 3.5, TABLA, (dx, dy) => (dx * dx + dy * dy > 0.6 ? 1.05 : dx * dx + dy * dy > 0.25 ? 0.6 : 0.36));
  }
  // la sombra del enemigo (ancha, bajo su naipe) y la que hace la mano contra el canto
  P.sombra(W * 0.5, H * (vert ? 0.37 : 0.475), W * (vert ? 0.46 : 0.2), H * (vert ? 0.05 : 0.075), 0.5);
  P.cada(0, yCanto - H * 0.11, W, H * 0.11, (x, y, i) => {
    const f = (y - (yCanto - H * 0.11)) / (H * 0.11);
    const lado = vert ? 1 : Math.max(0, 1 - Math.abs(x / W - 0.5) / 0.34);
    P.alb[i] *= 1 - 0.5 * f * f * Math.min(1, lado * 2);
  });
  // el canto: el filo que agarra la luz, la cara del frente con las cabezas de las tablas y la sombra que tira al piso
  const frente = Math.max(4, Math.round(H * 0.024));
  P.rect(0, yCanto, W, 2, TABLA, 1.5);
  P.cada(0, yCanto + 2, W, frente, (x, y, i) => {
    P.mat[i] = TABLA;
    P.alb[i] = (x % 23 === 0 ? 0.28 : 0.5 + 0.1 * r2(x >> 1, 3)) * (y === yCanto + 2 ? 1.25 : 1);
  });
  P.rect(0, yCanto + 2 + frente, W, 1, TABLA, 0.25);
  P.cada(0, yCanto + 3 + frente, W, H, (x, y, i) => {
    const f = Math.min(1, (y - (yCanto + 3 + frente)) / (H * 0.07));
    P.mat[i] = FONDO;
    P.alb[i] = 0.12 + 0.36 * f + 0.06 * r2(x >> 2, y >> 1);
  });

  // la vela (en apaisado, a la izquierda: de ahí viene la luz; en móvil el candil cuelga fuera de cuadro)
  const vx = Math.round(W * 0.1);
  const vy = Math.round(H * 0.4);
  const altoVela = 17;
  if (!vert) {
    // el platito de peltre con su sombra, y el cabo de vela: sebo que se enciende hacia la llama
    P.sombra(vx + 16, vy + 5, 24, 7, 0.6);
    P.elipse(vx, vy, 14, 4.6, PELTRE, (dx, dy) => (dy < -0.35 ? 1.5 : dx < -0.4 ? 1.25 : dx > 0.5 || dy > 0.5 ? 0.5 : 0.85));
    P.elipse(vx, vy - 1, 9, 2.6, PELTRE, (dx) => (dx < 0 ? 0.6 : 0.95));
    for (let r = 0; r < altoVela; r++) {
      const yv = vy - 2 - r;
      const t = r / (altoVela - 1); // 1 arriba, junto a la llama
      P.tinta(vx - 4, yv, t > 0.75 ? '#fff799' : t > 0.35 ? '#f4efe2' : '#d9ceb4', 2);
      P.tinta(vx - 2, yv, t > 0.75 ? '#fff799' : t > 0.35 ? '#d9ceb4' : '#b9aacb', 4);
      P.tinta(vx + 2, yv, t > 0.75 ? '#d9ceb4' : t > 0.35 ? '#b9aacb' : '#6b5a86', 2);
    }
    // el sebo que chorrea y el pabilo
    P.tinta(vx - 5, vy - altoVela + 1, '#f4efe2', 1, 6);
    P.tinta(vx - 6, vy - altoVela + 5, '#d9ceb4', 2, 3);
    P.tinta(vx + 4, vy - altoVela + 4, '#b9aacb', 1, 5);
    P.tinta(vx - 1, vy - altoVela - 3, '#2a1f3d', 2, 2);
  }

  const candil = (ap: number, g: number): Luz[] => {
    const luces: Luz[] = [{ x: W * 0.5, y: H * (vert ? 0.36 : 0.42), rx: W * (vert ? 0.85 : 0.52) * ap, ry: H * (vert ? 0.5 : 0.62) * ap, g: (vert ? 0.78 : 0.56) * g }];
    if (!vert) luces.push({ x: vx, y: vy - altoVela - 6, rx: W * 0.36 * ap, ry: H * 0.5 * ap, g: 0.62 * g });
    return luces;
  };
  // cuatro cuadros de respiro y tres de fogonazo (el candil que salta con el golpe)
  const cuadros = [
    [0.94, 0.96],
    [0.98, 1],
    [1.02, 1.03],
    [1.06, 1.06],
    [1.12, 1.2],
    [1.2, 1.4],
    [1.3, 1.65],
  ].map(([ap, g]) => () => P.cuadro(candil(ap, g), 0.14));
  if (apagada) return velaQueSeApaga(P, candil, vert, vx, vy - altoVela, W, H, kit);

  const llama = llamas(9, 14, 5);
  const humos = [copo(22, '#2a1838', 0.34, 1), copo(30, '#24142f', 0.3, 2.2), copo(17, '#2e1c3c', 0.36, 3.7)];
  const nubes = Array.from({ length: vert ? 4 : 6 }, (_, i) => ({ x: kit.entre(0, W), y: kit.entre(0, H * 0.6), v: kit.entre(1.5, 4), s: i % 3 }));
  const brasas = brasero(
    Math.round((W * H) / 11000),
    (arranque) => {
      const max = kit.entre(4, 9);
      return { x: kit.entre(0, W), y: arranque ? kit.entre(0, H) : H + 2, vx: kit.entre(-2, 2), vy: kit.entre(-9, -3), vida: arranque ? kit.entre(0, max) : 0, max, tipo: kit.azar() < 0.6 ? 1 : 0, fase: kit.entre(0, 6) };
    },
    tintaBrasa,
  );
  const clima = palo ? climaDe(palo, W, H, kit) : null;
  return {
    ...perezosos(cuadros),
    base: 1,
    elegir(_t, respiro, golpe) {
      const g = Math.max(golpe, clima?.destello() ?? 0);
      return g > 0.02 ? Math.min(6, 3 + Math.ceil(g * 3)) : respiro;
    },
    animar(x, dt, t, quieto) {
      if (!vert) x.drawImage(llama[quieto ? 0 : Math.floor(t * 9) % llama.length], vx - 5, vy - altoVela - 2 - llama[0].height);
      if (!quieto) {
        // el humo de la pulpería: copos ralos que suben despacio y vuelven por abajo
        for (const n of nubes) {
          n.y -= n.v * dt;
          n.x += Math.sin(t * 0.3 + n.s * 2) * 1.5 * dt;
          const c = humos[n.s];
          if (n.y < -c.height) {
            n.y = H * 0.7;
            n.x = kit.entre(0, W);
          }
          x.drawImage(c, Math.round(n.x - c.width / 2), Math.round(n.y));
        }
        brasas(x, dt);
      }
      clima?.animar(x, dt, t, quieto);
    },
  };
}

// ───────────── La Pulpería ─────────────

function pulperia(W: number, H: number, kit: Kit): Escenario {
  const vert = H > W;
  const ADOBE = 0;
  const TABLA = 1;
  const VERDE = 2;
  const AMBAR = 3;
  const AZUL = 4;
  const BARRO = 5;
  const PAPEL = 6;
  const P = new Plano(W, H, [
    { tonos: ['#0b0711', '#180a16', '#260e18', '#38161a', '#4c221a', '#643018'] },
    { tonos: ['#0b0711', '#1c0c14', '#30141a', '#4a2018', '#6b3418', '#8a4a1e'] },
    { tonos: ['#07080f', '#0a1418', '#0c2420', '#103a2a', '#165436', '#2a8a4c'] },
    { tonos: ['#0b0711', '#200e0c', '#3a180c', '#5a280c', '#804010', '#c07018'] },
    { tonos: ['#09070f', '#120e26', '#1a183e', '#24245a', '#34347a', '#6a6ab8'] },
    { tonos: ['#0b0711', '#2a1418', '#4a2420', '#7a4430', '#a06a48'] },
    { tonos: ['#0b0711', '#2a1f3d', '#6b5a86', '#b9aacb'] },
  ]);
  // la pared de adobe: hiladas apenas marcadas, manchas de humedad y revoque caído
  P.cada(0, 0, W, H, (x, y, i) => {
    const hilada = y % 9 === 0 || (x + (Math.floor(y / 9) & 1) * 11) % 22 === 0;
    P.mat[i] = ADOBE;
    P.alb[i] = (0.72 + 0.2 * (veta(x / 37, (y >> 3) * 5.1) - 0.5) + 0.08 * (r2(x, y) - 0.5)) * (hilada ? 0.84 : 1);
  });
  // un estante: la tabla (filo claro arriba, canto en sombra), sus ménsulas y la sombra que deja en la pared
  const estante = (y: number): void => {
    P.velar(0, y + 5, W, 7, 0.5);
    P.rect(0, y, W, 2, TABLA, 1.35);
    P.cada(0, y + 2, W, 2, (x, _y, i) => {
      P.mat[i] = TABLA;
      P.alb[i] = x % 47 === 0 ? 0.5 : 0.85 + 0.1 * (veta(x / 17, y) - 0.5);
    });
    P.rect(0, y + 4, W, 1, TABLA, 0.42);
    for (let x = 30; x < W; x += 118) {
      P.rect(x, y + 5, 3, 12, TABLA, 0.75);
      P.rect(x, y + 5, 1, 12, TABLA, 1.05);
      P.poligono([[x + 3, y + 5], [x + 12, y + 5], [x + 3, y + 14]], TABLA, 0.6);
    }
  };
  /** El vidrio, columna por columna: canto, brillo a la izquierda (la luz), cuerpo y sombra a la derecha. */
  const columna = (x: number, x0: number, w: number): number => {
    const k = x - x0;
    return k === 0 ? 0.6 : k <= 2 ? 1.6 : k >= w - 2 ? 0.4 : k >= w - 4 ? 0.65 : 0.92;
  };
  const cuerpo = (x0: number, y0: number, w: number, h: number, m: number): void =>
    P.cada(x0, y0, w, h, (x, _y, i) => {
      P.mat[i] = m;
      P.alb[i] = columna(x, x0, w);
    });
  /** Pinta una pieza sobre el estante (con la base en `y`) y devuelve cuánto ocupa de ancho. */
  const pieza = (x0: number, y: number, s: number): number => {
    const tipo = Math.floor(r1(s) * 8);
    const color = [VERDE, AMBAR, VERDE, AZUL, AMBAR][Math.floor(r1(s + 0.3) * 5)];
    if (tipo <= 2) {
      // botella de vino: cuerpo, hombros en dos escalones, cuello con su labio y corcho; algunas con etiqueta
      const w = 10 + (tipo & 1) * 2;
      const hb = 17 + Math.floor(r1(s + 0.5) * 8);
      const hc = 8 + Math.floor(r1(s + 0.7) * 5);
      const cx = x0 + (w >> 1);
      cuerpo(x0, y - hb, w, hb, color);
      P.rect(x0, y - 1, w, 1, color, 0.4);
      cuerpo(x0 + 1, y - hb - 1, w - 2, 1, color);
      cuerpo(x0 + 2, y - hb - 3, w - 4, 2, color);
      P.cada(cx - 2, y - hb - 3 - hc, 4, hc, (x, _y, i) => {
        P.mat[i] = color;
        P.alb[i] = x === cx - 1 ? 1.5 : x === cx + 1 ? 0.5 : 0.85;
      });
      P.rect(cx - 3, y - hb - 2 - hc, 6, 1, color, 1.1);
      P.rect(cx - 2, y - hb - 5 - hc, 4, 2, TABLA, 1.1);
      P.rect(cx - 2, y - hb - 5 - hc, 1, 2, TABLA, 1.5);
      if (r1(s + 0.9) < 0.55) {
        P.rect(x0 + 1, y - hb + 5, w - 2, 7, PAPEL, 0.62);
        P.rect(x0 + 1, y - hb + 5, 2, 7, PAPEL, 0.95);
        P.rect(x0 + 3, y - hb + 7, w - 6, 1, PAPEL, 0.3);
        P.rect(x0 + 3, y - hb + 9, w - 7, 1, PAPEL, 0.3);
      }
      return w + 3;
    }
    if (tipo === 3) {
      // damajuana: panza de vidrio verde, medio cuerpo de mimbre trenzado y pico corto con su asa
      const r = 12 + Math.floor(r1(s + 0.5) * 4);
      const cx = x0 + r;
      P.elipse(cx, y - r, r, r, VERDE, (dx, dy) => (dx < -0.25 && dx > -0.7 && dy < -0.2 && dy > -0.75 ? 1.6 : dx * dx + dy * dy > 0.82 ? 0.5 : 0.9 - 0.4 * dx));
      P.cada(x0, y - r + 1, r * 2, r - 1, (x, yy, i) => {
        if (Math.hypot(x + 0.5 - cx, yy + 0.5 - y + r) > r) return;
        P.mat[i] = TABLA;
        P.alb[i] = (((x >> 1) + (yy >> 1)) & 1 ? 1 : 0.6) * (x < cx - r * 0.3 ? 1.1 : x > cx + r * 0.4 ? 0.55 : 0.85);
      });
      P.rect(x0 + 2, y - 1, r * 2 - 4, 1, TABLA, 0.4);
      cuerpo(cx - 3, y - r * 2 - 6, 6, 8, VERDE);
      P.rect(cx - 4, y - r * 2 - 7, 8, 2, VERDE, 1.2);
      P.rect(cx + 3, y - r * 2 - 3, 4, 1, TABLA, 0.8);
      P.rect(cx + 6, y - r * 2 - 2, 1, 5, TABLA, 0.6);
      return r * 2 + 3;
    }
    if (tipo === 4) {
      // frasco de boca ancha, con su tapa y lo que guarda adentro
      const w = 12;
      const h = 14 + Math.floor(r1(s + 0.5) * 5);
      cuerpo(x0, y - h, w, h, AZUL);
      P.rect(x0 + 3, y - Math.round(h * 0.55), w - 5, Math.round(h * 0.55) - 1, BARRO, 0.6);
      P.rect(x0, y - 1, w, 1, AZUL, 0.4);
      P.rect(x0 - 1, y - h - 3, w + 2, 3, PAPEL, 0.6);
      P.rect(x0 - 1, y - h - 3, w + 2, 1, PAPEL, 0.95);
      return w + 4;
    }
    if (tipo === 5) {
      // porrón de ginebra: barro cocido, cuadrado y alto, con su asa
      const h = 22 + Math.floor(r1(s + 0.5) * 6);
      P.cada(x0, y - h, 8, h, (x, _y, i) => {
        P.mat[i] = BARRO;
        P.alb[i] = x - x0 < 2 ? 1.25 : x - x0 > 5 ? 0.45 : 0.82;
      });
      P.rect(x0 + 1, y - h - 1, 6, 1, BARRO, 0.7);
      P.rect(x0 + 2, y - h - 5, 4, 4, BARRO, 0.8);
      P.rect(x0 + 2, y - h - 5, 1, 4, BARRO, 1.2);
      P.rect(x0 + 1, y - h - 6, 6, 1, BARRO, 1.05);
      P.rect(x0 + 8, y - h + 1, 3, 1, BARRO, 0.7);
      P.rect(x0 + 10, y - h + 2, 1, 6, BARRO, 0.5);
      P.rect(x0 + 8, y - h + 8, 3, 1, BARRO, 0.5);
      return 14;
    }
    if (tipo === 6) {
      // un cajón de mercadería: listones, clavos y el filo de arriba
      const w = 18 + Math.floor(r1(s + 0.5) * 8);
      P.cada(x0, y - 12, w, 12, (x, yy, i) => {
        const k = y - yy;
        P.mat[i] = TABLA;
        P.alb[i] = x === x0 || x === x0 + w - 1 ? 0.45 : k === 12 ? 1.3 : k % 4 === 0 ? 0.45 : x - x0 === 2 || x0 + w - x === 3 ? (k % 4 === 2 ? 0.4 : 0.9) : 0.72 + 0.1 * (veta(x / 6, k >> 2) - 0.5);
      });
      return w + 3;
    }
    return 6 + Math.floor(r1(s + 0.5) * 12); // un hueco
  };
  const ys = (vert ? [0.19, 0.42] : [0.24, 0.43]).map((f) => Math.round(H * f));
  ys.forEach((y, fila) => {
    estante(y);
    for (let x = 5, s = fila * 100 + 1; x < W - 14; s++) x += pieza(x, y, s);
  });
  // el mostrador: la tapa (un tablón largo que agarra la luz) y el frente de tablas paradas
  const yM = Math.round(H * (vert ? 0.64 : 0.625));
  P.velar(0, yM - 6, W, 6, 0.7);
  P.rect(0, yM, W, 3, TABLA, 1.35);
  P.rect(0, yM + 3, W, 4, TABLA, 0.85);
  P.rect(0, yM + 7, W, 3, TABLA, 0.32);
  P.cada(0, yM + 10, W, H, (x, y, i) => {
    const k = x % 34;
    P.mat[i] = TABLA;
    P.alb[i] = (k === 0 ? 0.28 : k === 1 ? 0.8 : 0.56 + 0.14 * (veta((y >> 1) / 11, Math.floor(x / 34) * 3.3 + (x >> 1)) - 0.5)) * Math.max(0.3, 1 - (y - yM) / (H * 0.45));
  });

  // el farol cuelga de su cadena y se hamaca: siete cuadros con la luz corrida de lado a lado
  const px = Math.round(W * (vert ? 0.56 : 0.3));
  const largo = Math.round(H * (vert ? 0.05 : 0.07));
  const AMPLITUD = 0.3;
  const cuadros = [-3, -2, -1, 0, 1, 2, 3].map((k) => {
    const a = (AMPLITUD * k) / 3;
    const lx = px + Math.sin(a) * largo * 3.4;
    return () =>
      P.cuadro(
      [
        { x: lx, y: largo + 14 + H * 0.06, rx: W * (vert ? 1 : 0.44), ry: H * (vert ? 0.36 : 0.66), g: 0.74 },
        { x: lx, y: largo + 12, rx: W * (vert ? 0.5 : 0.17), ry: H * (vert ? 0.14 : 0.26), g: 0.34 },
      ],
      0.2,
    );
  });
  const farol = sello(17, 24, (x) => {
    const r = (c: string, x0: number, y0: number, w: number, h: number): void => {
      x.fillStyle = c;
      x.fillRect(x0, y0, w, h);
    };
    // la argolla y el sombrero de chapa (el filo claro, a la izquierda)
    r('#4a3440', 7, 0, 3, 2);
    r('#2e2230', 5, 2, 7, 1);
    r('#2e2230', 3, 3, 11, 2);
    r('#6e4c4c', 3, 3, 5, 1);
    r('#1a1420', 2, 5, 13, 1);
    // el vidrio: rampa dura, del ámbar del borde al corazón de la llama
    r('#d86000', 4, 6, 9, 13);
    r('#ff7b00', 4, 8, 9, 10);
    r('#ffd500', 6, 9, 5, 8);
    r('#fff799', 7, 11, 3, 5);
    r('#ffffff', 8, 12, 1, 3);
    // los parantes y la base
    r('#2e2230', 2, 6, 2, 13);
    r('#4a3440', 2, 6, 1, 13);
    r('#2e2230', 13, 6, 2, 13);
    r('#1a1420', 2, 19, 13, 1);
    r('#2e2230', 3, 20, 11, 2);
    r('#4a3440', 3, 20, 4, 1);
    r('#1a1420', 5, 22, 7, 1);
    r('#1a1420', 7, 23, 3, 1);
  });
  const polvo = brasero(
    Math.round((W * H) / 16000),
    (arranque) => {
      const max = kit.entre(4, 8);
      return { x: px + kit.entre(-W * 0.3, W * 0.3), y: arranque ? kit.entre(0, H * 0.7) : kit.entre(H * 0.2, H * 0.7), vx: kit.entre(-2, 2), vy: kit.entre(-4, -1), vida: arranque ? kit.entre(0, max) : 0, max, tipo: 1, fase: kit.entre(0, 6) };
    },
    (_m, f) => (f < 0.3 ? '#ff7b00' : f < 0.7 ? '#d86000' : '#7a0026'),
  );
  const angulo = (t: number): number => AMPLITUD * Math.sin(t * 1.7);
  return {
    ...perezosos(cuadros),
    base: 3,
    elegir: (t) => 3 + Math.round((angulo(t) / AMPLITUD) * 3),
    animar(x, dt, t, quieto) {
      const a = quieto ? 0 : angulo(t);
      const fx = Math.round(px + Math.sin(a) * largo);
      const fy = Math.round(Math.cos(a) * largo);
      // la cadena, eslabón por medio
      for (let j = 0; j < fy; j += 2) {
        x.fillStyle = j & 2 ? '#6e4c4c' : '#2e2230';
        x.fillRect(Math.round(px + ((fx - px) * j) / fy), j, j & 2 ? 1 : 2, 2);
      }
      x.drawImage(farol, fx - 8, fy);
      if (!quieto) polvo(x, dt);
    },
  };
}

// ───────────── el horizonte del arrabal (mapa y Fogón) ─────────────

/**
 * Ranchos, ombúes, un molino, la capilla y el alambrado: siluetas a contraluz con un filo de claridad a la izquierda.
 * `e` es la escala (las piezas están pensadas a 1 y se dibujan a celda entera a cualquier tamaño).
 */
function arrabal(P: Plano, yH: number, SIL: number, semilla: number, e: number): void {
  const { W } = P;
  const OSC = 0.3;
  const MEDIA = 0.65;
  const FILO = 1;
  const q = (v: number): number => Math.round(v * e);
  const g = Math.max(1, Math.round(e * 0.6));
  for (let x = -q(6), s = semilla; x < W; s++) {
    const r = r1(s * 3.7);
    if (r < 0.32) {
      // rancho: cuerpo bajo y techo a dos aguas (o galpón de media agua), a veces con chimenea y la ventana prendida
      const w = q(13 + Math.floor(r1(s + 0.2) * 10));
      const h = q(4 + Math.floor(r1(s + 0.4) * 3));
      const t = q(3 + Math.floor(r1(s + 0.6) * 3));
      const alero = q(2);
      P.rect(x, yH - h, w, h, SIL, OSC);
      if (r1(s + 0.9) < 0.5) P.rect(x + w - q(5), yH - h - t - q(1), q(2), t, SIL, OSC);
      const cumbre = r1(s + 0.8) < 0.7 ? x + w / 2 : x + w * 0.2;
      P.poligono([[x - alero, yH - h], [cumbre, yH - h - t], [x + w + alero, yH - h]], SIL, OSC);
      for (let k = 0; k < t; k++) P.rect(Math.round(x - alero + ((cumbre - x + alero) * k) / t), yH - h - k - 1, g + 1, 1, SIL, FILO);
      P.rect(x, yH - h, g, h, SIL, MEDIA);
      if (r1(s + 0.5) < 0.6) P.tinta(x + q(3) + Math.floor(r1(s + 0.1) * (w - q(7))), yH - h + q(1), r1(s + 0.15) < 0.5 ? '#ff7b00' : '#d86000', Math.max(1, q(0.8)), q(1.6));
      x += w + q(3 + Math.floor(r1(s + 0.3) * 9));
    } else if (r < 0.5) {
      // ombú: tronco ancho, raíces y copa enorme en dos masas
      const rx = q(8 + Math.floor(r1(s + 0.2) * 5));
      const ry = q(5 + Math.floor(r1(s + 0.4) * 3));
      P.rect(x + rx - q(2), yH - q(5), q(4), q(5), SIL, OSC);
      P.rect(x + rx - q(3), yH - q(2), q(6), q(2), SIL, OSC);
      P.rect(x + rx - q(2), yH - q(5), g, q(4), SIL, MEDIA);
      const copa = (dx: number, dy: number): number => (dx + dy * 1.4 < -0.95 ? FILO : dx + dy * 1.4 < -0.6 ? MEDIA : OSC);
      P.elipse(x + rx, yH - q(4) - ry, rx, ry, SIL, copa);
      P.elipse(x + rx * 0.45, yH - q(3) - ry * 0.7, rx * 0.5, ry * 0.6, SIL, copa);
      P.elipse(x + rx * 1.5, yH - q(3) - ry * 0.8, rx * 0.5, ry * 0.55, SIL, OSC);
      x += rx * 2 + q(4 + Math.floor(r1(s + 0.3) * 8));
    } else if (r < 0.6) {
      // molino de viento: torre calada, rueda y cola
      const h = q(15 + Math.floor(r1(s + 0.2) * 5));
      const eje = x + q(4);
      for (let j = 0; j < h; j++) {
        const a = Math.round(j / 5);
        P.rect(eje - a, yH - h + j, g, 1, SIL, MEDIA);
        P.rect(eje + a, yH - h + j, g, 1, SIL, OSC);
        if (j % q(4) === q(4) - 1) P.rect(eje - a, yH - h + j, a * 2 + 1, 1, SIL, OSC);
      }
      const R = q(3.4);
      for (let k = 0; k < 16; k++) {
        const a = (k * Math.PI) / 8;
        P.rect(Math.round(eje + Math.cos(a) * R), Math.round(yH - h - 1 + Math.sin(a) * R), g, g, SIL, a > Math.PI * 0.8 && a < Math.PI * 1.6 ? FILO : OSC);
        if (k % 2 === 0) P.rect(Math.round(eje + Math.cos(a) * R * 0.5), Math.round(yH - h - 1 + Math.sin(a) * R * 0.5), g, g, SIL, OSC);
      }
      P.rect(eje + R + g, yH - h - 1, q(4), q(2), SIL, OSC);
      x += q(16 + Math.floor(r1(s + 0.3) * 10));
    } else if (r < 0.68) {
      // la capilla: nave, torre con chapitel, cruz y la lámpara del campanario
      P.rect(x, yH - q(7), q(11), q(7), SIL, OSC);
      P.poligono([[x - q(1), yH - q(7)], [x + q(5.5), yH - q(11)], [x + q(12), yH - q(7)]], SIL, OSC);
      P.rect(x, yH - q(7), g, q(7), SIL, MEDIA);
      P.rect(x + q(11), yH - q(14), q(5), q(14), SIL, OSC);
      P.rect(x + q(11), yH - q(14), g, q(14), SIL, MEDIA);
      P.poligono([[x + q(10), yH - q(14)], [x + q(13.5), yH - q(19)], [x + q(17), yH - q(14)]], SIL, OSC);
      P.rect(x + q(13.5) - (g >> 1), yH - q(23), g, q(4), SIL, FILO);
      P.rect(x + q(12.5) - (g >> 1), yH - q(22), q(2) + g, g, SIL, FILO);
      P.tinta(x + q(13), yH - q(11), '#d86000', Math.max(1, q(0.8)), q(2));
      x += q(20 + Math.floor(r1(s + 0.3) * 8));
    } else {
      // alambrado: postes cortos y el hilo
      const w = q(14 + Math.floor(r1(s + 0.2) * 16));
      for (let k = 0; k < w; k += q(5)) P.rect(x + k, yH - q(3), g, q(3), SIL, OSC);
      P.cada(x, yH - q(2), w, 1, (xx, _y, i) => {
        if (xx & 1) {
          P.mat[i] = SIL;
          P.alb[i] = OSC;
        }
      });
      x += w;
    }
  }
}

// ───────────── el mapa ─────────────

function mapa(W: number, H: number, kit: Kit): Escenario {
  const vert = H > W;
  const yH = Math.round(H * (vert ? 0.125 : 0.175));
  const CIELO = 0;
  const SIL = 1;
  const CAMPO = 2;
  const P = new Plano(W, H, [
    { tonos: ['#07070f', '#0c0f26', '#141a3a', '#1e2450', '#2a2c5c', '#3c3a78', '#5a4a8a'], libre: true },
    { tonos: ['#05050b', '#0a0b1c', '#141a3a', '#2a2c5c'], libre: true },
    { tonos: ['#07070f', '#0a0d20', '#0f1530', '#161d40', '#1e2450', '#2a2c5c'] },
  ]);
  // el cielo: negro arriba (donde va el título) y la última claridad contra el horizonte, corrida a la izquierda
  P.cada(0, 0, W, yH, (x, y, i) => {
    const f = (y + 1) / yH;
    P.mat[i] = CIELO;
    P.alb[i] = Math.min(1, 0.1 + 0.62 * f ** 2.2 + 0.2 * f * Math.max(0, 1 - Math.abs(x / W - 0.3) / 0.55));
  });
  for (let k = 0; k < Math.round(W / 9); k++) {
    const sx = Math.floor(r1(k * 1.3 + 5) * W);
    const sy = Math.floor(r1(k * 2.9 + 8) ** 1.5 * yH * 0.62);
    P.tinta(sx, sy, k % 5 === 0 ? '#b9aacb' : '#6b5a86');
  }
  // el campo: la claridad del horizonte se pierde hacia el frente; rayas de pasto más juntas cuanto más lejos
  P.cada(0, yH, W, H - yH, (x, y, i) => {
    const f = (y - yH) / (H - yH);
    P.mat[i] = CAMPO;
    P.alb[i] = 0.62 + 0.5 * Math.exp(-f * 9) + 0.14 * (veta(x / (10 + f * 50), Math.floor(f ** 0.5 * 60) * 3.1) - 0.5) + 0.06 * (r2(x, y) - 0.5);
  });
  P.rect(0, yH, W, 1, CAMPO, 0.3);
  for (let k = 0; k < 16; k++) {
    const f = (k / 16) ** 1.9;
    const y = yH + 3 + Math.round(f * (H - yH));
    const largo = 4 + f * 22;
    for (let x = -Math.floor(r1(k) * 30); x < W; ) {
      const w = Math.round(largo * (0.5 + r1(x * 0.7 + k * 13)));
      if (r1(x * 1.1 + k * 3) < 0.55) P.velar(x, y, w, 1, 1.28);
      x += w + Math.round(largo * (0.6 + r1(x * 0.3 + k)));
    }
  }
  // matas de paja brava: más grandes cuanto más cerca
  for (let k = 0; k < Math.round((W * H) / 2600); k++) {
    const f = r1(k * 4.1 + 2) ** 1.3;
    const x = Math.floor(r1(k * 7.3 + 1) * W);
    const y = yH + 5 + Math.floor(f * (H - yH - 8));
    const g = 1 + Math.round(f * 4);
    P.velar(x, y - g, 1, g + 1, 1.5);
    P.velar(x - 2, y - g + 1, 1, g, 1.3);
    P.velar(x - 1, y - (g >> 1), 1, (g >> 1) + 1, 1.2);
    P.velar(x + 2, y - g + 1, 1, g, 0.7);
    P.velar(x + 3, y, g + 1, 1, 0.6);
  }
  arrabal(P, yH + 1, SIL, 11, vert ? 1.3 : 1.8);
  // la luna menguante, baja, con el filo a la izquierda
  const lx = Math.round(W * 0.52);
  const ly = Math.round(yH * 0.3);
  const lr = vert ? 6 : 8;
  P.cada(lx - lr, ly - lr, lr * 2, lr * 2, (x, y) => {
    const d = Math.hypot(x + 0.5 - lx, y + 0.5 - ly);
    if (d < lr && Math.hypot(x + 0.5 - lx - lr * 0.55, y + 0.5 - ly + lr * 0.2) > lr * 0.95) P.tinta(x, y, d > lr - 1.5 && x < lx ? '#f4efe2' : '#b9aacb');
  });
  const cuadros = [() => P.cuadro([{ x: W * 0.5, y: H * 0.42, rx: W * 0.75, ry: H * 0.8, g: 0.62 }], 0.3)];

  // la niebla: tres bancos tramados, del azul del campo, que derivan a distinto paso
  const alto = Math.max(12, Math.round(H * 0.1));
  const tiras = [tiraNiebla(W, Math.round(alto * 0.7), '#2a2c5c', 0.5, 2.1), tiraNiebla(W, alto, '#1e2450', 0.56, 5.3), tiraNiebla(W, Math.round(alto * 1.4), '#161d40', 0.6, 8.9)];
  const ys = [yH - Math.round(alto * 0.3), Math.round(H * (vert ? 0.33 : 0.4)), Math.round(H * (vert ? 0.6 : 0.63))];
  const vs = [2.2, -1.4, 3.1];
  const bichos = brasero(
    Math.round((W * H) / 14000),
    (arranque) => {
      const max = kit.entre(3, 7);
      return { x: kit.entre(0, W), y: kit.entre(yH + 6, H), vx: kit.entre(-3, 3), vy: kit.entre(-2, 1), vida: arranque ? kit.entre(0, max) : -kit.entre(0, 3), max, tipo: 0, fase: kit.entre(0, 6) };
    },
    (_m, f) => (f < 0.15 || f > 0.85 ? '#3c3a78' : f < 0.5 ? '#b4f03c' : '#22d95b'),
  );
  return {
    ...perezosos(cuadros),
    base: 0,
    elegir: () => 0,
    animar(x, dt, t, quieto) {
      for (let i = 0; i < 3; i++) correrTira(x, tiras[i], t * vs[i], ys[i]);
      if (!quieto) bichos(x, dt);
    },
  };
}

// ───────────── el Fogón ─────────────

function fogon(W: number, H: number, kit: Kit): Escenario {
  const vert = H > W;
  const yH = Math.round(H * (vert ? 0.2 : 0.3));
  // el fuego, donde la pantalla deja un claro: bajo los paneles en apaisado, entre «Seguir» y el HUD en móvil
  const fx = Math.round(W * (vert ? 0.5 : 0.52));
  const fy = Math.round(H * (vert ? 0.795 : 0.725));
  const s = vert ? 1.15 : 2.1;
  const q = (v: number): number => Math.round(v * s);
  const CIELO = 0;
  const SIL = 1;
  const TIERRA = 2;
  const LENIA = 3;
  const PIEDRA = 4;
  const P = new Plano(W, H, [
    { tonos: ['#07060d', '#0c0a1c', '#140f2a', '#1e1638', '#2a1c44'], libre: true },
    { tonos: ['#05050b', '#0c0a1a', '#1c1230', '#3a1a34'], libre: true },
    { tonos: ['#0a0710', '#180a14', '#2a0e16', '#421816', '#5e2814', '#7e3e16', '#9c5a1e'] },
    { tonos: ['#0b0711', '#24100f', '#40190f', '#6b3414', '#a05a1e', '#d08a3a'] },
    { tonos: ['#0a0810', '#1a1420', '#2e2230', '#4a3440', '#6e4c4c', '#967062'] },
  ]);
  // la noche del campo: cielo hondo, estrellas y el arrabal lejos
  P.cada(0, 0, W, yH, (x, y, i) => {
    const f = (y + 1) / yH;
    P.mat[i] = CIELO;
    P.alb[i] = Math.min(1, 0.08 + 0.5 * f ** 2 + 0.06 * (r2(x >> 3, y >> 3) - 0.5));
  });
  for (let k = 0; k < Math.round((W * yH) / 420); k++) P.tinta(Math.floor(r1(k * 1.9 + 3) * W), Math.floor(r1(k * 3.3 + 7) ** 1.4 * yH * 0.8), k % 6 === 0 ? '#b9aacb' : k % 3 === 0 ? '#6b5a86' : '#3a2a5c');
  // la tierra apisonada: grano, cascotes y matas, que la luz del fuego va sacando de lo negro
  P.cada(0, yH, W, H - yH, (x, y, i) => {
    P.mat[i] = TIERRA;
    P.alb[i] = 0.8 + 0.2 * (veta(x / 14, (y >> 1) * 3.7) - 0.5) + 0.1 * (r2(x, y) - 0.5);
  });
  P.rect(0, yH, W, 1, TIERRA, 0.3);
  for (let k = 0; k < Math.round((W * H) / 1500); k++) {
    const x = Math.floor(r1(k * 5.1 + 1) * W);
    const y = yH + 3 + Math.floor(r1(k * 2.3 + 6) * (H - yH - 4));
    if (Math.hypot(x - fx, (y - fy) * 2) < 26 * s) continue;
    const haciaFuego = x < fx ? 1 : -1;
    if (k % 3) {
      // un cascote: luz del lado del fuego, sombra larga del otro
      P.velar(x, y, 3, 2, 1.35);
      P.velar(x + haciaFuego, y, 2, 1, 1.2);
      P.velar(x - haciaFuego * 4, y + 1, 4, 1, 0.5);
    } else {
      // una mata de pasto
      P.velar(x, y - 4, 1, 5, 1.3);
      P.velar(x - 2, y - 2, 1, 3, 1.15);
      P.velar(x + 2, y - 3, 1, 4, 0.75);
      P.velar(x - haciaFuego * 5, y + 1, 5, 1, 0.55);
    }
  }
  arrabal(P, yH + 1, SIL, 37, vert ? 1.3 : 1.8);
  // el ruedo de piedras (las de atrás primero), cada una con su cara al fuego encendida
  const RX = 17 * s;
  const RY = 6.5 * s;
  const piedra = (a: number): void => {
    const x = fx + Math.cos(a) * RX;
    const y = fy + Math.sin(a) * RY;
    const g = (2.8 + 1.3 * r1(a * 9.1)) * s;
    P.sombra(x + Math.cos(a) * g, y + g * 0.6, g * 1.5, g * 0.7, 0.55);
    P.elipse(x, y, g, g * 0.74, PIEDRA, (dx, dy) => {
      const cara = -(dx * Math.cos(a) + dy * Math.sin(a) * 0.6) + (dy < -0.3 ? 0.25 : 0); // 1 mirando al fuego
      return cara > 0.45 ? 1.5 : cara > -0.1 ? 0.95 : cara > -0.6 ? 0.6 : 0.4;
    });
  };
  const N = 10;
  for (let k = 0; k < N; k++) piedra(Math.PI + ((k + 0.5) / N) * Math.PI); // el arco de atrás
  // la ceniza y el rescoldo
  P.elipse(fx, fy, RX - 4 * s, RY - 4 * s * 0.5, TIERRA, (dx, dy) => 0.22 + 0.22 * (dx * dx + dy * dy));
  for (let k = 0; k < Math.round(26 * s); k++) {
    const a = r1(k * 3.3) * Math.PI * 2;
    const d = r1(k * 7.9) ** 0.7;
    P.tinta(Math.round(fx + Math.cos(a) * d * (RX - 6 * s)), Math.round(fy + Math.sin(a) * d * (RY - 3 * s)), k % 4 === 0 ? '#ffd500' : k % 2 ? '#ff7b00' : '#7a0026', k % 5 === 0 ? 2 : 1, 1);
  }
  // los leños: dos cruzados y uno parado contra ellos, con la corteza clara arriba, las vetas y la cabeza del corte
  const lenio = (x0: number, y0: number, x1: number, y1: number, g: number): void => {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    const parado = Math.abs(y1 - y0) > Math.abs(x1 - x0);
    for (let j = 0; j <= n; j++) {
      const x = Math.round(x0 + ((x1 - x0) * j) / n);
      const y = Math.round(y0 + ((y1 - y0) * j) / n);
      for (let k = 0; k < g; k++) {
        const xx = parado ? x + k : x;
        const yy = parado ? y : y + k;
        if (yy < 0 || yy >= H || xx < 0 || xx >= W) continue;
        const i = yy * W + xx;
        const f = k / (g - 1);
        P.mat[i] = LENIA;
        P.fijo[i] = 0;
        P.alb[i] = (f < 0.25 ? 1.4 : f > 0.8 ? 0.38 : f > 0.55 ? 0.62 : 0.9) * (r2(j >> 2, k + x0) < 0.3 ? 0.72 : 1);
      }
    }
    // la cabeza del corte, clara, con su anillo
    for (let k = 0; k < g; k++) {
      const xx = parado ? x1 + k : x1;
      const yy = parado ? y1 : y1 + k;
      P.rect(xx, yy, parado ? 1 : 2, parado ? 2 : 1, LENIA, k === 0 || k === g - 1 ? 1.1 : 1.7);
    }
  };
  lenio(fx - q(15), fy + q(1), fx + q(11), fy - q(4), q(3.6));
  lenio(fx - q(11), fy - q(5), fx + q(15), fy - q(0.5), q(3.6));
  lenio(fx - q(4), fy - q(1), fx + q(3), fy - q(11), q(3.2));
  // el rescoldo vivo entre los leños
  P.tinta(fx - q(3), fy - q(2), '#ff7b00', q(4), Math.max(1, q(0.6)));
  P.tinta(fx - q(1), fy - q(2), '#ffd500', q(1.5), Math.max(1, q(0.6)));
  P.tinta(fx + q(4), fy - q(1), '#d86000', q(3), Math.max(1, q(0.6)));
  P.tinta(fx - q(8), fy + q(0.5), '#7a0026', q(3), 1);
  for (let k = 0; k < N - 3; k++) piedra(((k + 0.5) / (N - 3)) * Math.PI); // el arco de adelante
  // la pava, arrimada al rescoldo: panza de hierro, tapa, pico y asa
  const pxv = fx + Math.round(RX) + q(8);
  const pyv = fy + q(2);
  P.sombra(pxv + q(6), pyv, q(9), q(2.5), 0.6);
  P.elipse(pxv, pyv - q(4), q(5.5), q(4), PIEDRA, (dx, dy) => (dx < -0.25 && dx > -0.8 && dy < 0.5 ? 1.5 : dx > 0.45 ? 0.38 : dy > 0.6 ? 0.45 : 0.8));
  P.rect(pxv - q(3), pyv - q(8.6), q(6), Math.max(1, q(0.8)), PIEDRA, 1);
  P.rect(pxv - q(1), pyv - q(9.6), q(2), q(1), PIEDRA, 1.4);
  P.poligono([[pxv + q(4.5), pyv - q(4)], [pxv + q(9), pyv - q(8)], [pxv + q(9), pyv - q(6.6)], [pxv + q(5), pyv - q(2.6)]], PIEDRA, 0.55);
  const asa = Math.max(1, q(0.6));
  P.rect(pxv - q(4.5), pyv - q(12), asa, q(5), PIEDRA, 1.1);
  P.rect(pxv - q(4.5), pyv - q(12.5), q(8.5), asa, PIEDRA, 0.95);
  P.rect(pxv + q(4) - asa, pyv - q(12), asa, q(5), PIEDRA, 0.5);

  // el redondel de luz respira: cinco cuadros, del fuego recogido al fuego abierto
  const cuadros = [0.88, 0.94, 1, 1.06, 1.12].map((ap) => () =>
    P.cuadro(
      [
        { x: fx, y: fy - q(3), rx: W * (vert ? 1.15 : 0.55) * ap, ry: H * (vert ? 0.4 : 0.62) * ap, g: 0.74 * ap },
        { x: fx, y: fy - q(3), rx: 40 * s * ap, ry: 20 * s * ap, g: 0.55 },
      ],
      0.1,
    ),
  );
  const llama = llamas(q(19), q(25), 6);
  const chispas = brasero(
    Math.round((W * H) / 9000),
    (arranque) => {
      const max = kit.entre(1.6, 4.5);
      const vida = arranque ? kit.entre(0, max) : 0;
      const vy = kit.entre(-24, -10) * (vert ? 0.8 : 1.3);
      return { x: fx + kit.entre(-6, 6) * s + (arranque ? kit.entre(-12, 12) : 0), y: fy - 14 * s + vy * vida, vx: kit.entre(-6, 6), vy, vida, max, tipo: 1, fase: kit.entre(0, 6) };
    },
    (_m, f) => (f < 0.25 ? '#fff799' : f < 0.5 ? '#ffd500' : f < 0.8 ? '#ff7b00' : '#7a0026'),
  );
  return {
    ...perezosos(cuadros),
    base: 2,
    elegir: (t) => Math.max(0, Math.min(4, 2 + Math.round(1.5 * Math.sin(t * 1.5) + 0.6 * Math.sin(t * 7.3 + 1)))),
    animar(x, dt, t, quieto) {
      const c = llama[quieto ? 0 : Math.floor(t * 9) % llama.length];
      x.drawImage(c, fx - (c.width >> 1), fy - q(2) - c.height + 1);
      if (!quieto) chispas(x, dt);
    },
  };
}

// ───────────── los finales: el amanecer y la vela que se apaga ─────────────

/**
 * «La Corte cayó»: amanece sobre el arrabal. El cielo pasa del índigo de la noche al carmesí y al oro contra el
 * horizonte, con los rayos del sol que asoma detrás de los ranchos (el sol cae justo detrás del Personaje), las últimas
 * estrellas arriba y el campo que agarra la luz de frente. Lo que se mueve: polvo de oro que sube.
 */
function amanecer(W: number, H: number, kit: Kit): Escenario {
  const vert = H > W;
  const yH = Math.round(H * (vert ? 0.44 : 0.6));
  // el sol queda detrás del Personaje (al centro, a la altura de su retrato), ya despegado del horizonte
  const sx = W * 0.5;
  const sy = Math.round(H * (vert ? 0.17 : 0.39));
  const sr = Math.max(10, Math.round(Math.min(W, H) * (vert ? 0.16 : 0.19)));
  const CIELO = 0;
  const SIL = 1;
  const CAMPO = 2;
  const P = new Plano(W, H, [
    { tonos: ['#09070f', '#120a24', '#2e0f52', '#5a1e96', '#7a0026', '#d0104a', '#d86000', '#ff7b00', '#ffd500', '#fff799'], libre: true },
    { tonos: ['#09070f', '#120a24', '#2e0f52', '#47062c'], libre: true },
    { tonos: ['#09070f', '#150a1c', '#2e0f52', '#47062c', '#7a0026', '#d86000', '#ff7b00'] },
  ]);
  // el cielo: claridad que sube hacia el horizonte y hacia el sol, y los rayos en abanico (cuñas más claras)
  P.cada(0, 0, W, yH, (x, y, i) => {
    const f = (y + 1) / yH;
    const dx = x + 0.5 - sx;
    const dy = sy - y;
    const ang = Math.atan2(dy, dx);
    const rayo = Math.cos(ang * 22) > 0.55 ? 0.09 : 0;
    const cerca = Math.max(0, 1 - Math.hypot(dx / (W * 0.55), (yH - y) / (yH * 1.1)));
    P.mat[i] = CIELO;
    const halo = Math.max(0, 1 - Math.hypot(dx, dy) / (sr * 3.2));
    P.alb[i] = Math.min(1, 0.04 + 0.5 * f ** 1.6 + 0.36 * cerca ** 1.5 + 0.45 * halo ** 1.4 + rayo * Math.max(cerca, halo));
  });
  for (let k = 0; k < Math.round(W / 10); k++) {
    const x = Math.floor(r1(k * 1.7 + 3) * W);
    const y = Math.floor(r1(k * 3.1 + 7) ** 1.8 * yH * 0.4);
    P.tinta(x, y, k % 4 === 0 ? '#c88bff' : '#5a1e96');
  }
  // el sol: disco de oro claro con su corona tramada (el horizonte lo corta si baja hasta ahí)
  P.cada(sx - sr - 3, sy - sr - 3, sr * 2 + 7, Math.min(sr * 2 + 7, yH - (sy - sr - 3)), (x, y) => {
    const d = Math.hypot(x + 0.5 - sx, y + 0.5 - sy);
    if (d < sr - 2) P.tinta(x, y, d < sr * 0.6 ? '#fffbe0' : '#fff799');
    else if (d < sr) P.tinta(x, y, '#ffd500');
    else if (d < sr + 2 && ((x + y) & 1) === 0) P.tinta(x, y, '#ffd500');
  });
  // el campo: agarra la luz del sol de frente y se apaga hacia abajo
  P.cada(0, yH, W, H - yH, (x, y, i) => {
    const f = (y - yH) / (H - yH);
    P.mat[i] = CAMPO;
    P.alb[i] = 0.5 + 0.45 * Math.exp(-f * 5) + 0.12 * (veta(x / (10 + f * 40), Math.floor(f ** 0.5 * 50) * 3.1) - 0.5) + 0.05 * (r2(x, y) - 0.5);
  });
  // el camino de luz del sol sobre el campo, angostándose hacia el frente
  P.cada(0, yH, W, H - yH, (x, y, i) => {
    const f = (y - yH) / (H - yH);
    const ancho = sr * (1.1 - f * 0.5);
    if (Math.abs(x + 0.5 - sx) < ancho && r2(x >> 1, y) > 0.35 + f * 0.4) P.alb[i] *= 1.25;
  });
  arrabal(P, yH + 1, SIL, 23, vert ? 1.3 : 1.8);
  const cuadros = [0.96, 1, 1.05].map((a) => () => P.cuadro([{ x: sx, y: sy, rx: W * 0.9 * a, ry: H * 0.8 * a, g: 0.55 }], 0.32));
  // polvo de oro que sube despacio desde el campo
  const polvo = brasero(
    Math.round((W * H) / 12000),
    (arranque) => {
      const max = kit.entre(4, 9);
      return { x: kit.entre(0, W), y: arranque ? kit.entre(yH * 0.5, H) : H + 2, vx: kit.entre(-2, 2), vy: kit.entre(-8, -3), vida: arranque ? kit.entre(0, max) : 0, max, tipo: 1, fase: kit.entre(0, 6) };
    },
    (_m, f) => (f < 0.3 ? '#fff799' : f < 0.7 ? '#ffd500' : '#d86000'),
  );
  return {
    ...perezosos(cuadros),
    base: 1,
    elegir: (_t, respiro) => Math.min(2, Math.max(0, respiro - 1)),
    animar(x, dt, _t, quieto) {
      if (!quieto) polvo(x, dt);
    },
  };
}

/**
 * «Te llevó la Corte»: la misma mesa de tablas, con la vela que se apaga: la luz casi cerrada (dos cuadros que apenas
 * respiran), el pabilo que queda en brasa y la columna de humo que sube de él.
 */
function velaQueSeApaga(P: Plano, candil: (ap: number, g: number) => Luz[], vert: boolean, px: number, py: number, W: number, H: number, kit: Kit): Escenario {
  const cuadros = [
    [0.8, 0.4],
    [0.84, 0.46],
  ].map(([ap, g]) => () => P.cuadro(candil(ap, g), 0.08));
  const humos = [copo(5, '#3a2a4a', 0.5, 1.3), copo(7, '#2e2238', 0.45, 2.9), copo(9, '#241a2e', 0.4, 4.1)];
  const hilos = Array.from({ length: 7 }, (_, i) => ({ y: py - 4 - i * 9, x: 0, s: i % 3 }));
  return {
    ...perezosos(cuadros),
    base: 0,
    elegir: (_t, respiro) => respiro % 2,
    animar(x, dt, t, quieto) {
      if (vert) return;
      // la brasa del pabilo: titila entre dos tintas
      x.fillStyle = quieto || Math.floor(t * 3) % 2 ? '#ff7b00' : '#d86000';
      x.fillRect(px - 1, py - 4, 2, 2);
      x.fillStyle = '#7a0026';
      x.fillRect(px - 1, py - 2, 2, 1);
      // el humo: sube del pabilo, se abre y se hamaca
      for (const h of hilos) {
        if (!quieto) {
          h.y -= 6 * dt;
          if (h.y < py - H * 0.45) h.y = py - 4;
        }
        const sube = (py - 4 - h.y) / (H * 0.45);
        const c = humos[Math.min(2, Math.floor(sube * 3))];
        const dx = Math.round(Math.sin(t * 0.8 + h.y * 0.07) * (2 + sube * 10));
        x.drawImage(c, Math.round(px - c.width / 2 + dx), Math.round(h.y - c.height / 2));
      }
      void W;
      void kit;
    },
  };
}

/** Arma la escena de una parada a ese tamaño (en celdas). `palo` es el clima del Rey, solo para la mesa. */
export function armarEscenario(escena: Escena, palo: Palo | null, W: number, H: number, kit: Kit): Escenario {
  switch (escena) {
    case 'mesa':
      return mesa(W, H, palo, kit);
    case 'pulperia':
      return pulperia(W, H, kit);
    case 'mapa':
      return mapa(W, H, kit);
    case 'fogon':
      return fogon(W, H, kit);
    case 'altar':
      return penumbra(ALTAR, W, H, kit);
    case 'amanecer':
      return amanecer(W, H, kit);
    case 'ocaso':
      return mesa(W, H, null, kit, true);
    default:
      return penumbra(PORTADA, W, H, kit);
  }
}
