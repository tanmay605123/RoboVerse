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
            <Cpu size={32} color={COLORS.neon} />
          </View>
          <Text style={styles.brandTitle}>ROBOVERSE</Text>
          <Text style={styles.brandTagline}>LEARN IT. BUILD IT. SIMULATE IT.</Text>
        </View>

        {/* Auth Form Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <ShieldCheck size={16} color={COLORS.teal} />
            <Text style={styles.cardHeaderText}>STUDENT CONTROL ROOM AUTH</Text>
          </View>

          {errorMsg && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {/* Student ID / Email Input */}
          <View style={styles.inputContainer}>
            <Mail size={16} color={COLORS.textSecondary} style={styles.inputIcon} />
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
            <Lock size={16} color={COLORS.textSecondary} style={styles.inputIcon} />
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
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>Authenticate &amp; Enter</Text>
                <ArrowRight size={16} color="#000" />
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
            <Fingerprint size={18} color={COLORS.neon} />
            <Text style={styles.biometricButtonText}>
              {Platform.OS === 'ios' ? 'Sign in with Face ID' : 'Sign in with Fingerprint'}
            </Text>
          </TouchableOpacity>

          {/* Guest / Demo Entry */}
          <TouchableOpacity
            style={styles.guestButton}
            onPress={() => loginAsGuestStudent()}
            activeOpacity={0.7}
          >
            <Sparkles size={14} color={COLORS.teal} />
            <Text style={styles.guestButtonText}>Enter as Guest Student</Text>
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
    backgroundColor: '#091A14',
    borderWidth: 1.5,
    borderColor: COLORS.neon,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.neon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 8,
    marginBottom: 12,
  },
  brandTitle: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 2.5,
    fontFamily: 'monospace',
  },
  brandTagline: {
    color: COLORS.neon,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  card: {
    backgroundColor: '#091C14',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.borderHighlight,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  cardHeaderText: {
    color: COLORS.teal,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  errorBox: {
    backgroundColor: 'rgba(255, 67, 67, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    color: '#FFA1A1',
    fontSize: 11,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#05100B',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
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
    backgroundColor: COLORS.neon,
    borderRadius: 14,
    height: 48,
    marginTop: 6,
    marginBottom: 12,
    gap: 8,
    shadowColor: COLORS.neon,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '800',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#040C08',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 106, 0.4)',
    height: 48,
    marginBottom: 12,
    gap: 8,
  },
  biometricButtonText: {
    color: COLORS.neon,
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
    color: COLORS.teal,
    fontSize: 12,
    fontWeight: '600',
  },
  footerNotice: {
    color: COLORS.textMuted,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 24,
    letterSpacing: 0.5,
  },
});
