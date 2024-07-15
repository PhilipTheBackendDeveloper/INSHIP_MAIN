import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  FlatList,
  Platform,
  ActivityIndicator,
} from "react-native";
import { ProgressBar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { FontAwesome, FontAwesome6 } from "react-native-vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../../Firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { useNavigation } from "expo-router";
import { router } from "expo-router";

const SignUpScreen = () => {
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState(new Date(2005, 1, 1));
  const [username, setUsername] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(true);
  const [valid, setValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validEmail, setValidEmail] = useState(false);
  const [validPassword, setValidPassword] = useState(0);
  const navigation = useNavigation();

  const images = [
    {
      id: 1,
      source: require("../../../assets/avatars/avatar_1.png"),
      path: "avatar_1.png",
    },
    {
      id: 2,
      source: require("../../../assets/avatars/avatar_11.png"),
      path: "avatar_11.png",
    },
    {
      id: 3,
      source: require("../../../assets/avatars/avatar_3.webp"),
      path: "avatar_3.webp",
    },
    {
      id: 4,
      source: require("../../../assets/avatars/avatar_4.webp"),
      path: "avatar_4.webp",
    },
    {
      id: 5,
      source: require("../../../assets/avatars/avatar_5.png"),
      path: "avatar_5.png",
    },
    {
      id: 6,
      source: require("../../../assets/avatars/avatar_6.png"),
      path: "avatar_6.png",
    },
    {
      id: 7,
      source: require("../../../assets/avatars/avatar_7.jpg"),
      path: "avatar_7.jpg",
    },
    {
      id: 8,
      source: require("../../../assets/avatars/avatar_8.jpg"),
      path: "avatar_8.jpg",
    },
    {
      id: 9,
      source: require("../../../assets/avatars/avatar_9.png"),
      path: "avatar_9.png",
    },
    {
      id: 10,
      source: require("../../../assets/avatars/avatar_10.webp"),
      path: "avatar_10.webp",
    },
  ];

  const handleImageSelect = (item) => {
    setSelectedAvatar(item);
  };

  const steps = [
    {
      title: `What's your name?`,
      fields: (
        <>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>FIRSTNAME</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              selectionColor="#2ecc71"
              placeholder="eg: Afia"
              placeholderTextColor="rgba(0,0,0,0.3)"
            />
          </View>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>LASTNAME</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              selectionColor="#2ecc71"
              placeholder="eg: Frimpong"
              placeholderTextColor="rgba(0,0,0,0.3)"
            />
          </View>
        </>
      ),
    },
    {
      title: `What's your birthday?`,
      fields: (
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>DATE OF BIRTH</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <TextInput
              style={[styles.input, { marginBottom: 0 }]}
              value={dob.toDateString()}
              editable={false}
              pointerEvents="none"
              selectionColor="#2ecc71"
            />
          </TouchableOpacity>
        </View>
      ),
    },
    {
      title: "Pick a username",
      fields: (
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>USERNAME</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            selectionColor="#2ecc71"
            placeholder="eg: afia_frimpong123"
            placeholderTextColor="rgba(0,0,0,0.3)"
          />
        </View>
      ),
    },
    {
      title: "Choose an avatar",
      fields: (
        <View style={{ flex: 1 }}>
          <FlatList
            data={images}
            contentContainerStyle={styles.imageContainer}
            keyExtractor={(item) => item.id.toString()}
            numColumns={4}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleImageSelect(item)}
                style={[
                  styles.imageWrapper,
                  selectedAvatar?.id === item.id && styles.selectedAvatar,
                ]}
              >
                <Image source={item.source} style={styles.image} />
              </TouchableOpacity>
            )}
          />
        </View>
      ),
    },
    {
      title: `Completing your registration`,
      fields: (
        <>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>EMAIL</Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor:
                    email.trim() === ""
                      ? "gray"
                      : !validEmail
                      ? "red"
                      : "#2ecc71",
                },
              ]}
              value={email.toLowerCase()}
              onChangeText={setEmail}
              keyboardType="email-address"
              selectionColor="#2ecc71"
              placeholder="eg: afiafrimpong123@gmail.com"
              placeholderTextColor="rgba(0,0,0,0.15)"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>PASSWORD</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input,
                  {
                    minWidth: "70%",
                    maxWidth: "70%",
                    borderColor:
                      validPassword === 0
                        ? "gray"
                        : validPassword === 1
                        ? "red"
                        : validPassword === 2
                        ? "orange"
                        : validPassword === 3 && "#2ecc71",
                  },
                ]}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                selectionColor="#2ecc71"
                placeholder="at least 7 characters"
                placeholderTextColor="rgba(0,0,0,0.15)"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <FontAwesome6
                  name={showPassword ? "eye" : "eye-slash"}
                  size={18}
                  color="#7f8c8d"
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>CONFIRM PASSWORD</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input,
                  {
                    minWidth: "70%",
                    maxWidth: "70%",
                    borderColor:
                      confirmPassword.trim() !== password.trim()
                        ? "gray"
                        : confirmPassword.trim() === password.trim()
                        ? "#2ecc71"
                        : "",
                  },
                ]}
                secureTextEntry={!showPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                selectionColor="#2ecc71"
                placeholder="at least 7 characters"
                placeholderTextColor="rgba(0,0,0,0.15)"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <FontAwesome6
                  name={showPassword ? "eye" : "eye-slash"}
                  size={18}
                  color="#7f8c8d"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-around",
            }}
          >
            <View
              style={{ alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <View
                style={{
                  backgroundColor: "red",
                  height: 7,
                  width: 50,
                  borderRadius: 5,
                }}
              />
              <Text style={{ color: "rgba(0,0,0,0.5)" }}>Weak</Text>
            </View>
            <View
              style={{ alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <View
                style={{
                  backgroundColor: "orange",
                  height: 7,
                  width: 50,
                  borderRadius: 5,
                }}
              />
              <Text style={{ color: "rgba(0,0,0,0.5)" }}>Average</Text>
            </View>
            <View
              style={{ alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <View
                style={{
                  backgroundColor: "#2ecc71",
                  height: 7,
                  width: 50,
                  borderRadius: 5,
                }}
              />
              <Text style={{ color: "rgba(0,0,0,0.5)" }}>Strong</Text>
            </View>
          </View>

          <View style={{ marginVertical: 30 }}>
            <Text style={styles.privacyText}>
              By tapping Finish, you acknowledge that you have read the{" "}
              <Text style={{ color: "#2ecc71" }}>Privacy Policy</Text> and agree
              to the <Text style={{ color: "#2ecc71" }}>Terms of Service</Text>.
            </Text>
          </View>
        </>
      ),
    },
  ];

  useEffect(() => {
    validateStep();
  }, [
    firstName,
    lastName,
    dob,
    username,
    selectedAvatar,
    email,
    password,
    step,
  ]);

  const validateStep = () => {
    switch (step) {
      case 0:
        setValid(firstName.trim() !== "" && lastName.trim() !== "");
        break;
      case 1:
        setValid(dob !== null);
        break;
      case 2:
        setValid(username.trim() !== "");
        break;
      case 3:
        setValid(selectedAvatar !== null);
        break;
      case 4:
        validatePassword();
        break;
      default:
        setValid(false);
    }
  };

  const generateUsername = (firstName, lastName) => {
    const randomNum = Math.floor(Math.random() * 1000);
    return `${firstName.trim().toLowerCase()}_${randomNum}`;
  };

  useEffect(() => {
    if (step === 2 && username.trim() === "") {
      setUsername(generateUsername(firstName, lastName));
    }
  }, [step, firstName, lastName, username]);

  useEffect(() => {
    validateEmail();
  }, [email]);

  const handleRegistration = async () => {
    try {
      setLoading(true);
      const { user } = await createUserWithEmailAndPassword(
        FIREBASE_AUTH,
        email,
        password
      );
      if (user) {
        navigation.goBack();
        const userData = {
          id: user.uid,
          Email: email,
          Password: password,
          FirstName: firstName,
          LastName: lastName,
          Birthday: dob,
          Username: username,
          avatar: selectedAvatar.path,
          blocked: [],
        };
        await setDoc(doc(FIRESTORE_DB, "users", user.uid), userData);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const validateEmail = () => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setValidEmail(emailPattern.test(email.trim()));
  };

  const validatePassword = () => {
    if (password.length >= 7) {
      if (password.length >= 10) {
        setValidPassword(3);
      } else if (password.length >= 8) {
        setValidPassword(2);
      } else {
        setValidPassword(1);
      }
    } else {
      setValidPassword(0);
    }
  };

  useEffect(() => {
    validateEmail();
    validatePassword();
    const stepValidations = [
      () => firstName.trim().length > 0 && lastName.trim().length > 0,
      () => dob instanceof Date && !isNaN(dob),
      () => username.trim().length > 0,
      () => selectedAvatar !== null,
      () =>
        validEmail &&
        password.length >= 7 &&
        confirmPassword.trim() === password.trim(),
    ];
    setValid(stepValidations[step]());
  }, [
    firstName,
    lastName,
    dob,
    username,
    selectedAvatar,
    email,
    password,
    confirmPassword,
    step,
  ]);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleRegistration();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={{ flexGrow: 1 }}>
          <Text style={styles.progressText}>
            Step {step + 1} of {steps.length}
          </Text>
          <ProgressBar
            progress={(step + 1) / steps.length}
            color="#2ecc71"
            style={styles.progressBar}
          />
          <View style={{ flex: 1, justifyContent: "space-between" }}>
            <View style={{ flex: 1, gap: 20 }}>
              <View style={styles.headerWrapper}>
                <Text style={styles.title}>{steps[step].title}</Text>
                <TouchableOpacity onPress={handleBack} disabled={step === 0}>
                  <FontAwesome
                    name="arrow-left"
                    size={24}
                    color={step === 0 ? "rgba(0,0,0,0.2)" : "#2ecc71"}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.formWrapper}>{steps[step].fields}</View>
              {step === 1 && showDatePicker && (
                <DateTimePicker
                  mode="date"
                  display="spinner"
                  value={dob}
                  onChange={(event, selectedDate) => {
                    if (selectedDate) {
                      setDob(selectedDate);
                    }
                  }}
                  textColor="#333333"
                  maximumDate={new Date(2005, 11, 31)}
                />
              )}
            </View>
          </View>
          <View style={styles.buttonWrapper}>
            <TouchableOpacity
              disabled={!valid || loading}
              style={[
                styles.nextButton,
                { backgroundColor: valid ? "#2ecc71" : "rgba(0,0,0,0.2)" },
              ]}
              onPress={handleNext}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.buttonText}>
                  {step === steps.length - 1 ? "Finish" : "Next"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 0,
    paddingTop: 0,
    backgroundColor: "#fff",
  },
  progressWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  progressText: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "right",
  },
  logo: {
    width: "100%",
    height: "35%",
  },
  headerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2ecc71",
  },
  formWrapper: {
    flex: 1,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    marginBottom: 5,
    fontSize: 16,
    fontWeight: "bold",
    color: "#34495e",
  },
  input: {
    height: 50,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  imageContainer: {
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
  },
  imageWrapper: {
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 30,
    backgroundColor: "white",
    margin: 5,
  },
  selectedAvatar: {
    borderColor: "#2ecc71",
    borderRadius: 50,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  buttonWrapper: {
    marginBottom: 20,
  },
  nextButton: {
    height: 50,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  backButton: {
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flex: 0.2,
  },
  backText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  privacyText: {
    fontSize: 12,
    color: "#7f8c8d",
    textAlign: "center",
  },
});

export default SignUpScreen;
