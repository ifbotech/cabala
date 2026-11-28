// Las pantallas del camino en CÁBALA 2.0 (MVP): Botín, Pulpería y Fin, más los modales de Mazo, Piezas y Jugadas.
import { AMULETO, RAREZA_NOMBRE } from '../../rules/amuletos';
import type { AmuletoId } from '../../rules/amuletos';
import { B } from '../../rules/balance';
import { JUGADAS, JUGADAS_MAZO, PALOS, esComodin, ordenar } from '../../rules/cartas';
import type { Carta, Jugada, Palo } from '../../rules/cartas';
import { carga, sirveA } from '../../rules/estado';
import type { ItemBotin, Oferta, Partida } from '../../rules/estado';
import { MAZO } from '../../rules/mazos';
import * as juego from '../../rules/partida';
import { ver } from '../../rules/perfil';
import { BENDICION, REY_DEF } from '../../rules/reyes';
import type { BendicionId } from '../../rules/reyes';
import { clavePieza } from '../../rules/notas';
import { resumenDe, type ResumenPartida } from '../../rules/resumen';
import { ajustes, alAzar, guardarAjustes, idioma, perfil, t, tx } from '../almacen';
import { refrescarSonido, sonar } from '../audio';
import { refrescarMusica } from '../musica';
import { haloRey, lluviaDeMonedas } from '../fx/efectos';
import { teclear } from '../habla';
import { quieto } from '../ritmo';
import { enFoto } from '../fx/motor';
import { avivarRetrato, cargaQue, hudHtml } from '../hud';
import { avanzar, empezar, guardar, sesion, soltarPartida } from '../juego';
import type { Expresion } from '../pixel/bufon';
import { personajeMapa } from '../pixel/personajes';
import { cifra, pxAmuleto, pxBendicion, pxHud, pxMitades, pxNaipe, pxNodo, pxPalo, urlRetrato } from '../sprites';
import { JUGADA_COMO, JUGADA_NOMBRE, PALO_NOMBRE, PALO_PODER, PASO_AYUDA, PASO_NOMBRE, RANGO_NOMBRE } from '../textos';
import { VOZ } from '../voces';
import { bufonDice } from '../bufon-vivo';
import { glifo } from '../nav';
import { $, abrirModal, anfitrion, bufonHtml, cerrarModal, conMaldicion, esc, fichaDe, irASalida, repintar, reyHtml, sinergiaHtml, tip, type Accion, type Pantalla } from '../ui';
import { fichaIc } from '../chips';

const fijo = (): number | undefined => (enFoto() ? 0 : undefined);

// ───────────────────────── modales de la partida ─────────────────────────

/** El visor del Mazo: las cartas por palo. Con `elegir`, cada carta es un botón para purgar. */
export function modalMazo(p: Partida, titulo: string, elegir?: (id: string) => void, cartas: readonly Carta[] = p.mazo, cualquiera = false): void {
  const cara = (c: Carta): string => pxNaipe(c) + (c.bonus ? `<span class="c-bonus">+${c.bonus}</span>` : '');
  const grupos = (['S', 'C', 'D', 'H', 'X'] as const).map((s) => ordenar(cartas.filter((c) => c.palo === s))).filter((g) => g.length);
  const html = `<div class="panel visor">
    <header class="cabecera"><h2 class="titulo">${esc(titulo)}</h2><button class="btn marco chico" data-accion="cerrar" data-inicio>${t('cerrar')}</button></header>
    <div class="visor-cartas">${grupos
      .map(
        (g) =>
          `<div class="visor-fila">${g
            .map((c) => (elegir ? `<button class="visor-carta" data-accion="carta" data-id="${c.id}" ${cualquiera ? (c.palo !== 'X' ? '' : 'disabled') : juego.purgable(p, c.id) ? '' : 'disabled'}>${cara(c)}</button>` : `<span class="visor-carta">${cara(c)}</span>`))
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

/** «LO QUE LLEVÁS»: Cábalas (Amuletos), Cargas y Bendiciones con su texto entero. */
export function modalPiezas(p: Partida): void {
  const fila = (icono: string, nombre: string, clase: string, desc: string, marco = ''): string =>
    `<li class="pieza-fila" tabindex="0"><span class="pieza-icono${marco ? ` marco ${marco}` : ''}">${icono}</span><div class="pieza-texto"><b>${esc(nombre)}</b><span class="sub">${esc(clase)}</span><p>${conMaldicion(desc)}</p></div></li>`;
  const vacio = `<li class="pieza-fila vacia"><p class="sub">${t('nada')}</p></li>`;
  const amuletos = p.amuletos.map((id) => fila(pxAmuleto(id), tx(AMULETO[id].nombre), tx(RAREZA_NOMBRE[AMULETO[id].rareza]), tx(AMULETO[id].desc)));
  const cargas = PALOS.filter((s) => sirveA(p, s)).map((s) => fila(pxPalo(s), cargaQue(p, s), tx(REY_DEF[s].apodo), tx(REY_DEF[s].cargaDa)));
  const bendiciones = (Object.keys(p.bendiciones) as BendicionId[]).map((id) => {
    const d = BENDICION[id];
    const n = p.bendiciones[id] ?? 1;
    return fila(pxBendicion(id), tx(d.nombre), tx(REY_DEF[d.rey].apodo), tx(d.desc(n)));
  });
  const bloque = (titulo: string, filas: string[]): string => `<h3 class="rotulo">${esc(titulo)}</h3><ul class="pieza-lista">${filas.length ? filas.join('') : vacio}</ul>`;
  const velo = abrirModal(
    `<div class="panel piezas">
      <header class="cabecera"><h2 class="titulo">${t('llevas')}</h2><button class="btn marco chico" data-accion="cerrar" data-inicio>${t('cerrar')}</button></header>
      <div class="piezas-cuerpo rollo">
        ${bloque(`${t('amuletos')} · ${t('avance', { a: p.amuletos.length, b: p.huecos })}`, amuletos)}
        ${bloque(`${t('bendiciones')} · ${t('cargas')}`, [...cargas, ...bendiciones])}
      </div>
    </div>`,
    { cerrar: () => cerrarModal() },
  );
  avisarRollo(velo);
}

function avisarRollo(velo: HTMLElement): void {
  const rollo = velo.querySelector<HTMLElement>('.rollo');
  const panel = velo.querySelector<HTMLElement>('.panel');
  if (!rollo || !panel) return;
  panel.dataset.hayMas = t('hayMas').toUpperCase();
  const mirar = (): void => void panel.classList.toggle('hay-mas', rollo.scrollHeight - rollo.scrollTop - rollo.clientHeight > 8);
  rollo.addEventListener('scroll', mirar, { passive: true });
  mirar();
  requestAnimationFrame(mirar);
}

/** Glosario compacto de palabras clave de la mesa. */
export type EntradaGlosario = 'multi' | 'furia' | 'escudo' | 'exacto' | 'alpelo' | 'racha' | 'segunda' | 'engano' | 'mano' | 'cantos' | 'paloypalo' | 'filodorado' | 'taba';
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
      return (B.exacto as { oroAlPelo?: number }).oroAlPelo ? t('gAlPeloOro', { p: Math.round(B.exacto.alPelo * 100), o: (B.exacto as { oroAlPelo?: number }).oroAlPelo ?? 0 }) : t('gAlPelo', { p: Math.round(B.exacto.alPelo * 100) });
    case 'racha':
      return t('gRacha', { lista: Array.from({ length: B.exacto.rachaTope }, (_, i) => `+${(i + 1) * B.exacto.multi}`).join(', ') });
    case 'segunda':
      return t('gSegunda');
    case 'engano':
      return t('gEngano', { n: B.mazos.mentiroso.enganos, f: B.mazos.mentiroso.furiaFallo });
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
  { e: 'mano', nombre: () => tx(PASO_NOMBRE.mano) },
  { e: 'cantos', nombre: () => tx(PASO_NOMBRE.cantos) },
];

function cantoEnJugada(p: Partida, j: Jugada): string {
  const m = p.mazoId;
  if (m === 'escoba' && j === 'quince') return t('cantos');
  if (m === 'chancho' && j === 'poker') return t('cantos');
  if (m === 'truco' && j === 'envido') return t('cantos');
  return '';
}

const EJEMPLO_JUGADA: Record<Jugada, readonly Carta[]> = {
  sola: [{ id: 'j0', palo: 'S', n: 7 }],
  par: [{ id: 'j1', palo: 'S', n: 5 }, { id: 'j2', palo: 'D', n: 5 }],
  doblepar: [{ id: 'j3', palo: 'S', n: 4 }, { id: 'j4', palo: 'C', n: 4 }, { id: 'j5', palo: 'H', n: 6 }, { id: 'j6', palo: 'D', n: 6 }],
  pierna: [{ id: 'j7', palo: 'C', n: 7 }, { id: 'j8', palo: 'D', n: 7 }, { id: 'j9', palo: 'H', n: 7 }],
  envido: [{ id: 'j10', palo: 'S', n: 7 }, { id: 'j11', palo: 'S', n: 6 }],
  flor: [{ id: 'j12', palo: 'D', n: 2 }, { id: 'j13', palo: 'D', n: 5 }, { id: 'j14', palo: 'D', n: 9 }],
  escalera: [{ id: 'j15', palo: 'S', n: 3 }, { id: 'j16', palo: 'C', n: 4 }, { id: 'j17', palo: 'D', n: 5 }],
  quince: [{ id: 'j18', palo: 'C', n: 7 }, { id: 'j19', palo: 'H', n: 8 }],
  full: [{ id: 'j22', palo: 'S', n: 4 }, { id: 'j23', palo: 'D', n: 4 }, { id: 'j24', palo: 'C', n: 4 }, { id: 'j25', palo: 'H', n: 9 }, { id: 'j26', palo: 'S', n: 9 }],
  poker: [{ id: 'j27', palo: 'S', n: 1 }, { id: 'j28', palo: 'C', n: 1 }, { id: 'j29', palo: 'D', n: 1 }, { id: 'j30', palo: 'H', n: 1 }],
  escalerapalo: [{ id: 'j31', palo: 'H', n: 5 }, { id: 'j32', palo: 'H', n: 6 }, { id: 'j33', palo: 'H', n: 7 }],
};

export function modalJugadas(p: Partida): void {
  const mazoJ = JUGADAS_MAZO[p.mazoId];
  const lista = mazoJ ? [...JUGADAS, mazoJ] : [...JUGADAS];
  const multiDe = (j: Jugada): number => (B.jugadas as Record<string, { m: number }>)[j]?.m ?? 2;
  const filas = lista
    .sort((a, b) => multiDe(b) - multiDe(a))
    .map((j) => {
      const canto = cantoEnJugada(p, j);
      const mini = EJEMPLO_JUGADA[j].map((c) => pxNaipe(c, 'mini')).join('');
      return `<li class="jugada-fila" tabindex="0"><span class="j-mini">${mini}</span><div class="j-txt"><b>${esc(tx(JUGADA_NOMBRE[j]))}</b><span class="sub">${esc(tx(JUGADA_COMO[j]))}${canto ? ` · <em class="dorado">${esc(canto)}</em>` : ''}</span></div><span class="j-num">${cifra(`×${multiDe(j)}`, 'oro')}</span></li>`;
    })
    .join('');
  const palos = PALOS.map(
    (s) => `<li class="palo-fila">${pxPalo(s)}<div><b>${esc(tx(PALO_NOMBRE[s]))}</b><span class="sub">${esc(tx(PALO_PODER[s]))}</span></div></li>`,
  ).join('');
  const glosario = GLOSARIO.map((g) => `<li class="glos-fila"><b>${esc(g.nombre())}</b><span>${esc(textoGlosario(g.e))}</span></li>`).join('');
  const velo = abrirModal(
    `<div class="panel jugadas">
      <header class="cabecera"><h2 class="titulo">${t('jugadas')}</h2><button class="btn marco chico" data-accion="cerrar" data-inicio>${t('cerrar')}</button></header>
      <div class="jugadas-cuerpo rollo">
        <ul class="jugada-lista">${filas}</ul>
        <h3 class="rotulo">${t('palos')}</h3>
        <ul class="palo-lista">${palos}</ul>
        <h3 class="rotulo">${t('glosario')}</h3>
        <ul class="glos-lista">${glosario}</ul>
      </div>
    </div>`,
    { cerrar: () => cerrarModal() },
  );
  avisarRollo(velo);
}

export function modalMenu(p: Partida): void {
  const html = `<div class="panel menu-pausa">
    <header class="cabecera"><h2 class="titulo">${t('menu')}</h2><button class="btn marco chico" data-accion="cerrar" data-inicio>${t('volver')}</button></header>
    <p class="sub">${esc(tx(MAZO[p.mazoId].nombre))} · ${t('tramo', { n: p.acto + 1 })}</p>
    <div class="menu-pausa-btns">
      <button class="btn marco" data-accion="semilla">${t('semilla')}: <b>${esc(p.semilla)}</b></button>
      <button class="btn marco" data-accion="musica">${t('musica')}: <b>${ajustes.musica ? t('si') : t('no')}</b></button>
      <button class="btn marco" data-accion="sonido">${t('sonido')}: <b>${ajustes.sonido ? t('si') : t('no')}</b></button>
      <button class="btn marco peligro" data-accion="abandonar">${t('rendirse')}</button>
    </div>
  </div>`;
  abrirModal(html, {
    cerrar: () => cerrarModal(),
    semilla: (el) => {
      void navigator.clipboard?.writeText(p.semilla).catch(() => undefined);
      el.textContent = t('copiado');
      sonar('clic');
    },
    musica: (el) => {
      ajustes.musica = !ajustes.musica;
      guardarAjustes();
      refrescarMusica();
      el.innerHTML = `${t('musica')}: <b>${ajustes.musica ? t('si') : t('no')}</b>`;
      sonar('clic');
    },
    sonido: (el) => {
      ajustes.sonido = !ajustes.sonido;
      guardarAjustes();
      refrescarSonido();
      el.innerHTML = `${t('sonido')}: <b>${ajustes.sonido ? t('si') : t('no')}</b>`;
      sonar('clic');
    },
    abandonar: () => {
      cerrarModal();
      juego.rendirse(p);
      avanzar();
    },
  });
}

export function accionesComunes(p: Partida): Record<string, Accion> {
  return {
    mazo: () => modalMazo(p, `${t('mazo')} (${p.mazo.length})`),
    'ver-mazo': () => modalMazo(p, `${t('mazo')} (${p.mazo.length})`),
    piezas: () => modalPiezas(p),
    'ver-piezas': () => modalPiezas(p),
    jugadas: () => modalJugadas(p),
    menu: () => modalMenu(p),
  };
}

// ───────────────────────── ofertas (Botín & Duelo) ─────────────────────────

function ofertaHtml(p: Partida, oferta: Oferta, fraseRey: string): string {
  const esBend = oferta.tipo === 'bendicion';
  const titulo = esBend ? t('elegiBendicion') : t('elegiAmuleto');
  const cards = oferta.opciones
    .map((id, i) => {
      const f = fichaDe(oferta.tipo, id, p);
      const ic = fichaIc(oferta.tipo, id, p);
      const icono = oferta.tipo === 'bendicion' ? pxBendicion(id as BendicionId) : pxAmuleto(id as AmuletoId);
      const rey = esBend ? BENDICION[id as BendicionId].rey : null;
      return `<button class="opcion marco ${f.marco}" data-accion="elegir" data-id="${id}" ${i === 0 ? 'data-inicio' : ''} ${tip(f.nombre, f.desc)}>
        <span class="op-icono">${icono}</span>
        ${rey ? `<span class="op-rey">${reyHtml(rey, 'habla')}</span>` : ''}
        <span class="op-clase rotulo">${esc(f.clase)}</span>
        <b class="op-nombre">${esc(f.nombre)}</b>
        <span class="op-sabor">${esc(ic.sabor)}</span>
        <span class="op-chips">${ic.chips.map((c) => `<span class="oc-${c.tono}">${esc(c.texto)}</span>`).join('')}</span>
        <span class="op-sinergia">${sinergiaHtml(oferta.tipo, id, p)}</span>
      </button>`;
    })
    .join('');
  return `<div class="panel oferta">
    <header class="cabecera"><h2 class="titulo">${titulo}</h2></header>
    ${fraseRey ? `<p class="oferta-voz" data-teclea>${esc(fraseRey)}</p>` : ''}
    <div class="opciones">${cards}</div>
    <div class="oferta-pie"><button class="btn marco chico" data-accion="saltar">${glifo('B', '')}${t('saltar', { n: B.botin.saltar })}</button></div>
  </div>`;
}

function reservarHud(velo: HTMLElement): void {
  const hud = $('#app .hud');
  if (!hud) return;
  const r = hud.getBoundingClientRect();
  if (r.height === 0 || r.top >= innerHeight) return;
  velo.classList.add('sobre-hud');
  const reserva = `${Math.round(innerHeight - r.top + 6)}px`;
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
    () => void irASalida($('#capa .velo')),
  );
  const pieza = $(`#app main.botin:not(.directo) [data-accion="abrir"][data-i="${indice}"]`)?.closest<HTMLElement>('.botin-fila');
  if (pieza) {
    velo.classList.add('sobre-botin');
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
  const mirar = (): void => void velo.classList.toggle('hay-mas', velo.scrollHeight - velo.scrollTop - velo.clientHeight > 2);
  velo.addEventListener('scroll', mirar, { passive: true });
  mirar();
  requestAnimationFrame(mirar);
  if (oferta.tipo === 'bendicion' && habla && !quieto()) teclear($('[data-teclea]', velo), fraseRey, habla);
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

// ───────────────────────── el Botín ─────────────────────────

export function pantallaBotin(p: Partida, desdeMesa = false): Pantalla {
  const botin = p.botin!;
  const directo = botin.de === 'duelo';
  const pendiente = () => botin.items.findIndex((i) => i.t === 'oferta' && !i.hecho);
  const cerrarBotin = () => {
    juego.seguir(p);
    avanzar();
  };
  let abierto = false;
  const filaItem = (item: ItemBotin, i: number): string => {
    const cobrado = `<span class="bp-cobrado verde" aria-hidden="true">✓</span>`;
    if (item.t === 'oro') return `<li class="botin-fila cobrado">${pxHud('oro')}<span>${t('oroMas', { n: item.n })}</span>${cobrado}</li>`;
    if (item.t === 'cura') return `<li class="botin-fila cobrado">${pxHud('vida')}<span>${t('vidaMas', { n: item.n })}</span>${cobrado}</li>`;
    if (item.t === 'vidamax') return `<li class="botin-fila cobrado">${pxHud('vidamax')}<span>${t('vidaMaxMas', { n: item.n })}</span>${cobrado}</li>`;
    const esBend = item.oferta.tipo === 'bendicion';
    const titulo = esBend ? t('bendicionDe') : t('amuletoNuevo');
    return `<li class="botin-fila ${item.hecho ? 'hecho' : 'espera'}">
      ${esBend ? pxNodo('rey') : pxHud('candado')}
      <span>${titulo}</span>
      ${item.hecho ? `<b class="chip">${t('elegida')}</b>` : `<button class="btn marco chico oro" data-accion="abrir" data-i="${i}" data-inicio>${t('elegir')}</button>`}
    </li>`;
  };
  return {
    nombre: 'botin',
    html: () => {
      const primera = pendiente();
      return `<main class="pantalla en-partida botin ${desdeMesa ? 'sobre-mesa' : ''} ${directo ? 'directo' : ''}">
        <div class="cuerpo botin-cuerpo">
          ${directo ? '' : `<section class="panel botin-panel"><header class="cabecera"><h1 class="titulo">${t('botin')}</h1></header><ul class="botin-lista">${botin.items.map(filaItem).join('')}</ul><div class="botin-pie"><button class="btn marco ${primera >= 0 ? 'chico' : 'oro'}" data-accion="seguir" data-foco="seguir">${primera >= 0 ? t('seguirSinElegir') : t('seguir')} ›</button></div></section>`}
        </div>
        ${hudHtml(p)}
      </main>`;
    },
    alMontar: () => {
      avivarRetrato(p);
      const q = pendiente();
      if (directo && q >= 0 && !abierto) {
        abierto = true;
        modalOferta(p, q, cerrarBotin);
      }
    },
    acciones: {
      ...accionesComunes(p),
      abrir: (el) => {
        const idx = Number(el.dataset.i);
        modalOferta(p, idx, () => {
          const sig = pendiente();
          if (sig >= 0) repintar();
          else cerrarBotin();
        });
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
                const ic = fichaIc('amuleto', a.id, p);
                return `<button class="venta opcion marco ${f.marco} ${a.vendido ? 'vendida' : ''}" data-accion="comprar" data-i="${i}" data-foco="venta-${i}" ${a.vendido ? 'disabled' : ''} ${i === 0 ? 'data-inicio' : ''} ${tip(f.nombre, f.desc)}>
                  <span class="op-icono">${pxAmuleto(a.id)}</span>
                  <span class="op-clase rotulo">${esc(f.clase)}</span>
                  <b class="op-nombre">${esc(f.nombre)}</b>
                  <span class="op-sabor">${esc(ic.sabor)}</span>
                  <span class="op-chips">${ic.chips.map((c) => `<span class="oc-${c.tono}">${esc(c.texto)}</span>`).join('')}</span>
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
                <button class="venta opcion marco oro" data-accion="reroll" data-foco="reroll">
                  <span class="op-icono">${pxHud('dado1')}</span><b class="op-nombre">CAMBIAR OFERTAS</b><span class="op-desc">Renueva las 2 Cábalas del mostrador.</span>${juego.precioReroll(p) === 0 ? '<span class="chip sinergia">GRATIS</span>' : precio(juego.precioReroll(p), p.oro >= juego.precioReroll(p))}
                </button>
                <button class="venta opcion marco prisma" data-accion="mejorar" data-foco="mejorar">
                  <span class="op-icono">${pxHud('furia')}</span><b class="op-nombre">TEMPLAR (+3 DAÑO)</b><span class="op-desc">Suma +3 de Daño permanente a una carta.</span>${precio(tienda.mejorar, p.oro >= tienda.mejorar)}
                </button>
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
      </div>
      ${hudHtml(p)}
    </main>`;
    },
    alMontar: () => {
      avivarRetrato(p);
      const cuerpo = $('.pulperia .pul-cuerpo');
      const main = $('.pulperia');
      if (cuerpo && main) {
        const mirar = (): void => {
          main.classList.toggle('hay-mas', cuerpo.scrollHeight - cuerpo.scrollTop - cuerpo.clientHeight > 8);
          main.style.setProperty('--pul-pie', `${Math.max(0, Math.round(innerHeight - cuerpo.getBoundingClientRect().bottom))}px`);
        };
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
      reroll: () => {
        const costo = juego.precioReroll(p);
        if (p.oro < costo) {
          decir(VOZ.sinOro, 'burla');
          sonar('error');
        } else if (juego.rerollPulperia(p)) {
          decir(VOZ.pulperia, 'brillo');
          sonar('carta');
          guardar();
        }
        repintar();
      },
      mejorar: () => {
        if (p.oro < p.tienda!.mejorar) {
          decir(VOZ.sinOro, 'burla');
          sonar('error');
          repintar();
          return;
        }
        modalMazo(
          p,
          'Elegí una carta para templar (+3 Daño)',
          (id) => {
            if (juego.mejorarCarta(p, id)) {
              decir(VOZ.compra, 'risa');
              sonar('canto');
              guardar();
            }
            repintar();
          },
          p.mazo,
          true,
        );
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

// ───────────────────────── el final ─────────────────────────

function resumenHtml(p: Partida, r: ResumenPartida): string {
  const e = r.estrella;
  const ficha = (icono: string, nombre: string, desc: string, cls = ''): string => `<button type="button" class="ficha fin-pieza ${cls}" data-foco="pieza" aria-label="${esc(nombre)}" ${tip(nombre, desc)}>${icono}</button>`;
  const piezas = [
    ...e.amuletos.map((id) => ficha(pxAmuleto(id), tx(AMULETO[id].nombre), tx(AMULETO[id].desc))),
    ...(e.bendicion ? [`<span class="fin-pieza-col">${ficha(pxBendicion(e.bendicion.id), tx(BENDICION[e.bendicion.id].nombre), tx(BENDICION[e.bendicion.id].desc(e.bendicion.nivel)))}</span>`] : []),
  ];
  const jugada = e.jugada
    ? `<span class="fin-jugada"><span class="rotulo">${t('jugadaFavorita')}:</span> <b>${esc(tx(JUGADA_NOMBRE[e.jugada]))}</b><span class="fin-jugada-como">${esc(tx(JUGADA_COMO[e.jugada]))}</span></span>`
    : '';
  const capa1 = `<div class="fin-capa fin-estrella">
      <h2 class="rotulo fin-capa-tit">${t('buildEstrella')}</h2>
      <div class="fin-build">${piezas.length ? `<span class="fin-piezas">${piezas.join('')}</span>` : ''}${jugada}</div>
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
  const record = `<p class="fin-rec-tipo"><b>${tipoRec}</b>${rec.nuevo ? `<span class="chip sinergia fin-rec-nuevo">${t('recordNuevo')}</span>` : ''}</p>
      <p class="fin-rec-cifras"><span class="fin-rec-col fin-rec-esta"><span class="fin-rec-rot">${t('recordEsta')}</span>${cifra(rec.actual, rec.nuevo ? 'oro' : 'hueso', 'grande')}</span><span class="fin-rec-col fin-rec-mejor"><span class="fin-rec-rot">${t('recordMejor')}</span>${cifra(rec.mejor, 'hueso', 'grande')}</span></p>`;
  const capa2 = `<div class="fin-capa fin-dos">
      <div class="fin-freno"><h3 class="rotulo fin-capa-tit">${t('queTeFreno')}</h3>${freno}</div>
      <div class="fin-record"><h3 class="rotulo fin-capa-tit">${t('proximoRecord')}</h3>${record}</div>
    </div>`;
  void p;
  return capa1 + capa2;
}

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
  const reyes = p.reyes.map((palo, i) => ({ palo, vencido: i < s.reyes }));
  const cuadro = { mirada: 0, gesto: gano ? 'feroz' : 'caido', herida: gano ? 0 : 2 } as const;
  const verdugo = gano ? -1 : reyes.findIndex((r) => !r.vencido);
  const naipeRey = (palo: Palo, i: number): string => {
    const nombre = `<b class="fin-rey-nombre rotulo">${esc(tx(REY_DEF[palo].apodo))}</b>`;
    if (reyes[i].vencido) return `<div class="fin-rey caido" style="--i:${i}"><span class="fin-retrato-rey">${reyHtml(palo, 'vencido')}</span>${nombre}</div>`;
    if (i === verdugo) return `<div class="fin-rey verdugo" style="--i:${i}"><span class="fin-retrato-rey">${reyHtml(palo, 'habla')}</span>${nombre}</div>`;
    return `<div class="fin-rey espera" style="--i:${i}"><span class="fin-retrato-rey">${reyHtml(palo, 'calma')}</span>${nombre}</div>`;
  };
  const heroe = gano
    ? `<div class="fin-heroe"><i class="fin-cara" style="background-image:url(${urlRetrato(p.mazoId, cuadro)})"></i></div>`
    : `<div class="fin-heroe partido"><span class="fin-cara-partida">${pxMitades(`pj:${p.mazoId}|caido`, () => personajeMapa(p.mazoId, cuadro), 2, 'fin-mitad')}</span></div>`;
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
        <div class="fin-tira" aria-hidden="true">${reyes.map((r, i) => naipeRey(r.palo, i)).join('')}</div>
        <div class="fin-cuadro">
          ${anfitrion(tx(alAzar(gano ? VOZ.gano : VOZ.perdio, fijo())), gano ? 'risa' : 'sombria', 'fin-bufon')}
          ${heroe}
          <section class="panel fin-panel">
            ${resumenHtml(p, sesion.resumen ?? resumenDe(p, perfil))}
          </section>
          <div class="fin-corte">${reyes.map((r, i) => naipeRey(r.palo, i)).join('')}</div>
        </div>
        <div class="fila fin-botones">
          <b class="fin-hay-mas" aria-hidden="true">${t('hayMas')}</b>
          <button class="btn marco oro grande fin-otra" data-accion="otra" data-foco="otra" data-inicio aria-label="${esc(t('otraManoTip', { m: tx(MAZO[p.mazoId].nombre) }))}">${pxHud('mazo')} ${t('otraManoYa')}</button>
          <button class="btn marco" data-accion="copiar-fin" data-foco="copiar-fin">${t('copiarResumen')}</button>
          <button class="btn marco" data-accion="portada" data-foco="portada">${t('portada')}</button>
        </div>
      </div>
    </main>`,
    alMontar: () => {
      sonar(gano ? 'victoria' : 'derrota');
      if (gano && !enFoto()) lluviaDeMonedas(0, innerWidth, -10, 60);
      contarRecord();
      const cuadroEl = $('.fin-cuadro');
      const escena = $('.fin-escena');
      let obsFin: ResizeObserver | null = null;
      let mirarFin: (() => void) | null = null;
      if (cuadroEl && escena) {
        const mirar = (): void => {
          escena.classList.toggle('hay-mas', cuadroEl.scrollHeight - cuadroEl.scrollTop - cuadroEl.clientHeight > 8);
          const corte = cuadroEl.querySelector<HTMLElement>('.fin-corte');
          escena.classList.toggle('corrida', !!corte && corte.getBoundingClientRect().top < cuadroEl.getBoundingClientRect().top - 8);
        };
        mirarFin = mirar;
        cuadroEl.addEventListener('scroll', mirar, { passive: true });
        const panel = cuadroEl.querySelector('.fin-panel');
        if (panel) {
          obsFin = new ResizeObserver(mirar);
          obsFin.observe(panel);
        }
        mirar();
        requestAnimationFrame(mirar);
      }
      (window as unknown as { __finCleanup?: () => void }).__finCleanup = () => {
        obsFin?.disconnect();
        if (cuadroEl && mirarFin) cuadroEl.removeEventListener('scroll', mirarFin);
      };
    },
    alSalir: () => {
      const w = window as unknown as { __finCleanup?: () => void };
      w.__finCleanup?.();
      delete w.__finCleanup;
    },
    acciones: {
      otra: () => {
        const { mazoId } = p;
        sesion.partida = null;
        empezar(mazoId);
      },
      'copiar-fin': (el) => {
        const txt = `CÁBALA · ${tx(MAZO[p.mazoId].nombre)} · ${gano ? t('gano') : t('cayo', { n: Math.min(3, p.acto + 1) })} · ${t('mejorGolpe')} ${s.mejorGolpe} · ${p.semilla}`;
        void navigator.clipboard?.writeText(txt).catch(() => undefined);
        el.textContent = t('copiado');
        sonar('clic');
      },
      portada: soltarPartida,
    },
  };
}

export { AMULETO };
