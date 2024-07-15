import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { lightTheme, darkTheme } from "../src/themes/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(lightTheme);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const savedSettings = await AsyncStorage.getItem("@settings");
      if (savedSettings !== null) {
        const isDarkMode = JSON.parse(savedSettings);
        setDarkMode(isDarkMode);
        setTheme(isDarkMode ? darkTheme : lightTheme);
      }
    };
    loadSettings();
  }, []);

  useMemo(() => {
    setTheme(darkMode ? darkTheme : lightTheme);
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ theme, darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
