import { Link, useLocalSearchParams } from "expo-router";
import { Animated } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Text, View, TouchableOpacity, FlatList, ActivityIndicator, ScrollView, Modal, TextInput } from "react-native";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react-native";
import { RectButton, Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';

interface BudgetCategory {
  id: string;
  category: string;
  budget: number;
  totalSpent: number;
  remainingBalance: number;
}

interface GroupData {
  id: string;
  groupName: string;
  currency: string;
  totalBudget: number;
  totalSpent: number;
  members: string[];
  remainingBalance: number;
}

const currencySymbols: { [key: string]: string } = {
  PHP: "₱",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
};

// Mock group data
const mockGroups: GroupData[] = [
  {
    id: "1",
    groupName: "Family Budget",
    currency: "PHP",
    totalBudget: 50000,
    totalSpent: 25000,
    remainingBalance: 25000,
    members: ["You", "Maria", "John", "Luis"]
  },
  {
    id: "2",
    groupName: "Roommate Expenses",
    currency: "PHP",
    totalBudget: 30000,
    totalSpent: 18000,
    remainingBalance: 12000,
    members: ["You", "Anna", "Mike"]
  },
  {
    id: "3",
    groupName: "Project Team",
    currency: "PHP",
    totalBudget: 20000,
    totalSpent: 5000,
    remainingBalance: 15000,
    members: ["You", "Sarah", "Tom", "Emma", "Liam"]
  }
];

// Mock budget categories
const mockBudgetCategories: BudgetCategory[] = [
  {
    id: "1",
    category: "Groceries",
    budget: 10000,
    totalSpent: 4500,
    remainingBalance: 5500
  },
  {
    id: "2",
    category: "Utilities",
    budget: 8000,
    totalSpent: 3200,
    remainingBalance: 4800
  },
  {
    id: "3",
    category: "Entertainment",
    budget: 3000,
    totalSpent: 1500,
    remainingBalance: 1500
  }
];

const renderRightActions = (
  progress: Animated.AnimatedInterpolation<number>,
  dragX: Animated.AnimatedInterpolation<number>,
  onDelete: () => void
) => {
  const trans = dragX.interpolate({
    inputRange: [0, 50, 100, 101],
    outputRange: [0, 0, 0, 1],
  });

  return (
    <RectButton
      style={{
        backgroundColor: '#ef4444',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: '85%',
        marginTop: 1,
        borderRadius: 10,
        marginLeft: 10,
      }}
      onPress={onDelete}
    >
      <Animated.View
        style={{
          transform: [{ translateX: trans }],
          alignItems: 'center',
        }}
      >
        <Trash2 size={24} color="white" />
      </Animated.View>
    </RectButton>
  );
};

export default function GroupExpenses() {
  const { id } = useLocalSearchParams();
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>(mockBudgetCategories);
  const [groupData, setGroupData] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newBudget, setNewBudget] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Load group data based on id
  useEffect(() => {
    const groupId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : undefined;
    if (groupId) {
      const foundGroup = mockGroups.find(group => group.id === groupId);
      if (foundGroup) {
        setGroupData(foundGroup);
      } else {
        setGroupData(mockGroups[0]);
      }
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (showBudgetModal) {
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
  }, [showBudgetModal]);

  const handleAddBudget = async () => {
    if (!newCategory || !newBudget || !groupData) return;

    setModalLoading(true);

    setTimeout(() => {
      const budgetAmount = parseFloat(newBudget);
      if (isNaN(budgetAmount) || budgetAmount <= 0) {
        setModalLoading(false);
        return;
      }

      const newBudgetItem: BudgetCategory = {
        id: Math.random().toString(36).substring(7),
        category: newCategory,
        budget: budgetAmount,
        totalSpent: 0,
        remainingBalance: budgetAmount
      };

      setBudgetCategories([...budgetCategories, newBudgetItem]);
      setGroupData({
        ...groupData,
        totalBudget: groupData.totalBudget + budgetAmount,
        remainingBalance: groupData.remainingBalance + budgetAmount
      });

      setNewCategory("");
      setNewBudget("");
      setShowBudgetModal(false);
      setModalLoading(false);
    }, 800);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const categoryToDelete = budgetCategories.find(cat => cat.id === categoryId);
    if (categoryToDelete && groupData) {
      setBudgetCategories(budgetCategories.filter(cat => cat.id !== categoryId));
      setGroupData({
        ...groupData,
        totalBudget: groupData.totalBudget - categoryToDelete.budget,
        remainingBalance: groupData.remainingBalance + categoryToDelete.budget
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  };

  if (loading || !groupData) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#133C13" />
      </View>
    );
  }

  const currencySymbol = currencySymbols[groupData.currency] || groupData.currency;

  const modalStyle = {
    opacity: fadeAnim,
    transform: [{ scale: scaleAnim }],
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <Link href={`/(screens)/group-budget-details?id=${id}`} asChild>
            <TouchableOpacity className="p-2">
              <ChevronLeft size={24} color="#000000" />
            </TouchableOpacity>
          </Link>
          <Text className="text-lg font-semibold">{groupData.groupName}</Text>
          <View className="w-8" />
        </View>

        {/* Content */}
        <View className="flex-1 mt-4">
          <ScrollView className="px-4" contentContainerStyle={{ paddingBottom: 20 }}>
            {budgetCategories.length === 0 ? (
              <View className="flex-1 justify-center items-center py-10">
                <Text className="text-gray-600">No budget categories found</Text>
              </View>
            ) : (
              <FlatList
                data={budgetCategories}
                scrollEnabled={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Swipeable
                    key={item.id}
                    renderRightActions={(progress, dragX) => 
                      renderRightActions(progress, dragX, () => handleDeleteCategory(item.id))
                    }
                    friction={2}
                    rightThreshold={40}
                  >
                    <View className="p-4 mb-3 bg-white rounded-lg border border-[#133C13]/10">
                      <View className="flex-row justify-between items-center">
                        <TouchableOpacity className="flex-1">
                          <Text className="text-lg font-medium text-[#133C13]">
                            {item.category}
                          </Text>
                          <View className="flex-row items-center mt-1">
                            <View className="w-2 h-2 rounded-full bg-[#133C13]/30 mr-2"></View>
                            <Text className="text-sm text-gray-600">
                              {currencySymbol}{item.remainingBalance.toLocaleString()} remaining
                            </Text>
                          </View>
                        </TouchableOpacity>
                        
                        <Link href={`/(screens)/group-expense-details?categoryId=${item.id}&groupId=${id}`} asChild>
                          <TouchableOpacity className="p-2 rounded-full bg-[#133C13]/10">
                            <ChevronRight size={20} color="#133C13" />
                          </TouchableOpacity>
                        </Link>
                      </View>
                    </View>
                  </Swipeable>
                )}
              />
            )}
          </ScrollView>

          {/* Floating Add Button */}
          <TouchableOpacity 
            className="absolute bottom-12 right-8 w-20 h-20 bg-[#133C13] rounded-full justify-center items-center shadow-xl"
            onPress={() => setShowBudgetModal(true)}
            disabled={loading}
          >
            <Plus size={29} color="#B2EA71" />
          </TouchableOpacity>

          {/* Add Budget Modal */}
          <Modal
            visible={showBudgetModal}
            transparent={true}
            animationType="none"
            onRequestClose={() => setShowBudgetModal(false)}
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
                    Add New Budget
                  </Text>
                </View>
                
                <View className="mb-4 bg-[#F5F5F5] p-4 rounded-lg">
                  <Text className="text-md text-[#1A3C34] mb-1">
                    Group Budget: {currencySymbol}{formatCurrency(groupData.totalBudget)}
                  </Text>
                  <Text className="text-md text-[#1A3C34]">
                    Remaining Balance: {currencySymbol}{formatCurrency(groupData.remainingBalance)}
                  </Text>
                </View>

                <View className="mb-4">
                  <Text className="text-md text-[#1A3C34] mb-2">
                    Category Name
                  </Text>
                  <TextInput
                    placeholder="e.g. Groceries"
                    value={newCategory}
                    onChangeText={setNewCategory}
                    className="bg-white rounded-lg px-4 py-3 border border-gray-200"
                  />
                </View>

                <View className="mb-6">
                  <Text className="text-md text-[#1A3C34] mb-2">
                    Budget Amount
                  </Text>
                  <TextInput
                    placeholder={`e.g. ${currencySymbol}1000`}
                    value={newBudget}
                    onChangeText={setNewBudget}
                    keyboardType="numeric"
                    className="bg-white rounded-lg px-4 py-3 border border-gray-200"
                  />
                </View>

                <View className="flex-row justify-between gap-4">
                  <TouchableOpacity
                    className="flex-1 bg-gray-100 px-6 py-3 rounded-lg items-center"
                    onPress={() => setShowBudgetModal(false)}
                  >
                    <Text className="text-[#1A3C34]">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    className="flex-1 bg-[#B2EA71] px-6 py-3 rounded-lg items-center"
                    onPress={handleAddBudget}
                    disabled={modalLoading || !newCategory || !newBudget}
                  >
                    {modalLoading ? (
                      <ActivityIndicator color="#133C13" />
                    ) : (
                      <Text className="text-[#133C13]">
                        Add Budget
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          </Modal>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}