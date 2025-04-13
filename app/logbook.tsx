import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import background from '../assets/images/background2.jpg';
import { useAuth } from '../src/context/AuthContext';
import { findownerroomno } from '@/src/api/security';

export default function WelcomeScreen() {
  const [email, setemail] = useState('');
  const [name, setname] = useState('');
  const [phoneno, setphoneno] = useState('');
  const [permission, setpermission] = useState(false);
  const [roomno, setroomno] = useState('');
  const [displayDetails, setDisplayDetails] = useState(false);
  const { authData } = useAuth();
  const router = useRouter();

  const handlefindowner = async (roomno: string) => {
    console.log("button is pressed");
    if (!authData) {
      Alert.alert('Error', 'Authentication data not found.');
      return;
    }
    try {
      console.log("inside the handlefindowner");
      const response = await findownerroomno(authData?.token, roomno);
      if (response.success) {
        setemail(response.body?.email ?? 'N/A');
        setname(response.body.name ?? 'N/A');
        setphoneno(response.body.phoneno ?? 'N/A');
        setpermission(response.body.permission ?? false);
        setDisplayDetails(true);
      } else {
        setDisplayDetails(false);
        Alert.alert('Not Found', 'No owner found for this room.');
      }
    } catch (error) {
      console.error('Error finding owner:', error);
      Alert.alert('Error', 'Failed to find owner.');
    }
  };

  return (
    <ImageBackground source={background} style={styles.background} blurRadius={5}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Search Owner by Flat No</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Flat No"
          placeholderTextColor="#ddd"
          value={roomno}
          onChangeText={setroomno}
        />
        <TouchableOpacity style={styles.searchButton} onPress={() => handlefindowner(roomno)}>
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>

        {displayDetails && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Owner Details</Text>
            <Text style={styles.detailText}><Text style={styles.label}>Name:</Text> {name}</Text>
            <Text style={styles.detailText}><Text style={styles.label}>Email:</Text> {email}</Text>
            <Text style={styles.detailText}><Text style={styles.label}>Phone:</Text> {phoneno}</Text>
            <Text style={styles.detailText}>
              <Text style={styles.label}>Permission:</Text>{' '}
              <Text style={{ color: permission ? 'green' : 'red', fontWeight: 'bold' }}>
                {permission ? 'Granted' : 'Denied'}
              </Text>
            </Text>
          </View>
        )}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  input: {
    width: '90%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: 'white',
    marginBottom: 20,
  },
  searchButton: {
    backgroundColor: '#1e90ff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  resultContainer: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 20,
    borderRadius: 12,
    marginTop: 10,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
    textAlign: 'center',
  },
  detailText: {
    fontSize: 16,
    marginBottom: 8,
    color: 'black',
  },
  label: {
    fontWeight: 'bold',
  },
});
