import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Modal,
  ActivityIndicator,
  Animated,
  RefreshControl
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from '@react-native-community/datetimepicker';
import { PlusCircle, Mic, Users, User, ArrowLeft } from "lucide-react-native";

interface Budget {
  id: string;
  category: string;
  budget: number;
  totalSpent: number;
  remainingBalance: number;
  groupId?: string;
}

interface Group {
  id: string;
  name: string;
  categories: Budget[];
  members: string[];
}

const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  PHP: "₱",
  INR: "₹",
  AUD: "A$",
  CAD: "C$",
};

export default function AddExpense() {
  const router = useRouter();
  const { groupId, groupName } = useLocalSearchParams<{
    groupId?: string;
    groupName?: string;
  }>();
  
  // State management
  const [expenseType, setExpenseType] = useState<"personal" | "group">(
    groupId ? "group" : "personal"
  );
  const [selectedGroup, setSelectedGroup] = useState(groupId || "");
  const [paidBy, setPaidBy] = useState("You");
  const [expenseName, setExpenseName] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newBudget, setNewBudget] = useState("");
  const [monthlyIncome] = useState(10000);
  const [remainingBalance, setRemainingBalance] = useState(7500);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currency] = useState("₱");
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [voiceProgress, setVoiceProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout>();

  // Animation refs
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Sample data
  const [groups, setGroups] = useState<Group[]>([
    { 
      id: "1", 
      name: "Family Budget",
      members: ["You", "Spouse", "Child 1", "Child 2"],
      categories: [
        {
          id: "g1",
          category: "Groceries",
          budget: 3000,
          totalSpent: 1200,
          remainingBalance: 1800,
          groupId: "1"
        }
      ]
    }
  ]);

  const [personalBudgets, setPersonalBudgets] = useState<Budget[]>([
    {
      id: "1",
      category: "Food",
      budget: 2000,
      totalSpent: 500,
      remainingBalance: 1500
    }
  ]);

  // Handle navigation context
  useEffect(() => {
    if (groupId) {
      const group = groups.find(g => g.id === groupId);
      if (group?.members?.length) {
        setPaidBy(group.members[0]);
      }
    } else {
      setPaidBy("You");
      setCategory("");
    }
  }, [groupId, groups]);

  // Get current budgets based on expense type
  const getCurrentBudgets = useCallback(() => {
    return expenseType === 'personal' 
      ? personalBudgets 
      : groups.find(g => g.id === selectedGroup)?.categories || [];
  }, [expenseType, selectedGroup, personalBudgets, groups]);

  const currentBudgets = getCurrentBudgets();

  // Get current members for group expenses
  const getCurrentMembers = useCallback(() => {
    return expenseType === 'group' && selectedGroup
      ? groups.find(g => g.id === selectedGroup)?.members || ["You"]
      : ["You"];
  }, [expenseType, selectedGroup, groups]);

  const currentMembers = getCurrentMembers();

  // Format currency with commas
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat().format(value);
  };

  // Reset form while maintaining context
  const resetForm = useCallback(() => {
    setExpenseName("");
    setCategory("");
    setAmount("");
    setNote("");
    setDate(new Date());
    setVoiceText("");
    
    if (groupId) {
      const group = groups.find(g => g.id === groupId);
      setPaidBy(group?.members?.[0] || "You");
    } else {
      setPaidBy("You");
    }
  }, [groupId, groups]);

  // Handle back navigation
  const handleBackPress = useCallback(() => {
    if (groupId) {
      router.push({
        pathname: "/(screens)/group-budget-details",
        params: { id: groupId }
      });
    } else {
      router.replace("/(tabs)/add-expense");
    }
  }, [groupId, router]);

  // Animation handlers
  const animateModalIn = useCallback(() => {
    setShowBudgetModal(true);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        damping: 10,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  const animateModalOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.9,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setShowBudgetModal(false));
  }, [scaleAnim, opacityAnim]);

  // Handle date picker changes
  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  // Voice input handlers
  const handleVoiceInput = useCallback(() => {
    if (isListening) {
      stopVoiceListening();
    } else {
      startVoiceListening();
    }
  }, [isListening]);

  const startVoiceListening = useCallback(() => {
    setIsListening(true);
    setVoiceText("Listening...");
    
    progressInterval.current = setInterval(() => {
      setVoiceProgress(prev => (prev >= 100 ? 0 : prev + 10));
    }, 300);
    
    setTimeout(() => {
      const mockCommands = [
        "Add 50 dollars for lunch under Food",
        "Log 25 dollars for bus fare under Transportation"
      ];
      const randomCommand = mockCommands[Math.floor(Math.random() * mockCommands.length)];
      setVoiceText(randomCommand);
      
      setTimeout(() => {
        stopVoiceListening();
        processVoiceCommand(randomCommand);
      }, 1500);
    }, 3000);
  }, []);

  const stopVoiceListening = useCallback(() => {
    setIsListening(false);
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    setVoiceProgress(0);
  }, []);

  const processVoiceCommand = useCallback((command: string) => {
    const amountMatch = command.match(/\d+/);
    const categoryMatch = command.match(/under\s(\w+)/i);
    
    if (amountMatch) setAmount(amountMatch[0]);
    
    if (categoryMatch) {
      const voiceCategory = categoryMatch[1];
      const matchedBudget = currentBudgets.find(b => 
        b.category.toLowerCase().includes(voiceCategory.toLowerCase())
      );
      if (matchedBudget) setCategory(matchedBudget.category);
    }
    
    const descriptionMatch = command.match(/for\s(.+?)\sunder/i) || 
                           command.match(/Add\s.+\sfor\s(.+)/i);
    if (descriptionMatch) setExpenseName(descriptionMatch[1].trim());
    
    setDate(new Date());
  }, [currentBudgets]);

  // Handle adding new budget
  const handleAddBudget = useCallback(() => {
    if (!newCategory.trim() || !newBudget) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    const parsedBudget = parseFloat(newBudget);
    if (isNaN(parsedBudget)) {
      Alert.alert("Error", "Please enter a valid budget amount");
      return;
    }

    const budgetsToCheck = getCurrentBudgets();
    const categoryExists = budgetsToCheck.some(
      (b: Budget) => b.category.toLowerCase() === newCategory.trim().toLowerCase()
    );
    
    if (categoryExists) {
      Alert.alert("Error", "Category already exists");
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      const newBudgetItem: Budget = {
        id: Math.random().toString(),
        category: newCategory.trim(),
        budget: parsedBudget,
        totalSpent: 0,
        remainingBalance: parsedBudget,
        groupId: expenseType === 'group' ? selectedGroup : undefined
      };

      if (expenseType === 'personal') {
        setPersonalBudgets([...personalBudgets, newBudgetItem]);
      } else if (selectedGroup) {
        setGroups(groups.map(group => 
          group.id === selectedGroup 
            ? { ...group, categories: [...group.categories, newBudgetItem] }
            : group
        ));
      }
      
      setNewCategory("");
      setNewBudget("");
      animateModalOut();
      setLoading(false);
      Alert.alert("Success", "Budget created successfully");
    }, 1000);
  }, [newCategory, newBudget, expenseType, selectedGroup, personalBudgets, groups]);

  // Handle saving expense
  const handleSave = useCallback(() => {
    if (!category) {
      Alert.alert("Error", "Please select a category");
      return;
    }

    if (expenseType === 'group' && !selectedGroup) {
      Alert.alert("Error", "Please select a group");
      return;
    }

    if (expenseType === 'group' && !paidBy) {
      Alert.alert("Error", "Please select who paid for this expense");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      Alert.alert("Invalid Amount", "Please enter a valid number for amount");
      return;
    }

    const selectedBudget = currentBudgets.find(b => b.category === category);
    if (selectedBudget && parsedAmount > selectedBudget.remainingBalance) {
      Alert.alert("Warning", `This expense exceeds your remaining budget of ${formatCurrency(selectedBudget.remainingBalance)}`);
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      if (expenseType === 'personal') {
        setPersonalBudgets(personalBudgets.map(b => 
          b.id === selectedBudget?.id 
            ? { 
                ...b, 
                totalSpent: b.totalSpent + parsedAmount,
                remainingBalance: b.remainingBalance - parsedAmount
              }
            : b
        ));
      } else if (selectedGroup) {
        setGroups(groups.map(group => 
          group.id === selectedGroup
            ? {
                ...group,
                categories: group.categories.map(b =>
                  b.id === selectedBudget?.id
                    ? {
                        ...b,
                        totalSpent: b.totalSpent + parsedAmount,
                        remainingBalance: b.remainingBalance - parsedAmount
                      }
                    : b
                )
              }
            : group
        ));
      }
      
      setRemainingBalance(prev => prev - parsedAmount);
      
      Alert.alert(
        "Success", 
        `Expense saved to ${expenseType === 'personal' ? 'personal' : groups.find(g => g.id === selectedGroup)?.name} budget!`
      );
      resetForm();
      setLoading(false);
      if (groupId) {
        router.back();
      }
    }, 1000);
  }, [category, amount, expenseType, selectedGroup, paidBy, currentBudgets, personalBudgets, groups]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  // Render expense type selector
  const renderExpenseTypeSelector = () => (
    <View className="mb-4">
      <Text className="text-md text-gray-700 mb-2" style={{ fontFamily: 'Poppins_500Medium' }}>
        Expense Type
      </Text>
      <View className="flex-row bg-[#E7F5E3] rounded-lg p-1">
        <TouchableOpacity
          className={`flex-1 py-3 rounded-md flex-row items-center justify-center ${expenseType === 'personal' ? 'bg-white' : ''}`}
          onPress={() => {
            setExpenseType('personal');
            setCategory("");
            setPaidBy("You");
          }}
          disabled={!!groupId}
        >
          <User size={18} color={expenseType === 'personal' ? '#1A3C34' : '#56756e'} className="mr-2" />
          <Text className={expenseType === 'personal' ? 'text-[#1A3C34]' : 'text-[#56756e]'} style={{ fontFamily: 'Poppins_500Medium' }}>
            Personal
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className={`flex-1 py-3 rounded-md flex-row items-center justify-center ${expenseType === 'group' ? 'bg-white' : ''}`}
          onPress={() => {
            setExpenseType('group');
            setCategory("");
            if (!groupId) {
              setSelectedGroup("");
            }
            setPaidBy("");
          }}
        >
          <Users size={18} color={expenseType === 'group' ? '#1A3C34' : '#56756e'} className="mr-2" />
          <Text className={expenseType === 'group' ? 'text-[#1A3C34]' : 'text-[#56756e]'} style={{ fontFamily: 'Poppins_500Medium' }}>
            Group
          </Text>
        </TouchableOpacity>
      </View>

      {expenseType === 'group' && !groupId && (
        <View className="mt-3">
          <Text className="text-md text-gray-700 mb-1" style={{ fontFamily: 'Poppins_500Medium' }}>
            Select Group
          </Text>
          <View className="bg-white rounded-lg border border-gray-300 py-1">
            <Picker
              selectedValue={selectedGroup}
              onValueChange={(itemValue) => {
                setSelectedGroup(itemValue);
                setCategory("");
              }}
              enabled={!loading}
            >
              <Picker.Item label="Select a group" value="" />
              {groups.map((group) => (
                <Picker.Item 
                  key={group.id} 
                  label={group.name} 
                  value={group.id} 
                />
              ))}
            </Picker>
          </View>
        </View>
      )}
    </View>
  );

  // Render paid by selector
  const renderPaidBySelector = () => (
    <View>
      <Text className="text-md text-gray-700 mb-1 mt-3" style={{ fontFamily: 'Poppins_500Medium' }}>
        Paid by
      </Text>
      <View className="bg-white rounded-lg border border-gray-300 py-1">
        <Picker
          selectedValue={paidBy}
          onValueChange={(itemValue) => setPaidBy(itemValue)}
          enabled={!loading && (expenseType === 'personal' || (expenseType === 'group' && !!selectedGroup))}
        >
          {expenseType === 'personal' ? (
            <Picker.Item label="You" value="You" />
          ) : (
            currentMembers.map((member) => (
              <Picker.Item 
                key={member} 
                label={member} 
                value={member} 
              />
            ))
          )}
        </Picker>
      </View>
    </View>
  );

  // Render voice input
  const renderVoiceInput = () => (
    <View className="bg-[#E7F5E3] p-4 py-6 rounded-2xl mb-4 mt-4">
      <TouchableOpacity 
        className="flex-row justify-between items-center"
        onPress={handleVoiceInput}
        disabled={loading}
      >
        <View className="flex-1">
          <Text className="text-[#1A3C34] text-md" style={{ fontFamily: 'Poppins_500Medium' }}>
            {isListening ? "Listening..." : "Use Voice Input"}
          </Text>
          {voiceText && (
            <Text className="text-sm text-[#56756e] mt-1" style={{ fontFamily: 'Poppins_400Regular' }}>
              {voiceText}
            </Text>
          )}
        </View>
        <View className="relative">
          <Mic 
            size={24} 
            color={isListening ? "#FF3B30" : "#1A3C34"} 
            fill={isListening ? "#FF3B30" : "none"}
          />
          {isListening && (
            <View 
              className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white"
              style={{
                shadowColor: "#FF3B30",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.5,
                shadowRadius: 2,
                elevation: 2,
              }}
            />
          )}
        </View>
      </TouchableOpacity>
      
      {isListening && (
        <View className="h-1 bg-gray-200 rounded-full mt-2">
          <View 
            className="h-full bg-[#1A3C34] rounded-full" 
            style={{ width: `${voiceProgress}%` }}
          />
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-white"
      keyboardVerticalOffset={80}
    >
      <ScrollView 
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={resetForm}
            colors={["#1A3C34"]}
            tintColor="#1A3C34"
          />
        }
      >

        <Text className="text-1xl mb-5 mt-2 text-center text-[#1A3C34] border-b border-gray-100 pb-4" style={{ fontFamily: 'Poppins_600SemiBold' }}>
          {expenseType === 'group' && selectedGroup 
            ? `Add Expense to ${groupName || "Group"}`
            : "Add New Expense"}
        </Text>

        {renderExpenseTypeSelector()}

        {expenseType === 'personal' && (
          <TouchableOpacity 
            className="bg-[#E7F5E3] p-4 py-6 rounded-2xl mb-4 flex-row justify-between items-center"
            onPress={animateModalIn}
            disabled={loading}
          >
            <Text className="text-[#1A3C34] text-md" style={{ fontFamily: 'Poppins_500Medium' }}>Add Budget</Text>
            <PlusCircle size={24} color="#1A3C34" />
          </TouchableOpacity>
        )}

        <Modal
          visible={showBudgetModal}
          transparent={true}
          animationType="fade"
          onRequestClose={animateModalOut}
        >
          <View className="flex-1 justify-center items-center bg-black/30">
            <Animated.View 
              className="bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-lg"
              style={{
                transform: [{ scale: scaleAnim }],
                opacity: opacityAnim,
              }}
            >
              <View className="flex-row justify-center mb-4">
                <Text className="text-xl font-bold text-[#1A3C34]">
                  Add New Budget
                </Text>
              </View>

              <View className="mb-4 bg-[#F5F5F5] p-4 rounded-lg">
                <Text className="text-md text-[#1A3C34] mb-1">
                  Monthly Income: {currency} {formatCurrency(monthlyIncome)}
                </Text>
                <Text className="text-md text-[#1A3C34]">
                  Remaining Balance: {currency} {formatCurrency(remainingBalance)}
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
                  placeholder={`e.g. ${formatCurrency(1000)}`}
                  value={newBudget}
                  onChangeText={setNewBudget}
                  keyboardType="numeric"
                  className="bg-white rounded-lg px-4 py-3 border border-gray-200"
                />
              </View>

              <View className="flex-row justify-between gap-4">
                <TouchableOpacity
                  className="flex-1 bg-gray-100 px-6 py-3 rounded-lg items-center"
                  onPress={animateModalOut}
                >
                  <Text className="text-[#1A3C34]">
                    Cancel
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  className="flex-1 bg-[#B2EA71] px-6 py-3 rounded-lg items-center"
                  onPress={handleAddBudget}
                  disabled={loading || !newCategory || !newBudget}
                >
                  {loading ? (
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

        <View className="bg-[#E7F5E3] p-4 rounded-2xl shadow-sm space-y-4">
          <View>
            <Text className="text-md text-gray-700 mb-1 mt-3" style={{ fontFamily: 'Poppins_500Medium' }}>Expense Name</Text>
            <TextInput
              value={expenseName}
              onChangeText={setExpenseName}
              placeholder="e.g. Grocery run"
              className="bg-white rounded-lg px-4 py-6 border border-gray-300"
              editable={!loading}
            />
          </View>

          <View>
            <Text className="text-md text-gray-700 mb-1 mt-3" style={{ fontFamily: 'Poppins_500Medium' }}>Category</Text>
            <View className="bg-white rounded-lg border border-gray-300 py-1">
              {currentBudgets.length > 0 ? (
                <Picker
                  selectedValue={category}
                  onValueChange={(itemValue) => setCategory(itemValue)}
                  enabled={!loading}
                >
                  <Picker.Item label="Select a category" value="" />
                  {currentBudgets.map((budget) => (
                    <Picker.Item 
                      key={budget.id} 
                      label={`${budget.category} (${formatCurrency(budget.remainingBalance)} remaining)`} 
                      value={budget.category} 
                    />
                  ))}
                </Picker>
              ) : (
                <View className="py-4 px-4">
                  <Text className="text-gray-500 text-center" style={{ fontFamily: 'Poppins_400Regular' }}>
                    {expenseType === 'personal' 
                      ? "No categories available. Add a budget to create categories."
                      : selectedGroup 
                        ? "This group has no categories yet."
                        : "Please select a group first."}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {renderPaidBySelector()}

          <View>
            <Text className="text-md text-gray-700 mb-1 mt-3" style={{ fontFamily: 'Poppins_500Medium' }}>Total Amount</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder={`e.g. 500 `}
              keyboardType="numeric"
              className="bg-white rounded-lg px-4 py-6 border border-gray-300"
              editable={!loading}
            />
          </View>

          <View>
            <Text className="text-md text-gray-700 mb-1 mt-3" style={{ fontFamily: 'Poppins_500Medium' }}>Date</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="bg-white rounded-lg px-4 py-6 border border-gray-300"
              disabled={loading}
            >
              <Text className="text-gray-800">{date.toLocaleDateString()}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onChangeDate}
              />
            )}
          </View>

          <View>
            <Text className="text-md text-gray-700 mb-1 mt-3" style={{ fontFamily: 'Poppins_500Medium' }}>Note</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Optional note"
              multiline
              className="bg-white rounded-lg px-4 py-2 border border-gray-300 h-20 text-base"
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            className="bg-[#B2EA71] rounded-lg py-3 mt-6 mb-3"
            onPress={handleSave}
            disabled={!category || currentBudgets.length === 0 || loading || 
                     (expenseType === 'group' && (!selectedGroup || !paidBy))}
          >
            {loading ? (
              <ActivityIndicator color="#133C13" />
            ) : (
              <Text className="text-[#133C13] text-center text-md" style={{ fontFamily: 'Poppins_500Medium' }}>
                {expenseType === 'personal' ? 'Save Personal Expense' : 'Save to Group'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {renderVoiceInput()}

        <Text className="text-[#56756e] text-sm text-center" style={{ fontFamily: 'Poppins_500Medium' }}>Use Scan for Receipts</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}