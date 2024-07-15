import React from "react";
import { Stack } from "expo-router";

const HomeLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="authUserProfile" options={{ headerShown: false }} />
      <Stack.Screen
        name="[otherUserProfile]"
        options={{ headerShown: false }}
      />
    </Stack>
  );
};

export default HomeLayout;
