import { getStorage, ref, listAll, getDownloadURL, getMetadata } from "firebase/storage";

const storage = getStorage();

export const fetchStories = async () => {
  const storiesRef = ref(storage, 'stories');
  const stories = [];

  try {
    const storyList = await listAll(storiesRef);

    for (const itemRef of storyList.items) {
      const url = await getDownloadURL(itemRef);
      const metadata = await getMetadata(itemRef);
      stories.push({ url, userId: metadata.customMetadata.userId, type: metadata.customMetadata.type });
    }
  } catch (error) {
    console.error("Error fetching stories:", error);
  }

  return stories;
};
