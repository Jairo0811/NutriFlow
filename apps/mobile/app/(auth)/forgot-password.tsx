import { Link, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { authApi } from '../../src/features/auth/api';
import { AuthButton } from '../../src/features/auth/components/AuthButton';
import { AuthField } from '../../src/features/auth/components/AuthField';
import { AuthScaffold } from '../../src/features/auth/components/AuthScaffold';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await authApi.forgotPassword(email);
      setMessage(response.message);

      if (response.developmentResetToken) {
        router.push({ pathname: '/reset-password', params: { token: response.developmentResetToken } });
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No fue posible procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScaffold
      title="Recuperar contraseña"
      subtitle="Te ayudaremos a recuperar el acceso sin revelar si una cuenta existe o no."
      footer={<Link href="/login" style={styles.link}>Volver al inicio de sesión</Link>}
    >
      <AuthField
        autoComplete="email"
        keyboardType="email-address"
        label="Correo electrónico"
        onChangeText={setEmail}
        placeholder="nombre@correo.com"
        value={email}
      />
      {message ? <Text style={styles.success}>{message}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <AuthButton
        disabled={!email.trim()}
        label="Solicitar recuperación"
        loading={loading}
        onPress={() => void submit()}
      />
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  link: { color: '#62E62C', fontWeight: '700', textAlign: 'center' },
  success: { color: '#91F26A', fontSize: 14, lineHeight: 20 },
  error: { color: '#FF827C', fontSize: 14, lineHeight: 20 },
});
