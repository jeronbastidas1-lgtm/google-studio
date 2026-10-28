import React from 'react';
import { Volume2, VolumeX, Smartphone, Settings, Sparkles, HelpCircle, Radio, Wifi } from 'lucide-react';
import { VoiceSettings } from '../types/bank';

interface NavbarProps {
  voiceSettings: VoiceSettings;
  onToggleVoice: () => void;
  onOpenSettings: () => void;
  onOpenAndroidGuide: () => void;
  onOpenWebhook: () => void;
  onTestVoice: () => void;
  isSpeaking: boolean;
  sseConnected: boolean;
  canInstallPwa: boolean;
  onInstallPwa: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  voiceSettings,
  onToggleVoice,
  onOpenSettings,
  onOpenAndroidGuide,
  onOpenWebhook,
  onTestVoice,
  isSpeaking,
  sseConnected,
  canInstallPwa,
  onInstallPwa
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0a101f]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-sky-500/20">
            <div className="w-full h-full bg-[#0b1329] rounded-[14px] flex items-center justify-center">
              <Volume2 className={`w-6 h-6 text-sky-400 ${isSpeaking ? 'animate-bounce' : ''}`} />
            </div>
            {voiceSettings.enabled && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#0a101f]"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                VozBanco
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Android & Web
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Notificador de voz en tiempo real para transacciones bancarias
            </p>
          </div>
        </div>

        {/* Live SSE Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs">
          <span className={`inline-block w-2 h-2 rounded-full ${sseConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400'}`} />
          <span className="text-slate-300 font-medium">
            {sseConnected ? 'Canal en vivo conectado' : 'Conectando canal...'}
          </span>
          <Wifi className="w-3.5 h-3.5 text-slate-400 ml-1" />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Test Voice Quick Button */}
          <button
            onClick={onTestVoice}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-200 border border-indigo-700/50 transition-all active:scale-95 cursor-pointer"
            title="Probar sintetizador de voz"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Probar Voz</span>
          </button>

          {/* Voice Mute / Unmute Toggle */}
          <button
            onClick={onToggleVoice}
            aria-label={voiceSettings.enabled ? 'Silenciar voz' : 'Activar voz'}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
              voiceSettings.enabled
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/25'
                : 'bg-rose-500/15 text-rose-300 border border-rose-500/40 hover:bg-rose-500/25'
            }`}
          >
            {voiceSettings.enabled ? (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Voz Activa</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-rose-400" />
                <span className="hidden sm:inline">Silenciado</span>
              </>
            )}
          </button>

          {/* Android PWA Install or Guide */}
          {canInstallPwa ? (
            <button
              onClick={onInstallPwa}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>Instalar en Android</span>
            </button>
          ) : (
            <button
              onClick={onOpenAndroidGuide}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95 cursor-pointer"
              title="Guía para Android"
            >
              <Smartphone className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline">Guía Android</span>
            </button>
          )}

          {/* Webhook Button */}
          <button
            onClick={onOpenWebhook}
            className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95 cursor-pointer"
            title="Ver Webhook para bancos y apps"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>Webhook</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition active:scale-95 cursor-pointer"
            title="Ajustes de voz y pronunciación"
            aria-label="Ajustes de voz"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
