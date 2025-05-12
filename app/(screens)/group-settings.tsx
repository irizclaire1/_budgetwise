import React, { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert,
  Platform,
  ActivityIndicator,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { ArrowLeft, X, UserPlus, Link, LogOut, Trash2, Users, Mail, Send } from "lucide-react-native";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";

export default function GroupBudgetSettings() {
  const router = useRouter();
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [groupName] = useState("Family Budget");
  const [isCopying, setIsCopying] = useState(false);
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleLeaveGroup = () => {
    Alert.alert(
      "Leave Group",
      `Are you sure you want to leave ${groupName}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Leave", style: "destructive", onPress: () => console.log("Left group") },

      ]
    );
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      "Delete Group",
      `Are you sure you want to delete ${groupName}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => console.log("Deleted group") },
      ]
    );
  };

  const copyInviteLink = async () => {
    setIsCopying(true);
    await Clipboard.setStringAsync("https://example.com/invite");
    setIsCopying(false);
    Alert.alert("Success", "Invite link copied to clipboard!");
    setInviteModalVisible(false);
  };

  const handleSendEmailInvite = () => {
    if (!email) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setEmail("");
      Alert.alert("Invitation Sent", `An invitation has been sent to ${email}`);
      setInviteModalVisible(false);
    }, 1500);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      className="flex-1 bg-gray-50"
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Header */}
        <View className="pt-14 pb-5 px-6 bg-white">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-2 -ml-2 rounded-full bg-emerald-100/20"
              accessibilityLabel="Go back"
            >
              <ArrowLeft size={24} color="#1A3C34"/>
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-emerald-900">Group Settings</Text>
            <View className="w-8" />
          </View>
        </View>

        {/* Group Info */}
        <View className="px-6 mt-6 mb-6">
          <TouchableOpacity
            className="flex-row items-center p-5 rounded-2xl bg-white border border-gray-200 shadow-sm"
            activeOpacity={0.8}
          >
            <View className="p-3 rounded-lg bg-emerald-100/20">
              <Users size={22} color="#1A3C34" />
            </View>
            <Text className="flex-1 ml-4 text-lg font-medium text-emerald-900">Group Members</Text>
            <View className="px-3 py-1.5 rounded-full bg-emerald-100">
              <Text className="text-sm font-semibold text-emerald-900">3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Settings List */}
        <View className="px-6 space-y-3 mb-8">
          {/* Invite Friend */}
          <TouchableOpacity
            className="flex-row items-center p-5 rounded-2xl bg-white border border-gray-200 shadow-sm mb-5"
            onPress={() => setInviteModalVisible(true)}
            activeOpacity={0.8}
            accessibilityLabel="Invite a friend"
          >
            <View className="p-3 rounded-lg bg-emerald-100/20">
              <UserPlus size={22} color="#1A3C34" />
            </View>
            <Text className="flex-1 ml-4 text-lg font-medium text-emerald-900">Invite by Email</Text>
          </TouchableOpacity>

          {/* Invitation Link */}
          <TouchableOpacity
            className="flex-row items-center p-5 rounded-2xl bg-white border border-gray-200 shadow-sm"
            onPress={copyInviteLink}
            activeOpacity={0.8}
            accessibilityLabel="Copy invitation link"
          >
            <View className="p-3 rounded-lg bg-emerald-100/20">
              <Link size={22} color="#1A3C34" />
            </View>
            <Text className="flex-1 ml-4 text-lg font-medium text-emerald-900">Copy Invitation Link</Text>
            {isCopying ? (
              <ActivityIndicator size="small" className="text-emerald-900" />
            ) : (
              <Text className="text-sm text-gray-500">Tap to copy</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View className="my-4 mx-4 border-t border-gray-200" />

          {/* Leave Group */}
          <TouchableOpacity
            className="flex-row items-center p-5 rounded-2xl bg-white border border-gray-200 shadow-sm mb-5"
            onPress={handleLeaveGroup}
            activeOpacity={0.8}
            accessibilityLabel="Leave group"
          >
            <View className="p-3 rounded-lg bg-amber-100/20">
              <LogOut size={22} color="#b45309" />
            </View>
            <Text className="flex-1 ml-4 text-lg font-medium text-amber-700">Leave Group</Text>
          </TouchableOpacity>

          {/* Delete Group */}
          <TouchableOpacity
            className="flex-row items-center p-5 rounded-2xl bg-white border border-gray-200 shadow-sm"
            onPress={handleDeleteGroup}
            activeOpacity={0.8}
            accessibilityLabel="Delete group"
          >
            <View className="p-3 rounded-lg bg-red-100/20">
              <Trash2 size={22} color="#dc2626" />
            </View>
            <Text className="flex-1 ml-4 text-lg font-medium text-red-600">Delete Group</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Invite Friend Modal */}
      <Modal
        visible={inviteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setInviteModalVisible(false)}
      >
        <Pressable 
          className="flex-1 justify-center bg-black/50" 
          onPress={() => setInviteModalVisible(false)}
        >
          <Pressable className="mx-5">
            <View 
              className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xl"
            >
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-emerald-900">Invite to {groupName}</Text>
                <TouchableOpacity 
                  onPress={() => setInviteModalVisible(false)} 
                  accessibilityLabel="Close modal"
                  className="p-2 -mr-2 rounded-full bg-gray-100"
                >
                  <X size={20} color="#064e3b" />
                </TouchableOpacity>
              </View>

              <View className="space-y-5 mb-3">
                <Text className="text-gray-600 text-base mb-3">
                  Send an invitation to join your budget group.
                </Text>

                <View>
                  <View className="flex-row items-center border border-gray-200 rounded-xl px-4 py-3 bg-gray-100 mb-3">
                    <Mail size={20} className="mr-3" color="#9ca3af" />
                    <TextInput
                      className="flex-1 text-base text-emerald-900"
                      placeholder="friend@example.com"
                      placeholderTextColor="#9CA3AF"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                <View className="space-y-3">
                  <TouchableOpacity
                    className={`flex-row items-center justify-center p-4 rounded-xl space-x-3 ${isSending ? 'bg-emerald-200' : 'bg-emerald-100'}`}
                    onPress={handleSendEmailInvite}
                    disabled={isSending}
                  >
                    {isSending ? (
                      <ActivityIndicator size="small" className="text-emerald-900" />
                    ) : (
                      <>
                        <Send size={20} className="text-emerald-900" />
                        <Text className="text-lg font-semibold text-emerald-900">
                          Send Invitation
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <View className="flex-row items-center my-2">
                    <View className="flex-1 h-px bg-gray-200" />
                    <Text className="px-3 text-sm text-gray-500">or</Text>
                    <View className="flex-1 h-px bg-gray-200" />
                  </View>

                  <TouchableOpacity
                    className="flex-row items-center justify-center p-4 rounded-xl border border-gray-200 space-x-3 bg-gray-100"
                    onPress={copyInviteLink}
                  >
                    <Link size={20} className="text-emerald-900" />
                    <Text className="text-lg font-medium text-emerald-900">
                      Copy Invite Link
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}