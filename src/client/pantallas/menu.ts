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
import { continuar, empezar, hayPartida, irAjustes, irAltar, irCaminoSol, irColeccion, irCronica, irExplorar, irMazo, irPortada, pintarFase, sesion } from '../juego';
import {
  distanciaMesaGloria3d,
  enfocarRincon3d,
  entrarExploracion3d,
  entrarSolDeMayo3d,
  moverExploracion3d,
  raycastRincon3d,
  resaltarRincon3d,
  rinconFrente3d,
  rotarExploracion3d,
  salirExploracion3d,
  salirSolDeMayo3d,
  type RinconId,
} from '../escena3d';
import { CUADRO0 } from '../pixel/personajes';
import { cifra, pxAmuleto, pxAumento, pxBendicion, pxDorso, pxHud, pxLogo, pxPalo, urlRetrato } from '../sprites';
import { TRAMO_NOMBRE } from '../textos';
import { VOZ } from '../voces';
import { bufonDice } from '../bufon-vivo';
import { $, abrirModal, anfitrion, cerrarModal, esc, miniAnfitrion, repintar, reyHtml, tip, type Pantalla } from '../ui';

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
      levantarse: irExplorar,
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

export function pantallaExplorar(): Pantalla {
  const RINCONES: { id: RinconId; clave: Parameters<typeof t>[0] }[] = [
    { id: 'mesa', clave: 'rinconMesa' },
    { id: 'altar', clave: 'rinconAltar' },
    { id: 'coleccion', clave: 'rinconColeccion' },
    { id: 'fogon', clave: 'rinconFogon' },
    { id: 'cronica', clave: 'rinconCronica' },
    { id: 'ajustes', clave: 'rinconAjustes' },
    { id: 'puerta', clave: 'rinconPuerta' },
  ];
  const nombreDe = (id: RinconId): string => t(RINCONES.find((r) => r.id === id)?.clave ?? 'rinconMesa');

  return {
    nombre: 'explorar',
    atras: () => {
      salirExploracion3d();
      irPortada();
    },
    html: () => `<main class="pantalla explorar">
      <header class="explorar-top">
        <span class="explorar-guia sub">${t('explorarGuia')}</span>
        <button class="btn marco chico" data-accion="sentarse" data-foco="sentarse" data-inicio>${t('volverMesa')}</button>
      </header>
      <div class="explorar-mira" aria-hidden="true">
        <i class="mira-punto"></i>
        <b class="mira-cartel" hidden></b>
      </div>
      <p class="explorar-susurro" hidden role="status"></p>
      <nav class="explorar-barra" aria-label="${t('levantarse')}">
        ${RINCONES.map((r) => `<button class="btn marco chico exp-btn" data-accion="ir-${r.id}" data-rincon="${r.id}">${t(r.clave)}</button>`).join('')}
      </nav>
    </main>`,
    alMontar: (raiz) => {
      entrarExploracion3d(enFoto());
      const cartel = raiz.querySelector<HTMLElement>('.mira-cartel');
      const susurro = raiz.querySelector<HTMLElement>('.explorar-susurro');
      let activo: RinconId | null = null;
      let timerSusurro = 0;
      const decir = (msg: string): void => {
        if (!susurro) return;
        susurro.textContent = msg;
        susurro.hidden = false;
        window.clearTimeout(timerSusurro);
        timerSusurro = window.setTimeout(() => {
          if (susurro.isConnected) susurro.hidden = true;
        }, 3600);
      };
      const abrirRincon = (id: RinconId): void => {
        sonar('clic');
        if (id === 'mesa') {
          salirExploracion3d();
          irMazo();
        } else if (id === 'altar') {
          salirExploracion3d();
          irAltar();
        } else if (id === 'coleccion') {
          salirExploracion3d();
          irColeccion();
        } else if (id === 'cronica') {
          salirExploracion3d();
          irCronica();
        } else if (id === 'ajustes') {
          salirExploracion3d();
          irAjustes();
        } else if (id === 'puerta') {
          enfocarRincon3d('puerta');
          decir(t('puertaTrancada'));
        } else if (id === 'fogon') {
          enfocarRincon3d('fogon');
          decir(t('fogonReposo'));
        }
      };

      const teclas = new Set<string>();
      const onKeyDown = (ev: KeyboardEvent): void => {
        if (!raiz.isConnected) return;
        const k = ev.key.toLowerCase();
        teclas.add(k);
        if (k === 'e' && activo) {
          ev.preventDefault();
          abrirRincon(activo);
        }
      };
      const onKeyUp = (ev: KeyboardEvent): void => {
        teclas.delete(ev.key.toLowerCase());
      };

      let arrastrando = false;
      let moved = false;
      let lastX = 0;
      let lastY = 0;
      const onDown = (ev: PointerEvent): void => {
        if ((ev.target as HTMLElement).closest('button')) return;
        arrastrando = true;
        moved = false;
        lastX = ev.clientX;
        lastY = ev.clientY;
      };
      const onMove = (ev: PointerEvent): void => {
        if (arrastrando) {
          const dx = ev.clientX - lastX;
          const dy = ev.clientY - lastY;
          if (Math.hypot(dx, dy) > 4) moved = true;
          lastX = ev.clientX;
          lastY = ev.clientY;
          rotarExploracion3d(-dx * 0.0045, -dy * 0.0035);
          return;
        }
        if ((ev.target as HTMLElement).closest('button')) return;
        const ndcX = (ev.clientX / Math.max(1, innerWidth)) * 2 - 1;
        const ndcY = -(ev.clientY / Math.max(1, innerHeight)) * 2 + 1;
        const hit = raycastRincon3d(ndcX, ndcY);
        if (hit !== activo) {
          activo = hit;
          resaltarRincon3d(hit);
        }
      };
      const onUp = (ev: PointerEvent): void => {
        if (!arrastrando) return;
        arrastrando = false;
        if (!moved && !(ev.target as HTMLElement).closest('button')) {
          const ndcX = (ev.clientX / Math.max(1, innerWidth)) * 2 - 1;
          const ndcY = -(ev.clientY / Math.max(1, innerHeight)) * 2 + 1;
          const hit = raycastRincon3d(ndcX, ndcY) ?? activo;
          if (hit) abrirRincon(hit);
        }
      };

      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
      window.addEventListener('pointerdown', onDown);
      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerup', onUp);

      let tPrev = performance.now();
      let raf = 0;
      const bucle = (ahora: number): void => {
        if (!raiz.isConnected) {
          window.removeEventListener('keydown', onKeyDown);
          window.removeEventListener('keyup', onKeyUp);
          window.removeEventListener('pointerdown', onDown);
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
          return;
        }
        const dt = Math.min(0.05, Math.max(0.001, (ahora - tPrev) / 1000));
        tPrev = ahora;
        let adel = (teclas.has('w') || teclas.has('arrowup') ? 1 : 0) - (teclas.has('s') || teclas.has('arrowdown') ? 1 : 0);
        let der = (teclas.has('d') ? 1 : 0) - (teclas.has('a') ? 1 : 0);
        const giro = (teclas.has('arrowleft') || teclas.has('q') ? 1 : 0) - (teclas.has('arrowright') ? 1 : 0);
        if (giro !== 0) rotarExploracion3d(giro * 1.9 * dt, 0);

        const pad = navigator.getGamepads?.()[0];
        if (pad) {
          if (Math.abs(pad.axes[1]) > 0.2) adel -= pad.axes[1];
          if (Math.abs(pad.axes[0]) > 0.2) der += pad.axes[0];
          if (Math.abs(pad.axes[2]) > 0.2) rotarExploracion3d(-pad.axes[2] * 2.2 * dt, 0);
          if (Math.abs(pad.axes[3]) > 0.2) rotarExploracion3d(0, -pad.axes[3] * 1.6 * dt);
        }

        if (moverExploracion3d(adel, der, dt)) sonar('paso');

        const frente = rinconFrente3d();
        if (frente && !arrastrando) {
          activo = frente;
          resaltarRincon3d(frente);
        }
        if (cartel) {
          if (activo) {
            cartel.textContent = `[E] · ${nombreDe(activo)}`;
            cartel.hidden = false;
          } else {
            cartel.hidden = true;
          }
        }
        raf = requestAnimationFrame(bucle);
      };
      raf = requestAnimationFrame(bucle);
      void raf;
    },
    acciones: {
      sentarse: () => {
        sonar('clic');
        salirExploracion3d();
        irPortada();
      },
      ...Object.fromEntries(
        RINCONES.map((r) => [
          `ir-${r.id}`,
          () => {
            sonar('clic');
            if (r.id === 'puerta') {
              if (perfil.stats.victorias > 0) {
                salirExploracion3d();
                irCaminoSol(false);
                return;
              }
              enfocarRincon3d('puerta');
              const s = $<HTMLElement>('.explorar-susurro');
              if (s) {
                s.textContent = t('puertaTrancada');
                s.hidden = false;
              }
            } else if (r.id === 'fogon') {
              enfocarRincon3d('fogon');
              const s = $<HTMLElement>('.explorar-susurro');
              if (s) {
                s.textContent = t('fogonReposo');
                s.hidden = false;
              }
            } else {
              salirExploracion3d();
              if (r.id === 'mesa') irMazo();
              else if (r.id === 'altar') irAltar();
              else if (r.id === 'coleccion') irColeccion();
              else if (r.id === 'cronica') irCronica();
              else if (r.id === 'ajustes') irAjustes();
            }
          },
        ]),
      ),
    },
  };
}

// ───────────────────────── Camino al Sol de Mayo ─────────────────────────

export function pantallaCaminoSol(enClimax = false): Pantalla {
  let saliendo = false;
  const salir = (): void => {
    if (saliendo) return;
    saliendo = true;
    sonar('clic');
    salirSolDeMayo3d();
    if (enClimax) pintarFase();
    else irExplorar();
  };
  return {
    nombre: 'sol-de-mayo',
    atras: salir,
    html: () => `<main class="pantalla sol-de-mayo">
      <header class="sol-top">
        <div class="sol-titulo-caja">
          <b class="rotulo dorado sol-titulo">${t('solDeMayoTitulo')}</b>
          <span class="sub explorar-guia">${t('solDeMayoGuia')}</span>
        </div>
      </header>
      <footer class="sol-pie">
        <button class="btn marco oro grande" data-accion="salir-sol" data-foco="avanzar-sol" data-inicio>${enClimax ? t('enfrentarReyFinal') : t('volverPulperia')}</button>
      </footer>
    </main>`,
    alMontar: (raiz) => {
      entrarSolDeMayo3d(enFoto());
      const teclas = new Set<string>();
      const onKeyDown = (ev: KeyboardEvent): void => {
        if (!raiz.isConnected) return;
        const k = ev.key.toLowerCase();
        teclas.add(k);
        if (k === 'e') {
          ev.preventDefault();
          salir();
        }
      };
      const onKeyUp = (ev: KeyboardEvent): void => {
        teclas.delete(ev.key.toLowerCase());
      };
      let arrastrando = false;
      let lastX = 0;
      let lastY = 0;
      const onDown = (ev: PointerEvent): void => {
        if ((ev.target as HTMLElement).closest('button')) return;
        arrastrando = true;
        lastX = ev.clientX;
        lastY = ev.clientY;
      };
      const onMove = (ev: PointerEvent): void => {
        if (!arrastrando) return;
        const dx = ev.clientX - lastX;
        const dy = ev.clientY - lastY;
        lastX = ev.clientX;
        lastY = ev.clientY;
        rotarExploracion3d(-dx * 0.0045, -dy * 0.0035);
      };
      const onUp = (): void => {
        arrastrando = false;
      };
      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
      window.addEventListener('pointerdown', onDown);
      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerup', onUp);

      let tPrev = performance.now();
      const bucle = (ahora: number): void => {
        if (!raiz.isConnected) {
          window.removeEventListener('keydown', onKeyDown);
          window.removeEventListener('keyup', onKeyUp);
          window.removeEventListener('pointerdown', onDown);
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
          return;
        }
        const dt = Math.min(0.05, Math.max(0.001, (ahora - tPrev) / 1000));
        tPrev = ahora;
        let adel = (teclas.has('w') || teclas.has('arrowup') ? 1 : 0) - (teclas.has('s') || teclas.has('arrowdown') ? 1 : 0);
        let der = (teclas.has('d') ? 1 : 0) - (teclas.has('a') ? 1 : 0);
        const giro = (teclas.has('arrowleft') || teclas.has('q') ? 1 : 0) - (teclas.has('arrowright') ? 1 : 0);
        if (giro !== 0) rotarExploracion3d(giro * 1.9 * dt, 0);

        const pad = navigator.getGamepads?.()[0];
        if (pad) {
          if (Math.abs(pad.axes[1]) > 0.2) adel -= pad.axes[1];
          if (Math.abs(pad.axes[0]) > 0.2) der += pad.axes[0];
          if (Math.abs(pad.axes[2]) > 0.2) rotarExploracion3d(-pad.axes[2] * 2.2 * dt, 0);
          if (Math.abs(pad.axes[3]) > 0.2) rotarExploracion3d(0, -pad.axes[3] * 1.6 * dt);
        }

        if (moverExploracion3d(adel, der, dt)) sonar('paso');
        if (enClimax && distanciaMesaGloria3d() < 4.5) {
          salir();
          return;
        }
        requestAnimationFrame(bucle);
      };
      requestAnimationFrame(bucle);
    },
    acciones: {
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
        ${abierto ? `<p class="sub">${t('vida')} ${vida} · ${t('mano', { n: m.mano })}</p>` : `<p class="rojo">${t('bloqueado')} · ${esc(tx(d.desbloqueo!.texto))} ${t('avance', { a, b })}</p>`}
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
