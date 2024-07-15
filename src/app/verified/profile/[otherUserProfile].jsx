import React, { useState, useEffect } from "react";
import {
  Text,
  Pressable,
  StyleSheet,
  View,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
} from "react-native";
import Toast from "react-native-toast-message";
import processUserImage from "../../../../utils/processUserImage";
import { router, useLocalSearchParams } from "expo-router";
import {
  FontAwesome,
  FontAwesome6,
  MaterialCommunityIcons,
  Feather,
  MaterialIcons,
  Ionicons,
} from "react-native-vector-icons";
import {
  getDoc,
  doc,
  updateDoc,
  arrayRemove,
  arrayUnion,
} from "firebase/firestore";
import { FIRESTORE_DB } from "../../../../Firebase/config";
import { Image } from "expo-image";
import { useUser } from "../../../../context/UserContext";
import { useChatStore } from "../../../../context/ChatContext";
import { fetchSpotlights } from "../../../../utils/fetchSpotlights";
import { fetchStories } from "../../../../utils/fetchStories";
import CustomLoader from "../../../components/CustomLoader";
import { Video, ResizeMode } from "expo-av";
import { useTheme } from "../../../../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HEADER_MAX_HEIGHT = 280;
const HEADER_MIN_HEIGHT = 0;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;
const { width } = Dimensions.get("window");
const CARD_WIDTH = width / 3;

const UserProfile = () => {
  const { id, firstname, lastname, username, avatar } = useLocalSearchParams();
  const [profilePic, setProfilePic] = useState(null);
  const [tab, setTab] = useState("stories");
  const [stories, setStories] = useState([]);
  const [spotlights, setSpotlights] = useState([]);
  const [selected, setSelected] = useState(null);
  const [tabLoading, setTabLoading] = useState(false);
  const [spotlightLoading, setSpotlightsLoading] = useState(false);
  const [optionsModal, setOptionsModal] = useState(false);
  const scrollY = new Animated.Value(0);
  const { userData } = useUser();
  const { theme } = useTheme();
  const { changeBlock, isReceiverBlocked, isCurrentUserBlocked } =
    useChatStore();

  const currentUser = userData;
  const currentUserId = currentUser.id;

  const blurhash =
    "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

  useEffect(() => {
    if (id) {
      getUserPic();
      loadCurrentUserStories(id);
      loadCurrentUserSpotlights(id);
    }
  }, [id]);

  const getUserPic = async () => {
    try {
      const userDoc = await getDoc(doc(FIRESTORE_DB, "users", id));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.picture) {
          setProfilePic(userData.picture);
        } else {
          console.log("No picture found in user data");
        }
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching user document:", error);
    }
  };

  const handleBlock = async () => {
    changeBlock();
    const userDocRef = doc(FIRESTORE_DB, "users", currentUserId);
    await updateDoc(userDocRef, {
      blocked: isReceiverBlocked ? arrayRemove(id) : arrayUnion(id),
    });
  };

  const showErrorToast = (message) => {
    Toast.show({
      type: "customErrorToast",
      text1: message,
    });
  };

  const toggleTab = (tab) => {
    setTab(tab);
  };

  const loadCurrentUserStories = async (id) => {
    try {
      setTabLoading(true);
      const fetchedStories = await fetchStories();
      const storiesWithUserDetails = await Promise.all(
        fetchedStories.map(async (story) => {
          const userDetails = await fetchUserDetails(story.userId);
          return { ...story, userDetails };
        })
      );

      const currentUserStories = storiesWithUserDetails.filter(
        (item) => item.userId === id
      );
      setStories(currentUserStories);
      //   await AsyncStorage.setItem('currentUserStories', JSON.stringify(currentUserStories));
    } catch (error) {
      console.error("Error loading stories:", error);
      showErrorToast();
    } finally {
      setTabLoading(false);
    }
  };

  const loadCurrentUserSpotlights = async (id) => {
    try {
      setSpotlightsLoading(true);
      const fetchedSpotlights = await fetchSpotlights();
      const spotlightsWithUserDetails = await Promise.all(
        fetchedSpotlights.map(async (spotlight) => {
          const userDetails = await fetchUserDetails(spotlight.userId);
          return { ...spotlight, userDetails };
        })
      );

      const currentUserSpotlights = spotlightsWithUserDetails.filter(
        (item) => item.userId === id
      );
      setSpotlights(currentUserSpotlights);
      //   await AsyncStorage.setItem('currentUserSpotlights', JSON.stringify(currentUserSpotlights));
    } catch (error) {
      console.error("Error loading spotlights:", error);
    } finally {
      setSpotlightsLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const docRef = doc(FIRESTORE_DB, "users", userId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
    return null;
  };

  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: "clamp",
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.5, 0],
    extrapolate: "clamp",
  });

  const imageTranslate = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -50],
    extrapolate: "clamp",
  });

  const toggleOptionsModal = () => {
    setOptionsModal((prev) => !prev);
  };

  const handlePressStory = (story) => {
    setSelected(story);
  };

  const handleClosePreview = () => {
    setSelected(null);
  };

  const renderItem = ({ item }) => (
    <Pressable
      onPress={() => handlePressStory(item)}
      style={styles.storyContainer}
    >
      {item.type.startsWith("image") && (
        <Image
          source={{ uri: item.url }}
          placeholder={blurhash}
          style={styles.storyImage}
        />
      )}
      {item.type.startsWith("video") && (
        <Video
          source={{ uri: item.url }}
          style={styles.storyVideo}
          resizeMode="cover"
          shouldPlay={selected !== null ? false : true}
          isLooping={false}
          isMuted
        />
      )}
      <View style={{ position: "absolute", top: 5, right: 5, zIndex: 50 }}>
        <MaterialIcons
          name={item.type.startsWith("image") ? "photo" : "video-collection"}
          size={15}
          color="#fff"
        />
      </View>
    </Pressable>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      <View style={styles.buttonContainer}>
        <Pressable onPress={() => router.back()} style={styles.button}>
          <FontAwesome6 name="chevron-left" color="#fff" size={20} />
        </Pressable>
        <Pressable style={styles.button}>
          <FontAwesome name="share-square-o" color="#fff" size={20} />
        </Pressable>
      </View>
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <Animated.Image
          source={
            id === undefined
              ? require("../../../../assets/aiBannerPic.png")
              : isReceiverBlocked
              ? require("../../../../assets/placeholder.png")
              : profilePic
              ? { uri: profilePic }
              : processUserImage(avatar)
          }
          style={[
            styles.headerImage,
            {
              opacity: imageOpacity,
              transform: [{ translateY: imageTranslate }],
            },
          ]}
        />
      </Animated.View>
      <Animated.View style={{ flex: 1, paddingTop: HEADER_MAX_HEIGHT }}>
        <View
          style={[
            styles.scrollViewInner,
            { backgroundColor: theme.backgroundColor },
          ]}
        >
          {id ? (
            <>
              <View style={styles.userContainer}>
                <View style={[styles.userContainer, { gap: 8 }]}>
                  <Pressable style={styles.userImageContainer}>
                    <Image
                      source={processUserImage(avatar)}
                      style={styles.userImage}
                    />
                  </Pressable>
                  <View style={styles.userInfoContainer}>
                    <Text style={[styles.userInfo, { color: theme.textColor }]}>
                      {firstname} {lastname}
                    </Text>
                    <Text style={styles.userUsername}>{username}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.tabContainer}>
                <Pressable
                  onPress={() => toggleTab("stories")}
                  style={
                    tab === "stories"
                      ? [
                          styles.tabButton,
                          styles.activeTab,
                          { borderBottomColor: theme.textColor },
                        ]
                      : styles.tabButton
                  }
                >
                  <Text
                    style={
                      tab === "stories"
                        ? [
                            styles.tabText,
                            styles.activeTabText,
                            { color: theme.textColor },
                          ]
                        : styles.tabText
                    }
                  >
                    Stories {!tabLoading ? stories.length : "-"}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => toggleTab("spotlights")}
                  style={
                    tab === "spotlights"
                      ? [
                          styles.tabButton,
                          styles.activeTab,
                          { borderBottomColor: theme.textColor },
                        ]
                      : styles.tabButton
                  }
                >
                  <Text
                    style={
                      tab === "spotlights"
                        ? [
                            styles.tabText,
                            styles.activeTabText,
                            { color: theme.textColor },
                          ]
                        : styles.tabText
                    }
                  >
                    Spotlight {!tabLoading ? spotlights.length : "-"}
                  </Text>
                </Pressable>
              </View>
            </>
          ) : (
            <View style={styles.userContainer}>
              <View style={[styles.userContainer, { gap: 8 }]}>
                <Pressable style={styles.userImageContainer}>
                  <Image
                    source={require("../../../../assets/aiChatPic.png")}
                    style={styles.userImage}
                  />
                </Pressable>
                <View style={styles.userInfoContainer}>
                  <Text style={[styles.userInfo, { color: theme.textColor }]}>
                    My AI
                  </Text>
                  <Text style={styles.userUsername}>myai</Text>
                </View>
              </View>
            </View>
          )}
        </View>
        <View style={styles.contentContainer}>
          {tabLoading && (
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <CustomLoader />
            </View>
          )}
          {!id ? (
            <View />
          ) : (
            <>
              {tab === "stories" && (
                <FlatList
                  data={stories}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.url}
                  horizontal={false}
                  numColumns={3}
                  contentContainerStyle={styles.flatListContent}
                  showsVerticalScrollIndicator={false}
                />
              )}
              {tab === "spotlights" && (
                <FlatList
                  data={spotlights}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.url}
                  horizontal={false}
                  numColumns={3}
                  contentContainerStyle={styles.flatListContent}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </>
          )}
        </View>
      </Animated.View>
      {selected && (
        <Modal visible={true} transparent={true} animationType="fade">
          <SafeAreaView style={styles.modalContainer}>
            <StatusBar hidden={Platform.OS === "ios" ? false : true} />
            <View style={styles.modalContent}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  zIndex: 9999,
                }}
              >
                <Pressable
                  onPress={() => handleProfile(selected)}
                  style={styles.top}
                >
                  <View
                    style={{
                      backgroundColor: "orange",
                      borderRadius: 50,
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      source={processUserImage(selected.userDetails.avatar)}
                      style={styles.modalAvatar}
                    />
                  </View>
                  <View style={{ gap: 4 }}>
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="trail"
                      style={styles.modalUsername}
                    >
                      {selected.userDetails
                        ? selected.userDetails.Username
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
                <Pressable
                  onPress={handleClosePreview}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={25} color="#fff" />
                </Pressable>
              </View>
              {selected &&
              selected.type &&
              selected.type.startsWith("image") ? (
                <Image
                  source={{ uri: selected.url }}
                  style={styles.modalMedia}
                />
              ) : selected &&
                selected.type &&
                selected.type.startsWith("video") ? (
                <Video
                  source={{ uri: selected.url }}
                  style={styles.modalMedia}
                  resizeMode={ResizeMode.CONTAIN}
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
                onPress={handleClosePreview}
                style={[styles.pressable, styles.profileButton]}
              >
                <Text style={styles.buttonText}>View Profile</Text>
              </Pressable>
              <Pressable
                onPress={toggleOptionsModal}
                style={[styles.pressable, styles.miniButtons]}
              >
                <Image
                  source={processUserImage(selected.userDetails.avatar)}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    position: "relative",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#2ecc71",
    overflow: "hidden",
  },
  headerImage: {
    width: "100%",
    height: HEADER_MAX_HEIGHT,
    resizeMode: "cover",
  },
  scrollViewInner: {
    padding: 20,
    backgroundColor: "white",
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
  },
  userImageContainer: {
    borderWidth: 3,
    borderColor: "#2ecc71",
    borderRadius: 50,
    backgroundColor: "orange",
  },
  userImage: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
  },
  userInfoContainer: {
    justifyContent: "center",
    gap: 8,
  },
  userInfo: {
    fontSize: 20,
    color: "#333333",
    fontWeight: "bold",
  },
  userUsername: {
    fontSize: 12,
    fontWeight: "500",
    color: "#7f8c8d",
  },
  logoutButton: {
    width: "100%",
    paddingHorizontal: 10,
  },
  logoutText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    fontWeight: "bold",
  },
  buttonContainer: {
    position: "absolute",
    top: 50,
    alignSelf: "center",
    zIndex: 999,
    backgroundColor: "transparent",
    paddingHorizontal: 15,
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
  },
  button: {
    backgroundColor: "rgba(0,0,0,.35)",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    height: 40,
    width: 40,
    zIndex: 99999,
  },
  tabContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  tabButton: {
    width: "50%",
    padding: 10,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderColor: "#333333",
  },
  tabText: {
    fontWeight: "bold",
    fontSize: 15,
    textAlign: "center",
    color: "#7f8c8d",
  },
  activeTabText: {
    color: "#333333",
  },
  contentContainer: {
    flex: 1,
  },
  storiesList: {
    justifyContent: "space-between",
  },
  storyContainer: {
    width: CARD_WIDTH,
    height: 200,
    backgroundColor: "#f0f0f0",
  },
  storyImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  storyVideo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  spotlightContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  spotlightContent: {
    backgroundColor: "blue",
    width: "100%",
    height: 200,
  },
  spotlightText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    padding: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "black",
    borderRadius: 30,
    overflow: "hidden",
  },
  closeButton: {
    zIndex: 10,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    gap: 8,
    zIndex: 99,
  },
  closeButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContent: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "black",
    width: "100%",
  },
  modalMedia: {
    width: "100%",
    height: "100%",
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

export default UserProfile;
