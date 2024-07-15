import React from "react";
import { Stack } from "expo-router";

const ChatRoomLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="chatroom" options={{ headerShown: false }} />
      <Stack.Screen name="botChatRoom" options={{ headerShown: false }} />
    </Stack>
  );
};

export default ChatRoomLayout;
