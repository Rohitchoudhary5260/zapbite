import React, { createContext, useContext, useMemo, useState } from 'react';
import { ZapApi } from '../services/api';
import { BillSummary, CartItem, Coupon, Product } from '../types';

interface CartContextType {
  cartItems: CartItem[];
  totalItemCount: number;
  billSummary: BillSummary;
  appliedCoupon: Coupon | null;
  tip: number;
  deliveryInstructions: string[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  getItemQuantity: (productId: string) => number;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  setTip: (amount: number) => void;
  toggleDeliveryInstruction: (instruction: string) => void;
  reorderItems: (items: any[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    // Seed initial demo items for instant rich UI look
    {
      product: {
        id: 'prod_1',
        name: 'Amul Taaza Homogenised Toned Milk',
        category: 'cat_dairy_breakfast',
        categoryName: 'Dairy & Bread',
        price: 27,
        mrp: 30,
        discount: 10,
        unit: '500 ml',
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=60',
        rating: 4.8,
        ratingCount: 1420,
        isVeg: true,
        etaMinutes: 8,
        bestseller: true,
        description: 'Fresh toned milk',
      },
      quantity: 2,
    },
    {
      product: {
        id: 'prod_9',
        name: "Lay's India's Magic Masala Chips",
        category: 'cat_munchies',
        categoryName: 'Munchies & Chips',
        price: 20,
        mrp: 20,
        discount: 0,
        unit: '48 g',
        image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=60',
        rating: 4.9,
        ratingCount: 5420,
        isVeg: true,
        etaMinutes: 7,
        bestseller: true,
        description: 'Magic masala potato chips',
      },
      quantity: 1,
    },
  ]);

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [tip, setTip] = useState<number>(10);
  const [deliveryInstructions, setDeliveryInstructions] = useState<string[]>(['Don\'t ring bell 🔕']);

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const getItemQuantity = (productId: string): number => {
    const found = cartItems.find(item => item.product.id === productId);
    return found ? found.quantity : 0;
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
    setCouponDiscount(0);
  };

  const applyCoupon = async (code: string) => {
    const itemTotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const res = await ZapApi.applyCoupon(code, itemTotal);
    if (res.success && res.coupon) {
      setAppliedCoupon(res.coupon);
      setCouponDiscount(res.discount);
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
  };

  const toggleDeliveryInstruction = (instruction: string) => {
    setDeliveryInstructions(prev =>
      prev.includes(instruction) ? prev.filter(i => i !== instruction) : [...prev, instruction]
    );
  };

  const reorderItems = (items: any[]) => {
    const newCart: CartItem[] = items.map(it => ({
      product: {
        id: it.id,
        name: it.name,
        category: 'cat_dairy_breakfast',
        categoryName: 'General',
        price: it.price,
        mrp: it.price + 5,
        discount: 5,
        unit: it.unit || '1 pc',
        image: it.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
        rating: 4.8,
        ratingCount: 100,
        isVeg: true,
        etaMinutes: 10,
        bestseller: false,
        description: it.name,
      },
      quantity: it.quantity || 1,
    }));
    setCartItems(newCart);
  };

  const totalItemCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  const billSummary: BillSummary = useMemo(() => {
    const itemTotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const mrpTotal = cartItems.reduce((acc, item) => acc + item.product.mrp * item.quantity, 0);
    const productSavings = Math.max(0, mrpTotal - itemTotal);

    // Free delivery for orders above ₹199 or if coupon applied
    const isFreeDelivery = itemTotal >= 199 || appliedCoupon?.type === 'free_delivery';
    const deliveryFee = itemTotal === 0 ? 0 : isFreeDelivery ? 0 : 25;
    const handlingFee = itemTotal === 0 ? 0 : 4;
    const effectiveDiscount = appliedCoupon?.type === 'free_delivery' ? 0 : couponDiscount;

    const grandTotal = Math.max(0, itemTotal + deliveryFee + handlingFee + tip - effectiveDiscount);
    const savingsTotal = productSavings + effectiveDiscount + (isFreeDelivery && itemTotal > 0 ? 25 : 0);

    return {
      itemTotal,
      deliveryFee,
      handlingFee,
      tip,
      discount: effectiveDiscount,
      grandTotal,
      savingsTotal,
    };
  }, [cartItems, appliedCoupon, couponDiscount, tip]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItemCount,
        billSummary,
        appliedCoupon,
        tip,
        deliveryInstructions,
        addToCart,
        removeFromCart,
        updateQuantity,
        getItemQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        setTip,
        toggleDeliveryInstruction,
        reorderItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
