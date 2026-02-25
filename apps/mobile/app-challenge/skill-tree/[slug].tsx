import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStore } from '@/stores/useStore';
import { MAIN_TASKS, Pillar } from '@limit-break/core';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const PILLAR_COLORS: Record<string, string> = {
    physical: '#ff0055',
    mental: '#00ccff',
    vitality: '#00ff66',
    wealth: '#ffaa00',
};

export default function SkillTreeScreen() {
    const { slug } = useLocalSearchParams<{ slug: string }>();
    const router = useRouter();
    const pillarStr = Array.isArray(slug) ? slug[0] : slug;

    // validate
    if (!['physical', 'mental', 'vitality', 'wealth'].includes(pillarStr || '')) {
        return null;
    }
    const pillar = pillarStr as Pillar;

    const user = useStore(s => s.user);
    const completeMainTask = useStore(s => s.completeMainTask);

    if (!user) return null;

    const color = PILLAR_COLORS[pillar];
    const tasks = MAIN_TASKS[pillar];
    const currentIndex = user.mainTaskProgress?.[pillar] || 0;

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#1a1a2e', `${color}15`, '#0a0a14']}
                style={StyleSheet.absoluteFillObject}
            />

            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="close" size={28} color="#fff" />
                </Pressable>
                <Text style={styles.headerTitle}>THE {pillar.toUpperCase()} TREE</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.timeline}>
                    {/* The continuous vertical line */}
                    <View style={[styles.timelineLine, { backgroundColor: `${color}30` }]} />

                    {tasks.map((taskText, index) => {
                        const isCompleted = index < currentIndex;
                        const isActive = index === currentIndex;
                        const isLocked = index > currentIndex;

                        let statusColor = isLocked ? '#444' : color;
                        let iconName: keyof typeof Ionicons.glyphMap = 'lock-closed';

                        if (isCompleted) {
                            iconName = 'checkmark-circle';
                        } else if (isActive) {
                            iconName = 'radio-button-on';
                        }

                        return (
                            <View key={index} style={[styles.taskRow, isLocked && { opacity: 0.6 }]}>
                                {/* Timeline Node */}
                                <View style={styles.nodeContainer}>
                                    <View style={[styles.node, { backgroundColor: isLocked ? '#222' : color, borderColor: statusColor, borderWidth: isActive ? 4 : 0 }]}>
                                        <Ionicons name={iconName} size={isCompleted ? 20 : 14} color={isCompleted ? '#fff' : (isLocked ? '#888' : '#1a1a2e')} />
                                    </View>
                                </View>

                                {/* Task Content */}
                                <View style={[
                                    styles.taskCard,
                                    isActive && { borderColor: color, borderWidth: 2, backgroundColor: 'rgba(0,0,0,0.6)' }
                                ]}>
                                    <View style={styles.tagRow}>
                                        <View style={[styles.taskTag, { backgroundColor: isLocked ? '#222' : `${color}20`, borderColor: isLocked ? '#444' : color }]}>
                                            <Text style={[styles.taskTagText, { color: isLocked ? '#888' : color }]}>TASK {index + 1}</Text>
                                        </View>

                                        {isActive && (
                                            <Pressable
                                                style={[styles.smallCompleteButton, { backgroundColor: color }]}
                                                onPress={() => completeMainTask(pillar)}
                                            >
                                                <Text style={styles.smallCompleteButtonText}>COMPLETE</Text>
                                            </Pressable>
                                        )}
                                    </View>

                                    <Text style={[
                                        styles.taskText,
                                        isCompleted && { color: '#888', textDecorationLine: 'line-through' },
                                        isActive && { color: '#fff', fontWeight: 'bold' }
                                    ]}>
                                        {taskText}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {currentIndex >= 15 && (
                    <View style={styles.masteryFooter}>
                        <Ionicons name="trophy" size={48} color="#ffd700" />
                        <Text style={styles.masteryTitle}>PILLAR MASTERED</Text>
                        <Text style={styles.masterySubtitle}>You have completed all foundational challenges.</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a14',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a3e',
        backgroundColor: 'rgba(10, 10, 20, 0.9)',
        zIndex: 10,
    },
    backButton: {
        marginRight: 16,
        padding: 4,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: 2,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 60,
    },
    timeline: {
        position: 'relative',
    },
    timelineLine: {
        position: 'absolute',
        left: 20,
        top: 0,
        bottom: 0,
        width: 3,
        borderRadius: 2,
    },
    taskRow: {
        flexDirection: 'row',
        marginBottom: 32,
        alignItems: 'flex-start',
    },
    nodeContainer: {
        width: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10, // Align node with the top of the card
    },
    node: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    taskCard: {
        flex: 1,
        backgroundColor: 'rgba(30, 30, 40, 0.7)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#2a2a3e',
        marginLeft: 8,
    },
    tagRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    taskTag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 100,
        borderWidth: 1,
    },
    taskTagText: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1.5,
    },
    taskText: {
        fontSize: 15,
        color: '#aaa',
        lineHeight: 22,
    },
    smallCompleteButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 100,
    },
    smallCompleteButtonText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1,
    },
    masteryFooter: {
        alignItems: 'center',
        marginTop: 40,
        padding: 24,
        backgroundColor: 'rgba(255, 215, 0, 0.05)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.2)',
    },
    masteryTitle: {
        color: '#ffd700',
        fontSize: 24,
        fontWeight: '900',
        letterSpacing: 3,
        marginTop: 16,
        marginBottom: 8,
    },
    masterySubtitle: {
        color: '#aaa',
        fontSize: 14,
        textAlign: 'center',
    }
});
