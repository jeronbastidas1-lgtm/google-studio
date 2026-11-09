import React from 'react';
import { X, Smartphone, Download, CheckCircle2, ShieldCheck, Zap, Share2, Sparkles, Layers } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  pwaState: ReturnType<typeof usePWAInstall>;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  pwaState
}) => {
  if (!isOpen) return null;

  const { isInstallable, isInstalled, isIOS, isAndroid, install } = pwaState;

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0e1628] border border-sky-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 cursor-pointer transition"
          aria-label="Cerrar modal de instalación"
        >
          <X className="w-5 h-5" />
        </button>

        {/* App Badge Header */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-emerald-400 p-0.5 shadow-xl shadow-sky-500/25 shrink-0">
            <img
              src="/pwa-192x192.png"
              alt="VozBanco"
              className="w-full h-full object-cover rounded-[14px]"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg text-white">VozBanco</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PWA Oficial
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Notificador Parlante para Android y Móvil
            </p>
          </div>
        </div>

        {/* Already Installed State */}
        {isInstalled ? (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>¡La aplicación ya está instalada en tu dispositivo!</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ya estás disfrutando de VozBanco en pantalla completa con soporte de audio continuo y sin barra de navegación.
            </p>
          </div>
        ) : (
          <>
            {/* Install Flow: Direct Prompt Available */}
            {isInstallable ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>Instalación instantánea con 1 clic</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Tu navegador soporta instalación directa. Al pulsar el botón a continuación, se agregará el ícono oficial a tu pantalla de inicio y funcionará como una app nativa de Android sin ocupar espacio (&lt; 2 MB).
                  </p>
                </div>

                <button
                  onClick={handleInstallClick}
                  className="w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm sm:text-base bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition"
                >
                  <Download className="w-5 h-5" />
                  <span>Instalar VozBanco en mi Android</span>
                </button>
              </div>
            ) : isIOS ? (
              /* iOS Safari flow */
              <div className="space-y-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <Share2 className="w-4 h-4" />
                  <span>Cómo instalar en iPhone o iPad (Safari)</span>
                </div>
                <ol className="text-xs text-slate-300 space-y-2 pl-4 list-decimal leading-relaxed">
                  <li>
                    Presiona el botón <strong>Compartir</strong> (icono de cuadrado con flecha hacia arriba) en la barra de Safari.
                  </li>
                  <li>
                    Baja en las opciones y selecciona <strong>«Agregar al inicio»</strong> o <strong>«Add to Home Screen»</strong>.
                  </li>
                  <li>
                    Toca <strong>«Agregar»</strong> en la esquina superior derecha.
                  </li>
                </ol>
              </div>
            ) : (
              /* Android Chrome Standard Manual Flow */
              <div className="space-y-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                  <Smartphone className="w-4 h-4" />
                  <span>Solución para tu pantalla de Android</span>
                </div>
                <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200">
                    <strong className="block text-white mb-1">
                      👉 Paso directo (Recomendado):
                    </strong>
                    En el menú que te apareció, pulsa en la segunda opción:
                    <div className="mt-1 font-bold text-white bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800 inline-block">
                      «Crear acceso directo»
                    </div>
                    <p className="mt-1 text-[11px] text-slate-300">
                      Esto colocará de inmediato el ícono de <strong>VozBanco</strong> en tu pantalla de inicio de Android. Al abrirlo, se ejecutará en pantalla completa con soporte de voz.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-400 text-[11px]">
                    <strong className="text-slate-300 block mb-0.5">
                      ¿Por qué dice «No se puede instalar esta app»?
                    </strong>
                    Ocurre en algunos teléfonos Android (como Xiaomi, Realme o Samsung) cuando Chrome no tiene permiso del sistema para crear paquetes WebAPK en segundo plano. Tocar <em>«Crear acceso directo»</em> soluciona esto al 100%.
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Benefits List */}
        <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 text-slate-300 border border-slate-800/80">
            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Apertura ultrarrápida</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 text-slate-300 border border-slate-800/80">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Segura y sin anuncios</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 text-slate-300 border border-slate-800/80">
            <Smartphone className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>Pantalla completa</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 text-slate-300 border border-slate-800/80">
            <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>Pesa menos de 2 MB</span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
