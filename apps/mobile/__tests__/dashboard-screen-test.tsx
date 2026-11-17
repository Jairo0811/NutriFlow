import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import DashboardScreen from '../app/(app)/dashboard';
import { getDailyDashboard, type DailyDashboard } from '../src/features/dashboard/api';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('../src/features/auth/AuthProvider', () => ({
  useAuth: () => ({ session: { accessToken: 'test-token' } }),
}));
jest.mock('../src/features/shared/dates', () => ({
  useToday: () => '2026-11-17',
  formatLongDate: () => 'Martes, 17 de noviembre',
}));
jest.mock('../src/components/Screen', () => {
  const React = require('react');
  const { Text, View } = require('react-native');
  return {
    Screen: ({ title, children }: { title: string; children: React.ReactNode }) =>
      React.createElement(View, null, React.createElement(Text, null, title), children),
  };
});
jest.mock('../src/features/dashboard/api', () => ({ getDailyDashboard: jest.fn() }));

const fetchDashboard = getDailyDashboard as jest.MockedFunction<typeof getDailyDashboard>;

const dashboard: DailyDashboard = {
  date: '2026-11-17',
  targetCalories: 2000,
  consumedCalories: 2200,
  remainingCalories: -200,
  calorieProgressPercent: 110,
  protein: { target: 140, consumed: 160, remaining: -20, progressPercent: 115 },
  carbohydrates: { target: 200, consumed: 180, remaining: 20, progressPercent: 90 },
  fat: { target: 70, consumed: 60, remaining: 10, progressPercent: 85 },
  meals: [],
};

beforeEach(() => {
  fetchDashboard.mockReset();
});

describe('Dashboard nutricional', () => {
  test('muestra un estado de carga mientras espera la API', () => {
    fetchDashboard.mockImplementation(() => new Promise(() => {}));
    const view = render(<DashboardScreen />);
    expect(view.getByText('Cargando tu resumen…')).toBeTruthy();
  });

  test('muestra error de red y permite reintentar', async () => {
    fetchDashboard.mockRejectedValueOnce(new Error('fetch failed'));
    fetchDashboard.mockResolvedValueOnce(dashboard);
    const view = render(<DashboardScreen />);

    expect(await view.findByText(/No pudimos conectar con NutriFlow/)).toBeTruthy();
    fireEvent.press(view.getByRole('button', { name: 'Reintentar' }));
    expect(await view.findByText('Calorías excedidas')).toBeTruthy();
    expect(fetchDashboard).toHaveBeenCalledTimes(2);
  });

  test('destaca el exceso de calorías y de proteína', async () => {
    fetchDashboard.mockResolvedValue(dashboard);
    const view = render(<DashboardScreen />);

    expect(await view.findByText('Calorías excedidas')).toBeTruthy();
    expect(view.getByText('2200 consumidas de 2000 kcal')).toBeTruthy();
    expect(view.getByText('20 g por encima')).toBeTruthy();
    expect(fetchDashboard).toHaveBeenCalledWith('test-token', '2026-11-17');
  });
});
