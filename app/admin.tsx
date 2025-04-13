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
import {
  getsecuritytRequests,
  removeSecurityDetails,
  sendsecurityDetails,
} from '@/src/api/admin';

type SecurityRequest = {
  _id: string;
  email: string;
  name: string;
  phone: string;
  address: string;
};

export default function SecurityScreen() {
  const { authData, login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityRequests, setSecurityRequests] = useState<SecurityRequest[]>([]);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
    password: '',
  });

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
    console.log('Form data:', form);
    const resp = await sendsecurityDetails(authData.token, form);
    if (resp.success) {
      Alert.alert('Success', 'Security added');
      setForm({ name: '', phone: '', address: '', email: '', password: '' });
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
          placeholder="Name"
          placeholderTextColor="#aaa"
          value={form.name}
          onChangeText={(text) => setForm((f) => ({ ...f, name: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          placeholderTextColor="#aaa"
          value={form.phone}
          onChangeText={(text) => setForm((f) => ({ ...f, phone: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Address"
          placeholderTextColor="#aaa"
          value={form.address}
          onChangeText={(text) => setForm((f) => ({ ...f, address: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#aaa"
          value={form.email}
          onChangeText={(text) => setForm((f) => ({ ...f, email: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#aaa"
          secureTextEntry
          value={form.password}
          onChangeText={(text) => setForm((f) => ({ ...f, password: text }))}
        />
        <TouchableOpacity style={styles.primaryButton} onPress={handleAdd}>
          <Text style={styles.buttonText}>Add Security</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subHeader}>Current Security</Text>
      {securityRequests.length === 0 ? (
        <Text style={styles.infoText}>No security accounts.</Text>
      ) : (
        securityRequests.map((req) => (
          <View key={req._id} style={styles.card}>
            <View style={styles.cardLeft}>
              <Text style={styles.cardTitle}>{req.name}</Text>
              <Text style={styles.cardDetail}>📧 {req.email}</Text>
              <Text style={styles.cardDetail}>🏠 {req.address}</Text>
            </View>
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleRemove(req._id)}>
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
    borderRadius: 12,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardLeft: {
    flex: 1,
    paddingRight: 10,
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardDetail: {
    color: '#CCC',
    fontSize: 14,
    marginBottom: 2,
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
