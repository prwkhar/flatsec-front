// app/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack initialRouteName="index"> {/* Set "index" as the initial route */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="security" options={{ title: 'Security' }} />
        <Stack.Screen name="owner" options={{ title: 'Owner' }} />
      </Stack>
    </AuthProvider>
  );
}
