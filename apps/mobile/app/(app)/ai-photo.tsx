import { useEffect, useRef, useState } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useAuth } from '../../src/features/auth/AuthProvider';
import { AiApiError, aiApi, type AiFoodProposal, type MealType } from '../../src/features/ai/api';

const mealTypes: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export default function AiMealPhotoScreen() {
  const { session } = useAuth();
  const accessToken = session?.accessToken;
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [proposals, setProposals] = useState<AiFoodProposal[]>([]);
  const [mealType, setMealType] = useState<MealType>('Lunch');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    void aiApi.getStatus(accessToken)
      .then(status => setEnabled(status.mealPhotoEnabled))
      .catch(() => setMessage('No fue posible comprobar el acceso a Meal Photo.'));
  }, [accessToken]);

  if (!session || !accessToken) return null;

  if (enabled === false) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.eyebrow}>NUTRIFLOW · PREMIUM</Text>
          <Text style={styles.title}>Meal Photo AI</Text>
          <Text style={styles.subtitle}>El análisis de comidas por foto requiere NutriFlow Premium. La foto nunca registra alimentos automáticamente.</Text>
          <Pressable onPress={() => router.back()} style={styles.button}><Text style={styles.buttonText}>Volver</Text></Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission?.granted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.title}>Meal Photo AI</Text>
          <Text style={styles.subtitle}>NutriFlow necesita acceso a la cámara para analizar tu plato.</Text>
          <Pressable onPress={() => void requestPermission()} style={styles.button}><Text style={styles.buttonText}>Permitir cámara</Text></Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const valid = proposals.filter(item => item.foodId && item.hasCatalogMatch && !item.hasDietaryConflict);

  async function captureAndAnalyze() {
    if (!cameraReady || busy || !cameraRef.current) return;
    setBusy(true);
    setMessage('Analizando la foto…');
    setProposals([]);
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.45 });
      if (!photo?.base64) throw new Error('La cámara no devolvió datos de imagen.');
      const result = await aiApi.analyzeMealPhoto(accessToken!, `data:image/jpeg;base64,${photo.base64}`, localDate(new Date()));
      setProposals(result.items);
      setMessage(result.items.length === 0 ? 'La IA no identificó alimentos con suficiente claridad.' : 'Revisa las propuestas antes de confirmar.');
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function confirm() {
    const items = valid.map(item => ({ foodId: item.foodId!, servings: item.servings }));
    if (items.length === 0) return;
    setBusy(true);
    try {
      await aiApi.confirmMeal(accessToken!, mealType, items, localDate(new Date()));
      setMessage('Comida confirmada y agregada al diario.');
      setProposals([]);
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable onPress={() => router.back()}><Text style={styles.back}>Atrás</Text></Pressable>
        <Text style={styles.eyebrow}>NUTRIFLOW · MEAL PHOTO AI</Text>
        <Text style={styles.title}>Fotografía tu comida</Text>
        <Text style={styles.subtitle}>La IA estima qué hay en el plato y las porciones. Nada se registra sin tu confirmación.</Text>

        <CameraView ref={cameraRef} facing="back" style={styles.camera} onCameraReady={() => setCameraReady(true)} />
        <Pressable disabled={!cameraReady || busy} onPress={() => void captureAndAnalyze()} style={styles.button}>
          <Text style={styles.buttonText}>{busy ? 'Procesando…' : 'Tomar foto y analizar'}</Text>
        </Pressable>

        {proposals.map((item, index) => (
          <View key={`${item.detectedName}-${index}`} style={styles.card}>
            <Text style={styles.foodName}>{item.catalogName ?? item.detectedName}</Text>
            <Text style={styles.meta}>{item.servings.toFixed(1)} porción(es) · confianza {Math.round(item.confidence * 100)}%</Text>
            {!item.hasCatalogMatch && <Text style={styles.warning}>Sin coincidencia en el catálogo; no se registrará.</Text>}
            {item.hasDietaryConflict && <Text style={styles.warning}>⚠️ Bloqueado por: {item.conflictingRestrictionCodes.join(', ')}</Text>}
          </View>
        ))}

        {proposals.length > 0 && (
          <View style={styles.mealRow}>
            {mealTypes.map(type => (
              <Pressable key={type} onPress={() => setMealType(type)} style={[styles.chip, mealType === type && styles.chipActive]}>
                <Text style={[styles.chipText, mealType === type && styles.chipTextActive]}>{type}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {valid.length > 0 && (
          <Pressable disabled={busy} onPress={() => void confirm()} style={styles.button}>
            <Text style={styles.buttonText}>Confirmar elementos válidos</Text>
          </Pressable>
        )}

        {message && <Text style={styles.message}>{message}</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

function errorMessage(error: unknown) {
  if (error instanceof AiApiError) {
    if (error.code === 'usage_limit_reached') return 'Alcanzaste tu cuota mensual de NutriFlow AI.';
    if (error.code === 'premium_required') return 'Meal Photo AI requiere NutriFlow Premium.';
    if (error.code === 'dietary_conflict') return 'NutriFlow bloqueó un alimento por tus restricciones guardadas.';
    return error.message;
  }
  return error instanceof Error ? error.message : 'No fue posible analizar la foto.';
}

function localDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#07110B' },
  container: { padding: 24, paddingBottom: 48 },
  center: { flex: 1, justifyContent: 'center', padding: 24 },
  back: { color: '#DDE5DF', fontWeight: '700' },
  eyebrow: { color: '#62E62C', fontSize: 12, fontWeight: '900', letterSpacing: 1.3, marginTop: 24 },
  title: { color: '#F6FAF7', fontSize: 30, fontWeight: '900', marginTop: 10 },
  subtitle: { color: '#95A59B', fontSize: 15, lineHeight: 22, marginTop: 9 },
  camera: { height: 430, borderRadius: 22, marginTop: 20, overflow: 'hidden' },
  button: { alignItems: 'center', backgroundColor: '#62E62C', borderRadius: 14, marginTop: 14, padding: 16 },
  buttonText: { color: '#07110B', fontWeight: '900' },
  card: { backgroundColor: '#101C14', borderColor: '#31533A', borderRadius: 16, borderWidth: 1, marginTop: 12, padding: 16 },
  foodName: { color: '#F6FAF7', fontSize: 16, fontWeight: '900' },
  meta: { color: '#95A59B', fontSize: 13, marginTop: 5 },
  warning: { color: '#FFB1B1', fontSize: 12, fontWeight: '800', marginTop: 7 },
  mealRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  chip: { borderColor: '#36503E', borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9 },
  chipActive: { backgroundColor: '#62E62C', borderColor: '#62E62C' },
  chipText: { color: '#DDE5DF', fontSize: 12, fontWeight: '800' },
  chipTextActive: { color: '#07110B' },
  message: { color: '#FFCC80', fontWeight: '800', marginTop: 16, textAlign: 'center' },
});
