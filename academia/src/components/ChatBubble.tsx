import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AIMessage } from '../types/types';

interface ChatBubbleProps {
    message: AIMessage;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
    const isAI = message.role === 'ai';

    return (
        <View style={[styles.row, isAI ? styles.rowAI : styles.rowUser]}>
            {isAI && (
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>🤖</Text>
                </View>
            )}
            <View style={[styles.bubble, isAI ? styles.bubbleAI : styles.bubbleUser]}>
                <Text style={[styles.text, isAI ? styles.textAI : styles.textUser]}>
                    {message.content}
                </Text>
                <Text style={styles.time}>{message.timestamp}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    rowAI: {
        justifyContent: 'flex-start',
    },
    rowUser: {
        justifyContent: 'flex-end',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#1e1e1e',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
        marginTop: 4,
    },
    avatarText: {
        fontSize: 16,
    },
    bubble: {
        maxWidth: '78%',
        padding: 14,
        borderRadius: 18,
    },
    bubbleAI: {
        backgroundColor: '#1e1e1e',
        borderTopLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#27272a',
    },
    bubbleUser: {
        backgroundColor: '#ef4444',
        borderTopRightRadius: 4,
    },
    text: {
        fontSize: 14,
        lineHeight: 20,
    },
    textAI: {
        color: '#e4e4e7',
    },
    textUser: {
        color: '#ffffff',
    },
    time: {
        color: '#71717a',
        fontSize: 10,
        marginTop: 6,
        textAlign: 'right',
    },
});
