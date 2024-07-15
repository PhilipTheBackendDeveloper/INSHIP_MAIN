import { router } from "expo-router";
import { useState } from "react";
import { View, Text, Pressable, Image } from "react-native";
import {
  MaterialCommunityIcons,
  Ionicons,
  Fontisto,
  Feather,
  FontAwesome,
  Entypo,
  AntDesign,
  Foundation,
} from "react-native-vector-icons";
import processUserImage from "../../utils/processUserImage";
import { useUser } from "../../context/UserContext";
import { useTheme } from "../../context/ThemeContext";

const Header = ({
  header,
  toggleCameraFacing,
  toggleCameraFlash,
  addSpotlight,
  handlePostStoryByGallery,
  toggleHint,
}) => {
  const [isFlash, setIsFlash] = useState(false);
  const { userData } = useUser();
  const { theme } = useTheme();

  const FlashMode = () => {
    setIsFlash((prev) => !prev);
    toggleCameraFlash();
  };

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 8,
        paddingVertical: 10,
        backgroundColor:
          header === "Map" || header === "Spotlight" || header === ""
            ? "transparent"
            : theme.backgroundColor,
        alignItems: header === "" ? "flex-start" : "center",
        borderBottomWidth: header === "Stories" ? 1 : 0,
        borderColor: "rgba(0,0,0,0.1)",
      }}
    >
      <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
        <Pressable
          onPress={() => router.navigate("/verified/profile")}
          style={{
            backgroundColor: "orange",
            borderRadius: 20,
            width: 40,
            height: 40,
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          {userData ? (
            <Image
              source={processUserImage(userData.avatar)}
              style={{ width: "100%", height: "100%" }}
            />
          ) : (
            <Image
              source={require("../../assets/avatars/user.png")}
              style={{ width: "100%", height: "100%" }}
            />
          )}
        </Pressable>
        <Pressable
          onPress={() => router.push("/verified/searchUsers")}
          style={{
            borderRadius: 20,
            width: 40,
            height: 40,
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
            transform: [{ scaleX: -1 }],
            backgroundColor:
              header === "Map"
                ? "rgba(0, 0, 0, 0.15)"
                : theme.innerTabContainerColor,
          }}
        >
          <Foundation
            name="magnifying-glass"
            size={20}
            color={
              header === "Spotlight" || header === "" || header === "Map"
                ? "white"
                : theme.textColor
            }
          />
        </Pressable>
      </View>
      <Text
        style={{
          fontSize: 21,
          fontWeight: "600",
          textAlign: "center",
          color:
            header === "Spotlight" || header === "" || header === "Map"
              ? "white"
              : theme.textColor,
          marginRight:
            header === "Spotlight" || header === "" || header === "Map"
              ? 40
              : 0,
        }}
      >
        {header}
      </Text>

      <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
        {header !== "Spotlight" && header !== "Map" && (
          <Pressable
            onPress={() => router.push("/verified/addChat")}
            style={{
              backgroundColor: theme.innerTabContainerColor,
              borderRadius: 20,
              width: 40,
              height: 40,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MaterialCommunityIcons
              name="account-plus"
              size={20}
              color={header === "" ? "white" : theme.textColor}
            />
          </Pressable>
        )}

        {header === "Map" ? (
          <Pressable
            onPress={() => router.push("/verified/settings")}
            style={{
              borderRadius: 20,
              width: 40,
              height: 40,
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
              backgroundColor: "rgba(0, 0, 0, 0.15)",
            }}
          >
            <Ionicons name="settings-sharp" size={25} color="white" />
          </Pressable>
        ) : (
          <View>
            {header === "" ? (
              <View
                style={{
                  flexDirection: "row",
                  gap: 8,
                  alignItems: "flex-start",
                  height: "auto",
                }}
              >
                <View style={{ flexDirection: "column", gap: 8 }}>
                  <View
                    style={{
                      marginTop: 0,
                      width: 40,
                      height: "auto",
                      backgroundColor: theme.innerTabContainerColor,
                      borderRadius: 20,
                      flexDirection: "column",
                      paddingVertical: 8,
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Pressable
                      onPress={toggleCameraFacing}
                      style={{
                        width: 40,
                        height: 40,
                        justifyContent: "center",
                        alignItems: "center",
                        overflow: "hidden",
                      }}
                    >
                      <Feather
                        name="repeat"
                        size={20}
                        color="white"
                        style={{ transform: [{ rotate: "90deg" }] }}
                      />
                    </Pressable>
                    <Pressable
                      onPress={FlashMode}
                      style={{
                        width: 40,
                        height: 40,
                        justifyContent: "center",
                        alignItems: "center",
                        overflow: "hidden",
                      }}
                    >
                      <Ionicons
                        name={`${isFlash ? "flash" : "flash-off"}`}
                        size={25}
                        color="white"
                      />
                    </Pressable>
                    <Pressable
                      onPress={handlePostStoryByGallery}
                      style={{
                        width: 40,
                        height: 40,
                        justifyContent: "center",
                        alignItems: "center",
                        overflow: "hidden",
                      }}
                    >
                      <MaterialCommunityIcons
                        name="video-plus"
                        size={25}
                        color="white"
                      />
                    </Pressable>
                    <Pressable
                      style={{
                        width: 40,
                        height: 40,
                        justifyContent: "center",
                        alignItems: "center",
                        overflow: "hidden",
                      }}
                    >
                      <Ionicons name="musical-notes" size={30} color="white" />
                    </Pressable>
                    <Pressable
                      style={{
                        width: 40,
                        height: 40,
                        justifyContent: "center",
                        alignItems: "center",
                        overflow: "hidden",
                      }}
                    >
                      <FontAwesome name="camera" size={20} color="white" />
                    </Pressable>
                    <Pressable
                      onPress={toggleHint}
                      style={{
                        backgroundColor: "rgba(0, 0, 0, 0.2)",
                        borderRadius: 20,
                        width: 30,
                        height: 30,
                        justifyContent: "center",
                        alignItems: "center",
                        overflow: "hidden",
                      }}
                    >
                      <Entypo name="info-with-circle" size={15} color="white" />
                    </Pressable>
                  </View>
                  <Pressable
                    style={{
                      backgroundColor: "rgba(0, 0, 0, 0.2)",
                      borderRadius: 20,
                      width: 40,
                      height: 40,
                      justifyContent: "center",
                      alignItems: "center",
                      overflow: "hidden",
                    }}
                  >
                    <AntDesign name="scan1" size={21} color="white" />
                  </Pressable>
                </View>
              </View>
            ) : (
              <View>
                {header === "Spotlight" ? (
                  <Pressable
                    onPress={addSpotlight}
                    style={{
                      backgroundColor: theme.innerTabContainerColor,
                      borderRadius: 20,
                      width: 40,
                      height: 40,
                      justifyContent: "center",
                      alignItems: "center",
                      overflow: "hidden",
                    }}
                  >
                    <MaterialCommunityIcons
                      name="plus-box-outline"
                      size={25}
                      color="white"
                      style={{ transform: [{ rotate: "90deg" }] }}
                    />
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={() => router.push("/verified/settings")}
                    style={{
                      backgroundColor: theme.innerTabContainerColor,
                      borderRadius: 20,
                      width: 40,
                      height: 40,
                      justifyContent: "center",
                      alignItems: "center",
                      overflow: "hidden",
                    }}
                  >
                    <Ionicons
                      name="settings-sharp"
                      size={25}
                      color={header === "" ? "white" : theme.textColor}
                    />
                  </Pressable>
                )}
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default Header;
