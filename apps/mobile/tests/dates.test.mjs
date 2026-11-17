import test from 'node:test';
import assert from 'node:assert/strict';

import { isValidPastDate } from '../src/features/shared/dateValidation.ts';
import { localDate } from '../src/features/shared/calendar.ts';
import { composeDateParts, digitsOnly } from '../src/features/shared/dateParts.ts';

test('valida fechas reales, bisiestos y límites temporales', () => {
  const now = new Date(2026, 10, 17, 12, 0, 0);
  assert.equal(isValidPastDate('2000-02-29', now), true);
  assert.equal(isValidPastDate('2024-02-29', now), true);
  assert.equal(isValidPastDate('2025-02-29', now), false);
  assert.equal(isValidPastDate('2026-02-31', now), false);
  assert.equal(isValidPastDate('1899-12-31', now), false);
  assert.equal(isValidPastDate('2026-11-17', now), false);
  assert.equal(isValidPastDate('2026-11-18', now), false);
  assert.equal(isValidPastDate('fecha no válida', now), false);
});

test('fecha local en República Dominicana cerca de medianoche UTC', () => {
  const before = process.env.TZ;
  try {
    process.env.TZ = 'America/Santo_Domingo';
    assert.equal(localDate(new Date('2026-11-18T02:30:00Z')), '2026-11-17');
    assert.equal(localDate(new Date('2026-11-18T04:30:00Z')), '2026-11-18');
  } finally {
    if (before === undefined) delete process.env.TZ;
    else process.env.TZ = before;
  }
});

test('DateField compone DD/MM/AAAA y filtra caracteres', () => {
  assert.equal(composeDateParts({ day: '7', month: '2', year: '2000' }), '2000-02-07');
  assert.equal(composeDateParts({ day: '', month: '2', year: '2000' }), '');
  assert.equal(composeDateParts({ day: '07', month: '02', year: '20' }), '');
  assert.equal(digitsOnly('1a2-3', 2), '12');
});
