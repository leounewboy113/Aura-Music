import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { usePlayer } from '../context/PlayerContext';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/theme';
import { formatDuration } from '../utils/mediaLibrary';

export default function ArtistScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { artist: artistName } = route.params;
  const { library, stats, playTrack } = usePlayer();
  const tracks = library.filter(t => t.artist === artistName);
  const artistStats = stats.artistStats?.[artistName] || { plays: 0 };
  const bg = COLORS.artistColors[Math.abs(artistName.charCodeAt(0)) % COLORS.artistColors.length][0];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>
      <View style={styles.hero}>
        <View style={[styles.avatar, { backgroundColor: bg }]}>
          <Text style={styles.initial}>{artistName.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.artistName}>{artistName}</Text>
        <Text style={styles.artistMeta}>{tracks.length} sons • {artistStats.plays} écoutes</Text>
        <TouchableOpacity style={styles.playAllBtn} onPress={() => { if (tracks.length > 0) { playTrack(tracks[0], tracks, 0); navigation.navigate('Player'); } }}>
          <Ionicons name="play" size={18} color="white" />
          <Text style={styles.playAllText}>Tout lire</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={tracks}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <TouchableOpacity style={styles.trackRow} onPress={() => { playTrack(item, tracks, index); navigation.navigate('Player'); }} activeOpacity={0.7}>
            <Text style={styles.trackNum}>{index + 1}</Text>
            <View style={styles.trackInfo}>
              <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.trackMeta}>{formatDuration(item.duration)} • {item.quality}</Text>
            </View>
            <Ionicons name="ellipsis-vertical" size={18} color={COLORS.textMuted} />
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
  avatar: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  initial: { color: 'white', fontSize: 42, fontWeight: '800' },
  artistName: { color: COLORS.text, fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.black },
  artistMeta: { color: COLORS.textMuted, fontSize: FONTS.sizes.md },
  playAllBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xxl, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, marginTop: SPACING.sm },
  playAllText: { color: 'white', fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold },
  list: { paddingHorizontal: SPACING.xl, paddingBottom: 140 },
  trackRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, gap: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  trackNum: { color: COLORS.textMuted, fontSize: FONTS.sizes.md, width: 24, textAlign: 'center' },
  trackInfo: { flex: 1, minWidth: 0 },
  trackTitle: { color: COLORS.text, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.medium },
  trackMeta: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 2 },
});
