import { useState } from 'react';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../src/features/auth/AuthProvider';
import { foodCatalogApi, type Food } from '../../src/features/foods/api';
import { checkFoodCompatibility, type FoodCompatibility } from '../../src/features/preferences/api';

export default function BarcodeScannerScreen() {
  const { session } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [food, setFood] = useState<Food | null>(null);
  const [compatibility, setCompatibility] = useState<FoodCompatibility | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!session) return null;

  async function onScanned(result: BarcodeScanningResult) {
    if (scanned) return;
    setScanned(true);
    setFood(null);
    setCompatibility(null);
    setMessage('Consultando el catálogo…');

    try {
      const found = await foodCatalogApi.getByBarcode(session.accessToken, result.data);
      setFood(found);
      setCompatibility(await checkFoodCompatibility(session.accessToken, found.id));
      setMessage(null);
    } catch {
      setMessage(`No encontramos el código ${result.data} en el catálogo.`);
    }
  }

  if (!permission?.granted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.title}>Escanea tus alimentos</Text>
          <Text style={styles.subtitle}>NutriFlow necesita acceso a la cámara para leer códigos de barras.</Text>
          <Pressable onPress={() => void requestPermission()} style={styles.button}>
            <Text style={styles.buttonText}>Permitir cámara</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>NUTRIFLOW · FASE 7 + 9</Text>
        <Text style={styles.title}>Escanea tus alimentos</Text>
        <CameraView
          style={styles.camera}
          barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'] }}
          onBarcodeScanned={scanned ? undefined : (result) => void onScanned(result)}
        />

        {food && (
          <View style={styles.card}>
            <Text style={styles.foodName}>{food.name}</Text>
            <Text style={styles.meta}>{food.brand ?? 'Sin marca'} · {food.servingSize} {food.servingUnit}</Text>
            <Text style={styles.calories}>{Math.round(food.calories)} kcal</Text>
            <Text style={styles.meta}>P {Math.round(food.proteinGrams)} g · C {Math.round(food.carbohydrateGrams)} g · G {Math.round(food.fatGrams)} g</Text>
            {compatibility?.hasConflict && (
              <View style={styles.warning}>
                <Text style={styles.warningTitle}>⚠️ Conflicto con tus restricciones</Text>
                <Text style={styles.warningText}>{compatibility.conflictingRestrictionCodes.join(', ')}</Text>
              </View>
            )}
          </View>
        )}

        {message && <Text style={styles.message}>{message}</Text>}
        {scanned && (
          <Pressable onPress={() => { setScanned(false); setFood(null); setCompatibility(null); setMessage(null); }} style={styles.button}>
            <Text style={styles.buttonText}>Escanear otro producto</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#07110B' },
  container: { flex: 1, padding: 24 },
  center: { flex: 1, justifyContent: 'center', padding: 24 },
  eyebrow: { color: '#62E62C', fontSize: 12, fontWeight: '800', letterSpacing: 1.4 },
  title: { color: '#F6FAF7', fontSize: 32, fontWeight: '900', marginTop: 10 },
  subtitle: { color: '#95A59B', fontSize: 16, lineHeight: 24, marginTop: 10 },
  camera: { borderRadius: 24, flex: 1, marginTop: 22, overflow: 'hidden' },
  card: { backgroundColor: '#101C14', borderColor: '#31533A', borderRadius: 18, borderWidth: 1, marginTop: 16, padding: 18 },
  foodName: { color: '#F6FAF7', fontSize: 18, fontWeight: '900' },
  calories: { color: '#62E62C', fontSize: 24, fontWeight: '900', marginTop: 8 },
  meta: { color: '#95A59B', marginTop: 5 },
  warning: { backgroundColor: '#2A1818', borderColor: '#FF8E8E', borderRadius: 12, borderWidth: 1, marginTop: 14, padding: 12 },
  warningTitle: { color: '#FFB1B1', fontWeight: '900' },
  warningText: { color: '#FFD4D4', marginTop: 4 },
  message: { color: '#DDE5DF', marginTop: 16, textAlign: 'center' },
  button: { alignItems: 'center', backgroundColor: '#62E62C', borderRadius: 14, marginTop: 16, padding: 16 },
  buttonText: { color: '#07110B', fontWeight: '900' },
});
