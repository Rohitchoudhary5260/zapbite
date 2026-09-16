import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CustomBottomNav } from './src/components/CustomBottomNav';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { OrderProvider, useOrder } from './src/context/OrderContext';
import CartScreen from './src/screens/CartScreen';
import CategoryScreen from './src/screens/CategoryScreen';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { COLORS } from './src/theme/colors';
import { NavTab } from './src/types';

const LOGO_IMG = require('./src/assets/images/logo.png');

/**
 * Zaptite Premium Startup Splash Screen
 */
function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [scaleAnim] = useState(new Animated.Value(0.85));
  const [opacityAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      onFinish();
    }, 1600);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.splashContainer}>
      <Animated.View
        style={[
          styles.splashContent,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image source={LOGO_IMG} style={styles.splashLogo} resizeMode="contain" />
        <View style={styles.splashBrandRow}>
          <Text style={styles.splashBrandText}>
            Zap<Text style={styles.splashBrandMint}>tite</Text>
          </Text>
          <View style={styles.splashVegBadge}>
            <Text style={styles.splashVegText}>🥦 100% VEG</Text>
          </View>
        </View>
        <Text style={styles.splashTagline}>⚡ 10-Minute Superfast Grocery Delivery</Text>

        <ActivityIndicator size="small" color="#A7F3D0" style={{ marginTop: 28 }} />
      </Animated.View>

      <View style={styles.splashFooter}>
        <Text style={styles.splashFooterText}>Fresh • Pure • Lightning Fast</Text>
      </View>
    </View>
  );
}

/**
 * Zaptite Customer App Navigator
 * 100% Pure Customer Grocery Delivery App
 */
function CustomerNavigator() {
  const { isAuthenticated } = useAuth();
  const { activeOrder } = useOrder();
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  // If customer is not authenticated, show customer login
  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={() => {}} />;
  }

  const handleOrderSuccess = (orderId: string) => {
    setActiveOrderId(orderId);
    setActiveTab('orders');
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen onTabChange={setActiveTab} />;
      case 'categories':
        return <CategoryScreen onTabChange={setActiveTab} />;
      case 'search':
        return <HomeScreen onTabChange={setActiveTab} />;
      case 'cart':
        return (
          <CartScreen
            onTabChange={tab => setActiveTab(tab)}
            onOrderSuccess={handleOrderSuccess}
          />
        );
      case 'orders':
        return (
          <OrdersScreen
            onTabChange={setActiveTab}
            activeOrderId={activeOrderId}
          />
        );
      case 'profile':
        return <ProfileScreen onTabChange={setActiveTab} />;
      default:
        return <HomeScreen onTabChange={setActiveTab} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.screenContainer}>{renderScreen()}</View>

      {/* Bottom Navigation */}
      <CustomBottomNav
        activeTab={activeTab}
        onTabChange={tab => {
          setActiveOrderId(null);
          setActiveTab(tab);
        }}
        hasActiveOrder={!!activeOrder && activeOrder.status !== 'DELIVERED' && activeOrder.status !== 'CANCELLED'}
      />
    </View>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <AuthProvider>
          <CartProvider>
            <OrderProvider>
              {showSplash ? (
                <SplashScreen onFinish={() => setShowSplash(false)} />
              ) : (
                <CustomerNavigator />
              )}
            </OrderProvider>
          </CartProvider>
        </AuthProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  splashContainer: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  splashLogo: {
    width: 130,
    height: 130,
    borderRadius: 30,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  splashBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  splashBrandText: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  splashBrandMint: {
    color: '#A7F3D0',
  },
  splashVegBadge: {
    backgroundColor: '#00592E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00D26A',
  },
  splashVegText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#00D26A',
  },
  splashTagline: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D1FAE5',
    textAlign: 'center',
  },
  splashFooter: {
    position: 'absolute',
    bottom: 30,
  },
  splashFooterText: {
    fontSize: 12,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.65)',
    letterSpacing: 1,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screenContainer: {
    flex: 1,
  },
});
