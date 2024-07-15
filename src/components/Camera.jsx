import { CameraView, useCameraPermissions } from "expo-camera";
import { shareAsync } from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useState, useRef } from "react";
import { View, Text, Pressable, Button, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import {
  MaterialCommunityIcons,
  Ionicons,
  Feather,
  FontAwesome6,
  FontAwesome5,
  FontAwesome,
  AntDesign,
  Foundation,
} from "react-native-vector-icons";
import FilterScrollView from "../components/FilitersScroll";
import TabBar from "../components/TabBar";
import TabBarPreview from "../components/TabBarPreview";

const Camera = () => {
  const [facing, setFacing] = useState("front");
  const [flash, setFlash] = useState('off')
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const [photo, setPhoto] = useState(null);
  const [photos, setOutPhoto] = useState(null);
  const cameraRef = useRef();

  useEffect(() => {
    if (!mediaPermission) {
      requestMediaPermission();
    }
  }, []);

  if (!cameraPermission || !mediaPermission) {
    return <View />;
  }

  if (!cameraPermission.granted) {
    return (
      <View className="flex-1 justify-center">
        <Text className="text-center text-white">
          We need your permission to access the camera
        </Text>
        <Button onPress={requestCameraPermission} title="Grant Permission" />
      </View>
    );
  }

  const handleCapture = async () => {
    const options = { quality: 1, base64: true, exif: false };
    const newPhoto = await cameraRef.current.takePictureAsync(options);
    setPhoto(newPhoto);
    setOutPhoto(newPhoto);
  };

  const sharePic = async () => {
    await shareAsync(photo.uri);
    setPhoto(null);
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };
  const toggleCameraFlash = () => {
    setFlash((current) => (current === "off" ? "on" : "off"));
  };

  return (

    <CameraView className="flex-1 rounded-full" facing={facing} flash={flash} ref={cameraRef}>
            <View className="flex-1 bg-transparent my-96 rounded-full bg-green-500"></View>

{photo && (
          <>
                      <View className="flex-1 h-full w-full z-50 absolute left-0 top-0 right-0 bottom-0 ">
          <Image source={{ uri: photo.uri }} className="flex-1" resizeMode="cover" />

          <View className="absolute top-5 w-full flex-row justify-between px-6">
          <TouchableOpacity className='text-white font-bold text-[20px]' onPress={() => setPhoto(null)}>
              <Ionicons name='close' color='white' size={30} />
            </TouchableOpacity>
          <TouchableOpacity className='text-white font-bold text-[20px]' onPress={() => setPhoto(null)}>
              <Text className="text-white">Discard</Text>
            </TouchableOpacity>
          </View>
          
          <View className="absolute bottom-10 w-full flex-row justify-around">
            <TouchableOpacity className='text-white font-bold text-[20px]' onPress={sharePic}>
              <Text className="text-white">Share</Text>
            </TouchableOpacity>
          </View>
        </View>
          </>
        )}

        {!photo && (
          <>
                  {/*  LEFT CAMERA ICONS  */}
      <View className="absolute top-0 flex flex-row gap-2 items-center ml-[0.75rem]">
        <Pressable className="bg-black/15 rounded-full w-[40px] h-[40px] flex justify-center items-center relative overflow-hidden">
          <MaterialCommunityIcons name="account" size={50} color="yellow" className="absolute top-0 right-1" />
        </Pressable>
        <Pressable className="bg-black/15 rounded-full w-[40px] h-[40px] flex justify-center items-center relative overflow-hidden">
          <Ionicons name="search" size={20} color="white" />
        </Pressable>
      </View>

      {/* RIGHT CAMERA ICONS  */}
      <View className="absolute top-0 right-0 flex flex-row items-start gap-2 h-auto">
        <Pressable className="bg-black/15 rounded-full w-[40px] h-[40px] flex justify-center items-center relative overflow-hidden">
          <MaterialCommunityIcons name="account-plus" size={20} color="white" />
        </Pressable>

        <View className="flex flex-col gap-2">
          <View className="mt-2 w-[40px] h-auto bg-black/15 rounded-full flex flex-col py-2 items-center gap-2">
            <Pressable onPress={toggleCameraFacing} className="w-[40px] h-[40px] flex justify-center items-center relative overflow-hidden">
              <Feather name="repeat" size={20} color="white" className="transform rotate-90" />
            </Pressable>
            <Pressable className="w-[40px] h-[40px] flex justify-center items-center relative overflow-hidden">
              <FontAwesome6 name="bolt" size={20} color="white" />
            </Pressable>
            <Pressable className="w-[40px] h-[40px] flex justify-center items-center relative overflow-hidden">
              <MaterialCommunityIcons name="video-plus" size={25} color="white" />
            </Pressable>
            <Pressable className="w-[40px] h-[40px] flex justify-center items-center relative overflow-hidden">
              <Ionicons name="musical-notes" size={30} color="white" />
            </Pressable>
            <Pressable className="w-[40px] h-[40px] flex justify-center items-center relative overflow-hidden">
              <FontAwesome name="camera" size={20} color="white" />
            </Pressable>
            <Pressable className="bg-black/20 rounded-full w-[30px] h-[30px] flex justify-center items-center relative overflow-hidden">
              <FontAwesome5 name="plus" size={15} color="white" />
            </Pressable>
          </View>
          <Pressable className="bg-black/20 rounded-full w-[40px] h-[40px] flex justify-center items-center relative overflow-hidden">
            <AntDesign name="scan1" size={21} color="white" />
          </Pressable>
        </View>
      </View>

      {/* BOTTOM CAMERA ICONS  */}
      <View className="flex flex-row items-center justify-between px-4 w-full absolute left-0 bottom-32 right-0">
        <Pressable className="bg-black/25 rounded-full w-[40px] h-[40px] flex justify-center items-center relative overflow-hidden">
          <Ionicons name="images-outline" size={23} color="white" className="transform rotate-90" />
        </Pressable>

        <Pressable className="bg-black/25 rounded-full w-[40px] h-[40px] flex justify-center items-center relative overflow-hidden">
          <Foundation name="magnifying-glass" size={25} color="white" className="transform scale-x-[-1]" />
        </Pressable>
      </View>

      {/* FILTERS */}
      <FilterScrollView handleCapture={handleCapture} />
          </>
        )}

    </CameraView>
  );
}

export default Camera;
