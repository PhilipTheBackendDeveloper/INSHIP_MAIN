import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons, Feather, FontAwesome, FontAwesome6 } from 'react-native-vector-icons';
import { useRouter } from 'expo-router';
import processUserImage from '../../../utils/processUserImage';
import { useChatStore } from '../../../context/ChatContext';
import { FIRESTORE_DB } from '../../../Firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useUser } from '../../../context/UserContext';
import { useTheme } from '../../../context/ThemeContext';

const ChatItem = ({ handleChatCam, chat, isSeen, avatar, firstName, lastName, lastMessage }) => {
  const { userData } = useUser();
  const { changeChat, isReceiverBlocked } = useChatStore();
  const { theme } = useTheme();
  const router = useRouter(); 

  const currentUserId = userData?.id;

  const handleSelect = async (selectedChat) => {
    if (!currentUserId) return;
    changeChat(chat.user?.id, chat.user);

    const userChatsRef = doc(FIRESTORE_DB, 'userchats', currentUserId);
    const userChatsSnapshot = await getDoc(userChatsRef);
    
    if (userChatsSnapshot.exists()) {
      const userChatsData = userChatsSnapshot.data();
      const chatIndex = userChatsData?.chats?.findIndex(item => item.chatId === selectedChat.chatId);

      if (chatIndex !== -1) {
        userChatsData.chats[chatIndex].isSeen = true;

        try {
          await updateDoc(userChatsRef, {
            chats: userChatsData.chats
          });
          changeChat(selectedChat.chatId, selectedChat.user);
        } catch (error) {
          console.log('Error updating document: ', error);
        }
      }
    }
  };

  const isImageMessage = (message) => {
    return message && message.startsWith('https');
  };


  const handlePress = async () => {
    if (!chat?.chatId || !chat?.user?.id) return;
    
    router.push({
      pathname: '/verified/chatRoom/chatroom',
      params: {
        user: chat,
        chatId: chat.chatId,
        userId: chat.user.id,
        firstname: firstName,
        lastname: lastName,
        username: chat.user.Username,
        avatar: chat.user.avatar
      }
    });
    await handleSelect(chat);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.chatItem, {borderBottomColor: theme.innerTabContainerColor, backgroundColor: theme.backgroundColor}]}
    >
      <View style={styles.avatarContainer}>
        <Image
          source={userData?.blocked.includes(chat?.user?.id) ? require('../../../assets/placeholder.png') : processUserImage(avatar)}
          style={styles.avatar}
        />
      </View>
      <View style={styles.content}>
        <Text style={[styles.name, {color: theme.textColor}]}>{firstName} {lastName}</Text>
        <View style={styles.messageContainer}>
          {!lastMessage ? (
            <MaterialIcons
              name="chat-bubble-outline"
              size={13}
              color="gray"
              style={styles.iconFlip}
            />
          ) :
          isImageMessage(lastMessage) ? 
          (
            <FontAwesome
              name= {isSeen ? 'square-o' : 'square'}
              size={13}
              color='#E84855'
            />
          ) : (
            <FontAwesome6
              name= 'caret-right'
              size={16}
              color='#9381FF'
            />
          )}
          <Text style={[styles.messageText, {color: !lastMessage ? 'gray' : isImageMessage(lastMessage) ? '#E84855' : '#9381FF' }]}>
            {!lastMessage ? 'Tap to chat' : isSeen ? 'Delivered' :  'New Chat'}
          </Text>
        </View>
      </View> 
      <View style={styles.right}>
      <View style={[styles.newIndicator, { backgroundColor: !lastMessage ? 'gray' : !isSeen ? (isImageMessage(lastMessage) ? '#E84855' : '#9381FF') : 'transparent'}]} />
      <Pressable onPress={handleChatCam}>
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
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.1)', 
  },
  avatar: {
    width: '100%',
    height: '100%',
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
    color: '#7f8c8d', 
    marginLeft: 4,
  },
});

export default ChatItem;
