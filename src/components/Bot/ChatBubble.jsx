import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "react-native-vector-icons";
import { useTheme } from "../../../context/ThemeContext.js";

const ChatBubble = ({ role, text, imageUrl, onSpeech }) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.chatItem,
        role === "user" ? styles.userChatItem : styles.modelChatItem,
        role === "user"
          ? ""
          : { backgroundColor: theme.archiveBackgroundColor },
      ]}
    >
      <Text style={role === "user" ? styles.userName : styles.botName}>
        {role === "user" ? "Me" : "My AI"}
      </Text>
      <Text
        style={[styles.chatText, role !== "user" && { color: theme.textColor }]}
      >
        {text}
      </Text>
      {role === "model" && (
        <View style={styles.speakerIcon}>
          <TouchableOpacity onPress={onSpeech}>
            <Ionicons
              name="volume-high-outline"
              size={24}
              color={theme.textColor}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  chatItem: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    maxWidth: "70%",
    position: "relative",
  },
  userChatItem: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C5",
    borderRightWidth: 3,
    borderColor: "#2ecc71",
  },
  modelChatItem: {
    alignSelf: "flex-start",
    borderLeftWidth: 3,
    borderColor: "red",
  },
  chatText: {
    fontSize: 16,
    color: "#333",
  },
  speakerIcon: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  chatImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 5,
  },
  userName: {
    color: "#2ecc71",
    fontSize: 13,
    marginBottom: 4,
  },
  botName: {
    color: "red",
    fontSize: 13,
    marginBottom: 4,
  },
});

export default ChatBubble;
