import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useStore } from '@/stores/useStore';
import { Pillar, MAIN_TASKS, ALL_PILLARS } from '@limit-break/core';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const PILLAR_COLORS: Record<Pillar, string> = {
    physical: '#ff0055',
    mental: '#00ccff',
    vitality: '#00ff66',
    wealth: '#ffaa00',
};

const PILLAR_ICONS: Record<Pillar, keyof typeof Ionicons.glyphMap> = {
    physical: 'barbell',
    mental: 'book',
    vitality: 'leaf',
    wealth: 'diamond',
};

export default function MainTasksTab() {
    const user = useStore(s => s.user);
    const completeMainTask = useStore(s => s.completeMainTask);
    const router = useRouter();

    if (!user) return null;

    const progress = user.mainTaskProgress || { physical: 0, mental: 0, wealth: 0, vitality: 0 };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.headerTitle}> MAIN TASKS</Text>
            <Text style={styles.subtitle}>Complete these challenges to advance your skill tree.</Text>

            {ALL_PILLARS.map(pillar => {
                const currentIndex = progress[pillar] || 0;
                const isMaxed = currentIndex >= 15;
                const tasks = MAIN_TASKS[pillar];
                const currentTaskText = isMaxed ? "You have mastered this pillar's foundational tasks!" : tasks[currentIndex];
                const color = PILLAR_COLORS[pillar];

                return (
                    <Pressable
                        key={pillar}
                        style={({ pressed }) => [
                            styles.cardWrapper,
                            { transform: [{ scale: pressed ? 0.98 : 1 }] }
                        ]}
                        onPress={() => router.push(`/skill-tree/${pillar}` as any)}
                    >
                        <LinearGradient
                            colors={[`${color}25`, '#1a1a2e']}
                            style={styles.cardBackground}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />
                        <View style={styles.cardContent}>
                            <View style={styles.cardHeader}>
                                <Ionicons name={PILLAR_ICONS[pillar]} size={24} color={color} />
                                <Text style={[styles.pillarTitle, { color }]}>
                                    THE {pillar.toUpperCase()} PILLAR
                                </Text>
                            </View>

                            <View style={[styles.taskContainer, { borderLeftColor: color }]}>
                                {!isMaxed && (
                                    <View style={[styles.taskTag, { backgroundColor: `${color}20`, borderColor: color }]}>
                                        <Ionicons name="flash" size={12} color={color} />
                                        <Text style={[styles.taskTagText, { color }]}>TASK {currentIndex + 1} OF 15</Text>
                                    </View>
                                )}
                                <Text style={styles.taskText}>{currentTaskText}</Text>
                            </View>

                            {!isMaxed ? (
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.completeButton,
                                        { backgroundColor: color, opacity: pressed ? 0.8 : 1 }
                                    ]}
                                    onPress={(e) => {
                                        e.stopPropagation(); // prevent card click
                                        completeMainTask(pillar);
                                    }}
                                >
                                    <Text style={styles.completeButtonText}>COMPLETE TASK</Text>
                                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                </Pressable>
                            ) : (
                                <View style={styles.maxedContainer}>
                                    <Ionicons name="trophy" size={24} color="#ffd700" />
                                    <Text style={styles.maxedText}>MASTERED</Text>
                                </View>
                            )}
                        </View>
                    </Pressable>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a14',
    },
    content: {
        padding: 16,
        paddingTop: 60,
        paddingBottom: 100,
        gap: 20,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 2,
    },
    subtitle: {
        fontSize: 16,
        color: '#888',
        marginBottom: 10,
    },
    cardWrapper: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#2a2a3e',
    },
    cardBackground: {
        ...StyleSheet.absoluteFillObject,
    },
    cardContent: {
        padding: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    pillarTitle: {
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 2,
    },
    taskContainer: {
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        borderLeftWidth: 4,
    },
    taskTag: {
        flexDirection: 'row',
        alignSelf: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 100,
        borderWidth: 1,
        marginBottom: 12,
        gap: 4,
    },
    taskTagText: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    taskText: {
        fontSize: 17,
        fontWeight: '500',
        color: '#f3f4f6',
        lineHeight: 24,
        letterSpacing: 0.5,
    },
    completeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    completeButtonText: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 14,
        letterSpacing: 1,
    },
    maxedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.3)',
    },
    maxedText: {
        color: '#ffd700',
        fontWeight: '900',
        letterSpacing: 2,
    }
});
