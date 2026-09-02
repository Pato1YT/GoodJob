# 🎨 GoodJob - Design Specification

## Paleta de Colores

```
- Primary (Negro):     #000000  → Botones, títulos
- Secondary (Blanco):  #FFFFFF  → Fondo, botones secundarios
- Accent (Azul):       #0066FF  → Links, detalles
- Danger (Rojo):       #FF3B30  → Errores
- Success (Verde):     #34C759  → Éxito
- Gray:                #F2F2F7  → Fondos claros
- Dark Gray:           #8E8E93  → Texto secundario
```

## Tipografía

```
- Títulos:     28px, Bold (font-weight: 700)
- Subtítulos:  16px, Regular (font-weight: 400)
- Body:        14px, Regular (font-weight: 400)
- Botones:     16px, SemiBold (font-weight: 600)
- Labels:      12px, SemiBold (font-weight: 600)
```

## Espaciado

```
xs:   4px
sm:   8px
md:   16px
lg:   24px
xl:   32px
xxl:  48px
```

## Border Radius

```
sm:  8px  → Input, pequeños botones
md:  12px → Botones principales, cards
lg:  16px → Modales, grandes containers
```

---

## 📱 LOGIN SCREEN

### Layout

```
┌─────────────────────────────┐
│                             │  
│     ┌───────────────┐       │  Logo container
│     │  GOOD JOB     │       │  (Negro bg, 48px padding)
│     └───────────────┘       │
│                             │  32px spacing (xl)
│      Bienvenido             │  Title (28px, bold)
│   Inicia sesión para        │  Subtitle (16px)
│      continuar              │
│                             │  16px spacing (md)
│  ┌──────────────────────┐   │
│  │ Correo electrónico   │   │  CustomInput
│  └──────────────────────┘   │
│                             │  8px spacing (sm)
│  ┌──────────────────────┐   │
│  │ Contraseña           │   │  CustomInput
│  └──────────────────────┘   │
│                             │  8px spacing (sm)
│        ¿Olvidaste tu        │  LinkButton
│       contraseña?           │
│                             │  16px spacing (md)
│  ┌──────────────────────┐   │
│  │   Iniciar Sesión     │   │  CustomButton (large, primary)
│  └──────────────────────┘   │
│                             │  16px spacing (md)
│    ¿No tienes cuenta?       │
│     Regístrate aquí         │  LinkButton
│                             │
└─────────────────────────────┘
```

### Components Used
- CustomInput (2x) - Email, Password
- CustomButton (1x) - Login button
- LinkButton (2x) - Forgot password, Sign up link
- ErrorMessage - Display errors

---

## 📱 SIGNUP SCREEN

### Layout

```
┌─────────────────────────────┐
│                             │
│     Crear Cuenta            │  Title (28px, bold)
│  Únete a GoodJob y          │  Subtitle (16px)
│  comienza ahora             │
│                             │  16px spacing (md)
│  ┌──────────────────────┐   │
│  │ Nombre               │   │  CustomInput
│  └──────────────────────┘   │
│                             │  8px spacing (sm)
│  ┌──────────────────────┐   │
│  │ Apellido paterno     │   │  CustomInput
│  └──────────────────────┘   │
│                             │  8px spacing (sm)
│  ┌──────────────────────┐   │
│  │ Apellido materno     │   │  CustomInput (opcional)
│  └──────────────────────┘   │
│                             │  8px spacing (sm)
│  ┌──────────────────────┐   │
│  │ Correo               │   │  CustomInput
│  └──────────────────────┘   │
│                             │  8px spacing (sm)
│  ┌──────────────────────┐   │
│  │ Teléfono             │   │  CustomInput
│  └──────────────────────┘   │
│                             │  8px spacing (sm)
│  ┌──────────────────────┐   │
│  │ Contraseña           │   │  CustomInput
│  └──────────────────────┘   │
│                             │  8px spacing (sm)
│  ┌──────────────────────┐   │
│  │ Confirmar contraseña │   │  CustomInput
│  └──────────────────────┘   │
│                             │  16px spacing (md)
│   ¿Qué eres?                │  Label (14px)
│  ┌──┐ ┌──┐ ┌──┐            │  3 RoleButtons
│  │Em│ │Tr│ │Am│            │
│  └──┘ └──┘ └──┘            │
│ Empl Trab  Amb             │
│                             │  16px spacing (md)
│  ┌──────────────────────┐   │
│  │   Registrarse        │   │  CustomButton (large, primary)
│  └──────────────────────┘   │
│                             │  16px spacing (md)
│    ¿Ya tienes cuenta?       │
│      Inicia sesión          │  LinkButton
│                             │
└─────────────────────────────┘
```

### Components Used
- CustomInput (7x) - Name fields, email, phone, password
- CustomButton (1x) - Sign up button
- LinkButton (1x) - Login link
- RoleButton (3x) - Employer, Worker, Both
- ErrorMessage - Display errors

---

## 🎯 Component Specifications

### CustomInput
**Props:**
- placeholder: string
- value: string
- onChangeText: (text: string) => void
- secureTextEntry?: boolean (para passwords)
- keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad'
- error?: string
- editable?: boolean

**Styling:**
- Background: #F2F2F7 (colors.gray)
- Border: 1px solid #E5E5EA (colors.border)
- Border Radius: 8px
- Padding: 16px (md)
- Focus: Border becomes blue (#0066FF)
- Error: Border becomes red (#FF3B30)

### CustomButton
**Props:**
- title: string
- onPress: () => void
- loading?: boolean
- disabled?: boolean
- variant?: 'primary' | 'secondary' | 'danger'
- size?: 'small' | 'medium' | 'large'

**Variants:**
- **primary** (default): Black bg, white text
- **secondary**: White bg, black border & text
- **danger**: Red bg, white text

**Sizes:**
- **small**: 8px padding vertical, 8px horizontal
- **medium**: 16px padding vertical, 24px horizontal
- **large**: 24px padding vertical, 32px horizontal

### LinkButton
**Props:**
- text: string
- onPress: () => void

**Styling:**
- Color: Blue (#0066FF)
- Text Decoration: Underline
- Font Weight: 600

### ErrorMessage
**Props:**
- message: string
- onDismiss?: () => void

**Styling:**
- Background: Light red (#FFE5E5)
- Border left: 4px red
- Text color: Red (#FF3B30)

---

## 📐 Responsive Design

### Safe Area Insets
- Horizontal padding: 24px (lg spacing)
- Vertical padding: 24px (lg spacing)

### Mobile Considerations
- Max width: Full screen width - padding
- ScrollView for all screens (to handle keyboard)
- KeyboardAvoidingView for iOS

---

## 🔄 Navigation Flow

```
                    ┌──────────┐
                    │ App Init  │
                    └────┬─────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   Authenticated    Not Authenticated    Loading
        │                │                │
        ↓                ↓                ↓
    HomeScreen    LoginScreen ←─→ SignupScreen
                    ↓
           [onNavigateToSignup]
                    ↓
                SignupScreen
                    ↓
           [onNavigateToLogin]
                    ↓
                LoginScreen
```

---

## ✅ States

### Input States
- Default: Gray bg, gray border
- Focused: Gray bg, blue border
- Error: Gray bg, red border
- Disabled: Gray bg, reduced opacity

### Button States
- Default: Solid color, opacity 1
- Pressed: Opacity 0.7
- Disabled: Opacity 0.5
- Loading: Spinner animation

---

## 📝 Validations

### Email
- Not empty
- Valid format (contains @)

### Password
- Min 6 characters
- Confirm password must match

### Names
- Not empty
- Trimmed

### Phone
- Not empty

### Role
- Required (default: 'employer')

---

## 🎬 Animations

- Button press: Opacity change (0.7)
- Loading: Spinner animation
- Error slide-in: Smooth transition

No heavy animations for now - focus on functionality.