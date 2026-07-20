# 🔧 GoodJob - Expo

Plataforma móvil para conectar empleadores y trabajadores de servicios domésticos y técnicos.

**Stack:** React Native (Expo) • TypeScript • Firebase • Firestore

---

## 📋 Tabla de contenidos

- [Descripción](#descripción)
- [Stack Tecnológico](#stack-tecnológico)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Variables de Entorno](#variables-de-entorno)
- [Estructura de Carpetas](#estructura-de-carpetas)
- [Comandos](#comandos)
- [Firestore Schema](#firestore-schema)

---

## 📖 Descripción

**GoodJob** es una aplicación multiplataforma (iOS, Android, Web) que facilita:

- 👨‍💼 **Empleadores:** Encontrar trabajadores verificados para servicios domésticos y técnicos
- 🔧 **Trabajadores:** Promocionar sus servicios y aceptar trabajos
- ⭐ **Reseñas:** Sistema de calificación para garantizar calidad
- 💬 **Chat:** Comunicación directa entre empleador y trabajador
- 🤖 **IA:** Asistente para ayudar a identificar el servicio necesario

---

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **Expo** | 57+ | Framework para React Native |
| **React Native** | Latest | Framework móvil |
| **TypeScript** | Latest | Tipado estático |
| **Firebase** | 9+ | Backend y autenticación |
| **Firestore** | Latest | Base de datos NoSQL |
| **Zustand** | Latest | Gestión de estado (opcional) |
| **Expo Router** | Latest | Navegación |

---

## ✅ Requisitos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 (o yarn/pnpm)
- **Expo CLI**: `npm install -g expo-cli`
- **Cuenta de Firebase** (https://console.firebase.google.com)

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

# Google Maps (opcional)
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=

# API URLs
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_API_TIMEOUT=30000
```

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
│   │   ├── storage.ts           # AsyncStorage utilities
│   │   └── useAuth.ts           # Auth hook
│   └── types/
│       └── index.ts             # TypeScript types
├── app/
│   └── (tabs)/
│       ├── _layout.tsx          # Navigation setup
│       └── index.tsx            # Home tab
├── .env.example
├── .env.local                    # (NO versionado)
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## ▶️ Comandos

```bash
# Ejecutar en modo desarrollo (Web)
npm run web

# Ejecutar en Android
npm run android

# Ejecutar en iOS
npm run ios

# Limpiar caché
npm run clean

# Instalar dependencias
npm install

# Actualizar dependencias
npm update

# Tests (cuando estén configurados)
npm test

# Build para producción
npm run build
```

---

## 🔥 Firestore Schema

El proyecto usa **21 colecciones** en Firestore:

**Usuarios y Perfiles:**
- `users` - Cuentas de usuarios
- `workers` - Perfiles de trabajadores
- `addresses` - Direcciones

**Servicios:**
- `categories` - Categorías de servicios
- `workerCategories` - Relación trabajador-categoría
- `availability` - Horarios disponibles
- `workEvidence` - Evidencia de trabajo

**Reservas:**
- `bookings` - Reservas de servicios
- `serviceRequests` - Solicitudes de servicio

**Mensajería:**
- `chats` - Conversaciones
- `chatMessages` - Mensajes (subcolección)

**IA:**
- `aiConversations` - Conversaciones con IA
- `aiMessages` - Mensajes de IA (subcolección)
- `aiDiagnostics` - Diagnósticos
- `aiRecommendations` - Recomendaciones

**Otros:**
- `reviews` - Reseñas
- `favorites` - Favoritos
- `notifications` - Notificaciones
- `payments` - Pagos
- `paymentMethods` - Métodos de pago
- `reports` - Reportes

Ver `firestore_schema_basejob.md` para detalles completos.

---

## 🚀 Primeros Pasos

1. **Configurar Firebase** (credenciales en `.env.local`)
2. **Crear colecciones** en Firestore (manualmente o con scripts)
3. **Implementar autenticación** (LoginScreen)
4. **Crear HomeScreen** (listado de trabajadores)
5. **Agregar navegación** (expo-router)

---

## 🔗 Enlaces Útiles

- [Documentación de Expo](https://docs.expo.dev)
- [Firebase JS SDK](https://firebase.google.com/docs/web/setup)
- [Firestore Database](https://firebase.google.com/docs/firestore)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [React Native Docs](https://reactnative.dev)

---

## 📝 Notas de Desarrollo

- **Variables de entorno:** Nunca commitear `.env.local`
- **Seguridad:** Nunca guardar tokens o credenciales en el código
- **TypeScript:** Usar tipos en todas las funciones
- **Firestore:** Consultar `firestore_schema_basejob.md` para estructura de datos
- **Firebase Security Rules:** Configurar correctamente antes de producción

---

## 👨‍💻 Contribuidores

Equipo de GoodJob

---


**Last updated:** Julio 2026
