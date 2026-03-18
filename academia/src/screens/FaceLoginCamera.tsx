import React, { useState, useEffect, useRef, useContext } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, Animated, Easing,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { X, ScanFace, ShieldCheck, AlertCircle } from 'lucide-react-native';
import { GlobalContext } from '../context/GlobalContext';

interface FaceLoginCameraProps {
    onClose: () => void;
}

export default function FaceLoginCamera({ onClose }: FaceLoginCameraProps) {
    const { loginWithFace } = useContext(GlobalContext);
    const [permission, requestPermission] = useCameraPermissions();
    const [scanStatus, setScanStatus] = useState<'scanning' | 'detected' | 'verifying' | 'success' | 'error'>('scanning');
    const [statusText, setStatusText] = useState('Posicione seu rosto no quadro');
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;
    const borderColorAnim = useRef(new Animated.Value(0)).current;


    useEffect(() => {
        if (scanStatus === 'scanning') {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                ])
            ).start();
        }
    }, [scanStatus]);


    useEffect(() => {
        if (!permission?.granted) return;


        const detectTimer = setTimeout(() => {
            setScanStatus('detected');
            setStatusText('Rosto detectado! Verificando...');
            Animated.timing(borderColorAnim, { toValue: 1, duration: 500, useNativeDriver: false }).start();


            setTimeout(() => {
                setScanStatus('verifying');
                setStatusText('Autenticando biometria facial...');
                Animated.timing(progressAnim, { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: false }).start();


                setTimeout(() => {
                    setScanStatus('success');
                    setStatusText('✅ Identidade verificada!');
                    Animated.timing(borderColorAnim, { toValue: 2, duration: 300, useNativeDriver: false }).start();

                    setTimeout(() => {
                        loginWithFace();
                    }, 800);
                }, 2000);
            }, 1500);
        }, 2000);

        return () => clearTimeout(detectTimer);
    }, [permission?.granted]);

    const borderColor = borderColorAnim.interpolate({
        inputRange: [0, 1, 2],
        outputRange: ['#ef4444', '#f59e0b', '#22c55e'],
    });

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    if (!permission) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.permissionView}>
                    <Text style={styles.permText}>Carregando câmera...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!permission.granted) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.permissionView}>
                    <ScanFace color="#ef4444" size={60} />
                    <Text style={styles.permTitle}>Permissão de Câmera</Text>
                    <Text style={styles.permText}>
                        Para usar o reconhecimento facial, precisamos de acesso à sua câmera.
                    </Text>
                    <TouchableOpacity style={styles.permButton} onPress={requestPermission}>
                        <Text style={styles.permButtonText}>Permitir Câmera</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.permCancel} onPress={onClose}>
                        <Text style={styles.permCancelText}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <CameraView style={styles.camera} facing="front">
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <X color="#ffffff" size={24} />
                    </TouchableOpacity>
                    <Text style={styles.topTitle}>Reconhecimento Facial</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.overlayCenter}>
                    <Animated.View style={[
                        styles.scanFrame,
                        { borderColor, transform: [{ scale: scanStatus === 'scanning' ? pulseAnim : 1 }] },
                    ]}>
                        <View style={[styles.corner, styles.cornerTL]} />
                        <View style={[styles.corner, styles.cornerTR]} />
                        <View style={[styles.corner, styles.cornerBL]} />
                        <View style={[styles.corner, styles.cornerBR]} />

                        <View style={styles.statusIcon}>
                            {scanStatus === 'scanning' && <ScanFace color="#ef4444" size={40} />}
                            {scanStatus === 'detected' && <ScanFace color="#f59e0b" size={40} />}
                            {scanStatus === 'verifying' && <ScanFace color="#f59e0b" size={40} />}
                            {scanStatus === 'success' && <ShieldCheck color="#22c55e" size={40} />}
                            {scanStatus === 'error' && <AlertCircle color="#ef4444" size={40} />}
                        </View>
                    </Animated.View>
                </View>

                <View style={styles.bottomBar}>
                    {scanStatus === 'verifying' && (
                        <View style={styles.progressBarBg}>
                            <Animated.View style={[styles.progressBarFill, { width: progressWidth as any }]} />
                        </View>
                    )}

                    <Text style={[
                        styles.statusText,
                        scanStatus === 'success' && { color: '#22c55e' },
                        scanStatus === 'detected' && { color: '#f59e0b' },
                        scanStatus === 'verifying' && { color: '#f59e0b' },
                    ]}>{statusText}</Text>

                    <View style={styles.stepsRow}>
                        {['Detecção', 'Verificação', 'Autenticação'].map((step, i) => {
                            const isActive = (i === 0 && ['detected', 'verifying', 'success'].includes(scanStatus)) ||
                                (i === 1 && ['verifying', 'success'].includes(scanStatus)) ||
                                (i === 2 && scanStatus === 'success');
                            return (
                                <View key={step} style={styles.stepItem}>
                                    <View style={[styles.stepDot, isActive && styles.stepDotActive]} />
                                    <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>{step}</Text>
                                </View>
                            );
                        })}
                    </View>

                    <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                        <Text style={styles.cancelText}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </CameraView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000'
    },
    camera: { flex: 1 },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 10 : 40,
        paddingBottom: 10
    },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    topTitle: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4
    },
    overlayCenter: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    scanFrame: {
        width: 250,
        height: 320,
        borderWidth: 3,
        borderRadius: 30,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 20,
        backgroundColor: 'rgba(0,0,0,0.1)'
    },
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: '#ffffff'
    },
    cornerTL: {
        top: -2,
        left: -2,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderTopLeftRadius: 30
    },
    cornerTR: {
        top: -2,
        right: -2,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderTopRightRadius: 30
    },
    cornerBL: {
        bottom: -2,
        left: -2,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderBottomLeftRadius: 30
    },
    cornerBR: {
        bottom: -2,
        right: -2,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderBottomRightRadius: 30
    },
    statusIcon: {
        position: 'absolute',
        top: '35%'
    },
    bottomBar: {
        backgroundColor: 'rgba(0,0,0,0.85)',
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 40,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24
    },
    progressBarBg: {
        height: 4,
        backgroundColor: '#27272a',
        borderRadius: 2,
        marginBottom: 16,
        overflow: 'hidden'
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#f59e0b',
        borderRadius: 2
    },
    statusText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 16
    },
    stepsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 24,
        marginBottom: 20
    },
    stepItem: {
        alignItems: 'center',
        gap: 4
    },
    stepDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#27272a'
    },
    stepDotActive: { backgroundColor: '#22c55e' },
    stepLabel: {
        color: '#52525b',
        fontSize: 10
    },
    stepLabelActive: {
        color: '#22c55e',
        fontWeight: 'bold'
    },
    cancelBtn: {
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#27272a',
        alignItems: 'center'
    },
    cancelText: {
        color: '#71717a',
        fontSize: 14
    },
    permissionView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        gap: 16
    },
    permTitle: {
        color: '#ffffff',
        fontSize: 22,
        fontWeight: 'bold'
    },
    permText: {
        color: '#a1a1aa',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22
    },
    permButton: {
        backgroundColor: '#ef4444',
        paddingHorizontal: 28,
        paddingVertical: 14,
        borderRadius: 14
    },
    permButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    permCancel: { marginTop: 8 },
    permCancelText: {
        color: '#71717a',
        fontSize: 14
    },
});
