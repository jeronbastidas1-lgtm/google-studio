import React, { useState } from 'react';
import { X, Smartphone, Bell, Radio, Check, Copy, Shield, BatteryCharging, Zap } from 'lucide-react';

interface AndroidSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  webhookUrl: string;
}

export const AndroidSetupModal: React.FC<AndroidSetupModalProps> = ({
  isOpen,
  onClose,
  webhookUrl
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">
                Guía de Conexión en Android
              </h3>
              <p className="text-xs text-slate-400">
                Aprende a instalar la app y conectarla con tus notificaciones bancarias
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 cursor-pointer"
            aria-label="Cerrar guía"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content steps */}
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Step 1: Install PWA */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-2">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-sky-500/20 flex items-center justify-center text-xs">1</span>
              <span>Instalar como App Nativa en tu Android</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed pl-8">
              Abre esta página en Google Chrome desde tu teléfono Android, pulsa los <strong>3 puntos (⋮)</strong> en la esquina superior derecha y selecciona <strong>«Instalar aplicación»</strong> o <strong>«Agregar a la pantalla principal»</strong>.
            </p>
            <p className="text-[11px] text-slate-400 pl-8">
              ✓ Obtendrás un ícono en tu pantalla de inicio y se abrirá en pantalla completa como cualquier app de Play Store.
            </p>
          </div>

          {/* Step 2: How real bank notifications connect */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs">2</span>
              <span>¿Cómo se conecta con tu Banco (Nequi, Bancolombia, DaviPlata, etc.)?</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed pl-8">
              En Colombia y Latinoamérica, los bancos no tienen APIs públicas para cuentas de personas comunes. La manera profesional en que los comercios automatizan el audio es mediante <strong>lectura de notificaciones Push o SMS</strong>:
            </p>

            <div className="ml-8 space-y-2 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="font-bold text-white block mb-1">Método A: Automatizador Android (MacroDroid o Tasker - Gratis)</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  1. Descargas <strong>MacroDroid</strong> en tu Android.<br />
                  2. Creas una macro simple: <em>Disparador: Notificación recibida de (Nequi / Bancolombia / Daviplata)</em>.<br />
                  3. Acción: <em>Solicitud HTTP POST</em> con el contenido del mensaje hacia la URL Webhook de tu VozBanco.<br />
                  4. ¡Listo! Cada vez que entre plata, VozBanco hablará automáticamente por el altavoz de tu celular o parlante Bluetooth.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="font-bold text-white block mb-1">Método B: Webhook de Pasarelas (Mercado Pago, Stripe, Wompi)</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  En el panel de tu pasarela de pagos, pega tu URL Webhook en la sección de Webhooks / Notificaciones IPN.
                </p>
              </div>
            </div>
          </div>

          {/* Webhook URL Box */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-sky-500/30 space-y-2">
            <label className="text-xs font-bold text-sky-300 flex items-center justify-between">
              <span>Tu URL de Webhook Personal:</span>
              {copied && <span className="text-emerald-400 text-[11px] font-semibold">¡Copiado al portapapeles!</span>}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={webhookUrl}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 select-all"
              />
              <button
                onClick={handleCopyWebhook}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white cursor-pointer transition shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copiar</span>
              </button>
            </div>
          </div>

          {/* Step 3: Battery & Background speech tip */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs">3</span>
              <BatteryCharging className="w-4 h-4 text-amber-400" />
              <span>Optimización de Batería en Android (Segundo Plano)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed pl-8">
              Para que Android no silencie la aplicación cuando la pantalla esté bloqueada:
              <br />
              Ve a <em>Ajustes de Android → Aplicaciones → Chrome/VozBanco → Batería</em> y selecciona <strong>«Sin restricciones»</strong>. Así el sintetizador podrá hablar libremente aunque tengas el teléfono en el bolsillo o conectado a un parlante Bluetooth.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white cursor-pointer active:scale-95"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
