import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppThemeColors } from '../../constants/Colors';
import { useAppTheme } from '../../context/SettingsContext';
import { useTranslation } from 'react-i18next';
import PasswordItem from '../../components/PasswordItem';
import { vaultEntryService } from '../../services/vaultEntryService';

interface PasswordEntry {
  id: string;
  domain: string;
  username: string;
  password: string;
  strength: string;
}

export default function PasswordsScreen() {
  const Colors = useAppTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => getStyles(Colors), [Colors]);
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [selectedPassword, setSelectedPassword] = useState<PasswordEntry | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // New states for creating/editing a password
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newDomain, setNewDomain] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handlePanResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (evt, gestureState) => {
        // If swiped down more than 30 pixels, close modals
        if (gestureState.dy > 30) {
          setSelectedPassword(null);
          setIsAddModalVisible(false);
        }
      },
    })
  ).current;

  useEffect(() => {
    fetchPasswords();
  }, []);

  const fetchPasswords = async () => {
    try {
      const data = await vaultEntryService.list();
      const formatted = data.map((item: any) => ({
        id: item.id.toString(),
        domain: item.website_url || item.title || 'Unknown',
        username: item.account_identifier,
        password: item.encrypted_secret,
        strength: 'strong' // We could map backend PasswordHealth here if we fetch it
      }));
      setPasswords(formatted);
    } catch (e) {
      console.warn("Error fetching passwords:", e);
    }
  };

  const handleCreatePassword = async () => {
    if (!newDomain.trim() || !newUsername.trim() || !newPassword.trim()) {
      Alert.alert("Validation Error", "All fields are required");
      return;
    }
    
    let websiteUrl = newDomain.trim();
    if (websiteUrl && !websiteUrl.includes('.')) {
      // If it doesn't have a dot, it's not a valid domain (e.g., just "github" instead of "github.com")
      // We keep newDomain as the title, but send an empty string for the strict website_url field
      websiteUrl = '';
    } else if (websiteUrl && !websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
      websiteUrl = `https://${websiteUrl}`;
    }

    setIsCreating(true);
    try {
      if (editingId) {
        await vaultEntryService.update(editingId, {
          title: newDomain,
          website_url: websiteUrl,
          account_identifier: newUsername,
          encrypted_secret: newPassword,
        });
      } else {
        await vaultEntryService.create({
          title: newDomain,
          website_url: websiteUrl,
          account_identifier: newUsername,
          encrypted_secret: newPassword,
          notes: "Created from mobile app"
        });
      }
      
      // Reset form and close modal
      setNewDomain('');
      setNewUsername('');
      setNewPassword('');
      setEditingId(null);
      setIsAddModalVisible(false);
      
      // Refresh list
      fetchPasswords();
    } catch (e: any) {
      console.warn("Error saving password:", e);
      Alert.alert("Error", `Could not save password entry. ${e?.message || ''}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePassword = (id: string) => {
    Alert.alert(
      t('passwords.deleteTitle'),
      t('passwords.deleteMessage'),
      [
        { text: t('common.cancel'), style: "cancel" },
        { 
          text: t('common.delete'), 
          style: "destructive",
          onPress: async () => {
            try {
              await vaultEntryService.remove(id);
              setSelectedPassword(null);
              fetchPasswords();
            } catch (e) {
              Alert.alert("Error", t('passwords.deleteError'));
            }
          }
        }
      ]
    );
  };

  const openEditModal = (password: PasswordEntry) => {
    setEditingId(password.id);
    setNewDomain(password.domain);
    setNewUsername(password.username);
    setNewPassword(password.password);
    setSelectedPassword(null);
    setIsAddModalVisible(true);
  };

  const openAddModal = () => {
    setEditingId(null);
    setNewDomain('');
    setNewUsername('');
    setNewPassword('');
    setIsAddModalVisible(true);
  };

  const filteredPasswords = passwords.filter(
    p => p.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
         p.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const strongCount = passwords.filter(p => p.strength === 'strong').length;
  const weakCount = passwords.filter(p => p.strength === 'weak').length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('passwords.title')}</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.badgeText}>{passwords.length}</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={Colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('passwords.search')}
          placeholderTextColor={Colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tags */}
      <View style={styles.filterRow}>
        <View style={[styles.filterTag, styles.filterTagAll]}>
          <Text style={styles.filterTagTextActive}>{t('passwords.all')} ({passwords.length})</Text>
        </View>
        <View style={styles.filterTag}>
          <View style={[styles.dot, { backgroundColor: Colors.success }]} />
          <Text style={styles.filterTagText}>{t('passwords.strong')} ({strongCount})</Text>
        </View>
        <View style={styles.filterTag}>
          <View style={[styles.dot, { backgroundColor: Colors.warning }]} />
          <Text style={styles.filterTagText}>{t('passwords.weak')} ({weakCount})</Text>
        </View>
      </View>

      {/* Password List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredPasswords.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>{t('passwords.noPasswordsTitle')}</Text>
            <Text style={styles.emptySubtitle}>{t('passwords.noPasswordsSubtitle')}</Text>
          </View>
        ) : (
          filteredPasswords.map((item) => (
            <PasswordItem
              key={item.id}
              domain={item.domain}
              username={item.username}
              onPress={() => { setSelectedPassword(item); setShowPassword(false); }}
            />
          ))
        )}
      </ScrollView>

      {/* Password Detail Modal */}
      <Modal
        visible={!!selectedPassword}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedPassword(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandleContainer} {...handlePanResponder.panHandlers}>
              <View style={styles.modalHandle} />
            </View>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{selectedPassword?.domain}</Text>
                <Text style={{color: Colors.textSecondary, fontSize: 13, marginTop: 4}}>Saved Password</Text>
              </View>
              <View style={{flexDirection: 'row', gap: 16, alignItems: 'center'}}>
                <TouchableOpacity onPress={() => openEditModal(selectedPassword!)}>
                  <Ionicons name="pencil" size={24} color={Colors.accent} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeletePassword(selectedPassword!.id)}>
                  <Ionicons name="trash" size={24} color={Colors.error} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Username / Email</Text>
              <View style={styles.modalValue}>
                <Text style={styles.modalValueText}>{selectedPassword?.username}</Text>
                <TouchableOpacity>
                  <Ionicons name="copy-outline" size={20} color={Colors.accent} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Password</Text>
              <View style={styles.modalValue}>
                <Text style={styles.modalValueText}>
                  {showPassword ? selectedPassword?.password : '••••••••••'}
                </Text>
                <View style={styles.modalActions}>
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.modalActionBtn}>
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.accent} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalActionBtn}>
                    <Ionicons name="copy-outline" size={20} color={Colors.accent} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Strength</Text>
              <View style={[styles.strengthBadge, {
                backgroundColor: selectedPassword?.strength === 'strong' ? Colors.successBg : Colors.warningBg
              }]}>
                <Text style={[styles.strengthBadgeText, {
                  color: selectedPassword?.strength === 'strong' ? Colors.success : Colors.warning
                }]}>
                  {selectedPassword?.strength === 'strong' ? '🛡 Strong' : '⚠️ Weak'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Password Modal */}
      <Modal
        visible={isAddModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHandleContainer} {...handlePanResponder.panHandlers}>
                <View style={styles.modalHandle} />
              </View>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editingId ? "Edit Password" : t('passwords.addModalTitle')}</Text>
              </View>

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>{t('passwords.websiteLabel')}</Text>
                <View style={styles.modalValue}>
                  <TextInput 
                    style={styles.modalValueText} 
                    placeholder={t('passwords.websitePlaceholder')} 
                    placeholderTextColor={Colors.textMuted}
                    value={newDomain}
                    onChangeText={setNewDomain}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>{t('passwords.usernameLabel')}</Text>
                <View style={styles.modalValue}>
                  <TextInput 
                    style={styles.modalValueText} 
                    placeholder={t('passwords.usernamePlaceholder')} 
                    placeholderTextColor={Colors.textMuted}
                    value={newUsername}
                    onChangeText={setNewUsername}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>{t('passwords.passwordLabel')}</Text>
                <View style={styles.modalValue}>
                  <TextInput 
                    style={styles.modalValueText} 
                    placeholder={t('passwords.passwordPlaceholder')} 
                    placeholderTextColor={Colors.textMuted}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                  />
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.modalBtn, {backgroundColor: Colors.accent, marginTop: 10}]} 
                onPress={handleCreatePassword}
                disabled={isCreating}
              >
                <Text style={{color: Colors.background, fontWeight: '700', textAlign: 'center', padding: 14, fontSize: 16}}>
                  {isCreating ? t('passwords.saving') : t('passwords.savePassword')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* FAB */}
      <TouchableOpacity 
        style={styles.fab} 
        activeOpacity={0.8}
        onPress={openAddModal}
      >
        <Ionicons name="add" size={28} color={Colors.background} />
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (Colors: AppThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  headerBadge: {
    backgroundColor: Colors.accentGlow,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginLeft: 10,
  },
  badgeText: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    height: 44,
    marginBottom: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 14,
    gap: 8,
  },
  filterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 5,
  },
  filterTagAll: {
    backgroundColor: Colors.accentGlow,
    borderColor: Colors.accent + '40',
  },
  filterTagText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  filterTagTextActive: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 10,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  modalHandleContainer: {
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.textMuted,
    borderRadius: 2,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  modalField: {
    marginBottom: 20,
  },
  modalLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalValue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    padding: 14,
  },
  modalValueText: {
    color: Colors.text,
    fontSize: 15,
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalActionBtn: {
    padding: 4,
  },
  modalBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  strengthBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  strengthBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
