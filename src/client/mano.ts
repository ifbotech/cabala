// La mano y el paño (0.21.0). Abajo, la mano: una fila respirada de naipes grandes con física de resorte; cada carta
// flota con su propio desfase y se inclina hacia el cursor. Arriba, sobre el paño, las Postas: de 3 a 5 lugares donde
// se apoyan los naipes elegidos (nunca quedan en la mano). La Posta del Medio pega doble; un Comodín le pasa su
// Chispa al naipe de su derecha, y tres o más en orden creciente arman Escalón. Se elige con clic, toque, teclado o
// mando; una carta (o el grupo apoyado) se ARRASTRA sobre el enemigo para golpear, al descarte para descartar o a otra
// Posta para cambiarla de lugar. LB / RB (o Q / W) corren de Posta la carta con foco.
// Con el dedo, el grupo va levantado por encima de la yema (no la tapa ni tapa al enemigo), cada zona avisa con una
// vibración corta y un gesto que el sistema cancela devuelve las cartas a su lugar sin jugar nada.
import type { Carta } from '../rules/cartas';
import { medioDe, postasPorDefecto } from '../rules/combate';
import { t, tx } from './almacen';
import { quieto as todoQuieto } from './ritmo';
import { cifra, pxHud, pxNaipe } from './sprites';
import { MUTACION_DESC, MUTACION_NOMBRE, PASO_NOMBRE } from './textos';
import { esc, tip } from './ui';
import { glifo } from './nav';
import { B } from '../rules/balance';
import type { HudPx } from './pixel/iconos';

/** El sello de cada mutación de la Forja Brava en el canto del naipe. */
export const MUTACION_PX: Record<'doblefilo' | 'roba' | 'oro', HudPx> = { doblefilo: 'doblefilo', roba: 'roba', oro: 'chispaOro' };

export type Zona = 'enemigo' | 'descarte';

export interface OyenteMano {
  /** Cambió la selección (o el lugar de una carta en el paño). */
  alCambiar: (ids: string[]) => void;
  /** Se soltó un arrastre sobre una zona (o en ninguna). */
  alSoltar: (zona: Zona | null, ids: string[]) => void;
  /** Mientras se arrastra: sobre qué zona está el grupo (para encender su halo). */
  alApuntar: (zona: Zona | null, ids: string[]) => void;
  /** Las cajas de las zonas donde se puede soltar. */
  zonas: () => Partial<Record<Zona, DOMRect>>;
  /** La mejor disposición de esas cartas en el paño (sus Postas, mismo orden), o null: la mesa acomoda sola. */
  acomodar?: (ids: string[]) => number[] | null;
}

interface Naipe {
  carta: Carta;
  el: HTMLButtonElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Inclinación actual y a la que tiende (grados). */
  rot: number;
  /** Escala actual (1 en la mano; el grupo que se arrastra con el dedo va más chico). */
  esc: number;
  elegida: boolean;
  /** Milisegundos que le faltan para empezar a moverse (el reparto escalonado). */
  espera: number;
  /** Si está volando hacia un punto fijo de la pantalla (al golpear). */
  vuela: { x: number; y: number } | null;
}

/** Lo que el paño marca según la cuenta: dónde salta una Chispa (entre la Posta i y la i+1) y si hay Escalón. */
export interface MarcasPano {
  chispas: number[];
  escalon: number;
}

export interface Mano {
  /** Pone la mano: las cartas nuevas entran volando desde `desde` (el Mazo). */
  poner(cartas: readonly Carta[], desde?: { x: number; y: number }): void;
  /** Las elegidas, de izquierda a derecha en el paño. */
  seleccion(): string[];
  /** En qué Posta está cada carta (−1 si está en la mano). */
  postaDe(id: string): number;
  /** Elige esas cartas; con `postas`, cada una en la suya (mismo orden que `ids`). */
  elegir(ids: readonly string[], postas?: readonly number[]): void;
  /** Corre de Posta una carta elegida (−1 a la izquierda, +1 a la derecha); si la otra está ocupada, se cambian. */
  correr(id: string, dir: -1 | 1): boolean;
  /** Las marcas del paño (Chispa y Escalón) que dice la cuenta. */
  marcar(m: MarcasPano): void;
  /**
   * (0.24) El dial del paño (DEJALO JUSTO ↔ PEGÁ CON TODO) a la derecha de los naipes apoyados, si entra. Devuelve si
   * entró; si no, la cuenta lo lleva en su propio renglón. Con `''` se va.
   */
  dial(html: string): boolean;
  /** Las cartas elegidas vuelan a un punto y desaparecen (el golpe). */
  volar(ids: readonly string[], a: { x: number; y: number }): Promise<void>;
  /** Sacude las cartas elegidas (jugada que no vale). */
  negar(): void;
  bloquear(si: boolean): void;
  /** Deja un grupo «en el aire» sobre un punto (para la captura de la QA). */
  posar(ids: readonly string[], x: number, y: number): void;
  /** Deja una carta del paño a medio camino hacia otra Posta (para la captura de la QA). */
  arrastrarA(id: string, posta: number): void;
  destruir(): void;
}

/** Con el dedo, cuánto sube el centro del grupo arrastrado por encima de la yema (px). */
const ALZA = 70;
/** Con el dedo, lo que tiene que subir la yema para que las cartas que lleva encima apunten al enemigo (px). */
const SUBIDA = 40;
/** Lo que tiene que quedar tocable de cada carta de la fila de atrás (px). */
const DIANA = 48;
/** Lo que tiene que moverse el puntero para que un toque pase a ser un arrastre (px): el dedo resbala más que el ratón. */
const UMBRAL = 8;
const UMBRAL_DEDO = 14;
/** Un arrastre que no se alejó más que esto de donde empezó y se suelta en ninguna zona fue un toque que resbaló (px). */
const RESBALON = 30;
/** Con el dedo, el tamaño del grupo que va en el aire: más chico, deja ver al enemigo y la cuenta. */
const ESCALA_DEDO = 0.8;
/**
 * Las capas de la mesa de cartas: el fieltro del paño, la mano, la que pasa el cursor, los naipes apoyados en las
 * Postas (0.21: por ENCIMA de la mano: lo que jugás se ve entero), sus marcas y la carta con el foco.
 */
const Z = { pano: 1, mano: 10, cerca: 30, posta: 50, marca: 65, foco: 90 } as const;

/** Una vibración corta (solo con el dedo, si el aparato vibra y no se pidió «Reducir movimiento»). */
function vibrar(): void {
  if (todoQuieto()) return;
  const nav = navigator as Navigator & { userActivation?: { hasBeenActive: boolean } };
  // sin un toque previo el navegador la bloquea (y lo anota en la consola): no se pide
  if (nav.userActivation && !nav.userActivation.hasBeenActive) return;
  try {
    nav.vibrate?.(8);
  } catch {
    // sin vibración: nada que hacer
  }
}

const orden = (a: Carta, b: Carta) => Number(a.palo === 'X') - Number(b.palo === 'X') || a.n - b.n || 'SCDH'.indexOf(a.palo) - 'SCDH'.indexOf(b.palo) || a.id.localeCompare(b.id);

export function crearMano(raiz: HTMLElement, oye: OyenteMano, nPostas = 3): Mano {
  let naipes: Naipe[] = [];
  let bloqueada = false;
  let viva = true;
  /** Qué carta está en cada Posta del paño (null: vacía). */
  const enPosta: (string | null)[] = new Array(nPostas).fill(null);
  const medio = medioDe(nPostas);
  /** El orden en que se llenan las Postas si no se elige dónde: el Medio y después a los costados. */
  const ordenLlenado = postasPorDefecto(nPostas, nPostas);
  let marcas: MarcasPano = { chispas: [], escalon: 0 };
  /** `alza`: lo que el centro del grupo va por encima del dedo (0 con ratón o lápiz); crece al alejarse de donde se tomó. */
  /** `previa`: lo elegido antes de empezar (un arrastre que no llega a ninguna zona lo deja como estaba); `lejos`: lo más que se alejó de donde empezó. */
  /** `origen`: la carta que se tomó; `posta`: la Posta del paño sobre la que está (para cambiarla de lugar). */
  let arrastre: {
    ids: string[];
    dx: number;
    dy: number;
    x: number;
    y: number;
    zona: Zona | null;
    tactil: boolean;
    alza: number;
    previa: (string | null)[];
    lejos: number;
    origen: string;
    posta: number;
  } | null = null;
  /** Lo más que llegó a tener la mano: con eso se decide si va en dos filas (no cambia de alto en mitad de un turno). */
  let tope = 0;
  let presion: { id: string; x: number; y: number; puntero: number } | null = null;
  let cursor: { x: number; y: number } | null = null;
  let ultimo = performance.now();
  let posado: { ids: string[]; x: number; y: number } | null = null;
  /** La pose de la QA: una carta del paño a medio camino hacia otra Posta. */
  let haciaPosta: { id: string; posta: number } | null = null;

  // ── el paño (0.22): una fila PROPIA arriba de la mano, de fieltro forjado, que solo aparece cuando hay algo apoyado.
  // Lo jugado y lo que queda en la mano son dos lugares distintos: la mano nunca entra en el rectángulo del paño (con
  // naipes apoyados, la fila de la mano baja y su pie queda tras el HUD o la barra del pulgar). En reposo, en el aire
  // que queda arriba de la mano, un solo renglón tenue con la regla («Medio: pega doble · 3 en subida: Escalón»).
  const pano = document.createElement('div');
  pano.className = 'pano-postas';
  pano.setAttribute('aria-hidden', 'true');
  raiz.append(pano);
  const regla = document.createElement('span');
  regla.className = 'pano-regla';
  regla.innerHTML = `<span class="p-linea">${pxHud('medio', 'p-icono')}<b>${esc(t('postaMedioAyuda'))}</b></span><i class="p-sep">·</i><span class="p-linea p-esc">${pxHud('escalon', 'p-icono')}<b class="p-largo">${esc(t('panoEscalon', { n: B.postas.escalon }))}</b><b class="p-corto">${esc(`${tx(PASO_NOMBRE['posta:escalon'])} +${B.postas.escalon}`)}</b></span><span class="p-linea p-mando">${glifo('LB', 'Q')}${glifo('RB', 'W')}<b>${esc(t('pistaCorre'))}</b></span><span class="p-linea p-mando p-dial">${glifo('Y', 'X')}<b>${esc(t('pistaJusto'))}</b></span>`;
  raiz.append(regla);
  const slots = enPosta.map((_, i) => {
    const el = document.createElement('div');
    el.className = `posta${i === medio ? ' p-medio' : ''}`;
    el.dataset.posta = String(i);
    // (su ayuda de verdad: al pasar el cursor o tocar la Posta vacía, qué hace el paño; adentro, solo el símbolo del Medio)
    el.innerHTML = `<span class="p-rot" ${tip(i === medio ? t('postaMedioAyuda') : t('panoEscalon', { n: B.postas.escalon }), t('postaTip'))}>${i === medio ? pxHud('medio', 'p-icono') : ''}</span>`;
    pano.append(el);
    return el;
  });
  // la marca del Medio sobre el naipe que se apoya ahí (va encima de su naipe y debajo de la mano)
  const marcaMedio = document.createElement('span');
  marcaMedio.className = 'posta-marca';
  marcaMedio.setAttribute('aria-hidden', 'true');
  marcaMedio.innerHTML = `${cifra('x2', 'oro')}<b class="p-marca-txt">${esc(t('postaMedio'))}</b>`;
  raiz.append(marcaMedio);
  let anchoMarca = { visible: -1, w: 0 };
  const chispas = enPosta.slice(1).map(() => {
    const el = document.createElement('span');
    el.className = 'posta-chispa';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = pxHud('chispa');
    raiz.append(el);
    return el;
  });
  const rotEscalon = document.createElement('span');
  rotEscalon.className = 'posta-escalon chip canto';
  rotEscalon.setAttribute('role', 'status');
  raiz.append(rotEscalon);
  // (0.24) el dial: una acción con su verbo y su premio, al costado derecho de lo apoyado (lo que reacomoda)
  const dialEl = document.createElement('div');
  dialEl.className = 'pano-dial';
  dialEl.hidden = true;
  raiz.append(dialEl);
  let dialAlto = 0;

  let cacheMedidas: { w: number; h: number; k: number; kp: number; tapa: number; clave: string } | null = null;
  const medidas = () => {
    // (se lee el estilo una vez por tamaño de ventana: es lo más caro del cuadro)
    const clave = `${innerWidth}x${innerHeight}|${raiz.className}`;
    if (cacheMedidas?.clave === clave) return cacheMedidas;
    const s = getComputedStyle(raiz);
    const k = Number(s.getPropertyValue('--k-naipe')) || 1;
    // el paño va a escala entera más chica que la mano (a 2×, los naipes apoyados van a 1×): así entra arriba de ella
    let kp = k >= 2 ? Math.floor(k / 2) : 1;
    // (0.23) en el teléfono, si las Postas no entran lado a lado, el paño achica sus naipes hasta que entren: ninguno
    // se monta sobre su vecino ni queda cortado
    if (innerWidth <= 700 && nPostas > 1 && raiz.clientWidth > 0) {
      const cabe = (raiz.clientWidth - 8 - 6 * (nPostas - 1)) / (100 * nPostas);
      if (cabe < kp) kp = Math.max(0.5, Math.floor(cabe * 20) / 20);
    }
    raiz.style.setProperty('--k-pano', String(kp));
    // lo que tapa la barra del pulgar al pie de la mano (el margen negativo del teléfono)
    const tapa = Math.max(0, -parseFloat(s.marginBottom) || 0);
    cacheMedidas = { w: 100 * k, h: 140 * k, k, kp, tapa, clave };
    return cacheMedidas;
  };
  /** ¿Entran `n` cartas en una fila sin montarse de más? (si no, el móvil las pone en dos filas y la mano pide más alto) */
  const pideDosFilas = (n: number): boolean => {
    const { w, k } = medidas();
    return innerWidth <= 700 && n > 1 && raiz.clientWidth > 0 && Math.min(w + Math.round(6 * k), (raiz.clientWidth - w) / (n - 1)) < w * 0.8;
  };

  /**
   * La fila del paño: dónde va cada Posta (la esquina de arriba a la izquierda de su naipe, a la escala del paño), el
   * paso entre una y otra, lo que se ve de cada naipe apoyado (`hv`: entero salvo en el teléfono más bajo), el aire de
   * los peldaños del Escalón (`subida`), dónde termina el paño (`fin`) y dónde arranca la mano cuando hay algo apoyado.
   */
  function lugaresPosta(): { xs: number[]; y: number; paso: number; wp: number; hp: number; hv: number; subida: number; fin: number; manoY: number } {
    const { k, kp, tapa } = medidas();
    const wp = 100 * kp;
    const hp = 140 * kp;
    const ancho = raiz.clientWidth;
    const alto = raiz.clientHeight;
    const hueco = Math.round(6 * kp);
    const paso = nPostas > 1 ? Math.min(wp + hueco, (ancho - wp - 8) / (nPostas - 1)) : 0;
    const total = nPostas > 1 ? paso * (nPostas - 1) + wp : wp;
    const x0 = Math.round((ancho - total) / 2);
    const borde = 4;
    // el aire del Escalón: los peldaños suben 14 px cada uno (en el teléfono, 8) y nunca sacan nada de cuadro
    // (en el teléfono, el aire de los peldaños solo se abre con el Escalón armado: el alto es oro)
    const subida = k >= 2 ? 28 : marcas.escalon ? 16 : 0;
    // lo que tiene que verse de la mano cuando baja (la parte de arriba de cada naipe: su índice y sus primeras pintas)
    // (0.24: la mano de 8 del teléfono sigue en sus dos filas con algo apoyado: de la de atrás asoma su franja y de la
    // de adelante, su índice y sus primeras pintas; el paño enseña lo de arriba de cada naipe)
    // (0.25: con algo apoyado, lo que queda de la mano de 8 entra en UNA fila: ningún naipe flota solo en la de atrás)
    const minMano = k >= 2 ? 120 : raiz.classList.contains('dos-filas') && !(enPosta.some(Boolean) && entraEnFila(naipes.filter((c) => !c.elegida).length)) ? DIANA - 2 + 60 : 60;
    const aire = k >= 2 ? 10 : 6;
    // (en el teléfono, si no hay alto, del naipe apoyado se ve lo de arriba: su índice y su primera pinta)
    const hv = Math.max(Math.round(hp * (k >= 2 ? 0.6 : 0.4)), Math.min(hp, alto - tapa - minMano - aire - 2 * borde - subida));
    const y = borde + subida;
    const fin = y + hv + borde;
    return { xs: enPosta.map((_, i) => Math.round(x0 + i * paso)), y, paso, wp, hp, hv, subida, fin, manoY: fin + aire };
  }

  /** Dónde descansa cada carta: las elegidas en su Posta; las demás, en una fila centrada (o en dos, en el móvil). */
  function destinos(): Map<string, { x: number; y: number }> {
    const { w, h, k } = medidas();
    const ancho = raiz.clientWidth;
    const alto = raiz.clientHeight;
    const out = new Map<string, { x: number; y: number }>();
    const lp = lugaresPosta();
    // el Escalón se ve: cada naipe de la escalera sube un peldaño más que el de su izquierda (14 px; con 4 o 5
    // naipes, lo que dé el aire del paño)
    let peldano = 0;
    const nEsc = enPosta.filter(Boolean).length;
    const escalon = nEsc > 1 ? Math.min(lp.subida / 2, lp.subida / (nEsc - 1)) : 0;
    const ponerPostas = (): void =>
      enPosta.forEach((id, i) => {
        if (!id) return;
        const sube = marcas.escalon ? Math.round(peldano++ * escalon) : 0;
        out.set(id, { x: lp.xs[i], y: lp.y - sube });
      });
    const enMano = naipes.filter((c) => !c.elegida);
    const n = enMano.length;
    const hueco = Math.round(6 * k);
    // con algo apoyado, la fila de la mano baja bajo el paño (su pie queda tras el HUD o la barra del pulgar)
    // (0.23) en el teléfono el paño ocupa siempre su lugar (apagado si está vacío): la mano no salta bajo el pulgar
    const conPano = reservaPano();
    // (0.25) en el teléfono, sin nada apoyado, la mano va entera a la vista (su pie, sobre la barra del pulgar)
    const { tapa } = medidas();
    const base = conPano ? Math.max(alto - h, lp.manoY) : innerWidth <= 700 ? Math.max(0, alto - tapa - h) : alto - h;
    const foco = document.activeElement;
    /**
     * Una fila centrada. Si una carta tiene el foco y se monta sobre su vecina, la fila le abre lugar: la enfocada se
     * ve entera y las demás se aprietan (cada una conserva su índice a la vista).
     */
    const fila = (cartas: Naipe[], y: number): void => {
      const cuantas = cartas.length;
      const pasoN = cuantas > 1 ? Math.min(w + hueco, (ancho - w) / (cuantas - 1)) : 0;
      const fi = cartas.findIndex((c) => c.el === foco);
      const gaps: number[] = new Array(Math.max(0, cuantas - 1)).fill(pasoN);
      if (fi >= 0 && fi < cuantas - 1 && pasoN < w + hueco - 1 && !arrastre) {
        // (con el dedo, ninguna vecina queda con menos de 44 px tocables)
        const minimo = Math.max(Math.round(26 * k), dedo() ? 44 : 0);
        let abre = w + hueco;
        let resto = cuantas > 2 ? (ancho - w - abre) / (cuantas - 2) : 0;
        if (cuantas > 2 && resto < minimo) {
          resto = Math.min(pasoN, minimo);
          abre = Math.max(pasoN, ancho - w - resto * (cuantas - 2));
        }
        for (let j = 0; j < gaps.length; j++) gaps[j] = j === fi ? abre : resto;
      }
      const total = w + gaps.reduce((a, b) => a + b, 0);
      let x = (ancho - total) / 2;
      cartas.forEach((c, j) => {
        out.set(c.carta.id, { x: Math.round(x), y });
        x += gaps[j] ?? 0;
      });
    };
    // si en una fila las cartas se montarían mucho (el móvil) y hay alto, van en dos filas: de la de atrás asoma la
    // parte de arriba de cada naipe (su número y sus primeras pintas) y ninguna tapa de costado a otra. Con naipes en
    // el paño (que va encima de la mano), las dos filas bajan juntas bajo el paño (0.24: elegir no cambia de filas).
    // Cada naipe conserva su lugar en su fila (el que subió al paño deja su hueco): nadie salta de una fila a la otra
    const N = naipes.length;
    const pasoTodas = N > 1 ? Math.min(w + hueco, (ancho - w) / (N - 1)) : 0;
    // (0.25) con algo apoyado, si lo que queda entra en una fila (con 44 px tocables cada uno), va en una: en el teléfono
    // la mano de 8 ya no deja un naipe solo flotando en la fila de atrás
    const unaFila = conPano && entraEnFila(n);
    if (raiz.classList.contains('dos-filas') && n > 1 && pasoTodas < w * 0.8 && !unaFila) {
      const atras = Math.ceil(N / 2);
      const pie = conPano ? Math.max(alto - h, lp.manoY + DIANA - 2) : base;
      fila(naipes.slice(0, atras), pie - DIANA + 2);
      fila(naipes.slice(atras), pie);
      ponerPostas();
      return out;
    }
    // (con algo apoyado, la mano va en UNA fila a todo el ancho, debajo del paño: nadie queda reducido a una pestaña)
    // (0.23) la fila cuenta también los naipes que subieron al paño: cada uno deja su hueco hasta el golpe y las demás
    // no se corren bajo el dedo
    fila(entraEnFila(naipes.length) ? naipes : enMano, base);
    ponerPostas();
    return out;
  }
  /**
   * ¿El paño ocupa su lugar? Con algo apoyado. (0.25: en el teléfono ya no se reserva vacío; la mano tiene alto fijo y,
   * en reposo, va entera a la vista: al elegir, lo elegido sube al paño y el resto baja un poco, sin pasar bajo el pulgar)
   */
  const reservaPano = (): boolean => enPosta.some(Boolean);
  /** ¿Entran 
 naipes en una fila dejando a cada uno al menos 44 px tocables? (la mano de 8 del teléfono, no) */
  const entraEnFila = (n: number): boolean => {
    const { w } = medidas();
    return n <= 1 || (raiz.clientWidth - w) / (n - 1) >= 44;
  };
  /** ¿Se juega con el dedo? (el teléfono o una pantalla táctil sin ratón) */
  const dedo = (): boolean => matchMedia('(pointer: coarse)').matches;

  const puesto = new WeakMap<HTMLElement, string>();
  /** `corte`: lo que se recorta del pie del naipe (la mano que baja bajo el paño no se asoma por debajo de su zona). */
  function aplicar(c: Naipe, z = 0, corte = 0): void {
    const tr = `translate3d(${Math.round(c.x)}px,${Math.round(c.y)}px,0)${Math.abs(c.rot) > 0.05 ? ` rotate(${c.rot.toFixed(1)}deg)` : ''}${c.esc < 0.995 ? ` scale(${c.esc.toFixed(2)})` : ''}`;
    const clave = `${tr}|${z}|${corte}`;
    if (puesto.get(c.el) === clave) return;
    puesto.set(c.el, clave);
    c.el.style.transform = tr;
    c.el.style.zIndex = String(z);
    // (el recorte deja aire arriba y a los costados: la flecha del foco y el canto dorado no se cortan)
    c.el.style.clipPath = corte > 0 ? `inset(-64px -64px ${corte}px -64px)` : '';
  }
  const ponerEn = (el: HTMLElement, x: number, y: number, z: number, extra = ''): void => {
    const clave = `${Math.round(x)}|${Math.round(y)}|${z}|${extra}`;
    if (puesto.get(el) === clave) return;
    puesto.set(el, clave);
    el.style.transform = `translate3d(${Math.round(x)}px,${Math.round(y)}px,0)`;
    el.style.zIndex = String(z);
  };

  /** Lo que se ve de cada carta de la fila (para centrar la flecha del foco en su franja). */
  function franjas(dest: Map<string, { x: number; y: number }>): void {
    const { w } = medidas();
    const porFila = new Map<number, { id: string; x: number }[]>();
    for (const [id, d] of dest) {
      const f = porFila.get(d.y) ?? [];
      f.push({ id, x: d.x });
      porFila.set(d.y, f);
    }
    for (const f of porFila.values()) {
      f.sort((a, b) => a.x - b.x);
      f.forEach((c, i) => {
        const franja = i + 1 < f.length ? Math.max(8, Math.min(w, f[i + 1].x - c.x)) : w;
        const el = naipes.find((x) => x.carta.id === c.id)?.el;
        const v = `${Math.round(franja / 2)}px`;
        if (el && el.style.getPropertyValue('--fm') !== v) el.style.setProperty('--fm', v);
      });
    }
  }

  function pintarPano(): void {
    const { h } = medidas();
    const lp = lugaresPosta();
    const { wp, kp } = { wp: lp.wp, kp: lp.wp / 100 };
    const visible = Math.min(wp, lp.paso || wp);
    const izq = Math.max(0, lp.xs[0] - 8);
    pano.style.transform = `translate3d(${izq}px,0,0)`;
    pano.style.width = `${Math.min(raiz.clientWidth - izq, lp.xs[nPostas - 1] + wp - lp.xs[0] + 16)}px`;
    pano.style.height = `${lp.fin}px`;
    slots.forEach((el, i) => {
      ponerEn(el, lp.xs[i] - izq, lp.y, Z.pano);
      el.style.width = `${wp}px`;
      el.style.height = `${lp.hv}px`;
      el.style.setProperty('--visible', `${Math.round(visible)}px`);
      el.classList.toggle('llena', !!enPosta[i]);
      el.classList.toggle('apunta', (!!arrastre && arrastre.posta === i) || haciaPosta?.posta === i);
    });
    const conPano = reservaPano();
    const lleno = enPosta.some(Boolean);
    // (un arrastre desde la mano lo enciende solo cuando pasa por encima del paño: la mano en reposo no queda «adentro»)
    pano.classList.toggle('activo', lleno || (!!arrastre && arrastre.posta >= 0) || !!haciaPosta);
    pano.classList.toggle('reservado', conPano && !pano.classList.contains('activo'));
    raiz.classList.toggle('con-pano', conPano);
    // el renglón de la regla: en reposo, en el aire de arriba de la mano; con algo apoyado, al costado del paño si
    // entra (si no, se calla: el desglose ya nombra el Medio, la Chispa y el Escalón)
    const ancho = raiz.clientWidth;
    if (!conPano) {
      regla.classList.remove('costado');
      regla.style.maxWidth = `${ancho - 8}px`;
      regla.hidden = raiz.classList.contains('arrastrando') || raiz.clientHeight - h < 24;
      if (!regla.hidden) ponerEn(regla, Math.round((ancho - regla.offsetWidth) / 2), 2, Z.pano);
    } else {
      const lado = lp.xs[0] - 16;
      regla.classList.add('costado');
      regla.style.maxWidth = `${Math.max(0, lado)}px`;
      regla.hidden = lado < 150;
      if (!regla.hidden) ponerEn(regla, Math.max(4, lado - regla.offsetWidth), Math.round(lp.y + lp.hv / 2 - regla.offsetHeight / 2), Z.pano);
    }
    // la marca del Medio va pegada a su naipe (si lo hay), a la derecha de su número
    const enMedio = enPosta[medio];
    const nm = enMedio ? naipes.find((c) => c.carta.id === enMedio) : null;
    marcaMedio.hidden = !nm;
    if (nm) {
      // (a la derecha del índice, nunca encima: si «x2 PEGA DOBLE» no entra en lo que se ve del naipe, queda «x2»)
      const libre = Math.round(visible) - 30 * kp;
      if (anchoMarca.visible !== libre) {
        marcaMedio.classList.remove('corta');
        marcaMedio.classList.toggle('corta', marcaMedio.offsetWidth > libre);
        anchoMarca = { visible: libre, w: marcaMedio.offsetWidth };
      }
      // (0.23) montada en el borde de arriba del naipe, no sobre su primera pinta
      ponerEn(marcaMedio, nm.x + Math.round(visible) - anchoMarca.w - 2 * kp, nm.y - Math.round(marcaMedio.offsetHeight * 0.6), Z.marca);
    }
    // la Chispa: entre la Posta del Comodín y la de su derecha
    chispas.forEach((el, i) => {
      const si = marcas.chispas.includes(i);
      el.hidden = !si;
      // (en la costura, a media altura de los naipes: no tapa el índice de ninguno)
      if (si) ponerEn(el, Math.round((lp.xs[i] + wp + lp.xs[i + 1]) / 2 - el.offsetWidth / 2), lp.y + Math.round(lp.hv * 0.45 - el.offsetHeight / 2), Z.marca + 1);
    });
    // el Escalón armado: el chip a la derecha del paño si entra; si no, se enciende su renglón en la regla del costado
    // (un solo rótulo: nunca dos que digan lo mismo). Si tampoco hay regla, lo dicen los peldaños y la cuenta
    let chipVa = false;
    if (marcas.escalon) {
      const der = lp.xs[nPostas - 1] + wp + 10;
      rotEscalon.hidden = false;
      const anchoR = rotEscalon.offsetWidth;
      chipVa = der + anchoR <= ancho;
      // (a la altura del último peldaño: el chip sube con la escalera)
      if (chipVa) ponerEn(rotEscalon, der, Math.max(0, lp.y - lp.subida + 2), Z.marca + 2);
    }
    rotEscalon.hidden = !chipVa;
    regla.classList.toggle('arma', !!marcas.escalon && !chipVa);
    // el dial: a la derecha del paño, al pie de los naipes (el chip del Escalón, si está, queda arriba)
    if (!dialEl.hidden) {
      const techo = chipVa ? Math.max(0, lp.y - lp.subida + 2) + rotEscalon.offsetHeight + 6 : 0;
      ponerEn(dialEl, lp.xs[nPostas - 1] + wp + 14, Math.max(techo, lp.y + lp.hv - dialAlto), Z.marca + 3);
    }
  }

  function cuadro(ahora: number): void {
    if (!viva) return;
    const dt = Math.min(0.033, (ahora - ultimo) / 1000);
    ultimo = ahora;
    const quieto = todoQuieto();
    const dest = destinos();
    const { k, w } = medidas();
    // (0.23) el Comodín tapado por su vecina de la derecha (la mano de 8) lleva su nombre de canto, a la izquierda: en
    // la franja que queda a la vista entra entero (centrado arriba, la vecina se comía la mitad: «COMOD»)
    for (const c of naipes) {
      if (c.carta.palo !== 'X') continue;
      const yo = dest.get(c.carta.id);
      let tapada = false;
      if (yo && !c.elegida) {
        for (const o of naipes) {
          const d = o === c || o.elegida ? undefined : dest.get(o.carta.id);
          if (d && Math.abs(d.y - yo.y) < 4 && d.x > yo.x && d.x - yo.x < w - 2) tapada = true;
        }
      }
      if (c.el.classList.contains('rotulo-canto') !== tapada) c.el.classList.toggle('rotulo-canto', tapada);
    }
    const caja = raiz.getBoundingClientRect();
    // con el dedo, el grupo que apunta al enemigo se posa sobre su naipe, por encima de la barra de Vida: la cuenta
    // (Daño × Multi = total) queda entera a la vista mientras se decide
    // (la pose de la QA hace lo mismo en el móvil: fotografía el gesto tal como se ve con el dedo)
    const dedo = arrastre ? arrastre.tactil && arrastre.zona === 'enemigo' : !!posado && innerWidth <= 700;
    const blanco = dedo ? document.querySelector('[data-soltar="enemigo"]')?.getBoundingClientRect() : undefined;
    const foco = document.activeElement;
    const lp = lugaresPosta();
    const alto = raiz.clientHeight;
    const conPano = reservaPano();
    const { h } = medidas();
    naipes.forEach((c, i) => {
      // el naipe apoyado va a la escala del paño (a 2×, a 1×): una clase le cambia la escala entera de su dibujo
      const enPano = c.elegida && !c.vuela && !(arrastre && arrastre.ids.includes(c.carta.id)) && !(posado && posado.ids.includes(c.carta.id));
      if (c.el.classList.contains('en-pano') !== enPano) c.el.classList.toggle('en-pano', enPano);
      // (la que va bajo el dedo, de la mano a la mesa o de una Posta a otra: puede pasar por encima de las demás)
      const enTransito = !!(arrastre && arrastre.ids.includes(c.carta.id)) || !!(posado && posado.ids.includes(c.carta.id)) || haciaPosta?.id === c.carta.id;
      if (c.el.classList.contains('en-transito') !== enTransito) c.el.classList.toggle('en-transito', enTransito);
      if (c.espera > 0) {
        c.espera -= dt * 1000;
        aplicar(c, Z.mano + i);
        return;
      }
      let tx: number;
      let ty: number;
      let trot = 0;
      let tesc = 1;
      const p = c.elegida ? enPosta.indexOf(c.carta.id) : -1;
      let z = p >= 0 ? Z.posta + p : Z.mano + i;
      const enGrupo = arrastre?.ids.indexOf(c.carta.id) ?? -1;
      const enPose = posado?.ids.indexOf(c.carta.id) ?? -1;
      if (c.vuela) {
        tx = c.vuela.x - caja.left;
        ty = c.vuela.y - caja.top;
        z = 200 + i;
      } else if (arrastre && enGrupo >= 0) {
        // el grupo sigue al cursor, abierto en abanico chico
        const medio = (arrastre.ids.length - 1) / 2;
        tx = arrastre.x - caja.left - arrastre.dx + (enGrupo - medio) * 34 * k;
        // con el dedo, el grupo se despega de donde se lo tomó hasta quedar entero por encima de la yema (su centro,
        // `ALZA` px más arriba): el dedo no tapa las cartas
        const dy = arrastre.dy + (70 * k + ALZA - arrastre.dy) * (arrastre.alza / ALZA);
        ty = arrastre.y - caja.top - dy - Math.abs(enGrupo - medio) * -4 * k;
        if (arrastre.tactil) {
          // se achica a medida que se despega de la mano
          tesc = 1 - (1 - ESCALA_DEDO) * (arrastre.alza / ALZA);
          if (blanco && blanco.height > 0) ty = Math.min(ty, blanco.bottom - caja.top - 140 * k * (0.5 + tesc / 2) - 10);
        }
        trot = (enGrupo - medio) * 4 + c.vx * 0.01;
        z = 100 + enGrupo;
      } else if (posado && enPose >= 0) {
        const medio = (posado.ids.length - 1) / 2;
        tx = posado.x - caja.left - 50 * k + (enPose - medio) * 34 * k;
        ty = posado.y - caja.top - 70 * k;
        if (blanco && blanco.height > 0) {
          tesc = ESCALA_DEDO;
          ty = Math.min(ty, blanco.bottom - caja.top - 140 * k * (0.5 + tesc / 2) - 10);
        }
        trot = (enPose - medio) * 4;
        z = 100 + enPose;
      } else if (haciaPosta?.id === c.carta.id) {
        // (la QA: a mitad de camino entre su Posta y la de destino, levantada)
        const d = dest.get(c.carta.id)!;
        tx = Math.round((d.x + lp.xs[haciaPosta.posta]) / 2);
        ty = lp.y;
        trot = 4;
        z = 100;
      } else {
        const d = dest.get(c.carta.id)!;
        tx = d.x;
        ty = d.y;
        if (!quieto) {
          // la micro-flotación desfasada: cada carta respira a su tiempo, en píxeles enteros
          ty += Math.round(Math.sin(ahora / 520 + i * 0.9) * 1.5 * k);
          // se inclina hacia el cursor si lo tiene cerca (las de la mano; las del paño quedan apoyadas)
          if (cursor && !arrastre && p < 0) {
            const cx = caja.left + c.x + 50 * k;
            const cy = caja.top + c.y + 70 * k;
            const dx = cursor.x - cx;
            const dy = cursor.y - cy;
            if (Math.abs(dx) < 90 * k && Math.abs(dy) < 120 * k) {
              trot = Math.max(-3, Math.min(3, dx / (30 * k)));
              // (con algo apoyado, sube dentro de su fila: nunca entra en el paño)
              ty -= conPano ? Math.min(Math.round(5 * k), Math.max(0, ty - lp.fin - 2)) : Math.round(5 * k);
              z = Z.cerca + i;
            }
          }
        }
        // la carta con el foco del mando o del teclado pasa al frente de su fila (con mano de 8, la fila le abre lugar:
        // no tapa a su vecina); la del paño, al frente del paño
        if (foco === c.el) z = p >= 0 ? Z.posta + 9 : Z.foco;
      }
      if (quieto) {
        c.x = tx;
        c.y = ty;
        c.rot = trot;
        c.esc = tesc;
        c.vx = c.vy = 0;
      } else {
        // resorte amortiguado: rápido al salir, suave al llegar
        const rig = c.vuela ? 420 : arrastre && enGrupo >= 0 ? 600 : 260;
        const amo = c.vuela ? 30 : arrastre && enGrupo >= 0 ? 36 : 24;
        c.vx += ((tx - c.x) * rig - c.vx * amo) * dt;
        c.vy += ((ty - c.y) * rig - c.vy * amo) * dt;
        c.x += c.vx * dt;
        c.y += c.vy * dt;
        c.rot += (trot - c.rot) * Math.min(1, dt * 14);
        c.esc += (tesc - c.esc) * Math.min(1, dt * 18);
      }
      // la mano que bajó bajo el paño no se asoma por debajo de su zona; el naipe apoyado, por debajo del paño (solo
      // en el teléfono más bajo, donde el paño enseña lo de arriba de cada naipe)
      let corte = 0;
      if (!c.vuela && z < 100) {
        if (enPano && lp.hv < lp.hp) corte = Math.max(0, Math.min(lp.hp - 24, Math.round(c.y + lp.hp - lp.y - lp.hv)));
        else if (conPano) corte = Math.max(0, Math.round(c.y + h - alto));
      }
      aplicar(c, z, corte);
    });
    pintarPano();
    franjas(dest);
    requestAnimationFrame(cuadro);
  }

  function sincronizarElegidas(): void {
    for (const c of naipes) {
      c.elegida = enPosta.includes(c.carta.id);
      c.el.classList.toggle('elegida', c.elegida);
      c.el.setAttribute('aria-pressed', String(c.elegida));
      const p = enPosta.indexOf(c.carta.id);
      if (p >= 0) c.el.dataset.posta = String(p);
      else delete c.el.dataset.posta;
    }
  }
  /** Las elegidas, de izquierda a derecha sobre el paño. */
  const elegidas = (): string[] => enPosta.filter((x): x is string => !!x);
  const cambio = (): void => {
    sincronizarElegidas();
    oye.alCambiar(elegidas());
  };
  /** Apoya una carta en el paño: en la Posta pedida o en la primera libre (el Medio, después a los costados). */
  function apoyar(id: string, en?: number): boolean {
    const ya = enPosta.indexOf(id);
    if (en === undefined) {
      if (ya >= 0) return true;
      const libre = ordenLlenado.find((i) => !enPosta[i]);
      if (libre === undefined) return false;
      enPosta[libre] = id;
      return true;
    }
    // a una Posta ocupada: se cambian (la de ahí va adonde estaba esta, o a la primera libre si venía de la mano)
    const otra = enPosta[en];
    if (ya >= 0) enPosta[ya] = otra;
    else if (otra) {
      const libre = ordenLlenado.find((i) => !enPosta[i] && i !== en);
      if (libre === undefined) return false;
      enPosta[libre] = otra;
    }
    enPosta[en] = id;
    return true;
  }
  const quitar = (id: string): void => {
    const i = enPosta.indexOf(id);
    if (i >= 0) enPosta[i] = null;
  };
  /**
   * La mesa acomoda sola: cada vez que cambia lo elegido, las cartas van a la mejor disposición del paño (el Medio, la
   * Chispa, el Escalón). Si el jugador las corre a mano (arrastre, LB/RB, Q/W), ese orden queda hasta que cambie la
   * selección.
   */
  function acomodarTodo(): void {
    const ids = elegidas();
    if (!ids.length || !oye.acomodar) return;
    const ps = oye.acomodar(ids);
    if (!ps || ps.length !== ids.length || new Set(ps).size !== ps.length || ps.some((x) => !(x >= 0 && x < nPostas))) return;
    enPosta.fill(null);
    ids.forEach((id, i) => (enPosta[ps[i]] = id));
  }
  const alternar = (id: string) => {
    const c = naipes.find((x) => x.carta.id === id);
    if (!c || bloqueada) return;
    if (enPosta.includes(id)) quitar(id);
    else if (!apoyar(id)) {
      // el paño está lleno: la carta no tiene dónde apoyarse
      c.el.animate([{ marginTop: '0' }, { marginTop: '-6px' }, { marginTop: '0' }], { duration: 180, easing: 'steps(3)' });
      return;
    }
    acomodarTodo();
    cambio();
  };

  /** Sobre qué zona está el grupo. Con el dedo (`alza` > 0) al enemigo se le apunta con las cartas, que van por
   * encima de la yema, o con la yema misma; al descarte, que queda bajo la mano, siempre con la yema. `subio`: lo que
   * la yema lleva subido desde donde tomó la carta. */
  function zonaEn(x: number, y: number, alza = 0, subio = 0): Zona | null {
    const z = oye.zonas();
    const dentro = (r: DOMRect | undefined, py: number): boolean => !!r && r.width > 0 && r.height > 0 && x >= r.left && x <= r.right && py >= r.top && py <= r.bottom;
    // (las cartas solo apuntan si el dedo subió de verdad: un toque que resbala de costado no golpea)
    if (dentro(z.enemigo, y) || (alza > 0 && subio >= SUBIDA && dentro(z.enemigo, y - alza))) return 'enemigo';
    if (dentro(z.descarte, y)) return 'descarte';
    return null;
  }
  /** La Posta del paño que queda bajo el puntero (su fila, con un poco de aire arriba), o −1. */
  function postaEn(x: number, y: number): number {
    const caja = raiz.getBoundingClientRect();
    const lp = lugaresPosta();
    const top = caja.top - 24;
    const bajo = caja.top + lp.fin;
    if (y < top || y > bajo) return -1;
    const visible = Math.min(lp.wp, lp.paso || lp.wp);
    for (let i = nPostas - 1; i >= 0; i--) if (x >= caja.left + lp.xs[i] && x <= caja.left + lp.xs[i] + (i === nPostas - 1 ? lp.wp : visible)) return i;
    return -1;
  }
  /** Termina el arrastre y devuelve lo que llevaba (las cartas vuelven solas a su sitio). */
  function soltarGrupo(jugar = true): { zona: Zona | null; ids: string[]; tactil: boolean; resbalon: boolean; posta: number } | null {
    if (!arrastre) return null;
    const { zona, ids, tactil, previa, lejos, origen, posta } = arrastre;
    arrastre = null;
    raiz.classList.remove('arrastrando');
    document.body.classList.remove('arrastrando', 'mueve-pano');
    oye.alApuntar(null, ids);
    // a otra Posta del paño: la carta tomada cambia de lugar (si venía de la mano, se suma a lo que ya estaba elegido)
    if (jugar && !zona && posta >= 0 && !bloqueada) {
      for (let i = 0; i < nPostas; i++) enPosta[i] = previa[i];
      apoyar(origen, posta);
      cambio();
      return { zona: null, ids, tactil, resbalon: false, posta };
    }
    // si no se jugó nada (se soltó en ninguna zona o el sistema canceló el gesto): la selección queda como estaba antes
    // de empezar; arrastrar una carta sin elegir ya no borra las que estaban elegidas
    if ((!zona || !jugar) && !bloqueada && previa.some((id, i) => id !== enPosta[i])) {
      for (let i = 0; i < nPostas; i++) enPosta[i] = previa[i];
      cambio();
    }
    return { zona, ids, tactil, resbalon: tactil && !zona && lejos < RESBALON, posta: -1 };
  }

  // ── puntero: clic para elegir, arrastre para jugar (o para cambiar de Posta)
  const abajo = (ev: PointerEvent) => {
    const el = (ev.target as HTMLElement).closest<HTMLButtonElement>('.carta');
    if (!el || bloqueada || (ev.pointerType === 'mouse' && ev.button !== 0)) return;
    presion = { id: el.dataset.id!, x: ev.clientX, y: ev.clientY, puntero: ev.pointerId };
    try {
      raiz.setPointerCapture(ev.pointerId);
    } catch {
      // sin captura: los eventos siguen llegando a la mano mientras el puntero esté encima
    }
  };
  let desdePano = false;
  const mueve = (ev: PointerEvent) => {
    cursor = { x: ev.clientX, y: ev.clientY };
    if (!presion || ev.pointerId !== presion.puntero) return;
    if (!arrastre) {
      if (Math.hypot(ev.clientX - presion.x, ev.clientY - presion.y) < (ev.pointerType === 'touch' ? UMBRAL_DEDO : UMBRAL)) return;
      // empieza el arrastre: si la carta está en el paño, va todo el grupo; si no, va ella sola
      const c = naipes.find((x) => x.carta.id === presion!.id);
      if (!c) return;
      const previa = [...enPosta];
      if (!c.elegida) {
        enPosta.fill(null);
        apoyar(c.carta.id);
        acomodarTodo();
        cambio();
      }
      const caja = raiz.getBoundingClientRect();
      arrastre = { ids: elegidas(), dx: presion.x - caja.left - c.x, dy: presion.y - caja.top - c.y, x: ev.clientX, y: ev.clientY, zona: null, tactil: ev.pointerType === 'touch', alza: 0, previa, lejos: 0, origen: c.carta.id, posta: -1 };
      raiz.classList.add('arrastrando');
      document.body.classList.add('arrastrando');
      desdePano = previa.includes(c.carta.id);
    }
    arrastre.x = ev.clientX;
    arrastre.y = ev.clientY;
    arrastre.lejos = Math.max(arrastre.lejos, Math.hypot(ev.clientX - presion.x, ev.clientY - presion.y));
    // con el dedo el grupo se despega de la yema a medida que se aleja de donde se tomó (sin salto al empezar)
    if (arrastre.tactil) arrastre.alza = Math.max(arrastre.alza, Math.min(ALZA, Math.hypot(ev.clientX - presion.x, ev.clientY - presion.y) * 1.5));
    const zona = zonaEn(ev.clientX, ev.clientY, arrastre.alza, presion.y - ev.clientY);
    // sobre el paño (y no sobre el enemigo): la Posta que la recibiría se enciende
    const posta = zona ? -1 : postaEn(ev.clientX, ev.clientY);
    if (posta !== arrastre.posta) {
      arrastre.posta = posta;
      if (posta >= 0 && arrastre.tactil) vibrar();
    }
    // (0.23) lo que sale del paño sin apuntar al enemigo deja la cuenta (que dice el acomodo de antes, «Medio +6») en
    // suspenso hasta soltarlo
    document.body.classList.toggle('mueve-pano', desdePano && !zona);
    if (zona !== arrastre.zona) {
      arrastre.zona = zona;
      oye.alApuntar(zona, arrastre.ids);
      if (zona && arrastre.tactil) vibrar();
    }
  };
  const arriba = (ev: PointerEvent) => {
    if (!presion || ev.pointerId !== presion.puntero) return;
    const id = presion.id;
    presion = null;
    try {
      raiz.releasePointerCapture(ev.pointerId);
    } catch {
      // ya estaba suelto
    }
    const suelto = soltarGrupo();
    if (suelto) {
      if (suelto.zona && suelto.tactil) vibrar();
      if (suelto.posta >= 0) return;
      oye.alSoltar(suelto.zona, suelto.ids);
      // un toque que resbaló un poco y no fue a ningún lado sigue siendo un toque: elige (o suelta) su carta
      if (suelto.resbalon) alternar(id);
      return;
    }
    alternar(id);
  };
  /** El sistema canceló el gesto (una llamada, un gesto del borde, la palma): las cartas vuelven a su lugar y no se
   * golpea ni se descarta, aunque el grupo estuviera sobre una zona. */
  const cancela = (ev: PointerEvent) => {
    if (!presion || ev.pointerId !== presion.puntero) return;
    presion = null;
    try {
      raiz.releasePointerCapture(ev.pointerId);
    } catch {
      // ya estaba suelto
    }
    soltarGrupo(false);
  };
  const sale = () => {
    cursor = null;
  };
  const tecla = (ev: KeyboardEvent) => {
    const el = (ev.target as HTMLElement).closest<HTMLButtonElement>('.carta');
    if (!el) return;
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      alternar(el.dataset.id!);
    } else if ((ev.key === 'q' || ev.key === 'w') && !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
      // Q / W corren de Posta la carta con foco (como LB / RB del mando)
      if (correr(el.dataset.id!, ev.key === 'q' ? -1 : 1)) ev.preventDefault();
    }
  };
  function correr(id: string, dir: -1 | 1): boolean {
    if (bloqueada) return false;
    const i = enPosta.indexOf(id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= nPostas) return false;
    [enPosta[i], enPosta[j]] = [enPosta[j], enPosta[i]];
    cambio();
    return true;
  }
  raiz.addEventListener('pointerdown', abajo);
  raiz.addEventListener('pointermove', mueve);
  raiz.addEventListener('pointerup', arriba);
  raiz.addEventListener('pointercancel', cancela);
  raiz.addEventListener('pointerleave', sale);
  raiz.addEventListener('keydown', tecla);
  raiz.addEventListener('cabala:alternar', ((ev: CustomEvent<string>) => alternar(ev.detail)) as EventListener);
  raiz.addEventListener('cabala:correr', ((ev: CustomEvent<{ id: string; dir: -1 | 1 }>) => void correr(ev.detail.id, ev.detail.dir)) as unknown as EventListener);
  requestAnimationFrame((tt) => {
    ultimo = tt;
    cuadro(tt);
  });

  return {
    poner(cartas, desdeMazo) {
      // en modo foto o con «Reducir movimiento» las cartas ya están en su sitio: no hay reparto que volar
      const desde = todoQuieto() ? undefined : desdeMazo;
      const caja = raiz.getBoundingClientRect();
      const viejas = new Map(naipes.map((c) => [c.carta.id, c]));
      const nuevas: Naipe[] = [];
      let recien = 0;
      for (const carta of [...cartas].sort(orden)) {
        const ya = viejas.get(carta.id);
        if (ya && ya.carta.n === carta.n && ya.carta.palo === carta.palo && !ya.vuela) {
          ya.carta = carta;
          nuevas.push(ya);
          viejas.delete(carta.id);
          continue;
        }
        const el = document.createElement('button');
        el.className = 'carta';
        el.dataset.id = carta.id;
        el.dataset.foco = `carta-${carta.id}`;
        el.dataset.palo = carta.palo;
        el.dataset.n = String(carta.n);
        el.setAttribute('aria-pressed', 'false');
        el.setAttribute('aria-label', carta.palo === 'X' ? '★' : `${carta.n} ${carta.palo}`);
        // el sello del temple («+8★») dice qué es al enfocar la carta o pasarle el cursor
        if (carta.temple || carta.mutacion) {
          const cuerpo = carta.brava ? t('forjada') : carta.templada ? t('templadaMulti', { n: carta.temple ?? 0, m: B.fogon.multiTemplada }) : t('templada', { n: carta.temple ?? 0 });
          el.dataset.tipT = carta.mutacion ? tx(MUTACION_NOMBRE[carta.mutacion]) : t('templeTip');
          // (la mutación de la Forja Brava, con lo que hace, en la ayuda del naipe)
          el.dataset.tip = carta.mutacion ? `${tx(MUTACION_DESC[carta.mutacion])}\n${cuerpo}` : cuerpo;
        }
        // el Comodín lleva su nombre: sin número ni palo propios, es lo que lo distingue de una carta que no se lee
        // (0.22: el índice es el del dibujo, sin placas de texto encima; la mutación, un sello en el canto de abajo)
        el.innerHTML =
          pxNaipe(carta) +
          (carta.palo === 'X' ? `<span class="c-rotulo">${t('comodin')}</span>` : '') +
          (carta.temple ? `<span class="c-temple">+${carta.temple}${carta.templada ? '★' : ''}${carta.brava ? ' ×2' : ''}</span>` : '') +
          (carta.mutacion ? `<span class="c-mutacion" data-mut="${carta.mutacion}" aria-hidden="true">${pxHud(MUTACION_PX[carta.mutacion])}</span>` : '');
        raiz.append(el);
        const { h } = medidas();
        const x0 = desde ? desde.x - caja.left : raiz.clientWidth / 2;
        const y0 = desde ? desde.y - caja.top : raiz.clientHeight - h;
        nuevas.push({ carta, el, x: x0, y: y0, vx: 0, vy: 0, rot: desde ? -12 : 0, esc: 1, elegida: enPosta.includes(carta.id), espera: desde ? recien++ * 55 : 0, vuela: null });
      }
      for (const c of viejas.values()) c.el.remove();
      naipes = nuevas;
      // lo que ya no está en la mano deja su Posta
      for (let i = 0; i < nPostas; i++) if (enPosta[i] && !naipes.some((c) => c.carta.id === enPosta[i])) enPosta[i] = null;
      // la mano que necesita dos filas (el móvil) lo dice con una clase: el CSS le da el alto de dos filas solo a ella
      tope = Math.max(tope, naipes.length);
      raiz.classList.toggle('dos-filas', pideDosFilas(tope));
      // el orden del DOM sigue al de la fila: el foco del teclado y del mando va de izquierda a derecha
      for (const c of naipes) raiz.append(c.el);
      sincronizarElegidas();
    },
    seleccion: elegidas,
    postaDe: (id) => enPosta.indexOf(id),
    elegir(ids, postas) {
      enPosta.fill(null);
      ids.forEach((id, i) => {
        const p = postas?.[i];
        if (p !== undefined && p >= 0 && p < nPostas && !enPosta[p]) enPosta[p] = id;
      });
      for (const id of ids) if (!enPosta.includes(id)) apoyar(id);
      // (sin Postas pedidas, la mesa acomoda sola)
      if (!postas) acomodarTodo();
      cambio();
    },
    correr,
    dial(html) {
      if (dialEl.innerHTML !== html) dialEl.innerHTML = html;
      dialEl.hidden = !html;
      if (!html) return false;
      const lp = lugaresPosta();
      const der = lp.xs[nPostas - 1] + lp.wp + 14;
      // (el premio parte en dos renglones si hace falta: lo que manda es el ancho que queda a la derecha del paño)
      const libre = raiz.clientWidth - 4 - der;
      dialEl.style.maxWidth = `${Math.max(0, libre)}px`;
      dialAlto = dialEl.offsetHeight;
      const entra = libre >= 180 && dialEl.scrollWidth <= libre && dialAlto <= lp.hv + lp.subida;
      if (!entra) {
        dialEl.hidden = true;
        dialEl.innerHTML = '';
        return false;
      }
      puesto.delete(dialEl);
      pintarPano();
      return true;
    },
    marcar(m) {
      marcas = m;
      rotEscalon.innerHTML = m.escalon ? `${pxHud('escalon', 'p-icono')}<b class="p-esc-txt">${esc(t('escalon'))}</b>${cifra(`+${m.escalon}`, 'azul')}` : '';
    },
    volar(ids, a) {
      const { k } = medidas();
      const grupo = naipes.filter((c) => ids.includes(c.carta.id));
      grupo.forEach((c, i) => {
        c.vuela = { x: a.x - 50 * k + (i - (grupo.length - 1) / 2) * 10 * k, y: a.y - 70 * k };
        c.el.classList.add('volando');
      });
      for (const id of ids) quitar(id);
      marcas = { chispas: [], escalon: 0 };
      const ms = todoQuieto() ? 0 : 190;
      return new Promise((ok) =>
        setTimeout(() => {
          for (const c of grupo) c.el.remove();
          naipes = naipes.filter((c) => !grupo.includes(c));
          ok();
        }, ms),
      );
    },
    negar() {
      for (const c of naipes) if (c.elegida) c.el.animate([{ marginLeft: '0' }, { marginLeft: '-6px' }, { marginLeft: '6px' }, { marginLeft: '-3px' }, { marginLeft: '0' }], { duration: 220, easing: 'steps(4)' });
    },
    bloquear(si) {
      bloqueada = si;
      raiz.classList.toggle('bloqueada', si);
    },
    posar(ids, x, y) {
      enPosta.fill(null);
      for (const id of ids) apoyar(id);
      posado = { ids: [...ids], x, y };
      raiz.classList.add('arrastrando');
      document.body.classList.add('arrastrando');
      cambio();
      oye.alApuntar('enemigo', [...ids]);
    },
    arrastrarA(id, posta) {
      haciaPosta = { id, posta };
      document.body.classList.add('mueve-pano');
      const el = slots[posta];
      el?.classList.add('apunta');
      pano.classList.add('activo');
    },
    destruir() {
      viva = false;
      document.body.classList.remove('arrastrando', 'mueve-pano');
      raiz.removeEventListener('pointerdown', abajo);
      raiz.removeEventListener('pointermove', mueve);
      raiz.removeEventListener('pointerup', arriba);
      raiz.removeEventListener('pointercancel', cancela);
      raiz.removeEventListener('pointerleave', sale);
      raiz.removeEventListener('keydown', tecla);
    },
  };
}
