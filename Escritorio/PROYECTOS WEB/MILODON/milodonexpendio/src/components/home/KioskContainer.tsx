import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './Header';
import Screensaver from './Screensaver';
import ProductCard, { type Product } from './ProductCard';
import TransactionView from './TransactionView';
import { supabase } from '../../lib/supabase';

/**
 * KioskContainer: Cerebro de la interfaz de usuario.
 * Gestiona la máquina de estados, la comunicación con el hardware RK3288
 * y la persistencia de datos en Supabase.
 * * Estética: TOTAL BLACK (Pitch Black) - Optimizado para Magallanes.
 */
export default function KioskContainer({ products }: { products: Product[] }) {
  const [status, setStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isScreensaver, setIsScreensaver] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Filtrado de productos activos desde el esquema 'milodon'
  const activeProducts = products.filter(product => product.is_active);

  /**
   * Restablece el kiosko al estado inicial (Salvapantallas)
   */
  const resetKiosk = useCallback(() => {
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    
    setStatus('IDLE');
    setSelectedProduct(null);
    setErrorMessage('');
    setIsScreensaver(true);
  }, []);

  /**
   * Cancela la sesión activa en el hardware y libera la interfaz
   */
  const handleCancel = useCallback(() => {
    // Si se requiere cancelar a nivel de hardware MDB, se llama a la función nativa si existe
    if (window.VendingHardware && (window.VendingHardware as any).cancelPayment) {
       (window.VendingHardware as any).cancelPayment();
    }
    resetKiosk();
  }, [resetKiosk]);

  /**
   * Lógica de Inactividad (Watchdog):
   * 1. Si está en IDLE: 30s para activar Screensaver.
   * 2. Si está en PROCESSING: 60s para cancelar pago si el usuario abandona.
   */
  useEffect(() => {
    const startTimer = () => {
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);

      if (status === 'IDLE' && !isScreensaver) {
        idleTimeoutRef.current = setTimeout(() => setIsScreensaver(true), 30000);
      } else if (status === 'PROCESSING') {
        idleTimeoutRef.current = setTimeout(() => {
          console.warn('Sesión abandonada durante pago. Cancelando hardware.');
          handleCancel();
        }, 60000);
      }
    };

    const handleInteraction = () => {
      if (isScreensaver) setIsScreensaver(false);
      startTimer();
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    startTimer();

    return () => {
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [isScreensaver, status, handleCancel]);

  /**
   * Escucha de respuestas (Callbacks) desde el Android Wrapper (MainActivity.java)
   */
  useEffect(() => {
    
    // Callback 1: El terminal PayScan aprobó el cobro
    window.onPaymentApproved = (hardwareStatus: string) => {
      console.log('Hardware informa: Pago Aprobado. Procediendo a despachar motor...', hardwareStatus);
      if (selectedProduct && window.VendingHardware?.dispenseProduct) {
         window.VendingHardware.dispenseProduct(selectedProduct.sku);
      }
    };

    // Callback 2: El terminal PayScan rechazó o canceló el cobro
    window.onPaymentCanceled = (reason: string) => {
      console.log('Hardware informa: Pago cancelado o fallido.', reason);
      setErrorMessage('Transacción declinada o cancelada.');
      setStatus('ERROR');
      feedbackTimeoutRef.current = setTimeout(() => resetKiosk(), 5000);
    };

    // Callback 3: El motor terminó de girar (Exitoso o atascado)
    window.onDispenseComplete = async (hardwareStatus: 'SUCCESS' | 'ERROR_STUCK') => {
      if (hardwareStatus === 'SUCCESS') {
         setStatus('SUCCESS');
         
         // Descuento de inventario en base de datos
         if (selectedProduct) {
            try {
              await supabase.rpc('decrement_inventory', { row_sku: selectedProduct.sku });
            } catch (err) {
              console.error('Error al actualizar inventario en Supabase:', err);
            }
         }
         
         feedbackTimeoutRef.current = setTimeout(() => resetKiosk(), 5000);
      } else {
         setStatus('ERROR');
         setErrorMessage('Error de dispensación. Producto atascado.');
         feedbackTimeoutRef.current = setTimeout(() => resetKiosk(), 7000);
      }
    };

    // Manejo de errores generales del puente
    window.onPaymentError = (msg: string) => {
       setStatus('ERROR');
       setErrorMessage(msg || 'Error de hardware. Adaptador no disponible.');
       feedbackTimeoutRef.current = setTimeout(() => resetKiosk(), 5000);
    };

    return () => {
      delete window.onPaymentApproved;
      delete window.onPaymentCanceled;
      delete window.onDispenseComplete;
      delete window.onPaymentError;
    };
  }, [selectedProduct, resetKiosk]);

  /**
   * Inicia el flujo de venta llamando al puente nativo de Java
   */
  const handleSelect = (product: Product) => {
    setSelectedProduct(product);
    setStatus('PROCESSING');
    setIsScreensaver(false);

    if (window.VendingHardware?.startPayment) {
      // Envía instrucción al bridge Android -> Bus MDB para INICIAR COBRO
      window.VendingHardware.startPayment(product.price.toString());
    } else {
      // Mock para desarrollo local (PC sin hardware)
      console.log(`[DEV] Hardware no detectado. Simulando cobro para: ${product.sku} a $${product.price}`);
      setTimeout(() => {
         if (window.onPaymentApproved) window.onPaymentApproved('DEV_OK');
         
         // Simulamos también el evento de giro de motor 2 segundos después
         setTimeout(() => {
            if (window.onDispenseComplete) window.onDispenseComplete('SUCCESS');
         }, 2000);
      }, 3000);
    }
  };

  if (isScreensaver) return <Screensaver />;

  return (
    <div className="h-screen flex flex-col bg-black text-slate-100 font-sans relative select-none touch-none overflow-hidden">
      
      <div className="absolute inset-0 bg-black pointer-events-none z-0"></div>

      <div className="relative z-10 flex flex-col h-full">
        <Header />
        
        <main className="flex-1 overflow-hidden relative flex flex-col">
          {/* Vista de Transacción */}
          {status !== 'IDLE' && (
            <TransactionView 
              status={status} 
              product={selectedProduct} 
              errorMessage={errorMessage}
              onCancel={handleCancel} 
            />
          )}

          {/* Galería de Productos */}
          {status === 'IDLE' && (
            <div className="flex-1 flex flex-col p-6 md:p-10 h-full animate-fade-in">
              
              <header className="flex flex-col justify-center items-center mb-10 mt-4">
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                  ¿QUÉ TE APETECE HOY?
                </h2>
                <p className="text-slate-600 mt-2 font-bold tracking-[0.2em] uppercase text-[10px]">
                  Punta Arenas • Magallanes • Chile
                </p>
                <div className="w-12 h-px bg-slate-800 mx-auto mt-6"></div>
              </header>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8 overflow-y-auto pb-10 px-4 scrollbar-hide">
                {activeProducts.map((product) => (
                  <ProductCard 
                    key={product.sku} 
                    product={product} 
                    onSelect={handleSelect} 
                  />
                ))}
              </div>

            </div>
          )}
        </main>

        <footer className="w-full py-3 px-6 border-t border-slate-900 bg-black relative z-20">
          <div className="flex justify-between items-center text-slate-700">
            <p className="text-[9px] font-bold tracking-tight">
              Desarrollado por <span className="text-slate-500">Molly<span className="text-slate-300">Code</span></span>
            </p>
          </div>
        </footer>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        :root { overflow: hidden; overscroll-behavior: none; background-color: black; }
      `}</style>
    </div>
  );
}