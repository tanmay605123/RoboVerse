import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { mobileApiRequest } from '../api/client';
import {
  Trophy,
  MapPin,
  Navigation,
  Phone,
  Clock,
  Star,
  Users,
  ExternalLink,
  ShieldCheck,
  Radio,
} from 'lucide-react-native';

export function ExploreScreen() {
  const [activeTab, setActiveTab] = useState<'hackathons' | 'shops'>('hackathons');

  const [hackathons, setHackathons] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      if (activeTab === 'hackathons') {
        const res = await mobileApiRequest('/hackathons');
        if (res.success && res.data) {
          setHackathons(res.data.hackathons || []);
        }
      } else {
        const res = await mobileApiRequest('/shops/nearby?lat=28.6315&lng=77.2167&radiusKm=30');
        if (res.success && res.data) {
          setShops(res.data.shops || []);
        }
      }
      setLoading(false);
    }

    loadData();
  }, [activeTab]);

  const openMapsDirections = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  const dialShopPhone = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {});
  };

  return (
    <View style={styles.screen}>
      {/* Top Segmented Control */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'hackathons' && styles.tabButtonActive]}
          onPress={() => setActiveTab('hackathons')}
        >
          <Trophy size={15} color={activeTab === 'hackathons' ? '#FFFFFF' : COLORS.textMuted} />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'hackathons' && styles.tabButtonTextActive,
            ]}
          >
            Robotics Hackathons
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'shops' && styles.tabButtonActive]}
          onPress={() => setActiveTab('shops')}
        >
          <Radio size={15} color={activeTab === 'shops' ? '#FFFFFF' : COLORS.textMuted} />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'shops' && styles.tabButtonTextActive,
            ]}
          >
            Nearby Component Shops
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Stream */}
      {loading ? (
        <View style={styles.loaderCenter}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loaderText}>Scanning Robotics Grid...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollList}>
          {activeTab === 'hackathons' ? (
            hackathons.map((h) => (
              <View key={h.id} style={styles.hackathonCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cityBadge}>
                    <MapPin size={11} color={COLORS.blue} />
                    <Text style={styles.cityText}>{h.city}</Text>
                  </View>
                  <Text style={styles.modeText}>{h.mode}</Text>
                </View>

                <Text style={styles.hackathonTitle}>{h.title}</Text>
                <Text style={styles.organizerText}>Host: {h.organizer}</Text>
                <Text style={styles.hackathonDesc} numberOfLines={2}>
                  {h.description}
                </Text>

                <View style={styles.statsRow}>
                  <View>
                    <Text style={styles.prizeLabel}>CASH PRIZE POOL</Text>
                    <Text style={styles.prizeValue}>₹{h.prizePoolInr.toLocaleString('en-IN')}</Text>
                  </View>

                  <View style={styles.squadBadge}>
                    <Users size={13} color={COLORS.textSecondary} />
                    <Text style={styles.squadText}>Squad of {h.teamSizeMax}</Text>
                  </View>
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.joinSquadBtn}
                    onPress={() => Linking.openURL(h.url)}
                  >
                    <Users size={13} color={COLORS.blue} />
                    <Text style={styles.joinSquadText}>Find Teammates</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.portalBtn}
                    onPress={() => Linking.openURL(h.url)}
                  >
                    <Text style={styles.portalText}>Official Rules</Text>
                    <ExternalLink size={13} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            shops.map((s) => (
              <View key={s.id} style={styles.shopCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.shopName}>{s.name}</Text>
                  <View style={styles.distanceBadge}>
                    <Navigation size={10} color={COLORS.primary} />
                    <Text style={styles.distanceText}>{s.distanceKm} km</Text>
                  </View>
                </View>

                <Text style={styles.addressText} numberOfLines={2}>
                  {s.address}, {s.city}
                </Text>

                <View style={styles.shopMetaRow}>
                  <View style={styles.ratingBadge}>
                    <Star size={12} color="#FF9A1F" fill="#FF9A1F" />
                    <Text style={styles.ratingText}>{s.rating}</Text>
                  </View>

                  <View style={styles.hoursRow}>
                    <Clock size={12} color={COLORS.textMuted} />
                    <Text style={styles.hoursText}>{s.openingHours}</Text>
                  </View>

                  {s.isVerified && (
                    <View style={styles.verifiedRow}>
                      <ShieldCheck size={12} color={COLORS.green} />
                      <Text style={styles.verifiedText}>Verified Shop</Text>
                    </View>
                  )}
                </View>

                {/* Stocked components tags */}
                <View style={styles.stockedChips}>
                  {s.stockedComponents?.slice(0, 4).map((c: string) => (
                    <View key={c} style={styles.componentChip}>
                      <Text style={styles.componentChipText}>{c}</Text>
                    </View>
                  ))}
                </View>

                {/* Actions */}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.callStoreBtn}
                    onPress={() => dialShopPhone(s.phone)}
                  >
                    <Phone size={13} color={COLORS.navy} />
                    <Text style={styles.callStoreText}>Call Shop</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.directionsBtn}
                    onPress={() => openMapsDirections(s.directionsUrl)}
                  >
                    <Navigation size={13} color="#FFFFFF" />
                    <Text style={styles.directionsText}>Google Maps</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bgBase,
  },
  tabBar: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
    gap: 10,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#F9FAFC',
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  tabButtonText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  scrollList: {
    padding: 16,
    gap: 14,
  },
  loaderCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 8,
  },
  hackathonCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    padding: 16,
    shadowColor: 'rgba(20, 30, 60, 0.05)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(76, 141, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cityText: {
    color: COLORS.blue,
    fontSize: 11,
    fontWeight: '700',
  },
  modeText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: 'rgba(255, 138, 31, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  hackathonTitle: {
    color: COLORS.navy,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  organizerText: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: 6,
  },
  hackathonDesc: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
    paddingTop: 12,
    marginBottom: 12,
  },
  prizeLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  prizeValue: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  squadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  squadText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  joinSquadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFC',
    borderWidth: 1,
    borderColor: 'rgba(76, 141, 255, 0.3)',
    borderRadius: 12,
    height: 40,
    gap: 6,
  },
  joinSquadText: {
    color: COLORS.blue,
    fontSize: 12,
    fontWeight: '700',
  },
  portalBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 40,
    gap: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  portalText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  // Shop card
  shopCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    padding: 16,
    shadowColor: 'rgba(20, 30, 60, 0.05)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  shopName: {
    color: COLORS.navy,
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 138, 31, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 138, 31, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  distanceText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  addressText: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginVertical: 6,
  },
  shopMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: COLORS.navy,
    fontSize: 12,
    fontWeight: '700',
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hoursText: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
  verifiedText: {
    color: COLORS.green,
    fontSize: 11,
    fontWeight: '700',
  },
  stockedChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  componentChip: {
    backgroundColor: '#F5F6F8',
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  componentChipText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  callStoreBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFC',
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    borderRadius: 12,
    height: 40,
    gap: 6,
  },
  callStoreText: {
    color: COLORS.navy,
    fontSize: 12,
    fontWeight: '700',
  },
  directionsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 40,
    gap: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  directionsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
