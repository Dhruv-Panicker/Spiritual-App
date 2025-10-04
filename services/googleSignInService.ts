import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Complete the auth session for better UX
WebBrowser.maybeCompleteAuthSession();

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  verified_email?: boolean;
}

class GoogleSignInService {
  private clientId = '183688950796-dj2m3hm0stfcdgak76ktki262is0dahi.apps.googleusercontent.com';
  
  constructor() {
    console.log('🔧 Google Sign-In service initialized');
  }

  async signIn(): Promise<GoogleUser | null> {
    try {
      console.log('🔐 Starting Google Sign-In with Expo AuthSession...');

      // Use platform-specific redirect URI
      const redirectUri = Platform.OS === 'web' 
        ? 'http://localhost:8081' 
        : 'https://auth.expo.io/@anonymous/guru-darshan';

      console.log('🔗 Redirect URI:', redirectUri);
      console.log('📱 Platform:', Platform.OS);

      // Create the auth request with proper Expo AuthSession
      const request = new AuthSession.AuthRequest({
        clientId: this.clientId,
        scopes: ['openid', 'profile', 'email'],
        responseType: AuthSession.ResponseType.Token,
        redirectUri,
        extraParams: {
          include_granted_scopes: 'true',
        },
      });

      console.log('📤 Starting auth session...');
      
      const result = await request.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      });

      console.log('📥 Auth result type:', result.type);

      if (result.type === 'success') {
        console.log('✅ Authentication successful!');
        
        if (result.params.access_token) {
          const accessToken = result.params.access_token;
          console.log('🎫 Access token received');

          // Get user info
          const userInfo = await this.getUserInfo(accessToken);
          console.log('👤 User info retrieved:', userInfo);

          // Store tokens
          await this.storeTokens({ accessToken });
          console.log('💾 Tokens stored successfully');

          return userInfo;
        } else {
          console.error('❌ No access token in response');
          return null;
        }
      } else if (result.type === 'cancel') {
        console.log('⚠️ User cancelled sign-in');
        return null;
      } else {
        console.error('❌ Authentication failed:', result);
        return null;
      }
    } catch (error) {
      console.error('❌ Google Sign-In error:', error);
      throw error;
    }
  }

  private async getUserInfo(accessToken: string): Promise<GoogleUser> {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }
    
    return response.json();
  }

  private async storeTokens(tokens: { accessToken: string }): Promise<void> {
    try {
      await AsyncStorage.setItem('@google_access_token', tokens.accessToken);
    } catch (error) {
      console.error('Error storing tokens:', error);
    }
  }

  async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('@google_access_token');
    } catch (error) {
      console.error('Error getting stored token:', error);
      return null;
    }
  }

  async signOut(): Promise<void> {
    try {
      await AsyncStorage.removeItem('@google_access_token');
      console.log('✅ Signed out successfully');
    } catch (error) {
      console.error('❌ Error signing out:', error);
    }
  }

  async isSignedIn(): Promise<boolean> {
    const token = await this.getStoredToken();
    return token !== null;
  }

  // Check if Google Sign-In is properly configured
  isConfigured(): boolean {
    return !!(this.clientId && this.clientId.length > 0);
  }

  // Helper method to check configuration
  checkConfiguration(): void {
    console.log('🔧 Google Sign-In Configuration:');
    console.log('   Client ID:', this.clientId);
    console.log('   Platform:', Platform.OS);
    console.log('   Configured:', this.isConfigured());
    
    const redirectUri = Platform.OS === 'web' 
      ? 'http://localhost:8081' 
      : 'https://auth.expo.io/@anonymous/guru-darshan';
    
    console.log('   Redirect URI:', redirectUri);
  }
}

export const googleSignInService = new GoogleSignInService();
export default googleSignInService;