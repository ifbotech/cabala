// La librería de efectos de la mesa: el tajo de cada palo, chispas, monedas que vuelan al HUD, números de daño con
// gravedad, el naipe enemigo que se raja en dos mitades, el aura de los Reyes y la lluvia de oro. Todo son celdas
// enteras: rampas duras en el color, resplandor tramado en la luz, un cuadro blanco de impacto y afuera.
// Las coordenadas de entrada son píxeles de pantalla.
import type { Palo } from '../../rules/cartas';
import { cifraMapa, type TonoCifra } from '../pixel/cifras';
import { lienzo } from '../sprites';
import { S, aCelda, azar, disco, efecto, entre, vivos, type Ctx, type Efecto } from './motor';
import { pedir, soltar, type Ancla, type Caja } from './director';

/** Rampas de cada palo, del cuadro blanco del impacto a la brasa que se apaga. */
export const RAMPA_PALO: Record<Palo | 'X', string[]> = {
  S: ['#ffffff', '#b8f6ff', '#00c8ff', '#2c7bf0', '#1440b8'],
  C: ['#ffffff', '#b4f03c', '#22d95b', '#139a3c', '#0b5e28'],
  D: ['#ffffff', '#fff799', '#ffd500', '#ff7b00', '#d86000'],
  H: ['#ffffff', '#ff6e8e', '#ff1453', '#f0124a', '#7a0026'],
  X: ['#ffffff', '#c88bff', '#9038d8', '#5a1e96', '#2e0f52'],
};

interface Particula {
  x: number;
  y: number;
  vx: number;
  vy: number;
  g: number;
  vida: number;
  max: number;
  tam: number;
  rampa: string[];
  /** Color del resplandor que deja en el lienzo de luz (o nada). */
  luz?: string;
  freno?: number;
}

class Particulas implements Efecto {
  constructor(private ps: Particula[]) {}
  paso(dt: number): boolean {
    for (let i = this.ps.length - 1; i >= 0; i--) {
      const p = this.ps[i];
      p.vida += dt;
      if (p.vida < 0) continue;
      if (p.vida >= p.max) {
        this.ps.splice(i, 1);
        continue;
      }
      p.vy += p.g * dt;
      if (p.freno) {
        p.vx *= 1 - p.freno * dt;
        p.vy *= 1 - p.freno * dt;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    return this.ps.length > 0;
  }
  pinta(c: Ctx, l: Ctx): void {
    for (const p of this.ps) {
      if (p.vida < 0) continue;
      const f = p.vida / p.max;
      c.fillStyle = p.rampa[Math.min(p.rampa.length - 1, Math.floor(f * p.rampa.length))];
      c.fillRect(Math.round(p.x), Math.round(p.y), p.tam, p.tam);
      if (p.luz && f < 0.5) {
        const d = disco(p.luz, p.tam * 3);
        l.drawImage(d, Math.round(p.x - d.width / 2), Math.round(p.y - d.height / 2));
      }
    }
  }
}

/** Un chisporroteo que sale de un punto. */
export function chispas(x: number, y: number, rampa: string[], n = 12, fuerza = 70, g = 120): void {
  const cx = aCelda(x);
  const cy = aCelda(y);
  const ps: Particula[] = [];
  for (let i = 0; i < n; i++) {
    const a = entre(0, Math.PI * 2);
    const v = entre(fuerza * 0.3, fuerza);
    ps.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - fuerza * 0.2, g, vida: 0, max: entre(0.25, 0.6), tam: azar() < 0.3 ? 2 : 1, rampa, luz: rampa[2], freno: 1.5 });
  }
  efecto(new Particulas(ps));
}

/** El destello de cuatro puntas de un impacto: nace blanco, se abre y se apaga en dos tiempos. */
export function destello(x: number, y: number, rampa: string[], radio = 14): void {
  const cx = Math.round(aCelda(x));
  const cy = Math.round(aCelda(y));
  let t = 0;
  const T = 0.22;
  efecto({
    paso(dt) {
      t += dt;
      return t < T;
    },
    pinta(c, l) {
      const f = t / T;
      const r = Math.round(radio * (f < 0.4 ? f / 0.4 : 1 - (f - 0.4) * 0.8));
      c.fillStyle = rampa[f < 0.35 ? 0 : f < 0.7 ? 1 : 2];
      const g = f < 0.5 ? 2 : 1;
      c.fillRect(cx - r, cy - (g >> 1), r * 2, g);
      c.fillRect(cx - (g >> 1), cy - r, g, r * 2);
      const m = Math.round(r * 0.45);
      c.fillRect(cx - m, cy - m, m * 2, m * 2);
      const d = disco(rampa[2], radio * 1.6);
      l.drawImage(d, cx - d.width / 2, cy - d.height / 2);
    },
  });
}

/**
 * El tajo de Espadas: una media luna de acero que cruza en diagonal, con la cabeza blanca y la cola de cian. `dir`
 * -1 lo espeja (el revés) y `demora` lo hace esperar unos segundos antes de cortar.
 */
function tajoEspadas(cx: number, cy: number, r: number, dir = 1, demora = 0, rampa = RAMPA_PALO.S): void {
  let t = -demora;
  const T = 0.26;
  efecto({
    paso(dt) {
      t += dt;
      return t < T + 0.12;
    },
    pinta(c, l) {
      if (t < 0) return;
      const cabeza = Math.min(1, t / T);
      const cola = Math.max(0, (t - 0.1) / T);
      const pasos = Math.ceil(r * 3);
      for (let i = 0; i <= pasos; i++) {
        const u = i / pasos;
        if (u > cabeza || u < cola) continue;
        // la curva: una diagonal con panza
        const a = (u * 2 - 1) * r;
        const b = Math.sin(u * Math.PI) * r * 0.32;
        const x = Math.round(cx + dir * (a + b) * 0.7071);
        const y = Math.round(cy + (a - b) * 0.7071);
        const cerca = (cabeza - u) / Math.max(0.001, cabeza - cola);
        const grosor = cerca < 0.25 ? 3 : cerca < 0.6 ? 2 : 1;
        c.fillStyle = rampa[cerca < 0.2 ? 0 : cerca < 0.45 ? 1 : cerca < 0.75 ? 2 : 3];
        c.fillRect(x - (grosor >> 1), y - (grosor >> 1), grosor, grosor);
      }
      const hx = cx + dir * ((cabeza * 2 - 1) * r + Math.sin(cabeza * Math.PI) * r * 0.32) * 0.7071;
      const hy = cy + ((cabeza * 2 - 1) * r - Math.sin(cabeza * Math.PI) * r * 0.32) * 0.7071;
      const d = disco(rampa[2], r * 0.7);
      l.drawImage(d, Math.round(hx - d.width / 2), Math.round(hy - d.height / 2));
    },
  });
}

/** El golpe de Bastos: una onda de choque en anillo punteado y astillas que saltan. */
function golpeBastos(cx: number, cy: number, r: number): void {
  let t = 0;
  const T = 0.3;
  const rampa = RAMPA_PALO.C;
  efecto({
    paso(dt) {
      t += dt;
      return t < T;
    },
    pinta(c, l) {
      const f = t / T;
      const radio = r * (0.3 + 0.9 * (1 - (1 - f) ** 3));
      c.fillStyle = rampa[f < 0.25 ? 0 : f < 0.55 ? 1 : f < 0.8 ? 2 : 3];
      const n = Math.ceil(radio * 6);
      for (let i = 0; i < n; i++) {
        // el anillo se va raleando: tramado en el tiempo
        if (f > 0.5 && i % 2 === 0) continue;
        if (f > 0.8 && i % 4 !== 1) continue;
        const a = (i / n) * Math.PI * 2;
        c.fillRect(Math.round(cx + Math.cos(a) * radio), Math.round(cy + Math.sin(a) * radio * 0.8), f < 0.3 ? 2 : 1, f < 0.3 ? 2 : 1);
      }
      const d = disco(rampa[2], radio * 0.9);
      if (f < 0.5) l.drawImage(d, Math.round(cx - d.width / 2), Math.round(cy - d.height / 2));
    },
  });
  const ps: Particula[] = [];
  const astilla = ['#e0a050', '#a0602a', '#6b2e1a', '#3a1426'];
  for (let i = 0; i < 14; i++) {
    const a = entre(-Math.PI, 0);
    const v = entre(40, 110);
    ps.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 260, vida: 0, max: entre(0.35, 0.7), tam: azar() < 0.4 ? 2 : 1, rampa: i % 3 ? astilla : rampa });
  }
  efecto(new Particulas(ps));
}

/** La fortuna de Oros: un fogonazo y monedas que saltan con gravedad. */
function estallidoOros(cx: number, cy: number, r: number): void {
  const ps: Particula[] = [];
  for (let i = 0; i < 16; i++) {
    const a = entre(-Math.PI * 0.95, -Math.PI * 0.05);
    const v = entre(60, 150);
    ps.push({ x: cx + entre(-r * 0.3, r * 0.3), y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 340, vida: 0, max: entre(0.5, 0.9), tam: 2, rampa: ['#fff799', '#ffd500', '#ffd500', '#ff7b00', '#d86000'], luz: '#ff7b00' });
  }
  efecto(new Particulas(ps));
}

/** El brindis de Copas: una salpicadura de vino en arco, con sus gotas. */
function salpicaCopas(cx: number, cy: number, r: number): void {
  const rampa = RAMPA_PALO.H;
  const ps: Particula[] = [];
  for (let i = 0; i < 20; i++) {
    const a = entre(-Math.PI * 0.85, -Math.PI * 0.15);
    const v = entre(50, 130);
    ps.push({ x: cx + entre(-r * 0.2, r * 0.2), y: cy + entre(-2, 2), vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 300, vida: 0, max: entre(0.4, 0.8), tam: azar() < 0.35 ? 2 : 1, rampa: rampa.slice(1), luz: i % 4 === 0 ? rampa[2] : undefined });
  }
  efecto(new Particulas(ps));
}

/** El efecto del golpe de un palo sobre el enemigo: cada palo pega a su manera. `r` es el radio en píxeles. */
export function tajo(palo: Palo | 'X', x: number, y: number, r: number): void {
  const cx = aCelda(x);
  const cy = aCelda(y);
  const rc = aCelda(r);
  destello(x, y, RAMPA_PALO[palo], rc * 0.55);
  if (palo === 'S') tajoEspadas(cx, cy, rc);
  else if (palo === 'C') golpeBastos(cx, cy, rc);
  else if (palo === 'D') estallidoOros(cx, cy, rc);
  else if (palo === 'H') salpicaCopas(cx, cy, rc);
  else chispas(x, y, RAMPA_PALO.X, 18, 110);
  chispas(x, y, RAMPA_PALO[palo], 8, 90);
}

/** Monedas que vuelan en arco de un punto a otro (del enemigo abatido al oro del HUD). */
export function monedas(x0: number, y0: number, x1: number, y1: number, n = 8, alLlegar?: () => void): void {
  const ax = aCelda(x0);
  const ay = aCelda(y0);
  const bx = aCelda(x1);
  const by = aCelda(y1);
  const ms = Array.from({ length: n }, (_, i) => ({ t: -i * 0.04, dur: entre(0.45, 0.7), ox: entre(-12, 12), oy: entre(-10, 6), alto: entre(18, 46) }));
  let avisado = false;
  efecto({
    paso(dt) {
      let vivas = 0;
      for (const m of ms) {
        m.t += dt;
        if (m.t < m.dur) vivas++;
        else if (!avisado) {
          avisado = true;
          alLlegar?.();
        }
      }
      return vivas > 0;
    },
    pinta(c, l) {
      for (const m of ms) {
        if (m.t < 0 || m.t >= m.dur) continue;
        const f = m.t / m.dur;
        const e = f * f * (3 - 2 * f);
        const x = Math.round(ax + m.ox * (1 - e) + (bx - ax) * e);
        const y = Math.round(ay + m.oy * (1 - e) + (by - ay) * e - Math.sin(f * Math.PI) * m.alto);
        // la moneda gira: alterna ancha y de canto
        const canto = Math.floor(m.t * 14) % 3 === 0;
        c.fillStyle = '#d86000';
        c.fillRect(x - (canto ? 0 : 1), y - 1, canto ? 2 : 4, 4);
        c.fillStyle = '#ffd500';
        c.fillRect(x - (canto ? 0 : 1), y - 1, canto ? 1 : 3, 3);
        c.fillStyle = '#fff799';
        c.fillRect(x - (canto ? 0 : 1), y - 1, 1, 1);
        const d = disco('#ff7b00', 5);
        l.drawImage(d, x - 5, y - 4);
      }
    },
  });
}

/** Un número que salta del golpe, sube, cae con gravedad y se apaga parpadeando. */
const enVuelo = new Set<{ apagar: (forzar?: boolean) => void }>();
/** Apaga los números que están en el aire (entra un cartel o un rótulo en su lugar: un texto grande por vez); con
 * orzar, también el grande que todavía no cumplió su vida garantizada. */
export function limpiarNumeros(forzar = false): void {
  for (const n of enVuelo) n.apagar(forzar);
  enVuelo.clear();
}
const glifosDe = (texto: string | number, tono: TonoCifra) => [...String(texto).replace('×', 'x').replace('−', '-')].map((ch) => lienzo(`cf:${tono}:${ch}`, () => cifraMapa(ch, tono)));
/** Lo que mide un número de `numero` en píxeles de pantalla (para apartarlo de sus vecinos antes de soltarlo). */
export function medidaNumero(texto: string | number, escala = 1): { w: number; h: number } {
  const g = glifosDe(texto, 'hueso');
  return { w: g.reduce((s, x) => s + x.width - 1, 0) * escala * S, h: (g[0]?.height ?? 9) * escala * S };
}
/**
 * Un número que salta: sube, cae (los grandes casi no caen: flotan y se apagan) y parpadea al irse. Pide su lugar al
 * director de escena: si su carril choca con otro número o con una zona prohibida (los sellos del enemigo, el total,
 * tu Vida o tu Escudo), prueba los `carriles` que se le den y, si no, sube un renglón o se corre de costado. Su caja
 * se mantiene dentro de la pantalla en cada cuadro (el rebote y la deriva no lo sacan por el borde).
 */
export type Alinear = 'centro' | 'derecha' | 'izquierda';
export interface Carril {
  x: number;
  y: number;
  alinear?: Alinear;
}
export function numero(texto: string | number, x: number, y: number, tono: TonoCifra = 'hueso', escala = 1, o: { alinear?: Alinear; vx?: number; carriles?: Carril[]; vidaMin?: number; ancla?: Ancla } = {}): Caja | null {
  if (!vivos()) return null;
  const glifos = glifosDe(texto, tono);
  const base = glifos.reduce((s, g) => s + g.width - 1, 0);
  const ancho = base * escala;
  const altoG = glifos[0]?.height ?? 9;
  const alto = altoG * escala;
  const grande = escala >= 2;
  // (0.22) el número con dueño (el «−N» de tu VIDA) sube poco y derecho: no se le aleja ni cae sobre su cifra
  const g = o.ancla ? 12 : grande ? 100 : 190;
  const vy0 = o.ancla ? -16 : grande ? -46 : -70;
  const vx0 = o.ancla ? 0 : (o.vx ?? entre(-14, 14));
  const T = 0.95;
  // lo que barre en todo su vuelo (en celdas, desde donde nace), con el rebote del primer instante
  let ex0 = 0;
  let ex1 = 0;
  let ey0 = 0;
  let ey1 = 0;
  {
    let sx = 0;
    let sy = 0;
    let vx = vx0;
    let vy = vy0;
    for (let s = 0; s < T; s += 1 / 60) {
      vy += g / 60;
      sx += vx / 60;
      sy += vy / 60;
      vx *= 1 - 1.2 / 60;
      ex0 = Math.min(ex0, sx);
      ex1 = Math.max(ex1, sx);
      ey0 = Math.min(ey0, sy);
      ey1 = Math.max(ey1, sy);
    }
  }
  const Wc = aCelda(innerWidth);
  const Hc = aCelda(innerHeight);
  const rebote = base * 0.25;
  const nace = (cx: number, cy: number, al: Alinear | undefined): { px: number; py: number } => ({
    px: Math.max(1, Math.min(Wc - ancho - 1, aCelda(cx) - (al === 'derecha' ? ancho : al === 'izquierda' ? 0 : ancho / 2))),
    py: Math.max(1 - ey0, Math.min(Hc - alto - ey1 - 1, aCelda(cy))),
  });
  // (0.22: la caja es la de su vuelo, sin el rebote del primer instante —dura 70 ms— ni un número y un renglón de más:
  // inflada, chocaba con todo y el «−N» terminaba trepando lejos de tu VIDA)
  // (el rebote del que no tiene dueño crece medio número a cada costado y un renglón hacia arriba)
  void rebote;
  const rx = o.ancla ? 0 : base / 2;
  const ry = o.ancla ? 0 : altoG;
  const sobre = (n: { px: number; py: number }): Caja => ({ x: (n.px + Math.min(ex0, -rx)) * S, y: (n.py + Math.min(ey0, -ry)) * S, w: (ancho + Math.max(ex1, rx) - Math.min(ex0, -rx)) * S, h: (alto + ey1 - Math.min(ey0, -ry)) * S });
  // los carriles: el pedido (o los que se den) y, si chocan, un renglón más arriba o un número más al costado (el que
  // tiene dueño solo se corre de costado, medio número: no trepa)
  const bases: Carril[] = o.carriles?.length ? o.carriles : [{ x, y, alinear: o.alinear }];
  const nacimientos: { px: number; py: number }[] = [];
  for (const b of bases) nacimientos.push(nace(b.x, b.y, b.alinear));
  const corrimientos = o.ancla ? [[-0.5, 0], [0.5, 0], [-1, 0], [1, 0]] : [[0, -1], [0, -2], [-1, 0], [1, 0], [0, -3], [-1, -1], [1, -1]];
  for (const b of bases)
    for (const [dx, dy] of corrimientos)
      nacimientos.push(nace(b.x + dx * (ancho + 6) * S, b.y + dy * (alto + 4) * S, b.alinear));
  let t = 0;
  let px = 0;
  let py = 0;
  let k = escala;
  // (el rebote crece hacia arriba y hacia los dos costados: nunca baja sobre lo que tiene debajo —tu VIDA—)
  const viva = (): Caja | null => (t >= T - 0.25 ? null : { x: Math.round(px - ((k - escala) * base) / 2) * S, y: Math.round(py - (k - escala) * altoG) * S, w: base * k * S, h: altoG * k * S });
  const pd = pedir('numero', nacimientos.map(sobre), T * 1000, { viva, ancla: o.ancla });
  ({ px, py } = nacimientos[pd.i]);
  let vx = vx0;
  let vy = vy0;
  // (un cartel que entra los apaga: pasan directo a su parpadeo de salida; el número grande tiene su vida garantizada
  // —`vidaMin` segundos— y recién después se apaga)
  let apagarEn = Infinity;
  const yo = {
    // (0.23) orzar: el golpe del Rey toma la escena (el Tajo de revés) y el número grande se apaga ya
    apagar: (forzar = false) => {
      if (!forzar && t < (o.vidaMin ?? 0)) {
        apagarEn = o.vidaMin ?? 0;
        return;
      }
      t = Math.max(t, T - 0.22);
      soltar(pd.id);
    },
  };
  enVuelo.add(yo);
  efecto({
    paso(dt) {
      t += dt;
      if (t >= apagarEn) {
        apagarEn = Infinity;
        yo.apagar();
      }
      if (t >= T) {
        enVuelo.delete(yo);
        soltar(pd.id);
      }
      vy += g * dt;
      px += vx * dt;
      py += vy * dt;
      vx *= 1 - 1.2 * dt;
      // (la deriva no lo saca de la pantalla)
      px = Math.max(1, Math.min(Wc - ancho - 1, px));
      py = Math.max(1, Math.min(Hc - alto - 1, py));
      return t < T;
    },
    pinta(c) {
      if (t > T - 0.25 && Math.floor(t * 30) % 2) return;
      // entra con un rebote de escala entera: grande un instante y a su tamaño (el tope contra el borde se recalcula
      // en cada cuadro, con el tamaño de ese cuadro)
      // (el número con dueño no rebota: nace a su tamaño, pegado a su caja)
      k = t < 0.07 && !o.ancla ? escala + 1 : escala;
      const wk = base * k;
      let gx = Math.max(1, Math.min(aCelda(innerWidth) - wk - 1, Math.round(px - ((k - escala) * base) / 2)));
      const gy = Math.max(1, Math.min(aCelda(innerHeight) - altoG * k - 1, Math.round(py - (k - escala) * altoG)));
      for (const gl of glifos) {
        c.drawImage(gl, gx, gy, gl.width * k, gl.height * k);
        gx += (gl.width - 1) * k;
      }
    },
  });
  // la caja de todo su vuelo (en píxeles de pantalla, con el rebote del primer instante): para pegarle un sello en su
  // mismo carril sin que el número, al subir o al caer, se le meta encima
  const vuelo = sobre(nacimientos[pd.i]);
  return { x: vuelo.x, y: vuelo.y - altoG * S, w: vuelo.w, h: vuelo.h + 2 * altoG * S };
}

/**
 * El naipe enemigo se raja en dos mitades por una grieta en zigzag: cada mitad cae para su lado girando, con
 * recortes de papel. `rect` es la caja del naipe en pantalla.
 */
export function partirNaipe(naipe: HTMLCanvasElement, rect: { left: number; top: number; width: number; height: number }, rampa: string[]): void {
  const x = aCelda(rect.left);
  const y = aCelda(rect.top);
  const w = aCelda(rect.width);
  const h = aCelda(rect.height);
  // la grieta: de arriba abajo, en zigzag alrededor del medio
  const grieta: [number, number][] = [];
  const tramos = 7;
  for (let i = 0; i <= tramos; i++) grieta.push([w / 2 + (i === 0 || i === tramos ? 0 : (i % 2 ? 1 : -1) * entre(w * 0.06, w * 0.16)), (h * i) / tramos]);
  const mitades = [-1, 1].map((lado) => ({ lado, dx: 0, dy: 0, vx: lado * entre(26, 44), vy: entre(-70, -40), rot: 0, vrot: lado * entre(1.2, 2.4) }));
  let t = 0;
  const T = 0.85;
  efecto({
    paso(dt) {
      t += dt;
      for (const m of mitades) {
        m.vy += 420 * dt;
        m.dx += m.vx * dt;
        m.dy += m.vy * dt;
        m.rot += m.vrot * dt;
      }
      return t < T;
    },
    pinta(c) {
      if (t > T - 0.2 && Math.floor(t * 30) % 2) return;
      for (const m of mitades) {
        c.save();
        c.translate(Math.round(x + w / 2 + m.dx), Math.round(y + h / 2 + m.dy));
        c.rotate(m.rot);
        c.translate(-w / 2, -h / 2);
        c.beginPath();
        if (m.lado < 0) c.moveTo(0, 0);
        else c.moveTo(w, 0);
        for (const [gx, gy] of grieta) c.lineTo(gx, gy);
        c.lineTo(m.lado < 0 ? 0 : w, h);
        c.closePath();
        c.clip();
        c.drawImage(naipe, 0, 0, w, h);
        c.restore();
      }
    },
  });
  // los recortes de papel y la chispa de su palo
  const ps: Particula[] = [];
  const papel = ['#fbf7ec', '#f4efe2', '#d9ceb4', '#7a4458'];
  for (let i = 0; i < 22; i++) {
    const [gx, gy] = grieta[1 + Math.floor(azar() * (tramos - 1))];
    ps.push({ x: x + gx, y: y + gy, vx: entre(-90, 90), vy: entre(-120, -10), g: 380, vida: 0, max: entre(0.4, 0.85), tam: azar() < 0.4 ? 2 : 1, rampa: i % 3 ? papel : rampa });
  }
  efecto(new Particulas(ps));
}

/** El aura de un Rey que irrumpe: anillos de luz tramada que se abren desde su retrato. */
export function haloRey(x: number, y: number, color: string, radio = 120): void {
  const cx = aCelda(x);
  const cy = aCelda(y);
  const r = aCelda(radio);
  let t = 0;
  const T = 0.9;
  efecto({
    paso(dt) {
      t += dt;
      return t < T;
    },
    pinta(c, l) {
      const f = t / T;
      for (const fase of [0, 0.25, 0.5]) {
        const u = f - fase;
        if (u <= 0 || u > 0.6) continue;
        const d = disco(color, r * (0.3 + u * 1.4));
        l.globalAlpha = u < 0.2 ? 1 : u < 0.4 ? 0.66 : 0.33;
        l.drawImage(d, Math.round(cx - d.width / 2), Math.round(cy - d.height / 2));
      }
      l.globalAlpha = 1;
      // rayos cortos que salen del centro
      c.fillStyle = color;
      if (f < 0.5)
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2 + 0.2;
          const d0 = r * (0.5 + f);
          c.fillRect(Math.round(cx + Math.cos(a) * d0), Math.round(cy + Math.sin(a) * d0 * 0.8), i % 2 ? 2 : 1, i % 2 ? 2 : 1);
        }
    },
  });
}

/** Lluvia de monedas sobre un tramo de la pantalla (el botín). */
export function lluviaDeMonedas(x0: number, x1: number, y0: number, n = 26): void {
  const ps: Particula[] = [];
  for (let i = 0; i < n; i++) ps.push({ x: aCelda(entre(x0, x1)), y: aCelda(y0) - entre(0, 40), vx: entre(-8, 8), vy: entre(20, 70), g: 260, vida: -i * 0.02, max: entre(0.7, 1.2), tam: 2, rampa: ['#fff799', '#ffd500', '#ffd500', '#ff7b00', '#d86000'], luz: '#ff7b00' });
  efecto(new Particulas(ps));
}

/** La nube de humo del Bufón: copos claros que se abren, suben despacio y se apagan al violeta. */
export function humo(x: number, y: number, radio = 60): void {
  const RAMPA = ['#f4efe2', '#d9ceb4', '#b9aacb', '#6b5a86', '#2a1f3d'];
  const ps: Particula[] = [];
  const n = Math.round(18 + radio / 6);
  for (let i = 0; i < n; i++) {
    const a = entre(0, Math.PI * 2);
    const d = entre(0, aCelda(radio) * 0.8);
    const v = entre(8, 34);
    ps.push({ x: aCelda(x) + Math.cos(a) * d, y: aCelda(y) + Math.sin(a) * d, vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.6 - 14, g: -22, vida: -entre(0, 0.06), max: entre(0.35, 0.75), tam: azar() < 0.35 ? 4 : azar() < 0.6 ? 3 : 2, rampa: RAMPA, freno: 2.2 });
  }
  efecto(new Particulas(ps));
}

/** Motas que suben (la cura en verde lima, el Escudo en cian). */
export function motas(x: number, y: number, rampa: string[], n = 10, ancho = 40): void {
  const ps: Particula[] = [];
  for (let i = 0; i < n; i++) ps.push({ x: aCelda(x + entre(-ancho, ancho)), y: aCelda(y) + entre(-4, 4), vx: entre(-6, 6), vy: entre(-50, -20), g: -10, vida: 0, max: entre(0.5, 0.9), tam: azar() < 0.4 ? 2 : 1, rampa, luz: rampa[2] });
  efecto(new Particulas(ps));
}

export const RAMPA_CURA = ['#ffffff', '#b4f03c', '#22d95b', '#139a3c'];
export const RAMPA_ESCUDO = ['#ffffff', '#b8f6ff', '#00c8ff', '#2c7bf0'];
export const RAMPA_GOLPE = ['#ffffff', '#ff6e8e', '#ff1453', '#7a0026'];

/**
 * El Tajo de revés del Caudillo: dos filos que se cruzan en X (el derecho y, un instante después, el revés en rojo),
 * con un destello grande en el cruce y chispas de acero. Es el ×2: se tiene que ver doble.
 */
export function tajoDeReves(x: number, y: number, r: number): void {
  const cx = aCelda(x);
  const cy = aCelda(y);
  const rc = aCelda(r);
  tajoEspadas(cx, cy, rc, 1);
  tajoEspadas(cx, cy, rc * 1.1, -1, 0.11, RAMPA_GOLPE_LARGA);
  destello(x, y, RAMPA_PALO.S, rc * 0.7);
  chispas(x, y, RAMPA_PALO.S, 14, 120);
  chispas(x, y, RAMPA_GOLPE_LARGA, 12, 140);
}
const RAMPA_GOLPE_LARGA = ['#ffffff', '#ff6e8e', '#ff1453', '#f0124a', '#7a0026'];

/**
 * La segunda cara de un Rey: lo contrario de su irrupción. Los anillos no se abren, se CIERRAN sobre el naipe (la
 * luz se le mete adentro) y del naipe salen grietas quebradas, en zigzag, del color de su palo.
 */
export function quiebre(x: number, y: number, r: number, color: string, rampa: string[]): void {
  const cx = aCelda(x);
  const cy = aCelda(y);
  const rc = aCelda(r);
  // las grietas: 7 rayos quebrados, cada uno con su zigzag fijo
  const grietas = Array.from({ length: 7 }, (_, i) => {
    const a0 = (i / 7) * Math.PI * 2 + entre(-0.2, 0.2);
    const pts: [number, number][] = [];
    let a = a0;
    for (let k = 0; k <= 6; k++) {
      a += entre(-0.35, 0.35);
      const d = rc * (0.45 + k * 0.17);
      pts.push([cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.85]);
    }
    return pts;
  });
  let t = 0;
  const T = 0.95;
  efecto({
    paso(dt) {
      t += dt;
      return t < T;
    },
    pinta(c, l) {
      const f = t / T;
      // los anillos que se cierran: de afuera hacia el naipe
      for (const fase of [0, 0.18, 0.36]) {
        const u = f - fase;
        if (u <= 0 || u > 0.45) continue;
        const d = disco(color, rc * (1.9 - u * 3.2));
        l.globalAlpha = u < 0.15 ? 0.33 : u < 0.3 ? 0.66 : 1;
        l.drawImage(d, Math.round(cx - d.width / 2), Math.round(cy - d.height / 2));
      }
      l.globalAlpha = 1;
      // las grietas crecen hasta la mitad y después se apagan tramadas
      const largo = Math.min(1, f / 0.35);
      for (const pts of grietas) {
        const n = Math.ceil((pts.length - 1) * largo);
        for (let k = 0; k < n; k++) {
          const [x0, y0] = pts[k];
          const [x1, y1] = pts[k + 1];
          const pasos = Math.ceil(Math.hypot(x1 - x0, y1 - y0));
          c.fillStyle = rampa[Math.min(rampa.length - 1, Math.floor(f * rampa.length + k * 0.3))];
          for (let s = 0; s <= pasos; s++) {
            if (f > 0.6 && (s + k) % 2) continue;
            if (f > 0.8 && (s + k) % 3) continue;
            const u = s / Math.max(1, pasos);
            c.fillRect(Math.round(x0 + (x1 - x0) * u), Math.round(y0 + (y1 - y0) * u), k < 2 ? 2 : 1, k < 2 ? 2 : 1);
          }
        }
      }
    },
  });
}
