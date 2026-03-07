import React, { useState } from 'react';
import { WelcomeScreen } from './WelcomeScreen';
import { SignUpEmailScreen } from './SignUpEmailScreen';
import { VerifyCodeScreen } from './VerifyCodeScreen';
import { LoginScreen } from './LoginScreen';

type AuthStep = 'welcome' | 'signup-email' | 'verify-code' | 'login';

export const AuthFlow: React.FC = () => {
  const [step, setStep] = useState<AuthStep>('welcome');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpName, setSignUpName] = useState('');

  if (step === 'login') {
    return <LoginScreen onGoToSignUp={() => setStep('welcome')} />;
  }

  if (step === 'welcome') {
    return (
      <WelcomeScreen
        onSignUp={() => setStep('signup-email')}
        onLogIn={() => setStep('login')}
      />
    );
  }

  if (step === 'signup-email') {
    return (
      <SignUpEmailScreen
        onBack={() => setStep('welcome')}
        onCodeSent={(email, name) => {
          setSignUpEmail(email);
          setSignUpName(name);
          setStep('verify-code');
        }}
      />
    );
  }

  return (
    <VerifyCodeScreen
      email={signUpEmail}
      name={signUpName}
      onBack={() => setStep('signup-email')}
    />
  );
};
