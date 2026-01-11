const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Question = require('./models/Question'); // Asegúrate que la ruta sea correcta

dotenv.config();

// --- 1. CONFIGURACIÓN Y HELPER ---
const TARGET_PER_CATEGORY = 50; // Meta: 50 preguntas por categoría

// Función auxiliar para crear objetos de forma compacta
const createQ = (text, options, correctIndex, category, difficulty) => ({
    questionText: text,
    options: options,
    correctAnswerIndex: correctIndex,
    category: category,
    difficulty: difficulty
});

// --- 2. BANCO DE PREGUNTAS (Datos Reales) ---
const rawQuestions = [
    // --- CIENCIA ---
    createQ("¿Cuál es el símbolo químico del oro?", ["Au", "Ag", "Fe", "Cu"], 0, "Ciencia", "easy"),
    createQ("¿Qué planeta es el Planeta Rojo?", ["Venus", "Marte", "Júpiter", "Saturno"], 1, "Ciencia", "easy"),
    createQ("¿Órgano más grande del cuerpo?", ["Corazón", "Hígado", "Piel", "Pulmones"], 2, "Ciencia", "medium"),
    createQ("¿Qué gas necesitan los humanos para respirar?", ["Oxígeno", "Hidrógeno", "Carbono", "Helio"], 0, "Ciencia", "easy"),
    createQ("¿Cuántos huesos tiene un adulto?", ["206", "208", "210", "200"], 0, "Ciencia", "medium"),
    createQ("¿Quién propuso la relatividad?", ["Newton", "Einstein", "Tesla", "Galileo"], 1, "Ciencia", "hard"),
    createQ("¿Qué estudia la botánica?", ["Animales", "Rocas", "Plantas", "Estrellas"], 2, "Ciencia", "easy"),
    createQ("¿Cuál es el animal más rápido?", ["Guepardo", "León", "Águila", "Caballo"], 0, "Ciencia", "medium"),
    createQ("¿Fórmula química del agua?", ["HO2", "H2O", "O2H", "H2O2"], 1, "Ciencia", "easy"),
    createQ("¿Centro del sistema solar?", ["Tierra", "Luna", "Sol", "Marte"], 2, "Ciencia", "easy"),
    createQ("¿Partícula con carga negativa?", ["Protón", "Neutrón", "Electrón", "Fotón"], 2, "Ciencia", "hard"),
    createQ("¿Metal líquido a temperatura ambiente?", ["Hierro", "Mercurio", "Oro", "Plata"], 1, "Ciencia", "medium"),
    createQ("¿Qué miden los años luz?", ["Tiempo", "Distancia", "Luz", "Velocidad"], 1, "Ciencia", "hard"),
    createQ("¿El hueso más largo del cuerpo?", ["Fémur", "Tibia", "Radio", "Húmero"], 0, "Ciencia", "medium"),
    createQ("¿Proceso de las plantas para alimentarse?", ["Respiración", "Fotosíntesis", "Osmosis", "Digestión"], 1, "Ciencia", "medium"),
    createQ("¿Cuántos dientes tiene un adulto?", ["28", "30", "32", "34"], 2, "Ciencia", "medium"),
    createQ("¿Quién descubrió la penicilina?", ["Fleming", "Pasteur", "Curie", "Darwin"], 0, "Ciencia", "hard"),
    createQ("¿Planeta más grande del sistema solar?", ["Saturno", "Júpiter", "Urano", "Neptuno"], 1, "Ciencia", "easy"),
    createQ("¿Reino de los hongos?", ["Plantae", "Animalia", "Fungi", "Protista"], 2, "Ciencia", "medium"),
    createQ("¿Gas más abundante en la atmósfera?", ["Oxígeno", "Nitrógeno", "Argón", "CO2"], 1, "Ciencia", "hard"),

    // --- HISTORIA ---
    createQ("¿Quién descubrió América?", ["Colón", "Vespucio", "Magallanes", "Cortés"], 0, "Historia", "easy"),
    createQ("¿Inicio de la Segunda Guerra Mundial?", ["1914", "1939", "1945", "1929"], 1, "Historia", "medium"),
    createQ("¿Primer presidente de EE.UU.?", ["Jefferson", "Lincoln", "Washington", "Franklin"], 2, "Historia", "easy"),
    createQ("¿Civilización de Machu Picchu?", ["Maya", "Azteca", "Inca", "Olmeca"], 2, "Historia", "medium"),
    createQ("¿Quién pintó la Mona Lisa?", ["Miguel Ángel", "Da Vinci", "Rafael", "Donatello"], 1, "Historia", "easy"),
    createQ("¿Moneda antes del Euro en España?", ["Peso", "Franco", "Peseta", "Lira"], 2, "Historia", "medium"),
    createQ("¿Revolución Francesa?", ["1776", "1789", "1810", "1492"], 1, "Historia", "hard"),
    createQ("¿Quién dijo 'Veni, vidi, vici'?", ["Alejandro Magno", "Julio César", "Napoleón", "Nerón"], 1, "Historia", "hard"),
    createQ("¿Año de caída del Muro de Berlín?", ["1987", "1989", "1991", "1990"], 1, "Historia", "medium"),
    createQ("¿Libertador de 5 naciones?", ["San Martín", "Bolívar", "Sucre", "O'Higgins"], 1, "Historia", "medium"),
    createQ("¿Imperio que construyó el Coliseo?", ["Griego", "Romano", "Egipcio", "Otomano"], 1, "Historia", "easy"),
    createQ("¿Primer hombre en la Luna?", ["Gagarin", "Armstrong", "Aldrin", "Collins"], 1, "Historia", "medium"),
    createQ("¿Diosa griega de la sabiduría?", ["Afrodita", "Hera", "Atenea", "Artemisa"], 2, "Historia", "medium"),
    createQ("¿Guerra entre el Norte y Sur de EE.UU.?", ["Revolución", "Secesión", "Fría", "Vietnam"], 1, "Historia", "hard"),
    createQ("¿País de los Faraones?", ["Irán", "Irak", "Egipto", "Siria"], 2, "Historia", "easy"),
    createQ("¿Inventor de la imprenta?", ["Gutenberg", "Edison", "Bell", "Tesla"], 0, "Historia", "medium"),
    createQ("¿Esposa de Napoleón?", ["María Antonieta", "Josefina", "Cleopatra", "Isabel"], 1, "Historia", "hard"),
    createQ("¿Siglo del Renacimiento?", ["X", "XV-XVI", "XVIII", "XX"], 1, "Historia", "hard"),
    createQ("¿Civilización de las pirámides?", ["Egipcia", "Sumeria", "Babilónica", "Persa"], 0, "Historia", "easy"),
    createQ("¿Héroe de la independencia de Perú?", ["Túpac Amaru II", "Grau", "Bolognesi", "Quiñones"], 0, "Historia", "medium"),

    // --- DEPORTES ---
    createQ("¿Jugadores en cancha de fútbol?", ["9", "10", "11", "12"], 2, "Deportes", "easy"),
    createQ("¿Deporte con raqueta?", ["Fútbol", "Tenis", "Basket", "Natación"], 1, "Deportes", "easy"),
    createQ("¿Campeón mundial fútbol 2022?", ["Francia", "Brasil", "Argentina", "Alemania"], 2, "Deportes", "medium"),
    createQ("¿Apodo 'King James'?", ["Jordan", "Bryant", "LeBron", "Curry"], 2, "Deportes", "medium"),
    createQ("¿Duración partido de fútbol?", ["45 min", "60 min", "90 min", "100 min"], 2, "Deportes", "easy"),
    createQ("¿Deporte de Michael Phelps?", ["Atletismo", "Natación", "Ciclismo", "Boxeo"], 1, "Deportes", "easy"),
    createQ("¿País de origen del Judo?", ["China", "Corea", "Japón", "Tailandia"], 2, "Deportes", "medium"),
    createQ("¿Balones de Oro de Messi (aprox)?", ["3", "5", "8", "10"], 2, "Deportes", "medium"),
    createQ("¿Super Bowl es de qué deporte?", ["Béisbol", "Fútbol Americano", "Basket", "Hockey"], 1, "Deportes", "easy"),
    createQ("¿Usain Bolt es...?", ["Nadador", "Velocista", "Saltador", "Lanzador"], 1, "Deportes", "easy"),
    createQ("¿Equipo conocido como 'Merengues'?", ["Barcelona", "Real Madrid", "Atlético", "Sevilla"], 1, "Deportes", "medium"),
    createQ("¿Color camiseta Ferrari F1?", ["Azul", "Negro", "Rojo", "Amarillo"], 2, "Deportes", "easy"),
    createQ("¿Grand Slam se juega en...?", ["Tenis", "Golf", "Rugby", "Ambos A y B"], 3, "Deportes", "hard"),
    createQ("¿Sede Juegos Olímpicos 2024?", ["Tokio", "Los Ángeles", "París", "Londres"], 2, "Deportes", "medium"),
    createQ("¿Deporte con bate y base?", ["Críquet", "Béisbol", "Ambos", "Ninguno"], 2, "Deportes", "medium"),
    createQ("¿Máximo goleador histórico (aprox)?", ["Pelé", "Messi", "CR7", "Romario"], 2, "Deportes", "hard"),
    createQ("¿Anillos olímpicos colores?", ["3", "4", "5", "6"], 2, "Deportes", "easy"),
    createQ("¿NBA significa...?", ["National Basketball Association", "North Basket Area", "National Ball Assn", "New Basket Age"], 0, "Deportes", "medium"),
    createQ("¿Copa Libertadores es de...?", ["Europa", "Asia", "Sudamérica", "África"], 2, "Deportes", "easy"),
    createQ("¿Deporte de los All Blacks?", ["Fútbol", "Rugby", "Volley", "Tenis"], 1, "Deportes", "medium"),

    // --- ARTE ---
    createQ("¿Pintor de 'La noche estrellada'?", ["Picasso", "Van Gogh", "Monet", "Dalí"], 1, "Arte", "hard"),
    createQ("¿Estilo de Salvador Dalí?", ["Cubismo", "Surrealismo", "Impresionismo", "Realismo"], 1, "Arte", "medium"),
    createQ("¿Autor del Guernica?", ["Miró", "Picasso", "Velázquez", "Goya"], 1, "Arte", "medium"),
    createQ("¿Escultura 'El Pensador' es de...?", ["Rodin", "Donatello", "Bernini", "Miguel Ángel"], 0, "Arte", "hard"),
    createQ("¿Arte de plegar papel?", ["Ikebana", "Origami", "Kirigami", "Haiku"], 1, "Arte", "easy"),
    createQ("¿Museo del Louvre está en...?", ["Londres", "Roma", "París", "Berlín"], 2, "Arte", "easy"),
    createQ("¿Quién pintó la Capilla Sixtina?", ["Rafael", "Miguel Ángel", "Da Vinci", "Botticelli"], 1, "Arte", "medium"),
    createQ("¿Frida Kahlo era de...?", ["España", "Colombia", "México", "Argentina"], 2, "Arte", "easy"),
    createQ("¿Movimiento de Claude Monet?", ["Barroco", "Gótico", "Impresionismo", "Pop Art"], 2, "Arte", "hard"),
    createQ("¿Venus de Milo tiene brazos?", ["Sí", "No", "Solo uno", "Es una cabeza"], 1, "Arte", "medium"),
    createQ("¿Ciudad de la arquitectura Gaudí?", ["Madrid", "Bilbao", "Barcelona", "Valencia"], 2, "Arte", "medium"),
    createQ("¿Autor de 'El Grito'?", ["Munch", "Klimt", "Kandinsky", "Warhol"], 0, "Arte", "hard"),
    createQ("¿Pintura mural fresca se llama...?", ["Óleo", "Acuarela", "Fresco", "Temple"], 2, "Arte", "medium"),
    createQ("¿Arte callejero famoso?", ["Banksy", "Hirst", "Koons", "Basquiat"], 0, "Arte", "medium"),
    createQ("¿Andy Warhol es padre del...?", ["Cubismo", "Pop Art", "Dadaísmo", "Futurismo"], 1, "Arte", "easy"),
    createQ("¿Fernando Botero es famoso por...?", ["Flacos", "Volumen/Gordos", "Paisajes", "Abstracto"], 1, "Arte", "easy"),
    createQ("¿Última Cena es de...?", ["Da Vinci", "Tintoretto", "Veronés", "Giotto"], 0, "Arte", "medium"),
    createQ("¿David de Miguel Ángel es de...?", ["Bronce", "Madera", "Mármol", "Yeso"], 2, "Arte", "medium"),
    createQ("¿Cuna del Renacimiento?", ["Florencia", "Venecia", "Roma", "Milán"], 0, "Arte", "hard"),
    createQ("¿Color primario?", ["Verde", "Naranja", "Azul", "Violeta"], 2, "Arte", "easy"),

    // --- GEOGRAFIA ---
    createQ("¿País más grande del mundo?", ["China", "EE.UU.", "Rusia", "Canadá"], 2, "Geografía", "easy"),
    createQ("¿Capital de Francia?", ["Londres", "Berlín", "Madrid", "París"], 3, "Geografía", "easy"),
    createQ("¿Continente de Egipto?", ["Asia", "África", "Europa", "América"], 1, "Geografía", "easy"),
    createQ("¿Río más largo del mundo?", ["Nilo", "Amazonas", "Yangtsé", "Misisipi"], 1, "Geografía", "medium"),
    createQ("¿Capital de Japón?", ["Seúl", "Pekín", "Tokio", "Kioto"], 2, "Geografía", "easy"),
    createQ("¿Desierto más grande?", ["Sahara", "Gobi", "Antártida", "Atacama"], 2, "Geografía", "hard"), // Antártida es desierto polar
    createQ("¿Dónde está el Everest?", ["Andes", "Alpes", "Himalaya", "Rocosas"], 2, "Geografía", "medium"),
    createQ("¿Océano más grande?", ["Atlántico", "Índico", "Pacífico", "Ártico"], 2, "Geografía", "easy"),
    createQ("¿País con forma de bota?", ["Grecia", "Italia", "España", "Portugal"], 1, "Geografía", "easy"),
    createQ("¿Capital de Perú?", ["Lima", "Cusco", "Arequipa", "Trujillo"], 0, "Geografía", "easy"),
    createQ("¿Continente más poblado?", ["África", "América", "Europa", "Asia"], 3, "Geografía", "medium"),
    createQ("¿Canal que une Atlántico y Pacífico?", ["Suez", "Panamá", "Corinto", "Kiel"], 1, "Geografía", "medium"),
    createQ("¿Capital de Alemania?", ["Múnich", "Hamburgo", "Berlín", "Frankfurt"], 2, "Geografía", "medium"),
    createQ("¿Selva más grande?", ["Congo", "Amazonas", "Borneo", "Darién"], 1, "Geografía", "easy"),
    createQ("¿País de los canguros?", ["Nueva Zelanda", "Austria", "Australia", "Sudáfrica"], 2, "Geografía", "easy"),
    createQ("¿Monte más alto de América?", ["Huascarán", "Aconcagua", "Denali", "Chimborazo"], 1, "Geografía", "hard"),
    createQ("¿Capital de España?", ["Barcelona", "Valencia", "Sevilla", "Madrid"], 3, "Geografía", "easy"),
    createQ("¿Dónde queda la Torre Eiffel?", ["Italia", "Francia", "Inglaterra", "Bélgica"], 1, "Geografía", "easy"),
    createQ("¿Río que cruza Londres?", ["Sena", "Danubio", "Támesis", "Rin"], 2, "Geografía", "medium"),
    createQ("¿País con más islas?", ["Filipinas", "Indonesia", "Suecia", "Japón"], 2, "Geografía", "hard"),

    // --- ENTRETENIMIENTO ---
    createQ("¿Protagonista de Dragon Ball?", ["Vegeta", "Goku", "Gohan", "Piccolo"], 1, "Entretenimiento", "easy"),
    createQ("¿Quién es Bruce Wayne?", ["Superman", "Batman", "Spider-Man", "Iron Man"], 1, "Entretenimiento", "easy"),
    createQ("¿Muñeco de nieve en Frozen?", ["Sven", "Kristoff", "Olaf", "Hans"], 2, "Entretenimiento", "easy"),
    createQ("¿Actor de Jack Sparrow?", ["Brad Pitt", "Tom Cruise", "Johnny Depp", "Will Smith"], 2, "Entretenimiento", "easy"),
    createQ("¿Creador de Star Wars?", ["Spielberg", "Lucas", "Cameron", "Nolan"], 1, "Entretenimiento", "medium"),
    createQ("¿Banda de Freddie Mercury?", ["Beatles", "Queen", "Stones", "Led Zeppelin"], 1, "Entretenimiento", "easy"),
    createQ("¿Película con más Oscars?", ["Titanic", "Avatar", "Star Wars", "Matrix"], 0, "Entretenimiento", "medium"),
    createQ("¿Nombre de Baby Yoda?", ["Grogu", "Yoda Jr", "Mando", "Luke"], 0, "Entretenimiento", "medium"),
    createQ("¿Quién vive en una piña?", ["Patricio", "Calamardo", "Bob Esponja", "Arenita"], 2, "Entretenimiento", "easy"),
    createQ("¿Plataforma de streaming 'N' roja?", ["Hulu", "Amazon", "Netflix", "HBO"], 2, "Entretenimiento", "easy"),
    createQ("¿Villano de Avengers?", ["Joker", "Thanos", "Loki", "Ultron"], 1, "Entretenimiento", "easy"),
    createQ("¿Mago famoso de libros?", ["Gandalf", "Harry Potter", "Merlín", "Dr. Strange"], 1, "Entretenimiento", "easy"),
    createQ("¿Autor de Juego de Tronos?", ["Tolkien", "King", "Martin", "Rowling"], 2, "Entretenimiento", "hard"),
    createQ("¿Videojuego de fontanero?", ["Zelda", "Sonic", "Mario", "Pacman"], 2, "Entretenimiento", "easy"),
    createQ("¿Compañía dueña de PlayStation?", ["Microsoft", "Sega", "Sony", "Nintendo"], 2, "Entretenimiento", "medium"),
    createQ("¿Quién canta 'Thriller'?", ["Prince", "Elvis", "Madonna", "Michael Jackson"], 3, "Entretenimiento", "easy"),
    createQ("¿Ciudad de Batman?", ["Metrópolis", "Gotham", "Star City", "Central City"], 1, "Entretenimiento", "medium"),
    createQ("¿Agente 007?", ["Bond", "Hunt", "Bourne", "Wick"], 0, "Entretenimiento", "easy"),
    createQ("¿Shrek es un...?", ["Humano", "Ogro", "Elfo", "Dragón"], 1, "Entretenimiento", "easy"),
    createQ("¿Anime de piratas?", ["Naruto", "Bleach", "One Piece", "Dragon Ball"], 2, "Entretenimiento", "medium")
];

// --- 3. LÓGICA DE SEEDING ---
const seedDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/triviamania');
        console.log('✅ MongoDB Conectado');

        await Question.deleteMany({});
        console.log('🗑️  Colección limpia');

        let finalQuestions = [...rawQuestions];

        // LOGICA DE RELLENO INTELIGENTE
        // Si quieres exactamente 50 por categoría, esto rellena los huecos
        const categories = ["Ciencia", "Historia", "Deportes", "Arte", "Geografía", "Entretenimiento"];

        categories.forEach(cat => {
            const currentCatQuestions = rawQuestions.filter(q => q.category === cat);
            let count = currentCatQuestions.length;

            // Si hay menos de 50, clonamos y variamos ligeramente para llegar a 50
            // Esto es ideal para stress-testing (pruebas de carga)
            if (count < TARGET_PER_CATEGORY) {
                console.log(`⚠️ Generando ${TARGET_PER_CATEGORY - count} preguntas extra para: ${cat}`);
                let i = 0;
                while (count < TARGET_PER_CATEGORY) {
                    const baseQ = currentCatQuestions[i % currentCatQuestions.length];
                    finalQuestions.push({
                        ...baseQ,
                        // No text variation needed, allow exact duplicates for filler
                        questionText: baseQ.questionText,
                        difficulty: "medium" // Estandarizamos las generadas
                    });
                    count++;
                    i++;
                }
            }
        });

        // Insertar todo de una vez
        await Question.insertMany(finalQuestions);
        console.log(`🎉 ¡Éxito! Se han insertado ${finalQuestions.length} preguntas en total.`);

        // Resumen por categoría
        categories.forEach(cat => {
            const num = finalQuestions.filter(q => q.category === cat).length;
            console.log(`   - ${cat}: ${num}`);
        });

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();