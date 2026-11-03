import { Alert, Platform } from 'react-native';

type Options = {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
};

/** Pide confirmación antes de una acción destructiva (Alert en móvil, confirm en web). */
export function confirmAction({ title, message, confirmLabel = 'Confirmar', onConfirm }: Options) {
  if (Platform.OS === 'web') {
    if (typeof globalThis.confirm === 'function' && globalThis.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }

  Alert.alert(title, message, [
    { text: 'Cancelar', style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}
