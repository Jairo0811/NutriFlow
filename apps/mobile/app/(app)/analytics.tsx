import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../src/features/auth/AuthProvider';
import {
  AnalyticsApiError,
  analyticsApi,
  type AdvancedAnalytics,
  type MicronutrientAnalytics,
} from '../../src/features/analytics/api';

type Period = 7 | 30 | 90;

export default function PremiumAnalyticsScreen() {
  const { session } = useAuth();
  const [period, setPeriod] = useState<Period>(30);
  const [advanced, setAdvanced] = useState<AdvancedAnalytics | null>(null);
  const [micros, setMicros] = useState<MicronutrientAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    const accessToken = session.accessToken;
    setLoading(true);
    setLocked(false);
    setError(null);

    void (async () => {
      try {
        const advancedResult = await analyticsApi.getAdvanced(accessToken, period);
        const micronutrientResult = await analyticsApi.getMicronutrients(accessToken, period);
        setAdvanced(advancedResult);
        setMicros(micronutrientResult);
      } catch (cause) {
        setAdvanced(null);
        setMicros(null);
        if (cause instanceof AnalyticsApiError && cause.status === 403 && cause.code === 'premium_required') {
          setLocked(true);
        } else {
          setError(cause instanceof Error ? cause.message : 'No fue posible cargar la analítica.');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [period, session]);

  if (!session) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable onPress={() => router.back()}><Text style={styles.back}>Atrás</Text></Pressable>
        <Text style={styles.eyebrow}>NUTRIFLOW PREMIUM · v1.3</Text>
        <Text style={styles.title}>Analítica avanzada</Text>
        <Text style={styles.subtitle}>
          Tendencias de adherencia, consistencia, calorías, macros y micronutrientes calculadas desde tu historial real.
        </Text>

        <View style={styles.periodRow}>
          {([7, 30, 90] as const).map((value) => (
            <Pressable key={value} onPress={() => setPeriod(value)} style={[styles.periodButton, period === value && styles.periodButtonActive]}>
              <Text style={[styles.periodText, period === value && styles.periodTextActive]}>{value} días</Text>
            </Pressable>
          ))}
        </View>

        {loading && <Text style={styles.helper}>Calculando tendencias…</Text>}
        {error && <Text style={styles.error}>{error}</Text>}

        {locked && (
          <View style={styles.premiumCard}>
            <Text style={styles.premiumBadge}>PREMIUM</Text>
            <Text style={styles.premiumTitle}>Desbloquea tu historial inteligente</Text>
            <Text style={styles.helper}>
              Esta vista requiere NutriFlow Premium. El backend protege los datos mediante los entitlements analytics.advanced y nutrition.micronutrients.
            </Text>
            <View style={styles.featureList}>
              <Text style={styles.feature}>✓ Tendencias de 7, 30 y 90 días</Text>
              <Text style={styles.feature}>✓ Adherencia calórica y objetivo de proteína</Text>
              <Text style={styles.feature}>✓ Fibra, sodio, potasio, calcio y hierro</Text>
              <Text style={styles.feature}>✓ Vitaminas C y D</Text>
            </View>
            <Text style={styles.note}>Las compras reales se habilitarán cuando el proveedor de billing sea conectado.</Text>
          </View>
        )}

        {advanced && micros && (
          <>
            <View style={styles.grid}>
              <Metric label="Días registrados" value={`${advanced.loggedDays}/${advanced.periodDays}`} />
              <Metric label="Consistencia" value={`${advanced.loggingRatePercent.toFixed(1)}%`} />
              <Metric label="Promedio kcal" value={Math.round(advanced.averageCalories).toString()} />
              <Metric label="Adherencia" value={advanced.calorieAdherencePercent == null ? '—' : `${advanced.calorieAdherencePercent.toFixed(1)}%`} />
            </View>

            <Text style={styles.sectionTitle}>Promedios de macros</Text>
            <View style={styles.card}>
              <Row label="Proteína" value={`${advanced.averageProteinGrams.toFixed(1)} g`} />
              <Row label="Carbohidratos" value={`${advanced.averageCarbohydrateGrams.toFixed(1)} g`} />
              <Row label="Grasas" value={`${advanced.averageFatGrams.toFixed(1)} g`} />
              <Row label="Días con objetivo de proteína" value={advanced.proteinTargetHitRatePercent == null ? '—' : `${advanced.proteinTargetHitRatePercent.toFixed(1)}%`} />
            </View>

            <Text style={styles.sectionTitle}>Micronutrientes · promedio diario registrado</Text>
            <View style={styles.card}>
              <Row label="Fibra" value={`${micros.averageFiberGrams.toFixed(1)} g`} />
              <Row label="Sodio" value={`${micros.averageSodiumMilligrams.toFixed(0)} mg`} />
              <Row label="Potasio" value={`${micros.averagePotassiumMilligrams.toFixed(0)} mg`} />
              <Row label="Calcio" value={`${micros.averageCalciumMilligrams.toFixed(0)} mg`} />
              <Row label="Hierro" value={`${micros.averageIronMilligrams.toFixed(1)} mg`} />
              <Row label="Vitamina C" value={`${micros.averageVitaminCMilligrams.toFixed(1)} mg`} />
              <Row label="Vitamina D" value={`${micros.averageVitaminDMicrograms.toFixed(1)} µg`} />
            </View>

            <Text style={styles.sectionTitle}>Actividad reciente</Text>
            {advanced.daily.slice(-7).reverse().map((point) => (
              <View key={point.date} style={styles.dayRow}>
                <Text style={styles.dayDate}>{point.date}</Text>
                <Text style={styles.dayValue}>{Math.round(point.calories)} kcal · {point.proteinGrams.toFixed(0)} g proteína</Text>
              </View>
            ))}
            <Text style={styles.note}>Los resultados son métricas de seguimiento y no sustituyen una evaluación profesional.</Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#07110B' },
  container: { padding: 24, paddingBottom: 48 },
  back: { color: '#DDE5DF', fontWeight: '700' },
  eyebrow: { color: '#62E62C', fontSize: 12, fontWeight: '800', letterSpacing: 1.4, marginTop: 30 },
  title: { color: '#F6FAF7', fontSize: 32, fontWeight: '900', marginTop: 10 },
  subtitle: { color: '#95A59B', fontSize: 15, lineHeight: 23, marginTop: 10 },
  periodRow: { flexDirection: 'row', gap: 8, marginTop: 22 },
  periodButton: { backgroundColor: '#101C14', borderColor: '#31533A', borderRadius: 12, borderWidth: 1, paddingHorizontal: 15, paddingVertical: 10 },
  periodButtonActive: { backgroundColor: '#62E62C', borderColor: '#62E62C' },
  periodText: { color: '#DDE5DF', fontWeight: '800' },
  periodTextActive: { color: '#07110B' },
  helper: { color: '#95A59B', fontSize: 14, lineHeight: 21, marginTop: 12 },
  error: { color: '#FF8E8E', marginTop: 18 },
  premiumCard: { backgroundColor: '#101C14', borderColor: '#62E62C', borderRadius: 20, borderWidth: 1, marginTop: 24, padding: 20 },
  premiumBadge: { alignSelf: 'flex-start', backgroundColor: '#62E62C', borderRadius: 999, color: '#07110B', fontSize: 11, fontWeight: '900', overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 5 },
  premiumTitle: { color: '#F6FAF7', fontSize: 22, fontWeight: '900', marginTop: 14 },
  featureList: { gap: 8, marginTop: 18 },
  feature: { color: '#DDE5DF', fontSize: 14, fontWeight: '700' },
  note: { color: '#6F8075', fontSize: 12, lineHeight: 18, marginTop: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 24 },
  metric: { backgroundColor: '#101C14', borderColor: '#223228', borderRadius: 16, borderWidth: 1, minWidth: '47%', padding: 16 },
  metricValue: { color: '#62E62C', fontSize: 23, fontWeight: '900' },
  metricLabel: { color: '#95A59B', fontSize: 12, marginTop: 5 },
  sectionTitle: { color: '#F6FAF7', fontSize: 19, fontWeight: '900', marginTop: 28 },
  card: { backgroundColor: '#101C14', borderColor: '#223228', borderRadius: 18, borderWidth: 1, marginTop: 12, padding: 16 },
  row: { borderBottomColor: '#223228', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  rowLabel: { color: '#95A59B', flex: 1 },
  rowValue: { color: '#F6FAF7', fontWeight: '800' },
  dayRow: { backgroundColor: '#101C14', borderRadius: 12, marginTop: 8, padding: 14 },
  dayDate: { color: '#DDE5DF', fontWeight: '800' },
  dayValue: { color: '#95A59B', fontSize: 13, marginTop: 4 },
});
