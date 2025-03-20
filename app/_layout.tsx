import React from 'react';
import { Tabs } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Tabs>
        <Tabs.Screen name="security" options={{ title: 'Security' }} />
        <Tabs.Screen name="owner" options={{ title: 'Owner' }} />
      </Tabs>
    </AuthProvider>
  );
}
