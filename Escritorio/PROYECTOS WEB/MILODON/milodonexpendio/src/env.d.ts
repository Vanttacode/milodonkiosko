/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Extensión global de la interfaz Window para el Proyecto Milodón
interface Window {
  /**
   * Objeto inyectado por el Android Wrapper (MainActivity.java)
   * permite la comunicación desde el WebView hacia el hardware físico.
   */
  VendingHardware?: {
    // Inicia la sesión de cobro MDB. Espera un string con el monto.
    startPayment: (amount: string) => void;
    
    // Activa el giro físico del motor (RS232) pasando el SKU.
    dispenseProduct: (sku: string) => void;
    
    // Función legacy para testing (si se requiere mantener)
    probarMotor?: (sku: string) => void;
  };
  
  /**
   * Callbacks globales que el hardware Android (Java) invoca 
   * para notificar el resultado de las operaciones asíncronas al frontend React.
   */
  onPaymentApproved?: (status: string) => void;
  onPaymentCanceled?: (reason: string) => void;
  onDispenseComplete?: (status: 'SUCCESS' | 'ERROR_STUCK') => void;
  onPaymentError?: (msg: string) => void;
}