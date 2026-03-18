import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Flame, Droplets, TrendingDown, Trophy, Zap, Coins, Target, Award } from 'lucide-react-native';
import { GlobalContext } from '../context/GlobalContext';
import StatCard from '../components/StatCard';
import IoTCard from '../components/IoTCard';
import WeightChart from '../components/WeightChart';
import WeekCalendar from '../components/WeekCalendar';

export default function HomeScreen() {
    const { stats, iotData, weightHistory, addWater, weekCalendar, challenges, calculateBMI, workouts } = useContext(GlobalContext);
    const bmi = calculateBMI();
    const todayWorkout = workouts[0];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Olá, {stats.name.split(' ')[0]}! 👋</Text>
                        <Text style={styles.subGreeting}>Vamos treinar hoje?</Text>
                    </View>
                    <View style={styles.levelBadge}>
                        <Text style={styles.levelText}>🏆 {stats.level}</Text>
                    </View>
                </View>


                <View style={styles.xpSection}>
                    <View style={styles.xpRow}>
                        <Zap color="#f59e0b" size={14} />
                        <Text style={styles.xpText}>{stats.xp.toLocaleString()} / {stats.xpNext.toLocaleString()} XP</Text>
                        <View style={styles.coinBadge}><Coins color="#f59e0b" size={12} /><Text style={styles.coinText}>{stats.nexusCoins}</Text></View>
                    </View>
                    <View style={styles.xpBarBg}><View style={[styles.xpBarFill, { width: `${(stats.xp / stats.xpNext) * 100}%` }]} /></View>
                </View>


                <View style={styles.statsGrid}>
                    <StatCard icon={<Flame color="#ef4444" size={20} />} value={`${stats.caloriesBurned}`} label="kcal" color="#ef4444" />
                    <TouchableOpacity onPress={addWater} activeOpacity={0.7}>
                        <StatCard icon={<Droplets color="#3b82f6" size={20} />} value={`${stats.waterIntake.toFixed(2)}L`} label={`/ ${stats.waterGoal}L`} color="#3b82f6" />
                    </TouchableOpacity>
                    <StatCard icon={<TrendingDown color="#22c55e" size={20} />} value={`${stats.weight}kg`} label="Peso" color="#22c55e" />
                    <StatCard icon={<Trophy color="#f59e0b" size={20} />} value={`${stats.streak}`} label="Streak 🔥" color="#f59e0b" />
                </View>


                <View style={styles.bmiCard}>
                    <View style={styles.bmiLeft}>
                        <Text style={styles.bmiTitle}>📊 IMC</Text>
                        <Text style={[styles.bmiValue, { color: bmi.color }]}>{bmi.value}</Text>
                        <Text style={[styles.bmiClass, { color: bmi.color }]}>{bmi.classification}</Text>
                    </View>
                    <View style={styles.bmiBar}>
                        <View style={styles.bmiRanges}>
                            <View style={[styles.bmiRange, { backgroundColor: '#3b82f6', flex: 1 }]} />
                            <View style={[styles.bmiRange, { backgroundColor: '#22c55e', flex: 1.5 }]} />
                            <View style={[styles.bmiRange, { backgroundColor: '#f59e0b', flex: 1 }]} />
                            <View style={[styles.bmiRange, { backgroundColor: '#ef4444', flex: 1 }]} />
                        </View>
                        <Text style={styles.bmiLabels}>18.5   25    30</Text>
                    </View>
                </View>


                <WeekCalendar days={weekCalendar} />


                <Text style={styles.sectionTitle}>🏅 Desafios Ativos</Text>
                {challenges.map(ch => {
                    const pct = Math.min((ch.progress / ch.target) * 100, 100);
                    return (
                        <View key={ch.id} style={styles.challengeCard}>
                            <Text style={styles.challengeIcon}>{ch.icon}</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.challengeName}>{ch.title}</Text>
                                <Text style={styles.challengeDesc}>{ch.description}</Text>
                                <View style={styles.challengeBarBg}><View style={[styles.challengeBarFill, { width: `${pct}%` }]} /></View>
                                <View style={styles.challengeFooter}>
                                    <Text style={styles.challengeProgress}>{ch.progress}/{ch.target} {ch.unit}</Text>
                                    <Text style={styles.challengeDeadline}>até {ch.deadline}</Text>
                                </View>
                            </View>
                            <View style={styles.challengeReward}>
                                <Text style={styles.rewardText}>+{ch.xpReward}XP</Text>
                                <Text style={styles.rewardCoins}>🪙 {ch.coinReward}</Text>
                            </View>
                        </View>
                    );
                })}


                <Text style={styles.sectionTitle}>📡 Dados IoT</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                    <IoTCard icon="❤️" label="Batimentos" value={`${iotData.heartRate}`} unit="bpm" status="normal" lastSync={iotData.lastSync} />
                    <IoTCard icon="👟" label="Passos" value={`${iotData.steps.toLocaleString()}`} unit="passos" status="good" lastSync={iotData.lastSync} />
                    <IoTCard icon="😴" label="Sono" value={`${iotData.sleepHours}`} unit="horas" status={iotData.sleepHours >= 7 ? 'good' : 'warning'} lastSync={iotData.lastSync} />
                    <IoTCard icon="🌡️" label="Temp." value={`${iotData.bodyTemp}`} unit="°C" status="normal" lastSync={iotData.lastSync} />
                    <IoTCard icon="⚡" label="Minutos Ativos" value={`${iotData.activeMinutes}`} unit="min" status="good" lastSync={iotData.lastSync} />
                </ScrollView>


                <WeightChart data={weightHistory} />


                {todayWorkout && (
                    <View style={styles.todayCard}>
                        <Text style={styles.todayLabel}>💪 Treino Sugerido de Hoje</Text>
                        <Text style={styles.todayName}>{todayWorkout.name}</Text>
                        <Text style={styles.todayInfo}>{todayWorkout.focus} • {todayWorkout.duration} • ~{todayWorkout.caloriesEstimate}kcal</Text>
                        <Text style={styles.todayExercises}>{todayWorkout.exercises.length} exercícios • {todayWorkout.difficulty}</Text>
                    </View>
                )}
            </ScrollView>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 16
    },
    greeting: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: 'bold'
    },
    subGreeting: {
        color: '#71717a',
        fontSize: 14,
        marginTop: 2
    },
    levelBadge: {
        backgroundColor: 'rgba(245,158,11,0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12
    },
    levelText: {
        color: '#f59e0b',
        fontSize: 13,
        fontWeight: 'bold'
    },
    xpSection: { marginBottom: 16 },
    xpRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6
    },
    xpText: {
        color: '#a1a1aa',
        fontSize: 12,
        flex: 1
    },
    coinBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#1e1e1e',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8
    },
    coinText: {
        color: '#f59e0b',
        fontSize: 12,
        fontWeight: '600'
    },
    xpBarBg: {
        height: 6,
        backgroundColor: '#27272a',
        borderRadius: 3,
        overflow: 'hidden'
    },
    xpBarFill: {
        height: '100%',
        backgroundColor: '#f59e0b',
        borderRadius: 3
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 16
    },
    bmiCard: {
        flexDirection: 'row',
        backgroundColor: '#121212',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: '#27272a',
        marginBottom: 16,
        gap: 16
    },
    bmiLeft: { alignItems: 'center' },
    bmiTitle: {
        color: '#71717a',
        fontSize: 11
    },
    bmiValue: {
        fontSize: 28,
        fontWeight: 'bold'
    },
    bmiClass: {
        fontSize: 11,
        fontWeight: '600'
    },
    bmiBar: {
        flex: 1,
        justifyContent: 'center'
    },
    bmiRanges: {
        flexDirection: 'row',
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
        gap: 2
    },
    bmiRange: { borderRadius: 2 },
    bmiLabels: {
        color: '#52525b',
        fontSize: 9,
        marginTop: 4,
        textAlign: 'center',
        fontVariant: ['tabular-nums']
    },
    sectionTitle: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 8,
        marginBottom: 12
    },
    challengeCard: {
        flexDirection: 'row',
        backgroundColor: '#121212',
        borderRadius: 16,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#27272a',
        gap: 10,
        alignItems: 'center'
    },
    challengeIcon: { fontSize: 28 },
    challengeName: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: 'bold'
    },
    challengeDesc: {
        color: '#71717a',
        fontSize: 10,
        marginTop: 2
    },
    challengeBarBg: {
        height: 4,
        backgroundColor: '#27272a',
        borderRadius: 2,
        overflow: 'hidden',
        marginTop: 6
    },
    challengeBarFill: {
        height: '100%',
        backgroundColor: '#22c55e',
        borderRadius: 2
    },
    challengeFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4
    },
    challengeProgress: {
        color: '#a1a1aa',
        fontSize: 9
    },
    challengeDeadline: {
        color: '#71717a',
        fontSize: 9
    },
    challengeReward: { alignItems: 'center' },
    rewardText: {
        color: '#f59e0b',
        fontSize: 10,
        fontWeight: 'bold'
    },
    rewardCoins: {
        color: '#f59e0b',
        fontSize: 9,
        marginTop: 2
    },
    todayCard: {
        backgroundColor: 'rgba(239,68,68,0.08)',
        borderRadius: 20,
        padding: 18,
        borderWidth: 1,
        borderColor: 'rgba(239,68,68,0.2)',
        marginTop: 8
    },
    todayLabel: {
        color: '#ef4444',
        fontSize: 12,
        fontWeight: '600'
    },
    todayName: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 4
    },
    todayInfo: {
        color: '#a1a1aa',
        fontSize: 12,
        marginTop: 2
    },
    todayExercises: {
        color: '#71717a',
        fontSize: 11,
        marginTop: 4
    },
});