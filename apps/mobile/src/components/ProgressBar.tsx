import { StyleSheet, View } from 'react-native';

import { colors, radius } from '../theme';

type Props = {
  /** Porcentaje 0-100 (valores mayores se limitan al 100 %). */
  percent: number;
  /** Color de la barra cuando se supera el objetivo. */
  exceeded?: boolean;
};

export function ProgressBar({ percent, exceeded = false }: Props) {
  const value = Math.max(0, Math.min(100, Number.isFinite(percent) ? percent : 0));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ max: 100, min: 0, now: Math.round(value) }}
      style={styles.track}
    >
      <View style={[styles.fill, { width: `${value}%` }, exceeded && styles.exceeded]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { backgroundColor: colors.border, borderRadius: radius.pill, height: 8, overflow: 'hidden' },
  fill: { backgroundColor: colors.primary, borderRadius: radius.pill, height: '100%' },
  exceeded: { backgroundColor: colors.danger },
});
