import { Slot, useRouter } from "expo-router";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import Toast from "react-native-toast-message";
import { toastConfig } from "../config/toastConfig";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import "@/global.css";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [authStatus, setAuthStatus] = useState<"checking" | "authenticated" | "unauthenticated">(
    "checking"
  );
  const router = useRouter();

  useEffect(() => {
    if (!fontsLoaded) return;

    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        setAuthStatus(token ? "authenticated" : "unauthenticated");
      } catch (error) {
        console.error("Error checking auth:", error);
        setAuthStatus("unauthenticated");
      }
    };

    checkAuth();
  }, [fontsLoaded]);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.replace("/login");
    }
  }, [authStatus, router]);

  if (!fontsLoaded || authStatus === "checking") {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#1A3C34" />
      </View>
    );
  }

  return (
    <>
      <Slot />
      <Toast config={toastConfig} />
    </>
  );
}