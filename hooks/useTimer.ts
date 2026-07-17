import React, { useEffect, useCallback } from 'react';
import { useTimerStore } from '../stores/timerStore';
import { useTaskStore } from '../stores/taskStore';
import { useStatsStore } from '../stores/statsStore';
import { useAchievementsStore } from '../stores/achievementsStore';
import { SESSION_TYPES, SessionType } from '../constants/timer';
import * as Haptics from 'expo-haptics';
import { scheduleTimerCompleteNotification, cancelAllNotifications } from '../utils/notifications';

export const useTimer = (onComplete?: (mode: SessionType) => void) => {
  const {
    mode, timeLeft, isRunning, endTimestamp, settings, completedSessions,
    setTimeLeft, setIsRunning, setEndTimestamp, setMode,
    incrementSessionCount, incrementCompletedSessions, resetCompletedSessions,
  } = useTimerStore();
  const { activeTaskId, incrementPomodoro } = useTaskStore();
  const { addSession, getTodayFocusSec, getStreak, sessions } = useStatsStore();
  const { checkAndUnlock } = useAchievementsStore();

  // Tick every second — use endTimestamp for accuracy
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      if (!endTimestamp) return;
      const remaining = Math.max(0, Math.round((endTimestamp - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) {
        clearInterval(interval);
        handleComplete();
      }
    }, 500);
    return () => clearInterval(interval);
  }, [isRunning, endTimestamp]);

  const handleComplete = useCallback(async () => {
    setIsRunning(false);
    setEndTimestamp(null);

    if (settings.vibrationEnabled) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    await addSession({
      type: mode,
      durationSec: mode === SESSION_TYPES.FOCUS
        ? settings.focusMin * 60
        : mode === SESSION_TYPES.SHORT_BREAK
        ? settings.shortBreakMin * 60
        : settings.longBreakMin * 60,
      completedAt: Date.now(),
      taskId: activeTaskId ?? undefined,
    });

    if (mode === SESSION_TYPES.FOCUS) {
      incrementSessionCount();
      incrementCompletedSessions();
      if (activeTaskId) incrementPomodoro(activeTaskId);
      // Check achievements
      const totalPomodoros = sessions.filter((s) => s.type === 'focus').length + 1;
      const streak = getStreak();
      const todaySec = getTodayFocusSec() + settings.focusMin * 60;
      const sessionHour = new Date().getHours();
      await checkAndUnlock({ totalPomodoros, streak, todaySec, sessionHour });
      const newCount = completedSessions + 1;
      const nextMode = newCount % settings.sessionsBeforeLongBreak === 0
        ? SESSION_TYPES.LONG_BREAK
        : SESSION_TYPES.SHORT_BREAK;

      if (settings.autoStartNext) {
        setTimeout(() => startTimer(nextMode), 500);
      } else {
        setMode(nextMode);
      }
    } else {
      if (settings.autoStartNext) {
        setTimeout(() => startTimer(SESSION_TYPES.FOCUS), 500);
      } else {
        setMode(SESSION_TYPES.FOCUS);
        resetCompletedSessions();
      }
    }

    onComplete?.(mode);
  }, [mode, settings, completedSessions, activeTaskId]);

  const startTimer = (overrideMode?: SessionType) => {
    const targetMode = overrideMode ?? mode;
    const durations: Record<SessionType, number> = {
      [SESSION_TYPES.FOCUS]: settings.focusMin * 60,
      [SESSION_TYPES.SHORT_BREAK]: settings.shortBreakMin * 60,
      [SESSION_TYPES.LONG_BREAK]: settings.longBreakMin * 60,
    };
    const duration = durations[targetMode];
    const ts = Date.now() + duration * 1000;
    if (overrideMode) setMode(overrideMode);
    setEndTimestamp(ts);
    setIsRunning(true);
    // Schedule push notification for when timer ends
    scheduleTimerCompleteNotification(targetMode, duration);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    setEndTimestamp(null);
    cancelAllNotifications();
  };

  const resetTimer = () => {
    setIsRunning(false);
    setEndTimestamp(null);
    cancelAllNotifications();
    const durations: Record<SessionType, number> = {
      [SESSION_TYPES.FOCUS]: settings.focusMin * 60,
      [SESSION_TYPES.SHORT_BREAK]: settings.shortBreakMin * 60,
      [SESSION_TYPES.LONG_BREAK]: settings.longBreakMin * 60,
    };
    setTimeLeft(durations[mode]);
  };

  const skipSession = () => {
    resetTimer();
    if (mode === SESSION_TYPES.FOCUS) {
      const newCount = completedSessions + 1;
      const nextMode = newCount % settings.sessionsBeforeLongBreak === 0
        ? SESSION_TYPES.LONG_BREAK
        : SESSION_TYPES.SHORT_BREAK;
      setMode(nextMode);
    } else {
      setMode(SESSION_TYPES.FOCUS);
    }
  };

  const totalDuration = (() => {
    const durations: Record<SessionType, number> = {
      [SESSION_TYPES.FOCUS]: settings.focusMin * 60,
      [SESSION_TYPES.SHORT_BREAK]: settings.shortBreakMin * 60,
      [SESSION_TYPES.LONG_BREAK]: settings.longBreakMin * 60,
    };
    return durations[mode];
  })();

  const progress = totalDuration > 0 ? (totalDuration - timeLeft) / totalDuration : 0;

  return { timeLeft, isRunning, mode, progress, startTimer, pauseTimer, resetTimer, skipSession };
};
