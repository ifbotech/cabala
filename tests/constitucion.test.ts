// La constitución de CÁBALA como pruebas: lo que el juego ES (y lo que ya no tiene) no se rompe sin que se note.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { OBJETIVOS } from '../scripts/objetivos';
import { EN, ES, JUGADA_COMO, JUGADA_NOMBRE, NODO_DESC, NODO_NOMBRE } from '../src/client/textos';
import { ENSENANZA, VOZ } from '../src/client/voces';
import { AMULETO, AMULETOS } from '../src/rules/amuletos';
import { AUMENTO, AUMENTOS, aumentosDe } from '../src/rules/aumentos';
import { B } from '../src/rules/balance';
import { CABALAS } from '../src/rules/bufon';
import { JUGADAS, PALOS, barajaBase } from '../src/rules/cartas';
import { MAZO, MAZOS, MAZOS_ABIERTOS } from '../src/rules/mazos';
import { MEJORAS } from '../src/rules/perfil';
import { REINADOS } from '../src/rules/reinados';
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

describe('marca', () => {
  it('se llama CÁBALA en los dos idiomas, con su subtítulo inglés', () => {
    expect(TITULO).toBe('CÁBALA');
    expect(SLUG).toBe('cabala');
    expect(MARCA.es.titulo).toBe('CÁBALA');
    expect(MARCA.en.titulo).toBe('CÁBALA');
    expect(MARCA.en.subtitulo).toBe('A Spanish-Deck Roguelike');
  });
  it('la versión es la de package.json', () => {
    const pkg = JSON.parse(readFileSync(join(raiz, 'package.json'), 'utf8')) as { version: string; name: string };
    expect(pkg.version).toBe(VERSION);
    expect(pkg.name).toBe('cabala');
  });
  it('se publica bajo /cabala/', () => {
    expect(readFileSync(join(raiz, 'vite.config.ts'), 'utf8')).toContain("'/cabala/'");
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

describe('exactamente 15 Amuletos', () => {
  it('3 por palo (1 Común, 1 Raro, 1 Épico) y 3 del Bufón, todos Legendarios', () => {
    expect(AMULETOS).toHaveLength(OBJETIVOS.amuletos);
    for (const s of PALOS) {
      const suyos = AMULETOS.filter((id) => AMULETO[id].palo === s).map((id) => AMULETO[id].rareza);
      expect(suyos.sort()).toEqual(['comun', 'epico', 'raro']);
    }
    const bufon = AMULETOS.filter((id) => AMULETO[id].palo === 'X');
    expect(bufon).toHaveLength(3);
    expect(bufon.every((id) => AMULETO[id].rareza === 'legendario')).toBe(true);
  });
});

describe('Aumentos del Bufón', () => {
  it('son entre 16 y 18, repartidos en Plata, Oro y Prismático', () => {
    expect(AUMENTOS.length).toBeGreaterThanOrEqual(OBJETIVOS.aumentos[0]);
    expect(AUMENTOS.length).toBeLessThanOrEqual(OBJETIVOS.aumentos[1]);
    for (const n of ['plata', 'oro', 'prisma'] as const) expect(aumentosDe(n).length).toBeGreaterThanOrEqual(3);
  });
  it('las Maldiciones viven en el nivel Prismático', () => {
    const malditas = AUMENTOS.filter((id) => AUMENTO[id].maldicion);
    expect(malditas.length).toBeGreaterThanOrEqual(2);
    expect(malditas.every((id) => AUMENTO[id].nivel === 'prisma')).toBe(true);
  });
});

describe('los 5 Mazos y sus Personajes', () => {
  it('son cinco, con Escoba y Truco abiertos desde el minuto 0', () => {
    expect(MAZOS).toHaveLength(OBJETIVOS.mazos);
    expect([...MAZOS_ABIERTOS].sort()).toEqual(['escoba', 'truco']);
    for (const m of MAZOS) expect(MAZO[m].personaje.es.length).toBeGreaterThan(3);
  });
  it('la regla estrella de cada uno cabe en 12 palabras', () => {
    for (const m of MAZOS) expect(MAZO[m].regla.es.split(/\s+/).length, MAZO[m].regla.es).toBeLessThanOrEqual(OBJETIVOS.palabrasRegla);
  });
});

describe('los 4 Reyes', () => {
  it('cada palo tiene su Rey, su carga y tres Bendiciones; hay seis Pactos Duales', () => {
    for (const s of PALOS) {
      expect(REY_DEF[s].carga.es.length).toBeGreaterThan(2);
      expect(BENDICIONES.filter((id) => BENDICION[id].rey === s && !BENDICION[id].dual)).toHaveLength(3);
    }
    const duales = BENDICIONES.filter((id) => BENDICION[id].dual);
    expect(duales).toHaveLength(6);
    expect(new Set(duales.map((id) => [BENDICION[id].rey, BENDICION[id].dual].sort().join(''))).size).toBe(6);
  });
});

describe('el Altar', () => {
  it('es una sola lista de 6 a 8 mejoras directas, de hasta 5 niveles', () => {
    expect(MEJORAS.length).toBeGreaterThanOrEqual(OBJETIVOS.mejorasAltar[0]);
    expect(MEJORAS.length).toBeLessThanOrEqual(OBJETIVOS.mejorasAltar[1]);
    for (const m of MEJORAS) {
      expect(m.max).toBeGreaterThanOrEqual(1);
      expect(m.max).toBeLessThanOrEqual(5);
    }
  });
});

describe('textos', () => {
  const pares: [string, { es: string; en: string }][] = [
    ...AMULETOS.flatMap((id) => [[`amuleto ${id} nombre`, AMULETO[id].nombre], [`amuleto ${id}`, AMULETO[id].desc]] as [string, { es: string; en: string }][]),
    ...AUMENTOS.flatMap((id) => [[`aumento ${id} nombre`, AUMENTO[id].nombre], [`aumento ${id}`, AUMENTO[id].desc]] as [string, { es: string; en: string }][]),
    ...BENDICIONES.flatMap((id) => [1, 2, 3].slice(0, BENDICION[id].niveles).map((n) => [`bendición ${id} nivel ${n}`, BENDICION[id].desc(n)] as [string, { es: string; en: string }])),
    ...MAZOS.flatMap((m) => MAZO[m].reglas.map((r, i) => [`mazo ${m} regla ${i}`, r] as [string, { es: string; en: string }])),
    ...MEJORAS.map((m) => [`mejora ${m.id}`, m.desc] as [string, { es: string; en: string }]),
    ...REINADOS.map((r) => [`reinado ${r.n}`, r.giro] as [string, { es: string; en: string }]),
    ...PALOS.flatMap((s) => [[`rey ${s} rasgo`, REY_DEF[s].rasgoDesc], [`rey ${s} carga`, REY_DEF[s].cargaDa]] as [string, { es: string; en: string }][]),
    ...CABALAS.flatMap((c) => c.opciones.map((o) => [`cábala ${c.id}/${o.id}`, o.detalle] as [string, { es: string; en: string }])),
  ];
  it('todo efecto está en los dos idiomas, sin campos sin rellenar', () => {
    for (const [de, l] of pares) {
      expect(l.es, de).toBeTruthy();
      expect(l.en, de).toBeTruthy();
      expect(l.es, de).not.toMatch(/[{}]|undefined|NaN/);
      expect(l.en, de).not.toMatch(/[{}]|undefined|NaN/);
    }
  });
  it(`ninguna descripción pasa de ${OBJETIVOS.largoDesc} caracteres`, () => {
    for (const [de, l] of pares) {
      if (de.startsWith('mazo ')) continue;
      expect(l.es.length, `${de}: ${l.es}`).toBeLessThanOrEqual(OBJETIVOS.largoDesc);
      expect(l.en.length, `${de}: ${l.en}`).toBeLessThanOrEqual(OBJETIVOS.largoDesc);
    }
  });
  it('las cifras de cada efecto son las mismas en español y en inglés', () => {
    const cifras = (s: string) => (s.match(/\d+/g) ?? []).sort().join(',');
    for (const [de, l] of pares) expect(cifras(l.en), de).toBe(cifras(l.es));
  });
  it('la interfaz tiene las mismas claves en los dos idiomas, todas con texto', () => {
    expect(Object.keys(EN).sort()).toEqual(Object.keys(ES).sort());
    for (const k of Object.keys(ES) as (keyof typeof ES)[]) {
      expect(ES[k].trim(), k).not.toBe('');
      expect(EN[k].trim(), k).not.toBe('');
      expect((EN[k].match(/\{\w+\}/g) ?? []).sort(), k).toEqual((ES[k].match(/\{\w+\}/g) ?? []).sort());
    }
    for (const t of [JUGADA_NOMBRE, JUGADA_COMO, NODO_NOMBRE, NODO_DESC]) for (const v of Object.values(t)) expect(v.es && v.en).toBeTruthy();
  });
  it('la guía son tres comentarios cortos del Bufón, y nada más', () => {
    expect(ENSENANZA).toHaveLength(3);
    for (const l of ENSENANZA) expect(l.es.split(/\s+/).length).toBeLessThanOrEqual(18);
    expect(VOZ.portada.length).toBeGreaterThan(0);
  });
});

describe('lo que CÁBALA ya no tiene', () => {
  // cero rastro en el código, la interfaz y los textos de lo que se podó al fundar el juego
  const PODADO = /\b(lacre|sello de (pólvora|eco|oro real|la manga)|la manga|tratante|pulpero|asalto diario|partida guiada|puente levadizo|la cripta|policromo|cristal maldito|filo de plata|trampas? del bufón|sobre lacrado|pergamino|esquirlas?|taberna|sangre y palo|blood & suits|derrumbe)\b/i;
  it('ni Sellos de Lacre, ni Manga, ni Tratante, ni cartas especiales, ni toponimia medieval', () => {
    const malos: string[] = [];
    for (const f of [...archivos(join(raiz, 'src')), join(raiz, 'index.html')]) {
      const texto = readFileSync(f, 'utf8');
      const m = PODADO.exec(texto);
      if (m) malos.push(`${f.replace(raiz, '')}: «${m[0]}»`);
    }
    expect(malos).toEqual([]);
  });
  it('no hay servidor de salas, ni envoltura de escritorio, ni estilos heredados', () => {
    const src = readdirSync(join(raiz, 'src'));
    expect(src.sort()).toEqual(['client', 'rules', 'shared']);
    expect(readdirSync(join(raiz, 'src', 'client', 'estilos')).sort()).toEqual(['base.css', 'mesa.css', 'pantallas.css']);
  });
  it('la interfaz no pinta fondos beige ni bordes lisos de HTML', () => {
    for (const f of readdirSync(join(raiz, 'src', 'client', 'estilos'))) {
      const css = readFileSync(join(raiz, 'src', 'client', 'estilos', f), 'utf8');
      expect(css, f).not.toMatch(/#eae2d0/i);
      expect(css, f).not.toMatch(/border:\s*\d+px\s+solid\s+#000/i);
      expect(css, f).not.toMatch(/Arial/i);
    }
  });
});
