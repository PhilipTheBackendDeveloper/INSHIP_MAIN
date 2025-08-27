// import { getApps, initializeApp, getApp } from "firebase/app";
// import {
//   initializeAuth,
//   getAuth,
//   getReactNativePersistence,
// } from "firebase/auth";
// import { getStorage } from "firebase/storage";
// import { getFirestore } from "firebase/firestore";
// import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// const firebaseConfig = {
//   apiKey: process.env.EXPO_PUBLIC_API_KEY,
//   authDomain: process.env.EXPO_PUBLIC_AUTH_DOMAIN,
//   projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
//   storageBucket: process.env.EXPO_PUBLIC_STORAGE_BUCKET,
//   messagingSenderId: process.env.EXPO_PUBLIC_MESSAGE_SENDER_ID,
//   appId: process.env.EXPO_PUBLIC_APP_ID
// };

// let app;
// let auth;

// if (!getApps().length) {
//   app = initializeApp(firebaseConfig);
//   auth = initializeAuth(app, {
//     persistence: getReactNativePersistence(ReactNativeAsyncStorage),
//   });
// } else {
//   app = getApp();
//   auth = getAuth(app);
// }

// export const FIREBASE_APP = app;
// export const FIREBASE_AUTH = auth;
// export const FIRESTORE_DB = getFirestore(app);
// export const FIREBASE_STORAGE = getStorage(app);
