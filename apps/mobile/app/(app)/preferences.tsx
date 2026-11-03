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
import { toUserFacingError } from '../../src/features/shared/errors';
import { colors } from '../../src/theme';

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
  const accessToken = session?.accessToken;
  const [profile, setProfile] = useState<NutritionProfile | null>(null);
  const [preferences, setPreferences] = useState<FoodPreferenceCode[]>([]);
  const [restrictions, setRestrictions] = useState<DietaryRestrictionCode[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    setMessage(null);
    onboardingApi.get(accessToken)
      .then((value) => {
        setProfile(value);
        setPreferences(value.foodPreferenceCodes);
        setRestrictions(value.dietaryRestrictionCodes);
      })
      .catch((cause) => setMessage(toUserFacingError(cause, 'No fue posible cargar tus preferencias.')));
  }, [accessToken]);

  if (!session || !accessToken) return null;

  function toggle<T extends string>(value: T, current: T[], setter: (next: T[]) => void) {
    setter(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  }

  async function save() {
    if (!accessToken) return;
    setSaving(true);
    setMessage(null);
    try {
      await onboardingApi.savePreferences(accessToken, preferences);
      const updated = await onboardingApi.saveRestrictions(accessToken, restrictions);
      setProfile(updated);
      setMessage('Preferencias y restricciones actualizadas.');
    } catch (cause) {
      setMessage(toUserFacingError(cause, 'No fue posible guardar los cambios.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.eyebrow}>NUTRIFLOW · SEGURIDAD ALIMENTARIA</Text>
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
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: 24, paddingBottom: 48 },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: '800', letterSpacing: 1.4 },
  title: { color: colors.text, fontSize: 32, fontWeight: '900', marginTop: 10 },
  subtitle: { color: colors.textSecondary, fontSize: 15, lineHeight: 23, marginTop: 8 },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: '900', marginTop: 28, marginBottom: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  chip: { backgroundColor: colors.surface, borderColor: colors.borderInput, borderRadius: 999, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 11 },
  selected: { backgroundColor: colors.surfaceRaised, borderColor: colors.primary },
  warningSelected: { backgroundColor: '#2A1818', borderColor: colors.danger },
  chipText: { color: colors.text, fontWeight: '800' },
  infoCard: { backgroundColor: colors.surface, borderColor: colors.borderAccent, borderRadius: 18, borderWidth: 1, marginTop: 28, padding: 18 },
  infoTitle: { color: colors.primary, fontWeight: '900' },
  infoText: { color: colors.textSecondary, lineHeight: 21, marginTop: 6 },
  button: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: 14, marginTop: 18, padding: 16 },
  buttonText: { color: colors.background, fontWeight: '900' },
  disabled: { opacity: 0.6 },
  message: { color: colors.textSoft, marginTop: 14, textAlign: 'center' },
});
