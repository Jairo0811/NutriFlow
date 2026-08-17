import type { ComponentProps } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

type Props = ComponentProps<typeof TextInput> & {
  label: string;
};

export function AuthField({ label, ...inputProps }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...inputProps}
        autoCapitalize={inputProps.autoCapitalize ?? 'none'}
        placeholderTextColor="#66736B"
        selectionColor="#62E62C"
        style={[styles.input, inputProps.style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 7 },
  label: { color: '#DDE5DF', fontSize: 14, fontWeight: '600' },
  input: {
    backgroundColor: '#101C14',
    borderColor: '#223228',
    borderRadius: 14,
    borderWidth: 1,
    color: '#F6FAF7',
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 16,
  },
});
