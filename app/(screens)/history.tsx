import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";

interface GroupExpenseCategory {
  id: string;
  category: string;
  budget: number;
  totalSpent: number;
  remainingBalance: number;
  members: string[];
  expenses: {
    id: string;
    description: string;
    amount: number;
    paidBy: string;
    date: string;
    settledMembers?: string[];
  }[];
}

interface PersonalExpense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}

const mockGroupExpenseCategories: GroupExpenseCategory[] = [
  {
    id: "1",
    category: "Groceries",
    budget: 10000,
    totalSpent: 4500,
    remainingBalance: 5500,
    members: ["You", "Maria", "John", "Luis"],
    expenses: [
      {
        id: "exp1",
        description: "Weekly groceries",
        amount: 2500,
        paidBy: "You",
        date: "2023-05-15",
        settledMembers: ["John"],
      },
      {
        id: "exp2",
        description: "Snacks",
        amount: 2000,
        paidBy: "Maria",
        date: "2023-05-12",
      },
      {
        id: "exp3",
        description: "Fruits",
        amount: 2050,
        paidBy: "Maria",
        date: "2023-05-11",
      },
      {
        id: "exp4",
        description: "Drinks",
        amount: 1500,
        paidBy: "John",
        date: "2023-05-10",
      },
    ],
  },
];

const mockPersonalExpenses: PersonalExpense[] = [
  {
    id: "pers1",
    description: "Coffee at Cafe",
    amount: 150,
    date: "2023-05-16",
    category: "Coffee",
  },
  {
    id: "pers2",
    description: "Netflix Subscription",
    amount: 549,
    date: "2023-05-14",
    category: "Subscription",
  },
  {
    id: "pers3",
    description: "Bus Fare",
    amount: 50,
    date: "2023-05-13",
    category: "Transport",
  },
];

const currencySymbols: { [key: string]: string } = {
  PHP: "₱",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
};

export default function History() {
  const router = useRouter();
  const currentUser = "You";
  const currencySymbol = currencySymbols["PHP"] || "₱";
  const [filter, setFilter] = useState<"all" | "group" | "personal" | "youOwe">("all");

  // Filter group expenses where currentUser is a member or payer
  const groupExpenses = mockGroupExpenseCategories
    .flatMap(category =>
      category.expenses
        .filter(
          expense =>
            category.members.includes(currentUser) || expense.paidBy === currentUser
        )
        .map(expense => ({
          ...expense,
          category: category.category,
          source: "group" as const,
        }))
    );

  // Prepare personal expenses
  const personalExpenses = mockPersonalExpenses.map(expense => ({
    ...expense,
    source: "personal" as const,
  }));

  // Combine and sort all expenses by date (newest first)
  const allExpenses = [...groupExpenses, ...personalExpenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Apply filter
  const filteredExpenses = allExpenses.filter(expense => {
    if (filter === "all") return true;
    if (filter === "group") return expense.source === "group";
    if (filter === "personal") return expense.source === "personal";
    if (filter === "youOwe") {
      if (expense.source !== "group") return false;
      const category = mockGroupExpenseCategories.find(cat =>
        cat.expenses.some(exp => exp.id === expense.id)
      );
      const owedStatus = category
        ? calculateOwedAmount(expense, category.members)
        : null;
      return owedStatus?.type === "youOwe";
    }
    return true;
  });

  const calculateOwedAmount = (
    expense: GroupExpenseCategory['expenses'][0],
    members: string[]
  ): 
    | { type: "youOwe"; amount: number }
    | { type: "othersOwe"; amount: number; count: number }
    | { type: "settled" } => {
    if (expense.paidBy === currentUser) {
      const unsettledMembers = members.filter(
        member => member !== currentUser && !expense.settledMembers?.includes(member)
      );
      return {
        type: "othersOwe",
        amount: expense.amount / members.length,
        count: unsettledMembers.length,
      };
    }
    if (!expense.settledMembers?.includes(currentUser)) {
      return {
        type: "youOwe",
        amount: expense.amount / members.length,
      };
    }
    return { type: "settled" };
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-lime-300 pt-12 pb-14 px-5">
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 -ml-2"
          >
            <ArrowLeft size={24} color="#1A3C34" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-green-900" style={{ fontFamily: "Poppins_600SemiBold" }}>
            History
          </Text>
          <View className="w-8" />
        </View>
      </View>

      {/* Expenses List */}
      <View className="flex-1 px-5 pt-3 -mt-14">
        {/* Filter Bar */}
        <View className="flex-row justify-between mb-4">
          {["All", "Group", "Personal", "You owe"].map(option => (
            <TouchableOpacity
              key={option}
              onPress={() => setFilter(option.toLowerCase() as typeof filter)}
              className={`flex-1 mx-1 py-2 rounded-lg ${
                filter === option.toLowerCase() ? "bg-lime-300" : "bg-gray-100"
              }`}
            >
              <Text
                className="text-center text-sm text-[#1A3C34]"
                style={{ fontFamily: "Poppins_500Medium" }}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {filteredExpenses.length > 0 ? (
            filteredExpenses.map((expense) => {
              const isGroupExpense = expense.source === "group";
              const categoryMembers = isGroupExpense
                ? mockGroupExpenseCategories.find(cat =>
                    cat.expenses.some(exp => exp.id === expense.id)
                  )?.members || []
                : [];
              const owedStatus = isGroupExpense
                ? calculateOwedAmount(expense, categoryMembers)
                : null;

              return (
                <TouchableOpacity
                  key={expense.id}
                  className="mb-3 bg-[#F8FAFC] rounded-xl border border-gray-100 shadow-sm"
                  activeOpacity={0.8}
                >
                  <View className="p-4">
                    <View className="flex-row justify-between items-center mb-2">
                      <Text
                        className="text-base text-[#1A3C34] flex-1"
                        style={{ fontFamily: "Poppins_600SemiBold" }}
                      >
                        {expense.description}
                      </Text>
                      <Text
                        className="text-base text-red-500"
                        style={{ fontFamily: "Poppins_600SemiBold" }}
                      >
                        -{currencySymbol}{expense.amount.toLocaleString()}
                      </Text>
                    </View>

                    <View className="flex-row justify-between mb-3">
                      <Text
                        className="text-sm text-gray-500"
                        style={{ fontFamily: "Poppins_400Regular" }}
                      >
                        {expense.date}
                      </Text>
                      {isGroupExpense && (
                        <Text
                          className="text-sm text-gray-500"
                          style={{ fontFamily: "Poppins_400Regular" }}
                        >
                          Paid by: {expense.paidBy}
                        </Text>
                      )}
                    </View>

                    <View className="h-px bg-gray-100 mb-3" />

                    <View className="flex-row justify-between items-center">
                      <View className="flex-row items-center">
                        {isGroupExpense && owedStatus?.type === "youOwe" && (
                          <View className="flex-row items-center bg-white px-3 py-1.5 rounded-lg border border-gray-100">
                            <View className="w-2 h-2 rounded-full bg-red-400/30 mr-2" />
                            <Text
                              className="text-sm text-[#1A3C34]"
                              style={{ fontFamily: "Poppins_500Medium" }}
                            >
                              You owe: {currencySymbol}{owedStatus.amount.toFixed(2)}
                            </Text>
                          </View>
                        )}
                        {isGroupExpense && owedStatus?.type === "othersOwe" && (
                          <View className="flex-row items-center bg-white px-3 py-1.5 rounded-lg border border-gray-100">
                            <View className="w-2 h-2 rounded-full bg-[#B2EA71] mr-2" />
                            <Text
                              className="text-sm text-[#1A3C34]"
                              style={{ fontFamily: "Poppins_500Medium" }}
                            >
                              Others owe: {currencySymbol}{owedStatus.amount.toFixed(2)} (
                              {owedStatus.count} unsettled)
                            </Text>
                          </View>
                        )}
                        {isGroupExpense && owedStatus?.type === "settled" && (
                          <View className="flex-row items-center bg-white px-3 py-1.5 rounded-lg border border-gray-100">
                            <View className="w-2 h-2 rounded-full bg-[#B2EA71] mr-2" />
                            <Text
                              className="text-sm text-[#1A3C34]"
                              style={{ fontFamily: "Poppins_500Medium" }}
                            >
                              Settled
                            </Text>
                          </View>
                        )}
                        {!isGroupExpense && (
                          <View className="flex-row items-center bg-white px-3 py-1.5 rounded-lg border border-gray-100">
                            <View className="w-2 h-2 rounded-full bg-[#B2EA71] mr-2" />
                            <Text
                              className="text-sm text-[#133C13]"
                              style={{ fontFamily: "Poppins_500Medium" }}
                            >
                              {expense.category}
                            </Text>
                          </View>
                        )}
                      </View>
                      {isGroupExpense && (
                        <Text
                          className="text-sm text-gray-500"
                          style={{ fontFamily: "Poppins_400Regular" }}
                        >
                          {expense.category}
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View className="bg-[#F8FAFC] rounded-xl p-5 border border-gray-100 shadow-sm items-center">
              <Text
                className="text-sm text-[#1A3C34]"
                style={{ fontFamily: "Poppins_400Regular" }}
              >
                No expenses found for this filter
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}