import React from 'react';
import { StatusBar, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { PlayerProvider } from './src/context/PlayerContext';

import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import StatsScreen from './src/screens/StatsScreen';
import PlaylistsScreen from './src/screens/PlaylistsScreen';
import PlayerScreen from './src/screens/PlayerScreen';
import ArtistScreen from './src/screens/ArtistScreen';
import AlbumScreen from './src/screens/AlbumScreen';
import PlaylistDetailScreen from './src/screens/PlaylistDetailScreen';
import MiniPlayer from './src/components/MiniPlayer';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#0d0614',
        borderTopColor: 'rgba(255,255,255,0.07)',
        borderTopWidth: 1,
        height: 68,
        paddingBottom: 10,
        paddingTop: 8,
      },
      tabBarActiveTintColor: '#e8460a',
      tabBarInactiveTintColor: 'rgba(240,234,248,0.45)',
      tabBarLabelStyle: { fontSize: 10, fontWeight: '500' },
      tabBarIcon: ({ focused, color }) => {
        let iconName;
        if (route.name === 'Accueil') iconName = focused ? 'home' : 'home-outline';
        else if (route.name === 'Recherche') iconName = focused ? 'search' : 'search-outline';
        else if (route.name === 'Bibliothèque') iconName = focused ? 'library' : 'library-outline';
        else if (route.name === 'Stats') iconName = focused ? 'bar-chart' : 'bar-chart-outline';
        else if (route.name === 'Playlists') iconName = focused ? 'musical-notes' : 'musical-notes-outline';
        return <Ionicons name={iconName} size={22} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Accueil" component={HomeScreen} />
    <Tab.Screen name="Recherche" component={SearchScreen} />
    <Tab.Screen name="Bibliothèque" component={LibraryScreen} />
    <Tab.Screen name="Stats" component={StatsScreen} />
    <Tab.Screen name="Playlists" component={PlaylistsScreen} />
  </Tab.Navigator>
);

const RootNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Main" component={TabNavigator} />
    <Stack.Screen
      name="Player"
      component={PlayerScreen}
      options={{ presentation: 'modal', gestureEnabled: true }}
    />
    <Stack.Screen name="Artist" component={ArtistScreen} />
    <Stack.Screen name="Album" component={AlbumScreen} />
    <Stack.Screen name="PlaylistDetail" component={PlaylistDetailScreen} />
  </Stack.Navigator>
);

export default function App() {
  return (
    <SafeAreaProvider>
      <PlayerProvider>
        <NavigationContainer>
          <StatusBar barStyle="light-content" backgroundColor="#080510" />
          <View style={styles.container}>
            <RootNavigator />
            <MiniPlayer />
          </View>
        </NavigationContainer>
      </PlayerProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080510' },
});
