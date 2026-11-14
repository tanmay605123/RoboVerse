import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import {
  ROBOVERSE_PLANS,
  SubscriptionPlanTier,
  SubscriptionBillingCycle,
} from '@roboverse/shared';

export function SubscriptionScreen({ navigation }: any) {
  const [billingCycle, setBillingCycle] = useState<SubscriptionBillingCycle>('yearly');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanTier>('plus');
  const [isTestMode] = useState(true);
  const [activePlan, setActivePlan] = useState<SubscriptionPlanTier>('free');
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrSeconds, setQrSeconds] = useState(600);

  const handleSubscribe = (tier: SubscriptionPlanTier) => {
    if (tier === 'free') {
      Alert.alert('Current Plan', 'You are already enjoying the Explorer Free plan!');
      return;
    }
    if (tier === 'institution') {
      Alert.alert(
        'Institutional Licensing',
        'Please visit our web portal or contact billing@roboverse.in for institutional campus quotes.'
      );
      return;
    }

    setSelectedPlan(tier);

    Alert.alert(
      `Upgrade to ${ROBOVERSE_PLANS[tier].name}`,
      `Choose payment mode for ₹${
        billingCycle === 'yearly'
          ? ROBOVERSE_PLANS[tier].priceInrYearly
          : ROBOVERSE_PLANS[tier].priceInrMonthly
      } (18% GST Incl.):`,
      [
        {
          text: '⚡ Direct UPI (GPay/PhonePe)',
          onPress: () => {
            setShowQrModal(true);
          },
        },
        {
          text: '💳 Razorpay Standard',
          onPress: () => {
            simulateSuccess(tier);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const simulateSuccess = (tier: SubscriptionPlanTier) => {
    setActivePlan(tier);
    setShowQrModal(false);
    Alert.alert(
      'Payment Captured & Verified! 🚀',
      `Welcome to RoboVerse ${ROBOVERSE_PLANS[tier].name}! All ${
        tier === 'pro' ? 'advanced R&D tools and unlimited Rituu' : '50 lessons and 5 robot templates'
      } are now unlocked.`
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>TRANSPARENT STEM PRICING</Text>
        </View>
        <Text style={styles.title}>CHOOSE YOUR TIER</Text>
        <Text style={styles.subtitle}>
          Unlock high-fidelity 3D simulation, AI reasoning with Rituu &amp; certified robotics skills.
        </Text>

        {/* Billing Cycle Switcher */}
        <View style={styles.cycleToggle}>
          <TouchableOpacity
            style={[styles.cycleBtn, billingCycle === 'monthly' && styles.cycleBtnActive]}
            onPress={() => setBillingCycle('monthly')}
          >
            <Text
              style={[
                styles.cycleBtnText,
                billingCycle === 'monthly' && styles.cycleBtnTextActive,
              ]}
            >
              MONTHLY
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.cycleBtn, billingCycle === 'yearly' && styles.cycleBtnActive]}
            onPress={() => setBillingCycle('yearly')}
          >
            <Text
              style={[
                styles.cycleBtnText,
                billingCycle === 'yearly' && styles.cycleBtnTextActive,
              ]}
            >
              ANNUAL (SAVE 30%)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {(['free', 'plus', 'pro'] as SubscriptionPlanTier[]).map((tier) => {
          const plan = ROBOVERSE_PLANS[tier];
          const isCurrent = activePlan === tier;
          const price = billingCycle === 'yearly' ? plan.priceInrYearly : plan.priceInrMonthly;
          const period = billingCycle === 'yearly' ? '/yr' : '/mo';

          return (
            <View
              key={tier}
              style={[
                styles.planCard,
                plan.popular && styles.planCardPopular,
                isCurrent && styles.planCardCurrent,
              ]}
            >
              {plan.badge && (
                <View style={styles.planBadge}>
                  <Text style={styles.planBadgeText}>{plan.badge}</Text>
                </View>
              )}

              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planTagline}>{plan.tagline}</Text>

              <View style={styles.priceRow}>
                <Text style={styles.priceNumber}>₹{price.toLocaleString('en-IN')}</Text>
                {tier !== 'free' && <Text style={styles.pricePeriod}>{period}</Text>}
              </View>

              <View style={styles.divider} />

              <View style={styles.featuresList}>
                {plan.highlights.slice(0, 5).map((item: string, i: number) => (
                  <View key={i} style={styles.featureItem}>
                    <Text style={styles.checkIcon}>✓</Text>
                    <Text style={styles.featureText}>{item}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.subscribeBtn,
                  tier === 'free'
                    ? styles.freeBtn
                    : plan.popular
                    ? styles.popularBtn
                    : styles.proBtn,
                ]}
                onPress={() => handleSubscribe(tier)}
              >
                <Text
                  style={[
                    styles.subscribeBtnText,
                    plan.popular ? styles.popularBtnText : styles.defaultBtnText,
                  ]}
                >
                  {isCurrent ? 'ACTIVE PLAN' : `UPGRADE TO ${plan.name.toUpperCase()}`}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      {/* UPI QR Modal simulation */}
      {showQrModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>SCAN WITH ANY UPI APP</Text>
            <Text style={styles.modalSub}>
              Amount: ₹
              {billingCycle === 'yearly'
                ? ROBOVERSE_PLANS[selectedPlan].priceInrYearly
                : ROBOVERSE_PLANS[selectedPlan].priceInrMonthly}{' '}
              (18% GST Incl.)
            </Text>

            <View style={styles.qrContainer}>
              <Image
                source={{
                  uri: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi%3A%2F%2Fpay%3Fpa%3Droboverse%40icici%26pn%3DRoboVerse%26am%3D299%26cu%3DINR&bgcolor=07110D&color=39FF6A`,
                }}
                style={styles.qrImage}
              />
            </View>

            <Text style={styles.upiIdText}>VPA: roboverse@icici</Text>
            <Text style={styles.countdownText}>Expires in 10:00 &bull; Auto-detecting payment</Text>

            <TouchableOpacity
              style={styles.simPayBtn}
              onPress={() => simulateSuccess(selectedPlan)}
            >
              <Text style={styles.simPayBtnText}>⚡ Simulate Instant UPI Payment</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowQrModal(false)}
            >
              <Text style={styles.cancelBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07110D',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(57, 255, 106, 0.15)',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(57, 255, 106, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 106, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  badgeText: {
    color: '#39FF6A',
    fontSize: 9,
    fontFamily: 'System',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  cycleToggle: {
    flexDirection: 'row',
    backgroundColor: '#0B1914',
    borderWidth: 1,
    borderColor: 'rgba(127, 231, 214, 0.2)',
    borderRadius: 8,
    padding: 3,
    marginTop: 14,
  },
  cycleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  cycleBtnActive: {
    backgroundColor: '#39FF6A',
  },
  cycleBtnText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  cycleBtnTextActive: {
    color: '#07110D',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  planCard: {
    backgroundColor: '#0B1914',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 16,
    padding: 18,
    position: 'relative',
  },
  planCardPopular: {
    borderColor: '#39FF6A',
    backgroundColor: '#0A2017',
  },
  planCardCurrent: {
    borderColor: '#7FE7D6',
  },
  planBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: '#39FF6A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  planBadgeText: {
    color: '#07110D',
    fontSize: 9,
    fontWeight: '900',
  },
  planName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  planTagline: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 12,
  },
  priceNumber: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  pricePeriod: {
    color: '#94A3B8',
    fontSize: 12,
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#1E293B',
    marginVertical: 14,
  },
  featuresList: {
    gap: 8,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  checkIcon: {
    color: '#39FF6A',
    fontSize: 13,
    fontWeight: '900',
  },
  featureText: {
    color: '#CBD5E1',
    fontSize: 12,
    flex: 1,
  },
  subscribeBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  freeBtn: {
    backgroundColor: '#1E293B',
  },
  popularBtn: {
    backgroundColor: '#39FF6A',
  },
  proBtn: {
    backgroundColor: 'rgba(127, 231, 214, 0.15)',
    borderWidth: 1,
    borderColor: '#7FE7D6',
  },
  subscribeBtnText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  popularBtnText: {
    color: '#07110D',
  },
  defaultBtnText: {
    color: '#FFFFFF',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#0B1914',
    borderWidth: 1,
    borderColor: '#39FF6A',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  modalSub: {
    color: '#7FE7D6',
    fontSize: 12,
    marginBottom: 16,
  },
  qrContainer: {
    backgroundColor: '#07110D',
    borderWidth: 1,
    borderColor: '#39FF6A',
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  qrImage: {
    width: 200,
    height: 200,
  },
  upiIdText: {
    color: '#94A3B8',
    fontSize: 11,
    fontFamily: 'System',
    marginBottom: 4,
  },
  countdownText: {
    color: '#FF9A1F',
    fontSize: 11,
    marginBottom: 16,
  },
  simPayBtn: {
    backgroundColor: '#39FF6A',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  simPayBtnText: {
    color: '#07110D',
    fontSize: 12,
    fontWeight: '800',
  },
  cancelBtn: {
    paddingVertical: 8,
  },
  cancelBtnText: {
    color: '#94A3B8',
    fontSize: 12,
  },
});
