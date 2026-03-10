import { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { getChapterText } from '@/constants/chapterTextsHelper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
    chapterTitle: string;
    xpReward?: number;
    pdfSource: any;
    pdfFilename?: string;
    onComplete: () => void;
    onClose: () => void;
};

export function PdfReaderModal({ chapterTitle, xpReward, pdfFilename, onComplete, onClose }: Props) {
    const [scrollProgress, setScrollProgress] = useState(0);
    const scrollRef = useRef<ScrollView>(null);
    const insets = useSafeAreaInsets();

    const content = pdfFilename ? getChapterText(pdfFilename) : '';
    const paragraphs = content.split(/\n{2,}/).filter(p => p.trim().length > 0);

    const handleScroll = useCallback((event: any) => {
        const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
        const pct = contentSize.height > layoutMeasurement.height
            ? contentOffset.y / (contentSize.height - layoutMeasurement.height)
            : 1;
        setScrollProgress(Math.min(1, Math.max(0, pct)));
    }, []);

    return (
        <View style={[StyleSheet.absoluteFill, styles.container]}>
            {/* ── Top Progress Bar ──────────────────────── */}
            <View style={[styles.progressTrack, { marginTop: insets.top }]}>
                <MotiView
                    animate={{ width: `${scrollProgress * 100}%` as any }}
                    transition={{ type: 'timing', duration: 100 }}
                    style={styles.progressFill}
                />
            </View>

            {/* ── Content Area ─────────────────────────── */}
            {paragraphs.length > 0 ? (
                <ScrollView
                    ref={scrollRef}
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={true}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    indicatorStyle="black"
                >
                    {/* Chapter title */}
                    <Text style={styles.chapterHeading}>{chapterTitle}</Text>
                    <View style={styles.divider} />

                    {/* Body paragraphs */}
                    {paragraphs.map((paragraph, i) => {
                        const isHeading = paragraph.length < 100 &&
                            paragraph === paragraph.toUpperCase() &&
                            !paragraph.startsWith('*');
                        const isSummaryHeader = paragraph.includes('Chapter Summary');
                        const isQuote = paragraph.startsWith('"') || paragraph.startsWith('\u201c');

                        if (isSummaryHeader) {
                            return (
                                <View key={i}>
                                    <View style={styles.summaryDivider} />
                                    <Text style={styles.summaryHeading}>📝 CHAPTER SUMMARY</Text>
                                </View>
                            );
                        }

                        if (isHeading) {
                            return (
                                <Text key={i} style={styles.sectionHeading}>
                                    {paragraph}
                                </Text>
                            );
                        }

                        if (isQuote) {
                            return (
                                <View key={i} style={styles.quoteBlock}>
                                    <View style={styles.quoteLine} />
                                    <Text style={styles.quoteText}>{paragraph}</Text>
                                </View>
                            );
                        }

                        return (
                            <Text key={i} style={styles.paragraph}>
                                {paragraph}
                            </Text>
                        );
                    })}

                    {/* ── Inline "Mark as Read" Button ─────── */}
                    <View style={styles.inlineCompleteContainer}>
                        <View style={styles.endDivider} />
                        <Pressable
                            style={({ pressed }) => [
                                styles.inlineCompleteBtn,
                                pressed && styles.inlineCompleteBtnPressed,
                            ]}
                            onPress={onComplete}
                        >
                            <Ionicons name="checkmark-circle" size={20} color="#fff" />
                            <Text style={styles.inlineCompleteText}>MARK AS READ</Text>
                            {xpReward !== undefined && (
                                <View style={styles.inlineXpBadge}>
                                    <Ionicons name="flash" size={10} color="#fff" />
                                    <Text style={styles.inlineXpText}>+{xpReward} XP</Text>
                                </View>
                            )}
                        </Pressable>
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>
            ) : (
                <View style={styles.noContent}>
                    <Ionicons name="alert-circle-outline" size={48} color="#ccc" />
                    <Text style={styles.noContentText}>
                        Content not available for this chapter
                    </Text>
                </View>
            )}

            {/* ── Tiny Exit Button (bottom-right) ─────── */}
            <Pressable
                style={({ pressed }) => [
                    styles.exitBtn,
                    { bottom: insets.bottom + 28 },
                    pressed && styles.exitBtnPressed,
                ]}
                onPress={onClose}
                hitSlop={12}
            >
                <Ionicons name="close" size={16} color="#888" />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
    },

    // ── Top Progress Bar
    progressTrack: {
        height: 2,
        backgroundColor: '#e8e8e8',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#333',
        minWidth: 1,
    },

    // ── Scroll Content
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 36,
        paddingBottom: 20,
    },

    // ── Chapter Heading
    chapterHeading: {
        color: '#1a1a1a',
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: 0.3,
        lineHeight: 36,
        marginBottom: 12,
    },
    divider: {
        height: 3,
        backgroundColor: '#1a1a1a',
        marginBottom: 28,
        borderRadius: 2,
        width: 60,
    },

    // ── Body Paragraph
    paragraph: {
        color: '#2a2a2a',
        fontSize: 18,
        lineHeight: 30,
        marginBottom: 18,
        fontWeight: '400',
    },

    // ── Section Heading
    sectionHeading: {
        color: '#111111',
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: 1,
        marginTop: 32,
        marginBottom: 14,
        paddingBottom: 8,
        borderBottomWidth: 2,
        borderBottomColor: '#e0e0e0',
    },

    // ── Quotes
    quoteBlock: {
        flexDirection: 'row',
        marginBottom: 18,
        marginLeft: 4,
    },
    quoteLine: {
        width: 3,
        backgroundColor: '#c8a96e',
        borderRadius: 2,
        marginRight: 14,
    },
    quoteText: {
        color: '#555555',
        fontSize: 17,
        lineHeight: 28,
        fontStyle: 'italic',
        flex: 1,
    },

    // ── Summary Section
    summaryDivider: {
        height: 2,
        backgroundColor: '#e0e0e0',
        marginTop: 36,
        marginBottom: 18,
        borderRadius: 1,
    },
    summaryHeading: {
        color: '#1a1a1a',
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 14,
    },

    // ── Inline Complete Button
    inlineCompleteContainer: {
        marginTop: 40,
        alignItems: 'center',
    },
    endDivider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        width: '100%',
        marginBottom: 28,
    },
    inlineCompleteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#1a1a1a',
        paddingHorizontal: 28,
        paddingVertical: 14,
        borderRadius: 30,
    },
    inlineCompleteBtnPressed: {
        backgroundColor: '#333',
        transform: [{ scale: 0.97 }],
    },
    inlineCompleteText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '800',
        letterSpacing: 1.5,
    },
    inlineXpBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        marginLeft: 4,
    },
    inlineXpText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '800',
    },

    // ── No content fallback
    noContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    noContentText: {
        color: '#999',
        fontSize: 14,
    },

    // ── Tiny Exit Button
    exitBtn: {
        position: 'absolute',
        right: 24,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0, 0, 0, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    exitBtnPressed: {
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
        transform: [{ scale: 0.92 }],
    },
});
