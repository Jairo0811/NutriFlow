import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { colors, neonGlow, radius, spacing } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  accessibilityHint?: string;
  /** Icono decorativo a la izquierda del texto. */
  icon?: ComponentProps<typeof Ionicons>['name'];
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, onPress, variant = 'primary', loading = false, disabled = false, accessibilityHint, icon, style }: Props) {
  const unavailable = disabled || loading;
  const primary = variant === 'primary';

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: unavailable }}
      disabled={unavailable}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        unavailable && styles.disabled,
        pressed && !unavailable && styles.pressed,
        style,
      ]}
    >
      {loading
        ? <ActivityIndicator color={primary ? colors.onPrimary : colors.primary} />
        : (
          <>
            {icon ? <Ionicons color={primary ? colors.onPrimary : colors.primary} name={icon} size={20} /> : null}
            <Text style={[styles.label, primary ? styles.primaryLabel : styles.secondaryLabel]}>{label}</Text>
          </>
        )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    borderRadius: radius.pill,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: spacing.lg,
  },
  primary: { backgroundColor: colors.primary, borderColor: colors.primaryBorder, borderWidth: 1, ...neonGlow },
  secondary: { backgroundColor: colors.buttonDeep, borderColor: colors.primary, borderWidth: 1.5 },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.82 },
  label: { fontSize: 16, fontWeight: '800' },
  primaryLabel: { color: colors.onPrimary },
  secondaryLabel: { color: colors.text },
});
