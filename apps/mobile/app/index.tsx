import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuth } from '../src/features/auth/AuthProvider';

export default function IndexScreen() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#62E62C" size="large" />
      </View>
    );
  }

  return <Redirect href={session ? '/(app)' : '/login'} />;
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: '#07110B',
    flex: 1,
    justifyContent: 'center',
  },
});
