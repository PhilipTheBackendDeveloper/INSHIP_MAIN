import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
  Pressable,
  StatusBar,
  Keyboard,
} from "react-native";
import {
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { FIRESTORE_DB } from "../../../../Firebase/config";
import { useLocalSearchParams } from "expo-router";
import { useUser } from "../../../../context/UserContext";
import { pickAndUploadMedia } from "../../../../utils/pickAndUploadMedia";
import { Entypo } from "react-native-vector-icons";
import Modal from "react-native-modal";
import { Image as ExpoImage } from "expo-image";
import { useChatStore } from "../../../../context/ChatContext";
import { Video } from "expo-av";
import { Ionicons } from "react-native-vector-icons";
import Header from "../../../components/Chat/Header";
import Bottom from "../../../components/Chat/Bottom";
import ImageView from "react-native-image-viewing";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomLoader from "../../../components/CustomLoader";
import { MaterialCommunityIcons } from "react-native-vector-icons";
import { useTheme } from "../../../../context/ThemeContext";

const { width } = Dimensions.get("window");

const ChatRoom = () => {
  const { userData } = useUser();
  const { chatId, userId, firstname, lastname, avatar, username, user } =
    useLocalSearchParams();
  const [chat, setChat] = useState(null);
  const [media, setMedia] = useState(null);
  const [localMediaUri, setLocalMediaUri] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [play, setPlay] = useState(false);
  const videoRef = useRef(null);
  const currentUserId = userData.id;
  const { isReceiverBlocked } = useChatStore();
  const scrollViewRef = useRef(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [visible, setIsVisible] = useState(false);
  const [chatImages, setChatImages] = useState([]);
  const [backgroundImage, setBackgroundImage] = useState(
    require("../../../../assets/chat_background.jpg")
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { theme } = useTheme();

  const blurhash =
    "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

  useEffect(() => {
    if (theme?.backgroundColor === "#ffffff") {
      setBackgroundImage(require("../../../../assets/chat_background.jpg"));
    } else {
      setBackgroundImage(
        require("../../../../assets/chat_background_dark_1.jpg")
      );
    }
  }, [theme]);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (chatId) {
        const chatDoc = await getDoc(doc(FIRESTORE_DB, "chats", chatId));
        if (chatDoc.exists()) {
          setChat(chatDoc.data());
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
          }
        }

        const unSub = onSnapshot(doc(FIRESTORE_DB, "chats", chatId), (doc) => {
          setChat(doc.data());
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
          }
        });

        return () => {
          unSub();
        };
      }
    };

    fetchInitialData();
  }, [chatId]);

  const handleSend = async (message) => {
    setLocalMediaUri(null);
    try {
      if (!message && !media) return;

      const chatRef = doc(FIRESTORE_DB, "chats", chatId);

      let messageData = {
        senderId: currentUserId,
        text: message,
        createdAt: new Date(),
      };

      if (media) {
        messageData.mediaUrl = media.url;
        messageData.mediaType = media.type;
      }

      await updateDoc(chatRef, {
        messages: arrayUnion(messageData),
      });

      const userIDs = [currentUserId, userId];

      for (const id of userIDs) {
        const userChatsRef = doc(FIRESTORE_DB, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();

          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );

          if (chatIndex !== -1) {
            userChatsData.chats[chatIndex].lastMessage = media
              ? media.url + message
              : message;
            userChatsData.chats[chatIndex].isSeen = id === currentUserId;
            userChatsData.chats[chatIndex].updatedAt = new Date();

            await updateDoc(userChatsRef, {
              chats: userChatsData.chats,
            });

            setMedia(null);
          }
        }
      }
    } catch (error) {
      console.log("Error sending message: " + error);
    }
  };

  const handlePickMedia = async () => {
    try {
      const pickedMedia = await pickAndUploadMedia(
        setUploadProgress,
        setLocalMediaUri
      );
      if (pickedMedia) {
        setMedia(pickedMedia);
      }
    } catch (error) {
      console.log("Error picking media: " + error);
    }
  };

  const handleLongPress = (message) => {
    setSelectedMessage(message);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedMessage(null);
  };

  const openFullScreen = async () => {
    if (!play) {
      if (!isFullScreen) {
        try {
          await videoRef.current.presentFullscreenPlayer();
          setIsFullScreen(true);
          setPlay(true);
        } catch (error) {
          console.log("Error entering full-screen:", error);
        }
      }
    } else {
      try {
        await videoRef.current.dismissFullscreenPlayer();
        setIsFullScreen(false);
        setPlay(false);
      } catch (error) {
        console.log("Error exiting full-screen:", error);
      }
    }
  };

  const handleDeleteMessage = async () => {
    try {
      setIsModalVisible(false);
      // setSelectedMessage(null);
      const chatRef = doc(FIRESTORE_DB, "chats", chatId);
      const chatDoc = await getDoc(chatRef);

      if (chatDoc.exists()) {
        const updatedMessages = chatDoc
          .data()
          .messages.filter((msg) => msg.text !== selectedMessage.text);

        await updateDoc(chatRef, {
          messages: updatedMessages,
        });
      }
    } catch (error) {
      console.log("Error deleting message: ", error);
    }
  };

  useEffect(() => {
    let i = 0;
    try {
      const getChatImagesInit = async () => {
        const images =
          chat?.messages
            ?.filter((message) => message.mediaType === "image")
            .map((message) => ({
              uri: message.mediaUrl,
              id: i++,
            })) || [];
        await AsyncStorage.setItem(
          `chat_images_${chatId}`,
          JSON.stringify(images)
        );
        setChatImages(images);
      };

      getChatImagesInit();
    } catch (error) {
      console.log("Failed to get images from storage: " + error);
    }
  }, [chat]);

  const handleFocusedInput = () => {
    scrollViewRef.current.scrollToEnd({ animated: true });
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.backgroundColor,
        paddingTop: Platform.OS === "ios" ? 0 : StatusBar.currentHeight,
      }}
    >
      <View style={{ top: 0, left: 0 }}>
        <Header
          title={`${firstname} ${lastname}`}
          avatar={avatar}
          firstname={firstname}
          lastname={lastname}
          id={userId}
          username={username}
          user={user}
        />
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -260}
      >
        <ImageBackground
          source={backgroundImage}
          style={{ flex: 1, backgroundColor: "#f5f5f5" }}
        >
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "flex-end",
              paddingVertical: 10,
              paddingHorizontal: 6,
            }}
            onContentSizeChange={() =>
              scrollViewRef.current.scrollToEnd({ animated: true })
            }
            showsVerticalScrollIndicator={false}
          >
            {chat?.messages?.map((message, index) => {
              const isSender = message.senderId === currentUserId;
              const imageIndex =
                chatImages.find((img) => img.uri === message.mediaUrl)?.id || 0;

              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.9}
                  onLongPress={() => handleLongPress(message)}
                  style={{
                    alignSelf:
                      message.senderId === currentUserId
                        ? "flex-end"
                        : "flex-start",
                    padding: 8,
                    borderRadius: 8,
                    borderLeftWidth: message.senderId === currentUserId ? 0 : 3,
                    borderRightWidth:
                      message.senderId === currentUserId ? 3 : 0,
                    borderColor:
                      message.senderId === currentUserId
                        ? theme.primaryColor
                        : theme.secondaryColor,
                    marginBottom: 8,
                    backgroundColor: isSender
                      ? "#DCF8C5"
                      : theme.backgroundColor,
                    maxWidth: "80%",
                  }}
                >
                  <View
                    style={{
                      marginBottom: 4,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        color:
                          message.senderId === currentUserId
                            ? theme.primaryColor
                            : theme.secondaryColor,
                      }}
                    >
                      {message.senderId === currentUserId ? "Me" : firstname}
                    </Text>
                    <Text style={{ color: "gray", fontSize: 10 }}>
                      {message.createdAt.toDate().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                  <View>
                    {message.mediaUrl ? (
                      message.mediaType === "image" ? (
                        <>
                          <Pressable
                            onPress={() => {
                              setIsVisible(true);
                              setSelectedImageIndex(imageIndex);
                            }}
                            onLongPress={() => handleLongPress(message)}
                          >
                            <ExpoImage
                              source={{ uri: message.mediaUrl }}
                              style={{
                                width: width * 0.6,
                                height: 150,
                                borderRadius: 8,
                                marginVertical: 5,
                              }}
                              placeholder={{ blurhash }}
                              contentFit="cover"
                              transition={1000}
                            />
                          </Pressable>
                          {message.text && (
                            <Text
                              style={{
                                letterSpacing: 0.2,
                                fontSize: 15,
                                color:
                                  message.senderId === currentUserId
                                    ? "333333"
                                    : theme.textColor,
                              }}
                            >
                              {message.text}
                            </Text>
                          )}
                        </>
                      ) : (
                        <View>
                          <Pressable
                            onLongPress={() => handleLongPress(message)}
                          >
                            <Video
                              ref={videoRef}
                              source={{ uri: message.mediaUrl }}
                              style={{
                                width: width * 0.8,
                                height: 200,
                                borderRadius: 20,
                                marginVertical: 5,
                              }}
                              useNativeControls
                              contentFit="cover"
                              isLooping
                              shouldPlay={play}
                            />
                          </Pressable>
                          {!play && (
                            <Pressable
                              onPress={openFullScreen}
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <Ionicons
                                name="play-circle"
                                size={60}
                                color="rgba(255,255,255,0.7)"
                              />
                            </Pressable>
                          )}
                          <Text
                            style={{
                              letterSpacing: 0.2,
                              fontSize: 15,
                              color:
                                message.senderId === currentUserId
                                  ? "333333"
                                  : theme.textColor,
                            }}
                          >
                            {message.text}
                          </Text>
                        </View>
                      )
                    ) : (
                      <Text
                        style={{
                          letterSpacing: 0.2,
                          fontSize: 15,
                          color:
                            message.senderId === currentUserId
                              ? "333333"
                              : theme.textColor,
                        }}
                      >
                        {message.text}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
            {localMediaUri && (
              <View
                style={{
                  alignSelf: "center",
                  padding: 8,
                  paddingTop: 4,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: theme.primaryColor,
                  marginBottom: 8,
                  backgroundColor: "rgba(0,0,0,0.6)",
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setLocalMediaUri(null);
                    setMedia(null);
                  }}
                >
                  <Entypo
                    name="cross"
                    size={20}
                    color="#fff"
                    style={{ textAlign: "right" }}
                  />
                </TouchableOpacity>
                <View style={{ position: "relative", overflow: "hidden" }}>
                  {media && media.type === "image" ? (
                    <ExpoImage
                      source={{ uri: localMediaUri }}
                      style={{
                        width: width * 0.5,
                        height: 100,
                        borderRadius: 8,
                      }}
                      placeholder={{ blurhash }}
                      contentFit="cover"
                      transition={1000}
                    />
                  ) : (
                    <Video
                      source={{ uri: localMediaUri }}
                      style={{
                        width: width * 0.5,
                        height: 100,
                        borderRadius: 8,
                      }}
                      useNativeControls
                      resizeMode="cover"
                      isLooping
                    />
                  )}
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <View
                      style={{
                        position: "absolute",
                        alignSelf: "center",
                        padding: 10,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0,0,0,0.7)",
                        borderRadius: 8,
                      }}
                    >
                      <CustomLoader />
                      <Text style={{ fontSize: 12, color: "#fff" }}>
                        {uploadProgress.toFixed(2)}%
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
            {isReceiverBlocked && (
              <View style={{ backgroundColor: theme.grayText, padding: 10 }}>
                <Text
                  style={{
                    textAlign: "center",
                    fontWeight: "500",
                    color: "white",
                    fontSize: 12,
                  }}
                >
                  You can no longer send or receive messages from this user!
                </Text>
              </View>
            )}
          </ScrollView>
          <Bottom
            handleSend={handleSend}
            handlePickMedia={handlePickMedia}
            user={user}
            handleFocusedInput={handleFocusedInput}
          />
          <Modal
            isVisible={isModalVisible}
            onBackdropPress={handleCloseModal}
            backdropOpacity={0.4}
          >
            <View
              style={{
                backgroundColor: theme.backgroundColor,
                borderRadius: 10,
                paddingVertical: 15,
                paddingHorizontal: 20,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                  gap: 10,
                }}
              >
                {selectedMessage?.mediaUrl && (
                  <ExpoImage
                    source={{ uri: selectedMessage.mediaUrl }}
                    style={{ width: 50, height: 50, borderRadius: 2 }}
                    placeholder={{ blurhash }}
                    contentFit="cover"
                    transition={100}
                  />
                )}
                {selectedMessage?.text && (
                  <Text style={{ color: theme.grayText }}>
                    {selectedMessage.text}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={handleDeleteMessage}
                style={{ paddingTop: 0 }}
              >
                <Text style={{ textAlign: "right" }}>
                  <MaterialCommunityIcons
                    name="delete-empty-outline"
                    size={25}
                    color={theme.secondaryColor}
                  />{" "}
                </Text>
              </TouchableOpacity>
            </View>
          </Modal>
          <ImageView
            images={chatImages.map((image) => ({ uri: image.uri }))}
            imageIndex={selectedImageIndex}
            visible={visible}
            onRequestClose={() => setIsVisible(false)}
          />
        </ImageBackground>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatRoom;
