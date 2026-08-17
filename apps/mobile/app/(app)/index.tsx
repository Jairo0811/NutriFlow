import { Redirect } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../src/features/auth/AuthProvider';

export default function AuthenticatedHomeScreen() {
  const { session, isLoading, logout } = useAuth();

  if (!isLoading && !session) {
    return <Redirect href="/login" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>FASE 1 · IDENTITY</Text>
        <Text style={styles.title}>Hola, {session?.displayName ?? 'NutriFlow'}</Text>
        <Text style={styles.subtitle}>
          Tu sesión ya está protegida con access token, refresh token rotativo y almacenamiento seguro en el dispositivo.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Cuenta activa</Text>
          <Text style={styles.cardValue}>{session?.email ?? 'Cargando...'}</Text>
        </View>

        <Pressable onPress={() => void logout()} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#07110B', flex: 1 },
  container: { flex: 1, padding: 24, paddingTop: 48 },
  eyebrow: { color: '#62E62C', fontSize: 12, fontWeight: '800', letterSpacing: 1.4 },
  title: { color: '#F6FAF7', fontSize: 34, fontWeight: '800', marginTop: 12 },
  subtitle: { color: '#95A59B', fontSize: 16, lineHeight: 24, marginTop: 10 },
  card: {
    backgroundColor: '#101C14',
    borderColor: '#223228',
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 32,
    padding: 20,
  },
  cardLabel: { color: '#7E8E84', fontSize: 13, fontWeight: '600' },
  cardValue: { color: '#F6FAF7', fontSize: 17, fontWeight: '700', marginTop: 8 },
  logoutButton: {
    alignItems: 'center',
    borderColor: '#36503E',
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 18,
    padding: 16,
  },
  logoutText: { color: '#DDE5DF', fontSize: 15, fontWeight: '700' },
});
