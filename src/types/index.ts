export interface Product {
  id: string;
  name: string;
  category: string;
  categoryName: string;
  price: number;
  mrp: number;
  discount: number;
  unit: string;
  image: string;
  rating: number;
  ratingCount: number;
  isVeg: boolean;
  etaMinutes: number;
  bestseller: boolean;
  description: string;
  tags?: string[];
  brand?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  badge: string;
  itemCount: number;
  image: string;
  color: string;
  accentColor: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  discount: string;
  cta: string;
  tag: string;
  bgColor: string;
  accentColor: string;
  image: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface BillSummary {
  itemTotal: number;
  deliveryFee: number;
  handlingFee: number;
  tip: number;
  discount: number;
  grandTotal: number;
  savingsTotal: number;
}

export type OrderStatus = 'PLACED' | 'PACKED' | 'PICKED_UP' | 'ON_THE_WAY' | 'DELIVERED' | 'CANCELLED';

export interface DeliveryPartner {
  name: string;
  phone: string;
  vehicle: string;
  rating: number;
  deliveriesCount: number;
}

export interface Address {
  id?: string;
  _id?: string;
  tag: 'Home' | 'Work' | 'Other';
  line1: string;
  line2?: string;
  city: string;
  pincode: string;
  isDefault?: boolean;
}

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  deliveryEtaMinutes: number;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    unit: string;
    image: string;
  }[];
  bill: BillSummary;
  paymentMethod: string;
  paymentStatus: 'PAID' | 'PENDING';
  deliveryAddress: Address;
  deliveryInstructions: string[];
  deliveryPartner: DeliveryPartner;
}

export interface Coupon {
  code: string;
  title: string;
  description: string;
  discountAmount?: number;
  discountPercent?: number;
  maxDiscount?: number;
  minOrderValue: number;
  type: 'flat' | 'percent' | 'free_delivery';
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  walletBalance: number;
  addresses: Address[];
}

export type NavTab = 'home' | 'categories' | 'search' | 'orders' | 'profile' | 'cart';

export type AppMode = 'customer' | 'rider' | 'admin';

export interface Rider {
  id?: string;
  _id?: string;
  riderId: string;
  name: string;
  phone: string;
  vehicleNumber: string;
  vehicleType: 'Bike' | 'Scooter' | 'EV' | 'Bicycle';
  city: string;
  isOnline: boolean;
  status: 'available' | 'on_delivery' | 'offline';
  rating: number;
  totalDeliveries: number;
  totalEarnings: number;
  todayEarnings: number;
  payoutBalance: number;
  joinedAt?: string;
}

export interface AdminStats {
  totalProducts: number;
  totalUsers: number;
  totalSales: number;
  todaySales: number;
  totalOrders: number;
  deliveredOrdersCount: number;
  pendingOrdersCount: number;
  totalRiders: number;
  activeRidersCount: number;
}
