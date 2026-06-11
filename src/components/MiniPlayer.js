import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { usePlayer } from '../context/PlayerContext';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/theme';
import { formatDuration } from '../utils/mediaLibrary';

const MiniPlayer = () => {
  const navigation = useNavigation();
  const { currentTrack, isPlaying, isLoading, pauseResume, playNext, position, duration } = usePlayer();
  const slideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    if (currentTrack) {
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }).start();
    }
  }, [currentTrack]);

  if (!currentTrack) return null;

  const progress = duration > 0 ? (position / duration) : 0;

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ translateY: slideAnim }] }]}>
      <TouchableOpacity activeOpacity={0.95} onPress={() => navigation.navigate('Player')} style={styles.container}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <View style={styles.cover}>
          <Ionicons name="musical-note" size={20} color="white" />
        </View>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
          <Text style={styles.artist} numberOfLines={1}>{currentTrack.artist}</Text>
        </View>
        <View style={styles.controls}>
          <TouchableOpacity onPress={(e) => { e.stopPropagation(); pauseResume(); }} style={styles.playBtn} hitSlop={{ top:10, bottom:10, left:10, right:10 }}>
            {isLoading
              ? <ActivityIndicator size="small" color="white" />
              : <Ionicons name={isPlaying ? 'pause' : 'play'} size={20} color="white" />
            }
          </TouchableOpacity>
          <TouchableOpacity onPress={(e) => { e.stopPropagation(); playNext(); }} hitSlop={{ top:10, bottom:10, left:10, right:10 }} style={styles.nextBtn}>
            <Ionicons name="play-skip-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: { position: 'absolute', bottom: 68, left: 12, right: 12, zIndex: 999 },
  container: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1a0a2e', borderRadius: RADIUS.xl,
    padding: SPACING.sm, paddingRight: SPACING.md,
    borderWidth: 1, borderColor: 'rgba(232,70,10,0.2)',
    gap: SPACING.sm, overflow: 'hidden',
  },
  progressBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, backgroundColor: 'rgba(255,255,255,0.08)' },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 2 },
  cover: { width: 44, height: 44, borderRadius: RADIUS.md, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, minWidth: 0 },
  title: { color: COLORS.text, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.medium },
  artist: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, marginTop: 2 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  playBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  nextBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
});

export default MiniPlayer;
