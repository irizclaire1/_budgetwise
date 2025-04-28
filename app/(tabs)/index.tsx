import { Link, Redirect } from "expo-router";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView
} from "react-native";
import { Bell } from "lucide-react-native";
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
  const [profileImage, setProfileImage] = useState("https://via.placeholder.com/150");
  const [financeData, setFinanceData] = useState<FinanceData | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);

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
        const [token, email] = await Promise.all([
          AsyncStorage.getItem('userToken'),
          AsyncStorage.getItem('userEmail')
        ]);

        if (!token) {
          setLoading(false);
          return;
        }

        setUser({ email });
        
        // Load mock finance data
        setFinanceData({
          userId: "mock-user-id",
          monthlyIncome: 50000,
          remainingBalance: 25000,
          totalExpenses: 25000,
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
          { id: "1", expenseName: "Grocery Shopping", amount: 2500, category: "Food", date: "2023-06-15" },
          { id: "2", expenseName: "Gasoline", amount: 1500, category: "Transportation", date: "2023-06-14" },
          { id: "3", expenseName: "Movie Tickets", amount: 800, category: "Entertainment", date: "2023-06-13" },
          { id: "4", expenseName: "Dinner Out", amount: 1200, category: "Food", date: "2023-06-12" },
        ]);

        setLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
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
    return <Redirect href="/login" />;
  }

  const currencySymbol = financeData?.currency 
    ? currencySymbols[financeData.currency] || financeData.currency 
    : "₱";

  const totalSpent = budgets.reduce((sum, budget) => sum + budget.totalSpent, 0);
  const spendingPercentage = financeData?.monthlyIncome 
    ? (totalSpent / financeData.monthlyIncome) * 100 
    : 0;

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.budget, 0);
  const budgetUsagePercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

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
          <TouchableOpacity>
            <Bell color="#1A3C34" size={24} />
          </TouchableOpacity>
          <Link href="/(screens)/account" asChild>
            <TouchableOpacity>
              <Image
                source={{ uri: profileImage }}
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
            
            {/* Monthly Income Spending */}
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
              {financeData.monthlyIncome > 0 ? (
                `You've spent ${Math.round(spendingPercentage)}% of your ${currencySymbol}${financeData.monthlyIncome.toLocaleString()} income`
              ) : (
                "Set your monthly income in settings"
              )}
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
              <View className="bg-[#E0FFC0] p-4 rounded-lg mb-2 shadow-sm">
                <View className="flex-row justify-between">
                  <Text style={{ fontFamily: 'Poppins_600SemiBold' }}>{item.expenseName}</Text>
                  <Text style={{ fontFamily: 'Poppins_600SemiBold' }}>
                    {currencySymbol}{item.amount.toLocaleString()}
                  </Text>
                </View>
                <Text style={{ fontFamily: 'Poppins_400Regular', color: '#666' }}>
                  {item.category} • {new Date(item.date).toLocaleDateString()}
                </Text>
              </View>
            )}
          />
        </View>
      </ScrollView>
    </View>
  );
}