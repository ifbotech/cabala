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
