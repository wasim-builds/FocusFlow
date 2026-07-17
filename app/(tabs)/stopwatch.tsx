import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  useColorScheme, ScrollView, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useTimerStore } from '../../stores/timerStore';

interface Lap {
  id: number;
  lapTime: number;   // ms for this lap
  totalTime: number; // ms total at this lap
}

const formatStopwatch = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const centiseconds = Math.floor((ms % 1000) / 10);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
};

const formatLapTime = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const centiseconds = Math.floor((ms % 1000) / 10);
  if (minutes > 0) return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
  return `${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
};

export default function StopwatchScreen() {
  const colorScheme = useColorScheme();
  const { settings } = useTimerStore();
  const isDark = settings.darkMode !== null ? settings.darkMode : colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const [lapStart, setLapStart] = useState(0);

  const startTime = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const savedElapsed = useRef(0);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const start = () => {
    startTime.current = Date.now() - savedElapsed.current;
    intervalRef.current = setInterval(() => {
      setElapsed(Date.now() - startTime.current);
    }, 10);
    setIsRunning(true);
  };

  const pause = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    savedElapsed.current = elapsed;
    setIsRunning(false);
  };

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setElapsed(0);
    setLaps([]);
    setLapStart(0);
    savedElapsed.current = 0;
  };

  const lap = () => {
    const lapTime = elapsed - lapStart;
    setLaps((prev) => [
      { id: prev.length + 1, lapTime, totalTime: elapsed },
      ...prev,
    ]);
    setLapStart(elapsed);
  };

  // Find fastest/slowest lap
  const lapTimes = laps.map((l) => l.lapTime);
  const minLap = laps.length > 1 ? Math.min(...lapTimes) : -1;
  const maxLap = laps.length > 1 ? Math.max(...lapTimes) : -1;

  const accentColor = '#667EEA';
  const accentLight = '#764BA2';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <Text style={[styles.header, { color: theme.text }]}>Stopwatch</Text>

        {/* Time Display */}
        <View style={[styles.timeCard, {
          backgroundColor: isDark ? '#1a1a2e' : '#f0f0ff',
          borderColor: accentColor + '33',
        }]}>
          <Text style={[styles.timeText, { color: theme.text }]}>
            {formatStopwatch(elapsed)}
          </Text>
          {laps.length > 0 && (
            <Text style={[styles.lapLabel, { color: accentColor }]}>
              Lap {laps.length + 1} — {formatLapTime(elapsed - lapStart)}
            </Text>
          )}
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {/* Lap / Reset */}
          <TouchableOpacity
            onPress={isRunning ? lap : reset}
            style={[styles.secondaryBtn, {
              backgroundColor: isDark ? '#2a2a40' : '#e8e8f0',
              opacity: !isRunning && elapsed === 0 ? 0.4 : 1,
            }]}
            disabled={!isRunning && elapsed === 0}
            activeOpacity={0.7}
          >
            <Text style={[styles.secondaryBtnText, { color: theme.text }]}>
              {isRunning ? 'Lap' : 'Reset'}
            </Text>
          </TouchableOpacity>

          {/* Start / Stop */}
          <TouchableOpacity
            onPress={isRunning ? pause : start}
            style={[styles.mainBtn, {
              backgroundColor: isRunning ? '#FF6B6B' : accentColor,
            }]}
            activeOpacity={0.8}
          >
            <Text style={styles.mainBtnText}>
              {isRunning ? 'Stop' : elapsed === 0 ? 'Start' : 'Resume'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Lap List */}
        {laps.length > 0 && (
          <View style={[styles.lapTable, { borderColor: theme.border }]}>
            {/* Header */}
            <View style={[styles.lapRow, styles.lapHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.lapHeaderText, { color: theme.textSecondary }]}>Lap</Text>
              <Text style={[styles.lapHeaderText, { color: theme.textSecondary }]}>Lap Time</Text>
              <Text style={[styles.lapHeaderText, { color: theme.textSecondary }]}>Overall</Text>
            </View>
            <FlatList
              data={laps}
              keyExtractor={(item) => String(item.id)}
              style={{ maxHeight: 260 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isFastest = item.lapTime === minLap;
                const isSlowest = item.lapTime === maxLap;
                const lapColor = isFastest ? '#4ECDC4' : isSlowest ? '#FF6B6B' : theme.text;
                return (
                  <View style={[styles.lapRow, { borderBottomColor: theme.border + '55' }]}>
                    <Text style={[styles.lapCell, { color: lapColor }]}>
                      {isFastest ? '🟢' : isSlowest ? '🔴' : ''} {item.id}
                    </Text>
                    <Text style={[styles.lapCell, { color: lapColor, fontWeight: '600' }]}>
                      {formatLapTime(item.lapTime)}
                    </Text>
                    <Text style={[styles.lapCell, { color: theme.textSecondary }]}>
                      {formatLapTime(item.totalTime)}
                    </Text>
                  </View>
                );
              }}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  header: { fontSize: 28, fontWeight: '800', marginBottom: 24 },
  timeCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
  },
  timeText: {
    fontSize: 56,
    fontWeight: '200',
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
  },
  lapLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  mainBtn: {
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  mainBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryBtn: {
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 40,
  },
  secondaryBtnText: {
    fontSize: 17,
    fontWeight: '600',
  },
  lapTable: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  lapRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  lapHeader: {
    paddingVertical: 10,
  },
  lapHeaderText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  lapCell: {
    flex: 1,
    fontSize: 14,
  },
});
