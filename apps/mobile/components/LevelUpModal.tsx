import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Dimensions, Image } from 'react-native';
import { MotiView } from 'moti';
import { useStore } from '@/stores/useStore';
import { Ionicons } from '@expo/vector-icons';
import { getLevelMessage } from '@limit-break/core';

const { width } = Dimensions.get('window');
const RING_SIZE = 240;
const STROKE_WIDTH = 4;

const AVATAR_IMAGES: Record<number, any> = {
    1: require('@/assets/challenge-avatar/1.jpeg'),
    2: require('@/assets/challenge-avatar/2.png'),
    3: require('@/assets/challenge-avatar/3.png'),
    4: require('@/assets/challenge-avatar/4.png'),
    5: require('@/assets/challenge-avatar/5.png'),
    6: require('@/assets/challenge-avatar/6.png'),
    7: require('@/assets/challenge-avatar/7.png'),
    8: require('@/assets/challenge-avatar/8.png'),
    9: require('@/assets/challenge-avatar/9.png'),
    10: require('@/assets/challenge-avatar/10.png'),
    11: require('@/assets/challenge-avatar/11.png'),
    12: require('@/assets/challenge-avatar/12.png'),
    13: require('@/assets/challenge-avatar/13.png'),
    14: require('@/assets/challenge-avatar/14.png'),
    15: require('@/assets/challenge-avatar/15.png'),
    16: require('@/assets/challenge-avatar/17.jpeg'),
    17: require('@/assets/challenge-avatar/18.jpeg'),
};

const LEVEL_COLOR = (level: number) => {
    if (level <= 4) return '#10b981';
    if (level <= 8) return '#3b82f6';
    if (level <= 12) return '#f59e0b';
    if (level <= 15) return '#ef4444';
    return '#9333ea';
};

export function LevelUpModal() {
    const showModal = useStore(s => s.showLevelUpModal);
    const closeLevelUpModal = useStore(s => s.closeLevelUpModal);
    const levelUpQueue = useStore(s => s.levelUpQueue) || [];
    const lastSeenLevel = useStore(s => s.lastSeenLevel) || 1;

    // Show the first item in the queue, fallback to lastSeenLevel if empty.
    const displayLevel = levelUpQueue.length > 0 ? levelUpQueue[0] : lastSeenLevel;

    if (!showModal) return null;

    const color = LEVEL_COLOR(displayLevel);
    const message = getLevelMessage(displayLevel);

    return (
        <Modal
            transparent
            visible={showModal}
            animationType="fade"
            onRequestClose={closeLevelUpModal}
        >
            <View style={styles.overlay}>
                <MotiView
                    from={{ opacity: 0, scale: 0.8, translateY: 40 }}
                    animate={{ opacity: 1, scale: 1, translateY: 0 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 100 }}
                    style={[styles.modalContent, { shadowColor: color }]}
                >
                    <View style={styles.header}>
                        <Ionicons name="sparkles" size={24} color={color} />
                        <Text style={[styles.title, { color }]}>LEVEL UP!</Text>
                        <Ionicons name="sparkles" size={24} color={color} />
                    </View>

                    <MotiView
                        from={{ opacity: 0, scale: 0.5, rotate: '-10deg' }}
                        animate={{ opacity: 1, scale: 1, rotate: '0deg' }}
                        transition={{ type: 'spring', delay: 300, damping: 12 }}
                        style={[styles.avatarContainer, { borderColor: color }]}
                    >
                        <Image
                            source={AVATAR_IMAGES[displayLevel] || AVATAR_IMAGES[1]}
                            style={styles.avatarImage}
                            resizeMode="cover"
                        />
                    </MotiView>

                    <Text style={styles.levelText}>LEVEL {displayLevel}</Text>
                    <Text style={styles.mottoText}>{message}</Text>

                    <Pressable
                        style={[styles.button, { backgroundColor: color }]}
                        onPress={closeLevelUpModal}
                    >
                        <Text style={styles.buttonText}>AWESOME!</Text>
                    </Pressable>
                </MotiView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#1a1a2e',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        width: width - 48,
        borderWidth: 2,
        borderColor: '#2a2a3e',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 30,
        elevation: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: 4,
    },
    avatarContainer: {
        width: RING_SIZE,
        height: RING_SIZE,
        borderRadius: RING_SIZE / 2,
        overflow: 'hidden',
        borderWidth: STROKE_WIDTH,
        marginBottom: 24,
        backgroundColor: '#000',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    levelText: {
        fontSize: 24,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 2,
        marginBottom: 8,
    },
    mottoText: {
        fontSize: 14,
        color: '#aaa',
        textAlign: 'center',
        fontStyle: 'italic',
        lineHeight: 20,
        marginBottom: 32,
    },
    button: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 2,
    },
});
