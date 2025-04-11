import React from 'react';
import { View, Text, Button, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={{ uri: 'https://via.placeholder.com/800x1200.png?text=Background+Image' }} // Replace with your background image URL
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to Apartment Management App</Text>
        <Text style={styles.subtitle}>Manage your apartment effortlessly!</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.securityButton]}
            onPress={() => router.push('/securityhome')}
          >
            <Text style={styles.buttonText}>Go to Security</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.ownerButton]}
            onPress={() => router.push('/owner')}
          >
            <Text style={styles.buttonText}>Go to Owner</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Adds a semi-transparent overlay
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#d3d3d3',
    marginBottom: 30,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '80%',
    marginTop: 20,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  securityButton: {
    backgroundColor: '#4267B2', // Blue for Security
  },
  ownerButton: {
    backgroundColor: '#DB4437', // Red for Owner
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
