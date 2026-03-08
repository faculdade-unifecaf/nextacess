// ===== USUÁRIO =====
export interface User {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    avatarUrl?: string;
    weight: number;
    height: number;
    goal: 'perder_peso' | 'ganhar_massa' | 'manter' | 'definir';
    createdAt: string;
    bodyMeasurements?: BodyMeasurements;
}

export interface BodyMeasurements {
    chest: number;
    waist: number;
    hips: number;
    biceps: number;
    thighs: number;
    calves: number;
}

// ===== STATS DO USUÁRIO =====
export interface UserStats {
    name: string;
    level: string;
    levelNum: number;
    xp: number;
    xpNext: number;
    nexusCoins: number;
    weight: number;
    caloriesBurned: number;
    waterIntake: number;
    waterGoal: number;
    streak: number;
}

// ===== EXERCÍCIOS & TREINOS =====
export interface Exercise {
    id: string;
    name: string;
    sets: number;
    reps: string;
    weight: string;
    restSeconds?: number;
    muscleGroup: string;
    description: string;
    steps: string[];
    tips: string[];
    commonMistakes: string[];
    targetMuscles: string[];
    equipmentNeeded: string;
    difficulty: 'Fácil' | 'Médio' | 'Difícil';
    gifEmoji: string;
    videoUrl?: string;
}

export interface Workout {
    id: string;
    name: string;
    focus: string;
    duration: string;
    difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
    exercises: Exercise[];
    caloriesEstimate: number;
    imageColor: string;
    description: string;
    warmup: string[];
    cooldown: string[];
}

// ===== TREINO ATIVO =====
export interface ActiveWorkoutState {
    workoutId: string;
    currentExerciseIndex: number;
    completedSets: Record<string, boolean[]>;
    startTime: number;
    isResting: boolean;
    restTimeRemaining: number;
}

// ===== IA =====
export interface AIMessage {
    id: string;
    role: 'user' | 'ai';
    content: string;
    timestamp: string;
}

export interface AIRecommendation {
    id: string;
    title: string;
    description: string;
    type: 'treino' | 'dieta' | 'descanso' | 'hidratacao';
    priority: 'alta' | 'media' | 'baixa';
    icon: string;
}

export interface WeeklyPlan {
    day: string;
    workoutName: string;
    focus: string;
    isRestDay: boolean;
}

// ===== IoT =====
export interface IoTData {
    heartRate: number;
    steps: number;
    activeMinutes: number;
    sleepHours: number;
    bodyTemp: number;
    lastSync: string;
}

// ===== HISTÓRICO =====
export interface WeightEntry {
    date: string;
    weight: number;
}

export interface WorkoutLog {
    id: string;
    workoutId: string;
    workoutName: string;
    completedAt: string;
    duration: string;
    caloriesBurned: number;
}

// ===== NUTRIÇÃO =====
export interface NutritionEntry {
    id: string;
    mealName: string;
    mealType: 'cafe_da_manha' | 'almoco' | 'lanche' | 'jantar' | 'snack';
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    time: string;
    icon: string;
}

export interface DailyNutrition {
    targetCalories: number;
    targetProtein: number;
    targetCarbs: number;
    targetFat: number;
    meals: NutritionEntry[];
}

export interface MealSuggestion {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    icon: string;
    description: string;
}

// ===== CONQUISTAS =====
export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    progress: number;
    target: number;
    unlocked: boolean;
    category: 'treino' | 'consistencia' | 'social' | 'nutricao' | 'especial';
    xpReward: number;
}

// ===== CALENDÁRIO =====
export interface CalendarDay {
    date: string;
    dayOfWeek: string;
    dayNumber: number;
    trained: boolean;
    workoutName?: string;
    isToday: boolean;
}

// ===== DESAFIOS =====
export interface Challenge {
    id: string;
    title: string;
    description: string;
    icon: string;
    progress: number;
    target: number;
    unit: string;
    deadline: string;
    xpReward: number;
    coinReward: number;
}

// ===== ADMIN =====
export interface AdminStats {
    totalUsers: number;
    activeToday: number;
    totalWorkouts: number;
    avgSessionMinutes: number;
    newUsersThisWeek: number;
    revenue: number;
}
