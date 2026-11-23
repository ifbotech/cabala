// Las pantallas del camino, todas atendidas por el Bufón: el Mapa ramificado, el Botín y su «ELEGÍ UNA», la
// Pulpería, el Fogón, la Cábala del Bufón y el final de la partida. Abajo, siempre, el HUD del jugador.
import { AMULETO, AMULETOS, RAREZA_NOMBRE } from '../../rules/amuletos';
import { AUMENTO, AUMENTOS } from '../../rules/aumentos';
import type { AmuletoId } from '../../rules/amuletos';
import { B } from '../../rules/balance';
import { CABALA, HUMOR_NOMBRE, detalleDe, humorDe, suerte, type OpcionCabala } from '../../rules/bufon';
import { JUGADAS, PALOS, esComodin, ordenar } from '../../rules/cartas';
import type { Carta, Jugada, Mutacion, Palo } from '../../rules/cartas';
import { carga, sirveA, tieneAumento } from '../../rules/estado';
import type { ItemBotin, Nodo, Oferta, Partida } from '../../rules/estado';
import { COLUMNAS, PISOS } from '../../rules/mapa';
import { MAZO } from '../../rules/mazos';
import * as juego from '../../rules/partida';
import { ver } from '../../rules/perfil';
import { BENDICION, BENDICIONES, REY_DEF } from '../../rules/reyes';
import type { BendicionId } from '../../rules/reyes';
import { clavePieza } from '../../rules/notas';
import { EVOLUCION, esEvolucionable, evoluciono } from '../../rules/evoluciones';
import { alAzar, idioma, perfil, t, tx } from '../almacen';
import { sonar } from '../audio';
import { chispas, destello, haloRey, humo, lluviaDeMonedas, monedas, numero, partirNaipe } from '../fx/efectos';
import { teclear } from '../habla';
import { RAPIDO, pausa, quieto } from '../ritmo';
import { avivarFuego, congelar, enFoto, fuegoEnPantalla, sacudir } from '../fx/motor';
import { avivarRetrato, cargaQue, hudHtml, reubicarGrito } from '../hud';
import { avanzar, guardar, irPortada, sesion, soltarPartida } from '../juego';
import type { Expresion } from '../pixel/bufon';
import { CHICHE, huecosChiche } from '../../rules/chiches';
import { lienzoNaipe, cifra, pxChiche, pxAmuleto, pxAumento, pxEvolucion, pxBendicion, pxHud, pxInmune, pxMitades, pxNaipe, pxNaipeSegunda, pxNodo, pxPalo, pxPieza, urlRetrato } from '../sprites';
import { naipeMapa } from '../pixel/naipes';
import { personajeMapa } from '../pixel/personajes';
import { vigilarEvoluciones } from '../evolucion';
import { MUTACION_PX } from '../mano';
import { JUGADA_COMO, JUGADA_NOMBRE, MUTACION_COSTO, MUTACION_DESC, MUTACION_GANA, MUTACION_NOMBRE, NODO_DESC, NODO_NOMBRE, PALO_NOMBRE, PALO_PODER, PASO_AYUDA, PASO_NOMBRE, RANGO_NOMBRE, TRAMO_NOMBRE } from '../textos';
import { resumenDe, type ResumenPartida } from '../../rules/resumen';
import { VOZ } from '../voces';
import { bufonDice } from '../bufon-vivo';
import { glifo } from '../nav';
import { $, abrirModal, anfitrion, bufonHtml, cerrarModal, conMaldicion, esc, fichaDe, gestoBufon, irASalida, repintar, reyHtml, sinergiaHtml, tip, type Accion, type Pantalla } from '../ui';

const fijo = (): number | undefined => (enFoto() ? 0 : undefined);
const expresionDe = (p: Partida): Expresion => (p.afinidad <= -2 ? 'sombria' : p.afinidad >= 2 ? 'brillo' : 'reposo');

// ───────────────────────── lo común de la partida ─────────────────────────

/** El visor del Mazo: las cartas por palo. Con `elegir`, cada carta es un botón (purgar, templar). */
/** El candado de un Tesoro (lo mismo que cobra el Botín: el precio de la balanza con los descuentos del Altar y el Chamuyo). */
const precioTesoro = (p: Partida): number => Math.max(1, Math.round(B.tesoros.precio * (1 - (p.altar.descuento ?? 0) * B.altar.descuento) * (tieneAumento(p, 'chamuyo') ? 1 - B.aumentos.chamuyo : 1)));

export function modalMazo(p: Partida, titulo: string, elegir?: (id: string) => void, cartas: readonly Carta[] = p.mazo, cualquiera = false): void {
  const cara = (c: Carta): string => pxNaipe(c) + (c.temple ? `<span class="c-temple">+${c.temple}${c.templada ? '★' : ''}${c.brava ? ' ×2' : ''}</span>` : '');
  const grupos = (['S', 'C', 'D', 'H', 'X'] as const).map((s) => ordenar(cartas.filter((c) => c.palo === s))).filter((g) => g.length);
  const html = `<div class="panel visor">
    <header class="cabecera"><h2 class="titulo">${esc(titulo)}</h2><button class="btn marco chico" data-accion="cerrar" data-inicio>${t('cerrar')}</button></header>
    <div class="visor-cartas">${grupos
      .map(
        (g) =>
          `<div class="visor-fila">${g
            .map((c) => (elegir ? `<button class="visor-carta" data-accion="carta" data-id="${c.id}" ${cualquiera || juego.purgable(p, c.id) ? '' : 'disabled'}>${cara(c)}</button>` : `<span class="visor-carta">${cara(c)}</span>`))
            .join('')}</div>`,
      )
      .join('')}</div>
    ${elegir && p.mazo.length <= B.jugador.mazoMin ? `<p class="sub">${t('mazoMinimo')}</p>` : ''}
  </div>`;
  abrirModal(html, {
    cerrar: () => cerrarModal(),
    carta: (el) => {
      cerrarModal();
      elegir?.(el.dataset.id!);
    },
  });
}

/** «LO QUE LLEVÁS»: cada Amuleto, Cábala, carga y Bendición con su texto entero (la tira del HUD es su resumen). */
export function modalPiezas(p: Partida): void {
  const fila = (icono: string, nombre: string, clase: string, desc: string, marco = ''): string =>
    `<li class="pieza-fila" tabindex="0"><span class="pieza-icono${marco ? ` marco ${marco}` : ''}">${icono}</span><div class="pieza-texto"><b>${esc(nombre)}</b><span class="sub">${esc(clase)}</span><p>${conMaldicion(desc)}</p></div></li>`;
  const vacio = `<li class="pieza-fila vacia"><p class="sub">${t('nada')}</p></li>`;
  // (0.23) el Amuleto que evolucionó se lee como lo que es ahora: su forma despierta, su nombre y su regla nueva
  const amuletos = p.amuletos.map((id) =>
    esEvolucionable(id) && evoluciono(p, id)
      ? fila(pxEvolucion(id), tx(EVOLUCION[id].nombre), t('evolucionDe', { a: tx(AMULETO[id].nombre) }), tx(EVOLUCION[id].desc), 'prisma')
      : fila(pxAmuleto(id), tx(AMULETO[id].nombre), tx(RAREZA_NOMBRE[AMULETO[id].rareza]), tx(AMULETO[id].desc)),
  );
  const aumentos = p.aumentos.map((id) => fila(pxAumento(id), tx(AUMENTO[id].nombre), AUMENTO[id].maldicion ? t('maldicion') : t('unaCabala'), tx(AUMENTO[id].desc), fichaDe('aumento', id).marco));
  const cargas = PALOS.filter((s) => sirveA(p, s)).map((s) => fila(pxPalo(s), cargaQue(p, s), tx(REY_DEF[s].apodo), tx(REY_DEF[s].cargaDa)));
  const bendiciones = (Object.keys(p.bendiciones) as BendicionId[]).map((id) => {
    const d = BENDICION[id];
    const n = p.bendiciones[id] ?? 1;
    return fila(pxBendicion(id), tx(d.nombre), `${tx(REY_DEF[d.rey].apodo)}${d.dual ? ` + ${tx(REY_DEF[d.dual].apodo)}` : ''}${d.niveles > 1 ? ` · ${t('nivel', { n })}` : ''}`, tx(d.desc(n)));
  });
  const bloque = (titulo: string, filas: string[]): string => `<h3 class="rotulo">${esc(titulo)}</h3><ul class="pieza-lista">${filas.length ? filas.join('') : vacio}</ul>`;
  const velo = abrirModal(
    `<div class="panel piezas">
      <header class="cabecera"><h2 class="titulo">${t('llevas')}</h2><button class="btn marco chico" data-accion="cerrar" data-inicio>${t('cerrar')}</button></header>
      <div class="piezas-cuerpo rollo">
        ${bloque(`${t('amuletos')} · ${t('avance', { a: p.amuletos.length, b: p.huecos })}`, amuletos)}
        ${bloque(t('cabalaNueva'), aumentos)}
        ${bloque(`${t('bendiciones')} · ${t('cargas')}`, [...cargas, ...bendiciones])}
      </div>
    </div>`,
    { cerrar: () => cerrarModal() },
  );
  avisarRollo(velo);
}

/**
 * La lista que no entra entera avisa que sigue: mientras quede algo debajo, su panel lleva `hay-mas` (una flecha al
 * pie y el último renglón que se esfuma). Con la cruceta se baja de pieza en pieza; con la palanca derecha, de corrido.
 */
function avisarRollo(velo: HTMLElement): void {
  const rollo = velo.querySelector<HTMLElement>('.rollo');
  const panel = velo.querySelector<HTMLElement>('.panel');
  if (!rollo || !panel) return;
  const mirar = (): void => void panel.classList.toggle('hay-mas', rollo.scrollHeight - rollo.scrollTop - rollo.clientHeight > 8);
  rollo.addEventListener('scroll', mirar, { passive: true });
  mirar();
  requestAnimationFrame(mirar);
}

/** Las palabras del juego, en una línea cada una (el glosario de JUGADAS y la ayuda de la mesa). Los números salen del motor. */
export type EntradaGlosario = 'multi' | 'furia' | 'escudo' | 'exacto' | 'alpelo' | 'racha' | 'segunda' | 'engano' | 'medio' | 'chispa' | 'escalon' | 'chiches' | 'mano' | 'cantos' | 'paloypalo' | 'filodorado' | 'taba';
export function textoGlosario(e: EntradaGlosario): string {
  switch (e) {
    case 'multi':
      return t('gMulti');
    case 'furia':
      return t('gFuria', { m: B.furia.mazoAgotado, r: B.furia.reyPorTurno });
    case 'escudo':
      return t('gEscudo');
    case 'exacto':
      return t('gExacto', { o: B.exacto.oro });
    case 'alpelo':
      // (0.29: si el motor ya lo paga —`oroAlPelo`—, el glosario lo dice)
      return (B.exacto as { oroAlPelo?: number }).oroAlPelo ? t('gAlPeloOro', { p: Math.round(B.exacto.alPelo * 100), o: (B.exacto as { oroAlPelo?: number }).oroAlPelo ?? 0 }) : t('gAlPelo', { p: Math.round(B.exacto.alPelo * 100) });
    case 'racha':
      return t('gRacha', { lista: Array.from({ length: B.exacto.rachaTope }, (_, i) => `+${(i + 1) * B.exacto.multi}`).join(', ') });
    case 'segunda':
      return t('gSegunda');
    case 'engano':
      return t('gEngano', { n: B.mazos.mentiroso.enganos, f: B.mazos.mentiroso.furiaFallo });
    // las Postas del paño (0.21): la mesa las acomoda sola; LB/RB (Q/W) o arrastrar las corre
    case 'medio':
    case 'chispa':
    case 'escalon':
      return tx(PASO_AYUDA[`posta:${e}`]);
    // (0.22) los Chiches y las palabras del desglose que no se entienden solas (también con el mando: JUGADAS las trae)
    case 'chiches':
      return t('gChiches');
    case 'mano':
    case 'cantos':
      return tx(PASO_AYUDA[e]);
    case 'paloypalo':
    case 'filodorado':
      return fichaDe('bendicion', e).desc;
    case 'taba':
      return fichaDe('amuleto', e).desc;
  }
}
const GLOSARIO: readonly { e: EntradaGlosario; nombre: () => string }[] = [
  { e: 'multi', nombre: () => t('multi') },
  { e: 'furia', nombre: () => t('furia') },
  { e: 'escudo', nombre: () => t('escudo') },
  { e: 'exacto', nombre: () => t('golpeExacto') },
  { e: 'alpelo', nombre: () => t('alPelo') },
  { e: 'racha', nombre: () => t('racha', { n: B.exacto.rachaTope }).replace(/\s*×\d+$/, '') },
  { e: 'segunda', nombre: () => t('segundaCara') },
  { e: 'engano', nombre: () => t('engano') },
  { e: 'medio', nombre: () => tx(PASO_NOMBRE['posta:medio']) },
  { e: 'chispa', nombre: () => tx(PASO_NOMBRE['posta:chispa']) },
  { e: 'escalon', nombre: () => tx(PASO_NOMBRE['posta:escalon']) },
  { e: 'chiches', nombre: () => t('chiches') },
  { e: 'mano', nombre: () => tx(PASO_NOMBRE.mano) },
  { e: 'cantos', nombre: () => tx(PASO_NOMBRE.cantos) },
  { e: 'paloypalo', nombre: () => fichaDe('bendicion', 'paloypalo').nombre },
  { e: 'filodorado', nombre: () => fichaDe('bendicion', 'filodorado').nombre },
  { e: 'taba', nombre: () => fichaDe('amuleto', 'taba').nombre },
];

/**
 * Lo que el canto del Mazo le agrega a una jugada propia, tal como lo aplica el motor (combate.ts): la Escoba
 * multiplica el Multi al sumar 15, el Chancho al hacer Póker, el Truco suma Daño con el Envido.
 */
function cantoDe(p: Partida, j: Jugada): { d?: number; x?: number } {
  const mz = B.mazos;
  if (p.mazoId === 'escoba' && j === 'quince') return { x: mz.escoba.multi };
  if (p.mazoId === 'chancho' && j === 'poker') return { x: mz.chancho.multi };
  if (p.mazoId === 'truco' && j === 'envido') return { d: mz.truco.envido };
  return {};
}

/** La tabla de JUGADAS: lo que vale cada una, lo que hace cada palo, las reglas que más se preguntan y el glosario. */
export function modalJugadas(p: Partida, actual?: Jugada | null): void {
  const propias: Jugada[] = p.mazoId === 'escoba' ? ['quince'] : p.mazoId === 'truco' ? ['envido'] : [];
  const PIDE: Record<Jugada, number> = { sola: 1, par: 2, doblepar: 4, flor: 3, pierna: 3, escalera: 3, full: 5, escalerapalo: 3, poker: 4, quince: 2, envido: 2 };
  const canto = tx(MAZO[p.mazoId].canto);
  // primero las de tu Mazo (su canto arriba de todo) y las que entran en tu mano; las que piden más cartas, plegadas.
  // Las cifras son las del motor (B.jugadas) y, si la jugada canta, lo que el canto le agrega
  const fila = (j: Jugada): string => {
    const c = cantoDe(p, j);
    const extra = !c.x && c.d ? t('danoAlCantar', { d: c.d, c: canto }) : '';
    // si el canto multiplica (Escoba, Chancho), las columnas de Daño y Multi dicen eso en vez de un «+0 ×1» que confunde
    const cifras = c.x
      ? `<td class="n j-canto-celda" colspan="2"><span class="j-canto" aria-label="${esc(t('alCantar', { x: c.x, c: canto }))}"><span class="jc-par">${esc(t('alCantarX', { x: c.x }))}</span> <span class="jc-par">${esc(t('alCantarC', { c: canto }))}</span></span></td>`
      : `<td class="n">${cifra(`+${B.jugadas[j].d}`, 'roja')}</td><td class="n">${cifra(`x${B.jugadas[j].m}`, 'azul')}</td>`;
    return `<tr class="${j === actual ? 'actual' : ''} ${propias.includes(j) ? 'propia' : ''}"><th scope="row">${esc(tx(JUGADA_NOMBRE[j]))}</th><td>${esc(tx(JUGADA_COMO[j]))}${extra ? `<span class="j-canto">${esc(extra)}</span>` : ''}</td>${cifras}</tr>`;
  };
  const glosario = GLOSARIO.map((g) => `<div class="glosa"><dt>${esc(g.nombre())}</dt><dd>${esc(textoGlosario(g.e))}</dd></div>`).join('');
  const todas = [...propias, ...JUGADAS];
  const cerca = todas.filter((j) => PIDE[j] <= p.manoMax);
  const lejos = todas.filter((j) => PIDE[j] > p.manoMax);
  const hayLejos = lejos.length > 0;
  const filas = cerca.map(fila).join('');
  const mz = MAZO[p.mazoId];
  const palos = PALOS.map((s) => `<li>${pxPalo(s)}<b>${esc(tx(PALO_NOMBRE[s]))}</b><span>${esc(tx(PALO_PODER[s]))}</span></li>`).join('');
  const velo = abrirModal(
    `<div class="panel jugadas">
      <header class="cabecera"><h2 class="titulo">${t('jugadas')}</h2><button class="btn marco chico" data-accion="cerrar" data-inicio>${t('cerrar')}</button></header>
      <div class="jugadas-cuerpo rollo">
        <div class="jugadas-principal"><table class="jugadas-tabla">
          <thead><tr><th scope="col">${t('jugada')}</th><th scope="col">${t('cartas')}</th><th scope="col" class="n">${t('dano')}</th><th scope="col" class="n">${t('multi')}</th></tr></thead>
          <caption class="jugadas-canto"><span class="rotulo">${t('tuCanto')}</span><b class="chip canto">${esc(tx(mz.canto))}</b><span>${esc(tx(mz.regla))}</span></caption>
          <tbody>${filas}</tbody>
          ${hayLejos ? `<tbody class="lejos" data-lejos hidden>${lejos.map(fila).join('')}</tbody>` : ''}
        </table>
        ${hayLejos ? `<p class="sub jugadas-pie">${t('manoDe', { n: p.manoMax })} <button class="btn marco chico" data-accion="ver-lejos" data-foco="ver-lejos">${t('verLejos', { n: lejos.length })}</button></p>` : ''}
        </div>
        <div class="jugadas-lado">
          <h3 class="rotulo">${t('palos')}</h3>
          <ul class="palos-lista">${palos}</ul>
          <p class="regla">${esc(t('inmuneRegla'))}</p>
          <p class="regla">${esc(t('comodinRegla'))}</p>
          <h3 class="rotulo">${t('glosario')}</h3>
          <dl class="glosario">${glosario}</dl>
        </div>
      </div>
    </div>`,
    {
      cerrar: () => cerrarModal(),
      'ver-lejos': (el) => {
        const tb = $('[data-lejos]');
        if (tb) tb.hidden = false;
        const lista = el.closest('.rollo');
        el.closest('p')?.remove();
        lista?.dispatchEvent(new Event('scroll'));
      },
    },
  );
  avisarRollo(velo);
}

/** El menú de la partida: guardar y salir, o rendirse. */
export function modalMenu(p: Partida): void {
  abrirModal(
    `<div class="panel menu-partida">
      <h2 class="titulo">${t('menu')}</h2>
      <p class="sub">${esc(tx(MAZO[p.mazoId].nombre))} · ${t('reinado', { n: p.reinado })} · ${t('semilla', { s: p.semilla })}</p>
      <button class="btn marco oro" data-accion="cerrar" data-inicio>${t('seguir')}</button>
      <button class="btn marco" data-accion="salir">${t('salirPortada')}</button>
      <button class="btn marco" data-accion="rendirse">${t('rendirse')}</button>
    </div>`,
    {
      cerrar: () => cerrarModal(),
      salir: () => {
        guardar();
        cerrarModal();
        sesion.partida = null;
        irPortada();
      },
      rendirse: () => {
        abrirModal(
          `<div class="panel"><p>${t('rendirseSeguro')}</p><div class="fila"><button class="btn marco" data-accion="no" data-inicio>${t('no')}</button><button class="btn marco oro" data-accion="si">${t('si')}</button></div></div>`,
          {
            no: () => cerrarModal(),
            si: () => {
              juego.rendirse(p);
              cerrarModal();
              avanzar();
            },
          },
        );
      },
    },
  );
}

/** Las acciones del HUD y del menú, comunes a todas las pantallas de la partida. */
export const accionesComunes = (p: Partida): Record<string, Accion> => ({
  'ver-mazo': () => modalMazo(p, `${t('mazo')} · ${p.mazo.length}`),
  'ver-piezas': () => modalPiezas(p),
  menu: () => modalMenu(p),
});

const botonMenu = (): string => `<button class="btn marco chico" data-accion="menu" data-foco="menu" aria-label="${t('menu')}"><span class="b-menu-signo" aria-hidden="true">≡</span> ${t('menu')}</button>`;

// ───────────────────────── el Mapa ─────────────────────────

export function pantallaMapa(p: Partida): Pantalla {
  const tramo = juego.tramoActual(p);
  const abiertos = juego.nodosAlcanzables(p).map((n) => n.id);
  const rey = REY_DEF[tramo.rey];
  const pisoAca = tramo.nodos.find((n) => n.id === p.pos)?.piso ?? -1;
  const voz = tx(alAzar(VOZ.mapa[humorDe(p.afinidad)], fijo()));
  // el temblor de cada nodo: de costado algo más; de alto, poco (con más, el «ESTÁS ACÁ» quedaba bajo los sellos del nodo de arriba)
  const corrimiento = (id: string): [number, number] => {
    let h = 2166136261;
    for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
    return [(((h >>> 0) % 1000) / 1000 - 0.5) * 0.16, (((h >>> 10) % 1000) / 1000 - 0.5) * 0.1];
  };
  const lugar = (n: Nodo): [number, number] => {
    const [dx, dy] = n.tipo === 'rey' ? [0, 0] : corrimiento(n.id);
    return [(n.col + 0.5 + dx) / COLUMNAS, (PISOS + 0.5 - n.piso + dy) / (PISOS + 1)];
  };
  const nodo = (n: Nodo): string => {
    const [nx, ny] = lugar(n);
    // (0.24: el que quedó atrás sin pisarse —en un piso ya pasado— es «pasado»: como el recorrido, ya no se toca)
    const estado = n.id === p.pos ? 'actual' : p.camino.includes(n.id) ? 'hecho' : abiertos.includes(n.id) ? 'abierto' : n.piso <= pisoAca ? 'lejos pasado' : 'lejos';
    const inmune = n.palos?.length ? t('inmuneA', { palo: n.palos.map((s) => tx(PALO_NOMBRE[s])).join(', ') }) : '';
    const nombre = n.tipo === 'rey' ? `${tx(rey.nombre)} · ${tx(rey.apodo)}` : tx(NODO_NOMBRE[n.tipo]);
    const desc = n.tipo === 'rey' ? `${tx(rey.rasgo)}: ${tx(rey.rasgoDesc)}` : tx(NODO_DESC[n.tipo]);
    // (0.22) el Tesoro a la vista: un cofre sobre el nodo, con su candado (o la Élite que lo cuida) en la ayuda
    const tesoro = n.tesoro ? `${t('tesoro')}: ${n.tesoro === 'oro' ? t('tesoroCandado', { n: precioTesoro(p) }) : t('tesoroElite')}` : '';
    const pie = [inmune, tesoro].filter(Boolean).join(' · ');
    return `<button class="nodo n-${n.tipo} ${estado} ${n.tesoro ? 'con-tesoro' : ''}" style="left:${(nx * 100).toFixed(2)}%;top:${(ny * 100).toFixed(2)}%" data-accion="nodo" data-id="${n.id}" data-foco="nodo-${n.id}" ${estado === 'abierto' ? '' : 'aria-disabled="true"'} ${abiertos[0] === n.id ? 'data-inicio' : ''} aria-label="${esc(tesoro ? `${nombre} · ${tesoro}` : nombre)}" ${tip(nombre, desc, pie)}${n.palos?.length ? ` data-tip-palos="${n.palos.join('')}"` : ''}>
      ${pxNodo(n.tipo)}
      ${n.palos?.length ? `<span class="nodo-palos">${n.palos.map((s) => pxInmune(s)).join('')}</span>` : ''}
      ${estado === 'actual' ? `<span class="nodo-aca chip">${t('vosAca')}</span>` : ''}
      ${n.tesoro && estado !== 'hecho' ? `<span class="nodo-tesoro t-${n.tesoro}" aria-hidden="true">${pxHud('cofre')}</span>` : ''}
    </button>`;
  };
  // los caminos: de cada nodo a los que siguen, piso arriba
  const lineas = (): string => {
    const trazos = tramo.nodos.flatMap((a) =>
      a.sig.map((id) => {
        const b = tramo.nodos.find((x) => x.id === id)!;
        const [x1, y1] = lugar(a);
        const [x2, y2] = lugar(b);
        const hecho = p.camino.includes(a.id) && p.camino.includes(b.id);
        const vivo = a.id === p.pos && abiertos.includes(b.id);
        return `<line x1="${(x1 * 1000).toFixed(0)}" y1="${(y1 * 1000).toFixed(0)}" x2="${(x2 * 1000).toFixed(0)}" y2="${(y2 * 1000).toFixed(0)}" pathLength="100" style="--fila:${Math.round((1 - Math.max(y1, y2)) * 10)}" class="${hecho ? 'hecho' : vivo ? 'vivo' : ''}"/>`;
      }),
    );
    return `<svg class="mapa-lineas" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">${trazos.join('')}</svg>`;
  };
  let andando = false;
  return {
    nombre: 'mapa',
    html: () => `<main class="pantalla en-partida mapa">
      <header class="cabecera">
        <div class="lado"><h1 class="titulo">${esc(tx(TRAMO_NOMBRE[Math.min(2, p.acto)]))}</h1><span class="sub">${t('tramo', { n: p.acto + 1 })}</span></div>
        <div class="lado"><span class="sub mapa-espera">${t('esperaRey', { rey: tx(rey.apodo) })}</span>${botonMenu()}</div>
      </header>
      <div class="mapa-zona">
        <div class="mapa-rollo" data-rollo><div class="mapa-lienzo" style="--pisos:${PISOS + 1}">${lineas()}${tramo.nodos.map(nodo).join('')}</div></div>
        ${anfitrion(voz, expresionDe(p), 'mapa-bufon')}
      </div>
      ${hudHtml(p)}
    </main>`,
    alMontar: (raiz) => {
      avivarRetrato(p);
      // el Mapa se desplaza: que arranque mostrando dónde estás
      // (se sube desde abajo: al entrar a un tramo se ve el pie del Mapa)
      ($('.nodo.abierto', raiz) ?? $('.nodo.actual', raiz))?.scrollIntoView({ block: 'center', inline: 'center' });
    },
    acciones: {
      ...accionesComunes(p),
      nodo: async (el) => {
        const id = el.dataset.id!;
        if (andando || !abiertos.includes(id)) return;
        andando = true;
        const n = tramo.nodos.find((x) => x.id === id)!;
        if (n.tipo === 'rey') ver(perfil, `r:${tramo.rey}`);
        sonar(n.tipo === 'rey' ? 'rey' : 'paso');
        // el paso: el nodo elegido late y los demás se apagan
        el.classList.add('pisado');
        el.closest('.mapa-lienzo')?.classList.add('andando');
        await pausa(280);
        juego.elegirNodo(p, id);
        avanzar();
      },
    },
  };
}

// ───────────────────────── Botín y «ELEGÍ UNA» ─────────────────────────

const TITULO_OFERTA = { bendicion: 'elegiBendicion', amuleto: 'elegiAmuleto', aumento: 'elegiCabala' } as const;
const NOMBRE_OFERTA = { bendicion: 'bendicionDe', amuleto: 'amuletoNuevo', aumento: 'cabalaNueva' } as const;

/** El modal gigante «ELEGÍ UNA»: tres opciones (con su etiqueta de sinergia, si la hay) y Saltar. */
/** El cuerpo de «ELEGÍ UNA» (lo usa el modal y también el precalentado de la GPU). */
function ofertaHtml(p: Partida, oferta: Oferta, fraseRey: string): string {
  const reyes = oferta.tipo === 'bendicion' ? oferta.opciones.map((id) => BENDICION[id as BendicionId].rey) : [];
  const habla = reyes[0];
  const cabeza =
    oferta.tipo === 'bendicion' && habla
      ? `<p class="bocadillo sin-cola oferta-voz"><b>${esc(tx(REY_DEF[habla].apodo))}:</b> <span data-teclea>${esc(fraseRey)}</span></p>`
      : oferta.tipo === 'aumento'
        ? `<div class="oferta-bufon" data-anfitrion>${bufonHtml('brillo')}<p class="bocadillo" data-voz>${esc(tx(alAzar(VOZ.cabala, fijo())))}</p></div>`
        : '';
  // (0.22) el Tesoro: un cofre con candado de oro (si no te alcanza, sus opciones quedan apagadas y lo dice)
  const precio = oferta.precio ?? 0;
  const alcanza = p.oro >= precio;
  // (la cifra del candado se lee siempre a 7:1: oro si te alcanza, hueso si no; el rojo lo pone «Te faltan»)
  const candado = precio ? `<span class="op-cerrojo"><span class="precio op-candado ${alcanza ? '' : 'falta'}">${pxHud('candado')}${cifra(precio, alcanza ? 'oro' : 'hueso', 'grande')}</span></span>` : '';
  // (0.23) DEJAR EL COFRE va arriba, en el renglón del cofre (abajo caía sobre el HUD)
  const saltarHtml = `<button class="btn marco chico" data-accion="saltar" data-foco="saltar" ${alcanza ? '' : 'data-inicio'}>${precio ? t('saltarCofre') : t('saltar', { n: B.botin.saltar })}</button>`;
  const opcion = (id: string, i: number): string => {
    const f = fichaDe(oferta.tipo, id, p);
    const rey = oferta.tipo === 'bendicion' ? BENDICION[id as BendicionId].rey : null;
    return `<button class="opcion marco ${f.marco}" data-accion="elegir" data-id="${id}" data-foco="op-${i}" ${i === 0 && alcanza ? 'data-inicio' : ''} ${alcanza ? '' : 'disabled'}>
      <span class="op-arte">${rey ? reyHtml(rey, 'calma') : ''}<span class="op-icono">${pxPieza(oferta.tipo, id)}</span></span>
      <span class="op-clase rotulo">${esc(f.clase)}</span>
      <b class="op-nombre">${esc(f.nombre)}</b>
      <span class="op-desc">${esc(f.desc)}</span>
      <span class="op-sinergia">${sinergiaHtml(oferta.tipo, id, p)}</span>
      ${candado}
    </button>`;
  };
  return `<div class="oferta o-${oferta.tipo} ${oferta.tesoro ? 'o-tesoro' : ''}" data-oferta="${oferta.tipo}">
      <h2 class="titulo oferta-titulo">${t(TITULO_OFERTA[oferta.tipo])}</h2>
      ${oferta.tesoro ? `<p class="oferta-tesoro">${pxHud('cofre')}<b>${t('tesoro')}</b>${precio ? `<span class="sub">${t('tesoroCandado', { n: precio })}</span>` : ''}${alcanza ? '' : `<span class="op-falta">${t('tesoroFalta', { n: precio - p.oro })}</span>`}${saltarHtml}</p>` : ''}
      ${cabeza}
      <div class="opciones">${oferta.opciones.map(opcion).join('')}</div>
      ${oferta.tesoro ? '' : saltarHtml}
    </div><b class="oferta-hay-mas" aria-hidden="true">${t('hayMas')}</b>`;
}

/**
 * Precalentado: la primera vez que la GPU pinta «ELEGÍ UNA» compila sus sombreadores y cuesta un cuadro de más de
 * 100 ms, justo cuando llega el premio. Al entrar a la mesa (bajo la cortina) se pinta una vez, casi invisible, una
 * oferta de cada tipo; después el modal de verdad brota sin tirón.
 */
let ofertasCalientes = false;
export function calentarOfertas(p: Partida): void {
  if (ofertasCalientes || quieto()) return;
  ofertasCalientes = true;
  // unas pocas de cada tipo, repartidas por la lista: así entran todos los marcos (rarezas, niveles y los cuatro Reyes)
  const repartidas = (l: readonly string[]): string[] => [0, 1, 2, 3].map((i) => l[Math.floor((i * (l.length - 1)) / 3)]);
  const muestras: Oferta[] = [
    { tipo: 'bendicion', opciones: repartidas(BENDICIONES) },
    { tipo: 'amuleto', opciones: repartidas(AMULETOS) },
    { tipo: 'aumento', opciones: repartidas(AUMENTOS) },
  ];
  const el = document.createElement('div');
  el.className = 'calienta';
  el.setAttribute('aria-hidden', 'true');
  el.inert = true;
  el.innerHTML = muestras.map((o) => `<div class="velo-c recien">${ofertaHtml(p, o, '…').replaceAll('data-foco=', 'data-x=').replaceAll('data-accion=', 'data-y=').replaceAll('data-inicio', '')}</div>`).join('');
  // y lo que el golpe estrena: los fogonazos, el nombre que sube, la ficha que dispara y el naipe que salta (con su
  // índice y su sello de Templada: rasterizar esa letra escalada y con brillo la primera vez costaba ~150 ms)
  el.insertAdjacentHTML('beforeend', '<i class="fogonazo f-oro"></i><i class="fogonazo f-blanco"></i><b class="c-vuela v-x">×2</b><b class="c-vuela v-d">+1</b><span class="hud"><span class="ficha dispara" style="display:inline-block;width:40px;height:40px;background:#555"></span></span><div class="carta cuenta-pop" style="position:absolute;left:0;top:0;width:60px;height:90px;background:#ccc"><span class="c-indice" data-palo="D">9</span><span class="c-temple">+8★</span></div>');
  // (0.22) y el sello del Bufón (Cara de Póker, Seña Falsa) que estalla girado y a 1,7×: su primera vez costaba ~105 ms
  // en frío; de paso, el jackpot de una Evolución y el grito de la Forja Brava
  const au = p.aumentos[0] ?? AUMENTOS[0];
  el.insertAdjacentHTML(
    'beforeend',
    `<div class="sello-bufon" style="left:50%;top:40%">${pxAumento(au, 'sb-i')}<span class="sb-txt"><b class="rotulo">${esc(fichaDe('aumento', au).nombre)}</b><span class="sb-extra">${esc(t('forjaBrava'))}</span></span></div><b class="forja-grito rotulo" style="left:50%;top:70%">${t('forjaBrava')}</b>`,
  );
  $('#capa')?.append(el);
  el.querySelectorAll('.opcion').forEach((b, i) => b.classList.toggle('caliente-foco', i % 2 === 0));
  setTimeout(() => el.remove(), 900);
}

/**
 * (0.24) La oferta se centra en lo que queda libre sobre el HUD (que sigue a la vista debajo del velo): ni los naipes
 * ni SALTAR lo pisan (en el teléfono, lo que no entra se desliza dentro del velo).
 */
function reservarHud(velo: HTMLElement): void {
  const hud = $('#app .hud');
  if (!hud) return;
  const r = hud.getBoundingClientRect();
  if (r.height === 0 || r.top >= innerHeight) return;
  velo.classList.add('sobre-hud');
  const reserva = `${Math.round(innerHeight - r.top + 6)}px`;
  // (en el teléfono el velo entero termina sobre el HUD: así lo que no entra se desliza ahí adentro y no por encima)
  if (innerWidth <= 700) velo.style.bottom = reserva;
  else velo.style.paddingBottom = reserva;
}

function modalOferta(p: Partida, indice: number, alTerminar: () => void): void {
  const item = p.botin!.items[indice] as Extract<ItemBotin, { t: 'oferta' }>;
  const oferta: Oferta = item.oferta;
  for (const id of oferta.opciones) ver(perfil, clavePieza(oferta.tipo, id));
  const reyes = oferta.tipo === 'bendicion' ? oferta.opciones.map((id) => BENDICION[id as BendicionId].rey) : [];
  for (const r of reyes) ver(perfil, `r:${r}`);
  const habla = reyes[0];
  const fraseRey = habla ? tx(alAzar(REY_DEF[habla].voz.ofrece, fijo())) : '';
  // la elección reemplaza al panel del botín (no se monta encima con el panel fantasma detrás)
  $('#app main.botin')?.classList.add('eligiendo');
  const velo = abrirModal(
    ofertaHtml(p, oferta, fraseRey),
    {
      elegir: (el) => {
        const id = el.dataset.id!;
        const tomar = (reemplaza?: AmuletoId) => {
          // (0.22) si la pieza despierta una Evolución, salta el jackpot (cualquier entrada lo corta)
          const fiesta = vigilarEvoluciones(p);
          if (!juego.elegirOferta(p, indice, id, reemplaza)) return;
          sonar(oferta.tipo === 'bendicion' ? 'canto' : 'oro');
          cerrarModal();
          alTerminar();
          bufonDice(tx(alAzar(VOZ.elige)));
          void fiesta();
        };
        if (oferta.tipo === 'amuleto' && p.amuletos.length >= p.huecos) modalReemplazo(p, id as AmuletoId, tomar, () => modalOferta(p, indice, alTerminar));
        else tomar();
      },
      saltar: () => {
        juego.elegirOferta(p, indice, null);
        sonar('clic');
        cerrarModal();
        alTerminar();
        bufonDice(tx(alAzar(VOZ.salta)));
      },
    },
    // B: primero lleva el foco a SALTAR (con su glifo B); otro B lo pulsa
    () => void irASalida($('#capa .velo')),
  );
  // (0.20) desde el Botín no hay velo negro: el Botín queda atenuado detrás y la pieza elegida se despliega en las
  // tres cartas (cada una sale del lugar de la pieza y vuela al suyo)
  const pieza = $(`#app main.botin:not(.directo) [data-accion="abrir"][data-i="${indice}"]`)?.closest<HTMLElement>('.botin-fila');
  if (pieza) {
    velo.classList.add('sobre-botin');
    // (el Bufón del Botín pasa entero al costado de las cartas, por encima del velo: es quien te las ofrece)
    velo.insertAdjacentHTML('afterbegin', `<div class="oferta-bufon-lado" aria-hidden="true">${bufonHtml('brillo')}</div>`);
    const d = pieza.getBoundingClientRect();
    if (!quieto())
      for (const o of velo.querySelectorAll<HTMLElement>('.opciones > .opcion')) {
        const r = o.getBoundingClientRect();
        o.style.setProperty('--dx', `${Math.round(d.left + d.width / 2 - (r.left + r.width / 2))}px`);
        o.style.setProperty('--dy', `${Math.round(d.top + d.height / 2 - (r.top + r.height / 2))}px`);
      }
  }
  reservarHud(velo);
  // (0.27) en el teléfono, si la tercera opción queda bajo el HUD, la oferta lo avisa («hay más ↓», como la Pulpería)
  const mirar = (): void => void velo.classList.toggle('hay-mas', velo.scrollHeight - velo.scrollTop - velo.clientHeight > 2);
  velo.addEventListener('scroll', mirar, { passive: true });
  mirar();
  requestAnimationFrame(mirar);
  if (oferta.tipo === 'bendicion' && habla && !quieto()) teclear($('[data-teclea]', velo), fraseRey, habla);
  // la irrupción del Rey que habla: su aura se abre desde el retrato
  if (habla) {
    const r = $('.rey', velo)?.getBoundingClientRect();
    if (r) haloRey(r.left + r.width / 2, r.top + r.height / 2, { S: '#00c8ff', C: '#22d95b', D: '#ffd500', H: '#ff1453' }[habla], r.width);
  }
}

/** Con los huecos llenos: cuál Amuleto se suelta para colgar el nuevo. */
export function modalReemplazo(p: Partida, nuevo: AmuletoId, tomar: (reemplaza: AmuletoId) => void, volver: () => void): void {
  const f = fichaDe('amuleto', nuevo, p);
  abrirModal(
    `<div class="panel reemplazo">
      <h2 class="titulo">${t('reemplaza')}</h2>
      <p class="sub">${pxAmuleto(nuevo)} ${esc(f.nombre)}: ${esc(f.desc)}</p>
      <div class="opciones chicas">${p.amuletos
        .map((id, i) => {
          const g = fichaDe('amuleto', id, p);
          return `<button class="opcion marco ${g.marco}" data-accion="soltar" data-id="${id}" ${i === 0 ? 'data-inicio' : ''}><span class="op-icono">${pxAmuleto(id)}</span><b class="op-nombre">${esc(g.nombre)}</b><span class="op-desc">${esc(g.desc)}</span></button>`;
        })
        .join('')}</div>
      <button class="btn marco chico" data-accion="volver">${t('volver')}</button>
    </div>`,
    {
      soltar: (el) => tomar(el.dataset.id as AmuletoId),
      volver: () => volver(),
    },
    volver,
  );
}

/**
 * El botín. `desdeMesa`: viene de un combate recién ganado y brota sobre la misma mesa (la mesa ya se despejó y el
 * oro ya voló al HUD contando): el panel entra al centro, opaco, y la primera elección lo reemplaza.
 */
export function pantallaBotin(p: Partida, desdeMesa = false): Pantalla {
  const botin = p.botin!;
  const directo = botin.de === 'inicio' || botin.de === 'cabala';
  const pendiente = () => botin.items.findIndex((i) => i.t === 'oferta' && !i.hecho);
  const cerrarBotin = () => {
    juego.seguir(p);
    avanzar();
  };
  // elegida la última oferta, la partida sigue sola: nada de volver a una lista para tocar «SEGUIR»
  const trasElegir = () => {
    guardar();
    if (pendiente() < 0) cerrarBotin();
    else if (directo || !quieto() || RAPIDO) modalOferta(p, pendiente(), trasElegir);
    else repintar();
  };
  // cada cosa del botín es una pieza grande sobre la mesa (la moneda, el corazón, la corona del Rey, el candado del
  // Amuleto, la estrella de la Cábala), a escala de naipe, con su nombre y, debajo, cobrado o ELEGIR
  const fila = (it: ItemBotin, i: number): string => {
    const pieza = (arte: string, nombre: string, pie: string, cls = '') => `<div class="botin-fila bp ${cls}" style="--orden:${i}"><span class="bp-arte">${arte}</span><b class="bp-nombre">${nombre}</b>${pie}</div>`;
    const cobrado = `<span class="bp-cobrado verde" aria-hidden="true">✓</span>`;
    if (it.t === 'oro') return pieza(pxHud('oro'), t('oroMas', { n: it.n }), cobrado, 'hecho oro');
    if (it.t === 'cura') return pieza(pxHud('vida'), t('vidaMas', { n: it.n }), cobrado, 'hecho cura');
    // la Vida máxima que da el Rey vencido: su propio corazón (engastado en oro, con la flecha que sube) y, debajo,
    // chico, por qué
    if (it.t === 'vidamax') return pieza(pxHud('vidamax'), t('vidaMaxMas', { n: it.n }), `<span class="bp-pie">${t('vidaMaxPie')}</span>${cobrado}`, 'hecho cura vidamax');
    const icono = it.oferta.tesoro ? pxHud('cofre') : it.oferta.tipo === 'bendicion' ? pxNodo('rey') : it.oferta.tipo === 'amuleto' ? pxHud('candado') : pxNodo('cabala');
    const precio = it.oferta.precio ?? 0;
    const llave = precio && !it.hecho ? `<span class="bp-precio ${p.oro >= precio ? '' : 'falta'}" ${tip(t('tesoro'), t('tesoroTip'), t('tesoroCandado', { n: precio }))}>${pxHud('candado')}${cifra(precio, p.oro >= precio ? 'oro' : 'hueso', 'grande')}</span>` : '';
    return pieza(
      icono,
      it.oferta.tesoro ? t('tesoro') : t(NOMBRE_OFERTA[it.oferta.tipo]),
      it.hecho ? cobrado : `${llave}<button class="btn marco" data-accion="abrir" data-i="${i}" data-foco="botin-${i}" data-inicio>${t('elegir')}</button>`,
      `${it.hecho ? 'hecho' : 'pendiente'} ${it.oferta.tipo} ${it.oferta.tesoro ? 'tesoro' : ''}`,
    );
  };
  return {
    nombre: directo ? 'elegi-una' : 'botin',
    html: () =>
      directo
        ? `<main class="pantalla en-partida botin directo"><div class="crece"></div>${hudHtml(p)}</main>`
        : `<main class="pantalla en-partida botin ${desdeMesa ? 'desde-mesa' : ''}">
      <div class="cuerpo">
        ${anfitrion(tx(alAzar(VOZ.botin, fijo())), 'risa')}
        <section class="panel botin-panel">
          <h1 class="titulo">${t('botin')}</h1>
          <div class="botin-lista">${botin.items.map(fila).join('')}</div>
          <button class="btn marco ${pendiente() < 0 ? 'oro' : 'hierro'} grande" data-accion="seguir" data-foco="seguir" ${pendiente() < 0 ? 'data-inicio' : ''}>${t(pendiente() < 0 ? 'seguir' : 'seguirSinElegir')}</button>
        </section>
      </div>
      ${hudHtml(p)}
    </main>`,
    alMontar: () => {
      avivarRetrato(p);
      // el grito del Personaje que venía de la mesa se vuelve a ubicar cuando el panel ya brotó (no mientras crece)
      // (en el teléfono, recién cuando terminó de entrar la última pieza: hasta entonces espera escondido)
      if (!directo && !enFoto()) {
        const tel = innerWidth <= 700;
        const g = document.querySelector<HTMLElement>('.hud-grito');
        if (tel && g) {
          g.dataset.espera = '1';
          g.style.visibility = 'hidden';
        }
        window.setTimeout(() => {
          const h = document.querySelector<HTMLElement>('.hud-grito');
          if (h) {
            delete h.dataset.espera;
            h.style.visibility = '';
          }
          reubicarGrito();
        }, tel ? 120 + botin.items.length * 70 + 320 : 380);
      }
      if (directo && pendiente() >= 0) modalOferta(p, pendiente(), trasElegir);
      else if (!directo && !enFoto() && desdeMesa && !quieto()) {
        // recién ganado: el oro ya se cobró en la mesa; el panel brota al centro, muestra lo cobrado un instante y la
        // pieza de la primera elección se despliega en «ELEGÍ UNA» (el Botín queda atenuado detrás, sin velo negro)
        const r = $('.botin-panel')?.getBoundingClientRect();
        if (r) lluviaDeMonedas(r.left, r.right, r.top - 30, 10);
        sonar('brota');
        if (pendiente() >= 0) void pausa(780).then(() => p.botin === botin && pendiente() >= 0 && !$('.velo') && modalOferta(p, pendiente(), trasElegir));
      } else if (!directo && !enFoto()) {
        // el botín pasa sobre la mesa: el oro vuela al HUD y la primera oferta brota sin cambiar de pantalla
        const r = $('.botin-panel')?.getBoundingClientRect();
        const a = $('[data-hud-oro]')?.getBoundingClientRect();
        if (r && a && !quieto() && botin.items.some((i) => i.t === 'oro')) {
          monedas(r.left + r.width / 2, r.top + r.height * 0.3, a.left + a.width / 2, a.top + a.height / 2, 10, () => sonar('oro'));
          lluviaDeMonedas(r.left, r.right, r.top - 40, 12);
        }
        if (pendiente() >= 0) void pausa(420).then(() => p.botin === botin && pendiente() >= 0 && !$('.velo') && modalOferta(p, pendiente(), trasElegir));
      }
    },
    acciones: {
      ...accionesComunes(p),
      // (0.23) el cofre de un Tesoro se abre con su momento: el candado cede (su sonido), la tapa salta y brilla de adentro
      abrir: async (el) => {
        const i = Number(el.dataset.i);
        const it = botin.items[i];
        if (it?.t === 'oferta' && it.oferta.tesoro && p.oro >= (it.oferta.precio ?? 0)) {
          const arte = el.closest('.botin-fila')?.querySelector<HTMLElement>('.bp-arte');
          if (arte && !arte.classList.contains('cofre-abre')) {
            arte.innerHTML = pxHud('cofreAbierto');
            arte.classList.add('cofre-abre');
            sonar('tesoro');
            const r = arte.getBoundingClientRect();
            if (!quieto() && !enFoto()) {
              destello(r.left + r.width / 2, r.top + r.height * 0.4, ['#ffffff', '#fff799', '#ffd500', '#ff7b00'], 26);
              chispas(r.left + r.width / 2, r.top + r.height * 0.35, ['#fff799', '#ffd500', '#ff7b00'], 16, 120, -70);
              await pausa(380);
            }
          }
        }
        modalOferta(p, i, trasElegir);
      },
      seguir: cerrarBotin,
    },
  };
}

// ───────────────────────── la Pulpería ─────────────────────────

export function pantallaPulperia(p: Partida): Pantalla {
  let voz = tx(alAzar(VOZ.pulperia, fijo()));
  let gesto: Expresion = 'risa';
  const decir = (lista: readonly { es: string; en: string }[], e: Expresion) => {
    voz = tx(alAzar(lista, fijo()));
    gesto = e;
  };
  const precio = (n: number, alcanza: boolean) => `<span class="precio">${pxHud('oro')}${cifra(n, alcanza ? 'oro' : 'roja', 'grande')}</span>`;
  /** Los Chiches del mostrador (0.21): se apoyan en la madera de la mesa, a la derecha; entran tres. */
  const chichesHtml = (): string => {
    const venta = p.tienda?.chiches ?? [];
    if (!venta.length) return '';
    const h = huecosChiche(p.chiches);
    const llevas = h.filter(Boolean).length;
    const lleno = llevas >= h.length;
    return `<section class="bandeja marco b-chiches">
            <h2 class="rotulo">${t('chiches')} ${llevas}/${h.length}</h2>
            <div class="ventas">${venta
              .map((k, i) => {
                const d = CHICHE[k.id];
                const no = !!k.vendido || lleno;
                return `<button class="venta opcion marco hierro ${k.vendido ? 'vendida' : ''}" data-accion="llevar" data-i="${i}" data-foco="chiche-${i}" ${no ? 'disabled' : ''}>
                  <span class="op-icono">${pxChiche(k.id)}</span>
                  <b class="op-nombre">${esc(tx(d.nombre))}</b>
                  <span class="op-desc">${esc(lleno && !k.vendido ? t('chicheLleno') : tx(d.desc))}</span>
                  ${k.vendido ? `<span class="chip">${t('vendido')}</span>` : precio(k.precio, p.oro >= k.precio)}
                </button>`;
              })
              .join('')}</div>
          </section>`;
  };
  return {
    nombre: 'pulperia',
    html: () => {
      const tienda = p.tienda!;
      const cura = Math.round(p.vidaMax * B.pulperia.curarPct);
      return `<main class="pantalla en-partida pulperia">
      <header class="cabecera"><h1 class="titulo">${t('pulperia')}</h1><div class="lado"><b class="pul-hay-mas" aria-hidden="true">${t('hayMas')}</b><button class="btn marco oro" data-accion="salir" data-foco="salir">${t('salir')} ›</button></div></header>
      <div class="pul-cuerpo">
        ${anfitrion(voz, gesto, 'pul-bufon')}
        <div class="bandejas">
          <section class="bandeja marco">
            <h2 class="rotulo">${t('amuletos')} ${p.amuletos.length}/${p.huecos}</h2>
            <div class="ventas">${tienda.amuletos
              .map((a, i) => {
                const f = fichaDe('amuleto', a.id, p);
                return `<button class="venta opcion marco ${f.marco} ${a.vendido ? 'vendida' : ''}" data-accion="comprar" data-i="${i}" data-foco="venta-${i}" ${a.vendido ? 'disabled' : ''} ${i === 0 ? 'data-inicio' : ''}>
                  <span class="op-icono">${pxAmuleto(a.id)}</span>
                  <span class="op-clase rotulo">${esc(f.clase)}</span>
                  <b class="op-nombre">${esc(f.nombre)}</b>
                  <span class="op-desc">${esc(f.desc)}</span>
                  <span class="op-sinergia">${sinergiaHtml('amuleto', a.id, p)}</span>
                  ${a.vendido ? `<span class="chip">${t('vendido')}</span>` : precio(a.precio, p.oro >= a.precio)}
                </button>`;
              })
              .join('')}</div>
          </section>
          <div class="bandejas-pie">
          <section class="bandeja marco">
            <h2 class="rotulo">${t('servicios')}</h2>
            <div class="ventas">
              <button class="venta opcion marco hierro" data-accion="purgar" data-foco="purgar" ${p.mazo.length <= B.jugador.mazoMin ? 'disabled' : ''}>
                <span class="op-icono">${pxHud('descarte')}</span><b class="op-nombre">${t('purgar')}</b><span class="op-desc">${t('purgarDesc')}</span>${precio(tienda.purgar, p.oro >= tienda.purgar)}
              </button>
              <button class="venta opcion marco hierro" data-accion="curar" data-foco="curar" ${p.vida >= p.vidaMax ? 'disabled' : ''}>
                <span class="op-icono">${pxHud('vida')}</span><b class="op-nombre">${t('curar')}</b><span class="op-desc">${p.vida >= p.vidaMax ? t('vidaLlena') : t('curarDesc', { n: Math.min(cura, p.vidaMax - p.vida) })}</span>${precio(tienda.curar, p.oro >= tienda.curar)}
              </button>
            </div>
          </section>
          ${chichesHtml()}
          </div>
        </div>
      </div>
      ${hudHtml(p)}
    </main>`;
    },
    alMontar: () => {
      avivarRetrato(p);
      // (0.26) en el teléfono el mostrador se desliza bajo SALIR: mientras quede algo abajo, «hay más ↓» sobre el botón
      const cuerpo = $('.pulperia .pul-cuerpo');
      const main = $('.pulperia');
      if (cuerpo && main) {
        const mirar = (): void => void main.classList.toggle('hay-mas', cuerpo.scrollHeight - cuerpo.scrollTop - cuerpo.clientHeight > 8);
        cuerpo.addEventListener('scroll', mirar, { passive: true });
        mirar();
        requestAnimationFrame(mirar);
      }
    },
    acciones: {
      ...accionesComunes(p),
      comprar: (el) => {
        const i = Number(el.dataset.i);
        const a = p.tienda!.amuletos[i];
        if (p.oro < a.precio) {
          decir(VOZ.sinOro, 'burla');
          sonar('error');
          repintar();
          return;
        }
        const hacer = (reemplaza?: AmuletoId) => {
          const fiesta = vigilarEvoluciones(p);
          if (!juego.comprar(p, i, reemplaza)) return;
          void fiesta();
          ver(perfil, clavePieza('amuleto', a.id));
          decir(VOZ.compra, 'risa');
          sonar('oro');
          cerrarModal();
          guardar();
          repintar();
        };
        if (p.amuletos.length >= p.huecos) modalReemplazo(p, a.id, hacer, () => cerrarModal());
        else hacer();
      },
      llevar: (el) => {
        const i = Number(el.dataset.i);
        const k = p.tienda?.chiches?.[i];
        if (!k) return;
        if (p.oro < k.precio) {
          decir(VOZ.sinOro, 'burla');
          sonar('error');
          repintar();
          return;
        }
        if (juego.comprarChiche(p, i)) {
          decir(VOZ.compra, 'risa');
          sonar('chiche');
          guardar();
        }
        repintar();
      },
      purgar: () => {
        if (p.oro < p.tienda!.purgar) {
          decir(VOZ.sinOro, 'burla');
          sonar('error');
          repintar();
          return;
        }
        modalMazo(p, t('elegiPurga'), (id) => {
          if (juego.purgar(p, id)) {
            decir(VOZ.purga, 'burla');
            sonar('cae');
            guardar();
          }
          repintar();
        });
      },
      curar: () => {
        if (p.oro < p.tienda!.curar) {
          decir(VOZ.sinOro, 'burla');
          sonar('error');
        } else if (juego.curarEnPulperia(p)) {
          decir(VOZ.cura, 'risa');
          sonar('cura');
          guardar();
        }
        repintar();
      },
      salir: () => {
        juego.salir(p);
        avanzar();
      },
    },
  };
}

// ───────────────────────── el Fogón ─────────────────────────

export function pantallaFogon(p: Partida): Pantalla {
  const cura = Math.min(Math.round(p.vidaMax * B.fogon.curaPct), p.vidaMax - p.vida);
  let seQuemo = false;
  let ocupado = false;
  /** (0.22) recién salió de la tercera pasada: el grito «¡FORJA BRAVA!» queda sobre el naipe un rato. */
  let recienBrava = false;
  let relojBrava = 0;
  let brasas = 0;
  /** (0.26) La capa del momento cumbre de la Forja Brava: el naipe entero sobre la fogata, fuera del panel. */
  let forja: HTMLElement | null = null;
  /**
   * (0.26) El naipe sale del panel (que se pliega) en su propia capa y baja, a escala entera y ENTERO, hasta pararse
   * sobre la fogata del tercio de abajo; una llama de pixel-art le sube por el pie mientras dura el suspenso.
   */
  /**
   * (0.27) La llama de la Forja Brava: pixel-art tramado a celda entera (Bayer 4×4, rampa blanco → oro → naranja →
   * carmín → índigo). No es una tira al pie: son lenguas que SUBEN por los dos bordes del naipe y lo envuelven (bajas al
   * medio, donde se lee el naipe; altas a los costados), y crecen en tres escalones de 400 ms mientras dura el suspenso.
   */
  const llamaForja = (capa: HTMLElement, k: number): void => {
    const W = 156;
    const H = 150;
    const cv = document.createElement('canvas');
    cv.className = 'forja-llama';
    cv.width = W;
    cv.height = H;
    cv.style.width = `${W * k}px`;
    cv.style.height = `${H * k}px`;
    capa.append(cv);
    const c = cv.getContext('2d');
    if (!c) return;
    const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    const RAMPA = [[255, 247, 153], [255, 213, 0], [255, 170, 0], [255, 123, 0], [216, 30, 60], [122, 0, 38], [58, 20, 86]];
    const t0 = performance.now();
    let cuadro = -1;
    const pinta = (): void => {
      if (!cv.isConnected) return;
      const t = (performance.now() - t0) / 1000;
      const n = Math.floor(t * 12);
      if (n !== cuadro) {
        cuadro = n;
        // (0.28) cuando el naipe arde, la fogata sube un escalón más antes de apagarse
        const crece = capa.classList.contains('arde') ? 1.3 : capa.classList.contains('sale') ? 0.3 : [0.5, 0.75, 1][Math.min(2, Math.floor(t / 0.4))];
        const img = c.createImageData(W, H);
        for (let px = 0; px < W; px++) {
          const u = Math.abs((px - W / 2) / (W / 2));
          // (bajas al medio, altas a los costados; cada lengua es un diente que baila de a pasos)
          const diente = Math.abs(((px + n * 3) % 14) - 7) / 7;
          const baile = 0.82 + 0.18 * Math.sin(px * 0.41 + n * 1.9) + 0.1 * Math.sin(px * 0.13 - n * 1.1);
          // (las puntas de afuera caen: dos cuernos de fuego, no una losa)
          // (0.28) los hombros caen en curva (no a plomo) y el medio no es una losa: sus lenguas son más hondas y bailan
          // con otro compás, así la base se lee como brasas que respiran
          const borde = Math.min(1, (1 - u) / 0.3) ** 1.6;
          const medio = 0.2 + 0.1 * Math.sin(px * 0.23 + n * 0.7) + 0.06 * Math.sin(px * 0.61 - n * 1.3);
          const alto = H * crece * (medio + 0.8 * u ** 1.4) * baile * (0.5 + 0.5 * diente) * borde;
          for (let yy = 0; yy < alto && yy < H; yy++) {
            const py = H - 1 - yy;
            const v = yy / alto;
            const b = BAYER[(px & 3) + ((py & 3) << 2)] / 16;
            // (la punta se deshace tramada)
            if (v > 0.8 && b < (v - 0.8) / 0.2) continue;
            const i = Math.max(0, Math.min(RAMPA.length - 1, Math.floor(v * RAMPA.length + (b - 0.5) * 1.3)));
            const o = (py * W + px) * 4;
            img.data[o] = RAMPA[i][0];
            img.data[o + 1] = RAMPA[i][1];
            img.data[o + 2] = RAMPA[i][2];
            img.data[o + 3] = 255;
          }
        }
        c.putImageData(img, 0, 0);
      }
      requestAnimationFrame(pinta);
    };
    pinta();
  };
  const bajarAlFuego = (carta: Carta, r0: DOMRect, f: { x: number; y: number }): HTMLElement => {
    const kRaiz = Number(getComputedStyle(document.documentElement).getPropertyValue('--k')) || 1;
    const capa = document.createElement('div');
    capa.className = 'forja-capa';
    capa.setAttribute('aria-hidden', 'true');
    // (0.27: en la Deck y el escritorio el naipe va a 2×: el momento cumbre no es más chico que el gorro del Bufón)
    const kCapa = Math.max(innerWidth >= 1100 ? 2 : 1, Math.round(kRaiz));
    capa.style.setProperty('--k', String(kCapa));
    capa.innerHTML = `<span class="fuego-carta al-fuego bravo">${pxNaipe(carta)}</span>`;
    document.body.append(capa);
    llamaForja(capa, kCapa);
    const w = capa.offsetWidth;
    const h = capa.offsetHeight;
    // (el pie del naipe, metido en las llamas; nunca debajo del HUD)
    const techoHud = document.querySelector('.hud')?.getBoundingClientRect().top ?? innerHeight;
    // (0.27: un tercio del naipe adentro de la fogata, que lo envuelve)
    const top = Math.max(8, Math.min(f.y + Math.round(h * 0.3), techoHud - 6) - h);
    const left = Math.round(f.x - w / 2);
    capa.style.left = `${left}px`;
    capa.style.top = `${Math.round(top)}px`;
    // sale de donde estaba en el panel, a su tamaño de ahí
    capa.style.setProperty('--dx0', `${Math.round(r0.left + r0.width / 2 - (left + w / 2))}px`);
    capa.style.setProperty('--dy0', `${Math.round(r0.top + r0.height / 2 - (top + h / 2))}px`);
    capa.style.setProperty('--s0', (r0.width / Math.max(1, w)).toFixed(3));
    return capa;
  };
  const FUEGO = ['#ffffff', '#ffd500', '#ff7b00', '#7a0026'];
  const centroDe = (sel: string): { x: number; y: number; r: DOMRect } | null => {
    const r = $(sel)?.getBoundingClientRect();
    return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2, r } : null;
  };
  /** El naipe recién templado: un fogonazo y su «+4» que sube (0.25: en la Forja Brava, un «×2» grande: lo que pasó es que el naipe entero se duplicó). */
  const fogonazo = (brava = false): void => {
    const c = centroDe('.fuego-carta');
    if (!c || quieto()) return;
    destello(c.x, c.y, FUEGO, 22);
    chispas(c.x, c.y, FUEGO, 16, 90, -40);
    numero(brava ? '×2' : `+${B.fogon.temple}`, c.x, c.y - c.r.height * 0.4, 'oro', brava ? 3 : 2);
  };
  /** (0.25) La placa del temple en palabras: «+12 de Daño · ★ +1 de Multi · naipe entero ×2». */
  const placaHtml = (c: Carta): string =>
    [t('placaTemple', { n: c.temple ?? 0 }), c.templada ? t('placaMulti', { m: B.fogon.multiTemplada }) : '', c.brava ? t('placaBrava') : '']
      .filter(Boolean)
      .map((s) => `<span>${esc(s)}</span>`)
      .join('');
  /** (0.25) El chip de la mutación con su costo a la vista (Doble Filo: «−2 de Vida al jugarlo»). */
  const mutChip = (m: Mutacion): string => {
    const costo = MUTACION_COSTO[m];
    return `<span class="chip mutacion-chip" data-mut ${tip(tx(MUTACION_NOMBRE[m]), tx(MUTACION_DESC[m]), t('forjaBrava'))}>${pxHud(MUTACION_PX[m])} <b>${esc(tx(MUTACION_NOMBRE[m]))}</b>${costo ? `<span class="mc-costo">${esc(tx(costo))}</span>` : ''}</span>`;
  };
  /** La segunda opción del Fogón: templar un naipe; el naipe que ya está en el fuego (¿otra pasada?); o su ceniza. */
  const fuegoHtml = (): string => {
    const enFuego = p.fogonCarta ? p.mazo.find((k) => k.id === p.fogonCarta) : null;
    if (seQuemo) return `<div class="opcion marco hierro fuego"><span class="op-icono grande">${pxNodo('fogon')}</span><b class="op-nombre">${t('quemada')}</b></div>`;
    if (enFuego) {
      const pasadas = p.fogonPasadas ?? 0;
      const puede = juego.puedeArrimar(p);
      // (0.23) la tercera pasada se elige: las dos mutaciones que ofrece el fuego, a la vista con lo que hacen y lo que
      // cuestan (sin pasar el puntero), y cada una es su propio botón de FORJA BRAVA
      const muts = pasadas >= 2 && puede ? (p.fogonMutaciones ?? []) : [];
      const riesgo = Math.round(B.fogon.riesgos[2] * 100);
      // (0.25) cada mutación: lo que da y, aparte y en carmesí, lo que cuesta; las cajas de regla, de la misma altura
      const mutBoton = (m: Mutacion, i: number): string => {
        const costo = MUTACION_COSTO[m];
        return `<button class="opcion marco dorado forja-mut" data-accion="arrimar" data-mut="${m}" data-foco="mut-${i}" ${i === 0 ? 'data-inicio' : ''}><span class="fm-icono">${pxHud(MUTACION_PX[m])}</span><b class="fm-nombre">${esc(tx(MUTACION_NOMBRE[m]))}</b><span class="fm-desc">${esc(tx(MUTACION_GANA[m]))}${costo ? `<span class="fm-costo"><b class="fm-costo-rot">${t('forjaCuesta')}</b> ${esc(tx(costo))}</span>` : ''}</span></button>`;
      };
      const arrimar = !puede
        ? ''
        : muts.length
          ? `<div class="forja-elige"><b class="forja-elige-tit rotulo">${t('forjaElegi')}</b>
              ${muts.map(mutBoton).join('')}</div>`
          : `<button class="btn marco ${pasadas >= 2 ? 'oro' : 'prisma'} chico" data-accion="arrimar" data-foco="arrimar" data-inicio>${pasadas >= 2 ? t('forjaBrava') : t('arrimar')}</button><span class="op-desc">${pasadas >= 2 ? t('riesgoBrava', { p: riesgo }) : t('riesgo', { n: B.fogon.temple, m: B.fogon.multiTemplada, p: Math.round(B.fogon.riesgos[1] * 100) })}</span>`;
      // (0.25) en la tercera pasada la apuesta va arriba y grande, y lo que el naipe ya tiene se lee como estado (YA
      // TIENE…), no como una tercera opción
      const apuesta = muts.length ? `<p class="forja-apuesta" role="note"><b class="fa-rot">${t('forjaApuesta', { p: riesgo })}</b><span class="fa-si">${esc(t('forjaSiSale'))}</span></p>` : '';
      const estado = muts.length
        ? `<p class="fuego-estado fuego-hoy"><b class="fe-rot">${t('forjaYaTiene')}</b><span class="f-placa">${placaHtml(enFuego)}</span></p>`
        : `<b class="op-nombre fuego-estado">${enFuego.brava ? t('forjada') : enFuego.templada ? t('templadaMulti', { n: enFuego.temple ?? 0, m: B.fogon.multiTemplada }) : t('templada', { n: enFuego.temple ?? 0 })}</b>`;
      // (la placa del temple va DEBAJO del naipe, no encima: tapaba media carta en el teléfono; 0.25: en palabras)
      return `<div class="opcion marco hierro fuego${enFuego.brava ? ' forjado' : ''}">
        ${apuesta}
        <span class="fuego-naipe"><span class="fuego-carta">${pxNaipe(enFuego)}</span>${muts.length ? '' : `<span class="c-temple f-temple f-placa">${placaHtml(enFuego)}</span>`}</span>
        ${recienBrava ? `<b class="forja-grito rotulo" role="status">${t('forjaBrava')}</b>` : ''}
        ${enFuego.mutacion ? mutChip(enFuego.mutacion) : ''}
        ${estado}
        ${arrimar}
      </div>`;
    }    // (ya descansaste: TEMPLAR queda en un renglón apagado, no en una caja vacía)
    if (p.fogonHecho) return `<p class="opcion-renglon apagado">${pxHud('furia')}<b>${t('templar')}</b><span>${t('fogonUsado')}</span></p>`;
    // (con la Vida llena, DESCANSAR está apagado: el foco inicial pasa a TEMPLAR)
    return `<button class="opcion marco hierro" data-accion="templar" data-foco="templar" ${p.vida >= p.vidaMax ? 'data-inicio' : ''}>
      <span class="op-icono grande">${pxHud('furia')}</span><b class="op-nombre">${t('templar')}</b><span class="op-desc">${t('templarDesc', { n: B.fogon.temple })}</span>
    </button>`;
  };
  /**
   * DESCANSAR: con la Vida llena o el Fogón ya usado no queda una caja grande y vacía. Usado, no se dibuja; con la Vida
   * llena, un renglón apagado («DESCANSAR · Vida llena»).
   */
  const descansoHtml = (): string => {
    if (p.fogonHecho) return '';
    if (p.vida >= p.vidaMax) return `<p class="opcion-renglon apagado">${pxNodo('fogon')}<b>${t('descansar')}</b><span>${t('vidaLlena')}</span></p>`;
    return `<button class="opcion marco paloH" data-accion="descansar" data-foco="descansar" data-inicio>
            <span class="op-icono grande">${pxNodo('fogon')}</span><b class="op-nombre">${t('descansar')}</b><span class="op-desc">${t('descansarDesc', { n: cura })}</span>
          </button>`;
  };  return {
    nombre: 'fogon',
    html: () => `<main class="pantalla en-partida fogon">
      <header class="cabecera"><h1 class="titulo">${t('fogon')}</h1><div class="lado">${botonMenu()}</div></header>
      <div class="cuerpo">
        ${
          // (0.25) en la tercera pasada el Bufón no dice «el fuego no cobra»: dice que es una apuesta
          anfitrion(p.fogonCarta && juego.puedeArrimar(p) && (p.fogonPasadas ?? 0) >= 2 && !seQuemo ? t('bufonForjaBrava') : tx(alAzar(VOZ.fogon, fijo())), 'reposo')
        }
        <div class="opciones">
          ${descansoHtml()}
          ${fuegoHtml()}
        </div>
        ${
          // (0.24) con la tercera pasada por elegir, SEGUIR es secundario (hierro y chico): lo que se lee son las dos mutaciones
          p.fogonHecho && juego.puedeArrimar(p) && (p.fogonPasadas ?? 0) >= 2
            ? `<button class="btn marco hierro chico fogon-seguir" data-accion="seguir" data-foco="seguir">${t('seguir')}</button>`
            : `<button class="btn marco ${p.fogonHecho ? 'oro' : 'hierro'} grande" data-accion="seguir" data-foco="seguir" ${p.fogonHecho && !juego.puedeArrimar(p) ? 'data-inicio' : ''}>${t(p.fogonHecho ? 'seguir' : 'seguirSinFogon')}</button>`
        }
      </div>
      ${hudHtml(p)}
    </main>`,
    alMontar: () => {
      avivarRetrato(p);
      // las brasas del Fogón suben todo el tiempo desde el fuego
      clearInterval(brasas);
      if (!quieto())
        brasas = window.setInterval(() => {
          const c = centroDe('.fogon .fuego-carta') ?? centroDe('.fogon [data-accion="descansar"] .op-icono');
          if (c && !document.hidden) chispas(c.x + (Math.random() - 0.5) * c.r.width * 0.6, c.y + c.r.height * 0.3, FUEGO, 1, 26, -70);
        }, 260);
    },
    alSalir: () => {
      clearInterval(brasas);
      clearTimeout(relojBrava);
      avivarFuego(0);
      forja?.remove();
      forja = null;
    },
    acciones: {
      ...accionesComunes(p),
      descansar: () => {
        const hecho = juego.descansar(p);
        if (hecho) sonar('cura');
        guardar();
        repintar();
        if (hecho) bufonDice(tx(alAzar(VOZ.descansa)));
      },
      templar: () =>
        modalMazo(
          p,
          t('elegiTemple'),
          (id) => {
            const r = juego.templar(p, id);
            if (r) sonar('fuego');
            guardar();
            repintar();
            if (r) {
              fogonazo();
              bufonDice(tx(alAzar(VOZ.templa)));
            }
          },
          p.mazo.filter((k) => k.palo !== 'X'),
          true,
        ),
      arrimar: async (boton) => {
        const carta = p.fogonCarta ? p.mazo.find((k) => k.id === p.fogonCarta) : null;
        const mut = boton?.dataset.mut as Mutacion | undefined;
        if (ocupado || !carta) return;
        ocupado = true;
        // el suspenso: el naipe tiembla sobre las llamas mientras sube el chisporroteo
        const el = $('.fuego-carta');
        const brava = (p.fogonPasadas ?? 0) >= 2;
        el?.classList.add('al-fuego');
        for (const b of document.querySelectorAll<HTMLButtonElement>('[data-accion="arrimar"]')) b.setAttribute('disabled', '');
        if (brava) {
          // (0.24) la tercera pasada se hace esperar: 1,5 s con el fuego que sube y el naipe que tiembla cada vez más;
          // los primeros 400 ms no se cortan (TURBO corta el resto)
          el?.classList.add('bravo');
          $('.fogon .opcion.fuego')?.classList.add('forjando');
          // (0.26) la escena manda sobre el panel: el panel de la apuesta y SEGUIR se pliegan y salen, y el naipe, entero y
          // a escala entera más grande, baja en su propia capa hasta la fogata del tercio de abajo, que crece
          const f = fuegoEnPantalla();
          const r0 = el?.getBoundingClientRect();
          $('main.fogon')?.classList.add('forjando');
          if (el && f && r0 && r0.width > 0 && !quieto()) forja = bajarAlFuego(carta, r0, f);
          avivarFuego(1);
          sonar('forjaSube');
          // (0.27) ya elegiste: el Bufón no sigue diciendo «Elegí la mutación y rezá»; contiene el aliento
          const globo = $('main.fogon .anfitrion .bocadillo') ?? $('main.fogon .bocadillo');
          if (globo) globo.textContent = t('bufonSuspenso');
          const an = $('main.fogon .anfitrion');
          if (an) gestoBufon(an, 'sombria');
          if (!quieto()) await new Promise((ok) => setTimeout(ok, 400));
          await pausa(1100);
        } else {
          sonar('suspenso');
          await pausa(820);
        }
        const capa = forja;
        const rect = (capa?.querySelector('.fuego-carta') ?? el)?.getBoundingClientRect();
        const r = juego.templar(p, carta.id, mut);
        avivarFuego(0);
        recienBrava = brava && r === 'templada';
        // al salir del fuego bravo: el golpe se congela un instante (hitstop) y la mesa se sacude
        if (recienBrava && !quieto()) {
          congelar(110);
          (capa?.querySelector('.fuego-carta') ?? el)?.classList.add('congela');
          await new Promise((ok) => setTimeout(ok, 110));
        }
        // (0.28) el anfitrión juega la apuesta: en el mismo cuadro del resultado cambia de cara, de pose y de frase
        const reaccion = (sale: boolean): void => {
          if (!brava) return;
          const an = $('main.fogon .anfitrion');
          const globo = $('main.fogon .anfitrion .bocadillo') ?? $('main.fogon .bocadillo');
          if (globo) globo.textContent = t(sale ? 'bufonForjaSale' : 'bufonForjaQuema');
          if (an) gestoBufon(an, sale ? 'risa' : 'burla');
          const bf = $('main.fogon .anfitrion .bufon');
          bf?.classList.remove('festeja', 'lamenta');
          void (bf as HTMLElement | null)?.offsetWidth;
          bf?.classList.add(sale ? 'festeja' : 'lamenta');
        };
        if (r === 'quemada') {
          seQuemo = true;
          sonar('ceniza');
          reaccion(false);
          capa?.classList.add('arde');
          if (rect && !quieto()) {
            // el naipe se parte en brasas y se va en humo (sobre la fogata, donde está)
            partirNaipe(lienzoNaipe(carta.palo as Exclude<typeof carta.palo, 'X'>, carta.n), rect, FUEGO);
            humo(rect.left + rect.width / 2, rect.top + rect.height / 2, rect.width * 0.7);
            (capa?.querySelector('.fuego-carta') ?? el)?.classList.add('ceniza');
            await pausa(capa ? 900 : 520);
          }
        } else if (r === 'templada') sonar(recienBrava ? 'forja' : 'canto');
        // (0.26) el «×2» de la Forja Brava estalla sobre la fogata, con el naipe entero todavía ahí; recién después
        // vuelve el panel (y SEGUIR)
        if (recienBrava) reaccion(true);
        if (recienBrava && capa && rect && !quieto()) {
          capa.classList.add('sale');
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          destello(cx, cy, FUEGO, 34);
          chispas(cx, cy, ['#ffd500', '#ff7b00', '#00c8ff', '#ff1453'], 26, 140, -30);
          numero('×2', cx, rect.top + rect.height * 0.35, 'oro', 3);
          sacudir($('main.fogon'), 3);
          await pausa(900);
        }
        forja?.remove();
        forja = null;
        guardar();
        repintar();
        ocupado = false;
        if (r === 'templada' && !(recienBrava && capa)) fogonazo(recienBrava);
        if (recienBrava) {
          // ¡FORJA BRAVA!: el grito sobre el naipe, un estallido de oro y la mutación con la que salió del fuego
          const c = capa ? null : centroDe('.fuego-carta');
          if (c && !quieto()) {
            destello(c.x, c.y, FUEGO, 34);
            chispas(c.x, c.y, ['#ffd500', '#ff7b00', '#00c8ff', '#ff1453'], 26, 140, -30);
            sacudir($('main.fogon'), 3);
          }
          clearTimeout(relojBrava);
          relojBrava = window.setTimeout(() => {
            recienBrava = false;
            $('.forja-grito')?.remove();
          }, quieto() ? 2200 : 1600);
        }
        if (r && !recienBrava) bufonDice(tx(alAzar(r === 'quemada' ? VOZ.quema : VOZ.templa)));
        if (recienBrava && carta.mutacion) bufonDice(`${t('forjaBrava')} ${tx(MUTACION_NOMBRE[carta.mutacion])}.`);
      },
      seguir: () => {
        juego.salir(p);
        avanzar();
      },
    },
  };
}

// ───────────────────────── la Cábala del Bufón ─────────────────────────

/**
 * (0.23) El momento de Coser: la aguja con su hilo negro sale del segundo naipe y entra en el primero, el segundo se
 * corre encima del primero y se apaga (dos naipes que se vuelven uno), y un fogonazo violeta los sella.
 */
async function coserNaipes(naipes: HTMLElement[], rects: DOMRect[]): Promise<void> {
  const capa = $('#capa');
  const [a, b] = rects;
  const centro = (r: DOMRect) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
  const ca = centro(a);
  const cb = centro(b);
  const aguja = document.createElement('span');
  aguja.className = 'negra-aguja';
  aguja.innerHTML = pxHud('aguja');
  aguja.style.left = `${cb.x}px`;
  aguja.style.top = `${cb.y}px`;
  capa?.appendChild(aguja);
  // el hilo: una raya negra que se estira detrás de la aguja
  const hilo = document.createElement('i');
  hilo.className = 'negra-hilo';
  const largo = Math.hypot(ca.x - cb.x, ca.y - cb.y);
  hilo.style.left = `${cb.x}px`;
  hilo.style.top = `${cb.y}px`;
  hilo.style.width = `${largo}px`;
  hilo.style.transform = `rotate(${Math.atan2(ca.y - cb.y, ca.x - cb.x)}rad) scaleX(0)`;
  capa?.appendChild(hilo);
  const dx = ca.x - cb.x;
  const dy = ca.y - cb.y;
  aguja.animate([{ transform: 'translate(-50%, -50%)' }, { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px - 24px))`, offset: 0.6 }, { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))` }], { duration: 420, easing: 'steps(7)', fill: 'forwards' });
  hilo.animate([{ transform: `rotate(${Math.atan2(dy, dx)}rad) scaleX(0)` }, { transform: `rotate(${Math.atan2(dy, dx)}rad) scaleX(1)` }], { duration: 420, easing: 'steps(7)', fill: 'forwards' });
  naipes[1].animate([{ transform: 'none', opacity: 1 }, { transform: `translate(${a.left - b.left}px, ${a.top - b.top}px)`, opacity: 0.25 }], { duration: 420, delay: 160, easing: 'steps(6)', fill: 'forwards' });
  await pausa(600);
  destello(ca.x, ca.y, ['#ffffff', '#e0c8ff', '#9b4dff', '#4a1a8a'], 24);
  chispas(ca.x, ca.y, ['#e0c8ff', '#9b4dff', '#ffd500'], 12, 90, -30);
  aguja.remove();
  hilo.remove();
}
export function pantallaCabala(p: Partida): Pantalla {
  const def = CABALA[p.cabala!.id];
  const pct = Math.round(suerte(p) * (def.humor === 'garca' ? 0.5 : 1) * 100);
  // (0.22) la Cábala Negra pide naipes del Mazo: elegida la opción, la bandeja de naipes se abre en la misma escena
  let elegida: OpcionCabala | null = null;
  let ids: string[] = [];
  let cosiendo = false;
  const cerrarBandeja = (): void => {
    elegida = null;
    ids = [];
    sonar('carta');
    repintar();
    $<HTMLElement>('[data-foco^="cab-"]:not(:disabled)')?.focus();
  };
  const bandejaHtml = (o: OpcionCabala): string => {
    const n = o.cartas ?? 2;
    const tocables = p.mazo.filter((c) => !esComodin(c) && !c.marcada);
    // (0.23) en el teléfono, un renglón por número con los cuatro palos lado a lado (los pares para coser quedan juntos);
    // en escritorio, un renglón por palo
    const ORDEN_PALO = ['S', 'C', 'D', 'H'];
    const porNumero = matchMedia('(max-width: 700px)').matches;
    const grupos = porNumero
      ? [...new Set(tocables.map((c) => c.n))].sort((a, b) => a - b).map((n) => tocables.filter((c) => c.n === n).sort((a, b) => ORDEN_PALO.indexOf(a.palo) - ORDEN_PALO.indexOf(b.palo)))
      : (['S', 'C', 'D', 'H'] as const).map((s) => ordenar(tocables.filter((c) => c.palo === s))).filter((g) => g.length);
    const primero = ids[0] ? p.mazo.find((c) => c.id === ids[0]) : undefined;
    const pista = o.id === 'trasplantar' ? t('negraPrimero') : o.id === 'coser' ? t('negraIguales') : '';
    const listo = ids.length === n && (!o.validas || o.validas(p, ids));
    const cara = (c: Carta): string => pxNaipe(c) + (c.temple ? `<span class="c-temple">+${c.temple}${c.templada ? '★' : ''}${c.brava ? ' ×2' : ''}</span>` : '');
    let inicio = !ids.length;
    const filas = grupos
      .map(
        (g) =>
          `<div class="visor-fila">${g
            .map((c) => {
              const k = ids.indexOf(c.id);
              const apagada = k < 0 && (ids.length >= n || (o.id === 'coser' && !!primero && c.n !== primero.n));
              const marca = inicio && !apagada;
              if (marca) inicio = false;
              return `<button class="visor-carta negra-naipe ${k >= 0 ? 'elegida' : ''}" data-accion="naipe" data-id="${c.id}" data-foco="negra-${c.id}" aria-pressed="${k >= 0}" ${apagada ? 'disabled' : ''} ${marca ? 'data-inicio' : ''}>${cara(c)}${k >= 0 ? `<b class="negra-orden">${k + 1}</b>` : ''}</button>`;
            })
            .join('')}</div>`,
      )
      .join('');
    return `<section class="panel marco hierro negra-bandeja ${porNumero ? 'por-numero' : ''}">
          <h2 class="rotulo">${esc(tx(o.texto))}</h2>
          <p class="negra-pista">${esc(t('negraElegi', { n }))}${pista ? ` · ${esc(pista)}` : ''}</p>
          <div class="visor-cartas rollo">${filas}</div>
          <div class="negra-pie">
            <button class="btn marco hierro" data-accion="volver" data-foco="negra-volver">${t('negraVolver')}</button>
            <button class="btn marco ${listo ? 'oro' : 'hierro'}" data-accion="coser" data-foco="negra-coser" ${listo ? 'data-inicio' : 'disabled'}>${o.id === 'coser' ? t('negraCoser') : esc(tx(o.texto).toUpperCase())}</button>
          </div>
        </section>`;
  };
  return {
    nombre: 'cabala',
    html: () => {
      const r = p.cabala?.resultado;
      if (!r && elegida)
        return `<main class="pantalla en-partida cabala negra">
      <header class="cabecera"><div class="lado"><h1 class="titulo">${esc(tx(def.titulo))}</h1></div></header>
      <div class="cuerpo">
        ${anfitrion(tx(elegida.detalle), 'brillo', 'cabala-bufon')}
        ${bandejaHtml(elegida)}
      </div>
      ${hudHtml(p)}
    </main>`;
      return `<main class="pantalla en-partida cabala">
      <header class="cabecera"><div class="lado"><h1 class="titulo">${esc(tx(def.titulo))}</h1></div><div class="lado"><span class="chip">${t('humor', { h: tx(HUMOR_NOMBRE[humorDe(p.afinidad)]) })}</span></div></header>
      <div class="cuerpo">
        ${anfitrion(r ? r[idioma()] : tx(def.propone), r ? (r.bueno ? 'risa' : 'burla') : 'brillo', 'cabala-bufon')}
        ${
          r
            ? `<button class="btn marco oro grande" data-accion="seguir" data-foco="seguir" data-inicio>${t('seguir')}</button>`
            : `<div class="opciones">${def.opciones
                .map((o, i) => {
                  const puede = !o.puede || o.puede(p);
                  return `<button class="opcion marco ${o.acepta ? 'prisma' : 'hierro'}" data-accion="opcion" data-id="${o.id}" data-foco="cab-${i}" ${puede ? '' : 'disabled'} ${i === 0 ? 'data-inicio' : ''}>
                    <b class="op-nombre">${esc(tx(o.texto))}</b><span class="op-desc">${esc(tx(detalleDe(o, p)))}</span>${o.aSuerte ? `<span class="chip canto">${pxHud('dado5')} ${t('aSuerte', { p: pct })}</span>` : ''}
                  </button>`;
                })
                .join('')}</div>`
        }
      </div>
      ${hudHtml(p)}
    </main>`;
    },
    alMontar: (app) => {
      avivarRetrato(p);
      if (elegida) avisarRollo(app);
    },
    atras: () => (elegida ? cerrarBandeja() : void irASalida($('#app'))),
    acciones: {
      ...accionesComunes(p),
      opcion: (el) => {
        const o = def.opciones.find((x) => x.id === el.dataset.id);
        if (o?.cartas) {
          // la opción pide naipes: se abre la bandeja del Mazo (todavía no se responde nada)
          elegida = o;
          ids = [];
          sonar('carta');
          repintar();
          $<HTMLElement>('.negra-bandeja [data-inicio]')?.focus();
          return;
        }
        if (juego.responderCabala(p, el.dataset.id!)) {
          sonar(p.cabala?.resultado?.bueno ? 'oro' : 'error');
          guardar();
          repintar();
        }
      },
      naipe: (el) => {
        if (!elegida) return;
        const id = el.dataset.id!;
        const k = ids.indexOf(id);
        if (k >= 0) ids.splice(k, 1);
        else if (ids.length < (elegida.cartas ?? 2)) ids.push(id);
        sonar('carta');
        repintar();
        if (ids.length === (elegida.cartas ?? 2)) $<HTMLElement>('[data-foco="negra-coser"]:not(:disabled)')?.focus();
        else $<HTMLElement>(`[data-foco="negra-${id}"]`)?.focus();
      },
      volver: () => cerrarBandeja(),
      coser: async () => {
        if (cosiendo) return;
        const opcion = elegida?.id;
        // (0.23) los dos naipes antes de responder: la aguja va del segundo al primero y los cose en uno
        const naipes = ids.map((id) => $<HTMLElement>(`[data-foco="negra-${id}"]`)).filter((e): e is HTMLElement => !!e);
        const rects = naipes.map((e) => e.getBoundingClientRect());
        if (!elegida || !juego.responderCabala(p, elegida.id, ids)) {
          sonar('error');
          return;
        }
        if (opcion === 'coser' && rects.length === 2) {
          sonar('coser');
          if (!quieto() && !enFoto()) {
            cosiendo = true;
            await coserNaipes(naipes, rects);
            cosiendo = false;
          }
        } else sonar('oro');
        elegida = null;
        ids = [];
        guardar();
        repintar();
      },
      seguir: () => {
        juego.salir(p);
        avanzar();
      },
    },
  };
}

// ───────────────────────── el final ─────────────────────────

/**
 * El final, como cuadro. «La Corte cayó»: amanece sobre el arrabal, tu Personaje al centro con el sol detrás, el
 * Bufón que festeja a su lado y, a tus pies, los naipes de los Reyes partidos en dos con su nombre. «Te llevó la
 * Corte»: la vela de la mesa que se apaga, tu retrato partido en dos y, enfrente, entero, el Rey que te ganó (en su
 * segunda cara), con los que habías vencido tirados a sus pies. Los números van en una tabla al costado del cuadro.
 */
/**
 * (0.23) El resumen en dos capas, dentro del panel del final (sin pantalla nueva). Arriba, la BUILD ESTRELLA: las
 * Evoluciones con su dibujo despierto, hasta tres Amuletos, la Bendición más alta, tu jugada y el mejor golpe en cifras
 * grandes. Abajo, QUÉ TE FRENÓ (quién y cuánto le quedaba) y PRÓXIMO RÉCORD (esta contra tu mejor).
 */
function resumenHtml(p: Partida, r: ResumenPartida): string {
  const e = r.estrella;
  // (0.24) cada pieza es un botón (el mando llega con la cruceta y lee su regla en la ayuda), con el icono a ≥ 40 px
  const ficha = (icono: string, nombre: string, desc: string, cls = ''): string => `<button type="button" class="ficha fin-pieza ${cls}" data-foco="pieza" aria-label="${esc(nombre)}" ${tip(nombre, desc)}>${icono}</button>`;
  const piezas = [
    ...e.amuletos.map((id) =>
      esEvolucionable(id) && e.evoluciones.includes(id) ? ficha(pxEvolucion(id), tx(EVOLUCION[id].nombre), tx(EVOLUCION[id].desc), 'evolucion') : ficha(pxAmuleto(id), tx(AMULETO[id].nombre), tx(AMULETO[id].desc)),
    ),
    // (0.27) el nivel va debajo de SU pieza (suelto al final de la fila no se sabía de cuál era)
    ...(e.bendicion
      ? [`<span class="fin-pieza-col">${ficha(pxBendicion(e.bendicion.id), tx(BENDICION[e.bendicion.id].nombre), tx(BENDICION[e.bendicion.id].desc(e.bendicion.nivel)))}${e.bendicion.nivel > 1 ? `<b class="fin-nivel">${t('nivelN', { n: e.bendicion.nivel })}</b>` : ''}</span>`]
      : []),
  ];
  // la Evolución, con su nombre a la vista (es lo primero que se lee de la build)
  const evo = e.evoluciones[0];
  const evoNombre = evo ? `<b class="fin-evo-nombre">${esc(tx(EVOLUCION[evo].nombre))}</b>` : '';
  // (0.24) tu jugada con cómo se arma («Envido · 2 del mismo palo»): la tabla de JUGADAS no siempre la tiene a la vista
  const jugada = e.jugada
    ? `<span class="fin-jugada"><span class="rotulo">${t('jugadaFavorita')}:</span> <b>${esc(tx(JUGADA_NOMBRE[e.jugada]))}</b><span class="fin-jugada-como">${esc(tx(JUGADA_COMO[e.jugada]))}</span></span>`
    : '';
  const capa1 = `<div class="fin-capa fin-estrella">
      <h2 class="rotulo fin-capa-tit">${t('buildEstrella')}</h2>
      <div class="fin-build">${piezas.length ? `<span class="fin-piezas">${piezas.join('')}</span>` : ''}${evoNombre}${jugada}</div>
      <div class="fin-golpe"><span class="rotulo">${t('mejorGolpe')}</span>${cifra(e.mejorGolpe, 'oro', 'grande fin-golpe-n')}</div>
    </div>`;
  let freno: string;
  if (r.freno) {
    const por = r.freno.por;
    const quien = por.jefe ? tx(REY_DEF[por.palo].apodo) : idioma() === 'en' ? `${tx(RANGO_NOMBRE[por.rango])} of ${tx(PALO_NOMBRE[por.palo])}` : `${tx(RANGO_NOMBRE[por.rango])} de ${tx(PALO_NOMBRE[por.palo])}`;
    freno = `<p class="fin-freno-quien">${pxPalo(por.palo)}<b>${esc(quien)}${por.elite ? ` · ${t('elite')}` : ''}</b><span class="sub">${t('frenoTramo', { n: por.acto + 1 })}</span></p>
      <p class="fin-freno-vida"><span class="sub">${t('leQuedaba')}</span>${cifra(`${r.freno.leQuedaba}%`, 'roja', 'grande')}<span class="sub">${t('deSuVida')}</span></p>`;
  } else freno = `<p class="fin-freno-quien"><b>${t(r.victoria ? 'sinFreno' : 'nada')}</b></p>`;
  const rec = r.record;
  const tipoRec = t(rec.tipo === 'golpe' ? 'recordGolpe' : rec.tipo === 'tramo' ? 'recordTramo' : 'recordVictoria');
  // (0.24) ESTA PARTIDA y TU MEJOR, cada una con su rótulo y una raya en el medio; con récord nuevo, la cifra sube
  // (pantallaFin la cuenta desde tu mejor de antes)
  const record = `<p class="fin-rec-tipo"><b>${tipoRec}</b>${rec.nuevo ? `<span class="chip sinergia fin-rec-nuevo">${t('recordNuevo')}</span>` : ''}</p>
      <p class="fin-rec-cifras"><span class="fin-rec-col fin-rec-esta"><span class="fin-rec-rot">${t('recordEsta')}</span>${cifra(rec.actual, rec.nuevo ? 'oro' : 'hueso', 'grande')}</span><span class="fin-rec-col fin-rec-mejor"><span class="fin-rec-rot">${t('recordMejor')}</span>${cifra(rec.mejor, 'hueso', 'grande')}</span></p>`;
  const capa2 = `<div class="fin-capa fin-dos">
      <div class="fin-freno"><h3 class="rotulo fin-capa-tit">${t('queTeFreno')}</h3>${freno}</div>
      <div class="fin-record"><h3 class="rotulo fin-capa-tit">${t('proximoRecord')}</h3>${record}</div>
    </div>`;
  void p;
  return capa1 + capa2;
}
/**
 * (0.24) ¡NUEVO RÉCORD!: la cifra de ESTA PARTIDA sube desde tu mejor de antes hasta la nueva (1,1 s, con un tic por
 * paso y un golpe al llegar). En foto o con «Reducir movimiento», queda puesta.
 */
function contarRecord(): void {
  const r = sesion.resumen?.record;
  const el = $('.fin-rec-esta');
  if (!r?.nuevo || !el || enFoto() || quieto()) return;
  const desde = Math.min(r.mejor, r.actual);
  const pasos = 22;
  let i = 0;
  const poner = (n: number): void => el.querySelector('.cifra')?.replaceWith(document.createRange().createContextualFragment(cifra(n, 'oro', 'grande')));
  poner(desde);
  const reloj = window.setInterval(() => {
    i++;
    if (!el.isConnected) return void clearInterval(reloj);
    const f = 1 - (1 - i / pasos) ** 2;
    poner(Math.round(desde + (r.actual - desde) * f));
    if (i % 3 === 0) sonar('clic');
    if (i >= pasos) {
      clearInterval(reloj);
      el.classList.add('llega');
      sonar('oro');
    }
  }, 50);
}

export function pantallaFin(p: Partida): Pantalla {
  const gano = !!p.fin?.victoria;
  const s = p.stats;
  const reyes = p.tramos.map((tr, i) => ({ palo: tr.rey as Palo, vencido: i < s.reyes }));
  void PALOS;
  const cuadro = { mirada: 0, gesto: gano ? 'feroz' : 'caido', herida: gano ? 0 : 2 } as const;
  // cada Rey de la partida: los vencidos, partidos en dos y tirados; el que te ganó, de pie y en su segunda cara
  const verdugo = gano ? -1 : reyes.findIndex((r) => !r.vencido);
  const naipeRey = (palo: Palo, i: number): string => {
    const nombre = `<b class="fin-rey-nombre rotulo">${esc(tx(REY_DEF[palo].apodo))}</b>`;
    if (reyes[i].vencido) return `<div class="fin-rey caido" style="--i:${i}"><span class="fin-partido">${pxMitades(`naipe:${palo}12`, () => naipeMapa(palo, 12), i + 1, 'naipe')}</span>${nombre}</div>`;
    if (i === verdugo) return `<div class="fin-rey verdugo" style="--i:${i}">${pxNaipeSegunda(palo)}${nombre}</div>`;
    return `<div class="fin-rey espera" style="--i:${i}">${pxNaipe({ palo, n: 12 })}${nombre}</div>`;
  };
  const heroe = gano
    ? `<div class="fin-heroe"><i class="fin-cara" style="background-image:url(${urlRetrato(p.mazoId, cuadro)})"></i></div>`
    : `<div class="fin-heroe partido"><span class="fin-cara-partida">${pxMitades(`pj:${p.mazoId}|caido`, () => personajeMapa(p.mazoId, cuadro), 2, 'fin-mitad')}</span></div>`;
  // (0.27) si te frenó un Rey, el título lo nombra: «TE LLEVÓ EL CAUDILLO» (la Corte, solo si fue uno de la Corte)
  const tituloDerrota = (): string => {
    const por = (sesion.resumen ?? resumenDe(p, perfil)).freno?.por;
    return por?.jefe ? t('derrotaRey', { quien: tx(REY_DEF[por.palo].apodo) }) : t('derrota');
  };
  return {
    nombre: gano ? 'fin-victoria' : 'fin-derrota',
    atras: soltarPartida,
    html: () => `<main class="pantalla fin ${gano ? 'gano' : 'perdio'}">
      <div class="cuerpo fin-escena">
        <h1 class="titulo fin-titulo">${gano ? t('victoria') : esc(tituloDerrota())}</h1>
        <div class="fin-cuadro">
          ${anfitrion(tx(alAzar(gano ? VOZ.gano : VOZ.perdio, fijo())), gano ? 'risa' : 'sombria', 'fin-bufon')}
          ${heroe}
          <section class="panel fin-panel">
            ${resumenHtml(p, sesion.resumen ?? resumenDe(p, perfil))}
            <p class="fin-porotos dorado">${pxHud('poroto')} ${t('ganaste', { n: p.fin?.porotos ?? 0 })}</p>
            ${sesion.abiertos.map((m) => `<p class="chip sinergia">${t('seAbrio', { m: tx(MAZO[m].nombre) })}</p>`).join('')}
            ${sesion.reinadoAbierto ? `<p class="chip sinergia">${t('reinadoAbierto', { n: sesion.reinadoAbierto })}</p>` : ''}
          </section>
          <div class="fin-corte">${reyes.map((r, i) => naipeRey(r.palo, i)).join('')}</div>
        </div>
        <div class="fila fin-botones">
          <b class="fin-hay-mas" aria-hidden="true">${t('hayMas')}</b>
          <button class="btn marco oro grande fin-otra" data-accion="otra" data-foco="otra" data-inicio aria-label="${esc(t('otraManoTip', { m: tx(MAZO[p.mazoId].nombre) }))}">${pxHud('mazo')} ${t('otraManoYa')}</button>
          <button class="btn marco" data-accion="altar" data-foco="altar" data-tecla="d">${glifo('Y', 'D')}${t('altar')}</button>
          <button class="btn marco" data-accion="portada" data-foco="portada">${t('portada')}</button>
        </div>
      </div>
    </main>`,
    alMontar: () => {
      sonar(gano ? 'victoria' : 'derrota');
      if (gano && !enFoto()) lluviaDeMonedas(0, innerWidth, -10, 60);
      contarRecord();
      // (0.25) en el teléfono el cuadro se desliza: mientras quede algo abajo, la flecha de «hay más» sobre los botones
      const cuadro = $('.fin-cuadro');
      const escena = $('.fin-escena');
      if (cuadro && escena) {
        const mirar = (): void => void escena.classList.toggle('hay-mas', cuadro.scrollHeight - cuadro.scrollTop - cuadro.clientHeight > 8);
        cuadro.addEventListener('scroll', mirar, { passive: true });
        // (las cifras y los naipes se pintan un poco después: el alto cambia y se vuelve a mirar)
        const panel = cuadro.querySelector('.fin-panel');
        if (panel) new ResizeObserver(mirar).observe(panel);
        mirar();
        requestAnimationFrame(mirar);
      }
    },
    acciones: {
      // OTRA MANO YA: otra partida con el mismo Mazo y el mismo Reinado, sin pasar por la elección
      otra: () => {
        const { mazoId, reinado } = p;
        sesion.partida = null;
        void import('../juego').then((j) => j.empezar(mazoId, reinado));
      },
      altar: () => {
        sesion.partida = null;
        void import('../juego').then((j) => j.irAltar());
      },
      portada: soltarPartida,
    },
  };
}

export { AMULETO };
