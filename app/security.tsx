import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, Image, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../src/context/AuthContext';
import { loginSecurity, fetchVisitorRequests } from '../src/api/auth';
import { sendVisitorDetails } from '../src/api/security';

export default function SecurityScreen() {
  const { authData, login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [visitor, setVisitor] = useState({
    name: '',
    address: '',
    time: '',
    purpose: '',
    roomno: 1, // Default room number
  });

  // State to store visitor requests
  const [visitorRequests, setVisitorRequests] = useState([]);

  // Function to fetch visitor requests after login
  const loadVisitorRequests = async () => {
    if (authData) {
      const response = await fetchVisitorRequests(authData.token);
      if (response.success) {
        setVisitorRequests(response.data);
      } else {
        Alert.alert('Error', response.message);
      }
    }
  };

  useEffect(() => {
    if (authData) {
      loadVisitorRequests();
    }
  }, [authData]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleLogin = async () => {
    const response = await loginSecurity(email, password);
    if (response.success) {
      login({ token: response.data.token, role: 'security' });
      loadVisitorRequests(); // Load visitor requests after login
    } else {
      Alert.alert('Login Failed', response.message);
    }
  };

  const handleSend = async () => {
    if (!authData) {
      Alert.alert('Error', 'Authentication data not found.');
      return;
    }
    const response = await sendVisitorDetails(authData.token, visitor, imageUri || undefined);
    if (response.success) {
      Alert.alert('Success', 'Visitor details sent!');
      setVisitor({ name: '', address: '', time: '', purpose: '', roomno: 1 });
      setImageUri(null);
      loadVisitorRequests(); // Refresh visitor requests
    } else {
      Alert.alert('Error', response.message);
    }
  };

  if (!authData || authData.role !== 'security') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Security Login</Text>
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Password" value={password} secureTextEntry onChangeText={setPassword} />
        <Button title="Login" onPress={handleLogin} />

        {/* Visitor Request List (Shown After Login) */}
        <ScrollView style={styles.requestsContainer}>
          <Text style={styles.title}>Visitor Status</Text>
          {visitorRequests.length === 0 ? (
            <Text>No visitor requests found.</Text>
          ) : (
            visitorRequests.map((req, index) => (
              <View key={index} style={styles.requestItem}>
                <Text>Name: {req.visitorName}</Text>
                <Text>Room: {req.roomno}</Text>
                <Text>Purpose: {req.purpose}</Text>
                <Text>Status: {req.status}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Security Dashboard</Text>
      <Button title="Logout" onPress={logout} />

      <TextInput style={styles.input} placeholder="Visitor Name" value={visitor.name} onChangeText={(text) => setVisitor({ ...visitor, name: text })} />
      <TextInput style={styles.input} placeholder="Address" value={visitor.address} onChangeText={(text) => setVisitor({ ...visitor, address: text })} />
      <TextInput style={styles.input} placeholder="Time" value={visitor.time} onChangeText={(text) => setVisitor({ ...visitor, time: text })} />
      <TextInput style={styles.input} placeholder="Purpose" value={visitor.purpose} onChangeText={(text) => setVisitor({ ...visitor, purpose: text })} />

      <Text style={styles.label}>Select Room Number:</Text>
      <Picker selectedValue={visitor.roomno} style={styles.picker} onValueChange={(itemValue) => setVisitor({ ...visitor, roomno: itemValue })}>
        {[...Array(10)].map((_, i) => (
          <Picker.Item key={i} label={`Room ${i + 1}`} value={i + 1} />
        ))}
      </Picker>

      {imageUri && <Image source={{ uri: imageUri }} style={{ width: 100, height: 100, marginVertical: 10 }} />}
      <Button title="Pick an Image" onPress={pickImage} />
      <Button title="Send Visitor Details" onPress={handleSend} />

      {/* Visitor Status List */}
      <ScrollView style={styles.requestsContainer}>
        <Text style={styles.title}>Visitor Status</Text>
        {visitorRequests.length === 0 ? (
          <Text>No visitor requests found.</Text>
        ) : (
          visitorRequests.map((req, index) => (
            <View key={index} style={styles.requestItem}>
              <Text>Name: {req.visitorName}</Text>
              <Text>Room: {req.roomno}</Text>
              <Text>Purpose: {req.purpose}</Text>
              <Text>Status: {req.status}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, marginBottom: 20 },
  input: { width: '80%', borderWidth: 1, padding: 10, marginBottom: 10 },
  label: { fontSize: 16, marginTop: 10 },
  picker: { width: '80%', height: 50, marginBottom: 10 },
  requestsContainer: { marginTop: 20, width: '100%' },
  requestItem: { padding: 10, borderWidth: 1, marginBottom: 5, borderRadius: 5, backgroundColor: '#f9f9f9' },
});
