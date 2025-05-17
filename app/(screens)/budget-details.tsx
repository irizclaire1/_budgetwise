import {
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  Animated,
  Alert,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState, useRef } from "react";
import * as Progress from "react-native-progress";
import { ArrowLeft, MoreHorizontal, PenSquare, X, Check, Square, Trash2 } from "lucide-react-native";
import { Menu, MenuOptions, MenuOption, MenuTrigger, MenuProvider } from 'react-native-popup-menu';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';

interface Budget {
  id: string;
  category: string;
  budget: number;
  totalSpent: number;
  remainingBalance: number;
  transactions: { id: string; name: string; amount: number; date: string; note?: string }[];
}

const mockBudgets: Budget[] = [
  {
    id: "1",
    category: "Food & Dining",
    budget: 2000,
    totalSpent: 677,
    remainingBalance: 1323,
    transactions: [
      { id: "t1", name: "Burger King", amount: 399, date: "2025-05-01", note: "Lunch with friends" },
      { id: "t2", name: "Jollibee", amount: 78, date: "2025-05-02" },
      { id: "t3", name: "Starbucks", amount: 200, date: "2025-05-03", note: "Morning coffee" },
      { id: "t4", name: "Burger King", amount: 399, date: "2025-05-04" },
      { id: "t5", name: "Jollibee", amount: 78, date: "2025-05-05" },
      { id: "t6", name: "Starbucks", amount: 200, date: "2025-05-06" },
    ],
  },
  {
    id: "2",
    category: "Groceries",
    budget: 1000,
    totalSpent: 0,
    remainingBalance: 1000,
    transactions: [],
  },
  {
    id: "3",
    category: "Entertainment",
    budget: 1000,
    totalSpent: 0,
    remainingBalance: 1000,
    transactions: [],
  },
];

export default function BudgetDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addBudgetModalVisible, setAddBudgetModalVisible] = useState(false);
  const [editBudgetModalVisible, setEditBudgetModalVisible] = useState(false);
  const [expenseDetailModalVisible, setExpenseDetailModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Budget['transactions'][0] | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<{
    id: string;
    name: string;
    amount: number;
    date: string;
    note?: string;
  } | null>(null);
  const [budgetInput, setBudgetInput] = useState("");
  const scaleValue = useRef(new Animated.Value(0.95)).current;
  const [deleteExpensesModalVisible, setDeleteExpensesModalVisible] = useState(false);
  const [selectedTransactionsForDeletion, setSelectedTransactionsForDeletion] = useState<string[]>([]);

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

  useEffect(() => {
    if (editModalVisible || addBudgetModalVisible || editBudgetModalVisible || deleteExpensesModalVisible || expenseDetailModalVisible) {
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      scaleValue.setValue(0.95);
    }
  }, [editModalVisible, addBudgetModalVisible, editBudgetModalVisible, deleteExpensesModalVisible, expenseDetailModalVisible]);

  const handleAddBudget = () => {
    setBudgetInput("");
    setAddBudgetModalVisible(true);
  };

  const handleEditBudget = () => {
    if (budget) {
      setBudgetInput(budget.budget.toString());
      setEditBudgetModalVisible(true);
    }
  };

  const handleDeleteBudget = () => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this budget category?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => router.back(),
        },
      ],
      { cancelable: true }
    );
  };

  const confirmAddBudget = () => {
    const additionalBudget = parseFloat(budgetInput);
    if (budget && !isNaN(additionalBudget) && additionalBudget > 0) {
      setBudget({
        ...budget,
        budget: budget.budget + additionalBudget,
        remainingBalance: budget.remainingBalance + additionalBudget
      });
      setAddBudgetModalVisible(false);
    } else {
      Alert.alert("Invalid Input", "Please enter a valid positive number.");
    }
  };

  const confirmEditBudget = () => {
    const newBudget = parseFloat(budgetInput);
    if (budget && !isNaN(newBudget) && newBudget >= 0) {
      setBudget({
        ...budget,
        budget: newBudget,
        remainingBalance: newBudget - budget.totalSpent,
      });
      setEditBudgetModalVisible(false);
    } else {
      Alert.alert("Invalid Input", "Please enter a valid number.");
    }
  };

  const openEditModal = (transaction: { id: string; name: string; amount: number; date: string; note?: string }) => {
    setEditingTransaction(transaction);
    setEditModalVisible(true);
  };

  const openExpenseDetailModal = (transaction: Budget['transactions'][0]) => {
    setSelectedTransaction(transaction);
    setExpenseDetailModalVisible(true);
  };

  const saveTransaction = () => {
    if (editingTransaction && budget) {
      const updatedTransactions = budget.transactions.map((txn) =>
        txn.id === editingTransaction.id
          ? {
              ...txn,
              name: editingTransaction.name,
              amount: editingTransaction.amount,
              date: editingTransaction.date,
              note: editingTransaction.note,
            }
          : txn
      );
      const newTotalSpent = updatedTransactions.reduce((sum, txn) => sum + txn.amount, 0);

      setBudget({
        ...budget,
        transactions: updatedTransactions,
        totalSpent: newTotalSpent,
        remainingBalance: budget.budget - newTotalSpent,
      });
      setEditModalVisible(false);
      setEditingTransaction(null);
    }
  };

  const handleBulkDeleteTransactions = () => {
    if (selectedTransactionsForDeletion.length === 0) {
      Alert.alert("No Transactions Selected", "Please select at least one transaction to delete.");
      return;
    }

    Alert.alert(
      "Confirm Bulk Deletion",
      `Are you sure you want to delete ${selectedTransactionsForDeletion.length} transaction(s)?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            if (budget) {
              const updatedTransactions = budget.transactions.filter(
                (txn) => !selectedTransactionsForDeletion.includes(txn.id)
              );
              const newTotalSpent = updatedTransactions.reduce(
                (sum, txn) => sum + txn.amount, 
                0
              );
              
              setBudget({
                ...budget,
                transactions: updatedTransactions,
                totalSpent: newTotalSpent,
                remainingBalance: budget.budget - newTotalSpent,
              });
              setDeleteExpensesModalVisible(false);
              setSelectedTransactionsForDeletion([]);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const toggleTransactionSelection = (transactionId: string) => {
    setSelectedTransactionsForDeletion((prev) =>
      prev.includes(transactionId)
        ? prev.filter((id) => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
    transactionId: string
  ) => {
    const trans = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [0, 80],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View 
        style={{
          transform: [{ translateX: trans }],
          backgroundColor: '#FEE2E2',
          justifyContent: 'center',
          alignItems: 'center',
          width: 80,
          borderTopLeftRadius: 12,
          borderBottomLeftRadius: 12,
          marginLeft: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => handleDeleteTransaction(transactionId)}
          className="p-4"
        >
          <Trash2 size={20} color="#EF4444" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const handleDeleteTransaction = (transactionId: string) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this transaction?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            if (budget) {
              const updatedTransactions = budget.transactions.filter(
                (txn) => txn.id !== transactionId
              );
              const newTotalSpent = updatedTransactions.reduce(
                (sum, txn) => sum + txn.amount, 
                0
              );
              
              setBudget({
                ...budget,
                transactions: updatedTransactions,
                totalSpent: newTotalSpent,
                remainingBalance: budget.budget - newTotalSpent,
              });
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

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
        <Text className="text-lg text-gray-600" style={{ fontFamily: "Poppins_500Medium" }}>
          Budget not found
        </Text>
      </View>
    );
  }

  const percentageUsed = (budget.totalSpent / budget.budget) * 100;
  const progressColor = percentageUsed > 80 ? "#EF4444" : percentageUsed > 50 ? "#F59E0B" : "#133C13";

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <MenuProvider>
        <View className="flex-1 bg-white">
          {/* Header */}
          <View className="flex-row justify-between items-center pt-10 pb-4 px-4 border-b border-gray-100">
            <TouchableOpacity onPress={() => router.back()} className="p-2">
              <ArrowLeft size={24} color="#133C13" />
            </TouchableOpacity>
            <Text className="text-xl text-[#133C13]" style={{ fontFamily: "Poppins_600SemiBold" }}>
              {budget.category}
            </Text>
            <Menu>
              <MenuTrigger
                customStyles={{
                  triggerWrapper: {
                    padding: 8,
                  },
                }}
              >
                <MoreHorizontal size={20} color="#133C13" />
              </MenuTrigger>
              <MenuOptions
                customStyles={{
                  optionsContainer: {
                    marginTop: 30,
                    marginLeft: -20,
                    width: 150,
                    borderRadius: 8,
                    backgroundColor: "white",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 5,
                  },
                }}
              >
                <MenuOption onSelect={handleAddBudget}>
                  <View className="p-3">
                    <Text className="text-[#133C13]" style={{ fontFamily: "Poppins_500Medium" }}>
                      Add Budget
                    </Text>
                  </View>
                </MenuOption>
                <View className="h-px bg-gray-200 mx-2" />
                <MenuOption onSelect={handleEditBudget}>
                  <View className="p-3">
                    <Text className="text-[#133C13]" style={{ fontFamily: "Poppins_500Medium" }}>
                      Edit Budget
                    </Text>
                  </View>
                </MenuOption>
                <View className="h-px bg-gray-200 mx-2" />
                <MenuOption onSelect={handleDeleteBudget}>
                  <View className="p-3">
                    <Text className="text-red-600" style={{ fontFamily: "Poppins_500Medium" }}>
                      Delete Budget
                    </Text>
                  </View>
                </MenuOption>
              </MenuOptions>
            </Menu>
          </View>

          {/* Edit Transaction Modal */}
          <Modal animationType="fade" transparent={true} visible={editModalVisible} onRequestClose={() => setEditModalVisible(false)}>
            <View className="flex-1 justify-center items-center bg-black/40">
              <Animated.View
                style={{ transform: [{ scale: scaleValue }] }}
                className="bg-white rounded-2xl w-[95%] max-w-lg shadow-lg"
              >
                <View className="bg-[#F8FAFC] rounded-t-2xl p-4 border-b border-gray-100 flex-row justify-between items-center">
                  <Text className="text-xl text-[#133C13]" style={{ fontFamily: "Poppins_600SemiBold" }}>
                    Edit Transaction
                  </Text>
                  <Pressable onPress={() => setEditModalVisible(false)} className="p-2 -mr-2">
                    <X size={24} color="#6B7280" />
                  </Pressable>
                </View>
                {editingTransaction && (
                  <View className="p-5">
                    <Text className="text-base text-[#133C13] mb-2" style={{ fontFamily: "Poppins_500Medium" }}>
                      Transaction Name
                    </Text>
                    <TextInput
                      className="border border-gray-200 rounded-lg p-3 mb-4 text-[#133C13]"
                      style={{ fontFamily: "Poppins_400Regular" }}
                      value={editingTransaction.name}
                      onChangeText={(text) => setEditingTransaction({ ...editingTransaction, name: text })}
                      placeholder="Name"
                      placeholderTextColor="#9CA3AF"
                    />
                    <Text className="text-base text-[#133C13] mb-2" style={{ fontFamily: "Poppins_500Medium" }}>
                      Amount
                    </Text>
                    <TextInput
                      className="border border-gray-200 rounded-lg p-3 mb-4 text-[#133C13]"
                      style={{ fontFamily: "Poppins_400Regular" }}
                      value={editingTransaction.amount.toString()}
                      onChangeText={(text) =>
                        setEditingTransaction({ ...editingTransaction, amount: parseFloat(text) || 0 })
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
                      value={editingTransaction.date}
                      onChangeText={(text) => setEditingTransaction({ ...editingTransaction, date: text })}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#9CA3AF"
                    />
                    <Text className="text-base text-[#133C13] mb-2" style={{ fontFamily: "Poppins_500Medium" }}>
                      Note
                    </Text>
                    <TextInput
                      className="border border-gray-200 rounded-lg p-3 mb-4 text-[#133C13]"
                      style={{ fontFamily: "Poppins_400Regular" }}
                      value={editingTransaction.note || ""}
                      onChangeText={(text) => setEditingTransaction({ ...editingTransaction, note: text })}
                      placeholder="Optional note"
                      placeholderTextColor="#9CA3AF"
                    />
                    <View className="flex-row justify-end space-x-3">
                      <Pressable
                        className="px-5 py-2.5 rounded-lg border border-gray-200 bg-white"
                        onPress={() => setEditModalVisible(false)}
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
                        onPress={saveTransaction}
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
                  </View>
                )}
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
                  <Text className="text-xl text-[#133C13]" style={{ fontFamily: "Poppins_600SemiBold" }}>
                    Add Additional Budget
                  </Text>
                  <Pressable onPress={() => setAddBudgetModalVisible(false)} className="p-2 -mr-2">
                    <X size={24} color="#6B7280" />
                  </Pressable>
                </View>
                <View className="p-5">
                  <Text className="text-base text-[#133C13] mb-2" style={{ fontFamily: "Poppins_500Medium" }}>
                    Enter Budget Amount
                  </Text>
                  <TextInput
                    className="border border-gray-200 rounded-lg p-3 mb-4 text-[#133C13]"
                    style={{ fontFamily: "Poppins_400Regular" }}
                    value={budgetInput}
                    onChangeText={setBudgetInput}
                    keyboardType="numeric"
                    placeholder={`Current: ₱${budget.budget.toLocaleString()}`}
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
                      <Text className="text-gray-600" style={{ fontFamily: "Poppins_500Medium" }}>
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
                      <Text className="text-white" style={{ fontFamily: "Poppins_500Medium" }}>
                        Add Budget
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
                  <Text className="text-xl text-[#133C13]" style={{ fontFamily: "Poppins_600SemiBold" }}>
                    Edit Budget
                  </Text>
                  <Pressable onPress={() => setEditBudgetModalVisible(false)} className="p-2 -mr-2">
                    <X size={24} color="#6B7280" />
                  </Pressable>
                </View>
                <View className="p-5">
                  <Text className="text-base text-[#133C13] mb-2" style={{ fontFamily: "Poppins_500Medium" }}>
                    Enter New Budget Amount
                  </Text>
                  <TextInput
                    className="border border-gray-200 rounded-lg p-3 mb-4 text-[#133C13]"
                    style={{ fontFamily: "Poppins_400Regular" }}
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
                      <Text className="text-gray-600" style={{ fontFamily: "Poppins_500Medium" }}>
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
                      <Text className="text-white" style={{ fontFamily: "Poppins_500Medium" }}>
                        Save
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </Animated.View>
            </View>
          </Modal>

          {/* Delete Expenses Modal */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={deleteExpensesModalVisible}
            onRequestClose={() => setDeleteExpensesModalVisible(false)}
          >
            <View className="flex-1 justify-center items-center bg-black/40">
              <Animated.View
                style={{ transform: [{ scale: scaleValue }] }}
                className="bg-white rounded-2xl w-[95%] max-w-lg shadow-lg"
              >
                <View className="bg-[#F8FAFC] rounded-t-2xl p-4 border-b border-gray-100 flex-row justify-between items-center">
                  <Text className="text-xl text-[#133C13]" style={{ fontFamily: "Poppins_600SemiBold" }}>
                    Delete Transactions
                  </Text>
                  <Pressable
                    onPress={() => setDeleteExpensesModalVisible(false)}
                    className="p-2 -mr-2"
                  >
                    <X size={24} color="#6B7280" />
                  </Pressable>
                </View>

                <ScrollView className="p-5">
                  {budget.transactions.length > 0 ? (
                    <View>
                      {budget.transactions.map((transaction) => (
                        <TouchableOpacity
                          key={transaction.id}
                          className="flex-row items-center py-3 px-3 bg-[#F8FAFC] rounded-lg mb-2 border border-gray-100"
                          onPress={() => toggleTransactionSelection(transaction.id)}
                        >
                          <View className="mr-3">
                            {selectedTransactionsForDeletion.includes(transaction.id) ? (
                              <Check size={20} color="#133C13" />
                            ) : (
                              <Square size={20} color="#6B7280" />
                            )}
                          </View>
                          <View className="flex-1">
                            <Text className="text-base text-[#133C13]" style={{ fontFamily: "Poppins_600SemiBold" }}>
                              {transaction.name}
                            </Text>
                            <Text className="text-sm text-gray-600" style={{ fontFamily: "Poppins_400Regular" }}>
                              ₱{transaction.amount.toLocaleString()} • {transaction.date}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    <Text className="text-sm text-[#133C13] text-center" style={{ fontFamily: "Poppins_400Regular" }}>
                      No transactions to delete
                    </Text>
                  )}

                  <View className="flex-row justify-end space-x-3 pb-4 pt-4">
                    <Pressable
                      className="px-5 py-2.5 rounded-lg border border-gray-200 bg-white"
                      onPress={() => setDeleteExpensesModalVisible(false)}
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
                      className="px-5 py-2.5 rounded-lg bg-[#EF4444] ml-4"
                      onPress={handleBulkDeleteTransactions}
                      style={({ pressed }) => ({
                        opacity: pressed ? 0.7 : 1,
                        transform: [{ scale: pressed ? 0.95 : 1 }],
                      })}
                    >
                      <Text className="text-white" style={{ fontFamily: "Poppins_500Medium" }}>
                        Delete
                      </Text>
                    </Pressable>
                  </View>
                </ScrollView>
              </Animated.View>
            </View>
          </Modal>

          {/* Expense Detail Modal */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={expenseDetailModalVisible}
            onRequestClose={() => setExpenseDetailModalVisible(false)}
          >
            <View className="flex-1 justify-center items-center bg-black/40">
              <Animated.View
                style={{ transform: [{ scale: scaleValue }] }}
                className="bg-white rounded-2xl w-[95%] max-w-lg shadow-lg"
              >
                <View className="bg-[#F8FAFC] rounded-t-2xl p-4 border-b border-gray-100 flex-row justify-between items-center">
                  <Text className="text-xl text-[#133C13]" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                    Expense Details
                  </Text>
                  <Pressable
                    onPress={() => setExpenseDetailModalVisible(false)}
                    className="p-2 -mr-2"
                  >
                    <X size={24} color="#6B7280" />
                  </Pressable>
                </View>

                {selectedTransaction && (
                  <ScrollView className="p-5">
                    <View className="mb-4">
                      <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-lg text-[#133C13] flex-1" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                          {selectedTransaction.name}
                        </Text>
                        <Text className="text-lg text-red-500" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                          -₱{selectedTransaction.amount.toLocaleString()}
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-sm text-gray-500" style={{ fontFamily: 'Poppins_400Regular' }}>
                          {selectedTransaction.date}
                        </Text>
                      </View>
                    </View>

                    <View className="h-px bg-gray-100 my-3" />

                    <View className="mb-4">
                      <Text className="text-base text-[#133C13] mb-2" style={{ fontFamily: 'Poppins_500Medium' }}>
                        Category
                      </Text>
                      <Text className="text-sm text-gray-600" style={{ fontFamily: 'Poppins_400Regular' }}>
                        {budget.category}
                      </Text>
                    </View>

                    <View className="mb-4">
                      <Text className="text-base text-[#133C13] mb-2" style={{ fontFamily: 'Poppins_500Medium' }}>
                        Note
                      </Text>
                      <Text className="text-sm text-gray-600" style={{ fontFamily: 'Poppins_400Regular' }}>
                        {selectedTransaction.note || 'No note added'}
                      </Text>
                    </View>

                    <View className="flex-row justify-end space-x-3 pb-4">
                      <Pressable
                        className="px-5 py-2.5 rounded-lg border border-gray-200 bg-white"
                        onPress={() => setExpenseDetailModalVisible(false)}
                        style={({ pressed }) => ({
                          opacity: pressed ? 0.7 : 1,
                          transform: [{ scale: pressed ? 0.95 : 1 }],
                        })}
                      >
                        <Text className="text-gray-600" style={{ fontFamily: 'Poppins_500Medium' }}>
                          Close
                        </Text>
                      </Pressable>
                      <Pressable
                        className="px-5 py-2.5 rounded-lg bg-[#133C13] ml-4"
                        onPress={() => {
                          setExpenseDetailModalVisible(false);
                          openEditModal(selectedTransaction);
                        }}
                        style={({ pressed }) => ({
                          opacity: pressed ? 0.7 : 1,
                          transform: [{ scale: pressed ? 0.95 : 1 }],
                        })}
                      >
                        <Text className="text-white" style={{ fontFamily: 'Poppins_500Medium' }}>
                          Edit
                        </Text>
                      </Pressable>
                    </View>
                  </ScrollView>
                )}
              </Animated.View>
            </View>
          </Modal>

          {/* Budget Overview Card */}
          <View className="px-4 pt-4">
            <View className="bg-[#B2EA71] shadow-md rounded-xl p-6 mb-4 border border-gray-200">
              <Text className="text-lg text-[#133C13] mb-1" style={{ fontFamily: "Poppins_500Medium" }}>
                Remaining Balance
              </Text>
              <Text className="text-4xl text-[#133C13] mb-6 mt-4" style={{ fontFamily: "Poppins_700Bold" }}>
                ₱{budget.remainingBalance.toLocaleString()}
              </Text>

              <View className="mb-6">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-base text-[#133C13]" style={{ fontFamily: "Poppins_600SemiBold" }}>
                    Budget Usage
                  </Text>
                  <Text
                    className={`text-sm ${
                      percentageUsed > 80 ? "text-red-600" : percentageUsed > 50 ? "text-yellow-600" : "text-[#133C13]"
                    }`}
                    style={{ fontFamily: "Poppins_500Medium" }}
                  >
                    {percentageUsed.toFixed(0)}%
                  </Text>
                </View>
                <View className="bg-[#E7F5E3] rounded h-2.5 w-full mb-3 mt-2">
                  <Progress.Bar
                    progress={budget.totalSpent / budget.budget}
                    color={progressColor}
                    width={null}
                    height={10}
                    borderWidth={0}
                  />
                </View>
                <Text
                  className={`text-sm ${
                    percentageUsed > 80 ? "text-red-600" : percentageUsed > 50 ? "text-yellow-600" : "text-[#133C13]"
                  }`}
                  style={{ fontFamily: "Poppins_500Medium" }}
                >
                  ₱{budget.totalSpent.toLocaleString()} of ₱{budget.budget.toLocaleString()}
                </Text>
              </View>

              <View className="border-t border-white my-4 mt-2"></View>

              <View className="flex-row justify-between">
                <View className="bg-[#E0FFC0] p-4 rounded-lg flex-1 mr-2 shadow-sm">
                  <Text className="text-sm text-[#133C13] mb-1" style={{ fontFamily: "Poppins_500Medium" }}>
                    Budget
                  </Text>
                  <Text className="text-xl text-[#133C13]" style={{ fontFamily: "Poppins_600SemiBold" }}>
                    ₱{budget.budget.toLocaleString()}
                  </Text>
                </View>
                <View className="bg-[#E0FFC0] p-4 rounded-lg flex-1 ml-2 shadow-sm">
                  <Text className="text-sm text-[#133C13] mb-1" style={{ fontFamily: "Poppins_500Medium" }}>
                    Total Spent
                  </Text>
                  <Text className="text-xl text-red-600" style={{ fontFamily: "Poppins_600SemiBold" }}>
                    -₱{budget.totalSpent.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Transactions Section */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg text-[#133C13]" style={{ fontFamily: "Poppins_600SemiBold" }}>
                Transactions
              </Text>
              <Menu>
                <MenuTrigger
                  customStyles={{
                    triggerWrapper: {
                      padding: 8,
                    },
                  }}
                >
                  <MoreHorizontal size={20} color="#133C13" />
                </MenuTrigger>
                <MenuOptions
                  customStyles={{
                    optionsContainer: {
                      marginTop: 30,
                      marginLeft: -20,
                      width: 150,
                      borderRadius: 8,
                      backgroundColor: "white",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 5,
                    },
                  }}
                >
                  <MenuOption onSelect={() => {
                    setDeleteExpensesModalVisible(true);
                    setSelectedTransactionsForDeletion([]);
                  }}>
                    <View className="p-3">
                      <Text className="text-red-600" style={{ fontFamily: "Poppins_500Medium" }}>
                        Delete Expenses
                      </Text>
                    </View>
                  </MenuOption>
                </MenuOptions>
              </Menu>
            </View>

            {budget.transactions.length > 0 ? (
              <ScrollView
                style={{ maxHeight: 300 }}
                contentContainerStyle={{ paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
              >
                {budget.transactions.map((item) => (
                  <Swipeable
                    key={item.id}
                    renderRightActions={(progress, dragX) => 
                      renderRightActions(progress, dragX, item.id)
                    }
                    overshootRight={false}
                    containerStyle={{ marginBottom: 12 }}
                  >
                    <TouchableOpacity
                      className="bg-[#F8FAFC] rounded-xl border border-gray-100 shadow-sm"
                      activeOpacity={0.8}
                      onPress={() => openExpenseDetailModal(item)}
                    >
                      <View className="p-4">
                        <View className="flex-row justify-between items-center mb-2">
                          <Text
                            className="text-base text-[#133C13] flex-1"
                            style={{ fontFamily: "Poppins_600SemiBold" }}
                          >
                            {item.name}
                          </Text>
                          <Text
                            className="text-base text-red-500"
                            style={{ fontFamily: "Poppins_600SemiBold" }}
                          >
                            -₱{item.amount.toLocaleString()}
                          </Text>
                        </View>

                        <View className="flex-row justify-between mb-3">
                          <Text
                            className="text-sm text-gray-500"
                            style={{ fontFamily: "Poppins_400Regular" }}
                          >
                            {item.date}
                          </Text>
                        </View>

                        <View className="h-px bg-gray-100 mb-3" />

                        <View className="flex-row justify-between items-center">
                          <View className="flex-row items-center">
                            <View className="flex-row items-center bg-white px-3 py-1.5 rounded-lg border border-gray-100">
                              <View className="w-2 h-2 rounded-full bg-[#B2EA71] mr-2" />
                              <Text
                                className="text-sm text-[#133C13]"
                                style={{ fontFamily: "Poppins_500Medium" }}
                              >
                                {budget.category}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </Swipeable>
                ))}
                <Text className="text-gray-400 text-xs mt-2 text-center" style={{ fontFamily: "Poppins_400Regular" }}>
                  Swipe left on a transaction to delete
                </Text>
              </ScrollView>
            ) : (
              <View className="bg-[#F8FAFC] rounded-xl p-5 border border-gray-100 shadow-sm items-center">
                <Text className="text-sm text-[#133C13]" style={{ fontFamily: "Poppins_400Regular" }}>
                  No transactions yet
                </Text>
              </View>
            )}
          </View>
        </View>
      </MenuProvider>
    </GestureHandlerRootView>
  );
}