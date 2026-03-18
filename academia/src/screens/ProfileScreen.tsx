import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { LogOut, Ruler, Weight, Activity, Edit3 } from 'lucide-react-native';
import { GlobalContext } from '../context/GlobalContext';
import { useModal } from '../components/CustomModal';
import AchievementCard from '../components/AchievementCard';

export default function ProfileScreen() {
    const { user, stats, logout, workoutLogs, achievements, calculateBMI, updateWeight } = useContext(GlobalContext);
    const { showAlert } = useModal();
    const [activeTab, setActiveTab] = useState<'perfil' | 'conquistas' | 'historico'>('perfil');
    const bmi = calculateBMI();

    const handleEditWeight = () => {
        showAlert('Atualizar Peso', `Peso atual: ${stats.weight}kg`, [
            { text: '-1kg', onPress: () => updateWeight(Math.round((stats.weight - 1) * 10) / 10) },
            { text: '-0.5kg', onPress: () => updateWeight(Math.round((stats.weight - 0.5) * 10) / 10) },
            { text: '+0.5kg', onPress: () => updateWeight(Math.round((stats.weight + 0.5) * 10) / 10) },
            { text: '+1kg', onPress: () => updateWeight(Math.round((stats.weight + 1) * 10) / 10) },
        ]);
    };

    const handleLogout = () => {
        showAlert('Sair', 'Deseja sair da sua conta?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Sair', style: 'destructive', onPress: logout },
        ]);
    };

    if (!user) return null;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={styles.avatarSection}>
                    <View style={styles.avatar}><Text style={styles.avatarText}>{user.name.charAt(0)}</Text></View>
                    <Text style={styles.name}>{user.name}</Text>
                    <Text style={styles.email}>{user.email}</Text>
                    <View style={styles.tagRow}>
                        <View style={styles.tag}><Text style={styles.tagText}>🏆 {stats.level}</Text></View>
                        <View style={styles.tag}><Text style={styles.tagText}>🔥 {stats.streak} dias</Text></View>
                        <View style={styles.tag}><Text style={styles.tagText}>🪙 {stats.nexusCoins}</Text></View>
                    </View>
                </View>

                <View style={styles.tabs}>
                    {(['perfil', 'conquistas', 'historico'] as const).map(tab => (
                        <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
                            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                                {tab === 'perfil' ? '👤 Perfil' : tab === 'conquistas' ? '🏅 Conquistas' : '📋 Histórico'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {activeTab === 'perfil' && (
                    <>
                        <View style={styles.infoGrid}>
                            <TouchableOpacity style={styles.infoCard} onPress={handleEditWeight} activeOpacity={0.7}>
                                <Weight color="#3b82f6" size={18} />
                                <Text style={styles.infoValue}>{stats.weight}kg</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                    <Edit3 color="#3b82f6" size={9} />
                                    <Text style={[styles.infoLabel, { color: '#3b82f6' }]}>Editar</Text>
                                </View>
                            </TouchableOpacity>
                            <View style={styles.infoCard}>
                                <Ruler color="#22c55e" size={18} />
                                <Text style={styles.infoValue}>{user.height}cm</Text>
                                <Text style={styles.infoLabel}>Altura</Text>
                            </View>
                            <TouchableOpacity style={styles.infoCard} onPress={() => showAlert('📊 IMC Detalhado', `Seu IMC: ${bmi.value}\nClassificação: ${bmi.classification}\n\n< 18.5 = Abaixo do peso\n18.5 - 24.9 = Normal\n25.0 - 29.9 = Sobrepeso\n≥ 30.0 = Obesidade\n\nPeso: ${stats.weight}kg | Altura: ${user.height}cm`)}>
                                <Activity color={bmi.color} size={18} />
                                <Text style={[styles.infoValue, { color: bmi.color }]}>{bmi.value}</Text>
                                <Text style={[styles.infoLabel, { color: bmi.color }]} numberOfLines={1}>IMC</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.bmiDetail} onPress={() => showAlert('📊 IMC', `${bmi.classification} (${bmi.value})`)}>
                            <Text style={[styles.bmiText, { color: bmi.color }]}>📊 {bmi.classification} (IMC {bmi.value})</Text>
                            <Text style={styles.bmiTap}>Toque para detalhes</Text>
                        </TouchableOpacity>

                        {user.bodyMeasurements && (
                            <View style={styles.measureCard}>
                                <Text style={styles.sectionTitle}>📏 Medidas Corporais</Text>
                                <View style={styles.measureGrid}>
                                    {Object.entries({
                                        'Peito': user.bodyMeasurements.chest, 'Cintura': user.bodyMeasurements.waist,
                                        'Quadril': user.bodyMeasurements.hips, 'Bíceps': user.bodyMeasurements.biceps,
                                        'Coxas': user.bodyMeasurements.thighs, 'Panturrilha': user.bodyMeasurements.calves,
                                    }).map(([label, value]) => (
                                        <View key={label} style={styles.measureItem}>
                                            <Text style={styles.measureValue}>{value}cm</Text>
                                            <Text style={styles.measureLabel}>{label}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        <View style={styles.goalCard}>
                            <Text style={styles.goalLabel}>🎯 Objetivo</Text>
                            <Text style={styles.goalValue}>
                                {user.goal === 'ganhar_massa' ? '💪 Ganhar Massa Muscular' :
                                    user.goal === 'perder_peso' ? '📉 Perder Peso' :
                                        user.goal === 'definir' ? '✂️ Definição Muscular' : '⚖️ Manutenção'}
                            </Text>
                        </View>

                        <View style={styles.quickStats}>
                            <View style={styles.quickItem}><Text style={styles.quickValue}>{workoutLogs.length}</Text><Text style={styles.quickLabel}>Treinos</Text></View>
                            <View style={styles.quickDivider} />
                            <View style={styles.quickItem}><Text style={styles.quickValue}>{workoutLogs.reduce((a, l) => a + l.caloriesBurned, 0).toLocaleString()}</Text><Text style={styles.quickLabel}>kcal Total</Text></View>
                            <View style={styles.quickDivider} />
                            <View style={styles.quickItem}><Text style={styles.quickValue}>{achievements.filter(a => a.unlocked).length}/{achievements.length}</Text><Text style={styles.quickLabel}>Conquistas</Text></View>
                        </View>

                        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                            <LogOut color="#ef4444" size={18} />
                            <Text style={styles.logoutText}>Sair da Conta</Text>
                        </TouchableOpacity>
                    </>
                )}

                {activeTab === 'conquistas' && (
                    <>
                        <Text style={styles.sectionTitle}>🏅 Conquistas ({achievements.filter(a => a.unlocked).length}/{achievements.length})</Text>
                        {achievements.map(a => (
                            <AchievementCard key={a.id} achievement={a}
                                onPress={() => showAlert(`${a.icon} ${a.title}`, `${a.description}\n\nProgresso: ${a.progress}/${a.target}\nCategoria: ${a.category}\nRecompensa: +${a.xpReward} XP\nStatus: ${a.unlocked ? 'Desbloqueada ✅' : 'Em progresso 🔄'}`)}
                            />
                        ))}
                    </>
                )}

                {activeTab === 'historico' && (
                    <>
                        <Text style={styles.sectionTitle}>📋 Últimos Treinos</Text>
                        {workoutLogs.length === 0 ? (
                            <View style={styles.emptyState}><Text style={styles.emptyIcon}>🏋️</Text><Text style={styles.emptyText}>Nenhum treino registrado.</Text></View>
                        ) : workoutLogs.map(log => (
                            <TouchableOpacity key={log.id} style={styles.logCard}
                                onPress={() => showAlert('📋 ' + log.workoutName, `Concluído: ${log.completedAt}\nDuração: ${log.duration}\nCalorias: ${log.caloriesBurned}kcal`)}>
                                <View style={styles.logDot} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.logName}>{log.workoutName}</Text>
                                    <Text style={styles.logDate}>{log.completedAt}</Text>
                                </View>
                                <View style={styles.logRight}>
                                    <Text style={styles.logDuration}>{log.duration}</Text>
                                    <Text style={styles.logCal}>🔥 {log.caloriesBurned}kcal</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </>
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
    avatarSection: {
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 20
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#ef4444',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12
    },
    avatarText: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold'
    },
    name: {
        color: '#ffffff',
        fontSize: 22,
        fontWeight: 'bold'
    },
    email: {
        color: '#71717a',
        fontSize: 13,
        marginTop: 2
    },
    tagRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 10,
        flexWrap: 'wrap',
        justifyContent: 'center'
    },
    tag: {
        backgroundColor: '#121212',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#27272a'
    },
    tagText: {
        color: '#a1a1aa',
        fontSize: 11
    },
    tabs: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 16
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
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
        fontSize: 11,
        fontWeight: '600'
    },
    tabTextActive: { color: '#ffffff' },
    infoGrid: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12
    },
    infoCard: {
        flex: 1,
        backgroundColor: '#121212',
        borderRadius: 16,
        padding: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#27272a',
        gap: 4
    },
    infoValue: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold'
    },
    infoLabel: {
        color: '#71717a',
        fontSize: 9,
        textAlign: 'center'
    },
    bmiDetail: {
        backgroundColor: '#121212',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#27272a',
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    bmiText: {
        fontSize: 13,
        fontWeight: '600'
    },
    bmiTap: {
        color: '#52525b',
        fontSize: 9
    },
    measureCard: {
        backgroundColor: '#121212',
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: '#27272a',
        marginBottom: 12
    },
    sectionTitle: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12
    },
    measureGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8
    },
    measureItem: {
        width: '30%',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        padding: 10,
        borderRadius: 10
    },
    measureValue: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    measureLabel: {
        color: '#71717a',
        fontSize: 10,
        marginTop: 2
    },
    goalCard: {
        backgroundColor: '#121212',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#27272a',
        marginBottom: 12
    },
    goalLabel: {
        color: '#71717a',
        fontSize: 11
    },
    goalValue: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 4
    },
    quickStats: {
        flexDirection: 'row',
        backgroundColor: '#121212',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#27272a',
        marginBottom: 16
    },
    quickItem: {
        flex: 1,
        alignItems: 'center'
    },
    quickValue: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold'
    },
    quickLabel: {
        color: '#71717a',
        fontSize: 10,
        marginTop: 2
    },
    quickDivider: {
        width: 1,
        backgroundColor: '#27272a'
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#ef4444'
    },
    logoutText: {
        color: '#ef4444',
        fontSize: 14,
        fontWeight: 'bold'
    },
    logCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#121212',
        borderRadius: 14,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#27272a',
        gap: 10
    },
    logDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#22c55e'
    },
    logName: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600'
    },
    logDate: {
        color: '#71717a',
        fontSize: 10,
        marginTop: 2
    },
    logRight: { alignItems: 'flex-end' },
    logDuration: {
        color: '#a1a1aa',
        fontSize: 12
    },
    logCal: {
        color: '#f59e0b',
        fontSize: 10,
        marginTop: 2
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40
    },
    emptyIcon: {
        fontSize: 40,
        marginBottom: 12
    },
    emptyText: {
        color: '#71717a',
        fontSize: 14
    },
});
