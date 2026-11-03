import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../src/features/auth/AuthProvider';
import { getNutritionTargets, type NutritionTargets } from '../../src/features/nutrition/api';
import { toUserFacingError } from '../../src/features/shared/errors';
import { colors } from '../../src/theme';

export default function NutritionTargetsScreen() {
  const { session, isLoading } = useAuth();
  const [targets, setTargets] = useState<NutritionTargets | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;

    let mounted = true;
    setError(null);
    void getNutritionTargets(session.accessToken)
      .then((result) => {
        if (mounted) setTargets(result);
      })
      .catch((cause) => {
        if (mounted) setError(toUserFacingError(cause, 'No fue posible calcular tus objetivos nutricionales.'));
      });

    return () => {
      mounted = false;
    };
  }, [session]);

  if (!isLoading && !session) return <Redirect href="/login" />;

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.eyebrow}>NUTRIFLOW · PLAN NUTRICIONAL</Text>
        <Text style={styles.title}>Tus objetivos diarios</Text>
        <Text style={styles.subtitle}>
          Estimaciones calculadas de forma determinística a partir de tu perfil. No sustituyen una evaluación nutricional profesional.
        </Text>

        {error && <Text style={styles.error}>{error}</Text>}
        {!targets && !error && <Text style={styles.loading}>Calculando…</Text>}

        {targets && (
          <>
            <View style={styles.heroCard}>
              <Text style={styles.cardLabel}>Objetivo diario</Text>
              <Text style={styles.calories}>{targets.targetCalories} kcal</Text>
              <Text style={styles.cardHint}>TDEE estimado: {targets.totalDailyEnergyCalories} kcal</Text>
            </View>

            <View style={styles.grid}>
              <MacroCard label="Proteína" value={`${targets.proteinGrams} g`} />
              <MacroCard label="Carbohidratos" value={`${targets.carbohydrateGrams} g`} />
              <MacroCard label="Grasas" value={`${targets.fatGrams} g`} />
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.cardLabel}>Energía en reposo</Text>
              <Text style={styles.infoValue}>{targets.restingEnergyCalories} kcal</Text>
              <Text style={styles.cardHint}>Motor: {targets.formulaVersion}</Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function MacroCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.macroCard}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.macroValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: 24, paddingBottom: 48 },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: '800', letterSpacing: 1.4, marginTop: 24 },
  title: { color: colors.text, fontSize: 32, fontWeight: '800', marginTop: 10 },
  subtitle: { color: colors.textSecondary, fontSize: 15, lineHeight: 23, marginTop: 10, marginBottom: 24 },
  heroCard: { backgroundColor: colors.surfaceRaised, borderColor: colors.primary, borderWidth: 1, borderRadius: 20, padding: 22 },
  cardLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '700' },
  calories: { color: colors.text, fontSize: 38, fontWeight: '900', marginTop: 8 },
  cardHint: { color: colors.textMuted, fontSize: 13, marginTop: 8 },
  grid: { gap: 12, marginTop: 16 },
  macroCard: { backgroundColor: colors.surface, borderColor: colors.borderInput, borderWidth: 1, borderRadius: 18, padding: 18 },
  macroValue: { color: colors.text, fontSize: 24, fontWeight: '800', marginTop: 6 },
  infoCard: { backgroundColor: colors.surface, borderColor: colors.borderInput, borderWidth: 1, borderRadius: 18, padding: 18, marginTop: 16 },
  infoValue: { color: colors.text, fontSize: 22, fontWeight: '800', marginTop: 6 },
  loading: { color: colors.textSecondary, marginTop: 20 },
  error: { color: colors.danger, lineHeight: 20, marginTop: 12 },
});
