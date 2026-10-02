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
  Calendar,
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
          <Trophy size={14} color={activeTab === 'hackathons' ? '#000' : COLORS.textSecondary} />
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
          <Radio size={14} color={activeTab === 'shops' ? '#000' : COLORS.textSecondary} />
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
          <ActivityIndicator size="small" color={COLORS.neon} />
          <Text style={styles.loaderText}>Scanning Robotics Grid...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollList}>
          {activeTab === 'hackathons' ? (
            hackathons.map((h) => (
              <View key={h.id} style={styles.hackathonCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cityBadge}>
                    <MapPin size={10} color={COLORS.teal} />
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
                    <Users size={12} color={COLORS.textSecondary} />
                    <Text style={styles.squadText}>Squad of {h.teamSizeMax}</Text>
                  </View>
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.joinSquadBtn}
                    onPress={() => Linking.openURL(h.url)}
                  >
                    <Users size={12} color={COLORS.teal} />
                    <Text style={styles.joinSquadText}>Find Teammates</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.portalBtn}
                    onPress={() => Linking.openURL(h.url)}
                  >
                    <Text style={styles.portalText}>Official Rules</Text>
                    <ExternalLink size={12} color="#000" />
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
                    <Navigation size={10} color={COLORS.neon} />
                    <Text style={styles.distanceText}>{s.distanceKm} km</Text>
                  </View>
                </View>

                <Text style={styles.addressText} numberOfLines={2}>
                  {s.address}, {s.city}
                </Text>

                <View style={styles.shopMetaRow}>
                  <View style={styles.ratingBadge}>
                    <Star size={11} color="#FFD700" fill="#FFD700" />
                    <Text style={styles.ratingText}>{s.rating}</Text>
                  </View>

                  <View style={styles.hoursRow}>
                    <Clock size={11} color={COLORS.textMuted} />
                    <Text style={styles.hoursText}>{s.openingHours}</Text>
                  </View>

                  {s.isVerified && (
                    <View style={styles.verifiedRow}>
                      <ShieldCheck size={12} color={COLORS.neon} />
                      <Text style={styles.verifiedText}>Verified</Text>
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
                    <Phone size={12} color={COLORS.textPrimary} />
                    <Text style={styles.callStoreText}>Call Shop</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.directionsBtn}
                    onPress={() => openMapsDirections(s.directionsUrl)}
                  >
                    <Navigation size={12} color="#000" />
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
    backgroundColor: '#05110C',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#091A14',
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: COLORS.neon,
    borderColor: COLORS.neon,
  },
  tabButtonText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  tabButtonTextActive: {
    color: '#000',
    fontWeight: '800',
  },
  scrollList: {
    padding: 16,
    gap: 12,
  },
  loaderCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 8,
    fontFamily: 'monospace',
  },
  hackathonCard: {
    backgroundColor: '#081A12',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    padding: 16,
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
    backgroundColor: 'rgba(127, 231, 214, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cityText: {
    color: COLORS.teal,
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  modeText: {
    color: COLORS.neon,
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  hackathonTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  organizerText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginBottom: 6,
  },
  hackathonDesc: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
    paddingTop: 10,
    marginBottom: 12,
  },
  prizeLabel: {
    color: COLORS.textMuted,
    fontSize: 8,
    fontFamily: 'monospace',
  },
  prizeValue: {
    color: COLORS.neon,
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  squadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  squadText: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  joinSquadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#091A14',
    borderWidth: 1,
    borderColor: COLORS.teal,
    borderRadius: 10,
    height: 36,
    gap: 6,
  },
  joinSquadText: {
    color: COLORS.teal,
    fontSize: 11,
    fontWeight: '700',
  },
  portalBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.neon,
    borderRadius: 10,
    height: 36,
    gap: 6,
  },
  portalText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '800',
  },
  // Shop card
  shopCard: {
    backgroundColor: '#081A12',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    padding: 16,
  },
  shopName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(57, 255, 106, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.neon,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  distanceText: {
    color: COLORS.neon,
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  addressText: {
    color: COLORS.textSecondary,
    fontSize: 11,
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
    gap: 3,
  },
  ratingText: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: '700',
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  hoursText: {
    color: COLORS.textMuted,
    fontSize: 10,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginLeft: 'auto',
  },
  verifiedText: {
    color: COLORS.neon,
    fontSize: 10,
    fontWeight: '700',
  },
  stockedChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 12,
  },
  componentChip: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  componentChipText: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontFamily: 'monospace',
  },
  callStoreBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#091A14',
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    borderRadius: 10,
    height: 36,
    gap: 6,
  },
  callStoreText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  directionsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.neon,
    borderRadius: 10,
    height: 36,
    gap: 6,
  },
  directionsText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '800',
  },
});
