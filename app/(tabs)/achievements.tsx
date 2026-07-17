import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  useColorScheme,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAchievementsStore } from '../../stores/achievementsStore';
import { useTimerStore } from '../../stores/timerStore';
import { Colors } from '../../constants/colors';
import type { Badge } from '../../stores/achievementsStore';

/** Format an epoch timestamp as a readable date string. */
const formatDate = (ts: number): string => {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

interface BadgeCardProps {
  badge: Badge;
  isDark: boolean;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ badge, isDark }) => {
  const theme = isDark ? Colors.dark : Colors.light;
  const unlocked = badge.unlockedAt !== null;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: unlocked ? Colors.focus.primary + '55' : theme.border,
          opacity: unlocked ? 1 : 0.4,
        },
      ]}
    >
      {/* Emoji */}
      <View style={styles.emojiWrapper}>
        <Text style={styles.emoji}>{badge.emoji}</Text>
        {/* Lock icon overlay for locked badges */}
        {!unlocked && (
          <View style={styles.lockOverlay}>
            <Ionicons name="lock-closed" size={18} color={theme.textSecondary} />
          </View>
        )}
      </View>

      <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
        {badge.title}
      </Text>

      <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>
        {badge.description}
      </Text>

      {unlocked && badge.unlockedAt !== null && (
        <View style={[styles.datePill, { backgroundColor: Colors.focus.primary + '18' }]}>
          <Ionicons name="checkmark-circle" size={11} color={Colors.focus.primary} />
          <Text style={[styles.dateText, { color: Colors.focus.primary }]}>
            {formatDate(badge.unlockedAt)}
          </Text>
        </View>
      )}
    </View>
  );
};

export default function AchievementsScreen() {
  const colorScheme = useColorScheme();
  const { settings } = useTimerStore();
  const isDark = settings.darkMode !== null ? settings.darkMode : colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const { badges, loadBadges } = useAchievementsStore();

  useEffect(() => {
    loadBadges();
  }, []);

  const unlockedCount = badges.filter((b) => b.unlockedAt !== null).length;
  const total = badges.length;

  const renderItem = ({ item, index }: { item: Badge; index: number }) => (
    <View style={index % 2 === 0 ? styles.leftCell : styles.rightCell}>
      <BadgeCard badge={item} isDark={isDark} />
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={[styles.header, { color: theme.text }]}>Achievements</Text>
        <Text style={[styles.subheader, { color: theme.textSecondary }]}>
          {unlockedCount} of {total} badges unlocked
        </Text>

        {/* Progress bar */}
        <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: Colors.focus.primary,
                width: `${total > 0 ? (unlockedCount / total) * 100 : 0}%`,
              },
            ]}
          />
        </View>

        {/* 2-column grid rendered via rows */}
        <View style={styles.grid}>
          {badges.map((badge, index) => (
            <View key={badge.id} style={styles.cell}>
              <BadgeCard badge={badge} isDark={isDark} />
            </View>
          ))}
        </View>

        {/* Empty state (no sessions yet) */}
        {unlockedCount === 0 && (
          <View style={styles.emptyHint}>
            <Text style={[styles.emptyHintText, { color: theme.textSecondary }]}>
              Complete focus sessions to earn your first badge! 🍅
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 48, gap: 12 },

  header: { fontSize: 28, fontWeight: '800', marginBottom: 2 },
  subheader: { fontSize: 14, fontWeight: '500', marginBottom: 4 },

  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
    minWidth: 6,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cell: {
    width: '47.5%',
  },
  leftCell: { width: '47.5%' },
  rightCell: { width: '47.5%' },

  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    minHeight: 150,
    justifyContent: 'center',
  },

  emojiWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  emoji: { fontSize: 38 },
  lockOverlay: {
    position: 'absolute',
    bottom: -4,
    right: -8,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 10,
    padding: 2,
  },

  title: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 15,
  },

  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginTop: 2,
  },
  dateText: {
    fontSize: 10,
    fontWeight: '600',
  },

  emptyHint: { alignItems: 'center', marginTop: 8 },
  emptyHintText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
