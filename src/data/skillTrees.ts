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
    nodes: SkillNode[];
}

export const SKILL_TREES: SkillTreeDef[] = [
    {
        id: 'st_push',
        name: 'The Push Paradigm',
        color: 'neon-pink',
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
        color: 'neon-blue',
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
    }
];
