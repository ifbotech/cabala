# Referencias de terceros

CÁBALA no incluye código, imágenes ni fuentes de datos de otros juegos. Todo el arte se dibuja por código en este
repositorio. Estas son las referencias de método que se consultaron (ninguna se ejecuta ni se copia aquí):

| Proyecto | Licencia | Qué se tomó |
|---|---|---|
| [uilianks/pxl](https://github.com/uilianks/pxl) (sobre [crsolver/claude-pxl](https://github.com/crsolver/claude-pxl)) | MIT | Ideas de método para el pincel y el linter de pixel-art: dibujar con primitivas, rampas con corrimiento de matiz, luz de un solo lado, y las reglas de huérfanos, dientes de sierra, almohada y colores casi repetidos. El código de `src/client/pixel/` y `scripts/pixel-lint.ts` es propio. |
| [patch-gg/pixelfx](https://github.com/patch-gg/pixelfx) | MIT | El método de efectos en dos buffers (color opaco o tramado y luz aditiva), rampas duras en el color, cuadro blanco de impacto, *hitstop* y azar con semilla. El motor de `src/client/fx/` es propio y no usa su código. |
| [omer-metin/skills-for-antigravity](https://github.com/omer-metin/skills-for-antigravity) · `pixel-art-sprites` | Apache-2.0 | Las guías de validación de sprites (render sin suavizado, escala entera, cuadros de tamaño constante, tiempos de animación explícitos), integradas y adaptadas en `.claude/skills/pixel-art-sprites/`. |

Tipografías, vía `@fontsource` (SIL Open Font License 1.1): **Bitcount Prop Single** (Petr van Blokland, TYPETR),
la letra de cuerpo desde la 0.16; **DotGothic16** (Fontworks Inc.), de respaldo para los glifos que la Bitcount no
trae; y **Silkscreen** (Jason Kottke), la de rótulos.
