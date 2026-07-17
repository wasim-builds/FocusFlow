import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TextInput, TouchableOpacity, useColorScheme, Alert,
} from 'react-native';
import { useTaskStore, Task } from '../../stores/taskStore';
import { useTimerStore } from '../../stores/timerStore';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOutLeft } from 'react-native-reanimated';

const TaskItem: React.FC<{
  task: Task;
  isActive: boolean;
  isDark: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onSetActive: () => void;
}> = ({ task, isActive, isDark, onToggle, onDelete, onSetActive }) => {
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <Animated.View entering={FadeInDown} exiting={FadeOutLeft}>
      <TouchableOpacity
        onLongPress={onDelete}
        onPress={onSetActive}
        style={[
          styles.taskItem,
          {
            backgroundColor: theme.card,
            borderColor: isActive ? Colors.focus.primary : theme.border,
            borderWidth: isActive ? 2 : 1,
          },
        ]}
        activeOpacity={0.85}
      >
        {/* Checkbox */}
        <TouchableOpacity onPress={onToggle} style={styles.checkbox}>
          <View
            style={[
              styles.checkCircle,
              {
                borderColor: task.isDone ? Colors.focus.primary : theme.border,
                backgroundColor: task.isDone ? Colors.focus.primary : 'transparent',
              },
            ]}
          >
            {task.isDone && <Ionicons name="checkmark" size={14} color="#fff" />}
          </View>
        </TouchableOpacity>

        {/* Title */}
        <Text
          style={[
            styles.taskTitle,
            { color: theme.text },
            task.isDone && styles.strikethrough,
          ]}
          numberOfLines={2}
        >
          {task.title}
        </Text>

        {/* Pomodoro badge */}
        {task.pomodorosCompleted > 0 && (
          <View style={[styles.badge, { backgroundColor: Colors.focus.primary + '22' }]}>
            <Text style={[styles.badgeText, { color: Colors.focus.primary }]}>
              🍅 {task.pomodorosCompleted}
            </Text>
          </View>
        )}

        {/* Active indicator */}
        {isActive && (
          <View style={[styles.activeDot, { backgroundColor: Colors.focus.primary }]} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function TasksScreen() {
  const [input, setInput] = useState('');
  const colorScheme = useColorScheme();
  const { settings } = useTimerStore();
  const isDark = settings.darkMode !== null ? settings.darkMode : colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const { tasks, addTask, toggleTask, deleteTask, activeTaskId, setActiveTask } = useTaskStore();

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    addTask(trimmed);
    setInput('');
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Delete Task', `Delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTask(id) },
    ]);
  };

  const handleSetActive = (id: string) => {
    setActiveTask(activeTaskId === id ? null : id);
  };

  const pending = tasks.filter((t) => !t.isDone);
  const done = tasks.filter((t) => t.isDone);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        {/* Header */}
        <Text style={[styles.header, { color: theme.text }]}>Tasks</Text>
        <Text style={[styles.subheader, { color: theme.textSecondary }]}>
          Tap to link with timer. Long press to delete.
        </Text>

        {/* Input */}
        <View style={[styles.inputRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Add a new task..."
            placeholderTextColor={theme.textSecondary}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
          />
          <TouchableOpacity
            onPress={handleAdd}
            style={[styles.addBtn, { backgroundColor: Colors.focus.primary }]}
          >
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={[...pending, ...done]}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 10, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📝</Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No tasks yet. Add one above!
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TaskItem
              task={item}
              isActive={activeTaskId === item.id}
              isDark={isDark}
              onToggle={() => toggleTask(item.id)}
              onDelete={() => handleDelete(item.id, item.title)}
              onSetActive={() => handleSetActive(item.id)}
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  header: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  subheader: { fontSize: 13, marginBottom: 16 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    marginBottom: 16,
  },
  input: { flex: 1, fontSize: 15, paddingVertical: 6 },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  checkbox: { padding: 2 },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskTitle: { flex: 1, fontSize: 15, fontWeight: '500' },
  strikethrough: { textDecorationLine: 'line-through', opacity: 0.5 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  empty: { alignItems: 'center', marginTop: 60, gap: 8 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: 15, textAlign: 'center' },
});
