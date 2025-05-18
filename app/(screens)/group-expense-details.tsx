import { Text, View, ActivityIndicator, TouchableOpacity, ScrollView, Modal, Pressable, Animated, Alert, TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState, useRef } from "react";
import * as Progress from "react-native-progress";
import { ArrowLeft, Users, X, Check, User, Trash2, Square, MoreHorizontal, PenSquare } from "lucide-react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Animated as AnimatedRN } from "react-native";
import { Menu, MenuOptions, MenuOption, MenuTrigger, MenuProvider } from 'react-native-popup-menu';

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

interface GroupData {
  id: string;
  groupName: string;
  totalBudget: number;
  totalSpent: number;
  members: number;
  currency: string;
}

const mockGroups: GroupData[] = [
  {
    id: "1",
    groupName: "Family Budget",
    totalBudget: 50000,
    totalSpent: 25000,
    members: 4,
    currency: "PHP"
  },
  {
    id: "2",
    groupName: "Roommate Expenses",
    totalBudget: 30000,
    totalSpent: 18000,
    members: 3,
    currency: "PHP"
  },
  {
    id: "3",
    groupName: "Project Team",
    totalBudget: 20000,
    totalSpent: 5000,
    members: 5,
    currency: "PHP"
  }
];

const currencySymbols: { [key: string]: string } = {
  PHP: "₱",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
};

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
        settledMembers: ["John"]
      },
      {
        id: "exp2",
        description: "Snacks",
        amount: 2000,
        paidBy: "Maria",
        date: "2023-05-12"
      },
      {
        id: "exp3",
        description: "Fruits",
        amount: 2050,
        paidBy: "Maria",
        date: "2023-05-11"
      },
      {
        id: "exp4",
        description: "Drinks",
        amount: 1500,
        paidBy: "John",
        date: "2023-05-10"
      }
    ]
  }
];

export default function GroupExpenseDetails() {
  const { categoryId, groupId } = useLocalSearchParams();
  const router = useRouter();
  const [category, setCategory] = useState<GroupExpenseCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState<GroupExpenseCategory['expenses'][0] | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [bulkDeleteModalVisible, setBulkDeleteModalVisible] = useState(false);
  const [selectedExpensesForDeletion, setSelectedExpensesForDeletion] = useState<string[]>([]);
  const [addBudgetModalVisible, setAddBudgetModalVisible] = useState(false);
  const [editBudgetModalVisible, setEditBudgetModalVisible] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  const currentUser = "You";

  // Ensure groupId is a string
  const groupIdStr = typeof groupId === 'string' ? groupId : Array.isArray(groupId) ? groupId[0] : undefined;
  const groupData = groupIdStr ? mockGroups.find(group => group.id === groupIdStr) : null;
  const [editExpenseModalVisible, setEditExpenseModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<GroupExpenseCategory['expenses'][0] | null>(null);

  // Handle case where group is not found
  useEffect(() => {
    if (!groupIdStr || !groupData) {
      Alert.alert("Error", "Group not found. Returning to previous screen.");
      router.back();
    }
  }, [groupIdStr, groupData, router]);

  const currencySymbol = groupData ? currencySymbols[groupData.currency] || groupData.currency : '₱';

  const scaleValue = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof categoryId === "string") {
        const foundCategory = mockGroupExpenseCategories.find(
          c => c.id === categoryId
        );
        setCategory(foundCategory || null);
      }
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [categoryId]);

  useEffect(() => {
    if (modalVisible || bulkDeleteModalVisible || addBudgetModalVisible || editBudgetModalVisible || editExpenseModalVisible) {
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      scaleValue.setValue(0.95);
    }
  }, [modalVisible, bulkDeleteModalVisible, addBudgetModalVisible, editBudgetModalVisible, editExpenseModalVisible]);

  const calculateOwedAmount = (expense: { paidBy: string, amount: number }) => {
    if (expense.paidBy === currentUser) return null;
    const splitCount = category?.members.length || 1;
    return expense.amount / splitCount;
  };

  const handleExpensePress = (expense: GroupExpenseCategory['expenses'][0]) => {
    setSelectedExpense(expense);
    setModalVisible(true);
  };

  const handleSettleExpense = () => {
    Alert.alert(
      "Confirm Payment",
      "Are you sure you want to mark this expense as paid for yourself?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            if (category && selectedExpense) {
              const updatedExpenses = category.expenses.map(exp =>
                exp.id === selectedExpense.id
                  ? {
                      ...exp,
                      settledMembers: exp.settledMembers
                        ? [...exp.settledMembers, currentUser]
                        : [currentUser]
                    }
                  : exp
              );
              setCategory({ ...category, expenses: updatedExpenses });
              setModalVisible(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const openEditExpenseModal = (expense: GroupExpenseCategory['expenses'][0]) => {
    setEditingExpense({ ...expense, settledMembers: expense.settledMembers || [] });
    setEditExpenseModalVisible(true);
  };

  const toggleSettledMember = (member: string) => {
    if (editingExpense && editingExpense.paidBy === currentUser) {
      const updatedSettledMembers = editingExpense.settledMembers?.includes(member)
        ? editingExpense.settledMembers.filter(m => m !== member)
        : [...(editingExpense.settledMembers || []), member];
      setEditingExpense({ ...editingExpense, settledMembers: updatedSettledMembers });
    }
  };

  const saveExpenseChanges = () => {
    if (category && editingExpense) {
      // Validate inputs
      if (!editingExpense.description.trim()) {
        Alert.alert("Invalid Input", "Expense name cannot be empty.");
        return;
      }
      if (editingExpense.amount <= 0) {
        Alert.alert("Invalid Input", "Amount must be greater than 0.");
        return;
      }
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(editingExpense.date)) {
        Alert.alert("Invalid Input", "Date must be in YYYY-MM-DD format.");
        return;
      }

      const originalExpense = category.expenses.find(exp => exp.id === editingExpense.id);
      const amountDiff = originalExpense ? (editingExpense.amount - originalExpense.amount) : 0;
      
      setCategory({
        ...category,
        totalSpent: category.totalSpent + amountDiff,
        remainingBalance: category.remainingBalance - amountDiff,
        expenses: category.expenses.map(exp => 
          exp.id === editingExpense.id ? { ...editingExpense } : exp
        )
      });
      setEditExpenseModalVisible(false);
      setEditingExpense(null);
    }
  };

  const handleDeleteExpense = (expenseId: string) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this expense?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            if (category) {
              const deletedExpense = category.expenses.find(exp => exp.id === expenseId);
              const updatedExpenses = category.expenses.filter(exp => exp.id !== expenseId);
              const newTotalSpent = updatedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
              setCategory({
                ...category,
                expenses: updatedExpenses,
                totalSpent: newTotalSpent,
                remainingBalance: category.budget - newTotalSpent
              });
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleBulkDelete = () => {
    if (selectedExpensesForDeletion.length === 0) {
      Alert.alert("No Expenses Selected", "Please select at least one expense to delete.");
      return;
    }

    Alert.alert(
      "Confirm Bulk Deletion",
      `Are you sure you want to delete ${selectedExpensesForDeletion.length} expense(s)?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            if (category) {
              const updatedExpenses = category.expenses.filter(exp => !selectedExpensesForDeletion.includes(exp.id));
              const newTotalSpent = updatedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
              setCategory({
                ...category,
                expenses: updatedExpenses,
                totalSpent: newTotalSpent,
                remainingBalance: category.budget - newTotalSpent
              });
              setBulkDeleteModalVisible(false);
              setSelectedExpensesForDeletion([]);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const toggleExpenseSelection = (expenseId: string) => {
    setSelectedExpensesForDeletion(prev =>
      prev.includes(expenseId)
        ? prev.filter(id => id !== expenseId)
        : [...prev, expenseId]
    );
  };

  const handleAddBudget = () => {
    setBudgetInput('');
    setAddBudgetModalVisible(true);
  };

  const handleEditBudget = () => {
    setBudgetInput(category?.budget.toString() || '');
    setEditBudgetModalVisible(true);
  };

  const confirmAddBudget = () => {
    const additionalBudget = parseFloat(budgetInput);
    if (category && !isNaN(additionalBudget) && additionalBudget > 0) {
      setCategory({
        ...category,
        budget: category.budget + additionalBudget,
        remainingBalance: category.remainingBalance + additionalBudget
      });
      setAddBudgetModalVisible(false);
    } else {
      Alert.alert("Invalid Input", "Please enter a valid positive number.");
    }
  };

  const confirmEditBudget = () => {
    const newBudget = parseFloat(budgetInput);
    if (category && !isNaN(newBudget) && newBudget >= 0) {
      setCategory({
        ...category,
        budget: newBudget,
        remainingBalance: newBudget - category.totalSpent
      });
      setEditBudgetModalVisible(false);
    } else {
      Alert.alert("Invalid Input", "Please enter a valid number.");
    }
  };

  const handleDeleteBudget = () => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this budget category?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            router.back();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const getSettledCount = (expense: GroupExpenseCategory['expenses'][0]) => {
    return expense.settledMembers?.length || 0;
  };

  const renderRightActions = (
    progress: AnimatedRN.AnimatedInterpolation<number>,
    dragX: AnimatedRN.AnimatedInterpolation<number>,
    expenseId: string
  ) => {
    const trans = dragX.interpolate({
      inputRange: [-60, 0],
      outputRange: [0, 60],
      extrapolate: 'clamp',
    });

    const opacity = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View 
        style={{
          transform: [{ translateX: trans }],
          backgroundColor: '#FEE2E2',
          justifyContent: 'center',
          alignItems: 'center',
          width: 60,
          borderTopLeftRadius: 12,
          borderBottomLeftRadius: 12,
          marginLeft: 10,
          marginBottom: 10,
        }}
      >
        <Animated.View style={{ opacity }}>
          <TouchableOpacity
            onPress={() => handleDeleteExpense(expenseId)}
            className="p-4"
          >
            <Trash2 size={20} color="#EF4444" />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#133C13" />
      </View>
    );
  }

  if (!category) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg text-gray-600" style={{ fontFamily: 'Poppins_500Medium' }}>
          Expense category not found
        </Text>
      </View>
    );
  }

  if (!groupData) {
    return null; // Handled by useEffect
  }

  const percentageUsed = (category.totalSpent / category.budget) * 100;
  const progressColor = percentageUsed > 80 ? '#EF4444' : percentageUsed > 50 ? '#F59E0B' : '#133C13';

  return (
    <MenuProvider>
      <GestureHandlerRootView className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between pt-12 pb-3 px-5 bg-white border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft size={24} color="#1A3C34" />
          </TouchableOpacity>
          <Text className="text-2xl text-[#1A3C34]" style={{ fontFamily: 'Poppins_600SemiBold' }}>
            {groupData.groupName}
          </Text>
          <Menu>
            <MenuTrigger customStyles={{
              triggerWrapper: {
                padding: 8,
              },
            }}>
              <MoreHorizontal size={24} color="#1A3C34" />
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
              <MenuOption onSelect={handleAddBudget}>
                <View className="p-3">
                  <Text className="text-[#1A3C34]" style={{ fontFamily: 'Poppins_500Medium' }}>Add Budget</Text>
                </View>
              </MenuOption>
              <View className="h-px bg-gray-200 mx-2" />
              <MenuOption onSelect={handleEditBudget}>
                <View className="p-3">
                  <Text className="text-[#1A3C34]" style={{ fontFamily: 'Poppins_500Medium' }}>Edit Budget</Text>
                </View>
              </MenuOption>
              <View className="h-px bg-gray-200 mx-2" />
              <MenuOption onSelect={handleDeleteBudget}>
                <View className="p-3">
                  <Text className="text-red-600" style={{ fontFamily: 'Poppins_500Medium' }}>Delete Budget</Text>
                </View>
              </MenuOption>
            </MenuOptions>
          </Menu>
        </View>

        {/* Main Content */}
        <View className="flex-1 px-5 pt-5">
          {/* Group Summary Card */}
          <View className="bg-[#B2EA71] rounded-xl p-5 mb-6 border border-gray-200 shadow-sm">
            <View className="flex-row justify-between items-start mb-4">
              <View>
                <Text className="text-base text-[#133C13] mb-1" style={{ fontFamily: 'Poppins_500Medium' }}>
                  Remaining Balance
                </Text>
                <Text className="text-3xl text-[#133C13] mt-3" style={{ fontFamily: 'Poppins_700Bold' }}>
                  {currencySymbol} {category.remainingBalance.toLocaleString()}
                </Text>
              </View>
              
              <View className="flex-row items-center">
                <View className="bg-[#133C13] px-3 py-1.5 rounded-full flex-row items-center">
                  <Users size={18} color="white" />
                  <Text className="text-white text-sm ml-2" style={{ fontFamily: 'Poppins_500Medium' }}>
                    {category.members.length} members
                  </Text>
                </View>
              </View>
            </View>

            <View className="mb-4">
              <View className="flex-row justify-between mb-1">
                <Text className="text-base text-[#133C13]" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                  Budget Usage
                </Text>
                <Text className={`text-sm ${percentageUsed > 80 ? 'text-red-600' : percentageUsed > 50 ? 'text-yellow-600' : 'text-[#133C13]'}`} style={{ fontFamily: 'Poppins_500Medium' }}>
                  {Math.round(percentageUsed)}%
                </Text>
              </View>
              
              <View className="bg-[#E7F5E3] rounded h-2.5 w-full mb-2">
                <Progress.Bar
                  progress={percentageUsed / 100}
                  color={progressColor}
                  width={null}
                  height={10}
                  borderWidth={0}
                />
              </View>
              
              <Text className={`text-sm ${percentageUsed > 80 ? 'text-red-600' : percentageUsed > 50 ? 'text-yellow-600' : 'text-[#133C13]'}`} style={{ fontFamily: 'Poppins_500Medium' }}>
                Spent {currencySymbol}{category.totalSpent.toLocaleString()} of {currencySymbol}{category.budget.toLocaleString()}
              </Text>
            </View>

            <View className="border-t border-white/50 my-3"></View>

            <View className="flex-row justify-between">
              <View className="bg-[#E0FFC0] p-3 rounded-lg flex-1 mr-2">
                <Text className="text-xs text-[#133C13] mb-1" style={{ fontFamily: 'Poppins_500Medium' }}>
                  Group Budget
                </Text>
                <Text className="text-lg text-[#133C13]" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                  {currencySymbol} {category.budget.toLocaleString()}
                </Text>
              </View>
              
              <View className="bg-[#E0FFC0] p-3 rounded-lg flex-1 ml-2">
                <Text className="text-xs text-[#133C13] mb-1" style={{ fontFamily: 'Poppins_500Medium' }}>
                  Total Spent
                </Text>
                <Text className="text-lg text-[#133C13]" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                  {currencySymbol} {category.totalSpent.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>

          {/* Expenses List Section */}
          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg text-[#1A3C34]" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                Recent Expenses
              </Text>
              
              <Menu>
                <MenuTrigger customStyles={{
                  triggerWrapper: {
                    padding: 8,
                  },
                }}>
                  <MoreHorizontal size={20} color="#1A3C34" />
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
                  <MenuOption onSelect={() => {
                    setBulkDeleteModalVisible(true);
                    setSelectedExpensesForDeletion([]);
                  }}>
                    <View className="p-3 flex-row items-center">
                      <Text className="text-[#EF4444]" style={{ fontFamily: 'Poppins_500Medium' }}>Delete Expenses</Text>
                    </View>
                  </MenuOption>
                </MenuOptions>
              </Menu>
            </View>

            <ScrollView 
              className="flex-1"
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              {category.expenses.length > 0 ? (
                <View>
                  {category.expenses.map((expense) => {
                    const owedAmount = calculateOwedAmount(expense);
                    const isCurrentUserPayer = expense.paidBy === currentUser;
                    const othersOweAmount = (expense.amount / category.members.length).toFixed(2);
                    
                    return (
                      <Swipeable
                        key={expense.id}
                        renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, expense.id)}
                        overshootRight={false}
                      >
                        <TouchableOpacity 
                          className="mb-3 bg-[#F8FAFC] rounded-xl border border-gray-100 shadow-sm"
                          onPress={() => handleExpensePress(expense)}
                          activeOpacity={0.8}
                        >
                          <View className="p-4">
                            <View className="flex-row justify-between items-center mb-2">
                              <Text className="text-base text-[#1A3C34] flex-1" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                                {expense.description}
                              </Text>
                              <Text className="text-base text-red-500" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                                -{currencySymbol}{expense.amount.toLocaleString()}
                              </Text>
                            </View>

                            <View className="flex-row justify-between mb-3">
                              <Text className="text-sm text-gray-500" style={{ fontFamily: 'Poppins_400Regular' }}>
                                {expense.date}
                              </Text>
                              <Text className="text-sm text-gray-500" style={{ fontFamily: 'Poppins_400Regular' }}>
                                Paid by: {expense.paidBy}
                              </Text>
                            </View>

                            <View className="h-px bg-gray-100 mb-3" />

                            <View className="flex-row justify-between items-center">
                              <View className="flex-row items-center">
                                {owedAmount !== null && (
                                  <View className="flex-row items-center bg-white px-3 py-1.5 rounded-lg border border-gray-100">
                                    <View className="w-2 h-2 rounded-full bg-red-400/30 mr-2" />
                                    <Text className="text-sm text-[#1A3C34]" style={{ fontFamily: 'Poppins_500Medium' }}>
                                      You owe: {currencySymbol}{owedAmount.toFixed(2)}
                                    </Text>
                                  </View>
                                )}
                                {isCurrentUserPayer && (
                                  <View className="flex-row items-center bg-white px-3 py-1.5 rounded-lg border border-gray-100">
                                    <View className="w-2 h-2 rounded-full bg-[#B2EA71] mr-2" />
                                    <Text className="text-sm text-[#1A3C34]" style={{ fontFamily: 'Poppins_500Medium' }}>
                                      Others owe: {currencySymbol}{othersOweAmount}
                                    </Text>
                                  </View>
                                )}
                              </View>
                              <TouchableOpacity
                                onPress={() => openEditExpenseModal(expense)}
                                className="p-2"
                              >
                                <PenSquare size={16} color="#6B7280" />
                              </TouchableOpacity>
                            </View>
                          </View>
                        </TouchableOpacity>
                      </Swipeable>
                    );
                  })}
                </View>
              ) : (
                <View className="bg-[#F8FAFC] rounded-xl p-5 border border-gray-100 shadow-sm items-center">
                  <Text className="text-sm text-[#1A3C34]" style={{ fontFamily: 'Poppins_400Regular' }}>
                    No expenses recorded yet
                  </Text>
                </View>
              )}

              <Text className="text-gray-400 text-xs mt-2 text-center" style={{ fontFamily: "Poppins_400Regular" }}>
                Swipe left on a transaction to delete
              </Text>
            </ScrollView>
          </View>
        </View>

        {/* Expense Detail Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/40">
            <Animated.View 
              style={{ transform: [{ scale: scaleValue }] }}
              className="bg-white rounded-2xl w-[95%] max-w-lg shadow-lg"
            >
              <View className="bg-[#F8FAFC] rounded-t-2xl p-4 border-b border-gray-100 flex-row justify-between items-center">
                <Text className="text-xl text-[#1A3C34]" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                  Expense Details
                </Text>
                <Pressable 
                  onPress={() => setModalVisible(false)}
                  className="p-2 -mr-2"
                >
                  <X size={24} color="#6B7280" />
                </Pressable>
              </View>

              {selectedExpense && (
                <ScrollView className="p-5">
                  <View className="mb-4">
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-lg text-[#1A3C34] flex-1" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                        {selectedExpense.description}
                      </Text>
                      <Text className="text-lg text-red-500" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                        -{currencySymbol}{selectedExpense.amount.toLocaleString()}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-sm text-gray-500" style={{ fontFamily: 'Poppins_400Regular' }}>
                        {selectedExpense.date}
                      </Text>
                      <Text className="text-sm text-gray-500" style={{ fontFamily: 'Poppins_400Regular' }}>
                        Paid by: {selectedExpense.paidBy}
                      </Text>
                    </View>
                  </View>

                  <View className="h-px bg-gray-100 my-3" />

                  <View className="mb-4">
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-gray-600" style={{ fontFamily: 'Poppins_500Medium' }}>
                        Split Equally
                      </Text>
                      <Text className="text-gray-600" style={{ fontFamily: 'Poppins_500Medium' }}>
                        {category.members.length} members
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-gray-600" style={{ fontFamily: 'Poppins_500Medium' }}>
                        Settled
                      </Text>
                      <Text className="text-gray-600" style={{ fontFamily: 'Poppins_500Medium' }}>
                        {getSettledCount(selectedExpense)} members
                      </Text>
                    </View>
                  </View>

                  <View className="bg-[#F8FAFC] p-4 rounded-lg mb-4">
                    {selectedExpense.paidBy !== currentUser ? (
                      <View className="flex-row justify-between items-center">
                        <Text className="text-base text-[#1A3C34]" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                          You Owe
                        </Text>
                        <Text className="text-base text-[#1A3C34]" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                          {currencySymbol}{(selectedExpense.amount / category.members.length).toFixed(2)}
                        </Text>
                      </View>
                    ) : (
                      <View className="flex-row justify-between items-center">
                        <Text className="text-base text-[#1A3C34]" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                          Others Owe You
                        </Text>
                        <Text className="text-base text-[#1A3C34]" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                          {currencySymbol}{(selectedExpense.amount / category.members.length).toFixed(2)} each
                        </Text>
                      </View>
                    )}
                  </View>

                  <View className="mb-6">
                    <Text className="text-base text-[#1A3C34] mb-3" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                      Members
                    </Text>
                    {category.members.map(member => (
                      <View 
                        key={member} 
                        className="flex-row items-center justify-between py-2.5 px-3 bg-white rounded-lg mb-1.5 border border-gray-100"
                      >
                        <View className="flex-row items-center">
                          <User size={18} color="#6B7280" />
                          <Text className="ml-3 text-gray-700" style={{ fontFamily: 'Poppins_400Regular' }}>
                            {member}
                          </Text>
                        </View>
                        {selectedExpense.settledMembers?.includes(member) && (
                          <Check size={18} color="#10B981" />
                        )}
                      </View>
                    ))}
                  </View>

                  <View className="flex-row justify-end space-x-3 pb-4">
                    <Pressable 
                      className="px-5 py-2.5 rounded-lg border border-gray-200 bg-white"
                      onPress={() => setModalVisible(false)}
                      style={({ pressed }) => ({
                        opacity: pressed ? 0.7 : 1,
                        transform: [{ scale: pressed ? 0.95 : 1 }],
                      })}
                    >
                      <Text className="text-gray-600" style={{ fontFamily: 'Poppins_500Medium' }}>
                        Close
                      </Text>
                    </Pressable>
                    
                    {selectedExpense.paidBy !== currentUser && (
                      <Pressable 
                        className="px-5 py-2.5 rounded-lg bg-[#133C13] ml-4"
                        onPress={handleSettleExpense}
                        style={({ pressed }) => ({
                          opacity: pressed ? 0.7 : 1,
                          transform: [{ scale: pressed ? 0.95 : 1 }],
                        })}
                      >
                        <Text className="text-white" style={{ fontFamily: 'Poppins_500Medium' }}>
                          Mark as Paid
                        </Text>
                      </Pressable>
                    )}
                  </View>
                </ScrollView>
              )}
            </Animated.View>
          </View>
        </Modal>

        {/* Edit Expense Modal */}
        <Modal animationType="fade" transparent={true} visible={editExpenseModalVisible} onRequestClose={() => setEditExpenseModalVisible(false)}>
          <View className="flex-1 justify-center items-center bg-black/40">
            <Animated.View
              style={{ transform: [{ scale: scaleValue }] }}
              className="bg-white rounded-2xl w-[95%] max-w-lg shadow-lg"
            >
              <View className="bg-[#F8FAFC] rounded-t-2xl p-4 border-b border-gray-100 flex-row justify-between items-center">
                <Text className="text-xl text-[#133C13]" style={{ fontFamily: "Poppins_600SemiBold" }}>
                  Edit Expense
                </Text>
                <Pressable onPress={() => setEditExpenseModalVisible(false)} className="p-2 -mr-2">
                  <X size={24} color="#6B7280" />
                </Pressable>
              </View>
              {editingExpense && (
                <ScrollView className="p-5">
                  <Text className="text-base text-[#133C13] mb-2" style={{ fontFamily: "Poppins_500Medium" }}>
                    Expense Name
                  </Text>
                  <TextInput
                    className="border border-gray-200 rounded-lg p-3 mb-4 text-[#133C13]"
                    style={{ fontFamily: "Poppins_400Regular" }}
                    value={editingExpense.description}
                    onChangeText={(text) => setEditingExpense({ ...editingExpense, description: text })}
                    placeholder="Name"
                    placeholderTextColor="#9CA3AF"
                  />
                  <Text className="text-base text-[#133C13] mb-2" style={{ fontFamily: "Poppins_500Medium" }}>
                    Amount
                  </Text>
                  <TextInput
                    className="border border-gray-200 rounded-lg p-3 mb-4 text-[#133C13]"
                    style={{ fontFamily: "Poppins_400Regular" }}
                    value={editingExpense.amount.toString()}
                    onChangeText={(text) =>
                      setEditingExpense({ ...editingExpense, amount: parseFloat(text) || 0 })
                    }
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                  />
                  <Text className="text-base text-[#133C13] mb-2" style={{ fontFamily: "Poppins_500Medium" }}>
                    Date (YYYY-MM-DD)
                  </Text>
                  <TextInput
                    className="border border-gray-200 rounded-lg p-3 mb-4 text-[#133C13]"
                    style={{ fontFamily: "Poppins_400Regular" }}
                    value={editingExpense.date}
                    onChangeText={(text) => setEditingExpense({ ...editingExpense, date: text })}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#9CA3AF"
                  />
                  <Text className="text-base text-[#133C13] mb-2" style={{ fontFamily: "Poppins_500Medium" }}>
                    Settled Members
                  </Text>
                  {editingExpense.paidBy === currentUser ? (
                    category.members.map(member => (
                      <TouchableOpacity
                        key={member}
                        className="flex-row items-center py-2.5 px-3 bg-white rounded-lg mb-1.5 border border-gray-100"
                        onPress={() => toggleSettledMember(member)}
                      >
                        <View className="mr-3">
                          {editingExpense.settledMembers?.includes(member) ? (
                            <Check size={20} color="#133C13" />
                          ) : (
                            <Square size={20} color="#6B7280" />
                          )}
                        </View>
                        <Text className="text-gray-700" style={{ fontFamily: "Poppins_400Regular" }}>
                          {member}
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View className="mb-4">
                      {category.members.map(member => (
                        <View
                          key={member}
                          className="flex-row items-center py-2.5 px-3 bg-gray-50 rounded-lg mb-1.5 border border-gray-200 opacity-60"
                        >
                          <View className="mr-3">
                            {editingExpense.settledMembers?.includes(member) ? (
                              <Check size={20} color="#133C13" />
                            ) : (
                              <Square size={20} color="#9CA3AF" />
                            )}
                          </View>
                          <Text className="text-gray-500" style={{ fontFamily: "Poppins_400Regular" }}>
                            {member}
                          </Text>
                        </View>
                      ))}
                      <Text className="text-sm text-gray-500 mt-2" style={{ fontFamily: "Poppins_400Regular" }}>
                        Only the payer can edit settled members.
                      </Text>
                    </View>
                  )}
                  <View className="flex-row justify-end space-x-3 pt-4">
                    <Pressable
                      className="px-5 py-2.5 rounded-lg border border-gray-200 bg-white"
                      onPress={() => setEditExpenseModalVisible(false)}
                      style={({ pressed }) => ({
                        opacity: pressed ? 0.7 : 1,
                        transform: [{ scale: pressed ? 0.95 : 1 }],
                      })}
                    >
                      <Text className="text-gray-600" style={{ fontFamily: "Poppins_500Medium" }}>
                        Cancel
                      </Text>
                    </Pressable>
                    <Pressable
                      className="px-5 py-2.5 rounded-lg bg-[#133C13] ml-4"
                      onPress={saveExpenseChanges}
                      style={({ pressed }) => ({
                        opacity: pressed ? 0.7 : 1,
                        transform: [{ scale: pressed ? 0.95 : 1 }],
                      })}
                    >
                      <Text className="text-white" style={{ fontFamily: "Poppins_500Medium" }}>
                        Save
                      </Text>
                    </Pressable>
                  </View>
                </ScrollView>
              )}
            </Animated.View>
          </View>
        </Modal>

        {/* Bulk Delete Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={bulkDeleteModalVisible}
          onRequestClose={() => setBulkDeleteModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/40">
            <Animated.View 
              style={{ transform: [{ scale: scaleValue }] }}
              className="bg-white rounded-2xl w-[95%] max-w-lg shadow-lg"
            >
              <View className="bg-[#F8FAFC] rounded-t-2xl p-4 border-b border-gray-100 flex-row justify-between items-center">
                <Text className="text-xl text-[#1A3C34]" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                  Delete Expenses
                </Text>
                <Pressable 
                  onPress={() => setBulkDeleteModalVisible(false)}
                  className="p-2 -mr-2"
                >
                  <X size={24} color="#6B7280" />
                </Pressable>
              </View>

              <ScrollView className="p-5">
                {category.expenses.length > 0 ? (
                  <View>
                    {category.expenses.map((expense) => (
                      <TouchableOpacity
                        key={expense.id}
                        className="flex-row items-center py-3 px-3 bg-[#F8FAFC] rounded-lg mb-2 border border-gray-100"
                        onPress={() => toggleExpenseSelection(expense.id)}
                      >
                        <View className="mr-3">
                          {selectedExpensesForDeletion.includes(expense.id) ? (
                            <Check size={20} color="#133C13" />
                          ) : (
                            <Square size={20} color="#6B7280" />
                          )}
                        </View>
                        <View className="flex-1">
                          <Text className="text-base text-[#1A3C34]" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                            {expense.description}
                          </Text>
                          <Text className="text-sm text-gray-600" style={{ fontFamily: 'Poppins_400Regular' }}>
                            {category.category} - {currencySymbol}{expense.amount.toLocaleString()}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text className="text-sm text-[#1A3C34] text-center" style={{ fontFamily: 'Poppins_400Regular' }}>
                    No expenses to delete
                  </Text>
                )}

                <View className="flex-row justify-end space-x-3 pb-4 pt-4">
                  <Pressable 
                    className="px-5 py-2.5 rounded-lg border border-gray-200 bg-white"
                    onPress={() => setBulkDeleteModalVisible(false)}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.7 : 1,
                      transform: [{ scale: pressed ? 0.95 : 1 }],
                    })}
                  >
                    <Text className="text-gray-600" style={{ fontFamily: 'Poppins_500Medium' }}>
                      Cancel
                    </Text>
                  </Pressable>
                  <Pressable 
                    className="px-5 py-2.5 rounded-lg bg-[#EF4444] ml-4"
                    onPress={handleBulkDelete}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.7 : 1,
                      transform: [{ scale: pressed ? 0.95 : 1 }],
                    })}
                  >
                    <Text className="text-white" style={{ fontFamily: 'Poppins_500Medium' }}>
                      Delete
                    </Text>
                  </Pressable>
                </View>
              </ScrollView>
            </Animated.View>
          </View>
        </Modal>

        {/* Add Budget Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={addBudgetModalVisible}
          onRequestClose={() => setAddBudgetModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/40">
            <Animated.View 
              style={{ transform: [{ scale: scaleValue }] }}
              className="bg-white rounded-2xl w-[95%] max-w-lg shadow-lg"
            >
              <View className="bg-[#F8FAFC] rounded-t-2xl p-4 border-b border-gray-100 flex-row justify-between items-center">
                <Text className="text-xl text-[#1A3C34]" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                  Add Additional Budget
                </Text>
                <Pressable 
                  onPress={() => setAddBudgetModalVisible(false)}
                  className="p-2 -mr-2"
                >
                  <X size={24} color="#6B7280" />
                </Pressable>
              </View>

              <View className="p-5">
                <Text className="text-base text-[#1A3C34] mb-2" style={{ fontFamily: 'Poppins_500Medium' }}>
                  Enter Additional Amount
                </Text>
                <TextInput
                  className="border border-gray-200 rounded-lg p-3 mb-4 text-[#1A3C34]"
                  style={{ fontFamily: 'Poppins_400Regular' }}
                  value={budgetInput}
                  onChangeText={setBudgetInput}
                  keyboardType="numeric"
                  placeholder={`Current: ${currencySymbol}${category.budget.toLocaleString()}`}
                  placeholderTextColor="#9CA3AF"
                />
                <View className="flex-row justify-end space-x-3">
                  <Pressable 
                    className="px-5 py-2.5 rounded-lg border border-gray-200 bg-white"
                    onPress={() => setAddBudgetModalVisible(false)}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.7 : 1,
                      transform: [{ scale: pressed ? 0.95 : 1 }],
                    })}
                  >
                    <Text className="text-gray-600" style={{ fontFamily: 'Poppins_500Medium' }}>
                      Cancel
                    </Text>
                  </Pressable>
                  <Pressable 
                    className="px-5 py-2.5 rounded-lg bg-[#133C13] ml-3"
                    onPress={confirmAddBudget}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.7 : 1,
                      transform: [{ scale: pressed ? 0.95 : 1 }],
                    })}
                  >
                    <Text className="text-white" style={{ fontFamily: 'Poppins_500Medium' }}>
                      Add
                    </Text>
                  </Pressable>
                </View>
              </View>
            </Animated.View>
          </View>
        </Modal>

        {/* Edit Budget Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={editBudgetModalVisible}
          onRequestClose={() => setEditBudgetModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/40">
            <Animated.View 
              style={{ transform: [{ scale: scaleValue }] }}
              className="bg-white rounded-2xl w-[95%] max-w-lg shadow-lg"
            >
              <View className="bg-[#F8FAFC] rounded-t-2xl p-4 border-b border-gray-100 flex-row justify-between items-center">
                <Text className="text-xl text-[#1A3C34]" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                  Edit Budget
                </Text>
                <Pressable 
                  onPress={() => setEditBudgetModalVisible(false)}
                  className="p-2 -mr-2"
                >
                  <X size={24} color="#6B7280" />
                </Pressable>
              </View>

              <View className="p-5">
                <Text className="text-base text-[#1A3C34] mb-2" style={{ fontFamily: 'Poppins_500Medium' }}>
                  Enter New Budget Amount
                </Text>
                <TextInput
                  className="border border-gray-200 rounded-lg p-3 mb-4 text-[#1A3C34]"
                  style={{ fontFamily: 'Poppins_400Regular' }}
                  value={budgetInput}
                  onChangeText={setBudgetInput}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                />
                <View className="flex-row justify-end space-x-3">
                  <Pressable 
                    className="px-5 py-2.5 rounded-lg border border-gray-200 bg-white"
                    onPress={() => setEditBudgetModalVisible(false)}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.7 : 1,
                      transform: [{ scale: pressed ? 0.95 : 1 }],
                    })}
                  >
                    <Text className="text-gray-600" style={{ fontFamily: 'Poppins_500Medium' }}>
                      Cancel
                    </Text>
                  </Pressable>
                  <Pressable 
                    className="px-5 py-2.5 rounded-lg bg-[#133C13] ml-3"
                    onPress={confirmEditBudget}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.7 : 1,
                      transform: [{ scale: pressed ? 0.95 : 1 }],
                    })}
                  >
                    <Text className="text-white" style={{ fontFamily: 'Poppins_500Medium' }}>
                      Save
                    </Text>
                  </Pressable>
                </View>
              </View>
            </Animated.View>
          </View>
        </Modal>
      </GestureHandlerRootView>
    </MenuProvider>
  );
}