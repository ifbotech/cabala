// La música se escribe sola a partir de la teoría: estas pruebas cuidan que la partitura esté bien escrita (todo en
// la escala y el acorde del compás, el bombo en 3-3-2), que cada personaje cante dentro de su tesitura y de la
// armonía, que la puntuación mande en la melodía y que todo sea determinista con semilla. (0.29) Y además: la forma
// AABA / ABAC de cada escena, el tema escrito del bandoneón, los stingers de premio que resuelven siempre, el dibujo
// de los motivos de los Reyes, las consonantes de cada sílaba, el nivel parejo por vocal y el fraseo del Bufón.
import { describe, expect, it } from 'vitest';
import * as T from '../src/client/musica/teoria';
import { VOZ, GRITO } from '../src/client/voces';

const ESCENAS: T.EscenaId[] = ['portada', 'coleccion', 'mapa', 'mesa', 'rey', 'pulperia', 'fogon', 'cabala', 'derrota', 'victoria'];
const SECCIONES = Object.keys(T.SECCIONES) as T.SeccionId[];
const REYES: T.PaloRey[] = ['S', 'C', 'D', 'H'];
const VOCES = Object.keys(T.VOCES) as T.VozId[];
const STINGERS = Object.keys(T.STINGERS) as T.StingerId[];
const VOCALES: T.Vocal[] = ['a', 'e', 'i', 'o', 'u'];
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
const dbs = (x: number): number => 20 * Math.log10(x);

describe('armonía: un reloj, una tonalidad', () => {
  it('el tempo es uno solo y el compás tiene 16 semicorcheas', () => {
    expect(T.BPM).toBe(104);
    expect(T.PASOS).toBe(16);
    expect(T.SEG_COMPAS).toBeCloseTo(240 / 104, 6);
  });

  it('todas las secciones tienen 8 compases y la forma de cada escena pasa por la tónica de Re', () => {
    for (const [id, grados] of Object.entries(T.SECCIONES)) expect(grados.length, id).toBe(T.FRASE);
    for (const e of ESCENAS) expect(T.FORMAS[e].some((s) => T.SECCIONES[s].includes('i') || T.SECCIONES[s].includes('I')), e).toBe(true);
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

describe('la forma (0.29): cada escena tarda más de un minuto en repetirse', () => {
  it('cada escena tiene cuatro secciones, AABA o ABAC, con una sección B de verdad', () => {
    for (const e of ESCENAS) {
      const letras = T.letrasForma(e);
      expect(['AABA', 'ABAC'], `${e}: ${letras}`).toContain(letras);
      expect(T.FORMAS[e][0], e).toBe(e === 'fogon' ? 'vuelta' : T.SECCION_DE[e]);
      // la B no es la A con otro nombre: cambia al menos la mitad de los acordes
      const a = T.SECCIONES[T.FORMAS[e][0]];
      for (const s of new Set(T.FORMAS[e].slice(1))) if (s !== T.FORMAS[e][0]) expect(T.SECCIONES[s].filter((g, k) => g !== a[k]).length, `${e}: ${s}`).toBeGreaterThanOrEqual(4);
    }
    // las seis pantallas que compartían los mismos 8 compases ya no comparten la forma
    expect(new Set(['portada', 'coleccion', 'mapa', 'mesa', 'pulperia', 'fogon'].map((e) => T.FORMAS[e as T.EscenaId].join())).size).toBeGreaterThanOrEqual(4);
  });

  it('la armonía de ninguna escena se repite antes de 60 segundos', () => {
    expect(T.SEG_FORMA).toBeGreaterThan(60);
    for (const e of ESCENAS) {
      const firma = (c: number): string => `${T.acordeDelEstado({ ...T.ESTADO_INICIAL, escena: e }, c).nombre}`;
      let periodo = 0;
      for (let p = 1; p <= 64 && !periodo; p++) {
        let igual = true;
        for (let c = 0; c < 96 && igual; c++) igual = firma(c) === firma(c + p);
        if (igual) periodo = p;
      }
      expect(periodo * T.SEG_COMPAS, `${e}: se repite cada ${periodo} compases`).toBeGreaterThanOrEqual(60);
    }
  });

  it('el arreglo cambia con el lugar de la forma y con la vuelta', () => {
    const firma = (c: number): string => JSON.stringify(T.arregloDe('mesa', c));
    expect(firma(0)).not.toBe(firma(8));
    expect(firma(8)).not.toBe(firma(24));
    // la segunda vuelta no es igual a la primera
    expect(JSON.stringify({ ...T.arregloDe('mesa', 0), vuelta: 0 })).not.toBe(JSON.stringify({ ...T.arregloDe('mesa', 32), vuelta: 0 }));
    expect(T.arregloDe('mesa', 32).tema).toBe('respuesta');
    // la sección B usa el otro dibujo de la guitarra
    expect(T.arregloDe('mesa', 16).patron).toBe(1);
    expect(T.arregloDe('mesa', 0).patron).toBe(0);
    const e: T.EstadoMusical = { ...T.ESTADO_INICIAL, escena: 'mesa' };
    const pasos = (c: number): string => T.partitura(e, c, SEMILLA).notas.guitarra!.map((n) => n.paso).join();
    expect(pasos(16)).not.toBe(pasos(0));
  });

  it('cambiar de escena no mueve el reloj: el lugar en la forma sale solo del compás', () => {
    for (const e of ESCENAS)
      for (let c = 0; c < 70; c++) {
        const l = T.lugarEnForma(e, c);
        expect(l.pos).toBe(Math.floor(c / 8) % 4);
        expect(l.k).toBe(c % 8);
        expect(l.seccion).toBe(T.FORMAS[e][l.pos]);
      }
  });
});

describe('el tema de CÁBALA (0.29)', () => {
  const ESCRITOS = ['base', 'puente', 'vuelta'] as const;

  it('está escrito a mano para A, B y C: ocho compases, dentro del registro del bandoneón', () => {
    for (const s of ESCRITOS) {
      const t = T.temaDe(s);
      expect(t.length).toBe(8);
      const midis = t.flat().map((n) => n.midi);
      expect(Math.min(...midis), s).toBeGreaterThanOrEqual(62);
      expect(Math.max(...midis), s).toBeLessThanOrEqual(81);
      expect(midis.length, s).toBeGreaterThanOrEqual(24);
    }
  });

  it('cada compás arranca en una nota de su acorde y todo lo demás pasa por la escala del compás', () => {
    for (const s of SECCIONES)
      for (const tonica of [T.TONICA, T.TONICA_SEGUNDA])
        T.temaDe(s, tonica).forEach((notas, k) => {
          const a = T.acordeDe(s, k, tonica);
          expect(T.enAcorde(notas[0].midi, a), `${s} c${k + 1}: ${T.nombreNota(notas[0].midi)} sobre ${a.nombre}`).toBe(true);
          for (const n of notas) {
            expect(T.enEscala(n.midi, a), `${s} c${k + 1}: ${T.nombreNota(n.midi)} sobre ${a.nombre}`).toBe(true);
            expect(n.paso + n.dur).toBeLessThanOrEqual(T.PASOS);
          }
          // las notas no se pisan
          notas.slice(1).forEach((n, i) => expect(n.paso).toBeGreaterThanOrEqual(notas[i].paso + notas[i].dur));
        });
  });

  it('se puede tararear: una célula rítmica que vuelve, saltos de a lo sumo una sexta y nunca tres veces la misma nota', () => {
    const a = T.temaDe('base');
    const ritmo = (c: T.Nota[]): string => c.map((n) => n.paso).join();
    // la célula 3 + 3 + 4 + 2 + 4 abre la pregunta y la respuesta
    expect(a.filter((c) => ritmo(c) === T.RITMO_TEMA.join()).length).toBeGreaterThanOrEqual(4);
    expect(ritmo(a[0])).toBe(ritmo(a[4]));
    expect(ritmo(a[1])).toBe(ritmo(a[5]));
    for (const s of ESCRITOS) {
      const m = T.temaDe(s).flat().map((n) => n.midi);
      for (let k = 1; k < m.length; k++) expect(Math.abs(m[k] - m[k - 1]), `${s}: ${T.nombreNota(m[k - 1])} → ${T.nombreNota(m[k])}`).toBeLessThanOrEqual(9);
      for (let k = 2; k < m.length; k++) expect(m[k] === m[k - 1] && m[k] === m[k - 2], `${s}: ${T.nombreNota(m[k])} tres veces`).toBe(false);
    }
  });

  it('pregunta y respuesta: la pregunta se posa en la quinta de la tónica y la respuesta se abre en la dominante', () => {
    const a = T.temaDe('base');
    expect(a[3].at(-1)!.midi % 12).toBe(9);
    expect(T.acordeDe('base', 7).nombre).toBe('La7(b9)');
    expect(T.acordeDe('base', 7).tonos.slice(0, 3).map((x) => x % 12)).toContain(a[7].at(-1)!.midi % 12);
    // el eco: el segundo compás repite el dibujo del primero un tono abajo
    expect(T.dibujo(a[1].map((n) => n.midi))).toEqual(T.dibujo(a[0].map((n) => n.midi)));
    expect(a[1][0].midi).toBe(a[0][0].midi - 2);
  });

  it('las demás secciones lo citan: el mismo ritmo y el mismo dibujo, sobre sus acordes', () => {
    const base = T.temaDe('base');
    const dibBase = T.dibujo(base.flat().map((n) => n.midi));
    for (const s of SECCIONES.filter((x) => !(ESCRITOS as readonly string[]).includes(x)))
      for (const tonica of [T.TONICA, T.TONICA_SEGUNDA]) {
        const t = T.temaDe(s, tonica);
        expect(t.map((c) => c.map((n) => `${n.paso}:${n.dur}`).join())).toEqual(base.map((c) => c.map((n) => `${n.paso}:${n.dur}`).join()));
        const dib = T.dibujo(t.flat().map((n) => n.midi));
        const iguales = dib.filter((d, k) => d === dibBase[k]).length;
        // (alguna nota repetida del tema puede no existir en el acorde nuevo: se tolera un 10 %)
        expect(iguales / dib.length, `${s}: ${iguales} de ${dib.length}`).toBeGreaterThanOrEqual(0.9);
      }
  });

  it('el bandoneón toca el tema (no un paseo sorteado): no depende de la semilla', () => {
    const e: T.EstadoMusical = { escena: 'mesa', nivel: 2, vidaBaja: false, rey: null, segunda: false };
    for (let c = 0; c < 64; c++) {
      expect(T.partitura(e, c, 1).notas.bandoneon).toEqual(T.partitura(e, c, 99).notas.bandoneon);
      expect(T.partitura(e, c, 1).notas.bandoneon).toEqual(T.temaEnCompas('mesa', c));
    }
    // en el primer lugar de la forma suena tal cual está escrito
    expect(T.partitura(e, 0, 1).notas.bandoneon!.map((n) => n.midi)).toEqual([69, 74, 77, 76, 74]);
    // en las vueltas impares el bandoneón calla la pregunta y entra con la respuesta
    expect(T.temaEnCompas('mesa', 32)).toEqual([]);
    expect(T.temaEnCompas('mesa', 36).length).toBeGreaterThan(0);
    // el tema adornado tiene más notas que el tema, y todas en la escala
    const adornado = T.temaEnCompas('mesa', 8);
    expect(adornado.length).toBeGreaterThan(T.temaDe('base')[0].length);
    for (const n of adornado) expect(T.enEscala(n.midi, T.acordeDe('base', 0))).toBe(true);
  });

  it('donde no hay bandoneón, el tema lo canta la guitarra; y las cuerdas le contestan con su cabeza', () => {
    const e: T.EstadoMusical = { escena: 'mesa', nivel: 1, vidaBaja: false, rey: null, segunda: false };
    expect(T.partitura(e, 0, SEMILLA).notas.guitarra!.some((n) => n.tema)).toBe(false);
    const canta = T.partitura(e, 24, SEMILLA).notas.guitarra!.filter((n) => n.tema);
    expect(T.partitura(e, 8, SEMILLA).notas.guitarra!.some((n) => n.tema)).toBe(true);
    expect(canta.map((n) => n.midi).slice(0, 3)).toEqual([69, 74, 77]);
    // con bandoneón en la mezcla, la guitarra no lo dobla
    expect(T.partitura({ ...e, nivel: 2 }, 8, SEMILLA).notas.guitarra!.some((n) => n.tema)).toBe(false);
    // el contracanto: tres notas del acorde que suben, al cerrar la media frase
    const cu = T.partitura({ ...e, nivel: 2 }, 11, SEMILLA).notas.cuerdas!;
    expect(cu.length).toBe(4);
    expect(T.dibujo(cu.slice(1).map((n) => n.midi))).toEqual([1, 1]);
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

  it('toda nota de toda capa, en todo estado y en toda la forma, cae en el acorde o en la escala del compás', () => {
    let notas = 0;
    for (const e of estados())
      for (let c = 0; c < 64; c += e.vidaBaja || e.segunda ? 3 : 1) {
        const p = T.partitura(e, c, SEMILLA);
        for (const [capa, lista] of Object.entries(p.notas))
          for (const n of lista ?? []) {
            notas++;
            if (!T.enEscala(n.midi, p.acorde)) throw new Error(`${e.escena} c${c} ${capa}: ${T.nombreNota(n.midi)} fuera de la escala de ${p.acorde.nombre}`);
            if (n.paso < 0 || n.paso >= T.PASOS || !(n.vel > 0)) throw new Error(`${e.escena} c${c} ${capa}: nota mal escrita`);
            // bajo, guitarra, rasgueo, pad, cuerdas y motivo solo tocan notas del acorde (el tema, en el bandoneón o
            // en la guitarra, y la nota fantasma del bajo pasan por la escala)
            if (capa !== 'bandoneon' && !n.tema && !(capa === 'bajo' && n.paso === 15) && !T.enAcorde(n.midi, p.acorde)) throw new Error(`${e.escena} c${c} ${capa}: ${T.nombreNota(n.midi)} fuera de ${p.acorde.nombre}`);
          }
      }
    expect(notas).toBeGreaterThan(20000);
  });

  it('el bajo y los acentos de la guitarra dibujan el 3-3-2', () => {
    const p = T.partitura({ ...T.ESTADO_INICIAL, escena: 'mesa' }, 0, SEMILLA);
    expect(p.notas.bajo!.map((n) => n.paso)).toEqual([0, 6, 12]);
    const acentos = p.notas.guitarra!.filter((n) => n.vel >= 0.8).map((n) => n.paso);
    expect(acentos).toEqual([0, 6, 12]);
    // también con el otro dibujo del arpegio (la sección B)
    expect(T.partitura({ ...T.ESTADO_INICIAL, escena: 'mesa' }, 16, SEMILLA).notas.guitarra!.filter((n) => n.vel >= 0.8).map((n) => n.paso)).toEqual([0, 6, 12]);
  });

  it('cada escena tiene las capas que se pidieron', () => {
    const capas = (e: Partial<T.EstadoMusical>): string[] => Object.keys(T.mezclaDe({ ...T.ESTADO_INICIAL, ...e }).capas).sort();
    // (0.29) el bandoneón presenta el tema en la portada
    expect(capas({ escena: 'portada' })).toEqual(['bajo', 'bandoneon', 'guitarra', 'pad']);
    expect(capas({ escena: 'mapa' })).toEqual(['bajo', 'bandoneon', 'bombo', 'cuerdas', 'madera', 'pad']);
    expect(capas({ escena: 'fogon' })).toContain('brasas');
    expect(capas({ escena: 'pulperia' })).toContain('rasgueo');
    expect(capas({ escena: 'mesa', nivel: 1 })).toEqual(['bajo', 'bombo', 'escobillas', 'guitarra', 'madera']);
    // Colección, Crónica y Ajustes: la portada, más cerrada
    expect(capas({ escena: 'coleccion' })).toEqual(expect.arrayContaining(['bajo', 'guitarra', 'pad']));
    expect(T.mezclaDe({ ...T.ESTADO_INICIAL, escena: 'coleccion' }).corte).toBeLessThan(T.mezclaDe(T.ESTADO_INICIAL).corte);
    expect(capas({ escena: 'mesa', nivel: 2 })).toEqual(expect.arrayContaining(['bandoneon', 'cuerdas', 'escobillas']));
    expect(capas({ escena: 'mesa', nivel: 1, vidaBaja: true })).toContain('latido');
    expect(capas({ escena: 'rey', rey: 'S' })).toContain('motivo');
    // el filtro se abre con el tramo, se cierra en la Pulpería y más con la poca Vida
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

  it('la humanización se queda en ±8 ms y ±12 % de fuerza, y adelanta tanto como atrasa', () => {
    let antes = 0;
    let despues = 0;
    for (let k = 0; k < 500; k++) {
      const h = T.humanizar(SEMILLA, k, k % 16, k % 7);
      expect(Math.abs(h.dt)).toBeLessThanOrEqual(0.008);
      expect(h.vel).toBeGreaterThanOrEqual(0.92);
      expect(h.vel).toBeLessThanOrEqual(1.06);
      expect(Math.abs(T.humanizar(SEMILLA, k, 0, 1, true).dt)).toBeLessThanOrEqual(0.004);
      if (h.dt < 0) antes++;
      else despues++;
    }
    expect(antes).toBeGreaterThan(180);
    expect(despues).toBeGreaterThan(180);
  });

  it('es determinista: misma semilla, misma partitura; otra semilla, otras variaciones', () => {
    const e: T.EstadoMusical = { escena: 'mesa', nivel: 3, vidaBaja: false, rey: null, segunda: false };
    for (let c = 0; c < 16; c++) expect(T.partitura(e, c, SEMILLA)).toEqual(T.partitura(e, c, SEMILLA));
    const firma = (s: number): string => JSON.stringify(Array.from({ length: 64 }, (_, c) => [T.partitura(e, c, s).variante, T.partitura(e, c, s).golpes.madera]));
    expect(firma(1)).not.toBe(firma(2));
  });
});

describe('los motivos de los Reyes', () => {
  it('cada Rey tiene su motivo, distinto de los otros, y siempre con notas del acorde', () => {
    const firmas = new Set<string>();
    for (const rey of REYES) {
      for (const segunda of [false, true])
        for (const seccion of ['rey', 'reyB'] as const)
          for (let c = 0; c < 8; c++) {
            const a = T.acordeDe(seccion, c, segunda ? T.TONICA_SEGUNDA : T.TONICA);
            const notas = T.motivoRey(rey, a, c, segunda);
            expect(notas.length).toBeGreaterThanOrEqual(3);
            for (const n of notas) expect(T.enAcorde(n.midi, a), `${rey} c${c}: ${T.nombreNota(n.midi)} sobre ${a.nombre}`).toBe(true);
          }
      firmas.add(JSON.stringify(T.MOTIVOS[rey].celula));
    }
    expect(firmas.size).toBe(4);
    // Bastos canta más grave que Espadas y Copas; Oros, el más agudo
    expect(T.MOTIVOS.C.centro).toBeLessThan(T.MOTIVOS.S.centro);
    expect(T.MOTIVOS.D.centro).toBeGreaterThan(T.MOTIVOS.H.centro);
  });

  it('(0.29) el motivo conserva su dibujo al cambiar de acorde: lo que sube, sube; lo que baja, baja', () => {
    for (const rey of REYES)
      for (const compas of [0, 1]) {
        const ref = T.dibujo(T.motivoRey(rey, T.acordeDe('rey', 0), compas).map((n) => n.midi));
        // el dibujo de referencia es el de sus peldaños
        expect(ref).toEqual(T.dibujo(T.MOTIVOS[rey].celula[compas].map(([, , i]) => i)));
        for (const tonica of [T.TONICA, T.TONICA_SEGUNDA])
          for (const g of Object.keys(T.MOLDES) as T.Grado[]) {
            const a = T.acordeDeGrado(g, tonica);
            expect(T.dibujo(T.motivoRey(rey, a, compas).map((n) => n.midi)), `${rey} sobre ${a.nombre}`).toEqual(ref);
          }
      }
    // el salto de Espadas ya no es una oncena en un acorde y una cuarta en otro: siempre entre una cuarta y una sexta
    for (const g of ['i', 'V', 'VI', 'VII', 'iv'] as const) {
      const m = T.motivoRey('S', T.acordeDeGrado(g), 0).map((n) => n.midi);
      expect(m[2] - m[1], g).toBeGreaterThanOrEqual(4);
      expect(m[2] - m[1], g).toBeLessThanOrEqual(9);
    }
  });

  it('(0.29) cada Rey abre lo que dice citando la cabeza de su motivo', () => {
    for (const rey of REYES) {
      const cabeza = T.dibujo(T.cabezaMotivo(rey));
      for (const g of ['i', 'VII', 'VI', 'V', 'iv', 'ii'] as const)
        for (const tonica of [T.TONICA, T.TONICA_SEGUNDA]) {
          const a = T.acordeDeGrado(g, tonica);
          const c = T.fraseCantada(rey, 'Todo tiene su precio, compadre.', () => a);
          expect(c.slice(0, 3).every((n) => n.cita), rey).toBe(true);
          expect(T.dibujo(c.slice(0, 3).map((n) => n.midi)), `${rey} sobre ${a.nombre}`).toEqual(cabeza);
        }
    }
    // el Bufón y los Personajes no citan a nadie
    expect(T.fraseCantada('bufon', 'Todo tiene su precio, compadre.', acordeBase).some((n) => n.cita)).toBe(false);
  });
});

describe('los stingers (0.29): un premio resuelve siempre', () => {
  /** Las notas de un stinger con el bajo que suena debajo de cada una mientras dura (con su cola). */
  const conBajos = (id: T.StingerId, a: T.Acorde, sig: T.Acorde, paso: number): { midi: number; bajos: number[]; papel?: string }[] =>
    T.notasStinger(id, a, sig, paso).map((n, k) => {
      const ini = paso + n.paso / 2;
      const fin = ini + (n.dur / 2) * T.COLA_STINGER;
      return { midi: n.midi, bajos: [...(ini < T.PASOS ? [a.raiz] : []), ...(fin > T.PASOS ? [sig.raiz] : [])], papel: T.STINGERS[id].notas[k][4] };
    });
  /** Todos los pares de acordes seguidos que el juego puede tocar: dentro de cada sección y de una sección a la siguiente de cada forma. */
  const pares = (): [T.Acorde, T.Acorde][] => {
    const out: [T.Acorde, T.Acorde][] = [];
    for (const tonica of [T.TONICA, T.TONICA_SEGUNDA])
      for (const e of ESCENAS)
        for (let c = 0; c < 32; c++) {
          const est: T.EstadoMusical = { ...T.ESTADO_INICIAL, escena: e, segunda: tonica === T.TONICA_SEGUNDA };
          if (tonica === T.TONICA_SEGUNDA && e !== 'rey') continue;
          out.push([T.acordeDelEstado(est, c), T.acordeDelEstado(est, c + 1)]);
        }
    // y el remate de la caída de un Rey: la dominante que cae en la tónica, menor o mayor
    for (const tonica of [T.TONICA, T.TONICA_SEGUNDA]) for (const i of ['i', 'I'] as const) out.push([T.acordeDeGrado('V', tonica), T.acordeDeGrado(i, tonica)]);
    return out;
  };

  it('hay diez, y todos menos la quema son premios', () => {
    expect(STINGERS.length).toBe(10);
    expect(STINGERS.filter((id) => !T.STINGERS[id].premio)).toEqual(['quema']);
  });

  it('ningún stinger tiene tritono ni novena menor contra el bajo, en ningún compás de ninguna sección, arranque donde arranque', () => {
    let notas = 0;
    for (const id of STINGERS)
      for (const [a, sig] of pares())
        for (let paso = 0; paso < T.PASOS; paso++)
          for (const n of conBajos(id, a, sig, paso)) {
            notas++;
            for (const b of n.bajos) {
              const d = (((n.midi - b) % 12) + 12) % 12;
              if (d === 6 || d === 1) throw new Error(`${id} en ${a.nombre} → ${sig.nombre}, semicorchea ${paso}: ${T.nombreNota(n.midi)} hace ${d === 6 ? 'tritono' : 'novena menor'} contra el bajo`);
            }
          }
    expect(notas).toBeGreaterThan(50000);
  });

  it('los casos del jurado: en Mim7(b5) el «exacto» ya no canta Sib, y en La7(b9) nadie toca el Sib ni sostiene la b9', () => {
    const ii = T.acordeDe('base', 6);
    const V = T.acordeDe('base', 7);
    const i = T.acordeDe('base', 0);
    expect(ii.nombre).toBe('Mim7(b5)');
    for (const id of STINGERS) {
      for (let paso = 0; paso < 16; paso++) {
        expect(T.notasStinger(id, ii, V, paso).some((n) => n.midi % 12 === 10 && paso + n.paso / 2 < 16), `${id} en iiø`).toBe(false);
        expect(T.notasStinger(id, V, i, paso).some((n) => n.midi % 12 === 10), `${id} en V7`).toBe(false);
      }
    }
    // «exacto» en el iiø: Mi – Re – Mi (tónica, séptima, octava): ni un tritono
    expect(T.notasStinger('exacto', ii, V, 0).slice(0, 3).map((n) => T.nombreNota(n.midi))).toEqual(['Mi4', 'Re5', 'Mi5']);
  });

  it('el remate lleva a la resolución: se posa en la nota que el acorde comparte con el que viene', () => {
    const V = T.acordeDe('base', 2);
    const i = T.acordeDe('base', 3);
    // sobre La7 → Rem, todo premio se posa en La: la tónica de la dominante, que ya es la quinta de Re menor
    for (const id of STINGERS) {
      const s = T.STINGERS[id];
      for (const paso of [0, 4, 8, 12, 15]) {
        const notas = T.notasStinger(id, V, i, paso);
        const k = s.notas.findIndex((n) => n[4] === 'remate');
        // (si el remate ya cae en el compás de Re menor, se posa en su tríada)
        if (paso + s.notas[k][0] / 2 < T.PASOS) expect(notas[k].midi % 12, `${id} desde ${paso}`).toBe(9);
        else expect(T.premio(i), `${id} desde ${paso}`).toContain(notas[k].midi % 12);
      }
    }
    // y siempre en una nota de la tríada de premio de alguno de los dos acordes
    for (const id of STINGERS)
      for (const [a, sig] of pares())
        for (const paso of [0, 7, 13]) {
          const k = T.STINGERS[id].notas.findIndex((n) => n[4] === 'remate');
          const m = T.notasStinger(id, a, sig, paso)[k].midi % 12;
          expect([...T.premio(a), ...T.premio(sig), ...T.estables(sig)], `${id} en ${a.nombre} → ${sig.nombre}`).toContain(m);
        }
  });

  it('sin cambio de acorde debajo, todo stinger se afina al acorde del momento', () => {
    for (const id of STINGERS)
      for (const seccion of SECCIONES)
        for (let c = 0; c < 8; c++) {
          const a = T.acordeDe(seccion, c);
          for (const n of T.notasStinger(id, a)) expect(T.enAcorde(n.midi, a), `${id} sobre ${a.nombre}`).toBe(true);
        }
  });

  it('la tríada de premio es tónica, tercera y quinta justa (en el iiø, la séptima en lugar de la quinta)', () => {
    for (const g of Object.keys(T.MOLDES) as T.Grado[]) {
      const a = T.acordeDeGrado(g);
      const p = T.premio(a).map((c) => (((c - a.raiz) % 12) + 12) % 12);
      expect(p[0]).toBe(0);
      expect([3, 4]).toContain(p[1]);
      expect(p[2], g).toBe(g === 'ii' ? 10 : 7);
      for (const c of T.premio(a)) expect(T.choca(c, a.raiz)).toBe(false);
    }
  });

  it('el conteo del golpe sube por la escala del compás y el total se posa en la tónica o la quinta', () => {
    for (const g of Object.keys(T.MOLDES) as T.Grado[]) {
      const a = T.acordeDeGrado(g);
      let previa = 0;
      for (let n = 0; n <= T.CONTEO_TOPE; n++) {
        const m = T.notaConteo(a, n);
        expect(T.enEscala(m, a)).toBe(true);
        expect(m).toBeGreaterThan(previa);
        previa = m;
      }
      // arriba de dos octavas ya no sube más
      expect(T.notaConteo(a, 40)).toBe(previa);
      expect(previa).toBeLessThanOrEqual(90);
      for (let n = 0; n < 24; n++) expect(T.choca(T.notaConteo(a, n, true), a.raiz)).toBe(false);
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

describe('las consonantes (0.29): la voz articula', () => {
  const tipos = (s: string, idioma: T.Idioma = 'es'): string => T.silabear(s, idioma).map((x) => `${x.consonante.tipo}/${x.consonante.lugar}`).join(' ');

  it('cada sílaba ataca con la consonante de su letra', () => {
    expect(tipos('Tomá mate')).toBe('oclusiva/dental nasal/labial nasal/labial oclusiva/dental');
    expect(tipos('casa cielo queso')).toBe('oclusiva/velar fricativa/sibilante fricativa/sibilante lateral/dental oclusiva/velar fricativa/sibilante');
    expect(tipos('chancho')).toBe('africada/palatal africada/palatal');
    expect(tipos('una hora')).toBe('ninguna/glotal nasal/dental ninguna/glotal vibrante/dental');
    expect(tipos('jugá gente gato')).toBe('fricativa/velar oclusiva/velar fricativa/velar oclusiva/dental oclusiva/velar oclusiva/dental');
    expect(tipos('filo palo')).toBe('fricativa/labial lateral/dental oclusiva/labial lateral/dental');
    // rioplatense: «ll» e «y» son fricativas («sh» sonora)
    expect(tipos('llave yo')).toBe('fricativa/palatal oclusiva/labial fricativa/palatal');
    expect(T.silabear('llave')[0].consonante.sonora).toBe(true);
  });

  it('la «r» simple vibra una vez; la «rr» y la que abre palabra, tres', () => {
    const g = (s: string): (number | undefined)[] => T.silabear(s).map((x) => x.consonante.golpes);
    expect(g('pero')).toEqual([undefined, 1]);
    expect(g('perro')).toEqual([undefined, 3]);
    expect(g('Rey')).toEqual([3]);
    expect(T.consonanteDe('ra', 'es', false).golpes).toBe(1);
  });

  it('en inglés: «th», «sh», «w» y la «r» aproximante; la «h» se aspira', () => {
    expect(tipos('the ship', 'en')).toBe('fricativa/dental fricativa/palatal');
    expect(tipos('wait right', 'en')).toBe('aproximante/labial aproximante/dental');
    expect(tipos('house', 'en')).toBe('fricativa/glotal');
    expect(tipos('always', 'en').startsWith('ninguna')).toBe(true);
  });

  it('el ataque de cada tipo: las oclusivas cierran y estallan; las fricativas soplan; las nasales murmuran', () => {
    const p = T.articular(T.consonanteDe('pa'));
    expect(p.cierre).toBeGreaterThan(0.015);
    expect(p.ruido!.dur).toBeLessThanOrEqual(0.02);
    expect(p.voz).toBe(0);
    expect(p.previa).toBeGreaterThanOrEqual(0.02);
    expect(p.previa).toBeLessThanOrEqual(0.045);
    // la sonora no calla del todo: murmura durante el cierre
    expect(T.articular(T.consonanteDe('ba')).voz).toBeGreaterThan(0);
    const s = T.articular(T.consonanteDe('sa'));
    expect(s.ruido!.filtro).toBe('highpass');
    // la «s» sopla por encima de la banda que cansa
    expect(s.ruido!.hz).toBeGreaterThanOrEqual(5000);
    expect(s.ruido!.dur).toBeGreaterThanOrEqual(0.045);
    expect(s.ruido!.dur).toBeLessThanOrEqual(0.07);
    const m = T.articular(T.consonanteDe('ma'));
    expect(m.ruido).toBeNull();
    expect(m.boca![0]).toBeLessThan(300);
    expect(m.voz).toBeGreaterThan(0.2);
    expect(T.articular(T.consonanteDe('rra')).golpes).toBe(3);
    expect(T.articular(T.SIN_CONSONANTE)).toEqual({ previa: 0, cierre: 0, ruido: null, voz: 1, boca: null, golpes: 0 });
    // los estallidos y soplos que no son la «s» quedan por debajo de 2,5 kHz
    for (const x of ['pa', 'ta', 'ka', 'fa', 'ja', 'cha', 'lla']) expect(T.articular(T.consonanteDe(x)).ruido!.hz, x).toBeLessThan(2500);
  });

  it('en las frases del juego, más de la mitad de las sílabas atacan con consonante, de al menos seis tipos', () => {
    const vistos = new Set<string>();
    let con = 0;
    let total = 0;
    for (const f of frases())
      for (const idioma of ['es', 'en'] as const)
        for (const s of T.silabear(f[idioma], idioma)) {
          total++;
          if (s.consonante.tipo !== 'ninguna') con++;
          vistos.add(s.consonante.tipo);
        }
    expect(con / total).toBeGreaterThan(0.5);
    expect(vistos.size).toBeGreaterThanOrEqual(7);
    // y el plan de canto las lleva hasta el cantor
    const plan = T.planCanto('bufon', '¡Tomá mate!');
    expect(plan.map((n) => n.consonante.tipo)).toEqual(['oclusiva', 'nasal', 'nasal', 'oclusiva']);
  });
});

describe('el nivel parejo por vocal (0.29)', () => {
  it('sin compensar, las vocales de una misma voz en una misma nota llegan a diferir más de 5 dB', () => {
    let peor = 0;
    for (const q of VOCES) {
      const v = T.VOCES[q];
      for (let m = v.grave; m <= v.agudo; m++) {
        const niveles = VOCALES.map((x) => dbs(T.nivelVocal(x, m, v.formante)));
        peor = Math.max(peor, Math.max(...niveles) - Math.min(...niveles));
      }
    }
    expect(peor).toBeGreaterThan(5);
  });

  it('con la compensación, toda vocal en toda nota de toda voz sale al nivel de su «a» central (±0,1 dB, salvo el tope)', () => {
    for (const q of VOCES) {
      const v = T.VOCES[q];
      const ref = dbs(T.nivelVocal('a', Math.round((v.grave + v.agudo) / 2), v.formante));
      for (const vocal of VOCALES)
        for (let m = v.grave; m <= v.agudo; m++) {
          const g = T.compensaVocal(v, vocal, m);
          expect(dbs(g)).toBeGreaterThanOrEqual(T.COMPENSA_TOPE[0] - 1e-6);
          expect(dbs(g)).toBeLessThanOrEqual(T.COMPENSA_TOPE[1] + 1e-6);
          const sale = dbs(T.nivelVocal(vocal, m, v.formante) * g);
          const topado = dbs(g) <= T.COMPENSA_TOPE[0] + 1e-6 || dbs(g) >= T.COMPENSA_TOPE[1] - 1e-6;
          if (!topado) expect(Math.abs(sale - ref), `${q} «${vocal}» en ${T.nombreNota(m)}`).toBeLessThan(0.1);
          // y aun con el tope, nunca queda a más de 3 dB
          expect(Math.abs(sale - ref), `${q} «${vocal}» en ${T.nombreNota(m)}`).toBeLessThan(3);
        }
    }
  });

  it('la fuente de la voz cae 9 dB por octava (más oscura que la de la 0.28)', () => {
    expect(T.FUENTE_VOZ.pendiente).toBeGreaterThanOrEqual(1.5);
    expect(T.TRACTO.gan.length).toBe(3);
  });
});

describe('las voces cantan', () => {
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
          for (const seccion of ['base', 'rey', 'puente'] as const) {
            // la frase arranca en cualquier punto del compás: los acordes cambian debajo
            const desde = (k * 5) % 128;
            const acordeEn = (paso: number): T.Acorde => T.acordeDe(seccion, Math.floor((desde + paso) / T.PASOS), seccion === 'rey' && k % 2 ? T.TONICA_SEGUNDA : T.TONICA);
            const cantada = T.fraseCantada(quien, f[idioma], acordeEn, { idioma, semilla: k });
            if (!cantada.length || cantada.length > v.tope) throw new Error(`${quien} «${f[idioma]}»: ${cantada.length} notas`);
            for (const n of cantada) {
              notas++;
              const a = acordeEn(n.paso);
              if (!T.enAcorde(n.midi, a)) throw new Error(`${quien} «${f[idioma]}» ${n.silaba}: ${T.nombreNota(n.midi)} fuera de ${a.nombre}`);
              for (const m of [n.midi, ...n.adornos]) {
                // el trino es el grado vecino de la escala; el melisma, notas del acorde
                if (!(n.adorno === 'trino' ? T.enEscala(m, a) : T.enAcorde(m, a))) throw new Error(`${quien} «${f[idioma]}» ${n.silaba}: adorno ${T.nombreNota(m)} fuera de ${a.nombre}`);
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

  it('(0.29) cada uno canta desde su lugar: el Bufón a un lado, los Reyes al otro, los Personajes al centro', () => {
    expect(T.VOCES.bufon.pan).toBeLessThan(-0.2);
    for (const r of REYES) expect(T.VOCES[r].pan).toBeGreaterThan(0.2);
    for (const q of ['escoba', 'truco', 'chinchon', 'mentiroso', 'chancho'] as const) expect(T.VOCES[q].pan).toBe(0);
  });

  it('cada cuerda tiene su manera: Copas hace melismas, los Personajes son breves, Oros arranca subiendo', () => {
    const copas = T.fraseCantada('H', 'Brindemos por tu caída.', acordeBase);
    expect(copas.some((n) => n.adorno === 'melisma' && n.adornos.length === 2)).toBe(true);
    for (const q of ['escoba', 'truco', 'chinchon', 'mentiroso', 'chancho'] as const) expect(T.fraseCantada(q, '¡Quince justo y barro la mesa entera!', acordeBase).length).toBeLessThanOrEqual(4);
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

describe('el Bufón canta, no parlotea (0.29)', () => {
  const todas = (): T.NotaCantada[][] => {
    const out: T.NotaCantada[][] = [];
    for (const [k, f] of frases().entries())
      for (const idioma of ['es', 'en'] as const)
        for (const desde of [0, 37, 90]) out.push(T.fraseCantada('bufon', f[idioma], (p) => T.acordeDelEstado({ ...T.ESTADO_INICIAL, escena: 'mesa' }, Math.floor((desde + k * 3 + p) / T.PASOS)), { idioma, semilla: k + desde }));
    return out;
  };

  it('a lo sumo ocho notas por frase y menos de cinco sílabas por segundo (eran 6,9)', () => {
    const v = T.VOCES.bufon;
    expect(v.tope).toBeLessThanOrEqual(8);
    let pasos = 0;
    let silabas = 0;
    for (const c of todas()) {
      expect(c.length).toBeLessThanOrEqual(8);
      // las sílabas que no cierran frase: larga–corta
      for (const n of c) {
        if (n.regla !== 'libre') continue;
        pasos += n.dur;
        silabas++;
      }
    }
    const porSegundo = silabas / (pasos * T.SEG_PASO);
    expect(porSegundo).toBeLessThan(5);
    expect(porSegundo).toBeGreaterThan(3.5);
  });

  it('salta a lo sumo una quinta (antes, octavas), salvo la pregunta que tiene que terminar arriba', () => {
    let saltos = 0;
    let grandes = 0;
    for (const c of todas())
      for (let k = 1; k < c.length; k++) {
        if (c[k].entra) continue;
        const d = Math.abs(c[k].midi - c[k - 1].midi);
        saltos++;
        if (d > T.SALTO_BUFFO) {
          grandes++;
          if (c[k].regla !== 'sube') throw new Error(`salto de ${d} semitonos en «${c.map((n) => n.silaba).join('')}» (${c[k].regla})`);
        }
      }
    expect(saltos).toBeGreaterThan(1500);
    expect(grandes / saltos).toBeLessThan(0.01);
  });

  it('el trino es un adorno: solo en la última nota de todo lo que dice, con la vecina de la escala (un tono o medio)', () => {
    let trinos = 0;
    for (const c of todas())
      c.forEach((n, k) => {
        if (n.adorno !== 'trino') return;
        trinos++;
        expect(k).toBe(c.length - 1);
        expect(n.adornos.length).toBe(1);
        expect(Math.abs(n.adornos[0] - n.midi)).toBeGreaterThanOrEqual(1);
        expect(Math.abs(n.adornos[0] - n.midi)).toBeLessThanOrEqual(2);
      });
    expect(trinos).toBeGreaterThan(10);
    // «¡Justito! Ni un poroto de más.» termina con punto: no trina (en la 0.28 trinaba en «to»)
    expect(T.fraseCantada('bufon', '¡Justito! Ni un poroto de más.', acordeBase).some((n) => n.adorno)).toBe(false);
    expect(T.fraseCantada('bufon', 'Ni un poroto de más. ¡Justito!', acordeBase).at(-1)!.adorno).toBe('trino');
  });
});
