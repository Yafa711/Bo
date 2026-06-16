import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Icon,
  TextInput,
  Switch,
} from 'react-native-paper';
import { MotiView, MotiText } from 'moti';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { formatCurrency } from '../../utils/helpers';
import { PAYMENT_METHODS, YEMENI_BANKS } from '../../utils/constants';
import { updateOrderStatus } from '../../services/orderService';

const PaymentScreen = () => {
  const { t } = useTranslation();
  const route = useRoute<any>();
  const navigation = useNavigation();

  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.BANK_TRANSFER);
  const [screenshotUri, setScreenshotUri] = useState<string | null>(null);
  [isUploading, setIsUploading] = useState(false);
  [isVerifying, setIsVerifying] = useState(false);

  const orderData = route.params?.order || {
    id: 'temp_' + Date.now(),
    total: 0,
    items: [],
  };

  const handleBankTransferPress = () => {
    setPaymentMethod(PAYMENT_METHODS.BANK_TRANSFER);
  };

  const handleCashOnDeliveryPress = () => {
    setPaymentMethod(PAYMENT_METHODS.CASH_ON_DELIVERY);
  };

  const handleUploadScreenshot = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs access to your storage to upload screenshots',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          alert('Storage permission denied');
          return;
        }
      } catch (err) {
        console.warn(err);
        return;
      }
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.cancelled) {
        setScreenshotUri(result.uri);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUploadImage = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs access to your storage to upload screenshots',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          alert('Storage permission denied');
          return;
        }
      } catch (err) {
        console.warn(err);
        return;
      }
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.cancelled) {
        setScreenshotUri(result.uri);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleConfirmPayment = async () => {
    if (paymentMethod === PAYMENT_METHODS.BANK_TRANSFER && !screenshotUri) {
      alert('Please upload a transfer screenshot');
      return;
    }

    setIsUploading(true);
    try {
      // In a real app, we would upload the screenshot to a server/storage
      // and then update the order status
      await updateOrderStatus(orderData.id, {
        status: 'pending_verification',
        transfer_screenshot: screenshotUri || null,
        payment_method: paymentMethod,
      });

      setIsVerifying(true);
      // Show success message
      alert('Payment submitted for verification!');
      navigation.navigate('OrderTimeline', { orderId: orderData.id });
    } catch (error) {
      alert('Failed to submit payment: ' + error.message);
    } finally {
      setIsUploading(false);
      setIsVerifying(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <ScrollView
        contentContainerStyle={{ padding: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Summary */}
        <View style={{ marginBottom: 32 }}>
          <MotiText
            style={{ fontSize: 20, fontWeight: '600', color: '#FFFFFF', marginBottom: 16 }}
            initial={{ y: 10, opacity: 0 }}
            enter={{ y: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
          >
            {t('orderSummary')}
          </MotiText>

          <View style={{ backgroundColor: '#111111', borderRadius: 12, padding: 16 }}>
            {/* Order Items */}
            {orderData.items.map((item: any, index: number) => (
              <View
                key={item.id}
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: index === orderData.items.length - 1 ? 0 : 1, borderColor: '#333333' }}
              >
                <View>
                  <MotiText
                    style={{ fontSize: 16, fontWeight: '500', color: '#FFFFFF' }}
                    initial={{ y: 5, opacity: 0 }}
                    enter={{ y: 0, opacity: 1, transition: { delay: index * 50, damping: 15, stiffness: 120 } }}
                  >
                    {item.title}
                  </MotiText>
                  <Text style={{ color: '#888888', fontSize: 12 }}>
                    x{item.quantity} • {item.size} • {item.color}
                  </Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFD700' }}>
                  {formatCurrency((item.discount_price || item.price) * item.quantity)}
                </Text>
              </View>
            ))}

            {/* Divider */}
            <View style={{ height: 1, backgroundColor: '#333333', marginVertical: 16 }} />

            {/* Totals */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 16, color: '#E0E0E0' }}>{t('subtotal')}</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>
                {formatCurrency(orderData.total)}
              </Text>
            </View>

            {orderData.total > 0 && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                <Text style={{ fontSize: 14, color: '#888888' }}>{t('shipping')}</Text>
                <Text style={{ fontSize: 14, color: '#FFFFFF' }}>Free</Text>
              </View>
            )}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: '#FFFFFF' }}>{t('total')}</Text>
              <Text style={{ fontSize: 20, fontWeight: '700', color: '#FFD700' }}>
                {formatCurrency(orderData.total)}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Method Selection */}
        <View style={{ marginBottom: 32 }}>
          <MotiText
            style={{ fontSize: 20, fontWeight: '600', color: '#FFFFFF', marginBottom: 16 }}
            initial={{ y: 10, opacity: 0 }}
            enter={{ y: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
          >
            {t('paymentMethod')}
          </MotiText>

          <View style={{ backgroundColor: '#111111', borderRadius: 12, overflow: 'hidden' }}>
            {/* Bank Transfer Option */}
            <MotiView
              style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: '#333333' }}
              initial={{ x: -20, opacity: 0 }}
              enter={{ x: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
              whileTap={{ scale: 0.98 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="bank" size={28} color="#FFD700" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>
                    {t('bankTransfer')}
                  </Text>
                  <Text style={{ color: '#888888', fontSize: 12 }}>
                    {t('securePayment')}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 100,
                    borderWidth: 2,
                    borderColor: paymentMethod === PAYMENT_METHODS.BANK_TRANSFER ? '#FFD700' : '#444444',
                  }}
                >
                  {paymentMethod === PAYMENT_METHODS.BANK_TRANSFER && (
                    <View style={{ width: 12, height: 12, backgroundColor: '#FFD700', borderRadius: 100 }} />
                  )}
                </View>
              </View>
            </MotiView>
            <TouchableOpacity onPress={handleBankTransferPress} style={{ padding: 16 }} />

            {/* Cash on Delivery Option */}
            <MotiView
              style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}
              initial={{ x: 20, opacity: 0 }}
              enter={{ x: 0, opacity: 1, transition: { delay: 200, damping: 15, stiffness: 120 } }}
              whileTap={{ scale: 0.98 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="motorcycle" size={28} color="#FF1493" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>
                    {t('cashOnDelivery')}
                  </Text>
                  <Text style={{ color: '#888888', fontSize: 12 }}>
                    {t('payWhenDelivered')}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 100,
                    borderWidth: 2,
                    borderColor: paymentMethod === PAYMENT_METHODS.CASH_ON_DELIVERY ? '#FF1493' : '#444444',
                  }}
                >
                  {paymentMethod === PAYMENT_METHODS.CASH_ON_DELIVERY && (
                    <View style={{ width: 12, height: 12, backgroundColor: '#FF1493', borderRadius: 100 }} />
                  )}
                </View>
              </View>
            </MotiView>
            <TouchableOpacity onPress={handleCashOnDeliveryPress} style={{ padding: 16 }} />
          </View>
        </View>

        {/* Bank Transfer Details */}
        {paymentMethod === PAYMENT_METHODS.BANK_TRANSFER && (
          <View style={{ marginBottom: 32 }}>
            <MotiText
              style={{ fontSize: 20, fontWeight: '600', color: '#FFFFFF', marginBottom: 16 }}
              initial={{ y: 10, opacity: 0 }}
              enter={{ y: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
            >
              {t('bankTransferDetails')}
            </MotiText>

            {YEMENI_BANKS.map((bank) => (
              <MotiView
                key={bank.id}
                style={{
                  backgroundColor: '#111111',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                }}
                initial={{ x: -20, opacity: 0 }}
                enter={{ x: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
              >
                <MotiText
                  style={{ fontSize: 18, fontWeight: '600', color: '#FFD700', marginBottom: 8 }}
                  initial={{ y: 5, opacity: 0 }}
                  enter={{ y: 0, opacity: 1, transition: { delay: 50, damping: 15, stiffness: 120 } }}
                >
                  {bank.name}
                </MotiText>

                <View style={{ marginBottom: 12 }}>
                  <Text style={{ color: '#888888', fontSize: 14, marginBottom: 4 }}>{t('accountName')}:</Text>
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'monospace' }}>{bank.accountName}</Text>
                </View>

                <View style={{ marginBottom: 12 }}>
                  <Text style={{ color: '#888888', fontSize: 14, marginBottom: 4 }}>{t('accountNumber')}:</Text>
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'monospace' }}>{bank.accountNumber}</Text>
                </View>

                <View>
                  <Text style={{ color: '#888888', fontSize: 14, marginBottom: 4 }}>{t('swiftCode')}:</Text>
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'monospace' }}>{bank.swiftCode}</Text>
                </View>
              </MotiView>
            ))}

            <View style={{ marginTop: 20, padding: 16, backgroundColor: '#111111', borderRadius: 12 }}>
              <Text style={{ color: '#FFD700', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
                {t('importantNotes')}
              </Text>
              <Text style={{ color: '#E0E0E0', fontSize: 14, lineHeight: 20 }}>
                • {t('pleaseIncludeOrderIdInReference')}
              </Text>
              <Text style={{ color: '#E0E0E0', fontSize: 14, lineHeight: 20 }}>
                • {t('allow1-2BusinessDaysForProcessing')}
              </Text>
              <Text style={{ color: '#E0E0E0', fontSize: 14, lineHeight: 20 }}>
                • {t('screenshotRequiredForVerification')}
              </Text>
            </View>
          </View>
        )}

        {/* Screenshot Upload Section */}
        {paymentMethod === PAYMENT_METHODS.BANK_TRANSFER && (
          <View style={{ marginBottom: 32 }}>
            <MotiText
              style={{ fontSize: 20, fontWeight: '600', color: '#FFFFFF', marginBottom: 16 }}
              initial={{ y: 10, opacity: 0 }}
              enter={{ y: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
            >
              {t('uploadTransferScreenshot')}
            </MotiText>

            <View style={{ backgroundColor: '#111111', borderRadius: 12, minHeight: 120, justifyContent: 'center', alignItems: 'center' }}>
              {screenshotUri ? (
                <MotiView
                  style={{ marginBottom: 16 }}
                  initial={{ scale: 0.8 }}
                  enter={{ scale: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
                >
                  <Image
                    source={{ uri: screenshotUri }}
                    style={{ width: 200, height: 200, borderRadius: 8 }}
                  />
                </MotiView>
              ) : (
                <View style={{ flexDirection: 'row' }}>
                  <MotiView
                    style={{ marginRight: 12 }}
                    initial={{ x: -20, opacity: 0 }}
                    enter={{ x: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
                  >
                    <Icon name="camera" size={24} color="#FFD700" />
                  </MotiView>

                  <MotiView
                    style={{ marginRight: 12 }}
                    initial={{ x: 0, opacity: 0 }}
                    enter={{ x: 0, opacity: 1, transition: { delay: 150, damping: 15, stiffness: 120 } }}
                  >
                    <Icon name="image" size={24} color="#FFD700" />
                  </MotiView>

                  <Text style={{ color: '#888888', fontSize: 16 }}>
                    {t('tapToUpload')}
                  </Text>
                </View>
              )}
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#111111',
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    borderRadius: 8,
                    marginRight: 12,
                  }}
                  onPress={handleUploadScreenshot}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <ActivityIndicator size="small" color="#FFD700" style={{ marginRight: 8 }} />
                  ) : null}
                  <Text style={{ color: '#FFFFFF', fontSize: 16 }}>
                    {t('uploadPDF')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    backgroundColor: '#111111',
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    borderRadius: 8,
                  }}
                  onPress={handleUploadImage}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <ActivityIndicator size="small" color="#FFD700" style={{ marginRight: 8 }} />
                  ) : null}
                  <Text style={{ color: '#FFFFFF', fontSize: 16 }}>
                    {t('uploadImage')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Confirm Button */}
        <View style={{ marginBottom: 40 }}>
          <TouchableOpacity
            style={{
              backgroundColor: paymentMethod === PAYMENT_METHODS.BANK_TRANSFER && !screenshotUri ? '#444444' : '#FFD700',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
            }}
            onPress={handleConfirmPayment}
            disabled={paymentMethod === PAYMENT_METHODS.BANK_TRANSFER && !screenshotUri}
          >
            {isUploading ? (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
                  {t('processing')}
                </Text>
              </View>
            ) : (
              <Text style={{ color: paymentMethod === PAYMENT_METHODS.BANK_TRANSFER && !screenshotUri ? '#888888' : '#000000', fontSize: 16, fontWeight: '600' }}>
                {t('confirmPayment')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default PaymentScreen;