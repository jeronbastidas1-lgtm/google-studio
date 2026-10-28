import React from 'react';
import { ArrowDownLeft, TrendingUp, CreditCard, Activity } from 'lucide-react';
import { Transaction } from '../types/bank';
import { formatCurrencyDisplay } from '../utils/speechFormatter';

interface StatSummaryProps {
  transactions: Transaction[];
  activeBanksCount: number;
}

export const StatSummary: React.FC<StatSummaryProps> = ({ transactions, activeBanksCount }) => {
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const totalIncome = incomeTransactions.reduce((acc, t) => acc + t.amount, 0);
  const avgIncome = incomeTransactions.length > 0 ? totalIncome / incomeTransactions.length : 0;
  const lastTx = transactions[0];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Total Recibido */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Recibido
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 font-mono font-bold text-xl sm:text-2xl text-emerald-400 truncate">
          {formatCurrencyDisplay(totalIncome, 'COP')}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          {incomeTransactions.length} pagos procesados hoy
        </p>
      </div>

      {/* Promedio por Transacción */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Ticket Promedio
          </span>
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 font-mono font-bold text-xl sm:text-2xl text-sky-300 truncate">
          {formatCurrencyDisplay(avgIncome, 'COP')}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Por venta o transferencia
        </p>
      </div>

      {/* Bancos Conectados */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Cuentas Activas
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <CreditCard className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 font-mono font-bold text-xl sm:text-2xl text-indigo-300">
          {activeBanksCount} Cuentas
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Escuchando alertas por voz
        </p>
      </div>

      {/* Última Transacción */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Último Movimiento
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 font-mono font-bold text-lg sm:text-xl text-white truncate">
          {lastTx ? `${lastTx.sender}` : 'Sin movimientos'}
        </div>
        <p className="text-[11px] text-slate-400 mt-1 truncate">
          {lastTx ? `${lastTx.bank} • ${formatCurrencyDisplay(lastTx.amount, lastTx.currency)}` : 'Esperando primera alerta'}
        </p>
      </div>
    </div>
  );
};
