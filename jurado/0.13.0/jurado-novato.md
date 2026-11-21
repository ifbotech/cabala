```json
{
  "jurado": "jurado-novato",
  "version": "0.13.0",
  "puntajes": { "claridad": 5.5, "diversion": 6.5, "estetica": 8, "veredicto": 6.2 },
  "defectos": [
    { "prioridad": "P1", "pantalla": "mesa-seleccion / secuencia golpe / conteo", "ventana": "1280x800 y 390x844", "archivo": "src/client/pantallas/mesa.ts:162-177 (cuentaHtml) y :541-560 (conteo)", "que": "La cuenta dice PAR · DAÑO 34 × MULTI 10 = 340 con dos sietes en la mano, y el conteo animado solo hace saltar «+7» y «+7». Los 20 de Daño y los 8 de Multi que faltan no aparecen en ningún lado: el desglose (jugada, Amuletos, Filo, canto) existe pero vive en un tooltip (data-tip) que en móvil y con apuro no se ve nunca. Además la tabla de Jugadas dice que el Par es «+4 ×2», que contradice lo que veo.", "por_que": "Es el número central del juego y no puedo reconstruirlo: no aprendo qué cosa mía hace crecer el golpe, así que comprar Amuletos o elegir Cábalas es a ciegas. El Golpe exacto, que es la gracia, se vuelve suerte.", "propuesta": "Mostrar el desglose a la vista bajo la cuenta, con los mismos iconos del HUD (7 + 7 + Par 4 + [icono] 16 …; ×2 Par + [icono] 8), y que el conteo haga saltar también cada pieza que suma (la ficha del HUD pega un brinco con su «+N»), no solo los naipes." },
    { "prioridad": "P1", "pantalla": "mesa (en reposo), mesa-rey, mapa", "ventana": "1280x800 y 390x844", "archivo": "src/client/pantallas/mesa.ts:109-140 (enemigoHtml, corteHtml) y src/client/pantallas/camino.ts:199-204 (nodo-palos)", "que": "Los números del enemigo no tienen rótulo: las espadas cruzadas con «20», la llama «+3», el escudo «28» en su barra, el «1» suelto bajo LA CORTE, el dado junto al turno, el chip «FILO DEL CAUDILLO». «INMUNE» no dice a qué (lo deduje recién en mesa-rey por el 7 de espadas gris). En el mapa, las pintas chiquitas bajo cada nodo no dicen que son inmunidades. Todo eso se explica solo en tooltips.", "por_que": "Antes de tocar una carta no sé que el enemigo me pega 20 al final de mi turno ni que con 76 de Vida aguanto tres turnos. Recién al seleccionar aparece «TE PEGA 20 · LE QUEDAN 295», que es excelente pero llega tarde. En 390 la Corte es una miniatura ilegible con un «1».", "propuesta": "Rótulo fijo de una palabra bajo cada cifra («TE PEGA 20», «FURIA +3», «QUEDA 1»), «INMUNE A ESPADAS» con el nombre del palo, y en el mapa un mini escudo tachado junto a las pintas. La pista de reposo podría decir «Bajale los 340 antes de que te pegue 20»." },
    { "prioridad": "P2", "pantalla": "fogon, mesa-mentiroso, HUD", "ventana": "1280x800", "archivo": "src/client/pantallas/camino.ts:567 (descansar con data-inicio) y src/client/pantallas/mesa.ts (botón Engaño y carta Comodín); src/client/hud.ts:49-64 (cargas)", "que": "Trampas para el apurado: en el Fogón el foco inicial cae en «DESCANSAR · Curás 0 de Vida» con la Vida llena (en la Pulpería el mismo caso está bien apagado con «Vida llena»). El Comodín y el botón «ENGAÑO» no dicen qué hacen sin abrir Jugadas; el sello «+8★» de un naipe tampoco. Las fichas del HUD con cifra (espada 0, oro 1, «+2», «+10») no tienen nombre.", "por_que": "Aprieto el botón dorado y gasto el Fogón en curar cero; juego el Comodín solo y me dice que no es jugada; nunca aprieto Engaño porque no sé qué arriesga.", "propuesta": "Deshabilitar Descansar con Vida llena y mover el inicio a Templar; una línea bajo el Comodín al enfocarlo («copia tu carta más alta») y bajo Engaño; nombre corto junto a las cargas (FILO 0 · FORTUNA 1), que la Pulpería ya menciona como «Suma a Filo»." }
  ],
  "aciertos": [
    "Al elegir cartas la cuenta DAÑO × MULTI = TOTAL con «¡EXACTO!», «TE PEGA 20» y «LE QUEDAN 295» responde sola a «¿cómo gano?»: es lo más claro del juego.",
    "La pista de reposo «Elegí cartas y arrastralas al enemigo» y el naipe inmune agrisado con su escudito en la mano.",
    "El golpe se siente: el naipe enemigo se raja en dos con el 340 encima y el siguiente de la Corte entra sin corte.",
    "Portada, elegir Mazo, Pulpería y «Elegí una Cábala» se entienden en cinco segundos; textos de una línea de verdad.",
    "El modal de Jugadas resalta la jugada que tenés armada y explica los cuatro palos en una línea cada uno."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/portada.png", "visual-qa/1280x800/elegir-mazo.png", "visual-qa/1280x800/cabala.png", "visual-qa/1280x800/mapa.png",
    "visual-qa/1280x800/mesa.png", "visual-qa/1280x800/mesa-seleccion.png", "visual-qa/1280x800/mesa-rey.png", "visual-qa/1280x800/mesa-mentiroso.png",
    "visual-qa/1280x800/elegi-una.png", "visual-qa/1280x800/pulperia.png", "visual-qa/1280x800/fogon.png", "visual-qa/1280x800/jugadas.png",
    "visual-qa/1280x800/piezas.png", "visual-qa/1280x800/fin-derrota.png", "visual-qa/390x844/mesa-seleccion.png",
    "jurado/secuencias/1280-golpe-00.png … 1280-golpe-09.png (las diez)",
    "mirar/1280-mesa-grito.png", "mirar/1280-comodin-espectral-racha.png", "mirar/1280-conteo.png"
  ]
}
```

## Primeras impresiones (antes de abrir el código)

Sin reglas, esto contesté mirando solo las capturas:

- **¿Cómo gano un combate?** Bajo la barra roja del enemigo a cero arrastrándole cartas. Lo entendí en `mesa-seleccion`, no en `mesa`: en reposo veo 340 de vida contra un 6, un 7 y un 7 y pienso que es imposible.
- **¿Qué hace el enemigo en su turno?** Me pega el número rojo de las espadas cruzadas, pero solo lo supe por el chip «HITS YOU FOR 20» de la foto del Comodín. En la secuencia del golpe el enemigo nunca llega a pegar: no vi un contraataque en ninguna captura.
- **Números del enemigo:** 340/340 es vida (claro). El 20 es su golpe (deducido). El «1» bajo La Corte supongo que son los enemigos que faltan. El escudo 28 del Caballo: ni idea de si lo tengo que romper primero.
- **Furia:** la llama «+3» en `mesa-rey`; supongo que pega cada vez más. La palabra no aparece en pantalla.
- **Inmune:** deducido en la tercera mesa, por la carta gris. **Escudo:** el mío está en el HUD en 0 y no sé cómo sube hasta abrir Jugadas («cada Basto te da Escudo»).
- **Multi:** lo que multiplica; por qué vale 10 y no 2, no sé. **Canto:** no lo entendí; en la derrota dice «Cantos 23» y en Jugadas «el canto de tu Mazo»: ¿es el ¡ESCOBA!? **Golpe exacto:** matar justo, da +3 de vida y +1 de oro; eso sí está claro y dan ganas de buscarlo.
- **Comodín:** sin Jugadas, no sé. En la foto se vuelve un 3 de oros amarillento y recién ahí cierro la idea.
- Palabras que no conocía: Pulpería, purgar, templar, porotos, Altar, chamuyo, «ni fu ni fa», Reinado, Filo, Fortuna, Coraza.

## Defectos menores

- «AL DESCARTE» queda cortado contra el borde izquierdo a 1280 (se lee «AL DESCART»): `src/client/estilos/mesa.css:471`.
- El grito del retrato («SPOTLESS!», «¡ESCOBA!») tapa los naipes de la mano nueva durante dos cuadros: `src/client/hud.ts:207`.
- En `mirar/1280-conteo` el Comodín vuela por encima de GOLPEAR/DESCARTAR/ENGAÑO; y el 340 del impacto se empasta rosa sobre rosa en el cuadro 04: `src/client/pantallas/mesa.ts:541` y `src/client/fx/efectos.ts`.
- Mapa: la fila de arriba se corta bajo la cabecera y nada indica que se avanza hacia arriba: `src/client/pantallas/camino.ts:202`.
- «Lo que llevás» se corta abajo sin señal de que sigue, y la derrota no dice quién me mató ni con cuánto: `src/client/pantallas/camino.ts:142` y `:723`.

(En `elegi-una` la captura muestra el foco en «SALTAR»; leído en código, el inicio es la primera opción, `camino.ts:285`, así que no lo cuento como defecto.)

## Qué haría en la próxima versión

Un paquete «todo a la vista, nada en tooltip»: (1) desglose visible de Daño y Multi con los iconos de mis piezas, y un conteo donde cada Amuleto y cada carga salta con su «+N» igual que los naipes; (2) rótulos fijos de una palabra en cada cifra del enemigo y «INMUNE A ESPADAS» con nombre, también en el mapa; (3) un primer combate guiado por el Bufón en tres bocadillos, sin texto de reglas: «te pega 20 cuando terminás», «matalo justo y cobrás», «las grises no le hacen nada»; (4) el Comodín y el Engaño con su línea propia al enfocarlos; (5) el Fogón sin opciones nulas. Con eso la claridad sube a 7,5 sin tocar una sola regla ni la Constitución.

No recibí veredicto de la versión anterior.
