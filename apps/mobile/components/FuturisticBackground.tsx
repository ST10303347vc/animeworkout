import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';

export function FuturisticBackground() {
    const { width, height } = useWindowDimensions();

    return (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
            {/* Anime Light Base */}
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#F0F4F8' }]} />

            <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
                <Defs>
                    {/* Anime Sky Blue Glow */}
                    <RadialGradient id="cyanGlow" cx="50%" cy="50%" rx="50%" ry="50%">
                        <Stop offset="0%" stopColor="#4A90E2" stopOpacity="0.25" />
                        <Stop offset="40%" stopColor="#4A90E2" stopOpacity="0.1" />
                        <Stop offset="70%" stopColor="#4A90E2" stopOpacity="0.02" />
                        <Stop offset="100%" stopColor="#F0F4F8" stopOpacity="0" />
                    </RadialGradient>

                    {/* Anime Soft Pink Glow */}
                    <RadialGradient id="purpleGlow" cx="50%" cy="50%" rx="50%" ry="50%">
                        <Stop offset="0%" stopColor="#FF7EB3" stopOpacity="0.25" />
                        <Stop offset="45%" stopColor="#FF7EB3" stopOpacity="0.1" />
                        <Stop offset="75%" stopColor="#FF7EB3" stopOpacity="0.02" />
                        <Stop offset="100%" stopColor="#F0F4F8" stopOpacity="0" />
                    </RadialGradient>
                </Defs>

                {/* Sky Blue Glow - Top Left */}
                <Circle
                    cx={width * 0.1}
                    cy={height * 0.1}
                    r={width * 0.9}
                    fill="url(#cyanGlow)"
                />

                {/* Soft Pink Glow - Bottom Right */}
                <Circle
                    cx={width * 0.9}
                    cy={height * 0.9}
                    r={width * 0.9}
                    fill="url(#purpleGlow)"
                />
            </Svg>
        </View>
    );
}
