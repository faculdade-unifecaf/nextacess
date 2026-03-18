import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CalendarDay } from '../types/types';

interface WeekCalendarProps {
    days: CalendarDay[];
}

export default function WeekCalendar({ days }: WeekCalendarProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>📅 Esta Semana</Text>
            <View style={styles.row}>
                {days.map((day, i) => (
                    <View key={i} style={[styles.dayCol, day.isToday && styles.todayCol]}>
                        <Text style={[styles.dayLabel, day.isToday && styles.todayLabel]}>{day.dayOfWeek}</Text>
                        <View style={[
                            styles.dayCircle,
                            day.trained && styles.trainedCircle,
                            day.isToday && styles.todayCircle,
                        ]}>
                            <Text style={[styles.dayNum, day.trained && styles.trainedNum, day.isToday && styles.todayNum]}>
                                {day.dayNumber}
                            </Text>
                        </View>
                        {day.trained && <View style={styles.dot} />}
                    </View>
                ))}
            </View>
            <View style={styles.legend}>
                <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#22c55e' }]} /><Text style={styles.legendText}>Treinou</Text></View>
                <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} /><Text style={styles.legendText}>Hoje</Text></View>
                <Text style={styles.legendStats}>{days.filter(d => d.trained).length}/7 dias</Text>
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
        borderColor: '#27272a'
    },
    title: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    dayCol: {
        alignItems: 'center',
        flex: 1,
        paddingVertical: 8,
        borderRadius: 12
    },
    todayCol: { backgroundColor: 'rgba(239, 68, 68, 0.08)' },
    dayLabel: {
        color: '#71717a',
        fontSize: 11,
        marginBottom: 6,
        fontWeight: '600'
    },
    todayLabel: { color: '#ef4444' },
    dayCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1e1e1e'
    },
    trainedCircle: {
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderWidth: 1,
        borderColor: '#22c55e'
    },
    todayCircle: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        borderWidth: 2,
        borderColor: '#ef4444'
    },
    dayNum: {
        color: '#71717a',
        fontSize: 14,
        fontWeight: 'bold'
    },
    trainedNum: { color: '#22c55e' },
    todayNum: { color: '#ef4444' },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#22c55e',
        marginTop: 4
    },
    legend: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        gap: 16
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4
    },
    legendText: {
        color: '#71717a',
        fontSize: 10
    },
    legendStats: {
        color: '#a1a1aa',
        fontSize: 11,
        fontWeight: '600',
        marginLeft: 'auto'
    },
});
