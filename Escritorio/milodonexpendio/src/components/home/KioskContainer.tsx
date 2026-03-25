// src/components/home/KioskContainer.tsx
import { useState, useEffect, useCallback } from 'react';
import Header from './Header';
import Screensaver from './Screensaver';
import ProductCard, { type Product } from './ProductCard';
import TransactionView from './TransactionView';

export default function KioskContainer({ products }: { products: Product[] }) {
  const [status, setStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isScreensaver, setIsScreensaver] = useState(true);

  // Lógica de Inactividad (Salvapantallas)
  const resetIdleTimer = useCallback(() => setIsScreensaver(false), []);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (!isScreensaver && status === 'IDLE') {
      timeout = setTimeout(() => setIsScreensaver(true), 30000);
    }
    return () => clearTimeout(timeout);
  }, [isScreensaver, status]);

  useEffect(() => {
    const handleInteraction = () => { if (isScreensaver) resetIdleTimer(); };
    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [isScreensaver, resetIdleTimer]);

  // Manejo de Compra y Hardware
  const handleSelect = (product: Product) => {
    setSelectedProduct(product);
    setStatus('PROCESSING');

    if (typeof window !== 'undefined' && (window as any).VendingHardware) {
      (window as any).VendingHardware.procesarPago(product.sku, product.price);
    } else {
      setTimeout(() => {
        setStatus('SUCCESS');
        setTimeout(() => resetKiosk(), 5000);
      }, 3000);
    }
  };

  const resetKiosk = () => {
    setStatus('IDLE');
    setSelectedProduct(null);
    setIsScreensaver(true);
  };

  // Renderizado
  if (isScreensaver) return <Screensaver />;

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-slate-100 animate-fade-in relative select-none">
      <Header />

      <main className="flex-1 overflow-hidden relative">
        {status !== 'IDLE' && (
          <TransactionView status={status} product={selectedProduct} onCancel={resetKiosk} />
        )}

        {status === 'IDLE' && (
          <div className="h-full flex flex-col p-8 animate-fade-in">
            <header className="flex justify-between items-center mb-8">
              <h2 className="text-4xl font-bold text-slate-100 tracking-tight">Seleccione su producto</h2>
              <div className="px-5 py-3 bg-blue-900/30 text-blue-400 border border-blue-800/50 rounded-xl text-xl flex items-center gap-3 font-medium">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                Pagos Cashless MDB
              </div>
            </header>

            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 overflow-y-auto pb-8 pr-2">
              {products.map((product) => (
                <ProductCard key={product.sku} product={product} onSelect={handleSelect} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}