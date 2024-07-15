import { View, Text } from "react-native";

export const toastConfig = {
  customInfoToast: ({ text1 }) => (
    <View
      style={{
        height: 40,
        backgroundColor: "rgba(0,0,0,0.75)",
        borderRadius: 20,
        padding: 10,
        paddingHorizontal: 15,
        justifyContent: "center",
        alignItems: "center",
        gap: 5,
      }}
    >
      <Text numberOfLines={1} style={{ color: "#fff", textAlign: "center" }}>
        {text1}
      </Text>
    </View>
  ),

  customSuccessToast: ({ text1 }) => (
    <View
      style={{
        height: 40,
        backgroundColor: "rgba(0,0,0,0.75)",
        borderRadius: 20,
        padding: 10,
        paddingHorizontal: 15,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 5,
      }}
    >
      <Ionicons name="checkmark-circle" color="#2ecc71" size={20} />
      <Text numberOfLines={1} style={{ color: "#fff", textAlign: "center" }}>
        {text1}
      </Text>
    </View>
  ),

  customErrorToast: ({ text1 }) => (
    <View
      style={{
        height: 40,
        backgroundColor: "rgba(0,0,0,0.75)",
        borderRadius: 20,
        padding: 10,
        paddingHorizontal: 15,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 5,
      }}
    >
      <Ionicons name="close-circle" color="red" size={20} />
      <Text numberOfLines={1} style={{ color: "#fff", textAlign: "center" }}>
        {text1}
      </Text>
    </View>
  ),
};
