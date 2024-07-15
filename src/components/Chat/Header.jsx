import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import React from 'react';
import { FontAwesome5, FontAwesome, AntDesign, MaterialIcons } from 'react-native-vector-icons';
import { router } from 'expo-router';
import processUserImage from '../../../utils/processUserImage';
import { useChatStore } from '../../../context/ChatContext'
import { useTheme } from '../../../context/ThemeContext';

const Header = ({ title, avatar, firstname, lastname, id, username, user, handleClearChats, chooseVoice }) => {
  const { isReceiverBlocked } = useChatStore();
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: '/verified/profile/[otherUserProfile]',
          params: {
            id: id,
            firstname: firstname,
            lastname: lastname,
            username: username,
            avatar: avatar,
            user: user,
          },
        })
      }
      style={[styles.headerContainer, {backgroundColor: theme.backgroundColor}]}
    >
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <FontAwesome5 name="chevron-left" size={25} color={theme.textColor} />
      </Pressable>
      <View style={styles.titleContainer}>
        <View style={styles.avatarContainer}>
          <Image
            source={
              title === 'My AI'
                ? require('../../../assets/aiChatPic.png')
                : isReceiverBlocked
                ? require('../../../assets/placeholder.png')
                : processUserImage(avatar)
            }
            style={styles.avatarImage}
          />
        </View>
        <Text style={[styles.titleText, {color: theme.textColor}]} numberOfLines={2} ellipsizeMode="tail">
          {title}
        </Text>
      </View>
      <View style={styles.actionsContainer}>
        {title === 'My AI' ? (
          <>
            <Pressable onPress={chooseVoice} style={[styles.actionButton, {backgroundColor: theme.innerTabContainerColor}]}>
              <MaterialIcons name="keyboard-voice" size={21} color={theme.textColor}  />
            </Pressable>
            <Pressable onPress={handleClearChats} style={[styles.actionButton, {backgroundColor: theme.innerTabContainerColor}]}>
              <AntDesign name="delete" size={21} color="red" />
            </Pressable>
          </>
        ) : (
          <>
            <Pressable style={[styles.actionButton, {backgroundColor: theme.innerTabContainerColor}]}>
              <FontAwesome name="phone" size={21} color={theme.textColor}  />
            </Pressable>
            <Pressable style={[styles.actionButton, {backgroundColor: theme.innerTabContainerColor}]}>
              <FontAwesome name="video-camera" size={18} color={theme.textColor}  />
            </Pressable>
          </>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    display: 'flex',
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 2,
    paddingHorizontal: 5,
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 35,
    height: 35,
    borderRadius: 20,
    // backgroundColor: 'red'
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'orange',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    objectFit: 'cover',
  },
  titleText: {
    fontWeight: 'bold',
    letterSpacing: 1.1,
    fontSize: 18,
    color: '#3B2F2F',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 5,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
});

export default Header;
