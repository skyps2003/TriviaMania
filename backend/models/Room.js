const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    roomCode: { type: String, required: true, unique: true },
    category: { type: String, default: 'General' },
    gameState: { type: String, enum: ['waiting', 'playing', 'finished'], default: 'waiting' },
    players: [{
        username: String,
        avatar: String,
        score: { type: Number, default: 0 },
        socketId: String
    }],
    currentQuestionIndex: { type: Number, default: 0 },
    answeredCount: { type: Number, default: 0 },
    questions: [], // We store the full question objects here for simplicity in this MVP
    createdAt: { type: Date, default: Date.now, expires: 3600 } // Auto-delete after 1 hour
});

module.exports = mongoose.model('Room', RoomSchema);
