import * as AuthSession from 'expo-auth-session';
import { Link, router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../../src/features/auth/AuthProvider';
import { AuthButton } from '../../src/features/auth/components/AuthButton';
import { AuthField } from '../../src/features/auth/components/AuthField';
import { AuthScaffold } from '../../src/features/auth/components/AuthScaffold';
import { toUserFacingError } from '../../src/features/shared/errors';
import { colors } from '../../src/theme';

WebBrowser.maybeCompleteAuthSession();

const googleDiscovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

export default function LoginScreen() {
  const { login, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '';
  const redirectUri = useMemo(() => AuthSession.makeRedirectUri({ scheme: 'nutriflow' }), []);
  const [request, response, promptAsync] = AuthSession.useAuthRequest({
    clientId: googleClientId || 'not-configured',
    redirectUri,
    responseType: AuthSession.ResponseType.Code,
    scopes: ['openid', 'profile', 'email'],
    usePKCE: true,
  }, googleDiscovery);

  useEffect(() => {
    async function completeGoogleSignIn() {
      if (response?.type !== 'success' || !request?.codeVerifier || !googleClientId) return;
      setGoogleLoading(true);
      setError(null);
      try {
        const tokenResponse = await AuthSession.exchangeCodeAsync({
          clientId: googleClientId,
          code: response.params.code,
          redirectUri,
          extraParams: { code_verifier: request.codeVerifier },
        }, googleDiscovery);
        if (!tokenResponse.idToken) throw new Error('Google no devolvió un token de identidad válido.');
        await signInWithGoogle(tokenResponse.idToken);
        router.replace('/(app)');
      } catch (caught) {
        setError(toUserFacingError(caught, 'No fue posible iniciar sesión con Google.'));
      } finally {
        setGoogleLoading(false);
      }
    }
    void completeGoogleSignIn();
  }, [googleClientId, redirectUri, request?.codeVerifier, response, signInWithGoogle]);

  async function handleLogin() {
    if (loading || googleLoading || !email.trim() || !password) return;
    setLoading(true);
    setError(null);
    try {
      await login({ email: email.trim(), password });
      router.replace('/(app)');
    } catch (caught) {
      setError(toUserFacingError(caught, 'No fue posible iniciar sesión.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScaffold
      featured
      title="Bienvenido de nuevo"
      subtitle="Nutrición, hábitos y bienestar en un solo lugar"
    >
      <AuthField
        featured icon="mail-outline" autoComplete="email" autoCorrect={false}
        keyboardType="email-address" label="Correo electrónico"
        onChangeText={setEmail} placeholder="Correo electrónico"
        returnKeyType="next" value={email}
      />
      <AuthField
        featured icon="lock-closed-outline" autoComplete="password"
        label="Contraseña" onChangeText={setPassword}
        placeholder="Contraseña" secureTextEntry
        returnKeyType="done" value={password}
        onSubmitEditing={() => void handleLogin()}
      />
      {error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}
      <AuthButton
        featured disabled={!email.trim() || !password || googleLoading}
        label="Iniciar sesión" loading={loading} onPress={() => void handleLogin()}
      />
      <Link href="/forgot-password" style={styles.forgot}>¿Olvidaste tu contraseña?</Link>
      <View style={styles.dividerRow} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <View style={styles.divider} />
        <Text style={styles.dividerText}>o</Text>
        <View style={styles.divider} />
      </View>
      <AuthButton
        featured icon="person-add-outline" label="Crear cuenta"
        disabled={loading || googleLoading} variant="secondary"
        onPress={() => router.push('/register')}
      />
      {googleClientId ? (
        <AuthButton
          featured icon="logo-google" label="Continuar con Google"
          disabled={loading || !request} loading={googleLoading}
          onPress={() => void promptAsync()} variant="secondary"
        />
      ) : null}
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  forgot: { alignSelf: 'center', color: colors.primary, fontSize: 15, fontWeight: '700', marginVertical: 7 },
  error: { color: colors.danger, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  dividerRow: { alignItems: 'center', flexDirection: 'row', gap: 14, marginVertical: 2 },
  divider: { backgroundColor: '#415047', flex: 1, height: 1 },
  dividerText: { color: colors.textSoft, fontSize: 16, fontWeight: '700' },
});
