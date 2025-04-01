import React from 'react';
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 18 }}>This page doesn't exist.</Text>
      <Button title="Go Back Home" onPress={() => router.replace('/welcome')} />
    </View>
  );
}