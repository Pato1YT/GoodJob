/**
 * GoodJob - Seed Database Script (ACTUALIZADO)
 * Crea datos de prueba automáticamente en Firestore
 * Usa: await seedDatabase() una sola vez en app/_layout.tsx
 */

import {
  collection,
  addDoc,
  getDocs,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// ============================================================================
// DATOS DE PRUEBA - CATEGORÍAS
// ============================================================================

const CATEGORIES_DATA = [
  { 
    name: 'Plomería', 
    isActive: true,
    icon: 'pipe',
    description: 'Reparaciones de tuberías, grifos y sistemas de agua'
  },
  { 
    name: 'Electricidad', 
    isActive: true,
    icon: 'lightning-bolt',
    description: 'Instalación y reparación eléctrica'
  },
  { 
    name: 'Limpieza', 
    isActive: true,
    icon: 'broom',
    description: 'Servicios de limpieza profesional'
  },
  { 
    name: 'Jardinería', 
    isActive: true,
    icon: 'leaf',
    description: 'Mantenimiento y diseño de jardines'
  },
  { 
    name: 'Carpintería', 
    isActive: true,
    icon: 'hammer',
    description: 'Trabajos en madera y carpintería'
  },
  { 
    name: 'Pintura', 
    isActive: true,
    icon: 'paint-brush',
    description: 'Pintura de interiores y exteriores'
  },
  { 
    name: 'Refrigeración', 
    isActive: true,
    icon: 'snowflake',
    description: 'Instalación y reparación de aire acondicionado'
  },
];

// ============================================================================
// DATOS DE PRUEBA - TRABAJADORES
// ============================================================================

const WORKERS_DATA = [
  {
    userNameSnapshot: 'Carlos Rodríguez',
    available: true,
    verified: true,
    avgRating: 4.8,
    totalReviews: 127,
    yearsExperience: 12,
    status: 'active',
    phone: '7351234567',
    categories: ['Plomería', 'Refrigeración'],
    description: 'Especialista en plomería con 12 años de experiencia',
  },
  {
    userNameSnapshot: 'María González García',
    available: true,
    verified: true,
    avgRating: 4.9,
    totalReviews: 89,
    yearsExperience: 8,
    status: 'active',
    phone: '7350987654',
    categories: ['Limpieza', 'Organización'],
    description: 'Limpieza profesional y organización de espacios',
  },
  {
    userNameSnapshot: 'Juan Pérez López',
    available: true,
    verified: true,
    avgRating: 4.7,
    totalReviews: 45,
    yearsExperience: 5,
    status: 'active',
    phone: '7351111111',
    categories: ['Electricidad', 'Mantenimiento'],
    description: 'Electricista profesional certificado',
  },
  {
    userNameSnapshot: 'Ing. Miguel Ángel Flores',
    available: true,
    verified: true,
    avgRating: 4.9,
    totalReviews: 203,
    yearsExperience: 20,
    status: 'active',
    phone: '7352222222',
    categories: ['Electricidad', 'Construcción'],
    description: 'Ingeniero con 20 años en construcción y electricidad',
  },
  {
    userNameSnapshot: 'Rosa Martínez Hernández',
    available: true,
    verified: true,
    avgRating: 4.8,
    totalReviews: 156,
    yearsExperience: 15,
    status: 'active',
    phone: '7353333333',
    categories: ['Limpieza', 'Organización', 'Asesoramiento'],
    description: 'Experta en limpieza y organización del hogar',
  },
  {
    userNameSnapshot: 'David Morales',
    available: true,
    verified: true,
    avgRating: 4.6,
    totalReviews: 72,
    yearsExperience: 7,
    status: 'active',
    phone: '7354444444',
    categories: ['Carpintería', 'Diseño'],
    description: 'Carpintero especializado en diseño personalizado',
  },
  {
    userNameSnapshot: 'Sofía Delgado Ruiz',
    available: true,
    verified: true,
    avgRating: 4.7,
    totalReviews: 98,
    yearsExperience: 6,
    status: 'active',
    phone: '7355555555',
    categories: ['Pintura', 'Decoración'],
    description: 'Pintora profesional y decoradora de interiores',
  },
  {
    userNameSnapshot: 'Leonardo Santos',
    available: true,
    verified: true,
    avgRating: 4.9,
    totalReviews: 184,
    yearsExperience: 18,
    status: 'active',
    phone: '7356666666',
    categories: ['Plomería', 'Construcción', 'Mantenimiento'],
    description: 'Maestro en plomería y construcción general',
  },
];

// ============================================================================
// FUNCIÓN PRINCIPAL DE SEED
// ============================================================================

export const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando seed de base de datos...');

    // Verificar si ya hay datos
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    const workersSnapshot = await getDocs(collection(db, 'workers'));

    if (categoriesSnapshot.size > 0 && workersSnapshot.size > 0) {
      console.log(
        '✅ La base de datos ya tiene datos. Saltando seed...'
      );
      return;
    }

    // Crear categorías
    if (categoriesSnapshot.size === 0) {
      console.log('📁 Creando categorías...');
      for (const category of CATEGORIES_DATA) {
        try {
          await addDoc(collection(db, 'categories'), {
            ...category,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        } catch (error) {
          console.error(`Error creando categoría ${category.name}:`, error);
        }
      }
      console.log(`✅ ${CATEGORIES_DATA.length} categorías creadas`);
    }

    // Crear trabajadores
    if (workersSnapshot.size === 0) {
      console.log('👨‍💼 Creando trabajadores...');
      for (const worker of WORKERS_DATA) {
        try {
          await addDoc(collection(db, 'workers'), {
            ...worker,
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: `user_${Math.random().toString(36).substr(2, 9)}`,
            location: {
              latitude: 25.6867 + (Math.random() - 0.5) * 0.1,
              longitude: -99.7530 + (Math.random() - 0.5) * 0.1,
              city: 'Iguala, Guerrero',
            },
          });
        } catch (error) {
          console.error(`Error creando trabajador ${worker.userNameSnapshot}:`, error);
        }
      }
      console.log(`✅ ${WORKERS_DATA.length} trabajadores creados`);
    }

    console.log('✨ Seed completado exitosamente');
  } catch (error) {
    console.error('❌ Error en seed:', error);
  }
};

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

export const checkDatabaseStatus = async () => {
  try {
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    const workersSnapshot = await getDocs(collection(db, 'workers'));

    console.log(`📊 Estado de la base de datos:`);
    console.log(`   - Categorías: ${categoriesSnapshot.size}`);
    console.log(`   - Trabajadores: ${workersSnapshot.size}`);

    return {
      categories: categoriesSnapshot.size,
      workers: workersSnapshot.size,
    };
  } catch (error) {
    console.error('❌ Error al revisar estado:', error);
  }
};

export const clearDatabase = async () => {
  try {
    console.log('🗑️ Función de limpieza deshabilitada por seguridad');
    console.log('Para limpiar datos, hazlo manualmente en Firebase Console');
  } catch (error) {
    console.error('❌ Error:', error);
  }
};
