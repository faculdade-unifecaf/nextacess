import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Dumbbell, Clock, Flame, X, Play, ChevronDown, ChevronUp } from 'lucide-react-native';
import { GlobalContext } from '../context/GlobalContext';
import ExerciseTutorial from '../components/ExerciseTutorial';
import ActiveWorkoutScreen from './ActiveWorkoutScreen';
import { Workout } from '../types/types';

export default function WorkoutsScreen() {
    const { workouts, startWorkout, activeWorkout } = useContext(GlobalContext);
    const [filter, setFilter] = useState('Todos');
    const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
    const [showActive, setShowActive] = useState(false);

    const categories = ['Todos', 'Iniciante', 'Intermediário', 'Avançado'];
    const filtered = filter === 'Todos' ? workouts : workouts.filter(w => w.difficulty === filter);

    const handleStartWorkout = (workout: Workout) => {
        startWorkout(workout.id);
        setSelectedWorkout(null);
        setShowActive(true);
    };

    if (showActive && activeWorkout) {
        return <ActiveWorkoutScreen onFinish={() => setShowActive(false)} />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Dumbbell color="#ef4444" size={28} />
                    <View>
                        <Text style={styles.title}>Treinos</Text>
                        <Text style={styles.subtitle}>{workouts.length} treinos disponíveis</Text>
                    </View>
                </View>


                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
                    {categories.map(c => (
                        <TouchableOpacity key={c} style={[styles.filterBtn, filter === c && styles.filterActive]} onPress={() => setFilter(c)}>
                            <Text style={[styles.filterText, filter === c && styles.filterTextActive]}>{c}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>


                {filtered.map(workout => (
                    <TouchableOpacity key={workout.id} style={styles.card} onPress={() => setSelectedWorkout(workout)} activeOpacity={0.7}>
                        <View style={[styles.cardBar, { backgroundColor: workout.imageColor }]} />
                        <View style={styles.cardBody}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardName}>{workout.name}</Text>
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
                            <Text style={styles.cardDesc}>{workout.description}</Text>
                            <View style={styles.cardMeta}>
                                <View style={styles.metaItem}><Clock color="#71717a" size={12} /><Text style={styles.metaText}>{workout.duration}</Text></View>
                                <View style={styles.metaItem}><Flame color="#71717a" size={12} /><Text style={styles.metaText}>~{workout.caloriesEstimate}kcal</Text></View>
                                <View style={styles.metaItem}><Dumbbell color="#71717a" size={12} /><Text style={styles.metaText}>{workout.exercises.length} exercícios</Text></View>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>


            <Modal visible={!!selectedWorkout} animationType="slide" transparent={false}>
                <SafeAreaView style={styles.modalContainer}>
                    <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
                        {selectedWorkout && (
                            <>
                                <View style={styles.modalHeader}>
                                    <TouchableOpacity onPress={() => setSelectedWorkout(null)}><X color="#71717a" size={24} /></TouchableOpacity>
                                    <Text style={styles.modalTitle}>{selectedWorkout.name}</Text>
                                    <View />
                                </View>

                                <View style={[styles.modalBanner, { backgroundColor: selectedWorkout.imageColor + '15', borderColor: selectedWorkout.imageColor + '30' }]}>
                                    <Text style={[styles.modalFocus, { color: selectedWorkout.imageColor }]}>{selectedWorkout.focus}</Text>
                                    <Text style={styles.modalDesc}>{selectedWorkout.description}</Text>
                                    <View style={styles.modalMeta}>
                                        <Text style={styles.modalMetaText}>⏱️ {selectedWorkout.duration}</Text>
                                        <Text style={styles.modalMetaText}>🔥 {selectedWorkout.caloriesEstimate}kcal</Text>
                                        <Text style={styles.modalMetaText}>📊 {selectedWorkout.difficulty}</Text>
                                    </View>
                                </View>


                                <Text style={styles.sectionTitle}>🔥 Aquecimento</Text>
                                {selectedWorkout.warmup.map((item, i) => (
                                    <View key={i} style={styles.warmupItem}>
                                        <Text style={styles.warmupNum}>{i + 1}</Text>
                                        <Text style={styles.warmupText}>{item}</Text>
                                    </View>
                                ))}


                                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>💪 Exercícios ({selectedWorkout.exercises.length})</Text>
                                {selectedWorkout.exercises.map(ex => (
                                    <ExerciseTutorial key={ex.id} exercise={ex} />
                                ))}


                                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>❄️ Volta à Calma</Text>
                                {selectedWorkout.cooldown.map((item, i) => (
                                    <View key={i} style={styles.warmupItem}>
                                        <Text style={styles.warmupNum}>{i + 1}</Text>
                                        <Text style={styles.warmupText}>{item}</Text>
                                    </View>
                                ))}


                                <TouchableOpacity style={styles.startBtn} onPress={() => handleStartWorkout(selectedWorkout)}>
                                    <Play color="#fff" size={18} fill="#fff" />
                                    <Text style={styles.startBtnText}>INICIAR TREINO</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000'
    },
    scroll: {
        padding: 20,
        paddingBottom: 100
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 20,
        marginBottom: 16
    },
    title: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: 'bold'
    },
    subtitle: {
        color: '#71717a',
        fontSize: 12
    },
    filterRow: { marginBottom: 16 },
    filterBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: '#121212',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#27272a'
    },
    filterActive: {
        backgroundColor: '#ef4444',
        borderColor: '#ef4444'
    },
    filterText: {
        color: '#71717a',
        fontSize: 12,
        fontWeight: '600'
    },
    filterTextActive: { color: '#ffffff' },
    card: {
        flexDirection: 'row',
        backgroundColor: '#121212',
        borderRadius: 18,
        marginBottom: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#27272a'
    },
    cardBar: { width: 5 },
    cardBody: {
        flex: 1,
        padding: 14
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    cardName: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    diffBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6
    },
    diffText: {
        fontSize: 10,
        fontWeight: 'bold'
    },
    cardDesc: {
        color: '#71717a',
        fontSize: 11,
        marginTop: 4
    },
    cardMeta: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4
    },
    metaText: {
        color: '#71717a',
        fontSize: 10
    },

    modalContainer: {
        flex: 1,
        backgroundColor: '#000000'
    },
    modalScroll: {
        padding: 20,
        paddingBottom: 100
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 16
    },
    modalTitle: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: 'bold'
    },
    modalBanner: {
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        marginBottom: 20
    },
    modalFocus: {
        fontSize: 14,
        fontWeight: 'bold'
    },
    modalDesc: {
        color: '#a1a1aa',
        fontSize: 12,
        marginTop: 4,
        lineHeight: 18
    },
    modalMeta: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10
    },
    modalMetaText: {
        color: '#d4d4d8',
        fontSize: 11
    },
    sectionTitle: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10
    },
    warmupItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 6
    },
    warmupNum: {
        color: '#ef4444',
        fontSize: 13,
        fontWeight: 'bold',
        width: 20
    },
    warmupText: {
        color: '#a1a1aa',
        fontSize: 12
    },
    startBtn: {
        flexDirection: 'row',
        backgroundColor: '#ef4444',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 24
    },
    startBtnText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold'
    },
});
