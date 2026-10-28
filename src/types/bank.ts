export type CurrencyCode = 'COP' | 'USD' | 'MXN' | 'EUR' | 'ARS' | 'CLP' | 'PEN';

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string;
  amount: number;
  currency: CurrencyCode;
  type: TransactionType;
  bank: string;
  sender: string;
  accountNumber?: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'flagged';
  concept: string;
  spoken: boolean;
  spokenText?: string;
  rawMemo?: string;
}

export type ChimeSound = 'cash_register' | 'modern_bell' | 'chime_bright' | 'subtle_ping' | 'none';

export interface VoiceSettings {
  enabled: boolean;
  voiceUri: string;
  lang: string;
  rate: number;
  pitch: number;
  volume: number;
  chimeEnabled: boolean;
  chimeType: ChimeSound;
  spokenTemplate: string;
  vibrationEnabled: boolean;
  saySender: boolean;
  sayBank: boolean;
  naturalSpanishNumbers: boolean;
}

export interface BankAccount {
  id: string;
  name: string;
  bank: string;
  accountType: 'savings' | 'checking' | 'digital_wallet';
  accountNumber: string;
  balance: number;
  currency: CurrencyCode;
  color: string;
  connected: boolean;
  lastSync: string;
  syncMethod: 'webhook' | 'sms_listener' | 'open_banking' | 'mock';
  icon: string;
}

export interface WebhookLogItem {
  id: string;
  timestamp: string;
  sourceIp: string;
  payload: Record<string, unknown>;
  matchedTransactionId?: string;
  success: boolean;
  error?: string;
}
