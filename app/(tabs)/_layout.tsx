import { Tabs } from 'expo-router';
import { useColorScheme, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useTimerStore } from '../../stores/timerStore';
import { useEffect } from 'react';
import { requestNotificationPermission } from '../../utils/notifications';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { settings } = useTimerStore();
  const isDark = settings.darkMode !== null ? settings.darkMode : colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const tabStyle = (focused: boolean) =>
    focused ? [styles.iconWrap, { backgroundColor: Colors.focus.primary + '18' }] : null;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.focus.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 60,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 9, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Timer',
        tabBarIcon: ({ color, size, focused }) => (
          <View style={tabStyle(focused)}><Ionicons name={focused ? 'timer' : 'timer-outline'} size={size} color={color} /></View>
        ),
      }} />
      <Tabs.Screen name="stopwatch" options={{ title: 'Stopwatch',
        tabBarIcon: ({ color, size, focused }) => (
          <View style={tabStyle(focused)}><Ionicons name={focused ? 'stopwatch' : 'stopwatch-outline'} size={size} color={color} /></View>
        ),
      }} />
      <Tabs.Screen name="alarm" options={{ title: 'Alarm',
        tabBarIcon: ({ color, size, focused }) => (
          <View style={tabStyle(focused)}><Ionicons name={focused ? 'alarm' : 'alarm-outline'} size={size} color={color} /></View>
        ),
      }} />
      <Tabs.Screen name="tasks" options={{ title: 'Tasks',
        tabBarIcon: ({ color, size, focused }) => (
          <View style={tabStyle(focused)}><Ionicons name={focused ? 'checkmark-circle' : 'checkmark-circle-outline'} size={size} color={color} /></View>
        ),
      }} />
      <Tabs.Screen name="stats" options={{ title: 'Stats',
        tabBarIcon: ({ color, size, focused }) => (
          <View style={tabStyle(focused)}><Ionicons name={focused ? 'bar-chart' : 'bar-chart-outline'} size={size} color={color} /></View>
        ),
      }} />
      <Tabs.Screen name="achievements" options={{ title: 'Badges',
        tabBarIcon: ({ color, size, focused }) => (
          <View style={tabStyle(focused)}><Ionicons name={focused ? 'trophy' : 'trophy-outline'} size={size} color={color} /></View>
        ),
      }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings',
        tabBarIcon: ({ color, size, focused }) => (
          <View style={tabStyle(focused)}><Ionicons name={focused ? 'settings' : 'settings-outline'} size={size} color={color} /></View>
        ),
      }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: { borderRadius: 8, padding: 3 },
});
