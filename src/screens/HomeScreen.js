import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { usePlayer } from '../context/PlayerContext';
import { scanMusicLibrary, formatDuration } from '../utils/mediaLibrary';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/theme';

const ArtistChip = ({ name, plays, color, onPress }) => (
  <TouchableOpacity style={styles.artistChip} onPress={onPress} activeOpacity={0.8}>
    <View style={[styles.artistAvatar, { backgroundColor: color }]}>
      <Text style={styles.artistInitial}>{name.charAt(0).toUpperCase()}</Text>
    </View>
    <Text style={styles.artistName} numberOfLines={1}>{name}</Text>
    <Text style={styles.artistPlays}>{plays} écoutes</Text>
  </TouchableOpacity>
);

const TopTrackRow = ({ rank, track, onPress }) => {
  const rankColor = rank === 1 ? COLORS.gold : rank === 2 ? COLORS.silver : rank === 3 ? COLORS.bronze : COLORS.textMuted;
  const bg = COLORS.artistColors[rank % COLORS.artistColors.length][0];
  return (
    <TouchableOpacity style={styles.topRow} onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.topRank, { color: rankColor }]}>{rank}</Text>
      <View style={[styles.topThumb, { backgroundColor: bg }]}>
        <Ionicons name="musical-note" size={16} color="rgba(255,255,255,0.8)" />
      </View>
      <View style={styles.topInfo}>
        <Text style={styles.topTitle} numberOfLines={1}>{track.title}</Text>
        <Text style={styles.topArtist} numberOfLines={1}>{track.artist}</Text>
      </View>
      <Text style={styles.topPlays}>▶ {track.plays || 0}</Text>
    </TouchableOpacity>
  );
};

const StatCard = ({ value, label }) => (
  <View style={styles.statCard}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default function HomeScreen() {
  const navigation = useNavigation();
  const { library, setLibrary, stats, currentTrack, playTrack, isPlaying } = usePlayer();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [scanProgress, setScanProgress] = useState({ loaded: 0, total: 0 });
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);

  useEffect(() => {
    if (library.length === 0) loadLibrary();
    else computeTops();
  }, []);

  useEffect(() => {
    if (library.length > 0) computeTops();
  }, [library, stats]);

  const loadLibrary = async () => {
    setLoading(true);
    try {
      const tracks = await scanMusicLibrary((loaded, total) => setScanProgress({ loaded, total }));
      setLibrary(tracks);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLibrary();
    setRefreshing(false);
  };

  const computeTops = () => {
    const trackStats = stats.trackStats || {};
    const ranked = library.map(t => ({ ...t, plays: trackStats[t.id]?.plays || 0 })).sort((a, b) => b.plays - a.plays).slice(0, 5);
    setTopTracks(ranked);
    const artistStats = stats.artistStats || {};
    const artists = Object.entries(artistStats).map(([name, data]) => ({ name, plays: data.plays })).sort((a, b) => b.plays - a.plays).slice(0, 5);
    setTopArtists(artists);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Ionicons name="musical-notes" size={48} color={COLORS.primary} />
        <Text style={styles.loadingTitle}>Scan en cours...</Text>
        {scanProgress.total > 0 && <Text style={styles.loadingCount}>{scanProgress.loaded} / {scanProgress.total} fichiers</Text>}
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: SPACING.lg }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour 👋</Text>
            <Text style={styles.appName}>AURA<Text style={styles.dot}>.</Text></Text>
          </View>
        </View>

        {/* NOW PLAYING */}
        {currentTrack && (
          <TouchableOpacity onPress={() => navigation.navigate('Player')} activeOpacity={0.9} style={styles.heroCard}>
            <View style={styles.heroCover}>
              <Ionicons name="musical-note" size={26} color="white" />
            </View>
            <View style={styles.heroInfo}>
              <Text style={styles.heroLabel}>▶ En écoute</Text>
              <Text style={styles.heroTitle} numberOfLines={1}>{currentTrack.title}</Text>
              <Text style={styles.heroArtist} numberOfLines={1}>{currentTrack.artist}</Text>
            </View>
            <Ionicons name={isPlaying ? 'pause-circle' : 'play-circle'} size={38} color={COLORS.primary} />
          </TouchableOpacity>
        )}

        {/* LANCER */}
        {library.length > 0 && !currentTrack && (
          <TouchableOpacity onPress={() => { playTrack(library[0], library, 0); navigation.navigate('Player'); }} activeOpacity={0.9} style={styles.playAllBtn}>
            <Ionicons name="play" size={20} color="white" />
            <Text style={styles.playAllText}>Lancer la bibliothèque</Text>
            <Text style={styles.playAllCount}>{library.length} sons</Text>
          </TouchableOpacity>
        )}

        {/* STATS */}
        <Text style={styles.sectionTitle}>Tes Stats</Text>
        <View style={styles.statsRow}>
          <StatCard value={`${Math.floor((stats.totalListeningTime || 0) / 3600)}h`} label="Écoute" />
          <StatCard value={stats.totalPlays || 0} label="Lectures" />
          <StatCard value={`${stats.streak || 0}🔥`} label="Streak" />
        </View>

        {/* TOP ARTISTES */}
        {topArtists.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Artistes</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Stats')}><Text style={styles.seeAll}>Voir tout</Text></TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
              {topArtists.map((artist, i) => (
                <ArtistChip
                  key={artist.name} name={artist.name} plays={artist.plays}
                  color={COLORS.artistColors[i % COLORS.artistColors.length][0]}
                  onPress={() => navigation.navigate('Artist', { artist: artist.name })}
                />
              ))}
            </ScrollView>
          </>
        )}

        {/* TOP 5 */}
        {topTracks.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🔥 Top Sons</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Stats')}><Text style={styles.seeAll}>Voir tout</Text></TouchableOpacity>
            </View>
            {topTracks.map((track, i) => (
              <TopTrackRow key={track.id} rank={i + 1} track={track}
                onPress={() => { playTrack(track, library, library.findIndex(t => t.id === track.id)); navigation.navigate('Player'); }}
              />
            ))}
          </>
        )}

        {/* VIDE */}
        {library.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>Aucun fichier trouvé</Text>
            <Text style={styles.emptyText}>Assure-toi d'avoir des fichiers MP3 ou FLAC sur ton téléphone</Text>
            <TouchableOpacity style={styles.scanBtn} onPress={loadLibrary}>
              <Text style={styles.scanBtnText}>Scanner à nouveau</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  loadingContainer: { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', gap: SPACING.md },
  loadingTitle: { color: COLORS.text, fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold },
  loadingCount: { color: COLORS.textMuted, fontSize: FONTS.sizes.md },
  scroll: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xl },
  greeting: { color: COLORS.textMuted, fontSize: FONTS.sizes.md },
  appName: { color: COLORS.text, fontSize: 32, fontWeight: FONTS.weights.black, letterSpacing: -1 },
  dot: { color: COLORS.primary },
  heroCard: { flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.xxl, padding: SPACING.lg, borderWidth: 1, borderColor: 'rgba(232,70,10,0.3)', gap: SPACING.md, marginBottom: SPACING.lg, backgroundColor: 'rgba(232,70,10,0.12)' },
  heroCover: { width: 62, height: 62, borderRadius: RADIUS.lg, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  heroInfo: { flex: 1, minWidth: 0 },
  heroLabel: { color: COLORS.primary, fontSize: FONTS.sizes.xs, letterSpacing: 1.5, marginBottom: 4 },
  heroTitle: { color: COLORS.text, fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold },
  heroArtist: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, marginTop: 2 },
  playAllBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.xl, padding: SPACING.lg, gap: SPACING.sm, marginBottom: SPACING.lg, backgroundColor: COLORS.primary },
  playAllText: { color: 'white', fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, flex: 1 },
  playAllCount: { color: 'rgba(255,255,255,0.7)', fontSize: FONTS.sizes.sm },
  statsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  statCard: { flex: 1, backgroundColor: COLORS.glass, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  statValue: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.black, color: COLORS.primary },
  statLabel: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 4, textAlign: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  sectionTitle: { color: COLORS.text, fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold, marginBottom: SPACING.sm, marginTop: SPACING.lg },
  seeAll: { color: COLORS.primary, fontSize: FONTS.sizes.sm },
  hScroll: { marginLeft: -SPACING.xl, paddingLeft: SPACING.xl, marginBottom: SPACING.md },
  artistChip: { alignItems: 'center', marginRight: SPACING.lg, width: 72 },
  artistAvatar: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xs },
  artistInitial: { color: 'white', fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.black },
  artistName: { color: COLORS.text, fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.medium, textAlign: 'center' },
  artistPlays: { color: COLORS.textMuted, fontSize: 10, marginTop: 2 },
  topRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, gap: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  topRank: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.black, width: 24, textAlign: 'center' },
  topThumb: { width: 44, height: 44, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  topInfo: { flex: 1, minWidth: 0 },
  topTitle: { color: COLORS.text, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.medium },
  topArtist: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, marginTop: 2 },
  topPlays: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: SPACING.md },
  emptyTitle: { color: COLORS.text, fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold },
  emptyText: { color: COLORS.textMuted, fontSize: FONTS.sizes.md, textAlign: 'center', lineHeight: 22 },
  scanBtn: { marginTop: SPACING.md, backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xxl, paddingVertical: SPACING.md, borderRadius: RADIUS.lg },
  scanBtnText: { color: 'white', fontWeight: FONTS.weights.bold, fontSize: FONTS.sizes.md },
});
