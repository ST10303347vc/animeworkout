import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { MotiView } from 'moti';
import { useStore } from '@/stores/useStore';
import { MOCK_SENSEIS } from '@limit-break/core';

export default function SelectSenseiScreen() {
    const setSensei = useStore(s => s.setSensei);
    const user = useStore(s => s.user);

    const handleSelect = async (senseiId: string) => {
        await setSensei(senseiId);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <MotiView
                from={{ opacity: 0, translateY: -20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 600 }}
            >
                <Text style={styles.title}>CHOOSE YOUR</Text>
                <Text style={styles.titleAccent}>SENSEI</Text>
                <Text style={styles.subtitle}>Your guide on the path to greatness</Text>
            </MotiView>

            <View style={styles.grid}>
                {MOCK_SENSEIS.map((sensei, index) => (
                    <MotiView
                        key={sensei.id}
                        from={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'timing', duration: 500, delay: 200 + index * 150 }}
                    >
                        <Pressable
                            style={({ pressed }) => [
                                styles.senseiCard,
                                pressed && styles.senseiCardPressed,
                            ]}
                            onPress={() => handleSelect(sensei.id)}
                        >
                            {/* Avatar placeholder */}
                            <View style={[styles.avatar, { borderColor: getSenseiColor(sensei.id) }]}>
                                <Text style={styles.avatarText}>
                                    {sensei.name[0]}
                                </Text>
                            </View>
                            <Text style={[styles.senseiName, { color: getSenseiColor(sensei.id) }]}>
                                {sensei.name.toUpperCase()}
                            </Text>
                            <Text style={styles.senseiTitle}>{sensei.title}</Text>
                            <Text style={styles.senseiQuote}>{sensei.quote}</Text>
                        </Pressable>
                    </MotiView>
                ))}
            </View>
        </ScrollView>
    );
}

function getSenseiColor(id: string): string {
    const colors: Record<string, string> = {
        sensei_1: '#ffaa00',
        sensei_2: '#00f0ff',
        sensei_3: '#ff0055',
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
    senseiCard: {
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2a2a3e',
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
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
    },
    senseiName: {
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: 4,
    },
    senseiTitle: {
        color: '#888',
        fontSize: 13,
        marginTop: 4,
    },
    senseiQuote: {
        color: '#555',
        fontSize: 12,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 8,
    },
});
