const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true, // No puede haber dos nombres iguales
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    points: {
        type: Number,
        default: 0 // Todos empiezan en cero
    },
    gamesPlayed: {
        type: Number,
        default: 0
    },
    avatar: {
        type: String,
        default: 'robot_1'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);
