import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { initializeDatabase } from '../db';
import { LogService } from '../services/logService';
import { SettingsService } from '../services/settingsService';

export default function RootLayout() {
  useEffect(() => {
    // Initialize app on load
    const initializeApp = async () => {
      try {
        // Initialize database
        await initializeDatabase();

        // Load initial data
        await Promise.all([
          LogService.loadLogs(),
          SettingsService.loadSettings(),
        ]);

        console.log('App initialized successfully');
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer theme={DefaultTheme}>
        <Stack
          screenOptions={{
            headerShown: true,
            headerTintColor: '#ef4444',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: 'VibeKeeper',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="logs"
            options={{
              title: 'My Logs',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              title: 'Settings',
              presentation: 'modal',
            }}
          />
        </Stack>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
