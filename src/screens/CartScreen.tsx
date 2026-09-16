import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useOrder } from '../context/OrderContext';
import { COLORS, SHADOWS } from '../theme/colors';
import { NavTab } from '../types';

interface CartScreenProps {
  onTabChange: (tab: NavTab) => void;
  onOrderSuccess?: (orderId: string) => void;
}

const DELIVERY_INSTRUCTIONS = [
  "Don't ring bell 🔕",
  "Leave at door 🚪",
  "Contactless delivery 🤝",
  "Call on arrival 📞",
];

const TIP_OPTIONS = [0, 10, 20, 30];

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI', icon: '📲', sub: 'PhonePe, GPay, Paytm' },
  { id: 'cod', label: 'Cash on Delivery', icon: '💵', sub: 'Pay when delivered' },
  { id: 'card', label: 'Credit / Debit Card', icon: '💳', sub: 'Visa, Mastercard, RuPay' },
];

export default function CartScreen({ onTabChange, onOrderSuccess }: CartScreenProps) {
  const { cartItems, billSummary, updateQuantity, removeFromCart, appliedCoupon, applyCoupon, removeCoupon, tip, setTip, deliveryInstructions, toggleDeliveryInstruction, clearCart } = useCart();
  const { selectedAddress, user } = useAuth();
  const { placeOrder } = useOrder();
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('upi');
  const [placing, setPlacing] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponMessage('');
    const res = await applyCoupon(couponInput.trim());
    setCouponMessage(res.message);
    setCouponLoading(false);
    if (res.success) setCouponInput('');
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Cart is Empty', 'Add some items to your cart first!');
      return;
    }
    setPlacing(true);
    try {
      const items = cartItems.map(ci => ({
        id: ci.product.id,
        name: ci.product.name,
        price: ci.product.price,
        quantity: ci.quantity,
        unit: ci.product.unit,
        image: ci.product.image,
      }));

      const payLabel = PAYMENT_METHODS.find(p => p.id === selectedPayment)?.label || 'UPI';
      const order = await placeOrder({
        items,
        bill: billSummary,
        paymentMethod: payLabel,
        deliveryAddress: selectedAddress || user?.addresses[0]!,
        deliveryInstructions,
        tip,
      });
      clearCart();
      if (onOrderSuccess) {
        onOrderSuccess(order.id);
      }
    } catch (e) {
      Alert.alert('Order Failed', 'Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyRoot}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🛒 My Cart</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty!</Text>
          <Text style={styles.emptySubtitle}>Add items from the Zaptite store</Text>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => onTabChange('home')}
            activeOpacity={0.8}
          >
            <Text style={styles.shopBtnText}>Start Shopping ⚡</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🛒 My Cart</Text>
        <Text style={styles.headerCount}>{cartItems.reduce((a, b) => a + b.quantity, 0)} items</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Delivery ETA Banner */}
        <View style={styles.etaBanner}>
          <Text style={styles.etaEmoji}>⚡</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.etaTitle}>Delivery in 10 minutes</Text>
            <Text style={styles.etaSubtitle}>
              {selectedAddress ? `${selectedAddress.tag} · ${selectedAddress.line1}` : 'Select an address'}
            </Text>
          </View>
          <View style={styles.pureVegCartBadge}>
            <Text style={styles.pureVegCartText}>🥦 100% VEG</Text>
          </View>
        </View>

        {/* Free Delivery Milestone Progress */}
        <View style={styles.freeShipGoalCard}>
          {billSummary.itemTotal >= 199 ? (
            <View style={styles.freeShipUnlocked}>
              <Text style={styles.freeShipUnlockedIcon}>🎉</Text>
              <Text style={styles.freeShipUnlockedText}>You unlocked <Text style={{ fontWeight: '900' }}>FREE Delivery</Text> on this order!</Text>
            </View>
          ) : (
            <View>
              <View style={styles.freeShipRow}>
                <Text style={styles.freeShipText}>
                  Add <Text style={{ fontWeight: '900', color: COLORS.primary }}>₹{199 - billSummary.itemTotal}</Text> more for <Text style={{ fontWeight: '900' }}>FREE Delivery</Text> 🚚
                </Text>
                <Text style={styles.freeShipPercent}>{Math.round((billSummary.itemTotal / 199) * 100)}%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${Math.min(100, Math.round((billSummary.itemTotal / 199) * 100))}%` }]} />
              </View>
            </View>
          )}
        </View>

        {/* Cart Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items in your cart</Text>
          {cartItems.map((item, idx) => (
            <View key={item.product.id || (item.product as any)._id || `cart_item_${idx}`} style={styles.cartItem}>
              <View style={styles.cartItemLeft}>
                <View style={[styles.vegIndicator, { borderColor: item.product.isVeg ? COLORS.vegGreen : COLORS.nonVegRed }]}>
                  <View style={[styles.vegDot, { backgroundColor: item.product.isVeg ? COLORS.vegGreen : COLORS.nonVegRed }]} />
                </View>
                <View style={styles.cartItemInfo}>
                  <Text style={styles.cartItemName} numberOfLines={2}>{item.product.name}</Text>
                  <Text style={styles.cartItemUnit}>{item.product.unit}</Text>
                  <Text style={styles.cartItemPrice}>₹{item.product.price}</Text>
                </View>
              </View>
              <View style={styles.qtyControls}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.qtyBtnText}>{item.quantity === 1 ? '🗑' : '−'}</Text>
                </TouchableOpacity>
                <Text style={styles.qtyCount}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Delivery Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Instructions</Text>
          <View style={styles.instructionsGrid}>
            {DELIVERY_INSTRUCTIONS.map(instr => {
              const active = deliveryInstructions.includes(instr);
              return (
                <TouchableOpacity
                  key={instr}
                  style={[styles.instrChip, active && styles.instrChipActive]}
                  onPress={() => toggleDeliveryInstruction(instr)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.instrChipText, active && styles.instrChipTextActive]} numberOfLines={1}>
                    {instr}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Tip Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tip for your delivery partner 🙏</Text>
          <Text style={styles.tipSubtitle}>100% of the tip goes to your delivery partner</Text>
          <View style={styles.tipRow}>
            {TIP_OPTIONS.map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.tipBtn, tip === t && styles.tipBtnActive]}
                onPress={() => setTip(t)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tipBtnText, tip === t && styles.tipBtnTextActive]}>
                  {t === 0 ? 'None' : `₹${t}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Coupon */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎟 Coupon Code</Text>
          {appliedCoupon ? (
            <View style={styles.appliedCouponCard}>
              <View style={styles.appliedCouponLeft}>
                <Text style={styles.appliedCouponIcon}>✅</Text>
                <View>
                  <Text style={styles.appliedCouponCode}>{appliedCoupon.code} applied!</Text>
                  <Text style={styles.appliedCouponTitle}>{appliedCoupon.title}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={removeCoupon}>
                <Text style={styles.removeCouponText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.couponInputRow}>
                <TextInput
                  style={styles.couponInput}
                  placeholder="Enter coupon code (try ZAP100)"
                  placeholderTextColor={COLORS.textMuted}
                  value={couponInput}
                  onChangeText={setCouponInput}
                  autoCapitalize="characters"
                />
                <TouchableOpacity
                  style={styles.couponApplyBtn}
                  onPress={handleApplyCoupon}
                  disabled={couponLoading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.couponApplyText}>{couponLoading ? '...' : 'Apply'}</Text>
                </TouchableOpacity>
              </View>
              {couponMessage ? (
                <Text style={[styles.couponMsg, couponMessage.includes('applied') ? styles.couponMsgSuccess : styles.couponMsgError]}>
                  {couponMessage}
                </Text>
              ) : null}
              <View style={styles.couponHints}>
                {['ZAP100', 'FREESHIP', 'WELCOME50'].map(code => (
                  <TouchableOpacity
                    key={code}
                    style={styles.couponHintChip}
                    onPress={() => setCouponInput(code)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.couponHintText}>{code}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>

        {/* Bill Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Bill Summary</Text>
          <View style={styles.billCard}>
            <BillRow label="Item Total" value={`₹${billSummary.itemTotal}`} />
            <BillRow label="Delivery Fee" value={billSummary.deliveryFee === 0 ? 'FREE 🎉' : `₹${billSummary.deliveryFee}`} valueColor={billSummary.deliveryFee === 0 ? COLORS.vegGreen : COLORS.textPrimary} />
            <BillRow label="Handling Fee" value={`₹${billSummary.handlingFee}`} />
            {tip > 0 && <BillRow label="Delivery Tip 🙏" value={`₹${tip}`} />}
            {billSummary.discount > 0 && (
              <BillRow label={`Coupon (${appliedCoupon?.code})`} value={`−₹${billSummary.discount}`} valueColor={COLORS.primary} />
            )}
            <View style={styles.billDivider} />
            <View style={styles.billTotalRow}>
              <Text style={styles.billTotalLabel}>Grand Total</Text>
              <Text style={styles.billTotalValue}>₹{billSummary.grandTotal.toFixed(0)}</Text>
            </View>
            {billSummary.savingsTotal > 0 && (
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsText}>
                  🎉 Total Savings: ₹{billSummary.savingsTotal.toFixed(0)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 Payment Method</Text>
          {PAYMENT_METHODS.map(pm => (
            <TouchableOpacity
              key={pm.id}
              style={[styles.paymentOption, selectedPayment === pm.id && styles.paymentOptionActive]}
              onPress={() => setSelectedPayment(pm.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.paymentIcon}>{pm.icon}</Text>
              <View style={styles.paymentInfo}>
                <Text style={[styles.paymentLabel, selectedPayment === pm.id && styles.paymentLabelActive]}>
                  {pm.label}
                </Text>
                <Text style={styles.paymentSub}>{pm.sub}</Text>
              </View>
              <View style={[styles.radioOuter, selectedPayment === pm.id && styles.radioOuterActive]}>
                {selectedPayment === pm.id && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.placeOrderContainer}>
        <TouchableOpacity
          style={[styles.placeOrderBtn, placing && styles.placeOrderBtnDisabled]}
          onPress={handlePlaceOrder}
          activeOpacity={0.85}
          disabled={placing}
        >
          <View style={styles.placeOrderLeft}>
            <Text style={styles.placeOrderItems}>{cartItems.reduce((a, b) => a + b.quantity, 0)} items · ₹{billSummary.grandTotal.toFixed(0)}</Text>
          </View>
          <Text style={styles.placeOrderText}>
            {placing ? '⚡ Placing...' : '⚡ Place Order'}
          </Text>
          <Text style={styles.placeOrderArrow}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function BillRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.billRow}>
      <Text style={styles.billRowLabel}>{label}</Text>
      <Text style={[styles.billRowValue, valueColor ? { color: valueColor } : {}]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  emptyRoot: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: COLORS.textLight },
  headerCount: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  scrollView: { flex: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyEmoji: { fontSize: 72, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: COLORS.textMuted, marginBottom: 24, textAlign: 'center' },
  shopBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14, ...SHADOWS.medium },
  shopBtnText: { color: COLORS.textLight, fontWeight: '800', fontSize: 15, letterSpacing: 0.3 },
  etaBanner: {
    backgroundColor: COLORS.primaryLight,
    margin: 16,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  etaEmoji: { fontSize: 28, marginRight: 12 },
  etaTitle: { fontSize: 14, fontWeight: '800', color: COLORS.primary },
  etaSubtitle: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  pureVegCartBadge: {
    backgroundColor: '#00592E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginLeft: 8,
  },
  pureVegCartText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#A7F3D0',
  },
  freeShipGoalCard: {
    backgroundColor: '#F0FFF4',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#00D26A',
  },
  freeShipUnlocked: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  freeShipUnlockedIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  freeShipUnlockedText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  freeShipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  freeShipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  freeShipPercent: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#DCFCE7',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  section: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    padding: 16,
    ...SHADOWS.small,
  },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 12 },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  cartItemLeft: { flexDirection: 'row', flex: 1, alignItems: 'flex-start' },
  vegIndicator: { width: 14, height: 14, borderRadius: 3, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center', marginTop: 2, marginRight: 10 },
  vegDot: { width: 6, height: 6, borderRadius: 3 },
  cartItemInfo: { flex: 1, marginRight: 8 },
  cartItemName: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, lineHeight: 17 },
  cartItemUnit: { fontSize: 11, color: COLORS.textMuted, marginTop: 2, fontWeight: '500' },
  cartItemPrice: { fontSize: 13, fontWeight: '800', color: COLORS.textPrimary, marginTop: 4 },
  qtyControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: 8, overflow: 'hidden' },
  qtyBtn: { width: 28, height: 30, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primaryDark },
  qtyBtnText: { color: COLORS.textLight, fontWeight: '900', fontSize: 14 },
  qtyCount: { color: COLORS.textLight, fontWeight: '900', fontSize: 13, paddingHorizontal: 10, minWidth: 24, textAlign: 'center' },
  instructionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  instrChip: { borderWidth: 1.5, borderColor: COLORS.border, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  instrChipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  instrChipText: { fontSize: 11, fontWeight: '600', color: COLORS.textSecondary },
  instrChipTextActive: { color: COLORS.primary, fontWeight: '800' },
  tipSubtitle: { fontSize: 11, color: COLORS.textMuted, marginBottom: 10, marginTop: -8, fontWeight: '500' },
  tipRow: { flexDirection: 'row', gap: 8 },
  tipBtn: { flex: 1, borderWidth: 1.5, borderColor: COLORS.border, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  tipBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  tipBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
  tipBtnTextActive: { color: COLORS.primary, fontWeight: '900' },
  couponInputRow: { flexDirection: 'row', gap: 8 },
  couponInput: { flex: 1, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 12, fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, height: 42 },
  couponApplyBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 18, borderRadius: 10, justifyContent: 'center' },
  couponApplyText: { color: COLORS.textLight, fontWeight: '800', fontSize: 13 },
  couponMsg: { fontSize: 12, fontWeight: '600', marginTop: 8 },
  couponMsgSuccess: { color: COLORS.primary },
  couponMsgError: { color: COLORS.accentCoral },
  couponHints: { flexDirection: 'row', gap: 8, marginTop: 10 },
  couponHintChip: { backgroundColor: COLORS.badgeBg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
  couponHintText: { fontSize: 11, fontWeight: '800', color: COLORS.badgeText },
  appliedCouponCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.primaryLight, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: COLORS.primary },
  appliedCouponLeft: { flexDirection: 'row', alignItems: 'center' },
  appliedCouponIcon: { fontSize: 18, marginRight: 8 },
  appliedCouponCode: { fontSize: 13, fontWeight: '800', color: COLORS.primary },
  appliedCouponTitle: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  removeCouponText: { fontSize: 12, fontWeight: '700', color: COLORS.accentCoral },
  billCard: {},
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  billRowLabel: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  billRowValue: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  billDivider: { height: 1, backgroundColor: COLORS.borderLight, marginVertical: 10 },
  billTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  billTotalLabel: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary },
  billTotalValue: { fontSize: 17, fontWeight: '900', color: COLORS.textPrimary },
  savingsBadge: { marginTop: 10, backgroundColor: '#F0FFF4', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: COLORS.primary },
  savingsText: { fontSize: 12, fontWeight: '700', color: COLORS.primary, textAlign: 'center' },
  paymentOption: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border, marginBottom: 10 },
  paymentOptionActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  paymentIcon: { fontSize: 24, marginRight: 12 },
  paymentInfo: { flex: 1 },
  paymentLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  paymentLabelActive: { color: COLORS.primary },
  paymentSub: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  radioOuter: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  radioOuterActive: { borderColor: COLORS.primary },
  radioInner: { width: 9, height: 9, borderRadius: 5, backgroundColor: COLORS.primary },
  placeOrderContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    ...SHADOWS.large,
  },
  placeOrderBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOWS.floating,
  },
  placeOrderBtnDisabled: { opacity: 0.7 },
  placeOrderLeft: {},
  placeOrderItems: { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },
  placeOrderText: { fontSize: 16, fontWeight: '900', color: COLORS.textLight, letterSpacing: 0.5 },
  placeOrderArrow: { fontSize: 18, color: '#A7F3D0', fontWeight: '900' },
});
