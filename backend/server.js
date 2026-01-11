require('dotenv').config({ path: './backend/.env' });
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');

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

const rooms = {};

io.on('connection', (socket) => {
    console.log('👤 Usuario conectado:', socket.id);

    // Create Room
    socket.on('create-room', ({ roomCode, username, avatar, category }) => {
        if (!rooms[roomCode]) {
            rooms[roomCode] = {
                host: socket.id,
                category: category || 'General',
                players: [],
                gameState: 'waiting',
                scores: {},
                questions: [],
                currentQuestionIndex: 0
            };

            // Auto join host
            socket.join(roomCode);
            rooms[roomCode].players.push({ id: socket.id, username, avatar, score: 0 });
            rooms[roomCode].scores[username] = 0;

            socket.emit('room-created', { roomCode });
            io.to(roomCode).emit('update-players', rooms[roomCode].players);
            console.log(`Room ${roomCode} created by ${username}`);
        }
    });

    // Join Room
    socket.on('join-room', ({ roomCode, username, avatar }) => {
        const room = rooms[roomCode];

        if (!room) {
            socket.emit('error', { msg: 'Sala no encontrada' });
            return;
        }

        if (room.gameState === 'playing') {
            socket.emit('error', { msg: 'La partida ya comenzó' });
            return;
        }

        socket.join(roomCode);

        const existingPlayer = room.players.find(p => p.username === username);
        if (!existingPlayer) {
            room.players.push({ id: socket.id, username, avatar, score: 0 });
            room.scores[username] = 0;
        } else {
            existingPlayer.id = socket.id;
            // Update avatar if changed (optional but good)
            if (avatar) existingPlayer.avatar = avatar;
        }

        socket.emit('joined-room', { roomCode });
        io.to(roomCode).emit('update-players', room.players);
        console.log(`User ${username} joined room ${roomCode}`);
    });

    // Start Game
    socket.on('start-game', async ({ roomCode }) => {
        if (rooms[roomCode]) {
            rooms[roomCode].gameState = 'playing';

            try {
                // Filter by category
                const matchStage = (rooms[roomCode].category !== 'General' && rooms[roomCode].category !== 'Todas')
                    ? { $match: { category: rooms[roomCode].category } }
                    : { $match: {} };

                const questions = await require('./models/Question').aggregate([
                    matchStage,
                    { $sample: { size: 5 } }
                ]);

                rooms[roomCode].questions = questions;
                rooms[roomCode].currentQuestionIndex = 0;

                io.to(roomCode).emit('game-started');

                setTimeout(() => {
                    sendQuestion(roomCode);
                }, 1000);

            } catch (err) {
                console.error(err);
            }
        }
    });

    // Submit Answer (with Time Bonus & Multiplier)
    socket.on('submit-answer', ({ roomCode, username, answerIndex, timeLeft, multiplier }) => {
        const room = rooms[roomCode];
        if (!room || room.gameState !== 'playing') return;

        const currentQ = room.questions[room.currentQuestionIndex];
        const isCorrect = currentQ.correctAnswerIndex === answerIndex;

        if (isCorrect) {
            // New Formula: Max 100 points, proportional to time left.
            // Max time is 15s.
            const totalTime = 15;
            const percentage = (timeLeft || 0) / totalTime;
            const points = Math.ceil(100 * percentage); // e.g. 15s -> 100, 7.5s -> 50, 1s -> 7

            const player = room.players.find(p => p.username === username);
            if (player) {
                player.score += points;
                room.scores[username] += points;

                // PERSIST TO DATABASE
                // We need to find the user by username. Ideally we have userId in room players.
                // For now, update by username.
                const User = require('./models/User');
                User.findOneAndUpdate(
                    { username: username },
                    {
                        $inc: { points: points }, // Increment points immediately
                    }
                ).catch(err => console.error('Error saving score:', err));
            }
        }

        // Initialize answered count if not exists
        if (!room.answeredCount) room.answeredCount = 0;

        // Prevent double submission logic (though frontend disables it)
        // ideally we track WHO answered to be safe, but simple count works for now if clients are good
        room.answeredCount++;

        io.to(roomCode).emit('update-leaderboard', room.players);

        // Check if all players answered
        if (room.answeredCount >= room.players.length) {
            // Everyone answered! Advance quickly.
            if (room.timer) clearTimeout(room.timer);

            const currentQ = room.questions[room.currentQuestionIndex];
            io.to(roomCode).emit('question-results', {
                correctAnswerIndex: currentQ.correctAnswerIndex
            });

            // Small delay to show results/feedback
            setTimeout(() => {
                room.currentQuestionIndex++;
                sendQuestion(roomCode);
            }, 3000); // 3 seconds to see "Enviado" or feedback
        }
    });

    const sendQuestion = (roomCode) => {
        const room = rooms[roomCode];

        // Clear previous timer
        if (room.timer) clearTimeout(room.timer);

        if (room.currentQuestionIndex < room.questions.length) {
            // Reset answered count
            room.answeredCount = 0;

            const q = room.questions[room.currentQuestionIndex];
            io.to(roomCode).emit('receive-question', {
                questionText: q.questionText,
                options: q.options,
                category: q.category,
                total: room.questions.length,
                current: room.currentQuestionIndex + 1
            });

            // Auto-advance after 20 seconds (15s thinking + 5s buffer)
            room.timer = setTimeout(() => {
                room.currentQuestionIndex++;
                sendQuestion(roomCode);
            }, 20000);

        } else {
            io.to(roomCode).emit('game-ended', room.players);
            room.gameState = 'finished';

            // Update gamesPlayed for all players
            const User = require('./models/User');
            room.players.forEach(p => {
                User.findOneAndUpdate(
                    { username: p.username },
                    { $inc: { gamesPlayed: 1 } }
                ).catch(e => console.error(e));
            });
        }
    };

    socket.on('next-question', ({ roomCode }) => {
        const room = rooms[roomCode];
        if (room) {
            if (room.timer) clearTimeout(room.timer); // Clear auto-timer if manual next
            room.currentQuestionIndex++;
            sendQuestion(roomCode);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected', socket.id);
        for (const roomCode in rooms) {
            rooms[roomCode].players = rooms[roomCode].players.filter(p => p.id !== socket.id);
            io.to(roomCode).emit('update-players', rooms[roomCode].players);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
