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
  private clientId = '185946107624-ubrvasfi7tbaf71nmv8nijp3t6t15sn5.apps.googleusercontent.com';
  
  constructor() {
    console.log('🔧 Google Sign-In service initialized');
  }

  async signIn(): Promise<GoogleUser | null> {
    try {
      console.log('🔐 Starting Google Sign-In with Expo AuthSession...');

      // Use Expo's proxy service which provides an HTTPS redirect URI
      // This handles the redirect properly and works with Google Cloud Console
      // For now, hardcode it since we know the format
      // The actual URI will be logged so you can verify it matches Google Console
      let redirectUri = AuthSession.makeRedirectUri();
      
      // If it's not using the proxy (doesn't start with https://auth.expo.io), use the proxy URL
      if (!redirectUri.startsWith('https://auth.expo.io')) {
        redirectUri = 'https://auth.expo.io/@anonymous/spiritual-app';
      }

      console.log('🔗 Redirect URI:', redirectUri);
      console.log('📱 Platform:', Platform.OS);
      console.log('⚠️ IMPORTANT: Add this exact redirect URI to Google Cloud Console!');

      // Use Implicit Flow (token response) - simpler, no PKCE required
      // This should work without code exchange
      const request = new AuthSession.AuthRequest({
        clientId: this.clientId,
        scopes: ['openid', 'profile', 'email'],
        responseType: AuthSession.ResponseType.Token, // Implicit flow - returns token directly
        redirectUri,
        extraParams: {},
      });

      console.log('📤 Starting auth session (implicit flow - token response)...');
      
      const discovery = {
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      };
      
      // promptAsync handles the proxy redirect properly
      const result = await request.promptAsync(discovery);

      console.log('📥 Auth result type:', result.type);
      if (result.type === 'error') {
        console.error('❌ Auth error:', result.error);
        console.error('❌ Error description:', result.error?.message || 'Unknown error');
      }
      console.log('📥 Auth result params:', result.type === 'success' ? Object.keys(result.params) : 'N/A');

      if (result.type === 'success') {
        // Implicit flow returns access_token directly in the URL fragment
        const accessToken = result.params.access_token;
        
        if (accessToken) {
          console.log('🎫 Access token received (implicit flow)');

          // Get user info
          const userInfo = await this.getUserInfo(accessToken);
          console.log('👤 User info retrieved:', userInfo);

          // Store tokens
          await this.storeTokens({ accessToken });
          console.log('💾 Tokens stored successfully');

          return userInfo;
        } else {
          console.error('❌ No access token in response');
          console.error('📄 Available params:', Object.keys(result.params));
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

  private async exchangeCodeForToken(code: string, redirectUri: string, codeVerifier: string): Promise<string | null> {
    try {
      console.log('🔄 Exchanging authorization code for access token (with PKCE)...');
      console.log('🔑 Using code verifier:', codeVerifier ? 'Present' : 'Missing!');
      console.log('🔑 Code verifier length:', codeVerifier.length);
      
      if (!codeVerifier) {
        console.error('❌ Code verifier is missing! PKCE requires code_verifier.');
        return null;
      }
      
      // Exchange the authorization code for an access token with PKCE code_verifier
      const tokenParams = {
        client_id: this.clientId,
        code: code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
        code_verifier: codeVerifier, // PKCE code verifier (required for PKCE flow)
      };
      
      console.log('📤 Token exchange request params:', {
        client_id: tokenParams.client_id,
        code: code.substring(0, 20) + '...',
        redirect_uri: tokenParams.redirect_uri,
        grant_type: tokenParams.grant_type,
        code_verifier: codeVerifier.substring(0, 20) + '...',
      });
      
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(tokenParams).toString(),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('❌ Token exchange failed:', errorText);
        console.error('❌ Status:', tokenResponse.status, tokenResponse.statusText);
        return null;
      }

      const tokenData = await tokenResponse.json();
      console.log('✅ Token exchange successful');
      return tokenData.access_token || null;
    } catch (error) {
      console.error('❌ Error exchanging code for token:', error);
      if (error instanceof Error) {
        console.error('❌ Error message:', error.message);
      }
      return null;
    }
  }

  private async getUserInfo(accessToken: string): Promise<GoogleUser> {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }
    
    const data = await response.json();
    return {
      id: data.id,
      email: data.email,
      name: data.name || data.email,
      picture: data.picture,
    };
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

  isConfigured(): boolean {
    return !!(this.clientId && this.clientId.length > 0);
  }
}

export const googleSignInService = new GoogleSignInService();
export default googleSignInService;

