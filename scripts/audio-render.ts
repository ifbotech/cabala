// QA de audio (0.28): la medición para el juez que no oye. Renderiza fuera de línea, en un Chromium sin cabecera, el
// mismo motor y el mismo bus maestro del juego (`src/client/musica/medir.ts`): cada escena, cada Rey, una frase
// cantada por cada voz y cada stinger. Escribe `artifacts/jurado/audio/medidas.json` y `RESUMEN.md` (niveles y
// partitura en texto) y FALLA si hay una sola muestra recortada, si el pico pasa de −1 dBFS, si alguna nota cantada
// cae fuera del acorde de su compás o de la tesitura de quien canta, si la mezcla queda apagada o chillona (energía
// por encima de 500 Hz y en 2,5–5 kHz), si una escena tranquila queda más de 2,5 LUFS por debajo de la mesa, si los
// golpes no quedan 4–8 dB por encima de la música en su momento o si la Furia no abre la mezcla en menos de 300 ms.
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
/** El brillo: en la mesa y contra los Reyes (sin poca Vida), 2–6 % de la energía en 2,5–5 kHz; nunca más del 8 %. */
const BANDA_MESA = [0.02, 0.06] as const;
const BANDA_TOPE = 0.08;
const CON_BRILLO = /^(mesa-\d|rey-)/;
/** Las escenas tranquilas, a no más de esto por debajo de la mesa del tramo 1; los golpes, tanto sobre la música. */
const LUFS_DIF = 2.5;
const FX_SOBRE = [4, 8] as const;
const DIR = 'artifacts/jurado/audio';

const mesa = (nivel: 1 | 2 | 3): Partial<T.EstadoMusical> => ({ escena: 'mesa', nivel });
const REYES: T.PaloRey[] = ['S', 'C', 'D', 'H'];
const NOMBRE_REY: Record<T.PaloRey, string> = { S: 'Espadas', C: 'Bastos', D: 'Oros', H: 'Copas' };
const PERSONAJES = ['escoba', 'truco', 'chinchon', 'mentiroso', 'chancho'] as const;

const pedidos: Pedido[] = [
  { id: 'portada', tipo: 'escena', que: 'Portada / elegir Mazo', compases: 12, estado: { escena: 'portada' } },
  { id: 'coleccion', tipo: 'escena', que: 'Colección / Crónica / Ajustes', compases: 12, estado: { escena: 'coleccion' } },
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
  // el balance efectos / música: un golpe, un golpazo y un contragolpe sobre la mesa del tramo 2 (la música sola con
  // su agache, los efectos solos, y todo junto)
  ...(['fx-musica', 'fx-solos', 'fx-mezcla'] as const).map((id): Pedido => ({
    id,
    tipo: 'escena',
    que: id === 'fx-musica' ? 'Mesa 2 con los agaches del hitstop, sin efectos' : id === 'fx-solos' ? 'Golpe, golpazo y contragolpe a solas' : 'Golpe, golpazo y contragolpe sobre la mesa 2',
    compases: 5,
    estado: mesa(2),
    sinMusica: id === 'fx-solos',
    efectos: [
      { compas: 1, paso: 0, cual: 'golpe', agache: 120, mudo: id === 'fx-musica' },
      { compas: 1, paso: 0, cual: 'paloS', mudo: id === 'fx-musica' },
      { compas: 2, paso: 0, cual: 'fuerte', agache: 230, mudo: id === 'fx-musica' },
      { compas: 2, paso: 0, cual: 'paloC', mudo: id === 'fx-musica' },
      { compas: 3, paso: 0, cual: 'contra', agache: 180, db: -9, mudo: id === 'fx-musica' },
      { compas: 3, paso: 8, cual: 'oro', mudo: id === 'fx-musica' },
    ],
    ventanas: [
      { id: 'golpe', compas: 1, paso: 0, dur: 0.12 },
      { id: 'fuerte', compas: 2, paso: 0, dur: 0.2 },
      { id: 'contra', compas: 3, paso: 0, dur: 0.18 },
    ],
  })),
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
      console.log(`${m.id.padEnd(18)} pico ${m.pico.toFixed(2).padStart(7)} dBFS · recortes ${m.recortes} · RMS ${m.rms.toFixed(1)} · ${m.lufs.toFixed(1)} LUFS · > 500 Hz ${((m.bandas[2] + m.bandas[3] + m.bandas[4]) * 100).toFixed(1)} % · 2,5–5 kHz ${(m.banda * 100).toFixed(2)} %${m.fuera ? ` · ${m.fuera} NOTAS FUERA` : ''}`);
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
  if (m.banda > BANDA_TOPE) fallos.push(`${m.id}: ${(m.banda * 100).toFixed(2)} % de la energía en 2,5–5 kHz (tope ${BANDA_TOPE * 100} %)`);
}
// el brillo: ni apagada ni chillona
const de = (id: string): Medida | undefined => medidas.find((m) => m.id === id);
const sobre500 = (m: Medida): number => m.bandas[2] + m.bandas[3] + m.bandas[4];
for (const [id, minimo] of [['mesa-1', 0.25], ['mesa-3', 0.35]] as const) {
  const m = de(id);
  if (m && sobre500(m) < minimo) fallos.push(`${id}: solo el ${(sobre500(m) * 100).toFixed(1)} % de la energía por encima de 500 Hz (mínimo ${minimo * 100} %)`);
}
for (const m of medidas) if (CON_BRILLO.test(m.id) && (m.banda < BANDA_MESA[0] || m.banda > BANDA_MESA[1])) fallos.push(`${m.id}: ${(m.banda * 100).toFixed(2)} % en 2,5–5 kHz (tiene que estar entre ${BANDA_MESA[0] * 100} y ${BANDA_MESA[1] * 100} %)`);
// la sonoridad: las escenas tranquilas no se caen
const mesa1 = de('mesa-1');
for (const id of ['portada', 'coleccion', 'mapa', 'pulperia', 'fogon']) {
  const m = de(id);
  if (m && mesa1 && m.lufs < mesa1.lufs - LUFS_DIF) fallos.push(`${id}: ${m.lufs} LUFS, más de ${LUFS_DIF} por debajo de la mesa del tramo 1 (${mesa1.lufs})`);
}
// el balance: cada golpe, 4–8 dB por encima de la música en su momento (con el agache del hitstop)
const balance: string[] = [];
const fxM = de('fx-musica');
const fxS = de('fx-solos');
if (fxM && fxS)
  for (const v of fxS.momentos) {
    const mus = fxM.momentos.find((x) => x.id === v.id)!;
    const dif = Math.round((v.rms - mus.rms) * 10) / 10;
    balance.push(`${v.id}: efecto ${v.rms} dBFS, música ${mus.rms} dBFS → +${dif} dB`);
    if (dif < FX_SOBRE[0] || dif > FX_SOBRE[1]) fallos.push(`balance: «${v.id}» queda ${dif} dB sobre la música (tiene que estar entre ${FX_SOBRE[0]} y ${FX_SOBRE[1]})`);
  }
// la respuesta en vivo: medio segundo después de pedirlo (sin esperar al compás) la mezcla ya cambió
const vivo: string[] = [];
const rt = de('rtpc');
if (rt) {
  const v = (id: string): { rms: number; brillo: number } => rt.momentos.find((x) => x.id === id)!;
  const sube = Math.round((v('despues').brillo - v('antes').brillo) * 10) / 10;
  const baja = Math.round((v('despues-vida').brillo - v('antes-vida').brillo) * 10) / 10;
  vivo.push(`racha + Furia 12 pedidas en c3:6 → brillo ${sube >= 0 ? '+' : ''}${sube} dB en la ventana que empieza 288 ms después`, `poca Vida pedida en c5:9 → brillo ${baja} dB en la ventana que empieza 288 ms después`);
  if (sube < 3) fallos.push(`rtpc: la racha y la Furia no abrieron la mezcla a tiempo (brillo ${sube} dB)`);
  if (baja > -3) fallos.push(`rtpc: la poca Vida no cerró el filtro a tiempo (brillo ${baja} dB)`);
}

const n = (x: number, d = 1): string => x.toFixed(d).replace('.', ',');
const acordes = (s: T.SeccionId, tonica = T.TONICA): string => T.SECCIONES[s].map((g) => T.acordeDeGrado(g, tonica).nombre).join(' | ');
const tabla = (tipo: Medida['tipo']): string[] => [
  '| id | qué | s | pico (dBFS) | recortes | RMS (dBFS) | LUFS aprox. | > 500 Hz | 2,5–5 kHz |',
  '|---|---|---:|---:|---:|---:|---:|---:|---:|',
  ...medidas.filter((m) => m.tipo === tipo).map((m) => `| ${m.id} | ${m.que} | ${n(m.segundos)} | ${n(m.pico, 2)} | ${m.recortes} | ${n(m.rms)} | ${n(m.lufs)} | ${n(sobre500(m) * 100)} % | ${n(m.banda * 100, 2)} % |`),
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
  '## Balance efectos / música y respuesta en vivo',
  '',
  ...balance.map((x) => `- ${x}`),
  ...vivo.map((x) => `- ${x}`),
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

for (const l of [...balance, ...vivo]) console.log(`  ${l}`);
if (solo) process.exit(fallos.length ? 1 : 0);
mkdirSync(DIR, { recursive: true });
writeFileSync(`${DIR}/medidas.json`, JSON.stringify({ fs: 48000, bpm: T.BPM, tonalidad: 'Re menor', picoMax: PICO_MAX, bus: BUS, nivel: NIVEL, balance, vivo, fallos, medidas }, null, 2));
writeFileSync(`${DIR}/RESUMEN.md`, resumen.join('\n'));
console.log(`\n${DIR}/medidas.json y RESUMEN.md escritos (${medidas.length} renders).`);
if (fallos.length) {
  console.error(`\n✗ QA de audio: ${fallos.length} fallos\n  ${fallos.join('\n  ')}`);
  process.exit(1);
}
console.log("✓ QA de audio: sin recortes, picos por debajo de −1 dBFS, todas las notas cantadas en el acorde, y brillo, sonoridad, balance y respuesta en vivo en su sitio.");
process.exit(0);
