import { getStorage, ref, listAll, getDownloadURL, getMetadata } from "firebase/storage";

const storage = getStorage();

export const fetchSpotlights = async () => {
  const storiesRef = ref(storage, 'spotlight');
  const stories = [];

  try {
    const storyList = await listAll(storiesRef);

    for (const itemRef of storyList.items) {
      const url = await getDownloadURL(itemRef);
      const metadata = await getMetadata(itemRef);
      if (metadata.customMetadata.type === 'video') {
        stories.push({ id: itemRef.fullPath, url, userId: metadata.customMetadata.userId, type: metadata.customMetadata.type, username: metadata.customMetadata.username, avatar: metadata.customMetadata.avatar });
      }
    }
  } catch (error) {
    console.error("Error fetching stories:", error);
  }

  return stories;
};
