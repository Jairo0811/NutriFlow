import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, spacing } from '../theme';

type Props = PropsWithChildren<{
  /** `raised` resalta tarjetas principales (resumen, hero). */
  variant?: 'default' | 'raised';
  style?: StyleProp<ViewStyle>;
}>;

export function Card({ variant = 'default', style, children }: Props) {
  return <View style={[styles.card, variant === 'raised' && styles.raised, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg + 2,
  },
  raised: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.borderAccent,
    borderRadius: radius.xl,
    padding: spacing.xl,
  },
});
