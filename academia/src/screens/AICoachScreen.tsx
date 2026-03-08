import React, { useContext, useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, SafeAreaView, TextInput,
    TouchableOpacity, Dimensions,
} from 'react-native';
import { Bot, Send, TrendingUp, Droplets, Moon, Utensils, Calendar, Brain } from 'lucide-react-native';
import { GlobalContext } from '../context/GlobalContext';
import ChatBubble from '../components/ChatBubble';
import WeightChart from '../components/WeightChart';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AICoachScreen() {
    const { aiMessages, sendAIMessage, aiRecommendations, weightHistory, stats, weeklyPlan, iotData, dailyNutrition } = useContext(GlobalContext);
    const [input, setInput] = useState('');
    const [activeTab, setActiveTab] = useState<'chat' | 'analise' | 'plano' | 'recomendacoes'>('chat');
    const chatScrollRef = useRef<ScrollView>(null);

    const handleSend = () => {
        const msg = input.trim();
        if (!msg) return;
        sendAIMessage(msg);
        setInput('');
        setTimeout(() => {
            chatScrollRef.current?.scrollToEnd({ animated: true });
        }, 200);
    };

    const getRecommendationIcon = (type: string) => {
        switch (type) {
            case 'treino': return <TrendingUp color="#ef4444" size={20} />;
            case 'hidratacao': return <Droplets color="#3b82f6" size={20} />;
            case 'descanso': return <Moon color="#8b5cf6" size={20} />;
            case 'dieta': return <Utensils color="#22c55e" size={20} />;
            default: return <Bot color="#71717a" size={20} />;
        }
    };

    const getPriorityColor = (p: string) =>
        p === 'alta' ? '#ef4444' : p === 'media' ? '#f59e0b' : '#22c55e';

    const weightDiff = weightHistory.length >= 2 ? (weightHistory[0].weight - weightHistory[weightHistory.length - 1].weight).toFixed(1) : '0';
    const hydrationPct = ((stats.waterIntake / stats.waterGoal) * 100).toFixed(0);
    const totalMealCals = dailyNutrition.meals.reduce((a, m) => a + m.calories, 0);
    const sleepQuality = iotData.sleepHours >= 7.5 ? 'Excelente' : iotData.sleepHours >= 6.5 ? 'Bom' : 'Insuficiente';

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Bot color="#ef4444" size={28} />
                <View style={{ flex: 1 }}>
                    <Text style={styles.title}>Coach IA</Text>
                    <Text style={styles.subtitle}>Inteligência Artificial + Big Data</Text>
                </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabsContent}>
                {(['chat', 'analise', 'plano', 'recomendacoes'] as const).map(tab => (
                    <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
                        <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                            {tab === 'chat' ? '💬 Chat' : tab === 'analise' ? '📊 Big Data' : tab === 'plano' ? '📅 Plano' : '✨ Dicas'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {activeTab === 'chat' && (
                <View style={styles.chatContainer}>
                    <ScrollView
                        ref={chatScrollRef}
                        style={styles.chatScroll}
                        contentContainerStyle={styles.chatList}
                        showsVerticalScrollIndicator={false}
                        onContentSizeChange={() => chatScrollRef.current?.scrollToEnd({ animated: false })}
                    >
                        {aiMessages.map(msg => (
                            <ChatBubble key={msg.id} message={msg} />
                        ))}
                    </ScrollView>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestions} contentContainerStyle={{ paddingHorizontal: 16 }}>
                        {['Meu treino ideal?', 'Análise de peso', 'Dicas de dieta', 'Como melhorar sono?', 'Calorias queimadas'].map(s => (
                            <TouchableOpacity key={s} style={styles.suggestionChip} onPress={() => { setInput(s); }}>
                                <Text style={styles.suggestionText}>{s}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.input}
                            placeholder="Pergunte sobre treino, dieta, peso..."
                            placeholderTextColor="#52525b"
                            value={input}
                            onChangeText={setInput}
                            onSubmitEditing={handleSend}
                            returnKeyType="send"
                        />
                        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                            <Send color="#ffffff" size={18} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {activeTab === 'analise' && (
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <WeightChart data={weightHistory} />
                    <View style={styles.analysisCard}>
                        <Text style={styles.analysisTitle}>🧠 Análise Big Data em Tempo Real</Text>
                        <Text style={styles.analysisText}>
                            Analisando {weightHistory.length} medições, {stats.streak} dias de streak, {iotData.steps.toLocaleString()} passos hoje:
                        </Text>
                        {[
                            { icon: '📉', text: `Tendência de peso: ${parseFloat(weightDiff) > 0 ? '-' : '+'}${Math.abs(parseFloat(weightDiff))}kg na última semana`, color: parseFloat(weightDiff) > 0 ? '#22c55e' : '#ef4444' },
                            { icon: '🔥', text: `${stats.caloriesBurned}kcal queimadas hoje | ${totalMealCals}kcal consumidas`, color: '#f59e0b' },
                            { icon: '💧', text: `Hidratação: ${hydrationPct}% da meta (${stats.waterIntake.toFixed(1)}L / ${stats.waterGoal}L)`, color: parseInt(hydrationPct) >= 80 ? '#22c55e' : '#f59e0b' },
                            { icon: '😴', text: `Sono: ${iotData.sleepHours}h — Qualidade: ${sleepQuality}`, color: iotData.sleepHours >= 7 ? '#22c55e' : '#ef4444' },
                            { icon: '❤️', text: `FC em repouso: ${iotData.heartRate}bpm — ${iotData.heartRate < 60 ? 'Atlético' : iotData.heartRate < 80 ? 'Normal' : 'Elevada'}`, color: '#3b82f6' },
                            { icon: '📈', text: `Previsão: atingirá 80kg em ~${Math.ceil(Math.abs(stats.weight - 80) / 0.25)} sessões`, color: '#8b5cf6' },
                        ].map((insight, i) => (
                            <View key={i} style={styles.insightRow}>
                                <Text style={styles.insightBullet}>{insight.icon}</Text>
                                <Text style={[styles.insightText, { color: insight.color }]}>{insight.text}</Text>
                            </View>
                        ))}
                    </View>
                    <View style={styles.analysisCard}>
                        <Text style={styles.analysisTitle}>🎯 Balanço Calórico</Text>
                        <View style={styles.calorieRow}>
                            <View style={styles.calorieItem}>
                                <Text style={styles.calorieValue}>{totalMealCals}</Text>
                                <Text style={styles.calorieLabel}>Consumido</Text>
                            </View>
                            <View style={styles.calorieDivider} />
                            <View style={styles.calorieItem}>
                                <Text style={[styles.calorieValue, { color: '#ef4444' }]}>{stats.caloriesBurned}</Text>
                                <Text style={styles.calorieLabel}>Queimado</Text>
                            </View>
                            <View style={styles.calorieDivider} />
                            <View style={styles.calorieItem}>
                                <Text style={[styles.calorieValue, { color: totalMealCals - stats.caloriesBurned > 0 ? '#22c55e' : '#ef4444' }]}>
                                    {totalMealCals - stats.caloriesBurned}
                                </Text>
                                <Text style={styles.calorieLabel}>Balanço</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            )}

            {activeTab === 'plano' && (
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.planHeader}>
                        <Calendar color="#3b82f6" size={20} />
                        <Text style={styles.planHeaderText}>Plano Gerado pela IA</Text>
                    </View>
                    <Text style={styles.planDesc}>
                        Baseado no seu objetivo ({stats.weight}kg, ganho de massa), a IA montou o seguinte plano semanal otimizado:
                    </Text>
                    {weeklyPlan.map((day, i) => (
                        <View key={i} style={[styles.planCard, day.isRestDay && styles.planCardRest]}>
                            <View style={[styles.planDayBadge, { backgroundColor: day.isRestDay ? '#27272a' : '#ef444422' }]}>
                                <Text style={[styles.planDayText, { color: day.isRestDay ? '#71717a' : '#ef4444' }]}>{day.day.slice(0, 3)}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.planWorkout, day.isRestDay && { color: '#52525b' }]}>{day.workoutName}</Text>
                                <Text style={styles.planFocus}>{day.focus}</Text>
                            </View>
                            {day.isRestDay ? (
                                <Text style={styles.planRestBadge}>😴 Descanso</Text>
                            ) : (
                                <Text style={styles.planActiveBadge}>💪 Treino</Text>
                            )}
                        </View>
                    ))}
                    <View style={styles.planTip}>
                        <Brain color="#8b5cf6" size={16} />
                        <Text style={styles.planTipText}>A IA ajusta este plano semanalmente baseado no seu progresso, sono, e dados de IoT.</Text>
                    </View>
                </ScrollView>
            )}

            {activeTab === 'recomendacoes' && (
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {aiRecommendations.map(rec => (
                        <View key={rec.id} style={styles.recCard}>
                            <View style={styles.recHeader}>
                                {getRecommendationIcon(rec.type)}
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={styles.recTitle}>{rec.title}</Text>
                                    <View style={[styles.priorityBadge, { backgroundColor: `${getPriorityColor(rec.priority)}22` }]}>
                                        <Text style={[styles.priorityText, { color: getPriorityColor(rec.priority) }]}>
                                            {rec.priority === 'alta' ? '🔴 Alta' : rec.priority === 'media' ? '🟡 Média' : '🟢 Baixa'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <Text style={styles.recDescription}>{rec.description}</Text>
                        </View>
                    ))}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 12
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
    tabsScroll: {
        maxHeight: 44,
        marginBottom: 8
    },
    tabsContent: {
        gap: 6,
        paddingHorizontal: 20
    },
    tab: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: '#121212',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#27272a'
    },
    tabActive: {
        backgroundColor: '#ef4444',
        borderColor: '#ef4444'
    },
    tabText: {
        color: '#71717a',
        fontSize: 12,
        fontWeight: '600'
    },
    tabTextActive: { color: '#ffffff' },
    chatContainer: { flex: 1 },
    chatScroll: { flex: 1 },
    chatList: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 8
    },
    suggestions: {
        paddingVertical: 6,
        borderTopWidth: 1,
        borderTopColor: '#1a1a1a'
    },
    suggestionChip: {
        backgroundColor: '#1e1e1e',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#27272a'
    },
    suggestionText: {
        color: '#a1a1aa',
        fontSize: 12
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 8,
        borderTopWidth: 1,
        borderTopColor: '#1a1a1a',
        backgroundColor: '#000000'
    },
    input: {
        flex: 1,
        backgroundColor: '#121212',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 12,
        color: '#ffffff',
        fontSize: 14,
        borderWidth: 1,
        borderColor: '#27272a'
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#ef4444',
        alignItems: 'center',
        justifyContent: 'center'
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100
    },
    analysisCard: {
        backgroundColor: '#121212',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#27272a',
        marginTop: 16
    },
    analysisTitle: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12
    },
    analysisText: {
        color: '#a1a1aa',
        fontSize: 13,
        lineHeight: 20,
        marginBottom: 12
    },
    insightRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        marginBottom: 10
    },
    insightBullet: { fontSize: 14 },
    insightText: {
        fontSize: 13,
        flex: 1,
        lineHeight: 19
    },
    calorieRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around'
    },
    calorieItem: {
        alignItems: 'center',
        flex: 1
    },
    calorieValue: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: 'bold'
    },
    calorieLabel: {
        color: '#71717a',
        fontSize: 11,
        marginTop: 4
    },
    calorieDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#27272a'
    },
    planHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8
    },
    planHeaderText: {
        color: '#3b82f6',
        fontSize: 16,
        fontWeight: 'bold'
    },
    planDesc: {
        color: '#71717a',
        fontSize: 12,
        marginBottom: 16,
        lineHeight: 18
    },
    planCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#121212',
        borderRadius: 14,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#27272a',
        gap: 12
    },
    planCardRest: { opacity: 0.6 },
    planDayBadge: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },
    planDayText: {
        fontSize: 13,
        fontWeight: 'bold'
    },
    planWorkout: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600'
    },
    planFocus: {
        color: '#71717a',
        fontSize: 11,
        marginTop: 2
    },
    planRestBadge: {
        color: '#71717a',
        fontSize: 10
    },
    planActiveBadge: {
        color: '#22c55e',
        fontSize: 10,
        fontWeight: '600'
    },
    planTip: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        marginTop: 12,
        backgroundColor: 'rgba(139,92,246,0.08)',
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: 'rgba(139,92,246,0.2)'
    },
    planTipText: {
        color: '#a78bfa',
        fontSize: 12,
        flex: 1,
        lineHeight: 18
    },
    recCard: {
        backgroundColor: '#121212',
        borderRadius: 20,
        padding: 18,
        borderWidth: 1,
        borderColor: '#27272a',
        marginBottom: 12
    },
    recHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    recTitle: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold'
    },
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginTop: 4
    },
    priorityText: {
        fontSize: 10,
        fontWeight: 'bold'
    },
    recDescription: {
        color: '#a1a1aa',
        fontSize: 13,
        lineHeight: 19
    },
});
