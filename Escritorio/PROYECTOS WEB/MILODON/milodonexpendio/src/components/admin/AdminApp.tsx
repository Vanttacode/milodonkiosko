import React from 'react'; //// src/components/admin/AdminApp.tsx
import { useState, useEffect } from 'react';
// Eliminamos las importaciones de Supabase para la autenticación
import Login from './Login';
import Dashboard from './Dashboard';
import Inventory from './Inventory';
import MotorTest from './MotorTest';

export default function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'motors'>('dashboard');

  useEffect(() => {
    // Al cargar, verificamos si existe el token local en la tablet
    const session = localStorage.getItem('milodon_session');
    if (session === 'active_admin') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    // Destruimos la sesión local y devolvemos al login
    localStorage.removeItem('milodon_session');
    setIsAuthenticated(false);
  };

  // Si no hay sesión local, mostramos el login Pitch Black
  // y le pasamos la función para que avise cuando el login sea exitoso
  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen flex bg-black font-sans text-slate-100 overflow-hidden">
      
      {/* Barra Lateral (Sidebar) - Estética Premium Dark Industrial */}
      <aside className="w-80 bg-black text-white flex flex-col shadow-[10px_0_30px_rgba(0,0,0,0.5)] z-20 border-r border-white/5">
        
        <div className="p-10 border-b border-white/5 bg-gradient-to-b from-neutral-900/50 to-transparent">
          <h1 className="text-2xl font-black tracking-[0.2em] text-white flex items-center gap-2">
            MILODÓN<span className="text-neutral-600 font-light">SYSTEM</span>
          </h1>
          <div className="mt-4 flex flex-col gap-1">
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Operador Activo</span>
            <p className="text-[11px] text-neutral-300 font-mono truncate bg-white/5 p-2 rounded-lg border border-white/5 text-center tracking-widest">
              ADMIN LOCAL
            </p>
          </div>
        </div>
        
        <nav className="flex-1 p-6 space-y-4 mt-4">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-left transition-all text-xs font-black uppercase tracking-[0.2em] ${
              activeTab === 'dashboard' 
                ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] translate-x-2' 
                : 'hover:bg-neutral-900 text-neutral-500 hover:text-white border border-transparent hover:border-white/5'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            Telemetría
          </button>
          
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-left transition-all text-xs font-black uppercase tracking-[0.2em] ${
              activeTab === 'inventory' 
                ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] translate-x-2' 
                : 'hover:bg-neutral-900 text-neutral-500 hover:text-white border border-transparent hover:border-white/5'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
            Inventario
          </button>

          <button 
            onClick={() => setActiveTab('motors')}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-left transition-all text-xs font-black uppercase tracking-[0.2em] ${
              activeTab === 'motors' 
                ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] translate-x-2' 
                : 'hover:bg-neutral-900 text-neutral-500 hover:text-white border border-transparent hover:border-white/5'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            Hardware Test
          </button>
        </nav>

        {/* Sección inferior de Salida */}
        <div className="p-8 border-t border-white/5 bg-black">
          <button 
            onClick={handleLogout} 
            className="w-full text-neutral-600 hover:text-red-500 hover:bg-red-500/5 flex items-center gap-4 px-6 py-4 rounded-2xl transition-all text-xs font-black uppercase tracking-widest"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Desconexión
          </button>
        </div>
      </aside>

      {/* Contenido Principal con Scroll Minimalista */}
      <main className="flex-1 overflow-y-auto relative bg-neutral-950">
        {/* Capa de iluminación sutil superior */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto p-12">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'inventory' && <Inventory />}
          {activeTab === 'motors' && <MotorTest />}
        </div>
      </main>

      <style>{`
        /* Scrollbar Técnica MollyCode */
        main::-webkit-scrollbar { width: 4px; }
        main::-webkit-scrollbar-track { background: #000; }
        main::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 10px; }
        main::-webkit-scrollbar-thumb:hover { background: #333; }
      `}</style>
    </div>
  );
}