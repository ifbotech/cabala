// Los timbres de CÁBALA (0.29): las mismas `PeriodicWave` para la música, los stingers, las voces y, desde esta
// versión, también para los efectos (`audio.ts`): todo lo que suena sale del mismo material (nylon, fuelle, cuerda
// frotada, bordona, campana y la glotis de las voces). Se crean una vez por contexto.
import { FUENTE_VOZ } from './teoria';

export type OndaId = 'guitarra' | 'fuelle' | 'cuerda' | 'grave' | 'campana' | 'voz';
export type Ondas = Record<OndaId, PeriodicWave>;

const hechas = new WeakMap<BaseAudioContext, Ondas>();

export function ondasDe(c: BaseAudioContext): Ondas {
  let o = hechas.get(c);
  if (o) return o;
  const onda = (n: number, amp: (k: number) => number): PeriodicWave => {
    const re = new Float32Array(n + 1);
    const im = new Float32Array(n + 1);
    for (let k = 1; k <= n; k++) im[k] = amp(k);
    return c.createPeriodicWave(re, im);
  };
  o = {
    // nylon: armónicos que caen rápido (y cada tercero, más todavía: la cuerda pulsada a un tercio). El brillo de
    // la pulsación lo pone el filtro de cada nota, que se cierra enseguida (ver `pulsada` en motor.ts)
    guitarra: onda(32, (k) => (k % 3 === 0 ? 0.5 : 1) / k),
    // el fuelle: lengüeta rica en los diez primeros
    fuelle: onda(16, (k) => (k % 2 ? 1 : 0.7) / k ** 0.9),
    cuerda: onda(12, (k) => 1 / k ** 1.2),
    grave: onda(5, (k) => [1, 0.5, 0.22, 0.1, 0.04][k - 1]),
    campana: onda(6, (k) => [1, 0.3, 0.16, 0.05, 0.08, 0.02][k - 1]),
    // la glotis: un tren de armónicos que cae 9 dB por octava
    voz: onda(FUENTE_VOZ.armonicos, (k) => 1 / k ** FUENTE_VOZ.pendiente),
  };
  hechas.set(c, o);
  return o;
}
