import React from 'react';
import { Volume2, VolumeX, ShieldCheck, Sparkles, Mic, Play, ArrowRight, BellRing } from 'lucide-react';
import { VoiceSettings } from '../types/bank';

interface VoiceStatusHeroProps {
  voiceSettings: VoiceSettings;
  isSpeaking: boolean;
  currentSpokenText?: string;
  onToggleVoice: () => void;
  onUnlockAudio: () => void;
  audioUnlocked: boolean;
  onOpenSimulator: () => void;
  onOpenAndroidGuide: () => void;
}

export const VoiceStatusHero: React.FC<VoiceStatusHeroProps> = ({
  voiceSettings,
  isSpeaking,
  currentSpokenText,
  onToggleVoice,
  onUnlockAudio,
  audioUnlocked,
  onOpenSimulator,
  onOpenAndroidGuide
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#131d36] to-[#0c1324] border border-sky-500/20 p-5 sm:p-7 shadow-2xl">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Section: Status & Voice Visualization */}
        <div className="space-y-4 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30">
              <span className={`w-2 h-2 rounded-full ${voiceSettings.enabled ? 'bg-sky-400 animate-ping' : 'bg-slate-500'}`} />
              {voiceSettings.enabled ? 'Anunciador de Voz ACTIVO' : 'Anunciador en Pausa'}
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Lectura de Notificaciones y Montos
            </span>

            {!audioUnlocked && (
              <button
                onClick={onUnlockAudio}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 cursor-pointer animate-pulse"
              >
                <BellRing className="w-3.5 h-3.5" />
                Pulsa aquí para autorizar audio en Android
              </button>
            )}
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {voiceSettings.enabled ? (
                <>
                  Tu teléfono te <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">habla en voz alta</span> con cada transferencia
                </>
              ) : (
                <span className="text-slate-300">Anunciador de voz desactivado</span>
              )}
            </h2>
            <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
              No tienes que revisar la pantalla mientras trabajas o atiendes a tus clientes. Cuando entra una transacción de Nequi, Bancolombia, BBVA o DaviPlata, VozBanco pronuncia el monto exacto y el remitente al instante.
            </p>
          </div>

          {/* Real-time Spoken Text Banner */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80">
            {/* Animated equalizer waves */}
            <div className="flex items-center gap-1 h-7 px-1">
              <span className={`w-1 rounded-full bg-sky-400 ${isSpeaking ? 'animate-wave-1' : 'h-1.5'}`} />
              <span className={`w-1 rounded-full bg-indigo-400 ${isSpeaking ? 'animate-wave-2' : 'h-3'}`} />
              <span className={`w-1 rounded-full bg-emerald-400 ${isSpeaking ? 'animate-wave-3' : 'h-2'}`} />
              <span className={`w-1 rounded-full bg-sky-400 ${isSpeaking ? 'animate-wave-4' : 'h-4'}`} />
              <span className={`w-1 rounded-full bg-indigo-400 ${isSpeaking ? 'animate-wave-5' : 'h-2'}`} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[11px] uppercase tracking-wider font-bold text-sky-400">
                {isSpeaking ? 'Hablando ahora mismo...' : 'Última frase anunciada:'}
              </p>
              <p className="text-xs sm:text-sm font-medium text-slate-100 truncate italic">
                {currentSpokenText || '«¡Pago recibido! 50.000 pesos de Camila Rodriguez en Nequi»'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Section: Interactive Action Cards */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[240px]">
          {/* Quick Simulate Trigger */}
          <button
            onClick={onOpenSimulator}
            className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-sky-600/25 transition-all transform hover:-translate-y-0.5 active:scale-98 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Play className="w-5 h-5 text-white fill-white" />
              </div>
              <div className="text-left">
                <div className="font-bold">Simular Pago Entrante</div>
                <div className="text-xs font-normal text-sky-100">Escuchar voz de inmediato</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-sky-200" />
          </button>

          {/* Toggle Voice Power */}
          <button
            onClick={onToggleVoice}
            className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
              voiceSettings.enabled
                ? 'bg-slate-900/90 border-slate-700/80 hover:border-slate-600 text-slate-200'
                : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${voiceSettings.enabled ? 'bg-slate-800 text-slate-300' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {voiceSettings.enabled ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </div>
              <div className="text-left">
                <div className="font-semibold text-sm">
                  {voiceSettings.enabled ? 'Silenciar Anuncios' : 'Activar Anunciador'}
                </div>
                <div className="text-xs text-slate-400">
                  {voiceSettings.enabled ? 'Pausa temporal del audio' : 'Reanudar lectura en voz alta'}
                </div>
              </div>
            </div>
          </button>

          {/* Android Setup CTA */}
          <button
            onClick={onOpenAndroidGuide}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-xs text-slate-300 border border-slate-800 transition cursor-pointer justify-center"
          >
            <Mic className="w-3.5 h-3.5 text-sky-400" />
            <span>Configurar lectura de SMS y Banco en Android</span>
          </button>
        </div>
      </div>
    </div>
  );
};
