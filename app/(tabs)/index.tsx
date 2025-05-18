import { Link, useRouter } from "expo-router";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
  Modal,
} from "react-native";
import { Bell, Bot, ExternalLinkIcon, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import * as Progress from 'react-native-progress';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  email: string | null;
}

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

interface Expense {
  id: string;
  expenseName: string;
  amount: number;
  category: string;
  date: string;
}

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [financeData, setFinanceData] = useState<FinanceData | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  const currencySymbols: { [key: string]: string } = {
    PHP: "₱",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
  };

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const email = await AsyncStorage.getItem('userEmail');
        
        if (token && email) {
          setUser({ email });
          
          // Load mock finance data
          setFinanceData({
            userId: "mock-user-id",
            monthlyIncome: 50000,
            remainingBalance: 32500,
            totalExpenses: 17500,
            currency: "PHP"
          });

          // Load mock budgets
          setBudgets([
            { id: "1", category: "Food", budget: 10000, totalSpent: 7500, remainingBalance: 2500 },
            { id: "2", category: "Transportation", budget: 5000, totalSpent: 3000, remainingBalance: 2000 },
            { id: "3", category: "Entertainment", budget: 3000, totalSpent: 2000, remainingBalance: 1000 },
          ]);

          // Load mock recent expenses
          setRecentExpenses([
            { id: "1", expenseName: "Grocery Shopping", amount: 2500, category: "Food & Dining", date: "2023-06-15" },
            { id: "2", expenseName: "Gasoline", amount: 1500, category: "Transportation", date: "2023-06-14" },
            { id: "3", expenseName: "Movie Tickets", amount: 800, category: "Entertainment", date: "2023-06-13" },
            { id: "4", expenseName: "Dinner Out", amount: 1200, category: "Food & Dining", date: "2023-06-12" },
          ]);

          setLoading(false);
        } else {
          setUser(null);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error checking auth or loading data:", error);
        setUser(null);
        setLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    router.replace("/login");
    return null;
  }

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

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 pt-8 pb-4 bg-[#E7F5E3]">
        <Image
          source={require("../../assets/images/bw-large.png")}
          className="w-20 h-10"
          resizeMode="contain"
        />
        <View className="flex-row items-center gap-6">
          <Link href="/(screens)/notification" asChild>
            <TouchableOpacity>
              <Bell color="#1A3C34" size={24} />
            </TouchableOpacity>
          </Link>
          <Link href="/(screens)/account" asChild>
            <TouchableOpacity>
              <Image
                source={require("../../assets/images/profile.jpg")}
                className="w-10 h-10 rounded-full border border-[#1A3C34]"
              />
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-4 pt-8" showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        {financeData && (
          <View className="bg-[#B2EA71] shadow-md rounded-xl p-6 w-full mb-4 border border-gray-200">
            <Text className="text-lg text-[#133C13] mb-1" style={{ fontFamily: 'Poppins_500Medium' }}>
              Remaining Balance
            </Text>
            <Text className="text-4xl text-[#133C13] mt-5" style={{ fontFamily: 'Poppins_700Bold' }}>
              {currencySymbol} {financeData.remainingBalance.toLocaleString()}
            </Text>
            
            {/* Monthly Spending */}
            <Text className="text-base text-[#133C13] mb-3 mt-4" style={{ fontFamily: 'Poppins_600SemiBold' }}>
              Monthly Spending
            </Text>
            <View style={{ backgroundColor: "#E7F5E3", borderRadius: 5, height: 10, width: "100%", marginBottom: 10 }}>
              <Progress.Bar
                progress={spendingPercentage / 100}
                color="#133C13"
                width={null}
                height={10}
                borderWidth={0}
              />
            </View>
            <Text className={`text-sm ${spendingColor}`} style={{ fontFamily: 'Poppins_500Medium' }}>
              {`You've spent ${Math.round(spendingPercentage)}% of your ${currencySymbol}${financeData.monthlyIncome.toLocaleString()} income`}
            </Text>
          </View>
        )}

        {/* Recent Transactions */}
        <View className="mb-4">
          <Text className="text-base text-[#133C13] mb-2 ml-2" style={{ fontFamily: 'Poppins_500Medium' }}>
            Recent Transactions
          </Text>
          <FlatList
            data={recentExpenses}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setSelectedExpense(item);
                  setModalVisible(true);
                }}
                activeOpacity={0.8}
              >
                <View className="bg-[#ebffd8] p-4 rounded-lg mb-2 shadow-sm">
                  <View className="flex-row justify-between">
                    <Text style={{ fontFamily: 'Poppins_600SemiBold' }}>{item.expenseName}</Text>
                    <Text style={{ fontFamily: 'Poppins_600SemiBold' }}>
                      {currencySymbol}{item.amount.toLocaleString()}
                    </Text>
                  </View>
                  <Text style={{ fontFamily: 'Poppins_400Regular', color: '#666' }}>
                    {item.category}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />

          {/* Financial Coach Card */}
          <View className="bg-[#fcfbfb] shadow-md rounded-xl p-6 w-full mt-5 mb-8 border border-gray-200">
            <View className="flex-row justify-between items-start">
              <View className="flex-row items-center space-x-3">
                <View className="bg-[#133C13] p-3 rounded-full mr-3">
                  <Bot color="white" size={20} />
                </View>
                <Text className="text-md text-[#133C13]" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                  Financial Coach
                </Text>
              </View>
              <TouchableOpacity>
                <ExternalLinkIcon color="#133C13" size={20} />
              </TouchableOpacity>
            </View>
            <Text className="text-sm text-[#133C13] mt-3 ml-4" style={{ fontFamily: 'Poppins_400Regular' }}>
              You've spent ₱400 on dining out this week, which is 40% higher than your weekly average.
              Consider cooking at home this weekend to stay within your monthly budget.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Transaction Details Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center px-4 bg-black/50">
          <View className="w-[90%] min-h-[300px] max-h-[80%] bg-white rounded-xl p-8 shadow-md border border-gray-200">
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="absolute top-4 right-4 p-2"
            >
              <X color="#133C13" size={24} />
            </TouchableOpacity>
            {selectedExpense && (
              <View className="mt-8">
                <Text
                  className="text-xl text-[#133C13] mb-4"
                  style={{ fontFamily: 'Poppins_600SemiBold' }}
                >
                  {selectedExpense.expenseName}
                </Text>
                <View className="mb-4">
                  <Text
                    className="text-sm text-gray-600"
                    style={{ fontFamily: 'Poppins_400Regular' }}
                  >
                    Amount: {currencySymbol}{selectedExpense.amount.toLocaleString()}
                  </Text>
                  <Text
                    className="text-sm text-gray-600"
                    style={{ fontFamily: 'Poppins_400Regular' }}
                  >
                    Category: {selectedExpense.category}
                  </Text>
                  <Text
                    className="text-sm text-gray-600"
                    style={{ fontFamily: 'Poppins_400Regular' }}
                  >
                    Date: {selectedExpense.date}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}