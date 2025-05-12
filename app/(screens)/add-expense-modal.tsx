import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, Modal, Animated, Dimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Users, User, PlusCircle, Mic, ScanText, Camera, Flashlight, ChevronDown } from "lucide-react-native";
import { useState, useRef } from "react";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from "@react-native-picker/picker";

const { width } = Dimensions.get("window");

export default function AddExpenseModal() {
  const router = useRouter();
  const { groupId, groupName } = useLocalSearchParams<{
    groupId: string;
    groupName: string;
  }>();

  // State management
  const [expenseName, setExpenseName] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [paidBy, setPaidBy] = useState("You");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [voiceProgress, setVoiceProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout>();

  // Receipt Scanner Modal State
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [scanResult, setScanResult] = useState("");
  const [processing, setProcessing] = useState(false);
  const scanLinePos = useRef(new Animated.Value(0)).current;

  // Sample data - replace with your actual data source
  const groupMembers = ["You", "Member 1", "Member 2", "Member 3"];
  const categories = [
    { id: "1", name: "Groceries", remaining: 1800 },
    { id: "2", name: "Utilities", remaining: 1200 },
    { id: "3", name: "Entertainment", remaining: 500 },
  ];

  const handleSave = () => {
    setLoading(true);
    // Your save logic here
    setTimeout(() => {
      Alert.alert("Success", "Expense added successfully!");
      router.back();
      setLoading(false);
    }, 1000);
  };

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
    
    progressInterval.current = setInterval(() => {
      setVoiceProgress(prev => (prev >= 100 ? 0 : prev + 10));
    }, 300);
    
    setTimeout(() => {
      const mockCommands = [
        "Add 50 dollars for lunch under Groceries",
        "Log 25 dollars for electricity under Utilities"
      ];
      const randomCommand = mockCommands[Math.floor(Math.random() * mockCommands.length)];
      setVoiceText(randomCommand);
      
      setTimeout(() => {
        stopVoiceListening();
        processVoiceCommand(randomCommand);
      }, 1500);
    }, 3000);
  };

  const stopVoiceListening = () => {
    setIsListening(false);
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    setVoiceProgress(0);
  };

  const processVoiceCommand = (command: string) => {
    const amountMatch = command.match(/\d+/);
    const categoryMatch = command.match(/under\s(\w+)/i);
    
    if (amountMatch) setAmount(amountMatch[0]);
    
    if (categoryMatch) {
      const voiceCategory = categoryMatch[1];
      const matchedCategory = categories.find(cat => 
        cat.name.toLowerCase().includes(voiceCategory.toLowerCase())
      );
      if (matchedCategory) setCategory(matchedCategory.name);
    }
    
    const descriptionMatch = command.match(/for\s(.+?)\sunder/i) || 
                           command.match(/Add\s.+\sfor\s(.+)/i);
    if (descriptionMatch) setExpenseName(descriptionMatch[1].trim());
    
    setDate(new Date());
  };

  // Scanner functions
  const startScan = () => {
    setIsScanning(true);
    setProcessing(false);
    setScanResult("");
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLinePos, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLinePos, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    setTimeout(() => {
      stopScan();
      processReceipt();
    }, 3000);
  };

  const stopScan = () => {
    setIsScanning(false);
    scanLinePos.stopAnimation();
  };

  const processReceipt = () => {
    setProcessing(true);
    
    setTimeout(() => {
      const mockResults = [
        "Starbucks - $4.50 (Coffee)",
        "Walmart - $28.75 (Groceries)",
        "Shell Gas - $42.30 (Fuel)"
      ];
      const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
      setScanResult(randomResult);
      setProcessing(false);
      
      // Auto-fill form from receipt data
      const [vendor, amountAndCategory] = randomResult.split(" - ");
      const [amountStr, categoryStr] = amountAndCategory.split(" (");
      const category = categoryStr.replace(")", "");
      
      setExpenseName(vendor);
      setAmount(amountStr.replace("$", ""));
      const matchedCategory = categories.find(cat => 
        cat.name.toLowerCase().includes(category.toLowerCase())
      );
      if (matchedCategory) setCategory(matchedCategory.name);
    }, 2000);
  };

  const resetScan = () => {
    setScanResult("");
    setProcessing(false);
    setShowScannerModal(false);
  };

  return (
    <View className="flex-1 bg-white">
      {/* Custom Header */}
      <View className="pt-12 pb-4 px-5 bg-white border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="p-2 -ml-2 mr-4"
          >
            <ArrowLeft size={24} color="#1A3C34" />
          </TouchableOpacity>
          <Text className="text-xl text-[#1A3C34]" style={{ fontFamily: 'Poppins_600SemiBold' }}>
            Add to {groupName || "Group"}
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-5 pt-5" contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Paid By Selector */}
        <View className="mb-4">
          <Text className="text-md text-gray-700 mb-2" style={{ fontFamily: 'Poppins_500Medium' }}>
            Paid by
          </Text>
          <View className="bg-white rounded-lg border border-gray-300 py-1">
            <Picker
              selectedValue={paidBy}
              onValueChange={setPaidBy}
            >
              {groupMembers.map(member => (
                <Picker.Item key={member} label={member} value={member} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Expense Name */}
        <View className="mb-4">
          <Text className="text-md text-gray-700 mb-2" style={{ fontFamily: 'Poppins_500Medium' }}>
            Expense Name
          </Text>
          <TextInput
            placeholder="e.g. Grocery shopping"
            value={expenseName}
            onChangeText={setExpenseName}
            className="bg-white rounded-lg px-4 py-3 border border-gray-300"
          />
        </View>

        {/* Category Selector */}
        <View className="mb-4">
          <Text className="text-md text-gray-700 mb-2" style={{ fontFamily: 'Poppins_500Medium' }}>
            Category
          </Text>
          <View className="bg-white rounded-lg border border-gray-300 py-1">
            <Picker
              selectedValue={category}
              onValueChange={setCategory}
            >
              <Picker.Item label="Select a category" value="" />
              {categories.map(cat => (
                <Picker.Item 
                  key={cat.id} 
                  label={`${cat.name} (₱${cat.remaining})`} 
                  value={cat.name} 
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Amount */}
        <View className="mb-4">
          <Text className="text-md text-gray-700 mb-2" style={{ fontFamily: 'Poppins_500Medium' }}>
            Amount
          </Text>
          <TextInput
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            className="bg-white rounded-lg px-4 py-3 border border-gray-300"
          />
        </View>

        {/* Date Picker */}
        <View className="mb-4">
          <Text className="text-md text-gray-700 mb-2" style={{ fontFamily: 'Poppins_500Medium' }}>
            Date
          </Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="bg-white rounded-lg px-4 py-3 border border-gray-300"
          >
            <Text>{date.toLocaleDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}
        </View>

        {/* Notes */}
        <View className="mb-6">
          <Text className="text-md text-gray-700 mb-2" style={{ fontFamily: 'Poppins_500Medium' }}>
            Notes (Optional)
          </Text>
          <TextInput
            placeholder="Add any additional details"
            value={note}
            onChangeText={setNote}
            multiline
            className="bg-white rounded-lg px-4 py-3 border border-gray-300 h-20"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          className="bg-[#133C13] rounded-lg py-4 items-center mb-3"
          onPress={handleSave}
          disabled={loading || !category || !amount || !expenseName}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-lg" style={{ fontFamily: 'Poppins_600SemiBold' }}>
              Save Expense
            </Text>
          )}
        </TouchableOpacity>

        <View className="my-4 mx-4 border-t border-gray-200" />

        {/* Voice Input */}
        <View className="bg-[#E7F5E3] p-4 py-6 rounded-2xl mb-2">
          <TouchableOpacity 
            className="flex-row justify-between items-center"
            onPress={handleVoiceInput}
            disabled={loading}
          >
            <View className="flex-1">
              <Text className="text-[#1A3C34] text-md" style={{ fontFamily: 'Poppins_600SemiBold' }}>
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

        {/* Receipt Scanner Button */}
        <TouchableOpacity 
          className="bg-[#E7F5E3] p-4 py-6 rounded-2xl mb-4 mt-4 flex-row justify-between items-center shadow-sm"
          onPress={() => setShowScannerModal(true)}
        >
          <Text className="text-[#1A3C34] text-md" style={{ fontFamily: 'Poppins_600SemiBold' }}>
            Receipt Scanner
          </Text>
          <ScanText size={23} color="#1A3C34" />
        </TouchableOpacity>
      </ScrollView>

      {/* Receipt Scanner Modal */}
      <Modal
        visible={showScannerModal}
        animationType="slide"
        onRequestClose={resetScan}
      >
        <View className="flex-1 bg-white p-5">
          {/* Header - Already correct */}
          <View className="flex-row justify-between items-center mb-6">
            <TouchableOpacity onPress={resetScan}>
              <ArrowLeft size={24} color="#1A3C34" />
            </TouchableOpacity>
            <Text className="text-xl text-[#1A3C34]" style={{ fontFamily: 'Poppins_600SemiBold' }}>
              Receipt Scanner
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Scanner View - Fixed corner borders */}
          <View className={`w-full aspect-square rounded-2xl overflow-hidden mb-8 justify-center items-center ${isScanning ? 'bg-black' : 'bg-gray-100 border-2 border-dashed border-gray-300'}`}>
            {isScanning ? (
              <View className="w-full h-full justify-center items-center">
                {/* Scanner frame */}
                <View className="w-4/5 h-3/5 border-2 border-white/30 rounded-lg overflow-hidden relative">
                  {/* Animated scan line */}
                  <Animated.View 
                    className="absolute h-0.5 w-full bg-red-500"
                    style={{
                      transform: [{
                        translateY: scanLinePos.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, width * 0.8 - 4]
                        })
                      }]
                    }}
                  />
                  
                  {/* Corner borders - Replaced with absolute positioned Views */}
                  <View className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#1A3C34] rounded-tl-lg" />
                  <View className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#1A3C34] rounded-tr-lg" />
                  <View className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#1A3C34] rounded-bl-lg" />
                  <View className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#1A3C34] rounded-br-lg" />
                </View>
                
                {/* Flashlight button */}
                <TouchableOpacity 
                  className="absolute top-5 right-5 bg-black/50 p-3 rounded-full"
                  onPress={() => setFlashOn(!flashOn)}
                >
                  <Flashlight 
                    size={24} 
                    color={flashOn ? "#FFD700" : "white"} 
                    fill={flashOn ? "#FFD700" : "none"}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <View className="w-full h-full justify-center items-center">
                <Camera size={48} color="#9CA3AF" />
                <Text className="text-gray-400 mt-4" style={{ fontFamily: 'Poppins_500Medium' }}>
                  Align receipt within frame
                </Text>
              </View>
            )}
          </View>

          {/* Scan result - Already correct */}
          {scanResult ? (
            <View className="w-full bg-[#E7F5E3] p-5 rounded-xl mb-5">
              <Text className="text-lg font-bold text-[#1A3C34] mb-2" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                Scanned Receipt:
              </Text>
              <Text className="text-base text-[#56756e] mb-5" style={{ fontFamily: 'Poppins_400Regular' }}>
                {scanResult}
              </Text>
              
              <View className="flex-row justify-between">
                <TouchableOpacity 
                  className="flex-1 bg-[#B2EA71] py-3 rounded-full mx-1 justify-center items-center"
                  onPress={() => {
                    resetScan();
                    setShowScannerModal(false);
                  }}
                >
                  <Text className="text-[#133C13] font-medium" style={{ fontFamily: 'Poppins_500Medium' }}>
                    Use This Data
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className="flex-1 bg-[#E7F5E3] py-3 rounded-full mx-1 justify-center items-center border border-[#1A3C34]"
                  onPress={resetScan}
                >
                  <Text className="text-[#133C13] font-medium" style={{ fontFamily: 'Poppins_500Medium' }}>
                    Scan Again
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : processing ? (
            <View className="items-center mb-5">
              <ActivityIndicator size="large" color="#1A3C34" />
              <Text className="text-[#1A3C34] mt-3" style={{ fontFamily: 'Poppins_500Medium' }}>
                Processing receipt...
              </Text>
            </View>
          ) : (
            <TouchableOpacity 
              className="w-full bg-[#133C13] py-4 rounded-full flex-row justify-center items-center"
              onPress={startScan}
              disabled={isScanning}
            >
              <Camera size={24} color="white" />
              <Text className="text-white ml-2 text-lg" style={{ fontFamily: 'Poppins_500Medium' }}>
                {isScanning ? "Scanning..." : "Scan Receipt"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>
    </View>
  );
}