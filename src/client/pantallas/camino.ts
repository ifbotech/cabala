// Las pantallas del camino, todas atendidas por el Bufón: el Mapa ramificado, el Botín y su «ELEGÍ UNA», la
// Pulpería, el Fogón, la Cábala del Bufón y el final de la partida. Abajo, siempre, el HUD del jugador.
import { AMULETO, RAREZA_NOMBRE } from '../../rules/amuletos';
import { AUMENTO, NIVEL_NOMBRE } from '../../rules/aumentos';
import type { AmuletoId } from '../../rules/amuletos';
import { B } from '../../rules/balance';
import { CABALA, HUMOR_NOMBRE, humorDe, suerte } from '../../rules/bufon';
import { JUGADAS, PALOS, ordenar } from '../../rules/cartas';
import type { Carta, Jugada, Palo } from '../../rules/cartas';
import { carga, sirveA } from '../../rules/estado';
import type { ItemBotin, Nodo, Oferta, Partida } from '../../rules/estado';
import { COLUMNAS, PISOS } from '../../rules/mapa';
import { MAZO } from '../../rules/mazos';
import * as juego from '../../rules/partida';
import { ver } from '../../rules/perfil';
import { BENDICION, REY_DEF } from '../../rules/reyes';
import type { BendicionId } from '../../rules/reyes';
import { clavePieza } from '../../rules/notas';
import { alAzar, idioma, perfil, t, tx } from '../almacen';
import { sonar } from '../audio';
import { haloRey, lluviaDeMonedas } from '../fx/efectos';
import { enFoto } from '../fx/motor';
import { avivarRetrato, hudHtml } from '../hud';
import { avanzar, guardar, irPortada, sesion, soltarPartida } from '../juego';
import type { Expresion } from '../pixel/bufon';
import { cifra, pxAmuleto, pxAumento, pxBendicion, pxHud, pxNaipe, pxNodo, pxPalo, pxPieza, urlRetrato } from '../sprites';
import { JUGADA_COMO, JUGADA_NOMBRE, NODO_DESC, NODO_NOMBRE, PALO_NOMBRE, PALO_PODER, TRAMO_NOMBRE } from '../textos';
import { VOZ } from '../voces';
import { bufonDice } from '../bufon-vivo';
import { $, abrirModal, anfitrion, bufonHtml, cerrarModal, esc, fichaDe, repintar, reyHtml, sinergiaHtml, tip, type Accion, type Pantalla } from '../ui';

const fijo = (): number | undefined => (enFoto() ? 0 : undefined);
const expresionDe = (p: Partida): Expresion => (p.afinidad <= -2 ? 'sombria' : p.afinidad >= 2 ? 'brillo' : 'reposo');

// ───────────────────────── lo común de la partida ─────────────────────────

/** El visor del Mazo: las cartas por palo. Con `elegir`, cada carta es un botón (purgar, quemar). */
export function modalMazo(p: Partida, titulo: string, elegir?: (id: string) => void, cartas: readonly Carta[] = p.mazo): void {
  const grupos = (['S', 'C', 'D', 'H', 'X'] as const).map((s) => ordenar(cartas.filter((c) => c.palo === s))).filter((g) => g.length);
  const html = `<div class="panel visor">
    <header class="cabecera"><h2 class="titulo">${esc(titulo)}</h2><button class="btn marco chico" data-accion="cerrar" data-inicio>${t('cerrar')}</button></header>
    <div class="visor-cartas">${grupos
      .map(
        (g) =>
          `<div class="visor-fila">${g
            .map((c) => (elegir ? `<button class="visor-carta" data-accion="carta" data-id="${c.id}" ${juego.purgable(p, c.id) ? '' : 'disabled'}>${pxNaipe(c)}</button>` : `<span class="visor-carta">${pxNaipe(c)}</span>`))
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
    `<li class="pieza-fila"><span class="pieza-icono">${icono}</span><div class="pieza-texto"><b>${esc(nombre)}</b><span class="sub">${esc(clase)}</span><p>${esc(desc)}</p></div></li>`;
  const vacio = `<li class="pieza-fila vacia"><p class="sub">${t('nada')}</p></li>`;
  const amuletos = p.amuletos.map((id) => fila(pxAmuleto(id), tx(AMULETO[id].nombre), tx(RAREZA_NOMBRE[AMULETO[id].rareza]), tx(AMULETO[id].desc)));
  const aumentos = p.aumentos.map((id) => fila(pxAumento(id), tx(AUMENTO[id].nombre), AUMENTO[id].maldicion ? t('maldicion') : tx(NIVEL_NOMBRE[AUMENTO[id].nivel]), tx(AUMENTO[id].desc)));
  const cargas = PALOS.filter((s) => sirveA(p, s)).map((s) => fila(pxPalo(s), `${tx(REY_DEF[s].carga)} ${carga(p, s)}`, tx(REY_DEF[s].apodo), tx(REY_DEF[s].cargaDa)));
  const bendiciones = (Object.keys(p.bendiciones) as BendicionId[]).map((id) => {
    const d = BENDICION[id];
    const n = p.bendiciones[id] ?? 1;
    return fila(pxBendicion(id), tx(d.nombre), `${tx(REY_DEF[d.rey].apodo)}${d.dual ? ` + ${tx(REY_DEF[d.dual].apodo)}` : ''}${d.niveles > 1 ? ` · ${t('nivel', { n })}` : ''}`, tx(d.desc(n)));
  });
  const bloque = (titulo: string, filas: string[]): string => `<h3 class="rotulo">${esc(titulo)}</h3><ul class="pieza-lista">${filas.length ? filas.join('') : vacio}</ul>`;
  abrirModal(
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
}

/** La tabla de JUGADAS: lo que vale cada una, lo que hace cada palo y las dos reglas que más se preguntan. */
export function modalJugadas(p: Partida, actual?: Jugada | null): void {
  const propias: Jugada[] = p.mazoId === 'escoba' ? ['quince'] : p.mazoId === 'truco' ? ['envido'] : [];
  const filas = [...JUGADAS, ...propias]
    .map((j) => `<tr class="${j === actual ? 'actual' : ''}"><th scope="row">${esc(tx(JUGADA_NOMBRE[j]))}</th><td>${esc(tx(JUGADA_COMO[j]))}</td><td class="n">${cifra(`+${B.jugadas[j].d}`, 'roja')}</td><td class="n">${cifra(`x${B.jugadas[j].m}`, 'azul')}</td></tr>`)
    .join('');
  const palos = PALOS.map((s) => `<li>${pxPalo(s)}<b>${esc(tx(PALO_NOMBRE[s]))}</b><span>${esc(tx(PALO_PODER[s]))}</span></li>`).join('');
  abrirModal(
    `<div class="panel jugadas">
      <header class="cabecera"><h2 class="titulo">${t('jugadas')}</h2><button class="btn marco chico" data-accion="cerrar" data-inicio>${t('cerrar')}</button></header>
      <div class="jugadas-cuerpo rollo">
        <table class="jugadas-tabla">
          <thead><tr><th scope="col">${t('jugada')}</th><th scope="col">${t('cartas')}</th><th scope="col" class="n">${t('dano')}</th><th scope="col" class="n">${t('multi')}</th></tr></thead>
          <tbody>${filas}</tbody>
        </table>
        <div class="jugadas-lado">
          <h3 class="rotulo">${t('palos')}</h3>
          <ul class="palos-lista">${palos}</ul>
          <p class="regla">${esc(t('inmuneRegla'))}</p>
          <p class="regla">${esc(t('comodinRegla'))}</p>
          <p class="regla canto-regla"><b>${esc(tx(MAZO[p.mazoId].canto))}</b> ${esc(tx(MAZO[p.mazoId].regla))}</p>
        </div>
      </div>
    </div>`,
    { cerrar: () => cerrarModal() },
  );
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
  const corrimiento = (id: string): [number, number] => {
    let h = 2166136261;
    for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
    return [(((h >>> 0) % 1000) / 1000 - 0.5) * 0.16, (((h >>> 10) % 1000) / 1000 - 0.5) * 0.24];
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
      ${n.palos?.length ? `<span class="nodo-palos">${n.palos.map((s) => pxPalo(s)).join('')}</span>` : ''}
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
        return `<line x1="${(x1 * 1000).toFixed(0)}" y1="${(y1 * 1000).toFixed(0)}" x2="${(x2 * 1000).toFixed(0)}" y2="${(y2 * 1000).toFixed(0)}" class="${hecho ? 'hecho' : vivo ? 'vivo' : ''}"/>`;
      }),
    );
    return `<svg class="mapa-lineas" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">${trazos.join('')}</svg>`;
  };
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
      nodo: (el) => {
        const id = el.dataset.id!;
        if (!abiertos.includes(id)) return;
        const n = tramo.nodos.find((x) => x.id === id)!;
        if (n.tipo === 'rey') ver(perfil, `r:${tramo.rey}`);
        sonar(n.tipo === 'rey' ? 'rey' : 'clic');
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
function modalOferta(p: Partida, indice: number, alTerminar: () => void): void {
  const item = p.botin!.items[indice] as Extract<ItemBotin, { t: 'oferta' }>;
  const oferta: Oferta = item.oferta;
  for (const id of oferta.opciones) ver(perfil, clavePieza(oferta.tipo, id));
  const reyes = oferta.tipo === 'bendicion' ? oferta.opciones.map((id) => BENDICION[id as BendicionId].rey) : [];
  for (const r of reyes) ver(perfil, `r:${r}`);
  const habla = reyes[0];
  const cabeza =
    oferta.tipo === 'bendicion' && habla
      ? `<p class="bocadillo sin-cola oferta-voz"><b>${esc(tx(REY_DEF[habla].apodo))}:</b> ${esc(tx(alAzar(REY_DEF[habla].voz.ofrece, fijo())))}</p>`
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
  const velo = abrirModal(
    `<div class="oferta o-${oferta.tipo}" data-oferta="${oferta.tipo}">
      <h2 class="titulo oferta-titulo">${t(TITULO_OFERTA[oferta.tipo])}</h2>
      ${cabeza}
      <div class="opciones">${oferta.opciones.map(opcion).join('')}</div>
      <button class="btn marco chico" data-accion="saltar" data-foco="saltar">${t('saltar', { n: B.botin.saltar })}</button>
    </div>`,
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

export function pantallaBotin(p: Partida): Pantalla {
  const botin = p.botin!;
  const directo = botin.de === 'inicio' || botin.de === 'cabala';
  const pendiente = () => botin.items.findIndex((i) => i.t === 'oferta' && !i.hecho);
  const cerrarBotin = () => {
    juego.seguir(p);
    avanzar();
  };
  const trasElegir = () => {
    guardar();
    if (directo && pendiente() < 0) cerrarBotin();
    else repintar();
  };
  const fila = (it: ItemBotin, i: number): string => {
    if (it.t === 'oro') return `<div class="botin-fila hecho">${pxHud('oro')}<b>${t('oroMas', { n: it.n })}</b><span class="verde">✓</span></div>`;
    if (it.t === 'cura') return `<div class="botin-fila hecho">${pxHud('vida')}<b>${t('vidaMas', { n: it.n })}</b><span class="verde">✓</span></div>`;
    const icono = it.oferta.tipo === 'bendicion' ? pxNodo('rey') : it.oferta.tipo === 'amuleto' ? pxHud('candado') : pxNodo('cabala');
    return `<div class="botin-fila ${it.hecho ? 'hecho' : ''}">${icono}<b>${t(NOMBRE_OFERTA[it.oferta.tipo])}</b>${
      it.hecho ? `<span class="verde">✓</span>` : `<button class="btn marco oro" data-accion="abrir" data-i="${i}" data-foco="botin-${i}" data-inicio>${t('elegir')}</button>`
    }</div>`;
  };
  return {
    nombre: directo ? 'elegi-una' : 'botin',
    html: () =>
      directo
        ? `<main class="pantalla en-partida botin directo"><div class="crece"></div>${hudHtml(p)}</main>`
        : `<main class="pantalla en-partida botin">
      <div class="cuerpo">
        ${anfitrion(tx(alAzar(VOZ.botin, fijo())), 'risa')}
        <section class="panel botin-panel">
          <h1 class="titulo">${t('botin')}</h1>
          <div class="botin-lista">${botin.items.map(fila).join('')}</div>
          <button class="btn marco ${pendiente() < 0 ? 'oro' : ''} grande" data-accion="seguir" data-foco="seguir" ${pendiente() < 0 ? 'data-inicio' : ''}>${t('seguir')}</button>
        </section>
      </div>
      ${hudHtml(p)}
    </main>`,
    alMontar: () => {
      avivarRetrato(p);
      if (directo && pendiente() >= 0) modalOferta(p, pendiente(), trasElegir);
      else if (!directo && !enFoto() && botin.items.some((i) => i.t === 'oro')) {
        const r = $('.botin-panel')?.getBoundingClientRect();
        if (r) lluviaDeMonedas(r.left, r.right, r.top - 40);
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
            <h2 class="rotulo">${t('amuletos')} · ${t('huecos', { a: p.amuletos.length, b: p.huecos })}</h2>
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
  return {
    nombre: 'fogon',
    html: () => `<main class="pantalla en-partida fogon">
      <header class="cabecera"><h1 class="titulo">${t('fogon')}</h1><div class="lado">${botonMenu()}</div></header>
      <div class="cuerpo">
        ${anfitrion(tx(alAzar(VOZ.fogon, fijo())), 'reposo')}
        <div class="opciones">
          <button class="opcion marco paloH" data-accion="descansar" data-foco="descansar" data-inicio ${p.fogonHecho ? 'disabled' : ''}>
            <span class="op-icono grande">${pxNodo('fogon')}</span><b class="op-nombre">${t('descansar')}</b><span class="op-desc">${t('descansarDesc', { n: cura })}</span>
          </button>
          <button class="opcion marco hierro" data-accion="quemar" data-foco="quemar" ${p.fogonHecho || p.mazo.length <= B.jugador.mazoMin ? 'disabled' : ''}>
            <span class="op-icono grande">${pxHud('descarte')}</span><b class="op-nombre">${t('quemar')}</b><span class="op-desc">${t('quemarDesc')}</span>
          </button>
        </div>
        <button class="btn marco ${p.fogonHecho ? 'oro' : ''} grande" data-accion="seguir" data-foco="seguir">${t('seguir')}</button>
      </div>
      ${hudHtml(p)}
    </main>`,
    alMontar: () => avivarRetrato(p),
    acciones: {
      ...accionesComunes(p),
      descansar: () => {
        const hecho = juego.descansar(p);
        if (hecho) sonar('cura');
        guardar();
        repintar();
        if (hecho) bufonDice(tx(alAzar(VOZ.descansa)));
      },
      quemar: () =>
        modalMazo(p, t('elegiPurga'), (id) => {
          const hecho = juego.quemar(p, id);
          if (hecho) sonar('cae');
          guardar();
          repintar();
          if (hecho) bufonDice(tx(alAzar(VOZ.quema)));
        }),
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
                    <b class="op-nombre">${esc(tx(o.texto))}</b><span class="op-desc">${esc(tx(o.detalle))}</span>${o.aSuerte ? `<span class="chip canto">${pxHud('dado5')} ${t('aSuerte', { p: pct })}</span>` : ''}
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

export function pantallaFin(p: Partida): Pantalla {
  const gano = !!p.fin?.victoria;
  const s = p.stats;
  const dato = (rotulo: string, valor: number) => `<div class="fin-dato"><span class="rotulo">${rotulo}</span>${cifra(valor, 'hueso', 'grande')}</div>`;
  const reyes = p.tramos.map((tr, i) => ({ palo: tr.rey as Palo, vencido: i < s.reyes }));
  void PALOS;
  return {
    nombre: gano ? 'fin-victoria' : 'fin-derrota',
    atras: soltarPartida,
    html: () => `<main class="pantalla fin ${gano ? 'gano' : 'perdio'}">
      <div class="cuerpo">
        <h1 class="titulo fin-titulo">${t(gano ? 'victoria' : 'derrota')}</h1>
        <div class="fin-arriba">
          <i class="fin-cara" style="background-image:url(${urlRetrato(p.mazoId, { mirada: 0, gesto: gano ? 'feroz' : 'caido', herida: gano ? 0 : 2 })})"></i>
          <div class="fin-reyes">${reyes.map((r) => reyHtml(r.palo, r.vencido ? 'vencido' : 'calma')).join('')}</div>
        </div>
        ${anfitrion(tx(alAzar(gano ? VOZ.gano : VOZ.perdio, fijo())), gano ? 'risa' : 'sombria', 'fin-bufon')}
        <section class="panel fin-panel">
          <div class="fin-datos">${dato(t('reyesVencidos'), s.reyes)}${dato(t('abatidos'), s.abatidos)}${dato(t('mejorGolpe'), s.mejorGolpe)}${dato(t('exactos'), s.exactos)}${dato(t('cantos'), s.cantos)}${dato(t('turnos'), s.turnos + s.combates)}</div>
          <p class="fin-porotos dorado">${pxHud('poroto')} ${t('ganaste', { n: p.fin?.porotos ?? 0 })}</p>
          ${sesion.abiertos.map((m) => `<p class="chip sinergia">${t('seAbrio', { m: tx(MAZO[m].nombre) })}</p>`).join('')}
          ${sesion.reinadoAbierto ? `<p class="chip sinergia">${t('reinadoAbierto', { n: sesion.reinadoAbierto })}</p>` : ''}
        </section>
        <div class="fila">
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
