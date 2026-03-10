/**
 * Atomic Habits book structure — sections + chapters with per-chapter XP
 * weighted by PDF content size. Section title-pages earn 0 XP.
 */

export interface BookSection {
    id: string;
    title: string;
    chapters: BookChapter[];
}

export interface BookChapter {
    id: string;
    title: string;
    pdfFile: string;
    xpReward: number;
    isSection?: boolean;       // true = section title page (non-completable divider)
}

// ── XP is scaled roughly by PDF size:
//   ~160 KB → 8 XP   (short chapters)
//   ~330 KB → 15 XP   (medium chapters)
//   ~550 KB → 22 XP   (meaty chapters)
//   ~680 KB → 25 XP   (long chapters)
//   ~3.4 MB → 40 XP   (conclusion + appendices)

export const ATOMIC_HABITS_SECTIONS: BookSection[] = [
    {
        id: 'sec-fundamentals',
        title: 'The Fundamentals',
        chapters: [
            { id: 'ah-ch01', title: 'The Surprising Power of Atomic Habits', pdfFile: '01_The Surprising Power of Atomic Habits.pdf', xpReward: 15 },
            { id: 'ah-ch02', title: 'How Your Habits Shape Your Identity (and Vice Versa)', pdfFile: '02_How Your Habits Shape Your Identity (and Vice Versa).pdf', xpReward: 25 },
            { id: 'ah-ch03', title: 'How to Build Better Habits in 4 Simple Steps', pdfFile: '03_How to Build Better Habits in 4 Simple Steps.pdf', xpReward: 12 },
        ],
    },
    {
        id: 'sec-law1',
        title: 'The 1st Law — Make It Obvious',
        chapters: [
            { id: 'ah-ch04', title: 'The Man Who Didn\'t Look Right', pdfFile: '04_The Man Who Didn\'t Look Right.pdf', xpReward: 8 },
            { id: 'ah-ch05', title: 'The Best Way to Start a New Habit', pdfFile: '05_The Best Way to Start a New Habit.pdf', xpReward: 12 },
            { id: 'ah-ch06', title: 'Motivation Is Overrated; Environment Often Matters More', pdfFile: '06_Motivation Is Overrated; Environment Often Matters More.pdf', xpReward: 12 },
            { id: 'ah-ch07', title: 'The Secret to Self-Control', pdfFile: '07_The Secret to Self-Control.pdf', xpReward: 8 },
        ],
    },
    {
        id: 'sec-law2',
        title: 'The 2nd Law — Make It Attractive',
        chapters: [
            { id: 'ah-ch08', title: 'How to Make a Habit Irresistible', pdfFile: '08_How to Make a Habit Irresistible.pdf', xpReward: 22 },
            { id: 'ah-ch09', title: 'The Role of Family and Friends in Shaping Your Habits', pdfFile: '09_The Role of Family and Friends in Shaping Your Habits.pdf', xpReward: 12 },
            { id: 'ah-ch10', title: 'How to Find and Fix the Causes of Your Bad Habits', pdfFile: '10_How to Find and Fix the Causes of Your Bad Habits.pdf', xpReward: 8 },
        ],
    },
    {
        id: 'sec-law3',
        title: 'The 3rd Law — Make It Easy',
        chapters: [
            { id: 'ah-ch11', title: 'Walk Slowly, but Never Backward', pdfFile: '11_Walk Slowly, but Never Backward.pdf', xpReward: 15 },
            { id: 'ah-ch12', title: 'The Law of Least Effort', pdfFile: '12_The Law of Least Effort.pdf', xpReward: 12 },
            { id: 'ah-ch13', title: 'How to Stop Procrastinating by Using the Two-Minute Rule', pdfFile: '13_How to Stop Procrastinating by Using the Two-Minute Rule.pdf', xpReward: 15 },
            { id: 'ah-ch14', title: 'How to Make Good Habits Inevitable and Bad Habits Impossible', pdfFile: '14_How to Make Good Habits Inevitable and Bad Habits Impossible.pdf', xpReward: 8 },
        ],
    },
    {
        id: 'sec-law4',
        title: 'The 4th Law — Make It Satisfying',
        chapters: [
            { id: 'ah-ch15', title: 'The Cardinal Rule of Behavior Change', pdfFile: '15_The Cardinal Rule of Behavior Change.pdf', xpReward: 8 },
            { id: 'ah-ch16', title: 'How to Stick with Good Habits Every Day', pdfFile: '16_How to Stick with Good Habits Every Day.pdf', xpReward: 8 },
            { id: 'ah-ch17', title: 'How an Accountability Partner Can Change Everything', pdfFile: '17_How an Accountability Partner Can Change Everything.pdf', xpReward: 12 },
        ],
    },
    {
        id: 'sec-advanced',
        title: 'Advanced Tactics',
        chapters: [
            { id: 'ah-ch18', title: 'The Truth About Talent (When Genes Matter and When They Don\'t)', pdfFile: '18_The Truth About Talent (When Genes Matter and When They Don\'t).pdf', xpReward: 12 },
            { id: 'ah-ch19', title: 'The Goldilocks Rule: How to Stay Motivated in Life and Work', pdfFile: '19_The Goldilocks Rule How to Stay Motivated in Life and Work.pdf', xpReward: 12 },
            { id: 'ah-ch20', title: 'The Downside of Creating Good Habits', pdfFile: '20_The Downside of Creating Good Habits.pdf', xpReward: 15 },
            { id: 'ah-conclusion', title: 'Conclusion: The Secret to Results That Last', pdfFile: 'CC_The Secret to Results That Last.pdf', xpReward: 40 },
        ],
    },
];

/** Flat list of all chapters (no section headers) for the store */
export function getAtomicHabitsChapters() {
    return ATOMIC_HABITS_SECTIONS.flatMap(s => s.chapters);
}

/** Total XP for the entire book */
export const TOTAL_BOOK_XP = ATOMIC_HABITS_SECTIONS
    .flatMap(s => s.chapters)
    .reduce((sum, ch) => sum + ch.xpReward, 0);

/** Map pdfFile → require() source. Must be static requires for metro bundler. */
export const PDF_ASSETS: Record<string, any> = {
    '01_The Surprising Power of Atomic Habits.pdf': require('../assets/chapters/01_The Surprising Power of Atomic Habits.pdf'),
    '02_How Your Habits Shape Your Identity (and Vice Versa).pdf': require('../assets/chapters/02_How Your Habits Shape Your Identity (and Vice Versa).pdf'),
    '03_How to Build Better Habits in 4 Simple Steps.pdf': require('../assets/chapters/03_How to Build Better Habits in 4 Simple Steps.pdf'),
    '04_The Man Who Didn\'t Look Right.pdf': require('../assets/chapters/04_The Man Who Didn\'t Look Right.pdf'),
    '05_The Best Way to Start a New Habit.pdf': require('../assets/chapters/05_The Best Way to Start a New Habit.pdf'),
    '06_Motivation Is Overrated; Environment Often Matters More.pdf': require('../assets/chapters/06_Motivation Is Overrated; Environment Often Matters More.pdf'),
    '07_The Secret to Self-Control.pdf': require('../assets/chapters/07_The Secret to Self-Control.pdf'),
    '08_How to Make a Habit Irresistible.pdf': require('../assets/chapters/08_How to Make a Habit Irresistible.pdf'),
    '09_The Role of Family and Friends in Shaping Your Habits.pdf': require('../assets/chapters/09_The Role of Family and Friends in Shaping Your Habits.pdf'),
    '10_How to Find and Fix the Causes of Your Bad Habits.pdf': require('../assets/chapters/10_How to Find and Fix the Causes of Your Bad Habits.pdf'),
    '11_Walk Slowly, but Never Backward.pdf': require('../assets/chapters/11_Walk Slowly, but Never Backward.pdf'),
    '12_The Law of Least Effort.pdf': require('../assets/chapters/12_The Law of Least Effort.pdf'),
    '13_How to Stop Procrastinating by Using the Two-Minute Rule.pdf': require('../assets/chapters/13_How to Stop Procrastinating by Using the Two-Minute Rule.pdf'),
    '14_How to Make Good Habits Inevitable and Bad Habits Impossible.pdf': require('../assets/chapters/14_How to Make Good Habits Inevitable and Bad Habits Impossible.pdf'),
    '15_The Cardinal Rule of Behavior Change.pdf': require('../assets/chapters/15_The Cardinal Rule of Behavior Change.pdf'),
    '16_How to Stick with Good Habits Every Day.pdf': require('../assets/chapters/16_How to Stick with Good Habits Every Day.pdf'),
    '17_How an Accountability Partner Can Change Everything.pdf': require('../assets/chapters/17_How an Accountability Partner Can Change Everything.pdf'),
    '18_The Truth About Talent (When Genes Matter and When They Don\'t).pdf': require('../assets/chapters/18_The Truth About Talent (When Genes Matter and When They Don\'t).pdf'),
    '19_The Goldilocks Rule How to Stay Motivated in Life and Work.pdf': require('../assets/chapters/19_The Goldilocks Rule How to Stay Motivated in Life and Work.pdf'),
    '20_The Downside of Creating Good Habits.pdf': require('../assets/chapters/20_The Downside of Creating Good Habits.pdf'),
    'CC_The Secret to Results That Last.pdf': require('../assets/chapters/CC_The Secret to Results That Last.pdf'),
};
