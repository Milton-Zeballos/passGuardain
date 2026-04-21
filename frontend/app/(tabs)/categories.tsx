import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../context/SettingsContext';
import { categoryService } from '../../services/categoryService';

export default function CategoriesScreen() {
  const Colors = useAppTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => getStyles(Colors), [Colors]);
  const insets = useSafeAreaInsets();
  
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.list();
      setCategories(data);
    } catch (e) {
      console.warn("Error fetching categories:", e);
    }
  };

  const handleCreate = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await categoryService.create({ name: newCategoryName, description: newCategoryDesc });
      setNewCategoryName('');
      setNewCategoryDesc('');
      fetchCategories();
    } catch (e) {
      Alert.alert("Error", "Could not create category");
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('categories.title')}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.createCard}>
          <Text style={styles.cardTitle}>{t('categories.newCategory')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('categories.name')}
            placeholderTextColor={Colors.textMuted}
            value={newCategoryName}
            onChangeText={setNewCategoryName}
          />
          <TextInput
            style={styles.input}
            placeholder={t('categories.description')}
            placeholderTextColor={Colors.textMuted}
            value={newCategoryDesc}
            onChangeText={setNewCategoryDesc}
          />
          <TouchableOpacity style={styles.btn} onPress={handleCreate}>
            <Text style={styles.btnText}>{t('categories.create')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>{t('categories.yourCategories')}</Text>
        {categories.map((cat: any) => (
          <View key={cat.id} style={styles.categoryItem}>
            <Ionicons name="folder" size={24} color={Colors.accent} />
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>{cat.name}</Text>
              <Text style={styles.categoryDesc}>{cat.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  headerTitle: { color: Colors.text, fontSize: 24, fontWeight: '700' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  createCard: { backgroundColor: Colors.card, padding: 20, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: Colors.cardBorder },
  cardTitle: { color: Colors.text, fontSize: 18, fontWeight: '600', marginBottom: 12 },
  input: { backgroundColor: Colors.inputBg, color: Colors.text, borderRadius: 8, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: Colors.inputBorder },
  btn: { backgroundColor: Colors.accent, padding: 14, borderRadius: 8, alignItems: 'center' },
  btnText: { color: Colors.background, fontWeight: '700' },
  sectionTitle: { color: Colors.text, fontSize: 18, fontWeight: '700', marginBottom: 14 },
  categoryItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, padding: 16, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: Colors.cardBorder },
  categoryInfo: { marginLeft: 12 },
  categoryName: { color: Colors.text, fontSize: 16, fontWeight: '600' },
  categoryDesc: { color: Colors.textSecondary, fontSize: 13, marginTop: 4 },
});
