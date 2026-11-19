// Arranque de CÁBALA en el navegador.
import '@fontsource/pixelify-sans/400.css';
import '@fontsource/pixelify-sans/500.css';
import '@fontsource/pixelify-sans/700.css';
import '@fontsource/silkscreen/400.css';
import '@fontsource/silkscreen/700.css';
import './estilos/base.css';
import './estilos/pantallas.css';
import './estilos/mesa.css';
import { MARCA } from '../shared/brand';
import { decidir, mejorGolpe } from '../rules/bot';
import { ajustes, idioma, perfil } from './almacen';
import { sonados } from './audio';
import { iniciarFx, pulso } from './fx/motor';
import { irPortada, sesion } from './juego';
import { iniciarNav } from './nav';
import { precargarTodo } from './precarga';
import { forjarCss, porForjar } from './sprites';
import { iniciarUi } from './ui';

document.documentElement.lang = idioma();
document.title = `${MARCA[idioma()].titulo} · ${MARCA[idioma()].subtitulo}`;
document.documentElement.classList.toggle('calma', ajustes.calma);
forjarCss();
iniciarUi();
iniciarFx();
iniciarNav();

// para la QA de humo: el estado vivo y el consejo del bot
(window as unknown as { __cabala?: unknown }).__cabala = { sesion, perfil: () => perfil, mejorGolpe, decidir, pulso, sonados, porForjar };

const qa = new URLSearchParams(location.search).get('qa');
if (qa !== null) void import('./qa').then((m) => m.montarQa(qa));
else irPortada();
// la forja de fondo: en la QA visual (modo foto) no hace falta
if (qa === null || new URLSearchParams(location.search).has('vivo')) precargarTodo();
