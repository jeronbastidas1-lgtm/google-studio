import React, { useEffect, useState } from 'react';
import { X, Volume2, Sparkles, Sliders, Bell, Play, Check } from 'lucide-react';
import { ChimeSound, VoiceSettings } from '../types/bank';
import { voiceManager } from '../utils/speechSynthesis';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: VoiceSettings;
  onSave: (newSettings: VoiceSettings) => void;
  onPreview: (sampleText: string, tempSettings: VoiceSettings) => void;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
  onPreview
}) => {
  const [tempSettings, setTempSettings] = useState<VoiceSettings>(settings);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    setTempSettings(settings);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const voices = voiceManager.getVoices();
      setAvailableVoices(voices);
    }
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const spanishVoices = availableVoices.filter((v) => v.lang.toLowerCase().startsWith('es'));
  const displayVoices = spanishVoices.length > 0 ? spanishVoices : availableVoices;

  const insertVariable = (variable: string) => {
    setTempSettings((prev) => ({
      ...prev,
      spokenTemplate: `${prev.spokenTemplate} ${variable}`
    }));
  };

  const handleTestPreview = () => {
    onPreview('¡Pago recibido! Cincuenta mil pesos de Juan Pérez en Nequi.', tempSettings);
  };

  const handleSaveAndClose = () => {
    onSave(tempSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-5 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                Ajustes del Anunciador de Voz
              </h3>
              <p className="text-xs text-slate-400">
                Personaliza la voz, entonación, timbre y frases de tus transferencias
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Voice selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Voz del Sistema (Español recomendado)
            </label>
            <select
              value={tempSettings.voiceUri}
              onChange={(e) => setTempSettings({ ...tempSettings, voiceUri: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="">-- Voz por defecto del sistema Android/Navegador --</option>
              {displayVoices.map((voice) => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} ({voice.lang}) {voice.default ? '★ Predeterminada' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Chime Sound Effect */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-sky-400" />
              Sonido de Timbre previo a la voz
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'cash_register', label: 'Caja Registradora (Ka-ching!)' },
                { id: 'modern_bell', label: 'Campana Moderna' },
                { id: 'chime_bright', label: 'Carillón Brillante' },
                { id: 'subtle_ping', label: 'Ping Sutil' },
                { id: 'none', label: 'Sin timbre (Solo voz)' }
              ].map((chime) => (
                <button
                  type="button"
                  key={chime.id}
                  onClick={() => setTempSettings({ ...tempSettings, chimeType: chime.id as ChimeSound })}
                  className={`p-2.5 rounded-xl text-xs font-medium border text-left cursor-pointer transition ${
                    tempSettings.chimeType === chime.id
                      ? 'bg-sky-500/20 border-sky-500 text-sky-200 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {chime.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders: Rate, Pitch, Volume */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            {/* Speed / Rate */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                <span>Velocidad de habla</span>
                <span className="font-mono text-sky-400">{tempSettings.rate.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.5"
                step="0.1"
                value={tempSettings.rate}
                onChange={(e) => setTempSettings({ ...tempSettings, rate: parseFloat(e.target.value) })}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>Pausado</span>
                <span>Rápido</span>
              </div>
            </div>

            {/* Pitch */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                <span>Tono / Tonalidad</span>
                <span className="font-mono text-sky-400">{tempSettings.pitch.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.4"
                step="0.1"
                value={tempSettings.pitch}
                onChange={(e) => setTempSettings({ ...tempSettings, pitch: parseFloat(e.target.value) })}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>Grave</span>
                <span>Agudo</span>
              </div>
            </div>

            {/* Volume */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                <span>Volumen</span>
                <span className="font-mono text-sky-400">{Math.round(tempSettings.volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1"
                step="0.05"
                value={tempSettings.volume}
                onChange={(e) => setTempSettings({ ...tempSettings, volume: parseFloat(e.target.value) })}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>20%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Spoken Template Editor */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Plantilla de la Frase Pronunciada
            </label>
            <textarea
              value={tempSettings.spokenTemplate}
              onChange={(e) => setTempSettings({ ...tempSettings, spokenTemplate: e.target.value })}
              rows={2}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 font-mono focus:outline-none focus:border-sky-500"
              placeholder="¡Atención! Recibiste {monto} de {remitente} en {banco}."
            />
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11px] text-slate-400 mr-1">Insertar variable:</span>
              <button
                type="button"
                onClick={() => insertVariable('{monto}')}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-mono cursor-pointer"
              >
                + {'{monto}'}
              </button>
              <button
                type="button"
                onClick={() => insertVariable('{remitente}')}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-mono cursor-pointer"
              >
                + {'{remitente}'}
              </button>
              <button
                type="button"
                onClick={() => insertVariable('{banco}')}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-mono cursor-pointer"
              >
                + {'{banco}'}
              </button>
              <button
                type="button"
                onClick={() => insertVariable('{concepto}')}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-mono cursor-pointer"
              >
                + {'{concepto}'}
              </button>
            </div>
          </div>

          {/* Toggle options */}
          <div className="space-y-2 pt-2">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer">
              <input
                type="checkbox"
                checked={tempSettings.naturalSpanishNumbers}
                onChange={(e) => setTempSettings({ ...tempSettings, naturalSpanishNumbers: e.target.checked })}
                className="w-4 h-4 accent-sky-500 rounded"
              />
              <div>
                <span className="text-xs font-bold text-white block">
                  Pronunciar cifras en palabras completas (Recomendado)
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Ejemplo: dice «cincuenta mil pesos» en vez de dígitos mecánicos.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer">
              <input
                type="checkbox"
                checked={tempSettings.vibrationEnabled}
                onChange={(e) => setTempSettings({ ...tempSettings, vibrationEnabled: e.target.checked })}
                className="w-4 h-4 accent-sky-500 rounded"
              />
              <div>
                <span className="text-xs font-bold text-white block">
                  Vibración háptica en Android
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Vibra dos veces cuando se registra un pago.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Footer with Preview & Save */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={handleTestPreview}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 cursor-pointer active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Escuchar Prueba con Estos Ajustes</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveAndClose}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-lg shadow-sky-500/25 cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
