// La constitución de CÁBALA 2.0 (MVP 2D): lo que el juego ES (y lo que eliminó) no se rompe sin que se note.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { AMULETO, AMULETOS } from '../src/rules/amuletos';
import { B } from '../src/rules/balance';
import { JUGADAS, PALOS, barajaBase } from '../src/rules/cartas';
import { ESTADOS_COMBATIENTE, enemigoMapa, heroeMapa } from '../src/client/pixel/combatientes';
import { celdas, cuadra } from '../src/client/pixel/rejilla';
import { MAZO, MAZOS, MAZOS_ABIERTOS } from '../src/rules/mazos';
import { mazoAbierto, perfilNuevo } from '../src/rules/perfil';
import { BENDICION, BENDICIONES, REY_DEF } from '../src/rules/reyes';
import { MARCA, SLUG, TITULO, VERSION } from '../src/shared/brand';

const raiz = join(__dirname, '..');
function archivos(dir: string, out: string[] = []): string[] {
  for (const f of readdirSync(dir)) {
    const ruta = join(dir, f);
    if (statSync(ruta).isDirectory()) archivos(ruta, out);
    else if (/\.(ts|css|json|html)$/.test(f)) out.push(ruta);
  }
  return out;
}

describe('marca y arquitectura 2D pura', () => {
  it('se llama CÁBALA en los dos idiomas', () => {
    expect(TITULO).toBe('CÁBALA');
    expect(SLUG).toBe('cabala');
    expect(MARCA.es.titulo).toBe('CÁBALA');
  });
  it('la versión es la de package.json', () => {
    const pkg = JSON.parse(readFileSync(join(raiz, 'package.json'), 'utf8')) as { version: string; name: string };
    expect(pkg.version).toBe(VERSION);
    expect(pkg.name).toBe('cabala');
  });
  it('cero imports de Three.js o escena3d en src/', () => {
    for (const f of archivos(join(raiz, 'src'))) {
      const txt = readFileSync(f, 'utf8');
      expect(txt, f).not.toMatch(/from\s+['"]three['"]|escena3d/);
    }
  });
});

describe('baraja española pura', () => {
  it('el mazo del jugador lleva del 1 al 9 de los cuatro palos más los Comodines', () => {
    const b = barajaBase();
    expect(b.filter((c) => c.palo !== 'X')).toHaveLength(36);
    expect(b.filter((c) => c.palo === 'X')).toHaveLength(2);
    for (const s of PALOS) expect(b.filter((c) => c.palo === s).map((c) => c.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(Math.max(...b.map((c) => c.n))).toBe(9);
  });
  it('el Truco juega del 1 al 7 y El Mentiroso lleva Comodines de más', () => {
    expect(B.mazos.truco.hasta).toBe(7);
    expect(B.mazos.mentiroso.comodines).toBeGreaterThan(B.jugador.comodines);
  });
  it('la Corte (10, 11 y 12) son los enemigos, con su Vida y su Ataque', () => {
    expect(Object.keys(B.enemigos.vida)).toEqual(['10', '11', '12']);
    expect(Object.keys(B.enemigos.ataque)).toEqual(['10', '11', '12']);
  });
  it('hay nueve jugadas de siempre y el Multi de todas es entero', () => {
    expect(JUGADAS).toHaveLength(9);
    for (const j of Object.values(B.jugadas)) {
      expect(Number.isInteger(j.m)).toBe(true);
      expect(Number.isInteger(j.d)).toBe(true);
    }
  });
});

describe('exactamente 15 Cábalas (Amuletos)', () => {
  it('3 por palo (1 Común, 1 Raro, 1 Épico) y 3 del Bufón, todos Legendarios', () => {
    expect(AMULETOS).toHaveLength(15);
    for (const s of PALOS) {
      const suyos = AMULETOS.filter((id) => AMULETO[id].palo === s).map((id) => AMULETO[id].rareza);
      expect(suyos.sort()).toEqual(['comun', 'epico', 'raro']);
    }
    const bufon = AMULETOS.filter((id) => AMULETO[id].palo === 'X');
    expect(bufon).toHaveLength(3);
    expect(bufon.every((id) => AMULETO[id].rareza === 'legendario')).toBe(true);
  });
});

describe('4 Reyes y 12 Bendiciones directas', () => {
  it('cada Rey tiene 3 Bendiciones de 1 nivel (sin pactos duales)', () => {
    expect(Object.keys(REY_DEF)).toHaveLength(4);
    expect(BENDICIONES).toHaveLength(12);
    for (const s of PALOS) {
      expect(BENDICIONES.filter((id) => BENDICION[id].rey === s)).toHaveLength(3);
    }
    for (const id of BENDICIONES) {
      expect(BENDICION[id].niveles).toBe(1);
    }
  });
});

describe('los 5 Mazos abiertos desde el minuto 0', () => {
  it('todos los Mazos están desbloqueados desde el inicio', () => {
    expect(MAZOS).toHaveLength(5);
    expect(MAZOS_ABIERTOS).toHaveLength(5);
    const p = perfilNuevo();
    for (const m of MAZOS) {
      expect(MAZO[m].desbloqueo).toBeNull();
      expect(mazoAbierto(p, m)).toBe(true);
    }
  });
});

describe('Hito 3 · CSS limpio y sprites 2D de cuerpo entero', () => {
  it('el CSS total ocupa menos de 2.000 líneas', () => {
    const css = archivos(join(raiz, 'src', 'client', 'estilos')).filter((f) => f.endsWith('.css'));
    const lineas = css.reduce((n, f) => n + readFileSync(f, 'utf8').split('\n').length, 0);
    expect(lineas).toBeLessThan(2000);
  });
  it('los 5 Héroes y los 12 Enemigos tienen sprites 2D válidos en todos sus estados', () => {
    for (const m of MAZOS) {
      for (const est of ESTADOS_COMBATIENTE) {
        for (const c of [0, 1] as const) {
          const mp = heroeMapa(m, est, c);
          expect(cuadra(mp), `heroe ${m}/${est}/${c}`).toBe(true);
          expect(celdas(mp), `heroe ${m}/${est}/${c}`).toBeGreaterThan(80);
        }
      }
    }
    for (const palo of PALOS) {
      for (const rango of [10, 11, 12] as const) {
        for (const est of ESTADOS_COMBATIENTE) {
          const mp = enemigoMapa(palo, rango, est, 0, rango === 12);
          expect(cuadra(mp), `enemigo ${palo}${rango}/${est}`).toBe(true);
          expect(celdas(mp), `enemigo ${palo}${rango}/${est}`).toBeGreaterThan(80);
        }
      }
    }
  });
});
