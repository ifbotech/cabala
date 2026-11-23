// QA de audio (0.28): la medición para el juez que no oye. Renderiza fuera de línea, en Chromium sin cabecera, el
// mismo motor y el mismo bus maestro del juego (`src/client/musica/medir.ts`) y escribe `artifacts/jurado/audio/`:
// `medidas.json`, `RESUMEN.md` (niveles, forma, tema y partitura en texto) y, desde la 0.29, un WAV por escena, por voz
// y de la paleta de efectos entera, para que el dueño pueda ESCUCHAR (los artefactos no se commitean).
//
// (0.29) Medición honesta. Además de lo de siempre (recortes, notas cantadas fuera del acorde, brillo, sonoridad,
// respuesta en vivo), FALLA si:
//   · la paleta de efectos deja más del 3,5 % de su energía en 2,5–5 kHz;
//   · algún efecto (los ~60, uno por uno) no queda 4–8 dB sobre la música de la mesa en su momento;
//   · una voz no queda 3–5 dB sobre la música mientras canta, o sus vocales difieren más de 3 dB entre sí;
//   · en el peor caso REAL (la caída de un Rey con golpazo, efectos, remate, stinger y tres voces a la vez) el techo
//     le saca más de 2 dB al pico o toca más del 2 % de las muestras (se informa además la reducción del compresor +
//     limitador y el factor de cresta); «pico < −1 dBFS» se sigue mirando, pero el techo lo garantiza por construcción;
//   · el latido de la poca Vida no se oye entre 120 y 300 Hz (el parlante de un teléfono);
//   · la forma de alguna escena dura menos de 60 s antes de repetir; o una escena sale en mono.
//   npm run qa:audio                       todo (cuatro navegadores en paralelo: unos 100 s)
//   npm run qa:audio -- --solo=mesa,rey    solo los renders cuyo id empieza así (no escribe los archivos)
//   npm run qa:audio -- --calibrar         mide la paleta e imprime la tabla NIVEL_FX que deja cada efecto en su sitio
//   npm run qa:audio -- --calibrar --escribir   …y la escribe en src/client/audio.ts (repetir hasta que no cambie)
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { chromium, type Page } from 'playwright';
import type { Medida, Pedido } from '../src/client/musica/medir';
import { BUS } from '../src/client/musica/bus';
import { ADELANTO, AGACHE, CAMPANA, GUITARRA, INTERVALO, LFO, MARGEN, NIVEL, NIVEL_VOZ, PAN, VOLUMEN } from '../src/client/musica/motor';
import * as T from '../src/client/musica/teoria';
import { GRITO, VOZ } from '../src/client/voces';
import { REY_DEF } from '../src/rules/reyes';
import { guardian } from './guardian';
import { conServidor } from './servidor';

guardian('qa:audio', 280);
const PICO_MAX = -1;
/** El brillo: en la mesa y contra los Reyes (sin poca Vida), 2–6 % de la energía en 2,5–5 kHz; nunca más del 8 %. */
const BANDA_MESA = [0.02, 0.06] as const;
const BANDA_TOPE = 0.08;
/** La paleta de efectos, a solas: a lo sumo esto en 2,5–5 kHz (la 0.28 medía 5,17 %). */
const BANDA_FX = 0.035;
const CON_BRILLO = /^(mesa-\d|rey-)/;
/** Las escenas tranquilas, a no más de esto por debajo de la mesa del tramo 1; los efectos y las voces, tanto sobre la música. */
const LUFS_DIF = 2.5;
const FX_SOBRE = [4, 8] as const;
const VOZ_SOBRE = [3, 5] as const;
/** Las vocales de una misma voz, a no más de esto entre sí (dB). */
const VOCAL_DIF = 3;
/** El peor caso real: lo más que el techo le puede sacar al pico (dB) y la parte de las muestras que puede tocar. */
const TECHO_DB = 2;
const TECHO_MUESTRAS = 0.02;
/** El latido solo, entre 120 y 300 Hz, a no más de esto por debajo de TODA la mezcla de poca Vida en esa banda (dB). */
const LATIDO_DIF = 10;
const FORMA_MIN = 60;
const NODOS_TOPE = 60;
const DIR = 'artifacts/jurado/audio';
const OBREROS = 4;

const mesa = (nivel: 1 | 2 | 3): Partial<T.EstadoMusical> => ({ escena: 'mesa', nivel });
const REYES: T.PaloRey[] = ['S', 'C', 'D', 'H'];
const NOMBRE_REY: Record<T.PaloRey, string> = { S: 'Espadas', C: 'Bastos', D: 'Oros', H: 'Copas' };
const PERSONAJES = ['escoba', 'truco', 'chinchon', 'mentiroso', 'chancho'] as const;
const VOCES = Object.keys(T.VOCES) as T.VozId[];
const VOCALES: T.Vocal[] = ['a', 'e', 'i', 'o', 'u'];
const ESCENA_S = 20;
const escena = (id: string, que: string, estado: Partial<T.EstadoMusical>, furia?: number): Pedido => ({ id, tipo: 'escena', que, compases: 9, estado, furia, wav: ESCENA_S });

/** Lo que canta cada voz en su render. */
const cantosDe = (q: T.VozId): NonNullable<Pedido['cantos']> => {
  if (q === 'bufon') return [{ compas: 1, paso: 0, quien: q, texto: VOZ.portada[0].es }, { compas: 3, paso: 0, quien: q, texto: VOZ.exacto[0].es }, { compas: 4, paso: 8, quien: q, texto: VOZ.canto[0].es }, { compas: 6, paso: 0, quien: q, texto: VOZ.pocaVida[1].es }];
  if (q === 'S' || q === 'C' || q === 'D' || q === 'H') return [{ compas: 1, paso: 0, quien: q, texto: REY_DEF[q].voz.aliado.es }, { compas: 3, paso: 8, quien: q, texto: REY_DEF[q].voz.pega[0].es }, { compas: 5, paso: 0, quien: q, texto: REY_DEF[q].voz.duele.es }, { compas: 6, paso: 8, quien: q, texto: REY_DEF[q].voz.cae.es }];
  return [{ compas: 1, paso: 0, quien: q, texto: GRITO[q].canto[0].es, breve: true }, { compas: 1, paso: 12, quien: q, texto: GRITO[q].exacto[0].es, breve: true }, { compas: 3, paso: 0, quien: q, texto: GRITO[q].rey.es }, { compas: 5, paso: 0, quien: q, texto: GRITO[q].dolor[0].es, breve: true }, { compas: 6, paso: 4, quien: q, texto: GRITO[q].gana.es }];
};
const estadoDe = (q: T.VozId): Partial<T.EstadoMusical> => (q === 'S' || q === 'C' || q === 'D' || q === 'H' ? { escena: 'rey', nivel: 2, rey: q } : mesa(2));
const golpes = (modo: 'musica' | 'solos' | 'mezcla'): Pedido['efectos'] => [
  { compas: 1, paso: 0, cual: 'golpe', agache: 120, mudo: modo === 'musica' },
  { compas: 1, paso: 0, cual: 'paloS', mudo: modo === 'musica' },
  { compas: 2, paso: 0, cual: 'fuerte', agache: 230, mudo: modo === 'musica' },
  { compas: 2, paso: 0, cual: 'paloC', mudo: modo === 'musica' },
  { compas: 3, paso: 0, cual: 'contra', agache: 180, db: -9, mudo: modo === 'musica' },
  { compas: 3, paso: 8, cual: 'oro', mudo: modo === 'musica' },
];
/** Las tres notas en las que se mide cada vocal de una voz: abajo, al medio y arriba de su tesitura. */
const notasDe = (v: T.PerfilVoz): number[] => [v.grave + 3, Math.round((v.grave + v.agudo) / 2), v.agudo - 2];

const pedidos: Pedido[] = [
  escena('portada', 'Portada / elegir Mazo', { escena: 'portada' }),
  escena('coleccion', 'Colección / Crónica / Ajustes', { escena: 'coleccion' }),
  escena('mapa', 'Mapa', { escena: 'mapa' }),
  escena('pulperia', 'Pulpería', { escena: 'pulperia' }),
  escena('fogon', 'Fogón', { escena: 'fogon' }),
  escena('mesa-1', 'Mesa, tramo 1', mesa(1)),
  escena('mesa-2', 'Mesa, tramo 2', mesa(2)),
  escena('mesa-3', 'Mesa, tramo 3 / racha / Furia alta', mesa(3), 12),
  escena('poca-vida', 'Mesa con menos del 30 % de Vida', { ...mesa(2), vidaBaja: true }),
  ...REYES.map((rey) => escena(`rey-${rey}`, `Duelo con el Rey de ${NOMBRE_REY[rey]}`, { escena: 'rey', nivel: 2, rey })),
  escena('rey-S-segunda', 'Segunda cara del Rey de Espadas (Mi menor)', { escena: 'rey', nivel: 3, rey: 'S', segunda: true }, 12),
  escena('cabala', 'Cábala / Altar', { escena: 'cabala' }),
  escena('derrota', 'Derrota', { escena: 'derrota' }),
  escena('victoria', 'Victoria', { escena: 'victoria' }),
  // la forma entera de la mesa: 32 compases (AABA), 73,8 s, para oír el tema, el puente y la vuelta con otro arreglo
  { id: 'forma-mesa', tipo: 'escena', que: 'La forma entera de la mesa (tramo 2): A A B A, 32 compases', compases: 32, estado: mesa(2), wav: 75 },
  { id: 'forma-portada', tipo: 'escena', que: 'La forma entera de la portada: A A B A, 32 compases', compases: 32, estado: { escena: 'portada' }, wav: 75 },
  // el viaje: una pantalla cada dos compases, sin cortar nunca; y el peor caso sintético de la mezcla
  {
    id: 'viaje',
    tipo: 'escena',
    que: 'Viaje: portada → mapa → mesa 1 → mesa 3 → Rey → segunda cara → Pulpería → Fogón (cambio cada 2 compases)',
    compases: 16,
    estado: { escena: 'portada' },
    wav: 38,
    cambios: [
      { compas: 2, estado: { escena: 'mapa' } },
      { compas: 4, estado: mesa(1) },
      { compas: 6, estado: mesa(3), furia: 12 },
      { compas: 8, estado: { escena: 'rey', nivel: 3, rey: 'D' } },
      { compas: 10, estado: { escena: 'rey', nivel: 3, rey: 'D', segunda: true } },
      { compas: 12, estado: { escena: 'pulperia', segunda: false, rey: null }, furia: 0 },
      { compas: 14, estado: { escena: 'fogon' } },
    ],
  },
  {
    id: 'peor-caso',
    tipo: 'escena',
    que: 'Peor caso sintético: segunda cara + Furia 12 + poca Vida + el Bufón, un Rey y un Personaje cantando a la vez + un stinger por compás',
    compases: 10,
    estado: { escena: 'rey', nivel: 3, rey: 'C', segunda: true, vidaBaja: true },
    furia: 12,
    cantos: [1, 3, 5, 7].flatMap((compas) => [
      { compas, paso: 0, quien: 'bufon' as const, texto: VOZ.exacto[0].es },
      { compas, paso: 2, quien: 'C' as const, texto: REY_DEF.C.voz.cae.es },
      { compas, paso: 4, quien: 'escoba' as const, texto: GRITO.escoba.canto[0].es, breve: true },
    ]),
    stingers: Array.from({ length: 9 }, (_, k) => ({ compas: k + 1, paso: 0, id: (['evolucion', 'chancho', 'escoba', 'exacto'] as const)[k % 4] })),
  },
  // (0.29) EL PEOR CASO REAL: cae el Rey de Espadas en el tramo 3 con Furia 12. En el mismo segundo: el total que se
  // revela, el golpazo con su hitstop, la capa del palo, el Crítico, tres grietas, el efecto del remate, la cadencia
  // de la música (La7 → Rem), el stinger del Golpe exacto, y el Rey, el Bufón y el Personaje cantando encima
  {
    id: 'caida-real',
    tipo: 'escena',
    que: 'PEOR CASO REAL · cae el Rey de Espadas (tramo 3, Furia 12): revela + golpazo + palo + Crítico + grietas + remate + cadencia + stinger + tres voces a la vez',
    compases: 6,
    estado: { escena: 'rey', nivel: 3, rey: 'S' },
    furia: 12,
    wav: 15,
    efectos: [
      { compas: 2, paso: 0, cual: 'revela' },
      { compas: 2, paso: 1, cual: 'fuerte', agache: 230 },
      { compas: 2, paso: 1, cual: 'paloS' },
      { compas: 2, paso: 1, cual: 'critico' },
      { compas: 2, paso: 2, cual: 'grieta' },
      { compas: 2, paso: 3, cual: 'grieta', altura: 1.12 },
      { compas: 2, paso: 4, cual: 'grieta', altura: 1.24 },
      { compas: 2, paso: 5, cual: 'remate' },
      { compas: 2, paso: 9, cual: 'oro' },
    ],
    remates: [{ compas: 2, paso: 5 }],
    stingers: [{ compas: 2, paso: 2, id: 'exacto' }],
    cantos: [
      { compas: 2, paso: 3, quien: 'bufon', texto: VOZ.fuerte[0].es },
      { compas: 2, paso: 4, quien: 'truco', texto: GRITO.truco.exacto[0].es, breve: true },
      { compas: 2, paso: 6, quien: 'S', texto: REY_DEF.S.voz.cae.es },
    ],
    ventanas: [{ id: 'caida', compas: 2, paso: 0, dur: 2 }],
  },
  // la caída de un Rey: el remate cadencial (La7 → Rem) mientras el Rey canta sus últimas palabras; y el de la victoria final
  { id: 'caida-rey', tipo: 'escena', que: 'Caída del Rey de Espadas: remate La7 → Rem cuantizado a la negra, y la música sigue', compases: 6, estado: { escena: 'rey', nivel: 2, rey: 'S' }, remates: [{ compas: 2, paso: 5 }], cantos: [{ compas: 2, paso: 6, quien: 'S', texto: REY_DEF.S.voz.cae.es }], cambios: [{ compas: 4, estado: { escena: 'mapa', rey: null } }] },
  { id: 'caida-final', tipo: 'escena', que: 'Caída del último Rey: remate La7 → Re mayor y entra la victoria', compases: 6, estado: { escena: 'rey', nivel: 3, rey: 'H' }, remates: [{ compas: 2, paso: 9, mayor: true }], cambios: [{ compas: 4, estado: { escena: 'victoria', rey: null } }] },
  // la respuesta en vivo: del tramo 1 al máximo (racha + Furia 12) en mitad de un compás, y la poca Vida en mitad de otro
  {
    id: 'rtpc',
    tipo: 'escena',
    que: 'RTPC: tramo 1 → racha + Furia 12 en c3:6 → poca Vida en c5:9 (sin esperar al compás)',
    compases: 7,
    estado: mesa(1),
    cambios: [{ compas: 2, paso: 6, estado: { nivel: 3 }, furia: 12 }, { compas: 4, paso: 9, estado: { vidaBaja: true } }],
    ventanas: [
      { id: 'antes', compas: 2, paso: 2, dur: 0.5 },
      { id: 'despues', compas: 2, paso: 8, dur: 0.5 },
      { id: 'antes-vida', compas: 4, paso: 5, dur: 0.5 },
      { id: 'despues-vida', compas: 4, paso: 11, dur: 0.5 },
    ],
  },
  // el latido de la poca Vida, a solas (para ver qué deja entre 120 y 300 Hz)
  { id: 'latido-solo', tipo: 'banco', que: 'El latido de la poca Vida a solas', compases: 4, estado: { ...mesa(2), vidaBaja: true }, solo: ['latido'] },
  // el balance golpes / música en su sitio: un golpe, un golpazo y un contragolpe sobre la mesa del tramo 2 (la música
  // sola con el agache del hitstop, los efectos solos, y todo junto)
  ...(['musica', 'solos', 'mezcla'] as const).map((modo): Pedido => ({
    id: `fx-${modo}`,
    tipo: 'fx',
    que: modo === 'musica' ? 'Mesa 2 con los agaches del hitstop, sin efectos' : modo === 'solos' ? 'Golpe, golpazo y contragolpe (con su palo) a solas' : 'Golpe, golpazo y contragolpe sobre la mesa 2',
    compases: 5,
    estado: mesa(2),
    sinMusica: modo === 'solos',
    efectos: golpes(modo),
    wav: modo === 'mezcla' ? 12 : 0,
    ventanas: [
      { id: 'golpe', compas: 1, paso: 0, dur: 0.12 },
      { id: 'fuerte', compas: 2, paso: 0, dur: 0.2 },
      { id: 'contra', compas: 3, paso: 0, dur: 0.18 },
    ],
  })),
  // las voces: cada una canta lo suyo sobre su música (el WAV), a solas (su nivel) y «muda» (la música con el agache, sola)
  ...VOCES.flatMap((q): Pedido[] => {
    const base = { tipo: 'voz' as const, compases: 8, estado: estadoDe(q), cantos: cantosDe(q) };
    return [
      { ...base, id: `voz-${q}`, que: `${q} (${T.VOCES[q].cuerda}) cantando sobre su música`, wav: ESCENA_S },
      { ...base, id: `vozsola-${q}`, que: `${q} a solas (música apagada)`, sinMusica: true },
      { ...base, id: `vozmuda-${q}`, que: `La música de ${q} con el agache, sin la voz`, cantosMudos: true },
    ];
  }),
  { id: 'voz-bufon-en', tipo: 'voz', que: 'El Bufón, en inglés', compases: 3, estado: mesa(2), cantos: [{ compas: 1, paso: 0, quien: 'bufon', texto: VOZ.portada[0].en, idioma: 'en' }] },
  // el nivel de cada vocal de cada voz: «a e i o u» sostenidas en tres notas de su tesitura, sin música
  {
    id: 'vocales',
    tipo: 'banco',
    que: 'Cada voz sostiene a–e–i–o–u en tres notas de su tesitura (sin música)',
    compases: Math.ceil((VOCES.length * 15 * 4) / T.PASOS),
    estado: mesa(2),
    sinMusica: true,
    vocales: VOCES.flatMap((q, a) => notasDe(T.VOCES[q]).flatMap((midi, b) => VOCALES.map((vocal, c) => {
      const k = ((a * 3 + b) * 5 + c) * 4;
      return { id: `${q}:${vocal}:${midi}`, quien: q, vocal, midi, compas: Math.floor(k / T.PASOS), paso: k % T.PASOS, dur: 0.45 };
    }))),
  },
  // cada stinger a solas, sobre la tónica (su nivel contra la música)
  { id: 'stingers-solos', tipo: 'stinger', que: 'Los diez stingers a solas, uno por compás', compases: 11, estado: mesa(2), sinMusica: true, stingers: (Object.keys(T.STINGERS) as T.StingerId[]).map((id, k) => ({ compas: k + 1, paso: 0, id })) },
  // los stingers, sobre la forma entera de la mesa: en la tónica y, sobre todo, en los compases de tensión (La7(b9) y Mim7(b5))
  {
    id: 'stingers',
    tipo: 'stinger',
    que: 'Los diez stingers sobre la forma de la mesa, en la tónica y en los compases de tensión',
    compases: 32,
    estado: mesa(2),
    wav: 75,
    stingers: [
      [0, 8, 'escoba'], [1, 4, 'truco'], [2, 8, 'exacto'], [3, 4, 'chinchon'], [4, 0, 'mentiroso'], [5, 0, 'chancho'], [6, 4, 'exacto'], [7, 0, 'alpelo'], [9, 0, 'alpelo'],
      [10, 8, 'evolucion'], [12, 0, 'brava'], [14, 2, 'truco'], [15, 6, 'chancho'], [17, 0, 'escoba'], [19, 10, 'chinchon'], [22, 12, 'mentiroso'], [24, 0, 'evolucion'], [26, 4, 'brava'], [28, 0, 'quema'], [30, 8, 'quema'], [31, 4, 'escoba'],
    ].map(([compas, paso, id]) => ({ compas: compas as number, paso: paso as number, id: id as T.StingerId })),
  },
];

const arg = (n: string): string | undefined => process.argv.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3);
const solo = arg('solo')?.split(',') ?? null;
const calibrar = process.argv.includes('--calibrar');
interface Fx {
  id: string;
  familia: string;
  nivel: number;
  sobre: number;
}
let catalogo: Fx[] = [];
const medidas: Medida[] = [];
const wavs: string[] = [];
await conServidor(5197, async (url) => {
  const navegadores = await Promise.all(Array.from({ length: OBREROS }, () => chromium.launch()));
  try {
    const errores: string[] = [];
    const paginas: Page[] = await Promise.all(
      navegadores.map(async (n) => {
        const pagina = await n.newPage();
        pagina.on('pageerror', (e) => errores.push(e.message));
        await pagina.goto(`${url}/?qa=1`);
        return pagina;
      }),
    );
    catalogo = (await paginas[0].evaluate(`import('/src/client/musica/medir.ts').then((x) => x.catalogoFx())`)) as Fx[];
    // el banco de efectos: toda la paleta, un efecto cada media redonda, sin música (cada uno abre su ventana)
    pedidos.push({
      id: 'fx-banco',
      tipo: 'fx',
      que: `La paleta entera (${catalogo.length} efectos), uno cada medio compás, a solas`,
      compases: Math.ceil(catalogo.length / 2) + 4,
      estado: mesa(2),
      sinMusica: true,
      wav: (Math.ceil(catalogo.length / 2) + 4) * T.SEG_COMPAS + 1,
      // (el primer compás queda vacío: nada se mide en el arranque del contexto)
      efectos: [
        ...catalogo.map((f, k) => ({ compas: 1 + Math.floor(k / 2), paso: (k % 2) * 8, cual: f.id as never, palo: 'S' as const, mide: true })),
        // y, para escuchar (no se miden): el Rey que se planta y la segunda cara de los otros tres Reyes
        ...(['C', 'D', 'H'] as const).flatMap((palo, k) => [
          { compas: 1 + Math.ceil(catalogo.length / 2) + k, paso: 0, cual: 'planta' as never, palo },
          { compas: 1 + Math.ceil(catalogo.length / 2) + k, paso: 8, cual: 'segunda' as never, palo },
        ]),
      ],
    });
    let cola = pedidos.filter((p) => (calibrar ? p.id === 'fx-banco' || p.id === 'mesa-2' : !solo || solo.some((x) => p.id.startsWith(x))));
    // los renders largos primero: así los cuatro obreros terminan parejos
    cola = [...cola].sort((x, y) => y.compases - x.compases);
    await Promise.all(
      paginas.map(async (pagina) => {
        for (let p = cola.shift(); p; p = cola.shift()) {
          const t0 = Date.now();
          const m = (await pagina.evaluate(`import('/src/client/musica/medir.ts').then((x) => x.medir(${JSON.stringify(p)}))`)) as Medida;
          const ms = Date.now() - t0;
          if (m.wav && !solo && !calibrar) {
            mkdirSync(DIR, { recursive: true });
            writeFileSync(`${DIR}/${m.id}.wav`, Buffer.from(m.wav, 'base64'));
            wavs.push(`${m.id}.wav`);
          }
          delete m.wav;
          medidas.push(m);
          console.log(`${m.id.padEnd(18)} pico ${m.pico.toFixed(2).padStart(7)} dBFS · recortes ${m.recortes} · ${m.lufs.toFixed(1)} LUFS · 2,5–5 kHz ${(m.banda * 100).toFixed(2)} % · ancho ${m.ancho.toFixed(1)} dB · techo −${m.dinamica.techoDb.toFixed(2)} dB · ${m.nodosPorSegundo.toFixed(0)} nodos/s · ${(ms / 1000).toFixed(1)} s${m.fuera ? ` · ${m.fuera} NOTAS FUERA` : ''}`);
        }
      }),
    );
    if (errores.length) throw new Error(`errores en la página: ${errores.join(' | ')}`);
  } finally {
    await Promise.all(navegadores.map((n) => n.close()));
  }
});
// en el orden en que se pidieron
medidas.sort((x, y) => pedidos.findIndex((p) => p.id === x.id) - pedidos.findIndex((p) => p.id === y.id));

const n = (x: number, d = 1): string => x.toFixed(d).replace('.', ',');
const de = (id: string): Medida | undefined => medidas.find((m) => m.id === id);
const red = (x: number): number => Math.round(x * 10) / 10;

// ───────────── la calibración de la paleta ─────────────

/** Cada efecto del banco contra la música de la mesa (la mediana de su RMS en ventanas de 100 ms). */
const banco = de('fx-banco');
const mesa2 = de('mesa-2');
const fxUno = banco && mesa2 ? catalogo.map((f) => ({ ...f, m: banco.momentos.find((x) => x.id === f.id)! })).map((f) => ({ ...f, dif: red(f.m.rms - mesa2.mediana) })) : [];
/** Los tres golpes que llegan con el hitstop (la música se agacha): se miden en su sitio, contra la música agachada. */
const CON_HITSTOP = ['golpe', 'fuerte', 'contra'];
if (calibrar) {
  const nuevo = fxUno.map((f) => [f.id, CON_HITSTOP.includes(f.id) ? f.nivel : Math.round(f.nivel * 10 ** ((f.sobre - f.dif) / 20) * 1000) / 1000] as const);
  console.log(`\nmúsica de la mesa 2 (mediana): ${mesa2?.mediana} dBFS\n`);
  for (const f of fxUno) console.log(`  ${f.id.padEnd(12)} ${f.familia.padEnd(7)} ${String(f.m.rms).padStart(7)} dBFS · ${f.dif >= 0 ? '+' : ''}${f.dif} dB (objetivo +${f.sobre})`);
  const tablaFx = `export const NIVEL_FX: Record<Sonido, number> = {\n  ${nuevo.map(([id, v]) => `${/^[a-zA-Z]+$/.test(id) ? id : `'${id}'`}: ${v}`).join(', ')},\n};`;
  console.log(`\n${tablaFx}`);
  if (process.argv.includes('--escribir')) {
    const ruta = 'src/client/audio.ts';
    const fuente = readFileSync(ruta, 'utf8');
    const re = /export const NIVEL_FX: Record<Sonido, number> = \{[\s\S]*?\n\};/;
    if (!re.test(fuente)) throw new Error('no encuentro NIVEL_FX en audio.ts');
    writeFileSync(ruta, fuente.replace(re, () => tablaFx));
    console.log(`\n${ruta}: NIVEL_FX reescrita. Peor desvío antes de escribir: ${Math.max(...fxUno.filter((f) => !CON_HITSTOP.includes(f.id)).map((f) => Math.abs(f.dif - f.sobre))).toFixed(1)} dB.`);
  }
  process.exit(0);
}

// ───────────── el veredicto ─────────────

const fallos: string[] = [];
for (const m of medidas) {
  if (m.recortes > 0) fallos.push(`${m.id}: ${m.recortes} muestras recortadas`);
  if (m.pico > PICO_MAX) fallos.push(`${m.id}: pico de ${m.pico} dBFS (tope ${PICO_MAX})`);
  if (m.fuera > 0) fallos.push(`${m.id}: ${m.fuera} notas cantadas fuera del acorde o de la tesitura`);
  if (!(m.rms > -60)) fallos.push(`${m.id}: no suena (RMS ${m.rms} dBFS)`);
  if (m.banda > BANDA_TOPE) fallos.push(`${m.id}: ${(m.banda * 100).toFixed(2)} % de la energía en 2,5–5 kHz (tope ${BANDA_TOPE * 100} %)`);
  if (m.tipo === 'escena' && !['peor-caso', 'caida-real'].includes(m.id) && m.nodosPorSegundo > NODOS_TOPE) fallos.push(`${m.id}: ${m.nodosPorSegundo} nodos por segundo (tope ${NODOS_TOPE})`);
}
// el brillo: ni apagada ni chillona
const sobre500 = (m: Medida): number => m.bandas[2] + m.bandas[3] + m.bandas[4];
for (const [id, minimo] of [['mesa-1', 0.25], ['mesa-3', 0.35]] as const) {
  const m = de(id);
  if (m && sobre500(m) < minimo) fallos.push(`${id}: solo el ${(sobre500(m) * 100).toFixed(1)} % de la energía por encima de 500 Hz (mínimo ${minimo * 100} %)`);
}
for (const m of medidas) if (CON_BRILLO.test(m.id) && (m.banda < BANDA_MESA[0] || m.banda > BANDA_MESA[1])) fallos.push(`${m.id}: ${(m.banda * 100).toFixed(2)} % en 2,5–5 kHz (tiene que estar entre ${BANDA_MESA[0] * 100} y ${BANDA_MESA[1] * 100} %)`);
for (const id of ['fx-solos', 'fx-banco', 'stingers-solos']) {
  const m = de(id);
  if (m && m.banda > BANDA_FX) fallos.push(`${id}: los efectos dejan el ${(m.banda * 100).toFixed(2)} % de su energía en 2,5–5 kHz (tope ${BANDA_FX * 100} %)`);
}
// la sonoridad: las escenas tranquilas no se caen
const mesa1 = de('mesa-1');
for (const id of ['portada', 'coleccion', 'mapa', 'pulperia', 'fogon']) {
  const m = de(id);
  if (m && mesa1 && m.lufs < mesa1.lufs - LUFS_DIF) fallos.push(`${id}: ${m.lufs} LUFS, más de ${LUFS_DIF} por debajo de la mesa del tramo 1 (${mesa1.lufs})`);
}
// el estéreo: ninguna escena en mono
for (const m of medidas) if (m.tipo === 'escena' && m.ancho < -30) fallos.push(`${m.id}: sale en mono (lado ${m.ancho} dB bajo el medio)`);
// el balance en su sitio: cada golpe, 4–8 dB por encima de la música en su momento (con el agache del hitstop)
const balance: string[] = [];
const fxM = de('fx-musica');
const fxS = de('fx-solos');
if (fxM && fxS)
  for (const v of fxS.momentos) {
    const mus = fxM.momentos.find((x) => x.id === v.id)!;
    const dif = red(v.rms - mus.rms);
    balance.push(`${v.id} (con hitstop): efecto ${v.rms} dBFS, música agachada ${mus.rms} dBFS → +${dif} dB`);
    if (dif < FX_SOBRE[0] || dif > FX_SOBRE[1]) fallos.push(`balance: «${v.id}» queda ${dif} dB sobre la música (tiene que estar entre ${FX_SOBRE[0]} y ${FX_SOBRE[1]})`);
  }
// los stingers, uno por uno: como los premios de la paleta, 4–8 dB sobre la música de la mesa
const stSolos = de('stingers-solos');
const stUno = stSolos && mesa2 ? (Object.keys(T.STINGERS) as T.StingerId[]).map((id) => ({ id, m: stSolos.momentos.find((x) => x.id === `stinger:${id}`)! })).map((x) => ({ ...x, dif: red(x.m.rms - mesa2.mediana) })) : [];
for (const x of stUno) if (x.dif < FX_SOBRE[0] || x.dif > FX_SOBRE[1]) fallos.push(`stinger «${x.id}»: ${x.dif} dB sobre la música de la mesa (tiene que estar entre ${FX_SOBRE[0]} y ${FX_SOBRE[1]})`);
// la paleta, uno por uno
for (const f of fxUno) if (!CON_HITSTOP.includes(f.id) && (f.dif < FX_SOBRE[0] || f.dif > FX_SOBRE[1])) fallos.push(`efecto «${f.id}»: ${f.dif} dB sobre la música de la mesa (tiene que estar entre ${FX_SOBRE[0]} y ${FX_SOBRE[1]}; corré --calibrar)`);
// la respuesta en vivo: medio segundo después de pedirlo (sin esperar al compás) la mezcla ya cambió
const vivo: string[] = [];
const rt = de('rtpc');
if (rt) {
  const v = (id: string): { rms: number; brillo: number } => rt.momentos.find((x) => x.id === id)!;
  const sube = red(v('despues').brillo - v('antes').brillo);
  const baja = red(v('despues-vida').brillo - v('antes-vida').brillo);
  vivo.push(`racha + Furia 12 pedidas en c3:6 → brillo ${sube >= 0 ? '+' : ''}${sube} dB en la ventana que empieza 288 ms después`, `poca Vida pedida en c5:9 → brillo ${baja} dB en la ventana que empieza 288 ms después`);
  if (sube < 3) fallos.push(`rtpc: la racha y la Furia no abrieron la mezcla a tiempo (brillo ${sube} dB)`);
  if (baja > -3) fallos.push(`rtpc: la poca Vida no cerró el filtro a tiempo (brillo ${baja} dB)`);
}
// las voces contra la música: la voz sola contra la música (con su agache) en la misma ventana
const vozMusica = VOCES.map((q) => {
  const s = de(`vozsola-${q}`);
  const mu = de(`vozmuda-${q}`);
  if (!s || !mu) return null;
  const pares = s.momentos.map((v, k) => ({ voz: v, mus: mu.momentos[k] })).filter((x) => x.mus);
  const media = (f: (x: (typeof pares)[number]) => number): number => red(pares.reduce((a, x) => a + f(x), 0) / Math.max(1, pares.length));
  return { q, voz: media((x) => x.voz.rms), musica: media((x) => x.mus.rms), dif: media((x) => x.voz.rms - x.mus.rms), difBanda: media((x) => x.voz.rmsVoz - x.mus.rmsVoz), silabas: 0 };
}).filter((x): x is NonNullable<typeof x> => !!x);
for (const v of vozMusica) if (v.dif < VOZ_SOBRE[0] || v.dif > VOZ_SOBRE[1]) fallos.push(`voz «${v.q}»: ${v.dif} dB sobre la música mientras canta (tiene que estar entre ${VOZ_SOBRE[0]} y ${VOZ_SOBRE[1]})`);
// el nivel por vocal
const vocales = de('vocales');
const porVocal = vocales
  ? VOCES.map((q) => {
      const nivel = (vocal: T.Vocal, midi?: number): number => {
        const l = vocales.momentos.filter((m) => m.id.startsWith(`${q}:${vocal}:`) && (midi === undefined || m.id.endsWith(`:${midi}`)));
        return red(l.reduce((a, m) => a + m.rms, 0) / Math.max(1, l.length));
      };
      const medias = VOCALES.map((v) => nivel(v));
      const todas = vocales.momentos.filter((m) => m.id.startsWith(`${q}:`)).map((m) => m.rms);
      return { q, medias, dif: red(Math.max(...medias) - Math.min(...medias)), peor: red(Math.max(...todas) - Math.min(...todas)), sin: red(Math.max(...VOCALES.map((v) => 20 * Math.log10(T.nivelVocal(v, T.VOCES[q].agudo - 2, T.VOCES[q].formante)))) - Math.min(...VOCALES.map((v) => 20 * Math.log10(T.nivelVocal(v, T.VOCES[q].agudo - 2, T.VOCES[q].formante))))) };
    })
  : [];
for (const v of porVocal) if (v.dif > VOCAL_DIF) fallos.push(`voz «${v.q}»: sus vocales difieren ${v.dif} dB entre sí (tope ${VOCAL_DIF})`);
// el peor caso real: cuánto trabaja el techo
const real = de('caida-real');
if (real) {
  if (real.dinamica.techoDb > TECHO_DB) fallos.push(`caida-real: el techo le saca ${real.dinamica.techoDb} dB al pico (tope ${TECHO_DB})`);
  if (real.dinamica.sobreRodilla > TECHO_MUESTRAS) fallos.push(`caida-real: el ${(real.dinamica.sobreRodilla * 100).toFixed(2)} % de las muestras pasa la rodilla del techo (tope ${TECHO_MUESTRAS * 100} %)`);
}
// el latido en un teléfono
const latido = de('latido-solo');
const poca = de('poca-vida');
if (latido && poca && latido.b120a300 < poca.b120a300 - LATIDO_DIF) fallos.push(`latido: entre 120 y 300 Hz deja ${latido.b120a300} dBFS, más de ${LATIDO_DIF} dB por debajo de toda la mezcla de poca Vida (${poca.b120a300})`);
// la forma: cuánto dura antes de repetir (la armonía y el tema; y, contando el arreglo, que cambia en cada vuelta)
const ESCENAS = Object.keys(T.FORMAS) as T.EscenaId[];
const periodo = (firma: (c: number) => string): number => {
  for (let p = 1; p <= 128; p++) {
    let igual = true;
    for (let c = 0; c < 128 && igual; c++) igual = firma(c) === firma(c + p);
    if (igual) return p;
  }
  return 128;
};
const formas = ESCENAS.map((e) => {
  const armonia = periodo((c) => `${T.seccionEn(e, c)}:${T.lugarEnForma(e, c).k}`);
  const arreglo = periodo((c) => JSON.stringify([T.seccionEn(e, c), T.lugarEnForma(e, c).k, T.arregloDe(e, c).tema, T.arregloDe(e, c).contracanto, T.arregloDe(e, c).patron, T.arregloDe(e, c).guitarraCanta]));
  return { e, letras: T.letrasForma(e), armonia, arreglo };
});
for (const f of formas) if (f.armonia * T.SEG_COMPAS < FORMA_MIN) fallos.push(`forma de «${f.e}»: se repite a los ${n(f.armonia * T.SEG_COMPAS)} s (mínimo ${FORMA_MIN})`);

for (const l of [...balance, ...vivo]) console.log(`  ${l}`);
if (real) console.log(`  peor caso real: compresor + limitador −${real.dinamica.reduccion} dB · el techo le saca ${real.dinamica.techoDb} dB al pico (${real.dinamica.picoPreTecho} → ${real.dinamica.picoSalida} dBFS) · ${(real.dinamica.sobreRodilla * 100).toFixed(3)} % de las muestras sobre la rodilla · cresta ${real.dinamica.cresta} dB`);
for (const v of vozMusica) console.log(`  voz ${v.q.padEnd(9)} ${v.voz} dBFS · música ${v.musica} dBFS → +${v.dif} dB (en la banda de la voz, +${v.difBanda})`);
for (const v of porVocal) console.log(`  vocales ${v.q.padEnd(9)} ${VOCALES.map((x, k) => `${x} ${v.medias[k]}`).join(' · ')} → ${v.dif} dB entre vocales (peor nota contra mejor: ${v.peor})`);
if (stUno.length) console.log(`  stingers: ${stUno.map((x) => `${x.id} +${x.dif}`).join(' · ')} dB sobre la música`);
if (banco) console.log(`  paleta: ${fxUno.length} efectos, de +${Math.min(...fxUno.map((f) => f.dif))} a +${Math.max(...fxUno.map((f) => f.dif))} dB sobre la música (mediana de la mesa 2: ${mesa2?.mediana} dBFS); 2,5–5 kHz ${(banco.banda * 100).toFixed(2)} %`);
if (latido && poca) console.log(`  latido en 120–300 Hz: ${latido.b120a300} dBFS a solas; toda la mezcla de poca Vida, ${poca.b120a300} dBFS`);
if (solo) {
  if (fallos.length) console.error(`\n✗ ${fallos.length} fallos\n  ${fallos.join('\n  ')}`);
  process.exit(fallos.length ? 1 : 0);
}

// ───────────── el resumen ─────────────

const acordes = (s: T.SeccionId, tonica = T.TONICA): string => T.SECCIONES[s].map((g) => T.acordeDeGrado(g, tonica).nombre).join(' | ');
const tabla = (tipo: Medida['tipo'], filtro: (m: Medida) => boolean = () => true): string[] => [
  '| id | qué | s | pico (dBFS) | recortes | LUFS aprox. | mediana RMS | > 500 Hz | 2,5–5 kHz | ancho estéreo (dB) | nodos/s |',
  '|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|',
  ...medidas.filter((m) => m.tipo === tipo && filtro(m)).map((m) => `| ${m.id} | ${m.que} | ${n(m.segundos)} | ${n(m.pico, 2)} | ${m.recortes} | ${n(m.lufs)} | ${n(m.mediana)} | ${n(sobre500(m) * 100)} % | ${n(m.banda * 100, 2)} % | ${n(m.ancho)} | ${n(m.nodosPorSegundo, 0)} |`),
];
const motivo = (rey: T.PaloRey): string[] => {
  const m = T.MOTIVOS[rey];
  const sobre = [0, 1, 2, 3].map((c) => `${T.acordeDe('rey', c).nombre}: ${T.notasEnTexto(T.motivoRey(rey, T.acordeDe('rey', c), c))}`);
  const dib = T.dibujo(T.motivoRey(rey, T.acordeDe('rey', 0), 0).map((x) => x.midi)).map((d) => (d > 0 ? '↑' : d < 0 ? '↓' : '=')).join('');
  return [`- **Rey de ${NOMBRE_REY[rey]}** (${m.caracter}). Dibujo del primer compás: ${dib} (el mismo sobre cualquier acorde). ${sobre.join('  ‖  ')}`];
};
const temaEnTexto = (s: T.SeccionId): string[] => T.temaDe(s).map((c, k) => `  c${k + 1} ${T.acordeDe(s, k).nombre.padEnd(9)} ${c.map((x) => `${x.paso}:${T.nombreNota(x.midi)}(${x.dur})`).join(' ')}`);
const hayFallos = fallos.length > 0;
const resumen = [
  '# Audio de CÁBALA · medición fuera de línea',
  '',
  `Render con \`OfflineAudioContext\` a 48 kHz del mismo motor y el mismo bus maestro del juego. ${medidas.length} renders. ${hayFallos ? `**${fallos.length} FALLOS.**` : '**Sin recortes, ninguna nota cantada fuera del acorde, y todas las puertas de mezcla en su sitio.**'}`,
  '',
  `Para ESCUCHAR: en esta misma carpeta hay ${wavs.length} archivos WAV (16 bits, estéreo, 48 kHz): uno de ${ESCENA_S} s por escena y otro por voz (cada una cantando sobre su música), la forma entera de la mesa y de la portada (74 s), la paleta de efectos entera (\`fx-banco.wav\`: tras un compás de silencio, un efecto cada 1,15 s en el orden de la tabla y, al final, el Rey que se planta y la segunda cara de Bastos, Oros y Copas), los golpes sobre la mesa, los stingers sobre la forma y el peor caso real.`,
  '',
  '## La cadena, en números',
  '',
  `- **Reloj**: uno solo, ${T.BPM} negras por minuto, compás de ${T.PASOS} semicorcheas (${n(T.SEG_COMPAS, 3)} s), frases de ${T.FRASE} compases, formas de ${T.COMPASES_FORMA} (${n(T.SEG_FORMA)} s). Planificación con ${ADELANTO * 1000} ms de adelanto cada ${INTERVALO * 1000} ms; al re-anclar, ${MARGEN * 1000} ms de margen. Los cambios de escena, nivel, Rey y segunda cara se aplican en el límite del compás.`,
  `- **Tonalidad**: Re menor (la segunda cara de un Rey, Mi menor). Groove: 3-3-2 (semicorcheas ${T.TRES_TRES_DOS.join(', ')}); swing del ${T.SWING * 100} % en las semicorcheas impares de escobillas y shaker; humanización de ±8 ms (adelanta y atrasa) y ±12 % de fuerza (±4 ms el bombo).`,
  `- **Capas** → paneo (${Object.entries(PAN).map(([k, v]) => `${k} ${v}`).join(', ')}; lo demás al centro) → agache → pasabajos cálido (corte por escena, LFO de ${LFO.hz} Hz y ±${LFO.cents} cents) → campana de ${CAMPANA.db} dB en ${CAMPANA.hz} Hz (Q ${CAMPANA.q}). Volumen de la música ${VOLUMEN}; nivel de cada capa: ${Object.entries(NIVEL).map(([k, v]) => `${k} ${v}`).join(', ')}.`,
  `- **Guitarra**: cada nota por su pasabajos (abre en ${GUITARRA.abre} × su frecuencia según la fuerza, se cierra a ${GUITARRA.queda} × en ${GUITARRA.cierra * 1000} ms) y por la caja (+${GUITARRA.caja.db} dB en ${GUITARRA.caja.hz} Hz).`,
  `- **Agache cuando alguien canta**: la música entera ${AGACHE.voz} dB en la banda de la voz (campana en ${AGACHE.banda.hz} Hz, Q ${AGACHE.banda.q}) y las capas melódicas ${AGACHE.melodia} dB más; con un stinger, ${AGACHE.stinger} dB. Nivel de la voz ${NIVEL_VOZ}.`,
  `- **Bus de efectos** (la paleta): pasabajos de ${BUS.fx.corte} Hz → campana de ${BUS.fx.campana.db} dB en ${BUS.fx.campana.hz} Hz → envío a la sala ${BUS.fx.sala}.`,
  `- **Bus maestro**: compresor (${BUS.compresor.umbral} dB, ${BUS.compresor.razon}:1, rodilla ${BUS.compresor.rodilla} dB, ataque ${BUS.compresor.ataque * 1000} ms, relajo ${BUS.compresor.relajo * 1000} ms) → limitador (${BUS.limitador.umbral} dB, ${BUS.limitador.razon}:1, ataque ${BUS.limitador.ataque * 1000} ms) → maestro ${BUS.maestro} → techo suave (recto hasta ${n(20 * Math.log10(BUS.techo.rodilla))} dBFS, tope ${n(20 * Math.log10(BUS.techo.tope), 2)} dBFS). Sala: convolución de ${BUS.sala.segundos} s generada una vez (predelay ${BUS.sala.predelay * 1000} ms, brillo desde ${BUS.sala.corte} Hz), retorno ${BUS.sala.retorno}.`,
  '',
  '## La forma de cada escena',
  '',
  'Cada escena recorre cuatro secciones de 8 compases sobre el reloj único. «Armonía y tema» es lo que tarda en volver a sonar la misma sección en el mismo lugar; «con el arreglo», lo que tarda en repetirse además quién lleva el tema, el contracanto y el dibujo de la guitarra (cambian en cada vuelta). Las micro-variaciones sorteadas (adornos, notas fantasma, respiros, fills) no se cuentan.',
  '',
  '| escena | forma | secciones | armonía y tema (s) | con el arreglo (s) |',
  '|---|---|---|---:|---:|',
  ...formas.map((f) => `| ${f.e} | ${f.letras} | ${T.FORMAS[f.e].join(' · ')} | ${n(f.armonia * T.SEG_COMPAS)} | ${n(f.arreglo * T.SEG_COMPAS)} |`),
  '',
  ...(Object.keys(T.SECCIONES) as T.SeccionId[]).map((s) => `- **${s}**: ${acordes(s)}${s === 'rey' ? ` · en la segunda cara: ${acordes('rey', T.TONICA_SEGUNDA)}` : ''}`),
  '',
  '## El tema de CÁBALA (bandoneón)',
  '',
  `Escrito a mano en Re menor. Célula rítmica: semicorcheas ${T.RITMO_TEMA.join(', ')} (3 + 3 + 4 + 2 + 4). Notas como \`semicorchea:nota(duración)\`. La pregunta (c1–c4) sube por el acorde y baja por grados, y su eco un tono abajo; la respuesta (c5–c8) lleva la misma célula hasta La5, baja por Sol menor y se abre en la dominante.`,
  '',
  '**A · la milonga (base)**',
  '```',
  ...temaEnTexto('base'),
  '```',
  '**B · el puente (relativo mayor)**',
  '```',
  ...temaEnTexto('puente'),
  '```',
  '**C · la vuelta (subdominante, bajando por quintas)**',
  '```',
  ...temaEnTexto('vuelta'),
  '```',
  '**El tema citado en el duelo (sección «rey», la cadencia andaluza): mismo ritmo y mismo dibujo, otras notas**',
  '```',
  ...temaEnTexto('rey'),
  '```',
  '**El tema citado en la victoria (ya con Re mayor al final)**',
  '```',
  ...temaEnTexto('victoria'),
  '```',
  '',
  'Arreglo por lugar de la forma: 1.º el tema entero en el bandoneón (en las vueltas impares, solo la respuesta); 2.º el tema adornado con notas de paso y las cuerdas contestando con su cabeza; 3.º la sección B con el otro dibujo de la guitarra; 4.º el tema con contracanto. Donde no hay bandoneón (la mesa del tramo 1), lo canta la guitarra encima de su arpegio en los lugares 2.º y 4.º.',
  '',
  '## Motivos de los Reyes',
  '',
  ...REYES.flatMap(motivo),
  '',
  'Cada Rey abre lo que dice citando la cabeza de su motivo (sus tres primeros peldaños), en su tesitura (ver las partituras de las voces).',
  '',
  '## Tesituras',
  '',
  ...(Object.entries(T.VOCES) as [T.VozId, T.PerfilVoz][]).map(([q, v]) => `- **${q}**: ${v.cuerda}, ${T.nombreNota(v.grave)}–${T.nombreNota(v.agudo)}; estilo ${v.estilo}; ${n(1 / ((v.ritmo ? v.ritmo.reduce((a, x) => a + x, 0) / v.ritmo.length : v.paso) * T.SEG_PASO))} sílabas por segundo; a lo sumo ${v.tope} notas; paneo ${v.pan}; vibrato ${v.vibrato[0]} Hz / ${v.vibrato[1]} cents (arranca a los 140 ms); portamento ${v.porta * 1000} ms; formantes ×${v.formante}`),
  '',
  '## Escenas',
  '',
  ...tabla('escena'),
  '',
  '## El peor caso REAL y cuánto trabaja el bus',
  '',
  '«Ningún pico por encima de −1 dBFS» no dice nada: el techo no puede pasar de −1,21 dBFS por construcción. Lo que importa es cuánto tiene que trabajar cada etapa. Medido con sondas dentro del bus (la suma que entra al compresor, lo que sale del maestro antes del techo y la salida):',
  '',
  '| render | reducción compresor + limitador (dB) | pico antes del techo (dBFS) | pico a la salida (dBFS) | el techo le saca (dB) | muestras sobre la rodilla | factor de cresta (dB) |',
  '|---|---:|---:|---:|---:|---:|---:|',
  ...medidas.filter((m) => ['caida-real', 'peor-caso', 'caida-rey', 'caida-final', 'mesa-3', 'rey-S-segunda', 'fx-mezcla', 'mesa-1'].includes(m.id)).map((m) => `| ${m.id} | ${n(m.dinamica.reduccion)} | ${n(m.dinamica.picoPreTecho, 2)} | ${n(m.dinamica.picoSalida, 2)} | ${n(m.dinamica.techoDb, 2)} | ${n(m.dinamica.sobreRodilla * 100, 3)} % | ${n(m.dinamica.cresta)} |`),
  '',
  `\`caida-real\`: ${de('caida-real')?.que ?? ''}. Topes: el techo no le puede sacar más de ${TECHO_DB} dB al pico ni tocar más del ${TECHO_MUESTRAS * 100} % de las muestras.`,
  '',
  '## La paleta de efectos, uno por uno',
  '',
  `Cada efecto a solas por el bus entero; su nivel es el RMS de la ventana que junta el 90 % de su energía, contra la mediana del RMS de la mesa del tramo 2 (${mesa2?.mediana ?? '—'} dBFS, ventanas de 100 ms). Objetivo por familia: ${[...new Set(catalogo.map((f) => `${f.familia} +${f.sobre}`))].join(', ')} dB; puerta ${FX_SOBRE[0]}–${FX_SOBRE[1]} dB. La paleta entera deja el **${banco ? n(banco.banda * 100, 2) : '—'} %** de su energía en 2,5–5 kHz (tope ${BANDA_FX * 100} %; la 0.28 medía 5,17 % con seis efectos). Golpe, golpazo y contragolpe llegan con el hitstop (la música se agacha 6–9 dB): se miden aparte, en su sitio.`,
  '',
  '| efecto | familia | nivel (dBFS) | pico (dBFS) | ventana (ms) | sobre la música (dB) |',
  '|---|---|---:|---:|---:|---:|',
  ...fxUno.map((f) => `| ${f.id} | ${f.familia} | ${n(f.m.rms)} | ${n(f.m.pico)} | ${Math.round(f.m.dur * 1000)} | ${CON_HITSTOP.includes(f.id) ? `(${n(f.dif)}: ver abajo)` : `+${n(f.dif)}`} |`),
  '',
  ...tabla('fx'),
  '',
  '## Golpes en su sitio y respuesta en vivo',
  '',
  ...balance.map((x) => `- ${x}`),
  ...vivo.map((x) => `- ${x}`),
  '',
  '## Voces',
  '',
  `La voz a solas contra la música con su agache (sin la voz), en las mismas ventanas (cada frase cantada, entera). Puerta: ${VOZ_SOBRE[0]}–${VOZ_SOBRE[1]} dB de banda ancha.`,
  '',
  '| voz | voz (dBFS) | música agachada (dBFS) | voz sobre música (dB) | en la banda 300–3000 Hz (dB) |',
  '|---|---:|---:|---:|---:|',
  ...vozMusica.map((v) => `| ${v.q} | ${n(v.voz)} | ${n(v.musica)} | +${n(v.dif)} | +${n(v.difBanda)} |`),
  '',
  `Nivel por vocal (RMS en dBFS de cada vocal sostenida, promediado en tres notas de la tesitura: abajo, medio y arriba). «Sin compensar» es lo que da el modelo del tracto en la nota de arriba sin la compensación por vocal y por nota. Puerta: ${VOCAL_DIF} dB entre vocales.`,
  '',
  '| voz | a | e | i | o | u | entre vocales (dB) | peor nota contra mejor (dB) | sin compensar, arriba (dB) |',
  '|---|---:|---:|---:|---:|---:|---:|---:|---:|',
  ...porVocal.map((v) => `| ${v.q} | ${v.medias.map((x) => n(x)).join(' | ')} | ${n(v.dif)} | ${n(v.peor)} | ${n(v.sin)} |`),
  '',
  ...tabla('voz', (m) => m.id.startsWith('voz-')),
  '',
  '## El latido de la poca Vida en un parlante chico',
  '',
  latido && poca ? `El latido a solas deja **${n(latido.b120a300)} dBFS entre 120 y 300 Hz** (toda la mezcla de poca Vida, en esa banda: ${n(poca.b120a300)} dBFS). Reparto de su energía: < 120 Hz ${n(latido.bandas[0] * 100)} %, 120–500 Hz ${n(latido.bandas[1] * 100)} %, 500–2500 Hz ${n(latido.bandas[2] * 100)} %. En la 0.28 era un seno puro de 44–72 Hz: nada por encima de 120 Hz.` : '—',
  '',
  '## Stingers',
  '',
  `Cada stinger a solas contra la mediana de la mesa del tramo 2 (misma vara que la paleta: ${FX_SOBRE[0]}–${FX_SOBRE[1]} dB; mientras suena, la música además se hunde ${AGACHE.stinger} dB en la banda de la voz).`,
  '',
  '| stinger | timbre | premio | nivel (dBFS) | ventana (ms) | sobre la música (dB) |',
  '|---|---|---|---:|---:|---:|',
  ...stUno.map((x) => `| ${x.id} | ${T.STINGERS[x.id].timbre} | ${T.STINGERS[x.id].premio ? 'sí' : 'no'} | ${n(x.m.rms)} | ${Math.round(x.m.dur * 1000)} | +${n(x.dif)} |`),
  '',
  'Sobre la forma de la mesa (las notas de cada uno, con el acorde que suena y el que viene, están en la partitura de `stingers`):',
  '',
  ...tabla('stinger'),
  '',
  '## Partituras',
  '',
  'Notas como `semicorchea:nota` (0–15); golpes como rejilla de 16 semicorcheas (`x` golpe, `o` fantasma).',
  '',
  ...medidas.filter((m) => m.partitura.length && !m.id.startsWith('vozsola-') && !m.id.startsWith('vozmuda-')).flatMap((m) => [`### ${m.id} · ${m.que}`, '', '```', ...m.partitura, '```', '']),
  ...(hayFallos ? ['## Fallos', '', ...fallos.map((f) => `- ${f}`), ''] : []),
];

mkdirSync(DIR, { recursive: true });
writeFileSync(`${DIR}/medidas.json`, JSON.stringify({ fs: 48000, bpm: T.BPM, tonalidad: 'Re menor', picoMax: PICO_MAX, bus: BUS, nivel: NIVEL, balance, vivo, formas, fxUno, stUno, vozMusica, porVocal, wavs, fallos, medidas }, null, 2));
writeFileSync(`${DIR}/RESUMEN.md`, resumen.join('\n'));
console.log(`\n${DIR}/medidas.json, RESUMEN.md y ${wavs.length} WAV escritos (${medidas.length} renders).`);
if (hayFallos) {
  console.error(`\n✗ QA de audio: ${fallos.length} fallos\n  ${fallos.join('\n  ')}`);
  process.exit(1);
}
console.log('✓ QA de audio: sin recortes, todas las notas cantadas en el acorde, y brillo, sonoridad, paleta, voces, techo, latido y forma en su sitio.');
process.exit(0);
