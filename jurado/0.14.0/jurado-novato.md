```json
{
  "jurado": "jurado-novato",
  "version": "0.14.0",
  "puntajes": { "claridad": 6.2, "diversion": 6.7, "estetica": 8, "veredicto": 6.6 },
  "defectos": [
    { "prioridad": "P1", "pantalla": "mesa (en reposo), mesa-rey, mesa-mentiroso, mapa", "ventana": "1280x800 y 390x844", "archivo": "src/client/pantallas/mesa.ts:109 (sello Inmune), :120-123 (e-ataque y Furia), :134-140 (corteHtml) y src/client/pantallas/camino.ts:204 (nodo-palos)", "que": "Las cifras del enemigo siguen mudas: espadas cruzadas con «20», llama «+3», el «1» suelto bajo LA CORTE, el dado junto a «Turno 1» y el chip «FILO DEL CAUDILLO». «INMUNE» sigue sin decir a qué: el nombre del palo y «te pega al final del turno» están escritos, pero dentro de un tip(). En el mapa las pintas bajo cada nodo no dicen que son inmunidades. La palabra «Furia» no aparece en ninguna captura.", "por_que": "En reposo, que es donde decido, no sé que me pegan 20 por turno ni que con 76 de Vida aguanto tres. En 390 es peor: no hay cursor para ver un tooltip y la Corte es una miniatura con un «1».", "propuesta": "Rótulo fijo de una o dos palabras con la clase .rotulo que ya usa INMUNE: «TE PEGA» sobre el 20, «FURIA» junto a la llama, «QUEDA 1» en la Corte, «INMUNE A ESPADAS». En el mapa, el mini escudo tachado (pxInmune) en vez de la pinta pelada." },
    { "prioridad": "P1", "pantalla": "mesa-seleccion, secuencia 1280-golpe-02…06, jugadas", "ventana": "1280x800 y 390x844", "archivo": "src/client/pantallas/mesa.ts:162-169 (desglose d/m solo en tip) y :651-665 (c-vuela); src/client/estilos/mesa.css:1316-1341", "que": "Antes de golpear la cuenta sigue diciendo PAR · DAÑO 34 × MULTI 10 = 340 con dos sietes, sin desglose a la vista; Jugadas dice que el Par es «+4 ×2». El desglose ahora aparece, pero solo durante el conteo, después de comprometerme: etiquetas de 0,9 s apiladas que tapan el nombre y la barra de vida del enemigo (cuadros 04 y 06, «JACK O…» cortado) y que no alcanzo a leer. En 390 la cuenta ni siquiera lleva las palabras DAÑO y MULTI: son tres números de colores.", "por_que": "Sigo sin poder predecir el número central: veo de dónde salió cuando ya pegué. El Golpe exacto, que es lo que más ganas da, me sale porque la cuenta me lo canta, no porque lo entienda.", "propuesta": "Una segunda línea chica y fija en la cuenta, antes de golpear, con los iconos del HUD: «7+7 · Par 4 · [dado] 8 · cantos 8» y «Par 2 · [cáliz] 2 · [taba] 1 · mano corta 4…». En el conteo, que cada etiqueta salga de su ficha del HUD (ya brinca con «+2», «+1») y no encima de la barra de vida." },
    { "prioridad": "P2", "pantalla": "fogon, mesa, mesa-mentiroso, HUD", "ventana": "1280x800", "archivo": "src/client/pantallas/camino.ts:591 y :602 (nadie lleva data-inicio con Vida llena); src/client/pantallas/mesa.ts:764 y :778; src/client/hud.ts:53", "que": "El foco inicial cae donde no sirve: en el Fogón con Vida llena el marco dorado queda en «≡ MENÚ» (Descansar perdió el data-inicio y Templar no lo heredó) y en la mesa en «? JUGADAS». El Comodín y el botón «ENGAÑO» siguen sin una línea propia (solo tooltip), el sello «+8★» tampoco, y las cargas del HUD (espada 0, oro 1, «+2») siguen sin nombre.", "por_que": "Con mando aprieto A y se abre el menú o las reglas en vez de jugar. El Comodín lo entendí recién en la foto de mirar/, cuando se vuelve un 3 de oros; Engaño no lo tocaría nunca.", "propuesta": "data-inicio en Templar cuando Descansar está apagado y en la primera carta de la mano en la mesa; un subtítulo de una línea al enfocar Comodín («copia tu carta más alta») y Engaño; nombre corto junto a cada carga (FILO 0)." }
  ],
  "aciertos": [
    "El conteo ahora nombra cada pieza que suma (Dado cargado +8, Cáliz +2, Taba +1, Mano corta +4) y la ficha del HUD brinca con su cifra: por primera vez vi de dónde salen el 34 y el 10.",
    "Fogón: «DESCANSAR · Vida llena» apagado, igual que Curar en la Pulpería; ya no gasto la parada en curar cero.",
    "«Elegí cartas y arrastralas al enemigo», el naipe inmune gris con su escudito y el «¡EXACTO! +3 +1» siguen contestando solos «¿cómo gano?».",
    "El golpe: el naipe se raja en dos con el 340 encima, la barra queda en 0/340 y el oro sube de 49 a 50 a la vista.",
    "Portada, elegir Mazo, Cara o cruz («A LA SUERTE: 60 %»), Pulpería y Elegí una Cábala se entienden en cinco segundos."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/portada.png", "visual-qa/1280x800/elegir-mazo.png", "visual-qa/1280x800/cabala.png", "visual-qa/1280x800/mapa.png",
    "visual-qa/1280x800/mesa.png", "visual-qa/1280x800/mesa-seleccion.png", "visual-qa/1280x800/mesa-rey.png", "visual-qa/1280x800/mesa-mentiroso.png",
    "visual-qa/1280x800/elegi-una.png", "visual-qa/1280x800/pulperia.png", "visual-qa/1280x800/fogon.png", "visual-qa/1280x800/jugadas.png",
    "visual-qa/1280x800/piezas.png", "visual-qa/1280x800/fin-derrota.png",
    "visual-qa/390x844/mesa-seleccion.png", "visual-qa/390x844/mesa-rey.png",
    "jurado/secuencias/1280-golpe-00, 02, 04, 06, 08 y 09.png", "jurado/secuencias/1280-rey-irrumpe-04.png",
    "mirar/1280-comodin-espectral-racha.png", "mirar/1280-mesa-grito.png"
  ]
}
```

## Primeras impresiones (antes de abrir el código)

- **¿Cómo gano un combate?** Bajo a cero la barra roja arrastrándole cartas. La pista de reposo lo dice; que 340 se pueda bajar con un 6 y dos 7 lo creo recién al seleccionar.
- **¿Qué hace el enemigo en su turno?** Me pega el número rojo de las espadas cruzadas. Lo sé por el chip «HITS YOU FOR 20» de la foto del Comodín, no por la mesa. En ninguna captura vi un contraataque: la secuencia del golpe termina con el enemigo muerto.
- **Números del enemigo:** 340/340, vida. 20, su golpe (deducido). El «1» bajo La Corte, supongo que los que faltan. El dado al lado del turno: ni idea.
- **Furia:** será la llama «+3» del Rey; la palabra no está en pantalla. **Inmune:** deducido por la carta gris; el sello no nombra el palo. **Escudo:** el mío está en 0 y solo Jugadas dice que lo dan los Bastos.
- **Multi:** multiplica; por qué 10, lo vi de reojo en el conteo. **Canto:** creo que es el «¡ESCOBA!» del Mazo; «Cantos 20» en la derrota no me dice nada. **Golpe exacto:** matar justo, +3 de vida y +1 de oro; clarísimo.
- **Comodín:** sin abrir Jugadas no sé. **Engaño:** tampoco.
- Palabras que no conozco: Pulpería, purgar, templar («queda al rojo», «la primera pasada es segura»), porotos, Altar, Reinado, «ni fu ni fa», Filo, Fortuna, Coraza, Guardia.

## Defectos menores

- «AL DESCARTE» sigue recortado contra su caja a 1280 en `mesa.png` (en `mesa-mentiroso` entra): `src/client/estilos/mesa.css:471`.
- Mapa: la fila de arriba sigue cortada bajo la cabecera y nada dice que se avanza hacia arriba: `src/client/pantallas/camino.ts:202`.
- «Lo que llevás» se corta abajo (Bendiciones) sin señal de que sigue: `src/client/pantallas/camino.ts:79-81`.
- La derrota no dice quién me mató ni con cuánto; los tres retratitos no tienen rótulo: `src/client/pantallas/camino.ts:746-752`.
- La secuencia del golpe y las fotos de `mirar/` están en inglés, y ahí el grito del retrato sale «¡ESCOBA!» en castellano tapando la mano: `src/client/hud.ts:207`.

## Contra mi veredicto de la 0.13.0

Resuelto: Fogón con Descansar apagado (aunque el foco quedó huérfano) y el conteo que nombra cada pieza (mitad del defecto 1). Siguen: desglose a la vista antes de golpear, rótulos de las cifras del enemigo e «Inmune a qué», Comodín y Engaño sin línea propia, cargas del HUD sin nombre, y cuatro de los cinco menores (descarte recortado, mapa, «Lo que llevás», derrota). El 340 rosa sobre rosa ya no lo vi.

## Qué haría en la próxima versión

Lo mismo que pedí, porque la 0.14.0 arregló el después del golpe y no el antes: sacar de los tooltips lo que ya está escrito. (1) Rótulos fijos «TE PEGA», «FURIA», «QUEDA 1», «INMUNE A ESPADAS», también en el mapa. (2) Segunda línea de la cuenta con el desglose en iconos antes de golpear, y DAÑO/MULTI escritos en 390. (3) Primer combate con tres bocadillos del Bufón atados a lo que pasa: «te pega 20 cuando terminás», «matalo justo y cobrás», «las grises no le hacen nada». (4) Comodín y Engaño con su línea al enfocarlos. (5) Foco inicial siempre en la acción que avanza. Todo es texto que el código ya tiene; no toca reglas ni Constitución, y me llevaría la claridad a 7,5.
