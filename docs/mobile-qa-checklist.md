# NutriFlow — Validación móvil de la versión 1.5.0

Última revisión documental: 2026-11-26. Este checklist **no equivale a una ejecución**; cada casilla debe marcarse únicamente después de probar.

**Estado de la versión 1.5.0:** candidata a lanzamiento, **no congelada**. Se congela cuando la sección «Pendientes que requieren dispositivo físico» esté completa y aprobada.

## Preparación

1. Instalar las dependencias: `cd apps/mobile && npm ci`.
2. Ejecutar `npm run typecheck && npm test && CI=1 npx expo export --platform web`.
3. Configurar `EXPO_PUBLIC_API_URL` accesible desde el teléfono (la URL `localhost` del PC no es accesible desde otro dispositivo).
4. Iniciar backend con PostgreSQL y migraciones; preparar cuentas de prueba y datos no sensibles.
5. Iniciar Expo con `npx expo start -c` y abrir en Android y, cuando sea posible, iOS.

## Cobertura automática verificada en CI

- [x] Pruebas de TypeScript, componentes React Native, fechas y exportación web.
- [x] Auditoría estática de accesibilidad sobre las 33 pantallas y componentes (`__tests__/accessibility-audit-test.tsx`): rol en todo `Pressable`, etiqueta en todo `TextInput` e `Image`, errores anunciados, sin colores sueltos ni emojis, texto ≥ 12 px.
- [x] Contraste WCAG AA (4.5:1 en texto, 3:1 en bordes de campos y controles) calculado sobre la paleta neón de `src/theme.ts`.
- [x] Smoke de API real y PostgreSQL con 21 verificaciones: login, onboarding, catálogo, alérgenos, comidas, dashboard, progreso y hábitos.
- [x] Verificación unitaria de descubrimiento de migraciones históricas de EF Core.

**Estas casillas no avalan las pruebas de interfaz en dispositivo.** Las pruebas manuales se mantienen pendientes.

> La auditoría automática verifica que los elementos *declaran* roles, etiquetas y contraste suficientes. **No sustituye** escuchar la app con TalkBack o VoiceOver: el orden de lectura, los textos reales anunciados y la usabilidad solo se comprueban a mano.

## Verificación UI Android con API real

- [ ] Inicio de sesión en emulador con usuario de prueba aislado.
- [ ] Comprobación visual automatizada de Home, Dashboard, Diario, Progreso y acceso al escáner.
- [ ] Capturas Android reales de esos recorridos disponibles como artefacto temporal de GitHub Actions.

**Solo marcar los tres puntos después de que finalice el workflow Android E2E con éxito.** No equivalen a un QA visual humano de accesibilidad, teclado, permisos o cámara física.

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


## Pendientes que requieren dispositivo físico

Ninguna de estas pruebas puede ejecutarse en CI ni en un emulador sin cámara. Se necesita, como mínimo, un teléfono Android; un iPhone es deseable. Anotar modelo, versión del sistema y fecha junto a cada casilla al marcarla.

### Cámara y permisos
- [ ] Escáner: lectura de códigos de barras reales (EAN-13/UPC) con buena y mala luz; el emulador se ejecuta con `-camera-back none`.
- [ ] Escáner: permiso de cámara concedido, denegado y revocado desde Ajustes; la app guía al usuario sin bloquearse.
- [ ] Foto IA: captura real, permiso denegado y revocado; las propuestas nunca se registran sin confirmación.
- [ ] Alimento no encontrado, agotamiento de cuota y producto con alérgenos en conflicto con las restricciones del usuario.

### Teclado, texto e interacción real
- [ ] Teclado real (Gboard / teclado iOS) en onboarding, diario, progreso y login: el campo activo siempre queda visible; el botón «Continuar» fijo no se tapa.
- [ ] Autocompletado de contraseñas y correo del sistema en login y registro.
- [ ] Dictado por voz del teclado en «Voice Logging».
- [ ] Teclado decimal con coma (por ejemplo, `1,5` porciones) en un teléfono con idioma español.
- [ ] Gestos de volver (Android predictivo e iOS por borde) y botón atrás de hardware, incluido el bloqueo del onboarding obligatorio.
- [ ] Pull-to-refresh y desplazamiento fluido en dashboard, diario y analíticas con datos reales.

### Accesibilidad asistida
- [ ] TalkBack (Android): recorrido completo de login → onboarding → dashboard → diario → progreso; orden de lectura lógico, botones con nombre claro y errores anunciados al aparecer.
- [ ] VoiceOver (iOS): mismo recorrido.
- [ ] Tamaño de fuente del sistema al 200 % y «Texto en negrita»: ninguna pantalla recorta ni solapa contenido.
- [ ] Áreas táctiles: tocar con el pulgar los botones pequeños (eliminar comida, favoritos, mostrar contraseña, atrás) sin errores.
- [ ] Contraste en exteriores con brillo alto; revisar bordes de campos y texto secundario.

### Apariencia nativa
- [ ] Splash nativo (`splash-icon.png` con fondo `#040907`) y arranque sin destello blanco ni borde visible.
- [ ] Icono de la aplicación en el lanzador, con y sin icono adaptable (Android).
- [ ] Barra de estado y barra de navegación del sistema coherentes con el fondo neón; notch y esquinas redondeadas sin recortes (safe areas).
- [ ] Destellos decorativos del login con rendimiento correcto en un teléfono de gama baja.
- [ ] Rotación bloqueada en vertical.

### Red, ciclo de vida e integraciones
- [ ] Red lenta, modo avión y reconexión: mensajes de error claros y botón Reintentar funcional.
- [ ] Pasar a segundo plano, volver tras la medianoche (la fecha del dashboard se actualiza) y cierre forzado con reapertura.
- [ ] Renovación de sesión (refresh token) tras la expiración del token de acceso.
- [ ] Google Sign-In con credenciales OAuth reales (no configurado en el repositorio por diseño).
- [ ] Construcción EAS `preview` instalada en un teléfono físico (Android e iOS), no solo el APK de depuración del emulador.
- [ ] Facturación y planes Premium: fuera de alcance; no hay proveedor de suscripciones conectado.
