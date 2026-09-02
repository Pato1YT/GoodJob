// Pantalla de Búsqueda y Filtros (Conectada con Firestore y CustomModal)
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Importación del servicio de Firestore y tipos
import { workerService } from '../../src/data/firestore';
import { Worker } from '../../src/types';

const COLORS = {
  background: '#F9F9FB',
  surface: '#FFFFFF',
  surfaceLow: '#F3F3F5',
  surfaceVariant: '#E2E2E4',
  textPrimary: '#1A1C1D',
  textSecondary: '#4C4546',
  primary: '#000000',
  onPrimary: '#FFFFFF',
  error: '#BA1A1A',
};

const CATEGORIES = ['Todos', 'Fontanería', 'Limpieza', 'Jardinería', 'Electricidad'];

// Componente CustomModal
interface CustomModalProps {
  visible: boolean;
  type?: 'success' | 'error' | 'info';
  title: string;
  message: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryPress: () => void;
  onSecondaryPress?: () => void;
}

const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  type = 'info',
  title,
  message,
  primaryButtonText = 'Aceptar',
  secondaryButtonText,
  onPrimaryPress,
  onSecondaryPress,
}) => {
  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Ionicons name="checkmark-circle" size={48} color="#2E7D32" />;
      case 'error':
        return <Ionicons name="alert-circle" size={48} color={COLORS.error} />;
      default:
        return <Ionicons name="information-circle" size={48} color={COLORS.primary} />;
    }
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onPrimaryPress}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          <View style={modalStyles.iconContainer}>{getIcon()}</View>

          <Text style={modalStyles.title}>{title}</Text>
          <Text style={modalStyles.message}>{message}</Text>

          <View style={modalStyles.buttonContainer}>
            {secondaryButtonText && onSecondaryPress && (
              <TouchableOpacity
                style={[modalStyles.button, modalStyles.secondaryButton]}
                onPress={onSecondaryPress}
              >
                <Text style={modalStyles.secondaryButtonText}>{secondaryButtonText}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                modalStyles.button,
                modalStyles.primaryButton,
                type === 'error' && { backgroundColor: COLORS.error },
              ]}
              onPress={onPrimaryPress}
            >
              <Text style={modalStyles.primaryButtonText}>{primaryButtonText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function SearchScreen() {
  const params = useLocalSearchParams<{ category?: string }>();
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Estados para los trabajadores desde Firestore
  const [professionals, setProfessionals] = useState<Worker[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Estado para el CustomModal
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
    primaryButtonText?: string;
    secondaryButtonText?: string;
    onPrimaryPress: () => void;
    onSecondaryPress?: () => void;
  }>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    onPrimaryPress: () => {},
  });

  const hideModal = () => {
    setModalConfig((prev) => ({ ...prev, visible: false }));
  };

  // 1. Sincronizar parámetro de categoría inicial recibido por la URL
  useEffect(() => {
    if (params.category && CATEGORIES.includes(params.category)) {
      setSelectedCategory(params.category);
    }
  }, [params.category]);

  // 2. Cargar profesionales de Firestore al montar el componente
  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      const service = workerService as any;
      const getFn = service.getAll || service.getWorkers || service.getAllWorkers;

      if (typeof getFn === 'function') {
        const data = await getFn();
        setProfessionals(data || []);
      } else {
        setProfessionals([]);
      }
    } catch (error) {
      console.error('Error al obtener trabajadores de Firestore:', error);
      setProfessionals([]);
      
      setModalConfig({
        visible: true,
        type: 'error',
        title: 'Error de conexión',
        message: 'No se pudieron cargar los profesionales. Por favor, verifica tu conexión a internet e inténtalo de nuevo.',
        primaryButtonText: 'Reintentar',
        secondaryButtonText: 'Cancelar',
        onPrimaryPress: () => {
          hideModal();
          fetchProfessionals();
        },
        onSecondaryPress: hideModal,
      });
    } finally {
      setLoading(false);
    }
  };

  // 3. Filtrado dinámico local según búsqueda y categoría seleccionada
  const filteredProfessionals = professionals.filter((pro) => {
    const w = pro as any;

    const proName = `${w.firstName || ''} ${w.lastName || ''}`.trim() || w.userNameSnapshot || '';
    const proCategory = w.category || w.title || '';
    const proRole = w.roleTitle || w.title || w.category || '';

    const matchesCategory =
      selectedCategory === 'Todos' ||
      proCategory.toLowerCase() === selectedCategory.toLowerCase();

    const matchesSearch =
      proName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proRole.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header con Buscador */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
        </TouchableOpacity>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre o servicio..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Chips de Categorías */}
      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, isActive && styles.activeChip]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.chipText, isActive && styles.activeChipText]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Lista de Resultados de Firestore */}
      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Buscando profesionales...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.resultsCount}>
            {filteredProfessionals.length}{' '}
            {filteredProfessionals.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
          </Text>

          {filteredProfessionals.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>No se encontraron profesionales con esos criterios.</Text>
            </View>
          ) : (
            filteredProfessionals.map((pro) => {
              const w = pro as any;
              const name = `${w.firstName || ''} ${w.lastName || ''}`.trim() || w.userNameSnapshot || 'Profesional';
              const roleTitle = w.roleTitle || w.title || w.category || 'Especialista en servicios';
              const rating = w.avgRating !== undefined ? Number(w.avgRating).toFixed(1) : 'Nuevo';
              const price = w.hourlyRate ? `$${w.hourlyRate}/h` : 'A convenir';
              const imageUrl = w.avatarUrl || w.photoURL || 'https://via.placeholder.com/150';

              return (
                <View key={pro.id} style={styles.proCard}>
                  <Image source={{ uri: imageUrl }} style={styles.proImage} />
                  <View style={styles.proContent}>
                    <Text style={styles.proName}>{name}</Text>
                    <Text style={styles.proRole}>{roleTitle}</Text>

                    <View style={styles.row}>
                      <Ionicons name="star" size={14} color={COLORS.primary} />
                      <Text style={styles.ratingText}>{rating}</Text>
                      <Text style={styles.dot}>•</Text>
                      <Ionicons name="pricetag-outline" size={14} color={COLORS.textSecondary} />
                      <Text style={styles.infoText}>{price}</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.profileButton}
                      activeOpacity={0.8}
                      onPress={() => router.push(`/worker/${pro.id}`)}
                    >
                      <Text style={styles.profileButtonText}>Ver Perfil</Text>
                      <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Modal Personalizado Integrado */}
      <CustomModal
        visible={modalConfig.visible}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        primaryButtonText={modalConfig.primaryButtonText}
        secondaryButtonText={modalConfig.secondaryButtonText}
        onPrimaryPress={modalConfig.onPrimaryPress}
        onSecondaryPress={modalConfig.onSecondaryPress}
      />
    </SafeAreaView>
  );
}

// Estilos del Modal
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.surfaceLow,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
  },
  primaryButtonText: {
    color: COLORS.onPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
});

// Estilos Principales
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLow,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  categoriesContainer: {
    paddingVertical: 8,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLow,
  },
  activeChip: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeChipText: {
    color: COLORS.onPrimary,
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  resultsList: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  resultsCount: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 16,
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  proCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    gap: 12,
  },
  proImage: {
    width: 90,
    height: 100,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceVariant,
  },
  proContent: {
    flex: 1,
    justifyContent: 'center',
  },
  proName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  proRole: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  dot: {
    color: COLORS.surfaceVariant,
    marginHorizontal: 2,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  profileButton: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  profileButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
});