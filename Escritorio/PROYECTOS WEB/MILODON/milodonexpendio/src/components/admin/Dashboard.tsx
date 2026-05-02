import React from 'react'; //// src/components/admin/Dashboard.tsx
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

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

  // Memorizamos la carga de datos para evitar re-renderizados infinitos
  const fetchData = useCallback(async () => {
    const { data: txs, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50); 

    if (txs && !error) {
      const successful = txs.filter(t => t.status === 'SUCCESS');
      const errors = txs.filter(t => t.status === 'MOTOR_ERROR');
      
      const totalRevenue = successful.reduce((sum, current) => sum + current.amount, 0);
      
      setStats({
        revenue: totalRevenue,
        salesCount: successful.length,
        motorErrors: errors.length
      });
      
      setRecentTx(txs.slice(0, 10)); // Mostrar las 10 más recientes
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();

    // Suscripción Realtime al esquema milodon
    const channel = supabase
      .channel('vending_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'milodon', table: 'transactions' },
        () => fetchData() // Recarga automática al detectar nueva venta o error
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Telemetría</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">Métricas de flota en tiempo real</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Sistema Online</span>
        </div>
      </div>
      
      {/* Tarjetas de KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ingresos Totales</p>
            <p className="text-4xl font-black text-slate-950">${stats.revenue.toLocaleString('es-CL')}</p>
          </div>
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 font-bold">$</div>
        </div>

        <div className="bg-black p-8 rounded-[2rem] shadow-2xl flex items-center justify-between group transition-all">
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 text-neutral-400">Ventas Exitósas</p>
            <p className="text-4xl font-black text-white">{stats.salesCount}</p>
          </div>
          <div className="w-14 h-14 bg-white/10 text-white rounded-2xl flex items-center justify-center border border-white/10">OK</div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Fallas de Motor</p>
            <p className="text-4xl font-black text-red-600">{stats.motorErrors}</p>
          </div>
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center border border-red-100 font-bold">!</div>
        </div>
      </div>

      {/* Tabla de Historial */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
          <h3 className="font-black text-slate-950 uppercase text-sm tracking-widest">Registro de Actividad</h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Últimas 50 operaciones</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
                <th className="px-8 py-4">Timestamp</th>
                <th className="px-8 py-4">Slot (SKU)</th>
                <th className="px-8 py-4">Monto</th>
                <th className="px-8 py-4">Resultado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentTx.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5 text-xs font-medium text-slate-500">
                    {new Date(tx.created_at).toLocaleString('es-CL')}
                  </td>
                  <td className="px-8 py-5">
                    <span className="bg-slate-900 text-white px-3 py-1 rounded-lg font-mono text-xs font-bold">
                      {tx.sku}
                    </span>
                  </td>
                  <td className="px-8 py-5 font-black text-slate-900">
                    ${tx.amount.toLocaleString('es-CL')}
                  </td>
                  <td className="px-8 py-5">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                      tx.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                      tx.status === 'MOTOR_ERROR' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {tx.status === 'SUCCESS' ? 'Completado' : 
                       tx.status === 'MOTOR_ERROR' ? 'Fallo Motor' : 'Rechazado'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}