// Las pantallas del camino, todas atendidas por el Bufón: el Mapa ramificado, el Botín y su «ELEGÍ UNA», la
// Pulpería, el Fogón, la Cábala del Bufón y el final de la partida. Abajo, siempre, el HUD del jugador.
import { AMULETO, AMULETOS, RAREZA_NOMBRE } from '../../rules/amuletos';
import { AUMENTO, AUMENTOS, NIVEL_NOMBRE } from '../../rules/aumentos';
import type { AmuletoId } from '../../rules/amuletos';
import { B } from '../../rules/balance';
import { CABALA, HUMOR_NOMBRE, detalleDe, humorDe, suerte } from '../../rules/bufon';
import { JUGADAS, PALOS, ordenar } from '../../rules/cartas';
import type { Carta, Jugada, Palo } from '../../rules/cartas';
import { carga, sirveA } from '../../rules/estado';
import type { ItemBotin, Nodo, Oferta, Partida } from '../../rules/estado';
import { COLUMNAS, PISOS } from '../../rules/mapa';
import { MAZO } from '../../rules/mazos';
import * as juego from '../../rules/partida';
import { ver } from '../../rules/perfil';
import { BENDICION, BENDICIONES, REY_DEF } from '../../rules/reyes';
import type { BendicionId } from '../../rules/reyes';
import { clavePieza } from '../../rules/notas';
import { alAzar, idioma, perfil, t, tx } from '../almacen';
import { sonar } from '../audio';
import { chispas, destello, haloRey, humo, lluviaDeMonedas, monedas, numero, partirNaipe } from '../fx/efectos';
import { teclear } from '../habla';
import { RAPIDO, pausa, quieto } from '../ritmo';
import { enFoto } from '../fx/motor';
import { avivarRetrato, cargaQue, hudHtml } from '../hud';
import { avanzar, guardar, irPortada, sesion, soltarPartida } from '../juego';
import type { Expresion } from '../pixel/bufon';
import { lienzoNaipe, cifra, pxAmuleto, pxAumento, pxBendicion, pxHud, pxInmune, pxMitades, pxNaipe, pxNaipeSegunda, pxNodo, pxPalo, pxPieza, urlRetrato } from '../sprites';
import { naipeMapa } from '../pixel/naipes';
import { personajeMapa } from '../pixel/personajes';
import { JUGADA_COMO, JUGADA_NOMBRE, NODO_DESC, NODO_NOMBRE, PALO_NOMBRE, PALO_PODER, TRAMO_NOMBRE } from '../textos';
import { VOZ } from '../voces';
import { bufonDice } from '../bufon-vivo';
import { $, abrirModal, anfitrion, bufonHtml, cerrarModal, esc, fichaDe, repintar, reyHtml, sinergiaHtml, tip, type Accion, type Pantalla } from '../ui';

const fijo = (): number | undefined => (enFoto() ? 0 : undefined);
const expresionDe = (p: Partida): Expresion => (p.afinidad <= -2 ? 'sombria' : p.afinidad >= 2 ? 'brillo' : 'reposo');

// ───────────────────────── lo común de la partida ─────────────────────────

/** El visor del Mazo: las cartas por palo. Con `elegir`, cada carta es un botón (purgar, templar). */
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
  const fila = (icono: string, nombre: string, clase: string, desc: string): string =>
    `<li class="pieza-fila" tabindex="0"><span class="pieza-icono">${icono}</span><div class="pieza-texto"><b>${esc(nombre)}</b><span class="sub">${esc(clase)}</span><p>${esc(desc)}</p></div></li>`;
  const vacio = `<li class="pieza-fila vacia"><p class="sub">${t('nada')}</p></li>`;
  const amuletos = p.amuletos.map((id) => fila(pxAmuleto(id), tx(AMULETO[id].nombre), tx(RAREZA_NOMBRE[AMULETO[id].rareza]), tx(AMULETO[id].desc)));
  const aumentos = p.aumentos.map((id) => fila(pxAumento(id), tx(AUMENTO[id].nombre), AUMENTO[id].maldicion ? t('maldicion') : tx(NIVEL_NOMBRE[AUMENTO[id].nivel]), tx(AUMENTO[id].desc)));
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
export type EntradaGlosario = 'multi' | 'furia' | 'escudo' | 'exacto' | 'alpelo' | 'racha' | 'segunda' | 'engano';
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
      return t('gAlPelo', { p: Math.round(B.exacto.alPelo * 100) });
    case 'racha':
      return t('gRacha', { lista: Array.from({ length: B.exacto.rachaTope }, (_, i) => `+${(i + 1) * B.exacto.multi}`).join(', ') });
    case 'segunda':
      return t('gSegunda');
    case 'engano':
      return t('gEngano', { n: B.mazos.mentiroso.enganos, f: B.mazos.mentiroso.furiaFallo });
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
      ? `<td class="n j-canto-celda" colspan="2"><span class="j-canto">${esc(t('alCantar', { x: c.x, c: canto }))}</span></td>`
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

const botonMenu = (): string => `<button class="btn marco chico" data-accion="menu" data-foco="menu" aria-label="${t('menu')}">≡ ${t('menu')}</button>`;

// ───────────────────────── el Mapa ─────────────────────────

export function pantallaMapa(p: Partida): Pantalla {
  const tramo = juego.tramoActual(p);
  const abiertos = juego.nodosAlcanzables(p).map((n) => n.id);
  const rey = REY_DEF[tramo.rey];
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
    const estado = n.id === p.pos ? 'actual' : p.camino.includes(n.id) ? 'hecho' : abiertos.includes(n.id) ? 'abierto' : 'lejos';
    const inmune = n.palos?.length ? t('inmuneA', { palo: n.palos.map((s) => tx(PALO_NOMBRE[s])).join(', ') }) : '';
    const nombre = n.tipo === 'rey' ? `${tx(rey.nombre)} · ${tx(rey.apodo)}` : tx(NODO_NOMBRE[n.tipo]);
    const desc = n.tipo === 'rey' ? `${tx(rey.rasgo)}: ${tx(rey.rasgoDesc)}` : tx(NODO_DESC[n.tipo]);
    return `<button class="nodo n-${n.tipo} ${estado}" style="left:${(nx * 100).toFixed(2)}%;top:${(ny * 100).toFixed(2)}%" data-accion="nodo" data-id="${n.id}" data-foco="nodo-${n.id}" ${estado === 'abierto' ? '' : 'aria-disabled="true"'} ${abiertos[0] === n.id ? 'data-inicio' : ''} aria-label="${esc(nombre)}" ${tip(nombre, desc, inmune)}>
      ${pxNodo(n.tipo)}
      ${n.palos?.length ? `<span class="nodo-palos">${n.palos.map((s) => pxInmune(s)).join('')}</span>` : ''}
      ${estado === 'actual' ? `<span class="nodo-aca chip">${t('vosAca')}</span>` : ''}
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
  const opcion = (id: string, i: number): string => {
    const f = fichaDe(oferta.tipo, id, p);
    const rey = oferta.tipo === 'bendicion' ? BENDICION[id as BendicionId].rey : null;
    return `<button class="opcion marco ${f.marco}" data-accion="elegir" data-id="${id}" data-foco="op-${i}" ${i === 0 ? 'data-inicio' : ''}>
      <span class="op-arte">${rey ? reyHtml(rey, 'calma') : ''}<span class="op-icono">${pxPieza(oferta.tipo, id)}</span></span>
      <span class="op-clase rotulo">${esc(f.clase)}</span>
      <b class="op-nombre">${esc(f.nombre)}</b>
      <span class="op-desc">${esc(f.desc)}</span>
      <span class="op-sinergia">${sinergiaHtml(oferta.tipo, id, p)}</span>
    </button>`;
  };
  return `<div class="oferta o-${oferta.tipo}" data-oferta="${oferta.tipo}">
      <h2 class="titulo oferta-titulo">${t(TITULO_OFERTA[oferta.tipo])}</h2>
      ${cabeza}
      <div class="opciones">${oferta.opciones.map(opcion).join('')}</div>
      <button class="btn marco chico" data-accion="saltar" data-foco="saltar">${t('saltar', { n: B.botin.saltar })}</button>
    </div>`;
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
  $('#capa')?.append(el);
  el.querySelectorAll('.opcion').forEach((b, i) => b.classList.toggle('caliente-foco', i % 2 === 0));
  setTimeout(() => el.remove(), 900);
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
          if (!juego.elegirOferta(p, indice, id, reemplaza)) return;
          sonar(oferta.tipo === 'bendicion' ? 'canto' : 'oro');
          cerrarModal();
          alTerminar();
          bufonDice(tx(alAzar(VOZ.elige)));
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
    () => undefined,
  );
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
    // la Vida máxima que da el Rey vencido: el corazón con su «+», y debajo, chico, por qué
    if (it.t === 'vidamax') return pieza(`${pxHud('vida')}<b class="bp-mas" aria-hidden="true">+</b>`, t('vidaMaxMas', { n: it.n }), `<span class="bp-pie">${t('vidaMaxPie')}</span>${cobrado}`, 'hecho cura vidamax');
    const icono = it.oferta.tipo === 'bendicion' ? pxNodo('rey') : it.oferta.tipo === 'amuleto' ? pxHud('candado') : pxNodo('cabala');
    return pieza(
      icono,
      t(NOMBRE_OFERTA[it.oferta.tipo]),
      it.hecho ? cobrado : `<button class="btn marco" data-accion="abrir" data-i="${i}" data-foco="botin-${i}" data-inicio>${t('elegir')}</button>`,
      `${it.hecho ? 'hecho' : 'pendiente'} ${it.oferta.tipo}`,
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
          <button class="btn marco ${pendiente() < 0 ? 'oro' : 'hierro'} grande" data-accion="seguir" data-foco="seguir" ${pendiente() < 0 ? 'data-inicio' : ''}>${t('seguir')}</button>
        </section>
      </div>
      ${hudHtml(p)}
    </main>`,
    alMontar: () => {
      avivarRetrato(p);
      if (directo && pendiente() >= 0) modalOferta(p, pendiente(), trasElegir);
      else if (!directo && !enFoto() && desdeMesa && !quieto()) {
        // recién ganado: el oro ya se cobró en la mesa; el panel brota al centro, muestra lo cobrado un instante y la
        // primera elección lo reemplaza (el panel se pliega y en su lugar se abre «ELEGÍ UNA»)
        const r = $('.botin-panel')?.getBoundingClientRect();
        if (r) lluviaDeMonedas(r.left, r.right, r.top - 30, 10);
        sonar('brota');
        if (pendiente() >= 0)
          void pausa(780).then(() => {
            if (p.botin !== botin || pendiente() < 0 || $('.velo')) return;
            $('#app main.botin')?.classList.add('pliega');
            void pausa(170).then(() => p.botin === botin && pendiente() >= 0 && !$('.velo') && modalOferta(p, pendiente(), trasElegir));
          });
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
      abrir: (el) => modalOferta(p, Number(el.dataset.i), trasElegir),
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
  return {
    nombre: 'pulperia',
    html: () => {
      const tienda = p.tienda!;
      const cura = Math.round(p.vidaMax * B.pulperia.curarPct);
      return `<main class="pantalla en-partida pulperia">
      <header class="cabecera"><h1 class="titulo">${t('pulperia')}</h1><div class="lado"><button class="btn marco oro" data-accion="salir" data-foco="salir">${t('salir')} ›</button></div></header>
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
        </div>
      </div>
      ${hudHtml(p)}
    </main>`;
    },
    alMontar: () => avivarRetrato(p),
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
          if (!juego.comprar(p, i, reemplaza)) return;
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
  let brasas = 0;
  const FUEGO = ['#ffffff', '#ffd500', '#ff7b00', '#7a0026'];
  const centroDe = (sel: string): { x: number; y: number; r: DOMRect } | null => {
    const r = $(sel)?.getBoundingClientRect();
    return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2, r } : null;
  };
  /** El naipe recién templado: un fogonazo y su «+4» que sube. */
  const fogonazo = (): void => {
    const c = centroDe('.fuego-carta');
    if (!c || quieto()) return;
    destello(c.x, c.y, FUEGO, 22);
    chispas(c.x, c.y, FUEGO, 16, 90, -40);
    numero(`+${B.fogon.temple}`, c.x, c.y - c.r.height * 0.4, 'oro', 2);
  };
  /** La segunda opción del Fogón: templar un naipe; el naipe que ya está en el fuego (¿otra pasada?); o su ceniza. */
  const fuegoHtml = (): string => {
    const enFuego = p.fogonCarta ? p.mazo.find((k) => k.id === p.fogonCarta) : null;
    if (seQuemo) return `<div class="opcion marco hierro fuego"><span class="op-icono grande">${pxNodo('fogon')}</span><b class="op-nombre">${t('quemada')}</b></div>`;
    if (enFuego)
      return `<div class="opcion marco hierro fuego">
        <span class="fuego-carta">${pxNaipe(enFuego)}${`<span class="c-temple">+${enFuego.temple}${enFuego.templada ? '★' : ''}${enFuego.brava ? ' ×2' : ''}</span>`}</span>
        <b class="op-nombre">${enFuego.brava ? t('forjada') : enFuego.templada ? t('templadaMulti', { n: enFuego.temple ?? 0, m: B.fogon.multiTemplada }) : t('templada', { n: enFuego.temple ?? 0 })}</b>
        ${juego.puedeArrimar(p) ? `<button class="btn marco ${(p.fogonPasadas ?? 0) >= 2 ? 'oro' : 'prisma'} chico" data-accion="arrimar" data-foco="arrimar">${(p.fogonPasadas ?? 0) >= 2 ? t('forjaBrava') : t('arrimar')}</button><span class="op-desc">${(p.fogonPasadas ?? 0) >= 2 ? t('riesgoBrava', { p: Math.round(B.fogon.riesgos[2] * 100) }) : t('riesgo', { n: B.fogon.temple, m: B.fogon.multiTemplada, p: Math.round(B.fogon.riesgos[1] * 100) })}</span>` : ''}
      </div>`;
    // (con la Vida llena, DESCANSAR está apagado: el foco inicial pasa a TEMPLAR)
    return `<button class="opcion marco hierro" data-accion="templar" data-foco="templar" ${!p.fogonHecho && p.vida >= p.vidaMax ? 'data-inicio' : ''} ${p.fogonHecho ? 'disabled' : ''}>
      <span class="op-icono grande">${pxHud('furia')}</span><b class="op-nombre">${t('templar')}</b><span class="op-desc">${t('templarDesc', { n: B.fogon.temple })}</span>
    </button>`;
  };
  return {
    nombre: 'fogon',
    html: () => `<main class="pantalla en-partida fogon">
      <header class="cabecera"><h1 class="titulo">${t('fogon')}</h1><div class="lado">${botonMenu()}</div></header>
      <div class="cuerpo">
        ${anfitrion(tx(alAzar(VOZ.fogon, fijo())), 'reposo')}
        <div class="opciones">
          <button class="opcion marco paloH" data-accion="descansar" data-foco="descansar" ${p.vida >= p.vidaMax ? '' : 'data-inicio'} ${p.fogonHecho || p.vida >= p.vidaMax ? 'disabled' : ''}>
            <span class="op-icono grande">${pxNodo('fogon')}</span><b class="op-nombre">${t('descansar')}</b><span class="op-desc">${p.vida >= p.vidaMax ? t('vidaLlena') : t('descansarDesc', { n: cura })}</span>
          </button>
          ${fuegoHtml()}
        </div>
        <button class="btn marco ${p.fogonHecho ? 'oro' : 'hierro'} grande" data-accion="seguir" data-foco="seguir">${t('seguir')}</button>
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
    alSalir: () => clearInterval(brasas),
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
      arrimar: async () => {
        const carta = p.fogonCarta ? p.mazo.find((k) => k.id === p.fogonCarta) : null;
        if (ocupado || !carta) return;
        ocupado = true;
        // el suspenso: el naipe tiembla sobre las llamas mientras sube el chisporroteo
        const el = $('.fuego-carta');
        el?.classList.add('al-fuego');
        $<HTMLButtonElement>('[data-accion="arrimar"]')?.setAttribute('disabled', '');
        sonar('suspenso');
        await pausa(820);
        const rect = el?.getBoundingClientRect();
        const r = juego.templar(p, carta.id);
        if (r === 'quemada') {
          seQuemo = true;
          sonar('ceniza');
          if (rect && !quieto()) {
            // el naipe se parte en brasas y se va en humo
            partirNaipe(lienzoNaipe(carta.palo as Exclude<typeof carta.palo, 'X'>, carta.n), rect, FUEGO);
            humo(rect.left + rect.width / 2, rect.top + rect.height / 2, rect.width * 0.7);
            el?.classList.add('ceniza');
            await pausa(520);
          }
        } else if (r === 'templada') sonar('canto');
        guardar();
        repintar();
        ocupado = false;
        if (r === 'templada') fogonazo();
        if (r) bufonDice(tx(alAzar(r === 'quemada' ? VOZ.quema : VOZ.templa)));
      },
      seguir: () => {
        juego.salir(p);
        avanzar();
      },
    },
  };
}

// ───────────────────────── la Cábala del Bufón ─────────────────────────

export function pantallaCabala(p: Partida): Pantalla {
  const def = CABALA[p.cabala!.id];
  const pct = Math.round(suerte(p) * (def.humor === 'garca' ? 0.5 : 1) * 100);
  return {
    nombre: 'cabala',
    html: () => {
      const r = p.cabala?.resultado;
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
    alMontar: () => avivarRetrato(p),
    acciones: {
      ...accionesComunes(p),
      opcion: (el) => {
        if (juego.responderCabala(p, el.dataset.id!)) {
          sonar(p.cabala?.resultado?.bueno ? 'oro' : 'error');
          guardar();
          repintar();
        }
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
export function pantallaFin(p: Partida): Pantalla {
  const gano = !!p.fin?.victoria;
  const s = p.stats;
  const dato = (rotulo: string, valor: number) => `<div class="fin-dato"><span class="rotulo">${rotulo}</span>${cifra(valor, 'hueso', 'grande')}</div>`;
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
  return {
    nombre: gano ? 'fin-victoria' : 'fin-derrota',
    atras: soltarPartida,
    html: () => `<main class="pantalla fin ${gano ? 'gano' : 'perdio'}">
      <div class="cuerpo fin-escena">
        <h1 class="titulo fin-titulo">${t(gano ? 'victoria' : 'derrota')}</h1>
        <div class="fin-cuadro">
          ${anfitrion(tx(alAzar(gano ? VOZ.gano : VOZ.perdio, fijo())), gano ? 'risa' : 'sombria', 'fin-bufon')}
          ${heroe}
          <section class="panel fin-panel">
            <div class="fin-datos">${dato(t('reyesVencidos'), s.reyes)}${dato(t('abatidos'), s.abatidos)}${dato(t('mejorGolpe'), s.mejorGolpe)}${dato(t('exactos'), s.exactos)}${dato(t('cantos'), s.cantos)}${dato(t('turnos'), s.turnos + s.combates)}</div>
            <p class="fin-porotos dorado">${pxHud('poroto')} ${t('ganaste', { n: p.fin?.porotos ?? 0 })}</p>
            ${sesion.abiertos.map((m) => `<p class="chip sinergia">${t('seAbrio', { m: tx(MAZO[m].nombre) })}</p>`).join('')}
            ${sesion.reinadoAbierto ? `<p class="chip sinergia">${t('reinadoAbierto', { n: sesion.reinadoAbierto })}</p>` : ''}
          </section>
          <div class="fin-corte">${reyes.map((r, i) => naipeRey(r.palo, i)).join('')}</div>
        </div>
        <div class="fila fin-botones">
          <button class="btn marco oro grande" data-accion="otra" data-foco="otra" data-inicio>${t('otraVez')}</button>
          <button class="btn marco" data-accion="altar" data-foco="altar">${t('altar')}</button>
          <button class="btn marco" data-accion="portada" data-foco="portada">${t('portada')}</button>
        </div>
      </div>
    </main>`,
    alMontar: () => {
      sonar(gano ? 'victoria' : 'derrota');
      if (gano && !enFoto()) lluviaDeMonedas(0, innerWidth, -10, 60);
    },
    acciones: {
      otra: () => {
        sesion.partida = null;
        void import('../juego').then((j) => j.irMazo());
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
