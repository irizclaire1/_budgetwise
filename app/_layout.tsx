import { Slot } from "expo-router";
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from "@expo-google-fonts/poppins";
import Toast from 'react-native-toast-message';
import { toastConfig } from '../config/toastConfig';
import { View, ActivityIndicator } from "react-native";
import "@/global.css";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
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
