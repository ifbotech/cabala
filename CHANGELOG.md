# Registro de cambios

Todas las versiones publicadas de CÁBALA. Las cifras de balance son del laboratorio (`npm run analyze:meta`, bot propio);
las del panel de jugadores son **simuladas** y se dicen con su ruido.

## 1.6.0 · Pulido Píxel a Píxel: Mutación sobre Temple, HUD 360px y Pulpería 768p (2026-11-27)

- **Naipes templados + mutados (`mesa.css`):** Eleva `.c-mutacion` a `24px` cuando hay `.c-temple` para que el sello de mutación no quede tapado por `+16 ★ ×2`.
- **HUD estrecho `360px` (`mesa.css`):** Mayor separación horizontal entre Escudo y Oro en pantallas angostas (`<= 380px`).
- **Pulpería `768p` (`pantallas.css`):** Compacta las bandejas y tarjetas con caja de Evolución en altura `<= 820px` para despejar Servicios y Chiches.

## 1.5.0 · Pulido Píxel a Píxel: Elegir Mazo 1080p, Bufón Móvil, Piezas y Sellos (2026-11-27)

- **Elegir Mazo `1920×1080` (`pantallas.css`):** Amplía `.mazo-detalle` a `152px` con relleno vertical para que el título del Mazo no roce el borde superior.
- **Encuadre del Bufón 3D en móvil (`bufon3d.ts`):** Ajusta escala y desplazamiento vertical en `.fin-bufon` y `.elegir` móvil para despejar el título `LA CORTE CAYÓ`, el retrato partido y el borde superior.
- **Mesa `1920×1080` y `Lo que llevás` (`mesa.css`, `pantallas.css`):** Mayor aire inferior bajo `.mesa .e-sellos` (`10px`) y degradado/aire inferior en `.panel.piezas.hay-mas .rollo` sobre `HAY MÁS ↓`.

## 1.4.0 · Pulido Píxel a Píxel: Crónica, Prenda y QA Visual EN (2026-11-27)

- **Crónica móvil y escritorio (`pantallas.css`):** Grilla de dos filas en `.cr-fila` móvil para leer mazo, Reinado, tramo, mejor golpe y semilla sin truncamiento ni `...`; aire vertical sobre el Bufón debajo de la placa de trofeo en escritorio.
- **Prenda y Chiche en vuelo (`mesa.ts`):** El sello `¡PRENDA!` / `SPOILS!` prioriza posicionarse centrado debajo de la barra de Vida sin pisar `TE PEGA`, y el Chiche en vuelo (`enFoto`) se ubica en el tramo medio sobre la madera sin tapar `CHICHES` ni el HUD.
- **QA visual EN (`scripts/visual-qa.ts`):** Acepta el alias `--en` además de `--lang=en` para generar y auditar `artifacts/visual-qa-en/`.
- **Rendimiento 1080p (`cartas3d.ts`, `motor.ts`):** Precalentamiento de astillas y `depthWrite: false` en `partirEnemigo()` para evitar compilación de shaders en el primer golpe, y omisión de fondos 2D ocultos cuando WebGL 3D está activo.

## 1.3.0 · Pulido Píxel a Píxel: Resumen Móvil, Regla 1080p, La Corte y Mapa (2026-11-27)

- **Resumen de derrota móvil (`bufon3d.ts`, `pantallas.css`):** Oculta el Bufón 3D cuando `.fin-escena.corrida` se desplaza en móvil para no quedar detrás del título.
- **Mesa 1080p y mando (`mesa.css`):** `.pano-regla.costado` mantiene el ícono junto al texto sin salto huérfano; en `1920×1080` con mando, `SEL JUGADAS` deja aire limpio a la derecha de `LA CORTE`.
- **Comodín y regla en móvil (`mesa.css`):** Oculta el punto separador sobrante en `.pano-regla.con-comodin` y ajusta el rótulo vertical `COMODÍN` en `390×664`.
- **Mapa móvil (`pantallas.css`):** Compacta `.mapa-lienzo` (`1.38`) para que el Rey Jefe superior no quede recortado al borde en `390×844`.

## 1.2.0 · Precisión Móvil y Pulido Píxel a Píxel (2026-11-27)

- **Colección y Mapa móvil (`pantallas.css`):** `.col-pared` arranca desde arriba (`flex-start`) en móvil para no recortar retratos ni títulos; escudo de inmunidad del Rey Jefe despejando su corona en `390×844`.
- **Modales y Pulpería (`pantallas.css`):** Aire inferior en `JUGADAS` móvil sobre `HAY MÁS ↓`, margen inferior para el glifo `A` en mutaciones de `Forja Brava` y caja de Evolución compacta en `Pulpería` escritorio.

## 1.1.0 · Pulido Píxel a Píxel (2026-11-27)

- **Visor de Mazo y Cábala Negra (`pantallas.css`, `base.css`):** Filas de 9 cartas por palo sin huérfanas en escritorio; cartel `HAY MÁS ↓` centrado sobre la bandeja en `Cábala Negra`.
- **Combate y Mapa (`mesa.css`, `camino.ts`, `pantallas.css`):** Chip `RACHA ×N` compacto en una línea sin pisar el escudo `INMUNE`; rótulo `COMODÍN` vertical debajo de la estrella `★`; separador `·` en cabecera de Tesoro; escudo de inmunidad del Rey Jefe despejando su corona en Mapa móvil.
- **Camino al Sol de Mayo 3D (`solDeMayo3d.ts`):** El arco final reemplaza las cartas `12` por retratos exclusivos de los Reyes enmarcados en latón.

## 1.0.0 · Lanzamiento Oficial — La Pulpería y El Sol de Mayo (2026-11-27)

Lanzamiento definitivo **`v1.0.0`** tras 5 iteraciones completas de auditoría multiárea (Reglas/Balance, UX/Simplicidad, Game Feel AAA/3D, Progresión/PWA/QA y Certificación Final):

- **Reglas y Balance (`v0.60.0`):** `valorCarta()` centralizado, Comodín inteligente (`escalera`, `escalerapalo`, Escoba `15`, `poker`/`pierna`/`full`), `alPelo` ampliado, Pactos Duales potenciados y Duelo del Bufón con agencia real (`0` avisos en `analyze:meta`).
- **UX, i18n y Ergonomía (`v0.70.0`):** `chips.ts` unificado ES/EN sin recortes, foco modal `inert`, Ajustes rápidos en partida y limpieza de listeners.
- **Game Feel AAA y Rendimiento (`v0.80.0`):** Conteo `DAÑO × MULTI` sincronizado al pulso musical, *hitstop* 2D/3D unido, `texturaNaipeMitad` sin bloqueo y precompilación WebGL (`159–164.8 FPS`, `peor cuadro <= 49 ms`).
- **Progresión, Respaldo, PWA y QA 1.0 (`v0.90.0`):** `sanearPerfil()`, Exportar/Importar JSON, `vendor-three` split, 6 Cartas de Gloria reales, sellos de Reinado (`★ n/8`), Semilla del día, Crónica de 20 partidas con `Repetir`, `624/624` capturas `qa:visual` ES/EN sin fallos y `0` hallazgos en `qa:estabilidad`.

## 0.90.0 · Progresión, Respaldo, PWA y QA 1.0 (2026-11-26)

Cuarta gran iteración hacia **`v1.0.0`**. *(Reglas, balance certificado, `musica.ts` y `voces.ts` intactos.)*

- **Blindaje de guardado y respaldo (`almacen.ts`, `menu.ts`, `textos.ts`):** `sanearPerfil()` normaliza datos corruptos y respalda lecturas fallidas en `cabala:*:backup`; `cargarPartida()` valida esquema completo; `borrarTodo()` limpia `cabala:intros`; Ajustes suma `Exportar` / `Importar` progreso en JSON.
- **Bundle split, resize y PWA (`vite.config.ts`, `main.ts`, `escena3d/index.ts`, `index.html`, `manifest.webmanifest`, `camino.ts`):** Chunk separado `vendor-three`, carga diferida de `bot.ts` para QA, `visualViewport` + `esMovil()` dinámico, splash pixel y `<noscript>` en `index.html`, `id` + `maskable` en el manifest y limpieza de `ResizeObserver` al salir de `pantallaFin`.
- **Pared de la Gloria y Metaprogresión (`cuarto3d.ts`, `menu.ts`, `camino.ts`):** 6 Cartas de Gloria reales sin spoilers; sellos de Reinado (`★ n/8`) y maestría total (`X/40`); Semilla personalizada y Semilla del día (`CABALA-YYYYMMDD`); contadores en Colección; Crónica con hasta 20 partidas desplazables y botón `Repetir`; botón `Copiar resumen` en pantalla final.
- **Cobertura QA 1.0 (`qa.ts`, `visual-qa.ts`, `puertas.mjs`):** Sumados `cuarto`, `sol-de-mayo`, `duelo-bufon` e `intro-mazo` a `ESTADOS`, toque verificado con `elementFromPoint` en `elige-cinco` y `qa:estabilidad` integrado en `puertas.mjs`.

## 0.80.0 · Game Feel AAA, Coreografía 3D y Pulso Exacto (2026-11-26)

Tercera gran iteración del plan hacia **`v1.0.0`**. *(Reglas, balance certificado, `musica.ts` y `voces.ts` intactos.)*

- **Sincronía 2D/3D y fin de desfasajes (`mesa.ts`, `mesa.css`, `escena3d/index.ts`, `fx/motor.ts`):** El conteo `DAÑO × MULTI` dispara cada nota musical en el instante exacto del salto visual; el embiste enemigo aplica anticipación y golpe en ápice (`180 ms`); `congelar(ms)` congela también la animación 3D durante el *hitstop* y `descongelar()` limpia todo al usar TURBO.
- **Reyes 3D vivos (`reyes3d.ts`, `mesa.ts`):** Eliminado el bug del Rey 3D «zombi» tras morir; `segundaCara()` dispara onda expansiva 3D (`transformarSegunda3d`) y sacudida de cámara; cableadas las poses 3D reales de `elegir-mazo`, `fin-victoria` y `fin-derrota`.
- **Picos de dopamina (`evolucion.ts`, `mesa.ts`, `audio.ts`):** Los 5 Mazos tienen fogonazo y chispas propias en `canto`; `exacto` suma `sonar('exacto')`, agachado musical y sacudida 3D; `quiebreEscudo` al romper Escudos; tono al ganar Escudo; `jackpotEvolucion` extendido a `3,4 s` con `sonar('evolucion')`, `agacharMusica` y `fogonazo3d`; `Bufon3D` gesticula `.habla`, `.festeja` y `.lamenta` en combate.
- **Tacto 3D y mundos vivos (`cartas3d.ts`, `escenarios3d.ts`, `solDeMayo3d.ts`, `heroes3d.ts`):** Inclinación local por carta en `hover`, `slam` en cada cambio de Posta (`dial`/`Q`/`W`), salto 3D en `.cuenta-pop`, Fogón 3D reactivo al riesgo de quemado, pulso suavizado en Sol de Mayo y `dt`-normalizado en `Heroes3D`.
- **Duelo, Intro y Camino al Sol (`dueloBufon.ts`, `introMazo.ts`, `menu.ts`):** Fase `'revelando'` en `dueloBufon.ts` para ver las cartas del Bufón antes de cobrar la Bendición; notas musicales y FOV creciente (`50 → 54.5`) en `pantallaCaminoSol`; `sonar('carta')` y `stinger` en `introMazo`.

## 0.70.0 · UX, Simpleza Radical, Claridad 0,2 s e i18n Completa (2026-11-26)

Segunda gran iteración del plan hacia **`v1.0.0`**. *(Reglas, balance certificado, `musica.ts` y `voces.ts` intactos.)*

- **Lectura en 0,2 s sin truncamiento (`chips.ts`, `pantallas.css`):** Eliminado `RECORTAR(44)` y el uso de códigos internos (`/S`, `/C`, `/D`, `/H`); cada Amuleto, Cábala y Bendición muestra su regla completa legible también en pantalla táctil, con etiquetas ES/EN unificadas y paleta semántica corregida (`Daño` rojo, `Multi`/`Escudo` azul, `Vida` verde).
- **Traducción y ergonomía de `La Mano contra el Bufón` (`dueloBufon.ts`, `textos.ts`, `nav.ts`):** Localizados al 100 % los 25+ textos y recompensas en ES/EN, cartas de referencia sin falsos botones en El Mentiroso, pistas de Truco, foco completo (`data-foco`/`data-inicio`), salida segura en dos toques y `aria-label` localizados en `explorar`.
- **Menú en partida y limpieza visual (`camino.ts`, `base.css`, `mesa.css`, `pantallas.css`, `ui.ts`, `introMazo.ts`, `mesa.ts`):** Ajustes rápidos en vivo (Sonido, Música, Idioma, Calma) y **Reiniciar partida** dentro de `modalMenu`; `HAY MÁS ↓` despejado sobre los botones en Cábala Negra; eliminada la regla duplicada en `? JUGADAS`; trampa de foco `inert` en modales; limpieza de listeners en `mesa.ts`, `explorar` y `sol-de-mayo`; nombre del Rey visible en Mapa móvil; rótulo `COMODÍN` y `.pano-regla` sin solapes.

## 0.60.0 · Cirugía de Reglas, Balance Certificado y Duelo con Agencia (2026-11-26)

Primera gran iteración del plan hacia **`v1.0.0`** tras la auditoría del Panel de 5 Directores. *(Música adaptativa `musica.ts` y voces `voces.ts` intactas.)*

- **Comodín inteligente y `4+1` póker (`cartas.ts`, `combate.ts`):** El Comodín ahora completa la mejor jugada posible (escalera, escalera de palo, `15` en Escoba, póker/pierna/full) evitando el palo Inmune; el póker con una carta suelta (`4+1`) pasa a ser jugada válida.
- **Protección de Bravas y mejoras (`estado.ts`, `combate.ts`, `bufon.ts`):** Nuevo `valorCarta()` para que `Seña Falsa`, `Polvo de Tiza`, `Naipes al fuego` y `El naipe pintado` no destruyan las Bravas del Truco ni naipes forjados en el Fogón.
- **Coherencia de reglas (`combate.ts`, `bufon.ts`, `mazos.ts`, `balance-config.json`):** `Vale Cuatro` usa `postasDe(p)`; `Cara de Piedra` calibrado a `18` (sin recorte silencioso en Tramo 1); `Mano larga` respeta el tope de cada Mazo (`hasta`); rangos `1–8` / `1–6` explicitados en Chinchón y El Mentiroso.
- **Evoluciones, Precisión, Pactos Duales y Economía (`balance-config.json`, `combate.ts`, `reyes.ts`, `partida.ts`):** `Sol de la Timba` (`descarte: 3`, `tope: 5`) y `Brindis de Sangre` (`cada: 8`); ventana `al pelo` ampliada a `multiFinal - 1` (sostiene racha, `+1` Multi y dispara `Hoja y broquel`); Pactos Duales potenciados (`Hoja y broquel`, `Filo dorado`, `Sangría`, `Peaje`, `Rescoldo`); Chiches a `7` de oro con descuento del Altar y Tesoros cerrados a `18` de oro; descuento del Altar efectivo desde nivel 1 (`Math.floor` con `2.5 %/nivel`).
- **Reinados 6–8 con identidad (`reinados.ts`, `partida.ts`, `combate.ts`):** R6 pasa a `-15 %` de Vida máxima proporcional; R7 suma `+2` de Furia al rebarajar el Mazo; R8 suma `+3` de Furia inicial a los Reyes y adelanta su Segunda Cara al `60 %` de Vida.
- **La Mano contra el Bufón (`dueloBufon.ts`):** Agencia real en los 5 minijuegos (carta visible del Bufón en Truco, puntaje de Escoba, reparto real de 7s sin delación de gesto en Mentiroso, corte real de Chinchón y mano aleatoria en Chancho) y recompensas calibradas sin cura gratuita al perder.
- **Certificación del laboratorio (`analyze:meta`, 3000 partidas/celda):** **0 avisos** (`escoba 32.3/48.9 %`, `truco 32.0/48.1 %`, `chinchon 31.4/46.1 %`, `mentiroso 31.8/48.2 %`, `chancho 32.0/45.5 %`; paridad en R8 `22.2–27.7 %`).

## 0.58.0 · Pulso 3-3-2, bocina del Fonógrafo y cierre de revisión 3D (2026-11-25)

Quinta y última iteración de la serie de 5 versiones: sincronización rítmica de todo el elenco 3D con la milonga `3-3-2`, ajuste de orientación en el Fonógrafo y animación viva de velas en Altar y Crónica. *(Reglas, música, voces y balance 100 % congelados.)*

- **Pulso `3-3-2` en personajes 3D (`bufon3d.ts`, `reyes3d.ts`, `heroes3d.ts`):** Lectura en vivo de `armoniaActual()` para acentuar respiración, cadencia y luz cálida en los pasos `0, 6, 12`, junto con refinamiento de encuadre y escala de Reyes (`0.76`).
- **La Pulpería viva (`cuarto3d.ts`):** Orientación de la bocina acampanada del Fonógrafo hacia el jugador (`-Math.PI * 0.62`) y parpadeo orgánico de las llamas y halos del candelabro de Crónica y las velas del Altar.

## 0.57.0 · Artesanía 3D de La Pulpería — Altar, Crónica y Fonógrafo (2026-11-25)

Cuarta iteración de la serie de 5 versiones: reconstrucción artesanal de los rincones 3D del cuarto caminable con nuevas texturas pixeladas y luminarias cálidas. *(Reglas, música, voces y balance 100 % congelados.)*

- **Texturas nuevas (`texturas.ts`):** `texturaPaginaCronica()` (hojas caligrafiadas con marcas de conteo), `texturaVinilo()` (surcos concéntricos + etiqueta carmesí/oro) y `texturaMantelAltar()` (terciopelo vino oscuro con guarda de oro antiguo).
- **Muebles 3D (`cuarto3d.ts`):** Altar con zócalo de piedra, pilares, mantel colgante, cáliz de latón con Porotos y 7 platillos de velas; Crónica con escritorio torneado, atril, libro abierto, tintero/pluma voxel y candelabro; Fonógrafo con mueble moldeado, manivela, brazo fonocaptor, vinilo giratorio y bocina acampanada de latón.

## 0.56.0 · Los 4 Reyes Malvados Dark-Gothic 2× + Jerarquía Imponente (2026-11-25)

Tercera iteración de la serie de 5 versiones: reconstrucción completa de los 4 Reyes Malvados al doble de resolución (`V = 0.017`) con proporciones regias oscuras, armas detalladas y calibración de escala en combate. *(Reglas, música, voces y balance 100 % congelados.)*

- **4 Reyes Malvados Dark-Gothic (`reyes3d.ts`):** El Caudillo (corona de 5 hojas de acero + doble espada + cicatriz), El Cacique (corona de ramas orgánicas `curve3D` + barba rojiza monumental + doble garrote), El Caudal (corona solar gótica + escudo-moneda tallado con relieve) y El Bacanal (melena y barba blanca larga + cáliz gótico esculpido), con sombras violáceas y cero bloques *Minecraft*.
- **Jerarquía visual en combate (`bufon3d.ts`, `reyes3d.ts`):** el Rey Jefe domina el centro de la mesa con corona 100 % visible en `1920×1080`, `1280×800` y `390×844`.

## 0.55.0 · Rediseño Dark-Gothic 2× de Alta Densidad — Bufón y 5 Héroes (2026-11-25)

Segunda iteración de la serie de 5 versiones: reconstrucción completa del Bufón y los 5 Héroes de Mazo al doble de resolución (`V = 0.018`), con proporciones estilizadas, paleta *Dark Tarot* y cero bloques *Minecraft*. *(Reglas, música, voces y balance 100 % congelados.)*

- **Bufón Dark-Gothic (`bufon3d.ts`):** máscara veneciana de marfil envejecido esculpida (`sculptHead`), cuencas talladas con ojos ámbar y pupilas verticales, lágrima de rombo, 3 cuernos orgánicos curvos (`curve3D`) en carmesí/púrpura abismal con cascabeles de oro antiguo, gola dentada, cetro *Marotte* gótico y abanico de naipes hueso.
- **5 Héroes de Mazo 2× (`heroes3d.ts`):** La Barrendera, El Paisano Bravo, La Estratega, El Enmascarado y El Guardián esculpidos en alta densidad con ponchos/capas drapeadas, armas y escudos detallados.
- **Intro por Mazo (`pantallas.css`):** tarjeta compacta ajustada para mantener siempre 1 fila prolija de cartas en `1920×1080`, `1280×800` y móvil.

## 0.54.0 · Motor Dark-Dithered Pixel-3D + Intro 3D Abierta (2026-11-25)

Primera iteración de la serie de 5 versiones de revisión visual profunda: evolución del motor 3D hacia *Dark Dithered Pixel Art* y apertura total del escenario 3D en la intro de cada Mazo. *(Reglas, música, voces y balance 100 % congelados.)*

- **Motor Dark-Dithered Pixel-3D (`voxel.ts`):** sombras violáceas (`#120a24`), Ambient Occlusion horneado dramático (`[0.38, 0.62, 0.82, 1.0]`), tramado Bayer 4×4 3D y nuevas primitivas orgánicas (`sculptHead`, `taperedCylinder`, `curve3D`, `ditherBox`).
- **Intro 3D abierta (`introMazo.ts`, `pantallas.css`, `heroes3d.ts`):** eliminada la caja opaca que tapaba al Héroe; ahora el Héroe 3D se luce libre en `1920×1080`, `1280×800` y `390×844` junto a la tarjeta compacta.

## 0.53.0 · Personajes Voxel Art 3D (4 Reyes, Bufón y 5 Héroes) y Reyes sin Naipe 12 (2026-11-25)

Salto visual completo del elenco 3D a **Voxel Art artesanal con Ambient Occlusion horneado por vértice** (`voxel.ts`), eliminación total de las cartas `12` con palos repetidos de los 4 Reyes en todo el juego y corrección de recorte izquierdo en mesa. *(Reglas, música, voces y balance 100 % certificados e intactos.)*

- **Motor Voxel 3D (`voxel.ts`):** culling de caras internas, AO horneado por vértice con flip de diagonal, micro-textura determinista y materiales `matte` / `metal` / `emissive`.
- **4 Reyes Malvados Voxel 3D (`reyes3d.ts`):** El Caudillo (corona de aceros + doble espada + cicatriz), El Cacique (ramas esmeralda + garrotes nudosos + barba tupida), El Caudal (corona solar + escudo-moneda gigante) y El Bacanal (corona real + cáliz carmesí + melena/barba blanca), con animaciones de golpe, ataque, segunda cara y VFX 3D en voxels.
- **Bufón Voxel 3D (`bufon3d.ts`) y 5 Héroes de Mazo (`heroes3d.ts`):** Bufón celeste/marfil/oro con gorro de 3 puntas, ojos móviles con parpadeo, cetro Marotte y abanico de naipes; más los 5 Héroes Voxel 3D en `intro-mazo`.
- **Reyes solos sin carta `12` (`cartas3d.ts`, `cuarto3d.ts`, `texturas.ts`, `mesa.ts`, `camino.ts`, `mesa.css`, `pantallas.css`):** eliminadas las cartas `12` detrás de los Reyes en combate, La Corte, Pared de la Gloria 3D (ahora 4 retratos reales enmarcados en latón) y pantalla Final.
- **Fix UI (`mano.ts`, `mesa.css`):** corregido el alineado y ancho máximo de `.pano-regla.costado` para evitar cualquier recorte en el borde izquierdo.

## 0.52.0 · Intro 3D del Personaje por Mazo, Tarjetas Icónicas 0,2 s y Descarte Táctico (2026-11-25)

Cierre del mandato autónomo: Intro animada en 3 golpes para cada Personaje de Mazo, tarjetas de Amuletos/Cábalas/Bendiciones legibles en 0,2 s con bloque de beneficio icónico, cabecera de reglas propias en `? JUGADAS` y descarte táctico multi-carta pulido. *(Reglas, música, voces y balance 100 % certificados e intactos.)*

- **Intro 3D por Mazo (`introMazo.ts`, `juego.ts`, `menu.ts`, `qa.ts`):** se dispara al estrenar cada Mazo (y desde el botón `VER INTRO`) enseñando su juego argentino en 3 golpes visuales sobre la mesa 3D.
- **Tarjetas icónicas 0,2 s (`chips.ts`, `camino.ts`, `pantallas.css`):** sabor corto arriba + bloque inferior puro con íconos y cifras (`⚔ +N`, `×N MULTI`, `🛡 +N`, `♥ +N`, `● +N`) sin muros de texto.
- **Reglas por Mazo y descarte táctico (`camino.ts`, `mesa.ts`):** cabecera `REGLAS DE TU MAZO` en `? JUGADAS` y contador táctico dinámico en el botón `DESCARTAR`.

## 0.51.0 · La Mano contra el Bufón + La Bendición del Bufón (2026-11-25)

Duelo 3D en la mesa contra el Bufón antes de cada Rey Jefe (Tramos 1, 2 y 3), jugando 1 mano auténtica del juego del Mazo actual para ganar **La Bendición del Bufón**. *(Reglas, música, voces y balance 100 % congelados.)*

- **Duelo 3D por Mazo (`dueloBufon.ts`, `juego.ts`, `camino.ts`, `qa.ts`, `pantallas.css`):** Truco (jerarquía real + Envido), Escoba del 15 (carta en mano + mesa sumando 15), Chinchón (piernas/escaleras y corte), El Mentiroso (destapar o creer) y Chancho Va (cambios rápidos + pares/piernas).
- **La Bendición del Bufón:** al ganar, elegís entre `Mano Bendita`, `Bolso del Chanta` o `Cábala Mayor` con fichas icónicas de lectura instantánea.

## 0.50.0 · Los 4 Reyes Malvados en 3D saliendo de la Carta + Poderes VFX (2026-11-25)

Irrupción física 3D de los 4 Reyes Jefe desde su naipe `12` durante el combate, con arma y corona propias y coreografía VFX 3D en cada poder o embestida. *(Reglas, música, voces y balance 100 % congelados.)*

- **Reyes Malvados 3D (`reyes3d.ts`, `escena3d/index.ts`, `mesa.ts`):** El Caudillo (sable cian), El Cacique (garrote esmeralda), El Caudal (cetro de oro) y El Bacanal (cáliz carmesí) emergen del naipe `12` con manto tramado en Bayer, luz propia y transformación de Segunda Cara.
- **VFX 3D por palo (`poderRey3d`):** tajos de energía cian (`S`), estacas esmeralda brotando del paño (`C`), lluvia de monedas malditas (`D`) y anillo/orbes de bruma carmesí (`H`), con sacudida de cámara y fogonazo del candil.

## 0.49.0 · Bufón 3D Vivo, Mirada Calibrada, Mapa Limpio y Tablón de Colección (2026-11-25)

Primera gran entrega del nuevo mandato: eliminación del calabozo 2D (`palacio.ts`), Bufón 3D de cuerpo completo articulado en todo el juego (cero sprite 2D viejo), mirada diagonal calibrada al centro de la mesa, Mapa sin flechas guía, Reyes Malvados en los naipes `12` y placas de Amuletos/Cábalas en La Pared de la Gloria. *(Reglas, música, voces y balance 100 % congelados.)*

- **Cuerpo vivo y mirada del Bufón 3D (`bufon3d.ts`, `mesa.css`):** jubón arlequín bicolor, faja con hebilla dorada, capa oscura, brazos y manos articulados con cetro y gestos vivos; vector de mirada relativo al NDC del Bufón; ocultamiento universal de `.bufon .px` en `html.modo-3d` (escritorio y móvil).
- **Reyes Malvados en naipe y Tablón 3D (`naipes.ts`, `texturas.ts`, `cuarto3d.ts`):** los naipes `12` y su segunda cara lucen el retrato del Rey Malvado; La Pared de la Gloria suma 8 placas de Amuletos y Cábalas clavadas con tachuelas de latón.
- **Mapa limpio y limpieza (`pantallas.css`, `camino.ts`, `qa.ts`):** eliminadas las flechas guía `.nodo-aca::after` y removido `palacio.ts`.

## 0.48.0 · El Palacio del Rey (2026-11-25)

Nuevo calabozo cenital HD-2D estilo *Pokémon* antes de cada Rey Jefe (Tramos 1, 2 y 3): explorá el palacio del palo correspondiente, abrí 3 cofres con mejoras reales, resolvé 1 de 3 acertijos aleatorios y cruzá la Puerta del Trono. *(Reglas, música, voces y balance 100 % congelados e intactos.)*

- **Calabozo cenital HD-2D (`palacio.ts`, `juego.ts`, `camino.ts`, `qa.ts`, `pantallas.css`):** mapa `15×11` con 4 paletas por palo (`Fortín de Acero`, `Empalizada del Monte`, `Bóveda del Caudal`, `Salón del Banquete`), muros 2.5D, estandartes, antorchas con halos de luz cálida, caminata por `WASD`/flechas, clic con pathfinding BFS y D-pad móvil.
- **3 cofres reales + 3 acertijos:** `+22 Oro y +15 Vida`, `+6 Temple` al naipe más alto, `+8 Vida Máx, +2 Carga y Chiche`; acertijos de suma 15, 4 braseros y orden de palos.

## 0.47.0 · Navegación Discreta Estilo Inscryption, Bufón Esculpido y Fix de Mesa (2026-11-25)

Rediseño de la exploración 3D y del Bufón tras UAT humano: navegación discreta por vistas sin arrastre de cámara, rostro esculpido del Bufón en 3D y corrección del bug que devolvía al menú al hacer clic en la mesa. *(Reglas, música, voces y balance 100 % congelados e intactos.)*

- **Fix crítico de clic en mesa (`menu.ts`, `juego.ts`):** limpieza explícita `alSalir()` de listeners en `window` y guardas `pantallaActual()?.nombre` para que ningún evento de exploración se filtre al combate.
- **Navegación discreta estilo *Inscryption* (`menu.ts`, `camara.ts`, `index.ts`, `pantallas.css`):** grafo de 8 vistas en La Pulpería y 4 tramos en El Camino al Sol de Mayo con flechas cardinales (`▲`, `▼`, `◀`, `▶`) y `WASD`/flechas, sin rotación libre con mouse.
- **Bufón 3D esculpido (`bufon3d.ts`, `texturas.ts`):** máscara de porcelana con volumen real, sonrisa carmesí ladina, ojos ámbar luminosos, lágrima carmesí, 3 colas curvas (`TubeGeometry`) con cascabeles dorados, hombreras arlequín y antifaces venecianos para los 4 Reyes.
- **Móvil `390×844` (`pantallas.css`):** cabecera apilada sin solapes y separación limpia de los controles cardinales.

## 0.46.0 · Pulido Artesanal Total y Doble Auditoría Limpia (2026-11-25)

Cierre del Pilar D: física táctil 3D en los naipes, bisagras reales con portal celeste-dorado en La Puerta Doble, aire vertical en escritorio bajo (`1920×920`) y aprobación en doble Auditoría Adversarial consecutiva (#4b y #5) con `0` defectos en todas las pantallas y resoluciones. *(Reglas, música, voces y balance 100 % congelados e intactos.)*

- **Física táctil 3D (`cartas3d.ts`):** inclinación física según velocidad de arrastre, rebote elástico al encajar en una Posta, sombra desplazada al levitar y monedas octogonales tramadas en Bayer (`texturaOroMoneda`).
- **La Puerta Doble y escritorio `1920×920` (`cuarto3d.ts`, `mesa.css`):** vano abierto con 3 vigas de marco, portal celeste-dorado y pivotes en bisagras reales; aire vertical limpio en `1920×920`.

## 0.45.0 · El Camino al Sol de Mayo y Cartas de Gloria (2026-11-25)

Tercera entrega de la transformación 3D (Pilar C): el clímax del Tramo 3 y la Puerta Doble tras la primera victoria abren la avenida nocturna de **El Camino al Sol de Mayo**, y cada triunfo forja una **Carta de Gloria** clavada en La Pared de la Gloria. *(Reglas, música, voces y balance 100 % congelados e intactos.)*

- **El Camino al Sol de Mayo (`solDeMayo3d.ts`, `texturas.ts`, `camara.ts`, `menu.ts`, `camino.ts`):** empedrado porteño nocturno en trama Bayer (`texturaEmpedrado`), faroles cálidos, festones laterales celestes y blancos, 3 arcos monumentales de naipes españoles, Mesa de la Gloria con `1 de Oros` levitando y Sol de Mayo monumental (`texturaSolDeMayo`) latiendo al compás `3-3-2`.
- **Cartas de Gloria (`almacen.ts`, `cuarto3d.ts`, `camino.ts`):** al ganar una partida, la carta más icónica del mazo se guarda en `cabala:glorias`, se celebra en Victoria y queda clavada con tachuela de latón dentro de **La Pared de la Gloria**.

## 0.44.0 · La Pulpería 3D Explorable (2026-11-25)

Segunda entrega de la transformación 3D (Pilar B): la Portada incorpora el botón `LEVANTARSE` para recorrer en primera persona el cuarto completo de **La Pulpería 3D** con 7 rincones interactivos. *(Música, voces y balance sin cambios.)*

- **Exploración en primera persona (`cuarto3d.ts`, `camara.ts`, `menu.ts`, `index.ts`):** caminata con `WASD`/flechas/stick izquierdo (*head-bob* y pasos sobre madera), mirada 360° con arrastre o stick derecho, raycast con `[E]`/clic y barra rápida de 7 botones en una sola fila en escritorio.
- **7 rincones físicos 3D:** Mesa del Bufón con 2 sillas y 5 Dorsos en abanico, Rincón del Altar con 7 velas dinámicas ligadas a `perfil.altar`, Pared de la Gloria enmarcada en latón (5 Dorsos + 4 Reyes), Fogón de piedra con chispas, Libro de Crónicas, Fonógrafo giratorio sincronizado al pulso `3-3-2` y La Puerta Doble trancada con resplandor celeste y dorado del Sol de Mayo.

## 0.43.0 · Cirugía Visual Total: Bufón Dark Dithered, Cero Parches 2D y Escritorio Sin Brechas (2026-11-24)

Primera gran cirugía visual del Pilar A: el Bufón 3D adopta claroscuro partido *Dark Dithered* estilo *Leshy*/*COMODÍN*, desaparecen los parches 2D flotantes en todas las resoluciones, se cierra la brecha de media queries `1700px+` y se eliminan los solapes sobre `LA CORTE` y el borde izquierdo. *(Música, voces y balance sin cambios.)*

**Bufón 3D Estilo *Leshy* y Materiales Bayer (`src/client/escena3d/bufon3d.ts`, `texturas.ts`, `pulperia.ts`, `escenarios3d.ts`)**
- **Máscara tallada de tarot oscuro:** contorno angular cincelado de madera/marfil mate (`roughness: 0.86`), claroscuro partido en trama Bayer, cuencas abismales, cejas en V, costuras de títere, sonrisa ladina, ojos luminosos inclinados con pupilas verticales y cintas asimétricas de arlequín.
- **Utilería 3D cohesiva:** nuevas texturas tramadas en Bayer (`texturaCera`, `texturaLaton`, `texturaOroMoneda`), llama de vela en 3 capas translúcidas, monedas octogonales y mazo/monedas 3D apartados del corredor de texto izquierdo.

**Cero Parches 2D, Escritorio Sin Brechas y `LA CORTE` Limpia (`mesa.css`, `base.css`, `desglose.ts`, `mano.ts`, `ui.ts`)**
- **Cero parches 2D:** `.e-pano` y `.pul-bufon::after` ocultos en `html.modo-3d`.
- **Cobertura completa `1700px+`:** eliminada la cota `max-height: 1250px` y cubierto `(min-width: 1700px) and (max-height: 949px)` para ventanas reales de navegador (`1920×920`, `2560×1320`).
- **Solapes y bordes:** `margin-left: -32px` en `.mesa .corte`, padding en `.mesa-top .btn`, protección de `.mesa .corte`, `.mesa .esc-tit` y `.mesa .pano-regla` en `TAPA_NUNCA`, margen izquierdo `≥ 18 px` y respaldo oscuro legible en `.pano-regla.costado`.

## 0.42.0 · Pulpería Viva: Mapa 3D sobre Cuero, Fogón 3D con Brasas, Mostrador 3D y Estallidos de Palo (2026-11-24)

Tercera entrega de la transformación 3D: cada pantalla secundaria de la travesía cobra cuerpo físico sobre la mesa nocturna (Mapa de cuero curtido, Fogón vivo de piedras y brasas, Mostrador de la Pulpería y marco de Mazos) y los golpes en combate desatan estallidos 3D del palo con retroceso físico del tótem enemigo. *(Música, voces y balance sin cambios.)*

**Mapa 3D sobre Cuero y Bufón Anfitrión (`src/client/escena3d/escenarios3d.ts`, `texturas.ts`, `bufon3d.ts`, `mesa.css`)**
- **Mesa de ruta sobre cuero:** tablero de cuero curtido tramado en Bayer (`texturaCuero`) con bordes enrollados, punteras y tachuelas de latón, cofrecito y brújula de ruta, más 6 pedestales 3D luminosos sincronizados con los nodos activos y abiertos del tramo y el Bufón 3D anfitrión en escritorio.
- **Limpieza escultórica del Bufón:** ajuste de profundidad de la capucha (`z = -0.11`) y gorguera arlequín por debajo del mentón veneciano de marfil para despejar por completo la silueta del rostro.

**Fogón 3D con Brasas, Mostrador de Pulpería y Mazos 3D (`escenarios3d.ts`, `pulperia.ts`, `index.ts`)**
- **Fogón nocturno vivo:** 9 piedras volcánicas facetadas (`texturaPiedra`), lecho de brasas incandescentes, 4 leños carbonizados, llama concéntrica translúcida en 3 capas con 2 lenguas laterales, 6 chispas pixel-art flotantes, luz cálida titilante, partículas de brasa ascendentes y el naipe real del jugador levitando sobre las llamas al templar o en Forja Brava.
- **Mostrador y marco de Mazos:** barra de mostrador al fondo, velas bajas, pilas de monedas de oro y botellas de vidrio verde y ámbar en la Pulpería; cuenco de latón con porotos de Truco, vela y monedas en Elegir Mazo.

**Estallidos 3D de Palo y Estabilidad en Mando (`cartas3d.ts`, `mesa.ts`, `desglose.ts`, `mano.ts`)**
- **Impacto táctil en 3D:** cada golpe en la mesa dispara una ráfaga 3D de símbolos del palo giratorios (`estallidoPalo3d`) y retroceso físico amortiguado sobre el tótem enemigo.
- **Holgura de foco en Steam Deck (`1280×800`):** sincronización inmediata de `.con-pano` dentro de `mano.ajustar()` antes de medir el desglose y margen de `tope - 18` en `desglose.ts` para que el realce de foco de la carta en mano nunca roce la pista `corre de Posta`.

**Consejo de Diseño 3D (5 sillas)**
- Dirección 3D, Iluminación y Atmósfera (*Inscryption* Feel): 9,4 / 10 *(v0.41.0: 8,8)*
- Carisma del Bufón y Personajes Vivos: 9,4 / 10 *(v0.41.0: 9,1)*
- Física de Cartas, Cámara y Game Feel (60 FPS): 9,3 / 10 *(v0.41.0: 8,8)*
- Legibilidad y UX en PC / Steam Deck (`1280×800`) y Mando: 9,4 / 10 *(v0.41.0: 9,1)*
- UX y Rendimiento en Móvil (`390×844` / `390×664` / `360×740`): 9,3 / 10 *(v0.41.0: 9,0)*
- **Media global: 9,4 / 10** (+0,4 sobre v0.41.0 · todas las 5 sillas ≥ 9,2/10) · **159,9–164,8 FPS**, **CLS = 0**, **0 fallos en 592 capturas `qa:visual` ES/EN**, **0 solapes en movimiento (`secuencias` 1280 y 390)**, **16/16 `qa:smoke`**, **163/163 pruebas**.

## 0.41.0 · El Bufón de la Penumbra, Máscaras de los Reyes y Chiches 3D (2026-11-24)

Segunda entrega de la transformación 3D: el Bufón cobra vida como figura veneciana esculpida y articulada en la penumbra con ojos que siguen al cursor y a las cartas, se calza las Máscaras y Coronas 3D de los 4 Reyes Jefe y los 5 Chiches se apoyan como objetos físicos 3D sobre la madera. *(Música, voces y balance sin cambios.)*

**Bufón Veneciano 3D y Máscaras de los 4 Reyes (`src/client/escena3d/bufon3d.ts`, `texturas.ts`)**
- **Escultura gótica veneciana en 3D:** máscara puntiaguda de marfil frío (`ExtrudeGeometry`) con tramado Bayer, cuencas almendradas, lágrima carmesí y sonrisa ladina; manto oscuro mate con gorguera arlequín de 8 puntas y cascabeles dorados; cuernos curvados móviles; manos enguantadas y cetro marotte con miniatura veneciana.
- **Mirada viva y expresiones teatrales:** ojos almendrados luminosos con pupilas que siguen físicamente al puntero y a la carta enfocada o arrastrada, parpadeo orgánico e inclinación viva hacia el candil al hablar, reír o burlarse en Portada, Mesa, Pulpería y Fogón.
- **Las 4 Máscaras y Coronas 3D de los Reyes Jefe:** al enfrentar a un Rey, el Bufón se calza el antifaz veneciano dominó y la corona 3D de su palo (Espadas de acero cian, Bastos de astas esmeralda, Oros de sol dorado con rubí, Copas de cáliz carmesí), potenciando su fulgor en Segunda Cara.

**5 Chiches Físicos 3D y Climas Diferenciados (`chiches3d.ts`, `pulperia.ts`, `mesa.css`)**
- **Chiches 3D sobre la madera:** Vaso de Ginebra cristalino con hielo y líquido esmeralda, Dado Cargado de marfil con 6 caras pixel-art, Fósforo de Fogón con llama viva y halo Bayer, Polvo de Tiza cobalto y Poroto de Yapa sobre platillo oscuro, con levitación y giro suave al pasar o enfocar con mando (`L3`).
- **Climas 3D propios por Rey Jefe:** relámpagos y viento cian en Espadas, esporas esmeralda en Bastos, lluvia áurea descendente en Oros y brasas carmesí ascendentes en Copas, más realce reactivo en el retrato HUD estilo DOOM y cartas de Segunda Cara.

**Consejo de Diseño 3D (5 sillas)**
- Dirección 3D, Iluminación y Atmósfera (*Inscryption* Feel): 8,8 / 10 *(v0.40.0: 8,2)*
- Carisma del Bufón y Personajes Vivos: 9,1 / 10 *(v0.40.0: 7,5)*
- Física de Cartas, Cámara y Game Feel (60 FPS): 8,8 / 10 *(v0.40.0: 8,4)*
- Legibilidad y UX en PC / Steam Deck (`1280×800`) y Mando: 9,1 / 10 *(v0.40.0: 8,8)*
- UX y Rendimiento en Móvil (`390×844` / `390×664` / `360×740`): 9,0 / 10 *(v0.40.0: 8,7)*
- **Media global: 9,0 / 10** (+0,7 sobre v0.40.0) · **160+ FPS**, **CLS = 0**, **0 fallos en 592 capturas `qa:visual` ES/EN**, **0 solapes en movimiento (`secuencias` 1280 y 390)**, **163/163 pruebas**.

## 0.40.0 · La Mesa Nocturna 3D (2026-11-24)

Primera entrega de la transformación 3D en primera persona con Three.js + WebGL sobre la mesa nocturna de pulpería, manteniendo intactos el motor determinista, el balance, la música adaptativa `3-3-2`, las voces líricas y la identidad *Dark Dithered Pixel Art*. *(Música, voces y balance sin cambios.)*

**Escenario Persistente 3D (`src/client/escena3d/pulperia.ts`, `texturas.ts`, `camara.ts`, `index.ts`)**
- **Mesa y Pulpería en Penumbra:** tablero de tablones viejos oscuros tramados en Bayer (`THREE.NearestFilter`, sin mipmaps), paño central verde esmeralda sin patrones repetidos, estanterías laterales con botellas, farol de hierro forjado oscilando y polvo/brasas en partículas 3D.
- **Vela 3D sincronizada a la milonga:** vela de cera con collarín, llama viva, halo radial circular tramado con Bayer y luz puntual con sombras reales (`THREE.PCFShadowMap`) leyendo `armoniaActual()` en modo solo lectura sobre los acentos `3-3-2`, además de 4 climas cromáticos para los Reyes Jefe.
- **Mazos físicos y monedas 3D:** pila dinámica del Mazo del jugador con dorso real, pilas de monedas de oro 3D sobre la madera y abanico físico de los 5 Mazos sobre la Portada.
- **Cámara en primera persona y fallback limpio:** presets cinematográficos suaves por pantalla (`portada`, `mazos`, `mesa`, `mapa`, `pulperia`, `fogon`, `altar`, `coleccion`, `cronica`, `ajustes`, `amanecer`, `ocaso`), paralaje sutil al puntero, sacudida amortiguada, calidad adaptativa móvil (`dpr <= 1.5`, sombras `512`) y limpieza de contexto WebGL en `pagehide` con respaldo 2D automático si falta WebGL.

**Naipes Físicos 3D, Tótem Enemigo y Cohesión DOM (`cartas3d.ts`, `mesa.ts`, `mano.ts`, `mesa.css`, `desglose.ts`)**
- **Naipes españoles con espesor real:** mallas 3D (`BoxGeometry`) con frente crispado de la forja, dorso del Mazo elegido, cantos marfil/dorado, sombras proyectadas y sincronización instantánea (`marcarSucio3d()`) alineada al píxel con los marcos de foco y Postas.
- **Enemigo 3D y fractura física:** el enemigo activo se yergue como tótem 3D con recorte limpio de busto y al caer se parte en 2 mitades 3D que vuelan derramando monedas 3D giratorias.
- **Estabilidad, secuencias y mando:** Postas transparentes en modo 3D, `pointer-events: none !important` en fichas voladoras, `marginTop` exacto en el ajuste del desglose (`1280×800`), bocadillo del Bufón ajustado para Steam Deck y portátil (`0` solapes en `1280×800` y `1366×768` ES/EN).

**Consejo de Diseño 3D (5 sillas)**
- Dirección 3D, Iluminación y Atmósfera (*Inscryption* Feel): 8,2 / 10
- Carisma del Bufón y Personajes Vivos: 7,5 / 10
- Física de Cartas, Cámara y Game Feel (60 FPS): 8,4 / 10
- Legibilidad y UX en PC / Steam Deck (`1280×800`) y Mando: 8,8 / 10
- UX y Rendimiento en Móvil (`390×844` / `390×664` / `360×740`): 8,7 / 10
- **Media global: 8,3 / 10** · **158,7–164,8 FPS**, **0 saltos de layout (`qa:layout-shift = 0`)**, **0 fallos en `qa:visual` ES/EN (6 ventanas)**, **0 solapes en movimiento (`secuencias` 1280 y 390)**, **163/163 pruebas**.

## 0.33.0 · Obra Maestra Rioplatense (2026-11-24)

Cierre de la Temporada de Diseño: cohesión total de pantallas secundarias en las 6 resoluciones (ES y EN), mapa móvil con Rey faro y cofre nítido, galería alineada al píxel y respuesta táctil unificada en cada rincón del juego. *(Música, voces y balance sin cambios.)*

**Dirección de Arte y Armonía en Pantallas Secundarias (`pantallas.css`)**
- **La Colección:** `align-items: flex-start` en `.col-mazos` y `.col-reyes` para alinear los 5 clavos de la galería en una única horizontal exacta, tengan o no chapa de `REINADO`.
- **Ajustes:** abanico de los 5 Dorsos despejado limpiamente por encima del gorro del Bufón en escritorio (`1920×1080`, `1366×768`, `1280×800`).
- **Victoria (`LA CORTE CAYÓ`):** se reemplaza el tachado horizontal ilegible (`line-through`) sobre los Reyes vencidos por rótulos nítidos con fino marco dorado que acompañan a las cartas partidas.
- **El Fogón:** íconos de `DESCANSAR` y `TEMPLAR UN NAIPE` alineados al mismo horizonte visual sin alterar el alto ni el aire sobre `SEGUIR SIN USARLO`.
- **El Mapa (Escritorio, Deck y Móvil):** degradado superior refinado en `.mapa-rollo` para disolver filas fuera de pantalla sin fragmentos sobre los molinos (`1280×800`); en móvil (`390×844`) el cofre del Tesoro se escala a `--k: 1` en la esquina superior derecha sin tapar la calavera, y se quita la máscara superior para que el Rey corone el mapa como un faro dorado al 100 %.
- **La Pulpería móvil (`390×844`):** pie esfumado más profundo + `padding-bottom: 44px` para que `HAY MÁS ↓` / `MORE ↓` floten sobre penumbra limpia sin pisar `FACÓN DE PLATA`.

**Tacto y Detalle Fino (`pantallas.css`, `mesa.css`)**
- **Respuesta táctil global:** brillo escalonado al pasar y depresión física al pulsar en tarjetas de opción (`.opcion`), ventas de Pulpería (`.venta`), placas de Botín (`.bp`), nodos abiertos del Mapa (`.nodo.abierto`) y velas del Altar (`.altar-lista > *`), con respeto total por `prefers-reduced-motion`.
- **Barra de cuenta 1280×800 con doble canto:** compactación quirúrgica cuando conviven `¡AL PELO!`, `¡CHANCHO!` y `SOBRAN → PASAN` para lucir 100 % dentro del marco con margen derecho limpio.

**Consejo de Diseño (5 sillas · Armonía / Belleza / Game Feel / Simpleza)**
- Dirección de Arte y Belleza: 9,4 · 9,5 · 9,3 · 9,3 (media 9,4; v0.32.0: 8,9)
- Layout y Estabilidad Visual: 9,5 · 9,3 · 9,3 · 9,4 (media 9,4; v0.32.0: 8,9)
- Animación y Game Feel: 9,3 · 9,3 · 9,4 · 9,3 (media 9,3; v0.32.0: 9,0)
- UX Steam Deck y Mando: 9,3 · 9,3 · 9,3 · 9,4 (media 9,3; v0.32.0: 8,9)
- UX Móvil: 9,3 · 9,3 · 9,3 · 9,3 (media 9,3; v0.32.0: 8,9)
- **Media global: 9,3 / 10** (+0,4 sobre v0.32.0; **+2,0** desde 0.29.0) · **Todas las 20 métricas ≥ 9,3/10** · **0 P0/P1**, **0 saltos de layout**, **0 solapes en movimiento**, **163,1–164,8 FPS**.

## 0.32.0 · Mesa Viva: Animación Cinematográfica, Física Táctil y Game Feel a 60 FPS (2026-11-24)

Tercera entrega de la Temporada de Diseño: luz de pulpería sincronizada con la milonga, física táctil de cartas y botones, transiciones cinematográficas sin saltos y coreografía limpia a 163–164 FPS. *(Música, voces y balance sin cambios; lectura pura del compás en `armoniaActual()`.)*

**Vida Ambiental y Transiciones Cinematográficas**
- **Candil al pulso de la milonga (`motor.ts`):** lectura pura de `armoniaActual()` en el bucle de fondo para pulsar la luz cálida de la mesa, el farol y el fogón en los acentos 3-3-2 (`paso` 0, 6 y 12) con costo O(1) y respeto total por `calma` / `prefers-reduced-motion`.
- **Cortes cinematográficos con 0 saltos (`ui.ts`, `base.css`):** se elimina el brinco vertical de `@keyframes pantalla-entra`, reemplazado por un fundido desde penumbra cálida + velo efímero `.transicion-velo` (240 ms, `pointer-events: none`).
- **Botones y Dorsos táctiles (`base.css`, `pantallas.css`):** depresión física al presionar (`.btn:active`), barrido dorado escalonado periódico sobre los CTA principales (`.btn.oro`, `.btn.monumental`) y halo dorado + elevación táctil en los 5 Dorsos de Elegir Mazo.

**Física Táctil y Estados Vivos del Enemigo**
- **Chispas al apoyar en el paño (`mano.ts`, `mesa.css`):** apoyar o correr un naipe sobre una Posta dispara un destello de borde `.posta.recien-apoyo` y partículas pixeladas (en oro + fogonazo sutil del candil al apoyar en el Medio).
- **Enemigo Aturdido y con Furia vivos (`mesa.ts`, `mesa.css`):** el retrato del enemigo aturdido tambalea en pasos pixel-art con 3 estrellas doradas orbitando sobre su frente (`.e-estrellas`), y la Furia enciende un halo cálido de brasa alrededor del naipe.

**Coreografía de Golpe (Desktop, Steam Deck y Móvil)**
- **Crítico `×2` sin pisar cifras:** el sello `.c-crit-sello` cae centrado encima de `MULTI` sin desplazarlo ni pisar el `=` o el total.
- **`TAJO DE REVÉS` y `FURIA` despejados en 1280×800 / 1366×768:** `FURIA` ocupa su corredor limpio entre `JUGADAS` y `TAJO DE REVÉS`, a la derecha de `24 ×2`.
- **Barra de cuenta de una sola fila en escritorio + conteo escalado en móvil:** `flex-wrap: nowrap` y espaciado fino evitan que `SOBRAN → PASAN` se monte sobre el paño (`0 solapes en movimiento` en `secuencias.ts`); en móvil cada carta y pieza hace latir `DAÑO`/`MULTI`/`TOTAL` con escalado progresivo y aterrizaje limpio sobre el canto superior de la cifra.
- **Comodín copiado en Posta del Medio (`mano.ts`):** la chapita `×2` se ubica arriba a la derecha dejando intacta la chapa `COMODÍN` inferior izquierda.

**Consejo de Diseño (5 sillas · Armonía / Belleza / Game Feel / Simpleza)**
- Dirección de Arte y Belleza: 8,9 · 9,0 · 8,9 · 8,8 (media 8,9; v0.31.0: 8,5)
- Layout y Estabilidad Visual: 9,1 · 8,8 · 8,9 · 8,9 (media 8,9; v0.31.0: 8,7)
- Animación y Game Feel: 8,9 · 8,9 · 9,1 · 8,9 (media 9,0; v0.31.0: 8,3)
- UX Steam Deck y Mando: 8,9 · 8,9 · 9,0 · 8,9 (media 8,9; v0.31.0: 8,6)
- UX Móvil: 8,8 · 8,9 · 8,9 · 8,8 (media 8,9; v0.31.0: 8,5)
- **Media global: 8,9 / 10** (+0,4 sobre v0.31.0; +1,6 desde 0.29.0) · **0 P0/P1**, **0 saltos de layout**, **0 solapes en movimiento**, **163,3–164,8 FPS**.

## 0.31.0 · Belleza de Pulpería Nocturna (2026-11-24)

Segunda entrega de la Temporada de Diseño: dirección de arte limpia en mesa y pantallas, foco de mando 100 % unificado en Steam Deck y lectura impecable en teléfono. *(Música, voces y balance sin cambios.)*

**Dirección de Arte y Simpleza**
- **Comodín apoyado de lámina dorada:** desaparece el espectro borroso del Bufón y la barra vertical que tapaba las pintas; el naipe copiado luce a opacidad plena con brillo dorado cálido que preserva los colores del palo y una chapita horizontal `COMODÍN` en la esquina inferior izquierda.
- **Mesa silenciosa en reposo:** la caja punteada `AL DESCARTE` en escritorio se oculta en reposo y aparece solo al arrastrar una carta (conservando su geometría para 0 saltos).
- **Equilibrio de tarjetas y escenas:** tarjetas cortas centradas en Fogón, Cábala, Pulpería y Ofertas (sin mitades vacías); Botín a 1080p proporcionado (`--kp: 4` y placas compactas); el Rey del Mapa permanece siempre al 100 % mientras la ayuda lo esquiva por arriba o por abajo.

**UX Steam Deck (`1280×800`) y Mando**
- **Lenguaje de foco único:** «LO QUE LLEVÁS» suma borde celeste y flecha `▼`; se eliminó el recuadro erróneo sobre el escudo Inmune y el `+6` dentro de la carta enfocada; `--foco-2` pasa a celeste claro (`#b8f8ff`) para no parecer blanco; `HAY MÁS ↓` se posa sobre un pie esfumado sin pisar títulos.
- **Separación visual `CORTÁS` vs. Foco:** las cartas que pagan Escudo en Chinchón usan marco azul zafiro (`#1e78e8`) para distinguirse al instante del foco celeste eléctrico (`#7df3ff`).
- **Cero pisadas y mayor contraste a 40 cm:** aire limpio bajo `AMULETOS 0/5`, `L3 CHICHES` y Postas para la flecha `▼`; mayor contraste en `TE PEGA` (`21 − 3 ESCUDO`) y nota de `FURIA`.

**UX Móvil (`390×844` / `390×664` / `360×740`)**
- **Hoja de cuenta en 2 columnas (`DAÑO | MULTI`):** reduce casi a la mitad el alto del desglose expandido para no decapitar `TE PEGA` ni invadir la cabecera.
- **`CORTÁS` en 2 pisos exactos** manteniendo `TE PEGA` y `LE QUEDAN` visibles; fila trasera más legible en Chinchón de dos filas en móvil alto; placa oscura cohesionada para `TE PEGA` en escenas bajas (`390×664` / `360×740`) e ícono de corazón restaurado en el HUD de `360×740`.

**Consejo de Diseño (5 sillas · Armonía / Belleza / Game Feel / Simpleza)**
- Dirección de Arte y Belleza: 8,7 · 8,8 · 7,8 · 8,6 (media 8,5; v0.30.0: 8,0)
- Layout y Estabilidad Visual: 9,1 · 8,7 · 8,1 · 8,8 (media 8,7; v0.30.0: 8,3)
- Animación y Game Feel: 8,5 · 8,4 · 7,8 · 8,3 (media 8,3; v0.30.0: 7,9)
- UX Steam Deck y Mando: 8,9 · 8,7 · 8,0 · 8,9 (media 8,6; v0.30.0: 8,1)
- UX Móvil: 8,8 · 8,5 · 7,8 · 8,8 (media 8,5; v0.30.0: 7,9)
- **Media global: 8,5 / 10** (+0,5 sobre v0.30.0; +1,2 desde 0.29.0) · **0 P0**, **0 saltos de layout**, **163,6–164,8 FPS**.

## 0.30.0 · Arquitectura de Roca (2026-11-24)

Primera entrega de la Temporada de Diseño, UI/UX y Game Feel: **0 saltos de layout** en las 5 resoluciones (de 432 hallazgos a 0) y armonía espacial en todas las pantallas principales. *(Música, voces y balance sin cambios.)*

**Estabilidad geométrica (`npm run qa:estabilidad`)**
- Nueva puerta automática de estabilidad y simetría interactiva en `scripts/qa-estabilidad.ts` (7 sondas en 5 resoluciones: Portada `ES↔EN`, Elegir Mazo, Altar, Colección, Mesa con selección 1–3 cartas y vuelta a reposo, Dial `DEJALO JUSTO ↔ PEGÁ CON TODO`, y Ofertas).
- **Mesa de roca:** las cartas no elegidas ya no saltan ni se achican al elegir/deselegir (contorno punteado limpio en escritorio); la cuenta, la placa `TE PEGA` y el desglose a 1080p mantienen altura y tipografía fijas (24 px); el paño móvil reserva su franja desde reposo y el dial móvil alterna con 0 px de salto y 14 px legibles.
- **Pantallas sin brincos:** Portada (ancho estable al alternar `ES↔EN`), Elegir Mazo (cabecera, detalle y Reinado fijos), Altar (paño 4×2, detalle y botones de tamaño uniforme) y Colección (pared de alto completo en las 5 pestañas).

**Armonía espacial y composición**
- **La Pulpería a 1080p:** los 3 Amuletos, 2 Servicios y 2 Chiches entran enteros encima del HUD con filas simétricas, sin recortes ni `HAY MÁS ↓` en el estado normal.
- **Ofertas sobre el Botín (`ELEGÍ UNA`):** sin Botín aplastado detrás, con el Bufón íntegro a la izquierda y título, tarjetas y `SALTAR` centrados al eje en 1080p.
- **La Colección:** vitrina centrada simétricamente sin tapar el farol de la izquierda, con los 5 Dorsos y los Reyes a escala pareja.

**Consejo de Diseño (5 sillas · Armonía / Belleza / Game Feel / Simpleza)**
- Dirección de Arte y Belleza: 8,3 · 8,1 · 7,6 · 7,8 (media 8,0; base 0.29.0: 7,3)
- Layout y Estabilidad Visual: 8,8 · 8,1 · 8,0 · 8,2 (media 8,3; base 0.29.0: 6,8)
- Animación y Game Feel: 8,2 · 7,9 · 7,7 · 7,8 (media 7,9; base 0.29.0: 7,4)
- UX Steam Deck y Mando: 8,4 · 8,0 · 7,8 · 8,1 (media 8,1; base 0.29.0: 7,6)
- UX Móvil: 8,3 · 7,8 · 7,6 · 8,0 (media 7,9; base 0.29.0: 7,2)
- **Media global: 8,0 / 10** (+0,7 sobre 0.29.0) · **0 P0**, **0 saltos de layout**, **163,8–164,8 FPS** (0,0 % > 25 ms).

## 0.29.0 · Lo que se gana (2026-11-23)

Primera versión sin ningún P0 ni P1 abierto en los siete jurados.

**Reglas**
- **Las Evoluciones se ganan**: despiertan con cuatro niveles de dones del Rey de su palo (antes, con un don). Pasan de
  despertar en el 85–94 % de las partidas a alrededor del 50–60 %.
- **Cada maldición cobra por algo distinto**: el Garrote, el golpe sin Bastos (gasta medio Escudo); el Brindis, que tus
  Copas ya no te curan (ya no bebe Vida). Facón y Sol siguen igual.
- **Truco**: el ¡ENVIDO! pide dos cartas del mismo palo que sumen 8 o más (de ~21 a ~15 cantos por partida).
- **Chancho Va**: el ¡CHANCHO! que abate deja Aturdido al enemigo que entra, y «de un saque» vale con el Degüello.
- **Al pelo**: pasarte por hasta el 10 % de la Vida máxima paga 1 de oro y sostiene la racha.
- Mazos reajustados y balance recertificado.

**Audio**
- Los 59 efectos rehechos con el material de la música (madera, cuerda pulsada, parche, campanitas, fuelle), afinados al
  acorde que suena; las monedas, en un arpegio.
- Las voces articulan una consonante por sílaba, cantan parejo entre vocales y van 4 dB sobre la música; el Bufón canta
  más lento y con saltos más chicos. Estéreo: Bufón a un lado, Reyes al otro.
- Los remates de premio siempre resuelven (ni tritono ni novena menor).
- Cada escena tiene cuatro secciones (unos 74 s antes de repetir) y el bandoneón, un tema escrito.
- Sonido propio para el Rey que se planta y para la Forja Brava.
- `npm run qa:audio` escribe archivos WAV de cada escena y cada voz para escucharlos. Sigue sin pasar por un oído humano.

**La mesa y las pantallas**
- Mesa a 1080p: el paño al tamaño de la mano, el desglose en dos columnas con letra grande y el Bufón con la cara libre.
- El desglose ya no corta nombres: nombres cortos y «otras +N».
- Teléfono: la cuenta siempre plegada con su hoja de detalle; busto del enemigo; placas «−N» bajo su caja; nada bajo 14 px
  (la QA mide ahora también los textos efímeros).
- Un solo color de foco con mando; el golpe que abate sostiene «NO TE PEGA · LO ABATÍS»; el Rey que se planta tiene gesto.
- Botín, Forja Brava, Mapa, Pulpería y Colección rehechos a 1080p.

**Jurado** (siete) · Claridad 8,9 · Diversión 8,7 · Estética 8,7 · Veredicto 8,8. 0 P0 y 0 P1; 21 P2. Audio pasó de 7,6
a 8,3. La meta de 9,1 la alcanzan Claridad en novato (9,2) y móvil (9,1).

**Medición** · Laboratorio (3000 partidas por celda, sin avisos) · Altar vacío / lleno: Escoba 31,3 / 46,7 · Truco
28,2 / 48,6 · Chinchón 29,1 / 48,4 · Mentiroso 28,4 / 48,4 · Chancho 33,0 / 48,9 %.

## 0.28.0 · La milonga de la Corte (2026-11-22)

La música y las voces se rehacen enteras, y la mesa cierra los tres P1 del jurado de la 0.27.

**Música y voces**
- **Un solo reloj** para todo el juego (104 negras por minuto, Re menor, síncopa 3-3-2 de milonga): ninguna pantalla
  corta la música; cada una suma o quita capas al límite del compás.
- **La mesa suena a lo que pasa**: capas por tramo, y la Furia, la racha y la poca Vida mueven el filtro y las capas en
  menos de 300 ms; con menos del 30 % de Vida entra un latido.
- **Un motivo para cada Rey**, la segunda cara sube a Mi menor y la caída remata con una cadencia en vez de un silencio.
- **Los cantos son remates afinados** al acorde del momento, y los efectos melódicos también.
- **Los personajes cantan**: cada sílaba es una nota del acorde del compás, con formantes por vocal, vibrato y una
  tesitura propia (Bufón tenor, Espadas barítono, Bastos bajo, Oros tenor lírico, Copas mezzo).
- Bus maestro con compresor, techo, sala y agache automático; la música suena aunque los efectos estén apagados.
- La mezcla se afinó con mediciones (`npm run qa:audio`, 47 renders sin recortes): todavía no pasó por un oído humano.

**Reglas**
- **Truco**: el Daño del ¡ENVIDO! crece con el tramo (base 11, ×2 y ×3; antes 45 fijo); 53 de Vida y +7 de Multi de mano.
- El informe del laboratorio cuenta Evoluciones despiertas y oro pagado al Sol.

**La mesa y las pantallas**
- Escritorio: la mano no se mueve al elegir ni al golpear y descansa entera sobre el HUD; el desglose va a su izquierda.
- Teléfono: la cuenta plegada dice jugada, fórmula, efectos y desenlace, y un toque abre el desglose sin mover la mano.
- El sello SE PLANTA se ve, en lugar fijo junto a la barra del Rey.
- Cada término del desglose con su nombre; ENGAÑO y PASAR dicen qué hacen; raya bajo el 6 y el 9; las placas «−N» no se
  pisan; el Bufón reacciona al resultado de la Forja Brava; «SEGUIR SIN ELEGIR».

**Jurado** (siete) · Claridad 8,7 · Diversión 8,6 · Estética 8,4 · Veredicto 8,6. 0 P0; 1 P1 (arte: la mesa a
1920×1080, con el bocadillo que tapa al Bufón). Audio pasó de 5,1 a 7,6.

**Medición** · Laboratorio (3000 partidas por celda, sin avisos) · Altar vacío / lleno: Escoba 29,4 / 45,6 · Truco
28,9 / 48,1 · Chinchón 28,3 / 45,1 · Mentiroso 28,0 / 48,6 · Chancho 31,4 / 46,6 %.

## 0.27.0 · Cero P0 (2026-11-22)

Cierre quirúrgico de la 0.26: el único P0 vivo, un premio propio para el Chinchón y un laboratorio que juega el Sol.

**Reglas**
- **¡CHINCHÓN! corta la mano**: cada carta que te queda sin jugar te da 3 de Escudo (×2 y ×3 en los tramos 2 y 3). Ya
  no anula el golpe del enemigo (ese premio, Aturdir, es del Chancho Va). El Chinchón baja a 26 de Vida.
- **Sol de la Timba**: cada descarte cuesta 5 de oro (antes 3), y el bot del laboratorio ahora los paga.
- **Un golpe no lleva más cartas que Postas tiene el paño**: el bot y el laboratorio ya no juegan 4 o 5 cartas con 3
  Postas, algo que una persona no podía apoyar.
- Chancho Va con 47 de Vida; su Pierna ya no promete un «×1 de Multi».

**La mesa y las pantallas**
- En el teléfono la mano no cede ni salta en ninguna jugada ni ventana (390×844, 390×664, 360×740): cede la cuenta, que
  se pliega; el paño lleva naipes enteros y una silueta en cada hueco.
- Causa → efecto: «−5 ESCUDO», «−18» y «−3 ORO» nacen dentro de su caja del HUD y la cifra baja después.
- Respiro tras todo golpe que no abate (380 ms el chico, 600 ms el grande) con su remate sonoro.
- El dial lleva verbo y la cuenta nombra el estado; la oferta del teléfono pone SALTAR arriba y «hay más ↓»; el final
  nombra a quien te llevó; la Forja Brava arde con llama tramada.
- Las secuencias del jurado salen con 0 solapes.

**Jurado** · Se suma un séptimo juez, de audio. Los seis de siempre: Claridad 8,6 · Diversión 8,5 · Estética 8,5 ·
Veredicto 8,6 (0 P0; 3 P1: mesa de escritorio con algo apoyado, cuenta plegada del teléfono, sello SE PLANTA que no se
ve). Audio, línea de base antes de rehacer la música: 6,5 · 5,0 · 4,5 · 5,1. Media de los siete: 8,3 · 8,0 · 7,9 · 8,1.

**Medición** · Laboratorio (3000 partidas por celda, sin avisos) · Altar vacío / lleno: Escoba 29,4 / 45,6 · Truco
29,4 / 48,2 · Chinchón 28,3 / 45,1 · Mentiroso 28,0 / 48,6 · Chancho 31,4 / 46,6 %. El panel simulado ya no se corre.

## 0.26.0 · Que cambie cómo se juega (2026-11-22)

Las Evoluciones que el jurado leía como números (Garrote, Sol, Brindis) cambian una regla, y dos Mazos cantan más.

**Reglas**
- **Garrote del Cacique**: tu Escudo suma ×2 al Daño; el golpe que no abate gasta la mitad de tu Escudo. Las Copas
  vuelven a curar.
- **Sol de la Timba**: Oros dobles, +1 Multi cada tanto de oro (tope +3) y **descartes sin fin** mientras tengas oro:
  cada uno cuesta 3.
- **Brindis de Sangre**: +1 de Multi por cada 10 % de Vida que te falta; cada golpe te bebe 1 de Vida (ya no cura doble).
- **Chancho Va**: la Pierna (3 iguales) también canta ¡CHANCHO! (Aturde 1); el Póker sigue con ×2 y Aturde 2.
- **Chinchón**: el turno del ¡CHINCHÓN! el enemigo no te pega; su Mazo va del 1 al 8.
- Mazos reajustados (Vida, Multi de mano, Cara de Piedra) y balance recertificado.

**La mesa y las pantallas**
- En el teléfono la mano no se mueve al elegir uno o dos naipes; la mano de 8 conserva sus dos filas.
- **Forja Brava** como cumbre: el panel se pliega, el naipe entero baja a la fogata y, si sale, un ×2 grande.
- El Garrote avisa «−N de Escudo» y lo cobra en tu ESCUDO; DESCARTAR con el Sol dice «−3 oro» y «∞»; placa
  NO TE PEGA · ¡CHINCHÓN! y NO TE PEGA · LO ABATÍS.
- La maldición espera el respiro del número; lo que sobra con Perfora sale en púrpura antes de que hable el Rey.
- La oferta de una Evolución pone la regla arriba y la MALDICIÓN debajo; la Pulpería del teléfono avisa «hay más ↓».

**Medición** · Laboratorio (3000 partidas por celda, sin avisos) · Altar vacío / lleno: Escoba 30,3 / 45,8 · Truco
28,8 / 48,2 · Chinchón 28,2 / 47,8 · Mentiroso 28,9 / 48,3 · Chancho 30,2 / 46,2 %. Jurado: Claridad 8,3 · Diversión 8,3 ·
Estética 8,3 · Veredicto 8,3. Panel **simulado** (n = 60, ruido ±10): 61,7 % (−8,3, dentro del ruido); Deck 56 % (n = 9),
Móvil 67 % (n = 15); Claridad del panel 5,75.

## 0.25.0 · Lo que se paga (2026-11-22)

Las Evoluciones dejan de ser retoques de número: cada una cambia una regla y cobra su precio.

**Reglas**
- **Cada Evolución trae su maldición**, escrita en su ficha:
  - el **Facón Maldito** hace que todo golpe Perfore (la sobra pasa ×3), pero el golpe que no abate te corta 3 de Vida;
  - el **Garrote del Cacique** suma tu Escudo al Daño, pero tus Copas ya no curan: te dan Escudo;
  - el **Sol de la Timba** paga doble tus Oros, pero cada descarte te cuesta 3 de oro;
  - el **Brindis de Sangre** cura doble con tus Copas y suma +3 de Multi a cada golpe, pero cada golpe te bebe 2 de Vida.
  - Las maldiciones de Vida nunca te matan: te dejan en 1.
- **Sin Perfora, la mesa apoya sola el Golpe exacto** cuando las mismas cartas lo permiten; con Perfora, el dial elige.
- **Mesa limpia**: en el primer tramo la Escoba arranca cada combate con 10 de Escudo (las caídas del tramo 1 bajan de
  17,9 % a 8,7 %).
- El Truco trae más Envido (+40), bravas que pegan más y 56 de Vida.

**La mesa y las pantallas**
- La MALDICIÓN se lee como costo (bloque carmesí con su rótulo) en la oferta, el jackpot, la bandeja y «Lo que llevás»;
  la cuenta avisa «−N de Vida» antes de golpear y el cobro nace en su caja del HUD.
- El dial con Perfora dice qué gana y qué pierde cada lado; va en R3 y la Y es siempre DESCARTAR.
- En el teléfono la mano en reposo va entera sobre la barra del pulgar y TE PEGA tiene su columna.
- Las ayudas no tapan al enemigo, TE PEGA ni la cuenta.
- **Forja Brava**: la apuesta («50 % SE QUEMA») arriba y grande, «×2» en el momento cumbre, el naipe que baja a la fogata
  que crece y un Doble Filo con dibujo nuevo.
- Un respiro de ~600 ms tras el golpe grande antes de que pegue el Rey; la letra de lo nuevo a 18 px; el final con
  «hay más» en el teléfono y «TU ARMADO».

**Medición** · Laboratorio (3000 partidas por celda, sin avisos) · Altar vacío / lleno: Escoba 30,7 / 45,9 · Truco
28,2 / 48,1 · Chinchón 29,1 / 47,6 · Mentiroso 29,1 / 47,3 · Chancho 29,7 / 49,0 %. Jurado: Claridad 8,2 · Diversión 8,2 ·
Estética 8,3 · Veredicto 8,2. Panel **simulado** (n = 60, ruido ±10): 70,0 %, dentro del ruido; Deck 78 % (n = 9),
Móvil 80 % (n = 15); Claridad del panel 6,0.

## 0.24.0 · Que se entienda a la primera (2026-11-22)

Ronda de claridad guiada por los P0 y P1 del jurado de la 0.23.

**Reglas**
- **Lo que Perfora respeta las dos caras del Rey**: la sobra lo planta en la mitad, dice cuánto se pierde
  («SE PLANTA EN LA MITAD · N SE PIERDEN») y muestra su segunda cara.
- La Escoba trae 74 de Vida.

**La mesa y las pantallas**
- **Ninguna ayuda se abre sola** ni tapa botones, títulos o cifras del HUD; la QA lo vigila (reglas `tip-tapa` y
  `oferta-hud`). ELEGÍ UNA y el Tesoro quedan sobre el HUD, nunca encima.
- **DEJALO JUSTO**: el viejo chip EXACTO es una acción con su premio (+3 de oro y Multi al próximo, o PEGÁ CON TODO),
  al costado de lo apoyado, con la Y del mando; el Bufón la presenta una vez por partida.
- La oferta que **Evoluciona** dice por qué («con tu don de Copas») y su regla entera; la carga de Copas se llama
  **TRAGO**.
- **El resumen del final**: TU MANO ESTRELLA con piezas que el mando enfoca, tu jugada con cómo se arma, ESTA PARTIDA y
  TU MEJOR separadas, el récord nuevo que sube contando; en el teléfono el cuadro se desliza.
- **Forja Brava**: las dos mutaciones como cartas de elección grandes y una tercera pasada de 1,5 s que sale con hitstop
  y sacudida (o ceniza si se quema).
- La entrada del Rey apaga la cuenta del golpe anterior; la Cábala Negra con aro celeste de mando.
- En el teléfono, la mano de 8 no cambia de filas al elegir, el «−N» y el «+N» nacen en su caja del HUD y el chip del
  Tajo cabe en un renglón.

**Medición** · Laboratorio (3000 partidas por celda, sin avisos) · Altar vacío / lleno: Escoba 30,4 / 47,3 · Truco
28,4 / 46,6 · Chinchón 30,0 / 46,9 · Mentiroso 30,4 / 46,8 · Chancho 28,6 / 45,4 %. Jurado: Claridad 8,1 · Diversión 8,1 ·
Estética 8,2 · Veredicto 8,1. Panel **simulado** (n = 60, ruido ±10): 71,7 % (IC95 59–82 %), igual que la 0.23; Claridad
del panel 6,08.
## 0.23.0 · Otra mano ya (2026-11-22)

Tercer Salto: probar no castiga, el final te deja con ganas de volver y el Fogón se vuelve una apuesta que vale.

**Reglas**
- **Devolver en el Altar**: cada mejora reintegra entero lo que costó su nivel.
- **¡FORJA BRAVA!** duplica el naipe entero (número y temple) y deja **elegir entre dos mutaciones a la vista**.
- **El chip EXACTO** del paño: si otra manera de apoyar las mismas cartas abate con Golpe exacto, la mesa la ofrece
  (R3 o X, o un toque) y vuelve a MÁXIMO con otro.
- El Facón Maldito pasa la sobra ×3 (la Lanza, ×2); la Corte de los tramos 2 y 3 trae un poco más de Vida.

**El final y la mesa**
- **Resumen en dos capas** en la misma escena del final: la build estrella (Evoluciones, Amuletos, Bendición, tu jugada y
  tu mejor golpe) y **Qué te frenó / Próximo récord**, con el botón grande **OTRA MANO YA**.
- Las **Evoluciones** tienen dibujo propio: el jackpot muestra «antes ▶ después», no se corta en sus primeros 400 ms y
  la ficha vuela al HUD, que toma foco de mando; «Lo que llevás» muestra la forma despierta.
- El Tesoro es un **baúl de hierro** que se abre con su sonido; la Cábala Negra cose con aguja e hilo y en el teléfono
  agrupa por número; el paño queda reservado en el teléfono y la mano no salta bajo el pulgar.
- El Fósforo no se gasta si no destraba nada; el Tajo de revés ya no muestra cuatro veces el mismo número.

**Medición** · Laboratorio (3000 partidas por celda, sin avisos) · Altar vacío / lleno: Escoba 29,5 / 46,0 · Truco
29,3 / 47,5 · Chinchón 30,9 / 47,7 · Mentiroso 30,9 / 48,3 · Chancho 30,2 / 46,6 %. Jurado: Claridad 7,9 · Diversión 8,0 ·
Estética 8,1 · Veredicto 7,9. Panel **simulado** (n = 60, ruido ±10): 71,7 % (IC95 59–82 %); Deck 56 % (n = 9),
Móvil 93 % (n = 15).

## 0.22.0 · Lo que despierta en la trastienda (2026-11-22)

Segundo Salto: las piezas se transforman, el Fogón se vuelve apuesta de verdad y el mapa muestra lo que hay que ganar.

**Reglas**
- **Evoluciones**: los cuatro Amuletos de palo de rareza épica evolucionan solos cuando además llevás un don del Rey de su
  palo: el Facón Maldito, el Garrote del Cacique, el Sol de la Timba y el Brindis de Sangre. Siguen siendo 15 Amuletos.
- **¡FORJA BRAVA!**: la tercera pasada del Fogón duplica el número del naipe y le deja una mutación (Doble Filo, Roba
  Carta o Chispa de Oro).
- **La Cábala Negra**: una vez por partida, desde el segundo tramo, el Bufón cose dos naipes iguales en uno o le
  trasplanta a uno el palo de otro.
- **Tesoros a la Vista**: cofres en el mapa; tras la Élite se abren solos, tras la Guardia con candado de oro.
- Legendarios y Prismáticos con poder de verdad y un costo picante escrito en su ficha; la mesa prueba todas las maneras
  de apoyar el golpe en el paño.

**La mesa**
- El paño tiene **fila propia** de fieltro forjado, con un solo renglón de ayuda; la mano baja entera debajo y en el
  teléfono cada naipe es una diana de 44 px o más.
- El «−N» que te pegan nace junto a VIDA (y el que frena el Escudo, junto a ESCUDO); cada Chiche suena distinto.
- Jackpot de 1,2 s con fanfarria al despertar una Evolución, ficha prismática en el HUD y sello **★ EVOLUCIONA** en las
  ofertas. **TURBO**: cualquier toque corta la espera en curso.

**Medición** · Laboratorio (3000 partidas por celda, sin avisos) · Altar vacío / lleno: Escoba 29,2 / 45,1 · Truco
28,8 / 46,3 · Chinchón 31,3 / 45,8 · Mentiroso 30,0 / 48,4 · Chancho 30,9 / 46,5 %. Jurado: Claridad 7,6 · Diversión 7,9 ·
Estética 8,1 · Veredicto 7,7. Panel **simulado** (n = 60, ruido ±10): 73,3 % (IC95 61–83 %); Deck 67 % (n = 9),
Móvil 80 % (n = 15).

## 0.21.0 · La mesa de paño (2026-11-21)

Primer Salto para despegar de los juegos de cartas con puntaje: el golpe se apoya en un paño con lugares que importan, y
la mesa tiene a mano sus chucherías de pulpería.

**Las Postas del paño**
- Las cartas del golpe se apoyan en **3 a 5 Postas** (tantas como tu mano). La **Posta del Medio** pega ×2 su número; el
  naipe a la **derecha de un Comodín** recibe su **Chispa** (×2 su número); tres o más en orden creciente arman
  **Escalón** (+2 de Multi).
- **La mesa acomoda sola** la mejor disposición al elegir; se reordena arrastrando o con LB/RB y DAÑO × MULTI cambia al
  instante. Cada Posta lleva su símbolo y su ayuda corta; Medio, Chispa y Escalón están en el glosario.

**Los Chiches**
- Tres huecos **sobre la madera, a la derecha de la mesa** (nunca en la mano): Vaso de Ginebra, Dado Cargado, Fósforo de
  Fogón, Polvo de Tiza y Poroto de Yapa. Un solo uso, no gastan el turno; un clic o arrastrarlos al enemigo. En el
  teléfono, el primer toque explica y el segundo usa.
- Se compran en La Pulpería o la Corte los suelta como **Prenda** al abatir con exacto, al pelo o cantando.

**La mesa**
- El Rey entra con la **Máscara del Bufón**, una pieza propia de la forja; fichas y porotos saltan sin cruzar las cifras
  del HUD; lo que te pegan va en un carril junto a VIDA; la mano no se hunde bajo el HUD en la Deck ni en el portátil.

**Medición** · Laboratorio (3000 partidas por celda, sin avisos) · Altar vacío / lleno: Escoba 30,1 / 46,7 · Truco
30,2 / 48,2 · Chinchón 29,7 / 45,9 · Mentiroso 29,1 / 47,3 · Chancho 29,4 / 46,6 %. Jurado: Claridad 7,5 · Diversión 7,7 ·
Estética 8,0 · Veredicto 7,7. Panel **simulado** (n = 60, ruido ±10): 70,0 % (IC95 57–80 %); Deck 67 % (n = 9),
Móvil 73 % (n = 15).

## 0.20.0 · Las dos caras del Rey (2026-11-21)

Paquete dictado por el Jurado sobre la 0.19.0: Reyes que morían sin mostrar su segunda cara, un Multi de mano que
aplanaba las jugadas, números que chocaban con los cantos y un metajuego que no era un lugar.

**Reglas**
- **Cada Rey muestra sus dos caras**: en su primera cara se planta en la mitad de su Vida; el golpe que la cruza lo deja
  justo ahí y la cuenta lo avisa con el chip **SE PLANTA EN LA MITAD**.
- Multi de mano chico (Escoba 3 y ×3 en el 15), Reyes con menos Vida y Cara de Piedra plana.

**La mesa**
- Un **director de escena** ordena todo lo que vuela sobre la mesa: lo liviano cede, nada se posa sobre el naipe ni sobre
  la cuenta y el número del golpe queda dentro de la pantalla.
- El **Crítico estalla en el MULTI** con su sello ×2 en un lugar propio; la cuenta tiene alto y ancho fijos.
- Glifos A/B/Start en todos los botones y foco celeste en Botín, ofertas, Mapa y Pulpería.
- Del Botín a «ELEGÍ UNA» sin velo negro; «4 MÁS» en la bandeja; «ESTÁS ACÁ» clavado a su nodo; escudos de Inmunidad
  más grandes en la ayuda del nodo; la placa del enemigo dice el golpe neto también en reposo.

**El metajuego como lugar**
- El Altar es un rincón de adobe con su mesa de paño y cirios (una vela por nivel, un solo MEJORAR); la Colección, una
  pared con farol y fichas clavadas; la portada, Elegí tu Mazo, los Ajustes y la Crónica, sobre la mesa de tablas con vela.

**Medición** · Laboratorio (3000 partidas por celda, sin avisos) · Altar vacío / lleno: Escoba 29,7 / 47,9 · Truco
32,7 / 48,8 · Chinchón 29,3 / 45,5 · Mentiroso 29,8 / 48,6 · Chancho 29,9 / 48,7 %. Jurado: Claridad 7,7 · Diversión 7,6 ·
Estética 8,2 · Veredicto 7,7. Panel **simulado** (n = 60, ruido ±10): 76,7 % (IC95 65–86 %); Deck 78 % (n = 9),
Móvil 87 % (n = 15).
## 0.19.0 · La mesa limpia (2026-11-21)

Paquete dictado por el Jurado Fable sobre la 0.18.0: el crítico que contaba dos veces, el Botín de cinco piezas que
tapaba al Bufón, dos «TE PEGA» distintos, la mesa que saltaba en la Steam Deck y la curva de caídas despareja.

**El golpe**
- **«¡CRÍTICO! ×2» vive dentro del MULTI**: en el conteo estalla en su término, con sonido, chispas y un frenazo; ya no
  se estampa sobre un total que ya lo incluía. El número del daño sale al costado del naipe, sin tapar cara ni índice.
- **Un solo TE PEGA**: la placa del Rey y la cuenta dicen lo mismo, con la causa («21 − 2 ESCUDO») cuando entra.
- **El rasgo de cada Rey se lee con su regla** también en la primera cara («Medio golpe suyo cruza tu Escudo»). Los rasgos
  del Cacique y del Bacanal se llaman ahora **Cuero del Cacique** y **Sed del Bacanal** (no chocan con Coraza y Brindis).
- Cada palo suena distinto al golpear, y un toque o una tecla apura el conteo.

**Mesa, mando y teléfono**
- **La mesa no salta al elegir** en la Steam Deck: la cuenta reserva su alto y se aprieta en vez de crecer (la QA lo vigila
  con la regla «mesa-quieta»). El foco del mando es un marco celeste con flecha, distinto de la selección en oro.
- El cartel de la segunda cara se pliega antes de que el Rey pegue; el grito del Personaje sale junto a su retrato, con cola.
- El Botín de un Rey con cinco piezas no tapa al Bufón y la **Vida máxima tiene icono propio**. Estados de QA nuevos:
  `botin-rey` y `mesa-conteo`.

**Reglas y balance**
- **La Vida máxima que da un Rey sale de la Vida del Mazo** (20 %, mínimo 6): un +12 plano era +133 % para el Mentiroso.
- Vidas y Multi de mano reafinados; el laboratorio vigila ahora las **caídas en el tramo 1** (Escoba 17,7 · Truco 2,9 ·
  Chinchón 13,3 · Mentiroso 22,7 · Chancho 3,2 %; en la 0.18 iban de 3 a 34 %).
- Laboratorio (3000 partidas por celda, sin avisos) · Altar vacío / lleno: Escoba 31,4 / 47,1 · Truco 30,2 / 47,8 ·
  Chinchón 30,7 / 49,0 · Mentiroso 30,7 / 47,9 · Chancho 31,0 / 47,0.

**Medición** · Jurado Fable: Claridad 7,6 · Diversión 7,5 · Estética 8,0 · Veredicto 7,6. Panel **simulado** (n = 60,
ruido ±10): 70,0 % (IC95 57–80 %), contra 81,7 % de la 0.18; los intervalos se pisan.
## 0.18.0 · El golpe se descubre (2026-11-21)

Paquete dictado por el Jurado Fable sobre la 0.17.0: más suspenso en el conteo, un solo número para el Tajo, el grito
que no tapa nada, la Vida que crece con cada Rey y la Steam Deck con la mano grande.

**El golpe**
- La vista previa encabeza con su veredicto cuando abatís: **LO ABATÍS**, **¡EXACTO!** o **¡AL PELO!** (este último con
  su propio contador en la Crónica); al soltar, la fórmula sube término a término y el total cae en oro y se asienta,
  con sonido y sacudida. El total, «LE QUEDAN n» y «SOBRAN n» se siguen leyendo antes de soltar.
- **Tajo de revés con una sola fórmula**: «TE PEGA 48 (24 ×2)» en el chip y en la placa del Rey, sostenida hasta que pega.
- El naipe del Rey ordena su centro por carriles: tu golpe arriba, el cartel del Rey al medio, lo que te pega abajo.

**Reglas**
- **Cada Rey vencido sube 12 tu Vida máxima** (el Botín lo muestra y el HUD lo cobra a la vista).
- **El Mentiroso**: Cara de Piedra (empieza cada combate con Escudo, ×2 y ×3 en los tramos 2 y 3) y Vida chica.
- **Un costo de Vida máxima siempre cuesta**: los pactos, la Cábala y Heridas viejas ya no la suben ni salen gratis con
  una Vida chica; nunca la bajan de la mitad.
- La Estocada del Caudillo cambia de nombre para no confundirse con el Contraataque; la moneda del Bufón va pareja (10/10).

**Mesa, mando y teléfono**
- El grito del Personaje dura 1,2 s y busca un hueco libre: nunca sobre Vida, Escudo, Oro, la cuenta, la mano ni botones.
- **Steam Deck**: naipes de la mano a 2×, ayuda del naipe al costado, cargas rotuladas, «+N» escalonados.

**Balance** (laboratorio, 3000 partidas por celda, sin avisos) · Altar vacío / lleno: Escoba 32,1 / 47,9 · Truco
30,5 / 48,3 · Chinchón 28,2 / 48,3 · Mentiroso 31,1 / 47,0 · Chancho 30,2 / 47,1.

**Jurado Fable** (sobre la versión anterior a los dos arreglos de cierre): Claridad 7,3 · Diversión 7,4 · Estética 8,0 ·
Veredicto 7,4. El arreglo del piso de Vida máxima (su P0) y la vuelta del total a la previa (su regresión de Claridad)
entraron después del dictamen.
## 0.17.0 · La cara verdadera (2026-11-21)

Paquete dictado por los P0 y P1 del Jurado Fable sobre la 0.16.0: el Rey en segunda cara pisando la cuenta, el Tajo de
revés que castigaba sin salida, los cuatro Comunes clones, el grito sobre los controles y las pantallas sin escena.

**Los Reyes, de verdad distintos a media Vida**
- **Cada Rey tiene un dibujo propio para su segunda cara**: el Caudillo con la espada invertida y la cicatriz, el Cacique
  tras una empalizada de estacas, el Caudal con la bolsa abierta y monedas cayendo, el Bacanal con la copa que rebalsa.
  El volteo, la mesa y la rajadura final muestran ese dibujo.
- **El Tajo de revés ya no castiga la Carta sola** (con mano de 3 a veces era la única jugada). Armado, la cifra grande del
  Rey muestra el golpe real con «×2», y la regla corta queda escrita bajo su nombre mientras dure.
- El rótulo y la barra del Rey ya no pisan la cuenta en ninguna ventana; la QA visual tiene una regla que lo vigila.

**Los Amuletos comunes, cada uno con su juego**
- Los cuatro suman Daño por carta de su palo (×2 en el tramo 2, ×3 en el 3) y cada uno tiene su segunda mitad: el
  **Cuchillo criollo** pega ×2 contra un enemigo a media Vida, el **Rebenque** da Escudo de más, la **Moneda falsa** suma
  +1 de Multi con tres Oros y el **Mate curado** cura de más. La Pulpería ya no ofrece dos Comunes juntos.

**Escenas**
- **Victoria** con amanecer sobre el arrabal y los Reyes vencidos partidos en dos; **derrota** con la vela apagada y tu
  retrato rajado; **Botín** con las piezas grandes sobre la mesa; **Ajustes** con el abanico de Dorsos; **Crónica** con el
  retrato de la última partida.

**Mesa, mando y teléfono**
- El grito del Personaje sale al costado del retrato y nunca encima de un modal ni de los botones.
- Cara de Póker es un sello sobre el enemigo («NO LLEGA») y el chip dice la causa: «NO TE PEGA · Cara de Póker».
- La caída del Rey arranca enseguida: la mano y los botones se retiran en el instante en que muere el último enemigo.
- Mapa con mando: la ayuda va al costado del nodo enfocado, «ESTÁS ACÁ» se ve y el foco se centra en el rollo.
- Las cargas de los Reyes en el HUD dicen qué hacen («Filo 9: +9 de Daño en cada golpe»).
- En el teléfono bajo (390×664) la placa de lo que te pega ya no trepa a la cabecera.

**Balance** (laboratorio, 3.000 partidas por celda, con las notas que se publican): Altar vacío / lleno — Escoba 32,8 / 48,8 ·
Truco 28,3 / 48,7 · Chinchón 28,0 / 48,1 · Mentiroso 28,1 / 48,7 · Chancho Va 28,8 / 47,2. Chinchón pasa a Vida 43 con +1
de Multi en cada golpe; el Mentiroso, a 3 Comodines.

**Medición.** Jurado Fable 7,4 · 7,3 · 8,0 · 7,4 (antes 7,3 · 7,2 · 7,9 · 7,3). Panel simulado de la 0.16.0 (n = 60, ruido
±10 puntos): aprobación 75,0 % (IC95 63–84 %), F 203,3 (+8,4), claridad 6,3.
## 0.16.0 · Cambiá de plan (2026-11-21)

Paquete dictado por los P0 y P1 del Jurado Fable sobre la 0.15.0: el conteo que tapaba su propio desglose (los seis
jurados), la Furia que parecía sumable, segundas caras que no pesaban, el audio sin bus y la mesa muerta antes del botín.

**La cuenta, de una sola lectura**
- **El conteo se enciende dentro del desglose.** No hay más cartel flotante: cada término se prende en su lugar y queda
  encendido; el total sube contando y cierra en oro. Los «+N» de los naipes salen dentro de la carta, sin tapar índices.
- **Dos renglones rotulados, DAÑO y MULTI**, cada pieza con su icono, y la cura como «CURA ♥ +N». El desglose se ve
  también en el teléfono (390×664 y 360×740), compacto, con iconos y valores.
- **La cuenta tiene marco** (hierro, dorado si abate) y el ancho de su fórmula, en vez de una franja negra de lado a lado.
- **La Furia no se suma dos veces:** TE PEGA lleva al lado un chip de llama «FURIA n · ya incluida · +n por turno».
  Un solo nombre para el golpe del enemigo: «TE PEGA» (adiós «Contraataque»).
- **Glosario en JUGADAS** (Multi, Furia, Escudo, Golpe exacto, ¡Al pelo!, Racha, segunda cara, Engaño) con los números
  reales del motor. La Escoba dice ×3 en todos lados (la regla decía ×2 y JUGADAS ×1).

**Segundas caras que obligan a cambiar de plan**
- **El Caudillo · Tajo de revés:** si repetís la jugada del golpe anterior, ese turno pega ×2 y atraviesa todo tu Escudo.
  TE PEGA lo avisa antes de soltar.
- **El Cacique · Fortín:** levanta un Escudo de un cuarto de su Vida máxima y lo recupera ×2; solo las Espadas lo atraviesan.
- **El Caudal · Remate:** cada vez que te pega se lleva un cuarto de tu bolsa (mínimo 6) y cada moneda es Furia.
- **El Bacanal · Última ronda:** se cura ×2 lo que vos te curás, y su cura por turno también va ×2.
- El volteo del naipe del Rey, cartel propio, sonido propio y rótulos sobre el Rey cuando cada cara dispara.
- «¡AL PELO!» vale también con Espadas en el golpe, y se cuenta en las estadísticas de la partida.

**Sensación**
- **Audio con bus maestro y compresor**, buses de efectos y música, ruido blanco para golpes y variación de altura.
  Sonidos propios para «¡AL PELO!», la segunda cara, el Tajo de revés, el remate, el Fortín, el Diezmo y el cobro.
- **La caída del Rey encadena con el botín:** la mesa se despeja, el oro vuela al HUD contando y el botín brota al
  centro; la elección «ELEGÍ UNA» reemplaza al panel en vez de montarse encima.
- **Letra de cuerpo nueva, Bitcount Prop Single:** pixel y proporcional. Se acabaron los «Caudi l lo» y «Vida l lena».

**Steam Deck, mando y teléfono**
- Con mando no hay zona de descarte: la mano usa ese ancho (la de 8 del Mentiroso entra sin cortes).
- La bandeja del HUD va en dos filas de fichas de 42 px entre 1100 y 1699 px; la que dispara brinca con su número.
- El daño recibido sale por encima de la Vida, sin taparla. En el teléfono el Bufón ya no pisa la cabecera, SEGUIR del
  Botín y del Fogón quedan en la zona del pulgar y se puede hacer zoom (sin `user-scalable=no`).
- Las secuencias del Jurado ahora van en español y con un recorrido en modo mando; estado nuevo de QA `mesa-segunda`.

**Balance** (laboratorio, 3.000 partidas por celda, certificado con las mismas notas internas que se publican):
Altar vacío / lleno — Escoba 32,7 / 47,0 · Truco 28,2 / 45,5 · Chinchón 30,9 / 46,7 · Mentiroso 29,0 / 48,5 (antes se
escapaba a 55,8) · Chancho Va 31,0 / 48,2. Vida de los Mazos: Escoba 80, Truco 96, Chinchón 63, Mentiroso 43, Chancho 90.

**Medición.** Jurado Fable 7,3 · 7,2 · 7,9 · 7,3 (claridad · diversión · estética · veredicto; antes 7,1 · 7,0 · 7,8 · 7,1).

## 0.15.0 · La segunda cara (2026-11-21)

Paquete dictado por los P0 y P1 del Jurado Fable sobre la 0.14.0: la defensa plana, los Reyes de una sola nota, el
Bufón sin dilemas y la letra chica en Steam Deck.

**Reglas y builds**
- **La defensa escala con el tramo.** El Escudo de los Bastos, la cura de las Copas y el tope de Escudo valen ×1, ×2
  y ×3 en los tres tramos: armar un mazo defensivo ya no es tirar cartas al final del Reinado. Para compensar,
  La Corte pega más en el segundo y el tercer tramo y los Mazos tienen más Vida.
- **Golpe al pelo.** Pasarse por muy poco (hasta el 5 % de la Vida del enemigo) no cobra el premio del Golpe exacto,
  pero sostiene la racha y recarga el Cetro. La cuenta lo canta: «¡AL PELO!».
- **Amuletos comunes que crecen con su Rey:** suman Daño por carta de su palo y, además, por cada punto de carga de
  ese Rey (con tope). Peaje y Contragolpe se disparan cuando frenás al menos la mitad del golpe.

**Los cuatro Reyes, con segunda cara**
- A media Vida cada Rey cambia: el de Espadas cobra Furia si repetís la jugada (Degüello), el de Bastos recupera todo
  su Escudo una vez (Empalizada), el de Oros duplica su Diezmo (Remate) y el de Copas se cura lo que vos te curás
  (Última ronda). Un cartel grande «SEGUNDA CARA» lo anuncia y el Rey lo dice.

**El Bufón chanta**
- **Tres Cábalas nuevas con dilema:** *El soplo* (pagás para que el próximo Rey llegue herido), *Mano larga* (le robás
  a La Corte un naipe templado, y te puede costar Vida) y *Firmar a ciegas* (un pacto que se lee después).
  La moneda y el doble o nada escalan con el tramo, y el Bufón ya no repite la misma frase cuando le decís que no.

**Steam Deck y portátil**
- **Ninguna letra por debajo de 18 px** entre 1100 y 1699 px de ancho (antes 16): cuerpo 20, rótulos 24.
- **Glifos del mando** en GOLPEAR, DESCARTAR, ENGAÑO, JUGADAS y la bandeja; el juego distingue puntero, teclado y
  mando y muestra los del que estás usando. Select abre JUGADAS, LT arma el Engaño, RT abre «Lo que llevás», LB/RB
  saltan entre mano y botones y la palanca derecha desplaza listas.
- **Todo lo del enemigo se inspecciona con la cruceta**, y sus números llevan rótulo: TE PEGA, FURIA, QUEDAN N,
  INMUNE A ESPADAS. El desglose de Daño y Multi vive en una línea fija bajo la cuenta.

**Móvil**
- **La mesa cede por alto:** en 390×664, 360×740 y con muesca entran enemigo, Vida, cuenta entera, mano y botones
  sin pisarse (consultas sobre el propio alto de la mesa). La mano mide una fila o dos según las cartas.
- **El arrastre avisa a dónde va:** esquinas que laten, «SOLTÁ ACÁ» visible y la cuenta siempre a la vista; un toque
  que resbala ya no borra la selección.
- La Pulpería lleva SALIR en la barra del pulgar y la Cábala usa todo el ancho.

**Medición** (simulada y con su ruido)
- Jurado Fable, media de los seis: Claridad 7,1 · Diversión 7,0 · Estética 7,8 · Veredicto 7,1 (0.14.0: 6,5 · 7,0 ·
  7,8 · 6,8). Defecto unánime para la próxima: el cartel del conteo tapa el desglose.
- Panel pulso-60: aprobación 71,7 % (0.14.0: 63,3 %; IC95 59–82 %), Móvil 86,7 %, Steam Deck 66,7 %, claridad 6,1.

## 0.14.0 · Cada pantalla, un lugar (2026-11-20)

Primera versión dictada por el **Jurado Fable**: seis especialistas (diseño, arte, Steam Deck, móvil, jugo y novato)
que miran las capturas y las secuencias de cuadros reales, puntúan de 1 a 10 y señalan tres defectos cada uno con
archivo y línea. Sus fichas están en `.claude/agents/`, el protocolo en `.claude/jurado/PROTOCOLO.md` y los veredictos
de cada versión en `jurado/`.

**Rendimiento**
- **Cero tirones, también en frío.** El cuadro de ~120 ms al brotar «ELEGÍ UNA» era la GPU compilando sus sombreadores
  la primera vez que pintaba el modal. Ahora, al entrar a la mesa y bajo la cortina, se pinta una vez casi invisible
  una oferta de cada tipo y los efectos que estrena el golpe. La puerta de FPS pasó de tolerar 80 ms por cuadro y
  250 ms en el cambio de pantalla a **50 ms en los dos**; mide 8–23 ms.

**Escenarios y clima**
- **La mesa** es de tablas, con vela, humo y un candil que salta con cada golpe. **La Pulpería** tiene estantes,
  damajuanas y un farol que se hamaca. **El Mapa**, luna, ranchos, molinos y niebla, y el camino andado se traza con
  tinta. **El Fogón**, leños, pava y un redondel de luz que respira.
- **Cada Rey trae su clima:** relámpagos y llovizna (Espadas), hojas y esporas (Bastos), monedas que caen (Oros) y
  bruma carmesí (Copas).

**El golpe**
- **Conteo pieza por pieza.** Después de las cartas dispara cada cosa que suma (la jugada, el canto, cada Amuleto,
  Cábala y Bendición): un cartel dice su nombre y cuánto pone, su ficha del HUD pega un brinco con el número, y el
  Daño y el Multi suben a la vista. Arranca despacio y acelera; el total aparece al final y tiene su instante.
- **Peso en tres escalones:** golpe, golpazo (media Vida o más) y remate. El hitstop ahora frena de verdad la mesa
  (60, 110 y 170 ms), la escena se sacude y el Golpe exacto que mata da un fogonazo dorado.
- **La caída de un Rey es una escena:** la música calla, fogonazo blanco, su última frase bajo el naipe, lluvia de
  monedas y fanfarria. El que sigue ya no entra encimado sobre la rajadura.
- **Los Reyes hablan en pelea:** se burlan cuando te lastiman de verdad y se quejan del golpazo.

**Presencia**
- **Tres gestos nuevos en los cinco retratos:** carcajada (Golpe exacto, Rey vencido), pavor (cuando quedás en las
  últimas) y guiño (al armar el Engaño), con el cuerpo acompañando.
- El Bufón reacciona con todo el cuerpo según su expresión, y el HUD ya no parpadea al cambiar de pantalla.

**Móvil: el dedo primero**
- Al arrastrar, el descarte es el propio botón DESCARTAR (ya no una franja cruzada en el camino al enemigo) y el naipe
  va por encima del dedo. Un gesto cancelado por el sistema devuelve las cartas sin jugar.
- JUGADAS entra entera en 390 px (antes se perdía la columna Multi). El Mentiroso tiene GOLPEAR a renglón entero y
  DESCARTAR + ENGAÑO debajo. Zonas seguras de iOS.

**Menores**
- En el Fogón, con la Vida llena, «Descansar» sale apagado.
- La QA visual suma dos reglas: panel que desborda a lo ancho y rótulo de botón cortado.
- Balance: Vida de Truco 81 → 79 y de El Chancho Va 89 → 87 (el laboratorio rozaba el techo por décimas).

**Medido**
- 61 pruebas, QA visual ES y EN sin fallos, humo, FPS con el tope nuevo. Laboratorio: 28,2–31,6 % con Altar vacío
  y 45,2–48,7 % con Altar lleno, sin avisos.
- **Jurado Fable** (media de seis, contra su propio veredicto de la 0.13.0): Claridad 6,3 → **6,5**, Diversión 6,5 →
  **7,0**, Estética 7,5 → **7,8**, Veredicto 6,5 → **6,8**. Lejos del 8,5 pedido. Juzgó antes del último arreglo del
  conteo (un cartel a la vez), que era la queja de los seis.
- **Panel simulado local** (una tirada): **mide peor.** Aprobación 63,3 % (venía de 76,7), Claridad 6,37, Diversión
  7,48, Steam Deck 66,7 %, Móvil 73,3 %, F 183,5 contra 200,7 del Campeón. Nueve votos bajan y dos suben
  (p = 0,065: no llega a significativo). Quienes bajaron repiten el texto chico en portátil y Steam Deck, que es
  también el defecto número uno del jurado de Deck y va en la 0.15.0.

**Pendiente, dicho por el Jurado**
- Texto de lectura a 16 px en Steam Deck y portátil; el mando sin glifos ni gatillos; la defensa del jugador no
  escala con el tramo; mano de 3 con pocas decisiones; la mesa del móvil no cede en pantallas bajas o con muesca;
  el botín sigue siendo un panel pobre; el sonido del golpe no acompaña el peso nuevo.

## 0.13.0 · Leer a 40 cm (2026-11-20)

Primera ronda de pulido por inspección de capturas y por lo que más repite el panel simulado.

- **Corregido:** la bandeja del HUD escondía fichas de más. Las cargas y las Bendiciones, que son de otra altura, se
  contaban como «segunda fila» y se iban al «+N» aunque hubiera lugar (venía de la 0.11.0).
- En portátil y Steam Deck los iconos de la bandeja van al doble (60 px): era la queja más repetida («los iconos de
  la barra de abajo no se leen a 40 cm», 33 menciones en 60 reseñas).
- El botón de descartar muestra cuántos descartes quedan en una cifra más grande y dorada.
- El número grande de la esquina del naipe ya no toca el borde.

**Medido**
- 61 pruebas, QA visual ES y EN sin fallos, humo, 60 fps. Reglas sin cambios (el laboratorio de la 0.12.0 vale).
- Panel simulado (una tirada contra una tirada): **Aprobación 76,7 %** y **Claridad 6,40** (las más altas medidas),
  Diversión 7,52, Críticos 40 %, Steam Deck 66,7 %, Móvil 86,7 %. F 199,7 contra 200,7 del Campeón: **empate**.

## 0.12.0 · Romper el juego (2026-11-20)

Las cinco reglas de adicción que pidió el dueño del proyecto.

**Piezas que rompen el juego** (el Multi sigue siendo entero: no hay ×1,5)
- **Cetro del Bufón**: el primer golpe pega ×3 y **cada Golpe exacto lo vuelve a cargar**.
- **Cascabel del Bufón**: los cantos valen doble y **cada canto deja +1 de Multi para el resto del combate**, sin tope.
- **Naipe de dos caras**: nada es Inmune y **las cartas del palo del enemigo pegan ×2**.
- **Vale Cuatro** pasa de +3 a **×2 de Multi**; **Falta Envido**, de ×2 a **×3**.
- Para sostener el balance, los enemigos del tramo 3 tienen un 2 % más de Vida y se reajustó la Vida de cuatro Mazos.
- **El Mentiroso** tiene un Engaño por combate, como siempre dijo su texto (el número interno decía dos).

**El Fogón, en tres pasadas**
- Primera, segura: +4 de Daño. Segunda (35 % de quemarlo): otros +4 y queda **Templada** (+1 de Multi al jugarla).
  Tercera (50 %): **¡FORJA BRAVA!**, su número vale doble en el Daño.

**Se entiende mirando**
- **JUGADAS por Mazo**: arriba, el canto de tu Mazo; después, solo las jugadas que entran en tu mano. Las que piden
  más cartas quedan plegadas detrás de un botón.
- **El Comodín** elegido se dibuja como la carta que copia, en dorado y con su destello.
- **La Furia** arde detrás de las espadas del Ataque: una, dos o tres llamas.

**Jugo**
- **Conteo en cadena**: al golpear, cada carta salta con su número y una nota que sube un semitono; después lo que
  multiplica, y el total vibra. Menos de medio segundo.
- **Racha encendida**: con dos Golpes exactos seguidos se encienden el marco de la mesa y el retrato, y la música
  suma palmas y un rasgueo más agudo.
- **Ojos vivos**: el retrato sigue con la mirada la carta que arrastrás y sonríe en cuanto tu selección marca un
  Golpe exacto.

**Medido**
- Laboratorio: 29,6–31,9 % con el Altar vacío y 46,0–48,6 % con el lleno; sin avisos. 61 pruebas.
- Panel simulado (una tirada contra una tirada): Aprobación 75,0 %, Críticos 55 %, Claridad 6,33, **Diversión 7,57**
  (la más alta medida; 7,45 el Campeón, p = 0,16), **Móvil 93,3 %** (cumple su meta), Steam Deck 55,6 % (5 de 9).
  F 200,6 contra 200,7 del Campeón: **empate**. Ninguna diferencia es significativa.

## 0.11.0 · Cirugía de composición (2026-11-20)

Pedido del dueño del proyecto tras su prueba de la 0.10.0: simetría, centrado y cero espacio muerto.

**El HUD, en tres zonas**
- A la izquierda Vida, Escudo y oro llenan su mitad; en el centro exacto, el retrato; a la derecha, el Mazo y una
  **bandeja de una sola fila** con tus Amuletos, Cábalas, cargas y Bendiciones. Lo que no entra no se apila ni se
  corta: se cuenta en un «+N». Tocar la bandeja abre «LO QUE LLEVÁS».

**Todo centrado**
- El Mapa va en el eje de la pantalla; el Bufón, a un costado, ya no lo corre.
- La Pulpería: el Bufón detrás de su mostrador, pegado a las bandejas; el grupo entero, centrado.
- Colección: los 5 Mazos en una fila; cada Rey muestra debajo su rasgo y su carga; la caja abraza lo que contiene.
- Portada: el Bufón a un lado del menú y la pila de Mazos al otro.
- Los bocadillos llevan marco de pixel-art con filete de oro. En Elegí tu Mazo, Altar, Colección, Crónica y Ajustes
  el Bufón va en la escena, bajo la cabecera, con lo que dice al lado (ya no flota en la esquina).

**Menos pantallas**
- El botín pasa sobre la mesa: el oro vuela al HUD, «ELEGÍ UNA» brota sola y, elegida la última, la partida sigue.
- Altar, Colección, Crónica y Ajustes comparten solapas: se pasa de una a otra sin volver a la portada.

**Steam Deck y portátil**
- Los naipes de la mano llevan el número de la esquina más grande (28 px) donde el naipe va a escala 1.

**Medido**
- 60 pruebas, QA visual ES y EN sin fallos (112 capturas cada una; estado nuevo `coleccion-reyes`), humo con 15
  comprobaciones, 60 fps. La puerta de FPS ahora mide la ráfaga de golpes hasta que termina el combate y, aparte, el
  cambio de pantalla que sigue (tope 250 ms): en frío, abrir «ELEGÍ UNA» sobre la mesa cuesta un cuadro de ~120 ms.
- Panel simulado (una tirada contra una tirada; capturas nuevas): Aprobación 75,0 % (75,0), Críticos 50 % (55),
  Claridad 6,30 (6,32), Diversión 7,48 (7,45), Steam Deck 66,7 % (88,9), Móvil 80,0 % (66,7). F 201,2 contra 200,7 del
  Campeón: **empate** (suben 4 pulgares y bajan 4). Sube 6,7 sobre la 0.10.0, sin significación.

## 0.10.0 · Con música y con voz (2026-11-20)

Pedido del dueño del proyecto: más animaciones, música y personajes con voz.

**Música**
- Cada lugar tiene su pista, sintetizada en el navegador (sin archivos): milonga en la portada, un paseo en el Mapa,
  corcheas que empujan en el combate, galope contra los Reyes, vals criollo en la Pulpería, una guitarra lenta en el
  Fogón, campanitas en la Cábala y el Altar, y un lamento en la derrota. Ocho pistas.
- Ajustes → «Música» la apaga sin apagar los efectos.

**Voces**
- Cada uno habla con su timbre: el Bufón, los cuatro Reyes (graves, cada uno distinto) y los cinco Personajes.
- El Rey habla al entrar y al ofrecer su Bendición: su frase se escribe letra por letra con su voz. Al caer dice su
  última frase antes de que se parta el naipe.
- Tu Personaje grita desde su retrato: el canto («¡ESCOBA!»), algunos Golpes exactos, los golpes que duelen, y le
  contesta al Rey cuando entra y cuando cae.

**Animaciones**
- El canto cruza la mesa en letras grandes.
- Las pantallas entran y sus opciones brotan una tras otra; el logotipo cae y rebota; los números del HUD laten al
  cambiar; el retrato salta al gritar.
- En el Mapa, el nodo que elegís late y los demás se apagan antes de entrar.
- El Fogón está vivo: suben brasas, el fuego se mueve, el naipe templado da un fogonazo con su «+4»; al arrimarlo otra
  vez tiembla sobre las llamas mientras sube el chisporroteo, y si se quema se parte en brasas y humo.

**Claridad**
- Las pantallas de la mesa que se fotografían para la QA y el panel muestran la mano real del Mazo (3 cartas en la
  Escoba). En el móvil esa mano va en una sola fila, con las cartas enteras.
- El nombre del canto y «GOLPE EXACTO» van más grandes en la cuenta.

**Medido**
- 60 pruebas (3 nuevas, de la música: las pistas están bien escritas y el canto entona). QA de humo con 15
  comprobaciones (música, ajuste de Música y voz de los Reyes). 60 fps con la música sonando. Reglas sin cambios.
- Panel simulado (una tirada contra una tirada; capturas nuevas): Aprobación 71,7 % (75,0), Críticos 50 % (55),
  Claridad 6,15 (6,32), Diversión 7,47 (7,45), Steam Deck 66,7 % (88,9), Móvil 80,0 % (66,7). F 194,5 contra 200,7 del
  Campeón y 183,6 de la 0.9.0. **Empate dentro del ruido** con el Campeón (ninguna diferencia es significativa);
  recupera 11 puntos sobre la 0.9.0. El panel lee textos y fotos quietas: **no oye la música ni ve las animaciones**,
  así que esta versión hay que juzgarla jugando.

## 0.9.0 · Manos de verdad y Fogón de riesgo (2026-11-20)

Dos decisiones del dueño del proyecto.

**Cada Mazo, con la mano de su juego**
- Escoba y Truco juegan con 3 cartas, Chancho Va con 4, Chinchón con 7 y Mentiroso con 8, como en la mesa de verdad.
- Las manos cortas llevan Multi de más en todos sus golpes (Escoba +4, Truco +3, Chancho Va +4): golpean menos cartas,
  pero cada golpe pesa. Las manos largas arman las jugadas grandes (Escalera, Póker).
- La tabla de JUGADAS pone en gris las jugadas que piden más cartas que tu mano.
- **Vale Cuatro** ahora premia golpear con toda tu mano (o con 5 cartas): sirve a los cinco Mazos.

**El Fogón es una apuesta**
- «Templar un naipe»: la primera pasada por el fuego es segura y le da +4 de Daño para siempre (lleva su marca en la
  mano y en el visor del Mazo).
- «Arrimar otra vez»: otros +4, con 50 % de riesgo de que se queme y salga del Mazo. Hasta 3 pasadas por Fogón.
- Descansar sigue curando el 30 % de la Vida. Ya no se quema un naipe a elección: ahora se quema el que arriesgás.

**Medido**
- Laboratorio: 29,9–30,5 % con el Altar vacío y 45,0–48,1 % con el lleno, los cinco Mazos dentro de la banda; sin
  avisos. 57 pruebas.
- Panel simulado (una tirada contra una tirada; capturas nuevas, así que entra el ruido del auditor visual):
  Aprobación 70,0 % (75,0), Críticos 35 % (55), Claridad 6,03 (6,32; p = 0,06), Diversión 7,45 (7,45), Steam Deck
  55,6 % (88,9), Móvil 86,7 % (66,7). F 183,6 contra 200,7. **No mejora y la Claridad baja al borde de lo
  significativo.** Se publica por decisión del dueño del proyecto; la causa que se pudo ver se corrige en la 0.10.0
  (las capturas de la mesa mostraban una mano de 5 por un Aumento, contra la regla de 3 que cuentan las escenas).

## 0.8.0 · El Golpe exacto, protagonista (2026-11-20)

(La 0.7.0 fue una candidata que no superó el listón: sacar los Comodines de los Mazos iniciales y dejar la Furia solo
en los Reyes empeoraba las reseñas. No se publicó.)

**Reglas**
- **Racha de exactos**: cada Golpe exacto seguido sube el premio del siguiente golpe (+1, +2 y +3 de Multi, que es el
  tope). Se corta al abatir a un enemigo sin exactitud. Se ve arriba a la izquierda («RACHA ×2»).

**Interfaz**
- La cuenta dice cuánto le queda al enemigo («le quedan 64») o cuánto te sobra («CAE · sobran 12»): buscar el exacto
  es un cálculo a la vista.
- En reposo, el centro de la mesa dice qué hacer: «Elegí cartas y arrastralas al enemigo».
- «DESCARTAR (3)» en una sola línea. La tira del HUD muestra solo lo que llevás (sin cuadros vacíos).
- A 1080p la mano usa todo el ancho (la zona de descarte aparece al arrastrar). Los caminos del Mapa se ven más.
- **Corregido:** en el móvil la Vida máxima se cortaba en el HUD («42/6» por «42/61»); venía de la 0.6.0.

**Medido**
- Laboratorio: 29,6–32,7 % con el Altar vacío y 45,2–48,3 % con el lleno; sin avisos. 54 pruebas.
- Panel simulado (una tirada contra una tirada, mismo instrumento): Aprobación 71,7 % (75,0), Críticos 30 % (55),
  Claridad 6,38 (6,32), Diversión 7,50 (7,45), Steam Deck 66,7 % (88,9), Móvil 80,0 % (66,7). F 192,8 contra 200,7:
  **dentro del ruido del instrumento** (ninguna diferencia es significativa; suben 3 pulgares y bajan 5). Se publica
  por decisión del dueño del proyecto de avanzar hasta la 0.10.0 y porque corrige un error del móvil.

## 0.6.0 · El Bufón vivo y el Mapa que sube (2026-11-20)

Tres decisiones del dueño del proyecto, más un pulido guiado por la auditoría visual. (Las 0.4.0 y 0.5.0 fueron
candidatas que no superaron el listón: no se publicaron. Ver `MEMORIA_EVOLUTIVA.md`.)

**El Bufón vivo**
- Te sigue pantalla por pantalla: al cambiar de pantalla se esfuma en una nube de humo (con su «puf») y reaparece en
  la siguiente (con su cascabel). Está también en Mazos, Altar, Colección, Crónica y Ajustes, asomado en la cabecera.
- Se mueve todo el tiempo: flota, respira, mece el palo y parpadea.
- Cuando habla, el bocadillo se escribe letra por letra con su voz, se queda un rato y se va. Reacciona a lo que hacés
  (elegir, saltar, comprar, descansar, quemar, mejorar en el Altar) y, si lo dejás solo, cada tanto dice algo.
- En la Pulpería va grande, centrado en su mitad, con el texto debajo. En el resto de las pantallas, también con el
  texto debajo.

**El Mapa**
- Vertical en todas las pantallas: se sube desde abajo hasta el Rey y se desplaza hacia arriba y hacia abajo.
- Red irregular: seis pisos por tramo, de 1 a 5 lugares por piso y hasta tres caminos por lugar. Ya no hay siempre
  tres opciones (hay 2, 3, 4 o 5 entradas) y ninguna forma se repite.
- El azar tiene reglas de balance, vigiladas por pruebas sobre cientos de semillas: se empieza con una Guardia; el
  último piso es Fogón o Pulpería; la Guardia Brava no aparece antes del piso 3 y siempre se puede esquivar; nada que
  no sea una Guardia se repite pegado; una bifurcación nunca ofrece dos veces lo mismo; y cualquier recorrido tiene
  entre 3 y 5 combates antes del Rey.
- La Corte se recalibró para el Mapa nuevo (un piso más y descanso asegurado antes de cada Rey).

**Sin tiers**
- Las piezas ya no enseñan `S / A / B`: se eligen por lo que hacen. Queda la etiqueta `★ SINERGIA` con su línea. La
  nota del laboratorio pasa a ser interna (la usa el bot que certifica el balance).

**Pulido guiado por la auditoría visual**
- «DESCARTAR» dice «quedan N» en claro y con aire. La tira del HUD respira. A 1080p la mano entera queda a la vista.
- El Comodín lleva su nombre en el naipe. La marca de Inmune va al pie de la carta y no tapa el dibujo.
- El texto de las tarjetas va sobre una placa lisa y la trama de fondo es más rala. Más aire entre renglones en
  bocadillos, en la tabla de JUGADAS y en «LO QUE LLEVÁS». El visor del Mazo muestra los naipes a escala entera.
- «SEGUIR» con marco claro cuando no es la acción principal. Los niveles del Altar que faltan se distinguen.

**Medido**
- Laboratorio: 29,7–32,5 % con el Altar vacío y 45,3–48,3 % con el Altar lleno; sin avisos. 14–17 minutos por partida.
- Puertas: 53 pruebas (dos nuevas para el Mapa y una que vigila que no vuelvan los tiers), QA visual ES y EN (108
  capturas, 0 fallos), humo con una comprobación nueva del Bufón, 60 FPS.
- Panel simulado (`pulso-60`, las dos con el mismo instrumento): Aprobación 75,0 % (Campeón 66,7), Críticos 55 % (40),
  Claridad 6,32 (6,30), Diversión 7,45 (7,43), Steam Deck 88,9 % (88,9), Móvil 66,7 % (66,7). F 200,7 contra 181,5.

## 0.3.0 · La mano se lee de un vistazo (2026-11-20)

**Hipótesis.** Lo que más bajaba el pulgar en el móvil y en Steam Deck era no reconocer las cartas ni ver dónde está
el foco; y en todas partes, no saber qué copia el Comodín.

**Interfaz**
- **Móvil: la mano va en dos filas.** Ninguna carta tapa de costado a otra; de las de atrás asoma la parte de arriba,
  con su número y el comienzo de sus pintas. El naipe del enemigo asoma por detrás de su barra de Vida para hacerle
  lugar.
- **El Comodín muestra lo que copia**: al elegirlo con otras cartas, lleva arriba el número y el palo. Lo mismo con el
  Engaño de El Mentiroso.
- **Foco del mando y del teclado**: marco claro, halo dorado y la carta enfocada un punto más grande. Al entrar a un
  combate con mando, el foco va solo a la mano.
- Botones de 48 px o más. «DESCARTAR» dice debajo cuántos quedan («quedan 3»). Las cifras de Vida del enemigo van
  sobre una placa oscura. Más aire entre las líneas del bocadillo del Bufón.
- Reglamento: Inmune y Furia redactados en una frase cada uno; el Comodín dice que necesita otra carta a su lado.

**Puertas**
- Dos estados nuevos con el foco a la vista (`mesa-mando`, `mapa-mando`): 108 capturas por idioma, 0 fallos. La QA
  visual mide ahora las filas de la mano y el foco (marco, halo, escala).

**Medido**
- Laboratorio: sin cambios de reglas (el informe de la 0.2.0 sigue vigente).
- Panel simulado (`pulso-60`, una tirada contra la media de tres del listón de la 0.2.0): Aprobación 76,7 % (63,3),
  Críticos 50 % (30), Claridad 6,28 (6,32), Diversión 7,45 (7,34), Steam Deck 77,8 % (59,3), Móvil 80,0 % (71,1).
  F 204,98 contra 177,24.

## 0.2.0 · La mesa se toca y se entiende (2026-11-20)

**Hipótesis.** Las reseñas bajaban por fricción de lectura y de toque, no por el diseño: si cada cosa que se toca mide
lo que debe y cada regla que se aplica se ve en la mesa, sube la Claridad.

**Reglas**
- Una regla menos: los Oros pagan oro y nada más (fuera la salpicadura al enemigo que espera).
- Chinchón sube a 63 de Vida y Chancho Va a 57 (los sellos se volvieron a medir y el balance se recertificó).

**Interfaz**
- **Tabla de JUGADAS** en la mesa (botón «?» o tecla J): las jugadas con su Daño y su Multi, la que tenés elegida
  resaltada, lo que hace cada palo, la regla de Inmune y la del Comodín.
- **«LO QUE LLEVÁS»**: la tira de iconos del HUD es ahora un solo botón que abre la lista de tus Amuletos, Cábalas,
  cargas y Bendiciones con el texto entero de cada una. Antes eran iconos de 32 px pegados entre sí.
- Las cartas a las que el enemigo es **Inmune** se oscurecen en tu mano y llevan el escudo tachado.
- **Letra de texto nueva** (DotGothic16): en la anterior el «5» se leía como una «S» y el «2» casi como un «8».
- El audio se abre con el primer clic del jugador: abrirlo al primer sonido dejaba un tirón en el primer golpe.
- Reglamento: la Furia con sus dos cifras, el Comodín sin ambigüedad.

**Puertas**
- La QA visual mide ahora lo que de verdad se puede tocar y falla por diana chica (menos de 44 px), pegada (a menos
  de 8 px) o pisada. Dos estados nuevos (`jugadas`, `piezas`): 100 capturas por idioma, 0 fallos.

**Medido**
- Laboratorio: 29,9–32,6 % con el Altar vacío y 45,0–48,7 % con el Altar lleno; sin avisos.
- Panel simulado (`pulso-60`, una tirada contra la media de tres del listón de la 0.1.0): Aprobación 60,0 % (45,6),
  Claridad 6,37 (5,98; p = 0,009), Diversión 7,33 (7,31), Críticos 30 % (30), Steam Deck 44,4 % (40,7), Móvil 66,7 %
  (53,3). F 169,07 contra 145,84. El ruido entre dos tiradas del mismo juego es de unos 13 puntos de F.

## 0.1.0 · Fundación (2026-11-19)

Primera versión de CÁBALA, en repo propio (`ifbotech/cabala`). Del proyecto anterior solo se trajo el chasis sano: el
núcleo determinista de la baraja española, la forja de pixel-art y las herramientas. Todo lo demás es nuevo.

**Reglas**
- Baraja española pura: tu Mazo va del 1 al 9 con Comodines (que copian tu carta más alta); la Corte —Sota, Caballo y
  Rey— son los enemigos, uno a la vez. `TOTAL = DAÑO × MULTI`, siempre enteros. Nueve jugadas (Carta sola, Par, Doble
  par, Flor, Pierna, Escalera, Full, Escalera de palo, Póker).
- Cada palo hace lo suyo: Espadas perforan, Bastos dan Escudo, Oros pagan y salpican, Copas curan. Cada enemigo es
  Inmune a su propio palo.
- 5 Mazos con su Personaje: Escoba (La Barrendera), Truco (El Paisano Bravo), Chinchón (La Timbera del Club), El
  Mentiroso (El Chamuyero) y Chancho Va (El Manotazo). Escoba y Truco, abiertos desde el principio.
- 4 Reyes vivos (El Caudillo, El Cacique, El Caudal, El Bacanal): 12 Bendiciones con tres niveles, 6 Pactos Duales y
  una carga por Rey con una sola regla para los cuatro. Cada Rey es además el jefe de un tramo, con su rasgo.
- El Bufón, único anfitrión: 18 Aumentos pasivos en tres niveles (Plata, Oro, Prismático con Maldiciones), 10 Cábalas
  en el Mapa y un humor que cambia cómo te trata.
- Exactamente 15 Amuletos (3 por palo y 3 Legendarios del Bufón), con sello S / A / B medido en el laboratorio.
- Mapa de tres tramos con caminos que se bifurcan (Guardia, Guardia Brava, Pulpería, Cábala, Fogón, Rey).
- Altar de 7 mejoras directas; 8 Reinados.
- Fuera, sin rastro: Sellos de Lacre, Acabados, la Manga, cartas especiales en la mano, el Tratante, el Asalto Diario,
  la Partida Guiada, el cooperativo y la toponimia medieval.

**Arte e interfaz**
- «Dark Dithered Lithography»: todo forjado por código, sin una sola imagen. Naipes con solo el número en las esquinas
  (sin mini-palo), 5 Personajes de 19 cuadros cada uno, marcos de 9 trozos, cifras dibujadas, logotipo.
- HUD inferior con el retrato vivo del Personaje, Vida, Escudo, oro, Mazo y las tiras de Amuletos, Cábalas y cargas.
- Mesa centrada: enemigo sobre el paño, Bufón que comenta, pila de la Corte, cuenta `DAÑO × MULTI = TOTAL`.
- Arrastrar y soltar para golpear y descartar, más clic, teclado y mando.
- Efectos en Canvas con doble buffer (color y luz): candil, brasas, tajo de cada palo, *hitstop*, números con gravedad,
  el naipe enemigo que se raja en dos, monedas al HUD, irrupción de los Reyes.
- Español e inglés.

**Medido**
- Laboratorio (6.000 partidas por celda): los 5 Mazos ganan 29,1–32,7 % con el Altar vacío y 45,7–48,0 % con el
  Altar lleno; el Reinado 8, 16,9–19,5 %. Partida ganada: 14–17 minutos estimados.
- Puertas: 51 pruebas, linter de pixel-art limpio, QA visual en 4 ventanas y 2 idiomas (184 capturas, 0 fallos), QA de
  humo con una partida entera por la interfaz en los dos idiomas, 60 FPS.
