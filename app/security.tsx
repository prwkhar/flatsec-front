import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { loginSecurity } from '../src/api/auth';
import { sendVisitorDetails } from '../src/api/security';

export default function SecurityScreen() {
  const { authData, login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visitor, setVisitor] = useState({
    name: '',
    address: '',
    time: '',
    purpose: '',
  });

  const handleLogin = async () => {
    const response = await loginSecurity(email, password);
    if (response.success) {
      login({ token: response.data.token, role: 'security' });
    } else {
      Alert.alert('Login Failed', response.message);
    }
  };

  const handleSend = async () => {
    // Ensure authData is available before using it.
    if (!authData) {
      Alert.alert('Error', 'Authentication data not found.');
      return;
    }
    
    const response = await sendVisitorDetails(authData.token, visitor);
    if (response.success) {
      Alert.alert('Success', 'Visitor details sent!');
      setVisitor({ name: '', address: '', time: '', purpose: '' });
    } else {
      Alert.alert('Error', response.message);
    }
  };

  if (!authData || authData.role !== 'security') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Security Login</Text>
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          secureTextEntry
          onChangeText={setPassword}
        />
        <Button title="Login" onPress={handleLogin} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Security Dashboard</Text>
      <Button title="Logout" onPress={logout} />
      <TextInput
        style={styles.input}
        placeholder="Visitor Name"
        value={visitor.name}
        onChangeText={(text) => setVisitor({ ...visitor, name: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={visitor.address}
        onChangeText={(text) => setVisitor({ ...visitor, address: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Time"
        value={visitor.time}
        onChangeText={(text) => setVisitor({ ...visitor, time: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Purpose"
        value={visitor.purpose}
        onChangeText={(text) => setVisitor({ ...visitor, purpose: text })}
      />
      <Button title="Send Visitor Details" onPress={handleSend} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, marginBottom: 20 },
  input: { width: '80%', borderWidth: 1, padding: 10, marginBottom: 10 },
});
