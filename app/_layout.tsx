import React from 'react';
import { Tabs, Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack initialRouteName='welcome'>
        {/* Remove the component prop - Expo Router auto-links files */}
        <Stack.Screen
          name="welcome"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="security"
          options={{
            title: 'Security',
          }}
        />
        <Stack.Screen
          name="owner"
          options={{
            title: 'Owner',
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
