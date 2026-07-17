import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const requestNotificationPermission = async (): Promise<boolean> => {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

export const scheduleTimerCompleteNotification = async (
  mode: string,
  delaySeconds: number
) => {
  const modeLabels: Record<string, { title: string; body: string }> = {
    focus: { title: '🎯 Focus session complete!', body: 'Great work! Time for a break.' },
    short_break: { title: '☕ Break over!', body: 'Ready to focus again?' },
    long_break: { title: '🌿 Long break done!', body: "You're refreshed — let's get back to it!" },
  };
  const { title, body } = modeLabels[mode] ?? modeLabels.focus;

  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: delaySeconds },
  });
};

export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};
