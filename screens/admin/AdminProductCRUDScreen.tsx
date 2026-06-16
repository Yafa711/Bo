import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Dimensions,
  FlatList,
  Modal,
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
  Switch,
  Slider,
  Chip,
} from 'react-native-paper';
import { MotiView, MotiText, moti } from 'moti';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { PermissionsAndroid, Platform } from 'react-native';
import { addProduct, updateProduct, deleteProduct, fetchProducts } from '../../services/productService';
import { formatCurrency } from '../../utils/helpers';
import { ROUTES } from '../../utils/constants';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const AdminProductCRUDScreen = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Form state for adding/editing product
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    discount_price: null,
    images: [],
    sizes: ['Standard'],
    colors: ['Default'],
    stock: 0,
    views: 0,
    category: '',
  });

  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const productsData = await fetchProducts();
      setProducts(productsData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const openImagePicker = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs access to your storage to pick images',
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
        setImageUri(result.uri);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddImage = () => {
    if (imageUri) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUri],
      }));
      setImageUri(null);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      newImages.splice(index, 1);
      return { ...prev, images: newImages };
    });
  };

  const handleAddSize = () => {
    setFormData(prev => ({
      ...prev,
      sizes: [...prev.sizes, 'New Size'],
    }));
  };

  const handleRemoveSize = (index: number) => {
    setFormData(prev => {
      const newSizes = [...prev.sizes];
      newSizes.splice(index, 1);
      return { ...prev, sizes: newSizes };
    });
  };

  const handleAddColor = () => {
    setFormData(prev => ({
      ...prev,
      colors: [...prev.colors, 'New Color'],
    }));
  };

  const handleRemoveColor = (index: number) => {
    setFormData(prev => {
      const newColors = [...prev.colors];
      newColors.splice(index, 1);
      return { ...prev, colors: newColors };
    });
  };

  const handleSaveProduct = async () => {
    // Basic validation
    if (!formData.title || !formData.description || formData.price <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (editMode && currentProduct) {
        // Update existing product
        await updateProduct(currentProduct.id, formData);
        setEditMode(false);
        setCurrentProduct(null);
      } else {
        // Add new product
        await addProduct(formData);
      }
      setFormData({
        title: '',
        description: '',
        price: 0,
        discount_price: null,
        images: [],
        sizes: ['Standard'],
        colors: ['Default'],
        stock: 0,
        views: 0,
        category: '',
      });
      setModalVisible(false);
      await loadProducts(); // Refresh list
    } catch (err) {
      alert('Failed to save product: ' + err.message);
    }
  };

  const handleEditProduct = (product: any) => {
    setEditMode(true);
    setCurrentProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price,
      discount_price: product.discount_price,
      images: product.images,
      sizes: product.sizes,
      colors: product.colors,
      stock: product.stock,
      views: product.views,
      category: product.category,
    });
    setModalVisible(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
        await loadProducts();
      } catch (err) {
        alert('Failed to delete product: ' + err.message);
      }
    }
  };

  const renderProductItem = ({ item }: { item: any }) => {
    return (
      <MotiView
        key={item.id}
        style={{ marginBottom: 12 }}
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
        <View style={{ backgroundColor: '#111111', borderRadius: 12, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', padding: 12 }}>
            {/* Product Image */}
            <Image
              source={{ uri: item.images[0] || require('../assets/images/placeholder.png') }}
              style={{ width: 60, height: 60, borderRadius: 8 }}
            />

            {/* Product Details */}
            <View style={{ flex: 1, marginLeft: 12 }}>
              <MotiText
                style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 4 }}
                initial={{ y: 5, opacity: 0 }}
                enter={{ y: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
                numberOfLines={1}
              >
                {item.title}
              </MotiText>

              <Text style={{ color: '#888888', fontSize: 12 }}>
                {item.category || 'Uncategorized'}
              </Text>
            </View>

            {/* Price */}
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              {item.discount_price ? (
                <>
                  <Text style={{ textDecorationLine: 'line-through', color: '#888888', fontSize: 12 }}>
                    {formatCurrency(item.price)}
                  </Text>
                  <Text style={{ color: '#FFD700', fontSize: 14, fontWeight: '600' }}>
                    {formatCurrency(item.discount_price)}
                  </Text>
                </>
              ) : (
                <Text style={{ color: '#FFD700', fontSize: 14, fontWeight: '600' }}>
                  {formatCurrency(item.price)}
                </Text>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{ padding: 12, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button
              mode="text"
              onPress={() => handleEditProduct(item)}
            >
              <Icon name="pencil" size={20} color="#FFD700" />
              <Text>{t('edit')}</Text>
            </Button>

            <Button
              mode="text"
              onPress={() => handleDeleteProduct(item.id)}
            >
              <Icon name="trash" size={20} color="#FF0000" />
              <Text>{t('delete')}</Text>
            </Button>
          </View>
        </View>
      </MotiView>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <MotiText
            style={{ fontSize: 20, fontWeight: '600', color: '#FFFFFF', marginBottom: 8 }}
            initial={{ x: -20, opacity: 0 }}
            enter={{ x: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
          >
            {t('productManagement')}
          </MotiText>

          <Button
            mode="contained"
            style={{ backgroundColor: '#FFD700' }}
            onPress={() => {
              setEditMode(false);
              setCurrentProduct(null);
              setFormData({
                title: '',
                description: '',
                price: 0,
                discount_price: null,
                images: [],
                sizes: ['Standard'],
                colors: ['Default'],
                stock: 0,
                views: 0,
                category: '',
              });
              setModalVisible(true);
            }}
          >
            <Icon name="add" size={20} color="#000000" />
            <Text style={{ marginLeft: 4, color: '#000000', fontWeight: '600' }}>
              {t('addProduct')}
            </Text>
          </Button>
        </View>

        {error && (
          <View style={{ marginVertical: 12 }}>
            <Text style={{ color: '#FF0000', textAlign: 'center' }}>
              {error}
            </Text>
          </View>
        )}

        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#FFD700']}
        />

        <ScrollView
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#FFD700']} }}>
          {/* Products List */}
          {loading ? (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#FFD700" />
              <Text style={{ color: '#FFFFFF', marginTop: 16 }}>{t('loadingProducts')}</Text>
            </View>
          ) : products.length === 0 ? (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <Text style={{ color: '#888888', textAlign: 'center' }}>
                {t('noProductsFound')}
              </Text>
              <Button mode="contained" onPress={() => {
                setEditMode(false);
                setCurrentProduct(null);
                setFormData({
                  title: '',
                  description: '',
                  price: 0,
                  discount_price: null,
                  images: [],
                  sizes: ['Standard'],
                  colors: ['Default'],
                  stock: 0,
                  views: 0,
                  category: '',
                });
                setModalVisible(true);
              }}>
                {t('addFirstProduct')}
              </Button>
            </View>
          ) : (
            <FlatList
              data={products}
              keyExtractor={item => item.id}
              renderItem={renderProductItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
            />
          )}
        </ScrollView>
      </View>

      {/* Add/Edit Product Modal */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="slide"
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: '#111111', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 }}>
            <MotiText
              style={{ fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginBottom: 16 }}
              initial={{ y: 20, opacity: 0 }}
              enter={{ y: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
            >
              {editMode ? t('editProduct') : t('addProduct')}
            </MotiText>

            <ScrollView
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Title */}
              <TextInput
                label={t('title')}
                value={formData.title}
                onChangeText={text => setFormData(prev => ({ ...prev, title: text }))}
                placeholder={t('enterProductTitle')}
                style={{ marginBottom: 16, color: '#FFFFFF' }}
              />

              {/* Description */}
              <TextInput
                label={t('description')}
                value={formData.description}
                onChangeText={text => setFormData(prev => ({ ...prev, description: text }))}
                placeholder={t('enterProductDescription')}
                mode="outlined"
                style={{ marginBottom: 16, color: '#FFFFFF' }}
              />

              {/* Price */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: '#888888', marginBottom: 4 }}>{t('price')}:</Text>
                <View style={{ flexDirection: 'row', backgroundColor: '#111111', borderRadius: 8, overflow: 'hidden' }}>
                  <TextInput
                    style={{ flex: 1, padding: 12, color: '#FFFFFF', keyboardType: 'numeric' }}
                    value={formData.price.toString()}
                    onChangeText={text => {
                      const num = parseFloat(text) || 0;
                      setFormData(prev => ({ ...prev, price: num }));
                    }}
                  />
                </View>
              </View>

              {/* Discount Price */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: '#888888', marginBottom: 4 }}>{t('discountPrice')} (Optional):</Text>
                <View style={{ flexDirection: 'row', backgroundColor: '#111111', borderRadius: 8, overflow: 'hidden' }}>
                  <TextInput
                    style={{ flex: 1, padding: 12, color: '#FFFFFF', keyboardType: 'numeric' }}
                    value={formData.discount_price ? formData.discount_price.toString() : ''}
                    onChangeText={text => {
                      const num = text ? parseFloat(text) : null;
                      setFormData(prev => ({ ...prev, discount_price: num }));
                    }}
                  />
                </View>
              </View>

              {/* Images */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: '#888888', marginBottom: 4 }}>{t('productImages')}:</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {formData.images.map((imageUrl: string, index: number) => (
                    <MotiView
                      key={imageUrl}
                      style={{ width: 80, height: 80, marginRight: 8, marginBottom: 8 }}
                      initial={{ scale: 0.8 }}
                      enter={{ scale: 1, transition: { delay: index * 50, damping: 15, stiffness: 120 } }}
                    >
                      <Image
                        source={{ uri: imageUrl }}
                        style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 8 }}
                      />
                      <TouchableOpacity
                        style={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', width: 20, height: 20, justifyContent: 'center', alignItems: 'center' }}
                        onPress={() => handleRemoveImage(index)}
                      >
                        <Icon name="close" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </MotiView>
                  ))}
                  <View style={{ marginRight: 8, marginBottom: 8 }}>
                    <TouchableOpacity
                      style={{ width: 80, height: 80, backgroundColor: '#111111', borderRadius: 8, justifyContent: 'center', alignItems: 'center' }}
                      onPress={openImagePicker}
                    >
                      {imageUri ? (
                        <Image
                          source={{ uri: imageUri }}
                          style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 8 }}
                        )
                      : (
                        <View>
                          <Icon name="camera" size={20} color="#FFD700" />
                          <Text style={{ marginTop: 4, fontSize: 12, color: '#FFFFFF' }}>{t('addImage')}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {imageUri && (
                  <View style={{ marginTop: 8 }}>
                    <Button mode="text" onPress={handleAddImage}>
                      <Icon name="check" size={16} color="#000000" />
                      <Text>{t('addCurrentImage')}</Text>
                    </Button>
                  </View>
                )}
              </View>

              {/* Sizes */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: '#888888', marginBottom: 4 }}>{t('sizes')}:</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {formData.sizes.map((size: string, index: number) => (
                    <MotiView
                      key={size}
                      style={{ backgroundColor: '#111111', paddingHorizontal: 8, paddingVertical: 4, marginRight: 4, marginBottom: 4, borderRadius: 4 }}
                      initial={{ scale: 0.8 }}
                      enter={{ scale: 1, transition: { delay: index * 50, damping: 15, stiffness: 120 } }}
                    >
                      <Text style={{ color: '#FFFFFF', fontSize: 12 }}>{size}</Text>
                      <TouchableOpacity
                        style={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', width: 20, height: 20, justifyContent: 'center', alignItems: 'center' }}
                        onPress={() => handleRemoveSize(index)}
                      >
                        <Icon name="close" size={12} color="#FFFFFF" />
                      </TouchableOpacity>
                    </MotiView>
                  ))}
                  <TouchableOpacity
                    style={{ backgroundColor: '#111111', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}
                    onPress={handleAddSize}
                  >
                    <Icon name="plus" size={14} color="#FFD700" />
                    <Text style={{ marginLeft: 4, color: '#FFFFFF' }}>{t('addSize')}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Colors */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: '#888888', marginBottom: 4 }}>{t('colors')}:</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {formData.colors.map((color: string, index: number) => (
                    <MotiView
                      key={color}
                      style={{ width: 24, height: 24, borderRadius: 12, marginRight: 4, marginBottom: 4 }}
                      initial={{ scale: 0.8 }}
                      enter={{ scale: 1, transition: { delay: index * 50, damping: 15, stiffness: 120 } }}
                    >
                      <View style={{ backgroundColor: color }} />
                      <TouchableOpacity
                        style={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', width: 20, height: 20, justifyContent: 'center', alignItems: 'center' }}
                        onPress={() => handleRemoveColor(index)}
                      >
                        <Icon name="close" size={12} color="#FFFFFF" />
                      </TouchableOpacity>
                    </MotiView>
                  ))}
                  <TouchableOpacity
                    style={{ backgroundColor: '#111111', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}
                    onPress={handleAddColor}
                  >
                    <Icon name="plus" size={14} color="#FFD700" />
                    <Text style={{ marginLeft: 4, color: '#FFFFFF' }}>{t('addColor')}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Stock */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: '#888888', marginBottom: 4 }}>{t('stock')}:</Text>
                <View style={{ flexDirection: 'row', backgroundColor: '#111111', borderRadius: 8, overflow: 'hidden' }}>
                  <TextInput
                    style={{ flex: 1, padding: 12, color: '#FFFFFF', keyboardType: 'numeric' }}
                    value={formData.stock.toString()}
                    onChangeText={text => {
                      const num = parseInt(text) || 0;
                      setFormData(prev => ({ ...prev, stock: num }));
                    }}
                  />
                </View>
              </View>

              {/* Category */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: '#888888', marginBottom: 4 }}>{t('category')}:</Text>
                <TextInput
                  label={t('category')}
                  value={formData.category}
                  onChangeText={text => setFormData(prev => ({ ...prev, category: text }))}
                  placeholder={t('enterCategory')}
                  style={{ marginBottom: 16, color: '#FFFFFF' }}
                />
              </View>
            </ScrollView>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
              <Button
                mode="outlined"
                onPress={() => {
                  setModalVisible(false);
                  setEditMode(false);
                  setCurrentProduct(null);
                  setFormData({
                    title: '',
                    description: '',
                    price: 0,
                    discount_price: null,
                    images: [],
                    sizes: ['Standard'],
                    colors: ['Default'],
                    stock: 0,
                    views: 0,
                    category: '',
                  });
                }}
              >
                <Icon name="close" size={20} color="#FFFFFF" />
                <Text>{t('cancel')}</Text>
              </Button>

              <Button
                mode="contained"
                style={{ backgroundColor: '#FFD700' }}
                onPress={handleSaveProduct}
                disabled={loading}
              >
                {loading ? (
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <ActivityIndicator size="small" color="#000000" />
                    <Text style={{ color: '#000000', fontWeight: '600' }}>
                      {t('saving')}
                    </Text>
                  </View>
                ) : (
                  <Text style={{ color: '#000000', fontSize: 16, fontWeight: '600' }}>
                    {editMode ? t('updateProduct') : t('saveProduct')}
                  </Text>
                )}
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AdminProductCRUDScreen;