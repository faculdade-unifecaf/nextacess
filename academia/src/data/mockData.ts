import {
    User, UserStats, Workout, AIRecommendation, IoTData, WeightEntry,
    WorkoutLog, AdminStats, AIMessage, NutritionEntry, DailyNutrition,
    MealSuggestion, Achievement, CalendarDay, Challenge, WeeklyPlan,
} from '../types/types';
import {
    chestTricepsExercises, backBicepsExercises, legExercises,
    shoulderAbsExercises, cardioExercises, fullBodyExercises,
} from './exerciseData';

// ===== USUÁRIOS =====
export const mockUsers: User[] = [
    {
        id: '1', name: 'Vitinho Foda', email: 'vitinho@email.com', role: 'user',
        weight: 82.5, height: 178, goal: 'ganhar_massa', createdAt: '2025-01-15',
        bodyMeasurements: { chest: 102, waist: 82, hips: 98, biceps: 36, thighs: 58, calves: 38 },
    },
    {
        id: '2', name: 'Admin Master', email: 'admin@nexus.com', role: 'admin',
        weight: 75, height: 180, goal: 'manter', createdAt: '2024-06-01',
    },
    {
        id: '3', name: 'Maria Silva', email: 'maria@email.com', role: 'user',
        weight: 62, height: 165, goal: 'definir', createdAt: '2025-02-20',
        bodyMeasurements: { chest: 88, waist: 68, hips: 95, biceps: 26, thighs: 52, calves: 34 },
    },
];

// ===== STATS =====
export const initialUserStats: UserStats = {
    name: 'Vitinho Foda', level: 'FODA', levelNum: 999, xp: 999999, xpNext: 1000000,
    nexusCoins: 1240, weight: 82.5, caloriesBurned: 640, waterIntake: 1.25, waterGoal: 3.0, streak: 12,
};

// ===== TREINOS COM TUTORIAIS =====
export const detailedWorkouts: Workout[] = [
    {
        id: '1', name: 'Peito & Tríceps', focus: 'Peito / Tríceps', duration: '55min',
        difficulty: 'Intermediário', caloriesEstimate: 420, imageColor: '#ef4444',
        description: 'Treino focado no desenvolvimento do peitoral e tríceps. Combina exercícios compostos e isolados.',
        warmup: ['5min de esteira leve', 'Rotação de ombros (20 reps)', 'Flexões leves (10 reps)', 'Alongamento peitoral (30seg cada lado)'],
        cooldown: ['Alongamento peitoral na parede (30seg)', 'Alongamento tríceps (30seg cada)', 'Respiração profunda (1min)'],
        exercises: chestTricepsExercises,
    },
    {
        id: '2', name: 'Costas & Bíceps', focus: 'Costas / Bíceps', duration: '50min',
        difficulty: 'Intermediário', caloriesEstimate: 380, imageColor: '#3b82f6',
        description: 'Treino para desenvolvimento de largura e espessura das costas, com bíceps complementar.',
        warmup: ['5min de remo ergômetro', 'Band pull-aparts (15 reps)', 'Rotação de tronco (10 cada lado)', 'Pendurar na barra (20seg)'],
        cooldown: ['Alongamento dorsal (30seg)', 'Alongamento bíceps na parede (30seg cada)', 'Foam roller nas costas (1min)'],
        exercises: backBicepsExercises,
    },
    {
        id: '3', name: 'Pernas Completo', focus: 'Quadríceps / Posterior / Glúteos', duration: '60min',
        difficulty: 'Avançado', caloriesEstimate: 520, imageColor: '#22c55e',
        description: 'Treino completo de membros inferiores. O mais intenso e que mais gasta calorias.',
        warmup: ['5min de bike', 'Agachamento sem peso (15 reps)', 'Avanço alternado (10 cada)', 'Mobilidade de quadril (1min)'],
        cooldown: ['Alongamento quadríceps (30seg cada)', 'Alongamento posterior (30seg cada)', 'Rolo de espuma nas coxas (2min)'],
        exercises: legExercises,
    },
    {
        id: '4', name: 'Ombros & Abdômen', focus: 'Deltoides / Core', duration: '45min',
        difficulty: 'Intermediário', caloriesEstimate: 350, imageColor: '#f59e0b',
        description: 'Treino de ombros para estética e abdômen para um core forte e definido.',
        warmup: ['Rotação de ombros (20 reps)', 'Band pull-aparts (15 reps)', 'Prancha 30seg', 'Elevação lateral leve (10 reps)'],
        cooldown: ['Alongamento deltoides (30seg cada)', 'Alongamento abdominal cobra (30seg)', 'Respiração diafragmática (1min)'],
        exercises: shoulderAbsExercises,
    },
    {
        id: '5', name: 'Cardio HIIT', focus: 'Cardiovascular', duration: '30min',
        difficulty: 'Avançado', caloriesEstimate: 450, imageColor: '#ec4899',
        description: 'High-Intensity Interval Training para queima calórica máxima e condicionamento.',
        warmup: ['3min de trote leve', 'Polichinelos (30seg)', 'Agachamento sem peso (10 reps)', 'Jumping Jacks (30seg)'],
        cooldown: ['Caminhada leve (2min)', 'Alongamento geral (3min)', 'Hidratação'],
        exercises: cardioExercises,
    },
    {
        id: '6', name: 'Full Body Iniciante', focus: 'Corpo Inteiro', duration: '40min',
        difficulty: 'Iniciante', caloriesEstimate: 280, imageColor: '#8b5cf6',
        description: 'Treino para iniciantes que trabalha todos os grupos musculares. Foco em aprender os movimentos.',
        warmup: ['5min de caminhada', 'Polichinelos (20 reps)', 'Agachamento sem peso (10 reps)', 'Flexões de joelho (5 reps)'],
        cooldown: ['Alongamento geral de corpo inteiro (5min)', 'Respiração profunda (1min)'],
        exercises: fullBodyExercises,
    },
];

// ===== HISTÓRICO DE PESO =====
export const weightHistory: WeightEntry[] = [
    { date: '01/03', weight: 84.2 }, { date: '02/03', weight: 83.8 },
    { date: '03/03', weight: 83.5 }, { date: '04/03', weight: 83.1 },
    { date: '05/03', weight: 82.9 }, { date: '06/03', weight: 82.7 },
    { date: '07/03', weight: 82.5 },
];

// ===== IoT =====
export const iotData: IoTData = {
    heartRate: 72, steps: 8432, activeMinutes: 47, sleepHours: 7.5, bodyTemp: 36.6, lastSync: '07/03 às 14:30',
};

// ===== IA RECOMENDAÇÕES =====
export const aiRecommendations: AIRecommendation[] = [
    { id: '1', title: 'Aumente a carga no Supino', description: 'Seus dados mostram estagnação há 2 semanas. Tente +2.5kg.', type: 'treino', priority: 'alta', icon: 'trending-up' },
    { id: '2', title: 'Hidratação Insuficiente', description: 'Média de 1.5L/dia. Para 82.5kg, o ideal é 2.5-3L/dia.', type: 'hidratacao', priority: 'alta', icon: 'droplets' },
    { id: '3', title: 'Dia de Descanso', description: '5 dias seguidos treinando. Descanso ativo melhorará a recuperação.', type: 'descanso', priority: 'media', icon: 'moon' },
    { id: '4', title: 'Aumente a Proteína', description: 'Para ganho de massa, consuma ~150g de proteína/dia. Adicione whey pós-treino.', type: 'dieta', priority: 'media', icon: 'utensils' },
];

export const initialAIMessages: AIMessage[] = [
    { id: '1', role: 'ai', content: 'Olá! Sou seu Coach IA 🤖 Posso te ajudar com recomendações de treino, análise de desempenho e metas. Como posso ajudar hoje?', timestamp: '14:00' },
];

export const aiResponses: Record<string, string> = {
    treino: 'Com base no seu perfil (82.5kg, ganho de massa), recomendo focar em compostos: Agachamento, Supino, Terra. Divisão ideal: Peito/Tríceps, Costas/Bíceps, Pernas, Ombros/Abdômen, com 1-2 dias de descanso. 💪',
    peso: 'Você perdeu 1.7kg nas últimas 7 sessões — ritmo excelente! Mantenha déficit de ~300kcal/dia. Peso ideal para definição: ~78kg. Você está no caminho certo! 📉',
    dieta: 'Para ganho de massa com 82.5kg:\n• Calorias: ~2800kcal/dia\n• Proteína: 150-165g\n• Carboidratos: 350-400g\n• Gorduras: 70-80g\nFoco em refeições a cada 3h com proteína de qualidade. 🥩',
    descanso: 'Sono médio de 7.5h — bom! Para otimizar recuperação, tente 8h+ com horários regulares. Evite telas 1h antes de dormir. Batimentos em repouso (72bpm) normais. 😴',
    calorias: 'Hoje: 640kcal queimadas. Média semanal: ~450kcal/dia. Para ganho de massa, garanta 2800kcal+ de consumo. 8432 passos hoje — ótimo nível de atividade! 🔥',
    default: 'Entendi! Analisando seus dados... Me pergunte sobre treinos, peso, dieta, descanso ou calorias para recomendações personalizadas! 🤖',
};

// ===== PLANO SEMANAL IA =====
export const weeklyPlan: WeeklyPlan[] = [
    { day: 'Segunda', workoutName: 'Peito & Tríceps', focus: 'Peito / Tríceps', isRestDay: false },
    { day: 'Terça', workoutName: 'Costas & Bíceps', focus: 'Costas / Bíceps', isRestDay: false },
    { day: 'Quarta', workoutName: 'Pernas Completo', focus: 'Pernas', isRestDay: false },
    { day: 'Quinta', workoutName: 'Descanso Ativo', focus: 'Caminhada / Yoga', isRestDay: true },
    { day: 'Sexta', workoutName: 'Ombros & Abdômen', focus: 'Ombros / Core', isRestDay: false },
    { day: 'Sábado', workoutName: 'Cardio HIIT', focus: 'Cardiovascular', isRestDay: false },
    { day: 'Domingo', workoutName: 'Descanso Total', focus: 'Recuperação', isRestDay: true },
];

// ===== LOGS DE TREINO =====
export const workoutLogs: WorkoutLog[] = [
    { id: '1', workoutId: '1', workoutName: 'Peito & Tríceps', completedAt: '06/03 às 07:30', duration: '52min', caloriesBurned: 410 },
    { id: '2', workoutId: '3', workoutName: 'Pernas Completo', completedAt: '05/03 às 08:00', duration: '58min', caloriesBurned: 505 },
    { id: '3', workoutId: '2', workoutName: 'Costas & Bíceps', completedAt: '04/03 às 07:45', duration: '48min', caloriesBurned: 370 },
    { id: '4', workoutId: '5', workoutName: 'Cardio HIIT', completedAt: '03/03 às 06:30', duration: '28min', caloriesBurned: 440 },
    { id: '5', workoutId: '4', workoutName: 'Ombros & Abdômen', completedAt: '02/03 às 07:15', duration: '43min', caloriesBurned: 340 },
];

// ===== NUTRIÇÃO =====
export const dailyNutrition: DailyNutrition = {
    targetCalories: 2800, targetProtein: 160, targetCarbs: 380, targetFat: 75,
    meals: [
        { id: '1', mealName: 'Ovos + Pão Integral + Banana', mealType: 'cafe_da_manha', calories: 480, protein: 28, carbs: 52, fat: 18, time: '07:00', icon: '🍳' },
        { id: '2', mealName: 'Frango Grelhado + Arroz + Feijão', mealType: 'almoco', calories: 720, protein: 48, carbs: 85, fat: 15, time: '12:00', icon: '🍗' },
        { id: '3', mealName: 'Whey + Aveia + Frutas', mealType: 'lanche', calories: 380, protein: 35, carbs: 48, fat: 8, time: '15:30', icon: '🥤' },
        { id: '4', mealName: 'Peixe + Batata Doce + Salada', mealType: 'jantar', calories: 550, protein: 40, carbs: 60, fat: 12, time: '19:00', icon: '🐟' },
        { id: '5', mealName: 'Iogurte Grego + Castanhas', mealType: 'snack', calories: 250, protein: 18, carbs: 15, fat: 14, time: '21:00', icon: '🥜' },
    ],
};

export const mealSuggestions: MealSuggestion[] = [
    { id: '1', name: 'Shake Pós-Treino', calories: 420, protein: 40, carbs: 50, fat: 5, icon: '🥤', description: 'Whey + banana + aveia + leite desnatado' },
    { id: '2', name: 'Omelete de Claras', calories: 280, protein: 32, carbs: 8, fat: 14, icon: '🍳', description: '6 claras + 1 gema + queijo cottage + espinafre' },
    { id: '3', name: 'Bowl de Açaí Proteico', calories: 350, protein: 25, carbs: 45, fat: 8, icon: '🫐', description: 'Açaí + whey + granola + banana' },
    { id: '4', name: 'Wrap de Frango', calories: 450, protein: 38, carbs: 42, fat: 12, icon: '🌯', description: 'Tortilla integral + frango desfiado + alface + tomate' },
    { id: '5', name: 'Salmão com Quinoa', calories: 520, protein: 42, carbs: 35, fat: 22, icon: '🍣', description: 'Filé de salmão grelhado + quinoa + brócolis' },
];

// ===== CONQUISTAS =====
export const achievements: Achievement[] = [
    { id: '1', title: 'Primeiro Treino', description: 'Complete seu primeiro treino', icon: '🎯', progress: 1, target: 1, unlocked: true, category: 'treino', xpReward: 50 },
    { id: '2', title: 'Semana de Ferro', description: 'Treine 5 dias em uma semana', icon: '🔥', progress: 5, target: 5, unlocked: true, category: 'consistencia', xpReward: 100 },
    { id: '3', title: 'Hidratação Master', description: 'Atinja a meta de água por 7 dias seguidos', icon: '💧', progress: 4, target: 7, unlocked: false, category: 'nutricao', xpReward: 75 },
    { id: '4', title: 'Centurião do XP', description: 'Acumule 100.000 XP', icon: '⭐', progress: 100, target: 100, unlocked: true, category: 'especial', xpReward: 200 },
    { id: '5', title: 'Maratonista', description: 'Complete 50 treinos', icon: '🏅', progress: 32, target: 50, unlocked: false, category: 'treino', xpReward: 250 },
    { id: '6', title: 'Streak de 30 Dias', description: 'Mantenha streak de 30 dias', icon: '🔥', progress: 12, target: 30, unlocked: false, category: 'consistencia', xpReward: 500 },
    { id: '7', title: 'Dieta Perfeita', description: 'Registre todas as refeições por 14 dias', icon: '🥗', progress: 3, target: 14, unlocked: false, category: 'nutricao', xpReward: 150 },
    { id: '8', title: 'Coach IA Expert', description: 'Faça 20 perguntas ao Coach IA', icon: '🤖', progress: 8, target: 20, unlocked: false, category: 'social', xpReward: 100 },
];

// ===== DESAFIOS ATIVOS =====
export const activeChallenges: Challenge[] = [
    { id: '1', title: 'Desafio 10K Passos', description: 'Alcance 10.000 passos por dia durante 5 dias', icon: '🚶', progress: 3, target: 5, unit: 'dias', deadline: '10/03', xpReward: 150, coinReward: 50 },
    { id: '2', title: 'Supino 100kg', description: 'Consiga fazer supino reto com 100kg', icon: '🏋️', progress: 80, target: 100, unit: 'kg', deadline: '30/03', xpReward: 300, coinReward: 100 },
    { id: '3', title: 'Queime 3000kcal', description: 'Queime 3000kcal em treinos esta semana', icon: '🔥', progress: 2065, target: 3000, unit: 'kcal', deadline: '09/03', xpReward: 200, coinReward: 75 },
];

// ===== CALENDÁRIO DA SEMANA =====
export const weekCalendar: CalendarDay[] = [
    { date: '01/03', dayOfWeek: 'Seg', dayNumber: 1, trained: true, workoutName: 'Ombros', isToday: false },
    { date: '02/03', dayOfWeek: 'Ter', dayNumber: 2, trained: true, workoutName: 'Cardio', isToday: false },
    { date: '03/03', dayOfWeek: 'Qua', dayNumber: 3, trained: true, workoutName: 'Pernas', isToday: false },
    { date: '04/03', dayOfWeek: 'Qui', dayNumber: 4, trained: false, isToday: false },
    { date: '05/03', dayOfWeek: 'Sex', dayNumber: 5, trained: true, workoutName: 'Costas', isToday: false },
    { date: '06/03', dayOfWeek: 'Sáb', dayNumber: 6, trained: true, workoutName: 'Peito', isToday: false },
    { date: '07/03', dayOfWeek: 'Dom', dayNumber: 7, trained: false, isToday: true },
];

// ===== ADMIN =====
export const adminStats: AdminStats = {
    totalUsers: 1247, activeToday: 89, totalWorkouts: 342, avgSessionMinutes: 48, newUsersThisWeek: 23, revenue: 45890.0,
};
