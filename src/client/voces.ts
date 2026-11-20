// La voz del Bufón: el único anfitrión del juego, un chanta rioplatense que te chamuya en bocadillos cortos. Habla
// distinto según su humor (garca, neutral, de tu lado). Los tres comentarios del primer combate son toda la guía:
// el juego se aprende jugando.
import type { Humor } from '../rules/bufon';
import type { MazoId } from '../rules/mazos';

type Par = { es: string; en: string };
const P = (es: string, en: string): Par => ({ es, en });

/** Los tres comentarios del Bufón en el primer combate de un jugador nuevo (uno por turno). */
export const ENSENANZA: readonly Par[] = [
  P('Elegí cartas que armen jugada y arrastralas al enemigo. Así de fácil.', 'Pick cards that make a play and drag them onto the enemy. That easy.'),
  P('Cada palo hace lo suyo: Bastos cubren, Copas curan, Oros pagan, Espadas atraviesan.', 'Each suit does its thing: Clubs shield, Cups heal, Coins pay, Swords pierce.'),
  P('Ojo: cada enemigo es Inmune a su propio palo. No le tires sus cartas.', 'Careful: each enemy is Immune to its own suit. Do not throw its cards at it.'),
];

export const VOZ = {
  portada: [P('¿Una manito? La casa siempre pierde… dicen.', 'A quick hand? The house always loses… they say.'), P('Pasá, pasá. Las cartas no muerden. Los Reyes sí.', 'Come in, come in. Cards do not bite. Kings do.'), P('Todo es cuestión de cábala, compadre.', 'It all comes down to cábala, friend.')],
  mazo: {
    escoba: P('Quince justo y barrés la mesa. Ni catorce ni dieciséis.', 'Exactly fifteen and you sweep the table. Not fourteen, not sixteen.'),
    truco: P('Con el ancho de espadas en la mano, mentí tranquilo.', 'With the ace of swords in hand, lie at ease.'),
    chinchon: P('Juntá de a tres, del mismo palo. El resto es ruido.', 'Collect in threes, same suit. The rest is noise.'),
    mentiroso: P('Si lo decís con cara de piedra, es verdad.', 'Say it with a stone face and it is true.'),
    chancho: P('El que pestañea pierde. ¡Mano al centro!', 'Blink and you lose. Hand on the pile!'),
  } as Record<MazoId, Par>,
  mapa: {
    garca: [P('Elegí camino. Total, a los Reyes ya les avisé.', 'Pick a road. I already told the Kings anyway.'), P('Por ahí vas bien… para ellos.', 'That way works… for them.')],
    torcido: [P('Vos sabrás por dónde. Yo no vi nada.', 'Your call. I saw nothing.')],
    neutral: [P('Tres caminos, un Rey al fondo. Elegí.', 'Three roads, one King at the end. Choose.'), P('La Pulpería fía poco. Pensalo.', 'The Pulpería gives little credit. Think it over.')],
    compinche: [P('Entre nos: guardá oro para la Pulpería.', 'Between us: save gold for the Pulpería.')],
    detulado: [P('Seguime, que conozco un atajo.', 'Follow me, I know a shortcut.'), P('Hoy les rompemos todo a los Reyes.', 'Tonight we wreck the Kings.')],
  } as Record<Humor, Par[]>,
  entra: [P('Ahí viene otro. Dale sin asco.', 'Here comes another. Hit without mercy.'), P('Baraja nueva, cara nueva.', 'New deal, new face.')],
  entraRey: [P('Ojo, que este cobra con intereses.', 'Careful, this one charges interest.'), P('El patrón en persona. Portate bien.', 'The boss himself. Behave.')],
  exacto: [P('¡Justito! Ni un poroto de más.', 'Right on the nose! Not a bean over.'), P('¡Clavado! Así se cuenta.', 'Nailed it! That is how you count.')],
  canto: [P('¡Eso! Cantalo fuerte.', 'That is it! Call it loud.'), P('¡Se la cantaste en la cara!', 'You called it to their face!')],
  fuerte: [P('¡Tomá mate!', 'Take that!'), P('Uh. Eso dolió hasta acá.', 'Ooh. I felt that from here.')],
  contra: [P('Y bue. A veces te toca.', 'Oh well. Sometimes it is your turn.'), P('Te vi la cara. Dolió.', 'I saw your face. That hurt.')],
  frenado: [P('¡Ni te tocó!', 'Never touched you!')],
  pocaVida: [P('Estás para el cachetazo. Curate o rezá.', 'One slap from done. Heal or pray.'), P('Te queda un hilo. Jugá fino.', 'You hang by a thread. Play sharp.')],
  inmune: [P('A ese no le entra su propio palo. Cambiá de cartas.', 'His own suit does nothing to him. Switch cards.')],
  noJugada: [P('Eso no arma nada. Juntá iguales, seguidas o del mismo palo.', 'That makes nothing. Match numbers, runs or suits.')],
  aturde: [P('Lo dejaste viendo estrellas.', 'You have him seeing stars.')],
  victoria: [P('Limpito. Pasá a cobrar.', 'Clean. Come collect.'), P('Otro que se va al mazo.', 'Another one folds.')],
  botin: [P('Agarrá lo tuyo. Lo mío ya lo agarré.', 'Take yours. I already took mine.')],
  cabala: [P('Elegí una. Las tres tienen trampa. O ninguna.', 'Pick one. All three are rigged. Or none.'), P('Una cábala no se explica. Se elige.', 'A cábala is not explained. It is chosen.')],
  pulperia: [P('Pasá, pasá. Precios de amigo… de amigo mío.', 'Come in. Friend prices… for my friends.'), P('Se mira y no se toca. Salvo que pagues.', 'Look, do not touch. Unless you pay.')],
  compra: [P('Buen ojo. Era el último, mirá vos.', 'Good eye. It was the last one, what do you know.')],
  sinOro: [P('Con eso no llegás ni al vuelto.', 'That will not even cover the change.')],
  purga: [P('Una menos. Ni la vas a extrañar.', 'One fewer. You will not miss it.')],
  cura: [P('Un trago y como nuevo.', 'One drink and good as new.')],
  fogon: [P('Sentate. El fuego no cobra. Yo tampoco… hoy.', 'Sit. The fire does not charge. Neither do I… tonight.')],
  altar: [P('Dejá tus porotos acá. Vuelven en suerte.', 'Leave your beans here. They come back as luck.')],
  altarCompra: [P('Bien invertido. Creo.', 'Money well spent. I think.'), P('Eso vuelve. Tarde, pero vuelve.', 'That comes back. Late, but it does.')],
  coleccion: [P('Mirá, mirá. Todo esto pasó por mis manos.', 'Look, look. All of this went through my hands.')],
  cronica: [P('Acá queda todo anotado. Hasta las que perdiste.', 'It is all written down here. Even the ones you lost.')],
  ajustes: [P('Tocá lo que quieras. Menos mi sueldo.', 'Touch whatever you like. Except my wages.')],
  elige: [P('Buena mano.', 'Good hand.'), P('Esa era la que yo quería.', 'That was the one I wanted.')],
  salta: [P('¿La dejás pasar? Vos sabrás.', 'Letting it go? Your call.')],
  descansa: [P('Dormí, que yo vigilo. Más o menos.', 'Sleep, I will keep watch. More or less.')],
  quema: [P('Al fuego. Chau, cartita.', 'Into the fire. Bye, little card.')],
  // lo que dice cuando lo dejás solo un rato
  muletilla: [
    P('¿Y? ¿Jugamos o miramos?', 'Well? Are we playing or watching?'),
    P('Yo no apuro… pero el Rey tampoco espera.', 'No rush from me… but the King will not wait either.'),
    P('Te estoy viendo, ¿eh?', 'I am watching you, eh?'),
    P('Ojo con lo que elegís, que después no hay vuelto.', 'Mind what you pick: no change given afterwards.'),
    P('Si dudás, preguntame. Total, miento igual.', 'If in doubt, ask me. I will lie anyway.'),
    P('Barajá tranquilo, que acá nadie cuenta.', 'Shuffle at ease, nobody is counting here.'),
  ],
  gano: [P('¡Cayó la Corte! Yo siempre creí en vos. Casi siempre.', 'The Court has fallen! I always believed in you. Almost always.')],
  perdio: [P('Te limpiaron. Barajamos y damos de nuevo.', 'They cleaned you out. We shuffle and deal again.'), P('La Corte gana… esta mano.', 'The Court wins… this hand.')],
} as const;
