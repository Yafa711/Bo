import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Icon,
  TextInput,
} from 'react-native-paper';
import { MotiView, MotiText, moti } from 'moti';
import { removeFromCart, updateQuantity } from '../../redux/slices/cartSlice';
import { formatCurrency } from '../../utils/helpers';
import { ROUTES } from '../../utils/constants';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const CartScreen = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { cartItems, loading, error } = useSelector((state: RootState) => state.cart || { items: [], loading: false, error: null });

  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0); // Percentage

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((sum, item) => {
      const itemTotal = (item.discountPrice || item.price) * item.quantity;
      return sum + itemTotal;
    }, 0);

    const discountAmount = subtotal * (appliedDiscount / 100);
    const total = subtotal - discountAmount;
    return { subtotal, discountAmount, total };
  };

  const { subtotal, discountAmount, total } = calculateTotal();

  const handleApplyDiscount = () => {
    // In a real app, we would validate the coupon code with the server
    // For demo, we'll accept certain codes
    const validCodes = ['WELCOME10', 'DEVA20', 'RAMADAN15'];
    if (validCodes.includes(discountCode.toUpperCase())) {
      // Extract discount percentage from code (simplified)
      const codeToDiscount: { [key: string]: number } = {
        WELCOME10: 10,
        DEVA20: 20,
        RAMADAN15: 15,
      };
      setAppliedDiscount(codeToDiscount[discountCode.toUpperCase()] || 0);
    } else {
      alert('Invalid discount code');
    }
  };

  const handleRemoveItem = (item: any) => {
    dispatch(removeFromCart({
      productId: item.productId,
      size: item.size,
      color: item.color,
    }));
  };

  const handleQuantityChange = (item: any, quantity: number) => {
    if (quantity <= 0) {
      dispatch(removeFromCart({
        productId: item.productId,
        size: item.size,
        color: item.color,
      }));
    } else {
      dispatch(updateQuantity({
        productId: item.productId,
        size: item.size,
        color: item.color,
        quantity,
      }));
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }
    navigation.navigate(ROUTES.PAYMENT, {
      order: {
        items: cartItems.map(item => ({
          productId: item.productId,
          title: item.title,
          price: item.price,
          discount_price: item.discountPrice,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          image: item.image,
        })),
        total,
      }
    });
  };

  const renderCartItem = ({ item }: { item: any }) => {
    return (
      <MotiView
        key={`${item.productId}-${item.size}-${item.color}`}
        style={{ marginBottom: 16 }}
        initial={{ opacity: 0, scale: 0.8 }}
        enter={{
          opacity: 1,
          scale: 1,
          transition: {
            delay: Math.random() * 200, // Stagger effect
            damping: 15,
            stiffness: 120
          }
        }}
        whileTap={{ scale: 0.95 }}
      >
        <View style={{ backgroundColor: '#111111', borderRadius: 16, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', padding: 12 }}>
            {/* Product Image */}
            <Image
              source={{ uri: item.image }}
              style={{ width: 80, height: 80, borderRadius: 12 }}
            />

            {/* Product Details */}
            <View style={{ flex: 1, marginLeft: 12, justifyContent: 'space-between' }}>
              <View>
                <MotiText
                  style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 4 }}
                  initial={{ y: 5, opacity: 0 }}
                  enter={{ y: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
                >
                  {item.title}
                </MotiText>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  <Text style={{ color: '#888888', fontSize: 12, marginRight: 8 }}>
                    Size: {item.size}
                  </Text>
                  <Text style={{ color: '#888888', fontSize: 12, marginRight: 8 }}>
                    Color: {item.color}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <TouchableOpacity
                    style={{ padding: 6 }}
                    onPress={() => handleQuantityChange(item, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Icon name="minus" size={20} color={item.quantity <= 1 ? '#888888' : '#FFFFFF'} />
                  </TouchableOpacity>

                  <Text style={{ marginHorizontal: 12, fontSize: 16, fontWeight: '600', color: '#FFFFFF', minWidth: 24, textAlign: 'center' }}>
                    {item.quantity}
                  </Text>

                  <TouchableOpacity
                    style={{ padding: 6 }}
                    onPress={() => handleQuantityChange(item, item.quantity + 1)}
                  >
                    <Icon name="plus" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={{ padding: 8, backgroundColor: '#FF0000', borderRadius: 4 }}
                  onPress={() => handleRemoveItem(item)}
                >
                  <Icon name="trash" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Price Info */}
          <View style={{ paddingHorizontal: 12, paddingBottom: 12, flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              {item.discountPrice ? (
                <>
                  <Text style={{ textDecorationLine: 'line-through', color: '#888888', fontSize: 14 }}>
                    {formatCurrency(item.price)}
                  </Text>
                  <Text style={{ color: '#FFD700', fontSize: 16, fontWeight: '600' }}>
                    {formatCurrency(item.discountPrice)}
                  </Text>
                </>
              ) : (
                <Text style={{ color: '#FFD700', fontSize: 16, fontWeight: '600' }}>
                  {formatCurrency(item.price)}
                  </Text>
              )}
            </View>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>
              {formatCurrency((item.discountPrice || item.price) * item.quantity)}
            </Text>
          </View>
        </View>
      </MotiView>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' }}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={{ color: '#FFFFFF', marginTop: 16 }}>{t('loadingCart')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000', padding: 24 }}>
        <Text style={{ color: '#FF0000', textAlign: 'center', marginBottom: 16 }}>{error}</Text>
        <Button mode="contained" onPressed={() => {
          // Would refetch cart
        }}>
          {t('tryAgain')}
        </Button>
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000', padding: 40 }}>
        <MotiText
          style={{ fontSize: 18, fontWeight: '600', color: '#888888', marginBottom: 16 }}
          initial={{ y: 20, opacity: 0 }}
          enter={{ y: 0, opacity: 1, transition: { delay: 200, damping: 15, stiffness: 120 } }}
        >
          {t('cartEmpty')}
        </MotiText>
        <Text style={{ color: '#888888', textAlign: 'center' }}>
          {t('startShopping')}
        </Text>
        <Button mode="contained" onPressed={() => navigation.navigate(ROUTES.HOME)}>
          {t('continueShopping')}
        </Button>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <View style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <MotiText
            style={{ fontSize: 20, fontWeight: '600', color: '#FFFFFF', marginBottom: 8 }}
            initial={{ y: 10, opacity: 0 }}
            enter={{ y: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
          >
            {t('cart')}
          </MotiText>
          <Text style={{ color: '#888888', marginBottom: 16 }}>
            {t('yourSelectedItems')}
          </Text>
        </View>

        {/* Cart Items */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
        >
          <FlatList
            data={cartItems}
            keyExtractor={item => `${item.productId}-${item.size}-${item.color}`}
            renderItem={renderCartItem}
            ListEmptyComponent={
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Text style={{ color: '#888888', textAlign: 'center' }}>
                  {t('cartEmpty')}
                </Text>
              </View>
            }
          />
        </ScrollView>
      </View>

      {/* Summary Section */}
      <View style={{ backgroundColor: '#111111', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
          <Text style={{ fontSize: 16, color: '#E0E0E0' }}>{t('subtotal')}:</Text>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>{formatCurrency(subtotal)}</Text>
        </View>

        {discountAmount > 0 && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={{ fontSize: 16, color: '#E0E0E0' }}>{t('discount')} ({appliedDiscount}%):</Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFD700' }}>{'-' + formatCurrency(discountAmount)}</Text>
          </View>
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ fontSize: 16, color: '#E0E0E0' }}>{t('shipping')}:</Text>
          <Text style={{ fontSize: 16, color: '#FFFFFF' }}>Free</Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderColor: '#333333' }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#FFFFFF' }}>{t('total')}:</Text>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#FFD700' }}>{formatCurrency(total)}</Text>
        </View>

        {/* Discount Code Input */}
        {total > 0 && (
          <View style={{ marginTop: 24 }}>
            <Text style={{ color: '#888888', fontSize: 14, marginBottom: 8 }}>{t('discountCode')}:</Text>
            <View style={{ flexDirection: 'row', backgroundColor: '#111111', borderRadius: 8, overflow: 'hidden' }}>
              <TextInput
                style={{ flex: 1, padding: 12, color: '#FFFFFF' }}
                placeholder={t('enterCode')}
                value={discountCode}
                onChangeText={setDiscountCode}
              />
              <TouchableOpacity
                style={{ backgroundColor: '#FFD700', paddingHorizontal: 16, paddingVertical: 12 }}
                onPress={handleApplyDiscount}
              >
                <Text style={{ color: '#000000', fontSize: 14, fontWeight: '600' }}>
                  {t('apply')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Checkout Button */}
        <View style={{ marginTop: 24 }}>
          <Button
            mode="contained"
            style={{ backgroundColor: '#FFD700' }}
            onPress={handleCheckout}
          >
            <Text style={{ color: '#000000', fontSize: 18, fontWeight: '600' }}>
              {t('proceedToCheckout')} ({cartItems.length})
            </Text>
          </Button>
        </View>
      </View>
    </View>
  );
};

export default CartScreen;