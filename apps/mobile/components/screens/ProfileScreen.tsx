import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '@/stores/useStore';
import { getDominantAura, calculatePillarLevel, getUserTitle, MOCK_SENSEIS, ALL_PILLARS, ACHIEVEMENTS } from '@limit-break/core';
import type { Pillar } from '@limit-break/core';
import { useRouter } from 'expo-router';

const PILLAR_COLORS: Record<Pillar, string> = {
    physical: '#ff0055',
    mental: '#00f0ff',
    wealth: '#ffaa00',
    vitality: '#10b981',
};

export default function ProfileScreen() {
    const router = useRouter();
    const user = useStore(s => s.user);
    const logout = useStore(s => s.logout);
    const soundEnabled = useStore(s => s.soundEnabled);
    const toggleSound = useStore(s => s.toggleSound);

    if (!user) return null;

    const aura = getDominantAura(user.pillarXp);
    const title = getUserTitle(user.globalLevel || 1, aura.pillar);
    const sensei = MOCK_SENSEIS.find(s => s.id === user.senseiId);
    const unlockedCount = (user.unlockedAchievements || []).length;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>

            {/* Header with Back Button */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#fff" />
                </Pressable>
                <MotiView from={{ opacity: 0, translateY: -10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 500 }}>
                    <Text style={styles.pageTitle}>WARRIOR PROFILE</Text>
                </MotiView>
            </View>

            {/* Profile Card */}
            <MotiView
                from={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'timing', duration: 500, delay: 150 }}
                style={styles.profileCard}
            >
                <View style={[styles.avatar, { borderColor: aura.glowHex }]}>
                    <Text style={styles.avatarText}>{user.displayName?.[0]?.toUpperCase()}</Text>
                </View>
                <Text style={styles.displayName}>{user.displayName?.toUpperCase()}</Text>
                <Text style={[styles.titleText, { color: aura.glowHex }]}>{title.toUpperCase()}</Text>
                <Text style={styles.senseiText}>
                    Sensei: {sensei?.name || 'None'} • {sensei?.title || ''}
                </Text>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{user.globalLevel || 1}</Text>
                        <Text style={styles.statLabel}>LEVEL</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: aura.glowHex }]} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{user.globalXp || 0}</Text>
                        <Text style={styles.statLabel}>TOTAL XP</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: aura.glowHex }]} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>🔥 {user.currentStreak || 0}</Text>
                        <Text style={styles.statLabel}>STREAK</Text>
                    </View>
                </View>
            </MotiView>

            {/* Pillar Breakdown */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚡ PILLAR BREAKDOWN</Text>
                {ALL_PILLARS.map(pillar => {
                    const xp = user.pillarXp?.[pillar] || 0;
                    const level = calculatePillarLevel(xp);
                    return (
                        <View key={pillar} style={styles.pillarRow}>
                            <View style={[styles.pillarColorDot, { backgroundColor: PILLAR_COLORS[pillar] }]} />
                            <Text style={styles.pillarName}>{pillar.toUpperCase()}</Text>
                            <Text style={[styles.pillarXp, { color: PILLAR_COLORS[pillar] }]}>Lv.{level} • {xp} XP</Text>
                        </View>
                    );
                })}
            </View>

            {/* Achievements */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🏆 ACHIEVEMENTS ({unlockedCount}/{ACHIEVEMENTS.length})</Text>
                {ACHIEVEMENTS.map(ach => {
                    const unlocked = (user.unlockedAchievements || []).includes(ach.id);
                    return (
                        <View key={ach.id} style={[styles.achCard, !unlocked && styles.achLocked]}>
                            <Text style={styles.achTitle}>{unlocked ? '✅' : '🔒'} {ach.title}</Text>
                            <Text style={styles.achDesc}>{ach.description}</Text>
                        </View>
                    );
                })}
            </View>

            {/* Settings */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚙️ SETTINGS</Text>
                <Pressable style={styles.settingRow} onPress={toggleSound}>
                    <Ionicons name={soundEnabled ? 'volume-high' : 'volume-mute'} size={20} color="#888" />
                    <Text style={styles.settingLabel}>Sound Effects</Text>
                    <Text style={styles.settingValue}>{soundEnabled ? 'ON' : 'OFF'}</Text>
                </Pressable>
                <Pressable
                    style={[styles.settingRow, { borderColor: '#ff3333' }]}
                    onPress={() => {
                        Alert.alert(
                            'Logout & Delete All Data',
                            'This will permanently delete all your progress, XP, tasks, habits, workouts, and battle log. This cannot be undone. Are you sure?',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Delete & Logout',
                                    style: 'destructive',
                                    onPress: async () => {
                                        await logout();
                                        router.replace('/');
                                    },
                                },
                            ]
                        );
                    }}
                >
                    <Ionicons name="trash" size={20} color="#ff3333" />
                    <Text style={[styles.settingLabel, { color: '#ff3333' }]}>Logout & Delete All Data</Text>
                </Pressable>
            </View>

            <View style={{ height: 100 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0a14' },
    content: { paddingTop: 60, paddingHorizontal: 20 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingLeft: 8 },
    backButton: { position: 'absolute', left: -5, zIndex: 10, padding: 10 },
    pageTitle: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: 4, textAlign: 'center', flex: 1, marginLeft: 20 },
    profileCard: { backgroundColor: '#1a1a2e', borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#2a2a3e' },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#0f0f1e', justifyContent: 'center', alignItems: 'center', borderWidth: 3, marginBottom: 12 },
    avatarText: { fontSize: 32, fontWeight: '900', color: '#fff' },
    displayName: { fontSize: 20, fontWeight: '900', color: '#fff', letterSpacing: 3 },
    titleText: { fontSize: 13, fontWeight: '700', letterSpacing: 2, marginTop: 4 },
    senseiText: { color: '#555', fontSize: 12, marginTop: 8 },
    statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20, width: '100%', justifyContent: 'space-around' },
    statItem: { alignItems: 'center' },
    statValue: { color: '#fff', fontSize: 22, fontWeight: '900' },
    statLabel: { color: '#555', fontSize: 9, fontWeight: '700', letterSpacing: 2, marginTop: 2 },
    statDivider: { width: 1, height: 30, opacity: 0.3 },
    section: { marginTop: 28 },
    sectionTitle: { color: '#888', fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 12 },
    pillarRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1a1a2e' },
    pillarColorDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
    pillarName: { color: '#aaa', fontSize: 13, fontWeight: '700', letterSpacing: 2, flex: 1 },
    pillarXp: { fontSize: 13, fontWeight: '700' },
    achCard: { backgroundColor: '#1a1a2e', borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#2a2a3e' },
    achLocked: { opacity: 0.35 },
    achTitle: { color: '#ddd', fontSize: 14, fontWeight: '700' },
    achDesc: { color: '#777', fontSize: 12, marginTop: 2 },
    settingRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a2e', borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#2a2a3e', gap: 12 },
    settingLabel: { color: '#ddd', fontSize: 15, fontWeight: '600', flex: 1 },
    settingValue: { color: '#888', fontSize: 13, fontWeight: '700' },
});
