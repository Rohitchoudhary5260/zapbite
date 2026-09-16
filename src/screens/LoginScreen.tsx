import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS, SHADOWS } from '../theme/colors';

const LOGO_IMG = require('../assets/images/logo.png');

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onOpenRider?: () => void;
  onOpenAdmin?: () => void;
}

export default function LoginScreen({ onLoginSuccess, onOpenRider, onOpenAdmin }: LoginScreenProps) {
  const { loginWithPhone, signup, checkUser, verifyOtp, skipLogin } = useAuth();

  // Mode: 'login' | 'signup' | 'otp'
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [step, setStep] = useState<'form' | 'otp'>('form');

  // Form Fields
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [referralCode, setReferralCode] = useState('WELCOME250');
  const [city, setCity] = useState('New Delhi');
  const [addressLine, setAddressLine] = useState('');

  // OTP State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [checkingUser, setCheckingUser] = useState(false);
  const [userStatusMsg, setUserStatusMsg] = useState<{ type: 'info' | 'warn' | 'success'; text: string } | null>(null);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);

  const otpRefs = useRef<Array<TextInput | null>>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startOtpTimer = () => {
    setTimer(30);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1 && timerRef.current) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handlePhoneBlur = async () => {
    if (phone.length === 10 && /^\d+$/.test(phone)) {
      setCheckingUser(true);
      try {
        const res = await checkUser(phone);
        if (authMode === 'login' && !res.exists) {
          setUserStatusMsg({
            type: 'warn',
            text: '✨ New number! Tap "Sign Up" above to claim your ₹250 welcome bonus.',
          });
        } else if (authMode === 'signup' && res.exists) {
          setUserStatusMsg({
            type: 'info',
            text: `👋 Account already exists for this number. Switch to "Login" below.`,
          });
        } else {
          setUserStatusMsg(null);
        }
      } catch {
        setUserStatusMsg(null);
      } finally {
        setCheckingUser(false);
      }
    }
  };

  const handleLoginSubmit = async () => {
    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    setError('');
    setUserStatusMsg(null);

    try {
      await loginWithPhone(phone);
      setStep('otp');
      startOtpTimer();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async () => {
    if (!name.trim() || name.trim().length < 2) {
      setError('Please enter your full name');
      return;
    }
    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError('');
    setUserStatusMsg(null);

    try {
      const res = await signup({
        phone,
        name: name.trim(),
        email: email.trim(),
        referralCode: referralCode.trim(),
        city,
        addressLine: addressLine.trim() || 'Flat 101, Green Park',
      });

      if (res.alreadyExists) {
        Alert.alert(
          'Account Exists',
          'An account with this mobile number already exists. Switching to Login.',
          [{ text: 'OK', onPress: () => setAuthMode('login') }]
        );
        return;
      }

      setStep('otp');
      startOtpTimer();
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (val: string, idx: number) => {
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    setError('');
    if (val && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpStr = otp.join('');
    if (otpStr.length !== 6) {
      setError('Please enter the 6-digit OTP code');
      return;
    }
    setLoading(true);
    setError('');
    const success = await verifyOtp(phone, otpStr);
    if (success) {
      onLoginSuccess();
    } else {
      setError('Invalid OTP code. Please enter the 6-digit OTP sent to your phone.');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Banner */}
        <View style={styles.brandHero}>
          <Image source={LOGO_IMG} style={styles.heroLogoImg} resizeMode="cover" />
          <View style={styles.logoRow}>
            <Text style={styles.logoMain}>Zap<Text style={styles.logoMint}>tite</Text></Text>
          </View>
          <Text style={styles.heroTagline}>10-Minute Pure Veg Grocery Delivery 🥦⚡</Text>

          <View style={styles.heroBadgesRow}>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillEmoji}>🥦</Text>
              <Text style={styles.heroPillText}>100% Pure Veg</Text>
            </View>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillEmoji}>⚡</Text>
              <Text style={styles.heroPillText}>10 Min Delivery</Text>
            </View>
            <View style={styles.heroPillBonus}>
              <Text style={styles.heroPillEmoji}>💰</Text>
              <Text style={styles.heroPillBonusText}>₹250 Bonus</Text>
            </View>
          </View>
        </View>

        {/* Main Card */}
        <View style={styles.cardContainer}>
          {step === 'form' ? (
            <>
              {/* Segmented Auth Switch [ Login | Sign Up ] */}
              <View style={styles.segmentContainer}>
                <TouchableOpacity
                  style={[styles.segmentBtn, authMode === 'login' && styles.segmentBtnActive]}
                  onPress={() => { setAuthMode('login'); setError(''); setUserStatusMsg(null); }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.segmentText, authMode === 'login' && styles.segmentTextActive]}>
                    🔑 Login
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.segmentBtn, authMode === 'signup' && styles.segmentBtnActive]}
                  onPress={() => { setAuthMode('signup'); setError(''); setUserStatusMsg(null); }}
                  activeOpacity={0.8}
                >
                  <View style={styles.signupBadgeWrapper}>
                    <Text style={[styles.segmentText, authMode === 'signup' && styles.segmentTextActive]}>
                      ✨ Sign Up
                    </Text>
                    <View style={styles.bonusChip}>
                      <Text style={styles.bonusChipText}>₹250</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Title Header */}
              <View style={styles.titleBox}>
                <Text style={styles.cardTitle}>
                  {authMode === 'login' ? 'Welcome Back!' : 'Create New Account 🎉'}
                </Text>
                <Text style={styles.cardSubtitle}>
                  {authMode === 'login'
                    ? 'Enter your mobile number to get instant OTP'
                    : 'Sign up in 30 seconds & get ₹250 wallet bonus!'}
                </Text>
              </View>

              {/* Status Message (e.g. Existing/New user hint) */}
              {userStatusMsg && (
                <View style={[styles.statusBanner, userStatusMsg.type === 'warn' ? styles.statusWarn : styles.statusInfo]}>
                  <Text style={styles.statusBannerText}>{userStatusMsg.text}</Text>
                  {userStatusMsg.type === 'warn' && (
                    <TouchableOpacity onPress={() => setAuthMode('signup')}>
                      <Text style={styles.statusActionLink}>Switch to Sign Up →</Text>
                    </TouchableOpacity>
                  )}
                  {userStatusMsg.type === 'info' && (
                    <TouchableOpacity onPress={() => setAuthMode('login')}>
                      <Text style={styles.statusActionLink}>Switch to Login →</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Form Fields */}
              {authMode === 'signup' && (
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Full Name *</Text>
                  <TextInput
                    style={styles.inputBox}
                    placeholder="e.g. Rohit Choudhary"
                    placeholderTextColor={COLORS.textMuted}
                    value={name}
                    onChangeText={t => { setName(t); setError(''); }}
                  />
                </View>
              )}

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Mobile Number *</Text>
                <View style={styles.phoneInputRow}>
                  <View style={styles.flagCode}>
                    <Text style={styles.flagText}>🇮🇳 +91</Text>
                  </View>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="10-digit mobile number"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phone}
                    onChangeText={t => { setPhone(t); setError(''); }}
                    onBlur={handlePhoneBlur}
                  />
                  {checkingUser && (
                    <ActivityIndicator size="small" color={COLORS.primary} style={{ marginRight: 10 }} />
                  )}
                </View>
              </View>

              {authMode === 'signup' && (
                <>
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Email Address (Optional)</Text>
                    <TextInput
                      style={styles.inputBox}
                      placeholder="e.g. rohit@gmail.com"
                      placeholderTextColor={COLORS.textMuted}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                    />
                  </View>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Delivery Area / City</Text>
                    <TextInput
                      style={styles.inputBox}
                      placeholder="e.g. Sector 62, Noida"
                      placeholderTextColor={COLORS.textMuted}
                      value={city}
                      onChangeText={setCity}
                    />
                  </View>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Referral / Promo Code</Text>
                    <View style={styles.promoInputRow}>
                      <TextInput
                        style={[styles.inputBox, { flex: 1 }]}
                        placeholder="WELCOME250"
                        placeholderTextColor={COLORS.textMuted}
                        autoCapitalize="characters"
                        value={referralCode}
                        onChangeText={setReferralCode}
                      />
                      <View style={styles.verifiedPromoBadge}>
                        <Text style={styles.verifiedPromoText}>✓ +₹250 BONUS</Text>
                      </View>
                    </View>
                  </View>
                </>
              )}

              {error ? <Text style={styles.errorText}>⚠️ {error}</Text> : null}

              {/* Submit CTA */}
              <TouchableOpacity
                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                onPress={authMode === 'login' ? handleLoginSubmit : handleSignupSubmit}
                activeOpacity={0.85}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {authMode === 'login' ? 'Get OTP Code →' : 'Create Account & Claim ₹250 →'}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Guest Login */}
              <TouchableOpacity
                style={styles.guestBtn}
                onPress={() => { skipLogin(); onLoginSuccess(); }}
                activeOpacity={0.8}
              >
                <Text style={styles.guestBtnText}>Continue as Guest 👤</Text>
              </TouchableOpacity>
            </>
          ) : (
            /* OTP Verification Screen */
            <>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => { setStep('form'); setOtp(['', '', '', '', '', '']); setError(''); }}
                activeOpacity={0.8}
              >
                <Text style={styles.backBtnText}>← Change Number (+91 {phone})</Text>
              </TouchableOpacity>

              <View style={styles.otpHeader}>
                <Text style={styles.otpEmoji}>📲</Text>
                <Text style={styles.cardTitle}>Enter 6-Digit OTP</Text>
                <Text style={styles.cardSubtitle}>
                  We sent a code to <Text style={{ fontWeight: '800', color: COLORS.textPrimary }}>+91 {phone}</Text>
                </Text>
              </View>

              {/* OTP Boxes */}
              <View style={styles.otpBoxesRow}>
                {otp.map((digit, idx) => (
                  <TextInput
                    key={idx}
                    ref={ref => { otpRefs.current[idx] = ref; }}
                    style={[styles.otpBox, digit ? styles.otpBoxFilled : {}]}
                    value={digit}
                    onChangeText={val => handleOtpChange(val.slice(-1), idx)}
                    onKeyPress={e => handleOtpKeyPress(e, idx)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                  />
                ))}
              </View>

              {error ? <Text style={styles.errorText}>⚠️ {error}</Text> : null}

              {/* Timer / Resend */}
              {timer > 0 ? (
                <Text style={styles.timerText}>Resend OTP in <Text style={{ fontWeight: '800' }}>{timer}s</Text></Text>
              ) : (
                <TouchableOpacity onPress={handleLoginSubmit} activeOpacity={0.8}>
                  <Text style={styles.resendBtnText}>🔄 Resend OTP Code</Text>
                </TouchableOpacity>
              )}

              {/* Verify CTA */}
              <TouchableOpacity
                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                onPress={handleVerifyOtp}
                activeOpacity={0.85}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>✓ Verify & Enter Store</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Rider & Admin Portal Quick Access (Dev Mode Only) */}
        {(onOpenRider || onOpenAdmin) && (
          <View style={styles.portalSwitchBox}>
            {onOpenRider && (
              <TouchableOpacity
                style={styles.portalBtn}
                onPress={onOpenRider}
                activeOpacity={0.8}
              >
                <Text style={styles.portalBtnText}>🚴 Rider Partner Portal</Text>
              </TouchableOpacity>
            )}
            {onOpenRider && onOpenAdmin && <View style={styles.portalDivider} />}
            {onOpenAdmin && (
              <TouchableOpacity
                style={styles.portalBtn}
                onPress={onOpenAdmin}
                activeOpacity={0.8}
              >
                <Text style={styles.portalBtnText}>👑 Store Admin Panel</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <Text style={styles.termsNote}>
          By continuing, you agree to Zaptite's Terms of Service & 100% Pure Veg Promise.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  brandHero: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  heroLogoImg: {
    width: 72,
    height: 72,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    ...SHADOWS.medium,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  logoZap: {
    fontSize: 44,
    marginRight: 4,
  },
  logoMain: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  logoMint: {
    color: '#A7F3D0',
  },
  heroTagline: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 14,
    textAlign: 'center',
  },
  heroBadgesRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  heroPillEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  heroPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroPillBonus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  heroPillBonusText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#00592E',
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 22,
    paddingTop: 24,
    ...SHADOWS.large,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    ...SHADOWS.small,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  segmentTextActive: {
    color: COLORS.primary,
    fontWeight: '900',
  },
  signupBadgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bonusChip: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  bonusChipText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#B45309',
  },
  titleBox: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  statusBanner: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
  },
  statusWarn: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
  },
  statusInfo: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  statusBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
    lineHeight: 16,
  },
  statusActionLink: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 4,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  inputBox: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
    backgroundColor: '#FAFAFA',
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    overflow: 'hidden',
  },
  flagCode: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  flagText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  promoInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifiedPromoBadge: {
    backgroundColor: '#F0FFF4',
    paddingHorizontal: 10,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00D26A',
  },
  verifiedPromoText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.primary,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.accentCoral,
    marginBottom: 12,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 6,
    ...SHADOWS.medium,
  },
  submitBtnDisabled: {
    opacity: 0.65,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  demoFillBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  demoFillText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginHorizontal: 12,
  },
  guestBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  guestBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  backBtn: {
    marginBottom: 16,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  otpHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  otpEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 16,
  },
  otpBox: {
    flex: 1,
    height: 52,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
    backgroundColor: '#FAFAFA',
  },
  otpBoxFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  portalSwitchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  portalBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  portalBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  portalDivider: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 8,
  },
  timerText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  resendBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 16,
    textDecorationLine: 'underline',
  },
  termsNote: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    paddingHorizontal: 24,
    marginTop: 12,
  },
});
