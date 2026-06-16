import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  RefreshControl,
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
} from 'react-native-paper';
import { MotiView, MotiText, moti } from 'moti';
import { removeFavoriteItem } from '../../redux/slices/favoritesSlice';
import { formatCurrency } from '../../utils/helpers';
import { ROUTES } from '../../utils/constants';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const FavoritesScreen = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { favorites, loading, error } = useSelector((state: RootState) => state.favorites || { items: [], loading: false, error: null });
  const { user } = useSelector((state: RootState) => state.auth);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      // In a real app, we would fetch favorites from the server
      // For now, we're using the redux state which is updated via async thunks
    }
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Would refetch favorites from server
    setRefreshing(false);
  };

  const renderFavoriteItem = ({ item }: { item: any }) => {
    return (
      <MotiView
        key={item.productId}
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
          {/* Product Image */}
          <Image
            source={{ uri: item.image }}
            style={{ width: '100%', height: 200, resizeMode: 'cover' }}
          />
          {/* Favorite Button (to remove) */}
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
                dispatch(removeFavoriteItem(user.id, item.productId));
              }
            }}
          >
            <Icon name="heart" size={20} color="#FF0000" />
          </TouchableOpacity>

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
                {item.discountPrice ? (
                  <>
                    <Text style={{ textDecorationLine: 'line-through', color: '#888888', fontSize: 14 }}>
                      {formatCurrency(item.price)}
                    </Text>
                    <Text style={{ color: '#FFD700', fontSize: 16, fontWeight: '600', marginLeft: 4 }}>
                      {formatCurrency(item.discountPrice)}
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
                  navigation.navigate(ROUTES.PRODUCT_DETAILS, { productId: item.productId });
                }}
              >
                <Text style={{ color: '#000000', fontWeight: '600', fontSize: 12 }}>
                  {t('viewDetails')}
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
        <Text style={{ color: '#FFFFFF', marginTop: 16 }}>{t('loadingFavorites')}</Text>
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

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' }}>
        <MotiText
          style={{ fontSize: 20, fontWeight: '600', color: '#FFFFFF', marginBottom: 24 }}
          initial={{ y: 20, opacity: 0 }}
          enter={{ y: 0, opacity: 1, transition: { delay: 200, damping: 15, stiffness: 120 } }}
        >
          {t('pleaseLoginToViewFavorites')}
        </MotiText>
        <Button mode="contained" onPressed={() => navigation.navigate(ROUTES.ADMIN_LOGIN)}>
          {t('login')}
        </Button>
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000', padding: 40 }}>
        <MotiText
          style={{ fontSize: 18, fontWeight: '600', color: '#888888', marginBottom: 16 }}
          initial={{ y: 20, opacity: 0 }}
          enter={{ y: 0, opacity: 1, transition: { delay: 200, damping: 15, stiffness: 120 } }}
        >
          {t('favoritesEmpty')}
        </MotiText>
        <Text style={{ color: '#888888', textAlign: 'center' }}>
          {t('startAddingFavorites')}
        </Text>
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
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <MotiText
            style={{ fontSize: 20, fontWeight: '600', color: '#FFFFFF', marginBottom: 8 }}
            initial={{ y: 10, opacity: 0 }}
            enter={{ y: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
          >
            {t('favorites')}
          </MotiText>
          <Text style={{ color: '#888888', marginBottom: 12 }}>
            {t('yourSavedItems')}
          </Text>
        </View>

        {/* Staggered Grid for Favorites */}
        <FlatList
          data={favorites}
          keyExtractor={item => item.productId}
          numColumns={2}
          renderItem={renderFavoriteItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          ListEmptyComponent={
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Text style={{ color: '#888888', textAlign: 'center' }}>
                {t('favoritesEmpty')}
              </Text>
            </View>
          }
        />
      </ScrollView>
    </View>
  );
};

export default FavoritesScreen;