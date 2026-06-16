import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { loginUser } from '../../redux/slices/authSlice';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Icon,
  TextInput,
  Checkbox,
} from 'react-native-paper';
import { MotiView, MotiText, moti } from 'moti';
import { ROUTES } from '../../utils/constants';
import { useNavigation } from '@react-navigation/native';

const AdminLoginScreen = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Hardcoded super admin credentials as per requirements
      if (email === 'abnbwh@gmail.com' && password === 'Abod#7822') {
        // Dispatch login action (in a real app, this would go through Supabase)
        dispatch(loginUser(email, password, 'Admin User', '1234567890'));
        navigation.navigate(ROUTES.ADMIN_DASHBOARD);
      } else {
        // Try regular login through Supabase for other users
        // dispatch(loginUser(email, password)); // Would come from auth slice
        setError('Invalid credentials');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000000', justifyContent: 'center', padding: 24 }}>
      <View style={{ alignItems: 'center', marginBottom: 32 }}>
        <MotiView
          style={{ width: 80, height: 80, backgroundColor: '#FFD700', borderRadius: 50, justifyContent: 'center', alignItems: 'center' }}
          initial={{ scale: 0.5 }}
          enter={{ scale: 1, transition: { delay: 200, damping: 15, stiffness: 120 } }}
        >
          <Text style={{ fontSize: 28, color: '#000000', fontWeight: '700' }}>DEVA</Text>
        </MotiView>

        <MotiText
          style={{ fontSize: 24, fontWeight: '600', color: '#FFFFFF', marginTop: 16 }}
          initial={{ y: 20, opacity: 0 }}
          enter={{ y: 0, opacity: 1, transition: { delay: 300, damping: 15, stiffness: 120 } }}
        >
          {t('adminLogin')}
        </MotiText>

        <Text style={{ color: '#888888', marginTop: 8 }}>
          {t('pleaseSignInToContinue')}
        </Text>
      </View>

      {error && (
        <View style={{ marginHorizontal: 24, marginBottom: 16 }}>
          <Text style={{ color: '#FF0000', textAlign: 'center' }}>
            {error}
          </Text>
        </View>
      )}

      <View style={{ marginHorizontal: 24 }}>
        <MotiView
          style={{ backgroundColor: '#111111', borderRadius: 12, padding: 16 }}
          initial={{ x: -20, opacity: 0 }}
          enter={{ x: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
        >
          <MotiText
            style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 16 }}
            initial={{ y: 10, opacity: 0 }}
            enter={{ y: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
          >
            {t('credentials')}
          </MotiText>

          <TextInput
            label={t('email')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            placeholder={t('enterEmail')}
            style={{ marginBottom: 16, color: '#FFFFFF' }}
          />

          <TextInput
            label={t('password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder={t('enterPassword')}
            style={{ marginBottom: 16, color: '#FFFFFF' }}
          />

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Checkbox
              status={rememberMe ? 'checked' : 'unchecked'}
              onPress={() => setRememberMe(!rememberMe)}
              color="#FFD700"
            />
            <Text style={{ marginLeft: 8, color: '#E0E0E0', fontSize: 14 }}>
              {t('rememberMe')}
            </Text>
          </View>

          <Button
            mode="contained"
            style={{ backgroundColor: '#FFD700' }}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <ActivityIndicator size="small" color="#000000" />
                <Text style={{ color: '#000000', fontWeight: '600' }}>
                  {t('loggingIn')}
                </Text>
              </View>
            ) : (
              <Text style={{ color: '#000000', fontSize: 16, fontWeight: '600' }}>
                {t('login')}
              </Text>
            )}
          </Button>
        </MotiView>
      </View>

      <View style={{ position: 'absolute', bottom: 24, left: 0, right: 0, alignItems: 'center' }}>
        <Text style={{ color: '#888888', fontSize: 12 }}>
          {t('superAdminCredentials')}:
        </Text>
        <Text style={{ color: '#FFD700', fontSize: 12, fontWeight: '600' }}>
          abnbwh@gmail.com / Abod#7822
        </Text>
      </View>
    </View>
  );
};

export default AdminLoginScreen;