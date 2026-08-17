import type { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = PropsWithChildren<{
  title: string;
  subtitle: string;
  footer?: ReactNode;
}>;

export function AuthScaffold({ title, subtitle, children, footer }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brandMark}>
          <Text style={styles.brandInitial}>N</Text>
        </View>
        <Text style={styles.brand}>NutriFlow</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <View style={styles.form}>{children}</View>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#07110B' },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  brandMark: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#62E62C',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  brandInitial: { color: '#07110B', fontSize: 28, fontWeight: '900' },
  brand: {
    alignSelf: 'center',
    color: '#62E62C',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 28,
    marginTop: 10,
  },
  title: { color: '#F6FAF7', fontSize: 30, fontWeight: '800' },
  subtitle: { color: '#95A59B', fontSize: 16, lineHeight: 23, marginTop: 8 },
  form: { gap: 14, marginTop: 28 },
  footer: { marginTop: 24 },
});
