import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, Flame, ChevronRight } from 'lucide-react-native';
import { Workout } from '../types/types';

interface WorkoutCardProps {
    workout: Workout;
    onPress: () => void;
}

export default function WorkoutCard({ workout, onPress }: WorkoutCardProps) {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.colorBar, { backgroundColor: workout.imageColor }]} />
            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.name}>{workout.name}</Text>
                        <Text style={styles.focus}>{workout.focus}</Text>
                    </View>
                    <View style={[styles.diffBadge, {
                        backgroundColor: workout.difficulty === 'Avançado' ? 'rgba(239,68,68,0.15)' :
                            workout.difficulty === 'Intermediário' ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.15)'
                    }]}>
                        <Text style={[styles.diffText, {
                            color: workout.difficulty === 'Avançado' ? '#ef4444' :
                                workout.difficulty === 'Intermediário' ? '#f59e0b' : '#22c55e'
                        }]}>{workout.difficulty}</Text>
                    </View>
                </View>
                <View style={styles.footer}>
                    <View style={styles.footerItem}>
                        <Clock color="#71717a" size={14} />
                        <Text style={styles.footerText}>{workout.duration}</Text>
                    </View>
                    <View style={styles.footerItem}>
                        <Flame color="#71717a" size={14} />
                        <Text style={styles.footerText}>{workout.caloriesEstimate} kcal</Text>
                    </View>
                    <Text style={styles.exerciseCount}>{workout.exercises.length} exercícios</Text>
                    <ChevronRight color="#71717a" size={18} />
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#121212',
        borderRadius: 20,
        flexDirection: 'row',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#27272a',
        marginBottom: 12,
    },
    colorBar: {
        width: 5,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    name: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    focus: {
        color: '#71717a',
        fontSize: 12,
        marginTop: 2,
    },
    diffBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    diffText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    footerText: {
        color: '#71717a',
        fontSize: 12,
    },
    exerciseCount: {
        color: '#71717a',
        fontSize: 12,
        flex: 1,
        textAlign: 'right',
    },
});
