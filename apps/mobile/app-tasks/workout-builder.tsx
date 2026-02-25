import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '@/stores/useStore';
import { useRouter } from 'expo-router';
import { MOCK_EXERCISES } from '@limit-break/core';

interface BuilderExercise {
    id: string; // unique instance id
    exerciseId: string;
    customName?: string;
    sets: number;
    reps: number;
}

export default function WorkoutBuilderScreen() {
    const router = useRouter();
    const addWorkout = useStore(s => s.addWorkout);

    const [routineName, setRoutineName] = useState('New Training Routine');
    const [selectedExercises, setSelectedExercises] = useState<BuilderExercise[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showLibrary, setShowLibrary] = useState(false);

    const handleAddExercise = (exerciseId: string, customName?: string) => {
        setSelectedExercises([
            ...selectedExercises,
            {
                id: `ex_${Date.now()}_${Math.random()}`,
                exerciseId,
                customName,
                sets: 3,
                reps: 10
            }
        ]);
        setSearchTerm('');
        setShowLibrary(false);
    };

    const handleRemoveExercise = (id: string) => {
        setSelectedExercises(selectedExercises.filter(ex => ex.id !== id));
    };

    const handleUpdateExercise = (id: string, field: 'sets' | 'reps', increment: boolean) => {
        setSelectedExercises(selectedExercises.map(ex => {
            if (ex.id !== id) return ex;
            const updated = { ...ex };
            if (field === 'sets') {
                updated.sets = Math.max(1, Math.min(10, updated.sets + (increment ? 1 : -1)));
            } else {
                updated.reps = Math.max(1, Math.min(100, updated.reps + (increment ? 1 : -1)));
            }
            return updated;
        }));
    };

    const handleSaveRoutine = () => {
        if (selectedExercises.length === 0) return;

        const finalExercises = selectedExercises.map((ex, index) => ({
            id: ex.id,
            exerciseId: ex.exerciseId,
            customName: ex.customName,
            sets: ex.sets,
            reps: ex.reps,
            order: index
        }));

        addWorkout(routineName, true, finalExercises);
        router.back();
    };

    const availableExercises = MOCK_EXERCISES.filter(ex => ex.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={15}>
                        <Ionicons name="chevron-down" size={28} color="#888" />
                    </Pressable>
                    <View style={styles.headerTitleContainer}>
                        <View style={styles.titleInputRow}>
                            <TextInput
                                style={styles.routineNameInput}
                                value={routineName}
                                onChangeText={setRoutineName}
                                placeholder="Routine Name"
                                placeholderTextColor="#555"
                                maxLength={25}
                            />
                            <Ionicons name="pencil" size={14} color="#555" />
                        </View>
                        <Text style={styles.subtitle}>Custom Routine Builder</Text>
                    </View>
                </View>
                <Pressable
                    style={[styles.saveBtn, selectedExercises.length === 0 && styles.saveBtnDisabled]}
                    onPress={handleSaveRoutine}
                    disabled={selectedExercises.length === 0}
                >
                    <Ionicons name="save" size={16} color={selectedExercises.length === 0 ? "#555" : "#fff"} />
                    <Text style={[styles.saveText, selectedExercises.length === 0 && { color: '#555' }]}>SAVE</Text>
                </Pressable>
            </View>

            {/* Toggle Library / Routine */}
            <View style={styles.toggleRow}>
                <Pressable style={[styles.toggleBtn, !showLibrary && styles.toggleBtnActive]} onPress={() => setShowLibrary(false)}>
                    <Text style={[styles.toggleText, !showLibrary && styles.toggleTextActive]}>ROUTINE FLOW</Text>
                </Pressable>
                <Pressable style={[styles.toggleBtn, showLibrary && styles.toggleBtnActive]} onPress={() => setShowLibrary(true)}>
                    <Text style={[styles.toggleText, showLibrary && styles.toggleTextActive]}>EXERCISE LIBRARY</Text>
                </Pressable>
            </View>

            {showLibrary ? (
                // EXERCISE LIBRARY
                <MotiView from={{ opacity: 0, translateX: 20 }} animate={{ opacity: 1, translateX: 0 }} style={styles.contentArea}>
                    <TextInput
                        style={styles.searchInput}
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                        placeholder="Search exercises..."
                        placeholderTextColor="#555"
                    />
                    <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                        {availableExercises.map(exercise => (
                            <Pressable
                                key={exercise.id}
                                style={styles.libCard}
                                onPress={() => handleAddExercise(exercise.id)}
                            >
                                <View style={styles.libInfo}>
                                    <Text style={styles.libName}>{exercise.name}</Text>
                                    <Text style={styles.libDetail}>{exercise.muscleGroup} • Rank {exercise.difficultyRank}</Text>
                                </View>
                                <Ionicons name="add-circle" size={24} color="#ff0055" />
                            </Pressable>
                        ))}
                        {searchTerm.trim().length > 0 && (
                            <Pressable
                                style={[styles.libCard, { borderColor: '#ff0055', borderStyle: 'dashed' }]}
                                onPress={() => handleAddExercise('custom', searchTerm.trim())}
                            >
                                <View style={styles.libInfo}>
                                    <Text style={styles.libName}>"{searchTerm.trim()}"</Text>
                                    <Text style={styles.libDetail}>CUSTOM EXERCISE</Text>
                                </View>
                                <Ionicons name="add-circle" size={24} color="#ff0055" />
                            </Pressable>
                        )}
                    </ScrollView>
                </MotiView>
            ) : (
                // ROUTINE FLOW
                <MotiView from={{ opacity: 0, translateX: -20 }} animate={{ opacity: 1, translateX: 0 }} style={styles.contentArea}>
                    {selectedExercises.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="barbell-outline" size={48} color="#333" />
                            <Text style={styles.emptyText}>Add exercises from the library</Text>
                            <Pressable style={styles.addFirstBtn} onPress={() => setShowLibrary(true)}>
                                <Text style={styles.addFirstText}>OPEN LIBRARY</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                            <AnimatePresence>
                                {selectedExercises.map((item, index) => {
                                    const exerciseDetails = item.exerciseId === 'custom'
                                        ? { name: item.customName || 'Custom Exercise', muscleGroup: 'CUSTOM' }
                                        : MOCK_EXERCISES.find(e => e.id === item.exerciseId) || { name: 'Unknown', muscleGroup: 'Unknown' };

                                    return (
                                        <MotiView
                                            key={item.id}
                                            from={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            style={styles.routineCard}
                                        >
                                            <View style={styles.routineHeader}>
                                                <View style={styles.routineNumberBadge}>
                                                    <Text style={styles.routineNumber}>{index + 1}</Text>
                                                </View>
                                                <View style={{ flex: 1, marginLeft: 10 }}>
                                                    <Text style={styles.routineName}>{exerciseDetails.name}</Text>
                                                    <Text style={styles.routineDetail}>{exerciseDetails.muscleGroup}</Text>
                                                </View>
                                                <Pressable onPress={() => handleRemoveExercise(item.id)} hitSlop={10}>
                                                    <Ionicons name="trash" size={20} color="#ff3333" />
                                                </Pressable>
                                            </View>

                                            <View style={styles.routineControls}>
                                                <View style={styles.controlGroup}>
                                                    <Text style={styles.controlLabel}>SETS</Text>
                                                    <View style={styles.stepper}>
                                                        <Pressable onPress={() => handleUpdateExercise(item.id, 'sets', false)} style={styles.stepBtn}>
                                                            <Ionicons name="remove" size={16} color="#fff" />
                                                        </Pressable>
                                                        <Text style={styles.stepValue}>{item.sets}</Text>
                                                        <Pressable onPress={() => handleUpdateExercise(item.id, 'sets', true)} style={styles.stepBtn}>
                                                            <Ionicons name="add" size={16} color="#fff" />
                                                        </Pressable>
                                                    </View>
                                                </View>
                                                <View style={styles.controlSeparator} />
                                                <View style={styles.controlGroup}>
                                                    <Text style={styles.controlLabel}>REPS</Text>
                                                    <View style={styles.stepper}>
                                                        <Pressable onPress={() => handleUpdateExercise(item.id, 'reps', false)} style={styles.stepBtn}>
                                                            <Ionicons name="remove" size={16} color="#fff" />
                                                        </Pressable>
                                                        <Text style={styles.stepValue}>{item.reps}</Text>
                                                        <Pressable onPress={() => handleUpdateExercise(item.id, 'reps', true)} style={styles.stepBtn}>
                                                            <Ionicons name="add" size={16} color="#fff" />
                                                        </Pressable>
                                                    </View>
                                                </View>
                                            </View>
                                        </MotiView>
                                    );
                                })}
                            </AnimatePresence>
                        </ScrollView>
                    )}
                </MotiView>
            )}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0a14', paddingTop: Platform.OS === 'ios' ? 60 : 40 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 20 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 },
    headerTitleContainer: { flex: 1 },
    titleInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
        borderWidth: 1,
        borderColor: '#ff0055',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        alignSelf: 'stretch',
        marginBottom: 6
    },
    backBtn: { marginRight: 12, padding: 4 },
    routineNameInput: { fontSize: 16, fontWeight: '800', color: '#fff', textTransform: 'uppercase', letterSpacing: 1, padding: 0, marginRight: 6, flex: 1 },
    subtitle: { color: '#888', fontSize: 10, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 },
    saveBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ff0055', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, gap: 6 },
    saveBtnDisabled: { backgroundColor: '#1a1a2e' },
    saveText: { color: '#000', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
    toggleRow: { flexDirection: 'row', marginHorizontal: 20, backgroundColor: '#1a1a2e', borderRadius: 10, padding: 4, marginBottom: 20 },
    toggleBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
    toggleBtnActive: { backgroundColor: '#2a2a3e' },
    toggleText: { color: '#555', fontSize: 11, fontWeight: '800', letterSpacing: 2 },
    toggleTextActive: { color: '#fff' },
    contentArea: { flex: 1, paddingHorizontal: 20 },
    // Library
    searchInput: { backgroundColor: '#1a1a2e', borderWidth: 1, borderColor: '#333', borderRadius: 10, padding: 14, color: '#fff', fontSize: 14, marginBottom: 16 },
    libCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a2e', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#2a2a3e', marginBottom: 10 },
    libInfo: { flex: 1 },
    libName: { color: '#fff', fontSize: 16, fontWeight: '800' },
    libDetail: { color: '#888', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginTop: 4, textTransform: 'uppercase' },
    // Routine
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { color: '#555', fontSize: 12, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase', marginTop: 16, marginBottom: 24 },
    addFirstBtn: { backgroundColor: '#1a1a2e', borderWidth: 1, borderColor: '#ff0055', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
    addFirstText: { color: '#ff0055', fontSize: 12, fontWeight: '900', letterSpacing: 2 },
    routineCard: { backgroundColor: '#1a1a2e', borderRadius: 12, borderWidth: 1, borderColor: '#2a2a3e', padding: 16, marginBottom: 16 },
    routineHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    routineNumberBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#ff0055', justifyContent: 'center', alignItems: 'center' },
    routineNumber: { color: '#000', fontSize: 12, fontWeight: '900' },
    routineName: { color: '#fff', fontSize: 16, fontWeight: '800' },
    routineDetail: { color: '#888', fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 },
    routineControls: { flexDirection: 'row', backgroundColor: '#0f0f1e', borderRadius: 8, padding: 12 },
    controlGroup: { flex: 1, alignItems: 'center' },
    controlSeparator: { width: 1, backgroundColor: '#2a2a3e' },
    controlLabel: { color: '#555', fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 8 },
    stepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    stepBtn: { backgroundColor: '#2a2a3e', width: 28, height: 28, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
    stepValue: { color: '#fff', fontSize: 16, fontWeight: '900', fontVariant: ['tabular-nums'], width: 24, textAlign: 'center' },
});
