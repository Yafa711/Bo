import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Icon,
  Chip,
  ProgressBar,
} from 'react-native-paper';
import { MotiView, MotiText, moti } from 'moti';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { fetchSearchAnalytics } from '../../services/searchAnalyticsService';
import { formatCurrency } from '../../utils/helpers';
import { ROUTES } from '../../utils/constants';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const AdminDashboardScreen = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [analytics, setAnalytics] = useState(null);
  const [topSearches, setTopSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // In a real app, we would fetch multiple endpoints
      const searchData = await fetchSearchAnalytics();
      setTopSearches(searchData || []);

      // Simulate other analytics data
      setAnalytics({
        totalSales: 124500,
        totalOrders: 342,
        totalCustomers: 128,
        conversionRate: 3.2,
        growthRate: 12.5,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' }}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={{ color: '#FFFFFF', marginTop: 16 }}>{t('loadingDashboard')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000', padding: 24 }}>
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
            {t('dashboard')}
          </MotiText>

          <Button mode="text" onPressed={() => navigation.navigate(ROUTES.ADMIN_PRODUCT_CRUD)}>
            <Icon name="add" size={20} color="#FFD700" />
            <Text style={{ marginLeft: 4, color: '#FFD700' }}>{t('manageProducts')}</Text>
          </Button>
        </View>

        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#FFD700']}
        />

        <ScrollView
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#FFD700']} />}
        >
          {/* Stats Cards */}
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {!analytics || (
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
                      {t('totalSales')}
                    </MotiText>
                    <MotiText
                      style={{ fontSize: 20, fontWeight: '600', color: '#FFD700' }}
                      initial={{ y: 10, opacity: 0 }}
                      enter={{ y: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
                    >
                      {t('loading')}
                    </MotiText>
                  </MotiView>
                </View>
              )}
              {analytics && (
                <>
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
                        {t('totalSales')}
                      </MotiText>
                      <MotiText
                        style={{ fontSize: 20, fontWeight: '600', color: '#FFD700' }}
                        initial={{ y: 10, opacity: 0 }}
                        enter={{ y: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
                      >
                        {formatCurrency(analytics.totalSales)}
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
                        {t('totalOrders')}
                      </MotiText>
                      <MotiText
                        style={{ fontSize: 20, fontWeight: '600', color: '#FFD700' }}
                        initial={{ y: 10, opacity: 0 }}
                        enter={{ y: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
                      >
                        {analytics.totalOrders}
                      </MotiText>
                    </MotiView>
                  </View>

                  <View style={{ width: '48%', marginBottom: 16 }}>
                    <MotiView
                      style={{ backgroundColor: '#111111', borderRadius: 16, padding: 16, minHeight: 100 }}
                      initial={{ opacity: 0 }}
                      enter={{ opacity: 1, transition: { delay: 300, damping: 15, stiffness: 120 } }}
                    >
                      <MotiText
                        style={{ fontSize: 14, color: '#888888', marginBottom: 4 }}
                        initial={{ y: 5, opacity: 0 }}
                        enter={{ y: 0, opacity: 1, transition: { delay: 50, damping: 15, stiffness: 120 } }}
                      >
                        {t('totalCustomers')}
                      </MotiText>
                      <MotiText
                        style={{ fontSize: 20, fontWeight: '600', color: '#FFD700' }}
                        initial={{ y: 10, opacity: 0 }}
                        enter={{ y: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
                      >
                        {analytics.totalCustomers}
                      </MotiText>
                    </MotiView>
                  </View>

                  <View style={{ width: '48%', marginBottom: 16 }}>
                    <MotiView
                      style={{ backgroundColor: '#111111', borderRadius: 16, padding: 16, minHeight: 100 }}
                      initial={{ opacity: 0 }}
                      enter={{ opacity: 1, transition: { delay: 400, damping: 15, stiffness: 120 } }}
                    >
                      <MotiText
                        style={{ fontSize: 14, color: '#888888', marginBottom: 4 }}
                        initial={{ y: 5, opacity: 0 }}
                        enter={{ y: 0, opacity: 1, transition: { delay: 50, damping: 15, stiffness: 120 } }}
                      >
                        {t('conversionRate')}
                      </MotiText>
                      <MotiText
                        style={{ fontSize: 20, fontWeight: '600', color: '#FFD700' }}
                        initial={{ y: 10, opacity: 0 }}
                        enter={{ y: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
                      >
                        {analytics.conversionRate}%
                      </MotiText>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <MotiView
                          style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: analytics.growthRate >= 0 ? '#00FF00' : '#FF0000' }}
                        />
                        <Text style={{ marginLeft: 4, fontSize: 12, color: analytics.growthRate >= 0 ? '#00FF00' : '#FF0000' }}>
                          {analytics.growthRate >= 0 ? '+' : ''}{analytics.growthRate}%
                        </Text>
                      </View>
                    </MotiView>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Analytics Charts (Placeholders) */}
          <View style={{ marginBottom: 24 }}>
            <MotiText
              style={{ fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginBottom: 12 }}
              initial={{ y: 10, opacity: 0 }}
              enter={{ y: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
            >
              {t('salesTrends')}
            </MotiText>

            <View style={{ backgroundColor: '#111111', borderRadius: 16, padding: 16, minHeight: 140 }}>
              {/* In a real app, this would be a chart component */}
              <View style={{ alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Text style={{ color: '#888888', textAlign: 'center' }}>
                  [Sales Chart Placeholder]
                </Text>
              </View>
            </View>
          </View>

          {/* Top Searches Section */}
          <View style={{ marginBottom: 24 }}>
            <MotiText
              style={{ fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginBottom: 12 }}
              initial={{ y: 10, opacity: 0 }}
              enter={{ y: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
            >
              {t('topSearches')}
            </MotiText>

            <View style={{ backgroundColor: '#111111', borderRadius: 16, padding: 16 }}>
              {topSearches.length === 0 ? (
                <View style={{ padding: 24, alignItems: 'center' }}>
                  <Text style={{ color: '#888888', textAlign: 'center' }}>
                    {t('noSearchData')}
                  </Text>
                </View>
              ) : (
                <View>
                  {topSearches.map((search: any, index: number) => (
                    <MotiView
                      key={search.id}
                      style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: index === topSearches.length - 1 ? 0 : 1, borderColor: '#333333' }}
                      initial={{ x: -20, opacity: 0 }}
                      enter={{ x: 0, opacity: 1, transition: { delay: index * 100, damping: 15, stiffness: 120 } }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MotiView
                          style={{ width: 24, height: 24, borderRadius: 100, backgroundColor: '#FFD700', justifyContent: 'center', alignItems: 'center' }}
                          initial={{ scale: 0.8 }}
                          enter={{ scale: 1, transition: { delay: index * 50, damping: 15, stiffness: 120 } }}
                        >
                          <Text style={{ color: '#000000', fontWeight: '600' }}>{index + 1}</Text>
                        </MotiView>
                        <Text style={{ marginLeft: 12, flex: 1, fontSize: 14, color: '#FFFFFF' }}>
                          {search.query}
                        </Text>
                        <Text style={{ fontSize: 14, color: '#FFD700', fontWeight: '600' }}>
                          {search.count} {t('times')}
                        </Text>
                      </MotiView>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={{ marginBottom: 24 }}>
            <MotiText
              style={{ fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginBottom: 12 }}
              initial={{ y: 10, opacity: 0 }}
              enter={{ y: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
            >
              {t('quickActions')}
            </MotiText>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <MotiView
                style={{ width: '48%', backgroundColor: '#111111', borderRadius: 12, padding: 16 }}
                initial={{ x: -20, opacity: 0 }}
                enter={{ x: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
                whileTap={{ scale: 0.95 }}
              >
                <MotiText
                  style={{ fontSize: 16, fontWeight: '600', color: '#FFD700', marginBottom: 8 }}
                  initial={{ y: 5, opacity: 0 }}
                  enter={{ y: 0, opacity: 1, transition: { delay: 50, damping: 15, stiffness: 120 } }}
                >
                  {t('manageProducts')}
                </MotiText>
                <Text style={{ color: '#E0E0E0', lineHeight: 18 }}>
                  {t('addEditDeleteProducts')}
                </Text>
                <Button mode="text" onPressed={() => navigation.navigate(ROUTES.ADMIN_PRODUCT_CRUD)}>
                  <Icon name="chevron-right" size={16} color="#FFD700" />
                </Button>
              </MotiView>

              <MotiView
                style={{ width: '48%', backgroundColor: '#111111', borderRadius: 12, padding: 16 }}
                initial={{ x: 20, opacity: 0 }}
                enter={{ x: 0, opacity: 1, transition: { delay: 200, damping: 15, stiffness: 120 } }}
                whileTap={{ scale: 0.95 }}
              >
                <MotiText
                  style={{ fontSize: 16, fontWeight: '600', color: '#FF1493', marginBottom: 8 }}
                  initial={{ y: 5, opacity: 0 }}
                  enter={{ y: 0, opacity: 1, transition: { delay: 50, damping: 15, stiffness: 120 } }}
                >
                  {t('manageOrders')}
                </MotiText>
                <Text style={{ color: '#E0E0E0', lineHeight: 18 }}>
                  {t('viewProcessOrders')}
                </Text>
                <Button mode="text" onPressed={() => navigation.navigate(ROUTES.ADMIN_PAYMENT_AUDIT)}>
                  <Icon name="chevron-right" size={16} color="#FF1493" />
                </Button>
              </MotiView>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default AdminDashboardScreen;