import { useState, useRef } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Animated, 
  Dimensions,
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView
} from "react-native";
import { Camera, Flashlight, User, Users, ChevronDown } from "lucide-react-native";

const { width } = Dimensions.get("window");

// Mock groups data
const mockGroups = [
  { id: "1", name: "Roommates" },
  { id: "2", name: "Family" },
  { id: "3", name: "Work Team" },
];

export default function Scan() {
  const [isScanning, setIsScanning] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [scanResult, setScanResult] = useState("");
  const [processing, setProcessing] = useState(false);
  const [expenseType, setExpenseType] = useState<"personal" | "group">("personal");
  const [selectedGroup, setSelectedGroup] = useState(mockGroups[0]);
  const [showGroupPicker, setShowGroupPicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const scanLinePos = useRef(new Animated.Value(0)).current;

  const onRefresh = () => {
    setRefreshing(true);
    resetScan();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

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
        "Starbucks - ₱150 (Coffee)",
        "SuperMarket - ₱500 (Groceries)",
        "Shell Gas - ₱1000 (Fuel)"
      ];
      const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
      setScanResult(randomResult);
      setProcessing(false);
    }, 2000);
  };

  const resetScan = () => {
    setScanResult("");
    setProcessing(false);
    setExpenseType("personal");
  };

  const handleSave = () => {
    Alert.alert(
      "Expense Saved", 
      expenseType === "personal" 
        ? "Saved as Personal expense" 
        : `Saved to ${selectedGroup.name} group`,
      [{ text: "OK", onPress: resetScan }]
    );
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#1A3C34"]}
          tintColor="#1A3C34"
        />
      }
    >
      <View className="flex-1 bg-white p-5 items-center">
        <Text className="text-2xl font-bold text-[#1A3C34] mb-5" style={{ fontFamily: 'Poppins_600SemiBold' }}>
          Receipt Scanner
        </Text>

        {/* Expense Type Selector */}
        <View className="flex-row justify-center mb-6 w-full">
          <TouchableOpacity
            className={`flex-1 py-3 rounded-l-2xl border ${expenseType === "personal" ? "bg-[#133C13] border-[#133C13]" : "bg-white border-gray-300"}`}
            onPress={() => setExpenseType("personal")}
          >
            <View className="flex-row items-center justify-center">
              <User size={20} color={expenseType === "personal" ? "white" : "#1A3C34"} />
              <Text className={`ml-2 ${expenseType === "personal" ? "text-white" : "text-[#1A3C34]"}`} style={{ fontFamily: 'Poppins_500Medium' }}>
                Personal
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            className={`flex-1 py-3 rounded-r-2xl border ${expenseType === "group" ? "bg-[#133C13] border-[#133C13]" : "bg-white border-gray-300"}`}
            onPress={() => setExpenseType("group")}
          >
            <View className="flex-row items-center justify-center">
              <Users size={20} color={expenseType === "group" ? "white" : "#1A3C34"} />
              <Text className={`ml-2 ${expenseType === "group" ? "text-white" : "text-[#1A3C34]"}`} style={{ fontFamily: 'Poppins_500Medium' }}>
                Group
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Group Selector (only shown when group is selected) */}
        {expenseType === "group" && (
          <TouchableOpacity 
            className="w-full mb-6 border border-gray-300 rounded-2xl p-3 flex-row justify-between items-center"
            onPress={() => setShowGroupPicker(true)}
          >
            <View className="flex-row items-center">
              <Users size={20} color="#1A3C34" className="mr-2" />
              <Text className="text-[#1A3C34]" style={{ fontFamily: 'Poppins_500Medium' }}>
                {selectedGroup.name}
              </Text>
            </View>
            <ChevronDown size={20} color="#1A3C34" />
          </TouchableOpacity>
        )}
        
        {/* Scanner View - No placeholder image */}
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
                
                {/* Corner borders */}
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
        
        {/* Scan result */}
        {scanResult ? (
          <View className="w-full bg-[#E7F5E3] p-5 rounded-xl mt-5">
            <Text className="text-lg font-bold text-[#1A3C34] mb-2" style={{ fontFamily: 'Poppins_600SemiBold' }}>
              Scanned Receipt:
            </Text>
            <Text className="text-base text-[#56756e] mb-5" style={{ fontFamily: 'Poppins_400Regular' }}>
              {scanResult}
            </Text>
            
            <View className="flex-row justify-between">
              <TouchableOpacity 
                className="flex-1 bg-[#B2EA71] py-3 rounded-full mx-1 justify-center items-center"
                onPress={handleSave}
              >
                <Text className="text-[#133C13] font-medium" style={{ fontFamily: 'Poppins_500Medium' }}>
                  {expenseType === "personal" ? "Save Expense" : `Save to ${selectedGroup.name}`}
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
          <View className="items-center mt-5">
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

        {/* Group Picker Modal */}
        <Modal
          visible={showGroupPicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowGroupPicker(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/30 p-5">
            <View className="w-full bg-white rounded-2xl p-5">
              <Text className="text-lg font-bold text-[#1A3C34] mb-4" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                Select Group
              </Text>
              
              {mockGroups.map(group => (
                <TouchableOpacity
                  key={group.id}
                  className={`py-3 px-4 border-b border-gray-100 ${selectedGroup.id === group.id ? 'bg-[#E7F5E3]' : ''}`}
                  onPress={() => {
                    setSelectedGroup(group);
                    setShowGroupPicker(false);
                  }}
                >
                  <Text className="text-[#1A3C34]" style={{ fontFamily: 'Poppins_500Medium' }}>
                    {group.name}
                  </Text>
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity
                className="mt-4 py-3 bg-gray-100 rounded-lg items-center"
                onPress={() => setShowGroupPicker(false)}
              >
                <Text className="text-[#1A3C34]" style={{ fontFamily: 'Poppins_500Medium' }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}