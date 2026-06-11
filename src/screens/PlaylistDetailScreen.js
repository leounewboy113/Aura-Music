import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { usePlayer } from '../context/PlayerContext';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/theme';
import { formatDuration } from '../utils/mediaLibrary';

export default function PlaylistDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { playlist } = route.params;
  const { playTrack } = usePlayer();
  const bg = COLORS.artistColors[Math.abs(playlist.name.charCodeAt(0)) % COLORS.artistColors.length][0];

  const playAll = (shuffle = false) => {
    if (playlist.tracks.length === 0) return;
    const tracks = shuffle ? [...playlist.tracks].sort(() => Math.random() - 0.5) : playlist.tracks;
    playTrack(tracks[0], tracks, 0);
    navigation.navigate('Player');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>
      <View style={styles.hero}>
        <View style={[styles.cover, { backgroundColor: bg }]}>
          <Ionicons name="musical-notes" size={52} color="rgba(255,255,255,0.8)" />
        </View>
        <Text style={styles.plName}>{playlist.name}</Text>
        <Text style={styles.plMeta}>{playlist.tracks.length} morceau{playlist.tracks.length !== 1 ? 'x' : ''}</Text>
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.playBtn} onPress={() => playAll(false)}>
            <Ionicons name="play" size={18} color="white" />
            <Text style={styles.playBtnText}>Lire</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shuffleBtn} onPress={() => playAll(true)}>
            <Ionicons name="shuffle" size={18} color={COLORS.text} />
            <Text style={styles.shuffleBtnText}>Shuffle</Text>
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={playlist.tracks}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="add-circle-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>Ajoute des morceaux depuis ta bibliothèque</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <TouchableOpacity style={styles.trackRow} onPress={() => { playTrack(item, playlist.tracks, index); navigation.navigate('Player'); }} activeOpacity={0.7}>
            <View style={[styles.trackThumb, { backgroundColor: COLORS.artistColors[index % COLORS.artistColors.length][0] }]}>
              <Ionicons name="musical-note" size={14} color="rgba(255,255,255,0.8)" />
            </View>
            <View style={styles.trackInfo}>
              <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.trackMeta}>{item.artist} • {formatDuration(item.duration)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  hero: { alignItems: 'center', paddingVertical: SPACING.xl, gap: SPACING.sm },
  cover: { width: 140, height: 140, borderRadius: RADIUS.xxl, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  plName: { color: COLORS.text, fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.black },
  plMeta: { color: COLORS.textMuted, fontSize: FONTS.sizes.md },
  btnRow: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.sm },
  playBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xxl, paddingVertical: SPACING.sm, borderRadius: RADIUS.full },
  playBtnText: { color: 'white', fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold },
  shuffleBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.glass, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm, borderRadius: RADIUS.full },
  shuffleBtnText: { color: COLORS.text, fontSize: FONTS.sizes.md },
  list: { paddingHorizontal: SPACING.xl, paddingBottom: 140 },
  trackRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, gap: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  trackThumb: { width: 44, height: 44, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  trackInfo: { flex: 1, minWidth: 0 },
  trackTitle: { color: COLORS.text, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.medium },
  trackMeta: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 2 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: SPACING.md },
  emptyText: { color: COLORS.textMuted, fontSize: FONTS.sizes.md, textAlign: 'center' },
});
