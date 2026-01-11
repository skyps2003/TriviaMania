import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../services/socket';
import {
    Clock, Zap, Bomb, Trophy, User, ArrowRight, CheckCircle,
    Beaker, Scroll, Palette, Globe, Clapperboard, Home
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

    // Power-ups state
    const [powerups, setPowerups] = useState({ fifty: true, double: true });
    const [disabledOptions, setDisabledOptions] = useState([]);
    const [isDoublePoints, setIsDoublePoints] = useState(false);

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

        socket.on('receive-question', (data) => {
            setQuestion(data);
            setTimeLeft(15);
            setSelectedAnswer(null);
            setConfirmed(false);
            setCorrectAnswer(null); // Reset explanation/colors
            setDisabledOptions([]);
            setIsDoublePoints(false);
        });

        socket.on('update-leaderboard', (updatedPlayers) => {
            setPlayers(updatedPlayers.sort((a, b) => b.score - a.score));
        });

        socket.on('question-ended', (finalPlayers) => {
            setGameFinished(true);
            setPlayers(finalPlayers.sort((a, b) => b.score - a.score));
        });

        socket.on('question-results', ({ correctAnswerIndex }) => {
            setCorrectAnswer(correctAnswerIndex);
        });

        return () => {
            socket.off('receive-question');
            socket.off('update-leaderboard');
            socket.off('game-ended');
            socket.off('question-results');
        };
    }, []);

    useEffect(() => {
        if (timeLeft > 0 && question && !gameFinished) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft, question, gameFinished]);

    const handleSelect = (index) => {
        if (!confirmed) {
            setSelectedAnswer(index);
        }
    };

    const handleConfirm = () => {
        if (selectedAnswer !== null) {
            setConfirmed(true);
            socket.emit('submit-answer', {
                roomCode: 'sala-1',
                username: user.username,
                answerIndex: selectedAnswer,
                timeLeft: timeLeft
            });
        }
    };
    const activateFifty = () => {
        if (!powerups.fifty || !question || confirmed) return;
        setPowerups({ ...powerups, fifty: false });
        alert('¡Bomba 50/50 Activada! (Efecto Visual)');
    };

    const activateDouble = () => {
        if (!powerups.double || confirmed) return;
        setIsDoublePoints(true);
        setPowerups({ ...powerups, double: false });
    };

    if (gameFinished) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-4 font-sans relative overflow-hidden">
                <div className="w-full max-w-2xl bg-slate-900 rounded-3xl border border-slate-800 p-8 text-center relative z-10 shadow-2xl animate-fade-in">
                    <div className="inline-flex p-4 bg-brand-primary/10 rounded-full text-brand-primary mb-6">
                        <Trophy size={48} />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">PARTIDA FINALIZADA</h1>
                    <p className="text-slate-200 font-medium mb-10">Ranking final de jugadores</p>

                    <div className="space-y-3 mb-10">
                        {players.map((p, i) => (
                            <div key={i} className={`flex justify-between items-center p-4 rounded-xl border transition-all ${i === 0 ? 'bg-brand-primary/10 border-brand-primary/50' : 'bg-slate-800 border-slate-700'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${i === 0 ? 'bg-brand-primary text-white' : 'bg-slate-700 text-slate-300'}`}>
                                        {i + 1}
                                    </div>
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 border border-slate-600">
                                        <img src={getAvatarUrl(p.avatar)} alt="av" className="w-full h-full object-cover" />
                                    </div>
                                    <span className={`font-bold ${i === 0 ? 'text-white' : 'text-slate-200'}`}>{p.username}</span>
                                </div>
                                <span className="font-mono font-bold text-lg text-brand-primary">{p.score}</span>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => navigate('/lobby')} className="w-full py-4 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
                        <Home size={20} />
                        VOLVER AL LOBBY
                    </button>
                </div>
            </div>
        );
    }

    if (!question) return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-950 font-sans">
            <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-brand-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>
            <h1 className="text-lg font-bold text-slate-200 uppercase tracking-widest animate-pulse">Sincronizando...</h1>
        </div>
    );

    const style = getCategoryStyles(question.category);
    const CategoryIcon = style.icon;

    return (
        <div className="min-h-screen bg-slate-950 p-4 md:p-6 flex flex-col items-center font-sans">

            {/* Header */}
            <div className="w-full max-w-5xl flex justify-between items-center mb-8">
                <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2 pr-5 rounded-full">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 border border-slate-700">
                        <img src={getAvatarUrl(user.avatar)} alt="me" className="w-full h-full object-cover" />
                    </div>
                    <span className="font-bold text-slate-200 text-sm">{user.username}</span>
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
                <p className="text-3xl md:text-4xl font-bold leading-tight text-white mt-4 drop-shadow-md">{question.questionText}</p>
            </div>



            {/* Options */}
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                {question.options.map((opt, i) => (
                    <button
                        key={i}
                        onClick={() => handleSelect(i)}
                        disabled={confirmed || disabledOptions.includes(i)}
                        className={`relative p-6 rounded-2xl text-xl font-bold transition-all border-2 flex items-center justify-between group min-h-[5.5rem]
                            ${
                            // Logic for styling:
                            // 1. If results revealed (correctAnswer !== null):
                            //    - If this is correct -> GREEN
                            //    - If this I picked but wrong -> RED
                            //    - Else -> Opacity lowered
                            // 2. If not revealed but selected -> YELLOW
                            // 3. Default -> Slate
                            correctAnswer !== null
                                ? i === correctAnswer
                                    ? 'bg-green-500 text-white border-green-600 shadow-glow-green scale-[1.02] z-10'
                                    : i === selectedAnswer
                                        ? 'bg-red-500 text-white border-red-600 shadow-glow-red scale-[1.02] z-10'
                                        : 'bg-slate-800 text-slate-500 border-slate-700 opacity-50'
                                : selectedAnswer === i
                                    ? 'bg-yellow-400 text-slate-900 border-yellow-500 shadow-glow-yellow scale-[1.02] z-10'
                                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500 hover:bg-slate-750 hover:text-white'
                            }
                            ${disabledOptions.includes(i) ? 'opacity-20 cursor-not-allowed hidden' : ''}
                        `}
                    >
                        <span className="text-left leading-tight z-10">{opt}</span>
                        {/* Icons */}
                        {correctAnswer !== null ? (
                            i === correctAnswer ? (
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white shadow-sm animate-scale-in">
                                    <CheckCircle size={20} className="fill-current" />
                                </div>
                            ) : i === selectedAnswer ? (
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white shadow-sm animate-scale-in">
                                    <ArrowRight size={20} className="rotate-45" />
                                </div>
                            ) : null
                        ) : selectedAnswer === i ? (
                            <div className="w-8 h-8 bg-black/10 rounded-full flex items-center justify-center text-slate-900 shadow-sm animate-scale-in">
                                <CheckCircle size={20} className="fill-current" />
                            </div>
                        ) : null}
                    </button>
                ))}
            </div>

            {/* CONFIRM BUTTON */}
            <div className="w-full max-w-md fixed bottom-8 md:relative md:bottom-auto z-50 px-4 md:px-0">
                <button
                    onClick={handleConfirm}
                    disabled={selectedAnswer === null || confirmed}
                    className={`w-full py-4 rounded-2xl font-black text-xl uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 border-b-4
                        ${selectedAnswer !== null && !confirmed
                            ? 'bg-brand-success text-white border-green-600 hover:bg-green-400 hover:border-green-500 hover:-translate-y-1 active:translate-y-0 active:border-t-4 active:border-b-0'
                            : 'bg-slate-800 text-slate-500 border-slate-900 cursor-not-allowed'}
                    `}
                >
                    {confirmed ? (
                        <>
                            <span className="animate-pulse">Enviado</span>
                            <CheckCircle size={24} />
                        </>
                    ) : (
                        <>
                            <span>Confirmar</span>
                            <ArrowRight size={24} />
                        </>
                    )}
                </button>
                {confirmed && <p className="text-center text-slate-400 mt-3 text-sm font-medium animate-pulse">Esperando a los demás jugadores...</p>}
            </div>
        </div>
    );
};

export default Game;
