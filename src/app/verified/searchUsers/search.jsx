import { View, Text, Pressable, Image, SafeAreaView, StyleSheet, FlatList, Platform, StatusBar } from 'react-native';
import React, { useEffect, useState } from 'react';
import SearchBar from '../../../components/SearchBar';
import { useRouter } from 'expo-router';
import { FIRESTORE_DB } from '../../../../Firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import processUserImage from '../../../../utils/processUserImage';
import { useUser } from '../../../../context/UserContext';
import { useTheme } from '../../../../context/ThemeContext';

const Search = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [shuffledFilteredUsers, setShuffledFilteredUsers] = useState([]);
    const [shuffledUsers, setShuffledUsers] = useState([]);
    const [searchText, setSearchText] = useState('');
    const { userData } = useUser();
    const currentUserId = userData.id;
    const { theme } = useTheme();
    const router = useRouter();

    const shuffleArray = (array) => {
        const shuffled = array.slice();
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const handleSearchQuery = (text) => {
        console.log(text);
    };

    const handleUserProfile = (user) => {
        router.replace({
            pathname: '/verified/profile/[otherUserProfile]',
            params: {
                id: user.id,
                firstname: user.FirstName,
                lastname: user.LastName,
                username: user.Username,
                avatar: user.avatar,
                user: user,
            }
        });
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersCollectionRef = collection(FIRESTORE_DB, 'users');
                const usersSnapshot = await getDocs(usersCollectionRef);
                let usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(user => user.id !== currentUserId);
                setUsers(usersList);
                setFilteredUsers(usersList);

                // Shuffle users and filtered users separately
                setShuffledUsers(shuffleArray(usersList));
                setShuffledFilteredUsers(shuffleArray(usersList));
            } catch (error) {
                console.error('Error fetching users: ', error);
            }
        };

        fetchUsers();
    }, [currentUserId]);

    const onActualChange = (text) => {
        setSearchText(text);
        const filteredList = users.filter(user => user.FirstName.toLowerCase().includes(text.toLowerCase()));
        setFilteredUsers(filteredList);
        setShuffledFilteredUsers(shuffleArray(filteredList));
    };

    const renderItem = ({ item }) => (
        <Pressable 
            onPress={() => handleUserProfile(item)} 
            style={[styles.pressable, { backgroundColor: theme.cardBackgroundColor }]}
        >
            <View style={styles.avatarContainer}>
                <Image source={processUserImage(item.avatar)} style={styles.avatar} />
            </View>
            <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: theme.textColor }]}>{item.FirstName} {item.LastName}</Text>
                <Text style={[styles.userUsername, { color: theme.grayText }]}>{item.Username}</Text>
            </View>
        </Pressable>
    );

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.backgroundColor }]}>
            <SearchBar onActualChange={onActualChange} color='white' />
            <View style={styles.container}>
                <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Results</Text>
                <FlatList
                    data={shuffledFilteredUsers}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={[styles.listContainer, { backgroundColor: theme.backgroundColor }]}
                />
                <Text style={[styles.sectionTitle, { color: theme.textColor }]}>People you may know</Text>
                <FlatList
                    data={shuffledUsers}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={[styles.listContainer, styles.listBottom, { backgroundColor: theme.backgroundColor }]}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
    },
    container: {
        flex: 1,
        paddingHorizontal: 15,
    },
    sectionTitle: {
        marginVertical: 15,
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 1.25,
    },
    listContainer: {
        paddingHorizontal: 10,
        gap: 0,
        paddingVertical: 10,
    },
    listBottom: {
        paddingBottom: 28,
    },
    pressable: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 10,
        marginVertical: 5,
    },
    avatarContainer: {
        width: 50,
        height: 50,
        backgroundColor: '#f5f5f5',
        borderRadius: 25,
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    userInfo: {
        flex: 1,
        marginLeft: 15,
    },
    userName: {
        fontSize: 16,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    userUsername: {
        fontSize: 12,
        fontWeight: '600',
        color: '#7f8c8d',
    },
});

export default Search;
