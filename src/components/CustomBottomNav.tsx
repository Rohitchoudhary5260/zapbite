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

interface CustomBottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  hasActiveOrder?: boolean;
}

const NAV_ITEMS: { id: NavTab; icon: string; label: string }[] = [
  { id: 'home', icon: '🏠', label: 'Home' },
  { id: 'categories', icon: '⚡', label: 'Explore' },
  { id: 'search', icon: '🔍', label: 'Search' },
  { id: 'orders', icon: '📦', label: 'Orders' },
  { id: 'profile', icon: '👤', label: 'Profile' },
];

export const CustomBottomNav: React.FC<CustomBottomNavProps> = ({
  activeTab,
  onTabChange,
  hasActiveOrder,
}) => {
  const { totalItemCount } = useCart();

  return (
    <View style={styles.container}>
      {NAV_ITEMS.map(item => {
        const isActive = activeTab === item.id;
        const showCartBadge = item.id === 'orders' && hasActiveOrder;

        return (
          <TouchableOpacity
            key={item.id}
            style={styles.tabItem}
            onPress={() => onTabChange(item.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, isActive && styles.iconWrapperActive]}>
              <Text style={styles.icon}>{item.icon}</Text>
              {showCartBadge && (
                <View style={styles.activeBadge} />
              )}
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingBottom: 6,
    paddingTop: 8,
    ...SHADOWS.large,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    position: 'relative',
    width: 40,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginBottom: 2,
  },
  iconWrapperActive: {
    backgroundColor: COLORS.primaryLight,
  },
  icon: {
    fontSize: 18,
  },
  activeBadge: {
    position: 'absolute',
    top: 4,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accentCoral,
    borderWidth: 1.5,
    borderColor: COLORS.surface,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 0.2,
  },
  labelActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
});
