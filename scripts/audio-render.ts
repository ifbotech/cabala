// QA de audio (0.28): la medición para el juez que no oye. Renderiza fuera de línea, en un Chromium sin cabecera, el
// mismo motor y el mismo bus maestro del juego (`src/client/musica/medir.ts`): cada escena, cada Rey, una frase
// cantada por cada voz y cada stinger. Escribe `artifacts/jurado/audio/medidas.json` y `RESUMEN.md` (niveles y
// partitura en texto) y FALLA si hay una sola muestra recortada, si el pico pasa de −1 dBFS o si alguna nota cantada
// cae fuera del acorde de su compás o de la tesitura de quien canta.
//   npm run qa:audio                       todo (unos 80 s)
//   npm run qa:audio -- --solo=mesa,rey    solo los renders cuyo id empieza así (no escribe los archivos)
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import type { Medida, Pedido } from '../src/client/musica/medir';
import { BUS } from '../src/client/musica/bus';
import { ADELANTO, AGACHE, CAMPANA, INTERVALO, LFO, NIVEL, VOLUMEN } from '../src/client/musica/motor';
import * as T from '../src/client/musica/teoria';
import { GRITO, VOZ } from '../src/client/voces';
import { REY_DEF } from '../src/rules/reyes';
import { guardian } from './guardian';
import { conServidor } from './servidor';

guardian('qa:audio', 280);
const PICO_MAX = -1;
const DIR = 'artifacts/jurado/audio';

const mesa = (nivel: 1 | 2 | 3): Partial<T.EstadoMusical> => ({ escena: 'mesa', nivel });
const REYES: T.PaloRey[] = ['S', 'C', 'D', 'H'];
const NOMBRE_REY: Record<T.PaloRey, string> = { S: 'Espadas', C: 'Bastos', D: 'Oros', H: 'Copas' };
const PERSONAJES = ['escoba', 'truco', 'chinchon', 'mentiroso', 'chancho'] as const;

const pedidos: Pedido[] = [
  { id: 'portada', tipo: 'escena', que: 'Portada / elegir Mazo', compases: 12, estado: { escena: 'portada' } },
  { id: 'mapa', tipo: 'escena', que: 'Mapa', compases: 12, estado: { escena: 'mapa' } },
  { id: 'pulperia', tipo: 'escena', que: 'Pulpería', compases: 12, estado: { escena: 'pulperia' } },
  { id: 'fogon', tipo: 'escena', que: 'Fogón', compases: 12, estado: { escena: 'fogon' } },
  { id: 'mesa-1', tipo: 'escena', que: 'Mesa, tramo 1', compases: 12, estado: mesa(1) },
  { id: 'mesa-2', tipo: 'escena', que: 'Mesa, tramo 2', compases: 12, estado: mesa(2) },
  { id: 'mesa-3', tipo: 'escena', que: 'Mesa, tramo 3 / racha / Furia alta', compases: 12, estado: mesa(3), furia: 12 },
  { id: 'poca-vida', tipo: 'escena', que: 'Mesa con menos del 30 % de Vida', compases: 12, estado: { ...mesa(2), vidaBaja: true } },
  ...REYES.map((rey): Pedido => ({ id: `rey-${rey}`, tipo: 'escena', que: `Duelo con el Rey de ${NOMBRE_REY[rey]}`, compases: 12, estado: { escena: 'rey', nivel: 2, rey } })),
  { id: 'rey-S-segunda', tipo: 'escena', que: 'Segunda cara del Rey de Espadas (Mi menor)', compases: 12, estado: { escena: 'rey', nivel: 3, rey: 'S', segunda: true }, furia: 12 },
  { id: 'cabala', tipo: 'escena', que: 'Cábala / Altar', compases: 12, estado: { escena: 'cabala' } },
  { id: 'derrota', tipo: 'escena', que: 'Derrota', compases: 12, estado: { escena: 'derrota' } },
  { id: 'victoria', tipo: 'escena', que: 'Victoria', compases: 12, estado: { escena: 'victoria' } },
  // el viaje: una pantalla cada dos compases, sin cortar nunca; y el peor caso de la mezcla
  {
    id: 'viaje',
    tipo: 'escena',
    que: 'Viaje: portada → mapa → mesa 1 → mesa 3 → Rey → segunda cara → Pulpería → Fogón (cambio cada 2 compases)',
    compases: 16,
    estado: { escena: 'portada' },
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
    que: 'Peor caso: segunda cara + Furia 12 + poca Vida + el Bufón y un Rey cantando a la vez + un stinger por compás',
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
  // las voces: cada una canta una frase suya sobre la mesa del tramo 2
  { id: 'voz-bufon', tipo: 'voz', que: 'El Bufón (tenor buffo)', compases: 4, estado: mesa(2), cantos: [{ compas: 1, paso: 0, quien: 'bufon', texto: VOZ.portada[0].es }, { compas: 2, paso: 8, quien: 'bufon', texto: VOZ.exacto[0].es }] },
  { id: 'voz-bufon-en', tipo: 'voz', que: 'El Bufón, en inglés', compases: 3, estado: mesa(2), cantos: [{ compas: 1, paso: 0, quien: 'bufon', texto: VOZ.portada[0].en, idioma: 'en' }] },
  ...REYES.map((rey): Pedido => ({ id: `voz-${rey}`, tipo: 'voz', que: `El Rey de ${NOMBRE_REY[rey]} (${T.VOCES[rey].cuerda})`, compases: 4, estado: { escena: 'rey', nivel: 2, rey }, cantos: [{ compas: 1, paso: 0, quien: rey, texto: REY_DEF[rey].voz.cae.es }] })),
  ...PERSONAJES.map((q): Pedido => ({ id: `voz-${q}`, tipo: 'voz', que: `Personaje ${q} (${T.VOCES[q].cuerda})`, compases: 3, estado: mesa(2), cantos: [{ compas: 1, paso: 0, quien: q, texto: GRITO[q].canto[0].es, breve: true }, { compas: 1, paso: 12, quien: q, texto: GRITO[q].exacto[0].es, breve: true }] })),
  // a solas (con la música apagada, solo el reloj): el nivel propio de una voz y de un stinger
  { id: 'voz-sola-bufon', tipo: 'voz', que: 'El Bufón a solas (música apagada)', compases: 2, estado: mesa(2), sinMusica: true, cantos: [{ compas: 0, paso: 0, quien: 'bufon', texto: VOZ.portada[0].es }] },
  { id: 'voz-sola-H', tipo: 'voz', que: 'El Rey de Copas a solas (música apagada)', compases: 2, estado: mesa(2), sinMusica: true, cantos: [{ compas: 0, paso: 0, quien: 'H', texto: REY_DEF.H.voz.cae.es }] },
  { id: 'stinger-solo-exacto', tipo: 'stinger', que: 'Golpe exacto a solas (música apagada)', compases: 1, estado: mesa(2), sinMusica: true, stingers: [{ compas: 0, paso: 0, id: 'exacto' }] },
  // los stingers: cada uno sobre dos acordes distintos (i y V7) para ver que se afina al del momento
  ...(Object.keys(T.STINGERS) as T.StingerId[]).map((id): Pedido => ({ id: `stinger-${id}`, tipo: 'stinger', que: `Stinger ${id}`, compases: 4, estado: mesa(2), stingers: [{ compas: 0, paso: 8, id }, { compas: 2, paso: 4, id }] })),
];

const solo = process.argv.find((a) => a.startsWith('--solo='))?.slice(7).split(',') ?? null;
const medidas: Medida[] = [];
await conServidor(5197, async (url) => {
  const navegador = await chromium.launch();
  try {
    const pagina = await navegador.newPage();
    const errores: string[] = [];
    pagina.on('pageerror', (e) => errores.push(e.message));
    await pagina.goto(`${url}/?qa=1`);
    for (const p of pedidos) {
      if (solo && !solo.some((x) => p.id.startsWith(x))) continue;
      const m = (await pagina.evaluate(`import('/src/client/musica/medir.ts').then((x) => x.medir(${JSON.stringify(p)}))`)) as Medida;
      medidas.push(m);
      console.log(`${m.id.padEnd(18)} pico ${m.pico.toFixed(2).padStart(7)} dBFS · recortes ${m.recortes} · RMS ${m.rms.toFixed(1)} · ${m.lufs.toFixed(1)} LUFS · 2,5–5 kHz ${(m.banda * 100).toFixed(2)} % · bandas ${m.bandas.map((b) => (b * 100).toFixed(1)).join('/')}${m.fuera ? ` · ${m.fuera} NOTAS FUERA` : ''}`);
    }
    if (errores.length) throw new Error(`errores en la página: ${errores.join(' | ')}`);
  } finally {
    await navegador.close();
  }
});

// ───────────── el veredicto y los archivos ─────────────

const fallos: string[] = [];
for (const m of medidas) {
  if (m.recortes > 0) fallos.push(`${m.id}: ${m.recortes} muestras recortadas`);
  if (m.pico > PICO_MAX) fallos.push(`${m.id}: pico de ${m.pico} dBFS (tope ${PICO_MAX})`);
  if (m.fuera > 0) fallos.push(`${m.id}: ${m.fuera} notas cantadas fuera del acorde o de la tesitura`);
  if (!(m.rms > -60)) fallos.push(`${m.id}: no suena (RMS ${m.rms} dBFS)`);
}

const n = (x: number, d = 1): string => x.toFixed(d).replace('.', ',');
const acordes = (s: T.SeccionId, tonica = T.TONICA): string => T.SECCIONES[s].map((g) => T.acordeDeGrado(g, tonica).nombre).join(' | ');
const tabla = (tipo: Medida['tipo']): string[] => [
  '| id | qué | s | pico (dBFS) | recortes | RMS (dBFS) | LUFS aprox. | 2,5–5 kHz |',
  '|---|---|---:|---:|---:|---:|---:|---:|',
  ...medidas.filter((m) => m.tipo === tipo).map((m) => `| ${m.id} | ${m.que} | ${n(m.segundos)} | ${n(m.pico, 2)} | ${m.recortes} | ${n(m.rms)} | ${n(m.lufs)} | ${n(m.banda * 100, 2)} % |`),
];
const motivo = (rey: T.PaloRey): string => {
  const m = T.MOTIVOS[rey];
  const dos = [0, 1].map((c) => T.notasEnTexto(T.motivoRey(rey, T.acordeDe('rey', c), c))).join('  ‖  ');
  return `- **Rey de ${NOMBRE_REY[rey]}** (${m.caracter}). Sobre Rem9 ‖ Do9: ${dos}`;
};
const resumen = [
  '# Audio de CÁBALA · medición fuera de línea',
  '',
  `Render con \`OfflineAudioContext\` a 48 kHz del mismo motor y el mismo bus maestro del juego. ${medidas.length} renders. ${fallos.length ? `**${fallos.length} FALLOS.**` : '**Sin recortes, ningún pico por encima de −1 dBFS y ninguna nota cantada fuera del acorde.**'}`,
  '',
  '## La cadena, en números',
  '',
  `- **Reloj**: uno solo, ${T.BPM} negras por minuto, compás de ${T.PASOS} semicorcheas (${n(T.SEG_COMPAS, 3)} s), frases de ${T.FRASE} compases. Planificación con ${ADELANTO * 1000} ms de adelanto cada ${INTERVALO * 1000} ms. Los cambios de escena, nivel, Rey y segunda cara se aplican en el límite del compás.`,
  `- **Tonalidad**: Re menor (la segunda cara de un Rey, Mi menor). Groove: 3-3-2 (semicorcheas ${T.TRES_TRES_DOS.join(', ')}); swing del ${T.SWING * 100} % en las semicorcheas impares de escobillas y shaker; humanización de ±8 ms y ±12 % de fuerza (±4 ms el bombo).`,
  `- **Secciones** (8 compases): base ${acordes('base')} · rey ${acordes('rey')} · segunda cara ${acordes('rey', T.TONICA_SEGUNDA)} · cábala ${acordes('cabala')} · derrota ${acordes('derrota')} · victoria ${acordes('victoria')}`,
  `- **Capas melódicas** → agache de ${n(20 * Math.log10(AGACHE))} dB cuando alguien canta o suena un stinger → pasabajos cálido (corte por escena, LFO de ${LFO.hz} Hz y ±${LFO.cents} cents) → campana de ${CAMPANA.db} dB en ${CAMPANA.hz} Hz (Q ${CAMPANA.q}). Volumen de la música ${VOLUMEN}; nivel de cada capa: ${Object.entries(NIVEL).map(([k, v]) => `${k} ${v}`).join(', ')}.`,
  `- **Bus maestro**: compresor (${BUS.compresor.umbral} dB, ${BUS.compresor.razon}:1, rodilla ${BUS.compresor.rodilla} dB, ataque ${BUS.compresor.ataque * 1000} ms, relajo ${BUS.compresor.relajo * 1000} ms) → limitador (${BUS.limitador.umbral} dB, ${BUS.limitador.razon}:1, ataque ${BUS.limitador.ataque * 1000} ms) → maestro ${BUS.maestro} → techo suave (recto hasta ${n(20 * Math.log10(BUS.techo.rodilla))} dBFS, tope ${n(20 * Math.log10(BUS.techo.tope), 2)} dBFS). Sala: convolución de ${BUS.sala.segundos} s generada una vez (predelay ${BUS.sala.predelay * 1000} ms, brillo desde ${BUS.sala.corte} Hz), retorno ${BUS.sala.retorno}.`,
  '',
  '## Corte del filtro y capas por escena',
  '',
  '| escena | capas | corte (Hz) | Q | bajo | guitarra | batería |',
  '|---|---|---:|---:|---|---|---:|',
  ...pedidos.filter((p) => p.tipo === 'escena' && !p.cambios && p.id !== 'peor-caso').map((p) => {
    const m = T.mezclaDe({ ...T.ESTADO_INICIAL, ...p.estado });
    return `| ${p.id} | ${Object.entries(m.capas).filter(([, v]) => v).map(([k, v]) => `${k} ${v}`).join(', ')} | ${m.corte} | ${m.q} | ${m.bajo} | ${m.guitarra} | ${m.bateria} |`;
  }),
  '',
  '## Motivos de los Reyes',
  '',
  ...REYES.map(motivo),
  '',
  '## Tesituras',
  '',
  ...(Object.entries(T.VOCES) as [T.VozId, T.PerfilVoz][]).map(([q, v]) => `- **${q}**: ${v.cuerda}, ${T.nombreNota(v.grave)}–${T.nombreNota(v.agudo)}; estilo ${v.estilo}; vibrato ${v.vibrato[0]} Hz / ${v.vibrato[1]} cents (arranca a los 140 ms); portamento ${v.porta * 1000} ms; formantes ×${v.formante}`),
  '',
  '## Escenas',
  '',
  ...tabla('escena'),
  '',
  '## Voces (cantando sobre la música)',
  '',
  ...tabla('voz'),
  '',
  '## Stingers (sobre la música)',
  '',
  ...tabla('stinger'),
  '',
  '## Partituras',
  '',
  'Notas como `semicorchea:nota` (0–15); golpes como rejilla de 16 semicorcheas (`x` golpe, `o` fantasma).',
  '',
  ...medidas.flatMap((m) => [`### ${m.id} · ${m.que}`, '', '```', ...m.partitura, '```', '']),
  ...(fallos.length ? ['## Fallos', '', ...fallos.map((f) => `- ${f}`), ''] : []),
];

if (solo) process.exit(fallos.length ? 1 : 0);
mkdirSync(DIR, { recursive: true });
writeFileSync(`${DIR}/medidas.json`, JSON.stringify({ fs: 48000, bpm: T.BPM, tonalidad: 'Re menor', picoMax: PICO_MAX, bus: BUS, nivel: NIVEL, fallos, medidas }, null, 2));
writeFileSync(`${DIR}/RESUMEN.md`, resumen.join('\n'));
console.log(`\n${DIR}/medidas.json y RESUMEN.md escritos (${medidas.length} renders).`);
if (fallos.length) {
  console.error(`\n✗ QA de audio: ${fallos.length} fallos\n  ${fallos.join('\n  ')}`);
  process.exit(1);
}
console.log('✓ QA de audio: sin recortes, picos por debajo de −1 dBFS y todas las notas cantadas en el acorde de su compás.');
process.exit(0);
