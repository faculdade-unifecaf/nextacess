import React, { useState, useContext } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    SafeAreaView, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Eye, EyeOff, ScanFace, Mail, Lock, ChevronRight, Fingerprint, ShieldCheck } from 'lucide-react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { GlobalContext } from '../context/GlobalContext';
import { useModal } from '../components/CustomModal';

export default function LoginScreen() {
    const { login, loginWithFace } = useContext(GlobalContext);
    const { showAlert } = useModal();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = () => {
        if (!email.trim() || !password.trim()) {
            showAlert('Erro', 'Preencha todos os campos.');
            return;
        }
        setIsLoading(true);
        setTimeout(() => {
            const success = login(email, password);
            setIsLoading(false);
            if (!success) {
                showAlert('Erro', 'Credenciais inválidas.\n\nTente:\nvitinho@email.com\nadmin@nexus.com\nmaria@email.com\n\n(Qualquer senha funciona)');
            }
        }, 800);
    };

    const handleBiometricLogin = async () => {
        try {

            const compatible = await LocalAuthentication.hasHardwareAsync();
            if (!compatible) {
                showAlert('❌ Indisponível', 'Seu dispositivo não possui hardware de biometria (Face ID / Touch ID / Fingerprint).\n\nUse login com e-mail e senha.');
                return;
            }


            const enrolled = await LocalAuthentication.isEnrolledAsync();
            if (!enrolled) {
                showAlert('⚠️ Sem Biometria Cadastrada', 'Nenhuma biometria encontrada no dispositivo.\n\nVá em Ajustes do celular > Face ID / Touch ID e cadastre sua biometria.');
                return;
            }

            const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
            const hasFace = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
            const hasFingerprint = types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);
            const authName = hasFace ? 'Face ID' : hasFingerprint ? 'Touch ID / Impressão Digital' : 'Biometria';

            setIsLoading(true);


            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: `NEXUS FITNESS — Autenticação ${authName}`,
                cancelLabel: 'Cancelar',
                disableDeviceFallback: false,
                fallbackLabel: 'Usar Senha do Dispositivo',
            });

            setIsLoading(false);

            if (result.success) {

                loginWithFace();
            } else {

                if (result.error === 'user_cancel') {

                    return;
                }
                showAlert('🚫 Autenticação Negada', `A ${authName} não reconheceu sua identidade.\n\nMotivo: ${getErrorMessage(result.error)}\n\nTente novamente ou use login com e-mail.`);
            }
        } catch (error) {
            setIsLoading(false);
            showAlert('Erro', 'Erro ao acessar biometria do dispositivo. Tente login com e-mail.');
        }
    };

    const getErrorMessage = (error: string): string => {
        switch (error) {
            case 'user_cancel': return 'Cancelado pelo usuário';
            case 'user_fallback': return 'Fallback de senha';
            case 'system_cancel': return 'Cancelado pelo sistema';
            case 'not_enrolled': return 'Biometria não cadastrada';
            case 'lockout': return 'Muitas tentativas. Dispositivo bloqueado temporariamente';
            case 'authentication_failed': return 'Rosto / digital não reconhecidos';
            default: return error || 'Erro desconhecido';
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                    <View style={styles.header}>
                        <View style={styles.logoContainer}><Text style={styles.logoIcon}>🏋️</Text></View>
                        <Text style={styles.title}>NEXUS</Text>
                        <Text style={styles.subtitle}>FITNESS</Text>
                        <Text style={styles.tagline}>Transforme seu corpo, eleve sua mente</Text>
                    </View>

                    <View style={styles.formCard}>
                        <Text style={styles.formTitle}>Entrar na sua conta</Text>
                        <View style={styles.inputContainer}>
                            <Mail color="#71717a" size={18} />
                            <TextInput style={styles.input} placeholder="E-mail" placeholderTextColor="#52525b"
                                value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                        </View>
                        <View style={styles.inputContainer}>
                            <Lock color="#71717a" size={18} />
                            <TextInput style={styles.input} placeholder="Senha" placeholderTextColor="#52525b"
                                value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff color="#71717a" size={18} /> : <Eye color="#71717a" size={18} />}
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                            onPress={handleLogin} disabled={isLoading} activeOpacity={0.8}>
                            <Text style={styles.loginButtonText}>{isLoading ? 'Entrando...' : 'Entrar'}</Text>
                            {!isLoading && <ChevronRight color="#fff" size={20} />}
                        </TouchableOpacity>

                        <View style={styles.divider}><View style={styles.dividerLine} /><Text style={styles.dividerText}>ou</Text><View style={styles.dividerLine} /></View>


                        <TouchableOpacity style={styles.biometricButton} onPress={handleBiometricLogin} activeOpacity={0.8} disabled={isLoading}>
                            <View style={styles.biometricIconRow}>
                                <ScanFace color="#ef4444" size={24} />
                                <Fingerprint color="#ef4444" size={24} />
                            </View>
                            <Text style={styles.biometricButtonText}>Login com Face ID / Touch ID</Text>
                            <Text style={styles.biometricHint}>Usa a biometria cadastrada no seu dispositivo</Text>
                        </TouchableOpacity>


                        <View style={styles.securityBadge}>
                            <ShieldCheck color="#22c55e" size={14} />
                            <Text style={styles.securityText}>Autenticação biométrica segura via hardware do dispositivo</Text>
                        </View>
                    </View>

                    <View style={styles.demoSection}>
                        <Text style={styles.demoTitle}>Contas Demo:</Text>
                        <TouchableOpacity onPress={() => { setEmail('vitinho@email.com'); setPassword('123'); }}>
                            <Text style={styles.demoText}>👤 vitinho@email.com (Usuário)</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { setEmail('admin@nexus.com'); setPassword('123'); }}>
                            <Text style={styles.demoText}>🔑 admin@nexus.com (Admin)</Text>
                        </TouchableOpacity>
                        <Text style={styles.demoHint}>Toque para preencher • Qualquer senha</Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000'
    },
    scroll: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24
    },
    header: {
        alignItems: 'center',
        marginBottom: 32
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)'
    },
    logoIcon: { fontSize: 36 },
    title: {
        color: '#ffffff',
        fontSize: 36,
        fontWeight: '900',
        letterSpacing: 6
    },
    subtitle: {
        color: '#ef4444',
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 8,
        marginTop: 2
    },
    tagline: {
        color: '#71717a',
        fontSize: 12,
        marginTop: 8
    },
    formCard: {
        backgroundColor: '#0a0a0a',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: '#27272a'
    },
    formTitle: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center'
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#121212',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#27272a',
        gap: 10
    },
    input: {
        flex: 1,
        color: '#ffffff',
        fontSize: 15
    },
    loginButton: {
        backgroundColor: '#ef4444',
        borderRadius: 14,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 4
    },
    loginButtonDisabled: { opacity: 0.6 },
    loginButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#27272a'
    },
    dividerText: {
        color: '#71717a',
        fontSize: 12,
        marginHorizontal: 12
    },
    biometricButton: {
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        borderRadius: 16,
        paddingVertical: 18,
        gap: 6,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.25)'
    },
    biometricIconRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 2
    },
    biometricButtonText: {
        color: '#ef4444',
        fontSize: 15,
        fontWeight: 'bold'
    },
    biometricHint: {
        color: '#71717a',
        fontSize: 10
    },
    securityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 16,
        opacity: 0.7
    },
    securityText: {
        color: '#22c55e',
        fontSize: 9
    },
    demoSection: {
        marginTop: 24,
        alignItems: 'center'
    },
    demoTitle: {
        color: '#52525b',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 6
    },
    demoText: {
        color: '#71717a',
        fontSize: 12,
        marginBottom: 4,
        textDecorationLine: 'underline'
    },
    demoHint: {
        color: '#3f3f46',
        fontSize: 10,
        marginTop: 4
    },
});
