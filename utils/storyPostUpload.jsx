import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import * as ImagePicker from 'expo-image-picker';
import { FIREBASE_STORAGE } from '../Firebase/config';

const uploadFileToFirebase = (fileRef, blob, metadata, setUploadProgress) => {
  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(fileRef, blob, metadata);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Error during upload:", error);
        reject(null);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        } catch (error) {
          console.error("Error getting download URL:", error);
          reject(null);
        }
      }
    );
  });
};

export const storyPostUpload = async (fileUri, userId, setUploadProgress, sRef, userData) => {
  try {
    let uri, type, blob;

    if ((sRef === 'spotlight' || sRef === 'stories') && fileUri === null) {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (result.canceled) {
        console.log('Image picker was canceled');
        return null;
      }

      uri = result.assets[0].uri;
      type = result.assets[0].type;
    } else {
      uri = fileUri;
    }

    const response = await fetch(uri);
    blob = await response.blob();
    type = type || blob.type;

    const fileRef = ref(FIREBASE_STORAGE, `${sRef}/${Date.now()}`);
    const metadata = {
      customMetadata: {
        userId: userId,
        type: type,
        ...(userData && {
          username: userData.Username,
          avatar: userData.avatar,
        }),
      },
    };

    const downloadUrl = await uploadFileToFirebase(fileRef, blob, metadata, setUploadProgress);
    return downloadUrl;

  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
};
