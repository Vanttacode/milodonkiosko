import React from 'react'; //// src/components/home/TransactionView.tsx
import type { Product } from './ProductCard';

interface TransactionViewProps {
  status: 'PROCESSING' | 'SUCCESS' | 'ERROR';
  product: Product | null;
  errorMessage?: string;
  onCancel: () => void;
}

export default function TransactionView({ status, product, errorMessage, onCancel }: TransactionViewProps) {
  // Estado: Procesando (Esperando al Lector MDB / Nayax)
  if (status === 'PROCESSING') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/98 backdrop-blur-xl animate-fade-in z-50 px-6">
        {/* Spinner industrial minimalista */}
        <div className="w-24 h-24 border-[6px] border-neutral-900 border-t-white rounded-full animate-spin mb-10"></div>
        
        <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter text-white uppercase">Procesando Pago</h2>
        <p className="text-xl md:text-2xl text-neutral-500 mb-12 font-bold tracking-widest uppercase">Siga las instrucciones en el lector</p>
        
        {product && (
          <div className="bg-neutral-950 border border-white/10 p-8 rounded-[2rem] flex items-center gap-8 mb-16 max-w-xl w-full shadow-2xl">
             <div className="bg-white/5 p-4 rounded-2xl">
                <img src={product.image_url} alt={product.name} className="h-28 w-28 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,1)]" draggable={false}/>
             </div>
             <div className="flex flex-col">
                <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-1">{product.name}</p>
                <p className="text-5xl text-white font-black tracking-tighter">${product.price.toLocaleString('es-CL')}</p>
             </div>
          </div>
        )}

        <button 
          onClick={onCancel}
          className="px-12 py-5 bg-transparent border-2 border-neutral-800 hover:border-red-600 rounded-full text-xl text-neutral-500 hover:text-red-500 font-black uppercase tracking-widest active:scale-95 transition-all duration-200"
        >
          Cancelar Operación
        </button>
      </div>
    );
  }

  // Estado: Éxito (Confirmación física del Motor Wuyi / Microswitch)
  if (status === 'SUCCESS') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black animate-fade-in z-50">
        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-10 shadow-[0_0_100px_rgba(255,255,255,0.2)] animate-pulse">
          <svg className="w-16 h-16 text-black" fill="none" stroke="currentColor" strokeWidth="5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter uppercase">¡Compra Exitosa!</h2>
        <p className="text-2xl md:text-3xl text-neutral-400 font-bold tracking-wide uppercase px-6 text-center">Retire su producto de la bandeja</p>
        
        <div className="mt-16 text-[10px] text-neutral-800 font-mono tracking-[0.5em] uppercase">MollyCode Hardware Interface v1.0</div>
      </div>
    );
  }

  // Estado: Error (Falla de cobro o Atasco en Matriz de Motores)
  if (status === 'ERROR') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black animate-fade-in z-50 px-10">
        <div className="w-32 h-32 border-4 border-red-600 rounded-full flex items-center justify-center mb-10 shadow-[0_0_60px_rgba(220,38,38,0.2)]">
          <svg className="w-16 h-16 text-red-600" fill="none" stroke="currentColor" strokeWidth="5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
        </div>
        <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter uppercase">Falla de Sistema</h2>
        <p className="text-xl md:text-2xl text-red-500 font-bold uppercase tracking-widest text-center max-w-3xl leading-relaxed">
          {errorMessage || 'Error en comunicación con la matriz de motores. Intente nuevamente.'}
        </p>
        
        <div className="mt-20 py-4 px-8 border border-neutral-900 rounded-xl">
           <p className="text-neutral-700 text-[10px] font-mono uppercase tracking-widest text-center">
             Si el problema persiste, contacte al administrador.
           </p>
        </div>
      </div>
    );
  }

  return null;
}