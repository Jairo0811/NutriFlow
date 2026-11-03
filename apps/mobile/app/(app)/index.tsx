import { Ionicons } from '@expo/vector-icons';
import { Redirect, router, type Href } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Screen } from '../../src/components/Screen';
import { useAuth } from '../../src/features/auth/AuthProvider';
import { colors, radius, spacing, typography } from '../../src/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];
type MenuItem = { label: string; detail: string; icon: IconName; href: Href };

const sections: { title: string; items: MenuItem[] }[] = [
  {
    title: 'Registrar',
    items: [
      { label: 'Diario de comidas', detail: 'Agrega y revisa lo que comes', icon: 'restaurant-outline', href: '/meals' },
      { label: 'Escanear código de barras', detail: 'Encuentra un producto con la cámara', icon: 'barcode-outline', href: '/scanner' },
      { label: 'Catálogo de alimentos', detail: 'Busca alimentos y porciones', icon: 'search-outline', href: '/foods' },
    ],
  },
  {
    title: 'Asistente y análisis',
    items: [
      { label: 'NutriFlow AI', detail: 'Coach, foto de comida y voz', icon: 'sparkles-outline', href: '/ai' },
      { label: 'Analíticas premium', detail: 'Tendencias de 7, 30 y 90 días', icon: 'stats-chart-outline', href: '/analytics' },
      { label: 'Hábitos y recetas', detail: 'Agua, rachas y recetas', icon: 'water-outline', href: '/engagement' },
      { label: 'Mi progreso', detail: 'Historial de peso', icon: 'trending-down-outline', href: '/progress' },
    ],
  },
  {
    title: 'Mi perfil',
    items: [
      { label: 'Objetivos nutricionales', detail: 'Calorías y macros diarios', icon: 'flag-outline', href: '/targets' },
      { label: 'Alergias y preferencias', detail: 'Restricciones alimentarias', icon: 'shield-checkmark-outline', href: '/preferences' },
      { label: 'Perfil nutricional', detail: 'Datos, actividad y meta', icon: 'person-outline', href: '/onboarding' },
    ],
  },
];

export default function AuthenticatedHomeScreen() {
  const { session, isLoading, logout } = useAuth();

  if (!isLoading && !session) return <Redirect href="/login" />;

  return (
    <Screen
      eyebrow="NUTRIFLOW"
      subtitle="Controla tu nutrición, construye hábitos y analiza tendencias desde un solo lugar."
      title={`Hola, ${session?.displayName ?? 'NutriFlow'}`}
      withTopInset
    >
      <Button label="Ver mi día" onPress={() => router.push('/dashboard')} style={styles.cta} />

      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>{section.title}</Text>
          <Card style={styles.list}>
            {section.items.map((item, index) => (
              <Pressable
                accessibilityHint={item.detail}
                accessibilityLabel={item.label}
                accessibilityRole="button"
                key={item.label}
                onPress={() => router.push(item.href)}
                style={({ pressed }) => [styles.row, index > 0 && styles.rowDivider, pressed && styles.pressed]}
              >
                <View style={styles.iconBadge}>
                  <Ionicons color={colors.primary} name={item.icon} size={20} />
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  <Text style={typography.caption}>{item.detail}</Text>
                </View>
                <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
              </Pressable>
            ))}
          </Card>
        </View>
      ))}

      <Text style={styles.account}>{session?.email}</Text>
      <Button label="Cerrar sesión" onPress={() => void logout()} variant="secondary" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  cta: { marginTop: spacing.xl },
  section: { marginTop: spacing.xl },
  sectionTitle: { ...typography.heading, fontSize: 18, marginBottom: spacing.sm + 2 },
  list: { padding: 0, overflow: 'hidden' },
  row: { alignItems: 'center', flexDirection: 'row', gap: spacing.md, minHeight: 64, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  rowDivider: { borderTopColor: colors.border, borderTopWidth: 1 },
  pressed: { backgroundColor: colors.surfaceRaised },
  iconBadge: {
    alignItems: 'center',
    backgroundColor: '#17331D',
    borderColor: colors.borderAccent,
    borderRadius: radius.sm - 1,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  rowText: { flex: 1, gap: 2 },
  rowLabel: { color: colors.text, fontSize: 15, fontWeight: '800' },
  account: { ...typography.caption, marginBottom: spacing.sm + 2, marginTop: spacing.xl, textAlign: 'center' },
});
