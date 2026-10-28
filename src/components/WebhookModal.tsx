import React, { useState } from 'react';
import { X, Radio, Copy, Check, Terminal, Play, CheckCircle2 } from 'lucide-react';

interface WebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  webhookUrl: string;
  onSendTestWebhook: (payload: Record<string, unknown>) => void;
}

export const WebhookModal: React.FC<WebhookModalProps> = ({
  isOpen,
  onClose,
  webhookUrl,
  onSendTestWebhook
}) => {
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  if (!isOpen) return null;

  const sampleJson = {
    amount: 65000,
    currency: 'COP',
    bank: 'Nequi',
    sender: 'Mateo Restrepo',
    concept: 'Transferencia por Webhook'
  };

  const curlCommand = `curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(sampleJson)}'`;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2500);
  };

  const handleRunTest = () => {
    onSendTestWebhook(sampleJson);
    setTestSuccess(true);
    setTimeout(() => setTestSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-400">
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">
                Endpoint Webhook en Tiempo Real
              </h3>
              <p className="text-xs text-slate-400">
                Envía cualquier transacción desde servidores, bots o apps de Android
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

        {/* URL Box */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            URL del Webhook (POST)
          </label>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-sky-300 break-all select-all">
            {webhookUrl}
          </div>
        </div>

        {/* Sample cURL */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              Comando cURL de Ejemplo
            </label>
            <button
              onClick={handleCopyCurl}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
            >
              {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCurl ? '¡Copiado!' : 'Copiar comando'}</span>
            </button>
          </div>
          <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
            {curlCommand}
          </pre>
        </div>

        {/* Test Trigger Button */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-bold text-sm text-white block">
              Prueba este Webhook ahora mismo
            </span>
            <span className="text-xs text-slate-400 block">
              Envía la carga útil de prueba al servidor y escucha la locución en vivo.
            </span>
          </div>

          <button
            onClick={handleRunTest}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
          >
            {testSuccess ? <CheckCircle2 className="w-4 h-4 text-slate-950" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{testSuccess ? '¡Enviado y Anunciado!' : 'Ejecutar Prueba de Webhook'}</span>
          </button>
        </div>

        {/* Supported Formats */}
        <div className="text-xs text-slate-400 space-y-1">
          <p className="font-semibold text-slate-300">Formatos aceptados por el Webhook:</p>
          <ul className="list-disc list-inside space-y-0.5 text-slate-400 text-[11px]">
            <li>JSON Estructurado: <code className="text-sky-300 font-mono">{`{"amount": 50000, "sender": "Carlos", "bank": "Nequi"}`}</code></li>
            <li>Texto sin procesar de SMS: <code className="text-sky-300 font-mono">{`{"text": "Bancolombia le informa Transferencia por $120.000..."}`}</code></li>
          </ul>
        </div>

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
