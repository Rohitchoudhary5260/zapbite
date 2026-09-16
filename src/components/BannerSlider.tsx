import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS, SHADOWS } from '../theme/colors';
import { Banner } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface BannerSliderProps {
  banners: Banner[];
}

export const BannerSlider: React.FC<BannerSliderProps> = ({ banners }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (banners.length <= 1) return;
    timerRef.current = setInterval(() => {
      setActiveIndex(prev => {
        const next = (prev + 1) % banners.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 3500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [banners.length]);

  const handleScroll = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 32));
    setActiveIndex(idx);
  };

  const renderBanner = ({ item }: { item: Banner }) => (
    <TouchableOpacity activeOpacity={0.9} style={[styles.bannerCard, { backgroundColor: item.bgColor }]}>
      <View style={styles.bannerContent}>
        <View style={styles.bannerTag}>
          <Text style={styles.bannerTagText}>{item.tag}</Text>
        </View>
        <Text style={styles.bannerDiscount}>{item.discount}</Text>
        <Text style={styles.bannerTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.bannerSubtitle} numberOfLines={2}>{item.subtitle}</Text>
        <View style={[styles.bannerCta, { backgroundColor: item.accentColor }]}>
          <Text style={styles.bannerCtaText}>{item.cta} →</Text>
        </View>
      </View>
      <View style={styles.bannerIllustration}>
        <Text style={styles.illustrationEmoji}>
          {item.id === 'ban_1' ? '⚡🛵' : item.id === 'ban_2' ? '🥛🍳' : item.id === 'ban_3' ? '🍟🍺' : '🥦🍎'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={banners}
        renderItem={renderBanner}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        snapToInterval={SCREEN_WIDTH - 32}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        initialNumToRender={2}
      />
      {/* Dots indicator */}
      <View style={styles.dotsRow}>
        {banners.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === activeIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  bannerCard: {
    width: SCREEN_WIDTH - 32,
    height: 150,
    borderRadius: 18,
    marginRight: 0,
    flexDirection: 'row',
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  bannerContent: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  bannerTag: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  bannerTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  bannerDiscount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  bannerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.95)',
    lineHeight: 16,
  },
  bannerSubtitle: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 13,
  },
  bannerCta: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 4,
  },
  bannerCtaText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: 0.3,
  },
  bannerIllustration: {
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  illustrationEmoji: {
    fontSize: 42,
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    backgroundColor: COLORS.primary,
    width: 16,
  },
});
