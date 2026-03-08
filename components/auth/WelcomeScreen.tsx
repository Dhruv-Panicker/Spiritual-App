import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SPIRITUAL_COLORS, SPIRITUAL_GRADIENTS } from '@/constants/SpiritualColors';

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
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 88,
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  titleBlock: {
    alignItems: 'center',
    marginBottom: 24,
  },
  titleLine1: {
    fontSize: 11,
    letterSpacing: 3.5,
    textTransform: 'uppercase',
    color: SPIRITUAL_COLORS.accent,
    fontWeight: '600',
    marginBottom: 4,
  },
  titleLine2: {
    fontSize: 34,
    fontWeight: '700',
    color: SPIRITUAL_COLORS.foreground,
    letterSpacing: 0.5,
    lineHeight: 40,
  },
  imageWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  circleContainer: {
    width: 340,
    height: 340,
    borderRadius: 170,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(193,127,60,0.25)',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  gurudevImage: {
    width: '100%',
    height: '100%',
  },
  panel: {
    marginTop: 24,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(193,127,60,0.15)',
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  signUpButton: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#8b4513',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  signUpGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpButtonText: {
    color: SPIRITUAL_COLORS.primaryForeground,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  logInButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(193,127,60,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logInButtonText: {
    color: SPIRITUAL_COLORS.secondary,
    fontSize: 14,
    letterSpacing: 0.3,
  },
  logInBold: {
    fontWeight: '700',
  },
  footerTagline: {
    fontSize: 10,
    color: 'rgba(139,69,19,0.5)',
    letterSpacing: 0.5,
    marginTop: 20,
    textAlign: 'center',
  },
});
