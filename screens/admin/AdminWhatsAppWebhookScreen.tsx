import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  Dimensions,
  Switch,
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
  SwitchListItem,
  Dialog,
  Avatar,
  Badge,
  ProgressBar,
} from 'react-native-paper';
import { MotiView, MotiText, moti } from 'moti';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { ROUTES } from '../../utils/constants';
import { useNavigation } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native-paper';

const { width } = Dimensions.get('window');

const AdminWhatsAppWebhookScreen = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [webhookStatus, setWebhookStatus] = useState({
    url: '',
    isActive: false,
    lastTriggered: null,
    successCount: 0,
    failedCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Test form states
  const [testPhone, setTestPhone] = useState('+967782282586'); // Default to the number from requirements
  const [testMessage, setTestMessage] = useState('');
  const [testLoading, setTestLoading] = useState(false);

  // Dialog states
  const [webhookDialogVisible, setWebhookDialogVisible] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookActive, setWebhookActive] = useState(false);

  useEffect(() => {
    loadWebhookStatus();
  }, []);

  const loadWebhookStatus = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from your backend or Supabase
      // For now, we'll simulate with default values
      const status = {
        url: 'https://your-webhook-endpoint.com/whatsapp',
        isActive: true,
        lastTriggered: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        successCount: 124,
        failedCount: 3,
      };
      setWebhookStatus(status);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWebhookStatus();
    setRefreshing(false);
  };

  const handleEditWebhook = () => {
    setWebhookUrl(webhookStatus.url);
    setWebhookActive(webhookStatus.isActive);
    setWebhookDialogVisible(true);
  };

  const handleSaveWebhook = async () => {
    if (!webhookUrl.trim()) return;

    try {
      // In a real app, this would save to your backend or Supabase
      // For now, we'll just update the state
      setWebhookStatus({
        ...webhookStatus,
        url: webhookUrl.trim(),
        isActive: webhookActive,
      });
      setWebhookDialogVisible(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTestWebhook = async () => {
    if (!testPhone.trim()) return;

    setTestLoading(true);
    try {
      // In a real app, this would trigger a test webhook call
      // For now, we'll simulate success
      setTestLoading(false);
      // Update success count
      setWebhookStatus(prev => ({
        ...prev,
        successCount: prev.successCount + 1,
        lastTriggered: new Date().toISOString(),
      }));
    } catch (err) {
      setTestLoading(false);
      setError(err.message);
      // Update failed count
      setWebhookStatus(prev => ({
        ...prev,
        failedCount: prev.failedCount + 1,
        lastTriggered: new Date().toISOString(),
      }));
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' }}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={{ color: '#FFFFFF', marginTop: 16 }}>{t('loading')}</Text>
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
            {t('whatsappWebhook')}
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
          {/* Webhook Status */}
          <View style={{ marginBottom: 32 }}>
            <MotiText
              style={{ fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginBottom: 12 }}
              initial={{ y: 10, opacity: 0 }}
              enter={{ y: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
            >
              {t('webhookStatus')}
            </MotiText>

            <Button mode="outlined" onPressed={handleEditWebhook} style={{ marginBottom: 12 }}>
              <Icon name="settings" size={20} color="#FFD700" />
              <Text style={{ marginLeft: 4, color: '#FFD700' }}>{t('editWebhook')}</Text>
            </Button>

            {error && (
              <Text style={{ color: '#FF0000', marginBottom: 12 }}>{error}</Text>
            )}

            <View style={{ backgroundColor: '#111111', borderRadius: 16, padding: 16 }}>
              {webhookDialogVisible && (
                <View style={{ marginBottom: 16 }}>
                  <Input
                    label={t('webhookUrl')}
                    value={webhookUrl}
                    onChangeText={setWebhookUrl}
                    autoFocus
                  />
                  <SwitchListItem
                    label={t('active')}
                    value={webhookActive}
                    onValueChange={setWebhookActive}
                  />
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
                    <Button mode="text" onPress={() => setWebhookDialogVisible(false)}>
                      {t('cancel')}
                    </Button>
                    <Button mode="contained" onPress={handleSaveWebhook}>
                      {t('save')}
                    </Button>
                  </View>
                </View>
              )}

              <List>
                <ListItem
                  title={t('webhookUrl')}
                  description={webhookStatus.url}
                  left={(props) => <Avatar.Icon size={56} icon="web" color="#FFD700" {...props} />}
                />
                <ListItem
                  title={t('status')}
                  description={webhookStatus.isActive ? t('active') : t('inactive')}
                  left={(props) => <Avatar.Icon size={56} icon={webhookStatus.isActive ? 'check-circle' : 'cancel'} color={webhookStatus.isActive ? '#00FF00' : '#FF0000'} {...props} />}
                />
                <ListItem
                  title={t('lastTriggered')}
                  description={webhookStatus.lastTriggered ? new Date(webhookStatus.lastTriggered).toLocaleString() : t('never')}
                  left={(props) => <Avatar.Icon size={56} icon="history" color="#FFD700" {...props} />}
                />
                <ListItem
                  title={t('successCount')}
                  description={webhookStatus.successCount.toString()}
                  left={(props) => <Avatar.Icon size={56} icon="check-circle" color="#00FF00" {...props} />}
                />
                <ListItem
                  title={t('failedCount')}
                  description={webhookStatus.failedCount.toString()}
                  left={(props) => <Avatar.Icon size={56} icon="cancel" color="#FF0000" {...props} />}
                />
              </List>
            </View>
          </View>

          {/* Test Webhook Section */}
          <View style={{ marginBottom: 32 }}>
            <MotiText
              style={{ fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginBottom: 12 }}
              initial={{ y: 10, opacity: 0 }}
              enter={{ y: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
            >
              {t('testWebhook')}
            </MotiText>

            <View style={{ backgroundColor: '#111111', borderRadius: 16, padding: 16 }}>
              <Input
                label={t('phoneNumber')}
                value={testPhone}
                onChangeText={setTestPhone}
                placeholder={t('enterPhoneNumber')}
                autoFocus
              />
              <Input
                label={t('testMessage')}
                value={testMessage}
                onChangeText={setTestMessage}
                placeholder={t('enterTestMessage')}
              />
              <View style={{ marginTop: 16, flexDirection: 'row', justifyContent: 'flex-end' }}>
                <Button mode="text" onPress={() => {
                  setTestPhone('+967782282586');
                  setTestMessage('');
                }}>
                  {t('reset')}
                </Button>
                <Button
                  mode="contained"
                  onPress={handleTestWebhook}
                  loading={testLoading}
                >
                  {testLoading ? t('testing') : t('sendTest')}
                </Button>
              </View>
            </View>
          </View>

          {/* Webhook Information */}
          <View style={{ marginBottom: 32 }}>
            <MotiText
              style={{ fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginBottom: 12 }}
              initial={{ y: 10, opacity: 0 }}
              enter={{ y: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
            >
              {t('webhookInfo')}
            </MotiText>

            <View style={{ backgroundColor: '#111111', borderRadius: 16, padding: 16 }}>
              <List>
                <ListItem
                  title={t('webhookPurpose')}
                  description={t('webhookPurposeDescription')}
                  left={(props) => <Avatar.Icon size={56} icon="info" color="#FFD700" {...props} />}
                />
                <ListItem
                  title={t('defaultNumber')}
                  description={'+967782282586'}
                  left={(props) => <Avatar.Icon size={56} icon="phone" color="#FFD700" {...props} />}
                />
                <ListItem
                  title={t('eventsTriggered')}
                  description={t('eventsTriggeredDescription')}
                  left={(props) => <Avatar.Icon size={56} icon="bell" color="#FFD700" {...props} />}
                />
                <ListItem
                  title={t('dataSent')}
                  description={t('dataSentDescription')}
                  left={(props) => <Avatar.Icon size={56} icon="file" color="#FFD700" {...props} />}
                />
              </List>
            </View>
          </View>

          {/* Setup Instructions */}
          <View>
            <MotiText
              style={{ fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginBottom: 12 }}
              initial={{ y: 10, opacity: 0 }}
              enter={{ y: 0, opacity: 1, transition: { delay: 100, damping: 15, stiffness: 120 } }}
            >
              {t('setupInstructions')}
            </MotiText>

            <View style={{ backgroundColor: '#111111', borderRadius: 16, padding: 16 }}>
              <Paragraph style={{ color: '#E0E0E0', lineHeight: 22 }}>
                {t('setupStep1')}
              </Paragraph>
              <Paragraph style={{ color: '#E0E0E0', lineHeight: 22 }}>
                {t('setupStep2')}
              </Paragraph>
              <Paragraph style={{ color: '#E0E0E0', lineHeight: 22 }}>
                {t('setupStep3')}
              </Paragraph>
              <Paragraph style={{ color: '#E0E0E0', lineHeight: 22 }}>
                {t('setupStep4')}
              </Paragraph>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

// Helper component for input (simplified)
const Input = ({ label, value, onChangeText, placeholder, ...props }: any) => (
  <View style={{ marginBottom: 16 }}>
    <Text style={{ color: '#FFFFFF', marginBottom: 4 }}>{label}</Text>
    <TextInput
      style={{
        backgroundColor: '#333333',
        borderRadius: 8,
        padding: 12,
        color: '#FFFFFF',
        ...props
      }}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#888888"
    />
  </View>
);

export default AdminWhatsAppWebhookScreen;