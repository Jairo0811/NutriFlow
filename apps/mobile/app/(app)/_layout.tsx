import { Redirect, Stack, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../../src/features/auth/AuthProvider';
import { onboardingApi } from '../../src/features/onboarding/api';
import { toUserFacingError } from '../../src/features/shared/errors';

export default function AuthenticatedLayout() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const [checkingProfile, setCheckingProfile] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.accessToken) {
      setProfileCompleted(null);
      return;
    }

    let mounted = true;
    setCheckingProfile(true);
    setError(null);

    void onboardingApi.get(session.accessToken)
      .then((profile) => {
        if (mounted) setProfileCompleted(profile.isCompleted);
      })
      .catch((cause) => {
        if (mounted) {
          setError(toUserFacingError(cause, 'No pudimos comprobar tu perfil nutricional.'));
          setProfileCompleted(null);
        }
      })
      .finally(() => {
        if (mounted) setCheckingProfile(false);
      });

    return () => {
      mounted = false;
    };
  }, [session?.accessToken, segments.join('/')]);

  if (!isLoading && !session) return <Redirect href="/login" />;

  if (isLoading || checkingProfile) {
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
      </View>
    );
  }

  const isOnboardingRoute = segments.includes('onboarding');
  if (session && profileCompleted === false && !isOnboardingRoute) {
    return <Redirect href="/onboarding" />;
  }

  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#07110B' } }} />;
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
});
