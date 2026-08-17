import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../src/features/auth/AuthProvider';
import {
  onboardingApi,
  type ActivityLevel,
  type BiologicalSex,
  type DietaryRestrictionCode,
  type FoodPreferenceCode,
  type NutritionGoalType,
} from '../../src/features/onboarding/api';

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
  { value: 'shellfish', title: 'Mariscos', detail: 'Evitar productos derivados de mariscos.' },
];

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
  const accessToken = session?.accessToken;

  if (!accessToken) return null;

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

  async function continueFlow() {
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
        router.replace('/');
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible guardar tus datos.');
    } finally {
      setSaving(false);
    }
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
            <Text style={styles.subtitle}>Usaremos pies, pulgadas y libras. Las conversiones necesarias ocurren únicamente dentro del motor nutricional.</Text>

            <Text style={styles.label}>Fecha de nacimiento</Text>
            <TextInput value={dateOfBirth} onChangeText={setDateOfBirth} placeholder="YYYY-MM-DD" placeholderTextColor="#637268" style={styles.input} />

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
            <Text style={styles.subtitle}>Conservamos los cuatro niveles definidos en el prototipo académico y modernizamos su presentación.</Text>
            {activities.map((item) => (
              <SelectCard key={item.value} selected={activity === item.value} title={item.title} detail={item.detail} onPress={() => setActivity(item.value)} />
            ))}
          </>
        )}

        {step === 3 && (
          <>
            <Text style={styles.eyebrow}>OBJETIVO</Text>
            <Text style={styles.title}>¿Qué quieres lograr?</Text>
            <Text style={styles.subtitle}>Este objetivo alimentará el motor nutricional de la siguiente fase.</Text>
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
            <Text style={styles.subtitle}>Esta selección conserva las categorías principales del mockup original y servirá para personalizar el catálogo y las recomendaciones futuras.</Text>
            <View style={styles.chipGrid}>
              {foodPreferences.map((item) => (
                <ChoiceChip key={item.value} selected={preferences.includes(item.value)} title={item.title} onPress={() => togglePreference(item.value)} />
              ))}
            </View>
          </>
        )}

        {step === 5 && (
          <>
            <Text style={styles.eyebrow}>RESTRICCIONES</Text>
            <Text style={styles.title}>¿Qué debemos evitar?</Text>
            <Text style={styles.subtitle}>El prototipo original contemplaba gluten y mariscos. Por ahora registramos estas restricciones como preferencias del perfil; las advertencias avanzadas llegarán en la Fase 9.</Text>
            {restrictions.map((item) => (
              <SelectCard key={item.value} selected={dietaryRestrictions.includes(item.value)} title={item.title} detail={item.detail} onPress={() => toggleRestriction(item.value)} />
            ))}
            <Text style={styles.helper}>Si ninguna aplica, puedes continuar sin seleccionar opciones.</Text>
          </>
        )}

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable disabled={saving} onPress={() => void continueFlow()} style={[styles.primaryButton, saving && styles.disabled]}>
          <Text style={styles.primaryText}>{saving ? 'Guardando…' : step === 5 ? 'Completar onboarding' : 'Continuar'}</Text>
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
