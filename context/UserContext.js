import React, { createContext, useContext, useState, useEffect } from "react";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../Firebase/config";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const retrieveUserDataLocally = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("@userData");
        return jsonValue != null ? JSON.parse(jsonValue) : null;
      } catch (error) {
        console.error("Error retrieving user data locally: ", error);
        return null;
      }
    };

    const fetchUserData = async (uid) => {
      try {
        const userDoc = await getDoc(doc(FIRESTORE_DB, "users", uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          await storeUserDataLocally(data);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };

    const storeUserDataLocally = async (userData) => {
      try {
        await AsyncStorage.setItem("@userData", JSON.stringify(userData));
      } catch (error) {
        console.error("Error storing user data locally: ", error);
      }
    };

    const clearUserDataLocally = async () => {
      try {
        await AsyncStorage.removeItem("@userData");
      } catch (error) {
        console.error("Error clearing user data locally: ", error);
      }
    };

    const initializeUserData = async () => {
      setLoading(true);
      const authUser = FIREBASE_AUTH.currentUser;
      if (authUser) {
        const localUserData = await retrieveUserDataLocally();
        if (localUserData) {
          setUserData(localUserData);
        }
        await fetchUserData(authUser.uid);
        setLoading(false);
      } else {
        await clearUserDataLocally();
        setUserData(null);
        setLoading(false);
      }
    };

    initializeUserData();

    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (authUser) => {
      if (authUser) {
        fetchUserData(authUser.uid);
      } else {
        setUserData(null);
        clearUserDataLocally();
      }
    });

    return () => unsubscribe();
  }, []);

  const updateProfilePicture = async (userId, downloadURL) => {
    if (!userId || !downloadURL) return;
    try {
      const userDocRef = doc(FIRESTORE_DB, "users", userId);
      await updateDoc(userDocRef, { picture: downloadURL });

      // Update local state
      setUserData((prevData) => ({
        ...prevData,
        picture: downloadURL,
      }));
    } catch (error) {
      console.error("Failed to update profile picture:", error);
    }
  };

  return (
    <UserContext.Provider value={{ userData, loading, updateProfilePicture }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
