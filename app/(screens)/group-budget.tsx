import { Link } from "expo-router";
import { Animated } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Text, View, TouchableOpacity, FlatList, ActivityIndicator, ScrollView, Modal, TextInput } from "react-native";
import { ChevronLeft, ChevronRight, Plus, Users } from "lucide-react-native";

interface GroupBudget {
  id: string;
  groupName: string;
  totalBudget: number;
  totalSpent: number;
  members: number;
}

interface GroupFinanceData {
  currency: string;
  groupBalance: number;
}

const currencySymbols: { [key: string]: string } = {
  PHP: "₱",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
};

// Mock data
const mockGroupBudgets: GroupBudget[] = [
  {
    id: "1",
    groupName: "Family Vacation",
    totalBudget: 50000,
    totalSpent: 25000,
    members: 4
  },
  {
    id: "2",
    groupName: "Roommate Expenses",
    totalBudget: 30000,
    totalSpent: 18000,
    members: 3
  },
  {
    id: "3",
    groupName: "Project Team",
    totalBudget: 20000,
    totalSpent: 5000,
    members: 5
  }
];

const mockGroupFinanceData: GroupFinanceData = {
  currency: "PHP",
  groupBalance: 50000
};

export default function GroupBudget() {
  const [groupBudgets, setGroupBudgets] = useState<GroupBudget[]>(mockGroupBudgets);
  const [groupFinanceData, setGroupFinanceData] = useState<GroupFinanceData>(mockGroupFinanceData);
  const [loading, setLoading] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupBudget, setNewGroupBudget] = useState("");
  const [newMembers, setNewMembers] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
    
  useEffect(() => {
    if (showGroupModal) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [showGroupModal]);

  const handleAddGroupBudget = async () => {
    if (!newGroupName || !newGroupBudget || !newMembers || !groupFinanceData) return;
    
    setModalLoading(true);
    
    // Simulate async operation
    setTimeout(() => {
      const budgetAmount = parseFloat(newGroupBudget);
      const membersCount = parseInt(newMembers);
      
      const newGroupBudgetItem: GroupBudget = {
        id: Math.random().toString(36).substring(7),
        groupName: newGroupName,
        totalBudget: budgetAmount,
        totalSpent: 0,
        members: membersCount
      };
      
      setGroupBudgets([...groupBudgets, newGroupBudgetItem]);
      setGroupFinanceData({
        ...groupFinanceData,
        groupBalance: groupFinanceData.groupBalance - budgetAmount
      });
      
      setNewGroupName("");
      setNewGroupBudget("");
      setNewMembers("");
      setShowGroupModal(false);
      setModalLoading(false);
    }, 800);
  };

  const formatCurrency = (amount: number) => {
    return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const currencySymbol = groupFinanceData?.currency 
    ? currencySymbols[groupFinanceData.currency] || groupFinanceData.currency 
    : "₱";

  const modalStyle = {
    opacity: fadeAnim,
    transform: [{ scale: scaleAnim }],
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
        <Link href="/(tabs)/wallet" asChild>
          <TouchableOpacity className="p-2">
            <ChevronLeft size={24} color="#000000" />
          </TouchableOpacity>
        </Link>
        <Text className="text-lg font-semibold">Group Budgets</Text>
        <View className="w-8" />
      </View>

      {/* Content */}
      <View className="flex-1">
        <ScrollView className="p-4" contentContainerStyle={{ paddingBottom: 20 }}>
          {groupBudgets.length === 0 ? (
            <View className="flex-1 justify-center items-center py-10">
              <Text className="text-gray-600">No group budgets found</Text>
            </View>
          ) : (
            <FlatList
              data={groupBudgets}
              scrollEnabled={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Link href={`/(screens)/group-budget-details?id=${item.id}`} asChild>
                  <TouchableOpacity 
                    className="p-4 py-6 mb-2 bg-[#E0FFC0] rounded-lg"
                  >
                    <View className="flex-row justify-between items-center">
                      <Text className="text-lg font-medium text-[#133C13]">
                        {item.groupName}
                      </Text>
                      <View className="flex-row items-center space-x-2">
                        <View className="flex-row items-center">
                          <Users size={18} color="#133C13" className="mr-1" />
                          <Text className="text-sm text-[#133C13]">
                            {item.members}
                          </Text>
                        </View>
                        <ChevronRight size={23} color="#133C13" />
                      </View>
                    </View>
                  </TouchableOpacity>
                </Link>
              )}
            />
          )}
        </ScrollView>

        {/* Floating Add Button */}
        <TouchableOpacity 
          className="absolute bottom-12 right-8 w-20 h-20 bg-[#133C13] rounded-full justify-center items-center shadow-xl"
          onPress={() => setShowGroupModal(true)}
          disabled={loading}
        >
          <Plus size={29} color="#B2EA71" />
        </TouchableOpacity>

        {/* Add Group Budget Modal */}
        <Modal
          visible={showGroupModal}
          transparent={true}
          animationType="none"
          onRequestClose={() => setShowGroupModal(false)}
        >
          <Animated.View 
            className="absolute inset-0 bg-black/30"
            style={{ opacity: fadeAnim }}
          />
          <View className="flex-1 justify-center items-center">
            <Animated.View 
              className="bg-white rounded-2xl p-6 w-[90%] max-w-md"
              style={modalStyle}
            >
              <View className="flex-row justify-center mb-4">
                <Text className="text-xl font-bold text-[#1A3C34]">
                  Create Group Budget
                </Text>
              </View>
              
              {groupFinanceData && (
                <View className="mb-4 bg-[#F5F5F5] p-4 rounded-lg">
                  <Text className="text-md text-[#1A3C34]">
                    Available Group Funds: {currencySymbol} {formatCurrency(groupFinanceData.groupBalance)}
                  </Text>
                </View>
              )}

              <View className="mb-4">
                <Text className="text-md text-[#1A3C34] mb-2">
                  Group Name
                </Text>
                <TextInput
                  placeholder="e.g. Family Vacation"
                  value={newGroupName}
                  onChangeText={setNewGroupName}
                  className="bg-white rounded-lg px-4 py-3 border border-gray-200"
                />
              </View>

              <View className="mb-4">
                <Text className="text-md text-[#1A3C34] mb-2">
                  Total Budget
                </Text>
                <TextInput
                  placeholder={`e.g. ${currencySymbol}10000`}
                  value={newGroupBudget}
                  onChangeText={setNewGroupBudget}
                  keyboardType="numeric"
                  className="bg-white rounded-lg px-4 py-3 border border-gray-200"
                />
              </View>

              <View className="mb-6">
                <Text className="text-md text-[#1A3C34] mb-2">
                  Number of Members
                </Text>
                <TextInput
                  placeholder="e.g. 4"
                  value={newMembers}
                  onChangeText={setNewMembers}
                  keyboardType="numeric"
                  className="bg-white rounded-lg px-4 py-3 border border-gray-200"
                />
              </View>

              <View className="flex-row justify-between gap-4">
                <TouchableOpacity
                  className="flex-1 bg-gray-100 px-6 py-3 rounded-lg items-center"
                  onPress={() => setShowGroupModal(false)}
                >
                  <Text className="text-[#1A3C34]">
                    Cancel
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  className="flex-1 bg-[#B2EA71] px-6 py-3 rounded-lg items-center"
                  onPress={handleAddGroupBudget}
                  disabled={modalLoading || !newGroupName || !newGroupBudget || !newMembers}
                >
                  {modalLoading ? (
                    <ActivityIndicator color="#133C13" />
                  ) : (
                    <Text className="text-[#133C13] font-medium">
                      Create Group
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>
      </View>
    </View>
  );
}