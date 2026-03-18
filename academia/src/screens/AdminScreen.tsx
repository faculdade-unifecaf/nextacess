import React, { useContext, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity,
} from 'react-native';
import { Shield, Users, Dumbbell, Clock, TrendingUp, DollarSign, Plus, LogOut, UserPlus, Edit, Trash2 } from 'lucide-react-native';
import { GlobalContext } from '../context/GlobalContext';
import { useModal } from '../components/CustomModal';
import { adminStats } from '../data/mockData';

export default function AdminScreen() {
    const { logout, workouts } = useContext(GlobalContext);
    const { showAlert } = useModal();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'treinos' | 'usuarios'>('dashboard');

    const handleLogout = () => {
        showAlert('Sair', 'Deseja sair do painel admin?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Sair', style: 'destructive', onPress: logout },
        ]);
    };

    const handleDeleteWorkout = (name: string) => {
        showAlert('Excluir Treino', `Deseja excluir "${name}"?`, [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Excluir', style: 'destructive', onPress: () => showAlert('✅ Sucesso', `Treino "${name}" removido (simulação).`) },
        ]);
    };

    const handleEditWorkout = (name: string) => {
        showAlert('✏️ Editar Treino', `Editando "${name}".\n\nFuncionalidade completa disponível com backend.`);
    };

    const handleToggleUser = (name: string, status: string) => {
        const action = status === 'Ativo' ? 'desativar' : 'ativar';
        showAlert(`${action.charAt(0).toUpperCase() + action.slice(1)} Usuário`, `Deseja ${action} "${name}"?`, [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Confirmar', onPress: () => showAlert('✅ Sucesso', `Usuário "${name}" ${action === 'ativar' ? 'ativado' : 'desativado'} (simulação).`) },
        ]);
    };

    const handleNewWorkout = () => {
        showAlert('➕ Novo Treino', 'Criação de treinos personalizada disponível com backend integrado.\n\nPor enquanto, 6 treinos detalhados estão disponíveis.');
    };

    const mockUsers = [
        { name: 'Vitinho Foda', email: 'vitinho@email.com', status: 'Ativo', date: '15/01/2025', treinos: 32, lastActive: 'Hoje' },
        { name: 'Maria Silva', email: 'maria@email.com', status: 'Ativo', date: '20/02/2025', treinos: 18, lastActive: 'Ontem' },
        { name: 'João Santos', email: 'joao@email.com', status: 'Inativo', date: '01/01/2025', treinos: 5, lastActive: '15 dias' },
        { name: 'Ana Costa', email: 'ana@email.com', status: 'Ativo', date: '05/03/2025', treinos: 8, lastActive: 'Hoje' },
        { name: 'Pedro Lima', email: 'pedro@email.com', status: 'Ativo', date: '28/02/2025', treinos: 12, lastActive: '2 dias' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Shield color="#ef4444" size={28} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.title}>Painel Admin</Text>
                        <Text style={styles.subtitle}>Gerenciamento NEXUS FITNESS</Text>
                    </View>
                    <TouchableOpacity onPress={handleLogout} style={styles.logoutIcon}>
                        <LogOut color="#ef4444" size={20} />
                    </TouchableOpacity>
                </View>

                <View style={styles.tabs}>
                    {(['dashboard', 'treinos', 'usuarios'] as const).map(tab => (
                        <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
                            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                                {tab === 'dashboard' ? '📊 Dashboard' : tab === 'treinos' ? '🏋️ Treinos' : '👥 Usuários'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {activeTab === 'dashboard' && (
                    <>
                        <View style={styles.statsGrid}>
                            {[
                                { icon: <Users color="#3b82f6" size={20} />, value: String(adminStats.totalUsers), label: 'Total Usuários', color: '#3b82f6' },
                                { icon: <TrendingUp color="#22c55e" size={20} />, value: String(adminStats.activeToday), label: 'Ativos Hoje', color: '#22c55e' },
                                { icon: <Dumbbell color="#f59e0b" size={20} />, value: String(adminStats.totalWorkouts), label: 'Treinos Feitos', color: '#f59e0b' },
                                { icon: <Clock color="#8b5cf6" size={20} />, value: `${adminStats.avgSessionMinutes}min`, label: 'Tempo Médio', color: '#8b5cf6' },
                                { icon: <UserPlus color="#ec4899" size={20} />, value: `+${adminStats.newUsersThisWeek}`, label: 'Novos/Semana', color: '#ec4899' },
                                { icon: <DollarSign color="#22c55e" size={20} />, value: `R$${(adminStats.revenue / 1000).toFixed(1)}k`, label: 'Receita Mensal', color: '#22c55e' },
                            ].map((stat, i) => (
                                <View key={i} style={[styles.statCard, { borderColor: `${stat.color}22` }]}>
                                    <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}15` }]}>{stat.icon}</View>
                                    <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                                    <Text style={styles.statLabel}>{stat.label}</Text>
                                </View>
                            ))}
                        </View>
                        <View style={styles.metricsCard}>
                            <Text style={styles.metricsTitle}>📈 Métricas Rápidas</Text>
                            {[
                                { label: 'Taxa de retenção', value: '87%', color: '#22c55e' },
                                { label: 'Sessões/dia média', value: '3.2', color: '#3b82f6' },
                                { label: 'NPS Score', value: '9.1/10', color: '#f59e0b' },
                                { label: 'Treinos/semana', value: '342', color: '#8b5cf6' },
                            ].map((m, i) => (
                                <View key={i} style={styles.metricRow}>
                                    <Text style={styles.metricLabel}>{m.label}</Text>
                                    <Text style={[styles.metricValue, { color: m.color }]}>{m.value}</Text>
                                </View>
                            ))}
                        </View>
                    </>
                )}

                {activeTab === 'treinos' && (
                    <>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>{workouts.length} Treinos</Text>
                            <TouchableOpacity style={styles.addButton} onPress={handleNewWorkout}>
                                <Plus color="#ffffff" size={16} /><Text style={styles.addButtonText}>Novo</Text>
                            </TouchableOpacity>
                        </View>
                        {workouts.map(workout => (
                            <View key={workout.id} style={styles.workoutRow}>
                                <View style={[styles.workoutColor, { backgroundColor: workout.imageColor }]} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.workoutName}>{workout.name}</Text>
                                    <Text style={styles.workoutInfo}>{workout.exercises.length} exercícios • {workout.duration} • {workout.difficulty}</Text>
                                </View>
                                <TouchableOpacity style={styles.editBtn} onPress={() => handleEditWorkout(workout.name)}>
                                    <Edit color="#3b82f6" size={14} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteWorkout(workout.name)}>
                                    <Trash2 color="#ef4444" size={14} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </>
                )}

                {activeTab === 'usuarios' && (
                    <>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>{mockUsers.length} Usuários</Text>
                        </View>
                        {mockUsers.map((u, i) => (
                            <View key={i} style={styles.userCard}>
                                <View style={styles.userAvatar}><Text style={styles.userAvatarText}>{u.name.charAt(0)}</Text></View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.userRowName}>{u.name}</Text>
                                    <Text style={styles.userRowEmail}>{u.email}</Text>
                                    <View style={styles.userMeta}>
                                        <Text style={styles.userMetaText}>🏋️ {u.treinos}</Text>
                                        <Text style={styles.userMetaText}>🕐 {u.lastActive}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    style={[styles.statusBadge, { backgroundColor: u.status === 'Ativo' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)' }]}
                                    onPress={() => handleToggleUser(u.name, u.status)}
                                >
                                    <Text style={[styles.statusText, { color: u.status === 'Ativo' ? '#22c55e' : '#ef4444' }]}>{u.status}</Text>
                                </TouchableOpacity>
                            </View>
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
    logoutIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(239,68,68,0.1)',
        alignItems: 'center',
        justifyContent: 'center'
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
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 16
    },
    statCard: {
        width: '47%',
        backgroundColor: '#121212',
        borderRadius: 18,
        padding: 16,
        borderWidth: 1
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold'
    },
    statLabel: {
        color: '#71717a',
        fontSize: 11,
        marginTop: 2
    },
    metricsCard: {
        backgroundColor: '#121212',
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: '#27272a'
    },
    metricsTitle: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 12
    },
    metricRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a'
    },
    metricLabel: {
        color: '#a1a1aa',
        fontSize: 13
    },
    metricValue: {
        fontSize: 14,
        fontWeight: 'bold'
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
    },
    sectionTitle: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold'
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#ef4444',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10
    },
    addButtonText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 'bold'
    },
    workoutRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#121212',
        borderRadius: 14,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#27272a'
    },
    workoutColor: {
        width: 4,
        height: 40,
        borderRadius: 2
    },
    workoutName: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600'
    },
    workoutInfo: {
        color: '#71717a',
        fontSize: 11,
        marginTop: 2
    },
    editBtn: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: 'rgba(59,130,246,0.1)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    deleteBtn: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: 'rgba(239,68,68,0.1)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#121212',
        borderRadius: 14,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#27272a'
    },
    userAvatar: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#1e1e1e',
        alignItems: 'center',
        justifyContent: 'center'
    },
    userAvatarText: {
        color: '#ef4444',
        fontSize: 18,
        fontWeight: 'bold'
    },
    userRowName: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600'
    },
    userRowEmail: {
        color: '#71717a',
        fontSize: 11,
        marginTop: 1
    },
    userMeta: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 4
    },
    userMetaText: {
        color: '#52525b',
        fontSize: 9
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold'
    },
});
