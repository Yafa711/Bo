import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Icon,
  Avatar,
  StatusBar,
} from 'react-native-paper';
import { MotiView, MotiText, moti } from 'moti';
import { useSharedValue, withSpring, withTiming, withDelay } from 'react-native-reanimated';
import { fetchOrderById, updateOrderStatus } from '../../services/orderService';
import { formatCurrency } from '../../utils/helpers';
import { ORDER_STATUS } from '../../utils/constants';
import { ROUTES } from '../../utils/constants';

const { width } = Dimensions.get('window');

const OrderTimelineScreen = () => {
  const { t } = useTranslation();
  const route = useRoute<any>();
  const navigation = useNavigation();

  const [order, setOrder] = useState(null);
  [loading, setLoading] = useState(true);
  [error, setError] = useState(null);

  // Animated values for timeline items
  const animatedValues = useSharedValue([]);

  useEffect(() => {
    loadOrderDetails();
    // Initialize animated values
    const timelineSteps = Object.values(ORDER_STATUS).length;
    const initialValues = Array(timelineSteps).fill(0);
    animatedValues.value = initialValues;
  }, [route.params?.orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const orderData = await fetchOrderById(route.params?.orderId);
      setOrder(orderData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackOrder = () => {
    // Would integrate with actual tracking service
    alert('Tracking information would be shown here');
  };

  const handleContactSupport = () => {
    navigation.navigate('ContactSupport');
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case ORDER_STATUS.PENDING:
        return t('orderPending');
      case ORDER_STATUS.PROCESSING:
        return t('orderProcessing');
      case ORDER_STATUS.SHIPPED:
        return t('orderShipped');
      case ORDER_STATUS.DELIVERED:
        return t('orderDelivered');
      case ORDER_STATUS.CANCELLED:
        return t('orderCancelled');
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case ORDER_STATUS.PENDING:
        return 'clock';
      case ORDER_STATUS.PROCESSING:
        return 'settings';
      case ORDER_STATUS.SHIPPED:
        return 'truck';
      case ORDER_STATUS.DELIVERED:
        return 'check-circle';
      case ORDER_STATUS.CANCELLED:
        return 'cancel';
      default:
        return 'help';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case ORDER_STATUS.PENDING:
        return '#FFA500'; // Orange
      case ORDER_STATUS.PROCESSING:
        return '#1E90FF'; // Blue
      case ORDER_STATUS.SHIPPED:
        return '#32CD32'; // Lime Green
      case ORDER_STATUS.DELIVERED:
        return '#FFD700'; // Gold
      case ORDER_STATUS.CANCELLED:
        return '#FF0000'; // Red
      default:
        return '#888888';
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' }}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={{ color: '#FFFFFF', marginTop: 16 }}>{t('loadingOrderDetails')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000', padding: 24 }}>
        <Text style={{ color: '#FF0000', textAlign: 'center', marginBottom: 16 }}>{error}</Text>
        <Button mode="contained" onPressed={() => navigation.goBack()}>
          {t('goBack')}
        </Button>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' }}>
        <Text style={{ color: '#FF0000' }}>{t('orderNotFound')}</Text>
      </View>
    );
  }

  // Animate timeline items when order status changes
  useEffect(() => {
    if (order) {
      const statusIndex = Object.values(ORDER_STATUS).indexOf(order.status);
      if (statusIndex >= 0) {
        // Animate all items up to current status
        const newValues = [...animatedValues.value];
        for (let i = 0; i <= statusIndex; i++) {
          newValues[i] = withSpring(1, { damping: 15, stiffness: 120 });
        }
        // Animate remaining items to 0
        for (let i = statusIndex + 1; i < newValues.length; i++) {
          newValues[i] = withSpring(0, { damping: 15, stiffness: 120 });
        }
        animatedValues.value = newValues;
      }
    }
  }, [order]);

  const statusSteps = [
    { id: 'pending', label: t('orderPending'), icon: 'clock', color: '#FFA500' },
    { id: 'processing', label: t('orderProcessing'), icon: 'settings', color: '#1E90FF' },
    { id: 'shipped', label: t('orderShipped'), icon: 'truck', color: '#32CD32' },
    { id: 'delivered', label: t('orderDelivered'), icon: 'check-circle', color: '#FFD700' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <MotiText
            style={{ fontSize: 20, fontWeight: '600', color: '#FFFFFF' }}
            initial={{ x: -20, opacity: 0 }}
            enter={{ x: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
          >
            {t('orderTimeline')}
          </MotiText>

          <Button mode="text" onPressed={handleTrackOrder}>
            <Icon name="refresh" size={20} color="#FFD700" />
          </Button>
        </View>

        <View style={{ backgroundColor: '#111111', borderRadius: 16, padding: 24, marginTop: 16 }}>
          <MotiText
            style={{ fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginBottom: 12 }}
            initial={{ y: 10, opacity: 0 }}
            enter={{ y: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
          >
            {t('orderDetails')}
          </MotiText>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <View>
              <Text style={{ color: '#888888', fontSize: 14 }}>{t('orderNumber')}:</Text>
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>{order.id}</Text>
            </View>
            <View>
              <Text style={{ color: '#888888', fontSize: 14 }}>{t('date')}:</Text>
              <Text style={{ color: '#FFFFFF', fontSize: 16 }}>{new Date(order.created_at).toLocaleDateString()}</Text>
            </View>
          </View>

          <View style={{ marginVertical: 20 }}>
            <Text style={{ color: '#E0E0E0', fontSize: 14, marginBottom: 8 }}>{t('items')}</Text>
            <View style={{ backgroundColor: '#111111', borderRadius: 8, padding: 12 }}>
              {order.items.map((item: any, index: number) => (
                <View
                  key={item.id}
                  style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: index === order.items.length - 1 ? 0 : 1, borderColor: '#333333' }}
                >
                  <View>
                    <MotiText
                      style={{ fontSize: 14, color: '#FFFFFF' }}
                      initial={{ y: 2, opacity: 0 }}
                      enter={{ y: 0, opacity: 1, transition: { delay: index * 50, damping: 15, stiffness: 120 } }}
                    >
                      {item.title}
                    </MotiText>
                    <Text style={{ color: '#888888', fontSize: 12 }}>
                      x{item.quantity}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 14, color: '#FFD700', fontWeight: '600' }}>
                    {formatCurrency((item.discount_price || item.price) * item.quantity)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
            <Text style={{ color: '#888888', fontSize: 14 }}>{t('total')}:</Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFD700' }}>
              {formatCurrency(order.total)}
            </Text>
          </View>
        </View>
      </View>

      {/* Animated Timeline */}
      <View style={{ margin: 16 }}>
        <MotiText
          style={{ fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginBottom: 16 }}
          initial={{ y: 10, opacity: 0 }}
          enter={{ y: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
        >
          {t('shippingProgress')}
        </MotiText>

        <View style={{ position: 'relative', paddingVertical: 24 }}>
          {/* Timeline Line */}
          <View
            style={{
              position: 'absolute',
              top: 24,
              left: 16,
              bottom: 24,
              width: 4,
              backgroundColor: '#333333',
            }}
          />

          {/* Timeline Items */}
          {statusSteps.map((step, index) => {
            const isCurrent = order.status === step.id;
            const isCompleted =
              Object.values(ORDER_STATUS).indexOf(order.status) >=
              Object.values(ORDER_STATUS).indexOf(step.id as keyof typeof ORDER_STATUS);
            const isPending = !isCompleted && !isCurrent;

            return (
              <MotiView
                key={step.id}
                style={{
                  position: 'relative',
                  left: -12, // Center on the line
                  marginBottom: 32,
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                enter={{
                  opacity: 1,
                  scale: 1,
                  transition: {
                    delay: index * 150, // Stagger effect
                    damping: 15,
                    stiffness: 120,
                  }
                }}
              >
                {/* Timeline Point */}
                <View
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: 24,
                    width: 16,
                    height: 16,
                    borderRadius: 100,
                    backgroundColor: isCompleted
                      ? step.color
                      : isCurrent
                      ? '#FFD700'
                      : '#444444',
                    borderWidth: isCurrent ? 2 : 0,
                    borderColor: isCurrent ? '#FFFFFF' : 'transparent',
                  }}
                >
                  {isCompleted && (
                    <Icon
                      name={step.icon}
                      size={12}
                      color="#FFFFFF"
                      style={{
                        position: 'absolute',
                        top: 50%,
                        left: 50%,
                        transform: [{ translateX: -6 }, { translateY: -6 }],
                      }}
                    />
                  )}
                </View>

                {/* Timeline Label */}
                <View
                  style={{
                    position: 'absolute',
                    left: 40,
                    top: 16,
                  }}
                >
                  <MotiText
                    style={{
                      fontSize: 14,
                      fontWeight: isCompleted || isCurrent ? '600' : '400',
                      color: isCompleted || isCurrent ? '#FFFFFF' : '#888888',
                    }}
                    initial={{ y: 6, opacity: 0 }}
                    enter={{ y: 0, opacity: 1, transition: { delay: index * 150, damping: 15, stiffness: 120 } }}
                  >
                    {step.label}
                  </MotiText>

                  {!isCompleted && (
                    <Text
                      style={{
                        fontSize: 12,
                        color: '#888888',
                        marginTop: 4,
                      }}
                    >
                      {t('pending')}
                    </Text>
                  )}
                </View>
              </MotiView>
            );
          })}

          {/* Last Item (Delivered) - Special handling for final state */}
          {order.status === ORDER_STATUS.DELIVERED && (
            <MotiView
              style={{
                position: 'absolute',
                left: -12,
                bottom: -16,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              enter={{
                opacity: 1,
                scale: 1,
                transition: {
                  delay: statusSteps.length * 150,
                  damping: 15,
                  stiffness: 120,
                }
              }}
            >
              {/* Timeline Point */}
              <View
                style={{
                  position: 'absolute',
                  left: 12,
                  top: 24,
                  width: 16,
                  height: 16,
                  borderRadius: 100,
                  backgroundColor: '#FFD700',
                }}
              >
                <Icon
                  name="check-circle"
                  size={12}
                  color="#FFFFFF"
                  style={{
                    position: 'absolute',
                    top: 50%,
                    left: 50%,
                    transform: [{ translateX: -6 }, { translateY: -6 }],
                  }}
                />
              </View>

              {/* Timeline Label */}
              <View
                style={{
                  position: 'absolute',
                  left: 40,
                  top: 16,
                }}
              >
                <MotiText
                  style={{ fontSize: 14, fontWeight: '600', color: '#FFFFFF' }}
                  initial={{ y: 6, opacity: 0 }}
                  enter={{ y: 0, opacity: 1, transition: { delay: statusSteps.length * 150, damping: 15, stiffness: 120 } }}
                >
                  {t('orderDelivered')}
                </MotiText>
              </MotiView>
            )}
          )}
        </View>
      </View>

      {/* Action Buttons */}
      {order.status !== ORDER_STATUS.DELIVERED && order.status !== ORDER_STATUS.CANCELLED && (
        <View style={{ padding: 16, marginTop: 24 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Button
              mode="outlined"
              style={{ flex: 1 }}
              onPressed={handleContactSupport}
            >
              <Icon name="headset" size={20} />
              <Text>{t('contactSupport')}</Text>
            </Button>

            <Button
              mode="contained"
              style={{ flex: 1, backgroundColor: '#FFD700' }}
              onPressed={() => {
                // Would show rating modal or feedback form
                alert('Thank you for your purchase!');
              }}
            >
              <Icon name="star" size={20} />
              <Text>{t('rateExperience')}</Text>
            </Button>
          </View>
        </View>
      )}
    </View>
  );
};

export default OrderTimelineScreen;