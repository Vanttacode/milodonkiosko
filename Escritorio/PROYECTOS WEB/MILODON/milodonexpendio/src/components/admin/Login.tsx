import React from 'react'; //// src/components/admin/Login.tsx
import { useState } from 'react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validación Local Estricta (Usuario: admin | Contraseña: 170410)
    setTimeout(() => {
      if ((email === 'admin' || email === 'admin@mollycode.com') && password === '170410') {
        // Guardamos la sesión en el navegador de la máquina
        localStorage.setItem('milodon_session', 'active_admin');
        onLoginSuccess();
      } else {
        setError('Credenciales incorrectas o acceso denegado.');
        setLoading(false);
      }
    }, 600); // Pequeño delay para dar feedback visual de "Autenticando..."
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden font-sans text-slate-900">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-slate-200/50 to-transparent pointer-events-none"></div>

      <div className="max-w-md w-full bg-white px-8 py-10 rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 relative z-10 mx-4">
        
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-slate-900/20">
             <span className="text-3xl font-black text-white tracking-tighter">M</span>
          </div>
          <h2 className="text-2xl font-black tracking-widest text-slate-950 uppercase flex justify-center items-center gap-1">
            MILODON<span className="text-slate-400 font-light">ADMIN</span>
          </h2>
          <p className="text-slate-500 text-sm mt-2 font-medium">Ingresa usuario local para acceder</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Usuario
            </label>
            <input 
              type="text" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-950 focus:border-slate-950 outline-none transition-all font-medium text-slate-800 placeholder-slate-300"
              placeholder="admin"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Contraseña
            </label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-950 focus:border-slate-950 outline-none transition-all font-medium text-slate-800 placeholder-slate-300"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm font-bold animate-fade-in">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-950 text-white py-4 rounded-xl font-bold tracking-widest uppercase text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 disabled:opacity-70 flex justify-center items-center gap-3 mt-2"
          >
            {loading ? (
              <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Autenticando...</>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

      </div>
    </div>
  );
}