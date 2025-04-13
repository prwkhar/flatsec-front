import React from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <View style={styles.titleBox}>
        <Text style={styles.title}>FLATSEC</Text>
        <Text style={styles.subtitle}>Manage your apartment effortlessly!</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.securityButton]}
          onPress={() => router.push('/homesecurity')}
        >
          <FontAwesome name="shield" size={28} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Security</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.ownerButton]}
          onPress={() => router.push('/owner')}
        >
          <FontAwesome name="user" size={28} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Owner</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.adminButton]}
          onPress={() => router.push('/admin')}
        >
          <FontAwesome name="user-secret" size={28} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Admin</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E2F',  // same dark family
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  titleBox: {
    backgroundColor: '#2A2A3D',   // slightly lighter dark
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#CCCCCC',
    marginTop: 8,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 4,
  },
  icon: {
    marginRight: 16,
  },
  buttonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'Poppins-Regular',
  },
  securityButton: {
    backgroundColor: '#4F8EF7', // accent blue
  },
  ownerButton: {
    backgroundColor: '#6A6AEF', // secondary blue
  },
  adminButton: {
    backgroundColor: '#FF5A5F', // accent red
  },
});

