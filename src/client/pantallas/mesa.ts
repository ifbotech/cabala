// La mesa de combate. Mirando el centro se entiende todo: el enemigo activo, grande, flotando sobre el paño; el
// Bufón a la izquierda, que comenta en bocadillos cortos; la pila de la Corte que queda, a la derecha; la cuenta
// DAÑO × MULTI = TOTAL que aparece al elegir o arrastrar cartas (en reposo, silencio); la mano en fila, y abajo el
// HUD del jugador. Se juega arrastrando las cartas sobre el enemigo (o al descarte), con los botones, con el
// teclado o con el mando.
import { B } from '../../rules/balance';
import type { Carta, Palo } from '../../rules/cartas';
import { cuenta, puedeDescartar } from '../../rules/combate';
import type { Cuenta, Ev } from '../../rules/combate';
import type { Enemigo, Partida } from '../../rules/estado';
import { tieneAmuleto } from '../../rules/estado';
import { MAZO } from '../../rules/mazos';
import * as juego from '../../rules/partida';
import { donesDe } from '../../rules/estado';
import { ver } from '../../rules/perfil';
import { REY_DEF } from '../../rules/reyes';
import { ajustes, alAzar, guardarPerfil, idioma, perfil, t, tx } from '../almacen';
import { nota, sonar, vozBufon } from '../audio';
import { estadoMusica, ponerFuego, ponerMusica } from '../musica';
import { teclear } from '../habla';
import { RAMPA_CURA, RAMPA_ESCUDO, RAMPA_GOLPE, RAMPA_PALO, chispas, destello, haloRey, lluviaDeMonedas, monedas, motas, numero, partirNaipe, tajo } from '../fx/efectos';
import { congelar, enFoto, fogonazoCandil, ponerClima, sacudir } from '../fx/motor';
import { actualizarTiras, avivarRetrato, dispararFicha, gestoFijo, gestoRetrato, gritar, hudHtml, mirarHacia, ponerHud, poseRetrato, vistaDe, type VistaHud } from '../hud';
import { guardar, pintarFase } from '../juego';
import { crearMano, type Mano, type Zona } from '../mano';
import type { Expresion } from '../pixel/bufon';
import { cifra, lienzoNaipe, pxHud, pxInmune, pxNaipe, pxPalo } from '../sprites';
import { JUGADA_NOMBRE, NODO_NOMBRE, PALO_NOMBRE, PALO_PODER, PASO_NOMBRE, RANGO_NOMBRE, TRAMO_NOMBRE } from '../textos';
import { ENSENANZA, GRITO, VOZ } from '../voces';
import { $, bufonHtml, esc, fichaDe, gestoBufon, reyHtml, tip, type Pantalla } from '../ui';
import { porTeclado } from '../nav';
import { pausa, quieto } from '../ritmo';
import { accionesComunes, calentarOfertas, modalJugadas } from './camino';

const AURA: Record<Palo, string> = { S: '#00c8ff', C: '#22d95b', D: '#ffd500', H: '#ff1453' };

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
function cortina(html: string, ms: number, cls = '', alMontar?: (el: HTMLElement) => number): Promise<void> {
  if (quieto()) return Promise.resolve();
  return new Promise((ok) => {
    const el = document.createElement('div');
    el.className = `cortina ${cls}`;
    el.innerHTML = html;
    $('#capa')!.append(el);
    ms += alMontar?.(el) ?? 0;
    let hecho = false;
    const fin = () => {
      if (hecho) return;
      hecho = true;
      el.remove();
      ok();
    };
    el.addEventListener('pointerdown', fin);
    setTimeout(fin, ms);
  });
}

export function pantallaMesa(p: Partida): Pantalla {
  const c = () => p.combate!;
  let mano: Mano | null = null;
  let ocupado = false;
  let hud: VistaHud = vistaDe(p);
  let enemigo: Enemigo | null = c().fila[0] ? { ...c().fila[0] } : null;
  let resto: Enemigo[] = c().fila.slice(1).map((e) => ({ ...e }));
  let furia = c().furia;
  let vozReloj = 0;
  const tipo = c().tipo;
  const ensena = !perfil.aprendido && p.stats.combates === 0;

  const seleccion = (): Carta[] => {
    const ids = mano?.seleccion() ?? [];
    return c().mano.filter((k) => ids.includes(k.id));
  };

  // ───────────── el Bufón habla ─────────────
  function decir(texto: string, gesto: Expresion = 'reposo', ms = 3400): void {
    const b = $('[data-voz]');
    if (!b) return;
    clearTimeout(vozReloj);
    b.textContent = texto;
    b.hidden = false;
    if (!enFoto()) for (let i = 0; i < 3; i++) window.setTimeout(() => vozBufon(texto.charCodeAt(i * 3) || 65), i * 70);
    gestoBufon($('.esc-bufon')!, gesto);
    if (ms > 0 && !enFoto()) vozReloj = window.setTimeout(() => {
      b.hidden = true;
      gestoBufon($('.esc-bufon')!, p.afinidad <= -2 ? 'sombria' : 'reposo');
    }, ms);
  }
  const voz = (lista: readonly { es: string; en: string }[], gesto: Expresion = 'reposo') => decir(tx(alAzar(lista, enFoto() ? 0 : undefined)), gesto);

  // ───────────── pintar ─────────────
  function enemigoHtml(): string {
    const e = enemigo;
    if (!e) return '';
    const palo = tx(PALO_NOMBRE[e.palo]);
    const inmune = tieneAmuleto(p, 'doscaras')
      ? ''
      : `<span class="e-sello e-inmune" ${tip(`${t('inmune')}: ${palo}`, idioma() === 'en' ? `${palo} cards deal no Damage to this enemy.` : `Las cartas de ${palo} no le hacen Daño.`)}>${pxInmune(e.palo)}<b class="rotulo">${t('inmune')}</b></span>`;
    const estados = `${e.aturdido > 0 ? `<span class="e-sello" ${tip(t('aturdido'), idioma() === 'en' ? 'Skips its next Counterattack.' : 'Se salta su próximo Contraataque.')}>${pxHud('aturdido')}<b class="rotulo">${t('aturdido')}${e.aturdido > 1 ? ` ${e.aturdido}` : ''}</b></span>` : ''}${e.elite ? `<span class="chip maldicion">${t('elite')}</span>` : ''}`;
    const rasgo = e.jefe ? `<span class="chip canto e-rasgo" ${tip(tx(REY_DEF[e.palo].rasgo), tx(REY_DEF[e.palo].rasgoDesc))}>${esc(tx(REY_DEF[e.palo].rasgo))}</span>` : '';
    const pct = Math.max(0, Math.round((100 * e.vida) / e.vidaMax));
    return `<div class="e-sellos">${inmune}${estados}</div>
      <div class="e-centro" data-soltar="enemigo">
        <i class="e-pano"></i>
        <div class="e-carta ${e.jefe ? 'jefe' : ''}" data-carta style="--aura:${AURA[e.palo]}">${pxNaipe({ palo: e.palo, n: e.rango })}</div>
        <i class="e-halo" aria-hidden="true"></i>
        <span class="e-suelta chip canto">${t('soltaAca')}</span>
      </div>
      <div class="e-ataque ${e.aturdido > 0 ? 'dormido' : ''}" data-ataque ${tip(`${t('ataque')} ${e.ataque + furia}`, idioma() === 'en' ? 'What hits you at the end of the turn if it still stands.' : 'Lo que te pega al final del turno si sigue en pie.', furia ? `${t('furia')}: ${t('furiaTip', { n: furia })}${e.jefe ? ` · ${t('furiaTurno', { n: B.furia.reyPorTurno })}` : ''}` : '')}>
        ${furia ? `<i class="e-llamas n${furia >= 8 ? 3 : furia >= 4 ? 2 : 1}" aria-hidden="true">${pxHud('furia')}${pxHud('furia')}${pxHud('furia')}</i>` : ''}${pxHud('ataque')}<span data-n="ataque">${cifra(e.ataque + furia, 'roja', 'grande')}</span>
        ${furia ? `<span class="e-furia">${pxHud('furia')}${cifra(`+${furia}`, 'oro')}</span>` : ''}
      </div>
      <div class="e-barras">
        <div class="e-vida" role="img" aria-label="${esc(nombreEnemigo(e))}: ${t('vida')} ${e.vida}/${e.vidaMax}">
          <i class="b-vida" style="width:${pct}%"></i>
          <b class="e-nombre">${esc(nombreEnemigo(e))}</b>
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
        .map((e, i) => `<span class="corte-carta" style="--i:${i}" ${tip(nombreEnemigo(e), `${t('vida')} ${e.vida} · ${t('ataque')} ${e.ataque}`, e.jefe ? tx(REY_DEF[e.palo].rasgoDesc) : '')}>${pxNaipe({ palo: e.palo, n: e.rango })}</span>`)
        .join('')}</div>
      ${cifra(resto.length, 'hueso', 'grande')}`;
  }
  function pasoNombre(de: string): string {
    const [clase, id] = de.split(':');
    if (clase === 'j') return tx(JUGADA_NOMBRE[id as keyof typeof JUGADA_NOMBRE]);
    if (clase === 'c') {
      const k = c().mano.find((x) => x.id === id);
      return k ? (k.palo === 'X' ? '★' : `${k.n}`) : '';
    }
    if (clase === 'a') return fichaDe('amuleto', id).nombre;
    if (clase === 'u') return fichaDe('aumento', id).nombre;
    if (clase === 'b') return fichaDe('bendicion', id).nombre;
    if (clase === 'r') return tx(REY_DEF[id as Palo].carga);
    return PASO_NOMBRE[de] ? tx(PASO_NOMBRE[de]) : de;
  }
  function cuentaHtml(q: Cuenta, sel: Carta[]): string {
    // en reposo, la zona de la cuenta dice qué hacer
    if (!sel.length) return `<div class="cuenta reposo"><span class="sub">${t('elegiCartas')}</span></div>`;
    if (!q.ok) {
      const motivo = q.motivo === 'comodines' ? t('soloComodines') : q.motivo === 'muchas' ? t('muchas') : t('noJugada');
      return `<div class="cuenta invalida"><span class="chip">${motivo}</span></div>`;
    }
    const d = q.pasos.filter((x) => x.tipo === 'd').map((x) => `${pasoNombre(x.de)} +${x.v}`).join(' · ');
    const m = q.pasos.filter((x) => x.tipo !== 'd').map((x) => `${pasoNombre(x.de)} ${x.tipo === 'x' ? '×' : '+'}${x.v}`).join(' · ');
    // cuánto sobra o cuánto le queda: lo que hace falta para buscar el Golpe exacto
    const vidaE = enemigo?.vida ?? 0;
    const queda = !q.abate && !q.ejecuta && enemigo ? `<span class="chip c-queda">${t('leQuedan', { n: Math.max(0, vidaE - q.aVida) })}</span>` : '';
    const destino = (q.abate ? (q.exacto ? `<span class="chip canto c-exacto">${t('exacto')}</span>` : `<span class="chip verde">${t('cae')} · ${t('sobran', { n: q.aVida - vidaE })}</span>`) : q.ejecuta ? `<span class="chip verde">${t('ejecuta')}</span>` : q.contra && q.contra > 0 ? `<span class="chip rojo">${t('tePega', { n: q.contra })}</span>` : `<span class="chip azul">${t('noTePega')}</span>`) + queda;
    const efectos = `${q.escudo ? `<span class="c-efecto">${pxHud('escudo')}${cifra(`+${q.escudo}`, 'azul')}</span>` : ''}${q.cura ? `<span class="c-efecto">${pxHud('vida')}${cifra(`+${q.cura}`, 'verde')}</span>` : ''}${q.oro ? `<span class="c-efecto">${pxHud('oro')}${cifra(`+${q.oro}`, 'oro')}</span>` : ''}`;
    return `<div class="cuenta ${q.abate || q.ejecuta ? 'abate' : ''}" ${tip(`${t('dano')} ${q.dano} × ${t('multi')} ${q.multi} = ${q.total}`, d, m)}>
      <span class="chip c-jugada">${esc(tx(JUGADA_NOMBRE[q.jugada]))}</span>
      <span class="c-parte" data-cd><span class="rotulo">${t('dano')}</span><span data-v>${cifra(q.dano, 'roja', 'grande')}</span></span>
      ${cifra('x', 'hueso')}
      <span class="c-parte" data-cm><span class="rotulo">${t('multi')}</span><span data-v>${cifra(q.multi, 'azul', 'grande')}</span></span>
      ${cifra('=', 'hueso')}
      <span class="c-total" data-total>${cifra(q.total, 'oro', 'grande')}</span>
      <span class="c-chips">${q.canto ? `<span class="chip canto c-canto">${esc(tx(MAZO[p.mazoId].canto))}</span>` : ''}${q.critico ? `<span class="chip canto">${t('critico')}</span>` : ''}${q.perfora && enemigo && enemigo.escudo > 0 ? `<span class="chip azul">${t('perfora')}</span>` : ''}${destino}${efectos}</span>
    </div>`;
  }
  function pintarCuenta(): void {
    const sel = seleccion();
    const q = cuenta(p, sel);
    const el = $('[data-cuenta]');
    if (el) el.innerHTML = cuentaHtml(q, sel);
    // el Ataque del enemigo late más fuerte cuando el golpe elegido no lo abate
    const ataque = $('[data-ataque]');
    ataque?.classList.toggle('inminente', !!enemigo && enemigo.aturdido <= 0 && !(q.ok && (q.abate || q.ejecuta)));
    ataque?.classList.toggle('mortal', q.ok && q.contra !== null && q.contra >= hud.vida);
    marcarInmunes();
    marcarCopias(q);
    pintarBotones();
    // el retrato sonríe confiado apenas la selección marca un Golpe exacto
    gestoFijo(q.ok && q.exacto ? 'feroz' : null);
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
  function pintarBotones(): void {
    const sel = seleccion();
    const q = cuenta(p, sel);
    const g = $<HTMLButtonElement>('[data-accion="golpear"]');
    if (g) g.disabled = ocupado || !q.ok;
    const d = $<HTMLButtonElement>('[data-accion="descartar"]');
    const modo = puedeDescartar(p, sel.length);
    if (d) {
      d.disabled = ocupado || !sel.length || !modo;
      d.innerHTML = `${modo === 'gratis' || (c().pasar && !sel.length) ? `${pxHud('pasar')} ${t('pasar')}` : `${t('descartar')} <span class="b-quedan">(${c().descartes})</span>`}`;
    }
    const e = $<HTMLButtonElement>('[data-accion="engano"]');
    if (e) {
      e.disabled = ocupado || c().enganos <= 0;
      e.classList.toggle('oro', c().engano);
      e.setAttribute('aria-pressed', String(c().engano));
    }
  }
  function pintarEnemigo(): void {
    const el = $('[data-enemigo]');
    if (el) el.innerHTML = enemigoHtml();
    const corte = $('[data-corte]');
    if (corte) corte.innerHTML = corteHtml();
  }
  function pintarArriba(): void {
    const el = $('[data-turno]');
    const racha = (p.racha ?? 0) > 0 ? ` <span class="chip canto" ${tip(t('racha', { n: p.racha }), idioma() === 'en' ? `Exact hits in a row. Your next exact hit gives +${Math.min(B.exacto.rachaTope, p.racha + 1)} Mult.` : `Golpes exactos seguidos. Tu próximo exacto da +${Math.min(B.exacto.rachaTope, p.racha + 1)} de Multi.`)}>${t('racha', { n: p.racha })}</span>` : '';
    const enRacha = (p.racha ?? 0) >= 2;
    $('.mesa')?.classList.toggle('racha', enRacha);
    ponerFuego(enRacha);
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
  }

  // ───────────── animar los sucesos de una acción ─────────────
  async function animar(evs: Ev[], antes: Enemigo[], q: Cuenta | null): Promise<void> {
    let indice = 0;
    const carta = () => $('[data-carta]');
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
          sacudir($('[data-enemigo]'), peso + 1);
          if (peso > 0) sacudir($('[data-escena]'), peso);
          fogonazoCandil([0.4, 0.7, 1][peso]);
          if (q?.exacto && q.abate) fogonazo('oro');
          await frenar([60, 110, 170][peso]);
          if (ev.critico) numero(t('critico').replace(/[^0-9]/g, '') || 'x2', en.x, en.y - 60, 'oro', 2);
          await pausa(90);
          break;
        }
        case 'canto':
          sonar('canto');
          gestoRetrato('feroz', 1200);
          $('[data-cuenta] .c-canto')?.classList.add('salta');
          gritar(p.mazoId, tx(MAZO[p.mazoId].canto));
          if (!quieto()) {
            // el canto cruza la mesa en grande
            const en = centro(carta());
            const g = document.createElement('b');
            g.className = 'canto-grande titulo';
            g.textContent = tx(MAZO[p.mazoId].canto);
            g.style.left = `${Math.round(en.x)}px`;
            g.style.top = `${Math.round(en.y)}px`;
            $('#capa')?.append(g);
            window.setTimeout(() => g.remove(), 850);
          }
          if (Math.random() < 0.4) voz(VOZ.canto, 'risa');
          else gestoBufon($('.esc-bufon')!, 'risa');
          break;
        case 'dano': {
          if (!enemigo) break;
          const en = centro(carta());
          numero(ev.n, en.x, en.y - 30, ev.aEscudo >= ev.n ? 'azul' : 'roja', ev.n >= enemigo.vidaMax * 0.5 ? 2 : 1);
          enemigo.vida = ev.vida;
          enemigo.escudo = ev.escudo;
          pintarEnemigo();
          $('[data-carta]')?.classList.add('herido');
          if (ev.n >= enemigo.vidaMax * 0.75) voz(VOZ.fuerte, 'risa');
          if (enemigo.jefe && ev.vida > 0 && ev.n >= enemigo.vidaMax * 0.3) reyDice(tx(REY_DEF[enemigo.palo].voz.duele));
          await pausa(160);
          break;
        }
        case 'exacto': {
          const en = centro(carta());
          destello(en.x, en.y, RAMPA_PALO.D, 26);
          sonar('exacto');
          gestoRetrato('festejo', 1300);
          poseRetrato('festeja', 700);
          voz(VOZ.exacto, 'risa');
          if (Math.random() < 0.6) gritar(p.mazoId, tx(alAzar(GRITO[p.mazoId].exacto)));
          break;
        }
        case 'escudo': {
          hud.escudo = Math.min(B.jugador.escudoMax, hud.escudo + ev.n);
          ponerHud(hud);
          const en = centro($('[data-hud-escudo]'));
          motas(en.x, en.y, RAMPA_ESCUDO, 8, 24);
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
          pintarEnemigo();
          voz(VOZ.aturde, 'burla');
          break;
        case 'cae': {
          const el = carta();
          const r = el?.getBoundingClientRect();
          const cayoRey = !!enemigo?.jefe;
          if (enemigo?.jefe && !quieto()) {
            // el remate del tramo: la música calla, la mesa se congela en blanco y el Rey dice lo último
            const pista = estadoMusica().deseada;
            ponerMusica(null);
            fogonazo('blanco');
            sacudir($('.mesa'), 3);
            await frenar(210);
            const b = document.createElement('p');
            b.className = 'bocadillo sin-cola e-dice';
            $('[data-enemigo] .e-centro')?.append(b);
            const ms = teclear(b, tx(REY_DEF[enemigo.palo].voz.cae), enemigo.palo);
            await pausa(ms + 850);
            b.remove();
            sonar('victoria');
            lluviaDeMonedas(innerWidth * 0.1, innerWidth * 0.9, -30, 34);
            gestoRetrato('festejo', 2400);
            poseRetrato('festeja', 1500);
            gritar(p.mazoId, tx(GRITO[p.mazoId].gana));
            window.setTimeout(() => estadoMusica().deseada === null && ponerMusica(pista), 1400);
          }
          sonar('cae');
          if (r && enemigo) {
            partirNaipe(lienzoNaipe(enemigo.palo, enemigo.rango), r, RAMPA_PALO[enemigo.palo]);
            el!.classList.add('partida');
            monedas(r.left + r.width / 2, r.top + r.height / 2, centro($('[data-hud-oro]')).x, centro($('[data-hud-oro]')).y, 5);
          }
          if (ev.ejecutado) voz(VOZ.fuerte, 'risa');
          // la rajadura termina antes de que entre el que sigue (y el Rey se queda un rato más en escena)
          await pausa(quieto() ? 420 : cayoRey ? 1100 : 640);
          enemigo = null;
          break;
        }
        case 'entra': {
          indice++;
          enemigo = antes[indice] ? { ...antes[indice] } : c().fila[0] ? { ...c().fila[0] } : null;
          resto = antes.slice(indice + 1).map((e) => ({ ...e }));
          pintarEnemigo();
          $('[data-carta]')?.classList.add('entra');
          if (ev.jefe) {
            ver(perfil, `r:${ev.palo}`);
            sonar('rey');
            const en = centro(carta());
            haloRey(en.x, en.y, AURA[ev.palo], 200);
            await irrupcion(ev.palo);
            voz(VOZ.entraRey, 'sombria');
            gritar(p.mazoId, tx(GRITO[p.mazoId].rey));
          } else voz(VOZ.entra, 'reposo');
          await pausa(220);
          break;
        }
        case 'perfora': {
          const en = centro(carta());
          tajo('S', en.x, en.y, 60);
          break;
        }
        case 'sincontra':
          if (ev.por === 'aturdido' && enemigo) enemigo.aturdido = Math.max(0, enemigo.aturdido - 1);
          if (ev.por === 'caradepoker') {
            await aparicion('caradepoker');
          }
          sonar('frena');
          pintarEnemigo();
          break;
        case 'contra': {
          const el = carta();
          el?.classList.remove('embiste');
          void (el as HTMLElement | null)?.offsetWidth;
          el?.classList.add('embiste');
          await pausa(140);
          const en = centro($('[data-hud-vida]'));
          hud.escudo = Math.max(0, hud.escudo - ev.frenado);
          hud.vida = ev.vida;
          ponerHud(hud);
          if (ev.n - ev.frenado > 0) {
            numero(`-${ev.n - ev.frenado}`, en.x, en.y - 30, 'roja', 2);
            chispas(en.x, en.y, RAMPA_GOLPE, 10, 80);
            sonar('contra');
            gestoRetrato('mueca', 900);
            if (enemigo?.jefe && hud.vida > 0 && (ev.n - ev.frenado) * 6 >= hud.vidaMax) reyDice(tx(alAzar(REY_DEF[enemigo.palo].voz.pega)));
            if (hud.vida > 0 && hud.vida * 3 <= hud.vidaMax) {
              window.setTimeout(() => {
                gestoRetrato('pavor', 1500);
                poseRetrato('tiembla', 1500);
              }, 900);
            }
            if ((ev.n - ev.frenado) * 5 >= hud.vidaMax) gritar(p.mazoId, tx(alAzar(GRITO[p.mazoId].dolor)));
            sacudir($('[data-hud]'), 2);
            congelar(50);
            voz(hud.vida * 3 <= hud.vidaMax ? VOZ.pocaVida : VOZ.contra, hud.vida * 3 <= hud.vidaMax ? 'sombria' : 'burla');
          } else {
            const es = centro($('[data-hud-escudo]'));
            motas(es.x, es.y, RAMPA_ESCUDO, 12, 30);
            sonar('frena');
            voz(VOZ.frenado, 'risa');
          }
          await pausa(260);
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
          if (enemigo) {
            if (ev.que === 'cura') enemigo.vida = Math.min(enemigo.vidaMax, enemigo.vida + ev.n);
            if (ev.que === 'escudo') enemigo.escudo += ev.n;
            if (ev.que === 'diezmo') {
              hud.oro = Math.max(0, hud.oro - ev.n);
              ponerHud(hud);
              const de = centro($('[data-hud-oro]'));
              const a = centro(carta());
              monedas(de.x, de.y, a.x, a.y, Math.min(6, ev.n));
            }
            pintarEnemigo();
          }
          break;
        case 'roba': {
          const de = centro($('[data-accion="ver-mazo"]'));
          hud.mazo = Math.max(0, hud.mazo - ev.ids.length);
          ponerHud(hud);
          mano?.poner(c().mano, de);
          sonar('carta');
          break;
        }
        case 'baraja':
          hud.mazo = c().mazo.length + (evs.filter((x) => x.t === 'roba').length ? 0 : 0);
          ponerHud(hud);
          break;
        case 'sena':
          await aparicion('senafalsa');
          break;
        case 'salva':
          await aparicion('irsealmazo');
          hud.vida = p.vida;
          ponerHud(hud);
          break;
        case 'dado':
          pintarArriba();
          break;
        case 'victoria':
          voz(VOZ.victoria, 'risa');
          if (tipo === 'rey') gritar(p.mazoId, tx(GRITO[p.mazoId].gana));
          await pausa(650);
          break;
        case 'derrota':
          hud.vida = 0;
          ponerHud(hud);
          await pausa(900);
          break;
        default:
          break;
      }
    }
  }

  /** La irrupción teatral de un Rey: su retrato, su aura y lo que te dice según lo que llevás de él. */
  function irrupcion(palo: Palo): Promise<void> {
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
  function aparicion(aumento: 'caradepoker' | 'senafalsa' | 'irsealmazo'): Promise<void> {
    const f = fichaDe('aumento', aumento);
    sonar('canto');
    return cortina(`<div class="irr-banda bufonada">${bufonHtml('brillo')}<div class="irr-texto"><b class="titulo">${esc(f.nombre)}</b><p class="bocadillo sin-cola">${esc(f.desc)}</p></div></div>`, 1000, 'irrupcion');
  }
  /** La entrada del combate: el rótulo de lo que viene (o el Rey en persona). */
  async function entrada(): Promise<void> {
    if (tipo === 'rey') {
      const palo = c().fila[c().fila.length - 1].palo;
      sonar('rey');
      await irrupcion(palo);
      return;
    }
    await cortina(`<div class="irr-banda rotulo-entrada"><b class="titulo">${esc(tx(NODO_NOMBRE[tipo]))}</b><span class="sub">${esc(tx(TRAMO_NOMBRE[Math.min(2, p.acto)]))}</span></div>`, 800, 'irrupcion');
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
    const m = $('.mesa');
    m?.classList.add('hitstop');
    await pausa(ms);
    m?.classList.remove('hitstop');
  }
  /** Un fogonazo de pantalla entera: blanco cuando cae un Rey, dorado en el Golpe exacto que mata. */
  function fogonazo(tono: 'blanco' | 'oro'): void {
    if (quieto()) return;
    const f = document.createElement('i');
    f.className = `fogonazo f-${tono}`;
    $('#capa')?.append(f);
    window.setTimeout(() => f.remove(), 420);
  }

  /**
   * El conteo del golpe, pieza por pieza: cada carta salta con su número, después dispara cada cosa que suma (la
   * jugada, el canto, cada Amuleto, Cábala y Bendición, con su nombre y su ficha del HUD a los brincos), el Daño y
   * el Multi suben a la vista y recién al final aparece el total.
   */
  async function conteo(q: Cuenta): Promise<void> {
    if (quieto()) return;
    const esCarta = (x: { tipo: string; de: string }): boolean => x.tipo === 'd' && x.de.startsWith('c:');
    const cartas = q.pasos.filter(esCarta);
    const orden = { d: 0, m: 1, x: 2 } as const;
    const piezas = q.pasos.filter((x) => !esCarta(x) && x.v !== 0).sort((u, v) => orden[u.tipo] - orden[v.tipo]);
    const paso = Math.max(42, Math.min(95, Math.round(820 / (cartas.length + piezas.length + 1))));
    const vd = $('[data-cuenta] [data-cd] [data-v]');
    const vm = $('[data-cuenta] [data-cm] [data-v]');
    const total = $('[data-total]');
    // de dónde arranca cada cifra: lo que no viene de ningún paso (la base) ya está puesto
    const prod = piezas.filter((x) => x.tipo === 'x').reduce((n, x) => n * x.v, 1);
    let dano = q.dano - q.pasos.filter((x) => x.tipo === 'd').reduce((n, x) => n + x.v, 0);
    let multi = Math.round(q.multi / prod) - piezas.filter((x) => x.tipo === 'm').reduce((n, x) => n + x.v, 0);
    const poner = (): void => {
      if (vd) vd.innerHTML = cifra(Math.max(0, dano), 'roja', 'grande');
      if (vm) vm.innerHTML = cifra(Math.max(0, multi), 'azul', 'grande');
    };
    const brinco = (el: Element | null | undefined): void => {
      if (!el) return;
      el.classList.remove('salta');
      void (el as HTMLElement).offsetWidth;
      el.classList.add('salta');
    };
    total?.classList.add('espera');
    poner();
    let i = 0;
    // los nombres se apilan hacia arriba (hasta cuatro por cifra) para que no se pisen entre sí
    const pila = { d: 0, m: 0 };
    for (const x of cartas) {
      const el = $(`[data-mano] .carta[data-id="${x.de.slice(2)}"]`);
      if (el) {
        const rc = el.getBoundingClientRect();
        el.classList.remove('cuenta-pop');
        void el.offsetWidth;
        el.classList.add('cuenta-pop');
        numero(`+${x.v}`, rc.left + rc.width / 2, rc.top - 4, 'roja', 1);
      }
      dano += x.v;
      poner();
      nota(i++);
      await pausa(paso);
    }
    for (const x of piezas) {
      const parte = x.tipo === 'd' ? $('[data-cuenta] [data-cd]') : $('[data-cuenta] [data-cm]');
      if (x.tipo === 'd') dano += x.v;
      else if (x.tipo === 'm') multi += x.v;
      else multi *= x.v;
      poner();
      brinco(parte);
      // el nombre de lo que suma sube desde la cifra: así se aprende qué pieza da qué
      const rp = parte?.getBoundingClientRect();
      if (rp) {
        const n = document.createElement('b');
        n.className = `c-vuela v-${x.tipo}`;
        n.textContent = `${pasoNombre(x.de)} ${x.tipo === 'x' ? '×' : '+'}${x.v}`;
        n.style.left = `${Math.round(rp.left + rp.width / 2)}px`;
        const k = x.tipo === 'd' ? pila.d++ : pila.m++;
        n.style.top = `${Math.round(rp.top)}px`;
        n.style.marginTop = `${-(k % 4) * 1.7}em`;
        $('#capa')?.append(n);
        window.setTimeout(() => n.remove(), 900);
      }
      const f = dispararFicha(x.de);
      if (f) numero(`${x.tipo === 'x' ? 'x' : '+'}${x.v}`, f.x, f.y - 6, x.tipo === 'd' ? 'roja' : x.tipo === 'm' ? 'azul' : 'oro', x.tipo === 'x' ? 2 : 1);
      if (x.de === 'canto') brinco($('[data-cuenta] .c-canto'));
      nota(i++, x.tipo === 'x');
      if (x.tipo === 'x') await frenar(60);
      await pausa(paso);
    }
    dano = q.dano;
    multi = q.multi;
    poner();
    total?.classList.remove('espera');
    total?.classList.add('vibra');
    nota(i + 3, true);
    await pausa(paso + 60);
  }

  // ───────────── acciones ─────────────
  async function terminar(): Promise<void> {
    if (ensena && !perfil.aprendido) {
      perfil.aprendido = true;
      guardarPerfil();
    }
    guardar();
    pintarFase();
  }
  async function golpear(ids: string[]): Promise<void> {
    if (ocupado || !p.combate) return;
    const sel = c().mano.filter((k) => ids.includes(k.id));
    const q = cuenta(p, sel);
    if (!q.ok) {
      mano?.negar();
      sonar('error');
      if (sel.length) voz(VOZ.noJugada, 'burla');
      return;
    }
    if (q.dano === 0 && enemigo && sel.every((k) => k.palo === enemigo!.palo || k.palo === 'X')) voz(VOZ.inmune, 'burla');
    ocupado = true;
    $('.mesa')?.classList.add('ocupada');
    mano?.bloquear(true);
    pintarBotones();
    const antes = c().fila.map((e) => ({ ...e }));
    await conteo(q);
    await mano?.volar(ids, centro($('[data-carta]')));
    const evs = juego.golpear(p, ids);
    await animar(evs, antes, q);
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
    if (!puedeDescartar(p, ids.length)) {
      mano?.negar();
      sonar('error');
      return;
    }
    ocupado = true;
    mano?.bloquear(true);
    sonar('suelta');
    await mano?.volar(ids, centro($('[data-soltar="descarte"]')));
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
        <div class="lado"><button class="btn marco chico b-jugadas" data-accion="jugadas" data-foco="jugadas" data-tecla="j" aria-label="${t('jugadas')}">? <span class="solo-ancho">${t('jugadas')}</span></button><button class="btn marco chico" data-accion="menu" data-foco="menu" aria-label="${t('menu')}">≡ <span class="solo-ancho">${t('menu')}</span></button></div>
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
          <button class="btn marco oro grande" data-accion="golpear" data-foco="golpear" data-tecla="g" disabled>${t('golpear')}</button>
          <button class="btn marco hierro" data-accion="descartar" data-foco="descartar" data-tecla="d" disabled>${t('descartar')}</button>
          ${p.mazoId === 'mentiroso' ? `<button class="btn marco prisma chico" data-accion="engano" data-foco="engano" data-tecla="e" aria-pressed="false" ${tip(t('engano'), tx(MAZO.mentiroso.reglas[1]))}>${pxHud('engano')} ${t('engano')}</button>` : ''}
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
      });
      pintarArriba();
      const nuevo = c().turno === 1 && c().golpes === 0 && c().descartes >= B.jugador.descartes - (p.reinado >= 5 ? 1 : 0);
      const repartir = () => {
        mano?.poner(c().mano, nuevo ? centro($('[data-accion="ver-mazo"]', raiz)) : undefined);
        pintarCuenta();
        ensenar();
        // con mando o teclado, el foco va a la mano (y no al primer botón de la cabecera)
        if (porTeclado() && !document.activeElement?.closest('.mano')) $<HTMLElement>('.mano .carta', raiz)?.focus();
      };
      if (nuevo && !enFoto()) {
        ocupado = true;
        void entrada().then(() => {
          ocupado = false;
          repartir();
          if (!ensena) voz(tipo === 'rey' ? VOZ.entraRey : VOZ.entra, 'reposo');
          if (tipo === 'rey' && c().fila[0]?.jefe) gritar(p.mazoId, tx(GRITO[p.mazoId].rey));
        });
      } else {
        repartir();
        if (enFoto() && !ensena) voz(tipo === 'rey' ? VOZ.entraRey : VOZ.entra, 'reposo');
      }
      // para la QA y las pruebas: la mesa viva
      (window as unknown as { __mesa?: unknown }).__mesa = { mano, golpear, descartar, sincronizar, decir, gritar: (texto: string) => gritar(p.mazoId, texto) };
    },
    alSalir: () => {
      document.removeEventListener('pointermove', seguir);
      ponerFuego(false);
      clearTimeout(vozReloj);
      mano?.destruir();
      mano = null;
    },
    acciones: {
      ...accionesComunes(p),
      jugadas: () => {
        const q = cuenta(p, seleccion());
        modalJugadas(p, q.ok ? q.jugada : null);
      },
      golpear: () => void golpear(mano?.seleccion() ?? []),
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
