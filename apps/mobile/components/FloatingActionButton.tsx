import { View, StyleSheet, Pressable, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, interpolate } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export interface FABAction {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
    color?: string;
}

interface FABProps {
    actions: FABAction[];
    mainColor?: string;
}

export function FloatingActionButton({ actions, mainColor = '#ff0055' }: FABProps) {
    const [isOpen, setIsOpen] = useState(false);
    const openValue = useSharedValue(0);

    const toggleOpen = () => {
        const nextState = !isOpen;
        setIsOpen(nextState);
        openValue.value = withSpring(nextState ? 1 : 0, {
            mass: 0.5,
            damping: 12,
            stiffness: 150,
        });
    };

    const mainIconStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${interpolate(openValue.value, [0, 1], [0, 45])}deg` }],
    }));

    const overlayStyle = useAnimatedStyle(() => ({
        opacity: interpolate(openValue.value, [0, 1], [0, 0.5]),
    }));

    return (
        <>
            {isOpen && (
                <Animated.View style={[StyleSheet.absoluteFill, styles.overlay, overlayStyle]} pointerEvents="auto">
                    <Pressable style={StyleSheet.absoluteFill} onPress={toggleOpen} />
                </Animated.View>
            )}

            <View style={styles.container} pointerEvents="box-none">
                {actions.map((action, index) => {
                    const actionStyle = useAnimatedStyle(() => {
                        const translateY = interpolate(
                            openValue.value,
                            [0, 1],
                            [40, -60 * (index + 1)]
                        );
                        const scale = interpolate(openValue.value, [0, 1], [0, 1]);
                        const opacity = interpolate(openValue.value, [0, 1], [0, 1]);
                        return {
                            transform: [{ translateY }, { scale }],
                            opacity,
                        };
                    });

                    return (
                        <Animated.View key={action.label} style={[styles.actionWrapper, actionStyle]} pointerEvents={isOpen ? 'auto' : 'none'}>
                            <Text style={styles.actionLabel}>{action.label}</Text>
                            <Pressable
                                style={[styles.actionButton, { backgroundColor: action.color || mainColor }]}
                                onPress={() => {
                                    toggleOpen();
                                    action.onPress();
                                }}
                            >
                                <Ionicons name={action.icon} size={20} color="#fff" />
                            </Pressable>
                        </Animated.View>
                    );
                })}

                <Pressable onPress={toggleOpen}>
                    <Animated.View style={[styles.mainButton, { backgroundColor: mainColor }, mainIconStyle]}>
                        <Ionicons name="add" size={32} color="#fff" />
                    </Animated.View>
                </Pressable>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    overlay: {
        backgroundColor: '#000',
        zIndex: 10,
    },
    container: {
        position: 'absolute',
        bottom: 110, // Adjusted to sit above the tab bar on iOS properly
        right: 20,
        alignItems: 'flex-end',
        zIndex: 20,
    },
    mainButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 8,
    },
    actionWrapper: {
        position: 'absolute',
        bottom: 0,
        right: 5,
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionLabel: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
        marginRight: 12,
        backgroundColor: '#1a1a2e',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        overflow: 'hidden',
    },
    actionButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 5,
    },
});
