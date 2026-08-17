import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useAuth } from '../../src/features/auth/AuthProvider';
import { getDailyDashboard, type DailyDashboard, type MacroProgress } from '../../src/features/dashboard/api';

const today = new Date().toISOString().slice(0, 10);

export default function DashboardScreen() {
  const { session } = useAuth();
  const [data, setData] = useState<DailyDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.accessToken) return;
    getDailyDashboard(session.accessToken, today)
      .then(setData)
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'No fue posible cargar el dashboard.'));
  }, [session?.accessToken]);

  if (!session) return null;

  const macro = (label: string, value?: MacroProgress) => (
    <View style={styles.macroCard}>
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroValue}>{Math.round(value?.consumed ?? 0)} / {Math.round(value?.target ?? 0)} g</Text>
      <Text style={styles.macroRemaining}>{Math.round(value?.remaining ?? 0)} g restantes</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.eyebrow}>NUTRIFLOW · FASE 6</Text>
        <Text style={styles.title}>Tu día nutricional</Text>
        <Text style={styles.subtitle}>{today} · objetivos y consumo en una sola vista.</Text>

        <View style={styles.hero}>
          <Text style={styles.heroLabel}>Calorías restantes</Text>
          <Text style={styles.heroValue}>{Math.round(data?.remainingCalories ?? 0)}</Text>
          <Text style={styles.heroMeta}>{Math.round(data?.consumedCalories ?? 0)} consumidas de {Math.round(data?.targetCalories ?? 0)} kcal</Text>
        </View>

        <View style={styles.macroRow}>
          {macro('Proteína', data?.protein)}
          {macro('Carbohidratos', data?.carbohydrates)}
          {macro('Grasas', data?.fat)}
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable onPress={() => router.push('/meals')} style={styles.primaryButton}>
          <Text style={styles.primaryText}>Registrar comida</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/foods')} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Explorar alimentos</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#07110B' },
  container: { padding: 24, paddingBottom: 48 },
  eyebrow: { color: '#62E62C', fontSize: 12, fontWeight: '800', letterSpacing: 1.4 },
  title: { color: '#F6FAF7', fontSize: 34, fontWeight: '900', marginTop: 10 },
  subtitle: { color: '#95A59B', fontSize: 15, lineHeight: 23, marginTop: 8 },
  hero: { backgroundColor: '#132718', borderColor: '#31533A', borderWidth: 1, borderRadius: 24, padding: 24, marginTop: 24 },
  heroLabel: { color: '#95A59B', fontWeight: '700' },
  heroValue: { color: '#62E62C', fontSize: 52, fontWeight: '900', marginTop: 4 },
  heroMeta: { color: '#DDE5DF', marginTop: 6 },
  macroRow: { gap: 10, marginTop: 14 },
  macroCard: { backgroundColor: '#101C14', borderColor: '#223228', borderWidth: 1, borderRadius: 16, padding: 16 },
  macroLabel: { color: '#95A59B', fontWeight: '700' },
  macroValue: { color: '#F6FAF7', fontSize: 18, fontWeight: '900', marginTop: 5 },
  macroRemaining: { color: '#62E62C', marginTop: 4 },
  error: { color: '#FF8E8E', marginTop: 14 },
  primaryButton: { alignItems: 'center', backgroundColor: '#62E62C', borderRadius: 14, marginTop: 24, padding: 16 },
  primaryText: { color: '#07110B', fontWeight: '900' },
  secondaryButton: { alignItems: 'center', borderColor: '#36503E', borderRadius: 14, borderWidth: 1, marginTop: 12, padding: 16 },
  secondaryText: { color: '#DDE5DF', fontWeight: '800' },
});
