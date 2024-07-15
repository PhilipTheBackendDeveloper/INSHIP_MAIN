import { View, TextInput, Pressable, StyleSheet } from "react-native";
import React, { useState } from "react";
import { Ionicons, Entypo, FontAwesome } from "react-native-vector-icons";
import { useChatStore } from "../../../context/ChatContext";
import { useTheme } from "../../../context/ThemeContext";

const Bottom = ({
  handleSend,
  handlePickMedia,
  from,
  handleFocusedInput,
  user,
}) => {
  const [message, setMessage] = useState("");
  const { theme } = useTheme();

  const { isCurrentUserBlocked, isReceiverBlocked } = useChatStore();

  const onSend = () => {
    if (message.trim() || handlePickMedia) {
      handleSend(message.trim());
      setMessage("");
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      {from && from === "bot" ? (
        <View />
      ) : (
        <View style={styles.cameraButtonWrapper}>
          <Pressable
            disabled={isCurrentUserBlocked || isReceiverBlocked}
            style={[
              styles.cameraButton,
              { backgroundColor: theme.innerTabContainerColor },
            ]}
          >
            <FontAwesome
              name="camera"
              size={18}
              color={isReceiverBlocked ? "gray" : theme.textColor}
            />
          </Pressable>
        </View>
      )}
      <View style={styles.textInputWrapper}>
        <TextInput
          placeholder="Chat"
          placeholderTextColor={
            isReceiverBlocked ? "rgba(0,0,0,.1)" : theme.grayText
          }
          style={[
            styles.textInput,
            {
              backgroundColor: theme.innerTabContainerColor,
              color: theme.textColor,
            },
          ]}
          value={message}
          onChangeText={(text) => setMessage(text)}
          onSubmitEditing={onSend}
          returnKeyType="send"
          selectionColor="#2ecc71"
          onFocus={() => handleFocusedInput}
          keyboardAppearance={
            theme.backgroundColor === "#ffffff" ? "light" : "dark"
          }
        />
      </View>
      <View style={styles.actionsWrapper}>
        <Pressable
          disabled={isCurrentUserBlocked || isReceiverBlocked}
          onPress={onSend}
          style={styles.actionButton}
        >
          <Ionicons
            name="send"
            size={25}
            color={isReceiverBlocked ? "gray" : "#2ecc71"}
          />
        </Pressable>
        {from && from === "bot" ? (
          <View />
        ) : (
          <Pressable
            disabled={isCurrentUserBlocked || isReceiverBlocked}
            onPress={handlePickMedia}
            style={[
              styles.actionButton,
              { backgroundColor: theme.innerTabContainerColor },
            ]}
          >
            <Ionicons
              name="images-outline"
              size={23}
              color={isReceiverBlocked ? "gray" : theme.textColor}
              style={styles.rotateIcon}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 3,
    paddingBottom: 5,
    gap: 8,
    height: 65,
    backgroundColor: "white",
    paddingHorizontal: 10,
  },
  cameraButtonWrapper: {
    width: 35,
    height: 35,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraButton: {
    width: 40,
    height: 40,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  textInputWrapper: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 50,
    height: 40,
  },
  textInput: {
    height: "100%",
    borderRadius: 50,
    fontSize: 17,
    paddingHorizontal: 15,
  },
  actionsWrapper: {
    flexDirection: "row",
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Bottom;
