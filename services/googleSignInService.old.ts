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

      // Use Expo's proper redirect URI generation
      const redirectUri = AuthSession.makeRedirectUri({
        useProxy: Platform.OS !== 'web', // Use proxy for mobile, direct for web
        scheme: Platform.OS === 'web' ? undefined : 'guru-darshan'
      });

      console.log('🔗 Redirect URI:', redirectUri);
      console.log('� Platform:', Platform.OS);
      console.log('🔄 Using proxy:', Platform.OS !== 'web');

      // Create the auth request with proper Expo AuthSession
      const request = new AuthSession.AuthRequest({
        clientId: this.clientId,
        scopes: ['openid', 'profile', 'email'],
        responseType: AuthSession.ResponseType.Token,
        redirectUri,
        additionalParameters: {},
        extraParams: {
          include_granted_scopes: 'true',
        },
      });

      console.log('📤 Starting auth session...');
      
      const result = await request.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        useProxy: Platform.OS !== 'web',
      });

      console.log('� Auth result type:', result.type);

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

  private buildAuthUrl(redirectUri: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirectUri,
      response_type: 'token', // Implicit flow
      scope: 'openid profile email',
      include_granted_scopes: 'true',
      state: Math.random().toString(36).substring(7), // Simple state parameter
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  private extractAccessTokenFromUrl(url: string): string | null {
    try {
      // For implicit flow, the token comes in the URL fragment (after #)
      const urlParts = url.split('#');
      if (urlParts.length < 2) {
        // Try URL parameters as fallback
        const urlObj = new URL(url);
        return urlObj.searchParams.get('access_token');
      }
      
      const fragment = urlParts[1];
      const params = new URLSearchParams(fragment);
      return params.get('access_token');
    } catch (error) {
      console.error('Error extracting access token:', error);
      return null;
    }
  }

  private async getUserInfo(accessToken: string): Promise<GoogleUser> {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user info: ${response.status}`);
      }

      const userInfo = await response.json();
      return {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        given_name: userInfo.given_name,
        family_name: userInfo.family_name,
        verified_email: userInfo.verified_email,
      };
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  }

  private async storeTokens(tokenResult: any): Promise<void> {
    try {
      await AsyncStorage.setItem('google_access_token', tokenResult.accessToken);
      if (tokenResult.refreshToken) {
        await AsyncStorage.setItem('google_refresh_token', tokenResult.refreshToken);
      }
      console.log('💾 Tokens stored successfully');
    } catch (error) {
      console.error('Error storing tokens:', error);
    }
  }

  async getStoredAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('google_access_token');
    } catch (error) {
      console.error('Error getting stored token:', error);
      return null;
    }
  }

  async signOut(): Promise<void> {
    try {
      console.log('🚪 Signing out from Google...');
      
      // Clear stored tokens
      await AsyncStorage.multiRemove(['google_access_token', 'google_refresh_token']);
      
      console.log('✅ Signed out successfully');
    } catch (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
  }

  // Method to get current configuration status
  getConfiguration(): { clientId: string; redirectUri: string; isConfigured: boolean } {
    return {
      clientId: this.clientId,
      redirectUri: this.redirectUri,
      isConfigured: this.isConfigured(),
    };
  }

  // Helper method to check if we have valid credentials configured
  isConfigured(): boolean {
    return this.clientId !== 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
  }
}

export const googleSignInService = new GoogleSignInService();