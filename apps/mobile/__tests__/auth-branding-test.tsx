import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { Keyboard, Text } from 'react-native';

import { AuthButton } from '../src/features/auth/components/AuthButton';
import { AuthField } from '../src/features/auth/components/AuthField';
import { AuthScaffold } from '../src/features/auth/components/AuthScaffold';

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return { Ionicons: ({ name }: { name: string }) => React.createElement(Text, null, name) };
});

describe('Identidad visual accesible de NutriFlow', () => {
  test('presenta marca, beneficios y título del login', () => {
    const view = render(
      <AuthScaffold featured title="Bienvenido de nuevo" subtitle="Nutrición y bienestar">
        <Text>Formulario</Text>
      </AuthScaffold>,
    );
    expect(view.getByLabelText('Isotipo NutriFlow')).toBeTruthy();
    expect(view.getByText('Bienvenido de nuevo')).toBeTruthy();
    expect(view.getByText('Calorías')).toBeTruthy();
    expect(view.getByText('Proteínas')).toBeTruthy();
    expect(view.getByText('Macros')).toBeTruthy();
  });

  test('el correo mantiene una etiqueta accesible aun sin título visible', () => {
    const onChangeText = jest.fn();
    const view = render(
      <AuthField featured icon="mail-outline" label="Correo electrónico" onChangeText={onChangeText} value="" />,
    );
    fireEvent.changeText(view.getByLabelText('Correo electrónico'), 'ejemplo@correo.com');
    expect(onChangeText).toHaveBeenCalledWith('ejemplo@correo.com');
  });

  test('el botón destacado ejecuta su acción y respeta disabled', () => {
    const onPress = jest.fn();
    const view = render(<AuthButton featured label="Iniciar sesión" onPress={onPress} />);
    fireEvent.press(view.getByRole('button', { name: 'Iniciar sesión' }));
    expect(onPress).toHaveBeenCalledTimes(1);
    view.rerender(<AuthButton featured label="Iniciar sesión" disabled onPress={onPress} />);
    fireEvent.press(view.getByRole('button', { name: 'Iniciar sesión' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('compacta la cabecera con el teclado abierto para no tapar los campos', () => {
    const listeners: Record<string, () => void> = {};
    jest.spyOn(Keyboard, 'addListener').mockImplementation(((event: string, callback: () => void) => {
      listeners[event] = callback;
      return { remove: jest.fn() };
    }) as unknown as typeof Keyboard.addListener);

    const view = render(
      <AuthScaffold featured title="Bienvenido de nuevo" subtitle="Nutrición y bienestar">
        <Text>Formulario</Text>
      </AuthScaffold>,
    );
    expect(view.getByText('Calorías')).toBeTruthy();

    act(() => { listeners[Object.keys(listeners).find((name) => /Show/.test(name))!](); });
    expect(view.queryByText('Calorías')).toBeNull();
    expect(view.getByText('Formulario')).toBeTruthy();

    act(() => { listeners[Object.keys(listeners).find((name) => /Hide/.test(name))!](); });
    expect(view.getByText('Calorías')).toBeTruthy();
    jest.restoreAllMocks();
  });
});
