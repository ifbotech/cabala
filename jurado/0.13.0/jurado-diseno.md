```json
{
  "jurado": "jurado-diseno",
  "version": "0.13.0",
  "puntajes": { "claridad": 6.5, "diversion": 6, "estetica": 7.5, "veredicto": 6.4 },
  "defectos": [
    {
      "prioridad": "P0",
      "pantalla": "mesa (tramos 2 y 3) · elegi-bendicion",
      "ventana": "todas",
      "archivo": "src/rules/balance-config.json:49-57 y :286 · src/rules/combate.ts:483-499",
      "que": "Todo lo defensivo es plano y la Corte escala: Escudo con tope 20, Basto +2, Copa +2, Contragolpe 10/16/22, contra un Ataque que va de 12 a 20-26 y a 31-37 más Furia, y una Vida ×9,5. Contragolpe y Peaje piden frenar ENTERO el Contraataque: desde el Caballo del tramo 2 (23 > 20) es aritméticamente imposible, salvo con Aturdido o el canto de Chinchón.",
      "por_que": "La build del Cacique (Poncho, Empalizada, Contragolpe, Peaje, Palo y palo) se apaga sola a mitad de partida y el juego no lo avisa. En el tramo 3 los cuatro palos dejan de pesar (solo Espadas escala, porque Perfora con tu Daño) y toda build converge en lo mismo: carrera de Multi antes de comerte tres Contraataques.",
      "propuesta": "Escalar lo del jugador por tramo con el mismo multiplicador entero que ya usa el Escudo enemigo (1/2/4): tope de Escudo 20/40/80 y Basto/Copa 2/4/8. Contragolpe: devuelve lo frenado ×2/×3/×4 en vez de un fijo, y dispara al frenar al menos la mitad."
    },
    {
      "prioridad": "P1",
      "pantalla": "mesa · secuencia golpe",
      "ventana": "1280x800 y 390x844",
      "archivo": "src/client/pantallas/mesa.ts:542-569 (conteo) y :162-169 (desglose solo en tooltip)",
      "que": "El conteo en cadena solo hace saltar los naipes (+7, +7) y después un salto genérico de DAÑO y MULTI. Los Amuletos, Bendiciones y Aumentos que arman ese «Multi 10» no disparan uno por uno: la bandeja queda quieta. El desglose (`pasos`) existe en el motor, pero vive en un tooltip.",
      "por_que": "Es el pico de dopamina del género: ver tu máquina disparar pieza por pieza. Hoy un golpe con cinco piezas se ve igual que uno pelado, y el jugador no aprende qué pieza le dio el número. En golpe-02 el 340 aparece ya hecho.",
      "propuesta": "Recorrer `q.pasos` en orden: cada ficha de la bandeja salta con su +N o ×N, la cifra del panel sube en vivo y la nota sube; los × llevan hitstop. Con tope de ~900 ms y acelerando cuando hay muchas."
    },
    {
      "prioridad": "P1",
      "pantalla": "mesa (Escoba y Truco, los dos Mazos iniciales)",
      "ventana": "todas",
      "archivo": "src/rules/balance-config.json:63-67 y :136-158 · src/rules/combate.ts:254 · src/rules/bot.ts:36",
      "que": "Con mano de 3 hay 7 golpes posibles y la mesa ya te dice el total de cada uno: se elige el número más grande. El Golpe exacto, la única mecánica de puzzle, sale 0,4-1,9 veces por partida aun con un bot que lo busca. Los cantos tampoco son un grito: Truco canta 26,5 veces por partida (rutina) y Chancho 1,7 (ausente).",
      "por_que": "Cetro (recarga con exacto), Hoja y broquel y la Racha se apoyan en algo que no se puede construir: es suerte. Y la primera impresión del juego son dos Mazos donde el golpe casi no se decide.",
      "propuesta": "Mano de 4 jugando hasta 3 en Escoba y Truco (14 golpes posibles, mismo sabor de mesa). Exacto «al pelo»: una sobra de hasta 5 % de la Vida máxima mantiene la Racha y recarga el Cetro; el oro queda para el exacto puro. Envido con su Multi extra solo la primera vez por enemigo; Chancho canta también con Pierna, a medio premio."
    }
  ],
  "aciertos": [
    "DAÑO × MULTI = TOTAL con «¡EXACTO!», «te pega N» y «le quedan N» antes de soltar: el golpe se entiende sin leer reglas (mesa-seleccion, 1280 y 390).",
    "El naipe que se raja con el total encima y el retrato que sonríe (golpe-04 y golpe-06): el remate tiene peso.",
    "El Fogón en tres pasadas (fogon-suspenso) es la mejor decisión de riesgo del juego: apuesta chica, legible y con premio que cambia el naipe.",
    "La build de la banca (Cofre, Peso fuerte, Filo dorado, Interés compuesto) sí cambia cómo jugás la Pulpería: es la única de las tres que simulé que se siente distinta.",
    "Inmune de una sola regla, con los palos por venir a la vista en el Mapa: planificar la ruta tiene sentido.",
    "Las Legendarias de la 0.12.0 (Cetro, Cascabel, Naipe de dos caras) y los × Prismáticos apilan de verdad: el mejor golpe de 37.422 existe."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/mesa.png",
    "visual-qa/1280x800/mesa-seleccion.png",
    "visual-qa/1280x800/mesa-rey.png",
    "visual-qa/1280x800/mesa-mentiroso.png",
    "visual-qa/1280x800/elegi-una.png",
    "visual-qa/1280x800/elegi-amuleto.png",
    "visual-qa/1280x800/elegi-bendicion.png",
    "visual-qa/1280x800/cabala.png",
    "visual-qa/1280x800/pulperia.png",
    "visual-qa/1280x800/fogon.png",
    "visual-qa/1280x800/mapa.png",
    "visual-qa/1280x800/jugadas.png",
    "visual-qa/1280x800/piezas.png",
    "visual-qa/1280x800/fin-victoria.png",
    "visual-qa/1280x800/fin-derrota.png",
    "visual-qa/390x844/mesa-seleccion.png",
    "jurado/secuencias/1280-golpe-02.png",
    "jurado/secuencias/1280-golpe-04.png",
    "jurado/secuencias/1280-golpe-06.png",
    "jurado/secuencias/1280-golpe-09.png",
    "jurado/secuencias/1280-botin-brota-04.png",
    "jurado/secuencias/1280-botin-brota-09.png",
    "jurado/secuencias/1280-rey-irrumpe-04.png",
    "mirar/1280-mesa-grito.png",
    "mirar/1280-rey-cae.png",
    "mirar/1280-conteo.png",
    "mirar/1280-fogon-suspenso.png"
  ]
}
```

## Veredicto

CÁBALA tiene el esqueleto correcto y un remate de golpe que da gusto, pero todavía no es un juego que recomendaría sin peros. El bucle se lee bien y se decide poco, y las builds se parecen demasiado cuando la partida se pone seria.

Simulé tres builds con las piezas reales:

- **Banca (Escoba):** Cofre, Peso fuerte, Filo dorado e Interés compuesto. Es la única que cambia tu conducta: no comprás, y la Pulpería se vuelve un dilema. Funciona.
- **Muro de Bastos (Chinchón):** Poncho, Boleadoras, Empalizada, Contragolpe y Palo y palo. Divertida en el tramo 1. Desde el Caballo del tramo 2, el Escudo de 20 ya no frena nada entero, y un Contragolpe de 22 contra 3.500 de Vida es una caricia. Se muere sola.
- **Cantos (Truco):** Cascabel, Mano Caliente y Facón. Pega fuerte, pero «dos del mismo palo» sale casi todos los turnos con mano de 3: no hay grito, hay trámite.

Las tres terminan sumando al mismo montón de «+1 o +2 de Multi con condición». Lo que de verdad las separa son los × (canto, Cetro, Vale Cuatro, Falta Envido, Contraflor), y esos llegan tarde y por sorteo.

**Reyes.** Son más saco de Vida que clímax: 4-5 golpes contra 2,8 de una Guardia, con rasgos numéricos que no te hacen jugar distinto. El del Bacanal casi no se nota en el tramo 3: cura 133 por turno sobre unos 3.500 de Vida.

**Bufón y Cábala.** Como presencia, excelente. Como mecánica, liviano: en `cabala.png` apostás 10 de oro con 96 en la bolsa.

**Lo que no vi.** Sonido, hitstop y el canto en grande los leí en código (`mesa.ts:291-309`), no los vi. Del Rey que irrumpe abrí un solo cuadro, y es idéntico a la mesa quieta.

## Defectos menores

- La regla estrella de Escoba dice «Multi ×2» y el motor aplica ×3 (visto en `jugadas.png` y en la tabla de Mazos de `REGLAS.md`): `src/rules/mazos.ts:33` contra `balance-config.json:141`.
- Los cuatro Comunes son la misma pieza recoloreada (+3 de Daño por carta), irrelevante en el tramo 3 (hasta +9 sobre unos 120 de Daño), y la tienda los saca 45 % de las veces; en `pulperia.png` hay tres clones en venta: `src/rules/amuletos.ts:33-46`, `src/rules/partida.ts:70`.
- Las Cábalas no escalan con el tramo ni con tu bolsa, y todos los rechazos dicen «El Bufón se ofende un poco»: `src/rules/bufon.ts:95-101` y `:207-219`.
- Vale Cuatro lleva ★ SINERGIA «Para Truco», pero el Envido exige exactamente 2 cartas y Vale Cuatro toda la mano: se pisan. En manos cortas es un ×2 gratis que deja a Contraflor (×2 por 60 % de Vida) como opción falsa: `src/rules/aumentos.ts:46`, `src/rules/combate.ts:102` y `:242`.
- El tramo 1 no mata en Truco, Mentiroso y Chancho (14, 29 y 8 caídas de 3.000): cinco minutos sin riesgo en cada partida: `balance-config.json:85-89`.

## Qué haría en la próxima versión

Una versión «Que cada pieza suene y cada build llegue viva al final». Tres cosas:

1. **Conteo pieza por pieza desde `q.pasos`**, con la bandeja disparando en orden. Es el cambio de mayor retorno en diversión y no toca el balance.
2. **Escalar el lado del jugador por tramo** (tope de Escudo, Bastos, Copas, Contragolpe proporcional) y convertir los cuatro Comunes en piezas que crecen: +3 por carta y +1 por cada punto de la carga de su Rey. Así el muro de Bastos y la build de Copas llegan al tramo 3 como builds y no como recuerdos.
3. **Darle palanca al exacto y aire a la mano**: mano de 4 jugando 3 en Escoba y Truco, exacto «al pelo» para sostener Racha y Cetro, y rasgos de Rey que cambien la jugada. Por ejemplo, un Caudillo que castiga repetir la misma jugada, o un Bacanal que se cura lo que vos te curás.

Todo con Multi entero, 15 Amuletos y 5 Mazos intactos. Después, laboratorio completo: esto mueve las tasas de victoria y hay que reajustar la Vida del tramo 3.
