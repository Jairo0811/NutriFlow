import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../src/features/auth/AuthProvider';
import {
  onboardingApi,
  type DietaryRestrictionCode,
  type FoodPreferenceCode,
  type NutritionProfile,
} from '../../src/features/onboarding/api';

const preferenceOptions: { code: FoodPreferenceCode; label: string }[] = [
  { code: 'protein', label: 'Proteínas' },
  { code: 'carbohydrates', label: 'Carbohidratos' },
  { code: 'fats', label: 'Grasas' },
  { code: 'dairy', label: 'Lácteos' },
  { code: 'fruits', label: 'Frutas' },
];

const restrictionOptions: { code: DietaryRestrictionCode; label: string }[] = [
  { code: 'gluten', label: 'Gluten' },
  { code: 'wheat', label: 'Trigo' },
  { code: 'milk', label: 'Leche' },
  { code: 'eggs', label: 'Huevos' },
  { code: 'fish', label: 'Pescado' },
  { code: 'shellfish', label: 'Mariscos' },
  { code: 'peanuts', label: 'Maní' },
  { code: 'tree_nuts', label: 'Frutos secos' },
  { code: 'soy', label: 'Soya' },
  { code: 'sesame', label: 'Sésamo' },
];

export default function PreferencesScreen() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<NutritionProfile | null>(null);
  const [preferences, setPreferences] = useState<FoodPreferenceCode[]>([]);
  const [restrictions, setRestrictions] = useState<DietaryRestrictionCode[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.accessToken) return;
    onboardingApi.get(session.accessToken).then((value) => {
      setProfile(value);
      setPreferences(value.foodPreferenceCodes);
      setRestrictions(value.dietaryRestrictionCodes);
    });
  }, [session?.accessToken]);

  if (!session) return null;

  const toggle = <T extends string>(value: T, current: T[], setter: (next: T[]) => void) =>
    setter(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      await onboardingApi.savePreferences(session.accessToken, preferences);
      const updated = await onboardingApi.saveRestrictions(session.accessToken, restrictions);
      setProfile(updated);
      setMessage('Preferencias y restricciones actualizadas.');
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'No fue posible guardar los cambios.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.eyebrow}>NUTRIFLOW · FASE 9</Text>
        <Text style={styles.title}>Alergias y preferencias</Text>
        <Text style={styles.subtitle}>Estas reglas se usan para detectar conflictos al consultar alimentos. No sustituyen la lectura de etiquetas ni una evaluación clínica.</Text>

        <Text style={styles.sectionTitle}>Preferencias</Text>
        <View style={styles.chips}>
          {preferenceOptions.map((item) => (
            <Pressable key={item.code} onPress={() => toggle(item.code, preferences, setPreferences)} style={[styles.chip, preferences.includes(item.code) && styles.selected]}>
              <Text style={styles.chipText}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Restricciones y alérgenos</Text>
        <View style={styles.chips}>
          {restrictionOptions.map((item) => (
            <Pressable key={item.code} onPress={() => toggle(item.code, restrictions, setRestrictions)} style={[styles.chip, restrictions.includes(item.code) && styles.warningSelected]}>
              <Text style={styles.chipText}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Protección activa</Text>
          <Text style={styles.infoText}>{profile?.dietaryRestrictionCodes.length ?? 0} restricciones configuradas. NutriFlow mostrará advertencias cuando un alimento tenga alérgenos coincidentes.</Text>
        </View>

        <Pressable disabled={saving} onPress={() => void save()} style={[styles.button, saving && styles.disabled]}>
          <Text style={styles.buttonText}>{saving ? 'Guardando…' : 'Guardar cambios'}</Text>
        </Pressable>
        {message && <Text style={styles.message}>{message}</Text>}
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
  sectionTitle: { color: '#F6FAF7', fontSize: 20, fontWeight: '900', marginTop: 28, marginBottom: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  chip: { backgroundColor: '#101C14', borderColor: '#25372B', borderRadius: 999, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 11 },
  selected: { backgroundColor: '#132718', borderColor: '#62E62C' },
  warningSelected: { backgroundColor: '#2A1818', borderColor: '#FF8E8E' },
  chipText: { color: '#F6FAF7', fontWeight: '800' },
  infoCard: { backgroundColor: '#101C14', borderColor: '#31533A', borderRadius: 18, borderWidth: 1, marginTop: 28, padding: 18 },
  infoTitle: { color: '#62E62C', fontWeight: '900' },
  infoText: { color: '#95A59B', lineHeight: 21, marginTop: 6 },
  button: { alignItems: 'center', backgroundColor: '#62E62C', borderRadius: 14, marginTop: 18, padding: 16 },
  buttonText: { color: '#07110B', fontWeight: '900' },
  disabled: { opacity: 0.6 },
  message: { color: '#DDE5DF', marginTop: 14, textAlign: 'center' },
});
