/**
 * GoodJob - Auth Layout
 * Layout para pantallas de autenticación
 */
import { Stack } from "expo-router";
 export default function AuthLayout(){
  return(
        <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" options={{ title: 'Iniciar Sesión' }} />
        <Stack.Screen name="signup" options={{ title: 'Registrarse' }} />
        <Stack.Screen name="forgot-password" options={{ title: 'Recuperar Contraseña' }} />
        <Stack.Screen name="two_step_verification" options={{ title: 'Verificación' }} />
      </Stack>
  );
 }






/**
 * export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        //animationEnabled: true,
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          title: 'Iniciar Sesión',
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          title: 'Registrarse',
        }}
      />
    </Stack>
  );
}

 * 
 *
 */

