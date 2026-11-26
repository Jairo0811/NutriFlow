import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

import { colors } from '../theme';

/** Mensaje de error que los lectores de pantalla anuncian al aparecer. */
export function ErrorText({ children, style }: PropsWithChildren<{ style?: StyleProp<TextStyle> }>) {
  return (
    <Text accessibilityLiveRegion="polite" accessibilityRole="alert" style={[styles.error, style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  error: { color: colors.danger, fontSize: 14, lineHeight: 20 },
});
