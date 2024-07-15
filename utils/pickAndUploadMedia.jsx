import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { FIREBASE_STORAGE } from '../Firebase/config';

export const pickAndUploadMedia = async (setUploadProgress, setLocalMediaUri) => {
  try {
    // Pick media (image or video) from library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (result.canceled) {
      return;
    }

    // Get the URI of the picked media
    const uri = result.assets[0].uri;
    const type = result.assets[0].type; // "image" or "video"

    // Set the local media URI
    setLocalMediaUri(uri);

    // Fetch the media as a blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Create a reference to Firebase Storage
    const storageRef = ref(FIREBASE_STORAGE, `chatMedia/${Date.now()}`);

    // Upload the media
    const uploadTask = uploadBytesResumable(storageRef, blob);

    // Return a promise that resolves with the download URL
    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload failed:", error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setUploadProgress(100); // Ensure progress is set to 100% when done
            resolve({ url: downloadURL, type });
          } catch (error) {
            console.error("Failed to get download URL:", error);
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    throw error;
  }
};
