// Jest setup file for React Native Testing Library
import '@testing-library/jest-native/extend-expect';

// Mock Expo modules
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  AndroidImportance: {
    MAX: 'max',
  },
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
}));

// Create a mock Device object that can be modified in tests
const mockDevice = {
  isDevice: true,
  platformName: 'ios',
};

jest.mock('expo-device', () => mockDevice);

// Export for use in tests
global.mockDevice = mockDevice;

jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {
        eas: {
          projectId: 'test-project-id',
        },
      },
    },
    executionEnvironment: 'standalone',
  },
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock React Native modules - use react-test-renderer's built-in component handling
jest.mock('react-native', () => {
  const React = require('react');
  const mockShare = jest.fn(() => Promise.resolve({ action: 'sharedAction' }));
  
  // For React Native Testing Library, we need components that work with react-test-renderer
  // Use a proper component class/function that can be detected
  const MockComponent = (name: string) => {
    function Component(props: any) {
      return React.createElement(name, props, props.children);
    }
    Component.displayName = name;
    Component.propTypes = {};
    return Component;
  };
  
  return {
    Platform: {
      OS: 'ios',
      select: jest.fn((obj) => obj.ios || obj.default),
      Version: 0,
    },
    Share: {
      share: mockShare,
      sharedAction: 'sharedAction',
    },
    // Use proper component functions for React Native Testing Library
    Text: MockComponent('Text'),
    View: MockComponent('View'),
    ScrollView: MockComponent('ScrollView'),
    TouchableOpacity: MockComponent('TouchableOpacity'),
    ActivityIndicator: MockComponent('ActivityIndicator'),
    TextInput: MockComponent('TextInput'),
    SafeAreaView: MockComponent('SafeAreaView'),
    KeyboardAvoidingView: MockComponent('KeyboardAvoidingView'),
    StyleSheet: {
      create: (styles: any) => styles,
    },
    Alert: {
      alert: jest.fn(),
    },
  };
});

// Mock NativeModules that Share depends on to prevent native module errors
jest.mock('react-native/Libraries/BatchedBridge/NativeModules', () => ({
  NativeActionSheetManager: {
    showShareActionSheetWithOptions: jest.fn(),
    dismissActionSheet: jest.fn(),
  },
  ShareModule: {
    share: jest.fn(),
  },
}));

// Silence console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

