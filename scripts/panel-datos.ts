// Exporta a artifacts/panel-datos.json los hechos del juego que cita el panel de jugadores simulado (carpeta hermana
// `panelAgentesGaming`, módulo `escenas_cabala.py`): textos de pantalla en los dos idiomas, tablas del motor, cifras
// del laboratorio y unas cuentas de ejemplo hechas con el propio motor. El panel no escribe ninguna cifra a mano.
//   npx tsx scripts/panel-datos.ts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { ESTADOS } from '../src/client/qa';
import { EN, ES, JUGADA_COMO, JUGADA_NOMBRE, NODO_DESC, NODO_NOMBRE, PALO_NOMBRE, PALO_PODER, RANGO_NOMBRE, TRAMO_NOMBRE } from '../src/client/textos';
import { ENSENANZA, VOZ } from '../src/client/voces';
import { AMULETO, AMULETOS, RAREZA_NOMBRE, precioBase } from '../src/rules/amuletos';
import { AUMENTO, AUMENTOS, NIVEL_NOMBRE } from '../src/rules/aumentos';
import { B } from '../src/rules/balance';
import { CABALAS } from '../src/rules/bufon';
import { JUGADAS, PALOS } from '../src/rules/cartas';
import type { Carta, Jugada, PaloCarta } from '../src/rules/cartas';
import { crearEnemigo, cuenta, iniciarCombate } from '../src/rules/combate';
import type { Enemigo } from '../src/rules/estado';
import { MAZO, MAZOS } from '../src/rules/mazos';
import type { MazoId } from '../src/rules/mazos';
import * as juego from '../src/rules/partida';
import { MEJORAS, costeMejora } from '../src/rules/perfil';
import { REINADOS } from '../src/rules/reinados';
import { BENDICION, BENDICIONES, REY_DEF } from '../src/rules/reyes';
import { MARCA, SLUG, VERSION } from '../src/shared/brand';

/** Qué trae la interfaz (se actualiza con cada versión que cambia algo de esto). */
const FUNCIONES = {
  /** Hay una tabla de jugadas consultable desde la mesa. */
  tablaJugadas: true,
  /** La tira del HUD es un solo botón que abre «LO QUE LLEVÁS». */
  panelPiezas: true,
  /** Las cartas a las que el enemigo es Inmune se marcan en la mano. */
  inmuneEnMano: true,
  /** En el móvil la mano va en dos filas (ninguna carta montada de costado). */
  manoDosFilas: true,
  /** El Comodín elegido muestra el número y el palo que copia. */
  comodinMuestra: true,
  /** Hay capturas con el foco del mando a la vista (`mesa-mando`, `mapa-mando`). */
  capturasMando: true,
  /** Las piezas enseñan una nota S / A / B (desde la 0.6.0, no: solo la etiqueta de sinergia). */
  sellosVisibles: false,
};

const c = (palo: PaloCarta, n: number): Carta => ({ id: `${palo}${n}`, palo, n });

/** La cuenta que la mesa muestra para esas cartas, con ese Mazo, contra un enemigo del tramo 1. */
function ejemplo(mazo: MazoId, cartas: Carta[], palo: 'S' | 'C' | 'D' | 'H', rango: 10 | 11 | 12 = 10) {
  const p = juego.nuevaPartida({ mazo, semilla: 'PANEL' });
  juego.elegirOferta(p, 0, null);
  juego.seguir(p);
  const e: Enemigo = crearEnemigo(p, palo, rango);
  iniciarCombate(p, 'guardia', [e, crearEnemigo(p, palo === 'D' ? 'H' : 'D', 10)]);
  p.combate!.mano = cartas;
  const k = cuenta(p, cartas);
  return { mazo, enemigo: { palo, rango, vida: e.vida, ataque: e.ataque, escudo: e.escudo }, jugada: k.jugada, dano: k.dano, multi: k.multi, total: k.total, canto: k.canto, escudo: k.escudo, cura: k.cura, oro: k.oro, contra: k.contra, abate: k.abate, perfora: k.perfora };
}

const lab = existsSync('scripts/meta-report.json') ? JSON.parse(readFileSync('scripts/meta-report.json', 'utf8')) : null;

const datos = {
  juego_id: SLUG,
  version: VERSION,
  marca: MARCA,
  B,
  ui: { es: ES, en: EN },
  voz: { ensenanza: ENSENANZA, ...VOZ },
  palos: Object.fromEntries(PALOS.map((s) => [s, { nombre: PALO_NOMBRE[s], poder: PALO_PODER[s] }])),
  rangos: RANGO_NOMBRE,
  jugadas: [...JUGADAS, 'quince' as Jugada, 'envido' as Jugada].map((j) => ({ id: j, nombre: JUGADA_NOMBRE[j], como: JUGADA_COMO[j], d: B.jugadas[j].d, m: B.jugadas[j].m })),
  nodos: Object.fromEntries((Object.keys(NODO_NOMBRE) as (keyof typeof NODO_NOMBRE)[]).map((n) => [n, { nombre: NODO_NOMBRE[n], desc: NODO_DESC[n] }])),
  tramos: TRAMO_NOMBRE,
  mazos: MAZOS.map((m) => ({ id: m, nombre: MAZO[m].nombre, lema: MAZO[m].lema, personaje: MAZO[m].personaje, regla: MAZO[m].regla, canto: MAZO[m].canto, reglas: MAZO[m].reglas, desbloqueo: MAZO[m].desbloqueo?.texto ?? null, vida: B.mazos[m].vida, mano: B.mazos[m].mano })),
  reyes: PALOS.map((s) => ({ palo: s, nombre: REY_DEF[s].nombre, apodo: REY_DEF[s].apodo, carga: REY_DEF[s].carga, cargaDa: REY_DEF[s].cargaDa, rasgo: REY_DEF[s].rasgo, rasgoDesc: REY_DEF[s].rasgoDesc })),
  bendiciones: BENDICIONES.map((id) => {
    const d = BENDICION[id];
    return { id, nombre: d.nombre, rey: d.rey, dual: d.dual ?? null, niveles: Array.from({ length: d.niveles }, (_, i) => d.desc(i + 1)) };
  }),
  amuletos: AMULETOS.map((id) => ({ id, nombre: AMULETO[id].nombre, palo: AMULETO[id].palo, rareza: RAREZA_NOMBRE[AMULETO[id].rareza], desc: AMULETO[id].desc, precio: precioBase(id) })),
  aumentos: AUMENTOS.map((id) => ({ id, nombre: AUMENTO[id].nombre, nivel: NIVEL_NOMBRE[AUMENTO[id].nivel], maldicion: !!AUMENTO[id].maldicion, desc: AUMENTO[id].desc })),
  cabalas: CABALAS.map((k) => ({ id: k.id, titulo: k.titulo, humor: k.humor, opciones: k.opciones.map((o) => ({ texto: o.texto, detalle: o.detalle })) })),
  mejoras: MEJORAS.map((m) => ({ id: m.id, nombre: m.nombre, desc: m.desc, max: m.max, costes: Array.from({ length: m.max }, (_, i) => costeMejora(m.id, i)) })),
  reinados: REINADOS,
  estados: ESTADOS,
  // Lo que trae la interfaz de esta versión y las escenas del panel necesitan saber para no afirmar de más.
  funciones: FUNCIONES,
  lab: lab && { partidasPorCelda: lab.partidasPorCelda, mazos: lab.mazos },
  ejemplos: {
    // Escoba: un Par de sietes contra la Sota de Copas y contra la Sota de Espadas (Inmune al 7 de Espadas)
    par: ejemplo('escoba', [c('S', 7), c('D', 7)], 'H'),
    parInmune: ejemplo('escoba', [c('S', 7), c('D', 7)], 'S'),
    // Escoba: 7 + 8 suman 15
    escoba: ejemplo('escoba', [c('C', 7), c('H', 8)], 'D'),
    // una Flor de Bastos (Escudo) y una de Copas (cura)
    florBastos: ejemplo('escoba', [c('C', 2), c('C', 5), c('C', 9)], 'H'),
    escalera: ejemplo('escoba', [c('S', 4), c('C', 5), c('D', 6)], 'H'),
    // Truco: Envido con una Brava
    envido: ejemplo('truco', [c('S', 1), c('S', 6)], 'H'),
    brava: ejemplo('truco', [c('S', 1)], 'H'),
    // una carta sola contra el Caballo (con Escudo)
    solaCaballo: ejemplo('escoba', [c('H', 9)], 'D', 11),
    reyTramo1: ejemplo('escoba', [c('C', 9)], 'S', 12),
  },
};

mkdirSync('artifacts', { recursive: true });
writeFileSync('artifacts/panel-datos.json', JSON.stringify(datos, null, 1));
console.log(`artifacts/panel-datos.json · ${datos.version} · ${Object.keys(datos).length} bloques · ${(JSON.stringify(datos).length / 1024).toFixed(0)} KB`);
