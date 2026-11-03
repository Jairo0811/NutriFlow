import type { PropsWithChildren, ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, typography } from '../theme';

type Props = PropsWithChildren<{
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  /** Si se pasa, habilita pull-to-refresh. */
  onRefresh?: () => void | Promise<void>;
  refreshing?: boolean;
  /** Contenido fijo debajo del scroll (p. ej. un botón principal). */
  footer?: ReactNode;
  /** Úsalo en pantallas sin encabezado nativo (p. ej. el home). */
  withTopInset?: boolean;
}>;

/**
 * Contenedor estándar de pantalla: área segura, teclado, scroll y cabecera.
 * Las pantallas dentro de `(app)` ya tienen encabezado nativo con botón de volver,
 * por eso solo se respetan los bordes inferior/laterales.
 */
export function Screen({ eyebrow, title, subtitle, onRefresh, refreshing = false, footer, withTopInset = false, children }: Props) {
  return (
    <SafeAreaView edges={withTopInset ? ['top', 'bottom', 'left', 'right'] : ['bottom', 'left', 'right']} style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          refreshControl={onRefresh
            ? <RefreshControl colors={[colors.primary]} onRefresh={() => void onRefresh()} refreshing={refreshing} tintColor={colors.primary} />
            : undefined}
        >
          {eyebrow ? <Text style={typography.eyebrow}>{eyebrow}</Text> : null}
          {title ? <Text accessibilityRole="header" style={[typography.title, styles.title]}>{title}</Text> : null}
          {subtitle ? <Text style={[typography.body, styles.subtitle]}>{subtitle}</Text> : null}
          {children}
        </ScrollView>
        {footer}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  flex: { flex: 1 },
  container: { padding: spacing.xl, paddingBottom: spacing.xxl * 1.5 },
  title: { marginTop: spacing.sm },
  subtitle: { marginTop: spacing.sm },
});
