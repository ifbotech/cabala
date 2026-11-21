// El catálogo de todas las piezas de pixel-art del juego: lo recorren la forja (láminas), el linter y las pruebas.
import { PALOS } from '../../rules/cartas';
import { MAZOS } from '../../rules/mazos';
import { EXPRESIONES, bufonMapa } from './bufon';
import { MAZOS as DORSOS } from './dorsos';
import { GLIFOS, TONO_CIFRA, cifraMapa, type TonoCifra } from './cifras';
import { AMULETOS_PX, AUMENTOS_PX, BENDICIONES_PX, CHICHES_PX, HUD_PX, NODOS_PX, amuletoMapa, aumentoMapa, bendicionMapa, chicheMapa, hudMapa, inmuneMapa, nodoMapa, estrellaMapa } from './iconos';
import { logoMapa } from './logo';
import { BARRAS, barraMapa, marcoMapa, panoMapa, type Estilo } from './marcos';
import { comodinMapa, dorsoNaipe, naipeMapa, naipeSegundaMapa } from './naipes';
import { cuadros, personajeMapa } from './personajes';
import { REYES_PX, reyRetrato } from './reyes';
import type { Mapa } from './rejilla';

export interface Pieza {
  grupo: string;
  id: string;
  m: Mapa;
  /** Escala a la que la pinta la forja en su lámina. */
  k?: number;
}

export function catalogo(): Pieza[] {
  const out: Pieza[] = [];
  for (const s of PALOS) for (let n = 1; n <= 12; n++) out.push({ grupo: 'naipes', id: `${s}${n}`, m: naipeMapa(s, n), k: 2 });
  for (const s of PALOS) out.push({ grupo: 'naipes', id: `${s}12-segunda`, m: naipeSegundaMapa(s), k: 2 });
  out.push({ grupo: 'naipes', id: 'comodin', m: comodinMapa(), k: 2 });
  for (const d of DORSOS) out.push({ grupo: 'dorsos', id: d, m: dorsoNaipe(d), k: 3 });
  for (const e of EXPRESIONES) out.push({ grupo: 'bufon', id: e, m: bufonMapa(e), k: 3 });
  for (const r of REYES_PX) for (const a of ['calma', 'parpadeo', 'habla', 'vencido'] as const) out.push({ grupo: 'reyes', id: `${r}-${a}`, m: reyRetrato(r, a), k: 4 });
  for (const mz of MAZOS) for (const c of cuadros()) out.push({ grupo: `personaje-${mz}`, id: `${c.gesto}-${c.mirada}-${c.herida}`, m: personajeMapa(mz, c), k: 3 });
  for (const id of AMULETOS_PX) out.push({ grupo: 'amuletos', id, m: amuletoMapa(id)!, k: 4 });
  for (const id of AUMENTOS_PX) out.push({ grupo: 'aumentos', id, m: aumentoMapa(id)!, k: 4 });
  for (const id of BENDICIONES_PX) out.push({ grupo: 'bendiciones', id, m: bendicionMapa(id)!, k: 4 });
  for (const id of CHICHES_PX) out.push({ grupo: 'chiches', id, m: chicheMapa(id)!, k: 4 });
  for (const id of NODOS_PX) out.push({ grupo: 'interfaz', id: `nodo-${id}`, m: nodoMapa(id), k: 4 });
  for (const id of HUD_PX) out.push({ grupo: 'interfaz', id: `hud-${id}`, m: hudMapa(id), k: 4 });
  for (const s of PALOS) out.push({ grupo: 'interfaz', id: `inmune-${s}`, m: inmuneMapa(s), k: 4 });
  out.push({ grupo: 'interfaz', id: 'estrella', m: estrellaMapa(), k: 4 });
  for (const e of ['madera', 'hierro', 'oro', 'dorado', 'hueso', 'hundido', 'plata', 'prisma', 'tinta', 'paloS', 'paloC', 'paloD', 'paloH'] as Estilo[]) {
    out.push({ grupo: 'marcos', id: e, m: marcoMapa(e), k: 6 });
    if (e === 'madera' || e === 'hierro' || e === 'oro') out.push({ grupo: 'marcos', id: `${e}-viva`, m: marcoMapa(e, true), k: 6 });
  }
  for (const [id, rampa] of Object.entries(BARRAS)) out.push({ grupo: 'marcos', id: `barra-${id}`, m: barraMapa(rampa), k: 6 });
  out.push({ grupo: 'marcos', id: 'pano', m: panoMapa(), k: 4 });
  out.push({ grupo: 'logo', id: 'logo', m: logoMapa(), k: 4 });
  for (const tono of Object.keys(TONO_CIFRA) as TonoCifra[]) for (const g of GLIFOS) out.push({ grupo: 'cifras', id: `${tono}-${g}`, m: cifraMapa(g, tono), k: 3 });
  return out;
}
