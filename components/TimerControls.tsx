import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  accentColor: string;
  isDark: boolean;
}

export const TimerControls: React.FC<Props> = ({
  isRunning, onStart, onPause, onReset, onSkip, accentColor, isDark,
}) => {
  const iconColor = isDark ? '#ddd' : '#555';

  return (
    <View style={styles.row}>
      {/* Reset */}
      <TouchableOpacity onPress={onReset} style={styles.secondaryBtn} activeOpacity={0.7}>
        <Ionicons name="refresh" size={24} color={iconColor} />
      </TouchableOpacity>

      {/* Main play/pause */}
      <TouchableOpacity
        onPress={isRunning ? onPause : onStart}
        style={[styles.mainBtn, { backgroundColor: accentColor }]}
        activeOpacity={0.8}
      >
        <Ionicons
          name={isRunning ? 'pause' : 'play'}
          size={30}
          color="#fff"
          style={isRunning ? {} : { marginLeft: 4 }}
        />
      </TouchableOpacity>

      {/* Skip */}
      <TouchableOpacity onPress={onSkip} style={styles.secondaryBtn} activeOpacity={0.7}>
        <Ionicons name="play-skip-forward" size={24} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  mainBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  secondaryBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
