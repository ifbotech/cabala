// Texturas pixel-art cacheadas para Three.js: nítidas (NearestFilter, sin mipmaps) y coherentes con la forja 2D.
import * as THREE from 'three';
import type { Palo } from '../../rules/cartas';
import type { MazoId } from '../../rules/mazos';
import { BAYER4 } from '../pixel/dither';
import { paloMapa } from '../pixel/iconos';
import { comodinMapa, dorsoNaipe, naipeMapa, naipeSegundaMapa } from '../pixel/naipes';
import { tintas } from '../pixel/paleta';
import { mitad } from '../pixel/partido';
import { pixeles } from '../pixel/raster';
import { REY_PX, reyRetrato, type Animo } from '../pixel/reyes';
import { lienzo, lienzoNaipe, lienzoNaipeSegunda } from '../sprites';

const T = tintas();
const cache = new Map<string, THREE.CanvasTexture>();

const frac = (v: number): number => v - Math.floor(v);
const ruido2 = (x: number, y: number): number => frac(Math.sin(x * 127.1 + y * 311.7) * 43758.5453);
const umbral = (x: number, y: number): number => (BAYER4[y & 3][x & 3] + 0.5) / 16;

function aTexturaPixel(canvas: HTMLCanvasElement, repeatX = 1, repeatY = 1): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  if (repeatX !== 1 || repeatY !== 1) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
  }
  tex.needsUpdate = true;
  return tex;
}

function crearCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')!];
}

/** Tablones de madera vieja oscura tramada con Bayer para el tablero de la mesa. */
export function texturaMadera(): THREE.CanvasTexture {
  const k = 'mat:madera';
  if (cache.has(k)) return cache.get(k)!;
  const W = 256;
  const H = 256;
  const [c, ctx] = crearCanvas(W, H);
  const img = ctx.createImageData(W, H);
  const paleta = [
    [16, 9, 22],
    [28, 16, 36],
    [42, 23, 47],
    [58, 33, 56],
    [74, 42, 62],
  ];
  for (let y = 0; y < H; y++) {
    const tablon = Math.floor(y / 32);
    const borde = y % 32 === 0 || y % 32 === 31;
    for (let x = 0; x < W; x++) {
      const idx = (y * W + x) * 4;
      if (borde) {
        img.data[idx] = 10;
        img.data[idx + 1] = 6;
        img.data[idx + 2] = 15;
        img.data[idx + 3] = 255;
        continue;
      }
      const juntaX = (x + tablon * 73) % 128 === 0;
      if (juntaX) {
        img.data[idx] = 12;
        img.data[idx + 1] = 7;
        img.data[idx + 2] = 18;
        img.data[idx + 3] = 255;
        continue;
      }
      const veta = Math.sin(x * 0.045 + tablon * 2.1 + ruido2(Math.floor(x / 8), y) * 0.8) * 0.5 + 0.5;
      const tono = 0.25 + veta * 0.55 + (ruido2(x, y) - 0.5) * 0.14;
      const esc = tono * (paleta.length - 1);
      const base = Math.max(0, Math.min(paleta.length - 2, Math.floor(esc)));
      const ci = esc - base > umbral(x, y) ? base + 1 : base;
      const col = paleta[ci];
      img.data[idx] = col[0];
      img.data[idx + 1] = col[1];
      img.data[idx + 2] = col[2];
      img.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = aTexturaPixel(c, 3, 2);
  cache.set(k, tex);
  return tex;
}

/** Pared trasera de tablones verticales en penumbra de la pulpería. */
export function texturaPared(): THREE.CanvasTexture {
  const k = 'mat:pared';
  if (cache.has(k)) return cache.get(k)!;
  const W = 128;
  const H = 128;
  const [c, ctx] = crearCanvas(W, H);
  const img = ctx.createImageData(W, H);
  const paleta = [
    [11, 7, 18],
    [19, 12, 30],
    [29, 18, 41],
    [40, 25, 51],
  ];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const idx = (y * W + x) * 4;
      const col = x % 32 === 0 ? paleta[0] : paleta[Math.min(3, Math.floor((0.35 + ruido2(x, Math.floor(y / 6)) * 0.5) * 3.2 + (umbral(x, y) - 0.5)))];
      img.data[idx] = col[0];
      img.data[idx + 1] = col[1];
      img.data[idx + 2] = col[2];
      img.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = aTexturaPixel(c, 4, 2);
  cache.set(k, tex);
  return tex;
}

/** Paño verde esmeralda tejido en Bayer para la mesa 3D (sin patrón radial repetido). */
export function texturaPano(): THREE.CanvasTexture {
  const k = 'mat:pano';
  if (cache.has(k)) return cache.get(k)!;
  const W = 128;
  const H = 128;
  const [c, ctx] = crearCanvas(W, H);
  const img = ctx.createImageData(W, H);
  const paleta = [
    [10, 34, 23],
    [15, 47, 32],
    [20, 60, 42],
    [27, 74, 52],
  ];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const idx = (y * W + x) * 4;
      const trama = ((x + y) & 1) * 0.14 + ruido2(x, y) * 0.32 + 0.3;
      const esc = trama * (paleta.length - 1);
      const base = Math.max(0, Math.min(paleta.length - 2, Math.floor(esc)));
      const ci = esc - base > umbral(x, y) ? base + 1 : base;
      const col = paleta[ci];
      img.data[idx] = col[0];
      img.data[idx + 1] = col[1];
      img.data[idx + 2] = col[2];
      img.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = aTexturaPixel(c, 5, 3);
  cache.set(k, tex);
  return tex;
}

/** Canto apilado de naipes marfil para el espesor del mazo físico. */
export function texturaCantoCarta(): THREE.CanvasTexture {
  const k = 'mat:canto';
  if (cache.has(k)) return cache.get(k)!;
  const [c, ctx] = crearCanvas(32, 32);
  for (let y = 0; y < 32; y++) {
    ctx.fillStyle = y % 3 === 0 ? '#b9a686' : y % 3 === 1 ? '#e8dcc4' : '#d6c5a7';
    ctx.fillRect(0, y, 32, 1);
  }
  const tex = aTexturaPixel(c, 2, 1);
  cache.set(k, tex);
  return tex;
}

/** Textura nítida del frente de un naipe o segunda cara de Rey. */
export function texturaNaipe(palo: Palo | 'X', n: number, segunda = false): THREE.CanvasTexture {
  const k = `naipe:${palo}:${n}:${segunda ? 1 : 0}`;
  if (cache.has(k)) return cache.get(k)!;
  const canvas =
    palo === 'X'
      ? lienzo('naipe:X', comodinMapa)
      : segunda
        ? lienzoNaipeSegunda(palo)
        : lienzoNaipe(palo, n);
  const tex = aTexturaPixel(canvas);
  cache.set(k, tex);
  return tex;
}

/** Retrato solo del Rey (sin carta 12 ni palo repetido) para la Pared de la Gloria 3D. */
export function texturaRey(palo: Palo, animo: Animo = 'calma'): THREE.CanvasTexture {
  const k = `rey:${palo}:${animo}`;
  if (cache.has(k)) return cache.get(k)!;
  const tex = aTexturaPixel(lienzo(`rey:${palo}:${animo}`, () => reyRetrato(REY_PX[palo], animo)));
  cache.set(k, tex);
  return tex;
}

/** Mitad izquierda o derecha de un enemigo partido en dos al caer. */
export function texturaNaipeMitad(palo: Palo, n: number, lado: 'izq' | 'der', segunda = false): THREE.CanvasTexture {
  const k = `mitad:${palo}:${n}:${lado}:${segunda ? 1 : 0}`;
  if (cache.has(k)) return cache.get(k)!;
  const semilla = (palo.charCodeAt(0) * 31 + n * 7) | 0;
  const base = segunda ? naipeSegundaMapa(palo) : naipeMapa(palo, n);
  const px = pixeles(mitad(base, lado, semilla), T);
  const [c, ctx] = crearCanvas(px.w, px.h);
  ctx.putImageData(new ImageData(px.data as unknown as Uint8ClampedArray<ArrayBuffer>, px.w, px.h), 0, 0);
  const tex = aTexturaPixel(c);
  cache.set(k, tex);
  return tex;
}

/** Dorso crispado de cualquiera de los 5 Mazos. */
export function texturaDorso(mazo: MazoId): THREE.CanvasTexture {
  const k = `dorso:${mazo}`;
  if (cache.has(k)) return cache.get(k)!;
  const tex = aTexturaPixel(lienzo(`dorso:${mazo}`, () => dorsoNaipe(mazo)));
  cache.set(k, tex);
  return tex;
}

/** Pinta pequeña de un palo para partículas 3D al impactar. */
export function texturaPalo(palo: Palo): THREE.CanvasTexture {
  const k = `palo:${palo}`;
  if (cache.has(k)) return cache.get(k)!;
  const tex = aTexturaPixel(lienzo(`palo:${palo}`, () => paloMapa(palo)));
  cache.set(k, tex);
  return tex;
}

/** Chispa / brasa circular pixelada 8×8 para puntos 3D. */
export function texturaParticula(): THREE.CanvasTexture {
  const k = 'fx:particula';
  if (cache.has(k)) return cache.get(k)!;
  const [c, ctx] = crearCanvas(8, 8);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fillRect(2, 1, 4, 6);
  ctx.fillRect(1, 2, 6, 4);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(2, 2, 4, 4);
  const tex = aTexturaPixel(c);
  cache.set(k, tex);
  return tex;
}

/** Halo radial circular tramado con Bayer 64×64 para el farol y la vela. */
export function texturaHalo(): THREE.CanvasTexture {
  const k = 'fx:halo';
  if (cache.has(k)) return cache.get(k)!;
  const W = 64;
  const H = 64;
  const [c, ctx] = crearCanvas(W, H);
  const img = ctx.createImageData(W, H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const idx = (y * W + x) * 4;
      const d = Math.hypot(x - 31.5, y - 31.5) / 30;
      if (d >= 1) {
        img.data[idx + 3] = 0;
        continue;
      }
      const a = Math.pow(1 - d, 2.2);
      const esc = a * 6;
      const base = Math.floor(esc);
      const banda = Math.min(6, esc - base > umbral(x, y) ? base + 1 : base);
      img.data[idx] = 255;
      img.data[idx + 1] = 255;
      img.data[idx + 2] = 255;
      img.data[idx + 3] = Math.round((banda / 6) * 255);
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = aTexturaPixel(c);
  cache.set(k, tex);
  return tex;
}




/** Máscara de porcelana marfil de teatro oscuro tramada en Bayer: claroscuro suave, cuencas almendradas, cejas asimétricas y sonrisa pícara. */
export function texturaMascaraBufon(): THREE.CanvasTexture {
  const k = 'mat:mascara-bufon';
  if (cache.has(k)) return cache.get(k)!;
  const W = 64;
  const H = 64;
  const [c, ctx] = crearCanvas(W, H);
  const img = ctx.createImageData(W, H);
  const paleta = [
    [43, 24, 58],
    [145, 125, 153],
    [216, 203, 184],
    [246, 240, 224],
  ];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const idx = (y * W + x) * 4;
      const nx = (x - 31.5) / 31.5;
      const ny = (y - 31.5) / 31.5;
      const rubor = Math.exp(-((nx - 0.36) ** 2 * 10 + (ny - 0.14) ** 2 * 14)) * 0.18 +
        Math.exp(-((nx + 0.36) ** 2 * 10 + (ny - 0.14) ** 2 * 14)) * 0.12;
      const luz = 0.88 - nx * 0.28 - Math.max(0, ny) * 0.24 - rubor + (ruido2(x, y) - 0.5) * 0.06;
      const esc = Math.max(0, Math.min(1, luz)) * (paleta.length - 1);
      const base = Math.max(0, Math.min(paleta.length - 2, Math.floor(esc)));
      const ci = esc - base > umbral(x, y) ? base + 1 : base;
      const col = paleta[ci];
      img.data[idx] = col[0];
      img.data[idx + 1] = col[1];
      img.data[idx + 2] = col[2];
      img.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  // Sombra sutil del tabique nasal
  ctx.fillStyle = '#917d99';
  ctx.fillRect(31, 22, 2, 13);

  // Cuencas almendradas expresivas
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    const h = Math.round(5 + Math.sin(t * Math.PI) * 5);
    const yL = Math.round(25 - t * 3 - h * 0.5);
    const yR = Math.round(25 - t * 3 - h * 0.5);
    ctx.fillStyle = '#2b183a';
    ctx.fillRect(15 + i, yL - 1, 1, h + 2);
    ctx.fillRect(48 - i, yR - 1, 1, h + 2);
    ctx.fillStyle = '#07030f';
    ctx.fillRect(15 + i, yL, 1, h);
    ctx.fillRect(48 - i, yR, 1, h);
  }

  // Cejas teatrales asimétricas: izquierda arqueada socarrona, derecha baja inquisitiva
  ctx.fillStyle = '#090410';
  for (let i = 0; i < 13; i++) {
    const t = i / 12;
    const yIzq = Math.round(16 - Math.sin(t * Math.PI) * 4);
    const yDer = Math.round(14 + t * 4);
    ctx.fillRect(14 + i, yIzq, 2, 3);
    ctx.fillRect(49 - i, yDer, 2, 3);
  }

  // Lágrima romboidal carmesí bajo la cuenca derecha
  ctx.fillStyle = '#d81446';
  ctx.fillRect(43, 33, 4, 2);
  ctx.fillRect(44, 31, 2, 6);

  // Costuras finas de títere
  ctx.fillStyle = '#2b183a';
  ctx.fillRect(21, 44, 1, 10);
  ctx.fillRect(42, 44, 1, 10);

  // Sonrisa pícara pintada en carmesí oscuro y tinta con destellos de marfil
  ctx.fillStyle = '#7a0e2c';
  for (let x = 18; x <= 46; x++) {
    const u = (x - 32) / 14;
    const ySonrisa = Math.round(46 - u * u * 6);
    ctx.fillRect(x, ySonrisa - 1, 1, 5);
  }
  ctx.fillStyle = '#090410';
  for (let x = 19; x <= 45; x++) {
    const u = (x - 32) / 14;
    const ySonrisa = Math.round(46 - u * u * 6);
    ctx.fillRect(x, ySonrisa, 1, 2);
  }
  ctx.fillStyle = '#f6f0e0';
  for (const dx of [24, 29, 34, 39]) {
    const u = (dx - 32) / 14;
    const yD = Math.round(46 - u * u * 6);
    ctx.fillRect(dx, yD, 2, 1);
  }

  const tex = aTexturaPixel(c);
  cache.set(k, tex);
  return tex;
}

/** Terciopelo arlequín tramado con Bayer y costuras doradas para el gorro y la gorguera del Bufón. */
export function texturaTelaBufon(tono: 'carmesi' | 'purpura'): THREE.CanvasTexture {
  const k = `mat:tela-bufon:${tono}`;
  if (cache.has(k)) return cache.get(k)!;
  const W = 32;
  const H = 32;
  const [c, ctx] = crearCanvas(W, H);
  const img = ctx.createImageData(W, H);
  const pal =
    tono === 'carmesi'
      ? [
          [40, 6, 20],
          [92, 11, 40],
          [158, 20, 64],
        ]
      : [
          [24, 8, 46],
          [49, 18, 89],
          [83, 32, 138],
        ];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const idx = (y * W + x) * 4;
      const rombo = Math.abs((x % 16) - 8) + Math.abs((y % 16) - 8);
      if (rombo === 8 && (x + y) % 4 === 0) {
        img.data[idx] = 255;
        img.data[idx + 1] = 213;
        img.data[idx + 2] = 0;
        img.data[idx + 3] = 255;
        continue;
      }
      const v = rombo < 8 ? 0.78 : 0.28;
      const esc = (v + (ruido2(x, y) - 0.5) * 0.14) * (pal.length - 1);
      const base = Math.max(0, Math.min(pal.length - 2, Math.floor(esc)));
      const ci = esc - base > umbral(x, y) ? base + 1 : base;
      const col = pal[ci];
      img.data[idx] = col[0];
      img.data[idx + 1] = col[1];
      img.data[idx + 2] = col[2];
      img.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = aTexturaPixel(c, 2, 2);
  cache.set(k, tex);
  return tex;
}

/** Cara pixel-art de marfil del Dado Cargado (1..6) con pinta central carmesí en el 1 y el 5. */
export function texturaCaraDado(puntos: number): THREE.CanvasTexture {
  const k = `mat:dado:${puntos}`;
  if (cache.has(k)) return cache.get(k)!;
  const W = 32;
  const H = 32;
  const [c, ctx] = crearCanvas(W, H);
  ctx.fillStyle = '#cbbca0';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#f4efe2';
  ctx.fillRect(2, 2, W - 4, H - 4);
  const pinta = (px: number, py: number, rojo = false): void => {
    ctx.fillStyle = rojo ? '#d81b4a' : '#160c1c';
    ctx.fillRect(px - 2, py - 2, 5, 5);
  };
  const mid = 16;
  const lo = 8;
  const hi = 24;
  if (puntos === 1) pinta(mid, mid, true);
  else if (puntos === 2) {
    pinta(lo, lo);
    pinta(hi, hi);
  } else if (puntos === 3) {
    pinta(lo, lo);
    pinta(mid, mid);
    pinta(hi, hi);
  } else if (puntos === 4) {
    pinta(lo, lo);
    pinta(hi, lo);
    pinta(lo, hi);
    pinta(hi, hi);
  } else if (puntos === 5) {
    pinta(lo, lo);
    pinta(hi, lo);
    pinta(mid, mid, true);
    pinta(lo, hi);
    pinta(hi, hi);
  } else {
    pinta(lo, lo);
    pinta(hi, lo);
    pinta(lo, mid);
    pinta(hi, mid);
    pinta(lo, hi);
    pinta(hi, hi);
  }
  const tex = aTexturaPixel(c);
  cache.set(k, tex);
  return tex;
}

/** Cubo de tiza azul cobalto tramado en Bayer con borde superior empolvado. */
export function texturaTiza(): THREE.CanvasTexture {
  const k = 'mat:tiza';
  if (cache.has(k)) return cache.get(k)!;
  const W = 32;
  const H = 32;
  const [c, ctx] = crearCanvas(W, H);
  const img = ctx.createImageData(W, H);
  const paleta = [
    [11, 46, 94],
    [26, 104, 196],
    [110, 231, 255],
  ];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const idx = (y * W + x) * 4;
      const v = y < 5 ? 0.92 : y > 28 ? 0.15 : 0.45 + (ruido2(x, y) - 0.5) * 0.22;
      const esc = Math.max(0, Math.min(1, v)) * (paleta.length - 1);
      const base = Math.max(0, Math.min(paleta.length - 2, Math.floor(esc)));
      const ci = esc - base > umbral(x, y) ? base + 1 : base;
      const col = paleta[ci];
      img.data[idx] = col[0];
      img.data[idx + 1] = col[1];
      img.data[idx + 2] = col[2];
      img.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = aTexturaPixel(c);
  cache.set(k, tex);
  return tex;
}




/** Cuero oscuro curtido con trama Bayer y pespunte dorado en los bordes para la mesa de ruta. */
export function texturaCuero(): THREE.CanvasTexture {
  const k = 'mat:cuero';
  if (cache.has(k)) return cache.get(k)!;
  const W = 128;
  const H = 128;
  const [c, ctx] = crearCanvas(W, H);
  const img = ctx.createImageData(W, H);
  const paleta = [
    [22, 11, 14],
    [38, 19, 22],
    [56, 28, 28],
    [76, 40, 34],
  ];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const idx = (y * W + x) * 4;
      const distBorde = Math.min(x, y, W - 1 - x, H - 1 - y);
      const pespunte = distBorde === 5 && ((x + y) % 6 < 3);
      if (pespunte) {
        img.data[idx] = 178;
        img.data[idx + 1] = 136;
        img.data[idx + 2] = 66;
        img.data[idx + 3] = 255;
        continue;
      }
      const n = ruido2(x >> 1, y >> 1) * 0.65 + ruido2(x * 3, y * 3) * 0.35;
      const sombraBorde = distBorde < 8 ? 0.32 : 1;
      const v = Math.max(0, Math.min(1, (0.28 + n * 0.56) * sombraBorde));
      const esc = v * (paleta.length - 1);
      const base = Math.max(0, Math.min(paleta.length - 2, Math.floor(esc)));
      const ci = esc - base > umbral(x, y) ? base + 1 : base;
      const col = paleta[ci];
      img.data[idx] = col[0];
      img.data[idx + 1] = col[1];
      img.data[idx + 2] = col[2];
      img.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = aTexturaPixel(c);
  cache.set(k, tex);
  return tex;
}




/** Piedra volcánica facetada en trama Bayer para las rocas del fogón nocturno. */
export function texturaPiedra(): THREE.CanvasTexture {
  const k = 'mat:piedra';
  if (cache.has(k)) return cache.get(k)!;
  const W = 64;
  const H = 64;
  const [c, ctx] = crearCanvas(W, H);
  const img = ctx.createImageData(W, H);
  const paleta = [
    [18, 16, 24],
    [34, 30, 42],
    [54, 48, 60],
    [78, 68, 76],
  ];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const idx = (y * W + x) * 4;
      const grieta = Math.abs(Math.sin(x * 0.24 + y * 0.14)) < 0.08 ? 0.28 : 1;
      const v = Math.max(0, Math.min(1, (0.24 + ruido2(x >> 1, y >> 1) * 0.66) * grieta));
      const esc = v * (paleta.length - 1);
      const base = Math.max(0, Math.min(paleta.length - 2, Math.floor(esc)));
      const ci = esc - base > umbral(x, y) ? base + 1 : base;
      const col = paleta[ci];
      img.data[idx] = col[0];
      img.data[idx + 1] = col[1];
      img.data[idx + 2] = col[2];
      img.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = aTexturaPixel(c);
  cache.set(k, tex);
  return tex;
}

/** Cera antigua de sebo tramada en Bayer con chorreaduras verticales y borde superior tostado por el hollín. */
export function texturaCera(): THREE.CanvasTexture {
  const k = 'mat:cera';
  if (cache.has(k)) return cache.get(k)!;
  const W = 32;
  const H = 64;
  const [c, ctx] = crearCanvas(W, H);
  const img = ctx.createImageData(W, H);
  const paleta = [
    [92, 56, 36],
    [184, 147, 106],
    [242, 226, 194],
  ];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const idx = (y * W + x) * 4;
      const chorreadura = Math.sin(x * 0.72) > 0.45 && y < 38 ? 0.16 : 0;
      const hollin = y < 5 ? -0.35 : 0;
      const v = Math.max(0, Math.min(1, 0.72 - (y / H) * 0.25 + chorreadura + hollin + (ruido2(x, y) - 0.5) * 0.14));
      const esc = v * (paleta.length - 1);
      const base = Math.max(0, Math.min(paleta.length - 2, Math.floor(esc)));
      const ci = esc - base > umbral(x, y) ? base + 1 : base;
      const col = paleta[ci];
      img.data[idx] = col[0];
      img.data[idx + 1] = col[1];
      img.data[idx + 2] = col[2];
      img.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = aTexturaPixel(c);
  cache.set(k, tex);
  return tex;
}

/** Oro antiguo martillado en trama Bayer con estrías de canto para pilas de monedas y cetro. */
export function texturaOroMoneda(): THREE.CanvasTexture {
  const k = 'mat:oro-moneda';
  if (cache.has(k)) return cache.get(k)!;
  const W = 32;
  const H = 32;
  const [c, ctx] = crearCanvas(W, H);
  const img = ctx.createImageData(W, H);
  const paleta = [
    [110, 68, 12],
    [212, 154, 36],
    [255, 227, 110],
  ];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const idx = (y * W + x) * 4;
      const estria = y % 4 === 0 ? -0.25 : 0.12;
      const v = Math.max(0, Math.min(1, 0.58 + estria + (ruido2(x, y) - 0.5) * 0.18));
      const esc = v * (paleta.length - 1);
      const base = Math.max(0, Math.min(paleta.length - 2, Math.floor(esc)));
      const ci = esc - base > umbral(x, y) ? base + 1 : base;
      const col = paleta[ci];
      img.data[idx] = col[0];
      img.data[idx + 1] = col[1];
      img.data[idx + 2] = col[2];
      img.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = aTexturaPixel(c);
  cache.set(k, tex);
  return tex;
}

/** Latón envejecido tramado en Bayer para palmatorias, cascabeles, tachuelas, brújula y cuenco. */
export function texturaLaton(): THREE.CanvasTexture {
  const k = 'mat:laton';
  if (cache.has(k)) return cache.get(k)!;
  const W = 32;
  const H = 32;
  const [c, ctx] = crearCanvas(W, H);
  const img = ctx.createImageData(W, H);
  const paleta = [
    [58, 38, 16],
    [138, 101, 34],
    [217, 177, 84],
  ];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const idx = (y * W + x) * 4;
      const v = Math.max(0, Math.min(1, 0.48 + (ruido2(x >> 1, y >> 1) - 0.5) * 0.35));
      const esc = v * (paleta.length - 1);
      const base = Math.max(0, Math.min(paleta.length - 2, Math.floor(esc)));
      const ci = esc - base > umbral(x, y) ? base + 1 : base;
      const col = paleta[ci];
      img.data[idx] = col[0];
      img.data[idx + 1] = col[1];
      img.data[idx + 2] = col[2];
      img.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = aTexturaPixel(c);
  cache.set(k, tex);
  return tex;
}

/** Empedrado porteño nocturno en trama Bayer 4×4 con adoquines azulados y juntas oscuras. */
export function texturaEmpedrado(): THREE.CanvasTexture {
  const k = 'mat:empedrado';
  if (cache.has(k)) return cache.get(k)!;
  const W = 64;
  const H = 64;
  const [c, ctx] = crearCanvas(W, H);
  const img = ctx.createImageData(W, H);
  const pal = [
    [11, 16, 28],
    [22, 32, 52],
    [39, 55, 84],
    [68, 92, 134],
  ];
  for (let y = 0; y < H; y++) {
    const fila = Math.floor(y / 8);
    const desfase = (fila % 2) * 8;
    for (let x = 0; x < W; x++) {
      const idx = (y * W + x) * 4;
      const ax = (x + desfase) % 16;
      const ay = y % 8;
      const junta = ax === 0 || ay === 0;
      const v = junta ? 0.08 : 0.42 + (ruido2(Math.floor((x + desfase) / 16), fila) - 0.5) * 0.38 + (ay === 1 ? 0.16 : 0);
      const esc = Math.max(0, Math.min(1, v)) * (pal.length - 1);
      const base = Math.max(0, Math.min(pal.length - 2, Math.floor(esc)));
      const ci = esc - base > umbral(x, y) ? base + 1 : base;
      const col = pal[ci];
      img.data[idx] = col[0];
      img.data[idx + 1] = col[1];
      img.data[idx + 2] = col[2];
      img.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = aTexturaPixel(c, 5, 14);
  cache.set(k, tex);
  return tex;
}

/** Sol de Mayo monumental en oro tramado Bayer (eco del 1 de Oros) con 32 rayos alternados y rostro tallado. */
export function texturaSolDeMayo(): THREE.CanvasTexture {
  const k = 'mat:sol-de-mayo';
  if (cache.has(k)) return cache.get(k)!;
  const W = 128;
  const H = 128;
  const [c, ctx] = crearCanvas(W, H);
  const cx = 64;
  const cy = 64;

  // 32 rayos alternados: 16 rectos agudos y 16 flamígeros sinuosos
  for (let i = 0; i < 32; i++) {
    const ang = (i * Math.PI * 2) / 32;
    const flamigero = i % 2 === 1;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(ang);
    ctx.beginPath();
    ctx.moveTo(0, -22);
    if (flamigero) {
      ctx.quadraticCurveTo(5, -38, -3, -48);
      ctx.quadraticCurveTo(4, -56, 0, -62);
      ctx.quadraticCurveTo(-4, -54, 2, -45);
      ctx.quadraticCurveTo(-5, -35, -3, -22);
    } else {
      ctx.lineTo(3, -22);
      ctx.lineTo(0, -61);
      ctx.lineTo(-3, -22);
    }
    ctx.closePath();
    ctx.fillStyle = flamigero ? '#ffae2b' : '#ffe26a';
    ctx.fill();
    ctx.restore();
  }

  // Disco solar central con sombreado Bayer
  const img = ctx.getImageData(0, 0, W, H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const r = Math.hypot(dx, dy);
      if (r <= 25) {
        const idx = (y * W + x) * 4;
        const luz = 1 - r / 27 + (-dx * 0.012 - dy * 0.012);
        const ci = luz > 0.65 + (umbral(x, y) - 0.5) * 0.25 ? 2 : luz > 0.35 + (umbral(x, y) - 0.5) * 0.25 ? 1 : 0;
        const col = ci === 2 ? [255, 243, 168] : ci === 1 ? [255, 213, 74] : [214, 134, 24];
        img.data[idx] = col[0];
        img.data[idx + 1] = col[1];
        img.data[idx + 2] = col[2];
        img.data[idx + 3] = 255;
      }
    }
  }
  ctx.putImageData(img, 0, 0);

  // Rostro sereno tallado del Sol de Mayo
  ctx.fillStyle = '#5a2d0c';
  // Cejas arqueadas
  ctx.fillRect(52, 54, 7, 2);
  ctx.fillRect(69, 54, 7, 2);
  // Ojos
  ctx.fillRect(54, 58, 4, 3);
  ctx.fillRect(70, 58, 4, 3);
  // Nariz recta
  ctx.fillRect(63, 56, 2, 11);
  ctx.fillRect(61, 66, 6, 2);
  // Boca firme
  ctx.fillRect(58, 73, 12, 2);

  const tex = aTexturaPixel(c);
  cache.set(k, tex);
  return tex;
}

/** Placa pixel-art 32×32 con marco dorado para clavar Amuletos y Cábalas en La Pared de la Gloria 3D. */
export function texturaIconoMapa(clave: string, mapa: readonly string[], fondoHex = '#160c24'): THREE.CanvasTexture {
  const k = `mat:icono:${clave}`;
  if (cache.has(k)) return cache.get(k)!;
  const W = 32;
  const H = 32;
  const [c, ctx] = crearCanvas(W, H);
  ctx.fillStyle = fondoHex;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#ffd500';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, W - 2, H - 2);
  const img = lienzo(`icono:${clave}`, () => mapa);
  const pad = 4;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, pad, pad, W - pad * 2, H - pad * 2);
  const tex = aTexturaPixel(c);
  cache.set(k, tex);
  return tex;
}
