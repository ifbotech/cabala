// Los sprites en el navegador: cada mapa de la forja se pinta una sola vez en un lienzo y se guarda como imagen
// (data URL). De ahí salen los elementos `.px` (un sprite a escala entera, sin suavizado), las cifras dibujadas y
// las variables CSS de los marcos de 9 trozos.
import type { AmuletoId } from '../rules/amuletos';
import type { AumentoId } from '../rules/aumentos';
import type { Carta, Palo } from '../rules/cartas';
import type { TipoOferta } from '../rules/estado';
import type { MazoId } from '../rules/mazos';
import type { BendicionId } from '../rules/reyes';
import { cifraMapa, type TonoCifra } from './pixel/cifras';
import { amuletoMapa, aumentoMapa, bendicionMapa, hudMapa, inmuneMapa, nodoMapa, paloMapa, estrellaMapa, type HudPx, type NodoPx } from './pixel/iconos';
import { logoMapa } from './pixel/logo';
import { BARRAS, barraMapa, marcoMapa, panoMapa, type Estilo } from './pixel/marcos';
import { comodinMapa, dorsoNaipe, naipeMapa, naipeSegundaMapa } from './pixel/naipes';
import { tintas } from './pixel/paleta';
import { mitad } from './pixel/partido';
import { personajeMapa, type Cuadro } from './pixel/personajes';
import { pixeles } from './pixel/raster';
import { medida, type Mapa } from './pixel/rejilla';

const T = tintas();
const lienzos = new Map<string, HTMLCanvasElement>();
const urls = new Map<string, string>();

/** El lienzo de un sprite (se pinta la primera vez que se pide). */
export function lienzo(clave: string, hacer: () => Mapa): HTMLCanvasElement {
  let c = lienzos.get(clave);
  if (c) return c;
  const px = pixeles(hacer(), T);
  c = document.createElement('canvas');
  c.width = px.w;
  c.height = px.h;
  c.getContext('2d')!.putImageData(new ImageData(px.data as unknown as Uint8ClampedArray<ArrayBuffer>, px.w, px.h), 0, 0);
  lienzos.set(clave, c);
  return c;
}

/** La imagen de un sprite como data URL. */
export function url(clave: string, hacer: () => Mapa): string {
  let u = urls.get(clave);
  if (!u) {
    u = lienzo(clave, hacer).toDataURL('image/png');
    urls.set(clave, u);
  }
  return u;
}

/**
 * Un sprite como HTML: `<i class="px …">` del tamaño del mapa por la escala `--k` de donde caiga. `extra` añade
 * atributos (por ejemplo `data-…`).
 */
export function px(clave: string, hacer: () => Mapa, cls = '', extra = ''): string {
  const c = lienzo(clave, hacer);
  return `<i class="px ${cls}" style="--w:${c.width};--h:${c.height};background-image:url(${url(clave, hacer)})" ${extra}></i>`;
}

// ───────────── atajos por pieza ─────────────

export const pxNaipe = (c: Pick<Carta, 'palo' | 'n'>, cls = '') => (c.palo === 'X' ? px('naipe:X', comodinMapa, `naipe ${cls}`) : px(`naipe:${c.palo}${c.n}`, () => naipeMapa(c.palo as Palo, c.n), `naipe ${cls}`));
export const urlNaipe = (c: Pick<Carta, 'palo' | 'n'>) => (c.palo === 'X' ? url('naipe:X', comodinMapa) : url(`naipe:${c.palo}${c.n}`, () => naipeMapa(c.palo as Palo, c.n)));
export const lienzoNaipe = (palo: Palo, n: number) => lienzo(`naipe:${palo}${n}`, () => naipeMapa(palo, n));
/** El naipe del Rey en su segunda cara (otro dibujo: herido, enojado y con el rasgo de su segunda cara). */
export const pxNaipeSegunda = (palo: Palo, cls = '') => px(`naipe:${palo}seg`, () => naipeSegundaMapa(palo), `naipe ${cls}`);
export const lienzoNaipeSegunda = (palo: Palo) => lienzo(`naipe:${palo}seg`, () => naipeSegundaMapa(palo));
export const pxDorso = (mazo: MazoId, cls = '') => px(`dorso:${mazo}`, () => dorsoNaipe(mazo), `naipe ${cls}`);
export const pxAmuleto = (id: AmuletoId, cls = '') => px(`a:${id}`, () => amuletoMapa(id)!, `icono ${cls}`);
export const pxAumento = (id: AumentoId, cls = '') => px(`u:${id}`, () => aumentoMapa(id)!, `icono ${cls}`);
export const pxBendicion = (id: BendicionId, cls = '') => px(`b:${id}`, () => bendicionMapa(id)!, `icono ${cls}`);
export const pxPieza = (tipo: TipoOferta, id: string, cls = '') => (tipo === 'amuleto' ? pxAmuleto(id as AmuletoId, cls) : tipo === 'aumento' ? pxAumento(id as AumentoId, cls) : pxBendicion(id as BendicionId, cls));
export const pxNodo = (id: NodoPx, cls = '') => px(`n:${id}`, () => nodoMapa(id), `icono ${cls}`);
export const pxHud = (id: HudPx, cls = '') => px(`h:${id}`, () => hudMapa(id), `icono ${cls}`);
export const pxPalo = (s: Palo, cls = '') => px(`palo:${s}`, () => paloMapa(s), `pinta ${cls}`);
export const pxInmune = (s: Palo, cls = '') => px(`inmune:${s}`, () => inmuneMapa(s), `inmune ${cls}`);
export const pxEstrella = (cls = '') => px('estrella', estrellaMapa, `estrella ${cls}`);
export const pxLogo = (cls = '') => px('logo', logoMapa, `logo ${cls}`);
export const pxPano = (cls = '') => px('pano', panoMapa, `pano ${cls}`);
/**
 * Un dibujo partido en dos por una grieta (los Reyes vencidos en los finales, tu retrato en la derrota): las dos mitades,
 * cada una del tamaño del dibujo entero, para correrlas cada una para su lado a celda entera.
 */
export const pxMitades = (clave: string, hacer: () => Mapa, semilla: number, cls = ''): string =>
  px(`${clave}|izq`, () => mitad(hacer(), 'izq', semilla), `mitad m-izq ${cls}`) + px(`${clave}|der`, () => mitad(hacer(), 'der', semilla), `mitad m-der ${cls}`);
export const claveRetrato = (mazo: MazoId, c: Cuadro) => `pj:${mazo}|${c.mirada}|${c.gesto}|${c.herida}`;
export const urlRetrato = (mazo: MazoId, c: Cuadro) => url(claveRetrato(mazo, c), () => personajeMapa(mazo, c));

/**
 * Un número (o una cuenta corta: «52», «×6», «=312», «−8») dibujado con las cifras de la forja. Lleva `aria-label`
 * con el texto para quien no ve la imagen.
 */
export function cifra(texto: string | number, tono: TonoCifra = 'hueso', cls = ''): string {
  const s = String(texto).replace('×', 'x').replace('−', '-');
  const glifos = [...s].map((c) => (c === ' ' ? '<i class="cf-esp"></i>' : px(`cf:${tono}:${c}`, () => cifraMapa(c, tono), 'cf'))).join('');
  return `<span class="cifra ${cls}" role="img" aria-label="${String(texto)}">${glifos}</span>`;
}

/** Las variables CSS de la forja: los marcos de 9 trozos, las barras y el paño. Se llama una vez al arrancar. */
export function forjarCss(): void {
  const vars: string[] = [];
  const estilos: Estilo[] = ['madera', 'hierro', 'oro', 'dorado', 'hueso', 'hundido', 'plata', 'prisma', 'tinta', 'paloS', 'paloC', 'paloD', 'paloH'];
  for (const e of estilos) {
    vars.push(`--m-${e}:url(${url(`m:${e}`, () => marcoMapa(e))})`);
    vars.push(`--m-${e}-viva:url(${url(`m:${e}:viva`, () => marcoMapa(e, e !== 'hueso' && e !== 'hundido' && e !== 'tinta'))})`);
  }
  for (const [id, rampa] of Object.entries(BARRAS)) vars.push(`--b-${id}:url(${url(`barra:${id}`, () => barraMapa(rampa))})`);
  vars.push(`--pano:url(${url('pano', panoMapa)})`);
  const hoja = document.createElement('style');
  hoja.id = 'forja';
  hoja.textContent = `:root{${vars.join(';')}}`;
  document.head.append(hoja);
}

/** Una cola de sprites por forjar: se pintan de a uno en los ratos libres, para que ninguno frene un cuadro. */
const cola: (() => void)[] = [];
let forjando = false;
function ratoLibre(): void {
  const tarea = cola.shift();
  if (!tarea) {
    forjando = false;
    return;
  }
  tarea();
  const pedir = (window as unknown as { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => void }).requestIdleCallback;
  if (pedir) pedir(ratoLibre, { timeout: 400 });
  else setTimeout(ratoLibre, 30);
}
/** Deja pedidos unos sprites para forjarlos en segundo plano. */
export function forjarLuego(tareas: (() => unknown)[], primero = false): void {
  if (primero) cola.unshift(...tareas);
  else cola.push(...tareas);
  if (forjando) return;
  forjando = true;
  setTimeout(ratoLibre, 200);
}

/** Cuántos sprites quedan por forjar. */
export const porForjar = (): number => cola.length;

export { medida };
