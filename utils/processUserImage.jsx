const processUserImage = (imageName) => {

        switch (imageName) {
          case "avatar_1.png":
            return require("../assets/avatars/avatar_1.png");
          case "avatar_11.png":
            return require("../assets/avatars/avatar_11.png");
          case "avatar_3.webp":
            return require("../assets/avatars/avatar_3.webp");
          case "avatar_4.webp":
            return require("../assets/avatars/avatar_4.webp");
          case "avatar_5.png":
            return require("../assets/avatars/avatar_5.png");
          case "avatar_6.png":
            return require("../assets/avatars/avatar_6.png");
          case "avatar_7.jpg":
            return require("../assets/avatars/avatar_7.jpg");
          case "avatar_8.jpg":
            return require("../assets/avatars/avatar_8.jpg");
          case "avatar_9.png":
            return require("../assets/avatars/avatar_9.png");
          case "avatar_10.webp":
            return require("../assets/avatars/avatar_10.webp");
          default:
            return null;
        }

}

export default processUserImage