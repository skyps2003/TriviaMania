import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { X, Award, TrendingUp, Hash, Save, User as UserIcon, Settings } from 'lucide-react';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || 'robot_1');
    const [stats, setStats] = useState(null);

    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        username: user?.username || '',
        password: ''
    });

    // Using seeds for DiceBear
    const avatars = [
        { id: 'Felix', label: 'Felix' },
        { id: 'Aneka', label: 'Aneka' },
        { id: 'Zoe', label: 'Zoe' },
        { id: 'Max', label: 'Max' },
        { id: 'Bot1', label: 'Bot A' },
        { id: 'Bot2', label: 'Bot B' },
        { id: 'Ghosty', label: 'Ghost' },
        { id: 'Skull', label: 'Skull' }
    ];

    const getAvatarUrl = (seed) => {
        // Mixing styles for variety: Humans (avataaars) and Robots (bottts)
        const style = seed.startsWith('Bot') ? 'bottts' : 'avataaars';
        return `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}`;
    };

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        const fetchProfile = async () => {
            try {
                const res = await api.get(`/auth/profile/${user.id}`);
                setStats(res.data);
                setSelectedAvatar(res.data.avatar || 'Felix');
                setFormData(prev => ({ ...prev, username: res.data.username }));
            } catch (err) {
                console.error(err);
            }
        };
        fetchProfile();
    }, [navigate, user?.id]);

    const handleSave = async () => {
        try {
            const payload = {
                userId: user.id,
                avatar: selectedAvatar,
                username: formData.username
            };
            if (formData.password) payload.password = formData.password;

            const res = await api.put('/auth/profile', payload);

            const updatedUser = { ...user, ...res.data };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setEditMode(false);
            alert('¡Perfil actualizado!');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Error al guardar');
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-950 font-sans p-6 flex flex-col items-center justify-center">

            <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-8 relative shadow-2xl animate-fade-in">
                <div className="flex justify-between items-center mb-10 pl-2 border-l-4 border-brand-primary">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Configuración</h1>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setEditMode(!editMode)}
                            className={`text-sm font-bold uppercase tracking-widest px-6 py-3 rounded-xl border transition-all shadow-lg flex items-center gap-2
                                ${editMode
                                    ? 'bg-red-500/10 text-red-500 border-red-500/50 hover:bg-red-500/20'
                                    : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white hover:border-slate-600 hover:shadow-xl hover:-translate-y-0.5'}
                            `}
                        >
                            {editMode ? (
                                <>Cancelar</>
                            ) : (
                                <>
                                    <Settings size={16} />
                                    Editar Datos
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => navigate('/lobby')}
                            className="bg-slate-800 text-slate-400 p-3 rounded-xl border border-slate-700 hover:text-white hover:bg-red-500/10 hover:border-red-500/50 transition-all"
                            title="Cerrar"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>


                <div className="grid md:grid-cols-2 gap-12">
                    {/* Left Column: Stats or Edit Form */}
                    <div className="space-y-6">
                        {editMode ? (
                            <div className="animate-fade-in space-y-6 h-full flex flex-col justify-center">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block pl-1">Nombre de Usuario</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                        <input
                                            type="text"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all shadow-inner"
                                            placeholder="Tu nuevo nombre"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block pl-1">Nueva Contraseña</label>
                                    <div className="relative">
                                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="••••••••"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all shadow-inner"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2 pl-1">Déjalo en blanco para mantener tu contraseña actual.</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-xs text-slate-400 font-bold uppercase tracking-widest pl-1">Rendimiento</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 hover:border-yellow-400/30 transition-colors">
                                        <div className="p-3 bg-yellow-400/10 w-fit rounded-xl text-yellow-400 mb-4">
                                            <Award size={24} />
                                        </div>
                                        <div className="text-3xl font-bold text-white mb-1">{stats?.points || 0}</div>
                                        <div className="text-sm font-bold text-yellow-200/80">Puntos Totales</div>
                                    </div>
                                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 hover:border-blue-400/30 transition-colors">
                                        <div className="p-3 bg-blue-400/10 w-fit rounded-xl text-blue-400 mb-4">
                                            <Hash size={24} />
                                        </div>
                                        <div className="text-3xl font-bold text-white mb-1">{stats?.gamesPlayed || 0}</div>
                                        <div className="text-sm font-bold text-blue-200/80">Partidas Jugadas</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 bg-slate-800/30 p-6 rounded-2xl border border-slate-800">
                                    <div className="h-16 w-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-brand-success overflow-hidden p-1">
                                        <TrendingUp size={32} />
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold text-white">Nivel {Math.floor((stats?.gamesPlayed || 0) / 5) + 1}</div>
                                        <div className="text-sm font-bold text-emerald-400">Rango: Aspirante</div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Avatar */}
                    <div>
                        <h2 className="text-xs text-slate-400 font-bold uppercase tracking-widest pl-1 mb-6">Elige tu Avatar</h2>
                        <div className="grid grid-cols-4 gap-4 mb-10">
                            {avatars.map((av) => (
                                <button
                                    key={av.id}
                                    onClick={() => setSelectedAvatar(av.id)}
                                    className={`aspect-square rounded-2xl flex items-center justify-center border-2 transition-all overflow-hidden bg-slate-800
                                        ${selectedAvatar === av.id
                                            ? 'border-brand-primary shadow-glow scale-105 ring-2 ring-brand-primary/30'
                                            : 'border-transparent hover:border-slate-600'}
                                    `}
                                >
                                    <img
                                        src={getAvatarUrl(av.id)}
                                        alt={av.label}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={handleSave}
                            className="w-full py-4 bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Save size={20} />
                            GUARDAR CAMBIOS
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
