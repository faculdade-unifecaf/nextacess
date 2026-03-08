import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface IoTCardProps {
    icon: string;
    label: string;
    value: string;
    unit: string;
    status?: 'normal' | 'warning' | 'good';
    lastSync?: string;
}

export default function IoTCard({ icon, label, value, unit, status = 'normal', lastSync }: IoTCardProps) {
    const statusColor = status === 'good' ? '#22c55e' : status === 'warning' ? '#f59e0b' : '#3b82f6';

    return (
        <View style={styles.card}>
            <View style={styles.headerRow}>
                <View style={[styles.iconContainer, { backgroundColor: `${statusColor}15` }]}>
                    <Text style={styles.iconText}>{icon}</Text>
                </View>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            </View>
            <Text style={styles.title}>{label}</Text>
            <View style={styles.valueRow}>
                <Text style={[styles.value, { color: statusColor }]}>{value}</Text>
                <Text style={styles.unit}>{unit}</Text>
            </View>
            {lastSync && (
                <Text style={styles.sync}>🔄 {lastSync}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 140,
        backgroundColor: '#121212',
        padding: 14,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#27272a',
        marginRight: 10,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },
    iconText: { fontSize: 18 },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4
    },
    title: {
        color: '#71717a',
        fontSize: 11,
        marginBottom: 4
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4
    },
    value: {
        fontSize: 22,
        fontWeight: 'bold'
    },
    unit: {
        color: '#71717a',
        fontSize: 12
    },
    sync: {
        color: '#52525b',
        fontSize: 9,
        marginTop: 6
    },
});
