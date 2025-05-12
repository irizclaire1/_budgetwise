import { Link } from "expo-router";
import { Animated } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Text, View, TouchableOpacity, FlatList, ActivityIndicator, ScrollView, Modal, TextInput } from "react-native";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react-native";
import { Swipeable, RectButton } from 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

interface Budget {
  id: string;
  category: string;
  budget: number;
  totalSpent: number;
  remainingBalance: number;
}

interface FinanceData {
  currency: string;
  monthlyIncome: number;
  remainingBalance: number;
}

const currencySymbols: { [key: string]: string } = {
  PHP: "₱",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
};

const mockBudgets: Budget[] = [
  {
    id: "1",
    category: "Groceries",
    budget: 10000,
    totalSpent: 4500,
    remainingBalance: 5500
  },
  {
    id: "2",
    category: "Transportation",
    budget: 5000,
    totalSpent: 3200,
    remainingBalance: 1800
  },
  {
    id: "3",
    category: "Entertainment",
    budget: 3000,
    totalSpent: 1500,
    remainingBalance: 1500
  }
];

const mockFinanceData: FinanceData = {
  currency: "PHP",
  monthlyIncome: 50000,
  remainingBalance: 25000
};

export default function MyExpenses() {
  const [budgets, setBudgets] = useState<Budget[]>(mockBudgets);
  const [financeData, setFinanceData] = useState<FinanceData>(mockFinanceData);
  const [loading, setLoading] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newBudget, setNewBudget] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
    if (!newCategory || !newBudget || !financeData) return;
    
    setModalLoading(true);
    
    setTimeout(() => {
      const budgetAmount = parseFloat(newBudget);
      const newBudgetItem: Budget = {
        id: Math.random().toString(36).substring(7),
        category: newCategory,
        budget: budgetAmount,
        totalSpent: 0,
        remainingBalance: budgetAmount
      };
      
      setBudgets([...budgets, newBudgetItem]);
      setFinanceData({
        ...financeData,
        remainingBalance: financeData.remainingBalance - budgetAmount
      });
      
      setNewCategory("");
      setNewBudget("");
      setShowBudgetModal(false);
      setModalLoading(false);
    }, 800);
  };

  const handleDeleteBudget = (id: string) => {
    const budgetToDelete = budgets.find(budget => budget.id === id);
    if (budgetToDelete) {
      setBudgets(budgets.filter(budget => budget.id !== id));
      setFinanceData({
        ...financeData,
        remainingBalance: financeData.remainingBalance + budgetToDelete.remainingBalance
      });
    }
  };

  const renderRightActions = (id: string) => (
    <RectButton
      style={{
        backgroundColor: '#FF6363',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: 80,
        borderRadius: 8,
        marginLeft: 8,
      }}
      onPress={() => handleDeleteBudget(id)}
    >
      <Trash2 size={24} color="#FFFFFF" />
    </RectButton>
  );

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

  const currencySymbol = financeData?.currency 
    ? currencySymbols[financeData.currency] || financeData.currency 
    : "₱";

  const modalStyle = {
    opacity: fadeAnim,
    transform: [{ scale: scaleAnim }],
  };
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <Link href="/(tabs)/wallet" asChild>
            <TouchableOpacity className="p-2">
              <ChevronLeft size={24} color="#000000" />
            </TouchableOpacity>
          </Link>
          <Text className="text-lg font-semibold">My Expenses</Text>
          <View className="w-8" />
        </View>

        {/* Content */}
        <View className="flex-1">
          <ScrollView className="p-4" contentContainerStyle={{ paddingBottom: 20 }}>
            {budgets.length === 0 ? (
              <View className="flex-1 justify-center items-center py-10">
                <Text className="text-gray-600">No budget categories found</Text>
              </View>
            ) : (
              <FlatList
                data={budgets}
                scrollEnabled={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Swipeable
                    renderRightActions={() => renderRightActions(item.id)}
                    friction={2}
                    rightThreshold={40}
                  >
                    <Link href={`/(screens)/budget-details?id=${item.id}`} asChild>
                      <TouchableOpacity 
                        className="p-6 py-8 mb-2 bg-[#E0FFC0] rounded-lg"
                      >
                        <View className="flex-row justify-between items-center">
                          <Text className="text-lg font-medium text-[#133C13]">
                            {item.category}
                          </Text>
                          <ChevronRight size={23} color="#133C13" />
                        </View>
                      </TouchableOpacity>
                    </Link>
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
                
                {financeData && (
                  <View className="mb-4 bg-[#F5F5F5] p-4 rounded-lg">
                    <Text className="text-md text-[#1A3C34] mb-1">
                      Monthly Income: {currencySymbol} {formatCurrency(financeData.monthlyIncome)}
                    </Text>
                    <Text className="text-md text-[#1A3C34]">
                      Remaining Balance: {currencySymbol} {formatCurrency(financeData.remainingBalance)}
                    </Text>
                  </View>
                )}

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