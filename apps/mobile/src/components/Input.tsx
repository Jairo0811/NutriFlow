import { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, minTouchSize, radius, spacing, typography } from '../theme';

type Props = TextInputProps & {
  label?: string;
  error?: string | null;
  containerStyle?: StyleProp<ViewStyle>;
};

/** Campo de texto con etiqueta, mensaje de error y mostrar/ocultar para contraseñas. */
export const Input = forwardRef<TextInput, Props>(function Input({ label, error, secureTextEntry, style, containerStyle, ...rest }, ref) {
  const [hidden, setHidden] = useState(true);
  const isPassword = Boolean(secureTextEntry);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={typography.label}>{label}</Text> : null}
      <View>
        <TextInput
          ref={ref}
          accessibilityLabel={label ?? rest.placeholder}
          placeholderTextColor={colors.placeholder}
          selectionColor={colors.primary}
          {...rest}
          secureTextEntry={isPassword && hidden}
          style={[styles.input, isPassword && styles.withToggle, error ? styles.invalid : null, style]}
        />
        {isPassword ? (
          <Pressable
            accessibilityLabel={hidden ? 'Mostrar contraseña' : 'Ocultar contraseña'}
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => setHidden((value) => !value)}
            style={styles.toggle}
          >
            <Ionicons color={colors.textSecondary} name={hidden ? 'eye-outline' : 'eye-off-outline'} size={22} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { gap: 7 },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.borderInput,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    minHeight: minTouchSize + 4,
    paddingHorizontal: spacing.lg,
  },
  withToggle: { paddingRight: 52 },
  invalid: { borderColor: colors.danger },
  toggle: { alignItems: 'center', bottom: 0, justifyContent: 'center', position: 'absolute', right: 0, top: 0, width: 48 },
  error: { color: colors.danger, fontSize: 13, lineHeight: 18 },
});
