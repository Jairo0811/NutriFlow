import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
};

export function AuthButton({ label, onPress, loading = false, disabled = false, variant = 'primary' }: Props) {
  const unavailable = disabled || loading;
  const secondary = variant === 'secondary';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={unavailable}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary ? styles.secondary : styles.primary,
        unavailable && styles.disabled,
        pressed && !unavailable && styles.pressed,
      ]}
    >
      {loading
        ? <ActivityIndicator color={secondary ? '#62E62C' : '#07110B'} />
        : <Text style={[styles.label, secondary && styles.secondaryLabel]}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 14,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 16,
  },
  primary: { backgroundColor: '#62E62C' },
  secondary: { backgroundColor: '#101C14', borderColor: '#2B3D31', borderWidth: 1 },
  label: { color: '#07110B', fontSize: 16, fontWeight: '800' },
  secondaryLabel: { color: '#E7EEE9' },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.82 },
});
