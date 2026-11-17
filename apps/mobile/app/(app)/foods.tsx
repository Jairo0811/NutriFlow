import { Screen } from '../../src/components/Screen';
import { useEffect, useState } from 'react';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Input } from '../../src/components/Input';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '../../src/features/auth/AuthProvider';
import { engagementApi } from '../../src/features/engagement/api';
import { foodCatalogApi, type Food } from '../../src/features/foods/api';
import { toUserFacingError } from '../../src/features/shared/errors';
import { colors } from '../../src/theme';

export default function FoodCatalogScreen() {
  const { session } = useAuth();
  const accessToken = session?.accessToken;
  const [query, setQuery] = useState('');
  const [foods, setFoods] = useState<Food[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!accessToken) return;
    let active = true;
    setLoading(true);
    setFoods([]);
    setError(null);
    const timeout = setTimeout(() => {
      void foodCatalogApi.search(accessToken, query)
        .then((items) => { if (active) setFoods(items); })
        .catch((cause) => { if (active) setError(toUserFacingError(cause, 'No fue posible cargar el catálogo.')); })
        .finally(() => { if (active) setLoading(false); });
    }, 250);

    return () => { active = false; clearTimeout(timeout); };
  }, [query, accessToken, reload]);

  useEffect(() => {
    if (!accessToken) return;
    void engagementApi.getFavorites(accessToken)
      .then((favorites) => setFavoriteIds(favorites.map((favorite) => favorite.foodId)))
      .catch(() => undefined);
  }, [accessToken]);

  if (!session || !accessToken) return null;

  async function toggleFavorite(foodId: string) {
    if (!accessToken) return;
    setError(null);
    try {
      const favorites = favoriteIds.includes(foodId)
        ? await engagementApi.removeFavorite(accessToken, foodId)
        : await engagementApi.addFavorite(accessToken, foodId);
      setFavoriteIds(favorites.map((favorite) => favorite.foodId));
    } catch (cause) {
      setError(toUserFacingError(cause, 'No fue posible actualizar favoritos.'));
    }
  }

  return (
    <Screen eyebrow="NUTRIFLOW · ALIMENTOS" title="Catálogo de alimentos" subtitle="Busca alimentos por nombre, marca o código de barras. Guarda tus preferidos." onRefresh={() => setReload((n) => n + 1)} refreshing={loading}>
        

        <Input label="Buscar" value={query} onChangeText={setQuery} placeholder="Buscar alimento…" autoCapitalize="none" containerStyle={styles.search} />

        {loading && <Text style={styles.helper}>Cargando catálogo…</Text>}
        {error && <Card><Text style={styles.error}>{error}</Text><Button label="Reintentar" variant="secondary" onPress={() => setReload((n) => n + 1)} /></Card>}
        {!loading && !error && foods.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Aún no hay resultados</Text>
            <Text style={styles.helper}>Prueba con otro nombre, marca o registra alimentos en el catálogo.</Text>
          </View>
        )}

        {!loading && !error && foods.map((food) => {
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
                <Pressable accessibilityRole="button" onPress={() => void toggleFavorite(food.id)} style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}>
                  <Text style={[styles.favoriteText, isFavorite && styles.favoriteTextActive]}>{isFavorite ? '★ Favorito' : '☆ Guardar'}</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </Screen>
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
  search: { marginTop: 24 },
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: 24, paddingBottom: 48 },
  back: { color: colors.textSoft, fontWeight: '700' },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: '800', letterSpacing: 1.4, marginTop: 30 },
  title: { color: colors.text, fontSize: 32, fontWeight: '800', marginTop: 10 },
  subtitle: { color: colors.textSecondary, fontSize: 15, lineHeight: 23, marginTop: 10 },
  input: { backgroundColor: colors.surface, borderColor: colors.borderInput, borderWidth: 1, borderRadius: 14, color: colors.text, fontSize: 16, marginTop: 24, paddingHorizontal: 16, paddingVertical: 14 },
  helper: { color: colors.textMuted, fontSize: 14, lineHeight: 20, marginTop: 16 },
  error: { color: colors.danger, marginTop: 16 },
  emptyCard: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 18, marginTop: 18, padding: 20 },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 18, marginTop: 14, padding: 18 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  cardHeading: { flex: 1 },
  foodName: { color: colors.text, fontSize: 17, fontWeight: '800' },
  meta: { color: colors.textSecondary, fontSize: 13, marginTop: 5 },
  calories: { color: colors.primary, fontSize: 16, fontWeight: '900' },
  macrosRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  macro: { flex: 1, backgroundColor: colors.surfaceDeep, borderRadius: 12, padding: 10 },
  macroValue: { color: colors.text, fontSize: 14, fontWeight: '800' },
  macroLabel: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
  footerRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  category: { color: colors.primary, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  favoriteButton: { borderColor: colors.borderButton, borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 7 },
  favoriteButtonActive: { backgroundColor: colors.successSurface, borderColor: colors.primary },
  favoriteText: { color: colors.textSoft, fontSize: 12, fontWeight: '800' },
  favoriteTextActive: { color: colors.primary },
});
