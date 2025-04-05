import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Button, 
  Alert, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  ImageBackground 
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Picker } from '@react-native-picker/picker';
import io from 'socket.io-client';
import { useAuth } from '../src/context/AuthContext';
import { loginSecurity, fetchVisitorRequests } from '../src/api/auth';
import { sendVisitorDetails } from '../src/api/security';

const background = require('../assets/images/background.jpg'); // Adjust the path as necessary

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

const socket = io('http://172.20.10.2:3000');

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

  // Security Login View (when not authenticated)
  if (!authData || authData.role !== 'security') {
    return (
      <ImageBackground source={background} style={styles.background}>
        <View style={styles.loginContainer}>
          <Text style={styles.title}>Security Login</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Email" 
            placeholderTextColor="#ccc"
            value={email} 
            onChangeText={setEmail} 
          />
          <TextInput 
            style={styles.input} 
            placeholder="Password" 
            placeholderTextColor="#ccc"
            value={password} 
            secureTextEntry 
            onChangeText={setPassword} 
          />
          <View style={styles.buttonWrapper}>
            <Button title="Login" onPress={handleLogin} color="#1E90FF" />
          </View>
          <ScrollView style={styles.requestsContainer}>
            <Text style={styles.subtitle}>Visitor Status</Text>
            {visitorRequests.length === 0 ? (
              <Text style={styles.normalText}>No visitor requests found.</Text>
            ) : (
              visitorRequests.map((req) => (
                <View key={req._id} style={styles.requestItem}>
                  <Text style={styles.normalText}>Name: {req.visitorName}</Text>
                  <Text style={styles.normalText}>Room: {req.roomno}</Text>
                  <Text style={styles.normalText}>Purpose: {req.purpose}</Text>
                  <Text style={styles.normalText}>Status: {req.status}</Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </ImageBackground>
    );
  }

  // Security Dashboard View (when authenticated)
  return (
    <ImageBackground source={background} style={styles.background}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Security Dashboard</Text>
        <View style={styles.buttonWrapper}>
          <Button title="Logout" onPress={logout} color="#FF4500" />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Visitor Name"
          placeholderTextColor="#ccc"
          value={visitor.name}
          onChangeText={(text) => setVisitor({ ...visitor, name: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Address"
          placeholderTextColor="#ccc"
          value={visitor.address}
          onChangeText={(text) => setVisitor({ ...visitor, address: text })}
        />
        {/* <TextInput
          style={styles.input}
          placeholder="Time"
          placeholderTextColor="#ccc"
          value={visitor.time}
          onChangeText={(text) => setVisitor({ ...visitor, time: text })}
        /> */}
        <TextInput
          style={styles.input}
          placeholder="Purpose"
          placeholderTextColor="#ccc"
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
            <View style={styles.buttonWrapper}>
              <Button title="Take Picture" onPress={takeimage} color="#1E90FF" />
            </View>
            {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImage} />}
          </View>
        ) : (
          <View style={styles.buttonWrapper}>
            <Button title="Open Camera" onPress={() => setOpenCamera(true)} color="#1E90FF" />
          </View>
        )}
        <View style={styles.buttonWrapper}>
          <Button title="Send Visitor Details" onPress={handleSend} color="#32CD32" />
        </View>

        <ScrollView style={styles.requestsContainer}>
          <Text style={styles.subtitle}>Visitor Status</Text>
          {visitorRequests.length === 0 ? (
            <Text style={styles.normalText}>No visitor requests found.</Text>
          ) : (
            visitorRequests.map((req) => (
              <View key={req._id} style={styles.requestItem}>
                <Text style={styles.normalText}>Name: {req.visitorName}</Text>
                <Text style={styles.normalText}>Room: {req.roomno}</Text>
                <Text style={styles.normalText}>Purpose: {req.purpose}</Text>
                <Text style={styles.normalText}>Status: {(req.status==0)?"Waiting":(req.status==1)?"Accepted":"Denied"}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  loginContainer: { 
    flex: 1, 
    padding: 20,
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // dark overlay
  },
  container: { 
    flex: 1, 
    padding: 20,
    alignItems: 'center', 
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // dark overlay
  },
  title: { 
    fontSize: 26, 
    marginBottom: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 20,
    marginVertical: 10,
    color: 'white',
    fontWeight: '600',
  },
  input: { 
    width: '80%', 
    borderWidth: 1, 
    borderColor: '#fff', 
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    color: 'white',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  label: { 
    fontSize: 16, 
    marginTop: 10,
    color: 'white'
  },
  picker: { 
    width: '80%', 
    height: 50, 
    marginBottom: 15,
    color: 'white',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  requestsContainer: { 
    marginTop: 20, 
    width: '100%' 
  },
  requestItem: { 
    padding: 10, 
    borderWidth: 1, 
    borderColor: '#fff',
    marginBottom: 10, 
    borderRadius: 5, 
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: 'white',
  },
  cameraContainer: {
    height: '50%',
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 10,
    borderRadius: 5,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  previewImage: {
    width: 200,
    height: 200,
    marginTop: 10,
    borderRadius: 10,
  },
  buttonWrapper: {
    width: '80%',
    marginBottom: 15,
  },
  // Added normalText style to fix the error
  normalText: {
    color: 'black',
    fontSize: 16,
    marginVertical: 2,
  },
});
