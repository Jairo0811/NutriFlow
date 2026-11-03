import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../src/components/Button';
import { Chip } from '../../src/components/Chip';
import { DateField } from '../../src/components/DateField';
import { Input } from '../../src/components/Input';
import { ProgressBar } from '../../src/components/ProgressBar';
import { Screen } from '../../src/components/Screen';
import { useAuth } from '../../src/features/auth/AuthProvider';
import {
  onboardingApi,
  type ActivityLevel,
  type BiologicalSex,
  type DietaryRestrictionCode,
  type FoodPreferenceCode,
  type NutritionGoalType,
  type NutritionProfile,
} from '../../src/features/onboarding/api';
import { isValidPastDate } from '../../src/features/shared/dateValidation';
import { toUserFacingError } from '../../src/features/shared/errors';
import { colors, radius, spacing, typography } from '../../src/theme';

const activities: { value: ActivityLevel; title: string; detail: string }[] = [
  { value: 'Sedentary', title: 'Sedentaria', detail: 'Nada o poco ejercicio' },
  { value: 'Light', title: 'Ligera', detail: 'Ejercicio 2-3 días por semana' },
  { value: 'Moderate', title: 'Moderada', detail: 'Ejercicio 4-5 días por semana' },
  { value: 'High', title: 'Alta', detail: 'Ejercicio 6-7 días por semana' },
];

const goals: { value: NutritionGoalType; title: string; detail: string }[] = [
  { value: 'LoseFat', title: 'Perder grasa', detail: 'Reduce grasa preservando masa muscular.' },
  { value: 'MaintainWeight', title: 'Mantener peso', detail: 'Mantén tu peso y construye hábitos sostenibles.' },
  { value: 'GainMuscle', title: 'Ganar músculo', detail: 'Aumenta masa muscular y fuerza.' },
];

const foodPreferences: { value: FoodPreferenceCode; title: string }[] = [
  { value: 'protein', title: 'Proteínas' },
  { value: 'carbohydrates', title: 'Carbohidratos' },
  { value: 'fats', title: 'Grasas' },
  { value: 'dairy', title: 'Bebidas y lácteos' },
  { value: 'fruits', title: 'Frutas' },
];

const restrictions: { value: DietaryRestrictionCode; title: string; detail: string }[] = [
  { value: 'gluten', title: 'Gluten', detail: 'Evitar alimentos que contengan gluten.' },
  { value: 'wheat', title: 'Trigo', detail: 'Evitar trigo y productos derivados.' },
  { value: 'milk', title: 'Leche', detail: 'Evitar leche y alérgenos lácteos.' },
  { value: 'eggs', title: 'Huevos', detail: 'Evitar huevo y productos derivados.' },
  { value: 'fish', title: 'Pescado', detail: 'Evitar pescado y productos derivados.' },
  { value: 'shellfish', title: 'Mariscos', detail: 'Evitar productos derivados de mariscos.' },
  { value: 'peanuts', title: 'Maní', detail: 'Evitar maní y productos que lo contengan.' },
  { value: 'tree_nuts', title: 'Frutos secos', detail: 'Evitar nueces y otros frutos secos.' },
  { value: 'soy', title: 'Soya', detail: 'Evitar soya y productos derivados.' },
  { value: 'sesame', title: 'Sésamo', detail: 'Evitar sésamo y productos derivados.' },
];

const stepMeta: Record<number, { eyebrow: string; title: string; subtitle: string }> = {
  1: { eyebrow: 'SOBRE TI', title: 'Tus medidas', subtitle: 'Usaremos pies, pulgadas y libras para personalizar tus objetivos nutricionales.' },
  2: { eyebrow: 'ACTIVIDAD FÍSICA', title: '¿Cuánto te mueves?', subtitle: 'Selecciona el nivel que mejor represente tu actividad habitual.' },
  3: { eyebrow: 'OBJETIVO', title: '¿Qué quieres lograr?', subtitle: 'Tu objetivo se usará para calcular calorías y macronutrientes diarios.' },
  4: { eyebrow: 'ALIMENTOS', title: '¿Qué deseas incluir?', subtitle: 'Estas preferencias ayudan a personalizar tu experiencia y futuras recomendaciones.' },
  5: { eyebrow: 'SEGURIDAD ALIMENTARIA', title: '¿Qué debemos evitar?', subtitle: 'Selecciona alergias o restricciones. NutriFlow nunca bloquea estas advertencias por suscripción.' },
};

function nextStepFor(profile: NutritionProfile): number {
  if (!profile.dateOfBirth || !profile.biologicalSex || profile.heightFeet == null || profile.heightInches == null || profile.currentWeightPounds == null) return 1;
  if (!profile.activityLevel) return 2;
  if (!profile.goalType) return 3;
  return 4;
}

export default function NutritionalOnboardingScreen() {
  const { session } = useAuth();
  const [step, setStep] = useState(1);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [sex, setSex] = useState<BiologicalSex>('Male');
  const [heightFeet, setHeightFeet] = useState('5');
  const [heightInches, setHeightInches] = useState('8');
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState<ActivityLevel>('Moderate');
  const [goal, setGoal] = useState<NutritionGoalType>('MaintainWeight');
  const [targetWeight, setTargetWeight] = useState('');
  const [preferences, setPreferences] = useState<FoodPreferenceCode[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<DietaryRestrictionCode[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const accessToken = session?.accessToken;

  useEffect(() => {
    if (!accessToken) return;
    let mounted = true;
    setInitializing(true);
    setError(null);

    void onboardingApi.get(accessToken)
      .then((profile) => {
        if (!mounted) return;
        setDateOfBirth(profile.dateOfBirth ?? '');
        setSex(profile.biologicalSex ?? 'Male');
        setHeightFeet(profile.heightFeet?.toString() ?? '5');
        setHeightInches(profile.heightInches?.toString() ?? '8');
        setWeight(profile.currentWeightPounds?.toString() ?? '');
        setActivity(profile.activityLevel ?? 'Moderate');
        setGoal(profile.goalType ?? 'MaintainWeight');
        setTargetWeight(profile.goalType === 'MaintainWeight' ? '' : profile.targetWeightPounds?.toString() ?? '');
        setPreferences(profile.foodPreferenceCodes ?? []);
        setDietaryRestrictions(profile.dietaryRestrictionCodes ?? []);
        setStep(profile.isCompleted ? 1 : nextStepFor(profile));
      })
      .catch((cause) => {
        if (mounted) setError(toUserFacingError(cause, 'No pudimos cargar tu perfil nutricional.'));
      })
      .finally(() => {
        if (mounted) setInitializing(false);
      });

    return () => {
      mounted = false;
    };
  }, [accessToken]);

  if (!session || !accessToken) return null;

  function togglePreference(value: FoodPreferenceCode) {
    setPreferences((current) => current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value]);
  }

  function toggleRestriction(value: DietaryRestrictionCode) {
    setDietaryRestrictions((current) => current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value]);
  }

  function validateCurrentStep(): string | null {
    if (step === 1) {
      if (!dateOfBirth) return 'Ingresa tu fecha de nacimiento completa: día, mes y año.';
      if (!isValidPastDate(dateOfBirth)) return 'Ingresa una fecha de nacimiento válida.';

      const feet = Number(heightFeet);
      const inches = Number(heightInches);
      const pounds = Number(weight);
      const totalInches = (feet * 12) + inches;
      if (!Number.isInteger(feet) || !Number.isInteger(inches) || inches < 0 || inches > 11 || totalInches < 36 || totalInches > 96) {
        return 'Ingresa una altura válida entre 3 y 8 pies.';
      }
      if (!Number.isFinite(pounds) || pounds < 60 || pounds > 800) return 'Ingresa un peso válido entre 60 y 800 lb.';
    }

    if (step === 3 && goal !== 'MaintainWeight') {
      const target = Number(targetWeight);
      if (!Number.isFinite(target) || target < 60 || target > 800) return 'Ingresa un peso objetivo entre 60 y 800 lb.';
    }

    return null;
  }

  async function continueFlow() {
    const validationError = validateCurrentStep();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSaving(true);
    try {
      if (step === 1) {
        await onboardingApi.savePhysicalProfile(accessToken, {
          dateOfBirth,
          biologicalSex: sex,
          heightFeet: Number(heightFeet),
          heightInches: Number(heightInches),
          currentWeightPounds: Number(weight),
        });
        setStep(2);
      } else if (step === 2) {
        await onboardingApi.saveActivity(accessToken, activity);
        setStep(3);
      } else if (step === 3) {
        const target = goal === 'MaintainWeight' ? null : Number(targetWeight);
        await onboardingApi.saveGoal(accessToken, goal, target);
        setStep(4);
      } else if (step === 4) {
        await onboardingApi.savePreferences(accessToken, preferences);
        setStep(5);
      } else if (step === 5) {
        await onboardingApi.saveRestrictions(accessToken, dietaryRestrictions);
        await onboardingApi.complete(accessToken);
        router.replace('/(app)');
      }
    } catch (cause) {
      setError(toUserFacingError(cause, 'No fue posible guardar tus datos.'));
    } finally {
      setSaving(false);
    }
  }

  const meta = stepMeta[step];

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={typography.caption}>Cargando tu perfil…</Text>
      </View>
    );
  }

  return (
    <Screen
      eyebrow={meta.eyebrow}
      footer={(
        <View style={styles.footer}>
          {error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}
          <Button
            label={step === 5 ? 'Finalizar configuración' : 'Continuar'}
            loading={saving}
            onPress={() => void continueFlow()}
          />
        </View>
      )}
      header={(
        <View style={styles.stepHeader}>
          <View style={styles.headerRow}>
            <Pressable
              accessibilityLabel="Paso anterior"
              accessibilityRole="button"
              accessibilityState={{ disabled: step === 1 || saving }}
              disabled={step === 1 || saving}
              hitSlop={12}
              onPress={() => { setError(null); setStep((current) => Math.max(1, current - 1)); }}
            >
              <Text style={[styles.back, step === 1 && styles.muted]}>Atrás</Text>
            </Pressable>
            <Text style={styles.progress}>Paso {step} de 5</Text>
          </View>
          <ProgressBar percent={step * 20} />
        </View>
      )}
      subtitle={meta.subtitle}
      title={meta.title}
    >
      <View style={styles.body}>
        {step === 1 && (
          <>
            <DateField label="Fecha de nacimiento" onChange={setDateOfBirth} value={dateOfBirth} />

            <View style={styles.group}>
              <Text style={typography.label}>Sexo para cálculo metabólico</Text>
              <View style={styles.row}>
                {(['Female', 'Male'] as BiologicalSex[]).map((value) => (
                  <Choice key={value} onPress={() => setSex(value)} selected={sex === value} title={value === 'Female' ? 'Mujer' : 'Hombre'} />
                ))}
              </View>
            </View>

            <View style={styles.group}>
              <Text style={typography.label}>Altura</Text>
              <View style={styles.row}>
                <Input accessibilityLabel="Altura en pies" containerStyle={styles.flex} keyboardType="number-pad" maxLength={1} onChangeText={setHeightFeet} value={heightFeet} />
                <Text style={styles.unit}>ft</Text>
                <Input accessibilityLabel="Altura en pulgadas" containerStyle={styles.flex} keyboardType="number-pad" maxLength={2} onChangeText={setHeightInches} value={heightInches} />
                <Text style={styles.unit}>in</Text>
              </View>
            </View>

            <View style={styles.group}>
              <Text style={typography.label}>Peso actual</Text>
              <View style={styles.row}>
                <Input accessibilityLabel="Peso actual en libras" containerStyle={styles.flex} keyboardType="decimal-pad" onChangeText={setWeight} placeholder="220" value={weight} />
                <Text style={styles.unit}>lb</Text>
              </View>
            </View>
          </>
        )}

        {step === 2 && activities.map((item) => (
          <SelectCard detail={item.detail} key={item.value} onPress={() => setActivity(item.value)} role="radio" selected={activity === item.value} title={item.title} />
        ))}

        {step === 3 && (
          <>
            {goals.map((item) => (
              <SelectCard detail={item.detail} key={item.value} onPress={() => setGoal(item.value)} role="radio" selected={goal === item.value} title={item.title} />
            ))}
            {goal !== 'MaintainWeight' && (
              <View style={styles.group}>
                <Text style={typography.label}>Peso objetivo</Text>
                <View style={styles.row}>
                  <Input accessibilityLabel="Peso objetivo en libras" containerStyle={styles.flex} keyboardType="decimal-pad" onChangeText={setTargetWeight} placeholder="185" value={targetWeight} />
                  <Text style={styles.unit}>lb</Text>
                </View>
              </View>
            )}
          </>
        )}

        {step === 4 && (
          <View style={styles.chipGrid}>
            {foodPreferences.map((item) => (
              <Chip key={item.value} label={item.title} onPress={() => togglePreference(item.value)} selected={preferences.includes(item.value)} />
            ))}
          </View>
        )}

        {step === 5 && (
          <>
            {restrictions.map((item) => (
              <SelectCard detail={item.detail} key={item.value} onPress={() => toggleRestriction(item.value)} role="checkbox" selected={dietaryRestrictions.includes(item.value)} title={item.title} />
            ))}
            <Text style={typography.caption}>Si ninguna aplica, puedes continuar sin seleccionar opciones.</Text>
          </>
        )}
      </View>
    </Screen>
  );
}

function Choice({ selected, title, onPress }: { selected: boolean; title: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={title}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[styles.choice, selected && styles.selected]}
    >
      <Text style={styles.choiceText}>{title}</Text>
    </Pressable>
  );
}

function SelectCard({ selected, title, detail, role, onPress }: { selected: boolean; title: string; detail: string; role: 'radio' | 'checkbox'; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={`${title}. ${detail}`}
      accessibilityRole={role}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[styles.card, selected && styles.selected]}
    >
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDetail}>{detail}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { alignItems: 'center', backgroundColor: colors.background, flex: 1, gap: spacing.md, justifyContent: 'center', padding: spacing.xl },
  stepHeader: { gap: spacing.md + 2, marginBottom: spacing.xl + 4 },
  headerRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  back: { color: colors.textSoft, fontWeight: '700' },
  muted: { color: '#526158' },
  progress: { color: colors.textMuted, fontWeight: '700' },
  body: { gap: spacing.md, marginTop: spacing.xl },
  group: { gap: spacing.sm },
  row: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  flex: { flex: 1 },
  unit: { color: colors.textSecondary, fontSize: 15, fontWeight: '700' },
  choice: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.borderInput, borderRadius: radius.md, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 52, padding: spacing.lg },
  selected: { backgroundColor: colors.surfaceRaised, borderColor: colors.primary },
  choiceText: { color: colors.text, fontWeight: '700' },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { backgroundColor: colors.surface, borderColor: colors.borderInput, borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg + 2 },
  cardTitle: { color: colors.text, fontSize: 17, fontWeight: '800' },
  cardDetail: { color: colors.textSecondary, fontSize: 14, lineHeight: 20, marginTop: 5 },
  footer: { backgroundColor: colors.background, borderTopColor: colors.border, borderTopWidth: 1, gap: spacing.sm + 2, paddingHorizontal: spacing.xl, paddingTop: spacing.md + 2, paddingBottom: spacing.sm },
  error: { color: colors.danger, lineHeight: 20 },
});
