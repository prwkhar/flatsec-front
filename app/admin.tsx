import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, ImageBackground } from 'react-native';
import { CameraView, Camera, useCameraPermissions } from 'expo-camera';
import { Picker } from '@react-native-picker/picker';
import io from 'socket.io-client';
import { useAuth } from '../src/context/AuthContext';
import { loginSecurity, fetchVisitorRequests, loginAdmin } from '../src/api/auth';
import { sendVisitorDetails } from '../src/api/security';
import { getsecuritytRequests, removeSecurityDetails, sendsecurityDetails } from '@/src/api/admin';

type securityrequest ={
  _id: string;
  email: string;
}
export default function SecurityScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityRequests, setsecurityRequests] = useState<securityrequest[]>([]);
  const {authData,login,logout} = useAuth();
  const [security, setsecurity] = useState({
    address: '',
    password: '',
  });
  const loadsecurityRequests = async () => {
    if (authData) {
      const response = await getsecuritytRequests(authData.token);
      console.log(response.data.data);
      if (response.success) {
        setsecurityRequests(response.data.data);
      } else {
        Alert.alert('Error', response.message);
      }
    }
  };

  useEffect(() => {
    if (authData) {
      loadsecurityRequests();
    }
  }, [authData]);
  const handleSend = async () => {
    if (!authData) {
      Alert.alert('Error', 'Authentication data not found.');
      return;
    }
    const response = await sendsecurityDetails(authData.token,security);
    if (response.success) {
      console.log('Security details sent successfully:', response.data);
      Alert.alert('Success', 'Visitor details sent!');
      setsecurity({ address: '', password: ''});
      loadsecurityRequests();
    } else {
      console.log('Error sending security details:', response.message);
      Alert.alert('Error', response.message);
    }
  };
  const handleLogin = async () => {
    const response = await loginAdmin(email, password);
    if (response.success) {
      login({ token: response.data.token, role: 'admin' });
      loadsecurityRequests();
    } else {
      Alert.alert('Login Failed', response.message);
    }
  };
  
  const handleremove = async (id: string) => {
    console.log("remove button clicked");
    if (!authData) {
      console.log("auth data not found");
      Alert.alert('Error', 'Authentication data not found.');
      return;
    }
    const response = await removeSecurityDetails(authData.token,id);
    console.log("response",response);
    console.log("response data",response.data);
    if (response.success) {
      console.log('Security details removed successfully:', response.data);
      Alert.alert('Success', 'Security details removed!');
      loadsecurityRequests();
    } else {
      console.log('Error removing security details:', response.message);
      Alert.alert('Error', response.message);
    }
  };

  if (!authData || authData.role !== 'admin') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Admin Login</Text>
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Password" value={password} secureTextEntry onChangeText={setPassword} />
        <Button title="Login" onPress={handleLogin} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Button title="Logout" onPress={logout} />
      <TextInput
        style={styles.input}
        placeholder="Security Email"
        value={security.address}
        onChangeText={(text) => setsecurity({ ...security, address: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={security.password}
        onChangeText={(text) => setsecurity({ ...security, password: text })}
      />

      <Button title="Add Security" onPress={handleSend} />

      <ScrollView style={styles.requestsContainer}>
        <Text style={styles.title}>Security</Text>
        {securityRequests.length === 0 ? (
          <Text>No security found.</Text>
        ) : (
          securityRequests.map((req) => (
            <View key={req._id} style={styles.requestItem}>
              <Text>Email: {req.email}</Text>
              <Button title='Remove' onPress={()=>handleremove(req._id)}/>
            </View>
          ))
        )}
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,// Adjust the opacity for a more subtle background
    resizeMode: 'cover',
  },
  container: { 
    flex: 1, 
    padding: 20,
    alignItems: 'center', 
    justifyContent: 'center',
    color: 'white', 
    backgroundColor: 'rgba(214, 192, 192, 0.5)', // Adds a semi-transparent overlay
  },
  title: { 
    fontSize: 24, 
    marginBottom: 20,
    color: 'white'
  },
  input: { 
    width: '80%', 
    borderWidth: 1, 
    padding: 10,
    color: 'white', 
    marginBottom: 10 
  },
  label: { 
    fontSize: 16, 
    marginTop: 10,
    color: 'white'
  },
  picker: { 
    width: '80%', 
    height: 50, 
    marginBottom: 10 
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
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  cameraContainer: {
    height: '50%' ,// 70% of screen height
    width: '100%',
    marginBottom: 20,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  previewImage: {
    width: 200,
    height: 200,
    marginTop: 10
  }
});