import { Text, View, TouchableOpacity, Modal, FlatList, Pressable } from "react-native";
import { ArrowLeft, ChevronRight, X } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

const currencies = ["PHP", "EUR", "USD", "JPY", "GBP", "AUD", "CAD"];

export default function Settings() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("PHP");

  const handleSelectCurrency = (currency: string) => {
    setSelectedCurrency(currency);
    setModalVisible(false);
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="pt-12 pb-3 px-5">
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 -ml-2"
          >
            <ArrowLeft size={24} color="#1A3C34" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-green-900">Setting</Text>
          <View className="w-8" />
        </View>
      </View>

      {/* Settings List */}
      <View className="px-6 space-y-5">
        <TouchableOpacity
          className="flex-row items-center justify-between p-5 bg-lime-50 rounded-xl border border-lime-100"
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text className="text-lg font-semibold text-green-900">
            Change Currency ({selectedCurrency})
          </Text>
          <View className="bg-lime-200 p-2 rounded-lg">
            <ChevronRight size={20} color="#1A3C34" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Currency Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-2xl p-6 max-h-[60%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-green-900">
                Select Currency
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#1A3C34" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={currencies}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleSelectCurrency(item)}
                  className="p-4 border-b border-gray-200"
                >
                  <Text
                    className={`text-base ${
                      item === selectedCurrency ? "font-bold text-green-900" : "text-gray-800"
                    }`}
                  >
                    {item}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
