// src/components/admin/Inventory.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function Inventory() {
  const [products, setProducts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  
  // Estado del formulario
  const [form, setForm] = useState({ sku: '', name: '', price: '', image_url: '' });

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('sku');
    if (data) setProducts(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Insertamos o actualizamos (UPSERT) basado en el SKU
    const { error } = await supabase.from('products').upsert({
      sku: form.sku.toUpperCase(),
      name: form.name,
      price: parseInt(form.price),
      image_url: form.image_url,
      is_active: true
    });

    if (!error) {
      setShowForm(false);
      setForm({ sku: '', name: '', price: '', image_url: '' });
      loadProducts();
    } else {
      alert("Error guardando producto: " + error.message);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Inventario</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
        >
          {showForm ? 'Cancelar' : '+ Nuevo Producto'}
        </button>
      </div>

      {/* Formulario de Carga */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-blue-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">SKU / Bandeja (Ej: A1, B4)</label>
            <input required type="text" maxLength={3} value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} className="mt-1 w-full border p-2 rounded focus:ring-blue-500 outline-none" placeholder="A1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre del Producto</label>
            <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="mt-1 w-full border p-2 rounded focus:ring-blue-500 outline-none" placeholder="Coca-Cola 500cc" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Precio de Venta ($)</label>
            <input required type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="mt-1 w-full border p-2 rounded focus:ring-blue-500 outline-none" placeholder="1500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">URL de Imagen (PNG transparente)</label>
            <input required type="url" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} className="mt-1 w-full border p-2 rounded focus:ring-blue-500 outline-none" placeholder="https://..." />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700">Guardar en Base de Datos</button>
          </div>
        </form>
      )}

      {/* Catálogo Actual */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map(p => (
          <div key={p.sku} className="bg-white border rounded-xl p-4 flex flex-col items-center shadow-sm relative">
             <span className="absolute top-2 left-2 bg-gray-900 text-white text-xs font-mono px-2 py-1 rounded">{p.sku}</span>
             <img src={p.image_url} alt={p.name} className="h-24 object-contain my-3" />
             <p className="font-medium text-center text-sm line-clamp-2">{p.name}</p>
             <p className="text-blue-600 font-bold mt-1">${p.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}