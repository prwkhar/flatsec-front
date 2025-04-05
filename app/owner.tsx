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
import { ImageBackground } from "react-native";
import { io, Socket } from "socket.io-client";

const background = require("../assets/images/background.jpg");

// Replace with your Socket.IO server URL
const SOCKET_URL = `http://172.20.10.2:3000`;

// Define the type for visitor requests using _id as string.
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
  // Only pending requests (status 0) are shown on the owner's dashboard.
  const [requests, setRequests] = useState<VisitorRequest[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (authData && authData.role === "owner") {
      fetchRequests();

      const newSocket: Socket = io(SOCKET_URL, {
        query: { token: authData.token },
      });
      newSocket.on("status_update", (updatedRequest: VisitorRequest) => {
        setRequests((prevRequests) => {
          const filtered = prevRequests.filter(
            (r) => r._id !== updatedRequest._id
          );
          return filtered;
        });
      });
      newSocket.on("new_request", (data: VisitorRequest) => {
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
      <ImageBackground source={background} style={styles.background}>
        <View style={styles.loginContainer}>
          <Text style={styles.title}>Owner Login</Text>
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
          <Button title="Login" onPress={handleLogin} />
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={background} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>Owner Dashboard</Text>
        <Button title="Logout" onPress={logout} />
        <FlatList
          data={requests}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardText}>Name: {item.visitorName}</Text>
              <Text style={styles.cardText}>Purpose: {item.purpose}</Text>
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  loginContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)", // semi-transparent dark overlay for login
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)", // semi-transparent dark overlay for dashboard
  },
  title: {
    fontSize: 30,
    marginBottom: 20,
    color: "#fff", // white text for better readability on dark background
  },
  input: {
    width: "80%",
    borderWidth: 1,
    borderColor: "#fff",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    color: "#fff",
    backgroundColor: "rgba(255,255,255,0.2)", // light overlay background for input
  },
  card: {
    borderWidth: 1,
    borderColor: "#fff",
    padding: 10,
    marginVertical: 5,
    width: "100%",
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.9)", // card background for readability
  },
  cardText: {
    color: "#000",
  },
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
