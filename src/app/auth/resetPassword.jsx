import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { FIREBASE_AUTH } from "../../../Firebase/config";
import Toast from "react-native-toast-message";

const ResetPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [validEmail, setValidEmail] = useState(false);

  const showSuccessToast = () => {
    Toast.show({
      type: "success",
      text1: "Success",
      text2: "Password reset email sent successfully.",
    });
  };

  const showErrorToast = (message) => {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: message,
    });
  };

  useEffect(() => {
    const validateEmail = () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setValidEmail(emailRegex.test(email.trim()));
    };
    validateEmail();
  }, [email]);
  const handleResetPassword = async () => {
    if (email.trim() === "") return;
    if (validEmail) {
      try {
        setLoading(true);
        await sendPasswordResetEmail(FIREBASE_AUTH, email);
        showSuccessToast();
        setEmail("");
      } catch (error) {
        console.log(error.message);
        showErrorToast(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <Image
          source={require("../../../assets/forgotPassword.png")}
          style={styles.image}
        />
        <View>
          <Text style={styles.title}>Reset Password</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#7f8c8d"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          selectionColor="#2ecc71"
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: validEmail ? "#2ecc71" : "rgba(0,0,0,0.2)" },
          ]}
          onPress={handleResetPassword}
          disabled={loading || !validEmail}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Reset Password</Text>
          )}
        </TouchableOpacity>
      </View>
      <Toast />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  image: {
    width: "100%",
    height: 150,
    marginBottom: 30,
    resizeMode: "contain",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
    color: "#2c3e50",
  },
  input: {
    height: 50,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 16,
    width: "100%",
    marginBottom: 30,
  },
  button: {
    width: "100%",
    height: 50,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "center",
  },
});

export default ResetPasswordScreen;
