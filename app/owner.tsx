import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  FlatList,
  StyleSheet,
  Image,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Switch,
  ActivityIndicator, // Added for loading state
} from "react-native";
import { useAuth } from "../src/context/AuthContext";
import { loginOwner } from "../src/api/auth";
import { getVisitorRequests, respondToRequest, toggleCallPermission } from "../src/api/owner";
import { io, Socket } from "socket.io-client";
import axios from "axios";

const SOCKET_URL = `http://192.168.176.234:3000`;
const { width } = Dimensions.get("window");

interface VisitorRequest {
  _id: string;
  visitorName: string;
  purpose: string;
  imageUrl?: string;
  status: number;
}

export default function OwnerScreen() {
  const { authData, login, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [requests, setRequests] = useState<VisitorRequest[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [callPermission, setCallPermission] = useState(false);
  const [loading, setLoading] = useState(true); // Added loading state

  useEffect(() => {
    fetchCallPermission();
  },[]);

  useEffect(() => {
    if (authData && authData.role === "owner") {
      fetchRequests();
      fetchCallPermission();

      const newSocket: Socket = io(SOCKET_URL, {
        query: { token: authData.token },
      });

      newSocket.on("status_update", (updated: VisitorRequest) => {
        setRequests((prev) => prev.filter((r) => r._id !== updated._id));
      });

      newSocket.on("new_request", (data: VisitorRequest) => {
        if (data.status === 0) setRequests((prev) => [data, ...prev]);
      });

      setSocket(newSocket);
      return () => newSocket.close();
    }
  }, [authData]);

  const fetchRequests = async () => {
    if (!authData) return;
    console.log(authData.token);
    const resp = await getVisitorRequests(authData.token);
    if (resp.success) {
      setRequests((resp.data as VisitorRequest[]).filter((r) => r.status === 0));
    } else {
      Alert.alert("Error", resp.message);
    }
  };

  const fetchCallPermission = async () => {
    if (!authData) return;
    try {
      const res = await axios.get(`${SOCKET_URL}/api/owner/call-permission`, {
        headers: { Authorization: `Bearer ${authData.token}` },
      });
      if (typeof res.data.permission === "boolean") {
        setCallPermission(res.data.permission);
      }
    } catch (err) {
      console.log("Failed to fetch call permission:", err);
    } finally {
      setLoading(false); // Stop loading after fetch completes
    }
  };

  const handlePermissionToggle = async (value: boolean) => {
    setCallPermission(value);
    const result = await toggleCallPermission(authData!.token, value);
    if (!result.success) {
      Alert.alert("Error", result.message);
      setCallPermission(!value); // Revert toggle if failed
    }
  };

  const handleResponse = async (id: string, accepted: boolean) => {
    if (!authData) return;
    const resp = await respondToRequest(authData.token, id, accepted);
    if (resp.success) {
      Alert.alert("Response sent", accepted ? "Approved" : "Rejected");
      fetchRequests();
    } else {
      Alert.alert("Error", resp.message);
    }
  };

  const handleLogin = async () => {
    const resp = await loginOwner(email, password);
    if (resp.success) {
      login({ token: resp.data.token, role: "owner" });
    } else {
      Alert.alert("Login Failed", resp.message);
    }
  };

  if (!authData || authData.role !== "owner") {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={styles.container.backgroundColor} />
        <Text style={styles.header}>Owner Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#AAA"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#AAA"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={styles.container.backgroundColor} />
      <View style={styles.topBar}>
        <Text style={styles.header}>Owner Dashboard</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Call Permission Toggle */}
      <View style={styles.permissionToggle}>
        <Text style={styles.permissionText}>Allow Video/Audio Calls</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#4CAF50" /> // Show loading indicator
        ) : (
          <Switch
            value={callPermission}
            onValueChange={handlePermissionToggle}
            thumbColor={callPermission ? "#4CAF50" : "#FF3D00"}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
          />
        )}
      </View>

      {requests.length === 0 ? (
        <Text style={styles.infoText}>No pending visitor requests.</Text>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {item.imageUrl && (
                <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
              )}
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.visitorName}</Text>
                <Text style={styles.cardSubtitle}>{item.purpose}</Text>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.responseButton, styles.approveButton]}
                    onPress={() => handleResponse(item._id, true)}
                  >
                    <Text style={styles.buttonText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.responseButton, styles.rejectButton]}
                    onPress={() => handleResponse(item._id, false)}
                  >
                    <Text style={styles.buttonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
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
    marginBottom: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFF',
  },
  logoutText: {
    color: '#FF5A5F',
    fontWeight: '600',
  },
  input: {
    width: '100%',
    backgroundColor: '#2A2A3D',
    color: '#FFF',
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#4F8EF7',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#2A2A3D',
    borderRadius: 12,
    width: width - 40,
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
  cardSubtitle: {
    fontSize: 16,
    color: '#BBB',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  responseButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  rejectButton: {
    backgroundColor: '#FF5722',
    marginLeft: 8,
  },
  infoText: {
    color: '#AAA',
    fontSize: 16,
    marginTop: 20,
  },
  permissionToggle: {
    backgroundColor: '#2A2A3D',
    width: width - 40,
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  permissionText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
