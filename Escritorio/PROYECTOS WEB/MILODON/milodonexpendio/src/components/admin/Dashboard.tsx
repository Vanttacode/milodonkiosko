// src/components/admin/Dashboard.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

// 1. Tipado estricto para las transacciones
export interface Transaction {
  id: string;
  created_at: string;
  sku: string;
  amount: number;
  status: 'SUCCESS' | 'MOTOR_ERROR' | 'REJECTED' | 'PROCESSING';
}

export default function Dashboard() {
  const [stats, setStats] = useState({ revenue: 0, salesCount: 0, motorErrors: 0 });
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();

    // 2. Suscripción en Tiempo Real (IoT Real-time monitoring)
    const channel = supabase
      .channel('vending_transactions')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'transactions' },
        (payload) => {
          console.log('Nueva transacción detectada:', payload.new);
          // Recargamos los datos para actualizar las métricas de inmediato
          fetchInitialData(); 
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchInitialData = async () => {
    // Nota arquitectónica: En producción con miles de datos, usaríamos una función RPC en Supabase
    // para calcular los totales, en lugar de traer toda la tabla al cliente.
    const { data: txs, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100); // Limitamos a las últimas 100 para no saturar memoria inicial

    if (txs && !error) {
      const successful = txs.filter(t => t.status === 'SUCCESS');
      const errors = txs.filter(t => t.status === 'MOTOR_ERROR');
      
      const totalRevenue = successful.reduce((sum, current) => sum + current.amount, 0);
      
      setStats({
        revenue: totalRevenue,
        salesCount: successful.length,
        motorErrors: errors.length
      });
      
      setRecentTx(txs.slice(0, 8)); // Mostramos solo las 8 más recientes en la tabla
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 animate-pulse">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Resumen Financiero</h2>
        <p className="text-slate-500 mt-1">Telemetría y métricas en tiempo real de la flota</p>
      </div>
      
      {/* Tarjetas de KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-slate-500 font-semibold mb-1 text-sm uppercase tracking-wider">Ingresos Netos</p>
            <p className="text-4xl font-black text-emerald-600">${stats.revenue.toLocaleString('es-CL')}</p>
          </div>
          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-slate-500 font-semibold mb-1 text-sm uppercase tracking-wider">Ventas Exitosas</p>
            <p className="text-4xl font-black text-blue-600">{stats.salesCount}</p>
          </div>
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-slate-500 font-semibold mb-1 text-sm uppercase tracking-wider">Alertas de Motor</p>
            <p className="text-4xl font-black text-red-600">{stats.motorErrors}</p>
          </div>
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center text-red-600">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
        </div>
      </div>

      {/* Tabla de Transacciones Recientes */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-lg">Transacciones Recientes</h3>
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 border-b font-semibold">Fecha y Hora</th>
                <th className="p-4 border-b font-semibold">Bandeja (SKU)</th>
                <th className="p-4 border-b font-semibold">Monto</th>
                <th className="p-4 border-b font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {recentTx.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400 italic">No hay transacciones registradas aún.</td>
                </tr>
              ) : (
                recentTx.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50 text-sm transition-colors">
                    <td className="p-4 border-b text-slate-600 font-medium">
                      {new Date(tx.created_at).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="p-4 border-b">
                      <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200 font-mono font-bold">
                        {tx.sku}
                      </span>
                    </td>
                    <td className="p-4 border-b font-bold text-slate-700">
                      ${tx.amount.toLocaleString('es-CL')}
                    </td>
                    <td className="p-4 border-b">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                        tx.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' : 
                        tx.status === 'MOTOR_ERROR' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                           tx.status === 'SUCCESS' ? 'bg-emerald-500' : 
                           tx.status === 'MOTOR_ERROR' ? 'bg-red-500' : 'bg-amber-500'
                        }`}></span>
                        {tx.status === 'SUCCESS' ? 'Completado' : 
                         tx.status === 'MOTOR_ERROR' ? 'Fallo Físico' : 'Rechazado'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}