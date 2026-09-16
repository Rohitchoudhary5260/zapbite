import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { COLORS, SHADOWS } from '../theme/colors';
import { NavTab } from '../types';

interface FloatingCartBarProps {
  onPress: () => void;
}

export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({ onPress }) => {
  const { totalItemCount, billSummary } = useCart();

  if (totalItemCount === 0) {
    return null;
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.leftSection}>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{totalItemCount}</Text>
        </View>
        <Text style={styles.itemsLabel}>
          {totalItemCount === 1 ? '1 item' : `${totalItemCount} items`}
        </Text>
      </View>
      <Text style={styles.totalText}>₹{billSummary.grandTotal.toFixed(0)}</Text>
      <View style={styles.rightSection}>
        <Text style={styles.ctaText}>View Cart →</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 70,
    left: 16,
    right: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...SHADOWS.floating,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 8,
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  countText: {
    color: COLORS.textLight,
    fontWeight: '900',
    fontSize: 12,
  },
  itemsLabel: {
    color: COLORS.textLight,
    fontWeight: '700',
    fontSize: 13,
  },
  totalText: {
    color: COLORS.textLight,
    fontWeight: '900',
    fontSize: 15,
    marginHorizontal: 8,
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  ctaText: {
    color: '#A7F3D0',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.3,
  },
});
