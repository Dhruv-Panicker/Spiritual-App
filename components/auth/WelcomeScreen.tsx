import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SPIRITUAL_COLORS, SPIRITUAL_GRADIENTS } from '@/constants/SpiritualColors';
import { styles } from './styles/WelcomeScreen.styles';

interface WelcomeScreenProps {
  onSignUp: () => void;
  onLogIn: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSignUp, onLogIn }) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={SPIRITUAL_GRADIENTS.peace}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title block */}
          <View style={styles.titleBlock}>
            <Text style={styles.titleLine1}>Sri Sidheshwar</Text>
            <Text style={styles.titleLine2}>SiddhGuru</Text>
          </View>

          {/* Gurudev image – circular container with image clipped to circle */}
          <View style={styles.imageWrap}>
            <View style={styles.circleContainer}>
              <Image
                source={require('@/assets/images/gurudev-main-image.png')}
                style={styles.gurudevImage}
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Bottom panel: Sign up / Log in */}
          <View style={styles.panel}>
            <TouchableOpacity
              style={styles.signUpButton}
              onPress={onSignUp}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[SPIRITUAL_COLORS.primary, SPIRITUAL_COLORS.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.signUpGradient}
              >
                <Text style={styles.signUpButtonText}>Sign Up</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logInButton}
              onPress={onLogIn}
              activeOpacity={0.8}
            >
              <Text style={styles.logInButtonText}>
                Already have an account? <Text style={styles.logInBold}>Log in</Text>
              </Text>
            </TouchableOpacity>

            <Text style={styles.footerTagline}>
              Sri SiddhGuru · Vedic Wisdom · Ancient Path
            </Text>

            <Text style={styles.legalText}>
              By continuing you agree to our{' '}
              <Text
                style={styles.legalLink}
                onPress={() => Linking.openURL('https://doc-hosting.flycricket.io/siddhguruvar-terms-of-use/bacbd503-a1ea-4f96-91cc-c3efd01a9f99/terms')}
              >
                Terms of Use
              </Text>
              {' '}and{' '}
              <Text
                style={styles.legalLink}
                onPress={() => Linking.openURL('https://doc-hosting.flycricket.io/siddhguruvar-privacy-policy/a72d3945-a61a-448e-a4ac-90176d28e8bc/privacy')}
              >
                Privacy Policy
              </Text>
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};
