import React, { createContext, useContext, useState, useEffect } from "react";
import { FIRESTORE_DB, FIREBASE_AUTH } from "../Firebase/config";
import { collection, getDocs } from "firebase/firestore";

const UsersContext = createContext();

export const UsersProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);

      const unsubscribe = FIREBASE_AUTH.onAuthStateChanged(
        async (currentUser) => {
          if (currentUser) {
            try {
              console.log("Current User:", currentUser); // Log current user
              const querySnapshot = await getDocs(
                collection(FIRESTORE_DB, "users")
              );
              const usersList = [];
              querySnapshot.forEach((doc) => {
                if (doc.id !== currentUser.uid) {
                  usersList.push({ id: doc.id, ...doc.data() });
                }
              });
              setUsers(usersList);
            } catch (error) {
              console.error("Error fetching users: ", error);
            }
          }
          setLoading(false);
        }
      );

      return () => unsubscribe();
    };

    fetchUsers();
  }, []);

  return (
    <UsersContext.Provider value={{ users, loading }}>
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => useContext(UsersContext);
