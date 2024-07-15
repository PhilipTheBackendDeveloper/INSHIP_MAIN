import React from "react";
import LottieView from "lottie-react-native";

export default function DotsLoader() {
  return (
    <LottieView
      source={require("../../lottie-animations/Dots.json")}
      style={{ width: 65, height: 65 }}
      autoPlay
      loop
    />
  );
}
