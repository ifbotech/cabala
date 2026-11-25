// Fichas icónicas de lectura en 0,2 s para Amuletos, Cábalas y Bendiciones (código de color + cifra pura).
import type { Partida, TipoOferta } from '../rules/estado';
import { B } from '../rules/balance';
import { AMULETO, type AmuletoId } from '../rules/amuletos';
import { AUMENTO, type AumentoId } from '../rules/aumentos';
import { BENDICION, type BendicionId } from '../rules/reyes';
import { tx } from './almacen';
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

const RECORTAR = (s: string, max = 44): string => (s.length <= max ? s : `${s.slice(0, max - 1).trimEnd()}…`);

const SABOR_AMULETO: Partial<Record<AmuletoId, { es: string; en: string; chips: ChipDato[] }>> = {
  cuchillo: { es: 'Espadas cortan hondo.', en: 'Swords cut deep.', chips: [{ texto: `⚔ +${B.amuletos.danoPorCarta}/S`, tono: 'dano' }, { texto: `×${B.amuletos.comunes.cuchilloRemata} ≤50%`, tono: 'multi' }] },
  rebenque: { es: 'Bastos que levantan pared.', en: 'Clubs raise a wall.', chips: [{ texto: `⚔ +${B.amuletos.danoPorCarta}/C`, tono: 'dano' }, { texto: `🛡 +${B.amuletos.comunes.rebenqueEscudo}/C`, tono: 'escudo' }] },
  moneda: { es: 'Oros que multiplican.', en: 'Coins that multiply.', chips: [{ texto: `⚔ +${B.amuletos.danoPorCarta}/D`, tono: 'dano' }, { texto: `+${B.amuletos.comunes.monedaMulti} MULTI`, tono: 'multi' }] },
  mate: { es: 'Copas que templan el cuerpo.', en: 'Cups restore your grit.', chips: [{ texto: `⚔ +${B.amuletos.danoPorCarta}/H`, tono: 'dano' }, { texto: `♥ +${B.amuletos.comunes.mateCura}/H`, tono: 'vida' }] },
  bota: { es: 'Un trago al empezar.', en: 'A sip at start.', chips: [{ texto: `♥ +${B.amuletos.bota}`, tono: 'vida' }] },
  taba: { es: 'La suerte gira cada turno.', en: 'Luck rolls every turn.', chips: [{ texto: '🎲 +MULTI', tono: 'multi' }] },
  lanza: { es: 'Nada frena tu acero.', en: 'Nothing blocks your steel.', chips: [{ texto: '⚔ PERFORA', tono: 'dano' }] },
  poncho: { es: 'Tu defensa pega fuerte.', en: 'Defense strikes back.', chips: [{ texto: '🛡 → ⚔', tono: 'escudo' }] },
  cofre: { es: 'El bolsillo pesa más.', en: 'Heavy pockets hit hard.', chips: [{ texto: '● → MULTI', tono: 'oro' }] },
  caliz: { es: 'Sangre y copa en brindis.', en: 'Blood and cup united.', chips: [{ texto: '♥ → MULTI', tono: 'vida' }] },
  doscaras: { es: 'Nada es inmune a tu mano.', en: 'Nothing is immune.', chips: [{ texto: '★ SIN INMUNE', tono: 'util' }, { texto: '⚠ +CONTRA', tono: 'mal' }] },
  cascabel: { es: 'Canto doble, golpe seco.', en: 'Double call, sharp toll.', chips: [{ texto: `★ CANTO ×${B.amuletos.cascabel}`, tono: 'multi' }, { texto: '⚠ SIN CANTO', tono: 'mal' }] },
  cetro: { es: 'Exactitud letal del Bufón.', en: 'Jester lethal precision.', chips: [{ texto: '★ EXACTO ×2', tono: 'multi' }, { texto: '⚠ −VIDA', tono: 'mal' }] },
};

const SABOR_AUMENTO: Partial<Record<AumentoId, { es: string; en: string; chips: ChipDato[] }>> = {
  sermano: { es: 'El primer golpe manda.', en: 'First strike rules.', chips: [{ texto: `+${B.aumentos.sermano} MULTI`, tono: 'multi' }] },
  retruco: { es: 'La segunda pega más.', en: 'Follow-up hits harder.', chips: [{ texto: `+${B.aumentos.retruco} MULTI`, tono: 'multi' }] },
  manocaliente: { es: 'Cada golpe calienta.', en: 'Every hit heats up.', chips: [{ texto: `+${B.aumentos.manocaliente.multi} MULTI/GOLPE`, tono: 'multi' }] },
  caradepoker: { es: 'El primer golpe ni roza.', en: 'First hit misses you.', chips: [{ texto: '🛡 1° SIN CONTRA', tono: 'escudo' }] },
};

export function fichaIc(tipo: TipoOferta, id: string, p?: Partida): FichaIconica {
  const f = fichaDe(tipo, id, p);
  const en = document.documentElement.lang === 'en';
  if (tipo === 'amuleto') {
    const pre = SABOR_AMULETO[id as AmuletoId];
    if (pre) return { sabor: en ? pre.en : pre.es, chips: pre.chips };
    const d = AMULETO[id as AmuletoId];
    return { sabor: RECORTAR(tx(d.desc)), chips: [{ texto: tx(d.nombre).toUpperCase(), tono: 'util' }] };
  }
  if (tipo === 'aumento') {
    const pre = SABOR_AUMENTO[id as AumentoId];
    if (pre) return { sabor: en ? pre.en : pre.es, chips: pre.chips };
    const d = AUMENTO[id as AumentoId];
    const chips: ChipDato[] = [];
    const txt = tx(d.desc);
    const mMulti = txt.match(/\+(\d+)\s*(?:de\s*)?Multi/i);
    const mDano = txt.match(/\+(\d+)\s*(?:de\s*)?Da[ñn]o/i);
    const mOro = txt.match(/\+(\d+)\s*(?:de\s*)?[Oo]ro/i);
    const mVida = txt.match(/\+(\d+)\s*(?:de\s*)?(?:Vida|Health)/i);
    if (mMulti) chips.push({ texto: `+${mMulti[1]} MULTI`, tono: 'multi' });
    if (mDano) chips.push({ texto: `⚔ +${mDano[1]}`, tono: 'dano' });
    if (mOro) chips.push({ texto: `● +${mOro[1]}`, tono: 'oro' });
    if (mVida) chips.push({ texto: `♥ +${mVida[1]}`, tono: 'vida' });
    if (d.maldicion) chips.push({ texto: '⚠ MALDICIÓN', tono: 'mal' });
    if (!chips.length) chips.push({ texto: '★ CÁBALA', tono: 'util' });
    return { sabor: RECORTAR(txt), chips };
  }
  // Bendición
  const d = BENDICION[id as BendicionId];
  const tiene = p?.bendiciones[d.id] ?? 0;
  const nivel = Math.min(d.niveles, tiene + 1);
  const txt = f.desc;
  const chips: ChipDato[] = [];
  const mMulti = txt.match(/([+×]\d+)\s*(?:de\s*)?Multi/i);
  const mDano = txt.match(/\+(\d+)\s*(?:de\s*)?(?:Da[ñn]o|Damage)/i);
  const mEsc = txt.match(/\+(\d+)\s*(?:de\s*)?(?:Escudo|Shield)/i);
  const mVida = txt.match(/\+(\d+)\s*(?:de\s*)?(?:Vida|Health)/i);
  const mOro = txt.match(/\+(\d+)\s*(?:de\s*)?(?:[Oo]ro|[Gg]old)/i);
  if (mDano) chips.push({ texto: `⚔ +${mDano[1]}`, tono: 'dano' });
  if (mMulti) chips.push({ texto: `${mMulti[1]} MULTI`, tono: 'multi' });
  if (mEsc) chips.push({ texto: `🛡 +${mEsc[1]}`, tono: 'escudo' });
  if (mVida) chips.push({ texto: `♥ +${mVida[1]}`, tono: 'vida' });
  if (mOro) chips.push({ texto: `● +${mOro[1]}`, tono: 'oro' });
  if (!chips.length) chips.push({ texto: `★ NV ${nivel}`, tono: 'util' });
  return { sabor: RECORTAR(txt), chips };
}
