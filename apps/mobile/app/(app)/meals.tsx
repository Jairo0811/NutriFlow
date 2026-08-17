import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../src/features/auth/AuthProvider';
import { foodCatalogApi, type Food } from '../../src/features/foods/api';
import { mealTrackingApi, type DailyMealSummary, type MealType } from '../../src/features/meals/api';

const mealTypes: { value: MealType; label: string }[] = [
  { value: 'Breakfast', label: 'Desayuno' },
  { value: 'Lunch', label: 'Almuerzo' },
  { value: 'Dinner', label: 'Cena' },
  { value: 'Snack', label: 'Snacks' },
];

const today = new Date().toISOString().slice(0, 10);

export default function MealTrackingScreen() {
  const { session } = useAuth();
  const [summary, setSummary] = useState<DailyMealSummary | null>(null);
  const [mealType, setMealType] = useState<MealType>('Breakfast');
  const [query, setQuery] = useState('');
  const [foods, setFoods] = useState<Food[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [servings, setServings] = useState('1');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accessToken = session?.accessToken;

  useEffect(() => {
    if (!accessToken) return;
    setLoading(true);
    mealTrackingApi.getDay(accessToken, today)
      .then(setSummary)
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'No fue posible cargar tu diario.'))
      .finally(() => setLoading(false));
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken || query.trim().length < 2) {
      setFoods([]);
      return;
    }

    const timer = setTimeout(() => {
      foodCatalogApi.search(accessToken, query)
        .then(setFoods)
        .catch((cause) => setError(cause instanceof Error ? cause.message : 'No fue posible buscar alimentos.'));
    }, 300);

    return () => clearTimeout(timer);
  }, [accessToken, query]);

  const groups = useMemo(() => mealTypes.map(({ value, label }) => ({
    value,
    label,
    meal: summary?.meals.find((meal) => meal.type === value),
  })), [summary]);

  if (!session || !accessToken) return null;

  async function addSelectedFood() {
    if (!selectedFood || !accessToken) return;
    const parsedServings = Number(servings);
    if (!Number.isFinite(parsedServings) || parsedServings <= 0) {
      setError('La cantidad de porciones debe ser mayor que cero.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const updated = await mealTrackingApi.addEntry(accessToken, today, mealType, selectedFood.id, parsedServings);
      setSummary(updated);
      setSelectedFood(null);
      setQuery('');
      setFoods([]);
      setServings('1');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible registrar el alimento.');
    } finally {
      setSaving(false);
    }
  }

  async function removeEntry(entryId: string, type: MealType) {
    if (!accessToken) return;
    setSaving(true);
    setError(null);
    try {
      setSummary(await mealTrackingApi.removeEntry(accessToken, entryId, today, type));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible eliminar el alimento.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>NUTRIFLOW · FASE 5</Text>
        <Text style={styles.title}>Diario de comidas</Text>
        <Text style={styles.subtitle}>{today} · registra lo que consumes y conserva un snapshot nutricional histórico.</Text>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Consumido hoy</Text>
          <Text style={styles.totalCalories}>{Math.round(summary?.calories ?? 0)} kcal</Text>
          <Text style={styles.totalMacros}>
            P {Math.round(summary?.proteinGrams ?? 0)} g · C {Math.round(summary?.carbohydrateGrams ?? 0)} g · G {Math.round(summary?.fatGrams ?? 0)} g
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Agregar alimento</Text>
        <View style={styles.mealTypeRow}>
          {mealTypes.map((item) => (
            <Pressable key={item.value} onPress={() => setMealType(item.value)} style={[styles.mealTypeChip, mealType === item.value && styles.selected]}>
              <Text style={styles.chipText}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          value={query}
          onChangeText={(value) => { setQuery(value); setSelectedFood(null); }}
          placeholder="Buscar alimento o marca"
          placeholderTextColor="#637268"
          style={styles.input}
        />

        {foods.slice(0, 8).map((food) => (
          <Pressable key={food.id} onPress={() => { setSelectedFood(food); setQuery(food.name); setFoods([]); }} style={styles.searchResult}>
            <View style={styles.flex}>
              <Text style={styles.foodName}>{food.name}</Text>
              <Text style={styles.foodMeta}>{food.brand ? `${food.brand} · ` : ''}{food.servingSize} {food.servingUnit}</Text>
            </View>
            <Text style={styles.foodCalories}>{Math.round(food.calories)} kcal</Text>
          </Pressable>
        ))}

        {selectedFood && (
          <View style={styles.selectedFoodCard}>
            <Text style={styles.selectedLabel}>Seleccionado</Text>
            <Text style={styles.foodName}>{selectedFood.name}</Text>
            <View style={styles.servingRow}>
              <TextInput value={servings} onChangeText={setServings} keyboardType="decimal-pad" style={[styles.input, styles.servingInput]} />
              <Text style={styles.foodMeta}>porciones</Text>
              <Pressable disabled={saving} onPress={() => void addSelectedFood()} style={[styles.addButton, saving && styles.disabled]}>
                <Text style={styles.addButtonText}>{saving ? 'Guardando…' : 'Agregar'}</Text>
              </Pressable>
            </View>
          </View>
        )}

        {error && <Text style={styles.error}>{error}</Text>}
        {loading && <Text style={styles.helper}>Cargando diario…</Text>}

        <Text style={styles.sectionTitle}>Tus comidas</Text>
        {groups.map(({ value, label, meal }) => (
          <View key={value} style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <Text style={styles.mealTitle}>{label}</Text>
              <Text style={styles.mealCalories}>{Math.round(meal?.calories ?? 0)} kcal</Text>
            </View>

            {!meal?.entries.length && <Text style={styles.helper}>Aún no has registrado alimentos.</Text>}

            {meal?.entries.map((entry) => (
              <View key={entry.id} style={styles.entryRow}>
                <View style={styles.flex}>
                  <Text style={styles.foodName}>{entry.foodName}</Text>
                  <Text style={styles.foodMeta}>{entry.servings} × {entry.servingSize} {entry.servingUnit} · {Math.round(entry.calories)} kcal</Text>
                </View>
                <Pressable disabled={saving} onPress={() => void removeEntry(entry.id, value)}>
                  <Text style={styles.remove}>Eliminar</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#07110B' },
  container: { padding: 24, paddingBottom: 48 },
  eyebrow: { color: '#62E62C', fontSize: 12, fontWeight: '800', letterSpacing: 1.4 },
  title: { color: '#F6FAF7', fontSize: 34, fontWeight: '800', marginTop: 10 },
  subtitle: { color: '#95A59B', fontSize: 15, lineHeight: 23, marginTop: 8 },
  totalCard: { backgroundColor: '#132718', borderColor: '#31533A', borderWidth: 1, borderRadius: 20, padding: 20, marginTop: 24 },
  totalLabel: { color: '#95A59B', fontWeight: '700' },
  totalCalories: { color: '#F6FAF7', fontSize: 34, fontWeight: '900', marginTop: 6 },
  totalMacros: { color: '#62E62C', marginTop: 8, fontWeight: '700' },
  sectionTitle: { color: '#F6FAF7', fontSize: 21, fontWeight: '800', marginTop: 30, marginBottom: 12 },
  mealTypeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  mealTypeChip: { backgroundColor: '#101C14', borderColor: '#25372B', borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 },
  selected: { backgroundColor: '#132718', borderColor: '#62E62C' },
  chipText: { color: '#F6FAF7', fontWeight: '700' },
  input: { backgroundColor: '#101C14', borderColor: '#25372B', borderWidth: 1, borderRadius: 14, color: '#F6FAF7', fontSize: 16, paddingHorizontal: 16, paddingVertical: 14, marginTop: 12 },
  searchResult: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, borderBottomColor: '#18251D', borderBottomWidth: 1 },
  flex: { flex: 1 },
  foodName: { color: '#F6FAF7', fontWeight: '800', fontSize: 15 },
  foodMeta: { color: '#95A59B', marginTop: 4, fontSize: 13 },
  foodCalories: { color: '#62E62C', fontWeight: '800' },
  selectedFoodCard: { backgroundColor: '#101C14', borderColor: '#31533A', borderWidth: 1, borderRadius: 18, padding: 16, marginTop: 12 },
  selectedLabel: { color: '#62E62C', fontSize: 12, fontWeight: '800', marginBottom: 6 },
  servingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  servingInput: { width: 80, marginTop: 0 },
  addButton: { marginLeft: 'auto', backgroundColor: '#62E62C', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13 },
  addButtonText: { color: '#07110B', fontWeight: '900' },
  disabled: { opacity: 0.6 },
  error: { color: '#FF8E8E', marginTop: 14 },
  helper: { color: '#7E8E84', lineHeight: 20 },
  mealCard: { backgroundColor: '#101C14', borderColor: '#223228', borderWidth: 1, borderRadius: 18, padding: 16, marginBottom: 12 },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  mealTitle: { color: '#F6FAF7', fontSize: 18, fontWeight: '800' },
  mealCalories: { color: '#62E62C', fontWeight: '800' },
  entryRow: { flexDirection: 'row', gap: 12, alignItems: 'center', paddingVertical: 12, borderTopColor: '#18251D', borderTopWidth: 1 },
  remove: { color: '#FF9A9A', fontWeight: '800' },
});
