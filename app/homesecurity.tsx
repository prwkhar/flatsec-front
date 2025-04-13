import React from 'react';
import { View, Text, Button, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import background from '../assets/images/background2.jpg'; // Adjust the path to your image
import BlurTabBarBackground from '@/components/ui/TabBarBackground.ios';
import { useAuth } from '../src/context/AuthContext';
import { TextInput } from 'react-native';
import { Alert, ScrollView } from 'react-native';
import { useState } from 'react';
import { loginSecurity } from '@/src/api/auth';

interface VisitorRequest {
  _id: string;
  visitorName: string;
  roomno: number;
  purpose: string;
  status: number;
  address?: string;
  time?: string;
  imageUrl?: string;
}
export default function WelcomeScreen() {
    const [visitorRequests, setVisitorRequests] = useState<VisitorRequest[]>([]); 
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const { authData } = useAuth();
    const { login,logout } = useAuth();
  const router = useRouter();
  const handleLogin = async () => {
    const response = await loginSecurity(email, password);
    if (response.success) {
      login({ token: response.data.token, role: 'security' });
    } else {
      Alert.alert('Login Failed', response.message);
    }
  };
if (!authData || authData.role !== 'security') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Security Login</Text>
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Password" value={password} secureTextEntry onChangeText={setPassword} />
        <Button title="Login" onPress={handleLogin} /> 
      </View>
    );
  }
  return (
    <ImageBackground
      source={background} // Replace with your background image URL
      style={styles.background}
      blurRadius={5}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to Apartment Management App</Text>
        <Text style={styles.subtitle}>Manage your apartment effortlessly!</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.securityButton]}
            onPress={() => router.push('/security')}
          >
            <Text style={styles.buttonText}>Manage Visitors</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.ownerButton]}
            onPress={() => router.push('/logbook')}
          >
            <Text style={styles.buttonText}>Database</Text>
          </TouchableOpacity>

        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,// Adjust the opacity for a more subtle background
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Adds a semi-transparent overlay
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#d3d3d3',
    marginBottom: 30,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '80%',
    marginTop: 20,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  securityButton: {
    backgroundColor: '#4267B2', // Blue for Security
  },
  ownerButton: {
    backgroundColor: '#DB4437', // Red for Owner
  },
  adminButton: {
    backgroundColor: '#F4B400', // Yellow for Admin
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  requestsContainer: { 
    marginTop: 20, 
    width: '100%' 
  },
  requestItem: { 
    padding: 10, 
    borderWidth: 1, 
    marginBottom: 5, 
    borderRadius: 5, 
    backgroundColor: '#f9f9f9' 
  },
  input: { 
   width: '80%', 
    borderWidth: 1, 
    padding: 10,
    color: 'white', 
    marginBottom: 10 
  },
});