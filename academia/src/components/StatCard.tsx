import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatCardProps {
    icon: React.ReactNode;
    value: string;
    label: string;
    color?: string;
}

export default function StatCard({ icon, value, label, color = '#ef4444' }: StatCardProps) {
    return (
        <View style={[styles.card, { borderColor: `${color}22` }]}>
            <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
                {icon}
            </View>
            <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
            <Text style={styles.label} numberOfLines={1}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        minWidth: 70,
        backgroundColor: '#121212',
        padding: 12,
        borderRadius: 18,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#27272a',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },
    value: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    label: {
        color: '#71717a',
        fontSize: 10,
        marginTop: 2,
        textAlign: 'center',
    },
});
