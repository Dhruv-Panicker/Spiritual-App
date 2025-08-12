
interface UserLoginData {
  email: string;
  name: string;
  loginTime: string;
  isAdmin: boolean;
}

class BackendService {
  private baseUrl: string;

  constructor() {
    // Replace with your actual backend URL
    this.baseUrl = 'https://your-backend-api.com';
  }

  async logUserLogin(userData: UserLoginData): Promise<boolean> {
    try {
      console.log('Logging user to backend:', userData.email);
      
      // For development, we'll simulate the API call
      // In production, replace this with actual fetch to your backend
      const response = await fetch(`${this.baseUrl}/api/log-user-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      }).catch(() => null);

      if (!response) {
        // Fallback: Log to console for development
        console.log('Backend not available, logging to console:', userData);
        return true;
      }

      return response.ok;
    } catch (error) {
      console.error('Error logging to backend:', error);
      return false;
    }
  }
}

export const backendService = new BackendService();
