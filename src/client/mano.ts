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
   * (0.27) Escritorio: cuánto sube el paño por encima de la zona de la mano (va a la derecha del desglose de la cuenta,
   * en su misma franja). Lo dice la mesa cada vez que pinta la cuenta.
   */
  subir(px: number): void;
  /** (0.27) El borde izquierdo del paño en la pantalla (el desglose de la cuenta llega hasta ahí), o null si no hay paño. */
  panoIzq(): number | null;
  /** (0.29) El borde derecho del paño en la pantalla (a 1080p, la columna del MULTI arranca ahí), o null si no hay paño. */
  panoDer(): number | null;
  /** (0.27) Pone YA el alto de la zona según lo apoyado (sin esperar al cuadro): la mesa mide la escena enseguida. */
  ajustar(): void;
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
 * (0.27) «El dedo manda», sin excepciones: en el teléfono la mano NO se mueve al elegir, con cualquier alto y cualquier
 * jugada. Lo que cede es todo lo demás: el paño lleva naipes ENTEROS a una escala menor (la que entra a lo ancho y a
 * lo alto), la cuenta se pliega (lo hace la mesa) y la escena conserva su piso: 80 px de naipe del enemigo y su barra.
 */
const ESCENA_PISO = 108;
/** (0.27) El alto de la cuenta plegada (0.28: su renglón fijo en dos pisos: jugada · fórmula · palos / desenlace), px. */
const CUENTA_PLEGADA = 58;
/** (0.27) En el teléfono bajo, lo más que la mano de dos filas hunde su pie tras la barra del pulgar (siempre igual), px. */
const HUNDE_MAX = 40;
/** El ribete del fieltro alrededor de los naipes apoyados y el aire entre el paño y la mano, px. */
const BORDE = 4;
const AIRE_TEL = 4;
/**
 * Las capas de la mesa de cartas: el fieltro del paño, la mano, la que pasa el cursor, los naipes apoyados en las
 * Postas (0.21: por ENCIMA de la mano: lo que jugás se ve entero), sus marcas y la carta con el foco.
 */
/** (0.28) Escritorio: lo que queda en la mano del naipe que subió al paño (su canto con el índice), en naipes. */
const CANTO = 0.27;
const Z = { pano: 1, hueco: 9, mano: 10, cerca: 30, posta: 50, marca: 65, foco: 90 } as const;

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
  regla.innerHTML = `<span class="p-linea">${pxHud('medio', 'p-icono')}<b>${esc(t('postaMedioAyuda'))}</b></span><i class="p-sep">·</i><span class="p-linea p-esc">${pxHud('escalon', 'p-icono')}<b class="p-largo">${esc(t('panoEscalon', { n: B.postas.escalon }))}</b><b class="p-corto">${esc(`${tx(PASO_NOMBRE['posta:escalon'])} +${B.postas.escalon}`)}</b></span>`;
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
  // (0.27) los huecos de la mano: cada naipe que subió al paño deja en su lugar su silueta tramada («acá estaba»); un
  // toque en ella lo devuelve a la mano. Así el hueco se lee como un lugar a propósito y la mano no se corre
  const huecos = new Map<string, HTMLElement>();
  /** (0.27) Escritorio: lo que el paño sube por encima de la zona de la mano (a la franja del desglose). */
  let sube = 0;

  let cacheMedidas: { w: number; h: number; k: number; kp: number; tapa: number; centro: boolean; clave: string } | null = null;
  /** (0.27) Teléfono: la escala del paño que entra a lo alto y lo que la mano de dos filas hunde su pie (fijos por ventana). */
  let kpAlto = 1;
  let hunde = 0;
  const medidas = () => {
    // (se lee el estilo una vez por tamaño de ventana: es lo más caro del cuadro)
    const clave = `${innerWidth}x${innerHeight}|${raiz.className}|${kpAlto}`;
    if (cacheMedidas?.clave === clave) return cacheMedidas;
    const s = getComputedStyle(raiz);
    const k = Number(s.getPropertyValue('--k-naipe')) || 1;
    // el paño va a escala entera más chica que la mano (a 2×, los naipes apoyados van a 1×): así entra arriba de ella
    // (0.28) en el escritorio la dice el CSS (`--k-pano-fijo`): 1× en la Deck y el portátil, 2× a 1080p (lo jugado, del
    // tamaño de la mano), siempre entera
    const fijo = Number(s.getPropertyValue('--k-pano-fijo')) || 0;
    let kp = fijo > 0 ? fijo : k >= 2 ? Math.floor(k / 2) : 1;
    // (0.27) en el teléfono, la escala a la que las Postas entran lado a lado Y el naipe entra ENTERO a lo alto sin
    // mover la mano: ninguno se monta sobre su vecino ni queda cortado
    if (innerWidth <= 700 && raiz.clientWidth > 0) kp = Math.max(0.5, Math.floor(Math.min(1, cabeAncho(), kpAlto) * 20 + 1e-6) / 20);
    raiz.style.setProperty('--k-pano', String(kp));
    // (0.28) el paño muy chico (teléfono bajo) no lleva el rótulo COMODÍN de canto: no entra en el alto del naipe
    raiz.classList.toggle('pano-chico', kp < 0.8);
    // lo que tapa la barra del pulgar al pie de la mano (el margen negativo del teléfono)
    const tapa = Math.max(0, -parseFloat(s.marginBottom) || 0);
    // (0.29) a 1080p el paño va SIEMPRE centrado sobre la mano (lo dice el CSS: `--pano-centro`)
    cacheMedidas = { w: 100 * k, h: 140 * k, k, kp, tapa, centro: s.getPropertyValue('--pano-centro').trim() === '1', clave };
    return cacheMedidas;
  };
  /** La escala a la que las Postas del teléfono entran lado a lado. */
  const cabeAncho = (): number => (nPostas > 1 ? (raiz.clientWidth - 8 - 4 * (nPostas - 1)) / (100 * nPostas) : 1);
  /** ¿Entran `n` cartas en una fila sin montarse de más? (si no, el móvil las pone en dos filas y la mano pide más alto) */
  const pideDosFilas = (n: number): boolean => {
    const { w, k } = medidas();
    return innerWidth <= 700 && n > 1 && raiz.clientWidth > 0 && Math.min(w + Math.round(6 * k), (raiz.clientWidth - w) / (n - 1)) < w * 0.8;
  };

  /**
   * La fila del paño: dónde va cada Posta (la esquina de arriba a la izquierda de su naipe, a la escala del paño), el
   * paso entre una y otra, el alto del naipe apoyado (`hp`: siempre ENTERO), dónde termina el paño (`fin`) y dónde
   * arranca la mano del escritorio cuando hay algo apoyado.
   * (0.27) Teléfono: el paño va pegado arriba de la mano, que no se mueve. Escritorio: el paño va a la derecha, en la
   * franja del desglose de la cuenta (sube por encima de la zona de la mano), y la mano baja solo lo que haga falta.
   */
  function lugaresPosta(): { xs: number[]; y: number; paso: number; wp: number; hp: number; fin: number; manoY: number } {
    const { kp, centro } = medidas();
    const wp = 100 * kp;
    const hp = 140 * kp;
    const ancho = raiz.clientWidth;
    const tel = telefono();
    const hueco = tel ? 4 : Math.round(6 * kp);
    const paso = nPostas > 1 ? Math.min(wp + hueco, (ancho - wp - 8) / (nPostas - 1)) : 0;
    const total = nPostas > 1 ? paso * (nPostas - 1) + wp : wp;
    // (0.28) escritorio: centrado sobre la mano si a su izquierda queda una columna cómoda para el desglose (1080p); si
    // no (la Deck, el portátil), arrimado a la derecha
    const centrado = (ancho - total) / 2;
    const x0 = tel || centro || centrado >= 460 ? Math.round(centrado) : Math.round(ancho - total - 2 * BORDE - 2);
    const aire = tel ? AIRE_TEL : 6;
    // (0.28) escritorio: la zona de la mano trae su franja fija arriba (el paño a la derecha, el desglose a la izquierda)
    const y = tel ? Math.max(BORDE, techoTel() - aire - BORDE - hp) : BORDE;
    const fin = y + hp + BORDE;
    return { xs: enPosta.map((_, i) => Math.round(x0 + i * paso)), y, paso, wp, hp, fin, manoY: fin + aire };
  }

  /** Dónde descansa cada carta: las elegidas en su Posta; las demás, en una fila centrada (o en dos, en el móvil). */
  function destinos(): Map<string, { x: number; y: number }> {
    const { w, h, k } = medidas();
    const ancho = raiz.clientWidth;
    const alto = raiz.clientHeight;
    const out = new Map<string, { x: number; y: number }>();
    const lp = lugaresPosta();
    lugarHuecos.clear();
    // (0.27) el Escalón ya no sube peldaños (el alto es oro): lo dice su sello sobre los naipes de la escalera
    const ponerPostas = (): void =>
      enPosta.forEach((id, i) => {
        if (!id) return;
        // (el lugar que dejó en la mano: ahí va su silueta)
        const en = out.get(id);
        if (en) lugarHuecos.set(id, en);
        out.set(id, { x: lp.xs[i], y: lp.y });
      });
    const enMano = naipes.filter((c) => !c.elegida);
    const hueco = Math.round(6 * k);
    const conPano = reservaPano();
    // (0.27) en el teléfono la mano NO se mueve al elegir, nunca: queda donde estaba en reposo (la zona de la mano
    // crece hacia arriba lo que pide el paño: ver `ajustarAlto`). En el escritorio baja lo justo bajo el paño
    const tel = telefono();
    // (0.28) y en el escritorio tampoco: la franja del paño es fija, la mano descansa siempre al pie de su zona, ENTERA
    // (descansa lo que flota por encima del pie de su zona: ni respirando pasa del borde del HUD)
    const base = tel ? baseTel() : alto - h - Math.round(2 * k);
    void conPano;
    // (la fila le abre lugar a la carta con el foco solo con teclado o mando: con el dedo o el ratón, el foco que deja un
    // toque no corre a nadie)
    const ent = document.documentElement.dataset.entrada;
    const foco = ent === 'teclado' || ent === 'mando' ? document.activeElement : null;
    /**
     * Una fila centrada. Si una carta tiene el foco y se monta sobre su vecina, la fila le abre lugar: la enfocada se
     * ve entera y las demás se aprietan (cada una conserva su índice a la vista).
     */
    const fila = (cartas: Naipe[], y: number): void => {
      const cuantas = cartas.length;
      // (0.28) escritorio: el naipe que subió al paño deja en la mano solo su canto (un cuarto de naipe, con su índice):
      // el ancho que libera es de los naipes vivos, que así no se montan (o se montan mucho menos)
      const cantos = !tel && cartas.some((c) => c.elegida) && cartas.some((c) => !c.elegida);
      if (cantos) {
        const q = Math.round(w * CANTO);
        const anchoDe = (c: Naipe): number => (c.elegida ? q : w);
        const ultimo = anchoDe(cartas[cuantas - 1]);
        const fijos = cartas.slice(0, -1).reduce((s0, c) => s0 + (c.elegida ? q + Math.round(hueco / 2) : 0), 0);
        const vivos = cartas.slice(0, -1).filter((c) => !c.elegida).length;
        const pasoV = vivos ? Math.min(w + hueco, (ancho - ultimo - fijos) / vivos) : 0;
        const fiV = cartas.findIndex((c) => c.el === foco && !c.elegida);
        const av = cartas.map((c) => (c.elegida ? q + Math.round(hueco / 2) : pasoV));
        // (la carta con el foco, si todavía se monta: la fila le abre lugar)
        if (fiV >= 0 && fiV < cuantas - 1 && pasoV < w + hueco - 1 && !arrastre && vivos > 1) {
          const minimo = Math.round(w * 0.46);
          let abre = w + hueco;
          let resto = (ancho - ultimo - fijos - abre) / (vivos - 1);
          if (resto < minimo) {
            resto = Math.min(pasoV, minimo);
            abre = Math.max(pasoV, ancho - ultimo - fijos - resto * (vivos - 1));
          }
          cartas.forEach((c, j) => {
            if (!c.elegida) av[j] = j === fiV ? abre : resto;
          });
        }
        const total0 = ultimo + av.slice(0, -1).reduce((a, b) => a + b, 0);
        let x0 = (ancho - total0) / 2;
        cartas.forEach((c, j) => {
          out.set(c.carta.id, { x: Math.round(x0), y });
          x0 += av[j];
        });
        return;
      }
      const pasoN = cuantas > 1 ? Math.min(w + hueco, (ancho - w) / (cuantas - 1)) : 0;
      const fi = cartas.findIndex((c) => c.el === foco && !c.elegida);
      const gaps: number[] = new Array(Math.max(0, cuantas - 1)).fill(pasoN);
      if (fi >= 0 && fi < cuantas - 1 && pasoN < w + hueco - 1 && !arrastre) {
        // (con el dedo, ninguna vecina queda con menos de 44 px tocables)
        // (0.28: fuera del teléfono, ninguna vecina queda en menos de media carta: la del foco se abre lo que eso deje)
        const minimo = Math.max(Math.round(26 * k), dedo() ? 44 : 0, tel ? 0 : Math.round(w * 0.46));
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
    // parte de arriba de cada naipe (su número y sus primeras pintas) y ninguna tapa de costado a otra.
    // Cada naipe conserva su lugar en su fila (el que subió al paño deja su hueco): nadie salta de una fila a la otra
    const N = naipes.length;
    const pasoTodas = N > 1 ? Math.min(w + hueco, (ancho - w) / (N - 1)) : 0;
    if (raiz.classList.contains('dos-filas') && N > 1 && pasoTodas < w * 0.8) {
      const atras = Math.ceil(N / 2);
      fila(naipes.slice(0, atras), base - DIANA + 2);
      fila(naipes.slice(atras), base);
      ponerPostas();
      return out;
    }
    // (0.23) la fila cuenta también los naipes que subieron al paño: cada uno deja su hueco hasta el golpe y las demás
    // no se corren bajo el dedo
    // (0.28) escritorio: el canto de cada naipe que subió queda en su lugar solo si TODO entra sin montarse (los vivos
    // enteros y los cantos entre ellos); si no, los vivos toman la fila entera y lo jugado se ve en el paño (una
    // silueta a caballo de un naipe vivo era un fantasma encima de la mano)
    const cantosCaben = !tel && enMano.length * (w + hueco) + (naipes.length - enMano.length) * (Math.round(w * CANTO) + Math.round(hueco / 2)) <= ancho + hueco;
    fila(tel ? (entraEnFila(naipes.length) ? naipes : enMano) : cantosCaben ? naipes : enMano, base);
    ponerPostas();
    return out;
  }
  /** (0.27) El lugar que cada naipe apoyado dejó en la mano (lo calcula `destinos` en cada cuadro). */
  const lugarHuecos = new Map<string, { x: number; y: number }>();
  /** ¿El paño ocupa su lugar? Con algo apoyado. */
  const reservaPano = (): boolean => enPosta.some(Boolean);
  /** ¿Entran n naipes en una fila dejando a cada uno al menos 44 px tocables? (la mano de 8 del teléfono, no) */
  const entraEnFila = (n: number): boolean => {
    const { w } = medidas();
    return n <= 1 || (raiz.clientWidth - w) / (n - 1) >= 44;
  };
  /** ¿Se juega con el dedo? (el teléfono o una pantalla táctil sin ratón) */
  const dedo = (): boolean => matchMedia('(pointer: coarse)').matches;
  /** ¿La mesa del teléfono? (la mano no se mueve al elegir) */
  const telefono = (): boolean => innerWidth <= 700;
  /**
   * En el teléfono, la `y` de la fila de adelante de la mano: la de reposo, siempre (más lo que creció la zona hacia
   * arriba). En el teléfono bajo, la mano de dos filas hunde su pie tras la barra del pulgar lo mismo en reposo que
   * con algo apoyado (`hunde`).
   */
  const baseTel = (): number => {
    const { tapa, h } = medidas();
    return Math.max(0, (altoNat.h || raiz.clientHeight - crece) - tapa - h) + hunde + crece;
  };
  /** En el teléfono, la `y` del borde de arriba de la mano (el de la fila de atrás, si va en dos). */
  const techoTel = (): number => baseTel() - (raiz.classList.contains('dos-filas') ? DIANA - 2 : 0);
  /**
   * (0.27) En el teléfono, con algo apoyado, la zona de la mano crece hacia ARRIBA (le saca alto a la escena) lo que
   * pide el paño con sus naipes enteros: la mano queda clavada donde estaba en reposo, en su fila o en sus dos filas,
   * y cada toque cae en el naipe que se ve. Sin pisos ni excepciones: la escala del paño (`kpAlto`) ya se eligió para
   * que entre con la cuenta plegada y el piso de la escena. Devuelve cuánto creció la zona en este cuadro (las cartas
   * corren su `y` eso mismo: en la pantalla no se mueve nada).
   */
  let altoNat = { clave: '', h: 0 };
  let crece = 0;
  function ajustarAlto(): number {
    const antes = crece;
    if (!telefono()) {
      if (crece || hunde || altoNat.h) {
        crece = hunde = 0;
        kpAlto = 1;
        altoNat = { clave: '', h: 0 };
        raiz.style.height = '';
      }
      return -antes;
    }
    const dos = raiz.classList.contains('dos-filas');
    const clave = `${innerWidth}x${innerHeight}|${dos}|${raiz.clientWidth}`;
    if (altoNat.clave !== clave) {
      raiz.style.height = '';
      crece = 0;
      const hN = raiz.clientHeight;
      if (hN <= 0) return -antes;
      // lo que queda entre el techo de la escena y el de la mano en reposo, menos el piso de la escena y la cuenta
      // plegada: eso es del paño. Si a la mano de dos filas no le alcanza para la escala que entra a lo ancho, hunde su
      // pie tras la barra del pulgar (hasta `HUNDE_MAX`), igual en reposo que al elegir
      const s = getComputedStyle(raiz);
      const tapa = Math.max(0, -parseFloat(s.marginBottom) || 0);
      const h = 140 * (Number(s.getPropertyValue('--k-naipe')) || 1);
      const escena = raiz.closest('.mesa')?.querySelector<HTMLElement>('.escena');
      const arriba = escena ? escena.getBoundingClientRect().top : raiz.getBoundingClientRect().top - 300;
      const techo = raiz.getBoundingClientRect().top + Math.max(0, hN - tapa - h) - (dos ? DIANA - 2 : 0);
      const libre = techo - arriba - ESCENA_PISO - CUENTA_PLEGADA - 6;
      const marco = 2 * BORDE + AIRE_TEL;
      const quiereKp = Math.max(0.5, Math.floor(Math.min(1, cabeAncho()) * 20 + 1e-6) / 20);
      hunde = dos ? Math.max(0, Math.min(HUNDE_MAX, Math.ceil(140 * quiereKp + marco - libre))) : 0;
      kpAlto = (libre + hunde - marco) / 140;
      altoNat = { clave, h: hN };
      cacheMedidas = null;
    }
    let quiere = 0;
    if (enPosta.some(Boolean) && altoNat.h > 0) {
      const { tapa, h, kp } = medidas();
      const techo = Math.max(0, altoNat.h - tapa - h) + hunde - (dos ? DIANA - 2 : 0);
      quiere = Math.max(0, Math.round(140 * kp + 2 * BORDE + AIRE_TEL - techo));
    }
    if (quiere !== crece) {
      crece = quiere;
      raiz.style.height = crece ? `${altoNat.h + crece}px` : '';
    }
    return crece - antes;
  }
  /** Aplica el alto de la zona y corre las cartas lo mismo (en la pantalla no se mueve nada). */
  function acomodarZona(): void {
    const corrio = ajustarAlto();
    if (corrio) for (const c of naipes) if (!c.vuela) c.y += corrio;
  }

  const puesto = new WeakMap<HTMLElement, string>();
  /** `corte`: lo que se recorta del pie del naipe (la mano que baja bajo el paño no se asoma por debajo de su zona). */
  function aplicar(c: Naipe, z = 0, corte = 0): void {
    const tr = `translate3d(${Math.round(c.x)}px,${Math.round(c.y)}px,0)${Math.abs(c.rot) > 0.05 ? ` rotate(${c.rot.toFixed(1)}deg)` : ''}${c.esc < 0.995 ? ` scale(${c.esc.toFixed(2)})` : ''}`;
    const clave = `${tr}|${z}|${corte}`;
    if (puesto.get(c.el) === clave) return;
    puesto.set(c.el, clave);
    c.el.style.transform = tr;
    c.el.style.zIndex = String(z);
    // (0.29: el naipe que va achicado bajo el dedo lleva su rótulo un escalón más grande: se sigue leyendo a 14 px)
    c.el.classList.toggle('achicada', c.esc < 0.95);
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
    const izq = Math.max(0, lp.xs[0] - 2 * BORDE);
    // (0.27) el fieltro abraza a sus naipes enteros, esté donde esté: pegado arriba de la mano (teléfono) o en la franja
    // del desglose (escritorio)
    pano.style.transform = `translate3d(${izq}px,${Math.round(lp.y - BORDE)}px,0)`;
    pano.style.width = `${Math.min(raiz.clientWidth - izq, lp.xs[nPostas - 1] + wp - lp.xs[0] + 4 * BORDE)}px`;
    pano.style.height = `${Math.round(lp.hp + 2 * BORDE)}px`;
    slots.forEach((el, i) => {
      ponerEn(el, lp.xs[i] - izq, BORDE, Z.pano);
      el.style.width = `${wp}px`;
      el.style.height = `${lp.hp}px`;
      el.style.setProperty('--visible', `${Math.round(visible)}px`);
      el.classList.toggle('llena', !!enPosta[i]);
      el.classList.toggle('apunta', (!!arrastre && arrastre.posta === i) || haciaPosta?.posta === i);
    });
    const conPano = reservaPano();
    const lleno = enPosta.some(Boolean);
    // (un arrastre desde la mano lo enciende solo cuando pasa por encima del paño: la mano en reposo no queda «adentro»)
    pano.classList.toggle('activo', lleno || (!!arrastre && arrastre.posta >= 0) || !!haciaPosta);
    // (0.28) en el escritorio el paño vacío no se va: sus Postas cosidas quedan apagadas en su franja (la mesa no salta)
    pano.classList.toggle('reservado', (conPano || !telefono()) && !pano.classList.contains('activo'));
    if (raiz.classList.contains('con-pano') !== conPano) {
      raiz.classList.toggle('con-pano', conPano);
      // (la mesa lo sabe: en el escritorio, el desglose de la cuenta le hace lugar a su derecha)
      raiz.closest('.mesa')?.classList.toggle('con-pano', conPano);
    }
    // el renglón de la regla: en reposo, en el aire de arriba de la mano. (0.27) Con algo apoyado calla: el desglose ya
    // nombra el Medio, la Chispa y el Escalón, y la pista de LB / RB la lleva la cuenta en un renglón que no se parte
    const ancho = raiz.clientWidth;
    regla.classList.remove('costado', 'arma');
    if (!conPano) {
      regla.style.maxWidth = `${ancho - 8}px`;
      // (0.27: y calla mientras se juega el golpe: el desglose de la cuenta sigue ahí al lado)
      const tel = telefono();
      regla.classList.toggle('costado', !tel);
      if (!tel) regla.style.maxWidth = `${Math.max(120, izq - 24)}px`;
      regla.hidden = bloqueada || raiz.classList.contains('arrastrando') || (tel ? techoTel() : raiz.clientHeight - h) < 24;
      // (0.28) escritorio: a la izquierda del paño, centrada en su franja (donde después va el desglose)
      if (!regla.hidden)
        ponerEn(regla, tel ? Math.round((ancho - regla.offsetWidth) / 2) : Math.max(4, Math.round((izq - regla.offsetWidth) / 2)), tel ? Math.max(2, Math.round(techoTel() - regla.offsetHeight - 4)) : Math.max(2, Math.round(lp.y + (lp.hp - regla.offsetHeight) / 2)), Z.pano);
    } else regla.hidden = true;
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
      // (0.27) adentro del canto de arriba del naipe, a la derecha de su índice: no asoma por encima del fieltro (arriba
      // está la cuenta). Sobre un Comodín (su rótulo COMODÍN va arriba y al centro), adentro de su esquina de abajo
      const altoM = marcaMedio.offsetHeight;
      const yMarca = nm.carta.palo !== 'X' ? nm.y + Math.round(2 * kp) : nm.y + lp.hp - altoM - Math.round(3 * kp);
      ponerEn(marcaMedio, nm.x + Math.round(visible) - anchoMarca.w - 2 * kp, yMarca, Z.marca);
    }
    // la Chispa: entre la Posta del Comodín y la de su derecha
    chispas.forEach((el, i) => {
      const si = marcas.chispas.includes(i);
      el.hidden = !si;
      // (en la costura, a media altura de los naipes: no tapa el índice de ninguno)
      if (si) ponerEn(el, Math.round((lp.xs[i] + wp + lp.xs[i + 1]) / 2 - el.offsetWidth / 2), lp.y + Math.round(lp.hp * 0.45 - el.offsetHeight / 2), Z.marca + 1);
    });
    // (0.27) el Escalón armado es un sello, no peldaños: una cinta sobre el pie de los naipes de la escalera, centrada
    // en ellos (ningún naipe sube ni pide alto: en el teléfono el alto es oro)
    rotEscalon.hidden = !marcas.escalon;
    if (marcas.escalon) {
      const llenas = enPosta.map((id, i) => (id ? i : -1)).filter((i) => i >= 0);
      const x0 = lp.xs[llenas[0] ?? 0];
      const x1 = lp.xs[llenas[llenas.length - 1] ?? nPostas - 1] + wp;
      const anchoR = rotEscalon.offsetWidth;
      ponerEn(rotEscalon, Math.round(Math.max(2, Math.min(ancho - anchoR - 2, (x0 + x1 - anchoR) / 2))), Math.round(lp.y + lp.hp - rotEscalon.offsetHeight - 3 * kp), Z.marca + 2);
    }
  }

  /** (0.27) Las siluetas de los huecos: una por naipe apoyado, en el lugar que dejó en la mano. */
  function pintarHuecos(): void {
    const { h, tapa } = medidas();
    const tel = telefono();
    for (const [id, el] of huecos) {
      if (lugarHuecos.has(id)) continue;
      el.remove();
      huecos.delete(id);
    }
    for (const [id, en] of lugarHuecos) {
      const c = naipes.find((x) => x.carta.id === id);
      if (!c || c.vuela) continue;
      let el = huecos.get(id);
      if (!el) {
        el = document.createElement('i');
        el.className = 'hueco';
        el.dataset.hueco = id;
        el.setAttribute('aria-hidden', 'true');
        el.innerHTML = pxNaipe(c.carta);
        raiz.append(el);
        huecos.set(id, el);
      }
      ponerEn(el, en.x, en.y, Z.mano + naipes.indexOf(c));
      // (como la mano: la silueta no asoma por debajo de su zona)
      const piso = tel ? raiz.clientHeight - tapa : raiz.clientHeight;
      const corte = (tel ? hunde > 0 : true) ? Math.max(0, Math.round(en.y + h - piso)) : 0;
      const { w } = medidas();
      const clip = !tel ? `inset(0 ${Math.round(w * (1 - CANTO))}px 0 0)` : corte > 0 ? `inset(0 0 ${corte}px 0)` : '';
      if (el.style.clipPath !== clip) el.style.clipPath = clip;
    }
  }

  function cuadro(ahora: number): void {
    if (!viva) return;
    const dt = Math.min(0.033, (ahora - ultimo) / 1000);
    ultimo = ahora;
    const quieto = todoQuieto();
    // (0.26) si la zona de la mano creció hacia arriba (o volvió), cada carta corre su `y` lo mismo: en la pantalla queda
    // donde estaba
    acomodarZona();
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
    const { h, tapa } = medidas();
    const tel = telefono();
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
      // la mano que bajó bajo el paño (escritorio) o que hunde su pie tras la barra del pulgar (teléfono bajo) no se
      // asoma por debajo de su zona. (0.27) El naipe apoyado va siempre entero
      let corte = 0;
      if (!c.vuela && z < 100 && !enPano) {
        if (tel && hunde > 0) corte = Math.max(0, Math.round(c.y + h - (alto - tapa)));
      }
      aplicar(c, z, corte);
    });
    pintarPano();
    pintarHuecos();
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
    const top = caja.top + lp.y - BORDE - 24;
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
  /** (0.27) Un toque en la silueta del hueco devuelve su naipe a la mano. */
  const tocaHueco = (ev: MouseEvent) => {
    const id = (ev.target as HTMLElement).closest<HTMLElement>('.hueco')?.dataset.hueco;
    if (id && !arrastre) alternar(id);
  };
  raiz.addEventListener('click', tocaHueco);
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
    subir(px) {
      sube = Math.max(0, Math.round(px));
    },
    panoIzq() {
      if (!reservaPano()) return null;
      const lp = lugaresPosta();
      return raiz.getBoundingClientRect().left + lp.xs[0] - 2 * BORDE;
    },
    panoDer() {
      if (!reservaPano()) return null;
      const lp = lugaresPosta();
      return raiz.getBoundingClientRect().left + lp.xs[nPostas - 1] + lp.wp + 2 * BORDE;
    },
    ajustar() {
      acomodarZona();
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
      raiz.removeEventListener('click', tocaHueco);
      raiz.removeEventListener('pointerdown', abajo);
      raiz.removeEventListener('pointermove', mueve);
      raiz.removeEventListener('pointerup', arriba);
      raiz.removeEventListener('pointercancel', cancela);
      raiz.removeEventListener('pointerleave', sale);
      raiz.removeEventListener('keydown', tecla);
    },
  };
}
