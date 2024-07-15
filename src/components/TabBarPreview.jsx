import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from 'react-native-vector-icons';
import { useTheme } from '../../context/ThemeContext';

const TabBarPreview = ({ handleDownload, handlePostStory, handleShare }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <Pressable onPress={handleDownload} style={[styles.pressable, styles.downloadButton]}>
        <Feather name='download' size={22} color="white" />
      </Pressable>
      <Pressable onPress={handlePostStory} style={[styles.pressable, styles.storyButton]}>
        <MaterialCommunityIcons name='shape-square-rounded-plus' size={25} color="white" style={styles.iconFlip} />
        <Text style={styles.buttonText}>Story</Text>
      </Pressable>
      <Pressable onPress={handleShare} style={[styles.pressable, styles.shareButton]}>
        <Text style={styles.buttonText}>Send To</Text>
        <Ionicons name='send' size={16} color="white" />
      </Pressable>
    </View>
  );
};

const styles = {
  container: {
    height: 100,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingTop: 8,
    paddingRight: 16,
    paddingLeft: 16,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-start',
    borderTopLeftRadius: 27,
    borderTopRightRadius: 27,
    gap: 12,
  },
  pressable: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    padding: 12,
    minHeight: 56,
  },
  downloadButton: {
    backgroundColor: '#333333',
    width: '20%',
  },
  storyButton: {
    backgroundColor: '#333333',
    flexDirection: 'row',
    width: '40%',
    gap: 8,
  },
  shareButton: {
    backgroundColor: '#2ecc71',
    flexDirection: 'row',
    width: '40%',
    gap: 8,
  },
  buttonText: {
    fontWeight: 'bold',
    color: 'white',
  },
  iconFlip: {
    transform: [{ scaleX: -1 }],
  },
};

export default TabBarPreview;
