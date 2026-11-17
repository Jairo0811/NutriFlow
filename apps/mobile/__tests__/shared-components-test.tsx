import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { Button } from '../src/components/Button';
import { DateField } from '../src/components/DateField';
import { Input } from '../src/components/Input';
import { ProgressBar } from '../src/components/ProgressBar';

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return { Ionicons: ({ name }: { name: string }) => React.createElement(Text, null, name) };
});

describe('Componentes compartidos de NutriFlow', () => {
  test('Button ejecuta la acción y respeta disabled', () => {
    const onPress = jest.fn();
    const { getByRole, rerender } = render(<Button label="Guardar peso" onPress={onPress} />);
    fireEvent.press(getByRole('button', { name: 'Guardar peso' }));
    expect(onPress).toHaveBeenCalledTimes(1);

    rerender(<Button disabled label="Guardar peso" onPress={onPress} />);
    fireEvent.press(getByRole('button', { name: 'Guardar peso' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('Input permite alternar la visibilidad de contraseña', () => {
    const { getByLabelText } = render(<Input label="Contraseña" secureTextEntry />);
    expect(getByLabelText('Contraseña').props.secureTextEntry).toBe(true);
    fireEvent.press(getByLabelText('Mostrar contraseña'));
    expect(getByLabelText('Contraseña').props.secureTextEntry).toBe(false);
    fireEvent.press(getByLabelText('Ocultar contraseña'));
    expect(getByLabelText('Contraseña').props.secureTextEntry).toBe(true);
  });

  test('DateField transforma DD/MM/AAAA en fecha ISO', () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(<DateField label="Fecha de nacimiento" value="" onChange={onChange} />);
    fireEvent.changeText(getByLabelText('Fecha de nacimiento, día'), '08');
    fireEvent.changeText(getByLabelText('Fecha de nacimiento, mes'), '11');
    fireEvent.changeText(getByLabelText('Fecha de nacimiento, año'), '1997');
    expect(onChange).toHaveBeenLastCalledWith('1997-11-08');
  });

  test('ProgressBar limita valores fuera de rango', () => {
    const { getByRole, rerender } = render(<ProgressBar percent={140} exceeded />);
    expect(getByRole('progressbar').props.accessibilityValue.now).toBe(100);
    rerender(<ProgressBar percent={-40} />);
    expect(getByRole('progressbar').props.accessibilityValue.now).toBe(0);
    rerender(<ProgressBar percent={Number.NaN} />);
    expect(getByRole('progressbar').props.accessibilityValue.now).toBe(0);
  });
});
