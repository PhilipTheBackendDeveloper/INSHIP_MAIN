import React, { useEffect, useRef, useState } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import { shareAsync } from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import {
  Image,
  Pressable,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons, Foundation } from "react-native-vector-icons";

import FilterScrollView from "../../components/FilitersScroll";
import TabBar from "../../components/TabBar";
import Chat from "../../components/ChatLists";
import Stories from "../../components/Stories";
import Map from "../../components/Map";
import Spotlight from "../../components/Spotlight";
import TabBarPreview from "../../components/TabBarPreview";
import Header from "../../components/Header";
import { Video } from "expo-av";
import { FIRESTORE_DB } from "../../../Firebase/config";
import { useUser } from "../../../context/UserContext";
import { arrayUnion, updateDoc, doc } from "firebase/firestore";
import { storyPostUpload } from "../../../utils/storyPostUpload";
import CustomLoader from "../../components/CustomLoader";
import { router } from "expo-router";
import { useTheme } from "../../../context/ThemeContext";
import Toast from "react-native-toast-message";
import DotsLoader from "../../components/DotsLoader";

const HomeScreen = () => {
  const [facing, setFacing] = useState("front");
  const [flash, setFlash] = useState("off");
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState();
  const [video, setVideo] = useState();
  const [isRecording, setIsRecording] = useState(false);
  const cameraRef = useRef();
  const [camera, setCamera] = useState(true);
  const [maps, setMaps] = useState(false);
  const [chat, setChat] = useState(false);
  const [stories, setStories] = useState(false);
  const [spotlight, setSpotlight] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [spotRefresh, setSpotRefreshing] = useState(false);
  const [storyUrl, setStoryUrl] = useState(null);
  const [error, setError] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const { userData, loading } = useUser();
  const currentUserId = userData?.id;
  const { theme, darkMode } = useTheme();

  const showSuccessToast = (text) => {
    Toast.show({
      type: "customSuccessToast",
      text1: text,
      topOffset: 50,
    });
  };

  const showErrorToast = (text) => {
    Toast.show({
      type: "customErrorToast",
      text1: text,
      topOffset: 50,
    });
  };

  const toggleHint = () => {
    setShowHint(true);

    setTimeout(() => {
      setShowHint(false);
    }, 5000);
  };

  const handleCameraPress = () => {
    setCamera(true);
    setStories(false);
    setMaps(false);
    setChat(false);
    setSpotlight(false);
  };

  const handleChatPress = () => {
    setChat(true);
    setStories(false);
    setMaps(false);
    setCamera(false);
    setSpotlight(false);
  };

  const handleChatCam = () => {
    setCamera(true);
    setStories(false);
    setMaps(false);
    setChat(false);
    setSpotlight(false);
  };

  const handleStoriesPress = () => {
    setStories(true);
    setMaps(false);
    setCamera(false);
    setChat(false);
    setSpotlight(false);
  };

  const handleMapsPress = () => {
    setMaps(true);
    setCamera(false);
    setChat(false);
    setStories(false);
    setSpotlight(false);
  };

  const handleSpotlightPress = () => {
    setSpotlight(true);
    setMaps(false);
    setCamera(false);
    setChat(false);
    setStories(false);
    setSpotRefreshing((prev) => !prev);
  };

  const getCameraPermission = async () => {
    await requestPermission();
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View
        style={{
          backgroundColor: "#fff",
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          gap: 20,
        }}
      >
        <View
          style={{
            maxHeight: "40%",
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            source={require("../../../assets/cameraPermission.png")}
            style={{ width: "90%", height: "80%", objectFit: "cover" }}
          />
        </View>
        <View
          style={{
            gap: 20,
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ textAlign: "center", color: "gray" }}>
            We need your permission to access the camera
          </Text>
          <TouchableOpacity
            onPress={getCameraPermission}
            style={{
              width: "90%",
              padding: 8,
              backgroundColor: "#2ecc71",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 5,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>
              Grant Permission
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  let handleCapture = async () => {
    const options = { quality: 1, base64: true, exif: false };
    const newPhoto = await cameraRef.current.takePictureAsync(options);
    setPhoto(newPhoto);
  };

  let handleRecord = async () => {
    setIsRecording(true);
    console.log("recording");
    const options = { maxDuration: 30, mute: false, VideoQuality: "1080p" };
    cameraRef.current.recordAsync(options).then((recordedVideo) => {
      setVideo(recordedVideo);
      setIsRecording(false);
    });
  };

  let handleStopRecord = async () => {
    setIsRecording(false);
    await cameraRef.current.stopRecording();
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const toggleCameraFlash = () => {
    setFlash((current) => (current === "off" ? "on" : "off"));
  };

  const handleDownload = () => {
    if (photo) {
      MediaLibrary.saveToLibraryAsync(photo.uri).then(() => {
        showSuccessToast("Photo saved");
      });
    } else if (video) {
      MediaLibrary.saveToLibraryAsync(video.uri).then(() => {
        showSuccessToast("Video saved");
      });
    }
  };

  const updateUserPosts = async (url) => {
    const docRef = doc(FIRESTORE_DB, "users", currentUserId);
  };

  const handlePostStory = async () => {
    try {
      let downloadUrl;

      if (photo) {
        downloadUrl = await storyPostUpload(
          photo.uri,
          currentUserId,
          setUploadProgress,
          "stories",
          userData
        );
      } else if (video) {
        downloadUrl = await storyPostUpload(
          video.uri,
          currentUserId,
          setUploadProgress,
          "stories",
          userData
        );
      }

      if (downloadUrl) {
        updateUserPosts(downloadUrl);
        showSuccessToast("Story sent");
      } else {
        console.log("No download URL returned");
      }
    } catch (error) {
      console.error("Error getting url and storing it:", error);
      showErrorToast("Oops, failed to post story");
    }
  };

  //Post a story through gallery ie. select media from gallery then upload rather than through the app camera

  const handlePostStoryByGallery = async () => {
    try {
      const downloadUrl = await storyPostUpload(
        null,
        currentUserId,
        setUploadProgress,
        "stories",
        userData
      );
      if (downloadUrl) {
        updateUserPosts(downloadUrl);
        setStoryUrl(downloadUrl);
        showSuccessToast("Story sent");
      }
      return downloadUrl;
    } catch (error) {
      setError("Failed to upload story");
      console.log(error);
      showErrorToast("Oops, failed to upload story");
    }
  };

  const handleShare = async () => {
    if (photo) {
      await shareAsync(photo.uri);
      setPhoto(undefined);
    } else if (video) {
      await shareAsync(video.uri);
      setVideo(undefined);
    } else {
    }
  };

  if (loading || !userData) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          gap: 0,
          paddingHorizontal: 10,
        }}
      >
        <Text
          style={{
            textAlign: "center",
            fontSize: 18,
            fontWeight: "500",
            color: "#34495e",
          }}
        >
          Just a sec, making sure everything's picture perfect...
        </Text>

        <DotsLoader />
      </View>
    );
  }

  return (
    <>
      <StatusBar
        barStyle={
          darkMode
            ? "light-content"
            : !spotlight || !Map
            ? "dark-content"
            : "light-content"
        }
      />
      <View
        style={[
          styles.container,
          (stories || chat) && { backgroundColor: theme.backgroundColor },
        ]}
      >
        <SafeAreaView
          style={{
            flex: 1,
            justifyContent: "center",
            paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
          }}
        >
          <View style={styles.cameraContainer}>
            {camera && (
              <CameraView
                mode={photo ? "picture" : "video"}
                style={styles.cameraView}
                facing={facing}
                flash={flash}
                autofocus="on"
                zoom={0}
                ref={cameraRef}
              >
                {photo && (
                  <View style={styles.photoContainer}>
                    <Image
                      source={{ uri: photo.uri }}
                      style={styles.fullSizeImage}
                      resizeMode="cover"
                    />
                    <View style={styles.photoControls}>
                      <TouchableOpacity onPress={() => setPhoto(undefined)}>
                        <Ionicons name="close" color="white" size={30} />
                      </TouchableOpacity>
                      <TouchableOpacity>
                        {/* Edit buttons go dey here */}
                      </TouchableOpacity>
                    </View>
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <View
                        style={{
                          backgroundColor: "rgba(0,0,0,0.5)",
                          position: "absolute",
                          top: 0,
                          left: 0,
                          padding: 10,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          flex: 1,
                          width: "100%",
                          height: "100%",
                          gap: 5,
                        }}
                      >
                        <CustomLoader />
                        <Text
                          style={{
                            color: "#fff",
                            fontWeight: "bold",
                            letterSpacing: 0.5,
                            textAlign: "center",
                            width: "100%",
                          }}
                        >
                          {uploadProgress.toFixed(2)}%
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {video && (
                  <View style={styles.videoContainer}>
                    <Video
                      style={{ alignSelf: "stretch", flex: 1 }}
                      source={{ uri: video.uri }}
                      useNativeControls
                      resizeMode="stretch"
                      isLooping
                      autofocus
                      shouldRasterizeIOS
                      shouldPlay
                    />
                    <View style={styles.photoControls}>
                      <TouchableOpacity onPress={() => setVideo(undefined)}>
                        <Ionicons name="close" color="white" size={30} />
                      </TouchableOpacity>
                    </View>
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <View
                        style={{
                          backgroundColor: "rgba(0,0,0,0.5)",
                          position: "absolute",
                          top: 0,
                          left: 0,
                          padding: 10,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          flex: 1,
                          width: "100%",
                          height: "100%",
                          gap: 5,
                        }}
                      >
                        <CustomLoader />
                        <Text
                          style={{
                            color: "#fff",
                            fontWeight: "bold",
                            letterSpacing: 0.5,
                            textAlign: "center",
                            width: "100%",
                          }}
                        >
                          {uploadProgress.toFixed(2)}%
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {!photo && (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "space-between",
                      marginBottom: photo ? 0 : 0,
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        justifyContent: "space-between",
                        position: "relative",
                      }}
                    >
                      <>
                        <Header
                          header=""
                          toggleCameraFacing={toggleCameraFacing}
                          toggleCameraFlash={toggleCameraFlash}
                          handlePostStoryByGallery={handlePostStoryByGallery}
                          toggleHint={toggleHint}
                        />

                        {/* BOTTOM CAMERA ICONS */}
                        <View style={{ position: "absolute", bottom: 100 }}>
                          <View style={styles.iconRow}>
                            <Pressable
                              onPress={handlePostStoryByGallery}
                              style={styles.iconButton}
                            >
                              <Ionicons
                                name="images-outline"
                                size={23}
                                color="white"
                                style={styles.rotate90}
                              />
                            </Pressable>

                            {showHint && (
                              <Text style={{ color: "#2ecc71" }}>
                                Tap to capture / Hold to record
                              </Text>
                            )}

                            <Pressable
                              onPress={() =>
                                router.push("/verified/searchUsers")
                              }
                              style={styles.iconButton}
                            >
                              <Foundation
                                name="magnifying-glass"
                                size={25}
                                color="white"
                                style={styles.flipIcon}
                              />
                            </Pressable>
                          </View>

                          {/* FILTERS */}
                          <FilterScrollView
                            handleCapture={handleCapture}
                            handleRecord={handleRecord}
                            handleStopRecord={handleStopRecord}
                            isRecording={isRecording}
                          />
                        </View>
                      </>
                    </View>
                  </View>
                )}
              </CameraView>
            )}

            {maps && <Map />}
            {chat && <Chat handleChatCam={handleChatCam} />}
            {stories && <Stories />}
            {spotlight && <Spotlight reload={spotRefresh} />}
          </View>
        </SafeAreaView>

        {(!photo || !video) && (
          <TabBar
            onPressCamera={handleCameraPress}
            onPressChat={handleChatPress}
            onPressStories={handleStoriesPress}
            onPressMaps={handleMapsPress}
            onPressSpotlight={handleSpotlightPress}
          />
        )}

        {(photo || video) && (
          <TabBarPreview
            handleDownload={handleDownload}
            handleShare={handleShare}
            handlePostStory={handlePostStory}
          />
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    position: "relative",
  },

  cameraContainer: {
    flex: 1,
    justifyContent: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  cameraView: {
    flex: 1,
  },
  photoContainer: {
    flex: 1,
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
  },

  videoContainer: {
    flex: 1,
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    paddingBottom: 70,
  },
  fullSizeImage: {
    flex: 1,
  },
  photoControls: {
    position: "absolute",
    top: 20,
    left: 20,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 0,
  },
  videoControls: {
    position: "absolute",
    top: 40,
    left: 10,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 0,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    width: "100%",
  },
  iconButton: {
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    borderRadius: 9999,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  rotate90: {
    transform: [{ rotate: "90deg" }],
  },
  flipIcon: {
    transform: [{ scaleX: -1 }],
  },
  savedNotification: {
    position: "absolute",
    top: 80,
    left: 0,
    right: 0,
    zIndex: 50,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  savedText: {
    textAlign: "center",
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default HomeScreen;
