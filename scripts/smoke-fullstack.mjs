/**
 * Smoke E2E de la API real con PostgreSQL real y datos aislados de CI.
 * Ejecutar SOLO contra localhost; crea y elimina datos de prueba en una BD efímera.
 * node scripts/smoke-fullstack.mjs
 */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

const root = (process.env.NUTRIFLOW_SMOKE_URL ?? 'http://127.0.0.1:5000').replace(/\/$/, '');
const url = new URL(root);
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(url.hostname), 'El smoke destructivo solo permite localhost');
const day = new Date().toISOString().slice(0, 10);
let count = 0;

function ok(statement) {
  console.log('PASS ' + String(++count).padStart(2, '0') + ' ' + statement);
}
async function request(method, route, { body, token, status = 200 } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = 'Bearer ' + token;
  const response = await fetch(root + route, {
    method, headers, signal: AbortSignal.timeout(30000),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const raw = await response.text();
  assert.equal(response.status, status,
    method + ' ' + route + ': HTTP ' + response.status + ' (esperado ' + status + '). ' +
      (response.status >= 400 ? raw.slice(0, 450) : ''));
  if (!raw) return null;
  return response.headers.get('content-type')?.includes('application/json') ? JSON.parse(raw) : raw;
}

async function waitForApi() {
  const until = Date.now() + 180000;
  while (Date.now() < until) {
    try {
      await request('GET', '/health');
      return;
    } catch {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  throw new Error('El backend no responde /health después de 180 s');
}

try {
  await waitForApi();
  ok('API ASP.NET Core y PostgreSQL saludables');
  await request('GET', '/api/meals/?date=' + day, { status: 401 });
  ok('Diario privado exige autenticación');

  const id = randomUUID().slice(0, 12);
  const email = 'ci-nutriflow-' + id + '@example.invalid';
  const password = 'QA-NutriFlow-2026!';
  const session = await request('POST', '/api/auth/register', {
    status: 201, body: { email, displayName: 'Smoke NutriFlow', password },
  });
  assert.ok(session.accessToken && session.refreshToken);
  ok('Registro y tokens de sesión');
  const login = await request('POST', '/api/auth/login', { body: { email, password } });
  const token = login.accessToken;
  const me = await request('GET', '/api/auth/me', { token });
  assert.equal(me.email, email);
  ok('Login e identidad autenticada');

  const before = await request('GET', '/api/onboarding/', { token });
  assert.equal(before.isCompleted, false);
  ok('Perfil inicialmente sin completar');
  const physical = await request('PUT', '/api/onboarding/physical-profile', {
    token, body: { dateOfBirth: '1998-06-12', biologicalSex: 'Male', heightFeet: 5,
      heightInches: 8, currentWeightPounds: 220 },
  });
  assert.equal(physical.heightFeet, 5);
  assert.equal(physical.heightInches, 8);
  ok('Perfil físico en pies, pulgadas y libras');
  await request('PUT', '/api/onboarding/activity', { token, body: { activityLevel: 'Moderate' } });
  await request('PUT', '/api/onboarding/goal', {
    token, body: { goalType: 'MaintainWeight', targetWeightPounds: null },
  });
  await request('PUT', '/api/onboarding/preferences', { token, body: { codes: ['fruits'] } });
  const restrictions = await request('PUT', '/api/onboarding/restrictions', {
    token, body: { codes: ['milk'] },
  });
  assert.ok(restrictions.dietaryRestrictionCodes.includes('milk'));
  const completed = await request('POST', '/api/onboarding/complete', { token });
  assert.equal(completed.isCompleted, true);
  ok('Onboarding en cinco fases y restricciones guardadas');
  const targets = await request('GET', '/api/nutrition/targets', { token });
  assert.ok(targets.targetCalories > 0);
  ok('Objetivos nutricionales calculados');

  const barcode = String(BigInt('0x' + randomUUID().replace(/-/g, ''))).slice(0, 12);
  const food = await request('POST', '/api/foods/', {
    token, status: 201, body: {
      name: 'Leche prueba NutriFlow ' + id, brand: 'NutriFlow CI', category: 'Dairy',
      servingSize: 1, servingUnit: 'taza', calories: 120, proteinGrams: 5,
      carbohydrateGrams: 12, fatGrams: 5, barcode, allergenCodes: ['milk'],
    },
  });
  assert.ok(food.id);
  ok('Catálogo guarda alimento real');
  const foods = await request('GET', '/api/foods/?q=' + encodeURIComponent(id), { token });
  assert.ok(foods.some(x => x.id === food.id));
  const barcodeFood = await request('GET', '/api/foods/barcode/' + barcode, { token });
  assert.equal(barcodeFood.id, food.id);
  ok('Búsqueda y escaneo de código de barras');
  const compatibility = await request('GET', '/api/preferences/foods/' + food.id + '/compatibility', { token });
  assert.equal(compatibility.hasConflict, true);
  ok('Incompatibilidad con leche detectada');

  const added = await request('POST', '/api/meals/entries', {
    token, body: { date: day, mealType: 'Breakfast', foodId: food.id, servings: 1 },
  });
  const entry = added.meals.find(m => m.type === 'Breakfast')?.entries[0];
  assert.ok(entry?.id);
  assert.equal(added.calories, 120);
  ok('Registro de comida con totales coherentes');
  const updated = await request('PUT', '/api/meals/entries/' + entry.id, {
    token, body: { date: day, mealType: 'Breakfast', servings: 1.5 },
  });
  assert.equal(updated.calories, 180);
  const dashboard = await request('GET', '/api/dashboard/?date=' + day, { token });
  assert.equal(dashboard.consumedCalories, 180);
  ok('Edición de porciones y dashboard consistentes');
  const removed = await request('DELETE',
    '/api/meals/entries/' + entry.id + '?date=' + day + '&mealType=Breakfast', { token });
  assert.equal(removed.calories, 0);
  ok('Eliminación de comida y recálculo');

  const weight = await request('POST', '/api/progress/weight', {
    token, body: { date: day, weightPounds: 219.5, note: 'CI smoke test' },
  });
  assert.ok(weight.entries.some(x => x.date === day));
  const weightsAfter = await request('DELETE', '/api/progress/weight/' + day, { token });
  assert.ok(!weightsAfter.entries.some(x => x.date === day));
  ok('Registro y eliminación de peso');

  const water = await request('POST', '/api/engagement/water', {
    token, body: { date: day, amountOunces: 8 },
  });
  assert.ok(water.entries.length && water.consumedOunces >= 8);
  const waterAfter = await request('DELETE', '/api/engagement/water/' + water.entries[0].id, { token });
  assert.equal(waterAfter.consumedOunces, 0);
  ok('Hidratación agregada y retirada');

  const favorites = await request('POST', '/api/engagement/favorites/' + food.id, { token });
  assert.ok(favorites.some(x => x.foodId === food.id));
  const recipe = await request('POST', '/api/engagement/recipes', {
    token, status: 201, body: {
      name: 'Receta CI ' + id, servings: 1, instructions: null,
      ingredients: [{ foodId: food.id, servings: 1 }],
    },
  });
  assert.ok(recipe.id);
  await request('DELETE', '/api/engagement/recipes/' + recipe.id, { token, status: 204 });
  const afterFavorite = await request('DELETE', '/api/engagement/favorites/' + food.id, { token });
  assert.ok(!afterFavorite.some(x => x.foodId === food.id));
  ok('Favoritos y recetas: CRUD completo');

  const premium = await request('GET', '/api/analytics/premium?days=30', { token, status: 403 });
  assert.equal(premium.error, 'premium_required');
  ok('Acceso Premium realmente bloqueado en Free');
  const ai = await request('GET', '/api/ai/status', { token });
  assert.ok('providerConfigured' in ai);
  ok('Estado de IA accesible sin consumir proveedor');

  const rotated = await request('POST', '/api/auth/refresh', {
    body: { refreshToken: login.refreshToken },
  });
  assert.ok(rotated.refreshToken);
  await request('POST', '/api/auth/refresh', {
    body: { refreshToken: login.refreshToken }, status: 401,
  });
  ok('Refresh token rota y rechaza reutilización');
  await request('POST', '/api/auth/logout', {
    body: { refreshToken: rotated.refreshToken }, status: 204,
  });
  await request('POST', '/api/auth/refresh', {
    body: { refreshToken: rotated.refreshToken }, status: 401,
  });
  ok('Logout invalida sesión renovable');

  console.log('RESULTADO: ' + count + ' verificaciones full-stack APROBADAS. Datos aislados de CI.');
} catch (error) {
  console.error('FALLO FULL-STACK: ' + (error?.stack ?? String(error)));
  process.exitCode = 1;
}
