import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/stores/useStore';
import { MOCK_EXERCISES } from '@/data/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Plus, Save, GripVertical, Trash2 } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface BuilderExercise {
    id: string; // unique instance id
    exerciseId: string;
    sets: number;
    reps: number;
}

// Draggable Sortable Item Component
const SortableExerciseItem = ({ item, onRemove, onUpdate }: { item: BuilderExercise, onRemove: () => void, onUpdate: (updates: Partial<BuilderExercise>) => void }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const exerciseDetails = MOCK_EXERCISES.find(e => e.id === item.exerciseId)!;

    return (
        <div ref={setNodeRef} style={style} className="glass-panel p-4 mb-3 flex items-center justify-between group">
            <div className="flex items-center space-x-4">
                <div {...attributes} {...listeners} className="cursor-grab text-zinc-500 hover:text-white pb-1 pt-1">
                    <GripVertical size={20} />
                </div>
                <div>
                    <h4 className="text-white font-bold">{exerciseDetails.name}</h4>
                    <span className="text-xs text-zinc-400 uppercase tracking-widest">{exerciseDetails.muscleGroup}</span>
                </div>
            </div>

            <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                    <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Sets</span>
                    <input
                        type="number"
                        min="1"
                        max="10"
                        className="w-12 bg-zinc-900 border border-white/10 rounded px-2 py-1 text-white text-center"
                        value={item.sets}
                        onChange={(e) => onUpdate({ sets: parseInt(e.target.value) || 1 })}
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Reps</span>
                    <input
                        type="number"
                        min="1"
                        max="100"
                        className="w-14 bg-zinc-900 border border-white/10 rounded px-2 py-1 text-white text-center"
                        value={item.reps}
                        onChange={(e) => onUpdate({ reps: parseInt(e.target.value) || 10 })}
                    />
                </div>
                <button
                    onClick={onRemove}
                    className="text-zinc-600 hover:text-neon-pink transition-colors"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};


export const WorkoutBuilderPage = () => {
    const navigate = useNavigate();
    const addWorkout = useStore(state => state.addWorkout);

    const [routineName, setRoutineName] = useState('New Training Routine');
    const [selectedExercises, setSelectedExercises] = useState<BuilderExercise[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setSelectedExercises((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over?.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleAddExercise = (exerciseId: string) => {
        setSelectedExercises([
            ...selectedExercises,
            {
                id: `ex_${Date.now()}_${Math.random()}`,
                exerciseId,
                sets: 3,
                reps: 10
            }
        ]);
    };

    const handleRemoveExercise = (id: string) => {
        setSelectedExercises(selectedExercises.filter(ex => ex.id !== id));
    };

    const handleUpdateExercise = (id: string, updates: Partial<BuilderExercise>) => {
        setSelectedExercises(selectedExercises.map(ex => ex.id === id ? { ...ex, ...updates } : ex));
    };

    const handleSaveRoutine = () => {
        if (selectedExercises.length === 0) return;

        // Map BuilderExercise into the format expected by useStore
        const finalExercises = selectedExercises.map((ex, index) => ({
            id: ex.id,
            exerciseId: ex.exerciseId,
            sets: ex.sets,
            reps: ex.reps,
            order: index
        }));

        addWorkout(routineName, true, finalExercises);
        navigate('/dashboard');
    };

    const availableExercises = MOCK_EXERCISES.filter(ex => ex.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="min-h-screen bg-bg-dark pt-12 text-white flex flex-col">
            <header className="px-6 md:px-12 mb-8 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button onClick={() => navigate(-1)} className="text-zinc-400 hover:text-white transition-colors">
                        <ChevronLeft size={28} />
                    </button>
                    <div>
                        <input
                            type="text"
                            value={routineName}
                            onChange={(e) => setRoutineName(e.target.value)}
                            className="bg-transparent text-3xl font-extrabold text-white tracking-widest uppercase focus:outline-none border-b-2 border-transparent focus:border-neon-blue transition-colors px-0 py-1"
                        />
                        <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm mt-1">Custom Routine Builder</p>
                    </div>
                </div>

                <button
                    onClick={handleSaveRoutine}
                    disabled={selectedExercises.length === 0}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple font-black uppercase tracking-widest flex items-center shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_25px_rgba(181,56,255,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save className="mr-2" size={20} /> Save Routine
                </button>
            </header>

            <main className="flex-1 px-6 md:px-12 grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12 overflow-hidden">
                {/* Left Column: Drag/Drop Routine List */}
                <div className="lg:col-span-2 glass-panel p-6 overflow-y-auto">
                    <h2 className="text-xl font-bold mb-6 tracking-widest uppercase flex items-center">
                        <span className="w-2 h-2 rounded-full bg-neon-blue mr-3 shadow-[0_0_8px_rgba(0,240,255,0.8)]"></span>
                        Routine Flow
                    </h2>

                    {selectedExercises.length === 0 ? (
                        <div className="h-48 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-zinc-500">
                            <Plus size={32} className="mb-2 opacity-50" />
                            <p className="font-bold tracking-widest uppercase text-sm">Add exercises from the right</p>
                        </div>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={selectedExercises.map(e => e.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <AnimatePresence>
                                    {selectedExercises.map((exercise) => (
                                        <SortableExerciseItem
                                            key={exercise.id}
                                            item={exercise}
                                            onRemove={() => handleRemoveExercise(exercise.id)}
                                            onUpdate={(updates) => handleUpdateExercise(exercise.id, updates)}
                                        />
                                    ))}
                                </AnimatePresence>
                            </SortableContext>
                        </DndContext>
                    )}
                </div>

                {/* Right Column: Exercise Library */}
                <div className="glass-panel p-6 flex flex-col h-full overflow-hidden">
                    <h2 className="text-xl font-bold mb-6 tracking-widest uppercase flex items-center">
                        <span className="w-2 h-2 rounded-full bg-neon-pink mr-3 shadow-[0_0_8px_rgba(255,0,85,0.8)]"></span>
                        Exercise Library
                    </h2>

                    <input
                        type="search"
                        placeholder="Search exercises..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 mb-6 focus:outline-none focus:border-neon-pink transition-colors text-white"
                    />

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                        {availableExercises.map(exercise => (
                            <motion.div
                                key={exercise.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-zinc-900/50 hover:bg-zinc-800/80 p-4 rounded-xl border border-white/5 cursor-pointer flex items-center justify-between group"
                                onClick={() => handleAddExercise(exercise.id)}
                            >
                                <div>
                                    <h4 className="font-bold">{exercise.name}</h4>
                                    <span className="text-xs text-zinc-500 uppercase tracking-widest">{exercise.muscleGroup} • Rank {exercise.difficultyRank}</span>
                                </div>
                                <Plus className="text-zinc-600 group-hover:text-neon-pink transition-colors" size={20} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};
