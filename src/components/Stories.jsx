//TODO: Check whether users are firends or not and display add button off the outcome

import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Pressable,
  Modal,
  RefreshControl,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Header from "../components/Header";
import { useUsers } from "../../context/UsersContext";
import { Image } from "expo-image";
import { Video } from "expo-av";
import { doc, getDoc } from "firebase/firestore";
import { FIRESTORE_DB } from "../../Firebase/config";
import processUserImage from "../../utils/processUserImage";
import { fetchStories } from "../../utils/fetchStories";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomLoader from "./CustomLoader";
import {
  MaterialIcons,
  MaterialCommunityIcons,
  Feather,
  Ionicons,
} from "react-native-vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { router } from "expo-router";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");

const Stories = () => {
  const { users, loading } = useUsers();
  const [stories, setStories] = useState([]);
  const [storiesLoading, setStoriesLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [optionsModal, setOptionsModal] = useState(false);
  const { theme } = useTheme();

  const showInfoToast = (message) => {
    Toast.show({
      type: "customInfoToast",
      text1: message,
      topOffset: 50,
    });
  };

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const cachedStories = await AsyncStorage.getItem("stories");
      if (cachedStories) {
        setStories(JSON.parse(cachedStories));
        setStoriesLoading(false);
        return;
      }

      const fetchedStories = await fetchStories();
      const storiesWithUserDetails = await Promise.all(
        fetchedStories.map(async (story) => {
          const userDetails = await fetchUserDetails(story.userId);
          return { ...story, userDetails };
        })
      );

      setStories(storiesWithUserDetails);
      await AsyncStorage.setItem(
        "stories",
        JSON.stringify(storiesWithUserDetails)
      );
    } catch (error) {
      console.error("Error loading stories:", error);
      showInfoToast("Error loading stories. Try again");
    } finally {
      setStoriesLoading(false);
    }
  };

  const pullRefreshStories = async () => {
    const fetchedStories = await fetchStories();
    const storiesWithUserDetails = await Promise.all(
      fetchedStories.map(async (story) => {
        const userDetails = await fetchUserDetails(story.userId);
        return { ...story, userDetails };
      })
    );

    setStories(storiesWithUserDetails);
    await AsyncStorage.setItem(
      "stories",
      JSON.stringify(storiesWithUserDetails)
    );
  };

  const fetchUserDetails = async (userId) => {
    try {
      const docRef = doc(FIRESTORE_DB, "users", userId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      console.error("Error fetching user details:", error);
      showInfoToast("Oops, something went wrong");
    }
    return null;
  };

  const handlePressStory = (story) => {
    setSelectedStory(story);
  };

  const handleClosePreview = () => {
    setSelectedStory(null);
  };

  const onRefresh = async () => {
    setShowLoader(true);
    setRefreshing(true);
    await pullRefreshStories();
    setRefreshing(false);
    setShowLoader(false);
  };

  const handleProfile = (data) => {
    console.log("GO!");
    router.push({
      pathname: "/verified/profile/[otherUserProfile]",
      params: {
        id: data.userDetails.id,
        firstname: data.userDetails.FirstName,
        lastname: data.userDetails.LastName,
        username: data.userDetails.Username,
        avatar: data.userDetails.avatar,
      },
    });
    setSelectedStory(null);
  };

  const toggleOptionsModal = () => {
    setOptionsModal((prev) => !prev);
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.backgroundColor }]}
    >
      <Header header="Stories" />
      <View>
        {showLoader && (
          <View style={styles.loaderContainer}>
            <CustomLoader />
          </View>
        )}
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="transparent"
            />
          }
        >
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
              Friends
            </Text>
            <ScrollView
              style={styles.horizontalScrollView}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {users && users.length > 0 ? (
                users.map((item) => (
                  <View key={item.id} style={styles.userContainer}>
                    <View
                      style={[
                        styles.avatarContainer,
                        {
                          backgroundColor: theme.backgroundColor,
                          borderColor: theme.primaryColor,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.accountIconContainer,
                          { backgroundColor: theme.primaryColor },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name="account"
                          size={18}
                          color="white"
                        />
                      </View>
                      <View style={styles.avatar}>
                        <Image
                          source={processUserImage(item.avatar)}
                          style={styles.avatarImage}
                        />
                      </View>
                    </View>
                    <View style={styles.userDetailsContainer}>
                      <Text
                        style={[
                          styles.userFirstName,
                          { color: theme.textColor },
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {item.FirstName}
                      </Text>
                      <Text style={styles.userUsername} numberOfLines={1}>
                        {item.Username}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text>No data available!</Text>
              )}
            </ScrollView>
          </View>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
              Discover
            </Text>
            {storiesLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="gray" size="small" />
              </View>
            ) : (
              <View style={styles.storiesContainer}>
                {stories.map((story, index) => (
                  <Pressable
                    onPress={() => handlePressStory(story)}
                    key={index}
                    style={styles.storyItem}
                  >
                    <View
                      style={{
                        position: "absolute",
                        top: 5,
                        right: 5,
                        zIndex: 50,
                      }}
                    >
                      <MaterialIcons
                        name={
                          story.type.startsWith("image")
                            ? "photo"
                            : "video-collection"
                        }
                        size={15}
                        color="#fff"
                      />
                    </View>
                    {story && story.type && story.type.startsWith("image") ? (
                      <Image
                        source={{ uri: story.url }}
                        style={styles.storyMedia}
                      />
                    ) : story &&
                      story.type &&
                      story.type.startsWith("video") ? (
                      <Video
                        source={{ uri: story.url }}
                        style={styles.storyMedia}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text>Unsupported media type</Text>
                    )}
                    <LinearGradient
                      colors={["rgba(0,0,0,0.01)", "rgba(0,0,0,1)"]}
                      style={styles.storyOverlay}
                    >
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="trail"
                        style={styles.storyUsername}
                      >
                        {story.userDetails
                          ? story.userDetails.Username
                          : "Unknown"}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      {selectedStory && (
        <Modal visible={true} transparent={true} animationType="fade">
          <SafeAreaView style={styles.modalContainer}>
            <Pressable onPress={handleClosePreview} style={styles.closeButton}>
              <Ionicons name="close" size={25} color="white" />
            </Pressable>
            <View style={styles.modalContent}>
              <Pressable
                onPress={() => handleProfile(selectedStory)}
                style={styles.top}
              >
                <Image
                  source={processUserImage(selectedStory.userDetails.avatar)}
                  style={styles.modalAvatar}
                />
                <View style={{ gap: 4 }}>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="trail"
                    style={styles.modalUsername}
                  >
                    {selectedStory.userDetails
                      ? selectedStory.userDetails.Username
                      : "Unknown"}
                  </Text>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="trail"
                    style={styles.modalTime}
                  >
                    5 days ago
                  </Text>
                </View>
              </Pressable>
              {selectedStory &&
              selectedStory.type &&
              selectedStory.type.startsWith("image") ? (
                <Image
                  source={{ uri: selectedStory.url }}
                  style={styles.modalMedia}
                />
              ) : selectedStory &&
                selectedStory.type &&
                selectedStory.type.startsWith("video") ? (
                <Video
                  source={{ uri: selectedStory.url }}
                  style={styles.modalMedia}
                  resizeMode="cover"
                  shouldPlay
                  isLooping
                />
              ) : (
                <Text style={styles.errorText}>
                  Oops! Something went wrong.
                </Text>
              )}
            </View>
            <View style={styles.bottom}>
              <Pressable style={[styles.pressable, styles.miniButtons]}>
                <MaterialCommunityIcons
                  name="camera-wireless"
                  size={25}
                  color="white"
                />
              </Pressable>
              <Pressable
                onPress={() => handleProfile(selectedStory)}
                style={[styles.pressable, styles.profileButton]}
              >
                <Text style={styles.buttonText}>View Profile</Text>
              </Pressable>
              <Pressable
                onPress={toggleOptionsModal}
                style={[styles.pressable, styles.miniButtons]}
              >
                <Image
                  source={processUserImage(selectedStory.userDetails.avatar)}
                  style={[styles.modalAvatar, { width: 30, height: 30 }]}
                />
              </Pressable>
              <Pressable style={[styles.pressable, styles.miniButtons]}>
                <Feather name="more-horizontal" size={30} color="white" />
              </Pressable>
            </View>
            <Modal
              animationType="slide"
              visible={optionsModal}
              onBackdropPressed={toggleOptionsModal}
              transparent={true}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  borderRadius: 16,
                }}
              >
                <ScrollView
                  contentContainerStyle={{
                    flex: 1,
                    justifyContent: "flex-end",
                    backgroundColor: "transparent",
                    paddingHorizontal: 10,
                    paddingBottom: 25,
                    gap: 15,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "white",
                      minHeight: "30%",
                      borderRadius: 16,
                      padding: 10,
                    }}
                  >
                    <Text>Options</Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: "pink",
                      minHeight: "10%",
                      borderRadius: 16,
                      padding: 10,
                    }}
                  >
                    <Text>More options go dey here</Text>
                  </View>
                  <Pressable
                    onPress={toggleOptionsModal}
                    style={{
                      backgroundColor: "white",
                      minHeight: "5%",
                      borderRadius: 16,
                      padding: 10,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: 17,
                        color: "#333333",
                      }}
                    >
                      Done
                    </Text>
                  </Pressable>
                </ScrollView>
              </View>
            </Modal>
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  );
};

export default Stories;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loaderContainer: {
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    alignSelf: "center",
  },
  scrollViewContent: {
    paddingBottom: 50,
  },
  section: {
    marginHorizontal: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 3,
  },
  horizontalScrollView: {
    paddingVertical: 8,
  },
  userContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
    width: 80,
    gap: 4,
  },
  avatarContainer: {
    width: 75,
    height: 75,
    borderRadius: 40,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#2ecc71",
    position: "relative",
    marginBottom: 8,
  },
  accountIconContainer: {
    width: 50,
    height: 23,
    borderRadius: 12,
    backgroundColor: "#2ecc71",
    position: "absolute",
    bottom: -12,
    left: "50%",
    transform: [{ translateX: -25 }],
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99,
  },
  avatar: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000000",
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#fff",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
  },
  userDetailsContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  userFirstName: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#333333",
    textAlign: "center",
  },
  userUsername: {
    fontSize: 11,
    color: "#7f8c8d",
    textAlign: "center",
  },
  storiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 100,
  },
  storyItem: {
    width: "49%",
    height: 280,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 8,
    marginBottom: 8,
    overflow: "hidden",
  },
  storyMedia: {
    width: "100%",
    height: "100%",
  },
  storyOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 50,
    display: "flex",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  storyUsername: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "black",
    borderRadius: 30,
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 5,
    zIndex: 10,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    gap: 8,
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 99,
  },
  closeButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    overflow: "hidden",
    position: "relative",
  },
  modalMedia: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  errorText: {
    color: "red",
  },
  bottom: {
    height: 70,
    backgroundColor: "black",
    paddingTop: 8,
    paddingRight: 16,
    paddingLeft: 16,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "flex-start",
    gap: 12,
  },
  pressable: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    // paddingHorizontal: 12,
    minHeight: 50,
    maxHeight: 50,
    backgroundColor: "#333333",
  },
  miniButtons: {
    width: "15%",
  },
  profileButton: {
    flexDirection: "row",
    width: "50%",
    gap: 8,
  },
  buttonText: {
    fontWeight: "bold",
    color: "white",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  iconFlip: {
    transform: [{ scaleX: -1 }],
  },
  modalAvatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
  },
  modalUsername: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTime: {
    color: "#f5f5f5",
    fontSize: 12,
    fontWeight: "500",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
