// Las pantallas de fuera de la partida: la portada, elegir Mazo, el Altar (siete mejoras directas en una sola
// pantalla), la Colección, la Crónica y los Ajustes.
import { AMULETO, AMULETOS, RAREZA_NOMBRE } from '../../rules/amuletos';
import { AUMENTO, AUMENTOS } from '../../rules/aumentos';
import { B } from '../../rules/balance';
import { PALOS } from '../../rules/cartas';
import { MAZO, MAZOS } from '../../rules/mazos';
import { vidaInicial } from '../../rules/partida';
import type { MazoId } from '../../rules/mazos';
import { MEJORAS, avanceMazo, costeMejora, devolver, mazoAbierto, mejorar, reembolso, reinadoMax } from '../../rules/perfil';
import type { MejoraId } from '../../rules/perfil';
import { REINADOS } from '../../rules/reinados';
import { BENDICION, BENDICIONES, REY_DEF } from '../../rules/reyes';
import { MARCA, VERSION } from '../../shared/brand';
import { ajustes, alAzar, borrarTodo, fijarIdioma, guardarAjustes, guardarPartida, guardarPerfil, idioma, perfil, t, tx } from '../almacen';
import { refrescarSonido, sonar } from '../audio';
import { refrescarMusica } from '../musica';
import { enFoto } from '../fx/motor';
import { numero } from '../fx/efectos';
import { glifo } from '../nav';
import { nombreCarga } from '../hud';
import { continuar, empezar, hayPartida, irAjustes, irAltar, irCaminoSol, irColeccion, irCronica, irExplorar, irIntroMazo, irMazo, irPortada, pintarFase, sesion } from '../juego';
import {
  limpiarPoseDiscreta3d,
  ponerPoseDiscreta3d,
  salirExploracion3d,
} from '../escena3d';
import { CUADRO0 } from '../pixel/personajes';
import { cifra, pxAmuleto, pxAumento, pxBendicion, pxDorso, pxHud, pxLogo, pxPalo, urlRetrato } from '../sprites';
import { TRAMO_NOMBRE } from '../textos';
import { VOZ } from '../voces';
import { bufonDice } from '../bufon-vivo';
import { $, abrirModal, anfitrion, cerrarModal, esc, miniAnfitrion, pantallaActual, repintar, reyHtml, tip, type Pantalla } from '../ui';

// ───────────────────────── portada ─────────────────────────

/** Altar, Colección, Crónica y Ajustes van en un mismo marco: se pasa de una a otra por sus solapas. */
type Solapa = 'altar' | 'coleccion' | 'cronica' | 'ajustes';
const SOLAPAS: Solapa[] = ['altar', 'coleccion', 'cronica', 'ajustes'];
const solapas = (actual: Solapa): string =>
  `<nav class="solapas fila" role="tablist" aria-label="${t(actual)}">${SOLAPAS.map((x) => `<button class="btn marco chico solapa ${x === actual ? 'oro' : ''}" role="tab" aria-selected="${x === actual}" data-accion="sol-${x}" data-foco="sol-${x}">${t(x)}</button>`).join('')}</nav>`;
const irSolapa = { 'sol-altar': () => irAltar(), 'sol-coleccion': () => irColeccion(), 'sol-cronica': () => irCronica(), 'sol-ajustes': () => irAjustes() };

export function pantallaPortada(): Pantalla {
  const hay = hayPartida();
  const voz = tx(alAzar(VOZ.portada, enFoto() ? 2 : undefined));
  return {
    nombre: 'portada',
    html: () => `<main class="pantalla portada">
      <div class="portada-arriba">
        <h1 class="logo-caja" aria-label="${MARCA[idioma()].titulo}">${pxLogo()}</h1>
        <p class="sub portada-sub">${MARCA[idioma()].subtitulo}</p>
      </div>
      <div class="portada-medio">
        ${anfitrion(voz, 'reposo')}
        <nav class="portada-menu">
          <button class="btn marco oro monumental" data-accion="jugar" data-inicio data-foco="jugar">${hay ? t('continuar') : t('jugar')}</button>
          ${hay ? `<button class="btn marco chico" data-accion="nueva" data-foco="nueva">${t('nueva')}</button>` : ''}
          <div class="fila">
            <button class="btn marco" data-accion="altar" data-foco="altar">${pxHud('poroto')}${t('altar')} ${cifra(perfil.porotos, 'oro')}</button>
            <button class="btn marco" data-accion="coleccion" data-foco="coleccion">${t('coleccion')}</button>
            <button class="btn marco" data-accion="cronica" data-foco="cronica">${t('cronica')}</button>
            <button class="btn marco" data-accion="ajustes" data-foco="ajustes">${t('ajustes')}</button>
          </div>
          <button class="btn marco chico btn-levantarse" data-accion="levantarse" data-foco="levantarse">${t('levantarse')}</button>
        </nav>
        <div class="portada-pila" aria-hidden="true">${(['chinchon', 'truco', 'escoba'] as MazoId[]).map((m, i) => `<span class="pila-dorso" style="--i:${i}">${pxDorso(m)}</span>`).join('')}</div>
      </div>
      <footer class="pie">
        <div class="fila idiomas" role="group" aria-label="${t('idioma')}">
          <button class="btn marco chico ${idioma() === 'es' ? 'oro' : ''}" data-accion="es" data-foco="es" aria-pressed="${idioma() === 'es'}">ES</button>
          <button class="btn marco chico ${idioma() === 'en' ? 'oro' : ''}" data-accion="en" data-foco="en" aria-pressed="${idioma() === 'en'}">EN</button>
        </div>
        <span class="sub">v${VERSION}</span>
      </footer>
    </main>`,
    acciones: {
      jugar: () => {
        sonar('clic');
        if (!continuar()) irMazo();
      },
      nueva: () => {
        abrirModal(
          `<div class="panel"><p>${t('rendirseSeguro')}</p><div class="fila"><button class="btn marco" data-accion="no" data-inicio>${t('no')}</button><button class="btn marco oro" data-accion="si">${t('si')}</button></div></div>`,
          {
            no: () => cerrarModal(),
            si: () => {
              sesion.partida = null;
              guardarPartida(null);
              irMazo();
            },
          },
        );
      },
      altar: irAltar,
      coleccion: irColeccion,
      cronica: irCronica,
      ajustes: irAjustes,
      levantarse: () => irExplorar(),
      es: () => {
        fijarIdioma('es');
        repintar();
      },
      en: () => {
        fijarIdioma('en');
        repintar();
      },
    },
  };
}

// ───────────────────────── La Pulpería 3D Discreta (estilo Inscryption) ─────────────────────────

export type VistaCuartoId = 'mesa' | 'centro' | 'puerta' | 'altar' | 'fogon' | 'coleccion' | 'ajustes' | 'cronica';

interface VistaCuarto {
  titulo: () => string;
  pos: [number, number, number];
  mira: [number, number, number];
  adelante?: VistaCuartoId;
  atras?: VistaCuartoId | 'portada';
  izq?: VistaCuartoId;
  der?: VistaCuartoId;
  accionTexto?: () => string;
}

const VISTAS_CUARTO: Record<VistaCuartoId, VistaCuarto> = {
  mesa: {
    titulo: () => t('rinconMesa'),
    pos: [0, 2.55, 4.9],
    mira: [0, 1.9, -6.5],
    adelante: 'centro',
    atras: 'portada',
    izq: 'altar',
    der: 'cronica',
    accionTexto: () => t('accionMesa'),
  },
  centro: {
    titulo: () => t('pulperiaCabecera'),
    pos: [0, 2.5, -1.6],
    mira: [0, 2.1, -8.1],
    adelante: 'puerta',
    atras: 'mesa',
    izq: 'fogon',
    der: 'coleccion',
  },
  puerta: {
    titulo: () => t('rinconPuerta'),
    pos: [0, 2.5, -4.1],
    mira: [0, 2.0, -8.1],
    atras: 'centro',
    izq: 'fogon',
    der: 'coleccion',
    accionTexto: () => t('accionPuerta'),
  },
  altar: {
    titulo: () => t('rinconAltar'),
    pos: [-4.2, 2.65, -1.5],
    mira: [-7.4, 1.15, -2.5],
    der: 'fogon',
    atras: 'mesa',
    accionTexto: () => t('accionAltar'),
  },
  fogon: {
    titulo: () => t('rinconFogon'),
    pos: [-4.2, 2.4, -3.9],
    mira: [-6.4, 0.85, -7.2],
    izq: 'altar',
    der: 'puerta',
    atras: 'centro',
  },
  coleccion: {
    titulo: () => t('rinconColeccion'),
    pos: [4.6, 2.55, -3.5],
    mira: [5.6, 2.35, -8.0],
    izq: 'puerta',
    der: 'ajustes',
    atras: 'centro',
    accionTexto: () => t('accionColeccion'),
  },
  ajustes: {
    titulo: () => t('rinconAjustes'),
    pos: [4.1, 2.65, -2.5],
    mira: [7.2, 1.25, -3.2],
    izq: 'coleccion',
    der: 'cronica',
    atras: 'centro',
    accionTexto: () => t('accionAjustes'),
  },
  cronica: {
    titulo: () => t('rinconCronica'),
    pos: [4.0, 2.6, 1.8],
    mira: [7.2, 0.85, 1.2],
    izq: 'ajustes',
    atras: 'mesa',
    accionTexto: () => t('accionCronica'),
  },
};

export function vistaCuartoInicial(id?: string | null): VistaCuartoId {
  return id && id in VISTAS_CUARTO ? (id as VistaCuartoId) : 'mesa';
}

export function pantallaExplorar(vistaInicial: VistaCuartoId = 'mesa'): Pantalla {
  let vista: VistaCuartoId = vistaInicial;
  let onKeyDown: ((ev: KeyboardEvent) => void) | null = null;
  let timerSusurro = 0;

  const decir = (msg: string): void => {
    const susurro = $<HTMLElement>('.explorar-susurro');
    if (!susurro) return;
    susurro.textContent = msg;
    susurro.hidden = false;
    window.clearTimeout(timerSusurro);
    timerSusurro = window.setTimeout(() => {
      if (susurro.isConnected) susurro.hidden = true;
    }, 3600);
  };

  const irVista = (dest: VistaCuartoId | 'portada' | undefined, sonido: 'paso' | 'clic' = 'paso'): void => {
    if (!dest) return;
    if (dest === 'portada') {
      sonar('clic');
      limpiarPoseDiscreta3d();
      irPortada();
      return;
    }
    sonar(sonido);
    vista = dest;
    const v = VISTAS_CUARTO[vista];
    ponerPoseDiscreta3d(v.pos, v.mira, 50, enFoto());
    repintar();
  };

  const ejecutarAccion = (): void => {
    sonar('clic');
    if (vista === 'mesa') {
      limpiarPoseDiscreta3d();
      irMazo();
    } else if (vista === 'altar') {
      limpiarPoseDiscreta3d();
      irAltar();
    } else if (vista === 'coleccion') {
      limpiarPoseDiscreta3d();
      irColeccion();
    } else if (vista === 'cronica') {
      limpiarPoseDiscreta3d();
      irCronica();
    } else if (vista === 'ajustes') {
      limpiarPoseDiscreta3d();
      irAjustes();
    } else if (vista === 'puerta') {
      if (perfil.stats.victorias > 0) {
        limpiarPoseDiscreta3d();
        irCaminoSol(false);
      } else {
        decir(t('puertaTrancada'));
      }
    } else if (vista === 'fogon') {
      decir(t('fogonReposo'));
    }
  };

  return {
    nombre: 'explorar',
    atras: () => {
      sonar('clic');
      limpiarPoseDiscreta3d();
      irPortada();
    },
    alSalir: () => {
      window.clearTimeout(timerSusurro);
      if (onKeyDown) {
        window.removeEventListener('keydown', onKeyDown);
        onKeyDown = null;
      }
    },
    html: () => {
      const v = VISTAS_CUARTO[vista];
      const flecha = (dir: 'adelante' | 'atras' | 'izq' | 'der', cls: string, sim: string): string =>
        v[dir] ? `<button class="btn marco nav-dir ${cls}" data-accion="dir-${dir}" data-foco="dir-${dir}" aria-label="${dir}">${sim}</button>` : '';
      return `<main class="pantalla explorar">
        <header class="explorar-top">
          <div class="sol-titulo-caja">
            <b class="rotulo dorado sol-titulo">${t('pulperiaCabecera')} · ${v.titulo()}</b>
          </div>
          <button class="btn marco chico" data-accion="sentarse" data-foco="sentarse" data-inicio>${t('volverMesa')}</button>
        </header>
        ${flecha('adelante', 'nav-arr', '▲')}
        ${flecha('izq', 'nav-izq', '◀')}
        ${flecha('der', 'nav-der', '▶')}
        ${flecha('atras', 'nav-aba', '▼')}
        <p class="explorar-susurro" hidden role="status"></p>
        <footer class="explorar-pie">
          ${v.accionTexto ? `<button class="btn marco oro grande" data-accion="usar-rincon" data-foco="usar-rincon">${v.accionTexto()}</button>` : ''}
        </footer>
      </main>`;
    },
    alMontar: () => {
      const v = VISTAS_CUARTO[vista];
      ponerPoseDiscreta3d(v.pos, v.mira, 50, enFoto());
      if (onKeyDown) window.removeEventListener('keydown', onKeyDown);
      onKeyDown = (ev: KeyboardEvent): void => {
        if (pantallaActual()?.nombre !== 'explorar') return;
        const k = ev.key.toLowerCase();
        const cur = VISTAS_CUARTO[vista];
        if (k === 'w' || k === 'arrowup') {
          ev.preventDefault();
          irVista(cur.adelante, 'paso');
        } else if (k === 's' || k === 'arrowdown') {
          ev.preventDefault();
          irVista(cur.atras, 'paso');
        } else if (k === 'a' || k === 'arrowleft') {
          ev.preventDefault();
          irVista(cur.izq, 'clic');
        } else if (k === 'd' || k === 'arrowright') {
          ev.preventDefault();
          irVista(cur.der, 'clic');
        } else if (k === 'e' || k === 'enter') {
          if ((document.activeElement as HTMLElement)?.tagName === 'BUTTON') return;
          ev.preventDefault();
          ejecutarAccion();
        }
      };
      window.addEventListener('keydown', onKeyDown);
    },
    acciones: {
      sentarse: () => {
        sonar('clic');
        limpiarPoseDiscreta3d();
        irPortada();
      },
      'usar-rincon': ejecutarAccion,
      'dir-adelante': () => irVista(VISTAS_CUARTO[vista].adelante, 'paso'),
      'dir-atras': () => irVista(VISTAS_CUARTO[vista].atras, 'paso'),
      'dir-izq': () => irVista(VISTAS_CUARTO[vista].izq, 'clic'),
      'dir-der': () => irVista(VISTAS_CUARTO[vista].der, 'clic'),
    },
  };
}

// ───────────────────────── Camino al Sol de Mayo (discreto estilo Inscryption) ─────────────────────────

const PASOS_SOL: Array<{ pos: [number, number, number]; mira: [number, number, number] }> = [
  { pos: [0, 1.85, 6.2], mira: [0, 3.2, -28] },
  { pos: [0, 1.85, -1.2], mira: [0, 3.4, -28] },
  { pos: [0, 1.85, -8.8], mira: [0, 3.6, -28] },
  { pos: [0, 1.95, -15.6], mira: [0, 3.8, -28] },
];

export function pantallaCaminoSol(enClimax = false): Pantalla {
  let paso = 0;
  let saliendo = false;
  let onKeyDown: ((ev: KeyboardEvent) => void) | null = null;

  const salir = (): void => {
    if (saliendo) return;
    saliendo = true;
    sonar('clic');
    salirExploracion3d();
    if (enClimax) pintarFase();
    else irExplorar();
  };

  const moverPaso = (delta: number): void => {
    const prox = Math.max(0, Math.min(PASOS_SOL.length - 1, paso + delta));
    if (prox === paso) {
      if (enClimax && delta > 0 && paso === PASOS_SOL.length - 1) salir();
      return;
    }
    paso = prox;
    sonar('paso');
    const p = PASOS_SOL[paso];
    ponerPoseDiscreta3d(p.pos, p.mira, 50, enFoto());
    repintar();
  };

  return {
    nombre: 'sol-de-mayo',
    atras: salir,
    alSalir: () => {
      if (onKeyDown) {
        window.removeEventListener('keydown', onKeyDown);
        onKeyDown = null;
      }
    },
    html: () => `<main class="pantalla sol-de-mayo">
      <header class="sol-top">
        <div class="sol-titulo-caja">
          <b class="rotulo dorado sol-titulo">${t('solDeMayoTitulo')}</b>
        </div>
      </header>
      ${paso < PASOS_SOL.length - 1 ? `<button class="btn marco nav-dir nav-arr" data-accion="sol-adelante" aria-label="${t('avanzarCamino')}">▲</button>` : ''}
      ${paso > 0 ? `<button class="btn marco nav-dir nav-aba" data-accion="sol-atras" aria-label="${t('retrocederCamino')}">▼</button>` : ''}
      <footer class="sol-pie">
        <button class="btn marco oro grande" data-accion="salir-sol" data-foco="avanzar-sol" data-inicio>${enClimax ? t('enfrentarReyFinal') : t('volverPulperia')}</button>
      </footer>
    </main>`,
    alMontar: () => {
      const p = PASOS_SOL[paso];
      ponerPoseDiscreta3d(p.pos, p.mira, 50, enFoto());
      if (onKeyDown) window.removeEventListener('keydown', onKeyDown);
      onKeyDown = (ev: KeyboardEvent): void => {
        if (pantallaActual()?.nombre !== 'sol-de-mayo') return;
        const k = ev.key.toLowerCase();
        if (k === 'w' || k === 'arrowup') {
          ev.preventDefault();
          moverPaso(1);
        } else if (k === 's' || k === 'arrowdown') {
          ev.preventDefault();
          moverPaso(-1);
        } else if (k === 'e') {
          ev.preventDefault();
          salir();
        }
      };
      window.addEventListener('keydown', onKeyDown);
    },
    acciones: {
      'sol-adelante': () => moverPaso(1),
      'sol-atras': () => moverPaso(-1),
      'salir-sol': salir,
    },
  };
}

// ───────────────────────── elegir Mazo ─────────────────────────

let mazoElegido: MazoId = 'escoba';
let reinadoElegido = 1;

export function pantallaMazo(): Pantalla {
  if (!mazoAbierto(perfil, mazoElegido)) mazoElegido = 'escoba';
  reinadoElegido = Math.max(1, Math.min(reinadoMax(perfil), reinadoElegido));
  const detalle = (): string => {
    const d = MAZO[mazoElegido];
    const abierto = mazoAbierto(perfil, mazoElegido);
    const m = B.mazos[mazoElegido];
    const [a, b] = avanceMazo(perfil, mazoElegido);
    const vida = vidaInicial(mazoElegido, perfil.altar.vida);
    return `<div class="md-dorso">${pxDorso(mazoElegido)}</div>
      <div class="md-texto">
        <b class="md-nombre dorado">${esc(tx(d.nombre))} · ${esc(tx(d.personaje))}</b>
        <p class="md-regla">${esc(tx(d.regla))}</p>
        ${abierto ? `<p class="sub">${t('vida')} ${vida} · ${t('mano', { n: m.mano })} <button class="btn marco chico" data-accion="ver-intro">${t('introBtn')}</button></p>` : `<p class="rojo">${t('bloqueado')} · ${esc(tx(d.desbloqueo!.texto))} ${t('avance', { a, b })}</p>`}
      </div>`;
  };
  const reinado = (): string => {
    const r = REINADOS[reinadoElegido - 1];
    const max = reinadoMax(perfil);
    return `<button class="btn marco chico" data-accion="reinado-menos" data-foco="r-menos" aria-label="−" ${reinadoElegido <= 1 ? 'disabled' : ''}>‹</button>
      <div class="reinado-caja"><b>${t('reinado', { n: r.n })} · ${esc(tx(r.nombre))}</b><span class="sub">${esc(tx(r.giro))}</span></div>
      <button class="btn marco chico" data-accion="reinado-mas" data-foco="r-mas" aria-label="+" ${reinadoElegido >= max ? 'disabled' : ''}>›</button>`;
  };
  return {
    nombre: 'elegir-mazo',
    atras: irPortada,
    html: () => `<main class="pantalla elegir">
      <header class="cabecera">
        <button class="btn marco chico" data-accion="volver" data-foco="volver">‹ ${t('volver')}</button>
        <h1 class="titulo">${t('elegiMazo')}</h1>
        ${miniAnfitrion(tx(VOZ.mazo[mazoElegido]))}
      </header>
      <div class="mazos" role="radiogroup" aria-label="${t('elegiMazo')}">
        ${MAZOS.map((m) => {
          const d = MAZO[m];
          const abierto = mazoAbierto(perfil, m);
          return `<button class="mazo-op marco ${m === mazoElegido ? 'elegido' : ''} ${abierto ? '' : 'cerrado'}" role="radio" aria-checked="${m === mazoElegido}" data-accion="mazo" data-id="${m}" data-foco="mazo-${m}" ${m === mazoElegido ? 'data-inicio' : ''}>
            <span class="mazo-dorso">${pxDorso(m)}</span>
            <i class="mazo-cara" style="background-image:url(${urlRetrato(m, CUADRO0)})"></i>
            ${abierto ? '' : `<span class="mazo-candado">${pxHud('candado')}</span>`}
            <b class="mazo-nombre">${esc(tx(d.nombre))}</b>
            <span class="sub mazo-pj">${esc(tx(d.personaje))}</span>
          </button>`;
        }).join('')}
      </div>
      <section class="mazo-detalle marco" data-detalle>${detalle()}</section>
      <div class="fila reinado" data-reinado>${reinado()}</div>
      <button class="btn marco oro monumental" data-accion="jugar" data-foco="jugar" data-jugar ${mazoAbierto(perfil, mazoElegido) ? '' : 'disabled'}>${t('jugar')}</button>
    </main>`,
    acciones: {
      volver: irPortada,
      mazo: (el) => {
        mazoElegido = el.dataset.id as MazoId;
        sonar('clic');
        repintar();
      },
      'reinado-menos': () => {
        reinadoElegido = Math.max(1, reinadoElegido - 1);
        repintar();
      },
      'reinado-mas': () => {
        reinadoElegido = Math.min(reinadoMax(perfil), reinadoElegido + 1);
        repintar();
      },
      'ver-intro': () => {
        sonar('clic');
        irIntroMazo(mazoElegido, () => irMazo());
      },
      jugar: () => {
        if (!mazoAbierto(perfil, mazoElegido)) return;
        sonar('clic');
        empezar(mazoElegido, reinadoElegido);
      },
    },
  };
}

// ───────────────────────── el Altar ─────────────────────────

/**
 * El Altar es un rincón: el Bufón al costado y, sobre el paño del altar de esquina, una ofrenda por mejora: tantas
 * velas como niveles tiene, prendidas las que ya pagaste. Se elige una ofrenda y un solo MEJORAR (el de la elegida)
 * enciende la vela siguiente.
 */
let mejoraElegida: MejoraId = 'vida';
/** La vela que se acaba de prender (su llama arranca con una chispa). */
let velaRecien: { id: MejoraId; i: number } | null = null;
/** El exvoto de cada ofrenda: la cosita que se deja sobre el paño por lo que se le pide al Altar. */
const EXVOTO: Record<MejoraId, () => string> = {
  vida: () => pxHud('vida'),
  oro: () => pxHud('oro'),
  descuento: () => pxAmuleto('moneda'),
  suerte: () => pxAumento('cartamarcada'),
  reyes: () => pxBendicion('deguello'),
  hueco: () => pxAmuleto('taba'),
  purga: () => pxHud('descarte'),
};
export function pantallaAltar(): Pantalla {
  const ofrenda = (id: MejoraId): string => {
    const m = MEJORAS.find((x) => x.id === id)!;
    const nivel = perfil.altar[id];
    const coste = costeMejora(id, nivel);
    const puede = coste !== null && perfil.porotos >= coste;
    const velas = Array.from({ length: m.max }, (_, i) => `<span class="al-vela ${i < nivel ? 'prendida' : ''} ${velaRecien?.id === id && velaRecien.i === i ? 'recien' : ''}" style="--i:${i}">${pxHud(i < nivel ? 'vela' : 'velaApagada')}</span>`).join('');
    const elegida = id === mejoraElegida;
    return `<button class="al-ofrenda ${elegida ? 'elegida' : ''} ${puede ? 'alcanza' : ''} ${coste === null ? 'llena' : ''}" role="radio" aria-checked="${elegida}" data-accion="ofrenda" data-id="${id}" data-foco="of-${id}" ${elegida ? 'data-inicio' : ''} aria-label="${esc(tx(m.nombre))} ${nivel}/${m.max}">
      <span class="al-exvoto" aria-hidden="true">${EXVOTO[id]()}</span>
      <span class="al-velas" aria-hidden="true">${velas}</span>
      <b class="al-nombre">${esc(tx(m.nombre))}</b>
    </button>`;
  };
  const detalle = (): string => {
    const id = mejoraElegida;
    const m = MEJORAS.find((x) => x.id === id)!;
    const nivel = perfil.altar[id];
    const coste = costeMejora(id, nivel);
    const puede = coste !== null && perfil.porotos >= coste;
    // (0.23) Devolver: el último nivel vuelve entero (probar no castiga). Y (o D) lo pulsa; la ayuda dice cuánto vuelve
    const vuelve = reembolso(id, nivel);
    const devolverHtml = `<button class="btn marco hierro al-devolver" data-accion="devolver" data-id="${id}" data-foco="devolver" data-tecla="d" ${vuelve === null ? 'disabled' : ''} ${tip(t('devolver'), vuelve === null ? t('devolverNada') : t('devolverTip', { n: vuelve }))}>${glifo('Y', 'D')}${t('devolver')}${vuelve === null ? '' : ` ${pxHud('poroto')}${cifra(`+${vuelve}`, 'hueso')}`}</button>`;
    return `<div class="al-texto"><b class="al-titulo">${esc(tx(m.nombre))}</b><span class="sub">${esc(tx(m.desc))}</span><span class="al-nivel">${cifra(`${nivel}/${m.max}`, 'hueso')}</span></div>
      <div class="al-botones">
      <button class="btn marco ${puede ? 'oro' : ''} mj-boton" data-accion="mejorar" data-id="${id}" data-foco="mejorar" ${puede ? '' : 'disabled'}>${coste === null ? t('alMaximo') : `${t('mejorar')} ${pxHud('poroto')}${cifra(coste, puede ? 'purpura' : 'hueso')}`}</button>
      ${devolverHtml}
      </div>`;
  };
  return {
    nombre: 'altar',
    atras: irPortada,
    html: () => `<main class="pantalla altar">
      <header class="cabecera">
        <button class="btn marco chico" data-accion="volver" data-foco="volver">‹ ${t('volver')}</button>
        ${solapas('altar')}
        <span class="lado porotos" ${tip(t('porotos'), idioma() === 'en' ? 'Every run leaves some, win or lose.' : 'Cada partida deja algunos, ganes o pierdas.')}>${pxHud('poroto')}${cifra(perfil.porotos, 'oro', 'grande')}</span>
      </header>
      <div class="cuerpo al-escena">
        <div class="al-cuadro">${anfitrion(tx(alAzar(VOZ.altar, enFoto() ? 0 : undefined)), 'reposo', 'al-bufon')}</div>
        <section class="al-altar">
          <div class="al-pano" role="radiogroup" aria-label="${t('altar')}">${MEJORAS.map((m) => ofrenda(m.id)).join('')}</div>
          <div class="al-detalle marco" data-detalle>${detalle()}</div>
        </section>
      </div>
    </main>`,
    acciones: {
      ...irSolapa,
      volver: irPortada,
      ofrenda: (el) => {
        mejoraElegida = el.dataset.id as MejoraId;
        sonar('clic');
        repintar();
      },
      mejorar: (el) => {
        const id = el.dataset.id as MejoraId;
        const antes = perfil.altar[id];
        if (mejorar(perfil, id)) {
          velaRecien = { id, i: antes };
          window.setTimeout(() => (velaRecien = null), 900);
          sonar('oro');
          guardarPerfil();
          repintar();
          bufonDice(tx(alAzar(VOZ.altarCompra)));
        }
      },
      devolver: (el) => {
        const id = el.dataset.id as MejoraId;
        const vuelve = reembolso(id, perfil.altar[id]);
        if (vuelve === null || !devolver(perfil, id)) return;
        sonar('oro');
        guardarPerfil();
        repintar();
        // (si la vela apagada dejó al botón sin nivel, el foco cae en MEJORAR)
        if (!$<HTMLButtonElement>('[data-foco="devolver"]:not(:disabled)')) $<HTMLElement>('[data-foco="mejorar"]')?.focus();
        const r = $('.lado.porotos')?.getBoundingClientRect();
        if (r && !enFoto()) numero(`+${vuelve}`, r.left + r.width / 2, r.bottom + 12, 'oro', 2);
        bufonDice(tx(alAzar(VOZ.altarDevuelve)));
      },
    },
  };
}

// ───────────────────────── la Colección ─────────────────────────

type Pestana = 'mazos' | 'reyes' | 'amuletos' | 'cabalas' | 'bendiciones';
let pestana: Pestana = 'mazos';

export function pantallaColeccion(): Pantalla {
  const visto = (clave: string) => perfil.vistos.includes(clave);
  const item = (clave: string, icono: string, nombre: string, desc: string, pie: string): string =>
    visto(clave)
      ? `<button class="col-item" ${tip(nombre, desc, pie)}>${icono}<span class="col-nombre">${esc(nombre)}</span></button>`
      : `<button class="col-item sin-ver" ${tip(t('sinVer'), t('sinVerDesc'))}><span class="col-icono-oculto">${icono}</span><span class="col-nombre">${t('sinVer')}</span></button>`;
  const cuerpo = (): string => {
    if (pestana === 'mazos')
      return `<div class="col-mazos">${MAZOS.map((m) => {
        const d = MAZO[m];
        const abierto = mazoAbierto(perfil, m);
        const gano = perfil.ganado[m];
        return `<div class="col-mazo ${abierto ? '' : 'cerrado'}" ${tip(`${tx(d.nombre)} · ${tx(d.personaje)}`, d.reglas.map((r) => tx(r)).join(' '), abierto ? (gano ? t('reinado', { n: gano }) : '') : tx(d.desbloqueo!.texto))}>
          ${pxDorso(m)}<b>${esc(tx(d.nombre))}</b><span class="sub">${esc(tx(d.personaje))}</span>${gano ? `<span class="chip sinergia">${t('reinado', { n: gano })}</span>` : ''}
        </div>`;
      }).join('')}</div>`;
    if (pestana === 'reyes')
      return `<div class="col-reyes">${PALOS.map((s) => {
        const r = REY_DEF[s];
        const v = visto(`r:${s}`);
        return `<div class="col-rey ${v ? '' : 'sin-ver'}" ${v ? tip(`${tx(r.nombre)} · ${tx(r.apodo)}`, `${tx(r.rasgo)}: ${tx(r.rasgoDesc)}`, `${nombreCarga(s)}: ${tx(r.cargaDa)}`) : tip(t('sinVer'), t('sinVerDesc'))}>
          ${reyHtml(s, 'calma')}<b>${v ? esc(tx(r.apodo)) : t('sinVer')}</b><span class="sub">${v ? esc(tx(r.nombre)) : esc(t('sinVerDesc'))}</span>${v ? `<span class="chip canto">${esc(tx(r.rasgo))}</span><p class="col-ficha">${esc(tx(r.rasgoDesc))}</p><p class="col-ficha col-carga">${pxPalo(s)} <b>${esc(nombreCarga(s))}</b> ·${esc(tx(r.cargaDa))}</p>` : ''}
        </div>`;
      }).join('')}</div>`;
    if (pestana === 'amuletos') return `<div class="col-rejilla">${AMULETOS.map((id) => item(`a:${id}`, pxAmuleto(id), tx(AMULETO[id].nombre), tx(AMULETO[id].desc), tx(RAREZA_NOMBRE[AMULETO[id].rareza]))).join('')}</div>`;
    if (pestana === 'cabalas') return `<div class="col-rejilla">${AUMENTOS.map((id) => item(`u:${id}`, pxAumento(id), tx(AUMENTO[id].nombre), tx(AUMENTO[id].desc), AUMENTO[id].maldicion ? t('maldicion') : t('unaCabala'))).join('')}</div>`;
    return `<div class="col-rejilla">${BENDICIONES.map((id) => item(`b:${id}`, pxBendicion(id), tx(BENDICION[id].nombre), tx(BENDICION[id].desc(1)), tx(REY_DEF[BENDICION[id].rey].apodo))).join('')}</div>`;
  };
  const pestanas: Pestana[] = ['mazos', 'reyes', 'amuletos', 'cabalas', 'bendiciones'];
  return {
    nombre: 'coleccion',
    atras: irPortada,
    html: () => `<main class="pantalla coleccion">
      <header class="cabecera">
        <button class="btn marco chico" data-accion="volver" data-foco="volver" data-inicio>‹ ${t('volver')}</button>
        ${solapas('coleccion')}
        <span class="lado"></span>
      </header>
      <div class="cuerpo col-escena">
        <div class="col-columna">
          <nav class="fila pestanas" role="tablist">${pestanas.map((p) => `<button class="btn marco chico ${p === pestana ? 'oro' : ''}" role="tab" aria-selected="${p === pestana}" data-accion="pestana" data-id="${p}" data-foco="tab-${p}">${t(p === 'amuletos' ? 'amuletos' : p)}</button>`).join('')}</nav>
          <section class="col-cuerpo col-pared">${cuerpo()}</section>
        </div>
      </div>
    </main>`,
    acciones: {
      ...irSolapa,
      volver: irPortada,
      pestana: (el) => {
        pestana = el.dataset.id as Pestana;
        repintar();
      },
    },
  };
}

// ───────────────────────── la Crónica ─────────────────────────

/**
 * El cuadro de la Crónica: el retrato de tu última partida colgado como un cuadro (marco de oro si ganaste, de hierro
 * si caíste), con su chapa, y el Bufón al pie que lo comenta. Sin partidas, solo el Bufón.
 */
function cuadroCronica(): string {
  const r = perfil.cronica[0];
  const voz = anfitrion(tx(alAzar(VOZ.cronica, enFoto() ? 0 : undefined)), 'reposo', 'cr-bufon');
  if (!r) return `<div class="cr-cuadro">${voz}</div>`;
  const cara = urlRetrato(r.mazo, { mirada: 0, gesto: r.victoria ? 'feroz' : 'caido', herida: r.victoria ? 0 : 2 });
  return `<div class="cr-cuadro">
    <figure class="cr-ultima ${r.victoria ? 'gano' : 'cayo'}"><i class="cr-ultima-cara" style="background-image:url(${cara})"></i>
      <figcaption class="cr-chapa"><b class="rotulo">${esc(tx(MAZO[r.mazo].nombre))}</b><span class="${r.victoria ? 'dorado' : 'rojo'}">${r.victoria ? t('gano') : t('cayo', { n: Math.min(3, r.acto + 1) })}</span></figcaption>
    </figure>
    ${voz}
  </div>`;
}

export function pantallaCronica(): Pantalla {
  const s = perfil.stats;
  const dato = (rotulo: string, valor: number) => `<div class="cr-dato"><span class="rotulo">${rotulo}</span>${cifra(valor, 'oro', 'grande')}</div>`;
  return {
    nombre: 'cronica',
    atras: irPortada,
    html: () => `<main class="pantalla cronica">
      <header class="cabecera">
        <button class="btn marco chico" data-accion="volver" data-foco="volver" data-inicio>‹ ${t('volver')}</button>
        ${solapas('cronica')}
        <span class="lado"></span>
      </header>
      <div class="cuerpo cr-escena">
      ${cuadroCronica()}
      <div class="cr-columna">
      <div class="cr-datos marco">${dato(t('partidas'), s.partidas)}${dato(t('victorias'), s.victorias)}${dato(t('reyesVencidos'), s.reyes)}${dato(t('mejorGolpe'), s.mejorGolpe)}</div>
      <section class="cr-lista marco">
        ${
          perfil.cronica.length
            ? perfil.cronica
                .slice(0, 6)
                .map(
                  (r) => `<div class="cr-fila">
            <i class="cr-cara" style="background-image:url(${urlRetrato(r.mazo, { mirada: 0, gesto: r.victoria ? 'feroz' : 'caido', herida: r.victoria ? 0 : 2 })})"></i>
            <div class="cr-texto"><b class="${r.victoria ? 'dorado' : 'rojo'}">${esc(tx(MAZO[r.mazo].nombre))} · ${t('reinado', { n: r.reinado })} · ${r.victoria ? t('gano') : t('cayo', { n: Math.min(3, r.acto + 1) })}</b>
            <span class="sub">${esc(tx(TRAMO_NOMBRE[Math.min(2, r.acto)]))} · ${t('mejorGolpe')} ${r.mejorGolpe} · ${t('semilla', { s: r.semilla })}</span></div>
            <span class="cr-porotos">${pxHud('poroto')}${cifra(`+${r.porotos}`, 'oro')}</span>
          </div>`,
                )
                .join('')
            : `<p class="sub cr-vacia">${t('cronicaVacia')}</p>`
        }
      </section>
      </div>
      </div>
    </main>`,
    acciones: {
      ...irSolapa, volver: irPortada },
  };
}

// ───────────────────────── Ajustes ─────────────────────────

export function pantallaAjustes(): Pantalla {
  const conmuta = (accion: string, activo: boolean, foco: string) =>
    `<div class="fila"><button class="btn marco chico ${activo ? 'oro' : ''}" data-accion="${accion}-si" data-foco="${foco}-si" aria-pressed="${activo}">${t('activado')}</button><button class="btn marco chico ${activo ? '' : 'oro'}" data-accion="${accion}-no" data-foco="${foco}-no" aria-pressed="${!activo}">${t('desactivado')}</button></div>`;
  return {
    nombre: 'ajustes',
    atras: irPortada,
    html: () => `<main class="pantalla ajustes-p">
      <header class="cabecera">
        <button class="btn marco chico" data-accion="volver" data-foco="volver" data-inicio>‹ ${t('volver')}</button>
        ${solapas('ajustes')}
        <span class="lado"></span>
      </header>
      <div class="cuerpo aj-escena">
      <div class="aj-cuadro">
        <div class="aj-abanico" aria-hidden="true">${MAZOS.map((m, i) => `<span class="aj-dorso" style="--i:${i}">${pxDorso(m)}</span>`).join('')}</div>
        ${anfitrion(tx(alAzar(VOZ.ajustes, enFoto() ? 0 : undefined)), 'reposo', 'aj-bufon')}
      </div>
      <section class="aj-lista marco">
        <div class="aj-fila"><b>${t('idioma')}</b><div class="fila"><button class="btn marco chico ${idioma() === 'es' ? 'oro' : ''}" data-accion="es" data-foco="aj-es" aria-pressed="${idioma() === 'es'}">Español</button><button class="btn marco chico ${idioma() === 'en' ? 'oro' : ''}" data-accion="en" data-foco="aj-en" aria-pressed="${idioma() === 'en'}">English</button></div></div>
        <div class="aj-fila"><b>${t('calma')}</b>${conmuta('calma', ajustes.calma, 'aj-calma')}</div>
        <div class="aj-fila"><b>${t('sonido')}</b>${conmuta('sonido', ajustes.sonido, 'aj-sonido')}</div>
        <div class="aj-fila"><b>${t('musica')}</b>${conmuta('musica', ajustes.musica, 'aj-musica')}</div>
        <div class="aj-fila"><b>${t('borrar')}</b><button class="btn marco chico" data-accion="borrar" data-foco="aj-borrar">${t('borrar')}</button></div>
        <p class="sub aj-creditos">${t('creditos')} · v${VERSION}</p>
      </section>
      </div>
    </main>`,
    acciones: {
      ...irSolapa,
      volver: irPortada,
      es: () => {
        fijarIdioma('es');
        repintar();
      },
      en: () => {
        fijarIdioma('en');
        repintar();
      },
      'calma-si': () => {
        ajustes.calma = true;
        guardarAjustes();
        repintar();
      },
      'calma-no': () => {
        ajustes.calma = false;
        guardarAjustes();
        repintar();
      },
      'musica-si': () => {
        ajustes.musica = true;
        guardarAjustes();
        refrescarMusica();
        repintar();
      },
      'musica-no': () => {
        ajustes.musica = false;
        guardarAjustes();
        refrescarMusica();
        repintar();
      },
      'sonido-si': () => {
        ajustes.sonido = true;
        guardarAjustes();
        refrescarSonido();
        repintar();
      },
      'sonido-no': () => {
        ajustes.sonido = false;
        guardarAjustes();
        refrescarSonido();
        repintar();
      },
      borrar: () => {
        abrirModal(
          `<div class="panel"><p>${t('borrarSeguro')}</p><div class="fila"><button class="btn marco" data-accion="no" data-inicio>${t('no')}</button><button class="btn marco oro" data-accion="si">${t('si')}</button></div></div>`,
          {
            no: () => cerrarModal(),
            si: () => {
              borrarTodo();
              sesion.partida = null;
              cerrarModal();
              irPortada();
            },
          },
        );
      },
    },
  };
}
