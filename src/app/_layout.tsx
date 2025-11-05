import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { initializeDatabase } from '../db';
import { LogService } from '../services/logService';
import { SettingsService } from '../services/settingsService';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { logger } from '../utils/logger';
import { Platform } from 'react-native';

export default function RootLayout() {
  useEffect(() => {
    // Initialize app on load
    const initializeApp = async () => {
      try {
        logger.info('App starting', {
          platform: Platform.OS,
          environment: __DEV__ ? 'development' : 'production'
        });

        // Initialize database
        await initializeDatabase();
        logger.info('Database initialized');

        // Load initial data
        await Promise.all([
          LogService.loadLogs(),
          SettingsService.loadSettings(),
        ]);

        logger.info('App initialized successfully');
      } catch (error) {
        logger.fatal('Failed to initialize app', {}, error as Error);
      }
    };

    initializeApp();
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
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
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
