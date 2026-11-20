// Estados fijos para la QA visual: `?qa=<estado>` monta una pantalla concreta de una partida determinista (semilla
// fija, perfil de muestra que no se guarda) y deja la escena en modo foto. `&lang=en` la pone en inglés, `&vivo`
// deja correr las animaciones y `&perfil=nuevo` usa un perfil recién estrenado.
import { mejorGolpe, paso } from '../rules/bot';
import type { Partida, TipoNodo } from '../rules/estado';
import type { MazoId } from '../rules/mazos';
import * as juego from '../rules/partida';
import { altarLleno, perfilNuevo, type Perfil } from '../rules/perfil';
import { ajustes, usarPerfil } from './almacen';
import { modoFoto } from './fx/motor';
import { irAjustes, irAltar, irColeccion, irCronica, irMazo, irPortada, pintarFase, sesion } from './juego';
import { $ } from './ui';

export const ESTADOS = [
  'portada', 'elegir-mazo', 'elegi-una', 'mapa', 'mesa', 'mesa-seleccion', 'mesa-arrastrando', 'mesa-rey', 'mesa-mentiroso', 'botin', 'elegi-bendicion', 'elegi-amuleto',
  'pulperia', 'fogon', 'cabala', 'mazo', 'jugadas', 'piezas', 'mesa-mando', 'mapa-mando', 'altar', 'coleccion', 'coleccion-reyes', 'coleccion-amuletos', 'cronica', 'ajustes', 'fin-victoria', 'fin-derrota',
] as const;
export type EstadoQa = (typeof ESTADOS)[number];

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
  switch (estado as EstadoQa) {
    case 'portada':
      irPortada();
      break;
    case 'elegir-mazo':
      irMazo();
      break;
    case 'altar':
      irAltar();
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
    case 'mapa-mando':
      montar(partida(mazo, (p) => p.fase === 'mapa' && p.camino.length >= 2));
      break;
    case 'mesa-seleccion':
    case 'mesa-arrastrando': {
      const p = partida(mazo, (x) => enCombate(x));
      montar(p);
      const m = mejorGolpe(p);
      const mesa = (window as unknown as { __mesa?: { mano: { elegir(ids: string[]): void; posar(ids: string[], x: number, y: number): void } } }).__mesa;
      if (m && mesa) {
        if (estado === 'mesa-seleccion') mesa.mano.elegir(m.ids);
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
    case 'jugadas': {
      const p = partida(mazo, (x) => enCombate(x));
      montar(p);
      const m = mejorGolpe(p);
      const mesa = (window as unknown as { __mesa?: { mano: { elegir(ids: string[]): void } } }).__mesa;
      if (m && mesa) mesa.mano.elegir(m.ids);
      $<HTMLElement>('[data-accion="jugadas"]')?.click();
      break;
    }
    case 'piezas':
      montar(partida(mazo, (p) => p.fase === 'combate' && !!p.combate!.fila[0]?.jefe && p.acto >= 1));
      $<HTMLElement>('[data-accion="ver-piezas"]')?.click();
      break;
    case 'mesa-mentiroso':
      montar(partida('mentiroso', (p) => enCombate(p)));
      break;
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
    case 'fogon':
      montar(partida(mazo, (p) => p.fase === 'fogon', 'QA', undefined, 'fogon'));
      break;
    case 'cabala':
      montar(partida(mazo, (p) => p.fase === 'cabala', 'QA', undefined, 'cabala'));
      break;
    case 'mazo': {
      montar(partida(mazo, (p) => p.fase === 'mapa' && p.camino.length >= 2));
      $<HTMLElement>('[data-accion="ver-mazo"]')?.click();
      break;
    }
    case 'fin-victoria': {
      let p: Partida | null = null;
      for (let i = 0; i < 40 && !p?.fin?.victoria; i++) p = partida(mazo, (x) => x.fase === 'fin', `QA${i}`, altarLleno());
      montar(p!);
      break;
    }
    case 'fin-derrota': {
      let p: Partida | null = null;
      for (let i = 0; i < 40 && (!p || p.fin?.victoria); i++) p = partida('truco', (x) => x.fase === 'fin', `QA${i}`, {});
      montar(p!);
      break;
    }
    default:
      irPortada();
  }
  // la QA espera esta marca: la pantalla ya está montada y quieta
  requestAnimationFrame(() => requestAnimationFrame(() => (document.documentElement.dataset.qa = 'listo')));
}
