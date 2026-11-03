import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, minTouchSize, radius, spacing, typography } from '../theme';

type Props = {
  label: string;
  /** Fecha en formato AAAA-MM-DD, o cadena vacía si está incompleta. */
  value: string;
  onChange: (isoDate: string) => void;
  error?: string | null;
};

type Parts = { day: string; month: string; year: string };

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

function compose({ day, month, year }: Parts): string {
  if (year.length !== 4 || !day || !month) return '';
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

const digits = (text: string, max: number) => text.replace(/\D/g, '').slice(0, max);

/** Fecha en tres casillas (DD / MM / AAAA) con salto automático; evita teclear guiones. */
export function DateField({ label, value, onChange, error }: Props) {
  const [parts, setParts] = useState<Parts>({ day: '', month: '', year: '' });
  const monthRef = useRef<TextInput>(null);
  const yearRef = useRef<TextInput>(null);

  // Sincroniza cuando el valor llega desde fuera (p. ej. al cargar el perfil guardado).
  useEffect(() => {
    const match = ISO_DATE.exec(value);
    if (!match) return;
    setParts((current) => (compose(current) === value ? current : { year: match[1], month: match[2], day: match[3] }));
  }, [value]);

  function update(next: Partial<Parts>) {
    const merged = { ...parts, ...next };
    setParts(merged);
    onChange(compose(merged));
  }

  return (
    <View style={styles.container}>
      <Text style={typography.label}>{label}</Text>
      <View style={styles.row}>
        <TextInput
          accessibilityLabel={`${label}, día`}
          keyboardType="number-pad"
          maxLength={2}
          onChangeText={(text) => {
            const day = digits(text, 2);
            update({ day });
            if (day.length === 2) monthRef.current?.focus();
          }}
          placeholder="DD"
          placeholderTextColor={colors.placeholder}
          selectionColor={colors.primary}
          style={[styles.input, styles.small, error ? styles.invalid : null]}
          value={parts.day}
        />
        <Text style={styles.separator}>/</Text>
        <TextInput
          accessibilityLabel={`${label}, mes`}
          keyboardType="number-pad"
          maxLength={2}
          onChangeText={(text) => {
            const month = digits(text, 2);
            update({ month });
            if (month.length === 2) yearRef.current?.focus();
          }}
          placeholder="MM"
          placeholderTextColor={colors.placeholder}
          ref={monthRef}
          selectionColor={colors.primary}
          style={[styles.input, styles.small, error ? styles.invalid : null]}
          value={parts.month}
        />
        <Text style={styles.separator}>/</Text>
        <TextInput
          accessibilityLabel={`${label}, año`}
          keyboardType="number-pad"
          maxLength={4}
          onChangeText={(text) => update({ year: digits(text, 4) })}
          placeholder="AAAA"
          placeholderTextColor={colors.placeholder}
          ref={yearRef}
          selectionColor={colors.primary}
          style={[styles.input, styles.large, error ? styles.invalid : null]}
          value={parts.year}
        />
      </View>
      {error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 7 },
  row: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.borderInput,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    minHeight: minTouchSize + 4,
    paddingHorizontal: spacing.md,
    textAlign: 'center',
  },
  small: { flex: 1 },
  large: { flex: 1.6 },
  invalid: { borderColor: colors.danger },
  separator: { color: colors.textMuted, fontSize: 18 },
  error: { color: colors.danger, fontSize: 13, lineHeight: 18 },
});
