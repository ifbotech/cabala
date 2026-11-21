// Los iconos del juego en pixel-art tramado, cada uno en una rejilla de 28 × 28 celdas: los 15 Amuletos, los 18
// Aumentos del Bufón, las 18 Bendiciones, los nodos del Mapa, los emblemas de la mesa (Ataque, Inmune, Aturdido,
// Furia) y los del HUD (Vida, Escudo, oro, Mazo, Porotos, dado). Solo el motivo: el hueco o el medallón lo pone el
// marco de la interfaz. Luz de arriba a la izquierda, sin contorno negro: la forma la dan sus tonos.
import type { Palo } from '../../rules/cartas';
import { hueco, sombrear, type Luz } from './dither';
import { glifo } from './cifras';
import { Lienzo } from './pincel';
import { pintaNaipe } from './pintas';
import { medida, type Mapa } from './rejilla';

export const ICONO = 28;
const N = ICONO;

type Dibujo = (l: Lienzo) => void;

// rampas, de la sombra abismal a la luz
const ORO = '9zoOyY';
const ACERO = '9BbcCA';
const PLATA = '9ijJu';
const MADERA = '9Nndx';
const ROJO = '9vRre';
const VERDE = '9GglLK';
const HUESO = 'shmw';
const PURPURA = '9fFqQ';
const PIEL = '9spP';

/** Sombrea lo recién pintado con la letra provisional '¤'. */
const vol = (l: Lienzo, rampa: string, o: Luz = {}) => sombrear(l, '¤', rampa, { base: 0.6, pendiente: 0.95, borde: 1, fuerzaBorde: 0.4, brillo: 1, fuerzaBrillo: 0.3, ...o });

/** Una moneda de oro con su efigie hundida. */
function moneda(l: Lienzo, cx: number, cy: number, r: number): void {
  l.elipse(cx, cy, r, r, '¤');
  vol(l, ORO, { borde: 2, fuerzaBorde: 0.45 });
  if (r >= 5) l.elipse(cx, cy, r - 2.6, r - 2.6, 'o').elipse(cx - 0.5, cy - 0.5, r - 3.6, r - 3.6, 'y');
}
/** Una gota (sangre, vino). */
function gota(l: Lienzo, cx: number, cy: number, r: number, rampa = ROJO): void {
  l.elipse(cx, cy, r, r, '¤').poli([[cx - r * 0.8, cy - r * 0.4], [cx, cy - r * 2.2], [cx + r * 0.8, cy - r * 0.4]], '¤');
  vol(l, rampa);
}
/** Un naipe chico de papel hueso (w × h) con su esquina en (x, y). */
function naipe(l: Lienzo, x: number, y: number, w: number, h: number, dorso = false): void {
  l.rect(x + 1, y, w - 2, h, '¤').rect(x, y + 1, w, h - 2, '¤');
  vol(l, dorso ? PURPURA : HUESO, { base: dorso ? 0.5 : 0.75, borde: 1, fuerzaBorde: 0.35 });
  if (dorso) for (let i = 2; i < h - 2; i += 2) for (let j = 2 + (i % 4 ? 1 : 0); j < w - 2; j += 2) l.set(x + j, y + i, 'o').marcar(x + j, y + i);
}
/** Una hoja de acero de (x0, y0) a la punta (x1, y1). */
function hoja(l: Lienzo, x0: number, y0: number, x1: number, y1: number, ancho: number, rampa = ACERO): void {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy) || 1;
  const px = (-dy / len) * ancho;
  const py = (dx / len) * ancho;
  const mx = x0 + dx * 0.78;
  const my = y0 + dy * 0.78;
  l.poli([[x0 + px, y0 + py], [mx + px, my + py], [x1, y1], [mx - px, my - py], [x0 - px, y0 - py]], '¤');
  vol(l, rampa, { base: 0.62 });
  l.linea(x0 + px * 0.2, y0 + py * 0.2, x1 - dx * 0.12, y1 - dy * 0.12, rampa[rampa.length - 1]);
}
/** Una llama (de la base ancha a la lengua). */
function llama(l: Lienzo, cx: number, base: number, alto: number, ancho: number): void {
  l.poli([[cx - ancho, base], [cx - ancho * 0.9, base - alto * 0.45], [cx - ancho * 0.25, base - alto * 0.7], [cx - ancho * 0.1, base - alto], [cx + ancho * 0.75, base - alto * 0.55], [cx + ancho, base]], 'O');
  l.elipse(cx, base, ancho, ancho * 0.6, 'O');
  l.poli([[cx - ancho * 0.55, base], [cx - ancho * 0.35, base - alto * 0.4], [cx + ancho * 0.05, base - alto * 0.68], [cx + ancho * 0.5, base - alto * 0.3], [cx + ancho * 0.55, base]], 'y');
  l.elipse(cx, base - 0.5, ancho * 0.55, ancho * 0.45, 'y');
  l.elipse(cx, base - alto * 0.12, ancho * 0.28, alto * 0.16, 'Y');
  l.sombra('O', 'r', 1, 0, 1, 'OyY');
}
/** Una copa de oro con vino. */
function copa(l: Lienzo, cx: number, top: number, r: number, alto: number): void {
  l.poli([[cx - r, top], [cx + r, top], [cx + r * 0.75, top + alto * 0.42], [cx + r * 0.25, top + alto * 0.55], [cx - r * 0.25, top + alto * 0.55], [cx - r * 0.75, top + alto * 0.42]], '¤');
  l.rect(Math.round(cx - 1), Math.round(top + alto * 0.5), 2, Math.round(alto * 0.34), '¤');
  l.poli([[cx - r * 0.7, top + alto], [cx - r * 0.3, top + alto * 0.82], [cx + r * 0.3, top + alto * 0.82], [cx + r * 0.7, top + alto]], '¤');
  vol(l, ORO, { borde: 1 });
  l.rect(Math.round(cx - r + 1), Math.round(top), Math.round(2 * r - 2), 2, 'R').rect(Math.round(cx - r + 1), Math.round(top), Math.round(r), 1, 'r');
}
/** Un garrote nudoso (basto) de (x0, y0) —el mango— a (x1, y1) —la maza—. */
function garrote(l: Lienzo, x0: number, y0: number, x1: number, y1: number, r0: number, r1: number): void {
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    const r = r0 + (r1 - r0) * t;
    l.elipse(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, r, r, '¤');
  }
  vol(l, VERDE, { borde: 2, fuerzaBorde: 0.45 });
  const mx = x0 + (x1 - x0) * 0.55;
  const my = y0 + (y1 - y0) * 0.55;
  l.set(Math.round(mx + r1), Math.round(my), 'r').set(Math.round(mx - r1 * 0.6), Math.round(my + 2), 'R');
}
/** Un escudo heráldico (punta abajo). */
function broquel(l: Lienzo, cx: number, top: number, w: number, h: number, rampa: string): void {
  l.poli([[cx - w, top], [cx + w, top], [cx + w, top + h * 0.5], [cx + w * 0.55, top + h * 0.85], [cx, top + h], [cx - w * 0.55, top + h * 0.85], [cx - w, top + h * 0.5]], '¤');
  vol(l, rampa, { borde: 2, fuerzaBorde: 0.45 });
}
/** Un dado de hueso con sus puntos. */
function dadoPx(l: Lienzo, x: number, y: number, lado: number, cara: number): void {
  l.rect(x + 1, y, lado - 2, lado, '¤').rect(x, y + 1, lado, lado - 2, '¤');
  vol(l, HUESO, { base: 0.78, borde: 1, fuerzaBorde: 0.4 });
  const a = Math.round(lado * 0.25);
  const m = Math.floor(lado / 2);
  const b = lado - 1 - a;
  const en: Record<number, [number, number][]> = {
    1: [[m, m]],
    2: [[a, a], [b, b]],
    3: [[a, a], [m, m], [b, b]],
    4: [[a, a], [b, a], [a, b], [b, b]],
    5: [[a, a], [b, a], [m, m], [a, b], [b, b]],
    6: [[a, a], [b, a], [a, m], [b, m], [a, b], [b, b]],
  };
  for (const [px, py] of en[cara] ?? []) l.rect(x + px - (lado > 12 ? 1 : 0), y + py - (lado > 12 ? 1 : 0), lado > 12 ? 2 : 1, lado > 12 ? 2 : 1, '0');
}
/** Una mano abierta (palma al frente). */
function mano(l: Lienzo, cx: number, cy: number): void {
  l.elipse(cx, cy + 3, 5, 5.5, '¤');
  for (const [dx, alto] of [[-4, 6], [-1.3, 8], [1.3, 8.5], [4, 6.5]] as [number, number][]) l.rect(Math.round(cx + dx - 1), Math.round(cy - alto), 2, Math.round(alto + 2), '¤');
  l.trazo(cx - 5, cy + 3, cx - 8, cy - 1, 1.2, '¤');
  vol(l, PIEL, { base: 0.66, borde: 1 });
}
/** Un destello de cuatro puntas. */
const destello = (l: Lienzo, x: number, y: number, r = 2, k = 'Y') => l.rect(x - r, y, 2 * r + 1, 1, k).rect(x, y - r, 1, 2 * r + 1, k);

// ───────────────────────── Amuletos ─────────────────────────

const AMULETO: Record<string, Dibujo> = {
  cuchillo: (l) => {
    hoja(l, 11, 17, 24, 3, 2.6);
    l.trazo(8, 17, 13, 21, 1.4, '¤');
    vol(l, ORO);
    l.trazo(9, 19, 4, 24, 2, '¤');
    vol(l, MADERA, { borde: 1 });
    l.set(6, 22, 'y').set(8, 20, 'y');
  },
  facon: (l) => {
    hoja(l, 14, 17, 14, 1, 2.2, PLATA);
    l.poli([[7, 16], [21, 18], [21, 20], [7, 18]], '¤').elipse(7, 16, 1.6, 1.6, '¤').elipse(21, 20, 1.6, 1.6, '¤');
    vol(l, ORO);
    l.rect(13, 20, 3, 5, '¤');
    vol(l, PLATA, { base: 0.7 });
    l.elipse(14.5, 26, 2, 1.8, '¤');
    vol(l, ORO);
    for (const y of [21, 23]) l.rect(13, y, 3, 1, 'i');
  },
  lanza: (l) => {
    l.trazo(3, 26, 17, 11, 1, '¤');
    vol(l, MADERA, { base: 0.7 });
    hoja(l, 16, 12, 25, 2, 3.2);
    l.poli([[13, 13], [8, 10], [9, 15], [5, 14], [10, 18]], '¤');
    vol(l, ROJO, { base: 0.62 });
    l.rect(15, 11, 3, 3, 'y').set(15, 11, 'Y');
  },
  rebenque: (l) => {
    l.trazo(5, 24, 12, 15, 2, '¤');
    vol(l, MADERA);
    for (const y of [17, 20]) l.linea(8 - (y - 17) / 2 - 1, y + 1, 11 - (y - 17) / 2, y - 1, 'y');
    // la lonja de cuero, que sale del mango, sube y cae doblada
    l.trazo(12, 15, 18, 6, 1.3, '¤').trazo(18, 6, 23, 8, 1.3, '¤').trazo(23, 8, 22, 19, 1.5, '¤');
    vol(l, '9Nnd', { base: 0.55 });
    l.rect(11, 13, 3, 3, 'y').set(11, 13, 'Y');
  },
  boleadoras: (l) => {
    for (const [x, y] of [[6, 7], [22, 9], [13, 22]] as [number, number][]) l.linea(14, 13, x, y, 'd');
    l.set(14, 13, 'x');
    for (const [x, y, r] of [[6, 7, 3.6], [22, 9, 3.2], [13, 22, 4]] as [number, number, number][]) {
      l.elipse(x, y, r, r, '¤');
      vol(l, PLATA, { borde: 2, fuerzaBorde: 0.5 });
    }
    l.linea(4, 6, 8, 8, 'n').linea(20, 8, 24, 10, 'n').linea(10, 21, 16, 23, 'n');
  },
  poncho: (l) => {
    l.poli([[14, 3], [25, 11], [23, 22], [5, 22], [3, 11]], '¤');
    vol(l, '9GglL', { borde: 2, fuerzaBorde: 0.45, base: 0.55 });
    for (const y of [9, 15]) for (let x = 4; x < 25; x++) if (l.lleno(x, y)) l.set(x, y, 'r').set(x, y + 1, x % 2 ? 'R' : 'y');
    l.poli([[12, 3], [14, 8], [16, 3]], '0');
    for (let x = 6; x < 23; x += 2) l.rect(x, 23, 1, 3, x % 4 ? 'r' : 'y');
  },
  moneda: (l) => {
    moneda(l, 14, 14, 10);
    // falsa: la raja que la parte y el plomo que asoma
    l.linea(9, 6, 13, 13, '9').linea(13, 13, 11, 17, '9').linea(11, 17, 15, 23, '9');
    l.rect(12, 12, 3, 2, 'J').rect(11, 16, 2, 2, 'j');
    l.elipse(17, 13, 2.5, 3, 'z').rect(16, 16, 3, 2, 'z');
  },
  taba: (l) => {
    l.elipse(9, 10, 5, 5.5, '¤').elipse(19, 10, 5, 5.5, '¤').elipse(9, 19, 5, 5.5, '¤').elipse(19, 19, 5, 5.5, '¤').rect(8, 8, 12, 13, '¤');
    vol(l, HUESO, { base: 0.72, borde: 2, fuerzaBorde: 0.5 });
    hueco(l, 14, 14.5, 4, 5, '9sh', { curva: 1.3 });
    l.set(7, 8, 'w').set(8, 7, 'w');
  },
  cofre: (l) => {
    l.rect(4, 13, 20, 11, '¤');
    vol(l, MADERA, { borde: 2 });
    l.poli([[4, 13], [6, 6], [22, 6], [24, 13]], '¤');
    vol(l, MADERA, { base: 0.72, borde: 1 });
    for (const x of [7, 19]) l.rect(x, 6, 2, 18, 'o').rect(x, 6, 1, 18, 'y');
    l.rect(4, 12, 20, 2, 'y').rect(4, 13, 20, 1, 'o');
    l.rect(12, 11, 4, 5, 'Y').rect(13, 13, 2, 2, '0');
    destello(l, 14, 3, 1);
  },
  mate: (l) => {
    l.elipse(12, 17, 8, 8, '¤').elipse(12, 11, 5.5, 4, '¤');
    vol(l, MADERA, { borde: 3, fuerzaBorde: 0.5 });
    l.rect(7, 8, 11, 2, 'J').rect(7, 8, 6, 1, 'u');
    l.trazo(14, 9, 23, 2, 0.9, '¤');
    vol(l, PLATA, { base: 0.75 });
    l.rect(22, 1, 3, 2, 'y');
    l.rect(8, 6, 8, 2, 'g').set(9, 5, 'L').set(12, 5, 'l').set(14, 6, 'L');
  },
  bota: (l) => {
    l.elipse(13, 17, 8.5, 8, '¤').poli([[9, 12], [15, 3], [19, 5], [18, 12]], '¤');
    vol(l, '9Nndx', { borde: 3, fuerzaBorde: 0.5, base: 0.58 });
    l.rect(15, 2, 4, 2, 'y').rect(15, 2, 2, 1, 'Y');
    l.linea(19, 6, 24, 12, 'r').linea(24, 12, 21, 20, 'R');
    for (let y = 12; y < 24; y += 3) l.set(6 + ((y / 3) % 2), y, 'N');
    gota(l, 22, 24, 1.6);
  },
  caliz: (l) => {
    copa(l, 14, 4, 8, 21);
    l.rect(13, 14, 3, 2, 'r').set(13, 14, 'e');
    for (const x of [9, 14, 19]) l.set(x, 8, 't');
    destello(l, 21, 3, 1);
  },
  cascabel: (l) => {
    l.rect(13, 2, 3, 4, 'o').rect(13, 2, 1, 4, 'y');
    l.elipse(14.5, 15, 9, 9, '¤');
    vol(l, ORO, { borde: 3, fuerzaBorde: 0.5 });
    l.rect(9, 17, 12, 1, '9').elipse(9.5, 17.5, 1.5, 1.5, '9').elipse(20.5, 17.5, 1.5, 1.5, '9');
    l.rect(7, 12, 16, 1, 'o').rect(7, 11, 9, 1, 'Y');
    destello(l, 23, 6, 1);
    destello(l, 4, 22, 1);
  },
  doscaras: (l) => {
    // medio naipe de cara (hueso) y medio de dorso (púrpura), partido en diagonal
    naipe(l, 6, 2, 16, 24);
    const cara = new Lienzo(N, N);
    naipe(cara, 6, 2, 16, 24, true);
    for (let y = 0; y < N; y++)
      for (let x = 0; x < N; x++)
        if (x + y > 28 && cara.lleno(x, y)) {
          l.set(x, y, cara.get(x, y));
          if (cara.tramada(x, y)) l.marcar(x, y);
        }
    l.linea(21, 7, 7, 21, 'y');
    l.rect(9, 5, 2, 4, '4').rect(9, 5, 4, 1, '4');
    l.poli([[17, 18], [19, 20], [17, 22], [15, 20]], 'y');
  },
  cetro: (l) => {
    l.trazo(5, 25, 15, 13, 1.3, '¤');
    vol(l, ORO);
    l.elipse(4.5, 25, 2, 2, 'y').set(4, 24, 'Y');
    // la cabecita de bufón: máscara de marfil y dos picos
    l.poli([[14, 12], [10, 4], [15, 7]], 'q').poli([[19, 13], [25, 6], [20, 9]], 'r');
    l.elipse(17, 12, 4.2, 4.5, '¤');
    vol(l, HUESO, { base: 0.75 });
    l.set(15, 11, '0').set(18, 11, '0').rect(15, 14, 4, 1, 'R');
    l.elipse(10, 4, 1.3, 1.3, 'y').elipse(25, 6, 1.3, 1.3, 'y');
  },
};

// ───────────────────────── Aumentos del Bufón ─────────────────────────

const AUMENTO: Record<string, Dibujo> = {
  senafalsa: (l) => {
    // un ojo abierto y el otro guiñado: la seña
    l.elipse(8, 13, 5.5, 3.6, '¤');
    vol(l, HUESO, { base: 0.8 });
    l.elipse(8, 13, 2.2, 2.4, 'c').elipse(8, 13, 1, 1.2, '0').set(7, 12, 'w');
    l.linea(3, 9, 8, 7, 'h').linea(8, 7, 13, 9, 'h');
    l.linea(15, 13, 20, 15, 'm').linea(20, 15, 25, 13, 'm').linea(15, 14, 20, 16, 'h').linea(20, 16, 25, 14, 'h');
    l.linea(16, 9, 20, 8, 'h').linea(20, 8, 24, 10, 'h');
    for (const x of [17, 20, 23]) l.set(x, 18, 'h');
    l.linea(8, 21, 13, 24, 'r').linea(13, 24, 20, 21, 'r').linea(9, 22, 13, 25, 'R').linea(13, 25, 19, 22, 'R');
    destello(l, 23, 4, 1);
  },
  dardeabajo: (l) => {
    for (let i = 0; i < 4; i++) naipe(l, 5, 4 + i * 2, 14, 12, true);
    naipe(l, 12, 14, 12, 10);
    l.rect(15, 16, 2, 3, '1').rect(15, 16, 3, 1, '1');
    l.poli([[20, 19], [25, 22], [20, 25]], 'y').rect(16, 21, 5, 2, 'y');
  },
  cortedemazo: (l) => {
    for (let i = 0; i < 3; i++) naipe(l, 3, 5 + i * 2, 13, 14, true);
    for (let i = 0; i < 3; i++) naipe(l, 12, 9 + i * 2, 13, 14, true);
    l.linea(15, 2, 10, 26, 'y').linea(16, 2, 11, 26, 'o');
  },
  vueltodemas: (l) => {
    moneda(l, 9, 18, 6);
    moneda(l, 18, 19, 6);
    moneda(l, 14, 10, 6.5);
    destello(l, 23, 6, 1);
  },
  sermano: (l) => {
    mano(l, 14, 14);
    l.rect(10, 24, 9, 3, 'R').rect(10, 24, 9, 1, 'r');
    destello(l, 22, 4, 1);
  },
  mesaservida: (l) => {
    l.elipse(14, 14, 11, 11, '¤');
    vol(l, MADERA, { borde: 3, fuerzaBorde: 0.5 });
    l.elipse(14, 14, 8, 8, '¤');
    vol(l, ACERO, { borde: 2, base: 0.5 });
    l.elipse(14, 14, 3, 3, '¤');
    vol(l, ORO);
    for (const [x, y] of [[14, 4], [24, 14], [14, 24], [4, 14]] as [number, number][]) l.rect(x - 1, y - 1, 2, 2, 'y');
  },
  cartamarcada: (l) => {
    naipe(l, 6, 2, 16, 24);
    hoja(l, 14, 20, 14, 8, 1.4);
    l.rect(11, 20, 7, 1, 'y').rect(13, 21, 2, 3, 'R');
    l.rect(8, 4, 1, 4, '1').rect(7, 5, 1, 1, '1');
    // la marca: la esquina doblada con su muesca de carmesí
    l.poli([[22, 2], [22, 9], [15, 2]], '9').poli([[21, 3], [21, 8], [16, 3]], 'h').rect(19, 4, 2, 2, 'r');
  },
  manocaliente: (l) => {
    mano(l, 14, 18);
    llama(l, 14, 11, 10, 6);
  },
  chamuyo: (l) => {
    l.rect(4, 4, 20, 13, '¤').poli([[8, 16], [8, 23], [14, 16]], '¤');
    l.set(4, 4, '.').set(23, 4, '.').set(4, 16, '.').set(23, 16, '.');
    vol(l, HUESO, { base: 0.8, borde: 2 });
    for (const x of [8, 13, 18]) l.rect(x, 9, 3, 3, 'R').set(x, 9, 'r');
    moneda(l, 22, 22, 3.6);
  },
  retruco: (l) => {
    hoja(l, 6, 22, 21, 5, 1.8);
    hoja(l, 22, 22, 7, 5, 1.8, ROJO);
    l.rect(4, 21, 4, 2, 'y').rect(20, 21, 4, 2, 'y').rect(5, 23, 2, 3, 'n').rect(21, 23, 2, 3, 'n');
    l.elipse(14, 13, 2.5, 2.5, 'y').set(13, 12, 'w');
  },
  caradepoker: (l) => {
    l.poli([[6, 4], [22, 4], [24, 12], [21, 20], [14, 25], [7, 20], [4, 12]], '¤');
    vol(l, HUESO, { base: 0.72, borde: 3, fuerzaBorde: 0.5 });
    l.rect(8, 11, 5, 1, '0').rect(15, 11, 5, 1, '0').rect(8, 12, 5, 1, 's').rect(15, 12, 5, 1, 's');
    l.rect(10, 19, 8, 1, '0');
    l.rect(13, 13, 2, 4, 'h');
  },
  irsealmazo: (l) => {
    for (let i = 0; i < 4; i++) naipe(l, 9, 12 + i * 2, 15, 9, true);
    naipe(l, 3, 3, 9, 12);
    l.rect(5, 5, 1, 3, '4');
    // la flecha que la devuelve al mazo
    l.linea(14, 4, 20, 4, 'y').linea(20, 4, 22, 6, 'y').linea(22, 6, 22, 9, 'y');
    l.poli([[19, 8], [25, 8], [22, 12]], 'y');
  },
  faltaenvido: (l) => {
    l.elipse(9, 10, 6, 6, '¤').elipse(19, 10, 6, 6, '¤').poli([[3, 12], [25, 12], [14, 26]], '¤');
    vol(l, ROJO, { borde: 3, fuerzaBorde: 0.5 });
    l.linea(15, 5, 12, 11, '0').linea(12, 11, 16, 15, '0').linea(16, 15, 13, 23, '0');
    l.linea(16, 5, 13, 11, '9').linea(13, 11, 17, 15, '9');
    l.set(7, 7, 'e').set(8, 6, 'e');
  },
  valecuatro: (l) => {
    for (let i = 0; i < 4; i++) {
      naipe(l, 2 + i * 5, 6 - (i === 1 || i === 2 ? 2 : 0), 9, 15);
      l.rect(4 + i * 5, 9 - (i === 1 || i === 2 ? 2 : 0), 2, 3, '1234'[i]);
    }
    l.rect(4, 23, 20, 2, 'y').rect(4, 23, 20, 1, 'Y');
    destello(l, 24, 3, 1);
  },
  barajacargada: (l) => {
    for (let i = 0; i < 3; i++) naipe(l, 5 + i, 7 - i * 2, 16, 20, true);
    naipe(l, 8, 3, 16, 20);
    // el 9 pesado
    l.pegar(glifo('9', '3'), 11, 5);
    l.rect(4, 25, 20, 2, 'j').rect(4, 25, 20, 1, 'J');
  },
  pactogarca: (l) => {
    l.rect(6, 4, 16, 19, '¤');
    vol(l, HUESO, { base: 0.75, borde: 2 });
    l.elipse(6, 4, 2, 2, 'h').elipse(22, 23, 2, 2, 'h');
    for (const y of [8, 11, 14]) l.rect(9, y, y === 14 ? 6 : 10, 1, 's');
    l.linea(10, 19, 13, 17, 'k').linea(13, 17, 16, 19, 'k').linea(16, 19, 18, 17, 'k');
    l.elipse(20, 21, 4, 4, '¤');
    vol(l, ROJO);
    l.poli([[17, 18], [16, 14], [19, 17]], 'r').poli([[23, 18], [24, 14], [21, 17]], 'r');
  },
  contraflor: (l) => {
    l.linea(14, 14, 12, 26, 'g').linea(15, 14, 13, 26, 'G');
    l.poli([[13, 20], [8, 18], [11, 22]], 'l').poli([[14, 22], [19, 20], [16, 24]], 'g');
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      l.elipse(14.5 + Math.cos(a) * 5, 10 + Math.sin(a) * 5, 3.6, 3.6, '¤');
    }
    vol(l, ROJO, { borde: 2, fuerzaBorde: 0.5 });
    l.elipse(14.5, 10, 2.6, 2.6, 'y').set(14, 9, 'Y');
    l.set(9, 23, 'R').set(17, 18, 'R');
  },
  venderalma: (l) => {
    // un frasco con una llama azul dentro: el alma en prenda
    l.rect(10, 2, 8, 3, 'd').rect(10, 2, 4, 1, 'x');
    l.elipse(14, 16, 9, 9.5, '¤').rect(11, 5, 6, 4, '¤');
    vol(l, '9TtC', { base: 0.4, borde: 3, fuerzaBorde: 0.55, brillo: 1, fuerzaBrillo: 0.4 });
    l.elipse(14, 16, 6.5, 7, '9');
    l.poli([[10, 21], [11, 14], [13, 16], [14, 9], [17, 15], [18, 13], [18, 21]], 'c').elipse(14, 20, 4, 2.5, 'c');
    l.poli([[12, 21], [13, 17], [14, 13], [16, 18], [16, 21]], 'C').elipse(14, 20, 2, 1.6, 'A');
    l.set(7, 11, 'A').set(7, 12, 'C');
  },
};

// ───────────────────────── Bendiciones ─────────────────────────

const BENDICION: Record<string, Dibujo> = {
  deguello: (l) => {
    // un cuchillo curvo de degüello con su gota
    l.poli([[5, 9], [17, 5], [24, 8], [25, 12], [16, 10], [6, 12]], '¤');
    vol(l, ACERO, { base: 0.62 });
    l.linea(6, 11, 16, 9, 'A').linea(16, 9, 24, 11, 'A');
    l.rect(2, 9, 4, 4, '¤');
    vol(l, MADERA);
    gota(l, 17, 19, 2.6);
    gota(l, 22, 24, 1.5);
  },
  puntahacha: (l) => {
    l.trazo(6, 25, 20, 5, 1, '¤');
    vol(l, MADERA, { base: 0.7 });
    l.poli([[16, 4], [25, 3], [24, 13], [20, 9]], '¤').poli([[17, 5], [11, 6], [14, 12]], '¤');
    vol(l, ACERO, { borde: 2 });
    l.linea(24, 4, 23, 12, 'A');
    destello(l, 6, 6, 2);
  },
  primerasangre: (l) => {
    hoja(l, 4, 24, 16, 9, 2.2);
    gota(l, 20, 10, 4.2);
    l.set(18, 9, 'e').set(19, 8, 'e');
    gota(l, 23, 22, 1.6);
  },
  empalizada: (l) => {
    for (const [x, alto] of [[4, 17], [11, 21], [18, 19]] as [number, number][]) {
      l.poli([[x, 26], [x, 26 - alto + 5], [x + 3, 26 - alto], [x + 6, 26 - alto + 5], [x + 6, 26]], '¤');
      vol(l, MADERA, { borde: 2, fuerzaBorde: 0.45 });
    }
    l.rect(3, 16, 22, 2, 'o').rect(3, 16, 22, 1, 'y');
    for (const x of [6, 13, 20]) l.set(x, 16, 'Y');
  },
  contragolpe: (l) => {
    garrote(l, 4, 24, 15, 10, 1.6, 4.4);
    // el impacto: estrella de golpe
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const r = i % 2 ? 4 : 7.5;
      l.linea(20, 8, 20 + Math.cos(a) * r, 8 + Math.sin(a) * r, i % 2 ? 'O' : 'y');
    }
    l.elipse(20, 8, 2, 2, 'Y');
  },
  paloypalo: (l) => {
    garrote(l, 5, 25, 20, 6, 1.5, 4);
    const otro = new Lienzo(N, N);
    garrote(otro, 23, 25, 8, 6, 1.5, 4);
    l.pegar(otro, 0, 0);
    l.rect(12, 14, 4, 4, 'y').set(12, 14, 'Y');
  },
  interes: (l) => {
    for (const [x, n] of [[3, 2], [10, 4], [17, 6]] as [number, number][])
      for (let i = 0; i < n; i++) {
        l.rect(x, 24 - i * 3, 8, 3, '¤');
        vol(l, ORO, { base: 0.62 });
        l.rect(x, 26 - i * 3, 8, 1, 'z');
      }
    l.linea(4, 12, 14, 5, 'K').linea(14, 5, 22, 3, 'K');
    l.poli([[20, 1], [25, 2], [22, 6]], 'K');
  },
  pesofuerte: (l) => {
    moneda(l, 14, 14, 11.5);
    l.elipse(14, 14, 8, 8, 'o').elipse(13.5, 13.5, 7, 7, 'y');
    // el sol del peso fuerte
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      l.linea(14 + Math.cos(a) * 3, 14 + Math.sin(a) * 3, 14 + Math.cos(a) * 6, 14 + Math.sin(a) * 6, 'o');
    }
    l.elipse(14, 14, 2.6, 2.6, 'O').set(13, 13, 'Y');
  },
  tabacargada: (l) => {
    dadoPx(l, 3, 9, 14, 6);
    dadoPx(l, 15, 3, 10, 5);
    l.rect(4, 24, 13, 2, '9');
    destello(l, 23, 20, 2);
  },
  coparebosante: (l) => {
    copa(l, 14, 8, 8, 18);
    l.elipse(14, 8, 8, 2.4, 'r').elipse(13, 7.5, 5, 1.4, 'e');
    gota(l, 5, 16, 1.6);
    gota(l, 23, 15, 1.6);
    gota(l, 21, 5, 1.4);
    l.rect(6, 9, 1, 4, 'r').rect(22, 9, 1, 3, 'R');
  },
  sangreporsangre: (l) => {
    gota(l, 9, 17, 5.5);
    gota(l, 20, 13, 4.2);
    l.set(7, 15, 'e').set(8, 14, 'e').set(19, 12, 'e');
    l.linea(3, 26, 25, 26, 'R');
    destello(l, 22, 22, 1);
  },
  otraronda: (l) => {
    const a = new Lienzo(N, N);
    copa(a, 9, 6, 6, 18);
    const b = new Lienzo(N, N);
    copa(b, 19, 8, 6, 18);
    l.pegar(b, 0, 0).pegar(a, 0, 0);
    destello(l, 14, 3, 2);
    l.set(10, 3, 'y').set(18, 2, 'y');
  },
  hojabroquel: (l) => {
    broquel(l, 13, 5, 9, 20, VERDE);
    l.rect(12, 6, 2, 17, 'y').rect(5, 12, 16, 2, 'y');
    hoja(l, 9, 24, 24, 3, 1.8);
    l.rect(7, 23, 5, 2, 'o');
  },
  filodorado: (l) => {
    hoja(l, 7, 20, 23, 3, 2.6, ORO);
    l.trazo(4, 17, 10, 23, 1.4, '¤');
    vol(l, ACERO);
    l.trazo(5, 22, 3, 25, 1.6, 'n');
    moneda(l, 21, 21, 4.5);
  },
  sangria: (l) => {
    copa(l, 11, 10, 7, 16);
    hoja(l, 25, 2, 15, 9, 1.8);
    gota(l, 13, 8, 1.6);
    l.rect(24, 1, 3, 2, 'y');
  },
  peaje: (l) => {
    broquel(l, 11, 3, 8.5, 20, VERDE);
    l.rect(10, 4, 2, 17, 'L');
    moneda(l, 20, 19, 6.5);
  },
  rescoldo: (l) => {
    l.trazo(4, 24, 24, 20, 1.6, '¤').trazo(5, 19, 23, 25, 1.6, '¤');
    vol(l, MADERA);
    llama(l, 14, 20, 15, 7);
    l.set(6, 12, 'O').set(22, 10, 'y').set(19, 5, 'O');
  },
  convite: (l) => {
    l.elipse(14, 20, 12, 5, '¤');
    vol(l, PLATA, { base: 0.7, borde: 2 });
    copa(l, 9, 4, 5, 15);
    moneda(l, 20, 15, 5);
    l.elipse(14, 20, 7, 2, 'i');
  },
};

// ───────────────────────── nodos del Mapa ─────────────────────────

export type NodoPx = 'guardia' | 'elite' | 'pulperia' | 'cabala' | 'fogon' | 'rey';

const NODO: Record<NodoPx, Dibujo> = {
  guardia: (l) => {
    hoja(l, 6, 22, 21, 5, 2);
    hoja(l, 22, 22, 7, 5, 2);
    l.trazo(3, 19, 9, 25, 1.2, 'y').trazo(25, 19, 19, 25, 1.2, 'o');
    l.trazo(5, 24, 3, 26, 1.4, 'n').trazo(23, 24, 25, 26, 1.4, 'n');
  },
  elite: (l) => {
    // una calavera con casco: el Bravo
    l.elipse(14, 12, 9, 9, '¤').rect(9, 17, 10, 7, '¤');
    vol(l, HUESO, { base: 0.72, borde: 3, fuerzaBorde: 0.5 });
    hueco(l, 10, 13, 3, 3.2, '09s', { curva: 1.2 });
    hueco(l, 18, 13, 3, 3.2, '09s', { curva: 1.2 });
    l.set(10, 13, 'r').set(18, 13, 'r');
    l.poli([[14, 15], [12.5, 19], [15.5, 19]], '0');
    for (const x of [10, 13, 16]) l.rect(x, 21, 2, 3, 'm').rect(x + 2, 21, 1, 3, '9');
    l.poli([[4, 9], [14, 1], [24, 9], [22, 5], [14, 4], [6, 5]], '¤');
    vol(l, ROJO, { base: 0.6 });
  },
  pulperia: (l) => {
    // el farol del mostrador
    l.rect(12, 1, 4, 2, 'j').linea(14, 3, 14, 5, 'J');
    l.poli([[8, 8], [14, 4], [20, 8]], '¤');
    vol(l, PLATA, { base: 0.55 });
    l.rect(8, 8, 12, 13, '¤');
    vol(l, ORO, { base: 0.75, borde: 2, pendiente: 0.5 });
    l.rect(8, 8, 1, 13, 'J').rect(19, 8, 1, 13, 'j').rect(13, 8, 2, 13, 'j');
    llama(l, 14, 18, 7, 3);
    l.rect(7, 21, 14, 2, 'j').rect(9, 23, 10, 3, 'j').rect(7, 21, 14, 1, 'J').rect(9, 25, 10, 1, 'i');
  },
  cabala: (l) => {
    // la máscara del Bufón con sus dos picos
    l.poli([[10, 10], [3, 2], [12, 6]], 'q').poli([[18, 10], [25, 2], [16, 6]], 'r');
    l.elipse(3, 2, 1.6, 1.6, 'y').elipse(25, 2, 1.6, 1.6, 'y');
    l.poli([[7, 8], [21, 8], [22, 15], [18, 22], [14, 26], [10, 22], [6, 15]], '¤');
    vol(l, HUESO, { base: 0.75, borde: 3, fuerzaBorde: 0.5 });
    hueco(l, 10.5, 14, 2.8, 2, '09s', { curva: 1.2 });
    hueco(l, 17.5, 14, 2.8, 2, '09s', { curva: 1.2 });
    l.set(11, 14, 'Y').set(18, 14, 'Y');
    l.linea(10, 20, 13, 22, '0').linea(13, 22, 18, 19, '0');
    l.poli([[18, 16], [19, 18], [18, 20], [17, 18]], 'R');
    l.rect(7, 8, 14, 1, 'y');
  },
  fogon: (l) => {
    l.trazo(3, 25, 25, 21, 1.8, '¤').trazo(4, 20, 24, 26, 1.8, '¤');
    vol(l, MADERA);
    llama(l, 14, 21, 18, 8);
    l.set(5, 10, 'O').set(23, 8, 'y').set(20, 3, 'O').set(8, 4, 'y');
  },
  rey: (l) => {
    l.poli([[3, 22], [3, 8], [9, 14], [14, 4], [19, 14], [25, 8], [25, 22]], '¤');
    vol(l, ORO, { borde: 2, fuerzaBorde: 0.45 });
    l.rect(3, 20, 22, 4, '¤');
    vol(l, ORO, { base: 0.5 });
    for (const [x, k] of [[6, 'r'], [13, 't'], [20, 'r']] as [number, string][]) l.rect(x, 21, 3, 2, k).set(x, 21, k === 'r' ? 'e' : 'C');
    l.elipse(3, 7, 1.6, 1.6, 'Y').elipse(14, 3, 1.8, 1.8, 'Y').elipse(25, 7, 1.6, 1.6, 'Y');
  },
};

// ───────────────────────── HUD y emblemas ─────────────────────────

export type HudPx = 'vida' | 'vidamax' | 'escudo' | 'oro' | 'mazo' | 'descarte' | 'poroto' | 'furia' | 'ataque' | 'aturdido' | 'candado' | 'engano' | 'pasar' | 'dado1' | 'dado2' | 'dado3' | 'dado4' | 'dado5' | 'dado6';

const HUD: Record<HudPx, Dibujo> = {
  vida: (l) => {
    l.elipse(9, 10, 6.5, 6.5, '¤').elipse(19, 10, 6.5, 6.5, '¤').poli([[2.5, 12], [25.5, 12], [14, 26]], '¤');
    vol(l, ROJO, { borde: 3, fuerzaBorde: 0.5, base: 0.62 });
    l.set(7, 7, 'e').set(8, 6, 'e').set(6, 8, 'e');
  },
  vidamax: (l) => {
    // la Vida máxima: el corazón engastado en oro (el recipiente que crece) y, arriba a la derecha, una flecha de oro
    // que sube. A 1× se distingue del corazón pelado de la Vida por el engaste y la flecha
    l.elipse(7.5, 13, 6.5, 6.5, '¤').elipse(16.5, 13, 6.5, 6.5, '¤').poli([[0.6, 15], [23.4, 15], [12, 27.5]], '¤');
    vol(l, ORO, { borde: 2, fuerzaBorde: 0.45, base: 0.62 });
    l.elipse(7.5, 13.5, 4, 4, '¤').elipse(16.5, 13.5, 4, 4, '¤').poli([[3.6, 15], [20.4, 15], [12, 24]], '¤');
    vol(l, ROJO, { borde: 2, fuerzaBorde: 0.5, base: 0.62 });
    l.set(6, 11, 'e').set(7, 10, 'e');
    // la flecha: cabeza de 5 y asta de 2, en el oro más claro, con su sombra al pie
    l.rect(23, 0, 2, 1, 'Y').rect(22, 1, 4, 1, 'Y').rect(21, 2, 6, 1, 'Y').rect(20, 3, 8, 1, 'y');
    l.rect(22, 4, 2, 7, 'Y').rect(24, 4, 2, 7, 'y');
    l.rect(22, 11, 4, 1, 'z').rect(20, 4, 2, 1, 'z').rect(26, 4, 2, 1, 'z');
  },
  escudo: (l) => {
    broquel(l, 14, 2, 10, 24, ACERO);
    l.rect(13, 3, 2, 21, 'A').rect(5, 10, 18, 2, 'A');
    l.rect(13, 10, 2, 2, 'y');
  },
  oro: (l) => moneda(l, 14, 14, 11),
  mazo: (l) => {
    for (let i = 0; i < 3; i++) naipe(l, 4 + i * 2, 8 - i * 3, 16, 19, true);
  },
  descarte: (l) => {
    naipe(l, 3, 6, 13, 18, true);
    naipe(l, 10, 3, 13, 18);
    l.linea(13, 8, 20, 16, 'R').linea(20, 8, 13, 16, 'R').linea(14, 8, 21, 16, 'r');
  },
  poroto: (l) => {
    l.trazo(11, 9, 16, 19, 7, '¤').elipse(22.5, 11, 4, 5, '.');
    vol(l, ROJO, { base: 0.55, borde: 3, fuerzaBorde: 0.5 });
    l.rect(18, 10, 1, 4, 'w').rect(19, 11, 1, 2, 'h');
    l.set(7, 8, 'e').set(8, 7, 'e').set(7, 9, 'e');
  },
  furia: (l) => llama(l, 14, 24, 22, 9),
  ataque: (l) => {
    hoja(l, 6, 22, 21, 4, 2.2, ROJO);
    hoja(l, 22, 22, 7, 4, 2.2, ROJO);
    l.trazo(3, 19, 9, 25, 1.2, 'y').trazo(25, 19, 19, 25, 1.2, 'o');
    l.trazo(5, 24, 3, 26, 1.4, 'n').trazo(23, 24, 25, 26, 1.4, 'n');
  },
  aturdido: (l) => {
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 - 0.5;
      destello(l, Math.round(14 + Math.cos(a) * 8), Math.round(14 + Math.sin(a) * 7), 3);
    }
    l.elipse(14, 14, 9, 8, '.');
    for (let a = 0; a < 6.3; a += 0.2) l.set(Math.round(14 + Math.cos(a) * 9), Math.round(14 + Math.sin(a) * 7.5), a % 0.8 < 0.4 ? 'y' : 'o');
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 - 0.5;
      destello(l, Math.round(14 + Math.cos(a) * 9), Math.round(14 + Math.sin(a) * 7.5), 3);
    }
  },
  candado: (l) => {
    l.elipse(14, 10, 6, 6, 'J').elipse(14, 10, 3.5, 3.5, '.').rect(8, 10, 12, 4, '.');
    l.rect(8, 10, 3, 4, 'J').rect(17, 10, 3, 4, 'j');
    l.rect(6, 13, 16, 12, '¤');
    vol(l, ORO, { borde: 2, base: 0.5 });
    l.elipse(14, 18, 2, 2, '0').rect(13, 19, 2, 4, '0');
  },
  engano: (l) => {
    // el antifaz
    l.poli([[2, 9], [10, 7], [14, 10], [18, 7], [26, 9], [25, 17], [18, 20], [14, 16], [10, 20], [3, 17]], '¤');
    vol(l, PURPURA, { borde: 2, fuerzaBorde: 0.5, base: 0.52 });
    hueco(l, 9, 13, 3.6, 2.4, '09f', { curva: 1.1 });
    hueco(l, 19, 13, 3.6, 2.4, '09f', { curva: 1.1 });
    l.set(9, 13, 'Y').set(19, 13, 'Y');
    l.poli([[2, 9], [10, 7], [14, 10], [18, 7], [26, 9], [26, 10], [18, 8], [14, 11], [10, 8], [2, 10]], 'y');
  },
  pasar: (l) => {
    naipe(l, 4, 8, 13, 17);
    l.rect(7, 11, 2, 4, '4');
    l.rect(16, 13, 6, 3, 'y').poli([[21, 9], [27, 14.5], [21, 20]], 'y');
    l.rect(16, 13, 6, 1, 'Y');
  },
  dado1: (l) => dadoPx(l, 5, 5, 18, 1),
  dado2: (l) => dadoPx(l, 5, 5, 18, 2),
  dado3: (l) => dadoPx(l, 5, 5, 18, 3),
  dado4: (l) => dadoPx(l, 5, 5, 18, 4),
  dado5: (l) => dadoPx(l, 5, 5, 18, 5),
  dado6: (l) => dadoPx(l, 5, 5, 18, 6),
};

// ───────────────────────── salida ─────────────────────────

const cache = new Map<string, string[]>();
function hacer(clave: string, d: Dibujo | undefined, w = N, h = N): string[] | null {
  if (!d) return null;
  let m = cache.get(clave);
  if (!m) {
    const l = new Lienzo(w, h);
    d(l);
    m = l.mapa();
    cache.set(clave, m);
  }
  return m;
}

export const AMULETOS_PX = Object.keys(AMULETO);
export const AUMENTOS_PX = Object.keys(AUMENTO);
export const BENDICIONES_PX = Object.keys(BENDICION);
export const NODOS_PX = Object.keys(NODO) as NodoPx[];
export const HUD_PX = Object.keys(HUD) as HudPx[];

export const amuletoMapa = (id: string): Mapa | null => hacer(`a:${id}`, AMULETO[id]);
export const aumentoMapa = (id: string): Mapa | null => hacer(`u:${id}`, AUMENTO[id]);
export const bendicionMapa = (id: string): Mapa | null => hacer(`b:${id}`, BENDICION[id]);
export const nodoMapa = (id: NodoPx): Mapa => hacer(`n:${id}`, NODO[id])!;
export const hudMapa = (id: HudPx): Mapa => hacer(`h:${id}`, HUD[id])!;

/** La pinta de un palo como icono chico (la del naipe, sin recortar). */
export const paloMapa = (s: Palo): Mapa => pintaNaipe(s, 'chica');

/**
 * El sello heráldico de INMUNE de un palo: un escudo de hierro con la pinta de ese palo tachada por una banda de
 * carmesí. Sprite de 36 × 40 celdas.
 */
export function inmuneMapa(s: Palo): Mapa {
  const clave = `inmune:${s}`;
  const hecho = cache.get(clave);
  if (hecho) return hecho;
  const W = 36;
  const H = 40;
  const l = new Lienzo(W, H);
  broquel(l, 18, 1, 16, 37, PLATA);
  l.poli([[18 - 12.5, 4.5], [18 + 12.5, 4.5], [18 + 12.5, 19], [18 + 7, 30], [18, 34], [18 - 7, 30], [18 - 12.5, 19]], '9');
  const p = pintaNaipe(s, 'chica');
  const [pw, ph] = medida(p);
  l.pegar(p, Math.round(18 - pw / 2), Math.round(18 - ph / 2));
  // la banda que la tacha
  for (let i = -1; i <= 1; i++) l.linea(6, 29 + i, 30, 7 + i, i === 0 ? 'r' : i < 0 ? 'e' : 'R');
  const m = l.mapa();
  cache.set(clave, m);
  return m;
}

/** La estrella de la sinergia: una chapa dorada con su estrella. 18 × 18 celdas. */
export function estrellaMapa(): Mapa {
  const clave = 'estrella';
  const hecho = cache.get(clave);
  if (hecho) return hecho;
  const l = new Lienzo(18, 18);
  l.rect(1, 0, 16, 18, '¤').rect(0, 1, 18, 16, '¤');
  vol(l, ORO, { borde: 2, fuerzaBorde: 0.45, base: 0.62 });
  l.rect(2, 2, 14, 14, '0').rect(3, 3, 12, 12, '9');
  const G = ['..X..', '..X..', 'XXXXX', '.XXX.', '.XXX.', 'XX.XX', 'X...X'];
  G.forEach((fila, y) => [...fila].forEach((c, x) => c === 'X' && l.rect(4 + x * 2, 2 + y * 2, 2, 2, 'Y')));
  const m = l.mapa();
  cache.set(clave, m);
  return m;
}
