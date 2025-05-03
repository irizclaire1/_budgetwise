import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Send, Bot, User } from 'lucide-react-native';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

export default function Coach() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your financial coach. How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = () => {
    if (inputText.trim() === '') return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate bot response after a delay
    setTimeout(() => {
      const botResponses = [
        "That's an important consideration for your financial health.",
        "Have you thought about creating a budget for that?",
        "Let me analyze your spending patterns and suggest some improvements.",
        "Based on typical financial strategies, I'd recommend...",
        "Would you like me to help you set up a savings plan for this?",
        "Many people find success with the 50/30/20 budgeting rule. Would you like me to explain it?",
        "I can help you track your expenses better if you'd like.",
        "Let's break this down into actionable steps for you."
      ];
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      
      const botMessage: Message = {
        id: Date.now().toString(),
        text: randomResponse,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-[#133C13] pt-12 pb-4 px-4">
        <Text className="text-xl text-white font-bold text-center" style={{ fontFamily: 'Poppins_600SemiBold' }}>
          Financial Coach
        </Text>
      </View>

      {/* Chat Area */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 p-4"
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            className={`mb-4 flex-row ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <View
              className={`max-w-[80%] rounded-lg p-3 ${message.sender === 'user' ? 'bg-[#B2EA71] rounded-br-none' : 'bg-white rounded-bl-none border border-gray-200'}`}
            >
              <View className="flex-row items-center mb-1">
                {message.sender === 'bot' ? (
                  <Bot size={16} color="#133C13" className="mr-2" />
                ) : (
                  <User size={16} color="#133C13" className="mr-2" />
                )}
                <Text className={`text-xs ${message.sender === 'user' ? 'text-[#133C13]' : 'text-gray-500'}`}>
                  {message.sender === 'bot' ? 'Financial Coach' : 'You'} •{' '}
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <Text className={`text-base ${message.sender === 'user' ? 'text-[#133C13]' : 'text-gray-800'}`}>
                {message.text}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="border-t border-gray-200 bg-white p-4"
      >
        <View className="flex-row items-center">
          <TextInput
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 mr-2"
            placeholder="Ask your financial question..."
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            className="bg-[#133C13] rounded-full p-2"
            onPress={handleSend}
            disabled={inputText.trim() === ''}
          >
            <Send size={20} color="white" />
          </TouchableOpacity>
        </View>
        <Text className="text-xs text-gray-500 text-center mt-2">
          Your financial coach is here to help!
        </Text>
      </KeyboardAvoidingView>
    </View>
  );
}