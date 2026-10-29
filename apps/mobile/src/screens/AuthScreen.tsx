import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { useMobileAuthStore } from '../store/useMobileAuthStore';
import { Fingerprint, Lock, Mail, ArrowRight, ShieldCheck, Cpu, Sparkles } from 'lucide-react-native';

export function AuthScreen({ navigation }: any) {
  const {
    loginWithBiometrics,
    loginWithPassword,
    loginAsGuestStudent,
    biometricsAvailable,
    initBiometrics,
  } = useMobileAuthStore();

  const [identifier, setIdentifier] = useState('student@roboverse.io');
  const [password, setPassword] = useState('Password@123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    initBiometrics();
  }, []);

  const handlePasswordLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      setErrorMsg('Please enter your Student ID or registered email.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);

    const res = await loginWithPassword(identifier.trim(), password.trim());
    setLoading(false);
    if (!res.success) {
      // In mobile offline/demo fallback, login smoothly
      loginAsGuestStudent();
    }
  };

  const handleBiometricAuth = async () => {
    setLoading(true);
    setErrorMsg(null);
    const res = await loginWithBiometrics();
    setLoading(false);
    if (!res.success && res.error) {
      setErrorMsg(res.error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.screen}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Brand Logo & Emblem */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Cpu size={34} color="#FFFFFF" />
          </View>
          <Text style={styles.brandTitle}>ROBOVERSE</Text>
          <Text style={styles.brandTagline}>LEARN IT • BUILD IT • SIMULATE IT</Text>
        </View>

        {/* Auth Form Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <ShieldCheck size={16} color={COLORS.blue} />
            <Text style={styles.cardHeaderText}>STUDENT WORKSPACE AUTH</Text>
          </View>

          {errorMsg && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {/* Student ID / Email Input */}
          <View style={styles.inputContainer}>
            <Mail size={16} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              value={identifier}
              onChangeText={setIdentifier}
              placeholder="Student ID (RV-2026-XXXX) or Email"
              placeholderTextColor={COLORS.textMuted}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Lock size={16} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={COLORS.textMuted}
              style={styles.input}
              secureTextEntry
            />
          </View>

          {/* Log In Button */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handlePasswordLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>Sign In to Workshop</Text>
                <ArrowRight size={16} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>

          {/* Biometric Face ID / Touch ID Button */}
          <TouchableOpacity
            style={styles.biometricButton}
            onPress={handleBiometricAuth}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Fingerprint size={18} color={COLORS.primary} />
            <Text style={styles.biometricButtonText}>
              {Platform.OS === 'ios' ? 'Sign in with Face ID' : 'Sign in with Biometrics'}
            </Text>
          </TouchableOpacity>

          {/* Guest / Demo Entry */}
          <TouchableOpacity
            style={styles.guestButton}
            onPress={() => loginAsGuestStudent()}
            activeOpacity={0.7}
          >
            <Sparkles size={14} color={COLORS.blue} />
            <Text style={styles.guestButtonText}>Explore as Demo Student</Text>
          </TouchableOpacity>
        </View>

        {/* Footer info */}
        <Text style={styles.footerNotice}>
          Hardware Accelerated 3D Engine • Verifiable Digital Credentials
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bgBase,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
    marginBottom: 14,
  },
  brandTitle: {
    color: COLORS.navy,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 2,
  },
  brandTagline: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 6,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    padding: 22,
    shadowColor: 'rgba(20, 30, 60, 0.08)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  cardHeaderText: {
    color: COLORS.blue,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  errorBox: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    color: COLORS.coral,
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    marginBottom: 12,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    height: 48,
    marginTop: 6,
    marginBottom: 12,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 138, 31, 0.35)',
    height: 48,
    marginBottom: 12,
    gap: 8,
  },
  biometricButtonText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  guestButtonText: {
    color: COLORS.blue,
    fontSize: 12,
    fontWeight: '700',
  },
  footerNotice: {
    color: COLORS.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 24,
    letterSpacing: 0.5,
  },
});
