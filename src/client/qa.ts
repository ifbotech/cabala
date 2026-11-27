// Estados fijos para la QA visual de CÁBALA 2.0 (MVP 2D): `?qa=<estado>` monta una pantalla determinista.
import { mejorGolpe, paso } from '../rules/bot';
import { cuenta } from '../rules/combate';
import type { Partida } from '../rules/estado';
import type { MazoId } from '../rules/mazos';
import * as juego from '../rules/partida';
import { perfilNuevo, type Perfil } from '../rules/perfil';
import { ajustes, usarPerfil } from './almacen';
import { modoFoto } from './fx/motor';
import { irAjustes, irColeccion, irDueloBufon, irMazo, irPortada, pintarFase, sesion } from './juego';
import { $ } from './ui';
import { BENDICION, BENDICIONES, type BendicionId } from '../rules/reyes';
import type { Palo } from '../rules/cartas';

function darDon(p: Partida, palo: Palo): void {
  const b = (BENDICIONES as readonly BendicionId[]).find((id) => BENDICION[id].rey === palo);
  if (b) p.bendiciones[b] = 1;
}

function darAmuleto(p: Partida, id: Partida['amuletos'][number]): void {
  if (p.amuletos.includes(id)) return;
  if (p.amuletos.length >= p.huecos) p.amuletos.pop();
  p.amuletos.push(id);
}

export const ESTADOS = [
  'portada', 'elegir-mazo', 'coleccion', 'coleccion-reyes', 'coleccion-amuletos', 'ajustes',
  'mesa', 'mesa-seleccion', 'mesa-rey', 'mesa-segunda', 'mesa-mentiroso',
  'pulperia', 'duelo-bufon', 'botin', 'elegi-bendicion', 'elegi-amuleto',
  'mazo', 'jugadas', 'piezas', 'fin-victoria', 'fin-derrota',
] as const;
export type EstadoQa = (typeof ESTADOS)[number];
export const ESTADOS_VIVOS = ['rey-abre'] as const;

function perfilMuestra(): Perfil {
  const p = perfilNuevo();
  p.stats = { partidas: 14, victorias: 3, reyes: 17, pokers: 2, exactos: 31, cantos: 120, abatidos: 233, mejorGolpe: 1284 };
  p.ganado = { escoba: 2, truco: 1, chinchon: 0, mentiroso: 0, chancho: 0 };
  p.aprendido = true;
  p.vistos = ['a:cuchillo', 'a:facon', 'a:rebenque', 'a:poncho', 'a:moneda', 'a:taba', 'a:mate', 'a:bota', 'a:caliz', 'a:cascabel', 'b:deguello', 'b:primerasangre', 'b:empalizada', 'b:contragolpe', 'b:interes', 'b:tabacargada', 'r:S', 'r:C', 'r:D'];
  return p;
}

const BOT = () => ({ rng: { rng: 12345 } });

function partida(mazo: MazoId, cuando: (p: Partida) => boolean, semilla = 'QA'): Partida {
  let p = juego.nuevaPartida({ mazo, semilla });
  const bot = BOT();
  for (let i = 0; i < 800 && !cuando(p); i++) {
    if (!paso(p, bot)) break;
  }
  if (!cuando(p)) {
    for (let s = 1; s < 30 && !cuando(p); s++) {
      p = juego.nuevaPartida({ mazo, semilla: `${semilla}-${s}` });
      for (let i = 0; i < 800 && !cuando(p); i++) {
        if (!paso(p, bot)) break;
      }
    }
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
  const enCombate = (p: Partida, acto = 0) => p.fase === 'combate' && p.acto >= acto && p.combate!.turno === 1 && p.combate!.golpes === 0;

  switch (estado as EstadoQa | (typeof ESTADOS_VIVOS)[number]) {
    case 'portada':
      irPortada();
      break;
    case 'elegir-mazo':
      irMazo();
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
    case 'ajustes':
      irAjustes();
      break;
    case 'mesa':
      montar(partida(mazo, (p) => enCombate(p, 0)));
      break;
    case 'mesa-seleccion': {
      const p = partida(mazo, (x) => enCombate(x, 0));
      montar(p);
      const m = mejorGolpe(p);
      if (m) (window as unknown as { __mesa?: { mano?: { elegir: (ids: string[]) => void } } }).__mesa?.mano?.elegir(m.ids);
      break;
    }
    case 'mesa-rey':
      montar(partida(mazo, (p) => p.fase === 'combate' && !!p.combate?.fila[0]?.jefe));
      break;
    case 'mesa-segunda': {
      const p = partida(mazo, (x) => x.fase === 'combate' && !!x.combate?.fila[0]?.jefe);
      if (p.combate?.fila[0]) {
        p.combate.fila[0].segunda = true;
        p.combate.fila[0].vida = Math.max(1, Math.floor(p.combate.fila[0].vidaMax * 0.4));
      }
      montar(p);
      break;
    }
    case 'mesa-mentiroso':
      montar(partida('mentiroso', (p) => enCombate(p, 0)));
      break;
    case 'pulperia':
      montar(partida(mazo, (p) => p.fase === 'pulperia'));
      break;
    case 'duelo-bufon': {
      const p = partida(mazo, (x) => x.fase === 'duelo');
      irDueloBufon(p);
      break;
    }
    case 'botin':
      montar(partida(mazo, (p) => p.fase === 'botin' && p.botin?.de !== 'duelo'));
      break;
    case 'elegi-bendicion': {
      const p = partida(mazo, (x) => x.fase === 'botin' && !!x.botin?.items.some((it) => it.t === 'oferta' && it.oferta.tipo === 'bendicion'));
      montar(p);
      $<HTMLElement>('[data-accion="abrir"]')?.click();
      break;
    }
    case 'elegi-amuleto': {
      const p = partida(mazo, (x) => x.fase === 'botin' && !!x.botin?.items.some((it) => it.t === 'oferta' && it.oferta.tipo === 'amuleto'));
      montar(p);
      $<HTMLElement>('[data-accion="abrir"]')?.click();
      break;
    }
    case 'mazo':
      montar(partida(mazo, (p) => enCombate(p, 0)));
      $<HTMLElement>('[data-accion="mazo"]')?.click();
      break;
    case 'jugadas':
      montar(partida(mazo, (p) => enCombate(p, 0)));
      $<HTMLElement>('[data-accion="jugadas"]')?.click();
      break;
    case 'piezas': {
      const p = partida(mazo, (x) => enCombate(x, 0));
      darDon(p, 'S');
      darAmuleto(p, 'cuchillo');
      montar(p);
      $<HTMLElement>('[data-accion="piezas"]')?.click();
      break;
    }
    case 'fin-victoria': {
      const p = partida(mazo, (x) => x.fase === 'fin' && !!x.fin?.victoria);
      if (p.fase !== 'fin') {
        p.fase = 'fin';
        p.stats.reyes = 3;
        p.fin = { victoria: true };
      }
      montar(p);
      break;
    }
    case 'fin-derrota': {
      const p = partida(mazo, (x) => x.fase === 'fin' && !x.fin?.victoria);
      if (p.fase !== 'fin') {
        p.fase = 'fin';
        p.fin = { victoria: false };
      }
      montar(p);
      break;
    }
    default:
      irPortada();
      break;
  }
  void cuenta;
  document.documentElement.dataset.qa = 'listo';
}
