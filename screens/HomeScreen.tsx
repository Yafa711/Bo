import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
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
} from 'react-native-paper';
import { MotiView, MotiText, moti } from 'moti';
import { Animated, Easing } from 'react-native-reanimated';
import {
  fetchProducts,
} from '../../services/productService';
import { addToCart, addFavorite } from '../../redux/slices/cartSlice';
import { addFavoriteItem } from '../../redux/slices/favoritesSlice';
import { formatCurrency, truncateText, getInitials } from '../../utils/helpers';
import { ROUTES } from '../../utils/constants';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { products, loading, error } = useSelector((state: RootState) => state.products || { products: [], loading: false, error: null });
  const { user } = useSelector((state: RootState) => state.auth);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Slider data (would normally come from API)
  const sliderData = [
    {
      id: '1',
      image: require('../assets/images/slider1.jpg'),
      title: t('summerCollection'),
      subtitle: t('upTo50Off'),
    },
    {
      id: '2',
      image: require('../assets/images/slider2.jpg'),
      title: t('newArrivals'),
      subtitle: t('exclusiveLaunch'),
    },
    {
      id: '3',
      image: require('../assets/images/slider3.jpg'),
      title: t('flashSale'),
      subtitle: t('limitedTimeOffer'),
    },
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const productsData = await fetchProducts();
      // In a real app, we'd dispatch to products slice
      // For now, we'll just use the data directly
    } catch (err) {
      console.error('Error loading products:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const renderSlider = () => {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToInterval={width}
        decelerationRate="fast"
        onMomentumScrollEnd={e => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentSlide(index);
        }}
        style={{ height: 200, marginBottom: 16 }}
      >
        {sliderData.map((slide, index) => (
          <MotiView
            key={slide.id}
            style={{ width, marginRight: index === sliderData.length - 1 ? 0 : 16 }}
            initial={{ scale: 0.9 }}
            enter={{ scale: 1, transition: { damping: 15, stiffness: 120 } }}
          >
            <View style={{ width, borderRadius: 16, overflow: 'hidden', backgroundColor: '#111111' }}>
              <Image
                source={slide.image}
                style={{ width, height: 150, resizeMode: 'cover' }}
              />
              <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', padding: 12 }}>
                <MotiText
                  style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '600', marginBottom: 4 }}
                  initial={{ y: 20, opacity: 0 }}
                  enter={{ y: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
                >
                  {slide.title}
                </MotiText>
                <Text style={{ color: '#FFD700', fontSize: 16 }}>
                  {slide.subtitle}
                </Text>
              </View>
            </View>
          </MotiView>
        ))}
      </ScrollView>
    );
  };

  const renderProductCard = ({ item }: { item: any }) => {
    const discountPercentage = item.discount_price
      ? Math.round(((item.price - item.discount_price) / item.price) * 100)
      : 0;

    return (
      <MotiView
        key={item.id}
        style={{ width: 160, marginRight: 16 }}
        initial={{ opacity: 0, scale: 0.8 }}
        enter={{
          opacity: 1,
          scale: 1,
          transition: {
            delay: Math.random() * 300, // Random delay for staggered effect
            damping: 15,
            stiffness: 120
          }
        }}
        whileTap={{ scale: 0.95 }}
      >
        <View style={{ backgroundColor: '#111111', borderRadius: 16, overflow: 'hidden' }}>
          {/* Product Image with Zoom Effect */}
          <MotiView
            style={{ position: 'relative', height: 200 }}
            whileTap={{ scale: 1.05 }}
          >
            <Image
              source={{ uri: item.images[0] }}
              style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
            />
            {/* Discount Badge */}
            {item.discount_price && (
              <View style={{
                position: 'absolute',
                top: 8,
                left: 8,
                backgroundColor: '#FF0000',
                color: 'white',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 4,
              }}>
                <Text style={{ fontSize: 12, fontWeight: '600' }}>{discountPercentage}%</Text>
              </View>
            )}
            {/* Favorite Button */}
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(255,255,255,0.1)',
                width: 36,
                height: 36,
                borderRadius: 18,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => {
                if (user) {
                  dispatch(addFavorite(item));
                  dispatch(addFavoriteItem(user.id, item.id));
                } else {
                  navigation.navigate(ROUTES.ADMIN_LOGIN); // Redirect to login
                }
              }}
            >
              <Icon
                name="heart"
                size={20}
                color={user && user.favorites?.includes(item.id) ? '#FFD700' : '#FFFFFF'}
              />
            </TouchableOpacity>
          </MotiView>

          {/* Product Info */}
          <View style={{ padding: 12 }}>
            <MotiText
              style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 4 }}
              initial={{ y: 10, opacity: 0 }}
              enter={{ y: 0, opacity: 1, transition: { delay: 200, damping: 15, stiffness: 120 } }}
              numberOfLines={2}
            >
              {item.title}
            </MotiText>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <View>
                {item.discount_price ? (
                  <>
                    <Text style={{ textDecorationLine: 'line-through', color: '#888888', fontSize: 14 }}>
                      {formatCurrency(item.price)}
                    </Text>
                    <Text style={{ color: '#FFD700', fontSize: 16, fontWeight: '600', marginLeft: 4 }}>
                      {formatCurrency(item.discount_price)}
                    </Text>
                  </>
                ) : (
                  <Text style={{ color: '#FFD700', fontSize: 16, fontWeight: '600' }}>
                    {formatCurrency(item.price)}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={{
                  backgroundColor: '#FFD700',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                }}
                onPress={() => {
                  if (user) {
                    dispatch(addToCart({
                      productId: item.id,
                      title: item.title,
                      price: item.price,
                      discountPrice: item.discount_price,
                      quantity: 1,
                      size: item.sizes[0] || 'Standard',
                      color: item.colors[0] || 'Default',
                      image: item.images[0],
                    }));
                    // Show success feedback
                  } else {
                    navigation.navigate(ROUTES.ADMIN_LOGIN);
                  }
                }}
              >
                <Text style={{ color: '#000000', fontWeight: '600', fontSize: 12 }}>
                  {t('addToCart')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </MotiView>
      );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' }}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={{ color: '#FFFFFF', marginTop: 16 }}>{t('productsLoading')}</Text>
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
      <RefreshControl
        refreshing={refreshing}
        onRefresh={handleRefresh}
        colors={['#FFD700']}
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#FFD700']} />}
      >
        {/* Slider */}
        {renderSlider()}

        {/* Categories Section */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <MotiText
            style={{ fontSize: 20, fontWeight: '600', color: '#FFFFFF', marginBottom: 8 }}
            initial={{ y: 10, opacity: 0 }}
            enter={{ y: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
          >
            {t('categories')}
          </MotiText>
          <Text style={{ color: '#888888', marginBottom: 12 }}>
            {t('exploreOurCuratedSelection')}
          </Text>

          {/* Category Chips - Scrollable */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {/* Would map through categories from API */}
            <View style={{ marginRight: 12 }}>
              <Button mode="outlined" style={{ backgroundColor: 'rgba(255,215,0,0.1)' }}>
                <Text style={{ color: '#FFD700' }}>{t('fashion')}</Text>
              </Button>
            </View>
            <View style={{ marginRight: 12 }}>
              <Button mode="outlined" style={{ backgroundColor: 'rgba(255,215,0,0.1)' }}>
                <Text style={{ color: '#FFD700' }}>{t('electronics')}</Text>
              </Button>
            </View>
            <View style={{ marginRight: 12 }}>
              <Button mode="outlined" style={{ backgroundColor: 'rgba(255,215,0,0.1)' }}>
                <Text style={{ color: '#FFD700' }}>{t('homeDecor')}</Text>
              </Button>
            </View>
          </ScrollView>
        </View>

        {/* Featured Products Section */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <MotiText
            style={{ fontSize: 20, fontWeight: '600', color: '#FFFFFF', marginBottom: 8 }}
            initial={{ y: 10, opacity: 0 }}
            enter={{ y: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
          >
            {t('featuredProducts')}
          </MotiText>

          {/* Staggered Grid for Products */}
          <FlatList
            data={products}
            keyExtractor={item => item.id}
            numColumns={2}
            renderItem={renderProductCard}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
            ListEmptyComponent={
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Text style={{ color: '#888888', textAlign: 'center' }}>
                  {t('noProducts')}
                </Text>
              </View>
            }
          />
        </View>

        {/* Trending Section */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <MotiText
            style={{ fontSize: 20, fontWeight: '600', color: '#FFFFFF', marginBottom: 8 }}
            initial={{ y: 10, opacity: 0 }}
            enter={{ y: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
          >
            {t('trendingNow')}
          </MotiText>
          <Text style={{ color: '#888888', marginBottom: 12 }}>
            {t('mostPopularItems')}
          </Text>

          {/* Horizontal Scroll for Trending */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16 }}>
            {products.slice(0, 4).map((product) => (
              <MotiView
                key={product.id}
                style={{ width: 140, marginRight: 16 }}
                initial={{ opacity: 0, scale: 0.8 }}
                enter={{
                  opacity: 1,
                  scale: 1,
                  transition: {
                    delay: Math.random() * 300,
                    damping: 15,
                    stiffness: 120
                  }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <View style={{ backgroundColor: '#111111', borderRadius: 12, overflow: 'hidden', padding: 8 }}>
                  <Image
                    source={{ uri: product.images[0] }}
                    style={{ width: '100%', height: 120, resizeMode: 'cover', borderRadius: 8 }}
                  />
                  <View style={{ marginTop: 8 }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '500', numberOfLines: 2 }}>
                      {product.title}
                    </Text>
                    <Text style={{ color: '#FFD700', fontSize: 14, fontWeight: '600', marginTop: 4 }}>
                      {formatCurrency(product.price)}
                    </Text>
                  </View>
                </View>
              </MotiView>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;