import React, { useState, useEffect, useContext } from "react";
import {
  SafeAreaView,
  View,
  StyleSheet,
  Button,
  TextInput,
  Text,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView
} from "react-native";
import axios from "../../utils/axios";
import AuthContext from "../../context/AuthContext";

export default function ProfileScreen() {
  const { user, setUser } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/profile");
      const userData = response.data.user;
      setName(userData.name);
      setEmail(userData.email);
      setUser(userData);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load profile");
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const response = await axios.put("/profile", {
        name,
        email,
      });
      
      setUser(response.data.user);
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update profile";
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All password fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const response = await axios.put("/profile/password", {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword
      });
      
      setIsChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert("Success", "Password updated successfully");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update password";
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsChangingPassword(false);
    setName(user.name);
    setEmail(user.email);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  };

  if (loading && !isEditing && !isChangingPassword) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.disabledInput]}
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            editable={isEditing}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.disabledInput]}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            editable={isEditing}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          {error ? <Text style={styles.error}>{error}</Text> : null}
          
          {!isEditing && !isChangingPassword && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.editButton]} 
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.buttonText}>Edit Profile</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.passwordButton]} 
                onPress={() => setIsChangingPassword(true)}
              >
                <Text style={styles.buttonText}>Change Password</Text>
              </TouchableOpacity>
            </View>
          )}

          {isEditing && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]} 
                onPress={handleUpdateProfile}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Save Profile</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={handleCancel}
                disabled={loading}
              >
                <Text style={[styles.buttonText, styles.cancelText]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          {isChangingPassword && (
            <View style={styles.passwordSection}>
              <Text style={styles.sectionTitle}>Change Password</Text>
              
              <Text style={styles.label}>Current Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter current password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
              />

              <Text style={styles.label}>New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />

              <Text style={styles.label}>Confirm New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />

              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={[styles.button, styles.saveButton]} 
                  onPress={handleUpdatePassword}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>Update Password</Text>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]} 
                  onPress={handleCancel}
                  disabled={loading}
                >
                  <Text style={[styles.buttonText, styles.cancelText]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.48,
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  passwordButton: {
    backgroundColor: '#5856D6',
  },
  saveButton: {
    backgroundColor: '#4CD964',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelText: {
    color: '#FF3B30',
  },
  error: {
    color: '#FF3B30',
    marginBottom: 16,
    fontSize: 14,
  },
  passwordSection: {
    marginTop: 20,
  }
});