import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useOrder } from '../context/OrderContext';
import { COLORS, SHADOWS } from '../theme/colors';
import { NavTab, Order, OrderStatus } from '../types';

interface OrdersScreenProps {
  onTabChange: (tab: NavTab) => void;
  activeOrderId?: string | null;
}

const STATUS_STAGES: OrderStatus[] = ['PLACED', 'PACKED', 'PICKED_UP', 'ON_THE_WAY', 'DELIVERED'];
const STATUS_LABELS: Record<OrderStatus, string> = {
  PLACED: 'Order Placed',
  PACKED: 'Order Packed',
  PICKED_UP: 'Picked Up',
  ON_THE_WAY: 'On the Way',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};
const STATUS_EMOJIS: Record<OrderStatus, string> = {
  PLACED: '📋',
  PACKED: '📦',
  PICKED_UP: '🛵',
  ON_THE_WAY: '🚀',
  DELIVERED: '✅',
  CANCELLED: '❌',
};
const STATUS_COLORS: Record<OrderStatus, string> = {
  PLACED: '#FF9F1C',
  PACKED: '#0284C7',
  PICKED_UP: '#7C3AED',
  ON_THE_WAY: '#0C8346',
  DELIVERED: '#0C8346',
  CANCELLED: '#DC2626',
};

export default function OrdersScreen({ onTabChange, activeOrderId }: OrdersScreenProps) {
  const { orders, activeOrder, cancelOrder, refreshOrders } = useOrder();
  const [showTracker, setShowTracker] = useState<string | null>(activeOrderId || null);

  useEffect(() => {
    refreshOrders();
  }, []);

  useEffect(() => {
    if (activeOrderId) {
      setShowTracker(activeOrderId);
    }
  }, [activeOrderId]);

  const trackerOrder = showTracker ? orders.find(o => o.id === showTracker) || activeOrder : null;

  const handleCancel = (orderId: string) => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          await cancelOrder(orderId);
          setShowTracker(null);
        },
      },
    ]);
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📦 My Orders</Text>
        {showTracker && (
          <TouchableOpacity onPress={() => setShowTracker(null)}>
            <Text style={styles.backBtn}>← All Orders</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Live Order Tracker */}
      {trackerOrder && trackerOrder.status !== 'DELIVERED' && trackerOrder.status !== 'CANCELLED' ? (
        <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 80 }}>
          <View style={styles.liveTrackerCard}>
            <View style={styles.liveHeader}>
              <View style={styles.liveDot} />
              <Text style={styles.liveTitle}>Live Tracking · {trackerOrder.id}</Text>
            </View>

            {/* ETA */}
            <View style={styles.etaBox}>
              <Text style={styles.etaMinutes}>{trackerOrder.deliveryEtaMinutes}</Text>
              <Text style={styles.etaLabel}>minutes{'\n'}away</Text>
              <View style={styles.etaDivider} />
              <Text style={styles.etaRider}>🛵 {trackerOrder.deliveryPartner.name}</Text>
            </View>

            {/* Progress Steps */}
            <View style={styles.stepsContainer}>
              {STATUS_STAGES.map((stage, idx) => {
                const stageIdx = STATUS_STAGES.indexOf(trackerOrder.status as OrderStatus);
                const isPast = idx <= stageIdx;
                const isCurrent = idx === stageIdx;
                return (
                  <View key={stage} style={styles.stepRow}>
                    <View style={styles.stepLeft}>
                      <View style={[styles.stepCircle, isPast && styles.stepCircleActive, isCurrent && styles.stepCircleCurrent]}>
                        <Text style={styles.stepEmoji}>{STATUS_EMOJIS[stage]}</Text>
                      </View>
                      {idx < STATUS_STAGES.length - 1 && (
                        <View style={[styles.stepLine, isPast && styles.stepLineActive]} />
                      )}
                    </View>
                    <View style={styles.stepInfo}>
                      <Text style={[styles.stepLabel, isCurrent && styles.stepLabelCurrent]}>
                        {STATUS_LABELS[stage]}
                      </Text>
                      {isCurrent && (
                        <Text style={styles.stepSub}>In progress...</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Rider Info */}
            <View style={styles.riderCard}>
              <View style={styles.riderAvatar}>
                <Text style={styles.riderAvatarText}>{trackerOrder.deliveryPartner.name.charAt(0)}</Text>
              </View>
              <View style={styles.riderInfo}>
                <Text style={styles.riderName}>{trackerOrder.deliveryPartner.name}</Text>
                <Text style={styles.riderVehicle}>{trackerOrder.deliveryPartner.vehicle}</Text>
                <Text style={styles.riderRating}>⭐ {trackerOrder.deliveryPartner.rating} · {trackerOrder.deliveryPartner.deliveriesCount} deliveries</Text>
              </View>
              <TouchableOpacity style={styles.callBtn}>
                <Text style={styles.callBtnText}>📞</Text>
              </TouchableOpacity>
            </View>

            {/* Cancel Order */}
            {trackerOrder.status === 'PLACED' && (
              <TouchableOpacity
                style={styles.cancelOrderBtn}
                onPress={() => handleCancel(trackerOrder.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelOrderText}>Cancel Order</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Order Summary */}
          <View style={styles.orderSummaryCard}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            {trackerOrder.items.map((item, idx) => (
              <View key={item.id || (item as any)._id || `order_item_${idx}`} style={styles.orderItem}>
                <Text style={styles.orderItemQty}>{item.quantity}×</Text>
                <Text style={styles.orderItemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.orderItemPrice}>₹{item.price * item.quantity}</Text>
              </View>
            ))}
            <View style={styles.billDivider} />
            <View style={styles.orderTotal}>
              <Text style={styles.orderTotalLabel}>Grand Total</Text>
              <Text style={styles.orderTotalValue}>₹{trackerOrder.bill.grandTotal}</Text>
            </View>
          </View>
        </ScrollView>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 80 }}>
          {/* Celebration when just delivered */}
          {trackerOrder?.status === 'DELIVERED' && (
            <View style={styles.deliveredBanner}>
              <Text style={styles.deliveredEmoji}>🎉</Text>
              <Text style={styles.deliveredTitle}>Order Delivered!</Text>
              <Text style={styles.deliveredSub}>Hope you loved your Zaptite delivery!</Text>
              <TouchableOpacity onPress={() => setShowTracker(null)}>
                <Text style={styles.viewHistoryBtn}>View Order History</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Orders List */}
          {orders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📦</Text>
              <Text style={styles.emptyTitle}>No orders yet</Text>
              <Text style={styles.emptySubtitle}>Start ordering from Zaptite!</Text>
              <TouchableOpacity style={styles.shopBtn} onPress={() => onTabChange('home')} activeOpacity={0.8}>
                <Text style={styles.shopBtnText}>Shop Now ⚡</Text>
              </TouchableOpacity>
            </View>
          ) : (
            orders.map((order, idx) => <OrderCard key={order.id || (order as any)._id || `order_${idx}`} order={order} onTrack={setShowTracker} />)
          )}
        </ScrollView>
      )}
    </View>
  );
}

function OrderCard({ order, onTrack }: { order: Order; onTrack: (id: string) => void }) {
  const isActive = order.status !== 'DELIVERED' && order.status !== 'CANCELLED';
  const statusColor = STATUS_COLORS[order.status] || COLORS.textMuted;

  return (
    <View style={styles.orderCard}>
      <View style={styles.orderCardHeader}>
        <View>
          <Text style={styles.orderId}>#{order.id}</Text>
          <Text style={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '22', borderColor: statusColor }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {STATUS_EMOJIS[order.status]} {STATUS_LABELS[order.status]}
          </Text>
        </View>
      </View>

      <View style={styles.orderItemsPreview}>
        {order.items.slice(0, 2).map((item, idx) => (
          <Text key={item.id || (item as any)._id || `prev_${idx}`} style={styles.orderItemPreviewText} numberOfLines={1}>
            {item.quantity}× {item.name}
          </Text>
        ))}
        {order.items.length > 2 && (
          <Text style={styles.moreItems}>+{order.items.length - 2} more items</Text>
        )}
      </View>

      <View style={styles.orderCardFooter}>
        <View>
          <Text style={styles.orderTotal2}>₹{order.bill.grandTotal}</Text>
          <Text style={styles.orderPayment}>{order.paymentMethod}</Text>
        </View>
        {isActive ? (
          <TouchableOpacity style={styles.trackBtn} onPress={() => onTrack(order.id)} activeOpacity={0.8}>
            <Text style={styles.trackBtnText}>Track Live →</Text>
          </TouchableOpacity>
        ) : order.status === 'DELIVERED' ? (
          <TouchableOpacity style={styles.reorderBtn} activeOpacity={0.8}>
            <Text style={styles.reorderBtnText}>Reorder ↩</Text>
          </TouchableOpacity>
        ) : null}
      </View>
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
  headerTitle: { fontSize: 20, fontWeight: '900', color: COLORS.textLight },
  backBtn: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.85)' },
  scroll: { flex: 1 },
  liveTrackerCard: {
    backgroundColor: COLORS.surface,
    margin: 16,
    borderRadius: 18,
    padding: 16,
    ...SHADOWS.medium,
  },
  liveHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#00CC66', marginRight: 8 },
  liveTitle: { fontSize: 13, fontWeight: '800', color: COLORS.textPrimary },
  etaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  etaMinutes: { fontSize: 44, fontWeight: '900', color: COLORS.primary, marginRight: 8 },
  etaLabel: { fontSize: 12, color: COLORS.primary, fontWeight: '700', lineHeight: 16 },
  etaDivider: { flex: 1 },
  etaRider: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary },
  stepsContainer: { marginBottom: 20 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  stepLeft: { alignItems: 'center', width: 40, marginRight: 12 },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  stepCircleActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  stepCircleCurrent: { backgroundColor: COLORS.primary, borderColor: COLORS.primaryDark },
  stepEmoji: { fontSize: 16 },
  stepLine: { width: 2, height: 28, backgroundColor: COLORS.border, marginTop: 2 },
  stepLineActive: { backgroundColor: COLORS.primary },
  stepInfo: { paddingVertical: 6 },
  stepLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  stepLabelCurrent: { color: COLORS.primary, fontWeight: '800' },
  stepSub: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  riderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  riderAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  riderAvatarText: { fontSize: 18, fontWeight: '900', color: COLORS.textLight },
  riderInfo: { flex: 1 },
  riderName: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
  riderVehicle: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  riderRating: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2, fontWeight: '600' },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callBtnText: { fontSize: 18 },
  cancelOrderBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.accentCoral,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  cancelOrderText: { fontSize: 13, fontWeight: '700', color: COLORS.accentCoral },
  orderSummaryCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 14,
    padding: 16,
    ...SHADOWS.small,
  },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 12 },
  orderItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  orderItemQty: { fontSize: 13, fontWeight: '700', color: COLORS.primary, width: 28 },
  orderItemName: { flex: 1, fontSize: 13, color: COLORS.textSecondary },
  orderItemPrice: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  billDivider: { height: 1, backgroundColor: COLORS.borderLight, marginVertical: 8 },
  orderTotal: { flexDirection: 'row', justifyContent: 'space-between' },
  orderTotalLabel: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
  orderTotalValue: { fontSize: 15, fontWeight: '900', color: COLORS.textPrimary },
  deliveredBanner: {
    backgroundColor: COLORS.primary,
    margin: 16,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
  },
  deliveredEmoji: { fontSize: 48, marginBottom: 8 },
  deliveredTitle: { fontSize: 22, fontWeight: '900', color: COLORS.textLight, marginBottom: 4 },
  deliveredSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 12, textAlign: 'center' },
  viewHistoryBtn: { fontSize: 13, fontWeight: '700', color: '#A7F3D0', textDecorationLine: 'underline' },
  emptyContainer: { alignItems: 'center', marginTop: 80, padding: 32 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: COLORS.textMuted, marginBottom: 24, textAlign: 'center' },
  shopBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14, ...SHADOWS.medium },
  shopBtnText: { color: COLORS.textLight, fontWeight: '800', fontSize: 15 },
  orderCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    padding: 14,
    ...SHADOWS.small,
  },
  orderCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  orderId: { fontSize: 13, fontWeight: '800', color: COLORS.textPrimary },
  orderDate: { fontSize: 11, color: COLORS.textMuted, marginTop: 2, fontWeight: '500' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.2 },
  orderItemsPreview: { marginBottom: 10 },
  orderItemPreviewText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500', marginBottom: 2 },
  moreItems: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  orderCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderTotal2: { fontSize: 15, fontWeight: '900', color: COLORS.textPrimary },
  orderPayment: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  trackBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  trackBtnText: { fontSize: 12, fontWeight: '800', color: COLORS.textLight },
  reorderBtn: { borderWidth: 1.5, borderColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  reorderBtnText: { fontSize: 12, fontWeight: '800', color: COLORS.primary },
});
