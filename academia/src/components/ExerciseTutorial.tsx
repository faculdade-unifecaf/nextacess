import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { ChevronDown, ChevronUp, AlertTriangle, Lightbulb, Target, Play } from 'lucide-react-native';
import { Exercise } from '../types/types';

interface ExerciseTutorialProps {
    exercise: Exercise;
}

export default function ExerciseTutorial({ exercise }: ExerciseTutorialProps) {
    const [expanded, setExpanded] = useState(false);

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.header} onPress={() => setExpanded(!expanded)} activeOpacity={0.7}>
                <Text style={styles.emoji}>{exercise.gifEmoji}</Text>
                <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{exercise.name}</Text>
                    <Text style={styles.info}>{exercise.sets}x{exercise.reps} • {exercise.weight} • {exercise.muscleGroup}</Text>
                </View>
                <View style={[styles.diffBadge, {
                    backgroundColor: exercise.difficulty === 'Difícil' ? 'rgba(239,68,68,0.15)' :
                        exercise.difficulty === 'Médio' ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.15)'
                }]}>
                    <Text style={[styles.diffText, {
                        color: exercise.difficulty === 'Difícil' ? '#ef4444' :
                            exercise.difficulty === 'Médio' ? '#f59e0b' : '#22c55e'
                    }]}>{exercise.difficulty}</Text>
                </View>
                {expanded ? <ChevronUp color="#71717a" size={20} /> : <ChevronDown color="#71717a" size={20} />}
            </TouchableOpacity>

            {expanded && (
                <View style={styles.tutorial}>
                    <Text style={styles.description}>{exercise.description}</Text>
                    <View style={styles.equipmentRow}>
                        <Text style={styles.equipmentLabel}>🏋️ Equipamento:</Text>
                        <Text style={styles.equipmentValue}>{exercise.equipmentNeeded}</Text>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Target color="#3b82f6" size={16} />
                            <Text style={styles.sectionTitle}>Músculos Alvo</Text>
                        </View>
                        <View style={styles.muscleRow}>
                            {exercise.targetMuscles.map((m, i) => (
                                <View key={i} style={styles.muscleTag}>
                                    <Text style={styles.muscleText}>{m}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📋 Passo a Passo</Text>
                        {exercise.steps.map((step, i) => (
                            <View key={i} style={styles.stepRow}>
                                <View style={styles.stepNum}><Text style={styles.stepNumText}>{i + 1}</Text></View>
                                <Text style={styles.stepText}>{step}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Lightbulb color="#f59e0b" size={16} />
                            <Text style={styles.sectionTitle}>Dicas</Text>
                        </View>
                        {exercise.tips.map((tip, i) => (
                            <Text key={i} style={styles.tipText}>💡 {tip}</Text>
                        ))}
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <AlertTriangle color="#ef4444" size={16} />
                            <Text style={styles.sectionTitle}>Erros Comuns</Text>
                        </View>
                        {exercise.commonMistakes.map((mistake, i) => (
                            <Text key={i} style={styles.mistakeText}>⚠️ {mistake}</Text>
                        ))}
                    </View>

                    {exercise.restSeconds && (
                        <View style={styles.restRow}>
                            <Text style={styles.restLabel}>⏱️ Descanso recomendado:</Text>
                            <Text style={styles.restValue}>{exercise.restSeconds}s</Text>
                        </View>
                    )}

                    {exercise.videoUrl && (
                        <TouchableOpacity
                            style={styles.videoButton}
                            onPress={() => Linking.openURL(exercise.videoUrl!)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.videoIconContainer}>
                                <Play color="#ffffff" size={18} fill="#ffffff" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.videoButtonText}>🎬 Assistir Vídeo Tutorial</Text>
                                <Text style={styles.videoButtonHint}>Abre o vídeo no YouTube com demonstração completa</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#121212',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#27272a',
        marginBottom: 8,
        overflow: 'hidden'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 10
    },
    emoji: { fontSize: 24 },
    name: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold'
    },
    info: {
        color: '#71717a',
        fontSize: 11,
        marginTop: 2
    },
    diffBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        marginRight: 4
    },
    diffText: {
        fontSize: 9,
        fontWeight: 'bold'
    },
    tutorial: {
        padding: 16,
        paddingTop: 0,
        borderTopWidth: 1,
        borderTopColor: '#1e1e1e'
    },
    description: {
        color: '#a1a1aa',
        fontSize: 13,
        lineHeight: 19,
        marginBottom: 12,
        marginTop: 12
    },
    equipmentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
        backgroundColor: '#1a1a1a',
        padding: 10,
        borderRadius: 10
    },
    equipmentLabel: {
        color: '#71717a',
        fontSize: 11
    },
    equipmentValue: {
        color: '#e4e4e7',
        fontSize: 12,
        fontWeight: '600'
    },
    section: { marginBottom: 14 },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8
    },
    sectionTitle: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: 'bold'
    },
    muscleRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6
    },
    muscleTag: {
        backgroundColor: 'rgba(59,130,246,0.15)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8
    },
    muscleText: {
        color: '#3b82f6',
        fontSize: 11,
        fontWeight: '600'
    },
    stepRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: 6
    },
    stepNum: {
        width: 22,
        height: 22,
        borderRadius: 7,
        backgroundColor: '#ef4444',
        alignItems: 'center',
        justifyContent: 'center'
    },
    stepNumText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold'
    },
    stepText: {
        color: '#d4d4d8',
        fontSize: 12,
        flex: 1,
        lineHeight: 18
    },
    tipText: {
        color: '#f59e0b',
        fontSize: 12,
        marginBottom: 4,
        lineHeight: 18
    },
    mistakeText: {
        color: '#ef4444',
        fontSize: 12,
        marginBottom: 4,
        lineHeight: 18,
        opacity: 0.9
    },
    restRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#1a1a1a',
        padding: 10,
        borderRadius: 10
    },
    restLabel: {
        color: '#71717a',
        fontSize: 11
    },
    restValue: {
        color: '#3b82f6',
        fontSize: 13,
        fontWeight: 'bold'
    },
    videoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 14,
        padding: 14,
        marginTop: 14,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.25)',
    },
    videoIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#ef4444',
        alignItems: 'center',
        justifyContent: 'center',
    },
    videoButtonText: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: 'bold',
    },
    videoButtonHint: {
        color: '#71717a',
        fontSize: 10,
        marginTop: 2,
    },
});
