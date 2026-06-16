import React from 'react';
import { ThemeProvider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { theme } from './theme';

const AppThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <PaperProvider theme={theme}>
      {children}
    </PaperProvider>
  );
};

export default AppThemeProvider;