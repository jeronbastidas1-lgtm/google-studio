import React, { useState } from 'react';
import { Play, Sparkles, Zap, FileText, Send, Clock, RefreshCw } from 'lucide-react';
import { CurrencyCode } from '../types/bank';
import { parseBankNotificationText } from '../utils/transactionParser';

interface TransactionSimulatorProps {
  onSimulate: (data: {
    amount: number;
    currency: CurrencyCode;
    bank: string;
    sender: string;
    concept: string;
    type?: 'income' | 'expense';
  }) => void;
  autoStreamActive: boolean;
  onToggleAutoStream: () => void;
}

const PRESETS = [
  { bank: 'Nequi', amount: 50000, currency: 'COP' as CurrencyCode, sender: 'Andrés Camargo', concept: 'Venta de productos' },
  { bank: 'Bancolombia', amount: 150000, currency: 'COP' as CurrencyCode, sender: 'Lucía Fernández', concept: 'Transferencia por servicios' },
  { bank: 'DaviPlata', amount: 35000, currency: 'COP' as CurrencyCode, sender: 'Jorge Valencia', concept: 'Pago cuenta almuerzo' },
  { bank: 'Mercado Pago', amount: 48.50, currency: 'USD' as CurrencyCode, sender: 'Tienda Online S.A.', concept: 'Cobro de pedido #402' },
  { bank: 'BBVA', amount: 95000, currency: 'COP' as CurrencyCode, sender: 'Carolina Ospina', concept: 'Depósito a cuenta' }
];

export const TransactionSimulator: React.FC<TransactionSimulatorProps> = ({
  onSimulate,
  autoStreamActive,
  onToggleAutoStream
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'custom' | 'sms'>('quick');

  // Custom Form state
  const [customBank, setCustomBank] = useState('Nequi');
  const [customAmount, setCustomAmount] = useState('75000');
  const [customCurrency, setCustomCurrency] = useState<CurrencyCode>('COP');
  const [customSender, setCustomSender] = useState('Juan David Mendoza');
  const [customConcept, setCustomConcept] = useState('Pago de pedido');

  // SMS Parser state
  const [rawSms, setRawSms] = useState(
    '¡Te acaban de enviar $50.000! Maria Gomez te envio plata desde Nequi. Saldo disponible: $340.000'
  );

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(customAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    onSimulate({
      amount: parsedAmount,
      currency: customCurrency,
      bank: customBank,
      sender: customSender || 'Cliente Anónimo',
      concept: customConcept || 'Transferencia',
      type: 'income'
    });
  };

  const handleSmsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawSms.trim()) return;

    const parsed = parseBankNotificationText(rawSms);
    onSimulate({
      amount: parsed.amount || 50000,
      currency: parsed.currency,
      bank: parsed.bank,
      sender: parsed.sender,
      concept: parsed.concept,
      type: parsed.type
    });
  };

  return (
    <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 sm:p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">
              Simulador y Probador de Voz
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Dispara transacciones de prueba para escuchar cómo habla la app en tu teléfono o altavoz
          </p>
        </div>

        {/* Auto Stream Toggle for continuous hands-free testing */}
        <button
          onClick={onToggleAutoStream}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 ${
            autoStreamActive
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
          }`}
          title="Simula transacciones aleatorias continuas para tiendas en vivo"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>
            {autoStreamActive ? 'Modo Tienda: ACTIVO (cada 15s)' : 'Activar Modo Tienda Automático'}
          </span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mt-4 border-b border-slate-800/80 pb-3">
        <button
          onClick={() => setActiveTab('quick')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === 'quick'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Botones Rápidos (1-Clic)
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === 'custom'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Personalizado
        </button>
        <button
          onClick={() => setActiveTab('sms')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === 'sms'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Pegar Texto / SMS de Banco
        </button>
      </div>

      {/* Tab 1: Quick 1-click presets */}
      {activeTab === 'quick' && (
        <div className="mt-4 space-y-3">
          <p className="text-xs text-slate-400">
            Haz clic en cualquiera de estos pagos para que VozBanco suene el timbre y anuncie la transferencia en voz alta:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => onSimulate(preset)}
                className="group flex items-center justify-between p-3 rounded-xl bg-slate-950/60 hover:bg-sky-950/40 border border-slate-800 hover:border-sky-500/40 transition-all text-left cursor-pointer active:scale-98"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white group-hover:text-sky-300 transition">
                      ${preset.amount.toLocaleString()} {preset.currency}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                      {preset.bank}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[180px]">
                    De: {preset.sender}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 group-hover:bg-sky-500/20 flex items-center justify-center text-sky-400">
                  <Play className="w-3.5 h-3.5 fill-current" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Custom details form */}
      {activeTab === 'custom' && (
        <form onSubmit={handleCustomSubmit} className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Banco o Billetera
            </label>
            <select
              value={customBank}
              onChange={(e) => setCustomBank(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500"
            >
              <option value="Nequi">Nequi</option>
              <option value="Bancolombia">Bancolombia</option>
              <option value="DaviPlata">DaviPlata</option>
              <option value="BBVA">BBVA</option>
              <option value="Mercado Pago">Mercado Pago</option>
              <option value="Santander">Santander</option>
              <option value="Nu">Nu (Nubank)</option>
              <option value="Zelle">Zelle</option>
              <option value="SPEI México">SPEI México</option>
              <option value="Bizum">Bizum</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Monto y Moneda
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="any"
                min="1"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white font-mono focus:outline-none focus:border-sky-500"
                placeholder="50000"
              />
              <select
                value={customCurrency}
                onChange={(e) => setCustomCurrency(e.target.value as CurrencyCode)}
                className="px-2 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 focus:outline-none focus:border-sky-500"
              >
                <option value="COP">COP</option>
                <option value="USD">USD</option>
                <option value="MXN">MXN</option>
                <option value="EUR">EUR</option>
                <option value="ARS">ARS</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Nombre de quien envía
            </label>
            <input
              type="text"
              value={customSender}
              onChange={(e) => setCustomSender(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500"
              placeholder="Ej. Juan Pérez"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Concepto / Nota
            </label>
            <input
              type="text"
              value={customConcept}
              onChange={(e) => setCustomConcept(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500"
              placeholder="Ej. Compra de zapatos"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-4 mt-2">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span>Disparar y Hablar en Voz Alta</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Paste Bank SMS text */}
      {activeTab === 'sms' && (
        <form onSubmit={handleSmsSubmit} className="mt-4 space-y-3">
          <p className="text-xs text-slate-400">
            Pega aquí el mensaje de texto o notificación real que te envía tu banco para probar cómo el motor inteligente extrae el monto, el remitente y lo dice en voz alta:
          </p>

          <div className="flex flex-wrap gap-2 mb-2">
            <button
              type="button"
              onClick={() => setRawSms('¡Te acaban de enviar $80.000! Maria Gomez te envio plata desde Nequi.')}
              className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            >
              Ejemplo Nequi
            </button>
            <button
              type="button"
              onClick={() => setRawSms('Bancolombia le informa Transferencia por $250.000 desde cta *4521 de CARLOS PEREZ')}
              className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            >
              Ejemplo Bancolombia
            </button>
            <button
              type="button"
              onClick={() => setRawSms('DaviPlata: Pasaron $45.000 a su DaviPlata desde otro banco de ANDRES RUIZ')}
              className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            >
              Ejemplo DaviPlata
            </button>
            <button
              type="button"
              onClick={() => setRawSms('BBVA: Abono a tu cuenta por $110.000 de PEDRO SANCHEZ. Ref: 489201')}
              className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            >
              Ejemplo BBVA
            </button>
          </div>

          <textarea
            value={rawSms}
            onChange={(e) => setRawSms(e.target.value)}
            rows={3}
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 font-mono focus:outline-none focus:border-sky-500"
            placeholder="Pega el texto de la notificación bancaria..."
          />

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <FileText className="w-4 h-4" />
            <span>Analizar y Pronunciar Notificación</span>
          </button>
        </form>
      )}
    </div>
  );
};
