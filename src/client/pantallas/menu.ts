// Las pantallas de fuera de la partida: la portada, elegir Mazo, el Altar (siete mejoras directas en una sola
// pantalla), la Colección, la Crónica y los Ajustes.
import { AMULETO, AMULETOS, RAREZA_NOMBRE } from '../../rules/amuletos';
import { AUMENTO, AUMENTOS, NIVEL_NOMBRE } from '../../rules/aumentos';
import { B } from '../../rules/balance';
import { PALOS } from '../../rules/cartas';
import { MAZO, MAZOS } from '../../rules/mazos';
import { vidaInicial } from '../../rules/partida';
import type { MazoId } from '../../rules/mazos';
import { MEJORAS, avanceMazo, costeMejora, mazoAbierto, mejorar, reinadoMax } from '../../rules/perfil';
import type { MejoraId } from '../../rules/perfil';
import { REINADOS } from '../../rules/reinados';
import { BENDICION, BENDICIONES, REY_DEF } from '../../rules/reyes';
import { selloDe } from '../../rules/sellos';
import { MARCA, VERSION } from '../../shared/brand';
import { ajustes, alAzar, borrarTodo, fijarIdioma, guardarAjustes, guardarPartida, guardarPerfil, idioma, perfil, t, tx } from '../almacen';
import { sonar } from '../audio';
import { enFoto } from '../fx/motor';
import { continuar, empezar, hayPartida, irAjustes, irAltar, irColeccion, irCronica, irMazo, irPortada, sesion } from '../juego';
import { CUADRO0 } from '../pixel/personajes';
import { cifra, pxAmuleto, pxAumento, pxBendicion, pxDorso, pxHud, pxLogo, pxSello, urlRetrato } from '../sprites';
import { TRAMO_NOMBRE } from '../textos';
import { VOZ } from '../voces';
import { abrirModal, anfitrion, cerrarModal, esc, repintar, reyHtml, tip, type Pantalla } from '../ui';

// ───────────────────────── portada ─────────────────────────

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
        <span class="lado hueco-volver"></span>
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

export function pantallaAltar(): Pantalla {
  const fila = (id: MejoraId): string => {
    const m = MEJORAS.find((x) => x.id === id)!;
    const nivel = perfil.altar[id];
    const coste = costeMejora(id, nivel);
    const puede = coste !== null && perfil.porotos >= coste;
    const pips = Array.from({ length: m.max }, (_, i) => `<i class="pip ${i < nivel ? 'lleno' : ''}"></i>`).join('');
    return `<div class="mejora" data-mejora="${id}">
      <div class="mj-texto"><b>${esc(tx(m.nombre))}</b><span class="sub">${esc(tx(m.desc))}</span></div>
      <div class="mj-barra" role="img" aria-label="${nivel}/${m.max}">${pips}<span class="mj-nivel">${cifra(`${nivel}/${m.max}`, 'hueso')}</span></div>
      <button class="btn marco ${puede ? 'oro' : ''} mj-boton" data-accion="mejorar" data-id="${id}" data-foco="mj-${id}" ${puede ? '' : 'disabled'}>${coste === null ? t('alMaximo') : `${t('mejorar')} ${pxHud('poroto')}${cifra(coste, puede ? 'purpura' : 'hueso')}`}</button>
    </div>`;
  };
  return {
    nombre: 'altar',
    atras: irPortada,
    html: () => `<main class="pantalla altar">
      <header class="cabecera">
        <button class="btn marco chico" data-accion="volver" data-foco="volver" data-inicio>‹ ${t('volver')}</button>
        <h1 class="titulo">${t('altarTitulo')}</h1>
        <span class="lado porotos" ${tip(t('porotos'), idioma() === 'en' ? 'Every run leaves some, win or lose.' : 'Cada partida deja algunos, ganes o pierdas.')}>${pxHud('poroto')}${cifra(perfil.porotos, 'oro', 'grande')}</span>
      </header>
      <div class="mejoras marco">${MEJORAS.map((m) => fila(m.id)).join('')}</div>
    </main>`,
    acciones: {
      volver: irPortada,
      mejorar: (el) => {
        if (mejorar(perfil, el.dataset.id as MejoraId)) {
          sonar('oro');
          guardarPerfil();
          repintar();
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
      ? `<button class="col-item" ${tip(nombre, desc, pie)}>${icono}<span class="col-nombre">${esc(nombre)}</span>${pxSello(selloDe(clave[0] === 'a' ? 'amuleto' : clave[0] === 'u' ? 'aumento' : 'bendicion', clave.slice(2)))}</button>`
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
          ${reyHtml(s, 'calma')}<b>${v ? esc(tx(r.apodo)) : t('sinVer')}</b><span class="sub">${v ? esc(tx(r.nombre)) : ''}</span>
        </div>`;
      }).join('')}</div>`;
    if (pestana === 'amuletos') return `<div class="col-rejilla">${AMULETOS.map((id) => item(`a:${id}`, pxAmuleto(id), tx(AMULETO[id].nombre), tx(AMULETO[id].desc), tx(RAREZA_NOMBRE[AMULETO[id].rareza]))).join('')}</div>`;
    if (pestana === 'cabalas') return `<div class="col-rejilla">${AUMENTOS.map((id) => item(`u:${id}`, pxAumento(id), tx(AUMENTO[id].nombre), tx(AUMENTO[id].desc), AUMENTO[id].maldicion ? t('maldicion') : tx(NIVEL_NOMBRE[AUMENTO[id].nivel]))).join('')}</div>`;
    return `<div class="col-rejilla">${BENDICIONES.map((id) => item(`b:${id}`, pxBendicion(id), tx(BENDICION[id].nombre), tx(BENDICION[id].desc(1)), tx(REY_DEF[BENDICION[id].rey].apodo))).join('')}</div>`;
  };
  const pestanas: Pestana[] = ['mazos', 'reyes', 'amuletos', 'cabalas', 'bendiciones'];
  return {
    nombre: 'coleccion',
    atras: irPortada,
    html: () => `<main class="pantalla coleccion">
      <header class="cabecera">
        <button class="btn marco chico" data-accion="volver" data-foco="volver" data-inicio>‹ ${t('volver')}</button>
        <h1 class="titulo">${t('coleccion')}</h1>
        <span class="lado hueco-volver"></span>
      </header>
      <nav class="fila pestanas" role="tablist">${pestanas.map((p) => `<button class="btn marco chico ${p === pestana ? 'oro' : ''}" role="tab" aria-selected="${p === pestana}" data-accion="pestana" data-id="${p}" data-foco="tab-${p}">${t(p === 'amuletos' ? 'amuletos' : p)}</button>`).join('')}</nav>
      <section class="col-cuerpo marco">${cuerpo()}</section>
    </main>`,
    acciones: {
      volver: irPortada,
      pestana: (el) => {
        pestana = el.dataset.id as Pestana;
        repintar();
      },
    },
  };
}

// ───────────────────────── la Crónica ─────────────────────────

export function pantallaCronica(): Pantalla {
  const s = perfil.stats;
  const dato = (rotulo: string, valor: number) => `<div class="cr-dato"><span class="rotulo">${rotulo}</span>${cifra(valor, 'oro', 'grande')}</div>`;
  return {
    nombre: 'cronica',
    atras: irPortada,
    html: () => `<main class="pantalla cronica">
      <header class="cabecera">
        <button class="btn marco chico" data-accion="volver" data-foco="volver" data-inicio>‹ ${t('volver')}</button>
        <h1 class="titulo">${t('cronica')}</h1>
        <span class="lado hueco-volver"></span>
      </header>
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
    </main>`,
    acciones: { volver: irPortada },
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
        <h1 class="titulo">${t('ajustes')}</h1>
        <span class="lado hueco-volver"></span>
      </header>
      <section class="aj-lista marco">
        <div class="aj-fila"><b>${t('idioma')}</b><div class="fila"><button class="btn marco chico ${idioma() === 'es' ? 'oro' : ''}" data-accion="es" data-foco="aj-es" aria-pressed="${idioma() === 'es'}">Español</button><button class="btn marco chico ${idioma() === 'en' ? 'oro' : ''}" data-accion="en" data-foco="aj-en" aria-pressed="${idioma() === 'en'}">English</button></div></div>
        <div class="aj-fila"><b>${t('calma')}</b>${conmuta('calma', ajustes.calma, 'aj-calma')}</div>
        <div class="aj-fila"><b>${t('sonido')}</b>${conmuta('sonido', ajustes.sonido, 'aj-sonido')}</div>
        <div class="aj-fila"><b>${t('borrar')}</b><button class="btn marco chico" data-accion="borrar" data-foco="aj-borrar">${t('borrar')}</button></div>
        <p class="sub aj-creditos">${t('creditos')} · v${VERSION}</p>
      </section>
    </main>`,
    acciones: {
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
      'sonido-si': () => {
        ajustes.sonido = true;
        guardarAjustes();
        repintar();
      },
      'sonido-no': () => {
        ajustes.sonido = false;
        guardarAjustes();
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
