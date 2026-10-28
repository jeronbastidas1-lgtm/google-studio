import React from 'react';
import { Smartphone, Building2, CreditCard, ShoppingBag, Plus, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { BankAccount } from '../types/bank';
import { formatCurrencyDisplay } from '../utils/speechFormatter';

interface BankAccountsGridProps {
  banks: BankAccount[];
  onToggleBank: (id: string) => void;
  onOpenConnectModal: () => void;
}

export const BankAccountsGrid: React.FC<BankAccountsGridProps> = ({
  banks,
  onToggleBank,
  onOpenConnectModal
}) => {
  const getBankIcon = (iconName: string) => {
    switch (iconName) {
      case 'Building2':
        return <Building2 className="w-5 h-5 text-amber-400" />;
      case 'CreditCard':
        return <CreditCard className="w-5 h-5 text-sky-400" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-5 h-5 text-cyan-400" />;
      case 'Smartphone':
      default:
        return <Smartphone className="w-5 h-5 text-purple-400" />;
    }
  };

  const getSyncBadge = (method: BankAccount['syncMethod']) => {
    switch (method) {
      case 'webhook':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            Webhook API
          </span>
        );
      case 'sms_listener':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
            Lector Notif/SMS Android
          </span>
        );
      case 'open_banking':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20">
            Open Banking
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            Cuentas y Billeteras Conectadas
            <span className="text-xs font-normal text-slate-400">({banks.filter(b => b.connected).length} activas para voz)</span>
          </h3>
          <p className="text-xs text-slate-400">
            El asistente anunciará transferencias recibidas en estas cuentas
          </p>
        </div>

        <button
          onClick={onOpenConnectModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition cursor-pointer active:scale-95 shadow-md shadow-sky-600/20"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Vincular Cuenta</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {banks.map((bank) => (
          <div
            key={bank.id}
            className={`p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden ${
              bank.connected
                ? 'bg-slate-900/80 border-slate-700/80 hover:border-slate-600 shadow-md'
                : 'bg-slate-950/40 border-slate-800/40 opacity-60'
            }`}
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center">
                  {getBankIcon(bank.icon)}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white truncate max-w-[120px]">
                    {bank.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {bank.accountNumber}
                  </p>
                </div>
              </div>

              {/* Toggle active switch */}
              <button
                onClick={() => onToggleBank(bank.id)}
                className={`p-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  bank.connected
                    ? 'text-emerald-400 hover:bg-emerald-500/10'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title={bank.connected ? 'Desactivar voz para esta cuenta' : 'Activar voz para esta cuenta'}
                aria-label={`Alternar estado de ${bank.name}`}
              >
                {bank.connected ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-slate-500" />
                )}
              </button>
            </div>

            {/* Balance */}
            <div className="mt-3">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Saldo Reportado
              </span>
              <span className="font-mono font-bold text-base text-slate-100">
                {formatCurrencyDisplay(bank.balance, bank.currency)}
              </span>
            </div>

            {/* Bottom Sync Info */}
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              {getSyncBadge(bank.syncMethod)}
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <RefreshCw className="w-2.5 h-2.5" />
                En vivo
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
