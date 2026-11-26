import { Screen } from '../../src/components/Screen';
import { useEffect, useState } from 'react';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { toUserFacingError } from '../../src/features/shared/errors';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../../src/features/auth/AuthProvider';
import {
  AnalyticsApiError,
  analyticsApi,
  type AdvancedAnalytics,
  type MicronutrientAnalytics,
} from '../../src/features/analytics/api';
import { IconLabel } from '../../src/components/IconLabel';
import { colors } from '../../src/theme';
import { ErrorText } from '../../src/components/ErrorText';

type Period = 7 | 30 | 90;

export default function PremiumAnalyticsScreen() {
  const { session } = useAuth();
  const [period, setPeriod] = useState<Period>(30);
  const [advanced, setAdvanced] = useState<AdvancedAnalytics | null>(null);
  const [micros, setMicros] = useState<MicronutrientAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!session) return;
    const accessToken = session.accessToken;
    let active = true;
    setLoading(true);
    setLocked(false);
    setAdvanced(null);
    setMicros(null);
    setError(null);

    void (async () => {
      try {
        const advancedResult = await analyticsApi.getAdvanced(accessToken, period);
        const micronutrientResult = await analyticsApi.getMicronutrients(accessToken, period);
        if (!active) return;
        setAdvanced(advancedResult);
        setMicros(micronutrientResult);
      } catch (cause) {
        if (!active) return;
        setAdvanced(null);
        setMicros(null);
        if (cause instanceof AnalyticsApiError && cause.status === 403 && cause.code === 'premium_required') {
          setLocked(true);
        } else {
          setError(toUserFacingError(cause, 'No fue posible cargar la analítica.'));
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [period, session, reload]);

  if (!session) return null;

  return (
    <Screen eyebrow="NUTRIFLOW · PREMIUM" title="Analítica avanzada" subtitle="Tendencias de calorías, macronutrientes y micronutrientes." onRefresh={() => setReload((n) => n + 1)} refreshing={loading}>
        

        <View style={styles.periodRow}>
          {([7, 30, 90] as const).map((value) => (
            <Pressable accessibilityRole="button" key={value} accessibilityState={{ selected: period === value }} onPress={() => setPeriod(value)} style={[styles.periodButton, period === value && styles.periodButtonActive]}>
              <Text style={[styles.periodText, period === value && styles.periodTextActive]}>{value} días</Text>
            </Pressable>
          ))}
        </View>

        {loading && <Text style={styles.helper}>Calculando tendencias…</Text>}
        {error && <Card><ErrorText style={styles.error}>{error}</ErrorText><Button label="Reintentar" variant="secondary" onPress={() => setReload((n) => n + 1)} /></Card>}

        {locked && (
          <View style={styles.premiumCard}>
            <Text style={styles.premiumBadge}>PREMIUM</Text>
            <Text style={styles.premiumTitle}>Desbloquea tu historial inteligente</Text>
            <Text style={styles.helper}>
              Esta vista requiere NutriFlow Premium. El backend protege los datos mediante los entitlements analytics.advanced y nutrition.micronutrients.
            </Text>
            <View style={styles.featureList}>
              <IconLabel icon="checkmark-circle-outline" label="Tendencias de 7, 30 y 90 días" size={18} textStyle={styles.feature} />
              <IconLabel icon="checkmark-circle-outline" label="Adherencia calórica y objetivo de proteína" size={18} textStyle={styles.feature} />
              <IconLabel icon="checkmark-circle-outline" label="Fibra, sodio, potasio, calcio y hierro" size={18} textStyle={styles.feature} />
              <IconLabel icon="checkmark-circle-outline" label="Vitaminas C y D" size={18} textStyle={styles.feature} />
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
      </Screen>
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
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: 24, paddingBottom: 48 },
  back: { color: colors.textSoft, fontWeight: '700' },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: '800', letterSpacing: 1.4, marginTop: 30 },
  title: { color: colors.text, fontSize: 32, fontWeight: '900', marginTop: 10 },
  subtitle: { color: colors.textSecondary, fontSize: 15, lineHeight: 23, marginTop: 10 },
  periodRow: { flexDirection: 'row', gap: 8, marginTop: 22 },
  periodButton: { backgroundColor: colors.surface, borderColor: colors.borderAccent, borderRadius: 12, borderWidth: 1, paddingHorizontal: 15, paddingVertical: 10 },
  periodButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  periodText: { color: colors.textSoft, fontWeight: '800' },
  periodTextActive: { color: colors.background },
  helper: { color: colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: 12 },
  error: { color: colors.danger, marginTop: 18 },
  premiumCard: { backgroundColor: colors.surface, borderColor: colors.primary, borderRadius: 20, borderWidth: 1, marginTop: 24, padding: 20 },
  premiumBadge: { alignSelf: 'flex-start', backgroundColor: colors.primary, borderRadius: 999, color: colors.background, fontSize: 12, fontWeight: '900', overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 5 },
  premiumTitle: { color: colors.text, fontSize: 22, fontWeight: '900', marginTop: 14 },
  featureList: { gap: 8, marginTop: 18 },
  feature: { color: colors.textSoft, fontSize: 14, fontWeight: '700' },
  note: { color: colors.textMuted, fontSize: 13, lineHeight: 18, marginTop: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 24 },
  metric: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, minWidth: '47%', padding: 16 },
  metricValue: { color: colors.primary, fontSize: 23, fontWeight: '900' },
  metricLabel: { color: colors.textSecondary, fontSize: 13, marginTop: 5 },
  sectionTitle: { color: colors.text, fontSize: 19, fontWeight: '900', marginTop: 28 },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 18, borderWidth: 1, marginTop: 12, padding: 16 },
  row: { borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  rowLabel: { color: colors.textSecondary, flex: 1 },
  rowValue: { color: colors.text, fontWeight: '800' },
  dayRow: { backgroundColor: colors.surface, borderRadius: 12, marginTop: 8, padding: 14 },
  dayDate: { color: colors.textSoft, fontWeight: '800' },
  dayValue: { color: colors.textSecondary, fontSize: 13, marginTop: 4 },
});
