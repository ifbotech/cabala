// Las pantallas de fuera de partida de CÁBALA 2.0: Portada (JUGAR / COLECCIÓN / AJUSTES), Elegir Mazo, Colección y Ajustes.
import { AMULETO, AMULETOS, RAREZA_NOMBRE } from '../../rules/amuletos';
import { PALOS } from '../../rules/cartas';
import { MAZO, MAZOS } from '../../rules/mazos';
import { vidaInicial } from '../../rules/partida';
import type { MazoId } from '../../rules/mazos';
import { BENDICION, BENDICIONES, REY_DEF } from '../../rules/reyes';
import { MARCA, VERSION } from '../../shared/brand';
import { ajustes, borrarTodo, guardarAjustes, guardarPartida, perfil, t, tx } from '../almacen';
import { refrescarSonido, sonar } from '../audio';
import { refrescarMusica } from '../musica';
import { nombreCarga } from '../hud';
import { continuar, empezar, hayPartida, irAjustes, irColeccion, irMazo, irPortada, sesion } from '../juego';
import { cifra, heroeSpriteHtml, pxAmuleto, pxBendicion, pxDorso, pxLogo, pxPalo } from '../sprites';
import { abrirModal, cerrarModal, esc, repintar, reyHtml, tip, type Pantalla } from '../ui';

type Solapa = 'coleccion' | 'ajustes';
const SOLAPAS: Solapa[] = ['coleccion', 'ajustes'];
const solapas = (actual: Solapa): string =>
  `<nav class="solapas fila" role="tablist" aria-label="${t(actual)}">${SOLAPAS.map((x) => `<button class="btn marco chico solapa ${x === actual ? 'oro' : ''}" role="tab" aria-selected="${x === actual}" data-accion="sol-${x}" data-foco="sol-${x}">${t(x)}</button>`).join('')}</nav>`;
const irSolapa = { 'sol-coleccion': () => irColeccion(), 'sol-ajustes': () => irAjustes() };

// ───────────────────────── Portada (solo JUGAR, COLECCIÓN y AJUSTES) ─────────────────────────

export function pantallaPortada(): Pantalla {
  const hay = hayPartida();
  return {
    nombre: 'portada',
    html: () => `<main class="pantalla portada">
      <div class="portada-arriba">
        <h1 class="logo-caja" aria-label="${MARCA.es.titulo}">${pxLogo()}</h1>
        <p class="sub portada-sub">${MARCA.es.subtitulo}</p>
      </div>
      <div class="portada-medio">
        <div class="portada-pila" aria-hidden="true">${(['chinchon', 'truco', 'escoba'] as MazoId[]).map((m, i) => `<span class="pila-dorso" style="--i:${i}">${pxDorso(m)}</span>`).join('')}</div>
        <nav class="portada-menu">
          <button class="btn marco oro monumental" data-accion="jugar" data-inicio data-foco="jugar">${hay ? t('continuar') : t('jugar')}</button>
          ${hay ? `<button class="btn marco chico" data-accion="nueva" data-foco="nueva">${t('nueva')}</button>` : ''}
          <div class="fila">
            <button class="btn marco" data-accion="coleccion" data-foco="coleccion">${t('coleccion')}</button>
            <button class="btn marco" data-accion="ajustes" data-foco="ajustes">${t('ajustes')}</button>
          </div>
        </nav>
      </div>
      <footer class="pie">
        <span class="sub">2D PIXEL MVP · v${VERSION}</span>
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
      coleccion: irColeccion,
      ajustes: irAjustes,
    },
  };
}

// ───────────────────────── Elegir Mazo (5 Mazos abiertos desde el minuto 0) ─────────────────────────

let mazoElegido: MazoId = 'escoba';

export function pantallaMazo(): Pantalla {
  const detalle = (): string => {
    const d = MAZO[mazoElegido];
    const vida = vidaInicial(mazoElegido);
    const g = perfil.ganado[mazoElegido] ?? 0;
    return `<div class="md-dorso">${pxDorso(mazoElegido)}</div>
      <div class="md-texto">
        <b class="md-nombre dorado">${esc(tx(d.nombre))} · ${esc(tx(d.personaje))}</b>
        <p class="md-regla">${esc(tx(d.regla))}</p>
        <div class="sub md-sub"><span>${t('vida')} ${vida} · ${t('mano', { n: d.id === 'chinchon' ? 7 : d.id === 'mentiroso' ? 5 : 4 })}${g > 0 ? ` · ★ ${g}` : ''}</span></div>
      </div>`;
  };
  return {
    nombre: 'elegir-mazo',
    atras: irPortada,
    html: () => `<main class="pantalla mazo-p">
      <header class="cabecera">
        <button class="btn marco chico" data-accion="volver" data-foco="volver">‹ ${t('volver')}</button>
        <h2 class="titulo">${t('elegiMazo')}</h2>
        <span class="lado"></span>
      </header>
      <div class="mazos" role="radiogroup" aria-label="${t('elegiMazo')}">
        ${MAZOS.map((m) => {
          const d = MAZO[m];
          return `<button class="mazo-op marco ${m === mazoElegido ? 'elegido' : ''}" role="radio" aria-checked="${m === mazoElegido}" data-accion="mazo" data-id="${m}" data-foco="mazo-${m}" ${m === mazoElegido ? 'data-inicio' : ''}>
            <span class="mazo-dorso">${pxDorso(m)}</span>
            <span class="mazo-cara">${heroeSpriteHtml(m, 'idle', 0, 'mazo-sprite')}</span>
            <b class="mazo-nombre">${esc(tx(d.nombre))}</b>
            <span class="sub mazo-pj">${esc(tx(d.personaje))}</span>
          </button>`;
        }).join('')}
      </div>
      <section class="mazo-detalle marco" data-detalle>${detalle()}</section>
      <button class="btn marco oro monumental" data-accion="jugar" data-foco="jugar" data-jugar>${t('jugar')}</button>
    </main>`,
    acciones: {
      volver: irPortada,
      mazo: (el) => {
        mazoElegido = el.dataset.id as MazoId;
        sonar('clic');
        repintar();
      },
      jugar: () => {
        sonar('clic');
        empezar(mazoElegido);
      },
    },
  };
}

// ───────────────────────── Colección ─────────────────────────

type Pestana = 'mazos' | 'reyes' | 'amuletos' | 'bendiciones';
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
        const gano = perfil.ganado[m] ?? 0;
        return `<div class="col-mazo" ${tip(`${tx(d.nombre)} · ${tx(d.personaje)}`, d.reglas.map((r) => tx(r)).join(' '))}>
          ${pxDorso(m)}<b>${esc(tx(d.nombre))}</b><span class="sub">${esc(tx(d.personaje))}</span>${gano ? `<span class="chip sinergia">★ ${gano}</span>` : ''}
        </div>`;
      }).join('')}</div>`;
    if (pestana === 'reyes')
      return `<div class="col-reyes">${PALOS.map((s) => {
        const r = REY_DEF[s];
        const v = visto(`r:${s}`);
        return `<div class="col-rey ${v ? '' : 'sin-ver'}" ${v ? tip(`${tx(r.nombre)} · ${tx(r.apodo)}`, `${tx(r.rasgo)}: ${tx(r.rasgoDesc)}`, `${nombreCarga(s)}: ${tx(r.cargaDa)}`) : tip(t('sinVer'), t('sinVerDesc'))}>
          ${reyHtml(s, 'calma')}<b>${v ? esc(tx(r.apodo)) : t('sinVer')}</b><span class="sub">${v ? esc(tx(r.nombre)) : esc(t('sinVerDesc'))}</span>${v ? `<span class="chip canto">${esc(tx(r.rasgo))}</span><p class="col-ficha">${esc(tx(r.rasgoDesc))}</p><p class="col-ficha col-carga">${pxPalo(s)} <b>${esc(nombreCarga(s))}</b> · ${esc(tx(r.cargaDa))}</p>` : ''}
        </div>`;
      }).join('')}</div>`;
    if (pestana === 'amuletos')
      return `<div class="col-grid">${AMULETOS.map((id) => item(`a:${id}`, pxAmuleto(id), tx(AMULETO[id].nombre), tx(AMULETO[id].desc), tx(RAREZA_NOMBRE[AMULETO[id].rareza]))).join('')}</div>`;
    return `<div class="col-grid">${BENDICIONES.map((id) => item(`b:${id}`, pxBendicion(id), tx(BENDICION[id].nombre), tx(BENDICION[id].desc(1)), tx(REY_DEF[BENDICION[id].rey].apodo))).join('')}</div>`;
  };
  const PABS: { id: Pestana; lbl: string }[] = [
    { id: 'mazos', lbl: t('mazos') },
    { id: 'reyes', lbl: t('reyes') },
    { id: 'amuletos', lbl: t('cabalas') },
    { id: 'bendiciones', lbl: t('bendiciones') },
  ];
  return {
    nombre: 'coleccion',
    atras: irPortada,
    html: () => `<main class="pantalla coleccion">
      <header class="cabecera">
        <button class="btn marco chico" data-accion="volver" data-foco="volver" data-inicio>‹ ${t('volver')}</button>
        ${solapas('coleccion')}
        <span class="lado sub">${cifra(perfil.stats.victorias, 'oro')} ${t('victorias')}</span>
      </header>
      <div class="col-tabs fila" role="tablist">${PABS.map((x) => `<button class="btn marco chico ${x.id === pestana ? 'oro' : ''}" role="tab" aria-selected="${x.id === pestana}" data-accion="tab" data-id="${x.id}" data-foco="tab-${x.id}">${x.lbl}</button>`).join('')}</div>
      <section class="col-cuerpo rollo">${cuerpo()}</section>
    </main>`,
    acciones: {
      ...irSolapa,
      volver: irPortada,
      tab: (el) => {
        pestana = el.dataset.id as Pestana;
        sonar('clic');
        repintar();
      },
    },
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
        <div class="aj-abanico" aria-hidden="true">${MAZOS.map((m, i) => `<span class="aj-dorso" style="--i:${i}">${pxDorso(m)}</span>`).join('')}</div>
        <section class="aj-lista marco">
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
