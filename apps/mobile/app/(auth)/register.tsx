import { Link, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { useAuth } from '../../src/features/auth/AuthProvider';
import { AuthButton } from '../../src/features/auth/components/AuthButton';
import { AuthField } from '../../src/features/auth/components/AuthField';
import { AuthScaffold } from '../../src/features/auth/components/AuthScaffold';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister() {
    setLoading(true);
    setError(null);

    try {
      await register({ displayName, email, password });
      router.replace('/(app)');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No fue posible crear la cuenta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScaffold
      title="Crea tu cuenta"
      subtitle="Empieza a construir un seguimiento nutricional adaptado a tus objetivos."
      footer={(
        <Text style={styles.footerText}>
          ¿Ya tienes cuenta? <Link href="/login" style={styles.link}>Iniciar sesión</Link>
        </Text>
      )}
    >
      <AuthField
        autoCapitalize="words"
        autoComplete="name"
        label="Nombre"
        onChangeText={setDisplayName}
        placeholder="Tu nombre"
        value={displayName}
      />
      <AuthField
        autoComplete="email"
        keyboardType="email-address"
        label="Correo electrónico"
        onChangeText={setEmail}
        placeholder="nombre@correo.com"
        value={email}
      />
      <AuthField
        autoComplete="new-password"
        label="Contraseña"
        onChangeText={setPassword}
        placeholder="Mínimo 12 caracteres"
        secureTextEntry
        value={password}
      />
      <Text style={styles.hint}>Incluye mayúsculas, minúsculas, números y símbolos.</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <AuthButton
        disabled={!displayName.trim() || !email.trim() || password.length < 12}
        label="Crear cuenta"
        loading={loading}
        onPress={() => void handleRegister()}
      />
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  hint: { color: '#7E8E84', fontSize: 12, lineHeight: 18 },
  error: { color: '#FF827C', fontSize: 14, lineHeight: 20 },
  footerText: { color: '#95A59B', textAlign: 'center' },
  link: { color: '#62E62C', fontWeight: '700' },
});
