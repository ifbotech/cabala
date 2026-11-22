// El director de escena: una sola cola para todo lo que vuela sobre la mesa (el número del daño, el canto grande, el
// cartel de la segunda cara, el rótulo del Rey, los bocadillos, el grito del Personaje, los «+N» de la bandeja). Cada
// capa pide una zona y una ventana de tiempo; si choca con lo que ya está en el aire, cambia de carril (la siguiente
// zona que propone) o espera su turno (150–250 ms). El número gana sobre el texto: un texto nunca se le pone encima,
// y el número solo se aparta de otro número. Hay zonas prohibidas para todos: los sellos del enemigo (INMUNE, ATURDIDO),
// el total de la cuenta y la Vida y el Escudo propios.
//
// Las cajas van en píxeles de pantalla. Lo que se dibuja en el lienzo (los números) da su caja viva por cuadro; lo
// que es HTML (el canto, el cartel, los bocadillos) da la de su elemento. La QA lee `window.__director` y mide, cuadro
// a cuadro, que nada de lo que está en el aire se pise ni pise una zona prohibida.

export interface Caja {
  x: number;
  y: number;
  w: number;
  h: number;
}
export type CapaEscena = 'numero' | 'canto' | 'cartel' | 'rotulo' | 'sello' | 'bocadillo' | 'grito';

/** Cuánto pesa cada capa: la de más peso no se aparta de la de menos (el número gana sobre el texto). */
const PESO: Record<CapaEscena, number> = { numero: 3, canto: 2, cartel: 2, rotulo: 2, sello: 2, bocadillo: 1, grito: 1 };

/** Lo que nada de lo que vuela puede tapar. */
export const ZONAS_PROHIBIDAS =
  '#app .mesa .e-sellos > *, #app [data-cuenta] .cuenta:not(.reposo) [data-total], #app [data-hud-vida] .valor, #app [data-hud-escudo] .valor, ' +
  // (0.21: tampoco los botones de la mesa que se pueden tocar —con el golpe en el aire están apagados, como para el
  // grito—, la bandeja de Amuletos y la de Chiches y la cifra del TE PEGA)
  '#app .mesa .botones .btn:not(:disabled), #app .mesa .hud-tiras, #app .mesa .chiches, #app .mesa .e-ataque .e-golpe';

interface Turno {
  id: number;
  capa: CapaEscena;
  desde: number;
  hasta: number;
  /** La caja que ocupa en todo su recorrido (para decidir dónde va lo que viene). */
  sobre: Caja;
  /** La caja de ahora mismo (la que mide la QA), o null si ya no se ve. */
  viva: () => Caja | null;
  /** Qué hace si algo que pesa más le cae encima: se corre a otro lugar libre o se apaga. */
  ceder?: () => void;
  /** (0.22) De quién es: lo que vuela no puede alejarse más de `max` píxeles de esa caja (el «−N» de tu VIDA). */
  ancla?: Ancla;
}
export interface Ancla {
  caja: Caja;
  max: number;
  que: string;
}
/** El hueco entre dos cajas (0 si se tocan o se pisan). */
export const hueco = (a: Caja, b: Caja): number => Math.round(Math.hypot(Math.max(0, b.x - (a.x + a.w), a.x - (b.x + b.w)), Math.max(0, b.y - (a.y + a.h), a.y - (b.y + b.h))));

/** Una caja agrandada `m` píxeles por lado (las zonas prohibidas se miden con aire: lo que entra escalando crece). */
const inflar = (c: Caja, m: number): Caja => ({ x: c.x - m, y: c.y - m, w: c.w + 2 * m, h: c.h + 2 * m });

let ultimo = 0;
const turnos: Turno[] = [];

const ahora = (): number => performance.now();
function purgar(): void {
  const t = ahora();
  for (let i = turnos.length - 1; i >= 0; i--) if (turnos[i].hasta <= t) turnos.splice(i, 1);
}
/** Lo que se pisan dos cajas (en píxeles cuadrados; 0 si apenas se rozan). */
export function pisan(a: Caja, b: Caja, holgura = 2): number {
  const ix = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const iy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return ix > holgura && iy > holgura ? ix * iy : 0;
}
const deRect = (r: DOMRect): Caja => ({ x: r.left, y: r.top, w: r.width, h: r.height });

/** Las cajas de las zonas prohibidas, a la vista ahora. */
export function prohibidas(): Caja[] {
  if (typeof document === 'undefined') return [];
  return [...document.querySelectorAll<HTMLElement>(ZONAS_PROHIBIDAS)]
    .map((el) => el.getBoundingClientRect())
    .filter((r) => r.width > 1 && r.height > 1)
    .map(deRect);
}

/** Una caja metida dentro de la pantalla (con un margen). */
export function dentro(c: Caja, m = 4): Caja {
  const W = typeof innerWidth === 'number' ? innerWidth : 1280;
  const H = typeof innerHeight === 'number' ? innerHeight : 800;
  return { ...c, x: Math.max(m, Math.min(W - c.w - m, c.x)), y: Math.max(m, Math.min(H - c.h - m, c.y)) };
}

export interface Pedido {
  /** La zona elegida (una de las candidatas). */
  caja: Caja;
  /** Cuántos milisegundos espera su turno. */
  demora: number;
  /** Cuál de las candidatas fue. */
  i: number;
  /** El turno reservado (para soltarlo o para darle su caja viva). */
  id: number;
}

/**
 * Pide lugar para una capa: prueba sus zonas candidatas en orden, primero sin pisar nada de lo que está en el aire,
 * después sin pisar nada que pese lo mismo o más, y después esperando su turno (150 y 250 ms). Si nada sirve, va a
 * la que menos pisa. Lo prohibido no se pisa nunca si hay otra salida.
 */
export function pedir(capa: CapaEscena, candidatas: Caja[], ms: number, o: { esperaMax?: number; viva?: () => Caja | null; ancla?: Ancla } = {}): Pedido {
  purgar();
  const t = ahora();
  const prohib = prohibidas();
  const peso = PESO[capa];
  const esperas = [0, 150, 250].filter((d) => d <= (o.esperaMax ?? 250));
  const choca = (c: Caja, demora: number, estricto: boolean): number => {
    let a = 0;
    for (const z of prohib) a += pisan(c, inflar(z, 10)) * 1e6;
    // (lo que tiene dueño no se va lejos de él: alejarse pesa casi como pisar lo prohibido)
    if (o.ancla && hueco(c, o.ancla.caja) > o.ancla.max) a += 5e5;
    for (const x of turnos) {
      if (x.hasta <= t + demora || x.desde >= t + demora + ms) continue;
      if (!estricto && PESO[x.capa] < peso) continue;
      a += pisan(c, x.sobre);
    }
    return a;
  };
  const elegir = (i: number, demora: number): Pedido => {
    const id = reservar(capa, candidatas[i], ms, o.viva, demora);
    if (o.ancla) {
      const x = turnos.find((u) => u.id === id);
      if (x) x.ancla = o.ancla;
    }
    // lo que pesa menos y queda debajo se corre (o se apaga): el número no se tapa con un bocadillo
    for (const x of [...turnos]) {
      if (x.id === id || !x.ceder || PESO[x.capa] >= peso) continue;
      if (x.hasta <= t + demora || x.desde >= t + demora + ms) continue;
      if (pisan(candidatas[i], x.sobre)) x.ceder();
    }
    return { caja: candidatas[i], demora, i, id };
  };
  for (const demora of esperas) {
    // (el número no espera: si no hay lugar libre, va a su carril aunque pise un texto, que pesa menos)
    if (demora > 0 && capa === 'numero') continue;
    for (let i = 0; i < candidatas.length; i++) if (choca(candidatas[i], demora, true) === 0) return elegir(i, demora);
    // sin lugar del todo libre: de las que no pisan nada que pese lo mismo o más, la que menos pisa lo liviano
    let mejor = -1;
    let menos = Infinity;
    for (let i = 0; i < candidatas.length; i++) {
      if (choca(candidatas[i], demora, false) !== 0) continue;
      const a = choca(candidatas[i], demora, true);
      if (a < menos) {
        menos = a;
        mejor = i;
      }
    }
    if (mejor >= 0) return elegir(mejor, demora);
  }
  let mejor = 0;
  let menos = Infinity;
  for (let i = 0; i < candidatas.length; i++) {
    const a = choca(candidatas[i], 0, false);
    if (a < menos) {
      menos = a;
      mejor = i;
    }
  }
  return elegir(mejor, 0);
}

/** Reserva una zona sin preguntar (la ocupa algo que ya decidió dónde va). Devuelve el turno. */
export function reservar(capa: CapaEscena, sobre: Caja, ms: number, viva?: () => Caja | null, demora = 0): number {
  const t = ahora();
  const id = ++ultimo;
  turnos.push({ id, capa, desde: t + demora, hasta: t + demora + ms, sobre, viva: viva ?? (() => sobre) });
  return id;
}
/** Cambia la caja viva de un turno (la de un elemento que recién se montó). */
export function darVida(id: number, viva: () => Caja | null): void {
  const x = turnos.find((u) => u.id === id);
  if (x) x.viva = viva;
}
/** Qué hace un turno si algo que pesa más le cae encima (por ejemplo, esconderse hasta que pase). */
export function alCeder(id: number, fn: () => void): void {
  const x = turnos.find((u) => u.id === id);
  if (x) x.ceder = fn;
}
/** Suelta un turno antes de tiempo (lo que se apagó o se fue). */
export function soltar(id: number | null | undefined): void {
  const i = turnos.findIndex((u) => u.id === id);
  if (i >= 0) turnos.splice(i, 1);
}
/** Se olvida de todo (al cambiar de pantalla). */
export function vaciar(): void {
  turnos.length = 0;
}

/** La caja viva de un elemento HTML: null si ya no está o casi no se ve (entra o sale fundido). */
export function cajaDe(el: Element): () => Caja | null {
  return () => {
    if (!el.isConnected) return null;
    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none' || Number(s.opacity) < 0.35) return null;
    const r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1 ? deRect(r) : null;
  };
}

/**
 * Ubica un elemento HTML que vuela (fijo o absoluto): prueba cada `alternativa` (cada una le pone su lugar), mide su
 * caja y se queda con la primera que no pisa nada (con lo de `pedir`). Si espera turno, el elemento sale con esa demora.
 * `crece` agranda la caja medida (lo que la animación lo estira).
 */
export function ubicar(el: HTMLElement, capa: CapaEscena, ms: number, alternativas: (() => void)[], crece = 1): Pedido {
  const vis = el.style.visibility;
  const medir = (): Caja[] =>
    alternativas.map((pon) => {
      pon();
      const r = el.getBoundingClientRect();
      const w = r.width * crece;
      const h = r.height * crece;
      return { x: r.left + r.width / 2 - w / 2, y: r.top + r.height / 2 - h / 2, w, h };
    });
  const anim = el.style.animation;
  // se mide quieto, a su tamaño (la animación de entrada lo agranda o lo corre)
  el.style.visibility = 'hidden';
  el.style.animation = 'none';
  const cajas = medir();
  const pd = pedir(capa, cajas, ms);
  alternativas[pd.i]();
  el.style.visibility = vis;
  el.style.animation = anim;
  if (pd.demora > 0) el.style.animationDelay = `${pd.demora}ms`;
  darVida(pd.id, cajaDe(el));
  const fin = ahora() + pd.demora + ms;
  // si después le cae encima algo que pesa más, se corre a otra de sus alternativas libre; si no hay, se apaga
  const cedible = (id: number): void => {
    const x = turnos.find((u) => u.id === id);
    if (!x) return;
    x.ceder = () => {
      soltar(id);
      const resta = fin - ahora();
      if (resta <= 0 || !el.isConnected) return;
      el.style.visibility = 'hidden';
      const cs = medir();
      const i = libreEn(cs, resta);
      if (i < 0) return;
      alternativas[i]();
      el.style.visibility = vis;
      const nuevo = reservar(capa, cs[i], resta, cajaDe(el));
      cedible(nuevo);
    };
  };
  cedible(pd.id);
  return pd;
}

/** La primera caja que no pisa nada de lo que está en el aire ni lo prohibido (o −1). */
function libreEn(cajas: Caja[], ms: number): number {
  purgar();
  const t = ahora();
  const prohib = prohibidas().map((z) => inflar(z, 10));
  return cajas.findIndex((c) => !prohib.some((z) => pisan(c, z)) && !turnos.some((x) => x.hasta > t && x.desde < t + ms && pisan(c, x.sobre)));
}

/** Las zonas que tiene tomadas lo que está en el aire (o por salir), salvo el turno `menos`: para quien se ubica solo. */
export function tomadas(menos?: number): Caja[] {
  purgar();
  return turnos.filter((x) => x.id !== menos).map((x) => x.sobre);
}

/** Lo que está en el aire ahora mismo, con su caja viva (para la QA). */
export function enElAire(): { id: number; capa: CapaEscena; caja: Caja }[] {
  purgar();
  const t = ahora();
  const out: { id: number; capa: CapaEscena; caja: Caja }[] = [];
  for (const x of turnos) {
    if (x.desde > t) continue;
    const c = x.viva();
    if (c) out.push({ id: x.id, capa: x.capa, caja: c });
  }
  return out;
}

/**
 * Los solapes de ahora mismo (para la QA en movimiento): capas que se pisan entre sí, o que pisan una zona prohibida.
 * Dos números de la misma ráfaga que se cruzan un instante también cuentan.
 */
export function solapes(): string[] {
  const xs = enElAire();
  const prohib = prohibidas();
  const malos: string[] = [];
  const fmt = (c: Caja): string => `${Math.round(c.x)},${Math.round(c.y)} ${Math.round(c.w)}×${Math.round(c.h)}`;
  for (let i = 0; i < xs.length; i++) {
    for (let j = i + 1; j < xs.length; j++) if (pisan(xs[i].caja, xs[j].caja, 3)) malos.push(`${xs[i].capa} (${fmt(xs[i].caja)}) pisa ${xs[j].capa} (${fmt(xs[j].caja)})`);
    for (const z of prohib) if (pisan(xs[i].caja, z, 3)) malos.push(`${xs[i].capa} (${fmt(xs[i].caja)}) pisa una zona prohibida (${fmt(z)})`);
  }
  // (0.22) lo que tiene dueño, cerca de su dueño: el «−N» que te pegan, a no más de su tope de tu VIDA
  for (const x of turnos) {
    if (!x.ancla || x.desde > ahora()) continue;
    const c = x.viva();
    const d = c ? hueco(c, x.ancla.caja) : 0;
    if (c && d > x.ancla.max + 4) malos.push(`${x.capa} (${fmt(c)}) queda a ${d} px de ${x.ancla.que} (máximo ${x.ancla.max})`);
  }
  return malos;
}

if (typeof window !== 'undefined') (window as unknown as { __director?: unknown }).__director = { enElAire, solapes, prohibidas };
