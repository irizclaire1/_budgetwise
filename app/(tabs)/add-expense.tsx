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
import { PlusCircle, Mic } from "lucide-react-native";

interface Budget {
  id: string;
  category: string;
  budget: number;
  totalSpent: number;
  remainingBalance: number;
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
  // Form state
  const [expenseName, setExpenseName] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Budget modal state
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newBudget, setNewBudget] = useState("");
  
  // Financial data
  const [monthlyIncome, setMonthlyIncome] = useState(10000);
  const [remainingBalance, setRemainingBalance] = useState(7500);
  const [budgets, setBudgets] = useState<Budget[]>([
    {
      id: "1",
      category: "Food",
      budget: 2000,
      totalSpent: 500,
      remainingBalance: 1500
    },
    {
      id: "2",
      category: "Transportation",
      budget: 1000,
      totalSpent: 300,
      remainingBalance: 700
    }
  ]);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currency, setCurrency] = useState("₱");
  
  // Voice input state
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [voiceProgress, setVoiceProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout>();

  // Animation values for modal
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Reset all form fields
  const resetForm = () => {
    setExpenseName("");
    setCategory("");
    setAmount("");
    setNote("");
    setDate(new Date());
    setVoiceText("");
  };

  // Refresh function
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    resetForm();
    
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat().format(value);
  };

  // Modal animation handlers
  const animateModalIn = () => {
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
  };

  const animateModalOut = () => {
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
  };

  // Voice input handlers
  const handleVoiceInput = () => {
    if (isListening) {
      stopVoiceListening();
    } else {
      startVoiceListening();
    }
  };

  const startVoiceListening = () => {
    setIsListening(true);
    setVoiceText("Listening...");
    
    // Simulate progress while "listening"
    progressInterval.current = setInterval(() => {
      setVoiceProgress(prev => (prev >= 100 ? 0 : prev + 10));
    }, 300);
    
    // After 3 seconds, simulate a voice command
    setTimeout(() => {
      const mockCommands = [
        "Add 50 dollars for lunch under Food",
        "Log 25 dollars for bus fare under Transportation",
        "Record 15 dollars for coffee under Food",
        "Expense 30 dollars for parking under Transportation",
        "Add 12 dollars for snacks under Food"
      ];
      const randomCommand = mockCommands[Math.floor(Math.random() * mockCommands.length)];
      setVoiceText(randomCommand);
      
      // Auto-process after showing the command
      setTimeout(() => {
        stopVoiceListening();
        processVoiceCommand(randomCommand);
      }, 1500);
    }, 3000);
  };

  const stopVoiceListening = () => {
    setIsListening(false);
    clearInterval(progressInterval.current);
    setVoiceProgress(0);
  };

  const processVoiceCommand = (command: string) => {
    // Simple mock parser
    const amountMatch = command.match(/\d+/);
    const categoryMatch = command.match(/under\s(\w+)/i);
    
    if (amountMatch) {
      setAmount(amountMatch[0]);
    }
    
    if (categoryMatch) {
      const voiceCategory = categoryMatch[1];
      const matchedBudget = budgets.find(b => 
        b.category.toLowerCase().includes(voiceCategory.toLowerCase())
      );
      if (matchedBudget) {
        setCategory(matchedBudget.category);
      }
    }
    
    // Set a mock expense name
    const descriptionMatch = command.match(/for\s(.+?)\sunder/i) || 
                           command.match(/Add\s.+\sfor\s(.+)/i);
    if (descriptionMatch) {
      setExpenseName(descriptionMatch[1].trim());
    }
    
    // Auto-set current date
    setDate(new Date());
  };

  // Budget management
  const handleAddBudget = () => {
    if (!newCategory.trim() || !newBudget) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    const parsedBudget = parseFloat(newBudget);
    if (isNaN(parsedBudget)) {
      Alert.alert("Error", "Please enter a valid budget amount");
      return;
    }

    const categoryExists = budgets.some(
      b => b.category.toLowerCase() === newCategory.trim().toLowerCase()
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
        remainingBalance: parsedBudget
      };
      
      setBudgets([...budgets, newBudgetItem]);
      setNewCategory("");
      setNewBudget("");
      animateModalOut();
      setLoading(false);
      Alert.alert("Success", "Budget created successfully");
    }, 1000);
  };

  // Date picker handler
  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  // Expense submission
  const handleSave = () => {
    if (!category) {
      Alert.alert("Error", "Please select a category.");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      Alert.alert("Invalid Amount", "Please enter a valid number for amount.");
      return;
    }

    const selectedBudget = budgets.find(b => b.category === category);
    if (selectedBudget && parsedAmount > selectedBudget.remainingBalance) {
      Alert.alert("Warning", `This expense exceeds your remaining budget of ${formatCurrency(selectedBudget.remainingBalance)}`);
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      if (selectedBudget) {
        setBudgets(budgets.map(b => 
          b.id === selectedBudget.id 
            ? { 
                ...b, 
                totalSpent: b.totalSpent + parsedAmount,
                remainingBalance: b.remainingBalance - parsedAmount
              }
            : b
        ));
      }
      
      setRemainingBalance(prev => prev - parsedAmount);
      
      Alert.alert("Success", "Expense saved successfully!");
      resetForm(); // Clear all fields including voice text
      setLoading(false);
    }, 1000);
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  // Render voice input section
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
            onRefresh={onRefresh}
            colors={["#1A3C34"]}
            tintColor="#1A3C34"
          />
        }
      >
        <Text className="text-1xl mb-5 mt-2 text-center text-[#1A3C34]" style={{ fontFamily: 'Poppins_600SemiBold' }}>
          Add New Expense
        </Text>

        <TouchableOpacity 
          className="bg-[#E7F5E3] p-4 py-6 rounded-2xl mb-4 flex-row justify-between items-center"
          onPress={animateModalIn}
          disabled={loading}
        >
          <Text className="text-[#1A3C34] text-md" style={{ fontFamily: 'Poppins_500Medium' }}>Add Budget</Text>
          <PlusCircle size={24} color="#1A3C34" />
        </TouchableOpacity>

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
              {budgets.length > 0 ? (
                <Picker
                  selectedValue={category}
                  onValueChange={(itemValue) => setCategory(itemValue)}
                  enabled={!loading}
                >
                  <Picker.Item label="Select a category" value="" />
                  {budgets.map((budget) => (
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
                    No categories available. Add a budget to create categories.
                  </Text>
                </View>
              )}
            </View>
          </View>

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
            disabled={!category || budgets.length === 0 || loading}
          >
            {loading ? (
              <ActivityIndicator color="#133C13" />
            ) : (
              <Text className="text-[#133C13] text-center text-md" style={{ fontFamily: 'Poppins_500Medium' }}>
                Save
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