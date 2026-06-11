import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePlayer } from '../context/PlayerContext';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/theme';
import { formatListeningTime } from '../utils/mediaLibrary';

const BAR_MAX_H = 80;

const PeriodTab = ({ label, active, onPress }) => (
  <TouchableOpacity style={[styles.periodTab, active && styles.periodTabActive]} onPress={onPress} activeOpacity={0.8}>
    <Text style={[styles.periodLabel, active && styles.periodLabelActive]}>{label}</Text>
  </TouchableOpacity>
);

const MiniStat = ({ icon, value, label }) => (
  <View style={styles.miniCard}>
    <Text style={styles.miniIcon}>{icon}</Text>
    <Text style={styles.miniValue}>{value}</Text>
    <Text style={styles.miniLabel}>{label}</Text>
  </View>
);

const RankRow = ({ rank, name, sub, plays, maxPlays }) => {
  const pct = maxPlays > 0 ? (plays / maxPlays) : 0;
  const rankColor = rank === 1 ? COLORS.gold : rank === 2 ? COLORS.silver : rank === 3 ? COLORS.bronze : COLORS.textMuted;
  const bg = COLORS.artistColors[rank % COLORS.artistColors.length][0];
  return (
    <View style={styles.rankRow}>
      <Text style={[styles.rankNum, { color: rankColor }]}>{rank}</Text>
      <View style={[styles.rankAvatar, { backgroundColor: bg }]}>
        <Ionicons name="musical-note" size={16} color="rgba(255,255,255,0.8)" />
      </View>
      <View style={styles.rankInfo}>
        <Text style={styles.rankName} numberOfLines={1}>{name}</Text>
        {sub && <Text style={styles.rankSub} numberOfLines={1}>{sub}</Text>}
        <View style={styles.rankBarBg}>
          <View style={[styles.rankBarFill, { width: `${pct * 100}%` }]} />
        </View>
      </View>
      <Text style={styles.rankPlays}>{plays}</Text>
    </View>
  );
};

const BarChart = ({ data, labels }) => {
  const max = Math.max(...data, 1);
  return (
    <View style={styles.chartWrap}>
      <View style={styles.chart}>
        {data.map((val, i) => {
          const h = Math.max(4, (val / max) * BAR_MAX_H);
          const isMax = val === max;
          return (
            <View key={i} style={styles.barCol}>
              <View style={[styles.bar, { height: h, backgroundColor: isMax ? COLORS.secondary : COLORS.primary }]} />
              <Text style={styles.barLabel}>{labels[i] || ''}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const RecordCard = ({ icon, title, value }) => (
  <View style={styles.recordCard}>
    <View style={[styles.recordIcon, { backgroundColor: COLORS.glass }]}>
      <Text style={{ fontSize: 20 }}>{icon}</Text>
    </View>
    <View style={styles.recordInfo}>
      <Text style={styles.recordTitle}>{title}</Text>
      <Text style={styles.recordValue}>{value}</Text>
    </View>
  </View>
);

const PERIOD_DATA = {
  semaine: { bars: [35,52,28,68,80,95,72], labels: ['L','M','M','J','V','S','D'] },
  mois: { bars: [60,75,50,80,70,90,65,55,85,72,68,78,92,88], labels: ['1','3','5','7','9','11','13','15','17','19','21','23','25','27'] },
  annee: { bars: [45,60,72,65,80,90,85,75,88,92,78,95], labels: ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'] },
  tout: { bars: [30,45,60,80,95], labels: ['2021','2022','2023','2024','2025'] },
};

export default function StatsScreen() {
  const { stats, library } = usePlayer();
  const [period, setPeriod] = useState('semaine');

  const topTracks = useMemo(() => {
    const trackStats = stats.trackStats || {};
    return library.map(t => ({ ...t, plays: trackStats[t.id]?.plays || 0 })).filter(t => t.plays > 0).sort((a, b) => b.plays - a.plays).slice(0, 5);
  }, [library, stats]);

  const topArtists = useMemo(() => {
    const artistStats = stats.artistStats || {};
    return Object.entries(artistStats).map(([name, data]) => ({ name, plays: data.plays })).sort((a, b) => b.plays - a.plays).slice(0, 5);
  }, [stats]);

  const maxTrackPlays = topTracks[0]?.plays || 1;
  const maxArtistPlays = topArtists[0]?.plays || 1;
  const totalHours = Math.floor((stats.totalListeningTime || 0) / 3600);
  const streak = stats.streak || 0;
  const topArtist = topArtists[0]?.name || '—';
  const topTrack = topTracks[0]?.title || '—';
  const chartData = PERIOD_DATA[period];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <View style={styles.header}>
          <Text style={styles.screenTitle}>Mes Stats</Text>
          <View style={styles.iconBtn}><Ionicons name="trophy" size={18} color={COLORS.secondary} /></View>
        </View>

        <View style={styles.periodRow}>
          {['semaine','mois','annee','tout'].map(p => (
            <PeriodTab key={p} label={p === 'annee' ? 'Année' : p.charAt(0).toUpperCase() + p.slice(1)} active={period === p} onPress={() => setPeriod(p)} />
          ))}
        </View>

        {/* STREAK */}
        <View style={styles.streakCard}>
          <Text style={styles.streakFire}>🔥</Text>
          <View>
            <Text style={styles.streakVal}>{streak} jour{streak > 1 ? 's' : ''}</Text>
            <Text style={styles.streakLabel}>{streak > 0 ? 'Série d\'écoute consécutive' : 'Lance ta première écoute !'}</Text>
          </View>
        </View>

        {/* GRANDES STATS */}
        <View style={styles.bigRow}>
          <View style={styles.bigCard}>
            <Text style={styles.bigCardIcon}>⏱️</Text>
            <Text style={styles.bigCardLabel}>Temps total</Text>
            <Text style={styles.bigCardValue}>{totalHours}h</Text>
          </View>
          <View style={styles.bigCard}>
            <Text style={styles.bigCardIcon}>🎵</Text>
            <Text style={styles.bigCardLabel}>Sons joués</Text>
            <Text style={styles.bigCardValue}>{stats.totalPlays || 0}</Text>
          </View>
        </View>

        <View style={styles.miniRow}>
          <MiniStat icon="🎤" value={topArtists.length} label="Artistes" />
          <MiniStat icon="💿" value={library.length} label="Sons" />
          <MiniStat icon="📅" value={Object.keys(stats.dailyStats || {}).length} label="Jours actifs" />
        </View>

        {/* GRAPHIQUE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Écoutes par période</Text>
          <BarChart data={chartData.bars} labels={chartData.labels} />
        </View>

        {/* TOP ARTISTES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Top Artistes</Text>
          {topArtists.length > 0
            ? topArtists.map((a, i) => <RankRow key={a.name} rank={i+1} name={a.name} plays={a.plays} maxPlays={maxArtistPlays} />)
            : <Text style={styles.emptyText}>Écoute de la musique pour voir tes artistes ici !</Text>
          }
        </View>

        {/* TOP SONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎵 Top Sons</Text>
          {topTracks.length > 0
            ? topTracks.map((t, i) => <RankRow key={t.id} rank={i+1} name={t.title} sub={t.artist} plays={t.plays} maxPlays={maxTrackPlays} />)
            : <Text style={styles.emptyText}>Tes sons les plus joués apparaîtront ici.</Text>
          }
        </View>

        {/* RECORDS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏅 Records</Text>
          <RecordCard icon="⏱️" title="Temps d'écoute total" value={formatListeningTime(stats.totalListeningTime || 0)} />
          <RecordCard icon="🎤" title="Artiste dominant" value={topArtist} />
          <RecordCard icon="🔁" title="Son le plus joué" value={topTrack} />
          <RecordCard icon="📅" title="Jours actifs" value={`${Object.keys(stats.dailyStats || {}).length} jours`} />
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  screenTitle: { color: COLORS.text, fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.black },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.glass, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  periodRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  periodTab: { flex: 1, paddingVertical: SPACING.sm, borderRadius: RADIUS.lg, backgroundColor: COLORS.glass, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  periodTabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  periodLabel: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.medium },
  periodLabelActive: { color: 'white' },
  streakCard: { flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.xl, padding: SPACING.lg, gap: SPACING.lg, marginBottom: SPACING.md, borderWidth: 1, borderColor: 'rgba(108,63,245,0.3)', backgroundColor: 'rgba(108,63,245,0.1)' },
  streakFire: { fontSize: 40 },
  streakVal: { color: COLORS.secondary, fontSize: 28, fontWeight: FONTS.weights.black },
  streakLabel: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, marginTop: 2 },
  bigRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  bigCard: { flex: 1, borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, backgroundColor: 'rgba(232,70,10,0.1)' },
  bigCardIcon: { fontSize: 24, marginBottom: SPACING.xs },
  bigCardLabel: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, textTransform: 'uppercase', letterSpacing: 1 },
  bigCardValue: { color: COLORS.text, fontSize: 32, fontWeight: FONTS.weights.black, marginTop: 4 },
  miniRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  miniCard: { flex: 1, backgroundColor: COLORS.glass, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  miniIcon: { fontSize: 20, marginBottom: SPACING.xs },
  miniValue: { color: COLORS.primary, fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.black },
  miniLabel: { color: COLORS.textMuted, fontSize: 10, marginTop: 2, textAlign: 'center' },
  section: { marginBottom: SPACING.xl },
  sectionTitle: { color: COLORS.text, fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, marginBottom: SPACING.md },
  chartWrap: { backgroundColor: COLORS.glass, borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: BAR_MAX_H + 24, gap: 4 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 6 },
  bar: { width: '100%', borderRadius: 4, minHeight: 4 },
  barLabel: { color: COLORS.textMuted, fontSize: 9 },
  rankRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, gap: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rankNum: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.black, width: 22, textAlign: 'center' },
  rankAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rankInfo: { flex: 1, minWidth: 0 },
  rankName: { color: COLORS.text, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.medium },
  rankSub: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 1 },
  rankBarBg: { height: 3, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 2, marginTop: 6, overflow: 'hidden' },
  rankBarFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 2 },
  rankPlays: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, width: 40, textAlign: 'right' },
  recordCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.glass, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md, gap: SPACING.md, marginBottom: SPACING.sm },
  recordIcon: { width: 48, height: 48, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  recordInfo: { flex: 1 },
  recordTitle: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginBottom: 4 },
  recordValue: { color: COLORS.text, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold },
  emptyText: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, fontStyle: 'italic' },
});
