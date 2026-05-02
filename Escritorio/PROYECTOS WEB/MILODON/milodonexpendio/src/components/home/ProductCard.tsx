import React from 'react'; //// src/components/home/ProductCard.tsx
export interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  stock: number; // Integrado para control de inventario [cite: 89]
  image_url: string;
  is_active?: boolean; 
  machine_id?: string;
}

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export default function ProductCard({ product, onSelect }: ProductCardProps) {
  // Verificación de disponibilidad física [cite: 30, 89]
  const isOutOfStock = (product.stock ?? 0) <= 0;

  return (
    <button
      onClick={() => !isOutOfStock && onSelect(product)}
      disabled={isOutOfStock}
      // Estética Pitch Black con feedback de deshabilitado para productos sin stock
      className={`group flex flex-col items-center bg-black border border-white/5 rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-6 transition-all duration-150 shadow-2xl touch-manipulation relative overflow-hidden w-full min-h-[320px] md:min-h-[400px] ${
        isOutOfStock ? 'opacity-40 grayscale cursor-not-allowed' : 'active:scale-95 active:bg-neutral-900 active:border-white/20'
      }`}
    >
      {/* Destello Táctil: Solo activo si hay stock */}
      {!isOutOfStock && (
        <div className="absolute inset-0 bg-white/0 group-active:bg-white/5 transition-colors duration-100 pointer-events-none z-0"></div>
      )}

      {/* Contenedor de Imagen con profundidad técnica  */}
      <div className="w-full aspect-square md:h-48 mb-4 md:mb-6 bg-neutral-950 rounded-2xl md:rounded-3xl p-3 md:p-5 flex items-center justify-center relative overflow-hidden shadow-inner border border-white/5 z-10">
        <div className="absolute w-16 h-16 md:w-24 md:h-24 bg-white/5 blur-3xl rounded-full"></div>
        
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name} 
            draggable={false}
            className="max-h-full max-w-full object-contain relative z-10 drop-shadow-[0_15px_20px_rgba(0,0,0,1)] transition-transform duration-300" 
          />
        ) : (
          <div className="text-neutral-700 font-bold tracking-[0.2em] text-[8px] md:text-[10px] uppercase relative z-10">
            No_Asset
          </div>
        )}

        {/* Overlay de Agotado: Bloqueo visual preventivo [cite: 30] */}
        {isOutOfStock && (
          <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-white text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
              Agotado
            </span>
          </div>
        )}
      </div>
      
      {/* Título: Tipografía industrial [cite: 79] */}
      <h3 className="text-xs md:text-sm lg:text-base font-black text-neutral-400 text-center line-clamp-2 mb-4 leading-tight z-10 tracking-widest uppercase px-1">
        {product.name}
      </h3>
      
      <div className="mt-auto flex flex-col items-center gap-2 md:gap-4 w-full z-10">
        {/* Precio: Blanco puro sobre Negro  */}
        <span className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tighter">
          ${product.price.toLocaleString('es-CL')}
        </span>
        
        {/* Etiqueta Técnica de Ubicación (SKU) sin texto adicional */}
        <div className="flex items-center">
           <span className="bg-neutral-100 text-black text-[10px] md:text-xs lg:text-sm font-mono font-black px-3 md:px-4 py-1 rounded-md md:rounded-lg shadow-sm">
             {product.sku}
           </span>
        </div>
      </div>
    </button>
  );
}