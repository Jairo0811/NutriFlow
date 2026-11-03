import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../src/features/auth/AuthProvider';
import { engagementApi, type EngagementOverview, type FavoriteFood, type Recipe } from '../../src/features/engagement/api';
import { colors } from '../../src/theme';

export default function EngagementScreen() {
  const { session } = useAuth();
  const [overview, setOverview] = useState<EngagementOverview | null>(null);
  const [favorites, setFavorites] = useState<FavoriteFood[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipeName, setRecipeName] = useState('');
  const [selectedFoodIds, setSelectedFoodIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session) return;
    setError(null);
    try {
      const [nextOverview, nextFavorites, nextRecipes] = await Promise.all([
        engagementApi.getOverview(session.accessToken),
        engagementApi.getFavorites(session.accessToken),
        engagementApi.getRecipes(session.accessToken),
      ]);
      setOverview(nextOverview);
      setFavorites(nextFavorites);
      setRecipes(nextRecipes);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible cargar Engagement.');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => { void load(); }, [load]);

  if (!session) return null;

  async function addWater(amount: number) {
    try {
      const water = await engagementApi.addWater(session!.accessToken, amount);
      setOverview((current) => current ? { ...current, water } : current);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible registrar agua.');
    }
  }

  async function removeWater(entryId: string) {
    try {
      const water = await engagementApi.removeWater(session!.accessToken, entryId);
      setOverview((current) => current ? { ...current, water } : current);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible eliminar el registro.');
    }
  }

  function toggleIngredient(foodId: string) {
    setSelectedFoodIds((current) => current.includes(foodId)
      ? current.filter((id) => id !== foodId)
      : [...current, foodId]);
  }

  async function createRecipe() {
    if (!recipeName.trim() || selectedFoodIds.length === 0) {
      setError('Escribe un nombre y selecciona al menos un alimento favorito.');
      return;
    }

    try {
      await engagementApi.createRecipe(session!.accessToken, {
        name: recipeName.trim(),
        servings: 1,
        ingredients: selectedFoodIds.map((foodId) => ({ foodId, servings: 1 })),
      });
      setRecipeName('');
      setSelectedFoodIds([]);
      setRecipes(await engagementApi.getRecipes(session!.accessToken));
      setOverview(await engagementApi.getOverview(session!.accessToken));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible crear la receta.');
    }
  }

  async function removeRecipe(recipeId: string) {
    try {
      await engagementApi.removeRecipe(session!.accessToken, recipeId);
      setRecipes(await engagementApi.getRecipes(session!.accessToken));
      setOverview(await engagementApi.getOverview(session!.accessToken));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible eliminar la receta.');
    }
  }

  const water = overview?.water;

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable onPress={() => router.back()}><Text style={styles.back}>Atrás</Text></Pressable>
        <Text style={styles.eyebrow}>NUTRIFLOW · FASE 13</Text>
        <Text style={styles.title}>Engagement Hub</Text>
        <Text style={styles.subtitle}>Construye consistencia con hidratación, favoritos, recetas y rachas basadas en actividad real.</Text>

        {loading && <Text style={styles.helper}>Cargando tus hábitos…</Text>}
        {error && <Text style={styles.error}>{error}</Text>}

        {overview && (
          <View style={styles.statsRow}>
            <Stat label="Racha" value={`${overview.currentStreakDays} días`} />
            <Stat label="Récord" value={`${overview.longestStreakDays} días`} />
            <Stat label="Favoritos" value={`${overview.favoriteFoods}`} />
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>💧 Hidratación diaria</Text>
          <Text style={styles.cardText}>
            {water ? `${water.consumedOunces.toFixed(0)} / ${water.targetOunces.toFixed(0)} oz · ${water.percentComplete}%` : 'Cargando…'}
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.min(water?.percentComplete ?? 0, 100)}%` }]} />
          </View>
          <View style={styles.quickRow}>
            {[8, 16, 24].map((amount) => (
              <Pressable key={amount} onPress={() => void addWater(amount)} style={styles.quickButton}>
                <Text style={styles.quickText}>+{amount} oz</Text>
              </Pressable>
            ))}
          </View>
          {water?.entries.map((entry) => (
            <View key={entry.id} style={styles.itemRow}>
              <Text style={styles.itemText}>{entry.amountOunces.toFixed(0)} oz</Text>
              <Pressable onPress={() => void removeWater(entry.id)}><Text style={styles.removeText}>Eliminar</Text></Pressable>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>⭐ Alimentos favoritos</Text>
          {favorites.length === 0 ? (
            <Text style={styles.helper}>Guarda alimentos desde el catálogo para reutilizarlos aquí.</Text>
          ) : favorites.map((food) => (
            <View key={food.foodId} style={styles.favoriteRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemText}>{food.name}</Text>
                <Text style={styles.meta}>{Math.round(food.calories)} kcal · P {food.proteinGrams.toFixed(0)} g</Text>
              </View>
            </View>
          ))}
          <Pressable onPress={() => router.push('/foods')} style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>Abrir catálogo</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🥗 Crear receta rápida</Text>
          <TextInput
            value={recipeName}
            onChangeText={setRecipeName}
            placeholder="Nombre de la receta"
            placeholderTextColor={colors.placeholder}
            style={styles.input}
          />
          <Text style={styles.helper}>Selecciona favoritos como ingredientes:</Text>
          {favorites.map((food) => {
            const selected = selectedFoodIds.includes(food.foodId);
            return (
              <Pressable key={food.foodId} onPress={() => toggleIngredient(food.foodId)} style={[styles.selectRow, selected && styles.selectRowActive]}>
                <Text style={styles.itemText}>{selected ? '✓ ' : ''}{food.name}</Text>
              </Pressable>
            );
          })}
          <Pressable onPress={() => void createRecipe()} style={styles.primaryButton}>
            <Text style={styles.primaryText}>Guardar receta</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📚 Mis recetas</Text>
          {recipes.length === 0 ? <Text style={styles.helper}>Todavía no has creado recetas.</Text> : recipes.map((recipe) => (
            <View key={recipe.id} style={styles.recipeCard}>
              <Text style={styles.itemText}>{recipe.name}</Text>
              <Text style={styles.meta}>{Math.round(recipe.caloriesPerServing)} kcal · P {recipe.proteinGramsPerServing.toFixed(1)} g · C {recipe.carbohydrateGramsPerServing.toFixed(1)} g · G {recipe.fatGramsPerServing.toFixed(1)} g</Text>
              <Text style={styles.meta}>{recipe.ingredients.length} ingredientes</Text>
              <Pressable onPress={() => void removeRecipe(recipe.id)}><Text style={styles.removeText}>Eliminar receta</Text></Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
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
  helper: { color: colors.textMuted, fontSize: 14, lineHeight: 20, marginTop: 10 },
  error: { color: colors.danger, marginTop: 14 },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 20 },
  stat: { flex: 1, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 14, padding: 12 },
  statValue: { color: colors.text, fontWeight: '900', fontSize: 16 },
  statLabel: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 18, marginTop: 16, padding: 18 },
  cardTitle: { color: colors.text, fontSize: 18, fontWeight: '900' },
  cardText: { color: colors.textSoft, marginTop: 10 },
  progressTrack: { backgroundColor: colors.border, borderRadius: 999, height: 10, marginTop: 12, overflow: 'hidden' },
  progressFill: { backgroundColor: colors.primary, height: '100%' },
  quickRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  quickButton: { flex: 1, alignItems: 'center', backgroundColor: colors.surfaceRaised, borderRadius: 12, padding: 12 },
  quickText: { color: colors.primary, fontWeight: '900' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  favoriteRow: { flexDirection: 'row', marginTop: 12 },
  itemText: { color: colors.text, fontWeight: '800' },
  meta: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
  removeText: { color: '#FF9B9B', fontSize: 12, fontWeight: '800', marginTop: 8 },
  secondaryButton: { alignItems: 'center', borderColor: colors.borderButton, borderRadius: 12, borderWidth: 1, marginTop: 14, padding: 13 },
  secondaryText: { color: colors.textSoft, fontWeight: '800' },
  input: { backgroundColor: '#0B160F', borderColor: colors.borderInput, borderWidth: 1, borderRadius: 12, color: colors.text, fontSize: 15, marginTop: 14, padding: 13 },
  selectRow: { borderColor: '#2A3C30', borderRadius: 10, borderWidth: 1, marginTop: 8, padding: 11 },
  selectRowActive: { backgroundColor: '#17331D', borderColor: colors.primary },
  primaryButton: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: 12, marginTop: 14, padding: 14 },
  primaryText: { color: colors.background, fontWeight: '900' },
  recipeCard: { borderTopColor: colors.border, borderTopWidth: 1, marginTop: 14, paddingTop: 14 },
});
