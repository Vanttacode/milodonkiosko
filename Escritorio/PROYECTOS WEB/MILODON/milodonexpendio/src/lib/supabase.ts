// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Error Crítico: Faltan las variables de entorno de Supabase para Milodon. " +
    "Revisa tu archivo .env en la raíz del proyecto."
  );
}

/**
 * Cliente de Supabase configurado para el proyecto Milodon (Vending).
 * Al establecer el esquema en la configuración inicial, todas las consultas
 * apuntarán a 'milodon' por defecto en lugar de 'public'.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'milodon'
  }
});