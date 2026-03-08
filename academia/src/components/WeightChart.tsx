import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WeightEntry } from '../types/types';

interface WeightChartProps {
    data: WeightEntry[];
}

export default function WeightChart({ data }: WeightChartProps) {
    if (data.length === 0) return null;

    const weights = data.map(d => d.weight);
    const maxW = Math.max(...weights);
    const minW = Math.min(...weights);
    const range = maxW - minW || 1;
    const chartHeight = 100;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>📊 Evolução do Peso</Text>
            <View style={styles.chartArea}>
                <View style={styles.yAxis}>
                    <Text style={styles.yLabel}>{maxW.toFixed(1)}</Text>
                    <Text style={styles.yLabel}>{((maxW + minW) / 2).toFixed(1)}</Text>
                    <Text style={styles.yLabel}>{minW.toFixed(1)}</Text>
                </View>
                <View style={styles.chart}>
                    <View style={styles.barsContainer}>
                        {data.map((entry, index) => {
                            const height = ((entry.weight - minW) / range) * chartHeight;
                            const isLast = index === data.length - 1;
                            return (
                                <View key={index} style={styles.barColumn}>
                                    <View style={styles.barWrapper}>
                                        <View
                                            style={[
                                                styles.bar,
                                                {
                                                    height: Math.max(height, 8),
                                                    backgroundColor: isLast ? '#ef4444' : '#3b82f6',
                                                    opacity: isLast ? 1 : 0.6,
                                                },
                                            ]}
                                        >
                                            <Text style={styles.barValue}>{entry.weight}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.xLabel}>{entry.date}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>
            </View>
            <View style={styles.bottomRow}>
                <View style={styles.legendDot}>
                    <View style={[styles.dot, { backgroundColor: '#3b82f6' }]} />
                    <Text style={styles.legendText}>Anterior</Text>
                </View>
                <View style={styles.legendDot}>
                    <View style={[styles.dot, { backgroundColor: '#ef4444' }]} />
                    <Text style={styles.legendText}>Atual</Text>
                </View>
                <Text style={styles.changeText}>
                    {weights[weights.length - 1] < weights[0] ? '↓' : '↑'}{' '}
                    {Math.abs(weights[weights.length - 1] - weights[0]).toFixed(1)}kg
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#121212',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: '#27272a',
    },
    title: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    chartArea: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    yAxis: {
        justifyContent: 'space-between',
        height: 120,
        marginRight: 8,
    },
    yLabel: {
        color: '#71717a',
        fontSize: 9,
    },
    chart: {
        flex: 1,
    },
    barsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 120,
    },
    barColumn: {
        alignItems: 'center',
        flex: 1,
    },
    barWrapper: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    bar: {
        width: 22,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: 2,
        alignSelf: 'center',
    },
    barValue: {
        color: '#ffffff',
        fontSize: 7,
        fontWeight: 'bold',
    },
    xLabel: {
        color: '#71717a',
        fontSize: 9,
        marginTop: 6,
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        gap: 16,
    },
    legendDot: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        color: '#71717a',
        fontSize: 10,
    },
    changeText: {
        color: '#22c55e',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 'auto',
    },
});
