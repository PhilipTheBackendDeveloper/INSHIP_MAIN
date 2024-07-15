import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Text, Platform } from 'react-native';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from 'react-native-vector-icons';
import { useTheme } from '../../context/ThemeContext';

const TabBar = ({ onPressChat, onPressCamera, onPressStories, onPressMaps, onPressSpotlight }) => {
  const [activeTab, setActiveTab] = useState('camera');
  const { theme, toggleTheme } = useTheme();

  const handlePress = (tab, callback) => {
    setActiveTab(tab);
    if (callback) {
      callback();
    }
  };


  return (
    <View style={[styles.tabBar, {backgroundColor: theme.backgroundColor}]}>
      <View style={[styles.container, {backgroundColor: theme.innerTabContainerColor}]}>
        <Pressable onPress={() => handlePress('maps', onPressMaps)} style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}>
          <Ionicons name={activeTab === 'maps' ? 'location' : 'location-outline'} size={30} color = {theme.tabIconColor} />
        </Pressable>
        <Pressable onPress={() => handlePress('chat', onPressChat)} style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}>
          <MaterialIcons name={activeTab === 'chat' ? 'chat-bubble' : 'chat-bubble-outline'} size={27} color = {theme.tabIconColor}  style={styles.chatIcon} />
        </Pressable>
        <Pressable onPress={() => handlePress('camera', onPressCamera)} style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}>
          <MaterialCommunityIcons name={activeTab === 'camera' ? 'camera' : 'camera-outline'} size={30} color = {theme.tabIconColor}  />
        </Pressable>
        <Pressable onPress={() => handlePress('stories', onPressStories)} style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}>
          <MaterialCommunityIcons name={activeTab === 'stories' ? 'account-supervisor' : 'account-supervisor-outline'} size={32} color = {theme.tabIconColor}  />
        </Pressable>
        <Pressable onPress={() => handlePress('spotlight', onPressSpotlight)} style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}>
          <Ionicons name={activeTab === 'spotlight' ? 'play' : 'play-outline'} size={29} color = {theme.tabIconColor}  />
          <View style={[styles.spotlightIndicator, {backgroundColor: theme.primaryColor}]} />
        </Pressable>
      </View>
    </View>
  );
};

export default TabBar;

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'android' ? 80 : 100,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 4,
    paddingHorizontal: 20,
    justifyContent: 'start',
    alignItems: 'center',
    borderTopLeftRadius: 27,
    borderTopRightRadius: 27,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 64,
    width: '100%',
    borderRadius: 9999,
    paddingHorizontal: 10,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.5,
  },
  chatIcon: {
    transform: [{ scaleX: -1 }],
  },
  spotlightIndicator: {
    position: 'absolute',
    right: 20,
    top: 0,
    borderRadius: 9999,
    width: 12,
    height: 12,
  },
});
