# GOOBJOB
<img width="512" height="512" alt="goobjob-logo" src="https://github.com/user-attachments/assets/acc0a378-370b-424d-9663-a9933cc7a55f" />

 es una aplicación móvil que conecta a las personas con profesionales de oficios (plomeros, electricistas, carpinteros, pintores, técnicos y más) de forma **rápida, segura y confiable**.

Goobjob permite solicitar un servicio, ver quién está disponible cerca de ti y contratar al profesional adecuado en pocos pasos, sin depender de recomendaciones informales ni de búsquedas improvisadas.

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Firestore](https://img.shields.io/badge/Firestore-FF9100?style=for-the-badge&logo=firebase&logoColor=white)
<img alt="OpenAI" src="https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white">
<img alt="EmailJS" src="https://img.shields.io/badge/EmailJS-FF7F50?style=for-the-badge&logo=maildotru&logoColor=white">


## ¿Por qué GOOBJOB?
Encontrar a alguien de confianza para un trabajo en casa suele ser complicado: no sabes a quién llamar, cuánto cobrará ni si hará bien el trabajo. GOOBOB resuelve este problema ofreciendo:

- 🛡️ **Seguridad:** profesionales verificados para que contrates con tranquilidad.
- ⭐ **Confianza:** calificaciones y reseñas de otros usuarios.
- ⚡ **Rapidez:** solicita un servicio y recibe respuesta desde tu celular.
- 🔍 **Transparencia:** conoce al profesional y las condiciones del servicio antes de contratar.
- 🛠️ **Oportunidades para los oficios:** los trabajadores independientes llegan a más clientes y generan ingresos de forma más estable.

---

## 📋 Tabla de contenidos

- [Introducción](#-introducción)
- [Características](#-características)
- [Cómo funciona](#-cómo-funciona)
- [Stack tecnológico](#-stack-tecnológico)
- [Requisitos](#-requisitos)
- [Instalación](#-instalación)
- [Variables de entorno](#-variables-de-entorno)
- [Estructura de carpetas](#-estructura-de-carpetas)
- [Comandos](#-comandos)
- [Firestore Schema](#-firestore-schema)
- [Roadmap](#-roadmap)
- [Contribuir](#-contribuir)
- [Notas de desarrollo](#-Notas-de-Desarrollo)
- [Enlaces útiles](#-enlaces-útiles)
- [Equipo y licencia](#-equipo-y-licencia)
---

## 📖 Descripción

**GOOJBOB** es una aplicación multiplataforma (**iOS, Android y Web**) que conecta a quienes necesitan un servicio con profesionales de oficios verificados, de forma segura, rápida y transparente.

| Función | Descripción |
|---------|-------------|
| 👨‍💼 **Empleadores** | Encuentra trabajadores verificados para servicios domésticos y técnicos. |
| 🔧 **Trabajadores** | Promociona tus servicios, muestra tu trabajo y acepta nuevas solicitudes. |
| ⭐ **Reseñas** | Sistema de calificaciones que garantiza la calidad del servicio y genera confianza. |
| 💬 **Chat** | Comunicación directa y en tiempo real entre empleador y trabajador. |
| 🤖 **Asistente de IA** | Te ayuda a identificar el servicio que necesitas y a encontrar al profesional adecuado. |
| 🔐 **Verificación multifactor (MFA)** | Capa adicional de seguridad en el acceso a las cuentas para proteger a usuarios y trabajadores. |
| 📍 **Ubicación en tiempo real** | Consulta la ubicación del profesional durante el servicio y sigue su llegada en el mapa. |
---

## 🧭 Cómo funciona

1. **Describe lo que necesitas** o deja que el asistente de IA te ayude a identificar el servicio.
2. **Elige a un profesional** según su perfil, disponibilidad y reseñas.
3. **Contrata y coordina** los detalles por chat.
4. **Sigue su llegada** en el mapa en tiempo real.
5. **Califica el servicio** para ayudar a la comunidad.
---

## 🧰 Stack tecnológico

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| **Expo** | 57+ | Framework para React Native |
| **React Native** | Latest | Framework móvil |
| **TypeScript** | Latest | Tipado estático |
| **Firebase** | 9+ | Backend y autenticación |
| **Firestore** | Latest | Base de datos NoSQL |
| **Zustand** | Latest | Gestión de estado (opcional) |
| **Expo Router** | Latest | Navegación |
| **EmailJS** | Latest | Envío de correos (verificación, notificaciones) |
| **OpenAI API** | Latest | Asistente de IA para identificar servicios |

---

## ✅ Requisitos
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 (o yarn/pnpm)
- **Expo CLI**: `npm install -g expo-cli`
- **Cuenta de Firebase** → [console.firebase.google.com](https://console.firebase.google.com)
- **Cuenta de EmailJS** → [emailjs.com](https://www.emailjs.com)
- **Cuenta de OpenAI** (API key) → [platform.openai.com](https://platform.openai.com)


**Verificar instalación:**
```bash
node --version
npm --version
expo --version
```

---

## 📦 Instalación

### 1. Clonar repositorio

```bash
git clone https://github.com/TU_USUARIO/goodjob-expo.git
cd goodjob-expo
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Crear archivo `.env.local`

Copia `.env.example` y renómbralo a `.env.local`:

```bash
cp .env.example .env.local
```

### 4. Agregar credenciales de Firebase

Edita `.env.local` con tus credenciales:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=tu_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_id
EXPO_PUBLIC_FIREBASE_APP_ID=tu_app_id
```
### 5. Ejecutar la app

```bash
npx expo start
```
---

## 🌍 Variables de Entorno

**`.env.local` (NO versionado en Git)**

```env
# Firebase
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=

# EmailJS
EXPO_PUBLIC_EMAILJS_SERVICE_ID=
EXPO_PUBLIC_EMAILJS_TEMPLATE_ID=
EXPO_PUBLIC_EMAILJS_PUBLIC_KEY=

# OpenAI (solo en el servidor, NO usar prefijo EXPO_PUBLIC_)
OPENAI_API_KEY=

# Google Maps (opcional, para ubicación en tiempo real)
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=

# API URLs
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_API_TIMEOUT=30000
```

> ⚠️ Las variables con prefijo `EXPO_PUBLIC_` se incluyen en el código de la app y son visibles para los usuarios. Protege tus datos con **Firebase Security Rules** y restringe tus API keys.
> 🔒 La clave de OpenAI se guarda únicamente en el servidor (por ejemplo, Firebase Cloud Functions), nunca en la app.

---

## 📁 Estructura de Carpetas

```
goodjob-expo/
├── src/
│   ├── config/
│   │   └── firebase.ts          # Inicialización de Firebase
│   ├── data/
│   │   └── firestore.ts         # Queries a Firestore (CRUD)
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── SignupScreen.tsx
│   │   ├── home/
│   │   │   └── HomeScreen.tsx
│   │   ├── profile/
│   │   │   └── ProfileScreen.tsx
│   │   └── ...
│   ├── components/
│   │   ├── common/
│   │   └── ...
│   ├── utils/
│   │   ├── storage.ts           # Utilidades de AsyncStorage
│   │   └── useAuth.ts           # Hook de autenticación
│   └── types/
│       └── index.ts             # Tipos de TypeScript
├── app/
│   └── (tabs)/
│       ├── _layout.tsx          # Configuración de navegación
│       └── index.tsx            # Pestaña de inicio
├── .env.example
├── .env.local                   # (NO versionado)
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## ▶️ Comandos


| Comando | Descripción |
|---------|-------------|
| `npm run web` | Ejecutar en modo desarrollo (Web) |
| `npm run android` | Ejecutar en Android |
| `npm run ios` | Ejecutar en iOS |
| `npm run clean` | Limpiar caché |
| `npm install` | Instalar dependencias |
| `npm update` | Actualizar dependencias |
| `npm test` | Ejecutar tests (cuando estén configurados) |
| `npm run build` | Build para producción |

---

## 🔥 Firestore Schema

| Categoría | Colección | Descripción |
|-----------|-----------|-------------|
| 👤 **Usuarios y perfiles** | `users` | Cuentas de usuarios |
| | `workers` | Perfiles de trabajadores |
| | `addresses` | Direcciones |
| 🔧 **Servicios** | `categories` | Categorías de servicios |
| | `workerCategories` | Relación trabajador-categoría |
| | `availability` | Horarios disponibles |
| | `workEvidence` | Evidencia de trabajo |
| 📅 **Reservas** | `bookings` | Reservas de servicios |
| | `serviceRequests` | Solicitudes de servicio |
| 💬 **Mensajería** | `chats` | Conversaciones |
| | `chatMessages` | Mensajes (subcolección) |
| 🤖 **IA** | `aiConversations` | Conversaciones con IA |
| | `aiMessages` | Mensajes de IA (subcolección) |
| | `aiDiagnostics` | Diagnósticos |
| | `aiRecommendations` | Recomendaciones |
| 📦 **Otros** | `reviews` | Reseñas |
| | `favorites` | Favoritos |
| | `notifications` | Notificaciones |
| | `payments` | Pagos |
| | `paymentMethods` | Métodos de pago |
| | `reports` | Reportes |

Consulta `firestore_schema_basejob.md` para ver los detalles completos.

---

## 🚀 Roadmap


- [ ] Configurar Firebase (credenciales en `.env.local`)
- [ ] Crear las colecciones en Firestore (manualmente o con scripts)
- [ ] Implementar autenticación (`LoginScreen`)
- [ ] Verificación multifactor (MFA) con Firebase Authentication
- [ ] Crear `HomeScreen` (listado de trabajadores)
- [ ] Agregar navegación con `expo-router`
- [ ] Chat entre empleador y trabajador
- [ ] Asistente de IA con OpenAI (a través de un backend seguro)
- [ ] Envío de correos de verificación y notificaciones con EmailJS
- [ ] Ubicación en tiempo real del profesional durante el servicio
- [ ] Pagos y métodos de pago
- [ ] Publicación en App Store y Google Play


---

## 🔗 Enlaces Útiles

- [Documentación de Expo](https://docs.expo.dev)
- [Firebase JS SDK](https://firebase.google.com/docs/web/setup)
- [Firestore Database](https://firebase.google.com/docs/firestore)
- [EmailJS Docs](https://www.emailjs.com/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [React Native Docs](https://reactnative.dev)

---

## Contribuir

¡Las contribuciones son bienvenidas!

1. Haz un fork del proyecto.
2. Crea una rama: `git checkout -b feature/mi-mejora`
3. Haz commit de tus cambios: `git commit -m "feat: agrega mi mejora"`
4. Sube tu rama: `git push origin feature/mi-mejora`
5. Abre un Pull Request.

## 📝 Notas de Desarrollo

- **Variables de entorno:** Nunca subir `.env.local` ni credenciales al repositorio.
- **TypeScript:** Usar tipos de TypeScript en todas las funciones.
- **Seguridad:** nunca guardar tokens o credenciales en el código
- **Firestore:** Consultar `firestore_schema_basejob.md` antes de modificar la estructura de datos.
- **Configurar correctamente:** Firebase Security Rules** antes de producción.

---

## 👥 Equipo y licencia

Desarrollado por el equipo de **GOOBJOB**.


<p align="center">
  <sub>Última actualización: octubre 2026</sub>
</p>
