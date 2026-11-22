```json
{
  "jurado": "jurado-novato",
  "version": "0.22.0",
  "puntajes": { "claridad": 7.5, "diversion": 7.8, "estetica": 8.0, "veredicto": 7.7 },
  "defectos": [
    { "prioridad": "P0", "pantalla": "oferta-evoluciona, botin-tesoro, evolucion-jackpot, hud-evolucion, piezas", "ventana": "1280x800", "archivo": "src/client/ui.ts:312-316 (el sello solo dice el nombre nuevo; la regla vive en un tip sobre un span que el foco del mando nunca toca); src/client/evolucion.ts:16 y :19-28 (1,2 s y cualquier entrada lo corta); src/client/pantallas/camino.ts:77 (LO QUE LLEVÁS ignora la Evolución); src/rules/evoluciones.ts:49", "que": "En la oferta, el Cáliz dice «★ EVOLUCIONA · BRINDIS DE SANGRE» y nada más: no dice qué gano ni por qué evoluciona (hace falta un don del Rey de su palo). Como en el HUD ya tengo «BRINDIS 4 · +4 vida», leo que me mejora esa carga. El jackpot («DESPIERTA PONCHO DEL CACIQUE», y abajo «GARROTE DEL CACIQUE») nombra lo viejo arriba y lo nuevo abajo sin flecha, dura 1,2 s y el primer botón que toco para seguir lo borra. Después, LO QUE LLEVÁS sigue mostrando el nombre y la regla viejos del Amuleto: la única pantalla de consulta contradice al motor.", "por_que": "Es la novedad de la versión y para mí no es más que un nombre raro que desaparece al toque. Peor: la regla escrita que puedo consultar es falsa. Así no aprendo a buscar Evoluciones, y si las encuentro, no sé qué hacen.", "propuesta": "El sello de la oferta lleva dos renglones visibles: «con tu don de Copas → BRINDIS DE SANGRE» y la regla nueva entera (sin tip). El jackpot muestra «CÁLIZ DEL BACANAL → BRINDIS DE SANGRE» con la regla y no se cierra solo: lo cierra A. LO QUE LLEVÁS usa EVOLUCION[id] (nombre, regla y sello «Evolución de…») cuando evoluciono(p,id). Y la Evolución del Cáliz cambia de nombre para no pisar la carga Brindis." },
    { "prioridad": "P1", "pantalla": "forja-brava (Fogón, tercera pasada)", "ventana": "1280x800", "archivo": "src/client/pantallas/camino.ts:824 (rótulo «+12★ ×2»), :826 (la mutación es un span con tip, no enfocable), :842-847 (SEGUIR sin data-inicio); src/client/nav.ts:56 (cae a lista[0], que es MENÚ); src/client/textos.ts:679", "que": "Sale «¡FORJA BRAVA!» y el naipe dice «+12 ★ ×2»: no sé qué es la estrella ni qué multiplica el ×2. El chip «DOBLE FILO» no dice que al jugarlo me corta Vida: ese costo está en un tip que con el mando no se puede abrir. Y el foco del mando cae en MENÚ (arriba a la derecha), no en SEGUIR, que está iluminado en oro: si aprieto A para seguir, abro el menú.", "por_que": "Me la jugué dos veces al fuego por esta recompensa y no la entiendo. La mutación tiene un lado malo escondido: la primera vez que me corte Vida va a parecer un error. Y el foco perdido rompe el ritmo justo en el momento de festejar.", "propuesta": "Debajo del naipe, en renglones a la vista: «Templada: +12 de Daño y +1 de Multi», «Forja Brava: su número cuenta doble», «Doble Filo: +N de Multi, te corta N de Vida». Sacar ★ y ×2 del rótulo, o explicarlos en el glosario. SEGUIR lleva data-inicio cuando fogonHecho, y la mutación pasa a ser una pieza enfocable." },
    { "prioridad": "P2", "pantalla": "mesa, oferta-evoluciona, forja-brava, pulperia, fin-derrota", "ventana": "1280x800", "archivo": "src/client/textos.ts:673-677 (Doble Filo, Chispa de Oro); src/rules/evoluciones.ts:49 (Brindis de Sangre); src/rules/chiches.ts (Poroto de Yapa) contra textos.ts:162 (Porotos)", "que": "Cada novedad trae un nombre que pisa a otro: Chispa (la Posta del Comodín) y Chispa de Oro (mutación); Filo (carga del Rey), Filo dorado (Bendición) y Doble Filo (mutación); Brindis (carga) y Brindis de Sangre (Evolución); Porotos (moneda del Altar) y Poroto de Yapa (Chiche).", "por_que": "Lo que aprendo con una palabra me miente cuando aparece la otra. Ya pasó con «Mano corta», que esta versión arregló. Ahora el problema son cuatro familias de nombres.", "propuesta": "Renombrar las mutaciones y la Evolución del Cáliz. Una prueba recorre todos los nombres visibles (piezas, pasos de la cuenta, cargas, Chiches, mutaciones, Evoluciones) y falla si uno contiene a otro como palabra completa." }
  ],
  "aciertos": [
    "El paño en su fila propia es lo mejor de la versión: sin nada elegido hay un solo renglón, «Medio: pega doble · 3 o más en subida: Escalón +2», y al elegir aparece el paño verde con la leyenda al costado. Mi P1 de la previa está resuelto, Mentiroso incluido.",
    "«Mano corta» pasó a ser «Mano chica», y el glosario de JUGADAS ya trae Mano, Cantos, Palo y palo, Filo dorado, Taba y Chiches. Mi P1 de jerga está resuelto en lo principal.",
    "El Tesoro se entiende solo: «TESORO · Candado: 27 de oro · Te faltan 20 de oro», con el candado sobre cada precio y «DEJAR EL COFRE».",
    "La Cábala Negra se lee bien: tres opciones con una frase cada una, y en la bandeja se apaga todo lo que no tiene el mismo número.",
    "Mi golpe ahora pesa: el «144» rojo sobre la Sota y el sello «CARA DE PÓKER · NO LLEGA» (golpe-08). Además JUGADAS explica el Comodín en una línea."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/portada.png", "visual-qa/1280x800/elegir-mazo.png", "visual-qa/1280x800/cabala.png", "visual-qa/1280x800/cabala-negra.png",
    "visual-qa/1280x800/mapa.png", "visual-qa/1280x800/mapa-tesoro.png", "visual-qa/1280x800/mesa.png", "visual-qa/1280x800/mesa-seleccion.png",
    "visual-qa/1280x800/mesa-rey.png", "visual-qa/1280x800/mesa-mentiroso.png", "visual-qa/1280x800/elegi-una.png", "visual-qa/1280x800/pulperia.png",
    "visual-qa/1280x800/fogon.png", "visual-qa/1280x800/forja-brava.png", "visual-qa/1280x800/oferta-evoluciona.png", "visual-qa/1280x800/evolucion-jackpot.png",
    "visual-qa/1280x800/hud-evolucion.png", "visual-qa/1280x800/botin-tesoro.png", "visual-qa/1280x800/botin.png", "visual-qa/1280x800/jugadas.png",
    "visual-qa/1280x800/piezas.png", "visual-qa/1280x800/fin-derrota.png", "visual-qa/1280x800/mesa-escalon.png", "visual-qa/1280x800/mesa-chispa.png",
    "visual-qa/1280x800/ajustes.png", "mirar/1280-comodin-espectral-racha.png",
    "jurado/secuencias/1280-golpe-00, 03, 06, 08.png"
  ]
}
```

## Primeras impresiones (antes de abrir el código)

- **¿Cómo gano?** Bajo a cero la barra («LE QUEDAN 316») de cada uno de la Corte («LA CORTE · QUEDA 1»). Claro.
- **¿Qué hace el enemigo?** «TE PEGA 19 · 21 − 2 ESCUDO», y además «FURIA 3 · ya incluida · +3 por turno». Clarísimo. Con «TE PEGA 0 · Cara de Póker», sigue pareciendo el nombre de alguien hasta que abro LO QUE LLEVÁS.
- **Números del enemigo:** Vida, TE PEGA y Furia, bien. El «10» o el «12» del naipe sigue siendo la cifra más grande y no significa nada.
- **Furia, Inmune, Escudo, Multi:** claros. **Canto:** «Cantos hechos +8» ahora tiene glosa. **Golpe exacto:** solo en el glosario y en la derrota. **Comodín:** JUGADAS lo explica, y en mesa-chispa ya se lee el «4» del naipe fantasma.
- **Palabras o cifras que no entiendo:** EVOLUCIONA, Despierta, «+12 ★ ×2», Doble Filo, Ser Mano, «lo que le dejó el fuego» (Trasplantar), ENGAÑO, «Escalón +2» (¿+2 de qué?). TURBO no lo vi en ninguna pantalla: lo conozco solo por el código (`src/client/ritmo.ts:29`), así que «leído en código, no visto».

## Defectos menores

- «3 o más en subida: Escalón +2» no dice «de Multi» (`src/client/textos.ts:271`).
- En Coser dos iguales no veo el naipe que voy a recibir antes de apretar COSER (`src/client/pantallas/camino.ts:959-966`).
- El cofre sin plata sigue titulado «ELEGÍ UN AMULETO» cuando no puedo elegir nada (`src/client/pantallas/camino.ts:409`).
- El glosario sigue armado a mano y abajo de todo: le faltan Cara de Póker, Ser Mano, Templada/★, Forja Brava, Evolución y Tesoro (`src/client/pantallas/camino.ts:152-170`).
- Los tres huecos vacíos de Chiches siguen en la compu (`src/client/estilos/mesa.css:4277`).

## Contra mi veredicto de la previa

**Resueltos:** las Postas (el renglón fijo y el paño en su fila, Mentiroso incluido) y la jerga del desglose («Mano chica» y el glosario ampliado). **Sigue:** el Fósforo se gasta igual aunque no tengas en la mano ningún naipe del palo Inmune (`src/rules/combate.ts:870-873`).

## Qué haría en la próxima versión

Un pase de «lo nuevo se explica a la vista». (1) Las Evoluciones muestran causa y efecto en la oferta («tu don de Copas → BRINDIS DE SANGRE: +N de Multi siempre…»). El jackpot dice «antes → después» y espera a que apriete A. LO QUE LLEVÁS muestra la forma despierta. (2) El Fogón dice en renglones lo que ganó el naipe y lo que cuesta su mutación, y devuelve el foco a SEGUIR. (3) Paso de nombres: ninguna pieza, mutación o Evolución repite una palabra de otra, y una prueba lo vigila. (4) El glosario se genera desde los términos que emite el motor, más las piezas que llevás, y arranca arriba. (5) El Fósforo se niega si no destraba nada. Nada de esto toca la Constitución, y con eso la claridad llegaría a 8.
