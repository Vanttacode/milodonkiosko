import React from 'react'; //// src/components/home/Header.tsx
import { useState, useEffect } from 'react';

export default function Header() {
  const [time, setTime] = useState(new Date());
  const [clickCount, setClickCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  // 1. Reloj Premium Sutil
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Monitoreo de Conectividad de la Tableta RK3288
  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  // 3. Easter Egg: 6 clics para ir a /admin
  useEffect(() => {
    if (clickCount === 6) {
      window.location.href = '/admin';
    }
    // Resetear contador si no se llega a 6 en 3 segundos
    const timer = setTimeout(() => setClickCount(0), 3000);
    return () => clearTimeout(timer);
  }, [clickCount]);

  const formattedTime = time.toLocaleTimeString('es-CL', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });

  return (
    <header className="flex justify-between items-center px-8 py-6 bg-black border-b border-slate-900 z-20">
      
      {/* Sección Izquierda: Logo con funcionalidad oculta */}
      <div 
        className="flex items-center cursor-none active:scale-95 transition-transform"
        onClick={() => setClickCount(prev => prev + 1)}
      >
        <img 
          src="/logo.png" 
          alt="Milodon Vending" 
          className="h-14 md:h-16 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.05)]" 
        />
      </div>
      
      {/* Sección Derecha: Telemetría de Sistema */}
      <div className="flex items-center gap-8">
        
        {/* Ícono de Señal: Rojo si no hay WiFi (Android Offline) */}
        <div className="flex items-center">
          <svg 
            className={`w-6 h-6 transition-colors duration-500 ${isOnline ? 'text-slate-800' : 'text-red-600 animate-pulse'}`} 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M12 3C7.95 3 4.21 4.34 1.2 6.6L3 9C5.5 7.12 8.62 6 12 6C15.38 6 18.5 7.12 21 9L22.8 6.6C19.79 4.34 16.05 3 12 3ZM12 9C9.3 9 6.81 9.86 4.8 11.28L6.6 13.68C8.13 12.63 9.98 12 12 12C14.02 12 15.87 12.63 17.4 13.68L19.2 11.28C17.19 9.86 14.7 9 12 9ZM12 15C10.6 15 9.32 15.43 8.3 16.15L12 21L15.7 16.15C14.68 15.43 13.4 15 12 15Z"/>
          </svg>
        </div>

        {/* Reloj Digital Minimalista */}
        <div className="flex flex-col items-end">
          <span className="text-2xl font-light font-mono text-slate-400 tracking-[0.3em]">
            {formattedTime}
          </span>
          {!isOnline && (
            <span className="text-[10px] font-black text-red-600 uppercase tracking-tighter">
              Sin Conexión
            </span>
          )}
        </div>
      </div>

    </header>
  );
}