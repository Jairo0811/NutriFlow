import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../src/features/auth/AuthProvider';
import { progressApi, type ProgressSummary } from '../../src/features/progress/api';
import { toUserFacingError } from '../../src/features/shared/errors';
import { useToday } from '../../src/features/shared/dates';
import { colors } from '../../src/theme';

export default function ProgressScreen() {
  const { session } = useAuth();
  const today = useToday();
  const accessToken = session?.accessToken;
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [weight, setWeight] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    setError(null);
    progressApi.get(accessToken)
      .then(setSummary)
      .catch((cause) => setError(toUserFacingError(cause, 'No fue posible cargar tu progreso.')));
  }, [accessToken]);

  const chartMax = useMemo(() => Math.max(...(summary?.entries.map((entry) => entry.weightPounds) ?? [1])), [summary]);

  if (!session || !accessToken) return null;

  async function saveWeight() {
    if (!accessToken) return;
    const value = Number(weight);
    if (!Number.isFinite(value) || value < 60 || value > 800) {
      setError('Ingresa un peso entre 60 y 800 lb.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      setSummary(await progressApi.logWeight(accessToken, today, value, note));
      setWeight('');
      setNote('');
    } catch (cause) {
      setError(toUserFacingError(cause, 'No fue posible guardar el peso.'));
    } finally {
      setSaving(false);
    }
  }

  async function removeWeight(date: string) {
    if (!accessToken) return;
    setError(null);
    try {
      setSummary(await progressApi.removeWeight(accessToken, date));
    } catch (cause) {
      setError(toUserFacingError(cause, 'No fue posible eliminar el registro.'));
    }
  }

  const formatPounds = (value?: number | null) => value == null ? '—' : `${value} lb`;

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.eyebrow}>NUTRIFLOW · PROGRESO</Text>
        <Text style={styles.title}>Tu progreso</Text>
        <Text style={styles.subtitle}>Registra tu peso en libras y observa la tendencia hacia tu objetivo.</Text>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}><Text style={styles.label}>Actual</Text><Text style={styles.value}>{formatPounds(summary?.currentWeightPounds)}</Text></View>
          <View style={styles.summaryCard}><Text style={styles.label}>Objetivo</Text><Text style={styles.value}>{formatPounds(summary?.targetWeightPounds)}</Text></View>
          <View style={styles.summaryCard}><Text style={styles.label}>Cambio</Text><Text style={styles.value}>{formatPounds(summary?.changePounds)}</Text></View>
        </View>

        <Text style={styles.sectionTitle}>Registrar peso de hoy</Text>
        <TextInput value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholder="Ej. 218.5" placeholderTextColor={colors.placeholder} style={styles.input} />
        <TextInput value={note} onChangeText={setNote} placeholder="Nota opcional" placeholderTextColor={colors.placeholder} style={styles.input} />
        <Pressable disabled={saving} onPress={() => void saveWeight()} style={[styles.button, saving && styles.disabled]}>
          <Text style={styles.buttonText}>{saving ? 'Guardando…' : 'Guardar peso'}</Text>
        </Pressable>
        {error && <Text style={styles.error}>{error}</Text>}

        <Text style={styles.sectionTitle}>Historial</Text>
        {summary?.entries.map((entry) => {
          const width = `${Math.max(8, Math.round(entry.weightPounds / chartMax * 100))}%` as `${number}%`;
          return (
            <View key={entry.id} style={styles.entry}>
              <View style={styles.flex}>
                <Text style={styles.entryDate}>{entry.date}</Text>
                <Text style={styles.entryWeight}>{entry.weightPounds} lb</Text>
                {entry.note && <Text style={styles.entryNote}>{entry.note}</Text>}
                <View style={[styles.bar, { width }]} />
              </View>
              <Pressable onPress={() => void removeWeight(entry.date)}>
                <Text style={styles.remove}>Eliminar</Text>
              </Pressable>
            </View>
          );
        })}
        {!summary?.entries.length && <Text style={styles.helper}>Aún no hay registros de peso.</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: 24, paddingBottom: 48 },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: '800', letterSpacing: 1.4 },
  title: { color: colors.text, fontSize: 34, fontWeight: '900', marginTop: 10 },
  subtitle: { color: colors.textSecondary, fontSize: 15, lineHeight: 23, marginTop: 8 },
  summaryRow: { gap: 10, marginTop: 24 },
  summaryCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, padding: 16 },
  label: { color: colors.textSecondary, fontWeight: '700' },
  value: { color: colors.text, fontSize: 22, fontWeight: '900', marginTop: 5 },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: '900', marginTop: 28 },
  input: { backgroundColor: colors.surface, borderColor: colors.borderInput, borderRadius: 14, borderWidth: 1, color: colors.text, fontSize: 16, marginTop: 12, padding: 14 },
  button: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: 14, marginTop: 12, padding: 16 },
  buttonText: { color: colors.background, fontWeight: '900' },
  disabled: { opacity: 0.6 },
  error: { color: colors.danger, marginTop: 12 },
  entry: { alignItems: 'center', borderBottomColor: '#18251D', borderBottomWidth: 1, flexDirection: 'row', gap: 12, paddingVertical: 14 },
  flex: { flex: 1 },
  entryDate: { color: colors.textSecondary, fontSize: 12 },
  entryWeight: { color: colors.text, fontSize: 17, fontWeight: '900', marginTop: 3 },
  entryNote: { color: colors.textSecondary, marginTop: 3 },
  bar: { backgroundColor: colors.primary, borderRadius: 999, height: 4, marginTop: 8 },
  remove: { color: '#FF9A9A', fontWeight: '800' },
  helper: { color: colors.textMuted, marginTop: 12 },
});
