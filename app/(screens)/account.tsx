import { View, Text, TouchableOpacity, Alert, Image } from "react-native";
import { useRouter, Redirect } from "expo-router";
import { useState } from "react";
import { ArrowLeft, User, Settings, LogOut, History } from "lucide-react-native";

export default function Account() {
  const [mockUser, setMockUser] = useState({
    email: "janedoe@gmail.com",
    name: "Jane Doe",
    isAuthenticated: true,
    profileImage: require("../../assets/images/profile.jpg"),
  });

  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        onPress: () => {
          setMockUser({ ...mockUser, isAuthenticated: false });
          router.replace("/login");
        },
      },
    ]);
  };

  if (!mockUser.isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-lime-300 pt-12 pb-14 px-5">
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 -ml-2"
          >
            <ArrowLeft size={24} color="#1A3C34" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-green-900">Profile</Text>
          <View className="w-8" />
        </View>
      </View>

      {/* Profile Section */}
      <View className="items-center -mt-14 mb-6">
        <View className="p-1 bg-white rounded-full shadow-sm">
          <Image
            source={mockUser.profileImage}
            className="w-32 h-32 rounded-full border-2 border-lime-100"
          />
        </View>
        <Text className="text-3xl font-bold text-green-900 mt-4">
          {mockUser.name}
        </Text>
        <Text className="text-lg text-gray-500 mt-1">{mockUser.email}</Text>
      </View>

      {/* Action Buttons */}
      <View className="px-6 mt-4 space-y-5">
        <TouchableOpacity
          className="flex-row items-center justify-between p-5 bg-lime-50 rounded-xl border border-lime-100 mb-4"
          onPress={() => Alert.alert("Edit Profile")}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <View className="bg-lime-200 p-2 rounded-lg mr-4">
              <User size={20} color="#1A3C34" />
            </View>
            <Text className="text-lg font-semibold text-green-900">
              Edit Profile
            </Text>
          </View>
          <View className="w-5 h-5" />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center justify-between p-5 bg-lime-50 rounded-xl border border-lime-100 mb-4"
          onPress={() => router.push("/history")}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <View className="bg-lime-200 p-2 rounded-lg mr-4">
              <History size={20} color="#1A3C34" />
            </View>
            <Text className="text-lg font-semibold text-green-900">
              History
            </Text>
          </View>
          <View className="w-5 h-5" />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center justify-between p-5 bg-lime-50 rounded-xl border border-lime-100 mb-4"
          onPress={() => router.push("/settings")}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <View className="bg-lime-200 p-2 rounded-lg mr-4">
              <Settings size={20} color="#1A3C34" />
            </View>
            <Text className="text-lg font-semibold text-green-900">
              Settings
            </Text>
          </View>
          <View className="w-5 h-5" />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center justify-between p-5 bg-red-50 rounded-xl border border-red-100"
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <View className="bg-red-200 p-2 rounded-lg mr-4">
              <LogOut size={20} color="#D32F2F" />
            </View>
            <Text className="text-lg font-semibold text-red-600">Logout</Text>
          </View>
          <View className="w-5 h-5" />
        </TouchableOpacity>
      </View>
    </View>
  );
}