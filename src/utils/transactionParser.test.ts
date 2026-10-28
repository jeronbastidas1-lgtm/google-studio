import test from 'node:test';
import assert from 'node:assert/strict';
import { parseBankNotificationText, normalizeTransaction } from './transactionParser';

test('parseBankNotificationText detects Nequi SMS format', () => {
  const sms = '¡Te acaban de enviar $50.000! Maria Gomez te envio plata desde Nequi.';
  const parsed = parseBankNotificationText(sms);

  assert.equal(parsed.bank, 'Nequi');
  assert.equal(parsed.amount, 50000);
  assert.equal(parsed.currency, 'COP');
  assert.equal(parsed.type, 'income');
  assert.ok(parsed.sender.includes('Maria Gomez'));
});

test('parseBankNotificationText detects Bancolombia transfer notification', () => {
  const sms = 'Bancolombia le informa Transferencia por $120.000 desde cta *4521 de CARLOS PEREZ';
  const parsed = parseBankNotificationText(sms);

  assert.equal(parsed.bank, 'Bancolombia');
  assert.equal(parsed.amount, 120000);
  assert.equal(parsed.type, 'income');
  assert.ok(parsed.sender.toUpperCase().includes('CARLOS PEREZ'));
});

test('parseBankNotificationText detects USD and Zelle', () => {
  const notification = 'Zelle: You received $75.00 from Jane Doe for Dinner.';
  const parsed = parseBankNotificationText(notification);

  assert.equal(parsed.bank, 'Zelle');
  assert.equal(parsed.currency, 'USD');
  assert.equal(parsed.amount, 75);
});

test('normalizeTransaction sets default values and IDs properly', () => {
  const tx = normalizeTransaction({
    amount: 85000,
    bank: 'BBVA',
    sender: 'Pedro Pascal'
  });

  assert.ok(tx.id.startsWith('tx_'));
  assert.equal(tx.amount, 85000);
  assert.equal(tx.bank, 'BBVA');
  assert.equal(tx.currency, 'COP');
  assert.equal(tx.sender, 'Pedro Pascal');
  assert.equal(tx.spoken, false);
});
