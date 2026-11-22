// El director (0.28): UN reloj para todo el juego. No hay pistas que se cortan: hay un pulso continuo (104 negras
// por minuto, Re menor), capas que entran y salen con rampa en el límite del compás y secciones que se relevan sobre
// el mismo compás. Lo que suena lo escribe `teoria.ts`; acá se le pone timbre, hora y mezcla.
//
// Corre sobre cualquier `BaseAudioContext`: en el juego, `musica.ts` lo despierta cada 30 ms y planifica 140 ms por
// delante; en la medición (`npm run qa:audio`), se planifica todo de una vez sobre un `OfflineAudioContext`.
//
//   guitarra, rasgueo, pad, cuerdas, bandoneón, motivo ─▶ agache (−3 dB si alguien canta) ─▶ pasabajos cálido (LFO
//       lento) ─▶ campana −4 dB en 3,5 kHz ─┐
//   contrabajo ─▶ pasabajos 520 Hz ──────────┼─▶ volumen ─▶ bus de la música
//   bombo, madera, escobillas, brasas, latido ┘        (y envíos a la sala)
//
// Costo: la batería entera, las brasas y el latido son 9 fuentes que viven siempre y a las que solo se les mueve la
// envolvente (cero nodos por golpe); las notas son un oscilador y una ganancia (dos osciladores las de fuelle y
// cuerdas) que se sueltan solos al terminar: unos 30 nodos por segundo con todo al máximo.
import { crearRuido } from './bus';
import { crearCantor, type Cantor } from './canto';
import * as T from './teoria';

export interface Salidas {
  musica: AudioNode;
  efectos: AudioNode;
  sala: AudioNode;
}

/** Cuánto se planifica por delante y cada cuánto se despierta el reloj en el juego (segundos). */
export const ADELANTO = 0.14;
export const INTERVALO = 0.03;
/** El volumen de la música entera y el nivel de cada capa. */
export const VOLUMEN = 0.44;
export const NIVEL: Record<T.CapaId, number> = { bajo: 0.125, guitarra: 0.31, rasgueo: 0.16, pad: 0.07, cuerdas: 0.06, bandoneon: 0.16, motivo: 0.16, bombo: 0.15, madera: 0.3, escobillas: 0.28, brasas: 0.14, latido: 0.18 };
/** La melodía se agacha 3 dB mientras alguien canta o suena un stinger. */
export const AGACHE = 10 ** (-3 / 20);
export const NIVEL_VOZ = 0.17;
export const NIVEL_STINGER = 0.068;
/** El pasabajos cálido se mece ±1,5 semitonos cada 14 segundos; la campana de la banda que cansa. */
export const LFO = { hz: 0.07, cents: 150 };
export const CAMPANA = { hz: 3500, q: 0.9, db: -3 };
const ENVIO_MELODIA = 0.3;
/** Las rampas: lo que cambia en el límite del compás entra despacio; lo que el combate mueve en vivo, en menos de 300 ms. */
const RAMPA_COMPAS = 0.3;
export const RAMPA_VIVA = 0.08;
/** El remate (la caída de un Rey): la dominante dura una negra y la tónica queda sonando; mientras, la música baja 16 dB. */
export const REMATE = { pasosV: 4, pasosI: 12, agache: 0.16, nivel: 0.36 };

interface Frase {
  quien: T.VozId;
  texto: string;
  plan: T.NotaPlan[];
  inicio: number;
  sig: number;
  cantor: Cantor;
  anterior: number | null;
  primera: number | null;
  notas: T.NotaCantada[];
}

/** Una fuente que vive siempre y a la que solo se le mueve la envolvente (la batería, las brasas, el latido). */
interface Canal {
  env: GainNode;
  osc?: OscillatorNode;
  src?: AudioBufferSourceNode;
}

export class Motor {
  readonly ctx: BaseAudioContext;
  private readonly sal: Salidas;
  readonly semilla: number;
  private capas = {} as Record<T.CapaId, GainNode>;
  private filtro!: BiquadFilterNode;
  private agache!: GainNode;
  private volumen!: GainNode;
  private salaBateria!: GainNode;
  private bateria!: GainNode;
  private stingers!: GainNode;
  private remates!: GainNode;
  private ondas!: Record<'guitarra' | 'fuelle' | 'cuerda' | 'grave' | 'campana' | 'voz', PeriodicWave>;
  private ruido: AudioBuffer;
  private vivas: AudioScheduledSourceNode[] = [];
  private canales: Partial<Record<'bombo' | 'bomboAire' | 'madera' | 'maderaAire' | 'tom' | 'escobilla' | 'shaker' | 'brasa' | 'latido', Canal>> = {};
  private vibrato: GainNode | null = null;

  /** Lo que se pidió (se aplica en el próximo límite de compás) y lo que suena. */
  pedido: T.EstadoMusical = { ...T.ESTADO_INICIAL };
  aplicado: T.EstadoMusical = { ...T.ESTADO_INICIAL };
  private furia = 0;
  private compasActual: T.Compas | null = null;
  private acordes = new Map<number, T.Acorde>();
  /** ¿Se programan notas? (con la música apagada el reloj sigue, para que las voces sepan en qué acorde cantar). */
  private activa = false;
  private abierta = false;
  /** El reloj: la semicorchea `pasoAncla` cae en el segundo `t0`. `paso` es la próxima que falta programar. */
  private t0 = 0;
  private pasoAncla = 0;
  paso = 0;
  /** Cuántas semicorcheas con música se llevan programadas (para la QA, que no oye). */
  pasosDados = 0;
  private frases: Frase[] = [];
  /** Los acordes del remate: mandan sobre los de la sección mientras dura. */
  private forzados: { desde: number; hasta: number; acorde: T.Acorde }[] = [];
  /** Para la QA, que no oye: los stingers que sonaron y cuántas veces arrancó el reloj de la música. */
  readonly stingersSonados: T.StingerId[] = [];
  arranques = 0;
  /** La última frase de cada personaje (para callarla si empieza otra antes de terminar). */
  private voces = new Map<T.VozId, { cantor: Cantor; fin: number }>();
  /** La partitura de lo que se programó (si se pide) y las últimas frases cantadas. */
  registro: T.Compas[] | null = null;
  readonly cantadas: { quien: T.VozId; texto: string; notas: T.NotaCantada[] }[] = [];
  /** Avisa cada vez que una escena empieza a sonar de verdad (en su límite de compás). */
  alCambiar: ((e: T.EscenaId) => void) | null = null;

  constructor(ctx: BaseAudioContext, salidas: Salidas, semilla = 2028) {
    this.ctx = ctx;
    this.sal = salidas;
    this.semilla = semilla;
    this.ruido = crearRuido(ctx, 1, 7);
    this.cablear();
  }

  // ───────────── el cableado (una vez) ─────────────

  private cablear(): void {
    const c = this.ctx;
    const onda = (n: number, amp: (k: number) => number): PeriodicWave => {
      const re = new Float32Array(n + 1);
      const im = new Float32Array(n + 1);
      for (let k = 1; k <= n; k++) im[k] = amp(k);
      return c.createPeriodicWave(re, im);
    };
    this.ondas = {
      // nylon: armónicos que caen rápido (y cada tercero, más todavía: la cuerda pulsada a un tercio)
      guitarra: onda(32, (k) => (k % 3 === 0 ? 0.5 : 1) / k),
      // el fuelle: lengüeta rica en los diez primeros
      fuelle: onda(16, (k) => (k % 2 ? 1 : 0.7) / k ** 0.9),
      cuerda: onda(12, (k) => 1 / k ** 1.2),
      grave: onda(5, (k) => [1, 0.5, 0.22, 0.1, 0.04][k - 1]),
      campana: onda(6, (k) => [1, 0.3, 0.16, 0.05, 0.08, 0.02][k - 1]),
      // la glotis: un tren de armónicos que cae 7 dB por octava
      voz: onda(40, (k) => 1 / k ** 1.15),
    };
    this.volumen = c.createGain();
    this.volumen.gain.value = 0;
    this.volumen.connect(this.sal.musica);
    // las capas melódicas: agache → pasabajos cálido → campana de 3,5 kHz
    this.agache = c.createGain();
    this.filtro = c.createBiquadFilter();
    this.filtro.type = 'lowpass';
    this.filtro.frequency.value = T.mezclaDe(this.aplicado).corte;
    this.filtro.Q.value = 0.6;
    const campana = c.createBiquadFilter();
    campana.type = 'peaking';
    campana.frequency.value = CAMPANA.hz;
    campana.Q.value = CAMPANA.q;
    campana.gain.value = CAMPANA.db;
    this.agache.connect(this.filtro).connect(campana).connect(this.volumen);
    const envio = c.createGain();
    envio.gain.value = ENVIO_MELODIA;
    campana.connect(envio).connect(this.sal.sala);
    // el contrabajo, por su propio pasabajos
    const grave = c.createBiquadFilter();
    grave.type = 'lowpass';
    grave.frequency.value = 520;
    grave.connect(this.volumen);
    // la batería: una repisa que le saca 3 dB de aire, y su envío a la sala (lejos, en el Mapa)
    this.bateria = c.createGain();
    const repisa = c.createBiquadFilter();
    repisa.type = 'highshelf';
    repisa.frequency.value = 4500;
    repisa.gain.value = -3;
    this.bateria.connect(repisa).connect(this.volumen);
    this.salaBateria = c.createGain();
    this.salaBateria.gain.value = 0.2;
    repisa.connect(this.salaBateria).connect(this.sal.sala);
    for (const id of T.CAPAS) {
      const g = c.createGain();
      g.gain.value = 0;
      this.capas[id] = g;
      if (id === 'bajo') g.connect(grave);
      else if (id === 'latido') g.connect(this.volumen);
      else if (T.MELODICAS.includes(id)) g.connect(this.agache);
      else g.connect(this.bateria);
    }
    // los stingers: a los efectos (obedecen al ajuste de sonido) y a la sala
    this.stingers = c.createGain();
    this.stingers.gain.value = NIVEL_STINGER;
    this.stingers.connect(this.sal.efectos);
    const envioSt = c.createGain();
    envioSt.gain.value = 0.35;
    this.stingers.connect(envioSt).connect(this.sal.sala);
    // el remate va derecho al bus de la música (no pasa por el volumen, que se agacha mientras suena)
    this.remates = c.createGain();
    this.remates.gain.value = REMATE.nivel;
    this.remates.connect(this.sal.musica);
    const envioRe = c.createGain();
    envioRe.gain.value = 0.4;
    this.remates.connect(envioRe).connect(this.sal.sala);
  }

  /** Las fuentes que viven mientras hay música: el LFO del filtro, el vibrato común y los canales de la batería. */
  private encender(t: number): void {
    if (this.vivas.length) return;
    const c = this.ctx;
    const osc = (tipo: OscillatorType, f: number): OscillatorNode => {
      const o = c.createOscillator();
      o.type = tipo;
      o.frequency.value = f;
      o.start(t);
      this.vivas.push(o);
      return o;
    };
    // el pasabajos cálido se mece despacio
    const lfo = osc('sine', LFO.hz);
    const hondo = c.createGain();
    hondo.gain.value = LFO.cents;
    lfo.connect(hondo).connect(this.filtro.detune);
    // un vibrato común para las cuerdas y el motivo de Copas (un solo LFO para todas las notas)
    const vib = osc('sine', 5.4);
    this.vibrato = c.createGain();
    this.vibrato.gain.value = 9;
    vib.connect(this.vibrato);
    const tono = (tipo: OscillatorType, f: number, a: AudioNode): Canal => {
      const o = osc(tipo, f);
      const env = c.createGain();
      env.gain.value = 0;
      o.connect(env).connect(a);
      return { env, osc: o };
    };
    const aire = (tipo: BiquadFilterType, f: number, q: number, a: AudioNode, desde: number): Canal => {
      const src = c.createBufferSource();
      src.buffer = this.ruido;
      src.loop = true;
      src.start(t, desde);
      this.vivas.push(src);
      const fil = c.createBiquadFilter();
      fil.type = tipo;
      fil.frequency.value = f;
      fil.Q.value = q;
      const env = c.createGain();
      env.gain.value = 0;
      src.connect(fil).connect(env).connect(a);
      return { env, src };
    };
    this.canales = {
      // el bombo criollo: un parche hondo (el tono cae de 105 a 47 Hz) y el golpe sordo de la maza
      bombo: tono('sine', 50, this.capas.bombo),
      bomboAire: aire('lowpass', 260, 0.7, this.capas.bombo, 0),
      // el rimshot: madera seca (un tono corto de 860 Hz y un chasquido angosto en 1,7 kHz)
      madera: tono('triangle', 860, this.capas.madera),
      maderaAire: aire('bandpass', 1700, 1.4, this.capas.madera, 0.13),
      tom: tono('sine', 150, this.capas.madera),
      // escobillas (un roce ancho en 1,9 kHz) y shaker (por encima de 6,5 kHz: fuera de la banda que cansa)
      escobilla: aire('bandpass', 2600, 0.6, this.capas.escobillas, 0.31),
      shaker: aire('highpass', 6500, 0.7, this.capas.escobillas, 0.47),
      brasa: aire('bandpass', 1500, 2.2, this.capas.brasas, 0.61),
      latido: tono('sine', 52, this.capas.latido),
    };
  }
  private apagar(t: number): void {
    for (const f of this.vivas) {
      try {
        f.stop(t + 1.2);
      } catch {
        // ya estaba parada
      }
    }
    this.vivas = [];
    this.canales = {};
    this.vibrato = null;
  }

  // ───────────── el estado ─────────────

  /** Pide un estado: se aplica en el próximo límite de compás (nunca corta lo que suena). */
  pedir(e: Partial<T.EstadoMusical>, ahora = this.ctx.currentTime): void {
    Object.assign(this.pedido, e);
    // la intensidad y la poca Vida NO esperan al compás: si la escena, el Rey y la tonalidad son los mismos, las capas
    // y el filtro se mueven ya, con una rampa de menos de 300 ms, y lo que queda del compás se toca con la mezcla nueva
    const c = this.compasActual;
    const a = this.aplicado;
    const p = this.pedido;
    if (!this.activa || !c || p.escena !== a.escena || p.rey !== a.rey || p.segunda !== a.segunda) return;
    if (p.nivel === a.nivel && p.vidaBaja === a.vidaBaja) return;
    this.aplicado = { ...p };
    this.compasActual = T.partitura(this.aplicado, c.compas, this.semilla);
    this.mezclar(this.compasActual.mezcla, ahora, RAMPA_VIVA);
  }
  /** Los parámetros continuos del combate: la Furia abre el filtro y empuja la batería ya, sin esperar al compás. */
  rtpc(o: { furia?: number }, ahora = this.ctx.currentTime): void {
    if (o.furia === undefined) return;
    const f = Math.max(0, Math.min(12, o.furia));
    if (f === this.furia) return;
    this.furia = f;
    if (this.activa && this.compasActual) this.mezclar(this.compasActual.mezcla, ahora, RAMPA_VIVA);
  }
  /** Lleva las capas, el filtro y los envíos a una mezcla, con rampa (nunca un salto). */
  private mezclar(m: T.Mezcla, t: number, rampa: number): void {
    for (const id of T.CAPAS) {
      const obj = (m.capas[id] ?? 0) * NIVEL[id];
      this.capas[id].gain.setTargetAtTime(obj, t, obj > 0 ? rampa : rampa * 0.75);
    }
    // el filtro cálido: la Furia lo abre hasta un 20 % más; la poca Vida lo cierra y le da resonancia
    const abre = this.aplicado.vidaBaja ? 1 : 1 + (this.furia / 12) * 0.2;
    this.filtro.frequency.setTargetAtTime(m.corte * abre, t, rampa);
    this.filtro.Q.setTargetAtTime(m.q, t, rampa);
    this.salaBateria.gain.setTargetAtTime(m.sala, t, rampa);
    this.bateria.gain.setTargetAtTime(1 + (this.furia / 12) * 0.25, t, rampa);
  }
  /** Prende o apaga la música: con ella apagada el reloj sigue (las voces lo necesitan) pero no se programa nada. */
  activar(si: boolean, ahora = this.ctx.currentTime): void {
    if (si === this.activa) return;
    this.activa = si;
    if (si) {
      // arranca en un límite de compás (si nadie está cantando, el reloj se acomoda: no había nada sonando)
      if (!this.frases.length) {
        this.paso = Math.ceil(this.paso / T.PASOS) * T.PASOS;
        this.pasoAncla = this.paso;
        this.t0 = ahora + 0.03;
      }
      this.encender(ahora);
      this.arranques++;
    } else {
      this.abrir(false, ahora);
      this.apagar(ahora);
      this.compasActual = null;
    }
  }
  get estaActiva(): boolean {
    return this.activa;
  }
  /** Abre o cierra el volumen de la música con un fundido (el silencio dramático de la caída de un Rey). */
  abrir(si: boolean, ahora = this.ctx.currentTime): void {
    if (si === this.abierta) return;
    this.abierta = si;
    this.volumen.gain.cancelScheduledValues(ahora);
    this.volumen.gain.setTargetAtTime(si ? VOLUMEN : 0, ahora, si ? 0.2 : 0.09);
  }
  /** ¿Suena? ¿Qué escena? */
  get suena(): T.EscenaId | null {
    return this.activa && this.abierta && this.compasActual ? this.aplicado.escena : null;
  }
  /** ¿Queda algo por cantar? (mientras tanto el reloj no se puede dormir). */
  get cantando(): boolean {
    return this.frases.length > 0;
  }

  // ───────────── el reloj ─────────────

  tiempoDe(paso: number): number {
    return this.t0 + (paso - this.pasoAncla) * T.SEG_PASO;
  }
  /** Pone el reloj al día: si se atrasó (pestaña oculta, audio dormido), sigue desde ahora sin saltarse el compás. */
  tic(ahora = this.ctx.currentTime, adelanto = ADELANTO): void {
    if (this.tiempoDe(this.paso) < ahora) {
      this.t0 = ahora + 0.02;
      this.pasoAncla = this.paso;
    }
    this.planificarHasta(ahora + adelanto);
  }
  /** Programa todas las semicorcheas que empiezan antes de `hasta`. */
  planificarHasta(hasta: number): void {
    while (this.tiempoDe(this.paso) < hasta) {
      this.programar(this.paso, this.tiempoDe(this.paso));
      this.paso++;
    }
  }
  /** El acorde y la escala del compás que suena en el instante `ahora` (lo leen las voces y los stingers). */
  armonia(ahora = this.ctx.currentTime): { acorde: T.Acorde; compas: number; paso: number } {
    const p = Math.max(0, Math.min(this.paso - 1, this.pasoAncla + Math.floor((ahora - this.t0) / T.SEG_PASO)));
    return { acorde: this.acordeDelPaso(p), compas: Math.floor(p / T.PASOS), paso: p % T.PASOS };
  }
  /** El acorde de una semicorchea: el del remate si cae adentro; si no, el del compás (el pedido, si todavía no llegó). */
  private acordeDelPaso(p: number): T.Acorde {
    for (const f of this.forzados) if (p >= f.desde && p < f.hasta) return f.acorde;
    const compas = Math.floor(p / T.PASOS);
    return this.acordes.get(compas) ?? T.acordeDelEstado(p >= this.paso ? this.pedido : this.aplicado, compas);
  }

  // ───────────── programar una semicorchea ─────────────

  private programar(paso: number, t: number): void {
    const k = paso % T.PASOS;
    const compas = Math.floor(paso / T.PASOS);
    if (k === 0 || !this.acordes.has(compas) || (this.activa && !this.compasActual)) this.alCompas(compas, t, k === 0);
    for (const f of this.frases) this.cantarHasta(f, paso);
    if (this.frases.length) this.frases = this.frases.filter((f) => f.sig < f.plan.length);
    const c = this.compasActual;
    if (!this.activa || !c) return;
    this.pasosDados++;
    const s = this.semilla;
    let capa = 0;
    for (const id of T.CAPAS) {
      capa++;
      const notas = c.notas[id];
      if (notas) {
        let n = 0;
        for (const x of notas) {
          if (x.paso !== k) continue;
          const h = T.humanizar(s, compas, k, capa * 8 + n);
          // el rasgueo: las cuerdas no suenan a la vez (14 ms entre una y otra)
          const tn = Math.max(t, t + h.dt) + (id === 'rasgueo' ? n * 0.014 : 0);
          this.nota(id, tn, x, x.vel * h.vel);
          n++;
        }
      }
      const golpes = c.golpes[id];
      if (golpes) {
        for (const g of golpes) {
          if (g.paso !== k) continue;
          const h = T.humanizar(s, compas, k, capa * 8, id === 'bombo' || id === 'latido');
          // el swing: las semicorcheas impares de escobillas y shaker llegan tarde
          const sw = id === 'escobillas' && k % 2 === 1 ? T.SWING * T.SEG_PASO : 0;
          this.golpe(id, Math.max(t, t + h.dt) + sw, g, g.vel * h.vel, compas);
        }
      }
    }
  }

  /** El límite del compás: acá (y solo acá) cambia la escena, entran y salen las capas y se relevan las secciones. */
  private alCompas(compas: number, t: number, limite: boolean): void {
    const antes = this.aplicado.escena;
    const primera = !this.compasActual;
    if (limite || primera) this.aplicado = { ...this.pedido };
    this.acordes.set(compas, T.acordeDelEstado(this.aplicado, compas));
    if (this.acordes.size > 6) this.acordes.delete(Math.min(...this.acordes.keys()));
    if (!this.activa) return;
    const c = T.partitura(this.aplicado, compas, this.semilla);
    this.compasActual = c;
    this.registro?.push(c);
    // las capas de la escena nueva, con rampa (nunca un salto): entran en ~1 s, salen en ~0,7 s
    this.mezclar(c.mezcla, t, RAMPA_COMPAS);
    if (primera || antes !== this.aplicado.escena) this.alCambiar?.(this.aplicado.escena);
  }

  // ───────────── los timbres ─────────────

  private tono(a: AudioNode, t: number, midi: number, vol: number, onda: PeriodicWave, env: { ataque: number; cae?: number; dura?: number; suelta?: number }, o: { desafina?: number; vibra?: boolean; desde?: number } = {}): void {
    const c = this.ctx;
    const osc = c.createOscillator();
    const gan = c.createGain();
    osc.setPeriodicWave(onda);
    const f = T.hz(midi);
    if (o.desde) {
      osc.frequency.setValueAtTime(T.hz(o.desde), t);
      osc.frequency.exponentialRampToValueAtTime(f, t + 0.13);
    } else osc.frequency.setValueAtTime(f, t);
    if (o.desafina) osc.detune.setValueAtTime(o.desafina, t);
    if (o.vibra && this.vibrato) this.vibrato.connect(osc.detune);
    gan.gain.setValueAtTime(0, t);
    gan.gain.linearRampToValueAtTime(vol, t + env.ataque);
    let fin: number;
    if (env.cae !== undefined) {
      // pulsada: cae sola
      gan.gain.setTargetAtTime(0, t + env.ataque, env.cae / 5);
      fin = t + env.ataque + env.cae * 1.4;
    } else {
      // sostenida: se queda y se suelta
      const hasta = t + Math.max(env.ataque, env.dura ?? 0);
      gan.gain.setTargetAtTime(0, hasta, (env.suelta ?? 0.1) / 4);
      fin = hasta + (env.suelta ?? 0.1) * 1.5;
    }
    osc.connect(gan).connect(a);
    osc.start(t);
    osc.stop(fin);
    const vib = o.vibra ? this.vibrato : null;
    osc.onended = () => {
      gan.disconnect();
      try {
        vib?.disconnect(osc.detune);
      } catch {
        // el vibrato ya se había soltado
      }
    };
  }

  private nota(id: T.CapaId, t: number, x: T.Nota, vel: number): void {
    const a = this.capas[id];
    const dur = x.dur * T.SEG_PASO;
    const w = this.ondas;
    switch (id) {
      case 'bajo':
        // contrabajo en pizzicato
        this.tono(a, t, x.midi, vel, w.grave, { ataque: 0.012, cae: Math.max(0.45, dur * 1.2) });
        break;
      case 'guitarra':
        this.tono(a, t, x.midi, vel, w.guitarra, { ataque: 0.004, cae: 0.7 });
        break;
      case 'rasgueo':
        this.tono(a, t, x.midi, vel, w.guitarra, { ataque: 0.005, cae: Math.max(0.16, Math.min(1.5, dur * 1.3)) });
        break;
      case 'pad':
        this.tono(a, t, x.midi, vel, w.cuerda, { ataque: 0.6, dura: dur, suelta: 1.1 }, { desafina: (x.midi % 3) * 4 - 4 });
        break;
      case 'cuerdas':
        this.tono(a, t, x.midi, vel * 0.6, w.cuerda, { ataque: 0.4, dura: dur, suelta: 0.8 }, { desafina: -7, vibra: true });
        this.tono(a, t, x.midi, vel * 0.6, w.cuerda, { ataque: 0.4, dura: dur, suelta: 0.8 }, { desafina: 7 });
        break;
      case 'bandoneon':
        // dos lengüetas apenas desafinadas: el fuelle
        this.tono(a, t, x.midi, vel * 0.6, w.fuelle, { ataque: 0.035, dura: dur * 0.9, suelta: 0.09 });
        this.tono(a, t, x.midi, vel * 0.45, w.fuelle, { ataque: 0.035, dura: dur * 0.9, suelta: 0.09 }, { desafina: 9 });
        break;
      case 'motivo':
        this.motivo(a, t, x, vel, dur);
        break;
      default:
    }
  }

  /** El motivo de cada Rey, con su timbre: Espadas, fuelle cortante; Bastos, grave y largo; Oros, campana; Copas, cuerda ligada. */
  private motivo(a: AudioNode, t: number, x: T.Nota, vel: number, dur: number): void {
    const w = this.ondas;
    switch (this.aplicado.rey) {
      case 'S':
        this.tono(a, t, x.midi, vel * 0.6, w.fuelle, { ataque: 0.012, dura: dur * 0.6, suelta: 0.05 });
        this.tono(a, t, x.midi, vel * 0.4, w.fuelle, { ataque: 0.012, dura: dur * 0.6, suelta: 0.05 }, { desafina: -8 });
        break;
      case 'C':
        this.tono(a, t, x.midi, vel * 0.55, w.grave, { ataque: 0.03, dura: dur * 0.95, suelta: 0.2 });
        this.tono(a, t, x.midi + 12, vel * 0.65, w.fuelle, { ataque: 0.05, dura: dur * 0.9, suelta: 0.2 });
        break;
      case 'D':
        this.tono(a, t, x.midi, vel, w.campana, { ataque: 0.003, cae: 0.6 });
        break;
      default:
        this.tono(a, t, x.midi, vel * 0.9, w.cuerda, { ataque: 0.07, dura: dur, suelta: 0.18 }, { vibra: true });
    }
  }

  /** Un golpe de la batería: mueve la envolvente (y el tono) de su canal; no crea nodos. */
  private golpe(id: T.CapaId, t: number, g: T.Golpe, vel: number, compas: number): void {
    const pega = (canal: Canal | undefined, vol: number, ataque: number, cae: number): void => {
      if (!canal) return;
      const e = canal.env.gain;
      e.setTargetAtTime(vol, t, ataque / 3);
      e.setTargetAtTime(0, t + ataque, cae / 4);
    };
    const k = this.canales;
    switch (id) {
      case 'bombo':
        if (k.bombo?.osc) {
          k.bombo.osc.frequency.setValueAtTime(105, t);
          k.bombo.osc.frequency.exponentialRampToValueAtTime(47, t + 0.12);
        }
        pega(k.bombo, vel, 0.006, 0.3);
        pega(k.bomboAire, vel * 0.5, 0.003, 0.05);
        break;
      case 'madera':
        if (g.tipo === 'tom') {
          // los toms del fill: el parche chico, que baja con cada golpe
          if (k.tom?.osc) {
            const f = 190 - (g.paso - 12) * 18;
            k.tom.osc.frequency.setValueAtTime(f * 1.3, t);
            k.tom.osc.frequency.exponentialRampToValueAtTime(f, t + 0.05);
          }
          pega(k.tom, vel * 1.6, 0.004, 0.14);
        } else {
          pega(k.madera, vel * 0.7, 0.002, 0.035);
          pega(k.maderaAire, vel, 0.001, 0.022);
        }
        break;
      case 'escobillas':
        if (g.tipo === 'shaker') pega(k.shaker, vel * 0.8, 0.004, 0.03);
        else pega(k.escobilla, vel, 0.03, 0.09);
        break;
      case 'brasas': {
        // cada chasquido, a su altura
        const r = T.azarDe(T.clave(this.semilla, compas, g.paso, 89))();
        k.brasa?.src?.playbackRate.setValueAtTime(0.6 + r * 1.1, t);
        pega(k.brasa, vel, 0.001, 0.012 + r * 0.03);
        break;
      }
      case 'latido':
        if (k.latido?.osc) {
          k.latido.osc.frequency.setValueAtTime(g.tipo === 'dub' ? 62 : 72, t);
          k.latido.osc.frequency.exponentialRampToValueAtTime(g.tipo === 'dub' ? 44 : 48, t + 0.1);
        }
        pega(k.latido, vel, 0.008, 0.22);
        break;
      default:
    }
  }

  // ───────────── el agache, las voces y los stingers ─────────────

  /** La melodía baja 3 dB mientras alguien canta o suena un stinger, y vuelve sola. */
  private agachar(t: number, dur: number): void {
    const g = this.agache.gain;
    g.cancelScheduledValues(t);
    g.setTargetAtTime(AGACHE, t, 0.04);
    g.setTargetAtTime(1, t + dur, 0.2);
  }

  /**
   * Alguien canta una frase: cada sílaba, una nota del acorde del compás en que cae, sobre la rejilla de semicorcheas
   * del reloj. Devuelve cuántos segundos dura (0 si no hay nada que cantar).
   */
  cantar(quien: T.VozId, texto: string, o: { idioma?: T.Idioma; breve?: boolean } = {}, ahora = this.ctx.currentTime): number {
    const plan = T.planCanto(quien, texto, o.idioma ?? 'es', this.semilla + this.cantadas.length, o.breve);
    if (!plan.length) return 0;
    this.tic(ahora);
    // entra en la primera semicorchea que todavía se puede programar (a lo sumo, 144 ms)
    let inicio = this.pasoAncla + Math.ceil((ahora + 0.012 - this.t0) / T.SEG_PASO);
    if (inicio < 0 || this.tiempoDe(inicio) < ahora) inicio = this.paso;
    const largo = T.largoPlan(plan) * T.SEG_PASO;
    const t0 = this.tiempoDe(inicio);
    // nadie canta dos frases a la vez: si este personaje todavía estaba cantando, se calla y empieza la nueva
    const previa = this.voces.get(quien);
    if (previa && previa.fin > t0) previa.cantor.callar(t0);
    this.frases = this.frases.filter((x) => x.quien !== quien);
    const v = T.VOCES[quien];
    const cantor = crearCantor(this.ctx, v, this.ondas.voz, NIVEL_VOZ, this.sal.efectos, this.sal.sala, t0, t0 + largo);
    const f: Frase = { quien, texto, plan, inicio, sig: 0, cantor, anterior: null, primera: null, notas: [] };
    this.voces.set(quien, { cantor, fin: t0 + largo });
    this.cantadas.push({ quien, texto, notas: f.notas });
    if (this.cantadas.length > 24) this.cantadas.shift();
    this.agachar(t0, largo);
    // las sílabas que caen en semicorcheas que el reloj ya pasó se programan ya; las demás, cuando les toque
    this.cantarHasta(f, this.paso - 1);
    if (f.sig < plan.length) this.frases.push(f);
    return t0 - ahora + largo;
  }
  private cantarHasta(f: Frase, paso: number): void {
    while (f.sig < f.plan.length && f.inicio + f.plan[f.sig].paso <= paso) {
      const n = f.plan[f.sig];
      const p = f.inicio + n.paso;
      const a = this.acordeDelPaso(p);
      if (n.entra) f.primera = null;
      const midi = T.notaCantada(f.quien, n, a, n.entra ? null : f.anterior, f.primera);
      f.primera ??= midi;
      f.anterior = midi;
      const adornos = n.adorno === 'trino' ? [T.vecinaDelAcorde(f.quien, midi, a, 1)] : n.adorno === 'melisma' ? [T.vecinaDelAcorde(f.quien, midi, a, 1), T.vecinaDelAcorde(f.quien, midi, a, -1)] : [];
      f.notas.push({ ...n, midi, grado: T.gradoDe(midi, a), acorde: a.nombre, adornos });
      f.cantor.nota(this.tiempoDe(p), n.dur * T.SEG_PASO, midi, n.vocal, { entra: n.entra, ultima: f.sig === f.plan.length - 1 || f.plan[f.sig + 1].entra, trino: n.adorno === 'trino' ? adornos[0] : undefined, melisma: n.adorno === 'melisma' ? adornos : undefined });
      f.sig++;
    }
  }

  /** Un stinger: breve, afinado al acorde que suena en este instante. Devuelve sus notas (para la partitura). */
  stinger(id: T.StingerId, ahora = this.ctx.currentTime): T.Nota[] {
    this.tic(ahora);
    // entra en la próxima semicorchea del reloj (a lo sumo 144 ms) y con el acorde de ESA semicorchea
    const p0 = this.proximoPaso(ahora, 1);
    const acorde = this.acordeDelPaso(p0);
    const s = T.STINGERS[id];
    const notas = T.notasStinger(id, acorde);
    const medio = T.SEG_PASO / 2;
    const w = this.ondas;
    const t0 = this.tiempoDe(p0);
    this.stingersSonados.push(id);
    if (this.stingersSonados.length > 40) this.stingersSonados.shift();
    let largo = 0;
    notas.forEach((n, k) => {
      const t = t0 + n.paso * medio;
      const dur = n.dur * medio;
      largo = Math.max(largo, n.paso * medio + dur);
      const a = this.stingers;
      switch (s.timbre) {
        case 'cuerda':
          this.tono(a, t, n.midi, n.vel, w.guitarra, { ataque: 0.003, cae: Math.max(0.35, dur * 1.6) });
          this.tono(a, t, n.midi + 12, n.vel * 0.25, w.campana, { ataque: 0.003, cae: 0.3 });
          break;
        case 'campana':
          this.tono(a, t, n.midi, n.vel, w.campana, { ataque: 0.002, cae: Math.max(0.4, dur * 1.8) });
          break;
        case 'grave':
          this.tono(a, t, n.midi, n.vel * 1.1, w.grave, { ataque: 0.01, dura: dur * 0.8, suelta: 0.12 });
          this.tono(a, t, n.midi + 12, n.vel * 0.5, w.fuelle, { ataque: 0.01, dura: dur * 0.8, suelta: 0.1 });
          break;
        default: {
          const desde = s.desliza && k === notas.length - 1 ? notas[k - 1]?.midi : undefined;
          this.tono(a, t, n.midi, n.vel * 0.6, w.fuelle, { ataque: 0.02, dura: dur * 0.9, suelta: 0.1 }, { desde });
          this.tono(a, t, n.midi, n.vel * 0.4, w.fuelle, { ataque: 0.02, dura: dur * 0.9, suelta: 0.1 }, { desafina: 9, desde });
        }
      }
    });
    this.agachar(t0, largo);
    return notas;
  }
  /** La primera semicorchea que todavía no pasó y es múltiplo de `cada` (1: cualquiera; 4: la próxima negra). */
  proximoPaso(ahora: number, cada: number): number {
    let p = this.pasoAncla + Math.ceil((ahora + 0.004 - this.t0) / T.SEG_PASO);
    if (this.tiempoDe(p) < ahora) p++;
    return Math.ceil(p / cada) * cada;
  }

  /**
   * El remate de la caída de un Rey: en vez de un silencio, una cadencia cuantizada a la próxima negra. La dominante
   * (La7 con su novena menor) golpea una negra y cae en la tónica (Re menor; `mayor`: Re mayor, la tercera de
   * Picardía de la victoria final), que queda sonando tres negras mientras la música de abajo se agacha 16 dB y vuelve
   * sola. Lo que se cante mientras tanto (las últimas palabras del Rey) se afina a estos dos acordes.
   * Devuelve cuántos segundos faltan para que termine.
   */
  rematar(mayor = false, ahora = this.ctx.currentTime): number {
    this.tic(ahora);
    const pV = this.proximoPaso(ahora, 4);
    const pI = pV + REMATE.pasosV;
    const fin = pI + REMATE.pasosI;
    const tonica = T.tonicaDe(this.aplicado);
    const V = T.acordeDeGrado('V', tonica);
    const I = T.acordeDeGrado(mayor ? 'I' : 'i', tonica);
    this.forzados = [...this.forzados.filter((f) => f.hasta > this.paso - T.PASOS), { desde: pV, hasta: pI, acorde: V }, { desde: pI, hasta: fin, acorde: I }];
    const tV = this.tiempoDe(pV);
    const tI = this.tiempoDe(pI);
    const a = this.remates;
    const w = this.ondas;
    // la dominante: el bajo en La, el parche, el acorde rasgueado hacia arriba y la sensible en el fuelle
    this.tono(a, tV, T.desde(V.raiz, 33), 0.9, w.grave, { ataque: 0.008, cae: 0.5 });
    this.tono(a, tV, 31, 0.8, w.grave, { ataque: 0.004, cae: 0.22 });
    [0, 1, 2, 3, 4].forEach((g, k) => this.tono(a, tV + k * 0.018, T.desde(V.tonos[g], 57 + (k > 2 ? 7 : 0)), 0.5, w.guitarra, { ataque: 0.004, cae: 0.55 }));
    this.tono(a, tV, T.desde(V.tonos[1], 69), 0.3, w.fuelle, { ataque: 0.02, dura: (REMATE.pasosV - 0.5) * T.SEG_PASO, suelta: 0.06 });
    // la tónica: el bajo una octava abajo, el parche, el acorde sostenido y la campana arriba
    const durI = REMATE.pasosI * T.SEG_PASO;
    this.tono(a, tI, T.desde(I.raiz, 26), 1, w.grave, { ataque: 0.008, cae: durI * 1.1 });
    this.tono(a, tI, 28, 0.9, w.grave, { ataque: 0.004, cae: 0.3 });
    for (const g of [0, 1, 2]) {
      this.tono(a, tI, T.desde(I.tonos[g], 57), 0.3, w.cuerda, { ataque: 0.03, dura: durI * 0.8, suelta: 0.9 }, { desafina: g * 4 - 4 });
      this.tono(a, tI + g * 0.02, T.desde(I.tonos[g], 62), 0.45, w.guitarra, { ataque: 0.004, cae: 1.1 });
    }
    this.tono(a, tI, T.desde(I.raiz, 74), 0.35, w.campana, { ataque: 0.003, cae: 1.4 });
    // la música de abajo se agacha y vuelve cuando la tónica ya se va
    if (this.abierta) {
      const g = this.volumen.gain;
      const t = Math.max(ahora, tV - 0.03);
      g.cancelScheduledValues(t);
      g.setTargetAtTime(VOLUMEN * REMATE.agache, t, 0.03);
      g.setTargetAtTime(VOLUMEN, tI + durI * 0.6, 0.3);
    }
    return this.tiempoDe(fin) - ahora;
  }
}
