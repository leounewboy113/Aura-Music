import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Dimensions, Animated, ScrollView, ActivityIndicator,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { usePlayer } from '../context/PlayerContext';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/theme';
import { formatDuration } from '../utils/mediaLibrary';

const { width: W } = Dimensions.get('window');
const COVER_SIZE = W - 64;
const SEEK_WIDTH = W - 48;

// Barre waveform animée
const WaveBar = ({ height, duration, delay, active }) => {
  const anim = useRef(new Animated.Value(4)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(anim, { toValue: height, duration, useNativeDriver: false, delay }),
      Animated.timing(anim, { toValue: 4, duration, useNativeDriver: false }),
    ]));
    loop.start();
    return () => loop.stop();
  }, []);
  return (
    <Animated.View style={{
      width: 3, height: anim, borderRadius: 2,
      backgroundColor: active ? COLORS.secondary : COLORS.primary,
      opacity: active ? 1 : 0.55,
    }} />
  );
};

const Waveform = ({ isPlaying }) => {
  const heights = [8,16,24,32,20,28,12,22,30,18,26,14,28,20,10,24,32,16,22,18];
  const durations = [600,750,700,850,680,720,800,650,770,710,760,690,730,660,790,720,670,800,740,680];
  if (!isPlaying) {
    return (
      <View style={styles.waveform}>
        {heights.map((_, i) => (
          <View key={i} style={{ width:3, height:4, borderRadius:2, backgroundColor:COLORS.primary, opacity:0.3 }} />
        ))}
      </View>
    );
  }
  return (
    <View style={styles.waveform}>
      {heights.map((h, i) => (
        <WaveBar key={i} height={h} duration={durations[i]} delay={i * 30} active={i >= 8 && i <= 13} />
      ))}
    </View>
  );
};

// Seekbar manuelle sans dépendance externe
const SeekBar = ({ progress, duration, onSeek }) => {
  const [localProgress, setLocalProgress] = useState(null);
  const barRef = useRef(null);

  const handlePress = (evt) => {
    const x = evt.nativeEvent.locationX;
    const ratio = Math.max(0, Math.min(1, x / SEEK_WIDTH));
    setLocalProgress(ratio);
    onSeek(ratio * duration);
    setTimeout(() => setLocalProgress(null), 300);
  };

  const displayProgress = localProgress !== null ? localProgress : progress;

  return (
    <View style={styles.seekContainer}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={handlePress}
        style={styles.seekTrack}
        ref={barRef}
      >
        <View style={[styles.seekFill, { width: `${Math.min(displayProgress * 100, 100)}%` }]} />
        <View style={[styles.seekThumb, { left: `${Math.min(displayProgress * 100, 98)}%` }]} />
      </TouchableOpacity>
      <View style={styles.seekTimes}>
        <Text style={styles.seekTime}>{formatDuration(progress * duration)}</Text>
        <Text style={styles.seekTime}>{formatDuration(duration)}</Text>
      </View>
    </View>
  );
};

export default function PlayerScreen() {
  const navigation = useNavigation();
  const {
    currentTrack, isPlaying, isLoading,
    position, duration,
    pauseResume, seekTo, playNext, playPrevious,
    toggleShuffle, toggleRepeat, shuffleMode, repeatMode,
    toggleFavorite, isFavorite,
    playbackRate, changePlaybackRate,
  } = usePlayer();

  const [showRates, setShowRates] = useState(false);
  const coverScale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.spring(coverScale, {
      toValue: isPlaying ? 1 : 0.88,
      useNativeDriver: true,
      tension: 60, friction: 8,
    }).start();
  }, [isPlaying]);

  if (!currentTrack) {
    return (
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-down" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.emptyPlayer}>
          <Ionicons name="musical-notes-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>Aucun morceau en lecture</Text>
        </View>
      </SafeAreaView>
    );
  }

  const progress = duration > 0 ? position / duration : 0;
  const liked = isFavorite(currentTrack.id);
  const bg = COLORS.artistColors[
    Math.abs(currentTrack.title.charCodeAt(0)) % COLORS.artistColors.length
  ][0];
  const repeatIcon = repeatMode === 'one' ? 'repeat' : 'repeat-outline';
  const repeatColor = repeatMode !== 'none' ? COLORS.primary : COLORS.textMuted;
  const rates = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  return (
    <SafeAreaView style={styles.safe} edges={['top','bottom']}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-down" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerSub}>En lecture</Text>
          <Text style={styles.headerAlbum} numberOfLines={1}>
            {currentTrack.album || 'Bibliothèque locale'}
          </Text>
        </View>
        <TouchableOpacity style={styles.backBtn}>
          <Ionicons name="ellipsis-horizontal" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* COVER */}
        <View style={styles.coverContainer}>
          <Animated.View style={{ transform: [{ scale: coverScale }] }}>
            <View style={[styles.cover, { backgroundColor: bg }]}>
              <Ionicons name="musical-notes" size={COVER_SIZE * 0.35} color="rgba(255,255,255,0.5)" />
            </View>
          </Animated.View>
        </View>

        {/* INFOS */}
        <View style={styles.trackInfo}>
          <View style={styles.trackInfoLeft}>
            <Text style={styles.trackTitle} numberOfLines={1}>{currentTrack.title}</Text>
            <Text style={styles.trackArtist} numberOfLines={1}>{currentTrack.artist}</Text>
            <View style={styles.qualityBadge}>
              <Text style={styles.qualityText}>{currentTrack.quality}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => toggleFavorite(currentTrack)} style={styles.likeBtn}>
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={28}
              color={liked ? COLORS.pink : COLORS.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* WAVEFORM */}
        <Waveform isPlaying={isPlaying} />

        {/* SEEKBAR MAISON */}
        <SeekBar progress={progress} duration={duration} onSeek={seekTo} />

        {/* CONTRÔLES SECONDAIRES */}
        <View style={styles.secondaryControls}>
          <TouchableOpacity onPress={toggleShuffle}>
            <Ionicons name="shuffle" size={22} color={shuffleMode ? COLORS.primary : COLORS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowRates(p => !p)}>
            <Text style={[styles.rateText, playbackRate !== 1 && { color: COLORS.primary }]}>
              {playbackRate}x
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleRepeat}>
            <Ionicons name={repeatIcon} size={22} color={repeatColor} />
          </TouchableOpacity>
        </View>

        {/* VITESSES */}
        {showRates && (
          <View style={styles.ratesContainer}>
            {rates.map(r => (
              <TouchableOpacity
                key={r}
                style={[styles.rateBtn, playbackRate === r && styles.rateBtnActive]}
                onPress={() => { changePlaybackRate(r); setShowRates(false); }}
              >
                <Text style={[styles.rateBtnText, playbackRate === r && styles.rateBtnTextActive]}>
                  {r}x
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* CONTRÔLES PRINCIPAUX */}
        <View style={styles.mainControls}>
          <TouchableOpacity onPress={playPrevious} style={styles.ctrlBtn}>
            <Ionicons name="play-skip-back" size={30} color={COLORS.text} />
          </TouchableOpacity>

          <TouchableOpacity onPress={pauseResume} activeOpacity={0.85}>
            <View style={styles.playPauseBtn}>
              {isLoading
                ? <ActivityIndicator size="large" color="white" />
                : <Ionicons
                    name={isPlaying ? 'pause' : 'play'}
                    size={34} color="white"
                    style={!isPlaying && { marginLeft: 3 }}
                  />
              }
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={playNext} style={styles.ctrlBtn}>
            <Ionicons name="play-skip-forward" size={30} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* EXTRAS */}
        <View style={styles.extraRow}>
          <View style={styles.extraChip}>
            <Ionicons name="musical-note" size={12} color={COLORS.textMuted} />
            <Text style={styles.extraText}>{currentTrack.quality}</Text>
          </View>
          <View style={styles.extraChip}>
            <Ionicons name="time-outline" size={12} color={COLORS.textMuted} />
            <Text style={styles.extraText}>{formatDuration(duration)}</Text>
          </View>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  emptyPlayer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md },
  emptyText: { color: COLORS.textMuted, fontSize: FONTS.sizes.lg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    justifyContent: 'space-between',
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerSub: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, letterSpacing: 1 },
  headerAlbum: { color: COLORS.text, fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.medium },
  content: { paddingHorizontal: SPACING.xl },
  coverContainer: { alignItems: 'center', marginVertical: SPACING.xl },
  cover: {
    width: COVER_SIZE, height: COVER_SIZE,
    borderRadius: RADIUS.xxl,
    alignItems: 'center', justifyContent: 'center',
  },
  trackInfo: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: SPACING.md,
  },
  trackInfoLeft: { flex: 1, marginRight: SPACING.md },
  trackTitle: {
    color: COLORS.text, fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.black, letterSpacing: -0.5,
  },
  trackArtist: { color: COLORS.textMuted, fontSize: FONTS.sizes.lg, marginTop: 4 },
  qualityBadge: {
    marginTop: SPACING.xs, backgroundColor: COLORS.glass,
    paddingHorizontal: SPACING.sm, paddingVertical: 3,
    borderRadius: RADIUS.sm, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: COLORS.border,
  },
  qualityText: { color: COLORS.primary, fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.medium },
  likeBtn: { padding: SPACING.sm },
  waveform: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 3,
    height: 36, marginVertical: SPACING.md,
  },
  seekContainer: { marginBottom: SPACING.lg },
  seekTrack: {
    width: '100%', height: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 3, position: 'relative',
    justifyContent: 'center',
  },
  seekFill: {
    height: '100%', backgroundColor: COLORS.primary,
    borderRadius: 3, position: 'absolute', left: 0,
  },
  seekThumb: {
    position: 'absolute', width: 16, height: 16,
    borderRadius: 8, backgroundColor: 'white',
    marginLeft: -8, top: -5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 4, elevation: 4,
  },
  seekTimes: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.sm,
  },
  seekTime: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs },
  secondaryControls: {
    flexDirection: 'row', justifyContent: 'space-around',
    alignItems: 'center', marginBottom: SPACING.xl,
  },
  rateText: { color: COLORS.textMuted, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold },
  ratesContainer: {
    flexDirection: 'row', justifyContent: 'center',
    gap: SPACING.sm, marginBottom: SPACING.lg, flexWrap: 'wrap',
  },
  rateBtn: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: RADIUS.lg, backgroundColor: COLORS.glass,
    borderWidth: 1, borderColor: COLORS.border,
  },
  rateBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  rateBtnText: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm },
  rateBtnTextActive: { color: 'white', fontWeight: FONTS.weights.bold },
  mainControls: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl, marginBottom: SPACING.xl,
  },
  ctrlBtn: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  playPauseBtn: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  extraRow: {
    flexDirection: 'row', gap: SPACING.sm,
    justifyContent: 'center', marginBottom: SPACING.md,
  },
  extraChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.glass, paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  extraText: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs },
});
