import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ScrollView,
  Image,
  ActivityIndicator,
  Modal,
  StyleSheet,
  PanGestureHandler,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import {
  Card,
  Title,
  Paragraph,
  Caption,
  Avatar,
  Button,
  Icon,
  ToastProvider,
  Drawer,
} from 'react-native-paper';
import { MotiView, MotiText, moti } from 'moti';
import { Animated, Easing, PanGestureHandler as ReanimatedPanGestureHandler } from 'react-native-reanimated';
import { useSharedValue, useAnimatedGesture, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { fetchProductById } from '../../services/productService';
import { addToCart } from '../../redux/slices/cartSlice';
import { addFavoriteItem, removeFavoriteItem } from '../../redux/slices/favoritesSlice';
import { formatCurrency, calculateDiscountPercentage } from '../../utils/helpers';
import { ROUTES } from '../../utils/constants';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const ProductDetailsScreen = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute<any>();

  const { product, loading, error } = useSelector((state: RootState) => state.productDetails || { product: null, loading: false, error: null });
  const { user } = useSelector((state: RootState) => state.auth);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Zoom animation values
  const scale = useSharedValue(1);
  const lastScale = useSharedValue(1);
  const originX = useSharedValue(0);
  const originY = useSharedValue(0);

  // Pan gesture for zoom image
  const panGesture = useAnimatedGesture({
    onStart: (_, ctx) => {
      'worklet';
      ctx.startX = originX.value;
      ctx.startY = originY.value;
    },
    onActive: (event, ctx) => {
      'worklet';
      originX.value = ctx.startX + event.translationX;
      originY.value = ctx.startY + event.translationY;
    },
  });

  const panAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [
        { translateX: originX.value },
        { translateY: originY.value },
        { scale: scale.value },
      ],
    };
  });

  // Double tap to reset zoom
  const resetZoom = () => {
    'worklet';
    scale.value = withSpring(1, { damping: 15, stiffness: 120 });
    originX.value = withSpring(0);
    originY.value = withSpring(0);
  };

  // Pinch to zoom
  const pinchGesture = useAnimatedGesture({
    onStart: () => {
      'worklet';
      lastScale.value = scale.value;
    },
    onActive: (event) => {
      'worklet';
      const newScale = Math.min(Math.max(0.5, lastScale.value * event.scale), 3);
      scale.value = withSpring(newScale, { damping: 15, stiffness: 120 });
    },
  });

  const pinchAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ scale: scale.value }],
    };
  });

  useEffect(() => {
    loadProductDetails();
  }, [route.params?.productId]);

  const loadProductDetails = async () => {
    try {
      const productData = await fetchProductById(route.params?.productId);
      // Dispatch to productDetails slice or use state directly
    } catch (err) {
      console.error('Error loading product details:', err);
    }
  };

  if (!route.params?.productId) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' }}>
        <Text style={{ color: '#FF0000' }}>Product ID not provided</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' }}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={{ color: '#FFFFFF', marginTop: 16 }}>Loading product details...</Text>
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

  if (!product) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' }}>
        <Text style={{ color: '#FF0000' }}>Product not found</Text>
      </View>
    );
  }

  const discountPercentage = product.discount_price
    ? calculateDiscountPercentage(product.price, product.discount_price)
    : 0;

  const handleAddToCart = () => {
    if (!user) {
      navigation.navigate(ROUTES.ADMIN_LOGIN);
      return;
    }

    dispatch(addToCart({
      productId: product.id,
      title: product.title,
      price: product.price,
      discountPrice: product.discount_price,
      quantity,
      size: product.sizes[0] || 'Standard',
      color: product.colors[0] || 'Default',
      image: product.images[0],
    }));

    // Show success toast (would use react-native-paper's Snackbar or Toast)
  };

  const handleBuyNow = () => {
    if (!user) {
      navigation.navigate(ROUTES.ADMIN_LOGIN);
      return;
    }
    // Navigate to payment screen with product data
    navigation.navigate(ROUTES.PAYMENT, {
      product: {
        id: product.id,
        title: product.title,
        price: product.price,
        discountPrice: product.discount_price,
        quantity,
        size: product.sizes[0] || 'Standard',
        color: product.colors[0] || 'Default',
        image: product.images[0],
        total: (product.discount_price || product.price) * quantity,
      }
    });
  };

  const handleFavoriteToggle = () => {
    if (!user) {
      navigation.navigate(ROUTES.ADMIN_LOGIN);
      return;
    }

    // Check if already in favorites (would come from state)
    const isFavorited = false; // Placeholder

    if (isFavorited) {
      dispatch(removeFavoriteItem(user.id, product.id));
    } else {
      dispatch(addFavoriteItem(user.id, product.id));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <ToastProvider>
        <View style={{ flex: 1 }}>
          {/* Header with Back Button and Favorite */}
          <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={24} color="#FFD700" />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleFavoriteToggle}>
              <Icon
                name="heart"
                size={24}
                color={user && user.favorites?.includes(product.id) ? '#FFD700' : '#888888'}
              />
            </TouchableOpacity>
          </View>

          {/* Image Gallery with Zoom */}
          <View style={{ height: width, backgroundColor: '#111111' }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} pagingEnabled>
              {product.images.map((imageUrl: string, index: number) => (
                <MotiView
                  key={imageUrl}
                  style={{ width, height: '100%', backgroundColor: '#111111' }}
                  initial={{ opacity: 0 }}
                  enter={{ opacity: 1, transition: { delay: index * 100, damping: 15, stiffness: 120 } }}
                >
                  {/* Zoomable Image */}
                  <PanGestureHandler onGestureEvent={panGesture}>
                    <Animated.View
                      style={[panAnimatedStyle, pinchAnimatedStyle, StyleSheet.absoluteFill]}
                    >
                      <Image
                        source={{ uri: imageUrl }}
                        style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                      />
                    </Animated.View>

                    {/* Double tap to reset zoom */}
                    <TouchableOpacity
                      onPress={resetZoom}
                      style={StyleSheet.absoluteFill}
                    />
                  </PanGestureHandler>
                </MotiView>
              ))}
            </ScrollView>

            {/* Page Indicators */}
            <View style={{
              position: 'absolute',
              bottom: 16,
              left: 0,
              right: 0,
              flexDirection: 'row',
              justifyContent: 'center',
            }}>
              {product.images.map((_, index) => (
                <MotiView
                  key={index}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: selectedImageIndex === index ? '#FFD700' : '#444444',
                    marginHorizontal: 4,
                  }}
                  initial={{ scale: 0.8 }}
                  enter={{ scale: 1, transition: { delay: index * 50, damping: 15, stiffness: 120 } }}
                />
              ))}
            </View>
          </View>

          {/* Product Info */}
          <View style={{ padding: 16, flex: 1 }}>
            <MotiText
              style={{ fontSize: 24, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 }}
              initial={{ y: 10, opacity: 0 }}
              enter={{ y: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
            >
              {product.title}
            </MotiText>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View>
                {product.discount_price ? (
                  <>
                    <Text style={{ textDecorationLine: 'line-through', color: '#888888', fontSize: 16 }}>
                      {formatCurrency(product.price)}
                    </Text>
                    <Text style={{ color: '#FFD700', fontSize: 20, fontWeight: '700', marginLeft: 4 }}>
                      {formatCurrency(product.discount_price)}
                    </Text>
                    <Text style={{ color: '#FF0000', fontSize: 12, marginLeft: 4 }}>
                      -{discountPercentage}%
                    </Text>
                  </>
                ) : (
                  <Text style={{ color: '#FFD700', fontSize: 20, fontWeight: '700' }}>
                    {formatCurrency(product.price)}
                  </Text>
                )}
              </View>

              {/* Stock Indicator */}
              <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, backgroundColor: product.stock > 0 ? 'rgba(0,255,0,0.2)' : 'rgba(255,0,0,0.2)' }}>
                <Text style={{ color: product.stock > 0 ? '#00FF00' : '#FF0000', fontSize: 12, fontWeight: '600' }}>
                  {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                </Text>
              </View>
            </View>

            <Text style={{ color: '#E0E0E0', marginBottom: 16, lineHeight: 24 }}>
              {product.description}
            </Text>

            {/* Variants Section */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
                {t('variants')}
              </Text>

              {/* Sizes */}
              <View style={{ marginBottom: 12 }}>
                <Text style={{ color: '#E0E0E0', marginBottom: 4 }}>{t('size')}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {product.sizes.map((size: string) => (
                    <TouchableOpacity
                      key={size}
                      style={{
                        marginRight: 8,
                        marginBottom: 8,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderWidth: 1,
                        borderColor: '#444444',
                        borderRadius: 4,
                        backgroundColor: '#111111',
                      }}
                    >
                      <Text style={{ color: '#FFFFFF', fontSize: 14 }}>{size}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Colors */}
              <View style={{ marginBottom: 12 }}>
                <Text style={{ color: '#E0E0E0', marginBottom: 4 }}>{t('color')}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {product.colors.map((color: string) => (
                    <TouchableOpacity
                      key={color}
                      style={{
                        marginRight: 8,
                        marginBottom: 8,
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: color,
                        borderWidth: 2,
                        borderColor: '#FFFFFF',
                      }}
                    />
                  ))}
                </View>
              </View>
            </View>

            {/* Quantity Selector */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
                {t('quantity')}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#111111', padding: 8, borderRadius: 8 }}>
                <TouchableOpacity
                  style={{ padding: 8 }}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity === 1}
                >
                  <Icon name="minus" size={20} color={quantity === 1 ? '#888888' : '#FFFFFF'} />
                </TouchableOpacity>

                <Text style={{ marginHorizontal: 16, color: '#FFFFFF', fontSize: 18, fontWeight: '600', minWidth: 24, textAlign: 'center' }}>
                  {quantity}
                </Text>

                <TouchableOpacity
                  style={{ padding: 8 }}
                  onPress={() => setQuantity(quantity + 1)}
                  disabled={quantity > product.stock}
                >
                  <Icon name="plus" size={20} color={quantity > product.stock ? '#888888' : '#FFFFFF'} />
                </TouchableOpacity>
              </View>
              {quantity > product.stock && (
                <Text style={{ color: '#FF0000', fontSize: 12, marginTop: 4 }}>
                  {t('notEnoughStock')}
                </Text>
              )}
            </View>

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#111111',
                  paddingVertical: 14,
                  borderRadius: 10,
                  alignItems: 'center',
                }}
                onPress={handleAddToCart}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
                  {t('addToCart')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#FFD700',
                  paddingVertical: 14,
                  borderRadius: 10,
                  alignItems: 'center',
                }}
                onPress={handleBuyNow}
              >
                <Text style={{ color: '#000000', fontSize: 16, fontWeight: '600' }}>
                  {t('buyNow')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ToastProvider>
    </View>
  );
};

export default ProductDetailsScreen;