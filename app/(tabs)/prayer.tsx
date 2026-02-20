import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { SPIRITUAL_COLORS, SPIRITUAL_GRADIENTS, SPIRITUAL_SHADOWS } from '@/constants/SpiritualColors';
import { googleSheetsService } from '@/services/googleSheetsService';
import { env } from '@/config/env';

const { height: screenHeight } = Dimensions.get('window');
const PRAYER_MAX_LENGTH = 3000;

export default function PrayerScreen() {
  const [name, setName] = useState('');
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [phoneAreaCode, setPhoneAreaCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [prayer, setPrayer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library to add a photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const removePhoto = () => {
    setPhotoUri(null);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const isEmailValid = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const mandatoryFilled = useMemo(() => {
    const n = name.trim();
    const d = dobDay.trim();
    const m = dobMonth.trim();
    const y = dobYear.trim();
    const c = city.trim();
    const co = country.trim();
    const ac = phoneAreaCode.trim();
    const pn = phoneNumber.trim();
    const em = email.trim();
    const pr = prayer.trim();
    return (
      n.length > 0 &&
      d.length > 0 &&
      m.length > 0 &&
      y.length > 0 &&
      c.length > 0 &&
      co.length > 0 &&
      ac.length > 0 &&
      pn.length > 0 &&
      em.length > 0 &&
      isEmailValid(em) &&
      pr.length > 0 &&
      pr.length <= PRAYER_MAX_LENGTH
    );
  }, [name, dobDay, dobMonth, dobYear, city, country, phoneAreaCode, phoneNumber, email, prayer]);

  const handleSubmit = async () => {
    if (!mandatoryFilled || isSubmitting) return;
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsSubmitting(true);
    const userEmail = email.trim();
    try {
      let photoBase64: string | null = null;
      let photoMimeType = 'image/jpeg';
      if (photoUri && Platform.OS !== 'web') {
        try {
          photoBase64 = await FileSystem.readAsStringAsync(photoUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          if (photoUri.toLowerCase().includes('.png')) photoMimeType = 'image/png';
        } catch (e) {
          console.warn('Could not read photo as base64:', e);
        }
      }
      await googleSheetsService.submitPrayer(
        {
          name: name.trim(),
          dateOfBirth: `${dobDay.trim()}/${dobMonth.trim()}/${dobYear.trim()}`,
          city: city.trim(),
          country: country.trim(),
          phone: `${phoneAreaCode.trim()} ${phoneNumber.trim()}`.trim(),
          email: userEmail,
          prayer: prayer.trim(),
          hasPhoto: !!photoUri,
          ...(photoBase64 && { photoBase64, photoMimeType }),
        },
        env.prayerRecipientEmail
      );
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert(
        'Prayer sent',
        `Your prayer has been submitted. A confirmation email has been sent to ${userEmail}. May Gurudev's blessings be with you.`,
        [{ text: 'OK' }]
      );
      setName('');
      setDobDay('');
      setDobMonth('');
      setDobYear('');
      setCity('');
      setCountry('');
      setPhotoUri(null);
      setPhoneAreaCode('');
      setPhoneNumber('');
      setEmail('');
      setPrayer('');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Something went wrong. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={SPIRITUAL_GRADIENTS.peace} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={true}
          >
            {/* Hero / Banner section */}
            <View style={styles.heroContainer}>
              <Image
                source={require('@/assets/images/om-symbol.png')}
                style={styles.heroImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.6)']}
                style={styles.heroOverlay}
              />
              <View style={styles.heroContent}>
                <Text style={styles.heroTitle}>Send a prayer to Gurudev</Text>
                <Text style={styles.heroSubtitle}>
                  Through this medium you can send your prayers and wishes to Gurudev. Your heartfelt
                  words will be received with love and blessings.
                </Text>
              </View>
            </View>

            {/* Form card */}
            <View style={[styles.formCard, SPIRITUAL_SHADOWS.card]}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your full name"
                  placeholderTextColor={SPIRITUAL_COLORS.textMuted}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Date of Birth *</Text>
                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, styles.inputDD]}
                    placeholder="DD"
                    placeholderTextColor={SPIRITUAL_COLORS.textMuted}
                    value={dobDay}
                    onChangeText={setDobDay}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                  <TextInput
                    style={[styles.input, styles.inputMM]}
                    placeholder="MM"
                    placeholderTextColor={SPIRITUAL_COLORS.textMuted}
                    value={dobMonth}
                    onChangeText={setDobMonth}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                  <TextInput
                    style={[styles.input, styles.inputYYYY]}
                    placeholder="YYYY"
                    placeholderTextColor={SPIRITUAL_COLORS.textMuted}
                    value={dobYear}
                    onChangeText={setDobYear}
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>City and Country *</Text>
                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, styles.inputCity]}
                    placeholder="City"
                    placeholderTextColor={SPIRITUAL_COLORS.textMuted}
                    value={city}
                    onChangeText={setCity}
                  />
                  <TextInput
                    style={[styles.input, styles.inputCountry]}
                    placeholder="Country"
                    placeholderTextColor={SPIRITUAL_COLORS.textMuted}
                    value={country}
                    onChangeText={setCountry}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Photo of person (optional)</Text>
                {photoUri ? (
                  <View style={styles.photoRow}>
                    <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                    <TouchableOpacity style={styles.removePhotoBtn} onPress={removePhoto}>
                      <Ionicons name="close-circle" size={28} color={SPIRITUAL_COLORS.spiritualRed} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.addPhotoBtn} onPress={pickImage} activeOpacity={0.8}>
                    <Ionicons name="image-outline" size={32} color={SPIRITUAL_COLORS.primary} />
                    <Text style={styles.addPhotoText}>Add photo</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Phone Number *</Text>
                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, styles.inputAreaCode]}
                    placeholder="+1"
                    placeholderTextColor={SPIRITUAL_COLORS.textMuted}
                    value={phoneAreaCode}
                    onChangeText={setPhoneAreaCode}
                    keyboardType="phone-pad"
                  />
                  <TextInput
                    style={[styles.input, styles.inputPhone]}
                    placeholder="234 567 8900"
                    placeholderTextColor={SPIRITUAL_COLORS.textMuted}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor={SPIRITUAL_COLORS.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Prayer * (max {PRAYER_MAX_LENGTH} characters, ~400–500 words)</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Write your prayer or wishes here..."
                  placeholderTextColor={SPIRITUAL_COLORS.textMuted}
                  value={prayer}
                  onChangeText={(t) => setPrayer(t.slice(0, PRAYER_MAX_LENGTH))}
                  multiline
                  numberOfLines={8}
                  textAlignVertical="top"
                  maxLength={PRAYER_MAX_LENGTH}
                />
                <Text style={styles.charCount}>
                  {prayer.length} / {PRAYER_MAX_LENGTH}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  mandatoryFilled ? styles.submitButtonEnabled : styles.submitButtonDisabled,
                  isSubmitting && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!mandatoryFilled || isSubmitting}
                activeOpacity={mandatoryFilled ? 0.8 : 1}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={SPIRITUAL_COLORS.primaryForeground} />
                ) : (
                  <>
                    <Ionicons
                      name="send"
                      size={20}
                      color={mandatoryFilled ? SPIRITUAL_COLORS.primaryForeground : SPIRITUAL_COLORS.textMuted}
                    />
                    <Text
                      style={[
                        styles.submitButtonText,
                        !mandatoryFilled && styles.submitButtonTextDisabled,
                      ]}
                    >
                      Submit prayer
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SPIRITUAL_COLORS.background,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  heroContainer: {
    height: screenHeight * 0.42,
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    tintColor: SPIRITUAL_COLORS.omGold,
    opacity: 0.35,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroContent: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
    ...SPIRITUAL_SHADOWS.divine,
  },
  heroSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  formCard: {
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: SPIRITUAL_COLORS.border,
  },
  inputContainer: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.foreground,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    backgroundColor: SPIRITUAL_COLORS.input,
    borderWidth: 1,
    borderColor: SPIRITUAL_COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: SPIRITUAL_COLORS.foreground,
  },
  inputDD: {
    width: 56,
    textAlign: 'center',
  },
  inputMM: {
    width: 56,
    textAlign: 'center',
  },
  inputYYYY: {
    flex: 1,
    minWidth: 72,
    textAlign: 'center',
  },
  inputCity: {
    flex: 1,
    minWidth: 0,
  },
  inputCountry: {
    flex: 1,
    minWidth: 0,
  },
  inputAreaCode: {
    width: 80,
  },
  inputPhone: {
    flex: 1,
    minWidth: 0,
  },
  textArea: {
    backgroundColor: SPIRITUAL_COLORS.input,
    borderWidth: 1,
    borderColor: SPIRITUAL_COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: SPIRITUAL_COLORS.foreground,
    minHeight: 140,
  },
  charCount: {
    fontSize: 12,
    color: SPIRITUAL_COLORS.textMuted,
    marginTop: 4,
    textAlign: 'right',
  },
  addPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: SPIRITUAL_COLORS.input,
    borderWidth: 1,
    borderColor: SPIRITUAL_COLORS.border,
    borderRadius: 10,
    borderStyle: 'dashed',
    paddingVertical: 20,
  },
  addPhotoText: {
    fontSize: 15,
    color: SPIRITUAL_COLORS.primary,
    fontWeight: '500',
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  photoPreview: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: SPIRITUAL_COLORS.border,
  },
  removePhotoBtn: {
    padding: 4,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  submitButtonEnabled: {
    backgroundColor: SPIRITUAL_COLORS.primary,
  },
  submitButtonDisabled: {
    backgroundColor: SPIRITUAL_COLORS.accent,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.primaryForeground,
  },
  submitButtonTextDisabled: {
    color: SPIRITUAL_COLORS.textMuted,
  },
});
