import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useAuth } from '../../src/features/auth/AuthProvider';
import { AiApiError, aiApi, type AiFoodProposal, type AiStatus, type MealType } from '../../src/features/ai/api';

const mealTypes: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export default function NutriFlowAiScreen() {
  const { session } = useAuth();
  const accessToken = session?.accessToken;
  const [status, setStatus] = useState<AiStatus | null>(null);
  const [coachMessage, setCoachMessage] = useState('');
  const [coachReply, setCoachReply] = useState<string | null>(null);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [proposals, setProposals] = useState<AiFoodProposal[]>([]);
  const [mealType, setMealType] = useState<MealType>('Lunch');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const today = useMemo(() => localDate(new Date()), []);

  useEffect(() => {
    if (!accessToken) return;
    void aiApi.getStatus(accessToken)
      .then(setStatus)
      .catch(() => setMessage('No fue posible cargar el estado de NutriFlow AI.'));
  }, [accessToken]);

  if (!session || !accessToken) return null;

  const remaining = status?.aiUsage?.remaining;
  const usableProposals = proposals.filter(item => item.foodId && item.hasCatalogMatch && !item.hasDietaryConflict);

  async function askCoach() {
    if (!coachMessage.trim()) return;
    setBusy(true);
    setMessage(null);
    try {
      const result = await aiApi.askCoach(accessToken!, coachMessage.trim(), today);
      setCoachReply(result.answer);
      setStatus(current => current ? { ...current, aiUsage: result.usage } : current);
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function analyzeVoiceTranscript() {
    if (!voiceTranscript.trim()) return;
    setBusy(true);
    setMessage(null);
    setProposals([]);
    try {
      const result = await aiApi.parseVoiceLog(accessToken!, voiceTranscript.trim(), today);
      setProposals(result.items);
      setStatus(current => current ? { ...current, aiUsage: result.usage } : current);
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function confirmMeal() {
    const items = usableProposals.map(item => ({ foodId: item.foodId!, servings: item.servings }));
    if (items.length === 0) return;
    setBusy(true);
    setMessage(null);
    try {
      await aiApi.confirmMeal(accessToken!, mealType, items, today);
      setMessage('Comida confirmada y agregada al diario.');
      setProposals([]);
      setVoiceTranscript('');
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()}><Text style={styles.back}>Atrás</Text></Pressable>
        <Text style={styles.eyebrow}>NUTRIFLOW · AI</Text>
        <Text style={styles.title}>NutriFlow AI Coach</Text>
        <Text style={styles.subtitle}>
          Usa tu progreso del día, metas y restricciones guardadas para darte orientación práctica. Las estimaciones de IA siempre deben confirmarse antes de registrar una comida.
        </Text>

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>{status?.providerConfigured ? 'IA conectada' : 'IA pendiente de configuración'}</Text>
          <Text style={styles.helper}>Proveedor: {status?.provider ?? 'cargando…'}</Text>
          <Text style={styles.helper}>
            Consultas este mes: {status?.aiUsage?.used ?? 0}/{status?.aiUsage?.limit ?? '—'}
            {typeof remaining === 'number' ? ` · quedan ${remaining}` : ''}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Pregúntale al Coach</Text>
        <TextInput
          multiline
          value={coachMessage}
          onChangeText={setCoachMessage}
          placeholder="Ej.: ¿Qué me conviene cenar para acercarme a mi meta de proteína?"
          placeholderTextColor="#637268"
          style={styles.textArea}
          maxLength={1200}
        />
        <Pressable disabled={busy} onPress={() => void askCoach()} style={styles.primaryButton}>
          <Text style={styles.primaryText}>{busy ? 'Procesando…' : 'Consultar Coach'}</Text>
        </Pressable>

        {coachReply && (
          <View style={styles.replyCard}>
            <Text style={styles.replyLabel}>Respuesta</Text>
            <Text style={styles.replyText}>{coachReply}</Text>
            <Text style={styles.disclaimer}>Orientación general; no sustituye atención médica ni nutricional profesional.</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Analizar comida por foto</Text>
        <Text style={styles.helper}>Premium · La IA propone alimentos y porciones; tú decides qué se registra.</Text>
        <Pressable
          disabled={!status?.mealPhotoEnabled}
          onPress={() => router.push('/ai-photo')}
          style={[styles.secondaryButton, !status?.mealPhotoEnabled && styles.disabled]}
        >
          <Text style={styles.secondaryText}>{status?.mealPhotoEnabled ? 'Abrir cámara AI' : '🔒 Premium · Meal Photo'}</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Registro por voz</Text>
        <Text style={styles.helper}>
          Premium · Dicta con el micrófono del teclado del teléfono y NutriFlow convierte el transcript en propuestas de alimentos.
        </Text>
        <TextInput
          multiline
          editable={status?.voiceLoggingEnabled}
          value={voiceTranscript}
          onChangeText={setVoiceTranscript}
          placeholder="Ej.: comí dos huevos, una porción de mangú y queso de freír"
          placeholderTextColor="#637268"
          style={[styles.textArea, !status?.voiceLoggingEnabled && styles.disabled]}
          maxLength={2000}
        />
        <Pressable
          disabled={busy || !status?.voiceLoggingEnabled}
          onPress={() => void analyzeVoiceTranscript()}
          style={[styles.secondaryButton, !status?.voiceLoggingEnabled && styles.disabled]}
        >
          <Text style={styles.secondaryText}>{status?.voiceLoggingEnabled ? 'Interpretar dictado' : '🔒 Premium · Voice Logging'}</Text>
        </Pressable>

        {proposals.length > 0 && (
          <ProposalList proposals={proposals} mealType={mealType} setMealType={setMealType} />
        )}

        {usableProposals.length > 0 && (
          <Pressable disabled={busy} onPress={() => void confirmMeal()} style={styles.primaryButton}>
            <Text style={styles.primaryText}>Confirmar y agregar al diario</Text>
          </Pressable>
        )}

        {message && <Text style={styles.message}>{message}</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

function ProposalList({
  proposals,
  mealType,
  setMealType,
}: {
  proposals: AiFoodProposal[];
  mealType: MealType;
  setMealType: (value: MealType) => void;
}) {
  return (
    <View style={styles.proposalsCard}>
      <Text style={styles.sectionTitle}>Revisa antes de registrar</Text>
      {proposals.map((item, index) => (
        <View key={`${item.detectedName}-${index}`} style={styles.proposalRow}>
          <Text style={styles.proposalName}>{item.catalogName ?? item.detectedName}</Text>
          <Text style={styles.helper}>{item.servings.toFixed(1)} porción(es) · confianza {Math.round(item.confidence * 100)}%</Text>
          {!item.hasCatalogMatch && <Text style={styles.warning}>Sin coincidencia en el catálogo; no se registrará.</Text>}
          {item.hasDietaryConflict && (
            <Text style={styles.warning}>⚠️ Conflicto: {item.conflictingRestrictionCodes.join(', ')}. NutriFlow bloqueará el registro.</Text>
          )}
        </View>
      ))}

      <Text style={styles.helper}>¿En qué comida quieres registrar los elementos válidos?</Text>
      <View style={styles.mealRow}>
        {mealTypes.map(type => (
          <Pressable key={type} onPress={() => setMealType(type)} style={[styles.mealChip, mealType === type && styles.mealChipActive]}>
            <Text style={[styles.mealChipText, mealType === type && styles.mealChipTextActive]}>{type}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function errorMessage(error: unknown) {
  if (error instanceof AiApiError) {
    if (error.code === 'usage_limit_reached') return 'Alcanzaste tu cuota mensual de NutriFlow AI.';
    if (error.code === 'premium_required') return 'Esta función requiere NutriFlow Premium.';
    if (error.code === 'ai_provider_unavailable') return 'NutriFlow AI todavía no está configurado en este entorno.';
    if (error.code === 'dietary_conflict') return 'NutriFlow bloqueó el registro por una restricción alimentaria guardada.';
    return error.message;
  }
  return 'NutriFlow AI no pudo completar la solicitud.';
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
  back: { color: '#DDE5DF', fontWeight: '700' },
  eyebrow: { color: '#62E62C', fontSize: 12, fontWeight: '900', letterSpacing: 1.4, marginTop: 28 },
  title: { color: '#F6FAF7', fontSize: 32, fontWeight: '900', marginTop: 10 },
  subtitle: { color: '#95A59B', fontSize: 15, lineHeight: 23, marginTop: 10 },
  sectionTitle: { color: '#F6FAF7', fontSize: 19, fontWeight: '900', marginTop: 26 },
  statusCard: { backgroundColor: '#101C14', borderColor: '#31533A', borderRadius: 18, borderWidth: 1, marginTop: 22, padding: 18 },
  statusTitle: { color: '#62E62C', fontSize: 16, fontWeight: '900' },
  helper: { color: '#95A59B', fontSize: 13, lineHeight: 19, marginTop: 6 },
  textArea: { backgroundColor: '#101C14', borderColor: '#25372B', borderRadius: 14, borderWidth: 1, color: '#F6FAF7', fontSize: 15, minHeight: 100, marginTop: 12, padding: 14, textAlignVertical: 'top' },
  primaryButton: { alignItems: 'center', backgroundColor: '#62E62C', borderRadius: 14, marginTop: 14, padding: 16 },
  primaryText: { color: '#07110B', fontWeight: '900' },
  secondaryButton: { alignItems: 'center', backgroundColor: '#132718', borderColor: '#36503E', borderRadius: 14, borderWidth: 1, marginTop: 12, padding: 15 },
  secondaryText: { color: '#DDE5DF', fontWeight: '800' },
  disabled: { opacity: 0.48 },
  replyCard: { backgroundColor: '#101C14', borderColor: '#31533A', borderRadius: 18, borderWidth: 1, marginTop: 14, padding: 18 },
  replyLabel: { color: '#62E62C', fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  replyText: { color: '#F6FAF7', fontSize: 15, lineHeight: 23, marginTop: 9 },
  disclaimer: { color: '#7E8E84', fontSize: 12, lineHeight: 18, marginTop: 12 },
  proposalsCard: { backgroundColor: '#101C14', borderColor: '#31533A', borderRadius: 18, borderWidth: 1, marginTop: 20, padding: 18 },
  proposalRow: { borderBottomColor: '#223228', borderBottomWidth: 1, paddingBottom: 12, paddingTop: 12 },
  proposalName: { color: '#F6FAF7', fontSize: 16, fontWeight: '900' },
  warning: { color: '#FFB1B1', fontSize: 12, fontWeight: '800', marginTop: 6 },
  mealRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  mealChip: { backgroundColor: '#0B160F', borderColor: '#36503E', borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9 },
  mealChipActive: { backgroundColor: '#62E62C', borderColor: '#62E62C' },
  mealChipText: { color: '#DDE5DF', fontSize: 12, fontWeight: '800' },
  mealChipTextActive: { color: '#07110B' },
  message: { color: '#FFCC80', fontSize: 13, fontWeight: '800', marginTop: 16, textAlign: 'center' },
});
