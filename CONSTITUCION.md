# CONSTITUCIÓN DE «CÁBALA 2.0»

Esta es la **única fuente de verdad** del proyecto `ifbotech/cabala` a partir del MVP 2D. Todo cambio de reglas, arte o interfaz se mide contra este documento y `docs/MVP_2D.md`.

---

## 0 · Qué es

**CÁBALA** es un roguelike de baraja española **100 % pixel-art 2D diegético**, de estética oscura de pulpería nocturna rioplatense, jugable en navegador en PC y Móvil (`https://ifbotech.github.io/cabala/`).

- **Un solo jugador, sin servidor.**
- **Idioma del MVP:** Español rioplatense (soporte en inglés diferido para después del MVP).
- **Motor visual:** Canvas 2D + UI pixel-art diegética liviana (`0` 3D, `0` Three.js).
- **Marca:** `src/shared/brand.ts`.

---

## 1 · Lo que CÁBALA 2.0 NO tiene

Queda **eliminado de raíz** (cero rastro en código, interfaz o pruebas):

- Todo motor 3D (`src/client/escena3d/`, `three`, `@types/three`).
- Meta-progresión y pantallas secundarias: **Altar (Porotos)**, **Crónica**, **La Pulpería 3D explorable**, **El Camino al Sol de Mayo 3D**, **Intro animada de 3 pasos** y **Reinados 2–8**.
- Sistemas secundarios de combate: **Chiches**, **Postas del paño** (Medio/Chispa/Escalón), **Evoluciones de Amuletos**, **Mutaciones/Temple** de cartas y **Mapa ramificado**.
- Cartas-enemigo en combate: los enemigos nunca son naipes flotantes; todos son **sprites 2D de cuerpo entero animados**.

---

## 2 · Menú y estructura fuera de partida

La Portada tiene estrictamente **tres destinos**:

1. **JUGAR** — Elegir uno de los **5 Mazos** (todos desbloqueados desde el minuto 0) e iniciar o continuar la partida.
2. **COLECCIÓN** — Visor limpio de los 5 Mazos, los 4 Reyes, las Cábalas y las Bendiciones.
3. **AJUSTES** — Volumen, música, velocidad de ritmo y reducir movimiento.

---

## 3 · Loop lineal estilo *Balatro* (3 Tramos)

Cada partida recorre **3 Tramos lineales** (~12–15 minutos), sin mapa ramificado:

`Sota (10)` → `Pulpería rápida` → `Caballo / Jinete (11)` → `Duelo del Bufón` → `Rey Jefe (12)` → Premio del Rey y siguiente Tramo.

---

## 4 · Reglas del combate horizontal 2D

- **Encuadre horizontal estilo *Slay the Spire*:** Tu Héroe 2D animado a la izquierda enfrentando al Enemigo 2D (Sota, Caballo o Rey Jefe) a la derecha, con el Bufón como maestro de ceremonias.
- **Baraja española pura:** Cartas del **1 al 9** de los 4 palos (`Espadas`, `Bastos`, `Oros`, `Copas`) + **Comodines**.
- **Poder natural de cada palo:** Espadas perforan defensa, Bastos dan Escudo, Oros dan monedas, Copas curan.
- **Inmunidad:** Cada enemigo es inmune al daño de su propio palo.
- **Fórmula:** **TOTAL = DAÑO × MULTI**, siempre enteros.
- **5 Mazos y sus Cantos exclusivos** (cada Canto pertenece únicamente a su Mazo):
  1. **Escoba** (*La Barrendera*) — suma `15` canta **¡ESCOBA!**.
  2. **Truco** (*El Paisano Bravo*) — Bravas y **¡ENVIDO!**.
  3. **Chinchón** (*La Timbera del Club*) — Piernas/Escaleras y **¡CHINCHÓN!**.
  4. **El Mentiroso** (*El Chamuyero*) — Comodines y **Engaño**.
  5. **Chancho Va** (*El Manotazo*) — ciclado rápido y **¡CHANCHO!** que aturde.

---

## 5 · Dos únicos conceptos de mejora

1. **CÁBALAS** — Reliquias pasivas con **6 huecos** (fusionan los mejores efectos de los antiguos Amuletos y Aumentos), obtenibles en Botín y Pulpería rápida.
2. **BENDICIONES** — Dones directos e inmediatos que otorgás al ganar el **Duelo del Bufón** o al vencer a un **Rey Jefe**.

---

## 6 · El Duelo del Bufón

Entre el Caballo (Jinete) y el Rey Jefe de cada Tramo, el Bufón te desafía a **una mano real rápida (< 45 s)** del juego argentino correspondiente a tu Mazo (Truco, Escoba del 15, Chinchón, El Mentiroso o Chancho Va):

- **Si ganás:** elegís **1 de 3 Bendiciones poderosas** antes del Rey.
- **Si perdés:** seguís al Rey sin Bendición (y el Bufón puede aplicar una traba leve al combate).

---

## 7 · Música, audio y efectos 2D

- Se conserva íntegro el motor de música procedural (`src/client/musica/`) y síntesis de audio (`src/client/audio.ts`).
- Los efectos visuales corren en doble lienzo Canvas 2D (`#fx-color` + `#fx-luz`, método *pixelfx* con tramado Bayer), sin dependencias externas.
