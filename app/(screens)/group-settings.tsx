import React from "react";
import { Text, View, TouchableOpacity, Modal, Pressable, Alert } from "react-native";
import { ArrowLeft, ChevronRight, X, UserPlus, Link, LogOut, Trash2, Users } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function GroupBudgetSettings() {
  const router = useRouter();
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [groupName] = useState("Family Budget"); // This would normally come from props or context

  const handleLeaveGroup = () => {
    Alert.alert(
      "Leave Group",
      `Are you sure you want to leave ${groupName}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Leave", style: "destructive", onPress: () => console.log("Left group") }
      ]
    );
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      "Delete Group",
      `Are you sure you want to delete ${groupName}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => console.log("Deleted group") }
      ]
    );
  };

  const copyInviteLink = () => {
    // Logic to copy invite link to clipboard
    console.log("Invite link copied");
    Alert.alert("Invite link copied to clipboard!");
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="pt-12 pb-3 px-5">
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 -ml-2"
          >
            <ArrowLeft size={24} color="#1A3C34" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-green-900">Group Settings</Text>
          <View className="w-8" />
        </View>
      </View>

      {/* Group Info */}
      <View className="px-6 mb-6">
        <View className="flex-row items-center p-5 bg-lime-50 rounded-xl border border-lime-100">
          <Users size={24} color="#1A3C34" className="mr-3" />
          <Text className="text-lg font-semibold text-green-900">{groupName}</Text>
        </View>
      </View>

      {/* Settings List */}
      <View className="px-6 space-y-4">
        {/* Invite Friend */}
        <TouchableOpacity
          className="flex-row items-center justify-between p-5 bg-lime-50 rounded-xl border border-lime-100"
          onPress={() => setInviteModalVisible(true)}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <UserPlus size={20} color="#1A3C34" className="mr-3" />
            <Text className="text-lg font-semibold text-green-900">Invite Friend</Text>
          </View>
          <View className="bg-lime-200 p-2 rounded-lg">
            <ChevronRight size={20} color="#1A3C34" />
          </View>
        </TouchableOpacity>

        {/* Invitation Link */}
        <TouchableOpacity
          className="flex-row items-center justify-between p-5 bg-lime-50 rounded-xl border border-lime-100"
          onPress={copyInviteLink}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <Link size={20} color="#1A3C34" className="mr-3" />
            <Text className="text-lg font-semibold text-green-900">Invitation Link</Text>
          </View>
          <View className="bg-lime-200 p-2 rounded-lg">
            <ChevronRight size={20} color="#1A3C34" />
          </View>
        </TouchableOpacity>

        {/* Leave Group */}
        <TouchableOpacity
          className="flex-row items-center justify-between p-5 bg-amber-50 rounded-xl border border-amber-100"
          onPress={handleLeaveGroup}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <LogOut size={20} color="#92400E" className="mr-3" />
            <Text className="text-lg font-semibold text-amber-900">Leave Group</Text>
          </View>
          <View className="bg-amber-200 p-2 rounded-lg">
            <ChevronRight size={20} color="#92400E" />
          </View>
        </TouchableOpacity>

        {/* Delete Group */}
        <TouchableOpacity
          className="flex-row items-center justify-between p-5 bg-red-50 rounded-xl border border-red-100"
          onPress={handleDeleteGroup}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <Trash2 size={20} color="#991B1B" className="mr-3" />
            <Text className="text-lg font-semibold text-red-900">Delete Group</Text>
          </View>
          <View className="bg-red-200 p-2 rounded-lg">
            <ChevronRight size={20} color="#991B1B" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Invite Friend Modal */}
      <Modal
        visible={inviteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setInviteModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-2xl p-6 max-h-[60%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-green-900">
                Invite Friends
              </Text>
              <TouchableOpacity onPress={() => setInviteModalVisible(false)}>
                <X size={24} color="#1A3C34" />
              </TouchableOpacity>
            </View>
            
            <View className="space-y-4">
              <Text className="text-gray-600 mb-2">
                Invite friends to join {groupName} by sharing the invitation link.
              </Text>
              
              <TouchableOpacity
                className="flex-row items-center justify-center p-4 bg-lime-100 rounded-lg border border-lime-200"
                onPress={copyInviteLink}
              >
                <Link size={20} color="#1A3C34" className="mr-2" />
                <Text className="text-lg font-semibold text-green-900">Copy Invitation Link</Text>
              </TouchableOpacity>
              
              <Text className="text-center text-gray-500 mt-2">
                Or share via:
              </Text>
              
              <View className="flex-row justify-center space-x-4">
                {/* These would be actual share buttons in a real app */}
                <View className="p-3 bg-gray-100 rounded-full">
                  <Text>WhatsApp</Text>
                </View>
                <View className="p-3 bg-gray-100 rounded-full">
                  <Text>Email</Text>
                </View>
                <View className="p-3 bg-gray-100 rounded-full">
                  <Text>SMS</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}