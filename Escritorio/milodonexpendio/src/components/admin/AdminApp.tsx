// src/components/admin/AdminApp.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Login from './Login';
import Dashboard from './Dashboard';
import Inventory from './Inventory';

export default function AdminApp() {
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory'>('dashboard');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = () => supabase.auth.signOut();

  if (!session) return <Login />;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Barra Lateral (Sidebar) */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-wider">MILODON<span className="text-blue-500">ADMIN</span></h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600' : 'hover:bg-slate-800 text-slate-300'}`}
          >
            Informes
          </button>
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'inventory' ? 'bg-blue-600' : 'hover:bg-slate-800 text-slate-300'}`}
          >
            Inventario
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full text-slate-400 hover:text-white flex items-center gap-2">
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'inventory' && <Inventory />}
      </main>
    </div>
  );
}