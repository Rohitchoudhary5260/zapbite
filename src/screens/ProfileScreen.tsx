import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS, SHADOWS } from '../theme/colors';
import { NavTab } from '../types';

const LOGO_IMG = require('../assets/images/logo.png');

interface ProfileScreenProps {
  onTabChange: (tab: NavTab) => void;
  onOpenRider?: () => void;
  onOpenAdmin?: () => void;
}

export default function ProfileScreen({ onTabChange, onOpenRider, onOpenAdmin }: ProfileScreenProps) {
  const { user, logout, selectedAddress, setSelectedAddress, addAddress } = useAuth();
  const [showHelp, setShowHelp] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newTag, setNewTag] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [newLine1, setNewLine1] = useState('');
  const [newLine2, setNewLine2] = useState('');
  const [newCity, setNewCity] = useState('New Delhi');
  const [newPincode, setNewPincode] = useState('110001');

  const handleSaveAddress = () => {
    if (!newLine1.trim()) {
      Alert.alert('Validation Error', 'Please enter address line 1');
      return;
    }
    const newAddr = {
      id: `addr_${Date.now()}`,
      tag: newTag,
      line1: newLine1.trim(),
      line2: newLine2.trim(),
      city: newCity.trim() || 'New Delhi',
      pincode: newPincode.trim() || '110001',
      isDefault: false,
    };
    addAddress(newAddr);
    setSelectedAddress(newAddr);
    setNewLine1('');
    setNewLine2('');
    setShowAddAddress(false);
    Alert.alert('Success', 'New address saved to your profile!');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout from Zaptite?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const MENU_ITEMS = [
    { icon: '📦', label: 'My Orders', sub: 'Track and reorder your past orders', action: () => onTabChange('orders') },
    ...(onOpenRider ? [{ icon: '🚴', label: 'Rider Partner Portal', sub: 'Deliver orders, manage ID & track earnings', action: () => onOpenRider() }] : []),
    ...(onOpenAdmin ? [{ icon: '👑', label: 'Admin Command Center', sub: 'Live sales, products & fleet analytics', action: () => onOpenAdmin() }] : []),
    { icon: '📍', label: 'Saved Addresses', sub: `${user?.addresses?.length || 0} addresses saved`, action: () => {} },
    { icon: '💰', label: 'Zaptite Wallet', sub: `Balance: ₹${user?.walletBalance || 0}`, action: () => {} },
    { icon: '🎟', label: 'Coupons & Offers', sub: 'View active deals and promo codes', action: () => {} },
    { icon: '⭐', label: 'Rate the App', sub: 'Tell us how we are doing', action: () => {} },
    { icon: '🆘', label: 'Help & Support', sub: 'FAQs and customer support', action: () => setShowHelp(true) },
  ];

  return (
    <View style={styles.root}>
      {/* Header with Logo */}
      <View style={styles.header}>
        <View style={styles.headerLogoRow}>
          <Image source={LOGO_IMG} style={styles.headerLogoImg} resizeMode="cover" />
          <View>
            <Text style={styles.headerTitle}>Zap<Text style={styles.headerTitleMint}>tite</Text></Text>
            <Text style={styles.headerSub}>⚡ 10-Min Pure Veg Delivery</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>
              {user?.name?.charAt(0) || 'R'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'Guest User'}</Text>
            <Text style={styles.profilePhone}>+91 {user?.phone || '—'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'Not set'}</Text>
          </View>
          <TouchableOpacity style={styles.editBtn} activeOpacity={0.8}>
            <Text style={styles.editBtnText}>Edit ✏️</Text>
          </TouchableOpacity>
        </View>

        {/* Wallet Card */}
        <View style={styles.walletCard}>
          <View style={styles.walletLeft}>
            <Text style={styles.walletEmoji}>⚡</Text>
            <View>
              <Text style={styles.walletTitle}>Zaptite Wallet</Text>
              <Text style={styles.walletBalance}>₹{user?.walletBalance || 250} available</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.addMoneyBtn} activeOpacity={0.8}>
            <Text style={styles.addMoneyText}>+ Add Money</Text>
          </TouchableOpacity>
        </View>

        {/* Saved Addresses */}
        <View style={styles.addressSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>📍 Saved Addresses</Text>
            <TouchableOpacity onPress={() => setShowAddAddress(!showAddAddress)}>
              <Text style={styles.addAddrText}>{showAddAddress ? '✕ Cancel' : '+ Add New'}</Text>
            </TouchableOpacity>
          </View>

          {showAddAddress && (
            <View style={styles.addAddrCard}>
              <Text style={styles.addAddrHeader}>Add Delivery Address</Text>
              <View style={styles.tagSelector}>
                {(['Home', 'Work', 'Other'] as const).map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.tagChip, newTag === t && styles.tagChipActive]}
                    onPress={() => setNewTag(t)}
                  >
                    <Text style={[styles.tagChipText, newTag === t && styles.tagChipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>Flat / House / Floor / Building *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Flat 301, Tower A, Green Avenue"
                  placeholderTextColor={COLORS.textMuted}
                  value={newLine1}
                  onChangeText={setNewLine1}
                />
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>Area / Sector / Landmark</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Near Metro Station, Sector 18"
                  placeholderTextColor={COLORS.textMuted}
                  value={newLine2}
                  onChangeText={setNewLine2}
                />
              </View>
              <View style={styles.rowInputs}>
                <View style={[styles.inputWrap, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>City</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newCity}
                    onChangeText={setNewCity}
                  />
                </View>
                <View style={[styles.inputWrap, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Pincode</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="number-pad"
                    value={newPincode}
                    onChangeText={setNewPincode}
                  />
                </View>
              </View>
              <TouchableOpacity style={styles.saveAddrBtn} onPress={handleSaveAddress}>
                <Text style={styles.saveAddrBtnText}>✓ Save Address</Text>
              </TouchableOpacity>
            </View>
          )}

          {user?.addresses && user.addresses.map((addr, idx) => {
            const addrKey = addr.id || addr._id || `addr_${idx}_${addr.line1}`;
            const isSelected =
              (selectedAddress?.id && selectedAddress.id === addr.id) ||
              (selectedAddress?._id && selectedAddress._id === addr._id) ||
              selectedAddress?.line1 === addr.line1;
            return (
              <TouchableOpacity
                key={addrKey}
                style={[styles.addressCard, isSelected && styles.addressCardActive]}
                onPress={() => setSelectedAddress(addr)}
                activeOpacity={0.8}
              >
                <View style={[styles.addrTagBadge, isSelected && styles.addrTagBadgeActive]}>
                  <Text style={[styles.addrTagText, isSelected && styles.addrTagTextActive]}>{addr.tag}</Text>
                </View>
                <View style={styles.addrDetails}>
                  <Text style={styles.addrLine1}>{addr.line1}</Text>
                  {addr.line2 ? <Text style={styles.addrLine2}>{addr.line2}</Text> : null}
                  <Text style={styles.addrLine2}>{addr.city} - {addr.pincode}</Text>
                </View>
                {isSelected && <Text style={styles.checkmark}>✅</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {MENU_ITEMS.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.menuItem}
              onPress={item.action}
              activeOpacity={0.7}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <View style={styles.menuInfo}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSub}>{item.sub}</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Help Modal */}
        {showHelp && (
          <View style={styles.helpCard}>
            <Text style={styles.helpTitle}>🆘 Help & Support</Text>
            <Text style={styles.helpText}>• Email: support@zaptite.in</Text>
            <Text style={styles.helpText}>• WhatsApp: +91 1800-ZAP-BITE</Text>
            <Text style={styles.helpText}>• Chat support: Available 24/7</Text>
            <TouchableOpacity onPress={() => setShowHelp(false)}>
              <Text style={styles.helpClose}>Close ✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* App Version / Brand Footer */}
        <View style={styles.versionRow}>
          <Image source={LOGO_IMG} style={styles.versionLogo} resizeMode="cover" />
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.versionText}>Zap<Text style={{ color: COLORS.primary }}>Bite</Text> v1.0.0</Text>
            <Text style={styles.versionSub}>Your 10-Minute Pure Veg Delivery Partner 🥦</Text>
          </View>
          <Image source={LOGO_IMG} style={styles.versionLogo} resizeMode="cover" />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerLogoImg: {
    width: 40,
    height: 40,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerTitleMint: {
    color: '#A7F3D0',
  },
  headerSub: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 1,
  },
  scroll: { flex: 1 },
  profileCard: {
    backgroundColor: COLORS.surface,
    margin: 16,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 3,
    borderColor: '#A7F3D0',
  },
  avatarInitial: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.textLight,
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 17, fontWeight: '900', color: COLORS.textPrimary },
  profilePhone: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2, fontWeight: '600' },
  profileEmail: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  editBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  editBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  walletCard: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOWS.medium,
  },
  walletLeft: { flexDirection: 'row', alignItems: 'center' },
  walletEmoji: { fontSize: 28, marginRight: 12 },
  walletTitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '700' },
  walletBalance: { fontSize: 20, fontWeight: '900', color: COLORS.textLight, marginTop: 2 },
  addMoneyBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  addMoneyText: { fontSize: 13, fontWeight: '800', color: COLORS.textLight },
  addressSection: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    padding: 16,
    ...SHADOWS.small,
  },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addAddrText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  addAddrCard: {
    backgroundColor: COLORS.primaryLight,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  addAddrHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 8,
  },
  tagSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tagChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tagChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  tagChipTextActive: {
    color: '#FFFFFF',
  },
  inputWrap: {
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 3,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  saveAddrBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  saveAddrBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  addressCardActive: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: 6,
  },
  addrTagBadge: {
    backgroundColor: COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 10,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  addrTagBadgeActive: { backgroundColor: COLORS.primary },
  addrTagText: { fontSize: 10, fontWeight: '800', color: COLORS.textSecondary },
  addrTagTextActive: { color: COLORS.textLight },
  addrDetails: { flex: 1 },
  addrLine1: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  addrLine2: { fontSize: 11, color: COLORS.textMuted, marginTop: 2, fontWeight: '500' },
  checkmark: { fontSize: 16, marginLeft: 8 },
  menuSection: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  menuIcon: { fontSize: 22, marginRight: 14, width: 28 },
  menuInfo: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  menuSub: { fontSize: 11, color: COLORS.textMuted, marginTop: 2, fontWeight: '500' },
  menuArrow: { fontSize: 22, color: COLORS.textMuted, fontWeight: '300' },
  helpCard: {
    backgroundColor: COLORS.primaryLight,
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: 10,
  },
  helpTitle: { fontSize: 15, fontWeight: '800', color: COLORS.primary, marginBottom: 10 },
  helpText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500', marginBottom: 6 },
  helpClose: { fontSize: 13, fontWeight: '700', color: COLORS.primary, marginTop: 8, textAlign: 'right' },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  versionLogo: {
    width: 28,
    height: 28,
    borderRadius: 8,
    opacity: 0.55,
  },
  versionText: { fontSize: 13, fontWeight: '800', color: COLORS.textSecondary },
  versionSub: { fontSize: 10, color: COLORS.textMuted, marginTop: 2, fontWeight: '600' },
  logoutBtn: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: COLORS.accentCoral,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  logoutText: { fontSize: 15, fontWeight: '800', color: COLORS.accentCoral },
});
