import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';

import { aiService, AIDiagnosisResult } from '../../src/services/aiService';
import { workerService } from '../../src/data/firestore';
import { Worker } from '../../src/types';
import { getWorkerPhoto } from '../../src/utils/avatarUtils';
import { useThemeStore } from '../../src/utils/themeStore';

const COLORS = {
  primary: '#000000',
  onPrimary: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceLow: '#F3F3F5',
  surfaceVariant: '#E2E2E4',
  background: '#F9F9FB',
  textPrimary: '#1A1C1D',
  textSecondary: '#4C4546',
  accent: '#2563EB',
  success: '#1B5E20',
  warning: '#E65100',
  error: '#BA1A1A',
};

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text?: string;
  imageUri?: string;
  diagnosis?: AIDiagnosisResult;
  recommendedWorkers?: Worker[];
  timestamp: string;
}

const QUICK_SUGGESTIONS = [
  '💧 Fuga de agua debajo del lavabo',
  '⚡ Se botaron las pastillas de luz',
  '🔑 La cerradura de la puerta se trabó',
  '❄️ El aire acondicionado no enfría',
  '🎨 Pintar una recámara de 4x4m',
];

const getFormattedTime = () => {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function AIScreen() {
  const isDark = useThemeStore((s) => s.isDark);
  const themeColors = useThemeStore((s) => s.colors);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ uri: string; base64?: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    setMessages([
      {
        id: 'welcome-1',
        sender: 'ai',
        text: '¡Hola! Soy GoodJob AI ✨. Cuéntame qué problema tienes en casa o tómale una foto a la avería. Te daré un diagnóstico técnico, un estimado de costo en tu zona y los mejores especialistas disponibles.',
        timestamp: getFormattedTime(),
      },
    ]);
  }, []);

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso requerido',
          'Necesitamos acceso a tus fotos para que GoodJob AI pueda inspeccionar la avería.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        setSelectedImage({
          uri: result.assets[0].uri,
          base64: result.assets[0].base64 || undefined,
        });
      }
    } catch (err) {
      console.warn('Error seleccionando imagen:', err);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso requerido',
          'Necesitamos acceso a la cámara para tomar una foto del problema.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        setSelectedImage({
          uri: result.assets[0].uri,
          base64: result.assets[0].base64 || undefined,
        });
      }
    } catch (err) {
      console.warn('Error tomando foto:', err);
    }
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputText).trim();
    if (!textToSend && !selectedImage) return;

    const userMsgId = Date.now().toString();
    const userMsg: Message = {
      id: userMsgId,
      sender: 'user',
      text: textToSend || (selectedImage ? '📸 Foto adjunta de la avería' : ''),
      imageUri: selectedImage?.uri,
      timestamp: getFormattedTime(),
    };

    const currentImgBase64 = selectedImage?.base64;
    setSelectedImage(null);
    setInputText('');
    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      // 1. Diagnosticar con OpenAI gpt-4o-mini
      const diagnosis = await aiService.diagnoseJob(textToSend, currentImgBase64);

      // 2. Buscar trabajadores relevantes en Firestore por categoría
      let matchingWorkers: Worker[] = [];
      try {
        const allWorkers = await workerService.getAvailable(20);
        const catFilter = diagnosis.category.toLowerCase();
        matchingWorkers = allWorkers.filter((w: any) => {
          const wCat = (w.category || w.title || w.bio || '').toLowerCase();
          return wCat.includes(catFilter) || catFilter.includes(wCat);
        }).slice(0, 3);

        // Si no hay específicos de esa categoría, sugerir los mejores disponibles
        if (matchingWorkers.length === 0) {
          matchingWorkers = allWorkers.slice(0, 3);
        }
      } catch (wErr) {
        console.warn('Could not query matching workers:', wErr);
      }

      // 3. Agregar respuesta estructurada de la IA
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        diagnosis,
        recommendedWorkers: matchingWorkers,
        timestamp: getFormattedTime(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error('Error in AI assistant flow:', error);
      const fallbackAiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Hubo un inconveniente al procesar tu solicitud con OpenAI. Por favor verifica que tu API Key sea válida y cuente con saldo disponible.',
        timestamp: getFormattedTime(),
      };
      setMessages((prev) => [...prev, fallbackAiMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderDiagnosisCard = (diag: AIDiagnosisResult, workers?: Worker[]) => {
    let urgencyBadgeBg = '#E8F5E9';
    let urgencyBadgeText = COLORS.success;
    if (diag.urgency === 'media') {
      urgencyBadgeBg = '#FFF3E0';
      urgencyBadgeText = COLORS.warning;
    } else if (diag.urgency === 'alta') {
      urgencyBadgeBg = '#FFEBEE';
      urgencyBadgeText = COLORS.error;
    }

    return (
      <View style={[styles.diagnosisCard, isDark && { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
        {/* Cabecera del diagnóstico */}
        <View style={styles.diagHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.diagTitle, isDark && { color: themeColors.text }]}>{diag.summary}</Text>
            <Text style={[styles.diagCategory, isDark && { color: '#60A5FA' }]}>Especialidad: {diag.categoryName}</Text>
          </View>
          <View style={[styles.urgencyBadge, { backgroundColor: isDark ? (diag.urgency === 'alta' ? '#451A1A' : diag.urgency === 'media' ? '#3B2A10' : '#143823') : urgencyBadgeBg }]}>
            <Text style={[styles.urgencyText, { color: isDark ? (diag.urgency === 'alta' ? '#F87171' : diag.urgency === 'media' ? '#FBBF24' : '#34D399') : urgencyBadgeText }]}>
              {diag.urgency.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Explicación */}
        <Text style={[styles.diagExplanation, isDark && { color: themeColors.textSecondary }]}>{diag.explanation}</Text>

        {/* Cifras clave (Costo estimado & Tiempo) */}
        <View style={styles.estimatesRow}>
          <View style={[styles.estimateBox, isDark && { backgroundColor: themeColors.surfaceLow }]}>
            <Ionicons name="pricetag-outline" size={16} color={themeColors.primary} />
            <Text style={[styles.estimateLabel, isDark && { color: themeColors.textSecondary }]}>Rango Estimado</Text>
            <Text style={[styles.estimateValue, isDark && { color: themeColors.text }]}>{diag.estimatedCostRange}</Text>
          </View>

          <View style={[styles.estimateBox, isDark && { backgroundColor: themeColors.surfaceLow }]}>
            <Ionicons name="time-outline" size={16} color={themeColors.primary} />
            <Text style={[styles.estimateLabel, isDark && { color: themeColors.textSecondary }]}>Tiempo Promedio</Text>
            <Text style={[styles.estimateValue, isDark && { color: themeColors.text }]}>{diag.estimatedTime}</Text>
          </View>
        </View>

        {/* Materiales recomendados */}
        {diag.recommendedMaterials && diag.recommendedMaterials.length > 0 && (
          <View style={[styles.materialsContainer, isDark && { backgroundColor: themeColors.surfaceLow }]}>
            <Text style={[styles.materialsTitle, isDark && { color: themeColors.textSecondary }]}>Posibles materiales / refacciones:</Text>
            <View style={styles.materialsList}>
              {diag.recommendedMaterials.map((mat, idx) => (
                <View key={idx} style={[styles.materialChip, isDark && { backgroundColor: themeColors.surface, borderColor: themeColors.border, borderWidth: 1 }]}>
                  <Text style={[styles.materialChipText, isDark && { color: themeColors.text }]}>• {mat}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Especialistas recomendados */}
        {workers && workers.length > 0 && (
          <View style={[styles.workersSection, isDark && { borderTopColor: themeColors.border }]}>
            <Text style={[styles.workersTitle, isDark && { color: themeColors.text }]}>Especialistas recomendados:</Text>
            {workers.map((w: any) => {
              const name = w.userNameSnapshot || `${w.firstName || ''} ${w.lastName || ''}`.trim() || 'Profesional GoodJob';
              const photo = getWorkerPhoto(w);
              const rating = w.avgRating ? Number(w.avgRating).toFixed(1) : '5.0';

              return (
                <View key={w.id} style={[styles.workerItemCard, isDark && { backgroundColor: themeColors.surfaceLow, borderColor: themeColors.border, borderWidth: 1 }]}>
                  <Image source={{ uri: photo }} style={styles.workerAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.workerName, isDark && { color: themeColors.text }]}>{name}</Text>
                    <View style={styles.workerRatingRow}>
                      <Ionicons name="star" size={12} color="#FBBF24" />
                      <Text style={[styles.workerRatingText, isDark && { color: themeColors.text }]}>{rating}</Text>
                      <Text style={[styles.workerCategoryText, isDark && { color: themeColors.textSecondary }]}>• {w.category || w.bio || diag.categoryName}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.hireBtn, isDark && { backgroundColor: themeColors.primary }]}
                    onPress={() => router.push(`/(workers)/${w.id}`)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.hireBtnText, isDark && { color: themeColors.onPrimary }]}>Ver Perfil</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isAI = item.sender === 'ai';

    return (
      <View style={[styles.messageWrapper, isAI ? styles.aiWrapper : styles.userWrapper]}>
        {isAI && (
          <View style={[styles.aiAvatar, isDark && { backgroundColor: themeColors.surfaceLow }]}>
            <Ionicons name="sparkles" size={16} color={themeColors.primary} />
          </View>
        )}

        <View style={{ maxWidth: '85%' }}>
          {/* Si el usuario mandó foto */}
          {!!item.imageUri && (
            <Image source={{ uri: item.imageUri }} style={styles.userSentImage} />
          )}

          {/* Texto común */}
          {!!item.text && (
            <View
              style={[
                styles.textBubble,
                isAI
                  ? [styles.aiBubble, isDark && { backgroundColor: themeColors.surface, borderColor: themeColors.border }]
                  : [styles.userBubble, isDark && { backgroundColor: themeColors.primary }],
              ]}
            >
              <Text
                style={[
                  styles.bubbleText,
                  isAI
                    ? [styles.aiBubbleText, isDark && { color: themeColors.text }]
                    : [styles.userBubbleText, isDark && { color: themeColors.onPrimary }],
                ]}
              >
                {item.text}
              </Text>
            </View>
          )}

          {/* Tarjeta de Diagnóstico estructurado */}
          {item.diagnosis && renderDiagnosisCard(item.diagnosis, item.recommendedWorkers)}

          <Text style={[styles.timeText, isAI ? styles.aiTimeText : styles.userTimeText, isDark && { color: themeColors.textSecondary }]}>
            {item.timestamp}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, isDark && { backgroundColor: themeColors.background }]}>
      {/* Cabecera */}
      <View style={[styles.header, isDark && { backgroundColor: themeColors.background, borderBottomColor: themeColors.border }]}>
        <View style={[styles.headerIcon, isDark && { backgroundColor: themeColors.surfaceLow }]}>
          <Ionicons name="sparkles" size={20} color={themeColors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, isDark && { color: themeColors.text }]}>GoodJob AI</Text>
          <Text style={[styles.headerSubtitle, isDark && { color: themeColors.textSecondary }]}>Diagnóstico Inteligente & Presupuestos</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Lista de mensajes */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={
            isProcessing ? (
              <View style={[styles.loadingBubble, isDark && { backgroundColor: themeColors.surfaceLow }]}>
                <ActivityIndicator size="small" color={themeColors.primary} />
                <Text style={[styles.loadingBubbleText, isDark && { color: themeColors.textSecondary }]}>
                  Analizando el problema técnico y estimando costos...
                </Text>
              </View>
            ) : null
          }
        />

        {/* Vista previa de foto seleccionada */}
        {selectedImage && (
          <View style={[styles.imagePreviewBar, isDark && { backgroundColor: themeColors.surfaceLow, borderTopColor: themeColors.border }]}>
            <Image source={{ uri: selectedImage.uri }} style={styles.previewThumbnail} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.previewTitle, isDark && { color: themeColors.text }]}>Foto seleccionada</Text>
              <Text style={[styles.previewSubtitle, isDark && { color: themeColors.textSecondary }]}>La IA analizará esta imagen al enviar</Text>
            </View>
            <TouchableOpacity
              onPress={() => setSelectedImage(null)}
              style={styles.removeImageBtn}
            >
              <Ionicons name="close" size={18} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        )}

        {/* Sugerencias Rápidas */}
        {messages.length <= 2 && !selectedImage && (
          <View style={styles.quickBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickBarScroll}>
              {QUICK_SUGGESTIONS.map((sug, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.suggestionChip, isDark && { backgroundColor: themeColors.surfaceLow, borderColor: themeColors.border }]}
                  onPress={() => handleSend(sug)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.suggestionChipText, isDark && { color: themeColors.text }]}>{sug}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Barra de entrada */}
        <View style={[styles.inputContainer, isDark && { backgroundColor: themeColors.background, borderTopColor: themeColors.border }]}>
          <TouchableOpacity
            style={[styles.attachBtn, isDark && { backgroundColor: themeColors.surfaceLow }]}
            onPress={handlePickImage}
            activeOpacity={0.7}
            disabled={isProcessing}
          >
            <Ionicons name="image-outline" size={22} color={themeColors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.attachBtn, isDark && { backgroundColor: themeColors.surfaceLow }]}
            onPress={handleTakePhoto}
            activeOpacity={0.7}
            disabled={isProcessing}
          >
            <Ionicons name="camera-outline" size={22} color={themeColors.primary} />
          </TouchableOpacity>

          <TextInput
            style={[styles.textInput, isDark && { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.text }]}
            placeholder="Describe la falla o avería..."
            placeholderTextColor={isDark ? '#71717A' : COLORS.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            editable={!isProcessing}
          />

          <TouchableOpacity
            style={[
              styles.sendBtn,
              isDark && { backgroundColor: themeColors.primary },
              (!inputText.trim() && !selectedImage) || isProcessing ? styles.sendBtnDisabled : null,
            ]}
            onPress={() => handleSend()}
            disabled={(!inputText.trim() && !selectedImage) || isProcessing}
            activeOpacity={0.8}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color={isDark ? '#000000' : '#FFFFFF'} />
            ) : (
              <Ionicons name="arrow-up" size={20} color={isDark ? themeColors.onPrimary : COLORS.onPrimary} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceVariant,
    gap: 12,
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surfaceLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  userWrapper: {
    justifyContent: 'flex-end',
  },
  aiWrapper: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  textBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userBubbleText: {
    color: COLORS.onPrimary,
  },
  aiBubbleText: {
    color: COLORS.textPrimary,
  },
  userSentImage: {
    width: 220,
    height: 160,
    borderRadius: 14,
    marginBottom: 6,
    backgroundColor: COLORS.surfaceVariant,
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
  },
  userTimeText: {
    color: COLORS.textSecondary,
    alignSelf: 'flex-end',
  },
  aiTimeText: {
    color: COLORS.textSecondary,
    alignSelf: 'flex-start',
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    alignSelf: 'flex-start',
    marginLeft: 40,
    marginVertical: 8,
  },
  loadingBubbleText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  // Tarjeta de Diagnóstico
  diagnosisCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    padding: 16,
    marginTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  diagHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  diagTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  diagCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accent,
    marginTop: 2,
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: '700',
  },
  diagExplanation: {
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 19,
    marginBottom: 12,
  },
  estimatesRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  estimateBox: {
    flex: 1,
    backgroundColor: COLORS.surfaceLow,
    borderRadius: 12,
    padding: 10,
  },
  estimateLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  estimateValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  materialsContainer: {
    backgroundColor: COLORS.surfaceLow,
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  materialsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  materialsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  materialChip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  materialChipText: {
    fontSize: 11,
    color: COLORS.textPrimary,
  },
  workersSection: {
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceVariant,
    paddingTop: 12,
  },
  workersTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  workerItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLow,
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    gap: 10,
  },
  workerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surfaceVariant,
  },
  workerName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  workerRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  workerRatingText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  workerCategoryText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  hireBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  hireBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.onPrimary,
  },
  // Barra de vista previa de foto
  imagePreviewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 10,
    marginHorizontal: 16,
    marginBottom: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    gap: 10,
  },
  previewThumbnail: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  previewSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  removeImageBtn: {
    padding: 6,
  },
  // Sugerencias rápidas
  quickBar: {
    paddingVertical: 6,
  },
  quickBarScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  suggestionChipText: {
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceVariant,
    gap: 8,
  },
  attachBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.surfaceLow,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxHeight: 90,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.3,
  },
});