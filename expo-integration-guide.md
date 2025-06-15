# Guía de Integración con Expo - Fore the Money Golf App

## Opciones de Integración

### 1. Aplicación Móvil Nativa (Recomendado)
Crear una app React Native que use la misma API backend.

#### Ventajas:
- Mejor rendimiento y experiencia móvil
- Acceso a funciones nativas (GPS, cámara, notificaciones push)
- Instalable en App Store y Google Play
- UI optimizada para móviles

#### Arquitectura:
```
Web App (Actual) ←→ Backend API ←→ Mobile App (Nueva)
```

### 2. WebView Wrapper
Envolver la aplicación web actual en un contenedor Expo.

#### Ventajas:
- Implementación rápida
- Reutiliza todo el código existente
- Una sola base de código

#### Desventajas:
- Limitado acceso a funciones nativas
- Rendimiento menor que nativo

## Implementación Recomendada: App Nativa

### Paso 1: Configuración del Proyecto Expo
```bash
npx create-expo-app ForeTheMoneyGolf --template typescript
cd ForeTheMoneyGolf
npx expo install @expo/vector-icons expo-router react-native-safe-area-context
```

### Paso 2: Dependencias Principales
```bash
npx expo install @tanstack/react-query axios expo-secure-store
npx expo install expo-location expo-camera expo-notifications
npx expo install @react-navigation/native @react-navigation/stack
```

### Paso 3: Estructura de Carpetas
```
mobile-app/
├── app/
│   ├── (tabs)/
│   │   ├── dashboard.tsx
│   │   ├── scorecard.tsx
│   │   ├── social.tsx
│   │   └── settings.tsx
│   ├── auth/
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── _layout.tsx
├── components/
│   ├── ScoreInput.tsx
│   ├── GolfCourseSelector.tsx
│   └── SocialFeed.tsx
├── services/
│   ├── api.ts
│   └── storage.ts
└── types/
    └── golf.ts
```

### Paso 4: Configuración de API
```typescript
// services/api.ts
import axios from 'axios';

const API_BASE_URL = 'https://tu-app.replit.app/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para autenticación
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Paso 5: Componentes Nativos Específicos

#### Scorecard Móvil
```typescript
// components/MobileScorecard.tsx
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';

export function MobileScorecard() {
  const [scores, setScores] = useState<number[]>(Array(18).fill(0));
  
  return (
    <ScrollView>
      <View style={styles.holesGrid}>
        {scores.map((score, index) => (
          <TouchableOpacity 
            key={index}
            style={styles.holeButton}
            onPress={() => openScoreInput(index)}
          >
            <Text>Hoyo {index + 1}</Text>
            <Text style={styles.score}>{score || '-'}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
```

#### GPS para Distancias
```typescript
// hooks/useGPS.ts
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export function useGPS() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
      }
    })();
  }, []);
  
  return { location };
}
```

## Modificaciones al Backend

### CORS para Móvil
```typescript
// server/index.ts
app.use(cors({
  origin: ['http://localhost:3000', 'exp://localhost:8081'], // Expo dev
  credentials: true
}));
```

### API para Móvil
```typescript
// server/routes.ts
app.get('/api/mobile/courses', async (req, res) => {
  // Datos optimizados para móvil
  const courses = await storage.getCoursesForMobile();
  res.json(courses);
});

app.post('/api/mobile/score/quick', async (req, res) => {
  // Entrada rápida de scores para móvil
  const { holeNumber, score, playerId } = req.body;
  await storage.updateQuickScore(holeNumber, score, playerId);
  res.json({ success: true });
});
```

## Funciones Móviles Específicas

### 1. Notificaciones Push
```typescript
// services/notifications.ts
import * as Notifications from 'expo-notifications';

export async function setupNotifications() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status === 'granted') {
    const token = await Notifications.getExpoPushTokenAsync();
    // Enviar token al backend
    await api.post('/api/push-token', { token: token.data });
  }
}
```

### 2. Cámara para Fotos de Rondas
```typescript
// components/RoundPhoto.tsx
import { Camera } from 'expo-camera';

export function RoundPhoto() {
  const takePhoto = async () => {
    const photo = await camera.takePictureAsync();
    await uploadPhotoToRound(photo.uri);
  };
  
  return <Camera ref={camera} />;
}
```

### 3. GPS para Tracking
```typescript
// services/gps.ts
export function calculateDistanceToPin(
  currentLat: number, 
  currentLon: number, 
  pinLat: number, 
  pinLon: number
): number {
  // Cálculo de distancia usando fórmula haversine
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = currentLat * Math.PI/180;
  const φ2 = pinLat * Math.PI/180;
  const Δφ = (pinLat-currentLat) * Math.PI/180;
  const Δλ = (pinLon-currentLon) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distancia en metros
}
```

## Configuración de Deployment

### app.config.js
```javascript
export default {
  expo: {
    name: "Fore the Money",
    slug: "fore-the-money-golf",
    version: "1.0.0",
    platforms: ["ios", "android"],
    icon: "./assets/icon.png",
    splash: {
      image: "./assets/splash.png",
      backgroundColor: "#1f2937"
    },
    permissions: [
      "CAMERA",
      "ACCESS_FINE_LOCATION",
      "NOTIFICATIONS"
    ],
    ios: {
      bundleIdentifier: "com.yourcompany.forethemoney"
    },
    android: {
      package: "com.yourcompany.forethemoney"
    }
  }
};
```

## Sincronización de Datos

### Offline First
```typescript
// services/sync.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export class DataSync {
  static async syncRounds() {
    const offlineRounds = await AsyncStorage.getItem('offline_rounds');
    if (offlineRounds) {
      const rounds = JSON.parse(offlineRounds);
      for (const round of rounds) {
        try {
          await api.post('/api/rounds', round);
          // Eliminar de almacenamiento offline al sincronizar
        } catch (error) {
          console.log('Sync failed, keeping offline');
        }
      }
    }
  }
}
```

## Próximos Pasos

1. **Crear proyecto Expo** con las dependencias listadas
2. **Migrar componentes clave** empezando por autenticación
3. **Implementar scorecard móvil** con UI táctil optimizada
4. **Agregar funciones nativas** (GPS, cámara, notificaciones)
5. **Testing en dispositivos** reales
6. **Deploy a stores** (App Store, Google Play)

¿Te gustaría que comience implementando alguna parte específica o prefieres que creemos el proyecto base de Expo primero?