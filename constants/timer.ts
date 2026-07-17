export const TIMER_DEFAULTS = {
  FOCUS_MIN: 25,
  SHORT_BREAK_MIN: 5,
  LONG_BREAK_MIN: 15,
  SESSIONS_BEFORE_LONG_BREAK: 4,
};

export const SESSION_TYPES = {
  FOCUS: 'focus',
  SHORT_BREAK: 'short_break',
  LONG_BREAK: 'long_break',
} as const;

export type SessionType = typeof SESSION_TYPES[keyof typeof SESSION_TYPES];
