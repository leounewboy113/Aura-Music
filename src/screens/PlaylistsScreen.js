import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { usePlayer } from '../context/PlayerContext';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/theme';

export default function PlaylistsScreen() {
  const navigation = useNavigation();
  const { playlists, createPlaylist, deletePlaylist, playTrack } = usePlayer();
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createPlaylist(newName.trim());
    setNewName(''); setShowModal(false);
  };

  const handleDelete = (playlist) => {
    Alert.alert('Supprimer', `Supprimer "${playlist.name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => deletePlaylist(playlist.id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Playlists</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Ionicons name="add" size={22} color="white" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={playlists}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <TouchableOpacity style={styles.plRow} onPress={() => navigation.navigate('PlaylistDetail', { playlist: item })} onLongPress={() => handleDelete(item)} activeOpacity={0.7}>
            <View style={[styles.plCover, { backgroundColor: COLORS.artistColors[index % COLORS.artistColors.length][0] }]}>
              <Ionicons name="musical-notes" size={22} color="rgba(255,255,255,0.8)" />
            </View>
            <View style={styles.plInfo}>
              <Text style={styles.plName}>{item.name}</Text>
              <Text style={styles.plMeta}>{item.tracks.length} morceau{item.tracks.length !== 1 ? 'x' : ''}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="musical-notes-outline" size={52} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>Aucune playlist</Text>
            <Text style={styles.emptyText}>Crée ta première playlist avec le bouton +</Text>
          </View>
        }
      />
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Nouvelle playlist</Text>
            <TextInput style={styles.modalInput} placeholder="Nom de la playlist..." placeholderTextColor={COLORS.textMuted} value={newName} onChangeText={setNewName} autoFocus />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowModal(false)}>
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleCreate}>
                <Text style={styles.modalConfirmText}>Créer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.xl, paddingBottom: SPACING.sm },
  screenTitle: { color: COLORS.text, fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.black },
  addBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: SPACING.xl, paddingBottom: 140 },
  plRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, gap: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  plCover: { width: 52, height: 52, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  plInfo: { flex: 1 },
  plName: { color: COLORS.text, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.medium },
  plMeta: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 2 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: SPACING.sm },
  emptyTitle: { color: COLORS.text, fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold },
  emptyText: { color: COLORS.textMuted, fontSize: FONTS.sizes.md, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#1a0a2e', borderTopLeftRadius: RADIUS.xxl, borderTopRightRadius: RADIUS.xxl, padding: SPACING.xxl, gap: SPACING.lg },
  modalTitle: { color: COLORS.text, fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold },
  modalInput: { backgroundColor: COLORS.glass, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, padding: SPACING.md, color: COLORS.text, fontSize: FONTS.sizes.md },
  modalBtns: { flexDirection: 'row', gap: SPACING.md },
  modalCancel: { flex: 1, padding: SPACING.md, borderRadius: RADIUS.lg, backgroundColor: COLORS.glass, alignItems: 'center' },
  modalCancelText: { color: COLORS.textMuted, fontSize: FONTS.sizes.md },
  modalConfirm: { flex: 1, padding: SPACING.md, borderRadius: RADIUS.lg, backgroundColor: COLORS.primary, alignItems: 'center' },
  modalConfirmText: { color: 'white', fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold },
});
