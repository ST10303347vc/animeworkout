import { Exercise, Sensei, DailyQuest, Workout } from '@/types';

export const MOCK_SENSEIS: Sensei[] = [
    {
        id: 'sensei_1',
        name: 'Goro',
        title: 'The Iron Peak',
        quote: '"Muscles are built with patience and destroyed with ego."',
        imagePath: '/assets/senseis/placeholder-goro.png',
        glowColor: 'bg-neon-gold text-glow-gold'
    },
    {
        id: 'sensei_2',
        name: 'Akira',
        title: 'The Wind Walker',
        quote: '"Speed without control is just a fast crash. Master your body."',
        imagePath: '/assets/senseis/placeholder-akira.png',
        glowColor: 'bg-neon-blue text-glow-blue'
    },
    {
        id: 'sensei_3',
        name: 'Mei',
        title: 'The Shadow Strike',
        quote: '"Gravity is just a suggestion. Let\'s fly."',
        imagePath: '/assets/senseis/placeholder-mei.png',
        glowColor: 'bg-neon-pink text-glow-pink'
    }
];

export const MOCK_EXERCISES: Exercise[] = [
    // Calisthenics
    {
        id: 'ex_1',
        name: 'Standard Push-up',
        muscleGroup: 'Chest',
        type: 'calisthenics',
        difficultyRank: 'E',
        description: 'The foundation of all pushing strength. Keep your core tight.'
    },
    {
        id: 'ex_2',
        name: 'Diamond Push-up',
        muscleGroup: 'Triceps',
        type: 'calisthenics',
        difficultyRank: 'D',
        description: 'Hands close together under the chest. Focuses heavily on the triceps.'
    },
    {
        id: 'ex_3',
        name: 'Pull-up',
        muscleGroup: 'Back',
        type: 'calisthenics',
        difficultyRank: 'C',
        description: 'Pull your body up until your chin clears the bar. The ultimate back builder.'
    },
    {
        id: 'ex_4',
        name: 'Muscle-up',
        muscleGroup: 'Full Body',
        type: 'calisthenics',
        difficultyRank: 'A',
        description: 'Explosive pull-up transitioning into a straight bar dip.'
    },
    // Gym
    {
        id: 'ex_5',
        name: 'Barbell Bench Press',
        muscleGroup: 'Chest',
        type: 'gym',
        difficultyRank: 'D',
        description: 'Classic horizontal push for maximum pec development.'
    },
    {
        id: 'ex_6',
        name: 'Barbell Squat',
        muscleGroup: 'Legs',
        type: 'gym',
        difficultyRank: 'C',
        description: 'The king of all leg exercises. Go below parallel if mobility allows.'
    },
    {
        id: 'ex_7',
        name: 'Deadlift',
        muscleGroup: 'Back/Legs',
        type: 'gym',
        difficultyRank: 'B',
        description: 'Pick heavy stuff off the floor. Builds the entire posterior chain.'
    }
];

export const MOCK_WORKOUTS: Workout[] = [
    {
        id: 'w_1',
        name: 'Beginner Push Routine',
        isCustom: false,
        exercises: [
            { id: 'we_1', exerciseId: 'ex_1', sets: 3, reps: 10, order: 1 },
            { id: 'we_2', exerciseId: 'ex_2', sets: 3, reps: 8, order: 2 },
        ]
    },
    {
        id: 'w_2',
        name: 'The Iron Path (Full Body)',
        isCustom: false,
        exercises: [
            { id: 'we_3', exerciseId: 'ex_6', sets: 4, reps: 8, order: 1 },
            { id: 'we_4', exerciseId: 'ex_5', sets: 4, reps: 8, order: 2 },
            { id: 'we_5', exerciseId: 'ex_7', sets: 3, reps: 5, order: 3 },
        ]
    }
];

const todayStr = new Date().toISOString().split('T')[0];

export const MOCK_QUESTS: DailyQuest[] = [
    {
        id: 'q_1',
        date: todayStr,
        pillar: 'physical',
        questDescription: 'Complete a Vanguard Workout',
        isCompleted: false,
        xpReward: 50
    },
    {
        id: 'q_2',
        date: todayStr,
        pillar: 'mental',
        questDescription: 'Read 10 pages of a book',
        isCompleted: false,
        xpReward: 30
    },
    {
        id: 'q_3',
        date: todayStr,
        pillar: 'wealth',
        questDescription: 'Complete 1 Deep Work session',
        isCompleted: false,
        xpReward: 40
    },
    {
        id: 'q_4',
        date: todayStr,
        pillar: 'vitality',
        questDescription: 'Drink 2L of Water',
        isCompleted: false,
        xpReward: 20
    }
];
