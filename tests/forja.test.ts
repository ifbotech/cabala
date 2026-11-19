// La forja: todas las piezas existen, cuadran y pasan el linter de pixel-art; los naipes llevan SOLO el número en las
// esquinas (sin mini-palo); el laboratorio certificó el balance vigente y sus sellos cubren todas las piezas.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { huella } from '../scripts/huella';
import { OBJETIVOS } from '../scripts/objetivos';
import { lintCatalogo } from '../scripts/pixel-lint';
import { catalogo } from '../src/client/pixel/catalogo';
import { AMULETOS_PX, AUMENTOS_PX, BENDICIONES_PX } from '../src/client/pixel/iconos';
import { NAIPE_H, NAIPE_W, ZONA_INDICE, naipeMapa } from '../src/client/pixel/naipes';
import { LETRA_PALO } from '../src/client/pixel/paleta';
import { cuadros, personajeMapa } from '../src/client/pixel/personajes';
import { celdas, cuadra } from '../src/client/pixel/rejilla';
import { AMULETOS } from '../src/rules/amuletos';
import { AUMENTOS } from '../src/rules/aumentos';
import { PALOS } from '../src/rules/cartas';
import { MAZOS } from '../src/rules/mazos';
import { BENDICIONES } from '../src/rules/reyes';
import sellos from '../src/rules/sellos.json';

describe('catálogo de pixel-art', () => {
  const piezas = catalogo();
  it('todas las piezas cuadran y tienen dibujo', () => {
    expect(piezas.length).toBeGreaterThan(200);
    for (const p of piezas) {
      expect(cuadra(p.m), `${p.grupo}/${p.id}`).toBe(true);
      expect(celdas(p.m), `${p.grupo}/${p.id}`).toBeGreaterThan(10);
    }
  });
  it('cada Amuleto, Aumento y Bendición tiene su icono', () => {
    expect([...AMULETOS_PX].sort()).toEqual([...AMULETOS].sort());
    expect([...AUMENTOS_PX].sort()).toEqual([...AUMENTOS].sort());
    expect([...BENDICIONES_PX].sort()).toEqual([...BENDICIONES].sort());
  });
  it('cada Personaje tiene todos sus cuadros (mirada, gesto y heridas), distintos entre sí', () => {
    for (const m of MAZOS) {
      const vistos = new Set(cuadros().map((c) => personajeMapa(m, c).join('\n')));
      expect(vistos.size, m).toBe(cuadros().length);
    }
  });
  it('el linter de pixel-art no encuentra fallos graves', () => {
    const graves = lintCatalogo().flatMap((i) => i.hallazgos.filter((h) => h.grave).map((h) => `${i.pieza.grupo}/${i.pieza.id} · ${h.regla}: ${h.msg}`));
    expect(graves).toEqual([]);
  });
});

describe('naipes', () => {
  it('miden 100 × 140 celdas', () => {
    for (const s of PALOS) for (let n = 1; n <= 12; n++) {
      const m = naipeMapa(s, n);
      expect(m).toHaveLength(NAIPE_H);
      expect(m[0]).toHaveLength(NAIPE_W);
    }
  });
  it('en las esquinas va SOLO el número, en la tinta de su palo: sin mini-palo debajo', () => {
    for (const s of PALOS)
      for (let n = 1; n <= 12; n++) {
        const m = naipeMapa(s, n);
        const tinta = LETRA_PALO[s];
        for (const [x0, y0, x1, y1] of ZONA_INDICE) {
          const letras = new Set<string>();
          // la cara dibujada empieza en la columna 2 del sprite; el canto del papel no cuenta
          for (let y = Math.max(2, y0); y <= Math.min(NAIPE_H - 3, y1); y++) for (let x = Math.max(3, x0 + 2); x <= Math.min(NAIPE_W - 4, x1 + 2); x++) letras.add(m[y][x]);
          letras.delete('m');
          letras.delete('h');
          letras.delete('k');
          expect([...letras], `${s}${n}`).toEqual([tinta]);
          // y el número ocupa solo la franja de arriba de su zona: debajo, papel
          const debajo = y0 === 0 ? [23, 32] : [107, 116];
          for (let y = debajo[0]; y <= debajo[1]; y++) for (let x = x0 + 2; x <= x1 + 2; x++) expect('mhk', `${s}${n} en ${x},${y}`).toContain(m[y][x]);
        }
      }
  });
});

describe('laboratorio', () => {
  it('cada pieza tiene su sello S / A / B, por tercios', () => {
    const claves = [...AMULETOS.map((id) => `a:${id}`), ...BENDICIONES.map((id) => `b:${id}`), ...AUMENTOS.map((id) => `u:${id}`)];
    const tabla = sellos as Record<string, string>;
    for (const k of claves) expect(['S', 'A', 'B'], k).toContain(tabla[k]);
    expect(Object.keys(tabla).sort()).toEqual(claves.sort());
    for (const pre of ['a', 'b', 'u']) {
      const suyos = Object.entries(tabla).filter(([k]) => k.startsWith(`${pre}:`));
      const s = suyos.filter(([, v]) => v === 'S').length;
      const b = suyos.filter(([, v]) => v === 'B').length;
      expect(s).toBe(Math.round(suyos.length / 3));
      expect(b).toBe(Math.round(suyos.length / 3));
    }
  });
  it('el informe certifica el balance vigente, sin avisos y dentro de los objetivos', () => {
    const ruta = join(__dirname, '..', 'scripts', 'meta-report.json');
    expect(existsSync(ruta), 'falta scripts/meta-report.json: correr npm run analyze:meta').toBe(true);
    const informe = JSON.parse(readFileSync(ruta, 'utf8')) as { huella: string; avisos: string[]; mazos: { mazo: string; vacio: number; lleno: number }[] };
    expect(informe.huella, 'las reglas cambiaron desde el último informe: correr npm run analyze:meta').toBe(huella());
    expect(informe.avisos).toEqual([]);
    expect(informe.mazos).toHaveLength(OBJETIVOS.mazos);
    for (const m of informe.mazos) {
      expect(m.vacio, m.mazo).toBeGreaterThanOrEqual(OBJETIVOS.base[0]);
      expect(m.vacio, m.mazo).toBeLessThanOrEqual(OBJETIVOS.base[1]);
      expect(m.lleno, m.mazo).toBeGreaterThanOrEqual(OBJETIVOS.lleno[0]);
      expect(m.lleno, m.mazo).toBeLessThanOrEqual(OBJETIVOS.lleno[1]);
    }
  });
});
