import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../src/features/auth/AuthProvider';
import { progressApi, type ProgressSummary } from '../../src/features/progress/api';

const today = new Date().toISOString().slice(0, 10);

export default function ProgressScreen() {
  const { session } = useAuth();
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [weight, setWeight] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!session?.accessToken) return;
    progressApi.get(session.accessToken)
      .then(setSummary)
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'No fue posible cargar tu progreso.'));
  }, [session?.accessToken]);

  const chartMax = useMemo(() => Math.max(...(summary?.entries.map((entry) => entry.weightPounds) ?? [1])), [summary]);

  if (!session) return null;

  async function saveWeight() {
    const value = Number(weight);
    if (!Number.isFinite(value) || value < 60 || value > 800) {
      setError('Ingresa un peso entre 60 y 800 lb.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      setSummary(await progressApi.logWeight(session.accessToken, today, value, note));
      setWeight('');
      setNote('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible guardar el peso.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.eyebrow}>NUTRIFLOW · FASE 8</Text>
        <Text style={styles.title}>Tu progreso</Text>
        <Text style={styles.subtitle}>Registra tu peso en libras y observa la tendencia hacia tu objetivo.</Text>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}><Text style={styles.label}>Actual</Text><Text style={styles.value}>{summary?.currentWeightPounds ?? '—'} lb</Text></View>
          <View style={styles.summaryCard}><Text style={styles.label}>Objetivo</Text><Text style={styles.value}>{summary?.targetWeightPounds ?? '—'} lb</Text></View>
          <View style={styles.summaryCard}><Text style={styles.label}>Cambio</Text><Text style={styles.value}>{summary?.changePounds ?? '—'} lb</Text></View>
        </View>

        <Text style={styles.sectionTitle}>Registrar peso de hoy</Text>
        <TextInput value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholder="Ej. 218.5" placeholderTextColor="#637268" style={styles.input} />
        <TextInput value={note} onChangeText={setNote} placeholder="Nota opcional" placeholderTextColor="#637268" style={styles.input} />
        <Pressable disabled={saving} onPress={() => void saveWeight()} style={[styles.button, saving && styles.disabled]}>
          <Text style={styles.buttonText}>{saving ? 'Guardando…' : 'Guardar peso'}</Text>
        </Pressable>
        {error && <Text style={styles.error}>{error}</Text>}

        <Text style={styles.sectionTitle}>Historial</Text>
        {summary?.entries.map((entry) => (
          <View key={entry.id} style={styles.entry}>
            <View style={styles.flex}>
              <Text style={styles.entryDate}>{entry.date}</Text>
              <Text style={styles.entryWeight}>{entry.weightPounds} lb</Text>
              {entry.note && <Text style={styles.entryNote}>{entry.note}</Text>}
              <View style={[styles.bar, { width: `${Math.max(8, Math.round(entry.weightPounds / chartMax * 100))}%` }]} />
            </View>
            <Pressable onPress={() => void progressApi.removeWeight(session.accessToken, entry.date).then(setSummary)}>
              <Text style={styles.remove}>Eliminar</Text>
            </Pressable>
          </View>
        ))}
        {!summary?.entries.length && <Text style={styles.helper}>Aún no hay registros de peso.</Text>}
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
  summaryRow: { gap: 10, marginTop: 24 },
  summaryCard: { backgroundColor: '#101C14', borderColor: '#223228', borderRadius: 16, borderWidth: 1, padding: 16 },
  label: { color: '#95A59B', fontWeight: '700' },
  value: { color: '#F6FAF7', fontSize: 22, fontWeight: '900', marginTop: 5 },
  sectionTitle: { color: '#F6FAF7', fontSize: 20, fontWeight: '900', marginTop: 28 },
  input: { backgroundColor: '#101C14', borderColor: '#25372B', borderRadius: 14, borderWidth: 1, color: '#F6FAF7', fontSize: 16, marginTop: 12, padding: 14 },
  button: { alignItems: 'center', backgroundColor: '#62E62C', borderRadius: 14, marginTop: 12, padding: 16 },
  buttonText: { color: '#07110B', fontWeight: '900' },
  disabled: { opacity: 0.6 },
  error: { color: '#FF8E8E', marginTop: 12 },
  entry: { alignItems: 'center', borderBottomColor: '#18251D', borderBottomWidth: 1, flexDirection: 'row', gap: 12, paddingVertical: 14 },
  flex: { flex: 1 },
  entryDate: { color: '#95A59B', fontSize: 12 },
  entryWeight: { color: '#F6FAF7', fontSize: 17, fontWeight: '900', marginTop: 3 },
  entryNote: { color: '#95A59B', marginTop: 3 },
  bar: { backgroundColor: '#62E62C', borderRadius: 999, height: 4, marginTop: 8 },
  remove: { color: '#FF9A9A', fontWeight: '800' },
  helper: { color: '#7E8E84', marginTop: 12 },
});
