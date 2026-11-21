// Las pantallas de fuera de la partida: la portada, elegir Mazo, el Altar (siete mejoras directas en una sola
// pantalla), la Colección, la Crónica y los Ajustes.
import { AMULETO, AMULETOS, RAREZA_NOMBRE } from '../../rules/amuletos';
import { AUMENTO, AUMENTOS } from '../../rules/aumentos';
import { B } from '../../rules/balance';
import { PALOS } from '../../rules/cartas';
import { MAZO, MAZOS } from '../../rules/mazos';
import { vidaInicial } from '../../rules/partida';
import type { MazoId } from '../../rules/mazos';
import { MEJORAS, avanceMazo, costeMejora, mazoAbierto, mejorar, reinadoMax } from '../../rules/perfil';
import type { MejoraId } from '../../rules/perfil';
import { REINADOS } from '../../rules/reinados';
import { BENDICION, BENDICIONES, REY_DEF } from '../../rules/reyes';
import { MARCA, VERSION } from '../../shared/brand';
import { ajustes, alAzar, borrarTodo, fijarIdioma, guardarAjustes, guardarPartida, guardarPerfil, idioma, perfil, t, tx } from '../almacen';
import { refrescarSonido, sonar } from '../audio';
import { refrescarMusica } from '../musica';
import { enFoto } from '../fx/motor';
import { continuar, empezar, hayPartida, irAjustes, irAltar, irColeccion, irCronica, irMazo, irPortada, sesion } from '../juego';
import { CUADRO0 } from '../pixel/personajes';
import { cifra, pxAmuleto, pxAumento, pxBendicion, pxDorso, pxHud, pxLogo, pxPalo, urlRetrato } from '../sprites';
import { TRAMO_NOMBRE } from '../textos';
import { VOZ } from '../voces';
import { bufonDice } from '../bufon-vivo';
import { abrirModal, anfitrion, cerrarModal, esc, miniAnfitrion, repintar, reyHtml, tip, type Pantalla } from '../ui';

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
    return `<div class="al-texto"><b class="al-titulo">${esc(tx(m.nombre))}</b><span class="sub">${esc(tx(m.desc))}</span><span class="al-nivel">${cifra(`${nivel}/${m.max}`, 'hueso')}</span></div>
      <button class="btn marco ${puede ? 'oro' : ''} mj-boton" data-accion="mejorar" data-id="${id}" data-foco="mejorar" ${puede ? '' : 'disabled'}>${coste === null ? t('alMaximo') : `${t('mejorar')} ${pxHud('poroto')}${cifra(coste, puede ? 'purpura' : 'hueso')}`}</button>`;
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
        return `<div class="col-rey ${v ? '' : 'sin-ver'}" ${v ? tip(`${tx(r.nombre)} · ${tx(r.apodo)}`, `${tx(r.rasgo)}: ${tx(r.rasgoDesc)}`, `${tx(r.carga)}: ${tx(r.cargaDa)}`) : tip(t('sinVer'), t('sinVerDesc'))}>
          ${reyHtml(s, 'calma')}<b>${v ? esc(tx(r.apodo)) : t('sinVer')}</b><span class="sub">${v ? esc(tx(r.nombre)) : esc(t('sinVerDesc'))}</span>${v ? `<span class="chip canto">${esc(tx(r.rasgo))}</span><p class="col-ficha">${esc(tx(r.rasgoDesc))}</p><p class="col-ficha col-carga">${pxPalo(s)} <b>${esc(tx(r.carga))}</b> · ${esc(tx(r.cargaDa))}</p>` : ''}
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
