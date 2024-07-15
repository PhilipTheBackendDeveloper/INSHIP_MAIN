import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons, Feather, Entypo } from 'react-native-vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../../context/ThemeContext';

const BotItem = () => {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={() => router.push('/verified/chatRoom/botChatRoom')}
      style={[styles.chatItem, {borderBottomColor: theme.innerTabContainerColor, backgroundColor: theme.backgroundColor}]}
    >
      <View style={styles.avatarContainer}>
        <Image
          source={require('../../../assets/aiChatPic.png')}
          style={styles.avatar}
        />
        <View style={{position: 'absolute', left: 0, bottom: -5, width: 20, height: 20, backgroundColor: 'transparent', borderRadius: 10, overflow: 'hidden'}}>
          <Image source={require('../../../assets/subBot.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </View>
      </View>
      <View style={styles.content}>
        <Text style={[styles.name, {color: theme.textColor}]}>My AI</Text>
        <View style={styles.messageContainer}>
            <Entypo
              name="chat"
              size={12}
              color='#2ecc71'
              style={styles.iconFlip}
            />
          <Text style={styles.messageText}>
            {/* {lastMessage ? (isImageMessage(lastMessage) ? 'Media' : lastMessage) : 'Tap to chat'} */}
            Ask me anything!
          </Text>
        </View>
      </View>
      <View style={styles.right}>
      {/* <View style={[styles.newIndicator, { backgroundColor: isSeen ? 'transparent' : '#2ecc71' }]} /> */}
      <Pressable>
        <Feather name="camera" size={20} color="#B0B0B0" />
      </Pressable>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  newIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    // overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.1)', 
    position: 'relative'
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 2.5
  },
  iconFlip: {
    transform: [{ scaleX: -1 }], 
  },
  messageText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2ecc71', 
    marginLeft: 4,
  },
});

export default BotItem;
