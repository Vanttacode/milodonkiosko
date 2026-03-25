// src/components/home/ProductCard.tsx
export interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  image_url: string;
}

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export default function ProductCard({ product, onSelect }: ProductCardProps) {
  return (
    <button
      onClick={() => onSelect(product)}
      className="group flex flex-col items-center bg-slate-800 border border-slate-700 rounded-3xl p-6 transition-all duration-200 active:scale-95 active:bg-slate-700 shadow-lg"
    >
      <div className="w-full h-44 mb-5 bg-slate-900 rounded-2xl p-4 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="max-h-full object-contain relative z-10 drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)]" />
        ) : (
          <div className="text-slate-600 font-bold relative z-10">SIN IMAGEN</div>
        )}
      </div>
      <h3 className="text-2xl font-medium text-slate-200 text-center line-clamp-2 mb-3 leading-tight">
        {product.name}
      </h3>
      <div className="mt-auto flex items-center justify-between w-full">
        <span className="text-4xl font-bold text-blue-400">${product.price}</span>
        <span className="bg-slate-950 text-slate-400 text-lg font-mono px-4 py-2 rounded-xl border border-slate-800 shadow-inner">
          {product.sku}
        </span>
      </div>
    </button>
  );
}