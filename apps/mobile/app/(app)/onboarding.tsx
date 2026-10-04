import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
import { toUserFacingError } from '../../src/features/shared/errors';

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
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) return 'Ingresa tu fecha de nacimiento con el formato AAAA-MM-DD.';
      const birth = new Date(`${dateOfBirth}T00:00:00`);
      if (Number.isNaN(birth.getTime()) || birth >= new Date()) return 'Ingresa una fecha de nacimiento válida.';

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

  if (initializing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#62E62C" size="large" />
          <Text style={styles.helper}>Cargando tu perfil…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <Pressable disabled={step === 1 || saving} onPress={() => setStep((current) => Math.max(1, current - 1))}>
            <Text style={[styles.back, step === 1 && styles.muted]}>Atrás</Text>
          </Pressable>
          <Text style={styles.progress}>Paso {step} de 5</Text>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${step * 20}%` }]} />
        </View>

        {step === 1 && (
          <>
            <Text style={styles.eyebrow}>SOBRE TI</Text>
            <Text style={styles.title}>Tus medidas</Text>
            <Text style={styles.subtitle}>Usaremos pies, pulgadas y libras para personalizar tus objetivos nutricionales.</Text>

            <Text style={styles.label}>Fecha de nacimiento</Text>
            <TextInput value={dateOfBirth} onChangeText={setDateOfBirth} placeholder="AAAA-MM-DD" placeholderTextColor="#637268" style={styles.input} />

            <Text style={styles.label}>Sexo para cálculo metabólico</Text>
            <View style={styles.row}>
              {(['Female', 'Male'] as BiologicalSex[]).map((value) => (
                <Choice key={value} selected={sex === value} title={value === 'Female' ? 'Mujer' : 'Hombre'} onPress={() => setSex(value)} />
              ))}
            </View>

            <Text style={styles.label}>Altura</Text>
            <View style={styles.row}>
              <TextInput value={heightFeet} onChangeText={setHeightFeet} keyboardType="number-pad" style={[styles.input, styles.flex]} />
              <Text style={styles.unit}>ft</Text>
              <TextInput value={heightInches} onChangeText={setHeightInches} keyboardType="number-pad" style={[styles.input, styles.flex]} />
              <Text style={styles.unit}>in</Text>
            </View>

            <Text style={styles.label}>Peso actual</Text>
            <View style={styles.row}>
              <TextInput value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholder="220" placeholderTextColor="#637268" style={[styles.input, styles.flex]} />
              <Text style={styles.unit}>lb</Text>
            </View>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.eyebrow}>ACTIVIDAD FÍSICA</Text>
            <Text style={styles.title}>¿Cuánto te mueves?</Text>
            <Text style={styles.subtitle}>Selecciona el nivel que mejor represente tu actividad habitual.</Text>
            {activities.map((item) => (
              <SelectCard key={item.value} selected={activity === item.value} title={item.title} detail={item.detail} onPress={() => setActivity(item.value)} />
            ))}
          </>
        )}

        {step === 3 && (
          <>
            <Text style={styles.eyebrow}>OBJETIVO</Text>
            <Text style={styles.title}>¿Qué quieres lograr?</Text>
            <Text style={styles.subtitle}>Tu objetivo se usará para calcular calorías y macronutrientes diarios.</Text>
            {goals.map((item) => (
              <SelectCard key={item.value} selected={goal === item.value} title={item.title} detail={item.detail} onPress={() => setGoal(item.value)} />
            ))}
            {goal !== 'MaintainWeight' && (
              <>
                <Text style={styles.label}>Peso objetivo</Text>
                <View style={styles.row}>
                  <TextInput value={targetWeight} onChangeText={setTargetWeight} keyboardType="decimal-pad" placeholder="185" placeholderTextColor="#637268" style={[styles.input, styles.flex]} />
                  <Text style={styles.unit}>lb</Text>
                </View>
              </>
            )}
          </>
        )}

        {step === 4 && (
          <>
            <Text style={styles.eyebrow}>ALIMENTOS</Text>
            <Text style={styles.title}>¿Qué deseas incluir?</Text>
            <Text style={styles.subtitle}>Estas preferencias ayudan a personalizar tu experiencia y futuras recomendaciones.</Text>
            <View style={styles.chipGrid}>
              {foodPreferences.map((item) => (
                <ChoiceChip key={item.value} selected={preferences.includes(item.value)} title={item.title} onPress={() => togglePreference(item.value)} />
              ))}
            </View>
          </>
        )}

        {step === 5 && (
          <>
            <Text style={styles.eyebrow}>SEGURIDAD ALIMENTARIA</Text>
            <Text style={styles.title}>¿Qué debemos evitar?</Text>
            <Text style={styles.subtitle}>Selecciona alergias o restricciones. NutriFlow nunca bloquea estas advertencias por suscripción.</Text>
            {restrictions.map((item) => (
              <SelectCard key={item.value} selected={dietaryRestrictions.includes(item.value)} title={item.title} detail={item.detail} onPress={() => toggleRestriction(item.value)} />
            ))}
            <Text style={styles.helper}>Si ninguna aplica, puedes continuar sin seleccionar opciones.</Text>
          </>
        )}

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable disabled={saving} onPress={() => void continueFlow()} style={[styles.primaryButton, saving && styles.disabled]}>
          <Text style={styles.primaryText}>{saving ? 'Guardando…' : step === 5 ? 'Finalizar configuración' : 'Continuar'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Choice({ selected, title, onPress }: { selected: boolean; title: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.choice, selected && styles.selected]}><Text style={styles.choiceText}>{title}</Text></Pressable>;
}

function ChoiceChip({ selected, title, onPress }: { selected: boolean; title: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.chip, selected && styles.selected]}><Text style={styles.choiceText}>{title}</Text></Pressable>;
}

function SelectCard({ selected, title, detail, onPress }: { selected: boolean; title: string; detail: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.card, selected && styles.selected]}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDetail}>{detail}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#07110B' },
  container: { padding: 24, paddingBottom: 48 },
  loadingContainer: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  back: { color: '#DDE5DF', fontWeight: '700' },
  muted: { color: '#526158' },
  progress: { color: '#7E8E84', fontWeight: '700' },
  progressTrack: { backgroundColor: '#18251D', height: 6, borderRadius: 999, marginTop: 18, overflow: 'hidden' },
  progressFill: { backgroundColor: '#62E62C', height: 6 },
  eyebrow: { color: '#62E62C', fontSize: 12, fontWeight: '800', letterSpacing: 1.4, marginTop: 38 },
  title: { color: '#F6FAF7', fontSize: 32, fontWeight: '800', marginTop: 10 },
  subtitle: { color: '#95A59B', fontSize: 15, lineHeight: 23, marginTop: 10, marginBottom: 22 },
  label: { color: '#DDE5DF', fontSize: 14, fontWeight: '700', marginTop: 18, marginBottom: 8 },
  input: { backgroundColor: '#101C14', borderColor: '#25372B', borderWidth: 1, borderRadius: 14, color: '#F6FAF7', fontSize: 16, paddingHorizontal: 16, paddingVertical: 14 },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  flex: { flex: 1 },
  unit: { color: '#95A59B', fontSize: 15, fontWeight: '700' },
  choice: { flex: 1, backgroundColor: '#101C14', borderColor: '#25372B', borderWidth: 1, borderRadius: 14, padding: 16, alignItems: 'center' },
  selected: { borderColor: '#62E62C', backgroundColor: '#132718' },
  choiceText: { color: '#F6FAF7', fontWeight: '700' },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { backgroundColor: '#101C14', borderColor: '#25372B', borderWidth: 1, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 12 },
  card: { backgroundColor: '#101C14', borderColor: '#25372B', borderWidth: 1, borderRadius: 18, padding: 18, marginBottom: 12 },
  cardTitle: { color: '#F6FAF7', fontSize: 17, fontWeight: '800' },
  cardDetail: { color: '#95A59B', fontSize: 14, lineHeight: 20, marginTop: 5 },
  helper: { color: '#7E8E84', fontSize: 13, lineHeight: 19, marginTop: 8 },
  error: { color: '#FF8E8E', marginTop: 18, lineHeight: 20 },
  primaryButton: { backgroundColor: '#62E62C', borderRadius: 16, alignItems: 'center', paddingVertical: 17, marginTop: 28 },
  primaryText: { color: '#07110B', fontSize: 16, fontWeight: '900' },
  disabled: { opacity: 0.6 },
});
