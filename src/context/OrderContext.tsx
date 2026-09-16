import React, { createContext, useContext, useEffect, useState } from 'react';
import { ZapApi } from '../services/api';
import { Address, BillSummary, Order, OrderStatus } from '../types';

interface OrderContextType {
  orders: Order[];
  activeOrder: Order | null;
  setActiveOrder: (order: Order | null) => void;
  placeOrder: (params: {
    items: { id: string; name: string; price: number; quantity: number; unit: string; image: string }[];
    bill: BillSummary;
    paymentMethod: string;
    deliveryAddress: Address;
    deliveryInstructions: string[];
    tip: number;
  }) => Promise<Order>;
  cancelOrder: (orderId: string) => Promise<boolean>;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  const refreshOrders = async () => {
    const list = await ZapApi.getOrders();
    setOrders(list);
    const active = list.find(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
    if (active && !activeOrder) {
      setActiveOrder(active);
    }
  };

  useEffect(() => {
    refreshOrders();
  }, []);

  // Live order progress simulation timer
  useEffect(() => {
    if (!activeOrder || activeOrder.status === 'DELIVERED' || activeOrder.status === 'CANCELLED') {
      return;
    }

    const timer = setInterval(() => {
      setActiveOrder(prev => {
        if (!prev || prev.status === 'DELIVERED' || prev.status === 'CANCELLED') {
          return prev;
        }

        let nextStatus: OrderStatus = prev.status;
        let nextEta = prev.deliveryEtaMinutes;

        if (prev.status === 'PLACED') {
          nextStatus = 'PACKED';
          nextEta = 8;
        } else if (prev.status === 'PACKED') {
          nextStatus = 'PICKED_UP';
          nextEta = 6;
        } else if (prev.status === 'PICKED_UP') {
          nextStatus = 'ON_THE_WAY';
          nextEta = 3;
        } else if (prev.status === 'ON_THE_WAY') {
          if (nextEta > 1) {
            nextEta -= 1;
          } else {
            nextStatus = 'DELIVERED';
            nextEta = 0;
          }
        }

        const updated: Order = {
          ...prev,
          status: nextStatus,
          deliveryEtaMinutes: nextEta,
        };

        // Also update in orders list
        setOrders(curr => curr.map(o => (o.id === updated.id ? updated : o)));

        return updated;
      });
    }, 6000); // Progress every 6 seconds for delightful live demo feedback

    return () => clearInterval(timer);
  }, [activeOrder?.id, activeOrder?.status]);

  const placeOrder = async (params: {
    items: { id: string; name: string; price: number; quantity: number; unit: string; image: string }[];
    bill: BillSummary;
    paymentMethod: string;
    deliveryAddress: Address;
    deliveryInstructions: string[];
    tip: number;
  }): Promise<Order> => {
    const res = await ZapApi.createOrder(params);
    setActiveOrder(res.order);
    setOrders(prev => [res.order, ...prev]);
    return res.order;
  };

  const cancelOrder = async (orderId: string): Promise<boolean> => {
    const success = await ZapApi.cancelOrder(orderId);
    if (success) {
      if (activeOrder?.id === orderId) {
        setActiveOrder(prev => (prev ? { ...prev, status: 'CANCELLED' } : null));
      }
      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, status: 'CANCELLED' as OrderStatus } : o))
      );
    }
    return success;
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        activeOrder,
        setActiveOrder,
        placeOrder,
        cancelOrder,
        refreshOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
