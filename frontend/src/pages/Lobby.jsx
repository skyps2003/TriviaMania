import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../services/socket';
import {
    Copy, LogOut, Play, User, Users,
    Beaker, Scroll, Trophy, Palette, Globe, Clapperboard,
    Gamepad2, ArrowRight
} from 'lucide-react';

const Lobby = () => {
    const [players, setPlayers] = useState([]);
    const [roomCode, setRoomCode] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [category, setCategory] = useState('Ciencia');
    const [isInRoom, setIsInRoom] = useState(false);

    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const categories = [
        { id: 'Ciencia', color: 'text-green-400', bg: 'bg-green-500/10', icon: Beaker },
        { id: 'Historia', color: 'text-yellow-400', bg: 'bg-yellow-500/10', icon: Scroll },
        { id: 'Deportes', color: 'text-orange-400', bg: 'bg-orange-500/10', icon: Trophy },
        { id: 'Arte', color: 'text-red-400', bg: 'bg-red-500/10', icon: Palette },
        { id: 'Geografía', color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: Globe },
        { id: 'Entretenimiento', color: 'text-pink-400', bg: 'bg-pink-500/10', icon: Clapperboard },
        { id: 'Todas', color: 'text-white', bg: 'bg-brand-primary/20', icon: Gamepad2 }
    ];

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        socket.connect();

        socket.on('update-players', (updatedPlayers) => {
            setPlayers(updatedPlayers);
        });

        socket.on('game-started', () => {
            navigate('/game');
        });

        socket.on('room-created', ({ roomCode }) => {
            setRoomCode(roomCode);
            setIsInRoom(true);
            localStorage.setItem('currentRoomCode', roomCode);
            console.log("Sala Creada y Guardada:", roomCode);
        });

        socket.on('joined-room', ({ roomCode }) => {
            setRoomCode(roomCode);
            setIsInRoom(true);
            localStorage.setItem('currentRoomCode', roomCode);
            console.log("Unido a Sala y Guardada:", roomCode);
        });

        return () => {
            socket.off('update-players');
            socket.off('game-started');
            socket.off('room-created');
            socket.off('joined-room');
        };

    }, [navigate, user]);

    const handleCreateRoom = () => {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        socket.emit('create-room', { roomCode: code, username: user.username, avatar: user.avatar, category });
    };

    const handleJoinRoom = (e) => {
        e.preventDefault();
        if (joinCode.trim()) {
            socket.emit('join-room', { roomCode: joinCode.toUpperCase(), username: user.username, avatar: user.avatar });
        }
    };

    const handleStartGame = () => {
        socket.emit('start-game', { roomCode });
    };

    const copyCode = () => {
        navigator.clipboard.writeText(roomCode);
        // Toast notification could go here
    };

    const getAvatarUrl = (seed) => {
        const style = seed?.startsWith('Bot') ? 'bottts' : 'avataaars';
        return `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}`;
    };

    if (isInRoom) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 font-sans p-4">
            <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl animate-fade-in">

                {/* Header Room Info */}
                <div className="flex justify-between items-center mb-12 border-b border-slate-800 pb-6">
                    <button onClick={() => window.location.reload()} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                        <LogOut size={18} />
                        <span className="font-medium text-sm">SALIR</span>
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">CÓDIGO DE SALA</span>
                            <span className="text-3xl font-bold text-white tracking-widest font-mono">{roomCode}</span>
                        </div>
                        <button onClick={copyCode} className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 hover:text-brand-primary transition-all text-slate-400">
                            <Copy size={20} />
                        </button>
                    </div>
                </div>

                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-primary/10 text-brand-primary mb-6 animate-pulse">
                        <Users size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Sala de Espera</h1>
                    <p className="text-slate-400">Esperando a que todos los jugadores se conecten...</p>
                </div>

                {/* Players Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                    {players.map((p, idx) => (
                        <div key={idx} className="group relative flex flex-col items-center p-6 bg-slate-800 rounded-3xl border border-slate-700 hover:border-brand-primary/50 hover:-translate-y-1 transition-all shadow-lg">
                            <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-4 border-slate-700 group-hover:border-brand-primary transition-colors bg-slate-900 shadow-inner">
                                <img src={getAvatarUrl(p.avatar)} alt="av" className="w-full h-full object-cover" />
                            </div>
                            <span className="font-bold text-lg text-white mb-1 truncate w-full text-center">{p.username}</span>
                            <div className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full border border-brand-primary/20">
                                {p.score} XP
                            </div>
                        </div>
                    ))}
                    {Array.from({ length: Math.max(0, 4 - players.length) }).map((_, i) => (
                        <div key={`empty-${i}`} className="flex flex-col items-center justify-center p-6 rounded-3xl border-2 border-dashed border-slate-800 bg-slate-900/30 min-h-[200px] group hover:border-slate-700 transition-colors">
                            <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-700 mb-4 group-hover:text-slate-600 transition-colors">
                                <User size={32} />
                            </div>
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest animate-pulse">Esperando...</span>
                        </div>
                    ))}
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={handleStartGame}
                        className="group relative px-10 py-4 bg-white text-slate-950 rounded-xl font-bold text-lg shadow-glow hover:shadow-lg hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 overflow-hidden"
                        disabled={players.length < 1}
                    >
                        <span className="relative z-10">COMENZAR PARTIDA</span>
                        <Play size={20} className="relative z-10 fill-current" />
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-primary to-brand-accent opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 font-sans p-6 overflow-y-auto w-full"> {/* Ensure full width and scrolling */}

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 pb-10"> {/* Added pb-10 for bottom spacing */}

                {/* Profile Header */}
                <div className="lg:col-span-12 flex flex-col md:flex-row justify-between items-center bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-sm animate-slide-up">
                    <div className="flex items-center gap-6 mb-4 md:mb-0">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-700 shadow-inner bg-slate-800">
                            <img src={getAvatarUrl(user.avatar || 'robot_1')} alt="me" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">{user.username}</h2>
                            <div className="flex items-center gap-3 text-sm">
                                <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-lg font-bold border border-emerald-500/20">
                                    Nivel {Math.floor((user.gamesPlayed || 0) / 5) + 1}
                                </span>
                                <span className="text-slate-300 font-medium">{user.points} XP Totales</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => navigate('/profile')} className="px-5 py-3 border border-slate-700 text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-800 hover:text-white transition-all flex items-center gap-2">
                            <User size={18} />
                            PERFIL
                        </button>
                        <button onClick={() => { localStorage.removeItem('user'); localStorage.removeItem('token'); navigate('/login'); }} className="px-5 py-3 bg-red-500/10 text-red-500 rounded-xl font-bold text-sm hover:bg-red-500/20 transition-all flex items-center gap-2">
                            <LogOut size={18} />
                            SALIR
                        </button>
                    </div>
                </div>

                {/* Create Room Panel */}
                <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                    <div className="mb-8 relative z-10">
                        <div className="inline-flex items-center gap-2 text-cyan-400 mb-2">
                            <Gamepad2 size={24} className="animate-pulse-slow" />
                            <span className="font-bold text-sm tracking-widest uppercase">Anfitrión</span>
                        </div>
                        <h2 className="text-3xl font-bold text-white">Crear Nueva Partida</h2>
                        <p className="text-slate-400 mt-2">Selecciona una categoría para desafiar a tus amigos.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 relative z-10">
                        {categories.map(cat => {
                            const Icon = cat.icon;
                            const isSelected = category === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setCategory(cat.id)}
                                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-3 h-32
                                        ${isSelected
                                            ? `${cat.bg} ${cat.color} border-${cat.color.split('-')[1]}-500/50 ring-2 ring-${cat.color.split('-')[1]}-500/20`
                                            : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:bg-slate-800 hover:border-slate-600 hover:text-slate-300'}
                                    `}
                                >
                                    <Icon size={32} strokeWidth={1.5} />
                                    <span className="text-xs font-bold uppercase tracking-wider">{cat.id}</span>
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={handleCreateRoom}
                        className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-1 transition-all relative z-10"
                    >
                        CREAR SALA
                    </button>
                </div>

                {/* Join Room Panel */}
                <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-lg flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute bottom-[-20%] left-[-20%] w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="mb-8 relative z-10">
                        <div className="inline-flex items-center gap-2 text-pink-400 mb-2">
                            <Users size={24} className="animate-bounce-subtle" />
                            <span className="font-bold text-sm tracking-widest uppercase">Invitado</span>
                        </div>
                        <h2 className="text-3xl font-bold text-white">Unirse a Sala</h2>
                        <p className="text-slate-400 mt-2">Ingresa el código que te compartieron.</p>
                    </div>

                    <form onSubmit={handleJoinRoom} className="space-y-6 relative z-10">
                        <div className="relative group">
                            <input
                                type="text"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value)}
                                className="w-full px-6 py-6 bg-slate-950/50 border border-slate-700 rounded-2xl focus:border-pink-500 focus:bg-slate-950 focus:shadow-glow-pink transition-all text-center text-3xl font-bold text-white uppercase focus:outline-none placeholder-slate-700 tracking-[0.2em] font-mono group-hover:border-slate-600"
                                placeholder="ABC-123"
                                maxLength={6}
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-5 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group"
                        >
                            ENTRAR AHORA
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default Lobby;
