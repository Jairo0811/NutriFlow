import { Screen } from '../../src/components/Screen';
import { useEffect, useState } from 'react';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { useAuth } from '../../src/features/auth/AuthProvider';
import { AiApiError, aiApi, type AiFoodProposal, type AiStatus, type MealType } from '../../src/features/ai/api';
import { useToday } from '../../src/features/shared/dates';
import { colors } from '../../src/theme';

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

  const today = useToday();
  const [statusLoading, setStatusLoading] = useState(true);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!accessToken) return;
    let active = true;
    setStatusLoading(true);
    void aiApi.getStatus(accessToken)
      .then((next) => { if (active) setStatus(next); })
      .catch(() => { if (active) setMessage('No fue posible cargar el estado de NutriFlow AI.'); })
      .finally(() => { if (active) setStatusLoading(false); });
    return () => { active = false; };
  }, [accessToken, reload]);

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
    <Screen eyebrow="NUTRIFLOW · IA" title="NutriFlow AI Coach" subtitle="Consulta tus metas y confirma los alimentos antes de registrarlos." onRefresh={() => setReload((n) => n + 1)} refreshing={statusLoading}>
        

        {statusLoading && <Text style={styles.helper}>Comprobando disponibilidad…</Text>}
        {!statusLoading && !status && <Card><Text style={styles.helper}>No se pudo cargar la IA.</Text><Button label="Reintentar" variant="secondary" onPress={() => setReload((n) => n + 1)} /></Card>}
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
          accessibilityLabel="Pregunta para el Coach"
          value={coachMessage}
          onChangeText={setCoachMessage}
          placeholder="Ej.: ¿Qué me conviene cenar para acercarme a mi meta de proteína?"
          placeholderTextColor={colors.placeholder}
          style={styles.textArea}
          maxLength={1200}
        />
        <Pressable accessibilityRole="button" disabled={busy} onPress={() => void askCoach()} style={styles.primaryButton}>
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
        <Pressable accessibilityRole="button"
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
          accessibilityLabel="Texto de comida dictada"
          value={voiceTranscript}
          onChangeText={setVoiceTranscript}
          placeholder="Ej.: comí dos huevos, una porción de mangú y queso de freír"
          placeholderTextColor={colors.placeholder}
          style={[styles.textArea, !status?.voiceLoggingEnabled && styles.disabled]}
          maxLength={2000}
        />
        <Pressable accessibilityRole="button"
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
          <Pressable accessibilityRole="button" disabled={busy} onPress={() => void confirmMeal()} style={styles.primaryButton}>
            <Text style={styles.primaryText}>Confirmar y agregar al diario</Text>
          </Pressable>
        )}

        {message && <Text style={styles.message}>{message}</Text>}
      </Screen>
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
          <Pressable accessibilityRole="button" key={type} onPress={() => setMealType(type)} style={[styles.mealChip, mealType === type && styles.mealChipActive]}>
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


const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: 24, paddingBottom: 48 },
  back: { color: colors.textSoft, fontWeight: '700' },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: '900', letterSpacing: 1.4, marginTop: 28 },
  title: { color: colors.text, fontSize: 32, fontWeight: '900', marginTop: 10 },
  subtitle: { color: colors.textSecondary, fontSize: 15, lineHeight: 23, marginTop: 10 },
  sectionTitle: { color: colors.text, fontSize: 19, fontWeight: '900', marginTop: 26 },
  statusCard: { backgroundColor: colors.surface, borderColor: colors.borderAccent, borderRadius: 18, borderWidth: 1, marginTop: 22, padding: 18 },
  statusTitle: { color: colors.primary, fontSize: 16, fontWeight: '900' },
  helper: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 6 },
  textArea: { backgroundColor: colors.surface, borderColor: colors.borderInput, borderRadius: 14, borderWidth: 1, color: colors.text, fontSize: 15, minHeight: 100, marginTop: 12, padding: 14, textAlignVertical: 'top' },
  primaryButton: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: 14, marginTop: 14, padding: 16 },
  primaryText: { color: colors.background, fontWeight: '900' },
  secondaryButton: { alignItems: 'center', backgroundColor: colors.surfaceRaised, borderColor: colors.borderButton, borderRadius: 14, borderWidth: 1, marginTop: 12, padding: 15 },
  secondaryText: { color: colors.textSoft, fontWeight: '800' },
  disabled: { opacity: 0.48 },
  replyCard: { backgroundColor: colors.surface, borderColor: colors.borderAccent, borderRadius: 18, borderWidth: 1, marginTop: 14, padding: 18 },
  replyLabel: { color: colors.primary, fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  replyText: { color: colors.text, fontSize: 15, lineHeight: 23, marginTop: 9 },
  disclaimer: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 12 },
  proposalsCard: { backgroundColor: colors.surface, borderColor: colors.borderAccent, borderRadius: 18, borderWidth: 1, marginTop: 20, padding: 18 },
  proposalRow: { borderBottomColor: colors.border, borderBottomWidth: 1, paddingBottom: 12, paddingTop: 12 },
  proposalName: { color: colors.text, fontSize: 16, fontWeight: '900' },
  warning: { color: colors.dangerLight, fontSize: 12, fontWeight: '800', marginTop: 6 },
  mealRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  mealChip: { backgroundColor: colors.surfaceDeep, borderColor: colors.borderButton, borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9 },
  mealChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  mealChipText: { color: colors.textSoft, fontSize: 12, fontWeight: '800' },
  mealChipTextActive: { color: colors.background },
  message: { color: colors.warning, fontSize: 13, fontWeight: '800', marginTop: 16, textAlign: 'center' },
});
