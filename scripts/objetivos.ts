// Los objetivos de balance de CÁBALA, como datos: los leen el laboratorio (para avisar), las pruebas y el reglamento.
export const OBJETIVOS = {
  /** Victorias del bot en el Reinado 1, por Mazo, con el Altar vacío y con el Altar lleno (en %). */
  base: [28, 33] as const,
  lleno: [45, 49] as const,
  /** El Reinado 8 tiene que ser claramente más duro que el 1 (puntos de victoria de menos, Altar lleno). */
  reinado8Baja: 8,
  /** Golpes por combate: ni un trámite ni una maratón. */
  golpesGuardia: [2, 4.5] as const,
  golpesRey: [4, 9] as const,
  /** Duración estimada de una partida ganada (minutos), a 11 s por golpe y 20 s por pantalla del camino. */
  minutos: [14, 24] as const,
  /** Constitución: topes de contenido. */
  amuletos: 15,
  aumentos: [16, 18] as const,
  mazos: 5,
  mejorasAltar: [6, 8] as const,
  /** Toda descripción cabe en este largo (ES y EN). */
  largoDesc: 110,
  /** La regla estrella de cada Mazo, en palabras. */
  palabrasRegla: 12,
} as const;

/** Segundos por golpe y por pantalla del camino con los que se estima la duración. */
export const RITMO = { golpe: 11, pantalla: 20 } as const;
