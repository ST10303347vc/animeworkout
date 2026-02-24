import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';

interface RadarData {
    physical: number;
    mental: number;
    wealth: number;
    vitality: number;
}

interface Props {
    data: RadarData;
    size?: number;
}

export function RadarChart({ data, size = 220 }: Props) {
    const center = size / 2;
    const maxRadius = center * 0.75;
    // Fixed scale: each grid ring = 100 XP, full chart = 400 XP
    const maxValue = 400;

    const getCoordinates = (value: number, angleDegrees: number) => {
        const angleRadians = (Math.PI / 180) * angleDegrees;
        const radius = Math.max(0.01, value / maxValue) * maxRadius;
        const x = center + radius * Math.cos(angleRadians);
        const y = center + radius * Math.sin(angleRadians);
        return { x, y };
    };

    const ptPhysical = getCoordinates(data.physical, -90);
    const ptMental = getCoordinates(data.mental, 0);
    const ptWealth = getCoordinates(data.wealth, 90);
    const ptVitality = getCoordinates(data.vitality, 180);

    const pointsString = `
    ${ptPhysical.x},${ptPhysical.y} 
    ${ptMental.x},${ptMental.y} 
    ${ptWealth.x},${ptWealth.y} 
    ${ptVitality.x},${ptVitality.y}
  `;

    return (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>SKILL BALANCE</Text>
            <View style={[styles.chartContainer, { width: size, height: size }]}>
                <Svg width={size} height={size}>
                    {/* Background Grids */}
                    {[0.25, 0.5, 0.75, 1].map((scale, i) => {
                        const r = maxRadius * scale;
                        return (
                            <Polygon
                                key={`grid-${i}`}
                                points={`
                    ${center},${center - r} 
                    ${center + r},${center} 
                    ${center},${center + r} 
                    ${center - r},${center}
                  `}
                                fill={i % 2 === 0 ? "rgba(255, 255, 255, 0.03)" : "transparent"}
                                stroke="rgba(255, 255, 255, 0.1)"
                                strokeWidth={1}
                            />
                        );
                    })}

                    {/* Axis Lines */}
                    <Line x1={center} y1={center - maxRadius} x2={center} y2={center + maxRadius} stroke="rgba(255, 255, 255, 0.1)" strokeWidth={1} />
                    <Line x1={center - maxRadius} y1={center} x2={center + maxRadius} y2={center} stroke="rgba(255, 255, 255, 0.1)" strokeWidth={1} />

                    {/* Data Polygon Fill */}
                    <Polygon
                        points={pointsString}
                        fill="rgba(99, 102, 241, 0.25)"
                    />

                    {/* Data Polygon Outline */}
                    <Polygon
                        points={pointsString}
                        fill="transparent"
                        stroke="#6366F1"
                        strokeWidth={2.5}
                        strokeLinejoin="round"
                    />

                    {/* Data Points */}
                    <Circle cx={ptPhysical.x} cy={ptPhysical.y} r={5} fill="#E63946" stroke="#fff" strokeWidth={2} />
                    <Circle cx={ptMental.x} cy={ptMental.y} r={5} fill="#4A90E2" stroke="#fff" strokeWidth={2} />
                    <Circle cx={ptWealth.x} cy={ptWealth.y} r={5} fill="#E88C30" stroke="#fff" strokeWidth={2} />
                    <Circle cx={ptVitality.x} cy={ptVitality.y} r={5} fill="#2A9D8F" stroke="#fff" strokeWidth={2} />

                    {/* Labels */}
                    <SvgText x={center} y={center - maxRadius - 10} fill="#E63946" fontSize={10} fontWeight="900" textAnchor="middle" letterSpacing={1}>VG</SvgText>
                    <SvgText x={center + maxRadius + 16} y={center + 4} fill="#4A90E2" fontSize={10} fontWeight="900" textAnchor="middle" letterSpacing={1}>SG</SvgText>
                    <SvgText x={center} y={center + maxRadius + 16} fill="#E88C30" fontSize={10} fontWeight="900" textAnchor="middle" letterSpacing={1}>MC</SvgText>
                    <SvgText x={center - maxRadius - 16} y={center + 4} fill="#2A9D8F" fontSize={10} fontWeight="900" textAnchor="middle" letterSpacing={1}>GD</SvgText>
                </Svg>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
        paddingTop: 20,
        paddingBottom: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#2a2a3e',
        alignSelf: 'stretch',
        alignItems: 'center',
        marginVertical: 8,
    },
    cardTitle: {
        color: '#888',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 2,
        marginBottom: 8,
    },
    chartContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});
