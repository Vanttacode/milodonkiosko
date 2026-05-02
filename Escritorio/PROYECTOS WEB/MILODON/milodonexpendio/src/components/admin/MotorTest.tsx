import React, { useState, useEffect, useRef } from 'react';

export default function MotorTest() {
  const [testingSku, setTestingSku] = useState<string | null>(null);
  const [status, setStatus] = useState<'IDLE' | 'TESTING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [message, setMessage] = useState('SISTEMA LISTO. SELECCIONE MOTOR.');

  const watchdogRef = useRef<NodeJS.Timeout | null>(null);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Especificación Ventor: 6 bandejas, 10 espirales por bandeja
  const filas = [1, 2, 3, 4, 5, 6];
  const columnas = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  useEffect(() => {
    return () => {
      // Limpieza de memoria y liberación de listeners globales
      delete window.onDispenseComplete;
      if (watchdogRef.current) clearTimeout(watchdogRef.current);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const handleTestMotor = (sku: string) => {
    if (status === 'TESTING') return;

    setTestingSku(sku);
    setStatus('TESTING');
    setMessage(`TX -> (NOAD:0-|NUM:${sku}0)`);

    // Límite de tiempo mecánico (10 segundos)
    if (watchdogRef.current) clearTimeout(watchdogRef.current);
    watchdogRef.current = setTimeout(() => {
      setStatus('ERROR');
      setMessage('TIMEOUT: SIN RESPUESTA DE PLACA WUYI. REVISE RS232.');
      setTestingSku(null);
    }, 10000);

    // Intercepción de respuesta nativa (JNI -> React)
    window.onDispenseComplete = (hardwareStatus: 'SUCCESS' | 'ERROR_STUCK') => {
      if (watchdogRef.current) clearTimeout(watchdogRef.current);

      if (hardwareStatus === 'SUCCESS') {
        setStatus('SUCCESS');
        setMessage(`RX <- MOTOR ${sku} GIRO CONFIRMADO.`);
      } else {
        setStatus('ERROR');
        setMessage(`RX <- ALERTA: MOTOR ${sku} ATASCADO O SENSOR FALLIDO.`);
      }

      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => {
        setStatus('IDLE');
        setTestingSku(null);
        setMessage('SISTEMA LISTO. SELECCIONE MOTOR.');
      }, 4000);
    };

    // Invocación a capa física
    if (typeof window !== 'undefined' && window.VendingHardware?.dispenseProduct) {
      window.VendingHardware.dispenseProduct(sku);
    } else {
      // Mock de depuración local
      setTimeout(() => {
         if (window.onDispenseComplete) window.onDispenseComplete('SUCCESS');
      }, 2500);
    }
  };

  return (
    <div className="min-h-screen bg-black text-neutral-200 font-sans p-8 animate-fade-in select-none">
      
      {/* Cabecera Industrial */}
      <div className="mb-8 border-b border-neutral-800 pb-6">
        <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Diagnóstico Mecatrónico</h2>
        <p className="text-neutral-500 font-mono text-sm mt-2 uppercase tracking-widest">
          Modo Servicio Activado • Puente JNI /dev/ttyS3
        </p>
      </div>

      {/* Monitor de Consola */}
      <div className={`p-6 rounded-xl border-2 font-mono text-lg flex items-center gap-4 transition-colors mb-10 ${
        status === 'IDLE' ? 'bg-neutral-950 border-neutral-800 text-neutral-400' :
        status === 'TESTING' ? 'bg-blue-950/30 border-blue-900 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.1)]' :
        status === 'SUCCESS' ? 'bg-green-950/30 border-green-900 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.1)]' :
        'bg-red-950/30 border-red-900 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.1)]'
      }`}>
        {status === 'TESTING' && <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
        {status === 'SUCCESS' && <div className="w-6 h-6 bg-green-500 rounded-full animate-pulse"></div>}
        {status === 'ERROR' && <div className="w-6 h-6 bg-red-500 rounded-full animate-bounce"></div>}
        {status === 'IDLE' && <div className="w-6 h-6 border-2 border-neutral-700 rounded-full"></div>}
        
        <p className="tracking-wider">{message}</p>
      </div>

      {/* Matriz 60 Relés */}
      <div className="bg-neutral-900 p-8 rounded-3xl border border-neutral-800 overflow-x-auto shadow-2xl">
        <div className="min-w-[800px] flex flex-col gap-5">
          {filas.map((fila) => (
            <div key={`fila-${fila}`} className="flex items-center gap-6">
              <div className="w-16 text-neutral-600 font-black text-xl tracking-tighter">F0{fila}</div>
              <div className="grid grid-cols-10 gap-4 flex-1">
                {columnas.map((col) => {
                  const sku = `${fila}${col}`;
                  const isThisTesting = testingSku === sku;
                  
                  return (
                    <button
                      key={sku}
                      disabled={status === 'TESTING'}
                      onClick={() => handleTestMotor(sku)}
                      className={`relative h-16 rounded-xl font-mono font-bold text-2xl flex items-center justify-center transition-all disabled:opacity-30 ${
                        isThisTesting 
                          ? 'bg-white text-black scale-110 z-10' 
                          : 'bg-black text-neutral-500 hover:bg-neutral-800 hover:text-white border border-neutral-800 active:scale-95'
                      }`}
                    >
                      {sku}
                      <div className="absolute bottom-1 right-2 text-[8px] text-neutral-700">M{sku}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}