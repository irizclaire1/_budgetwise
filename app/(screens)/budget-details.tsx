import { Text, View, ActivityIndicator, FlatList, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import * as Progress from "react-native-progress";
import { ArrowLeft, MoreVertical } from "lucide-react-native";

interface Budget {
  id: string;
  category: string;
  budget: number;
  totalSpent: number;
  remainingBalance: number;
  transactions: { id: string; name: string; amount: number }[];
}

const mockBudgets: Budget[] = [
  {
    id: "1",
    category: "Food & Dining",
    budget: 2000,
    totalSpent: 677,
    remainingBalance: 1323,
    transactions: [
      { id: "t1", name: "Burger King", amount: 399 },
      { id: "t2", name: "Jollibee", amount: 78 },
      { id: "t3", name: "Starbucks", amount: 200 },
    ],
  },
  {
    id: "2",
    category: "Groceries",
    budget: 1000,
    totalSpent: 450,
    remainingBalance: 550,
    transactions: [],
  },
];

export default function BudgetDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof id === "string") {
        const foundBudget = mockBudgets.find((b) => b.id === id);
        setBudget(foundBudget || null);
      }
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#133C13" />
      </View>
    );
  }

  if (!budget) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg text-gray-600" style={{ fontFamily: 'Poppins_500Medium' }}>
          Budget not found
        </Text>
      </View>
    );
  }

  const percentageUsed = (budget.totalSpent / budget.budget) * 100;
  const progressColor = percentageUsed > 80 ? '#EF4444' : percentageUsed > 50 ? '#F59E0B' : '#133C13';

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center pt-10 pb-4 px-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <ArrowLeft size={24} color="#133C13" />
        </TouchableOpacity>
        <Text className="text-xl text-[#133C13]" style={{ fontFamily: 'Poppins_600SemiBold' }}>
          {budget.category}
        </Text>
        <TouchableOpacity className="p-2">
          <MoreVertical size={24} color="#133C13" />
        </TouchableOpacity>
      </View>

      {/* Budget Overview Card */}
      <View className="px-4 pt-4">
        <View className="bg-[#B2EA71] shadow-md rounded-xl p-6 mb-4 border border-gray-200">
          <Text className="text-lg text-[#133C13] mb-1" style={{ fontFamily: 'Poppins_500Medium' }}>
            Remaining Balance
          </Text>
          <Text className="text-4xl text-[#133C13] mb-6" style={{ fontFamily: 'Poppins_700Bold' }}>
            ₱{budget.remainingBalance.toLocaleString()}
          </Text>

          <View className="mb-6">
            <View className="flex-row justify-between mb-1">
              <Text className="text-base text-[#133C13]" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                Budget Usage
              </Text>
              <Text className={`text-sm ${percentageUsed > 80 ? 'text-red-600' : percentageUsed > 50 ? 'text-yellow-600' : 'text-[#133C13]'}`} style={{ fontFamily: 'Poppins_500Medium' }}>
                {percentageUsed.toFixed(0)}%
              </Text>
            </View>
            <View className="bg-[#E7F5E3] rounded h-2.5 w-full mb-2">
              <Progress.Bar
                progress={budget.totalSpent / budget.budget}
                color={progressColor}
                width={null}
                height={10}
                borderWidth={0}
              />
            </View>
            <Text className={`text-sm ${percentageUsed > 80 ? 'text-red-600' : percentageUsed > 50 ? 'text-yellow-600' : 'text-[#133C13]'}`} style={{ fontFamily: 'Poppins_500Medium' }}>
              ₱{budget.totalSpent.toLocaleString()} of ₱{budget.budget.toLocaleString()}
            </Text>
          </View>

          <View className="flex-row justify-between">
            <View className="bg-[#E0FFC0] p-4 rounded-lg flex-1 mr-2 shadow-sm">
              <Text className="text-sm text-[#133C13] mb-1" style={{ fontFamily: 'Poppins_500Medium' }}>
                Budget
              </Text>
              <Text className="text-xl text-[#133C13]" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                ₱{budget.budget.toLocaleString()}
              </Text>
            </View>
            <View className="bg-[#E0FFC0] p-4 rounded-lg flex-1 ml-2 shadow-sm">
              <Text className="text-sm text-[#133C13] mb-1" style={{ fontFamily: 'Poppins_500Medium' }}>
                Total Spent
              </Text>
              <Text className="text-xl text-red-600" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                -₱{budget.totalSpent.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Transactions Section */}
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg text-[#133C13]" style={{ fontFamily: 'Poppins_600SemiBold' }}>
            Recent Transactions
          </Text>
          {budget.transactions.length > 0 && (
            <TouchableOpacity>
              <Text className="text-sm text-[#133C13]" style={{ fontFamily: 'Poppins_500Medium' }}>
                See All
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {budget.transactions.length > 0 ? (
          <FlatList
            data={budget.transactions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className="bg-[#E7F5E3] rounded-xl p-4 mb-2 flex-row items-center shadow-sm">
                <View className="w-10 h-10 rounded-full bg-[#B2EA71] justify-center items-center mr-3">
                  <Text className="text-base text-[#133C13]" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                    {item.name.charAt(0)}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base text-[#133C13]" style={{ fontFamily: 'Poppins_500Medium' }}>
                    {item.name}
                  </Text>
                  <Text className="text-sm text-gray-600" style={{ fontFamily: 'Poppins_400Regular' }}>
                    {budget.category}
                  </Text>
                </View>
                <Text className="text-base text-red-600" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                  -₱{item.amount.toLocaleString()}
                </Text>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <View className="bg-[#E7F5E3] rounded-xl p-8 items-center justify-center">
            <Text className="text-base text-[#133C13] mb-1" style={{ fontFamily: 'Poppins_500Medium' }}>
              No transactions yet
            </Text>
            <Text className="text-sm text-gray-600" style={{ fontFamily: 'Poppins_400Regular' }}>
              Your transactions will appear here
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}