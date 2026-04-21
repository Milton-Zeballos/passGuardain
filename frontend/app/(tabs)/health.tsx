import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../context/SettingsContext';
import { passwordHealthService } from '../../services/passwordHealthService';

export default function HealthScreen() {
  const Colors = useAppTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => getStyles(Colors), [Colors]);
  const insets = useSafeAreaInsets();
  
  const [healthItems, setHealthItems] = useState([]);

  useEffect(() => {
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    try {
      const data = await passwordHealthService.list();
      setHealthItems(data);
    } catch (e) {
      console.warn("Error fetching health data:", e);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('health.title')}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {healthItems.length === 0 ? (
          <Text style={styles.emptyText}>{t('health.emptyText')}</Text>
        ) : (
          healthItems.map((item: any) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                 <Ionicons name={item.is_weak || item.breached ? "warning" : "checkmark-circle"} size={24} color={item.is_weak || item.breached ? Colors.error : Colors.success} />
                 <Text style={styles.cardTitle}>{t('health.score')}: {item.score}/100</Text>
              </View>
              <Text style={styles.detail}>{t('health.weak')}: {item.is_weak ? t('health.yes') : t('health.no')}</Text>
              <Text style={styles.detail}>{t('health.reused')}: {item.is_reused ? `${t('health.yes')} (${item.reused_count} ${t('health.times')})` : t('health.no')}</Text>
              <Text style={styles.detail}>{t('health.breached')}: {item.breached ? t('health.yes') : t('health.no')}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  headerTitle: { color: Colors.text, fontSize: 24, fontWeight: '700' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  emptyText: { color: Colors.textSecondary, textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: Colors.card, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: Colors.cardBorder },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  cardTitle: { color: Colors.text, fontSize: 16, fontWeight: '600' },
  detail: { color: Colors.textSecondary, fontSize: 14, marginTop: 4 },
});
