import { MD3DarkTheme as DefaultTheme, configureFonts } from 'react-native-paper';

// Custom luxury dark mode theme
export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    // Primary colors - Luxury dark mode with gold/neon accents
    primary: '#FFD700', // Gold
    onPrimary: '#000000', // Deep black for text on primary

    // Secondary colors
    secondary: '#FF1493', // Deep pink/neon accent
    onSecondary: '#000000',

    // Background colors
    background: '#000000', // Pure black for AMOLED
    surface: '#111111', // Very dark gray for surfaces
    onBackground: '#FFFFFF', // White text on background
    onSurface: '#FFFFFF', // White text on surface

    // Error colors
    error: '#FF0000', // Red
    onError: '#FFFFFF',

    // Text colors with luxury feel
    text: {
      primary: '#FFFFFF',
      secondary: '#E0E0E0',
      disabled: '#888888',
      hint: '#555555',
    },

    // Border and divider colors
    border: '#333333',
    divider: '#222222',

    // Notification colors
    notification: '#FFD700', // Gold
  },
  fonts: configureFonts({
    // Luxury typography - using elegant fonts
    regular: {
      fontFamily: 'System',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '200',
    },
  }),
  // Custom properties for our app
  roundness: 8,
  elevation: {
    level1: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 2,
    },
    level2: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3.84,
      elevation: 4,
    },
    level3: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 5.66,
      elevation: 8,
    },
  },
  // Animation constants
  animation: {
    scale: 0.95, // For button press feedback
    spring: {
      damping: 15,
      stiffness: 120,
      mass: 0.9,
    },
    // Stagger effect timing
    staggerDelay: 70, // ms between each item in staggered grid
  },
};

// Type extension forTheme
export type ThemeType = typeof theme;