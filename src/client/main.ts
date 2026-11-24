// Arranque de CÁBALA en el navegador.
import '@fontsource/dotgothic16/latin-400.css';
import '@fontsource/dotgothic16/latin-ext-400.css';
import '@fontsource/silkscreen/400.css';
import '@fontsource/silkscreen/700.css';
import './estilos/base.css';
import './estilos/pantallas.css';
import './estilos/mesa.css';
import { MARCA } from '../shared/brand';
import { decidir, mejorGolpe } from '../rules/bot';
import { ajustes, alAzar, idioma, perfil, tx } from './almacen';
import { hablaron, prepararAudio, sonados } from './audio';
import { estadoMusica, pistasSonadas } from './musica';
import { iniciarEscena3d } from './escena3d';
import { iniciarFx, pulso } from './fx/motor';
import { irPortada, sesion } from './juego';
import { ponerMuletillas } from './bufon-vivo';
import { iniciarNav } from './nav';
import { precargarTodo } from './precarga';
import { forjarCss, porForjar } from './sprites';
import { iniciarUi } from './ui';
import { VOZ } from './voces';

document.documentElement.lang = idioma();
document.title = `${MARCA[idioma()].titulo} · ${MARCA[idioma()].subtitulo}`;
document.documentElement.classList.toggle('calma', ajustes.calma);
forjarCss();
iniciarUi();
iniciarEscena3d();
iniciarFx();
iniciarNav();
prepararAudio();
ponerMuletillas(() => tx(alAzar(VOZ.muletilla)));

// para la QA de humo: el estado vivo y el consejo del bot
(window as unknown as { __cabala?: unknown }).__cabala = { sesion, perfil: () => perfil, mejorGolpe, decidir, pulso, sonados, porForjar, hablaron, musica: estadoMusica, pistas: pistasSonadas };

const qa = new URLSearchParams(location.search).get('qa');
if (qa !== null) void import('./qa').then((m) => m.montarQa(qa));
else irPortada();
// la forja de fondo: en la QA visual (modo foto) no hace falta
if (qa === null || new URLSearchParams(location.search).has('vivo')) precargarTodo();
