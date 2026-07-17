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

// GitHub-style heatmap for last 10 weeks (70 days)
const HeatmapGrid: React.FC<{ sessions: any[]; isDark: boolean }> = ({ sessions, isDark }) => {
  const theme = isDark ? Colors.dark : Colors.light;
  const weeks = 10;
  const days = weeks * 7;
  const today = new Date(); today.setHours(23, 59, 59, 999);
  const startDate = new Date(today); startDate.setDate(startDate.getDate() - days + 1); startDate.setHours(0, 0, 0, 0);

  // Build day map
  const dayMap: Record<string, number> = {};
  sessions.filter(s => s.type === 'focus').forEach(s => {
    const d = new Date(s.completedAt);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString().slice(0, 10);
    dayMap[key] = (dayMap[key] || 0) + s.durationSec;
  });

  const maxSec = Math.max(...Object.values(dayMap), 1);
  const grid: { date: Date; sec: number }[][] = [];

  let current = new Date(startDate);
  for (let w = 0; w < weeks; w++) {
    const week: { date: Date; sec: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const key = current.toISOString().slice(0, 10);
      week.push({ date: new Date(current), sec: dayMap[key] || 0 });
      current.setDate(current.getDate() + 1);
    }
    grid.push(week);
  }

  const getColor = (sec: number) => {
    if (sec === 0) return isDark ? '#1e1e2e' : '#f0f0f0';
    const ratio = sec / maxSec;
    if (ratio < 0.25) return '#FF6B6B44';
    if (ratio < 0.5) return '#FF6B6B88';
    if (ratio < 0.75) return '#FF6B6BBB';
    return '#FF6B6B';
  };

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <View style={[styles.heatmapCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.chartTitle, { color: theme.text }]}>📅 Focus Calendar</Text>
      <Text style={[styles.chartSub, { color: theme.textSecondary }]}>Last 10 weeks</Text>
      <View style={styles.heatmapOuter}>
        {/* Day labels */}
        <View style={styles.dayLabels}>
          {dayLabels.map((l, i) => (
            <Text key={i} style={[styles.dayLabel, { color: theme.textSecondary }]}>{l}</Text>
          ))}
        </View>
        {/* Grid */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.heatmapGrid}>
            {grid.map((week, wi) => (
              <View key={wi} style={styles.heatmapCol}>
                {week.map((cell, di) => (
                  <View
                    key={di}
                    style={[styles.heatmapCell, { backgroundColor: getColor(cell.sec) }]}
                  />
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
      {/* Legend */}
      <View style={styles.legendRow}>
        <Text style={[styles.legendLabel, { color: theme.textSecondary }]}>Less</Text>
        {[0, 0.25, 0.5, 0.75, 1].map((r, i) => (
          <View key={i} style={[styles.legendCell, { backgroundColor: getColor(r * maxSec) }]} />
        ))}
        <Text style={[styles.legendLabel, { color: theme.textSecondary }]}>More</Text>
      </View>
    </View>
  );
};

// Weekly bar chart
const WeeklyChart: React.FC<{ sessions: any[]; isDark: boolean }> = ({ sessions, isDark }) => {
  const theme = isDark ? Colors.dark : Colors.light;
  const days: { label: string; sec: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
    const next = new Date(d); next.setDate(next.getDate() + 1);
    const sec = sessions.filter(s => s.type === 'focus' && s.completedAt >= d.getTime() && s.completedAt < next.getTime())
      .reduce((a, s) => a + s.durationSec, 0);
    days.push({ label: d.toLocaleDateString('en-US', { weekday: 'short' }), sec });
  }
  const maxSec = Math.max(...days.map(d => d.sec), 1);
  const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'short' });

  return (
    <View style={[styles.heatmapCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.chartTitle, { color: theme.text }]}>📊 This Week</Text>
      <View style={styles.chartRow}>
        {days.map((d, i) => {
          const isToday = d.label === todayLabel;
          return (
            <View key={i} style={styles.barCol}>
              <Text style={[styles.barValue, { color: Colors.focus.primary, opacity: d.sec > 0 ? 1 : 0 }]}>
                {Math.round(d.sec / 60)}m
              </Text>
              <View style={styles.barWrapper}>
                <View style={[styles.bar, {
                  height: Math.max(4, (d.sec / maxSec) * 110),
                  backgroundColor: isToday ? Colors.focus.primary : (d.sec > 0 ? Colors.focus.primary + '88' : (isDark ? '#2a2a40' : '#eee')),
                }]} />
              </View>
              <Text style={[styles.barLabel, { color: isToday ? Colors.focus.primary : theme.textSecondary, fontWeight: isToday ? '700' : '500' }]}>{d.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default function StatsScreen() {
  const colorScheme = useColorScheme();
  const { settings } = useTimerStore();
  const isDark = settings.darkMode !== null ? settings.darkMode : colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;
  const { loadSessions, getTodayFocusSec, getWeekFocusSec, getTodayPomodoros, getStreak, sessions } = useStatsStore();

  useEffect(() => { loadSessions(); }, []);

  const todaySec = getTodayFocusSec();
  const weekSec = getWeekFocusSec();
  const todayPomodoros = getTodayPomodoros();
  const streak = getStreak();
  const allTimePomodoros = sessions.filter(s => s.type === 'focus').length;
  const allTimeSec = sessions.filter(s => s.type === 'focus').reduce((a, s) => a + s.durationSec, 0);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.header, { color: theme.text }]}>Stats</Text>

        {/* Streak Banner */}
        {streak > 0 && (
          <View style={[styles.streakBanner, { backgroundColor: '#FF950022', borderColor: '#FF9500' }]}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <View>
              <Text style={[styles.streakTitle, { color: '#FF9500' }]}>{streak}-Day Streak!</Text>
              <Text style={[styles.streakSub, { color: theme.textSecondary }]}>Keep it going — don't break the chain!</Text>
            </View>
          </View>
        )}

        {/* Stat Cards */}
        <View style={styles.grid}>
          <StatCard label="Today's Focus" value={formatDuration(todaySec)} emoji="🎯" accent={Colors.focus.primary} isDark={isDark} />
          <StatCard label="This Week" value={formatDuration(weekSec)} emoji="📅" accent={Colors.shortBreak.primary} isDark={isDark} />
          <StatCard label="Today's 🍅" value={String(todayPomodoros)} emoji="🍅" accent={Colors.focus.primary} isDark={isDark} />
          <StatCard label="All-Time 🍅" value={String(allTimePomodoros)} emoji="🏆" accent="#FF9500" isDark={isDark} />
          <StatCard label="All-Time Focus" value={formatDuration(allTimeSec)} emoji="⏳" accent={Colors.longBreak.primary} isDark={isDark} />
          <StatCard label="Streak" value={`${streak}d 🔥`} emoji="💪" accent="#FF9500" isDark={isDark} />
        </View>

        {/* Weekly Chart */}
        <WeeklyChart sessions={sessions} isDark={isDark} />

        {/* Heatmap Calendar */}
        <HeatmapGrid sessions={sessions} isDark={isDark} />

        {sessions.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Complete your first focus session to see your stats!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40, gap: 16 },
  header: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
  },
  streakEmoji: { fontSize: 32 },
  streakTitle: { fontSize: 18, fontWeight: '800' },
  streakSub: { fontSize: 13, marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    flex: 1, minWidth: '44%', borderRadius: 16, borderWidth: 1,
    padding: 16, alignItems: 'center', gap: 4,
  },
  cardEmoji: { fontSize: 26 },
  cardValue: { fontSize: 24, fontWeight: '800' },
  cardLabel: { fontSize: 11, fontWeight: '500', textAlign: 'center' },
  heatmapCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  chartTitle: { fontSize: 16, fontWeight: '700' },
  chartSub: { fontSize: 12, marginTop: -8 },
  heatmapOuter: { flexDirection: 'row', gap: 6 },
  dayLabels: { gap: 4, paddingTop: 2 },
  dayLabel: { fontSize: 9, fontWeight: '600', height: 14, lineHeight: 14 },
  heatmapGrid: { flexDirection: 'row', gap: 4 },
  heatmapCol: { gap: 4 },
  heatmapCell: { width: 13, height: 13, borderRadius: 3 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendLabel: { fontSize: 10 },
  legendCell: { width: 13, height: 13, borderRadius: 3 },
  chartRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  barWrapper: { height: 110, justifyContent: 'flex-end', width: '100%', alignItems: 'center' },
  bar: { width: '75%', borderRadius: 6, minHeight: 4 },
  barLabel: { fontSize: 11 },
  barValue: { fontSize: 9, fontWeight: '700' },
  empty: { alignItems: 'center', marginTop: 20, gap: 8 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: 15, textAlign: 'center' },
});
