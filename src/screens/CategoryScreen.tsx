import React, { useEffect, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FloatingCartBar } from '../components/FloatingCartBar';
import { ProductCard } from '../components/ProductCard';
import { ZapApi } from '../services/api';
import { COLORS, SHADOWS } from '../theme/colors';
import { Category, NavTab, Product } from '../types';

interface CategoryScreenProps {
  onTabChange: (tab: NavTab) => void;
}

export default function CategoryScreen({ onTabChange }: CategoryScreenProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [vegOnly, setVegOnly] = useState(false);

  useEffect(() => {
    ZapApi.getCategories().then(cats => {
      setCategories(cats);
    });
    loadProducts('all');
  }, []);

  const loadProducts = async (catId: string) => {
    const params = catId === 'all' ? { vegOnly } : { category: catId, vegOnly };
    const items = await ZapApi.getProducts(params);
    setProducts(items);
  };

  const handleCatSelect = (id: string) => {
    setSelectedCatId(id);
    loadProducts(id);
  };

  const handleVegToggle = () => {
    const next = !vegOnly;
    setVegOnly(next);
    const params = selectedCatId === 'all' ? { vegOnly: next } : { category: selectedCatId, vegOnly: next };
    ZapApi.getProducts(params).then(setProducts);
  };

  const ALL_CATS = [{ id: 'all', name: 'All', icon: '🛒', color: '#F0FFF4', accentColor: COLORS.primary } as any, ...categories];

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚡ Explore</Text>
        <TouchableOpacity
          style={[styles.vegToggle, vegOnly && styles.vegToggleActive]}
          onPress={handleVegToggle}
          activeOpacity={0.8}
        >
          <View style={[styles.vegDot, { backgroundColor: COLORS.vegGreen }]} />
          <Text style={[styles.vegToggleText, vegOnly && styles.vegToggleTextActive]}>Veg Only</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Sidebar categories */}
        <View style={styles.sidebar}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {ALL_CATS.map(cat => {
              const isActive = selectedCatId === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.sidebarItem, isActive && styles.sidebarItemActive]}
                  onPress={() => handleCatSelect(cat.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.sidebarIcon}>{cat.icon || '🛒'}</Text>
                  <Text
                    style={[styles.sidebarText, isActive && styles.sidebarTextActive]}
                    numberOfLines={2}
                  >
                    {cat.name}
                  </Text>
                  {isActive && <View style={styles.activePill} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Product Grid */}
        <View style={styles.productsContainer}>
          {products.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📦</Text>
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          ) : (
            <FlatList
              data={products}
              keyExtractor={item => item.id}
              numColumns={2}
              columnWrapperStyle={styles.colWrapper}
              contentContainerStyle={{ padding: 8, paddingBottom: 160 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.gridItem}>
                  <ProductCard product={item} variant="grid" />
                </View>
              )}
              ListHeaderComponent={
                <Text style={styles.productCount}>
                  ⚡ {products.length} Items in Category
                </Text>
              }
            />
          )}
        </View>
      </View>

      <FloatingCartBar onPress={() => onTabChange('cart')} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textLight,
  },
  vegToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  vegToggleActive: {
    backgroundColor: '#FFFFFF',
  },
  vegDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
    marginRight: 6,
  },
  vegToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  vegToggleTextActive: {
    color: COLORS.vegGreen,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 90,
    backgroundColor: COLORS.surface,
    borderRightWidth: 1,
    borderRightColor: COLORS.borderLight,
  },
  sidebarItem: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
    position: 'relative',
  },
  sidebarItemActive: {
    backgroundColor: COLORS.primaryLight,
  },
  activePill: {
    position: 'absolute',
    left: 0,
    top: '20%',
    width: 4,
    height: '60%',
    backgroundColor: COLORS.primary,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  sidebarIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  sidebarText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 13,
  },
  sidebarTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  productsContainer: { flex: 1 },
  colWrapper: {
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  gridItem: {
    flex: 1,
    maxWidth: '48.5%',
  },
  productCount: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '800',
    marginBottom: 8,
    paddingLeft: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyEmoji: { fontSize: 48 },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
});
