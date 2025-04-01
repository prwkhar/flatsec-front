// app/owner.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Alert,
  StyleSheet,
  Image,
} from "react-native";
import { useAuth } from "../src/context/AuthContext";
import { loginOwner } from "../src/api/auth";
import { getVisitorRequests, respondToRequest } from "../src/api/owner";
import { io, Socket } from "socket.io-client";

// Replace with your Socket.IO server URL
const SOCKET_URL = `http://192.168.185.234:3000`;

// Define the type for visitor requests using _id as string.
interface VisitorRequest {
  _id: string;
  visitorName: string;
  purpose: string;
  imageUrl?: string; // Optional image URL
  status: number; // 0: pending, 1: approved, -1: rejected
}

export default function OwnerScreen() {
  const { authData, login, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Only pending requests (status 0) are shown on the owner's dashboard.
  const [requests, setRequests] = useState<VisitorRequest[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (authData && authData.role === "owner") {
      fetchRequests();

      // Set up Socket.IO connection for real-time updates (if needed)
      const newSocket: Socket = io(SOCKET_URL, {
        query: { token: authData.token },
      });
      newSocket.on("status_update", (updatedRequest: VisitorRequest) => {
        // If the updated request is no longer pending, remove it from the owner's list.
        setRequests((prevRequests) => {
          const filtered = prevRequests.filter(
            (r) => r._id !== updatedRequest._id
          );
          return filtered;
        });
      });
      newSocket.on("new_request", (data: VisitorRequest) => {
        // If a new request comes in and it is pending, add it.
        if (data.status === 0) {
          setRequests((prevRequests) => [data, ...prevRequests]);
        }
      });
      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
    return undefined;
  }, [authData]);

  const fetchRequests = async () => {
    if (!authData) return;
    const response = await getVisitorRequests(authData.token);
    if (response.success) {
      // Filter to show only pending requests (status === 0)
      const pendingRequests = (response.data as VisitorRequest[]).filter(
        (r) => r.status === 0
      );
      setRequests(pendingRequests);
    } else {
      Alert.alert("Error", response.message);
    }
  };

  const handleResponse = async (id: string, accepted: boolean) => {
    if (!authData) return;
    const response = await respondToRequest(authData.token, id, accepted);
    if (response.success) {
      Alert.alert("Response sent", accepted ? "Approved" : "Rejected");
      // Refresh the requests (owner dashboard shows only pending ones)
      fetchRequests();
    } else {
      Alert.alert("Error", response.message);
    }
  };

  const handleLogin = async () => {
    const response = await loginOwner(email, password);
    if (response.success) {
      login({ token: response.data.token, role: "owner" });
    } else {
      Alert.alert("Login Failed", response.message);
    }
  };

  if (!authData || authData.role !== "owner") {
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Owner Dashboard</Text>
      <Button title="Logout" onPress={logout} />
      <FlatList
        data={requests}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>Name: {item.visitorName}</Text>
            <Text>Purpose: {item.purpose}</Text>
            {item.imageUrl && (
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.image}
                resizeMode="contain" // Use "cover" or "stretch" if needed
              />
            )}
            <View style={styles.buttonRow}>
              <Button
                title="Approve"
                onPress={() => handleResponse(item._id, true)}
              />
              <Button
                title="Reject"
                onPress={() => handleResponse(item._id, false)}
              />
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: "center" },
  title: { fontSize: 24, marginBottom: 20 },
  input: { width: "80%", borderWidth: 1, padding: 10, marginBottom: 10 },
  card: { borderWidth: 1, padding: 10, marginVertical: 5, width: "100%" },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginTop: 10,
  },
});
