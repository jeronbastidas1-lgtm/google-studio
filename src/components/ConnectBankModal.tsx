import React, { useState } from 'react';
import { X, Building2, Plus, Smartphone, CreditCard } from 'lucide-react';
import { BankAccount, CurrencyCode } from '../types/bank';

interface ConnectBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBank: (bank: BankAccount) => void;
}

const POPULAR_BANKS = [
  { name: 'Nequi', icon: 'Smartphone', currency: 'COP' as CurrencyCode, type: 'digital_wallet' as const, color: '#8b5cf6' },
  { name: 'Bancolombia', icon: 'Building2', currency: 'COP' as CurrencyCode, type: 'savings' as const, color: '#eab308' },
  { name: 'DaviPlata', icon: 'Smartphone', currency: 'COP' as CurrencyCode, type: 'digital_wallet' as const, color: '#ef4444' },
  { name: 'BBVA', icon: 'CreditCard', currency: 'COP' as CurrencyCode, type: 'checking' as const, color: '#0284c7' },
  { name: 'Mercado Pago', icon: 'Smartphone', currency: 'USD' as CurrencyCode, type: 'digital_wallet' as const, color: '#0ea5e9' },
  { name: 'Nu (Nubank)', icon: 'CreditCard', currency: 'COP' as CurrencyCode, type: 'savings' as const, color: '#9333ea' },
  { name: 'Santander', icon: 'Building2', currency: 'MXN' as CurrencyCode, type: 'checking' as const, color: '#dc2626' },
  { name: 'Zelle (EE.UU.)', icon: 'Smartphone', currency: 'USD' as CurrencyCode, type: 'digital_wallet' as const, color: '#7c3aed' },
  { name: 'Bizum (España)', icon: 'Smartphone', currency: 'EUR' as CurrencyCode, type: 'digital_wallet' as const, color: '#059669' }
];

export const ConnectBankModal: React.FC<ConnectBankModalProps> = ({
  isOpen,
  onClose,
  onAddBank
}) => {
  const [selectedPreset, setSelectedPreset] = useState(POPULAR_BANKS[0]);
  const [accountName, setAccountName] = useState(POPULAR_BANKS[0].name);
  const [accountNumber, setAccountNumber] = useState('••• 3481');
  const [initialBalance, setInitialBalance] = useState('500000');
  const [syncMethod, setSyncMethod] = useState<BankAccount['syncMethod']>('sms_listener');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAccount: BankAccount = {
      id: `bank_${Date.now()}`,
      name: accountName || selectedPreset.name,
      bank: selectedPreset.name,
      accountType: selectedPreset.type,
      accountNumber: accountNumber || '••• 0000',
      balance: parseFloat(initialBalance) || 0,
      currency: selectedPreset.currency,
      color: selectedPreset.color,
      connected: true,
      lastSync: new Date().toISOString(),
      syncMethod,
      icon: selectedPreset.icon
    };

    onAddBank(newAccount);
    onClose();
  };

  const handleSelectBank = (bank: typeof POPULAR_BANKS[0]) => {
    setSelectedPreset(bank);
    setAccountName(`${bank.name} Personal`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0f172a] border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-5 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Vincular Nueva Cuenta</h3>
              <p className="text-xs text-slate-400">Configura una cuenta para escuchar sus alertas de voz</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Selecciona Banco o Billetera
            </label>
            <div className="grid grid-cols-3 gap-2">
              {POPULAR_BANKS.map((b) => (
                <button
                  type="button"
                  key={b.name}
                  onClick={() => handleSelectBank(b)}
                  className={`p-2.5 rounded-xl text-xs font-semibold border text-center transition cursor-pointer ${
                    selectedPreset.name === b.name
                      ? 'bg-sky-500/20 border-sky-500 text-sky-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Nombre de la Cuenta
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500"
              placeholder="Ej. Mi Nequi Negocio"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Últimos Dígitos o Celular
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white font-mono focus:outline-none focus:border-sky-500"
                placeholder="••• 1234"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Saldo Inicial
              </label>
              <input
                type="number"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white font-mono focus:outline-none focus:border-sky-500"
                placeholder="500000"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Método de Detección en Android
            </label>
            <select
              value={syncMethod}
              onChange={(e) => setSyncMethod(e.target.value as BankAccount['syncMethod'])}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="sms_listener">Lector de SMS y Notificaciones Android (Recomendado)</option>
              <option value="webhook">Webhook API / Pasarela en Vivo</option>
              <option value="open_banking">Open Banking / Conexión Bancaria</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white cursor-pointer active:scale-95 shadow-md shadow-sky-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Activar para Voz</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
