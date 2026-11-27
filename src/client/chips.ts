// Fichas icónicas de lectura en 0,2 s para Amuletos, Cábalas y Bendiciones (código de color + cifra pura).
import type { Partida, TipoOferta } from '../rules/estado';
import { B } from '../rules/balance';
import { AMULETO, type AmuletoId } from '../rules/amuletos';
import { AUMENTO, type AumentoId } from '../rules/aumentos';
import { BENDICION, type BendicionId } from '../rules/reyes';
import { idioma, tx } from './almacen';
import { fichaDe } from './ui';

export type TonoChip = 'dano' | 'multi' | 'escudo' | 'vida' | 'oro' | 'util' | 'mal';

export interface ChipDato {
  texto: string;
  tono: TonoChip;
}

export interface FichaIconica {
  sabor: string;
  chips: ChipDato[];
}

const AMULETO_CHIPS = (en: boolean): Record<AmuletoId, ChipDato[]> => ({
  cuchillo: [
    { texto: `⚔ +${B.amuletos.danoPorCarta} ${en ? 'Swords' : 'Espadas'}`, tono: 'dano' },
    { texto: `×${B.amuletos.comunes.cuchilloRemata} ≤50%`, tono: 'multi' },
  ],
  facon: [{ texto: en ? '⚔ KILL → +1 MULT' : '⚔ ABATIR → +1 MULTI', tono: 'multi' }],
  rebenque: [
    { texto: `⚔ +${B.amuletos.danoPorCarta} ${en ? 'Clubs' : 'Bastos'}`, tono: 'dano' },
    { texto: `🛡 +${B.amuletos.comunes.rebenqueEscudo} ${en ? 'Clubs' : 'Bastos'}`, tono: 'escudo' },
  ],
  boleadoras: [{ texto: en ? '★ 2+ CLUBS → STUN' : '★ 2+ BASTOS → ATURDE', tono: 'escudo' }],
  moneda: [
    { texto: `⚔ +${B.amuletos.danoPorCarta} ${en ? 'Coins' : 'Oros'}`, tono: 'dano' },
    { texto: `+${B.amuletos.comunes.monedaMulti} ${en ? 'MULT' : 'MULTI'}`, tono: 'multi' },
  ],
  mate: [
    { texto: `⚔ +${B.amuletos.danoPorCarta} ${en ? 'Cups' : 'Copas'}`, tono: 'dano' },
    { texto: `♥ +${B.amuletos.comunes.mateCura} ${en ? 'Cups' : 'Copas'}`, tono: 'vida' },
  ],
  bota: [{ texto: `♥ +${B.amuletos.bota}`, tono: 'vida' }],
  taba: [{ texto: `🎲 +${en ? 'MULT' : 'MULTI'}`, tono: 'multi' }],
  lanza: [{ texto: `⚔ ${en ? 'PIERCE' : 'PERFORA'} ×${B.amuletos.lanza}`, tono: 'dano' }],
  poncho: [{ texto: `🛡 → +${B.amuletos.poncho.multi} ${en ? 'MULT' : 'MULTI'}`, tono: 'multi' }],
  cofre: [{ texto: `● → ${en ? 'MULT' : 'MULTI'}`, tono: 'oro' }],
  caliz: [{ texto: `♥ → ${en ? 'MULT' : 'MULTI'}`, tono: 'vida' }],
  doscaras: [
    { texto: `★ ${en ? 'NO IMMUNE' : 'SIN INMUNE'}`, tono: 'util' },
    { texto: `⚠ ${en ? '+ATK' : '+CONTRA'}`, tono: 'mal' },
  ],
  cascabel: [
    { texto: `★ ${en ? 'CALL' : 'CANTO'} ×${B.amuletos.cascabel}`, tono: 'multi' },
    { texto: `⚠ ${en ? 'NO CALL' : 'SIN CANTO'}`, tono: 'mal' },
  ],
  cetro: [
    { texto: `★ ${en ? 'EXACT' : 'EXACTO'} ×2`, tono: 'multi' },
    { texto: `⚠ ${en ? '−HP' : '−VIDA'}`, tono: 'mal' },
  ],
});

const AUMENTO_CHIPS = (en: boolean): Partial<Record<AumentoId, ChipDato[]>> => ({
  sermano: [{ texto: `+${B.aumentos.sermano} ${en ? 'MULT' : 'MULTI'}`, tono: 'multi' }],
  retruco: [{ texto: `+${B.aumentos.retruco} ${en ? 'MULT' : 'MULTI'}`, tono: 'multi' }],
  manocaliente: [{ texto: `+${B.aumentos.manocaliente.multi} ${en ? 'MULT/HIT' : 'MULTI/GOLPE'}`, tono: 'multi' }],
  caradepoker: [{ texto: `🛡 ${en ? '1ST NO HIT' : '1° SIN CONTRA'}`, tono: 'escudo' }],
});

export function fichaIc(tipo: TipoOferta, id: string, p?: Partida): FichaIconica {
  const f = fichaDe(tipo, id, p);
  const en = idioma() === 'en';
  const multLbl = en ? 'MULT' : 'MULTI';
  if (tipo === 'amuleto') {
    const chips = AMULETO_CHIPS(en)[id as AmuletoId] ?? [];
    return { sabor: f.desc, chips };
  }
  if (tipo === 'aumento') {
    const pre = AUMENTO_CHIPS(en)[id as AumentoId];
    if (pre) return { sabor: f.desc, chips: pre };
    const d = AUMENTO[id as AumentoId];
    const chips: ChipDato[] = [];
    const txt = tx(d.desc);
    const mMulti = txt.match(/\+(\d+)\s*(?:de\s*)?(?:Multi|Mult)/i);
    const mDano = txt.match(/\+(\d+)\s*(?:de\s*)?(?:Da[ñn]o|Damage)/i);
    const mOro = txt.match(/\+(\d+)\s*(?:de\s*)?(?:[Oo]ro|Gold)/i);
    const mVida = txt.match(/\+(\d+)\s*(?:de\s*)?(?:Vida|Health)/i);
    if (mMulti) chips.push({ texto: `+${mMulti[1]} ${multLbl}`, tono: 'multi' });
    if (mDano) chips.push({ texto: `⚔ +${mDano[1]}`, tono: 'dano' });
    if (mOro) chips.push({ texto: `● +${mOro[1]}`, tono: 'oro' });
    if (mVida) chips.push({ texto: `♥ +${mVida[1]}`, tono: 'vida' });
    if (d.maldicion) chips.push({ texto: `⚠ ${en ? 'CURSE' : 'MALDICIÓN'}`, tono: 'mal' });
    if (!chips.length) chips.push({ texto: `★ ${en ? 'OMEN' : 'CÁBALA'}`, tono: 'util' });
    return { sabor: f.desc, chips };
  }
  const d = BENDICION[id as BendicionId];
  const tiene = p?.bendiciones[d.id] ?? 0;
  const nivel = Math.min(d.niveles, tiene + 1);
  const txt = f.desc;
  const chips: ChipDato[] = [];
  const mMulti = txt.match(/([+×]\d+)\s*(?:de\s*)?(?:Multi|Mult)/i);
  const mDano = txt.match(/\+(\d+)\s*(?:de\s*)?(?:Da[ñn]o|Damage)/i);
  const mEsc = txt.match(/\+(\d+)\s*(?:de\s*)?(?:Escudo|Shield)/i);
  const mVida = txt.match(/\+(\d+)\s*(?:de\s*)?(?:Vida|Health)/i);
  const mOro = txt.match(/\+(\d+)\s*(?:de\s*)?(?:[Oo]ro|[Gg]old)/i);
  if (mDano) chips.push({ texto: `⚔ +${mDano[1]}`, tono: 'dano' });
  if (mMulti) chips.push({ texto: `${mMulti[1]} ${multLbl}`, tono: 'multi' });
  if (mEsc) chips.push({ texto: `🛡 +${mEsc[1]}`, tono: 'escudo' });
  if (mVida) chips.push({ texto: `♥ +${mVida[1]}`, tono: 'vida' });
  if (mOro) chips.push({ texto: `● +${mOro[1]}`, tono: 'oro' });
  if (!chips.length) chips.push({ texto: `★ ${en ? 'LV' : 'NV'} ${nivel}`, tono: 'util' });
  return { sabor: f.desc, chips };
}
