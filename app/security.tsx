import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
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
  status: number; // 0=pending,1=accepted,2=rejected
  address?: string;
  phoneno?: string;
  imageUrl?: string;
}

const SOCKET_URL = 'http://192.168.185.234:3000';
const socket = io(SOCKET_URL);

export default function SecurityScreen() {
  const [openCamera, setOpenCamera] = useState(false);
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
    phoneno: '',
    purpose: '',
    roomno: 1,
  });
  const [visitorRequests, setVisitorRequests] = useState<VisitorRequest[]>([]);

  // Map numeric status to labels
  const statusLabels = ['Pending', 'Accepted', 'Rejected'];

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
    socket.on('status_update', (updated: VisitorRequest) => {
      setVisitorRequests(prev =>
        prev.map(r => (r._id === updated._id ? updated : r))
      );
    });
    socket.on('new_request', (newReq: VisitorRequest) => {
      setVisitorRequests(prev => [newReq, ...prev]);
    });
    return () => {
      socket.off('status_update');
      socket.off('new_request');
    };
  }, []);

  useEffect(() => {
    if (authData) loadVisitorRequests();
  }, [authData]);

  if (!permission) return null;
  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.infoText}>Camera permission required</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takeImage = async () => {
    if (!permission.granted) {
      Alert.alert('Error', 'Camera permission not granted');
      return;
    }
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.5 });
      if (photo) {
        setImageUri(photo.uri);
        setOpenCamera(false);
      }
    } catch {
      Alert.alert('Error', 'Failed to take picture.');
    }
  };

  const handleLogin = async () => {
    const resp = await loginSecurity(email, password);
    if (resp.success) {
      login({ token: resp.data.token, role: 'security' });
      loadVisitorRequests();
    } else {
      Alert.alert('Login Failed', resp.message);
    }
  };

  const handleSend = async () => {
    if (!authData) return Alert.alert('Error', 'Not authenticated');
    const resp = await sendVisitorDetails(authData.token, visitor, imageUri || undefined);
    if (resp.success) {
      Alert.alert('Success', 'Visitor details sent');
      setVisitor({ name: '', address: '', phoneno: '', purpose: '', roomno: 1 });
      setImageUri(null);
      loadVisitorRequests();
    } else {
      Alert.alert('Error', resp.message);
    }
  };

  // ** Login Screen **
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

  // ** Dashboard **
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={styles.container.backgroundColor} />
      <View style={styles.topBar}>
        <Text style={styles.header}>Security Dashboard</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Visitor Name"
          placeholderTextColor="#888"
          value={visitor.name}
          onChangeText={t => setVisitor({ ...visitor, name: t })}
        />
        <TextInput
          style={styles.input}
          placeholder="Address"
          placeholderTextColor="#888"
          value={visitor.address}
          onChangeText={t => setVisitor({ ...visitor, address: t })}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone No"
          placeholderTextColor="#888"
          value={visitor.phoneno}
          onChangeText={t => setVisitor({ ...visitor, phoneno: t })}
        />
        <TextInput
          style={styles.input}
          placeholder="Purpose"
          placeholderTextColor="#888"
          value={visitor.purpose}
          onChangeText={t => setVisitor({ ...visitor, purpose: t })}
        />
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={visitor.roomno}
            style={styles.picker}
            onValueChange={v => setVisitor({ ...visitor, roomno: v })}
          >
            {[...Array(10)].map((_, i) => (
              <Picker.Item key={i} label={`Room ${i + 1}`} value={i + 1} />
            ))}
          </Picker>
        </View>
        {openCamera ? (
          <View style={styles.cameraContainer}>
            <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
              <TouchableOpacity style={styles.flipButton} onPress={() => setFacing(f => (f === 'back' ? 'front' : 'back'))}>
                <Text style={styles.buttonText}>Flip</Text>
              </TouchableOpacity>
            </CameraView>
            <TouchableOpacity style={styles.primaryButton} onPress={takeImage}>
              <Text style={styles.buttonText}>Take Picture</Text>
            </TouchableOpacity>
            {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}
          </View>
        ) : (
          <TouchableOpacity style={styles.primaryButton} onPress={() => setOpenCamera(true)}>
            <Text style={styles.buttonText}>Open Camera</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.secondaryButton} onPress={handleSend}>
          <Text style={styles.buttonText}>Send Visitor Details</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subHeader}>Visitor Requests</Text>
      {visitorRequests.length === 0 ? (
        <Text style={styles.infoText}>No visitor requests.</Text>
      ) : (
        visitorRequests.map(req => (
          <View key={req._id} style={styles.card}>
            {req.imageUrl && <Image source={{ uri: req.imageUrl }} style={styles.cardImage} />}
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{req.visitorName}</Text>
              <Text style={styles.cardMeta}>Room {req.roomno} • {req.purpose}</Text>
              <Text style={styles.cardStatus}>
                Status: {statusLabels[req.status] || 'Rejected'}
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const { width } = Dimensions.get('window');
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
    marginBottom: 20,
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
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#2A2A3D',
    color: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  pickerWrapper: {
    backgroundColor: '#2A2A3D',
    borderRadius: 8,
    marginBottom: 12,
  },
  picker: {
    color: '#FFF',
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#4F8EF7',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: '#6A6AEF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  cameraContainer: {
    width: '100%',
    height: width * 0.6,
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  flipButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#4F8EF7',
    padding: 8,
    borderRadius: 6,
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 12,
  },
  subHeader: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 12,
  },
  infoText: {
    color: '#AAA',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#2A2A3D',
    width: width - 40,
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 6,
  },
  cardMeta: {
    fontSize: 16,
    color: '#BBB',
    marginBottom: 12,
  },
  cardStatus: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F8EF7',
  },
  centered: {
    flex: 1,
    backgroundColor: '#1E1E2F',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
