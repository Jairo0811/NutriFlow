import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { colors } from '../theme';

type Props = {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  /** Color del icono; el texto usa `textStyle`. */
  iconColor?: string;
  size?: number;
  /** Marca el texto como encabezado para lectores de pantalla. */
  header?: boolean;
  textStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
};

/** Icono decorativo + texto. Sustituye a los emojis, que se ven distinto en cada plataforma. */
export function IconLabel({ icon, label, iconColor = colors.primary, size = 20, header = false, textStyle, style }: Props) {
  return (
    <View style={[styles.row, style]}>
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Ionicons color={iconColor} name={icon} size={size} />
      </View>
      <Text accessibilityRole={header ? 'header' : undefined} style={[styles.text, textStyle]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  text: { color: colors.text, flexShrink: 1 },
});
