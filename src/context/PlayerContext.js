import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PlayerContext = createContext(null);

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer doit être utilisé dans PlayerProvider');
  return ctx;
};

export const PlayerProvider = ({ children }) => {
  const soundRef = useRef(null);

  // Bibliothèque
  const [library, setLibrary] = useState([]);
  const [playlists, setPlaylists] = useState([]);

  // Lecture en cours
  const [currentTrack, setCurrentTrack] = useState(null);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);

  // État du player
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Modes
  const [shuffleMode, setShuffleMode] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none'); // none | one | all
  const [volume, setVolume] = useState(1.0);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  // Stats
  const [stats, setStats] = useState({
    totalListeningTime: 0,    // en secondes
    totalPlays: 0,
    trackStats: {},           // { trackId: { plays, totalTime, lastPlayed } }
    artistStats: {},          // { artistName: { plays, totalTime } }
    dailyStats: {},           // { 'YYYY-MM-DD': secondes }
    streak: 0,
    lastActiveDate: null,
  });

  // Charger les stats sauvegardées au démarrage
  useEffect(() => {
    loadStats();
    loadPlaylists();
    setupAudio();
    return () => {
      if (soundRef.current) soundRef.current.unloadAsync();
    };
  }, []);

  const setupAudio = async () => {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  };

  const loadStats = async () => {
    try {
      const saved = await AsyncStorage.getItem('aura_stats');
      if (saved) setStats(JSON.parse(saved));
    } catch (e) {}
  };

  const saveStats = async (newStats) => {
    try {
      await AsyncStorage.setItem('aura_stats', JSON.stringify(newStats));
    } catch (e) {}
  };

  const loadPlaylists = async () => {
    try {
      const saved = await AsyncStorage.getItem('aura_playlists');
      if (saved) setPlaylists(JSON.parse(saved));
    } catch (e) {}
  };

  const savePlaylists = async (newPlaylists) => {
    try {
      await AsyncStorage.setItem('aura_playlists', JSON.stringify(newPlaylists));
    } catch (e) {}
  };

  // Jouer un morceau
  const playTrack = useCallback(async (track, trackQueue = null, index = 0) => {
    try {
      setIsLoading(true);

      // Décharger le son précédent
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: track.uri },
        {
          shouldPlay: true,
          volume,
          rate: playbackRate,
          progressUpdateIntervalMillis: 500,
        },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
      setCurrentTrack(track);
      setIsPlaying(true);
      setIsLoading(false);

      if (trackQueue) {
        setQueue(trackQueue);
        setQueueIndex(index);
      }

      // Mettre à jour les stats
      recordPlay(track);

    } catch (error) {
      console.error('Erreur lecture:', error);
      setIsLoading(false);
    }
  }, [volume, playbackRate]);

  const onPlaybackStatusUpdate = (status) => {
    if (!status.isLoaded) return;
    setPosition(status.positionMillis || 0);
    setDuration(status.durationMillis || 0);
    setIsPlaying(status.isPlaying);

    // Fin de morceau
    if (status.didJustFinish) {
      handleTrackEnd();
    }
  };

  const handleTrackEnd = useCallback(() => {
    if (repeatMode === 'one') {
      seekTo(0);
      resume();
    } else if (repeatMode === 'all' || queueIndex < queue.length - 1) {
      playNext();
    } else {
      setIsPlaying(false);
    }
  }, [repeatMode, queueIndex, queue]);

  const pauseResume = async () => {
    if (!soundRef.current) return;
    if (isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
  };

  const resume = async () => {
    if (!soundRef.current) return;
    await soundRef.current.playAsync();
  };

  const seekTo = async (millis) => {
    if (!soundRef.current) return;
    await soundRef.current.setPositionAsync(millis);
  };

  const playNext = useCallback(() => {
    if (queue.length === 0) return;
    let nextIndex;
    if (shuffleMode) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = (queueIndex + 1) % queue.length;
    }
    setQueueIndex(nextIndex);
    playTrack(queue[nextIndex], queue, nextIndex);
  }, [queue, queueIndex, shuffleMode, playTrack]);

  const playPrevious = useCallback(() => {
    if (queue.length === 0) return;
    // Si position > 3s, on recommence le morceau
    if (position > 3000) {
      seekTo(0);
      return;
    }
    const prevIndex = queueIndex > 0 ? queueIndex - 1 : queue.length - 1;
    setQueueIndex(prevIndex);
    playTrack(queue[prevIndex], queue, prevIndex);
  }, [queue, queueIndex, position, playTrack]);

  const toggleShuffle = () => setShuffleMode(p => !p);

  const toggleRepeat = () => {
    setRepeatMode(p => {
      if (p === 'none') return 'all';
      if (p === 'all') return 'one';
      return 'none';
    });
  };

  const changeVolume = async (val) => {
    setVolume(val);
    if (soundRef.current) await soundRef.current.setVolumeAsync(val);
  };

  const changePlaybackRate = async (rate) => {
    setPlaybackRate(rate);
    if (soundRef.current) await soundRef.current.setRateAsync(rate, true);
  };

  // Stats
  const recordPlay = (track) => {
    const today = new Date().toISOString().split('T')[0];
    setStats(prev => {
      const newStats = { ...prev };
      newStats.totalPlays += 1;

      // Stats par morceau
      if (!newStats.trackStats[track.id]) {
        newStats.trackStats[track.id] = { plays: 0, totalTime: 0, lastPlayed: null };
      }
      newStats.trackStats[track.id].plays += 1;
      newStats.trackStats[track.id].lastPlayed = new Date().toISOString();

      // Stats par artiste
      const artist = track.artist || 'Inconnu';
      if (!newStats.artistStats[artist]) {
        newStats.artistStats[artist] = { plays: 0, totalTime: 0 };
      }
      newStats.artistStats[artist].plays += 1;

      // Stats journalières
      if (!newStats.dailyStats[today]) newStats.dailyStats[today] = 0;

      // Streak
      if (newStats.lastActiveDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yStr = yesterday.toISOString().split('T')[0];
        if (newStats.lastActiveDate === yStr) {
          newStats.streak += 1;
        } else {
          newStats.streak = 1;
        }
        newStats.lastActiveDate = today;
      }

      saveStats(newStats);
      return newStats;
    });
  };

  // Playlists
  const createPlaylist = async (name, tracks = []) => {
    const newPlaylist = {
      id: Date.now().toString(),
      name,
      tracks,
      createdAt: new Date().toISOString(),
      cover: null,
    };
    const updated = [...playlists, newPlaylist];
    setPlaylists(updated);
    await savePlaylists(updated);
    return newPlaylist;
  };

  const addToPlaylist = async (playlistId, track) => {
    const updated = playlists.map(p => {
      if (p.id === playlistId) {
        const already = p.tracks.find(t => t.id === track.id);
        if (already) return p;
        return { ...p, tracks: [...p.tracks, track] };
      }
      return p;
    });
    setPlaylists(updated);
    await savePlaylists(updated);
  };

  const deletePlaylist = async (playlistId) => {
    const updated = playlists.filter(p => p.id !== playlistId);
    setPlaylists(updated);
    await savePlaylists(updated);
  };

  // Favoris
  const toggleFavorite = async (track) => {
    const favPlaylist = playlists.find(p => p.name === '❤️ Favoris');
    if (!favPlaylist) {
      await createPlaylist('❤️ Favoris', [track]);
    } else {
      const isFav = favPlaylist.tracks.find(t => t.id === track.id);
      const updated = playlists.map(p => {
        if (p.name === '❤️ Favoris') {
          return {
            ...p,
            tracks: isFav
              ? p.tracks.filter(t => t.id !== track.id)
              : [...p.tracks, track],
          };
        }
        return p;
      });
      setPlaylists(updated);
      await savePlaylists(updated);
    }
  };

  const isFavorite = (trackId) => {
    const favPlaylist = playlists.find(p => p.name === '❤️ Favoris');
    return favPlaylist ? !!favPlaylist.tracks.find(t => t.id === trackId) : false;
  };

  return (
    <PlayerContext.Provider value={{
      // Bibliothèque
      library, setLibrary,
      playlists,

      // Player
      currentTrack,
      queue, setQueue,
      queueIndex,
      isPlaying,
      position,
      duration,
      isLoading,
      shuffleMode,
      repeatMode,
      volume,
      playbackRate,

      // Actions player
      playTrack,
      pauseResume,
      seekTo,
      playNext,
      playPrevious,
      toggleShuffle,
      toggleRepeat,
      changeVolume,
      changePlaybackRate,

      // Stats
      stats,

      // Playlists
      createPlaylist,
      addToPlaylist,
      deletePlaylist,
      toggleFavorite,
      isFavorite,
    }}>
      {children}
    </PlayerContext.Provider>
  );
};
