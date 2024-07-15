import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, StyleSheet, Image, Text, View } from 'react-native';
import Header from '../components/Header';
import MapView, { Callout, Marker } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { collection, getDocs, setDoc, doc, getDoc } from 'firebase/firestore';
import { useUser } from '../../context/UserContext';
import { FIRESTORE_DB } from '../../Firebase/config';
import processUserImage from '../../utils/processUserImage';
import { router } from 'expo-router';
import CustomLoader from '../components/CustomLoader'

const Map = () => {
  const [location, setLocation] = useState(null);
  const [otherUsers, setOtherUsers] = useState([]);
  const [loading, setLoading] = useState(false)
  const mapRef = useRef(null);
  const { userData } = useUser();

  useEffect(() => {
    setLoading(true);
    const fetchUserLocation = async () => {
      const userDocRef = doc(FIRESTORE_DB, 'users', userData?.id);
      const userDoc = await getDoc(userDocRef);

      const currentLocation = await getCurrentLocation();

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData?.location) {
          const storedLocation = userData?.location;
          if (isLocationDifferent(storedLocation, currentLocation)) {
            setLocation(currentLocation);
            await updateLocationInFirestore(userDocRef, currentLocation);
          } else {
            setLocation(storedLocation);
          }
          animateMap(storedLocation);
        } else {
          await setNewLocation(userDocRef, currentLocation);
          }
          } else {
            await setNewLocation(userDocRef, currentLocation);
          }

      const usersSnapshot = await getDocs(collection(FIRESTORE_DB, 'users'));
      const usersData = usersSnapshot.docs.map((doc) => doc.data());
      setOtherUsers(usersData?.filter((user) => user?.id !== userData?.id));
      setLoading(false);
    };

    fetchUserLocation();
  }, [userData?.id]);

  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.error('Permission to access location was denied');
      return null;
    }
    const { coords } = await Location.getCurrentPositionAsync({});
    return coords;
  };

  const isLocationDifferent = (location1, location2, threshold = 0.001) => {
    const latDiff = Math.abs(location1.latitude - location2.latitude);
    const lonDiff = Math.abs(location1.longitude - location2.longitude);
    return latDiff > threshold || lonDiff > threshold;
  };

  const setNewLocation = async (userDocRef, currentLocation) => {
    if (currentLocation) {
      setLocation(currentLocation);
      await updateLocationInFirestore(userDocRef, currentLocation);
      animateMap(currentLocation);
    }
  };

  const updateLocationInFirestore = async (userDocRef, coords) => {
    try {
      await setDoc(userDocRef, { location: coords }, { merge: true });
    } catch (error) {
      console.error('Error updating user location in Firestore:', error);
    }
  };

  const animateMap = (coords) => {
    mapRef.current?.animateToRegion({
      latitude: coords.latitude,
      longitude: coords.longitude,
      latitudeDelta: 0.0025,
      longitudeDelta: 0.0025,
    });
  };

  const calloutPressed = (user) => {
    router.push({
      pathname: '/verified/profile/[otherUserProfile]',
      params: {
        id: user?.id,
        firstname: user?.FirstName,
        lastname: user?.LastName,
        username: user?.Username,
        avatar: user?.avatar,
      },
    });
  };

  const renderUserMarker = (user) =>
    user?.location && (
      <Marker key={user?.id} coordinate={user?.location}>
        <Image source={processUserImage(user?.avatar)} style={styles.markerImage} />
        <Callout onPress={() => calloutPressed(user)}>
          <View style={styles.calloutView}>
            <Text style={styles.calloutUsername} numberOfLines={1} ellipsizeMode='tail'>{user?.Username}</Text>
            <Image
              source={user?.picture ? { uri: user?.picture } : processUserImage(user?.avatar)}
              style={styles.calloutImage}
            />
          </View>
        </Callout>
      </Marker>
    );

  return (
    <SafeAreaView style={styles.container}>
      {loading && (
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}>
                <CustomLoader />
            </View>
      )}
        <>
        <LinearGradient colors={['rgba(0,0,0,0.4)', 'transparent']} style={styles.background}>
        <Header header="Map" />
      </LinearGradient>

      <MapView
        style={[StyleSheet.absoluteFill, styles.map]}
        showsUserLocation
        showsMyLocationButton
        ref={mapRef}
        userLocationAnnotationTitle=""
      >
        {location && (
          <Marker coordinate={location}>
            <Text style={styles.youText}>Me</Text>
            <Image source={processUserImage(userData?.avatar)} style={styles.userImage} />
          </Marker>
        )}

        {otherUsers.map(renderUserMarker)}
      </MapView>
        </>
    </SafeAreaView>
  );
};

export default Map;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative'
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 999,
  },
  youText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 20,
  },
  markerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  calloutView: {
    width: 100,
    height: 100,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'#ffffff'
  },
  calloutUsername: {
    fontWeight: 'bold',
    color: '#2ecc71',
    textAlign: 'center',
  },
  calloutImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  map: {},
});
