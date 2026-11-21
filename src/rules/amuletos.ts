// Los 15 Amuletos, ni uno más: 3 por palo (1 Común, 1 Raro, 1 Épico) y 3 del Bufón, todos Legendarios.
import { B, L, fillL, pct } from './balance';
import type { Palo } from './cartas';

export type Rareza = 'comun' | 'raro' | 'epico' | 'legendario';
export const RAREZAS: readonly Rareza[] = ['comun', 'raro', 'epico', 'legendario'];
export const RAREZA_NOMBRE: Record<Rareza, L> = {
  comun: L('Común', 'Common'),
  raro: L('Raro', 'Rare'),
  epico: L('Épico', 'Epic'),
  legendario: L('Legendario', 'Legendary'),
};

export type AmuletoId =
  | 'cuchillo' | 'facon' | 'lanza'
  | 'rebenque' | 'boleadoras' | 'poncho'
  | 'moneda' | 'taba' | 'cofre'
  | 'mate' | 'bota' | 'caliz'
  | 'cascabel' | 'doscaras' | 'cetro';

export interface AmuletoDef {
  id: AmuletoId;
  /** El palo de su Rey; 'X' = del Bufón. */
  palo: Palo | 'X';
  rareza: Rareza;
  nombre: L;
  desc: L;
}

const a = B.amuletos;
const PALO_ES: Record<Palo, string> = { S: 'Espadas', C: 'Bastos', D: 'Oros', H: 'Copas' };
const PALO_EN: Record<Palo, string> = { S: 'Swords', C: 'Clubs', D: 'Coins', H: 'Cups' };
const ac = a.comunes;
/** Los cuatro Comunes: Daño por carta de su palo que crece con el tramo, y una segunda mitad propia. */
const porCarta = (p: Palo, es: string, en: string, v: Record<string, number> = {}): L =>
  fillL(L(`+{n} de Daño por cada ${PALO_ES[p].replace(/s$/, '')} del golpe (×2 en el tramo 2, ×3 en el 3). ${es}`, `+{n} Damage per ${PALO_EN[p].replace(/s$/, '')} in the hit (×2 in act 2, ×3 in act 3). ${en}`), { n: a.danoPorCarta, ...v });

const lista: AmuletoDef[] = [
  { id: 'cuchillo', palo: 'S', rareza: 'comun', nombre: L('Cuchillo criollo', 'Criollo Knife'), desc: porCarta('S', 'Enemigo a media Vida o menos: ×{x}.', 'Enemy at half Health or less: ×{x}.', { x: ac.cuchilloRemata }) },
  { id: 'facon', palo: 'S', rareza: 'raro', nombre: L('Facón de plata', 'Silver Facón'), desc: L('Abatir a un enemigo con Espadas en el golpe: +1 de Multi en tu próximo golpe.', 'Take an enemy down with Swords in the hit: +1 Mult on your next hit.') },
  { id: 'lanza', palo: 'S', rareza: 'epico', nombre: L('Lanza del Caudillo', "Warlord's Lance"), desc: fillL(L('Todos tus golpes Perforan, y lo que sobra pasa ×{x} al siguiente.', 'All your hits Pierce, and the overflow carries ×{x} to the next enemy.'), { x: a.lanza }) },
  { id: 'rebenque', palo: 'C', rareza: 'comun', nombre: L('Rebenque', 'Rawhide Whip'), desc: porCarta('C', 'Y cada Basto te da +{e} de Escudo más.', 'And each Club gives you +{e} more Shield.', { e: ac.rebenqueEscudo }) },
  { id: 'boleadoras', palo: 'C', rareza: 'raro', nombre: L('Boleadoras', 'Bolas'), desc: L('Golpe con 2 o más Bastos: el enemigo queda Aturdido (una vez por enemigo).', 'Hit with 2 or more Clubs: the enemy is Stunned (once per enemy).') },
  { id: 'poncho', palo: 'C', rareza: 'epico', nombre: L('Poncho del Cacique', "Chieftain's Poncho"), desc: fillL(L('Con {e} o más de Escudo: +{m} de Multi.', 'With {e} or more Shield: +{m} Mult.'), { e: a.poncho.escudo, m: a.poncho.multi }) },
  { id: 'moneda', palo: 'D', rareza: 'comun', nombre: L('Moneda falsa', 'False Coin'), desc: porCarta('D', 'Con {k} o más Oros en el golpe, +{m} de Multi.', 'With {k} or more Coins in the hit, +{m} Mult.', { k: ac.monedaDesde, m: ac.monedaMulti }) },
  { id: 'taba', palo: 'D', rareza: 'raro', nombre: L('Taba', 'Knucklebone'), desc: fillL(L('Cada turno se tira la taba: con {d} o más, +{m} de Multi.', 'Each turn the knucklebone is thrown: on {d} or more, +{m} Mult.'), { d: a.taba.desde, m: a.taba.multi }) },
  { id: 'cofre', palo: 'D', rareza: 'epico', nombre: L('Cofre del Caudal', "Fortune's Chest"), desc: fillL(L('+1 de Multi por cada {k} de oro que tengas (tope +{t}).', '+1 Mult for every {k} gold you hold (max +{t}).'), { k: a.cofre.cada, t: a.cofre.tope }) },
  { id: 'mate', palo: 'H', rareza: 'comun', nombre: L('Mate curado', 'Seasoned Mate'), desc: porCarta('H', 'Y cada Copa te cura +{c} más.', 'And each Cup heals you +{c} more.', { c: ac.mateCura }) },
  { id: 'bota', palo: 'H', rareza: 'raro', nombre: L('Bota de vino', 'Wineskin'), desc: fillL(L('Al empezar cada combate curás {c} de Vida.', 'At the start of each fight you heal {c} Health.'), { c: a.bota }) },
  { id: 'caliz', palo: 'H', rareza: 'epico', nombre: L('Cáliz del Bacanal', "Reveler's Chalice"), desc: fillL(L('Con {p} % de Vida o más: +{m} de Multi.', 'At {p}% Health or more: +{m} Mult.'), { p: pct(a.caliz.vida), m: a.caliz.multi }) },
  { id: 'cascabel', palo: 'X', rareza: 'legendario', nombre: L('Cascabel del Bufón', "Jester's Bell"), desc: fillL(L('Los cantos de tu Mazo valen doble, y cada canto te deja +{m} de Multi para el resto del combate.', "Your deck's calls count double, and each call leaves you +{m} Mult for the rest of the fight."), { m: a.cascabelMulti }) },
  { id: 'doscaras', palo: 'X', rareza: 'legendario', nombre: L('Naipe de dos caras', 'Two-Faced Card'), desc: fillL(L('Nada es Inmune a tus cartas, y las del palo del enemigo pegan ×{x}.', "Nothing is Immune to your cards, and cards of the enemy's suit strike ×{x}."), { x: a.doscarasDoble }) },
  { id: 'cetro', palo: 'X', rareza: 'legendario', nombre: L('Cetro del Bufón', "Jester's Scepter"), desc: fillL(L('Tu primer golpe de cada combate pega ×{x}. Cada Golpe exacto lo vuelve a cargar.', 'Your first hit of each fight strikes ×{x}. Every exact hit recharges it.'), { x: a.cetro }) },
];

export const AMULETOS: readonly AmuletoId[] = lista.map((x) => x.id);
export const AMULETO = Object.fromEntries(lista.map((x) => [x.id, x])) as Record<AmuletoId, AmuletoDef>;
export const precioBase = (id: AmuletoId): number => B.pulperia.precio[AMULETO[id].rareza];
