import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { authApi } from '../../src/features/auth/api';
import { AuthButton } from '../../src/features/auth/components/AuthButton';
import { AuthField } from '../../src/features/auth/components/AuthField';
import { AuthScaffold } from '../../src/features/auth/components/AuthScaffold';

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ token?: string }>();
  const [token, setToken] = useState(params.token ?? '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);

    try {
      await authApi.resetPassword(token, password);
      router.replace('/login');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No fue posible cambiar la contraseña.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScaffold
      title="Nueva contraseña"
      subtitle="El cambio invalidará las sesiones activas de la cuenta por seguridad."
    >
      <AuthField
        label="Token de recuperación"
        onChangeText={setToken}
        placeholder="Token recibido"
        value={token}
      />
      <AuthField
        autoComplete="new-password"
        label="Nueva contraseña"
        onChangeText={setPassword}
        placeholder="Mínimo 12 caracteres"
        secureTextEntry
        value={password}
      />
      <Text style={styles.hint}>Incluye mayúsculas, minúsculas, números y símbolos.</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <AuthButton
        disabled={!token.trim() || password.length < 12}
        label="Actualizar contraseña"
        loading={loading}
        onPress={() => void submit()}
      />
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  hint: { color: '#7E8E84', fontSize: 12, lineHeight: 18 },
  error: { color: '#FF827C', fontSize: 14, lineHeight: 20 },
});
