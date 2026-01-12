import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../services/socket';
import {
    Clock, Zap, Bomb, Trophy, User, ArrowRight, CheckCircle,
    Beaker, Scroll, Palette, Globe, Clapperboard, Home, Medal
} from 'lucide-react';

const Game = () => {
    const [question, setQuestion] = useState(null);
    const [players, setPlayers] = useState([]);
    const [timeLeft, setTimeLeft] = useState(15);
    const [gameFinished, setGameFinished] = useState(false);

    // Selection & Confirmation
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [confirmed, setConfirmed] = useState(false);
    const [correctAnswer, setCorrectAnswer] = useState(null);

    // Power-ups state (Visual only as per request)
    const [disabledOptions, setDisabledOptions] = useState([]);

    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const getAvatarUrl = (seed) => {
        const style = seed?.startsWith('Bot') ? 'bottts' : 'avataaars';
        return `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}`;
    };

    const getCategoryStyles = (cat) => {
        switch (cat) {
            case 'Ciencia': return { color: 'text-green-400', border: 'border-green-500/50', bg: 'bg-green-500/10', icon: Beaker };
            case 'Historia': return { color: 'text-yellow-400', border: 'border-yellow-500/50', bg: 'bg-yellow-500/10', icon: Scroll };
            case 'Deportes': return { color: 'text-orange-400', border: 'border-orange-500/50', bg: 'bg-orange-500/10', icon: Trophy };
            case 'Arte': return { color: 'text-red-400', border: 'border-red-500/50', bg: 'bg-red-500/10', icon: Palette };
            case 'Geografía': return { color: 'text-cyan-400', border: 'border-cyan-500/50', bg: 'bg-cyan-500/10', icon: Globe };
            case 'Entretenimiento': return { color: 'text-pink-400', border: 'border-pink-500/50', bg: 'bg-pink-500/10', icon: Clapperboard };
            default: return { color: 'text-brand-primary', border: 'border-brand-primary/50', bg: 'bg-brand-primary/10', icon: Beaker };
        }
    };

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const roomCode = localStorage.getItem('currentRoomCode');
        if (!roomCode) {
            console.warn("No room code found, redirecting to lobby");
            navigate('/lobby');
            return;
        }

        socket.on('receive-question', (data) => {
            console.log("Nueva pregunta recibida:", data);
            setQuestion(data);
            setTimeLeft(15);
            setSelectedAnswer(null);
            setConfirmed(false);
            setCorrectAnswer(null);
            setDisabledOptions([]);
        });

        socket.on('update-leaderboard', (updatedPlayers) => {
            console.log("Leaderboard actualizado:", updatedPlayers);
            setPlayers(updatedPlayers.sort((a, b) => b.score - a.score));
        });

        // CRITICAL FIX: Listening for the correct event 'game-ended'
        socket.on('game-ended', (finalPlayers) => {
            console.log("Juego terminado. Resultados:", finalPlayers);
            setGameFinished(true);
            setPlayers(finalPlayers.sort((a, b) => b.score - a.score));
        });

        socket.on('question-results', ({ correctAnswerIndex }) => {
            console.log("Resultados de pregunta. Correcta:", correctAnswerIndex);
            setCorrectAnswer(correctAnswerIndex);
        });

        return () => {
            socket.off('receive-question');
            socket.off('update-leaderboard');
            socket.off('game-ended');
            socket.off('question-results');
        };
    }, [navigate, user]);

    useEffect(() => {
        if (timeLeft > 0 && question && !gameFinished && correctAnswer === null) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft, question, gameFinished, correctAnswer]);

    const handleSelect = (index) => {
        if (!confirmed && correctAnswer === null) {
            setSelectedAnswer(index);
        }
    };

    const handleConfirm = () => {
        if (selectedAnswer !== null) {
            setConfirmed(true);
            const currentRoomCode = localStorage.getItem('currentRoomCode');

            if (!currentRoomCode) {
                alert("Error: No estás en una sala válida.");
                return;
            }

            console.log(`Enviando respuesta... Sala: ${currentRoomCode}, Respuesta: ${selectedAnswer}`);

            socket.emit('submit-answer', {
                roomCode: currentRoomCode,
                username: user.username,
                answerIndex: selectedAnswer,
                timeLeft: timeLeft
            });
        }
    };

    if (gameFinished) {
        const isWinner = players.length > 0 && players[0].username === user.username;
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-4 font-sans relative overflow-hidden">
                {/* Background Effects */}
                {isWinner && (
                    <>
                        <div className="absolute inset-0 bg-yellow-500/5 animate-pulse pointer-events-none"></div>
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                            {/* Simple CSS Confetti could go here */}
                            <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-yellow-400 rounded-full animate-bounce"></div>
                            <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
                        </div>
                    </>
                )}

                <div className={`w-full max-w-2xl bg-slate-900 rounded-3xl border ${isWinner ? 'border-yellow-500 shadow-glow-yellow' : 'border-slate-800'} p-8 text-center relative z-10 shadow-2xl animate-fade-in`}>

                    <div className={`inline-flex p-6 rounded-full mb-8 ${isWinner ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg scale-110' : 'bg-slate-800 text-slate-500'}`}>
                        {isWinner ? <Trophy size={64} className="animate-bounce" /> : <Medal size={64} />}
                    </div>

                    {isWinner ? (
                        <>
                            <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-yellow-300 mb-4 animate-pulse">¡HAS GANADO!</h1>
                            <p className="text-yellow-100/80 font-bold mb-12 text-xl tracking-wide">¡Eres el maestro indiscutible de la trivia!</p>
                        </>
                    ) : (
                        <>
                            <h1 className="text-4xl font-bold text-white mb-4">PARTIDA FINALIZADA</h1>
                            <p className="text-slate-400 font-medium mb-12">¡Buen intento! Sigue practicando.</p>
                        </>
                    )}

                    <div className="space-y-4 mb-12">
                        {players.map((p, i) => (
                            <div key={i} className={`flex justify-between items-center p-5 rounded-2xl border transition-all 
                                ${i === 0
                                    ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/40 shadow-[0_0_15px_rgba(234,179,8,0.1)]'
                                    : 'bg-slate-800/50 border-slate-700/50'
                                }`}>
                                <div className="flex items-center gap-5">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-xl font-black text-lg shadow-sm
                                        ${i === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                                        {i + 1}
                                    </div>
                                    <div className={`w-12 h-12 rounded-full overflow-hidden bg-slate-800 border-2 ${i === 0 ? 'border-yellow-400' : 'border-slate-600'}`}>
                                        <img src={getAvatarUrl(p.avatar)} alt="av" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className={`font-bold text-lg ${i === 0 ? 'text-yellow-100' : 'text-slate-200'}`}>
                                            {p.username} {p.username === user.username && '(Tú)'}
                                        </span>
                                        {i === 0 && <span className="text-[10px] font-black uppercase tracking-wider text-yellow-500">Ganador</span>}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className={`font-mono font-black text-2xl ${i === 0 ? 'text-yellow-400' : 'text-white'}`}>
                                        {p.score}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">Puntos</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => navigate('/lobby')} className="w-full py-5 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 hover:text-white hover:shadow-lg hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group border border-slate-700">
                        <Home size={22} className="group-hover:-translate-x-1 transition-transform text-slate-400 group-hover:text-white" />
                        VOLVER AL LOBBY
                    </button>
                </div>
            </div>
        );
    }

    if (!question) return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-950 font-sans">
            <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-brand-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>
            <h1 className="text-xl font-bold text-slate-200 uppercase tracking-[0.2em] animate-pulse mb-2">Sincronizando</h1>
            <p className="text-slate-500 text-sm font-mono">Conectando con el servidor...</p>
        </div>
    );

    const style = getCategoryStyles(question.category);
    const CategoryIcon = style.icon;

    return (
        <div className="min-h-screen bg-slate-950 p-4 md:p-6 flex flex-col items-center font-sans">

            {/* Header */}
            <div className="w-full max-w-5xl flex justify-between items-center mb-8">
                <div className="flex flex-col">
                    <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2 pr-5 rounded-full mb-2">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 border border-slate-700">
                            <img src={getAvatarUrl(user.avatar)} alt="me" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-bold text-slate-200 text-sm">{user.username}</span>
                    </div>
                    <span className="text-xs text-slate-500 font-mono ml-2 uppercase tracking-wide">
                        Pregunta <span className="text-white font-bold text-sm">{question.current}</span> de {question.total}
                    </span>
                </div>

                {/* Timer Widget */}
                <div className="relative flex items-center justify-center w-20 h-20">
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                        <circle cx="40" cy="40" r="36" stroke="#1e293b" strokeWidth="4" fill="none" />
                        <circle
                            cx="40" cy="40" r="36" stroke={timeLeft < 5 ? '#ef4444' : '#3b82f6'} strokeWidth="4" fill="none"
                            strokeDasharray="226" strokeDashoffset={226 - (226 * timeLeft) / 15}
                            className="transition-all duration-1000 ease-linear"
                        />
                    </svg>
                    <span className={`text-2xl font-bold font-mono ${timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                        {timeLeft}
                    </span>
                </div>

                <div className="flex flex-col items-end bg-slate-900/80 border border-slate-700 p-3 px-6 rounded-2xl shadow-sm backdrop-blur-sm">
                    <span className="text-[10px] text-brand-primary font-bold uppercase tracking-widest mb-1">Puntaje</span>
                    <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-2xl text-white tracking-tight">
                            {players.find(p => p.username === user.username)?.score || 0}
                        </span>
                        <Trophy size={16} className="text-yellow-400" />
                    </div>
                </div>
            </div>

            {/* Question Card */}
            <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 mb-8 text-center relative z-10 shadow-2xl transition-all">
                <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${style.bg} ${style.border} border px-6 py-2 rounded-full flex items-center gap-2 shadow-lg ring-4 ring-slate-950`}>
                    <CategoryIcon size={18} className={style.color} />
                    <span className={`text-xs font-black uppercase tracking-widest ${style.color}`}>
                        {question.category}
                    </span>
                </div>
                <p className="text-2xl md:text-4xl font-bold leading-snug text-white mt-4 drop-shadow-md">
                    {question.questionText}
                </p>
            </div>

            {/* Options */}
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 h-full">
                {question.options.map((opt, i) => {
                    // Visual Logic
                    let btnClass = "bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500 hover:bg-slate-750 hover:text-white";
                    let showCheck = false;
                    let showX = false;

                    if (correctAnswer !== null) {
                        // Results Phase
                        if (i === correctAnswer) {
                            btnClass = "bg-green-500 text-white border-green-600 shadow-glow-green scale-[1.02] z-10";
                            showCheck = true;
                        } else if (i === selectedAnswer) {
                            btnClass = "bg-red-500 text-white border-red-600 shadow-glow-red scale-[1.02] z-10 opacity-100";
                            showX = true;
                        } else {
                            btnClass = "bg-slate-800 text-slate-600 border-slate-800 opacity-40";
                        }
                    } else if (selectedAnswer === i) {
                        // Selection Phase
                        btnClass = "bg-yellow-400 text-slate-900 border-yellow-500 shadow-glow-yellow scale-[1.02] z-10";
                    }

                    return (
                        <button
                            key={i}
                            onClick={() => handleSelect(i)}
                            disabled={confirmed || disabledOptions.includes(i) || correctAnswer !== null}
                            className={`relative p-6 rounded-2xl text-lg md:text-xl font-bold transition-all border-2 flex items-center justify-between group min-h-[5rem] ${btnClass}`}
                        >
                            <span className="text-left leading-tight z-10 flex-1">{opt}</span>

                            {/* Status Icons */}
                            {showCheck && (
                                <div className="ml-3 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white shadow-sm animate-scale-in flex-shrink-0">
                                    <CheckCircle size={20} className="fill-current" />
                                </div>
                            )}
                            {showX && (
                                <div className="ml-3 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white shadow-sm animate-scale-in flex-shrink-0">
                                    <Clock size={20} className="stroke-2 rotate-45" />
                                </div>
                            )}
                            {!showCheck && !showX && selectedAnswer === i && correctAnswer === null && (
                                <div className="ml-3 w-8 h-8 bg-black/10 rounded-full flex items-center justify-center text-slate-900 shadow-sm animate-scale-in flex-shrink-0">
                                    <CheckCircle size={20} className="fill-current" />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* CONFIRM BUTTON */}
            <div className="w-full max-w-md fixed bottom-6 md:relative md:bottom-auto z-50 px-4 md:px-0">
                <button
                    onClick={handleConfirm}
                    disabled={selectedAnswer === null || confirmed || correctAnswer !== null}
                    className={`w-full py-4 rounded-2xl font-black text-xl uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 border-b-4
                        ${selectedAnswer !== null && !confirmed && correctAnswer === null
                            ? 'bg-brand-success text-white border-green-600 hover:bg-green-400 hover:border-green-500 hover:-translate-y-1 active:translate-y-0 active:border-t-4 active:border-b-0'
                            : 'bg-slate-800 text-slate-500 border-slate-900 cursor-not-allowed'}
                    `}
                >
                    {confirmed ? (
                        <>
                            <span className="animate-pulse">Esperando...</span>
                            <Clock size={24} className="animate-spin-slow" />
                        </>
                    ) : (
                        <>
                            <span>Confirmar</span>
                            <ArrowRight size={24} />
                        </>
                    )}
                </button>
                {confirmed && !correctAnswer && <p className="text-center text-slate-400 mt-3 text-xs font-bold uppercase tracking-widest animate-pulse">Tu respuesta ha sido enviada</p>}
            </div>
        </div>
    );
};

export default Game;
