import { Ionicons } from '@expo/vector-icons';
import type { PropsWithChildren, ReactNode } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../../../theme';

type Props = PropsWithChildren<{
  title: string;
  subtitle: string;
  footer?: ReactNode;
  /** Login destacado; el registro y recuperación siguen usando el formulario compartido. */
  featured?: boolean;
}>;

const features = [
  { icon: 'flame-outline', label: 'Calorías' },
  { icon: 'barbell-outline', label: 'Proteínas' },
  { icon: 'pie-chart-outline', label: 'Macros' },
] as const;

export function AuthScaffold({ title, subtitle, children, footer, featured = false }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View pointerEvents="none" style={styles.decoration}>
        <View style={styles.glowTop} />
        <View style={styles.orbitTop} />
        <View style={styles.glowBottom} />
        <Ionicons name="leaf-outline" size={124} color="#214927" style={styles.leaf} />
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.content, featured && styles.featuredContent]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.panel, featured && styles.featuredPanel]}>
            <View style={styles.brandGroup}>
              <Image
                accessible
                accessibilityLabel="Isotipo NutriFlow"
                source={require('../../../../assets/brand/nutriflow-mark.png')}
                resizeMode="contain"
                style={[styles.mark, featured ? styles.featuredMark : styles.compactMark]}
              />
              <Text style={[styles.wordmark, featured && styles.featuredWordmark]}>
                <Text style={styles.brandWhite}>Nutri</Text>
                <Text style={styles.brandGreen}>Flow</Text>
              </Text>
              {featured ? <Text style={styles.tagline}>{subtitle}</Text> : null}
            </View>
            {featured ? (
              <View style={styles.features} accessibilityLabel="Calorías, proteínas y macros">
                {features.map((feature) => (
                  <View key={feature.label} style={styles.chip}>
                    <Ionicons name={feature.icon} color={colors.primary} size={17} />
                    <Text style={styles.chipText}>{feature.label}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            <Text accessibilityRole="header" style={[styles.title, featured && styles.featuredTitle]}>{title}</Text>
            {!featured ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            <View style={[styles.form, featured && styles.featuredForm]}>{children}</View>
            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: '#040907' },
  decoration: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  glowTop: {
    backgroundColor: '#0E3015', borderRadius: 180, height: 340, left: -244,
    opacity: 0.75, position: 'absolute', top: -220, transform: [{ rotate: '-22deg' }], width: 440,
  },
  orbitTop: {
    borderColor: '#193A20', borderRadius: 140, borderWidth: 16,
    height: 250, opacity: 0.4, position: 'absolute', right: -162, top: 54, width: 250,
  },
  glowBottom: {
    backgroundColor: '#0B2D14', borderRadius: 220, bottom: -245,
    height: 355, left: -180, opacity: 0.75, position: 'absolute', width: 415,
  },
  leaf: { bottom: -24, opacity: 0.55, position: 'absolute', right: -18, transform: [{ rotate: '-34deg' }] },
  content: {
    alignItems: 'center', flexGrow: 1, justifyContent: 'center',
    paddingHorizontal: 22, paddingVertical: 28,
  },
  featuredContent: { paddingVertical: 18 },
  panel: { maxWidth: 460, width: '100%' },
  featuredPanel: { paddingBottom: 14 },
  brandGroup: { alignItems: 'center' },
  mark: { alignSelf: 'center' },
  compactMark: { height: 112, width: 112 },
  featuredMark: { height: 162, width: 162 },
  wordmark: { fontSize: 34, fontWeight: '900', letterSpacing: -1.3, marginTop: -2 },
  featuredWordmark: { fontSize: 43, letterSpacing: -1.7, marginTop: -3 },
  brandWhite: { color: '#FFFFFF' },
  brandGreen: { color: '#89F62A' },
  tagline: {
    color: colors.textSoft, fontSize: 15, lineHeight: 22, marginTop: 12,
    maxWidth: 310, textAlign: 'center',
  },
  features: { flexDirection: 'row', gap: 7, marginTop: 24 },
  chip: {
    alignItems: 'center', backgroundColor: '#142119', borderColor: '#1D3924',
    borderRadius: 22, borderWidth: 1, flex: 1, flexDirection: 'row', gap: 5,
    justifyContent: 'center', minHeight: 39, paddingHorizontal: 4,
  },
  chipText: { color: colors.text, fontSize: 12, fontWeight: '700' },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', marginTop: 22 },
  featuredTitle: { color: colors.textSoft, fontSize: 17, marginTop: 28, textAlign: 'center' },
  subtitle: { color: colors.textSecondary, fontSize: 15, lineHeight: 23, marginTop: 8 },
  form: { gap: 14, marginTop: 23 },
  featuredForm: { gap: 13, marginTop: 14 },
  footer: { marginTop: 24 },
});
