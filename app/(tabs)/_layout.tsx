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
          paddingTop: 8,
          height: 64,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Timer',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeIcon : null}>
              <Ionicons name={focused ? 'timer' : 'timer-outline'} size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="stopwatch"
        options={{
          title: 'Stopwatch',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeIcon : null}>
              <Ionicons name={focused ? 'stopwatch' : 'stopwatch-outline'} size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeIcon : null}>
              <Ionicons name={focused ? 'checkmark-circle' : 'checkmark-circle-outline'} size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeIcon : null}>
              <Ionicons name={focused ? 'bar-chart' : 'bar-chart-outline'} size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeIcon : null}>
              <Ionicons name={focused ? 'settings' : 'settings-outline'} size={size} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeIcon: {
    backgroundColor: Colors.focus.primary + '18',
    borderRadius: 10,
    padding: 4,
  },
});
