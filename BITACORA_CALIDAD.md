# BITÁCORA DE CALIDAD · CÁBALA 3D: LA PULPERÍA Y EL SOL DE MAYO

Registro vivo del Estudio Autónomo. Cada versión se audita con lupa adversarial sobre capturas reales en PC (`1920×1080`, `1920×920`, `1366×768`), Steam Deck (`1280×800`) y Móvil (`390×844` / `390×664`), sin auto-aprobación mientras exista **un solo** defecto visual, de solape, recorte o modelo plástico.

---

## Mapa de los 4 Pilares

| Pilar | Alcance | Estado |
| :--- | :--- | :--- |
| **A. Cohesión Visual *Dark Dithered Pixel-3D*** | Rediseño del Bufón 3D estilo *Leshy*/*COMODÍN*, cero parches 2D flotantes, cero textos cortados/solapados, materiales 3D tramados en Bayer (`NearestFilter`), cierre de brecha desktop `1700px+` | **Completado (`v0.43.0`)** |
| **B. Mundo 3D Vivo — «La Pulpería»** | Menú 3D caminable en primera persona (`WASD`/Stick/Clic) con *head-bob*, 6 rincones interactivos (Mesa del Bufón, Altar, Pared de la Gloria, Fogón, Fonógrafo/Crónica, Puerta Doble con resplandor) + accesos rápidos 1 clic | **Completado (`v0.44.0`)** |
| **C. Clímax Argentino — «El Camino al Sol de Mayo»** | Puerta doble abierta en el clímax del Tramo 3, empedrado porteño nocturno entre niebla, faroles, banderines celestes y blancos, arcos de naipes españoles, Sol de Mayo colosal *dithered*, Mesa de la Gloria y Carta de Gloria clavada en la pared | **Completado (`v0.45.0`)** |
| **D. Pulido Artesanal Total y Doble Auditoría Limpia** | Física táctil de cartas, expresividad completa del elenco y **2 Auditorías Adversariales consecutivas con 0 defectos**, `CLS = 0`, `≥ 60 FPS`, ES/EN verdes en vivo | Pendiente (`v0.46.0+`) |

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

**Próximo paso inmediato:** **Pilar D (`v0.46.0`) — Pulido Artesanal Total y Doble Auditoría Adversarial Consecutiva con 0 Defectos**.
