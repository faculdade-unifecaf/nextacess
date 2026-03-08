import React, { createContext, useState, ReactNode } from 'react';
import {
    User, UserStats, Workout, AIMessage, IoTData, WeightEntry,
    WorkoutLog, AIRecommendation, NutritionEntry, DailyNutrition,
    MealSuggestion, Achievement, CalendarDay, Challenge, WeeklyPlan,
    ActiveWorkoutState,
} from '../types/types';
import {
    initialUserStats, detailedWorkouts, initialAIMessages,
    iotData as mockIoTData, weightHistory as mockWeightHistory,
    workoutLogs as mockWorkoutLogs, aiRecommendations as mockRecommendations,
    mockUsers, aiResponses, dailyNutrition as mockNutrition,
    mealSuggestions as mockMealSuggestions, achievements as mockAchievements,
    weekCalendar as mockCalendar, activeChallenges as mockChallenges,
    weeklyPlan as mockWeeklyPlan,
} from '../data/mockData';

interface GlobalContextType {
    // Auth
    isAuthenticated: boolean;
    user: User | null;
    login: (email: string, password: string) => boolean;
    loginWithFace: () => void;
    logout: () => void;
    // Stats
    stats: UserStats;
    addWater: () => void;
    updateWeight: (weight: number) => void;
    // Workouts
    workouts: Workout[];
    workoutLogs: WorkoutLog[];
    completeWorkout: (workoutId: string) => void;
    // Active Workout
    activeWorkout: ActiveWorkoutState | null;
    startWorkout: (workoutId: string) => void;
    completeSet: (exerciseId: string, setIndex: number) => void;
    finishActiveWorkout: () => void;
    nextExercise: () => void;
    previousExercise: () => void;
    // IA
    aiMessages: AIMessage[];
    sendAIMessage: (message: string) => void;
    aiRecommendations: AIRecommendation[];
    weeklyPlan: WeeklyPlan[];
    // IoT
    iotData: IoTData;
    // Histórico
    weightHistory: WeightEntry[];
    // Nutrição
    dailyNutrition: DailyNutrition;
    addMeal: (meal: NutritionEntry) => void;
    removeMeal: (mealId: string) => void;
    mealSuggestions: MealSuggestion[];
    // Conquistas
    achievements: Achievement[];
    // Calendário
    weekCalendar: CalendarDay[];
    // Desafios
    challenges: Challenge[];
    // IMC
    calculateBMI: () => { value: number; classification: string; color: string };
}

export const GlobalContext = createContext<GlobalContextType>({} as GlobalContextType);

export function GlobalProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [stats, setStats] = useState<UserStats>(initialUserStats);
    const [workouts] = useState<Workout[]>(detailedWorkouts);
    const [logs, setLogs] = useState<WorkoutLog[]>(mockWorkoutLogs);
    const [activeWorkout, setActiveWorkout] = useState<ActiveWorkoutState | null>(null);
    const [aiMessages, setAiMessages] = useState<AIMessage[]>(initialAIMessages);
    const [recommendations] = useState<AIRecommendation[]>(mockRecommendations);
    const [iotDataState] = useState<IoTData>(mockIoTData);
    const [weightHist] = useState<WeightEntry[]>(mockWeightHistory);
    const [nutrition, setNutrition] = useState<DailyNutrition>(mockNutrition);
    const [achiev] = useState<Achievement[]>(mockAchievements);
    const [calendar] = useState<CalendarDay[]>(mockCalendar);
    const [challenges] = useState<Challenge[]>(mockChallenges);

    // ===== AUTH =====
    const login = (email: string, _password: string): boolean => {
        const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (foundUser) {
            setUser(foundUser);
            setIsAuthenticated(true);
            setStats(prev => ({ ...prev, name: foundUser.name, weight: foundUser.weight }));
            return true;
        }
        return false;
    };

    const loginWithFace = () => {
        const defaultUser = mockUsers[0];
        setUser(defaultUser);
        setIsAuthenticated(true);
        setStats(prev => ({ ...prev, name: defaultUser.name, weight: defaultUser.weight }));
    };

    const logout = () => { setUser(null); setIsAuthenticated(false); };

    // ===== WATER =====
    const addWater = () => {
        setStats(prev => ({ ...prev, waterIntake: Math.min(prev.waterIntake + 0.25, prev.waterGoal) }));
    };

    const updateWeight = (weight: number) => {
        setStats(prev => ({ ...prev, weight }));
    };

    // ===== WORKOUTS =====
    const completeWorkout = (workoutId: string) => {
        const workout = workouts.find(w => w.id === workoutId);
        if (!workout) return;
        const newLog: WorkoutLog = {
            id: String(logs.length + 1), workoutId, workoutName: workout.name,
            completedAt: new Date().toLocaleString('pt-BR'), duration: workout.duration,
            caloriesBurned: workout.caloriesEstimate,
        };
        setLogs(prev => [newLog, ...prev]);
        setStats(prev => ({ ...prev, xp: prev.xp + 50, caloriesBurned: prev.caloriesBurned + workout.caloriesEstimate, streak: prev.streak + 1 }));
    };

    // ===== ACTIVE WORKOUT =====
    const startWorkout = (workoutId: string) => {
        const workout = workouts.find(w => w.id === workoutId);
        if (!workout) return;
        const completedSets: Record<string, boolean[]> = {};
        workout.exercises.forEach(ex => { completedSets[ex.id] = Array(ex.sets).fill(false); });
        setActiveWorkout({ workoutId, currentExerciseIndex: 0, completedSets, startTime: Date.now(), isResting: false, restTimeRemaining: 0 });
    };

    const completeSet = (exerciseId: string, setIndex: number) => {
        if (!activeWorkout) return;
        setActiveWorkout(prev => {
            if (!prev) return prev;
            const updated = { ...prev, completedSets: { ...prev.completedSets } };
            updated.completedSets[exerciseId] = [...updated.completedSets[exerciseId]];
            updated.completedSets[exerciseId][setIndex] = true;
            return updated;
        });
    };

    const nextExercise = () => {
        if (!activeWorkout) return;
        const workout = workouts.find(w => w.id === activeWorkout.workoutId);
        if (!workout) return;
        if (activeWorkout.currentExerciseIndex < workout.exercises.length - 1) {
            setActiveWorkout(prev => prev ? { ...prev, currentExerciseIndex: prev.currentExerciseIndex + 1 } : prev);
        }
    };

    const previousExercise = () => {
        if (!activeWorkout) return;
        if (activeWorkout.currentExerciseIndex > 0) {
            setActiveWorkout(prev => prev ? { ...prev, currentExerciseIndex: prev.currentExerciseIndex - 1 } : prev);
        }
    };

    const finishActiveWorkout = () => {
        if (!activeWorkout) return;
        completeWorkout(activeWorkout.workoutId);
        setActiveWorkout(null);
    };

    // ===== IA =====
    const sendAIMessage = (message: string) => {
        const userMsg: AIMessage = { id: String(Date.now()), role: 'user', content: message, timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) };
        const lowerMsg = message.toLowerCase();
        let responseKey = 'default';
        if (lowerMsg.includes('treino') || lowerMsg.includes('exerc')) responseKey = 'treino';
        else if (lowerMsg.includes('peso') || lowerMsg.includes('emagrec')) responseKey = 'peso';
        else if (lowerMsg.includes('dieta') || lowerMsg.includes('comida') || lowerMsg.includes('prote')) responseKey = 'dieta';
        else if (lowerMsg.includes('descanso') || lowerMsg.includes('sono') || lowerMsg.includes('dorm')) responseKey = 'descanso';
        else if (lowerMsg.includes('caloria') || lowerMsg.includes('queimar')) responseKey = 'calorias';
        const aiMsg: AIMessage = { id: String(Date.now() + 1), role: 'ai', content: aiResponses[responseKey] || aiResponses['default'], timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) };
        setAiMessages(prev => [...prev, userMsg, aiMsg]);
    };

    // ===== NUTRIÇÃO =====
    const addMeal = (meal: NutritionEntry) => {
        setNutrition(prev => ({ ...prev, meals: [...prev.meals, meal] }));
    };

    const removeMeal = (mealId: string) => {
        setNutrition(prev => ({ ...prev, meals: prev.meals.filter(m => m.id !== mealId) }));
    };

    // ===== IMC =====
    const calculateBMI = () => {
        const heightM = (user?.height || 178) / 100;
        const bmi = stats.weight / (heightM * heightM);
        let classification = 'Normal';
        let color = '#22c55e';
        if (bmi < 18.5) { classification = 'Abaixo do peso'; color = '#3b82f6'; }
        else if (bmi < 25) { classification = 'Normal'; color = '#22c55e'; }
        else if (bmi < 30) { classification = 'Sobrepeso'; color = '#f59e0b'; }
        else { classification = 'Obesidade'; color = '#ef4444'; }
        return { value: parseFloat(bmi.toFixed(1)), classification, color };
    };

    return (
        <GlobalContext.Provider value={{
            isAuthenticated, user, login, loginWithFace, logout,
            stats, addWater, updateWeight,
            workouts, workoutLogs: logs, completeWorkout,
            activeWorkout, startWorkout, completeSet, finishActiveWorkout, nextExercise, previousExercise,
            aiMessages, sendAIMessage, aiRecommendations: recommendations, weeklyPlan: mockWeeklyPlan,
            iotData: iotDataState, weightHistory: weightHist,
            dailyNutrition: nutrition, addMeal, removeMeal, mealSuggestions: mockMealSuggestions,
            achievements: achiev, weekCalendar: calendar, challenges,
            calculateBMI,
        }}>
            {children}
        </GlobalContext.Provider>
    );
}