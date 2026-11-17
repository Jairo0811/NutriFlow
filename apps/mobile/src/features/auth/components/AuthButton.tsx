import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { Button } from '../../../components/Button';
import { colors } from '../../../theme';

type IconName = ComponentProps<typeof Ionicons>['name'];
type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  featured?: boolean;
  icon?: IconName;
};

export function AuthButton({ featured = false, icon, label, loading = false, disabled = false, onPress, variant = 'primary' }: Props) {
  if (!featured) return <Button label={label} loading={loading} disabled={disabled} onPress={onPress} variant={variant} />;

  const inactive = disabled || loading;
  const secondary = variant === 'secondary';
  const foreground = secondary ? colors.text : colors.onPrimary;

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base, secondary ? styles.secondary : styles.primary,
        inactive && styles.disabled, pressed && !inactive && styles.pressed,
      ]}
    >
      {loading ? <ActivityIndicator color={foreground} /> : (
        <>
          {icon ? <Ionicons name={icon} color={secondary ? colors.primary : foreground} size={22} /> : null}
          <Text style={[styles.label, secondary && styles.secondaryLabel]}>{label}</Text>
          {!secondary ? <Ionicons name="arrow-forward" color={foreground} size={23} /> : null}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center', borderRadius: 999, flexDirection: 'row', gap: 10,
    justifyContent: 'center', minHeight: 62, paddingHorizontal: 16,
  },
  primary: {
    backgroundColor: '#8CF52B', borderColor: '#B7FF6C', borderWidth: 1,
    elevation: 3, shadowColor: '#62E62C', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12,
  },
  secondary: { backgroundColor: '#09130C', borderColor: colors.primary, borderWidth: 1.5 },
  label: { color: colors.onPrimary, fontSize: 18, fontWeight: '800' },
  secondaryLabel: { color: colors.text, fontSize: 17 },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.84 },
});
