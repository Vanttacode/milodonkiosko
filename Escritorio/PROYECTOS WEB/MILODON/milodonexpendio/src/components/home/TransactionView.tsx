// src/components/home/TransactionView.tsx
import type { Product } from './ProductCard';

interface TransactionViewProps {
  status: 'PROCESSING' | 'SUCCESS' | 'ERROR';
  product: Product | null;
  errorMessage?: string;
  onCancel: () => void;
}

export default function TransactionView({ status, product, errorMessage, onCancel }: TransactionViewProps) {
  if (status === 'PROCESSING') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-sm animate-fade-in z-50">
        <div className="w-28 h-28 border-[8px] border-slate-800 border-t-blue-500 rounded-full animate-spin mb-10 shadow-[0_0_30px_rgba(59,130,246,0.3)]"></div>
        <h2 className="text-5xl font-bold mb-4">Procesando Pago...</h2>
        <p className="text-2xl text-slate-400 mb-8">Siga las instrucciones en el lector de tarjetas</p>
        
        {product && (
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-3xl flex items-center gap-6 mb-12">
             <img src={product.image_url} alt={product.name} className="h-24 w-24 object-contain" draggable={false}/>
             <div>
                <p className="text-xl text-slate-300">{product.name}</p>
                <p className="text-5xl text-blue-400 font-black">${product.price}</p>
             </div>
          </div>
        )}

        <button 
          onClick={onCancel}
          className="px-10 py-5 bg-red-950/30 border border-red-900/50 rounded-full text-2xl text-red-400 font-medium active:scale-95 transition-all"
        >
          Cancelar Operación
        </button>
      </div>
    );
  }

  if (status === 'SUCCESS') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-950/95 backdrop-blur-sm animate-fade-in z-50">
        <div className="w-40 h-40 bg-emerald-500 rounded-full flex items-center justify-center mb-10 shadow-[0_0_80px_rgba(16,185,129,0.4)] animate-bounce">
          <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h2 className="text-6xl font-bold text-white mb-4">¡Compra Exitosa!</h2>
        <p className="text-3xl text-emerald-200">Retire su producto de la bandeja inferior</p>
      </div>
    );
  }

  if (status === 'ERROR') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/95 backdrop-blur-sm animate-fade-in z-50">
        <div className="w-40 h-40 bg-red-600 rounded-full flex items-center justify-center mb-10 shadow-[0_0_80px_rgba(220,38,38,0.4)]">
          <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
        </div>
        <h2 className="text-6xl font-bold text-white mb-4">Operación Fallida</h2>
        <p className="text-3xl text-red-200 text-center max-w-2xl">
          {errorMessage || 'Ha ocurrido un error con el pago o la dispensación. No se han realizado cobros.'}
        </p>
      </div>
    );
  }

  return null;
}