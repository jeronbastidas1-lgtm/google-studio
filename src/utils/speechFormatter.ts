import { CurrencyCode, Transaction, VoiceSettings } from '../types/bank';

/**
 * Converts a number (up to millions) to Spanish spoken words for natural sounding voice synthesis.
 */
export function numberToSpanishWords(num: number): string {
  const integerPart = Math.floor(Math.abs(num));
  if (integerPart === 0) return 'cero';

  const units = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
  const teens = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
  const tens = ['', 'diez', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  const hundreds = [
    '',
    'ciento',
    'doscientos',
    'trescientos',
    'cuatrocientos',
    'quinientos',
    'seiscientos',
    'setecientos',
    'ochocientos',
    'novecientos'
  ];

  function convertGroup(n: number): string {
    if (n === 0) return '';
    if (n === 100) return 'cien';

    let result = '';
    const h = Math.floor(n / 100);
    const rem = n % 100;

    if (h > 0) {
      result += hundreds[h] + ' ';
    }

    if (rem > 0) {
      if (rem < 10) {
        result += units[rem];
      } else if (rem < 20) {
        result += teens[rem - 10];
      } else if (rem === 20) {
        result += 'veinte';
      } else if (rem < 30) {
        const u = rem % 10;
        result += 'veinti' + units[u];
      } else {
        const t = Math.floor(rem / 10);
        const u = rem % 10;
        result += tens[t];
        if (u > 0) {
          result += ' y ' + units[u];
        }
      }
    }
    return result.trim();
  }

  let words = '';
  const millions = Math.floor(integerPart / 1_000_000);
  const thousands = Math.floor((integerPart % 1_000_000) / 1000);
  const rest = integerPart % 1000;

  if (millions > 0) {
    if (millions === 1) {
      words += 'un millón ';
    } else {
      words += convertGroup(millions) + ' millones ';
    }
  }

  if (thousands > 0) {
    if (thousands === 1) {
      words += 'mil ';
    } else {
      words += convertGroup(thousands) + ' mil ';
    }
  }

  if (rest > 0) {
    words += convertGroup(rest);
  }

  return words.trim();
}

/**
 * Returns currency name in Spanish
 */
export function getCurrencySpokenName(currency: CurrencyCode, amount: number): string {
  const isOne = Math.abs(amount) === 1;
  switch (currency) {
    case 'COP':
      return isOne ? 'peso colombiano' : 'pesos';
    case 'MXN':
      return isOne ? 'peso mexicano' : 'pesos';
    case 'USD':
      return isOne ? 'dólar' : 'dólares';
    case 'EUR':
      return isOne ? 'euro' : 'euros';
    case 'ARS':
      return isOne ? 'peso argentino' : 'pesos';
    case 'CLP':
      return isOne ? 'peso chileno' : 'pesos';
    case 'PEN':
      return isOne ? 'sol' : 'soles';
    default:
      return 'pesos';
  }
}

/**
 * Generates spoken phrase for an amount, e.g. "50 mil pesos" or "cincuenta mil pesos"
 */
export function formatSpokenAmount(amount: number, currency: CurrencyCode, naturalWords = true): string {
  const currencyName = getCurrencySpokenName(currency, amount);
  const decimalPart = Math.round((Math.abs(amount) - Math.floor(Math.abs(amount))) * 100);

  if (naturalWords && Math.abs(amount) <= 10_000_000) {
    const mainWords = numberToSpanishWords(amount);
    if (decimalPart > 0) {
      const decWords = numberToSpanishWords(decimalPart);
      return `${mainWords} ${currencyName} con ${decWords} centavos`;
    }
    return `${mainWords} ${currencyName}`;
  }

  // Fallback to formatted digits which TTS synthesizers pronounce easily
  const formattedNumber = new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 2
  }).format(amount);

  return `${formattedNumber} ${currencyName}`;
}

/**
 * Formats a transaction into the user's custom spoken speech string
 */
export function buildSpokenAnnouncement(
  transaction: Pick<Transaction, 'amount' | 'currency' | 'sender' | 'bank' | 'concept' | 'type'>,
  settings: VoiceSettings
): string {
  const spokenAmount = formatSpokenAmount(
    transaction.amount,
    transaction.currency,
    settings.naturalSpanishNumbers
  );

  let template = settings.spokenTemplate || '¡Atención! Recibiste {monto} de {remitente} en {banco}.';

  // Replace placeholders
  const senderText = settings.saySender && transaction.sender ? transaction.sender : 'Remitente verificado';
  const bankText = settings.sayBank && transaction.bank ? transaction.bank : 'tu cuenta bancaria';
  const conceptText = transaction.concept || 'Transferencia';

  let announcement = template
    .replace(/\{monto\}/gi, spokenAmount)
    .replace(/\{remitente\}/gi, senderText)
    .replace(/\{banco\}/gi, bankText)
    .replace(/\{concepto\}/gi, conceptText)
    .replace(/\{moneda\}/gi, getCurrencySpokenName(transaction.currency, transaction.amount));

  // If outgoing or expense
  if (transaction.type === 'expense') {
    announcement = `Débito realizado: ${spokenAmount} para ${senderText} en ${bankText}.`;
  }

  return announcement.trim();
}

/**
 * Standard formatted currency display
 */
export function formatCurrencyDisplay(amount: number, currency: CurrencyCode): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency === 'COP' || currency === 'CLP' || currency === 'ARS' ? 'COP' : currency,
    maximumFractionDigits: currency === 'COP' || currency === 'CLP' ? 0 : 2
  }).format(amount);
}
