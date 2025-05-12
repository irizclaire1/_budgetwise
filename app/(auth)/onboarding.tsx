import { useRouter, useFocusEffect } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  BackHandler,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator
} from "react-native";
import { useCallback, useState } from "react";
import RNPickerSelect, { Item } from "react-native-picker-select";

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [income, setIncome] = useState("");
  const [selectedGoal, setSelectedGoal] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const steps = [
    {
      title: "Welcome to BudgetWise!",
      description: "Take charge of your budget with ease. Simplify your financial management.",
      image: require("../../assets/images/welcome.jpg"),
    },
    {
      title: "Track Your Income",
      description: "Tell us your monthly income to get started.",
      image: require("../../assets/images/income-1.jpg"),
    },
    {
      title: "Set Your Financial Goal",
      description: "Choose one of your top financial goals.",
      image: require("../../assets/images/goals-2.jpg"),
    },
    {
      title: "Experience Financial Freedom",
      description: "Set budgets and achieve your financial goals with BudgetWise.",
      image: require("../../assets/images/done.jpg"),
    },
  ];

  const goals = ["Save More", "Pay Off Debt", "Travel Fund", "Emergency Fund"];

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => true;
      BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [])
  );

  const handleNext = () => {
    if (step === 1 && (!selectedCurrency || income.trim() === "")) {
      Alert.alert("Info", "Please select a currency and enter a valid income amount.");
      return;
    }
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount.replace(/,/g, ""));
    if (isNaN(num)) return "";
    return new Intl.NumberFormat("en-US").format(num);
  };

  const handleFinishOnboarding = async () => {
    const incomeValue = parseFloat(income.replace(/,/g, ""));
    if (isNaN(incomeValue)) {
      Alert.alert("Error", "Please enter a valid income amount.");
      return;
    }

    if (!selectedCurrency) {
      Alert.alert("Error", "Please select a currency.");
      return;
    }

    if (!selectedGoal) {
      Alert.alert("Error", "Please select a goal.");
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    router.replace("/");
  };

  const isStepValid = () => {
    if (step === 1) return income.trim() !== "" && selectedCurrency !== null;
    if (step === 2) return selectedGoal !== "";
    return true;
  };

  const currencyItems: Item[] = [
    { label: "USD ($)", value: "USD" },
    { label: "EUR (€)", value: "EUR" },
    { label: "PHP (₱)", value: "PHP" },
    { label: "JPY (¥)", value: "JPY" },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "space-between" }}
        showsVerticalScrollIndicator={false}
        className="px-6 py-10"
      >
        <View className="flex-1 justify-center items-center">
          <View className="mb-6">
            <Image
              source={steps[step].image}
              className="w-64 h-64"
              resizeMode="contain"
            />
          </View>

          {/* Title and Description */}
          <Text className="text-gray-900 text-3xl font-bold text-center mb-4 px-4" style={{ fontFamily: "Poppins_700Bold" }}>
            {steps[step].title}
          </Text>
          <Text className="text-gray-600 text-base text-center leading-relaxed px-8 mb-6" style={{ fontFamily: "Poppins_500Medium" }}>
            {steps[step].description}
          </Text>

          {/* Step 1: Currency + Income Input */}
          {step === 1 && (
            <View className="w-full mb-6">
              <RNPickerSelect
                onValueChange={(value: string) => setSelectedCurrency(value)}
                items={currencyItems}
                value={selectedCurrency}
                placeholder={{ label: "Select a currency", value: null }}
                style={{
                  inputIOS: {
                    fontSize: 16,
                    paddingVertical: 12,
                    paddingHorizontal: 10,
                    borderWidth: 1,
                    borderColor: "#d1d5db",
                    borderRadius: 8,
                    color: "#111827",
                    backgroundColor: "#fff",
                    marginBottom: 10,
                    fontFamily: "Poppins_500Medium",
                  },
                  inputAndroid: {
                    fontSize: 15,
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    borderWidth: 1,
                    borderColor: "#d1d5db",
                    borderRadius: 8,
                    color: "#111827",
                    backgroundColor: "#fff",
                    marginBottom: 10,
                    fontFamily: "Poppins_500Medium",
                  },
                }}
                useNativeAndroidPickerStyle={false}
              />

              <TextInput
                placeholder="Enter your total monthly income"
                value={income}
                onChangeText={(text) => setIncome(formatCurrency(text.replace(/,/g, "")))}
                keyboardType="numeric"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base bg-white"
                style={{ fontFamily: "Poppins_500Medium" }}
              />
            </View>
          )}

          {/* Step 2: Goal Selection */}
          {step === 2 && (
            <View className="w-full mb-6">
              {goals.map((goal, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedGoal(goal)}
                  className={`rounded-full border py-3 px-5 mb-4 ${
                    selectedGoal === goal ? "bg-green-500 border-green-500" : "border-gray-300"
                  }`}
                >
                  <Text
                    className={`text-center text-base ${
                      selectedGoal === goal ? "text-white" : "text-gray-700"
                    }`}
                    style={{ fontFamily: "Poppins_500Medium" }}
                  >
                    {goal}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Pagination Dots */}
          <View className="flex-row justify-center mb-10">
            {steps.map((_, index) => (
              <View
                key={index}
                className={`w-2 h-2 rounded-full mx-1 ${
                  index === step ? "bg-green-500" : "bg-gray-300"
                }`}
              />
            ))}
          </View>
        </View>

        {/* Navigation Buttons */}
        <View className="w-full space-y-4 pb-4">
          {step > 0 && (
            <TouchableOpacity
              onPress={handlePrevious}
              className="border border-green-500 rounded-full py-4 px-6 w-full mb-6"
            >
              <Text className="text-green-500 font-semibold text-lg text-center" style={{ fontFamily: "Poppins_600SemiBold" }}>
                Previous
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={step < steps.length - 1 ? handleNext : handleFinishOnboarding}
            disabled={!isStepValid() || loading}
            className={`rounded-full py-4 px-6 w-full ${
              isStepValid() ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-lg text-center" style={{ fontFamily: "Poppins_600SemiBold" }}>
                {step < steps.length - 1 ? "Next" : "Get Started"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}