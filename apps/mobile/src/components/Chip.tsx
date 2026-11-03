import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, minTouchSize, radius, spacing } from '../theme';

type Props = {
  label: string;
  selected?: boolean;
  onPress: () => void;
  icon?: ComponentProps<typeof Ionicons>['name'];
};

export function Chip({ label, selected = false, onPress, icon }: Props) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.selected]}
    >
      <View style={styles.content}>
        {icon ? <Ionicons color={selected ? colors.primary : colors.textSoft} name={icon} size={18} /> : null}
        <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.borderInput,
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: minTouchSize - 4,
    paddingHorizontal: spacing.lg - 2,
  },
  selected: { backgroundColor: colors.surfaceRaised, borderColor: colors.primary },
  content: { alignItems: 'center', flexDirection: 'row', gap: 7 },
  label: { color: colors.text, fontWeight: '700' },
  selectedLabel: { color: colors.primary },
});
