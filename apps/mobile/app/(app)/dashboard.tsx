import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { ProgressBar } from '../../src/components/ProgressBar';
import { Screen } from '../../src/components/Screen';
import { useAuth } from '../../src/features/auth/AuthProvider';
import { getDailyDashboard, type DailyDashboard, type MacroProgress } from '../../src/features/dashboard/api';
import { formatLongDate, useToday } from '../../src/features/shared/dates';
import { toUserFacingError } from '../../src/features/shared/errors';
import { colors, spacing, typography } from '../../src/theme';

export default function DashboardScreen() {
  const { session } = useAuth();
  const today = useToday();
  const accessToken = session?.accessToken;
  const [data, setData] = useState<DailyDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setError(null);
    try {
      setData(await getDailyDashboard(accessToken, today));
    } catch (cause) {
      setError(toUserFacingError(cause, 'No fue posible cargar tu resumen nutricional.'));
    }
  }, [accessToken, today]);

  useEffect(() => {
    setLoading(true);
    void load().finally(() => setLoading(false));
  }, [load]);

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  if (!session) return null;

  const exceeded = (data?.remainingCalories ?? 0) < 0;

  return (
    <Screen
      eyebrow="NUTRIFLOW · HOY"
      onRefresh={refresh}
      refreshing={refreshing}
      subtitle={`${formatLongDate(today)} · objetivos y consumo en una sola vista.`}
      title="Tu día nutricional"
    >
      {loading && !data ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={typography.caption}>Cargando tu resumen…</Text>
        </View>
      ) : null}

      {data ? (
        <>
          <Card style={styles.hero} variant="raised">
            <Text style={styles.heroLabel}>{exceeded ? 'Calorías excedidas' : 'Calorías restantes'}</Text>
            <Text style={[styles.heroValue, exceeded && styles.heroExceeded]}>{Math.abs(Math.round(data.remainingCalories))}</Text>
            <ProgressBar exceeded={exceeded} percent={data.calorieProgressPercent} />
            <Text style={styles.heroMeta}>
              {Math.round(data.consumedCalories)} consumidas de {Math.round(data.targetCalories)} kcal
            </Text>
          </Card>

          <View style={styles.macros}>
            <MacroCard label="Proteína" value={data.protein} />
            <MacroCard label="Carbohidratos" value={data.carbohydrates} />
            <MacroCard label="Grasas" value={data.fat} />
          </View>
        </>
      ) : null}

      {error ? (
        <Card style={styles.errorCard}>
          <Text style={styles.error}>{error}</Text>
          <Button label="Reintentar" onPress={() => void refresh()} variant="secondary" />
        </Card>
      ) : null}

      <View style={styles.actions}>
        <Button label="Registrar comida" onPress={() => router.push('/meals')} />
        <Button label="Explorar alimentos" onPress={() => router.push('/foods')} variant="secondary" />
      </View>
    </Screen>
  );
}

function MacroCard({ label, value }: { label: string; value: MacroProgress }) {
  const over = value.remaining < 0;

  return (
    <Card>
      <View style={styles.macroHeader}>
        <Text style={styles.macroLabel}>{label}</Text>
        <Text style={styles.macroValue}>{Math.round(value.consumed)} / {Math.round(value.target)} g</Text>
      </View>
      <ProgressBar exceeded={over} percent={value.progressPercent} />
      <Text style={[styles.macroRemaining, over && styles.macroOver]}>
        {over ? `${Math.abs(Math.round(value.remaining))} g por encima` : `${Math.round(value.remaining)} g restantes`}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  loading: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xxl },
  hero: { gap: spacing.sm, marginTop: spacing.xl },
  heroLabel: { color: colors.textSecondary, fontWeight: '700' },
  heroValue: { color: colors.primary, fontSize: 52, fontWeight: '900' },
  heroExceeded: { color: colors.danger },
  heroMeta: { color: colors.textSoft, marginTop: spacing.xs },
  macros: { gap: 10, marginTop: spacing.md + 2 },
  macroHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  macroLabel: { color: colors.textSecondary, fontWeight: '700' },
  macroValue: { color: colors.text, fontSize: 16, fontWeight: '900' },
  macroRemaining: { color: colors.primary, marginTop: 8 },
  macroOver: { color: colors.danger },
  errorCard: { gap: spacing.md, marginTop: spacing.lg },
  error: { color: colors.danger, lineHeight: 22 },
  actions: { gap: spacing.md, marginTop: spacing.xl },
});
