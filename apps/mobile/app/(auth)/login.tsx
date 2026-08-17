import * as AuthSession from 'expo-auth-session';
import { Link, router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../../src/features/auth/AuthProvider';
import { AuthButton } from '../../src/features/auth/components/AuthButton';
import { AuthField } from '../../src/features/auth/components/AuthField';
import { AuthScaffold } from '../../src/features/auth/components/AuthScaffold';

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
      if (response?.type !== 'success' || !request?.codeVerifier || !googleClientId) {
        return;
      }

      setGoogleLoading(true);
      setError(null);

      try {
        const tokenResponse = await AuthSession.exchangeCodeAsync({
          clientId: googleClientId,
          code: response.params.code,
          redirectUri,
          extraParams: { code_verifier: request.codeVerifier },
        }, googleDiscovery);

        if (!tokenResponse.idToken) {
          throw new Error('Google no devolvió un token de identidad válido.');
        }

        await signInWithGoogle(tokenResponse.idToken);
        router.replace('/(app)');
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'No fue posible iniciar sesión con Google.');
      } finally {
        setGoogleLoading(false);
      }
    }

    void completeGoogleSignIn();
  }, [googleClientId, redirectUri, request?.codeVerifier, response, signInWithGoogle]);

  async function handleLogin() {
    setLoading(true);
    setError(null);

    try {
      await login({ email, password });
      router.replace('/(app)');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No fue posible iniciar sesión.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScaffold
      title="Bienvenido de nuevo"
      subtitle="Accede a tu cuenta para continuar con tu seguimiento nutricional."
      footer={(
        <Text style={styles.footerText}>
          ¿No tienes cuenta? <Link href="/register" style={styles.link}>Crear cuenta</Link>
        </Text>
      )}
    >
      <AuthField
        autoComplete="email"
        keyboardType="email-address"
        label="Correo electrónico"
        onChangeText={setEmail}
        placeholder="nombre@correo.com"
        value={email}
      />
      <AuthField
        autoComplete="password"
        label="Contraseña"
        onChangeText={setPassword}
        placeholder="Tu contraseña"
        secureTextEntry
        value={password}
      />
      <Link href="/forgot-password" style={styles.forgot}>¿Olvidaste tu contraseña?</Link>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <AuthButton
        disabled={!email.trim() || !password}
        label="Iniciar sesión"
        loading={loading}
        onPress={() => void handleLogin()}
      />
      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>o</Text>
        <View style={styles.divider} />
      </View>
      <AuthButton
        disabled={!googleClientId || !request}
        label={googleClientId ? 'Continuar con Google' : 'Google requiere configuración'}
        loading={googleLoading}
        onPress={() => void promptAsync()}
        variant="secondary"
      />
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  forgot: { alignSelf: 'flex-end', color: '#62E62C', fontSize: 14 },
  error: { color: '#FF827C', fontSize: 14, lineHeight: 20 },
  footerText: { color: '#95A59B', textAlign: 'center' },
  link: { color: '#62E62C', fontWeight: '700' },
  dividerRow: { alignItems: 'center', flexDirection: 'row', gap: 12, marginVertical: 2 },
  divider: { backgroundColor: '#223228', flex: 1, height: 1 },
  dividerText: { color: '#748078' },
});
