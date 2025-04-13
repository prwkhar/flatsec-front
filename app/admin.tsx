import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { loginAdmin } from '../src/api/auth';
import { getsecuritytRequests, removeSecurityDetails, sendsecurityDetails } from '@/src/api/admin';

type SecurityRequest = {
  _id: string;
  email: string;
};

export default function SecurityScreen() {
  const { authData, login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityRequests, setSecurityRequests] = useState<SecurityRequest[]>([]);
  const [form, setForm] = useState({ address: '', password: '' });

  const loadRequests = async () => {
    if (!authData) return;
    const resp = await getsecuritytRequests(authData.token);
    if (resp.success) setSecurityRequests(resp.data.data);
    else Alert.alert('Error', resp.message);
  };

  useEffect(() => {
    if (authData) loadRequests();
  }, [authData]);

  const handleLogin = async () => {
    const resp = await loginAdmin(email, password);
    if (resp.success) {
      login({ token: resp.data.token, role: 'admin' });
      loadRequests();
    } else {
      Alert.alert('Login Failed', resp.message);
    }
  };

  const handleAdd = async () => {
    if (!authData) return Alert.alert('Error', 'Not authenticated');
    const resp = await sendsecurityDetails(authData.token, form);
    if (resp.success) {
      Alert.alert('Success', 'Security added');
      setForm({ address: '', password: '' });
      loadRequests();
    } else {
      Alert.alert('Error', resp.message);
    }
  };

  const handleRemove = async (id: string) => {
    if (!authData) return Alert.alert('Error', 'Not authenticated');
    const resp = await removeSecurityDetails(authData.token, id);
    if (resp.success) {
      Alert.alert('Removed');
      loadRequests();
    } else {
      Alert.alert('Error', resp.message);
    }
  };

  // ** LOGIN **
  if (!authData || authData.role !== 'admin') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={styles.container.backgroundColor} />
        <Text style={styles.header}>Admin Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#aaa"
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

  // ** DASHBOARD **
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={styles.container.backgroundColor} />
      <View style={styles.topBar}>
        <Text style={styles.header}>Admin Dashboard</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Security Email"
          placeholderTextColor="#aaa"
          value={form.address}
          onChangeText={t => setForm(f => ({ ...f, address: t }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#aaa"
          secureTextEntry
          value={form.password}
          onChangeText={t => setForm(f => ({ ...f, password: t }))}
        />
        <TouchableOpacity style={styles.primaryButton} onPress={handleAdd}>
          <Text style={styles.buttonText}>Add Security</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subHeader}>Current Security</Text>
      {securityRequests.length === 0 ? (
        <Text style={styles.infoText}>No security accounts.</Text>
      ) : (
        securityRequests.map(req => (
          <View key={req._id} style={styles.card}>
            <Text style={styles.cardText}>{req.email}</Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleRemove(req._id)}
            >
              <Text style={styles.deleteText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#1E1E2F',
    padding: 20,
    alignItems: 'center',
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
  },
  logoutText: {
    color: '#FF5A5F',
    fontWeight: '600',
  },
  form: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    backgroundColor: '#2A2A3D',
    color: '#FFF',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#4F8EF7',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  subHeader: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  infoText: {
    color: '#AAA',
    marginBottom: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#2A2A3D',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardText: {
    color: '#FFF',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#FF5A5F',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  deleteText: {
    color: '#FFF',
    fontWeight: '600',
  },
});
