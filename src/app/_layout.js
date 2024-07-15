import React from "react";
import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { UserProvider } from "../../context/UserContext";
import { UsersProvider } from "../../context/UsersContext";
import { ChatProvider } from "../../context/ChatContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider } from "../../context/ThemeContext";
import { View, Text } from "react-native";
import { Ionicons } from "react-native-vector-icons";

const RootLayout = () => {
  const toastConfig = {
    customInfoToast: ({ text1 }) => (
      <View
        style={{
          height: 40,
          backgroundColor: "rgba(0,0,0,0.75)",
          borderRadius: 20,
          padding: 10,
          paddingHorizontal: 15,
          justifyContent: "center",
          alignItems: "center",
          gap: 5,
        }}
      >
        <Text numberOfLines={1} style={{ color: "#fff", textAlign: "center" }}>
          {text1}
        </Text>
      </View>
    ),

    customSuccessToast: ({ text1 }) => (
      <View
        style={{
          height: 40,
          backgroundColor: "rgba(0,0,0,0.75)",
          borderRadius: 20,
          padding: 10,
          paddingHorizontal: 15,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 5,
        }}
      >
        <Ionicons name="checkmark-circle" color="#2ecc71" size={20} />
        <Text numberOfLines={1} style={{ color: "#fff", textAlign: "center" }}>
          {text1}
        </Text>
      </View>
    ),

    customErrorToast: ({ text1 }) => (
      <View
        style={{
          height: 40,
          backgroundColor: "rgba(0,0,0,0.75)",
          borderRadius: 20,
          padding: 10,
          paddingHorizontal: 15,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 5,
        }}
      >
        <Ionicons name="close-circle" color="red" size={20} />
        <Text numberOfLines={1} style={{ color: "#fff", textAlign: "center" }}>
          {text1}
        </Text>
      </View>
    ),
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <UserProvider>
          <UsersProvider>
            <ChatProvider>
              <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen
                  name="auth"
                  options={{ headerShown: false, gestureEnabled: false }}
                />
                <Stack.Screen
                  name="verified"
                  options={{ headerShown: false, gestureEnabled: false }}
                />
              </Stack>
            </ChatProvider>
          </UsersProvider>
        </UserProvider>
      </ThemeProvider>
      <Toast config={toastConfig} />
    </GestureHandlerRootView>
  );
};

export default RootLayout;
