import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Title,
  Paragraph,
  Button as PaperButton,
  Icon,
  Chip,
  List,
  ListItem,
  Dialog,
  Avatar,
  Badge,
  ProgressBar,
  Slider,
} from 'react-native-paper';
import { MotiView, MotiText, moti } from 'moti';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { getAllOrders, updateOrder } from '../../services/orderService';
import { getProfileByUserId } from '../../services/profilesService';
import { ROUTES } from '../../utils/constants';
import { useNavigation } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native-paper';
import { formatCurrency } from '../../utils/helpers';

const { width } = Dimensions.get('window');

const AdminPaymentAuditScreen = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [markAsPaidLoading, setMarkAsPaidLoading] = useState(false);

  // Status options
  const statusOptions = [
    { value: 'all', label: t('allStatus') },
    { value: 'pending', label: t('pendingPayment') },
    { value: 'paid', label: t('paid') },
    { value: 'shipped', label: t('shipped') },
    { value: 'delivered', label: t('delivered') },
  ];

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const ordersData = await getAllOrders();
      setOrders(ordersData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  // Filtered and searched orders
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = !searchTerm ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.user_id && order.user_id.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  // Handle marking order as paid
  const handleMarkAsPaid = async (orderId: string) => {
    try {
      setMarkAsPaidLoading(true);
      await updateOrder(orderId, { status: 'paid' });
      setModalVisible(false);
      setSelectedOrder(null);
      await loadOrders();
    } catch (err) {
      setError(err.message);
    } finally {
      setMarkAsPaidLoading(false);
    }
  };

  // Get user profile for order
  const getUserProfile = async (userId: string) => {
    try {
      const profile = await getProfileByUserId(userId);
      return profile;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  };

  if (loading) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={{ flex: 1, backgroundColor: '#000000' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={{ color: '#FFFFFF', marginTop: 16 }}>{t('loadingOrders')}</Text>
        </View>
      </KeyboardAvoidingView>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000000', padding: 24 }}>
        <Text style={{ color: '#FF0000', textAlign: 'center', marginBottom: 16 }}>{error}</Text>
        <Button mode="contained" onPressed={handleRefresh}>
          {t('tryAgain')}
        </Button>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <MotiText
            style={{ fontSize: 20, fontWeight: '600', color: '#FFFFFF', marginBottom: 8 }}
            initial={{ x: -20, opacity: 0 }}
            enter={{ x: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
          >
            {t('paymentAudit')}
          </MotiText>

          <Button mode="text" onPressed={() => navigation.navigate(ROUTES.ADMIN_DASHBOARD)}>
            <Icon name="arrow-left" size={20} color="#FFD700" />
            <Text style={{ marginLeft: 4, color: '#FFD700' }}>{t('backToDashboard')}</Text>
          </Button>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#FFD700']} />}
        >
          {/* Stats Summary */}
          <View style={{ marginBottom: 24 }}>
            <MotiText
              style={{ fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginBottom: 12 }}
              initial={{ y: 10, opacity: 0 }}
              enter={{ y: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
            >
              {t('auditSummary')}
            </MotiText>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <View style={{ width: '48%', marginBottom: 16 }}>
                <MotiView
                  style={{ backgroundColor: '#111111', borderRadius: 16, padding: 16, minHeight: 100 }}
                  initial={{ opacity: 0 }}
                  enter={{ opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
                >
                  <MotiText
                    style={{ fontSize: 14, color: '#888888', marginBottom: 4 }}
                    initial={{ y: 5, opacity: 0 }}
                    enter={{ y: 0, opacity: 1, transition: { delay: 50, damping: 15, stiffness: 120 } }}
                  >
                    {t('totalOrders')}
                  </MotiText>
                  <MotiText
                    style={{ fontSize: 20, fontWeight: '600', color: '#FFD700' }}
                    initial={{ y: 10, opacity: 0 }}
                    enter={{ y: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
                  >
                    {orders.length}
                  </MotiText>
                </MotiView>
              </View>

              <View style={{ width: '48%', marginBottom: 16 }}>
                <MotiView
                  style={{ backgroundColor: '#111111', borderRadius: 16, padding: 16, minHeight: 100 }}
                  initial={{ opacity: 0 }}
                  enter={{ opacity: 1, transition: { delay: 200, damping: 15, stiffness: 120 } }}
                >
                  <MotiText
                    style={{ fontSize: 14, color: '#888888', marginBottom: 4 }}
                    initial={{ y: 5, opacity: 0 }}
                    enter={{ y: 0, opacity: 1, transition: { delay: 50, damping: 15, stiffness: 120 } }}
                  >
                    {t('pendingPayments')}
                  </MotiText>
                  <MotiText
                    style={{ fontSize: 20, fontWeight: '600', color: '#FF4500' }}
                    initial={{ y: 10, opacity: 0 }}
                    enter={{ y: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
                  >
                    {orders.filter(o => o.status === 'pending').length}
                  </MotiText>
                </MotiView>
              </View>
            </View>
          </View>

          {/* Filters */}
          <View style={{ marginBottom: 24 }}>
            <MotiText
              style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 8 }}
              initial={{ y: 5, opacity: 0 }}
              enter={{ y: 0, opacity: 1, transition: { delay: 50, damping: 15, stiffness: 120 } }}
            >
              {t('filterOrders')}
            </MotiText>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {statusOptions.map((option) => (
                <Button
                  key={option.value}
                  mode={statusFilter === option.value ? 'contained' : 'text'}
                  onPress={() => setStatusFilter(option.value)}
                  style={{ minWidth: 80 }}
                >
                  <Text style={{ color: statusFilter === option.value ? '#FFFFFF' : '#FFD700' }}>
                    {option.label}
                  </Text>
                </Button>
              ))}
            </View>

            <Input
              label={t('searchOrders')}
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder={t('searchByOrderIdOrUser')}
              style={{ marginTop: 12 }}
            />
          </View>

          {/* Orders List */}
          <MotiText
            style={{ fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginBottom: 12 }}
            initial={{ y: 10, opacity: 0 }}
            enter={{ y: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
          >
            {t('ordersList')}
          </MotiText>

          {filteredOrders.length === 0 ? (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <Text style={{ color: '#888888', textAlign: 'center' }}>
                {t('noOrdersFound')}
              </Text>
            </View>
          ) : (
            <View style={{ backgroundColor: '#111111', borderRadius: 16, padding: 16 }}>
              <List>
                {filteredOrders.map(async (order: any) => {
                  const profile = await getUserProfile(order.user_id);
                  return (
                    <ListItem
                      key={order.id}
                      title={`${t('order')} #${order.id.substring(0, 8)}...`}
                      description={`
                        ${t('status')}: ${order.status === 'pending' ? t('pendingPayment') : order.status}
                        ${t('amount')}: ${formatCurrency(order.total)}
                        ${t('date')}: ${new Order(order.created_at).toLocaleDateString()}
                      `}
                      left={(props) => <Avatar.Icon size={56} icon="credit-card" color={order.status === 'pending' ? '#FF4500' : '#00FF00'} {...props} />}
                      right={(props) => (
                        <View style={{ flexDirection: 'row' }}>
                          <IconButton
                            onPress={() => {
                              setSelectedOrder(order);
                              setModalVisible(true);
                            }}
                            icon="eye"
                            color="#FFD700"
                            size={20}
                            {...props}
                          )}
                          {order.status === 'pending' && (
                            <IconButton
                              onPress={() => {
                                setSelectedOrder(order);
                                setModalVisible(true);
                              }}
                              icon="check-circle"
                              color="#00FF00"
                              size={20}
                              {...props}
                            >
                              {t('markPaid')}
                            </IconButton>
                          )}
                        </View>
                      )}
                    </ListItem>
                  );
                })}
              </List>
            </View>
          )}

          {/* Payment Details Modal */}
          {selectedOrder && (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ backgroundColor: '#000000', borderRadius: 20, padding: 24, width: '90%', maxWidth: 400 }}>
                <MotiText
                  style={{ fontSize: 20, fontWeight: '600', color: '#FFFFFF', marginBottom: 16 }}
                  initial={{ y: 20, opacity: 0 }}
                  enter={{ y: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
                >
                  {t('paymentDetails')}
                </MotiText>

                <View style={{ marginBottom: 20 }}>
                  <MotiText style={{ fontSize: 16, color: '#888888', marginBottom: 4 }}>
                    {t('orderId')}
                  </MotiText>
                  <MotiText style={{ fontSize: 18, fontWeight: '600', color: '#FFFFFF' }}>
                    #{selectedOrder.id}
                  </MotiText>
                </View>

                <View style={{ marginBottom: 20 }}>
                  <MotiText style={{ fontSize: 16, color: '#888888', marginBottom: 4 }}>
                    {t('customer')}
                  </MotiText>
                  <MotiText style={{ fontSize: 18, fontWeight: '600', color: '#FFFFFF' }}>
                    {selectedOrder.user_id || t('guest')}
                  </MotiText>
                </View>

                <View style={{ marginBottom: 20 }}>
                  <MotiText style={{ fontSize: 16, color: '#888888', marginBottom: 4 }}>
                    {t('totalAmount')}
                  </MotiText>
                  <MotiText style={{ fontSize: 20, fontWeight: '600', color: '#FFD700' }}>
                    {formatCurrency(selectedOrder.total)}
                  </MotiText>
                </View>

                <View style={{ marginBottom: 20 }}>
                  <MotiText style={{ fontSize: 16, color: '#888888', marginBottom: 4 }}>
                    {t('paymentMethod')}
                  </MotiText>
                  <MotiText style={{ fontSize: 18, fontWeight: '600', color: '#FFFFFF' }}>
                    {selectedOrder.payment_method || t('notSpecified')}
                  </MotiText>
                </View>

                <View style={{ marginBottom: 20 }}>
                  <MotiText style={{ fontSize: 16, color: '#888888', marginBottom: 4 }}>
                    {t('transferScreenshot')}
                  </MotiText>
                  {selectedOrder.transfer_screenshot ? (
                    <View style={{ marginTop: 8 }}>
                      <Text style={{ color: '#888888', marginBottom: 4 }}>{t('screenshotUploaded')}</Text>
                      {/* In a real app, you would display the image here */}
                      <View style={{ width: 100, height: 100, backgroundColor: '#333333', justifyContent: 'center', alignItems: 'center', borderRadius: 8 }}>
                        <Text style={{ color: '#FFFFFF', fontSize: 12 }}>IMAGE</Text>
                      </View>
                    </View>
                  ) : (
                    <Text style={{ color: '#FF4500', fontStyle: 'italic' }}>
                      {t('noScreenshot')}
                    </Text>
                  )}
                </View>

                <View style={{ marginBottom: 24 }}>
                  <MotiText style={{ fontSize: 16, color: '#888888', marginBottom: 4 }}>
                    {t('currentStatus')}
                  </MotiText>
                  <MotiText style={{ fontSize: 18, fontWeight: '600', color: selectedOrder.status === 'pending' ? '#FF4500' : '#00FF00' }}>
                    {selectedOrder.status === 'pending' ? t('pendingPayment') : selectedOrder.status}
                  </MotiText>
                </View>

                {selectedOrder.status === 'pending' && (
                  <View>
                    <Button
                      mode="contained"
                      onPress={handleMarkAsPaid}
                      loading={markAsPaidLoading}
                      style={{ marginBottom: 16 }}
                    >
                      {markAsPaidLoading ? t('processing') : t('markAsPaid')}
                    </Button>
                    <Button
                      mode="text"
                      onPress={() => {
                        setSelectedOrder(null);
                        setModalVisible(false);
                      }}
                    >
                      {t('close')}
                    </Button>
                  </View>
                )}

                {!selectedOrder.status === 'pending' && (
                  <Button
                    mode="text"
                    onPress={() => {
                      setSelectedOrder(null);
                      setModalVisible(false);
                    }}
                  >
                    {t('close')}
                  </Button>
                )}
              </View>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Refresh Control */}
      <RefreshControl
        refreshing={refreshing}
        onRefresh={handleRefresh}
        colors={['#FFD700']}
      />
    </View>
  );
};

// Helper component for icon button
const IconButton = ({ onPress, icon, color, size, ...props }: any) => (
  <View style={{ padding: 8 }}>
    <Button mode="text" onPress={onPress} style={{ padding: 0 }}>
      <Icon name={icon} size={size} color={color} {...props} />
    </Button>
  </View>
);

export default AdminPaymentAuditScreen;