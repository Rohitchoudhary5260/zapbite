import { Platform } from 'react-native';
import { Banner, Category, Coupon, Order, Product, User } from '../types';
import {
  INITIAL_ORDERS,
  INITIAL_USER,
  MOCK_BANNERS,
  MOCK_CATEGORIES,
  MOCK_COUPONS,
  MOCK_PRODUCTS,
} from './mockData';

// Local replicas for offline safety
let localProducts: Product[] = [...MOCK_PRODUCTS];
let localCategories: Category[] = [...MOCK_CATEGORIES];
let localBanners: Banner[] = [...MOCK_BANNERS];
let localCoupons: Coupon[] = [...MOCK_COUPONS];
let localOrders: Order[] = [...INITIAL_ORDERS];
let localUser: User = { ...INITIAL_USER };

const BASE_URL = 'https://rider-kceb.onrender.com/api';
const TIMEOUT_MS = 6000;

async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export const ZapApi = {
  // Categories
  async getCategories(): Promise<Category[]> {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/categories`);
      if (res.ok) {
        const data = await res.json();
        if (data.categories && data.categories.length > 0) {
          localCategories = data.categories;
          return data.categories;
        }
      }
    } catch {
      // Offline fallback
    }
    return localCategories;
  },

  // Banners
  async getBanners(): Promise<Banner[]> {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/banners`);
      if (res.ok) {
        const data = await res.json();
        if (data.banners && data.banners.length > 0) {
          localBanners = data.banners;
          return data.banners;
        }
      }
    } catch {
      // Offline fallback
    }
    return localBanners;
  },

  // Products with MongoDB search & pagination
  async getProducts(params?: { category?: string; search?: string; vegOnly?: boolean; sort?: string; limit?: number }): Promise<Product[]> {
    try {
      const query = new URLSearchParams();
      if (params?.category) query.append('category', params.category);
      if (params?.search) query.append('search', params.search);
      if (params?.vegOnly !== undefined) query.append('vegOnly', 'true');
      if (params?.sort) query.append('sort', params.sort);
      if (params?.limit) query.append('limit', String(params.limit));

      const res = await fetchWithTimeout(`${BASE_URL}/products?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.products && data.products.length > 0) {
          return data.products;
        }
      }
    } catch {
      // Fallback to local memory filter
    }

    let result = [...localProducts];
    if (params?.category && params.category !== 'all') {
      result = result.filter(p => p.category === params.category);
    }
    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags?.some((t: string) => t.toLowerCase().includes(q))
      );
    }
    if (params?.vegOnly) {
      result = result.filter(p => p.isVeg);
    }
    if (params?.sort === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (params?.sort === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (params?.sort === 'discount') {
      result.sort((a, b) => b.discount - a.discount);
    }
    return result;
  },

  // Single Product
  async getProductById(id: string): Promise<Product | undefined> {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/products/${id}`);
      if (res.ok) {
        const data = await res.json();
        return data.product;
      }
    } catch {
      // Fallback
    }
    return localProducts.find(p => p.id === id);
  },

  // Coupons
  async getCoupons(): Promise<Coupon[]> {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/coupons`);
      if (res.ok) {
        const data = await res.json();
        return data.coupons || localCoupons;
      }
    } catch {
      // Fallback
    }
    return localCoupons;
  },

  async applyCoupon(code: string, orderAmount: number): Promise<{ success: boolean; discount: number; message: string; coupon?: Coupon }> {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/coupons/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, orderAmount }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    const coupon = localCoupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
    if (!coupon) {
      return { success: false, discount: 0, message: 'Invalid coupon code. Try ZAP100 or FREESHIP' };
    }
    if (orderAmount < coupon.minOrderValue) {
      return {
        success: false,
        discount: 0,
        message: `Min order amount for ${coupon.code} is ₹${coupon.minOrderValue}`,
      };
    }
    let discount = coupon.discountAmount || 0;
    if (coupon.type === 'percent') {
      discount = Math.min((orderAmount * (coupon.discountPercent || 0)) / 100, coupon.maxDiscount || 100);
    }
    return {
      success: true,
      discount: Math.round(discount),
      message: `Coupon ${coupon.code} applied! Saved ₹${Math.round(discount)}`,
      coupon,
    };
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/orders`);
      if (res.ok) {
        const data = await res.json();
        if (data.orders && data.orders.length > 0) {
          localOrders = data.orders;
          return data.orders;
        }
      }
    } catch {
      // Fallback
    }
    return localOrders;
  },

  async createOrder(orderPayload: Partial<Order>): Promise<{ success: boolean; order: Order; message: string }> {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          localOrders = [data.order, ...localOrders];
          return data;
        }
      }
    } catch {
      // Fallback
    }

    const randomId = `ZB-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    const newOrder: Order = {
      id: randomId,
      createdAt: new Date().toISOString(),
      status: 'PLACED',
      deliveryEtaMinutes: 10,
      items: orderPayload.items || [],
      bill: orderPayload.bill || {
        itemTotal: 0,
        deliveryFee: 0,
        handlingFee: 4,
        tip: 0,
        discount: 0,
        grandTotal: 0,
        savingsTotal: 0,
      },
      paymentMethod: orderPayload.paymentMethod || 'UPI',
      paymentStatus: orderPayload.paymentMethod === 'Cash on Delivery' ? 'PENDING' : 'PAID',
      deliveryAddress: orderPayload.deliveryAddress || localUser.addresses[0],
      deliveryInstructions: orderPayload.deliveryInstructions || [],
      deliveryPartner: {
        name: 'Amit Kumar',
        phone: '+91 98112 34567',
        vehicle: 'Hero Splendor (DL 3S CD 8912)',
        rating: 4.9,
        deliveriesCount: 1140,
      },
    };

    localOrders = [newOrder, ...localOrders];
    return {
      success: true,
      order: newOrder,
      message: 'Order placed successfully! Arriving in 10 minutes.',
    };
  },

  async cancelOrder(orderId: string): Promise<boolean> {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/orders/${orderId}/cancel`, {
        method: 'POST',
      });
      if (res.ok) {
        return true;
      }
    } catch {
      // Fallback
    }
    const idx = localOrders.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      localOrders[idx] = { ...localOrders[idx], status: 'CANCELLED' };
      return true;
    }
    return false;
  },

  // Auth
  async checkUser(phone: string): Promise<{ success: boolean; exists: boolean; message: string; user?: any }> {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/auth/check-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    const exists = phone === '9876543210' || (localUser && localUser.phone === phone);
    return {
      success: true,
      exists,
      message: exists ? 'Welcome back!' : 'New user',
      user: exists ? localUser : undefined,
    };
  },

  async signup(data: { phone: string; name: string; email?: string; referralCode?: string; city?: string; addressLine?: string }): Promise<{ success: boolean; demoOtp: string; message: string; alreadyExists?: boolean; user?: User }> {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        return await res.json();
      }
      const err = await res.json();
      return err;
    } catch {
      // Fallback
    }

    localUser = {
      id: 'user_' + Date.now(),
      name: data.name,
      phone: data.phone,
      email: data.email || '',
      walletBalance: 250,
      addresses: [
        {
          id: 'addr_1',
          tag: 'Home',
          line1: data.addressLine || 'Flat 101, Green Heights',
          city: data.city || 'New Delhi',
          pincode: '110001',
          isDefault: true,
        },
      ],
    };

    return {
      success: true,
      demoOtp: '123456',
      message: `🎉 Account created! Welcome bonus ₹250 credited. OTP sent to +91 ${data.phone}`,
      user: localUser,
    };
  },

  async login(phone: string): Promise<{ success: boolean; demoOtp: string; message: string; isNewUser?: boolean }> {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return {
      success: true,
      demoOtp: '123456',
      message: `OTP sent to +91 ${phone}. Use 123456 for demo.`,
    };
  },

  async verifyOtp(phone: string, otp: string): Promise<{ success: boolean; user: User; message: string }> {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      if (res.ok) {
        const data = await res.json();
        localUser = data.user;
        return data;
      }
    } catch {
      // Fallback
    }

    if (/^\d{6}$/.test(otp)) {
      localUser = { ...localUser, phone };
      return {
        success: true,
        user: localUser,
        message: 'Login successful!',
      };
    }
    throw new Error('Please enter a valid 6-digit OTP code.');
  },

  async getUser(): Promise<User> {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/auth/profile`);
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          localUser = data.user;
          return data.user;
        }
      }
    } catch {
      // Fallback
    }
    return localUser;
  },

  async updateUser(user: Partial<User>): Promise<User> {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          localUser = data.user;
          return data.user;
        }
      }
    } catch {
      // Fallback
    }
    localUser = { ...localUser, ...user };
    return localUser;
  },

  async addAddress(phone: string, address: any): Promise<any> {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/auth/address`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, address }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
  },

  // ================= RIDER METHODS =================
  async registerRider(data: { name: string; phone: string; vehicleNumber: string; vehicleType: string; city: string }): Promise<any> {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/riders/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (err: any) {
      const randomNum = Math.floor(100 + Math.random() * 900);
      return {
        success: true,
        message: `🎉 Rider ID RID-${randomNum} created successfully!`,
        rider: {
          riderId: `RID-${randomNum}`,
          name: data.name,
          phone: data.phone,
          vehicleNumber: data.vehicleNumber.toUpperCase(),
          vehicleType: data.vehicleType || 'Bike',
          city: data.city || 'Delhi NCR',
          isOnline: true,
          status: 'available',
          rating: 5.0,
          totalDeliveries: 0,
          totalEarnings: 100,
          todayEarnings: 100,
          payoutBalance: 100,
        }
      };
    }
  },

  async loginRider(phone: string): Promise<any> {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/riders/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      return await res.json();
    } catch (err: any) {
      return {
        success: true,
        message: 'Welcome back!',
        rider: {
          riderId: 'RID-101',
          name: 'Vikram Singh',
          phone,
          vehicleNumber: 'DL 04 AB 8812',
          vehicleType: 'Bike',
          city: 'Delhi NCR',
          isOnline: true,
          status: 'available',
          rating: 4.9,
          totalDeliveries: 34,
          totalEarnings: 2040,
          todayEarnings: 360,
          payoutBalance: 1200,
        }
      };
    }
  },

  async getRiderOrders(riderId: string): Promise<any> {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/riders/${riderId}/orders`);
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return {
      success: true,
      activeOrders: [],
      availableOrders: [
        {
          id: 'ZB-5901-DEL',
          status: 'PACKED',
          bill: { grandTotal: 310 },
          items: [{ name: 'Amul Taaza Milk 500ml', quantity: 2 }, { name: 'Fresh Potato 1kg', quantity: 2 }],
          deliveryAddress: { line1: 'Flat 402, Royal Palms Heights, Sector 62', city: 'Noida' },
        }
      ],
      completedOrders: [],
      deliveryPayoutPerOrder: 60,
    };
  },

  async toggleRiderDuty(riderId: string, isOnline: boolean): Promise<any> {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/riders/${riderId}/duty`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline }),
      });
      return await res.json();
    } catch {
      return { success: true, isOnline };
    }
  },

  async acceptRiderOrder(riderId: string, orderId: string): Promise<any> {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/riders/${riderId}/accept/${orderId}`, {
        method: 'POST',
      });
      return await res.json();
    } catch {
      return { success: true, message: `Order #${orderId} accepted!` };
    }
  },

  async updateRiderOrderStatus(riderId: string, orderId: string, nextStatus: string): Promise<any> {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/riders/${riderId}/order-status/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nextStatus }),
      });
      return await res.json();
    } catch {
      return { success: true, message: 'Status updated!' };
    }
  },

  async getRiderEarnings(riderId: string): Promise<any> {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/riders/${riderId}/earnings`);
      return await res.json();
    } catch {
      return {
        success: true,
        earnings: {
          totalEarnings: 2040,
          todayEarnings: 360,
          payoutBalance: 1200,
          totalDeliveries: 34,
          ratePerOrder: 60,
          rating: 4.9,
        }
      };
    }
  },

  async requestRiderPayout(riderId: string, upiId: string): Promise<any> {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/riders/${riderId}/payout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upiId }),
      });
      return await res.json();
    } catch {
      return {
        success: true,
        message: `✅ ₹1200 Payout transferred to ${upiId || 'Linked UPI ID'}!`,
        txnId: `PAY-ZB-${Math.floor(100000 + Math.random() * 900000)}`,
      };
    }
  },

  // ================= ADMIN METHODS =================
  async getAdminStats(): Promise<any> {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/admin/stats`);
      return await res.json();
    } catch {
      return {
        success: true,
        stats: {
          totalProducts: 1020,
          totalUsers: 18,
          totalSales: 28450,
          todaySales: 6890,
          totalOrders: 92,
          deliveredOrdersCount: 78,
          pendingOrdersCount: 14,
          totalRiders: 3,
          activeRidersCount: 2,
        },
        riders: [
          { riderId: 'RID-101', name: 'Vikram Singh', phone: '9812345671', vehicleNumber: 'DL 04 AB 8812', totalDeliveries: 34, totalEarnings: 2040, todayEarnings: 360, status: 'available', isOnline: true, rating: 4.9 },
          { riderId: 'RID-102', name: 'Rohit Sharma', phone: '9812345672', vehicleNumber: 'DL 08 CD 4321', totalDeliveries: 28, totalEarnings: 1680, todayEarnings: 240, status: 'on_delivery', isOnline: true, rating: 4.85 },
          { riderId: 'RID-103', name: 'Amit Verma', phone: '9812345673', vehicleNumber: 'DL 03 EF 9920', totalDeliveries: 45, totalEarnings: 2700, todayEarnings: 420, status: 'offline', isOnline: false, rating: 4.95 },
        ],
        recentOrders: [],
      };
    }
  },

  async getAdminOrders(): Promise<any> {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/admin/orders`);
      return await res.json();
    } catch {
      return { success: true, orders: localOrders };
    }
  },

  async assignRiderToOrder(orderId: string, riderId: string): Promise<any> {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/admin/orders/${orderId}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riderId }),
      });
      return await res.json();
    } catch {
      return { success: true, message: `Rider assigned to order #${orderId}` };
    }
  },
};
