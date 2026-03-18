import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Achievement } from '../types/types';

interface AchievementCardProps {
    achievement: Achievement;
    onPress?: () => void;
}

export default function AchievementCard({ achievement, onPress }: AchievementCardProps) {
    const progress = Math.min((achievement.progress / achievement.target) * 100, 100);

    return (
        <TouchableOpacity
            style={[styles.card, achievement.unlocked && styles.cardUnlocked]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.row}>
                <Text style={styles.icon}>{achievement.icon}</Text>
                <View style={styles.content}>
                    <View style={styles.titleRow}>
                        <Text style={[styles.title, achievement.unlocked && styles.titleUnlocked]} numberOfLines={1}>{achievement.title}</Text>
                        {achievement.unlocked ? (
                            <Text style={styles.unlocked}>✅</Text>
                        ) : (
                            <Text style={styles.xp}>+{achievement.xpReward} XP</Text>
                        )}
                    </View>
                    <Text style={styles.desc} numberOfLines={1}>{achievement.description}</Text>
                    <View style={styles.barRow}>
                        <View style={styles.barBg}>
                            <View style={[styles.barFill, { width: `${progress}%`, backgroundColor: achievement.unlocked ? '#22c55e' : '#f59e0b' }]} />
                        </View>
                        <Text style={styles.progress}>{achievement.progress}/{achievement.target}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#121212',
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: '#27272a',
        marginBottom: 8,
    },
    cardUnlocked: {
        borderColor: 'rgba(34, 197, 94, 0.3)',
        backgroundColor: 'rgba(34, 197, 94, 0.05)',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },
    icon: { fontSize: 32 },
    content: { flex: 1 },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    title: {
        color: '#a1a1aa',
        fontSize: 14,
        fontWeight: 'bold',
        flex: 1
    },
    titleUnlocked: { color: '#ffffff' },
    desc: {
        color: '#52525b',
        fontSize: 11,
        marginTop: 2
    },
    barRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 8
    },
    barBg: {
        flex: 1,
        height: 6,
        backgroundColor: '#27272a',
        borderRadius: 3,
        overflow: 'hidden'
    },
    barFill: {
        height: '100%',
        borderRadius: 3
    },
    progress: {
        color: '#71717a',
        fontSize: 10,
        minWidth: 30,
        textAlign: 'right'
    },
    unlocked: { fontSize: 14 },
    xp: {
        color: '#f59e0b',
        fontSize: 11,
        fontWeight: 'bold'
    },
});
