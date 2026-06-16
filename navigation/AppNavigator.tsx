import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AntDesign, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

// Client Screens
import HomeScreen from '../screens/HomeScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import PaymentScreen from '../screens/PaymentScreen';
import OrderTimelineScreen from '../screens/OrderTimelineScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import CartScreen from '../screens/CartScreen';

// Admin Screens
import AdminLoginScreen from '../screens/admin/AdminLoginScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminProductCRUDScreen from '../screens/admin/AdminProductCRUDScreen';
import AdminShippingCouponManagerScreen from '../screens/admin/AdminShippingCouponManagerScreen';
import AdminPaymentAuditScreen from '../screens/admin/AdminPaymentAuditScreen';
import AdminWhatsAppWebhookScreen from '../screens/admin/AdminWhatsAppWebhookScreen';

import { useAuth } from '../services/auth'; // Custom hook to check auth state

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Client App Navigator (Bottom Tabs)
const ClientAppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#FFD700', // Gold
        tabBarInactiveTintColor: '#888888',
        tabBarStyle: {
          backgroundColor: '#000000', // Deep black
          height: 60,
          paddingTop: 5,
        },
        headerStyle: {
          backgroundColor: '#000000', // Deep black
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="home" size={size} color={color} />
          ),
          title: 'Home',
        }}
      />
      <Tab.Screen
        name="Categories"
        component={HomeScreen} // Placeholder - would be a categories screen
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="category" size={size} color={color} />
          ),
          title: 'Categories',
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="shopping-cart" size={size} color={color} />
          ),
          title: 'Cart',
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="heart" size={size} color={color} />
          ),
          title: 'Favorites',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={HomeScreen} // Placeholder - would be a profile screen
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="user" size={size} color={color} />
          ),
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

// Admin App Navigator (Stack)
const AdminStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#000000', // Deep black
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
      }}
    >
      <Stack.Screen name="AdminLogin" component={AdminLoginScreen} options={{ title: 'Admin Login' }} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Dashboard' }} />
      <Stack.Screen name="AdminProductCRUD" component={AdminProductCRUDScreen} options={{ title: 'Product Management' }} />
      <Stack.Screen name="AdminShippingCouponManager" component={AdminShippingCouponManagerScreen} options={{ title: 'Shipping & Coupons' }} />
      <Stack.Screen name="AdminPaymentAudit" component={AdminPaymentAuditScreen} options={{ title: 'Payment Audit' }} />
      <Stack.Screen name="AdminWhatsAppWebhook" component={AdminWhatsAppWebhookScreen} options={{ title: 'WhatsApp Webhook' }} />
    </Stack.Navigator>
  );
};

// Root Navigator with Auth Loading
export const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // or show a loading spinner
  }

  // For simplicity, we assume admin if user.role === 'admin', otherwise client
  // In a real app, you might have more complex role checking
  const isAdmin = user?.role === 'admin';

  return (
    <>
      {!isAdmin ? <ClientAppNavigator /> : <AdminStackNavigator />}
    </>
  );
};