import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput, Modal } from 'react-native';
import { MotiView } from 'moti';
import { useStore } from '@/stores/useStore';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';

export default function SelectModeScreen() {
    const setAppMode = useStore(s => s.setAppMode);
    const setChallengeStartDate = useStore(s => s.setChallengeStartDate);
    const login = useStore(s => s.login);
    const user = useStore(s => s.user);
    const router = useRouter();

    const [modalVisible, setModalVisible] = useState(false);
    const [passcode, setPasscode] = useState('');
    const [error, setError] = useState('');
    const [shakeKey, setShakeKey] = useState(0);

    const handleSelectChapter1 = async () => {
        if (!user) {
            await login('Challenger');
        }
        // Start the 15-day challenge countdown for Chapter 1
        await setAppMode('custom', ['physical', 'mental', 'wealth', 'vitality']);
        await setChallengeStartDate(new Date().toISOString().split('T')[0]);
        router.replace('/(auth)/chapter1-video' as any);
    };

    const handleSelectInviteOnly = () => {
        setModalVisible(true);
        setPasscode('');
        setError('');
    };

    const handleUnlock = () => {
        // Always fail for the demo
        setError('ACCESS DENIED');
        setShakeKey(prev => prev + 1);
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
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
                    {/* Chapter 1: Xander */}
                    <MotiView
                        from={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'timing', duration: 500, delay: 200 }}
                    >
                        <Pressable
                            style={({ pressed }) => [
                                styles.senseiCardContainer,
                                pressed && styles.senseiCardPressed,
                            ]}
                            onPress={handleSelectChapter1}
                        >
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
                            <View style={styles.senseiCard}>
                                <View style={styles.chapterTagContainer}>
                                    <Text style={[styles.chapterTagText, { color: '#ff0055' }]}>CHAPTER 1</Text>
                                </View>

                                <View style={styles.cardContentWrapper}>
                                    <View style={[styles.avatar, { borderColor: '#ff0055' }]}>
                                        <Text style={styles.avatarText}>X</Text>
                                    </View>
                                    <Text style={[styles.senseiName, { color: '#ff0055' }]}>XANDER VOLT</Text>
                                    <Text style={styles.senseiTitle}>Vanguard Protocol</Text>
                                    <Text style={styles.senseiQuote}>"Weakness is a choice. Today, you choose strength."</Text>
                                </View>
                            </View>
                        </Pressable>
                    </MotiView>

                    {/* Chapter 2: Tasks (Locked Version) */}
                    <MotiView
                        from={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'timing', duration: 500, delay: 350 }}
                    >
                        <Pressable
                            style={({ pressed }) => [
                                styles.senseiCardContainer,
                                pressed && styles.senseiCardPressed,
                            ]}
                        >
                            <View style={[styles.senseiCard, styles.tasksCard]}>
                                <View style={styles.chapterTagContainerTasks}>
                                    <Text style={[styles.chapterTagText, { color: '#00f0ff' }]}>CHAPTER 2</Text>
                                </View>

                                <View style={styles.cardContentWrapper}>
                                    <View style={[styles.avatar, { borderColor: '#00f0ff' }]}>
                                        <Text style={styles.avatarText}>T</Text>
                                    </View>
                                    <Text style={[styles.senseiName, { color: '#00f0ff' }]}>TASKS</Text>
                                    <Text style={styles.senseiTitle}>Beta Access</Text>
                                    <Text style={styles.senseiQuote}>"Knowledge unapplied is wasted potential."</Text>
                                </View>

                                <BlurView intensity={20} tint="dark" style={[StyleSheet.absoluteFillObject, { borderRadius: 16, zIndex: 10 }]} />
                            </View>
                        </Pressable>
                    </MotiView>
                </View>

                {/* INVITE ONLY SECTION */}
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 600, delay: 500 }}
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
                        onPress={handleSelectInviteOnly}
                    >
                        <View style={[styles.senseiCard, styles.secretCard]}>
                            <View style={[styles.avatar, { borderColor: '#F4D03F' }, styles.secretAvatar]}>
                                <Text style={[styles.avatarText, { color: '#000' }]}>?</Text>
                            </View>

                            <View style={styles.classifiedStamp}>
                                <Text style={styles.classifiedText}>CLASSIFIED</Text>
                            </View>

                            <Text style={[styles.senseiName, { color: '#F4D03F' }]}>UNKNOWN</Text>
                            <Text style={[styles.senseiTitle, { color: '#bbb' }]}>Restricted Access</Text>
                            <Text style={[styles.senseiQuote, { color: '#888' }]}>"Some doors should remain closed."</Text>
                        </View>
                    </Pressable>
                </MotiView>
            </ScrollView>

            {/* Invite Only Password Modal */}
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
        </View>
    );
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
        backgroundColor: '#ff0055',
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
        zIndex: 1,
    },
    cardContentWrapper: {
        alignItems: 'center',
        width: '100%',
        zIndex: 1,
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
        zIndex: 20,
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
});
