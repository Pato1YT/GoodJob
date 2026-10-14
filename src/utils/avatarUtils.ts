/**
 * Utilidad ligera para asignar avatares y fotos profesionales dinámicas
 * Si el trabajador no tiene foto en Firestore, le asigna una foto realista
 * de forma determinista y consistente en toda la app.
 */

const AVATAR_POOL = [
  'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400', // Hombre joven técnico
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400', // Mujer profesional
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400', // Hombre profesional
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400', // Mujer especialista
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400', // Mujer joven
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400', // Hombre sonriendo
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400', // Hombre con barba
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400', // Hombre joven
  'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=400', // Mujer técnica de servicios
  'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400', // Electricista / técnico
];

/**
 * Retorna la foto de un trabajador o una foto determinista del pool según su ID/nombre.
 */
export function getWorkerPhoto(worker?: {
  id?: string;
  userPhotoSnapshot?: string;
  photoUrl?: string;
  avatarUrl?: string;
  photoURL?: string;
  firstName?: string;
  userNameSnapshot?: string;
}): string {
  if (!worker) return AVATAR_POOL[0];

  const customPhoto =
    worker.userPhotoSnapshot ||
    worker.photoUrl ||
    worker.avatarUrl ||
    worker.photoURL;

  if (customPhoto && customPhoto.trim().length > 0 && !customPhoto.includes('via.placeholder')) {
    return customPhoto;
  }

  // Generar un hash numérico consistente a partir del ID o del nombre
  const key = worker.id || worker.firstName || worker.userNameSnapshot || 'goodjob';
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0; // Convertir a entero de 32 bits
  }

  const index = Math.abs(hash) % AVATAR_POOL.length;
  return AVATAR_POOL[index];
}
