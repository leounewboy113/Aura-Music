// ===== LibraryScreen.js =====
import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { usePlayer } from '../context/PlayerContext';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/theme';
import { formatDuration, groupByArtist, groupByAlbum, searchLibrary } from '../utils/mediaLibrary';

const TABS = ['Tous', 'Artistes', 'Albums'];

const TrackRow = ({ track, index, onPress, isPlaying }) => {
  const bg = COLORS.artistColors[index % COLORS.artistColors.length][0];
  return (
    <TouchableOpacity style={styles.trackRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.trackThumb, { backgroundColor: bg }]}>
        <Ionicons name={isPlaying ? 'musical-notes' : 'musical-note'} size={16} color={isPlaying ? 'white' : 'rgba(255,255,255,0.7)'} />
      </View>
      <View style={styles.trackInfo}>
        <Text style={[styles.trackTitle, isPlaying && { color: COLORS.primary }]} numberOfLines={1}>{track.title}</Text>
        <Text style={styles.trackMeta} numberOfLines={1}>{track.artist} • {formatDuration(track.duration)} • {track.quality}</Text>
      </View>
      <Ionicons name="ellipsis-vertical" size={18} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
};

const ArtistRow = ({ artist, index, onPress }) => {
  const bg = COLORS.artistColors[index % COLORS.artistColors.length][0];
  return (
    <TouchableOpacity style={styles.rowBase} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.artistAvatar, { backgroundColor: bg }]}>
        <Text style={styles.artistInitial}>{artist.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowTitle}>{artist.name}</Text>
        <Text style={styles.rowSub}>{artist.count} morceau{artist.count > 1 ? 'x' : ''}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
};

const AlbumRow = ({ album, index, onPress }) => {
  const bg = COLORS.artistColors[index % COLORS.artistColors.length][0];
  return (
    <TouchableOpacity style={styles.rowBase} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.albumCover, { backgroundColor: bg }]}>
        <Ionicons name="disc" size={22} color="rgba(255,255,255,0.7)" />
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowTitle} numberOfLines={1}>{album.name}</Text>
        <Text style={styles.rowSub}>{album.artist} • {album.tracks.length} sons</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
};

export default function LibraryScreen() {
  const navigation = useNavigation();
  const { library, currentTrack, playTrack } = usePlayer();
  const [activeTab, setActiveTab] = useState('Tous');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('title');

  const filtered = useMemo(() => searchLibrary(library, query), [library, query]);
  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sortBy === 'title') arr.sort((a, b) => a.title.localeCompare(b.title));
    else if (sortBy === 'artist') arr.sort((a, b) => a.artist.localeCompare(b.artist));
    else arr.sort((a, b) => (b.modificationTime || 0) - (a.modificationTime || 0));
    return arr;
  }, [filtered, sortBy]);

  const artists = useMemo(() => groupByArtist(filtered), [filtered]);
  const albums = useMemo(() => groupByAlbum(filtered), [filtered]);

  const playFromLib = (track) => {
    playTrack(track, sorted, sorted.findIndex(t => t.id === track.id));
    navigation.navigate('Player');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Bibliothèque</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={() => setSortBy(s => s === 'title' ? 'artist' : s === 'artist' ? 'recent' : 'title')}>
          <Ionicons name="funnel-outline" size={18} color={COLORS.text} />
        </TouchableOpacity>
      </View>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={COLORS.textMuted} />
        <TextInput style={styles.searchInput} placeholder="Rechercher..." placeholderTextColor={COLORS.textMuted} value={query} onChangeText={setQuery} />
        {query.length > 0 && <TouchableOpacity onPress={() => setQuery('')}><Ionicons name="close-circle" size={18} color={COLORS.textMuted} /></TouchableOpacity>}
      </View>
      <View style={styles.tabRow}>
        {TABS.map(tab => (
          <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.countText}>
        {activeTab === 'Tous' && `${sorted.length} morceau${sorted.length > 1 ? 'x' : ''}`}
        {activeTab === 'Artistes' && `${artists.length} artiste${artists.length > 1 ? 's' : ''}`}
        {activeTab === 'Albums' && `${albums.length} album${albums.length > 1 ? 's' : ''}`}
      </Text>
      {activeTab === 'Tous' && (
        <FlatList data={sorted} keyExtractor={item => item.id}
          renderItem={({ item, index }) => <TrackRow track={item} index={index} isPlaying={currentTrack?.id === item.id} onPress={() => playFromLib(item)} />}
          contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}
          ListEmptyComponent={<View style={styles.empty}><Ionicons name="musical-notes-outline" size={48} color={COLORS.textMuted} /><Text style={styles.emptyText}>Aucun morceau trouvé</Text></View>}
        />
      )}
      {activeTab === 'Artistes' && (
        <FlatList data={artists} keyExtractor={item => item.name}
          renderItem={({ item, index }) => <ArtistRow artist={item} index={index} onPress={() => navigation.navigate('Artist', { artist: item.name })} />}
          contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}
        />
      )}
      {activeTab === 'Albums' && (
        <FlatList data={albums} keyExtractor={item => item.name}
          renderItem={({ item, index }) => <AlbumRow album={item} index={index} onPress={() => navigation.navigate('Album', { album: item })} />}
          contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.xl, paddingBottom: SPACING.sm },
  screenTitle: { color: COLORS.text, fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.black },
  iconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.glass, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.glass, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, marginHorizontal: SPACING.xl, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, marginBottom: SPACING.md },
  searchInput: { flex: 1, color: COLORS.text, fontSize: FONTS.sizes.md },
  tabRow: { flexDirection: 'row', paddingHorizontal: SPACING.xl, gap: SPACING.sm, marginBottom: SPACING.sm },
  tab: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, backgroundColor: COLORS.glass, borderWidth: 1, borderColor: COLORS.border },
  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabLabel: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.medium },
  tabLabelActive: { color: 'white' },
  countText: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, paddingHorizontal: SPACING.xl, marginBottom: SPACING.sm },
  list: { paddingHorizontal: SPACING.xl, paddingBottom: 140 },
  trackRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, gap: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  trackThumb: { width: 46, height: 46, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  trackInfo: { flex: 1, minWidth: 0 },
  trackTitle: { color: COLORS.text, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.medium },
  trackMeta: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 2 },
  rowBase: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, gap: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  artistAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  artistInitial: { color: 'white', fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.black },
  albumCover: { width: 52, height: 52, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  rowInfo: { flex: 1 },
  rowTitle: { color: COLORS.text, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.medium },
  rowSub: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 2 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: SPACING.md },
  emptyText: { color: COLORS.textMuted, fontSize: FONTS.sizes.md },
});
