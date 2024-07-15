import React, { createContext, useContext, useState } from "react";
import { useUser } from "./UserContext";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [isCurrentUserBlocked, setIsCurrentUserBlocked] = useState(false);
  const [isReceiverBlocked, setIsReceiverBlocked] = useState(false);
  const { userData } = useUser();

  const changeChat = (chatId, user) => {
    const currentUser = userData;

    if (user.blocked.includes(currentUser.id)) {
      setUser(null);
      setChatId(chatId);
      setIsCurrentUserBlocked(true);
      setIsReceiverBlocked(false);
    } else if (currentUser.blocked.includes(user.id)) {
      setUser(user);
      setChatId(chatId);
      setIsCurrentUserBlocked(false);
      setIsReceiverBlocked(true);
    } else {
      setUser(user);
      setChatId(chatId);
      setIsCurrentUserBlocked(false);
      setIsReceiverBlocked(false);
    }
  };

  const changeBlock = () => {
    setIsReceiverBlocked((prev) => !prev);
  };

  return (
    <ChatContext.Provider
      value={{
        user,
        changeChat,
        chatId,
        isCurrentUserBlocked,
        isReceiverBlocked,
        changeBlock,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatStore = () => useContext(ChatContext);
