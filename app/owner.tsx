import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert, StyleSheet } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { loginOwner } from '../src/api/auth';
import { getVisitorRequests, respondToRequest } from '../src/api/owner';
import { io, Socket } from 'socket.io-client';

// Replace with your Socket.IO server URL
const SOCKET_URL = 'https://your-backend-url.com';

// Define the type for visitor requests.
interface VisitorRequest {
  id: number;
  visitorName: string;
  purpose: string;
  // Add other fields like address, time, etc., as needed.
}

export default function OwnerScreen() {
  const { authData, login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [requests, setRequests] = useState<VisitorRequest[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Effect to fetch requests and set up the socket connection for real-time updates.
  useEffect(() => {
    if (authData && authData.role === 'owner') {
      fetchRequests();

      // Set up Socket.IO connection
      const newSocket: Socket = io(SOCKET_URL, { query: { token: authData.token } });
      newSocket.on('new_request', (data: VisitorRequest) => {
        setRequests((prevRequests) => [data, ...prevRequests]);
      });
      setSocket(newSocket);

      // Cleanup function to close the socket when the component unmounts or authData changes.
      return () => {
        newSocket.close();
      };
    }
    // If authData is not available or role isn't owner, no effect is needed.
    return undefined;
  }, [authData]);

  const fetchRequests = async () => {
    if (!authData) return;
    const response = await getVisitorRequests(authData.token);
    if (response.success) {
      setRequests(response.data as VisitorRequest[]);
    } else {
      Alert.alert('Error', response.message);
    }
  };

  const handleResponse = async (id: number, accepted: boolean) => {
    if (!authData) return;
    const response = await respondToRequest(authData.token, id, accepted);
    if (response.success) {
      Alert.alert('Response sent', accepted ? 'Approved' : 'Rejected');
      fetchRequests();
    } else {
      Alert.alert('Error', response.message);
    }
  };

  const handleLogin = async () => {
    const response = await loginOwner(email, password);
    if (response.success) {
      // Assuming response.data includes a token and role
      login({ token: response.data.token, role: 'owner' });
    } else {
      Alert.alert('Login Failed', response.message);
    }
  };

  // If not logged in or not owner, show the login screen.
  if (!authData || authData.role !== 'owner') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Owner Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
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

  // Render the owner dashboard with the list of visitor requests.
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Owner Dashboard</Text>
      <Button title="Logout" onPress={logout} />
      <FlatList
        data={requests}
        keyExtractor={(item,index) => item.id ? item.id.toString(): index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}> 
            <Text>Name: {item.visitorName}</Text>
            <Text>Purpose: {item.purpose}</Text>
            <View style={styles.buttonRow}>
              <Button title="Approve" onPress={() => handleResponse(item.id, true)} />
              <Button title="Reject" onPress={() => handleResponse(item.id, false)} />
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 20 },
  input: { width: '80%', borderWidth: 1, padding: 10, marginBottom: 10 },
  card: { borderWidth: 1, padding: 10, marginVertical: 5, width: '100%' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
});
