import { View, Text, Pressable, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { useStore } from '@/stores/useStore';
import { getDominantAura, getGlobalXpProgress, getUserTitle, calculatePillarLevel, MOCK_SENSEIS } from '@limit-break/core';
import type { Pillar } from '@limit-break/core';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { RadarChart } from '@/components/RadarChart';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const RING_SIZE = 160;
const STROKE_WIDTH = 6;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// ── Pillar Config ──────────────────────────────────────────────────
const PILLAR_CONFIG: Record<Pillar, { label: string; color: string; icon: string }> = {
  physical: { label: 'The Vanguard', color: '#E63946', icon: 'barbell' },
  mental: { label: 'The Sage', color: '#4A90E2', icon: 'bulb' },
  wealth: { label: 'The Merchant', color: '#E88C30', icon: 'wallet' },
  vitality: { label: 'The Guardian', color: '#2A9D8F', icon: 'heart' },
};

interface HubScreenProps {
  onProfilePress?: () => void;
}

export default function HubScreen({ onProfilePress }: HubScreenProps) {
  const router = useRouter();
  const user = useStore(s => s.user);
  const quests = useStore(s => s.quests);
  const completeQuest = useStore(s => s.completeQuest);

  if (!user) return null;

  const aura = getDominantAura(user.pillarXp);
  const xpProgress = getGlobalXpProgress(user.globalXp || 0);
  const title = getUserTitle(user.globalLevel || 1, aura.pillar);
  const sensei = MOCK_SENSEIS.find(s => s.id === user.senseiId);
  const enabledPillars = user.settings?.enabledPillars || [];
  const strokeDashoffset = CIRCUMFERENCE - (CIRCUMFERENCE * xpProgress.progressPercentage) / 100;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Power Level Ring ─────────────────────────── */}
        <Pressable onPress={onProfilePress}>
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'timing', duration: 700 }}
            style={styles.ringContainer}
          >
            <Svg width={RING_SIZE} height={RING_SIZE}>
              {/* Background ring */}
              <Circle
                cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RADIUS}
                stroke="rgba(0,0,0,0.1)" strokeWidth={STROKE_WIDTH} fill="transparent"
              />
              {/* Progress ring */}
              <Circle
                cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RADIUS}
                stroke={aura.glowHex}
                strokeWidth={STROKE_WIDTH}
                fill="transparent"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
              />
            </Svg>
            <View style={styles.ringCenter}>
              <Text style={styles.ringInitial}>
                {user.displayName?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
          </MotiView>
        </Pressable>

        {/* ── User Info ──────────────────────────────────── */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 200 }}
        >
          <Text style={styles.username}>{user.displayName?.toUpperCase()}</Text>
          <Text style={styles.levelText}>GLOBAL LEVEL {xpProgress.currentLevel}</Text>
          <Text style={[styles.titleText, { color: aura.glowHex }]}>{title.toUpperCase()}</Text>
        </MotiView>

        {/* ── Global XP Bar ──────────────────────────────── */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 500, delay: 400 }}
          style={{ width: '100%' }}
        >
          <View style={styles.xpBarContainer}>
            <View style={styles.xpBarHeader}>
              <View style={[styles.xpBarLevelBadge, { backgroundColor: aura.glowHex }]}>
                <Text style={styles.xpBarLevelText}>{xpProgress.currentLevel}</Text>
              </View>
              <Text style={styles.xpBarLabel}>GLOBAL RANK</Text>
              <Text style={[styles.xpBarPercent, { color: aura.glowHex }]}>
                {xpProgress.progressPercentage.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.xpBarTrack}>
              <View
                style={[styles.xpBarFill, {
                  width: `${Math.max(2, xpProgress.progressPercentage)}%`,
                  backgroundColor: aura.glowHex,
                }]}
              />
            </View>
            <Text style={styles.xpBarSubtext}>
              {xpProgress.xpInCurrentLevel} / {xpProgress.xpNeededForNextLevel} XP to Level {xpProgress.currentLevel + 1}
            </Text>
          </View>
        </MotiView>

        {/* ── Active Pillars & Radar ──────────────────────── */}
        {enabledPillars.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚡ SKILLS CENTERS</Text>

            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'timing', duration: 500, delay: 500 }}
              style={{ width: '100%' }}
            >
              <RadarChart
                data={{
                  physical: user.pillarXp?.physical || 0,
                  mental: user.pillarXp?.mental || 0,
                  wealth: user.pillarXp?.wealth || 0,
                  vitality: user.pillarXp?.vitality || 0,
                }}
                size={300}
              />
            </MotiView>

            <View style={styles.pillarGrid}>
              {enabledPillars.map((pillar, i) => {
                const config = PILLAR_CONFIG[pillar];
                const xp = user.pillarXp?.[pillar] || 0;
                const level = calculatePillarLevel(xp);
                return (
                  <MotiView
                    key={pillar}
                    from={{ opacity: 0, translateX: -20 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ type: 'timing', duration: 400, delay: 600 + i * 100 }}
                  >
                    <View style={[styles.pillarCard, { borderLeftColor: config.color }]}>
                      <View style={styles.pillarCardHeader}>
                        <View style={[styles.pillarIconBg, { backgroundColor: config.color + '15' }]}>
                          <Ionicons name={config.icon as any} size={18} color={config.color} />
                        </View>
                        <View style={styles.pillarCardInfo}>
                          <Text style={[styles.pillarName, { color: config.color }]}>
                            {config.label}
                          </Text>
                          <Text style={styles.pillarLevel}>Lv. {level}</Text>
                        </View>
                        <Text style={[styles.pillarLevelBadge, { color: config.color, backgroundColor: config.color + '12' }]}>
                          {xp} XP
                        </Text>
                      </View>
                      <View style={styles.pillarXpTrack}>
                        <View style={[styles.pillarXpFill, {
                          backgroundColor: config.color,
                          width: `${Math.min(100, (xp % 100))}%`,
                        }]} />
                      </View>
                    </View>
                  </MotiView>
                );
              })}
            </View>
          </View>
        )}

        {/* ── Daily Quests ──────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 DAILY QUESTS</Text>
          {quests.map((quest, i) => {
            if (!enabledPillars.includes(quest.pillar)) return null;
            const config = PILLAR_CONFIG[quest.pillar];
            return (
              <MotiView
                key={quest.id}
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 300, delay: 700 + i * 80 }}
              >
                <Pressable
                  onPress={() => !quest.isCompleted && completeQuest(quest.id)}
                  disabled={quest.isCompleted}
                >
                  <View style={[styles.questCard, quest.isCompleted && styles.questCompleted]}>
                    <View style={[styles.questPillarDot, { backgroundColor: config.color }]} />
                    <View style={styles.questInfo}>
                      <Text style={[styles.questText, quest.isCompleted && styles.questTextCompleted]}>
                        {quest.questDescription}
                      </Text>
                      <Text style={[styles.questXp, { color: config.color }]}>
                        +{quest.xpReward} XP
                      </Text>
                    </View>
                    {quest.isCompleted && (
                      <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                    )}
                  </View>
                </Pressable>
              </MotiView>
            );
          })}
        </View>

        {/* Bottom spacer for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a14',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  // ── Ring ────────────────────────────────────
  ringContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  ringCenter: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringInitial: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
  },
  // ── User Info ──────────────────────────────
  username: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 4,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#555',
    textAlign: 'center',
    letterSpacing: 2,
    marginTop: 4,
  },
  titleText: {
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 3,
    marginTop: 2,
  },
  // ── XP Bar (Global Rank Card) ──────────────
  xpBarContainer: {
    width: '100%',
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  xpBarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  xpBarLevelBadge: {
    backgroundColor: '#E63946',
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  xpBarLevelText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 17,
  },
  xpBarLabel: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 2,
    flex: 1,
  },
  xpBarPercent: {
    fontWeight: '900',
    fontSize: 18,
  },
  xpBarTrack: {
    height: 10,
    backgroundColor: '#0f0f1e',
    borderRadius: 5,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  xpBarSubtext: {
    color: '#555',
    fontSize: 12,
    marginTop: 12,
  },
  // ── Sections ───────────────────────────────
  section: {
    width: '100%',
    marginTop: 28,
  },
  sectionTitle: {
    color: '#888',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 12,
  },
  // ── Pillar Cards ──────────────────────────
  pillarGrid: {
    gap: 12,
  },
  pillarCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2a2a3e',
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  pillarCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  pillarIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillarCardInfo: {
    marginLeft: 12,
    flex: 1,
  },
  pillarName: {
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 1,
  },
  pillarLevel: {
    color: '#555',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  pillarLevelBadge: {
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
    letterSpacing: 0.5,
  },
  pillarXpTrack: {
    height: 5,
    backgroundColor: '#0f0f1e',
    borderRadius: 3,
    overflow: 'hidden',
  },
  pillarXpFill: {
    height: '100%',
    borderRadius: 3,
  },
  // ── Quests ─────────────────────────────────
  questCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  questCompleted: {
    opacity: 0.35,
  },
  questPillarDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  questInfo: {
    flex: 1,
  },
  questText: {
    color: '#ddd',
    fontSize: 14,
    fontWeight: '600',
  },
  questTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#555',
  },
  questXp: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
});
