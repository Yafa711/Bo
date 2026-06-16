import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './navigation/AppNavigator';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/i18n'; // Assuming i18n instance is created here
import { SupabaseProvider } from '@supabase/supabase-js';
import { supabase } from './services/supabase'; // Import the supabase client from our service

const App: React.FC = () => {
  return (
    <SupabaseProvider client={supabase}>
      <I18nextProvider i18n={i18n}>
        <SafeAreaProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </I18nextProvider>
    </SupabaseProvider>
  );
};

export default App;