# Mobile Architecture - My Medicine

## Overview

Mobile app được xây dựng trên **React Native** với **Expo SDK 52**, sử dụng **NativeWind** (Tailwind CSS) cho styling, hỗ trợ iOS, Android và Web từ một codebase.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React Native | Cross-platform framework |
| Expo SDK 52 | Development platform |
| NativeWind | Tailwind CSS for RN |
| React Navigation | Navigation library |
| react-native-chart-kit | Charts (Bar, Pie) |
| Lucide React Native | Icon library |
| react-i18next | Internationalization |
| Axios | HTTP Client |

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                              │
│              (NavigationContainer + Animated)                │
├─────────────────────────────────────────────────────────────┤
│                   Tab.Navigator (Bottom)                     │
│         Collapsible navigation with spring animation         │
├─────────────────────────────────────────────────────────────┤
│   Dashboard   │  Medicines  │  Diseases  │  Prescriptions   │
│    Screen     │   Screen    │   Screen   │     Screen       │
├─────────────────────────────────────────────────────────────┤
│                    Services Layer (api.ts)                   │
│                  Axios instance → Backend API                │
├─────────────────────────────────────────────────────────────┤
│                    i18n Layer (react-i18next)                │
│                  English + Vietnamese locales                │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
mobile/
├── App.tsx                    # Entry + Navigation
├── src/
│   ├── screens/
│   │   ├── Dashboard.tsx      # Home screen with charts
│   │   ├── Medicines.tsx      # Medicine cabinet + Add modal
│   │   ├── Diseases.tsx       # Disease management
│   │   └── Prescriptions.tsx  # Prescription management
│   ├── services/
│   │   └── api.ts             # Axios configuration
│   ├── locales/
│   │   ├── en/translation.json
│   │   └── vi/translation.json
│   ├── global.css             # @tailwind directives
│   └── i18n.ts                # i18n setup
├── metro.config.js            # Bundler + NativeWind
├── tailwind.config.js         # Tailwind configuration
├── babel.config.js            # Babel presets
├── patches/                   # Metro patches for Windows
│   └── metro-config+0.83.3.patch
├── eas.json                   # EAS Build profiles
└── package.json
```

## Navigation Architecture

```
NavigationContainer
└── Tab.Navigator (Bottom Tabs)
    ├── Dashboard Screen
    ├── Medicines Screen
    ├── Diseases Screen
    └── Prescriptions Screen
```

### Collapsible Navigation

```typescript
// Animated slide effect
const slideAnim = useRef(new Animated.Value(TAB_BAR_HEIGHT)).current;

const toggleTabBar = () => {
  Animated.spring(slideAnim, {
    toValue: isVisible ? TAB_BAR_HEIGHT : 0,
    useNativeDriver: true,
  }).start();
};
```

## NativeWind Styling

```tsx
// Uses Tailwind classes like web
<View className="bg-white p-6 rounded-3xl shadow-sm">
  <Text className="text-2xl font-bold text-gray-900">Title</Text>
</View>
```

### Configuration

```javascript
// metro.config.js
const { withNativeWind } = require('nativewind/metro');
module.exports = withNativeWind(config, { input: './src/global.css' });

// tailwind.config.js
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
};
```

## Platform Detection

```typescript
import { Platform } from 'react-native';

// Show install banner only on web
const [showBanner, setShowBanner] = useState(Platform.OS === 'web');
```

## Charts Implementation

```tsx
import { BarChart, PieChart } from 'react-native-chart-kit';

<BarChart
  data={stockData}
  width={chartWidth}
  height={280}
  chartConfig={{
    backgroundColor: "#ffffff",
    color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
  }}
  verticalLabelRotation={45}
/>
```

## API Integration

```typescript
// src/services/api.ts
export const api = axios.create({
  baseURL: 'https://mymedicine-backend.vercel.app/api',
});

// Usage
const response = await api.get('/medicines');
```

## Build & Deploy

### Development
```bash
npm start        # Start Expo dev server
# Press 'w' for web, 'a' for Android, 'i' for iOS
```

### Production APK
```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

### EAS Build Profiles (eas.json)
```json
{
  "build": {
    "preview": {
      "android": { "buildType": "apk" }
    },
    "production": {
      "android": { "buildType": "app-bundle" }
    }
  }
}
```

## Windows Compatibility

Metro bundler có bug với Windows paths. Fix bằng `patch-package`:

```json
// package.json
"scripts": {
  "postinstall": "patch-package"
}
```

Patch tự động apply sau `npm install`.

## Key Features

1. **Cross-platform**: iOS, Android, Web từ 1 codebase
2. **NativeWind**: Tailwind CSS syntax quen thuộc
3. **Collapsible Nav**: Tiết kiệm màn hình mobile
4. **Install Banner**: Prompt users to install native app
5. **Responsive Charts**: Tự co giãn theo màn hình
6. **Multi-language**: EN/VI với react-i18next
