import { Pillar } from '../types';

export interface SkillNode {
    id: string;
    name: string;
    description: string;
    requiredLevel: number;
    icon?: any;
    reqNodes: string[]; // IDs of nodes that must be unlocked first
}

export interface SkillTreeDef {
    id: string;
    name: string;
    color: string;
    pillar?: Pillar;
    nodes: SkillNode[];
}

export const SKILL_TREES: SkillTreeDef[] = [
    {
        id: 'st_push',
        name: 'The Push Paradigm',
        color: 'neon-pink',
        pillar: 'physical',
        nodes: [
            {
                id: 'sk_pushup',
                name: 'Standard Pushup',
                description: 'The foundation of all pushing strength.',
                requiredLevel: 1,
                reqNodes: []
            },
            {
                id: 'sk_diamond',
                name: 'Diamond Pushup',
                description: 'Focuses power into the triceps and inner chest.',
                requiredLevel: 3,
                reqNodes: ['sk_pushup']
            },
            {
                id: 'sk_archer',
                name: 'Archer Pushup',
                description: 'Unilateral loading to simulate one-arm pushing.',
                requiredLevel: 6,
                reqNodes: ['sk_diamond']
            },
            {
                id: 'sk_onearm',
                name: 'One-Arm Pushup',
                description: 'Total mastery of terrestrial gravity.',
                requiredLevel: 10,
                reqNodes: ['sk_archer']
            },
            {
                id: 'sk_planche',
                name: 'Planche',
                description: 'Defy physics. Float above the earth.',
                requiredLevel: 15,
                reqNodes: ['sk_onearm']
            }
        ]
    },
    {
        id: 'st_pull',
        name: 'The Pull Ascension',
        color: 'neon-pink',
        pillar: 'physical',
        nodes: [
            {
                id: 'sk_pullup',
                name: 'Standard Pullup',
                description: 'Pull your own weight.',
                requiredLevel: 1,
                reqNodes: []
            },
            {
                id: 'sk_lsit_pullup',
                name: 'L-Sit Pullup',
                description: 'Engage the core while ascending.',
                requiredLevel: 4,
                reqNodes: ['sk_pullup']
            },
            {
                id: 'sk_muscleup',
                name: 'Muscle Up',
                description: 'Transition from pull to push in mid-air.',
                requiredLevel: 8,
                reqNodes: ['sk_lsit_pullup']
            },
            {
                id: 'sk_frontlever',
                name: 'Front Lever',
                description: 'Hold the body parallel to the ground using only lat strength.',
                requiredLevel: 12,
                reqNodes: ['sk_muscleup']
            }
        ]
    },
    {
        id: 'st_mental',
        name: 'The Scholar Path',
        color: 'neon-blue',
        pillar: 'mental',
        nodes: [
            { id: 'sk_read', name: 'Novice Reader', description: 'Read 1 book.', requiredLevel: 1, reqNodes: [] },
            { id: 'sk_speed', name: 'Speed Reading', description: 'Double your ingestion rate.', requiredLevel: 5, reqNodes: ['sk_read'] },
            { id: 'sk_synthesize', name: 'Thought Synthesis', description: 'Combine ideas across domains.', requiredLevel: 10, reqNodes: ['sk_speed'] },
        ]
    },
    {
        id: 'st_wealth',
        name: 'The Merchant Code',
        color: 'neon-gold',
        pillar: 'wealth',
        nodes: [
            { id: 'sk_budget', name: 'Basic Budgeting', description: 'Track every expense.', requiredLevel: 1, reqNodes: [] },
            { id: 'sk_invest', name: 'Market Investor', description: 'Deploy capital for growth.', requiredLevel: 5, reqNodes: ['sk_budget'] },
            { id: 'sk_founder', name: 'Empire Builder', description: 'Create scalable systems.', requiredLevel: 10, reqNodes: ['sk_invest'] },
        ]
    },
    {
        id: 'st_vitality',
        name: 'The Restorative Arts',
        color: 'emerald-400',
        pillar: 'vitality',
        nodes: [
            { id: 'sk_sleep', name: 'Circadian Rhythm', description: 'Wake without alarms.', requiredLevel: 1, reqNodes: [] },
            { id: 'sk_fast', name: 'Intermittent Fast', description: 'Control your metabolic state.', requiredLevel: 5, reqNodes: ['sk_sleep'] },
            { id: 'sk_zen', name: 'Unbreakable Calm', description: 'Stress no longer affects you.', requiredLevel: 10, reqNodes: ['sk_fast'] },
        ]
    },
    {
        id: 'st_mental_mindful',
        name: 'The Mindful Practitioner',
        color: 'neon-purple',
        pillar: 'mental',
        nodes: [
            { id: 'sk_meditate', name: 'Still Water', description: 'Meditate for 10 minutes continuously.', requiredLevel: 1, reqNodes: [] },
            { id: 'sk_focus', name: 'Deep Focus', description: 'Maintain unbreakable flow state.', requiredLevel: 6, reqNodes: ['sk_meditate'] },
            { id: 'sk_ego', name: 'Ego Dissolution', description: 'Separate the observer from the observed.', requiredLevel: 15, reqNodes: ['sk_focus'] },
        ]
    },
    {
        id: 'st_wealth_investor',
        name: 'The Asset Allocator',
        color: 'neon-gold',
        pillar: 'wealth',
        nodes: [
            { id: 'sk_save', name: 'Emergency Fund', description: 'Build a 3-month strategic reserve.', requiredLevel: 2, reqNodes: [] },
            { id: 'sk_dividends', name: 'Yield Farming', description: 'Reinvest all continuous cash flows.', requiredLevel: 8, reqNodes: ['sk_save'] },
            { id: 'sk_compound', name: 'The Eighth Wonder', description: 'Master geometric progression of capital.', requiredLevel: 20, reqNodes: ['sk_dividends'] },
        ]
    },
    {
        id: 'st_vitality_endurance',
        name: 'The Endless Engine',
        color: 'emerald-400',
        pillar: 'vitality',
        nodes: [
            { id: 'sk_walk', name: 'Constant Motion', description: 'Hit 10,000 steps daily.', requiredLevel: 2, reqNodes: [] },
            { id: 'sk_run', name: 'The Runner\'s High', description: 'Sustain zone 2 cardio for 45 minutes.', requiredLevel: 7, reqNodes: ['sk_walk'] },
            { id: 'sk_vo2max', name: 'Aerobic Supremacy', description: 'Maximize your VO2 Max limit.', requiredLevel: 14, reqNodes: ['sk_run'] },
        ]
    }
];
