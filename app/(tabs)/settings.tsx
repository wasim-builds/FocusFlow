import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  useColorScheme, Switch, TouchableOpacity, Alert,
} from 'react-native';
import { useTimerStore } from '../../stores/timerStore';
import { Colors } from '../../constants/colors';
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
  const isDark = settings.darkMode !== null ? settings.darkMode : colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.header, { color: theme.text }]}>Settings</Text>

        {/* Durations */}
        <Section title="⏱  Durations" isDark={isDark}>
          <Row label={`Focus: ${settings.focusMin} min`} isDark={isDark}>
            <Slider
              style={{ width: 140 }}
              minimumValue={5}
              maximumValue={60}
              step={5}
              value={settings.focusMin}
              onValueChange={(v) => updateSettings({ focusMin: v })}
              minimumTrackTintColor={Colors.focus.primary}
              thumbTintColor={Colors.focus.primary}
            />
          </Row>
          <Row label={`Short Break: ${settings.shortBreakMin} min`} isDark={isDark}>
            <Slider
              style={{ width: 140 }}
              minimumValue={1}
              maximumValue={15}
              step={1}
              value={settings.shortBreakMin}
              onValueChange={(v) => updateSettings({ shortBreakMin: v })}
              minimumTrackTintColor={Colors.shortBreak.primary}
              thumbTintColor={Colors.shortBreak.primary}
            />
          </Row>
          <Row label={`Long Break: ${settings.longBreakMin} min`} isDark={isDark}>
            <Slider
              style={{ width: 140 }}
              minimumValue={5}
              maximumValue={30}
              step={5}
              value={settings.longBreakMin}
              onValueChange={(v) => updateSettings({ longBreakMin: v })}
              minimumTrackTintColor={Colors.longBreak.primary}
              thumbTintColor={Colors.longBreak.primary}
            />
          </Row>
          <Row label={`Long break after ${settings.sessionsBeforeLongBreak} sessions`} isDark={isDark}>
            <Slider
              style={{ width: 140 }}
              minimumValue={2}
              maximumValue={8}
              step={1}
              value={settings.sessionsBeforeLongBreak}
              onValueChange={(v) => updateSettings({ sessionsBeforeLongBreak: v })}
              minimumTrackTintColor={Colors.longBreak.primary}
              thumbTintColor={Colors.longBreak.primary}
            />
          </Row>
        </Section>

        {/* Preferences */}
        <Section title="🔔  Preferences" isDark={isDark}>
          <Row label="Vibration" isDark={isDark}>
            <Switch
              value={settings.vibrationEnabled}
              onValueChange={(v) => updateSettings({ vibrationEnabled: v })}
              trackColor={{ true: Colors.focus.primary }}
            />
          </Row>
          <Row label="Auto-start next session" isDark={isDark}>
            <Switch
              value={settings.autoStartNext}
              onValueChange={(v) => updateSettings({ autoStartNext: v })}
              trackColor={{ true: Colors.focus.primary }}
            />
          </Row>
          <Row label="Dark Mode" isDark={isDark}>
            <Switch
              value={isDark}
              onValueChange={(v) => updateSettings({ darkMode: v })}
              trackColor={{ true: Colors.focus.primary }}
            />
          </Row>
        </Section>

        {/* About */}
        <Section title="ℹ️  About" isDark={isDark}>
          <View style={styles.aboutRow}>
            <Text style={[styles.aboutText, { color: theme.textSecondary }]}>
              FocusFlow v1.0.0 — Stay in the zone. 🍅
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
  section: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    paddingTop: 12,
    paddingBottom: 4,
    paddingHorizontal: 16,
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: { fontSize: 14, fontWeight: '500', flex: 1 },
  aboutRow: { paddingVertical: 12 },
  aboutText: { fontSize: 13 },
});
