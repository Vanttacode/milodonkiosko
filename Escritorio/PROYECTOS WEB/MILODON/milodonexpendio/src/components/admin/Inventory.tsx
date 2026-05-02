import React from 'react'; //// src/components/admin/Inventory.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

// Generador de la Matriz física Wuyi (6 Filas x 10 Columnas) 
const generateVendingMatrix = () => {
  const matrix = [];
  for (let fila = 1; fila <= 6; fila++) {
    const espirales = [];
    for (let col = 0; col <= 9; col++) {
      const skuNumber = `${fila}${col}`;
      espirales.push({ value: skuNumber, label: `Espiral ${col} (Motor: ${skuNumber})` });
    }
    matrix.push({ filaName: `Bandeja ${fila}`, espirales });
  }
  return matrix;
};

const vendingMatrix = generateVendingMatrix();

export default function Inventory() {
  const [products, setProducts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [form, setForm] = useState({ sku: '', name: '', price: '', stock: '0' });
  const [isEditing, setIsEditing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('sku');
    if (data) setProducts(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sku) return alert("Selecciona un motor");
    
    setIsSubmitting(true);
    let finalImageUrl = previewUrl;

    if (imageFile) {
      const fileName = `${form.sku}-${Date.now()}`;
      const { data: upData } = await supabase.storage.from('image-milodon').upload(`items/${fileName}`, imageFile);
      if (upData) {
        const { data: urlData } = supabase.storage.from('image-milodon').getPublicUrl(`items/${fileName}`);
        finalImageUrl = urlData.publicUrl;
      }
    }

    const { error } = await supabase.from('products').upsert({
      sku: form.sku,
      name: form.name.toUpperCase(),
      price: parseInt(form.price),
      stock: parseInt(form.stock),
      image_url: finalImageUrl,
      is_active: true 
    }, { onConflict: 'sku' }); // [cite: 13, 14]

    if (!error) {
      setShowForm(false);
      setIsEditing(false);
      setForm({ sku: '', name: '', price: '', stock: '0' });
      setImageFile(null);
      setPreviewUrl('');
      loadProducts();
    }
    setIsSubmitting(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '900', color: 'white' }}>INVENTARIO MATRIZ</h2>
        <button 
          onClick={() => { if(showForm) { setIsEditing(false); setForm({ sku: '', name: '', price: '', stock: '0' }); } setShowForm(!showForm); }}
          style={{ padding: '12px 24px', backgroundColor: 'white', color: 'black', fontWeight: 'bold', borderRadius: '12px', border: 'none' }}
        >
          {showForm ? 'CANCELAR' : '+ NUEVO PRODUCTO'}
        </button>
      </div>

      {showForm && (
        <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '20px', marginBottom: '30px', border: '5px solid #333', position: 'relative', zIndex: 100 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              
              {/* SELECTOR DE MOTOR OBLIGATORIO */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '900', color: '#666', marginBottom: '8px' }}>SELECCIONAR MOTOR (UBICACIÓN FÍSICA)</label>
                <select 
                  required 
                  disabled={isEditing}
                  value={form.sku}
                  onChange={e => setForm({...form, sku: e.target.value})}
                  style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '2px solid #ddd', color: 'black', backgroundColor: 'white', fontSize: '16px', fontWeight: 'bold' }}
                >
                  <option value="">-- ELIGE UN MOTOR DISPONIBLE --</option>
                  {vendingMatrix.map(bandeja => (
                    <optgroup key={bandeja.filaName} label={bandeja.filaName} style={{ fontWeight: 'bold' }}>
                      {bandeja.espirales.map(motor => (
                        <option key={motor.value} value={motor.value}>
                          {motor.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '900', color: '#666', marginBottom: '8px' }}>NOMBRE DEL PRODUCTO</label>
                <input 
                  required 
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '2px solid #ddd', color: 'black', backgroundColor: 'white', fontWeight: 'bold' }} 
                  placeholder="EJ: REDBULL 250ML"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '900', color: '#666', marginBottom: '8px' }}>PRECIO ($)</label>
                <input 
                  required 
                  type="number"
                  value={form.price}
                  onChange={e => setForm({...form, price: e.target.value})}
                  style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '2px solid #ddd', color: 'black', backgroundColor: 'white', fontSize: '18px', fontWeight: '900' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '900', color: '#666', marginBottom: '8px' }}>STOCK ACTUAL</label>
                <input 
                  required 
                  type="number"
                  value={form.stock}
                  onChange={e => setForm({...form, stock: e.target.value})}
                  style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '2px solid #ddd', color: 'black', backgroundColor: 'white', fontSize: '18px', fontWeight: '900' }} 
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '900', color: '#666', marginBottom: '8px' }}>SUBIR IMAGEN</label>
                <input 
                  type="file" 
                  onChange={e => {
                    if(e.target.files?.[0]) {
                      setImageFile(e.target.files[0]);
                      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                  style={{ width: '100%', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '10px', border: '1px solid #ddd' }} 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{ width: '100%', marginTop: '25px', padding: '20px', backgroundColor: 'black', color: 'white', fontWeight: '900', borderRadius: '15px', fontSize: '14px', letterSpacing: '2px', cursor: 'pointer', border: 'none' }}
            >
              {isSubmitting ? 'SINCRONIZANDO...' : isEditing ? 'ACTUALIZAR DATOS' : 'GUARDAR EN MATRIZ'}
            </button>
          </form>
        </div>
      )}

      {/* Grid - Optimizado para visibilidad en RK3288 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
        {products.map(p => (
          <div key={p.sku} style={{ backgroundColor: '#111', padding: '20px', borderRadius: '15px', textAlign: 'center', border: '1px solid #333' }}>
            <div style={{ fontSize: '12px', fontWeight: '900', color: 'white', backgroundColor: '#333', display: 'inline-block', padding: '4px 10px', borderRadius: '5px', marginBottom: '10px' }}>
              SLOT: {p.sku}
            </div>
            <img src={p.image_url} style={{ width: '100%', height: '120px', objectFit: 'contain', margin: '10px 0' }} />
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#ccc', marginBottom: '10px', textTransform: 'uppercase' }}>{p.name}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', borderTop: '1px solid #222', paddingTop: '10px' }}>
              <span style={{ fontSize: '18px', fontWeight: '900', color: 'white' }}>${p.price}</span>
              <span style={{ fontSize: '10px', fontWeight: 'bold', color: p.stock < 3 ? 'red' : '#00ff00' }}>STOCK: {p.stock}</span>
            </div>
            <button 
              onClick={() => {
                setForm({ sku: p.sku, name: p.name, price: p.price.toString(), stock: p.stock.toString() });
                setPreviewUrl(p.image_url);
                setIsEditing(true);
                setShowForm(true);
              }}
              style={{ width: '100%', marginTop: '15px', padding: '8px', fontSize: '10px', fontWeight: 'bold', backgroundColor: '#222', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
              EDITAR BANDEJA
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}