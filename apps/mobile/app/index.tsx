import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.brand}>NutriFlow</Text>
      <Text style={styles.subtitle}>Tu nutrición. Tu progreso.</Text>
      <Text style={styles.phase}>Phase 0 · Foundation</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#07110B',
    paddingHorizontal: 24,
  },
  brand: {
    color: '#63E62C',
    fontSize: 42,
    fontWeight: '700',
  },
  subtitle: {
    color: '#F5F7F5',
    fontSize: 18,
    marginTop: 8,
  },
  phase: {
    color: '#8FA096',
    fontSize: 14,
    marginTop: 24,
  },
});
