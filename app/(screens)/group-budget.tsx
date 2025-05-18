import { Link, useRouter } from "expo-router";
import { Animated } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Text, View, TouchableOpacity, ActivityIndicator, ScrollView, Modal, TextInput, SafeAreaView, StatusBar } from "react-native";
import { ChevronLeft, ChevronRight, Plus, Users, UserPlus, X, DollarSign, Trash2 } from "lucide-react-native";
import { RectButton, Swipeable } from 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

interface GroupBudget {
  id: string;
  groupName: string;
  totalBudget: number;
  totalSpent: number;
  members: number;
}

interface GroupFinanceData {
  currency: string;
  groupBalance: number;
}

const currencySymbols: { [key: string]: string } = {
  PHP: "₱",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
};

// Mock data
const mockGroupBudgets: GroupBudget[] = [
  {
    id: "1",
    groupName: "Family Budget",
    totalBudget: 50000,
    totalSpent: 25000,
    members: 4
  },
  {
    id: "2",
    groupName: "Roommate Expenses",
    totalBudget: 30000,
    totalSpent: 18000,
    members: 3
  },
  {
    id: "3",
    groupName: "Project Team",
    totalBudget: 20000,
    totalSpent: 5000,
    members: 5
  }
];

const mockGroupFinanceData: GroupFinanceData = {
  currency: "PHP",
  groupBalance: 50000
};

const renderRightActions = (
  progress: Animated.AnimatedInterpolation<number>,
  dragX: Animated.AnimatedInterpolation<number>,
  onDelete: () => void
) => {
  const trans = dragX.interpolate({
    inputRange: [0, 50, 100, 101],
    outputRange: [0, 0, 0, 1],
  });

  return (
    <RectButton
      style={{
        backgroundColor: '#ef4444',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: '85%',
        marginTop: 2,
        borderRadius: 10,
        marginLeft:10,
      }}
      onPress={onDelete}
    >
      <Animated.View
        style={{
          transform: [{ translateX: trans }],
          alignItems: 'center',
        }}
      >
        <Trash2 size={24} color="white" />
      </Animated.View>
    </RectButton>
  );
};

export default function GroupBudget() {
  const router = useRouter();
  const [groupBudgets, setGroupBudgets] = useState<GroupBudget[]>(mockGroupBudgets);
  const [groupFinanceData, setGroupFinanceData] = useState<GroupFinanceData>(mockGroupFinanceData);
  const [loading, setLoading] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupBudget, setNewGroupBudget] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const inviteScaleAnim = useRef(new Animated.Value(0.8)).current;
  const inviteFadeAnim = useRef(new Animated.Value(0)).current;
  const deleteScaleAnim = useRef(new Animated.Value(0.8)).current;
  const deleteFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showGroupModal) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [showGroupModal]);

  useEffect(() => {
    if (showInviteModal) {
      Animated.parallel([
        Animated.timing(inviteFadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(inviteScaleAnim, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.timing(inviteFadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [showInviteModal]);

  useEffect(() => {
    if (showDeleteModal) {
      Animated.parallel([
        Animated.timing(deleteFadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(deleteScaleAnim, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.timing(deleteFadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [showDeleteModal]);

  const handleAddGroupBudget = async () => {
    if (!newGroupName || !newGroupBudget) return;
    
    setModalLoading(true);
    
    setTimeout(() => {
      const budgetAmount = parseFloat(newGroupBudget);
      
      const newGroupBudgetItem: GroupBudget = {
        id: Math.random().toString(36).substring(7),
        groupName: newGroupName,
        totalBudget: budgetAmount,
        totalSpent: 0,
        members: emails.length > 0 ? emails.length + 1 : 1
      };
      
      setGroupBudgets([...groupBudgets, newGroupBudgetItem]);
      setGroupFinanceData({
        ...groupFinanceData,
        groupBalance: groupFinanceData.groupBalance - budgetAmount
      });
      
      setNewGroupName("");
      setNewGroupBudget("");
      setEmails([]);
      setShowGroupModal(false);
      setModalLoading(false);
    }, 800);
  };

  const handleInviteFriend = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setShowGroupModal(false);
      setTimeout(() => setShowInviteModal(true), 50);
    });
  };

  const handleSaveInvite = () => {
    Animated.timing(inviteFadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setShowInviteModal(false);
      setTimeout(() => setShowGroupModal(true), 50);
    });
  };

  const handleCancelInvite = () => {
    Animated.timing(inviteFadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setShowInviteModal(false);
      setTimeout(() => setShowGroupModal(true), 50);
    });
  };

  const addEmail = () => {
    if (currentEmail && !emails.includes(currentEmail)) {
      setEmails([...emails, currentEmail]);
      setCurrentEmail("");
    }
  };

  const removeEmail = (emailToRemove: string) => {
    setEmails(emails.filter(email => email !== emailToRemove));
  };

  const formatCurrency = (amount: number) => {
    return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  };

  const calculateProgress = (spent: number, total: number) => {
    return Math.min(spent / total, 1);
  };

  const confirmDeleteGroup = (id: string) => {
    setGroupToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDeleteGroup = () => {
    if (!groupToDelete) return;
    
    // Find the group to get its budget amount
    const group = groupBudgets.find(g => g.id === groupToDelete);
    if (group) {
      // Return the budget to the group balance
      setGroupFinanceData({
        ...groupFinanceData,
        groupBalance: groupFinanceData.groupBalance + group.totalBudget
      });
      // Remove the group from the list
      setGroupBudgets(groupBudgets.filter(g => g.id !== groupToDelete));
    }
    
    setShowDeleteModal(false);
    setGroupToDelete(null);
  };

  const getGroupName = (id: string) => {
    const group = groupBudgets.find(g => g.id === id);
    return group ? group.groupName : 'this group';
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#133C13" />
      </View>
    );
  }

  const currencySymbol = groupFinanceData?.currency 
    ? currencySymbols[groupFinanceData.currency] || groupFinanceData.currency 
    : "₱";

  const modalStyle = {
    opacity: fadeAnim,
    transform: [{ scale: scaleAnim }],
  };

  const inviteModalStyle = {
    opacity: inviteFadeAnim,
    transform: [{ scale: inviteScaleAnim }],
  };

  const deleteModalStyle = {
    opacity: deleteFadeAnim,
    transform: [{ scale: deleteScaleAnim }],
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-5 bg-white border-b border-gray-100 shadow-sm mb-3">
          <Link href="/(tabs)/wallet" asChild>
            <TouchableOpacity className="p-2.5 bg-gray-50 rounded-full">
              <ChevronLeft size={22} color="#133C13" />
            </TouchableOpacity>
          </Link>
          <Text className="text-xl font-bold text-[#133C13]">Group Budgets</Text>
          <View className="w-12" />
        </View>

        {/* Content */}
        <View className="flex-1 px-6"> 
          <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={{ paddingBottom: 120 }}
          >
            {groupBudgets.length === 0 ? (
              <View className="flex-1 justify-center items-center py-20">
                <DollarSign size={56} color="#CCCCCC" />
                <Text className="text-gray-400 text-lg font-medium mt-6 text-center">No group budgets found</Text>
                <Text className="text-gray-400 text-sm mt-3 text-center px-8 leading-5">
                  Create a new group to start tracking shared expenses
                </Text>
              </View>
            ) : (
              groupBudgets.map((item) => (
                <Swipeable
                  key={item.id}
                  renderRightActions={(progress, dragX) => 
                    renderRightActions(progress, dragX, () => confirmDeleteGroup(item.id))
                  }
                  friction={2}
                  rightThreshold={40}
                >
                  <TouchableOpacity 
                    className="mb-4 bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100"
                    onPress={() => router.push(`/(screens)/group-budget-details?id=${item.id}`)}
                  >
                    <View className="p-4">
                      <Text className="text-lg font-bold text-[#133C13] mb-1">
                        {item.groupName}
                      </Text>
                        
                      <View className="flex-row justify-between items-center mb-3">
                        <View className="flex-row items-center">
                          <Users size={14} color="#666666" />
                          <Text className="text-sm text-gray-500 ml-1">
                            {item.members} member{item.members !== 1 ? 's' : ''}
                          </Text>
                        </View>
                        
                        <Text className="text-sm text-gray-500">
                          {currencySymbol}{formatCurrency(item.totalSpent)} / {currencySymbol}{formatCurrency(item.totalBudget)}
                        </Text>
                      </View>
                      
                      {/* Progress Bar */}
                      <View className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <View 
                          className={`h-full ${
                            calculateProgress(item.totalSpent, item.totalBudget) > 0.75 
                              ? 'bg-orange-500' 
                              : calculateProgress(item.totalSpent, item.totalBudget) > 0.9 
                                ? 'bg-red-500' 
                                : 'bg-[#B2EA71]'
                          }`}
                          style={{ width: `${calculateProgress(item.totalSpent, item.totalBudget) * 100}%` }}
                        />
                      </View>
                      
                      <View className="flex-row justify-between items-center mt-3">
                        <Text className="text-sm text-gray-500">
                          {Math.round(calculateProgress(item.totalSpent, item.totalBudget) * 100)}% used
                        </Text>
                        <ChevronRight size={18} color="#133C13" />
                      </View>
                    </View>
                  </TouchableOpacity>
                </Swipeable>
              ))
            )}
          </ScrollView>
        </View>

        {/* Floating Add Button */}
        <TouchableOpacity 
          className="absolute bottom-10 right-6 w-20 h-20 bg-[#133C13] rounded-full justify-center items-center shadow-xl"
          onPress={() => setShowGroupModal(true)}
          style={{ elevation: 8 }}
        >
          <Plus size={28} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Add Group Budget Modal */}
        <Modal
          visible={showGroupModal}
          transparent={true}
          animationType="none"
          onRequestClose={() => setShowGroupModal(false)}
        >
          <Animated.View 
            className="absolute inset-0 bg-black/40"
            style={{ opacity: fadeAnim }}
          />
          <View className="flex-1 justify-center items-center px-6">
            <Animated.View 
              className="bg-white rounded-3xl p-7 w-full shadow-lg"
              style={modalStyle}
            >
              <View className="mb-6 flex-row justify-center">
                <View className="w-16 h-16 bg-[#E0FFC0] rounded-full items-center justify-center mb-3">
                  <DollarSign size={26} color="#133C13" />
                </View>
              </View>
              
              <Text className="text-2xl font-bold text-[#133C13] text-center mb-7">
                Create Group Budget
              </Text>
              
              <View className="mb-6">
                <Text className="text-sm font-medium text-[#133C13] mb-3">
                  Group Name
                </Text>
                <TextInput
                  placeholder="e.g. Family Vacation"
                  value={newGroupName}
                  onChangeText={setNewGroupName}
                  className="bg-gray-50 rounded-xl px-5 py-4 border border-gray-200 text-base"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View className="mb-6">
                <Text className="text-sm font-medium text-[#133C13] mb-3">
                  Total Budget
                </Text>
                <TextInput
                  placeholder={`e.g. ${currencySymbol}10,000`}
                  value={newGroupBudget}
                  onChangeText={setNewGroupBudget}
                  keyboardType="numeric"
                  className="bg-gray-50 rounded-xl px-5 py-4 border border-gray-200 text-base"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <TouchableOpacity 
                className="mb-8 bg-gray-50 rounded-xl px-5 py-4 border border-gray-200 flex-row justify-between items-center"
                onPress={handleInviteFriend}
              >
                <Text className="text-sm font-medium text-[#133C13]">
                  Invite Friends
                </Text>
                <View className="flex-row items-center">
                  {emails.length > 0 && (
                    <View className="bg-[#E0FFC0] rounded-full px-3 py-1 mr-3">
                      <Text className="text-xs text-[#133C13] font-medium">
                        {emails.length}
                      </Text>
                    </View>
                  )}
                  <UserPlus size={20} color="#133C13" />
                </View>
              </TouchableOpacity>

              <View className="flex-row justify-between gap-5">
                <TouchableOpacity
                  className="flex-1 bg-gray-100 px-4 py-4 rounded-xl items-center"
                  onPress={() => setShowGroupModal(false)}
                >
                  <Text className="text-[#444444] font-medium">
                    Cancel
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  className={`flex-1 px-4 py-4 rounded-xl items-center ${
                    !newGroupName || !newGroupBudget 
                      ? 'bg-gray-200' 
                      : 'bg-[#133C13]'
                  }`}
                  onPress={handleAddGroupBudget}
                  disabled={modalLoading || !newGroupName || !newGroupBudget}
                >
                  {modalLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text className={`font-medium ${
                      !newGroupName || !newGroupBudget 
                        ? 'text-gray-500' 
                        : 'text-white'
                    }`}>
                      Create Group
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>

        {/* Invite Friends Modal */}
        <Modal
          visible={showInviteModal}
          transparent={true}
          animationType="none"
          onRequestClose={() => setShowInviteModal(false)}
        >
          <Animated.View 
            className="absolute inset-0 bg-black/40"
            style={{ opacity: inviteFadeAnim }}
          />
          <View className="flex-1 justify-center items-center px-6">
            <Animated.View 
              className="bg-white rounded-3xl p-7 w-full shadow-lg"
              style={inviteModalStyle}
            >
              <View className="mb-6 flex-row justify-center">
                <View className="w-16 h-16 bg-[#E0FFC0] rounded-full items-center justify-center mb-3">
                  <UserPlus size={26} color="#133C13" />
                </View>
              </View>
              
              <Text className="text-2xl font-bold text-[#133C13] text-center mb-7">
                Invite Members
              </Text>
              
              <View className="mb-5">
                <Text className="text-sm font-medium text-[#133C13] mb-3">
                  Email Address
                </Text>
                <View className="flex-row items-center">
                  <TextInput
                    placeholder="friend@example.com"
                    value={currentEmail}
                    onChangeText={setCurrentEmail}
                    keyboardType="email-address"
                    onSubmitEditing={addEmail}
                    className="flex-1 bg-gray-50 rounded-xl px-5 py-4 border border-gray-200 text-base mr-3"
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity
                    className={`p-4 rounded-xl ${
                      !currentEmail ? 'bg-gray-200' : 'bg-[#133C13]'
                    }`}
                    onPress={addEmail}
                    disabled={!currentEmail}
                  >
                    <Plus size={20} color={!currentEmail ? "#9CA3AF" : "#FFFFFF"} />
                  </TouchableOpacity>
                </View>
              </View>

              {emails.length > 0 && (
                <View className="mb-8">
                  <Text className="text-sm font-medium text-[#133C13] mb-3">
                    Invited ({emails.length})
                  </Text>
                  <View className="max-h-36 overflow-y-scroll">
                    {emails.map((email) => (
                      <View key={email} className="flex-row items-center justify-between bg-gray-50 rounded-xl px-5 py-3.5 mb-2 border border-gray-100">
                        <Text className="text-sm text-gray-700 font-medium">{email}</Text>
                        <TouchableOpacity 
                          onPress={() => removeEmail(email)}
                          className="p-1.5 rounded-full bg-gray-200"
                        >
                          <X size={16} color="#666666" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View className="flex-row justify-between gap-5">
                <TouchableOpacity
                  className="flex-1 bg-gray-100 px-4 py-4 rounded-xl items-center"
                  onPress={handleCancelInvite}
                >
                  <Text className="text-[#444444] font-medium">
                    Back
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  className="flex-1 bg-[#133C13] px-4 py-4 rounded-xl items-center"
                  onPress={handleSaveInvite}
                >
                  <Text className="text-white font-medium">
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          visible={showDeleteModal}
          transparent={true}
          animationType="none"
          onRequestClose={() => setShowDeleteModal(false)}
        >
          <Animated.View 
            className="absolute inset-0 bg-black/40"
            style={{ opacity: deleteFadeAnim }}
          />
          <View className="flex-1 justify-center items-center px-6">
            <Animated.View 
              className="bg-white rounded-3xl p-7 w-full shadow-lg"
              style={deleteModalStyle}
            >
              <View className="mb-6 flex-row justify-center">
                <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-3">
                  <Trash2 size={26} color="#ef4444" />
                </View>
              </View>
              
              <Text className="text-2xl font-bold text-[#133C13] text-center mb-4">
                Delete Group Budget
              </Text>

              <Text className="text-base text-gray-600 text-center mb-8">
                Are you sure you want to delete {groupToDelete ? getGroupName(groupToDelete) : 'this group'}? All data will be permanently removed.
              </Text>
              
              <View className="flex-row justify-between gap-5">
                <TouchableOpacity
                  className="flex-1 bg-gray-100 px-4 py-4 rounded-xl items-center"
                  onPress={() => setShowDeleteModal(false)}
                >
                  <Text className="text-[#444444] font-medium">
                    Cancel
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  className="flex-1 bg-red-500 px-4 py-4 rounded-xl items-center"
                  onPress={handleDeleteGroup}
                >
                  <Text className="text-white font-medium">
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}