import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, useColorScheme,
} from 'react-native';
import { useStatsStore } from '../../stores/statsStore';
import { useTimerStore } from '../../stores/timerStore';
import { Colors } from '../../constants/colors';
import { formatDuration } from '../../utils/time';

const StatCard: React.FC<{ label: string; value: string; emoji: string; accent: string; isDark: boolean }> = ({
  label, value, emoji, accent, isDark,
}) => {
  const theme = isDark ? Colors.dark : Colors.light;
  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={styles.cardEmoji}>{emoji}</Text>
      <Text style={[styles.cardValue, { color: accent }]}>{value}</Text>
      <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
};

export default function StatsScreen() {
  const colorScheme = useColorScheme();
  const { settings } = useTimerStore();
  const isDark = settings.darkMode !== null ? settings.darkMode : colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const { loadSessions, getTodayFocusSec, getWeekFocusSec, getTodayPomodoros, getStreak, sessions } =
    useStatsStore();

  useEffect(() => { loadSessions(); }, []);

  const todaySec = getTodayFocusSec();
  const weekSec = getWeekFocusSec();
  const todayPomodoros = getTodayPomodoros();
  const streak = getStreak();

  // Build last 7 days bar chart data
  const days: { label: string; sec: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const next = new Date(d); next.setDate(next.getDate() + 1);
    const sec = sessions
      .filter((s) => s.type === 'focus' && s.completedAt >= d.getTime() && s.completedAt < next.getTime())
      .reduce((acc, s) => acc + s.durationSec, 0);
    days.push({ label: d.toLocaleDateString('en-US', { weekday: 'short' }), sec });
  }

  const maxSec = Math.max(...days.map((d) => d.sec), 1);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.header, { color: theme.text }]}>Stats</Text>

        {/* Stat cards */}
        <View style={styles.grid}>
          <StatCard label="Today's Focus" value={formatDuration(todaySec)} emoji="🎯" accent={Colors.focus.primary} isDark={isDark} />
          <StatCard label="This Week" value={formatDuration(weekSec)} emoji="📅" accent={Colors.shortBreak.primary} isDark={isDark} />
          <StatCard label="Today's 🍅" value={String(todayPomodoros)} emoji="🍅" accent={Colors.focus.primary} isDark={isDark} />
          <StatCard label="Streak" value={`${streak} day${streak !== 1 ? 's' : ''}`} emoji="🔥" accent="#FF9500" isDark={isDark} />
        </View>

        {/* Weekly bar chart */}
        <View style={[styles.chartCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.chartTitle, { color: theme.text }]}>Last 7 Days</Text>
          <View style={styles.chartRow}>
            {days.map((d, i) => (
              <View key={i} style={styles.barCol}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max(4, (d.sec / maxSec) * 120),
                        backgroundColor: d.sec > 0 ? Colors.focus.primary : (isDark ? '#333' : '#eee'),
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.barLabel, { color: theme.textSecondary }]}>{d.label}</Text>
                {d.sec > 0 && (
                  <Text style={[styles.barValue, { color: Colors.focus.primary }]}>
                    {Math.round(d.sec / 60)}m
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {sessions.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Complete your first session to see stats here!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40, gap: 20 },
  header: { fontSize: 28, fontWeight: '800' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    flex: 1,
    minWidth: '44%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  cardEmoji: { fontSize: 28 },
  cardValue: { fontSize: 26, fontWeight: '800' },
  cardLabel: { fontSize: 12, fontWeight: '500', textAlign: 'center' },
  chartCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 16,
  },
  chartTitle: { fontSize: 16, fontWeight: '700' },
  chartRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  barWrapper: { height: 120, justifyContent: 'flex-end', width: '100%', alignItems: 'center' },
  bar: { width: '80%', borderRadius: 4 },
  barLabel: { fontSize: 10, fontWeight: '500' },
  barValue: { fontSize: 9, fontWeight: '700' },
  empty: { alignItems: 'center', marginTop: 20, gap: 8 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: 15, textAlign: 'center' },
});
