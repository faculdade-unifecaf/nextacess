import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { ChevronLeft, ChevronRight, Check, X, Clock, Flame, Trophy, Pause, Play } from 'lucide-react-native';
import { GlobalContext } from '../context/GlobalContext';
import { useModal } from '../components/CustomModal';
import ExerciseTutorial from '../components/ExerciseTutorial';

export default function ActiveWorkoutScreen({ onFinish }: { onFinish: () => void }) {
    const { activeWorkout, workouts, completeSet, nextExercise, previousExercise, finishActiveWorkout } = useContext(GlobalContext);
    const { showAlert } = useModal();
    const [elapsed, setElapsed] = useState(0);
    const [restTimer, setRestTimer] = useState(0);
    const [isResting, setIsResting] = useState(false);

    const workout = workouts.find(w => w.id === activeWorkout?.workoutId);

    useEffect(() => {
        const interval = setInterval(() => {
            if (activeWorkout) setElapsed(Math.floor((Date.now() - activeWorkout.startTime) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [activeWorkout]);

    useEffect(() => {
        if (!isResting || restTimer <= 0) return;
        const interval = setInterval(() => {
            setRestTimer(prev => { if (prev <= 1) { setIsResting(false); return 0; } return prev - 1; });
        }, 1000);
        return () => clearInterval(interval);
    }, [isResting, restTimer]);

    if (!activeWorkout || !workout) return null;
    const currentExercise = workout.exercises[activeWorkout.currentExerciseIndex];
    const sets = activeWorkout.completedSets[currentExercise.id] || [];
    const completedTotal = Object.values(activeWorkout.completedSets).flat().filter(Boolean).length;
    const totalSets = Object.values(activeWorkout.completedSets).flat().length;
    const progress = totalSets > 0 ? (completedTotal / totalSets) * 100 : 0;

    const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    const handleCompleteSet = (setIdx: number) => {
        completeSet(currentExercise.id, setIdx);
        if (currentExercise.restSeconds) { setRestTimer(currentExercise.restSeconds); setIsResting(true); }
    };

    const handleFinish = () => {
        showAlert('Finalizar Treino', `Completou ${completedTotal}/${totalSets} séries. Deseja finalizar?`, [
            { text: 'Continuar', style: 'cancel' },
            { text: 'Finalizar', onPress: () => { finishActiveWorkout(); onFinish(); } },
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topBar}>
                <TouchableOpacity onPress={handleFinish}><X color="#71717a" size={24} /></TouchableOpacity>
                <View style={styles.timerGroup}>
                    <Clock color="#3b82f6" size={16} />
                    <Text style={styles.timerText}>{formatTime(elapsed)}</Text>
                </View>
                <TouchableOpacity style={styles.finishBtn} onPress={handleFinish}>
                    <Text style={styles.finishText}>Finalizar</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.progressSection}>
                <Text style={styles.workoutName}>{workout.name}</Text>
                <View style={styles.progressBarBg}><View style={[styles.progressBarFill, { width: `${progress}%` }]} /></View>
                <Text style={styles.progressText}>{completedTotal}/{totalSets} séries • {progress.toFixed(0)}%</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {isResting && (
                    <View style={styles.restCard}>
                        <Text style={styles.restEmoji}>⏱️</Text>
                        <Text style={styles.restTitle}>Descansando...</Text>
                        <Text style={styles.restTime}>{formatTime(restTimer)}</Text>
                        <TouchableOpacity style={styles.skipBtn} onPress={() => { setIsResting(false); setRestTimer(0); }}>
                            <Text style={styles.skipText}>Pular Descanso</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.navRow}>
                    <TouchableOpacity style={styles.navBtn} onPress={previousExercise} disabled={activeWorkout.currentExerciseIndex === 0}>
                        <ChevronLeft color={activeWorkout.currentExerciseIndex === 0 ? '#27272a' : '#ffffff'} size={20} />
                    </TouchableOpacity>
                    <Text style={styles.navText}>
                        Exercício {activeWorkout.currentExerciseIndex + 1} de {workout.exercises.length}
                    </Text>
                    <TouchableOpacity style={styles.navBtn} onPress={nextExercise} disabled={activeWorkout.currentExerciseIndex === workout.exercises.length - 1}>
                        <ChevronRight color={activeWorkout.currentExerciseIndex === workout.exercises.length - 1 ? '#27272a' : '#ffffff'} size={20} />
                    </TouchableOpacity>
                </View>

                <View style={styles.exerciseCard}>
                    <Text style={styles.exerciseEmoji}>{currentExercise.gifEmoji}</Text>
                    <Text style={styles.exerciseName}>{currentExercise.name}</Text>
                    <Text style={styles.exerciseDetail}>{currentExercise.sets}x{currentExercise.reps} • {currentExercise.weight}</Text>
                    <View style={styles.muscleRow}>
                        {currentExercise.targetMuscles.map((m, i) => (
                            <View key={i} style={styles.muscleTag}><Text style={styles.muscleText}>{m}</Text></View>
                        ))}
                    </View>
                </View>

                <Text style={styles.setsTitle}>Séries</Text>
                <View style={styles.setsGrid}>
                    {sets.map((done, idx) => (
                        <TouchableOpacity
                            key={idx}
                            style={[styles.setBtn, done && styles.setBtnDone]}
                            onPress={() => !done && handleCompleteSet(idx)}
                            disabled={done}
                        >
                            {done ? <Check color="#ffffff" size={18} /> : <Text style={styles.setBtnText}>{idx + 1}</Text>}
                            <Text style={[styles.setLabel, done && styles.setLabelDone]}>
                                {done ? 'Feita' : `${currentExercise.reps}`}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={[styles.setsTitle, { marginTop: 20 }]}>📖 Tutorial</Text>
                <ExerciseTutorial exercise={currentExercise} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000000' },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a'
    },
    timerGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6
    },
    timerText: {
        color: '#3b82f6',
        fontSize: 18,
        fontWeight: 'bold',
        fontVariant: ['tabular-nums']
    },
    finishBtn: {
        backgroundColor: '#ef4444',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 8
    },
    finishText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold'
    },
    progressSection: {
        paddingHorizontal: 20,
        paddingVertical: 12
    },
    workoutName: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8
    },
    progressBarBg: {
        height: 8,
        backgroundColor: '#27272a',
        borderRadius: 4,
        overflow: 'hidden'
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#22c55e',
        borderRadius: 4
    },
    progressText: {
        color: '#71717a',
        fontSize: 11,
        marginTop: 4
    },
    scroll: {
        padding: 20,
        paddingBottom: 100
    },
    restCard: {
        backgroundColor: 'rgba(59,130,246,0.1)',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(59,130,246,0.3)',
        marginBottom: 16
    },
    restEmoji: { fontSize: 36 },
    restTitle: {
        color: '#3b82f6',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 8
    },
    restTime: {
        color: '#ffffff',
        fontSize: 48,
        fontWeight: 'bold',
        fontVariant: ['tabular-nums']
    },
    skipBtn: {
        marginTop: 12,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#1e1e1e'
    },
    skipText: {
        color: '#a1a1aa',
        fontSize: 12
    },
    navRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
    },
    navBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#1e1e1e',
        alignItems: 'center',
        justifyContent: 'center'
    },
    navText: {
        color: '#a1a1aa',
        fontSize: 13,
        fontWeight: '600'
    },
    exerciseCard: {
        backgroundColor: '#121212',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#27272a',
        marginBottom: 16
    },
    exerciseEmoji: {
        fontSize: 40,
        marginBottom: 8
    },
    exerciseName: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: 'bold'
    },
    exerciseDetail: {
        color: '#a1a1aa',
        fontSize: 14,
        marginTop: 4
    },
    muscleRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 10
    },
    muscleTag: {
        backgroundColor: 'rgba(59,130,246,0.15)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8
    },
    muscleText: {
        color: '#3b82f6',
        fontSize: 10,
        fontWeight: '600'
    },
    setsTitle: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10
    },
    setsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10
    },
    setBtn: {
        width: 72,
        height: 72,
        borderRadius: 16,
        backgroundColor: '#121212',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#27272a'
    },
    setBtnDone: {
        backgroundColor: 'rgba(34,197,94,0.2)',
        borderColor: '#22c55e'
    },
    setBtnText: {
        color: '#ffffff',
        fontSize: 22,
        fontWeight: 'bold'
    },
    setLabel: {
        color: '#71717a',
        fontSize: 10,
        marginTop: 2
    },
    setLabelDone: {
        color: '#22c55e'
    },
});
