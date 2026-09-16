import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { BannerSlider } from '../components/BannerSlider';
import { FloatingCartBar } from '../components/FloatingCartBar';
import { ProductCard } from '../components/ProductCard';
import { ZapApi } from '../services/api';
import { COLORS, SHADOWS } from '../theme/colors';
import { Banner, Category, NavTab, Product } from '../types';

interface HomeScreenProps {
  onTabChange: (tab: NavTab) => void;
  onOpenRider?: () => void;
}

const TRENDING_SEARCHES = ['Amul Milk', 'Aashirvaad Atta', 'Maggi', 'Paneer', 'Tata Salt', 'Lay\'s', 'Good Day', 'Dettol'];

export default function HomeScreen({ onTabChange, onOpenRider }: HomeScreenProps) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [b, c, p] = await Promise.all([
      ZapApi.getBanners(),
      ZapApi.getCategories(),
      ZapApi.getProducts({ limit: 100 }),
    ]);
    setBanners(b);
    setCategories(c);
    setAllProducts(p);
    setLoading(false);
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!text.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      const results = await ZapApi.getProducts({ search: text, limit: 50 });
      setSearchResults(results);
      setSearching(false);
    }, 250);
  };

  // Categorized product shelves from 1000+ MongoDB products
  const lightningDeals = allProducts.filter(p => p.discount >= 20).slice(0, 10);
  const dairyItems = allProducts.filter(p => p.category === 'dairy_bread' || p.categoryName.includes('Dairy')).slice(0, 10);
  const freshProduce = allProducts.filter(p => p.category === 'vegetables' || p.category === 'fruits').slice(0, 10);
  const kitchenEssentials = allProducts.filter(p => p.category === 'atta_rice_dal' || p.category === 'oils_masalas').slice(0, 10);
  const munchies = allProducts.filter(p => p.category === 'munchies' || p.category === 'bakery_biscuits').slice(0, 10);
  const instantAndDrinks = allProducts.filter(p => p.category === 'instant_food' || p.category === 'tea_coffee').slice(0, 10);

  if (loading) {
    return (
      <View style={styles.loader}>
        <Text style={styles.loaderZap}>⚡</Text>
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 12 }} />
        <Text style={styles.loaderText}>Loading 1,000+ Pure Veg Products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <AppHeader
        onPressAddress={() => onTabChange('profile')}
        onPressProfile={() => onTabChange('profile')}
        onPressRider={onOpenRider}
      />

      {/* Search Bar with Trending Chips */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder='Search "Atta, Milk, Maggi, Paneer..."'
            placeholderTextColor={COLORS.textMuted}
            value={searchText}
            onChangeText={handleSearch}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchText(''); setSearchResults([]); }}>
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Trending Keywords Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.trendingScroll}
          contentContainerStyle={{ paddingVertical: 4 }}
        >
          {TRENDING_SEARCHES.map(item => (
            <TouchableOpacity
              key={item}
              style={styles.trendingChip}
              onPress={() => handleSearch(item)}
              activeOpacity={0.8}
            >
              <Text style={styles.trendingChipText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Search Results View */}
      {searchText.length > 0 ? (
        <View style={styles.searchResultsContainer}>
          {searching ? (
            <ActivityIndicator color={COLORS.primary} style={{ marginTop: 24 }} />
          ) : searchResults.length === 0 ? (
            <View style={styles.emptySearch}>
              <Text style={styles.emptyEmoji}>📦</Text>
              <Text style={styles.emptyText}>No items found for "{searchText}"</Text>
              <Text style={styles.emptySubText}>Try searching for Amul, Atta, Maggi or Chips</Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={item => item.id}
              numColumns={2}
              columnWrapperStyle={styles.productGrid}
              renderItem={({ item }) => (
                <View style={styles.gridItemWrapper}>
                  <ProductCard product={item} variant="grid" />
                </View>
              )}
              contentContainerStyle={{ padding: 12, paddingBottom: 160 }}
              ListHeaderComponent={
                <Text style={styles.resultsCountHeader}>
                  ⚡ {searchResults.length} Products Found in Catalog
                </Text>
              }
            />
          )}
        </View>
      ) : (
        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* Pure Veg Guarantee Trust Banner */}
          <View style={styles.trustBanner}>
            <View style={styles.trustLeft}>
              <Text style={styles.trustIcon}>🥦</Text>
              <View>
                <Text style={styles.trustTitle}>100% Pure Vegetarian</Text>
                <Text style={styles.trustSub}>Every food & grocery item is certified pure veg</Text>
              </View>
            </View>
            <View style={styles.trustBadge}>
              <Text style={styles.trustBadgeText}>SUPERFAST ⚡</Text>
            </View>
          </View>

          {/* Banner Carousel */}
          <BannerSlider banners={banners} />

          {/* Quick Categories Grid */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>🛍️ Explore Categories</Text>
              <Text style={styles.sectionSub}>15 Pure Veg Departments</Text>
            </View>
            <TouchableOpacity onPress={() => onTabChange('categories')} activeOpacity={0.7}>
              <Text style={styles.seeAll}>See All 15 ›</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryPill, { backgroundColor: cat.color || '#F0FFF4' }]}
                onPress={() => onTabChange('categories')}
                activeOpacity={0.8}
              >
                <Text style={styles.categoryPillIcon}>{cat.icon || '🛒'}</Text>
                <Text style={[styles.categoryPillText, { color: cat.accentColor || COLORS.primary }]} numberOfLines={2}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* 1. Lightning Deals Shelf */}
          <ProductShelf
            title="⚡ Lightning Super Deals"
            badge="UP TO 40% OFF"
            subtitle="Best prices on daily staples"
            products={lightningDeals}
          />

          {/* 2. Dairy & Morning Breakfast */}
          <ProductShelf
            title="🥛 Dairy, Bread & Breakfast"
            badge="MORNING FRESH"
            subtitle="Amul milk, butter, fresh paneer & dahi"
            products={dairyItems}
          />

          {/* 3. Fresh Sabzi & Fruits */}
          <ProductShelf
            title="🥦 Farm Fresh Vegetables & Fruits"
            badge="MANDI FRESH"
            subtitle="Handpicked fresh every morning"
            products={freshProduce}
          />

          {/* 4. Kitchen Ration & Monthly Stock */}
          <ProductShelf
            title="🌾 Atta, Rice, Dal & Cooking Oils"
            badge="MONTHLY RATION"
            subtitle="Aashirvaad, Tata Sampann & Fortune"
            products={kitchenEssentials}
          />

          {/* 5. Munchies & Namkeen */}
          <ProductShelf
            title="🍟 Chips, Namkeen & Biscuits"
            badge="PARTY CRUNCH"
            subtitle="Lay's, Haldiram's, Kurkure & Oreo"
            products={munchies}
          />

          {/* 6. Instant Food & Drinks */}
          <ProductShelf
            title="🍜 Maggi, Chai & Cold Drinks"
            badge="IN 8 MINS"
            subtitle="Instant cravings delivered superfast"
            products={instantAndDrinks}
          />

          {/* Bottom Free Delivery Guarantee */}
          <View style={styles.bottomPromoCard}>
            <Text style={styles.bottomPromoEmoji}>🚚</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.bottomPromoTitle}>Free Delivery on ₹199+</Text>
              <Text style={styles.bottomPromoSub}>Use coupon ZAP100 for flat ₹100 off on ₹299+</Text>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Sticky Floating Cart */}
      <FloatingCartBar onPress={() => onTabChange('cart')} />
    </View>
  );
}

function ProductShelf({ title, badge, subtitle, products }: { title: string; badge?: string; subtitle: string; products: Product[] }) {
  if (!products.length) return null;
  return (
    <View style={styles.shelf}>
      <View style={styles.shelfHeader}>
        <View style={{ flex: 1 }}>
          <View style={styles.shelfTitleRow}>
            <Text style={styles.shelfTitle}>{title}</Text>
            {badge && (
              <View style={styles.shelfBadge}>
                <Text style={styles.shelfBadgeText}>{badge}</Text>
              </View>
            )}
          </View>
          <Text style={styles.shelfSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <FlatList
        data={products}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => <ProductCard product={item} />}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loaderZap: {
    fontSize: 48,
  },
  loaderText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  searchWrapper: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  searchBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    ...SHADOWS.small,
  },
  searchIcon: { fontSize: 15, marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    height: '100%',
  },
  clearText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMuted,
    paddingHorizontal: 6,
  },
  trendingScroll: {
    marginTop: 6,
  },
  trendingChip: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  trendingChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  searchResultsContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  resultsCountHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  emptySearch: {
    alignItems: 'center',
    marginTop: 60,
    padding: 24,
  },
  emptyEmoji: { fontSize: 52 },
  emptyText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  productGrid: {
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  gridItemWrapper: {
    flex: 1,
    maxWidth: '48.5%',
  },
  scrollContent: {
    flex: 1,
  },
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FFF4',
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 6,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00D26A',
  },
  trustLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  trustIcon: {
    fontSize: 22,
    marginRight: 8,
  },
  trustTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.primary,
  },
  trustSub: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  trustBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  trustBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  sectionSub: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 1,
  },
  seeAll: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  categoryScroll: {
    paddingLeft: 14,
    marginBottom: 8,
  },
  categoryPill: {
    width: 82,
    height: 82,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    ...SHADOWS.small,
  },
  categoryPillIcon: { fontSize: 26, marginBottom: 4 },
  categoryPillText: {
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 13,
  },
  shelf: {
    marginVertical: 10,
  },
  shelfHeader: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  shelfTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shelfTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  shelfBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  shelfBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#B45309',
  },
  shelfSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  bottomPromoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FFF4',
    marginHorizontal: 14,
    marginTop: 16,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  bottomPromoEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  bottomPromoTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.primary,
  },
  bottomPromoSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
});
