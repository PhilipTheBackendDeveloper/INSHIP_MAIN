import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRoute } from "@react-navigation/native";

const preview = () => {
  const route = useRoute();
  const { url, username } = route.params;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        {url ? (
          <Image
            source={{ uri: url }}
            style={{ width: "100%", height: "100%", resizeMode: "cover" }}
          />
        ) : (
          <Text style={{ color: "white", textAlign: "center" }}>
            Oops! Something went wrong.
          </Text>
        )}
        <LinearGradient
          colors={["rgba(0,0,0,0.6)", "rgba(0,0,0,0)"]}
          style={styles.overlay}
        >
          <Text style={styles.username}>{username}</Text>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    alignItems: "center",
  },
  username: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default preview;
