import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { usePlayer } from '../context/PlayerContext';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/theme';
import { formatDuration } from '../utils/mediaLibrary';

export default function AlbumScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { album } = route.params;
  const { playTrack } = usePlayer();
  const bg = COLORS.artistColors[Math.abs(album.name.charCodeAt(0)) % COLORS.artistColors.length][0];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>
      <View style={styles.hero}>
        <View style={[styles.cover, { backgroundColor: bg }]}>
          <Ionicons name="disc" size={52} color="rgba(255,255,255,0.7)" />
        </View>
        <Text style={styles.albumName} numberOfLines={2}>{album.name}</Text>
        <Text style={styles.albumMeta}>{album.artist} • {album.tracks.length} sons</Text>
        <TouchableOpacity style={styles.playBtn} onPress={() => { playTrack(album.tracks[0], album.tracks, 0); navigation.navigate('Player'); }}>
          <Ionicons name="play" size={18} color="white" />
          <Text style={styles.playBtnText}>Lire l'album</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={album.tracks}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <TouchableOpacity style={styles.trackRow} onPress={() => { playTrack(item, album.tracks, index); navigation.navigate('Player'); }} activeOpacity={0.7}>
            <Text style={styles.trackNum}>{index + 1}</Text>
            <View style={styles.trackInfo}>
              <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.trackMeta}>{formatDuration(item.duration)}</Text>
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
  cover: { width: 160, height: 160, borderRadius: RADIUS.xxl, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  albumName: { color: COLORS.text, fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.black, textAlign: 'center' },
  albumMeta: { color: COLORS.textMuted, fontSize: FONTS.sizes.md },
  playBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xxl, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, marginTop: SPACING.sm },
  playBtnText: { color: 'white', fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold },
  list: { paddingHorizontal: SPACING.xl, paddingBottom: 140 },
  trackRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, gap: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  trackNum: { color: COLORS.textMuted, fontSize: FONTS.sizes.md, width: 24, textAlign: 'center' },
  trackInfo: { flex: 1 },
  trackTitle: { color: COLORS.text, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.medium },
  trackMeta: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 2 },
});
