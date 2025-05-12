import { Link } from "expo-router";
import { View, Text, TouchableOpacity, Modal, Pressable, TextInput, RefreshControl, ScrollView } from "react-native";
import { ChevronRight, Ellipsis, Bot } from "lucide-react-native";
import * as Progress from 'react-native-progress';
import { Menu, MenuOptions, MenuOption, MenuTrigger, MenuProvider } from 'react-native-popup-menu';
import { useState } from "react";

interface Budget {
  id: string;
  category: string;
  budget: number;
  totalSpent: number;
  remainingBalance: number;
}

interface FinanceData {
  userId: string;
  monthlyIncome: number;
  remainingBalance: number;
  totalExpenses: number;
  currency: string;
}

export default function Wallet() {
  // Mock data
  const [financeData, setFinanceData] = useState<FinanceData>({
    userId: "mock-user",
    monthlyIncome: 50000,
    remainingBalance: 32500,
    totalExpenses: 17500,
    currency: "PHP"
  });

  const [budgets, setBudgets] = useState<Budget[]>([
    { id: "1", category: "Food", budget: 10000, totalSpent: 7500, remainingBalance: 2500 },
    { id: "2", category: "Transportation", budget: 5000, totalSpent: 3000, remainingBalance: 2000 },
    { id: "3", category: "Entertainment", budget: 3000, totalSpent: 2000, remainingBalance: 1000 },
  ]);

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [newIncome, setNewIncome] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const currencySymbols: { [key: string]: string } = {
    PHP: "₱", USD: "$", EUR: "€", GBP: "£", JPY: "¥",
  };

  const currencySymbol = financeData?.currency 
    ? currencySymbols[financeData.currency] || financeData.currency 
    : "₱";

  const totalSpent = budgets.reduce((sum, budget) => sum + budget.totalSpent, 0);
  const spendingPercentage = financeData?.monthlyIncome 
    ? (totalSpent / financeData.monthlyIncome) * 100 
    : 0;

  const spendingColor = spendingPercentage > 100 
    ? 'text-red-600' 
    : spendingPercentage > 80 
      ? 'text-yellow-600' 
      : 'text-[#133C13]';

  const getFinancialAdvice = () => {
    if (spendingPercentage > 100) {
      return {
        title: "Budget Exceeded!",
        message: `You've spent ${currencySymbol}${(totalSpent - financeData.monthlyIncome).toLocaleString()} more than your budget. Consider:\n• Reviewing recent expenses\n• Cutting discretionary spending\n• Adjusting your budget categories`,
        color: "#EF4444"
      };
    } else if (spendingPercentage > 80) {
      return {
        title: "Approaching Limit",
        message: "You're close to your budget limit. Suggestions:\n• Track daily spending\n• Delay non-essential purchases\n• Review your budget allocations",
        color: "#F59E0B"
      };
    } else if (spendingPercentage > 50) {
      return {
        title: "Moderate Spending",
        message: "You've used half your budget. Tips:\n• Compare to previous months\n• Identify spending patterns\n• Celebrate staying on track!",
        color: "#133C13"
      };
    } else {
      return {
        title: "Good Progress",
        message: "You're managing finances well. Recommendations:\n• Continue tracking expenses\n• Consider increasing savings\n• Review budget for optimization",
        color: "#133C13"
      };
    }
  };

  const financialAdvice = getFinancialAdvice();

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setFinanceData({
        userId: "mock-user",
        monthlyIncome: 50000,
        remainingBalance: 32500,
        totalExpenses: 17500,
        currency: "PHP"
      });
      setBudgets([
        { id: "1", category: "Food", budget: 10000, totalSpent: 7500, remainingBalance: 2500 },
        { id: "2", category: "Transportation", budget: 5000, totalSpent: 3000, remainingBalance: 2000 },
        { id: "3", category: "Entertainment", budget: 3000, totalSpent: 2000, remainingBalance: 1000 },
      ]);
      setRefreshing(false);
    }, 1000);
  };

  const handleAddMonthlyIncome = () => {
    const incomeValue = parseFloat(newIncome) || 0;
    if (incomeValue > 0) {
      setFinanceData(prev => ({
        ...prev,
        monthlyIncome: prev.monthlyIncome + incomeValue,
        remainingBalance: prev.remainingBalance + incomeValue
      }));
      setNewIncome("");
      setAddModalVisible(false);
    }
  };

  const handleEditMonthlyIncome = () => {
    const incomeValue = parseFloat(newIncome) || 0;
    setFinanceData(prev => ({
      ...prev,
      monthlyIncome: incomeValue,
      remainingBalance: incomeValue - prev.totalExpenses
    }));
    setNewIncome("");
    setEditModalVisible(false);
  };

  const handleDeleteMonthlyIncome = () => {
    setFinanceData(prev => ({
      ...prev,
      monthlyIncome: 0,
      remainingBalance: -prev.totalExpenses
    }));
    setDeleteModalVisible(false);
  };

  return (
    <MenuProvider style={{ flex: 1 }}>
      <View className="flex-1 bg-white">
        {/* Fixed Header */}
        <View className="pt-10 pb-4 px-4 bg-white border-b border-gray-100">
          <Text className="text-2xl text-center text-[#1A3C34]" style={{ fontFamily: 'Poppins_600SemiBold' }}>
            Wallet Overview
          </Text>
        </View>

        {/* Scrollable Content with Refresh */}
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#133C13']}
              tintColor='#133C13'
            />
          }
        >
          <View className="px-4 pt-4">
            {/* Balance Card */}
            {financeData && (
              <View className="bg-[#B2EA71] shadow-md rounded-xl p-6 w-full mb-4 border border-gray-200">
                {/* Balance Section */}
                <View className="flex-row justify-between items-start mb-6">
                  <View>
                    <Text className="text-lg text-[#133C13] mb-1" style={{ fontFamily: 'Poppins_500Medium' }}>
                      Remaining Balance
                    </Text>
                    <Text className="text-4xl text-[#133C13] mt-4" style={{ fontFamily: 'Poppins_700Bold' }}>
                      {currencySymbol} {financeData.remainingBalance.toLocaleString()}
                    </Text>
                  </View>
                  
                  <Menu>
                    <MenuTrigger customStyles={{
                      triggerWrapper: {
                        padding: 2,
                      },
                    }}>
                      <Ellipsis size={25} color="#133C13" />
                    </MenuTrigger>
                    <MenuOptions customStyles={{
                      optionsContainer: {
                        marginTop: 30,
                        marginLeft: -20,
                        width: 150,
                        borderRadius: 8,
                        backgroundColor: 'white',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 5,
                      },
                    }}>
                      <MenuOption onSelect={() => setAddModalVisible(true)}>
                        <View className="p-3">
                          <Text className="text-[#133C13]" style={{ fontFamily: 'Poppins_500Medium' }}>Add Income</Text>
                        </View>
                      </MenuOption>
                      <View className="h-px bg-gray-200 mx-2" />
                      <MenuOption onSelect={() => setEditModalVisible(true)}>
                        <View className="p-3">
                          <Text className="text-[#133C13]" style={{ fontFamily: 'Poppins_500Medium' }}>Edit Income</Text>
                        </View>
                      </MenuOption>
                      <View className="h-px bg-gray-200 mx-2" />
                      <MenuOption onSelect={() => setDeleteModalVisible(true)}>
                        <View className="p-3">
                          <Text className="text-red-600" style={{ fontFamily: 'Poppins_500Medium' }}>Delete Income</Text>
                        </View>
                      </MenuOption>
                    </MenuOptions>
                  </Menu>
                </View>

                {/* Monthly Spending Progress */}
                <View>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-base text-[#133C13]" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                      Monthly Spending
                    </Text>
                    <Text className={`text-sm ${spendingColor}`} style={{ fontFamily: 'Poppins_500Medium' }}>
                      {Math.round(spendingPercentage)}%
                    </Text>
                  </View>
                  
                  <View className="bg-[#E7F5E3] rounded h-2.5 w-full mb-2">
                    <Progress.Bar
                      progress={spendingPercentage / 100}
                      color={spendingPercentage > 100 ? '#EF4444' : '#133C13'}
                      width={null}
                      height={10}
                      borderWidth={0}
                    />
                  </View>
                  
                  <Text className={`text-sm ${spendingColor}`} style={{ fontFamily: 'Poppins_500Medium' }}>
                    {financeData.monthlyIncome > 0 ? (
                      `Spent ${currencySymbol}${totalSpent.toLocaleString()} of ${currencySymbol}${financeData.monthlyIncome.toLocaleString()}`
                    ) : (
                      "Set monthly income in settings"
                    )}
                  </Text>

                  <View className="border-t border-white my-4 mt-8"></View>

                  <View className="flex-row justify-between mb-3 mt-2">
                    <View className="bg-[#E0FFC0] p-4 rounded-lg flex-1 mr-2 shadow-sm">
                      <Text className="text-sm text-[#133C13] mb-1" style={{ fontFamily: 'Poppins_500Medium' }}>
                        Monthly Income
                      </Text>
                      <Text className="text-xl text-[#133C13]" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                        {currencySymbol} {financeData.monthlyIncome.toLocaleString()}
                      </Text>
                    </View>
                    
                    <View className="bg-[#E0FFC0] p-4 rounded-lg flex-1 ml-2 shadow-sm">
                      <Text className="text-sm text-[#133C13] mb-1" style={{ fontFamily: 'Poppins_500Medium' }}>
                        Total Expenses
                      </Text>
                      <Text className="text-xl text-[#133C13]" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                        {currencySymbol} {financeData.totalExpenses.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            <Link href="/(screens)/my-expenses" asChild>
              <TouchableOpacity className="bg-[#E7F5E3] p-4 py-6 rounded-2xl mb-2 mt-4 flex-row justify-between items-center shadow-sm">
                <Text className="text-[#1A3C34] text-md" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                  My Expenses
                </Text>
                <ChevronRight size={23} color="#1A3C34" />
              </TouchableOpacity>
            </Link>

            <Link href="/(screens)/group-budget" asChild>
              <TouchableOpacity className="bg-[#E7F5E3] p-4 py-6 rounded-2xl mb-4 mt-4 flex-row justify-between items-center shadow-sm">
                <Text className="text-[#1A3C34] text-md" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                  Group Budget
                </Text>
                <ChevronRight size={23} color="#1A3C34" />
              </TouchableOpacity>
            </Link>

            {/* Financial Coach Card */}
            <View className="bg-[#fcfbfb] rounded-xl p-5 border border-gray-200 mb-4">
              <View className="flex-row items-start">
                <View className="bg-[#133C13] p-2.5 rounded-full mr-3">
                  <Bot color="white" size={18} />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Text 
                      className="text-base mr-2" 
                      style={{ 
                        fontFamily: 'Poppins_600SemiBold',
                        color: financialAdvice.color 
                      }}
                    >
                      {financialAdvice.title}
                    </Text>
                    <Text className="text-sm text-gray-500" style={{ fontFamily: 'Poppins_400Regular' }}>
                      {Math.round(spendingPercentage)}% of budget
                    </Text>
                  </View>
                  <Text 
                    className="text-sm" 
                    style={{ 
                      fontFamily: 'Poppins_400Regular',
                      color: '#133C13',
                      lineHeight: 20
                    }}
                  >
                    {financialAdvice.message}
                  </Text>
                  
                  {spendingPercentage < 50 && (
                    <View className="mt-3 bg-[#E7F5E3] p-3 rounded-lg">
                      <Text className="text-xs text-[#133C13]" style={{ fontFamily: 'Poppins_500Medium' }}>
                        💡 Pro Tip: With {Math.round(100 - spendingPercentage)}% remaining, you could consider increasing your savings or investments!
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Add Monthly Income Modal */}
        <Modal
          transparent={true}
          visible={addModalVisible}
          onRequestClose={() => setAddModalVisible(false)}
        >
          <Pressable 
            className="flex-1 justify-center items-center bg-black/50" 
            onPress={() => setAddModalVisible(false)}
          >
            <Pressable className="w-80 bg-white rounded-lg p-6">
              <Text className="text-xl font-bold text-[#133C13] mb-4" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                Add Additional Income
              </Text>
              
              <TextInput
                className="border border-gray-300 rounded-lg p-3 mb-4"
                placeholder={`Enter amount to add (${currencySymbol})`}
                keyboardType="numeric"
                value={newIncome}
                onChangeText={setNewIncome}
              />
              
              <View className="flex-row justify-end space-x-3">
                <Pressable 
                  className="px-4 py-2 rounded-lg"
                  onPress={() => setAddModalVisible(false)}
                >
                  <Text className="text-[#133C13]" style={{ fontFamily: 'Poppins_500Medium' }}>Cancel</Text>
                </Pressable>
                <Pressable 
                  className="bg-[#B2EA71] px-4 py-2 rounded-lg"
                  onPress={handleAddMonthlyIncome}
                >
                  <Text className="text-[#133C13]" style={{ fontFamily: 'Poppins_600SemiBold' }}>Add</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Edit Monthly Income Modal */}
        <Modal
          transparent={true}
          visible={editModalVisible}
          onRequestClose={() => setEditModalVisible(false)}
        >
          <Pressable 
            className="flex-1 justify-center items-center bg-black/50" 
            onPress={() => setEditModalVisible(false)}
          >
            <Pressable className="w-80 bg-white rounded-lg p-6">
              <Text className="text-xl font-bold text-[#133C13] mb-4" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                Edit Monthly Income
              </Text>
              
              <TextInput
                className="border border-gray-300 rounded-lg p-3 mb-4"
                placeholder={`Current: ${currencySymbol}${financeData.monthlyIncome.toLocaleString()}`}
                keyboardType="numeric"
                value={newIncome}
                onChangeText={setNewIncome}
              />
              
              <View className="flex-row justify-end space-x-3">
                <Pressable 
                  className="px-4 py-2 rounded-lg"
                  onPress={() => setEditModalVisible(false)}
                >
                  <Text className="text-[#133C13]" style={{ fontFamily: 'Poppins_500Medium' }}>Cancel</Text>
                </Pressable>
                <Pressable 
                  className="bg-[#B2EA71] px-4 py-2 rounded-lg"
                  onPress={handleEditMonthlyIncome}
                >
                  <Text className="text-[#133C13]" style={{ fontFamily: 'Poppins_600SemiBold' }}>Save</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          transparent={true}
          visible={deleteModalVisible}
          onRequestClose={() => setDeleteModalVisible(false)}
        >
          <Pressable 
            className="flex-1 justify-center items-center bg-black/50" 
            onPress={() => setDeleteModalVisible(false)}
          >
            <Pressable className="w-80 bg-white rounded-lg p-6">
              <Text className="text-xl font-bold text-[#133C13] mb-4" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                Delete Monthly Income?
              </Text>
              
              <Text className="text-gray-700 mb-6" style={{ fontFamily: 'Poppins_400Regular' }}>
                This will reset your monthly income to zero. Are you sure you want to continue?
              </Text>
              
              <View className="flex-row justify-end space-x-3">
                <Pressable 
                  className="px-4 py-2 rounded-lg"
                  onPress={() => setDeleteModalVisible(false)}
                >
                  <Text className="text-gray-600" style={{ fontFamily: 'Poppins_500Medium' }}>Cancel</Text>
                </Pressable>
                <Pressable 
                  className="bg-red-500 px-4 py-2 rounded-lg"
                  onPress={handleDeleteMonthlyIncome}
                >
                  <Text className="text-white" style={{ fontFamily: 'Poppins_600SemiBold' }}>Delete</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </MenuProvider>
  );
}