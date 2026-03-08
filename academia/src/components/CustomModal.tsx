import React, { useState, createContext, useContext, useCallback, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Platform } from 'react-native';

interface ModalButton {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
}

interface ModalState {
    visible: boolean;
    title: string;
    message: string;
    buttons: ModalButton[];
    inputMode?: boolean;
    inputValue?: string;
    onInputSubmit?: (value: string) => void;
}

interface ModalContextType {
    showAlert: (title: string, message: string, buttons?: ModalButton[]) => void;
    showInput: (title: string, message: string, defaultValue: string, onSubmit: (value: string) => void) => void;
}

const ModalContext = createContext<ModalContextType>({} as ModalContextType);
export const useModal = () => useContext(ModalContext);

export function ModalProvider({ children }: { children: ReactNode }) {
    const [modal, setModal] = useState<ModalState>({ visible: false, title: '', message: '', buttons: [] });
    const [inputVal, setInputVal] = useState('');

    const close = useCallback(() => setModal(prev => ({ ...prev, visible: false })), []);

    const showAlert = useCallback((title: string, message: string, buttons?: ModalButton[]) => {
        setModal({
            visible: true, title, message,
            buttons: buttons || [{ text: 'OK' }],
        });
    }, []);

    const showInput = useCallback((title: string, message: string, defaultValue: string, onSubmit: (value: string) => void) => {
        setInputVal(defaultValue);
        setModal({
            visible: true, title, message,
            buttons: [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Confirmar', onPress: () => onSubmit(inputVal) },
            ],
            inputMode: true, inputValue: defaultValue, onInputSubmit: onSubmit,
        });
    }, []);

    const handleButton = (btn: ModalButton) => {
        close();
        if (modal.inputMode && modal.onInputSubmit && btn.style !== 'cancel') {
            modal.onInputSubmit(inputVal);
        } else {
            btn.onPress?.();
        }
    };

    return (
        <ModalContext.Provider value={{ showAlert, showInput }}>
            {children}
            <Modal visible={modal.visible} transparent animationType="fade" onRequestClose={close}>
                <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={close}>
                    <TouchableOpacity style={styles.card} activeOpacity={1}>
                        <Text style={styles.title}>{modal.title}</Text>
                        <Text style={styles.message}>{modal.message}</Text>

                        {modal.inputMode && (
                            <TextInput
                                style={styles.input}
                                value={inputVal}
                                onChangeText={setInputVal}
                                keyboardType="numeric"
                                autoFocus
                                placeholderTextColor="#52525b"
                            />
                        )}

                        <View style={styles.buttonRow}>
                            {modal.buttons.map((btn, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={[
                                        styles.button,
                                        btn.style === 'destructive' && styles.buttonDestructive,
                                        btn.style === 'cancel' && styles.buttonCancel,
                                        !btn.style || btn.style === 'default' ? styles.buttonDefault : {},
                                    ]}
                                    onPress={() => handleButton(btn)}
                                >
                                    <Text style={[
                                        styles.buttonText,
                                        btn.style === 'destructive' && styles.buttonTextDestructive,
                                        btn.style === 'cancel' && styles.buttonTextCancel,
                                    ]}>{btn.text}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </ModalContext.Provider>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24
    },
    card: {
        backgroundColor: '#1a1a1a',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 380,
        borderWidth: 1,
        borderColor: '#27272a'
    },
    title: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8
    },
    message: {
        color: '#a1a1aa',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16
    },
    input: {
        backgroundColor: '#121212',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        color: '#ffffff',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#27272a',
        marginBottom: 16,
        textAlign: 'center'
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap'
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        minWidth: 80
    },
    buttonDefault: {
        backgroundColor: '#ef4444'
    },
    buttonCancel: {
        backgroundColor: '#27272a'
    },
    buttonDestructive: {
        backgroundColor: '#7f1d1d'
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold'
    },
    buttonTextDestructive: {
        color: '#fca5a5'
    },
    buttonTextCancel: {
        color: '#a1a1aa'
    },
});
