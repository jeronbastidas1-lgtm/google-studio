import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory data store for transactions and banks
interface StoredTransaction {
  id: string;
  amount: number;
  currency: 'COP' | 'USD' | 'MXN' | 'EUR' | 'ARS';
  type: 'income' | 'expense' | 'transfer';
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

const bankAccounts = [
  {
    id: 'bank_nequi_personal',
    name: 'Nequi Personal',
    bank: 'Nequi Personal',
    accountType: 'digital_wallet',
    accountNumber: '3005668721',
    balance: 30000,
    currency: 'COP',
    color: '#8b5cf6',
    connected: true,
    lastSync: new Date().toISOString(),
    syncMethod: 'sms_listener',
    icon: 'Smartphone'
  },
  {
    id: 'bank_nequi_negocios',
    name: 'Nequi Negocios',
    bank: 'Nequi Negocios',
    accountType: 'digital_wallet',
    accountNumber: '3014197116',
    balance: 37200,
    currency: 'COP',
    color: '#a855f7',
    connected: true,
    lastSync: new Date().toISOString(),
    syncMethod: 'webhook',
    icon: 'Smartphone'
  },
  {
    id: 'bank_daviplata',
    name: 'DaviPlata',
    bank: 'DaviPlata',
    accountType: 'digital_wallet',
    accountNumber: '3016151802',
    balance: 1000,
    currency: 'COP',
    color: '#ef4444',
    connected: true,
    lastSync: new Date().toISOString(),
    syncMethod: 'sms_listener',
    icon: 'Smartphone'
  }
];

const transactions: StoredTransaction[] = [
  {
    id: 'tx_seed_1',
    amount: 15000,
    currency: 'COP',
    type: 'income',
    bank: 'Nequi Personal',
    sender: 'Camila Rodriguez',
    accountNumber: '3005668721',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    status: 'completed',
    concept: 'Pago pedido #1042',
    spoken: true,
    spokenText: '¡Pago recibido! Quince mil pesos de Camila Rodriguez en Nequi Personal.'
  },
  {
    id: 'tx_seed_2',
    amount: 25000,
    currency: 'COP',
    type: 'income',
    bank: 'Nequi Negocios',
    sender: 'Distribuidora Central S.A.S',
    accountNumber: '3014197116',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    status: 'completed',
    concept: 'Venta de productos en negocio',
    spoken: true,
    spokenText: '¡Pago recibido! Veinticinco mil pesos de Distribuidora Central en Nequi Negocios.'
  },
  {
    id: 'tx_seed_3',
    amount: 1000,
    currency: 'COP',
    type: 'income',
    bank: 'DaviPlata',
    sender: 'Felipe Morales',
    accountNumber: '3016151802',
    timestamp: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    status: 'completed',
    concept: 'Transferencia express',
    spoken: true,
    spokenText: '¡Pago recibido! Mil pesos de Felipe Morales en DaviPlata.'
  }
];

// SSE Clients
const sseClients: Response[] = [];

function broadcastSSE(event: string, data: unknown) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.write(payload);
    } catch {
      // Ignore dead connection
    }
  });
}

// Keep-alive heartbeat every 25 seconds
setInterval(() => {
  broadcastSSE('ping', { time: Date.now() });
}, 25000);

// SSE Endpoint
app.get('/api/events', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', clientsCount: sseClients.length + 1 })}\n\n`);
  sseClients.push(res);

  req.on('close', () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) {
      sseClients.splice(idx, 1);
    }
  });
});

// API Routes
app.get('/api/transactions', (_req: Request, res: Response) => {
  res.json({ transactions });
});

app.get('/api/banks', (_req: Request, res: Response) => {
  res.json({ banks: bankAccounts });
});

app.post('/api/banks/toggle', (req: Request, res: Response) => {
  const { id } = req.body;
  const bank = bankAccounts.find((b) => b.id === id);
  if (!bank) {
    res.status(404).json({ error: 'Banco no encontrado' });
    return;
  }
  bank.connected = !bank.connected;
  bank.lastSync = new Date().toISOString();
  broadcastSSE('bank_updated', bank);
  res.json({ success: true, bank });
});

// Create new transaction (from app or direct trigger)
app.post('/api/transactions', (req: Request, res: Response) => {
  const { amount, currency = 'COP', bank = 'Nequi', sender = 'Cliente', concept = 'Pago recibido', type = 'income' } = req.body;

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    res.status(400).json({ error: 'Monto inválido' });
    return;
  }

  const newTx: StoredTransaction = {
    id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    amount: numAmount,
    currency: currency as 'COP' | 'USD' | 'MXN' | 'EUR' | 'ARS',
    type: type as 'income' | 'expense' | 'transfer',
    bank,
    sender,
    timestamp: new Date().toISOString(),
    status: 'completed',
    concept,
    spoken: false
  };

  transactions.unshift(newTx);

  // Update bank balance
  const targetBank = bankAccounts.find((b) => b.bank.toLowerCase() === bank.toLowerCase());
  if (targetBank) {
    if (type === 'income') {
      targetBank.balance += numAmount;
    } else {
      targetBank.balance -= numAmount;
    }
    targetBank.lastSync = new Date().toISOString();
  }

  // Broadcast to all connected Android & web devices in real time
  broadcastSSE('transaction', newTx);

  res.status(201).json({ success: true, transaction: newTx });
});

// Webhook receiver for Android Notification listeners, SMS forwarders, or external banks
app.post('/api/webhook/transaction', (req: Request, res: Response) => {
  const body = req.body || {};
  let amount = 0;
  let currency: 'COP' | 'USD' | 'MXN' | 'EUR' | 'ARS' = 'COP';
  let bank = 'Banco Digital';
  let sender = 'Cliente';
  let concept = 'Pago vía Webhook';
  let rawText = '';

  // If text is provided in SMS format (e.g. from Android SMS listener or Tasker/MacroDroid)
  if (body.text || body.message || body.sms || typeof body === 'string') {
    rawText = body.text || body.message || body.sms || String(body);
    const amountMatch = rawText.match(/\$\s*([\d.,]+)/) || rawText.match(/por\s+([\d.,]+)/i);
    if (amountMatch && amountMatch[1]) {
      const cleanNum = amountMatch[1].replace(/\./g, '').replace(',', '.');
      amount = parseFloat(cleanNum);
    }
    if (rawText.toLowerCase().includes('nequi')) bank = 'Nequi';
    else if (rawText.toLowerCase().includes('bancolombia')) bank = 'Bancolombia';
    else if (rawText.toLowerCase().includes('daviplata')) bank = 'DaviPlata';
    else if (rawText.toLowerCase().includes('bbva')) bank = 'BBVA';
  } else {
    // Structured JSON
    amount = parseFloat(body.amount) || 0;
    if (body.currency) currency = body.currency;
    if (body.bank) bank = body.bank;
    if (body.sender) sender = body.sender;
    if (body.concept) concept = body.concept;
  }

  if (amount <= 0) {
    amount = 50000; // default sample if not extractable
  }

  const newTx: StoredTransaction = {
    id: `tx_wh_${Date.now()}`,
    amount,
    currency,
    type: 'income',
    bank,
    sender,
    concept,
    timestamp: new Date().toISOString(),
    status: 'completed',
    spoken: false,
    rawMemo: rawText || JSON.stringify(body)
  };

  transactions.unshift(newTx);

  // Update bank account
  const targetBank = bankAccounts.find((b) => b.bank.toLowerCase() === bank.toLowerCase());
  if (targetBank) {
    targetBank.balance += amount;
    targetBank.lastSync = new Date().toISOString();
  }

  broadcastSSE('transaction', newTx);

  res.json({
    success: true,
    message: 'Webhook recibido y anunciado a dispositivos conectados',
    transaction: newTx
  });
});

// Optional AI enhancement endpoint via @google/genai
app.post('/api/ai/phrase', async (req: Request, res: Response) => {
  const { amount, currency, bank, sender, concept } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    // Fallback response without Gemini
    res.json({
      phrase: `¡Atención! Recibiste un pago de ${amount} ${currency || 'pesos'} de ${sender || 'un cliente'} en tu cuenta de ${bank || 'banco'}.`
    });
    return;
  }

  try {
    const ai = new GoogleGenAI();
    const prompt = `Genera una frase corta, enérgica, amigable y muy clara en español (máximo 18 palabras) para que un sintetizador de voz le avise a un comerciante o usuario que acaba de recibir dinero en su banco.
Detalles:
- Monto: ${amount} ${currency || 'COP'}
- Banco: ${bank || 'Nequi'}
- Remitente: ${sender || 'Cliente'}
- Concepto: ${concept || 'Venta'}

La frase debe ser natural, como: "¡Buenas noticias! Te acaban de transferir 50.000 pesos de Carlos Pérez en Nequi."
Responde ÚNICAMENTE con la frase, sin comillas adicionales.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    const phrase = response.text ? response.text.trim() : `¡Pago recibido! ${amount} ${currency} de ${sender} en ${bank}.`;
    res.json({ phrase });
  } catch (error) {
    console.error('Error generating AI phrase:', error);
    res.json({
      phrase: `¡Pago recibido! ${amount} ${currency || 'pesos'} de ${sender || 'Cliente'} en ${bank || 'tu banco'}.`
    });
  }
});

// Explicit PWA routes for Android WebAPK compatibility
app.get('/manifest.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  const targetFile = fs.existsSync(path.resolve(__dirname, 'dist/manifest.json'))
    ? path.resolve(__dirname, 'dist/manifest.json')
    : path.resolve(__dirname, 'public/manifest.json');
  res.sendFile(targetFile);
});

app.get('/sw.js', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Service-Worker-Allowed', '/');
  const targetFile = fs.existsSync(path.resolve(__dirname, 'dist/sw.js'))
    ? path.resolve(__dirname, 'dist/sw.js')
    : path.resolve(__dirname, 'public/sw.js');
  res.sendFile(targetFile);
});

// Serve public directory static assets directly
app.use(express.static(path.resolve(__dirname, 'public')));

// Boot server & Vite
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VozBanco server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
