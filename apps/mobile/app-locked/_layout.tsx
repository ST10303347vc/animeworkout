import { Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

export default function LockedInLayout() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>LOCKED IN (CLASSIFIED)</Text>
            <Text style={styles.subtitle}>Access Restricted.</Text>
            <Stack screenOptions={{ headerShown: false }} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        color: '#F4D03F',
        fontSize: 24,
        fontWeight: 'bold',
    },
    subtitle: {
        color: '#d32f2f',
        marginTop: 10,
    }
});
