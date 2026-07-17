import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  useColorScheme, Switch, Share, Alert,
} from 'react-native';
import { useTimerStore } from '../../stores/timerStore';
import { useGoalsStore } from '../../stores/goalsStore';
import { useStatsStore } from '../../stores/statsStore';
import { Colors } from '../../constants/colors';
import { formatDuration } from '../../utils/time';
import Slider from '@react-native-community/slider';

const Row: React.FC<{ label: string; children: React.ReactNode; isDark: boolean }> = ({ label, children, isDark }) => {
  const theme = isDark ? Colors.dark : Colors.light;
  return (
    <View style={[styles.row, { borderBottomColor: theme.border }]}>
      <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
      {children}
    </View>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode; isDark: boolean }> = ({ title, children, isDark }) => {
  const theme = isDark ? Colors.dark : Colors.light;
  return (
    <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.sectionTitle, { color: Colors.focus.primary }]}>{title}</Text>
      {children}
    </View>
  );
};

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const { settings, updateSettings } = useTimerStore();
  const { goals, updateGoals, loadGoals } = useGoalsStore();
  const { sessions } = useStatsStore();
  const isDark = settings.darkMode !== null ? settings.darkMode : colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  useEffect(() => { loadGoals(); }, []);

  const handleExportData = async () => {
    const focusSessions = sessions.filter((s) => s.type === 'focus');
    const totalMin = Math.round(focusSessions.reduce((a, s) => a + s.durationSec, 0) / 60);
    const lines = [
      'FocusFlow Data Export',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      `Total Pomodoros: ${focusSessions.length}`,
      `Total Focus Time: ${totalMin} minutes`,
      '',
      'Session Log:',
      ...sessions.map((s) =>
        `${new Date(s.completedAt).toLocaleString()} | ${s.type} | ${Math.round(s.durationSec / 60)}min`
      ),
    ];
    try {
      await Share.share({ message: lines.join('\n'), title: 'FocusFlow Stats Export' });
    } catch {
      Alert.alert('Error', 'Could not share data.');
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.header, { color: theme.text }]}>Settings</Text>

        {/* Timer Durations */}
        <Section title="⏱  Timer Durations" isDark={isDark}>
          <Row label={`Focus: ${settings.focusMin} min`} isDark={isDark}>
            <Slider style={{ width: 140 }} minimumValue={5} maximumValue={60} step={5}
              value={settings.focusMin} onValueChange={(v) => updateSettings({ focusMin: v })}
              minimumTrackTintColor={Colors.focus.primary} thumbTintColor={Colors.focus.primary} />
          </Row>
          <Row label={`Short Break: ${settings.shortBreakMin} min`} isDark={isDark}>
            <Slider style={{ width: 140 }} minimumValue={1} maximumValue={15} step={1}
              value={settings.shortBreakMin} onValueChange={(v) => updateSettings({ shortBreakMin: v })}
              minimumTrackTintColor={Colors.shortBreak.primary} thumbTintColor={Colors.shortBreak.primary} />
          </Row>
          <Row label={`Long Break: ${settings.longBreakMin} min`} isDark={isDark}>
            <Slider style={{ width: 140 }} minimumValue={5} maximumValue={30} step={5}
              value={settings.longBreakMin} onValueChange={(v) => updateSettings({ longBreakMin: v })}
              minimumTrackTintColor={Colors.longBreak.primary} thumbTintColor={Colors.longBreak.primary} />
          </Row>
          <Row label={`Long break after ${settings.sessionsBeforeLongBreak} sessions`} isDark={isDark}>
            <Slider style={{ width: 140 }} minimumValue={2} maximumValue={8} step={1}
              value={settings.sessionsBeforeLongBreak} onValueChange={(v) => updateSettings({ sessionsBeforeLongBreak: v })}
              minimumTrackTintColor={Colors.longBreak.primary} thumbTintColor={Colors.longBreak.primary} />
          </Row>
        </Section>

        {/* Focus Goals */}
        <Section title="🎯  Focus Goals" isDark={isDark}>
          <Row label={`Daily Goal: ${goals.dailyFocusMin} min`} isDark={isDark}>
            <Slider style={{ width: 140 }} minimumValue={30} maximumValue={480} step={30}
              value={goals.dailyFocusMin} onValueChange={(v) => updateGoals({ dailyFocusMin: v })}
              minimumTrackTintColor={Colors.focus.primary} thumbTintColor={Colors.focus.primary} />
          </Row>
          <Row label={`Weekly Goal: ${formatDuration(goals.weeklyFocusMin * 60)}`} isDark={isDark}>
            <Slider style={{ width: 140 }} minimumValue={60} maximumValue={3000} step={60}
              value={goals.weeklyFocusMin} onValueChange={(v) => updateGoals({ weeklyFocusMin: v })}
              minimumTrackTintColor={Colors.shortBreak.primary} thumbTintColor={Colors.shortBreak.primary} />
          </Row>
        </Section>

        {/* Preferences */}
        <Section title="🔔  Preferences" isDark={isDark}>
          <Row label="Vibration" isDark={isDark}>
            <Switch value={settings.vibrationEnabled} onValueChange={(v) => updateSettings({ vibrationEnabled: v })}
              trackColor={{ true: Colors.focus.primary }} />
          </Row>
          <Row label="Auto-start next session" isDark={isDark}>
            <Switch value={settings.autoStartNext} onValueChange={(v) => updateSettings({ autoStartNext: v })}
              trackColor={{ true: Colors.focus.primary }} />
          </Row>
          <Row label="Dark Mode" isDark={isDark}>
            <Switch value={isDark} onValueChange={(v) => updateSettings({ darkMode: v })}
              trackColor={{ true: Colors.focus.primary }} />
          </Row>
        </Section>

        {/* Data */}
        <Section title="📤  Data" isDark={isDark}>
          <Row label={`${sessions.length} sessions recorded`} isDark={isDark}>
            <Text onPress={handleExportData} style={[styles.exportBtn, { color: Colors.focus.primary }]}>
              Export →
            </Text>
          </Row>
        </Section>

        {/* About */}
        <Section title="ℹ️  About" isDark={isDark}>
          <View style={styles.aboutRow}>
            <Text style={[styles.aboutText, { color: theme.textSecondary }]}>
              FocusFlow v2.0 — Stay in the zone. 🍅{'\n'}Built with ❤️ using Expo + React Native
            </Text>
          </View>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40, gap: 16 },
  header: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  section: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', paddingTop: 12, paddingBottom: 4, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: { fontSize: 14, fontWeight: '500', flex: 1 },
  exportBtn: { fontSize: 15, fontWeight: '700' },
  aboutRow: { paddingVertical: 12 },
  aboutText: { fontSize: 13, lineHeight: 20 },
});
