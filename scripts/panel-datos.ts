// Exporta a artifacts/panel-datos.json los hechos del juego que cita el panel de jugadores simulado (carpeta hermana
// `panelAgentesGaming`, módulo `escenas_cabala.py`): textos de pantalla en los dos idiomas, tablas del motor, cifras
// del laboratorio y unas cuentas de ejemplo hechas con el propio motor. El panel no escribe ninguna cifra a mano.
//   npx tsx scripts/panel-datos.ts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { ESTADOS } from '../src/client/qa';
import { EN, ES, JUGADA_COMO, JUGADA_NOMBRE, NODO_DESC, NODO_NOMBRE, PALO_NOMBRE, PALO_PODER, RANGO_NOMBRE, TRAMO_NOMBRE } from '../src/client/textos';
import { ENSENANZA, GRITO, VOZ } from '../src/client/voces';
import { PISTAS } from '../src/client/musica';
import { AMULETO, AMULETOS, RAREZA_NOMBRE, precioBase } from '../src/rules/amuletos';
import { AUMENTO, AUMENTOS, NIVEL_NOMBRE } from '../src/rules/aumentos';
import { B } from '../src/rules/balance';
import { CABALAS } from '../src/rules/bufon';
import { JUGADAS, PALOS } from '../src/rules/cartas';
import type { Carta, Jugada, PaloCarta } from '../src/rules/cartas';
import { crearEnemigo, cuenta, iniciarCombate } from '../src/rules/combate';
import type { Enemigo } from '../src/rules/estado';
import { COLUMNAS, PISOS, REGLAS_MAPA } from '../src/rules/mapa';
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
  /** El Mapa es vertical (se sube desde abajo) y su red es irregular, con reglas de balance. */
  mapaVertical: true,
  /** El Bufón está en todas las pantallas: llega con humo y sonido, flota, parpadea, y su bocadillo se escribe y se va. */
  bufonVivo: true,
  /** El naipe del Comodín lleva su nombre escrito. */
  comodinRotulado: true,
  /** Cada Mazo se juega con la mano de su juego (Escoba y Truco 3, Chancho Va 4, Chinchón 7, El Mentiroso 8). */
  manosReales: true,
  /** Hay música sintetizada, una pista por pantalla, con su ajuste propio. */
  musica: true,
  /** Los Reyes y los Personajes hablan con su propio timbre; el Personaje grita el canto y el canto cruza la mesa. */
  vocesPropias: true,
  /** El Fogón tiene brasas, suspenso al arrimar y el naipe que se parte si se quema. */
  fogonVivo: true,
  /** Las fotos de la mesa muestran la mano del Mazo (sin Aumentos que repartan de más). */
  fotosManoReal: true,
  /** El HUD va en tres zonas (Vida · Escudo · oro | retrato | Mazo · bandeja de una fila con «+N»). */
  hudSimetrico: true,
  /** Altar, Colección, Crónica y Ajustes comparten solapas: se pasa de una a otra sin volver a la portada. */
  solapas: true,
  /** El botín pasa sobre la mesa: el oro vuela al HUD, la oferta brota sola y, elegida la última, la partida sigue. */
  botinEnMesa: true,
  /** En portátil y Steam Deck los naipes de la mano llevan el número de la esquina más grande. */
  indiceGrande: true,
  /** El Fogón tiene tres pasadas: +Daño seguro, Templada (+Multi) con riesgo y Forja Brava (número doble) con más riesgo. */
  fogonTresPasadas: true,
  /** La tabla de JUGADAS pone arriba el canto del Mazo y pliega las jugadas que no entran en la mano. */
  jugadasPorMazo: true,
  /** El Comodín elegido se dibuja como la carta que copia (un naipe dorado). */
  comodinEspectral: true,
  /** La Furia se ve como llamas detrás del emblema del Ataque. */
  llamasFuria: true,
  /** Al golpear, las cartas se cuentan en cadena (un número y una nota por carta) y el total vibra. */
  conteoEnCadena: true,
  /** Con dos o más Golpes exactos seguidos, el marco de la mesa y el retrato se encienden y la música suma una capa. */
  rachaEncendida: true,
  /** En portátil y Steam Deck los iconos de la bandeja del HUD van al doble (60 px) y el contador de descartes, más grande. */
  bandejaGrande: true,
  /** El Fogón deja templar un naipe con riesgo de quemarlo (ya no «quemar un naipe»). */
  fogonTemple: true,
  /** La cuenta dice cuánto le queda al enemigo o cuánto sobra, y hay racha de Golpes exactos. */
  rachaExactos: true,
  /** En reposo, la zona de la cuenta dice qué hacer. */
  pistaEnReposo: true,
  /** 0.14.0: el conteo dispara pieza por pieza (cada cosa que suma sube con su nombre y su ficha del HUD salta). */
  conteoPorPiezas: true,
  /** 0.14.0: cada parada tiene su escenario (mesa de tablas, Pulpería con estantes, Fogón con leños, Mapa con horizonte) y cada Rey su clima. */
  escenarios: true,
  /** 0.14.0: el golpe pesa en tres escalones y la caída de un Rey es una escena (silencio, fogonazo, lluvia de monedas). */
  golpeConPeso: true,
  /** 0.14.0: en el móvil el descarte al arrastrar es el propio botón DESCARTAR y el naipe va por encima del dedo. */
  dedoPrimero: true,
  /** 0.14.0: con la Vida llena, Descansar en el Fogón sale apagado. */
  fogonSinNulo: true,
  /** 0.15.0: el Escudo de Bastos, la cura de Copas y el tope de Escudo crecen ×2 y ×3 en el segundo y tercer tramo. */
  defensaPorTramo: true,
  /** 0.15.0: pasarse por muy poco (≤ 5 % de la Vida) es «¡AL PELO!»: no cobra, pero sostiene la racha y recarga el Cetro. */
  golpeAlPelo: true,
  /** 0.15.0: cada Rey, a media Vida, muestra su segunda cara (un cartel y una regla nueva). */
  segundaCara: true,
  /** 0.15.0: el Bufón ofrece tres Cábalas picantes nuevas (soplo contra el próximo Rey, robo a La Corte, a ciegas). */
  cabalasPicantes: true,
  /** 0.15.0: en Steam Deck y portátil la letra mínima sube a 18 px, los botones llevan glifos del mando y los números del enemigo tienen rótulo. */
  deckDeVerdad: true,
  /** 0.16.0: las segundas caras cambian el plan (Tajo de revés, Fortín, Remate, Última ronda). */
  segundasFuertes: true,
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
  gritos: GRITO,
  musica: Object.entries(PISTAS).map(([id, p]) => ({ id, bpm: p.bpm, compas: p.pasos === 12 ? '3/4' : '4/4' })),
  palos: Object.fromEntries(PALOS.map((s) => [s, { nombre: PALO_NOMBRE[s], poder: PALO_PODER[s] }])),
  rangos: RANGO_NOMBRE,
  jugadas: [...JUGADAS, 'quince' as Jugada, 'envido' as Jugada].map((j) => ({ id: j, nombre: JUGADA_NOMBRE[j], como: JUGADA_COMO[j], d: B.jugadas[j].d, m: B.jugadas[j].m })),
  nodos: Object.fromEntries((Object.keys(NODO_NOMBRE) as (keyof typeof NODO_NOMBRE)[]).map((n) => [n, { nombre: NODO_NOMBRE[n], desc: NODO_DESC[n] }])),
  tramos: TRAMO_NOMBRE,
  mazos: MAZOS.map((m) => ({ id: m, nombre: MAZO[m].nombre, lema: MAZO[m].lema, personaje: MAZO[m].personaje, regla: MAZO[m].regla, canto: MAZO[m].canto, reglas: MAZO[m].reglas, desbloqueo: MAZO[m].desbloqueo?.texto ?? null, vida: B.mazos[m].vida, mano: B.mazos[m].mano, multiMano: (B.mazos[m] as { multiMano?: number }).multiMano ?? 0 })),
  reyes: PALOS.map((s) => ({ palo: s, nombre: REY_DEF[s].nombre, apodo: REY_DEF[s].apodo, carga: REY_DEF[s].carga, cargaDa: REY_DEF[s].cargaDa, rasgo: REY_DEF[s].rasgo, rasgoDesc: REY_DEF[s].rasgoDesc, voz: REY_DEF[s].voz })),
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
  mapa: { pisos: PISOS, columnas: COLUMNAS, reglas: REGLAS_MAPA },
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
