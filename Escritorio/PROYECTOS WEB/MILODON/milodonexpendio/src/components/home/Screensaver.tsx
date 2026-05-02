// src/components/home/Screensaver.tsx
import React from 'react'; //
export default function Screensaver() {
  return (
    <div className="relative flex flex-col items-center justify-center h-screen w-full bg-black text-white cursor-pointer overflow-hidden touch-none select-none">
      
      {/* Efecto visual 1: Degradado radial para romper el negro plano */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black opacity-80 pointer-events-none"></div>
      
      {/* Efecto visual 2: Halo de luz naranja detrás del logo */}
      <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-600/15 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Sección Superior: Logo de Milodon Vending */}
      <div className="relative z-10 flex-1 flex items-end justify-center pb-12">
        <img 
          src="/logo.png" 
          alt="Milodon Vending Logo" 
          className="w-[24rem] md:w-[32rem] drop-shadow-[0_15px_35px_rgba(0,0,0,0.8)] transition-transform duration-1000 hover:scale-105"
        />
      </div>

      {/* Sección Inferior: Texto de Llamada a la Acción */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-start pt-4">
        <h1 className="text-5xl md:text-6xl font-black uppercase tracking-wider text-center animate-pulse">
          <span className="bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 bg-clip-text text-transparent drop-shadow-lg">
            Toca la Pantalla
          </span>
        </h1>
        <p className="text-2xl md:text-3xl font-light tracking-[0.3em] text-slate-300 mt-6 opacity-90">
          PARA INICIAR prueba 
        </p>
      </div>

    </div>
  );
}