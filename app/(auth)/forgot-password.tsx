import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

export default function ForgotPassword() {  
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock success response
    Alert.alert(
      "Email Sent", 
      "If this was a real app, a password reset email would be sent to: " + email.trim()
    );
    
    setEmail("");
    setLoading(false);
  };

  return (
    <View className="flex-1 justify-center bg-[#FFFFFF] px-6">
      {/* Go Back Button */}
      <TouchableOpacity
        className="absolute top-12 left-6 flex-row items-center"
        onPress={() => router.back()}
        accessibilityLabel="Go back button"
        accessibilityHint="Go back to the previous screen"
      >
        <Feather name="arrow-left" size={22} color="#1A3C34" />
        <Text
          className="ml-2 text-[#1A3C34] text-base"
          style={{ fontFamily: "Poppins_500Medium" }}
        >
          Go Back
        </Text>
      </TouchableOpacity>

      <View className="mt-15">
        <Text
          className="text-[#1A3C34] text-3xl font-bold mb-4"
          style={{ fontFamily: "Poppins_700Bold" }}
        >
          Reset Password
        </Text>
        <Text
          className="text-[#4B5563] text-lg mb-6"
          style={{ fontFamily: "Poppins_500Medium" }}
        >
          Enter your email to receive a password reset link.
        </Text>
        <TextInput
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          className="border border-[#A3C5A8] rounded-xl px-4 py-3 bg-[#E7F5E3] mb-4"
          style={{ fontFamily: "Poppins_400Regular" }}
          accessibilityLabel="Email input"
          accessibilityHint="Enter your email address"
        />
        <TouchableOpacity
          className={`rounded-xl py-4 ${
            loading ? "bg-[#B2EA71]/50" : "bg-[#B2EA71]"
          }`}
          onPress={handleResetPassword}
          disabled={loading}
          accessibilityLabel="Send reset email button"
          accessibilityHint="Send a password reset email"
        >
          {loading ? (
            <ActivityIndicator size="small" color="#133C13" />
          ) : (
            <Text
              className="text-center text-[#133C13] font-semibold text-lg"
              style={{ fontFamily: "Poppins_600SemiBold" }}
            >
              Send Reset Email
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}