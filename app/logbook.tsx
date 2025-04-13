import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { findownerroomno } from '@/src/api/security';

export default function WelcomeScreen() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [permission, setPermission] = useState(false);
  const [roomNo, setRoomNo] = useState('');
  const [displayDetails, setDisplayDetails] = useState(false);
  const { authData } = useAuth();
  const router = useRouter();

  const handleFindOwner = async (room: string) => {
    if (!authData) {
      Alert.alert('Error', 'Authentication data not found.');
      return;
    }
    try {
      const response = await findownerroomno(authData.token, room);
      if (response.success) {
        setEmail(response.body?.email ?? 'N/A');
        setName(response.body.name ?? 'N/A');
        setPhoneNo(response.body.phoneno ?? 'N/A');
        setPermission(response.body.permission ?? false);
        setDisplayDetails(true);
      } else {
        setDisplayDetails(false);
        Alert.alert('Not Found', 'No owner found for this room.');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to find owner.');
    }
  };

  return (
    <View style={styles.background}>
      <StatusBar barStyle="light-content" translucent backgroundColor="black" />
      <ScrollView contentContainerStyle={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Search Owner by Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Owners Email"
            placeholderTextColor="#aaa"
            value={roomNo}
            onChangeText={setRoomNo}
          />
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => handleFindOwner(roomNo)}
          >
            <Text style={styles.buttonText}>Search</Text>
          </TouchableOpacity>
        </View>

        {displayDetails && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Owner Details</Text>
            <Text style={styles.detailText}>
              <Text style={styles.label}>Name:</Text> {name}
            </Text>
            <Text style={styles.detailText}>
              <Text style={styles.label}>Email:</Text> {email}
            </Text>
            <Text style={styles.detailText}>
              <Text style={styles.label}>Phone:</Text> {phoneNo}
            </Text>
            <Text style={styles.detailText}>
              <Text style={styles.label}>Permission:</Text>{' '}
              <Text
                style={[
                  styles.permissionText,
                  { color: permission ? '#4CAF50' : '#FF5722' },
                ]}
              >
                {permission ? 'Granted' : 'Denied'}
              </Text>
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#1E1E2F',
  },
  overlay: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#2A2A3D',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#1E1E2F',
    color: '#FFF',
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3A3A55',
  },
  primaryButton: {
    backgroundColor: '#4F8EF7',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resultCard: {
    width: '100%',
    backgroundColor: '#F4F6FA',
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2E3B4E',
    marginBottom: 12,
    textAlign: 'center',
  },
  detailText: {
    fontSize: 16,
    color: '#2E3B4E',
    marginBottom: 8,
  },
  label: {
    fontWeight: '700',
    color: '#2E3B4E',
  },
  permissionText: {
    fontWeight: '700',
  },
});
