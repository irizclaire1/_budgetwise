import { View, Text, TouchableOpacity, Alert, Image, StyleSheet } from "react-native";
import { useRouter, Redirect } from "expo-router";
import { useState } from "react";

export default function Account() {
  const [mockUser, setMockUser] = useState({
    email: "user@example.com",
    name: "Iriz Claire",
    isAuthenticated: true,
    profileImage: require("../../assets/images/profile.jpg") 
  });
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Log Out", 
          onPress: () => {
            setMockUser({ ...mockUser, isAuthenticated: false });
            router.replace("/login");
          }
        }
      ]
    );
  };

  if (!mockUser.isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <Image 
          source={mockUser.profileImage} 
          style={styles.profileImage}
        />
        <Text style={styles.userName}>{mockUser.name}</Text>
        <Text style={styles.userEmail}>{mockUser.email}</Text>
      </View>

      {/* Account Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() => Alert.alert("Edit Profile", "Edit profile functionality would go here")}
        >
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.settingsButton]}
          onPress={() => router.push("/settings")}
        >
          <Text style={styles.buttonText}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#B2EA71',
    marginBottom: 15,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1A3C34',
  },
  userEmail: {
    fontSize: 16,
    color: '#6B7280',
  },
  actionsContainer: {
    width: '100%',
  },
  button: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editButton: {
    backgroundColor: '#E7F5E3',
    borderWidth: 1,
    borderColor: '#A3C5A8',
  },
  settingsButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  logoutButton: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#EF9A9A',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});