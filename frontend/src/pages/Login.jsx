import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { User, Mail, Lock, LogIn, UserPlus, Sparkles } from 'lucide-react';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const navigate = useNavigate();

    const { username, email, password } = formData;

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const payload = isLogin ? { email, password } : { username, email, password, avatar: 'robot_1' };

            const res = await api.post(endpoint, payload);

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));

            navigate('/lobby');
        } catch (err) {
            console.error(err.response?.data?.msg || 'Error occurred');
            alert(err.response?.data?.msg || 'Ocurrió un error');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 font-sans p-4 relative overflow-hidden">

            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-primary/20 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-brand-accent/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 z-10 border border-slate-800 shadow-glass animate-fade-in">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-3 bg-brand-primary/10 rounded-2xl mb-4 text-brand-primary shadow-glow">
                        <Sparkles size={32} />
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight mb-2">TriviaMania</h1>
                    <p className="text-slate-400 font-medium">
                        {isLogin ? 'Bienvenido de nuevo' : 'Únete a la batalla del conocimiento'}
                    </p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" size={20} />
                            <input
                                type="text"
                                name="username"
                                value={username}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl focus:border-brand-primary focus:bg-slate-800 focus:outline-none transition-all text-white placeholder-slate-500 font-medium"
                                placeholder="Nombre de Usuario"
                                required
                            />
                        </div>
                    )}
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" size={20} />
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl focus:border-brand-primary focus:bg-slate-800 focus:outline-none transition-all text-white placeholder-slate-500 font-medium"
                            placeholder="Correo Electrónico"
                            required
                        />
                    </div>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" size={20} />
                        <input
                            type="password"
                            name="password"
                            value={password}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl focus:border-brand-primary focus:bg-slate-800 focus:outline-none transition-all text-white placeholder-slate-500 font-medium"
                            placeholder="Contraseña"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-xl font-bold shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                        {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                    </button>
                </form>

                <div className="text-center pt-8">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                    >
                        {isLogin
                            ? '¿No tienes cuenta? Regístrate aquí'
                            : '¿Ya tienes cuenta? Inicia sesión'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
