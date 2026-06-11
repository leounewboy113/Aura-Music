import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { usePlayer } from '../context/PlayerContext';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/theme';
import { formatDuration, searchLibrary } from '../utils/mediaLibrary';

const GENRES = [
  { name: 'Zouglou', emoji: '🎭', bg: '#e8460a' },
  { name: 'Afrobeat', emoji: '🎵', bg: '#6c3ff5' },
  { name: 'Coupé-Décalé', emoji: '🥁', bg: '#f5a623' },
  { name: 'Hip-Hop', emoji: '🎤', bg: '#0af5a6' },
  { name: 'Gospel', emoji: '🙏', bg: '#0a7ff5' },
  { name: 'Zoblazo', emoji: '💃', bg: '#f50a7f' },
];

export default function SearchScreen() {
  const navigation = useNavigation();
  const { library, playTrack } = usePlayer();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query || query.trim().length < 2) return [];
    return searchLibrary(library, query).slice(0, 30);
  }, [library, query]);

  const playResult = (track, index) => {
    playTrack(track, results, index);
    navigation.navigate('Player');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}><Text style={styles.screenTitle}>Recherche</Text></View>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={COLORS.textMuted} />
        <TextInput style={styles.searchInput} placeholder="Artiste, chanson, album..." placeholderTextColor={COLORS.textMuted} value={query} onChangeText={setQuery} returnKeyType="search" />
        {query.length > 0 && <TouchableOpacity onPress={() => setQuery('')}><Ionicons name="close-circle" size={20} color={COLORS.textMuted} /></TouchableOpacity>}
      </View>

      {query.length >= 2 ? (
        <FlatList
          data={results}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => (
            <TouchableOpacity style={styles.resultRow} onPress={() => playResult(item, index)} activeOpacity={0.7}>
              <View style={[styles.resultThumb, { backgroundColor: COLORS.artistColors[index % COLORS.artistColors.length][0] }]}>
                <Ionicons name="musical-note" size={16} color="rgba(255,255,255,0.8)" />
              </View>
              <View style={styles.resultInfo}>
                <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.resultMeta} numberOfLines={1}>{item.artist} • {formatDuration(item.duration)}</Text>
              </View>
              <Ionicons name="play-circle-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<Text style={styles.resultsCount}>{results.length} résultat{results.length > 1 ? 's' : ''} pour "{query}"</Text>}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>Aucun résultat</Text>
              <Text style={styles.emptyText}>Essaie un autre terme</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={GENRES}
          keyExtractor={item => item.name}
          numColumns={2}
          contentContainerStyle={styles.genreGrid}
          columnWrapperStyle={{ gap: SPACING.sm }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<Text style={styles.sectionTitle}>Parcourir par genre</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.genreCard, { backgroundColor: item.bg }]} activeOpacity={0.8}>
              <Text style={styles.genreEmoji}>{item.emoji}</Text>
              <Text style={styles.genreName}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { padding: SPACING.xl, paddingBottom: SPACING.sm },
  screenTitle: { color: COLORS.text, fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.black },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.glass, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, marginHorizontal: SPACING.xl, paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, marginBottom: SPACING.lg },
  searchInput: { flex: 1, color: COLORS.text, fontSize: FONTS.sizes.md },
  resultsCount: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, marginBottom: SPACING.md },
  resultsList: { paddingHorizontal: SPACING.xl, paddingBottom: 140 },
  resultRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, gap: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  resultThumb: { width: 46, height: 46, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  resultInfo: { flex: 1, minWidth: 0 },
  resultTitle: { color: COLORS.text, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.medium },
  resultMeta: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 2 },
  genreGrid: { paddingHorizontal: SPACING.xl, paddingBottom: 140, gap: SPACING.sm },
  sectionTitle: { color: COLORS.text, fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, marginBottom: SPACING.md },
  genreCard: { flex: 1, borderRadius: RADIUS.xl, padding: SPACING.lg, minHeight: 100, justifyContent: 'flex-end', position: 'relative' },
  genreEmoji: { fontSize: 28, position: 'absolute', top: SPACING.md, right: SPACING.md },
  genreName: { color: 'white', fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold },
  empty: { alignItems: 'center', paddingVertical: 60, gap: SPACING.sm },
  emptyTitle: { color: COLORS.text, fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold },
  emptyText: { color: COLORS.textMuted, fontSize: FONTS.sizes.md },
});
