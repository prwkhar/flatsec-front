import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { loginSecurity } from '../src/api/auth';

export default function SecurityScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { authData, login, logout } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    const response = await loginSecurity(email, password);
    if (response.success) {
      login({ token: response.data.token, role: 'security' });
    } else {
      Alert.alert('Login Failed', response.message);
    }
  };

  // ** LOGIN VIEW **
  if (!authData || authData.role !== 'security') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={styles.container.backgroundColor} />
        <Text style={styles.header}>Security Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ** DASHBOARD VIEW **
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={styles.container.backgroundColor} />
      <View style={styles.topBar}>
        <Text style={styles.header}>Security Dashboard</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, styles.fullButton]}
        onPress={() => router.push('/security')}
      >
        <Text style={styles.buttonText}>Manage Visitors</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.secondaryButton, styles.fullButton]}
        onPress={() => router.push('/logbook')}
      >
        <Text style={styles.buttonText}>Database</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#1E1E2F',  // dark family color
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    backgroundColor: '#2A2A3D',
    color: '#FFFFFF',
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#4F8EF7',
    paddingVertical: 16,
    borderRadius: 8,
    paddingHorizontal: 40,
    alignItems: 'center',
    marginBottom: 20,
  },
  secondaryButton: {
    backgroundColor: '#6A6AEF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  fullButton: {
    width: '100%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  logoutText: {
    color: '#FF5A5F',
    fontWeight: '600',
  },
});

