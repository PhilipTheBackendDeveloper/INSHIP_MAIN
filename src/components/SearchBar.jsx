import React, { useState } from "react";
import {
  TextInput,
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Foundation } from "react-native-vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../../context/ThemeContext";

const { width } = Dimensions.get("window");

const SearchBar = ({ onChangeText, onActualChange }) => {
  const [searchText, setSearchText] = useState("");
  const { theme } = useTheme();
  const router = useRouter();

  const handleSearch = () => {
    onChangeText(searchText);
  };

  const handleChangeText = (text) => {
    setSearchText(text);
    onActualChange(text);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: theme.innerTabContainerColor },
        ]}
      >
        <Foundation
          name="magnifying-glass"
          size={20}
          color={theme.textColor}
          style={styles.icon}
        />
        <TextInput
          placeholder="Search"
          placeholderTextColor={theme.textColor}
          value={searchText}
          onChangeText={handleChangeText}
          returnKeyType="search"
          style={[styles.textInput, { color: theme.textColor }]}
          keyboardAppearance={
            theme.backgroundColor === "#ffffff" ? "light" : "dark"
          }
        />
      </View>
      <Pressable onPress={() => router.back()} style={styles.cancelButton}>
        <Text style={[styles.cancelText, { color: theme.grayText }]}>
          Cancel
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchContainer: {
    position: "relative",
    width: width * 0.75,
    borderRadius: 50,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    position: "absolute",
    left: 15,
    zIndex: 999,
  },
  textInput: {
    flex: 1,
    paddingVertical: 10,
    paddingLeft: 40,
    paddingRight: 15,
    borderRadius: 50,
    fontSize: 15,
    fontWeight: "500",
  },
  cancelButton: {
    width: width * 0.2,
  },
  cancelText: {
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default SearchBar;
