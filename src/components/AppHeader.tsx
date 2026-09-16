import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS, SHADOWS } from '../theme/colors';

const LOGO_IMG = require('../assets/images/logo.png');

interface AppHeaderProps {
  onPressAddress?: () => void;
  onPressProfile?: () => void;
  onPressRider?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onPressAddress, onPressProfile, onPressRider }) => {
  const { user, selectedAddress } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {/* Brand Logo & Badges */}
        <View style={styles.brandContainer}>
          <Image source={LOGO_IMG} style={styles.logoImage} resizeMode="cover" />
          <View style={styles.brandTextBox}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>Zap<Text style={styles.logoTextHighlight}>tite</Text></Text>
              <View style={styles.vegHeaderBadge}>
                <Text style={styles.vegBadgeText}>100% VEG</Text>
              </View>
            </View>
            <View style={styles.etaRow}>
              <View style={styles.pulsingDot} />
              <Text style={styles.etaText}>10 MINS SUPERFAST</Text>
            </View>
          </View>
        </View>

        {/* Right actions: Rider App Switcher + Profile */}
        <View style={styles.rightActionsRow}>
          {onPressRider && (
            <TouchableOpacity
              style={styles.riderPillBtn}
              onPress={onPressRider}
              activeOpacity={0.8}
            >
              <Text style={styles.riderPillText}>🚴 Rider</Text>
            </TouchableOpacity>
          )}

          {/* Profile Avatar */}
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={onPressProfile}
            activeOpacity={0.8}
          >
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'R'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Address / Location Selector */}
      <TouchableOpacity
        style={styles.addressBar}
        onPress={onPressAddress}
        activeOpacity={0.7}
      >
        <Text style={styles.pinIcon}>📍</Text>
        <View style={styles.addressTextContainer}>
          <View style={styles.addressTitleRow}>
            <Text style={styles.addressTag}>
              {selectedAddress?.tag || 'Home'}
            </Text>
            <Text style={styles.chevron}>▾</Text>
          </View>
          <Text style={styles.addressSubtitle} numberOfLines={1}>
            {selectedAddress ? `${selectedAddress.line1}, ${selectedAddress.city}` : 'Select your delivery address'}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...SHADOWS.medium,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoImage: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  brandTextBox: {
    justifyContent: 'center',
  },
  logoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textLight,
    letterSpacing: -0.5,
  },
  logoTextHighlight: {
    color: '#A7F3D0',
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00FF7F',
    marginRight: 4,
  },
  etaText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#A7F3D0',
    letterSpacing: 0.5,
  },
  vegHeaderBadge: {
    backgroundColor: '#00592E',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#00D26A',
  },
  vegBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#A7F3D0',
    letterSpacing: 0.3,
  },
  rightActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  riderPillBtn: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  riderPillText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  profileBtn: {
    padding: 2,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#A7F3D0',
  },
  avatarInitial: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  addressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  pinIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  addressTextContainer: {
    flex: 1,
  },
  addressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressTag: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textLight,
    marginRight: 4,
  },
  chevron: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '700',
  },
  addressSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 1,
  },
});
