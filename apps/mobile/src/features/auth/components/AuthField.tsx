import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { Input } from '../../../components/Input';
import { colors } from '../../../theme';

type IconName = ComponentProps<typeof Ionicons>['name'];
type Props = ComponentProps<typeof Input> & {
  label: string;
  icon?: IconName;
  /** Conserva la etiqueta accesible aunque el título se sustituya por el placeholder. */
  featured?: boolean;
};

export function AuthField({ autoCapitalize, icon, featured = false, label, style, ...props }: Props) {
  return (
    <View style={styles.wrapper}>
      <Input
        {...props}
        accessibilityLabel={label}
        autoCapitalize={autoCapitalize ?? 'none'}
        label={featured ? undefined : label}
        style={[featured && styles.featuredInput, icon && styles.withIcon, style]}
      />
      {icon ? (
        <View pointerEvents="none" style={[styles.icon, !featured && styles.iconWithLabel]}>
          <Ionicons color={colors.textSoft} name={icon} size={21} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'relative' },
  featuredInput: {
    backgroundColor: '#151D1A', borderColor: '#3D4B41', borderRadius: 22,
    fontSize: 16, minHeight: 61,
  },
  withIcon: { paddingLeft: 54 },
  icon: { left: 18, position: 'absolute', top: 20 },
  iconWithLabel: { top: 44 },
});
