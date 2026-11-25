// Intro 3D del Personaje por Mazo (0.52.0): enseña cada juego argentino en 3 golpes visuales sobre la mesa 3D.
import type { Palo } from '../../rules/cartas';
import { MAZO, type MazoId } from '../../rules/mazos';
import { idioma, t, tx } from '../almacen';
import { sonar } from '../audio';
import { pxNaipe, urlRetrato } from '../sprites';
import { CUADRO0 } from '../pixel/personajes';
import { esc, pantallaActual, repintar, type Pantalla } from '../ui';

const CLAVE_INTROS = 'cabala:intros';

export function introVista(mazo: MazoId): boolean {
  try {
    const raw = localStorage.getItem(CLAVE_INTROS);
    const list: string[] = raw ? JSON.parse(raw) : [];
    return list.includes(mazo);
  } catch {
    return false;
  }
}

export function marcarIntroVista(mazo: MazoId): void {
  try {
    const raw = localStorage.getItem(CLAVE_INTROS);
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(mazo)) {
      list.push(mazo);
      localStorage.setItem(CLAVE_INTROS, JSON.stringify(list));
    }
  } catch {
    // sin almacenamiento
  }
}

interface PasoIntro {
  titulo: { es: string; en: string };
  texto: { es: string; en: string };
  cartas: Array<{ palo: Palo | 'X'; n: number }>;
}

const GUIONES: Record<MazoId, PasoIntro[]> = {
  truco: [
    {
      titulo: { es: '3 CARTAS · DEL 1 AL 7', en: '3 CARDS · 1 TO 7' },
      texto: { es: '«El Truco se juega con mano corta de 3 cartas del 1 al 7. ¡No hay relleno!»', en: '"Truco plays a tight 3-card hand from 1 to 7. No filler!"' },
      cartas: [{ palo: 'S', n: 3 }, { palo: 'D', n: 2 }, { palo: 'H', n: 6 }],
    },
    {
      titulo: { es: 'LAS 4 BRAVAS MANDAN', en: 'THE 4 BRAVAS RULE' },
      texto: { es: '«1 de Espadas, 1 de Bastos, 7 de Espadas y 7 de Oros pegan con furia extra.»', en: '"1 of Swords, 1 of Clubs, 7 of Swords & 7 of Coins hit with extra fury."' },
      cartas: [{ palo: 'S', n: 1 }, { palo: 'C', n: 1 }, { palo: 'S', n: 7 }, { palo: 'D', n: 7 }],
    },
    {
      titulo: { es: '¡ENVIDO! Y DESCARTE TÁCTICO', en: 'ENVIDO! & TACTICAL DISCARD' },
      texto: { es: '«Dos del mismo palo que sumen 8+ cantan ¡ENVIDO! Descartá para buscarlas.»', en: '"Two same-suit cards adding to 8+ call ENVIDO! Discard to hunt them."' },
      cartas: [{ palo: 'S', n: 7 }, { palo: 'S', n: 5 }],
    },
  ],
  escoba: [
    {
      titulo: { es: 'MANO DE 3 CARTAS', en: '3-CARD HAND' },
      texto: { es: '«Arrancás con 3 cartas y Escudo de Mesa Limpia en el primer tramo.»', en: '"Start with 3 cards and Clean Table Shield in the first stretch."' },
      cartas: [{ palo: 'D', n: 7 }, { palo: 'S', n: 5 }, { palo: 'H', n: 3 }],
    },
    {
      titulo: { es: 'SUMÁ 15 JUSTO: ¡ESCOBA!', en: 'ADD UP TO 15: ESCOBA!' },
      texto: { es: '«Cualquier combinación que sume 15 canta ¡ESCOBA! (×3 Multi + Daño eterno).»', en: '"Any set adding up to 15 calls ESCOBA! (×3 Mult + permanent Damage)."' },
      cartas: [{ palo: 'D', n: 7 }, { palo: 'C', n: 8 }],
    },
    {
      titulo: { es: 'REORDENÁ Y DESCARTÁ', en: 'REORDER & DISCARD' },
      texto: { es: '«Descartá cartas sueltas y buscá el 15 exacto contra cada Rey.»', en: '"Discard loose cards and hunt the exact 15 against every King."' },
      cartas: [{ palo: 'D', n: 9 }, { palo: 'H', n: 6 }],
    },
  ],
  chinchon: [
    {
      titulo: { es: 'MANO LARGA DE 7 CARTAS', en: '7-CARD HAND' },
      texto: { es: '«Jugás con 7 cartas en mano para armar juegos largos.»', en: '"Play with 7 cards in hand to build long melds."' },
      cartas: [{ palo: 'H', n: 4 }, { palo: 'H', n: 5 }, { palo: 'H', n: 6 }],
    },
    {
      titulo: { es: 'PIERNA O ESCALERA = ¡CHINCHÓN!', en: 'SET OR SUITED RUN = CHINCHÓN!' },
      texto: { es: '«3 iguales o 3 seguidas del mismo palo cantan ¡CHINCHÓN! para siempre.»', en: '"3 of a kind or 3 suited in a row call CHINCHÓN! forever."' },
      cartas: [{ palo: 'S', n: 7 }, { palo: 'C', n: 7 }, { palo: 'D', n: 7 }],
    },
    {
      titulo: { es: 'CORTÁS Y TE CUBRÍS', en: 'CUT & SHIELD UP' },
      texto: { es: '«Al cantar ¡CHINCHÓN!, cada carta que te sobra sin jugar se vuelve Escudo.»', en: '"When calling CHINCHÓN!, every unplayed card turns into Shield."' },
      cartas: [{ palo: 'C', n: 2 }, { palo: 'C', n: 8 }],
    },
  ],
  mentiroso: [
    {
      titulo: { es: '8 CARTAS Y COMODINES', en: '8 CARDS & JOKERS' },
      texto: { es: '«Llevás 8 cartas y Comodines extra para doblar cualquier jugada.»', en: '"Carry 8 cards and extra Jokers to bend any play."' },
      cartas: [{ palo: 'X', n: 0 }, { palo: 'S', n: 6 }, { palo: 'X', n: 0 }],
    },
    {
      titulo: { es: 'CARA DE PIEDRA', en: 'STONE FACE' },
      texto: { es: '«Empezás cada combate blindado con Escudo de entrada.»', en: '"Start every fight armored with opening Shield."' },
      cartas: [{ palo: 'C', n: 5 }, { palo: 'C', n: 6 }],
    },
    {
      titulo: { es: '¡MENTIRA! (ENGAÑO)', en: 'LIAR! (BLUFF)' },
      texto: { es: '«Una vez por combate podés mentir: todas fingen ser tu carta más alta sin Inmune.»', en: '"Once per fight you can Bluff: all pose as your highest card, ignoring Immune."' },
      cartas: [{ palo: 'D', n: 6 }, { palo: 'H', n: 6 }],
    },
  ],
  chancho: [
    {
      titulo: { es: 'MANO AL CENTRO (4 CARTAS)', en: 'HAND IN THE CENTER (4 CARDS)' },
      texto: { es: '«Cuatro cartas ágiles con Multi base alto desde el primer golpe.»', en: '"Four snappy cards with high base Mult from strike one."' },
      cartas: [{ palo: 'S', n: 5 }, { palo: 'C', n: 5 }, { palo: 'D', n: 5 }],
    },
    {
      titulo: { es: 'PASE GRATIS POR TURNO', en: 'FREE PASS PER TURN' },
      texto: { es: '«Cada turno descartar 1 sola carta es gratis y robás otra al toque.»', en: '"Each turn discarding 1 card is free and draws another right away."' },
      cartas: [{ palo: 'H', n: 8 }],
    },
    {
      titulo: { es: '¡CHANCHO! ATURDE', en: 'CHANCHO! STUNS' },
      texto: { es: '«Pierna o Póker cantan ¡CHANCHO! y aturden al enemigo sin contraataque.»', en: '"3 or 4 of a kind call CHANCHO! and stun the foe, skipping counterattack."' },
      cartas: [{ palo: 'S', n: 9 }, { palo: 'C', n: 9 }, { palo: 'D', n: 9 }, { palo: 'H', n: 9 }],
    },
  ],
};

export function pantallaIntroMazo(mazo: MazoId, alTerminar: () => void): Pantalla {
  let paso = 0;
  let onKey: ((ev: KeyboardEvent) => void) | null = null;
  const pasos = GUIONES[mazo];
  const def = MAZO[mazo];

  const avanzar = (): void => {
    sonar('clic');
    if (paso < pasos.length - 1) {
      paso++;
      repintar();
    } else {
      marcarIntroVista(mazo);
      alTerminar();
    }
  };

  const saltar = (): void => {
    sonar('clic');
    marcarIntroVista(mazo);
    alTerminar();
  };

  return {
    nombre: 'intro-mazo',
    atras: saltar,
    alSalir: () => {
      if (onKey) {
        window.removeEventListener('keydown', onKey);
        onKey = null;
      }
    },
    html: () => {
      const lang = idioma();
      const pAct = pasos[paso];
      const esUltimo = paso === pasos.length - 1;
      return `<main class="pantalla intro-mazo">
        <header class="cabecera">
          <div class="lado">
            <h1 class="titulo dorado">${esc(tx(def.nombre))} · ${esc(tx(def.personaje))}</h1>
            <span class="sub">${paso + 1} / ${pasos.length}</span>
          </div>
          <button class="btn marco chico" data-accion="saltar">${t('introSaltar')}</button>
        </header>
        <div class="intro-escena marco">
          <div class="intro-pj">
            <i class="intro-retrato" data-mazo="${mazo}" style="background-image:url(${urlRetrato(mazo, CUADRO0)})"></i>
            <div class="intro-texto">
              <b class="rotulo dorado">${esc(pAct.titulo[lang])}</b>
              <p class="bocadillo sin-cola">${esc(pAct.texto[lang])}</p>
            </div>
          </div>
          <div class="intro-cartas">
            ${pAct.cartas.map((c) => `<span class="intro-carta">${pxNaipe(c)}</span>`).join('')}
          </div>
          <div class="intro-pie">
            <button class="btn marco oro grande" data-accion="siguiente" data-inicio>${esUltimo ? t('introEmpezar') : t('introSiguiente')}</button>
          </div>
        </div>
      </main>`;
    },
    alMontar: () => {
      if (onKey) window.removeEventListener('keydown', onKey);
      onKey = (ev: KeyboardEvent) => {
        if (pantallaActual()?.nombre !== 'intro-mazo') return;
        if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'ArrowRight') {
          ev.preventDefault();
          avanzar();
        } else if (ev.key === 'Escape') {
          ev.preventDefault();
          saltar();
        }
      };
      window.addEventListener('keydown', onKey);
    },
    acciones: {
      siguiente: avanzar,
      saltar,
    },
  };
}
