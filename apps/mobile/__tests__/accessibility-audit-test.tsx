import fs from 'fs';
import path from 'path';
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { Button } from '../src/components/Button';
import { Chip } from '../src/components/Chip';
import { ErrorText } from '../src/components/ErrorText';
import { IconLabel } from '../src/components/IconLabel';
import { colors, minTouchSize } from '../src/theme';

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return { Ionicons: ({ name }: { name: string }) => React.createElement(Text, null, name) };
});

const root = path.resolve(__dirname, '..');

function listSources(dir: string): string[] {
  return fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((entry) => {
    const relative = path.join(dir, entry.name);
    if (entry.isDirectory()) return listSources(relative);
    return relative.endsWith('.tsx') ? [relative] : [];
  });
}

const screens = [...listSources('app'), ...listSources('src')];
const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');

/** Devuelve el texto de cada etiqueta de apertura `<Tag ...>` respetando llaves anidadas. */
function openingTags(source: string, tag: string): string[] {
  const tags: string[] = [];
  const needle = `<${tag}`;
  let from = 0;
  for (;;) {
    const start = source.indexOf(needle, from);
    if (start === -1) return tags;
    const next = source[start + needle.length];
    from = start + needle.length;
    if (next !== ' ' && next !== '\n' && next !== '>' && next !== '/') continue;
    // `useRef<TextInput>` y otros genéricos no son etiquetas JSX.
    if (/[A-Za-z0-9_]/.test(source[start - 1] ?? '')) continue;

    let depth = 0;
    let index = start + needle.length;
    for (; index < source.length; index += 1) {
      const char = source[index];
      if (char === '{') depth += 1;
      else if (char === '}') depth -= 1;
      else if (char === '>' && depth === 0 && source[index - 1] !== '=') break;
    }
    tags.push(source.slice(start, index + 1));
  }
}

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(foreground: string, background: string): number {
  const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}

describe('Auditoría estática de accesibilidad', () => {
  test('hay pantallas y componentes que auditar', () => {
    expect(screens.length).toBeGreaterThan(20);
  });

  test.each(screens)('%s: todo <Pressable> declara accessibilityRole', (file) => {
    const missing = openingTags(read(file), 'Pressable').filter((tag) => !tag.includes('accessibilityRole'));
    expect(missing).toEqual([]);
  });

  test.each(screens)('%s: todo <TextInput> tiene etiqueta accesible o la recibe por props', (file) => {
    const source = read(file);
    const inputs = openingTags(source, 'TextInput');
    const unlabeled = inputs.filter((tag) => !tag.includes('accessibilityLabel') && !tag.includes('{...'));
    expect(unlabeled).toEqual([]);
  });

  test.each(screens)('%s: toda <Image> tiene accessibilityLabel', (file) => {
    const missing = openingTags(read(file), 'Image').filter((tag) => !tag.includes('accessibilityLabel'));
    expect(missing).toEqual([]);
  });

  test.each(screens)('%s: no usa colores hexadecimales fuera de src/theme.ts', (file) => {
    expect(read(file).match(/['"]#[0-9a-fA-F]{6,8}['"]/g) ?? []).toEqual([]);
  });

  test.each(screens)('%s: no usa emojis como iconos', (file) => {
    const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}]/u;
    const offenders = read(file).split('\n').filter((line) => emoji.test(line));
    expect(offenders).toEqual([]);
  });

  test.each(screens)('%s: ningún texto declara menos de 12 px', (file) => {
    const small = (read(file).match(/fontSize:\s*(\d+)/g) ?? []).filter((match) => Number(match.replace(/\D/g, '')) < 12);
    expect(small).toEqual([]);
  });

  test('los mensajes de error se anuncian con liveRegion', () => {
    const offenders = screens.filter((file) => {
      const source = read(file);
      return /<Text[^>]*styles\.error/.test(source) && !/<Text[^>]*accessibilityLiveRegion[^>]*styles\.error/.test(source);
    });
    expect(offenders).toEqual([]);
  });
});

describe('Contraste WCAG AA de la paleta neón', () => {
  const textPairs: [keyof typeof colors, keyof typeof colors][] = [
    ['text', 'background'],
    ['textSoft', 'background'],
    ['textSecondary', 'background'],
    ['textMuted', 'background'],
    ['textMuted', 'surface'],
    ['placeholder', 'fieldSurface'],
    ['text', 'fieldSurface'],
    ['primary', 'background'],
    ['primary', 'surface'],
    ['primary', 'buttonDeep'],
    ['text', 'buttonDeep'],
    ['onPrimary', 'primary'],
    ['danger', 'background'],
    ['danger', 'surface'],
    ['dangerText', 'dangerSurface'],
    ['warning', 'surface'],
    ['text', 'chipSurface'],
  ];

  test.each(textPairs)('%s sobre %s alcanza 4.5:1', (foreground, background) => {
    expect(contrast(colors[foreground], colors[background])).toBeGreaterThanOrEqual(4.5);
  });

  test('el borde de los campos es distinguible del fondo y del relleno (3:1, WCAG 1.4.11)', () => {
    expect(contrast(colors.fieldBorder, colors.background)).toBeGreaterThanOrEqual(3);
    expect(contrast(colors.fieldBorder, colors.fieldSurface)).toBeGreaterThanOrEqual(3);
    expect(contrast(colors.primary, colors.background)).toBeGreaterThanOrEqual(3);
  });
});

describe('Semántica de componentes compartidos', () => {
  test('Button es táctil (≥ 44 px) y expone estado busy/disabled', () => {
    const view = render(<Button label="Guardar" loading onPress={jest.fn()} />);
    const button = view.getByRole('button', { name: 'Guardar' });
    expect(button.props.accessibilityState).toMatchObject({ busy: true, disabled: true });
    const flat = Object.assign({}, ...[button.props.style].flat(2).filter(Boolean));
    expect(flat.minHeight).toBeGreaterThanOrEqual(minTouchSize - 4);
  });

  test('Button con icono mantiene una sola etiqueta accesible', () => {
    const onPress = jest.fn();
    const view = render(<Button icon="lock-closed-outline" label="Premium · Meal Photo" onPress={onPress} />);
    fireEvent.press(view.getByRole('button', { name: 'Premium · Meal Photo' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('Chip anuncia si está seleccionado', () => {
    const view = render(<Chip label="Desayuno" onPress={jest.fn()} selected />);
    expect(view.getByRole('button', { name: 'Desayuno' }).props.accessibilityState).toMatchObject({ selected: true });
  });

  test('ErrorText se anuncia como alerta', () => {
    const view = render(<ErrorText>No fue posible guardar.</ErrorText>);
    const alert = view.getByRole('alert');
    expect(alert.props.accessibilityLiveRegion).toBe('polite');
  });

  test('IconLabel oculta el icono decorativo y marca encabezados', () => {
    const view = render(<IconLabel header icon="water-outline" label="Hidratación diaria" />);
    expect(view.getByRole('header')).toBeTruthy();
    expect(view.getByText('Hidratación diaria')).toBeTruthy();
    // El icono queda fuera del árbol de accesibilidad: solo se lee el texto.
    expect(view.UNSAFE_getAllByProps({ importantForAccessibility: 'no-hide-descendants' })).not.toHaveLength(0);
  });
});
