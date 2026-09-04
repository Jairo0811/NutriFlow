import { Redirect, router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../src/features/auth/AuthProvider';

export default function AuthenticatedHomeScreen() {
  const { session, isLoading, logout } = useAuth();

  if (!isLoading && !session) return <Redirect href="/login" />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.eyebrow}>NUTRIFLOW · v1.3 DEV</Text>
        <Text style={styles.title}>Hola, {session?.displayName ?? 'NutriFlow'}</Text>
        <Text style={styles.subtitle}>
          Controla tu nutrición, construye hábitos y analiza tendencias de progreso desde un solo lugar.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Cuenta activa</Text>
          <Text style={styles.cardValue}>{session?.email ?? 'Cargando...'}</Text>
        </View>

        <Pressable onPress={() => router.push('/dashboard')} style={styles.primaryButton}>
          <Text style={styles.primaryText}>Abrir dashboard diario</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/analytics')} style={styles.premiumButton}>
          <Text style={styles.premiumText}>✦ Premium Analytics · 7/30/90 días</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/engagement')} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>💧 Engagement Hub · hábitos y recetas</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/meals')} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Diario de comidas</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/scanner')} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Escanear código de barras</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/progress')} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Ver mi progreso</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/preferences')} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Alergias y preferencias</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/foods')} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Catálogo de alimentos</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/targets')} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Objetivos nutricionales</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/onboarding')} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Editar perfil nutricional</Text>
        </Pressable>
        <Pressable onPress={() => void logout()} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#07110B', flex: 1 },
  container: { padding: 24, paddingBottom: 48, paddingTop: 48 },
  eyebrow: { color: '#62E62C', fontSize: 12, fontWeight: '800', letterSpacing: 1.4 },
  title: { color: '#F6FAF7', fontSize: 34, fontWeight: '900', marginTop: 12 },
  subtitle: { color: '#95A59B', fontSize: 16, lineHeight: 24, marginTop: 10 },
  card: { backgroundColor: '#101C14', borderColor: '#223228', borderRadius: 18, borderWidth: 1, marginTop: 28, padding: 20 },
  cardLabel: { color: '#7E8E84', fontSize: 13, fontWeight: '600' },
  cardValue: { color: '#F6FAF7', fontSize: 17, fontWeight: '700', marginTop: 8 },
  primaryButton: { alignItems: 'center', backgroundColor: '#62E62C', borderRadius: 14, marginTop: 22, padding: 16 },
  primaryText: { color: '#07110B', fontSize: 15, fontWeight: '900' },
  premiumButton: { alignItems: 'center', backgroundColor: '#17241B', borderColor: '#62E62C', borderRadius: 14, borderWidth: 1, marginTop: 10, padding: 16 },
  premiumText: { color: '#62E62C', fontSize: 15, fontWeight: '900' },
  secondaryButton: { alignItems: 'center', backgroundColor: '#132718', borderColor: '#36503E', borderRadius: 14, borderWidth: 1, marginTop: 10, padding: 16 },
  secondaryText: { color: '#DDE5DF', fontSize: 15, fontWeight: '800' },
  logoutButton: { alignItems: 'center', borderColor: '#36503E', borderRadius: 14, borderWidth: 1, marginTop: 18, padding: 16 },
  logoutText: { color: '#DDE5DF', fontSize: 15, fontWeight: '700' },
});
