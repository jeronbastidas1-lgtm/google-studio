import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Wifi, WifiOff } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallBannerProps {
  onOpenInstallModal: () => void;
  pwaState: ReturnType<typeof usePWAInstall>;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  onOpenInstallModal,
  pwaState
}) => {
  const [dismissed, setDismissed] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (pwaState.isInstalled || dismissed) {
    // If offline, still show connectivity notice
    if (!isOnline) {
      return (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-300 flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span>Modo sin conexión: VozBanco sigue anunciando transacciones locales y cachés.</span>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="relative bg-gradient-to-r from-sky-950/90 via-indigo-950/90 to-emerald-950/90 border-b border-sky-500/30 px-4 py-3 sm:py-3.5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left Side Info */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-emerald-400 p-0.5 shadow-md shadow-sky-500/20 shrink-0">
            <img
              src="/pwa-192x192.png"
              alt="Logo VozBanco"
              className="w-full h-full object-cover rounded-[10px]"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs sm:text-sm text-white">
                ¿Usas Android? Instala la App en tu pantalla de inicio
              </span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                Instalable
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-300 truncate">
              Funciona a pantalla completa, con timbres y lectura por voz en segundo plano
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
          <button
            onClick={onOpenInstallModal}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-md shadow-emerald-500/25 active:scale-95 cursor-pointer transition"
          >
            <Download className="w-4 h-4" />
            <span>Instalar App</span>
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 cursor-pointer"
            title="Ocultar aviso"
            aria-label="Cerrar barra de instalación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
