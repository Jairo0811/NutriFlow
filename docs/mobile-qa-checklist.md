# NutriFlow — Validación móvil previa a versión 1.5

Última revisión documental: 2026-11-17. Este checklist **no equivale a una ejecución**; cada casilla debe marcarse únicamente después de probar.

## Preparación

1. Instalar las dependencias: `cd apps/mobile && npm ci`.
2. Ejecutar `npm run typecheck && npm test && CI=1 npx expo export --platform web`.
3. Configurar `EXPO_PUBLIC_API_URL` accesible desde el teléfono (la URL `localhost` del PC no es accesible desde otro dispositivo).
4. Iniciar backend con PostgreSQL y migraciones; preparar cuentas de prueba y datos no sensibles.
5. Iniciar Expo con `npx expo start -c` y abrir en Android y, cuando sea posible, iOS.

## Pruebas manuales por funcionalidad

- [ ] Inicio de sesión, registro, recuperación de contraseña y cierre de sesión sin bloqueos.
- [ ] Onboarding de cinco pasos: teclado abierto, fechas imposibles, botón Continuar, volver a la app y persistencia.
- [ ] Home sin espacio superior duplicado; encabezado nativo con flecha solo en pantallas internas.
- [ ] Dashboard: carga inicial, pull-to-refresh, error y Reintentar, consumo superior a calorías objetivo.
- [ ] Diario: búsqueda, ausencia de resultados, porciones con coma, añadir comida, **editar porciones**, cancelar edición y eliminar con confirmación.
- [ ] Progreso: sin registros ni NaN en gráfica, alta y eliminación de peso con confirmación, registro decimal.
- [ ] Alimentos y favoritos: consulta, búsqueda rápida sin resultados anteriores y marcado de favoritos.
- [ ] Alergias/preferencias: carga, selección y persistencia; alerta de alimentos incompatibles.
- [ ] Objetivos: carga, valor energético y reintento después de error de red.
- [ ] Engagement: hidratación, recetas, favoritas y confirmación antes de eliminar.
- [ ] Analítica: Premium bloqueado en Free; cambio entre 7/30/90 días sin resultados obsoletos.
- [ ] IA: cuota/estado del proveedor, confirmación antes de agregar comida y actualización de fecha tras medianoche.
- [ ] Foto IA: permiso de cámara, acceso Premium y captura; no autorregistrar propuestas.
- [ ] Escáner: permiso concedido/denegado, lectura de código, agotamiento de cuota y scroll estable.
- [ ] Tamaños de texto grandes, lector de pantalla, contraste y áreas táctiles en los recorridos principales.
- [ ] Probado con red lenta, sin red, rotación y reapertura tras entrar en segundo plano.

## Evidencia de cierre

- [ ] Capturas reales de Home, Dashboard, Diario, Progreso y Escáner (sin datos personales).
- [ ] Resultado de los jobs GitHub Actions **Mobile** y **API** en verde para el commit final.
- [ ] Prueba de smoke del backend real conectado a app en teléfono o emulador.
- [ ] Revisión y aprobación del esquema de navegación y versión por responsable del producto.
- [ ] Actualizar capturas en README y, si se aprueba, cambiar el número de versión y registrar el lanzamiento.

**Alcance pendiente por decisión:** pestañas inferiores y tema claro. **Fuera del snapshot:** billing de pagos y Google OAuth sin credenciales. Estas integraciones requieren configuración específica y no deben declararse activas.
