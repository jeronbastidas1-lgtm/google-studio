import { CurrencyCode, Transaction } from '../types/bank';

export interface ParsedBankMessage {
  amount: number;
  currency: CurrencyCode;
  bank: string;
  sender: string;
  concept: string;
  accountNumber?: string;
  type: 'income' | 'expense' | 'transfer';
  confidence: number;
}

/**
 * Intelligent parser for incoming bank SMS and push notification text
 * Supports Latin American and international banking patterns:
 * Nequi, Bancolombia, Daviplata, BBVA, Santander, Mercado Pago, Nu, Zelle, SPEI, Bizum
 */
export function parseBankNotificationText(rawText: string): ParsedBankMessage {
  const text = rawText.trim();
  const lower = text.toLowerCase();

  // 1. Detect Bank
  let detectedBank = 'Banco';
  if (lower.includes('nequi')) detectedBank = 'Nequi';
  else if (lower.includes('bancolombia')) detectedBank = 'Bancolombia';
  else if (lower.includes('daviplata')) detectedBank = 'DaviPlata';
  else if (lower.includes('bbva')) detectedBank = 'BBVA';
  else if (lower.includes('mercado pago') || lower.includes('mercadopago')) detectedBank = 'Mercado Pago';
  else if (lower.includes('santander')) detectedBank = 'Santander';
  else if (lower.includes('nu') || lower.includes('nubank')) detectedBank = 'Nu';
  else if (lower.includes('zelle')) detectedBank = 'Zelle';
  else if (lower.includes('spei') || lower.includes('stp')) detectedBank = 'SPEI México';
  else if (lower.includes('bizum')) detectedBank = 'Bizum';
  else if (lower.includes('chase')) detectedBank = 'Chase';

  // 2. Detect Currency
  let detectedCurrency: CurrencyCode = 'COP';
  if (lower.includes('mxn') || lower.includes('pesos mexicanos') || detectedBank === 'SPEI México') {
    detectedCurrency = 'MXN';
  } else if (lower.includes('usd') || lower.includes('dólar') || lower.includes('dollars') || detectedBank === 'Zelle' || detectedBank === 'Chase') {
    detectedCurrency = 'USD';
  } else if (lower.includes('eur') || lower.includes('euros') || detectedBank === 'Bizum') {
    detectedCurrency = 'EUR';
  } else if (lower.includes('ars')) {
    detectedCurrency = 'ARS';
  }

  // 3. Extract Amount
  // Matches patterns like $50.000, $ 50,000.00, 150.00, etc.
  const amountMatch = text.match(/\$\s*([\d.,]+)/) ||
                      text.match(/(\b[\d.,]+)\s*(?:pesos|cop|mxn|usd|eur|dolares|euros)/i) ||
                      text.match(/por\s+([\d.,]+)/i);

  let amount = 0;
  if (amountMatch && amountMatch[1]) {
    const rawNumberStr = amountMatch[1].replace(/\s/g, '');
    // Check if format is Colombian/European style 50.000 or US style 50,000.00
    if (rawNumberStr.includes('.') && rawNumberStr.includes(',')) {
      if (rawNumberStr.indexOf('.') < rawNumberStr.indexOf(',')) {
        // e.g. 1.250,50
        amount = parseFloat(rawNumberStr.replace(/\./g, '').replace(',', '.'));
      } else {
        // e.g. 1,250.50
        amount = parseFloat(rawNumberStr.replace(/,/g, ''));
      }
    } else if (rawNumberStr.includes('.') && !rawNumberStr.includes(',')) {
      // Could be 50.000 (thousands) or 50.00 (decimals)
      const parts = rawNumberStr.split('.');
      if (parts[parts.length - 1].length === 3 && parts.length > 1) {
        // Thousands separator like 50.000 or 1.250.000
        amount = parseFloat(rawNumberStr.replace(/\./g, ''));
      } else if (parts[parts.length - 1].length === 2 && detectedCurrency === 'USD') {
        // Decimal like 49.99
        amount = parseFloat(rawNumberStr);
      } else {
        // Fallback: if last group is 3 digits, usually thousands in Spanish
        if (parts[1]?.length === 3) {
          amount = parseFloat(rawNumberStr.replace(/\./g, ''));
        } else {
          amount = parseFloat(rawNumberStr);
        }
      }
    } else if (rawNumberStr.includes(',')) {
      // Single comma
      const parts = rawNumberStr.split(',');
      if (parts[parts.length - 1].length === 3) {
        amount = parseFloat(rawNumberStr.replace(/,/g, ''));
      } else {
        amount = parseFloat(rawNumberStr.replace(',', '.'));
      }
    } else {
      amount = parseFloat(rawNumberStr);
    }
  }

  // 4. Extract Sender / Remitente
  let sender = 'Cliente Bancario';

  // Specific check for: "Maria Gomez te envio plata" or "Juan Perez te transfirió"
  const teEnvioMatch = text.match(/(?:^|[!¡.\n])\s*([A-ZÁÉÍÓÚÑa-záéíóúñ\s]{3,35})\s+te\s+(?:envio|envió|transfirio|transfirió|mandó|pago|pagó)/i);
  if (teEnvioMatch && teEnvioMatch[1]) {
    const candidate = teEnvioMatch[1].trim();
    if (!['te acaban', 'banco', 'nequi', 'daviplata'].some(w => candidate.toLowerCase().includes(w))) {
      sender = candidate;
    }
  }

  if (sender === 'Cliente Bancario') {
    const fromMatch = text.match(/(?:from|de parte de)\s+([A-ZÁÉÍÓÚÑa-záéíóúñ\s]{3,35})(?:\s+for|\s+el|\.|\,|$)/i) ||
                      text.match(/(?:de|desde)\s+([A-ZÁÉÍÓÚÑa-záéíóúñ\s]{3,35})(?:\s+el|\s+por|\s+ref|\s+saldo|\.|\,|$)/i);
    if (fromMatch && fromMatch[1]) {
      const candidate = fromMatch[1].trim();
      const isNoise = ['otro banco', 'tu cuenta', 'mi cuenta', 'nequi', 'daviplata', 'bancolombia', 'cuenta'].some(w => candidate.toLowerCase().includes(w));
      if (!isNoise && candidate.length > 2) {
        sender = candidate;
      }
    }
  }

  // 5. Account number if present
  const accMatch = text.match(/(?:cta|cuenta|\*)\s*(\*?\d{3,6})/i);
  const accountNumber = accMatch ? `••• ${accMatch[1].replace(/\*/g, '')}` : undefined;

  // 6. Concept & Type
  let type: 'income' | 'expense' | 'transfer' = 'income';
  if (lower.includes('compraste') || lower.includes('debito') || lower.includes('retiro') || lower.includes('pago realizado')) {
    type = 'expense';
  }

  const concept = type === 'expense' ? 'Compra / Débito' : 'Transferencia recibida';

  return {
    amount: isNaN(amount) ? 0 : Math.abs(amount),
    currency: detectedCurrency,
    bank: detectedBank,
    sender,
    concept,
    accountNumber,
    type,
    confidence: amount > 0 ? 0.95 : 0.4
  };
}

/**
 * Normalizes an incoming webhook or simulated payload into a full Transaction
 */
export function normalizeTransaction(input: {
  amount: number | string;
  currency?: string;
  bank?: string;
  sender?: string;
  concept?: string;
  type?: 'income' | 'expense' | 'transfer';
  accountNumber?: string;
  rawMemo?: string;
}): Transaction {
  const numAmount = typeof input.amount === 'string' ? parseFloat(input.amount) : input.amount;
  const validCurrencies: CurrencyCode[] = ['COP', 'USD', 'MXN', 'EUR', 'ARS', 'CLP', 'PEN'];
  const currency: CurrencyCode = validCurrencies.includes(input.currency as CurrencyCode)
    ? (input.currency as CurrencyCode)
    : 'COP';

  return {
    id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    amount: Math.abs(numAmount || 0),
    currency,
    type: input.type || 'income',
    bank: input.bank || 'Nequi',
    sender: input.sender || 'Cliente Directo',
    concept: input.concept || 'Pago inmediato',
    accountNumber: input.accountNumber || '••• 9012',
    timestamp: new Date().toISOString(),
    status: 'completed',
    spoken: false,
    rawMemo: input.rawMemo
  };
}
