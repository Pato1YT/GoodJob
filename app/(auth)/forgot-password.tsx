import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/utils/useAuth';
import {
    CustomButton,
    CustomInput,
    LinkButton,
    ErrorMessage,
    SuccessMessage,
    colors,
    spacing,
} from '../../src/components/common';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const { resetPassword } = useAuth();

    const handleResetPassword = async () => {
        try{
            setError('');
            setSuccess('');
            setLoading(true);

            if(!email.trim()){
                setError('Por favor ingresa tu email');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if(!emailRegex.test(email)){
                setError('Por favor ingresa un email valido');
                return;
            }

            await resetPassword(email);

            setSuccess('Email de recuperacion enviado. Revisa tu bandeja');

            setTimeout(() => {
                router.push('/login');
            },5000);

        }catch(err: any){
            setError(err.message || 'Error al enviar el email');
        }finally{
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Recuperar Contraseña</Text>
                    <Text style={styles.subtitle}>
                        Ingresa tu email y te enviaremos un enlace para resetear tu contraseña
                    </Text>
                </View>

            {/* Mostrar mensajes de error */}
            <ErrorMessage message={error} onDismiss={() => setError('')} />
        
            {/* Mostrar mensaje de éxito */}
            <SuccessMessage message={success} />

            <View style={styles.form}>
                {/* Input de email */}
                <CustomInput
                    placeholder="Correo electrónico"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    icon="email"
                    editable={!loading}
            />
            </View>

            {/* Botón principal */}
            <CustomButton
                title={loading ? 'Enviando...' : 'Enviar Email'}
                onPress={handleResetPassword}
                loading={loading}
                disabled={loading || !email}
                size="large"
                icon="mail"
            />

            {/* Volver a Login */}
            <View style={styles.footer}>
                <LinkButton 
                    text="Volver al Login" 
                    onPress={() => router.push('/login')}
                />
            </View>
      </ScrollView>
    </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.secondary,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textLight,
        textAlign: 'center',
    },
    form: {
        marginVertical: spacing.lg,
    },
    footer: {
        alignItems: 'center',
        marginTop: spacing.lg,
    },
});
