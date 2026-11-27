// La mesa de combate. Mirando el centro se entiende todo: el enemigo activo, grande, flotando sobre el paño; el
// Bufón a la izquierda, que comenta en bocadillos cortos; la pila de la Corte que queda, a la derecha; la cuenta
// DAÑO × MULTI = TOTAL que aparece al elegir o arrastrar cartas (en reposo, silencio); la mano en fila, y abajo el
// HUD del jugador. Se juega arrastrando las cartas sobre el enemigo (o al descarte), con los botones, con el
// teclado o con el mando.
import { B } from '../../rules/balance';
import type { Carta, Palo } from '../../rules/cartas';
import { contraataque, cuenta, postasDe, puedeDescartar, repiteJugada } from '../../rules/combate';
import type { Cuenta, Ev, Paso } from '../../rules/combate';
import type { Enemigo, Partida } from '../../rules/estado';
import { tieneAmuleto } from '../../rules/estado';
import { MAZO } from '../../rules/mazos';
import * as juego from '../../rules/partida';
import { donesDe, escudoTope } from '../../rules/estado';
import { ver } from '../../rules/perfil';
import { REY_DEF } from '../../rules/reyes';
import { acomodoExacto, mejorAcomodo } from '../../rules/bot';
import { CHICHE, huecosChiche, type ChicheId } from '../../rules/chiches';
import { EVOLUCION, evoluciono, type EvolucionDe } from '../../rules/evoluciones';
import { ajustes, alAzar, guardarPerfil, idioma, perfil, t, tx } from '../almacen';
import { agacharMusica, nota, sonar } from '../audio';
import { cantar, estadoCombate, ponerFuego, remateMusica, stinger } from '../musica';
import { teclear } from '../habla';
import { escena3dActiva, estallidoPalo3d, fogonazo3d, marcarSucio3d, partirEnemigo3d, poderRey3d, sacudirCamara3d, transformarSegunda3d } from '../escena3d';
import { RAMPA_CURA, RAMPA_ESCUDO, RAMPA_GOLPE, RAMPA_PALO, chispas, destello, haloRey, limpiarNumeros, lluviaDeMonedas, monedas, motas, numero, partirNaipe, quiebre, tajo, tajoDeReves, type Carril } from '../fx/efectos';
import { alCeder, cajaDe, pisan, reservar, soltar as soltarTurno, tomadas, ubicar } from '../fx/director';
import { S, congelar, descongelar, enFoto, fogonazoCandil, ponerClima, sacudir } from '../fx/motor';
import { actualizarTiras, avivarRetrato, cargaQue, deltaHud, nombreCarga, dispararFicha, gestoFijo, gestoRetrato, gritar, hudHtml, mirarHacia, ponerHud, poseRetrato, reubicarGrito, vistaDe, type VistaHud } from '../hud';
import { guardar, pintarFase } from '../juego';
import { crearMano, type Mano, type Zona } from '../mano';
import { encajarDesglose, nombreHtml, terminoVisto } from '../desglose';
import type { Expresion } from '../pixel/bufon';
import { cifra, pxChiche, lienzoNaipe, lienzoNaipeSegunda, pxMascara, pxNaipeSegunda, pxAmuleto, pxAumento, pxBendicion, pxEstrella, pxEvolucion, pxHud, pxInmune, pxNaipe, pxNodo, pxPalo } from '../sprites';
import type { AmuletoId } from '../../rules/amuletos';
import type { AumentoId } from '../../rules/aumentos';
import type { BendicionId } from '../../rules/reyes';
import { CHICHE_CORTO, JUGADA_NOMBRE, NODO_NOMBRE, PALO_NOMBRE, PALO_PODER, PASO_AYUDA, PASO_NOMBRE, RANGO_NOMBRE, RASGO_CORTA, SEGUNDA_BURLA, SEGUNDA_CORTA, TRAMO_NOMBRE } from '../textos';
import { ENSENANZA, GRITO, VOZ } from '../voces';
import { $, ayudaPrimera, bufonHtml, esc, fichaDe, gestoBufon, ocultarTip, reubicarTip, reyHtml, tip, type Pantalla } from '../ui';
import { glifo, porTeclado } from '../nav';
import { pausa, quieto } from '../ritmo';
import { accionesComunes, calentarOfertas, modalJugadas, textoGlosario } from './camino';

const AURA: Record<Palo, string> = { S: '#00c8ff', C: '#22d95b', D: '#ffd500', H: '#ff1453' };
/** El aura de la segunda cara: el Rey se pasa al carmesí (el de Copas, que ya lo era, al violeta). */
const AURA_SEGUNDA: Record<Palo, string> = { S: '#ff1453', C: '#ff1453', D: '#ff1453', H: '#9038d8' };

/** El nombre de un enemigo: «Sota de Copas» o el apodo del Rey jefe. */
export function nombreEnemigo(e: Pick<Enemigo, 'palo' | 'rango' | 'jefe'>): string {
  if (e.jefe) return tx(REY_DEF[e.palo].apodo);
  return idioma() === 'en' ? `${RANGO_NOMBRE[e.rango].en} of ${PALO_NOMBRE[e.palo].en}` : `${RANGO_NOMBRE[e.rango].es} de ${PALO_NOMBRE[e.palo].es}`;
}

const centro = (el: Element | null): { x: number; y: number } => {
  const r = el?.getBoundingClientRect();
  return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: innerWidth / 2, y: innerHeight / 2 };
};

/** Una micro-escena que cruza la pantalla (la entrada del combate, la irrupción de un Rey). Se salta con un clic. */
function cortina(html: string, ms: number, cls = '', alMontar?: (el: HTMLElement) => number): Promise<boolean> {
  if (quieto()) return Promise.resolve(false);
  return new Promise((ok) => {
    const el = document.createElement('div');
    el.className = `cortina ${cls}`;
    el.innerHTML = html;
    $('#capa')!.append(el);
    ms += alMontar?.(el) ?? 0;
    let hecho = false;
    const fin = (saltada: boolean) => {
      if (hecho) return;
      hecho = true;
      el.remove();
      removeEventListener('keydown', saltar, true);
      removeEventListener('cabala:pulso', saltar);
      ok(saltada);
    };
    // (cualquier entrada la salta: el dedo, una tecla o un botón del mando)
    const saltar = (ev: Event): void => {
      if (ev.type === 'keydown') ev.preventDefault();
      fin(true);
    };
    el.addEventListener('pointerdown', saltar);
    addEventListener('keydown', saltar, true);
    addEventListener('cabala:pulso', saltar);
    setTimeout(() => fin(false), ms);
  });
}

/** La banda del Bufón con la máscara del Rey (la QA la fotografía quieta, a mitad de la escena). */
export function mascaraHtml(palo: Palo): string {
  const r = REY_DEF[palo];
  return `<div class="irr-banda mascarada" style="--aura:${AURA[palo]}"><span class="mz-par">${bufonHtml('risa', 'mz-bufon')}<span class="mz-mascara" aria-hidden="true">${pxMascara(palo)}</span></span><div class="irr-texto"><b class="titulo">${esc(tx(r.apodo))}</b><span class="sub">${esc(t('mascaraRey'))}</span></div></div>`;
}

/** Las partidas (por su semilla) en las que el Bufón ya presentó DEJALO JUSTO. */
const dialPresentado = new Set<string>();
/** (0.27) Las partidas en las que el Bufón ya dijo lo de cortar la mano. */
const cortaDicha = new Set<string>();
/** (0.25) Las partidas en las que el Bufón ya dijo lo de Mesa limpia. */
const mesaLimpiaVista = new Set<string>();

/** (0.28) Lo que dura en pantalla la placa «−N» del contragolpe (ms): el turno siguiente se reparte cuando ya se fue. */
const PLACA_CONTRA = 820;

export function pantallaMesa(p: Partida): Pantalla {
  const c = () => p.combate!;
  let mano: Mano | null = null;
  let ocupado = false;
  let hud: VistaHud = vistaDe(p);
  let enemigo: Enemigo | null = c().fila[0] ? { ...c().fila[0] } : null;
  let resto: Enemigo[] = c().fila.slice(1).map((e) => ({ ...e }));
  let furia = c().furia;
  let vozReloj = 0;
  let turnoVoz = 0;
  const tipo = c().tipo;
  const ensena = !perfil.aprendido && p.stats.combates === 0;

  const seleccion = (): Carta[] => {
    const ids = mano?.seleccion() ?? [];
    return c().mano.filter((k) => ids.includes(k.id));
  };
  /** En qué Posta del paño va cada carta de `sel` (mismo orden). */
  const postasDeSel = (sel: readonly Carta[]): number[] | undefined => (mano ? sel.map((k) => mano!.postaDe(k.id)) : undefined);
  /** La cuenta de lo elegido, con cada carta en su Posta. */
  const cuentaDe = (sel: Carta[] = seleccion()): Cuenta => cuenta(p, sel, postasDeSel(sel));
  /** El Dado Cargado de esta mano (su +Multi entra por «golpe anterior»: el desglose lo nombra por lo que es). */
  let dadoArmado = false;
  /** El naipe que tenía el foco antes de pasar a la bandeja de Chiches (para devolvérselo). */
  let cartaAntesDeChiches: string | null = null;
  /** El Chiche que el primer toque dejó listo (el segundo lo usa) y con qué se tocó la mesa por última vez. */
  let chicheListo: number | null = null;
  let ultimoPuntero = '';
  let observaMano: ResizeObserver | null = null;

  // ───────────── el Bufón habla ─────────────
  function decir(texto: string, gesto: Expresion = 'reposo', ms = 3400): void {
    const b = $('[data-voz]');
    if (!b) return;
    clearTimeout(vozReloj);
    b.textContent = texto;
    b.hidden = false;
    // lo que dice el Bufón es una capa más del director de escena (lo que vuele después no se le monta encima)
    soltarTurno(turnoVoz);
    if (!enFoto()) {
      const r = b.getBoundingClientRect();
      turnoVoz = reservar('bocadillo', { x: r.left, y: r.top, w: r.width, h: r.height }, ms > 0 ? ms : 6000, cajaDe(b));
      // (si le cae encima el número de un golpe, el Bufón se calla ese segundo y vuelve: el número no se tapa)
      alCeder(turnoVoz, () => {
        b.style.visibility = 'hidden';
        window.setTimeout(() => (b.style.visibility = ''), 1000);
      });
    }
    if (!enFoto()) cantar('bufon', texto);
    const bufonEl = $('.esc-bufon')!;
    gestoBufon(bufonEl, gesto);
    const caraEl = $('.esc-bufon .bufon');
    caraEl?.classList.add('habla');
    if (!enFoto()) window.setTimeout(() => caraEl?.classList.remove('habla'), 1200);
    if (ms > 0 && !enFoto()) vozReloj = window.setTimeout(() => {
      b.hidden = true;
      caraEl?.classList.remove('habla');
      gestoBufon(bufonEl, p.afinidad <= -2 ? 'sombria' : 'reposo');
    }, ms);
  }
  const voz = (lista: readonly { es: string; en: string }[], gesto: Expresion = 'reposo') => decir(tx(alAzar(lista, enFoto() ? 0 : undefined)), gesto);
  /** (0.24) La primera vez que aparece DEJALO JUSTO en la partida, el Bufón lo explica en un renglón. */
  function presentarDial(): void {
    if (dialPresentado.has(p.semilla)) return;
    dialPresentado.add(p.semilla);
    decir(t('bufonDial'), 'brillo', 5200);
  }
  /**
   * (0.25) Mesa limpia: en el primer tramo la Escoba arranca cada combate con Escudo. Mientras dure el primer turno, la
   * caja del ESCUDO lleva su rótulo «MESA LIMPIA»; la primera vez en la partida, el Bufón lo dice.
   */
  const escudoLimpio = (): number => (p.acto === 0 ? ((B.mazos[p.mazoId] as { mesaLimpia?: number }).mesaLimpia ?? 0) : 0);
  let mesaLimpiaDicha = false;
  function ponerMesaLimpia(): void {
    const e = escudoLimpio();
    const caja = $('[data-hud-escudo]');
    const ya = caja?.querySelector('.hud-limpia');
    const va = e > 0 && !!p.combate && c().turno === 1 && c().golpes === 0;
    if (!va) return void ya?.remove();
    if (caja && !ya) caja.insertAdjacentHTML('beforeend', `<b class="hud-limpia" ${tip(t('mesaLimpia'), t('mesaLimpiaTip', { e }))}>${esc(t('mesaLimpia'))}</b>`);
    if (!mesaLimpiaVista.has(p.semilla) && !ensena) {
      mesaLimpiaVista.add(p.semilla);
      mesaLimpiaDicha = true;
      decir(t('bufonMesaLimpia', { e }), 'brillo', 4600);
    }
  }

  // ───────────── pintar ─────────────
  /** El Caudillo en segunda cara: si repetís la jugada, su Tajo de revés pega ×2 y atraviesa el Escudo. */
  const tajoArmado = (e: Enemigo | null): boolean => !!(e?.jefe && e.palo === 'S' && e.segunda);
  /**
   * Lo que dice la placa TE PEGA mientras se anima un golpe (lo mismo que decía la cuenta al soltar: el golpe neto que
   * te va a llegar y si es el Tajo de revés), o null.
   */
  let placa: { n: number; tajo: boolean; causa?: string } | null = null;
  /** El TE PEGA de la placa y de la cuenta es uno solo: con una jugada elegida, lo que te llega de verdad (q.contra). */
  const golpeNeto = (q: Cuenta, sel: number): number | null => (sel > 0 && q.ok && !q.abate && !q.ejecuta && q.contra !== null ? Math.max(0, q.contra) : null);
  /** ¿La selección de ahora repite la jugada del golpe anterior (y el Tajo de revés la castiga)? */
  const tajoAhora = (q: Cuenta): boolean => tajoArmado(enemigo) && q.ok && !q.abate && !q.ejecuta && !!q.contra && q.contra > 0 && repiteJugada(c().ultimaJugada, q.jugada);
  /** Por qué este golpe no te pega (el chip «NO TE PEGA» lo dice): aturdido, lo aturdís, Cara de Póker o tu Escudo. */
  const causaSinContra = (q: Cuenta): string => {
    if (!enemigo) return '';
    if (enemigo.aturdido > 0) return t('aturdidoCausa');
    if (q.aturde > 0) return t('loAturdis');
    if (c().caraDePoker) return fichaDe('aumento', 'caradepoker').nombre;
    return t('tuEscudo');
  };
  function enemigoHtml(): string {
    const e = enemigo;
    if (!e) return '';
    const palo = tx(PALO_NOMBRE[e.palo]);
    // «INMUNE A ESPADAS»: el rótulo dice a qué (en el móvil, donde no entra, queda «INMUNE» y el palo va en el escudo)
    const aQue = t('inmuneA', { palo }).slice(t('inmune').length);
    const inmune = tieneAmuleto(p, 'doscaras')
      ? ''
      : `<span class="e-sello e-inmune mirable" tabindex="0" ${tip(`${t('inmune')}: ${palo}`, idioma() === 'en' ? `${palo} cards deal no Damage to this enemy.` : `Las cartas de ${palo} no le hacen Daño.`)}>${pxInmune(e.palo)}<b class="rotulo">${t('inmune')}<span class="solo-ancho">${esc(aQue)}</span></b></span>`;
    const estados = `${e.aturdido > 0 ? `<span class="e-sello mirable" tabindex="0" ${tip(t('aturdido'), t('aturdidoTip'))}>${pxHud('aturdido')}<b class="rotulo">${t('aturdido')}${e.aturdido > 1 ? ` ${e.aturdido}` : ''}</b></span>` : ''}${e.elite ? `<span class="chip maldicion">${t('elite')}</span>` : ''}`;
    // a media Vida el rasgo cede su lugar a la segunda cara, que queda a la vista hasta el final del duelo: su nombre
    // y, debajo, la regla en un renglón corto («Si repetís jugada, TE PEGA ×2»); la regla entera, al inspeccionarla.
    // Va al costado de la barra de Vida (en el móvil, debajo; en el teléfono bajo, dentro de la barra)
    const rasgoNombre = e.jefe ? tx(e.segunda ? REY_DEF[e.palo].segunda : REY_DEF[e.palo].rasgo) : '';
    const rasgoTip = e.jefe ? tip(rasgoNombre, tx(e.segunda ? REY_DEF[e.palo].segundaDesc : REY_DEF[e.palo].rasgoDesc), e.segunda ? t('segundaCara') : '') : '';
    // (las dos caras con la misma forma: el nombre y, debajo, lo que hace en un renglón; la primera en oro, la segunda
    // en carmesí y latiendo)
    const rasgo = !e.jefe
      ? ''
      : `<span class="e-rasgo ${e.segunda ? 'e-segunda' : 'e-primera'} mirable" tabindex="0" ${rasgoTip}><b class="rotulo e-seg-nombre">${esc(rasgoNombre)}</b><span class="e-regla">${esc(tx((e.segunda ? SEGUNDA_CORTA : RASGO_CORTA)[e.palo]))}</span></span>`;
    const pct = Math.max(0, Math.round((100 * e.vida) / e.vidaMax));
    // la Furia ya va sumada en la cifra de TE PEGA: su chip lo dice («ya incluida») y dice cuánto sube por turno
    const porTurno = e.jefe ? B.furia.reyPorTurno + (e.palo === 'S' ? B.reyes.S.furiaTurno : 0) : 0;
    const notaFuria = `${t('furiaIncluida')}${porTurno ? ` · ${t('furiaTurno', { n: porTurno })}` : ''}`;
    const furiaHtml = furia
      ? `<span class="e-furia"><span class="e-furia-chip">${pxHud('furia')}<b class="rotulo">${t('furia')}</b>${cifra(furia, 'oro')}</span><span class="e-furia-nota"><span class="solo-ancho">${esc(t('furiaIncluida'))}${porTurno ? `<span class="fn-2"><i class="fn-sep" aria-hidden="true"> · </i>${esc(t('furiaTurno', { n: porTurno }))}</span>` : ''}</span><span class="solo-movil">${esc(t('furiaIncl'))}${porTurno ? `<br>${esc(t('furiaTurnoCorto', { n: porTurno }))}` : ''}</span></span></span>`
      : '';
    // el Tajo de revés armado: una sola fórmula, igual antes de soltar y durante el golpe. La cifra grande es lo que
    // te pega de verdad (42) y debajo, chica, su causa («21 ×2»); nunca un ×2 pegado a la cifra. Lo pone
    // `pintarCuenta` según la selección (y `poderRey` en el golpe)
    const tajoHtml = tajoArmado(e) ? `<b class="e-tajo" aria-hidden="true"><span class="e-tajo-n">${e.ataque + furia}</span> ×${B.reyes.S.deguello}</b>` : '';
    return `<div class="e-sellos">${inmune}${estados}</div>
      <div class="e-centro" data-soltar="enemigo">
        <i class="e-pano"></i>
        <div class="e-carta ${e.jefe ? 'jefe' : ''} ${e.segunda ? 'segunda' : ''} ${e.aturdido > 0 ? 'aturdido' : ''} ${furia > 0 ? 'con-furia' : ''}" data-carta data-palo="${e.palo}" data-rango="${e.rango}" data-jefe="${e.jefe ? '1' : '0'}" data-segunda="${e.segunda ? '1' : '0'}" style="--aura:${e.segunda ? AURA_SEGUNDA[e.palo] : AURA[e.palo]}">${e.jefe ? reyHtml(e.palo, e.segunda ? 'habla' : 'calma') : pxNaipe({ palo: e.palo, n: e.rango })}<i class="e-indice" aria-hidden="true"></i>${e.aturdido > 0 ? '<span class="e-estrellas" aria-hidden="true"><i>★</i><i>★</i><i>★</i></span>' : ''}</div>
        <i class="e-halo" aria-hidden="true"></i>
        <span class="e-suelta chip canto">${t('soltaAca')}</span>
      </div>
      <div class="e-ataque mirable ${e.aturdido > 0 ? 'dormido' : ''}" data-ataque tabindex="0" ${tip(`${t('tePegaRotulo')} ${e.ataque + furia}`, t('tePegaTip'), furia ? `${t('furia')} ${furia}: ${notaFuria}` : '')}>
        <b class="rotulo e-pega"><span class="ep-si">${t('tePegaRotulo')}</span><span class="ep-no" aria-hidden="true">${t('noTePega')}</span></b>
        ${furia ? `<i class="e-llamas n${furia >= 8 ? 3 : furia >= 4 ? 2 : 1}" aria-hidden="true">${pxHud('furia')}${pxHud('furia')}${pxHud('furia')}</i>` : ''}${pxHud('ataque')}<span class="e-golpe"><span data-n="ataque">${cifra(e.ataque + furia, 'roja', 'grande')}</span><b class="e-neto" hidden></b></span>${tajoHtml}
        ${furiaHtml}
      </div>
      <div class="e-barras">
        <div class="e-vida" role="img" aria-label="${esc(nombreEnemigo(e))}: ${t('vida')} ${e.vida}/${e.vidaMax}">
          <i class="b-vida" style="width:${pct}%"></i>
          <b class="e-nombre">${esc(nombreEnemigo(e))}</b>${e.jefe ? `<b class="e-nombre e-alias mirable ${e.segunda ? 'seg' : ''}" tabindex="0" ${rasgoTip}>${esc(rasgoNombre)}</b>` : ''}
          ${e.escudo > 0 ? `<i class="b-escudo" style="width:${Math.min(100, Math.round((100 * e.escudo) / e.vidaMax))}%"></i>` : ''}
          <span class="e-cifras">${cifra(e.vida, 'hueso')}${cifra(`/${e.vidaMax}`, 'hueso')}${e.escudo > 0 ? `<span class="e-esc">${pxHud('escudo')}${cifra(e.escudo, 'azul')}</span>` : ''}</span>
        </div>
        ${rasgo}
      </div>`;
  }
  function corteHtml(): string {
    if (!resto.length) return '';
    return `<span class="rotulo">${t('corte')}</span>
      <div class="corte-pila">${resto
        .map((e, i) => `<span class="corte-carta ${e.jefe ? 'corte-rey' : ''} mirable" tabindex="0" style="--i:${i}" ${tip(nombreEnemigo(e), `${t('vida')} ${e.vida} · ${t('tePegaRotulo')} ${e.ataque}`, e.jefe ? tx(REY_DEF[e.palo].rasgoDesc) : '')}>${e.jefe ? reyHtml(e.palo, 'calma') : pxNaipe({ palo: e.palo, n: e.rango })}</span>`)
        .join('')}</div>
      <b class="rotulo corte-quedan">${t(resto.length === 1 ? 'queda' : 'quedan', { n: resto.length })}</b><span class="corte-n">${cifra(resto.length, 'hueso', 'grande')}</span>`;
  }
  function pasoNombre(de: string): string {
    if ((de.startsWith('mut:') || de.endsWith('-sin')) && PASO_NOMBRE[de]) return tx(PASO_NOMBRE[de]);
    const [clase, id] = de.split(':');
    // (0.22) la Evolución se nombra por lo que despertó
    if (clase === 'ev') return tx(EVOLUCION[id as EvolucionDe].nombre);
    if (clase === 'j') return tx(JUGADA_NOMBRE[id as keyof typeof JUGADA_NOMBRE]);
    if (clase === 'c') {
      const k = c().mano.find((x) => x.id === id);
      return k ? (k.palo === 'X' ? '★' : `${k.n}`) : '';
    }
    if (clase === 'a') return fichaDe('amuleto', id).nombre;
    if (clase === 'u') return fichaDe('aumento', id).nombre;
    if (clase === 'b') return fichaDe('bendicion', id).nombre;
    if (clase === 'r') return nombreCarga(id as Palo);
    if (de === 'canto') return tx(MAZO[p.mazoId].canto);
    // (el Dado Cargado se lee como lo que da: «MULTI +3», también en el teléfono)
    if (de === 'prox' && dadoArmado) return tx(PASO_NOMBRE.dado);
    return PASO_NOMBRE[de] ? tx(PASO_NOMBRE[de]) : de;
  }
  /** La ayuda corta de cada término del desglose: la de su pieza o la del glosario. */
  function pasoAyuda(de: string): string {
    if ((de.startsWith('mut:') || de.endsWith('-sin')) && PASO_AYUDA[de]) return tx(PASO_AYUDA[de]);
    const [clase, id] = de.split(':');
    if (clase === 'ev') return tx(EVOLUCION[id as EvolucionDe].desc);
    if (clase === 'a') return fichaDe('amuleto', id).desc;
    if (clase === 'u') return fichaDe('aumento', id).desc;
    if (clase === 'b') return fichaDe('bendicion', id).desc;
    if (clase === 'r') return cargaQue(p, id as Palo);
    if (clase === 'j' || clase === 'c') return tx(PASO_AYUDA[clase]);
    if (de === 'prox' && dadoArmado) return tx(PASO_AYUDA.dado);
    return PASO_AYUDA[de] ? tx(PASO_AYUDA[de]) : '';
  }
  /** El icono chico de cada término del desglose: el de su pieza en la bandeja del HUD o, si no es una pieza, un glifo de su tipo. */
  function pasoIcono(de: string): string {
    const [clase, id0] = de.split(':');
    // (la Evolución lleva el icono de su Amuleto, prismático; el Cascabel sin canto, el del Cascabel)
    const id = id0?.replace(/-sin$/, '');
    if (clase === 'ev') return pxEvolucion(id, 'd-i');
    if (de === 'mut:doblefilo') return pxHud('doblefilo', 'd-i');
    if (clase === 'a') return pxAmuleto(id as AmuletoId, 'd-i');
    if (clase === 'u') return pxAumento(id as AumentoId, 'd-i');
    if (clase === 'b') return pxBendicion(id as BendicionId, 'd-i');
    if (clase === 'r') return pxPalo(id as Palo, 'd-i');
    if (clase === 'j' || de === 'mano') return pxHud('mazo', 'd-i');
    if (de === 'canto' || de === 'cantos') return pxEstrella('d-i');
    if (de === 'temple' || de === 'templada' || de === 'brava-forja') return pxNodo('fogon', 'd-i');
    if (de === 'combate') return pxAumento('manocaliente' as AumentoId, 'd-i');
    if (de === 'posta:medio') return pxHud('medio', 'd-i');
    if (de === 'posta:chispa') return pxHud('chispa', 'd-i');
    if (de === 'posta:escalon') return pxHud('escalon', 'd-i');
    if (de === 'prox' && dadoArmado) return pxChiche('dado', 'd-i');
    return pxHud('ataque', 'd-i');
  }
  /** Si tu Escudo frena parte del golpe, la causa chica junto al TE PEGA neto («(21 − 2 ESCUDO)»), y también en la
   *  ayuda del chip: si la cuenta no cabe en un renglón, es lo primero que se va de la vista (`apretarCuenta`). */
  function frenaEscudo(q: Cuenta): { html: string; ayuda: string; causa: string } {
    const nada = { html: '', ayuda: '', causa: '' };
    const e = c().fila[0];
    if (!e || q.contra === null || q.contra <= 0) return nada;
    const k = contraataque(p, e, { sinVida: q.aVida === 0, repite: repiteJugada(c().ultimaJugada, q.jugada) });
    const frena = k.n - q.contra;
    if (frena <= 0) return nada;
    const causa = `${k.n} − ${frena} ${t('escudo')}`;
    return { html: `<b class="c-tajo-x c-frena">(${esc(causa)})</b>`, ayuda: tip(t('tePega', { n: q.contra }), causa), causa };
  }
  /**
   * (0.27) La cuenta y el paño se reparten el lugar sin mover la mano. En el escritorio, el desglose (con el dial y la
   * pista de LB / RB) baja a una columna a la izquierda y el paño, con sus naipes enteros, va a su derecha en la misma
   * franja: la cuenta ya no crece renglones ni achica la escena. En el teléfono, la zona de la mano toma YA su alto
   * (después `apretarCuenta` pliega la cuenta si la escena queda por debajo de su piso).
   */
  let filaCuenta = 56;
  function acomodarCuenta(zona: HTMLElement): void {
    if (innerWidth <= 700 || !mano) return;
    const zm = $<HTMLElement>('[data-mano]');
    if (!zm) return;
    const rz = zona.getBoundingClientRect();
    const bajo = zona.querySelector<HTMLElement>('.c-bajo');
    const cu = bajo?.parentElement as HTMLElement | null | undefined;
    if (bajo && cu) {
      // (0.28) la columna cae en la franja fija de lo jugado (arriba de la mano, que no se mueve): su techo es el de la
      // zona de la mano y su alto, el del paño. (0.29) Si no entra cede por pasos sin cortar un nombre (`desglose.ts`):
      // la pista, los renglones, los nombres cortos escritos a mano y, al final, «otras +N»; a 1080p va en dos columnas
      const kp = Number(getComputedStyle(zm).getPropertyValue('--k-pano')) || 1;
      const techo = zm.getBoundingClientRect().top;
      const tope = 140 * kp + 12;
      // (la columna de la derecha llega hasta el borde de la mesa solo si los botones empiezan por debajo de la franja)
      const rb = $('.mesa .botones')?.getBoundingClientRect();
      const zonaDer = rb && rb.top < techo + tope - 2 ? Math.min(rz.right, rb.left) : rz.right;
      encajarDesglose({ bajo, cu, izq: mano.panoIzq(), der: mano.panoDer(), zonaIzq: rz.left, zonaDer, techo, tope });
      filaCuenta = cu.offsetTop + cu.clientTop + bajo.offsetTop;
    }
  }
  /**
   * La cuenta va en un solo renglón de chips más su desglose: si en la Deck o el portátil (701–1699 px) no cabe, se
   * aprieta por pasos en lugar de crecer un renglón (que achicaba la escena y la hacía saltar al elegir): primero se va
   * la causa del TE PEGA neto (queda en la ayuda del chip); después los efectos quedan con su icono y su cifra, sin el
   * nombre (como en el teléfono); después se va el chip de la jugada (su nombre sigue en el desglose); por último, la
   * causa de NO TE PEGA (en la ayuda de su chip).
   */
  function apretarCuenta(zona: HTMLElement): void {
    const cu = zona.querySelector<HTMLElement>('.cuenta:not(.reposo):not(.invalida)');
    if (!cu) return;
    cu.classList.remove('apretada', 'apretada-2', 'apretada-3', 'apretada-4', 'apretada-tel', 'apretada-tel-2', 'desglose-junto', 'plegada', 'plegada-2', 'plegada-3', 'plegada-4', 'holgada');
    // en el teléfono, si el desglose pasa de dos renglones, la cuenta pierde su aire (y sus términos se juntan) para
    // que el naipe del Rey siga asomando por arriba
    if (window.innerWidth <= 700) {
      const dd = cu.querySelector<HTMLElement>('.c-desglose');
      // si DAÑO y MULTI caben uno al lado del otro («DAÑO 4 +2 · MULTI Carta sola 1 +2»), van en un solo renglón: el
      // naipe del Rey gana ese renglón entero
      const filas = dd ? [...dd.querySelectorAll<HTMLElement>(':scope > .d-fila')] : [];
      if (dd && filas.length === 2 && filas.reduce((s, x) => s + x.offsetWidth, 0) + 16 <= Math.max(cu.clientWidth, zona.clientWidth) - 16) cu.classList.add('desglose-junto');
      if (dd && dd.offsetHeight > 46) cu.classList.add('apretada-tel');
      // y si los chips no caben en un renglón, primero se va la causa del TE PEGA neto (queda en la ayuda del chip) y
      // después el chip del canto (el canto sigue en el desglose: «¡ESCOBA! ×2»)
      const ch = cu.querySelector<HTMLElement>('.c-chips');
      if (ch && ch.offsetHeight > 42 && cu.querySelector('.c-frena')) cu.classList.add('apretada');
      if (ch && ch.offsetHeight > 42 && cu.querySelector('.c-canto')) cu.classList.add('apretada-tel-2');
      // (0.27) «el dedo manda»: la mano no cede nunca, así que si la escena queda por debajo de su piso (80 px del naipe
      // del enemigo y su barra) cede la cuenta: se junta, después pliega el desglose (queda a un toque, en su ayuda) y
      // por último va toda en un renglón («66×6=396 · TE PEGA 19»)
      // (0.29) UNA sola cuenta para todo el teléfono: el renglón fijo de dos pisos (jugada · fórmula · palos / TE PEGA ·
      // LE QUEDAN) es la forma de siempre, con cualquier alto, y la hoja con nombres está siempre a un toque. Se fue la
      // cuenta desplegada de iconos mudos; el alto que deja es del enemigo. Con lugar de sobra, el renglón va «holgado»
      // (cifras al doble)
      const escena = $<HTMLElement>('[data-escena]');
      cu.classList.add('apretada-tel', 'plegada', 'plegada-2', 'holgada');
      if (!escena || escena.clientHeight < 150) cu.classList.remove('holgada');
      // (0.28) plegada a su renglón fijo (jugada · fórmula · lo que dan los palos · desenlace), si aun así no entra en dos
      // renglones suelta primero lo que sobra o le queda (está en la hoja) y después lo que dan los palos; el nombre de la
      // jugada no se va nunca
      if (cu.classList.contains('plegada-2')) {
        const fo = cu.querySelector<HTMLElement>('.c-formula');
        const sc = getComputedStyle(cu);
        const ancho = cu.clientWidth - (parseFloat(sc.paddingLeft) || 0) - (parseFloat(sc.paddingRight) || 0);
        // (holgada son dos pisos de cifras al doble: si no entra en dos pisos así, primero deja de ir holgada)
        const desborda = (el: HTMLElement | null): boolean => !!el && (el.offsetWidth > ancho || el.scrollWidth > el.clientWidth + 1);
        if (cu.classList.contains('holgada') && (cu.offsetHeight > 88 || desborda(ch) || desborda(fo))) cu.classList.remove('holgada');
        const alta = (): boolean => cu.offsetHeight > (cu.classList.contains('holgada') ? 88 : 58);
        // (el piso del desenlace no entra: se va lo que sobra o le queda; el de la fórmula no entra: lo que dan los palos)
        if (alta() || desborda(ch)) cu.classList.add('plegada-3');
        if (alta() || desborda(fo)) cu.classList.add('plegada-4');
      }
      marcarPlegada(cu);
      return;
    }
    const f = cu.querySelector<HTMLElement>('.c-formula');
    const rev = cu.querySelector<HTMLElement>('.c-revelado');
    const chips = cu.querySelector<HTMLElement>('.c-chips');
    if (!f || !rev) return;
    // se mide la cuenta entera: la fórmula partida, los chips que bajan de renglón y los que se parten ADENTRO de su
    // contenedor (lo que se le escapaba a la 0.19: «TE PEGA 3 (23 − 20 ESCUDO)» partía los chips en dos)
    const altoChip = (): number => Math.max(0, ...[...(chips?.children ?? [])].map((x) => (x as HTMLElement).offsetHeight));
    const parte = (): boolean =>
      f.offsetHeight > rev.offsetHeight + 10 ||
      (!!chips && (chips.offsetTop > f.offsetTop + 10 || (chips.children.length > 0 && chips.offsetHeight > altoChip() + 8) || chips.scrollWidth > chips.clientWidth + 1)) ||
      // (0.27: y la cuenta entera no se sale de su zona: el veredicto no se monta sobre el chip vecino)
      cu.scrollWidth > cu.clientWidth + 1 ||
      cu.offsetWidth > zona.clientWidth;
    for (const nivel of ['apretada', 'apretada-2', 'apretada-3', 'apretada-4']) {
      if (!parte()) return;
      cu.classList.add(nivel);
    }
  }
  /**
   * (0.28) La cuenta plegada del teléfono es una diana: un toque la abre como HOJA sobre la escena (la cuenta entera: la
   * jugada, la fórmula, lo que dan los palos, el desglose con sus nombres, lo que sobra o le queda y lo que te pega), sin
   * mover la mano ni el paño; otro toque (en ella o en la hoja) la cierra, y se cierra sola al golpear o descartar.
   */
  let hojaAbierta = false;
  function marcarPlegada(cu: HTMLElement): void {
    const si = cu.matches('.plegada, .plegada-2');
    if (si) {
      cu.dataset.accion = 'hoja';
      cu.setAttribute('role', 'button');
      cu.setAttribute('aria-expanded', String(hojaAbierta));
      cu.setAttribute('aria-label', `${cu.querySelector('.c-jugada')?.textContent ?? ''} · ${t('verCuenta')}`);
      // (su ayuda al toque era la cuenta en prosa: ahora el toque abre la hoja)
      for (const a of ['data-tip', 'data-tip-t', 'data-tip-pie']) cu.removeAttribute(a);
      // (su «▾» es un botón de verdad, de 44 px: con el dedo, el toque no se le va al dial de al lado)
      if (!cu.querySelector('.c-abre')) cu.insertAdjacentHTML('beforeend', `<button type="button" class="c-abre" data-accion="hoja" aria-label="${esc(t('verCuenta'))}"></button>`);
    } else {
      delete cu.dataset.accion;
      cu.removeAttribute('role');
      cu.removeAttribute('aria-expanded');
      hojaAbierta = false;
    }
    pintarHoja();
  }
  function pintarHoja(): void {
    const vieja = document.querySelector<HTMLElement>('.mesa .cuenta-hoja');
    const cu = $<HTMLElement>('[data-cuenta] .cuenta.previa');
    if (!hojaAbierta || ocupado || !cu || !cu.matches('.plegada, .plegada-2')) {
      hojaAbierta = false;
      vieja?.remove();
      cu?.setAttribute('aria-expanded', 'false');
      cu?.classList.remove('abierta');
      return;
    }
    const sel = seleccion();
    const q = cuentaDe(sel);
    const h = vieja ?? document.createElement('div');
    h.className = 'cuenta-zona cuenta-hoja';
    h.dataset.accion = 'hoja';
    h.setAttribute('role', 'dialog');
    h.setAttribute('aria-label', t('verCuenta'));
    h.innerHTML = `<b class="hoja-rival rotulo">${enemigo ? `${esc(nombreEnemigo(enemigo))} · ${enemigo.vida}/${enemigo.vidaMax}` : ''}</b>${cuentaHtml(q, sel)}<b class="hoja-cierra rotulo" aria-hidden="true">${esc(t('cerrarCuenta'))}</b>`;
    if (!vieja) $('.mesa')?.append(h);
    // pegada arriba del renglón plegado: crece hacia la escena (la tapa mientras está abierta). Si entera no entra ahí
    // (el teléfono bajo), cuelga del borde de arriba de la pantalla y baja sobre su renglón y el paño: nunca sobre la mano
    // (0.29) la hoja nace BAJO la barra de Vida del rival (su nombre, su Vida y los botones «?» y «≡» siguen a la vista) y
    // baja sobre su renglón y el paño, nunca sobre la mano. Solo si entera no entra ahí sube: primero hasta el pie de
    // la cabecera y, en el teléfono más bajo, hasta el borde de la pantalla
    h.style.bottom = 'auto';
    h.style.maxHeight = '';
    h.style.top = '0px';
    const alto = h.offsetHeight;
    const techoMano = Math.min(innerHeight, ...[...document.querySelectorAll<HTMLElement>('[data-mano] .carta:not(.elegida):not(.volando)')].map((k) => k.getBoundingClientRect().top));
    const piso = techoMano - 8;
    const bajoBarra = ($('[data-enemigo] .e-vida')?.getBoundingClientRect().bottom ?? 0) + 6;
    const bajoCabecera = ($('.mesa .mesa-top')?.getBoundingClientRect().bottom ?? 0) + 4;
    const top = alto <= piso - bajoBarra ? bajoBarra : alto <= piso - bajoCabecera ? Math.max(bajoCabecera, piso - alto) : 6;
    h.classList.toggle('tapa-barra', top < bajoBarra - 8);
    // (con su renglón del rival la hoja es un poco más alta: se vuelve a apoyar en el piso)
    const top2 = h.classList.contains('tapa-barra') ? Math.max(alto + 22 <= piso - bajoCabecera ? bajoCabecera : 6, Math.min(top, piso - h.offsetHeight)) : top;
    h.style.top = `${Math.round(top2)}px`;
    h.style.maxHeight = `${Math.max(120, Math.round(piso - top2))}px`;
    // (en el teléfono más bajo ni así entra: el renglón del rival cede)
    if (h.scrollHeight > h.clientHeight + 2 && h.classList.contains('tapa-barra')) {
      h.classList.remove('tapa-barra');
      h.style.maxHeight = '';
      const top3 = Math.max(6, piso - h.offsetHeight);
      h.style.top = `${Math.round(top3)}px`;
      h.style.maxHeight = `${Math.max(120, Math.round(piso - top3))}px`;
    }
    cu.setAttribute('aria-expanded', 'true');
    cu.classList.add('abierta');
  }
  /**
   * Las cifras de la fórmula (Daño, Multi y el total) guardan el ancho de su cifra final: durante el conteo suben de
   * 1 a 700 sin que la fórmula cambie de ancho (ni los chips de renglón).
   */
  function fijarAnchos(zona: HTMLElement): void {
    for (const el of zona.querySelectorAll<HTMLElement>('.cuenta [data-cd] [data-v], .cuenta [data-cm] [data-v], .cuenta [data-total]')) {
      el.style.minWidth = '';
      el.style.minWidth = `${el.offsetWidth}px`;
    }
  }
  /**
   * (0.23) El dial del paño: si otra manera de apoyar estas mismas cartas abate con Golpe exacto, la cuenta ofrece el
   * dial DEJALO JUSTO (un toque, Y, R3 o X lo aplica); ya en el exacto, PEGÁ CON TODO vuelve a la disposición que más pega. La
   * cuenta siempre dice lo que hay en el paño.
   */
  function dialDe(q: Cuenta, sel: Carta[]): { postas: number[]; exacto: boolean } | null {
    if (!q.ok || !sel.length || !mano || !enemigo) return null;
    if (!q.exacto) {
      const ex = acomodoExacto(p, sel);
      return ex ? { postas: ex, exacto: true } : null;
    }
    // (0.25) sin Perfora la mesa ya apoya sola el exacto (pegar con todo no gana nada); con Perfora, solo si hay alguien
    // detrás de la Corte que reciba lo que sobra
    const max = mejorAcomodo(p, sel);
    const ahora = postasDeSel(sel) ?? [];
    const qm = cuenta(p, sel, max);
    return !qm.exacto && (!qm.perfora || hayDetras()) && max.some((x, i) => x !== ahora[i]) ? { postas: max, exacto: false } : null;
  }
  /** ¿Queda alguien en la Corte detrás del enemigo activo? (lo que Perfora le sobra pasa a él) */
  const hayDetras = (): boolean => c().fila.length > 1;
  /**
   * (0.26) Lo que Perfora le sobra al que cae, con sus dos cifras: lo que sobra de verdad y lo que pasa («24 ×3 = 72»,
   * con el Facón que lo triplica). Sin nada que lo multiplique, una sola cifra.
   */
  function sobraCifras(q: Cuenta): { base: number; m: number; s: number } {
    const base = Math.max(0, q.aVida - (enemigo?.vida ?? 0));
    return { base, m: base > 0 ? Math.max(1, Math.round(q.sobra / base)) : 1, s: q.sobra };
  }
  const sobraTexto = (q: Cuenta): string => {
    const { base, m, s } = sobraCifras(q);
    return m > 1 ? `${base} ×${m} = ${s}` : String(s);
  };
  /** (0.26) Lo que el Garrote del Cacique gasta de tu Escudo si el golpe no abate (la mitad, redondeada para arriba). */
  // (0.29) si el motor ya lo trae en la cuenta (`q.gasta`: el golpe SIN BASTOS), manda eso; si no, la regla de la 0.28
  const gastaGarrote = (q: Cuenta): number => (!q.ok ? 0 : ((q as Cuenta & { gasta?: number }).gasta ?? (evoluciono(p, 'poncho') && !q.abate && !q.ejecuta ? Math.ceil(c().escudo * B.evoluciones.gasta) : 0)));
  /**
   * La maldición de una Evolución avisa antes de golpear, con su rótulo MALDICIÓN, el ícono de la pieza que cobra y lo
   * que cuesta: «−3 de Vida» (Facón, Brindis), «−5 de Escudo» (Garrote). Se puede mirar (foco y ayuda con el nombre de
   * la pieza y su regla).
   */
  function maldicionHtml(q: Cuenta): string {
    const costos: { de: EvolucionDe; txt: string }[] = [];
    const gasta = gastaGarrote(q);
    if (gasta > 0) costos.push({ de: 'poncho', txt: t('maldicionEscudo', { n: gasta }) });
    if (q.maldicion) {
      // (0.29) cada una cobra solo lo suyo: el Facón, el golpe que no abate; el Brindis, solo si la cuenta trae algo más
      // que lo del Facón (con las reglas nuevas ya no bebe Vida: su maldición es que tus Copas no curan)
      const deFacon = evoluciono(p, 'lanza') && !q.abate && !q.ejecuta ? B.evoluciones.facon.corta : 0;
      if (deFacon > 0) costos.push({ de: 'lanza', txt: t('maldicionVida', { n: deFacon }) });
      if (evoluciono(p, 'caliz') && q.maldicion - deFacon > 0) costos.push({ de: 'caliz', txt: t('maldicionVida', { n: q.maldicion - deFacon }) });
    }
    if (!costos.length) return '';
    const nombres = costos.map((x) => tx(EVOLUCION[x.de].nombre)).join(' · ');
    const titulo = `${t('maldicion')} · ${nombres}`;
    const cuerpo = costos.map((x) => `${tx(EVOLUCION[x.de].nombre)}: ${x.txt}`).join('\n');
    const pie = costos.map((x) => tx(EVOLUCION[x.de].desc)).join('\n');
    return `<span class="chip c-maldicion mirable" tabindex="0" aria-label="${esc(`${titulo}: ${costos.map((x) => x.txt).join(', ')}`)}" ${tip(titulo, cuerpo, pie)}><b class="c-mal-rot">${t('maldicion')}</b>${costos.map((x) => `${pxEvolucion(x.de, 'd-i')}<b class="c-mal-n">${esc(x.txt)}</b>`).join('')}</span>`;
  }
  /**
   * (0.25) Cómo apoya la mesa lo elegido: lo que más pega (sin Perfora, `mejorAcomodo` ya prefiere el exacto); con
   * Perfora y nadie detrás, lo que sobra no va a ningún lado, así que también apoya el exacto: nunca la opción peor.
   */
  function acomodoMesa(sel: Carta[]): number[] {
    const max = mejorAcomodo(p, sel);
    const q = cuenta(p, sel, max);
    if (q.ok && q.abate && !q.exacto && q.perfora && !hayDetras()) return acomodoExacto(p, sel) ?? max;
    return max;
  }
  /**
   * (0.24) El dial es una acción con verbo y premio: «DEJALO JUSTO · +3 de oro · +2 Multi al próximo» (lo que paga el
   * Golpe exacto, con la racha que sube) o, ya en el exacto, «PEGÁ CON TODO · +N al total». (0.25) Con Perfora dice
   * también lo que pierde cada lado: el exacto, lo que pasaba al siguiente; pegar con todo, el oro del exacto. Va en R3
   * (el mando: la Y queda siempre para DESCARTAR), X (el teclado) o un toque; color propio (prisma).
   */
  function dialHtml(q: Cuenta, sel: Carta[], d: { postas: number[]; exacto: boolean } | null): string {
    if (!d) return '';
    const multi = B.exacto.multi * Math.min(B.exacto.rachaTope, (p.racha ?? 0) + 1);
    const rot = t(d.exacto ? 'chipExacto' : 'chipMaximo');
    const otra = cuenta(p, sel, d.postas);
    // lo que pasaba (o pasa) al siguiente de la Corte con Perfora (0.26: con sus dos cifras, «24 ×3 = 72»)
    const conSobra = d.exacto ? q : otra;
    const conPasan = conSobra.sobra > 0 && hayDetras();
    // (en el teléfono, el dial con la cifra que pasa; sus dos cifras las dice el chip SOBRAN de la cuenta, debajo)
    const pasan = innerWidth > 700 ? sobraTexto(conSobra) : String(conSobra.sobra);
    const gana = d.exacto
      ? [t('chipExactoOro', { o: B.exacto.oro }), t('chipExactoMulti', { m: multi })]
      : [conPasan ? t('dialPasan', { n: pasan }) : t('chipMaximoPremio', { n: Math.max(0, otra.total - q.total) })];
    // (en el teléfono, lo que el exacto pierde queda en la ayuda: el chip de la cuenta, justo debajo, ya dice lo que pasa)
    // (0.27: también en el teléfono: la cuenta dice «72 PASAN» y el dial, que con él esos 72 no pasan)
    const pierde = d.exacto ? (conPasan ? [t('dialPierde', { n: pasan })] : []) : [t('dialSinOro', { o: B.exacto.oro })];
    const ayuda = d.exacto
      ? `${t('exactoTip', { o: B.exacto.oro, m: multi })}${conPasan ? ` ${t('dialPierdeTip', { n: pasan })}` : ''}`
      : conPasan
        ? t('maximoTipPerfora', { n: pasan, o: B.exacto.oro })
        : t('maximoTip');
    const premio = [...gana.map((x) => `<span>${esc(x)}</span>`), ...pierde.map((x) => `<span class="dial-pierde">${esc(x)}</span>`)];
    return `<button class="btn marco prisma c-dial ${d.exacto ? 'dial-exacto' : 'dial-maximo'}" data-accion="dial" data-tecla="x" data-foco="dial" ${tip(rot, ayuda)}>${glifo('R3', 'X')}<b class="dial-toca">${esc(t('dialToca'))}</b><span class="dial-txt"><b class="dial-verbo">${esc(rot)}</b><span class="dial-premio">${premio.join('<i class="dial-sep" aria-hidden="true"> · </i>')}</span></span></button>`;
  }
  /** Lo que la cuenta lleva en su propio renglón cuando el dial no entra al costado del paño. */
  let dialEnCuenta = '';
  /** ¿El dial ofrece el exacto (DEJALO JUSTO) o volver al máximo (PEGÁ CON TODO)? */
  let dialExacto = true;
  function cuentaHtml(q: Cuenta, sel: Carta[]): string {
    // en reposo, la zona de la cuenta dice qué hacer
    // (con mando o teclado, la pista es de botones: el CSS enseña la que toca según `html[data-entrada]`)
    // (con el Dado Cargado tirado, la cuenta en reposo ya dice lo que suma al próximo golpe)
    const dado = dadoArmado ? `<span class="chip d-dado" ${tip(tx(PASO_NOMBRE.dado), tx(PASO_AYUDA.dado))}>${pxChiche('dado', 'd-i')}${esc(tx(PASO_NOMBRE.dado))}: ${t('multi')} +${B.chiches.dado}</span>` : '';
    if (!sel.length)
      return `<div class="cuenta reposo">${dado}<span class="sub pista p-puntero">${t('elegiCartas')}</span><span class="sub pista p-botones">${glifo('A', 'ENTER')} ${t('pistaElige')} · ${glifo('LB', 'Q')}${glifo('RB', 'W')} ${t('pistaCorre')} · ${glifo('X', 'G')} ${t('pistaGolpea')} · ${glifo('Y', 'D')} ${t(c().pasar ? 'pistaPasa' : 'pistaDescarta')}${p.mazoId === 'mentiroso' && c().enganos > 0 ? ` · ${glifo('LT', 'E')} ${t('pistaEngana')}` : ''}</span></div>`;
    if (!q.ok) {
      const motivo = q.motivo === 'comodines' ? t('soloComodines') : q.motivo === 'muchas' ? t('muchas') : t('noJugada');
      return `<div class="cuenta invalida"><span class="chip">${motivo}</span></div>`;
    }
    const d = q.pasos.filter((x) => x.tipo === 'd').map((x) => `${pasoNombre(x.de)} +${x.v}`).join(' · ');
    const m = q.pasos.filter((x) => x.tipo !== 'd').map((x) => `${pasoNombre(x.de)} ${x.tipo === 'x' ? '×' : '+'}${x.v}`).join(' · ');
    // el desglose a la vista, antes de golpear: dos renglones rotulados. DAÑO: las cartas, la jugada y lo que suma Daño
    // («5 + 2 + 3 · Flor +6 · Mate +24»); MULTI: lo que suma Multi y, al final, lo que lo multiplica («Flor 2 · Mano
    // corta +4 · ¡ESCOBA! ×3»). Cada término lleva el icono de su pieza y, durante el conteo, se enciende en su lugar.
    const esCarta = (x: Paso): boolean => x.tipo === 'd' && x.de.startsWith('c:');
    const mas = (v: number): string => (v < 0 ? `−${-v}` : `+${v}`);
    const clave = (x: Paso): string => esc(`${x.tipo}|${x.de}`);
    // el Crítico de Punta y hacha vive en su término del MULTI: «¡CRÍTICO! ×2» en oro (en el teléfono, sin el nombre de
    // la pieza); el conteo lo enciende con su propio golpe. Nada de chip aparte ni de ×2 estampado sobre el total
    const esCritico = (x: Paso): boolean => q.critico && x.tipo === 'x' && x.de === 'b:puntahacha';
    const termino = (x: Paso, valor: string): string =>
      `<span class="d-t d-${x.tipo}${x.v < 0 ? ' d-neg' : ''}${/^[aubr]:/.test(x.de) ? ' d-pieza' : x.de.startsWith('j:') || x.de === 'canto' || x.de.startsWith('posta:') || (x.de === 'prox' && dadoArmado) ? ' d-nombre' : ''}${x.de.startsWith('posta:') ? ' d-posta' : ''}${esCritico(x) ? ' d-critico' : ''}" data-paso="${clave(x)}" ${tip(pasoNombre(x.de), pasoAyuda(x.de))}>${pasoIcono(x.de)}${nombreHtml(x.de === 'prox' && dadoArmado ? 'dado' : x.de, pasoNombre(x.de))}${esCritico(x) ? `<b class="d-crit">${t('critico')}</b>` : ''}<b class="d-v">${valor}</b></span>`;
    const cartasD = q.pasos.filter(esCarta);
    const piezasD = q.pasos.filter((x) => x.tipo === 'd' && !esCarta(x) && x.v !== 0);
    const sumanM = q.pasos.filter((x) => x.tipo === 'm' && x.v !== 0);
    const porM = q.pasos.filter((x) => x.tipo === 'x' && x.v !== 0);
    const filaD = [
      cartasD.length ? `<span class="d-cartas">${cartasD.map((x) => `<span class="d-t d-c" data-paso="${clave(x)}" ${tip(pasoNombre(x.de), tx(PASO_AYUDA.c))}><b class="d-v">${x.v}</b></span>`).join('<i class="d-op">+</i>')}</span>` : '',
      ...piezasD.map((x) => termino(x, mas(x.v))),
    ].filter(Boolean);
    // el primer sumando del Multi va sin signo (arranca de él); lo que multiplica, con su «×» pegado a la cifra
    const filaM = [...sumanM.map((x, i) => termino(x, i === 0 && x.v > 0 ? `${x.v}` : mas(x.v))), ...porM.map((x) => termino(x, `×${x.v}`))];
    const fila = (cls: string, rotulo: string, xs: string[], corto = rotulo): string => `<span class="d-fila ${cls}"><b class="d-rot"><span class="d-rot-l">${rotulo}</span>${corto !== rotulo ? `<span class="d-rot-c">${corto}</span>` : ''}</b><span class="d-terminos">${xs.length ? xs.join('<i class="d-sep" aria-hidden="true">·</i>') : '<b class="d-v">1</b>'}</span></span>`;
    const desglose = (corta0: string): string => `<span class="c-desglose">${corta0}${fila('d-fd', t('dano'), filaD, t('danoCorto'))}${fila('d-fm', t('multi'), filaM)}</span>`;
    // antes de soltar, la cuenta lo dice todo: el veredicto («LO ABATÍS», «NO LO ABATÍS», «¡EXACTO!», «¡AL PELO!»)
    // encabeza los chips, y la fórmula con su TOTAL, «LE QUEDAN»/«SOBRAN», TE PEGA y el desglose quedan a la vista
    // (0.18.1: esconder el total confundía); al soltar, el conteo vuelve a subir la fórmula término a término
    const vidaE = enemigo?.vida ?? 0;
    // (0.26) con Perfora y alguien detrás, lo que sobra dice también lo que pasa: «SOBRAN 24 ×3 = 72 PASAN»
    const sc = sobraCifras(q);
    const sobranTxt = q.perfora && q.sobra > 0 && hayDetras() ? (sc.m > 1 ? t(innerWidth > 700 ? 'sobranPasan' : 'sobranPasanCorto', { n: sc.base, m: sc.m, s: sc.s }) : t('sobranPasan1', { n: sc.base })) : t('sobranPierden', { n: q.aVida - vidaE });
    const revela = q.abate ? (q.exacto ? '' : sobranTxt) : !q.ejecuta && enemigo ? t('leQuedan', { n: Math.max(0, vidaE - q.aVida) }) : '';
    // (0.28) el «×3» de lo que pasa dice de quién es: el icono de la pieza que lo multiplica (el Facón Maldito o la Lanza)
    // pegado a la cifra, y su nombre y su regla al mirarlo
    const multiplica = q.perfora && q.sobra > 0 && hayDetras() && sc.m > 1;
    const deQuien = multiplica ? (evoluciono(p, 'lanza') ? { icono: pxEvolucion('lanza', 'd-i'), nombre: tx(EVOLUCION.lanza.nombre), desc: tx(EVOLUCION.lanza.desc) } : { icono: pxAmuleto('lanza' as AmuletoId, 'd-i'), nombre: fichaDe('amuleto', 'lanza').nombre, desc: fichaDe('amuleto', 'lanza').desc }) : null;
    const revelaHtml = deQuien ? esc(revela).replace(`×${sc.m}`, `${deQuien.icono}×${sc.m}`) : esc(revela);
    const queda = revela ? `<span class="chip c-queda c-revela${deQuien ? ' mirable' : ''}" ${deQuien ? `tabindex="0" ${tip(deQuien.nombre, deQuien.desc)}` : ''}>${revelaHtml}</span>` : '';
    // con el Tajo de revés armado, un solo chip y una sola fórmula, igual que en la placa del Rey: «TE PEGA 42 (21 ×2)»
    const tajo = tajoAhora(q);
    const k = B.reyes.S.deguello;
    const pega = tajo
      ? `<span class="chip rojo c-tajo" ${tip(t('tajoAviso', { nombre: tx(REY_DEF.S.segunda) }), tx(REY_DEF.S.segundaDesc))}>${pxHud('ataque')}${t('tePega', { n: q.contra ?? 0 })}<b class="c-tajo-x">(<span class="c-tajo-base">${Math.round((q.contra ?? 0) / k)} </span>×${k})</b></span>`
      : (() => {
          const f = frenaEscudo(q);
          return `<span class="chip rojo${f.ayuda ? ' mirable' : ''}" ${f.ayuda}>${t('tePega', { n: q.contra ?? 0 })}${f.html}</span>`;
        })();
    // «NO TE PEGA» dice por qué: aturdido, lo aturdís, Cara de Póker o tu Escudo
    const sinContra = (): string => {
      const causa = causaSinContra(q);
      return `<span class="chip azul c-nopega" ${causa ? tip(t('noTePega'), causa) : ''}>${t('noTePega')}${causa ? `<span class="c-causa"><i class="c-sep"> · </i>${esc(causa)}</span>` : ''}</span>`;
    };
    const planta = !!q.frenaEnMitad && !q.abate;
    const veredicto = q.abate
      ? q.exacto
        ? `<b class="c-veredicto v-exacto">${dialEnCuenta && !dialExacto ? t('estadoJusto') : t('exacto')}</b>`
        : q.alPelo
          ? `<b class="c-veredicto v-alpelo">${t('alPelo')}</b>`
          : `<b class="c-veredicto v-abate">${dialEnCuenta && dialExacto ? t('estadoTodo') : t('loAbatis')}</b>`
      : q.ejecuta
        ? `<b class="c-veredicto v-abate">${t('loAbatisDeguello')}</b>`
        : planta
          ? `<b class="c-veredicto v-planta mirable" ${tip(t('sePlanta'), t('sePlantaTip'))}>${t('sePlanta')}</b>`
          : ''; // si no lo abate, ya lo dicen «LE QUEDAN n» y TE PEGA: el veredicto no ocupa otro lugar
    // (el Rey en primera cara que se planta en la mitad: el veredicto dice eso, y «LE QUEDAN» sobra —es la mitad—)
    const contraEnPlaca = enemigo ? contraataque(p, enemigo).n : -1;
    const contraCambia = tajo || (q.contra ?? 0) !== Math.max(0, contraEnPlaca - c().escudo);
    const destino = (q.abate || q.ejecuta ? '' : q.contra && q.contra > 0 ? (contraCambia ? pega : '') : sinContra()) + (planta ? '' : queda);
    // lo que dan los palos, cada cosa con su nombre: «CURA ♥ +15», «ESCUDO +4», «ORO +2»
    const efecto = (rotulo: string, icono: Parameters<typeof pxHud>[0], n: number, tono: 'azul' | 'verde' | 'oro'): string =>
      `<span class="chip c-efecto ef-${icono}"><b class="c-ef-rot">${rotulo}</b>${pxHud(icono)}${cifra(`+${n}`, tono)}</span>`;
    // (0.26: las Copas vuelven a curar con el Garrote; el chip «Copas → Escudo» de la 0.25 se fue)
    // (0.27) ¡CHINCHÓN! corta la mano: su Escudo tiene renglón propio («CORTÁS · 4 cartas × 2 = +8 ESCUDO»); el chip
    // ESCUDO de arriba lleva solo lo que dan los Bastos
    const corta = q.cortaMano ?? 0;
    const quedan = Math.max(0, c().mano.length - sel.length);
    const porCarta = corta && quedan ? Math.round(corta / quedan) : 0;
    const cortaHtml = corta
      ? `<span class="c-corta mirable" tabindex="0" ${tip(`${tx(MAZO[p.mazoId].canto)} · ${t('cortas')}`, t('cortasTip', { e: porCarta }))}><b class="cc-verbo">${t('cortas')}</b><span class="cc-cuenta">${esc(t(quedan === 1 ? 'cortasCarta' : 'cortasCartas', { n: quedan, e: porCarta }))}</span><span class="cc-da">${pxHud('escudo')}${cifra(`+${corta}`, 'azul')}</span><b class="cc-que">${t('escudo')}</b></span>`
      : '';
    const escudoPalos = q.escudo - corta;
    // (0.29) con el Brindis de Sangre despierto tus Copas no curan: en el lugar del «CURA +N» lo dice, con su ícono
    const copasMudas = !q.cura && evoluciono(p, 'caliz') && q.ef.some((x) => x.palo === 'H');
    const sinCura = copasMudas ? `<span class="chip c-efecto c-sin-cura mirable" tabindex="0" ${tip(tx(EVOLUCION.caliz.nombre), tx(EVOLUCION.caliz.desc))}>${pxEvolucion('caliz', 'd-i')}<b class="c-ef-rot c-sin-cura-rot">${t('copasNoCuran')}</b></span>` : '';
    // (0.29) Truco: dos del mismo palo que no llegan al mínimo no cantan: la cuenta dice cuánto falta
    const minEnvido = (B.mazos.truco as { envidoMin?: number }).envidoMin ?? 0;
    const sumaPar = sel.length === 2 && sel[0].palo !== 'X' && sel[0].palo === sel[1].palo ? sel[0].n + sel[1].n : -1;
    const faltaEnvido = p.mazoId === 'truco' && !q.canto && sumaPar >= 0 && sumaPar < minEnvido ? `<span class="chip c-falta mirable" tabindex="0" ${tip(tx(MAZO.truco.canto), t('envidoFaltaTip', { m: minEnvido }))}>${esc(t('envidoFalta', { n: minEnvido - sumaPar }))}</span>` : '';
    const efectos = `${escudoPalos > 0 ? efecto(t('escudo'), 'escudo', escudoPalos, 'azul') : ''}${q.cura ? efecto(t('cura'), 'vida', q.cura, 'verde') : sinCura}${q.oro ? efecto(t('oro'), 'oro', q.oro, 'oro') : ''}`;
    const maldicionChip = maldicionHtml(q);
    // (0.27) con mando o teclado, cómo se corre de Posta (y qué hace R3): un renglón que no se parte, bajo el desglose
    const pistaPano = `<span class="c-pista-pano" aria-hidden="true"><span class="pp-uno">${glifo('LB', 'Q')}${glifo('RB', 'W')}<b>${esc(t('pistaCorre'))}</b></span>${dialEnCuenta ? `<span class="pp-uno">${glifo('R3', 'X')}<b>${esc(t(dialExacto ? 'pistaJusto' : 'pistaTodo'))}</b></span>` : ''}</span>`;
    return `<div class="cuenta previa ${q.abate || q.ejecuta ? 'abate' : ''}" ${tip(`${tx(JUGADA_NOMBRE[q.jugada])}: ${t('dano')} × ${t('multi')}`, d, m)}>
      <span class="c-formula">
        <span class="chip c-jugada">${esc(tx(JUGADA_NOMBRE[q.jugada]))}</span>
        <span class="c-revelado">
          <span class="c-numeros">
            <span class="c-parte" data-cd><span class="rotulo">${t('dano')}</span><span data-v>${cifra(q.dano, 'roja', 'grande')}</span></span>
            ${cifra('x', 'hueso')}
            <span class="c-parte${q.critico ? ' con-crit' : ''}" data-cm><span class="rotulo">${t('multi')}</span><span data-v>${cifra(q.multi, 'azul', 'grande')}</span></span>
            ${cifra('=', 'hueso')}
            <span class="c-total" data-total>${cifra(q.total, 'oro', 'grande')}</span>
          </span>
        </span>
        ${efectos ? `<span class="c-efectos">${efectos}</span>` : ''}
      </span>
      <span class="c-chips">${veredicto}${q.canto ? `<span class="chip canto c-canto">${esc(tx(MAZO[p.mazoId].canto))}</span>` : faltaEnvido}${q.perfora && enemigo && enemigo.escudo > 0 ? `<span class="chip azul">${t('perfora')}</span>` : ''}${destino}${maldicionChip}</span>
      <span class="c-bajo">${innerWidth > 700 ? desglose(cortaHtml) : cortaHtml + desglose('')}${dialEnCuenta ? `<span class="c-dial-fila">${dialEnCuenta}</span>` : ''}${pistaPano}</span>
    </div>`;
  }
  /**
   * La tajada que el golpe elegido le saca al enemigo, a la vista en su barra de Vida (sin cifra: la cifra la revela
   * el conteo). Con lo que abate, la barra entera late.
   */
  function marcarTajada(q: Cuenta | null): void {
    const barra = $('[data-enemigo] .e-vida');
    if (!barra) return;
    let el = barra.querySelector<HTMLElement>('.b-previa');
    if (!q || !q.ok || !enemigo || q.aVida <= 0) {
      el?.remove();
      return;
    }
    if (!el) {
      el = document.createElement('i');
      el.className = 'b-previa';
      el.setAttribute('aria-hidden', 'true');
      barra.querySelector('.b-vida')?.after(el);
    }
    const vida = Math.max(0, (100 * enemigo.vida) / enemigo.vidaMax);
    const saca = q.abate || q.ejecuta ? vida : Math.min(vida, (100 * q.aVida) / enemigo.vidaMax);
    el.style.left = `${(vida - saca).toFixed(2)}%`;
    el.style.width = `${saca.toFixed(2)}%`;
    el.classList.toggle('entera', q.abate || q.ejecuta);
  }
  function pintarCuenta(): void {
    const sel = seleccion();
    const q = cuentaDe(sel);
    const el = $('[data-cuenta]');
    // (0.24) el dial: al costado del paño si entra; si no, en su renglón de la cuenta. Y lo toma mientras está
    const d = dialDe(q, sel);
    const dial = dialHtml(q, sel, d);
    dialEnCuenta = dial;
    dialExacto = !d || d.exacto;
    $('.mesa')?.classList.toggle('con-dial', !!dial);
    if (d?.exacto) presentarDial();
    if (el) {
      el.innerHTML = cuentaHtml(q, sel);
      if (!sel.length || !q.ok) {
        hojaAbierta = false;
        pintarHoja();
      }
      fijarAnchos(el);
      mano?.ajustar();
      apretarCuenta(el);
      // (0.29: en el teléfono las cifras cambian de escala al plegarse: su ancho fijo se mide de nuevo, ya plegada —la
      // fórmula no queda estirada con huecos entre «×» y el Multi—)
      if (innerWidth <= 700) fijarAnchos(el);
      acomodarCuenta(el);
      // (0.29) la primera vez que aparecen, «CORTÁS» y «corre de Posta» llevan su ayuda de tres palabras (una vez y se va)
      if (!ocupado && q.ok && sel.length) {
        const corta = el.querySelector<HTMLElement>('.c-corta');
        const pista = el.querySelector<HTMLElement>('.c-pista-pano');
        if (corta) ayudaPrimera(corta, 'cortas', t('ayudaCortas'));
        else if (pista && pista.offsetParent && pista.offsetWidth > 0) ayudaPrimera(pista, 'posta', t('ayudaPosta'));
      }
      // con la letra recién cargada, se vuelve a medir (la de respaldo es de otro ancho)
      if (document.fonts.status !== 'loaded')
        void document.fonts.ready.then(() => {
          if (!el.isConnected) return;
          fijarAnchos(el);
          apretarCuenta(el);
          acomodarCuenta(el);
        });
    }
    marcarTajada(sel.length ? q : null);
    marcarPano(q, sel);
    reubicarGrito();
    reubicarTip();
    // el Ataque del enemigo late más fuerte cuando el golpe elegido no lo abate
    const ataque = $('[data-ataque]');
    ataque?.classList.toggle('inminente', !!enemigo && enemigo.aturdido <= 0 && !(q.ok && (q.abate || q.ejecuta)));
    ataque?.classList.toggle('mortal', q.ok && q.contra !== null && q.contra >= hud.vida);
    // un solo TE PEGA: con una jugada elegida, la placa del Rey dice lo mismo que el chip de la cuenta (lo que te llega
    // de verdad, ya descontado tu Escudo); sin elegir nada, su golpe entero. Con el Tajo de revés, el golpe de verdad
    // (42) y debajo, chica, su causa («21 ×2»); late en rojo
    // (0.20: también en reposo va neto, con su causa chica debajo —«(23 − 20 ESCUDO)»—: la placa nunca promete un golpe
    // que tu Escudo ya frena)
    const tajo = tajoAhora(q);
    if (enemigo) {
      const neto = golpeNeto(q, sel.length);
      let golpe = neto ?? enemigo.ataque + furia;
      let causa = '';
      let corto = '';
      if (neto !== null) {
        causa = tajo ? '' : neto === 0 ? causaSinContra(q) : frenaEscudo(q).causa;
      } else if (sel.length && q.ok && (q.abate || q.ejecuta)) {
        // (0.26) lo que abate no recibe contragolpe: la placa no vuelve al golpe crudo del naipe, dice NO TE PEGA · LO ABATÍS
        golpe = 0;
        causa = t('loAbatis');
      } else if (!sel.length && enemigo.aturdido <= 0 && c().caraDePoker) {
        // (0.21) con Cara de Póker este turno no te pega: la placa dice 0 y por qué, no el golpe crudo del naipe
        golpe = 0;
        causa = fichaDe('aumento', 'caradepoker').nombre;
        corto = pxAumento('caradepoker' as AumentoId);
      } else if (!sel.length && enemigo.aturdido <= 0) {
        const k = contraataque(p, enemigo, { repite: false });
        const frena = Math.min(Math.min(escudoTope(p), c().escudo), k.n - k.directo);
        if (frena > 0) {
          golpe = k.n - frena;
          causa = `${k.n} − ${frena} ${t('escudo')}`;
        }
      }
      ponerGolpeRey(golpe, tajo, causa, corto);
    }
    marcarInmunes();
    marcarCopias(q);
    marcarPagan(q);
    pintarBotones();
    // el retrato sonríe confiado apenas la selección marca un Golpe exacto
    gestoFijo(q.ok && q.exacto ? 'feroz' : null);
  }
  /** Lo que el paño marca según la cuenta: la Chispa entre un Comodín y el naipe de su derecha y el rótulo del Escalón. */
  let panoAntes = { chispas: 0, escalon: 0 };
  function marcarPano(q: Cuenta, sel: Carta[]): void {
    if (!mano) return;
    const chispas: number[] = [];
    if (q.ok && q.pasos.some((x) => x.de === 'posta:chispa')) {
      const en = new Map(sel.map((k) => [mano!.postaDe(k.id), k]));
      for (const [i, k] of en) {
        const der = en.get(i + 1);
        if (k.palo === 'X' && der && der.palo !== 'X') chispas.push(i);
      }
    }
    const escalon = q.ok && q.escalon ? (q.pasos.find((x) => x.de === 'posta:escalon')?.v ?? 0) : 0;
    mano.marcar({ chispas, escalon });
    // (lo nuevo suena: la Chispa chisporrotea y el Escalón sube sus notas)
    if (!enFoto() && chispas.length > panoAntes.chispas) sonar('chispa');
    if (!enFoto() && escalon && !panoAntes.escalon) sonar('escalon');
    panoAntes = { chispas: chispas.length, escalon };
  }
  /** La placa TE PEGA del Rey: la cifra grande (lo que pega de verdad) y, con el Tajo, su causa chica debajo («24 ×2»). */
  function ponerGolpeRey(golpe: number, tajo: boolean, causa = '', corto = ''): void {
    const ataque = $('[data-ataque]');
    if (!ataque) return;
    ataque.classList.toggle('tajo', tajo);
    // (0.26) si no te pega, y dice por qué, el rótulo lo dice: «NO TE PEGA · LO ABATÍS»
    const noPega = golpe === 0 && !!causa;
    ataque.classList.toggle('no-pega', noPega);
    // (los dos rótulos ocupan la misma celda: el más largo no ensancha la placa ni corre la mesa al elegir)
    const neto = ataque.querySelector<HTMLElement>('.e-neto');
    if (neto) {
      neto.innerHTML = causa ? causa.split(/ (?=[^ ]+$)/).map((x) => `<span>${esc(x)}</span>`).join('') : '';
      // (en el teléfono, la causa va en el renglón de abajo de la placa, corta y con su icono: «🛡 −20»)
      const frena = /− (\d+)/.exec(causa)?.[1];
      if (frena) neto.insertAdjacentHTML('beforeend', `<span class="neto-corto">${pxHud('escudo')}−${frena}</span>`);
      else if (corto) neto.insertAdjacentHTML('beforeend', `<span class="neto-corto">${corto}</span>`);
      // (en el teléfono la causa larga no entra en la placa: sin su versión corta, no abre renglón; el rótulo ya lo dice)
      neto.hidden = !causa || (innerWidth <= 700 && !frena && !corto);
    }
    const nAtaque = ataque.querySelector<HTMLElement>('[data-n="ataque"]');
    if (nAtaque && nAtaque.dataset.v !== String(golpe)) {
      nAtaque.innerHTML = cifra(golpe, 'roja', 'grande');
      nAtaque.dataset.v = String(golpe);
    }
    const base = ataque.querySelector<HTMLElement>('.e-tajo-n');
    if (base) base.textContent = String(Math.round(golpe / B.reyes.S.deguello));
  }
  /** Las cartas a las que el enemigo activo es Inmune llevan su marca en la mano (salvo con el Engaño armado). */
  function marcarInmunes(): void {
    const libre = !enemigo || tieneAmuleto(p, 'doscaras') || c().engano;
    for (const el of document.querySelectorAll<HTMLElement>('[data-mano] .carta')) {
      const si = !libre && el.dataset.palo === enemigo!.palo;
      if (si && !el.querySelector('.c-inmune')) el.insertAdjacentHTML('beforeend', `<span class="c-inmune" title="${t('noDana')}">${pxInmune(enemigo!.palo)}</span>`);
      if (!si) el.querySelector('.c-inmune')?.remove();
      el.classList.toggle('inmune', si);
    }
  }
  /** El Comodín elegido (y toda carta con el Engaño armado) muestra el número y el palo que copia. */
  function marcarCopias(q: Cuenta): void {
    const copias = new Map(q.ok ? q.ef.filter((x) => x.copia).map((x) => [x.de.id, x] as const) : []);
    for (const el of document.querySelectorAll<HTMLElement>('[data-mano] .carta')) {
      const x = copias.get(el.dataset.id ?? '');
      const clave = x ? `${x.n}${x.palo}` : '';
      const ya = el.querySelector<HTMLElement>('.c-copia');
      if (ya && ya.dataset.v !== clave) ya.remove();
      if (x && (!ya || ya.dataset.v !== clave)) el.insertAdjacentHTML('beforeend', `<span class="c-copia" data-v="${clave}" title="${t('copia')}">${cifra(x.n, 'hueso')}${pxPalo(x.palo)}</span>`);
      // el Comodín: un naipe espectral dorado de lo que copia, con su destello
      const esp = el.querySelector<HTMLElement>('.c-espectro');
      if (esp && esp.dataset.v !== clave) esp.remove();
      if (x && el.dataset.palo === 'X' && (!esp || esp.dataset.v !== clave)) {
        el.insertAdjacentHTML('beforeend', `<span class="c-espectro" data-v="${clave}" aria-hidden="true">${pxNaipe({ palo: x.palo, n: x.n })}</span>`);
        if (!quieto()) {
          const en = centro(el);
          destello(en.x, en.y, RAMPA_PALO.D, 18);
        }
      }
    }
  }
  /**
   * (0.27) Con ¡CHINCHÓN! a la vista, las cartas que te quedan en la mano son las que pagan: cada una lleva su sello de
   * Escudo («🛡 +2») y un brillo celeste. Jugar corto deja más cartas pagando; jugar largo, más Daño.
   */
  function marcarPagan(q: Cuenta): void {
    const corta = q.ok ? (q.cortaMano ?? 0) : 0;
    const quedan = Math.max(0, c().mano.length - seleccion().length);
    const por = corta && quedan ? Math.round(corta / quedan) : 0;
    for (const el of document.querySelectorAll<HTMLElement>('[data-mano] .carta')) {
      const si = por > 0 && !el.classList.contains('elegida');
      const ya = el.querySelector<HTMLElement>('.c-paga');
      if (ya && (!si || ya.dataset.v !== String(por))) ya.remove();
      if (si && (!ya || ya.dataset.v !== String(por))) el.insertAdjacentHTML('beforeend', `<span class="c-paga" data-v="${por}" title="${esc(t('cartaPaga', { e: por }))}">${pxHud('escudo')}<b>+${por}</b></span>`);
      el.classList.toggle('paga', si);
    }
  }
  function pintarBotones(): void {
    const sel = seleccion();
    const q = cuentaDe(sel);
    const g = $<HTMLButtonElement>('[data-accion="golpear"]');
    if (g) g.disabled = ocupado || !q.ok;
    const d = $<HTMLButtonElement>('[data-accion="descartar"]');
    const modo = puedeDescartar(p, sel.length);
    if (d) {
      d.disabled = ocupado || !sel.length || !modo;
      // (0.26) con el Sol de la Timba despierto cada descarte cuesta oro y, con oro, no se acaban: el botón dice el
      // costo («DESCARTAR · −3 oro») y el contador, «∞ con oro» mientras alcance
      const sol = evoluciono(p, 'cofre');
      const oroSol = B.evoluciones.sol.descarte;
      const infinito = sol && p.oro >= oroSol;
      // (en el teléfono, en dos renglones: «DESCARTAR ∞» y, debajo, «−3 oro»)
      const quedan = infinito
        ? `<span class="b-quedan b-infinito"><span class="bq-largo">(${esc(t('descartesOro'))})</span><span class="bq-corto" aria-hidden="true">∞</span></span>`
        : `<span class="b-quedan">(${c().descartes})</span>`;
      const nombre = sol ? `<span class="b-nombre">${t('descartar')}</span><span class="b-costo"><i class="b-sep" aria-hidden="true">· </i>${esc(t('descartarOro', { o: oroSol }))}</span>` : t('descartar');
      d.classList.toggle('con-sol', sol);
      const pasa = modo === 'gratis' || (c().pasar && !sel.length);
      d.classList.toggle('con-regla', pasa);
      d.classList.toggle('listo', !d.disabled && sel.length > 0);
      d.innerHTML = `${glifo('Y', 'D')}${pasa ? `<span class="b-nombre">${pxHud('pasar')} ${t('pasar')}</span><span class="b-regla">${esc(t('pasarRegla'))}</span>` : `${nombre} ${quedan}`}`;
      if (sol) for (const [k, v] of Object.entries({ 'data-tip-t': t('descartar'), 'data-tip': t('descartesOroTip', { o: oroSol }) })) d.setAttribute(k, v);
    }
    const e = $<HTMLButtonElement>('[data-accion="engano"]');
    if (e) {
      e.disabled = ocupado || c().enganos <= 0;
      const regla = e.querySelector<HTMLElement>('.b-regla');
      const dice = c().enganos > 0 ? t('enganoRegla', { n: c().enganos }) : t('enganoReglaCero');
      if (regla && regla.textContent !== dice) regla.textContent = dice;
      e.classList.toggle('oro', c().engano);
      e.setAttribute('aria-pressed', String(c().engano));
    }
  }
  function pintarEnemigo(): void {
    const el = $('[data-enemigo]');
    if (el) el.innerHTML = enemigoHtml();
    // (el Fósforo encendido quema el Inmune de este golpe: el sello queda tachado hasta que se golpea)
    el?.classList.toggle('sin-inmune', !!p.combate?.fosforo);
    // mientras se juega el golpe, la placa sigue diciendo lo que te va a pegar (19; con el Tajo, 48 y «24 ×2»)
    if (placa && enemigo) ponerGolpeRey(placa.n, placa.tajo, placa.causa);
    const corte = $('[data-corte]');
    if (corte) corte.innerHTML = corteHtml();
    marcarSucio3d();
  }
  function pintarArriba(): void {
    const el = $('[data-turno]');
    const racha = (p.racha ?? 0) > 0 ? ` <span class="chip canto t-racha" ${tip(t('racha', { n: p.racha }), idioma() === 'en' ? `Exact hits in a row. Your next exact hit gives +${Math.min(B.exacto.rachaTope, p.racha + 1)} Mult.` : `Golpes exactos seguidos. Tu próximo exacto da +${Math.min(B.exacto.rachaTope, p.racha + 1)} de Multi.`)}>${t('racha', { n: p.racha })}</span>` : '';
    const enRacha = (p.racha ?? 0) >= 2;
    $('.mesa')?.classList.toggle('racha', enRacha);
    ponerFuego(enRacha);
    estadoCombate({ tramo: p.acto, furia, racha: p.racha ?? 0, vidaPct: hud.vida / Math.max(1, hud.vidaMax), rey: enemigo?.jefe ? enemigo.palo : null, segunda: !!enemigo?.segunda });
    if (el) el.innerHTML = `${t('turno', { n: c().turno })}${racha}${c().dado ? ` <span class="dado" ${tip(idioma() === 'en' ? `Die: ${c().dado}` : `Dado: ${c().dado}`)}>${pxHud(`dado${c().dado}` as 'dado1')}</span>` : ''}`;
  }
  /** Pone toda la vista de acuerdo con el estado real (al empezar y al terminar cada acción). */
  function sincronizar(): void {
    if (!p.combate) return;
    hud = vistaDe(p);
    enemigo = c().fila[0] ? { ...c().fila[0] } : null;
    resto = c().fila.slice(1).map((e) => ({ ...e }));
    furia = c().furia;
    ponerHud(hud);
    pintarEnemigo();
    pintarArriba();
    mano?.poner(c().mano);
    pintarCuenta();
    actualizarTiras(p);
    ponerMesaLimpia();
  }

  // ───────────── animar los sucesos de una acción ─────────────
  async function animar(evs: Ev[], antes: Enemigo[], q: Cuenta | null): Promise<void> {
    let indice = 0;
    const carta = () => $('[data-carta]');
    // (0.25) tu mejor golpe respira: entre tu número grande (o cualquier golpe a un Rey) y lo que hace el Rey o el que
    // te pega hay ~600 ms de aire; TURBO (cualquier entrada) lo corta
    // (0.27) y todo golpe que no abate respira, escalonado: ~380 ms el de todos los días y ~600 el golpazo o el que le
    // cae a un Rey. Tu número se posa, suena su remate y recién después te pegan
    let tGolpe = 0;
    let msGolpe = 600;
    // (0.26) la maldición de una Evolución no le pisa el momento a tu número: el motor la cobra antes del daño, pero la
    // mesa la muestra después del respiro del número (lo que va antes de que te peguen, antes; nunca después)
    const golpeando = evs.some((x) => x.t === 'golpe');
    const pendientes: Extract<Ev, { t: 'maldicion' }>[] = [];
    let tDano = 0;
    let tMalEscudo = 0;
    const respiro = async (): Promise<void> => {
      const desde = tGolpe || (pendientes.length ? tDano : 0);
      const falta = desde ? (tGolpe ? msGolpe : 600) - (performance.now() - desde) : 0;
      tGolpe = 0;
      if (falta > 40) await pausa(falta);
      while (pendientes.length) await cobrarMaldicion(pendientes.shift()!);
    };
    const cobrarPendientes = async (): Promise<void> => {
      if (pendientes.length) await respiro();
    };
    // (0.24) el Rey que entra cuando Perfora le pasa lo que sobra: primero llega el número (en su color), después habla
    let irrumpe: Palo | null = null;
    const irrumpir = async (): Promise<void> => {
      if (!irrumpe) return;
      const palo = irrumpe;
      irrumpe = null;
      await pausa(quieto() ? 0 : 520);
      await entraRey(palo);
    };
    /** La irrupción del Rey que entra a la mesa (su retrato, su voz) y la cuenta que se apaga y vuelve contra él. */
    async function entraRey(palo: Palo): Promise<void> {
      ver(perfil, `r:${palo}`);
      sonar('rey');
      const en = centro(carta());
      haloRey(en.x, en.y, AURA[palo], 200);
      // (0.24) la cuenta del golpe anterior (al que ya cayó) se apaga antes de la irrupción: el Rey entra a una
      // mesa limpia, y recién después la cuenta vuelve a pintarse contra él
      const cz = $('[data-cuenta]');
      cz?.classList.add('se-apaga');
      await irrupcion(palo);
      pintarCuenta();
      cz?.classList.remove('se-apaga');
      voz(VOZ.entraRey, 'sombria');
      gritar(p.mazoId, tx(GRITO[p.mazoId].rey));
    }
    /**
     * (0.25) La maldición de una Evolución cobra, como el Doble Filo: el «−N» nace en su caja del HUD (Vida, oro o, con
     * el Garrote, Escudo) con el ícono de la Evolución que lo cobra, la ficha brinca en la bandeja y suena seco.
     */
    async function cobrarMaldicion(ev: Extract<Ev, { t: 'maldicion' }>): Promise<void> {
      const de: 'vida' | 'oro' | 'escudo' = ev.de === 'cofre' ? 'oro' : ev.de === 'poncho' ? 'escudo' : 'vida';
      if (de === 'escudo') tMalEscudo = performance.now();
      // (0.27) causa → efecto: el «−5 ESCUDO» nace adentro de su caja, con el ícono de la Evolución, la ficha brinca y
      // suena seco; recién después baja la cifra
      deltaHud(de, -ev.n, { icono: pxEvolucion(ev.de, 'hd-i') });
      dispararFicha(`a:${ev.de}`);
      sonar('maldicion');
      if (de !== 'oro') gestoRetrato('mueca', 700);
      await pausa(quieto() ? 0 : 150);
      if (de === 'oro') hud.oro = Math.max(0, hud.oro - ev.n);
      else if (de === 'escudo') hud.escudo = Math.max(0, hud.escudo - ev.n);
      else hud.vida = Math.max(1, hud.vida - ev.n);
      ponerHud(hud);
      await pausa(quieto() ? 0 : 220);
    }
    /**
     * (0.27) ¡CHINCHÓN! corta la mano: el Escudo nace DE las cartas que te quedaron sin jugar. Cada una late, suelta su
     * escudito con su «+N», que vuela a tu ESCUDO del HUD, y la cifra sube de a una carta (con su nota, que sube).
     */
    async function cortarMano(total: number): Promise<void> {
      const tope = escudoTope(p);
      const cartas = [...document.querySelectorAll<HTMLElement>('[data-mano] .carta:not(.volando)')];
      const a = $('[data-hud-escudo]');
      if (!cartas.length || !a || quieto()) {
        hud.escudo = Math.min(tope, hud.escudo + total);
        ponerHud(hud);
        return;
      }
      const ca = centro(a);
      const por = Math.max(1, Math.round(total / cartas.length));
      let resta = total;
      const vuelos: Promise<void>[] = [];
      for (let i = 0; i < cartas.length && resta > 0; i++) {
        const el = cartas[i];
        const n = i === cartas.length - 1 ? resta : Math.min(resta, por);
        resta -= n;
        el.classList.remove('paga-ya');
        void el.offsetWidth;
        el.classList.add('paga-ya');
        const r = el.getBoundingClientRect();
        const de = { x: r.left + Math.min(r.width / 2, 40), y: r.top + Math.min(r.height * 0.35, 56) };
        vuelos.push(
          volarEscudo(de, ca, n).then(() => {
            hud.escudo = Math.min(tope, hud.escudo + n);
            ponerHud(hud);
            sonar('corta', { altura: 1 + i * 0.06 });
            motas(ca.x, ca.y, RAMPA_ESCUDO, 4, 20);
          }),
        );
        await pausa(70);
      }
      await Promise.all(vuelos);
      for (const el of cartas) el.classList.remove('paga-ya');
      await pausa(200);
    }
    for (const ev of evs) {
      switch (ev.t) {
        case 'golpe': {
          const en = centro(carta());
          const palo = q?.ef.find((k) => k.palo !== enemigo?.palo)?.palo ?? q?.ef[0]?.palo ?? 'X';
          const r = (carta()?.getBoundingClientRect().width ?? 160) * 0.55;
          tajo(ev.engano ? 'X' : palo, en.x, en.y, r);
          const fuerte = !!enemigo && ev.total >= enemigo.vidaMax * 0.5;
          // tres escalones de peso: golpe, golpazo (media Vida o más) y remate (el que lo tumba)
          const peso = q?.abate || q?.ejecuta ? 2 : fuerte ? 1 : 0;
          sonar(fuerte || peso === 2 ? 'fuerte' : 'golpe');
          // y encima, el timbre de su palo: el acero canta, la madera suena hueca, el oro tintinea, la copa salpica
          if (!ev.engano && palo !== 'X') sonar(`palo${palo}` as 'paloS', { retraso: 0.025 });
          // (0.29: tiemblan el naipe y su barra; los sellos y la placa TE PEGA quedan quietos y se siguen leyendo)
          sacudir($('[data-enemigo] .e-centro'), peso + 1);
          sacudir($('[data-enemigo] .e-barras'), peso + 1);
          if (peso > 0) sacudir($('[data-escena]'), peso);
          fogonazoCandil([0.4, 0.7, 1][peso]);
          if (q?.exacto && q.abate) fogonazo('oro');
          await frenar([60, 110, 170][peso]);
          // (el ×2 del crítico ya se encendió en su término del MULTI durante el conteo y está adentro del total: no se
          // estampa otra vez)
          await pausa(90);
          break;
        }
        case 'canto': {
          const chancho = p.mazoId === 'chancho' ? (q?.jugada === 'poker' ? 2 : q?.jugada === 'pierna' ? 1 : 0) : 0;
          cantoMenor = chancho === 1;
          stinger(p.mazoId);
          agacharMusica(280, -5);
          if (!quieto()) {
            const en = centro(carta());
            if (p.mazoId === 'chancho') {
              if (chancho === 2) {
                fogonazo('oro');
                fogonazo3d(1.3);
              }
              sacudir($('[data-escena]'), chancho || 1);
              chispas(en.x, en.y - 30, RAMPA_PALO.D, chancho === 2 ? 18 : 10, chancho === 2 ? 100 : 60);
            } else if (p.mazoId === 'escoba') {
              fogonazo('oro');
              fogonazo3d(1.1);
              chispas(en.x, en.y - 30, RAMPA_PALO.D, 18, 95);
            } else if (p.mazoId === 'truco') {
              fogonazo('palo', '#ff6a33');
              sacudir($('[data-escena]'), 2);
              chispas(en.x, en.y - 30, RAMPA_PALO.H, 14, 85);
            } else if (p.mazoId === 'chinchon') {
              fogonazo('palo', '#4fe3ff');
              chispas(en.x, en.y - 30, RAMPA_PALO.S, 16, 90);
            } else {
              fogonazo('palo', '#b066ff');
              chispas(en.x, en.y - 30, RAMPA_ESCUDO, 14, 85);
            }
            const bEl = $('.esc-bufon .bufon');
            bEl?.classList.add('festeja');
            window.setTimeout(() => bEl?.classList.remove('festeja'), 750);
          }
          gestoRetrato('feroz', 1200);
          $('[data-cuenta] .c-canto')?.classList.add('salta');
          // el Personaje festeja con sus palabras (el nombre del canto ya lo dicen el sello grande y el chip de la cuenta)
          gritar(p.mazoId, tx(alAzar(GRITO[p.mazoId].canto, enFoto() ? 0 : undefined)));
          // el canto grande sale después del número (el número gana su carril y el canto se acomoda arriba del naipe)
          cantoPendiente = true;
          if (q?.cortaMano && !cortaDicha.has(p.semilla)) {
            cortaDicha.add(p.semilla);
            decir(t('bufonCorta'), 'brillo', 4200);
          } else if (Math.random() < 0.4) voz(VOZ.canto, 'risa');
          else gestoBufon($('.esc-bufon')!, 'risa');
          break;
        }
        case 'dano': {
          if (!enemigo) break;
          // el número del daño va por su carril (ver `carrilesDano`) y el director de escena lo aparta de los sellos,
          // del total y de lo que ya esté en el aire
          const cs = carrilesDano();
          // (si el Rey se planta en la mitad, la cifra es lo que de verdad entra —su Vida de antes menos la que le
          // queda— y debajo, en el mismo carril, su sello: «SE PLANTA · 279 SE PIERDEN»)
          const planta = !!q?.frenaEnMitad && !q.abate && !q.ejecuta && enemigo.jefe && !enemigo.segunda && ev.n === q.total;
          const entra = planta ? Math.max(0, enemigo.vida - ev.vida) + ev.aEscudo : ev.n;
          // (0.24) lo que Perfora le sobra al que cayó también respeta al Rey en su primera cara: entra hasta la mitad,
          // el resto se pierde (su sello lo dice) y enseguida se da vuelta (el suceso `segunda` que sigue)
          const iEv = evs.indexOf(ev);
          const sigueSegunda = evs[iEv + 1]?.t === 'segunda';
          const dePerfora = evs[iEv - 1]?.t === 'perfora';
          const plantaPerfora = dePerfora && sigueSegunda && enemigo.jefe && !!q?.sobra && q.sobra > ev.n;
          const pierde = plantaPerfora ? q!.sobra - ev.n : ev.n - entra;
          const grande = entra >= enemigo.vidaMax * 0.5;
          // (0.26) lo que Perfora pasa al siguiente lleva su color (púrpura): no se confunde con el celeste del Escudo
          const tono = dePerfora ? 'purpura' : ev.aEscudo >= ev.n || planta ? 'azul' : 'roja';
          // (0.28) el Rey que se planta: primero su sello, en su lugar fijo al costado de la barra; el número va por el otro
          // lado del naipe (nunca le pasa por encima)
          const sePlanta = (planta || plantaPerfora) && pierde > 0;
          if (sePlanta) selloPlanta(pierde);
          if (sePlanta) {
            const sin = cs.filter((k) => k.alinear !== 'izquierda');
            if (sin.length) cs.splice(0, cs.length, ...sin);
          }
          numero(entra, cs[0].x, cs[0].y, tono, grande || dePerfora ? 2 : 1, { carriles: cs, vx: cs[0].alinear === 'izquierda' ? 14 : cs[0].alinear === 'derecha' ? -14 : 0, vidaMin: grande ? 0.6 : 0.36 });
          tDano = performance.now();
          if (cantoPendiente) cantoGrande();
          const escudoAntes = enemigo.escudo;
          enemigo.vida = ev.vida;
          enemigo.escudo = ev.escudo;
          pintarEnemigo();
          if (!quieto() && escudoAntes > 0 && ev.escudo === 0) {
            const ec = centro(carta());
            sonar('quiebreEscudo');
            chispas(ec.x, ec.y, RAMPA_ESCUDO, 14, 100);
          }
          $('[data-carta]')?.classList.add('herido');
          if (!quieto() && enemigo) estallidoPalo3d(enemigo.palo, grande ? 1.4 : 0.9);
          if (sePlanta) gestoPlanta(pierde, enemigo.palo);
          if (ev.vida > 0) {
            tGolpe = performance.now();
            msGolpe = grande || enemigo.jefe ? 600 : 380;
            // (el remate del golpe chico: corto y limpio, con tu número ya posado; el grande ya trae su golpazo)
            if (!grande && !enemigo.jefe && !quieto()) sonar('remateChico', { retraso: 0.16 });
          }
          if (ev.n >= enemigo.vidaMax * 0.75) voz(VOZ.fuerte, 'risa');
          // (si enseguida se da vuelta, calla: habla su segunda cara)
          if (enemigo.jefe && ev.vida > 0 && !sigueSegunda && !irrumpe && ev.n >= enemigo.vidaMax * 0.3) reyDice(tx(REY_DEF[enemigo.palo].voz.duele));
          await pausa(160);
          // (0.26) el Rey que recibió lo que sobra habla recién ahora, con el número ya leído
          if (irrumpe) {
            if (plantaViva) await pausa(900);
            await irrumpir();
          }
          break;
        }
        case 'alpelo': {
          // te pasaste por un pelo: no cobra, pero la racha sigue viva. Suena a roce y a risita, no a Escudo
          stinger('alpelo');
          gestoRetrato('feroz', 900);
          gestoBufon($('.esc-bufon')!, 'risa');
          if (!quieto()) {
            const en = centro(carta());
            destello(en.x + 30, en.y - 40, RAMPA_PALO.D, 12);
            chispas(en.x + 30, en.y - 40, RAMPA_PALO.D, 8, 60);
          }
          if (Math.random() < 0.5) gritar(p.mazoId, t('alPelo'));
          break;
        }
        case 'segunda':
          await segundaCara(ev.palo);
          break;
        case 'exacto': {
          const en = centro(carta());
          destello(en.x, en.y, RAMPA_PALO.D, 26);
          sonar('exacto');
          stinger('exacto');
          agacharMusica(340, -7);
          if (!quieto()) {
            fogonazo('oro');
            fogonazo3d(1.4);
            sacudirCamara3d(0.6);
            const bEl = $('.esc-bufon .bufon');
            bEl?.classList.add('festeja');
            window.setTimeout(() => bEl?.classList.remove('festeja'), 850);
          }
          gestoRetrato('festejo', 1300);
          poseRetrato('festeja', 700);
          voz(VOZ.exacto, 'risa');
          if (Math.random() < 0.6) gritar(p.mazoId, tx(alAzar(GRITO[p.mazoId].exacto)));
          break;
        }
        case 'escudo': {
          const corta = Math.min(ev.n, q?.cortaMano ?? 0);
          const base = ev.n - corta;
          if (base > 0) {
            hud.escudo = Math.min(escudoTope(p), hud.escudo + base);
            ponerHud(hud);
            sonar('frena', { altura: 1.25 });
            const en = centro($('[data-hud-escudo]'));
            motas(en.x, en.y, RAMPA_ESCUDO, 8, 24);
          }
          if (corta > 0) await cortarMano(corta);
          break;
        }
        case 'cura': {
          hud.vida = Math.min(hud.vidaMax, hud.vida + ev.n);
          ponerHud(hud);
          const en = centro($('[data-hud-vida]'));
          motas(en.x, en.y, RAMPA_CURA, 10, 40);
          sonar('cura');
          break;
        }
        case 'oro': {
          const de = centro(carta() ?? $('[data-enemigo]'));
          const a = centro($('[data-hud-oro]'));
          monedas(de.x, de.y, a.x, a.y, Math.min(10, 2 + ev.n), () => {
            hud.oro += ev.n;
            ponerHud(hud);
            sonar('oro');
          });
          if (quieto()) {
            hud.oro += ev.n;
            ponerHud(hud);
          }
          break;
        }
        case 'carga':
          actualizarTiras(p, ev.rey);
          break;
        case 'aturde':
          if (enemigo) enemigo.aturdido = ev.turnos;
          // (0.29) el número del golpe que lo trajo se va antes: el sello no nace debajo de una cifra
          limpiarNumeros(true);
          pintarEnemigo();
          // (0.29) que se vea: el sello ATURDIDO cae con su golpe y sus estrellas (también sobre el que recién entra)
          if (!quieto()) {
            const sello = [...document.querySelectorAll<HTMLElement>('[data-enemigo] .e-sellos .e-sello:not(.e-inmune)')].pop();
            sello?.classList.add('nace');
            const rs = (sello ?? carta())?.getBoundingClientRect();
            if (rs) chispas(rs.left + rs.width / 2, rs.top + rs.height / 2, RAMPA_PALO.D, 8, 50);
            sonar('frena');
          }
          voz(VOZ.aturde, 'burla');
          // (el sello se lee antes de que el turno siga: sin esta pausa el «no te pega» lo borraba en el mismo cuadro)
          await pausa(quieto() ? 0 : 860);
          break;
        case 'cae': {
          // (0.29) la muerte con su cero: si lo remata el Degüello (le quedaba Vida), la barra barre hasta 0 y la cifra
          // dice 0 ANTES de que el naipe se parta
          if (enemigo && (enemigo.vida > 0 || enemigo.escudo > 0)) {
            enemigo.vida = 0;
            enemigo.escudo = 0;
            const barra = $<HTMLElement>('[data-enemigo] .e-vida');
            const b = barra?.querySelector<HTMLElement>('.b-vida');
            if (b) {
              b.classList.add('barre');
              b.style.width = '0%';
            }
            barra?.querySelector('.b-escudo')?.remove();
            barra?.querySelector('.b-previa')?.remove();
            const cif = barra?.querySelector('.e-cifras');
            if (cif) cif.innerHTML = `${cifra(0, 'hueso')}${cifra(`/${enemigo.vidaMax}`, 'hueso')}`;
            await pausa(quieto() ? 0 : 170);
          }
          // (el que cae ya no pega: su placa se apaga antes de que el naipe se parta)
          $('[data-ataque]')?.classList.add('se-va');
          const el = carta();
          const r = el?.getBoundingClientRect();
          const cayoRey = !!enemigo?.jefe;
          // el último de la mesa: en el mismo instante en que muere, la pelea se retira (su barra, sus rótulos, su TE PEGA,
          // la cuenta, la mano y los botones): no quedan colgados sobre una mesa ya ganada
          if (evs.some((x) => x.t === 'victoria') && !resto.length) despejar();
          if (enemigo?.jefe && !quieto()) {
            // el remate del tramo: la música remata con su cadencia (0.28: ya no calla), la mesa se congela en blanco y, enseguida, el naipe empieza a
            // rajarse en tres pasos (el temblor crece) mientras el Rey dice lo último; la frase sigue a la vista al partirse
            const palo = enemigo.palo;
            remateMusica(!!p.fin?.victoria);
            fogonazo('blanco');
            sacudir($('.mesa'), 3);
            await frenar(140);
            // (las últimas palabras toman la escena: el número del golpe ya se leyó y se apaga, como en la segunda cara)
            limpiarNumeros();
            document.querySelector('.e-dice')?.remove();
            const b = document.createElement('p');
            b.className = 'bocadillo sin-cola e-dice';
            $('[data-enemigo] .e-centro')?.append(b);
            const ms = teclear(b, tx(REY_DEF[palo].voz.cae), palo);
            ubicarDice(b, ms + 1600);
            const cada = Math.max(150, Math.min(240, Math.round(ms / 3)));
            for (let i = 1; i <= 3; i++) {
              const k = carta();
              k?.classList.remove('grieta-1', 'grieta-2', 'grieta-3');
              k?.classList.add(`grieta-${i}`);
              const rk = k?.getBoundingClientRect();
              if (rk) quiebre(rk.left + rk.width / 2, rk.top + rk.height / 2, rk.width * (0.4 + i * 0.18), AURA[palo], RAMPA_PALO[palo]);
              sonar('grieta', { altura: 1 + i * 0.12 });
              await pausa(cada);
            }
            window.setTimeout(() => b.remove(), 900);
          }
          // el Rey se parte con su propio sonido (hondo, que baja); los demás, con el de siempre
          sonar(cayoRey ? 'remate' : 'cae');
          if (cayoRey && !quieto()) {
            fogonazo('palo', AURA[enemigo!.palo]);
            sacudir($('[data-escena]'), 3);
          }
          if (r && enemigo) {
            if (!escena3dActiva()) {
              partirNaipe(enemigo.jefe && enemigo.segunda ? lienzoNaipeSegunda(enemigo.palo) : lienzoNaipe(enemigo.palo, enemigo.rango), r, RAMPA_PALO[enemigo.palo]);
            }
            if (enemigo.jefe && !quieto()) {
              fogonazo3d(1.6);
              sacudirCamara3d(0.9);
            }
            partirEnemigo3d(enemigo.palo, enemigo.rango, !!enemigo.segunda);
            el!.classList.add('partida');
            monedas(r.left + r.width / 2, r.top + r.height / 2, centro($('[data-hud-oro]')).x, centro($('[data-hud-oro]')).y, 5);
          }
          if (ev.ejecutado) voz(VOZ.fuerte, 'risa');
          // la rajadura termina antes de que entre el que sigue (y el Rey se queda un rato más en escena)
          await pausa(quieto() ? 420 : cayoRey ? 900 : 560);
          enemigo = null;
          placa = null;
          break;
        }
        case 'entra': {
          await cobrarPendientes();
          indice++;
          enemigo = antes[indice] ? { ...antes[indice] } : c().fila[0] ? { ...c().fila[0] } : null;
          resto = antes.slice(indice + 1).map((e) => ({ ...e }));
          pintarEnemigo();
          $('[data-carta]')?.classList.add('entra');
          // (0.26) si Perfora le pasa lo que sobra, el número llega primero (enseguida, en su color) y el Rey habla después
          if (ev.jefe && evs[evs.indexOf(ev) + 1]?.t === 'perfora') irrumpe = ev.palo;
          else if (ev.jefe) await entraRey(ev.palo);
          else voz(VOZ.entra, 'reposo');
          await pausa(irrumpe ? 120 : 220);
          break;
        }
        case 'perfora': {
          const en = centro(carta());
          tajo('S', en.x, en.y, 60);
          break;
        }
        case 'sincontra':
          await cobrarPendientes();
          if (ev.por === 'aturdido' && enemigo) enemigo.aturdido = Math.max(0, enemigo.aturdido - 1);
          // Cara de Póker: nada de cortina; la máscara se estampa sobre el enemigo («NO LLEGA») y su ficha brilla
          if (ev.por === 'caradepoker') await selloBufon('caradepoker', carta(), t('noLlega'));
          else sonar('frena');
          pintarEnemigo();
          break;
        case 'contra': {
          await respiro();
          // (0.26) si la maldición del Garrote acaba de cobrar en tu ESCUDO, su «−N» se lee antes de que te peguen
          // (0.27: la espera va ANTES del embiste: el embiste, los «−N» y las cifras que bajan salen juntos y en orden)
          if (ev.frenado > 0 && tMalEscudo) {
            const falta = 760 - (performance.now() - tMalEscudo);
            if (falta > 40) await pausa(falta);
          }
          // (tu número ya se leyó: se apaga del todo antes de que nazca lo que te pegan —0.28: forzado, el 170 no sigue
          // a la vista cuando nace el «−19»—)
          limpiarNumeros(true);
          placa = null;
          // el cartel de la segunda cara se va antes de que el Rey embista: nada tapa al que te pega
          quitarCartelSegunda();
          const el = carta();
          el?.classList.remove('embiste');
          void (el as HTMLElement | null)?.offsetWidth;
          el?.classList.add('embiste');
          if (enemigo?.jefe && !quieto()) poderRey3d(enemigo.palo);
          // (0.29: el apagado forzado de tu número dura 220 ms; el embiste pega en su ápice a 180 ms)
          await pausa(quieto() ? 110 : 180);
          const en = centro($('[data-hud-vida]'));
          const pierde = ev.n - ev.frenado;
          const vidaMax = hud.vidaMax;
          if (ev.frenado > 0) deltaHud('escudo', -ev.frenado, { ms: PLACA_CONTRA });
          if (ev.frenado > 0 && pierde > 0 && hud.escudo <= ev.frenado && !quieto()) {
            const es = centro($('[data-hud-escudo]'));
            sonar('quiebreEscudo');
            chispas(es.x, es.y, RAMPA_ESCUDO, 12, 85);
          }
          if (pierde > 0) {
            deltaHud('vida', -pierde, { ms: PLACA_CONTRA });
            chispas(en.x, en.y, RAMPA_GOLPE, 10, 80);
            sonar('contra');
            agacharMusica(180, -9);
            gestoRetrato('mueca', 900);
            if (enemigo?.jefe && ev.vida > 0 && pierde * 6 >= vidaMax) reyDice(tx(alAzar(REY_DEF[enemigo.palo].voz.pega)));
            if (ev.vida > 0 && ev.vida * 3 <= vidaMax) {
              window.setTimeout(() => {
                gestoRetrato('pavor', 1500);
                poseRetrato('tiembla', 1500);
              }, 900);
            }
            if (pierde * 5 >= vidaMax) {
              const dolor = tx(alAzar(GRITO[p.mazoId].dolor));
              const bEl = $('.esc-bufon .bufon');
              bEl?.classList.add('lamenta');
              window.setTimeout(() => bEl?.classList.remove('lamenta'), 800);
              window.setTimeout(() => p.combate && gritar(p.mazoId, dolor), quieto() ? 0 : 700);
            }
            sacudir($('[data-hud]'), 2);
            congelar(50);
            // (0.29) si tu Escudo frenó casi todo (dos tercios o más), lo dice: ya no «Y bue. A veces te toca.» tras un
            // ¡CHINCHÓN! que paró 28 de 31
            if (ev.vida * 3 <= vidaMax) voz(VOZ.pocaVida, 'sombria');
            else if (ev.frenado >= pierde * 2) voz(VOZ.casiFrenado, 'risa');
            else voz(VOZ.contra, 'burla');
          } else {
            const es = centro($('[data-hud-escudo]'));
            motas(es.x, es.y, RAMPA_ESCUDO, 12, 30);
            sonar('frena');
            voz(VOZ.frenado, 'risa');
          }
          await pausa(quieto() ? 0 : 130);
          hud.escudo = Math.max(0, hud.escudo - ev.frenado);
          hud.vida = ev.vida;
          ponerHud(hud);
          // (y la mano del turno nuevo no llega hasta que el «−N» se leyó y se fue)
          await pausa(quieto() ? 300 : PLACA_CONTRA - 130 + 20);
          break;
        }
        case 'contragolpe': {
          const en = centro(carta());
          tajo('C', en.x, en.y, 70);
          sonar('golpe');
          break;
        }
        case 'furia':
          furia += ev.n;
          pintarEnemigo();
          $('[data-ataque]')?.classList.add('sube');
          break;
        case 'rey':
          await respiro();
          quitarCartelSegunda();
          if (enemigo && !quieto()) poderRey3d(enemigo.palo);
          await poderRey(ev.que, ev.n);
          break;
        case 'roba': {
          const de = centro($('[data-accion="ver-mazo"]'));
          hud.mazo = Math.max(0, hud.mazo - ev.ids.length);
          ponerHud(hud);
          mano?.poner(c().mano, de);
          sonar('carta');
          break;
        }
        // (0.22) el Doble Filo de la Forja Brava te corta y el Cetro del Bufón cobra su precio: el «−N» va pegado a tu
        // VIDA, como lo que te pega el enemigo; Roba Carta avisa con un «+N» sobre la mano que llega
        case 'mutacion':
        case 'cobra': {
          if (ev.t === 'cobra' || ev.que === 'doblefilo') {
            if (ev.n <= 0) break;
            deltaHud('vida', -ev.n);
            sonar('frena');
            await pausa(quieto() ? 0 : 130);
            hud.vida = Math.max(1, hud.vida - ev.n);
            ponerHud(hud);
          } else if (ev.que === 'roba') {
            const m = $('[data-mano]')?.getBoundingClientRect();
            if (m) numero(`+${ev.n}`, m.left + m.width / 2, m.top, 'hueso', 1);
            sonar('carta');
          }
          break;
        }
        // (0.25) la maldición de una Evolución cobra, como el Doble Filo: el «−N» nace en su caja del HUD (Vida u oro) con
        // el ícono de la Evolución que lo cobra, la ficha brinca en la bandeja y suena seco
        case 'maldicion': {
          if (ev.n <= 0) break;
          // (0.26) en pleno golpe, espera al respiro del número; al descartar (el Sol), cobra en el acto
          if (golpeando) pendientes.push(ev);
          else await cobrarMaldicion(ev);
          break;
        }
        case 'baraja':
          hud.mazo = c().mazo.length + (evs.filter((x) => x.t === 'roba').length ? 0 : 0);
          ponerHud(hud);
          break;
        case 'sena':
          await selloBufon('senafalsa', $('[data-mano]'), '→ 7');
          break;
        case 'salva':
          await aparicion('irsealmazo');
          hud.vida = p.vida;
          ponerHud(hud);
          break;
        case 'dado':
          pintarArriba();
          break;
        case 'prenda':
          await prenda(ev.id);
          break;
        case 'victoria':
          await cobrarPendientes();
          await cobrar();
          break;
        case 'derrota':
          await cobrarPendientes();
          hud.vida = 0;
          ponerHud(hud);
          await pausa(900);
          break;
        default:
          break;
      }
    }
    await irrumpir();
    await cobrarPendientes();
    if (cantoPendiente) cantoGrande();
  }

  /**
   * La micro-escena del Bufón con la máscara del Rey (1,1 s): entra disfrazado de Rey, la levanta con una risa y la
   * máscara sale volando hacia la mesa, donde el Rey de verdad aparece. Cualquier entrada la salta.
   */
  function mascaraRey(palo: Palo): Promise<boolean> {
    sonar('bufon');
    return cortina(
      mascaraHtml(palo),
      1100,
      'irrupcion',
    );
  }
  /** La irrupción teatral de un Rey: su retrato, su aura y lo que te dice según lo que llevás de él. */
  function irrupcion(palo: Palo): Promise<boolean> {
    const r = REY_DEF[palo];
    const linea = donesDe(p, palo) > 0 ? r.voz.aliado : r.voz.ajeno;
    return cortina(
      `<div class="irr-banda" style="--aura:${AURA[palo]}">${reyHtml(palo, 'habla')}<div class="irr-texto"><b class="titulo">${esc(tx(r.apodo))}</b><span class="sub">${esc(tx(r.nombre))} · ${esc(tx(r.rasgo))}</span><p class="bocadillo sin-cola" data-teclea>${esc(tx(linea))}</p></div></div>`,
      1500,
      'irrupcion',
      (el) => teclear($('[data-teclea]', el), tx(linea), palo),
    );
  }
  /** La aparición chanta del Bufón cuando una de sus Cábalas hace de las suyas. */
  function aparicion(aumento: 'irsealmazo'): Promise<boolean> {
    const f = fichaDe('aumento', aumento);
    sonar('bufon');
    return cortina(`<div class="irr-banda bufonada">${bufonHtml('brillo')}<div class="irr-texto"><b class="titulo">${esc(f.nombre)}</b><p class="bocadillo sin-cola">${esc(f.desc)}</p></div></div>`, 1000, 'irrupcion');
  }
  /**
   * Una Cábala del Bufón que hace lo suyo en pleno combate (Cara de Póker, Seña Falsa): un sello corto y local sobre lo
   * que toca (el enemigo, la mano), su ficha que brilla en la bandeja, el cascabel y la risa del Bufón. Sin cortina:
   * no corta el golpe. Con «Reducir movimiento» el sello aparece quieto y se va igual.
   */
  async function selloBufon(aumento: 'caradepoker' | 'senafalsa', sobre: Element | null, extra: string): Promise<void> {
    sonar('mascara');
    gestoBufon($('.esc-bufon')!, 'risa');
    const f = dispararFicha(`u:${aumento}`);
    if (f && !quieto()) destello(f.x, f.y + 12, RAMPA_PALO.D, 14);
    if (enFoto()) return;
    const en = centro(sobre);
    const s = document.createElement('div');
    s.className = 'sello-bufon';
    s.setAttribute('role', 'status');
    s.innerHTML = `${pxAumento(aumento as AumentoId, 'sb-i')}<span class="sb-txt"><b class="rotulo">${esc(fichaDe('aumento', aumento).nombre)}</b><span class="sb-extra">${esc(extra)}</span></span>`;
    s.style.left = `${Math.round(en.x)}px`;
    s.style.top = `${Math.round(en.y)}px`;
    $('#capa')?.append(s);
    const alto = (sobre as HTMLElement | null)?.getBoundingClientRect().height ?? 120;
    if (!quieto()) ubicar(s, 'sello', 1000, [0, -0.3, 0.3].map((f) => () => void (s.style.top = `${Math.round(en.y + f * alto)}px`)));
    window.setTimeout(() => s.remove(), quieto() ? 1400 : 1000);
    await pausa(380);
  }
  /** La entrada del combate: el rótulo de lo que viene (o el Rey en persona). */
  async function entrada(): Promise<void> {
    if (tipo === 'rey') {
      const palo = c().fila[c().fila.length - 1].palo;
      // primero el Bufón con la máscara del Rey (se la arranca y la tira a la mesa); saltarla salta la entrada entera
      if (await mascaraRey(palo)) return;
      sonar('rey');
      await irrupcion(palo);
      return;
    }
    await cortina(`<div class="irr-banda rotulo-entrada"><b class="titulo">${esc(tx(NODO_NOMBRE[tipo]))}</b><span class="sub">${esc(tx(TRAMO_NOMBRE[Math.min(2, p.acto)]))}</span></div>`, 800, 'irrupcion');
  }

  /**
   * El bocadillo del Rey se pide al director de escena: en su lugar de siempre o, si ahí vuela el número de tu golpe o
   * el canto, adentro del naipe arriba o al pie (el texto por decir ya ocupa su lugar: se mide entero).
   */
  function ubicarDice(b: HTMLElement, ms: number): void {
    if (quieto()) return;
    const poner = (st: Partial<CSSStyleDeclaration>) => (): void => {
      b.style.top = st.top ?? '';
      b.style.bottom = st.bottom ?? '';
      b.style.left = st.left ?? '';
      b.style.right = st.right ?? '';
      b.style.translate = st.translate ?? '';
    };
    const arriba = (tr: string) => poner({ top: '6px', bottom: 'auto', left: '50%', right: 'auto', translate: tr });
    const abajo = (tr: string) => poner({ top: 'auto', bottom: '6px', left: '50%', right: 'auto', translate: tr });
    // (0.27) primero al pie de lo que se ve del naipe (arriba le tapaba la corona), después arriba
    const alts = [poner({}), abajo('-50% 0'), arriba('-50% 0'), abajo('-42% 0'), arriba('-42% 0'), abajo('-58% 0'), arriba('-58% 0'), abajo('-34% 0'), arriba('-34% 0'), abajo('-68% 0'), arriba('-68% 0')];
    const pd = ubicar(b, 'bocadillo', ms, alts);
    // (y si no hay dónde sin pisar el número de tu golpe, que pesa más, espera a que el número se vaya: no se le monta)
    const pisa = (): boolean => tomadas(pd.id).some((c) => pisan(pd.caja, c) > 0);
    if (pisa()) {
      soltarTurno(pd.id);
      b.style.visibility = 'hidden';
      window.setTimeout(() => {
        if (!b.isConnected) return;
        b.style.visibility = '';
        ubicar(b, 'bocadillo', Math.max(400, ms - 500), alts);
      }, 500);
    }
  }
  /** El Rey dice algo corto en plena pelea (no frena nada): un bocadillo tecleado con su voz, bajo su naipe. */
  let reyHablo = 0;
  function reyDice(texto: string): void {
    if (!enemigo?.jefe || quieto() || performance.now() - reyHablo < 5000) return;
    reyHablo = performance.now();
    document.querySelector('.e-dice')?.remove();
    const b = document.createElement('p');
    b.className = 'bocadillo sin-cola e-dice';
    $('[data-enemigo] .e-centro')?.append(b);
    const ms = teclear(b, texto, enemigo.palo);
    ubicarDice(b, ms + 1100);
    $('[data-carta]')?.classList.add('habla');
    window.setTimeout(() => {
      b.remove();
      $('[data-carta]')?.classList.remove('habla');
    }, ms + 1100);
  }
  /** El hitstop de verdad: se frenan el lienzo de efectos y las animaciones de la mesa y el HUD. */
  async function frenar(ms: number): Promise<void> {
    if (quieto()) return;
    congelar(ms);
    agacharMusica(ms + 60);
    const m = $('.mesa');
    m?.classList.add('hitstop');
    try {
      await pausa(ms);
    } finally {
      descongelar();
      m?.classList.remove('hitstop');
    }
  }
  /**
   * Un fogonazo de pantalla entera: blanco cuando cae un Rey, dorado en el Golpe exacto que mata y, del color que se
   * pida, un viñeteado que se cierra (la segunda cara, el Tajo de revés, la rajadura del Rey).
   */
  function fogonazo(tono: 'blanco' | 'oro' | 'palo', color = '#ff1453'): void {
    if (quieto()) return;
    const f = document.createElement('i');
    f.className = `fogonazo f-${tono}`;
    f.style.setProperty('--tinte', color);
    $('#capa')?.append(f);
    window.setTimeout(() => f.remove(), tono === 'palo' ? 620 : 420);
  }

  /**
   * Un rótulo corto sobre el naipe del Rey cuando hace lo suyo («FORTÍN +78», «REMATE −12 de oro», «ÚLTIMA RONDA
   * +30»): el nombre de lo que disparó y su cifra. Con «Reducir movimiento» aparece quieto y se va igual.
   */
  function rotuloRey(nombre: string, valor: string, tono: 'azul' | 'verde' | 'oro' | 'roja', extra = '', antes = '', bajo = false): void {
    if (enFoto()) return;
    const zona = $('[data-enemigo] .e-centro');
    if (!zona) return;
    zona.querySelector('.rey-rotulo')?.remove();
    const r = document.createElement('div');
    r.className = `rey-rotulo rr-${tono}${bajo ? ' rr-bajo' : ''}`;
    r.setAttribute('role', 'status');
    r.innerHTML = `<b class="rotulo">${esc(nombre)}</b><span class="rr-valor">${antes ? `<span class="rr-extra rr-antes">${esc(antes)}</span>` : ''}${valor ? cifra(valor, tono, 'grande') : ''}${extra ? `<span class="rr-extra">${esc(extra)}</span>` : ''}</span>`;
    zona.append(r);
    const ms = quieto() ? 1800 : 1500;
    // (0.23) el del Tajo va por debajo de la barra de Vida del Rey: nunca sobre su cara
    // (va en la capa de arriba: dentro del naipe, la cuenta de abajo lo tapaba)
    if (bajo) {
      const barras = $('[data-enemigo] .e-barras')?.getBoundingClientRect();
      const capa = $('#capa');
      if (barras && barras.height > 0 && capa) {
        capa.append(r);
        r.style.left = `${Math.round(barras.left + barras.width / 2)}px`;
        r.style.top = `${Math.round(barras.bottom + 6)}px`;
      }
      window.setTimeout(() => r.remove(), ms);
      return;
    }
    // en su lugar de siempre (bajo la cara); si ahí vuela el número de tu golpe, más arriba o al pie
    // (y si es más ancho que el naipe y pisa los sellos de la izquierda, corrido hacia la derecha)
    const alts: (() => void)[] = [];
    for (const tr of ['', '-38% -50%', '-28% -50%'])
      for (const top of ['', '30%', '88%'])
        alts.push(() => {
          r.style.top = top;
          r.style.translate = tr;
        });
    if (!quieto()) ubicar(r, 'rotulo', ms, alts);
    window.setTimeout(() => r.remove(), ms);
  }

  const carta = (): HTMLElement | null => $('[data-carta]');
  /** Un carril sobre el naipe del enemigo (0 arriba, 1 al pie), medido sobre lo que se ve de él (en la Deck, el busto). */
  function carril(f: number): { x: number; y: number } {
    const r = ($('[data-enemigo] .e-centro') ?? carta())?.getBoundingClientRect();
    if (!r) return { x: innerWidth / 2, y: innerHeight / 3 };
    return { x: r.left + r.width / 2, y: r.top + r.height * f };
  }
  /**
   * Dónde puede nacer el número de tu golpe, en orden. En el escritorio, al costado del naipe (lo que se ve de él) a
   * media altura: primero el derecho (el izquierdo es de los sellos INMUNE y ATURDIDO), después el izquierdo y, si los
   * dos chocan, dentro del naipe en su tercio de abajo. En el teléfono (≤ 700 px) no hay costado: nace dentro del naipe,
   * en su tercio de abajo, y el tope contra la pantalla se recalcula en cada cuadro.
   */
  function carrilesDano(): Carril[] {
    const r = ($('[data-enemigo] .e-centro') ?? carta())?.getBoundingClientRect();
    if (!r) return [{ x: innerWidth / 2, y: innerHeight / 3 }];
    const abajo: Carril = { x: r.left + r.width / 2, y: r.top + r.height * 0.7 };
    if (innerWidth <= 700) return [abajo, { x: r.left + r.width / 2, y: r.top + r.height * 0.55 }];
    const der: Carril = { x: r.right + 6, y: r.top + r.height * 0.42, alinear: 'izquierda' };
    const izq: Carril = { x: r.left - 6, y: r.top + r.height * 0.42, alinear: 'derecha' };
    // (0.28) con la escena baja (la Deck, el portátil) los costados del busto son del sello INMUNE y de la placa TE PEGA:
    // el número cae primero sobre el enemigo mismo
    return r.height < 200 ? [{ x: r.left + r.width / 2, y: r.top + r.height * 0.5 }, izq, der] : [der, izq, abajo];
  }
  // ───────────── los Chiches: tres huecos sobre la madera, a la derecha de la mesa (nunca en la mano) ─────────────
  /** Pinta la bandeja de Chiches y la apoya donde va: sobre los botones o, en el teléfono, al borde de la escena. */
  function pintarChiches(): void {
    const el = $<HTMLElement>('[data-chiches]');
    if (!el) return;
    // (el naipe que tenía el foco antes de pasar a la bandeja: ahí vuelve si se usó el último Chiche)
    if (!el.dataset.oyeFoco) {
      el.dataset.oyeFoco = '1';
      el.addEventListener('focusin', (ev) => {
        const de = (ev as FocusEvent).relatedTarget as HTMLElement | null;
        if (de?.classList.contains('carta') && de.dataset.id) cartaAntesDeChiches = de.dataset.id;
      });
    }
    const h = huecosChiche(p.chiches);
    el.innerHTML =
      `<b class="rotulo ch-rot">${glifo('L3', 'C')}${esc(t('chiches'))}</b><span class="ch-huecos">` +
      h
        .map((id, i) =>
          id
            ? `<button class="chiche" data-accion="chiche" data-i="${i}" data-chiche="${id}" data-foco="chiche-${i}" aria-label="${esc(tx(CHICHE[id].nombre))}" ${tip(tx(CHICHE[id].nombre), tx(CHICHE[id].desc), t(matchMedia('(pointer: coarse)').matches ? 'chicheUsaTel' : 'chicheUsa'))} data-tip-pie-mando="${esc(t('chicheUsaMando'))}" data-tip-pie-teclado="${esc(t('chicheUsaTeclado'))}">${pxChiche(id)}<span class="ch-nombre">${esc(tx(CHICHE_CORTO[id] ?? CHICHE[id].nombre))}</span></button>`
            : `<span class="chiche vacio" data-i="${i}" ${tip(t('chiches'), t('chicheVacio'))}></span>`,
        )
        .join('') +
      '</span>';
    el.classList.toggle('sin-nada', !h.some(Boolean));
    // (en el teléfono la columna de los botones es la barra del pulgar y la escena no tiene alto de sobra: la bandeja va
    // al borde derecho del renglón de las fichas del HUD, solo con lo que llevás, y las fichas le hacen lugar)
    const tel = innerWidth <= 700;
    const destino = tel ? $('[data-hud] .hud-lado.der') : $('.mano-zona .botones');
    if (destino && el.parentElement !== destino) {
      if (tel) destino.append(el);
      else destino.prepend(el);
    }
    const hud = $<HTMLElement>('[data-hud]');
    if (hud && tel) {
      hud.style.setProperty('--ancho-chiches', `${el.classList.contains('sin-nada') ? 0 : el.offsetWidth + 10}px`);
      actualizarTiras(p);
    }
    marcarSucio3d();
  }
  /** Un Chiche que vuela de un punto a otro de la mesa (lo que se usa, va a lo suyo; la Prenda, del caído a su hueco). */
  function volarChiche(id: ChicheId, de: { x: number; y: number }, a: { x: number; y: number }, ms = 320): Promise<void> {
    if (quieto() && !enFoto()) return Promise.resolve();
    const v = document.createElement('span');
    v.className = 'chiche-vuela';
    v.setAttribute('aria-hidden', 'true');
    v.innerHTML = pxChiche(id);
    v.style.left = `${Math.round(de.x)}px`;
    v.style.top = `${Math.round(de.y)}px`;
    $('#capa')?.append(v);
    const dx = Math.round(a.x - de.x);
    const dy = Math.round(a.y - de.y);
    // (la foto de la QA lo deja quieto a mitad de camino, en lo alto de su arco)
    if (enFoto()) {
      v.style.transform = `translate(calc(-50% + ${Math.round(dx * 0.68)}px), calc(-50% + ${Math.round(dy * 0.68) - 28}px)) scale(1.3)`;
      return Promise.resolve();
    }
    const anim = v.animate(
      [
        { transform: 'translate(-50%, -50%) scale(1)' },
        { transform: `translate(calc(-50% + ${Math.round(dx / 2)}px), calc(-50% + ${Math.round(dy / 2) - 60}px)) scale(1.5) rotate(180deg)`, offset: 0.5 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1) rotate(360deg)` },
      ],
      { duration: ms, easing: 'steps(10)', fill: 'forwards' },
    );
    return anim.finished.then(
      () => v.remove(),
      () => v.remove(),
    );
  }
  /** (0.27) El escudito con su «+N» que vuela de una carta que te quedó en la mano a tu ESCUDO del HUD (cortar la mano). */
  function volarEscudo(de: { x: number; y: number }, a: { x: number; y: number }, n: number): Promise<void> {
    if (quieto()) return Promise.resolve();
    const v = document.createElement('span');
    v.className = 'escudo-vuela';
    v.setAttribute('aria-hidden', 'true');
    v.innerHTML = `${pxHud('escudo')}${cifra(`+${n}`, 'azul')}`;
    v.style.left = `${Math.round(de.x)}px`;
    v.style.top = `${Math.round(de.y)}px`;
    $('#capa')?.append(v);
    const dx = Math.round(a.x - de.x);
    const dy = Math.round(a.y - de.y);
    const anim = v.animate(
      [
        { transform: 'translate(-50%, -50%) scale(1.6)', offset: 0 },
        { transform: 'translate(-50%, calc(-50% - 14px)) scale(1.3)', offset: 0.3 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.8)`, offset: 1 },
      ],
      { duration: 380, easing: 'steps(10)', fill: 'forwards' },
    );
    return anim.finished.then(
      () => v.remove(),
      () => v.remove(),
    );
  }
  /**
   * (0.23) Adónde va el Dado: al canto de arriba de la cuenta, a la izquierda (su estallido no tapa la pista «LB RB
   * corre de Posta» que está en el medio de la cuenta en reposo).
   */
  function bordeCuenta(): { x: number; y: number } {
    const r = ($('[data-cuenta] .cuenta') ?? $('[data-cuenta]'))?.getBoundingClientRect();
    if (!r || !r.width) return centro($('[data-cuenta]'));
    return { x: r.left + Math.min(60, r.width * 0.15), y: r.top };
  }
  /** (0.27) La cara del enemigo: lo de arriba de su naipe, que es lo que siempre se ve (su centro queda tras la cuenta). */
  function caraEnemigo(): { x: number; y: number } {
    const r = ($('[data-enemigo] .e-centro') ?? $('[data-carta]'))?.getBoundingClientRect();
    return r ? { x: r.left + r.width / 2, y: r.top + Math.min(r.height / 2, 56) } : centro(null);
  }
  /** Usa el Chiche del hueco `i`: no gasta el turno. Lo que no se puede usar ahora (la Ginebra con la Vida llena) se niega. */
  async function usarChiche(i: number): Promise<void> {
    if (ocupado || !p.combate) return;
    const boton = $<HTMLElement>(`[data-chiches] button.chiche[data-i="${i}"]`);
    const id = huecosChiche(p.chiches)[i];
    if (!id) return;
    // (0.23) el Fósforo sin naipes del palo Inmune en la mano no quemaría nada: se niega, como la Ginebra con la Vida
    // llena, y el Bufón dice por qué (el Chiche se guarda)
    const enVano = id === 'fosforo' && !!enemigo && !c().mano.some((k) => k.palo === enemigo!.palo);
    const evs = enVano ? [] : juego.usarChiche(p, i);
    if (!evs.length) {
      sonar('error');
      boton?.classList.remove('niega');
      void boton?.offsetWidth;
      boton?.classList.add('niega');
      if (enVano) decir(t('fosforoNada'), 'burla');
      return;
    }
    // (la ayuda del Chiche no se queda abierta durante lo que hace)
    ocultarTip();
    ocupado = true;
    mano?.bloquear(true);
    // (cada Chiche con su sonido)
    sonar(`ch-${id}` as Parameters<typeof sonar>[0]);
    const de = centro(boton);
    boton?.classList.add('usado');
    // cada uno va a lo suyo: la Ginebra a tu Vida, el Dado y el Fósforo al enemigo, la Tiza y el Poroto a la mano
    // (el Dado, a la cuenta: ahí se lee «MULTI +3»)
    const a = id === 'ginebra' ? centro($('[data-hud-vida]')) : id === 'dado' ? bordeCuenta() : id === 'fosforo' ? caraEnemigo() : centro($('[data-mano]'));
    await volarChiche(id, de, a);
    if (id === 'dado') dadoArmado = true;
    if (!quieto() && (id === 'fosforo' || id === 'dado')) {
      destello(a.x, a.y, id === 'fosforo' ? RAMPA_GOLPE : RAMPA_PALO.D, 20);
      chispas(a.x, a.y, id === 'fosforo' ? RAMPA_GOLPE : RAMPA_PALO.D, 12, 60);
    }
    await animar(evs.filter((x) => x.t !== 'chiche'), [], null);
    ocupado = false;
    mano?.bloquear(false);
    sincronizar();
    pintarChiches();
    guardar();
    // (0.22: con mando o teclado el foco no salta: se queda en la bandeja, en el Chiche que quedó más cerca del usado;
    // si no queda ninguno, vuelve al naipe que tenía antes de ir a la bandeja)
    if (porTeclado()) {
      const quedan = [...document.querySelectorAll<HTMLElement>('[data-chiches] button.chiche')];
      const cerca = quedan.sort((x, y) => Math.abs(Number(x.dataset.i) - i) - Math.abs(Number(y.dataset.i) - i))[0];
      const naipe = cartaAntesDeChiches ? $<HTMLElement>(`[data-mano] .carta[data-id="${cartaAntesDeChiches}"]`) : null;
      (cerca ?? naipe ?? $<HTMLElement>('[data-mano] .carta'))?.focus();
    }
  }
  /** Arrastrar un Chiche al enemigo también lo usa (como soltar naipes sobre él). */
  let acChiches: AbortController | null = null;
  function arrastreChiches(raiz: HTMLElement): void {
    acChiches?.abort();
    acChiches = new AbortController();
    const sig = acChiches.signal;
    let toma: { i: number; id: ChicheId; x: number; y: number; fantasma: HTMLElement | null; pid: number } | null = null;
    let tragar = false;
    raiz.addEventListener('pointerdown', (ev) => {
      ultimoPuntero = ev.pointerType;
      const b = (ev.target as HTMLElement).closest<HTMLElement>('[data-chiches] button.chiche');
      // (tocar en otro lado desarma el Chiche que quedó listo)
      if (!b || Number(b.dataset.i) !== chicheListo) {
        chicheListo = null;
        document.querySelectorAll('[data-chiches] .chiche.listo').forEach((x) => x.classList.remove('listo'));
      }
      if (!b || ocupado) return;
      toma = { i: Number(b.dataset.i), id: b.dataset.chiche as ChicheId, x: ev.clientX, y: ev.clientY, fantasma: null, pid: ev.pointerId };
    }, { signal: sig });
    addEventListener('pointermove', (ev) => {
      if (!toma || ev.pointerId !== toma.pid) return;
      if (!toma.fantasma && Math.hypot(ev.clientX - toma.x, ev.clientY - toma.y) < 10) return;
      if (!toma.fantasma) {
        const v = document.createElement('span');
        v.className = 'chiche-vuela arrastra';
        v.innerHTML = pxChiche(toma.id);
        $('#capa')?.append(v);
        toma.fantasma = v;
        $(`[data-chiches] button.chiche[data-i="${toma.i}"]`)?.classList.add('tomado');
      }
      toma.fantasma.style.left = `${ev.clientX}px`;
      toma.fantasma.style.top = `${ev.clientY - 24}px`;
      const r = $('[data-escena]')?.getBoundingClientRect();
      $('[data-soltar="enemigo"]')?.classList.toggle('apunta', !!r && ev.clientY >= r.top && ev.clientY <= r.bottom && ev.clientX >= r.left && ev.clientX <= r.right);
    }, { signal: sig });
    const fin = (ev: PointerEvent): void => {
      if (!toma || ev.pointerId !== toma.pid) return;
      const t0 = toma;
      toma = null;
      if (!t0.fantasma) return;
      t0.fantasma.remove();
      tragar = true;
      $(`[data-chiches] button.chiche[data-i="${t0.i}"]`)?.classList.remove('tomado');
      $('[data-soltar="enemigo"]')?.classList.remove('apunta');
      const r = $('[data-escena]')?.getBoundingClientRect();
      if (ev.type === 'pointerup' && r && ev.clientY >= r.top && ev.clientY <= r.bottom && ev.clientX >= r.left && ev.clientX <= r.right) void usarChiche(t0.i);
    };
    addEventListener('pointerup', fin, { signal: sig });
    addEventListener('pointercancel', fin, { signal: sig });
    // (el clic que sigue a un arrastre no vuelve a usarlo)
    raiz.addEventListener(
      'click',
      (ev) => {
        if (!tragar) return;
        tragar = false;
        if ((ev.target as HTMLElement).closest('[data-chiches]')) {
          ev.stopPropagation();
          ev.preventDefault();
        }
      },
      true,
    );
  }
  /** La Prenda: el Chiche que se le roba al caído vuela de su naipe a su hueco. */
  async function prenda(id: ChicheId): Promise<void> {
    sonar('prenda');
    const de = centro($('[data-carta]') ?? $('[data-enemigo]'));
    pintarChiches();
    const hueco = [...document.querySelectorAll<HTMLElement>(`[data-chiches] button.chiche[data-chiche="${id}"]`)].pop();
    hueco?.classList.add('llega');
    const rotulo = document.createElement('b');
    rotulo.className = 'rotulo prenda-sello';
    rotulo.textContent = t('prenda');
    rotulo.style.left = `${Math.round(de.x)}px`;
    rotulo.style.top = `${Math.round(de.y)}px`;
    $('#capa')?.append(rotulo);
    // (0.29) si ahí vuela el número del golpe, el sello se corre sobre el pecho del enemigo o arriba/abajo
    const pechoY = innerWidth > 700 ? Math.round(de.y + 28) : Math.round(de.y);
    ubicar(rotulo, 'rotulo', 900, [
      () => {
        rotulo.style.left = `${Math.round(de.x)}px`;
        rotulo.style.top = `${pechoY}px`;
      },
      () => {
        rotulo.style.left = `${Math.round(de.x)}px`;
        rotulo.style.top = `${Math.round(de.y - 36)}px`;
      },
      () => {
        rotulo.style.left = `${Math.round(de.x)}px`;
        rotulo.style.top = `${Math.round(de.y + 96)}px`;
      },
    ]);
    window.setTimeout(() => rotulo.remove(), quieto() ? 1400 : 900);
    await volarChiche(id, de, centro(hueco ?? $('[data-chiches]')), 420);
    if (!enFoto()) hueco?.classList.remove('llega');
    if (hueco) {
      hueco.classList.remove('salta');
      void hueco.offsetWidth;
      hueco.classList.add('salta');
    }
  }
  /** El sello «SE PLANTA EN LA MITAD» pegado bajo el número del golpe que se frenó, en su mismo carril. */
  /** El sello «SE PLANTA EN LA MITAD» en el aire (el cartel de la segunda cara, que llega después, lo despide). */
  let plantaViva: { el: HTMLElement; id: number; t: number } | null = null;
  function selloPlanta(pierde: number): void {
    if (enFoto()) return;
    sonar('planta', { palo: enemigo?.palo });
    plantaViva?.el.remove();
    const s = document.createElement('div');
    s.className = 'sello-planta';
    s.setAttribute('role', 'status');
    // (0.28) grande, en dos renglones («SE PLANTA EN LA MITAD» / «100 SE PIERDEN») y en un lugar FIJO que el número no
    // cruza: al costado de la barra de Vida del Rey (sobre su rasgo, que es la regla que se está cumpliendo); en el
    // teléfono, sobre el paño vacío (entre la cuenta y la mano). No cede ni se apaga: nada pesa más que la explicación de por qué entró menos
    s.innerHTML = `<b class="rotulo">${esc(t('sePlanta'))}</b>${pierde > 0 ? `<span class="sp-pierde">${esc(t('pierde', { n: pierde }))}</span>` : ''}`;
    $('#capa')?.append(s);
    const barra = $('[data-enemigo] .e-vida')?.getBoundingClientRect();
    const panoE = innerWidth > 700 ? $('[data-mano] .pano-postas')?.getBoundingClientRect() : undefined;
    if (panoE && panoE.width > 0) {
      s.classList.add('en-pano');
      s.style.maxWidth = `${Math.round(panoE.width - 16)}px`;
    }
    const w = s.offsetWidth;
    const h = s.offsetHeight;
    let x = innerWidth / 2 - w / 2;
    let y = innerHeight * 0.3;
    if (barra && barra.width > 0) {
      if (panoE && panoE.width > 0) {
        // (0.29) escritorio: en el centro del paño, que a esa altura del golpe está vacío. Al costado de la barra tapaba
        // el rasgo del Rey y su FURIA, que son justo lo que hay que leer
        // (sin llegar a la bandeja de Chiches ni a los botones)
        const topeB = ($('.mano-zona .botones')?.getBoundingClientRect().left ?? innerWidth) - 30;
        x = Math.min(panoE.left + (panoE.width - w) / 2, topeB - w);
        y = panoE.top + (panoE.height - h) / 2;
      } else if (innerWidth > 700) {
        x = barra.right + 12;
        y = barra.bottom - h;
      } else {
        // (teléfono: sobre el paño vacío, entre la cuenta y la mano; bajo la barra taparía el total de la cuenta)
        const pano = $('[data-mano] .pano-postas')?.getBoundingClientRect();
        const cu = $('[data-cuenta]')?.getBoundingClientRect();
        x = innerWidth / 2 - w / 2;
        const techoMano = Math.min(innerHeight, ...[...document.querySelectorAll('[data-mano] .carta:not(.volando)')].map((c) => c.getBoundingClientRect().top));
        y = pano && pano.height > 0 ? Math.max(Math.min(pano.top + (pano.height - h) / 2, techoMano - h - 8), (cu?.bottom ?? 0) + 6) : barra.bottom + 4;
      }
    }
    x = Math.round(Math.max(6, Math.min(innerWidth - w - 6, x)));
    y = Math.round(Math.max(6, Math.min(innerHeight - h - 6, y)));
    s.style.left = `${x}px`;
    s.style.top = `${y}px`;
    const id = reservar('sello', { x, y, w, h }, 1400, cajaDe(s));
    plantaViva = { el: s, id, t: performance.now() };
    // (mientras el sello vive, la cuenta no repite «SE PLANTA EN LA MITAD»: se dice una vez)
    $('.mesa')?.classList.add('planta-viva');
    window.setTimeout(
      () => {
        s.remove();
        if (plantaViva?.el === s) {
          plantaViva = null;
          $('.mesa')?.classList.remove('planta-viva');
        }
      },
      quieto() ? 1700 : 1400,
    );
  }
  /**
   * (0.29) El Rey se planta, con el cuerpo: se afirma (un pisotón seco del naipe), levanta el escudo de su palo (un
   * marco de su aura que se cierra sobre él), la mesa da un golpe seco de cámara y lo que se pierde del golpe (el
   * «230») choca contra él, se pone gris, se parte en dos y cae deshecho hacia su sello.
   */
  function gestoPlanta(pierde: number, palo: Palo): void {
    if (quieto() || enFoto()) return;
    const centroE = $<HTMLElement>('[data-enemigo] .e-centro');
    const k = carta();
    const r = k?.getBoundingClientRect();
    if (!centroE || !r) return;
    centroE.classList.remove('se-planta');
    void centroE.offsetWidth;
    centroE.classList.add('se-planta');
    const escudo = document.createElement('i');
    escudo.className = 'planta-escudo';
    escudo.setAttribute('aria-hidden', 'true');
    escudo.style.setProperty('--aura', AURA[palo]);
    k!.append(escudo);
    window.setTimeout(() => {
      escudo.remove();
      centroE.classList.remove('se-planta');
    }, 700);
    haloRey(r.left + r.width / 2, r.top + r.height / 2, AURA[palo], 150);
    sacudir($('.mesa'), 3);
    congelar(70);
    // (el tope seco lo suena `selloPlanta` con el sonido propio «planta», afinado al motivo del Rey)
    // lo que se pierde: nace grande contra su pecho, rebota y cae partido hacia el sello
    const sello = plantaViva?.el.getBoundingClientRect();
    const de = { x: r.left + r.width / 2, y: r.top + Math.min(r.height * 0.45, 90) };
    const a = sello ? { x: sello.left + sello.width / 2, y: sello.top + sello.height / 2 } : { x: de.x, y: de.y + 120 };
    for (const mitad of ['arriba', 'abajo'] as const) {
      const n = document.createElement('span');
      n.className = `planta-pierde pp-${mitad}`;
      n.setAttribute('aria-hidden', 'true');
      n.innerHTML = cifra(pierde, 'hueso', 'grande');
      n.style.left = `${Math.round(de.x)}px`;
      n.style.top = `${Math.round(de.y)}px`;
      $('#capa')?.append(n);
      const lado = mitad === 'arriba' ? -1 : 1;
      const dx = Math.round(a.x - de.x);
      const dy = Math.round(a.y - de.y);
      n.animate(
        [
          { transform: 'translate(-50%, -50%) scale(1.5)', filter: 'none', opacity: 1 },
          { transform: `translate(calc(-50% + ${lado * -6}px), calc(-50% - 14px)) scale(1.25)`, filter: 'none', opacity: 1, offset: 0.18 },
          { transform: `translate(calc(-50% + ${Math.round(dx * 0.35) + lado * 10}px), calc(-50% + ${Math.round(dy * 0.3)}px)) scale(1.1) rotate(${lado * 5}deg)`, filter: 'grayscale(1) brightness(0.8)', opacity: 1, offset: 0.5 },
          { transform: `translate(calc(-50% + ${dx + lado * 22}px), calc(-50% + ${dy}px)) scale(0.9) rotate(${lado * 14}deg)`, filter: 'grayscale(1) brightness(0.55)', opacity: 0 },
        ],
        { duration: 760, easing: 'steps(10)', fill: 'forwards' },
      );
      window.setTimeout(() => n.remove(), 780);
    }
  }
  /** Si el golpe trae canto, el canto grande espera al número: sale después, arriba del naipe y en otro renglón. */
  let cantoPendiente = false;
  /** (0.26) La Pierna de Chancho Va canta un escalón menos que el Póker: su canto grande sale más chico. */
  let cantoMenor = false;
  /**
   * El canto cruza la mesa en grande: arriba del naipe (o en su tercio de arriba), nunca en el renglón del número ni
   * sobre los sellos; el director de escena lo corre de costado o le hace esperar su turno si hace falta.
   */
  function cantoGrande(): void {
    cantoPendiente = false;
    const menor = cantoMenor;
    cantoMenor = false;
    if (quieto()) return;
    const r = ($('[data-enemigo] .e-centro') ?? carta())?.getBoundingClientRect();
    const g = document.createElement('b');
    g.className = `canto-grande titulo${menor ? ' menor' : ''}`;
    g.textContent = tx(MAZO[p.mazoId].canto);
    $('#capa')?.append(g);
    const cx = r ? r.left + r.width / 2 : innerWidth / 2;
    const arriba = r ? r.top : innerHeight / 4;
    const h = r?.height ?? 200;
    const w = r?.width ?? 200;
    const pon = (x: number, y: number) => (): void => {
      const gw = g.offsetWidth;
      const gh = g.offsetHeight;
      g.style.left = `${Math.round(Math.max(gw / 2 + 8, Math.min(innerWidth - gw / 2 - 8, x)))}px`;
      g.style.top = `${Math.round(Math.max(gh / 2 + 4, Math.min(innerHeight - gh / 2 - 4, y)))}px`;
    };
    const alternativas: (() => void)[] = [];
    // (0.28) fuera del teléfono el canto cae sobre el paño vacío (la franja de lo jugado): la escena baja no tiene lugar
    // para él sin tapar el sello INMUNE, el número del golpe ni el TE PEGA. Arranca en el borde izquierdo del fieltro
    // (a su izquierda está el desglose, que sigue encendido) y puede seguir hacia la columna de los botones
    const pano = innerWidth > 700 ? $('[data-mano] .pano-postas')?.getBoundingClientRect() : undefined;
    if (pano && pano.width > 0) {
      g.classList.add('en-pano');
      // (entra en el ancho del fieltro: si no, baja de cuerpo; nunca llega a la bandeja de Chiches)
      // (su entrada lo agranda un tercio: se mide con ese estirón)
      const tope = Math.max(150, (pano.width - 24) / 1.34);
      if (g.offsetWidth * 1.06 > tope) g.style.fontSize = `${Math.max(24, Math.floor((parseFloat(getComputedStyle(g).fontSize) * tope) / (g.offsetWidth * 1.06)))}px`;
      alternativas.push(pon(pano.left + pano.width / 2, pano.top + pano.height / 2));
    }
    // (0.29) teléfono: el canto cae en la franja entre la cuenta y la mano (donde estaba el paño, que ya voló): arriba
    // tapaba el título, el turno y los botones «?» y «≡»
    if (innerWidth <= 700) {
      const cuB = $('[data-cuenta]')?.getBoundingClientRect().bottom ?? innerHeight * 0.4;
      const techo = Math.min(innerHeight, ...[...document.querySelectorAll<HTMLElement>('[data-mano] .carta:not(.volando):not(.elegida)')].map((c) => c.getBoundingClientRect().top));
      g.classList.add('en-franja');
      const tope = innerWidth - 24;
      if (g.offsetWidth * 1.06 > tope) g.style.fontSize = `${Math.max(22, Math.floor((parseFloat(getComputedStyle(g).fontSize) * tope) / (g.offsetWidth * 1.06)))}px`;
      const yFranja = techo - cuB > g.offsetHeight + 8 ? (cuB + techo) / 2 : cuB + g.offsetHeight / 2 + 6;
      alternativas.push(pon(innerWidth / 2, yFranja));
    }
    for (const fy of [-0.08, 0.14, 0.3, 0.9]) for (const dx of [0, 0.4, -0.4, 0.8, -0.8]) alternativas.push(pon(cx + dx * w, arriba + h * fy));
    const pd = ubicar(g, 'canto', 850, alternativas, 1.06);
    window.setTimeout(() => g.remove(), 850 + pd.demora);
  }
  /** Lo que el Rey hace por su cuenta (sus poderes de cara y de segunda cara), a la vista: número y rótulo. */
  async function poderRey(que: 'cura' | 'escudo' | 'diezmo' | 'deguello', n: number): Promise<void> {
    if (!enemigo) return;
    const e = enemigo;
    const el = carta();
    const en = centro(el);
    const w = el?.getBoundingClientRect().width ?? 160;
    const nombre = (rasgo: string): string => (e.segunda ? tx(REY_DEF[e.palo].segunda) : rasgo);
    if (que === 'deguello') {
      // el Tajo de revés: dos filos en X, el ×2 a la vista y el golpe que atraviesa el Escudo, con su propio sonido
      // primero tu golpe (su número ya va bajando por su carril), después el cartel del Rey y después lo que te pega:
      // el rótulo dice la misma fórmula que la placa («24 ×2 = 48»)
      // (el cartel pide su turno al director de escena: el número que está en el aire no se apaga)
      sonar('deguello');
      const k = B.reyes.S.deguello;
      // (0.23) el golpe es del Rey: el número de tu golpe se apaga (como en la segunda cara), la placa TE PEGA solo late
      // (no repite la fórmula, que dice el rótulo) y en el teléfono el rótulo la reemplaza; el chip de la cuenta, igual
      limpiarNumeros(true);
      const m = $('.mesa');
      m?.classList.add('tajo-cae');
      window.setTimeout(() => m?.classList.remove('tajo-cae'), quieto() ? 1800 : 1500);
      rotuloRey(tx(REY_DEF.S.segunda), String(n), 'roja', '', `${Math.round(n / k)} ×${k} =`, true);
      if (!quieto()) {
        tajoDeReves(en.x, en.y, w * 0.75);
        fogonazo('palo', '#ff1453');
        sacudir($('[data-escena]'), 3);
        ponerGolpeRey(n, true);
        $('[data-ataque]')?.classList.add('sube');
        await frenar(150);
        await pausa(260);
      }
      return;
    }
    if (que === 'cura') {
      e.vida = Math.min(e.vidaMax, e.vida + n);
      sonar('brindis');
      rotuloRey(nombre(t('reyCura')), `+${n}`, 'verde');
      if (!quieto()) motas(en.x, en.y, RAMPA_CURA, 12, w * 0.4);
    }
    if (que === 'escudo') {
      e.escudo += n;
      sonar('fortin');
      rotuloRey(nombre(t('reyEscudo')), `+${n}`, 'azul');
      if (!quieto()) motas(en.x, en.y, RAMPA_ESCUDO, 14, w * 0.45);
    }
    if (que === 'diezmo') {
      deltaHud('oro', -n);
      sonar('diezmo');
      rotuloRey(nombre(t('reyDiezmo')), `-${n}`, 'oro', t('deOro'));
      const de = centro($('[data-hud-oro]'));
      monedas(de.x, de.y, en.x, en.y, Math.min(8, 2 + n));
      await pausa(quieto() ? 0 : 130);
      hud.oro = Math.max(0, hud.oro - n);
      ponerHud(hud);
    }
    pintarEnemigo();
    await pausa(e.segunda ? 360 : 200);
  }

  /**
   * La segunda cara: lo contrario de la irrupción. El naipe del Rey se da vuelta (se cierra de canto, cambia de aura
   * y se abre), la luz se le mete adentro en anillos que se cierran, el naipe se agrieta, la mesa se tiñe de su
   * color y el cartel «SEGUNDA CARA» cae con el nombre de lo que cambia. Con su propio sonido: un acorde que se quiebra.
   */
  async function segundaCara(palo: Palo): Promise<void> {
    sonar('segunda', { palo });
    estadoCombate({ segunda: true });
    if (quieto()) {
      if (enemigo) enemigo.segunda = true;
      pintarEnemigo();
      decir(tx(SEGUNDA_BURLA[palo]), 'sombria');
      return;
    }
    const el = carta();
    const en = centro(el);
    const w = el?.getBoundingClientRect().width ?? 160;
    // (0.27) el sello «SE PLANTA EN LA MITAD · N SE PIERDEN» se lee antes de que el naipe se dé vuelta: 900 ms a la vista
    if (plantaViva) {
      const falta = 1100 - (performance.now() - plantaViva.t);
      if (falta > 40) await pausa(falta);
    }
    // el golpe que lo dejó a media Vida se congela, la luz se le mete adentro y el naipe se cierra de canto
    quiebre(en.x, en.y, w * 0.95, AURA_SEGUNDA[palo], RAMPA_PALO[palo]);
    fogonazo('palo', AURA_SEGUNDA[palo]);
    transformarSegunda3d(palo);
    await frenar(140);
    carta()?.classList.add('voltea');
    await pausa(200);
    // de canto: el naipe se da vuelta con su segunda cara
    if (enemigo) enemigo.segunda = true;
    pintarEnemigo();
    $('[data-carta]')?.classList.add('volteada');
    sacudir($('[data-escena]'), 2);
    chispas(en.x, en.y, RAMPA_PALO[palo], 16, 110);
    // el cartel pide su lugar al director: si el número del golpe que lo dejó a media Vida sigue en el aire, se corre o
    // espera su turno (nada de «TAJO 240 REVÉS» ni de un número borrado)
    // (el sello de «se planta en la mitad» ya se leyó: la segunda cara lo despide para tener su lugar)
    if (plantaViva) {
      soltarTurno(plantaViva.id);
      plantaViva.el.remove();
      plantaViva = null;
    }
    const g = document.createElement('div');
    g.className = 'cartel-segunda';
    g.style.setProperty('--tinte', AURA_SEGUNDA[palo]);
    g.innerHTML = `<span class="rotulo">${esc(t('segundaCara'))}</span><b class="titulo">${esc(tx(REY_DEF[palo].segunda))}</b>`;
    $('#capa')?.append(g);
    // al medio del naipe; si pisa los sellos o lo que está en el aire, más arriba, más abajo o corrido
    const pon = (f: number, dx: number) => (): void => {
      const m = carril(f);
      const gw = g.offsetWidth;
      g.style.left = `${Math.round(Math.max(gw / 2 + 6, Math.min(innerWidth - gw / 2 - 6, m.x + dx * gw)))}px`;
      g.style.top = `${Math.round(m.y)}px`;
    };
    // (0.28) fuera del teléfono cae sobre el paño vacío (la franja de lo jugado, bajo la cuenta): no tapa el nombre del
    // Rey en su barra, ni su regla nueva (el rótulo del costado, que es lo que anuncia), ni el TE PEGA
    const enPano = (): void => {
      const r = $('[data-mano] .pano-postas')?.getBoundingClientRect();
      if (!r || !r.width) return pon(0.5, 0)();
      const gw = g.offsetWidth;
      // (sin llegar a la bandeja de Chiches ni a los botones)
      const tope = ($('.mano-zona .botones')?.getBoundingClientRect().left ?? innerWidth) - 30;
      // (0.29) su borde izquierdo no pasa del borde del fieltro: a su izquierda está el desglose, que sigue encendido
      // (tapaba su final: «Taba +1»). Si no entra entre el paño y los botones, su regla parte en dos renglones
      const lugar = Math.max(160, tope - r.left);
      if (gw > lugar) {
        g.style.maxWidth = `${Math.round(lugar)}px`;
        g.classList.add('angosto');
      }
      const w2 = g.offsetWidth;
      g.style.left = `${Math.round(Math.max(r.left + w2 / 2, Math.min(tope - w2 / 2, r.left + r.width / 2)))}px`;
      g.style.top = `${Math.round(r.top + r.height / 2)}px`;
    };
    ubicar(g, 'cartel', 1500, [...(innerWidth > 700 ? [enPano] : []), pon(0.5, 0), pon(0.3, 0), pon(0.7, 0), pon(0.5, 0.3), pon(0.5, -0.3), pon(0.5, 0.42), pon(0.5, -0.42), pon(0.2, 0.3), pon(0.2, 0.42), pon(0.85, 0), pon(0.85, 0.42)]);
    window.setTimeout(() => g.remove(), 1500);
    await pausa(950);
    // (lo que sigue suele ser el Rey que te pega: el cartel ya se leyó y se va enseguida, sin quedar encima de él)
    window.setTimeout(quitarCartelSegunda, 220);
    // y recién después del cartel, el Bufón: una burla corta (la regla entera queda en el chip y en su ayuda)
    decir(tx(SEGUNDA_BURLA[palo]), 'sombria');
  }

  /** El cartel de la segunda cara se pliega (en dos pasos) y se va: nada queda encima del Rey cuando este te pega. */
  function quitarCartelSegunda(): void {
    for (const g of document.querySelectorAll<HTMLElement>('.cartel-segunda:not(.se-va)')) {
      g.classList.add('se-va');
      window.setTimeout(() => g.remove(), quieto() ? 0 : 120);
    }
  }
  /** La pelea se retira de la mesa (una sola vez): los rótulos del enemigo, la cuenta, la mano y los botones. */
  function despejar(): void {
    const m = $('.mesa');
    if (!m || m.classList.contains('cobra')) return;
    mano?.bloquear(true);
    if (quieto()) return;
    m.classList.add('sin-enemigo', 'cobra');
    sonar('despeja');
  }
  /**
   * El cobro: ganado el combate (la mesa ya se despejó en el instante en que cayó el último), las monedas del botín
   * vuelan al oro del HUD y el número sube contando, la Vida que da el botín se llena igual, y el Escudo y el Mazo
   * vuelven a lo que dirá el botín (el Escudo se apaga, las cartas vuelven al Mazo): nada salta al cambiar de
   * pantalla. Después el botín brota sobre la misma mesa, sin corte ni bache (lo monta `terminar`).
   */
  async function cobrar(): Promise<void> {
    voz(VOZ.victoria, 'risa');
    const de = centro($('[data-enemigo] .e-centro') ?? $('[data-enemigo]'));
    if (tipo === 'rey') {
      // la fanfarria, encadenada: suena cuando la rajadura ya terminó, nunca encima del remate
      sonar('victoria');
      if (!quieto()) lluviaDeMonedas(innerWidth * 0.1, innerWidth * 0.9, -30, 34);
      gestoRetrato('festejo', 2400);
      poseRetrato('festeja', 1500);
    } else sonar('victoria', { retraso: 0.05, altura: 1.5 });
    // el grito del Personaje, después de cobrar (antes tapaba el «+N» del oro)
    const grito = (): void => void (tipo === 'rey' && gritar(p.mazoId, tx(GRITO[p.mazoId].gana)));
    const fin = vistaDe(p);
    if (quieto()) {
      hud = { ...fin, vida: Math.max(hud.vida, fin.vida), vidaMax: fin.vidaMax };
      ponerHud(hud);
      grito();
      return;
    }
    despejar();
    // el Escudo se apaga y las cartas vuelven al Mazo mientras vuela el oro (en el botín el HUD dice eso mismo)
    const mazoDesde = hud.mazo;
    if (hud.escudo > fin.escudo) {
      const es = centro($('[data-hud-escudo]'));
      motas(es.x, es.y, RAMPA_ESCUDO, 8, 26);
      hud.escudo = fin.escudo;
      ponerHud(hud);
    }
    const vuelveMazo = (f: number): void => {
      hud.mazo = Math.round(mazoDesde + (fin.mazo - mazoDesde) * f);
    };
    // el oro: las monedas vuelan al HUD y la cifra sube contando, una moneda por vez
    const a = $('[data-hud-oro]');
    const oroFinal = p.oro;
    const desde = hud.oro;
    if (a && oroFinal > desde) {
      const ra = a.getBoundingClientRect();
      const ca = centro(a);
      const cuantas = Math.min(14, 4 + Math.round((oroFinal - desde) / 3));
      monedas(de.x, de.y, ca.x, ca.y, cuantas);
      await pausa(tipo === 'rey' ? 380 : 300);
      // (0.24) en el teléfono el «+N» del oro nace adentro de su caja del HUD (arriba está la barra del pulgar: no queda
      // suelto sobre DESCARTAR)
      if (innerWidth <= 700) deltaHud('oro', oroFinal - desde);
      else numero(`+${oroFinal - desde}`, ca.x, ra.top - 34 * S, 'oro', 2);
      const pasos = Math.min(12, oroFinal - desde);
      for (let i = 1; i <= pasos; i++) {
        hud.oro = Math.round(desde + ((oroFinal - desde) * i) / pasos);
        vuelveMazo(i / pasos);
        ponerHud(hud);
        sonar('tintin', { altura: 1 + i * 0.035 });
        await pausa(44);
      }
      sonar('oro');
    }
    vuelveMazo(1);
    ponerHud(hud);
    // (el grito espera a que el «+N» del oro termine de caer: si no, se le monta encima)
    window.setTimeout(grito, 450);
    // la Vida del botín (el respiro tras un Rey, el Brindis): se llena a la vista
    // (y la Vida máxima que suma el Rey vencido: la cifra «/N» crece a la vista aunque la Vida no cambie)
    const v = $('[data-hud-vida]');
    if (v && (p.vida > hud.vida || p.vidaMax !== hud.vidaMax)) {
      const cv = centro(v);
      motas(cv.x, cv.y, RAMPA_CURA, 14, 50);
      sonar('cura');
      hud.vida = p.vida;
      hud.vidaMax = p.vidaMax;
      ponerHud(hud);
    }
    // el botín brota enseguida: sin un segundo de madera vacía
    await pausa(tipo === 'rey' ? 160 : 90);
  }

  /**
   * El conteo del golpe, pieza por pieza, en el propio desglose (nada de carteles que vuelen encima): cada término se
   * enciende en su lugar a medida que suma y los ya contados quedan encendidos. Cada carta salta con su número (dentro
   * del naipe, sin tapar su índice), cada pieza hace brincar su ficha del HUD, el Daño y el Multi suben a la vista y el
   * total lleva la cuenta en gris hasta que, al final, se enciende en oro.
   */
  /** Los pasos del conteo en su orden: primero las cartas, después lo que suma Daño, lo que suma Multi y lo que lo multiplica. */
  function pasosConteo(q: Cuenta): { cartas: Paso[]; piezas: Paso[] } {
    const esCarta = (x: Paso): boolean => x.tipo === 'd' && x.de.startsWith('c:');
    const orden = { d: 0, m: 1, x: 2 } as const;
    return { cartas: q.pasos.filter(esCarta), piezas: q.pasos.filter((x) => !esCarta(x) && x.v !== 0).sort((u, v) => orden[u.tipo] - orden[v.tipo]) };
  }
  /** Las cifras de la fórmula después de `hechos` pasos del conteo (lo que no viene de ningún paso, la base, ya está). */
  function cifrasConteo(q: Cuenta, hechos: Paso[]): { dano: number; multi: number } {
    let dano = q.dano - q.pasos.filter((x) => x.tipo === 'd').reduce((n, x) => n + x.v, 0);
    let sumaM = 0;
    let por = 1;
    for (const x of hechos) {
      if (x.tipo === 'd') dano += x.v;
      else if (x.tipo === 'm') sumaM += x.v;
      else por *= x.v;
    }
    // el Multi nunca baja de 1 (es lo que hace el motor): la fórmula está entera desde el primer cuadro, sin huecos
    return { dano: Math.max(0, dano), multi: Math.max(1, sumaM) * por };
  }
  /** Pone la fórmula (Daño, Multi y el total en gris) como va el conteo. */
  function ponerConteo(d: { dano: number; multi: number }): void {
    const vd = $('[data-cuenta] [data-cd] [data-v]');
    const vm = $('[data-cuenta] [data-cm] [data-v]');
    const total = $('[data-total]');
    if (vd) vd.innerHTML = cifra(d.dano, 'roja', 'grande');
    if (vm) vm.innerHTML = cifra(d.multi, 'azul', 'grande');
    if (total) total.innerHTML = cifra(d.dano * d.multi, 'hueso', 'grande');
    // (y en cada paso se vuelve a medir: la cuenta no cambia de alto ni de renglones mientras cuenta)
    const zona = $('[data-cuenta]');
    if (zona) apretarCuenta(zona);
  }
  /** El sello «×2» del Crítico, a la derecha de la cifra del MULTI y arriba, dentro de la fórmula (sin correr nada). */
  function selloCritico(v: number): void {
    const parte = $('[data-cuenta] [data-cm]');
    if (!parte) return;
    parte.querySelector('.c-crit-sello')?.remove();
    parte.insertAdjacentHTML('beforeend', `<b class="c-crit-sello" aria-hidden="true">${cifra(`x${v}`, 'oro')}</b>`);
  }
  const termino = (x: Paso): Element | null | undefined => terminoVisto($('[data-cuenta] .c-desglose')?.querySelector(`[data-paso="${CSS.escape(`${x.tipo}|${x.de}`)}"]`));
  /**
   * El conteo congelado a una fracción `f` (para la QA visual, estado «mesa-conteo»): la cuenta como se ve a mitad del
   * golpe, con los términos ya contados encendidos y el total en gris.
   */
  function conteoQa(f: number): void {
    const q = cuentaDe();
    if (!q.ok) return;
    const cuentaEl = $('[data-cuenta] .cuenta');
    cuentaEl?.classList.remove('previa');
    cuentaEl?.classList.add('contando');
    if (cuentaEl) {
      delete cuentaEl.dataset.accion;
      cuentaEl.querySelector('.c-abre')?.remove();
    }
    $('[data-cuenta] .c-desglose')?.classList.add('contando');
    const { cartas, piezas } = pasosConteo(q);
    const todos = [...cartas, ...piezas];
    const hechos = todos.slice(0, Math.max(1, Math.round(todos.length * f)));
    for (const x of hechos) termino(x)?.classList.add('encendido');
    $('[data-total]')?.classList.add('cuenta-sube');
    ponerConteo(cifrasConteo(q, hechos));
    const crit = hechos.find((x) => q.critico && x.tipo === 'x' && x.de === 'b:puntahacha');
    if (crit) selloCritico(crit.v);
    mano?.bloquear(true);
  }

  /**
   * El conteo del golpe, pieza por pieza, en el propio desglose (nada de carteles que vuelen encima): cada término se
   * enciende en su lugar a medida que suma y los ya contados quedan encendidos. Cada carta salta con su número (dentro
   * del naipe, sin tapar su índice), cada pieza hace brincar su ficha del HUD (su «+N» sale escalonado, sin montarse
   * sobre el de la vecina), el Daño y el Multi suben a la vista y el total lleva la cuenta en gris hasta que, al final,
   * se enciende en oro. El Crítico estalla en su término del MULTI. Un toque (o cualquier tecla) apura lo que falta.
   */
  async function conteo(q: Cuenta): Promise<void> {
    const cuentaEl = $('[data-cuenta] .cuenta');
    // la vista previa se abre: el veredicto deja su lugar a la fórmula, que va a subir término a término
    cuentaEl?.classList.remove('previa');
    cuentaEl?.classList.add('contando');
    if (quieto()) {
      // sin movimiento, la cuenta se revela entera de una
      cuentaEl?.classList.add('revelada');
      await pausa(420);
      return;
    }
    // un toque, un clic o una tecla durante el conteo lo apuran (como en los juegos de cuentas: el que ya lo vio, no espera)
    let apurado = false;
    const apurar = (): void => {
      apurado = true;
    };
    addEventListener('pointerdown', apurar, true);
    addEventListener('keydown', apurar, true);
    try {
      await contar(q, cuentaEl, () => apurado);
    } finally {
      removeEventListener('pointerdown', apurar, true);
      removeEventListener('keydown', apurar, true);
    }
  }
  async function contar(q: Cuenta, cuentaEl: HTMLElement | null, apurado: () => boolean): Promise<void> {
    const { cartas, piezas } = pasosConteo(q);
    // el ritmo: arranca despacio (se lee qué suma) y acelera; con muchas piezas se aprieta para no pasar de 1,6 s
    const pasos = cartas.length + piezas.length;
    const crudo = (k: number): number => 115 - (70 * k) / Math.max(1, pasos - 1);
    let suma = 0;
    for (let k = 0; k < pasos; k++) suma += crudo(k);
    const apuro = Math.min(1, 1600 / Math.max(1, suma));
    const ritmo = (k: number): number => (apurado() ? 16 : Math.max(40, Math.round(crudo(k) * apuro)));
    const total = $('[data-total]');
    const desglose = $('[data-cuenta] .c-desglose');
    desglose?.classList.add('contando');
    const hechos: Paso[] = [];
    const poner = (): void => ponerConteo(cifrasConteo(q, hechos));
    const brinco = (el: Element | null | undefined, cls = 'salta'): void => {
      if (!el) return;
      el.classList.remove(cls);
      void (el as HTMLElement).offsetWidth;
      el.classList.add(cls);
    };
    const encender = (x: Paso): void => {
      const el = termino(x);
      if (!el) return;
      el.classList.add('encendido');
      brinco(el);
    };
    // los «+N» de la bandeja y del paño vuelan de su ficha (o de su naipe) a su término del desglose y mueren ahí: la
    // bandeja dispara y la cuenta recibe, en un solo recorrido (nada queda clavado sobre los botones)
    const volarCifra = (texto: string, de: { x: number; y: number }, a: Element | null | undefined, tono: 'roja' | 'azul' | 'oro'): void => {
      if (!a || quieto() || apurado()) return;
      let r = a.getBoundingClientRect();
      // (0.29) si su término no está a la vista (la cuenta plegada del teléfono), vuela a su cifra de la fórmula: no cae
      // sobre el chip TE PEGA ni sobre un naipe de la mano
      const plegada = r.width < 2;
      if (plegada) {
        const parte = $(`[data-cuenta] ${tono === 'roja' ? '[data-cd]' : '[data-cm]'} [data-v]`);
        if (!parte) return;
        r = parte.getBoundingClientRect();
      }
      const v = document.createElement('span');
      v.className = 'cifra-vuela';
      v.setAttribute('aria-hidden', 'true');
      v.innerHTML = cifra(texto, tono);
      v.style.left = `${Math.round(de.x)}px`;
      v.style.top = `${Math.round(de.y)}px`;
      $('#capa')?.append(v);
      const dx = Math.round(r.left + r.width / 2 - de.x);
      const dy = Math.round((plegada ? r.top - 4 : r.top + r.height / 2) - de.y);
      const ms = 280;
      v.animate(
        [
          { transform: 'translate(-50%, -50%) scale(1.5)' },
          { transform: `translate(calc(-50% + ${Math.round(dx * 0.5)}px), calc(-50% + ${Math.round(dy * 0.5) - 24}px)) scale(1.2)`, offset: 0.5 },
          { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.7)` },
        ],
        { duration: ms, easing: 'steps(8)', fill: 'forwards' },
      );
      window.setTimeout(() => {
        v.remove();
        brinco(a);
      }, ms);
    };
    total?.classList.add('cuenta-sube');
    poner();
    let i = 0;
    for (const x of cartas) {
      const el = $(`[data-mano] .carta[data-id="${CSS.escape(x.de.slice(2))}"]`);
      if (el) {
        const rc = el.getBoundingClientRect();
        el.classList.remove('cuenta-pop');
        void el.offsetWidth;
        el.classList.add('cuenta-pop');
        // el «+N» nace en lo que asoma del naipe sobre el paño, a la derecha de su índice, y sube
        numero(`+${x.v}`, rc.left + rc.width * 0.62, rc.top + Math.min(rc.height * 0.58, 52), 'roja', 1);
      }
      hechos.push(x);
      poner();
      const cd = $('[data-cuenta] [data-cd]') as HTMLElement | null;
      if (cd) cd.style.setProperty('--salto', Math.min(1.26, 1.12 + i * 0.03).toFixed(2));
      brinco(cd);
      brinco(total, 'sube-pulso');
      encender(x);
      nota(i++);
      await pausa(ritmo(i - 1));
    }
    for (const x of piezas) {
      const parte = x.tipo === 'd' ? $('[data-cuenta] [data-cd]') : $('[data-cuenta] [data-cm]');
      const critico = q.critico && x.tipo === 'x' && x.de === 'b:puntahacha';
      if (critico) {
        // el Crítico estalla en la cifra grande del MULTI: cuenta de 6 a 12 en tres cuadros, en oro
        const antes = cifrasConteo(q, hechos).multi;
        hechos.push(x);
        const despues = cifrasConteo(q, hechos).multi;
        const vm = $('[data-cuenta] [data-cm] [data-v]');
        for (const v of [antes + Math.round((despues - antes) / 3), antes + Math.round(((despues - antes) * 2) / 3), despues]) {
          if (vm) vm.innerHTML = cifra(v, 'oro', 'grande');
          await pausa(apurado() ? 0 : 34);
        }
      } else hechos.push(x);
      poner();
      if (parte instanceof HTMLElement) parte.style.setProperty('--salto', Math.min(1.28, 1.14 + i * 0.03).toFixed(2));
      brinco(parte);
      brinco(total, 'sube-pulso');
      encender(x);
      // la ficha de la pieza brinca en la bandeja; en el escritorio, además, suelta su cifra (en el teléfono la bandeja
      // va pegada al retrato y la cifra ya se lee encendida en el desglose)
      const f = dispararFicha(x.de);
      const texto = `${x.tipo === 'x' ? 'x' : '+'}${x.v}`;
      const tono = x.tipo === 'd' ? 'roja' : x.tipo === 'm' ? 'azul' : 'oro';
      if (f) volarCifra(texto, f, termino(x), tono);
      else if (x.de.startsWith('posta:')) {
        // los del paño salen de su lugar: el naipe del Medio, la Chispa (entre el Comodín y su vecino) o el Escalón
        const medio = Math.floor(postasDe(p) / 2);
        const de = x.de === 'posta:medio' ? $(`[data-mano] .posta[data-posta="${medio}"]`) : x.de === 'posta:chispa' ? $('[data-mano] .posta-chispa:not([hidden])') : ($('[data-mano] .posta-escalon:not([hidden])') ?? [...document.querySelectorAll<HTMLElement>('[data-mano] .posta.llena')].pop() ?? null);
        const rd = de?.getBoundingClientRect();
        if (rd && rd.width) volarCifra(texto, { x: rd.left + rd.width / 2, y: rd.top + Math.min(rd.height / 2, 24) }, termino(x), tono);
        if (x.de === 'posta:escalon') sonar('escalon');
        if (x.de === 'posta:chispa') sonar('chispa');
      }
      if (x.de === 'canto') brinco($('[data-cuenta] .c-canto'));
      if (critico) {
        // el Crítico: el MULTI ya llegó a su cifra en oro; a su derecha, dentro de la fórmula, cae el sello «×2» a
        // escala 1,5; la cuenta se sacude y la mesa frena. El término del desglose queda encendido, como registro
        brinco(parte, 'critico');
        selloCritico(x.v);
        sonar('critico');
        sacudir(cuentaEl, 2);
        const r = $('[data-cuenta] [data-cm]')?.getBoundingClientRect();
        if (r) {
          destello(r.left + r.width / 2, r.top + r.height / 2, RAMPA_PALO.D, 26);
          chispas(r.left + r.width / 2, r.top + r.height / 2, RAMPA_PALO.D, 16, 100);
        }
        await frenar(apurado() ? 0 : 150);
      } else if (x.tipo === 'x') await frenar(apurado() ? 0 : 60);
      nota(i++, x.tipo === 'x');
      await pausa(ritmo(i - 1));
    }
    ponerConteo({ dano: q.dano, multi: q.multi });
    // el remate de la cuenta: un respiro, y el total cae grande en oro y se asienta; la cuenta se sacude (más si
    // abate), suena el sello y recién entonces se vuelve a sellar «LE QUEDAN» o «SOBRAN»
    await pausa(apurado() ? 16 : 90);
    if (total) total.innerHTML = cifra(q.total, 'oro', 'grande');
    total?.classList.remove('cuenta-sube');
    total?.classList.add('asienta');
    nota(i + 3, true);
    sonar('revela', { altura: q.abate || q.ejecuta ? 1 : 0.85 });
    await frenar(q.abate || q.ejecuta ? 90 : 50);
    sacudir(cuentaEl, q.abate || q.ejecuta ? 2 : 1);
    if (!quieto() && total) {
      const r = total.getBoundingClientRect();
      const nChispas = q.total >= 150 ? 22 : q.total >= 50 ? 14 : 8;
      chispas(r.left + r.width / 2, r.top + r.height / 2, RAMPA_PALO.D, nChispas, 50);
      if (q.abate || q.total >= 50) sacudirCamara3d(q.total >= 150 ? 0.55 : 0.25);
    }
    cuentaEl?.classList.add('revelada');
    // el total tiene su instante antes de que las cartas vuelen
    await pausa(apurado() ? 160 : 360);
  }

  // ───────────── acciones ─────────────
  async function terminar(): Promise<void> {
    if (ensena && !perfil.aprendido) {
      perfil.aprendido = true;
      guardarPerfil();
    }
    guardar();
    // ganado el combate, el botín brota sobre la misma mesa (sin el corte de pantalla ni el humo del Bufón)
    pintarFase(p.fase === 'botin' && !quieto());
  }
  async function golpear(ids: string[], dadas?: number[]): Promise<void> {
    if (ocupado || !p.combate) return;
    hojaAbierta = false;
    pintarHoja();
    // (la QA y las pruebas pueden pedir dónde va cada carta: se apoyan así antes de contar)
    if (dadas && mano) mano.elegir(ids, dadas);
    const sel = c().mano.filter((k) => ids.includes(k.id));
    const postas = ids.map((id) => mano?.postaDe(id) ?? -1);
    const q = cuenta(p, sel, sel.map((k) => postas[ids.indexOf(k.id)]));
    if (!q.ok) {
      mano?.negar();
      sonar('error');
      if (sel.length) voz(VOZ.noJugada, 'burla');
      return;
    }
    if (q.dano === 0 && enemigo && sel.every((k) => k.palo === enemigo!.palo || k.palo === 'X')) voz(VOZ.inmune, 'burla');
    // (0.23) la ayuda abierta (de un Chiche, del rasgo del Rey) se cierra: el golpe se ve limpio
    ocultarTip();
    ocupado = true;
    $('.mesa')?.classList.add('ocupada');
    mano?.bloquear(true);
    pintarBotones();
    const antes = c().fila.map((e) => ({ ...e }));
    const neto = golpeNeto(q, sel.length);
    // (0.29) el golpe que abate sostiene «NO TE PEGA · LO ABATÍS» hasta que el naipe se parte: la placa no vuelve al
    // golpe crudo del naipe (anunciaba en rojo un golpe que no iba a existir)
    placa = neto !== null ? { n: neto, tajo: tajoAhora(q) } : q.abate || q.ejecuta ? { n: 0, tajo: false, causa: t('loAbatis') } : null;
    await conteo(q);
    await mano?.volar(ids, centro($('[data-carta]')));
    const evs = juego.golpear(p, ids, postas);
    dadoArmado = false;
    await animar(evs, antes, q);
    placa = null;
    if (p.fase !== 'combate') {
      await terminar();
      return;
    }
    ocupado = false;
    $('.mesa')?.classList.remove('ocupada');
    mano?.bloquear(false);
    sincronizar();
    guardar();
    ensenar();
  }
  async function descartar(ids: string[]): Promise<void> {
    if (ocupado || !p.combate || !ids.length) return;
    hojaAbierta = false;
    pintarHoja();
    if (!puedeDescartar(p, ids.length)) {
      mano?.negar();
      sonar('error');
      return;
    }
    ocupado = true;
    mano?.bloquear(true);
    sonar('suelta');
    // (con mando la zona de descarte no se ve: las cartas vuelan al botón DESCARTAR)
    const zona = $<HTMLElement>('[data-soltar="descarte"]');
    await mano?.volar(ids, centro(zona && zona.offsetParent && zona.getBoundingClientRect().width > 0 ? zona : $('[data-accion="descartar"]')));
    const evs = juego.descartar(p, ids);
    await animar(evs, [], null);
    ocupado = false;
    mano?.bloquear(false);
    sincronizar();
    guardar();
  }
  /** Los tres comentarios del Bufón en el primer combate: toda la guía del juego. */
  function ensenar(): void {
    if (!ensena || perfil.aprendido || !p.combate) return;
    const i = c().turno - 1;
    if (i < ENSENANZA.length) decir(tx(ENSENANZA[i]), 'brillo', 0);
    else {
      perfil.aprendido = true;
      guardarPerfil();
    }
  }

  /** El retrato mira hacia la carta que arrastrás. */
  const seguir = (ev: PointerEvent): void => mirarHacia(document.body.classList.contains('arrastrando') ? ev.clientX : null);
  const tramo = tx(TRAMO_NOMBRE[Math.min(2, p.acto)]);
  return {
    nombre: 'mesa',
    html: () => `<main class="pantalla en-partida mesa">
      <header class="cabecera mesa-top">
        <div class="lado"><span class="rotulo">${esc(tramo)} · ${esc(tx(NODO_NOMBRE[tipo]))}</span><span class="sub" data-turno></span></div>
        <div class="lado"><button class="btn marco chico b-jugadas" data-accion="jugadas" data-foco="jugadas" data-tecla="j" aria-label="${t('jugadas')}">${glifo('SEL', 'J')}<span class="b-signo">?</span> <span class="solo-ancho">${t('jugadas')}</span></button><button class="btn marco chico" data-accion="menu" data-foco="menu" aria-label="${t('menu')}"><span class="b-menu-signo" aria-hidden="true">≡</span> <span class="solo-ancho">${t('menu')}</span></button></div>
      </header>
      <section class="escena" data-escena>
        <div class="esc-bufon">${bufonHtml(p.afinidad <= -2 ? 'sombria' : 'reposo')}<p class="bocadillo" data-voz hidden></p></div>
        <div class="enemigo" data-enemigo>${enemigoHtml()}</div>
        <div class="corte" data-corte>${corteHtml()}</div>
      </section>
      <section class="cuenta-zona" data-cuenta aria-live="polite"></section>
      <section class="mano-zona">
        <div class="descarte-zona" data-soltar="descarte">${pxHud('descarte')}<span class="rotulo">${t('alDescarte')}</span></div>
        <div class="mano" data-mano role="group" aria-label="${t('mazo')}"></div>
        <div class="botones">
          <div class="chiches" data-chiches role="group" aria-label="${t('chiches')}"></div>
          <button class="btn marco oro grande" data-accion="golpear" data-foco="golpear" data-tecla="g" disabled>${glifo('X', 'G')}${t('golpear')}</button>
          <button class="btn marco hierro" data-accion="descartar" data-foco="descartar" data-tecla="d" disabled>${glifo('Y', 'D')}${t('descartar')}</button>
          ${p.mazoId === 'mentiroso' ? `<button class="btn marco prisma chico" data-accion="engano" data-foco="engano" data-tecla="e" aria-pressed="false" ${tip(t('engano'), textoGlosario('engano'))}>${glifo('LT', 'E')}<span class="b-nombre">${pxHud('engano')} ${t('engano')}</span><span class="b-regla">${esc(t('enganoRegla', { n: c().enganos }))}</span></button>` : ''}
        </div>
      </section>
      ${hudHtml(p, hud)}
    </main>`,
    alMontar: (raiz) => {
      ponerClima(tipo === 'rey' ? (c().fila.find((e) => e.jefe)?.palo ?? null) : null); // el duelo de Rey trae el clima de su palo
      calentarOfertas(p);
      avivarRetrato(p, () => [hud.vida, hud.vidaMax]);
      document.addEventListener('pointermove', seguir);
      const zonaMano = $('[data-mano]', raiz)!;
      mano = crearMano(zonaMano, {
        alCambiar: () => {
          sonar('carta');
          pintarCuenta();
        },
        alSoltar: (zona: Zona | null, ids) => {
          if (zona === 'enemigo') void golpear(ids);
          else if (zona === 'descarte') void descartar(ids);
        },
        alApuntar: (zona) => {
          $('[data-soltar="enemigo"]', raiz)?.classList.toggle('apunta', zona === 'enemigo');
          $('[data-soltar="descarte"]', raiz)?.classList.toggle('apunta', zona === 'descarte');
        },
        zonas: () => ({ enemigo: $('[data-escena]', raiz)?.getBoundingClientRect(), descarte: $('[data-soltar="descarte"]', raiz)?.getBoundingClientRect() }),
        // (la mesa acomoda sola: la mejor disposición del paño para lo elegido; nunca la peor de las dos del dial)
        acomodar: (ids) => {
          const sel = ids.map((id) => c().mano.find((k) => k.id === id)).filter((k): k is Carta => !!k);
          return sel.length === ids.length ? acomodoMesa(sel) : null;
        },
      }, postasDe(p));
      pintarArriba();
      pintarChiches();
      arrastreChiches(raiz);
      // (0.24) si la mano cambia de ancho (la ventana, o el mando que se lleva la zona AL DESCARTE), el dial vuelve a
      // medir si entra al costado del paño
      let anchoMano = zonaMano.clientWidth;
      observaMano = new ResizeObserver(() => {
        if (zonaMano.clientWidth === anchoMano) return;
        anchoMano = zonaMano.clientWidth;
        // (0.29: en el cuadro siguiente: repintar la cuenta dentro del propio aviso volvía a cambiar el ancho y el
        // navegador protestaba «ResizeObserver loop completed with undelivered notifications»)
        requestAnimationFrame(() => {
          if (!ocupado && mano?.seleccion().length) pintarCuenta();
        });
      });
      observaMano.observe(zonaMano);
      const nuevo = c().turno === 1 && c().golpes === 0 && c().descartes >= B.jugador.descartes - (p.reinado >= 5 ? 1 : 0);
      const repartir = () => {
        mano?.poner(c().mano, nuevo ? centro($('[data-accion="ver-mazo"]', raiz)) : undefined);
        pintarCuenta();
        ensenar();
        ponerMesaLimpia();
        // con mando o teclado, el foco va a la mano (y no al primer botón de la cabecera)
        if (porTeclado() && !document.activeElement?.closest('.mano')) $<HTMLElement>('.mano .carta', raiz)?.focus();
      };
      if (nuevo && !enFoto()) {
        ocupado = true;
        void entrada().then(() => {
          ocupado = false;
          repartir();
          if (!ensena && !mesaLimpiaDicha) voz(tipo === 'rey' ? VOZ.entraRey : VOZ.entra, 'reposo');
          if (tipo === 'rey' && c().fila[0]?.jefe) gritar(p.mazoId, tx(GRITO[p.mazoId].rey));
        });
      } else {
        repartir();
        if (enFoto() && !ensena && !mesaLimpiaDicha) voz(tipo === 'rey' ? VOZ.entraRey : VOZ.entra, 'reposo');
      }
      // para la QA y las pruebas: la mesa viva
      (window as unknown as { __mesa?: unknown }).__mesa = {
        mano,
        golpear,
        descartar,
        sincronizar,
        decir,
        gritar: (texto: string, foto = false) => gritar(p.mazoId, texto, { foto }),
        cuenta: (ids: string[]) => cuentaDe(c().mano.filter((k) => ids.includes(k.id))),
        ocupado: () => ocupado,
        conteoQa,
        usarChiche,
        prenda,
        pintarChiches,
      };
    },
    alSalir: () => {
      acChiches?.abort();
      acChiches = null;
      document.querySelector('.mesa .cuenta-hoja')?.remove();
      document.removeEventListener('pointermove', seguir);
      observaMano?.disconnect();
      ponerFuego(false);
      clearTimeout(vozReloj);
      mano?.destruir();
      mano = null;
    },
    acciones: {
      ...accionesComunes(p),
      jugadas: () => {
        const q = cuentaDe();
        modalJugadas(p, q.ok ? q.jugada : null);
      },
      golpear: () => void golpear(mano?.seleccion() ?? []),
      // (0.28) la cuenta plegada del teléfono: un toque abre (o cierra) su hoja sobre la escena
      hoja: () => {
        if (ocupado) return;
        hojaAbierta = !hojaAbierta;
        sonar('clic');
        pintarHoja();
      },
      // (0.23) el dial del paño: las mismas cartas, apoyadas para el Golpe exacto (o de vuelta al máximo)
      dial: () => {
        if (ocupado || !mano) return;
        const sel = seleccion();
        const d = dialDe(cuentaDe(sel), sel);
        if (!d) return;
        const foco = (document.activeElement as HTMLElement | null)?.closest<HTMLElement>('.carta')?.dataset.id;
        mano.elegir(sel.map((k) => k.id), d.postas);
        sonar(d.exacto ? 'exacto' : 'clic');
        // (0.27) ya está justo: el Bufón no sigue pidiendo «¡Dejalo en 0 justo!»
        const b = $('[data-voz]');
        if (b && b.textContent === t('bufonDial')) {
          clearTimeout(vozReloj);
          b.hidden = true;
        }
        if (foco) $<HTMLElement>(`.mano .carta[data-id="${foco}"]`)?.focus();
      },
      // (con el dedo, el primer toque enseña qué hace y lo deja listo; el segundo lo usa. El cursor ya lo enseña al pasar
      // y el mando o el teclado, al enfocarlo: ahí se usa de una)
      chiche: (el, ev) => {
        const i = Number(el.dataset.i);
        if ((ev as MouseEvent).detail > 0 && ultimoPuntero === 'touch' && chicheListo !== i) {
          chicheListo = i;
          document.querySelectorAll('[data-chiches] .chiche.listo').forEach((b) => b.classList.remove('listo'));
          el.classList.add('listo');
          return;
        }
        chicheListo = null;
        void usarChiche(i);
      },
      descartar: () => void descartar(mano?.seleccion() ?? []),
      engano: () => {
        juego.armarEngano(p, !c().engano);
        if (c().engano) {
          gestoRetrato('guino', 1100);
          poseRetrato('guina', 700);
        }
        sonar('clic');
        pintarCuenta();
      },
    },
  };
}

/** El poder de un palo, para quien lo pregunte (tabla de JUGADAS). */
export const poderDe = (s: Palo): string => tx(PALO_PODER[s]);
