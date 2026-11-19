// Un codificador PNG mínimo (RGBA, 8 bits) con el zlib de Node: la forja escribe sus láminas sin navegador.
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { lisos, pegarPixeles, pixeles, type Pixeles } from '../src/client/pixel/raster';
import type { Mapa, Tintas } from '../src/client/pixel/rejilla';

const TABLA = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc(buf: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = TABLA[(c ^ buf[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function trozo(tipo: string, datos: Uint8Array): Buffer {
  const cab = Buffer.alloc(8);
  cab.writeUInt32BE(datos.length, 0);
  cab.write(tipo, 4, 'ascii');
  const cuerpo = Buffer.concat([cab.subarray(4), datos]);
  const fin = Buffer.alloc(4);
  fin.writeUInt32BE(crc(cuerpo), 0);
  return Buffer.concat([cab.subarray(0, 4), cuerpo, fin]);
}

export function png(p: Pixeles): Buffer {
  const cruda = Buffer.alloc((p.w * 4 + 1) * p.h);
  for (let y = 0; y < p.h; y++) {
    cruda[y * (p.w * 4 + 1)] = 0;
    Buffer.from(p.data.buffer, p.data.byteOffset + y * p.w * 4, p.w * 4).copy(cruda, y * (p.w * 4 + 1) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(p.w, 0);
  ihdr.writeUInt32BE(p.h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), trozo('IHDR', ihdr), trozo('IDAT', deflateSync(cruda, { level: 9 })), trozo('IEND', new Uint8Array(0))]);
}

export function guardar(ruta: string, p: Pixeles): void {
  mkdirSync(dirname(ruta), { recursive: true });
  writeFileSync(ruta, png(p));
}

export interface Celda {
  m: Mapa;
  /** Escala entera a la que se pega. */
  k?: number;
}

/**
 * Una lámina de contacto: las piezas en filas, cada una a su escala entera, sobre un fondo liso.
 * `ancho` es el ancho máximo de la lámina en píxeles.
 */
export function lamina(piezas: Celda[], t: Tintas, o: { ancho?: number; fondo?: string; margen?: number } = {}): Pixeles {
  const ancho = o.ancho ?? 1600;
  const margen = o.margen ?? 8;
  const cajas = piezas.map((c) => ({ px: pixeles(c.m, t), k: c.k ?? 1 }));
  let x = margen;
  let y = margen;
  let altoFila = 0;
  const sitios: [number, number][] = [];
  for (const c of cajas) {
    const w = c.px.w * c.k;
    const h = c.px.h * c.k;
    if (x + w + margen > ancho && x > margen) {
      x = margen;
      y += altoFila + margen;
      altoFila = 0;
    }
    sitios.push([x, y]);
    x += w + margen;
    altoFila = Math.max(altoFila, h);
  }
  const base = lisos(ancho, y + altoFila + margen, o.fondo ?? '#160c1c');
  cajas.forEach((c, i) => pegarPixeles(base, c.px, sitios[i][0], sitios[i][1], c.k));
  return base;
}
