/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BankAccount, CurrencyCode, Transaction, VoiceSettings } from './types/bank';
import { Navbar } from './components/Navbar';
import { VoiceStatusHero } from './components/VoiceStatusHero';
import { StatSummary } from './components/StatSummary';
import { BankAccountsGrid } from './components/BankAccountsGrid';
import { TransactionSimulator } from './components/TransactionSimulator';
import { TransactionList } from './components/TransactionList';
import { VoiceSettingsModal } from './components/VoiceSettingsModal';
import { AndroidSetupModal } from './components/AndroidSetupModal';
import { WebhookModal } from './components/WebhookModal';
import { ConnectBankModal } from './components/ConnectBankModal';
import { voiceManager } from './utils/speechSynthesis';
import { buildSpokenAnnouncement } from './utils/speechFormatter';
import { unlockAudio } from './utils/soundEffects';

const DEFAULT_SETTINGS: VoiceSettings = {
  enabled: true,
  voiceUri: '',
  lang: 'es-CO',
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  chimeEnabled: true,
  chimeType: 'cash_register',
  spokenTemplate: '¡Pago recibido! {monto} de {remitente} en tu cuenta de {banco}.',
  vibrationEnabled: true,
  saySender: true,
  sayBank: true,
  naturalSpanishNumbers: true
};

const DEFAULT_BANKS: BankAccount[] = [
  {
    id: 'bank_nequi',
    name: 'Nequi Personal',
    bank: 'Nequi',
    accountType: 'digital_wallet',
    accountNumber: '••• 314 9021',
    balance: 840000,
    currency: 'COP',
    color: '#8b5cf6',
    connected: true,
    lastSync: new Date().toISOString(),
    syncMethod: 'webhook',
    icon: 'Smartphone'
  },
  {
    id: 'bank_bancolombia',
    name: 'Bancolombia Ahorros',
    bank: 'Bancolombia',
    accountType: 'savings',
    accountNumber: '••• 4521',
    balance: 2450000,
    currency: 'COP',
    color: '#eab308',
    connected: true,
    lastSync: new Date().toISOString(),
    syncMethod: 'sms_listener',
    icon: 'Building2'
  },
  {
    id: 'bank_daviplata',
    name: 'DaviPlata Negocio',
    bank: 'DaviPlata',
    accountType: 'digital_wallet',
    accountNumber: '••• 8102',
    balance: 420000,
    currency: 'COP',
    color: '#ef4444',
    connected: true,
    lastSync: new Date().toISOString(),
    syncMethod: 'webhook',
    icon: 'Smartphone'
  },
  {
    id: 'bank_bbva',
    name: 'BBVA Nómina',
    bank: 'BBVA',
    accountType: 'checking',
    accountNumber: '••• 9934',
    balance: 1150000,
    currency: 'COP',
    color: '#0284c7',
    connected: false,
    lastSync: new Date().toISOString(),
    syncMethod: 'open_banking',
    icon: 'CreditCard'
  },
  {
    id: 'bank_mercadopago',
    name: 'Mercado Pago Cobros',
    bank: 'Mercado Pago',
    accountType: 'digital_wallet',
    accountNumber: '••• 5519',
    balance: 310.50,
    currency: 'USD',
    color: '#0ea5e9',
    connected: true,
    lastSync: new Date().toISOString(),
    syncMethod: 'webhook',
    icon: 'ShoppingBag'
  }
];

export default function App() {
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('vozbanco_settings');
        if (saved) return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [banks, setBanks] = useState<BankAccount[]>(DEFAULT_BANKS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpokenText, setCurrentSpokenText] = useState<string>('');
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [sseConnected, setSseConnected] = useState(false);
  const [autoStreamActive, setAutoStreamActive] = useState(false);

  // Modals
  const [showSettings, setShowSettings] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);
  const [showConnectBank, setShowConnectBank] = useState(false);

  // PWA install prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const simulatorRef = useRef<HTMLDivElement>(null);
  const autoStreamTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep latest voice settings and banks accessible in SSE callback
  const voiceSettingsRef = useRef(voiceSettings);
  voiceSettingsRef.current = voiceSettings;

  const banksRef = useRef(banks);
  banksRef.current = banks;

  // Save settings
  const handleSaveSettings = (newSettings: VoiceSettings) => {
    setVoiceSettings(newSettings);
    try {
      localStorage.setItem('vozbanco_settings', JSON.stringify(newSettings));
    } catch {
      // Ignore storage errors
    }
  };

  // Announce transaction via voice
  const announceTransaction = useCallback((tx: Transaction) => {
    const currentBanks = banksRef.current;
    const currentSettings = voiceSettingsRef.current;

    // Check if bank is muted
    const bankAccount = currentBanks.find((b) => b.bank.toLowerCase() === tx.bank.toLowerCase());
    if (bankAccount && !bankAccount.connected) {
      console.log(`Audio omitido: la cuenta bancaria ${tx.bank} está silenciada.`);
      return;
    }

    const spokenPhrase = buildSpokenAnnouncement(tx, currentSettings);
    setCurrentSpokenText(spokenPhrase);

    // Speak!
    voiceManager.speak(spokenPhrase, currentSettings);

    // Browser Notification if supported
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`¡Pago Recibido en ${tx.bank}!`, {
          body: `${spokenPhrase}`,
          icon: '/icon-192.svg'
        });
      } catch {
        // Ignore notification errors
      }
    }
  }, []);

  // Fetch initial data & setup SSE
  useEffect(() => {
    // 1. Fetch initial transactions
    fetch('/api/transactions')
      .then((r) => r.json())
      .then((data) => {
        if (data.transactions) {
          setTransactions(data.transactions);
        }
      })
      .catch((err) => console.log('Init transactions fetch error (using fallback):', err));

    // 2. Fetch initial banks
    fetch('/api/banks')
      .then((r) => r.json())
      .then((data) => {
        if (data.banks && data.banks.length > 0) {
          setBanks(data.banks);
        }
      })
      .catch((err) => console.log('Init banks fetch error:', err));

    // 3. Connect to real-time SSE stream
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events');
      eventSource.onopen = () => {
        setSseConnected(true);
      };
      eventSource.addEventListener('connected', () => {
        setSseConnected(true);
      });
      eventSource.addEventListener('transaction', (e) => {
        try {
          const newTx: Transaction = JSON.parse(e.data);
          setTransactions((prev) => [newTx, ...prev]);
          announceTransaction(newTx);
        } catch (err) {
          console.error('Error handling transaction SSE:', err);
        }
      });
      eventSource.onerror = () => {
        setSseConnected(false);
      };
    } catch (err) {
      console.log('SSE connection init error:', err);
    }

    // 4. Voice manager listener for speaking waveform state
    const unsubscribeVoice = voiceManager.subscribe((speaking, text) => {
      setIsSpeaking(speaking);
      if (text) setCurrentSpokenText(text);
    });

    // 5. Register PWA service worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    // 6. Capture beforeinstallprompt for Android PWA install button
    const installHandler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', installHandler);

    return () => {
      if (eventSource) eventSource.close();
      unsubscribeVoice();
      window.removeEventListener('beforeinstallprompt', installHandler);
    };
  }, [announceTransaction]);

  // Request Notification permission on first user tap
  const handleUnlockAudio = () => {
    unlockAudio();
    setAudioUnlocked(true);
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  };

  // Toggle voice mute
  const handleToggleVoice = () => {
    handleUnlockAudio();
    const updated = { ...voiceSettings, enabled: !voiceSettings.enabled };
    handleSaveSettings(updated);
    if (!updated.enabled) {
      voiceManager.stop();
    }
  };

  // Test voice synthesis immediately
  const handleTestVoice = () => {
    handleUnlockAudio();
    const testPhrase = '¡VozBanco conectado! Tu teléfono hablará cada vez que entre una transferencia.';
    setCurrentSpokenText(testPhrase);
    voiceManager.speak(testPhrase, voiceSettings);
  };

  // Trigger manual simulation from UI
  const handleSimulateTransaction = async (data: {
    amount: number;
    currency: CurrencyCode;
    bank: string;
    sender: string;
    concept: string;
    type?: 'income' | 'expense';
  }) => {
    handleUnlockAudio();

    // Call server to persist and broadcast
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        const resData = await response.json();
        if (resData.transaction) {
          // If SSE didn't already append it:
          setTransactions((prev) => {
            if (prev.some((t) => t.id === resData.transaction.id)) return prev;
            return [resData.transaction, ...prev];
          });
          announceTransaction(resData.transaction);
        }
      }
    } catch {
      // Local fallback simulation if server is offline
      const localTx: Transaction = {
        id: `tx_${Date.now()}`,
        amount: data.amount,
        currency: data.currency,
        type: data.type || 'income',
        bank: data.bank,
        sender: data.sender,
        concept: data.concept,
        timestamp: new Date().toISOString(),
        status: 'completed',
        spoken: false
      };
      setTransactions((prev) => [localTx, ...prev]);
      announceTransaction(localTx);
    }
  };

  // Replay voice for any item in list
  const handleReplayVoice = (tx: Transaction) => {
    handleUnlockAudio();
    announceTransaction(tx);
  };

  // Toggle bank mute
  const handleToggleBank = (id: string) => {
    setBanks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, connected: !b.connected } : b))
    );
    fetch('/api/banks/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    }).catch(() => {});
  };

  // Add new bank account
  const handleAddBank = (newBank: BankAccount) => {
    setBanks((prev) => [newBank, ...prev]);
  };

  // Auto stream mode for testing continuous alerts
  const handleToggleAutoStream = () => {
    handleUnlockAudio();
    if (autoStreamActive) {
      if (autoStreamTimerRef.current) clearInterval(autoStreamTimerRef.current);
      setAutoStreamActive(false);
    } else {
      setAutoStreamActive(true);
      const sampleNames = ['Andrea Gómez', 'Luis Morales', 'Carolina Reyes', 'Mateo Castillo', 'Valeria Rios'];
      const sampleBanks = ['Nequi', 'Bancolombia', 'DaviPlata', 'BBVA'];
      const sampleAmounts = [25000, 45000, 80000, 110000, 32000, 50000];

      autoStreamTimerRef.current = setInterval(() => {
        const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
        const randomBank = sampleBanks[Math.floor(Math.random() * sampleBanks.length)];
        const randomAmount = sampleAmounts[Math.floor(Math.random() * sampleAmounts.length)];

        handleSimulateTransaction({
          amount: randomAmount,
          currency: 'COP',
          bank: randomBank,
          sender: randomName,
          concept: 'Venta rápida (Modo Tienda)',
          type: 'income'
        });
      }, 15000);
    }
  };

  useEffect(() => {
    return () => {
      if (autoStreamTimerRef.current) clearInterval(autoStreamTimerRef.current);
    };
  }, []);

  // Android PWA Install trigger
  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowAndroidGuide(true);
    }
  };

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://miapp.com';
  const webhookUrl = `${currentOrigin}/api/webhook/transaction`;

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        voiceSettings={voiceSettings}
        onToggleVoice={handleToggleVoice}
        onOpenSettings={() => setShowSettings(true)}
        onOpenAndroidGuide={() => setShowAndroidGuide(true)}
        onOpenWebhook={() => setShowWebhook(true)}
        onTestVoice={handleTestVoice}
        isSpeaking={isSpeaking}
        sseConnected={sseConnected}
        canInstallPwa={!!deferredPrompt}
        onInstallPwa={handleInstallPwa}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {/* Hero Announcer Status Cockpit */}
        <VoiceStatusHero
          voiceSettings={voiceSettings}
          isSpeaking={isSpeaking}
          currentSpokenText={currentSpokenText}
          onToggleVoice={handleToggleVoice}
          onUnlockAudio={handleUnlockAudio}
          audioUnlocked={audioUnlocked}
          onOpenSimulator={() => {
            simulatorRef.current?.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenAndroidGuide={() => setShowAndroidGuide(true)}
        />

        {/* Financial Stat Cards */}
        <StatSummary
          transactions={transactions}
          activeBanksCount={banks.filter((b) => b.connected).length}
        />

        {/* Connected Banks Grid */}
        <BankAccountsGrid
          banks={banks}
          onToggleBank={handleToggleBank}
          onOpenConnectModal={() => setShowConnectBank(true)}
        />

        {/* Transaction Simulator */}
        <div ref={simulatorRef}>
          <TransactionSimulator
            onSimulate={handleSimulateTransaction}
            autoStreamActive={autoStreamActive}
            onToggleAutoStream={handleToggleAutoStream}
          />
        </div>

        {/* Real-time Transactions Feed */}
        <TransactionList
          transactions={transactions}
          onReplayVoice={handleReplayVoice}
          isSpeaking={isSpeaking}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#060a14] py-6 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-400">
            <strong>VozBanco</strong> • Tu asistente de audio para transacciones en Android y Web
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setShowAndroidGuide(true)}
              className="hover:text-slate-200 underline cursor-pointer"
            >
              Cómo conectar Android
            </button>
            <button
              onClick={() => setShowWebhook(true)}
              className="hover:text-slate-200 underline cursor-pointer"
            >
              API Webhook
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="hover:text-slate-200 underline cursor-pointer"
            >
              Configurar Voz
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <VoiceSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={voiceSettings}
        onSave={handleSaveSettings}
        onPreview={(sampleText, temp) => {
          handleUnlockAudio();
          voiceManager.speak(sampleText, temp);
        }}
      />

      <AndroidSetupModal
        isOpen={showAndroidGuide}
        onClose={() => setShowAndroidGuide(false)}
        webhookUrl={webhookUrl}
      />

      <WebhookModal
        isOpen={showWebhook}
        onClose={() => setShowWebhook(false)}
        webhookUrl={webhookUrl}
        onSendTestWebhook={async (payload) => {
          handleUnlockAudio();
          await fetch('/api/webhook/transaction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }}
      />

      <ConnectBankModal
        isOpen={showConnectBank}
        onClose={() => setShowConnectBank(false)}
        onAddBank={handleAddBank}
      />
    </div>
  );
}
