import React, { useState } from 'react';
import { Volume2, Search, Filter, CheckCircle2, ArrowDownLeft, Clock, Info } from 'lucide-react';
import { Transaction } from '../types/bank';
import { formatCurrencyDisplay } from '../utils/speechFormatter';

interface TransactionListProps {
  transactions: Transaction[];
  onReplayVoice: (transaction: Transaction) => void;
  isSpeaking: boolean;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onReplayVoice,
  isSpeaking
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBank, setSelectedBank] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedTxDetail, setSelectedTxDetail] = useState<Transaction | null>(null);

  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.concept.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.bank.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.amount.toString().includes(searchTerm);

    const matchesBank = selectedBank === 'all' || t.bank.toLowerCase() === selectedBank.toLowerCase();
    const matchesType = selectedType === 'all' || t.type === selectedType;

    return matchesSearch && matchesBank && matchesType;
  });

  const uniqueBanks = Array.from(new Set(transactions.map((t) => t.bank)));

  return (
    <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            Historial de Transacciones Anunciadas
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold font-mono">
              {filtered.length}
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Registro de pagos entrantes con botón para volver a escuchar el audio
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar remitente, banco o monto..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Bank selector */}
          <select
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="all">Todos los Bancos</option>
            {uniqueBanks.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transaction Feed */}
      <div className="divide-y divide-slate-800/80">
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/60 flex items-center justify-center mx-auto text-slate-400 mb-3">
              <Filter className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-300">No se encontraron transacciones</p>
            <p className="text-xs text-slate-500 mt-1">
              Prueba cambiando los filtros o usa el simulador para generar un pago de prueba.
            </p>
          </div>
        ) : (
          filtered.map((tx) => (
            <div
              key={tx.id}
              className="py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 px-2 rounded-2xl transition"
            >
              {/* Left Details */}
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    tx.type === 'income'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  <ArrowDownLeft className="w-5 h-5" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-white truncate">
                      {tx.sender}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-sky-300 border border-slate-700">
                      {tx.bank}
                    </span>
                    {tx.accountNumber && (
                      <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                        {tx.accountNumber}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    {tx.concept}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400/90 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      Anunciado por voz
                    </span>
                    {tx.rawMemo && (
                      <button
                        onClick={() => setSelectedTxDetail(tx)}
                        className="text-slate-400 hover:text-sky-300 underline cursor-pointer"
                      >
                        Ver memo SMS
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Amount & Replay Audio Button */}
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-800/60">
                <div className="text-left sm:text-right">
                  <div className="font-mono font-bold text-lg sm:text-xl text-emerald-400">
                    +{formatCurrencyDisplay(tx.amount, tx.currency)}
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 block">
                    {tx.currency} • Pago recibido
                  </span>
                </div>

                {/* Speaker Replay Button */}
                <button
                  onClick={() => onReplayVoice(tx)}
                  aria-label={`Volver a escuchar anuncio de ${tx.sender}`}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-sky-950/70 hover:bg-sky-900/90 text-sky-200 border border-sky-800/60 transition active:scale-95 cursor-pointer shadow-sm"
                  title="Volver a escuchar la locución de esta transacción"
                >
                  <Volume2 className="w-4 h-4 text-sky-400" />
                  <span className="hidden sm:inline">Escuchar</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Raw SMS modal inspector */}
      {selectedTxDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Info className="w-4 h-4 text-sky-400" />
                Mensaje Original del Banco
              </h4>
              <button
                onClick={() => setSelectedTxDetail(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap break-words">
              {selectedTxDetail.rawMemo || 'No hay texto crudo disponible para este evento.'}
            </div>
            <p className="text-[11px] text-slate-400">
              VozBanco procesó este texto y extrajo el monto de{' '}
              <strong className="text-emerald-400">
                {formatCurrencyDisplay(selectedTxDetail.amount, selectedTxDetail.currency)}
              </strong>{' '}
              de <strong className="text-white">{selectedTxDetail.sender}</strong>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
