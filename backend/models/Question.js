const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    category: {
        type: String,
        required: true,
        enum: ['Historia', 'Ciencia', 'Deportes', 'Arte', 'Entretenimiento', 'Geografía'] // Solo permite estas categorías
    },
    options: [
        { type: String, required: true } // Un array de 4 cuerdas
    ],
    correctAnswerIndex: {
        type: Number,
        required: true // El índice (0, 1, 2 o 3) de la opción correcta
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    }
});

module.exports = mongoose.model('Question', QuestionSchema);
