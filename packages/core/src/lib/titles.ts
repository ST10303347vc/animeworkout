import { Pillar } from '../types';

export const getUserTitle = (globalLevel: number, dominantPillar?: Pillar | 'neutral'): string => {
    let rank = 'Initiate';
    if (globalLevel >= 50) rank = 'Ascendant';
    else if (globalLevel >= 25) rank = 'Champion';
    else if (globalLevel >= 10) rank = 'Warrior';
    else if (globalLevel >= 5) rank = 'Novice';

    if (!dominantPillar || dominantPillar === 'neutral') return rank;

    const titles: Record<Pillar, string> = {
        physical: 'Vanguard',
        mental: 'Sage',
        wealth: 'Merchant',
        vitality: 'Guardian'
    };

    return `${rank} ${titles[dominantPillar as Pillar]}`;
};
