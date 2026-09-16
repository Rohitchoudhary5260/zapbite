import React from 'react';
import {
  Image,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { COLORS, SHADOWS } from '../theme/colors';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  variant?: 'shelf' | 'grid';
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  variant = 'shelf',
  style,
  onPress,
}) => {
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const qty = getItemQuantity(product.id);

  const isGrid = variant === 'grid';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isGrid ? styles.cardGrid : styles.cardShelf,
        style,
      ]}
      activeOpacity={0.92}
      onPress={onPress}
    >
      {/* Top badges: Discount & Veg Dot */}
      <View style={styles.badgeRow}>
        {product.discount > 0 ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{product.discount}% OFF</Text>
          </View>
        ) : (
          <View />
        )}
        <View style={styles.vegIndicator}>
          <View style={[styles.vegDot, { backgroundColor: product.isVeg ? COLORS.vegGreen : COLORS.nonVegRed }]} />
        </View>
      </View>

      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.etaPill}>
          <Text style={styles.etaText}>⚡ {product.etaMinutes || 10} MINS</Text>
        </View>
      </View>

      {/* Brand & Name */}
      {product.brand ? (
        <Text style={styles.brandText} numberOfLines={1}>
          {product.brand}
        </Text>
      ) : null}

      <Text style={styles.productName} numberOfLines={2}>
        {product.name}
      </Text>

      {/* Unit */}
      <Text style={styles.unitText}>{product.unit}</Text>

      {/* Price Row + ADD button */}
      <View style={styles.priceRow}>
        <View style={styles.priceBox}>
          <Text style={styles.price}>₹{product.price}</Text>
          {product.mrp > product.price && (
            <Text style={styles.mrp}>₹{product.mrp}</Text>
          )}
        </View>

        {qty === 0 ? (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => addToCart(product)}
            activeOpacity={0.8}
          >
            <Text style={styles.addBtnText}>ADD</Text>
            <Text style={styles.addPlus}>+</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.qtyContainer}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => updateQuantity(product.id, qty - 1)}
              activeOpacity={0.7}
            >
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyCount}>{qty}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => updateQuantity(product.id, qty + 1)}
              activeOpacity={0.7}
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 9,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    ...SHADOWS.small,
  },
  cardShelf: {
    width: 152,
    marginRight: 10,
  },
  cardGrid: {
    width: '100%',
    marginRight: 0,
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    minHeight: 18,
  },
  discountBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  discountText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#B45309',
    letterSpacing: 0.2,
  },
  vegIndicator: {
    width: 13,
    height: 13,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: COLORS.vegGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vegDot: {
    width: 5,
    height: 5,
    borderRadius: 2,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 105,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
    marginBottom: 6,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  etaPill: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  etaText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  brandText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  productName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
    lineHeight: 15,
    minHeight: 30,
  },
  unitText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 6,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  priceBox: {
    flex: 1,
  },
  price: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  mrp: {
    fontSize: 10,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  addPlus: {
    color: '#A7F3D0',
    fontWeight: '900',
    fontSize: 12,
    marginLeft: 2,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    overflow: 'hidden',
  },
  qtyBtn: {
    width: 24,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primaryDark,
  },
  qtyBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
    lineHeight: 16,
  },
  qtyCount: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
    paddingHorizontal: 6,
    minWidth: 18,
    textAlign: 'center',
  },
});
