// La música se compone sola: estas pruebas cuidan que cada pista esté bien escrita y que su canto entone.
import { describe, expect, it } from 'vitest';
import { PISTAS, componer, type PistaId } from '../src/client/musica';

const IDS = Object.keys(PISTAS) as PistaId[];

describe('música', () => {
  it('cada pista tiene sus ritmos del largo del compás y un acorde por compás', () => {
    for (const id of IDS) {
      const p = PISTAS[id];
      for (const r of [p.bajo, p.rasgueo, ...p.canto, p.bombo, p.caja, p.plato]) if (r !== undefined) expect(r.length, `${id}: «${r}»`).toBe(p.pasos);
      expect(p.acordes.length % 2, id).toBe(0);
      for (const a of p.acordes) expect(a.length, id).toBe(3);
    }
  });

  it('el canto entona: notas de la escala o del acorde, en su registro y sin saltos de más de una octava', () => {
    for (const id of IDS) {
      const p = PISTAS[id];
      const notas = componer(id);
      expect(notas.length).toBe(p.acordes.length * p.pasos);
      let anterior = -1;
      let cuantas = 0;
      notas.forEach((n, k) => {
        if (!n) return;
        cuantas++;
        const acorde = p.acordes[Math.floor(k / p.pasos)].map((x) => x % 12);
        const clase = (((n.midi - p.tonica) % 12) + 12) % 12;
        expect(p.escala.includes(clase) || acorde.includes(clase), `${id} paso ${k}: ${n.midi}`).toBe(true);
        // en los tiempos fuertes, nota del acorde
        if ((k % p.pasos) % 4 === 0) expect(acorde.includes(clase), `${id} paso ${k} (fuerte)`).toBe(true);
        expect(n.midi).toBeGreaterThanOrEqual(p.tonica + 7);
        expect(n.midi).toBeLessThanOrEqual(p.tonica + 22);
        if (anterior >= 0) expect(Math.abs(n.midi - anterior), `${id} paso ${k}`).toBeLessThanOrEqual(12);
        anterior = n.midi;
      });
      expect(cuantas, id).toBeGreaterThanOrEqual(p.acordes.length);
    }
  });

  it('componer es determinista (la pista suena siempre igual)', () => {
    for (const id of IDS) expect(componer(id)).toBe(componer(id));
  });
});
