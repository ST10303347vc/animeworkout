import React, { useState } from 'react';
import { View, StyleSheet, Text, LayoutChangeEvent } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, runOnJS, withSpring } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

interface CustomSliderProps {
    value: number;
    min?: number;
    max?: number;
    step?: number;
    onValueChange: (val: number) => void;
    activeColor?: string;
}

export function CustomSlider({
    value,
    min = 1,
    max = 10,
    step = 1,
    onValueChange,
    activeColor = '#00f0ff'
}: CustomSliderProps) {
    const trackWidth = useSharedValue(0);

    // Create shared value for internal position handling (0 to 1 progress)
    const initialProgress = (value - min) / (max - min);
    const progress = useSharedValue(initialProgress);
    const contextProgress = useSharedValue(0);

    const thumbSize = 24;

    const onLayout = (e: LayoutChangeEvent) => {
        trackWidth.value = e.nativeEvent.layout.width;
    };

    const handleValueChange = (prog: number) => {
        // Map progress back to value with steps
        let val = min + prog * (max - min);
        // Snap to step
        val = Math.round(val / step) * step;

        // Safety clamp
        val = Math.max(min, Math.min(max, val));
        onValueChange(val);
    };

    const pan = Gesture.Pan()
        .onStart(() => {
            contextProgress.value = progress.value;
        })
        .onUpdate((e) => {
            if (trackWidth.value === 0) return;
            const progressDelta = e.translationX / trackWidth.value;
            let newProgress = contextProgress.value + progressDelta;
            newProgress = Math.max(0, Math.min(1, newProgress));
            progress.value = newProgress;
        })
        .onEnd(() => {
            // Snap progress visually to step
            const val = min + progress.value * (max - min);
            const snappedVal = Math.round(val / step) * step;
            const snappedProgress = Math.max(0, Math.min(1, (snappedVal - min) / (max - min)));

            progress.value = withSpring(snappedProgress, { mass: 0.5, damping: 12, stiffness: 150 });
            runOnJS(handleValueChange)(snappedProgress);
        });

    // Update visual progress when prop value changes
    React.useEffect(() => {
        const desiredProgress = (value - min) / (max - min);
        progress.value = withSpring(desiredProgress, { mass: 0.5, damping: 12, stiffness: 150 });
    }, [value, min, max]);

    const fillStyle = useAnimatedStyle(() => {
        return {
            width: `${progress.value * 100}%`,
            backgroundColor: activeColor,
        };
    });

    const thumbStyle = useAnimatedStyle(() => {
        // translate thumb keeping it within track bounds
        const maxTranslateX = trackWidth.value;
        return {
            transform: [{ translateX: progress.value * maxTranslateX - thumbSize / 2 }],
            borderColor: activeColor,
        };
    });

    return (
        <View style={styles.container}>
            <GestureDetector gesture={pan}>
                <View style={styles.touchArea}>
                    <View style={styles.track} onLayout={onLayout}>
                        <Animated.View style={[styles.fill, fillStyle]} />
                    </View>
                    <Animated.View style={[styles.thumb, thumbStyle]} />
                </View>
            </GestureDetector>

            {/* Tick Marks (Optional, uncomment if desired) */}
            {/* 
      <View style={styles.ticksContainer}>
        {Array.from({ length: Math.floor((max - min) / step) + 1 }).map((_, i) => (
          <View key={i} style={styles.tick} />
        ))}
      </View>
      */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingVertical: 10,
        justifyContent: 'center',
    },
    touchArea: {
        height: 30, // Make touch target large enough
        justifyContent: 'center',
    },
    track: {
        height: 8,
        backgroundColor: '#2a2a3e',
        borderRadius: 4,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: 4,
    },
    thumb: {
        position: 'absolute',
        left: 0,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#fff',
        borderWidth: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 5,
    },
    ticksContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        marginTop: 8,
    },
    tick: {
        width: 2,
        height: 4,
        backgroundColor: '#s555',
    }
});
