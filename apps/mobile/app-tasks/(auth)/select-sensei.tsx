import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput, Modal, ImageBackground } from 'react-native';
import { MotiView } from 'moti';
import { useStore } from '@/stores/useStore';
import { MOCK_SENSEIS, getLevelProgress } from '@limit-break/core';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

export default function SelectSenseiScreen() {
    const setSensei = useStore(s => s.setSensei);
    const user = useStore(s => s.user);

    const [modalVisible, setModalVisible] = useState(false);
    const [lockedModalVisible, setLockedModalVisible] = useState(false);
    const [passcode, setPasscode] = useState('');
    const [error, setError] = useState('');
    const [selectedSecretId, setSelectedSecretId] = useState<string | null>(null);
    const [shakeKey, setShakeKey] = useState(0);

    const handleSelect = async (senseiId: string, isLocked: boolean = false) => {
        if (isLocked) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setLockedModalVisible(true);
            setTimeout(() => {
                setLockedModalVisible(false);
            }, 2000);
            return;
        }

        if (senseiId === 'sensei_3') {
            setSelectedSecretId(senseiId);
            setModalVisible(true);
            setPasscode('');
            setError('');
        } else {
            await setSensei(senseiId);
        }
    };

    const handleUnlock = async () => {
        const secretCode = process.env.EXPO_PUBLIC_SECRET_MODE_CODE || '007BOND';
        if (passcode === secretCode) {
            setModalVisible(false);
            if (selectedSecretId) {
                await setSensei(selectedSecretId);
            }
        } else {
            setError('ACCESS DENIED');
            setShakeKey(prev => prev + 1);
        }
    };

    // Filter and reorder logic
    const mainPaths = [
        MOCK_SENSEIS.find(s => s.id === 'sensei_2'), // Xander Volt first
        MOCK_SENSEIS.find(s => s.id === 'sensei_1'), // Bane second
        MOCK_SENSEIS.find(s => s.id === 'sensei_4'), // Wick third
    ].filter(Boolean) as typeof MOCK_SENSEIS;

    const totalXp = user?.globalXp || 0;
    const progress = getLevelProgress(totalXp);

    const inviteOnlyPath = MOCK_SENSEIS.find(s => s.id === 'sensei_3'); // Locked In

    return (
        <>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <MotiView
                    from={{ opacity: 0, translateY: -20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 600 }}
                >
                    <Text style={styles.title}>CHOOSE YOUR</Text>
                    <Text style={styles.titleAccent}>PATH</Text>
                    <Text style={styles.subtitle}>Select your journey</Text>
                </MotiView>

                {/* MAIN PATHS SECTION */}
                <View style={styles.grid}>
                    {mainPaths.map((sensei, index) => {
                        const isBane = sensei.id === 'sensei_1';
                        const isXanderVault = sensei.id === 'sensei_2';
                        const isWick = sensei.id === 'sensei_4';

                        const isActive = user?.senseiId === sensei.id;

                        let wallpaperSource = null;
                        if (isXanderVault) wallpaperSource = require('@/assets/challenge-avatar/18.webp');
                        if (isBane) wallpaperSource = require('@/assets/images/BaneWallpaper.webp');
                        if (isWick) wallpaperSource = require('@/assets/images/WickWallpaper.webp');

                        const contentNode = (
                            <View style={[
                                styles.senseiCard,
                            ]}>
                                {isXanderVault && (
                                    <View style={styles.chapterTagContainer}>
                                        <Text style={[styles.chapterTagText, { color: getSenseiColor(sensei.id) }]}>CHAPTER 1</Text>
                                    </View>
                                )}
                                {isBane && (
                                    <View style={styles.chapterTagContainerTasks}>
                                        <Text style={[styles.chapterTagText, { color: getSenseiColor(sensei.id) }]}>CHAPTER 2</Text>
                                    </View>
                                )}
                                {isWick && (
                                    <View style={styles.chapterTagContainerTasks}>
                                        <Text style={[styles.chapterTagText, { color: getSenseiColor(sensei.id) }]}>CHAPTER 3</Text>
                                    </View>
                                )}

                                <View style={[styles.cardContentWrapper]}>
                                    <View style={[
                                        styles.avatar,
                                        { borderColor: getSenseiColor(sensei.id) }
                                    ]}>
                                        <Text style={[styles.avatarText]}>
                                            {sensei.name[0]}
                                        </Text>
                                    </View>

                                    <Text style={[
                                        styles.senseiName,
                                        { color: getSenseiColor(sensei.id) }
                                    ]}>
                                        {sensei.name.toUpperCase()}
                                    </Text>
                                    <Text style={[styles.senseiTitle]}>{sensei.title}</Text>
                                    <Text style={[styles.senseiQuote]}>{sensei.quote}</Text>
                                </View>

                                {isActive && (
                                    <View style={styles.progressBarContainer}>
                                        <Text style={styles.progressLabel}>LEVEL {progress.currentLevel} PROGRESS</Text>
                                        <View style={styles.progressBarBg}>
                                            <View style={[styles.progressBarFill, { width: `${progress.progressPercent}%`, backgroundColor: getSenseiColor(sensei.id) }]} />
                                        </View>
                                    </View>
                                )}

                                {(isBane || isWick) && (
                                    <BlurView intensity={30} tint="dark" style={[StyleSheet.absoluteFillObject, { borderRadius: 16, zIndex: 1 }]} />
                                )}
                            </View>
                        );

                        return (
                            <MotiView
                                key={sensei.id}
                                from={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: 'timing', duration: 500, delay: 200 + index * 150 }}
                            >
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.senseiCardContainer,
                                        pressed && styles.senseiCardPressed,
                                        (isBane || isWick) && { opacity: 0.8 }
                                    ]}
                                    onPress={() => handleSelect(sensei.id, isBane || isWick)}
                                >
                                    {isXanderVault && (
                                        <MotiView
                                            style={styles.animatedBorder}
                                            from={{ opacity: 0.3, scale: 1 }}
                                            animate={{ opacity: 0.8, scale: 1.02 }}
                                            transition={{
                                                type: 'timing',
                                                duration: 1500,
                                                loop: true,
                                            }}
                                        />
                                    )}
                                    {isActive && !isXanderVault && (
                                        <MotiView
                                            style={[styles.animatedBorder, { backgroundColor: getSenseiColor(sensei.id), shadowColor: getSenseiColor(sensei.id) }]}
                                            from={{ opacity: 0.3, scale: 1 }}
                                            animate={{ opacity: 0.8, scale: 1.02 }}
                                            transition={{ type: 'timing', duration: 1500, loop: true }}
                                        />
                                    )}

                                    {(isBane || isWick) && (
                                        <View style={styles.lockIconContainer}>
                                            <Ionicons name="lock-closed" size={24} color={getSenseiColor(sensei.id)} />
                                        </View>
                                    )}

                                    {wallpaperSource ? (
                                        <ImageBackground source={wallpaperSource} style={{ borderRadius: 16 }} imageStyle={{ borderRadius: 16 }}>
                                            {contentNode}
                                        </ImageBackground>
                                    ) : (
                                        contentNode
                                    )}
                                </Pressable>
                            </MotiView>
                        );
                    })}
                </View>

                {/* INVITE ONLY SECTION */}
                {inviteOnlyPath && (
                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'timing', duration: 600, delay: 600 }}
                        style={styles.inviteSection}
                    >
                        <View style={styles.separatorContainer}>
                            <View style={styles.separatorLine} />
                            <Text style={styles.separatorText}>INVITE ONLY</Text>
                            <View style={styles.separatorLine} />
                        </View>

                        <Pressable
                            style={({ pressed }) => [
                                styles.senseiCardContainer,
                                pressed && styles.senseiCardPressed,
                            ]}
                            onPress={() => handleSelect(inviteOnlyPath.id)}
                        >
                            <View style={[styles.senseiCard, styles.secretCard]}>
                                <View style={[
                                    styles.avatar,
                                    { borderColor: '#F4D03F' },
                                    styles.secretAvatar
                                ]}>
                                    <Text style={[styles.avatarText, { color: '#000' }]}>
                                        ?
                                    </Text>
                                </View>

                                <View style={styles.classifiedStamp}>
                                    <Text style={styles.classifiedText}>CLASSIFIED</Text>
                                </View>

                                <Text style={[
                                    styles.senseiName,
                                    { color: '#F4D03F' }
                                ]}>
                                    {inviteOnlyPath.name.toUpperCase()}
                                </Text>
                                <Text style={[styles.senseiTitle, { color: '#bbb' }]}>{inviteOnlyPath.title}</Text>
                                <Text style={[styles.senseiQuote, { color: '#888' }]}>{inviteOnlyPath.quote}</Text>
                            </View>
                        </Pressable>
                    </MotiView>
                )}
            </ScrollView>

            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <MotiView
                        style={styles.modalContent}
                        from={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Text style={styles.modalTitle}>LOCKED IN MODE</Text>
                        <Text style={styles.modalSubtitle}>ENTER PASSCODE TO PROCEED</Text>

                        <MotiView
                            key={shakeKey}
                            from={{ translateX: 0 }}
                            animate={{ translateX: error ? [-10, 10, -10, 10, 0] : 0 }}
                            transition={{ type: 'timing', duration: 400 }}
                        >
                            <TextInput
                                style={[styles.input, error && styles.inputError]}
                                value={passcode}
                                onChangeText={(text) => {
                                    setPasscode(text);
                                    setError('');
                                }}
                                secureTextEntry
                                placeholder="***"
                                placeholderTextColor="#666"
                                autoCapitalize="characters"
                                onSubmitEditing={handleUnlock}
                            />
                        </MotiView>

                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <View style={styles.modalButtons}>
                            <Pressable style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelButtonText}>CANCEL</Text>
                            </Pressable>
                            <Pressable style={styles.unlockButton} onPress={handleUnlock}>
                                <Text style={styles.unlockButtonText}>UNLOCK</Text>
                            </Pressable>
                        </View>
                    </MotiView>
                </View>
            </Modal>

            {/* Locked Chapter Modal */}
            <Modal
                visible={lockedModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setLockedModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <MotiView
                        style={styles.lockedPopup}
                        from={{ opacity: 0, scale: 0.8, translateY: 20 }}
                        animate={{ opacity: 1, scale: 1, translateY: 0 }}
                    >
                        <Ionicons name="lock-closed" size={48} color="#ff0055" style={{ marginBottom: 16 }} />
                        <Text style={styles.modalTitle}>CHAPTER LOCKED</Text>
                        <Text style={styles.modalSubtitle}>COMPLETE PREVIOUS CHAPTERS TO UNLOCK</Text>
                    </MotiView>
                </View>
            </Modal>
        </>
    );
}

function getSenseiColor(id: string): string {
    const colors: Record<string, string> = {
        sensei_1: '#00f0ff',
        sensei_2: '#ff0055',
        sensei_3: '#ffaa00',
        sensei_4: '#a855f7',
    };
    return colors[id] || '#888';
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a14',
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 80,
        paddingBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
        textAlign: 'center',
        letterSpacing: 6,
    },
    titleAccent: {
        fontSize: 40,
        fontWeight: '900',
        color: '#ff0055',
        textAlign: 'center',
        letterSpacing: 8,
        marginTop: -4,
    },
    subtitle: {
        color: '#666',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 32,
    },
    grid: {
        gap: 16,
    },
    senseiCardContainer: {
        position: 'relative',
        borderRadius: 16,
    },
    animatedBorder: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#ff0055', // Adjust for glow color matching Xander
        borderRadius: 18,
        margin: -2,
        opacity: 0.5,
        shadowColor: '#ff0055',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 15,
        elevation: 10,
    },
    senseiCard: {
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2a2a3e',
        position: 'relative',
        overflow: 'hidden',
        zIndex: 2, // Stay above the glow
    },
    cardContentWrapper: {
        alignItems: 'center',
        width: '100%',
        zIndex: 10, // Content must be above BlurView
    },
    progressBarContainer: {
        width: '100%',
        marginTop: 20,
        zIndex: 10,
        alignItems: 'center',
    },
    progressLabel: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 8,
    },
    progressBarBg: {
        width: '90%',
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    chapterTagContainer: {
        position: 'absolute',
        top: 12,
        left: 16,
        zIndex: 2,
    },
    chapterTagContainerTasks: {
        position: 'absolute',
        top: 12,
        left: 16,
        zIndex: 20, // Keep above the blur
    },
    chapterTagText: {
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 2,
    },
    tasksCard: {
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: '#00f0ff',
        opacity: 0.8,
    },
    secretCard: {
        backgroundColor: '#111',
        borderColor: '#333',
        borderStyle: 'dashed',
        borderWidth: 2,
    },
    senseiCardPressed: {
        transform: [{ scale: 0.97 }],
        opacity: 0.8,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#0f0f1e',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        marginBottom: 12,
        zIndex: 2,
        marginTop: 20,
    },
    secretAvatar: {
        backgroundColor: '#F4D03F',
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
    },
    classifiedStamp: {
        position: 'absolute',
        top: 20,
        right: -20,
        backgroundColor: '#d32f2f',
        paddingHorizontal: 30,
        paddingVertical: 5,
        transform: [{ rotate: '45deg' }],
        zIndex: 10,
    },
    classifiedText: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 12,
        letterSpacing: 2,
    },
    senseiName: {
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: 4,
        zIndex: 2,
    },
    senseiTitle: {
        color: '#888',
        fontSize: 13,
        marginTop: 4,
        zIndex: 2,
    },
    senseiQuote: {
        color: '#555',
        fontSize: 12,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 8,
        zIndex: 2,
    },
    // Invite Section styles
    inviteSection: {
        marginTop: 40,
    },
    separatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    separatorLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#333',
    },
    separatorText: {
        color: '#ff0055',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 4,
        marginHorizontal: 16,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
        padding: 32,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    modalTitle: {
        color: '#F4D03F',
        fontSize: 24,
        fontWeight: '900',
        letterSpacing: 4,
        textAlign: 'center',
    },
    modalSubtitle: {
        color: '#888',
        fontSize: 12,
        marginTop: 8,
        marginBottom: 24,
        letterSpacing: 1,
    },
    input: {
        backgroundColor: '#0f0f1e',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 8,
        color: '#fff',
        fontSize: 24,
        textAlign: 'center',
        padding: 16,
        width: '100%',
        minWidth: 200,
        marginBottom: 16,
        letterSpacing: 8,
    },
    inputError: {
        borderColor: '#ff0055',
    },
    errorText: {
        color: '#ff0055',
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 16,
        width: '100%',
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        borderRadius: 8,
        backgroundColor: '#333',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#fff',
        fontWeight: '700',
    },
    unlockButton: {
        flex: 1,
        padding: 16,
        borderRadius: 8,
        backgroundColor: '#F4D03F',
        alignItems: 'center',
    },
    unlockButtonText: {
        color: '#000',
        fontWeight: '900',
    },
    lockedPopup: {
        backgroundColor: '#1a1a2e',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#ff0055',
        shadowColor: '#ff0055',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    lockIconContainer: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        padding: 8,
    },
});
