import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MacroChartProps {
    protein: number;
    carbs: number;
    fat: number;
    targetProtein: number;
    targetCarbs: number;
    targetFat: number;
    totalCalories: number;
    targetCalories: number;
}

export default function MacroChart({ protein, carbs, fat, targetProtein, targetCarbs, targetFat, totalCalories, targetCalories }: MacroChartProps) {
    const calPercent = Math.min((totalCalories / targetCalories) * 100, 100);

    const macros = [
        { label: 'Proteína', current: protein, target: targetProtein, color: '#ef4444', unit: 'g' },
        { label: 'Carboidratos', current: carbs, target: targetCarbs, color: '#f59e0b', unit: 'g' },
        { label: 'Gorduras', current: fat, target: targetFat, color: '#3b82f6', unit: 'g' },
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🥗 Macronutrientes</Text>
            <View style={styles.calorieSection}>
                <View style={styles.ringContainer}>
                    <View style={styles.ringOuter}>
                        <View style={[styles.ringProgress, { transform: [{ rotate: `${calPercent * 3.6}deg` }] }]} />
                        <View style={styles.ringInner}>
                            <Text style={styles.ringValue}>{totalCalories}</Text>
                            <Text style={styles.ringLabel}>/ {targetCalories} kcal</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.calorieInfo}>
                    <Text style={styles.caloriePercent}>{calPercent.toFixed(0)}%</Text>
                    <Text style={styles.calorieDesc}>da meta diária</Text>
                    <Text style={styles.calorieRemaining}>{Math.max(targetCalories - totalCalories, 0)} kcal restantes</Text>
                </View>
            </View>
            {macros.map((macro, i) => {
                const pct = Math.min((macro.current / macro.target) * 100, 100);
                return (
                    <View key={i} style={styles.macroRow}>
                        <View style={styles.macroHeader}>
                            <View style={[styles.macroDot, { backgroundColor: macro.color }]} />
                            <Text style={styles.macroLabel}>{macro.label}</Text>
                            <Text style={styles.macroValue}>{macro.current}{macro.unit} / {macro.target}{macro.unit}</Text>
                        </View>
                        <View style={styles.barBg}>
                            <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: macro.color }]} />
                        </View>
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#121212',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: '#27272a'
    },
    title: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16
    },
    calorieSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 20
    },
    ringContainer: { alignItems: 'center' },
    ringOuter: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 6,
        borderColor: '#27272a',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
    },
    ringProgress: {
        position: 'absolute',
        width: 90,
        height: 90
    },
    ringInner: { alignItems: 'center' },
    ringValue: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: 'bold'
    },
    ringLabel: {
        color: '#71717a',
        fontSize: 9
    },
    calorieInfo: { flex: 1 },
    caloriePercent: {
        color: '#22c55e',
        fontSize: 24,
        fontWeight: 'bold'
    },
    calorieDesc: {
        color: '#71717a',
        fontSize: 12
    },
    calorieRemaining: {
        color: '#a1a1aa',
        fontSize: 11,
        marginTop: 4
    },
    macroRow: { marginBottom: 12 },
    macroHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        gap: 6
    },
    macroDot: {
        width: 8,
        height: 8,
        borderRadius: 4
    },
    macroLabel: {
        color: '#e4e4e7',
        fontSize: 13,
        flex: 1
    },
    macroValue: {
        color: '#71717a',
        fontSize: 11
    },
    barBg: {
        height: 6,
        backgroundColor: '#27272a',
        borderRadius: 3,
        overflow: 'hidden'
    },
    barFill: {
        height: '100%',
        borderRadius: 3
    },
});
