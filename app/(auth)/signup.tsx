import { Link, useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator
} from "react-native";
import { useState } from "react";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      username: "",
      email: "",
      password: ""
    };

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
      valid = false;
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
      valid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user types
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store user data in AsyncStorage
      await AsyncStorage.setItem('userToken', 'mock-auth-token');
      await AsyncStorage.setItem('userEmail', formData.email);
      await AsyncStorage.setItem('username', formData.username);

      Alert.alert("Success", "Account created successfully!", [
        {
          text: "Continue",
          onPress: () => router.replace("/(auth)/onboarding")
        }
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to create account. Please try again.");
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-[#FFFFFF] px-6">
      <View className="w-full space-y-6">
        {/* Logo and Title */}
        <View className="mb-6">
          <View className="flex-row items-center justify-start gap-x-2">
            <Image
              source={require("../../assets/images/bw-large.png")}
              className="w-16 h-16 mr-2"
              resizeMode="contain"
            />
            <Text
              className="text-[#1A3C34] text-xl"
              style={{ fontFamily: "Poppins_500Medium" }}
            >
              BudgetWise.
            </Text>
          </View>

          <Text
            className="text-[#1A3C34] text-4xl"
            style={{ fontFamily: "Poppins_700Bold" }}
          >
            Register Now!
          </Text>
          <Text
            className="text-[#4B5563] text-xl mt-2"
            style={{ fontFamily: "Poppins_500Medium" }}
          >
            Create New Account
          </Text>
        </View>

        {/* Username Input */}
        <View className="mb-5">
          <View className={`flex-row items-center border ${errors.username ? "border-red-500" : "border-[#A3C5A8]"} rounded-xl px-4 py-3 bg-[#E7F5E3]`}>
            <TextInput
              placeholder="User Name"
              placeholderTextColor="#6B7280"
              className="flex-1 text-[#4B5563] text-base"
              style={{ fontFamily: "Poppins_400Regular" }}
              value={formData.username}
              onChangeText={(text) => handleInputChange("username", text)}
            />
            <Feather name="user" size={22} color="#6B7280" />
          </View>
          {errors.username && (
            <Text className="text-red-500 text-sm mt-1" style={{ fontFamily: "Poppins_400Regular" }}>
              {errors.username}
            </Text>
          )}
        </View>

        {/* Email Input */}
        <View className="mb-5">
          <View className={`flex-row items-center border ${errors.email ? "border-red-500" : "border-[#A3C5A8]"} rounded-xl px-4 py-3 bg-[#E7F5E3]`}>
            <TextInput
              placeholder="Email"
              placeholderTextColor="#6B7280"
              className="flex-1 text-[#4B5563] text-base"
              style={{ fontFamily: "Poppins_400Regular" }}
              value={formData.email}
              onChangeText={(text) => handleInputChange("email", text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <MaterialIcons name="email" size={22} color="#6B7280" />
          </View>
          {errors.email && (
            <Text className="text-red-500 text-sm mt-1" style={{ fontFamily: "Poppins_400Regular" }}>
              {errors.email}
            </Text>
          )}
        </View>

        {/* Password Input */}
        <View className="mb-1">
          <View className={`flex-row items-center border ${errors.password ? "border-red-500" : "border-[#A3C5A8]"} rounded-xl px-4 py-3 bg-[#E7F5E3]`}>
            <TextInput
              placeholder="Password"
              placeholderTextColor="#6B7280"
              className="flex-1 text-[#4B5563] text-base"
              style={{ fontFamily: "Poppins_400Regular" }}
              secureTextEntry={!showPassword}
              value={formData.password}
              onChangeText={(text) => handleInputChange("password", text)}
            />
            <TouchableOpacity onPress={togglePasswordVisibility}>
              <Feather
                name={showPassword ? "eye" : "eye-off"}
                size={22}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text className="text-red-500 text-sm mt-1" style={{ fontFamily: "Poppins_400Regular" }}>
              {errors.password}
            </Text>
          )}
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity
          className={`rounded-xl py-5 mt-6 ${loading ? "bg-[#B2EA71]/70" : "bg-[#B2EA71]"}`}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#133C13" />
          ) : (
            <Text
              className="text-center text-[#133C13] text-lg"
              style={{ fontFamily: "Poppins_600SemiBold" }}
            >
              Sign Up
            </Text>
          )}
        </TouchableOpacity>

        {/* Sign In Link */}
        <Text
          className="text-center text-[#4B5563] mt-4"
          style={{ fontFamily: "Poppins_400Regular" }}
        >
          Already have an account?{" "}
          <Link
            href="/(auth)/login"
            className="text-[#2563EB]"
            style={{ fontFamily: "Poppins_500Medium" }}
          >
            Sign In
          </Link>
        </Text>
      </View>
    </View>
  );
}