# BITÁCORA DE CALIDAD · CÁBALA 3D: LA PULPERÍA Y EL SOL DE MAYO

Registro vivo del Estudio Autónomo. Cada versión se audita con lupa adversarial sobre capturas reales en PC (`1920×1080`, `1920×920`, `1366×768`), Steam Deck (`1280×800`) y Móvil (`390×844` / `390×664`), sin auto-aprobación mientras exista **un solo** defecto visual, de solape, recorte o modelo plástico.

---

## Mapa de los 4 Pilares

| Pilar | Alcance | Estado |
| :--- | :--- | :--- |
| **A. Cohesión Visual *Dark Dithered Pixel-3D*** | Rediseño del Bufón 3D estilo *Leshy*/*COMODÍN*, cero parches 2D flotantes, cero textos cortados/solapados, materiales 3D tramados en Bayer (`NearestFilter`), cierre de brecha desktop `1700px+` | **Completado (`v0.43.0`)** |
| **B. Mundo 3D Vivo — «La Pulpería»** | Menú 3D caminable en primera persona (`WASD`/Stick/Clic) con *head-bob*, 6 rincones interactivos (Mesa del Bufón, Altar, Pared de la Gloria, Fogón, Fonógrafo/Crónica, Puerta Doble con resplandor) + accesos rápidos 1 clic | **Completado (`v0.44.0`)** |
| **C. Clímax Argentino — «El Camino al Sol de Mayo»** | Puerta doble abierta en el clímax del Tramo 3, empedrado porteño nocturno entre niebla, faroles, banderines celestes y blancos, arcos de naipes españoles, Sol de Mayo colosal *dithered*, Mesa de la Gloria y Carta de Gloria clavada en la pared | **Completado (`v0.45.0`)** |
| **D. Pulido Artesanal Total y Doble Auditoría Limpia** | Física táctil de cartas, expresividad completa del elenco y **2 Auditorías Adversariales consecutivas con 0 defectos**, `CLS = 0`, `≥ 60 FPS`, ES/EN verdes en vivo | **Completado (`v0.46.0`)** |
| **E. Navegación Discreta *Inscryption*, Bufón Esculpido y Fix de Mesa** | Navegación 3D por nodos discretos (`▲/▼/◀/▶` + `WASD`), rediseño total del Bufón 3D con rostro esculpido y colas curvas, fix de listeners filtrados al combate | **Completado (`v0.47.0`)** |
| **F. El Palacio del Rey (*Pokémon* Top-Down)** | Reemplazado por decisión de UAT (`v0.49.0`): eliminado para dar lugar a «La Mano contra el Bufón» 3D | **Eliminado (`v0.49.0`)** |
| **G. Bufón 3D Cuerpo Vivo, Mirada, Reyes en Naipe y Tablón 3D** | Cuerpo completo articulado, mirada calibrada al centro, cero Bufón 2D, Mapa sin flechas, Reyes Malvados en naipe `12` y 8 placas de Amuletos/Cábalas en La Pared de la Gloria | **Completado (`v0.49.0`)** |
| **H. Reyes Malvados 3D saliendo de la Carta + Poderes VFX** | Figuras 3D de los 4 Reyes saliendo del naipe `12` con corona, arma de palo y VFX propios (tajos cian, estacas esmeralda, lluvia de monedas, bruma carmesí) | **Completado (`v0.50.0`)** |
| **I. La Mano contra el Bufón + La Bendición del Bufón** | Duelo 3D de mesa antes de cada Rey Jefe jugando 1 mano auténtica del Mazo actual (Truco, Escoba, Chinchón, El Mentiroso, Chancho Va) para ganar La Bendición del Bufón | **Completado (`v0.51.0`)** |
| **J. Intro 3D por Mazo, Tarjetas 0,2 s y Descarte Táctico** | Intro animada en 3 golpes por Personaje, fichas icónicas de lectura en 0,2 s para Amuletos/Cábalas/Bendiciones, cabecera de reglas por Mazo en `? JUGADAS` y descarte táctico multi-carta; doble Auditoría Adversarial limpia | **Completado (`v0.52.0`)** |
| **K. Elenco Voxel 3D con AO Horneado y Reyes sin Naipe 12** | Motor `voxel.ts` con AO por vértice; 4 Reyes, Bufón y 5 Héroes en Voxel 3D; cero cartas `12` en combate, La Corte, Pared de la Gloria 3D y Final; fix `.pano-regla.costado` | **Completado (`v0.53.0`)** |
| **L. Dark-Dithered Pixel-3D & Intro 3D Abierta (Rev. 1/5)** | `voxel.ts` con sombras violáceas `#120a24`, Bayer 4×4 3D y primitivas orgánicas; escenario 3D abierto en `intro-mazo` verificado en `1920×1080`, `1280×800` y `390×844` | **Completado (`v0.54.0`)** |
| **M. Bufón y 5 Héroes Dark-Gothic 2× (Rev. 2/5)** | Reconstrucción a `V = 0.018` sin bloques *Minecraft*: máscara veneciana de tarot, cuernos orgánicos, paleta oscura de `paleta.ts`, 5 Héroes estilizados | **Completado (`v0.55.0`)** |
| **N. 4 Reyes Malvados Dark-Gothic 2× (Rev. 3/5)** | Reconstrucción a `V = 0.017` de los 4 Reyes Jefe con armas/coronas orgánicas, paleta regia oscura, jerarquía de escala sobre el Bufón y 0 recorte en `1920`/`1280`/`390` | **Completado (`v0.56.0`)** |
| **O. Artesanía 3D de La Pulpería (Rev. 4/5)** | Nuevas texturas pixel-art (`texturaPaginaCronica`, `texturaVinilo`, `texturaMantelAltar`) y modelos 3D detallados para Altar, Crónica y Fonógrafo verificados en los 5 rincones | **Completado (`v0.57.0`)** |
| **P. Pulso 3-3-2 y detalles finales 3D (Rev. 5/5)** | Sincronización de `Bufon3D`, `Reyes3D` y `Heroes3D` al pulso `3-3-2` (`armoniaActual()`), bocina del Fonógrafo orientada al jugador, llamas animadas en Crónica/Altar y QA visual ES/EN completo | **Completado (`v0.58.0`)** |
| **Q. Cirugía de Reglas, Balance y Duelo (Rumbo a `v1.0.0`, 1/5)** | Comodín inteligente, `4+1` póker, `valorCarta()` protector de Bravas, `al pelo` preciso, Pactos Duales y economía ajustados, Reinados 6–8 proporcionales/tácticos, agencia real en `dueloBufon.ts` y `analyze:meta` certificado con **0 avisos** | **Completado (`v0.60.0`)** |
| **R. UX, Simpleza Radical e i18n Completa (Rumbo a `v1.0.0`, 2/5)** | `chips.ts` sin truncamientos ni códigos `/S/C/D/H` y colores semánticos, `dueloBufon.ts` 100 % ES/EN + foco, `modalMenu` con ajustes rápidos y reinicio, `cabala-negra` despejado, `inert` en modales y limpieza de mesa/mapa móvil | **Completado (`v0.70.0`)** |
| **S. Game Feel AAA, Coreografía 3D y Pulso (Rumbo a `v1.0.0`, 3/5)** | Conteo sin desfase, hitstop 2D/3D limpio, adiós Rey zombi 3D y Segunda Cara 3D con onda, Cantos/Exacto/Evolución/quiebre de Escudo, Fogón 3D reactivo, fase `'revelando'` en `dueloBufon.ts` y clímax musical en Sol de Mayo | **Completado (`v0.80.0`)** |

---

## Auditoría Adversarial #0 (Baseline `v0.42.0` + UAT Humano)

1. **Bufón 3D plástico:** La máscara veneciana de la `v0.42.0` lucía como un óvalo/huevo liso con luz frontal plana que desentonaba con el *Dark Dithered Pixel Art* del `COMODÍN` y los 5 Dorsos.
2. **Parches 2D flotantes:** En resoluciones reales de navegador (`1920×920`, `2560×1320`) reaparecía el óvalo violeta 2D `.e-pano` flotando debajo del enemigo, y en Pulpería quedaba la barra 2D `.pul-bufon::after`.
3. **Brecha en media queries (`1700px+` con altura `< 950px` o `> 1250px`):** Dejaba ventanas de escritorio reales (`1920×920`) con cartas `1×` y textos de la izquierda encimados al mazo 3D.
4. **Solape sobre `LA CORTE`:** En `1920×1080` con mando (`mesa-mando.png`), el botón `SEL JUGADAS` tapaba la esquina derecha de `LA CORTE`, y `TAPA_NUNCA` en `ui.ts` no protegía `.mesa .corte`, `.mesa .esc-tit` ni `.mesa .pano-regla` de los tooltips.
5. **Borde izquierdo y materiales 3D:** Textos de la izquierda pegados al borde (`x = 4px` / `8px`) y vela/monedas 3D con cilindros lisos sin tramado Bayer.

---

## Auditoría Adversarial #1 (`v0.43.0` — Cirugía Visual Total)

Verificada sobre capturas reales en `1920×1080`, `1920×920`, `2560×1320`, `1366×768`, `1280×800` y `390×844`:
1. **Cero parches 2D flotantes:** `.e-pano` y `.pul-bufon::after` eliminados en `html.modo-3d` en todas las resoluciones.
2. **Cero brechas de escritorio:** `1920×920` y `2560×1320` verificados con cartas `2×` y cero solape sobre el mazo/monedas 3D.
3. **Cero solapes sobre `LA CORTE`:** `margin-left: -32px` en `.mesa .corte`, padding en `.mesa-top .btn` y exclusión explícita de `.mesa .corte`, `.mesa .esc-tit` y `.mesa .pano-regla` en `TAPA_NUNCA` (`ui.ts`).
4. **Cero textos cortados en borde izquierdo:** margen mínimo `18 px` y respaldo oscuro legible en `.pano-regla.costado`, más `x = 14` en `desglose.ts`.
5. **Cero plástico 3D:** Bufón tallado en claroscuro Bayer estilo *Leshy*, vela con `texturaCera`, palmatoria/cascabeles con `texturaLaton` y monedas octogonales con `texturaOroMoneda`.

## Auditoría Adversarial #2 y #2b (`v0.44.0` — La Pulpería 3D Explorable)

- **Hallazgos de #2 (corregidos antes de publicar):**
  1. La pared trasera plana de `pulperia.ts` (`z = -5.8`) ocluía `La Puerta Doble`, `La Pared de la Gloria` y `El Fogón` al caminar: agrupada en `grupoParedPlana` y `grupoTableroGrande`, ocultos cuando `pantalla === 'explorar'`.
  2. Props del cuarto filtrándose detrás del Bufón en `portada`: `enCuarto` restringido a `nom === 'explorar'`.
  3. Baliza sobredimensionada en primeros planos: reducida a `0.055` y oculta automáticamente al acercarse (`dist < 4.6`).
  4. Botón huérfano en `.explorar-barra` y barra superior amontonada: `width: 100%` en `.explorar-top`, `flex-wrap: nowrap` y `min-height: 44px` en escritorio.
- **Verificación #2b sobre 10 capturas frescas (`portada` 1920/1280/390 + `cuarto-vista`, `cuarto-1280`, `cuarto-altar`, `cuarto-gloria`, `cuarto-puerta`, `cuarto-fogon`, `cuarto-390`):** 0 recortes, 0 solapes, 7 botones en una sola fila en `1920×1080` y `1280×800`, 0 desborde horizontal, más suavizado Bayer (`texturaHalo()`) en el haz vertical de `La Puerta Doble`.

## Auditoría Adversarial #3 y #3b (`v0.45.0` — El Camino al Sol de Mayo y Cartas de Gloria)

- **Hallazgos de #3 (corregidos antes de publicar):**
  1. Cabecera y botón duplicado en `sol-de-mayo` recortándose en `390×844`: unificado en un solo botón inferior `grande` con `max-width: 100%`.
  2. Chip de `CARTA DE GLORIA` en `fin-victoria` desbordando `fin-panel` en `390×844`: agregado `.fin-gloria-chip { white-space: normal; max-width: 100%; }`.
  3. Naipes frontales en sombra azulada y corona trasera octogonal: agregada `PointLight` cálida en el primer arco y `Sprite` circular Bayer con `texturaHalo()`.
  4. Cartas de Gloria debajo del marco de La Pared de la Gloria: tablero ampliado (`5.2 × 3.85`) con 3 filas integradas dentro del marco de latón y tachuelas doradas; festones laterales despejando el rostro del Sol de Mayo.
- **Verificación #3b:** `sol-1920`, `sol-1280`, `sol-390`, `cuarto-gloria-cartas`, `fin-victoria-gloria` y `fin-victoria-390` sin recortes, sin solapes y sin desborde.

## Auditoría Adversarial #4 y #4b (`v0.46.0` — Pulido Artesanal Total)

- **Hallazgos de #4 (corregidos antes de publicar):**
  1. Al entreabrirse `La Puerta Doble` (`abierta=1`), las aldabas quedaban desfasadas del marco: reconstruida con 3 vigas reales de marco, portal celeste-dorado en el vano y pivotes en bisagras reales (`pivotePuertaIzq` / `pivotePuertaDer`).
  2. Reglas del costado en `1920×920`: agregado aire vertical (`translateY(-28px)`) para despejar el borde superior de las cartas.
- **Verificación #4b:** `audit4b-cuarto-puerta-abierta`, `audit4b-cuarto-vista`, `audit4b-mesa-1920x920` y `audit4b-sol-1920` limpias.

## Auditoría Adversarial #5 (2.ª Pasada Consecutiva Limpia — GPU D3D11 Real)

- **Verificación consecutiva #5 (`2560×1320`, `1920×920`, `1920×1080`, `1280×800`, `390×844`):** **0 recortes, 0 solapes, 0 parches 2D flotantes, 0 modelos plásticos**, `CLS = 0`, `130.7–134.0 FPS` (`0 cuadros > 50 ms`), `592/592` capturas `qa:visual` ES/EN con `0 fallos`, `secuencias` 1280/390 sin solapes y `163/163` pruebas en verde.

**Estado del Estudio:** Los 4 pilares (A, B, C y D) completados, auditados en doble pasada consecutiva sin defectos y publicados en vivo en https://ifbotech.github.io/cabala/.

## Auditoría hacia v1.0.0 (`v0.60.0` → `v0.90.0`)

- **`v0.60.0` (Reglas y Balance):** `valorCarta()` centralizado, Comodín inteligente (`escalera`, `escalerapalo`, Escoba `15`, `poker`/`pierna`/`full`), `alPelo` ampliado, Pactos Duales y Duelo del Bufón con agencia real (`0` avisos en `analyze:meta`).
- **`v0.70.0` (UX, i18n y Ergonomía):** `chips.ts` unificado ES/EN sin recortes, foco atrapado con `inert` en modales, Ajustes rápidos en partida y limpieza de listeners.
- **`v0.80.0` (Game Feel AAA y Rendimiento):** Conteo `DAÑO × MULTI` sincronizado, `hitstop` 2D/3D unido, `texturaNaipeMitad` sin bloqueo y precompilación WebGL (`159–164.8 FPS`, `peor cuadro <= 49 ms`).
- **`v0.90.0` (Progresión, Guardado, PWA y QA 1.0):** `sanearPerfil`, Exportar/Importar JSON, `vendor-three` split, 6 Cartas de Gloria sin spoilers, sellos `★ n/8`, Semilla del día, Crónica 20 partidas con `Repetir`, `qa:estabilidad` en `puertas.mjs` y 4 estados nuevos en `ESTADOS` (`624/624` capturas `qa:visual` ES/EN con `0` fallos).
- **`v1.0.0` (Certificación de Lanzamiento):** Todas las puertas (`npm run puertas -- --sin-lab`: `typecheck`, `forja`, `pixel-lint`, `docs`, `test`, `qa:visual` ES/EN, `qa:smoke` ES/EN, `qa:audio`, `qa:fps`, `qa:estabilidad`, `build:web`) certificadas en verde para despliegue en `https://ifbotech.github.io/cabala/`.
