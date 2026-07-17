import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { SessionType, SESSION_TYPES } from '../constants/timer';
import { Colors } from '../constants/colors';

interface Props {
  mode: SessionType;
  onSelect: (mode: SessionType) => void;
  isDark: boolean;
}

const modes: { label: string; value: SessionType }[] = [
  { label: 'Focus', value: SESSION_TYPES.FOCUS },
  { label: 'Short Break', value: SESSION_TYPES.SHORT_BREAK },
  { label: 'Long Break', value: SESSION_TYPES.LONG_BREAK },
];

const getModeColor = (mode: SessionType) => {
  if (mode === SESSION_TYPES.FOCUS) return Colors.focus.primary;
  if (mode === SESSION_TYPES.SHORT_BREAK) return Colors.shortBreak.primary;
  return Colors.longBreak.primary;
};

export const SessionTypeToggle: React.FC<Props> = ({ mode, onSelect, isDark }) => {
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <View style={[styles.container, { backgroundColor: theme.inputBg }]}>
      {modes.map((m) => {
        const isActive = m.value === mode;
        const activeColor = getModeColor(m.value);
        return (
          <TouchableOpacity
            key={m.value}
            onPress={() => onSelect(m.value)}
            style={[
              styles.pill,
              isActive && { backgroundColor: activeColor },
            ]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.label,
                { color: isActive ? '#fff' : theme.textSecondary },
                isActive && styles.activeLabel,
              ]}
            >
              {m.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 50,
    padding: 4,
    gap: 4,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 50,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
  activeLabel: {
    fontWeight: '700',
  },
});
