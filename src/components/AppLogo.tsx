import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../theme/colors';

const LOGO_IMG = require('../assets/images/logo.png');

interface AppLogoProps {
  size?: 'small' | 'medium' | 'large';
  showSubtitle?: boolean;
  lightMode?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'medium',
  showSubtitle = true,
  lightMode = false,
}) => {
  const iconSize = size === 'small' ? 32 : size === 'large' ? 84 : 44;
  const titleSize = size === 'small' ? 16 : size === 'large' ? 32 : 22;

  return (
    <View style={styles.container}>
      <Image
        source={LOGO_IMG}
        style={{ width: iconSize, height: iconSize, borderRadius: iconSize * 0.26 }}
        resizeMode="cover"
      />
      <View style={styles.textContainer}>
        <View style={styles.titleRow}>
          <Text style={[styles.titleMain, { fontSize: titleSize, color: lightMode ? COLORS.textPrimary : '#FFFFFF' }]}>
            Zap<Text style={{ color: lightMode ? COLORS.primary : '#A7F3D0' }}>tite</Text>
          </Text>
          <View style={[styles.vegBadge, lightMode ? styles.vegBadgeLight : styles.vegBadgeDark]}>
            <Text style={styles.vegBadgeText}>🥦 100% VEG</Text>
          </View>
        </View>
        {showSubtitle && (
          <Text style={[styles.subtitle, { color: lightMode ? COLORS.textMuted : 'rgba(255,255,255,0.85)' }]}>
            ⚡ 10-Min Pure Veg Delivery
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  textContainer: {
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  titleMain: {
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  vegBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  vegBadgeDark: {
    backgroundColor: '#00592E',
    borderWidth: 1,
    borderColor: '#00D26A',
  },
  vegBadgeLight: {
    backgroundColor: '#F0FFF4',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  vegBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#00D26A',
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
});
