// Pantalla de Chat en Tiempo Real (Conectada a Firestore con onSnapshot)
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { doc, getDoc } from 'firebase/firestore';
import { chatService, workerService } from '../../src/data/firestore';
import { ChatMessage, Worker } from '../../src/types';
import { auth, db } from '../../src/config/firebase';
import { getWorkerPhoto } from '../../src/utils/avatarUtils';
import { appNotificationService } from '../../src/services/notificationManager';
import { useThemeStore } from '../../src/utils/themeStore';

const QUICK_ACTIONS = [
  'Hola, ¿tienes disponibilidad hoy?',
  '¿Cuál es la cotización estimada?',
  'Ya estoy en la dirección.',
  '¿Qué materiales se requieren?',
];

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400';

export default function ChatScreen() {
  const isDark = useThemeStore((state) => state.isDark);
  const themeColors = useThemeStore((state) => state.colors);
  const styles = React.useMemo(() => createStyles(themeColors, isDark), [themeColors, isDark]);

  const { id } = useLocalSearchParams<{ id: string }>(); // puede ser chatId o workerId
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [partner, setPartner] = useState<{ name: string; photo: string; workerId?: string } | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!id) return;

    let unsubscribe: (() => void) | undefined;

    const setupChat = async () => {
      try {
        setLoading(true);

        // 1. Intentar resolver el interlocutor:
        // Primero verificamos si `id` corresponde directamente a un documento de la colección 'chats'
        let partnerFound = false;
        try {
          const chatDocSnap = await getDoc(doc(db, 'chats', id));
          if (chatDocSnap.exists()) {
            const chatData = chatDocSnap.data() as any;
            const isMeWorker = currentUser && chatData.workerId === currentUser.uid;

            if (isMeWorker) {
              // Si soy el profesional, mi interlocutor es el cliente
              const clientName = chatData.clientNameSnapshot || 'Cliente GoodJob';
              const clientPhoto = chatData.clientPhotoSnapshot || DEFAULT_AVATAR;
              setPartner({ name: clientName, photo: clientPhoto, workerId: undefined });
            } else {
              // Si soy el cliente, mi interlocutor es el profesional
              const workerName = chatData.workerNameSnapshot || 'Profesional GoodJob';
              const workerPhoto = getWorkerPhoto({
                id: chatData.workerId,
                userPhotoSnapshot: chatData.workerPhotoSnapshot,
                userNameSnapshot: workerName,
              });
              setPartner({ name: workerName, photo: workerPhoto, workerId: chatData.workerId });
            }
            partnerFound = true;
          }
        } catch (chatLookupErr) {
          console.log('Not a direct chat doc or permission issue, checking worker next:', chatLookupErr);
        }

        // Si no era un documento de chat, buscarlo como workerId en 'workers'
        if (!partnerFound) {
          try {
            const workerData = await workerService.getById(id);
            if (workerData) {
              const w = workerData as any;
              const name = `${w.firstName || ''} ${w.lastName || ''}`.trim() || workerData.userNameSnapshot || 'Profesional GoodJob';
              const photo = getWorkerPhoto({ ...w, ...workerData, id: workerData.id || id });
              setPartner({ name, photo, workerId: workerData.id || id });
            } else {
              setPartner({ name: 'Profesional GoodJob', photo: getWorkerPhoto({ id }), workerId: id });
            }
          } catch {
            setPartner({ name: 'Profesional GoodJob', photo: getWorkerPhoto({ id }), workerId: id });
          }
        }

        // 2. Suscribirse a mensajes en tiempo real
        unsubscribe = chatService.subscribeToMessages(id, (liveMessages) => {
          setMessages(liveMessages);
          setLoading(false);
        });
      } catch (err) {
        console.error('Error configurando chat:', err);
        setLoading(false);
      }
    };

    setupChat();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [id]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (typeof customText === 'string' ? customText : inputText).trim();
    if (!textToSend || !id || !currentUser) return;

    if (!customText) {
      setInputText('');
    }
    setSending(true);

    try {
      await chatService.sendMessage(id, {
        chatId: id,
        senderId: currentUser.uid,
        content: textToSend,
        type: 'text',
      });

      // Disparar notificación para el destinatario
      if (partner?.name) {
        // Enviar notificación local/push
        appNotificationService.triggerLocalNotification({
          title: `💬 Mensaje de ${currentUser.displayName || 'GoodJob'}`,
          body: textToSend,
          data: { relatedCollection: 'chats', relatedId: id },
        });
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      if (!customText) {
        setInputText(textToSend);
      }
    } finally {
      setSending(false);
    }
  };

  const renderMessageItem = ({ item }: { item: ChatMessage }) => {
    const isMe = item.senderId === currentUser?.uid;
    const timeFormatted = item.createdAt
      ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';

    return (
      <View
        style={[
          styles.messageBubbleContainer,
          isMe ? styles.myContainer : styles.otherContainer,
        ]}
      >
        <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText]}>
            {item.content}
          </Text>
          {timeFormatted ? (
            <Text style={[styles.timeText, isMe ? styles.myTimeText : styles.otherTimeText]}>
              {timeFormatted}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={themeColors.statusBar} backgroundColor={themeColors.surface} />

      {/* Header del Chat */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Volver"
        >
          <Ionicons name="arrow-back" size={22} color={themeColors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.userInfo}
          activeOpacity={0.7}
          onPress={() => {
            if (partner?.workerId) {
              router.push(`/(workers)/${partner.workerId}`);
            }
          }}
        >
          <Image
            source={{ uri: partner?.photo || DEFAULT_AVATAR }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.userName}>{partner?.name || 'Cargando...'}</Text>
            <View style={styles.statusRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.statusText}>En línea</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={() => {
            Alert.alert(
              'Llamada telefónica',
              `¿Deseas llamar a ${partner?.name || 'este profesional'}?`,
              [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Llamar', onPress: () => {} },
              ]
            );
          }}
        >
          <Ionicons name="call-outline" size={20} color={themeColors.primary} />
        </TouchableOpacity>
      </View>

      {/* Contenido / Lista de Mensajes */}
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {loading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color={themeColors.primary} />
            <Text style={styles.loadingText}>Conectando chat en tiempo real...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessageItem}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubble-ellipses-outline" size={48} color={themeColors.border} />
                <Text style={styles.emptyTitle}>Inicia la conversación</Text>
                <Text style={styles.emptySubtitle}>
                  Escríbele tus dudas, detalles del trabajo o coordina la visita.
                </Text>
              </View>
            }
          />
        )}

        {/* Sugerencias de Mensajes Rápidos */}
        <View style={styles.quickActionsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsContainer}
          >
            {QUICK_ACTIONS.map((action, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.quickActionChip}
                onPress={() => handleSendMessage(action)}
                disabled={sending}
                activeOpacity={0.7}
              >
                <Ionicons name="sparkles-outline" size={13} color={themeColors.primary} style={{ marginRight: 4 }} />
                <Text style={styles.quickActionText}>{action}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Escribe un mensaje..."
            placeholderTextColor={themeColors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
            onPress={() => handleSendMessage()}
            disabled={!inputText.trim() || sending}
            activeOpacity={0.8}
          >
            {sending ? (
              <ActivityIndicator size="small" color={themeColors.onPrimary} />
            ) : (
              <Ionicons name="send" size={18} color={themeColors.onPrimary} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- Estilos de UI adaptados al Tema ---
const createStyles = (COLORS: any, isDark: boolean) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceVariant,
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
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.surfaceVariant,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
  },
  statusText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardContainer: {
    flex: 1,
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  messageBubbleContainer: {
    marginVertical: 4,
    width: '100%',
    flexDirection: 'row',
  },
  myContainer: {
    justifyContent: 'flex-end',
  },
  otherContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  myBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  myMessageText: {
    color: COLORS.onPrimary,
  },
  otherMessageText: {
    color: COLORS.textPrimary,
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myTimeText: {
    color: 'rgba(255, 255, 255, 0.65)',
  },
  otherTimeText: {
    color: COLORS.textSecondary,
  },
  quickActionsWrapper: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceVariant,
    backgroundColor: COLORS.surface,
  },
  quickActionsContainer: {
    paddingHorizontal: 14,
    gap: 8,
  },
  quickActionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLow,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceVariant,
    gap: 10,
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: COLORS.surfaceLow,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});