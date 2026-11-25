// La Mano contra el Bufón (0.51.0): duelo 3D de mesa jugando 1 mano auténtica del Mazo actual antes de cada Rey Jefe.
import type { Palo } from '../../rules/cartas';
import { huecosChiche, type ChicheId } from '../../rules/chiches';
import type { Partida } from '../../rules/estado';
import { MAZO } from '../../rules/mazos';
import { t, tx } from '../almacen';
import { sonar } from '../audio';
import { fogonazo3d, sacudirCamara3d } from '../escena3d';
import { avivarRetrato, hudHtml } from '../hud';
import { guardar, irCaminoSol, pintarFase } from '../juego';
import { pxDorso, pxNaipe } from '../sprites';
import { anfitrion, esc, repintar, type Pantalla } from '../ui';

interface NaipeDuelo {
  palo: Palo;
  n: number;
}

function rngDe(semilla: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < semilla.length; i++) h = Math.imul(h ^ semilla.charCodeAt(i), 16777619);
  let s = h >>> 0 || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

function barajarDuelo(hasta: number, next: () => number): NaipeDuelo[] {
  const mazo: NaipeDuelo[] = [];
  for (const palo of ['S', 'C', 'D', 'H'] as const) {
    for (let n = 1; n <= hasta; n++) mazo.push({ palo, n });
  }
  for (let i = mazo.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    const tmp = mazo[i];
    mazo[i] = mazo[j];
    mazo[j] = tmp;
  }
  return mazo;
}

function valorTruco(c: NaipeDuelo): number {
  if (c.palo === 'S' && c.n === 1) return 14;
  if (c.palo === 'C' && c.n === 1) return 13;
  if (c.palo === 'S' && c.n === 7) return 12;
  if (c.palo === 'D' && c.n === 7) return 11;
  if (c.n === 3) return 10;
  if (c.n === 2) return 9;
  if (c.n === 1) return 8;
  return c.n;
}

function envidoDe(mano: readonly NaipeDuelo[]): number {
  let mejor = Math.max(...mano.map((c) => c.n));
  for (let i = 0; i < mano.length; i++) {
    for (let j = i + 1; j < mano.length; j++) {
      if (mano[i].palo === mano[j].palo) {
        mejor = Math.max(mejor, 20 + mano[i].n + mano[j].n);
      }
    }
  }
  return mejor;
}

function puntosChinchon(mano: readonly NaipeDuelo[]): number {
  if (!mano.length) return 0;
  const usadas = new Set<number>();
  // Buscar piernas (3+ del mismo número)
  const porN = new Map<number, number[]>();
  mano.forEach((c, i) => {
    const l = porN.get(c.n) ?? [];
    l.push(i);
    porN.set(c.n, l);
  });
  for (const idxs of porN.values()) {
    if (idxs.length >= 3) for (const i of idxs) usadas.add(i);
  }
  // Buscar escaleras de mismo palo (3+ consecutivas)
  for (const palo of ['S', 'C', 'D', 'H'] as const) {
    const delPalo = mano.map((c, i) => ({ c, i })).filter((x) => x.c.palo === palo).sort((a, b) => a.c.n - b.c.n);
    let run: number[] = [];
    for (let k = 0; k < delPalo.length; k++) {
      if (run.length === 0 || delPalo[k].c.n === delPalo[k - 1].c.n + 1) run.push(delPalo[k].i);
      else {
        if (run.length >= 3) for (const i of run) usadas.add(i);
        run = [delPalo[k].i];
      }
    }
    if (run.length >= 3) for (const i of run) usadas.add(i);
  }
  return mano.reduce((s, c, i) => s + (usadas.has(i) ? 0 : c.n), 0);
}

function fuerzaChancho(mano: readonly NaipeDuelo[]): { rango: number; par: number } {
  const counts = new Map<number, number>();
  for (const c of mano) counts.set(c.n, (counts.get(c.n) ?? 0) + 1);
  let maxC = 1;
  let maxN = 0;
  for (const [n, cnt] of counts) {
    if (cnt > maxC || (cnt === maxC && n > maxN)) {
      maxC = cnt;
      maxN = n;
    }
  }
  return { rango: maxC, par: maxN };
}

export function pantallaDueloBufon(p: Partida): Pantalla {
  const next = rngDe(`${p.semilla}:duelo:${p.acto}:${p.mazoId}`);
  const hasta = p.mazoId === 'truco' ? 7 : 9;
  const pila = barajarDuelo(hasta, next);
  const robar = (n: number): NaipeDuelo[] => pila.splice(0, n);

  let manoJugador: NaipeDuelo[] = [];
  let manoBufon: NaipeDuelo[] = [];
  let mesaCartas: NaipeDuelo[] = [];
  let selJugador = new Set<number>();
  let selMesa = new Set<number>();
  let cambiosChancho = 4;
  let mentiraReal = false;
  let mentiraDice = '';

  if (p.mazoId === 'truco') {
    manoJugador = robar(3);
    manoBufon = robar(3);
  } else if (p.mazoId === 'escoba') {
    manoJugador = robar(3);
    mesaCartas = robar(4);
    // Garantizar al menos una jugada de 15 entre manoJugador[0] y mesaCartas[0..1]
    const sumaM = manoJugador[0].n + mesaCartas[0].n;
    if (sumaM < 15 && 15 - sumaM <= 9) {
      mesaCartas[1] = { palo: mesaCartas[1].palo, n: 15 - sumaM };
    } else {
      manoJugador[0] = { palo: 'D', n: 7 };
      mesaCartas[0] = { palo: 'S', n: 5 };
      mesaCartas[1] = { palo: 'H', n: 3 };
    }
    manoBufon = robar(3);
  } else if (p.mazoId === 'chinchon') {
    manoJugador = robar(7);
    manoBufon = robar(6);
    selJugador.add(0);
  } else if (p.mazoId === 'mentiroso') {
    manoJugador = robar(4);
    mentiraReal = next() < 0.5;
    manoBufon = mentiraReal
      ? [{ palo: 'S', n: 7 }, { palo: 'D', n: 7 }]
      : [{ palo: 'C', n: 3 }, { palo: 'H', n: 5 }];
    mentiraDice = '«Dos 7 clavados, compadre.»';
  } else {
    manoJugador = robar(4);
    manoBufon = [{ palo: 'S', n: 4 }, { palo: 'H', n: 4 }, { palo: 'C', n: 2 }, { palo: 'D', n: 6 }];
  }

  let estado: 'jugando' | 'gano' | 'perdio' = 'jugando';
  let revelado = false;
  let vozBufon = p.mazoId === 'mentiroso' ? mentiraDice : 'Una mano rápida antes del Rey. ¿Te animás?';
  let exprBufon: 'reposo' | 'brillo' | 'risa' | 'burla' | 'sombria' = p.mazoId === 'mentiroso' ? (mentiraReal ? 'brillo' : 'burla') : 'brillo';
  let saliendo = false;

  const salirAlRey = (): void => {
    if (saliendo) return;
    saliendo = true;
    sonar('clic');
    guardar();
    if (p.acto >= 2) irCaminoSol(true);
    else pintarFase();
  };

  const resolverResultado = (gano: boolean, msg: string): void => {
    revelado = true;
    estado = gano ? 'gano' : 'perdio';
    vozBufon = msg;
    if (gano) {
      exprBufon = 'risa';
      sonar('canto');
      fogonazo3d(1.6);
      sacudirCamara3d(0.7);
    } else {
      exprBufon = 'burla';
      sonar('contra');
      p.vida = Math.min(p.vidaMax, p.vida + 8);
    }
    repintar();
  };

  const nombreMazo = tx(MAZO[p.mazoId].nombre);

  return {
    nombre: 'duelo-bufon',
    atras: salirAlRey,
    html: () => {
      const cartasHtml = (lista: readonly NaipeDuelo[], grupo: 'j' | 'm' | 'b', ocultas = false): string =>
        lista
          .map((c, i) => {
            const sel = (grupo === 'j' && selJugador.has(i)) || (grupo === 'm' && selMesa.has(i));
            const img = ocultas ? pxDorso(p.mazoId) : pxNaipe(c);
            if (grupo === 'b' || estado !== 'jugando') {
              return `<span class="duelo-naipe ${sel ? 'elegida' : ''}">${img}</span>`;
            }
            return `<button class="duelo-naipe ${sel ? 'elegida' : ''}" data-accion="sel-${grupo}" data-i="${i}">${img}</button>`;
          })
          .join('');

      let cuerpoHtml = '';
      if (estado === 'jugando') {
        let accionesJuego = '';
        if (p.mazoId === 'truco') {
          const env = envidoDe(manoJugador);
          accionesJuego = `<button class="btn marco oro" data-accion="jug-envido">${t('dueloEnvido', { n: env })}</button>
            <button class="btn marco" data-accion="jug-truco">${t('dueloTruco')}</button>`;
        } else if (p.mazoId === 'escoba') {
          const jSum = Array.from(selJugador).reduce((s, i) => s + (manoJugador[i]?.n ?? 0), 0);
          const mSum = Array.from(selMesa).reduce((s, i) => s + (mesaCartas[i]?.n ?? 0), 0);
          const total15 = jSum + mSum;
          const listo = selJugador.size === 1 && selMesa.size >= 1 && total15 === 15;
          accionesJuego = `<p class="duelo-tip">${t('dueloEscobaSuma', { s: total15 })}</p>
            <button class="btn marco oro" data-accion="jug-escoba" ${listo ? '' : 'disabled'}>${t('dueloEscoba')}</button>`;
        } else if (p.mazoId === 'chinchon') {
          const descIdx = selJugador.size ? Array.from(selJugador)[0] : 0;
          const restantes = manoJugador.filter((_, i) => i !== descIdx);
          const pts = puntosChinchon(restantes);
          accionesJuego = `<p class="duelo-tip">${t('dueloChinchonTip')}</p>
            <button class="btn marco oro" data-accion="jug-cortar">${t('dueloCortar', { n: pts })}</button>`;
        } else if (p.mazoId === 'mentiroso') {
          accionesJuego = `<button class="btn marco oro" data-accion="jug-mentira">${t('dueloMentira')}</button>
            <button class="btn marco" data-accion="jug-creer">${t('dueloCreer')}</button>`;
        } else {
          accionesJuego = `<p class="duelo-tip">${t('dueloChanchoTip', { n: cambiosChancho })}</p>
            <button class="btn marco oro" data-accion="jug-chancho">${t('dueloChancho')}</button>`;
        }

        cuerpoHtml = `
          <div class="duelo-tablero">
            <div class="duelo-fila">
              <span class="rotulo">${t('dueloBufonMano')}</span>
              <div class="duelo-cartas">${cartasHtml(manoBufon, 'b', !revelado)}</div>
            </div>
            ${mesaCartas.length ? `<div class="duelo-fila"><span class="rotulo">${t('dueloMesa')}</span><div class="duelo-cartas">${cartasHtml(mesaCartas, 'm')}</div></div>` : ''}
            <div class="duelo-fila">
              <span class="rotulo dorado">${t('dueloTusCartas')}</span>
              <div class="duelo-cartas">${cartasHtml(manoJugador, 'j')}</div>
            </div>
          </div>
          <div class="duelo-acciones">${accionesJuego}<button class="btn marco chico" data-accion="pasar-rey">${t('dueloRendirse')}</button></div>`;
      } else if (estado === 'gano') {
        cuerpoHtml = `
          <div class="duelo-bendicion">
            <h2 class="titulo dorado">${t('dueloBendicionTitulo')}</h2>
            <p class="sub">${t('dueloBendicionSub')}</p>
            <div class="opciones">
              <button class="opcion marco dorado bendicion-bufon-op" data-accion="bendicion" data-id="mano">
                <b class="op-nombre">MANO BENDITA</b>
                <span class="op-desc">Oro fresco, curación y filo templado.</span>
                <span class="op-chips"><span>● +20</span><span>♥ +20</span><span>⚔ +6</span></span>
              </button>
              <button class="opcion marco prisma bendicion-bufon-op" data-accion="bendicion" data-id="bolso">
                <b class="op-nombre">BOLSO DEL CHANTA</b>
                <span class="op-desc">Más aguante y chiches de pulpería.</span>
                <span class="op-chips"><span>♥ +10 MÁX</span><span>♥ +10</span><span>★ +2 CHICHES</span></span>
              </button>
              <button class="opcion marco paloD bendicion-bufon-op" data-accion="bendicion" data-id="cabala">
                <b class="op-nombre">CÁBALA MAYOR</b>
                <span class="op-desc">Fortuna y cargas reales potenciadas.</span>
                <span class="op-chips"><span>● +15</span><span>★ +3 CARGAS</span></span>
              </button>
            </div>
          </div>`;
      } else {
        cuerpoHtml = `
          <div class="duelo-bendicion">
            <h2 class="titulo">${esc(t('dueloPerdio'))}</h2>
            <button class="btn marco oro grande" data-accion="pasar-rey">${t('dueloAlRey')}</button>
          </div>`;
      }

      return `<main class="pantalla en-partida duelo-bufon">
        <header class="cabecera">
          <div class="lado">
            <h1 class="titulo dorado">${t('dueloTitulo')}</h1>
            <span class="sub">${t('dueloSub', { mazo: nombreMazo })}</span>
          </div>
        </header>
        <div class="duelo-zona">
          <div class="duelo-anfitrion">${anfitrion(vozBufon, exprBufon, 'duelo-bufon-anf')}</div>
          <div class="duelo-centro">${cuerpoHtml}</div>
        </div>
        ${hudHtml(p)}
      </main>`;
    },
    alMontar: () => {
      avivarRetrato(p);
    },
    acciones: {
      'sel-j': (el) => {
        if (estado !== 'jugando') return;
        const i = Number(el.dataset.i);
        sonar('clic');
        if (p.mazoId === 'chancho' && cambiosChancho > 0 && pila.length > 0) {
          manoJugador[i] = pila.shift()!;
          cambiosChancho--;
          repintar();
          return;
        }
        if (p.mazoId === 'chinchon' || p.mazoId === 'escoba') selJugador.clear();
        if (selJugador.has(i)) selJugador.delete(i);
        else selJugador.add(i);
        repintar();
      },
      'sel-m': (el) => {
        if (estado !== 'jugando') return;
        const i = Number(el.dataset.i);
        sonar('clic');
        if (selMesa.has(i)) selMesa.delete(i);
        else selMesa.add(i);
        repintar();
      },
      'jug-envido': () => {
        const jEnv = envidoDe(manoJugador);
        const bEnv = envidoDe(manoBufon);
        const gano = jEnv >= bEnv;
        resolverResultado(gano, gano ? `¡Me ganaste con ${jEnv} a ${bEnv}! Tomá tu Bendición.` : `¡${bEnv} es mejor que ${jEnv}! Te dormiste.`);
      },
      'jug-truco': () => {
        const jMax = Math.max(...manoJugador.map(valorTruco));
        const bMax = Math.max(...manoBufon.map(valorTruco));
        const gano = jMax >= bMax;
        resolverResultado(gano, gano ? '¡Bien jugado, bravo! Elegí tu Bendición.' : '¡Tenía mejor brava! Suerte con el Rey.');
      },
      'jug-escoba': () => {
        resolverResultado(true, '¡Escoba limpia de 15! Tomá tu Bendición.');
      },
      'jug-cortar': () => {
        const descIdx = selJugador.size ? Array.from(selJugador)[0] : 0;
        const pts = puntosChinchon(manoJugador.filter((_, i) => i !== descIdx));
        const bPts = 8 + (p.acto * 2);
        const gano = pts <= bPts;
        resolverResultado(gano, gano ? `Cortaste con ${pts} contra ${bPts}. ¡Merecida Bendición!` : `Cortaste con ${pts} y yo tenía ${bPts}. ¡Casi!`);
      },
      'jug-mentira': () => {
        const gano = !mentiraReal;
        resolverResultado(gano, gano ? '¡Me agarraste en el chamuyo! Elegí tu premio.' : '¡Eran de verdad, desconfiado!');
      },
      'jug-creer': () => {
        const gano = mentiraReal;
        resolverResultado(gano, gano ? '¡Confiaste bien! Acá tenés tu Bendición.' : '¡Te comiste el verso entero!');
      },
      'jug-chancho': () => {
        const jF = fuerzaChancho(manoJugador);
        const bF = fuerzaChancho(manoBufon);
        const gano = jF.rango > bF.rango || (jF.rango === bF.rango && jF.par >= bF.par);
        resolverResultado(gano, gano ? '¡Mano veloz! Elegí tu Bendición.' : '¡Llegué antes al centro!');
      },
      bendicion: (el) => {
        const id = el.dataset.id;
        if (id === 'mano') {
          p.oro += 20;
          p.vida = Math.min(p.vidaMax, p.vida + 20);
          const carta = p.mazo.filter((k) => k.palo !== 'X').sort((a, b) => b.n - a.n)[0];
          if (carta) {
            if ((carta.temple ?? 0) > 0) carta.templada = true;
            carta.temple = (carta.temple ?? 0) + 6;
          }
        } else if (id === 'bolso') {
          p.vidaMax += 10;
          p.vida = Math.min(p.vidaMax, p.vida + 10);
          p.chiches = huecosChiche(p.chiches);
          let puestos = 0;
          for (const ch of ['dado', 'fosforo', 'tiza', 'ginebra', 'poroto'] as ChicheId[]) {
            if (puestos >= 2) break;
            const idx = p.chiches.indexOf(null);
            if (idx === -1) break;
            if (!p.chiches.includes(ch)) {
              p.chiches[idx] = ch;
              puestos++;
            }
          }
        } else if (id === 'cabala') {
          p.oro += 15;
          p.cargas.S = (p.cargas.S ?? 0) + 3;
          p.cargas.C = (p.cargas.C ?? 0) + 3;
          p.cargas.D = (p.cargas.D ?? 0) + 3;
          p.cargas.H = (p.cargas.H ?? 0) + 3;
        }
        salirAlRey();
      },
      'pasar-rey': salirAlRey,
    },
  };
}
