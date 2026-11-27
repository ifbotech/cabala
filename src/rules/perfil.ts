// Perfil del jugador para CÁBALA 2.0: 5 Mazos abiertos desde el minuto 0, estadísticas limpias y Colección.
import type { MazoId } from './mazos';
import type { Partida } from './estado';

export interface Perfil {
  v: 2;
  stats: { partidas: number; victorias: number; reyes: number; pokers: number; exactos: number; cantos: number; abatidos: number; mejorGolpe: number };
  ganado: Record<MazoId, number>;
  vistos: string[];
  aprendido: boolean;
}

export function perfilNuevo(): Perfil {
  return {
    v: 2,
    stats: { partidas: 0, victorias: 0, reyes: 0, pokers: 0, exactos: 0, cantos: 0, abatidos: 0, mejorGolpe: 0 },
    ganado: { escoba: 0, truco: 0, chinchon: 0, mentiroso: 0, chancho: 0 },
    vistos: [],
    aprendido: false,
  };
}

export const mazoAbierto = (_perfil: Perfil, _id: MazoId): boolean => true;

export function anotar(perfil: Perfil, p: Partida): void {
  const victoria = !!p.fin?.victoria;
  const s = perfil.stats;
  s.partidas++;
  if (victoria) s.victorias++;
  s.reyes += p.stats.reyes;
  s.pokers += p.stats.pokers;
  s.exactos += p.stats.exactos;
  s.cantos += p.stats.cantos;
  s.abatidos += p.stats.abatidos;
  s.mejorGolpe = Math.max(s.mejorGolpe, p.stats.mejorGolpe);
  if (victoria) perfil.ganado[p.mazoId] = (perfil.ganado[p.mazoId] ?? 0) + 1;
}

export function ver(perfil: Perfil, clave: string): void {
  if (!perfil.vistos.includes(clave)) perfil.vistos.push(clave);
}
