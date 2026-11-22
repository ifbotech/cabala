// La música de la 0.28 se escribe sola a partir de la teoría: estas pruebas cuidan que la partitura esté bien escrita
// (todo en la escala y el acorde del compás, el bombo en 3-3-2), que cada personaje cante dentro de su tesitura y de
// la armonía, que la puntuación mande en la melodía y que todo sea determinista con semilla.
import { describe, expect, it } from 'vitest';
import * as T from '../src/client/musica/teoria';
import { VOZ, GRITO } from '../src/client/voces';

const ESCENAS: T.EscenaId[] = ['portada', 'mapa', 'mesa', 'rey', 'pulperia', 'fogon', 'cabala', 'derrota', 'victoria'];
const REYES: T.PaloRey[] = ['S', 'C', 'D', 'H'];
const VOCES = Object.keys(T.VOCES) as T.VozId[];
const SEMILLA = 2028;
/** Todos los estados que el juego puede pedir. */
const estados = (): T.EstadoMusical[] => {
  const out: T.EstadoMusical[] = [];
  for (const escena of ESCENAS)
    for (const nivel of [1, 2, 3] as const)
      for (const vidaBaja of [false, true])
        for (const rey of [null, ...REYES]) for (const segunda of [false, true]) out.push({ escena, nivel, vidaBaja, rey, segunda });
  return out;
};
const acordeBase = (paso: number): T.Acorde => T.acordeDe('base', Math.floor(paso / T.PASOS));

describe('armonía: un reloj, una tonalidad', () => {
  it('el tempo es uno solo y el compás tiene 16 semicorcheas', () => {
    expect(T.BPM).toBe(104);
    expect(T.PASOS).toBe(16);
    expect(T.SEG_COMPAS).toBeCloseTo(240 / 104, 6);
  });

  it('todas las secciones tienen 8 compases y pasan por la tónica de Re', () => {
    for (const [id, grados] of Object.entries(T.SECCIONES)) {
      expect(grados.length, id).toBe(T.FRASE);
      expect(grados.includes('i') || grados.includes('I'), id).toBe(true);
    }
    expect(T.acordeDe('base', 0).nombre).toBe('Rem9');
    expect(T.acordeDe('base', 2).nombre).toBe('La7(b9)');
    expect(T.acordeDe('base', 8).nombre).toBe('Rem9');
  });

  it('los tonos de cada acorde están en la escala de su compás, en Re menor y en Mi menor', () => {
    for (const tonica of [T.TONICA, T.TONICA_SEGUNDA])
      for (const g of Object.keys(T.MOLDES) as T.Grado[]) {
        const a = T.acordeDeGrado(g, tonica);
        expect(a.tonos.length, g).toBe(5);
        expect(a.escala.length, g).toBe(7);
        for (const t of a.tonos) expect(a.escala.includes(t), `${a.nombre}: ${t}`).toBe(true);
      }
  });

  it('la segunda cara del Rey sube un tono (Mi menor); todo lo demás suena en Re menor', () => {
    expect(T.acordeDelEstado({ ...T.ESTADO_INICIAL, escena: 'rey', segunda: true }, 0).raiz).toBe(4);
    expect(T.acordeDelEstado({ ...T.ESTADO_INICIAL, escena: 'rey' }, 0).raiz).toBe(2);
    expect(T.acordeDelEstado({ ...T.ESTADO_INICIAL, escena: 'mesa', segunda: true }, 0).raiz).toBe(2);
  });

  it('cuantizar lleva cualquier altura a una nota del acorde (o de la escala) dentro del registro', () => {
    const a = T.acordeDe('base', 2);
    for (let m = 40; m < 90; m += 0.7) {
      const q = T.cuantizar(m, a, 50, 72);
      expect(T.enAcorde(q, a)).toBe(true);
      expect(q).toBeGreaterThanOrEqual(50);
      expect(q).toBeLessThanOrEqual(72);
      expect(T.enEscala(T.cuantizar(m, a, 50, 72, 'escala'), a)).toBe(true);
    }
  });
});

describe('la partitura', () => {
  it('el bombo es 3-3-2 (semicorcheas 0, 6 y 12) en todos los compases sin fill', () => {
    expect(T.BOMBO).toBe('x.....x.....x...');
    for (const nivel of [1, 2, 3] as const)
      for (let c = 0; c < 16; c++) {
        if (c % T.FRASE === T.FRASE - 1) continue;
        expect(T.bateria(c, nivel, SEMILLA).bombo.map((g) => g.paso), `nivel ${nivel}, compás ${c}`).toEqual([0, 6, 12]);
      }
    // la batería lejana del Mapa reparte el 3-3-2 entre el bombo y la madera
    const lejos = T.bateria(0, 0, SEMILLA);
    expect([...lejos.bombo, ...lejos.madera].map((g) => g.paso).sort((a, b) => a - b)).toEqual([0, 6, 12]);
  });

  it('el último compás de cada frase de 8 lleva fill (y ningún otro)', () => {
    for (let c = 0; c < 16; c++) {
      const b = T.bateria(c, 2, SEMILLA);
      const esFill = c % T.FRASE === T.FRASE - 1;
      expect(b.madera.some((g) => g.tipo === 'tom'), `compás ${c}`).toBe(esFill);
      if (esFill) expect(b.madera.filter((g) => g.paso >= 8).length).toBeGreaterThanOrEqual(4);
    }
  });

  it('toda nota de toda capa, en todo estado, cae en el acorde o en la escala del compás', () => {
    let notas = 0;
    for (const e of estados())
      for (let c = 0; c < 24; c++) {
        const p = T.partitura(e, c, SEMILLA);
        for (const [capa, lista] of Object.entries(p.notas))
          for (const n of lista ?? []) {
            notas++;
            if (!T.enEscala(n.midi, p.acorde)) throw new Error(`${e.escena} c${c} ${capa}: ${T.nombreNota(n.midi)} fuera de la escala de ${p.acorde.nombre}`);
            if (n.paso < 0 || n.paso >= T.PASOS || !(n.vel > 0)) throw new Error(`${e.escena} c${c} ${capa}: nota mal escrita`);
            // bajo, guitarra, rasgueo, pad, cuerdas y motivo solo tocan notas del acorde (el bandoneón y la nota
            // fantasma del bajo pasan por la escala)
            if (capa !== 'bandoneon' && !(capa === 'bajo' && n.paso === 15) && !T.enAcorde(n.midi, p.acorde)) throw new Error(`${e.escena} c${c} ${capa}: ${T.nombreNota(n.midi)} fuera de ${p.acorde.nombre}`);
          }
      }
    expect(notas).toBeGreaterThan(10000);
  });

  it('el bajo y los acentos de la guitarra dibujan el 3-3-2', () => {
    const p = T.partitura({ ...T.ESTADO_INICIAL, escena: 'mesa' }, 0, SEMILLA);
    expect(p.notas.bajo!.map((n) => n.paso)).toEqual([0, 6, 12]);
    const acentos = p.notas.guitarra!.filter((n) => n.vel >= 0.8).map((n) => n.paso);
    expect(acentos).toEqual([0, 6, 12]);
  });

  it('cada escena tiene las capas que se pidieron', () => {
    const capas = (e: Partial<T.EstadoMusical>): string[] => Object.keys(T.mezclaDe({ ...T.ESTADO_INICIAL, ...e }).capas).sort();
    expect(capas({ escena: 'portada' })).toEqual(['bajo', 'guitarra', 'pad']);
    expect(capas({ escena: 'mapa' })).toEqual(['bajo', 'bombo', 'cuerdas', 'madera', 'pad']);
    expect(capas({ escena: 'fogon' })).toContain('brasas');
    expect(capas({ escena: 'pulperia' })).toContain('rasgueo');
    expect(capas({ escena: 'mesa', nivel: 1 })).toEqual(['bajo', 'bombo', 'guitarra', 'madera']);
    expect(capas({ escena: 'mesa', nivel: 2 })).toEqual(expect.arrayContaining(['bandoneon', 'cuerdas', 'escobillas']));
    expect(capas({ escena: 'mesa', nivel: 1, vidaBaja: true })).toContain('latido');
    expect(capas({ escena: 'rey', rey: 'S' })).toContain('motivo');
    // el filtro se abre con el tramo, se cierra en la taberna y más con la poca Vida
    const corte = (e: Partial<T.EstadoMusical>): number => T.mezclaDe({ ...T.ESTADO_INICIAL, ...e }).corte;
    expect(corte({ escena: 'mesa', nivel: 1 })).toBeLessThan(corte({ escena: 'mesa', nivel: 2 }));
    expect(corte({ escena: 'mesa', nivel: 2 })).toBeLessThan(corte({ escena: 'mesa', nivel: 3 }));
    expect(corte({ escena: 'pulperia' })).toBeLessThan(corte({ escena: 'portada' }));
    expect(corte({ escena: 'mesa', nivel: 3, vidaBaja: true })).toBeLessThan(1000);
  });

  it('el nivel sale del tramo, la racha y la Furia', () => {
    expect(T.nivelDe({ tramo: 0 })).toBe(1);
    expect(T.nivelDe({ tramo: 1 })).toBe(2);
    expect(T.nivelDe({ tramo: 2 })).toBe(3);
    expect(T.nivelDe({ tramo: 0, racha: 2 })).toBe(3);
    expect(T.nivelDe({ tramo: 0, furia: T.FURIA_ALTA })).toBe(3);
    expect(T.nivelDe({ tramo: 0, furia: T.FURIA_ALTA / 2 })).toBe(2);
  });

  it('las micro-variaciones solo caen al cerrar grupos de 4 y de 8 compases, y aparecen de verdad', () => {
    let adornos = 0;
    let respiros = 0;
    let fantasmas = 0;
    for (let c = 0; c < 400; c++) {
      const v = T.varianteDe(c, SEMILLA);
      if (v.adorno || v.fantasma) expect(c % 4).toBe(3);
      if (v.respiro) expect(c % 8).toBe(7);
      adornos += +v.adorno;
      respiros += +v.respiro;
      fantasmas += +v.fantasma;
    }
    expect(adornos).toBeGreaterThan(20);
    expect(fantasmas).toBeGreaterThan(15);
    expect(respiros).toBeGreaterThan(8);
  });

  it('la humanización se queda en ±8 ms y ±12 % de fuerza', () => {
    for (let k = 0; k < 500; k++) {
      const h = T.humanizar(SEMILLA, k, k % 16, k % 7);
      expect(Math.abs(h.dt)).toBeLessThanOrEqual(0.008);
      expect(h.vel).toBeGreaterThanOrEqual(0.92);
      expect(h.vel).toBeLessThanOrEqual(1.06);
      expect(Math.abs(T.humanizar(SEMILLA, k, 0, 1, true).dt)).toBeLessThanOrEqual(0.004);
    }
  });

  it('es determinista: misma semilla, misma partitura; otra semilla, otra', () => {
    const e: T.EstadoMusical = { escena: 'mesa', nivel: 3, vidaBaja: false, rey: null, segunda: false };
    for (let c = 0; c < 16; c++) expect(T.partitura(e, c, SEMILLA)).toEqual(T.partitura(e, c, SEMILLA));
    const a = JSON.stringify(Array.from({ length: 16 }, (_, c) => T.partitura(e, c, 1).notas.bandoneon));
    const b = JSON.stringify(Array.from({ length: 16 }, (_, c) => T.partitura(e, c, 2).notas.bandoneon));
    expect(a).not.toBe(b);
  });
});

describe('los motivos de los Reyes y los stingers', () => {
  it('cada Rey tiene su motivo, distinto de los otros, y siempre con notas del acorde', () => {
    const firmas = new Set<string>();
    for (const rey of REYES) {
      for (const segunda of [false, true])
        for (let c = 0; c < 8; c++) {
          const a = T.acordeDe('rey', c, segunda ? T.TONICA_SEGUNDA : T.TONICA);
          const notas = T.motivoRey(rey, a, c, segunda);
          expect(notas.length).toBeGreaterThanOrEqual(3);
          for (const n of notas) expect(T.enAcorde(n.midi, a), `${rey} c${c}: ${T.nombreNota(n.midi)} sobre ${a.nombre}`).toBe(true);
        }
      firmas.add(JSON.stringify(T.MOTIVOS[rey].celula));
    }
    expect(firmas.size).toBe(4);
    // Bastos canta más grave que Espadas y Copas; Oros, el más agudo
    expect(T.MOTIVOS.C.piso).toBeLessThan(T.MOTIVOS.S.piso);
    expect(T.MOTIVOS.D.piso).toBeGreaterThan(T.MOTIVOS.H.piso);
  });

  it('todo stinger se afina al acorde del momento, sea cual sea', () => {
    for (const id of Object.keys(T.STINGERS) as T.StingerId[])
      for (const seccion of Object.keys(T.SECCIONES) as T.SeccionId[])
        for (let c = 0; c < 8; c++) {
          const a = T.acordeDe(seccion, c);
          for (const n of T.notasStinger(id, a)) expect(T.enAcorde(n.midi, a), `${id} sobre ${a.nombre}`).toBe(true);
        }
  });
});

describe('el silabeo', () => {
  const sil = (s: string, idioma: T.Idioma = 'es'): string[] => T.silabear(s, idioma).map((x) => x.texto.toLowerCase());
  const voc = (s: string, idioma: T.Idioma = 'es'): string => T.silabear(s, idioma).map((x) => x.vocal).join('');

  it('parte el español en sílabas con su vocal dominante', () => {
    expect(sil('escoba')).toEqual(['es', 'co', 'ba']);
    expect(sil('pulpería')).toEqual(['pul', 'pe', 'rí', 'a']);
    expect(sil('cuestión')).toEqual(['cues', 'tión']);
    expect(voc('cuestión')).toBe('eo');
    expect(sil('chinchón')).toEqual(['chin', 'chón']);
    expect(voc('que guiso')).toBe('eio');
    expect(voc('muy')).toBe('i');
    expect(voc('La casa siempre pierde')).toBe('aaaeeee');
    expect(sil('trago')).toEqual(['tra', 'go']);
  });

  it('parte el inglés por grupos de vocales, sin la «e» muda', () => {
    expect(sil('house', 'en').length).toBe(1);
    expect(sil('table', 'en').length).toBe(2);
    expect(sil('always', 'en').length).toBe(2);
    expect(sil('called', 'en').length).toBe(1);
    expect(sil('The house always loses', 'en').length).toBe(6);
    expect(voc('sweep', 'en')).toBe('i');
  });

  it('la puntuación queda en la última sílaba de su frase', () => {
    const s = T.silabear('¿Una manito? La casa pierde… dicen.');
    expect(s.filter((x) => x.cierre).map((x) => x.cierre)).toEqual(['?', '…', '.']);
    expect(T.silabear('¡Tomá mate!').at(-1)!.cierre).toBe('!');
    expect(T.silabear('Wait... what?!', 'en').map((x) => x.cierre)).toEqual(['…', '?']);
  });
});

describe('las voces cantan', () => {
  /** Todas las frases del juego que alguien puede decir, en los dos idiomas. */
  const frases = (): { es: string; en: string }[] => {
    const out: { es: string; en: string }[] = [];
    const junta = (x: unknown): void => {
      if (!x || typeof x !== 'object') return;
      const o = x as Record<string, unknown>;
      if (typeof o.es === 'string' && typeof o.en === 'string') out.push(o as { es: string; en: string });
      else for (const v of Object.values(o)) junta(v);
    };
    junta(VOZ);
    junta(GRITO);
    return out;
  };

  it('hay frases de sobra para probar', () => {
    expect(frases().length).toBeGreaterThan(80);
  });

  it('cada sílaba de cada frase, en cada voz e idioma, canta una nota del acorde de su compás y dentro de su tesitura', () => {
    let notas = 0;
    const GRADOS = ['1', '3', '5', '7', '9', 'b9', 'b5', '6', '11'];
    for (const quien of VOCES) {
      const v = T.VOCES[quien];
      for (const [k, f] of frases().entries())
        for (const idioma of ['es', 'en'] as const)
          for (const seccion of ['base', 'rey'] as const) {
            // la frase arranca en cualquier punto del compás: los acordes cambian debajo
            const desde = (k * 5) % 128;
            const acordeEn = (paso: number): T.Acorde => T.acordeDe(seccion, Math.floor((desde + paso) / T.PASOS), seccion === 'rey' && k % 2 ? T.TONICA_SEGUNDA : T.TONICA);
            const cantada = T.fraseCantada(quien, f[idioma], acordeEn, { idioma, semilla: k });
            if (!cantada.length || cantada.length > v.tope) throw new Error(`${quien} «${f[idioma]}»: ${cantada.length} notas`);
            for (const n of cantada) {
              notas++;
              const a = acordeEn(n.paso);
              for (const m of [n.midi, ...n.adornos]) {
                if (!T.enAcorde(m, a)) throw new Error(`${quien} «${f[idioma]}» ${n.silaba}: ${T.nombreNota(m)} fuera de ${a.nombre}`);
                if (m < v.grave || m > v.agudo) throw new Error(`${quien} «${f[idioma]}» ${n.silaba}: ${T.nombreNota(m)} fuera de la tesitura`);
              }
              if (!GRADOS.includes(n.grado)) throw new Error(`${quien}: grado «${n.grado}»`);
            }
          }
    }
    expect(notas).toBeGreaterThan(20000);
  });

  it('«?» sube: la pregunta termina por encima de donde empezó y de la nota anterior', () => {
    for (const quien of VOCES)
      for (const texto of ['¿Una manito?', '¿Te animás a otra pasada?', '¿La dejás pasar?', '¿Y ahora?'])
        for (let desde = 0; desde < 128; desde += 7) {
          const c = T.fraseCantada(quien, texto, (p) => acordeBase(desde + p), { semilla: desde });
          const ult = c.at(-1)!;
          expect(ult.regla).toBe('sube');
          expect(ult.midi, `${quien} «${texto}» desde ${desde}`).toBeGreaterThan(c[0].midi);
          expect(ult.midi, `${quien} «${texto}» desde ${desde}`).toBeGreaterThan(c.at(-2)!.midi);
        }
  });

  it('«!» resuelve en la tónica o la quinta; «…» queda suspendida en la séptima o la novena', () => {
    for (const quien of VOCES)
      for (let desde = 0; desde < 128; desde += 5) {
        const fuerte = T.fraseCantada(quien, '¡Tomá mate!', (p) => acordeBase(desde + p), { semilla: desde }).at(-1)!;
        expect(['1', '5', 'b5'], `${quien} desde ${desde}: ${fuerte.grado}`).toContain(fuerte.grado);
        const susp = T.fraseCantada(quien, 'La casa pierde…', (p) => acordeBase(desde + p), { semilla: desde }).at(-1)!;
        expect(['7', '9', 'b9', '6', '11']).toContain(susp.grado);
        // y la suspensión se sostiene más que una sílaba cualquiera
        expect(susp.dur).toBeGreaterThan(T.VOCES[quien].paso + 2);
      }
  });

  it('las tesituras son las de cada cuerda: Bastos abajo de todo, la Barrendera arriba', () => {
    const v = T.VOCES;
    expect(v.C.grave).toBeLessThan(v.S.grave);
    expect(v.S.grave).toBeLessThan(v.D.grave);
    expect(v.D.agudo).toBeLessThan(v.H.agudo);
    expect(v.bufon.grave).toBe(50);
    expect(v.bufon.agudo).toBe(69);
    for (const q of VOCES) {
      expect(v[q].agudo - v[q].grave, q).toBeGreaterThanOrEqual(17);
      expect(v[q].agudo - v[q].grave, q).toBeLessThanOrEqual(21);
      // vibrato de 5 a 6 Hz
      expect(v[q].vibrato[0]).toBeGreaterThanOrEqual(5);
      expect(v[q].vibrato[0]).toBeLessThanOrEqual(6);
    }
    expect(Math.min(...VOCES.map((q) => v[q].grave))).toBe(v.C.grave);
    expect(Math.max(...VOCES.map((q) => v[q].agudo))).toBe(v.escoba.agudo);
  });

  it('cada cuerda tiene su manera: el Bufón trina, Copas hace melismas, los Personajes son breves', () => {
    const bufon = T.fraseCantada('bufon', '¡Justito! Ni un poroto de más.', acordeBase);
    expect(bufon.some((n) => n.adorno === 'trino' && n.adornos.length === 1 && n.adornos[0] !== n.midi)).toBe(true);
    const copas = T.fraseCantada('H', 'Brindemos por tu caída.', acordeBase);
    expect(copas.some((n) => n.adorno === 'melisma' && n.adornos.length === 2)).toBe(true);
    for (const q of ['escoba', 'truco', 'chinchon', 'mentiroso', 'chancho'] as const) expect(T.fraseCantada(q, '¡Quince justo y barro la mesa entera!', acordeBase).length).toBeLessThanOrEqual(4);
    // Oros arpegia: sus primeras notas suben
    const oros = T.fraseCantada('D', 'Todo tiene su precio compadre', acordeBase);
    expect(oros[1].midi).toBeGreaterThan(oros[0].midi);
    expect(oros[2].midi).toBeGreaterThan(oros[1].midi);
  });

  it('cantar es determinista con semilla', () => {
    for (const quien of VOCES) {
      const a = T.fraseCantada(quien, '¿Una manito? La casa siempre pierde… dicen.', acordeBase, { semilla: 7 });
      const b = T.fraseCantada(quien, '¿Una manito? La casa siempre pierde… dicen.', acordeBase, { semilla: 7 });
      expect(a).toEqual(b);
    }
  });
});
