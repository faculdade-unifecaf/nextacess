import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Utensils, Plus, Trash2, Lightbulb } from 'lucide-react-native';
import { GlobalContext } from '../context/GlobalContext';
import { useModal } from '../components/CustomModal';
import { NutritionEntry } from '../types/types';
import MacroChart from '../components/MacroChart';

export default function NutritionScreen() {
    const { dailyNutrition, addMeal, removeMeal, mealSuggestions } = useContext(GlobalContext);
    const { showAlert } = useModal();
    const [activeTab, setActiveTab] = useState<'diario' | 'sugestoes'>('diario');

    const totals = dailyNutrition.meals.reduce((acc, m) => ({
        calories: acc.calories + m.calories, protein: acc.protein + m.protein,
        carbs: acc.carbs + m.carbs, fat: acc.fat + m.fat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const handleAddSuggestion = (suggestion: typeof mealSuggestions[0]) => {
        const newMeal: NutritionEntry = {
            id: String(Date.now()), mealName: suggestion.name, mealType: 'snack',
            calories: suggestion.calories, protein: suggestion.protein,
            carbs: suggestion.carbs, fat: suggestion.fat,
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            icon: suggestion.icon,
        };
        addMeal(newMeal);
        showAlert('✅ Adicionado!', `${suggestion.name} adicionado ao diário.`);
    };

    const handleRemoveMeal = (mealId: string, name: string) => {
        showAlert('Remover', `Remover ${name}?`, [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Remover', style: 'destructive', onPress: () => removeMeal(mealId) },
        ]);
    };

    const mealTypeLabels: Record<string, string> = {
        cafe_da_manha: '☀️ Café da Manhã', almoco: '🍽️ Almoço',
        lanche: '🥤 Lanche', jantar: '🌙 Jantar', snack: '🍪 Snack',
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Utensils color="#22c55e" size={28} />
                    <View>
                        <Text style={styles.title}>Nutrição</Text>
                        <Text style={styles.subtitle}>Controle sua alimentação diária</Text>
                    </View>
                </View>

                <View style={styles.tabs}>
                    {(['diario', 'sugestoes'] as const).map(tab => (
                        <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
                            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                                {tab === 'diario' ? '📋 Diário' : '💡 Sugestões'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {activeTab === 'diario' && (
                    <>
                        <MacroChart
                            protein={totals.protein} carbs={totals.carbs} fat={totals.fat}
                            targetProtein={dailyNutrition.targetProtein} targetCarbs={dailyNutrition.targetCarbs}
                            targetFat={dailyNutrition.targetFat} totalCalories={totals.calories}
                            targetCalories={dailyNutrition.targetCalories}
                        />

                        <Text style={styles.sectionTitle}>🍽️ Refeições de Hoje</Text>
                        {dailyNutrition.meals.map(meal => (
                            <View key={meal.id} style={styles.mealCard}>
                                <Text style={styles.mealIcon}>{meal.icon}</Text>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.mealName}>{meal.mealName}</Text>
                                    <Text style={styles.mealType}>{mealTypeLabels[meal.mealType]} • {meal.time}</Text>
                                    <View style={styles.macroRow}>
                                        <Text style={styles.macroItem}>🔴 {meal.protein}g P</Text>
                                        <Text style={styles.macroItem}>🟡 {meal.carbs}g C</Text>
                                        <Text style={styles.macroItem}>🔵 {meal.fat}g G</Text>
                                    </View>
                                </View>
                                <View style={styles.mealRight}>
                                    <Text style={styles.mealCal}>{meal.calories}</Text>
                                    <Text style={styles.mealCalUnit}>kcal</Text>
                                    <TouchableOpacity onPress={() => handleRemoveMeal(meal.id, meal.mealName)} style={styles.removeBtn}>
                                        <Trash2 color="#ef4444" size={14} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </>
                )}

                {activeTab === 'sugestoes' && (
                    <>
                        <View style={styles.suggestionHeader}>
                            <Lightbulb color="#f59e0b" size={20} />
                            <Text style={styles.suggestionTitle}>Sugestões baseadas no seu perfil</Text>
                        </View>
                        {mealSuggestions.map(s => (
                            <View key={s.id} style={styles.suggestionCard}>
                                <Text style={styles.suggestionIcon}>{s.icon}</Text>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.suggestionName}>{s.name}</Text>
                                    <Text style={styles.suggestionDesc}>{s.description}</Text>
                                    <View style={styles.macroRow}>
                                        <Text style={styles.macroItem}>{s.calories}kcal</Text>
                                        <Text style={styles.macroItem}>{s.protein}g P</Text>
                                        <Text style={styles.macroItem}>{s.carbs}g C</Text>
                                        <Text style={styles.macroItem}>{s.fat}g G</Text>
                                    </View>
                                </View>
                                <TouchableOpacity style={styles.addBtn} onPress={() => handleAddSuggestion(s)}>
                                    <Plus color="#fff" size={16} />
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
    tabs: {
        flexDirection: 'row',
        gap: 8,
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
        backgroundColor: '#22c55e',
        borderColor: '#22c55e'
    },
    tabText: {
        color: '#71717a',
        fontSize: 13,
        fontWeight: '600'
    },
    tabTextActive: { color: '#ffffff' },
    sectionTitle: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 12
    },
    mealCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#121212',
        borderRadius: 16,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#27272a',
        gap: 12
    },
    mealIcon: { fontSize: 28 },
    mealName: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600'
    },
    mealType: {
        color: '#71717a',
        fontSize: 10,
        marginTop: 2
    },
    macroRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 4
    },
    macroItem: {
        color: '#a1a1aa',
        fontSize: 10
    },
    mealRight: { alignItems: 'center' },
    mealCal: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold'
    },
    mealCalUnit: {
        color: '#71717a',
        fontSize: 9
    },
    removeBtn: {
        marginTop: 6,
        padding: 4
    },
    suggestionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12
    },
    suggestionTitle: {
        color: '#f59e0b',
        fontSize: 14,
        fontWeight: '600'
    },
    suggestionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#121212',
        borderRadius: 16,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#27272a',
        gap: 12
    },
    suggestionIcon: { fontSize: 28 },
    suggestionName: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600'
    },
    suggestionDesc: {
        color: '#71717a',
        fontSize: 11,
        marginTop: 2
    },
    addBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#22c55e',
        alignItems: 'center',
        justifyContent: 'center'
    },
});
