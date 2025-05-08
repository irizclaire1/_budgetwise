import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { ChevronLeft, Bell, Check, MoreVertical, Wallet, Users, AlertTriangle, Clock } from 'lucide-react-native';
import { Link } from 'expo-router';

const notifications = [
  {
    id: '2',
    type: 'reminder',
    title: 'Budget Alert',
    message: 'Your "Dining Out" budget is 80% used',
    time: '1 hour ago',
    read: true
  },
  {
    id: '3',
    type: 'group',
    title: 'New Group Member',
    message: 'Sarah joined your "Family Vacation" group',
    time: '3 hours ago',
    read: true
  },
  {
    id: '4',
    type: 'system',
    title: 'App Update',
    message: 'New version 2.1.0 is available with bug fixes',
    time: '1 day ago',
    read: true
  },
];

export default function Notifications() {
  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
        <Link href="/(tabs)/wallet" asChild>
          <TouchableOpacity className="p-2">
            <ChevronLeft size={24} color="#000000" />
          </TouchableOpacity>
        </Link>
        <Text className="text-lg font-semibold">Notifications</Text>
        <TouchableOpacity className="p-2">
          <Check size={24} color="#133C13" />
        </TouchableOpacity>
      </View>

      {/* Notification List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            className={`p-4 border-b border-gray-100 flex-row ${!item.read ? 'bg-[#E0FFC0]' : ''}`}
          >
            {/* Icon based on notification type */}
            <View className="mr-3">
              {item.type === 'reminder' && (
                <View className="bg-[#FFD166] p-2 rounded-full">
                  <AlertTriangle size={20} color="#133C13" />
                </View>
              )}
              {item.type === 'group' && (
                <View className="bg-[#A5D8FF] p-2 rounded-full">
                  <Users size={20} color="#133C13" />
                </View>
              )}
              {item.type === 'system' && (
                <View className="bg-[#C0E8FF] p-2 rounded-full">
                  <Bell size={20} color="#133C13" />
                </View>
              )}
            </View>

            {/* Notification content */}
            <View className="flex-1">
              <Text className={`font-medium ${!item.read ? 'text-[#133C13]' : 'text-gray-800'}`}>
                {item.title}
              </Text>
              <Text className="text-gray-600 text-sm mt-1">{item.message}</Text>
              <View className="flex-row items-center mt-2">
                <Clock size={14} color="#9CA3AF" className="mr-1" />
                <Text className="text-gray-400 text-xs">{item.time}</Text>
              </View>
            </View>

            {/* Options */}
            <TouchableOpacity className="p-2">
              <MoreVertical size={18} color="#133C13" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-10">
            <Bell size={48} color="#B2EA71" className="mb-4" />
            <Text className="text-gray-500">No notifications yet</Text>
          </View>
        }
      />

      {/* Mark All as Read Button */}
      <TouchableOpacity className="bg-[#133C13] mx-4 my-4 p-3 rounded-lg flex-row justify-center items-center">
        <Check size={18} color="#B2EA71" className="mr-2" />
        <Text className="text-[#B2EA71] font-medium">Mark All as Read</Text>
      </TouchableOpacity>
    </View>
  );
}