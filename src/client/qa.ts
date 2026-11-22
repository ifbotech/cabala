// Estados fijos para la QA visual: `?qa=<estado>` monta una pantalla concreta de una partida determinista (semilla
// fija, perfil de muestra que no se guarda) y deja la escena en modo foto. `&lang=en` la pone en inglés, `&vivo`
// deja correr las animaciones y `&perfil=nuevo` usa un perfil recién estrenado.
import { acomodoExacto, mejorAcomodo, mejorGolpe, paso } from '../rules/bot';
import { cuenta, postasDe, postasPorDefecto } from '../rules/combate';
import type { Carta } from '../rules/cartas';
import type { Partida, TipoNodo } from '../rules/estado';
import type { MazoId } from '../rules/mazos';
import * as juego from '../rules/partida';
import { altarLleno, perfilNuevo, type Perfil } from '../rules/perfil';
import { ajustes, tx, usarPerfil } from './almacen';
import { gritar } from './hud';
import { GRITO } from './voces';
import { modoFoto } from './fx/motor';
import { irAjustes, irAltar, irColeccion, irCronica, irMazo, irPortada, pintarFase, sesion } from './juego';
import { $, enfocarJugador } from './ui';
import { mascaraHtml } from './pantallas/mesa';
import { BENDICION, BENDICIONES, type BendicionId } from '../rules/reyes';
import type { Palo } from '../rules/cartas';
import { jackpotEvolucion } from './evolucion';
import { t } from './almacen';

/** (0.22) Un don del Rey de ese palo, para despertar su Evolución en las fotos. */
function darDon(p: Partida, palo: Palo): void {
  const id = BENDICIONES.find((b) => BENDICION[b as BendicionId].rey === palo) as BendicionId | undefined;
  if (id) p.bendiciones[id] = 1;
}
/** Y el Amuleto Épico (dejando lugar si hace falta). */
function darAmuleto(p: Partida, id: Partida['amuletos'][number]): void {
  if (p.amuletos.includes(id)) return;
  if (p.amuletos.length >= p.huecos) p.amuletos.pop();
  p.amuletos.push(id);
}

export const ESTADOS = [
  'portada', 'elegir-mazo', 'elegi-una', 'mapa', 'mesa', 'mesa-seleccion', 'mesa-arrastrando', 'mesa-rey', 'mesa-segunda', 'mesa-mentiroso', 'botin', 'elegi-bendicion', 'elegi-amuleto',
  'pulperia', 'fogon', 'cabala', 'mazo', 'jugadas', 'piezas', 'mesa-mando', 'mapa-mando', 'altar', 'coleccion', 'coleccion-reyes', 'coleccion-amuletos', 'cronica', 'ajustes', 'fin-victoria', 'fin-derrota',
  'mesa-grito', 'botin-grito', 'mesa-segunda-cambia', 'botin-rey', 'mesa-conteo', 'mesa-escudo',
  'mesa-chispa', 'mesa-escalon', 'mesa-postas-arrastre', 'mesa-chiches', 'mesa-chiche-usa', 'mesa-prenda', 'pulperia-chiches', 'rey-mascara', 'mesa-escudo-mando',
  'evolucion-jackpot', 'hud-evolucion', 'oferta-evoluciona', 'forja-brava', 'cabala-negra', 'mapa-tesoro', 'botin-tesoro',
  'altar-devolver', 'resumen-victoria', 'resumen-derrota', 'mesa-exacto', 'fogon-mutaciones', 'hud-evolucion-foco',
  'mesa-dejalo-justo', 'resumen-derrota-movil', 'forja-brava-eleccion',
  'mesa-pega-todo', 'mesa-maldicion', 'mesa-garrote', 'mesa-limpia',
] as const;
export type EstadoQa = (typeof ESTADOS)[number];
/** Estados que solo tienen sentido en vivo (`&vivo`, para las secuencias del Jurado): no entran en la QA visual. */
export const ESTADOS_VIVOS = ['rey-abre'] as const;

/** Un perfil de muestra con algo de camino andado. */
function perfilMuestra(): Perfil {
  const p = perfilNuevo();
  p.porotos = 245;
  p.altar = { vida: 3, oro: 2, descuento: 1, suerte: 2, reyes: 1, hueco: 1, purga: 0 };
  p.stats = { partidas: 14, victorias: 3, reyes: 17, pokers: 2, exactos: 31, cantos: 120, abatidos: 233, mejorGolpe: 1284 };
  p.ganado = { escoba: 2, truco: 1, chinchon: 0, mentiroso: 0, chancho: 0 };
  p.aprendido = true;
  p.vistos = ['a:cuchillo', 'a:facon', 'a:rebenque', 'a:poncho', 'a:moneda', 'a:taba', 'a:mate', 'a:bota', 'a:caliz', 'a:cascabel', 'u:senafalsa', 'u:dardeabajo', 'u:vueltodemas', 'u:sermano', 'u:cartamarcada', 'u:manocaliente', 'u:retruco', 'u:faltaenvido', 'u:pactogarca', 'b:deguello', 'b:primerasangre', 'b:empalizada', 'b:contragolpe', 'b:interes', 'b:tabacargada', 'b:coparebosante', 'b:otraronda', 'b:hojabroquel', 'r:S', 'r:C', 'r:D'];
  p.cronica = [
    { fecha: 1, semilla: 'K7M2QX', mazo: 'escoba', reinado: 2, victoria: true, acto: 2, reyes: 3, abatidos: 27, mejorGolpe: 1284, turnos: 61, porotos: 156 },
    { fecha: 2, semilla: 'B4T9LD', mazo: 'truco', reinado: 1, victoria: false, acto: 1, reyes: 1, abatidos: 13, mejorGolpe: 402, turnos: 33, porotos: 47 },
    { fecha: 3, semilla: 'ZP3H8W', mazo: 'chinchon', reinado: 1, victoria: false, acto: 2, reyes: 2, abatidos: 22, mejorGolpe: 760, turnos: 52, porotos: 88 },
  ];
  return p;
}

const BOT = () => ({ rng: { rng: 12345 } });

/** Una partida determinista llevada por el bot hasta que se cumpla `cuando`. */
function partida(mazo: MazoId, cuando: (p: Partida) => boolean, semilla = 'QA', altar = perfilMuestra().altar as Record<string, number>, busca?: TipoNodo): Partida {
  let p = intento(mazo, cuando, semilla, altar, busca);
  for (let i = 1; i < 40 && !cuando(p); i++) p = intento(mazo, cuando, `${semilla}-${i}`, altar, busca);
  return p;
}

function intento(mazo: MazoId, cuando: (p: Partida) => boolean, semilla: string, altar: Record<string, number>, busca?: TipoNodo): Partida {
  const p = juego.nuevaPartida({ mazo, semilla, altar });
  const bot = BOT();
  for (let i = 0; i < 4000 && !cuando(p); i++) {
    // si se busca un tipo de nodo, se entra en cuanto queda a mano
    const nodo = busca && p.fase === 'mapa' ? juego.nodosAlcanzables(p).find((n) => n.tipo === busca) : undefined;
    if (nodo) juego.elegirNodo(p, nodo.id);
    else if (!paso(p, bot)) break;
  }
  return p;
}

function montar(p: Partida): void {
  sesion.partida = p;
  pintarFase();
}

export function montarQa(estado: string): void {
  const q = new URLSearchParams(location.search);
  sesion.qa = true;
  modoFoto(!q.has('vivo'));
  if (q.get('lang') === 'en' || q.get('lang') === 'es') ajustes.idioma = q.get('lang') as 'es' | 'en';
  document.documentElement.lang = ajustes.idioma;
  usarPerfil(q.get('perfil') === 'nuevo' ? perfilNuevo() : perfilMuestra());
  const mazo = (q.get('mazo') as MazoId) || 'escoba';
  // la mesa se fotografía con la mano de su Mazo (sin el Aumento que reparte cartas de más el primer turno)
  const enCombate = (p: Partida, acto = 1) => p.fase === 'combate' && p.acto >= acto && p.combate!.turno === 1 && p.combate!.golpes === 0 && p.combate!.mano.length === p.manoMax;
  switch (estado as EstadoQa | (typeof ESTADOS_VIVOS)[number]) {
    case 'portada':
      irPortada();
      break;
    case 'elegir-mazo':
      irMazo();
      break;
    case 'altar':
      irAltar();
      break;
    case 'altar-devolver':
      // (0.23) el Altar con una mejora comprada elegida: MEJORAR y DEVOLVER, con lo que vuelve
      irAltar();
      $<HTMLElement>('[data-accion="ofrenda"][data-id="vida"]')?.click();
      requestAnimationFrame(() => enfocarJugador($<HTMLElement>('[data-accion="devolver"]')));
      break;
    case 'coleccion':
      irColeccion();
      break;
    case 'coleccion-reyes':
      irColeccion();
      $<HTMLElement>('[data-id="reyes"]')?.click();
      break;
    case 'coleccion-amuletos':
      irColeccion();
      $<HTMLElement>('[data-id="amuletos"]')?.click();
      break;
    case 'cronica':
      irCronica();
      break;
    case 'ajustes':
      irAjustes();
      break;
    case 'elegi-una':
      montar(juego.nuevaPartida({ mazo, semilla: 'QA', altar: perfilMuestra().altar }));
      break;
    case 'mapa':
      montar(partida(mazo, (p) => p.fase === 'mapa' && p.camino.length >= 2));
      break;
    case 'mesa':
    case 'mesa-mando': // el foco lo pone la QA visual con el teclado, como lo pondría el mando
      montar(partida(mazo, (p) => enCombate(p)));
      break;
    case 'mapa-mando': // en el segundo tramo, donde el Jurado vio el «ESTÁS ACÁ» bajo los sellos de arriba
      montar(partida(mazo, (p) => p.fase === 'mapa' && p.acto >= 1 && p.camino.length >= 2));
      break;
    case 'mesa-seleccion':
    case 'mesa-arrastrando': {
      const p = partida(mazo, (x) => enCombate(x));
      montar(p);
      const m = mejorGolpe(p);
      const mesa = (window as unknown as { __mesa?: { mano: { elegir(ids: string[], postas?: number[]): void; posar(ids: string[], x: number, y: number): void } } }).__mesa;
      if (m && mesa) {
        if (estado === 'mesa-seleccion') mesa.mano.elegir(m.ids, m.postas);
        else {
          const r = $('[data-carta]')!.getBoundingClientRect();
          mesa.mano.posar(m.ids, r.left + r.width / 2, r.top + r.height * 0.62);
        }
      }
      break;
    }
    case 'mesa-rey':
      montar(partida(mazo, (p) => p.fase === 'combate' && !!p.combate!.fila[0]?.jefe));
      break;
    case 'rey-mascara': {
      // la micro-escena de entrada del Rey, quieta: el Bufón todavía con la máscara puesta
      const p = partida(mazo, (x) => x.fase === 'combate' && !!x.combate!.fila[0]?.jefe);
      montar(p);
      const el = document.createElement('div');
      el.className = 'cortina irrupcion quieta';
      el.innerHTML = mascaraHtml(p.combate!.fila[p.combate!.fila.length - 1].palo);
      $('#capa')?.append(el);
      break;
    }
    case 'rey-abre':
      // el duelo del Rey recién abierto (turno 1, sin golpes): en vivo, la irrupción entera
      montar(partida(mazo, (p) => p.fase === 'combate' && p.combate!.tipo === 'rey' && enCombate(p, 0)));
      break;
    case 'mesa-segunda':
    case 'mesa-segunda-cambia': {
      // el Rey ya en su segunda cara (bajo media Vida) y, si es el Caudillo, una selección que repite la jugada
      // anterior: la cuenta y el TE PEGA avisan el Tajo de revés antes de soltar
      const p = partida(mazo, (x) => x.fase === 'combate' && !!x.combate!.fila[0]?.jefe);
      const e = p.combate!.fila[0];
      e.segunda = true;
      e.vida = Math.floor(e.vidaMax * 0.5);
      const mano = p.combate!.mano;
      const posibles = () => [...mano.map((k) => [k]), ...mano.flatMap((k, i) => mano.slice(i + 1).map((j) => [k, j]))];
      // (la Carta sola no arma el Tajo: se busca otra jugada que no lo abata; si la mano no la tiene, sus dos cartas
      // más bajas que le hacen Daño se vuelven un par bajo: es una foto de QA, no una partida)
      const vivas = () =>
        posibles().filter((x) => {
          const q = cuenta(p, x);
          return q.ok && !q.abate && !q.ejecuta && !!q.contra && q.contra > 0;
        });
      if (e.jefe && e.palo === 'S' && !vivas().some((x) => cuenta(p, x).jugada !== 'sola')) {
        const bajas = mano.filter((k) => k.palo !== e.palo && k.palo !== 'X').sort((u, v) => u.n - v.n);
        for (const n of [bajas[0]?.n, 2, 1]) {
          if (bajas.length < 2 || n === undefined || vivas().some((x) => cuenta(p, x).jugada !== 'sola')) break;
          bajas[0].n = n;
          bajas[1].n = n;
        }
      }
      montar(p);
      const sel = vivas().find((x) => cuenta(p, x).jugada !== 'sola') ?? vivas()[0];
      const mesa = (window as unknown as { __mesa?: { mano: { elegir(ids: string[], postas?: number[]): void }; sincronizar(): void } }).__mesa;
      if (sel && mesa) {
        // (`-cambia`: la jugada de antes fue otra, el caso común de la segunda cara: no arma el Tajo y la placa del
        // TE PEGA queda con su Furia)
        const jugada = cuenta(p, sel).jugada;
        p.combate!.ultimaJugada = estado === 'mesa-segunda-cambia' ? (jugada === 'par' ? 'pierna' : 'par') : jugada;
        mesa.mano.elegir(sel.map((k) => k.id));
      }
      break;
    }
    case 'jugadas': {
      const p = partida(mazo, (x) => enCombate(x));
      montar(p);
      const m = mejorGolpe(p);
      const mesa = (window as unknown as { __mesa?: { mano: { elegir(ids: string[], postas?: number[]): void } } }).__mesa;
      if (m && mesa) mesa.mano.elegir(m.ids, m.postas);
      $<HTMLElement>('[data-accion="jugadas"]')?.click();
      break;
    }
    case 'piezas':
      montar(partida(mazo, (p) => p.fase === 'combate' && !!p.combate!.fila[0]?.jefe && p.acto >= 1));
      $<HTMLElement>('[data-accion="ver-piezas"]')?.click();
      break;
    case 'mesa-mentiroso':
    case 'mesa-escudo-mando': // la mano de 8 montada: la QA le pone el foco a la 2.ª, la 5.ª y la 8.ª carta
      montar(partida('mentiroso', (p) => enCombate(p)));
      break;
    case 'mesa-escudo': {
      // la misma mesa del Mentiroso con tu Escudo frenando casi todo el golpe que viene y una jugada elegida que no lo
      // abate: el chip dice «TE PEGA 3 (23 − 20 ESCUDO)». La QA compara la escena con la de `mesa-mentiroso` (la mesa
      // no se corre al elegir, regla «mesa-quieta»)
      const p = partida('mentiroso', (x) => enCombate(x));
      const c = p.combate!;
      const e = c.fila[0];
      const mano = c.mano;
      const posibles = [...mano.map((k) => [k]), ...mano.flatMap((k, i) => mano.slice(i + 1).map((j) => [k, j]))];
      const vivas = posibles.filter((x) => {
        const q = cuenta(p, x);
        return q.ok && !q.abate && !q.ejecuta;
      });
      // el Escudo propio frena todo menos 3 (si el enemigo pega poco, lo que haya)
      c.escudo = Math.max(1, e.ataque + c.furia - 3);
      montar(p);
      const sel = vivas.find((x) => (cuenta(p, x).contra ?? 0) > 0) ?? vivas[0];
      const mesa = (window as unknown as { __mesa?: { mano: { elegir(ids: string[], postas?: number[]): void } } }).__mesa;
      // (la QA vuelve a elegir esta jugada después de medir la mesa en reposo, en la misma página)
      (window as unknown as { __qaSel?: string[] }).__qaSel = sel?.map((k) => k.id) ?? [];
      if (sel && mesa) mesa.mano.elegir(sel.map((k) => k.id));
      break;
    }
    case 'mesa-chispa': {
      // el paño del Mentiroso (5 Postas) con el Comodín en una Posta y un naipe a su derecha: la Chispa dorada en la
      // costura y el naipe del Medio con su «x2 PEGA DOBLE»
      const p = partida('mentiroso', (x) => enCombate(x));
      const c = p.combate!;
      // (si la mano no trae el Comodín, la foto lo pone en lugar de su primer naipe)
      if (!c.mano.some((k) => k.palo === 'X')) c.mano[0] = { id: 'qa-comodin', palo: 'X', n: 0 };
      const x = c.mano.find((k) => k.palo === 'X');
      const otra = c.mano.find((k) => k.palo !== 'X' && k.palo !== c.fila[0].palo);
      montar(p);
      const mesa = (window as unknown as { __mesa?: { mano: { elegir(ids: string[], postas?: number[]): void } } }).__mesa;
      const medio = Math.floor(postasDe(p) / 2);
      if (x && otra && mesa) mesa.mano.elegir([x.id, otra.id], [medio - 1, medio]);
      break;
    }
    case 'mesa-escalon': {
      // tres o más naipes que suben de izquierda a derecha en el paño: cada uno un poco más alto y el rótulo ESCALÓN
      const p = partida('mentiroso', (x) => enCombate(x));
      const c = p.combate!;
      const n = postasDe(p);
      const enOrden = (sel: Carta[]): { ids: string[]; postas: number[] } => {
        const orden = [...sel].sort((a, b) => a.n - b.n);
        return { ids: orden.map((k) => k.id), postas: [...postasPorDefecto(n, sel.length)].sort((a, b) => a - b) };
      };
      const sirve = (sel: Carta[]): boolean => {
        const o = enOrden(sel);
        const q = cuenta(p, o.ids.map((id) => sel.find((k) => k.id === id)!), o.postas);
        return q.ok && !!q.escalon;
      };
      const lisas = c.mano.filter((k) => k.palo !== 'X' && k.palo !== c.fila[0].palo);
      let elegidas: Carta[] | undefined;
      for (let i = 0; i < lisas.length && !elegidas; i++)
        for (let j = i + 1; j < lisas.length && !elegidas; j++)
          for (let k = j + 1; k < lisas.length && !elegidas; k++) if (sirve([lisas[i], lisas[j], lisas[k]])) elegidas = [lisas[i], lisas[j], lisas[k]];
      if (!elegidas && lisas.length >= 3) {
        // (es una foto de QA: tres naipes se vuelven una escalera 4-5-6)
        lisas.slice(0, 3).forEach((k, i) => (k.n = 4 + i));
        elegidas = lisas.slice(0, 3);
      }
      montar(p);
      const mesa = (window as unknown as { __mesa?: { mano: { elegir(ids: string[], postas?: number[]): void } } }).__mesa;
      if (elegidas && mesa) {
        const o = enOrden(elegidas);
        mesa.mano.elegir(o.ids, o.postas);
      }
      break;
    }
    case 'mesa-postas-arrastre': {
      // una carta del paño a medio camino de su Posta a otra libre: la de destino se marca en oro
      const p = partida(mazo, (x) => enCombate(x));
      montar(p);
      const m = mejorGolpe(p);
      const mesa = (window as unknown as { __mesa?: { mano: { elegir(ids: string[], postas?: number[]): void; arrastrarA(id: string, posta: number): void } } }).__mesa;
      if (m && mesa) {
        mesa.mano.elegir(m.ids, m.postas);
        const usadas = new Set(m.postas ?? postasPorDefecto(postasDe(p), m.ids.length));
        const libre = [...Array(postasDe(p)).keys()].find((i) => !usadas.has(i));
        if (libre !== undefined) mesa.mano.arrastrarA(m.ids[0], libre);
      }
      break;
    }
    case 'botin':
      montar(partida(mazo, (p) => p.fase === 'botin' && p.botin!.de === 'guardia' && p.acto >= 1));
      break;
    case 'elegi-bendicion': {
      montar(partida(mazo, (p) => p.fase === 'botin' && p.botin!.de === 'guardia' && p.acto >= 1));
      $<HTMLElement>('[data-accion="abrir"]')?.click();
      break;
    }
    case 'elegi-amuleto': {
      montar(partida(mazo, (p) => p.fase === 'botin' && p.botin!.de === 'elite', 'QA', undefined, 'elite'));
      $<HTMLElement>('[data-accion="abrir"]')?.click();
      break;
    }
    case 'pulperia':
      montar(partida(mazo, (p) => p.fase === 'pulperia', 'QA', undefined, 'pulperia'));
      break;
    case 'pulperia-chiches': {
      // el mostrador con un Chiche ya vendido y la bandeja con dos de tres: el que queda se puede llevar
      const p = partida(mazo, (x) => x.fase === 'pulperia', 'QA', undefined, 'pulperia');
      p.chiches = ['ginebra', 'dado', null];
      const venta = p.tienda?.chiches;
      if (venta?.length) venta[0].vendido = true;
      montar(p);
      break;
    }
    case 'mesa-chiches':
    case 'mesa-chiche-usa':
    case 'mesa-prenda': {
      // la bandeja de Chiches llena sobre la madera; usando el Fósforo (vuela al enemigo y le quema el Inmune) con la
      // mejor jugada elegida; y la Prenda: un Dado Cargado que vuela del caído a su hueco
      const p = partida(mazo, (x) => enCombate(x));
      p.chiches = estado === 'mesa-prenda' ? ['ginebra', 'dado', null] : ['ginebra', 'dado', 'fosforo'];
      // (0.23) el Fósforo sin naipes del palo Inmune se niega: la foto le da uno (en lugar del último de la mano)
      if (estado === 'mesa-chiche-usa') {
        const c = p.combate!;
        const palo = c.fila[0].palo;
        if (!c.mano.some((k) => k.palo === palo)) c.mano[c.mano.length - 1] = { id: 'qa-inmune', palo, n: 5 };
      }
      montar(p);
      const mesa = (window as unknown as { __mesa?: { mano: { elegir(ids: string[], postas?: number[]): void }; usarChiche(i: number): Promise<void>; prenda(id: string): Promise<void> } }).__mesa;
      if (!mesa) break;
      if (estado === 'mesa-chiche-usa')
        void mesa.usarChiche(2).then(() => {
          const m = mejorGolpe(p);
          if (m) mesa.mano.elegir(m.ids, m.postas);
        });
      if (estado === 'mesa-prenda') void mesa.prenda('dado');
      break;
    }
    case 'mesa-dejalo-justo':
    case 'mesa-pega-todo':
    case 'mesa-exacto': {
      // (0.23) el dial del paño: lo elegido, acomodado al máximo, sobra; otra manera de apoyarlo abate justo.
      // (0.25) Sin Perfora la mesa ya lo apoya justo sola (`mesa-exacto`: ¡EXACTO!, sin dial); con Perfora (la Lanza) y
      // alguien detrás, la mesa pega con todo y el dial ofrece DEJALO JUSTO con lo que pierde (`mesa-dejalo-justo`);
      // aplicado, ofrece PEGÁ CON TODO con lo que pasa al siguiente (`mesa-pega-todo`)
      const p = partida(mazo, (x) => enCombate(x) && x.combate!.fila.length > 1);
      const conPerfora = estado !== 'mesa-exacto';
      if (conPerfora) darAmuleto(p, 'lanza');
      const m = p.combate!.mano.filter((k) => conPerfora || k.palo !== 'S');
      const subs: Carta[][] = [];
      for (let a = 0; a < m.length; a++)
        for (let b = a + 1; b < m.length; b++) {
          subs.push([m[a], m[b]]);
          for (let d = b + 1; d < m.length; d++) subs.push([m[a], m[b], m[d]]);
        }
      for (let a = 0; a < m.length; a++) subs.push([m[a]]);
      let elegidas: Carta[] = [];
      for (const sel of subs) {
        const max = cuenta(p, sel, mejorAcomodo(p, sel));
        // (la de por defecto suele ser la máxima: se busca entre todas las maneras de apoyarlas una que pegue menos)
        const maneras: number[][] = [];
        const n = postasDe(p);
        const armar = (hecho: number[]): void => {
          if (hecho.length === sel.length) return void maneras.push(hecho);
          for (let x = 0; x < n; x++) if (!hecho.includes(x)) armar([...hecho, x]);
        };
        armar([]);
        const def = maneras.map((pos) => cuenta(p, sel, pos)).find((q) => q.ok && q.aVida > 0 && q.aVida < max.aVida);
        if (!def || !max.ok) continue;
        const e = p.combate!.fila[0];
        const vida = e.vida;
        e.vida = def.aVida;
        if (acomodoExacto(p, sel)) {
          elegidas = sel;
          break;
        }
        e.vida = vida;
      }
      montar(p);
      const mesa = (window as unknown as { __mesa?: { mano: { elegir(ids: string[], postas?: number[]): void } } }).__mesa;
      if (mesa && elegidas.length) mesa.mano.elegir(elegidas.map((k) => k.id));
      // (0.25) con el mando: el dial lleva R3 (la Y sigue siendo DESCARTAR); el Bufón lo presenta
      if (estado !== 'mesa-exacto') document.documentElement.dataset.entrada = 'mando';
      if (estado === 'mesa-pega-todo') $<HTMLElement>('[data-accion="dial"]')?.click();
      break;
    }
    case 'mesa-maldicion':
    case 'mesa-garrote': {
      // (0.25) la maldición a la vista antes de golpear: con el Facón Maldito, un golpe que no abate avisa «−3 de Vida»;
      // con el Garrote del Cacique, las Copas elegidas dan Escudo («Copas → Escudo»)
      const p = partida(mazo, (x) => enCombate(x));
      const de = estado === 'mesa-maldicion' ? 'lanza' : 'poncho';
      darAmuleto(p, de);
      darDon(p, de === 'lanza' ? 'S' : 'C');
      const c = p.combate!;
      // (es una foto de QA: si la mano no trae una Copa, la primera carta lo es)
      if (de === 'poncho' && !c.mano.some((k) => k.palo === 'H')) c.mano[0] = { ...c.mano[0], palo: 'H' };
      const sola = c.mano
        .filter((k) => k.palo !== 'X' && (de === 'lanza' || k.palo === 'H'))
        .map((k) => [k])
        .find((sel) => {
          const q = cuenta(p, sel);
          return q.ok && !q.abate && !q.ejecuta;
        });
      montar(p);
      const mesa = (window as unknown as { __mesa?: { mano: { elegir(ids: string[], postas?: number[]): void } } }).__mesa;
      if (sola && mesa) mesa.mano.elegir(sola.map((k) => k.id));
      break;
    }
    case 'mesa-limpia':
      // (0.25) la Escoba en el primer tramo arranca con Escudo: el rótulo MESA LIMPIA sobre su caja y el Bufón que lo dice
      montar(partida('escoba', (p) => p.acto === 0 && enCombate(p, 0)));
      break;
    case 'fogon':
      montar(partida(mazo, (p) => p.fase === 'fogon', 'QA', undefined, 'fogon'));
      break;
    case 'evolucion-jackpot': {
      // (0.22) el jackpot de la Evolución, quieto en el medio de su 1,2 s, sobre el Botín donde se tomó la pieza: el Poncho
      // que despierta Garrote del Cacique
      const p = partida(mazo, (x) => x.fase === 'botin' && x.botin!.de === 'guardia' && x.acto >= 1);
      darAmuleto(p, 'poncho');
      darDon(p, 'C');
      montar(p);
      void jackpotEvolucion('poncho');
      break;
    }
    case 'hud-evolucion-foco':
    case 'hud-evolucion': {
      // la mesa con el Poncho ya despierto: su ficha prismática en el HUD
      const p = partida(mazo, (x) => enCombate(x));
      darAmuleto(p, 'poncho');
      darDon(p, 'C');
      montar(p);
      // (0.23) con el foco en la bandeja (adonde llegan el mando y el teclado), su ayuda dice en qué se volvió
      // (cuando la mesa ya se acomodó: la ayuda esquiva la mano y los botones donde quedan)
      if (estado === 'hud-evolucion-foco') requestAnimationFrame(() => enfocarJugador($<HTMLElement>('[data-tiras]')));
      break;
    }
    case 'oferta-evoluciona': {
      // «ELEGÍ UNA» tras la Élite con el Cáliz en la oferta y un don de Copas en el bolsillo: «★ EVOLUCIONA»
      const p = partida(mazo, (x) => x.fase === 'botin' && x.botin!.de === 'elite', 'QA', undefined, 'elite');
      darDon(p, 'H');
      p.amuletos = p.amuletos.filter((a) => a !== 'caliz');
      const it = p.botin!.items.find((i) => i.t === 'oferta' && i.oferta.tipo === 'amuleto');
      if (it && it.t === 'oferta' && !it.oferta.opciones.includes('caliz')) it.oferta.opciones[0] = 'caliz';
      montar(p);
      $<HTMLElement>(`[data-accion="abrir"][data-i="${p.botin!.items.indexOf(it!)}"]`)?.click();
      break;
    }
    case 'forja-brava-eleccion':
    case 'fogon-mutaciones': {
      // (0.23) el naipe Templado (dos pasadas) y la tercera a elegir: las dos mutaciones a la vista, con efecto y costo
      const p = partida(mazo, (x) => x.fase === 'fogon', 'QA', undefined, 'fogon');
      const c = p.mazo.find((k) => k.palo !== 'X')!;
      c.temple = 8;
      c.templada = true;
      p.fogonCarta = c.id;
      p.fogonPasadas = 2;
      p.fogonHecho = true;
      p.fogonMutaciones = ['doblefilo', 'oro'];
      montar(p);
      // (0.24) las dos cartas de elección, como las ve el mando (glifos y SEGUIR secundario)
      if (estado === 'forja-brava-eleccion') document.documentElement.dataset.entrada = 'mando';
      break;
    }
    case 'forja-brava': {
      // la tercera pasada recién salida del fuego: «¡FORJA BRAVA!» sobre el naipe y su mutación (Doble Filo)
      const p = partida(mazo, (x) => x.fase === 'fogon', 'QA', undefined, 'fogon');
      const c = p.mazo.find((k) => k.palo !== 'X')!;
      c.temple = 12;
      c.templada = true;
      c.brava = true;
      c.mutacion = 'doblefilo';
      p.fogonCarta = c.id;
      p.fogonPasadas = 3;
      p.fogonHecho = true;
      montar(p);
      $('.opcion.fuego')?.insertAdjacentHTML('afterbegin', `<b class="forja-grito rotulo" role="status" style="animation: none">${t('forjaBrava')}</b>`);
      break;
    }
    case 'cabala-negra': {
      // la Cábala Negra con «Coser dos iguales» abierta: un naipe ya elegido y los de otro número apagados
      const p = partida(mazo, (x) => x.fase === 'cabala', 'QA', undefined, 'cabala');
      p.cabala = { id: 'negra' };
      montar(p);
      $<HTMLElement>('[data-accion="opcion"][data-id="coser"]')?.click();
      $<HTMLElement>('.negra-naipe:not(:disabled)')?.click();
      break;
    }
    case 'mapa-tesoro': {
      // el Mapa con el cofre de un Tesoro a la vista (con su candado de oro)
      const p = partida(mazo, (x) => x.fase === 'mapa' && x.camino.length >= 1);
      const tramo = p.tramos[p.acto];
      if (!tramo.nodos.some((n) => n.tesoro)) {
        const libre = tramo.nodos.find((n) => n.tipo === 'guardia' && !p.camino.includes(n.id) && n.piso > 1);
        if (libre) libre.tesoro = 'oro';
      }
      montar(p);
      break;
    }
    case 'botin-tesoro': {
      // el Botín de una Guardia con el cofre del Tesoro: candado de oro que no alcanza (las dos opciones apagadas)
      const p = partida(mazo, (x) => x.fase === 'botin' && x.botin!.de === 'guardia' && x.acto >= 1);
      p.oro = 7;
      p.botin!.items.push({ t: 'oferta', oferta: { tipo: 'amuleto', opciones: ['caliz', 'mate'], tesoro: true, precio: 27 } });
      montar(p);
      $<HTMLElement>(`[data-accion="abrir"][data-i="${p.botin!.items.length - 1}"]`)?.click();
      break;
    }
    case 'cabala':
      montar(partida(mazo, (p) => p.fase === 'cabala', 'QA', undefined, 'cabala'));
      break;
    case 'mazo': {
      montar(partida(mazo, (p) => p.fase === 'mapa' && p.camino.length >= 2));
      $<HTMLElement>('[data-accion="ver-mazo"]')?.click();
      break;
    }
    case 'resumen-victoria':
    case 'fin-victoria': {
      let p: Partida | null = null;
      for (let i = 0; i < 40 && !p?.fin?.victoria; i++) p = partida(mazo, (x) => x.fase === 'fin', `QA${i}`, altarLleno());
      montar(p!);
      break;
    }
    case 'resumen-derrota':
    case 'resumen-derrota-movil':
    case 'fin-derrota': {
      let p: Partida | null = null;
      for (let i = 0; i < 40 && (!p || p.fin?.victoria); i++) p = partida('truco', (x) => x.fase === 'fin', `QA${i}`, {});
      montar(p!);
      // (0.24) en el teléfono, la segunda capa: el cuadro deslizado hasta el fondo (QUÉ TE FRENÓ, el récord y los Porotos
      // quedan sobre la fila de botones, no debajo)
      if (estado === 'resumen-derrota-movil') {
        const cuadro = $<HTMLElement>('.fin-cuadro');
        if (cuadro) cuadro.scrollTop = cuadro.scrollHeight;
        // (0.25: y otra vez cuando terminan de pintarse las cifras, que lo alargan)
        if (cuadro) new ResizeObserver(() => (cuadro.scrollTop = cuadro.scrollHeight)).observe(cuadro.querySelector('.fin-panel') ?? cuadro);
      }
      break;
    }
    case 'mesa-grito': {
      // el grito del Personaje a la vista (quieto), en plena mesa: no tapa la mano, los botones ni la cuenta
      montar(partida(mazo, (p) => p.fase === 'combate' && !!p.combate!.fila[0]?.jefe));
      gritar(mazo, tx(GRITO[mazo].dolor[0]), { foto: true });
      break;
    }
    case 'botin-grito': {
      // y en el botín, recién ganado: no tapa SEGUIR
      montar(partida(mazo, (p) => p.fase === 'botin' && p.botin!.de === 'guardia' && p.acto >= 1));
      gritar(mazo, tx(GRITO[mazo].gana), { foto: true });
      break;
    }
    case 'botin-rey': {
      // el botín de un Rey vencido con sus cinco piezas (oro, Vida máxima, Vida, Amuleto, Cábala): no tapa al Bufón ni
      // a su bocadillo, cada rótulo entra en dos renglones como mucho, y el grito del Personaje cae junto a su retrato
      const p = partida(mazo, (x) => x.fase === 'botin' && x.botin!.de === 'rey');
      const b = p.botin!;
      // (si la Vida ya estaba llena, la pieza de Vida no salió: se pone a mano, es una foto de QA)
      if (!b.items.some((i) => i.t === 'cura')) b.items.splice(Math.max(1, b.items.findIndex((i) => i.t === 'oferta')), 0, { t: 'cura', n: 12, hecho: true });
      if (!b.items.some((i) => i.t === 'vidamax')) b.items.splice(1, 0, { t: 'vidamax', n: 12, hecho: true });
      montar(p);
      gritar(mazo, tx(GRITO[mazo].gana), { foto: true });
      break;
    }
    case 'mesa-conteo': {
      // el conteo del golpe congelado a mitad, con el Tajo de revés armado y un Crítico de Punta y hacha: la cuenta
      // no cambia de alto ni de renglones al contar, y lo del Rey (TE PEGA) no se monta sobre la cabecera
      const p = partida(mazo, (x) => x.fase === 'combate' && !!x.combate!.fila[0]?.jefe);
      const e = p.combate!.fila[0];
      e.palo = 'S';
      e.segunda = true;
      e.vida = Math.floor(e.vidaMax / 2);
      e.escudo = 0;
      p.bendiciones.puntahacha = 3;
      const c = p.combate!;
      const mano = c.mano;
      // un Par que no lo abate (dos cartas fuera de Espadas con el mismo número)
      const fuera = mano.filter((k) => k.palo !== 'S' && k.palo !== 'X');
      if (fuera.length >= 2) fuera[1].n = fuera[0].n;
      const ids = fuera.slice(0, 2).map((k) => k.id);
      // el Crítico cae en este golpe (uno de cada 2 con Punta y hacha al nivel 3)
      for (let g = 0; g < 4 && !cuenta(p, mano.filter((k) => ids.includes(k.id))).critico; g++) c.golpes = g;
      const q = cuenta(p, mano.filter((k) => ids.includes(k.id)));
      c.ultimaJugada = q.jugada;
      // el Rey aguanta el golpe (le queda Vida para pegarte con el Tajo) y ya está bajo media Vida
      e.vida = Math.max(e.vida, q.total + 60);
      e.vidaMax = Math.max(e.vidaMax, e.vida * 2);
      montar(p);
      const mesa = (window as unknown as { __mesa?: { mano: { elegir(ids: string[], postas?: number[]): void }; conteoQa(f: number): void } }).__mesa;
      if (mesa && ids.length === 2) {
        mesa.mano.elegir(ids);
        mesa.conteoQa(0.75);
      }
      break;
    }
    default:
      irPortada();
  }
  // la QA espera esta marca: la pantalla ya está montada y quieta
  requestAnimationFrame(() => requestAnimationFrame(() => (document.documentElement.dataset.qa = 'listo')));
}
