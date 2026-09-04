import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useAuth } from '../../src/features/auth/AuthProvider';
import { engagementApi } from '../../src/features/engagement/api';
import { foodCatalogApi, type Food } from '../../src/features/foods/api';

export default function FoodCatalogScreen() {
  const { session } = useAuth();
  const [query, setQuery] = useState('');
  const [foods, setFoods] = useState<Food[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    const accessToken = session.accessToken;
    const timeout = setTimeout(() => {
      setLoading(true);
      setError(null);
      void foodCatalogApi.search(accessToken, query)
        .then(setFoods)
        .catch((cause) => setError(cause instanceof Error ? cause.message : 'No fue posible cargar el catálogo.'))
        .finally(() => setLoading(false));
    }, 250);

    return () => clearTimeout(timeout);
  }, [query, session]);

  useEffect(() => {
    if (!session) return;
    void engagementApi.getFavorites(session.accessToken)
      .then((favorites) => setFavoriteIds(favorites.map((favorite) => favorite.foodId)))
      .catch(() => undefined);
  }, [session]);

  if (!session) return null;

  async function toggleFavorite(foodId: string) {
    try {
      const favorites = favoriteIds.includes(foodId)
        ? await engagementApi.removeFavorite(session!.accessToken, foodId)
        : await engagementApi.addFavorite(session!.accessToken, foodId);
      setFavoriteIds(favorites.map((favorite) => favorite.foodId));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible actualizar favoritos.');
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()}><Text style={styles.back}>Atrás</Text></Pressable>
        <Text style={styles.eyebrow}>NUTRIFLOW · FASE 4 + 13</Text>
        <Text style={styles.title}>Catálogo de alimentos</Text>
        <Text style={styles.subtitle}>Busca alimentos por nombre, marca o código de barras. Guarda tus preferidos para reutilizarlos en recetas y accesos rápidos.</Text>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar alimento…"
          placeholderTextColor="#637268"
          style={styles.input}
          autoCapitalize="none"
        />

        {loading && <Text style={styles.helper}>Cargando catálogo…</Text>}
        {error && <Text style={styles.error}>{error}</Text>}
        {!loading && !error && foods.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Aún no hay resultados</Text>
            <Text style={styles.helper}>El catálogo puede poblarse mediante la API con alimentos estructurados. La integración con fuentes externas se mantiene desacoplada.</Text>
          </View>
        )}

        {foods.map((food) => {
          const isFavorite = favoriteIds.includes(food.id);
          return (
            <View key={food.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeading}>
                  <Text style={styles.foodName}>{food.name}</Text>
                  <Text style={styles.meta}>{food.brand ? `${food.brand} · ` : ''}{food.servingSize} {food.servingUnit}</Text>
                </View>
                <Text style={styles.calories}>{Math.round(food.calories)} kcal</Text>
              </View>
              <View style={styles.macrosRow}>
                <Macro label="Proteína" value={food.proteinGrams} />
                <Macro label="Carbs" value={food.carbohydrateGrams} />
                <Macro label="Grasas" value={food.fatGrams} />
              </View>
              <View style={styles.footerRow}>
                <Text style={styles.category}>{food.category}</Text>
                <Pressable onPress={() => void toggleFavorite(food.id)} style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}>
                  <Text style={[styles.favoriteText, isFavorite && styles.favoriteTextActive]}>{isFavorite ? '★ Favorito' : '☆ Guardar'}</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function Macro({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.macro}>
      <Text style={styles.macroValue}>{value.toFixed(1)} g</Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#07110B' },
  container: { padding: 24, paddingBottom: 48 },
  back: { color: '#DDE5DF', fontWeight: '700' },
  eyebrow: { color: '#62E62C', fontSize: 12, fontWeight: '800', letterSpacing: 1.4, marginTop: 30 },
  title: { color: '#F6FAF7', fontSize: 32, fontWeight: '800', marginTop: 10 },
  subtitle: { color: '#95A59B', fontSize: 15, lineHeight: 23, marginTop: 10 },
  input: { backgroundColor: '#101C14', borderColor: '#25372B', borderWidth: 1, borderRadius: 14, color: '#F6FAF7', fontSize: 16, marginTop: 24, paddingHorizontal: 16, paddingVertical: 14 },
  helper: { color: '#7E8E84', fontSize: 14, lineHeight: 20, marginTop: 16 },
  error: { color: '#FF8E8E', marginTop: 16 },
  emptyCard: { backgroundColor: '#101C14', borderColor: '#223228', borderWidth: 1, borderRadius: 18, marginTop: 18, padding: 20 },
  emptyTitle: { color: '#F6FAF7', fontSize: 18, fontWeight: '800' },
  card: { backgroundColor: '#101C14', borderColor: '#223228', borderWidth: 1, borderRadius: 18, marginTop: 14, padding: 18 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  cardHeading: { flex: 1 },
  foodName: { color: '#F6FAF7', fontSize: 17, fontWeight: '800' },
  meta: { color: '#95A59B', fontSize: 13, marginTop: 5 },
  calories: { color: '#62E62C', fontSize: 16, fontWeight: '900' },
  macrosRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  macro: { flex: 1, backgroundColor: '#0B160F', borderRadius: 12, padding: 10 },
  macroValue: { color: '#F6FAF7', fontSize: 14, fontWeight: '800' },
  macroLabel: { color: '#7E8E84', fontSize: 11, marginTop: 4 },
  footerRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  category: { color: '#62E62C', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  favoriteButton: { borderColor: '#36503E', borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 7 },
  favoriteButtonActive: { backgroundColor: '#17331D', borderColor: '#62E62C' },
  favoriteText: { color: '#DDE5DF', fontSize: 12, fontWeight: '800' },
  favoriteTextActive: { color: '#62E62C' },
});
