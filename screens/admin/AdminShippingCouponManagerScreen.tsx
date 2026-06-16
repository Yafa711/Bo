import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
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
  Input,
  Switch,
  SwitchListItem,
  Dialog,
  Avatar,
  Badge,
} from 'react-native-paper';
import { MotiView, MotiText, moti } from 'moti';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { getAllCities, createCity, updateCity, deleteCity } from '../../services/citiesService';
import { getAllCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon } from '../../services/couponsService';
import { ROUTES } from '../../utils/constants';
import { useNavigation } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native-paper';

const { width } = Dimensions.get('window');

const AdminShippingCouponManagerScreen = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [cities, setCities] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [errorCities, setErrorCities] = useState<string | null>(null);
  const [errorCoupons, setErrorCoupons] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // City form state
  const [cityName, setCityName] = useState('');
  const [cityFee, setCityFee] = useState(0);
  const [editingCityId, setEditingCityId] = useState<string | null>(null);

  // Coupon form state
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [active, setActive] = useState(true);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);

  // Dialog states
  const [cityDialogVisible, setCityDialogVisible] = useState(false);
  const [couponDialogVisible, setCouponDialogVisible] = useState(false);
  const [confirmDeleteType, setConfirmDeleteType] = useState<'city' | 'coupon' | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteName, setConfirmDeleteName] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoadingCities(true);
    setLoadingCoupons(true);
    try {
      const [citiesData, couponsData] = await Promise.all([
        getAllCities(),
        getAllCoupons()
      ]);
      setCities(citiesData || []);
      setCoupons(couponsData || []);
    } catch (err) {
      setErrorCities(err.message);
      setErrorCoupons(err.message);
    } finally {
      setLoadingCities(false);
      setLoadingCoupons(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // City handlers
  const handleAddCity = () => {
    setEditingCityId(null);
    setCityName('');
    setCityFee(0);
    setCityDialogVisible(true);
  };

  const handleEditCity = (city: any) => {
    setEditingCityId(city.id);
    setCityName(city.name);
    setCityFee(city.fee);
    setCityDialogVisible(true);
  };

  const handleSaveCity = async () => {
    if (!cityName.trim()) return;

    try {
      if (editingCityId) {
        // Update city
        await updateCity(editingCityId, { name: cityName.trim(), fee: parseFloat(cityFee) });
      } else {
        // Create city
        await createCity({ name: cityName.trim(), fee: parseFloat(cityFee) });
      }
      setCityDialogVisible(false);
      await loadData();
    } catch (err) {
      setErrorCities(err.message);
    }
  };

  const handleDeleteCity = async (id: string, name: string) => {
    setConfirmDeleteType('city');
    setConfirmDeleteId(id);
    setConfirmDeleteName(name);
  };

  const handleConfirmDelete = async () => {
    try {
      if (confirmDeleteType === 'city' && confirmDeleteId) {
        await deleteCity(confirmDeleteId);
      } else if (confirmDeleteType === 'coupon' && confirmDeleteId) {
        await deleteCoupon(confirmDeleteId);
      }
      setConfirmDeleteType(null);
      setConfirmDeleteId(null);
      setConfirmDeleteName('');
      await loadData();
    } catch (err) {
      if (confirmDeleteType === 'city') {
        setErrorCities(err.message);
      } else {
        setErrorCoupons(err.message);
      }
    }
  };

  // Coupon handlers
  const handleAddCoupon = () => {
    setEditingCouponId(null);
    setCouponCode('');
    setDiscountPercent(0);
    setActive(true);
    setCouponDialogVisible(true);
  };

  const handleEditCoupon = (coupon: any) => {
    setEditingCouponId(coupon.id);
    setCouponCode(coupon.code);
    setDiscountPercent(coupon.discount_percent);
    setActive(coupon.active);
    setCouponDialogVisible(true);
  };

  const handleSaveCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      if (editingCouponId) {
        // Update coupon
        await updateCoupon(editingCouponId, {
          code: couponCode.trim(),
          discount_percent: parseFloat(discountPercent),
          active
        });
      } else {
        // Create coupon
        await createCoupon({
          code: couponCode.trim(),
          discount_percent: parseFloat(discountPercent),
          active
        });
      }
      setCouponDialogVisible(false);
      await loadData();
    } catch (err) {
      setErrorCoupons(err.message);
    }
  };

  const handleDeleteCoupon = async (id: string, code: string) => {
    setConfirmDeleteType('coupon');
    setConfirmDeleteId(id);
    setConfirmDeleteName(code);
  };

  if (loadingCities || loadingCoupons) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={{ flex: 1, backgroundColor: '#000000' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={{ color: '#FFFFFF', marginTop: 16 }}>{t('loading')}</Text>
        </View>
      </KeyboardAvoidingView>
    );
  }

  if (errorCities || errorCoupons) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000000', padding: 24 }}>
        <Text style={{ color: '#FF0000', textAlign: 'center', marginBottom: 16 }}>
          {(errorCities || errorCoupons)}
        </Text>
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
            {t('shippingCouponsManager')}
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
          {/* Cities Section */}
          <View style={{ marginBottom: 32 }}>
            <MotiText
              style={{ fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginBottom: 12 }}
              initial={{ y: 10, opacity: 0 }}
              enter={{ y: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
            >
              {t('citiesManagement')}
            </MotiText>

            <Button mode="outlined" onPressed={handleAddCity} style={{ marginBottom: 12 }}>
              <Icon name="add" size={20} color="#FFD700" />
              <Text style={{ marginLeft: 4, color: '#FFD700' }}>{t('addCity')}</Text>
            </Button>

            {errorCities && (
              <Text style={{ color: '#FF0000', marginBottom: 12 }}>{errorCities}</Text>
            )}

            <View style={{ backgroundColor: '#111111', borderRadius: 16, padding: 16 }}>
              {cityDialogVisible && (
                <View style={{ marginBottom: 16 }}>
                  <Input
                    label={t('cityName')}
                    value={cityName}
                    onChangeText={setCityName}
                    autoFocus
                  />
                  <Input
                    label={t('deliveryFee')}
                    value={cityFee.toString()}
                    onChangeText={setCityFee}
                    keyboardType="numeric"
                  />
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
                    <Button mode="text" onPress={() => setCityDialogVisible(false)}>
                      {t('cancel')}
                    </Button>
                    <Button mode="contained" onPress={handleSaveCity}>
                      {editingCityId ? t('update') : t('add')}
                    </Button>
                  </View>
                </View>
              )}

              <List>
                {cities.map((city: any) => (
                  <ListItem
                    key={city.id}
                    title={city.name}
                    description={`${t('fee')}: ${city.fee} ${t('currency')}`}
                    left={(props) => <Avatar.Icon size={56} icon="map-marker" color="#FFD700" {...props} />}
                    right={(props) => (
                      <View style={{ flexDirection: 'row' }}>
                        <IconButton
                          onPress={() => handleEditCity(city)}
                          icon="pencil"
                          color="#FFD700"
                          size={20}
                          {...props}
                        />
                        <IconButton
                          onPress={() => handleDeleteCity(city.id, city.name)}
                          icon="delete"
                          color="#FF0000"
                          size={20}
                          {...props}
                        />
                      </View>
                    )}
                  />
                ))}
              </List>
            </View>
          </View>

          {/* Coupons Section */}
          <View>
            <MotiText
              style={{ fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginBottom: 12 }}
              initial={{ y: 10, opacity: 0 }}
              enter={{ y: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
            >
              {t('couponsManagement')}
            </MotiText>

            <Button mode="outlined" onPressed={handleAddCoupon} style={{ marginBottom: 12 }}>
              <Icon name="add" size={20} color="#FFD700" />
              <Text style={{ marginLeft: 4, color: '#FFD700' }}>{t('addCoupon')}</Text>
            </Button>

            {errorCoupons && (
              <Text style={{ color: '#FF0000', marginBottom: 12 }}>{errorCoupons}</Text>
            )}

            <View style={{ backgroundColor: '#111111', borderRadius: 16, padding: 16 }}>
              {couponDialogVisible && (
                <View style={{ marginBottom: 16 }}>
                  <Input
                    label={t('couponCode')}
                    value={couponCode}
                    onChangeText={setCouponCode}
                    autoFocus
                  />
                  <Input
                    label={t('discountPercent')}
                    value={discountPercent.toString()}
                    onChangeText={setDiscountPercent}
                    keyboardType="numeric"
                  />
                  <SwitchListItem
                    label={t('active')}
                    value={active}
                    onValueChange={setActive}
                  />
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
                    <Button mode="text" onPress={() => setCouponDialogVisible(false)}>
                      {t('cancel')}
                    </Button>
                    <Button mode="contained" onPress={handleSaveCoupon}>
                      {editingCouponId ? t('update') : t('add')}
                    </Button>
                  </View>
                </View>
              )}

              <List>
                {coupons.map((coupon: any) => (
                  <ListItem
                    key={coupon.id}
                    title={coupon.code}
                    description={`${coupon.discount_percent}% ${t('off')} • ${coupon.active ? t('active') : t('inactive')}`}
                    left={(props) => <Avatar.Icon size={56} icon="tag" color={coupon.active ? '#00FF00' : '#FF0000'} {...props} />}
                    right={(props) => (
                      <View style={{ flexDirection: 'row' }}>
                        <IconButton
                          onPress={() => handleEditCoupon(coupon)}
                          icon="pencil"
                          color="#FFD700"
                          size={20}
                          {...props}
                        />
                        <IconButton
                          onPress={() => handleDeleteCoupon(coupon.id, coupon.code)}
                          icon="delete"
                          color="#FF0000"
                          size={20}
                          {...props}
                        />
                      </View>
                    )}
                  />
                ))}
              </List>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Delete Confirmation Dialog */}
      <Dialog
        visible={!!confirmDeleteType && !!confirmDeleteId}
        onDismiss={() => {
          setConfirmDeleteType(null);
          setConfirmDeleteId(null);
          setConfirmDeleteName('');
        }}
      >
        <Dialog.Title>{t('confirmDeletion')}</Dialog.Title>
        <Dialog.Content>
          <Text>{t('areYouSureDelete')}</Text>
          <Text style={{ fontWeight: '600', marginVertical: 8 }}>
            {confirmDeleteType === 'city' ? confirmDeleteName : confirmDeleteName}
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => {
            setConfirmDeleteType(null);
            setConfirmDeleteId(null);
            setConfirmDeleteName('');
          }}>
            {t('cancel')}
          </Button>
          <Button mode="contained" onPress={handleConfirmDelete}>
            {t('delete')}
          </Button>
        </Dialog.Actions>
      </Dialog>
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

export default AdminShippingCouponManagerScreen;