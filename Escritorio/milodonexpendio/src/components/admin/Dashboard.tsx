// src/components/admin/Dashboard.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function Dashboard() {
  const [stats, setStats] = useState({ revenue: 0, salesCount: 0, motorErrors: 0 });
  const [recentTx, setRecentTx] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Obtenemos transacciones exitosas
    const { data: txs } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
    
    if (txs) {
      const successful = txs.filter(t => t.status === 'SUCCESS');
      const errors = txs.filter(t => t.status === 'MOTOR_ERROR');
      
      const totalRevenue = successful.reduce((sum, current) => sum + current.amount, 0);
      
      setStats({
        revenue: totalRevenue,
        salesCount: successful.length,
        motorErrors: errors.length
      });
      setRecentTx(txs.slice(0, 10)); // Últimas 10 transacciones
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800">Resumen Financiero</h2>
      
      {/* Tarjetas de KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-gray-500 font-medium mb-1">Ingresos Generados</p>
          <p className="text-4xl font-bold text-green-600">${stats.revenue.toLocaleString('es-CL')}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-gray-500 font-medium mb-1">Ventas Exitosas</p>
          <p className="text-4xl font-bold text-blue-600">{stats.salesCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-gray-500 font-medium mb-1">Alertas de Motor</p>
          <p className="text-4xl font-bold text-red-600">{stats.motorErrors}</p>
        </div>
      </div>

      {/* Tabla de Transacciones */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-800">Últimas Transacciones</h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm">
              <th className="p-4 border-b">Fecha y Hora</th>
              <th className="p-4 border-b">Bandeja (SKU)</th>
              <th className="p-4 border-b">Monto</th>
              <th className="p-4 border-b">Estado</th>
            </tr>
          </thead>
          <tbody>
            {recentTx.map(tx => (
              <tr key={tx.id} className="hover:bg-gray-50 text-sm">
                <td className="p-4 border-b text-gray-600">{new Date(tx.created_at).toLocaleString('es-CL')}</td>
                <td className="p-4 border-b font-mono font-medium">{tx.sku}</td>
                <td className="p-4 border-b">${tx.amount}</td>
                <td className="p-4 border-b">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    tx.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 
                    tx.status === 'MOTOR_ERROR' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}