import React from "react";
import LottieView from "lottie-react-native";

export default function Heart() {
  return (
    <LottieView
      source={require("../../lottie-animations/Animation - 1720140864293.json")}
      style={{width: 400, height: 400, }}
      autoPlay
      loop={false}
    />
  );
}