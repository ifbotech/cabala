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

/** Máscara veneciana tallada de marfil hueso frío con cuencas almendradas, lágrima carmesí y sonrisa ladina. */
export function texturaMascaraBufon(): THREE.CanvasTexture {
  const k = 'mat:mascara-bufon';
  if (cache.has(k)) return cache.get(k)!;
  const W = 64;
  const H = 64;
  const [c, ctx] = crearCanvas(W, H);
  const img = ctx.createImageData(W, H);
  const paleta = [
    [96, 82, 102],
    [168, 154, 152],
    [224, 214, 198],
    [248, 243, 232],
  ];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const idx = (y * W + x) * 4;
      const nx = (x - 31.5) / 31.5;
      const ny = (y - 31.5) / 31.5;
      const luz = 0.88 - Math.abs(nx) * 0.42 - Math.max(0, ny) * 0.28 + (ruido2(x, y) - 0.5) * 0.06;
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
  ctx.fillStyle = 'rgba(72, 56, 82, 0.35)';
  ctx.fillRect(30, 24, 4, 14);

  // Cuencas oscuras almendradas inclinadas hacia las sienes (mirada felina y ladina)
  ctx.fillStyle = '#0d0614';
  for (let i = 0; i < 13; i++) {
    const t = i / 12;
    const h = Math.round(5 + Math.sin(t * Math.PI) * 5);
    const yL = Math.round(25 - t * 4 - h * 0.5);
    const yR = Math.round(25 - t * 4 - h * 0.5);
    ctx.fillRect(14 + i, yL, 1, h);
    ctx.fillRect(49 - i, yR, 1, h);
  }

  // Cejas finas y arqueadas
  ctx.fillStyle = '#1b0b26';
  for (let i = 0; i < 15; i++) {
    const t = i / 14;
    const yArc = Math.round(18 - Math.sin(t * Math.PI) * 4 - t * 2);
    ctx.fillRect(13 + i, yArc, 2, 2);
    ctx.fillRect(49 - i, yArc, 2, 2);
  }

  // Lágrima romboidal carmesí bajo la cuenca izquierda + rubor sutil en pómulos
  ctx.fillStyle = '#d41145';
  ctx.fillRect(16, 33, 3, 2);
  ctx.fillRect(17, 32, 1, 5);
  ctx.fillStyle = 'rgba(196, 18, 66, 0.35)';
  ctx.fillRect(11, 35, 5, 3);
  ctx.fillRect(48, 35, 5, 3);

  // Sonrisa veneciana curva y afilada (sin dientes de bloque)
  ctx.fillStyle = '#14081d';
  for (let x = 18; x <= 46; x++) {
    const u = (x - 32) / 14;
    const ySonrisa = Math.round(47 - u * u * 6);
    ctx.fillRect(x, ySonrisa, 1, 2);
  }
  ctx.fillStyle = '#d41145';
  ctx.fillRect(17, 40, 2, 2);
  ctx.fillRect(45, 40, 2, 2);

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
