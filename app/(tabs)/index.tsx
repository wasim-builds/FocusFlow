import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, useColorScheme, SafeAreaView,
  ScrollView, Dimensions, Animated,
} from 'react-native';
import { CircularProgress } from '../../components/CircularProgress';
import { SessionTypeToggle } from '../../components/SessionTypeToggle';
import { TimerControls } from '../../components/TimerControls';
import { useTimer } from '../../hooks/useTimer';
import { useTimerStore } from '../../stores/timerStore';
import { useTaskStore } from '../../stores/taskStore';
import { useStatsStore } from '../../stores/statsStore';
import { formatTime } from '../../utils/time';
import { Colors } from '../../constants/colors';
import { SESSION_TYPES, SessionType } from '../../constants/timer';

const { width } = Dimensions.get('window');
const RING_SIZE = Math.min(width * 0.72, 300);

const getModeColors = (mode: SessionType) => {
  if (mode === SESSION_TYPES.FOCUS) return Colors.focus;
  if (mode === SESSION_TYPES.SHORT_BREAK) return Colors.shortBreak;
  return Colors.longBreak;
};

export default function TimerScreen() {
  const colorScheme = useColorScheme();
  const { settings } = useTimerStore();
  const isDark = settings.darkMode !== null ? settings.darkMode : colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;
  const { tasks, activeTaskId, setActiveTask } = useTaskStore();
  const { loadSessions } = useStatsStore();
  const { loadSettings, loadTasks } = { loadSettings: useTimerStore(s => s.loadSettings), loadTasks: useTaskStore(s => s.loadTasks) };

  const scale = useRef(new Animated.Value(1)).current;
  const animatedStyle = { transform: [{ scale }] };

  const { timeLeft, isRunning, mode, progress, startTimer, pauseTimer, resetTimer, skipSession } =
    useTimer((completedMode) => {
      if (completedMode === SESSION_TYPES.FOCUS) {
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.05, duration: 150, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]).start();
      }
    });

  useEffect(() => {
    loadSettings();
    loadTasks();
    loadSessions();
  }, []);

  const modeColors = getModeColors(mode);
  const activeTask = tasks.find((t) => t.id === activeTaskId);

  const bgColor = isDark
    ? mode === SESSION_TYPES.FOCUS ? Colors.focus.bgDark
      : mode === SESSION_TYPES.SHORT_BREAK ? Colors.shortBreak.bgDark
      : Colors.longBreak.bgDark
    : mode === SESSION_TYPES.FOCUS ? Colors.focus.bg
      : mode === SESSION_TYPES.SHORT_BREAK ? Colors.shortBreak.bg
      : Colors.longBreak.bg;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bgColor }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={[styles.appTitle, { color: modeColors.primary }]}>FocusFlow</Text>

        {/* Mode Toggle */}
        <SessionTypeToggle
          mode={mode}
          onSelect={(m) => { resetTimer(); useTimerStore.getState().setMode(m); }}
          isDark={isDark}
        />

        {/* Timer Ring */}
        <Animated.View style={[styles.ringWrapper, animatedStyle]}>
          <CircularProgress
            progress={progress}
            size={RING_SIZE}
            strokeWidth={12}
            color={modeColors.primary}
            bgColor={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}
          />
          <View style={styles.timeOverlay}>
            <Text style={[styles.timerText, { color: theme.text }]}>{formatTime(timeLeft)}</Text>
            <Text style={[styles.modeLabel, { color: modeColors.primary }]}>
              {mode === SESSION_TYPES.FOCUS ? '🎯 Focus' : mode === SESSION_TYPES.SHORT_BREAK ? '☕ Short Break' : '🌿 Long Break'}
            </Text>
          </View>
        </Animated.View>

        {/* Active Task Chip */}
        {activeTask && (
          <View style={[styles.taskChip, { backgroundColor: modeColors.primary + '22', borderColor: modeColors.primary + '44' }]}>
            <Text style={[styles.taskChipText, { color: modeColors.primary }]} numberOfLines={1}>
              📌 {activeTask.title}
            </Text>
          </View>
        )}

        {/* Controls */}
        <TimerControls
          isRunning={isRunning}
          onStart={() => startTimer()}
          onPause={pauseTimer}
          onReset={resetTimer}
          onSkip={skipSession}
          accentColor={modeColors.primary}
          isDark={isDark}
        />

        {/* Session dots */}
        <View style={styles.dotsRow}>
          {Array.from({ length: useTimerStore.getState().settings.sessionsBeforeLongBreak }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i < useTimerStore.getState().completedSessions % useTimerStore.getState().settings.sessionsBeforeLongBreak
                      ? modeColors.primary
                      : isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
                },
              ]}
            />
          ))}
        </View>

        <Text style={[styles.hint, { color: theme.textSecondary }]}>
          {isRunning ? 'Stay focused 💪' : 'Press play to start your session'}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 24,
    gap: 28,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  ringWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeOverlay: {
    position: 'absolute',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 58,
    fontWeight: '700',
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
  },
  modeLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  taskChip: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxWidth: '90%',
  },
  taskChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  hint: {
    fontSize: 13,
    fontWeight: '400',
  },
});
