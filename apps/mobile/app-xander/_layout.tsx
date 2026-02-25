import { Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

export default function XanderLayout() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>XANDER VOLT RPG</Text>
            <Text style={styles.subtitle}>Welcome to the Anime Mobile App.</Text>
            <Text style={styles.subtitle}>Please start building screens here.</Text>
            <Stack screenOptions={{ headerShown: false }} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a14',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        color: '#ff0055',
        fontSize: 24,
        fontWeight: 'bold',
    },
    subtitle: {
        color: '#888',
        marginTop: 10,
    }
});
