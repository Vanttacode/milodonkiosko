// src/components/home/KioskContainer.tsx
import { useState, useEffect, useRef } from 'react';
import Header from './Header';
import Screensaver from './Screensaver';
import ProductCard, { type Product } from './ProductCard';
import TransactionView from './TransactionView';

// Tipado para el Bridge de Android
declare global {
  interface Window {
    VendingHardware?: {
      procesarPago: (sku: string, price: number) => void;
      cancelarPago: () => void;
    };
    vendingCallback?: (status: 'SUCCESS' | 'ERROR', message?: string) => void;
  }
}

export default function KioskContainer({ products }: { products: Product[] }) {
  const [status, setStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isScreensaver, setIsScreensaver] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Lógica robusta de Inactividad (Reset con CADA interacción)
  useEffect(() => {
    const resetTimer = () => {
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      // Solo vuelve al salvapantallas si está inactivo (no en medio de un pago)
      if (status === 'IDLE') {
        idleTimeoutRef.current = setTimeout(() => setIsScreensaver(true), 30000);
      }
    };

    const handleInteraction = () => {
      if (isScreensaver) setIsScreensaver(false);
      resetTimer();
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    resetTimer(); // Iniciar al montar

    return () => {
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [isScreensaver, status]);

  // 2. Escucha Activa desde Android (JS Bridge Bidireccional)
  useEffect(() => {
    window.vendingCallback = (newStatus, msg) => {
      setStatus(newStatus);
      if (msg) setErrorMessage(msg);
      
      // Auto-restaurar Kiosko después de mostrar el mensaje de éxito o error
      setTimeout(() => resetKiosk(), newStatus === 'SUCCESS' ? 4000 : 6000);
    };

    return () => {
      delete window.vendingCallback;
    };
  }, []);

  const handleSelect = (product: Product) => {
    setSelectedProduct(product);
    setStatus('PROCESSING');
    setIsScreensaver(false);

    // Llamada al Hardware Nativo
    if (typeof window !== 'undefined' && window.VendingHardware) {
      window.VendingHardware.procesarPago(product.sku, product.price);
    } else {
      // MOCK para desarrollo en PC: Simula aprobación y caída de motor
      console.log(`[DEV MOCK] Iniciando MDB para: ${product.sku} - $${product.price}`);
      setTimeout(() => {
        if (window.vendingCallback) window.vendingCallback('SUCCESS');
      }, 3000);
    }
  };

  const handleCancel = () => {
    if (typeof window !== 'undefined' && window.VendingHardware) {
      window.VendingHardware.cancelarPago(); // Aborta MDB
    }
    resetKiosk();
  };

  const resetKiosk = () => {
    setStatus('IDLE');
    setSelectedProduct(null);
    setErrorMessage('');
    setIsScreensaver(true);
  };

  if (isScreensaver) return <Screensaver />;

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-slate-100 animate-fade-in relative select-none">
      <Header />
      <main className="flex-1 overflow-hidden relative">
        {status !== 'IDLE' && (
          <TransactionView 
            status={status} 
            product={selectedProduct} 
            errorMessage={errorMessage}
            onCancel={handleCancel} 
          />
        )}

        {status === 'IDLE' && (
          <div className="h-full flex flex-col p-8 animate-fade-in">
            {/* UI del Catálogo (Igual a tu código original) ... */}
            <header className="flex justify-between items-center mb-8">
              <h2 className="text-4xl font-bold tracking-tight">Seleccione su producto</h2>
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