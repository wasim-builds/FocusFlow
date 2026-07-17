# 🍅 FocusFlow

A beautiful, feature-rich **Pomodoro productivity app** built with React Native (Expo) and TypeScript.

---

## ✨ Features

- **🎯 Circular countdown timer** — Focus, Short Break & Long Break modes with animated SVG ring
- **⚡ Timestamp-based engine** — Stays accurate even when app is backgrounded
- **📝 Task list** — Add, complete, delete tasks; link to active timer session; track 🍅 count per task
- **📊 Stats & Streaks** — Daily/weekly focus time, pomodoros completed, current streak & weekly bar chart
- **⚙️ Settings** — Fully customizable durations, vibration, auto-start, dark mode toggle
- **🌙 Dark Mode** — System-aware, overridable in settings
- **💾 Persistence** — Tasks, settings, and session history survive app restarts via AsyncStorage

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (for quick preview)

### Installation

```bash
git clone https://github.com/wasim-builds/FocusFlow.git
cd FocusFlow
npm install
npx expo start
```

Scan the QR code with Expo Go on your phone, or press `a` to open on an Android emulator.

---

## 🏗️ Tech Stack

| Tool | Purpose |
|---|---|
| Expo SDK 57 | React Native framework |
| expo-router | File-based navigation |
| Zustand | Lightweight state management |
| react-native-reanimated | Smooth animations |
| react-native-svg | SVG circular progress ring |
| AsyncStorage | Local data persistence |
| expo-haptics | Vibration feedback |
| expo-notifications | Background timer alerts |

---

## 📁 Project Structure

```
FocusFlow/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx       # Timer screen
│   │   ├── tasks.tsx       # Tasks screen
│   │   ├── stats.tsx       # Stats screen
│   │   ├── settings.tsx    # Settings screen
│   │   └── _layout.tsx     # Tab navigator
│   └── _layout.tsx         # Root layout
├── components/
│   ├── CircularProgress.tsx
│   ├── SessionTypeToggle.tsx
│   └── TimerControls.tsx
├── stores/
│   ├── timerStore.ts
│   ├── taskStore.ts
│   └── statsStore.ts
├── hooks/
│   └── useTimer.ts
├── utils/
│   └── time.ts
└── constants/
    ├── colors.ts
    └── timer.ts
```

---

## 📱 Building for Production

### Using EAS Build (Recommended)

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android  # APK / AAB
```

### Submit to Play Store

```bash
eas submit --platform android
```
