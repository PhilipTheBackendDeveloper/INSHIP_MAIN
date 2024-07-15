import React, { useState } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";

const FilterScrollView = ({
  handleCapture,
  handleRecord,
  handleStopRecord,
  isRecording,
}) => {
  const itemWidth = 100;
  const [activeIndex, setActiveIndex] = useState(0);

  const filters = [
    { id: 99, image: "" },
    { id: 1, image: require("../../assets/filters/filterOne.png") },
    { id: 2, image: require("../../assets/filters/filterFourteen.png") },
    { id: 3, image: require("../../assets/filters/filterThree.png") },
    { id: 4, image: require("../../assets/filters/filterThirteen.png") },
    { id: 5, image: require("../../assets/filters/filterFive.png") },
    { id: 6, image: require("../../assets/filters/filterSix.png") },
    { id: 7, image: require("../../assets/filters/filterTwelve.png") },
    { id: 8, image: require("../../assets/filters/filterEight.png") },
    { id: 9, image: require("../../assets/filters/filterNine.png") },
    { id: 10, image: require("../../assets/filters/filterEleven.png") },
    { id: 11, image: require("../../assets/filters/filterTen.png") },
    { id: 15, image: require("../../assets/filters/filterFifteen.png") },
    { id: 12, image: require("../../assets/filters/filterSeven.png") },
    { id: 13, image: require("../../assets/filters/filterFour.png") },
    { id: 14, image: require("../../assets/filters/filterTen.png") },
  ];

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(scrollPosition / itemWidth);
    setActiveIndex(currentIndex);
  };

  return (
    <ScrollView
      horizontal={true}
      decelerationRate="fast"
      snapToInterval={itemWidth}
      snapToAlignment={"center"}
      showsHorizontalScrollIndicator={false}
      disableIntervalMomentum={true}
      onScroll={handleScroll}
      scrollEventThrottle={1}
      contentContainerStyle={styles.scrollViewContent}
      className={` max-h-28`}
    >
      {filters.map((filter, index) => (
        <TouchableOpacity
          activeOpacity={0.7}
          onLongPress={handleRecord}
          onPressOut={handleStopRecord}
          onPress={() => {
            if (activeIndex === index) {
              handleCapture();
            }
          }}
          key={filter.id}
          style={[
            styles.item,
            {
              width: itemWidth,
              height: itemWidth,
              borderRadius: itemWidth / 2,
              transform: [{ scale: activeIndex === index ? 0.8 : 0.6 }],
              opacity: activeIndex === index ? 1 : 0.7,
              borderWidth: activeIndex === index ? 7 : 0,
              borderColor:
                activeIndex === index
                  ? isRecording
                    ? "red"
                    : "white"
                  : "transparent",
            },
          ]}
        >
          <Image source={filter.image} style={styles.image} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    alignItems: "center",
    paddingHorizontal: (Dimensions.get("window").width - 100) / 2,
  },
  item: {
    marginHorizontal: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
});

export default FilterScrollView;
