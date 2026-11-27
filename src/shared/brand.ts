// La marca del juego: el único sitio donde se escribe el título. Cliente, scripts y documentos lo importan de aquí.
export type Idioma = 'es' | 'en';

export const SLUG = 'cabala';
/** El título es el mismo en los dos idiomas. */
export const TITULO = 'CÁBALA';
export const VERSION = '1.6.0';
export const URL_JUEGO = 'https://ifbotech.github.io/cabala/';
export const REPO = 'https://github.com/ifbotech/cabala';

export const MARCA: Record<Idioma, { titulo: string; subtitulo: string; lema: string }> = {
  es: { titulo: TITULO, subtitulo: 'Roguelike de baraja española', lema: 'Todo es cuestión de cábala.' },
  en: { titulo: TITULO, subtitulo: 'A Spanish-Deck Roguelike', lema: 'It all comes down to cábala.' },
};

/** 'es' si el idioma del navegador empieza por «es»; 'en' para cualquier otro. Sin idioma: 'es'. */
export function idiomaDe(lang?: string | null): Idioma {
  if (!lang || !lang.trim()) return 'es';
  return /^es\b/i.test(lang.trim()) ? 'es' : 'en';
}

/** Nombre de archivo para una descarga: `archivo('cronica', 'png')` → «cabala-cronica.png». */
export const archivo = (base: string, ext: string): string => `${SLUG}-${base}.${ext.replace(/^\./, '')}`;
