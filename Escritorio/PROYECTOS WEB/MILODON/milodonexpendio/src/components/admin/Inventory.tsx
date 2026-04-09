// src/components/admin/Inventory.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

// Tipado estricto para el producto
export interface Product {
  sku: string; // Ej: A1, B4
  name: string;
  price: number;
  image_url: string;
  is_active: boolean;
}

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Estado unificado para el formulario
  const initialFormState = { sku: '', name: '', price: '', image_url: '' };
  const [form, setForm] = useState(initialFormState);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadProducts();

    // Suscripción en tiempo real a cambios en el inventario
    const channel = supabase
      .channel('vending_inventory')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => loadProducts() // Recarga si hay cualquier cambio (INSERT, UPDATE, DELETE)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('sku');
      
    if (data && !error) setProducts(data);
    setIsLoading(false);
  };

  const handleEditClick = (product: Product) => {
    setForm({
      sku: product.sku,
      name: product.name,
      price: product.price.toString(),
      image_url: product.image_url
    });
    setIsEditing(true);
    setShowForm(true);
    // Scroll suave hacia el formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setShowForm(false);
    setIsEditing(false);
    setForm(initialFormState);
  };

  const toggleActiveStatus = async (sku: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('products')
      .update({ is_active: !currentStatus })
      .eq('sku', sku);
      
    if (error) console.error("Error cambiando estado:", error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const { error } = await supabase.from('products').upsert({
      sku: form.sku.toUpperCase(),
      name: form.name,
      price: parseInt(form.price),
      image_url: form.image_url,
      is_active: true // Por defecto lo activamos al editar/crear
    });

    setIsSubmitting(false);

    if (!error) {
      handleCancel(); // Limpia y cierra el formulario
    } else {
      console.error("Error guardando producto: ", error);
      alert("Hubo un error al guardar en la base de datos.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 animate-pulse">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión de Inventario</h2>
          <p className="text-slate-500 text-sm mt-1">Configura las bandejas y el catálogo del kiosko</p>
        </div>
        <button 
          onClick={() => showForm ? handleCancel() : setShowForm(true)}
          className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${
            showForm 
              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300' 
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/30'
          }`}
        >
          {showForm ? (
            <>X Cancelar</>
          ) : (
            <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg> Nueva Bandeja</>
          )}
        </button>
      </div>

      {/* Formulario de Carga / Edición */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-blue-100 shadow-lg shadow-blue-900/5 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          <div className="md:col-span-2 pb-2 border-b border-slate-100 mb-2">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              {isEditing ? (
                <><span className="w-3 h-3 rounded-full bg-amber-500"></span> Editando Producto: {form.sku}</>
              ) : (
                <><span className="w-3 h-3 rounded-full bg-blue-500"></span> Configurar Nueva Bandeja</>
              )}
            </h3>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">SKU / Coordenada Matriz</label>
            <div className="relative">
              <input required type="text" maxLength={3} disabled={isEditing} value={form.sku} onChange={e => setForm({...form, sku: e.target.value.toUpperCase()})} className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono uppercase disabled:bg-slate-100 disabled:text-slate-400" placeholder="Ej: 350 (Fila 3, Col 5)" />
              {isEditing && <span className="absolute right-3 top-3.5 text-xs font-bold text-slate-400">FIJO</span>}
            </div>
            <p className="text-xs text-slate-500 mt-1">Este código debe coincidir exactamente con el hardware.</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Precio de Venta ($ CLP)</label>
            <input required type="number" min="0" step="10" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono" placeholder="Ej: 1500" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Nombre Comercial</label>
            <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Ej: Bebida Cola 500cc" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">URL de Imagen (PNG transparente)</label>
            <input required type="url" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="https://..." />
          </div>

          {/* Preview de Imagen Integrado */}
          {form.image_url && (
            <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-6">
               <div className="w-20 h-20 bg-white rounded-lg p-2 border shadow-sm">
                  <img src={form.image_url} alt="Preview" className="w-full h-full object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
               </div>
               <p className="text-sm font-medium text-slate-600">Vista previa de la imagen del producto.</p>
            </div>
          )}

          <div className="md:col-span-2 mt-4">
            <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-70 flex justify-center items-center gap-2">
              {isSubmitting ? (
                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Guardando...</>
              ) : (
                <>{isEditing ? 'Actualizar Producto' : 'Guardar Nueva Bandeja'}</>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Catálogo Actual (Grid) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {products.map(p => (
          <div key={p.sku} className={`bg-white border rounded-2xl p-5 flex flex-col items-center shadow-sm relative group transition-all ${!p.is_active ? 'opacity-60 grayscale-[0.5]' : 'hover:shadow-md hover:-translate-y-1'}`}>
             
             {/* Etiqueta SKU */}
             <div className="absolute top-3 left-3 bg-slate-900 text-white text-xs font-mono font-bold px-2.5 py-1 rounded-md shadow-sm">
               {p.sku}
             </div>

             {/* Botón Activar/Desactivar rápido */}
             <button 
               onClick={() => toggleActiveStatus(p.sku, p.is_active)}
               className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${
                 p.is_active ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200' : 'bg-slate-100 border-slate-300 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'
               }`}
               title={p.is_active ? "Desactivar" : "Activar"}
             >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                 {p.is_active ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path> : <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>}
               </svg>
             </button>

             {/* Contenido Card */}
             <div className="h-32 w-full mt-6 mb-4 flex items-center justify-center relative cursor-pointer" onClick={() => handleEditClick(p)}>
                {/* Overlay Hover */}
                <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center z-20">
                  <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">Editar</span>
                </div>
                <img src={p.image_url} alt={p.name} className="max-h-full object-contain relative z-10" />
             </div>
             
             <p className="font-semibold text-center text-slate-700 text-sm line-clamp-2 min-h-[40px] leading-tight cursor-pointer" onClick={() => handleEditClick(p)}>
               {p.name}
             </p>
             <p className="text-blue-600 font-black text-xl mt-2">${p.price.toLocaleString('es-CL')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}