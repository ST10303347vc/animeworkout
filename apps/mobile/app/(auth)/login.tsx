import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { MotiView } from 'moti';
import { useStore } from '@/stores/useStore';

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const login = useStore(s => s.login);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!username.trim() || loading) return;
        setLoading(true);
        await login(username.trim());
        setLoading(false);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Animated Title */}
            <MotiView
                from={{ opacity: 0, translateY: -30 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 800 }}
            >
                <Text style={styles.title}>LIMIT</Text>
                <Text style={styles.titleAccent}>BREAK</Text>
                <Text style={styles.subtitle}>Where users don't just log reps — they gain XP.</Text>
            </MotiView>

            {/* Login Form */}
            <MotiView
                from={{ opacity: 0, translateY: 40 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 800, delay: 300 }}
                style={styles.form}
            >
                <Text style={styles.label}>ENTER YOUR NAME, WARRIOR</Text>
                <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Your display name..."
                    placeholderTextColor="#555"
                    autoCapitalize="words"
                    returnKeyType="go"
                    onSubmitEditing={handleLogin}
                />
                <Pressable
                    style={[styles.button, !username.trim() && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={!username.trim() || loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? 'INITIALIZING...' : 'BEGIN YOUR JOURNEY'}
                    </Text>
                </Pressable>
            </MotiView>

            {/* Bottom decorative text */}
            <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ type: 'timing', duration: 1500, delay: 800 }}
            >
                <Text style={styles.footer}>⚔️ Powered by pure willpower ⚔️</Text>
            </MotiView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a14',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    title: {
        fontSize: 56,
        fontWeight: '900',
        color: '#ffffff',
        textAlign: 'center',
        letterSpacing: 12,
    },
    titleAccent: {
        fontSize: 56,
        fontWeight: '900',
        color: '#ff0055',
        textAlign: 'center',
        letterSpacing: 12,
        marginTop: -8,
    },
    subtitle: {
        color: '#888',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 12,
        fontStyle: 'italic',
    },
    form: {
        width: '100%',
        marginTop: 48,
    },
    label: {
        color: '#ff0055',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 3,
        marginBottom: 12,
        textAlign: 'center',
    },
    input: {
        width: '100%',
        backgroundColor: '#1a1a2e',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 16,
        fontSize: 18,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#ff0055',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#ff0055',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    buttonDisabled: {
        backgroundColor: '#333',
        shadowOpacity: 0,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 3,
    },
    footer: {
        color: '#444',
        fontSize: 12,
        marginTop: 48,
        textAlign: 'center',
    },
});
