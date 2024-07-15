import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome6,
} from "react-native-vector-icons";
import { useTheme } from "../../../../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { toastConfig } from "../../../../utils/themeConfig";
import { FIREBASE_AUTH } from "../../../../Firebase/config";
import { signOut } from "firebase/auth";
import { router, navigation } from "expo-router";

const SettingsScreen = () => {
  const { theme, darkMode, setDarkMode } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const toggleDarkMode = async () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    await AsyncStorage.setItem("@settings", JSON.stringify(newDarkMode));
  };

  const showToast = (message) => {
    Toast.show({
      type: "customInfoToast",
      text1: message,
      visibilityTime: 1000,
    });
  };

  const showErrorToast = (message) => {
    Toast.show({
      type: "customErrorToast",
      text1: message,
      visibilityTime: 1000,
    });
  };

  const toggleNotifications = () => {
    setNotificationsEnabled((prev) => !prev);
    if (!notificationsEnabled) {
      showToast("Notifications enabled");
    } else {
      showToast("Notifications disabled");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(FIREBASE_AUTH);
      await AsyncStorage.removeItem("@userData");
      showToast("Signed out successfully");
    } catch (error) {
      showErrorToast("Oops! something went wrong");
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
      contentContainerStyle={styles.contentContainer}
    >
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ padding: 10, borderRadius: 50 }}
        >
          <FontAwesome6 name="angle-left" size={25} color={theme.textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: theme.textColor }]}>
          Settings
        </Text>
      </View>
      <TouchableOpacity style={styles.option}>
        <Ionicons
          name="person"
          size={24}
          color="#2980b9"
          style={styles.optionIcon}
        />
        <Text style={[styles.optionText, { color: theme.textColor }]}>
          Manage Profile
        </Text>
      </TouchableOpacity>
      <View style={styles.option}>
        <Ionicons
          name={darkMode ? "moon" : "sunny"}
          size={24}
          color="#2ecc71"
          style={styles.optionIcon}
        />
        <Text style={[styles.optionText, { color: theme.textColor }]}>
          Dark Mode
        </Text>
        <Switch
          value={darkMode}
          onValueChange={toggleDarkMode}
          trackColor={{ false: "#bdc3c7", true: "#2ecc71" }}
          thumbColor={darkMode ? "#ffffff" : "#ffffff"}
        />
      </View>
      <View style={styles.option}>
        <MaterialIcons
          name="notifications"
          size={24}
          color={notificationsEnabled ? "#2ecc71" : "#bdc3c7"}
          style={styles.optionIcon}
        />
        <Text style={[styles.optionText, { color: theme.textColor }]}>
          Notifications
        </Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={toggleNotifications}
          trackColor={{ false: "#bdc3c7", true: "#2ecc71" }}
          thumbColor={notificationsEnabled ? "#fff" : "#fff"}
        />
      </View>
      <TouchableOpacity style={styles.option}>
        <Ionicons
          name="lock-closed"
          size={24}
          color="#e74c3c"
          style={styles.optionIcon}
        />
        <Text style={[styles.optionText, { color: theme.textColor }]}>
          Privacy Settings
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.option}>
        <Ionicons
          name="information-circle"
          size={24}
          color="#3498db"
          style={styles.optionIcon}
        />
        <Text style={[styles.optionText, { color: theme.textColor }]}>
          About
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.option} onPress={handleSignOut}>
        <Ionicons
          name="log-out"
          size={24}
          color="#c0392b"
          style={styles.optionIcon}
        />
        <Text style={[styles.optionText, { color: theme.textColor }]}>
          Sign Out
        </Text>
      </TouchableOpacity>
      <Toast config={toastConfig} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 15,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#bdc3c7",
  },
  optionIcon: {
    marginRight: 10,
  },
  optionText: {
    fontSize: 18,
    color: "#34495e",
    flex: 1,
  },
});

export default SettingsScreen;
