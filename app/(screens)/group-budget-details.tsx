import { Link, useRouter, useLocalSearchParams } from "expo-router";
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, TextInput, Alert, Modal } from "react-native";
import { ChevronRight, Bot, Settings as SettingsIcon, PlusCircle, Users, ArrowLeft, MoreHorizontal, X } from "lucide-react-native";
import { useState } from "react";
import * as Progress from 'react-native-progress';
import { Menu, MenuOptions, MenuOption, MenuTrigger, MenuProvider } from 'react-native-popup-menu';
import Animated, { useSharedValue, withTiming, useAnimatedStyle, Easing } from 'react-native-reanimated';

interface GroupData {
  id: string;
  groupName: string;
  totalBudget: number;
  totalSpent: number;
  members: number;
  currency: string;
  remainingBalance: number;
  membersList: string[];
}

const mockGroups: GroupData[] = [
  {
    id: "1",
    groupName: "Family Budget",
    totalBudget: 50000,
    totalSpent: 25000,
    members: 4,
    currency: "PHP",
    remainingBalance: 25000,
    membersList: ["You", "Maria", "John", "Luis"]
  },
  {
    id: "2",
    groupName: "Roommate Expenses",
    totalBudget: 30000,
    totalSpent: 18000,
    members: 3,
    currency: "PHP",
    remainingBalance: 12000,
    membersList: ["You", "Anna", "Mike"]
  },
  {
    id: "3",
    groupName: "Project Team",
    totalBudget: 20000,
    totalSpent: 5000,
    members: 5,
    currency: "PHP",
    remainingBalance: 15000,
    membersList: ["You", "Sarah", "Tom", "Emma", "Liam"]
  }
];

const currencySymbols: { [key: string]: string } = {
  PHP: "₱",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
};

export default function GroupScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [refreshing, setRefreshing] = useState(false);
  const [addBudgetModalVisible, setAddBudgetModalVisible] = useState(false);
  const [editBudgetModalVisible, setEditBudgetModalVisible] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  const [groups, setGroups] = useState(mockGroups);

  // Animation values
  const scale = useSharedValue(0.95);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const toggleModalAnimation = (visible: boolean) => {
    scale.value = withTiming(visible ? 1 : 0.95, {
      duration: 200,
      easing: Easing.out(Easing.ease),
    });
  };

  // Format number with commas for display
  const formatNumberInput = (value: string) => {
    // Remove all non-digit characters except commas
    const num = value.replace(/[^\d,]/g, '');
    // Remove existing commas to avoid duplicates
    const numWithoutCommas = num.replace(/,/g, '');
    // Add commas for thousands
    return numWithoutCommas.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Parse formatted number back to numeric value
  const parseFormattedNumber = (value: string) => {
    return parseFloat(value.replace(/,/g, '')) || 0;
  };

  // Ensure id is a string
  const groupId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : "1";
  const groupData = groups.find(group => group.id === groupId) || groups[0];

  // Group financial data
  const totalContributions = groupData.totalBudget;
  const totalExpenses = groupData.totalSpent;
  const groupBalance = totalContributions - totalExpenses;
  const spendingPercentage = (totalExpenses / totalContributions) * 100;
  const spendingColor = spendingPercentage > 100 ? 'text-red-500' : 'text-[#133C13]';
  const currencySymbol = currencySymbols[groupData.currency] || groupData.currency;

  const getFinancialAdvice = () => {
    if (spendingPercentage > 100) {
      return {
        title: "Budget Exceeded!",
        message: `Your group has spent ${currencySymbol}${(totalExpenses - totalContributions).toLocaleString()} more than your budget. Consider:\n• Reviewing recent expenses\n• Setting spending limits\n• Having members contribute more`,
        color: "#EF4444"
      };
    } else if (spendingPercentage > 80) {
      return {
        title: "Approaching Limit",
        message: "Your group is close to its budget limit. Suggestions:\n• Plan lower-cost activities\n• Track expenses more closely\n• Consider weekly spending check-ins",
        color: "#F59E0B"
      };
    } else if (spendingPercentage > 50) {
      return {
        title: "Moderate Spending",
        message: "Your group has used half the budget. Tips:\n• Compare spending to previous months\n• Identify any unusual expenses\n• Celebrate staying on track!",
        color: "#133C13"
      };
    } else {
      return {
        title: "Good Progress",
        message: "Your group is managing finances well. Recommendations:\n• Continue tracking all expenses\n• Consider saving surplus funds\n• Review your contribution amounts",
        color: "#133C13"
      };
    }
  };

  const financialAdvice = getFinancialAdvice();

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleAddBudget = () => {
    const newBudget = parseFormattedNumber(budgetInput);
    if (newBudget <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid budget amount.");
      return;
    }

    setGroups(prevGroups =>
      prevGroups.map(group =>
        group.id === groupId
          ? {
              ...group,
              totalBudget: group.totalBudget + newBudget,
              remainingBalance: group.remainingBalance + newBudget
            }
          : group
      )
    );
    setAddBudgetModalVisible(false);
    setBudgetInput('');
  };

  const handleEditBudget = () => {
    const newBudget = parseFormattedNumber(budgetInput);
    if (newBudget < groupData.totalSpent) {
      Alert.alert("Invalid Input", "Please enter a valid budget amount greater than or equal to total spent.");
      return;
    }

    setGroups(prevGroups =>
      prevGroups.map(group =>
        group.id === groupId
          ? {
              ...group,
              totalBudget: newBudget,
              remainingBalance: newBudget - group.totalSpent
            }
          : group
      )
    );
    setEditBudgetModalVisible(false);
    setBudgetInput('');
  };

  const handleDeleteBudget = () => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this group's budget? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            router.push("/(screens)/group-budget");
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <MenuProvider>
      <View className="flex-1 bg-white">
        {/* Fixed Header with Back Button and Menu */}
        <View className="pt-12 pb-3 px-5 bg-white border-b border-gray-100">
          <View className="flex-row items-center justify-between mb-1">
            <TouchableOpacity onPress={() => router.push("/(screens)/group-budget")} className="p-2 -ml-2">
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
                <MenuOption onSelect={() => {
                  setBudgetInput('');
                  setAddBudgetModalVisible(true);
                  toggleModalAnimation(true);
                }}>
                  <View className="p-3">
                    <Text className="text-[#1A3C34]" style={{ fontFamily: 'Poppins_500Medium' }}>Add Budget</Text>
                  </View>
                </MenuOption>
                <View className="h-px bg-gray-200 mx-2" />
                <MenuOption onSelect={() => {
                  setBudgetInput(groupData.totalBudget.toString());
                  setEditBudgetModalVisible(true);
                  toggleModalAnimation(true);
                }}>
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
        </View>

        {/* Scrollable Content */}
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#133C13']}
              tintColor='#133C13'
            />
          }
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          <View className="px-5 pt-5">
            {/* Group Summary Card */}
            <View className="bg-[#B2EA71] rounded-xl p-5 mb-6 border border-gray-200 shadow-sm">
              <View className="flex-row justify-between items-start mb-4">
                <View>
                  <Text className="text-base text-[#133C13] mb-1" style={{ fontFamily: 'Poppins_500Medium' }}>
                    Group Balance
                  </Text>
                  <Text className="text-3xl text-[#133C13] mt-3" style={{ fontFamily: 'Poppins_700Bold' }}>
                    {currencySymbol} {groupBalance.toLocaleString()}
                  </Text>
                </View>
                
                <View className="flex-row items-center">
                  <View className="bg-[#133C13] px-3 py-1.5 rounded-full flex-row items-center">
                    <Users size={18} color="white" />
                    <Text className="text-white text-sm ml-2" style={{ fontFamily: 'Poppins_500Medium' }}>
                      {groupData.members} members
                    </Text>
                  </View>
                </View>
              </View>

              {/* Budget Progress Bar */}
              <View className="mb-4">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-base text-[#133C13]" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                    Budget Usage
                  </Text>
                  <Text className={`text-sm ${spendingColor}`} style={{ fontFamily: 'Poppins_500Medium' }}>
                    {Math.round(spendingPercentage)}%
                  </Text>
                </View>
                
                <View className="bg-[#E7F5E3] rounded h-2.5 w-full mb-2">
                  <Progress.Bar
                    progress={spendingPercentage / 100}
                    color={spendingPercentage > 100 ? '#EF4444' : '#133C13'}
                    width={null}
                    height={10}
                    borderWidth={0}
                  />
                </View>
                
                <Text className={`text-sm ${spendingColor}`} style={{ fontFamily: 'Poppins_500Medium' }}>
                  Spent {currencySymbol}{totalExpenses.toLocaleString()} of {currencySymbol}{totalContributions.toLocaleString()}
                </Text>
              </View>

              <View className="border-t border-white/50 my-3"></View>

              <View className="flex-row justify-between">
                <View className="bg-[#E0FFC0] p-3 rounded-lg flex-1 mr-2">
                  <Text className="text-xs text-[#133C13] mb-1" style={{ fontFamily: 'Poppins_500Medium' }}>
                    Total Budget
                  </Text>
                  <Text className="text-lg text-[#133C13]" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                    {currencySymbol} {totalContributions.toLocaleString()}
                  </Text>
                </View>
                
                <View className="bg-[#E0FFC0] p-3 rounded-lg flex-1 ml-2">
                  <Text className="text-xs text-[#133C13] mb-1" style={{ fontFamily: 'Poppins_500Medium' }}>
                    Total Expenses
                  </Text>
                  <Text className="text-lg text-[#133C13]" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                    {currencySymbol} {totalExpenses.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="space-y-3 mb-6">
              <Link href={`/(screens)/group-expenses?id=${groupId}&groupName=${encodeURIComponent(groupData.groupName)}`} asChild>
                <TouchableOpacity className="bg-[#E7F5E3] p-7 rounded-xl flex-row justify-between items-center mb-4">
                  <View className="flex-row items-center">
                    <Users size={20} color="#1A3C34" className="mr-4" />
                    <Text className="text-[#1A3C34] text-base ml-4" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                      Group Expenses
                    </Text>
                  </View>
                  <ChevronRight size={20} color="#1A3C34" />
                </TouchableOpacity>
              </Link>

              <Link href={`/(screens)/group-settings?id=${groupId}`} asChild>
                <TouchableOpacity className="bg-[#E7F5E3] p-7 rounded-xl flex-row justify-between items-center mb-4">
                  <View className="flex-row items-center">
                    <SettingsIcon size={20} color="#1A3C34" className="mr-4" />
                    <Text className="text-[#1A3C34] text-base ml-4" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                      Group Settings
                    </Text>
                  </View>
                  <ChevronRight size={20} color="#1A3C34" />
                </TouchableOpacity>
              </Link>

              <Link 
                href={{
                  pathname: "/(screens)/add-expense-modal",
                  params: { 
                    groupId: groupData.id,
                    groupName: groupData.groupName,
                  }
                }} 
                asChild
              >
                <TouchableOpacity className="bg-[#133C13] p-7 rounded-xl flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <Text className="text-white text-base" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                      Add Group Expense
                    </Text>
                  </View>
                  <PlusCircle size={25} color="white" className="mr-4" />
                </TouchableOpacity>
              </Link>
            </View>

            {/* Financial Coach Card */}
            <View className="bg-[#fcfbfb] rounded-xl p-5 border border-gray-200">
              <View className="flex-row items-start">
                <View className="bg-[#133C13] p-2.5 rounded-full mr-3">
                  <Bot color="white" size={18} />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Text 
                      className="text-base mr-2" 
                      style={{ 
                        fontFamily: 'Poppins_600SemiBold',
                        color: financialAdvice.color 
                      }}
                    >
                      {financialAdvice.title}
                    </Text>
                    <Text className="text-sm text-gray-500" style={{ fontFamily: 'Poppins_400Regular' }}>
                      {Math.round(spendingPercentage)}% of budget
                    </Text>
                  </View>
                  <Text 
                    className="text-sm" 
                    style={{ 
                      fontFamily: 'Poppins_400Regular',
                      color: '#133C13',
                      lineHeight: 20
                    }}
                  >
                    {financialAdvice.message}
                  </Text>
                  
                  {spendingPercentage < 50 && (
                    <View className="mt-3 bg-[#E7F5E3] p-3 rounded-lg">
                      <Text className="text-xs text-[#133C13]" style={{ fontFamily: 'Poppins_500Medium' }}>
                        💡 Pro Tip: With {Math.round(100 - spendingPercentage)}% remaining, your group could consider creating a savings fund for future goals!
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Add Budget Modal */}
        <Modal
          visible={addBudgetModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {
            setAddBudgetModalVisible(false);
            toggleModalAnimation(false);
          }}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <Animated.View 
              style={[animatedStyle]}
              className="bg-white rounded-2xl w-[95%] max-w-lg shadow-lg"
            >
              <View className="bg-[#F8FAFC] rounded-t-2xl p-4 border-b border-gray-100 flex-row justify-between items-center">
                <Text className="text-xl text-[#1A3C34]" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                  Add Budget
                </Text>
                <TouchableOpacity 
                  onPress={() => {
                    setAddBudgetModalVisible(false);
                    toggleModalAnimation(false);
                  }}
                  className="p-2 -mr-2"
                >
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View className="p-5">
                <Text className="text-base text-[#1A3C34] mb-2" style={{ fontFamily: 'Poppins_500Medium' }}>
                  Enter Additional Budget Amount
                </Text>
                <TextInput
                  className="border border-gray-200 rounded-lg p-3 mb-4 text-[#1A3C34]"
                  style={{ fontFamily: 'Poppins_400Regular' }}
                  value={budgetInput}
                  onChangeText={(text) => setBudgetInput(formatNumberInput(text))}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                />
                <View className="flex-row justify-end space-x-3">
                  <TouchableOpacity 
                    className="px-5 py-2.5 rounded-lg border border-gray-200 bg-white"
                    onPress={() => {
                      setAddBudgetModalVisible(false);
                      toggleModalAnimation(false);
                    }}
                  >
                    <Text className="text-gray-600" style={{ fontFamily: 'Poppins_500Medium' }}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className="px-5 py-2.5 rounded-lg bg-[#133C13] ml-3"
                    onPress={handleAddBudget}
                  >
                    <Text className="text-white" style={{ fontFamily: 'Poppins_500Medium' }}>
                      Add
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </View>
        </Modal>

        {/* Edit Budget Modal */}
        <Modal
          visible={editBudgetModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {
            setEditBudgetModalVisible(false);
            toggleModalAnimation(false);
          }}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <Animated.View 
              style={[animatedStyle]}
              className="bg-white rounded-2xl w-[95%] max-w-lg shadow-lg"
            >
              <View className="bg-[#F8FAFC] rounded-t-2xl p-4 border-b border-gray-100 flex-row justify-between items-center">
                <Text className="text-xl text-[#1A3C34]" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                  Edit Budget
                </Text>
                <TouchableOpacity 
                  onPress={() => {
                    setEditBudgetModalVisible(false);
                    toggleModalAnimation(false);
                  }}
                  className="p-2 -mr-2"
                >
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View className="p-5">
                <Text className="text-base text-[#1A3C34] mb-2" style={{ fontFamily: 'Poppins_500Medium' }}>
                  Enter New Budget Amount
                </Text>
                <TextInput
                  className="border border-gray-200 rounded-lg p-3 mb-4 text-[#1A3C34]"
                  style={{ fontFamily: 'Poppins_400Regular' }}
                  value={budgetInput}
                  onChangeText={(text) => setBudgetInput(formatNumberInput(text))}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                />
                <View className="flex-row justify-end space-x-3">
                  <TouchableOpacity 
                    className="px-5 py-2.5 rounded-lg border border-gray-200 bg-white"
                    onPress={() => {
                      setEditBudgetModalVisible(false);
                      toggleModalAnimation(false);
                    }}
                  >
                    <Text className="text-gray-600" style={{ fontFamily: 'Poppins_500Medium' }}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className="px-5 py-2.5 rounded-lg bg-[#133C13] ml-3"
                    onPress={handleEditBudget}
                  >
                    <Text className="text-white" style={{ fontFamily: 'Poppins_500Medium' }}>
                      Save
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </View>
        </Modal>
      </View>
    </MenuProvider>
  );
}