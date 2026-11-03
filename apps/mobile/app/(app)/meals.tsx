import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState, type ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Chip } from '../../src/components/Chip';
import { Input } from '../../src/components/Input';
import { Screen } from '../../src/components/Screen';
import { useAuth } from '../../src/features/auth/AuthProvider';
import { foodCatalogApi, type Food } from '../../src/features/foods/api';
import { mealTrackingApi, type DailyMealSummary, type MealType } from '../../src/features/meals/api';
import { confirmAction } from '../../src/features/shared/confirm';
import { formatLongDate, useToday } from '../../src/features/shared/dates';
import { toUserFacingError } from '../../src/features/shared/errors';
import { colors, radius, spacing, typography } from '../../src/theme';

type MealIconName = ComponentProps<typeof Ionicons>['name'];

const mealTypes: { value: MealType; label: string; icon: MealIconName }[] = [
  { value: 'Breakfast', label: 'Desayuno', icon: 'cafe-outline' },
  { value: 'Lunch', label: 'Almuerzo', icon: 'restaurant-outline' },
  { value: 'Dinner', label: 'Cena', icon: 'moon-outline' },
  { value: 'Snack', label: 'Snacks', icon: 'nutrition-outline' },
];

export default function MealTrackingScreen() {
  const { session } = useAuth();
  const today = useToday();
  const accessToken = session?.accessToken;

  const [summary, setSummary] = useState<DailyMealSummary | null>(null);
  const [mealType, setMealType] = useState<MealType>('Breakfast');
  const [query, setQuery] = useState('');
  const [foods, setFoods] = useState<Food[]>([]);
  const [searching, setSearching] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [servings, setServings] = useState('1');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDay = useCallback(async () => {
    if (!accessToken) return;
    setError(null);
    try {
      setSummary(await mealTrackingApi.getDay(accessToken, today));
    } catch (cause) {
      setError(toUserFacingError(cause, 'No fue posible cargar tu diario de comidas.'));
    }
  }, [accessToken, today]);

  useEffect(() => {
    setLoading(true);
    void loadDay().finally(() => setLoading(false));
  }, [loadDay]);

  useEffect(() => {
    const term = query.trim();
    // Si el texto es el nombre del alimento ya elegido, no volver a buscar.
    if (!accessToken || term.length < 2 || (selectedFood && query === selectedFood.name)) {
      setFoods([]);
      setNoResults(false);
      setSearching(false);
      return;
    }

    let cancelled = false;
    setSearching(true);
    const timer = setTimeout(() => {
      foodCatalogApi.search(accessToken, term)
        .then((results) => {
          if (cancelled) return;
          setFoods(results);
          setNoResults(results.length === 0);
          setError(null);
        })
        .catch((cause) => {
          if (!cancelled) setError(toUserFacingError(cause, 'No fue posible buscar alimentos.'));
        })
        .finally(() => {
          if (!cancelled) setSearching(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [accessToken, query, selectedFood]);

  const groups = useMemo(() => mealTypes.map(({ value, label, icon }) => ({
    value,
    label,
    icon,
    meal: summary?.meals.find((meal) => meal.type === value),
  })), [summary]);

  if (!session || !accessToken) return null;

  async function refresh() {
    setRefreshing(true);
    await loadDay();
    setRefreshing(false);
  }

  async function addSelectedFood() {
    if (!selectedFood || !accessToken) return;
    // Algunos teclados decimales escriben coma (1,5).
    const parsedServings = Number(servings.replace(',', '.'));
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
      setError(toUserFacingError(cause, 'No fue posible registrar el alimento.'));
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
      setError(toUserFacingError(cause, 'No fue posible eliminar el alimento.'));
    } finally {
      setSaving(false);
    }
  }

  function confirmRemove(entry: { id: string; foodName: string }, type: MealType) {
    confirmAction({
      title: 'Eliminar alimento',
      message: `¿Quitar "${entry.foodName}" de tu diario?`,
      confirmLabel: 'Eliminar',
      onConfirm: () => void removeEntry(entry.id, type),
    });
  }

  return (
    <Screen
      eyebrow="NUTRIFLOW · DIARIO"
      onRefresh={refresh}
      refreshing={refreshing}
      subtitle={`${formatLongDate(today)} · registra lo que consumes y conserva un historial nutricional.`}
      title="Diario de comidas"
    >
      <Card style={styles.total} variant="raised">
        <Text style={styles.totalLabel}>Consumido hoy</Text>
        <Text style={styles.totalCalories}>{Math.round(summary?.calories ?? 0)} kcal</Text>
        <Text style={styles.totalMacros}>
          P {Math.round(summary?.proteinGrams ?? 0)} g · C {Math.round(summary?.carbohydrateGrams ?? 0)} g · G {Math.round(summary?.fatGrams ?? 0)} g
        </Text>
      </Card>

      <Text accessibilityRole="header" style={styles.sectionTitle}>Agregar alimento</Text>
      <View style={styles.chips}>
        {mealTypes.map((item) => (
          <Chip icon={item.icon} key={item.value} label={item.label} onPress={() => setMealType(item.value)} selected={mealType === item.value} />
        ))}
      </View>

      <Input
        accessibilityLabel="Buscar alimento o marca"
        containerStyle={styles.search}
        onChangeText={(value) => { setQuery(value); setSelectedFood(null); }}
        placeholder="Buscar alimento o marca"
        returnKeyType="search"
        value={query}
      />

      {searching ? <Text style={[typography.caption, styles.hint]}>Buscando…</Text> : null}
      {!searching && noResults ? <Text style={[typography.caption, styles.hint]}>No encontramos alimentos con ese nombre.</Text> : null}

      {foods.slice(0, 8).map((food) => (
        <Pressable
          accessibilityLabel={`${food.name}, ${Math.round(food.calories)} calorías`}
          accessibilityRole="button"
          key={food.id}
          onPress={() => { setSelectedFood(food); setQuery(food.name); setFoods([]); }}
          style={({ pressed }) => [styles.searchResult, pressed && styles.pressed]}
        >
          <View style={styles.flex}>
            <Text style={styles.foodName}>{food.name}</Text>
            <Text style={styles.foodMeta}>{food.brand ? `${food.brand} · ` : ''}{food.servingSize} {food.servingUnit}</Text>
          </View>
          <Text style={styles.foodCalories}>{Math.round(food.calories)} kcal</Text>
        </Pressable>
      ))}

      {selectedFood ? (
        <Card style={styles.selectedFood}>
          <Text style={styles.selectedLabel}>SELECCIONADO</Text>
          <Text style={styles.foodName}>{selectedFood.name}</Text>
          <View style={styles.servingRow}>
            <Input
              accessibilityLabel="Cantidad de porciones"
              containerStyle={styles.servingInput}
              keyboardType="decimal-pad"
              onChangeText={setServings}
              value={servings}
            />
            <Text style={styles.foodMeta}>porciones</Text>
            <Button label="Agregar" loading={saving} onPress={() => void addSelectedFood()} style={styles.addButton} />
          </View>
        </Card>
      ) : null}

      {error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}

      <Text accessibilityRole="header" style={styles.sectionTitle}>Tus comidas</Text>
      {loading && !summary ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
          <Text style={typography.caption}>Cargando diario…</Text>
        </View>
      ) : null}

      {groups.map(({ value, label, icon, meal }) => (
        <Card key={value} style={styles.mealCard}>
          <View style={styles.mealHeader}>
            <View style={styles.mealHeading}>
              <View style={styles.mealIconBadge}>
                <Ionicons color={colors.primary} name={icon} size={20} />
              </View>
              <Text style={styles.mealTitle}>{label}</Text>
            </View>
            <Text style={styles.mealCalories}>{Math.round(meal?.calories ?? 0)} kcal</Text>
          </View>

          {!meal?.entries.length ? <Text style={typography.caption}>Aún no has registrado alimentos.</Text> : null}

          {meal?.entries.map((entry) => (
            <View key={entry.id} style={styles.entryRow}>
              <View style={styles.flex}>
                <Text style={styles.foodName}>{entry.foodName}</Text>
                <Text style={styles.foodMeta}>{entry.servings} × {entry.servingSize} {entry.servingUnit} · {Math.round(entry.calories)} kcal</Text>
              </View>
              <Pressable
                accessibilityLabel={`Eliminar ${entry.foodName}`}
                accessibilityRole="button"
                disabled={saving}
                hitSlop={10}
                onPress={() => confirmRemove(entry, value)}
                style={styles.removeButton}
              >
                <Ionicons color={colors.danger} name="trash-outline" size={20} />
              </Pressable>
            </View>
          ))}
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  total: { gap: 6, marginTop: spacing.xl },
  totalLabel: { color: colors.textSecondary, fontWeight: '700' },
  totalCalories: { color: colors.text, fontSize: 34, fontWeight: '900' },
  totalMacros: { color: colors.primary, fontWeight: '700' },
  sectionTitle: { ...typography.heading, marginBottom: spacing.md, marginTop: 30 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  search: { marginTop: spacing.md },
  hint: { marginTop: spacing.sm },
  searchResult: { alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', gap: spacing.md, minHeight: 56, paddingVertical: 13 },
  pressed: { backgroundColor: colors.surfaceRaised },
  foodName: { color: colors.text, fontSize: 15, fontWeight: '800' },
  foodMeta: { color: colors.textSecondary, fontSize: 13, marginTop: 4 },
  foodCalories: { color: colors.primary, fontWeight: '800' },
  selectedFood: { borderColor: colors.borderAccent, marginTop: spacing.md },
  selectedLabel: { color: colors.primary, fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 6 },
  servingRow: { alignItems: 'center', flexDirection: 'row', gap: 10, marginTop: 10 },
  servingInput: { width: 84 },
  addButton: { marginLeft: 'auto', minWidth: 110 },
  error: { color: colors.danger, lineHeight: 20, marginTop: spacing.lg },
  loading: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  mealCard: { marginBottom: spacing.md },
  mealHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  mealHeading: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  mealIconBadge: { alignItems: 'center', backgroundColor: '#17331D', borderColor: colors.borderAccent, borderRadius: 11, borderWidth: 1, height: 38, justifyContent: 'center', width: 38 },
  mealTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  mealCalories: { color: colors.primary, fontWeight: '800' },
  entryRow: { alignItems: 'center', borderTopColor: '#18251D', borderTopWidth: 1, flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.md },
  removeButton: { alignItems: 'center', borderRadius: radius.sm, height: 40, justifyContent: 'center', width: 40 },
});
