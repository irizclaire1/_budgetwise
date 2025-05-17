import { Link, useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { useState } from "react";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock user data
const MOCK_USERS = [
  { email: "user@example.com", password: "password123" }
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const router = useRouter();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateEmail = (input: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!input) {
      setEmailError(null);
    } else if (!emailRegex.test(input)) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError(null);
    }
  };

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      Alert.alert("Missing Fields", "Please enter both email and password.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setEmailError(null);
    setPasswordError(null);

    // Mock authentication
    setTimeout(async () => {
      const user = MOCK_USERS.find(u => 
        u.email === trimmedEmail && u.password === password
      );

      if (user) {
        try {
          await AsyncStorage.setItem('userToken', 'mock-token');
          await AsyncStorage.setItem('userEmail', trimmedEmail);
          Alert.alert("Login Successful", "Welcome back!");
          router.replace("/");
        } catch (error) {
          console.error("Error storing auth data:", error);
          Alert.alert("Error", "Failed to store login data.");
          setLoading(false);
          return;
        }
      } else {
        Alert.alert("Login Failed", "Invalid email or password");
        setPasswordError("Invalid email or password");
      }
      setLoading(false);
    }, 1500);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userEmail');
      router.replace("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      Alert.alert("Error", "Failed to log out.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#FFFFFF]"
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        className="px-6"
      >
        <View className="w-full space-y-6">
          {/* Logo and Title */}
          <View className="mb-6">
            <View className="flex-row items-center justify-start gap-x-2">
              <Image
                source={require("../../assets/images/bw-large.png")}
                className="w-16 h-16 mr-2"
                resizeMode="contain"
              />
              <Text className="text-[#1A3C34] text-xl" style={{ fontFamily: 'Poppins_500Medium' }}>
                BudgetWise.
              </Text>
            </View>

            <Text className="text-[#1A3C34] text-4xl" style={{ fontFamily: 'Poppins_700Bold' }}>
              Welcome Back!
            </Text>
            <Text className="text-[#4B5563] text-xl mt-2" style={{ fontFamily: 'Poppins_500Medium' }}>
              Sign In To Continue
            </Text>
          </View>

          {/* Email Input */}
          <View className="mb-2 mt-7">
            <View className="flex-row items-center border border-[#A3C5A8] rounded-xl px-4 py-3 bg-[#E7F5E3]">
              <TextInput
                placeholder="Email"
                placeholderTextColor="#6B7280"
                className="flex-1 text-[#4B5563] text-base"
                style={{ fontFamily: 'Poppins_400Regular' }}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  validateEmail(text);
                  setPasswordError(null);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <MaterialIcons name="email" size={22} color="#6B7280" />
            </View>
            {emailError && (
              <Text className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Poppins_400Regular' }}>
                {emailError}
              </Text>
            )}
          </View>

          {/* Password Input */}
          <View className="mb-1">
            <View className="flex-row items-center border border-[#A3C5A8] rounded-xl px-4 py-3 bg-[#E7F5E3] mt-4">
              <TextInput
                placeholder="Password"
                placeholderTextColor="#6B7280"
                className="flex-1 text-[#4B5563] text-base"
                style={{ fontFamily: 'Poppins_400Regular' }}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError(null);
                }}
              />
              <TouchableOpacity onPress={togglePasswordVisibility}>
                <Feather
                  name={showPassword ? "eye" : "eye-off"}
                  size={22}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
            {passwordError && (
              <Text className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Poppins_400Regular' }}>
                {passwordError}
              </Text>
            )}
          </View>

          {/* Forgot Password */}
          <View className="items-end mb-6 mt-1">
            <Link
              href="/(auth)/forgot-password"
              className="text-[#2563EB] font-medium"
              style={{ fontFamily: 'Poppins_400Regular' }}
            >
              Forgot Password?
            </Link>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            className={`rounded-xl py-4 mt-2 ${loading ? "bg-[#B2EA71]/50" : "bg-[#B2EA71]"}`}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#133C13" />
            ) : (
              <Text className="text-center text-[#133C13] text-lg" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                Sign In
              </Text>
            )}
          </TouchableOpacity>

          {/* Sign Up Link */}
          <Text className="text-center text-[#4B5563] mt-4" style={{ fontFamily: 'Poppins_400Regular' }}>
            Don't have an account?{" "}
            <Link
              href="/(auth)/signup"
              className="text-[#2563EB] font-medium"
              style={{ fontFamily: 'Poppins_500Medium' }}
            >
              Sign Up
            </Link>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}