import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform } from 'react-native';
import { MotiView } from 'moti';
import { useStore } from '@/stores/useStore';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { AppMode, Pillar } from '@limit-break/core';

export default function AppModeScreen() {
    const router = useRouter();
    const setAppMode = useStore(s => s.setAppMode);
    const user = useStore(s => s.user);

    const [selectedMode, setSelectedMode] = useState<AppMode | null>(null);
    const [selectedPillars, setSelectedPillars] = useState<Pillar[]>([]);

    const handleSelectPillar = (pillar: Pillar) => {
        if (selectedPillars.includes(pillar)) {
            setSelectedPillars(prev => prev.filter(p => p !== pillar));
        } else {
            if (selectedPillars.length < 2) {
                setSelectedPillars(prev => [...prev, pillar]);
            }
        }
    };

    const handleContinue = () => {
        if (!selectedMode) return;

        let finalPillars: Pillar[] = [];
        if (selectedMode === 'tasks-only') {
            finalPillars = ['physical', 'mental'];
        } else if (selectedMode === 'full') {
            finalPillars = ['physical', 'mental', 'wealth', 'vitality'];
        } else if (selectedMode === 'custom') {
            if (selectedPillars.length !== 2) return;
            finalPillars = selectedPillars;
        }

        setAppMode(selectedMode, finalPillars);

        // The _layout auth guard will redirect automatically from here since `user.settings?.appMode` is now set.
    };

    const canContinue = selectedMode && (selectedMode !== 'custom' || selectedPillars.length === 2);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <MotiView from={{ opacity: 0, translateY: -20 }} animate={{ opacity: 1, translateY: 0 }} delay={100} style={styles.header}>
                <Text style={styles.title}>CHOOSE YOUR PATH</Text>
                <Text style={styles.subtitle}>How do you want to play?</Text>
            </MotiView>

            <MotiView from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} delay={200} style={styles.modesContainer}>
                {/* Tasks Only Mode */}
                <Pressable
                    style={[styles.modeCard, selectedMode === 'tasks-only' && styles.modeCardActive]}
                    onPress={() => { setSelectedMode('tasks-only'); setSelectedPillars([]); }}
                >
                    <View style={styles.modeIcon}>
                        <Ionicons name="list" size={24} color={selectedMode === 'tasks-only' ? '#fff' : '#888'} />
                    </View>
                    <View style={styles.modeInfo}>
                        <Text style={[styles.modeTitle, selectedMode === 'tasks-only' && styles.modeTitleActive]}>TASKS ONLY</Text>
                        <Text style={styles.modeDesc}>A clean experience focused strictly on Physical & Mental habits. Perfect for beginners.</Text>
                    </View>
                </Pressable>

                {/* Full Mode */}
                <Pressable
                    style={[styles.modeCard, selectedMode === 'full' && styles.modeCardActive]}
                    onPress={() => { setSelectedMode('full'); setSelectedPillars([]); }}
                >
                    <View style={styles.modeIcon}>
                        <Ionicons name="planet" size={24} color={selectedMode === 'full' ? '#00f0ff' : '#888'} />
                    </View>
                    <View style={styles.modeInfo}>
                        <Text style={[styles.modeTitle, selectedMode === 'full' && { color: '#00f0ff' }]}>FULL MMORPG</Text>
                        <Text style={styles.modeDesc}>Unlock all four pillars: Physical, Mental, Wealth, and Vitality. The ultimate lifestyle upgrade.</Text>
                    </View>
                </Pressable>

                {/* Custom Mode */}
                <Pressable
                    style={[styles.modeCard, selectedMode === 'custom' && styles.modeCardActive]}
                    onPress={() => setSelectedMode('custom')}
                >
                    <View style={styles.modeIcon}>
                        <Ionicons name="construct" size={24} color={selectedMode === 'custom' ? '#ffaa00' : '#888'} />
                    </View>
                    <View style={styles.modeInfo}>
                        <Text style={[styles.modeTitle, selectedMode === 'custom' && { color: '#ffaa00' }]}>CUSTOM BUILD</Text>
                        <Text style={styles.modeDesc}>Select any two pillars to focus your energy precisely where you need it most.</Text>
                    </View>
                </Pressable>
            </MotiView>

            {/* Custom Mode Pillar Selector */}
            {selectedMode === 'custom' && (
                <MotiView from={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 160 }} style={styles.customSelector}>
                    <Text style={styles.customTitle}>SELECT TWO PILLARS ({selectedPillars.length}/2)</Text>
                    <View style={styles.pillarGrid}>
                        {([
                            { id: 'physical', icon: 'barbell', color: '#ff0055' },
                            { id: 'mental', icon: 'bulb', color: '#00f0ff' },
                            { id: 'wealth', icon: 'wallet', color: '#ffaa00' },
                            { id: 'vitality', icon: 'heart', color: '#10b981' }
                        ] as const).map(p => {
                            const isSelected = selectedPillars.includes(p.id);
                            const isDisabled = !isSelected && selectedPillars.length >= 2;
                            return (
                                <Pressable
                                    key={p.id}
                                    style={[
                                        styles.pillarBtn,
                                        isSelected && { borderColor: p.color, backgroundColor: `${p.color}33` },
                                        isDisabled && { opacity: 0.3 }
                                    ]}
                                    onPress={() => handleSelectPillar(p.id)}
                                    disabled={isDisabled}
                                >
                                    <Ionicons name={p.icon as any} size={28} color={isSelected ? p.color : '#555'} />
                                    <Text style={[styles.pillarLabel, isSelected && { color: p.color }]}>{p.id}</Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </MotiView>
            )}

            <View style={{ height: 40 }} />

            {/* Continue Button */}
            <MotiView from={{ opacity: 0 }} animate={{ opacity: canContinue ? 1 : 0.4 }} style={{ width: '100%', marginVertical: 30 }}>
                <Pressable
                    style={[styles.submitBtn, !canContinue && styles.submitBtnDisabled]}
                    onPress={handleContinue}
                    disabled={!canContinue}
                >
                    <Text style={styles.submitText}>CONFIRM PATH</Text>
                </Pressable>
            </MotiView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: '#0a0a14', paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 80 : 60, paddingBottom: 40 },
    header: { alignItems: 'center', marginBottom: 40 },
    title: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 4, textAlign: 'center' },
    subtitle: { color: '#888', fontSize: 13, marginTop: 8, fontStyle: 'italic' },
    modesContainer: { gap: 16, width: '100%' },
    modeCard: { flexDirection: 'row', backgroundColor: '#1a1a2e', borderWidth: 2, borderColor: '#2a2a3e', borderRadius: 16, padding: 20, alignItems: 'center' },
    modeCardActive: { borderColor: '#fff', backgroundColor: '#222' },
    modeIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    modeInfo: { flex: 1 },
    modeTitle: { color: '#888', fontSize: 16, fontWeight: '900', letterSpacing: 2, marginBottom: 4 },
    modeTitleActive: { color: '#fff' },
    modeDesc: { color: '#aaa', fontSize: 12, lineHeight: 18 },
    customSelector: { marginTop: 30, width: '100%' },
    customTitle: { color: '#ffaa00', fontSize: 11, fontWeight: '800', letterSpacing: 2, textAlign: 'center', marginBottom: 16 },
    pillarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
    pillarBtn: { width: '48%', backgroundColor: '#1a1a2e', borderWidth: 2, borderColor: '#2a2a3e', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
    pillarLabel: { color: '#888', fontSize: 10, fontWeight: '800', letterSpacing: 2, marginTop: 8, textTransform: 'uppercase' },
    submitBtn: { backgroundColor: '#fff', paddingVertical: 18, borderRadius: 12, alignItems: 'center', shadowColor: '#fff', shadowOpacity: 0.3, shadowRadius: 10 },
    submitBtnDisabled: { backgroundColor: '#333', shadowOpacity: 0 },
    submitText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 3 }
});
