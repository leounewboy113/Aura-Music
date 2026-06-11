import * as MediaLibrary from 'expo-media-library';

// Extensions audio supportées
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.opus', '.m4a', '.alac', '.wma'];

// Vérifier si un fichier est audio
const isAudioFile = (filename) => {
  const lower = filename.toLowerCase();
  return AUDIO_EXTENSIONS.some(ext => lower.endsWith(ext));
};

// Détecter la qualité audio depuis l'extension
const getAudioQuality = (filename) => {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.flac') || lower.endsWith('.alac') || lower.endsWith('.wav')) return 'Lossless';
  if (lower.endsWith('.ogg') || lower.endsWith('.opus')) return 'OGG';
  if (lower.endsWith('.aac') || lower.endsWith('.m4a')) return 'AAC';
  return 'MP3';
};

// Parser le nom de fichier pour extraire titre/artiste
const parseFilename = (filename) => {
  let name = filename.replace(/\.[^/.]+$/, '');
  let artist = 'Artiste inconnu';
  let title = name;

  if (name.includes(' - ')) {
    const parts = name.split(' - ');
    artist = parts[0].trim();
    title = parts.slice(1).join(' - ').trim();
  } else if (/^\d+[\.\s]/.test(name)) {
    title = name.replace(/^\d+[\.\s]+/, '').trim();
  }
  return { artist, title };
};

// Scanner la bibliothèque musicale
export const scanMusicLibrary = async (onProgress) => {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission refusée — va dans Paramètres > AURA > Autorisations');
    }

    const tracks = [];
    let page = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.audio,
      first: 500,
      sortBy: MediaLibrary.SortBy.default,
    });

    let total = page.totalCount;
    let loaded = 0;

    const processAssets = (assets) => {
      assets.forEach((asset) => {
        if (!isAudioFile(asset.filename)) return;
        const parsed = parseFilename(asset.filename);
        tracks.push({
          id: asset.id,
          uri: asset.uri,
          filename: asset.filename,
          title: parsed.title,
          artist: parsed.artist,
          album: 'Album inconnu',
          duration: Math.floor((asset.duration || 0) * 1000),
          quality: getAudioQuality(asset.filename),
          artwork: null,
          creationTime: asset.creationTime,
          modificationTime: asset.modificationTime,
        });
        loaded++;
        if (onProgress) onProgress(loaded, total);
      });
    };

    processAssets(page.assets);

    while (page.hasNextPage) {
      page = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
        first: 500,
        after: page.endCursor,
        sortBy: MediaLibrary.SortBy.default,
      });
      processAssets(page.assets);
    }

    tracks.sort((a, b) => {
      if (a.artist !== b.artist) return a.artist.localeCompare(b.artist);
      return a.title.localeCompare(b.title);
    });

    return tracks;

  } catch (error) {
    console.error('Erreur scan:', error);
    throw error;
  }
};

// Formater durée en mm:ss
export const formatDuration = (millis) => {
  if (!millis || millis <= 0) return '0:00';
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Formater temps d'écoute
export const formatListeningTime = (seconds) => {
  if (!seconds || seconds < 60) return `${seconds || 0}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}min`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
};

// Grouper par artiste
export const groupByArtist = (tracks) => {
  const groups = {};
  tracks.forEach(track => {
    const artist = track.artist || 'Inconnu';
    if (!groups[artist]) groups[artist] = [];
    groups[artist].push(track);
  });
  return Object.entries(groups)
    .map(([name, tracks]) => ({ name, tracks, count: tracks.length }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

// Grouper par album
export const groupByAlbum = (tracks) => {
  const groups = {};
  tracks.forEach(track => {
    const album = track.album || 'Inconnu';
    if (!groups[album]) groups[album] = { name: album, artist: track.artist, tracks: [] };
    groups[album].tracks.push(track);
  });
  return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));
};

// Recherche
export const searchLibrary = (tracks, query) => {
  if (!query || query.trim() === '') return tracks;
  const q = query.toLowerCase().trim();
  return tracks.filter(t =>
    t.title?.toLowerCase().includes(q) ||
    t.artist?.toLowerCase().includes(q) ||
    t.album?.toLowerCase().includes(q) ||
    t.filename?.toLowerCase().includes(q)
  );
};
