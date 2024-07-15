import React from "react";
import { Stack } from "expo-router";
import { useTheme } from "../../../../context/ThemeContext";

const NewChatLayout = () => {
  const { theme } = useTheme();
  return (
    <Stack>
      <Stack.Screen
        name="newChat"
        options={{
          headerShown: true,
          presentation: "modal",
          headerTitle: `New Chat`,
          headerTintColor: theme.textColor,
          headerStyle: { backgroundColor: theme.backgroundColor },
        }}
      />
    </Stack>
  );
};

export default NewChatLayout;
