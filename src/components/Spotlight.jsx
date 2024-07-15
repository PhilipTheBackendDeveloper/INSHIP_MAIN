import React, { useState, useEffect, useRef } from "react";
import {
  View,
  FlatList,
  Dimensions,
  SafeAreaView,
  RefreshControl,
  Text,
  StyleSheet,
} from "react-native";
import { fetchSpotlights } from "../../utils/fetchSpotlights";
import VideoCard from "../components/VideoCard";
import Header from "../components/Header";
import CustomLoader from "./CustomLoader";
import { useUser } from "../../context/UserContext";
import { storyPostUpload } from "../../utils/storyPostUpload";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { FIRESTORE_DB } from "../../Firebase/config";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import BottomSheetModals from "./BottomSheetModal";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

const Spotlight = ({ reload }) => {
  const [data, setData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [spotlightUrl, setSpotlightUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [comments, setComments] = useState(null);
  const [commentLoading, setCommentLoading] = useState(false);
  const [toggleBackSheetModal, setToggleBackSheetModal] = useState(false);
  const [postUrl, setPostUrl] = useState(null);
  const [postOwnerId, setPostOwnerId] = useState(null);
  const { userData } = useUser();
  const currentUserId = userData?.id;
  const [error, setError] = useState(null);
  const flatListRef = useRef(null);

  const showInfoToast = (message) => {
    Toast.show({
      type: "customInfoToast",
      text1: message,
      topOffset: 50,
    });
  };

  const showSuccessToast = (message) => {
    Toast.show({
      type: "customSuccessToast",
      text1: message,
      topOffset: 50,
    });
  };

  const showErrorToast = (message) => {
    Toast.show({
      type: "customErrorToast",
      text1: message,
      topOffset: 50,
    });
  };

  const fetchAndSetSpotlights = async () => {
    const spotlights = await fetchSpotlights();
    await AsyncStorage.setItem("spotlights", JSON.stringify(spotlights));
    setData(spotlights);
  };

  useEffect(() => {
    const loadSpotlights = async () => {
      try {
        setLoading(true);
        const localSpotlights = await AsyncStorage.getItem("spotlights");
        if (localSpotlights) {
          setData(JSON.parse(localSpotlights));
        } else {
          await fetchAndSetSpotlights();
        }
      } catch (error) {
        console.log("Failed to get data from async storage: " + error);
        setError("Failed to load spotlights.");
        showInfoToast("Oops, something went wrong");
      } finally {
        setLoading(false);
      }
    };

    loadSpotlights();

    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
    }
  }, [reload]);

  const reloadSpotlights = async () => {
    try {
      setRefreshing(true);
      await fetchAndSetSpotlights();
    } catch (error) {
      console.log("Failed to reload spotlights: " + error);
      setError("Failed to reload spotlights.");
      showInfoToast("Oops, something went wrong");
    } finally {
      setRefreshing(false);
    }
  };

  const handleEndReached = () => {
    console.log("You have reached the end of the videos.");
  };

  const onViewableItemsChanged = ({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
    setComments(null);
  };

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const updateUserPosts = async (url) => {
    const docRef = doc(FIRESTORE_DB, "users", currentUserId);

    await updateDoc(docRef, {
      posts: arrayUnion({
        url: url,
        comments: [],
      }),
    });
  };

  const addSpotlight = async () => {
    try {
      const downloadUrl = await storyPostUpload(
        null,
        currentUserId,
        setUploadProgress,
        "spotlight",
        userData
      );
      if (downloadUrl) {
        updateUserPosts(downloadUrl);
        showSuccessToast("Spotlight uploaded");
        setSpotlightUrl(downloadUrl);
      }
      return downloadUrl;
    } catch (error) {
      setError("Failed to upload spotlight");
      showErrorToast("Oops, something went wrong");
      console.log(error);
    }
  };

  const handleOpenPress = (url, userId) => {
    setPostOwnerId(userId);
    setPostUrl(url);
    setToggleBackSheetModal((prev) => !prev);
    fetchComments(url, userId);
  };

  const fetchComments = async (url, userId) => {
    setCommentLoading(true);
    try {
      const docRef = doc(FIRESTORE_DB, "users", userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const post = data.posts.find((item) => item?.url === url);

        if (post) {
          setComments(post.comments);
        } else {
          console.log("No such post!");
        }
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching document: ", error);
      showInfoToast("Oops, something went wrong");
    } finally {
      setCommentLoading(false);
    }
  };

  const renderItem = ({ item, index }) => (
    <VideoCard
      video={item}
      isActive={index === activeIndex}
      handleOpenPress={handleOpenPress}
      totalComments={comments?.length}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {uploadProgress > 0 && uploadProgress < 100 && (
        <View style={styles.overlay}>
          <CustomLoader />
          <Text style={styles.loaderText}>{uploadProgress.toFixed(2)}%</Text>
        </View>
      )}
      <View
        style={{
          flex: 1,
          backgroundColor: "transparent",
          position: "relative",
        }}
      >
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            zIndex: 999,
          }}
        >
          <Header header="Spotlight" addSpotlight={addSpotlight} />
        </View>
        {(loading || refreshing) && (
          <View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 50,
              alignItems: "center",
              justifyContent: "center",
              zIndex: 999,
            }}
          >
            <CustomLoader />
          </View>
        )}
        <FlatList
          ref={flatListRef}
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item?.id}
          snapToAlignment="start"
          snapToInterval={SCREEN_HEIGHT}
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          pagingEnabled
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          refreshControl={
            <RefreshControl
              onRefresh={reloadSpotlights}
              refreshing={refreshing}
              tintColor="transparent"
            />
          }
        />
      </View>

      {toggleBackSheetModal && (
        <BottomSheetModals
          comments={comments}
          setComments={setComments}
          toggleBackSheetModal={toggleBackSheetModal}
          setToggleBackSheetModal={setToggleBackSheetModal}
          commentLoading={commentLoading}
          postUrl={postUrl}
          postOwnerId={postOwnerId}
        />
      )}
    </SafeAreaView>
  );
};

export default Spotlight;

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999999,
  },
  loaderText: {
    color: "#fff",
    fontWeight: "bold",
    letterSpacing: 0.5,
    textAlign: "center",
    width: "100%",
  },
  mainContentContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  contentContainer: {
    flex: 1,
  },
  input: {
    margin: 8,
    marginBottom: 100,
    borderRadius: 10,
    fontSize: 16,
    lineHeight: 20,
    padding: 8,
    backgroundColor: "rgba(151, 151, 151, 0.25)",
  },
});
