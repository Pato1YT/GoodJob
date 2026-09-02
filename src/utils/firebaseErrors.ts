export const getSpanishAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'El usuario o la contraseña son incorrectos.';
    case 'auth/email-already-in-use':
      return 'Este correo electrónico ya está registrado.';
    case 'auth/invalid-email':
      return 'El formato del correo electrónico no es válido.';
    case 'auth/weak-password':
      return 'La contraseña es muy débil. Debe tener al menos 6 caracteres.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos. Inténtalo más tarde.';
    case 'auth/network-request-failed':
      return 'Error de conexión. Verifica tu internet.';
    default:
      return 'Ocurrió un error inesperado. Por favor, intentalo de nuevo.';
  }
};