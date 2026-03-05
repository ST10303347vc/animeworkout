import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

type Props = {
    chapterTitle: string;
    onComplete: () => void;
    onClose: () => void;
};

export function PdfReaderModal({ chapterTitle, onComplete, onClose }: Props) {
    return (
        <View style={StyleSheet.absoluteFill}>
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFillObject} />
            <MotiView
                from={{ opacity: 0, scale: 0.9, translateY: 20 }}
                animate={{ opacity: 1, scale: 1, translateY: 0 }}
                exit={{ opacity: 0, scale: 0.9, translateY: -20 }}
                style={styles.modalContent}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>READING: {chapterTitle.toUpperCase()}</Text>
                    <Pressable onPress={onClose} style={styles.closeBtn}>
                        <Ionicons name="close" size={24} color="#888" />
                    </Pressable>
                </View>

                {/* PDF Placeholder */}
                <View style={styles.pdfPlaceholder}>
                    <Ionicons name="book-outline" size={48} color="#555" />
                    <Text style={styles.placeholderText}>
                        PDF View goes here.{'\n'}
                        (split PDF connection to handle chunks)
                    </Text>
                </View>

                {/* Claim XP Button */}
                <Pressable style={styles.claimBtn} onPress={onComplete}>
                    <Text style={styles.claimText}>MARK AS READ (+XP)</Text>
                </Pressable>
            </MotiView>
        </View>
    );
}

const styles = StyleSheet.create({
    modalContent: {
        flex: 1,
        marginTop: Platform.OS === 'ios' ? 60 : 40,
        marginBottom: 40,
        marginHorizontal: 16,
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#00f0ff',
        padding: 20,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        color: '#00f0ff',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 2,
        flex: 1,
    },
    closeBtn: {
        padding: 4,
    },
    pdfPlaceholder: {
        flex: 1,
        backgroundColor: '#0f0f1e',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2a2a3e',
        borderStyle: 'dashed',
        marginBottom: 20,
    },
    placeholderText: {
        color: '#555',
        marginTop: 16,
        textAlign: 'center',
        fontSize: 12,
        lineHeight: 20,
    },
    claimBtn: {
        backgroundColor: '#00f0ff',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    claimText: {
        color: '#000',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 2,
    },
});
