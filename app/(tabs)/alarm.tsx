import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, useColorScheme, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useTimerStore } from '../../stores/timerStore';
import * as Notifications from 'expo-notifications';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

const pad = (n: number) => String(n).padStart(2, '0');

export default function AlarmScreen() {
  const colorScheme = useColorScheme();
  const { settings } = useTimerStore();
  const isDark = settings.darkMode !== null ? settings.darkMode : colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const [selectedHour, setSelectedHour] = useState(new Date().getHours());
  const [selectedMin, setSelectedMin] = useState(0);
  const [alarmSet, setAlarmSet] = useState(false);
  const [alarmId, setAlarmId] = useState<string | null>(null);
  const [alarmTime, setAlarmTime] = useState<string | null>(null);

  const scheduleAlarm = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow notifications to set a Focus Alarm.');
      return;
    }

    const now = new Date();
    const alarm = new Date();
    alarm.setHours(selectedHour, selectedMin, 0, 0);

    // If time is in the past, schedule for tomorrow
    if (alarm <= now) alarm.setDate(alarm.getDate() + 1);

    const secondsUntil = Math.round((alarm.getTime() - now.getTime()) / 1000);

    if (alarmId) await Notifications.cancelScheduledNotificationAsync(alarmId);

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Focus Alarm!',
        body: `Time to start your focus session! Let's go 🚀`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: secondsUntil,
      },
    });

    setAlarmId(id);
    setAlarmSet(true);
    setAlarmTime(`${pad(selectedHour)}:${pad(selectedMin)}`);

    const hrs = Math.floor(secondsUntil / 3600);
    const mins = Math.floor((secondsUntil % 3600) / 60);
    const label = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    Alert.alert('⏰ Alarm Set!', `Focus alarm set for ${pad(selectedHour)}:${pad(selectedMin)}\nRings in ${label}`);
  };

  const cancelAlarm = async () => {
    if (alarmId) {
      await Notifications.cancelScheduledNotificationAsync(alarmId);
      setAlarmId(null);
    }
    setAlarmSet(false);
    setAlarmTime(null);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.header, { color: theme.text }]}>Focus Alarm</Text>
        <Text style={[styles.sub, { color: theme.textSecondary }]}>
          Set a reminder to start your focus session
        </Text>

        {/* Current Alarm */}
        {alarmSet && alarmTime && (
          <View style={[styles.alarmBanner, { backgroundColor: Colors.focus.primary + '18', borderColor: Colors.focus.primary }]}>
            <View>
              <Text style={[styles.alarmBannerLabel, { color: theme.textSecondary }]}>Alarm set for</Text>
              <Text style={[styles.alarmBannerTime, { color: Colors.focus.primary }]}>{alarmTime}</Text>
            </View>
            <TouchableOpacity onPress={cancelAlarm} style={styles.cancelBtn}>
              <Ionicons name="close-circle" size={28} color={Colors.focus.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Time Picker */}
        <View style={[styles.pickerCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.pickerTitle, { color: theme.text }]}>Select Time</Text>

          {/* Hour Picker */}
          <Text style={[styles.pickerLabel, { color: theme.textSecondary }]}>Hour</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
            {HOURS.map((h) => (
              <TouchableOpacity
                key={h}
                onPress={() => setSelectedHour(h)}
                style={[
                  styles.timePill,
                  {
                    backgroundColor: selectedHour === h ? Colors.focus.primary : theme.inputBg,
                    borderColor: selectedHour === h ? Colors.focus.primary : theme.border,
                  },
                ]}
              >
                <Text style={[styles.timePillText, { color: selectedHour === h ? '#fff' : theme.text }]}>
                  {pad(h)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Minute Picker */}
          <Text style={[styles.pickerLabel, { color: theme.textSecondary }]}>Minute</Text>
          <View style={styles.minuteGrid}>
            {MINUTES.map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => setSelectedMin(m)}
                style={[
                  styles.timePill,
                  {
                    backgroundColor: selectedMin === m ? Colors.focus.primary : theme.inputBg,
                    borderColor: selectedMin === m ? Colors.focus.primary : theme.border,
                  },
                ]}
              >
                <Text style={[styles.timePillText, { color: selectedMin === m ? '#fff' : theme.text }]}>
                  {pad(m)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Preview */}
          <View style={styles.preview}>
            <Text style={[styles.previewTime, { color: theme.text }]}>
              {pad(selectedHour)}:{pad(selectedMin)}
            </Text>
            <Text style={[styles.previewAmPm, { color: theme.textSecondary }]}>
              {selectedHour < 12 ? 'AM' : 'PM'}
            </Text>
          </View>
        </View>

        {/* Set Alarm Button */}
        <TouchableOpacity
          onPress={scheduleAlarm}
          style={[styles.setBtn, { backgroundColor: Colors.focus.primary }]}
          activeOpacity={0.85}
        >
          <Ionicons name="alarm" size={20} color="#fff" />
          <Text style={styles.setBtnText}>Set Focus Alarm</Text>
        </TouchableOpacity>

        {/* Tips */}
        <View style={[styles.tipsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.tipsTitle, { color: theme.text }]}>💡 Tips</Text>
          <Text style={[styles.tipText, { color: theme.textSecondary }]}>• Set alarms for your most productive hours (morning is often best)</Text>
          <Text style={[styles.tipText, { color: theme.textSecondary }]}>• Block a 2-hour window on your calendar too</Text>
          <Text style={[styles.tipText, { color: theme.textSecondary }]}>• Keep your phone nearby but face-down when focusing</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40, gap: 20 },
  header: { fontSize: 28, fontWeight: '800' },
  sub: { fontSize: 14, marginTop: -12 },
  alarmBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 16, borderWidth: 1.5, padding: 16,
  },
  alarmBannerLabel: { fontSize: 12, fontWeight: '500' },
  alarmBannerTime: { fontSize: 36, fontWeight: '800', letterSpacing: -1 },
  cancelBtn: { padding: 4 },
  pickerCard: { borderRadius: 20, borderWidth: 1, padding: 20, gap: 12 },
  pickerTitle: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  pickerLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  scrollRow: { marginBottom: 4 },
  minuteGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timePill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, marginRight: 8,
  },
  timePillText: { fontSize: 15, fontWeight: '600' },
  preview: { flexDirection: 'row', alignItems: 'baseline', gap: 8, alignSelf: 'center', marginTop: 8 },
  previewTime: { fontSize: 48, fontWeight: '200', letterSpacing: -2 },
  previewAmPm: { fontSize: 20, fontWeight: '300' },
  setBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 18, borderRadius: 16,
    shadowColor: Colors.focus.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 8,
  },
  setBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  tipsCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 8 },
  tipsTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  tipText: { fontSize: 13, lineHeight: 20 },
});
