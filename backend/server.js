require('dotenv').config({ path: './backend/.env' });
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const User = require('./models/User'); // Global import
const Room = require('./models/Room'); // Global import

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));

const activeTimers = {}; // Simple in-memory timer map

io.on('connection', (socket) => {
    console.log('👤 Usuario conectado:', socket.id);

    // Create Room
    socket.on('create-room', async ({ roomCode, username, avatar, category }) => {
        try {
            // Check if exists
            let room = await Room.findOne({ roomCode });
            if (!room) {
                room = await Room.create({
                    roomCode,
                    category: category || 'General',
                    gameState: 'waiting',
                    players: [{ username, avatar, score: 0, socketId: socket.id }],
                    currentQuestionIndex: 0
                });
                console.log(`[DB] Room ${roomCode} created by ${username}`);
            } else {
                console.log(`[DB] Room ${roomCode} already exists, re-joining host`);
            }

            socket.join(roomCode);
            socket.emit('room-created', { roomCode });
            io.to(roomCode).emit('update-players', room.players);
        } catch (err) {
            console.error('Error creating room:', err);
        }
    });

    // Join Room
    socket.on('join-room', async ({ roomCode, username, avatar }) => {
        try {
            const room = await Room.findOne({ roomCode });

            if (!room) {
                socket.emit('error', { msg: 'Sala no encontrada' });
                return;
            }

            if (room.gameState === 'playing') {
                socket.emit('error', { msg: 'La partida ya comenzó' });
                return;
            }

            socket.join(roomCode);

            // Check if player exists
            const existingPlayerIndex = room.players.findIndex(p => p.username === username);
            if (existingPlayerIndex === -1) {
                room.players.push({ username, avatar, score: 0, socketId: socket.id });
            } else {
                // Update socket ID and avatar
                room.players[existingPlayerIndex].socketId = socket.id;
                if (avatar) room.players[existingPlayerIndex].avatar = avatar;
            }

            await room.save();

            socket.emit('joined-room', { roomCode });
            io.to(roomCode).emit('update-players', room.players);
            console.log(`[DB] User ${username} joined room ${roomCode}`);
        } catch (err) {
            console.error('Error joining room:', err);
        }
    });

    // Start Game
    socket.on('start-game', async ({ roomCode }) => {
        try {
            const room = await Room.findOne({ roomCode });
            if (room) {
                room.gameState = 'playing';

                // Filter by category
                const matchStage = (room.category !== 'General' && room.category !== 'Todas')
                    ? { $match: { category: room.category } }
                    : { $match: {} };

                const questions = await require('./models/Question').aggregate([
                    matchStage,
                    { $sample: { size: 5 } }
                ]);

                room.questions = questions;
                room.currentQuestionIndex = 0;
                await room.save();

                io.to(roomCode).emit('game-started');

                setTimeout(() => {
                    sendQuestion(roomCode);
                }, 1000);
            }
        } catch (err) {
            console.error(err);
        }
    });

    // Submit Answer (with Time Bonus & Multiplier)
    socket.on('submit-answer', async ({ roomCode, username, answerIndex, timeLeft }) => {
        try {
            console.log(`[GAME] 📩 Answer received from ${username} for room ${roomCode}`);
            const room = await Room.findOne({ roomCode });

            if (!room) {
                console.error(`[GAME] ❌ Room ${roomCode} not found!`);
                return;
            }

            const currentQ = room.questions[room.currentQuestionIndex];
            const isCorrect = currentQ.correctAnswerIndex === answerIndex;

            // Find player in the room doc
            const playerIndex = room.players.findIndex(p => p.username === username);

            if (playerIndex !== -1) {
                if (isCorrect) {
                    const totalTime = 15;
                    const percentage = (timeLeft || 0) / totalTime;
                    const points = Math.ceil(100 * percentage);

                    console.log(`[GAME] ✅ User ${username} answered CORRECTLY. Points: ${points}`);

                    // Update Room Player Score (in JS array directly)
                    room.players[playerIndex].score += points;

                    // Update User Global Score (Independent query)
                    await User.findOneAndUpdate(
                        { username: { $regex: new RegExp("^" + username + "$", "i") } },
                        { $inc: { points: points }, $set: { lastActive: new Date() } }
                    ).catch(e => console.error("Global score update invalid", e));
                } else {
                    console.log(`[GAME] ❌ User ${username} answered INCORRECTLY.`);
                }
            } else {
                console.error(`[GAME] ❌ Player ${username} not found in room roster.`);
            }

            // Increment answered count
            // We use JS increment then save whole document. Safer than mix of $inc and save.
            room.answeredCount = (room.answeredCount || 0) + 1;

            // Mark modified just in case
            room.markModified('players');
            await room.save();

            // Send updated leaderboard immediately
            io.to(roomCode).emit('update-leaderboard', room.players);

            // Check if all players answered
            if (room.answeredCount >= room.players.length) {
                if (activeTimers[roomCode]) clearTimeout(activeTimers[roomCode]);

                const currentQ = room.questions[room.currentQuestionIndex];
                io.to(roomCode).emit('question-results', {
                    correctAnswerIndex: currentQ.correctAnswerIndex
                });

                activeTimers[roomCode] = setTimeout(() => {
                    incrementQuestionIndex(roomCode);
                }, 3000);
            }

        } catch (err) {
            console.error("Error in submit-answer:", err);
        }
    });

    const sendQuestion = async (roomCode) => {
        try {
            const room = await Room.findOne({ roomCode });
            if (!room) return;

            if (activeTimers[roomCode]) clearTimeout(activeTimers[roomCode]);

            if (room.currentQuestionIndex < room.questions.length) {
                // Reset answered count
                room.answeredCount = 0;
                await room.save();

                const q = room.questions[room.currentQuestionIndex];
                io.to(roomCode).emit('receive-question', {
                    questionText: q.questionText,
                    options: q.options,
                    category: q.category,
                    total: room.questions.length,
                    current: room.currentQuestionIndex + 1
                });

                // Auto-advance after 18 seconds (15s game time + 3s buffer)
                activeTimers[roomCode] = setTimeout(() => {
                    incrementQuestionIndex(roomCode);
                }, 18000);

            } else {
                room.gameState = 'finished';
                await room.save();
                io.to(roomCode).emit('game-ended', room.players);

                // Update gamesPlayed for all players
                room.players.forEach(p => {
                    User.findOneAndUpdate(
                        { username: p.username },
                        { $inc: { gamesPlayed: 1 } }
                    ).catch(e => console.error(e));
                });
            }
        } catch (err) {
            console.error("Error in sendQuestion:", err);
        }
    };

    const incrementQuestionIndex = async (roomCode) => {
        const room = await Room.findOne({ roomCode });
        if (room) {
            room.currentQuestionIndex++;
            await room.save();
            sendQuestion(roomCode);
        }
    };

    socket.on('next-question', ({ roomCode }) => {
        if (activeTimers[roomCode]) clearTimeout(activeTimers[roomCode]);
        incrementQuestionIndex(roomCode);
    });

    socket.on('disconnect', async () => {
        console.log('Client disconnected', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
