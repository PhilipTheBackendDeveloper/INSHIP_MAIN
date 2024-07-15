//TODO: play around with the theme

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import SearchBar from "../../../components/SearchBar";
import {
  MaterialIcons,
  MaterialCommunityIcons,
} from "react-native-vector-icons";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import {
  collection,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  arrayUnion,
  doc,
  where,
  getDoc,
} from "firebase/firestore";
import { FIRESTORE_DB } from "../../../../Firebase/config";
import processUserImage from "../../../../utils/processUserImage";
import { useUser } from "../../../../context/UserContext";
import { Image } from "expo-image";
import * as Contacts from "expo-contacts";
import { useTheme } from "../../../../context/ThemeContext";

const NewChat = () => {
  const navigation = useNavigation();
  const { userData } = useUser();
  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    getContactsPermission();
  }, []);

  const getContactsPermission = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === "granted") {
      setPermissionGranted(true);

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Emails, Contacts.Fields.PhoneNumbers],
      });

      if (data.length > 0) {
        const sortedContacts = data.sort((a, b) => {
          if (a.name < b.name) return -1;
          if (a.name > b.name) return 1;
          return 0;
        });

        setContacts(sortedContacts);
      }
    } else {
      setPermissionGranted(false);
    }
  };

  const handleSearchQuery = async (text) => {
    setLoading(true);
    try {
      const userRef = collection(FIRESTORE_DB, "users");

      const usernameQuery = query(userRef, where("Username", "==", text));
      const usernameSnapshot = await getDocs(usernameQuery);

      const firstNameQuery = query(userRef, where("FirstName", "==", text));
      const firstNameSnapshot = await getDocs(firstNameQuery);

      let combinedResults = [];
      usernameSnapshot.forEach((doc) => {
        combinedResults.push({ id: doc.id, ...doc.data() });
      });
      firstNameSnapshot.forEach((doc) => {
        combinedResults.push({ id: doc.id, ...doc.data() });
      });

      if (combinedResults.length > 0) {
        setUser(combinedResults[0]);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    const chatRef = collection(FIRESTORE_DB, "chats");
    const userChatsRef = collection(FIRESTORE_DB, "userchats");

    try {
      const newChatRef = doc(chatRef);

      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      const currentTime = Date.now();

      const userChatDocRef = doc(userChatsRef, user.id);
      const currentUserChatDocRef = doc(userChatsRef, userData.id);

      const userChatDocSnap = await getDoc(userChatDocRef);
      if (!userChatDocSnap.exists()) {
        await setDoc(userChatDocRef, { chats: [] });
      }

      const currentUserChatDocSnap = await getDoc(currentUserChatDocRef);
      if (!currentUserChatDocSnap.exists()) {
        await setDoc(currentUserChatDocRef, { chats: [] });
      }

      await updateDoc(userChatDocRef, {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: userData.id,
          updatedAt: currentTime,
        }),
      });

      await updateDoc(currentUserChatDocRef, {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.id,
          updatedAt: currentTime,
        }),
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleUserProfile = (user) => {
    router.replace({
      pathname: "/verified/profile/[otherUserProfile]",
      params: {
        id: user.id,
        firstname: user.FirstName,
        lastname: user.LastName,
        username: user.Username,
        avatar: user.avatar,
      },
    });
  };

  const onActualChange = (text) => {
    handleSearchQuery(text);
  };

  if (!permissionGranted) {
    return (
      <View
        style={{
          backgroundColor: theme.backgroundColor,
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          gap: 20,
        }}
      >
        <View
          style={{
            maxHeight: "40%",
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            source={require("../../../../assets/contactsPermission.png")}
            style={{ width: "90%", height: "100%", objectFit: "cover" }}
          />
        </View>
        <View
          style={{
            gap: 20,
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ textAlign: "center", color: theme.grayText }}>
            We need your permission to access your contacts
          </Text>
          <TouchableOpacity
            onPress={getContactsPermission}
            style={{
              width: "90%",
              padding: 8,
              backgroundColor: theme.primaryColor,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 5,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>
              Grant Permission
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ backgroundColor: theme.backgroundColor, flex: 1 }}>
      <SearchBar
        onChangeText={handleSearchQuery}
        onActualChange={onActualChange}
        color="#f5f5f5"
      />
      <View
        style={{
          paddingHorizontal: 15,
          backgroundColor: theme.backgroundColor,
          paddingBottom: 5,
        }}
      >
        <View style={{ marginVertical: 0 }}>
          <Text style={[styles.title, { color: theme.textColor }]}>
            Results
          </Text>
        </View>
        {loading ? (
          <ActivityIndicator size="small" color={theme.primaryColor} />
        ) : (
          user && (
            <Pressable
              onPress={() => handleUserProfile(user)}
              style={[
                styles.pressable,
                styles.shadow,
                { backgroundColor: "rgba(225, 255, 255, 0.5)" },
              ]}
            >
              <View style={styles.userAvatar}>
                <Image
                  source={processUserImage(user.avatar)}
                  style={{ width: "100%", height: "100%" }}
                />
              </View>
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: theme.textColor }]}>
                  {user.FirstName} {user.LastName}
                </Text>
                <View style={[styles.userDetails, { color: theme.grayText }]}>
                  <MaterialIcons
                    name="chat-bubble-outline"
                    size={12}
                    color="gray"
                  />
                  <Text style={styles.userUsername}>{user.Username}</Text>
                </View>
              </View>
              <Pressable onPress={handleAdd} style={styles.addButton}>
                <MaterialCommunityIcons
                  name="account-plus"
                  size={18}
                  color="#3B2F2F"
                />
                <Text style={styles.addButtonText}>Add</Text>
              </Pressable>
            </Pressable>
          )
        )}
      </View>
      <View
        style={[styles.container, { backgroundColor: theme.backgroundColor }]}
      >
        <Text style={[styles.title, { color: theme.textColor }]}>Contacts</Text>
        <View style={styles.contactListContainer}>
          <FlatList
            data={contacts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.contactItem,
                  { backgroundColor: "rgba(0, 0, 0, 0.1)" },
                ]}
              >
                <View style={styles.contactAvatar}>
                  <Image
                    source={require("../../../../assets/avatars/user.png")}
                    style={styles.avatarImage}
                  />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{item.name}</Text>
                  {item.phoneNumbers && item.phoneNumbers.length > 0 && (
                    <Text style={styles.contactDetail}>
                      Phone: {item.phoneNumbers[0].number}
                    </Text>
                  )}
                </View>
              </View>
            )}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default NewChat;

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 15,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    // marginVertical: 5,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    marginVertical: 20,
  },
  userAvatar: {
    width: 50,
    height: 50,
    backgroundColor: "#f0f0f0",
    borderRadius: 25,
    overflow: "hidden",
  },
  userInfo: {
    flex: 1,
    marginLeft: 10,
    gap: 3,
  },
  userName: {
    fontSize: 16,
    fontWeight: "500",
  },
  userDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  userUsername: {
    fontSize: 12,
    color: "gray",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  addButtonText: {
    fontWeight: "bold",
    color: "#3B2F2F",
    marginLeft: 5,
  },
  contactListContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    overflow: "hidden",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  contactAvatar: {
    width: 40,
    height: 40,
    backgroundColor: "#2ecc71",
    borderRadius: 20,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  contactInfo: {
    marginLeft: 10,
  },
  contactName: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(0,0,0,0.8)",
  },
  contactDetail: {
    fontSize: 12,
    color: "#888",
  },
});
