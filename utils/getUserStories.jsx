const getUserStories = () => {
  const stories = [
    {
      id: 1,
      avatarId: 5,
      nickName: 'felix😎',
      userName: 'felix253726',
    },
    {
      id: 2,
      avatarId: 2,
      nickName: 'Alice😈💕',
      userName: 'alice93726',
    },
    {
      id: 3,
      avatarId: 3,
      nickName: 'Bob💫✨',
      userName: 'bob19273',
    },
    {
      id: 4,
      avatarId: 4,
      nickName: 'charlie',
      userName: 'charlie84736',
    },
    {
      id: 5,
      avatarId: '',
      nickName: 'Christabel🤑💵',
      userName: 'david37283',
    },
    {
      id: 6,
      avatarId: 6,
      nickName: 'emma',
      userName: 'emma28472',
    },
    {
      id: 7,
      avatarId: 7,
      nickName: 'Frank🎮',
      userName: 'frank19382',
    },
    {
      id: 8,
      avatarId: 8,
      nickName: 'Grace',
      userName: 'grace83726',
    },
    {
      id: 9,
      avatarId: 9,
      nickName: 'harry',
      userName: 'harry92837',
    },
    {
      id: 10,
      avatarId: 10,
      nickName: '🎶Isabel😘😎',
      userName: 'isabel92837',
    },
  ];

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(stories);
    }, 1000);
  });
};

export default getUserStories;
