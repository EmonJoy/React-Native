import { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  Alert,
  KeyboardAvoidingView,
  Animated,
  Dimensions,
  Modal,
  Pressable,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://127.0.0.1:8000/api/notes/';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

async function getToken() {
  if (Platform.OS === 'web') {
    return localStorage.getItem('authToken');
  }

  return SecureStore.getItemAsync('authToken');
}

async function removeToken() {
  if (Platform.OS === 'web') {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUsername');
  } else {
    await SecureStore.deleteItemAsync('authToken');
  }
}

/* ───────────────────────────────────────────────────────
   Animated Note Detail Modal
   ─────────────────────────────────────────────────────── */
function NoteDetailModal({
  visible,
  note,
  onClose,
  onEdit,
  onDelete,
  formatDate,
}) {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const animateIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 65,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateOut = (callback) => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.9,
        friction: 8,
        tension: 65,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback?.();
    });
  };

  if (!note) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onShow={animateIn}
      onRequestClose={() => animateOut(onClose)}
      statusBarTranslucent
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => animateOut(onClose)}
      >
        <Animated.View
          style={[
            styles.modalOverlayBg,
            { opacity: opacityAnim },
          ]}
        />

        <Animated.View
          style={[
            styles.modalContent,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalDateRow}>
                <View style={styles.modalDateDot} />
                <Text style={styles.modalDate}>
                  {formatDate(note.created_at)}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => animateOut(onClose)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.modalTitle}>{note.title}</Text>

              <View style={styles.modalDivider} />

              <Text style={styles.modalBodyText}>{note.content}</Text>
            </ScrollView>

            {/* Modal Footer Actions */}
            <View style={styles.modalFooter}>
              <View style={styles.modalTag}>
                <Text style={styles.modalTagText}>✳ JOURNAL ENTRY</Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalEditBtn}
                  onPress={() => {
                    animateOut(() => onEdit(note));
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalEditText}>✎ Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalDeleteBtn}
                  onPress={() => {
                    animateOut(() => onDelete(note.id));
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalDeleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

/* ───────────────────────────────────────────────────────
   Animated Note Card
   ─────────────────────────────────────────────────────── */
function NoteCard({ item, index, onPress, formatDate }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  // Stagger fade-in animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useState(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  });

  const truncatedContent =
    item.content.length > 120
      ? item.content.substring(0, 120) + '...'
      : item.content;

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          { translateY: slideAnim },
          { scale: scaleAnim },
        ],
      }}
    >
      <TouchableOpacity
        style={styles.noteCard}
        onPress={() => onPress(item)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Accent bar */}
        <View style={styles.cardAccentBar} />

        <View style={styles.cardInner}>
          <View style={styles.cardTop}>
            <View style={styles.cardDatePill}>
              <Text style={styles.cardDateText}>
                {formatDate(item.created_at)}
              </Text>
            </View>

            <Text style={styles.cardTapHint}>Tap to read →</Text>
          </View>

          <Text style={styles.noteTitle} numberOfLines={2}>
            {item.title}
          </Text>

          <Text style={styles.noteContent} numberOfLines={3}>
            {truncatedContent}
          </Text>

          <View style={styles.cardBottom}>
            <View style={styles.cardTagRow}>
              <View style={styles.cardTag}>
                <Text style={styles.cardTagText}>Personal</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

/* ───────────────────────────────────────────────────────
   Main Notes Screen
   ─────────────────────────────────────────────────────── */
export default function NotesScreen() {
  const router = useRouter();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');

  const [showComposer, setShowComposer] = useState(false);

  // Modal state
  const [selectedNote, setSelectedNote] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Composer animation
  const composerHeight = useRef(new Animated.Value(0)).current;
  const composerOpacity = useRef(new Animated.Value(0)).current;

  const loadNotes = async () => {
    setLoading(true);
    setError('');

    try {
      const token = await getToken();

      if (!token) {
        router.replace('/login');
        return;
      }

      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        await removeToken();
        router.replace('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();
      setNotes(data);
    } catch (err) {
      console.error('Load notes error:', err);
      setError('Could not load your journal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [])
  );

  const toggleComposer = (show) => {
    if (show) {
      setShowComposer(true);
      Animated.parallel([
        Animated.spring(composerHeight, {
          toValue: 1,
          friction: 8,
          tension: 50,
          useNativeDriver: false,
        }),
        Animated.timing(composerOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(composerHeight, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(composerOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start(() => {
        setShowComposer(false);
      });
    }
  };

  const resetComposer = () => {
    setTitle('');
    setContent('');
    setEditingId(null);
    setMessage('');
    toggleComposer(false);
  };

  const handleSaveNote = async () => {
    setMessage('');

    if (!title.trim() || !content.trim()) {
      setMessage('Please enter a title and your journal entry.');
      return;
    }

    setSaving(true);

    try {
      const token = await getToken();

      if (!token) {
        router.replace('/login');
        return;
      }

      const isEditing = editingId !== null;

      const url = isEditing ? `${API_URL}${editingId}/` : API_URL;

      const response = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
        }),
      });

      if (response.status === 401) {
        await removeToken();
        router.replace('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      resetComposer();
      setMessage(
        isEditing
          ? 'Journal entry updated successfully ✓'
          : 'Your new journal entry is saved ✓'
      );

      await loadNotes();
    } catch (err) {
      console.error('Save note error:', err);
      setMessage('Could not save your entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (note) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setMessage('');
    setModalVisible(false);
    setSelectedNote(null);

    // Open composer with animation
    setTimeout(() => {
      setShowComposer(true);
      Animated.parallel([
        Animated.spring(composerHeight, {
          toValue: 1,
          friction: 8,
          tension: 50,
          useNativeDriver: false,
        }),
        Animated.timing(composerOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }, 300);
  };

  const performDelete = async (noteId) => {
    try {
      const token = await getToken();

      if (!token) {
        router.replace('/login');
        return;
      }

      const response = await fetch(`${API_URL}${noteId}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (response.status === 401) {
        await removeToken();
        router.replace('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status}`);
      }

      setNotes((currentNotes) =>
        currentNotes.filter((note) => note.id !== noteId)
      );

      if (editingId === noteId) {
        resetComposer();
      }

      setMessage('Journal entry deleted.');
    } catch (err) {
      console.error('Delete note error:', err);
      setMessage('Could not delete this entry. Please try again.');
    }
  };

  const handleDeleteNote = (noteId) => {
    setModalVisible(false);
    setSelectedNote(null);

    setTimeout(() => {
      if (Platform.OS === 'web') {
        const confirmed = window.confirm(
          'Are you sure you want to delete this journal entry?'
        );

        if (confirmed) {
          performDelete(noteId);
        }

        return;
      }

      Alert.alert(
        'Delete journal entry?',
        'This entry will be permanently deleted.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => performDelete(noteId),
          },
        ]
      );
    }, 300);
  };

  const handleLogout = async () => {
    try {
      await removeToken();
      router.replace('/login');
    } catch (err) {
      setMessage('Could not log out. Please try again.');
    }
  };

  const openNoteDetail = (note) => {
    setSelectedNote(note);
    setModalVisible(true);
  };

  const filteredNotes = notes.filter((note) => {
    const query = search.trim().toLowerCase();

    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateValue) => {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return 'Date unavailable';
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.screen}
          contentContainerStyle={styles.page}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ─── Header ─── */}
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <View style={styles.brandIcon}>
                <Text style={styles.brandIconText}>J</Text>
              </View>

              <View>
                <Text style={styles.brandName}>JOURNAL</Text>
                <Text style={styles.brandSub}>Personal diary</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Text style={styles.logoutText}>Log out</Text>
              <Text style={styles.logoutArrow}>→</Text>
            </TouchableOpacity>
          </View>

          {/* ─── Hero ─── */}
          <View style={styles.hero}>
            <View style={styles.heroAccentLine} />

            <Text style={styles.eyebrow}>YOUR PERSONAL SPACE</Text>

            <Text style={styles.heroTitle}>
              Life, one{'\n'}
              <Text style={styles.heroItalic}>moment at a time.</Text>
            </Text>

            <Text style={styles.heroDescription}>
              A quiet place for your thoughts, memories, and everyday stories.
            </Text>
          </View>

          {/* ─── New Entry Button ─── */}
          <TouchableOpacity
            style={styles.newEntryButton}
            activeOpacity={0.85}
            onPress={() => {
              if (showComposer) {
                resetComposer();
              } else {
                setEditingId(null);
                setTitle('');
                setContent('');
                setMessage('');
                toggleComposer(true);
              }
            }}
          >
            <View style={styles.newEntryIconWrap}>
              <Text style={styles.newEntryPlus}>
                {showComposer ? '−' : '+'}
              </Text>
            </View>

            <Text style={styles.newEntryText}>
              {showComposer ? 'Close editor' : 'Write a new entry'}
            </Text>

            <View style={styles.newEntryArrowWrap}>
              <Text style={styles.newEntryArrow}>↗</Text>
            </View>
          </TouchableOpacity>

          {/* ─── Composer (Animated) ─── */}
          {showComposer && (
            <Animated.View
              style={[
                styles.composer,
                {
                  opacity: composerOpacity,
                  transform: [
                    {
                      scaleY: composerHeight.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.95, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.composerAccent} />

              <Text style={styles.composerEyebrow}>
                {editingId !== null ? '✎ EDITING ENTRY' : '✦ NEW MEMORY'}
              </Text>

              <Text style={styles.composerTitle}>
                {editingId !== null
                  ? 'Update your story'
                  : 'What\'s on your mind?'}
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>TITLE</Text>
                <TextInput
                  style={styles.titleInput}
                  placeholder="Give your entry a title..."
                  placeholderTextColor="#B0B3A8"
                  value={title}
                  onChangeText={setTitle}
                  editable={!saving}
                  maxLength={200}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>YOUR STORY</Text>
                <TextInput
                  style={styles.contentInput}
                  placeholder="Start writing your thoughts here..."
                  placeholderTextColor="#B0B3A8"
                  value={content}
                  onChangeText={setContent}
                  multiline
                  textAlignVertical="top"
                  editable={!saving}
                />
              </View>

              {message ? (
                <View style={styles.messageBanner}>
                  <Text style={styles.messageText}>{message}</Text>
                </View>
              ) : null}

              <View style={styles.composerActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={resetComposer}
                  disabled={saving}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    saving && styles.disabledButton,
                  ]}
                  onPress={handleSaveNote}
                  disabled={saving}
                  activeOpacity={0.85}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>
                      {editingId !== null ? 'Update entry' : 'Save entry'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {/* ─── Section Header ─── */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>YOUR COLLECTION</Text>
              <Text style={styles.sectionTitle}>Journal entries</Text>
            </View>

            <View style={styles.countBadge}>
              <Text style={styles.countText}>{notes.length}</Text>
            </View>
          </View>

          {/* ─── Search ─── */}
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>⌕</Text>

            <TextInput
              style={styles.searchInput}
              placeholder="Search your memories..."
              placeholderTextColor="#96978C"
              value={search}
              onChangeText={setSearch}
            />

            {search.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearch('')}
                activeOpacity={0.7}
                style={styles.clearSearchBtn}
              >
                <Text style={styles.clearSearch}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ─── Status messages (outside composer) ─── */}
          {message && !showComposer ? (
            <View style={styles.messageBanner}>
              <Text style={styles.messageText}>{message}</Text>
            </View>
          ) : null}

          {/* ─── Notes Grid / States ─── */}
          {loading ? (
            <View style={styles.statusCard}>
              <View style={styles.loaderWrap}>
                <ActivityIndicator size="large" color="#49664F" />
              </View>
              <Text style={styles.statusText}>
                Gathering your memories...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.statusCard}>
              <Text style={styles.errorIcon}>⚠</Text>
              <Text style={styles.errorText}>{error}</Text>

              <TouchableOpacity
                style={styles.retryButton}
                onPress={loadNotes}
                activeOpacity={0.85}
              >
                <Text style={styles.retryText}>Try again</Text>
              </TouchableOpacity>
            </View>
          ) : filteredNotes.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconWrap}>
                <Text style={styles.emptyIcon}>✳</Text>
              </View>

              <Text style={styles.emptyTitle}>
                {search
                  ? 'No matching memories'
                  : 'Your story starts here'}
              </Text>

              <Text style={styles.emptyDescription}>
                {search
                  ? 'Try another search term.'
                  : 'Capture a little moment from today.\nIt may mean a lot tomorrow.'}
              </Text>

              {!search && (
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => {
                    setEditingId(null);
                    setTitle('');
                    setContent('');
                    setMessage('');
                    toggleComposer(true);
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.emptyButtonText}>
                    Write your first entry
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.notesGrid}>
              {filteredNotes.map((item, index) => (
                <NoteCard
                  key={item.id}
                  item={item}
                  index={index}
                  onPress={openNoteDetail}
                  formatDate={formatDate}
                />
              ))}
            </View>
          )}

          {/* ─── Footer ─── */}
          <View style={styles.footer}>
            <View style={styles.footerLineRow}>
              <View style={styles.footerLine} />
              <Text style={styles.footerSymbol}>✳</Text>
              <View style={styles.footerLine} />
            </View>

            <Text style={styles.footerText}>MADE FOR YOUR MOMENTS</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ─── Note Detail Modal ─── */}
      <NoteDetailModal
        visible={modalVisible}
        note={selectedNote}
        onClose={() => {
          setModalVisible(false);
          setSelectedNote(null);
        }}
        onEdit={startEditing}
        onDelete={handleDeleteNote}
        formatDate={formatDate}
      />
    </SafeAreaView>
  );
}

/* ───────────────────────────────────────────────────────
   STYLES
   ─────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F3EC',
  },
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  page: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 60,
  },

  /* ── Header ── */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E7DD',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#2D4A35',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandIconText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    fontStyle: 'italic',
  },
  brandName: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2.5,
    color: '#2D4A35',
  },
  brandSub: {
    fontSize: 11,
    color: '#8A8D7F',
    marginTop: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#EFEEE6',
    borderRadius: 24,
  },
  logoutText: {
    color: '#596456',
    fontSize: 12,
    fontWeight: '600',
  },
  logoutArrow: {
    color: '#596456',
    fontSize: 14,
  },

  /* ── Hero ── */
  hero: {
    paddingTop: 36,
    paddingBottom: 28,
  },
  heroAccentLine: {
    width: 32,
    height: 3,
    backgroundColor: '#49664F',
    borderRadius: 2,
    marginBottom: 18,
  },
  eyebrow: {
    color: '#71816B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 14,
  },
  heroTitle: {
    color: '#1E3227',
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '800',
    letterSpacing: -1.2,
  },
  heroItalic: {
    color: '#5E7E5C',
    fontStyle: 'italic',
    fontWeight: '400',
  },
  heroDescription: {
    color: '#77796F',
    fontSize: 14,
    lineHeight: 23,
    marginTop: 14,
    maxWidth: 420,
  },

  /* ── New Entry Button ── */
  newEntryButton: {
    backgroundColor: '#2D4A35',
    borderRadius: 16,
    minHeight: 60,
    paddingHorizontal: 6,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: '#1E3227',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  newEntryIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newEntryPlus: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '300',
  },
  newEntryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginLeft: 14,
  },
  newEntryArrowWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  newEntryArrow: {
    color: '#C8DDBC',
    fontSize: 16,
  },

  /* ── Composer ── */
  composer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5D9',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    overflow: 'hidden',
    shadowColor: '#1E3227',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  composerAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#49664F',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  composerEyebrow: {
    color: '#74816C',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 4,
  },
  composerTitle: {
    color: '#1E3227',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#8A8D7F',
    marginBottom: 8,
  },
  titleInput: {
    backgroundColor: '#F7F7F2',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3227',
    borderWidth: 1,
    borderColor: '#EEEDE5',
  },
  contentInput: {
    backgroundColor: '#F7F7F2',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    minHeight: 160,
    fontSize: 14,
    lineHeight: 24,
    color: '#41483F',
    borderWidth: 1,
    borderColor: '#EEEDE5',
  },
  composerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  cancelButtonText: {
    color: '#72766B',
    fontSize: 13,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#2D4A35',
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E3227',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.6,
  },
  messageBanner: {
    backgroundColor: '#EDF5EE',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 10,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#49664F',
  },
  messageText: {
    color: '#3A5B3F',
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },

  /* ── Section ── */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionEyebrow: {
    color: '#7B806F',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2.5,
    marginBottom: 6,
  },
  sectionTitle: {
    color: '#1E3227',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  countBadge: {
    marginLeft: 12,
    minWidth: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#2D4A35',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  /* ── Search ── */
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    minHeight: 50,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E8E7DD',
    shadowColor: '#1E3227',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  searchIcon: {
    color: '#8A9182',
    fontSize: 22,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#334337',
    paddingVertical: 12,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },
  clearSearchBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFEEE6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearSearch: {
    color: '#536651',
    fontSize: 13,
    fontWeight: '600',
  },

  /* ── Notes Grid (replaces timeline) ── */
  notesGrid: {
    gap: 16,
  },
  noteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EBEAE2',
    shadowColor: '#1E3227',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.045,
    shadowRadius: 12,
    elevation: 2,
  },
  cardAccentBar: {
    height: 3,
    backgroundColor: '#C9D7BD',
  },
  cardInner: {
    padding: 20,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardDatePill: {
    backgroundColor: '#EDF0E7',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  cardDateText: {
    color: '#5A7356',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  cardTapHint: {
    color: '#B0B5A8',
    fontSize: 11,
    fontWeight: '500',
  },
  noteTitle: {
    color: '#1E3227',
    fontSize: 19,
    lineHeight: 26,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  noteContent: {
    color: '#6B6F64',
    fontSize: 14,
    lineHeight: 23,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  cardTagRow: {
    flexDirection: 'row',
    gap: 6,
  },
  cardTag: {
    backgroundColor: '#F4F5F0',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  cardTagText: {
    color: '#7F8577',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  /* ── Empty / Loading / Error States ── */
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 36,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9E8DF',
  },
  loaderWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EDF5EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statusText: {
    color: '#77796F',
    fontSize: 13,
    marginTop: 14,
    fontWeight: '500',
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  errorText: {
    color: '#A44F43',
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 14,
  },
  retryButton: {
    marginTop: 18,
    backgroundColor: '#2D4A35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#1E3227',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 36,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EBEAE2',
  },
  emptyIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EDF5EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyIcon: {
    color: '#5A7356',
    fontSize: 28,
  },
  emptyTitle: {
    color: '#1E3227',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptyDescription: {
    color: '#76796E',
    fontSize: 13,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 10,
    maxWidth: 300,
  },
  emptyButton: {
    marginTop: 22,
    backgroundColor: '#2D4A35',
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 12,
    shadowColor: '#1E3227',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  /* ── Footer ── */
  footer: {
    alignItems: 'center',
    paddingTop: 40,
    marginTop: 20,
  },
  footerLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  footerLine: {
    width: 32,
    height: 1,
    backgroundColor: '#D7DACC',
  },
  footerSymbol: {
    color: '#9AA08E',
    fontSize: 14,
  },
  footerText: {
    color: '#96998A',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2.5,
  },

  /* ── Modal ── */
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalOverlayBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 35, 25, 0.55)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 560,
    maxHeight: '85%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
  },
  modalDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalDateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#5A7356',
  },
  modalDate: {
    color: '#5A7356',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F4F3EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    color: '#6B6F64',
    fontSize: 15,
    fontWeight: '600',
  },
  modalScroll: {
    paddingHorizontal: 24,
    maxHeight: 400,
  },
  modalTitle: {
    color: '#1E3227',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 33,
    marginTop: 12,
    marginBottom: 16,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#EEEEE7',
    marginBottom: 18,
  },
  modalBodyText: {
    color: '#4A4F45',
    fontSize: 15,
    lineHeight: 26,
    paddingBottom: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: '#EEEEE7',
    backgroundColor: '#FAFAF6',
    flexWrap: 'wrap',
    gap: 10,
  },
  modalTag: {
    backgroundColor: '#EDF0E7',
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  modalTagText: {
    color: '#5A7356',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  modalEditBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#2D4A35',
  },
  modalEditText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  modalDeleteBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#FBF0ED',
  },
  modalDeleteText: {
    color: '#B54F43',
    fontSize: 12,
    fontWeight: '700',
  },
});
