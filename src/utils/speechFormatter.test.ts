import test from 'node:test';
import assert from 'node:assert/strict';
import {
  numberToSpanishWords,
  formatSpokenAmount,
  buildSpokenAnnouncement,
  getCurrencySpokenName
} from './speechFormatter';
import { VoiceSettings } from '../types/bank';

test('numberToSpanishWords handles basic numbers and thousands correctly', () => {
  assert.equal(numberToSpanishWords(0), 'cero');
  assert.equal(numberToSpanishWords(1), 'un');
  assert.equal(numberToSpanishWords(15), 'quince');
  assert.equal(numberToSpanishWords(25), 'veinticinco');
  assert.equal(numberToSpanishWords(100), 'cien');
  assert.equal(numberToSpanishWords(150), 'ciento cincuenta');
  assert.equal(numberToSpanishWords(1000), 'mil');
  assert.equal(numberToSpanishWords(50000), 'cincuenta mil');
  assert.equal(numberToSpanishWords(1250000), 'un millón doscientos cincuenta mil');
});

test('getCurrencySpokenName pluralizes properly in Spanish', () => {
  assert.equal(getCurrencySpokenName('COP', 1), 'peso colombiano');
  assert.equal(getCurrencySpokenName('COP', 50000), 'pesos');
  assert.equal(getCurrencySpokenName('USD', 1), 'dólar');
  assert.equal(getCurrencySpokenName('USD', 20), 'dólares');
  assert.equal(getCurrencySpokenName('EUR', 10), 'euros');
});

test('formatSpokenAmount formats numbers into readable speech', () => {
  const spokenCop = formatSpokenAmount(50000, 'COP', true);
  assert.ok(spokenCop.includes('cincuenta mil'));
  assert.ok(spokenCop.includes('pesos'));

  const spokenUsd = formatSpokenAmount(100, 'USD', true);
  assert.equal(spokenUsd, 'cien dólares');
});

test('buildSpokenAnnouncement substitutes template placeholders correctly', () => {
  const dummySettings: VoiceSettings = {
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

  const phrase = buildSpokenAnnouncement(
    {
      amount: 45000,
      currency: 'COP',
      sender: 'Carlos Pérez',
      bank: 'Nequi',
      concept: 'Almuerzo ejecutivo',
      type: 'income'
    },
    dummySettings
  );

  assert.ok(phrase.includes('cuarenta y cinco mil pesos'));
  assert.ok(phrase.includes('Carlos Pérez'));
  assert.ok(phrase.includes('Nequi'));
});
