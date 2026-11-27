# GDD · CÁBALA 2.0 (MVP 2D Pixel Art Diegético)

Especificación funcional y visual del MVP simplificado.

---

## 1 · Experiencia de juego objetivo

- **Duración de una run completa:** 12–15 minutos (3 Tramos × [Sota → Pulpería → Caballo → Duelo del Bufón → Rey]).
- **Lectura instantánea:** un jugador entiende cada carta, cada Canto, cada Cábala y el próximo ataque enemigo en menos de 2 segundos, tanto en PC (`1920×1080`, `1366×768`, `1280×800`) como en Móvil (`390×844`).
- **Sensación táctil (*Game Feel*):** cada golpe dispara *anticipation* del Héroe, tajo/chispa en `#fx-color` + destello aditivo en `#fx-luz` (*pixelfx*), *hitstop* medido (50–120 ms), sacudida de píxel entero, número de daño y reacción del sprite enemigo.

---

## 2 · Ciclo exacto de cada Tramo (1 a 3)

| Paso | Pantalla / Encuentro | Regla principal | Recompensa |
| :--- | :--- | :--- | :--- |
| **1** | **Sota (10)** | Guardia ligero del palo del Tramo | Oro + elegir 1 de 3 Cábalas (o mejorar mazo) |
| **2** | **Pulpería rápida** | 3 servicios simples en una sola mesa: comprar Cábala (2 ofertas), curar Vida o quitar/sumar 1 carta | Preparación táctica |
| **3** | **Caballo / Jinete (11)** | Guardia pesado con mayor Vida y ataque | Oro + respiro antes del Duelo |
| **4** | **Duelo del Bufón** | 1 mano real del juego del Mazo (`< 45 s`) | **Ganás:** 1 de 3 Bendiciones · **Perdés:** sin Bendición + traba leve |
| **5** | **Rey Jefe (12)** | Jefe único de palo con rasgo distintivo y clima propio | Tramo 1–2: cura parcial + Bendición · Tramo 3: **Victoria** |

---

## 3 · Catálogo de piezas del MVP

### 3.1 Cábalas (Reliquias pasivas · 6 huecos)
Fusionan los mejores 15–18 efectos de los antiguos Amuletos y Aumentos en **un único tipo de pieza**:
- Sin tiers visibles (`S/A/B`), sin evoluciones, sin texto largo: ícono pixel-art + título + 1 línea de efecto + etiqueta `★ SINERGIA` cuando aplica al Mazo actual.

### 3.2 Bendiciones (Dones directos)
- Dones de los 4 Reyes y del Bufón (sin acumulación compleja por niveles ni Pactos Duales): modifican reglas clave durante toda la run (ej. Escudo persistente, exceso de curación en Multi, Crítico en Exacto, daño extra al palo débil).

---

## 4 · Sprites 2D de cuerpo entero y animaciones

**Cero cartas-enemigo.** Todos los combatientes son personajes pixel-art 2D de cuerpo entero sobre la mesa diegética:

- **5 Héroes (izquierda, mirando a la derecha):**
  - *La Barrendera* (Escoba), *El Paisano Bravo* (Truco), *La Timbera del Club* (Chinchón), *El Chamuyero* (El Mentiroso), *El Manotazo* (Chancho Va).
- **1 Anfitrión (centro/árbitro):** *El Bufón* (4 expresiones: reposo, risa, sombría, brillo).
- **12 Enemigos (derecha, mirando a la izquierda):**
  - **4 Sotas** (Espadas, Bastos, Oros, Copas).
  - **4 Caballos / Jinetes** (Espadas, Bastos, Oros, Copas).
  - **4 Reyes Jefe** (*El Caudillo*, *El Cacique*, *El Caudal*, *El Bacanal*).

**Estados mínimos por combatiente (spritesheet limpio 2D):**
1. `idle` — respiración / balanceo sutil a ritmo de pulso (`2–4` cuadros).
2. `ataca` — embestida horizontal hacia el rival (`2–3` cuadros).
3. `escudo` — guardia / bloqueo azul (`1–2` cuadros, cuando aplica).
4. `herido` — retroceso + destello blanco/carmesí (`1–2` cuadros).

---

## 5 · Plan de Hitos hasta CÁBALA 2.0

- **Hito 1 (Base limpia):** Instalar skills, redactar documentación (`CONSTITUCION.md`, `MVP_2D.md`, `ARQUITECTURA.md`) y eliminar el 100 % del 3D (`escena3d/`, `three`, `@types/three`).
- **Hito 2 (Poda de reglas y flujo):** Reducir Menú a `JUGAR / COLECCIÓN / AJUSTES` (5 Mazos abiertos), implementar loop lineal de 3 Tramos, unificar Cábalas + Bendiciones, eliminar Chiches/Postas/Evoluciones/Mutaciones/Altar/Crónica/Reinados, y dejar la suite de tests 100 % en verde.
- **Hito 3 (Arte 2D, `pixelfx` y CSS desde cero):** Generar spritesheets 2D de cuerpo entero para todos los personajes (Héroes, Bufón, Sotas, Caballos, Reyes), construir el escenario de combate horizontal 2D estilo *Slay the Spire* (PC + Móvil), reescribir el CSS desde cero (`< 2.000` líneas) y certificar FPS + QA visual.
