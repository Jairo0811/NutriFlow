import { Redirect, Stack, useSegments } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../../src/features/auth/AuthProvider';
import { onboardingApi } from '../../src/features/onboarding/api';
import { toUserFacingError } from '../../src/features/shared/errors';

export default function AuthenticatedLayout() {
  const { session, isLoading, logout } = useAuth();
  const segments = useSegments();
  const isOnboardingRoute = segments.includes('onboarding');
  const wasOnboardingRoute = useRef(isOnboardingRoute);
  const [checkingProfile, setCheckingProfile] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    if (!session?.accessToken) {
      setProfileCompleted(null);
      return;
    }

    setCheckingProfile(true);
    setError(null);
    try {
      const profile = await onboardingApi.get(session.accessToken);
      setProfileCompleted(profile.isCompleted);
    } catch (cause) {
      setError(toUserFacingError(cause, 'No pudimos comprobar tu perfil nutricional.'));
      setProfileCompleted(null);
    } finally {
      setCheckingProfile(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  const leavingOnboarding = wasOnboardingRoute.current && !isOnboardingRoute;

  useEffect(() => {
    const wasOnboarding = wasOnboardingRoute.current;
    wasOnboardingRoute.current = isOnboardingRoute;

    if (wasOnboarding && !isOnboardingRoute) {
      void refreshProfile();
    }
  }, [isOnboardingRoute, refreshProfile]);

  if (!isLoading && !session) return <Redirect href="/login" />;

  if (isLoading || checkingProfile || leavingOnboarding || (session && profileCompleted === null && !error)) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#62E62C" size="large" />
        <Text style={styles.loadingText}>Preparando NutriFlow…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loading}>
        <Text style={styles.error}>{error}</Text>
        <Pressable accessibilityRole="button" onPress={() => void refreshProfile()} style={styles.retryButton}>
          <Text style={styles.retryText}>Reintentar</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => void logout()} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>
      </View>
    );
  }

  if (session && profileCompleted === false && !isOnboardingRoute) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: '#07110B' },
        headerBackButtonDisplayMode: 'minimal',
        headerShadowVisible: false,
        headerStyle: { backgroundColor: '#07110B' },
        headerTintColor: '#62E62C',
        headerTitle: '',
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ gestureEnabled: false, headerBackVisible: false }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: '#07110B',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: { color: '#95A59B', marginTop: 12 },
  error: { color: '#FF8E8E', lineHeight: 22, textAlign: 'center' },
  retryButton: { alignItems: 'center', backgroundColor: '#62E62C', borderRadius: 14, marginTop: 20, minHeight: 52, justifyContent: 'center', paddingHorizontal: 32 },
  retryText: { color: '#07110B', fontSize: 16, fontWeight: '800' },
  logoutButton: { alignItems: 'center', marginTop: 8, minHeight: 48, justifyContent: 'center', paddingHorizontal: 24 },
  logoutText: { color: '#DDE5DF', fontSize: 15, fontWeight: '700' },
});
