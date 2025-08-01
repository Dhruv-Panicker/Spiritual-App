import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import omSymbol from '@/assets/om-symbol.png';

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { login, loginWithGoogle, isLoading } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast({
        title: "Welcome",
        description: "You have been successfully logged in.",
      });
    } catch (error) {
      toast({
        title: "Login Failed", 
        description: "Please check your credentials and try again.",
        variant: "destructive"
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      toast({
        title: "Welcome",
        description: "Successfully logged in with Google.",
      });
    } catch (error) {
      toast({
        title: "Google Login Failed",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-peace flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in-up">
        <Card className="divine-shadow bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <img 
                src={omSymbol} 
                alt="Om Symbol" 
                className="w-16 h-16 sacred-pulse"
              />
            </div>
            <CardTitle className="spiritual-heading text-primary">
              Welcome to Spiritual Wisdom
            </CardTitle>
            <p className="text-muted-foreground">
              Connect with divine teachings and daily inspiration
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="peaceful-transition focus:shadow-meditation"
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="peaceful-transition focus:shadow-meditation"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full sacred-transition hover:shadow-divine"
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : (isSignUp ? 'Sign Up' : 'Sign In')}
              </Button>
            </form>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full sacred-transition hover:shadow-peaceful"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              Continue with Google
            </Button>
            
            <div className="text-center">
              <Button
                variant="ghost"
                className="text-sm text-muted-foreground hover:text-primary"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};