import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, ImageBackground } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Picker } from '@react-native-picker/picker';
import io from 'socket.io-client';
import { useAuth } from '../src/context/AuthContext';
import { loginSecurity, fetchVisitorRequests } from '../src/api/auth';
import { sendVisitorDetails } from '../src/api/security';

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

const socket = io('http://192.168.176.234:3000');

export default function SecurityScreen() {
  const [opencamera, setOpenCamera] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const { authData, login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const [visitor, setVisitor] = useState({
    name: '',
    address: '',
    time: '',
    purpose: '',
    roomno: 1,
  });
  const [visitorRequests, setVisitorRequests] = useState<VisitorRequest[]>([]);

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
    socket.on('status_update', (updatedRequest: VisitorRequest) => {
      setVisitorRequests((prevRequests) => {
        const index = prevRequests.findIndex((req) => req._id === updatedRequest._id);
        if (index !== -1) {
          const newRequests = [...prevRequests];
          newRequests[index] = updatedRequest;
          return newRequests;
        }
        return [updatedRequest, ...prevRequests];
      });
    });

    socket.on('new_request', (newRequest: VisitorRequest) => {
      setVisitorRequests((prevRequests) => [newRequest, ...prevRequests]);
    });

    return () => {
      socket.off('status_update');
      socket.off('new_request');
    };
  }, []);

  useEffect(() => {
    if (authData) {
      loadVisitorRequests();
    }
  }, [authData]);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  const takeimage = async () => {
    if (!permission?.granted) {
      Alert.alert('Camera permission not granted');
      return;
    }

    try {
      const photo = await cameraRef.current?.takePictureAsync({
        quality: 0.5,
        base64: true,
        skipProcessing: true,
      });
      if (photo) {
        setImageUri(photo.uri);
        setOpenCamera(false);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture.');
    }
  };

  const handleLogin = async () => {
    const response = await loginSecurity(email, password);
    if (response.success) {
      login({ token: response.data.token, role: 'security' });
      loadVisitorRequests();
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
      console.log('Visitor details sent successfully:', response.data);
      Alert.alert('Success', 'Visitor details sent!');
      setVisitor({ name: '', address: '', time: '', purpose: '', roomno: 1 });
      setImageUri(null);
      loadVisitorRequests();
    } else {
      console.log('Error sending visitor details:', response.message);
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
        <ScrollView style={styles.requestsContainer}>
          <Text style={styles.title}>Visitor Status</Text>
          {visitorRequests.length === 0 ? (
            <Text>No visitor requests found.</Text>
          ) : (
            visitorRequests.map((req) => (
              <View key={req._id} style={styles.requestItem}>
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
      <Picker
        selectedValue={visitor.roomno}
        style={styles.picker}
        onValueChange={(itemValue) => setVisitor({ ...visitor, roomno: itemValue })}
      >
        {[...Array(10)].map((_, i) => (
          <Picker.Item key={i} label={`Room ${i + 1}`} value={i + 1} />
        ))}
      </Picker>

      {opencamera ? (
  <View style={styles.cameraContainer}>
    <CameraView 
      style={styles.camera}
      facing={facing}
      ref={cameraRef}
    >
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
          <Text style={styles.text}>Flip Camera</Text>
        </TouchableOpacity>
      </View>
    </CameraView>
    <Button title="Take Picture" onPress={takeimage} />
    {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImage} />}
  </View>
) : (
  <Button title="Open Camera" onPress={() => setOpenCamera(true)} />
)}
      <Button title="Send Visitor Details" onPress={handleSend} />

      <ScrollView style={styles.requestsContainer}>
        <Text style={styles.title}>Visitor Status</Text>
        {visitorRequests.length === 0 ? (
          <Text>No visitor requests found.</Text>
        ) : (
          visitorRequests.map((req) => (
            <View key={req._id} style={styles.requestItem}>
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
